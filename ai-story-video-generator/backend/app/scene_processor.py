import os
import json
import shutil
import tempfile
import subprocess
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np

class SceneProcessor:
    def __init__(self, output_dir: str = "processed_scenes"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
    
    def validate_images(self, image_paths: List[str]) -> List[str]:
        """Validate and fix image issues"""
        valid_images = []
        
        for img_path in image_paths:
            try:
                # Check if file exists
                if not Path(img_path).exists():
                    print(f"Warning: Image not found: {img_path}")
                    continue
                
                # Try to open with PIL
                with Image.open(img_path) as img:
                    img.verify()  # Verify it's a valid image
                    
                    # Check image mode and convert if necessary
                    if img.mode not in ['RGB', 'RGBA']:
                        print(f"Converting image mode from {img.mode} to RGB: {img_path}")
                        img = img.convert('RGB')
                        img.save(img_path)
                    
                    valid_images.append(img_path)
                    
            except Exception as e:
                print(f"Error processing image {img_path}: {e}")
                # Try to fix corrupted image
                try:
                    self._fix_image(img_path)
                    valid_images.append(img_path)
                except:
                    print(f"Failed to fix image: {img_path}")
        
        return valid_images
    
    def _fix_image(self, image_path: str) -> bool:
        """Try to fix corrupted image"""
        try:
            # Read with OpenCV
            img = cv2.imread(image_path)
            if img is not None:
                # Save with OpenCV (lossless)
                cv2.imwrite(image_path, img)
                return True
            
            # Try to read as bytes and save
            with open(image_path, 'rb') as f:
                data = f.read()
            
            # Check if it's a valid image by trying different methods
            for ext in ['.jpg', '.png', '.jpeg']:
                try:
                    temp_path = image_path + ext
                    with open(temp_path, 'wb') as f:
                        f.write(data)
                    
                    with Image.open(temp_path) as img:
                        img.verify()
                        # Convert to RGB and save
                        img = img.convert('RGB')
                        img.save(image_path)
                        os.remove(temp_path)
                        return True
                except:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
            
            return False
        except Exception as e:
            print(f"Failed to fix image {image_path}: {e}")
            return False
    
    def resize_images(self, image_paths: List[str], target_size: Tuple[int, int] = (1280, 720)) -> List[str]:
        """Resize images to target dimensions"""
        resized_images = []
        
        for img_path in image_paths:
            try:
                output_path = self.output_dir / f"resized_{Path(img_path).name}"
                
                with Image.open(img_path) as img:
                    # Calculate aspect ratio preserving resize
                    img_ratio = img.width / img.height
                    target_ratio = target_size[0] / target_size[1]
                    
                    if img_ratio > target_ratio:
                        # Image is wider than target
                        new_height = target_size[1]
                        new_width = int(new_height * img_ratio)
                    else:
                        # Image is taller than target
                        new_width = target_size[0]
                        new_height = int(new_width / img_ratio)
                    
                    # Resize with high-quality downsampling
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    
                    # Create canvas with target size
                    canvas = Image.new('RGB', target_size, (0, 0, 0))
                    
                    # Paste resized image centered
                    paste_x = (target_size[0] - new_width) // 2
                    paste_y = (target_size[1] - new_height) // 2
                    canvas.paste(img, (paste_x, paste_y))
                    
                    # Save resized image
                    canvas.save(output_path, quality=95, optimize=True)
                    resized_images.append(str(output_path))
                    
            except Exception as e:
                print(f"Error resizing image {img_path}: {e}")
                # Use original if resize fails
                resized_images.append(img_path)
        
        return resized_images
    
    def create_scene_video(self, image_path: str, output_path: str, duration: float, 
                          zoom_factor: float = 1.1, pan_speed: float = 0.5) -> bool:
        """Create video scene with Ken Burns effect"""
        try:
            # Validate image
            if not Path(image_path).exists():
                print(f"Image not found: {image_path}")
                return False
            
            # Convert duration to frames (25fps)
            fps = 25
            total_frames = int(duration * fps)
            
            # Read image
            img = cv2.imread(image_path)
            if img is None:
                print(f"Failed to read image: {image_path}")
                return False
            
            # Ensure image is in RGB
            if len(img.shape) == 2:  # Grayscale
                img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
            elif img.shape[2] == 4:  # RGBA
                img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)
            elif img.shape[2] == 3:  # RGB
                pass  # Already RGB
            else:
                print(f"Unexpected image shape: {img.shape}")
                return False
            
            # Calculate zoom parameters
            start_scale = 1.0
            end_scale = zoom_factor
            
            # Calculate pan parameters (subtle movement)
            height, width = img.shape[:2]
            pan_x_range = int(width * 0.05)  # 5% pan
            pan_y_range = int(height * 0.05)  # 5% pan
            
            # Create temporary directory for frames
            with tempfile.TemporaryDirectory() as temp_dir:
                frame_paths = []
                
                for frame_idx in range(total_frames):
                    # Calculate current progress (0 to 1)
                    progress = frame_idx / max(1, total_frames - 1)
                    
                    # Calculate current scale
                    current_scale = start_scale + (end_scale - start_scale) * progress
                    
                    # Calculate current pan position (smooth sine wave)
                    pan_x = int(pan_x_range * np.sin(progress * np.pi * pan_speed))
                    pan_y = int(pan_y_range * np.cos(progress * np.pi * pan_speed))
                    
                    # Calculate crop size
                    crop_width = int(width / current_scale)
                    crop_height = int(height / current_scale)
                    
                    # Calculate crop coordinates (centered with pan)
                    crop_x = (width - crop_width) // 2 + pan_x
                    crop_y = (height - crop_height) // 2 + pan_y
                    
                    # Ensure crop coordinates are within bounds
                    crop_x = max(0, min(crop_x, width - crop_width))
                    crop_y = max(0, min(crop_y, height - crop_height))
                    
                    # Crop and resize
                    cropped = img[crop_y:crop_y + crop_height, crop_x:crop_x + crop_width]
                    resized = cv2.resize(cropped, (width, height), interpolation=cv2.INTER_LANCZOS4)
                    
                    # Save frame
                    frame_path = Path(temp_dir) / f"frame_{frame_idx:04d}.png"
                    cv2.imwrite(str(frame_path), resized)
                    frame_paths.append(str(frame_path))
                
                # Create video from frames using FFmpeg
                ffmpeg_cmd = [
                    'ffmpeg', '-y',
                    '-framerate', str(fps),
                    '-i', str(Path(temp_dir) / 'frame_%04d.png'),
                    '-c:v', 'libx264',
                    '-preset', 'medium',
                    '-crf', '23',
                    '-pix_fmt', 'yuv420p',
                    '-r', str(fps),
                    output_path
                ]
                
                result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
                if result.returncode != 0:
                    print(f"FFmpeg error: {result.stderr}")
                    return False
                
                return True
                
        except Exception as e:
            print(f"Error creating scene video: {e}")
            return False
    
    def add_text_to_scene(self, video_path: str, text: str, output_path: str, 
                         duration: float, font_size: int = 48) -> bool:
        """Add text overlay to video scene"""
        try:
            # Create temporary subtitle file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.ass', delete=False) as f:
                subtitle_file = f.name
                
                # ASS subtitle format with styling
                ass_content = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,{font_size},&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,3,2,10,10,50,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:{duration:05.2f},Default,,0,0,0,,{text.replace(',', '\\,')}
"""
                f.write(ass_content)
            
            # Use FFmpeg to add subtitles
            ffmpeg_cmd = [
                'ffmpeg', '-y',
                '-i', video_path,
                '-vf', f"ass='{subtitle_file}'",
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-crf', '23',
                '-c:a', 'copy',
                output_path
            ]
            
            result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
            
            # Clean up subtitle file
            os.unlink(subtitle_file)
            
            if result.returncode != 0:
                print(f"FFmpeg error adding text: {result.stderr}")
                return False
            
            return True
            
        except Exception as e:
            print(f"Error adding text to scene: {e}")
            return False
    
    def create_transition(self, video1: str, video2: str, output_path: str, 
                         transition_type: str = "fade", duration: float = 0.5) -> bool:
        """Create transition between two videos"""
        try:
            # Create temporary files list
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
                list_file = f.name
                f.write(f"file '{video1}'\n")
                f.write(f"file '{video2}'\n")
            
            # Simple concatenation (can be enhanced with transitions)
            ffmpeg_cmd = [
                'ffmpeg', '-y',
                '-f', 'concat',
                '-safe', '0',
                '-i', list_file,
                '-c', 'copy',
                output_path
            ]
            
            result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
            
            # Clean up list file
            os.unlink(list_file)
            
            if result.returncode != 0:
                print(f"FFmpeg error creating transition: {result.stderr}")
                return False
            
            return True
            
        except Exception as e:
            print(f"Error creating transition: {e}")
            return False
    
    def extract_thumbnail(self, video_path: str, output_path: str, time_sec: float = 1.0) -> bool:
        """Extract thumbnail from video"""
        try:
            ffmpeg_cmd = [
                'ffmpeg', '-y',
                '-ss', str(time_sec),
                '-i', video_path,
                '-vframes', '1',
                '-q:v', '2',
                output_path
            ]
            
            result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"FFmpeg error extracting thumbnail: {result.stderr}")
                return False
            
            return True
            
        except Exception as e:
            print(f"Error extracting thumbnail: {e}")
            return False
    
    def get_video_info(self, video_path: str) -> Dict:
        """Get video information"""
        try:
            ffprobe_cmd = [
                'ffprobe',
                '-v', 'error',
                '-select_streams', 'v:0',
                '-show_entries', 'stream=width,height,duration,bit_rate,codec_name',
                '-of', 'json',
                video_path
            ]
            
            result = subprocess.run(ffprobe_cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                return {
                    'width': 1280,
                    'height': 720,
                    'duration': 0,
                    'bit_rate': 0,
                    'codec': 'h264'
                }
            
            info = json.loads(result.stdout)
            if 'streams' in info and len(info['streams']) > 0:
                stream = info['streams'][0]
                return {
                    'width': int(stream.get('width', 1280)),
                    'height': int(stream.get('height', 720)),
                    'duration': float(stream.get('duration', 0)),
                    'bit_rate': int(stream.get('bit_rate', 0)),
                    'codec': stream.get('codec_name', 'h264')
                }
            
            return {
                'width': 1280,
                'height': 720,
                'duration': 0,
                'bit_rate': 0,
                'codec': 'h264'
            }
            
        except Exception as e:
            print(f"Error getting video info: {e}")
            return {
                'width': 1280,
                'height': 720,
                'duration': 0,
                'bit_rate': 0,
                'codec': 'h264'
            }
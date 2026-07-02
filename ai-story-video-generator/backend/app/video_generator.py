import os
import subprocess
import tempfile
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import sys
import shutil
import logging
import json
from datetime import datetime

# Try to import AI libraries
try:
    import whisper
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False
    print("⚠️ Whisper not installed. AI features disabled.")

try:
    from scenedetect import VideoManager, SceneManager
    from scenedetect.detectors import ContentDetector
    SCENE_DETECT_AVAILABLE = True
except ImportError:
    SCENE_DETECT_AVAILABLE = False
    print("⚠️ SceneDetect not installed. Scene detection disabled.")

# Configure logging
logger = logging.getLogger(__name__)

class AIFeatures:
    """AI features for video processing"""
    
    def __init__(self):
        self.whisper_model = None
        self.sentiment_cache = {}
        
    def load_whisper_model(self, model_size="base"):
        """Load Whisper model for speech recognition"""
        if not AI_AVAILABLE:
            return False
            
        try:
            logger.info(f"Loading Whisper model ({model_size})...")
            self.whisper_model = whisper.load_model(model_size)
            logger.info("✓ Whisper model loaded")
            return True
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            return False
    
    def transcribe_audio(self, audio_path: str, language: str = "en") -> Dict:
        """Transcribe audio to text using Whisper"""
        if not self.whisper_model:
            if not self.load_whisper_model():
                return {"text": "", "segments": [], "error": "Whisper not available"}
        
        try:
            logger.info(f"Transcribing audio: {audio_path}")
            result = self.whisper_model.transcribe(
                audio_path, 
                language=language,
                task="transcribe",
                fp16=False  # Disable FP16 for CPU compatibility
            )
            
            # Format segments for captions
            segments = []
            for segment in result.get("segments", []):
                segments.append({
                    "id": segment.get("id", 0),
                    "text": segment.get("text", "").strip(),
                    "start": segment.get("start", 0),
                    "end": segment.get("end", 0),
                    "confidence": segment.get("confidence", 0)
                })
            
            return {
                "text": result.get("text", ""),
                "language": result.get("language", language),
                "segments": segments,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            return {"text": "", "segments": [], "error": str(e), "success": False}
    
    def detect_scenes(self, video_path: str, threshold: float = 27.0) -> List[Dict]:
        """Detect scene changes in video"""
        if not SCENE_DETECT_AVAILABLE:
            return []
            
        try:
            logger.info(f"Detecting scenes in: {video_path}")
            
            # Create video manager
            video_manager = VideoManager([video_path])
            
            # Create scene manager and add detector
            scene_manager = SceneManager()
            scene_manager.add_detector(
                ContentDetector(
                    threshold=threshold,
                    min_scene_len=15  # Minimum scene length in frames
                )
            )
            
            # Start video manager and detect scenes
            video_manager.set_downscale_factor()
            video_manager.start()
            scene_manager.detect_scenes(frame_source=video_manager)
            
            # Get scene list
            scene_list = scene_manager.get_scene_list()
            
            # Format results
            scenes = []
            for i, (start_time, end_time) in enumerate(scene_list):
                scenes.append({
                    "scene_id": i + 1,
                    "start_seconds": start_time.get_seconds(),
                    "end_seconds": end_time.get_seconds(),
                    "duration_seconds": end_time.get_seconds() - start_time.get_seconds(),
                    "start_frame": start_time.get_frames(),
                    "end_frame": end_time.get_frames(),
                    "start_timecode": str(start_time),
                    "end_timecode": str(end_time)
                })
            
            video_manager.release()
            logger.info(f"Detected {len(scenes)} scenes")
            return scenes
            
        except Exception as e:
            logger.error(f"Scene detection error: {e}")
            return []
    
    def analyze_sentiment(self, text: str) -> Dict:
        """Analyze sentiment of text (simple implementation)"""
        try:
            # Simple keyword-based sentiment analysis
            # In production, use a proper NLP library
            
            positive_keywords = [
                "good", "great", "excellent", "amazing", "wonderful",
                "happy", "joy", "love", "perfect", "best", "beautiful"
            ]
            
            negative_keywords = [
                "bad", "terrible", "awful", "horrible", "sad",
                "angry", "hate", "worst", "ugly", "pain", "death"
            ]
            
            text_lower = text.lower()
            words = text_lower.split()
            
            positive_count = sum(1 for word in words if any(kw in word for kw in positive_keywords))
            negative_count = sum(1 for word in words if any(kw in word for kw in negative_keywords))
            
            total_words = len(words)
            if total_words == 0:
                return {"sentiment": "neutral", "score": 0.5, "mood": "neutral"}
            
            sentiment_score = (positive_count - negative_count) / max(total_words, 1)
            
            if sentiment_score > 0.1:
                sentiment = "positive"
                mood = "happy"
            elif sentiment_score < -0.1:
                sentiment = "negative"
                mood = "sad"
            else:
                sentiment = "neutral"
                mood = "inspirational"
            
            return {
                "sentiment": sentiment,
                "score": abs(sentiment_score),
                "mood": mood,
                "positive_words": positive_count,
                "negative_words": negative_count,
                "total_words": total_words
            }
            
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return {"sentiment": "neutral", "score": 0.5, "mood": "neutral", "error": str(e)}
    
    def generate_captions_from_text(self, text: str, total_duration: float) -> List[Dict]:
        """Generate timed captions from text"""
        try:
            # Split text into sentences
            sentences = []
            current_sentence = ""
            
            for char in text:
                current_sentence += char
                if char in '.!?।' and len(current_sentence.strip()) > 10:
                    sentences.append(current_sentence.strip())
                    current_sentence = ""
            
            if current_sentence.strip():
                sentences.append(current_sentence.strip())
            
            if not sentences:
                sentences = [text]
            
            # Calculate timing
            time_per_sentence = total_duration / len(sentences)
            min_duration = 2.0  # Minimum caption duration
            max_duration = 5.0  # Maximum caption duration
            
            captions = []
            current_time = 0.0
            
            for i, sentence in enumerate(sentences):
                # Calculate duration based on sentence length
                word_count = len(sentence.split())
                duration = min(max(word_count * 0.4, min_duration), max_duration)
                
                # Ensure we don't exceed total duration
                if current_time + duration > total_duration:
                    duration = total_duration - current_time
                
                if duration < 0.5:  # Too short, skip
                    continue
                
                captions.append({
                    "id": i + 1,
                    "text": sentence,
                    "start": current_time,
                    "end": current_time + duration,
                    "duration": duration,
                    "word_count": word_count
                })
                
                current_time += duration
                
                if current_time >= total_duration:
                    break
            
            return captions
            
        except Exception as e:
            logger.error(f"Caption generation error: {e}")
            return []
    
    def suggest_highlights(self, video_duration: float, scene_count: int) -> List[float]:
        """Suggest highlight timestamps"""
        try:
            # Simple algorithm: suggest points at 25%, 50%, 75% of duration
            if scene_count > 0:
                # If we have scenes, suggest first and last scenes
                highlights = [0, video_duration * 0.25, video_duration * 0.75]
            else:
                # Evenly spaced highlights
                highlight_count = min(5, int(video_duration / 10))
                highlights = [i * (video_duration / highlight_count) for i in range(highlight_count)]
            
            return [round(t, 2) for t in highlights if t < video_duration]
            
        except Exception as e:
            logger.error(f"Highlight suggestion error: {e}")
            return []
    
    def recommend_music_mood(self, sentiment_result: Dict) -> str:
        """Recommend music mood based on sentiment"""
        mood_map = {
            "positive": ["happy", "inspirational", "epic"],
            "negative": ["sad", "emotional", "melancholic"],
            "neutral": ["calm", "ambient", "neutral"]
        }
        
        sentiment = sentiment_result.get("sentiment", "neutral")
        moods = mood_map.get(sentiment, ["neutral"])
        
        # Return the first mood
        return moods[0]
    
    def analyze_story_for_scenes(self, story: str, image_count: int) -> List[Dict]:
        """Analyze story and break into scenes"""
        try:
            # Simple sentence-based scene breakdown
            sentences = []
            current = ""
            
            for char in story:
                current += char
                if char in '.!?।' and len(current.strip()) > 3:
                    sentences.append(current.strip())
                    current = ""
            
            if current.strip():
                sentences.append(current.strip())
            
            # If not enough sentences, split by commas or create synthetic scenes
            if len(sentences) < image_count:
                # Split longer sentences
                all_sentences = []
                for sentence in sentences:
                    if len(sentence) > 100:
                        # Split by commas
                        parts = sentence.split(',')
                        all_sentences.extend([p.strip() + (',' if i < len(parts)-1 else '.') 
                                           for i, p in enumerate(parts) if p.strip()])
                    else:
                        all_sentences.append(sentence)
                sentences = all_sentences
            
            # Still not enough? Repeat last sentence
            while len(sentences) < image_count:
                sentences.append(sentences[-1] if sentences else story[:50])
            
            # Limit to image count
            sentences = sentences[:image_count]
            
            scenes = []
            for i, sentence in enumerate(sentences):
                # Calculate duration based on text length
                word_count = len(sentence.split())
                duration = max(3.0, min(word_count * 0.5, 10.0))
                
                # Analyze scene type based on keywords
                sentence_lower = sentence.lower()
                if any(word in sentence_lower for word in ["once", "begin", "start"]):
                    scene_type = "introduction"
                elif any(word in sentence_lower for word in ["then", "next", "after"]):
                    scene_type = "development"
                elif any(word in sentence_lower for word in ["finally", "end", "conclusion"]):
                    scene_type = "conclusion"
                elif any(word in sentence_lower for word in ["!", "excited", "amazing"]):
                    scene_type = "climax"
                else:
                    scene_type = "dialogue"
                
                scenes.append({
                    "scene_number": i + 1,
                    "text": sentence,
                    "duration": round(duration, 1),
                    "image_index": i % image_count,
                    "scene_type": scene_type,
                    "word_count": word_count,
                    "recommended_transition": "fade" if i > 0 else "cut"
                })
            
            return scenes
            
        except Exception as e:
            logger.error(f"Story analysis error: {e}")
            # Fallback to simple scenes
            return self._create_fallback_scenes(story, image_count)
    
    def _create_fallback_scenes(self, story: str, image_count: int) -> List[Dict]:
        """Create fallback scenes if analysis fails"""
        scenes = []
        for i in range(image_count):
            scenes.append({
                "scene_number": i + 1,
                "text": story[:100] + ("..." if len(story) > 100 else ""),
                "duration": 5.0,
                "image_index": i,
                "scene_type": "dialogue",
                "word_count": len(story.split()),
                "recommended_transition": "fade"
            })
        return scenes


class VideoGenerator:
    def __init__(self, output_dir: str = "outputs"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # AI features
        self.ai = AIFeatures()
        
        # Find FFmpeg path - Windows specific
        self.ffmpeg_path = self._find_ffmpeg_windows()
        if self.ffmpeg_path:
            logger.info(f"✓ Found FFmpeg at: {self.ffmpeg_path}")
            print(f"✓ Found FFmpeg at: {self.ffmpeg_path}")
        else:
            logger.error("✗ FFmpeg not found")
            print("✗ FFmpeg not found. Please install FFmpeg and add to PATH.")
            print("Download from: https://ffmpeg.org/download.html")
    
    def _find_ffmpeg_windows(self):
        """Find FFmpeg on Windows"""
        # Method 1: Check common installation paths
        common_paths = [
            r"D:\ffepge\ffmpeg-master-latest-win64-gpl-shared\bin\ffmpeg.exe",
            r"C:\ffmpeg\bin\ffmpeg.exe",
            r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
            r"C:\Program Files (x86)\ffmpeg\bin\ffmpeg.exe",
            r"D:\ffmpeg\bin\ffmpeg.exe",
            r"E:\ffmpeg\bin\ffmpeg.exe",
            os.path.join(os.environ.get('PROGRAMFILES', ''), "ffmpeg", "bin", "ffmpeg.exe"),
            os.path.join(os.environ.get('PROGRAMFILES(X86)', ''), "ffmpeg", "bin", "ffmpeg.exe"),
            os.path.join(os.environ.get('USERPROFILE', ''), "ffmpeg", "bin", "ffmpeg.exe"),
        ]
        
        for path in common_paths:
            if os.path.exists(path):
                logger.info(f"Found FFmpeg at common path: {path}")
                return path
        
        # Method 2: Use where command
        try:
            result = subprocess.run(['where', 'ffmpeg'], 
                                  capture_output=True, text=True, shell=True)
            if result.returncode == 0:
                lines = result.stdout.strip().split('\n')
                for line in lines:
                    line = line.strip()
                    if line.endswith('ffmpeg.exe') and os.path.exists(line):
                        logger.info(f"Found FFmpeg via where command: {line}")
                        return line
        except Exception as e:
            logger.warning(f"Error using where command: {e}")
            pass
        
        # Method 3: Check PATH environment variable
        path_dirs = os.environ.get('PATH', '').split(os.pathsep)
        for dir_path in path_dirs:
            if os.path.exists(dir_path):
                ffmpeg_exe = os.path.join(dir_path, 'ffmpeg.exe')
                if os.path.exists(ffmpeg_exe):
                    logger.info(f"Found FFmpeg in PATH: {ffmpeg_exe}")
                    return ffmpeg_exe
        
        return None
    
    def run_ffmpeg_command(self, cmd_args):
        """Run FFmpeg command with proper Windows handling"""
        try:
            # Replace 'ffmpeg' with full path if needed
            if self.ffmpeg_path and cmd_args[0] == 'ffmpeg':
                cmd_args[0] = self.ffmpeg_path
            elif cmd_args[0] == 'ffmpeg' and not self.ffmpeg_path:
                # Fallback to absolute path
                cmd_args[0] = r"D:\ffepge\ffmpeg-master-latest-win64-gpl-shared\bin\ffmpeg.exe"
            
            # Build command string
            cmd_str = ' '.join([f'"{arg}"' if ' ' in str(arg) else str(arg) for arg in cmd_args])
            
            logger.info(f"Running FFmpeg command: {cmd_str}")
            print(f"Running FFmpeg command: {cmd_str}")
            
            # Run with shell=True for Windows
            result = subprocess.run(
                cmd_str,
                shell=True,
                capture_output=True,
                text=True,
                encoding='utf-8',
                errors='ignore'
            )
            
            if result.returncode != 0:
                logger.error(f"FFmpeg error (code {result.returncode}):")
                print(f"FFmpeg error (code {result.returncode}):")
                if result.stderr:
                    error_msg = result.stderr[:500]
                    logger.error(f"STDERR: {error_msg}")
                    print(f"STDERR: {error_msg}")
                return False
            
            logger.info("✓ FFmpeg command executed successfully")
            print("✓ FFmpeg command executed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Exception running FFmpeg: {str(e)}")
            print(f"Exception running FFmpeg: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    # ==============================
    # CORE VIDEO GENERATION METHODS
    # ==============================
    
    def create_ken_burns_effect(self, image_path: str, output_path: str, 
                               duration: float, zoom: float = 1.1) -> bool:
        """Create video with Ken Burns effect from image"""
        try:
            # Convert paths to string and normalize
            image_path = str(Path(image_path).absolute())
            output_path = str(Path(output_path).absolute())
            
            # Create Ken Burns effect with zoom
            cmd = [
                'ffmpeg',
                '-y',
                '-loop', '1',
                '-i', f'"{image_path}"',
                '-vf', f'scale=1280:720,zoompan=z=\'zoom+0.001\':d={int(duration*25)}:x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':s=1280x720',
                '-t', str(duration),
                '-c:v', 'libx264',
                '-pix_fmt', 'yuv420p',
                f'"{output_path}"'
            ]
            
            logger.info(f"Creating Ken Burns from: {image_path}")
            logger.info(f"Output to: {output_path}")
            print(f"Creating Ken Burns from: {image_path}")
            print(f"Output to: {output_path}")
            
            success = self.run_ffmpeg_command(cmd)
            
            if success and Path(output_path).exists() and Path(output_path).stat().st_size > 0:
                logger.info(f"✓ Successfully created video: {output_path}")
                print(f"✓ Successfully created video: {output_path}")
                return True
            else:
                logger.error(f"✗ Failed to create video or file is empty")
                print(f"✗ Failed to create video or file is empty")
                # Try simpler method as fallback
                return self._create_simple_video(image_path, output_path, duration)
                
        except Exception as e:
            logger.error(f"Error in create_ken_burns_effect: {e}")
            print(f"Error in create_ken_burns_effect: {e}")
            return self._create_simple_video(image_path, output_path, duration)
    
    def _create_simple_video(self, image_path: str, output_path: str, duration: float) -> bool:
        """Create simple static video as fallback"""
        try:
            cmd = [
                'ffmpeg',
                '-y',
                '-loop', '1',
                '-i', f'"{image_path}"',
                '-vf', 'scale=1280:720',
                '-t', str(duration),
                '-c:v', 'libx264',
                '-pix_fmt', 'yuv420p',
                f'"{output_path}"'
            ]
            
            logger.info(f"Creating simple video as fallback: {image_path}")
            print(f"Creating simple video as fallback: {image_path}")
            
            return self.run_ffmpeg_command(cmd)
            
        except Exception as e:
            logger.error(f"Error in simple video creation: {e}")
            print(f"Error in simple video creation: {e}")
            return False
    
    def add_text_overlay(self, video_path: str, text: str, duration: float, 
                        output_path: str, font_size: int = 48) -> bool:
        """Add text overlay to video - MULTIPLE METHODS"""
        try:
            video_path = str(Path(video_path).absolute())
            output_path = str(Path(output_path).absolute())
            
            logger.info(f"Adding text overlay to: {video_path}")
            logger.info(f"Text: '{text}'")
            print(f"Adding text overlay to: {video_path}")
            print(f"Text: '{text}'")
            
            # Try multiple methods in sequence
            methods = [
                self._add_text_method1,
                self._add_text_method2,
                self._add_text_method3
            ]
            
            for i, method in enumerate(methods):
                logger.info(f"Trying text overlay method {i+1}")
                print(f"Trying text overlay method {i+1}")
                
                success = method(video_path, text, duration, output_path, font_size)
                if success:
                    logger.info(f"✓ Text overlay successful with method {i+1}")
                    print(f"✓ Text overlay successful with method {i+1}")
                    return True
            
            # All methods failed, use fallback
            logger.warning("All text overlay methods failed, using fallback")
            print("All text overlay methods failed, using fallback")
            return self._add_text_fallback(video_path, output_path)
            
        except Exception as e:
            logger.error(f"Error in text overlay: {e}")
            print(f"Error in text overlay: {e}")
            return self._add_text_fallback(video_path, output_path)
    
    def _add_text_method1(self, video_path: str, text: str, duration: float, 
                         output_path: str, font_size: int) -> bool:
        """Method 1: Simple drawtext with box"""
        text_clean = self._escape_text(text)
        drawtext_filter = f"drawtext=text='{text_clean}':fontcolor=white:fontsize={font_size}:box=1:boxcolor=black@0.5:x=(w-text_w)/2:y=h-text_h-50"
        
        cmd = [
            'ffmpeg',
            '-y',
            '-i', f'"{video_path}"',
            '-vf', drawtext_filter,
            '-c:a', 'copy',
            f'"{output_path}"'
        ]
        
        return self.run_ffmpeg_command(cmd)
    
    def _add_text_method2(self, video_path: str, text: str, duration: float,
                         output_path: str, font_size: int) -> bool:
        """Method 2: Two-line text with proper formatting"""
        # Split text into two lines if too long
        if len(text) > 40:
            words = text.split()
            mid = len(words) // 2
            line1 = ' '.join(words[:mid])
            line2 = ' '.join(words[mid:])
            text_clean = f"{line1}\\n{line2}"
        else:
            text_clean = self._escape_text(text)
        
        drawtext_filter = f"drawtext=text='{text_clean}':fontcolor=white:fontsize={font_size}:x=(w-text_w)/2:y=h-text_h-100"
        
        cmd = [
            'ffmpeg',
            '-y',
            '-i', f'"{video_path}"',
            '-vf', drawtext_filter,
            '-c:a', 'copy',
            f'"{output_path}"'
        ]
        
        return self.run_ffmpeg_command(cmd)
    
    def _add_text_method3(self, video_path: str, text: str, duration: float,
                         output_path: str, font_size: int) -> bool:
        """Method 3: Using ASS subtitles (more reliable)"""
        # Create ASS subtitle file
        temp_dir = Path(video_path).parent
        ass_file = temp_dir / "temp_subtitle.ass"
        
        ass_content = """[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,{fontsize},&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:{duration:.2f},Default,,0,0,0,,{text}
""".format(fontsize=font_size, duration=duration, text=text)
        
        with open(ass_file, 'w', encoding='utf-8-sig') as f:
            f.write(ass_content)
        
        ass_file_path = str(ass_file.absolute())
        
        cmd = [
            'ffmpeg',
            '-y',
            '-i', f'"{video_path}"',
            '-vf', f"ass='{ass_file_path}'",
            '-c:a', 'copy',
            f'"{output_path}"'
        ]
        
        success = self.run_ffmpeg_command(cmd)
        
        # Cleanup
        try:
            ass_file.unlink()
        except:
            pass
        
        return success
    
    def _add_text_fallback(self, video_path: str, output_path: str) -> bool:
        """Fallback: just copy the video without text"""
        try:
            shutil.copy(video_path, output_path)
            return True
        except Exception as e:
            logger.error(f"Failed to copy video: {e}")
            return False
    
    def _escape_text(self, text: str) -> str:
        """Escape text for FFmpeg drawtext filter"""
        # Replace problematic characters
        text = text.replace('\\', '\\\\')
        text = text.replace("'", "'\\\\''")
        text = text.replace('%', '%%')
        text = text.replace(':', '\\:')
        
        # Limit length for display
        if len(text) > 100:
            text = text[:97] + "..."
        
        return text
    
    def concatenate_videos(self, video_files: List[str], output_path: str) -> bool:
        """Concatenate multiple videos"""
        try:
            output_path = str(Path(output_path).absolute())
            concat_dir = Path(output_path).parent
            
            # Create concat file with absolute paths
            concat_content = ""
            for video in video_files:
                video_abs = str(Path(video).absolute())
                # Ensure the file exists
                if not Path(video_abs).exists():
                    logger.warning(f"Video file not found: {video_abs}")
                    continue
                concat_content += f"file '{video_abs}'\n"
            
            if not concat_content.strip():
                logger.error("No valid video files to concatenate")
                return False
            
            concat_file = concat_dir / "concat_list.txt"
            with open(concat_file, 'w', encoding='utf-8') as f:
                f.write(concat_content)
            
            concat_file_str = str(concat_file.absolute())
            
            cmd = [
                'ffmpeg',
                '-y',
                '-f', 'concat',
                '-safe', '0',
                '-i', f'"{concat_file_str}"',
                '-c', 'copy',
                f'"{output_path}"'
            ]
            
            success = self.run_ffmpeg_command(cmd)
            
            # Cleanup
            try:
                concat_file.unlink()
            except:
                pass
            
            if success and Path(output_path).exists() and Path(output_path).stat().st_size > 0:
                logger.info(f"✓ Successfully concatenated videos to: {output_path}")
                print(f"✓ Successfully concatenated videos to: {output_path}")
                return True
            else:
                logger.error("✗ Failed to concatenate videos")
                print("✗ Failed to concatenate videos")
                return False
            
        except Exception as e:
            logger.error(f"Error concatenating videos: {e}")
            print(f"Error concatenating videos: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def add_audio_to_video(self, video_path: str, audio_path: str, 
                          output_path: str) -> bool:
        """Add audio to video"""
        try:
            video_path = str(Path(video_path).absolute())
            output_path = str(Path(output_path).absolute())
            
            # If audio doesn't exist, just copy video
            if not Path(audio_path).exists():
                logger.info("Audio file not found, copying video only")
                print("Audio file not found, copying video only")
                shutil.copy(video_path, output_path)
                return True
            
            audio_path = str(Path(audio_path).absolute())
            
            cmd = [
                'ffmpeg',
                '-y',
                '-i', f'"{video_path}"',
                '-i', f'"{audio_path}"',
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-map', '0:v:0',
                '-map', '1:a:0',
                '-shortest',
                f'"{output_path}"'
            ]
            
            success = self.run_ffmpeg_command(cmd)
            
            if success and Path(output_path).exists():
                logger.info(f"✓ Successfully added audio to video: {output_path}")
                print(f"✓ Successfully added audio to video: {output_path}")
                return True
            else:
                logger.warning("Audio addition failed, copying video without audio")
                print("Audio addition failed, copying video without audio")
                shutil.copy(video_path, output_path)
                return True
            
        except Exception as e:
            logger.error(f"Error adding audio: {e}")
            print(f"Error adding audio: {e}")
            # Fallback - copy video without audio
            try:
                shutil.copy(video_path, output_path)
                return True
            except:
                return False
    
    # ==============================
    # AI-ENHANCED METHODS
    # ==============================
    
    def add_ai_captions(self, video_path: str, captions: List[Dict], 
                       output_path: str, style: str = "modern") -> bool:
        """Add AI-generated captions with timing"""
        try:
            video_path = str(Path(video_path).absolute())
            output_path = str(Path(output_path).absolute())
            
            logger.info(f"Adding AI captions to: {video_path}")
            print(f"Adding AI captions to: {video_path}")
            
            # Create SRT file from captions
            srt_content = ""
            for i, caption in enumerate(captions):
                start = self._format_srt_time(caption.get("start", 0))
                end = self._format_srt_time(caption.get("end", caption.get("start", 0) + 3))
                text = caption.get("text", "")
                srt_content += f"{i+1}\n{start} --> {end}\n{text}\n\n"
            
            srt_file = Path(video_path).parent / "ai_captions.srt"
            with open(srt_file, 'w', encoding='utf-8') as f:
                f.write(srt_content)
            
            # Apply style
            style_params = {
                "modern": "FontName=Arial,FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=1,Shadow=1,Alignment=2",
                "minimal": "FontName=Helvetica,FontSize=20,PrimaryColour=&H00CCCCCC,Alignment=2",
                "bold": "FontName=Impact,FontSize=28,PrimaryColour=&H00FFFFFF,Bold=1,Alignment=2"
            }
            style_str = style_params.get(style, style_params["modern"])
            
            cmd = [
                'ffmpeg',
                '-y',
                '-i', f'"{video_path}"',
                '-vf', f"subtitles='{srt_file}':force_style='{style_str}'",
                '-c:a', 'copy',
                f'"{output_path}"'
            ]
            
            success = self.run_ffmpeg_command(cmd)
            
            # Cleanup
            try:
                srt_file.unlink()
            except:
                pass
            
            if success:
                logger.info(f"✓ AI captions added successfully: {output_path}")
                print(f"✓ AI captions added successfully: {output_path}")
            
            return success
            
        except Exception as e:
            logger.error(f"AI caption error: {e}")
            print(f"AI caption error: {e}")
            return False
    
    def apply_transition(self, video1_path: str, video2_path: str,
                        output_path: str, transition_type: str = "fade",
                        duration: float = 1.0) -> bool:
        """Apply transition between two videos"""
        try:
            video1_path = str(Path(video1_path).absolute())
            video2_path = str(Path(video2_path).absolute())
            output_path = str(Path(output_path).absolute())
            
            logger.info(f"Applying {transition_type} transition")
            print(f"Applying {transition_type} transition")
            
            transition_map = {
                "fade": "fade",
                "dissolve": "fade",
                "slide": "slideleft",
                "zoom": "zoomout",
                "wipe": "wipeleft"
            }
            
            ffmpeg_transition = transition_map.get(transition_type, "fade")
            
            cmd = [
                'ffmpeg',
                '-y',
                '-i', f'"{video1_path}"',
                '-i', f'"{video2_path}"',
                '-filter_complex', f'[0:v][1:v]xfade=transition={ffmpeg_transition}:duration={duration}[v];[0:a][1:a]acrossfade=d={duration}[a]',
                '-map', '[v]',
                '-map', '[a]',
                f'"{output_path}"'
            ]
            
            success = self.run_ffmpeg_command(cmd)
            
            if success:
                logger.info(f"✓ Transition applied: {transition_type}")
                print(f"✓ Transition applied: {transition_type}")
            
            return success
            
        except Exception as e:
            logger.error(f"Transition error: {e}")
            print(f"Transition error: {e}")
            # Fallback: simple concatenation
            return self.concatenate_videos([video1_path, video2_path], output_path)
    
    def create_highlight_reel(self, video_path: str, highlight_times: List[float],
                             output_path: str, highlight_duration: float = 3.0) -> bool:
        """Create highlight reel from video"""
        try:
            video_path = str(Path(video_path).absolute())
            output_path = str(Path(output_path).absolute())
            
            logger.info(f"Creating highlight reel with {len(highlight_times)} highlights")
            print(f"Creating highlight reel with {len(highlight_times)} highlights")
            
            if not highlight_times:
                logger.warning("No highlight times provided")
                return False
            
            # Create temporary files for each highlight
            temp_files = []
            concat_content = ""
            
            for i, time in enumerate(highlight_times):
                temp_file = Path(output_path).parent / f"highlight_{i}.mp4"
                temp_files.append(temp_file)
                
                cmd = [
                    'ffmpeg',
                    '-y',
                    '-ss', str(time),
                    '-i', f'"{video_path}"',
                    '-t', str(highlight_duration),
                    '-c', 'copy',
                    f'"{temp_file}"'
                ]
                
                if self.run_ffmpeg_command(cmd):
                    concat_content += f"file '{temp_file}'\n"
                else:
                    logger.warning(f"Failed to extract highlight at {time}s")
            
            if not concat_content:
                return False
            
            # Concatenate highlights
            concat_file = Path(output_path).parent / "highlights_list.txt"
            with open(concat_file, 'w') as f:
                f.write(concat_content)
            
            cmd = [
                'ffmpeg',
                '-y',
                '-f', 'concat',
                '-safe', '0',
                '-i', f'"{concat_file}"',
                '-c', 'copy',
                f'"{output_path}"'
            ]
            
            success = self.run_ffmpeg_command(cmd)
            
            # Cleanup temp files
            for temp_file in temp_files:
                try:
                    temp_file.unlink()
                except:
                    pass
            
            try:
                concat_file.unlink()
            except:
                pass
            
            if success:
                logger.info(f"✓ Highlight reel created: {output_path}")
                print(f"✓ Highlight reel created: {output_path}")
            
            return success
            
        except Exception as e:
            logger.error(f"Highlight reel error: {e}")
            print(f"Highlight reel error: {e}")
            return False
    
    def detect_scenes_ai(self, video_path: str) -> List[Dict]:
        """Detect scenes using AI"""
        return self.ai.detect_scenes(video_path)
    
    def transcribe_audio_ai(self, audio_path: str, language: str = "en") -> Dict:
        """Transcribe audio using Whisper AI"""
        return self.ai.transcribe_audio(audio_path, language)
    
    def analyze_story_ai(self, story: str, image_count: int) -> List[Dict]:
        """Analyze story and create scenes using AI"""
        return self.ai.analyze_story_for_scenes(story, image_count)
    
    def generate_captions_ai(self, text: str, total_duration: float) -> List[Dict]:
        """Generate timed captions using AI"""
        return self.ai.generate_captions_from_text(text, total_duration)
    
    def suggest_highlights_ai(self, video_path: str) -> List[float]:
        """Suggest highlights using AI"""
        try:
            # Get video duration
            duration = self._get_video_duration(video_path)
            
            # Detect scenes
            scenes = self.ai.detect_scenes(video_path)
            
            if scenes:
                # Use scene starts as highlights
                return [scene["start_seconds"] for scene in scenes[:5]]
            else:
                # Fallback to time-based highlights
                return self.ai.suggest_highlights(duration, 3)
                
        except Exception as e:
            logger.error(f"Highlight suggestion error: {e}")
            return []
    
    # ==============================
    # HELPER METHODS
    # ==============================
    
    def _format_srt_time(self, seconds: float) -> str:
        """Format seconds to SRT time format"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds - int(seconds)) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"
    
    def _get_video_duration(self, video_path: str) -> float:
        """Get video duration using ffprobe"""
        try:
            ffprobe_path = self.ffmpeg_path.replace('ffmpeg.exe', 'ffprobe.exe') if self.ffmpeg_path else 'ffprobe'
            
            cmd = [
                ffprobe_path,
                '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1',
                f'"{video_path}"'
            ]
            
            cmd_str = ' '.join(cmd)
            result = subprocess.run(cmd_str, shell=True, 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                return float(result.stdout.strip())
        except Exception as e:
            logger.error(f"Duration detection error: {e}")
        
        return 0.0
    
    def get_video_info(self, video_path: str) -> Dict:
        """Get video information"""
        try:
            duration = self._get_video_duration(video_path)
            file_size = Path(video_path).stat().st_size if Path(video_path).exists() else 0
            
            return {
                "path": video_path,
                "duration": duration,
                "file_size_mb": round(file_size / (1024 * 1024), 2),
                "exists": Path(video_path).exists()
            }
        except Exception as e:
            logger.error(f"Video info error: {e}")
            return {"path": video_path, "error": str(e)}
    
    def cleanup_temp_files(self, directory: str):
        """Cleanup temporary files in directory"""
        try:
            dir_path = Path(directory)
            if dir_path.exists() and dir_path.is_dir():
                for item in dir_path.iterdir():
                    if item.is_file():
                        item.unlink()
                    elif item.is_dir():
                        shutil.rmtree(item)
                logger.info(f"Cleaned up: {directory}")
        except Exception as e:
            logger.warning(f"Cleanup error: {e}")
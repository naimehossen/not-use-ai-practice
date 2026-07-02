import os
import sys
import json
import shutil
import tempfile
import subprocess
import hashlib
import uuid
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import logging
from logging.handlers import RotatingFileHandler

# Configure logging
def setup_logging(log_dir: str = "logs", log_level: str = "INFO"):
    """Setup logging configuration"""
    log_dir_path = Path(log_dir)
    log_dir_path.mkdir(exist_ok=True)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # File handler (rotating, max 10MB per file, keep 5 backups)
    log_file = log_dir_path / "video_generator.log"
    file_handler = RotatingFileHandler(
        log_file, 
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    
    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper()))
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)
    
    return root_logger

# Initialize logger
logger = setup_logging()

class JobManager:
    """Manage processing jobs"""
    
    def __init__(self, jobs_dir: str = "jobs"):
        self.jobs_dir = Path(jobs_dir)
        self.jobs_dir.mkdir(exist_ok=True)
    
    def create_job(self, job_id: Optional[str] = None) -> str:
        """Create a new job directory"""
        if job_id is None:
            job_id = str(uuid.uuid4())
        
        job_dir = self.jobs_dir / job_id
        job_dir.mkdir(exist_ok=True)
        
        # Create subdirectories
        (job_dir / "input").mkdir(exist_ok=True)
        (job_dir / "processing").mkdir(exist_ok=True)
        (job_dir / "output").mkdir(exist_ok=True)
        (job_dir / "temp").mkdir(exist_ok=True)
        
        # Create job info file
        job_info = {
            "job_id": job_id,
            "created_at": datetime.now().isoformat(),
            "status": "created",
            "progress": 0,
            "steps": []
        }
        
        self.save_job_info(job_id, job_info)
        
        logger.info(f"Created job: {job_id}")
        return job_id
    
    def save_job_info(self, job_id: str, info: Dict):
        """Save job information"""
        job_dir = self.jobs_dir / job_id
        info_file = job_dir / "job_info.json"
        
        with open(info_file, 'w') as f:
            json.dump(info, f, indent=2, default=str)
    
    def get_job_info(self, job_id: str) -> Dict:
        """Get job information"""
        job_dir = self.jobs_dir / job_id
        info_file = job_dir / "job_info.json"
        
        if info_file.exists():
            with open(info_file, 'r') as f:
                return json.load(f)
        return {}
    
    def update_job_status(self, job_id: str, status: str, progress: int = 0, 
                         step: Optional[str] = None, message: Optional[str] = None):
        """Update job status"""
        info = self.get_job_info(job_id)
        info["status"] = status
        info["progress"] = progress
        info["updated_at"] = datetime.now().isoformat()
        
        if step:
            if "steps" not in info:
                info["steps"] = []
            info["steps"].append({
                "step": step,
                "timestamp": datetime.now().isoformat(),
                "message": message or ""
            })
        
        self.save_job_info(job_id, info)
        logger.info(f"Job {job_id}: {status} - {progress}% - {message or ''}")
    
    def cleanup_job(self, job_id: str, keep_output: bool = True):
        """Clean up job temporary files"""
        job_dir = self.jobs_dir / job_id
        
        if not job_dir.exists():
            return
        
        # Clean temp directory
        temp_dir = job_dir / "temp"
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
        
        # Clean processing directory
        processing_dir = job_dir / "processing"
        if processing_dir.exists():
            shutil.rmtree(processing_dir)
        
        # Clean input directory if output is kept
        if keep_output:
            input_dir = job_dir / "input"
            if input_dir.exists():
                shutil.rmtree(input_dir)
        
        logger.info(f"Cleaned up job: {job_id}")

class FileUtils:
    """File utility functions"""
    
    @staticmethod
    def get_file_hash(file_path: Union[str, Path], algorithm: str = "md5") -> str:
        """Calculate file hash"""
        hash_func = getattr(hashlib, algorithm)()
        
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                hash_func.update(chunk)
        
        return hash_func.hexdigest()
    
    @staticmethod
    def get_file_size(file_path: Union[str, Path]) -> int:
        """Get file size in bytes"""
        return Path(file_path).stat().st_size
    
    @staticmethod
    def format_file_size(size_bytes: int) -> str:
        """Format file size to human readable string"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.2f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.2f} PB"
    
    @staticmethod
    def get_media_duration(file_path: Union[str, Path]) -> float:
        """Get media file duration using ffprobe"""
        try:
            cmd = [
                'ffprobe',
                '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1',
                str(file_path)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                return float(result.stdout.strip())
        except Exception as e:
            logger.warning(f"Failed to get media duration: {e}")
        
        return 0.0
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize filename for safe filesystem usage"""
        # Remove invalid characters
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            filename = filename.replace(char, '_')
        
        # Limit length
        if len(filename) > 255:
            name, ext = os.path.splitext(filename)
            filename = name[:250 - len(ext)] + ext
        
        return filename
    
    @staticmethod
    def ensure_directory(directory: Union[str, Path]):
        """Ensure directory exists"""
        Path(directory).mkdir(parents=True, exist_ok=True)
    
    @staticmethod
    def copy_with_progress(src: Union[str, Path], dst: Union[str, Path], 
                          chunk_size: int = 1024*1024) -> bool:
        """Copy file with progress logging"""
        try:
            src_path = Path(src)
            dst_path = Path(dst)
            
            total_size = src_path.stat().st_size
            copied = 0
            
            with open(src_path, 'rb') as f_src, open(dst_path, 'wb') as f_dst:
                while True:
                    chunk = f_src.read(chunk_size)
                    if not chunk:
                        break
                    
                    f_dst.write(chunk)
                    copied += len(chunk)
                    
                    # Log progress every 10%
                    progress = (copied / total_size) * 100
                    if progress % 10 < 1:
                        logger.debug(f"Copy progress: {progress:.1f}%")
            
            return True
        except Exception as e:
            logger.error(f"Failed to copy file: {e}")
            return False

class FFmpegUtils:
    """FFmpeg utility functions"""
    
    @staticmethod
    def check_ffmpeg() -> bool:
        """Check if FFmpeg is available"""
        try:
            result = subprocess.run(['ffmpeg', '-version'], 
                                  capture_output=True, text=True)
            return result.returncode == 0
        except FileNotFoundError:
            return False
    
    @staticmethod
    def get_ffmpeg_version() -> str:
        """Get FFmpeg version"""
        try:
            result = subprocess.run(['ffmpeg', '-version'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                lines = result.stdout.split('\n')
                if lines:
                    return lines[0].strip()
        except Exception as e:
            logger.warning(f"Failed to get FFmpeg version: {e}")
        
        return "Unknown"
    
    @staticmethod
    def convert_video(input_path: str, output_path: str, 
                     codec: str = "libx264", preset: str = "medium",
                     crf: int = 23, fps: int = 25) -> bool:
        """Convert video format"""
        try:
            cmd = [
                'ffmpeg', '-y',
                '-i', input_path,
                '-c:v', codec,
                '-preset', preset,
                '-crf', str(crf),
                '-r', str(fps),
                '-pix_fmt', 'yuv420p',
                '-c:a', 'aac',
                '-b:a', '128k',
                output_path
            ]
            
            logger.info(f"Converting video: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                logger.error(f"FFmpeg conversion failed: {result.stderr}")
                return False
            
            return True
        except Exception as e:
            logger.error(f"Video conversion error: {e}")
            return False
    
    @staticmethod
    def extract_audio(input_path: str, output_path: str) -> bool:
        """Extract audio from video"""
        try:
            cmd = [
                'ffmpeg', '-y',
                '-i', input_path,
                '-vn',  # No video
                '-acodec', 'pcm_s16le',  # WAV format
                '-ar', '44100',  # Sample rate
                '-ac', '2',  # Stereo
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            return result.returncode == 0
        except Exception as e:
            logger.error(f"Audio extraction error: {e}")
            return False
    
    @staticmethod
    def merge_audio_video(video_path: str, audio_path: str, output_path: str) -> bool:
        """Merge audio with video"""
        try:
            cmd = [
                'ffmpeg', '-y',
                '-i', video_path,
                '-i', audio_path,
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-map', '0:v:0',
                '-map', '1:a:0',
                '-shortest',
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            return result.returncode == 0
        except Exception as e:
            logger.error(f"Audio-video merge error: {e}")
            return False

class TimeUtils:
    """Time utility functions"""
    
    @staticmethod
    def format_duration(seconds: float) -> str:
        """Format duration to HH:MM:SS.mmm"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = seconds % 60
        
        if hours > 0:
            return f"{hours:02d}:{minutes:02d}:{secs:06.3f}"
        else:
            return f"{minutes:02d}:{secs:06.3f}"
    
    @staticmethod
    def parse_duration(duration_str: str) -> float:
        """Parse duration string to seconds"""
        try:
            parts = duration_str.split(':')
            if len(parts) == 3:  # HH:MM:SS
                hours, minutes, seconds = parts
                return int(hours) * 3600 + int(minutes) * 60 + float(seconds)
            elif len(parts) == 2:  # MM:SS
                minutes, seconds = parts
                return int(minutes) * 60 + float(seconds)
            else:
                return float(duration_str)
        except:
            return 0.0
    
    @staticmethod
    def get_timestamp() -> str:
        """Get current timestamp string"""
        return datetime.now().strftime("%Y%m%d_%H%M%S")
    
    @staticmethod
    def measure_time(func):
        """Decorator to measure function execution time"""
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = func(*args, **kwargs)
            end_time = time.time()
            logger.info(f"{func.__name__} took {end_time - start_time:.2f} seconds")
            return result
        return wrapper

class ValidationUtils:
    """Validation utility functions"""
    
    @staticmethod
    def validate_image_file(file_path: Union[str, Path]) -> bool:
        """Validate image file"""
        try:
            from PIL import Image
            with Image.open(file_path) as img:
                img.verify()
            return True
        except:
            return False
    
    @staticmethod
    def validate_video_file(file_path: Union[str, Path]) -> bool:
        """Validate video file"""
        try:
            duration = FileUtils.get_media_duration(file_path)
            return duration > 0
        except:
            return False
    
    @staticmethod
    def validate_audio_file(file_path: Union[str, Path]) -> bool:
        """Validate audio file"""
        try:
            duration = FileUtils.get_media_duration(file_path)
            return duration > 0
        except:
            return False
    
    @staticmethod
    def validate_file_extension(filename: str, allowed_extensions: List[str]) -> bool:
        """Validate file extension"""
        ext = Path(filename).suffix.lower()
        return ext in allowed_extensions
    
    @staticmethod
    def get_supported_formats() -> Dict[str, List[str]]:
        """Get supported file formats"""
        return {
            "image": [".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp"],
            "video": [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv"],
            "audio": [".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac"]
        }

# Initialize utility classes
job_manager = JobManager()
file_utils = FileUtils()
ffmpeg_utils = FFmpegUtils()
time_utils = TimeUtils()
validation_utils = ValidationUtils()
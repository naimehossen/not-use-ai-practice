from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
import shutil
import uuid
from pathlib import Path
from typing import List, Optional, Dict, Any, Union
import json
import asyncio
from datetime import datetime
import logging
import traceback
import os
import sys
from enum import Enum
import zipfile
import io

# ===========================================
# FFMPEG PATH SETUP - MUST BE AT THE VERY TOP
# ===========================================
import subprocess

# Add FFmpeg to PATH
ffmpeg_bin_paths = [
    r"D:\ffepge\ffmpeg-master-latest-win64-gpl-shared\bin",
    r"C:\ffmpeg\bin",
    r"C:\Program Files\ffmpeg\bin"
]

for ffmpeg_bin_path in ffmpeg_bin_paths:
    if os.path.exists(ffmpeg_bin_path):
        if ffmpeg_bin_path not in os.environ['PATH']:
            os.environ['PATH'] = ffmpeg_bin_path + ';' + os.environ['PATH']
            print(f"✓ Added FFmpeg to PATH: {ffmpeg_bin_path}")
        break

# Check FFmpeg availability
def check_ffmpeg_availability():
    """Check if FFmpeg is available"""
    try:
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print("✅ FFmpeg is available")
            return True
        else:
            print("⚠️ FFmpeg command failed")
            return False
    except Exception as e:
        print(f"❌ FFmpeg check failed: {e}")
        return False

# ===========================================
# Configure logging
# ===========================================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# ===========================================
# Create FastAPI app
# ===========================================
app = FastAPI(
    title="AI Story Video Generator",
    version="2.0.0",
    description="AI-powered video generator with speech recognition, scene detection, and smart editing",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ===========================================
# CORS configuration
# ===========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===========================================
# Enums for AI features
# ===========================================
class Language(str, Enum):
    ENGLISH = "en"
    BENGALI = "bn"
    HINDI = "hi"
    ARABIC = "ar"
    URDU = "ur"
    SPANISH = "es"
    FRENCH = "fr"

class MusicMood(str, Enum):
    HAPPY = "happy"
    SAD = "sad"
    EPIC = "epic"
    ROMANTIC = "romantic"
    SUSPENSE = "suspense"
    INSPIRATIONAL = "inspirational"
    CALM = "calm"
    NEUTRAL = "neutral"

class TransitionType(str, Enum):
    CUT = "cut"
    FADE = "fade"
    DISSOLVE = "dissolve"
    SLIDE = "slide"
    ZOOM = "zoom"
    WIPE = "wipe"

class CaptionStyle(str, Enum):
    MODERN = "modern"
    MINIMAL = "minimal"
    BOLD = "bold"
    CLASSIC = "classic"
    SUBTLE = "subtle"

# ===========================================
# Import models
# ===========================================
try:
    from .models import Scene, VideoRequest
    logger.info("✓ Models imported successfully")
except ImportError as e:
    logger.warning(f"⚠️ Models import failed: {e}. Using fallback.")
    class Scene:
        def __init__(self, **kwargs):
            self.__dict__.update(kwargs)
    
    class VideoRequest:
        def __init__(self, **kwargs):
            self.__dict__.update(kwargs)

# ===========================================
# Import processors with better error handling
# ===========================================
processors_loaded = {}

# Text Processor
try:
    from .text_processor import TextProcessor
    text_processor = TextProcessor()
    processors_loaded['text'] = True
    logger.info("✓ Successfully imported TextProcessor")
except ImportError as e:
    logger.warning(f"⚠️ TextProcessor import failed: {e}. Using fallback.")
    processors_loaded['text'] = False
    
    class TextProcessor:
        def __init__(self):
            self.ai_enabled = False
        
        def break_story_into_scenes(self, story, num_images):
            sentences = [s.strip() for s in story.replace('।', '.').split('.') if s.strip()]
            if len(sentences) > num_images:
                sentences = sentences[:num_images]
            elif len(sentences) < num_images:
                sentences = sentences + [sentences[-1]] * (num_images - len(sentences))
            
            scenes = []
            for i, text in enumerate(sentences[:num_images]):
                duration = max(3.0, min(len(text.split()) * 0.5, 10.0))
                scenes.append({
                    "scene": i + 1,
                    "text": text,
                    "duration": round(duration, 1),
                    "image_index": i,
                    "scene_type": "dialogue",
                    "transition": "fade"
                })
            return scenes
        
        def analyze_story_sentiment(self, story):
            return {"sentiment": "neutral", "score": 0.5, "mood": "neutral"}
    
    text_processor = TextProcessor()

# Video Generator
try:
    from .video_generator import VideoGenerator
    video_gen = VideoGenerator()
    processors_loaded['video'] = True
    logger.info("✓ Successfully imported VideoGenerator")
except ImportError as e:
    logger.warning(f"⚠️ VideoGenerator import failed: {e}. Using fallback.")
    processors_loaded['video'] = False
    
    class VideoGenerator:
        def __init__(self):
            self.output_dir = Path("outputs")
            self.output_dir.mkdir(exist_ok=True)
            self.ai_enabled = False
        
        def create_ken_burns_effect(self, image_path, output_path, duration, zoom=1.1):
            logger.info(f"Creating Ken Burns effect: {image_path} -> {output_path}")
            return False
        
        def add_text_overlay(self, video_path, text, duration, output_path, font_size=48):
            logger.info(f"Adding text overlay: {text[:50]}...")
            return False
        
        def concatenate_videos(self, video_files, output_path):
            logger.info(f"Concatenating {len(video_files)} videos")
            return False
        
        def add_audio_to_video(self, video_path, audio_path, output_path):
            logger.info(f"Adding audio to video")
            return False
        
        def add_ai_captions(self, video_path, captions, output_path, style="modern"):
            logger.info(f"Adding AI captions")
            return False
        
        def apply_transition(self, video1_path, video2_path, output_path, transition_type="fade", duration=1.0):
            logger.info(f"Applying {transition_type} transition")
            return False
        
        def create_highlight_reel(self, video_path, highlight_times, output_path, highlight_duration=3.0):
            logger.info(f"Creating highlight reel")
            return False
        
        def detect_scenes_ai(self, video_path):
            return []
        
        def transcribe_audio_ai(self, audio_path, language="en"):
            return {"text": "", "segments": [], "success": False}
        
        def analyze_story_ai(self, story, image_count):
            return []
        
        def generate_captions_ai(self, text, total_duration):
            return []
        
        def suggest_highlights_ai(self, video_path):
            return []
    
    video_gen = VideoGenerator()

# Audio Processor
try:
    from .audio_processor import AudioProcessor
    audio_proc = AudioProcessor()
    processors_loaded['audio'] = True
    logger.info("✓ Successfully imported AudioProcessor")
except ImportError as e:
    logger.warning(f"⚠️ AudioProcessor import failed: {e}. Using fallback.")
    processors_loaded['audio'] = False
    
    class AudioProcessor:
        def __init__(self, output_dir="audio_outputs"):
            self.output_dir = Path(output_dir)
            self.output_dir.mkdir(exist_ok=True)
        
        def text_to_speech(self, text, language='en', output_path=None):
            logger.info(f"TTS: {text[:50]}...")
            return None
        
        def concatenate_audio_files(self, audio_files, output_path):
            logger.info(f"Concatenating {len(audio_files)} audio files")
            return False
        
        def mix_audio_with_music(self, voice_path, music_path, output_path, music_volume=-20):
            logger.info("Mixing audio with music")
            return False
        
        def extract_audio_from_video(self, video_path, output_path):
            logger.info(f"Extracting audio from video")
            return False
    
    audio_proc = AudioProcessor()

# ===========================================
# Create necessary directories
# ===========================================
required_dirs = ["uploads", "temp", "outputs", "audio_outputs", "music_library", "exports"]
for dir_name in required_dirs:
    dir_path = Path(dir_name)
    dir_path.mkdir(parents=True, exist_ok=True)
    logger.info(f"✓ Created directory: {dir_path.absolute()}")

# Create default music files
music_library_dir = Path("music_library")
music_moods = {
    "happy": ["upbeat_track1.mp3", "joyful_melody.mp3"],
    "sad": ["emotional_piano.mp3", "melancholy_strings.mp3"],
    "epic": ["cinematic_orchestral.mp3", "heroic_theme.mp3"],
    "inspirational": ["uplifting_inspiration.mp3", "motivational_piano.mp3"],
    "calm": ["peaceful_ambient.mp3", "relaxing_guitar.mp3"]
}

for mood, files in music_moods.items():
    mood_dir = music_library_dir / mood
    mood_dir.mkdir(exist_ok=True)
    for file in files:
        file_path = mood_dir / file
        if not file_path.exists():
            # Create placeholder file
            file_path.touch()

# ===========================================
# Store job status in memory
# ===========================================
job_status = {}

# ===========================================
# Helper functions
# ===========================================
def check_ffmpeg():
    """Check if FFmpeg is available"""
    try:
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            logger.info("✓ FFmpeg is available")
            return True
        else:
            logger.warning("✗ FFmpeg command failed")
            return False
    except Exception as e:
        logger.error(f"✗ FFmpeg check failed: {e}")
        return False

def cleanup_temp_files(job_dir: Path):
    """Cleanup temporary files for a job"""
    try:
        if job_dir.exists() and job_dir.is_dir():
            logger.info(f"Cleaning up temp files in {job_dir}")
            # Remove all files in the directory
            for item in job_dir.iterdir():
                if item.is_file():
                    item.unlink()
                elif item.is_dir():
                    shutil.rmtree(item)
            # Remove the directory itself
            try:
                job_dir.rmdir()
            except:
                pass
    except Exception as e:
        logger.warning(f"Failed to cleanup {job_dir}: {e}")

def get_video_duration(video_path: str) -> float:
    """Get video duration using ffprobe"""
    try:
        cmd = [
            'ffprobe',
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            f'"{video_path}"'
        ]
        
        result = subprocess.run(' '.join(cmd), shell=True,
                              capture_output=True, text=True)
        if result.returncode == 0:
            return float(result.stdout.strip())
    except:
        pass
    return 0.0

def get_file_size_mb(file_path: str) -> float:
    """Get file size in MB"""
    try:
        return Path(file_path).stat().st_size / (1024 * 1024)
    except:
        return 0.0

def get_available_music_tracks(mood: str = None) -> List[Dict]:
    """Get available music tracks"""
    music_library_dir = Path("music_library")
    tracks = []
    
    if mood:
        mood_dir = music_library_dir / mood
        if mood_dir.exists():
            for file in mood_dir.iterdir():
                if file.is_file() and file.suffix.lower() in ['.mp3', '.wav', '.m4a']:
                    tracks.append({
                        "name": file.name,
                        "path": str(file),
                        "mood": mood,
                        "size_mb": get_file_size_mb(file)
                    })
    else:
        for mood_dir in music_library_dir.iterdir():
            if mood_dir.is_dir():
                for file in mood_dir.iterdir():
                    if file.is_file() and file.suffix.lower() in ['.mp3', '.wav', '.m4a']:
                        tracks.append({
                            "name": file.name,
                            "path": str(file),
                            "mood": mood_dir.name,
                            "size_mb": get_file_size_mb(file)
                        })
    
    return tracks

# ===========================================
# API Endpoints
# ===========================================
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "AI Story Video Generator API",
        "version": "2.0.0",
        "status": "running",
        "ffmpeg_available": check_ffmpeg(),
        "processors_loaded": processors_loaded,
        "ai_features": {
            "speech_to_text": hasattr(video_gen, 'transcribe_audio_ai'),
            "scene_detection": hasattr(video_gen, 'detect_scenes_ai'),
            "auto_captions": hasattr(video_gen, 'generate_captions_ai'),
            "highlight_detection": hasattr(video_gen, 'suggest_highlights_ai'),
            "story_analysis": hasattr(video_gen, 'analyze_story_ai')
        },
        "endpoints": {
            "generate_video": "POST /generate-video",
            "generate_ai_video": "POST /generate-ai-video",
            "transcribe_audio": "POST /transcribe-audio",
            "detect_scenes": "POST /detect-scenes",
            "analyze_story": "POST /analyze-story",
            "suggest_highlights": "POST /suggest-highlights",
            "download_video": "GET /download/{job_id}",
            "job_status": "GET /job/{job_id}/status",
            "health": "GET /health",
            "list_jobs": "GET /list-jobs",
            "music_library": "GET /music-library",
            "cleanup": "DELETE /cleanup"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check if directories exist
        dir_status = {}
        for dir_name in required_dirs:
            dir_path = Path(dir_name)
            dir_status[dir_name] = {
                "exists": dir_path.exists(),
                "writable": os.access(dir_path, os.W_OK) if dir_path.exists() else False
            }
        
        # Check processor status
        processor_status = {}
        for name, loaded in processors_loaded.items():
            processor_status[name] = {
                "loaded": loaded,
                "ai_enabled": getattr(globals().get(f"{name}_processor", None), 'ai_enabled', False) if loaded else False
            }
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "service": "AI Story Video Generator v2.0",
            "ffmpeg_available": check_ffmpeg(),
            "directories": dir_status,
            "processors": processor_status,
            "job_count": len(job_status),
            "system": {
                "python_version": sys.version,
                "platform": sys.platform
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.get("/job/{job_id}/status")
async def get_job_status(job_id: str):
    """Get job processing status"""
    if job_id in job_status:
        return job_status[job_id]
    
    # Check if video file exists
    video_path = Path("outputs") / f"{job_id}.mp4"
    if video_path.exists():
        return {
            "job_id": job_id,
            "status": "completed",
            "message": "Video exists but job record not found",
            "video_url": f"/download/{job_id}",
            "created_at": datetime.fromtimestamp(video_path.stat().st_ctime).isoformat()
        }
    
    return {
        "status": "not_found", 
        "job_id": job_id, 
        "message": "Job not found",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/list-jobs")
async def list_jobs(limit: int = 50, offset: int = 0):
    """List all jobs with their status"""
    jobs_list = []
    
    # Get jobs from memory
    for job_id, job in list(job_status.items())[offset:offset+limit]:
        video_path = Path("outputs") / f"{job_id}.mp4"
        job_info = {
            "job_id": job_id,
            "status": job.get("status", "unknown"),
            "progress": job.get("progress", 0),
            "created_at": job.get("created_at"),
            "completed_at": job.get("completed_at"),
            "has_video": video_path.exists(),
            "video_size_mb": round(video_path.stat().st_size / (1024 * 1024), 2) if video_path.exists() else 0,
            "message": job.get("message", ""),
            "scenes": len(job.get("scenes", [])),
            "ai_features": job.get("ai_features", {})
        }
        jobs_list.append(job_info)
    
    # Also check for video files without job records
    outputs_dir = Path("outputs")
    if outputs_dir.exists():
        video_files = list(outputs_dir.glob("*.mp4"))
        for video_file in video_files[offset:offset+limit]:
            job_id = video_file.stem
            if job_id not in job_status:
                jobs_list.append({
                    "job_id": job_id,
                    "status": "orphaned",
                    "has_video": True,
                    "video_size_mb": round(video_file.stat().st_size / (1024 * 1024), 2),
                    "created_at": datetime.fromtimestamp(video_file.stat().st_ctime).isoformat(),
                    "message": "Video file exists without job record"
                })
    
    return {
        "total_jobs": len(jobs_list),
        "jobs": sorted(jobs_list, key=lambda x: x.get("created_at", ""), reverse=True),
        "limit": limit,
        "offset": offset
    }

@app.get("/music-library")
async def get_music_library(mood: Optional[str] = None):
    """Get available music tracks"""
    tracks = get_available_music_tracks(mood)
    
    # Group by mood
    grouped = {}
    for track in tracks:
        mood = track["mood"]
        if mood not in grouped:
            grouped[mood] = []
        grouped[mood].append(track)
    
    return {
        "total_tracks": len(tracks),
        "tracks_by_mood": grouped,
        "available_moods": list(grouped.keys())
    }

# ===========================================
# AI FEATURE ENDPOINTS
# ===========================================

@app.post("/analyze-story")
async def analyze_story(
    story: str = Form(...),
    language: str = Form("en"),
    analyze_sentiment: bool = Form(True),
    suggest_scenes: bool = Form(True)
):
    """AI analysis of story"""
    job_id = str(uuid.uuid4())
    
    try:
        logger.info(f"Analyzing story: {story[:100]}...")
        
        analysis_result = {
            "job_id": job_id,
            "timestamp": datetime.now().isoformat(),
            "language": language,
            "story_length": len(story),
            "word_count": len(story.split()),
            "estimated_duration": len(story.split()) * 0.5  # Rough estimate
        }
        
        # Sentiment analysis
        if analyze_sentiment:
            try:
                sentiment = text_processor.analyze_story_sentiment(story)
                analysis_result["sentiment"] = sentiment
                analysis_result["recommended_mood"] = sentiment.get("mood", "neutral")
            except Exception as e:
                logger.error(f"Sentiment analysis error: {e}")
                analysis_result["sentiment_error"] = str(e)
        
        # Scene suggestion
        if suggest_scenes:
            try:
                # Estimate number of scenes based on story length
                estimated_scenes = min(max(len(story.split()) // 50, 1), 10)
                scenes = video_gen.analyze_story_ai(story, estimated_scenes)
                analysis_result["suggested_scenes"] = scenes
                analysis_result["scene_count"] = len(scenes)
            except Exception as e:
                logger.error(f"Scene analysis error: {e}")
                analysis_result["scene_error"] = str(e)
        
        # Caption generation
        try:
            captions = video_gen.generate_captions_ai(story, analysis_result["estimated_duration"])
            analysis_result["captions"] = captions
            analysis_result["caption_count"] = len(captions)
        except Exception as e:
            logger.error(f"Caption generation error: {e}")
            analysis_result["caption_error"] = str(e)
        
        # Music suggestions
        mood = analysis_result.get("recommended_mood", "neutral")
        music_tracks = get_available_music_tracks(mood)
        analysis_result["music_suggestions"] = music_tracks[:3]  # Top 3 tracks
        
        logger.info(f"✓ Story analysis completed: {job_id}")
        return analysis_result
        
    except Exception as e:
        logger.error(f"Story analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/transcribe-audio")
async def transcribe_audio(
    audio_file: UploadFile = File(...),
    language: str = Form("en"),
    generate_captions: bool = Form(True)
):
    """Transcribe audio to text using Whisper AI"""
    job_id = str(uuid.uuid4())
    job_dir = Path("temp") / "transcribe" / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        logger.info(f"Transcribing audio: {audio_file.filename}")
        
        # Save audio file
        audio_path = job_dir / audio_file.filename
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
        
        # Transcribe using AI
        result = video_gen.transcribe_audio_ai(str(audio_path), language)
        
        if not result.get("success", False):
            raise HTTPException(status_code=500, detail="Transcription failed")
        
        response_data = {
            "job_id": job_id,
            "filename": audio_file.filename,
            "language": result.get("language", language),
            "text": result.get("text", ""),
            "segment_count": len(result.get("segments", [])),
            "timestamp": datetime.now().isoformat()
        }
        
        # Generate captions if requested
        if generate_captions and result.get("segments"):
            captions = []
            for segment in result.get("segments", []):
                captions.append({
                    "text": segment.get("text", ""),
                    "start": segment.get("start", 0),
                    "end": segment.get("end", 0),
                    "duration": segment.get("end", 0) - segment.get("start", 0)
                })
            response_data["captions"] = captions
        
        # Cleanup
        try:
            audio_path.unlink()
            job_dir.rmdir()
        except:
            pass
        
        logger.info(f"✓ Transcription completed: {job_id}")
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        # Cleanup on error
        try:
            cleanup_temp_files(job_dir)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.post("/detect-scenes")
async def detect_scenes(
    video_file: UploadFile = File(...),
    threshold: float = Form(30.0),
    min_scene_length: float = Form(2.0)
):
    """Detect scene changes in video using AI"""
    job_id = str(uuid.uuid4())
    job_dir = Path("temp") / "scenes" / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        logger.info(f"Detecting scenes in: {video_file.filename}")
        
        # Save video file
        video_path = job_dir / video_file.filename
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(video_file.file, buffer)
        
        # Detect scenes using AI
        scenes = video_gen.detect_scenes_ai(str(video_path))
        
        # Filter by minimum length
        filtered_scenes = []
        for scene in scenes:
            if scene.get("duration_seconds", 0) >= min_scene_length:
                filtered_scenes.append(scene)
        
        # Calculate statistics
        total_duration = sum(s.get("duration_seconds", 0) for s in filtered_scenes)
        
        response_data = {
            "job_id": job_id,
            "filename": video_file.filename,
            "total_scenes": len(filtered_scenes),
            "filtered_scenes": len(filtered_scenes),
            "total_duration": total_duration,
            "scenes": filtered_scenes,
            "timestamp": datetime.now().isoformat(),
            "settings": {
                "threshold": threshold,
                "min_scene_length": min_scene_length
            }
        }
        
        # Cleanup
        try:
            video_path.unlink()
            job_dir.rmdir()
        except:
            pass
        
        logger.info(f"✓ Scene detection completed: {job_id} - Found {len(filtered_scenes)} scenes")
        return response_data
        
    except Exception as e:
        logger.error(f"Scene detection failed: {e}")
        # Cleanup on error
        try:
            cleanup_temp_files(job_dir)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Scene detection failed: {str(e)}")

@app.post("/suggest-highlights")
async def suggest_highlights(
    video_file: UploadFile = File(...),
    max_highlights: int = Form(5),
    min_highlight_duration: float = Form(3.0)
):
    """Suggest highlights from video using AI"""
    job_id = str(uuid.uuid4())
    job_dir = Path("temp") / "highlights" / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        logger.info(f"Suggesting highlights for: {video_file.filename}")
        
        # Save video file
        video_path = job_dir / video_file.filename
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(video_file.file, buffer)
        
        # Get video duration
        duration = get_video_duration(str(video_path))
        
        # Suggest highlights using AI
        highlight_times = video_gen.suggest_highlights_ai(str(video_path))
        
        # Limit number of highlights
        highlight_times = highlight_times[:max_highlights]
        
        # Format highlights
        highlights = []
        for i, time in enumerate(highlight_times):
            highlights.append({
                "id": i + 1,
                "time_seconds": time,
                "time_formatted": f"{int(time//60)}:{int(time%60):02d}",
                "description": f"Highlight {i+1}"
            })
        
        response_data = {
            "job_id": job_id,
            "filename": video_file.filename,
            "video_duration": duration,
            "highlight_count": len(highlights),
            "highlights": highlights,
            "settings": {
                "max_highlights": max_highlights,
                "min_highlight_duration": min_highlight_duration
            },
            "timestamp": datetime.now().isoformat()
        }
        
        # Cleanup
        try:
            video_path.unlink()
            job_dir.rmdir()
        except:
            pass
        
        logger.info(f"✓ Highlight suggestion completed: {job_id} - Found {len(highlights)} highlights")
        return response_data
        
    except Exception as e:
        logger.error(f"Highlight suggestion failed: {e}")
        # Cleanup on error
        try:
            cleanup_temp_files(job_dir)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Highlight suggestion failed: {str(e)}")

# ===========================================
# MAIN VIDEO GENERATION ENDPOINTS
# ===========================================

@app.post("/generate-video")
async def generate_video(
    images: List[UploadFile] = File(...),
    story: str = Form(...),
    language: str = Form("en"),
    add_voice: bool = Form(False),
    music_file: Optional[UploadFile] = File(None),
    music_volume: float = Form(0.3),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Main endpoint to generate video from story and images (Basic version)"""
    
    # Generate unique job ID
    job_id = str(uuid.uuid4())
    job_dir = Path("temp") / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    
    logger.info(f"🚀 Starting basic video generation job: {job_id}")
    logger.info(f"📊 Parameters: {len(images)} images, language: {language}, add_voice: {add_voice}")
    
    # Initialize job status
    job_status[job_id] = {
        "job_id": job_id,
        "status": "initializing",
        "progress": 0,
        "message": "Starting video generation...",
        "created_at": datetime.now().isoformat(),
        "scenes": [],
        "video_url": None,
        "video_path": None,
        "error": None,
        "warnings": [],
        "ai_features": {"enabled": False}
    }
    
    try:
        # 1. Save uploaded images
        job_status[job_id].update({
            "status": "uploading_images",
            "progress": 10,
            "message": "Uploading and processing images..."
        })
        
        image_paths = []
        for i, image in enumerate(images):
            if not image.filename:
                raise HTTPException(status_code=400, detail=f"Image {i+1} filename is empty")
            
            # Validate image format
            image_extension = Path(image.filename).suffix.lower()
            allowed_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp']
            if image_extension not in allowed_extensions:
                raise HTTPException(status_code=400, detail=f"Unsupported image format: {image_extension}")
            
            # Save image with proper extension
            image_path = job_dir / f"image_{i}{image_extension}"
            try:
                with open(image_path, "wb") as buffer:
                    shutil.copyfileobj(image.file, buffer)
                image_paths.append(str(image_path))
                logger.info(f"✓ Saved image {i+1}: {image_path}")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to save image {i+1}: {str(e)}")
        
        # 2. Process story and create scenes
        job_status[job_id].update({
            "status": "processing_story",
            "progress": 20,
            "message": "Processing story and creating scenes..."
        })
        
        try:
            scenes = text_processor.break_story_into_scenes(story, len(image_paths))
            logger.info(f"📝 Created {len(scenes)} scenes")
            
            # Validate scenes
            if not scenes or len(scenes) == 0:
                raise HTTPException(status_code=400, detail="Failed to create scenes from story")
            
            job_status[job_id]["scenes"] = scenes
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing story: {str(e)}")
        
        # 3. Create scene videos
        scene_videos = []
        total_scenes = len(scenes)
        
        for i, scene in enumerate(scenes):
            scene_progress = 20 + (i / total_scenes) * 40
            job_status[job_id].update({
                "status": "creating_scenes",
                "progress": int(scene_progress),
                "message": f"Creating scene {i+1}/{total_scenes}..."
            })
            
            try:
                # Create scene video
                scene_video_raw = job_dir / f"scene_{i}_raw.mp4"
                logger.info(f"🎬 Creating scene {i+1} video...")
                
                success = video_gen.create_ken_burns_effect(
                    image_paths[i], 
                    str(scene_video_raw),
                    scene["duration"]
                )
                
                if not success:
                    error_msg = f"Failed to create scene {i+1} video"
                    logger.error(error_msg)
                    raise HTTPException(status_code=500, detail=error_msg)
                
                # Add text overlay
                scene_video_final = job_dir / f"scene_{i}_final.mp4"
                logger.info(f"✏️ Adding text to scene {i+1}...")
                
                success = video_gen.add_text_overlay(
                    str(scene_video_raw),
                    scene["text"],
                    scene["duration"],
                    str(scene_video_final)
                )
                
                if not success:
                    warning_msg = f"Text overlay failed for scene {i+1}, using video without text"
                    logger.warning(warning_msg)
                    job_status[job_id]["warnings"].append(warning_msg)
                    # Use raw video as fallback
                    scene_video_final = scene_video_raw
                
                scene_videos.append(str(scene_video_final))
                logger.info(f"✓ Completed scene {i+1}/{total_scenes}")
                
            except HTTPException:
                raise
            except Exception as e:
                error_msg = f"Error processing scene {i+1}: {str(e)}"
                logger.error(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
        
        # 4. Concatenate all scenes
        job_status[job_id].update({
            "status": "concatenating",
            "progress": 60,
            "message": "Combining all scenes..."
        })
        
        combined_video = job_dir / "combined.mp4"
        logger.info(f"🔗 Concatenating {len(scene_videos)} scenes...")
        
        success = video_gen.concatenate_videos(scene_videos, str(combined_video))
        
        if not success:
            error_msg = "Failed to concatenate videos"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        
        # 5. Audio processing
        final_audio = None
        
        if add_voice or music_file:
            job_status[job_id].update({
                "status": "processing_audio",
                "progress": 70,
                "message": "Processing audio..."
            })
            
            if add_voice:
                try:
                    # Generate voice for each scene
                    voice_files = []
                    for j, scene in enumerate(scenes):
                        voice_file = job_dir / f"voice_{scene['scene']}.mp3"
                        logger.info(f"🗣️ Generating voice for scene {j+1}...")
                        
                        voice_path = audio_proc.text_to_speech(
                            scene["text"],
                            language,
                            str(voice_file)
                        )
                        
                        if voice_path and Path(voice_path).exists():
                            voice_files.append(voice_path)
                            logger.info(f"✓ Generated voice for scene {j+1}")
                        else:
                            warning_msg = f"Voice generation failed for scene {j+1}"
                            logger.warning(warning_msg)
                            job_status[job_id]["warnings"].append(warning_msg)
                    
                    if voice_files:
                        # Concatenate voice files
                        combined_voice = job_dir / "voice_combined.mp3"
                        logger.info(f"🔊 Concatenating {len(voice_files)} voice files...")
                        
                        success = audio_proc.concatenate_audio_files(voice_files, str(combined_voice))
                        
                        if success and music_file:
                            # Save music file
                            music_path = job_dir / "music.mp3"
                            with open(music_path, "wb") as buffer:
                                shutil.copyfileobj(music_file.file, buffer)
                            
                            # Mix voice with music
                            final_audio = job_dir / "final_audio.mp3"
                            logger.info("🎵 Mixing voice with background music...")
                            
                            success = audio_proc.mix_audio_with_music(
                                str(combined_voice),
                                str(music_path),
                                str(final_audio),
                                music_volume
                            )
                        elif success:
                            final_audio = combined_voice
                    else:
                        warning_msg = "No voice files were generated successfully"
                        logger.warning(warning_msg)
                        job_status[job_id]["warnings"].append(warning_msg)
                        
                except Exception as e:
                    warning_msg = f"Audio processing error: {str(e)}"
                    logger.warning(warning_msg)
                    job_status[job_id]["warnings"].append(warning_msg)
            
            elif music_file:
                # Only background music
                try:
                    final_audio = job_dir / "music.mp3"
                    with open(final_audio, "wb") as buffer:
                        shutil.copyfileobj(music_file.file, buffer)
                    logger.info("🎵 Saved background music file")
                except Exception as e:
                    warning_msg = f"Failed to save music file: {str(e)}"
                    logger.warning(warning_msg)
                    job_status[job_id]["warnings"].append(warning_msg)
        
        # 6. Final assembly
        job_status[job_id].update({
            "status": "final_assembly",
            "progress": 85,
            "message": "Final video assembly..."
        })
        
        final_output = Path("outputs") / f"{job_id}.mp4"
        logger.info(f"🎥 Creating final video: {final_output}")
        
        if final_audio and Path(final_audio).exists():
            success = video_gen.add_audio_to_video(
                str(combined_video),
                str(final_audio),
                str(final_output)
            )
        else:
            # No audio, just copy video
            logger.info("ℹ️ No audio to add, copying video only")
            shutil.copy(str(combined_video), str(final_output))
            success = True
        
        if not success or not final_output.exists():
            error_msg = "Failed to create final video"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        
        # 7. Update job status
        file_size_mb = final_output.stat().st_size / (1024 * 1024)
        total_duration = sum(scene["duration"] for scene in scenes)
        
        job_status[job_id].update({
            "status": "completed",
            "progress": 100,
            "message": "Video generation completed successfully!",
            "video_url": f"/download/{job_id}",
            "video_path": str(final_output),
            "file_size_mb": round(file_size_mb, 2),
            "total_duration": total_duration,
            "completed_at": datetime.now().isoformat()
        })
        
        # Schedule cleanup
        background_tasks.add_task(cleanup_temp_files, job_dir)
        logger.info(f"🧹 Scheduled cleanup for job {job_id}")
        
        logger.info(f"✅ Basic video generation completed for job {job_id}")
        logger.info(f"📁 Output: {final_output} ({file_size_mb:.2f} MB)")
        
        # Return response
        return {
            "status": "success",
            "job_id": job_id,
            "message": "Video generated successfully",
            "video_url": f"/download/{job_id}",
            "download_url": f"http://localhost:8000/download/{job_id}",
            "scenes": scenes,
            "video_info": {
                "duration": total_duration,
                "scenes": len(scenes),
                "resolution": "1280x720",
                "format": "mp4",
                "has_audio": final_audio is not None and Path(final_audio).exists(),
                "file_size_mb": round(file_size_mb, 2),
                "warnings": job_status[job_id].get("warnings", [])
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException as he:
        logger.error(f"❌ HTTPException in job {job_id}: {he.detail}")
        job_status[job_id].update({
            "status": "failed",
            "progress": 0,
            "message": f"Error: {he.detail}",
            "error": str(he.detail),
            "failed_at": datetime.now().isoformat()
        })
        
        # Schedule cleanup
        background_tasks.add_task(cleanup_temp_files, job_dir)
        raise he
        
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        logger.error(f"❌ Exception in job {job_id}: {error_msg}")
        logger.error(traceback.format_exc())
        
        job_status[job_id].update({
            "status": "failed",
            "progress": 0,
            "message": error_msg,
            "error": str(e),
            "traceback": traceback.format_exc(),
            "failed_at": datetime.now().isoformat()
        })
        
        # Schedule cleanup
        background_tasks.add_task(cleanup_temp_files, job_dir)
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/generate-ai-video")
async def generate_ai_video(
    images: List[UploadFile] = File(...),
    story: str = Form(...),
    language: str = Form("en"),
    add_voice: bool = Form(False),
    add_captions: bool = Form(True),
    auto_scene_detection: bool = Form(False),
    highlight_detection: bool = Form(False),
    music_mood: MusicMood = Form(MusicMood.INSPIRATIONAL),
    transition_type: TransitionType = Form(TransitionType.FADE),
    caption_style: CaptionStyle = Form(CaptionStyle.MODERN),
    music_volume: float = Form(0.3),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Generate video with AI-enhanced features"""
    
    # Generate unique job ID
    job_id = str(uuid.uuid4())
    job_dir = Path("temp") / "ai_video" / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    
    logger.info(f"🚀 Starting AI-enhanced video generation job: {job_id}")
    logger.info(f"📊 AI Features: captions={add_captions}, scene_detection={auto_scene_detection}, highlights={highlight_detection}")
    
    # Initialize job status
    job_status[job_id] = {
        "job_id": job_id,
        "status": "initializing",
        "progress": 0,
        "message": "Starting AI-enhanced video generation...",
        "created_at": datetime.now().isoformat(),
        "scenes": [],
        "video_url": None,
        "video_path": None,
        "error": None,
        "warnings": [],
        "ai_features": {
            "enabled": True,
            "captions": add_captions,
            "scene_detection": auto_scene_detection,
            "highlights": highlight_detection,
            "music_mood": music_mood,
            "transition_type": transition_type,
            "caption_style": caption_style
        }
    }
    
    try:
        # 1. Save uploaded images
        job_status[job_id].update({
            "status": "uploading_images",
            "progress": 5,
            "message": "Uploading and processing images..."
        })
        
        image_paths = []
        for i, image in enumerate(images):
            if not image.filename:
                raise HTTPException(status_code=400, detail=f"Image {i+1} filename is empty")
            
            # Validate image format
            image_extension = Path(image.filename).suffix.lower()
            allowed_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp']
            if image_extension not in allowed_extensions:
                raise HTTPException(status_code=400, detail=f"Unsupported image format: {image_extension}")
            
            # Save image with proper extension
            image_path = job_dir / f"image_{i}{image_extension}"
            try:
                with open(image_path, "wb") as buffer:
                    shutil.copyfileobj(image.file, buffer)
                image_paths.append(str(image_path))
                logger.info(f"✓ Saved image {i+1}: {image_path}")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to save image {i+1}: {str(e)}")
        
        # 2. AI Story Analysis
        job_status[job_id].update({
            "status": "analyzing_story",
            "progress": 10,
            "message": "Analyzing story with AI..."
        })
        
        try:
            # Use AI to analyze story and create scenes
            scenes = video_gen.analyze_story_ai(story, len(image_paths))
            
            if not scenes or len(scenes) == 0:
                # Fallback to basic scene creation
                logger.warning("AI scene analysis failed, using fallback")
                scenes = text_processor.break_story_into_scenes(story, len(image_paths))
            
            logger.info(f"🤖 AI created {len(scenes)} scenes")
            job_status[job_id]["scenes"] = scenes
            
        except Exception as e:
            logger.error(f"AI story analysis error: {e}")
            # Fallback to basic
            scenes = text_processor.break_story_into_scenes(story, len(image_paths))
            job_status[job_id]["scenes"] = scenes
            job_status[job_id]["warnings"].append(f"AI analysis failed: {str(e)}")
        
        # 3. Create scene videos with AI transitions
        scene_videos = []
        total_scenes = len(scenes)
        
        for i, scene in enumerate(scenes):
            scene_progress = 15 + (i / total_scenes) * 40
            job_status[job_id].update({
                "status": "creating_ai_scenes",
                "progress": int(scene_progress),
                "message": f"Creating AI-enhanced scene {i+1}/{total_scenes}..."
            })
            
            try:
                # Create scene video
                scene_video_raw = job_dir / f"scene_{i}_raw.mp4"
                logger.info(f"🎬 Creating scene {i+1} with AI...")
                
                success = video_gen.create_ken_burns_effect(
                    image_paths[i % len(image_paths)], 
                    str(scene_video_raw),
                    scene.get("duration", 5.0)
                )
                
                if not success:
                    error_msg = f"Failed to create scene {i+1} video"
                    logger.error(error_msg)
                    raise HTTPException(status_code=500, detail=error_msg)
                
                # Add text overlay with AI-optimized settings
                scene_video_final = job_dir / f"scene_{i}_final.mp4"
                logger.info(f"✏️ Adding AI-optimized text to scene {i+1}...")
                
                scene_text = scene.get("text", story[:100])
                scene_duration = scene.get("duration", 5.0)
                
                success = video_gen.add_text_overlay(
                    str(scene_video_raw),
                    scene_text,
                    scene_duration,
                    str(scene_video_final),
                    font_size=52  # Slightly larger for AI videos
                )
                
                if not success:
                    warning_msg = f"Text overlay failed for scene {i+1}"
                    logger.warning(warning_msg)
                    job_status[job_id]["warnings"].append(warning_msg)
                    scene_video_final = scene_video_raw
                
                scene_videos.append({
                    "path": str(scene_video_final),
                    "scene": scene,
                    "transition": scene.get("recommended_transition", transition_type)
                })
                
                logger.info(f"✓ Completed AI scene {i+1}/{total_scenes}")
                
            except Exception as e:
                error_msg = f"Error processing AI scene {i+1}: {str(e)}"
                logger.error(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
        
        # 4. Apply AI transitions between scenes
        job_status[job_id].update({
            "status": "applying_ai_transitions",
            "progress": 55,
            "message": "Applying AI-recommended transitions..."
        })
        
        try:
            if len(scene_videos) > 1:
                # Create transitioned video
                transitioned_videos = []
                
                for i in range(len(scene_videos)):
                    if i == 0:
                        # First scene, no transition needed
                        transitioned_videos.append(scene_videos[i]["path"])
                    else:
                        # Apply transition between previous and current scene
                        transition_video = job_dir / f"transition_{i-1}_{i}.mp4"
                        
                        prev_video = scene_videos[i-1]["path"]
                        curr_video = scene_videos[i]["path"]
                        trans_type = scene_videos[i]["transition"]
                        
                        logger.info(f"🔄 Applying {trans_type} transition between scenes {i} and {i+1}")
                        
                        success = video_gen.apply_transition(
                            prev_video,
                            curr_video,
                            str(transition_video),
                            trans_type,
                            duration=1.0
                        )
                        
                        if success:
                            transitioned_videos.append(str(transition_video))
                        else:
                            logger.warning(f"Transition failed, using direct concatenation")
                            transitioned_videos.append(curr_video)
                
                # Concatenate all transitioned videos
                combined_video = job_dir / "combined_transitioned.mp4"
                logger.info(f"🔗 Concatenating {len(transitioned_videos)} transitioned scenes...")
                
                success = video_gen.concatenate_videos(transitioned_videos, str(combined_video))
                
            else:
                # Only one scene, no transitions needed
                combined_video = job_dir / "combined_transitioned.mp4"
                shutil.copy(scene_videos[0]["path"], str(combined_video))
                success = True
            
            if not success:
                error_msg = "Failed to create transitioned video"
                logger.error(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
                
        except Exception as e:
            logger.error(f"Transition error: {e}")
            # Fallback: simple concatenation
            combined_video = job_dir / "combined_fallback.mp4"
            simple_paths = [s["path"] for s in scene_videos]
            video_gen.concatenate_videos(simple_paths, str(combined_video))
            job_status[job_id]["warnings"].append(f"Transitions failed: {str(e)}")
        
        # 5. AI Captions
        if add_captions:
            job_status[job_id].update({
                "status": "adding_ai_captions",
                "progress": 65,
                "message": "Adding AI-generated captions..."
            })
            
            try:
                # Generate captions from story
                total_duration = sum(s.get("duration", 5.0) for s in scenes)
                captions = video_gen.generate_captions_ai(story, total_duration)
                
                if captions:
                    # Create captioned video
                    captioned_video = job_dir / "with_captions.mp4"
                    
                    success = video_gen.add_ai_captions(
                        str(combined_video),
                        captions,
                        str(captioned_video),
                        caption_style
                    )
                    
                    if success:
                        combined_video = captioned_video
                        logger.info(f"✓ Added {len(captions)} AI captions")
                    else:
                        logger.warning("AI caption addition failed")
                        job_status[job_id]["warnings"].append("AI captions failed")
                else:
                    logger.warning("No captions generated by AI")
                    
            except Exception as e:
                logger.error(f"AI caption error: {e}")
                job_status[job_id]["warnings"].append(f"Captions failed: {str(e)}")
        
        # 6. Audio processing with AI mood
        final_audio = None
        
        if add_voice:
            job_status[job_id].update({
                "status": "processing_ai_audio",
                "progress": 75,
                "message": "Processing AI-optimized audio..."
            })
            
            try:
                # Generate voice for scenes
                voice_files = []
                for j, scene in enumerate(scenes):
                    voice_file = job_dir / f"ai_voice_{j}.mp3"
                    logger.info(f"🗣️ Generating AI voice for scene {j+1}...")
                    
                    voice_path = audio_proc.text_to_speech(
                        scene.get("text", ""),
                        language,
                        str(voice_file)
                    )
                    
                    if voice_path and Path(voice_path).exists():
                        voice_files.append(voice_path)
                
                if voice_files:
                    # Concatenate voice files
                    combined_voice = job_dir / "ai_voice_combined.mp3"
                    success = audio_proc.concatenate_audio_files(voice_files, str(combined_voice))
                    
                    if success:
                        # Get music track for mood
                        music_tracks = get_available_music_tracks(music_mood)
                        if music_tracks:
                            music_path = music_tracks[0]["path"]
                            
                            # Mix voice with AI-selected music
                            final_audio = job_dir / "ai_final_audio.mp3"
                            logger.info(f"🎵 Mixing with {music_mood} mood music...")
                            
                            audio_proc.mix_audio_with_music(
                                str(combined_voice),
                                music_path,
                                str(final_audio),
                                music_volume
                            )
                        else:
                            final_audio = combined_voice
                            
            except Exception as e:
                logger.error(f"AI audio processing error: {e}")
                job_status[job_id]["warnings"].append(f"Audio processing failed: {str(e)}")
        
        # 7. Final assembly
        job_status[job_id].update({
            "status": "final_ai_assembly",
            "progress": 85,
            "message": "Final AI video assembly..."
        })
        
        final_output = Path("outputs") / f"ai_{job_id}.mp4"
        logger.info(f"🎥 Creating final AI video: {final_output}")
        
        if final_audio and Path(final_audio).exists():
            success = video_gen.add_audio_to_video(
                str(combined_video),
                str(final_audio),
                str(final_output)
            )
        else:
            # No audio, just copy video
            shutil.copy(str(combined_video), str(final_output))
            success = True
        
        if not success or not final_output.exists():
            error_msg = "Failed to create final AI video"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        
        # 8. Create highlight reel if requested
        highlight_reel_path = None
        if highlight_detection:
            job_status[job_id].update({
                "status": "creating_highlights",
                "progress": 90,
                "message": "Creating highlight reel..."
            })
            
            try:
                # Detect highlights
                highlight_times = video_gen.suggest_highlights_ai(str(final_output))
                
                if highlight_times:
                    highlight_reel_path = Path("outputs") / f"highlights_{job_id}.mp4"
                    
                    success = video_gen.create_highlight_reel(
                        str(final_output),
                        highlight_times,
                        str(highlight_reel_path),
                        highlight_duration=5.0
                    )
                    
                    if success:
                        logger.info(f"✓ Created highlight reel with {len(highlight_times)} highlights")
                        job_status[job_id]["highlights"] = {
                            "count": len(highlight_times),
                            "times": highlight_times,
                            "path": str(highlight_reel_path)
                        }
                        
            except Exception as e:
                logger.error(f"Highlight reel error: {e}")
                job_status[job_id]["warnings"].append(f"Highlights failed: {str(e)}")
        
        # 9. Update job status
        file_size_mb = final_output.stat().st_size / (1024 * 1024)
        total_duration = sum(s.get("duration", 5.0) for s in scenes)
        
        job_status[job_id].update({
            "status": "completed",
            "progress": 100,
            "message": "AI video generation completed successfully!",
            "video_url": f"/download/ai_{job_id}",
            "video_path": str(final_output),
            "file_size_mb": round(file_size_mb, 2),
            "total_duration": total_duration,
            "completed_at": datetime.now().isoformat(),
            "ai_summary": {
                "scenes_analyzed": len(scenes),
                "transitions_applied": len(scene_videos) - 1 if len(scene_videos) > 1 else 0,
                "music_mood": music_mood,
                "caption_style": caption_style
            }
        })
        
        # Schedule cleanup
        background_tasks.add_task(cleanup_temp_files, job_dir)
        logger.info(f"🧹 Scheduled cleanup for AI job {job_id}")
        
        logger.info(f"✅ AI video generation completed for job {job_id}")
        logger.info(f"📁 Output: {final_output} ({file_size_mb:.2f} MB)")
        
        # Prepare response
        response_data = {
            "status": "success",
            "job_id": job_id,
            "message": "AI video generated successfully",
            "video_url": f"/download/ai_{job_id}",
            "ai_video_url": f"/download/ai_{job_id}",
            "scenes": scenes,
            "video_info": {
                "duration": total_duration,
                "scenes": len(scenes),
                "resolution": "1280x720",
                "format": "mp4",
                "has_audio": final_audio is not None,
                "file_size_mb": round(file_size_mb, 2),
                "ai_features": job_status[job_id]["ai_features"],
                "warnings": job_status[job_id].get("warnings", [])
            },
            "ai_summary": job_status[job_id].get("ai_summary", {}),
            "timestamp": datetime.now().isoformat()
        }
        
        # Add highlight info if available
        if highlight_reel_path and highlight_reel_path.exists():
            response_data["highlight_reel"] = {
                "url": f"/download/highlights_{job_id}",
                "highlight_count": len(highlight_times) if highlight_times else 0
            }
        
        return response_data
        
    except HTTPException as he:
        logger.error(f"❌ HTTPException in AI job {job_id}: {he.detail}")
        job_status[job_id].update({
            "status": "failed",
            "progress": 0,
            "message": f"Error: {he.detail}",
            "error": str(he.detail),
            "failed_at": datetime.now().isoformat()
        })
        
        # Schedule cleanup
        background_tasks.add_task(cleanup_temp_files, job_dir)
        raise he
        
    except Exception as e:
        error_msg = f"Unexpected error in AI video generation: {str(e)}"
        logger.error(f"❌ Exception in AI job {job_id}: {error_msg}")
        logger.error(traceback.format_exc())
        
        job_status[job_id].update({
            "status": "failed",
            "progress": 0,
            "message": error_msg,
            "error": str(e),
            "traceback": traceback.format_exc(),
            "failed_at": datetime.now().isoformat()
        })
        
        # Schedule cleanup
        background_tasks.add_task(cleanup_temp_files, job_dir)
        raise HTTPException(status_code=500, detail=error_msg)

# ===========================================
# DOWNLOAD ENDPOINTS
# ===========================================

@app.get("/download/{filename}")
async def download_video(filename: str):
    """Download generated video"""
    # Try multiple possible locations
    possible_paths = [
        Path("outputs") / filename,
        Path("outputs") / f"{filename}.mp4",
        Path("audio_outputs") / filename,
        Path("uploads") / filename
    ]
    
    video_path = None
    for path in possible_paths:
        if path.exists():
            video_path = path
            break
    
    if not video_path:
        # Check if it's a job ID
        if filename.startswith("ai_"):
            actual_filename = filename[3:] + ".mp4"
        else:
            actual_filename = filename + ".mp4"
        
        video_path = Path("outputs") / actual_filename
        
        if not video_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
    
    # Get file info
    file_size = video_path.stat().st_size
    file_size_mb = file_size / (1024 * 1024)
    
    logger.info(f"📥 Downloading: {video_path.name} ({file_size_mb:.2f} MB)")
    
    return FileResponse(
        video_path,
        media_type="video/mp4" if video_path.suffix == ".mp4" else "audio/mpeg",
        filename=video_path.name,
        headers={
            "Content-Length": str(file_size),
            "Cache-Control": "no-cache",
            "Content-Disposition": f"attachment; filename={video_path.name}"
        }
    )

@app.get("/export/{job_id}")
async def export_project(job_id: str):
    """Export project as ZIP file"""
    try:
        # Check if job exists
        if job_id not in job_status:
            raise HTTPException(status_code=404, detail="Job not found")
        
        job = job_status[job_id]
        
        # Create ZIP in memory
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Add video file if exists
            video_path = Path("outputs") / f"{job_id}.mp4"
            if video_path.exists():
                zip_file.write(video_path, f"video_{job_id}.mp4")
            
            # Add AI video if exists
            ai_video_path = Path("outputs") / f"ai_{job_id}.mp4"
            if ai_video_path.exists():
                zip_file.write(ai_video_path, f"ai_video_{job_id}.mp4")
            
            # Add highlights if exists
            highlight_path = Path("outputs") / f"highlights_{job_id}.mp4"
            if highlight_path.exists():
                zip_file.write(highlight_path, f"highlights_{job_id}.mp4")
            
            # Add metadata
            metadata = {
                "job_id": job_id,
                "status": job.get("status"),
                "created_at": job.get("created_at"),
                "completed_at": job.get("completed_at"),
                "scenes": job.get("scenes", []),
                "ai_features": job.get("ai_features", {}),
                "video_info": {
                    "file_size_mb": job.get("file_size_mb"),
                    "total_duration": job.get("total_duration")
                }
            }
            
            zip_file.writestr(f"metadata_{job_id}.json", json.dumps(metadata, indent=2, ensure_ascii=False))
        
        zip_buffer.seek(0)
        
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": f"attachment; filename=project_{job_id}.zip"
            }
        )
        
    except Exception as e:
        logger.error(f"Export error: {e}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

# ===========================================
# CLEANUP ENDPOINTS
# ===========================================

@app.delete("/cleanup")
async def cleanup_old_files(
    hours: int = Query(24, description="Delete files older than X hours"),
    delete_all: bool = Query(False, description="Delete all temporary files")
):
    """Cleanup old temporary files"""
    try:
        temp_dirs = ["temp", "uploads", "audio_outputs"]
        deleted = []
        deleted_size = 0
        
        for dir_name in temp_dirs:
            temp_dir = Path(dir_name)
            if temp_dir.exists():
                import time
                current_time = time.time()
                
                for item in temp_dir.iterdir():
                    if item.is_dir():
                        # Check if directory is older than specified hours
                        dir_age = current_time - item.stat().st_mtime
                        if delete_all or dir_age > hours * 3600:
                            try:
                                # Calculate size before deletion
                                size = 0
                                for file in item.rglob("*"):
                                    if file.is_file():
                                        size += file.stat().st_size
                                
                                shutil.rmtree(item)
                                deleted.append(str(item))
                                deleted_size += size
                            except Exception as e:
                                logger.warning(f"Failed to delete {item}: {e}")
        
        deleted_size_mb = deleted_size / (1024 * 1024)
        
        return {
            "status": "success",
            "deleted_count": len(deleted),
            "deleted_size_mb": round(deleted_size_mb, 2),
            "deleted_items": deleted,
            "message": f"Cleaned up {len(deleted)} directories ({deleted_size_mb:.2f} MB)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")

@app.delete("/job/{job_id}")
async def delete_job(job_id: str):
    """Delete a specific job and its files"""
    try:
        # Delete video files
        video_files = [
            Path("outputs") / f"{job_id}.mp4",
            Path("outputs") / f"ai_{job_id}.mp4",
            Path("outputs") / f"highlights_{job_id}.mp4"
        ]
        
        deleted_files = []
        for video_file in video_files:
            if video_file.exists():
                video_file.unlink()
                deleted_files.append(str(video_file))
        
        # Remove from job status
        if job_id in job_status:
            del job_status[job_id]
        
        return {
            "status": "success",
            "job_id": job_id,
            "deleted_files": deleted_files,
            "message": f"Deleted job {job_id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

# ===========================================
# Mount static files
# ===========================================
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")
app.mount("/music", StaticFiles(directory="music_library"), name="music")

# ===========================================
# Startup event
# ===========================================
@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("🚀 Starting AI Story Video Generator API")
    logger.info(f"📁 Working directory: {os.getcwd()}")
    logger.info(f"🐍 Python version: {sys.version}")
    
    # Check FFmpeg
    if check_ffmpeg():
        logger.info("✅ FFmpeg is available")
    else:
        logger.warning("⚠️ FFmpeg not found. Video processing may not work.")
    
    # Check AI features
# ===========================================
# Check AI library availability
# ===========================================
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    print("⚠️ Whisper not installed. Speech-to-text features disabled.")

try:
    from scenedetect import VideoManager, SceneManager
    from scenedetect.detectors import ContentDetector
    SCENEDETECT_AVAILABLE = True
except ImportError:
    SCENEDETECT_AVAILABLE = False
    print("⚠️ SceneDetect not installed. Scene detection features disabled.")

# ===========================================
# Main entry point
# ===========================================
if __name__ == "__main__":
    import uvicorn
    
    # Check FFmpeg before starting
    if not check_ffmpeg():
        logger.error("❌ FFmpeg is not available. Video generation may not work.")
        logger.error("Please install FFmpeg and add it to PATH")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        reload=True,
        log_level="info",
        reload_dirs=["."]
    )
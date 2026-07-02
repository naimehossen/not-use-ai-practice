import os
import whisper
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
import torch
from scenedetect import VideoManager, SceneManager
from scenedetect.detectors import ContentDetector
from transformers import pipeline
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class AIProcessor:
    def __init__(self):
        self.whisper_model = None
        self.sentiment_analyzer = None
        self.scene_detector = None
        
    def load_models(self):
        """Load AI models (lazy loading)"""
        try:
            # Load Whisper for speech recognition
            self.whisper_model = whisper.load_model("base")
            logger.info("✓ Whisper model loaded")
        except Exception as e:
            logger.warning(f"Whisper model not loaded: {e}")
        
        try:
            # Load sentiment analyzer
            self.sentiment_analyzer = pipeline("sentiment-analysis")
            logger.info("✓ Sentiment analyzer loaded")
        except Exception as e:
            logger.warning(f"Sentiment analyzer not loaded: {e}")
    
    def speech_to_text(self, audio_path: str, language: str = "en") -> Dict[str, Any]:
        """Convert speech to text using Whisper"""
        if not self.whisper_model:
            self.load_models()
        
        try:
            result = self.whisper_model.transcribe(audio_path, language=language)
            
            # Extract captions with timestamps
            captions = []
            for segment in result.get("segments", []):
                captions.append({
                    "text": segment["text"],
                    "start": segment["start"],
                    "end": segment["end"],
                    "confidence": segment.get("confidence", 0.0)
                })
            
            return {
                "text": result["text"],
                "language": result.get("language", language),
                "captions": captions,
                "segments": result.get("segments", [])
            }
        except Exception as e:
            logger.error(f"Speech to text error: {e}")
            return {"text": "", "captions": [], "error": str(e)}
    
    def detect_scenes(self, video_path: str, threshold: float = 30.0) -> List[Dict[str, Any]]:
        """Detect scene changes in video"""
        try:
            video_manager = VideoManager([video_path])
            scene_manager = SceneManager()
            scene_manager.add_detector(ContentDetector(threshold=threshold))
            
            video_manager.start()
            scene_manager.detect_scenes(frame_source=video_manager)
            scene_list = scene_manager.get_scene_list()
            
            scenes = []
            for i, (start_time, end_time) in enumerate(scene_list):
                scenes.append({
                    "scene_id": i + 1,
                    "start": start_time.get_seconds(),
                    "end": end_time.get_seconds(),
                    "duration": end_time.get_seconds() - start_time.get_seconds()
                })
            
            video_manager.release()
            return scenes
            
        except Exception as e:
            logger.error(f"Scene detection error: {e}")
            return []
    
    def analyze_story_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of story text"""
        try:
            if self.sentiment_analyzer:
                result = self.sentiment_analyzer(text[:512])  # Limit length
                return {
                    "sentiment": result[0]["label"],
                    "score": float(result[0]["score"]),
                    "mood": self._sentiment_to_mood(result[0]["label"])
                }
            else:
                # Simple rule-based analysis
                positive_words = ["happy", "good", "great", "excellent", "love", "wonderful"]
                negative_words = ["sad", "bad", "terrible", "hate", "awful", "angry"]
                
                text_lower = text.lower()
                positive_count = sum(1 for word in positive_words if word in text_lower)
                negative_count = sum(1 for word in negative_words if word in text_lower)
                
                if positive_count > negative_count:
                    return {"sentiment": "POSITIVE", "score": 0.7, "mood": "happy"}
                elif negative_count > positive_count:
                    return {"sentiment": "NEGATIVE", "score": 0.7, "mood": "sad"}
                else:
                    return {"sentiment": "NEUTRAL", "score": 0.5, "mood": "neutral"}
                    
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return {"sentiment": "NEUTRAL", "score": 0.5, "mood": "neutral"}
    
    def _sentiment_to_mood(self, sentiment: str) -> str:
        """Convert sentiment to music mood"""
        mood_map = {
            "POSITIVE": "happy",
            "NEGATIVE": "sad",
            "NEUTRAL": "inspirational"
        }
        return mood_map.get(sentiment.upper(), "inspirational")
    
    def suggest_highlights(self, video_path: str, captions: List[Dict] = None) -> List[int]:
        """Suggest highlights based on audio energy or text importance"""
        try:
            # Simple implementation - return every 3rd scene as highlight
            scenes = self.detect_scenes(video_path)
            highlights = [i for i in range(0, len(scenes), 3)]
            return highlights[:5]  # Max 5 highlights
            
        except Exception as e:
            logger.error(f"Highlight suggestion error: {e}")
            return []
    
    def generate_captions(self, text: str, duration: float) -> List[Dict[str, Any]]:
        """Generate timed captions from text"""
        try:
            # Split text into sentences
            sentences = [s.strip() for s in text.split('.') if s.strip()]
            if not sentences:
                return []
            
            # Calculate time per sentence
            time_per_sentence = duration / len(sentences)
            
            captions = []
            current_time = 0.0
            
            for i, sentence in enumerate(sentences):
                caption_duration = min(time_per_sentence, 5.0)  # Max 5 seconds per caption
                captions.append({
                    "id": i + 1,
                    "text": sentence,
                    "start": current_time,
                    "end": current_time + caption_duration,
                    "duration": caption_duration
                })
                current_time += caption_duration
            
            return captions
            
        except Exception as e:
            logger.error(f"Caption generation error: {e}")
            return []
    
    def suggest_music_tracks(self, mood: str, duration: float) -> List[str]:
        """Suggest music tracks based on mood and duration"""
        # This would typically call an external API
        # For now, return placeholder suggestions
        
        music_library = {
            "happy": ["upbeat_instrumental.mp3", "positive_vibes.mp3", "joyful_melody.mp3"],
            "sad": ["emotional_piano.mp3", "melancholy_strings.mp3", "reflective_ambient.mp3"],
            "epic": ["cinematic_orchestral.mp3", "heroic_theme.mp3", "adventure_score.mp3"],
            "romantic": ["love_theme.mp3", "soft_piano.mp3", "romantic_strings.mp3"],
            "suspense": ["mystery_ambient.mp3", "tension_build.mp3", "suspenseful_synth.mp3"],
            "inspirational": ["uplifting_orchestral.mp3", "motivational_piano.mp3", "inspiring_choir.mp3"]
        }
        
        return music_library.get(mood, ["background_music.mp3"])
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

class Language(str, Enum):
    ENGLISH = "en"
    BENGALI = "bn"
    HINDI = "hi"
    ARABIC = "ar"
    URDU = "ur"

class SceneType(str, Enum):
    INTRODUCTION = "introduction"
    DIALOGUE = "dialogue"
    ACTION = "action"
    CLIMAX = "climax"
    CONCLUSION = "conclusion"

class TransitionType(str, Enum):
    CUT = "cut"
    FADE = "fade"
    DISSOLVE = "dissolve"
    SLIDE = "slide"
    ZOOM = "zoom"

class MusicMood(str, Enum):
    HAPPY = "happy"
    SAD = "sad"
    EPIC = "epic"
    ROMANTIC = "romantic"
    SUSPENSE = "suspense"
    INSPIRATIONAL = "inspirational"

class Scene(BaseModel):
    scene_number: int
    text: str
    duration: float
    image_index: int
    scene_type: SceneType = SceneType.DIALOGUE
    transition: TransitionType = TransitionType.FADE
    caption: Optional[str] = None
    highlight_score: float = 0.0
    
class VideoRequest(BaseModel):
    images: List[str]
    story: str
    language: Language = Language.ENGLISH
    add_voice: bool = False
    add_captions: bool = True
    auto_scene_detection: bool = True
    highlight_detection: bool = True
    music_mood: MusicMood = MusicMood.INSPIRATIONAL
    transition_type: TransitionType = TransitionType.FADE
    music_volume: float = 0.3

class AIAnalysisResult(BaseModel):
    scenes: List[Scene]
    transcript: Optional[str] = None
    captions: List[Dict[str, Any]]
    highlights: List[int]
    suggested_cuts: List[float]
    music_suggestions: List[str]
import json
import re
from langdetect import detect
from typing import List

class TextProcessor:
    def __init__(self):
        self.sentence_delimiters = {
            'en': ['.', '!', '?'],
            'bn': ['।', '!', '?']
        }
    
    def detect_language(self, text: str) -> str:
        """Detect language of the story"""
        try:
            lang = detect(text)
            return 'bn' if lang == 'bn' else 'en'
        except:
            return 'en'
    
    def split_into_sentences(self, text: str, language: str = 'en') -> List[str]:
        """Split story into sentences"""
        if language == 'bn':
            # Bengali sentence splitting
            sentences = re.split(r'[।!?]+', text)
        else:
            # English sentence splitting
            sentences = re.split(r'[.!?]+', text)
        
        # Clean up sentences
        sentences = [s.strip() for s in sentences if s.strip()]
        return sentences
    
    def calculate_scene_duration(self, sentence: str) -> float:
        """Calculate duration based on sentence length"""
        word_count = len(sentence.split())
        base_duration = 3  # Minimum seconds per scene
        extra_per_word = 0.3
        
        duration = base_duration + (word_count * extra_per_word)
        return min(duration, 10)  # Max 10 seconds per scene
    
    def break_story_into_scenes(self, story: str, num_images: int) -> List[dict]:
        """Break story into scenes matching number of images"""
        language = self.detect_language(story)
        sentences = self.split_into_sentences(story, language)
        
        # Adjust number of scenes to match number of images
        if len(sentences) > num_images:
            # Combine sentences if we have more sentences than images
            combined = []
            chunk_size = len(sentences) // num_images
            for i in range(0, len(sentences), chunk_size):
                chunk = ' '.join(sentences[i:i+chunk_size])
                if chunk:
                    combined.append(chunk)
            sentences = combined[:num_images]
        elif len(sentences) < num_images:
            # Repeat last sentence if we have more images than sentences
            sentences += [sentences[-1]] * (num_images - len(sentences))
        
        scenes = []
        for i, sentence in enumerate(sentences[:num_images]):
            duration = self.calculate_scene_duration(sentence)
            scenes.append({
                "scene": i + 1,
                "text": sentence,
                "duration": round(duration, 1),
                "image_index": i
            })
        
        return scenes
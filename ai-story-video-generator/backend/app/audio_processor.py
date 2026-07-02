import os
from pathlib import Path
from typing import List, Optional
import logging
from gtts import gTTS
from pydub import AudioSegment
import tempfile

logger = logging.getLogger(__name__)

class AudioProcessor:
    def __init__(self, output_dir: str = "audio_outputs"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
    def text_to_speech(self, text: str, language: str = 'en', output_path: Optional[str] = None) -> Optional[str]:
        """Convert text to speech using gTTS"""
        try:
            if not text or not text.strip():
                logger.warning("Empty text provided for TTS")
                return None
            
            # Clean text
            text_clean = text.strip()
            
            # Determine language code
            lang_map = {
                'en': 'en',
                'bn': 'bn',
                'hi': 'hi',
                'es': 'es',
                'fr': 'fr',
                'de': 'de',
                'ar': 'ar',
                'ur': 'ur'
            }
            lang_code = lang_map.get(language.lower(), 'en')
            
            # Create output path if not provided
            if not output_path:
                import hashlib
                text_hash = hashlib.md5(f"{text_clean}_{lang_code}".encode()).hexdigest()[:8]
                output_path = str(self.output_dir / f"tts_{text_hash}.mp3")
            
            output_path = str(Path(output_path))
            
            logger.info(f"Generating TTS for: '{text_clean[:50]}...' in {lang_code}")
            
            # Generate speech
            tts = gTTS(text=text_clean, lang=lang_code, slow=False)
            tts.save(output_path)
            
            # Verify file was created
            if Path(output_path).exists() and Path(output_path).stat().st_size > 0:
                logger.info(f"✓ TTS generated: {output_path} ({Path(output_path).stat().st_size} bytes)")
                return output_path
            else:
                logger.error(f"✗ TTS file not created or empty: {output_path}")
                return None
                
        except Exception as e:
            logger.error(f"Error in text_to_speech: {e}")
            return None
    
    def concatenate_audio_files(self, audio_files: List[str], output_path: str) -> bool:
        """Concatenate multiple audio files"""
        try:
            if not audio_files:
                logger.error("No audio files to concatenate")
                return False
            
            # Filter out None or non-existent files
            valid_files = []
            for audio_file in audio_files:
                if audio_file and Path(audio_file).exists():
                    valid_files.append(audio_file)
                else:
                    logger.warning(f"Audio file not found or invalid: {audio_file}")
            
            if not valid_files:
                logger.error("No valid audio files to concatenate")
                return False
            
            logger.info(f"Concatenating {len(valid_files)} audio files")
            
            # Load first audio segment
            combined = AudioSegment.from_file(valid_files[0])
            
            # Append remaining segments
            for audio_file in valid_files[1:]:
                try:
                    segment = AudioSegment.from_file(audio_file)
                    combined += segment
                except Exception as e:
                    logger.warning(f"Failed to append {audio_file}: {e}")
            
            # Export combined audio
            combined.export(output_path, format="mp3")
            
            if Path(output_path).exists():
                logger.info(f"✓ Audio concatenated: {output_path}")
                return True
            else:
                logger.error(f"✗ Failed to create concatenated audio: {output_path}")
                return False
                
        except Exception as e:
            logger.error(f"Error concatenating audio files: {e}")
            return False
    
    def mix_audio_with_music(self, voice_path: str, music_path: str, 
                            output_path: str, music_volume: float = -20.0) -> bool:
        """Mix voice audio with background music"""
        try:
            if not Path(voice_path).exists():
                logger.error(f"Voice file not found: {voice_path}")
                return False
            
            if not Path(music_path).exists():
                logger.error(f"Music file not found: {music_path}")
                return False
            
            logger.info(f"Mixing voice with background music (volume: {music_volume}dB)")
            
            # Load audio files
            voice = AudioSegment.from_file(voice_path)
            music = AudioSegment.from_file(music_path)
            
            # Adjust music volume
            music = music + music_volume  # Reduce volume
            
            # Make music loop if it's shorter than voice
            if len(music) < len(voice):
                # Loop music
                loops_needed = (len(voice) // len(music)) + 1
                music = music * loops_needed
            
            # Trim music to voice length
            music = music[:len(voice)]
            
            # Mix audio
            mixed = voice.overlay(music)
            
            # Export
            mixed.export(output_path, format="mp3")
            
            if Path(output_path).exists():
                logger.info(f"✓ Audio mixed successfully: {output_path}")
                return True
            else:
                logger.error(f"✗ Failed to create mixed audio: {output_path}")
                return False
                
        except Exception as e:
            logger.error(f"Error mixing audio: {e}")
            return False
    
    def create_silent_audio(self, duration_ms: int, output_path: str) -> bool:
        """Create silent audio of specified duration"""
        try:
            silent = AudioSegment.silent(duration=duration_ms)
            silent.export(output_path, format="mp3")
            return True
        except Exception as e:
            logger.error(f"Error creating silent audio: {e}")
            return False
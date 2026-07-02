import os
import sys
from pydub import AudioSegment

def set_ffmpeg_path():
    """Set FFmpeg path for the application"""
    
    # FFmpeg এর পাথ (আপনার FFmpeg যেখানে আছে)
    ffmpeg_dir = r"D:\ffepge\ffmpeg-master-latest-win64-g"
    
    # FFmpeg executable এর পাথ
    ffmpeg_exe = os.path.join(ffmpeg_dir, "bin", "ffmpeg.exe")
    ffprobe_exe = os.path.join(ffmpeg_dir, "bin", "ffprobe.exe")
    
    # পাথ সেট করুন
    AudioSegment.converter = ffmpeg_exe
    AudioSegment.ffmpeg = ffmpeg_exe
    AudioSegment.ffprobe = ffprobe_exe
    
    # সিস্টেম পাথেও যোগ করুন
    bin_path = os.path.join(ffmpeg_dir, "bin")
    if bin_path not in os.environ['PATH']:
        os.environ['PATH'] = bin_path + ';' + os.environ['PATH']
    
    print(f"FFmpeg path set to: {ffmpeg_exe}")
    print(f"FFprobe path set to: {ffprobe_exe}")
    
    # FFmpeg কাজ করছে কিনা টেস্ট করুন
    try:
        test_audio = AudioSegment.silent(duration=1000)
        print("✅ FFmpeg configured successfully!")
        return True
    except Exception as e:
        print(f"❌ FFmpeg configuration failed: {e}")
        return False

if __name__ == "__main__":
    set_ffmpeg_path()
import subprocess
import os
import sys

# Test 1: Check if ffmpeg is in PATH
print("=== Test 1: Checking PATH ===")
path_dirs = os.environ.get('PATH', '').split(os.pathsep)
print(f"PATH directories: {len(path_dirs)}")
for dir_path in path_dirs:
    if 'ffmpeg' in dir_path.lower():
        print(f"Found in PATH: {dir_path}")

# Test 2: Direct FFmpeg path
print("\n=== Test 2: Direct FFmpeg path ===")
ffmpeg_path = r"D:\ffepge\ffmpeg-master-latest-win64-g\bin\ffmpeg.exe"
if os.path.exists(ffmpeg_path):
    print(f"✓ FFmpeg exists at: {ffmpeg_path}")
    
    # Test the command
    cmd = f'"{ffmpeg_path}" -version'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print(f"Return code: {result.returncode}")
    if result.returncode == 0:
        print("✓ FFmpeg works!")
        print(f"Version: {result.stdout[:100]}")
    else:
        print("✗ FFmpeg failed")
        print(f"Error: {result.stderr}")
else:
    print(f"✗ FFmpeg NOT found at: {ffmpeg_path}")

# Test 3: Try with different command format
print("\n=== Test 3: Different command formats ===")
test_commands = [
    # Format 1: Direct path
    [ffmpeg_path, '-version'],
    # Format 2: String with quotes
    f'"{ffmpeg_path}" -version',
    # Format 3: cd to directory then run
    f'cd /d "{os.path.dirname(ffmpeg_path)}" && ffmpeg -version',
]

for i, cmd in enumerate(test_commands):
    print(f"\nTest {i+1}: {cmd}")
    try:
        if isinstance(cmd, list):
            result = subprocess.run(cmd, capture_output=True, text=True, shell=False)
        else:
            result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
        
        print(f"Return code: {result.returncode}")
        if result.returncode == 0:
            print("✓ Success!")
        else:
            print(f"✗ Failed: {result.stderr[:200]}")
    except Exception as e:
        print(f"✗ Exception: {e}")
import React from 'react';
import { Music, Volume2 } from 'lucide-react';

const MusicUploader = ({ musicFile, setMusicFile, musicVolume, setMusicVolume }) => {
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setMusicFile(e.target.files[0]);
    }
  };

  const removeMusic = () => {
    setMusicFile(null);
  };

  return (
    <div className="w-full space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Background Music (Optional)
        </label>
        
        {!musicFile ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
              id="music-upload"
            />
            <label htmlFor="music-upload" className="cursor-pointer">
              <Music className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Upload background music
              </p>
              <p className="text-xs text-gray-500 mt-1">
                MP3, WAV up to 20MB
              </p>
            </label>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Music className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">{musicFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(musicFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeMusic}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Music Volume
          </label>
          <span className="text-sm text-gray-500">{Math.round(musicVolume * 100)}%</span>
        </div>
        <div className="flex items-center space-x-3">
          <Volume2 className="h-5 w-5 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={musicVolume}
            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Lower volume ensures voice is clearly audible
        </p>
      </div>
    </div>
  );
};

export default MusicUploader;
import React from 'react';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Music, 
  Type,
  MoveRight, // Transition এর জন্য
  Settings,
  Wand2
} from 'lucide-react';

const AIOptions = ({
  aiFeatures,
  setAiFeatures,
  musicMood,
  setMusicMood,
  transitionType,
  setTransitionType,
  captionStyle,
  setCaptionStyle,
  addCaptions,
  setAddCaptions
}) => {
  const musicMoods = [
    { value: 'happy', label: 'Happy/Upbeat', icon: '😊' },
    { value: 'sad', label: 'Sad/Emotional', icon: '😢' },
    { value: 'epic', label: 'Epic/Cinematic', icon: '🎬' },
    { value: 'romantic', label: 'Romantic', icon: '❤️' },
    { value: 'suspense', label: 'Suspense/Mystery', icon: '🔍' },
    { value: 'inspirational', label: 'Inspirational', icon: '🌟' },
    { value: 'calm', label: 'Calm/Peaceful', icon: '☮️' }
  ];

  const transitionTypes = [
    { value: 'fade', label: 'Fade', icon: '🌅' },
    { value: 'dissolve', label: 'Dissolve', icon: '💫' },
    { value: 'slide', label: 'Slide', icon: '➡️' },
    { value: 'zoom', label: 'Zoom', icon: '🔍' },
    { value: 'wipe', label: 'Wipe', icon: '🧹' }
  ];

  const captionStyles = [
    { value: 'modern', label: 'Modern' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'bold', label: 'Bold' },
    { value: 'classic', label: 'Classic' },
    { value: 'subtle', label: 'Subtle' }
  ];

  const toggleFeature = (feature) => {
    setAiFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Auto Captions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Type className="h-5 w-5 text-purple-600" />
            <label className="font-medium text-gray-900">Auto-generated captions</label>
          </div>
          <button
            type="button"
            onClick={() => setAddCaptions(!addCaptions)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              addCaptions ? 'bg-purple-500' : 'bg-gray-300'
            } transition-colors`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                addCaptions ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {addCaptions && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Caption Style</label>
            <div className="grid grid-cols-3 gap-2">
              {captionStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setCaptionStyle(style.value)}
                  className={`py-2 text-center rounded-lg font-medium text-sm ${
                    captionStyle === style.value
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scene Detection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <label className="font-medium text-gray-900">Auto scene detection</label>
          </div>
          <button
            type="button"
            onClick={() => toggleFeature('autoSceneDetection')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              aiFeatures.autoSceneDetection ? 'bg-purple-500' : 'bg-gray-300'
            } transition-colors`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                aiFeatures.autoSceneDetection ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-sm text-gray-500">Detect scene changes automatically for better transitions</p>
      </div>

      {/* Smart Transitions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MoveRight className="h-5 w-5 text-purple-600" />
            <label className="font-medium text-gray-900">Smart transitions</label>
          </div>
          <button
            type="button"
            onClick={() => toggleFeature('smartTransitions')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              aiFeatures.smartTransitions ? 'bg-purple-500' : 'bg-gray-300'
            } transition-colors`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                aiFeatures.smartTransitions ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {aiFeatures.smartTransitions && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transition Type</label>
            <div className="grid grid-cols-3 gap-2">
              {transitionTypes.map((trans) => (
                <button
                  key={trans.value}
                  onClick={() => setTransitionType(trans.value)}
                  className={`py-2 text-center rounded-lg font-medium text-sm ${
                    transitionType === trans.value
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{trans.icon}</span>
                  {trans.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mood-based Music */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Music className="h-5 w-5 text-purple-600" />
            <label className="font-medium text-gray-900">Mood-based music</label>
          </div>
          <button
            type="button"
            onClick={() => toggleFeature('moodBasedMusic')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              aiFeatures.moodBasedMusic ? 'bg-purple-500' : 'bg-gray-300'
            } transition-colors`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                aiFeatures.moodBasedMusic ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {aiFeatures.moodBasedMusic && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Music Mood</label>
            <div className="grid grid-cols-2 gap-2">
              {musicMoods.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setMusicMood(mood.value)}
                  className={`py-3 text-center rounded-lg font-medium text-sm flex items-center justify-center ${
                    musicMood === mood.value
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2 text-lg">{mood.icon}</span>
                  {mood.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Highlight Suggestions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <label className="font-medium text-gray-900">Highlight suggestions</label>
          </div>
          <button
            type="button"
            onClick={() => toggleFeature('highlightDetection')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              aiFeatures.highlightDetection ? 'bg-purple-500' : 'bg-gray-300'
            } transition-colors`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                aiFeatures.highlightDetection ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-sm text-gray-500">Automatically detect and create highlight reels</p>
      </div>

      {/* AI Stats */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">AI Features Enabled</span>
          <span className="text-lg font-bold text-purple-600">
            {Object.values(aiFeatures).filter(v => v).length + (addCaptions ? 1 : 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIOptions;
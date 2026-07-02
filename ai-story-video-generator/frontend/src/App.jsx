import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import StoryInput from './components/StoryInput';
import MusicUploader from './components/MusicUploader';
import VideoPreview from './components/VideoPreview';
import LoadingOverlay from './components/LoadingOverlay';
import AIOptions from './components/AIOptions';
import { Wand2, Sparkles, Info, AlertCircle, Brain, Zap, Download, RefreshCw, Settings, Video, Music, Type } from 'lucide-react';

function App() {
  const [images, setImages] = useState([]);
  const [story, setStory] = useState('');
  const [language, setLanguage] = useState('en');
  const [musicFile, setMusicFile] = useState(null);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [addVoice, setAddVoice] = useState(true);
  const [addCaptions, setAddCaptions] = useState(true);
  const [aiFeatures, setAiFeatures] = useState({
    autoSceneDetection: false,
    highlightDetection: false,
    smartTransitions: true,
    moodBasedMusic: true,
    aiStoryAnalysis: false
  });
  const [musicMood, setMusicMood] = useState('inspirational');
  const [transitionType, setTransitionType] = useState('fade');
  const [captionStyle, setCaptionStyle] = useState('modern');
  
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [aiVideoUrl, setAiVideoUrl] = useState(null);
  const [highlightReelUrl, setHighlightReelUrl] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [videoInfo, setVideoInfo] = useState(null);
  const [aiVideoInfo, setAiVideoInfo] = useState(null);
  const [showTips, setShowTips] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [analysisResult, setAnalysisResult] = useState(null);

  const calculateTotalDuration = () => {
    if (scenes.length > 0) {
      return scenes.reduce((total, scene) => total + scene.duration, 0);
    }
    return images.length * 4; // Default 4 seconds per image
  };

  const analyzeStory = async () => {
    if (!story.trim()) {
      setError('Please write a story to analyze');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('story', story);
      formData.append('language', language);
      formData.append('analyze_sentiment', 'true');
      formData.append('suggest_scenes', 'true');

      const response = await fetch('http://localhost:8000/analyze-story', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
        
        // Auto-fill scenes if analysis returned them
        if (data.suggested_scenes && images.length > 0) {
          const limitedScenes = data.suggested_scenes.slice(0, images.length);
          setScenes(limitedScenes);
        }
        
        // Auto-set music mood if analysis suggests it
        if (data.recommended_mood && aiFeatures.moodBasedMusic) {
          setMusicMood(data.recommended_mood);
        }
      }
    } catch (error) {
      console.error('Story analysis error:', error);
    }
  };

  // Auto-analyze story when it changes (debounced)
  useEffect(() => {
    if (aiFeatures.aiStoryAnalysis && story.trim().length > 50) {
      const timer = setTimeout(() => {
        analyzeStory();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [story, aiFeatures.aiStoryAnalysis]);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 300);
    } else {
      setLoadingProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!loading) return;
    
    const steps = activeTab === 'ai' 
      ? ['analyzing_story', 'processing_images', 'creating_scenes', 'adding_transitions', 'generating_captions', 'mixing_audio', 'assembling', 'creating_highlights']
      : ['processing_images', 'adding_text', 'generating_audio', 'mixing_audio', 'assembling'];
    
    let currentStepIndex = 0;
    const stepInterval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        setLoadingStep(steps[currentStepIndex]);
        currentStepIndex++;
      }
    }, 2000);
    
    return () => clearInterval(stepInterval);
  }, [loading, activeTab]);

  const generateBasicVideo = async () => {
    if (images.length === 0) {
      setError('Please upload at least one image');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!story.trim()) {
      setError('Please write a story');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setLoadingProgress(0);
    setVideoUrl(null);
    setAiVideoUrl(null);
    setHighlightReelUrl(null);
    setVideoInfo(null);
    setAiVideoInfo(null);
    setError(null);

    const formData = new FormData();
    
    images.forEach(image => {
      formData.append('images', image.file);
    });
    
    formData.append('story', story);
    formData.append('language', language);
    formData.append('add_voice', addVoice.toString());
    formData.append('music_volume', musicVolume.toString());
    
    if (musicFile) {
      formData.append('music_file', musicFile);
    }

    try {
      setLoadingStep('processing_images');
      const response = await fetch('http://localhost:8000/generate-video', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        const baseUrl = 'http://localhost:8000';
        const videoUrl = data.video_url.startsWith('http') 
          ? data.video_url 
          : `${baseUrl}${data.video_url}`;
        
        setVideoUrl(videoUrl);
        setScenes(data.scenes || []);
        
        setVideoInfo({
          duration: calculateTotalDuration(),
          scenes: data.scenes?.length || images.length,
          resolution: "1280x720",
          size: data.video_info?.file_size_mb || 0,
          scenesData: data.scenes?.map((scene, index) => ({
            ...scene,
            thumbnail: images[index]?.preview
          })) || [],
          createdAt: new Date().toISOString(),
          hasAudio: data.video_info?.has_audio || false,
          warnings: data.video_info?.warnings || []
        });
        
        setTimeout(() => setLoadingStep('assembling'), 1000);
        setTimeout(() => setLoadingProgress(100), 1500);
        
      } else {
        throw new Error(data.detail || `Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Video generation error:', error);
      setError(`Failed to generate video: ${error.message}`);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingStep('');
      }, 500);
    }
  };

  const generateAIVideo = async () => {
    if (images.length === 0) {
      setError('Please upload at least one image');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!story.trim()) {
      setError('Please write a story');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setLoadingProgress(0);
    setVideoUrl(null);
    setAiVideoUrl(null);
    setHighlightReelUrl(null);
    setVideoInfo(null);
    setAiVideoInfo(null);
    setError(null);

    const formData = new FormData();
    
    images.forEach(image => {
      formData.append('images', image.file);
    });
    
    formData.append('story', story);
    formData.append('language', language);
    formData.append('add_voice', addVoice.toString());
    formData.append('add_captions', addCaptions.toString());
    formData.append('auto_scene_detection', aiFeatures.autoSceneDetection.toString());
    formData.append('highlight_detection', aiFeatures.highlightDetection.toString());
    formData.append('music_mood', musicMood);
    formData.append('transition_type', transitionType);
    formData.append('caption_style', captionStyle);
    formData.append('music_volume', musicVolume.toString());
    
    if (musicFile) {
      formData.append('music_file', musicFile);
    }

    try {
      setLoadingStep('analyzing_story');
      const response = await fetch('http://localhost:8000/generate-ai-video', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        const baseUrl = 'http://localhost:8000';
        
        if (data.video_url) {
          const videoUrl = data.video_url.startsWith('http') 
            ? data.video_url 
            : `${baseUrl}${data.video_url}`;
          setVideoUrl(videoUrl);
        }
        
        if (data.ai_video_url) {
          const aiVideoUrl = data.ai_video_url.startsWith('http')
            ? data.ai_video_url
            : `${baseUrl}${data.ai_video_url}`;
          setAiVideoUrl(aiVideoUrl);
        }
        
        if (data.highlight_reel?.url) {
          setHighlightReelUrl(`${baseUrl}${data.highlight_reel.url}`);
        }
        
        setScenes(data.scenes || []);
        
        setAiVideoInfo({
          duration: data.video_info?.duration || calculateTotalDuration(),
          scenes: data.video_info?.scenes || images.length,
          resolution: "1280x720",
          size: data.video_info?.file_size_mb || 0,
          scenesData: data.scenes?.map((scene, index) => ({
            ...scene,
            thumbnail: images[index]?.preview
          })) || [],
          createdAt: new Date().toISOString(),
          hasAudio: data.video_info?.has_audio || false,
          aiFeatures: data.video_info?.ai_features || {},
          warnings: data.video_info?.warnings || [],
          aiSummary: data.ai_summary || {}
        });
        
        setTimeout(() => setLoadingStep('assembling'), 1000);
        setTimeout(() => setLoadingProgress(100), 1500);
        
      } else {
        throw new Error(data.detail || `Error: ${response.status}`);
      }
    } catch (error) {
      console.error('AI video generation error:', error);
      setError(`Failed to generate AI video: ${error.message}`);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingStep('');
      }, 500);
    }
  };

  const generateVideo = () => {
    if (activeTab === 'ai') {
      generateAIVideo();
    } else {
      generateBasicVideo();
    }
  };

  const handleRegenerate = () => {
    setVideoUrl(null);
    setAiVideoUrl(null);
    setHighlightReelUrl(null);
    setVideoInfo(null);
    setAiVideoInfo(null);
    setScenes([]);
  };

  const handleNewProject = () => {
    if (window.confirm('Start a new project? This will clear all current inputs.')) {
      setImages([]);
      setStory('');
      setMusicFile(null);
      setVideoUrl(null);
      setAiVideoUrl(null);
      setHighlightReelUrl(null);
      setVideoInfo(null);
      setAiVideoInfo(null);
      setScenes([]);
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleClearError = () => {
    setError(null);
  };

  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {loading && (
        <LoadingOverlay 
          progress={loadingProgress} 
          currentStep={loadingStep}
          message={`Creating ${activeTab === 'ai' ? 'AI-enhanced' : ''} story video...`}
        />
      )}
      
      {error && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-red-50 border border-red-200 rounded-xl shadow-lg p-4 max-w-md">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={handleClearError}
                className="text-red-500 hover:text-red-700 ml-3"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
      
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Wand2 className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  AI Story Video Generator
                </h1>
                <p className="text-blue-100 mt-1">
                  Transform your story and images into an animated video
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTips(!showTips)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Info size={18} />
                <span>{showTips ? 'Hide Tips' : 'Show Tips'}</span>
              </button>
              
              {(videoUrl || aiVideoUrl || images.length > 0 || story.trim()) && (
                <button
                  onClick={handleNewProject}
                  className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors"
                >
                  New Project
                </button>
              )}
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'basic'
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Video size={18} />
                <span>Basic Video</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Brain size={18} />
                <span>AI Enhanced</span>
                <span className="text-xs bg-white/30 px-2 py-1 rounded-full">BETA</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {showTips && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Best Practices</h4>
                  <p className="text-sm text-amber-700">Use high-quality images (min 1280x720) for best results</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Story Writing</h4>
                  <p className="text-sm text-amber-700">Write clear sentences. Each sentence becomes a scene</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Audio Tips</h4>
                  <p className="text-sm text-amber-700">Keep music volume at 30% or lower for clear narration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{images.length}</div>
                  <div className="text-sm text-gray-600">Images</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{scenes.length || '?'}</div>
                  <div className="text-sm text-gray-600">Scenes</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">
                    {calculateTotalDuration().toFixed(0)}s
                  </div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <div className="text-2xl font-bold text-amber-600">
                    {story.trim().split(/\s+/).filter(Boolean).length}
                  </div>
                  <div className="text-sm text-gray-600">Words</div>
                </div>
              </div>
              
              {analysisResult && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Brain className="h-5 w-5 text-purple-600 mr-2" />
                    AI Analysis Results
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sentiment:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        analysisResult.sentiment?.sentiment === 'positive' 
                          ? 'bg-green-100 text-green-800'
                          : analysisResult.sentiment?.sentiment === 'negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {analysisResult.sentiment?.sentiment || 'Neutral'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Recommended Mood:</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {analysisResult.recommended_mood || 'Inspirational'}
                      </span>
                    </div>
                    {analysisResult.music_suggestions?.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600">Music Suggestions:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {analysisResult.music_suggestions.slice(0, 3).map((music, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                              {music.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Upload Images
                </h2>
                {images.length > 0 && (
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {images.length} selected
                  </span>
                )}
              </div>
              <ImageUploader images={images} setImages={setImages} />
              
              {images.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                      <div key={image.id} className="relative group flex-shrink-0">
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border-2 border-transparent group-hover:border-blue-500 transition-all"
                        />
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Story Input */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Write Your Story
                </h2>
                {aiFeatures.aiStoryAnalysis && (
                  <button
                    onClick={analyzeStory}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium"
                  >
                    <Brain size={16} />
                    <span>Analyze with AI</span>
                  </button>
                )}
              </div>
              
              <StoryInput 
                story={story} 
                setStory={setStory}
                language={language}
                setLanguage={setLanguage}
              />
              
              {/* AI Analysis Toggle */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      AI Story Analysis
                    </h3>
                    <p className="text-sm text-gray-500">
                      Get AI insights on your story (sentiment, mood, etc.)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiFeatures({
                      ...aiFeatures,
                      aiStoryAnalysis: !aiFeatures.aiStoryAnalysis
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      aiFeatures.aiStoryAnalysis ? 'bg-purple-500' : 'bg-gray-300'
                    } transition-colors`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        aiFeatures.aiStoryAnalysis ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {scenes.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Scene Preview ({scenes.length} scenes)
                  </h3>
                  <div className="space-y-2">
                    {scenes.map((scene, index) => (
                      <div 
                        key={index} 
                        className="flex items-start space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                            {scene.scene}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-700">{scene.text}</p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs text-gray-500">
                              {scene.duration}s
                            </span>
                            <span className="text-xs text-gray-500">
                              Image {scene.image_index + 1}
                            </span>
                            {scene.scene_type && (
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {scene.scene_type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* AI Options Panel */}
            {activeTab === 'ai' && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-200">
                <div className="flex items-center space-x-3 mb-6">
                  <Brain className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    AI Enhancement Features
                  </h2>
                </div>
                
                <AIOptions
                  aiFeatures={aiFeatures}
                  setAiFeatures={setAiFeatures}
                  musicMood={musicMood}
                  setMusicMood={setMusicMood}
                  transitionType={transitionType}
                  setTransitionType={setTransitionType}
                  captionStyle={captionStyle}
                  setCaptionStyle={setCaptionStyle}
                  addCaptions={addCaptions}
                  setAddCaptions={setAddCaptions}
                />
              </div>
            )}

            {/* Settings Panel */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Video Settings
                </h2>
              </div>
              
              <div className="space-y-6">
                <MusicUploader 
                  musicFile={musicFile}
                  setMusicFile={setMusicFile}
                  musicVolume={musicVolume}
                  setMusicVolume={setMusicVolume}
                  musicMood={musicMood}
                />
                
                {/* Voice Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 flex items-center">
                        <Type className="h-4 w-4 mr-2" />
                        AI Voice Narration
                      </h3>
                      <p className="text-sm text-gray-500">
                        Add natural voice to read your story
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAddVoice(!addVoice)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        addVoice ? 'bg-blue-500' : 'bg-gray-300'
                      } transition-colors`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          addVoice ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {addVoice && (
                    <div className="pl-1">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Language: <span className="font-normal">
                          {language === 'en' ? 'English' : 
                           language === 'bn' ? 'বাংলা (Bangla)' :
                           language === 'hi' ? 'हिंदी (Hindi)' : language}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Caption Settings */}
                {activeTab === 'ai' && addCaptions && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      Caption Style
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {['modern', 'minimal', 'bold', 'classic'].map((style) => (
                        <button
                          key={style}
                          onClick={() => setCaptionStyle(style)}
                          className={`py-2 text-center rounded-lg font-medium text-sm ${
                            captionStyle === style
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Generate Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={generateVideo}
                  disabled={loading || images.length === 0 || !story.trim()}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl ${
                    activeTab === 'ai' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {activeTab === 'ai' ? <Brain className="h-6 w-6" /> : <Wand2 className="h-6 w-6" />}
                      <span>Generate {activeTab === 'ai' ? 'AI Video' : 'Video'}</span>
                    </>
                  )}
                </button>
                
                <div className="mt-4 text-sm text-gray-500 space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Estimated time: {activeTab === 'ai' ? '2-4 minutes' : '1-3 minutes'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Format: MP4 (H.264 + AAC)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Resolution: 1280x720 HD</span>
                  </div>
                  {activeTab === 'ai' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span>AI Features: {Object.values(aiFeatures).filter(v => v).length} enabled</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video Preview */}
            <div>
              <VideoPreview 
                videoUrl={videoUrl || aiVideoUrl}
                videoInfo={videoInfo || aiVideoInfo}
                onRegenerate={handleRegenerate}
                aiMode={activeTab === 'ai'}
              />
              
              {/* Additional Downloads for AI Mode */}
              {activeTab === 'ai' && (videoUrl || aiVideoUrl) && (
                <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <Download className="h-5 w-5 mr-2 text-green-600" />
                    Download Options
                  </h3>
                  <div className="space-y-3">
                    {videoUrl && (
                      <button
                        onClick={() => downloadFile(videoUrl, 'basic_video.mp4')}
                        className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <Video className="h-5 w-5" />
                        <span>Download Basic Video</span>
                      </button>
                    )}
                    {aiVideoUrl && (
                      <button
                        onClick={() => downloadFile(aiVideoUrl, 'ai_enhanced_video.mp4')}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                      >
                        <Brain className="h-5 w-5" />
                        <span>Download AI Video</span>
                      </button>
                    )}
                    {highlightReelUrl && (
                      <button
                        onClick={() => downloadFile(highlightReelUrl, 'highlight_reel.mp4')}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                      >
                        <Zap className="h-5 w-5" />
                        <span>Download Highlights</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {(videoUrl || aiVideoUrl) && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2 text-blue-600" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={handleNewProject}
                    className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Start New Project
                  </button>
                  <button
                    onClick={handleRegenerate}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all"
                  >
                    Regenerate with Same Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Wand2 className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold text-white">AI Video Generator</span>
              </div>
              <p className="text-gray-400">
                Transform your stories into engaging videos with AI-powered animations
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>• Ken Burns Animation</li>
                <li>• AI Voice Narration</li>
                <li>• Multi-language Support</li>
                <li>• Background Music Mixing</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">AI Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>• Whisper Speech-to-Text</li>
                <li>• Auto Scene Detection</li>
                <li>• Smart Transitions</li>
                <li>• Mood-based Music</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Technology</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">FastAPI</span>
                <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">FFmpeg</span>
                <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">Whisper AI</span>
                <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">Python</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} AI Story Video Generator • All processing done locally</p>
            <p className="mt-1">No data stored • Privacy focused • Open source tools</p>
          </div>
        </div>
      </footer>
      
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
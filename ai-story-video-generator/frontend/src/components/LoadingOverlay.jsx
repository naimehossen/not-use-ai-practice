import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, Clock, Film, Volume2, Type, AlertCircle } from 'lucide-react';

const LoadingOverlay = ({ progress = 0, message, currentStep, error = null }) => {
  const [showProgress, setShowProgress] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowProgress(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const steps = [
    { 
      id: 'analyzing', 
      label: 'Analyzing Story', 
      icon: Type,
      description: 'Breaking down your story into scenes'
    },
    { 
      id: 'processing_images', 
      label: 'Processing Images', 
      icon: Film,
      description: 'Applying Ken Burns effect to images'
    },
    { 
      id: 'adding_text', 
      label: 'Adding Text Overlay', 
      icon: Type,
      description: 'Overlaying story text on scenes'
    },
    { 
      id: 'generating_audio', 
      label: 'Generating Audio', 
      icon: Volume2,
      description: 'Creating voice narration'
    },
    { 
      id: 'mixing_audio', 
      label: 'Mixing Audio', 
      icon: Volume2,
      description: 'Mixing voice with background music'
    },
    { 
      id: 'assembling', 
      label: 'Final Assembly', 
      icon: Film,
      description: 'Putting everything together'
    }
  ];

  const getStepStatus = (stepIndex) => {
    const stepProgress = (100 / steps.length) * stepIndex;
    
    if (progress >= stepProgress + (100 / steps.length)) {
      return 'completed';
    } else if (progress >= stepProgress) {
      return 'active';
    }
    return 'pending';
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Processing Failed
            </h3>
            
            <p className="text-gray-600 mb-6">
              {error || 'An error occurred while generating your video.'}
            </p>
            
            <div className="w-full space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center">
          {/* Animated Loader */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin relative" />
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Creating Your Video
          </h3>
          
          {/* Message */}
          <p className="text-gray-600 text-center mb-6">
            {message || 'Processing images, adding animations, and mixing audio...'}
          </p>
          
          {/* Progress Bar */}
          {showProgress && (
            <div className="w-full mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Current Step */}
          {currentStep && (
            <div className="w-full mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-3"></div>
                <div>
                  <p className="font-medium text-blue-900">
                    {steps.find(step => step.id === currentStep)?.label || currentStep}
                  </p>
                  <p className="text-sm text-blue-700">
                    {steps.find(step => step.id === currentStep)?.description || 'Processing...'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Steps Indicators */}
          <div className="w-full mb-6">
            <div className="flex justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    getStepStatus(index) === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : getStepStatus(index) === 'active'
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {getStepStatus(index) === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 text-center max-w-16">
                    {step.label.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Estimated Time */}
          <div className="text-sm text-gray-500 text-center">
            <div className="flex items-center justify-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>Estimated time: 1-3 minutes</span>
            </div>
            <p className="mt-2 text-xs">
              You can continue using the app while video is being generated
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
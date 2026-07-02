import React from 'react';

const StoryInput = ({ story, setStory, language, setLanguage }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Your Story
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 text-sm rounded-full ${
              language === 'en' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('bn')}
            className={`px-3 py-1 text-sm rounded-full ${
              language === 'bn' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            বাংলা
          </button>
        </div>
      </div>
      
      <textarea
        value={story}
        onChange={(e) => setStory(e.target.value)}
        placeholder={language === 'bn' 
          ? "এখানে আপনার গল্প লিখুন..." 
          : "Write your story here..."
        }
        className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
      
      <div className="flex justify-between text-sm text-gray-500 mt-2">
        <span>{language === 'bn' ? 'শব্দ' : 'Words'}: {story.trim().split(/\s+/).filter(Boolean).length}</span>
        <span>{language === 'bn' ? 'অক্ষর' : 'Characters'}: {story.length}</span>
      </div>
    </div>
  );
};

export default StoryInput;
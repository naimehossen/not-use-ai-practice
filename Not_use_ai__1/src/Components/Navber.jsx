import { useState, useEffect } from 'react';

const text = "1971 → 1971";

const CinematicRevealText = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsAnimating(true), 100);
  }, []);

  return (
    <div className="relative inline-block overflow-hidden">
      {/* Main Container with subtle red tint at front edge */}
      <div className="relative">
        {/* ===== LAYER 1: Black Base Background ===== */}
        <div 
          className={`absolute inset-0 bg-black ${
            isAnimating ? 'animate-leftToRightReveal' : 'scale-x-0'
          }`}
          style={{
            clipPath: `polygon(
              0% 12%,
              6% 0%,
              94% 6%,
              100% 20%,
              96% 88%,
              90% 100%,
              8% 96%,
              0% 82%
            )`,
            transformOrigin: 'left',
          }}
        />
        
        {/* ===== LAYER 2: Subtle Red Leading Edge ===== */}
        {/* This creates a faint red tint at the front of the animation */}
        <div 
          className={`absolute inset-0 z-10 pointer-events-none ${
            isAnimating ? 'animate-leftToRightReveal' : 'scale-x-0'
          }`}
          style={{
            background: 'linear-gradient(90deg, rgba(220,38,38,0.15) 0%, transparent 10%)',
            clipPath: `polygon(
              0% 12%,
              6% 0%,
              94% 6%,
              100% 20%,
              96% 88%,
              90% 100%,
              8% 96%,
              0% 82%
            )`,
            transformOrigin: 'left',
            animationDelay: '0.05s',
          }}
        />
        
        {/* ===== LAYER 3: White Line ===== */}
        <div 
          className={`absolute z-20 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent ${
            isAnimating ? 'animate-leftToRightReveal animate-subtlePulse' : 'scale-x-0'
          }`}
          style={{
            top: '12%',
            left: '6%',
            right: '94%',
            width: '88%',
            transformOrigin: 'left',
            animationDelay: '0.1s',
            boxShadow: '0 0 4px rgba(255,255,255,0.4)',
          }}
        />
        
        {/* ===== Text Content ===== */}
        <div className="relative z-30 flex px-10 py-7">
          {text.split("").map((char, index) => {
            const delay = 400 + index * 80;
            
            return (
              <div key={index} className="relative">
                {/* Character with subtle red tint during animation */}
                <span
                  className={`
                    relative inline-block text-5xl font-bold
                    transition-all duration-700
                    ${char === '→' ? 'text-red-300 mx-3' : 'text-white'}
                  `}
                  style={{
                    opacity: isAnimating ? 1 : 0,
                    transform: isAnimating ? 'translateY(0) scale(1)' : 'translateY(25px) scale(0.9)',
                    transition: `all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
                    textShadow: `
                      0 0 12px ${char === '→' ? 'rgba(248, 113, 113, 0.6)' : 'rgba(255, 255, 255, 0.5)'},
                      0 0 24px ${char === '→' ? 'rgba(248, 113, 113, 0.3)' : 'rgba(255, 255, 255, 0.2)'}
                    `,
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                  
                  {/* Subtle red highlight that follows animation */}
                  {isAnimating && (
                    <span 
                      className="absolute -inset-1 rounded-sm opacity-20 pointer-events-none"
                      style={{
                        background: 'linear-gradient(90deg, rgba(220,38,38,0.3) 0%, transparent 100%)',
                        transform: `scaleX(${Math.min(1, delay/1000)})`,
                        transformOrigin: 'left',
                        transition: 'transform 0.5s ease',
                      }}
                    />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CinematicRevealText;
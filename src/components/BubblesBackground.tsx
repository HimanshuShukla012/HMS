import React from 'react';

const WaterBackground = () => {
  return (
    <>
      {/* CSS Styles */}
      <style>
        {`
          @keyframes flow-down {
            0% {
              transform: translateY(-100vh) rotate(var(--rotation, 0deg));
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(var(--rotation, 0deg));
              opacity: 0;
            }
          }

          @keyframes droplet {
            0%, 100% {
              transform: translateY(0px) scale(1);
              opacity: 0.6;
            }
            50% {
              transform: translateY(-20px) scale(1.1);
              opacity: 1;
            }
          }

          @keyframes float-slow {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg); 
            }
            25% { 
              transform: translateY(-15px) rotate(90deg); 
            }
            50% { 
              transform: translateY(-10px) rotate(180deg); 
            }
            75% { 
              transform: translateY(-20px) rotate(270deg); 
            }
          }

          @keyframes wave {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-100px);
            }
          }

          @keyframes wave-reverse {
            0% {
              transform: translateX(-100px);
            }
            100% {
              transform: translateX(0);
            }
          }

          @keyframes ripple {
            0% {
              width: 0;
              height: 0;
              opacity: 0.8;
            }
            50% {
              opacity: 0.4;
            }
            100% {
              width: 100px;
              height: 100px;
              opacity: 0;
            }
          }

          .animate-flow-down {
            animation: flow-down 7s linear infinite;
          }

          .animate-droplet {
            animation: droplet 5s ease-in-out infinite;
          }

          .animate-float-slow {
            animation: float-slow 12s ease-in-out infinite;
          }

          .animate-wave {
            animation: wave 8s ease-in-out infinite;
          }

          .animate-wave-reverse {
            animation: wave-reverse 6s ease-in-out infinite;
          }

          .animate-ripple {
            animation: ripple 6s ease-out infinite;
          }
        `}
      </style>

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Flowing Water Particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-8 bg-gradient-to-b from-blue-300/30 to-blue-500/20 rounded-full animate-flow-down"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 3}s`,
                transform: `rotate(${-15 + Math.random() * 30}deg)`,
              }}
            />
          ))}
        </div>

        {/* Water Droplets */}
        <div className="absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`droplet-${i}`}
              className="absolute w-3 h-4 bg-blue-400/25 rounded-full animate-droplet"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
                clipPath: 'ellipse(50% 60% at 50% 40%)',
              }}
            />
          ))}
        </div>

        {/* Pump Handle Icons */}
        <div className="absolute inset-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`pump-${i}`}
              className="absolute opacity-5 animate-float-slow"
              style={{
                left: `${Math.random() * 90}%`,
                top: `${Math.random() * 90}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${8 + Math.random() * 4}s`,
              }}
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="text-blue-600"
              >
                <path d="M12 2L10 6H8c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-2l-2-4zm0 2.5L13 6h-2l1-1.5zM8 8h8v8H8V8zm2 1v6h4V9h-4z"/>
                <circle cx="12" cy="20" r="2"/>
              </svg>
            </div>
          ))}
        </div>

        {/* Subtle Water Waves */}
        <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
          <svg
            viewBox="0 0 1200 120"
            className="absolute bottom-0 w-full h-full opacity-10"
          >
            <path
              d="M0,60 C300,20 600,100 900,60 C1050,40 1200,80 1200,80 L1200,120 L0,120 Z"
              fill="url(#waveGradient)"
              className="animate-wave"
            />
            <path
              d="M0,80 C300,40 600,120 900,80 C1050,60 1200,100 1200,100 L1200,120 L0,120 Z"
              fill="url(#waveGradient2)"
              className="animate-wave-reverse"
            />
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(29, 78, 216)" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="rgb(22, 101, 52)" stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Water Ripples */}
        <div className="absolute inset-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`ripple-${i}`}
              className="absolute border border-blue-300/20 rounded-full animate-ripple"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default WaterBackground;
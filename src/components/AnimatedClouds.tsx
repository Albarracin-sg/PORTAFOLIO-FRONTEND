import { useEffect, useState } from 'react';

interface Cloud {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

interface AnimatedCloudsProps {
  scrollY: number;
}

export default function AnimatedClouds({ scrollY }: AnimatedCloudsProps) {
  const [clouds, setClouds] = useState<Cloud[]>([]);

  useEffect(() => {
    // Generate initial clouds
    const initialClouds: Cloud[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60 + 10,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.6 + 0.2,
    }));
    setClouds(initialClouds);
  }, []);

  // Calculate cloud visibility and position based on scroll
  const getCloudStyle = (cloud: Cloud) => {
    const scrollEffect = scrollY * 0.5;
    const fadeThreshold = 300;
    const moveThreshold = 200;
    
    let opacity = cloud.opacity;
    let translateX = 0;
    let translateY = 0;

    if (scrollY > moveThreshold) {
      translateX = (scrollY - moveThreshold) * cloud.speed * 2;
      translateY = (scrollY - moveThreshold) * cloud.speed * -0.5;
    }

    if (scrollY > fadeThreshold) {
      opacity = Math.max(0, cloud.opacity - (scrollY - fadeThreshold) * 0.003);
    }

    return {
      left: `${cloud.x}%`,
      top: `${cloud.y}%`,
      width: `${cloud.size * 60}px`,
      height: `${cloud.size * 30}px`,
      opacity,
      transform: `translate(${translateX}px, ${translateY}px) scale(${1 + scrollEffect * 0.001})`,
      transition: 'opacity 0.3s ease-out, transform 0.1s ease-out',
    };
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className="absolute"
          style={getCloudStyle(cloud)}
        >
          {/* Cloud SVG */}
          <svg
            viewBox="0 0 100 50"
            className="w-full h-full filter drop-shadow-sm"
            style={{
              animation: `float-${cloud.id % 3} ${15 + cloud.id}s ease-in-out infinite`,
            }}
          >
            <defs>
              <filter id={`cloud-blur-${cloud.id}`}>
                <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
              </filter>
            </defs>
            <path
              d="M25,40 Q15,30 25,25 Q20,15 35,15 Q45,5 60,15 Q75,10 80,20 Q90,15 85,30 Q95,35 85,40 Z"
              fill="currentColor"
              className="text-white/20 dark:text-white/10"
              filter={`url(#cloud-blur-${cloud.id})`}
            />
            <path
              d="M25,38 Q15,28 25,23 Q20,13 35,13 Q45,3 60,13 Q75,8 80,18 Q90,13 85,28 Q95,33 85,38 Z"
              fill="currentColor"
              className="text-white/30 dark:text-white/15"
            />
          </svg>
        </div>
      ))}
      
      <style>{`
        @keyframes float-0 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(10px, -5px) rotate(1deg); }
          66% { transform: translate(-8px, 3px) rotate(-1deg); }
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-5px, -8px) rotate(0.5deg); }
          50% { transform: translate(8px, 2px) rotate(-0.8deg); }
          75% { transform: translate(-3px, 5px) rotate(0.3deg); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          30% { transform: translate(7px, -3px) rotate(-0.5deg); }
          60% { transform: translate(-5px, -7px) rotate(0.8deg); }
          90% { transform: translate(3px, 4px) rotate(-0.3deg); }
        }
      `}</style>
    </div>
  );
}
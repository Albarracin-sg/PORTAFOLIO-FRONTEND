import { Button } from "./ui/button";
import { ArrowRight, Mail } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";

interface HeroProps {
  translations: any;
  scrollY?: number;
}

export default function Hero({ translations }: HeroProps) {
  const [isImageHovered, setIsImageHovered] = useState(false);

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-gray-900 dark:text-gray-100">
                {translations.hero.greeting}
                <span className="text-violet-600 dark:text-violet-400 block">
                  {translations.hero.role}
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
                {translations.hero.subtitle}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="gap-2"
                onClick={() => {
                  const element = document.getElementById('projects');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                {translations.hero.viewProjects}
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2"
                onClick={() => {
                  const element = document.getElementById('contact');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                <Mail className="h-5 w-5" />
                {translations.hero.contactMe}
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-2xl mb-1 font-semibold bg-gradient-to-r from-violet-600 to-violet-400 dark:from-violet-400 dark:to-violet-300 bg-clip-text text-transparent">3+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {translations.hero.yearsExperience}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1 font-semibold bg-gradient-to-r from-violet-600 to-violet-400 dark:from-violet-400 dark:to-violet-300 bg-clip-text text-transparent">15+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {translations.hero.projectsCompleted}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1 font-semibold bg-gradient-to-r from-violet-600 to-violet-400 dark:from-violet-400 dark:to-violet-300 bg-clip-text text-transparent">5+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {translations.hero.technologies}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div 
                className="w-80 h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-500/30 to-violet-400/20 dark:from-violet-600/40 dark:to-violet-500/30 ring-1 ring-gray-300 dark:ring-gray-600 cursor-pointer transition-all duration-500 hover:ring-2 hover:ring-violet-500 dark:hover:ring-violet-400 hover:shadow-2xl hover:shadow-violet-500/20 group"
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => setIsImageHovered(false)}
              >
                {/* Subtle hover hint */}
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md opacity-70 group-hover:opacity-0 transition-opacity duration-300 z-10">
                  Hover me ✨
                </div>
                {/* Illustration Image */}
                <div 
                  className={`absolute inset-0 transition-all duration-700 transform ${
                    isImageHovered ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
                  }`}
                >
                  <ImageWithFallback 
                    src="https://images.unsplash.com/photo-1666875758376-25755544ba8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjBpbGx1c3RyYXRpb24lMjBjYXJ0b29uJTIwcGVyc29uJTIwY29kaW5nfGVufDF8fHx8MTc1NzIyMDk0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Developer Illustration"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Real Photo */}
                <div 
                  className={`absolute inset-0 transition-all duration-700 transform ${
                    isImageHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                  }`}
                >
                  <ImageWithFallback 
                    src="https://images.unsplash.com/photo-1737574107736-9e02ca5d5387?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBkZXZlbG9wZXIlMjBwb3J0cmFpdCUyMHNvZnR3YXJlJTIwZW5naW5lZXJ8ZW58MXx8fHwxNzU3MjIwOTUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Professional Portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Hover indicator */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-t from-violet-500/20 via-transparent to-transparent transition-opacity duration-300 ${
                    isImageHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
              
              {/* Floating elements */}
              <div 
                className={`absolute -top-4 -right-4 bg-gradient-to-r from-violet-600 to-violet-500 text-white p-3 rounded-xl shadow-lg border border-violet-400/30 transition-all duration-500 transform ${
                  isImageHovered ? 'translate-x-2 -translate-y-2 scale-110' : 'translate-x-0 translate-y-0 scale-100'
                }`}
              >
                <div className="text-sm">React</div>
              </div>
              <div 
                className={`absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 p-3 rounded-xl shadow-lg transition-all duration-500 transform ${
                  isImageHovered ? '-translate-x-2 translate-y-2 scale-110' : 'translate-x-0 translate-y-0 scale-100'
                }`}
              >
                <div className="text-sm">Node.js</div>
              </div>
              
              {/* Additional floating elements that appear on hover */}
              <div 
                className={`absolute top-1/2 -left-8 bg-gradient-to-r from-violet-500 to-violet-600 text-white p-2 rounded-lg shadow-lg border border-violet-400/30 transition-all duration-700 transform ${
                  isImageHovered ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-0 -translate-x-4'
                }`}
              >
                <div className="text-xs">TypeScript</div>
              </div>
              
              <div 
                className={`absolute top-8 right-8 bg-gradient-to-r from-violet-600/90 to-violet-500/90 text-white p-2 rounded-lg shadow-lg border border-violet-400/30 transition-all duration-500 delay-200 transform ${
                  isImageHovered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-0 -translate-y-4'
                }`}
              >
                <div className="text-xs">Nest.js</div>
              </div>
              
              <div 
                className={`absolute bottom-8 right-4 bg-gradient-to-r from-violet-500/80 to-violet-600/80 text-white p-2 rounded-lg shadow-lg border border-violet-400/30 transition-all duration-700 delay-300 transform ${
                  isImageHovered ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 rotate-12'
                }`}
              >
                <div className="text-xs">PostgreSQL</div>
              </div>
              
              {/* Animated glow effect on hover */}
              <div 
                className={`absolute inset-0 rounded-2xl transition-all duration-1000 ${
                  isImageHovered ? 'bg-gradient-to-r from-violet-500/20 to-violet-400/20 blur-xl scale-110' : 'bg-transparent scale-100'
                }`}
                style={{ zIndex: -1 }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
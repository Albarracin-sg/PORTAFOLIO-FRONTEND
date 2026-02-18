import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronUp, Mail, Github, Linkedin, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

const socialLinks = [
  {
    icon: Mail,
    href: 'mailto:juan.perez@example.com',
    label: 'Email',
    color: 'hover:bg-red-500/20 hover:text-red-400',
  },
  {
    icon: Github,
    href: 'https://github.com/juanperez',
    label: 'GitHub',
    color: 'hover:bg-gray-500/20 hover:text-gray-300',
  },
  {
    icon: Linkedin,
    href: 'https://linkedin.com/in/juanperez',
    label: 'LinkedIn',
    color: 'hover:bg-blue-500/20 hover:text-blue-400',
  },
  {
    icon: MessageCircle,
    href: '#contact',
    label: 'Contact',
    color: 'hover:bg-green-500/20 hover:text-green-400',
  },
];

export default function FloatingContactButton() {
  const [isExpanded, setIsExpanded] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const location = useLocation();

  const handleSocialClick = (href: string) => {
    if (href.startsWith('#')) {
      if (location.pathname === '/') {
        const element = document.getElementById(href.substring(1));
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
      // Si no estamos en home, el link debe ser Link to="/#contact" (ver render)
    } else {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className="relative"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Social Icons */}
        <div
          className={`absolute bottom-16 right-0 flex flex-col gap-3 transition-all duration-300 ease-out transform ${
            isExpanded
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
          }`}
        >
          {socialLinks.map((social, index) => {
            const IconComponent = social.icon;
            const isContactLink = social.href === '#contact';
            const contactToHome = isContactLink && location.pathname !== '/';
            if (contactToHome) {
              return (
                <Link
                  key={social.label}
                  to="/#contact"
                  className={`
                  w-12 h-12 rounded-full bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-600
                  flex items-center justify-center text-gray-600 dark:text-gray-400
                  transition-all duration-300 shadow-lg hover:shadow-xl
                  transform hover:scale-110 ${social.color}
                `}
                  title={social.label}
                >
                  <IconComponent className="w-5 h-5" />
                </Link>
              );
            }
            return (
              <button
                key={social.label}
                onClick={() => handleSocialClick(social.href)}
                className={`
                  w-12 h-12 rounded-full bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-600
                  flex items-center justify-center text-gray-600 dark:text-gray-400
                  transition-all duration-300 shadow-lg hover:shadow-xl
                  transform hover:scale-110 ${social.color}
                `}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: isExpanded
                    ? 'float-up 0.3s ease-out forwards'
                    : 'none',
                }}
                title={social.label}
              >
                <IconComponent className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        {/* Main Button */}
        <Button
          onClick={scrollToTop}
          size="icon"
          className={`
            w-14 h-14 rounded-full shadow-lg hover:shadow-xl
            bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 backdrop-blur-sm
            border border-violet-400/30 transition-all duration-300
            transform hover:scale-110 hover:rotate-180
            ${isExpanded ? 'scale-105' : ''}
          `}
        >
          <ChevronUp className="w-6 h-6" />
        </Button>

        {/* Hover hint */}
        <div
          className={`
            absolute -top-12 right-0 bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-600
            px-3 py-1 rounded-md text-sm text-gray-600 dark:text-gray-400 shadow-lg
            transition-all duration-300 whitespace-nowrap
            ${
              isExpanded
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }
          `}
        >
          <span className="block">Scroll to top</span>
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-gray-600"></div>
        </div>
      </div>

      <style>{`
        @keyframes float-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, ChevronUp, Github, Mail, Sparkles, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import FloatingChatbotDialog from './FloatingChatbotDialog';

type PromptKey = 'stack' | 'projects' | 'contact' | null;

// Arc layout: 4 icons spread in a semicircle above-left of the main button
// Main button is at bottom-right. Arc goes from ~150° to ~270° (upper-left quadrant)
// radius ~90px, icons are 48px (h-12 w-12)
const ARC_RADIUS = 108;
const START_ANGLE = 145; // degrees, measured from positive X axis
const END_ANGLE = 255;   // degrees

function getArcPositions(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = START_ANGLE + (i / (count - 1)) * (END_ANGLE - START_ANGLE);
    const rad = (angle * Math.PI) / 180;
    // right and bottom offsets relative to the main button center
    // The main button is at right:0, bottom:0 of its container
    const x = -ARC_RADIUS * Math.cos(rad); // positive = to the left (right offset)
    const y = -ARC_RADIUS * Math.sin(rad); // positive = upward (bottom offset)
    return {
      right: `${x}px`,
      bottom: `${y}px`,
    };
  });
}

export default function FloatingContactButton() {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptKey>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const socialLinks = [
    {
      icon: Mail,
      href: 'mailto:albarrajuan5@gmail.com',
      label: t('floating.actions.email'),
      color: 'hover:bg-red-500/20 hover:text-red-400',
    },
    {
      icon: Github,
      href: 'https://github.com/Albarracin-sg',
      label: t('floating.actions.github'),
      color: 'hover:bg-gray-500/20 hover:text-gray-300',
    },
    {
      icon: Bot,
      href: 'chatbot',
      label: t('floating.actions.chatbot'),
      color: 'hover:bg-green-500/20 hover:text-green-400',
    },
    {
      icon: Linkedin,
      href: '#',
      label: t('floating.actions.linkedin'),
      color: 'hover:bg-blue-500/20 hover:text-blue-400',
    },
  ];

  const arcPositions = getArcPositions(socialLinks.length);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 180);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: none), (pointer: coarse)');

    const updateTouchMode = () => {
      setIsTouchDevice(mediaQuery.matches);
    };

    updateTouchMode();
    mediaQuery.addEventListener('change', updateTouchMode);

    return () => {
      mediaQuery.removeEventListener('change', updateTouchMode);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const location = useLocation();

  const handleSocialClick = (href: string) => {
    if (href === 'chatbot') {
      setIsChatOpen(true);
      setIsExpanded(false);
      return;
    }

    if (href.startsWith('#')) {
      if (location.pathname === '/') {
        const element = document.getElementById(href.substring(1));
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePromptSelect = (prompt: Exclude<PromptKey, null>) => {
    setSelectedPrompt(prompt);
  };

  const scrollToContact = () => {
    if (location.pathname === '/') {
      const element = document.getElementById('contact');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsChatOpen(false);
  };

  const shouldShowActions = isExpanded;

  const handleMainButtonClick = () => {
    if (isTouchDevice) {
      if (!isExpanded) {
        setIsExpanded(true);
        return;
      }

      scrollToTop();
      setIsExpanded(false);
      return;
    }

    scrollToTop();
  };

  return (
    <>
      {/* Overlay for closing on mobile click outside */}
      {isExpanded && isTouchDevice && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Outer wrapper: fixed anchor at bottom-right, overflow visible so arc doesn't clip */}
      <div
        className={`fixed bottom-10 right-4 z-50 transition-all duration-500 ease-out sm:bottom-12 sm:right-6 ${
          isVisible
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-6 opacity-0'
        }`}
        style={{ overflow: 'visible' }}
      >
        {/* Relative container sized to the main button; icons overflow via absolute positioning */}
        <div
          className="relative h-[240px] w-[190px]"
          style={{ overflow: 'visible' }}
          onMouseEnter={() => {
            if (!isTouchDevice) setIsExpanded(true);
          }}
          onMouseLeave={() => {
            if (!isTouchDevice) setIsExpanded(false);
          }}
        >
          {/* Arc Social Icons */}
          {socialLinks.map((social, index) => {
            const IconComponent = social.icon;
            const pos = arcPositions[index];
            return (
              <button
                key={social.label}
                onClick={() => handleSocialClick(social.href)}
                className={`
                  absolute flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-xl dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400
                  ${social.color}
                  ${shouldShowActions ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'}
                `}
                style={{
                  right: pos.right,
                  bottom: index === 0 ? `calc(${pos.bottom} + 16px)` : pos.bottom,
                  transitionDelay: shouldShowActions ? `${index * 40}ms` : `${(socialLinks.length - 1 - index) * 30}ms`,
                  transform: shouldShowActions ? 'scale(1)' : 'scale(0.75)',
                }}
                title={social.label}
                type="button"
              >
                <IconComponent className="h-5 w-5" />
              </button>
            );
          })}

          {/* Main Button */}
          <Button
            onClick={handleMainButtonClick}
            size="icon"
            className={`
              absolute bottom-0 right-0 h-14 w-14 rounded-full border border-violet-400/30 bg-violet-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-violet-700 hover:shadow-xl dark:bg-violet-500 dark:hover:bg-violet-600
              ${shouldShowActions ? 'scale-105' : ''}
            `}
            type="button"
            title={t('floating.scrollTop')}
          >
            {shouldShowActions ? <ChevronUp className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <FloatingChatbotDialog
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        selectedPrompt={selectedPrompt}
        onPromptSelect={handlePromptSelect}
        onScrollToContact={scrollToContact}
        onEmailClick={() => window.open('mailto:albarrajuan5@gmail.com', '_blank', 'noopener,noreferrer')}
      />
    </>
  );
}

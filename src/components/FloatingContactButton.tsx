import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronUp, Github, Mail, Sparkles, Linkedin, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

const BUTTON_SIZE = 56;
const ICON_SIZE   = 48;
const RADIUS      = 110;

// Arco de 180° (izquierda pura) a 270° (arriba puro)
// cos(180)=-1, sin(180)=0  → leftmost icon
// cos(270)=0,  sin(270)=-1 → topmost icon
const START_ANGLE = 180;
const END_ANGLE   = 270;

function getArcPositions(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const t     = count === 1 ? 0.5 : i / (count - 1);
    const angle = START_ANGLE + t * (END_ANGLE - START_ANGLE);
    const rad   = (angle * Math.PI) / 180;

    const dx = Math.cos(rad); // 180°→-1, 270°→0
    const dy = Math.sin(rad); // 180°→0,  270°→-1

    const halfBtn  = BUTTON_SIZE / 2;
    const halfIcon = ICON_SIZE / 2;

    // right: cuánto sale hacia la izquierda. dx es negativo → -dx*R es positivo → right grande = lejos a la izq
    const right  = halfBtn - halfIcon + (-dx * RADIUS);
    // bottom: cuánto sube. dy es negativo en 270° → -dy*R es positivo → bottom grande = sube
    const bottom = halfBtn - halfIcon + (-dy * RADIUS);

    return { right: `${right}px`, bottom: `${bottom}px` };
  });
}

export default function FloatingContactButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
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
      color: 'hover:bg-zinc-500/20 hover:text-white',
    },
    {
      icon: Bot,
      href: 'chatbot',
      label: t('floating.actions.chatbot'),
      color: 'hover:bg-violet-500/20 hover:text-violet-400',
    },
    {
      icon: Linkedin,
      href: 'https://www.linkedin.com/in/juan-camilo-albarracin/',
      label: t('floating.actions.linkedin'),
      color: 'hover:bg-blue-500/20 hover:text-blue-400',
    },
  ];

  const arcPositions = getArcPositions(socialLinks.length);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 180);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const mq     = window.matchMedia('(hover: none), (pointer: coarse)');
    const update = () => setIsTouchDevice(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const location = useLocation();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleSocialClick = (href: string) => {
    if (href === 'chatbot') {
      navigate('/chatbot');
      return;
    }
    if (href.startsWith('#')) {
      if (location.pathname === '/') {
        const el = document.getElementById(href.substring(1));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  const handleMainButtonClick = () => {
    if (isTouchDevice) {
      if (!isExpanded) { setIsExpanded(true); return; }
      scrollToTop();
      setIsExpanded(false);
      return;
    }
    scrollToTop();
  };

  return (
    <>
      {isExpanded && isTouchDevice && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-transparent cursor-default"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div
        className={`fixed bottom-6 right-4 z-50 sm:bottom-12 sm:right-6 transition-all duration-500 ease-out pointer-events-none ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
        style={{ overflow: 'visible' }}
      >
        <div
          className="relative pointer-events-none"
          style={{ width: `${BUTTON_SIZE}px`, height: `${BUTTON_SIZE}px`, overflow: 'visible' }}
          onMouseEnter={() => { if (!isTouchDevice) setIsExpanded(true);  }}
          onMouseLeave={() => { if (!isTouchDevice) setIsExpanded(false); }}
        >
          {/* Área de hit que cubre el cuadrante superior-izquierdo para no perder hover */}
          {isExpanded && !isTouchDevice && (
            <div
              className="absolute pointer-events-auto"
              style={{
                right:  `-${ICON_SIZE / 2}px`,
                bottom: `-${ICON_SIZE / 2}px`,
                width:  `${RADIUS + BUTTON_SIZE}px`,
                height: `${RADIUS + BUTTON_SIZE}px`,
              }}
            />
          )}

          {/* Iconos del arco */}
          {socialLinks.map((social, index) => {
            const Icon = social.icon;
            const pos  = arcPositions[index];
            return (
              <button
                key={social.label}
                onClick={() => handleSocialClick(social.href)}
                title={social.label}
                type="button"
                className={`
                  absolute flex items-center justify-center rounded-full
                  border border-zinc-200 bg-white text-zinc-600 shadow-lg backdrop-blur-sm
                  transition-all duration-300 hover:scale-110 hover:shadow-xl
                  dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400
                  pointer-events-auto cursor-pointer ${social.color}
                  ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                `}
                style={{
                  width:           `${ICON_SIZE}px`,
                  height:          `${ICON_SIZE}px`,
                  right:           pos.right,
                  bottom:          pos.bottom,
                  transform:       isExpanded ? 'scale(1)' : 'scale(0.5)',
                  transitionDelay: isExpanded
                    ? `${index * 45}ms`
                    : `${(socialLinks.length - 1 - index) * 30}ms`,
                  zIndex: 2,
                }}
              >
                <Icon className="size-5" />
              </button>
            );
          })}

          {/* Botón principal */}
          <Button
            onClick={handleMainButtonClick}
            size="icon"
            type="button"
            title={t('floating.scrollTop')}
            className={`
              absolute bottom-0 right-0 rounded-full
              border border-violet-400/30 bg-violet-600 shadow-lg backdrop-blur-sm
              transition-all duration-300 hover:scale-110 hover:bg-violet-700 hover:shadow-xl
              dark:bg-violet-500 dark:hover:bg-violet-600 pointer-events-auto cursor-pointer
              ${isExpanded ? 'scale-105' : ''}
            `}
            style={{ width: `${BUTTON_SIZE}px`, height: `${BUTTON_SIZE}px`, zIndex: 3 }}
          >
            {isExpanded
              ? <ChevronUp className="size-6" />
              : <Sparkles   className="size-6" />
            }
          </Button>
        </div>
      </div>
    </>
  );
}
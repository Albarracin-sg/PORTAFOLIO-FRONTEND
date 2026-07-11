import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Github, Linkedin, Mail, Heart, MapPin, ArrowUpRight, Globe } from "lucide-react";
import logoImg from "@/assets/logo.webp";

interface FooterProps {
  isDark: boolean;
  onPageChange: (page: string) => void;
  currentPage: string;
}

export default function Footer({ isDark, onPageChange, currentPage }: FooterProps) {
  const { t } = useTranslation();
  const [currentYear] = useState(() => new Date().getFullYear());

  const navItems = [
    { key: "home", label: t("nav.home") },
    { key: "about", label: t("nav.about") },
    { key: "projects", label: t("nav.projects") },
    { key: "stats", label: t("nav.stats") },
    { key: "contact", label: t("nav.contact") },
  ];

  const socialLinks = [
    {
      icon: <Github className="size-5" />,
      href: "https://github.com/Albarracin-sg",
      label: "GitHub",
    },
    {
      icon: <Linkedin className="size-5" />,
      href: "https://www.linkedin.com/in/juan-camilo-albarracin/",
      label: "LinkedIn",
    },
  ];

  const scrollToSection = (sectionId: string) => {
    if (sectionId === "stats") {
      onPageChange("stats");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (sectionId === "home") {
      onPageChange("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (currentPage === "stats" || currentPage === "all-projects") {
      onPageChange(sectionId);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      onPageChange(sectionId);
    }
  };

  const activeLogo = isDark ? "/logoNigth.webp" : logoImg;

  return (
    <footer className="relative z-10 bg-background/95 dark:bg-transparent backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:supports-[backdrop-filter]:bg-transparent pt-24 pb-12">
      {/* Top Decor Line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
       <div className="block lg:hidden text-center mb-20 space-y-8">
           <div className="space-y-6">
             <Link to="/" onClick={() => scrollToSection("home")} className="inline-block transition-transform hover:scale-110 duration-300 cursor-pointer">
                <img src={activeLogo} alt="Juan Albarracín" width={80} height={80} loading="lazy" className="h-20 w-auto mx-auto dark:brightness-110" />
             </Link>
             <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
               {t("footer.description")}
             </p>
             <div className="flex gap-4 justify-center">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:text-violet-500 hover:bg-violet-500/10 border border-white/5 transition-all duration-300 cursor-pointer"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
            
            <nav>
              <ul className="flex flex-wrap justify-center gap-4">
                {navItems.map((item) => (
                  <li key={item.key}>
                    <button
                      onClick={() => scrollToSection(item.key)}
                      className={`text-sm transition-colors hover:text-violet-500 cursor-pointer ${
                        currentPage === item.key ? "text-violet-600 dark:text-violet-400 font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="hidden lg:grid lg:grid-cols-4 gap-8 mb-20">
            
            {/* Col 1: Identity */}
            <div className="space-y-8">
              <Link to="/" onClick={() => scrollToSection("home")} className="inline-block transition-transform hover:scale-110 duration-300 cursor-pointer">
                <img src={activeLogo} alt="Juan Albarracín" width={96} height={96} loading="lazy" className="h-24 w-auto dark:brightness-110" />
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {t("footer.description")}
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:text-violet-500 hover:bg-violet-500/10 border border-white/5 transition-all duration-300 cursor-pointer"
                  >
                    {social.icon}
                  </a>
                ))}
             </div>
           </div>
           
           {/* Col 2: Navigation */}
           <div className="space-y-8">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-600 dark:text-violet-400">
                {t("footer.navigation")}
              </h3>
             <ul className="space-y-4">
               {navItems.map((item) => (
                 <li key={item.key}>
                   <button
                     onClick={() => scrollToSection(item.key)}
                     className={`group flex items-center text-sm transition-colors hover:text-violet-500 cursor-pointer ${
                        currentPage === item.key ? "text-violet-600 dark:text-violet-400 font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                     <ArrowUpRight className={`ml-1.5 size-3.5 opacity-0 -translate-y-1 translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 ${currentPage === item.key ? "opacity-100 translate-y-0 translate-x-0" : ""}`} />
                   </button>
                 </li>
               ))}
             </ul>
           </div>
           
           {/* Col 3: Contact */}
           <div className="space-y-8">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-600 dark:text-violet-400">
                {t("contact.info.title")}
              </h3>
             <div className="space-y-6">
               <a href="mailto:albarrajuan5@gmail.com" className="group block space-y-2 cursor-pointer">
                 <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest block">{t("contact.info.directEmail")}</span>
                 <span className="text-sm font-medium text-foreground group-hover:text-violet-500 transition-colors flex items-center gap-2">
                   albarrajuan5@gmail.com
                   <Mail className="size-4 opacity-50" />
                 </span>
               </a>
             </div>
           </div>
           
           {/* Col 4: Status / Location */}
           <div className="space-y-8">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-600 dark:text-violet-400">
                {t("footer.presence")}
              </h3>
             <div className="space-y-6">
               <div className="flex items-start gap-3">
                 <div className="mt-1 p-2 rounded-lg bg-muted/50 border border-white/5">
                   <MapPin className="size-4 text-violet-500" />
                 </div>
                 <div>
                   <span className="text-sm font-medium block">{t("footer.location")}</span>
                   <span className="text-xs text-muted-foreground">{t("footer.localTime")}</span>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <div className="mt-1 p-2 rounded-lg bg-muted/50 border border-white/5">
                   <Globe className="size-4 text-violet-500" />
                 </div>
                 <div>
                   <span className="text-sm font-medium block">{t("footer.worldwide")}</span>
                   <span className="text-xs text-muted-foreground">{t("footer.remoteExpert")}</span>
                 </div>
               </div>
             </div>
           </div>
           
         </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            <span>© {currentYear} Juan Albarracín</span>
            <span className="hidden md:block text-white/10">•</span>
            <span>{t("footer.softwareEngineer")}</span>
          </div>
          
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium group">
            <span>{t("footer.craftedWith")}</span>
            <div className="relative">
              <Heart className="size-3.5 text-red-500 fill-red-500 animate-pulse" />
              <Heart className="absolute inset-0 size-3.5 text-red-500 fill-red-500 animate-ping opacity-30" />
            </div>
            <span>{t("footer.in")} Bogotá</span>
          </div>
        </div>
        
      </div>
    </footer>
  );
}

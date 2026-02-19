import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FileText, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminLoginModal } from "@/features/admin/AdminLoginModal";
import { useAdminAuth } from "@/features/admin/AdminAuthProvider";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  translations: any;
  isDark: boolean;
  onThemeToggle: () => void;
}

export default function Navbar({ currentPage, onPageChange, language, onLanguageChange, translations, isDark, onThemeToggle }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { token } = useAdminAuth();

  const navItems = [
    { key: 'home', label: translations.nav.home },
    { key: 'about', label: translations.nav.about },
    { key: 'projects', label: translations.nav.projects },
    { key: 'stats', label: translations.nav.stats },
    { key: 'contact', label: translations.nav.contact },
  ];

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'stats') {
      onPageChange('stats');
      return;
    }
    
    // If we're currently on separate pages, first go back to main page
    if (currentPage === 'stats' || currentPage === 'all-projects') {
      onPageChange(sectionId);
      // Wait for the page to render, then scroll to the section
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return;
    }
    
    // Normal scroll behavior for sections on main page
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onPageChange(sectionId);
    }
  };

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <h2 className="text-primary">Portfolio</h2>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => scrollToSection(item.key)}
                  className={`px-3 py-2 text-sm transition-colors hover:text-primary ${
                    currentPage === item.key
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
            
            {/* Language Selector */}
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">ES</SelectItem>
                <SelectItem value="en">EN</SelectItem>
              </SelectContent>
            </Select>

             {/* Admin + CV */}
             {token ? (
               <Button variant="outline" className="gap-2" asChild>
                 <Link to="/admin">Admin</Link>
               </Button>
             ) : (
               <AdminLoginModal />
             )}
             <Button variant="outline" className="gap-2">
               <FileText className="h-4 w-4" />
               {translations.nav.downloadCV}
             </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-primary"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    scrollToSection(item.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block px-3 py-2 text-base w-full text-left transition-colors hover:text-primary ${
                    currentPage === item.key
                      ? 'text-primary bg-accent'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              <div className="pt-4 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Theme:</span>
                  <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
                </div>
                
                <Select value={language} onValueChange={onLanguageChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
                
                 {token ? (
                   <Button variant="outline" className="gap-2 w-full" asChild>
                     <Link to="/admin">Admin</Link>
                   </Button>
                 ) : (
                   <AdminLoginModal triggerLabel="Admin" triggerClassName="w-full" />
                 )}
                 <Button variant="outline" className="gap-2 w-full">
                   <FileText className="h-4 w-4" />
                   {translations.nav.downloadCV}
                 </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

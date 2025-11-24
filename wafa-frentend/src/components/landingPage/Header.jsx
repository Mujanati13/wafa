import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import logo from '@/assets/logo.png';

const Header = () => {
  const { t } = useTranslation(['common', 'landing']);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: t('common:nav_home'), href: '#accueil' },
    { label: t('common:nav_about'), href: '#apropos' },
    { label: t('common:nav_pricing'), href: '#tarifs' },
    { label: t('common:nav_contact'), href: '#contact' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b' 
        : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <img 
              src={logo} 
              alt="WAFA Logo" 
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <a 
                key={item.label}
                href={item.href}
                className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA Buttons & Language Switcher */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" asChild>
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                {t('common:log_in')}
              </Link>
            </Button>
            <Button asChild className="shadow-md">
              <Link to="/register">
                <UserPlus className="mr-2 h-4 w-4" />
                {t('common:sign_up')}
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex items-center gap-2 mb-8">
                <img 
                  src={logo} 
                  alt="WAFA Logo" 
                  className="h-10 w-auto object-contain"
                />
              </div>
              
              <Separator className="mb-6" />
              
              <div className="mb-6">
                <LanguageSwitcher />
              </div>
              
              <Separator className="mb-6" />
              
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <a 
                    key={item.label}
                    href={item.href}
                    className="text-base font-medium hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              
              <Separator className="my-6" />
              
              <div className="flex flex-col gap-3">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    {t('common:log_in')}
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t('common:sign_up')}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
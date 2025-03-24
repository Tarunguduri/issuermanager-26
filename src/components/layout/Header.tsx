
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-background/80 backdrop-blur-md shadow-sm border-b border-border/50 py-3' 
          : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex flex-col items-start">
          <Link 
            to="/" 
            className="text-xl font-bold flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] text-gradient-blue-green"
          >
            JAGRUTHI
          </Link>
          <span className="text-xs text-muted-foreground -mt-1">Jagruthi by RE-VIEW</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated && (
            <>
              <Link 
                to={user?.role === 'issuer' ? '/issuer' : '/officer'} 
                className="text-foreground/80 hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              
              <div className="text-sm text-muted-foreground">
                {user?.role === 'issuer' ? 'Citizen' : 'Officer'}: {user?.name}
              </div>
            </>
          )}
          
          <ThemeToggle />
          
          {isAuthenticated ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-1"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/login')}
              className="flex items-center gap-1"
            >
              <User className="h-4 w-4 mr-1" />
              Login
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="relative z-50">
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-md z-40 border-t border-border/30"
          >
            <div className="flex flex-col p-6 gap-4">
              {isAuthenticated ? (
                <>
                  <div className="text-sm font-medium py-2 px-3 bg-secondary rounded-md">
                    {user?.role === 'issuer' ? 'Citizen' : 'Officer'}: {user?.name}
                  </div>
                  
                  <Link
                    to={user?.role === 'issuer' ? '/issuer' : '/officer'}
                    className="py-3 px-4 hover:bg-secondary/50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  <Button
                    variant="outline"
                    className="mt-2 w-full justify-start"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="py-3 px-4 hover:bg-secondary/50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  
                  <Link
                    to="/register"
                    className="py-3 px-4 hover:bg-secondary/50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

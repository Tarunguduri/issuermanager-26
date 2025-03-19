
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GlassmorphicCard from '@/components/ui/GlassmorphicCard';
import { Loader2 } from 'lucide-react';
import { categories, zones, designations } from '@/utils/issues-service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  initialMode?: AuthMode;
  role: 'issuer' | 'officer' | null;
}

const AuthForm: React.FC<AuthFormProps> = ({ initialMode = 'login', role }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    category: '',
    designation: '',
    zone: '',
    phone: '', 
    location: '', 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (mode === 'register') {
        // Validation
        if (formData.password !== formData.confirmPassword) {
          toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        
        if (!formData.name || !formData.email || !formData.password) {
          toast({ title: "Error", description: "All fields are required", variant: "destructive" });
          setIsLoading(false);
          return;
        }

        // Additional validation for officer registration
        if (role === 'officer') {
          if (!formData.category || !formData.designation || !formData.zone) {
            toast({ 
              title: "Error", 
              description: "Category, designation, and zone are required for officer registration", 
              variant: "destructive" 
            });
            setIsLoading(false);
            return;
          }
        }

        // Registration
        await register(
          formData.name, 
          formData.email, 
          formData.password, 
          role || 'issuer',
          role === 'officer' ? formData.category : undefined,
          role === 'officer' ? formData.designation : undefined,
          role === 'officer' ? formData.zone : undefined,
          formData.phone || undefined,
          formData.location || undefined
        );
        toast({ title: "Success", description: "Account created successfully" });
        
        // Navigate after successful registration
        const redirectPath = role === 'issuer' ? '/issuer' : '/officer';
        console.log('Registration successful, redirecting to:', redirectPath);
        navigate(redirectPath, { replace: true });
      } else {
        // Login - using only email and password
        await login(formData.email, formData.password);
        toast({ title: "Success", description: "Logged in successfully" });
        
        // The navigation will be handled by the Login component's useEffect
      }
    } catch (error) {
      console.error(error);
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "An error occurred", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto"
    >
      <GlassmorphicCard className="p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {mode === 'login' ? 'Login' : 'Create Account'}
          {role && <span className="block text-sm font-normal text-muted-foreground mt-1">as {role === 'issuer' ? 'an Issuer' : 'an Officer'}</span>}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="glass-input"
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="glass-input"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="glass-input"
              required
            />
          </div>
          
          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="glass-input"
                  required
                />
              </div>

              {/* Additional fields for officer registration */}
              {role === 'officer' && (
                <div className="space-y-4 mt-6 p-4 border border-primary/20 rounded-md bg-primary/5">
                  <h3 className="text-sm font-medium">Officer Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger className="glass-input">
                        <SelectValue placeholder="Select your category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Select 
                      value={formData.designation} 
                      onValueChange={(value) => handleSelectChange('designation', value)}
                    >
                      <SelectTrigger className="glass-input">
                        <SelectValue placeholder="Select your designation" />
                      </SelectTrigger>
                      <SelectContent>
                        {designations.map(designation => (
                          <SelectItem key={designation} value={designation}>
                            {designation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zone">Zone</Label>
                    <Select 
                      value={formData.zone} 
                      onValueChange={(value) => handleSelectChange('zone', value)}
                    >
                      <SelectTrigger className="glass-input">
                        <SelectValue placeholder="Select your zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map(zone => (
                          <SelectItem key={zone} value={zone}>
                            {zone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </>
          )}
          
          <Button 
            type="submit" 
            className="w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'login' ? 'Logging in...' : 'Creating account...'}
              </>
            ) : (
              <>{mode === 'login' ? 'Login' : 'Create Account'}</>
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-primary hover:underline focus:outline-none"
          >
            {mode === 'login' 
              ? "Don't have an account? Register" 
              : "Already have an account? Login"}
          </button>
        </div>
      </GlassmorphicCard>
    </motion.div>
  );
};

export default AuthForm;

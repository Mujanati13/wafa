import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { loginWithEmail, loginWithGoogle } from '@/services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await loginWithEmail(formData.email, formData.password);
      
      if (result.needsVerification) {
        toast.warning('Vérification requise', {
          description: result.message || 'Veuillez vérifier votre email avant de vous connecter.',
          duration: 5000,
        });
        // Store email for resend functionality
        localStorage.setItem('pendingVerificationEmail', result.email || formData.email);
        navigate('/verify-email-firebase', { state: { email: result.email || formData.email } });
        return;
      }
      
      toast.success('Connexion réussie!', {
        description: 'Vous allez être redirigé vers votre dashboard.',
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard/home');
      }, 1000);
    } catch (error) {
      toast.error('Erreur de connexion', {
        description: error.message || 'Email ou mot de passe incorrect.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      const result = await loginWithGoogle();
      
      toast.success('Connexion réussie avec Google!', {
        description: 'Vous allez être redirigé vers votre dashboard.',
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard/home');
      }, 1000);
    } catch (error) {
      toast.error('Erreur de connexion Google', {
        description: error.message || 'Une erreur est survenue lors de la connexion.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-4 py-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-30 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-100 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-200 rounded-full opacity-25 blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img 
                src={logo} 
                alt="WAFA Logo" 
                className="h-16 w-auto mx-auto object-contain"
              />
            </motion.div>
          </Link>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-primary/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Se connecter</CardTitle>
            <CardDescription>
              Accédez à votre espace d'apprentissage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="votre@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, rememberMe: checked }))
                    }
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Se souvenir de moi
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Mot de passe oublié?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-card px-2 text-xs text-muted-foreground">
                    Ou continuer avec
                  </span>
                </div>
              </div>

              {/* Google Login Button */}
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  disabled={isLoading}
                  onClick={handleGoogleLogin}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <FcGoogle className="mr-2 h-5 w-5" />
                  )}
                  Continuer avec Google
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Separator />
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Pas encore de compte? </span>
              <Link to="/register" className="text-primary hover:underline font-medium">
                S'inscrire
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

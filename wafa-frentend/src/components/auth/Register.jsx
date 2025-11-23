import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Loader2, Check, X } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { registerWithEmail, loginWithGoogle } from '@/services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    newsletter: false
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Erreur', {
        description: 'Les mots de passe ne correspondent pas',
      });
      return;
    }
    
    if (!formData.acceptTerms) {
      toast.error('Erreur', {
        description: 'Veuillez accepter les conditions d\'utilisation',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        newsletter: formData.newsletter
      };
      
      const result = await registerWithEmail(
        formData.email,
        formData.password,
        userData
      );
      
      if (result.needsVerification) {
        toast.success('Inscription réussie!', {
          description: result.message || 'Veuillez vérifier votre email pour activer votre compte.',
          duration: 5000,
        });
        
        // Redirect to Firebase email verification page
        navigate('/verify-email-firebase', { state: { email: formData.email } });
      } else {
        toast.success('Inscription réussie!', {
          description: 'Votre compte a été créé avec succès.',
        });
        
        navigate('/dashboard/home');
      }
    } catch (error) {
      const errorMessage = error.message || 'Une erreur est survenue. Veuillez réessayer.';
      
      // Check if error mentions Google sign-in
      if (errorMessage.includes('Google') || errorMessage.includes('google')) {
        toast.error('Email déjà utilisé', {
          description: errorMessage,
          duration: 6000,
          action: {
            label: 'Connexion Google',
            onClick: () => handleGoogleSignUp()
          }
        });
      } else {
        toast.error('Erreur d\'inscription', {
          description: errorMessage,
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    
    try {
      const result = await loginWithGoogle();
      
      toast.success('Inscription réussie avec Google!', {
        description: 'Vous allez être redirigé vers votre dashboard.',
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard/home');
      }, 1000);
    } catch (error) {
      toast.error('Erreur d\'inscription Google', {
        description: error.message || 'Une erreur est survenue lors de l\'inscription.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Faible';
    if (passwordStrength <= 3) return 'Moyen';
    return 'Fort';
  };

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: 'Au moins 8 caractères' },
    { met: /[A-Z]/.test(formData.password), text: 'Une lettre majuscule' },
    { met: /[a-z]/.test(formData.password), text: 'Une lettre minuscule' },
    { met: /[0-9]/.test(formData.password), text: 'Un chiffre' },
    { met: /[^A-Za-z0-9]/.test(formData.password), text: 'Un caractère spécial' },
  ];

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
        className="relative z-10 w-full max-w-2xl"
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

        {/* Register Card */}
        <Card className="shadow-2xl border-primary/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
            <CardDescription>
              Rejoignez WAFA et commencez votre parcours d'apprentissage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Jean"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Dupont"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

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
                
                {/* Password Strength */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Force du mot de passe: <span className={passwordStrength <= 2 ? 'text-red-500' : passwordStrength <= 3 ? 'text-yellow-500' : 'text-green-500'}>
                          {getPasswordStrengthText()}
                        </span>
                      </span>
                    </div>
                    <Progress value={passwordStrength * 20} className="h-2" />
                    
                    {/* Requirements */}
                    <div className="space-y-1 text-xs">
                      {passwordRequirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {req.met ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              {/* Terms & Newsletter */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, acceptTerms: checked }))
                    }
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <Label
                    htmlFor="acceptTerms"
                    className="text-sm font-normal cursor-pointer leading-tight"
                  >
                    J'accepte les{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      conditions d'utilisation
                    </Link>
                    {' '}et la{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      politique de confidentialité
                    </Link>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={formData.newsletter}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, newsletter: checked }))
                    }
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="newsletter"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Recevoir les actualités et offres par email
                  </Label>
                </div>
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inscription...
                  </>
                ) : (
                  'S\'inscrire'
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

              {/* Google Sign Up Button */}
              <Button 
                variant="outline" 
                type="button" 
                disabled={isLoading}
                onClick={handleGoogleSignUp}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <FcGoogle className="mr-2 h-5 w-5" />
                )}
                S'inscrire avec Google
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Separator />
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Vous avez déjà un compte? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                Se connecter
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

export default Register;

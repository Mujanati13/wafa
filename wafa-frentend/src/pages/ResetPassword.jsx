import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { verifyPasswordResetCodeService, confirmPasswordResetService } from '@/services/authService';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const oobCode = searchParams.get('oobCode'); // Firebase uses oobCode for action codes

  // Verify the reset code on component mount
  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setError('Code de réinitialisation manquant. Le lien est invalide.');
        setIsVerifying(false);
        return;
      }

      try {
        const result = await verifyPasswordResetCodeService(oobCode);
        if (result.success) {
          setUserEmail(result.email);
          setIsVerifying(false);
        }
      } catch (err) {
        setError(err.message || 'Le lien de réinitialisation est invalide ou a expiré.');
        setIsVerifying(false);
      }
    };

    verifyCode();
  }, [oobCode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 25, label: 'Faible', color: 'bg-red-500' };
    if (password.length < 10) return { strength: 50, label: 'Moyen', color: 'bg-yellow-500' };
    if (password.length < 14) return { strength: 75, label: 'Bon', color: 'bg-blue-500' };
    return { strength: 100, label: 'Excellent', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      toast.error('Mot de passe trop court', {
        description: 'Le mot de passe doit contenir au moins 6 caractères',
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      toast.error('Erreur de confirmation', {
        description: 'Les mots de passe ne correspondent pas',
      });
      return;
    }

    if (!oobCode) {
      setError('Code de réinitialisation manquant');
      return;
    }

    setIsLoading(true);

    try {
      const result = await confirmPasswordResetService(oobCode, formData.newPassword);

      if (result.success) {
        setIsSuccess(true);
        toast.success('Succès!', {
          description: 'Votre mot de passe a été réinitialisé avec succès.',
          duration: 3000,
        });
        
        setTimeout(() => {
          navigate('/login?reset=success');
        }, 3000);
      }
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la réinitialisation du mot de passe';
      setError(errorMessage);
      toast.error('Erreur', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while verifying code
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-4 py-8">
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90 w-full max-w-md">
          <CardContent className="p-12 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600 font-medium">Vérification du lien...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
            <div className="flex justify-center pt-8">
              <img src={logo} alt="Logo" className="h-16 w-auto" />
            </div>
            <CardContent className="p-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
              >
                Mot de passe réinitialisé ! 🎉
              </motion.h2>
              <p className="text-gray-600">
                Votre mot de passe a été changé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 ml-2">
                  Redirection vers la page de connexion...
                </AlertDescription>
              </Alert>
              <Button 
                asChild 
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:opacity-90 text-white"
              >
                <Link to="/login">
                  Se connecter maintenant
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error && !oobCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
            <div className="flex justify-center pt-8">
              <img src={logo} alt="Logo" className="h-16 w-auto" />
            </div>
            <CardContent className="p-8 text-center space-y-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center mx-auto">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Lien invalide ou expiré
              </h2>
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button asChild className="w-full">
                <Link to="/forgot-password">
                  Demander un nouveau lien
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-4 py-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
          {/* Logo */}
          <div className="flex justify-center pt-8 pb-2">
            <img src={logo} alt="Logo" className="h-16 w-auto" />
          </div>

          <CardHeader className="text-center space-y-2 pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-2"
            >
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Nouveau mot de passe
            </CardTitle>
            <CardDescription className="text-gray-600">
              {userEmail && `Pour ${userEmail}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength.strength}%` }}
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      />
                    </div>
                    <p className={`text-xs font-medium ${
                      passwordStrength.strength < 50 ? 'text-red-600' :
                      passwordStrength.strength < 75 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      Force: {passwordStrength.label}
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Minimum 6 caractères recommandés
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {formData.confirmPassword && (
                  <p className={`text-xs font-medium ${
                    formData.newPassword === formData.confirmPassword
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {formData.newPassword === formData.confirmPassword ? (
                      <>✓ Les mots de passe correspondent</>
                    ) : (
                      <>✗ Les mots de passe ne correspondent pas</>
                    )}
                  </p>
                )}
              </div>

              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading || formData.newPassword !== formData.confirmPassword}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:opacity-90 text-white font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Réinitialisation en cours...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Réinitialiser le mot de passe
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  ← Retour à la connexion
                </button>
              </div>
            </form>
            <div className="pt-4 border-t mt-4">
              <p className="text-xs text-center text-gray-500">
                Assurez-vous de choisir un mot de passe fort et unique
              </p>
            </div>
          </CardContent>
        </Card>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-gray-600"
        >
          <p>Besoin d'aide ? Contactez notre support</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;

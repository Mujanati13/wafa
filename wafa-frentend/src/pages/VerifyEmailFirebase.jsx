import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';
import { auth } from '@/config/firebase';
import { sendEmailVerification, applyActionCode } from 'firebase/auth';

const VerifyEmailFirebase = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // checking, pending, success, error
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const checkVerificationStatus = async () => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        setStatus('error');
        setMessage('Aucun utilisateur connecté. Veuillez vous inscrire.');
        return;
      }

      setUserEmail(user.email);

      // Reload user to get latest verification status
      await user.reload();

      if (user.emailVerified) {
        setStatus('success');
        setMessage('✅ Votre email a été vérifié avec succès!');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login?verified=true');
        }, 2000);
      } else {
        setStatus('pending');
        setMessage(`Un email de vérification a été envoyé à ${user.email}. Veuillez vérifier votre boîte de réception et cliquer sur le lien.`);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      setStatus('error');
      setMessage('Erreur lors de la vérification du statut.');
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    
    try {
      const user = auth.currentUser;
      
      if (!user) {
        toast.error('Erreur', {
          description: 'Aucun utilisateur connecté. Veuillez vous inscrire à nouveau.',
        });
        return;
      }

      // Configure action code settings
      const actionCodeSettings = {
        url: `${window.location.origin}/login?verified=true`,
        handleCodeInApp: false,
      };

      await sendEmailVerification(user, actionCodeSettings);

      toast.success('Email envoyé!', {
        description: 'Un nouveau lien de vérification a été envoyé à votre boîte de réception.',
        duration: 5000,
      });
      
      // Set cooldown period (60 seconds)
      setCanResend(false);
      setCountdown(60);
    } catch (error) {
      console.error('Error resending verification:', error);
      
      let errorMessage = 'Impossible de renvoyer l\'email. Veuillez réessayer.';
      
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Veuillez attendre quelques minutes avant de réessayer.';
      }
      
      toast.error('Erreur', {
        description: errorMessage,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckAgain = async () => {
    setStatus('checking');
    setMessage('Vérification du statut...');
    await checkVerificationStatus();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'pending':
        return <Mail className="h-16 w-16 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'from-green-500 to-emerald-500';
      case 'error':
        return 'from-red-500 to-rose-500';
      case 'pending':
        return 'from-blue-500 to-teal-500';
      default:
        return 'from-blue-500 to-teal-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-4 py-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
          {/* Logo */}
          <div className="flex justify-center pt-8 pb-4">
            <img src={logo} alt="Logo" className="h-16 w-auto" />
          </div>

          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              {getStatusIcon()}
            </motion.div>

            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              {status === 'checking' && 'Vérification...'}
              {status === 'pending' && 'Vérification de l\'email'}
              {status === 'success' && 'Email vérifié!'}
              {status === 'error' && 'Erreur de vérification'}
            </CardTitle>

            <CardDescription className="text-gray-600 mt-2">
              {message}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {status === 'pending' && (
              <>
                <Alert className="border-blue-200 bg-blue-50">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 ml-2">
                    Consultez votre boîte de réception (y compris les spams) et cliquez sur le lien de vérification.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Button
                    onClick={handleCheckAgain}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    J'ai vérifié mon email
                  </Button>

                  <Button
                    onClick={handleResendEmail}
                    disabled={!canResend || isResending}
                    variant="outline"
                    className="w-full"
                  >
                    {isResending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="mr-2 h-4 w-4" />
                    )}
                    {countdown > 0
                      ? `Renvoyer dans ${countdown}s`
                      : 'Renvoyer l\'email'}
                  </Button>
                </div>

                {userEmail && (
                  <p className="text-sm text-gray-500 text-center">
                    Email envoyé à: <span className="font-medium text-gray-700">{userEmail}</span>
                  </p>
                )}
              </>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-4"
              >
                <p className="text-green-600 font-medium">
                  Redirection vers la page de connexion...
                </p>
                <Button
                  onClick={() => navigate('/login')}
                  className={`w-full bg-gradient-to-r ${getStatusColor()} hover:opacity-90 text-white`}
                >
                  Se connecter maintenant
                </Button>
              </motion.div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/register')}
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:opacity-90 text-white"
                >
                  Retour à l'inscription
                </Button>
              </div>
            )}

            {/* Back to Login Link */}
            <div className="text-center pt-4">
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                ← Retour à la connexion
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-gray-600"
        >
          <p>Vous ne trouvez pas l'email?</p>
          <p className="mt-1">Vérifiez votre dossier spam ou courrier indésirable</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailFirebase;

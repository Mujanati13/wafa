import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

/**
 * ContentWarningModal - Global alert for user uploads
 * Displays warning about content policy before uploads
 * Used for: Profile Picture, Explanations, Reports
 */
const ContentWarningModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  uploadType = 'content', // 'profile', 'explanation', 'report'
  children,
}) => {
  const { t } = useTranslation(['common', 'dashboard']);
  const [accepted, setAccepted] = React.useState(false);

  const handleConfirm = () => {
    if (accepted) {
      onConfirm?.();
      setAccepted(false);
    }
  };

  const handleClose = () => {
    setAccepted(false);
    onClose?.();
  };

  const getUploadTypeLabel = () => {
    switch (uploadType) {
      case 'profile':
        return t('common:profile_picture', 'photo de profil');
      case 'explanation':
        return t('common:explanation', 'explication');
      case 'report':
        return t('common:report', 'signalement');
      default:
        return t('common:content', 'contenu');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <DialogTitle className="text-xl">
              {t('common:content_warning', 'Avertissement de contenu')}
            </DialogTitle>
          </div>
          <DialogDescription asChild>
            <div className="space-y-4">
              <p className="text-base text-foreground">
                {t('common:upload_warning_intro', `Avant de télécharger votre ${getUploadTypeLabel()}, veuillez lire attentivement:`)}
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                <p className="font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t('common:prohibited_content', 'Contenu strictement interdit:')}
                </p>
                <ul className="text-sm text-red-600 space-y-2 ml-6 list-disc">
                  <li>{t('common:no_illegal', 'Contenu illégal ou contraire à la loi')}</li>
                  <li>{t('common:no_pornographic', 'Contenu pornographique ou à caractère sexuel')}</li>
                  <li>{t('common:no_violent', 'Contenu violent ou incitant à la haine')}</li>
                  <li>{t('common:no_offtopic', 'Contenu hors-sujet ou non pertinent')}</li>
                  <li>{t('common:no_copyright', 'Contenu violant les droits d\'auteur')}</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 font-medium">
                  ⚠️ {t('common:account_deletion_risk', 'Le non-respect de ces règles entraînera la suppression immédiate de votre compte sans préavis.')}
                </p>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Checkbox 
                  id="accept-terms"
                  checked={accepted}
                  onCheckedChange={setAccepted}
                />
                <Label 
                  htmlFor="accept-terms" 
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  {t('common:accept_content_policy', "J'ai lu et j'accepte la politique de contenu. Je comprends que mon compte peut être supprimé en cas de violation.")}
                </Label>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            {t('common:cancel', 'Annuler')}
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!accepted}
            className="w-full sm:w-auto gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            {t('common:confirm_upload', 'Confirmer et continuer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContentWarningModal;

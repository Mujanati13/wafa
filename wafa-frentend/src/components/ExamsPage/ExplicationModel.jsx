import { X, Sparkles, Users, Plus, Bot, User, Send, AlertCircle, Upload, FileImage, FileText, Loader2, TriangleAlert } from "lucide-react";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/lib/utils";

const MAX_EXPLANATIONS = 3;
const MAX_IMAGES = 5;
const MAX_PDF = 1;

const ExplicationModel = ({ question, setShowExplanation }) => {
  const [activeTab, setActiveTab] = useState("ai"); // 'ai' or 'user'
  const [activeExplanationIndex, setActiveExplanationIndex] = useState(0);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]); // Max 5 images
  const [uploadedPdf, setUploadedPdf] = useState(null); // Max 1 PDF
  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  
  // State for fetched user explanations
  const [fetchedExplanations, setFetchedExplanations] = useState([]);
  const [loadingExplanations, setLoadingExplanations] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Fetch user explanations from API
  useEffect(() => {
    const fetchUserExplanations = async () => {
      if (!question?._id) return;
      
      setLoadingExplanations(true);
      try {
        const response = await api.get(`/explanations/question/${question._id}`);
        const explanations = response.data?.data || [];
        // Filter to only approved explanations and map to proper format
        const approvedExplanations = explanations
          .filter(e => e.status === 'approved')
          .map(e => ({
            id: e._id,
            text: e.contentText || "",
            author: e.userId?.name || e.userId?.email || "Étudiant anonyme",
            verified: true,
            images: e.imageUrls || (e.imageUrl ? [e.imageUrl] : []),
            pdfUrl: e.pdfUrl,
            title: e.title
          }));
        setFetchedExplanations(approvedExplanations);
      } catch (error) {
        console.error("Error fetching explanations:", error);
      } finally {
        setLoadingExplanations(false);
      }
    };
    
    fetchUserExplanations();
  }, [question?._id]);

  // Combine fetched explanations with any from question prop
  const userExplanations = useMemo(() => {
    const propExplanations = question?.userExplanations || [];
    // Merge and deduplicate
    const allExplanations = [...fetchedExplanations];
    propExplanations.forEach(e => {
      if (!allExplanations.find(fe => fe.id === e.id)) {
        allExplanations.push(e);
      }
    });
    return allExplanations.slice(0, MAX_EXPLANATIONS);
  }, [question?.userExplanations, fetchedExplanations]);

  // Check if user can add more explanations
  const canAddExplanation = userExplanations.length < MAX_EXPLANATIONS;
  const remainingSlots = MAX_EXPLANATIONS - userExplanations.length;

  // AI explanation (always slot 0)
  const aiExplanation = {
    text: question?.explanation || null,
    images: (() => {
      const images = Array.isArray(question?.explanationImages)
        ? question.explanationImages
        : [];
      if (!images.length && question?.explanationImage) {
        images.push(question.explanationImage);
      }
      return images;
    })(),
    title: question?.explicationTitle || "Explication IA"
  };

  const hasAIExplanation = aiExplanation.text || aiExplanation.images.length > 0;

  const handleSubmitClick = () => {
    // At least one content type required: text, images, or PDF
    const hasText = submissionText.trim().length > 0;
    const hasImages = uploadedImages.length > 0;
    const hasPdf = uploadedPdf !== null;
    
    if (!hasText && !hasImages && !hasPdf) {
      toast.warning("Veuillez ajouter du texte, des images ou un PDF");
      return;
    }

    setShowWarning(true);
  };

  const handleSubmitExplanation = async () => {
    setShowWarning(false);
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('contentText', submissionText);
      formData.append('questionId', question._id);

      // Add images (max 5)
      uploadedImages.forEach((img, idx) => {
        formData.append('images', img);
      });

      // Add PDF (max 1)
      if (uploadedPdf) {
        formData.append('pdf', uploadedPdf);
      }

      await api.post('/explanations/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success("Votre explication a été soumise pour révision !", {
        description: "Elle sera publiée après validation par notre équipe. Vous gagnerez 1 point bleu si approuvée!"
      });
      setSubmissionText("");
      setUploadedImages([]);
      setUploadedPdf(null);
      setShowSubmitForm(false);
    } catch (error) {
      console.error("Error submitting explanation:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la soumission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter(file => file.type.startsWith('image/'));

    if (validImages.length === 0) {
      toast.error("Seuls les fichiers image sont acceptés");
      return;
    }

    const remainingSlots = MAX_IMAGES - uploadedImages.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images autorisées`);
      return;
    }

    const toAdd = validImages.slice(0, remainingSlots);

    // Check file sizes (max 5MB each)
    for (const file of toAdd) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} dépasse 5 Mo`);
        return;
      }
    }

    setUploadedImages(prev => [...prev, ...toAdd]);
    toast.success(`${toAdd.length} image(s) ajoutée(s)`);
    e.target.value = ''; // Reset input
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("Seuls les fichiers PDF sont acceptés");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le PDF ne doit pas dépasser 10 Mo");
      return;
    }

    setUploadedPdf(file);
    toast.success(`PDF ajouté: ${file.name}`);
    e.target.value = ''; // Reset input
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const currentUserExplanation = userExplanations[activeExplanationIndex];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Explications
            </h3>
            <Badge variant="outline" className="ml-2">
              {(hasAIExplanation ? 1 : 0) + userExplanations.length} / {MAX_EXPLANATIONS + 1}
            </Badge>
          </div>
          <button
            onClick={() => setShowExplanation(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Main Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${activeTab === "ai"
              ? "border-b-2 border-blue-600 text-blue-700 bg-blue-50/50"
              : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <Bot className="h-4 w-4" />
            Explication IA
            {hasAIExplanation && (
              <span className="w-2 h-2 rounded-full bg-green-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("user")}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${activeTab === "user"
              ? "border-b-2 border-purple-600 text-purple-700 bg-purple-50/50"
              : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <Users className="h-4 w-4" />
            Explications Communauté
            {userExplanations.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {userExplanations.length}
              </Badge>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "ai" ? (
            // AI Explanation Tab
            <div className="space-y-4">
              {hasAIExplanation ? (
                <>
                  {/* AI Images */}
                  {aiExplanation.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {aiExplanation.images.map((src, idx) => (
                        <button
                          key={`${src}-${idx}`}
                          type="button"
                          className="group relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                          onClick={() => window.open(src, "_blank", "noopener,noreferrer")}
                          title="Ouvrir l'image"
                        >
                          <img
                            src={src}
                            alt={`explication ${idx + 1}`}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* AI Text */}
                  {aiExplanation.text && (
                    <div className="border border-gray-200 rounded-lg bg-gradient-to-br from-blue-50/50 to-white p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Généré par IA</span>
                      </div>
                      <p className="text-gray-800 text-base whitespace-pre-line leading-relaxed">
                        {aiExplanation.text}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">
                    Pas d'explication IA disponible
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Notre système génère automatiquement des explications.<br />
                    Celle-ci sera bientôt disponible.
                  </p>
                </div>
              )}
            </div>
          ) : (
            // User Explanations Tab
            <div className="space-y-4">
              {/* User Explanation Pills */}
              {userExplanations.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {userExplanations.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveExplanationIndex(idx)}
                      className={`px-4 py-1.5 rounded-full font-medium transition-all ${activeExplanationIndex === idx
                        ? "bg-purple-100 text-purple-700 border-2 border-purple-300"
                        : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                        }`}
                    >
                      <User className="inline h-3 w-3 mr-1" />
                      Explication {idx + 1}
                    </button>
                  ))}

                  {/* Add button if slots available */}
                  {canAddExplanation && (
                    <button
                      onClick={() => setShowSubmitForm(true)}
                      className="px-4 py-1.5 rounded-full bg-green-50 text-green-700 font-medium border border-green-200 hover:bg-green-100 transition-all flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Ajouter ({remainingSlots} restant{remainingSlots > 1 ? 's' : ''})
                    </button>
                  )}
                </div>
              )}

              {/* Loading state */}
              {loadingExplanations && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600">Chargement des explications...</span>
                </div>
              )}

              {/* Current User Explanation */}
              {!loadingExplanations && currentUserExplanation ? (
                <div className="border border-gray-200 rounded-lg bg-gradient-to-br from-purple-50/50 to-white p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">
                      {currentUserExplanation.author || "Étudiant anonyme"}
                    </span>
                    {currentUserExplanation.verified && (
                      <Badge className="bg-green-100 text-green-700 text-xs">Vérifié</Badge>
                    )}
                  </div>
                  <p className="text-gray-800 text-base whitespace-pre-line leading-relaxed">
                    {currentUserExplanation.text}
                  </p>
                  
                  {/* Display images if any */}
                  {currentUserExplanation.images?.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                      {currentUserExplanation.images.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="group relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                          onClick={() => window.open(
                            imgUrl.startsWith('http') ? imgUrl : `${import.meta.env.VITE_API_URL || ''}${imgUrl}`,
                            "_blank", "noopener,noreferrer"
                          )}
                          title="Ouvrir l'image"
                        >
                          <img
                            src={imgUrl.startsWith('http') ? imgUrl : `${import.meta.env.VITE_API_URL || ''}${imgUrl}`}
                            alt={`Image ${idx + 1}`}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Display PDF if any */}
                  {currentUserExplanation.pdfUrl && (
                    <a
                      href={currentUserExplanation.pdfUrl.startsWith('http') 
                        ? currentUserExplanation.pdfUrl 
                        : `${import.meta.env.VITE_API_URL || ''}${currentUserExplanation.pdfUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm"
                    >
                      <FileText className="h-4 w-4" />
                      Voir le PDF
                    </a>
                  )}
                </div>
              ) : !loadingExplanations && userExplanations.length === 0 ? (
                // Empty state - encourage submission
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-purple-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">
                    Aucune explication de la communauté
                  </h4>
                  <p className="text-gray-500 text-sm mb-4">
                    Soyez le premier à partager votre compréhension !
                  </p>
                  <Button
                    onClick={() => setShowSubmitForm(true)}
                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                    Proposer une explication
                  </Button>
                </div>
              ) : null}

              {/* Submit Form */}
              {showSubmitForm && (
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 bg-purple-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">
                      Proposer une explication (texte, images ou PDF - au moins un requis)
                    </span>
                  </div>
                  <Textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Votre explication (optionnel). Vous pouvez aussi ajouter des images ou un PDF."
                    className="min-h-[120px] mb-3"
                  />

                  {/* File Upload Section */}
                  <div className="mb-3 space-y-3">
                    {/* Hidden file inputs */}
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <input
                      type="file"
                      ref={pdfInputRef}
                      onChange={handlePdfUpload}
                      accept=".pdf"
                      className="hidden"
                    />

                    {/* Images Section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">
                          Images ({uploadedImages.length}/{MAX_IMAGES})
                        </span>
                        {uploadedImages.length < MAX_IMAGES && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => imageInputRef.current?.click()}
                            className="gap-1 h-7 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                          >
                            <FileImage className="h-3 w-3" />
                            Ajouter
                          </Button>
                        )}
                      </div>
                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-5 gap-2">
                          {uploadedImages.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-purple-200 bg-white">
                              <img
                                src={URL.createObjectURL(img)}
                                alt={`Upload ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* PDF Section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">
                          PDF ({uploadedPdf ? 1 : 0}/{MAX_PDF})
                        </span>
                        {!uploadedPdf && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pdfInputRef.current?.click()}
                            className="gap-1 h-7 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                          >
                            <FileText className="h-3 w-3" />
                            Ajouter PDF
                          </Button>
                        )}
                      </div>
                      {uploadedPdf && (
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-purple-200">
                          <FileText className="h-5 w-5 text-purple-600" />
                          <span className="flex-1 text-sm text-gray-700 truncate">{uploadedPdf.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setUploadedPdf(null)}
                            className="text-red-500 hover:text-red-600 h-7 w-7 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowSubmitForm(false);
                        setUploadedImages([]);
                        setUploadedPdf(null);
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSubmitClick}
                      disabled={isSubmitting || (!submissionText.trim() && uploadedImages.length === 0 && !uploadedPdf)}
                      className="gap-2 bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? "Envoi..." : "Soumettre"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Correct Answers Footer */}
        {question?.options && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-600">Réponses correctes:</span>
              <div className="flex gap-1">
                {question.options.map((opt, idx) =>
                  opt.isCorrect && (
                    <Badge key={idx} className="bg-emerald-100 text-emerald-700">
                      {String.fromCharCode(65 + idx)}
                    </Badge>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Warning Confirmation Dialog */}
        {showWarning && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
            <div
              className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Red Header */}
              <div className="bg-red-500 px-6 py-6 relative">
                <button
                  onClick={() => setShowWarning(false)}
                  className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex flex-col items-center text-white">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3">
                    <TriangleAlert className="h-10 w-10 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold">WARNING!</h3>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5 text-center">
                <p className="text-gray-700 font-medium mb-3">
                  Aucun contenu (text, image, pdf ...)
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  - illégal qui est n'est pas bien (pornographique ...) ou les chose qui est hors sujet, n'est autorisé.
                </p>
                <p className="text-red-600 font-semibold text-sm">
                  Le non-respect de cette règle entraînera la suppression définitive de votre compte.
                </p>
              </div>

              {/* Buttons */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={handleSubmitExplanation}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 disabled:bg-gray-300 transition-colors"
                >
                  {isSubmitting ? "Envoi..." : "ok"}
                </button>
                <button
                  onClick={() => setShowWarning(false)}
                  className="flex-1 py-2.5 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplicationModel;

import { X, Sparkles, Users, Plus, Bot, User, Send, AlertCircle, Upload, FileImage, FileText } from "lucide-react";
import React, { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const MAX_EXPLANATIONS = 3;

const ExplicationModel = ({ question, setShowExplanation }) => {
  const [activeTab, setActiveTab] = useState("ai"); // 'ai' or 'user'
  const [activeExplanationIndex, setActiveExplanationIndex] = useState(0);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Get user explanations (limit to 3)
  const userExplanations = useMemo(() => {
    const explanations = question?.userExplanations || [];
    return explanations.slice(0, MAX_EXPLANATIONS);
  }, [question]);

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

  const handleSubmitExplanation = async () => {
    if (!submissionText.trim()) {
      toast.warning("Veuillez entrer une explication");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: API call to submit explanation with file
      // const formData = new FormData();
      // formData.append('text', submissionText);
      // if (uploadedFile) formData.append('file', uploadedFile);
      // await api.post(`/explanations/${question._id}`, formData);
      toast.success("Votre explication a été soumise pour révision !", {
        description: "Elle sera publiée après validation par notre équipe. Vous gagnerez 1 point bleu si approuvée!"
      });
      setSubmissionText("");
      setUploadedFile(null);
      setShowSubmitForm(false);
    } catch (error) {
      toast.error("Erreur lors de la soumission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type (image or PDF)
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error("Seuls les images et PDF sont acceptés");
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le fichier ne doit pas dépasser 5 Mo");
        return;
      }
      setUploadedFile(file);
      toast.success(`Fichier ajouté: ${file.name}`);
    }
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

              {/* Current User Explanation */}
              {currentUserExplanation ? (
                <div className="border border-gray-200 rounded-lg bg-gradient-to-br from-purple-50/50 to-white p-4">
                  <div className="flex items-center gap-2 mb-3">
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
                </div>
              ) : userExplanations.length === 0 ? (
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
                      Proposer une explication (sera revue avant publication)
                    </span>
                  </div>
                  <Textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Votre explication doit contenir les explications de tous les choix: pourquoi il est faux et pourquoi il est vrais, à partir des cours magistraux."
                    className="min-h-[120px] mb-3"
                  />

                  {/* File Upload Section */}
                  <div className="mb-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*,.pdf"
                      className="hidden"
                    />

                    {uploadedFile ? (
                      <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-purple-200">
                        {uploadedFile.type.startsWith('image/') ? (
                          <FileImage className="h-5 w-5 text-purple-600" />
                        ) : (
                          <FileText className="h-5 w-5 text-purple-600" />
                        )}
                        <span className="flex-1 text-sm text-gray-700 truncate">{uploadedFile.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setUploadedFile(null)}
                          className="text-red-500 hover:text-red-600 h-7 w-7 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <Upload className="h-4 w-4" />
                        Image ou PDF
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowSubmitForm(false);
                        setUploadedFile(null);
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSubmitExplanation}
                      disabled={isSubmitting || !submissionText.trim()}
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
      </div>
    </div>
  );
};

export default ExplicationModel;

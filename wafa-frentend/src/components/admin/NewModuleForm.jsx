import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Palette, X, Check, BookOpen, AlertCircle, Loader2, Image, FileText, CircleDot, HelpCircle, Upload, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { api } from "@/lib/utils";

// Preset colors for module cards
const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#ef4444", "#f97316",
  "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#0ea5e9", "#3b82f6", "#6b7280",
];

// Difficulty levels
const DIFFICULTY_LEVELS = [
  { value: "QE", label: "QE", bgColor: "bg-orange-100", textColor: "text-orange-700", borderColor: "border-orange-300" },
  { value: "easy", label: "easy", bgColor: "bg-lime-100", textColor: "text-lime-700", borderColor: "border-lime-300" },
  { value: "medium", label: "medium", bgColor: "bg-teal-100", textColor: "text-teal-700", borderColor: "border-teal-300" },
  { value: "hard", label: "hard", bgColor: "bg-red-100", textColor: "text-red-700", borderColor: "border-red-300" },
];

const NewModuleForm = ({ setShowNewModuleForm, onModuleCreated }) => {
  const { t } = useTranslation(["admin"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#6366f1");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [difficulty, setDifficulty] = useState("QE");
  
  // File states
  const [moduleImageFile, setModuleImageFile] = useState(null);
  const [moduleImagePreview, setModuleImagePreview] = useState(null);
  const [helpImageFile, setHelpImageFile] = useState(null);
  const [helpImagePreview, setHelpImagePreview] = useState(null);
  const [helpPdfFile, setHelpPdfFile] = useState(null);

  const newModuleSchema = z.object({
    name: z.string().min(2, t("admin:module_name_required")),
    semester: z.string().min(1, t("admin:semester_required")),
    infoText: z.string().optional(),
    helpContent: z.string().optional(),
    textContent: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(newModuleSchema),
    defaultValues: {
      name: "",
      semester: "",
      infoText: "",
      helpContent: "",
      textContent: "",
    },
  });

  const handleModuleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setModuleImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setModuleImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleHelpImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHelpImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setHelpImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleHelpPdfChange = (e) => {
    const file = e.target.files[0];
    if (file) setHelpPdfFile(file);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("semester", data.semester);
      formData.append("difficulty", difficulty);
      formData.append("color", selectedColor);
      formData.append("contentType", data.textContent ? "text" : "url");
      
      if (data.infoText) formData.append("infoText", data.infoText);
      if (data.helpContent) formData.append("helpContent", data.helpContent);
      if (data.textContent) formData.append("textContent", data.textContent);
      if (moduleImageFile) formData.append("moduleImage", moduleImageFile);
      if (helpImageFile) formData.append("helpImage", helpImageFile);
      if (helpPdfFile) formData.append("helpPdf", helpPdfFile);

      await api.post("/modules/create-with-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      form.reset();
      setModuleImageFile(null);
      setModuleImagePreview(null);
      setHelpImageFile(null);
      setHelpImagePreview(null);
      setHelpPdfFile(null);
      setShowNewModuleForm(false);
      toast.success(t("admin:module_created_success"));
      if (onModuleCreated) onModuleCreated();
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || t("admin:failed_create_module"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[99999]"
        onClick={() => setShowNewModuleForm(false)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col max-h-[90vh] z-[100000]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{t("admin:create_module_new")}</h1>
                <p className="text-sm text-blue-100">{t("admin:create_module_subtitle")}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hover:bg-white/20 text-white"
              onClick={() => setShowNewModuleForm(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informations de base</h3>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900">
                          {t("admin:module_name")} *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={t("admin:module_name_placeholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900">
                          {t("admin:select_semester")} *
                        </FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder={t("admin:choose_semester")} />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => `S${i + 1}`).reverse().map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="infoText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900">
                          Description courte (optionnel)
                        </FormLabel>
                        <FormControl>
                          <Textarea placeholder="Décrivez brièvement le module..." rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Difficulty & Appearance */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Difficulté & Apparence</h3>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900">Niveau de Difficulté</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {DIFFICULTY_LEVELS.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setDifficulty(level.value)}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                            difficulty === level.value
                              ? `${level.bgColor} ${level.borderColor} ${level.textColor} shadow-md`
                              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          <CircleDot className="h-4 w-4" />
                          <span className="font-medium">{level.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Color Picker */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-900">Couleur du Module</Label>
                      <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" className="w-full justify-start gap-3 h-11">
                            <div className="w-6 h-6 rounded-lg border-2" style={{ backgroundColor: selectedColor }} />
                            <span className="font-mono">{selectedColor}</span>
                            <Palette className="w-4 h-4 ml-auto text-gray-400" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-4 z-[100001]" align="start">
                          <div className="space-y-4">
                            <span className="text-sm font-semibold">Couleurs prédéfinies</span>
                            <div className="grid grid-cols-8 gap-2">
                              {PRESET_COLORS.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${
                                    selectedColor === color ? "border-gray-900 ring-2 ring-blue-300" : "border-gray-300"
                                  }`}
                                  style={{ backgroundColor: color }}
                                  onClick={() => { setSelectedColor(color); setShowColorPicker(false); }}
                                >
                                  {selectedColor === color && <Check className="w-4 h-4 text-white mx-auto" />}
                                </button>
                              ))}
                            </div>
                            <div className="pt-3 border-t">
                              <Label className="text-xs mb-2 block">Couleur personnalisée</Label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={selectedColor}
                                  onChange={(e) => setSelectedColor(e.target.value)}
                                  className="w-10 h-9 rounded-lg border cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  value={selectedColor}
                                  onChange={(e) => setSelectedColor(e.target.value)}
                                  className="flex-1 h-9 text-sm font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <div className="p-4 rounded-lg border-2 border-dashed flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md"
                          style={{ backgroundColor: selectedColor }}
                        >
                          M
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">Aperçu de la carte</p>
                          <p className="text-gray-600">Le module s'affichera avec cette couleur</p>
                        </div>
                      </div>
                    </div>

                    {/* Module Image */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-900">
                        <Image className="h-4 w-4 inline mr-2" />
                        Image du Module (optionnel)
                      </Label>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        {moduleImagePreview ? (
                          <img src={moduleImagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Image className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Cliquez pour uploader</span></p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF (max 10MB)</p>
                          </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleModuleImageChange} />
                      </label>
                      {moduleImageFile && (
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                          <span className="text-sm text-blue-700 truncate">{moduleImageFile.name}</span>
                          <button type="button" onClick={() => { setModuleImageFile(null); setModuleImagePreview(null); }} className="text-red-500 hover:text-red-700">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Help Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    Section Aide (Button Aide)
                  </h3>
                  <p className="text-sm text-gray-600">
                    Ces éléments seront affichés quand l'utilisateur clique sur le bouton d'aide. Vous pouvez ajouter du texte ET/OU une image ET/OU un PDF.
                  </p>

                  <FormField
                    control={form.control}
                    name="helpContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900">
                          <FileText className="h-4 w-4 inline mr-2" />
                          Texte d'aide (optionnel)
                        </FormLabel>
                        <FormControl>
                          <Textarea placeholder="Entrez le texte qui s'affichera dans la section d'aide..." rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Help Image */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-900">
                        <Image className="h-4 w-4 inline mr-2" />
                        Image d'aide (optionnel)
                      </Label>
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-green-300 rounded-lg cursor-pointer bg-green-50 hover:bg-green-100 transition-colors">
                        {helpImagePreview ? (
                          <img src={helpImagePreview} alt="Help Preview" className="h-full w-full object-contain rounded-lg" />
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <Upload className="w-6 h-6 mb-2 text-green-500" />
                            <p className="text-xs text-green-700 font-medium">Image pour l'aide</p>
                          </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleHelpImageChange} />
                      </label>
                      {helpImageFile && (
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                          <span className="text-sm text-green-700 truncate">{helpImageFile.name}</span>
                          <button type="button" onClick={() => { setHelpImageFile(null); setHelpImagePreview(null); }} className="text-red-500 hover:text-red-700">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Help PDF */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-900">
                        <File className="h-4 w-4 inline mr-2" />
                        PDF d'aide (optionnel)
                      </Label>
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors">
                        {helpPdfFile ? (
                          <div className="flex flex-col items-center justify-center">
                            <File className="w-8 h-8 mb-2 text-purple-600" />
                            <p className="text-xs text-purple-700 font-medium text-center px-2 truncate max-w-full">{helpPdfFile.name}</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <Upload className="w-6 h-6 mb-2 text-purple-500" />
                            <p className="text-xs text-purple-700 font-medium">PDF pour l'aide</p>
                          </div>
                        )}
                        <input type="file" className="hidden" accept="application/pdf" onChange={handleHelpPdfChange} />
                      </label>
                      {helpPdfFile && (
                        <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                          <span className="text-sm text-purple-700 truncate">{helpPdfFile.name}</span>
                          <button type="button" onClick={() => setHelpPdfFile(null)} className="text-red-500 hover:text-red-700">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contenu textuel (optionnel)</h3>
                  <FormField
                    control={form.control}
                    name="textContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900">
                          Contenu du module en texte
                        </FormLabel>
                        <FormControl>
                          <Textarea placeholder="Décrivez le contenu du module en texte..." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Info Box */}
                <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-semibold">Conseil:</p>
                    <p>L'image du module apparaît sur la carte. Les éléments d'aide (texte, image, PDF) s'affichent quand l'utilisateur clique sur le bouton d'aide.</p>
                  </div>
                </div>
              </form>
            </Form>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t rounded-b-xl flex justify-end gap-3 z-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => { form.reset(); setShowNewModuleForm(false); }}
              disabled={isSubmitting}
            >
              {t("admin:cancel")}
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("admin:saving")}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {t("admin:create")}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewModuleForm;

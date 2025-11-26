import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Palette, X, Check, BookOpen, AlertCircle, Loader2 } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

// Preset colors for module cards
const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#eab308", // Yellow
  "#84cc16", // Lime
  "#22c55e", // Green
  "#10b981", // Emerald
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#0ea5e9", // Sky
  "#3b82f6", // Blue
  "#6b7280", // Gray
];

const NewModuleForm = ({ setShowNewModuleForm }) => {
  const { t } = useTranslation(["admin"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#6366f1");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const newModuleSchema = z.object({
    name: z.string().min(2, t("admin:module_name_required")),
    semester: z.string().min(1, t("admin:semester_required")),
    imageUrl: z
      .string()
      .url(t("admin:image_url_invalid"))
      .or(z.string().length(0))
      .transform((v) => v || ""),
    helpText: z
      .string()
      .optional()
      .transform((v) => (v == null ? "" : v)),
    helpContent: z
      .string()
      .optional()
      .transform((v) => (v == null ? "" : v)),
  });

  const form = useForm({
    resolver: zodResolver(newModuleSchema),
    defaultValues: {
      name: "",
      semester: "",
      imageUrl: "",
      helpText: "",
      helpContent: "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await api.post("/modules/create", {
        name: data.name,
        semester: data.semester,
        imageUrl: data.imageUrl,
        infoText: data.helpText,
        color: selectedColor,
        helpContent: data.helpContent,
      });

      form.reset();
      setShowNewModuleForm(false);
      toast.success(t("admin:module_created_success"));
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
          className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col max-h-[90vh] z-[100000]"
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Module Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900">
                        {t("admin:module_name")} *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("admin:module_name_placeholder")}
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Semester Select */}
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
                          <SelectTrigger className="border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                            <SelectValue placeholder={t("admin:choose_semester")} />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => `S${i + 1}`)
                              .reverse()
                              .map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Color Picker */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900">
                      Couleur du Module
                    </Label>
                    <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start gap-3 h-11 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        >
                          <div
                            className="w-6 h-6 rounded-lg border-2 border-gray-200 shadow-sm"
                            style={{ backgroundColor: selectedColor }}
                          />
                          <span className="text-gray-700 font-mono">{selectedColor}</span>
                          <Palette className="w-4 h-4 ml-auto text-gray-400" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-4" align="start">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900">Couleurs prédéfinies</span>
                          </div>
                          <div className="grid grid-cols-8 gap-2">
                            {PRESET_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${
                                  selectedColor === color
                                    ? "border-gray-900 scale-110 ring-2 ring-blue-300"
                                    : "border-gray-300"
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                  setSelectedColor(color);
                                  setShowColorPicker(false);
                                }}
                              >
                                {selectedColor === color && (
                                  <Check className="w-4 h-4 text-white mx-auto" />
                                )}
                              </button>
                            ))}
                          </div>
                          <div className="pt-3 border-t border-gray-200">
                            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                              Couleur personnalisée
                            </Label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={selectedColor}
                                onChange={(e) => setSelectedColor(e.target.value)}
                                className="w-10 h-9 rounded-lg border border-gray-300 cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={selectedColor}
                                onChange={(e) => setSelectedColor(e.target.value)}
                                className="flex-1 h-9 text-sm font-mono"
                                placeholder="#000000"
                              />
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Color Preview */}
                    <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white flex items-center gap-3">
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

                  {/* Image URL */}
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem className="h-full flex flex-col">
                          <FormLabel className="text-sm font-semibold text-gray-900">
                            {t("admin:image_url_optional")}
                          </FormLabel>
                          <FormControl className="flex-1">
                            <Textarea
                              placeholder={t("admin:image_url_placeholder")}
                              className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none flex-1"
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs mt-1" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Help Text */}
                <FormField
                  control={form.control}
                  name="helpText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900">
                        {t("admin:help_text_tooltip")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("admin:help_text_tooltip_placeholder")}
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">Texte court qui s'affichera au survol du module</p>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Help Content */}
                <FormField
                  control={form.control}
                  name="helpContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-900">
                        Contenu d'aide détaillé
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez le module, son contenu, les objectifs et comment l'utiliser..."
                          className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">
                        Ce texte s'affichera dans la fenêtre d'aide détaillée du module
                      </p>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Info Box */}
                <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-semibold">Conseil:</p>
                    <p>Utilisez des noms descriptifs et des couleurs distinctes pour faciliter la navigation des utilisateurs.</p>
                  </div>
                </div>
              </form>
            </Form>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl flex justify-end gap-3 z-10">
            <Button
              type="button"
              variant="outline"
              className="border-gray-300 hover:bg-gray-100"
              onClick={() => {
                form.reset();
                setShowNewModuleForm(false);
              }}
              disabled={isSubmitting}
            >
              {t("admin:cancel")}
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-shadow"
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

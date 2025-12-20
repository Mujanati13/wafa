import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Palette, X, Check, BookOpen, Image, FileText, CircleDot, Loader2 } from "lucide-react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
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

// Difficulty levels with colors
const DIFFICULTY_LEVELS = [
  { value: "easy", label: "Facile", color: "#6366f1", bgColor: "bg-indigo-100", textColor: "text-indigo-700", borderColor: "border-indigo-300" },
  { value: "medium", label: "Moyen", color: "#22c55e", bgColor: "bg-green-100", textColor: "text-green-700", borderColor: "border-green-300" },
  { value: "hard", label: "Difficile", color: "#06b6d4", bgColor: "bg-cyan-100", textColor: "text-cyan-700", borderColor: "border-cyan-300" },
];

const EditModuleForm = ({ module, setShowEditForm, onModuleUpdated }) => {
  const { t } = useTranslation(["admin"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#6366f1");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [contentType, setContentType] = useState("url"); // "url" or "text"
  const [difficulty, setDifficulty] = useState("medium");

  const editModuleSchema = z.object({
    name: z.string().min(2, t("admin:module_name_required")),
    semester: z.string().min(1, t("admin:semester_required")),
    imageUrl: z
      .string()
      .url(t("admin:image_url_invalid"))
      .or(z.string().length(0))
      .transform((v) => v || ""),
    textContent: z
      .string()
      .optional()
      .transform((v) => (v == null ? "" : v)),
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
    resolver: zodResolver(editModuleSchema),
    defaultValues: {
      name: "",
      semester: "",
      imageUrl: "",
      textContent: "",
      helpText: "",
      helpContent: "",
    },
  });

  // Set form values when module prop changes
  useEffect(() => {
    if (module) {
      form.reset({
        name: module.name || "",
        semester: module.semester || "",
        imageUrl: module.imageUrl || "",
        textContent: module.textContent || "",
        helpText: module.helpText || module.infoText || "",
        helpContent: module.helpContent || "",
      });
      setSelectedColor(module.color || "#6366f1");
      setDifficulty(module.difficulty || "medium");
      setContentType(module.contentType || "url");
    }
  }, [module, form]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await api.put(`/modules/${module.id}`, {
        name: data.name,
        semester: data.semester,
        imageUrl: contentType === "url" ? data.imageUrl : "",
        textContent: contentType === "text" ? data.textContent : "",
        contentType: contentType,
        difficulty: difficulty,
        infoText: data.helpText,
        color: selectedColor,
        helpContent: data.helpContent,
      });

      console.log("Module updated:", res.data);
      // await new Promise((r) => setTimeout(r, 800)); // Standardize like NewModuleForm? keeping vague delay is odd, but ok.
      setShowEditForm(false);

      // Call the callback to refresh the modules list
      if (onModuleUpdated) {
        onModuleUpdated();
      }

      toast.success(t("admin:module_updated_success"));
    } catch (e) {
      console.error(e);
      toast.error(t("admin:failed_update_module"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black/50 p-4 z-[99999999999] absolute top-0 left-0 w-full h-full overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-sm border border-gray-200 p-6 my-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              {t("admin:edit_module")}
            </h1>
            <p className="text-sm text-gray-600">
              {t("admin:update_module_subtitle")}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowEditForm(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("admin:module_name")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("admin:module_name_placeholder")}
                      className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                      {...field}
                    />
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
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("admin:select_semester")}
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-gray-400 focus:ring-gray-400">
                          <SelectValue placeholder={t("admin:choose_semester")} />
                        </SelectTrigger>
                      </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Difficulty Selector */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-900">
                Niveau de Difficulté
              </Label>
              <div className="flex gap-3">
                {DIFFICULTY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setDifficulty(level.value)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${difficulty === level.value
                      ? `${level.bgColor} ${level.borderColor} ${level.textColor} shadow-md`
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                  >
                    <CircleDot
                      className="h-4 w-4"
                      style={{ color: difficulty === level.value ? level.color : "#9ca3af" }}
                    />
                    <span className="font-medium">{level.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Color Picker */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Couleur du Module
                </Label>
                <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start gap-3 h-10"
                    >
                      <div
                        className="w-6 h-6 rounded-md border border-gray-200"
                        style={{ backgroundColor: selectedColor }}
                      />
                      <span className="text-gray-600">{selectedColor}</span>
                      <Palette className="w-4 h-4 ml-auto text-gray-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="start">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Couleurs prédéfinies</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setShowColorPicker(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-8 gap-1.5">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`w-6 h-6 rounded-md border-2 transition-all ${selectedColor === color
                              ? "border-gray-900 scale-110"
                              : "border-transparent hover:scale-110"
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
                      <div className="pt-2 border-t">
                        <Label className="text-xs text-gray-500 mb-1.5 block">
                          Couleur personnalisée
                        </Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className="w-10 h-8 rounded border border-gray-200 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className="flex-1 h-8 text-sm"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Color Preview */}
                <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm"
                    style={{ backgroundColor: selectedColor }}
                  >
                    {module?.name?.[0]?.toUpperCase() || "M"}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Aperçu</p>
                    <p className="text-[10px] text-gray-500">Apparence carte</p>
                  </div>
                </div>
              </div>

              {/* Content Type & Value */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">
                  Type de Contenu
                </Label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setContentType("url")}
                    className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg border-2 transition-all text-xs lg:text-sm ${contentType === "url"
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                  >
                    <Image className="h-3 w-3 lg:h-4 lg:w-4" />
                    Image/PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType("text")}
                    className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg border-2 transition-all text-xs lg:text-sm ${contentType === "text"
                      ? "bg-purple-50 border-purple-300 text-purple-700"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                  >
                    <FileText className="h-3 w-3 lg:h-4 lg:w-4" />
                    Texte
                  </button>
                </div>

                {contentType === "url" ? (
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem className="h-full flex flex-col">
                        <FormLabel className="text-sm font-medium text-gray-700">
                          {t("admin:image_url_optional")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("admin:image_url_placeholder")}
                            className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="textContent"
                    render={({ field }) => (
                      <FormItem className="h-full flex flex-col">
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Contenu Textuel
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez le contenu..."
                            className="border-gray-300 focus:ring-purple-500 focus:border-purple-500 resize-none min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="helpText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("admin:help_text_tooltip")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("admin:help_text_tooltip_placeholder")}
                      className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="helpContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Contenu d'aide détaillé
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez le module, son contenu, et comment l'utiliser..."
                      className="border-gray-300 focus:border-gray-400 focus:ring-gray-400 min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">
                    Ce texte s'affichera dans la fenêtre d'aide du module
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setShowEditForm(false)}
              >
                {t("admin:cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-800 hover:bg-gray-900 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("admin:saving")}
                  </>
                ) : t("admin:save")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditModuleForm;

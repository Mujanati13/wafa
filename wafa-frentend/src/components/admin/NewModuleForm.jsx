import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Palette, X, Check } from "lucide-react";

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
import { Select } from "../ui/select";
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
      console.log(res);

      console.log("New module:", data);
      await new Promise((r) => setTimeout(r, 800));
      form.reset();
      setShowNewModuleForm(false);
      alert(t("admin:module_created_success"));
    } catch (e) {
      console.error(e);
      alert(t("admin:failed_create_module"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black/50 p-4 z-[99999999999] absolute top-0 left-0 w-full h-full overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-sm border border-gray-200 p-6 my-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            {t("admin:create_module_new")}
          </h1>
          <p className="text-sm text-gray-600">
            {t("admin:create_module_subtitle")}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <Select
                      {...field}
                      className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                    >
                      <option value="" disabled>
                        {t("admin:choose_semester")}
                      </option>
                      {Array.from({ length: 10 }, (_, i) => `S${i + 1}`)
                        .reverse()
                        .map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                          className={`w-6 h-6 rounded-md border-2 transition-all ${
                            selectedColor === color
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
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: selectedColor }}
                >
                  M
                </div>
                <span className="text-sm text-gray-600">Aperçu de la carte module</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
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
                onClick={() => {
                  form.reset();
                  setShowNewModuleForm(false);
                }}
              >
                {t("admin:cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-800 hover:bg-gray-900 text-white"
              >
                {isSubmitting ? t("admin:saving") : t("admin:create")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewModuleForm;

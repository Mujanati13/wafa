import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X, FolderPlus, Image as ImageIcon, Layers } from "lucide-react";

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
import { toast } from "sonner";

const NewCategoryForm = ({ setShowNewCategoryForm, modules }) => {
  const { t } = useTranslation(["admin"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const newCategorySchema = z.object({
    name: z.string().min(2, t("admin:category_name_required")),
    moduleId: z.string().min(1, t("admin:module_required")),
    imageUrl: z
      .string()
      .url(t("admin:image_url_invalid"))
      .or(z.string().length(0))
      .transform((v) => v || ""),
  });

  const form = useForm({
    resolver: zodResolver(newCategorySchema),
    defaultValues: {
      name: "",
      moduleId: "",
      imageUrl: "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with API integration
      console.log("New category:", data);
      await new Promise((r) => setTimeout(r, 800));
      form.reset();
      setShowNewCategoryForm(false);
      toast.success("Succès", {
        description: t("admin:category_created_success"),
        duration: 3000
      });
    } catch (e) {
      console.error(e);
      toast.error("Erreur", {
        description: t("admin:failed_create_category"),
        duration: 3000
      });
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
        className="flex justify-center items-center min-h-screen bg-black/60 backdrop-blur-sm p-4 z-[99999999999] fixed top-0 left-0 w-full h-full"
        onClick={() => setShowNewCategoryForm(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-lg bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200 p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowNewCategoryForm(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors group"
          >
            <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
          </button>

          {/* Header with Icon */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <FolderPlus className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("admin:add_category")}
              </h1>
            </div>
            <p className="text-sm text-gray-600 ml-1">
              {t("admin:create_category_subtitle")}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      {t("admin:category_name")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("admin:category_name_placeholder")}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="moduleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <FolderPlus className="w-4 h-4 text-indigo-600" />
                      {t("admin:select_module")}
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-900 font-medium appearance-none cursor-pointer"
                      >
                        <option value="" disabled hidden>
                          {t("admin:choose_module")}
                        </option>
                        {modules.map((module) => (
                          <option key={module._id} value={module._id}>
                            {module.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      {t("admin:image_url_optional")}
                      <span className="text-xs font-normal text-gray-500">(Optionnel)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("admin:image_url_placeholder")}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  className="px-6 h-11 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all"
                  onClick={() => {
                    form.reset();
                    setShowNewCategoryForm(false);
                  }}
                >
                  {t("admin:cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 h-11 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t("admin:saving")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FolderPlus className="w-4 h-4" />
                      {t("admin:create")}
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewCategoryForm;

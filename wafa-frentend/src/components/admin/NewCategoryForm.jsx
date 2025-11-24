import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";

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
      alert(t("admin:category_created_success"));
    } catch (e) {
      console.error(e);
      alert(t("admin:failed_create_category"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black/50 p-4 z-[99999999999] absolute top-0 left-0 w-full h-full">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            {t("admin:add_category")}
          </h1>
          <p className="text-sm text-gray-600">
            {t("admin:create_category_subtitle")}
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
                    {t("admin:category_name")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("admin:category_name_placeholder")}
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
              name="moduleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("admin:select_module")}
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                    >
                      <option value="" disabled>
                        {t("admin:choose_module")}
                      </option>
                      {Array.from(new Set(modules.map((c) => c.moduleId))).map(
                        (moduleId) => {
                          const module = modules.find(
                            (c) => c.moduleId === moduleId
                          );
                          return (
                            <option key={moduleId} value={moduleId}>
                              {module.moduleName}
                            </option>
                          );
                        }
                      )}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="text-gray-700 hover:text-gray-900"
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

export default NewCategoryForm;

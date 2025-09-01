import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { api } from "@/lib/utils";

const editModuleSchema = z.object({
  name: z.string().min(2, "Module name is required"),
  semester: z.string().min(1, "Select a semester"),
  imageUrl: z
    .string()
    .url("Enter a valid image URL")
    .or(z.string().length(0))
    .transform((v) => v || ""),
  helpText: z
    .string()
    .optional()
    .transform((v) => (v == null ? "" : v)),
});

const EditModuleForm = ({ module, setShowEditForm, onModuleUpdated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(editModuleSchema),
    defaultValues: {
      name: "",
      semester: "",
      imageUrl: "",
      helpText: "",
    },
  });

  // Set form values when module prop changes
  useEffect(() => {
    if (module) {
      form.reset({
        name: module.name || "",
        semester: module.semester || "",
        imageUrl: module.imageUrl || "",
        helpText: module.helpText || "",
      });
    }
  }, [module, form]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await api.put(`/modules/${module.id}`, {
        name: data.name,
        semester: data.semester,
        imageUrl: data.imageUrl,
        infoText: data.helpText,
      });

      console.log("Module updated:", res.data);
      await new Promise((r) => setTimeout(r, 800));
      setShowEditForm(false);

      // Call the callback to refresh the modules list
      if (onModuleUpdated) {
        onModuleUpdated();
      }

      alert("Module updated successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to update module");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black/50 p-4 z-[99999999999] absolute top-0 left-0 w-full h-full">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Edit Module
          </h1>
          <p className="text-sm text-gray-600">
            Update module information and settings
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
                    Module name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Anatomie 1"
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
                    Select semester
                  </FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                    >
                      <option value="" disabled>
                        Choose semester
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

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Image URL (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://..."
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
                    Text for the "?"
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Short explanation shown in the tooltip"
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
                onClick={() => setShowEditForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-800 hover:bg-gray-900 text-white"
              >
                {isSubmitting ? "Updating..." : "Update Module"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditModuleForm;

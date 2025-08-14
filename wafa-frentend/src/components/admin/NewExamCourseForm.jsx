import React, { useState } from "react";
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

const newExamCourseSchema = z.object({
  name: z.string().min(2, "Course name is required"),
  moduleName: z.string().min(1, "Select a module"),
  category: z.string().min(1, "Select a category"),
  totalQuestions: z
    .string()
    .min(1, "Total questions is required")
    .transform((val) => parseInt(val, 10)),
  imageUrl: z
    .string()
    .url("Enter a valid image URL")
    .or(z.string().length(0))
    .transform((v) => v || ""),
  helpText: z.string().min(2, "Please add the help text shown in the ?"),
});

const NewExamCourseForm = ({
  setShowNewExamCourseForm,
  modules,
  categories,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(newExamCourseSchema),
    defaultValues: {
      name: "",
      moduleName: "",
      category: "",
      totalQuestions: "",
      imageUrl: "",
      helpText: "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with API integration
      console.log("New exam course:", data);
      await new Promise((r) => setTimeout(r, 800));
      form.reset();
      setShowNewExamCourseForm(false);
      alert("Exam course created successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to create exam course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black/50 p-4 z-[99999999999] absolute top-0 left-0 w-full h-full">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Create Exam Course
          </h1>
          <p className="text-sm text-gray-600">
            Add a new exam course to the system
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
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Système cardiovasculaire - Anatomie 1"
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
              name="moduleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Select Module
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                    >
                      <option value="" disabled>
                        Choose a module
                      </option>
                      {modules.map((module) => (
                        <option key={module} value={module}>
                          {module}
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Select Category
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                    >
                      <option value="" disabled>
                        Choose a category
                      </option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
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
              name="totalQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Total Questions
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 50"
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
                    Text Info "?" (Optional)
                  </FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Additional information or help text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
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
                  setShowNewExamCourseForm(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-800 hover:bg-gray-900 text-white"
              >
                {isSubmitting ? "Saving..." : "Create Course"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewExamCourseForm;

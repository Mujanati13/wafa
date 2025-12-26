import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/utils";
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
import { Select } from "../ui/select";

const NewUserForm = ({setShowNewUserForm}) => {
  const { t } = useTranslation(["admin"]);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation schema
  const newUserSchema = z.object({
    firstName: z
      .string()
      .min(2, t("admin:first_name_required"))
      .max(50, t("admin:first_name_max"))
      .regex(/^[a-zA-Z\s]+$/, t("admin:first_name_letters")),
    lastName: z
      .string()
      .min(2, t("admin:last_name_required"))
      .max(50, t("admin:last_name_max"))
      .regex(/^[a-zA-Z\s]+$/, t("admin:last_name_letters")),
    email: z
      .string()
      .email(t("admin:email_invalid"))
      .min(1, t("admin:email_required")),
    password: z
      .string()
      .min(8, t("admin:password_min")),
  });

  const form = useForm({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "student",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Call the registration API endpoint
      const response = await api.post("/auth/register", {
        username: `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}`,
        email: data.email,
        password: data.password,
      });

      // Reset form on success
      form.reset();
      toast.success(t("admin:user_created_success") || "User created successfully!");
      setShowNewUserForm(false);
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to create user";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setShowNewUserForm(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[999]"
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md max-h-[90vh] bg-white rounded-lg shadow-xl border border-gray-200 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {t("admin:add_new_user")}
              </h1>
              <p className="text-sm text-gray-600">
                {t("admin:create_user_subtitle")}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          {t("admin:first_name")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("admin:first_name_placeholder")}
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
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          {t("admin:last_name")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("admin:last_name_placeholder")}
                            className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t("admin:email")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t("admin:email_placeholder")}
                          className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Field */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t("admin:phone")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder={t("admin:phone_placeholder")}
                          className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          {t("admin:password")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder={t("admin:password_placeholder")}
                              className="border-gray-300 focus:border-gray-400 focus:ring-gray-400 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-gray-700 hover:text-gray-900"
                    onClick={handleClose}
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
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        {t("admin:saving")}
                      </>
                    ) : (
                      t("admin:create")
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewUserForm;

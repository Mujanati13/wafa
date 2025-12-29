import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, X, CreditCard, GraduationCap, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { userService } from "../../services/userService";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

const studentYears = [
  { value: "1", label: "1ère année" },
  { value: "2", label: "2ème année" },
  { value: "3", label: "3ème année" },
  { value: "4", label: "4ème année" },
  { value: "5", label: "5ème année" },
  { value: "6", label: "6ème année" },
];

const semesterOptions = [
  { value: "S1", label: "S1" },
  { value: "S2", label: "S2" },
  { value: "S3", label: "S3" },
  { value: "S4", label: "S4" },
  { value: "S5", label: "S5" },
  { value: "S6", label: "S6" },
  { value: "S7", label: "S7" },
  { value: "S8", label: "S8" },
  { value: "S9", label: "S9" },
  { value: "S10", label: "S10" },
];

const paymentModeOptions = [
  { value: "PayPal", label: "PayPal" },
  { value: "Bank Transfer", label: "Virement bancaire" },
  { value: "Contact", label: "Contact" },
  { value: "Manual", label: "Manuel (Admin)" },
];

const planOptions = [
  { value: "Free", label: "Gratuit", description: "Accès limité" },
  { value: "Premium", label: "Premium (Semestre)", description: "6 mois d'accès" },
  { value: "Premium Annuel", label: "Premium Annuel", description: "12 mois d'accès" },
];

const NewUserForm = ({ setShowNewUserForm, onUserCreated }) => {
  const { t } = useTranslation(["admin"]);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSemesters, setSelectedSemesters] = useState([]);
  const [isPaid, setIsPaid] = useState(false);

  // Validation schema
  const newUserSchema = z.object({
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères")
      .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
    lastName: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(50, "Le nom ne peut pas dépasser 50 caractères"),
    email: z
      .string()
      .email("Email invalide")
      .min(1, "L'email est requis"),
    phone: z
      .string()
      .optional(),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    plan: z
      .string()
      .default("Free"),
    currentYear: z
      .string()
      .optional(),
    paymentMode: z
      .string()
      .optional(),
  });

  const form = useForm({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      plan: "Free",
      currentYear: "",
      paymentMode: "",
    },
  });

  const watchPlan = form.watch("plan");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Call the new admin create user endpoint
      const response = await userService.createAdminUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone || null,
        plan: data.plan,
        currentYear: data.currentYear || null,
        semesters: selectedSemesters,
        paymentMode: data.plan !== "Free" && isPaid ? data.paymentMode : null,
        isPaid: data.plan !== "Free" && isPaid,
        sendPasswordEmail: true,
      });

      if (response.success) {
        // Reset form on success
        form.reset();
        setSelectedSemesters([]);
        setIsPaid(false);
        
        // Show appropriate success message
        if (response.data?.user?.firebaseCreated) {
          toast.success("Utilisateur créé avec succès! L'utilisateur peut maintenant se connecter.");
        } else {
          toast.warning("Utilisateur créé dans la base de données, mais Firebase n'a pas été configuré. L'utilisateur devra peut-être réinitialiser son mot de passe.");
        }
        
        setShowNewUserForm(false);
        
        // Call callback to refresh user list
        if (onUserCreated) {
          onUserCreated();
        }
      } else {
        toast.error(response.message || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      const errorData = error.response?.data;
      
      // Check for Firebase-specific errors
      if (errorData?.firebaseError) {
        toast.error("Erreur Firebase: La configuration du serveur est incorrecte. Contactez l'administrateur système pour régénérer la clé Firebase.");
      } else {
        const errorMessage = errorData?.message || error.message || "Erreur lors de la création de l'utilisateur";
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedSemesters([]);
    setIsPaid(false);
    setShowNewUserForm(false);
  };

  const toggleSemester = (semValue) => {
    setSelectedSemesters(prev => 
      prev.includes(semValue) 
        ? prev.filter(s => s !== semValue)
        : [...prev, semValue].sort()
    );
  };

  const selectAllSemesters = () => {
    setSelectedSemesters(semesterOptions.map(s => s.value));
  };

  const clearAllSemesters = () => {
    setSelectedSemesters([]);
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
        <div className="pointer-events-auto w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Ajouter un nouvel utilisateur
              </h1>
              <p className="text-sm text-gray-600">
                Créez un compte utilisateur avec Firebase
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Section: Informations personnelles */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4" />
                    <h3 className="font-medium">Informations personnelles</h3>
                  </div>
                  
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Prénom *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Jean"
                              className="border-gray-300 focus:border-blue-400 focus:ring-blue-400"
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
                            Nom *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Dupont"
                              className="border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Email *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="jean.dupont@email.com"
                              className="border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Téléphone
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+212 6XX XXX XXX"
                              className="border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Mot de passe *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Minimum 8 caractères"
                              className="border-gray-300 focus:border-blue-400 focus:ring-blue-400 pr-10"
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
                        <FormDescription className="text-xs">
                          L'utilisateur recevra un email pour réinitialiser son mot de passe.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Section: Études */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-gray-700">
                    <GraduationCap className="w-4 h-4" />
                    <h3 className="font-medium">Informations d'études</h3>
                  </div>

                  {/* Year */}
                  <FormField
                    control={form.control}
                    name="currentYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Année d'étude
                        </FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                          >
                            <option value="">Sélectionner l'année...</option>
                            {studentYears.map((year) => (
                              <option key={year.value} value={year.value}>
                                {year.label}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Semesters */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium text-gray-700">Semestres</Label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={selectAllSemesters}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Tout sélectionner
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={clearAllSemesters}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          Effacer
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2 p-3 border border-gray-200 rounded-md bg-gray-50">
                      {semesterOptions.map((sem) => (
                        <label 
                          key={sem.value} 
                          className={`flex items-center justify-center gap-1.5 p-2 rounded cursor-pointer transition-colors ${
                            selectedSemesters.includes(sem.value) 
                              ? 'bg-blue-100 border-blue-300 border text-blue-700' 
                              : 'bg-white border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSemesters.includes(sem.value)}
                            onChange={() => toggleSemester(sem.value)}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">{sem.label}</span>
                        </label>
                      ))}
                    </div>
                    {selectedSemesters.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedSemesters.length} semestre(s) sélectionné(s): {selectedSemesters.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Section: Abonnement */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-gray-700">
                    <CreditCard className="w-4 h-4" />
                    <h3 className="font-medium">Abonnement</h3>
                  </div>

                  {/* Plan Selection */}
                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Plan d'abonnement
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {planOptions.map((plan) => (
                              <label
                                key={plan.value}
                                className={`relative flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                  field.value === plan.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  {...field}
                                  value={plan.value}
                                  checked={field.value === plan.value}
                                  className="sr-only"
                                />
                                <span className="font-medium text-sm">{plan.label}</span>
                                <span className="text-xs text-gray-500">{plan.description}</span>
                                {field.value === plan.value && (
                                  <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                              </label>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Payment Status - Only for non-free plans */}
                  {watchPlan !== "Free" && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isPaid"
                          checked={isPaid}
                          onChange={(e) => setIsPaid(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="isPaid" className="cursor-pointer">
                          <span className="font-medium">Marquer comme payé</span>
                          <p className="text-xs text-gray-500">L'abonnement sera activé immédiatement</p>
                        </Label>
                      </div>

                      {isPaid && (
                        <FormField
                          control={form.control}
                          name="paymentMode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                Mode de paiement
                              </FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  className="w-full p-2 border border-gray-300 rounded-md bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                                >
                                  <option value="">Sélectionner...</option>
                                  {paymentModeOptions.map((mode) => (
                                    <option key={mode.value} value={mode.value}>
                                      {mode.label}
                                    </option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-gray-700 hover:text-gray-900"
                    onClick={handleClose}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Création...
                      </>
                    ) : (
                      "Créer l'utilisateur"
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

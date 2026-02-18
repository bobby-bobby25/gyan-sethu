import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, Loader2, CheckCircle, AlertCircle, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/api/api";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmailFormData = z.infer<typeof emailSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [step, setStep] = useState<"email" | "validating" | "reset" | "expired">(token ? "validating" : "email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Validate token on component mount if present
  useEffect(() => {
    if (token && email) {
      validateToken();
    }
    if (email) {
    emailForm.setValue("email", email);
  }
  }, [token, email]);

  const validateToken = async () => {
    try {
      const response = await api.post("/auth/validate-reset-token", {
        email: decodeURIComponent(email!),
        token,
      });

      if (response.data.success) {
        setStep("reset");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Invalid or expired reset link";
      toast.error(errorMessage);
      setStep("expired");
    }
  };

  const onEmailSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/send-reset-link", {
        email: data.email,
      });

      if (response.data.success) {
        toast.success("Reset link sent! Please check your email.");
        emailForm.reset();
        // Could show a success message or navigate to login
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to send reset link";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: ResetPasswordFormData) => {
    if (!token || !email) {
      toast.error("Invalid reset link");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/reset-password", {
        email: decodeURIComponent(email),
        token,
        password: data.password,
      });

      if (response.data.success) {
        toast.success("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to reset password";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const password = resetForm.watch("password");

  // Password validation indicators
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  // Step 1: Email Entry
  if (step === "email") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>Enter your email to receive a reset link</CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="your@email.com"
                            className="pl-10 rounded-xl h-11"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full rounded-xl h-11 mt-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Sending Link..." : "Send Reset Link"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Back to Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Validating Token
  if (step === "validating") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Validating Link</CardTitle>
            <CardDescription>Please wait...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: Expired/Invalid Link
  if (step === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-lg bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl text-destructive">Link Expired</CardTitle>
            <CardDescription>Your password reset link is no longer valid</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Password reset links expire after a set time for security reasons. Please request a new reset link.
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={() => {
                  setStep("email");
                  resetForm.reset();
                }}
              >
                Request New Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 4: Reset Password Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Create a new password for your account</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              {/* Email Display Field */}
              <div className="space-y-2">
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  value={decodeURIComponent(email || "")}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Password Field */}
              <FormField
                control={resetForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Validation Checklist */}
              {password && (
                <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground">Password must contain:</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle className={cn("h-4 w-4", passwordChecks.length ? "text-success" : "text-muted-foreground")} />
                      <span className={passwordChecks.length ? "text-success" : "text-muted-foreground"}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle className={cn("h-4 w-4", passwordChecks.uppercase ? "text-success" : "text-muted-foreground")} />
                      <span className={passwordChecks.uppercase ? "text-success" : "text-muted-foreground"}>
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle className={cn("h-4 w-4", passwordChecks.lowercase ? "text-success" : "text-muted-foreground")} />
                      <span className={passwordChecks.lowercase ? "text-success" : "text-muted-foreground"}>
                        One lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle className={cn("h-4 w-4", passwordChecks.number ? "text-success" : "text-muted-foreground")} />
                      <span className={passwordChecks.number ? "text-success" : "text-muted-foreground"}>
                        One number
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle className={cn("h-4 w-4", passwordChecks.special ? "text-success" : "text-muted-foreground")} />
                      <span className={passwordChecks.special ? "text-success" : "text-muted-foreground"}>
                        One special character (@$!%*?&)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Password Field */}
              <FormField
                control={resetForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isPasswordValid || isSubmitting}
                className="w-full rounded-xl h-11 mt-6"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
              </Button>

              {/* Back to Login Link */}
              <div className="text-center pt-2">
                <Link to="/login" className="text-sm text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;

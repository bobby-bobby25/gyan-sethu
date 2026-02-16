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
import { GraduationCap, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/api/api";

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/;

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only numbers"),
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

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailParam = searchParams.get("email");

  const [step, setStep] = useState<"email" | "otp-password">(emailParam ? "otp-password" : "email");
  const [email, setEmail] = useState(emailParam || "");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(!!emailParam);
  const MAX_RESEND_ATTEMPTS = 3;

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailParam || "",
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  const handleSendOTP = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    // Check if resend limit is reached
    if (resendCount >= MAX_RESEND_ATTEMPTS) {
      toast.error("Maximum OTP resend attempts (3) reached. Please contact support.");
      return;
    }

    setIsResending(true);
    try {
      await api.post("/auth/send-reset-otp", { email });

      toast.success("OTP sent to your email");
      setStep("otp-password");
      setEmailSubmitted(true);
      form.setValue("email", email);
      setResendCount((prev) => prev + 1);
      setResendCountdown(30);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send OTP. Please try again.");
      console.error("Send OTP error:", error);
    } finally {
      setIsResending(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    await handleSendOTP();
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await api.post("/auth/reset-password", {
        email: data.email,
        otp: data.otp,
        password: data.password,
      });

      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to reset password");
      console.error("Reset password error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const password = form.watch("password");

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
            <CardDescription>Enter your email to receive an OTP</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl h-11"
                disabled={isResending || !email}
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>

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

  // Step 2: OTP and Password Reset
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
          <CardDescription>Enter your OTP and create a new password</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field (Readonly) */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="your@email.com"
                        disabled
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* OTP Field */}
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>One-Time Password</FormLabel>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        disabled={isResending || resendCountdown > 0 || resendCount >= MAX_RESEND_ATTEMPTS}
                        onClick={handleSendOTP}
                        className="text-xs h-auto p-0"
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Sending...
                          </>
                        ) : resendCount >= MAX_RESEND_ATTEMPTS ? (
                          <span className="text-destructive">Resend limit reached</span>
                        ) : resendCountdown > 0 ? (
                          `Resend in ${resendCountdown}s`
                        ) : (
                          `Send OTP (${resendCount}/${MAX_RESEND_ATTEMPTS})`
                        )}
                      </Button>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="000000"
                        maxLength={6}
                        className="tracking-widest text-center text-lg font-mono"
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
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
                control={form.control}
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
                className="w-full"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
              </Button>

              {/* Back to Login Link */}
              <div className="text-center">
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GraduationCap, Eye, EyeOff, Mail, Lock, Users, MapPin, Award } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import loginHeroImage from "@/assets/login-hero.jpg";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { userRole } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // if (userRole === "teacher") {
      //   navigate("/teacher-app", { replace: true });
      // } else {
        navigate("/dashboard", { replace: true });
      // }
    }
  }, [user, userRole, navigate]);

  const validateForm = () => {
    try {
      loginSchema.parse({ email: formData.email, password: formData.password });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Welcome back to GyanSethu!");
        // Navigation will be handled by the useEffect after role is set
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Hero Section (Desktop: 70%, Mobile: Top 35%) */}
      <div className="relative lg:w-[70%] h-[35vh] lg:h-screen overflow-hidden">
        {/* Hero Image */}
        <img
          src={loginHeroImage}
          alt="Children studying in a rural learning center"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Gradient Overlay - Dark Blue to Teal */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(215,25%,15%)] via-[hsl(200,40%,20%)] to-[hsl(174,62%,25%)] opacity-70" />
        
        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6 lg:p-12 xl:p-16">
          {/* Branding - Top Left on Desktop, Center on Mobile */}
          <div className="flex items-center gap-3 lg:justify-start justify-center">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 lg:w-8 lg:h-8 text-primary-foreground" />
            </div>
            <div className="text-center lg:text-left">
              <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">
                GyanSethu
              </h1>
              <p className="text-white/70 text-sm">Bridge to Knowledge</p>
            </div>
          </div>
          
          {/* Hero Text & Stats - Desktop Only */}
          <div className="hidden lg:block space-y-8">
            <div className="max-w-xl">
              <h2 className="text-4xl xl:text-5xl font-display font-bold text-white leading-tight mb-4">
                Empowering Education,<br />
                One Student at a Time
              </h2>
              <p className="text-lg text-white/70 leading-relaxed">
                Supporting learning in communities<br />
                where it matters most.
              </p>
            </div>
            
            {/* Impact Metrics - Glass Cards */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-display font-bold text-white">40K+</div>
                    <div className="text-sm text-white/60">Students Supported</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/30 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-display font-bold text-white">150+</div>
                    <div className="text-sm text-white/60">Learning Clusters</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-info/30 flex items-center justify-center">
                    <Award className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <div className="text-2xl font-display font-bold text-white">1.5K+</div>
                    <div className="text-sm text-white/60">Dedicated Teachers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Empty spacer for mobile layout */}
          <div className="lg:hidden" />
        </div>
      </div>

      {/* Right Panel - Login Card (Desktop: 30%, Mobile: Bottom 65%) */}
      <div className="flex-1 lg:w-[30%] flex items-start lg:items-center justify-center bg-background p-6 lg:p-8 -mt-6 lg:mt-0 rounded-t-3xl lg:rounded-none relative z-20 min-h-[65vh] lg:min-h-0">
        <div className="w-full max-w-sm animate-fade-in">
          <Card variant="elevated" className="border-0 shadow-xl rounded-2xl">
            <CardHeader className="space-y-1 pb-4 pt-6">
              <CardTitle className="text-2xl font-display text-center">
                Welcome to GyanSethu
              </CardTitle>
              <CardDescription className="text-center">
                Sign in to continue supporting students
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 rounded-xl h-11 focus:ring-2 focus:ring-primary/20"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline font-medium"
                      onClick={() => 
                        navigate(`/reset-password?email=${encodeURIComponent(formData.email)}`)
                      }                    
                      >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 rounded-xl h-11 focus:ring-2 focus:ring-primary/20"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full mt-6 rounded-xl h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              {/* Account Access Message */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-center text-muted-foreground">
                  Access provided by Admin
                </p>
                <button
                  type="button"
                  className="w-full mt-2 text-sm text-primary hover:underline font-medium"
                >
                  Contact administrator for access
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Footer Help */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Need help?{" "}
            <a href="#" className="text-primary hover:underline font-medium">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Mail, Lock, User, Building, Stethoscope, Loader, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export default function SignUp() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();
  const [step, setStep] = useState<"role" | "form">("role");
  const [selectedRole, setSelectedRole] = useState<"doctor" | "nurse" | "admin" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "doctor" as "admin" | "doctor" | "nurse",
    specialization: "",
    hospitalName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const roleOptions = [
    {
      role: "doctor" as const,
      title: "Doctor / OB-GYN",
      description: "Healthcare professional providing clinical care and patient management",
      icon: Stethoscope,
      color: "from-blue-500 to-blue-600",
      benefits: ["Full patient access", "Prescribe treatments", "Generate reports"],
    },
    {
      role: "nurse" as const,
      title: "Nurse / Midwife",
      description: "Nursing professionals and midwifery specialists",
      icon: Heart,
      color: "from-pink-500 to-pink-600",
      benefits: ["Monitor patients", "Record observations", "Care coordination"],
    },
    {
      role: "admin" as const,
      title: "Hospital Administrator",
      description: "Administrative and management staff",
      icon: Building,
      color: "from-purple-500 to-purple-600",
      benefits: ["Manage users", "System analytics", "Staff management"],
    },
  ];

  const validateForm = () => {
    let valid = true;
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    if (!formData.role) {
      newErrors.role = "Please select a role";
      valid = false;
    }

    if (!formData.hospitalName.trim()) {
      newErrors.hospitalName = "Hospital name is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRoleSelect = (role: "doctor" | "nurse" | "admin") => {
    setSelectedRole(role);
    setFormData({ ...formData, role });
    setStep("form");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        specialization: formData.specialization,
        hospitalName: formData.hospitalName,
      });

      const loggedIn = useAuthStore.getState().isAuthenticated;
      toast({
        title: "Success",
        description: loggedIn
          ? "Account created successfully! Welcome to Our Moment."
          : "Account created. Please check your email to confirm your account before signing in.",
      });
      navigate(loggedIn ? "/" : "/login");
    } catch (error) {
      toast({
        title: "Sign Up Failed",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-600">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-indigo-900 dark:text-white">Our Moment</h1>
          </div>
          <p className="text-sm text-indigo-700 dark:text-indigo-300">Join Our Maternal Health Platform</p>
        </div>

        {/* Step 1: Role Selection */}
        {step === "role" && (
          <div className="space-y-4">
            <Card className="shadow-lg">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Role</h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Select your professional role to get started
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roleOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.role}
                        onClick={() => handleRoleSelect(option.role)}
                        className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                          selectedRole === option.role
                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950"
                            : "border-border hover:border-indigo-300"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center mb-3 mx-auto`}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-foreground">{option.title}</h3>
                        <p className="text-xs text-muted-foreground mt-2">{option.description}</p>
                        <div className="mt-4 space-y-1">
                          {option.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-muted-foreground">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 pt-6 border-t text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Registration Form */}
        {step === "form" && selectedRole && (
          <Card className="shadow-lg">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setStep("role")}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium flex items-center gap-1"
                >
                  ← Change Role
                </button>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">Complete Your Profile</h2>
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${roleOptions.find(o => o.role === selectedRole)?.color} flex items-center justify-center`}>
                  {(() => {
                    const Icon = roleOptions.find(o => o.role === selectedRole)?.icon;
                    return Icon ? <Icon className="w-5 h-5 text-white" /> : null;
                  })()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {roleOptions.find(o => o.role === selectedRole)?.title}
                  </p>
                  <p className="text-xs text-muted-foreground">Step 2 of 2</p>
                </div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-5">
                {/* Full Name */}
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-foreground mb-2 block">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: "" });
                      }}
                      className="pl-10"
                    />
                  </div>
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-foreground mb-2 block">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      className="pl-10"
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>

                {/* Hospital Name */}
                <div>
                  <Label htmlFor="hospital" className="text-sm font-medium text-foreground mb-2 block">
                    Hospital / Clinic Name *
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="hospital"
                      type="text"
                      placeholder="Enter hospital or clinic name"
                      value={formData.hospitalName}
                      onChange={(e) => {
                        setFormData({ ...formData, hospitalName: e.target.value });
                        if (errors.hospitalName) setErrors({ ...errors, hospitalName: "" });
                      }}
                      className="pl-10"
                    />
                  </div>
                  {errors.hospitalName && <p className="text-sm text-red-500 mt-1">{errors.hospitalName}</p>}
                </div>

                {/* Specialization */}
                {(selectedRole === "doctor" || selectedRole === "nurse") && (
                  <div>
                    <Label htmlFor="specialization" className="text-sm font-medium text-foreground mb-2 block">
                      Specialization (Optional)
                    </Label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="specialization"
                        type="text"
                        placeholder="e.g., OB-GYN, Midwifery, Pediatrics"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-foreground mb-2 block">
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: "" });
                      }}
                      className="pl-10"
                    />
                  </div>
                  {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground mb-2 block">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                      }}
                      className="pl-10"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                  <input type="checkbox" id="terms" className="rounded mt-1" required />
                  <label htmlFor="terms" className="text-xs text-muted-foreground">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>

                {/* Sign Up Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Sign In Link */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected healthcare platform. All data is encrypted and secure.
        </p>
      </div>
    </div>
  );
}

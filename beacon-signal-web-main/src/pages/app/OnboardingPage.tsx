import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Chip, ChipGroup } from "@/components/ui/chip";
import {
  Building2,
  TrendingUp,
  Globe,
  Users,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import type { UserRole, SignalCategory } from "@/types";
import { useAuth } from "@/hooks/useAuth";

const roles = [
  { id: "consulting" as UserRole, label: "Consulting", icon: Building2, example: "McKinsey, Gartner" },
  { id: "vc_pe" as UserRole, label: "VC / PE", icon: TrendingUp, example: "Tiger Global, Sequoia" },
  { id: "research" as UserRole, label: "Research", icon: Globe, example: "WEF, Brookings" },
  { id: "corporate" as UserRole, label: "Corporate Strategy", icon: Users, example: "Fortune 500" },
];

const industries = [
  "Technology", "Healthcare", "Financial Services", "Consumer", "Energy",
  "Manufacturing", "Media", "Real Estate", "Transportation", "Education"
];

const signalTypes: { id: SignalCategory; label: string }[] = [
  { id: "funding", label: "Funding" },
  { id: "ma", label: "M&A" },
  { id: "executive", label: "Executive Moves" },
  { id: "expansion", label: "Expansion" },
  { id: "hiring", label: "Hiring" },
  { id: "layoffs", label: "Layoffs" },
  { id: "product", label: "Product Launches" },
  { id: "partnership", label: "Partnerships" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedSignals, setSelectedSignals] = useState<SignalCategory[]>([]);
  const navigate = useNavigate();
  const { hasCompletedOnboarding, completeOnboarding } = useAuth();

  // Redirect to dashboard if already completed onboarding
  useEffect(() => {
    if (hasCompletedOnboarding) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [hasCompletedOnboarding, navigate]);

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  const toggleSignal = (signal: SignalCategory) => {
    setSelectedSignals((prev) =>
      prev.includes(signal)
        ? prev.filter((s) => s !== signal)
        : [...prev, signal]
    );
  };

  const handleComplete = async () => {
    // Save preferences via auth context (persists to backend + localStorage)
    await completeOnboarding({
      role: selectedRole || '',
      industries: selectedIndustries,
      signals: selectedSignals,
    });
    navigate("/app/dashboard");
  };

  const canProceed = () => {
    if (step === 1) return selectedRole !== null;
    if (step === 2) return selectedIndustries.length > 0;
    if (step === 3) return selectedSignals.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-16 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        <GlassCard className="p-8" variant="strong">
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  What's your role?
                </h1>
                <p className="text-muted-foreground">
                  Help us personalize your experience
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedRole === role.id
                        ? "border-primary bg-primary/10"
                        : "border-border/50 bg-secondary/30 hover:border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedRole === role.id
                            ? "bg-primary/20"
                            : "bg-secondary"
                        }`}
                      >
                        <role.icon
                          className={`w-5 h-5 ${
                            selectedRole === role.id
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {role.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {role.example}
                        </div>
                      </div>
                      {selectedRole === role.id && (
                        <Check className="w-5 h-5 text-primary ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Which industries do you track?
                </h1>
                <p className="text-muted-foreground">
                  Select all that apply
                </p>
              </div>

              <ChipGroup className="justify-center">
                {industries.map((industry) => (
                  <Chip
                    key={industry}
                    variant={
                      selectedIndustries.includes(industry) ? "active" : "outline"
                    }
                    onClick={() => toggleIndustry(industry)}
                  >
                    {industry}
                    {selectedIndustries.includes(industry) && (
                      <Check className="w-3 h-3" />
                    )}
                  </Chip>
                ))}
              </ChipGroup>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  What signals matter most?
                </h1>
                <p className="text-muted-foreground">
                  We'll prioritize these in your feed
                </p>
              </div>

              <ChipGroup className="justify-center">
                {signalTypes.map((signal) => (
                  <Chip
                    key={signal.id}
                    variant={
                      selectedSignals.includes(signal.id) ? "active" : "outline"
                    }
                    onClick={() => toggleSignal(signal.id)}
                  >
                    {signal.label}
                    {selectedSignals.includes(signal.id) && (
                      <Check className="w-3 h-3" />
                    )}
                  </Chip>
                ))}
              </ChipGroup>
            </>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {step < 3 ? (
              <Button
                variant="hero"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="hero"
                onClick={handleComplete}
                disabled={!canProceed()}
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

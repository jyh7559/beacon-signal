import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { Check, Crown, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { plansApi, type PlanOption, type Subscription } from "@/services/api/plans.api";

interface PlansModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptions: Subscription[];
  onSubscribe: (planName: string, frequency: "month" | "year") => Promise<void>;
  onContactSales: () => void;
}

export function PlansModal({
  open,
  onOpenChange,
  subscriptions,
  onSubscribe,
  onContactSales,
}: PlansModalProps) {
  const { toast } = useToast();
  const [availablePlans, setAvailablePlans] = useState<PlanOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscribingPlan, setSubscribingPlan] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadPlans();
    }
  }, [open]);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const response = await plansApi.getAvailablePlans();
      setAvailablePlans(response.plans || []);
    } catch (error) {
      console.error("Failed to load plans:", error);
      toast({ title: "Failed to load plans", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planName: string, frequency: "month" | "year") => {
    setSubscribingPlan(planName);
    try {
      await onSubscribe(planName, frequency);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setSubscribingPlan(null);
    }
  };

  const handleContactSales = () => {
    onOpenChange(false);
    onContactSales();
  };

  const currentPlanName = subscriptions.length > 0 ? subscriptions[0]?.plan?.name : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="h-5 w-5 text-primary" />
            Choose Your Plan
          </DialogTitle>
          <DialogDescription>
            Select a plan that fits your needs. Upgrade anytime to unlock more features.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <GlassCard key={i}>
                  <GlassCardContent className="p-5">
                    <Skeleton className="h-6 w-24 mb-3" />
                    <Skeleton className="h-10 w-32 mb-4" />
                    <div className="space-y-2 mb-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </GlassCardContent>
                </GlassCard>
              ))}
            </div>
          ) : availablePlans.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availablePlans.filter((p) => p.isActive).map((plan) => {
                const isCurrentPlan = currentPlanName === plan.name;
                const isPopular = plan.name === "Business" || plan.name === "Pro";
                const isSubscribing = subscribingPlan === plan.name;

                // Get pricing
                const pricing = plan.pricing;
                const firstResourcePricing = pricing ? Object.values(pricing)[0] : null;
                const monthlyPrice = firstResourcePricing?.monthly;
                const annualPrice = firstResourcePricing?.annual;

                return (
                  <GlassCard
                    key={plan._id}
                    className={cn(
                      "relative transition-all",
                      isPopular && "ring-2 ring-primary",
                      isCurrentPlan && "ring-2 ring-primary/50 bg-primary/5"
                    )}
                  >
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-4">
                        <Badge variant="default" className="shadow-sm">
                          Current Plan
                        </Badge>
                      </div>
                    )}
                    {isPopular && !isCurrentPlan && (
                      <div className="absolute -top-3 right-4">
                        <Badge variant="secondary" className="shadow-sm">
                          Popular
                        </Badge>
                      </div>
                    )}
                    <GlassCardContent className="p-5 pt-6">
                      <h4 className="font-semibold text-lg text-foreground mb-3">
                        {plan.name}
                      </h4>
                      <div className="mb-4">
                        {plan.name === "Trial" || plan.trialValidityDays ? (
                          <div>
                            <span className="text-3xl font-bold text-foreground">Free</span>
                            {plan.trialValidityDays && (
                              <span className="text-sm text-muted-foreground ml-1">
                                / {plan.trialValidityDays} days
                              </span>
                            )}
                          </div>
                        ) : monthlyPrice ? (
                          <div>
                            <span className="text-3xl font-bold text-foreground">
                              ${monthlyPrice}
                            </span>
                            <span className="text-sm text-muted-foreground">/month</span>
                            {annualPrice && (
                              <p className="text-xs text-muted-foreground mt-1">
                                or ${annualPrice}/year (save{" "}
                                {Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100)}%)
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-lg font-medium text-muted-foreground">
                            Custom Pricing
                          </span>
                        )}
                      </div>
                      <ul className="space-y-2 mb-5">
                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          {plan.resources?.length || 0} datasets included
                        </li>
                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          {plan.isDownloadAllowed ? "CSV & Excel downloads" : "View only access"}
                        </li>
                        {plan.isTeamAllowed && plan.maxTeamMembers && (
                          <li className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-primary shrink-0" />
                            Up to {plan.maxTeamMembers} team members
                          </li>
                        )}
                        {plan.maxDaysPreviousData && (
                          <li className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-primary shrink-0" />
                            {plan.maxDaysPreviousData} days historical data
                          </li>
                        )}
                      </ul>
                      {isCurrentPlan ? (
                        <Button variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : monthlyPrice ? (
                        <div className="space-y-2">
                          <Button
                            variant={isPopular ? "default" : "outline"}
                            className="w-full"
                            onClick={() => handleSubscribe(plan.name, "month")}
                            disabled={isSubscribing}
                          >
                            {isSubscribing ? "Subscribing..." : "Subscribe Monthly"}
                          </Button>
                          {annualPrice && (
                            <Button
                              variant="ghost"
                              className="w-full text-xs"
                              onClick={() => handleSubscribe(plan.name, "year")}
                              disabled={isSubscribing}
                            >
                              Subscribe Annually
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleContactSales}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Contact Sales
                        </Button>
                      )}
                    </GlassCardContent>
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            <GlassCard>
              <GlassCardContent className="py-8 text-center">
                <p className="text-muted-foreground">No plans available at the moment.</p>
              </GlassCardContent>
            </GlassCard>
          )}

          {/* Contact Sales CTA */}
          <div className="mt-6 p-4 rounded-lg border border-border/50 bg-muted/30 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Need a custom solution or enterprise features?
            </p>
            <Button variant="outline" onClick={handleContactSales}>
              <Mail className="w-4 h-4 mr-2" />
              Contact Sales
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

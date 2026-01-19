import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { Chip, ChipGroup } from "@/components/ui/chip";
import { PlanCard, type PlanInfo } from "@/components/settings/PlanCard";
import { CreditUsageList, type CreditUsage } from "@/components/settings/CreditUsageBar";
import { ContactSalesModal } from "@/components/settings/ContactSalesModal";
import { PlansModal } from "@/components/settings/PlansModal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  User,
  Users,
  Key,
  Settings2,
  Copy,
  RefreshCw,
  Check,
  Crown,
  Sun,
  Moon,
  Monitor,
  CreditCard,
  Mail,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useContrastMode } from "@/hooks/useContrastMode";
import { SignalCategory } from "@/types";
import { plansApi, type Subscription, type PlanOption } from '@/services/api/plans.api';

const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Retail",
  "Manufacturing",
  "Energy",
  "Media",
  "Telecom",
];

const signalTypes: { value: SignalCategory; label: string }[] = [
  { value: "funding", label: "Funding" },
  { value: "ma", label: "M&A" },
  { value: "executive", label: "Executive" },
  { value: "expansion", label: "Expansion" },
  { value: "hiring", label: "Hiring" },
  { value: "layoffs", label: "Layoffs" },
  { value: "product", label: "Product" },
  { value: "partnership", label: "Partnership" },
];

const roles = [
  { value: "consulting", label: "Consulting" },
  { value: "vc_pe", label: "VC / PE" },
  { value: "research", label: "Research" },
  { value: "corporate", label: "Corporate Strategy" },
  { value: "other", label: "Other" },
];

// Fallback plan data
const fallbackPlan: PlanInfo = {
  name: "Free Trial",
  price: 0,
  billingPeriod: "month",
  renewalDate: "N/A",
  features: [
    "Limited signals",
    "5 saved searches",
    "3 active alerts",
  ],
};

const fallbackCredits: CreditUsage[] = [
  { label: "API Calls", used: 0, total: 1000 },
  { label: "Signals Viewed", used: 0, total: 1000 },
  { label: "Exports", used: 0, total: 50 },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { contrastMode, setContrastMode } = useContrastMode();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";
  const [copied, setCopied] = useState(false);
  const [contactSalesOpen, setContactSalesOpen] = useState(false);
  const [plansModalOpen, setPlansModalOpen] = useState(false);

  // Subscription state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [availablePlans, setAvailablePlans] = useState<PlanOption[]>([]);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  // Profile state
  const [name, setName] = useState("Alex Johnson");
  const [email, setEmail] = useState("alex@company.com");
  const [company, setCompany] = useState("Acme Corp");
  const [role, setRole] = useState("consulting");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([
    "Technology",
    "Finance",
  ]);
  const [selectedSignalTypes, setSelectedSignalTypes] = useState<SignalCategory[]>([
    "funding",
    "ma",
    "executive",
  ]);

  // Preferences state
  const [emailDigest, setEmailDigest] = useState("daily");
  const [notifications, setNotifications] = useState(true);
  const [timezone, setTimezone] = useState("America/Los_Angeles");

  const apiKey = "sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

  // Resource labels for friendly names
  const [resourceLabels, setResourceLabels] = useState<Record<string, string>>({});

  // Fetch subscriptions on mount
  useEffect(() => {
    const fetchSubscriptions = async () => {
      setIsLoadingPlan(true);
      try {
        const [subs, plansResponse] = await Promise.all([
          plansApi.getMySubscriptions(),
          plansApi.getAvailablePlans(),
        ]);
        setSubscriptions(subs);
        setAvailablePlans(plansResponse.plans || []);
        // Store resource labels for friendly names
        if (plansResponse.resourceLabels) {
          setResourceLabels(plansResponse.resourceLabels);
        }
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
        // Use fallback data on error
      } finally {
        setIsLoadingPlan(false);
      }
    };
    fetchSubscriptions();
  }, []);

  // Helper to get friendly resource label
  const getResourceLabel = (resource: string): string => {
    if (resourceLabels[resource]) {
      return resourceLabels[resource];
    }
    // Fallback: format the resource key nicely
    const name = resource.replace('dataset.', '').replace(/_/g, ' ');
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Convert subscription to PlanInfo
  const getCurrentPlan = (): PlanInfo => {
    if (subscriptions.length === 0) return fallbackPlan;

    // Get plan name from first subscription
    const planName = subscriptions[0]?.plan?.name || 'Trial';
    
    // Calculate renewal date from expiresOn
    const expiresOn = subscriptions[0]?.expiresOn 
      ? new Date(subscriptions[0].expiresOn).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })
      : 'N/A';
    
    // Get features from resources using resourceLabels for friendly names
    const features = subscriptions.map(s => getResourceLabel(s.resource));
    
    return {
      name: planName,
      price: 0, // Trial is free
      billingPeriod: 'month',
      renewalDate: expiresOn,
      features,
    };
  };

  // Calculate days until renewal
  const getDaysUntilRenewal = (): number => {
    if (subscriptions.length === 0) return 0;
    const expiresOn = subscriptions[0]?.expiresOn;
    if (!expiresOn) return 0;
    const endDate = new Date(expiresOn);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast({ title: "API key copied" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateApiKey = () => {
    toast({ title: "API key regenerated", description: "Your old key will stop working immediately." });
  };

  const handleSaveProfile = () => {
    toast({ title: "Profile saved" });
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  const toggleSignalType = (type: SignalCategory) => {
    setSelectedSignalTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleUpgrade = () => {
    // Open the plans modal
    setPlansModalOpen(true);
  };

  const handleManageBilling = () => {
    setContactSalesOpen(true);
  };

  const handleSubscribe = async (planName: string, frequency: 'month' | 'year') => {
    try {
      await plansApi.subscribe({ planName, frequency });
      toast({ title: "Subscription updated!", description: `You are now subscribed to ${planName}` });
      // Refresh subscriptions
      const subs = await plansApi.getMySubscriptions();
      setSubscriptions(subs);
    } catch (error) {
      toast({ 
        title: "Subscription failed", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive" 
      });
    }
  };

  return (
    <>
    <PlansModal
      open={plansModalOpen}
      onOpenChange={setPlansModalOpen}
      subscriptions={subscriptions}
      onSubscribe={handleSubscribe}
      onContactSales={() => {
        setPlansModalOpen(false);
        setContactSalesOpen(true);
      }}
    />
    <ContactSalesModal
      open={contactSalesOpen}
      onOpenChange={setContactSalesOpen}
      userName={name}
      userEmail={email}
      userCompany={company}
      userRole={role}
      currentPlan={getCurrentPlan().name}
      subscriptions={subscriptions}
    />
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="bg-secondary/50 p-1">
          <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-background">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-2 data-[state=active]:bg-background">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Plan</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2 data-[state=active]:bg-background">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2 data-[state=active]:bg-background">
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2 data-[state=active]:bg-background">
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Prefs</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Profile Information</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground font-semibold">
                      AJ
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                </div>

                {/* Form Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Industries */}
                <div className="space-y-3">
                  <Label>Industries</Label>
                  <ChipGroup>
                    {industries.map((industry) => (
                      <Chip
                        key={industry}
                        variant={
                          selectedIndustries.includes(industry) ? "active" : "default"
                        }
                        onClick={() => toggleIndustry(industry)}
                        size="sm"
                      >
                        {industry}
                      </Chip>
                    ))}
                  </ChipGroup>
                </div>

                {/* Signal Types */}
                <div className="space-y-3">
                  <Label>Preferred Signal Types</Label>
                  <ChipGroup>
                    {signalTypes.map((type) => (
                      <Chip
                        key={type.value}
                        variant={
                          selectedSignalTypes.includes(type.value) ? "active" : "default"
                        }
                        onClick={() => toggleSignalType(type.value)}
                        size="sm"
                      >
                        {type.label}
                      </Chip>
                    ))}
                  </ChipGroup>
                </div>

                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </GlassCardContent>
            </GlassCard>
          </motion.div>
        </TabsContent>

        {/* Plan Tab */}
        <TabsContent value="plan">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Current Plan */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Current Plan</h3>
              {isLoadingPlan ? (
                <GlassCard className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-24" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </GlassCard>
              ) : (
                <PlanCard 
                  plan={getCurrentPlan()}
                  onUpgrade={handleUpgrade}
                  onManageBilling={handleManageBilling}
                />
              )}
            </div>

            {/* Credits Usage */}
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Credits Usage</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                {isLoadingPlan ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <CreditUsageList
                    usages={fallbackCredits}
                    resetDate={getCurrentPlan().renewalDate}
                    daysUntilReset={getDaysUntilRenewal()}
                  />
                )}
              </GlassCardContent>
            </GlassCard>

            {/* Available Plans */}
            <div data-plans-section>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Available Plans</h3>
              {isLoadingPlan ? (
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
                  {availablePlans.filter(p => p.isActive).map((plan) => {
                    const isCurrentPlan = subscriptions.length > 0 && 
                      subscriptions[0]?.plan?.name === plan.name;
                    const isPopular = plan.name === 'Business' || plan.name === 'Pro';
                    
                    // Get pricing - check for any resource pricing or use defaults
                    const pricing = plan.pricing;
                    const firstResourcePricing = pricing ? Object.values(pricing)[0] : null;
                    const monthlyPrice = firstResourcePricing?.monthly;
                    const annualPrice = firstResourcePricing?.annual;
                    
                    return (
                      <GlassCard key={plan._id} className={cn(
                        "relative",
                        isPopular && "ring-2 ring-primary",
                        isCurrentPlan && "ring-2 ring-primary/50 bg-primary/5"
                      )}>
                        {isCurrentPlan && (
                          <div className="absolute -top-3 left-4">
                            <Badge variant="default" className="shadow-sm">Current Plan</Badge>
                          </div>
                        )}
                        <GlassCardContent className="p-5 pt-6">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-foreground">{plan.name}</h4>
                            {isPopular && !isCurrentPlan && (
                              <Badge variant="secondary">Popular</Badge>
                            )}
                          </div>
                          <div className="mb-4">
                            {plan.name === 'Trial' || plan.trialValidityDays ? (
                              <div>
                                <span className="text-2xl font-bold text-foreground">Free</span>
                                {plan.trialValidityDays && (
                                  <span className="text-sm text-muted-foreground ml-1">
                                    / {plan.trialValidityDays} days
                                  </span>
                                )}
                              </div>
                            ) : monthlyPrice ? (
                              <div>
                                <span className="text-2xl font-bold text-foreground">${monthlyPrice}</span>
                                <span className="text-sm text-muted-foreground">/month</span>
                                {annualPrice && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    or ${annualPrice}/year (save {Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100)}%)
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-lg font-medium text-muted-foreground">
                                Contact Sales
                              </span>
                            )}
                          </div>
                          <ul className="space-y-2 mb-4">
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="w-4 h-4 text-primary shrink-0" />
                              {plan.resources?.length || 0} datasets included
                            </li>
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="w-4 h-4 text-primary shrink-0" />
                              {plan.isDownloadAllowed ? 'CSV & Excel downloads' : 'View only access'}
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
                                onClick={() => handleSubscribe(plan.name, 'month')}
                              >
                                Subscribe Monthly
                              </Button>
                              {annualPrice && (
                                <Button 
                                  variant="ghost" 
                                  className="w-full text-xs"
                                  onClick={() => handleSubscribe(plan.name, 'year')}
                                >
                                  Subscribe Annually
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button variant="outline" className="w-full">
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
            </div>
          </motion.div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard>
              <GlassCardContent className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                  <Crown className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Team Management
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Invite team members and manage permissions with Team or Enterprise plans.
                </p>
                <Button>Upgrade to Team</Button>
              </GlassCardContent>
            </GlassCard>
          </motion.div>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>API Access</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Your API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      value={apiKey.replace(/./g, "•")}
                      readOnly
                      className="font-mono"
                    />
                    <Button variant="outline" size="icon" onClick={handleCopyApiKey}>
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleRegenerateApiKey}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Never share your API key. Regenerating will invalidate the old key.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-secondary/50 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">
                      Rate Limit
                    </span>
                    <Badge variant="teal">Individual Plan</Badge>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    10,000{" "}
                    <span className="text-base font-normal text-muted-foreground">
                      calls/month
                    </span>
                  </p>
                  <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-1/3 bg-primary rounded-full" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    3,200 / 10,000 calls used this month
                  </p>
                </div>
              </GlassCardContent>
            </GlassCard>
          </motion.div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Preferences</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-6">
                {/* Theme */}
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("light")}
                      className="flex-1"
                    >
                      <Sun className="w-4 h-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("dark")}
                      className="flex-1"
                    >
                      <Moon className="w-4 h-4 mr-2" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("system")}
                      className="flex-1"
                    >
                      <Monitor className="w-4 h-4 mr-2" />
                      System
                    </Button>
                  </div>
                </div>

                {/* Display Mode / Contrast */}
                <div className="space-y-3">
                  <Label>Display Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose a display mode that's comfortable for your eyes
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant={contrastMode === "comfortable" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setContrastMode("comfortable")}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Comfortable
                    </Button>
                    <Button
                      variant={contrastMode === "high-contrast" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setContrastMode("high-contrast")}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      High Contrast
                    </Button>
                  </div>
                </div>

                {/* Email Digest */}
                <div className="space-y-2">
                  <Label htmlFor="digest">Email Digest</Label>
                  <Select value={emailDigest} onValueChange={setEmailDigest}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="off">Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser notifications for alerts
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">
                        Eastern Time (ET)
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        Central Time (CT)
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        Mountain Time (MT)
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        Pacific Time (PT)
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        London (GMT)
                      </SelectItem>
                      <SelectItem value="Europe/Paris">
                        Paris (CET)
                      </SelectItem>
                      <SelectItem value="Asia/Tokyo">
                        Tokyo (JST)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={() => toast({ title: "Preferences saved" })}>
                  Save Preferences
                </Button>
              </GlassCardContent>
            </GlassCard>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}

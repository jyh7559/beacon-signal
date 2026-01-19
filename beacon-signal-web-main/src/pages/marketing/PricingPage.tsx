import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Check,
  ArrowRight,
  Users,
  Building2,
  Briefcase,
  Crown,
} from "lucide-react";

const tiers = [
  {
    id: "trial",
    name: "Trial",
    description: "Try Intellizence free for 14 days",
    price: 0,
    period: "14 days",
    icon: Briefcase,
    features: [
      "100 signal views per day",
      "2 saved searches",
      "1 alert rule",
      "Basic API access",
      "Email support",
    ],
    limits: {
      signals: "100/day",
      savedSearches: "2",
      alerts: "1",
      apiCalls: "1,000/mo",
      users: "1",
    },
    cta: "Start trial",
    highlighted: false,
  },
  {
    id: "individual",
    name: "Individual",
    description: "For solo researchers and analysts",
    price: 99,
    period: "month",
    icon: Users,
    features: [
      "Unlimited signal views",
      "10 saved searches",
      "5 alert rules",
      "Full API access",
      "CSV export",
      "Priority email support",
    ],
    limits: {
      signals: "Unlimited",
      savedSearches: "10",
      alerts: "5",
      apiCalls: "10,000/mo",
      users: "1",
    },
    cta: "Get started",
    highlighted: false,
  },
  {
    id: "team",
    name: "Team",
    description: "For growing intelligence teams",
    price: 299,
    period: "month",
    icon: Building2,
    features: [
      "Everything in Individual",
      "Unlimited saved searches",
      "25 alert rules",
      "Team workspaces",
      "Shared bookmarks",
      "Webhook integrations",
      "Slack notifications",
      "Dedicated support",
    ],
    limits: {
      signals: "Unlimited",
      savedSearches: "Unlimited",
      alerts: "25",
      apiCalls: "100,000/mo",
      users: "10",
    },
    cta: "Start team trial",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with custom needs",
    price: null,
    period: "custom",
    icon: Crown,
    features: [
      "Everything in Team",
      "Unlimited everything",
      "Custom data feeds",
      "SSO / SAML",
      "Role-based access",
      "Custom integrations",
      "On-prem deployment option",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    limits: {
      signals: "Unlimited",
      savedSearches: "Unlimited",
      alerts: "Unlimited",
      apiCalls: "Unlimited",
      users: "Unlimited",
    },
    cta: "Contact sales",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="py-20">
      {/* Hero */}
      <section className="relative pb-16">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="teal" className="mb-6">
              Simple, transparent pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Choose your plan
            </h1>
            <p className="text-lg text-muted-foreground">
              Start free, scale as you grow. All plans include our core intelligence features.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard
                  className={`p-6 h-full flex flex-col ${
                    tier.highlighted ? "ring-2 ring-primary" : ""
                  }`}
                  hover
                >
                  {tier.highlighted && (
                    <Badge variant="realtime" className="self-start mb-4">
                      Most popular
                    </Badge>
                  )}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      tier.highlighted ? "bg-primary/20" : "bg-secondary"
                    }`}>
                      <tier.icon className={`w-5 h-5 ${
                        tier.highlighted ? "text-primary" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{tier.name}</h3>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

                  <div className="mb-6">
                    {tier.price !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground">${tier.price}</span>
                        <span className="text-muted-foreground">/{tier.period}</span>
                      </div>
                    ) : (
                      <div className="text-4xl font-bold text-foreground">Custom</div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to={tier.id === "enterprise" ? "#" : "/app/login"}>
                    <Button
                      variant={tier.highlighted ? "hero" : "outline"}
                      className="w-full"
                    >
                      {tier.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently asked questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto grid gap-6">
            {[
              {
                q: "Can I switch plans later?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, ACH transfers for annual plans, and can invoice enterprise customers.",
              },
              {
                q: "Is there a discount for annual billing?",
                a: "Yes, annual plans receive a 20% discount compared to monthly billing.",
              },
              {
                q: "What happens when I reach my API limit?",
                a: "You'll receive a notification at 80% usage. You can upgrade anytime or purchase additional API credits.",
              },
            ].map((faq, i) => (
              <GlassCard key={i} className="p-6" hover>
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

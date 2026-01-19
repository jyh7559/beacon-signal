import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Link } from "react-router-dom";
import {
  Search,
  Bell,
  Bookmark,
  BarChart3,
  Download,
  Users,
  ArrowRight,
  CheckCircle,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Real-time Signal Feed",
    description: "Track funding rounds, M&A, executive moves, expansions, and more as they happen. Filter by category, company, geography, and confidence level.",
    benefits: ["Sub-minute latency", "Advanced filters", "Confidence scoring"],
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Create rules to monitor competitors, portfolios, or market segments. Get notified via email, Slack, or webhook when signals match your criteria.",
    benefits: ["Custom conditions", "Multi-channel delivery", "Webhook support"],
  },
  {
    icon: Bookmark,
    title: "Saved Searches & Bookmarks",
    description: "Save your favorite search queries and bookmark important signals. Organize with folders and tags for easy retrieval.",
    benefits: ["Shareable views", "Folder organization", "Quick re-run"],
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Visualize signal trends, track KPIs, and monitor your coverage. See what's happening in your market at a glance.",
    benefits: ["Trend analysis", "Custom KPIs", "Team metrics"],
  },
  {
    icon: Download,
    title: "Export & Integrate",
    description: "Export signals to CSV or JSON. Push data to your data warehouse via API or connect to tools like Tableau and Looker.",
    benefits: ["CSV/JSON export", "REST API", "Warehouse sync"],
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share searches, bookmarks, and alerts with your team. Role-based access ensures the right people see the right data.",
    benefits: ["Shared workspaces", "Role permissions", "Activity feed"],
  },
];

export default function ProductPage() {
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
              <Zap className="w-3 h-3 mr-1.5" />
              Platform overview
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Intelligence, delivered
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              From real-time signal tracking to team collaboration, Intellizence gives you 
              everything you need to stay ahead of the market.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/app/login">
                <Button variant="hero" size="lg">
                  Start free trial
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="hero-outline" size="lg">
                  View pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-8" hover>
                  <div className={`grid lg:grid-cols-2 gap-8 items-center ${
                    i % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}>
                    <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                        <feature.icon className="w-7 h-7 text-primary" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                        {feature.title}
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        {feature.description}
                      </p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit) => (
                          <li key={benefit} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={`bg-card/30 rounded-xl p-8 border border-border/50 ${
                      i % 2 === 1 ? "lg:order-1" : ""
                    }`}>
                      <div className="aspect-video bg-secondary/50 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <GlassCard className="p-12 text-center" variant="strong">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to see it in action?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Start your free trial today. No credit card required.
            </p>
            <Link to="/app/login">
              <Button variant="hero" size="xl">
                Start free trial
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import {
  Zap,
  TrendingUp,
  Shield,
  Globe,
  ArrowRight,
  DollarSign,
  GitMerge,
  UserCog,
  Users,
  TrendingDown,
  Rocket,
  Handshake,
  Building2,
  BarChart3,
  Bell,
  Search,
} from "lucide-react";

const stats = [
  { value: "50K+", label: "Companies tracked" },
  { value: "2.8M+", label: "Signals daily" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "150+", label: "Enterprise clients" },
];

const datasets = [
  { icon: DollarSign, name: "Funding Events", count: "2.8M+" },
  { icon: GitMerge, name: "M&A Transactions", count: "584K+" },
  { icon: UserCog, name: "Executive Moves", count: "1.2M+" },
  { icon: Globe, name: "Expansion Signals", count: "847K+" },
  { icon: Users, name: "Hiring Trends", count: "12.8M+" },
  { icon: TrendingDown, name: "Layoffs", count: "234K+" },
  { icon: Rocket, name: "Product Launches", count: "3.8M+" },
  { icon: Handshake, name: "Partnerships", count: "928K+" },
];

const features = [
  {
    icon: Search,
    title: "Real-time Signal Feed",
    description: "Track funding rounds, M&A, executive moves, and more as they happen.",
  },
  {
    icon: Bell,
    title: "Custom Alerts",
    description: "Get notified when competitors make moves or key signals emerge.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Deep dive into trends with faceted search and exportable insights.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 Type II certified with SSO and role-based access control.",
  },
];

const personas = [
  {
    icon: Building2,
    role: "Consulting",
    example: "McKinsey, Gartner",
    useCase: "Fast market maps and exportable evidence",
  },
  {
    icon: TrendingUp,
    role: "VC / PE",
    example: "Tiger Global, Sequoia",
    useCase: "Deal sourcing and portfolio monitoring",
  },
  {
    icon: Globe,
    role: "Research",
    example: "WEF, Brookings",
    useCase: "Macro trend tracking and shareable briefs",
  },
  {
    icon: Users,
    role: "Corporate Strategy",
    example: "Fortune 500",
    useCase: "Account monitoring and risk signals",
  },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="teal" className="mb-6 py-1.5 px-4">
                <Zap className="w-3 h-3 mr-1.5" />
                Real-time business intelligence
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
            >
              Track every signal.{" "}
              <span className="text-gradient-teal">Move faster.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              The intelligence platform for enterprise teams. Monitor competitors, 
              track funding rounds, and spot opportunities before anyone else.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/app/login">
                <Button variant="hero" size="xl">
                  Start free trial
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/product">
                <Button variant="hero-outline" size="xl">
                  See how it works
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <GlassCard key={i} className="text-center p-6" hover>
                <GlassCardContent className="p-0">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </GlassCardContent>
              </GlassCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Datasets Preview */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              8 core datasets. One platform.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access structured intelligence across the signals that matter most to your business.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {datasets.map((dataset, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard hover className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <dataset.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{dataset.name}</h3>
                  <p className="text-sm text-muted-foreground">{dataset.count} records</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/datasets">
              <Button variant="outline" size="lg">
                Explore all datasets
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 relative bg-card/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for intelligence teams
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to stay ahead of the market, from signal tracking to team collaboration.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard hover className="p-6 h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Personas */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by leading teams
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From consulting firms to investment teams, see how intelligence leaders use Intellizence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((persona, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard hover className="p-6 h-full">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <persona.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{persona.role}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{persona.example}</p>
                  <p className="text-sm text-muted-foreground">{persona.useCase}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <GlassCard variant="strong" className="p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to move faster?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Start your free trial today. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/app/login">
                  <Button variant="hero" size="xl">
                    Start free trial
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="hero-outline" size="xl">
                    View pricing
                  </Button>
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}

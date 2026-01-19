import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Link } from "react-router-dom";
import {
  Code,
  Book,
  Terminal,
  Zap,
  ArrowRight,
  ExternalLink,
  FileJson,
  Key,
  Webhook,
} from "lucide-react";

const quickLinks = [
  {
    icon: Terminal,
    title: "Quick Start",
    description: "Get up and running with our API in 5 minutes.",
    href: "#",
  },
  {
    icon: FileJson,
    title: "API Reference",
    description: "Complete documentation for all endpoints.",
    href: "#",
  },
  {
    icon: Key,
    title: "Authentication",
    description: "Learn how to authenticate your requests.",
    href: "#",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description: "Set up real-time event notifications.",
    href: "#",
  },
];

const sdks = [
  { name: "Python", version: "2.1.0", href: "#" },
  { name: "JavaScript", version: "2.0.3", href: "#" },
  { name: "Ruby", version: "1.5.2", href: "#" },
  { name: "Go", version: "1.3.0", href: "#" },
];

export default function DocsPage() {
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
            <Badge variant="api" className="mb-6">
              <Code className="w-3 h-3 mr-1.5" />
              Developer Hub
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Build with Intellizence
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Access our comprehensive API documentation, SDKs, and guides to integrate 
              business intelligence into your applications.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="hero" size="lg">
                <Book className="w-4 h-4" />
                Read the docs
              </Button>
              <Link to="/app/login">
                <Button variant="hero-outline" size="lg">
                  Get API key
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, i) => (
              <motion.a
                key={i}
                href={link.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-6 h-full group" hover>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <link.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    {link.title}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </GlassCard>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* API Preview */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <GlassCard className="p-8" variant="strong">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <Badge variant="realtime" className="mb-4">
                  <Zap className="w-3 h-3 mr-1.5" />
                  REST API
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Simple, powerful API
                </h2>
                <p className="text-muted-foreground mb-6">
                  Our REST API gives you access to all Intellizence data. Query signals, 
                  manage alerts, and export data programmatically.
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Base URL</h4>
                    <code className="text-sm bg-secondary px-3 py-1.5 rounded text-primary font-mono">
                      https://api.intellizence.io/v1
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Bearer token via <code className="text-primary">Authorization</code> header
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-background/50 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-muted-foreground">
{`# Get latest funding signals
curl -X GET "https://api.intellizence.io/v1/signals" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "category": "funding",
    "limit": 10,
    "confidence_min": 80
  }'`}
                </pre>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* SDKs */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Official SDKs
            </h2>
            <p className="text-muted-foreground">
              Get started faster with our official client libraries.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {sdks.map((sdk, i) => (
              <motion.a
                key={i}
                href={sdk.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="p-4 text-center group" hover>
                  <h3 className="font-semibold text-foreground mb-1">{sdk.name}</h3>
                  <p className="text-xs text-muted-foreground">v{sdk.version}</p>
                </GlassCard>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <GlassCard className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to integrate?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Sign up for a free trial to get your API key and start building.
            </p>
            <Link to="/app/login">
              <Button variant="hero" size="lg">
                Get API key
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}

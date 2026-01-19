import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Link } from "react-router-dom";
import {
  Shield,
  Lock,
  Key,
  FileCheck,
  Server,
  Eye,
  Users,
  RefreshCw,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const certifications = [
  { name: "SOC 2 Type II", icon: FileCheck, description: "Annual audit completed" },
  { name: "GDPR Compliant", icon: Shield, description: "EU data protection" },
  { name: "ISO 27001", icon: Lock, description: "Information security" },
  { name: "CCPA Ready", icon: Eye, description: "California privacy" },
];

const features = [
  {
    icon: Key,
    title: "SSO / SAML",
    description: "Enterprise single sign-on with Okta, Azure AD, Google Workspace, and custom SAML providers.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Granular permissions for admins, analysts, and viewers. Control who sees what.",
  },
  {
    icon: Lock,
    title: "Encryption",
    description: "AES-256 encryption at rest, TLS 1.3 in transit. Zero-trust architecture.",
  },
  {
    icon: Server,
    title: "Data Residency",
    description: "Choose where your data lives. US, EU, and custom deployment options available.",
  },
  {
    icon: RefreshCw,
    title: "Audit Logs",
    description: "Complete audit trail of all user actions. Export logs to your SIEM.",
  },
  {
    icon: Eye,
    title: "Privacy Controls",
    description: "Data retention policies, right to deletion, and anonymization tools.",
  },
];

const practices = [
  "Penetration testing quarterly by third-party security firms",
  "Bug bounty program with responsible disclosure policy",
  "24/7 security monitoring and incident response team",
  "Automated vulnerability scanning on every deployment",
  "Employee security training and background checks",
  "Multi-factor authentication required for all staff",
];

export default function SecurityPage() {
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
              <Shield className="w-3 h-3 mr-1.5" />
              Enterprise-grade security
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Your data, protected
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              We take security seriously. Intellizence is built from the ground up 
              with enterprise security requirements in mind.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a href="#" target="_blank" rel="noopener noreferrer">
                <Button variant="hero" size="lg">
                  Download security whitepaper
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <Link to="/app/login">
                <Button variant="hero-outline" size="lg">
                  Contact security team
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Certifications */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certifications.map((cert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-6 text-center" hover>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <cert.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{cert.name}</h3>
                  <p className="text-xs text-muted-foreground">{cert.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Security features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise controls to keep your data safe and compliant.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="p-6 h-full" hover>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <GlassCard className="p-8" variant="strong">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Our security practices
                </h2>
                <p className="text-muted-foreground mb-6">
                  Security isn't just a feature—it's how we operate. Here's what we do to keep your data safe.
                </p>
              </div>
              <div className="space-y-3">
                {practices.map((practice, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{practice}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Contact */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <GlassCard className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Have security questions?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Our security team is happy to answer questions, provide additional documentation, 
              or discuss custom security requirements.
            </p>
            <Button variant="hero" size="lg">
              Contact security team
              <ArrowRight className="w-4 h-4" />
            </Button>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}

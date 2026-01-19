import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import {
  ArrowRight,
  DollarSign,
  GitMerge,
  UserCog,
  Globe,
  Users,
  TrendingDown,
  Rocket,
  Handshake,
  Database,
  RefreshCw,
  Code,
} from "lucide-react";

const datasets = [
  {
    id: "funding",
    icon: DollarSign,
    name: "Funding Events",
    description: "Real-time funding rounds, investments, and valuations across 50,000+ companies globally.",
    recordCount: "2.8M+",
    updateFrequency: "realtime",
    fields: ["company_name", "round_type", "amount", "valuation", "investors", "date"],
  },
  {
    id: "ma",
    icon: GitMerge,
    name: "M&A Transactions",
    description: "Mergers, acquisitions, and divestitures with deal terms and strategic rationale.",
    recordCount: "584K+",
    updateFrequency: "daily",
    fields: ["acquirer", "target", "deal_value", "status", "announced_date"],
  },
  {
    id: "executive",
    icon: UserCog,
    name: "Executive Moves",
    description: "C-suite appointments, departures, and board changes at tracked companies.",
    recordCount: "1.2M+",
    updateFrequency: "daily",
    fields: ["person_name", "company", "new_role", "previous_role", "effective_date"],
  },
  {
    id: "expansion",
    icon: Globe,
    name: "Expansion Signals",
    description: "Geographic expansion, new market entry, and office openings worldwide.",
    recordCount: "847K+",
    updateFrequency: "daily",
    fields: ["company", "expansion_type", "location", "investment"],
  },
  {
    id: "hiring",
    icon: Users,
    name: "Hiring Trends",
    description: "Job postings, hiring volume, and talent acquisition trends by company and role.",
    recordCount: "12.8M+",
    updateFrequency: "weekly",
    fields: ["company", "department", "open_roles", "growth_rate"],
  },
  {
    id: "layoffs",
    icon: TrendingDown,
    name: "Layoffs & Restructuring",
    description: "Workforce reductions, restructuring announcements, and severance details.",
    recordCount: "234K+",
    updateFrequency: "daily",
    fields: ["company", "affected_employees", "percentage", "departments"],
  },
  {
    id: "product",
    icon: Rocket,
    name: "Product Launches",
    description: "New product announcements, feature releases, and product pivots.",
    recordCount: "3.8M+",
    updateFrequency: "realtime",
    fields: ["company", "product_name", "category", "launch_date"],
  },
  {
    id: "partnership",
    icon: Handshake,
    name: "Partnerships",
    description: "Strategic partnerships, joint ventures, and collaboration announcements.",
    recordCount: "928K+",
    updateFrequency: "daily",
    fields: ["partner_1", "partner_2", "partnership_type", "value"],
  },
];

const getFrequencyBadge = (freq: string) => {
  switch (freq) {
    case "realtime":
      return <Badge variant="realtime">Real-time</Badge>;
    case "daily":
      return <Badge variant="api">Daily</Badge>;
    case "weekly":
      return <Badge variant="weekly">Weekly</Badge>;
    default:
      return <Badge variant="secondary">{freq}</Badge>;
  }
};

export default function DatasetsPage() {
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
              <Database className="w-3 h-3 mr-1.5" />
              Enterprise-grade data
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              8 core datasets. One API.
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Access structured, normalized intelligence across the business signals that matter most. 
              Updated in real-time with 99.9% uptime SLA.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/app/login">
                <Button variant="hero" size="lg">
                  Request sample data
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button variant="hero-outline" size="lg">
                  <Code className="w-4 h-4" />
                  API docs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "23M+", label: "Total records" },
              { value: "50K+", label: "Companies tracked" },
              { value: "150+", label: "Countries covered" },
              { value: "99.9%", label: "API uptime" },
            ].map((stat, i) => (
              <GlassCard key={i} className="p-6 text-center" hover>
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Dataset Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {datasets.map((dataset, i) => (
              <motion.div
                key={dataset.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="p-6 h-full" hover>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <dataset.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{dataset.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getFrequencyBadge(dataset.updateFrequency)}
                          <span className="text-xs text-muted-foreground">
                            {dataset.recordCount} records
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">{dataset.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {dataset.fields.map((field) => (
                      <code
                        key={field}
                        className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground font-mono"
                      >
                        {field}
                      </code>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <Link to={`/app/datasets`}>
                      <Button variant="outline" size="sm">
                        View schema
                      </Button>
                    </Link>
                    <Link to="/app/login">
                      <Button variant="ghost" size="sm">
                        Request sample
                      </Button>
                    </Link>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* API Preview */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <GlassCard className="p-8" variant="strong">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge variant="api" className="mb-4">
                  <RefreshCw className="w-3 h-3 mr-1.5" />
                  RESTful API
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Build with our API
                </h2>
                <p className="text-muted-foreground mb-6">
                  Access all datasets programmatically with our REST API. 
                  Full documentation, SDKs for Python and JavaScript, and webhook support.
                </p>
                <Link to="/docs">
                  <Button variant="hero" size="lg">
                    <Code className="w-4 h-4" />
                    API documentation
                  </Button>
                </Link>
              </div>
              <div className="bg-background/50 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-muted-foreground">
{`GET /v1/signals?category=funding&limit=10

{
  "data": [
    {
      "id": "sig_abc123",
      "title": "Stripe raises Series I",
      "company": "Stripe",
      "category": "funding",
      "amount": 6500000000,
      "confidence": 98,
      "published_at": "2024-01-15T..."
    }
  ],
  "total": 2847,
  "has_more": true
}`}
                </pre>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Rss } from "lucide-react";

const posts = [
  {
    title: "Introducing Real-time M&A Tracking",
    excerpt: "Track merger and acquisition activity as it happens with our new real-time M&A dataset.",
    date: "Dec 15, 2024",
    category: "Product",
    readTime: "3 min read",
  },
  {
    title: "How Top Consulting Firms Use Intellizence",
    excerpt: "Learn how McKinsey, BCG, and Bain leverage our platform for competitive intelligence.",
    date: "Dec 10, 2024",
    category: "Case Study",
    readTime: "5 min read",
  },
  {
    title: "2024 Funding Trends Report",
    excerpt: "Our analysis of Q4 2024 funding activity across tech, healthcare, and fintech.",
    date: "Dec 5, 2024",
    category: "Research",
    readTime: "8 min read",
  },
  {
    title: "API v2.0 Now Available",
    excerpt: "Faster queries, new endpoints, and improved webhook reliability in our latest release.",
    date: "Nov 28, 2024",
    category: "Engineering",
    readTime: "4 min read",
  },
];

export default function BlogPage() {
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
              <Rss className="w-3 h-3 mr-1.5" />
              Blog
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Insights & Updates
            </h1>
            <p className="text-lg text-muted-foreground">
              Product updates, research reports, and intelligence insights from the Intellizence team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {posts.map((post, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-6 cursor-pointer" hover>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="teal">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground">{post.excerpt}</p>
                </GlassCard>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

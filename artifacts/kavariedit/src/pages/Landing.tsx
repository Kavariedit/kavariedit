import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@workspace/replit-auth-web";
import { Link } from "wouter";
import { ArrowRight, Palette, Mic2, Flag, ShoppingBag, LayoutTemplate } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const { login } = useAuth();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-40">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-abstract.png`} 
            alt="Abstract background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container relative z-10 px-4 md:px-6 mx-auto text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-secondary text-secondary-foreground text-sm font-medium mb-8 backdrop-blur-sm">
              <span className="flex w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              The ultimate creator toolkit is here
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground leading-[1.1] tracking-tight mb-6">
              From Idea to <span className="text-gradient">First Sale</span> <br className="hidden md:block"/> in 14 Days.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              No design skills? No problem. Extract brand DNA, customize aesthetic templates, clone your voice for content, and track your success—all in one elegant platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={login} className="h-14 px-8 text-base rounded-full shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all w-full sm:w-auto">
                Start Your 14-Day Sprint <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-base rounded-full border-2 bg-white/50 backdrop-blur-sm hover:bg-white w-full sm:w-auto">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white/40 border-y border-white/50 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Everything you need to build your digital empire</h2>
            <p className="text-muted-foreground text-lg">We've combined the tools of a designer, marketer, and strategist into one seamless experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Palette, title: "Brand DNA Extractor", desc: "Paste an IG or Etsy link and instantly get a cohesive color palette and vibe." },
              { icon: LayoutTemplate, title: "Aesthetic Templates", desc: "Planners, posts, and mockups ready to customize in our intuitive canvas editor." },
              { icon: Mic2, title: "AI Voice Studio", desc: "Clone your voice once, generate faceless marketing content forever." },
              { icon: Flag, title: "Sprint Tracker", desc: "Stay accountable with our proven 14-day roadmap to launching your first product." },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-card p-8 rounded-3xl hover-elevate"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Mockup Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight">Create content that <br/> <span className="italic text-primary font-light">actually converts</span></h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Stop staring at a blank screen. Our template library is filled with high-converting layouts specifically designed for digital product sellers on Etsy, Stan Store, and Shopify.
              </p>
              <ul className="space-y-4">
                {[
                  "Social media captions written for you",
                  "Trending niches updated weekly",
                  "Profit calculator to price perfectly"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0">✓</div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button onClick={login} size="lg" className="rounded-full px-8 mt-4 shadow-lg shadow-primary/20">
                Explore Templates
              </Button>
            </div>
            <div className="flex-1 relative">
              <div className="relative z-10 rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <img src={`${import.meta.env.BASE_URL}images/template-planner.png`} alt="Digital Planner Template" className="rounded-2xl shadow-2xl w-full max-w-md mx-auto border-8 border-white" />
              </div>
              <div className="absolute -bottom-10 -left-10 z-20 rotate-[5deg] hover:rotate-0 transition-transform duration-500 w-2/3">
                <img src={`${import.meta.env.BASE_URL}images/template-ig.png`} alt="Instagram Template" className="rounded-2xl shadow-2xl border-4 border-white" />
              </div>
              {/* Decorative blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-secondary/50 to-primary/20 blur-3xl -z-10 rounded-full" />
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Brain, Shield, Eye, Lightbulb, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Adaptive Learning",
    description: "AI learns your app usage patterns and routines without sending data to the cloud.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "All processing happens on-device. You control every aspect of data collection.",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description: "View exactly what the AI has learned. Delete or reset any pattern instantly.",
  },
  {
    icon: Lightbulb,
    title: "Smart Suggestions",
    description: "Proactive recommendations to improve your digital wellbeing and productivity.",
  },
];

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-display font-bold text-foreground">MindGuard AI</span>
        </div>
        <Link to="/auth">
          <Button variant="outline" size="sm">Sign In</Button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative px-6 md:px-12 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight">
            Your Privacy-First
            <br />
            <span className="gradient-text">AI Companion</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-6 max-w-xl">
            An on-device AI that learns your behavior, prioritizes your digital wellbeing, and gives
            you complete control over your data. No cloud processing. No compromise.
          </p>
          <div className="flex gap-4 mt-8">
            <Link to="/auth">
              <Button size="lg">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-20 border-t border-border">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-12">
          Built for your <span className="gradient-accent-text">wellbeing</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass-card p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-20 border-t border-border">
        <div className="glass-card glow-border p-12 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Take control of your digital life
          </h2>
          <p className="text-muted-foreground mt-3">
            Start understanding your habits with complete privacy and transparency.
          </p>
          <Link to="/auth">
            <Button size="lg" className="mt-6">
              Create Free Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-border text-center text-sm text-muted-foreground">
        © 2026 MindGuard AI. Privacy-first, always.
      </footer>
    </div>
  );
};

export default Index;

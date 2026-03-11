import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Brain, Clock, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const StatCard = ({ icon: Icon, label, value, accent = false }: { icon: any; label: string; value: string; accent?: boolean }) => (
  <div className="glass-card p-6 space-y-3 animate-slide-up">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent ? "bg-accent/20" : "bg-primary/20"}`}>
      <Icon className={`w-5 h-5 ${accent ? "text-accent" : "text-primary"}`} />
    </div>
    <div>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();

  const { data: trackingData } = useQuery({
    queryKey: ["app-tracking"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_tracking")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: patterns } = useQuery({
    queryKey: ["behavior-patterns"],
    queryFn: async () => {
      const { data } = await supabase
        .from("behavior_patterns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const { data: suggestions } = useQuery({
    queryKey: ["ai-suggestions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_suggestions")
        .select("*")
        .eq("dismissed", false)
        .order("created_at", { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  const trackedApps = trackingData?.filter((a) => a.tracking_enabled).length || 0;
  const totalApps = trackingData?.length || 0;

  // Mock usage chart data
  const chartData = [
    { name: "Mon", minutes: 120 },
    { name: "Tue", minutes: 95 },
    { name: "Wed", minutes: 140 },
    { name: "Thu", minutes: 80 },
    { name: "Fri", minutes: 110 },
    { name: "Sat", minutes: 160 },
    { name: "Sun", minutes: 90 },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Welcome back{user?.user_metadata?.display_name ? `, ${user.user_metadata.display_name}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1">Your privacy-first AI companion overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Shield} label="Apps Tracked" value={`${trackedApps}/${totalApps}`} />
        <StatCard icon={Brain} label="Patterns Learned" value={String(patterns?.length || 0)} accent />
        <StatCard icon={Clock} label="Avg Daily Usage" value="2h 15m" />
        <StatCard icon={TrendingUp} label="Wellbeing Score" value="85%" accent />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Weekly Screen Time</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">AI Suggestions</h2>
          {suggestions && suggestions.length > 0 ? (
            <div className="space-y-3">
              {suggestions.map((s) => (
                <div key={s.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <span className="text-xs text-accent font-medium uppercase">{s.category}</span>
                  <p className="text-sm text-foreground mt-1">{s.suggestion}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No suggestions yet. Add some apps to track and let the AI learn your patterns.
            </p>
          )}
        </div>
      </div>

      {/* Recent Patterns */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Recently Learned Patterns</h2>
        {patterns && patterns.length > 0 ? (
          <div className="space-y-3">
            {patterns.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div>
                  <p className="text-sm font-medium text-foreground">{p.description}</p>
                  <p className="text-xs text-muted-foreground">{p.pattern_type} {p.app_name && `• ${p.app_name}`}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(p.confidence * 100)}% confidence
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No patterns detected yet. The AI will learn as you use your apps.
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, Trash2, Brain } from "lucide-react";

const Patterns = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: patterns, isLoading } = useQuery({
    queryKey: ["behavior-patterns"],
    queryFn: async () => {
      const { data } = await supabase
        .from("behavior_patterns")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const deletePattern = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("behavior_patterns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["behavior-patterns"] });
      toast.success("Pattern removed");
    },
  });

  const generateSample = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const samplePatterns = [
        { pattern_type: "routine", description: "You tend to check social media within 5 minutes of waking up", confidence: 0.87, app_name: "Instagram" },
        { pattern_type: "usage_spike", description: "Screen time increases by 40% on weekends", confidence: 0.92, app_name: null },
        { pattern_type: "focus", description: "Your most productive hours are between 9-11 AM", confidence: 0.78, app_name: null },
        { pattern_type: "habit", description: "You open messaging apps an average of 45 times per day", confidence: 0.95, app_name: "WhatsApp" },
        { pattern_type: "wellbeing", description: "Late-night phone usage correlates with poor sleep scores", confidence: 0.71, app_name: null },
      ];
      const { error } = await supabase.from("behavior_patterns").insert(
        samplePatterns.map((p) => ({ ...p, user_id: user.id }))
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["behavior-patterns"] });
      toast.success("Sample patterns generated for demo");
    },
  });

  const confidenceColor = (c: number) => {
    if (c >= 0.8) return "text-accent";
    if (c >= 0.6) return "text-primary";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <Eye className="w-8 h-8 text-primary" />
            Learned Patterns
          </h1>
          <p className="text-muted-foreground mt-1">
            Everything the AI has learned about your behavior. You can delete any pattern.
          </p>
        </div>
        <Button variant="outline" onClick={() => generateSample.mutate()}>
          <Brain className="w-4 h-4 mr-2" />
          Generate Sample
        </Button>
      </div>

      {isLoading ? (
        <div className="glass-card p-8 text-center text-muted-foreground">Loading...</div>
      ) : patterns && patterns.length > 0 ? (
        <div className="space-y-3">
          {patterns.map((p) => (
            <div
              key={p.id}
              className="glass-card p-5 flex items-start justify-between gap-4 animate-slide-up"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium uppercase text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {p.pattern_type}
                  </span>
                  {p.app_name && (
                    <span className="text-xs text-muted-foreground">• {p.app_name}</span>
                  )}
                </div>
                <p className="text-foreground">{p.description}</p>
                <p className={`text-sm mt-1 ${confidenceColor(p.confidence)}`}>
                  {Math.round(p.confidence * 100)}% confidence
                </p>
              </div>
              <button
                onClick={() => deletePattern.mutate(p.id)}
                className="text-muted-foreground hover:text-destructive transition-colors mt-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-display font-semibold text-foreground">No patterns yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            The AI hasn't learned any patterns yet. Click "Generate Sample" to see how it works.
          </p>
        </div>
      )}
    </div>
  );
};

export default Patterns;

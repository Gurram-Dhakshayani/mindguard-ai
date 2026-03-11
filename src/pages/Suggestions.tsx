import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lightbulb, X, Sparkles } from "lucide-react";

const categoryColors: Record<string, string> = {
  wellbeing: "text-accent bg-accent/10",
  productivity: "text-primary bg-primary/10",
  habit: "text-foreground bg-secondary",
  general: "text-muted-foreground bg-muted",
};

const Suggestions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["ai-suggestions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_suggestions")
        .select("*")
        .eq("dismissed", false)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const dismiss = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_suggestions").update({ dismissed: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ai-suggestions"] }),
  });

  const generateSuggestions = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const samples = [
        { suggestion: "Try setting a 30-minute daily limit for social media to improve your focus.", category: "wellbeing" },
        { suggestion: "Your most productive hours are 9-11 AM. Schedule deep work during this window.", category: "productivity" },
        { suggestion: "You've been using your phone 20% less this week. Keep up the great progress!", category: "wellbeing" },
        { suggestion: "Consider enabling Do Not Disturb during your evening wind-down routine.", category: "habit" },
        { suggestion: "Based on your patterns, reading before bed instead of scrolling may improve sleep.", category: "wellbeing" },
      ];
      const { error } = await supabase.from("ai_suggestions").insert(
        samples.map((s) => ({ ...s, user_id: user.id }))
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-suggestions"] });
      toast.success("AI suggestions generated");
    },
  });

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-primary" />
            AI Suggestions
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalized suggestions based on your learned behavior patterns.
          </p>
        </div>
        <Button onClick={() => generateSuggestions.mutate()}>
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Suggestions
        </Button>
      </div>

      {isLoading ? (
        <div className="glass-card p-8 text-center text-muted-foreground">Loading...</div>
      ) : suggestions && suggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((s) => (
            <div key={s.id} className="glass-card p-5 relative animate-slide-up">
              <button
                onClick={() => dismiss.mutate(s.id)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <span
                className={`text-xs font-medium uppercase px-2 py-0.5 rounded ${
                  categoryColors[s.category] || categoryColors.general
                }`}
              >
                {s.category}
              </span>
              <p className="text-foreground mt-3">{s.suggestion}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(s.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-display font-semibold text-foreground">No suggestions yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Click "Generate Suggestions" to see AI-powered recommendations based on your usage patterns.
          </p>
        </div>
      )}
    </div>
  );
};

export default Suggestions;

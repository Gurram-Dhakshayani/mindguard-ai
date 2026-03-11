import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, Plus, Trash2 } from "lucide-react";

const Privacy = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newApp, setNewApp] = useState("");
  const [newIcon, setNewIcon] = useState("📱");

  const { data: apps, isLoading } = useQuery({
    queryKey: ["app-tracking"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_tracking")
        .select("*")
        .order("app_name");
      return data || [];
    },
  });

  const addApp = useMutation({
    mutationFn: async () => {
      if (!user || !newApp.trim()) return;
      const { error } = await supabase.from("app_tracking").insert({
        user_id: user.id,
        app_name: newApp.trim(),
        icon: newIcon,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-tracking"] });
      setNewApp("");
      toast.success("App added to tracking");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleTracking = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("app_tracking")
        .update({ tracking_enabled: enabled })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["app-tracking"] }),
  });

  const removeApp = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("app_tracking").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-tracking"] });
      toast.success("App removed");
    },
  });

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <Shield className="w-8 h-8 text-accent" />
          Privacy Controls
        </h1>
        <p className="text-muted-foreground mt-1">
          Full transparency over what's tracked. Toggle tracking per-app or remove it entirely.
        </p>
      </div>

      {/* Add app */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Add App to Track</h2>
        <div className="flex gap-3">
          <Input
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            className="w-16 bg-secondary border-border text-center"
            maxLength={2}
          />
          <Input
            value={newApp}
            onChange={(e) => setNewApp(e.target.value)}
            placeholder="App name (e.g., Instagram)"
            className="flex-1 bg-secondary border-border"
          />
          <Button onClick={() => addApp.mutate()} disabled={!newApp.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* App list */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Tracked Apps</h2>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : apps && apps.length > 0 ? (
          <div className="space-y-2">
            {apps.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{app.icon}</span>
                  <div>
                    <p className="font-medium text-foreground">{app.app_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {app.tracking_enabled ? "Tracking active" : "Tracking paused"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={app.tracking_enabled}
                    onCheckedChange={(checked) =>
                      toggleTracking.mutate({ id: app.id, enabled: checked })
                    }
                  />
                  <button
                    onClick={() => removeApp.mutate(app.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No apps added yet. Add apps above to start controlling your tracking preferences.
          </p>
        )}
      </div>

      {/* Data controls */}
      <div className="glass-card p-6 glow-border">
        <h2 className="text-lg font-display font-semibold text-foreground mb-2">Data Controls</h2>
        <p className="text-sm text-muted-foreground mb-4">
          You have full control over your data. Reset learned patterns or delete all tracking data.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={async () => {
              if (!user) return;
              await supabase.from("behavior_patterns").delete().eq("user_id", user.id);
              queryClient.invalidateQueries({ queryKey: ["behavior-patterns"] });
              toast.success("All learned patterns have been reset");
            }}
          >
            Reset Patterns
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (!user) return;
              await supabase.from("usage_sessions").delete().eq("user_id", user.id);
              await supabase.from("behavior_patterns").delete().eq("user_id", user.id);
              await supabase.from("ai_suggestions").delete().eq("user_id", user.id);
              queryClient.invalidateQueries();
              toast.success("All data has been deleted");
            }}
          >
            Delete All My Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

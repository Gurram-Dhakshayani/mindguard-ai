import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Settings, User } from "lucide-react";

const SettingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();
      if (data) setDisplayName(data.display_name || "");
      return data;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <Settings className="w-8 h-8 text-muted-foreground" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-display font-semibold text-foreground">Profile</h2>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Email</label>
          <Input value={user?.email || ""} disabled className="bg-muted border-border" />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Display Name</label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-secondary border-border"
          />
        </div>

        <Button onClick={() => updateProfile.mutate()}>Save Changes</Button>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-display font-semibold text-foreground">About MindGuard AI</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            MindGuard AI is a privacy-first on-device AI companion that learns your behavior
            while giving you complete control and prioritizing your digital wellbeing.
          </p>
          <p>
            All behavior tracking is transparent — you can view, reset, or delete what the
            system has learned at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

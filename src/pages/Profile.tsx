import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Camera, Copy, LogOut, Loader2 } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  level: number;
  badge: string;
  xp: number;
  unique_id: string;
}

const MOTIVATIONAL_QUOTES = [
  "Progress, not perfection.",
  "Every small step counts toward peace.",
  "You are your best investment.",
  "Wellness is a journey, not a destination.",
  "Small daily improvements are the key to staggering long-term results.",
  "Your mind is a powerful thing. Fill it with positive thoughts.",
  "Taking care of yourself is productive.",
];

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [quote] = useState(
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  );

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setName(data.name);
      } else {
        // Create profile if it doesn't exist
        await createProfile(user.id);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (userId: string) => {
    try {
      // Generate unique ID
      const { data: uniqueIdData, error: idError } = await supabase
        .rpc("generate_unique_wellness_id");

      if (idError) throw idError;

      const { data, error } = await supabase
        .from("profiles")
        .insert([
          {
            id: userId,
            name: "Wellness User",
            level: 1,
            badge: "Newbie",
            xp: 0,
            unique_id: uniqueIdData,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setName(data.name);
      }
    } catch (error: any) {
      console.error("Error creating profile:", error);
      toast.error("Failed to create profile");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }

      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split("/").pop();
        if (oldPath) {
          await supabase.storage.from("avatars").remove([`${user.id}/${oldPath}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast.success("Profile picture updated!");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({ name })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, name } : null);
      toast.success("Changes saved!");
    } catch (error: any) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyId = () => {
    if (profile?.unique_id) {
      navigator.clipboard.writeText(profile.unique_id);
      setCopied(true);
      toast.success("ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast.error("Failed to logout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Failed to load profile</p>
            <Button onClick={() => navigate("/")} className="w-full mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const xpProgress = (profile.xp % 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Your Wellness Profile
            </CardTitle>
            <p className="text-sm text-muted-foreground italic mt-2">"{quote}"</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                    {name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="text-center text-lg font-medium"
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-primary">Lv.{profile.level}</p>
                <p className="text-xs text-muted-foreground">Level</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold">{profile.badge}</p>
                <p className="text-xs text-muted-foreground">Badge</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-primary">{profile.xp}</p>
                <p className="text-xs text-muted-foreground">XP Points</p>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to next level</span>
                <span className="font-medium text-foreground">{xpProgress}%</span>
              </div>
              <Progress value={xpProgress} className="h-3" />
            </div>

            {/* Unique ID */}
            <div className="space-y-2">
              <Label>Your Unique ID</Label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 rounded-md bg-muted font-mono text-sm text-center">
                  {profile.unique_id}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyId}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-primary text-center animate-in fade-in">
                  Copied!
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleSaveChanges}
                disabled={saving || name === profile.name}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex-1"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home Button */}
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="w-full"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default Profile;
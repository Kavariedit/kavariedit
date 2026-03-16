import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useGetUserProfile, useUpdateUserProfile } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCircle, Star } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useGetUserProfile();
  const updateMutation = useUpdateUserProfile();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({ data: { firstName, lastName } });
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your profile and subscription.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-6">
            
            <Card className="glass-card shadow-sm border-border/50 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20 relative">
                <div className="absolute -bottom-10 left-8">
                  <div className="w-20 h-20 bg-white rounded-2xl p-1 shadow-md">
                    <div className="w-full h-full bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <UserCircle className="w-10 h-10" />
                    </div>
                  </div>
                </div>
              </div>
              <CardHeader className="pt-14 pb-2 px-8">
                <CardTitle className="text-xl">Profile Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={firstName} 
                        onChange={e => setFirstName(e.target.value)} 
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={lastName} 
                        onChange={e => setLastName(e.target.value)} 
                        className="bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile?.email || ""} disabled className="bg-black/5" />
                    <p className="text-xs text-muted-foreground">Email is managed by your Replit account.</p>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={updateMutation.isPending} className="px-8 shadow-md">
                      {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-white hover-elevate border-border/60">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" /> Subscription Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5">
                  <div>
                    <p className="font-bold text-lg capitalize">{profile?.subscriptionTier || 'Free'} Tier</p>
                    <p className="text-sm text-muted-foreground mt-1">You are currently on the limited free plan.</p>
                  </div>
                  <Button className="shadow-md shadow-primary/20 shrink-0">Upgrade to Pro</Button>
                </div>
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </Layout>
  );
}

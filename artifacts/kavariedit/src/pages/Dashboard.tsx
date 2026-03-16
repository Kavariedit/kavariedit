import { Layout } from "@/components/Layout";
import { useAuth } from "@workspace/replit-auth-web";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { useGetUserStats, useGetSprintStatus, useGetTrendingNiches } from "@workspace/api-client-react";
import { ArrowRight, Flame, Mic2, Palette, Play } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  
  // These will error if endpoints don't exist yet, which is expected per instructions
  const { data: stats, isLoading: statsLoading } = useGetUserStats();
  const { data: sprint, isLoading: sprintLoading } = useGetSprintStatus();
  const { data: niches, isLoading: nichesLoading } = useGetTrendingNiches();

  const sprintProgress = sprint ? (sprint.completedDays / 14) * 100 : 0;

  return (
    <Layout>
      <div className="space-y-8 pb-12">
        
        {/* Header Greeting */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              Welcome back, {user?.firstName || 'Creator'} ✨
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Let's build your aesthetic digital empire today.</p>
          </div>
          <Button asChild className="rounded-full shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30">
            <Link href="/templates">Create New Product</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Sprint Progress Card */}
            <Card className="glass-card border-none bg-gradient-to-br from-white/80 to-secondary/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="w-5 h-5 text-primary" /> 
                    14-Day Sprint
                  </CardTitle>
                  <span className="text-sm font-medium bg-white/60 px-3 py-1 rounded-full border border-white">
                    Day {sprint?.currentDay || 1} of 14
                  </span>
                </div>
                <CardDescription>Stay on track to launch your first product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{Math.round(sprintProgress)}% completed</span>
                    <span className="font-medium text-primary">{sprint?.completedDays || 0}/14 days</span>
                  </div>
                  <Progress value={sprintProgress} className="h-3 bg-white" />
                  <div className="mt-4 pt-4 border-t border-border/40">
                    <Button asChild variant="outline" className="w-full justify-between hover:bg-white bg-white/50 border-white">
                      <Link href="/sprint">
                        Continue Sprint <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <h2 className="text-xl font-serif font-semibold mt-8 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/brand-dna">
                <Card className="hover-elevate cursor-pointer h-full transition-colors hover:border-primary/30">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary">
                      <Palette className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Extract Brand DNA</h3>
                      <p className="text-sm text-muted-foreground mt-1">Get colors from any IG profile</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/voice-studio">
                <Card className="hover-elevate cursor-pointer h-full transition-colors hover:border-primary/30">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-accent-foreground">
                      <Mic2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">AI Voice Studio</h3>
                      <p className="text-sm text-muted-foreground mt-1">Generate faceless voiceovers</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            
            {/* Stats */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Your Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Voiceovers Used</span>
                  <span className="font-medium">{stats?.voiceoversUsedThisMonth || 0} / {stats?.voiceoverLimit || 5}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Templates Exported</span>
                  <span className="font-medium">{stats?.templatesDownloadedThisMonth || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Brand DNAs</span>
                  <span className="font-medium">{stats?.brandDnaProfilesCount || 0}</span>
                </div>
                {(!stats || stats.voiceoverLimit <= 5) && (
                  <Button variant="outline" className="w-full mt-2 text-primary border-primary/20 hover:bg-primary/5 text-xs h-8">
                    Upgrade for Unlimited
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Trending Niches Mini */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/80">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" /> Hot Niches
                </CardTitle>
                <Link href="/niche-radar" className="text-xs text-primary hover:underline">View All</Link>
              </CardHeader>
              <CardContent>
                {nichesLoading ? (
                  <div className="space-y-3">
                    <div className="h-10 bg-black/5 rounded animate-pulse" />
                    <div className="h-10 bg-black/5 rounded animate-pulse" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {niches?.slice(0, 3).map((niche) => (
                      <div key={niche.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-black/5 transition-colors">
                        <span className="font-medium text-sm truncate pr-2">{niche.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className={`w-2 h-2 rounded-full ${niche.demandScore > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <span className="text-xs text-muted-foreground">{niche.demandScore}</span>
                        </div>
                      </div>
                    )) || (
                      <p className="text-sm text-muted-foreground">No niches loading yet...</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </Layout>
  );
}

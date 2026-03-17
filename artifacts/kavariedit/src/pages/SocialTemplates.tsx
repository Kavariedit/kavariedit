import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useGetSocialTemplates } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Instagram, PlaySquare, Image as ImageIcon, Sparkles, Link, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export default function SocialTemplates() {
  const [tab, setTab] = useState<"templates" | "ai-generator">("templates");
  const [platform, setPlatform] = useState("instagram");
  const { data: templates, isLoading } = useGetSocialTemplates({ platform });
  const { toast } = useToast();

  // AI Generator state
  const [blogUrl, setBlogUrl] = useState("");
  const [generatedPosts, setGeneratedPosts] = useState<string[]>([]);

  const generateMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch("/api/social-posts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong");
      }
      return res.json() as Promise<{ posts: string[] }>;
    },
    onSuccess: (data) => {
      setGeneratedPosts(data.posts);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const copyPost = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Post copied to clipboard." });
  };

  const platforms = [
    { id: "instagram", icon: Instagram, label: "Instagram" },
    { id: "tiktok", icon: PlaySquare, label: "TikTok" },
    { id: "pinterest", icon: ImageIcon, label: "Pinterest" },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Social Content</h1>
          <p className="text-muted-foreground mt-2">Ready-to-post templates and AI-generated posts.</p>
        </div>

        {/* Top-level Tabs */}
        <div className="flex gap-2 p-1 bg-white/50 backdrop-blur border border-border/50 rounded-2xl w-fit">
          <button
            onClick={() => setTab("templates")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
              tab === "templates"
                ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                : "text-muted-foreground hover:bg-white/50"
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Templates
          </button>
          <button
            onClick={() => setTab("ai-generator")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
              tab === "ai-generator"
                ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                : "text-muted-foreground hover:bg-white/50"
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Generator
          </button>
        </div>

        {/* AI Generator */}
        {tab === "ai-generator" && (
          <div className="space-y-6">
            <Card className="bg-white border-border/60">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Paste a blog URL</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    AI will read your blog post and write 5 social media posts ready to copy and paste.
                  </p>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="url"
                        value={blogUrl}
                        onChange={(e) => setBlogUrl(e.target.value)}
                        placeholder="https://yourblog.com/your-post"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <Button
                      onClick={() => generateMutation.mutate(blogUrl)}
                      disabled={!blogUrl.trim() || generateMutation.isPending}
                      className="shadow-md shadow-primary/20 px-6"
                    >
                      {generateMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
                      ) : (
                        <><Sparkles className="w-4 h-4 mr-2" /> Generate</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {generatedPosts.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-foreground">5 Posts Ready to Use</p>
                {generatedPosts.map((post, i) => (
                  <Card key={i} className="bg-white border-border/60">
                    <CardContent className="p-5 relative group">
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm leading-relaxed text-foreground flex-1 whitespace-pre-wrap">{post}</p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => copyPost(post)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {tab === "templates" && (
          <>
            {/* Platform Tabs */}
            <div className="flex gap-2 p-1 bg-white/50 backdrop-blur border border-border/50 rounded-2xl w-fit">
              {platforms.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                    platform === p.id
                      ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                      : "text-muted-foreground hover:bg-white/50"
                  }`}
                >
                  <p.icon className="w-4 h-4" /> {p.label}
                </button>
              ))}
            </div>

            {/* Templates List */}
            <div className="space-y-12 pt-4">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1,2].map(i => <div key={i} className="h-96 bg-black/5 rounded-3xl animate-pulse" />)}
                </div>
              ) : templates?.length === 0 ? (
                <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-border">
                  <p className="text-muted-foreground">No templates available for this platform yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {templates?.map(t => (
                    <Card key={t.id} className="overflow-hidden flex flex-col sm:flex-row bg-white hover-elevate border-border/60">
                      {/* Image Side */}
                      <div className="w-full sm:w-2/5 shrink-0 bg-muted relative aspect-square sm:aspect-auto">
                        <img
                          src={t.thumbnailUrl || `https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop`}
                          alt={t.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/90 text-foreground font-medium shadow-sm hover:bg-white border-none">{t.platform}</Badge>
                        </div>
                      </div>

                      {/* Content Side */}
                      <div className="flex-1 p-6 flex flex-col">
                        <h3 className="text-xl font-bold mb-4">{t.title}</h3>

                        <div className="flex-1 space-y-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Suggested Caption</p>
                            <div className="bg-primary/5 p-4 rounded-xl text-sm text-foreground/90 relative group">
                              <p className="line-clamp-4 leading-relaxed">{t.captionSuggestions[0]}</p>
                              <Button
                                variant="secondary"
                                size="icon"
                                onClick={() => copyPost(t.captionSuggestions[0])}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 shadow-sm"
                              >
                                <Copy className="w-3.5 h-3.5 text-primary" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-border/50 flex gap-3">
                          <Button className="flex-1 shadow-md shadow-primary/20">Edit Template</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useGetSocialTemplates } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Instagram, PlaySquare, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SocialTemplates() {
  const [platform, setPlatform] = useState("instagram");
  const { data: templates, isLoading } = useGetSocialTemplates({ platform });
  const { toast } = useToast();

  const copyCaption = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Caption Copied!", description: "Ready to paste into your social app." });
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
          <p className="text-muted-foreground mt-2">Ready-to-post templates with proven captions.</p>
        </div>

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
                            onClick={() => copyCaption(t.captionSuggestions[0])}
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
      </div>
    </Layout>
  );
}

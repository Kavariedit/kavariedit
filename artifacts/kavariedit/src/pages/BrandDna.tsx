import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetBrandDnaProfiles, useExtractBrandDna, useDeleteBrandDnaProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Palette, Trash2, Wand2, Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function BrandDna() {
  const [url, setUrl] = useState("");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useGetBrandDnaProfiles();
  
  const extractMutation = useExtractBrandDna({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/brand-dna"] });
        setUrl("");
        toast({ title: "Brand DNA Extracted!", description: "Your new color palette is ready." });
      },
      onError: (err: any) => {
        toast({ title: "Extraction Failed", description: err.message || "Could not extract DNA.", variant: "destructive" });
      }
    }
  });

  const deleteMutation = useDeleteBrandDnaProfile({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/brand-dna"] });
      }
    }
  });

  const handleExtract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    extractMutation.mutate({ data: { url } });
  };

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
    toast({ title: "Copied!", description: `${hex} copied to clipboard.`, duration: 2000 });
  };

  const ColorSwatch = ({ hex, label }: { hex: string, label: string }) => (
    <div 
      className="flex flex-col gap-2 cursor-pointer group"
      onClick={() => copyToClipboard(hex)}
    >
      <div 
        className="h-16 w-full rounded-xl shadow-sm border border-black/5 hover:scale-105 transition-transform flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: hex }}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          {copiedHex === hex ? <CheckCircle2 className="w-5 h-5 text-white drop-shadow-md" /> : <Copy className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity" />}
        </div>
      </div>
      <div className="text-xs text-center">
        <div className="font-medium truncate">{label}</div>
        <div className="text-muted-foreground uppercase">{hex}</div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Palette className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-serif font-bold mb-4">Brand DNA Extractor</h1>
          <p className="text-lg text-muted-foreground">
            Paste an Instagram profile or Etsy shop URL. Our AI will analyze the aesthetic and generate a cohesive color palette and style guide for your products.
          </p>
        </div>

        <Card className="glass-card border-primary/20 shadow-lg shadow-primary/5 max-w-2xl mx-auto mb-16">
          <CardContent className="p-6">
            <form onSubmit={handleExtract} className="flex flex-col sm:flex-row gap-4">
              <Input 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://instagram.com/aesthetic.shop..."
                className="flex-1 h-12 text-base bg-white/50 border-white focus-visible:ring-primary/20"
                disabled={extractMutation.isPending}
              />
              <Button 
                type="submit" 
                size="lg" 
                disabled={!url || extractMutation.isPending}
                className="h-12 px-8 rounded-xl shadow-md shadow-primary/20 shrink-0"
              >
                {extractMutation.isPending ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Extracting...</>
                ) : (
                  <><Wand2 className="mr-2 h-5 w-5" /> Extract DNA</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-serif font-semibold mb-6 flex items-center gap-2">
            Your Saved Profiles <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-sans">{profiles?.length || 0}</span>
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2].map(i => <div key={i} className="h-64 bg-black/5 animate-pulse rounded-3xl" />)}
            </div>
          ) : profiles?.length === 0 ? (
            <div className="text-center py-16 bg-white/40 rounded-3xl border border-dashed border-border">
              <Palette className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No profiles yet</h3>
              <p className="text-muted-foreground mt-1">Extract your first brand DNA above to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {profiles?.map((profile) => (
                <motion.div key={profile.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <Card className="bg-white hover-elevate overflow-hidden border-border/60">
                    <CardHeader className="pb-4 bg-muted/30 border-b border-border/50 relative">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteMutation.mutate({ id: profile.id })}
                        className="absolute right-4 top-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <CardTitle className="text-lg truncate pr-8">{new URL(profile.sourceUrl).hostname + new URL(profile.sourceUrl).pathname}</CardTitle>
                      <CardDescription className="capitalize text-xs tracking-wider font-medium">{profile.sourceType}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-5 gap-2 mb-6">
                        <ColorSwatch hex={profile.primaryColor} label="Primary" />
                        <ColorSwatch hex={profile.secondaryColor} label="Second" />
                        <ColorSwatch hex={profile.accentColor} label="Accent" />
                        <ColorSwatch hex={profile.neutralColor} label="Neutral" />
                        <ColorSwatch hex={profile.backgroundColor} label="Base" />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-secondary/30 text-secondary-foreground rounded-full text-xs font-medium border border-secondary">
                          Font: {profile.fontMood}
                        </span>
                        <span className="px-3 py-1 bg-accent/30 text-accent-foreground rounded-full text-xs font-medium border border-accent">
                          Vibe: {profile.contentVibe}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}

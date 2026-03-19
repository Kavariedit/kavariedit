import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGetVoiceStatus, useCreateVoiceClone, useGenerateVoiceover, useGetVoiceoverHistory } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Play, Square, Loader2, Download, History, Sparkles, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { format } from "date-fns";

const VOICES = [
  { id: "nova", label: "Nova", description: "Female · Warm & energetic" },
  { id: "shimmer", label: "Shimmer", description: "Female · Soft & calm" },
  { id: "alloy", label: "Alloy", description: "Neutral · Versatile" },
  { id: "echo", label: "Echo", description: "Male · Warm & natural" },
  { id: "fable", label: "Fable", description: "Male · British & authoritative" },
  { id: "onyx", label: "Onyx", description: "Male · Deep & powerful" },
];

export default function VoiceStudio() {
  const { data: status, isLoading: statusLoading } = useGetVoiceStatus();
  const { data: history, isLoading: historyLoading } = useGetVoiceoverHistory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cloneMutation = useCreateVoiceClone({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/voice/status"] });
        toast({ title: "Voice selected!", description: "Your AI voice is ready to use." });
      }
    }
  });

  const generateMutation = useGenerateVoiceover({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/voice/history"] });
        queryClient.invalidateQueries({ queryKey: ["/api/voice/status"] });
        setText("");
        toast({ title: "Generated!", description: "Voiceover created successfully." });
      }
    }
  });

  const handleSelectVoice = (voiceId: string) => {
    setSelectedVoice(voiceId);
    cloneMutation.mutate({ data: { audioBase64: "", name: voiceId } });
  };

  const handleGenerate = () => {
    if (!text) return;
    generateMutation.mutate({ data: { text } });
  };

  const handlePlay = (item: { id: string; audioUrl: string }) => {
    if (playingId === item.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(item.audioUrl);
    audioRef.current = audio;
    audio.play();
    setPlayingId(item.id);
    audio.onended = () => setPlayingId(null);
  };

  const handleDownload = (item: { audioUrl: string; text: string }) => {
    const a = document.createElement("a");
    a.href = item.audioUrl;
    a.download = `voiceover_${Date.now()}.mp3`;
    a.click();
  };

  const currentVoiceId = status?.voiceId;
  const currentVoiceLabel = VOICES.find(v => v.id === currentVoiceId)?.label;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground">AI Voice Studio</h1>
            <p className="text-muted-foreground mt-2 text-lg">Generate voiceovers for reels, TikToks, and pins.</p>
          </div>
          {status && (
            <div className="flex items-center gap-3 bg-white/60 px-4 py-2 rounded-2xl border border-white shadow-sm">
              <span className="text-sm font-medium">Usage this month:</span>
              <span className="bg-primary/10 text-primary font-bold px-2 py-1 rounded-md text-sm">
                {status.voiceoversUsedThisMonth} / {status.voiceoverLimit}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Pick a voice */}
            <Card className={`overflow-hidden transition-all duration-500 ${status?.hasVoiceClone ? 'opacity-70 grayscale-[30%]' : 'border-primary/30 shadow-lg shadow-primary/5'}`}>
              <CardHeader className={`${status?.hasVoiceClone ? 'bg-muted/30' : 'bg-primary/5'}`}>
                <CardTitle className="flex items-center justify-between">
                  <span>1. Choose Your Voice</span>
                  {status?.hasVoiceClone && (
                    <span className="flex items-center gap-2 text-sm font-normal text-green-600">
                      <CheckCircle2 className="w-5 h-5" /> {currentVoiceLabel}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Pick the AI voice that fits your brand. You can change this any time.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {VOICES.map((voice) => {
                    const isActive = currentVoiceId === voice.id;
                    const isSelected = selectedVoice === voice.id && cloneMutation.isPending;
                    return (
                      <button
                        key={voice.id}
                        onClick={() => handleSelectVoice(voice.id)}
                        disabled={cloneMutation.isPending}
                        className={`rounded-2xl border p-4 text-left transition-all hover:border-primary/50 hover:shadow-md ${
                          isActive
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border bg-white/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{voice.label}</span>
                          {isSelected ? (
                            <Loader2 className="w-3 h-3 animate-spin text-primary" />
                          ) : isActive ? (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">{voice.description}</p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Generate */}
            <Card className={`border-none shadow-xl transition-all duration-500 ${!status?.hasVoiceClone ? 'opacity-50 pointer-events-none' : 'bg-gradient-to-br from-white to-secondary/10'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> 2. Generate Voiceover
                </CardTitle>
                <CardDescription>Type your script for reels, TikToks, or Pinterest pins.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0">
                <Textarea
                  placeholder="Paste your aesthetic caption or script here..."
                  className="min-h-[200px] text-base resize-none bg-white/70 border-white focus-visible:ring-primary/20 p-4 rounded-2xl"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleGenerate}
                    disabled={!text || generateMutation.isPending}
                    size="lg"
                    className="rounded-xl px-8 shadow-md shadow-primary/20"
                  >
                    {generateMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Play className="w-5 h-5 mr-2 fill-current" />}
                    Generate Audio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* History Sidebar */}
          <div>
            <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2">
              <History className="w-5 h-5" /> Recent Generations
            </h2>
            <div className="space-y-4">
              {historyLoading ? (
                [1,2,3].map(i => <div key={i} className="h-24 bg-white/50 animate-pulse rounded-2xl" />)
              ) : history?.length === 0 ? (
                <div className="text-center py-12 bg-white/40 rounded-3xl border border-dashed border-border text-muted-foreground">
                  No history yet.
                </div>
              ) : (
                history?.map((item, i) => (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={item.id}>
                    <Card className="hover-elevate overflow-hidden border-border/50 bg-white/80">
                      <CardContent className="p-4">
                        <p className="text-sm line-clamp-2 text-foreground/80 mb-3 italic">"{item.text}"</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{format(new Date(item.createdAt), 'MMM d, yyyy')}</span>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                              onClick={() => handlePlay(item)}
                            >
                              {playingId === item.id
                                ? <Square className="w-3 h-3 fill-current" />
                                : <Play className="w-3 h-3 fill-current" />
                              }
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                              onClick={() => handleDownload(item)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}

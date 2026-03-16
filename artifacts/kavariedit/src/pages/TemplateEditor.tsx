import { useEffect, useRef, useState } from "react";
import { useRoute, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useGetTemplate, useTrackTemplateCustomization } from "@workspace/api-client-react";
import * as fabric from "fabric";
import { ChevronLeft, Download, Type, Square, Circle, Image as ImageIcon, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TemplateEditor() {
  const [match, params] = useRoute("/template-editor/:id");
  const id = params?.id || "";
  
  const { data: template, isLoading } = useGetTemplate(id);
  const trackMutation = useTrackTemplateCustomization();
  const { toast } = useToast();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !template) return;
    
    // Initialize Fabric canvas
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: 600,
      height: 800,
      backgroundColor: '#fdfbfb',
    });
    
    setCanvas(initCanvas);

    // Mock initial template loading
    const text = new fabric.Textbox('Double click to edit', {
      left: 100,
      top: 100,
      fontFamily: 'Playfair Display',
      fontSize: 40,
      fill: '#8C6A7B'
    });
    initCanvas.add(text);

    return () => {
      initCanvas.dispose();
    };
  }, [template]);

  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText('New Text', {
      left: 50,
      top: 50,
      fontFamily: 'DM Sans',
      fill: '#333333'
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const addRect = () => {
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 50,
      top: 50,
      fill: '#E8D5D5',
      width: 100,
      height: 100,
      rx: 10,
      ry: 10
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
  };

  const handleDownload = async () => {
    if (!canvas) return;
    setIsSaving(true);
    
    try {
      // Mock tracking API call
      await trackMutation.mutateAsync({ id });
      
      const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
      const link = document.createElement('a');
      link.download = `${template?.title || 'design'}-kavariedit.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({ title: "Downloaded!", description: "Your design has been saved." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to track download.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Layout><div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></Layout>;

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-6rem)] -m-6 md:-m-8">
        {/* Editor Header */}
        <header className="h-16 px-6 border-b border-border/50 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link href="/templates"><ChevronLeft className="w-5 h-5" /></Link>
            </Button>
            <h1 className="font-serif font-bold text-lg">{template?.title || "Untitled Design"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" className="rounded-full px-6">
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
            <Button onClick={handleDownload} disabled={isSaving} className="rounded-full px-6 shadow-md shadow-primary/20">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Export Design
            </Button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Toolbar Sidebar */}
          <aside className="w-20 bg-white border-r border-border/50 flex flex-col items-center py-6 gap-6 shrink-0 z-10">
            <button onClick={addText} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center"><Type className="w-5 h-5" /></div>
              <span className="text-[10px] font-medium uppercase tracking-wider">Text</span>
            </button>
            <button onClick={addRect} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center"><Square className="w-5 h-5" /></div>
              <span className="text-[10px] font-medium uppercase tracking-wider">Shapes</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors opacity-50 cursor-not-allowed" title="Coming soon">
              <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center"><ImageIcon className="w-5 h-5" /></div>
              <span className="text-[10px] font-medium uppercase tracking-wider">Uploads</span>
            </button>
          </aside>

          {/* Canvas Area */}
          <main className="flex-1 bg-black/5 overflow-auto flex items-center justify-center p-8 relative shadow-inner">
            <div className="shadow-2xl rounded-sm overflow-hidden bg-white ring-1 ring-black/5" style={{ width: 600, height: 800 }}>
              <canvas ref={canvasRef} />
            </div>
            
            {/* Zoom Controls Overlay */}
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur rounded-full px-4 py-2 flex items-center gap-4 shadow-lg border border-border/50">
              <span className="text-xs font-medium text-muted-foreground">Zoom</span>
              <Slider defaultValue={[100]} max={200} min={10} step={10} className="w-24" />
              <span className="text-xs font-medium">100%</span>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}

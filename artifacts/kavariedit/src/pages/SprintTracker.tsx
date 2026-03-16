import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useGetSprintStatus, useCompleteSprintTask, useRestartSprint } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, Loader2, PlayCircle, RotateCcw, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";

export default function SprintTracker() {
  const { data: sprint, isLoading } = useGetSprintStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [showConfetti, setShowConfetti] = useState(false);

  const completeMutation = useCompleteSprintTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/sprint"] });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        toast({ title: "Task Completed!", description: "You're one step closer to launch. 🚀" });
      }
    }
  });

  const restartMutation = useRestartSprint({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/sprint"] });
        toast({ title: "Sprint Restarted", description: "Let's crush it this time!" });
      }
    }
  });

  if (isLoading) return <Layout><div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></Layout>;

  const progress = sprint ? (sprint.completedDays / 14) * 100 : 0;
  const isFinished = sprint?.completedDays === 14;

  return (
    <Layout>
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} colors={['#8C6A7B', '#E8D5D5', '#FFFFFF']} />}
      
      <div className="max-w-3xl mx-auto py-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">14-Day Sprint</h1>
          <p className="text-lg text-muted-foreground">Follow this proven daily roadmap to launch your first digital product.</p>
        </div>

        <Card className="glass-card mb-12 p-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex justify-between items-end mb-4 relative z-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Your Progress</p>
              <h2 className="text-3xl font-serif font-bold text-primary">{sprint?.completedDays || 0} / 14 <span className="text-lg font-sans font-medium text-muted-foreground">Days</span></h2>
            </div>
            {isFinished ? (
              <Button onClick={() => restartMutation.mutate()} variant="outline" className="rounded-full shadow-sm hover:bg-primary/5">
                <RotateCcw className="w-4 h-4 mr-2" /> Start Next Product
              </Button>
            ) : null}
          </div>
          <Progress value={progress} className="h-4 bg-primary/10 relative z-10" />
        </Card>

        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border/50 before:to-transparent">
          
          {sprint?.days.map((day, i) => {
            const isToday = sprint.currentDay === day.day && !day.isCompleted;
            const isFuture = day.day > sprint.currentDay;
            
            return (
              <motion.div 
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.4 }}
                className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${isFuture ? 'opacity-60' : ''}`}
              >
                {/* Timeline Marker */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 bg-white ${
                  day.isCompleted 
                    ? 'border-primary text-primary' 
                    : isToday 
                      ? 'border-accent text-accent-foreground ring-4 ring-accent/20' 
                      : 'border-border text-muted-foreground'
                }`}>
                  {day.isCompleted ? <Check className="w-5 h-5" /> : <span className="font-bold text-sm">{day.day}</span>}
                </div>

                {/* Card */}
                <Card className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] hover-elevate transition-colors duration-300 ${
                  isToday ? 'border-primary/50 shadow-lg shadow-primary/10 ring-1 ring-primary/10' : 'border-border/50'
                }`}>
                  <CardContent className="p-6">
                    <h3 className={`text-lg font-bold mb-2 ${day.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {day.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{day.description}</p>
                    
                    {!day.isCompleted && !isFuture && (
                      <Button 
                        onClick={() => completeMutation.mutate({ day: day.day })}
                        disabled={completeMutation.isPending}
                        className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-none"
                      >
                        {completeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark as Done'}
                      </Button>
                    )}
                    {day.isCompleted && day.completedAt && (
                      <p className="text-xs text-primary/60 font-medium">✓ Completed on {new Date(day.completedAt).toLocaleDateString()}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          
          {isFinished && (
             <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative flex items-center justify-center pt-8">
               <div className="w-20 h-20 bg-gradient-to-tr from-primary to-accent rounded-full flex items-center justify-center shadow-xl shadow-primary/30 z-10">
                 <Trophy className="w-10 h-10 text-white" />
               </div>
             </motion.div>
          )}

        </div>
      </div>
    </Layout>
  );
}

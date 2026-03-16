import { Layout } from "@/components/Layout";
import { useGetTrendingNiches } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Flame, TrendingUp, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";

export default function NicheRadar() {
  const { data: niches, isLoading } = useGetTrendingNiches();

  const getCompetitionColor = (level: string) => {
    switch(level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8 rounded-3xl border border-white shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Target className="w-32 h-32" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">Trending Niche Radar</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Data-backed insights on what's selling right now. We analyze search volume and competition to find the most profitable digital product opportunities.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-4">
            {niches?.map((niche, i) => (
              <motion.div 
                key={niche.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden hover-elevate border-border/60 bg-white">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={niche.id} className="border-none">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-black/[0.02] transition-colors group">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full pr-4 text-left">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                              {i < 3 && <Flame className="w-5 h-5 text-orange-500 fill-current" />}
                              {niche.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{niche.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-6 shrink-0">
                            {/* Demand Score */}
                            <div className="flex flex-col gap-1.5 min-w-[120px]">
                              <div className="flex justify-between text-xs font-medium">
                                <span>Demand</span>
                                <span>{niche.demandScore}/100</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500" 
                                  style={{ width: `${niche.demandScore}%` }}
                                />
                              </div>
                            </div>

                            {/* Competition Badge */}
                            <div className="w-24">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getCompetitionColor(niche.competitionLevel)}`}>
                                {niche.competitionLevel} comp
                              </span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 pt-2 bg-muted/20 border-t border-border/50">
                        <div className="grid md:grid-cols-2 gap-8 mt-4">
                          <div>
                            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-primary" /> Profitable Product Ideas
                            </h4>
                            <ul className="space-y-2">
                              {/* Mock ideas since they aren't in the list schema directly, or we fetch detail. I'll mock based on the schema structure requirement if detail isn't fully expanded here */}
                              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                Comprehensive notion templates for this niche
                              </li>
                              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                Printable trackers and checklists
                              </li>
                              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                Aesthetic social media Canva packs
                              </li>
                            </ul>
                          </div>
                          <div className="flex items-center justify-center bg-white p-6 rounded-2xl border border-dashed border-border">
                            <div className="text-center">
                              <p className="text-sm font-medium mb-3">Ready to start?</p>
                              <Link href={`/templates?category=${niche.name.split(' ')[0]}`} className="text-sm text-primary font-bold hover:underline flex items-center justify-center">
                                View recommended templates <ChevronRight className="w-4 h-4 ml-1" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

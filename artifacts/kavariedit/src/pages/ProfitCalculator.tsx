import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useCalculateProfit } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, Loader2, DollarSign, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const PLATFORMS = [
  { id: "etsy", label: "Etsy" },
  { id: "stanstore", label: "Stan Store" },
  { id: "gumroad", label: "Gumroad" },
  { id: "shopify", label: "Shopify" }
];

export default function ProfitCalculator() {
  const [price, setPrice] = useState("19.99");
  const [qty, setQty] = useState("100");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["etsy", "stanstore"]);

  const calcMutation = useCalculateProfit();

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !qty || selectedPlatforms.length === 0) return;
    
    calcMutation.mutate({
      data: {
        price: parseFloat(price),
        quantityPerMonth: parseInt(qty),
        platforms: selectedPlatforms as any[]
      }
    });
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calculator className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-serif font-bold mb-4">Profit Calculator</h1>
          <p className="text-lg text-muted-foreground">
            Compare fees and net profit across the top digital product platforms to price your templates perfectly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-4">
            <Card className="glass-card shadow-lg shadow-primary/5 sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl">Your Product</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCalculate} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Product Price ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="price" 
                        type="number" 
                        step="0.01" 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)}
                        className="pl-9 bg-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="qty">Expected Sales / Month</Label>
                    <Input 
                      id="qty" 
                      type="number" 
                      value={qty} 
                      onChange={(e) => setQty(e.target.value)}
                      className="bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <Label>Compare Platforms</Label>
                    <div className="space-y-3">
                      {PLATFORMS.map(p => (
                        <div key={p.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={p.id} 
                            checked={selectedPlatforms.includes(p.id)}
                            onCheckedChange={() => togglePlatform(p.id)}
                            className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label htmlFor={p.id} className="text-sm font-medium leading-none cursor-pointer">
                            {p.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full rounded-xl shadow-md" disabled={calcMutation.isPending || selectedPlatforms.length === 0}>
                    {calcMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Calculate Profit'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-8">
            {calcMutation.data ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {calcMutation.data.results.map((result, i) => (
                  <motion.div key={result.platform} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                    <Card className="bg-white overflow-hidden hover-elevate border-border/60">
                      <div className="bg-muted/30 p-6 border-b border-border/50">
                        <h3 className="text-xl font-bold capitalize text-foreground flex items-center justify-between">
                          {result.platform}
                          <span className="text-sm font-normal text-muted-foreground bg-white px-2 py-1 rounded-md border shadow-sm">
                            {result.unitsToHit1000} sales to hit $1k
                          </span>
                        </h3>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-end mb-8">
                          <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1 uppercase tracking-wider">Net Profit</p>
                            <p className="text-4xl font-serif font-bold text-primary">${result.netProfit.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Gross Rev</p>
                            <p className="text-lg font-medium text-foreground">${result.grossRevenue.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="space-y-3 bg-black/[0.02] p-4 rounded-xl border border-black/[0.05]">
                          <p className="text-sm font-semibold flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-destructive" /> Total Fees: <span className="text-destructive">${result.fees.toFixed(2)}</span>
                          </p>
                          {result.feeBreakdown.map(fee => (
                            <div key={fee.name} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{fee.name}</span>
                              <span className="font-medium">-${fee.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white/30">
                <Calculator className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-medium text-foreground">Waiting for input</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">Enter your product details and hit calculate to see how much you'll actually take home.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

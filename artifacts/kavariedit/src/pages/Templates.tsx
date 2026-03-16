import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useGetTemplates } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Search, Filter, Download } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = ["All", "Planners", "Checklists", "Etsy Mockups", "Instagram", "Pinterest"];

export default function Templates() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  
  const { data: templates, isLoading } = useGetTemplates({ category: category !== "All" ? category.toLowerCase() : undefined });

  const filteredTemplates = templates?.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Template Library</h1>
          <p className="text-muted-foreground mt-2">Beautiful, high-converting digital products ready to customize.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search templates..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-white/50 shadow-sm rounded-xl"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Categories
            </h3>
            <div className="flex flex-row lg:flex-col gap-2 flex-wrap lg:flex-nowrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-left px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    category === cat 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "bg-transparent text-muted-foreground hover:bg-black/5 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[3/4] bg-black/5 rounded-2xl animate-pulse" />)}
            </div>
          ) : filteredTemplates?.length === 0 ? (
            <div className="text-center py-24 bg-white/50 rounded-3xl border border-dashed border-border/50">
              <p className="text-muted-foreground">No templates found for this criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTemplates?.map((template, i) => (
                <motion.div 
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative"
                >
                  <Card className="overflow-hidden border-none shadow-md bg-transparent h-full flex flex-col hover-elevate group-hover:shadow-xl transition-all duration-300">
                    <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                      <img 
                        src={template.thumbnailUrl || `https://images.unsplash.com/photo-1616628188506-4bf9e8a38188?w=500&h=700&fit=crop`} 
                        alt={template.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-md text-foreground hover:bg-white font-medium border-none shadow-sm">
                          {template.category}
                        </Badge>
                      </div>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 backdrop-blur-[2px]">
                        <Button asChild size="lg" className="w-full rounded-full shadow-xl shadow-black/20 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <Link href={`/template-editor/${template.id}`}>
                            Customize Now
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4 bg-white border border-t-0 border-border/50 rounded-b-2xl">
                      <h3 className="font-bold text-foreground text-lg leading-tight mb-1 truncate" title={template.title}>{template.title}</h3>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{template.dimensionsWidth}x{template.dimensionsHeight} px</span>
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

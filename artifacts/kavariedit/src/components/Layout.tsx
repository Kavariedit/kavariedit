import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { 
  LayoutDashboard, 
  Palette, 
  LayoutTemplate, 
  ImagePlay, 
  Mic2, 
  Target, 
  Flag, 
  Calculator, 
  Settings,
  LogOut,
  Menu
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Sprint Tracker", url: "/sprint", icon: Flag },
  { title: "Brand DNA", url: "/brand-dna", icon: Palette },
  { title: "Template Library", url: "/templates", icon: LayoutTemplate },
  { title: "Social Content", url: "/social-templates", icon: ImagePlay },
  { title: "Voice Studio", url: "/voice-studio", icon: Mic2 },
  { title: "Niche Radar", url: "/niche-radar", icon: Target },
  { title: "Profit Calculator", url: "/calculator", icon: Calculator },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <Sidebar className="border-r-border/50 bg-sidebar/50 backdrop-blur-xl">
      <SidebarHeader className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <img src={`${import.meta.env.BASE_URL}images/logo-mark.png`} alt="Kavariedit" className="w-8 h-8 rounded-lg" />
          <span className="font-serif font-semibold text-xl tracking-tight text-primary">Kavariedit</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider mb-2">Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => {
                const isActive = location === item.url || location.startsWith(`${item.url}/`);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`h-10 px-3 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? "bg-primary/10 text-primary font-medium shadow-sm shadow-primary/5" 
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      }`}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 ${isActive ? "text-primary" : "opacity-70"}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="flex items-center justify-between bg-white/50 rounded-2xl p-2 border border-white/60 shadow-sm">
          <Link href="/settings" className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 overflow-hidden">
            <Avatar className="h-9 w-9 border border-primary/10">
              <AvatarImage src={user?.profileImageUrl || `${import.meta.env.BASE_URL}images/avatar-default.png`} />
              <AvatarFallback className="bg-primary/5 text-primary text-xs">
                {user?.firstName?.[0] || 'K'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium leading-none truncate">{user?.firstName || 'Creator'}</span>
              <span className="text-xs text-muted-foreground truncate">Free Plan</span>
            </div>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => logout()} className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" title="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  
  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "16rem" } as React.CSSProperties}>
      <div className="flex min-h-screen w-full bg-background/50">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center gap-4 px-6 border-b border-border/40 bg-background/50 backdrop-blur-sm sticky top-0 z-10 md:hidden">
            <SidebarTrigger className="text-primary hover:bg-primary/10" />
            <span className="font-serif font-medium text-lg text-primary">Kavariedit</span>
          </header>
          <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-[1400px] mx-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

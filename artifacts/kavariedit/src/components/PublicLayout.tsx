import { ReactNode } from "react";
import { Link } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, login } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
            <img src={`${import.meta.env.BASE_URL}images/logo-mark.png`} alt="Kavariedit" className="w-10 h-10 rounded-xl shadow-sm" />
            <span className="font-serif font-bold text-2xl tracking-tight text-foreground">Kavariedit</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-foreground/70">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
            <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button asChild className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={login} className="hidden sm:inline-flex hover:bg-primary/5 text-primary font-medium">
                  Log in
                </Button>
                <Button onClick={login} className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
                  Start for Free
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 w-full">
        {children}
      </main>
      <footer className="border-t border-border/50 bg-white/50 py-12 mt-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <img src={`${import.meta.env.BASE_URL}images/logo-mark.png`} alt="Kavariedit" className="w-8 h-8 rounded-lg mx-auto mb-6 opacity-50 grayscale" />
          <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} Kavariedit. Empowering creators.</p>
        </div>
      </footer>
    </div>
  );
}

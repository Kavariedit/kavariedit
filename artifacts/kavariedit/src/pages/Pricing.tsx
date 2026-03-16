import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@workspace/replit-auth-web";
import { Check } from "lucide-react";

export default function Pricing() {
  const { login } = useAuth();

  return (
    <PublicLayout>
      <div className="pt-20 pb-32 container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Simple, transparent pricing</h1>
          <p className="text-xl text-muted-foreground">Start building your aesthetic digital product business today.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-border hover-elevate flex flex-col">
            <h3 className="text-2xl font-bold mb-2">Creator Starter</h3>
            <p className="text-muted-foreground mb-6">Perfect for trying out the platform.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold">$0</span>
              <span className="text-muted-foreground">/ forever</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {["5 Template downloads per month", "1 Brand DNA Extraction", "3 AI Voiceovers per month", "Access to 14-Day Sprint Tracker", "Basic Profit Calculator"].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button onClick={login} variant="outline" size="lg" className="w-full rounded-xl border-primary/20 hover:bg-primary/5 text-primary">Get Started</Button>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-b from-primary/10 to-transparent rounded-3xl p-8 shadow-xl border-2 border-primary relative flex flex-col hover-elevate">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold mb-2">Creator Pro</h3>
            <p className="text-muted-foreground mb-6">For serious sellers ready to scale.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold">$29</span>
              <span className="text-muted-foreground">/ month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {["Unlimited Template downloads", "Unlimited Brand DNA Extractions", "Unlimited AI Voiceovers & Clone Creation", "Advanced Niche Radar Data", "Premium Social Content Captions", "Priority Support"].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="font-medium text-foreground/90">{feature}</span>
                </li>
              ))}
            </ul>
            <Button onClick={login} size="lg" className="w-full rounded-xl shadow-lg shadow-primary/25">Upgrade to Pro</Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

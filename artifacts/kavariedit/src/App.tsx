import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import BrandDna from "./pages/BrandDna";
import Templates from "./pages/Templates";
import TemplateEditor from "./pages/TemplateEditor";
import VoiceStudio from "./pages/VoiceStudio";
import SocialTemplates from "./pages/SocialTemplates";
import NicheRadar from "./pages/NicheRadar";
import SprintTracker from "./pages/SprintTracker";
import ProfitCalculator from "./pages/ProfitCalculator";
import Settings from "./pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/brand-dna" component={BrandDna} />
      <Route path="/templates" component={Templates} />
      <Route path="/template-editor/:id" component={TemplateEditor} />
      <Route path="/voice-studio" component={VoiceStudio} />
      <Route path="/social-templates" component={SocialTemplates} />
      <Route path="/niche-radar" component={NicheRadar} />
      <Route path="/sprint" component={SprintTracker} />
      <Route path="/calculator" component={ProfitCalculator} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

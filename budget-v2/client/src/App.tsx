import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import DepensesPage from "@/pages/depenses";
import RepartitionPage from "@/pages/repartition";
import ObjectifsPage from "@/pages/objectifs";
import EcheancesPage from "@/pages/echeances";
import SimulateurPage from "@/pages/simulateur";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/depenses" component={DepensesPage} />
        <Route path="/repartition" component={RepartitionPage} />
        <Route path="/objectifs" component={ObjectifsPage} />
        <Route path="/echeances" component={EcheancesPage} />
        <Route path="/simulateur" component={SimulateurPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocation}>
          <AppRouter />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

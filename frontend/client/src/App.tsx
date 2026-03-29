import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import MoneyHealthScore from "./pages/MoneyHealthScore";
import FIREPathPlanner from "./pages/FIREPathPlanner";
import TaxWizard from "./pages/TaxWizard";
import LifeEventAdvisor from "./pages/LifeEventAdvisor";
import CouplesMoneyPlanner from "./pages/CouplesMoneyPlanner";
import MFPortfolioXRay from "./pages/MFPortfolioXRay";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/money-health-score"} component={MoneyHealthScore} />
      <Route path={"/fire-path-planner"} component={FIREPathPlanner} />
      <Route path={"/tax-wizard"} component={TaxWizard} />
      <Route path={"/life-event-advisor"} component={LifeEventAdvisor} />
      <Route path={"/couples-money-planner"} component={CouplesMoneyPlanner} />
      <Route path={"/mf-portfolio-xray"} component={MFPortfolioXRay} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

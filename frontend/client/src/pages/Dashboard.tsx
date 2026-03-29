import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import DashboardLayout from "@/components/DashboardLayout";
import { TrendingUp, BarChart3, FileText, Zap, Users, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-4">Access Denied</h1>
          <p className="text-white/60 mb-8">Please sign in to access your dashboard</p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="blueprint-btn-primary"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Financial Health Score", value: "—", unit: "/100", color: "from-blue-400 to-blue-600" },
    { label: "Net Worth", value: "—", unit: "₹", color: "from-green-400 to-green-600" },
    { label: "Monthly Savings Rate", value: "—", unit: "%", color: "from-cyan-400 to-cyan-600" },
    { label: "Emergency Fund Months", value: "—", unit: "months", color: "from-yellow-400 to-yellow-600" },
  ];

  const modules = [
    {
      icon: TrendingUp,
      title: "MoneyHealthScore",
      description: "Get your 6-dimension financial wellness score",
      path: "/money-health-score",
      status: "Start Assessment",
    },
    {
      icon: BarChart3,
      title: "FIREPathPlanner",
      description: "Create your personalized financial roadmap",
      path: "/fire-path-planner",
      status: "Build Plan",
    },
    {
      icon: FileText,
      title: "TaxWizard",
      description: "Optimize your taxes and find missing deductions",
      path: "/tax-wizard",
      status: "Analyze",
    },
    {
      icon: Zap,
      title: "Life Event Advisor",
      description: "Get guidance for major financial decisions",
      path: "/life-event-advisor",
      status: "Explore",
    },
    {
      icon: Users,
      title: "Couples Money Planner",
      description: "Plan finances jointly with your partner",
      path: "/couples-money-planner",
      status: "Plan Together",
    },
    {
      icon: Shield,
      title: "MF Portfolio X-Ray",
      description: "Analyze and optimize your investments",
      path: "/mf-portfolio-xray",
      status: "Analyze",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="animate-fade-in">
          <h1 className="text-4xl font-black mb-2">Welcome, {user?.name}!</h1>
          <p className="text-white/60">Your AI-powered financial command center</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, i) => (
            <div key={i} className="metric-box">
              <div className="metric-label">{metric.label}</div>
              <div className="mt-4">
                <span className="metric-value">{metric.value}</span>
                <span className="text-white/50 ml-2">{metric.unit}</span>
              </div>
              <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-gradient-to-r from-accent to-accent/80 transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="blueprint-card">
          <h2 className="text-2xl font-bold mb-6">Quick Start</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={() => navigate("/money-health-score")}
              className="blueprint-btn-primary justify-start text-left py-6 h-auto"
            >
              <div>
                <div className="font-bold">Start Your Assessment</div>
                <div className="text-sm opacity-80">Get your MoneyHealthScore in 5 minutes</div>
              </div>
            </Button>
            <Button
              onClick={() => navigate("/fire-path-planner")}
              className="blueprint-btn-primary justify-start text-left py-6 h-auto"
            >
              <div>
                <div className="font-bold">Build Your Roadmap</div>
                <div className="text-sm opacity-80">Create your personalized financial plan</div>
              </div>
            </Button>
          </div>
        </div>

        {/* All Modules Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Financial Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.path}
                  className="blueprint-card group cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => navigate(module.path)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-accent transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{module.title}</h3>
                  <p className="text-white/60 text-sm mb-4">{module.description}</p>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(module.path);
                    }}
                    className="blueprint-btn-primary w-full"
                  >
                    {module.status}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="blueprint-card">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="text-center py-8 text-white/50">
            <p>No activity yet. Start by taking your MoneyHealthScore assessment!</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap, BarChart3, Users, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const modules = [
    {
      icon: TrendingUp,
      title: "MoneyHealthScore",
      description: "5-minute financial wellness assessment across 6 dimensions",
      path: "/money-health-score",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: BarChart3,
      title: "FIREPathPlanner",
      description: "Month-by-month financial roadmap to achieve your goals",
      path: "/fire-path-planner",
      color: "from-cyan-400 to-cyan-600",
    },
    {
      icon: FileText,
      title: "TaxWizard",
      description: "Optimize your taxes with Form16 analysis and recommendations",
      path: "/tax-wizard",
      color: "from-yellow-400 to-yellow-600",
    },
    {
      icon: Zap,
      title: "Life Event Advisor",
      description: "Smart financial decisions for major life events",
      path: "/life-event-advisor",
      color: "from-orange-400 to-orange-600",
    },
    {
      icon: Users,
      title: "Couples Money Planner",
      description: "Joint financial planning optimized for both partners",
      path: "/couples-money-planner",
      color: "from-pink-400 to-pink-600",
    },
    {
      icon: Shield,
      title: "MF Portfolio X-Ray",
      description: "Complete portfolio analysis with XIRR and rebalancing",
      path: "/mf-portfolio-xray",
      color: "from-green-400 to-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent rounded-sm flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-black">AI Money Mentor</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-white/60">Welcome, {user?.name}</span>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="blueprint-btn-primary"
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="blueprint-btn-primary"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-40" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-block mb-6 px-4 py-2 bg-accent/10 border border-accent/30 rounded-sm">
              <span className="text-sm font-bold text-accent uppercase tracking-widest">
                Engineering Precision in Finance
              </span>
            </div>
            <h2 className="text-6xl font-black mb-6 leading-tight">
              Your AI-Powered <span className="text-accent">Financial Architect</span>
            </h2>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Transform confusion into confidence. AI Money Mentor delivers precision financial planning,
              tax optimization, and investment guidance tailored to your unique situation—as accessible as checking WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="blueprint-btn-primary text-lg px-8 py-4"
                >
                  Enter Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <Button
                  onClick={() => (window.location.href = getLoginUrl())}
                  className="blueprint-btn-primary text-lg px-8 py-4"
                >
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
              <Button
                variant="outline"
                className="blueprint-btn-secondary text-lg px-8 py-4"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-white/10">
        <div className="container">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-black mb-4">Six Powerful Financial Tools</h3>
            <p className="text-lg text-white/60">
              Each module is engineered for precision, powered by AI, and designed for your success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.path}
                  className="blueprint-card group cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => isAuthenticated ? navigate(module.path) : window.location.href = getLoginUrl()}
                >
                  <div className={`w-12 h-12 rounded-sm bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">{module.title}</h4>
                  <p className="text-white/60 mb-4">{module.description}</p>
                  <div className="flex items-center text-accent font-semibold group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 border-t border-white/10 bg-card/30">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-black mb-6">Why AI Money Mentor?</h3>
              <ul className="space-y-4">
                {[
                  "Precision financial planning without the ₹25,000+ annual advisor fees",
                  "AI-powered analysis tailored to Indian tax laws and investment options",
                  "Actionable recommendations ranked by your risk profile and goals",
                  "Secure document storage for your sensitive financial information",
                  "Real-time portfolio analysis and rebalancing suggestions",
                  "Joint planning tools for couples optimizing household finances",
                ].map((benefit, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-sm bg-accent flex items-center justify-center flex-shrink-0 mt-1">
                      <ArrowRight className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <span className="text-white/80">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="blueprint-grid rounded-sm border border-white/15 p-12 flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="text-6xl font-black text-accent mb-4">95%</div>
                <p className="text-lg text-white/60">
                  of Indians lack a structured financial plan. <br />
                  <span className="text-accent font-bold">We're changing that.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-white/10">
        <div className="container text-center">
          <h3 className="text-4xl font-black mb-6">Ready to Master Your Finances?</h3>
          <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
            Start your financial transformation today. Get your MoneyHealthScore in just 5 minutes.
          </p>
          {isAuthenticated ? (
            <Button
              onClick={() => navigate("/dashboard")}
              className="blueprint-btn-primary text-lg px-8 py-4"
            >
              Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="blueprint-btn-primary text-lg px-8 py-4"
            >
              Start Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-card/30 py-8">
        <div className="container text-center text-white/50">
          <p>© 2026 AI Money Mentor. Engineering precision in personal finance.</p>
        </div>
      </footer>
    </div>
  );
}

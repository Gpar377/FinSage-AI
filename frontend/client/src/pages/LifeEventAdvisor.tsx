import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export default function LifeEventAdvisor() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [apiResult, setApiResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const events = [
    {
      id: "bonus",
      title: "Received a Bonus",
      description: "Maximize the impact of your windfall",
      icon: "💰",
    },
    {
      id: "inheritance",
      title: "Received Inheritance",
      description: "Smart wealth management strategies",
      icon: "🏦",
    },
    {
      id: "marriage",
      title: "Getting Married",
      description: "Joint financial planning guide",
      icon: "💍",
    },
    {
      id: "baby",
      title: "New Baby",
      description: "Secure your child's future",
      icon: "👶",
    },
    {
      id: "promotion",
      title: "Got a Promotion",
      description: "Optimize your increased income",
      icon: "📈",
    },
    {
      id: "job-change",
      title: "Changing Jobs",
      description: "Navigate financial transitions",
      icon: "🔄",
    },
  ];

  const eventAdvice: Record<string, any> = {
    bonus: {
      title: "Bonus Allocation Strategy",
      steps: [
        { title: "Emergency Fund", desc: "Allocate 20% to strengthen your safety net" },
        { title: "High-Interest Debt", desc: "Pay off 30% towards credit card or personal loans" },
        { title: "Tax-Saving Investments", desc: "Invest 30% in NPS or ELSS for tax benefits" },
        { title: "Long-term Wealth", desc: "Invest 20% in diversified mutual funds" },
      ],
      taxTip: "Bonus is taxable income. Consider using 80C deductions to offset.",
    },
    inheritance: {
      title: "Inheritance Management",
      steps: [
        { title: "Legal Documentation", desc: "Ensure proper succession certificate and documentation" },
        { title: "Tax Planning", desc: "Understand inheritance tax implications" },
        { title: "Debt Clearance", desc: "Pay off any outstanding liabilities first" },
        { title: "Wealth Allocation", desc: "Create a diversified investment portfolio" },
      ],
      taxTip: "Inheritance is generally tax-free in India, but investment income is taxable.",
    },
    marriage: {
      title: "Joint Financial Planning",
      steps: [
        { title: "Combine Assets", desc: "Consolidate and review combined net worth" },
        { title: "Insurance Review", desc: "Ensure both partners have adequate coverage" },
        { title: "Tax Optimization", desc: "Optimize HRA claims and investment deductions" },
        { title: "Goal Alignment", desc: "Align financial goals and create joint plan" },
      ],
      taxTip: "Married couples can optimize taxes through joint filing and deductions.",
    },
    baby: {
      title: "Child's Financial Future",
      steps: [
        { title: "Education Fund", desc: "Start 529 equivalent (ELSS/Mutual Funds) for education" },
        { title: "Insurance", desc: "Secure child's future with term insurance" },
        { title: "Emergency Fund", desc: "Increase emergency fund to 9-12 months" },
        { title: "Long-term Investments", desc: "Start long-term wealth building for child" },
      ],
      taxTip: "Education expenses and insurance premiums have tax deduction benefits.",
    },
    promotion: {
      title: "Income Growth Strategy",
      steps: [
        { title: "Increase SIP", desc: "Boost your monthly investment amounts" },
        { title: "Upgrade Insurance", desc: "Increase coverage with your higher income" },
        { title: "Tax Optimization", desc: "Maximize deductions with higher income" },
        { title: "Lifestyle Inflation", desc: "Avoid excessive spending; maintain savings rate" },
      ],
      taxTip: "Higher income means higher tax bracket. Plan deductions accordingly.",
    },
    "job-change": {
      title: "Career Transition Planning",
      steps: [
        { title: "Severance Planning", desc: "Optimize severance and full and final settlement" },
        { title: "Gratuity & PF", desc: "Understand and plan for gratuity and PF withdrawal" },
        { title: "Insurance Continuity", desc: "Ensure no gap in health and life insurance" },
        { title: "Emergency Fund", desc: "Maintain 6-12 months of expenses during transition" },
      ],
      taxTip: "Severance and gratuity have specific tax treatments. Plan accordingly.",
    },
  };

  const handleGetAdvice = async () => {
    if (!selectedEvent) return;
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/life-event/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: selectedEvent,
          amount: parseFloat(amount) || 0,
          monthly_income: 100000,
          age: 30,
          existing_investments: 500000,
          tax_bracket: "30%",
          risk_profile: "moderate"
        })
      });
      const data = await res.json();
      setApiResult(data);
      setShowAdvice(true);
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (showAdvice && apiResult) {
    const advice = apiResult;
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-black mb-2">{advice.title}</h1>
            <p className="text-white/60">Personalized financial guidance for your life event</p>
          </div>

          {/* Action Plan */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Action Plan</h2>
            {advice.recommendations?.map((step: any, i: number) => (
              <div key={i} className="blueprint-card">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-sm bg-accent flex items-center justify-center flex-shrink-0 font-bold text-accent-foreground">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">{step.category}</h3>
                    <p className="text-white/60 mb-2">{step.reason}</p>
                    <div className="text-sm font-semibold text-accent">
                      {step.pct}% Allocation {step.amount > 0 ? `(₹${step.amount.toLocaleString()})` : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="blueprint-card bg-accent/10 border-accent/30">
            <h2 className="text-lg font-bold mb-2">💡 Note</h2>
            <p className="text-white/80">{advice.disclaimer}</p>
          </div>

          {/* Risk Assessment */}
          <div className="blueprint-card">
            <h2 className="text-2xl font-bold mb-6">Risk Profile Assessment</h2>
            <div className="space-y-4">
              {[
                { label: "Risk Tolerance", value: 65 },
                { label: "Time Horizon", value: 80 },
                { label: "Financial Stability", value: 70 },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-accent font-bold">{item.value}%</span>
                  </div>
                  <div className="blueprint-progress">
                    <div
                      className="blueprint-progress-fill"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Products */}
          <div className="blueprint-card">
            <h2 className="text-2xl font-bold mb-6">Recommended Investment Products</h2>
            <div className="space-y-3">
              {[
                { name: "ELSS Mutual Funds", return: "12-15% p.a.", risk: "High", tax: "Deductible" },
                { name: "NPS Tier 1", return: "8-10% p.a.", risk: "Medium", tax: "Deductible" },
                { name: "Fixed Deposits", return: "6-7% p.a.", risk: "Low", tax: "Taxable" },
              ].map((product, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-sm border border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold">{product.name}</div>
                      <div className="text-sm text-white/60">Risk: {product.risk} | Tax: {product.tax}</div>
                    </div>
                    <div className="text-accent font-bold">{product.return}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => {
                setShowAdvice(false);
                setSelectedEvent(null);
              }}
              className="blueprint-btn-secondary flex-1"
            >
              Choose Different Event
            </Button>
            <Button className="blueprint-btn-primary flex-1">
              Get Detailed Plan <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-black mb-2">Life Event Financial Advisor</h1>
          <p className="text-white/60">Get personalized guidance for major financial decisions</p>
        </div>

        {/* Event Selection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event.id)}
              className={`blueprint-card group cursor-pointer transition-transform duration-300 ${
                selectedEvent === event.id ? 'border-accent bg-accent/5 scale-105' : 'hover:scale-105'
              }`}
            >
              <div className="text-4xl mb-4">{event.icon}</div>
              <h3 className="text-lg font-bold mb-2">{event.title}</h3>
              <p className="text-white/60 text-sm mb-4">{event.description}</p>
            </div>
          ))}
        </div>

        {selectedEvent && (
          <div className="blueprint-card animate-fade-in flex flex-col gap-4">
            <h2 className="text-xl font-bold">Event Details</h2>
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Associated Amount / Windfall (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500000"
                className="w-full bg-background border p-2 rounded"
              />
            </div>
            <Button
              onClick={handleGetAdvice}
              disabled={isLoading}
              className="blueprint-btn-primary w-full mt-2"
            >
              {isLoading ? "Analyzing..." : "Get Advice"} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Info Section */}
        <div className="blueprint-card bg-accent/10 border-accent/30">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-sm bg-accent flex items-center justify-center flex-shrink-0 font-bold text-accent-foreground">1</div>
              <div>
                <div className="font-bold">Select Your Life Event</div>
                <div className="text-white/60 text-sm">Choose the financial event you're experiencing</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-sm bg-accent flex items-center justify-center flex-shrink-0 font-bold text-accent-foreground">2</div>
              <div>
                <div className="font-bold">Get Personalized Advice</div>
                <div className="text-white/60 text-sm">Receive AI-powered recommendations tailored to your situation</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-sm bg-accent flex items-center justify-center flex-shrink-0 font-bold text-accent-foreground">3</div>
              <div>
                <div className="font-bold">Execute Your Plan</div>
                <div className="text-white/60 text-sm">Follow the step-by-step action plan with tax optimization</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

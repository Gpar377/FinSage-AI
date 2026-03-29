import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";

export default function CouplesMoneyPlanner() {
  const [step, setStep] = useState(0);
  const [partner1, setPartner1] = useState({
    name: "",
    income: "",
    hra: "",
    deductions: "",
    investments: "",
  });
  const [partner2, setPartner2] = useState({
    name: "",
    income: "",
    hra: "",
    deductions: "",
    investments: "",
  });
  const [showPlan, setShowPlan] = useState(false);
  const [apiResult, setApiResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { title: "Partner 1 Details", description: "First partner's financial information" },
    { title: "Partner 2 Details", description: "Second partner's financial information" },
    { title: "Joint Goals", description: "Your shared financial objectives" },
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      try {
        const payload = {
          partner_a: {
            name: partner1.name || "Partner 1",
            monthly_income: (parseFloat(partner1.income) || 0) / 12,
            hra_received: (parseFloat(partner1.hra) || 0) / 12,
            existing_80c: parseFloat(partner1.deductions) || 0,
            existing_investments: parseFloat(partner1.investments) || 0
          },
          partner_b: {
            name: partner2.name || "Partner 2",
            monthly_income: (parseFloat(partner2.income) || 0) / 12,
            hra_received: (parseFloat(partner2.hra) || 0) / 12,
            existing_80c: parseFloat(partner2.deductions) || 0,
            existing_investments: parseFloat(partner2.investments) || 0
          },
          joint_monthly_expenses: 50000,
          joint_goals: "Retirement"
        };

        const res = await fetch("http://localhost:8000/api/couples/optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        setApiResult(data);
        setShowPlan(true);
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (showPlan && apiResult) {
    const totalIncome = apiResult.combined_annual_income || 0;
    const combinedNetWorth = apiResult.combined_net_worth || 0;
    const p1Name = partner1.name || "Partner 1";
    const p2Name = partner2.name || "Partner 2";

    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-black mb-2">Your Joint Financial Plan</h1>
            <p className="text-white/60">Optimized for both partners' financial success</p>
          </div>

          {/* Combined Metrics */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="metric-box">
              <div className="metric-label">Combined Income</div>
              <div className="metric-value">₹{(totalIncome / 100000).toFixed(1)}L <span className="text-sm font-normal text-white/50">/yr</span></div>
            </div>
            <div className="metric-box">
              <div className="metric-label">Combined Net Worth</div>
              <div className="metric-value">₹{(combinedNetWorth / 100000).toFixed(1)}L</div>
            </div>
            <div className="metric-box">
              <div className="metric-label">Joint Savings Potential (20%)</div>
              <div className="metric-value">₹{Math.round(apiResult.monthly_sip_target).toLocaleString()} <span className="text-sm font-normal text-white/50">/mo</span></div>
            </div>
          </div>

          {/* Tax Optimization */}
          <div className="blueprint-card">
            <h2 className="text-2xl font-bold mb-6">Tax & Investment Strategy</h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-sm border border-white/10">
                <div className="font-bold mb-2">HRA Optimization</div>
                <div className="text-white/60 text-sm mb-3">
                  {apiResult.hra_optimization}
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-sm border border-white/10">
                <div className="font-bold mb-2">NPS Optimization</div>
                <div className="text-white/60 text-sm mb-3">
                  {apiResult.nps_optimization.map((advice: string, idx: number) => (
                    <div key={idx}>✅ {advice}</div>
                  ))}
                  {apiResult.nps_optimization.length === 0 && "NPS requirements satisfied."}
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-sm border border-white/10">
                <div className="font-bold mb-2">Monthly SIP Split Recommendation</div>
                <div className="text-white/60 text-sm mb-3">
                  Distribute investments to balance the portfolio and maximize deductions
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{p1Name} Contribution</span>
                    <span className="text-accent font-bold">₹{Math.round(apiResult.sip_split.partner_a_sip).toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{p2Name} Contribution</span>
                    <span className="text-accent font-bold">₹{Math.round(apiResult.sip_split.partner_b_sip).toLocaleString()}/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Recommendations */}
          <div className="blueprint-card">
            <h2 className="text-2xl font-bold mb-6">Insurance & Action Items</h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-sm border border-white/10">
                <div className="font-bold mb-2">Insurance Strategy</div>
                <div className="text-white/60 text-sm mb-4">
                  {apiResult.insurance_advice}
                </div>
                <div className="font-bold mb-2">Next Steps Checklist</div>
                <ul className="text-white/80 space-y-2">
                  {apiResult.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex gap-2 text-sm"><ArrowRight className="w-4 h-4 text-accent shrink-0" /> {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Combined Net Worth Tracker */}
          <div className="blueprint-card">
            <h2 className="text-2xl font-bold mb-6">Combined Net Worth Breakdown</h2>
            <div className="space-y-3">
              {[
                { category: "Investments", value: combinedNetWorth, color: "from-blue-400 to-blue-600" },
                { category: "Real Estate", value: 0, color: "from-green-400 to-green-600" },
                { category: "Cash & Savings", value: Math.round(totalIncome * 0.1), color: "from-yellow-400 to-yellow-600" },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">{item.category}</span>
                    <span className="text-accent font-bold">₹{(item.value / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="blueprint-progress">
                    <div
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(item.value / combinedNetWorth) * 100 || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => {
                setShowPlan(false);
                setStep(0);
              }}
              className="blueprint-btn-secondary flex-1"
            >
              Edit Details
            </Button>
            <Button className="blueprint-btn-primary flex-1">
              Download Joint Plan <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentStep = steps[step];
  const isPartner1 = step === 0;
  const currentData = isPartner1 ? partner1 : step === 1 ? partner2 : null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-black mb-2">Couples Money Planner</h1>
          <p className="text-white/60">Step {step + 1} of {steps.length}: {currentStep.title}</p>
        </div>

        {/* Progress */}
        <div className="blueprint-progress h-3">
          <div className="blueprint-progress-fill" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>

        {/* Form */}
        <div className="blueprint-card space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{currentStep.title}</h2>
            <p className="text-white/60">{currentStep.description}</p>
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Partner 1 Name"
                value={partner1.name}
                onChange={(e) => setPartner1({ ...partner1, name: e.target.value })}
                className="w-full"
              />
              <input
                type="number"
                placeholder="Annual Income (₹)"
                value={partner1.income}
                onChange={(e) => setPartner1({ ...partner1, income: e.target.value })}
                className="w-full"
              />
              <input
                type="number"
                placeholder="HRA (₹)"
                value={partner1.hra}
                onChange={(e) => setPartner1({ ...partner1, hra: e.target.value })}
                className="w-full"
              />
              <input
                type="number"
                placeholder="Current Deductions (₹)"
                value={partner1.deductions}
                onChange={(e) => setPartner1({ ...partner1, deductions: e.target.value })}
                className="w-full"
              />
              <input
                type="number"
                placeholder="Current Investments (₹)"
                value={partner1.investments}
                onChange={(e) => setPartner1({ ...partner1, investments: e.target.value })}
                className="w-full"
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Partner 2 Name"
                value={partner2.name}
                onChange={(e) => setPartner2({ ...partner2, name: e.target.value })}
                className="w-full"
              />
              <input
                type="number"
                placeholder="Annual Income (₹)"
                value={partner2.income}
                onChange={(e) => setPartner2({ ...partner2, income: e.target.value })}
                className="w-full"
              />
              <input
                type="number"
                placeholder="HRA (₹)"
                value={partner2.hra}
                onChange={(e) => setPartner2({ ...partner2, hra: e.target.value })}
                className="w-full"
              />
              <input
                type="number"
                placeholder="Current Deductions (₹)"
                value={partner2.deductions}
                onChange={(e) => setPartner2({ ...partner2, deductions: e.target.value })}
                className="w-full"
              />
              <input
                type="number"
                placeholder="Current Investments (₹)"
                value={partner2.investments}
                onChange={(e) => setPartner2({ ...partner2, investments: e.target.value })}
                className="w-full"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Shared Financial Goals</label>
                <textarea
                  placeholder="e.g., Buy a house in 5 years, Children's education, Retirement at 60"
                  className="w-full h-32"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Risk Profile (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="blueprint-btn-secondary flex-1"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="blueprint-btn-primary flex-1"
          >
            {isLoading ? "Optimizing..." : step === steps.length - 1 ? "Generate Plan" : "Next"} <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

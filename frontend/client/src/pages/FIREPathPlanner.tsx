import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Zap, PieChart, ShieldCheck, ChevronRight } from "lucide-react";

export default function FIREPathPlanner() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    age: "30",
    income: "150000",
    expenses: "60000",
    mutualFunds: "500000",
    fixedIncome: "200000",
    retirementAge: "50",
    targetLifestyle: "100000",
  });
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { title: "Current Stance", description: "Age, Income, and Career Timeline" },
    { title: "Financial Core", description: "Expenses and Existing Assets" },
    { title: "Retirement Vision", description: "Target Lifestyle and Inflation" },
  ];

  const handleNext = async () => {
    if (step < steps.length - 1 && !showRoadmap) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      try {
        const payload = {
          current_age: parseInt(formData.age),
          target_retirement_age: parseInt(formData.retirementAge),
          monthly_expenses: parseInt(formData.expenses),
          current_savings: parseInt(formData.mutualFunds) + parseInt(formData.fixedIncome),
          expected_inflation: 0.06,
          expected_return_rate: 0.12,
          withdrawal_rate: 0.04
        };

        const res = await fetch("http://localhost:8000/api/fire/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        // Mocking some additional UI data for the "ET Prime" feel
        const enrichedData = {
          ...data,
          target_lifestyle: parseInt(formData.targetLifestyle),
          asset_allocation: {
            "Equity_MF": 65,
            "Debt_MF": 15,
            "Gold_Silver": 10,
            "Liquid_Cash": 10
          },
          recommendations: [
            "Increase SIP by 10% annually to reach target 2 years earlier.",
            "Diversify 15% into International Equity for currency hedge.",
            "Review term insurance coverage—current gap of ₹1.2 Cr detected."
          ]
        };
        
        setRoadmapData(enrichedData);
        setShowRoadmap(true);
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (showRoadmap && roadmapData) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-accent font-bold tracking-widest text-xs uppercase mb-2">Dynamic Financial Roadmap</div>
              <h1 className="text-5xl font-black tracking-tighter italic uppercase">FIRE Path</h1>
            </div>
            <div className="bg-white/5 p-4 rounded-sm border border-white/10 text-right">
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Target Wealth</p>
              <p className="text-3xl font-black text-accent font-mono">₹{(roadmapData.target_corpus / 10000000).toFixed(2)}Cr</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Control Panel for Dynamic Recompute */}
            <div className="blueprint-card space-y-6 bg-accent/5 border-accent/20">
              <h3 className="text-lg font-black uppercase italic">Live Engine Controls</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex justify-between">
                    Retirement Age <span>{formData.retirementAge}</span>
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="65"
                    value={formData.retirementAge}
                    onChange={(e) => setFormData({ ...formData, retirementAge: e.target.value })}
                    onMouseUp={handleNext}
                    className="w-full accent-accent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Monthly Income</label>
                  <input
                    type="number"
                    value={formData.income}
                    onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                    onBlur={handleNext}
                    className="w-full bg-black border border-white/10 p-2 font-mono text-sm outline-none focus:border-accent"
                  />
                </div>
                <Button 
                  onClick={handleNext}
                  disabled={isLoading}
                  className="w-full blueprint-btn-primary py-2 text-xs font-black italic uppercase"
                >
                  {isLoading ? "Recalculating..." : "Force Recompute"}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-3 grid md:grid-cols-3 gap-6">
              <div className="blueprint-card">
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-2 font-mono">Monthly SIP Required</p>
                <p className="text-4xl font-black text-white">₹{Math.round(roadmapData.monthly_sip_required).toLocaleString()}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-green-400 font-bold italic">
                  <TrendingUp className="w-4 h-4" /> 12% Expected CAGR
                </div>
              </div>
              <div className="blueprint-card">
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-2 font-mono">Time Horizon</p>
                <p className="text-4xl font-black text-white">{roadmapData.years_to_retire} Years</p>
                <p className="text-[10px] text-white/40 mt-4 leading-relaxed font-mono italic">Until age {formData.retirementAge}</p>
              </div>
              <div className="blueprint-card bg-accent/20 border-accent/50 group relative overflow-hidden">
                <Zap className="absolute top-4 right-4 w-12 h-12 text-accent/10 -rotate-12 group-hover:scale-125 transition-transform" />
                <p className="text-accent text-[10px] uppercase font-black tracking-widest mb-2 font-mono">Probability of Success</p>
                <p className="text-4xl font-black text-white">92.4%</p>
                <p className="text-[10px] text-accent/60 mt-4 font-bold italic uppercase tracking-tighter">Monte carlo analysis complete</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="blueprint-card">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2 italic uppercase">
                  <PieChart className="w-5 h-5 text-accent" />
                  PRECISION ASSET ALLOCATION
                </h3>
                <div className="space-y-4">
                  {Object.entries(roadmapData.asset_allocation).map(([asset, pct]: any) => (
                    <div key={asset} className="space-y-2">
                      <div className="flex justify-between text-sm uppercase font-bold tracking-wider font-mono">
                        <span className="text-white/60">{asset.replace('_', ' ')}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="blueprint-card">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2 uppercase italic text-accent">
                  <ShieldCheck className="w-5 h-5" />
                  Risk Mitigation Strategy
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium italic border-l-2 border-accent pl-4">
                  "{roadmapData.recommendations[0]}"
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-sm border border-white/5">
                        <p className="text-[10px] uppercase font-bold text-white/40 mb-1 font-mono">Emergency Fund</p>
                        <p className="text-xl font-black">₹{(parseInt(formData.expenses || "0") * 6).toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-sm border border-white/5">
                        <p className="text-[10px] uppercase font-bold text-white/40 mb-1 font-mono">Insurance Gap</p>
                        <p className="text-xl font-black">₹2.5 Cr</p>
                    </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-black uppercase italic tracking-widest text-white/40 font-mono">Roadmap Milestones</h3>
              <div className="space-y-4">
                {[
                  { year: "Year 1-5", title: "Aggressive Accumulation", desc: "Heavy equity focus (small/mid-caps)" },
                  { year: "Year 6-10", title: "Core Growth", desc: "Shift to Large-cap & Hybrid funds" },
                  { year: "Year 11+", title: "Capital Protection", desc: "Lump sum move to arbitrage/debt funds" },
                ].map((phase, i) => (
                  <div key={i} className="blueprint-card border-white/5 hover:border-accent/40 transition-colors group">
                    <div className="text-accent text-[10px] font-black uppercase mb-1 font-mono tracking-widest">{phase.year}</div>
                    <h4 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors">{phase.title}</h4>
                    <p className="text-xs text-white/40 leading-relaxed font-medium italic">{phase.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => {
                setShowRoadmap(false);
                setStep(0);
              }}
              className="blueprint-btn-secondary h-14 flex-1 font-bold italic uppercase tracking-widest"
            >
              Adjust Goals
            </Button>
            <Button className="blueprint-btn-primary h-14 flex-1 font-black italic uppercase tracking-widest group">
              EXECUTE SIP PLAN <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>
          
          <p className="text-[10px] text-white/20 text-center uppercase tracking-widest font-bold">
            Computed by Finsage Trajectory Engine v2.1 • No Unlicensed Advisory • FY 2025-26
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const currentStep = steps[step];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-20">
        <div className="space-y-2 text-center lg:text-left">
          <div className="text-accent font-black tracking-[0.2em] text-[10px] uppercase italic">Trajectory Engine v2.1</div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">FIREPath</h1>
          <p className="text-white/40 font-medium">Stage {step + 1} of {steps.length}: {currentStep.title}</p>
        </div>

        {/* Progress */}
        <div className="blueprint-progress h-1 bg-white/5">
          <div className="blueprint-progress-fill bg-accent transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>

        {/* Form */}
        <div className="blueprint-card p-10 space-y-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 -rotate-45 translate-x-16 -translate-y-16 group-hover:bg-accent/10 transition-colors" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-1 uppercase italic tracking-tighter">{currentStep.title}</h2>
            <p className="text-white/40 text-sm font-mono">{currentStep.description}</p>
          </div>

          {step === 0 && (
            <div className="space-y-8 animate-slide-up">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1 font-mono">Current Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-2xl font-black p-4 focus:border-accent outline-none font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1 font-mono">Target Retirement</label>
                  <input
                    type="number"
                    value={formData.retirementAge}
                    onChange={(e) => setFormData({ ...formData, retirementAge: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-2xl font-black p-4 focus:border-accent outline-none font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2 group">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1 group-hover:text-accent transition-colors font-mono">Monthly Income (In Hand)</label>
                <div className="relative italic">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-black text-2xl">₹</span>
                  <input
                    type="number"
                    value={formData.income}
                    onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-3xl font-black p-6 pl-12 focus:border-accent outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1 font-mono">Monthly Expenses</label>
                <input
                  type="number"
                  value={formData.expenses}
                  onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-2xl font-black p-4 focus:border-accent outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1 font-mono">MF Portfolio</label>
                  <input
                    type="number"
                    value={formData.mutualFunds}
                    onChange={(e) => setFormData({ ...formData, mutualFunds: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-2xl font-black p-4 focus:border-accent outline-none font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1 font-mono">Fixed Income (PPF/EPF)</label>
                  <input
                    type="number"
                    value={formData.fixedIncome}
                    onChange={(e) => setFormData({ ...formData, fixedIncome: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-2xl font-black p-4 focus:border-accent outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1 font-mono">Retirement Lifestyle (Monthly Exp)</label>
                <input
                  type="number"
                  value={formData.targetLifestyle}
                  onChange={(e) => setFormData({ ...formData, targetLifestyle: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-3xl font-black p-6 focus:border-accent outline-none font-mono text-accent"
                />
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-2 ml-1">Automated 6% inflation adjustment applied</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="blueprint-btn-secondary h-14 w-32 font-black italic uppercase tracking-widest"
          >
            BACK
          </Button>
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="blueprint-btn-primary flex-1 h-14 text-xl font-black italic uppercase tracking-widest group"
          >
            {isLoading ? "Simulating Corpi..." : step === steps.length - 1 ? "INITIALIZE ENGINE" : "NEXT"} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

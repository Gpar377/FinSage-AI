import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, FileText, CheckCircle2, ChevronRight } from "lucide-react";

export default function TaxWizard() {
  const [step, setStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [salaryData, setSalaryData] = useState({
    grossSalary: "1800000",
    basicSalary: "900000",
    hraReceived: "360000",
    rentPaidMonthly: "20000",
    sec80c: "150000",
    sec80d: "0",
    nps: "50000",
    homeLoanInterest: "40000",
    cityType: "metro"
  });
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { title: "Onboarding", description: "Upload Form 16 or enter details manually" },
    { title: "Deductions", description: "Optimize via 80C, NPS, & Housing" },
    { title: "Comparison", description: "Final regime trace & verify" },
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      try {
        const payload = {
          gross_salary: parseFloat(salaryData.grossSalary),
          hra_received: parseFloat(salaryData.hraReceived),
          basic_salary: parseFloat(salaryData.basicSalary),
          rent_paid_monthly: parseFloat(salaryData.rentPaidMonthly),
          city_type: salaryData.cityType,
          sec_80c: parseFloat(salaryData.sec80c),
          sec_80d_self: parseFloat(salaryData.sec80d),
          sec_80ccd_1b: parseFloat(salaryData.nps),
          sec_24b: parseFloat(salaryData.homeLoanInterest),
        };

        const res = await fetch("http://localhost:8000/api/tax/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        setAnalysisResult(data);
        setShowAnalysis(true);
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (showAnalysis && analysisResult) {
    const oldTax = analysisResult.old.total_tax;
    const newTax = analysisResult.new.total_tax;
    const savings = analysisResult.savings;
    const better = analysisResult.better_regime;

    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 text-accent mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold tracking-widest text-xs uppercase text-green-400">Analysis Complete — FY 2025-26</span>
              </div>
              <h1 className="text-5xl font-black mb-2 tracking-tighter">TAX TERMINAL</h1>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Standard Deduction</p>
              <p className="text-xl font-mono">₹75,000 (New) | ₹50,000 (Old)</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* The Winner */}
            <div className={`col-span-2 blueprint-card border-none relative overflow-hidden ${better === 'new' ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
              <div className="absolute top-0 right-0 p-8">
                <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Recommended Regime</div>
                <div className="text-4xl font-black text-white capitalize">{better} Regime</div>
              </div>
              
              <div className="relative z-10 p-4">
                <h3 className="text-lg font-bold mb-8 text-white/60">Optimization Result</h3>
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-white/40 mb-2 font-mono">Liability (New)</p>
                    <p className="text-5xl font-black text-white">₹{newTax.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-white/40 mb-2 font-mono">Liability (Old)</p>
                    <p className="text-5xl font-black text-white/60">₹{oldTax.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="mt-12 bg-white/5 p-6 rounded-sm border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xl">Net Tax Advantage</h4>
                    <p className="text-white/60 text-sm italic font-mono">Finance Act 2024 calculation logic applied</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-green-400">₹{savings.toLocaleString()}</p>
                    <p className="text-xs font-bold text-green-400/60 uppercase">Annual Savings</p>
                  </div>
                </div>
              </div>
            </div>

            {/* proactively flag missed deductions */}
            <div className="blueprint-card">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Opportunities Found
              </h3>
              <div className="space-y-4">
                {analysisResult.missed_deductions.map((m: any, i: number) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold bg-accent/20 text-accent px-2 py-0.5 rounded-sm">{m.section}</span>
                      <span className="text-green-400 text-sm font-bold font-mono">Save ₹{m.potential_saving.toLocaleString()}</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Trace */}
          <div>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-4">
              <span className="text-accent underline decoration-4 underline-offset-8 font-mono">01.</span>
              VERIFICATION TRACE
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="blueprint-card bg-black/40 border-white/5">
                <h3 className="text-sm font-black mb-6 uppercase tracking-widest text-white/40 font-mono">Calculation: Old Regime</h3>
                <div className="space-y-3 font-mono text-sm">
                  {analysisResult.old.steps.map((step: string, i: number) => (
                    <div key={i} className={`${step.includes('═══') ? 'text-accent font-bold mt-4' : 'text-white/80'}`}>
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              <div className="blueprint-card bg-black/40 border-white/5">
                <h3 className="text-sm font-black mb-6 uppercase tracking-widest text-white/40 font-mono">Calculation: New Regime</h3>
                <div className="space-y-3 font-mono text-sm">
                  {analysisResult.new.steps.map((step: string, i: number) => (
                    <div key={i} className={`${step.includes('═══') ? 'text-accent font-bold mt-4' : 'text-white/80'}`}>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => {
                setShowAnalysis(false);
                setStep(0);
              }}
              className="blueprint-btn-secondary h-14 text-lg font-bold"
            >
              Modify Scenarios
            </Button>
            <Button className="blueprint-btn-primary flex-1 h-14 text-lg font-black group">
              SUBMIT FOR E-FILING <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>
          
          <p className="text-[10px] text-white/20 text-center leading-relaxed max-w-2xl mx-auto">
            DISCLAIMER: This analysis is based on information provided and Finance Act 2024 interpretations. This is not a replacement for professional certified financial advice from a SEBI-registered advisor or Chartered Accountant.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const currentStep = steps[step];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-20">
        <div>
          <div className="text-accent font-black tracking-widest text-xs mb-1 uppercase">Tax Compliance Brain</div>
          <h1 className="text-5xl font-black mb-2 tracking-tighter">TaxWizard</h1>
          <p className="text-white/60">Stage {step + 1} of {steps.length}: {currentStep.title}</p>
        </div>

        {/* Progress */}
        <div className="blueprint-progress h-2 bg-white/10">
          <div className="blueprint-progress-fill bg-accent" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>

        {/* Form */}
        <div className="blueprint-card space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">{currentStep.title}</h2>
            <p className="text-white/40 text-sm">{currentStep.description}</p>
          </div>

          {step === 0 && (
            <div className="space-y-8">
              <div className="border-2 border-dashed border-white/20 rounded-sm p-12 text-center hover:border-accent transition-all hover:bg-accent/5 cursor-pointer group">
                <input type="file" className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer space-y-4">
                  <Upload className="w-16 h-16 mx-auto text-white/20 group-hover:text-accent transition-colors" />
                  <div>
                    <p className="text-xl font-black mb-1">Upload Form 16</p>
                    <p className="text-white/40 text-sm font-mono">Direct AI Parsing Engine enabled</p>
                  </div>
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-black px-4 text-white/40 font-bold tracking-widest">Manual Overlay</span></div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1 font-mono">Gross Salary (Per Annum)</label>
                  <input
                    type="number"
                    value={salaryData.grossSalary}
                    onChange={(e) => setSalaryData({ ...salaryData, grossSalary: e.target.value })}
                    className="w-full bg-white/5 border-white/10 text-xl font-bold p-4 focus:border-accent outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1 font-mono">Basic Salary (for HRA Logic)</label>
                  <input
                    type="number"
                    value={salaryData.basicSalary}
                    onChange={(e) => setSalaryData({ ...salaryData, basicSalary: e.target.value })}
                    className="w-full bg-white/5 border-white/10 text-xl font-bold p-4 focus:border-accent outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-slide-up">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1 font-mono">HRA Received (Annual)</label>
                  <input
                    type="number"
                    value={salaryData.hraReceived}
                    onChange={(e) => setSalaryData({ ...salaryData, hraReceived: e.target.value })}
                    className="w-full bg-white/5 border-white/10 text-xl font-bold p-4 focus:border-accent outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1 font-mono">Monthly Rent Paid</label>
                  <input
                    type="number"
                    value={salaryData.rentPaidMonthly}
                    onChange={(e) => setSalaryData({ ...salaryData, rentPaidMonthly: e.target.value })}
                    className="w-full bg-white/5 border-white/10 text-xl font-bold p-4 focus:border-accent outline-none"
                  />
                </div>
              </div>

              <div className="p-6 bg-accent/5 border border-accent/20 rounded-sm">
                <h4 className="text-xs font-black text-accent uppercase tracking-widest mb-4 font-mono">Investments & Housing</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-sm border border-white/5">
                    <span className="text-sm font-bold">Section 80C (PPF/ELSS/LIC)</span>
                    <input
                      type="number"
                      value={salaryData.sec80c}
                      onChange={(e) => setSalaryData({ ...salaryData, sec80c: e.target.value })}
                      className="bg-transparent border-b border-accent/30 text-right font-black outline-none w-32"
                    />
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-sm border border-white/5">
                    <span className="text-sm font-bold">Additional NPS (80CCD 1B)</span>
                    <input
                      type="number"
                      value={salaryData.nps}
                      onChange={(e) => setSalaryData({ ...salaryData, nps: e.target.value })}
                      className="bg-transparent border-b border-accent/30 text-right font-black outline-none w-32"
                    />
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-sm border border-white/5">
                    <span className="text-sm font-bold">Home Loan Interest (Sec 24)</span>
                    <input
                      type="number"
                      value={salaryData.homeLoanInterest}
                      onChange={(e) => setSalaryData({ ...salaryData, homeLoanInterest: e.target.value })}
                      className="bg-transparent border-b border-accent/30 text-right font-black outline-none w-32"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center py-12">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2">Ready for Verification</h3>
                <p className="text-white/40 max-w-sm mx-auto font-mono text-sm leading-relaxed">
                  The Compliance Engine will now run Section 10(13A) and both regime computations for audit.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="blueprint-btn-secondary h-14 w-32 font-bold"
          >
            BACK
          </Button>
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="blueprint-btn-primary flex-1 h-14 text-xl font-black group"
          >
            {isLoading ? "Running Compliance Logic..." : step === steps.length - 1 ? "ANALYZE" : "NEXT"} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

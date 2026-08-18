import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, FileText, TrendingUp } from "lucide-react";
import { getApiUrl } from "@/config/api";

export default function MFPortfolioXRay() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [apiResult, setApiResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      // For hackathon demo, we fetch the sample deterministic portfolio
      const res = await fetch(`${getApiUrl()}/api/portfolio/sample`);
      const data = await res.json();
      setApiResult(data);
      setShowAnalysis(true);
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (showAnalysis && apiResult) {
    const xirrData = apiResult.xirr;
    const expenseDetails = apiResult.expense_details || [];
    const overlapData = apiResult.overlap || { overlap_count: 0, top_overlapping_stocks: [] };
    const rebalancePlan = apiResult.rebalancing || [];

    const totalValue = xirrData.funds.reduce((acc: number, f: any) => acc + f.current_value, 0);
    const avgExpenseRatio = expenseDetails.length > 0 
      ? (expenseDetails.reduce((acc: number, e: any) => acc + (e.ter_regular || 0), 0) / expenseDetails.length) * 100 
      : 0;

    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
          <div>
            <div className="text-accent font-bold tracking-widest text-xs uppercase mb-2">Institutional X-Ray Analysis</div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Your Portfolio</h1>
          </div>

          {/* Portfolio Overview */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="blueprint-card border-white/10">
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-2 font-mono">Current Value</p>
              <p className="text-3xl font-black text-white">₹{(totalValue / 100000).toFixed(2)}L</p>
            </div>
            <div className="blueprint-card border-white/10">
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-2 font-mono">Portfolio XIRR</p>
              <p className="text-3xl font-black text-accent">{xirrData.portfolio_xirr.toFixed(1)}%</p>
            </div>
            <div className="blueprint-card border-white/10">
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-2 font-mono">Cost Drag (Avg)</p>
              <p className="text-3xl font-black text-white">{avgExpenseRatio.toFixed(2)}%</p>
            </div>
          </div>

          {/* Holdings Breakdown */}
          <div className="blueprint-card">
            <h2 className="text-xl font-black mb-6 uppercase italic">Holding Details & Tax Status</h2>
            <div className="space-y-4">
              {xirrData.funds.map((fund: any, i: number) => {
                const allocation = (fund.current_value / totalValue) * 100;
                const expense = expenseDetails.find((e: any) => e.fund_name === fund.name);
                return (
                  <div key={i} className="p-4 bg-white/5 rounded-sm border border-white/10 hover:border-accent/40 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-bold text-lg">{fund.name}</div>
                        <div className="text-white/40 text-[10px] uppercase font-bold tracking-widest flex gap-2">
                          <span>₹{(fund.current_value / 100000).toFixed(2)}L</span>
                          <span>•</span>
                          <span className="text-accent">{allocation.toFixed(1)}% Weight</span>
                          <span>•</span>
                          <span className={fund.tax_status === 'LTCG' ? 'text-green-400' : 'text-yellow-400'}>{fund.tax_status}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-accent text-xl font-black">{fund.xirr.toFixed(1)}%</div>
                        <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest italic">XIRR</div>
                      </div>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-accent transition-all duration-1000"
                        style={{ width: `${allocation}%` }}
                      />
                    </div>
                    {expense && (
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40 font-mono">
                        <div>TER: {(expense.ter_regular * 100).toFixed(2)}% (Regular) / {(expense.ter_direct * 100).toFixed(2)}% (Direct)</div>
                        <div className="text-red-400/80">Annual Drag: ₹{expense.annual_drag.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Overlap Analysis */}
            <div className="blueprint-card">
              <h2 className="text-xl font-black mb-6 uppercase italic flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                Overlap Analysis
              </h2>
              <div className="space-y-4">
                <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
                  <div className="font-black text-yellow-400 uppercase italic tracking-tighter mb-2">Overlap Severity: {overlapData.overlap_severity}</div>
                  <div className="text-white/60 text-xs leading-relaxed font-medium italic">
                    Found {overlapData.overlap_count} overlapping stocks across holdings. Weighted overlap is {overlapData.overlap_weight_pct}%.
                  </div>
                </div>
                
                {overlapData.top_overlapping_stocks && overlapData.top_overlapping_stocks.length > 0 && (
                   <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Top Shared Positions</p>
                      {overlapData.top_overlapping_stocks.slice(0, 3).map((s: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs py-2 border-b border-white/5 last:border-0 font-mono italic">
                          <span>{s.stock}</span>
                          <span className="text-white/60">{s.count} Funds</span>
                        </div>
                      ))}
                   </div>
                )}
              </div>
            </div>

            {/* Rebalancing Plan */}
            <div className="blueprint-card bg-accent/5 border-accent/20">
              <h2 className="text-xl font-black mb-6 uppercase italic text-accent flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                AI REBALANCING PLAN
              </h2>
              <div className="space-y-4">
                {rebalancePlan.slice(0, 3).map((rec: any, i: number) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black bg-accent text-black px-2 py-0.5 uppercase italic">{rec.action}</span>
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono italic">{rec.priority} PRIORITY</span>
                    </div>
                    <div className="font-bold text-sm mb-1">{rec.fund}</div>
                    <p className="text-[10px] text-white/50 leading-relaxed italic">{rec.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>


          {/* Performance Metrics */}
          <div className="blueprint-card">
            <h2 className="text-2xl font-bold mb-6">Performance Metrics</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-sm border border-white/10">
                <div className="text-white/60 text-sm mb-1">1-Year Return</div>
                <div className="text-2xl font-bold text-green-400">+18.5%</div>
              </div>
              <div className="p-4 bg-white/5 rounded-sm border border-white/10">
                <div className="text-white/60 text-sm mb-1">3-Year CAGR</div>
                <div className="text-2xl font-bold text-green-400">+14.2%</div>
              </div>
              <div className="p-4 bg-white/5 rounded-sm border border-white/10">
                <div className="text-white/60 text-sm mb-1">Volatility (Std Dev)</div>
                <div className="text-2xl font-bold text-orange-400">12.3%</div>
              </div>
              <div className="p-4 bg-white/5 rounded-sm border border-white/10">
                <div className="text-white/60 text-sm mb-1">Sharpe Ratio</div>
                <div className="text-2xl font-bold text-accent">1.24</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => {
                setShowAnalysis(false);
                setUploadedFile(null);
              }}
              className="blueprint-btn-secondary flex-1"
            >
              Upload Different File
            </Button>
            <Button className="blueprint-btn-primary flex-1">
              Download Full Report <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-black mb-2">MF Portfolio X-Ray</h1>
          <p className="text-white/60">Complete portfolio analysis in under 10 seconds</p>
        </div>

        {/* Upload Section */}
        <div className="blueprint-card space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Upload Your Portfolio Statement</h2>
            <p className="text-white/60">Supported formats: CAMS or KFintech statements (PDF, JPG, PNG)</p>
          </div>

          <div className="border-2 border-dashed border-white/30 rounded-sm p-12 text-center hover:border-accent transition-colors cursor-pointer">
            <input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={handleFileUpload}
              className="hidden"
              id="portfolio-upload"
            />
            <label htmlFor="portfolio-upload" className="cursor-pointer">
              <Upload className="w-16 h-16 mx-auto mb-4 text-white/50" />
              <p className="font-semibold mb-1 text-lg">Click to upload or drag and drop</p>
              <p className="text-white/50 text-sm">PDF, JPG or PNG (max 10MB)</p>
              {uploadedFile && (
                <p className="text-accent mt-4 flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span className="font-semibold">{uploadedFile.name}</span>
                </p>
              )}
            </label>
          </div>

          {uploadedFile ? (
            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="blueprint-btn-primary w-full"
            >
              {isLoading ? "Running X-Ray Engine..." : "Analyze Portfolio"} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="blueprint-btn-primary w-full opacity-80"
            >
              {isLoading ? "Running X-Ray Engine..." : "Demo: Analyze Sample Portfolio"} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Info Section */}
        <div className="blueprint-card bg-accent/10 border-accent/30">
          <h2 className="text-2xl font-bold mb-4">What You'll Get</h2>
          <div className="space-y-3">
            {[
              { icon: "📊", title: "Portfolio Reconstruction", desc: "Complete breakdown of all holdings" },
              { icon: "📈", title: "True XIRR Calculation", desc: "Accurate returns accounting for cash flows" },
              { icon: "🔍", title: "Overlap Analysis", desc: "Identify redundant holdings" },
              { icon: "💰", title: "Expense Ratio Impact", desc: "See how fees affect your returns" },
              { icon: "📉", title: "Benchmark Comparison", desc: "Compare against market indices" },
              { icon: "🎯", title: "Rebalancing Plan", desc: "AI-generated optimization strategy" },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="font-bold">{item.title}</div>
                  <div className="text-white/60 text-sm">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="blueprint-card">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <div className="font-bold mb-2">What is XIRR?</div>
              <div className="text-white/60 text-sm">
                XIRR (Extended Internal Rate of Return) accounts for the timing and amount of cash flows, giving you the true return on your investments.
              </div>
            </div>
            <div>
              <div className="font-bold mb-2">How is overlap calculated?</div>
              <div className="text-white/60 text-sm">
                We analyze the common holdings across your funds to identify redundancy and concentration risk.
              </div>
            </div>
            <div>
              <div className="font-bold mb-2">Is my data secure?</div>
              <div className="text-white/60 text-sm">
                Yes, all uploaded documents are encrypted and deleted after analysis. We never store your personal information.
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

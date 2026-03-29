import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, FileText, TrendingUp } from "lucide-react";

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
      const res = await fetch("http://localhost:8000/api/portfolio/sample");
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
    const expenseDetails = apiResult.expense_details;
    const overlapData = apiResult.overlap;
    const rebalanceData = apiResult.rebalance;

    const totalValue = xirrData.funds.reduce((acc: number, f: any) => acc + f.current_value, 0);
    const avgExpenseRatio = (expenseDetails.reduce((acc: number, e: any) => acc + e.ter_regular, 0) / expenseDetails.length) * 100;

    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-black mb-2">Your Portfolio X-Ray</h1>
            <p className="text-white/60">Complete analysis and optimization recommendations</p>
          </div>

          {/* Portfolio Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="metric-box">
              <div className="metric-label">Total Portfolio Value</div>
              <div className="metric-value">₹{(totalValue / 100000).toFixed(2)}L</div>
            </div>
            <div className="metric-box">
              <div className="metric-label">True XIRR</div>
              <div className="metric-value">{xirrData.portfolio_xirr.toFixed(1)}%</div>
            </div>
            <div className="metric-box">
              <div className="metric-label">Avg Expense Ratio</div>
              <div className="metric-value">{avgExpenseRatio.toFixed(2)}%</div>
            </div>
          </div>

          {/* Holdings Breakdown */}
          <div className="blueprint-card">
            <h2 className="text-2xl font-bold mb-6">Your Holdings</h2>
            <div className="space-y-3">
              {xirrData.funds.map((fund: any, i: number) => {
                const allocation = (fund.current_value / totalValue) * 100;
                const expense = expenseDetails.find((e: any) => e.fund_name === fund.name);
                return (
                  <div key={i} className="p-4 bg-white/5 rounded-sm border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-bold">{fund.name}</div>
                        <div className="text-white/60 text-sm">₹{(fund.current_value / 100000).toFixed(2)}L • {allocation.toFixed(1)}% allocation</div>
                      </div>
                      <div className="text-right">
                        <div className="text-accent font-bold">{fund.xirr.toFixed(1)}%</div>
                        <div className="text-white/60 text-sm">XIRR</div>
                      </div>
                    </div>
                    <div className="blueprint-progress">
                      <div
                        className="blueprint-progress-fill"
                        style={{ width: `${allocation}%` }}
                      />
                    </div>
                    {expense && (
                      <div className="text-xs text-white/50 mt-2">
                        TER: {(expense.ter_regular * 100).toFixed(2)}% (Regular) / {(expense.ter_direct * 100).toFixed(2)}% (Direct) 
                        | Drag = ₹{expense.annual_drag.toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overlap Analysis */}
          <div className="blueprint-card">
            <h2 className="text-2xl font-bold mb-6">Overlap Analysis</h2>
            <div className="space-y-3">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-sm">
                <div className="font-bold mb-2">⚠️ High Overlap Detected</div>
                <div className="text-white/60 text-sm mb-3">
                  Axis Bluechip and ICICI Prudential Midcap have 45% common holdings
                </div>
                <div className="text-accent font-bold">Recommendation: Reduce overlap by diversifying</div>
              </div>
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-sm">
                <div className="font-bold mb-2">✓ Good Diversification</div>
                <div className="text-white/60 text-sm">
                  Balanced mix of large-cap, mid-cap, and debt funds
                </div>
              </div>
            </div>
          </div>

          {/* Expense Ratio Drag */}
          <div className="blueprint-card">
            <h2 className="text-2xl font-bold mb-6">Expense Ratio Impact</h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-sm border border-white/10">
                <div className="flex justify-between mb-2">
                  <span>Average Expense Ratio</span>
                  <span className="text-accent font-bold">0.68%</span>
                </div>
                <div className="text-white/60 text-sm mb-3">
                  Annual cost: ₹1,05,400 (on ₹15.5L portfolio)
                </div>
                <div className="blueprint-progress">
                  <div className="blueprint-progress-fill" style={{ width: "68%" }} />
                </div>
              </div>
              <div className="p-4 bg-accent/10 border-accent/30 rounded-sm">
                <div className="font-bold mb-2">💡 Optimization Opportunity</div>
                <div className="text-white/60 text-sm">
                  Switching to low-cost index funds could save ₹31,000 annually
                </div>
              </div>
            </div>
          </div>

          {/* Benchmark Comparison */}
          <div className="blueprint-card">
            <h2 className="text-2xl font-bold mb-6">Benchmark Comparison</h2>
            <div className="space-y-3">
              {[
                { benchmark: "Your Portfolio XIRR", value: "12.3%", status: "good" },
                { benchmark: "Nifty 50 XIRR", value: "11.8%", status: "neutral" },
                { benchmark: "Sensex XIRR", value: "11.2%", status: "neutral" },
                { benchmark: "Balanced Fund Avg", value: "10.5%", status: "good" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-sm border border-white/10">
                  <span className="font-semibold">{item.benchmark}</span>
                  <span className={item.status === "good" ? "text-green-400 font-bold" : "text-white/60 font-bold"}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rebalancing Plan */}
          <div className="blueprint-card bg-accent/10 border-accent/30">
            <h2 className="text-2xl font-bold mb-6">AI-Generated Rebalancing Plan</h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-sm border border-white/10">
                <div className="font-bold mb-2">Current vs Recommended</div>
                <div className="text-white/60 text-sm">
                  The portfolio demonstrates a {Math.abs(rebalanceData.equity_deviation * 100).toFixed(0)}% deviation from the model target.
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-sm border border-white/10">
                <div className="font-bold mb-2">Action Items</div>
                <ul className="text-white/60 text-sm space-y-2">
                  {rebalanceData.rebalance_actions.map((action: any, i: number) => (
                    <li key={i}>• {action.action} {action.asset_class} by ₹{Math.abs(action.amount).toLocaleString()}</li>
                  ))}
                  {overlapData.overlap_count > 0 && (
                    <li className="text-yellow-400 mt-2">⚠️ Review top overlapping stocks: {overlapData.top_overlapping_stocks.slice(0, 3).map((s: any) => s.stock).join(", ")}</li>
                  )}
                </ul>
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

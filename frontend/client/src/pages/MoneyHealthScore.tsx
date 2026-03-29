import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function MoneyHealthScore() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [apiResult, setApiResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const dimensions = [
    {
      title: "Emergency Preparedness",
      description: "Do you have 3-6 months of expenses saved?",
      questions: [
        { id: "emergency_1", text: "How many months of expenses do you have saved?" },
        { id: "emergency_2", text: "Is your emergency fund in liquid assets?" },
      ],
    },
    {
      title: "Insurance Coverage",
      description: "Are you adequately protected?",
      questions: [
        { id: "insurance_1", text: "Do you have health insurance?" },
        { id: "insurance_2", text: "Do you have life insurance?" },
      ],
    },
    {
      title: "Investment Diversification",
      description: "Is your portfolio well-balanced?",
      questions: [
        { id: "diversification_1", text: "How many asset classes do you invest in?" },
        { id: "diversification_2", text: "Do you have international exposure?" },
      ],
    },
    {
      title: "Debt Health",
      description: "How's your debt situation?",
      questions: [
        { id: "debt_1", text: "What's your debt-to-income ratio?" },
        { id: "debt_2", text: "Are you paying off high-interest debt?" },
      ],
    },
    {
      title: "Tax Efficiency",
      description: "Are you optimizing your taxes?",
      questions: [
        { id: "tax_1", text: "Do you use tax-saving investments like NPS?" },
        { id: "tax_2", text: "Are you in the optimal tax regime?" },
      ],
    },
    {
      title: "Retirement Readiness",
      description: "Are you on track for retirement?",
      questions: [
        { id: "retirement_1", text: "Have you calculated your retirement corpus?" },
        { id: "retirement_2", text: "Are you investing in retirement accounts?" },
      ],
    },
  ];

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers({ ...answers, [questionId]: score });
  };

  const handleNext = async () => {
    if (currentStep < dimensions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsLoading(true);
      try {
        const payload = {
          monthly_income: 100000,
          monthly_expenses: 50000,
          emergency_fund: 50000 * (answers['emergency_1'] || 0) * 2, 
          has_health_insurance: (answers['insurance_1'] || 0) > 2,
          health_cover_amount: 500000 * (answers['insurance_1'] || 0),
          has_term_insurance: (answers['insurance_2'] || 0) > 2,
          term_cover_amount: 10000000 * ((answers['insurance_2'] || 0) / 5),
          total_investments: 1000000 * ((answers['diversification_1'] || 0) / 5),
          num_asset_classes: answers['diversification_1'] || 1,
          total_debt: 2000000 * (5 - (answers['debt_1'] || 5)) / 5, 
          monthly_emi: 40000 * (5 - (answers['debt_1'] || 5)) / 5,
          tax_saving_investments: 150000 * ((answers['tax_1'] || 0) / 5),
          retirement_corpus: 2000000 * ((answers['retirement_1'] || 0) / 5),
          age: 30
        };

        const res = await fetch("http://localhost:8000/api/health-score/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        setApiResult(data);
        setShowResults(true);
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-green-400 to-green-600";
    if (score >= 60) return "from-yellow-400 to-yellow-600";
    if (score >= 40) return "from-orange-400 to-orange-600";
    return "from-red-400 to-red-600";
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  if (showResults && apiResult) {
    const totalScore = apiResult.overall_score || 0;
    
    // Map backend dimension names to frontend ones
    const dimensionKeyMap: Record<string, string> = {
      "Emergency Preparedness": "emergency_preparedness",
      "Insurance Coverage": "insurance_coverage",
      "Investment Diversification": "investment_diversification",
      "Debt Health": "debt_health",
      "Tax Efficiency": "tax_efficiency",
      "Retirement Readiness": "retirement_readiness"
    };

    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-black mb-2">Your MoneyHealthScore</h1>
            <p className="text-white/60">Comprehensive financial wellness assessment</p>
          </div>

          {/* Score Display */}
          <div className={`blueprint-card bg-gradient-to-br ${getScoreColor(totalScore)} relative overflow-hidden`}>
            <div className="absolute inset-0 blueprint-grid opacity-20" />
            <div className="relative z-10 text-center py-12">
              <div className="text-6xl font-black mb-2">{totalScore}</div>
              <div className="text-2xl font-bold mb-4">{apiResult.verdict || getScoreStatus(totalScore)}</div>
              <p className="text-white/80">Grade: {apiResult.grade}</p>
            </div>
          </div>

          {/* Dimension Breakdown */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Dimension Breakdown</h2>
            {dimensions.map((dimension, i) => {
              const backendKey = dimensionKeyMap[dimension.title];
              const dimensionScore = apiResult.dimension_scores[backendKey] || 0;
              const dimensionDetail = apiResult.dimension_details[backendKey];
              
              return (
                <div key={i} className="blueprint-card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{dimension.title}</h3>
                      <p className="text-white/60 text-sm">{dimensionDetail?.status || dimension.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-accent">{Math.round(dimensionScore)}</div>
                      <div className="text-xs text-white/50">/100</div>
                    </div>
                  </div>
                  <div className="blueprint-progress">
                    <div className="blueprint-progress-fill" style={{ width: `${dimensionScore}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommendations */}
          <div className="blueprint-card bg-accent/10 border-accent/30">
            <h2 className="text-2xl font-bold mb-4">Recommended Next Steps</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span>Complete your FIREPathPlanner to build a detailed financial roadmap</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span>Use TaxWizard to optimize your tax situation</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span>Upload your portfolio for detailed analysis</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => {
                setShowResults(false);
                setCurrentStep(0);
                setAnswers({});
              }}
              className="blueprint-btn-secondary flex-1"
            >
              Retake Assessment
            </Button>
            <Button className="blueprint-btn-primary flex-1">
              View Detailed Report <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const dimension = dimensions[currentStep];
  const progress = ((currentStep + 1) / dimensions.length) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-black mb-2">MoneyHealthScore Assessment</h1>
          <p className="text-white/60">Step {currentStep + 1} of {dimensions.length}: {dimension.title}</p>
        </div>

        {/* Progress Bar */}
        <div className="blueprint-progress h-3">
          <div className="blueprint-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Current Dimension */}
        <div className="blueprint-card">
          <h2 className="text-3xl font-bold mb-2">{dimension.title}</h2>
          <p className="text-white/60 mb-8">{dimension.description}</p>

          <div className="space-y-6">
            {dimension.questions.map((question) => (
              <div key={question.id} className="space-y-3">
                <label className="block text-lg font-semibold">{question.text}</label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleAnswer(question.id, score)}
                      className={`py-3 rounded-sm font-bold transition-all ${
                        answers[question.id] === score
                          ? "bg-accent text-accent-foreground scale-105"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-white/50">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="blueprint-btn-secondary flex-1"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="blueprint-btn-primary flex-1"
          >
            {isLoading ? "Running Engine..." : currentStep === dimensions.length - 1 ? "See Results" : "Next"} <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

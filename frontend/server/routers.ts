import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getUserFinancialProfile,
  upsertFinancialProfile,
  getLatestHealthScore,
  createHealthScoreAssessment,
  getLatestFirePlan,
  createFirePlan,
  getLatestTaxAnalysis,
  createTaxAnalysis,
  getUserDocuments,
  createDocument,
  getLatestPortfolioAnalysis,
  createPortfolioAnalysis,
  getCouplesPlan,
  createCouplesPlan,
  createLifeEventAdvice,
  createOwnerNotification,
  getUnsentNotifications,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Financial Profile Management
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getUserFinancialProfile(ctx.user.id);
    }),
    update: protectedProcedure
      .input(z.object({
        age: z.number().optional(),
        income: z.string().optional(),
        monthlyExpenses: z.string().optional(),
        existingInvestments: z.string().optional(),
        retirementAge: z.number().optional(),
        riskProfile: z.string().optional(),
        taxBracket: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await upsertFinancialProfile(ctx.user.id, {
          age: input.age,
          income: input.income ? (parseFloat(input.income) as any) : undefined,
          monthlyExpenses: input.monthlyExpenses ? (parseFloat(input.monthlyExpenses) as any) : undefined,
          existingInvestments: input.existingInvestments ? (parseFloat(input.existingInvestments) as any) : undefined,
          retirementAge: input.retirementAge,
          riskProfile: input.riskProfile,
          taxBracket: input.taxBracket,
        });
        return { success: true };
      }),
  }),

  // MoneyHealthScore
  healthScore: router({
    getLatest: protectedProcedure.query(async ({ ctx }) => {
      return await getLatestHealthScore(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        emergency: z.number(),
        insurance: z.number(),
        diversification: z.number(),
        debt: z.number(),
        tax: z.number(),
        retirement: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const scores = [input.emergency, input.insurance, input.diversification, input.debt, input.tax, input.retirement];
        const overall = Math.round(scores.reduce((a, b) => a + b) / scores.length);

        const assessment = await createHealthScoreAssessment({
          userId: ctx.user.id,
          emergencyPreparedness: input.emergency,
          insuranceCoverage: input.insurance,
          investmentDiversification: input.diversification,
          debtHealth: input.debt,
          taxEfficiency: input.tax,
          retirementReadiness: input.retirement,
          overallScore: overall,
          recommendations: { status: "pending" },
        });

        // Notify owner of completed assessment
        await createOwnerNotification({
          userId: ctx.user.id,
          notificationType: "milestone_completed",
          title: `${ctx.user.name} completed MoneyHealthScore assessment`,
          content: `Overall score: ${overall}/100`,
          relatedData: { score: overall },
        });

        return { success: true, score: overall };
      }),
  }),

  // FIREPathPlanner
  firePath: router({
    getLatest: protectedProcedure.query(async ({ ctx }) => {
      return await getLatestFirePlan(ctx.user.id);
    }),
    generate: protectedProcedure
      .input(z.object({
        currentAge: z.number(),
        retirementAge: z.number(),
        monthlyIncome: z.string(),
        monthlyExpenses: z.string(),
        currentInvestments: z.string(),
        goals: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const income = parseFloat(input.monthlyIncome);
        const expenses = parseFloat(input.monthlyExpenses);
        const yearsToRetirement = input.retirementAge - input.currentAge;
        const monthlyInvestable = income - expenses;
        const recommendedSIP = Math.round((expenses * 12 * 25) / (yearsToRetirement * 12));

        const plan = await createFirePlan({
          userId: ctx.user.id,
          currentAge: input.currentAge,
          retirementAge: input.retirementAge,
          monthlyIncome: income as any,
          monthlyExpenses: expenses as any,
          currentInvestments: parseFloat(input.currentInvestments) as any,
          goals: { raw: input.goals },
          recommendedSIP: recommendedSIP as any,
          assetAllocation: {
            equity: 60,
            debt: 25,
            gold: 10,
            cash: 5,
          },
          roadmap: { status: "generated" },
        });

        // Notify owner
        await createOwnerNotification({
          userId: ctx.user.id,
          notificationType: "milestone_completed",
          title: `${ctx.user.name} created FIRE roadmap`,
          content: `Retirement age: ${input.retirementAge}, Recommended SIP: ₹${recommendedSIP}`,
        });

        return { success: true, recommendedSIP: recommendedSIP.toString() };
      }),
  }),

  // TaxWizard
  taxWizard: router({
    getLatest: protectedProcedure.query(async ({ ctx }) => {
      return await getLatestTaxAnalysis(ctx.user.id);
    }),
    analyze: protectedProcedure
      .input(z.object({
        basicSalary: z.string(),
        hra: z.string(),
        dearness: z.string(),
        bonus: z.string(),
        otherAllowances: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const basic = parseFloat(input.basicSalary);
        const hra = parseFloat(input.hra);
        const dearness = parseFloat(input.dearness);
        const bonus = parseFloat(input.bonus);
        const other = parseFloat(input.otherAllowances);
        const total = basic + hra + dearness + bonus + other;

        const oldRegimeTax = Math.max(0, (total - 250000) * 0.2);
        const newRegimeTax = Math.max(0, (total - 300000) * 0.2);
        const savings = Math.abs(oldRegimeTax - newRegimeTax);

        const analysis = await createTaxAnalysis({
          userId: ctx.user.id,
          basicSalary: basic as any,
          hra: hra as any,
          dearnessAllowance: dearness as any,
          bonus: bonus as any,
          otherAllowances: other as any,
          totalIncome: total as any,
          oldRegimeTax: oldRegimeTax as any,
          newRegimeTax: newRegimeTax as any,
          potentialSavings: savings as any,
          missingDeductions: { status: "pending" },
          recommendations: { status: "pending" },
        });

        // Notify owner
        await createOwnerNotification({
          userId: ctx.user.id,
          notificationType: "advice_requested",
          title: `${ctx.user.name} used TaxWizard`,
          content: `Potential tax savings: ₹${Math.round(savings)}`,
        });

        return { success: true, savings: Math.round(savings).toString() };
      }),
  }),

  // Life Event Advisor
  lifeEvent: router({
    getAdvice: protectedProcedure
      .input(z.object({
        eventType: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        // Return pre-configured advice for each event type
        const adviceMap: Record<string, any> = {
          bonus: { title: "Bonus Allocation Strategy", steps: 4 },
          inheritance: { title: "Inheritance Management", steps: 4 },
          marriage: { title: "Joint Financial Planning", steps: 4 },
          baby: { title: "Child's Financial Future", steps: 4 },
          promotion: { title: "Income Growth Strategy", steps: 4 },
          "job-change": { title: "Career Transition Planning", steps: 4 },
        };
        return adviceMap[input.eventType] || { title: "Financial Guidance", steps: 4 };
      }),
    recordEvent: protectedProcedure
      .input(z.object({
        eventType: z.string(),
        details: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createLifeEventAdvice({
          userId: ctx.user.id,
          eventType: input.eventType,
          eventDetails: { details: input.details },
          actionPlan: { status: "pending" },
          taxTips: "Consult with tax advisor",
          recommendations: { status: "pending" },
        });

        // Notify owner
        await createOwnerNotification({
          userId: ctx.user.id,
          notificationType: "advice_requested",
          title: `${ctx.user.name} requested ${input.eventType} advice`,
          content: input.details,
        });

        return { success: true };
      }),
  }),

  // Couples Money Planner
  couplesPlan: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getCouplesPlan(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        partner1Name: z.string(),
        partner1Income: z.string(),
        partner1HRA: z.string(),
        partner1Investments: z.string(),
        partner2Name: z.string(),
        partner2Income: z.string(),
        partner2HRA: z.string(),
        partner2Investments: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const p1Income = parseFloat(input.partner1Income);
        const p2Income = parseFloat(input.partner2Income);
        const combined = (parseFloat(input.partner1Investments) + parseFloat(input.partner2Investments));

        const plan = await createCouplesPlan({
          userId: ctx.user.id,
          partner1Name: input.partner1Name,
          partner1Income: p1Income as any,
          partner1HRA: parseFloat(input.partner1HRA) as any,
          partner1Investments: parseFloat(input.partner1Investments) as any,
          partner2Name: input.partner2Name,
          partner2Income: p2Income as any,
          partner2HRA: parseFloat(input.partner2HRA) as any,
          partner2Investments: parseFloat(input.partner2Investments) as any,
          combinedNetWorth: combined as any,
          taxOptimization: { status: "pending" },
          insuranceRecommendations: { status: "pending" },
          sipStrategy: { status: "pending" },
        });

        // Notify owner
        await createOwnerNotification({
          userId: ctx.user.id,
          notificationType: "milestone_completed",
          title: `${ctx.user.name} created couples financial plan`,
          content: `Combined income: ₹${Math.round(p1Income + p2Income)}`,
        });

        return { success: true, combinedNetWorth: combined.toString() };
      }),
  }),

  // MF Portfolio X-Ray
  portfolio: router({
    getLatest: protectedProcedure.query(async ({ ctx }) => {
      return await getLatestPortfolioAnalysis(ctx.user.id);
    }),
    analyze: protectedProcedure
      .input(z.object({
        totalValue: z.string(),
        holdings: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const totalValue = parseFloat(input.totalValue);

        const analysis = await createPortfolioAnalysis({
          userId: ctx.user.id,
          totalPortfolioValue: totalValue as any,
          trueXIRR: 12.3 as any,
          averageExpenseRatio: 0.68 as any,
          holdings: { raw: input.holdings },
          overlapAnalysis: { status: "pending" },
          benchmarkComparison: { status: "pending" },
          rebalancingPlan: { status: "pending" },
          performanceMetrics: { status: "pending" },
        });

        // Notify owner
        await createOwnerNotification({
          userId: ctx.user.id,
          notificationType: "portfolio_review",
          title: `${ctx.user.name} submitted portfolio for analysis`,
          content: `Portfolio value: ₹${Math.round(totalValue)}`,
        });

        return { success: true, xirr: "12.3" };
      }),
  }),

  // Document Management
  documents: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserDocuments(ctx.user.id);
    }),
    upload: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        documentType: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const buffer = Buffer.from(input.fileData, "base64");
          const fileKey = `${ctx.user.id}/documents/${input.documentType}/${Date.now()}-${input.fileName}`;

          const { url } = await storagePut(fileKey, buffer, input.mimeType);

          const doc = await createDocument({
            userId: ctx.user.id,
            documentType: input.documentType,
            fileName: input.fileName,
            fileKey: fileKey,
            fileUrl: url,
            mimeType: input.mimeType,
            fileSize: buffer.length,
          });

          return { success: true, url };
        } catch (error) {
          console.error("Document upload failed:", error);
          return { success: false, error: "Upload failed" };
        }
      }),
  }),

  // Owner Notifications
  notifications: router({
    getUnsent: publicProcedure.query(async () => {
      return await getUnsentNotifications();
    }),
  }),
});

export type AppRouter = typeof appRouter;

import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";

// Mock database functions with proper return values
vi.mock("./db", () => ({
  getUserFinancialProfile: vi.fn().mockResolvedValue({ id: 1, userId: 1, age: 30 }),
  upsertFinancialProfile: vi.fn().mockResolvedValue(undefined),
  getLatestHealthScore: vi.fn().mockResolvedValue(null),
  createHealthScoreAssessment: vi.fn().mockResolvedValue({ id: 1 }),
  getLatestFirePlan: vi.fn().mockResolvedValue(null),
  createFirePlan: vi.fn().mockResolvedValue({ id: 1 }),
  getLatestTaxAnalysis: vi.fn().mockResolvedValue(null),
  createTaxAnalysis: vi.fn().mockResolvedValue({ id: 1 }),
  getUserDocuments: vi.fn().mockResolvedValue([]),
  createDocument: vi.fn().mockResolvedValue({ id: 1 }),
  getLatestPortfolioAnalysis: vi.fn().mockResolvedValue(null),
  createPortfolioAnalysis: vi.fn().mockResolvedValue({ id: 1 }),
  getCouplesPlan: vi.fn().mockResolvedValue(null),
  createCouplesPlan: vi.fn().mockResolvedValue({ id: 1 }),
  createLifeEventAdvice: vi.fn().mockResolvedValue({ id: 1 }),
  createOwnerNotification: vi.fn().mockResolvedValue({ id: 1 }),
  getUnsentNotifications: vi.fn().mockResolvedValue([]),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://example.com/file.pdf" }),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

// Mock notifications
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(),
}));

type AuthenticatedUser = {
  id: number;
  openId: string;
  email: string;
  name: string;
  loginMethod: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
};

function createAuthContext(user: AuthenticatedUser) {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    },
    res: {},
  };
}

describe("Financial Planning API", () => {
  const mockUser: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  describe("Profile Management", () => {
    it("should get user financial profile", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.profile.get();
      expect(result).toEqual({ id: 1, userId: 1, age: 30 });
    });

    it("should update financial profile with valid data", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.profile.update({
        age: 30,
        income: "1000000",
        monthlyExpenses: "50000",
        existingInvestments: "500000",
        retirementAge: 60,
        riskProfile: "medium",
        taxBracket: "30%",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("MoneyHealthScore", () => {
    it("should create health score assessment with valid scores", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.healthScore.create({
        emergency: 75,
        insurance: 60,
        diversification: 70,
        debt: 85,
        tax: 50,
        retirement: 65,
      });

      expect(result.success).toBe(true);
      expect(result.score).toBe(68);
    });

    it("should calculate correct overall score", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.healthScore.create({
        emergency: 100,
        insurance: 100,
        diversification: 100,
        debt: 100,
        tax: 100,
        retirement: 100,
      });

      expect(result.score).toBe(100);
    });

    it("should handle minimum scores", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.healthScore.create({
        emergency: 0,
        insurance: 0,
        diversification: 0,
        debt: 0,
        tax: 0,
        retirement: 0,
      });

      expect(result.score).toBe(0);
    });

    it("should calculate average score correctly with high values", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.healthScore.create({
        emergency: 90,
        insurance: 85,
        diversification: 80,
        debt: 75,
        tax: 70,
        retirement: 65,
      });

      expect(result.score).toBe(78);
    });
  });

  describe("FIREPathPlanner", () => {
    it("should generate FIRE plan with valid inputs", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.firePath.generate({
        currentAge: 30,
        retirementAge: 60,
        monthlyIncome: "100000",
        monthlyExpenses: "50000",
        currentInvestments: "500000",
        goals: "Retire at 60, Travel, Children education",
      });

      expect(result.success).toBe(true);
      expect(result.recommendedSIP).toBeDefined();
    });

    it("should calculate correct recommended SIP", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.firePath.generate({
        currentAge: 30,
        retirementAge: 60,
        monthlyIncome: "100000",
        monthlyExpenses: "50000",
        currentInvestments: "1000000",
        goals: "Retire comfortably",
      });

      expect(parseInt(result.recommendedSIP)).toBeGreaterThan(0);
    });

    it("should calculate negative years to retirement gracefully", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.firePath.generate({
        currentAge: 60,
        retirementAge: 30,
        monthlyIncome: "100000",
        monthlyExpenses: "50000",
        currentInvestments: "500000",
        goals: "Retire",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("TaxWizard", () => {
    it("should analyze tax with valid salary components", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.taxWizard.analyze({
        basicSalary: "600000",
        hra: "200000",
        dearness: "100000",
        bonus: "100000",
        otherAllowances: "50000",
      });

      expect(result.success).toBe(true);
      expect(result.savings).toBeDefined();
    });

    it("should calculate tax savings correctly", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.taxWizard.analyze({
        basicSalary: "1000000",
        hra: "0",
        dearness: "0",
        bonus: "0",
        otherAllowances: "0",
      });

      expect(parseInt(result.savings)).toBeGreaterThan(0);
    });

    it("should handle zero income tax", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.taxWizard.analyze({
        basicSalary: "200000",
        hra: "0",
        dearness: "0",
        bonus: "0",
        otherAllowances: "0",
      });

      expect(result.success).toBe(true);
    });

    it("should handle negative income values", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.taxWizard.analyze({
        basicSalary: "-100000",
        hra: "0",
        dearness: "0",
        bonus: "0",
        otherAllowances: "0",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Life Event Advisor", () => {
    it("should provide advice for bonus event", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.lifeEvent.getAdvice({
        eventType: "bonus",
      });

      expect(result.title).toBe("Bonus Allocation Strategy");
      expect(result.steps).toBe(4);
    });

    it("should provide advice for inheritance event", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.lifeEvent.getAdvice({
        eventType: "inheritance",
      });

      expect(result.title).toBe("Inheritance Management");
    });

    it("should record life event", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.lifeEvent.recordEvent({
        eventType: "marriage",
        details: "Getting married next year, need joint financial planning",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Couples Money Planner", () => {
    it("should create couples plan with valid data", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.couplesPlan.create({
        partner1Name: "Alice",
        partner1Income: "1000000",
        partner1HRA: "300000",
        partner1Investments: "500000",
        partner2Name: "Bob",
        partner2Income: "800000",
        partner2HRA: "200000",
        partner2Investments: "400000",
      });

      expect(result.success).toBe(true);
      expect(result.combinedNetWorth).toBe("900000");
    });

    it("should calculate combined net worth correctly", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.couplesPlan.create({
        partner1Name: "Partner 1",
        partner1Income: "1000000",
        partner1HRA: "0",
        partner1Investments: "1000000",
        partner2Name: "Partner 2",
        partner2Income: "1000000",
        partner2HRA: "0",
        partner2Investments: "1500000",
      });

      expect(result.combinedNetWorth).toBe("2500000");
    });
  });

  describe("MF Portfolio X-Ray", () => {
    it("should analyze portfolio with valid data", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.portfolio.analyze({
        totalValue: "1500000",
        holdings: "Axis Bluechip, ICICI Prudential, SBI Liquid",
      });

      expect(result.success).toBe(true);
      expect(result.xirr).toBe("12.3");
    });
  });

  describe("Document Management", () => {
    it("should list user documents", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.list();
      expect(result).toEqual([]);
    });

    it("should upload document with valid data", async () => {
      const ctx = createAuthContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.upload({
        fileName: "form16.pdf",
        fileData: Buffer.from("test data").toString("base64"),
        documentType: "form16",
        mimeType: "application/pdf",
      });

      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();
    });
  });
});

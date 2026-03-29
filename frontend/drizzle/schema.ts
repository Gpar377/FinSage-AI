import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with financial planning data models.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User financial profile - stores personal financial information
 */
export const financialProfiles = mysqlTable("financial_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  age: int("age"),
  income: decimal("income", { precision: 15, scale: 2 }),
  monthlyExpenses: decimal("monthlyExpenses", { precision: 15, scale: 2 }),
  existingInvestments: decimal("existingInvestments", { precision: 15, scale: 2 }),
  retirementAge: int("retirementAge"),
  riskProfile: varchar("riskProfile", { length: 20 }), // low, medium, high
  taxBracket: varchar("taxBracket", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialProfile = typeof financialProfiles.$inferSelect;
export type InsertFinancialProfile = typeof financialProfiles.$inferInsert;

/**
 * MoneyHealthScore assessments
 */
export const healthScoreAssessments = mysqlTable("health_score_assessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  emergencyPreparedness: int("emergencyPreparedness"), // 0-100
  insuranceCoverage: int("insuranceCoverage"), // 0-100
  investmentDiversification: int("investmentDiversification"), // 0-100
  debtHealth: int("debtHealth"), // 0-100
  taxEfficiency: int("taxEfficiency"), // 0-100
  retirementReadiness: int("retirementReadiness"), // 0-100
  overallScore: int("overallScore"), // 0-100
  recommendations: json("recommendations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HealthScoreAssessment = typeof healthScoreAssessments.$inferSelect;
export type InsertHealthScoreAssessment = typeof healthScoreAssessments.$inferInsert;

/**
 * FIRE Path Plans
 */
export const firePathPlans = mysqlTable("fire_path_plans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  currentAge: int("currentAge"),
  retirementAge: int("retirementAge"),
  monthlyIncome: decimal("monthlyIncome", { precision: 15, scale: 2 }),
  monthlyExpenses: decimal("monthlyExpenses", { precision: 15, scale: 2 }),
  currentInvestments: decimal("currentInvestments", { precision: 15, scale: 2 }),
  goals: json("goals"), // Array of financial goals
  recommendedSIP: decimal("recommendedSIP", { precision: 15, scale: 2 }),
  assetAllocation: json("assetAllocation"), // Recommended allocation percentages
  roadmap: json("roadmap"), // Month-by-month breakdown
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FirePathPlan = typeof firePathPlans.$inferSelect;
export type InsertFirePathPlan = typeof firePathPlans.$inferInsert;

/**
 * Tax analysis and optimization
 */
export const taxAnalyses = mysqlTable("tax_analyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  basicSalary: decimal("basicSalary", { precision: 15, scale: 2 }),
  hra: decimal("hra", { precision: 15, scale: 2 }),
  dearnessAllowance: decimal("dearnessAllowance", { precision: 15, scale: 2 }),
  bonus: decimal("bonus", { precision: 15, scale: 2 }),
  otherAllowances: decimal("otherAllowances", { precision: 15, scale: 2 }),
  totalIncome: decimal("totalIncome", { precision: 15, scale: 2 }),
  oldRegimeTax: decimal("oldRegimeTax", { precision: 15, scale: 2 }),
  newRegimeTax: decimal("newRegimeTax", { precision: 15, scale: 2 }),
  potentialSavings: decimal("potentialSavings", { precision: 15, scale: 2 }),
  missingDeductions: json("missingDeductions"),
  recommendations: json("recommendations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TaxAnalysis = typeof taxAnalyses.$inferSelect;
export type InsertTaxAnalysis = typeof taxAnalyses.$inferInsert;

/**
 * Life event financial advice
 */
export const lifeEventAdvice = mysqlTable("life_event_advice", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventType: varchar("eventType", { length: 50 }), // bonus, inheritance, marriage, baby, promotion, job-change
  eventDetails: json("eventDetails"),
  actionPlan: json("actionPlan"),
  taxTips: text("taxTips"),
  recommendations: json("recommendations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LifeEventAdvice = typeof lifeEventAdvice.$inferSelect;
export type InsertLifeEventAdvice = typeof lifeEventAdvice.$inferInsert;

/**
 * Couples money planner
 */
export const couplesPlan = mysqlTable("couples_plan", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  partnerId: int("partnerId"),
  partner1Name: varchar("partner1Name", { length: 255 }),
  partner1Income: decimal("partner1Income", { precision: 15, scale: 2 }),
  partner1HRA: decimal("partner1HRA", { precision: 15, scale: 2 }),
  partner1Investments: decimal("partner1Investments", { precision: 15, scale: 2 }),
  partner2Name: varchar("partner2Name", { length: 255 }),
  partner2Income: decimal("partner2Income", { precision: 15, scale: 2 }),
  partner2HRA: decimal("partner2HRA", { precision: 15, scale: 2 }),
  partner2Investments: decimal("partner2Investments", { precision: 15, scale: 2 }),
  combinedNetWorth: decimal("combinedNetWorth", { precision: 15, scale: 2 }),
  taxOptimization: json("taxOptimization"),
  insuranceRecommendations: json("insuranceRecommendations"),
  sipStrategy: json("sipStrategy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CouplesPlan = typeof couplesPlan.$inferSelect;
export type InsertCouplesPlan = typeof couplesPlan.$inferInsert;

/**
 * Mutual fund portfolio analysis
 */
export const portfolioAnalyses = mysqlTable("portfolio_analyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  totalPortfolioValue: decimal("totalPortfolioValue", { precision: 15, scale: 2 }),
  trueXIRR: decimal("trueXIRR", { precision: 5, scale: 2 }),
  averageExpenseRatio: decimal("averageExpenseRatio", { precision: 5, scale: 2 }),
  holdings: json("holdings"), // Array of fund holdings
  overlapAnalysis: json("overlapAnalysis"),
  benchmarkComparison: json("benchmarkComparison"),
  rebalancingPlan: json("rebalancingPlan"),
  performanceMetrics: json("performanceMetrics"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PortfolioAnalysis = typeof portfolioAnalyses.$inferSelect;
export type InsertPortfolioAnalysis = typeof portfolioAnalyses.$inferInsert;

/**
 * Document storage metadata
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  documentType: varchar("documentType", { length: 50 }), // form16, cams, kfintech, investment_proof
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(), // S3 key
  fileUrl: text("fileUrl"), // S3 URL
  mimeType: varchar("mimeType", { length: 50 }),
  fileSize: int("fileSize"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Owner notifications for critical milestones
 */
export const ownerNotifications = mysqlTable("owner_notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  notificationType: varchar("notificationType", { length: 50 }), // milestone_completed, portfolio_review, advice_requested
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  relatedData: json("relatedData"),
  sent: boolean("sent").default(false),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OwnerNotification = typeof ownerNotifications.$inferSelect;
export type InsertOwnerNotification = typeof ownerNotifications.$inferInsert;

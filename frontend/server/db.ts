import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  financialProfiles,
  InsertFinancialProfile,
  healthScoreAssessments,
  InsertHealthScoreAssessment,
  firePathPlans,
  InsertFirePathPlan,
  taxAnalyses,
  InsertTaxAnalysis,
  documents,
  InsertDocument,
  portfolioAnalyses,
  InsertPortfolioAnalysis,
  couplesPlan,
  InsertCouplesPlan,
  lifeEventAdvice,
  InsertLifeEventAdvice,
  ownerNotifications,
  InsertOwnerNotification,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Financial Profile Queries
export async function getUserFinancialProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(financialProfiles).where(eq(financialProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertFinancialProfile(userId: number, data: Omit<InsertFinancialProfile, 'userId'>) {
  const db = await getDb();
  if (!db) return;
  await db.insert(financialProfiles).values({ userId, ...data }).onDuplicateKeyUpdate({
    set: data,
  });
}

// Health Score Queries
export async function getLatestHealthScore(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(healthScoreAssessments)
    .where(eq(healthScoreAssessments.userId, userId))
    .orderBy(desc(healthScoreAssessments.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createHealthScoreAssessment(data: InsertHealthScoreAssessment) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(healthScoreAssessments).values(data);
  return result;
}

// FIRE Path Plan Queries
export async function getLatestFirePlan(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(firePathPlans).where(eq(firePathPlans.userId, userId)).orderBy(desc(firePathPlans.createdAt)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createFirePlan(data: InsertFirePathPlan) {
  const db = await getDb();
  if (!db) return;
  return await db.insert(firePathPlans).values(data);
}

// Tax Analysis Queries
export async function getLatestTaxAnalysis(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(taxAnalyses).where(eq(taxAnalyses.userId, userId)).orderBy(desc(taxAnalyses.createdAt)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTaxAnalysis(data: InsertTaxAnalysis) {
  const db = await getDb();
  if (!db) return;
  return await db.insert(taxAnalyses).values(data);
}

// Document Queries
export async function getUserDocuments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.uploadedAt));
}

export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) return;
  return await db.insert(documents).values(data);
}

// Portfolio Analysis Queries
export async function getLatestPortfolioAnalysis(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(portfolioAnalyses).where(eq(portfolioAnalyses.userId, userId)).orderBy(desc(portfolioAnalyses.createdAt)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPortfolioAnalysis(data: InsertPortfolioAnalysis) {
  const db = await getDb();
  if (!db) return;
  return await db.insert(portfolioAnalyses).values(data);
}

// Couples Plan Queries
export async function getCouplesPlan(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(couplesPlan).where(eq(couplesPlan.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCouplesPlan(data: InsertCouplesPlan) {
  const db = await getDb();
  if (!db) return;
  return await db.insert(couplesPlan).values(data);
}

// Life Event Advice Queries
export async function createLifeEventAdvice(data: InsertLifeEventAdvice) {
  const db = await getDb();
  if (!db) return;
  return await db.insert(lifeEventAdvice).values(data);
}

// Owner Notification Queries
export async function createOwnerNotification(data: InsertOwnerNotification) {
  const db = await getDb();
  if (!db) return;
  return await db.insert(ownerNotifications).values(data);
}

export async function getUnsentNotifications() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(ownerNotifications).where(eq(ownerNotifications.sent, false));
}

CREATE TABLE `couples_plan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`partnerId` int,
	`partner1Name` varchar(255),
	`partner1Income` decimal(15,2),
	`partner1HRA` decimal(15,2),
	`partner1Investments` decimal(15,2),
	`partner2Name` varchar(255),
	`partner2Income` decimal(15,2),
	`partner2HRA` decimal(15,2),
	`partner2Investments` decimal(15,2),
	`combinedNetWorth` decimal(15,2),
	`taxOptimization` json,
	`insuranceRecommendations` json,
	`sipStrategy` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `couples_plan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`documentType` varchar(50),
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileUrl` text,
	`mimeType` varchar(50),
	`fileSize` int,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`age` int,
	`income` decimal(15,2),
	`monthlyExpenses` decimal(15,2),
	`existingInvestments` decimal(15,2),
	`retirementAge` int,
	`riskProfile` varchar(20),
	`taxBracket` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fire_path_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentAge` int,
	`retirementAge` int,
	`monthlyIncome` decimal(15,2),
	`monthlyExpenses` decimal(15,2),
	`currentInvestments` decimal(15,2),
	`goals` json,
	`recommendedSIP` decimal(15,2),
	`assetAllocation` json,
	`roadmap` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fire_path_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_score_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emergencyPreparedness` int,
	`insuranceCoverage` int,
	`investmentDiversification` int,
	`debtHealth` int,
	`taxEfficiency` int,
	`retirementReadiness` int,
	`overallScore` int,
	`recommendations` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `health_score_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `life_event_advice` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventType` varchar(50),
	`eventDetails` json,
	`actionPlan` json,
	`taxTips` text,
	`recommendations` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `life_event_advice_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `owner_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notificationType` varchar(50),
	`title` varchar(255) NOT NULL,
	`content` text,
	`relatedData` json,
	`sent` boolean DEFAULT false,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `owner_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolio_analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalPortfolioValue` decimal(15,2),
	`trueXIRR` decimal(5,2),
	`averageExpenseRatio` decimal(5,2),
	`holdings` json,
	`overlapAnalysis` json,
	`benchmarkComparison` json,
	`rebalancingPlan` json,
	`performanceMetrics` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolio_analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`basicSalary` decimal(15,2),
	`hra` decimal(15,2),
	`dearnessAllowance` decimal(15,2),
	`bonus` decimal(15,2),
	`otherAllowances` decimal(15,2),
	`totalIncome` decimal(15,2),
	`oldRegimeTax` decimal(15,2),
	`newRegimeTax` decimal(15,2),
	`potentialSavings` decimal(15,2),
	`missingDeductions` json,
	`recommendations` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tax_analyses_id` PRIMARY KEY(`id`)
);

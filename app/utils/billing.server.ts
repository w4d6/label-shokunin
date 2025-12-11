import prisma from "../db.server";
import { BILLING_PLANS, PLAN_DETAILS, type PlanType } from "./plans";

// Get or create shop usage record
export async function getShopUsage(shop: string) {
  let usage = await prisma.shopUsage.findUnique({
    where: { shop },
  });

  if (!usage) {
    usage = await prisma.shopUsage.create({
      data: {
        shop,
        labelsThisMonth: 0,
        monthStartDate: new Date(),
      },
    });
  }

  // Reset monthly counter if needed
  const now = new Date();
  const monthStart = new Date(usage.monthStartDate);
  const daysSinceStart = Math.floor(
    (now.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceStart >= 30) {
    usage = await prisma.shopUsage.update({
      where: { shop },
      data: {
        labelsThisMonth: 0,
        monthStartDate: now,
      },
    });
  }

  return usage;
}

// Update shop's current plan
export async function updateShopPlan(shop: string, plan: PlanType) {
  return prisma.shopUsage.upsert({
    where: { shop },
    update: { currentPlan: plan },
    create: {
      shop,
      currentPlan: plan,
      labelsThisMonth: 0,
      monthStartDate: new Date(),
    },
  });
}

// Increment label count and check if allowed
export async function incrementLabelCount(
  shop: string,
  count: number
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const usage = await getShopUsage(shop);

  if (!usage.currentPlan) {
    return { allowed: false, remaining: 0, limit: 0 };
  }

  const planDetails = PLAN_DETAILS[usage.currentPlan as PlanType];
  if (!planDetails) {
    return { allowed: false, remaining: 0, limit: 0 };
  }

  const limit = planDetails.labelLimit;

  // Unlimited plan
  if (limit === -1) {
    await prisma.shopUsage.update({
      where: { shop },
      data: { labelsThisMonth: usage.labelsThisMonth + count },
    });
    return { allowed: true, remaining: -1, limit: -1 };
  }

  const newCount = usage.labelsThisMonth + count;
  const remaining = Math.max(0, limit - usage.labelsThisMonth);

  if (newCount > limit) {
    return { allowed: false, remaining, limit };
  }

  await prisma.shopUsage.update({
    where: { shop },
    data: { labelsThisMonth: newCount },
  });

  return { allowed: true, remaining: limit - newCount, limit };
}

// Check remaining labels
export async function getRemainingLabels(
  shop: string
): Promise<{ remaining: number; limit: number; used: number }> {
  const usage = await getShopUsage(shop);

  if (!usage.currentPlan) {
    return { remaining: 0, limit: 0, used: 0 };
  }

  const planDetails = PLAN_DETAILS[usage.currentPlan as PlanType];
  if (!planDetails) {
    return { remaining: 0, limit: 0, used: 0 };
  }

  const limit = planDetails.labelLimit;

  if (limit === -1) {
    return { remaining: -1, limit: -1, used: usage.labelsThisMonth };
  }

  return {
    remaining: Math.max(0, limit - usage.labelsThisMonth),
    limit,
    used: usage.labelsThisMonth,
  };
}

// Check if shop has active subscription
export async function hasActiveSubscription(shop: string): Promise<boolean> {
  const usage = await getShopUsage(shop);
  return !!usage.currentPlan;
}

// Billing plans configuration (client-safe)
// This file can be imported in both client and server code

export const BILLING_PLANS = {
  // 梅プラン (Ume/Basic) - Entry level
  UME: "ume_plan",
  // 竹プラン (Take/Standard) - Most popular
  TAKE: "take_plan",
  // 松プラン (Matsu/Premium) - Professional
  MATSU: "matsu_plan",
} as const;

export type PlanType = (typeof BILLING_PLANS)[keyof typeof BILLING_PLANS];

export const PLAN_DETAILS = {
  [BILLING_PLANS.UME]: {
    name: "梅プラン",
    nameEn: "Ume Plan",
    amount: 980,
    currencyCode: "JPY",
    labelLimit: 100,
    description: "月100枚までのラベル印刷",
  },
  [BILLING_PLANS.TAKE]: {
    name: "竹プラン",
    nameEn: "Take Plan",
    amount: 1980,
    currencyCode: "JPY",
    labelLimit: 500,
    description: "月500枚までのラベル印刷（人気No.1）",
  },
  [BILLING_PLANS.MATSU]: {
    name: "松プラン",
    nameEn: "Matsu Plan",
    amount: 4980,
    currencyCode: "JPY",
    labelLimit: -1, // Unlimited
    description: "無制限のラベル印刷",
  },
} as const;

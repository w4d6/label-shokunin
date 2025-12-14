import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  Box,
  Divider,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { BILLING_PLANS, PLAN_DETAILS } from "../utils/plans";
import { getShopUsage, updateShopPlan, getRemainingLabels } from "../utils/billing.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const shop = session.shop;

  // Check current subscription status
  const { hasActivePayment, appSubscriptions } = await billing.check({
    plans: [BILLING_PLANS.UME, BILLING_PLANS.TAKE, BILLING_PLANS.MATSU],
    isTest: true, // Set to false for production
  });

  const usage = await getShopUsage(shop);
  const remaining = await getRemainingLabels(shop);

  // Find current active plan
  let currentPlan: string | null = null;
  if (hasActivePayment && appSubscriptions.length > 0) {
    currentPlan = appSubscriptions[0].name;
    // Sync plan to database
    if (currentPlan && currentPlan !== usage.currentPlan) {
      await updateShopPlan(shop, currentPlan as any);
    }
  }

  return json({
    currentPlan,
    hasActivePayment,
    usage: {
      used: remaining.used,
      limit: remaining.limit,
      remaining: remaining.remaining,
    },
    plans: PLAN_DETAILS,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { billing, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const selectedPlan = formData.get("plan") as string;

  if (!selectedPlan || !Object.values(BILLING_PLANS).includes(selectedPlan as any)) {
    return json({ error: "無効なプランです" }, { status: 400 });
  }

  // Request billing
  await billing.request({
    plan: selectedPlan as "ume_plan" | "take_plan" | "matsu_plan",
    isTest: true, // Set to false for production
    returnUrl: `https://${process.env.SHOPIFY_APP_URL?.replace("https://", "")}/app/billing`,
  });

  return null;
};

export default function BillingPage() {
  const { currentPlan, hasActivePayment, usage, plans } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  const handleSelectPlan = (planId: string) => {
    submit({ plan: planId }, { method: "post" });
  };

  return (
    <Page
      title="料金プラン"
      subtitle="ご利用プランを選択してください"
      backAction={{ content: "戻る", url: "/app" }}
    >
      <Layout>
        {hasActivePayment && currentPlan && (
          <Layout.Section>
            <Banner tone="success">
              <p>
                現在のプラン: <strong>{plans[currentPlan as keyof typeof plans]?.name || currentPlan}</strong>
                {usage.limit === -1 ? (
                  <span> - 無制限</span>
                ) : (
                  <span>
                    {" "}- 今月の使用量: {usage.used} / {usage.limit} 枚
                    （残り {usage.remaining} 枚）
                  </span>
                )}
              </p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <InlineStack gap="400" align="center" wrap={false}>
            {/* 梅プラン */}
            <Card>
              <Box padding="400" minWidth="280px">
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <Text variant="headingLg" as="h2">🌸 梅プラン</Text>
                    {currentPlan === BILLING_PLANS.UME && (
                      <Badge tone="success">利用中</Badge>
                    )}
                  </InlineStack>

                  <BlockStack gap="200">
                    <Text variant="heading2xl" as="p">
                      ¥980
                      <Text as="span" variant="bodyMd" tone="subdued">/月</Text>
                    </Text>
                    <Text variant="bodyMd" as="p" tone="subdued">
                      7日間の無料トライアル付き
                    </Text>
                  </BlockStack>

                  <Divider />

                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">✓ 月100枚までのラベル印刷</Text>
                    <Text variant="bodyMd" as="p">✓ 全テンプレート利用可</Text>
                    <Text variant="bodyMd" as="p">✓ JAN/EANコード対応</Text>
                    <Text variant="bodyMd" as="p">✓ メールサポート</Text>
                  </BlockStack>

                  <Button
                    variant={currentPlan === BILLING_PLANS.UME ? "secondary" : "primary"}
                    disabled={currentPlan === BILLING_PLANS.UME || isLoading}
                    onClick={() => handleSelectPlan(BILLING_PLANS.UME)}
                    fullWidth
                  >
                    {currentPlan === BILLING_PLANS.UME ? "利用中" : "このプランを選択"}
                  </Button>
                </BlockStack>
              </Box>
            </Card>

            {/* 竹プラン */}
            <Card>
              <Box padding="400" minWidth="280px" background="bg-surface-info-hover">
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <Text variant="headingLg" as="h2">🎋 竹プラン</Text>
                    <InlineStack gap="200">
                      {currentPlan === BILLING_PLANS.TAKE && (
                        <Badge tone="success">利用中</Badge>
                      )}
                      <Badge tone="info">人気No.1</Badge>
                    </InlineStack>
                  </InlineStack>

                  <BlockStack gap="200">
                    <Text variant="heading2xl" as="p">
                      ¥1,980
                      <Text as="span" variant="bodyMd" tone="subdued">/月</Text>
                    </Text>
                    <Text variant="bodyMd" as="p" tone="subdued">
                      7日間の無料トライアル付き
                    </Text>
                  </BlockStack>

                  <Divider />

                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">✓ 月500枚までのラベル印刷</Text>
                    <Text variant="bodyMd" as="p">✓ 全テンプレート利用可</Text>
                    <Text variant="bodyMd" as="p">✓ JAN/EANコード対応</Text>
                    <Text variant="bodyMd" as="p">✓ 優先メールサポート</Text>
                    <Text variant="bodyMd" as="p">✓ カスタムテンプレート</Text>
                  </BlockStack>

                  <Button
                    variant={currentPlan === BILLING_PLANS.TAKE ? "secondary" : "primary"}
                    disabled={currentPlan === BILLING_PLANS.TAKE || isLoading}
                    onClick={() => handleSelectPlan(BILLING_PLANS.TAKE)}
                    fullWidth
                  >
                    {currentPlan === BILLING_PLANS.TAKE ? "利用中" : "このプランを選択"}
                  </Button>
                </BlockStack>
              </Box>
            </Card>

            {/* 松プラン */}
            <Card>
              <Box padding="400" minWidth="280px">
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <Text variant="headingLg" as="h2">🌲 松プラン</Text>
                    {currentPlan === BILLING_PLANS.MATSU && (
                      <Badge tone="success">利用中</Badge>
                    )}
                  </InlineStack>

                  <BlockStack gap="200">
                    <Text variant="heading2xl" as="p">
                      ¥4,980
                      <Text as="span" variant="bodyMd" tone="subdued">/月</Text>
                    </Text>
                    <Text variant="bodyMd" as="p" tone="subdued">
                      7日間の無料トライアル付き
                    </Text>
                  </BlockStack>

                  <Divider />

                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">✓ <strong>無制限</strong>のラベル印刷</Text>
                    <Text variant="bodyMd" as="p">✓ 全テンプレート利用可</Text>
                    <Text variant="bodyMd" as="p">✓ JAN/EANコード対応</Text>
                    <Text variant="bodyMd" as="p">✓ 優先サポート</Text>
                    <Text variant="bodyMd" as="p">✓ カスタムテンプレート</Text>
                    <Text variant="bodyMd" as="p">✓ API連携</Text>
                  </BlockStack>

                  <Button
                    variant={currentPlan === BILLING_PLANS.MATSU ? "secondary" : "primary"}
                    disabled={currentPlan === BILLING_PLANS.MATSU || isLoading}
                    onClick={() => handleSelectPlan(BILLING_PLANS.MATSU)}
                    fullWidth
                  >
                    {currentPlan === BILLING_PLANS.MATSU ? "利用中" : "このプランを選択"}
                  </Button>
                </BlockStack>
              </Box>
            </Card>
          </InlineStack>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h3">よくある質問</Text>
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  Q: プランはいつでも変更できますか？
                </Text>
                <Text variant="bodyMd" as="p">
                  A: はい、いつでもプランの変更・アップグレードが可能です。
                </Text>
              </BlockStack>
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  Q: 月の途中でプランを変更した場合、料金はどうなりますか？
                </Text>
                <Text variant="bodyMd" as="p">
                  A: 日割り計算で調整されます。
                </Text>
              </BlockStack>
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  Q: ラベル枚数が上限に達したらどうなりますか？
                </Text>
                <Text variant="bodyMd" as="p">
                  A: 上位プランへのアップグレードをお勧めします。翌月1日にリセットされます。
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

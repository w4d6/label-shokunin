import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useNavigate, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  InlineGrid,
  Box,
  Icon,
  InlineStack,
  Banner,
  ProgressBar,
} from "@shopify/polaris";
import {
  ProductIcon,
  ThemeIcon,
  PrintIcon,
  SettingsIcon,
} from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { BILLING_PLANS, PLAN_DETAILS } from "../utils/plans";
import { t } from "~/utils/i18n";
import { getShopUsage, getRemainingLabels, updateShopPlan } from "../utils/billing.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const shop = session.shop;

  // Check subscription status
  const { hasActivePayment, appSubscriptions } = await billing.check({
    plans: [BILLING_PLANS.UME, BILLING_PLANS.TAKE, BILLING_PLANS.MATSU],
    isTest: true,
  });

  let currentPlan: string | null = null;
  if (hasActivePayment && appSubscriptions.length > 0) {
    currentPlan = appSubscriptions[0].name;
    await updateShopPlan(shop, currentPlan as any);
  }

  const usage = await getRemainingLabels(shop);

  return json({
    hasActivePayment,
    currentPlan,
    usage,
    planDetails: currentPlan ? PLAN_DETAILS[currentPlan as keyof typeof PLAN_DETAILS] : null,
  });
};

export default function Index() {
  const navigate = useNavigate();
  const { hasActivePayment, currentPlan, usage, planDetails } = useLoaderData<typeof loader>();

  return (
    <Page>
      <TitleBar title={t('app.name')} />
      <BlockStack gap="500">
        {/* Subscription Banner */}
        {!hasActivePayment && (
          <Banner
            title="プランを選択してください"
            tone="warning"
            action={{ content: "プランを選択", url: "/app/billing" }}
          >
            <p>ラベル職人をご利用いただくには、プランのご登録が必要です。7日間の無料トライアルをお試しください。</p>
          </Banner>
        )}

        {/* Usage Status */}
        {hasActivePayment && planDetails && (
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h2">
                  現在のプラン: {planDetails.name}
                </Text>
                <Button variant="plain" onClick={() => navigate('/app/billing')}>
                  プラン変更
                </Button>
              </InlineStack>
              {usage.limit !== -1 ? (
                <BlockStack gap="200">
                  <Text variant="bodyMd" as="p">
                    今月の使用量: {usage.used} / {usage.limit} 枚
                  </Text>
                  <ProgressBar
                    progress={(usage.used / usage.limit) * 100}
                    tone={usage.used / usage.limit > 0.8 ? "critical" : "primary"}
                  />
                  <Text variant="bodySm" as="p" tone="subdued">
                    残り {usage.remaining} 枚
                  </Text>
                </BlockStack>
              ) : (
                <Text variant="bodyMd" as="p" tone="success">
                  ✓ 無制限プラン - 今月の印刷枚数: {usage.used} 枚
                </Text>
              )}
            </BlockStack>
          </Card>
        )}

        {/* Welcome Section */}
        <Card>
          <BlockStack gap="400">
            <Text as="h1" variant="headingXl">
              {t('home.welcome')}
            </Text>
            <Text as="p" variant="bodyLg" tone="subdued">
              {t('home.description')}
            </Text>
            <InlineStack gap="300">
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate('/app/products')}
              >
                {t('home.getStarted')}
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>

        {/* Quick Actions */}
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                {t('home.quickActions.title')}
              </Text>
              <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
                <Card>
                  <BlockStack gap="300">
                    <InlineStack gap="200" align="start">
                      <Box
                        background="bg-fill-info"
                        padding="200"
                        borderRadius="200"
                      >
                        <Icon source={ProductIcon} tone="info" />
                      </Box>
                      <BlockStack gap="100">
                        <Text as="h3" variant="headingMd">
                          {t('home.quickActions.selectProducts')}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {t('home.quickActions.selectProductsDesc')}
                        </Text>
                      </BlockStack>
                    </InlineStack>
                    <Button onClick={() => navigate('/app/products')}>
                      商品を選択
                    </Button>
                  </BlockStack>
                </Card>

                <Card>
                  <BlockStack gap="300">
                    <InlineStack gap="200" align="start">
                      <Box
                        background="bg-fill-success"
                        padding="200"
                        borderRadius="200"
                      >
                        <Icon source={ThemeIcon} tone="success" />
                      </Box>
                      <BlockStack gap="100">
                        <Text as="h3" variant="headingMd">
                          {t('home.quickActions.chooseTemplate')}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {t('home.quickActions.chooseTemplateDesc')}
                        </Text>
                      </BlockStack>
                    </InlineStack>
                    <Button onClick={() => navigate('/app/templates')}>
                      テンプレート選択
                    </Button>
                  </BlockStack>
                </Card>

                <Card>
                  <BlockStack gap="300">
                    <InlineStack gap="200" align="start">
                      <Box
                        background="bg-fill-warning"
                        padding="200"
                        borderRadius="200"
                      >
                        <Icon source={PrintIcon} tone="caution" />
                      </Box>
                      <BlockStack gap="100">
                        <Text as="h3" variant="headingMd">
                          {t('home.quickActions.printLabels')}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {t('home.quickActions.printLabelsDesc')}
                        </Text>
                      </BlockStack>
                    </InlineStack>
                    <Button onClick={() => navigate('/app/print')}>
                      印刷する
                    </Button>
                  </BlockStack>
                </Card>
              </InlineGrid>
            </BlockStack>
          </Layout.Section>
        </Layout>

        {/* Features Section */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  {t('home.features.title')}
                </Text>
                <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">
                      🇯🇵 {t('home.features.japanese')}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {t('home.features.japaneseDesc')}
                    </Text>
                  </BlockStack>

                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">
                      📊 {t('home.features.jan')}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {t('home.features.janDesc')}
                    </Text>
                  </BlockStack>

                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">
                      🖨️ {t('home.features.printers')}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {t('home.features.printersDesc')}
                    </Text>
                  </BlockStack>

                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">
                      💴 {t('home.features.tax')}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {t('home.features.taxDesc')}
                    </Text>
                  </BlockStack>
                </InlineGrid>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Settings Link */}
        <Layout>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <InlineStack gap="200" align="start">
                  <Icon source={SettingsIcon} tone="base" />
                  <Text as="h3" variant="headingMd">
                    設定
                  </Text>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  プリンターの設定やデフォルト値を変更できます
                </Text>
                <Button onClick={() => navigate('/app/settings')}>
                  設定を開く
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

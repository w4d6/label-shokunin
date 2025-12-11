import type { LoaderFunctionArgs } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
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
} from "@shopify/polaris";
import {
  ProductIcon,
  ThemeIcon,
  PrintIcon,
  SettingsIcon,
} from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { t } from "~/utils/i18n";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  const navigate = useNavigate();

  return (
    <Page>
      <TitleBar title={t('app.name')} />
      <BlockStack gap="500">
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

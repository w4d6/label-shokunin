import { useState, useCallback } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  Select,
  Checkbox,
  Divider,
  Banner,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { t } from "~/utils/i18n";
import type { LabelSettings, BarcodeFormat, LabelSize } from "~/types/label";
import { DEFAULT_LABEL_SETTINGS } from "~/types/label";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Settings() {
  const shopify = useAppBridge();
  const [settings, setSettings] = useState<LabelSettings>(DEFAULT_LABEL_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSettingChange = useCallback(
    (key: keyof LabelSettings, value: unknown) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      setSaved(false);
    },
    []
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Save to local storage for now
      if (typeof window !== "undefined") {
        localStorage.setItem("labelSettings", JSON.stringify(settings));
      }
      setSaved(true);
      shopify.toast.show(t("settings.saved"));
    } catch (error) {
      console.error("Save error:", error);
      shopify.toast.show("設定の保存に失敗しました", { isError: true });
    } finally {
      setIsSaving(false);
    }
  }, [settings, shopify]);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_LABEL_SETTINGS);
    setSaved(false);
  }, []);

  const barcodeFormatOptions = [
    { label: "JAN-13（13桁）", value: "JAN13" },
    { label: "JAN-8（8桁）", value: "JAN8" },
    { label: "EAN-13", value: "EAN13" },
    { label: "Code128", value: "CODE128" },
  ];

  const labelSizeOptions = [
    { label: "40mm × 28mm（標準）", value: "40x28" },
    { label: "60mm × 40mm（中）", value: "60x40" },
    { label: "80mm × 50mm（大）", value: "80x50" },
    { label: "100mm × 50mm（棚札）", value: "100x50" },
    { label: "A4シート（24面）", value: "a4-24" },
    { label: "A4シート（65面）", value: "a4-65" },
  ];

  const taxRateOptions = [
    { label: "標準税率（10%）", value: "10" },
    { label: "軽減税率（8%）", value: "8" },
  ];

  return (
    <Page
      backAction={{ content: "ホーム", url: "/app" }}
      title={t("settings.title")}
      primaryAction={{
        content: isSaving ? "保存中..." : t("settings.save"),
        loading: isSaving,
        onAction: handleSave,
      }}
    >
      <TitleBar title={t("settings.title")} />
      <BlockStack gap="500">
        {saved && (
          <Banner tone="success" onDismiss={() => setSaved(false)}>
            <p>{t("settings.saved")}</p>
          </Banner>
        )}

        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              {/* Default Label Settings */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    デフォルトラベル設定
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    新しいラベルを作成する際のデフォルト設定です
                  </Text>
                  <Divider />

                  <Select
                    label="デフォルトラベルサイズ"
                    options={labelSizeOptions}
                    value={settings.labelSize}
                    onChange={(value) =>
                      handleSettingChange("labelSize", value as LabelSize)
                    }
                  />

                  <Select
                    label="デフォルトバーコード形式"
                    options={barcodeFormatOptions}
                    value={settings.barcodeFormat}
                    onChange={(value) =>
                      handleSettingChange("barcodeFormat", value as BarcodeFormat)
                    }
                  />
                </BlockStack>
              </Card>

              {/* Display Settings */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    表示項目のデフォルト設定
                  </Text>
                  <Divider />

                  <Checkbox
                    label="商品名を表示"
                    checked={settings.showProductName}
                    onChange={(checked) =>
                      handleSettingChange("showProductName", checked)
                    }
                  />

                  <Checkbox
                    label="バリエーション名を表示"
                    checked={settings.showVariantName}
                    onChange={(checked) =>
                      handleSettingChange("showVariantName", checked)
                    }
                  />

                  <Checkbox
                    label="SKUを表示"
                    checked={settings.showSku}
                    onChange={(checked) => handleSettingChange("showSku", checked)}
                  />

                  <Checkbox
                    label="バーコードを表示"
                    checked={settings.showBarcode}
                    onChange={(checked) =>
                      handleSettingChange("showBarcode", checked)
                    }
                  />
                </BlockStack>
              </Card>

              {/* Price Settings */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    価格表示設定
                  </Text>
                  <Divider />

                  <Checkbox
                    label="価格を表示"
                    checked={settings.showPrice}
                    onChange={(checked) =>
                      handleSettingChange("showPrice", checked)
                    }
                  />

                  <Checkbox
                    label="税込価格を表示"
                    checked={settings.showTaxIncluded}
                    onChange={(checked) =>
                      handleSettingChange("showTaxIncluded", checked)
                    }
                  />

                  <Select
                    label="デフォルト消費税率"
                    options={taxRateOptions}
                    value={settings.taxRate.toString()}
                    onChange={(value) =>
                      handleSettingChange("taxRate", parseInt(value, 10))
                    }
                    helpText="軽減税率(8%)は飲食料品などに適用されます"
                  />
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              {/* App Info */}
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    アプリ情報
                  </Text>
                  <Divider />
                  <BlockStack gap="200">
                    <InlineStack gap="200" align="space-between">
                      <Text as="span" tone="subdued">
                        アプリ名
                      </Text>
                      <Text as="span">ラベル職人</Text>
                    </InlineStack>
                    <InlineStack gap="200" align="space-between">
                      <Text as="span" tone="subdued">
                        バージョン
                      </Text>
                      <Text as="span">1.0.0</Text>
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </Card>

              {/* Support */}
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    サポート
                  </Text>
                  <Divider />
                  <Text as="p" variant="bodySm" tone="subdued">
                    お困りの際はお気軽にお問い合わせください
                  </Text>
                  <BlockStack gap="200">
                    <Button url="mailto:support@example.com" external>
                      メールで問い合わせ
                    </Button>
                    <Button variant="plain">
                      ヘルプドキュメント
                    </Button>
                  </BlockStack>
                </BlockStack>
              </Card>

              {/* Reset Settings */}
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    設定のリセット
                  </Text>
                  <Divider />
                  <Text as="p" variant="bodySm" tone="subdued">
                    すべての設定をデフォルト値に戻します
                  </Text>
                  <Button variant="plain" tone="critical" onClick={handleReset}>
                    設定をリセット
                  </Button>
                </BlockStack>
              </Card>

              {/* Supported Printers */}
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    対応プリンター
                  </Text>
                  <Divider />
                  <Text as="p" variant="bodySm" fontWeight="semibold">
                    サトー
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    CL4NX Plus, CL6NX Plus, FX3-LX, CT4-LX
                  </Text>
                  <Text as="p" variant="bodySm" fontWeight="semibold">
                    ブラザー
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    TD-4550DNWB, TD-4420DN, QL-1100, QL-800
                  </Text>
                  <Text as="p" variant="bodySm" fontWeight="semibold">
                    その他
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    A4対応プリンター（ブラウザ印刷経由）
                  </Text>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

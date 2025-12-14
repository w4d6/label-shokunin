import { useState, useEffect, useCallback } from "react";
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
  Badge,
  Select,
  InlineStack,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { t } from "~/utils/i18n";
import { LABEL_TEMPLATES, LABEL_SIZES } from "~/utils/templates";
import type { LabelSize, SelectedProduct } from "~/types/label";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Templates() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState("simple");
  const [selectedSize, setSelectedSize] = useState<LabelSize>("40x28");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  useEffect(() => {
    // Load selected products from session storage
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("selectedProducts");
      if (stored) {
        setSelectedProducts(JSON.parse(stored));
      }
    }
  }, []);

  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    // Update size based on template default
    const template = LABEL_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedSize(template.size);
    }
  }, []);

  const handleSizeChange = useCallback((value: string) => {
    setSelectedSize(value as LabelSize);
  }, []);

  const handleProceed = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("selectedTemplate", selectedTemplate);
      sessionStorage.setItem("selectedSize", selectedSize);
    }
    navigate("/app/print");
  }, [navigate, selectedTemplate, selectedSize]);

  const sizeOptions = Object.entries(LABEL_SIZES).map(([value, { name }]) => ({
    label: name,
    value,
  }));

  return (
    <Page
      backAction={{ content: "商品選択", url: "/app/products" }}
      title={t("templates.title")}
      primaryAction={{
        content: t("templates.actions.next"),
        disabled: selectedProducts.length === 0,
        onAction: handleProceed,
      }}
    >
      <TitleBar title={t("templates.title")} />
      <BlockStack gap="500">
        {/* Selected Products Summary */}
        {selectedProducts.length > 0 && (
          <Card>
            <InlineStack gap="200" align="center">
              <Badge tone="info">{`${selectedProducts.length}件の商品を選択中`}</Badge>
              <Button variant="plain" onClick={() => navigate("/app/products")}>
                商品を変更
              </Button>
            </InlineStack>
          </Card>
        )}

        {selectedProducts.length === 0 && (
          <Card>
            <BlockStack gap="300">
              <Text as="p" tone="critical">
                商品が選択されていません。まず商品を選択してください。
              </Text>
              <Button onClick={() => navigate("/app/products")}>
                商品を選択する
              </Button>
            </BlockStack>
          </Card>
        )}

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  {t("templates.preset")}
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  {t("templates.description")}
                </Text>

                <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
                  {LABEL_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <Card
                        background={
                          selectedTemplate === template.id
                            ? "bg-surface-selected"
                            : "bg-surface"
                        }
                      >
                        <BlockStack gap="300">
                          {/* Template Preview */}
                          <Box
                            background="bg-fill-secondary"
                            padding="400"
                            borderRadius="200"
                            minHeight="120px"
                          >
                            <BlockStack gap="200">
                              {/* Mini preview of template structure */}
                              <Box
                                background="bg-surface"
                                padding="200"
                                borderRadius="100"
                              >
                                <div
                                  style={{
                                    height: "20px",
                                    background:
                                      "repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 2px, #fff 4px)",
                                  }}
                                />
                              </Box>
                              <Box
                                background="bg-surface"
                                padding="100"
                                borderRadius="100"
                              >
                                <Text as="span" variant="bodySm">
                                  商品名
                                </Text>
                              </Box>
                              <Box
                                background="bg-surface"
                                padding="100"
                                borderRadius="100"
                              >
                                <Text as="span" variant="bodyMd" fontWeight="bold">
                                  ¥1,000
                                </Text>
                              </Box>
                            </BlockStack>
                          </Box>

                          <BlockStack gap="100">
                            <InlineStack gap="200" align="space-between">
                              <Text as="h3" variant="headingMd">
                                {template.nameJa}
                              </Text>
                              {selectedTemplate === template.id && (
                                <Badge tone="success">選択中</Badge>
                              )}
                            </InlineStack>
                            <Text as="p" variant="bodySm" tone="subdued">
                              {template.description}
                            </Text>
                            <Text as="p" variant="bodySm">
                              サイズ: {template.width}mm × {template.height}mm
                            </Text>
                          </BlockStack>
                        </BlockStack>
                      </Card>
                    </div>
                  ))}
                </InlineGrid>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    {t("templates.labelSize")}
                  </Text>
                  <Select
                    label="ラベルサイズを選択"
                    labelHidden
                    options={sizeOptions}
                    value={selectedSize}
                    onChange={handleSizeChange}
                  />
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    選択中の設定
                  </Text>
                  <Divider />
                  <BlockStack gap="200">
                    <InlineStack gap="200" align="space-between">
                      <Text as="span" tone="subdued">
                        テンプレート
                      </Text>
                      <Text as="span" fontWeight="semibold">
                        {LABEL_TEMPLATES.find((t) => t.id === selectedTemplate)
                          ?.nameJa || "-"}
                      </Text>
                    </InlineStack>
                    <InlineStack gap="200" align="space-between">
                      <Text as="span" tone="subdued">
                        サイズ
                      </Text>
                      <Text as="span" fontWeight="semibold">
                        {LABEL_SIZES[selectedSize]?.name || "-"}
                      </Text>
                    </InlineStack>
                    <InlineStack gap="200" align="space-between">
                      <Text as="span" tone="subdued">
                        商品数
                      </Text>
                      <Text as="span" fontWeight="semibold">
                        {selectedProducts.length}件
                      </Text>
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    対応プリンター
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    以下のプリンターに対応しています：
                  </Text>
                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm">
                      • ブラウザ印刷（PDF）
                    </Text>
                    <Text as="p" variant="bodySm">
                      • サトー（CL4NX、FX3-LX等）
                    </Text>
                    <Text as="p" variant="bodySm">
                      • ブラザー（TD、QLシリーズ）
                    </Text>
                    <Text as="p" variant="bodySm">
                      • 一般プリンター（A4シート）
                    </Text>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

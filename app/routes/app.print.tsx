import { useState, useEffect, useCallback, useRef } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useNavigate, useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  InlineStack,
  Select,
  Checkbox,
  Divider,
  Badge,
  Box,
  Banner,
  InlineGrid,
  ChoiceList,
  Collapsible,
  Icon,
} from "@shopify/polaris";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { BILLING_PLANS, PLAN_DETAILS } from "../utils/plans";
import { t } from "~/utils/i18n";
import { LabelPreview } from "~/components/LabelPreview";
import { LABEL_TEMPLATES, LABEL_PRINTER_PRESETS, getPresetById } from "~/utils/templates";
import type { LabelPrinterPreset } from "~/utils/templates";
import type {
  SelectedProduct,
  LabelSettings,
  BarcodeFormat,
  LabelSize,
} from "~/types/label";
import { DEFAULT_LABEL_SETTINGS } from "~/types/label";
import { getRemainingLabels, incrementLabelCount, updateShopPlan } from "../utils/billing.server";

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
  const planDetails = currentPlan ? PLAN_DETAILS[currentPlan as keyof typeof PLAN_DETAILS] : null;

  return json({
    hasActivePayment,
    currentPlan,
    usage,
    planDetails,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const labelCount = parseInt(formData.get("labelCount") as string, 10);

  // Check subscription
  const { hasActivePayment } = await billing.check({
    plans: [BILLING_PLANS.UME, BILLING_PLANS.TAKE, BILLING_PLANS.MATSU],
    isTest: true,
  });

  if (!hasActivePayment) {
    return json({ success: false, error: "プランを選択してください" }, { status: 403 });
  }

  // Increment label count
  const result = await incrementLabelCount(shop, labelCount);

  if (!result.allowed) {
    return json({
      success: false,
      error: `今月の印刷上限（${result.limit}枚）に達しました。プランをアップグレードしてください。`,
      remaining: result.remaining,
      limit: result.limit,
    }, { status: 403 });
  }

  return json({
    success: true,
    remaining: result.remaining,
    limit: result.limit,
  });
};

export default function Print() {
  const navigate = useNavigate();
  const shopify = useAppBridge();
  const printRef = useRef<HTMLDivElement>(null);
  const { hasActivePayment, currentPlan, usage, planDetails } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("simple");
  const [settings, setSettings] = useState<LabelSettings>(DEFAULT_LABEL_SETTINGS);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  // Label Printer Settings
  const [selectedPresetId, setSelectedPresetId] = useState<string>("generic-40x28");
  const [customWidth, setCustomWidth] = useState<number>(40);
  const [customHeight, setCustomHeight] = useState<number>(28);
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [printMode, setPrintMode] = useState<"browser" | "label-printer">("browser");

  // Collapsible sections
  const [printerSettingsOpen, setPrinterSettingsOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const products = sessionStorage.getItem("selectedProducts");
      const template = sessionStorage.getItem("selectedTemplate");
      const size = sessionStorage.getItem("selectedSize");

      if (products) {
        setSelectedProducts(JSON.parse(products));
      }
      if (template) {
        setSelectedTemplateId(template);
      }
      if (size) {
        setSettings((prev) => ({ ...prev, labelSize: size as LabelSize }));
      }
    }
  }, []);

  const selectedPreset = getPresetById(selectedPresetId);

  // Use preset dimensions or custom dimensions
  const labelWidth = useCustomSize ? customWidth : (selectedPreset?.width || 40);
  const labelHeight = useCustomSize
    ? customHeight
    : (selectedPreset?.continuous ? customHeight : (selectedPreset?.height || 28));

  // Create a dynamic template based on preset/custom size
  const dynamicTemplate = {
    id: 'dynamic',
    name: 'Dynamic',
    nameJa: 'ダイナミック',
    description: 'Dynamic size from preset',
    size: 'custom' as LabelSize,
    width: labelWidth,
    height: labelHeight,
    elements: [],
  };

  const selectedTemplate = printMode === "label-printer"
    ? dynamicTemplate
    : (LABEL_TEMPLATES.find((t) => t.id === selectedTemplateId) || LABEL_TEMPLATES[0]);

  const handleSettingChange = useCallback(
    (key: keyof LabelSettings, value: unknown) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handlePresetChange = useCallback((presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = getPresetById(presetId);
    if (preset) {
      if (preset.continuous) {
        // For continuous roll, keep current height or set default
        setCustomHeight(40);
      } else {
        setCustomHeight(preset.height);
      }
      setCustomWidth(preset.width);
    }
  }, []);

  const handlePrint = useCallback(async () => {
    setIsPrinting(true);

    try {
      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        shopify.toast.show("ポップアップがブロックされました。許可してください。", {
          isError: true,
        });
        setIsPrinting(false);
        return;
      }

      // Map barcode format to JsBarcode format
      const getJsBarcodeFormat = (format: string): string => {
        switch (format) {
          case 'JAN13':
          case 'EAN13':
            return 'EAN13';
          case 'JAN8':
          case 'EAN8':
            return 'EAN8';
          case 'CODE128':
            return 'CODE128';
          case 'CODE39':
            return 'CODE39';
          default:
            return 'CODE128';
        }
      };

      const jsBarcodeFormat = getJsBarcodeFormat(settings.barcodeFormat);

      // Helper to sanitize ID for use in CSS selectors
      const sanitizeId = (id: string) => id.replace(/[^a-zA-Z0-9]/g, '_');

      // Determine page size and layout based on print mode
      const isLabelPrinter = printMode === "label-printer";
      const preset = selectedPreset;
      const isSheetLabel = preset?.labelsPerPage && preset.labelsPerPage > 1;

      // Calculate sizes
      const finalWidth = labelWidth;
      const finalHeight = labelHeight;

      // Build the print content
      const labelsHtml = selectedProducts
        .map((product) => {
          const taxNote = settings.showTaxIncluded
            ? settings.taxRate === 8
              ? "（税込・軽減税率）"
              : "（税込）"
            : "";

          const price = settings.showTaxIncluded
            ? Math.round(
                parseFloat(product.price) * (1 + settings.taxRate / 100)
              )
            : parseFloat(product.price);

          const safeId = sanitizeId(product.variantId);

          return `
            <div class="label">
              ${
                settings.showBarcode && product.barcode
                  ? `<div class="barcode-section">
                      <svg id="barcode-${safeId}"></svg>
                    </div>`
                  : ""
              }
              <div class="info-section">
                ${
                  settings.showProductName
                    ? `<div class="product-name">${product.title}</div>`
                    : ""
                }
                ${
                  settings.showVariantName &&
                  product.variantTitle !== "Default Title"
                    ? `<div class="variant-name">${product.variantTitle}</div>`
                    : ""
                }
                ${
                  settings.showSku && product.sku
                    ? `<div class="sku">SKU: ${product.sku}</div>`
                    : ""
                }
              </div>
              ${
                settings.showPrice
                  ? `<div class="price-section">
                      <span class="price">¥${price.toLocaleString("ja-JP")}</span>
                      ${settings.showTaxIncluded ? `<span class="tax-note">${taxNote}</span>` : ""}
                    </div>`
                  : ""
              }
            </div>
          `;
        })
        .join("");

      // Generate page size CSS
      let pageSizeCSS = "";
      let bodyPadding = "10mm";
      let labelGap = "4mm";

      if (isLabelPrinter) {
        if (isSheetLabel && preset) {
          // A4 sheet labels
          pageSizeCSS = `size: A4; margin: ${preset.marginTop || 10}mm ${preset.marginLeft || 10}mm;`;
          bodyPadding = "0";
          labelGap = `${preset.gapBetweenLabels || 0}mm`;
        } else {
          // Roll label printer - size matches label
          pageSizeCSS = `size: ${finalWidth}mm ${finalHeight}mm; margin: 0;`;
          bodyPadding = "0";
          labelGap = "0";
        }
      } else {
        pageSizeCSS = "size: A4; margin: 10mm;";
      }

      // Write to print window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>ラベル印刷 - ラベル職人</title>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <style>
            @page {
              ${pageSizeCSS}
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Noto Sans JP', sans-serif;
              margin: 0;
              padding: ${bodyPadding};
            }
            .labels-container {
              display: flex;
              flex-wrap: wrap;
              gap: ${labelGap};
              align-items: flex-start;
              ${isSheetLabel ? `
                width: 100%;
                justify-content: flex-start;
              ` : ''}
            }
            .label {
              width: ${finalWidth}mm;
              height: ${finalHeight}mm;
              border: ${isLabelPrinter ? 'none' : '1px solid #ccc'};
              padding: 2mm;
              page-break-inside: avoid;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              overflow: hidden;
              ${isLabelPrinter && !isSheetLabel ? 'page-break-after: always;' : ''}
            }
            .barcode-section {
              display: flex;
              justify-content: center;
              align-items: center;
              flex-shrink: 0;
            }
            .barcode-section svg {
              max-width: 100%;
              height: auto;
            }
            .info-section {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              gap: 1mm;
              min-height: 0;
              overflow: hidden;
            }
            .product-name {
              font-size: ${Math.max(6, Math.min(10, finalWidth / 6))}pt;
              font-weight: bold;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              line-height: 1.2;
            }
            .variant-name {
              font-size: ${Math.max(5, Math.min(8, finalWidth / 8))}pt;
              color: #666;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              line-height: 1.2;
            }
            .sku {
              font-size: ${Math.max(5, Math.min(7, finalWidth / 9))}pt;
              color: #888;
              line-height: 1.2;
            }
            .price-section {
              display: flex;
              justify-content: flex-end;
              align-items: baseline;
              flex-shrink: 0;
              gap: 2px;
            }
            .price {
              font-size: ${Math.max(8, Math.min(14, finalWidth / 4))}pt;
              font-weight: bold;
            }
            .tax-note {
              font-size: ${Math.max(4, Math.min(6, finalWidth / 10))}pt;
              color: #666;
            }
            @media print {
              body { margin: 0; padding: ${isLabelPrinter ? '0' : '5mm'}; }
              .label { border: ${isLabelPrinter ? 'none' : '1px solid #ddd'}; }
            }
            @media screen {
              body { padding: 10mm; background: #f0f0f0; }
              .labels-container { background: white; padding: 10mm; }
              .label { border: 1px dashed #ccc; }
            }
          </style>
        </head>
        <body>
          <div class="labels-container">
            ${labelsHtml}
          </div>
          <script>
            // Generate barcodes
            ${selectedProducts
              .filter((p) => p.barcode && settings.showBarcode)
              .map(
                (p) => {
                  const safeId = sanitizeId(p.variantId);
                  const barcodeHeight = Math.max(15, Math.min(30, finalHeight / 2));
                  return `
              try {
                JsBarcode("#barcode-${safeId}", "${p.barcode}", {
                  format: "${jsBarcodeFormat}",
                  width: ${Math.max(0.8, Math.min(1.5, finalWidth / 40))},
                  height: ${barcodeHeight},
                  displayValue: true,
                  fontSize: ${Math.max(6, Math.min(10, finalWidth / 7))},
                  margin: 1,
                  textMargin: 1
                });
              } catch(e) {
                console.error("Barcode error for ${p.barcode}:", e);
                var el = document.getElementById("barcode-${safeId}");
                if (el && el.parentNode) {
                  el.parentNode.innerHTML = '<span style="font-size:6pt;color:red;">バーコード生成エラー</span>';
                }
              }
            `;
                }
              )
              .join("")}

            // Auto print after barcodes are generated
            setTimeout(() => {
              window.print();
            }, 500);
          </script>
        </body>
        </html>
      `);

      printWindow.document.close();

      shopify.toast.show("印刷ダイアログを開きました");
    } catch (error) {
      console.error("Print error:", error);
      shopify.toast.show("印刷中にエラーが発生しました", { isError: true });
    } finally {
      setIsPrinting(false);
    }
  }, [selectedProducts, selectedTemplate, settings, shopify, printMode, selectedPreset, labelWidth, labelHeight]);

  const barcodeFormatOptions = [
    { label: "Code128（推奨）", value: "CODE128" },
    { label: "JAN-13（13桁）", value: "JAN13" },
    { label: "JAN-8（8桁）", value: "JAN8" },
    { label: "EAN-13", value: "EAN13" },
  ];

  const taxRateOptions = [
    { label: "標準税率（10%）", value: "10" },
    { label: "軽減税率（8%）", value: "8" },
  ];

  // Group presets by brand
  const presetsByBrand = {
    brother: LABEL_PRINTER_PRESETS.filter(p => p.brand === 'brother'),
    zebra: LABEL_PRINTER_PRESETS.filter(p => p.brand === 'zebra'),
    sato: LABEL_PRINTER_PRESETS.filter(p => p.brand === 'sato'),
    aone: LABEL_PRINTER_PRESETS.filter(p => p.brand === 'aone'),
    generic: LABEL_PRINTER_PRESETS.filter(p => p.brand === 'generic'),
  };

  const printerPresetOptions = [
    { label: "── Brother ──", value: "_header_brother", disabled: true },
    ...presetsByBrand.brother.map(p => ({ label: p.name, value: p.id })),
    { label: "── Zebra ──", value: "_header_zebra", disabled: true },
    ...presetsByBrand.zebra.map(p => ({ label: p.name, value: p.id })),
    { label: "── SATO ──", value: "_header_sato", disabled: true },
    ...presetsByBrand.sato.map(p => ({ label: p.name, value: p.id })),
    { label: "── エーワン（A4シート）──", value: "_header_aone", disabled: true },
    ...presetsByBrand.aone.map(p => ({ label: p.name, value: p.id })),
    { label: "── 汎用 ──", value: "_header_generic", disabled: true },
    ...presetsByBrand.generic.map(p => ({ label: p.name, value: p.id })),
  ];

  // Show subscription required message
  if (!hasActivePayment) {
    return (
      <Page
        backAction={{ content: "テンプレート", url: "/app/templates" }}
        title={t("editor.title")}
      >
        <TitleBar title={t("editor.title")} />
        <Card>
          <BlockStack gap="400">
            <Banner
              title="プランを選択してください"
              tone="warning"
              action={{ content: "プランを選択", url: "/app/billing" }}
            >
              <p>ラベルを印刷するには、プランのご登録が必要です。7日間の無料トライアルをお試しください。</p>
            </Banner>
          </BlockStack>
        </Card>
      </Page>
    );
  }

  if (selectedProducts.length === 0) {
    return (
      <Page
        backAction={{ content: "テンプレート", url: "/app/templates" }}
        title={t("editor.title")}
      >
        <TitleBar title={t("editor.title")} />
        <Card>
          <BlockStack gap="400">
            <Banner tone="warning">
              <p>商品が選択されていません。まず商品を選択してください。</p>
            </Banner>
            <Button onClick={() => navigate("/app/products")}>
              商品を選択する
            </Button>
          </BlockStack>
        </Card>
      </Page>
    );
  }

  return (
    <Page
      backAction={{ content: "テンプレート", url: "/app/templates" }}
      title={t("editor.title")}
      primaryAction={{
        content: isPrinting ? "印刷中..." : t("editor.actions.print"),
        loading: isPrinting,
        onAction: handlePrint,
      }}
    >
      <TitleBar title={t("editor.title")} />
      <BlockStack gap="500">
        <Layout>
          {/* Preview Section */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack gap="200" align="space-between">
                  <Text as="h2" variant="headingMd">
                    {t("editor.preview")}
                  </Text>
                  <InlineStack gap="200">
                    <Badge tone="info">{`${labelWidth}mm × ${labelHeight}mm`}</Badge>
                    <Badge>{`${selectedProducts.length}件のラベル`}</Badge>
                  </InlineStack>
                </InlineStack>

                <Divider />

                {/* Label Previews */}
                <Box padding="400" background="bg-surface-secondary">
                  <InlineGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="400">
                    {selectedProducts.slice(0, 8).map((product) => (
                      <div
                        key={product.variantId}
                        style={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <LabelPreview
                          product={product}
                          settings={settings}
                          template={selectedTemplate}
                          scale={3}
                        />
                      </div>
                    ))}
                  </InlineGrid>
                  {selectedProducts.length > 8 && (
                    <Box paddingBlockStart="400">
                      <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                        他 {selectedProducts.length - 8} 件のラベルがあります
                      </Text>
                    </Box>
                  )}
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Settings Section */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              {/* Print Mode Selection */}
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    印刷モード
                  </Text>
                  <Divider />
                  <ChoiceList
                    title=""
                    choices={[
                      { label: "A4用紙（ブラウザ印刷）", value: "browser" },
                      { label: "ラベルプリンター / シールプリンター", value: "label-printer" },
                    ]}
                    selected={[printMode]}
                    onChange={(value) => setPrintMode(value[0] as "browser" | "label-printer")}
                  />
                </BlockStack>
              </Card>

              {/* Label Printer Settings */}
              {printMode === "label-printer" && (
                <Card>
                  <BlockStack gap="300">
                    <InlineStack align="space-between">
                      <Text as="h2" variant="headingMd">
                        ラベル用紙設定
                      </Text>
                      <Button
                        variant="plain"
                        onClick={() => setPrinterSettingsOpen(!printerSettingsOpen)}
                        icon={printerSettingsOpen ? ChevronUpIcon : ChevronDownIcon}
                      />
                    </InlineStack>
                    <Divider />

                    <Collapsible open={printerSettingsOpen} id="printer-settings">
                      <BlockStack gap="300">
                        <Select
                          label="プリンター / 用紙プリセット"
                          options={printerPresetOptions}
                          value={selectedPresetId}
                          onChange={handlePresetChange}
                        />

                        {selectedPreset && (
                          <Box padding="200" background="bg-surface-secondary" borderRadius="100">
                            <BlockStack gap="100">
                              <Text as="p" variant="bodySm" tone="subdued">
                                {selectedPreset.model && `対応機種: ${selectedPreset.model}`}
                              </Text>
                              <Text as="p" variant="bodySm" tone="subdued">
                                {selectedPreset.description}
                              </Text>
                              {selectedPreset.paperCode && (
                                <Text as="p" variant="bodySm" fontWeight="semibold">
                                  用紙コード: {selectedPreset.paperCode}
                                </Text>
                              )}
                            </BlockStack>
                          </Box>
                        )}

                        <Checkbox
                          label="カスタムサイズを使用"
                          checked={useCustomSize}
                          onChange={setUseCustomSize}
                        />

                        {(useCustomSize || selectedPreset?.continuous) && (
                          <InlineStack gap="200">
                            <div style={{ flex: 1 }}>
                              <Select
                                label="幅 (mm)"
                                options={[
                                  { label: "29mm", value: "29" },
                                  { label: "38mm", value: "38" },
                                  { label: "40mm", value: "40" },
                                  { label: "50mm", value: "50" },
                                  { label: "52mm", value: "52" },
                                  { label: "60mm", value: "60" },
                                  { label: "62mm", value: "62" },
                                  { label: "80mm", value: "80" },
                                  { label: "100mm", value: "100" },
                                ]}
                                value={customWidth.toString()}
                                onChange={(v) => setCustomWidth(parseInt(v, 10))}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <Select
                                label="高さ (mm)"
                                options={[
                                  { label: "20mm", value: "20" },
                                  { label: "25mm", value: "25" },
                                  { label: "28mm", value: "28" },
                                  { label: "29mm", value: "29" },
                                  { label: "30mm", value: "30" },
                                  { label: "40mm", value: "40" },
                                  { label: "48mm", value: "48" },
                                  { label: "50mm", value: "50" },
                                  { label: "60mm", value: "60" },
                                  { label: "90mm", value: "90" },
                                ]}
                                value={customHeight.toString()}
                                onChange={(v) => setCustomHeight(parseInt(v, 10))}
                              />
                            </div>
                          </InlineStack>
                        )}
                      </BlockStack>
                    </Collapsible>
                  </BlockStack>
                </Card>
              )}

              {/* Display Settings */}
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    {t("editor.settings")}
                  </Text>
                  <Divider />

                  <Text as="h3" variant="headingSm">
                    {t("editor.elements")}
                  </Text>

                  <Checkbox
                    label={t("editor.showProductName")}
                    checked={settings.showProductName}
                    onChange={(checked) =>
                      handleSettingChange("showProductName", checked)
                    }
                  />

                  <Checkbox
                    label={t("editor.showVariantName")}
                    checked={settings.showVariantName}
                    onChange={(checked) =>
                      handleSettingChange("showVariantName", checked)
                    }
                  />

                  <Checkbox
                    label={t("editor.showSku")}
                    checked={settings.showSku}
                    onChange={(checked) => handleSettingChange("showSku", checked)}
                  />

                  <Checkbox
                    label={t("editor.showBarcode")}
                    checked={settings.showBarcode}
                    onChange={(checked) =>
                      handleSettingChange("showBarcode", checked)
                    }
                  />

                  {settings.showBarcode && (
                    <Select
                      label={t("editor.barcodeFormat")}
                      options={barcodeFormatOptions}
                      value={settings.barcodeFormat}
                      onChange={(value) =>
                        handleSettingChange("barcodeFormat", value as BarcodeFormat)
                      }
                    />
                  )}
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingSm">
                    価格設定
                  </Text>

                  <Checkbox
                    label={t("editor.showPrice")}
                    checked={settings.showPrice}
                    onChange={(checked) =>
                      handleSettingChange("showPrice", checked)
                    }
                  />

                  {settings.showPrice && (
                    <>
                      <Checkbox
                        label={t("editor.showTaxIncluded")}
                        checked={settings.showTaxIncluded}
                        onChange={(checked) =>
                          handleSettingChange("showTaxIncluded", checked)
                        }
                      />

                      <Select
                        label={t("editor.taxRate")}
                        options={taxRateOptions}
                        value={settings.taxRate.toString()}
                        onChange={(value) =>
                          handleSettingChange("taxRate", parseInt(value, 10))
                        }
                      />
                    </>
                  )}
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Button variant="primary" fullWidth onClick={handlePrint} loading={isPrinting}>
                    {isPrinting ? "印刷中..." : "印刷する"}
                  </Button>

                  {printMode === "label-printer" && (
                    <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                      ラベルプリンターに直接印刷するには、<br />
                      プリンタードライバーの設定で用紙サイズを<br />
                      {labelWidth}mm × {labelHeight}mm に設定してください
                    </Text>
                  )}
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>

      {/* Hidden print container */}
      <div ref={printRef} style={{ display: "none" }} />
    </Page>
  );
}

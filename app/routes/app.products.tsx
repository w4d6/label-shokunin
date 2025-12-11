import { useState, useCallback } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  TextField,
  IndexTable,
  Thumbnail,
  Badge,
  InlineStack,
  useIndexResourceState,
  Pagination,
  EmptyState,
  Spinner,
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { ImageIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { t } from "~/utils/i18n";
import type { SelectedProduct } from "~/types/label";

interface ProductNode {
  id: string;
  title: string;
  handle: string;
  status: string;
  featuredImage?: {
    url: string;
    altText?: string;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        sku: string;
        barcode: string | null;
        price: string;
        inventoryQuantity: number | null;
      };
    }>;
  };
}

interface LoaderData {
  products: ProductNode[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const direction = url.searchParams.get("direction") || "next";
  const search = url.searchParams.get("search") || "";

  let queryString = "status:active";
  if (search) {
    queryString += ` AND title:*${search}*`;
  }

  const paginationArgs =
    direction === "prev" && cursor
      ? `last: 20, before: "${cursor}"`
      : cursor
        ? `first: 20, after: "${cursor}"`
        : `first: 20`;

  const response = await admin.graphql(
    `#graphql
      query getProducts($query: String) {
        products(${paginationArgs}, query: $query) {
          edges {
            node {
              id
              title
              handle
              status
              featuredImage {
                url
                altText
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    sku
                    barcode
                    price
                    inventoryQuantity
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }`,
    {
      variables: {
        query: queryString,
      },
    }
  );

  const responseJson = await response.json();
  const products = responseJson.data?.products?.edges.map(
    (edge: { node: ProductNode }) => edge.node
  ) || [];
  const pageInfo = responseJson.data?.products?.pageInfo || {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  };

  return json<LoaderData>({ products, pageInfo });
};

export default function Products() {
  const { products, pageInfo } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );

  // Flatten products with variants for the table
  const flattenedProducts = products.flatMap((product) =>
    product.variants.edges.map((variantEdge) => ({
      id: `${product.id}-${variantEdge.node.id}`,
      productId: product.id,
      variantId: variantEdge.node.id,
      title: product.title,
      variantTitle: variantEdge.node.title,
      sku: variantEdge.node.sku || "",
      barcode: variantEdge.node.barcode || "",
      price: variantEdge.node.price,
      inventoryQuantity: variantEdge.node.inventoryQuantity,
      image: product.featuredImage?.url,
    }))
  );

  const resourceName = {
    singular: "商品",
    plural: "商品",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(flattenedProducts);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearch = useCallback(() => {
    navigate(`/app/products?search=${encodeURIComponent(searchValue)}`);
  }, [navigate, searchValue]);

  const handleNextPage = useCallback(() => {
    if (pageInfo.endCursor) {
      navigate(
        `/app/products?cursor=${pageInfo.endCursor}&direction=next&search=${encodeURIComponent(searchValue)}`
      );
    }
  }, [navigate, pageInfo.endCursor, searchValue]);

  const handlePreviousPage = useCallback(() => {
    if (pageInfo.startCursor) {
      navigate(
        `/app/products?cursor=${pageInfo.startCursor}&direction=prev&search=${encodeURIComponent(searchValue)}`
      );
    }
  }, [navigate, pageInfo.startCursor, searchValue]);

  const handleProceed = useCallback(() => {
    const selected = flattenedProducts
      .filter((p) => selectedResources.includes(p.id))
      .map((p) => ({
        productId: p.productId,
        variantId: p.variantId,
        title: p.title,
        variantTitle: p.variantTitle,
        sku: p.sku,
        barcode: p.barcode,
        price: p.price,
        quantity: 1,
      }));

    // Store selected products in session storage for the next page
    if (typeof window !== "undefined") {
      sessionStorage.setItem("selectedProducts", JSON.stringify(selected));
    }

    navigate("/app/templates");
  }, [flattenedProducts, selectedResources, navigate]);

  const rowMarkup = flattenedProducts.map((product, index) => (
    <IndexTable.Row
      id={product.id}
      key={product.id}
      selected={selectedResources.includes(product.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Thumbnail
          source={product.image || ImageIcon}
          alt={product.title}
          size="small"
        />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <BlockStack gap="100">
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {product.title}
          </Text>
          {product.variantTitle !== "Default Title" && (
            <Text as="span" variant="bodySm" tone="subdued">
              {product.variantTitle}
            </Text>
          )}
        </BlockStack>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodySm">
          {product.sku || "-"}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        {product.barcode ? (
          <Badge tone="success">{product.barcode}</Badge>
        ) : (
          <Badge tone="attention">未設定</Badge>
        )}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          ¥{parseFloat(product.price).toLocaleString("ja-JP")}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodySm">
          {product.inventoryQuantity !== null
            ? product.inventoryQuantity.toLocaleString()
            : "-"}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      backAction={{ content: "ホーム", url: "/app" }}
      title={t("products.title")}
      primaryAction={{
        content: t("products.actions.next"),
        disabled: selectedResources.length === 0,
        onAction: handleProceed,
      }}
    >
      <TitleBar title={t("products.title")} />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="p" variant="bodyMd" tone="subdued">
                  {t("products.description")}
                </Text>

                {/* Search */}
                <InlineStack gap="300" align="start">
                  <Box minWidth="300px">
                    <TextField
                      label=""
                      labelHidden
                      placeholder={t("products.search")}
                      value={searchValue}
                      onChange={handleSearchChange}
                      autoComplete="off"
                      connectedRight={
                        <Button onClick={handleSearch}>検索</Button>
                      }
                    />
                  </Box>
                </InlineStack>

                {/* Selection count */}
                {selectedResources.length > 0 && (
                  <InlineStack gap="200" align="center">
                    <Badge tone="info">
                      {selectedResources.length}件選択中
                    </Badge>
                  </InlineStack>
                )}

                {/* Products Table */}
                {flattenedProducts.length > 0 ? (
                  <IndexTable
                    resourceName={resourceName}
                    itemCount={flattenedProducts.length}
                    selectedItemsCount={
                      allResourcesSelected ? "All" : selectedResources.length
                    }
                    onSelectionChange={handleSelectionChange}
                    headings={[
                      { title: t("products.columns.image") },
                      { title: t("products.columns.product") },
                      { title: t("products.columns.sku") },
                      { title: t("products.columns.barcode") },
                      { title: t("products.columns.price") },
                      { title: t("products.columns.stock") },
                    ]}
                  >
                    {rowMarkup}
                  </IndexTable>
                ) : (
                  <EmptyState
                    heading={t("products.noProducts")}
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <p>商品が登録されていないか、検索条件に一致する商品がありません。</p>
                  </EmptyState>
                )}

                {/* Pagination */}
                {(pageInfo.hasNextPage || pageInfo.hasPreviousPage) && (
                  <InlineStack align="center">
                    <Pagination
                      hasPrevious={pageInfo.hasPreviousPage}
                      onPrevious={handlePreviousPage}
                      hasNext={pageInfo.hasNextPage}
                      onNext={handleNextPage}
                    />
                  </InlineStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

// Label types for barcode label app

export interface Product {
  id: string;
  title: string;
  handle: string;
  vendor: string;
  productType: string;
  status: string;
  featuredImage?: {
    url: string;
    altText?: string;
  };
  variants: {
    edges: Array<{
      node: ProductVariant;
    }>;
  };
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  barcode: string | null;
  price: string;
  compareAtPrice: string | null;
  inventoryQuantity: number | null;
}

export interface SelectedProduct {
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  sku: string;
  barcode: string;
  price: string;
  quantity: number;
}

export type BarcodeFormat =
  | 'JAN13'      // Japanese Article Number (EAN-13 with 45/49 prefix)
  | 'JAN8'       // Short JAN
  | 'EAN13'      // European Article Number
  | 'EAN8'       // Short EAN
  | 'CODE128'    // General purpose
  | 'CODE39'     // Alphanumeric
  | 'QR';        // QR Code

export type LabelSize =
  | '40x28'      // 40mm x 28mm (standard)
  | '60x40'      // 60mm x 40mm (medium)
  | '80x50'      // 80mm x 50mm (large)
  | '100x50'     // 100mm x 50mm (shelf label)
  | 'a4-24'      // A4 sheet with 24 labels
  | 'a4-65'      // A4 sheet with 65 labels
  | 'custom';    // Custom size

export interface LabelTemplate {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  size: LabelSize;
  width: number;  // in mm
  height: number; // in mm
  elements: LabelElement[];
}

export interface LabelElement {
  type: 'barcode' | 'qrcode' | 'text' | 'price' | 'image';
  x: number;      // position in mm from left
  y: number;      // position in mm from top
  width: number;  // in mm
  height: number; // in mm
  field?: string; // data field to display
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  format?: string; // for price formatting
}

export interface LabelSettings {
  showPrice: boolean;
  showTaxIncluded: boolean;
  taxRate: number;         // 10 for standard, 8 for reduced
  showSku: boolean;
  showProductName: boolean;
  showVariantName: boolean;
  showBarcode: boolean;
  barcodeFormat: BarcodeFormat;
  labelSize: LabelSize;
  customWidth?: number;
  customHeight?: number;
}

export interface PrintSettings {
  copies: number;
  printer: 'browser' | 'pdf' | 'sato' | 'brother';
  paperSize: string;
  orientation: 'portrait' | 'landscape';
}

export const DEFAULT_LABEL_SETTINGS: LabelSettings = {
  showPrice: true,
  showTaxIncluded: true,
  taxRate: 10,
  showSku: false,
  showProductName: true,
  showVariantName: false,
  showBarcode: true,
  barcodeFormat: 'CODE128',
  labelSize: '40x28',
};

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  copies: 1,
  printer: 'browser',
  paperSize: 'A4',
  orientation: 'portrait',
};

// Barcode utilities for Label Shokunin

import type { BarcodeFormat } from '~/types/label';

/**
 * Check if a barcode is a valid JAN code (Japanese Article Number)
 * JAN codes start with 45 or 49 (Japan prefix)
 */
export function isJanCode(barcode: string): boolean {
  if (!barcode || barcode.length !== 13) return false;
  return barcode.startsWith('45') || barcode.startsWith('49');
}

/**
 * Detect the barcode format from the barcode string
 */
export function detectBarcodeFormat(barcode: string): BarcodeFormat {
  if (!barcode) return 'CODE128';

  const cleanBarcode = barcode.replace(/\D/g, '');

  // JAN/EAN-13
  if (cleanBarcode.length === 13) {
    return isJanCode(cleanBarcode) ? 'JAN13' : 'EAN13';
  }

  // JAN/EAN-8
  if (cleanBarcode.length === 8) {
    return 'JAN8';
  }

  // Default to CODE128 for other formats
  return 'CODE128';
}

/**
 * Validate a barcode based on its format
 */
export function validateBarcode(barcode: string, format: BarcodeFormat): boolean {
  if (!barcode) return false;

  const cleanBarcode = barcode.replace(/\D/g, '');

  switch (format) {
    case 'JAN13':
    case 'EAN13':
      return cleanBarcode.length === 13 && validateCheckDigit13(cleanBarcode);
    case 'JAN8':
    case 'EAN8':
      return cleanBarcode.length === 8 && validateCheckDigit8(cleanBarcode);
    case 'CODE128':
    case 'CODE39':
      return barcode.length > 0;
    case 'QR':
      return barcode.length > 0;
    default:
      return false;
  }
}

/**
 * Calculate and validate check digit for EAN-13/JAN-13
 */
function validateCheckDigit13(barcode: string): boolean {
  if (barcode.length !== 13) return false;

  const digits = barcode.split('').map(Number);
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[12];
}

/**
 * Calculate and validate check digit for EAN-8/JAN-8
 */
function validateCheckDigit8(barcode: string): boolean {
  if (barcode.length !== 8) return false;

  const digits = barcode.split('').map(Number);
  let sum = 0;

  for (let i = 0; i < 7; i++) {
    sum += digits[i] * (i % 2 === 0 ? 3 : 1);
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[7];
}

/**
 * Generate a check digit for EAN-13/JAN-13
 */
export function generateCheckDigit13(barcode12: string): string {
  if (barcode12.length !== 12) {
    throw new Error('Barcode must be 12 digits to calculate check digit');
  }

  const digits = barcode12.split('').map(Number);
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return barcode12 + checkDigit;
}

/**
 * Format price with Japanese yen
 */
export function formatPrice(
  price: string | number,
  showTaxIncluded: boolean = true,
  taxRate: number = 10
): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) return '¥0';

  const taxIncludedPrice = showTaxIncluded
    ? Math.round(numPrice * (1 + taxRate / 100))
    : numPrice;

  return `¥${taxIncludedPrice.toLocaleString('ja-JP')}`;
}

/**
 * Format price with tax breakdown
 */
export function formatPriceWithTax(
  price: string | number,
  taxRate: number = 10
): { taxExcluded: string; taxIncluded: string; taxAmount: string } {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return { taxExcluded: '¥0', taxIncluded: '¥0', taxAmount: '¥0' };
  }

  const taxAmount = Math.round(numPrice * (taxRate / 100));
  const taxIncluded = Math.round(numPrice + taxAmount);

  return {
    taxExcluded: `¥${numPrice.toLocaleString('ja-JP')}`,
    taxIncluded: `¥${taxIncluded.toLocaleString('ja-JP')}`,
    taxAmount: `¥${taxAmount.toLocaleString('ja-JP')}`,
  };
}

/**
 * Get JsBarcode format string from our BarcodeFormat type
 */
export function getJsBarcodeFormat(format: BarcodeFormat): string {
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
}

/**
 * Get label size dimensions in mm
 */
export function getLabelDimensions(
  size: string
): { width: number; height: number } {
  const sizes: Record<string, { width: number; height: number }> = {
    '40x28': { width: 40, height: 28 },
    '60x40': { width: 60, height: 40 },
    '80x50': { width: 80, height: 50 },
    '100x50': { width: 100, height: 50 },
    'a4-24': { width: 70, height: 37 },    // Avery compatible
    'a4-65': { width: 38.1, height: 21.2 }, // Avery compatible
  };

  return sizes[size] || { width: 40, height: 28 };
}

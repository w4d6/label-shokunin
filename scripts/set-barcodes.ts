// Script to set valid EAN-13 barcodes on dummy products
// Run with: npx tsx scripts/set-barcodes.ts

// Function to calculate EAN-13 check digit
function calculateEAN13CheckDigit(digits12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(digits12[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return digits12 + checkDigit.toString();
}

// Generate valid EAN-13 barcodes starting with 49 (Japan)
const barcodes = [
  calculateEAN13CheckDigit("490000000001"), // 4900000000017
  calculateEAN13CheckDigit("490000000002"), // 4900000000024
  calculateEAN13CheckDigit("490000000003"), // 4900000000031
  calculateEAN13CheckDigit("490000000004"), // 4900000000048
  calculateEAN13CheckDigit("490000000005"), // 4900000000055
  calculateEAN13CheckDigit("490000000006"), // 4900000000062
  calculateEAN13CheckDigit("490000000007"), // 4900000000079
  calculateEAN13CheckDigit("490000000008"), // 4900000000086
  calculateEAN13CheckDigit("490000000009"), // 4900000000093
  calculateEAN13CheckDigit("490000000010"), // 4900000000109
  calculateEAN13CheckDigit("490000000011"), // 4900000000116
  calculateEAN13CheckDigit("490000000012"), // 4900000000123
  calculateEAN13CheckDigit("490000000013"), // 4900000000130
  calculateEAN13CheckDigit("490000000014"), // 4900000000147
  calculateEAN13CheckDigit("490000000015"), // 4900000000154
  calculateEAN13CheckDigit("490000000016"), // 4900000000161
  calculateEAN13CheckDigit("490000000017"), // 4900000000178
];

console.log("Generated valid EAN-13 barcodes:");
barcodes.forEach((barcode, i) => {
  console.log(`${i + 1}. ${barcode}`);
});

// These barcodes need to be set via Shopify Admin UI or GraphQL API
// Since we can't run authenticated API calls from a standalone script,
// we'll use the browser to set them.

console.log("\nTo set these barcodes:");
console.log("1. Go to Shopify Admin > Products");
console.log("2. Edit each product and add the barcode in the Inventory section");
console.log("3. Or use the bulk editor in Products > Edit products");

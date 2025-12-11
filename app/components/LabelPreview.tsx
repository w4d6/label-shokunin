import { forwardRef } from 'react';
import { BarcodeGenerator } from './BarcodeGenerator';
import type { SelectedProduct, LabelSettings, LabelTemplate } from '~/types/label';
import { formatPrice } from '~/utils/barcode';

interface LabelPreviewProps {
  product: SelectedProduct;
  settings: LabelSettings;
  template: LabelTemplate;
  scale?: number;
}

export const LabelPreview = forwardRef<HTMLDivElement, LabelPreviewProps>(
  function LabelPreview({ product, settings, template, scale = 3 }, ref) {
    const { width, height } = template;

    // Convert mm to pixels (at 96 DPI, 1mm ≈ 3.78px, we use scale for display)
    const pxWidth = width * scale;
    const pxHeight = height * scale;
    const padding = 2 * scale;

    const taxNote = settings.showTaxIncluded
      ? settings.taxRate === 8
        ? '（税込・軽減税率）'
        : '（税込）'
      : '（税抜）';

    // Calculate font sizes based on scale
    const fontSizeSmall = Math.max(6, 6 * (scale / 3));
    const fontSizeMedium = Math.max(8, 8 * (scale / 3));
    const fontSizeLarge = Math.max(10, 10 * (scale / 3));
    const fontSizePrice = Math.max(12, 12 * (scale / 3));

    // Calculate barcode height based on available space
    const barcodeHeight = Math.max(20, 25 * (scale / 3));

    return (
      <div
        ref={ref}
        style={{
          width: `${pxWidth}px`,
          height: `${pxHeight}px`,
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: '2px',
          padding: `${padding}px`,
          boxSizing: 'border-box',
          fontFamily: '"Noto Sans JP", "Hiragino Sans", sans-serif',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}
      >
        {/* Top Section: Barcode */}
        {settings.showBarcode && product.barcode && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0,
              minHeight: `${barcodeHeight + 10}px`,
            }}
          >
            <BarcodeGenerator
              value={product.barcode}
              format={settings.barcodeFormat}
              width={1.2}
              height={barcodeHeight}
              displayValue={true}
              fontSize={fontSizeSmall}
              margin={1}
            />
          </div>
        )}

        {/* Middle Section: Product Info */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: `${2 * (scale / 3)}px`,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* Product Name */}
          {settings.showProductName && (
            <div
              style={{
                fontSize: `${fontSizeMedium}px`,
                fontWeight: 'bold',
                color: '#333',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.2,
              }}
            >
              {product.title}
            </div>
          )}

          {/* Variant Name */}
          {settings.showVariantName && product.variantTitle && product.variantTitle !== 'Default Title' && (
            <div
              style={{
                fontSize: `${fontSizeSmall}px`,
                color: '#666',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.2,
              }}
            >
              {product.variantTitle}
            </div>
          )}

          {/* SKU */}
          {settings.showSku && product.sku && (
            <div
              style={{
                fontSize: `${fontSizeSmall}px`,
                color: '#888',
                lineHeight: 1.2,
              }}
            >
              SKU: {product.sku}
            </div>
          )}
        </div>

        {/* Bottom Section: Price */}
        {settings.showPrice && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'baseline',
              flexShrink: 0,
              gap: '2px',
            }}
          >
            <span
              style={{
                fontSize: `${fontSizePrice}px`,
                fontWeight: 'bold',
                color: '#000',
              }}
            >
              {formatPrice(product.price, settings.showTaxIncluded, settings.taxRate)}
            </span>
            {settings.showTaxIncluded && (
              <span
                style={{
                  fontSize: `${fontSizeSmall * 0.8}px`,
                  color: '#666',
                }}
              >
                {taxNote}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

export default LabelPreview;

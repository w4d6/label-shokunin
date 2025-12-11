import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import type { BarcodeFormat } from '~/types/label';
import { getJsBarcodeFormat, validateBarcode } from '~/utils/barcode';

interface BarcodeGeneratorProps {
  value: string;
  format?: BarcodeFormat;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  margin?: number;
  background?: string;
  lineColor?: string;
}

export function BarcodeGenerator({
  value,
  format = 'CODE128',
  width = 2,
  height = 50,
  displayValue = true,
  fontSize = 12,
  margin = 10,
  background = '#ffffff',
  lineColor = '#000000',
}: BarcodeGeneratorProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    const isValid = validateBarcode(value, format);

    if (!isValid) {
      // Show error state for invalid barcode
      svgRef.current.innerHTML = '';
      return;
    }

    try {
      JsBarcode(svgRef.current, value, {
        format: getJsBarcodeFormat(format),
        width,
        height,
        displayValue,
        fontSize,
        margin,
        background,
        lineColor,
        font: 'monospace',
        textAlign: 'center',
        textPosition: 'bottom',
        textMargin: 2,
        valid: () => true,
      });
    } catch (error) {
      console.error('Barcode generation error:', error);
      svgRef.current.innerHTML = '';
    }
  }, [value, format, width, height, displayValue, fontSize, margin, background, lineColor]);

  if (!value) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: height + margin * 2,
          backgroundColor: '#f5f5f5',
          border: '1px dashed #ccc',
          borderRadius: '4px',
          color: '#666',
          fontSize: '12px',
        }}
      >
        バーコード未設定
      </div>
    );
  }

  const isValid = validateBarcode(value, format);

  if (!isValid) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: height + margin * 2,
          backgroundColor: '#fff5f5',
          border: '1px dashed #e53e3e',
          borderRadius: '4px',
          color: '#e53e3e',
          fontSize: '12px',
        }}
      >
        無効なバーコード: {value}
      </div>
    );
  }

  return <svg ref={svgRef} />;
}

export default BarcodeGenerator;

// Japanese localization for Label Shokunin app

export const ja = {
  app: {
    name: 'ラベル職人',
    tagline: '日本のShopifyストア専用バーコードラベル印刷',
  },
  nav: {
    home: 'ホーム',
    products: '商品選択',
    templates: 'テンプレート',
    print: '印刷',
    settings: '設定',
    help: 'ヘルプ',
  },
  home: {
    welcome: 'ラベル職人へようこそ',
    description: '日本語で、かんたんに、美しいバーコードラベルを作成・印刷できます。',
    getStarted: 'ラベル作成を始める',
    features: {
      title: '主な機能',
      japanese: '完全日本語対応',
      japaneseDesc: 'UIからサポートまですべて日本語',
      jan: 'JANコード対応',
      janDesc: '日本の商品コード規格に完全対応',
      printers: '日本製プリンター対応',
      printersDesc: 'サトー、ブラザーなど主要メーカーに対応',
      tax: '消費税表示',
      taxDesc: '税込/税抜、軽減税率(8%)に対応',
    },
    quickActions: {
      title: 'クイックアクション',
      selectProducts: '商品を選択',
      selectProductsDesc: '印刷する商品を選んでください',
      chooseTemplate: 'テンプレート選択',
      chooseTemplateDesc: 'ラベルのデザインを選択',
      printLabels: 'ラベル印刷',
      printLabelsDesc: 'プレビューして印刷',
    },
  },
  products: {
    title: '商品選択',
    description: 'ラベルを印刷する商品を選択してください',
    search: '商品を検索...',
    selectAll: 'すべて選択',
    deselectAll: '選択解除',
    selected: '選択中',
    items: '件',
    noProducts: '商品が見つかりません',
    loadMore: 'さらに読み込む',
    columns: {
      image: '画像',
      product: '商品名',
      sku: 'SKU',
      barcode: 'バーコード',
      price: '価格',
      stock: '在庫',
      quantity: '印刷枚数',
    },
    actions: {
      next: '次へ：テンプレート選択',
      back: '戻る',
    },
  },
  templates: {
    title: 'テンプレート選択',
    description: 'ラベルのデザインテンプレートを選択してください',
    preset: 'プリセット',
    custom: 'カスタム',
    simple: 'シンプル',
    simpleDesc: 'バーコード + 商品名 + 価格',
    detailed: '詳細',
    detailedDesc: 'バーコード + 商品名 + SKU + 価格 + 税表示',
    food: '食品用',
    foodDesc: 'バーコード + 商品名 + 賞味期限 + 価格',
    apparel: 'アパレル用',
    apparelDesc: 'バーコード + 商品名 + サイズ + カラー + 価格',
    shelf: '棚札用',
    shelfDesc: 'バーコード + 商品名 + 価格（大きめ表示）',
    labelSize: 'ラベルサイズ',
    sizes: {
      '40x28': '40mm × 28mm（標準）',
      '60x40': '60mm × 40mm（中）',
      '80x50': '80mm × 50mm（大）',
      '100x50': '100mm × 50mm（棚札）',
      'a4-24': 'A4シート（24面）',
      'a4-65': 'A4シート（65面）',
      'custom': 'カスタムサイズ',
    },
    actions: {
      next: '次へ：プレビュー',
      back: '戻る',
    },
  },
  editor: {
    title: 'ラベルプレビュー',
    description: 'ラベルの内容を確認し、必要に応じて調整してください',
    preview: 'プレビュー',
    settings: '設定',
    elements: '表示項目',
    showPrice: '価格を表示',
    showTaxIncluded: '税込表示',
    taxRate: '消費税率',
    standardTax: '標準税率（10%）',
    reducedTax: '軽減税率（8%）',
    showSku: 'SKUを表示',
    showProductName: '商品名を表示',
    showVariantName: 'バリエーション名を表示',
    showBarcode: 'バーコードを表示',
    barcodeFormat: 'バーコード形式',
    formats: {
      JAN13: 'JAN-13（13桁）',
      JAN8: 'JAN-8（8桁）',
      EAN13: 'EAN-13',
      CODE128: 'Code128',
      QR: 'QRコード',
    },
    actions: {
      print: '印刷する',
      downloadPdf: 'PDFダウンロード',
      back: '戻る',
    },
  },
  print: {
    title: '印刷設定',
    copies: '印刷枚数',
    printer: 'プリンター',
    printers: {
      browser: 'ブラウザ印刷',
      pdf: 'PDF出力',
      sato: 'サトープリンター',
      brother: 'ブラザープリンター',
    },
    paperSize: '用紙サイズ',
    orientation: '向き',
    portrait: '縦',
    landscape: '横',
    printButton: '印刷実行',
    printing: '印刷中...',
    success: '印刷が完了しました',
    error: '印刷中にエラーが発生しました',
  },
  settings: {
    title: '設定',
    general: '一般設定',
    printer: 'プリンター設定',
    defaults: 'デフォルト設定',
    save: '保存',
    saved: '設定を保存しました',
  },
  common: {
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    retry: '再試行',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    edit: '編集',
    close: '閉じる',
    yes: 'はい',
    no: 'いいえ',
    yen: '¥',
    taxIncluded: '（税込）',
    taxExcluded: '（税抜）',
  },
  errors: {
    noProducts: '商品が選択されていません',
    noBarcode: 'バーコードが設定されていません',
    invalidBarcode: '無効なバーコードです',
    printFailed: '印刷に失敗しました',
    loadFailed: 'データの読み込みに失敗しました',
  },
};

export type TranslationKey = keyof typeof ja;

export function t(path: string): string {
  const keys = path.split('.');
  let result: unknown = ja;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path; // Return the path if translation not found
    }
  }

  return typeof result === 'string' ? result : path;
}

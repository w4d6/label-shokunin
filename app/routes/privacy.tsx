import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "プライバシーポリシー | ラベル職人" },
    { name: "description", content: "ラベル職人のプライバシーポリシー" },
  ];
};

export default function Privacy() {
  return (
    <div style={{
      maxWidth: "800px",
      margin: "0 auto",
      padding: "40px 20px",
      fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
      lineHeight: 1.8,
      color: "#333",
    }}>
      <h1 style={{ fontSize: "28px", marginBottom: "30px", borderBottom: "2px solid #4F46E5", paddingBottom: "10px" }}>
        プライバシーポリシー
      </h1>

      <p style={{ marginBottom: "20px", color: "#666" }}>
        最終更新日: 2024年12月11日
      </p>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "15px", color: "#4F46E5" }}>1. はじめに</h2>
        <p>
          ラベル職人（以下「本アプリ」）は、ニッチお助け研究所（以下「当社」）が提供するShopifyアプリです。
          本プライバシーポリシーは、本アプリがどのような情報を収集し、どのように使用するかについて説明します。
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "15px", color: "#4F46E5" }}>2. 収集する情報</h2>
        <p>本アプリは、以下の情報にアクセスします：</p>
        <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
          <li><strong>商品情報</strong>: 商品名、価格、SKU、バーコード（read_products）</li>
          <li><strong>在庫情報</strong>: 在庫数量（read_inventory）</li>
          <li><strong>ロケーション情報</strong>: 店舗・倉庫の場所（read_locations）</li>
        </ul>
        <p style={{ marginTop: "15px" }}>
          これらの情報は、ラベル印刷機能を提供するためにのみ使用されます。
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "15px", color: "#4F46E5" }}>3. 情報の使用目的</h2>
        <p>収集した情報は、以下の目的でのみ使用されます：</p>
        <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
          <li>バーコードラベルの生成・印刷</li>
          <li>商品情報のラベルへの表示</li>
          <li>価格（税込/税抜）の計算と表示</li>
        </ul>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "15px", color: "#4F46E5" }}>4. 情報の保存</h2>
        <p>
          本アプリは、Shopifyのセッション情報のみをサーバーに保存します。
          商品情報やバーコードデータは、サーバーに永続的に保存されません。
          ラベル印刷時のデータは、ブラウザのセッションストレージに一時的に保存され、
          ブラウザを閉じると自動的に削除されます。
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "15px", color: "#4F46E5" }}>5. 第三者への情報提供</h2>
        <p>
          当社は、法律で要求される場合を除き、お客様の情報を第三者に販売、取引、
          またはその他の方法で転送することはありません。
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "15px", color: "#4F46E5" }}>6. データセキュリティ</h2>
        <p>
          本アプリは、HTTPS暗号化通信を使用し、Shopifyの認証システムを通じてのみアクセスされます。
          データは安全に管理されています。
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "15px", color: "#4F46E5" }}>7. アプリのアンインストール</h2>
        <p>
          本アプリをアンインストールすると、当社のサーバーに保存されているすべてのセッションデータは
          自動的に削除されます。
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "15px", color: "#4F46E5" }}>8. お問い合わせ</h2>
        <p>
          プライバシーポリシーに関するご質問は、以下までお問い合わせください：
        </p>
        <p style={{ marginTop: "10px" }}>
          <strong>ニッチお助け研究所</strong><br />
          メール: support@niche-help-lab.com
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "15px", color: "#4F46E5" }}>9. ポリシーの変更</h2>
        <p>
          当社は、必要に応じて本プライバシーポリシーを更新することがあります。
          変更があった場合は、本ページにて通知します。
        </p>
      </section>

      <footer style={{ marginTop: "50px", paddingTop: "20px", borderTop: "1px solid #eee", color: "#666", fontSize: "14px" }}>
        <p>© 2024 ニッチお助け研究所. All rights reserved.</p>
      </footer>
    </div>
  );
}

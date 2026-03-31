# 光田社群圖風格模擬產生器

上傳一張參考圖，AI 自動解析設計風格，產生可匯入美編小助手的 .ktposter 模板。

## 使用方式
1. 輸入 Anthropic API Key
2. 上傳社群圖參考 JPG/PNG
3. 點擊「AI 解析風格」
4. 確認/修改自動帶入的文案
5. 點擊「產生預覽」
6. 匯出 .ktposter 檔案，匯入光田美編小助手繼續編輯

## 技術說明
- 純靜態 HTML，無需後端
- 使用 Claude API（Vision + 生成）
- 輸出格式相容光田美編小助手 v2 schema

## 品牌資源
- 請將光田 Logo 放入 assets/ktgh-logo.png

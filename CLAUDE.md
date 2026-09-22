# 視覺多媒體設計工具站｜開發規範

> 本檔為專案層規範，全域 CI／技術規範詳見 `~/.claude/CLAUDE.md`。

## 專案基本資訊

| 欄位         | 內容                                              |
|--------------|---------------------------------------------------|
| 工具名稱     | 視覺多媒體設計工具站（主站入口）                  |
| GitHub Repo  | `kyoape-ux/kyoape-ux.github.io`                   |
| GitHub Pages | `https://kyoape-ux.github.io/`                    |
| 目前版本     | 確認後填入                                        |

## 此 Repo 內的工具清單

| 檔案 | 工具名稱 | 狀態 |
|------|----------|------|
| `index.html` | 工具站首頁（入口） | 已上線 |
| `youtube-manager.html` | 影片發布資訊管理（標籤、影片、IG、統計） | 已上線 |
| `media-toolkit.html` | 影音小助手（格式轉換、裁切、人臉模糊等） | 已上線 |
| `guide.html` | 使用指南 | 已上線 |
| `光田影音小助手.html` | 影音編輯器 | 已上線 |

## 重要規則

1. **禁止用佔位頁面覆蓋已完成的檔案** — 每個 HTML 都是獨立開發的完整功能，修改前必須先 Read 確認現有內容
2. **修改前先 `git diff`** — 提交前確認變更範圍合理，避免整檔替換
3. **不可在 sync / 整理 commit 中大幅刪減其他檔案** — 只改正在開發的檔案
4. **commit + push 不需詢問** — 修改完直接推送部署

## 防護機制

本專案已啟用 Git pre-commit hook — 若受保護檔案的行數減少超過 30%，commit 會被自動擋下。

## 部署方式

- GitHub Pages（從 `main` 分支根目錄部署）
- 推送到 `main` 即自動部署

## 影片長度（dur）修正（2026-09-21）
- 原因：網頁輸入「3:25」寫進試算表時被自動轉成時間；後端 `fmtCell` 把所有日期格式轉成 yyyy-MM-dd，時長變「1899-12-30」，再被前端存回後原值遺失。
- 後端 GAS（光田影片管理系統 後端，部署 AKfycbxDla5… 第 17 版）：`fmtCell(v, h)` 對 `dur`／`yt_avgdur` 換算回「分:秒」，只剩日期（00:00:00）的壞資料回傳空白；`buildRow` 寫入時長時前面加 `'` 強制文字。線上 Code.gs 與本機 files/apps-script-youtube-module.js 不同，以線上為準。
- 前端 `batchUpdateYt` 改抓 `statistics,contentDetails`，順便以 YouTube 長度覆寫 `dur`；`normalizeDur` 遇到 1899/1900 日期回傳空白。已執行一次，96 部有 YT 連結的影片長度全部補回。無 YT 連結的影片（16 部）長度仍需手填。
- 2026-09-22：GAS 第 18 版加唯讀 `ytChannel`（頻道訂閱數）、第 19 版加唯讀 `getSocialSummary`（給行銷中心社群總覽，說明見 社群總覽數字_給行銷中心.md 第五節）。改 GAS 請保留這兩個 action。

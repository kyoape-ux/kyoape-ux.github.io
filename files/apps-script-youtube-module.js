// ============================================================
// 光田醫院工具站 Apps Script Web App
// 模組：youtube（影片管理 — YouTube / Facebook / Instagram）
//
// 使用方式：
// 1. 開啟 Google Sheets → 擴充功能 → Apps Script
// 2. 貼上此程式碼（若已有其他程式碼，合併 doGet/doPost 的 if 判斷區塊）
// 3. 將 SHEET_ID 替換為實際的 Google Sheets ID
// 4. 部署 → 新增部署 → 類型：網頁應用程式
//    - 執行身分：我
//    - 存取權：所有人
// 5. 複製部署後的 Web App URL，貼到影片管理系統的設定頁
// ============================================================

const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // ← 替換為實際 Sheet ID
const YT_SHEET = 'yt_videos';
const CFG_SHEET = 'yt_config';

// ── 欄位定義（與前端對應）─────────────────────────────────
const VIDEO_HEADERS = [
  'id','title','date','type','cat','planner','producer','dur',
  // YouTube
  'yt_url','yt_views','yt_likes','yt_comments','yt_imp','yt_ctr','yt_ratio','yt_avgdur',
  // Facebook
  'fb_url','fb_views','fb_likes','fb_comments','fb_shares','fb_reach',
  // Instagram
  'ig_url','ig_views','ig_likes','ig_comments','ig_shares','ig_reach',
  // Meta
  'note','createdAt','updatedAt'
];

function doGet(e) {
  const action = e.parameter.action || '';
  const module = e.parameter.module || '';

  try {
    if (module === 'youtube') {
      if (action === 'getVideos') return jsonRes(getVideos());
      if (action === 'getConfig') return jsonRes(getYtConfig());
    }
    // ← 其他模組的 doGet 判斷請加在這裡
    return jsonRes({ error: 'Unknown action' });
  } catch(err) {
    return jsonRes({ error: err.message });
  }
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents || '{}');
  const action = body.action || '';
  const module = body.module || '';

  try {
    if (module === 'youtube') {
      if (action === 'saveVideo')   return jsonRes(saveVideo(body.data));
      if (action === 'updateVideo') return jsonRes(updateVideo(body.data));
      if (action === 'deleteVideo') return jsonRes(deleteVideo(body.id));
      if (action === 'saveConfig')  return jsonRes(saveYtConfig(body.data));
    }
    // ← 其他模組的 doPost 判斷請加在這裡
    return jsonRes({ error: 'Unknown action' });
  } catch(err) {
    return jsonRes({ error: err.message });
  }
}

// ── 影片 CRUD ──────────────────────────────────────────────

function getVideos() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(YT_SHEET);
  if (!sh) return { videos: [] };
  const rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return { videos: [] };
  const headers = rows[0];
  const videos = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
  return { videos };
}

function saveVideo(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(YT_SHEET);
  if (!sh) {
    sh = ss.insertSheet(YT_SHEET);
    sh.appendRow(VIDEO_HEADERS);
  }
  const now = new Date().toISOString();
  const id = data.id || (Date.now().toString(36) + Math.random().toString(36).slice(2,6));
  const row = VIDEO_HEADERS.map(h => {
    if (h === 'id') return id;
    if (h === 'createdAt') return data.createdAt || now;
    if (h === 'updatedAt') return now;
    return data[h] || '';
  });
  sh.appendRow(row);
  return { success: true, id };
}

function updateVideo(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(YT_SHEET);
  if (!sh) return { success: false, error: 'Sheet not found' };
  const rows = sh.getDataRange().getValues();
  const headers = rows[0];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      const now = new Date().toISOString();
      const newRow = VIDEO_HEADERS.map(h => {
        if (h === 'createdAt') return rows[i][headers.indexOf('createdAt')] || '';
        if (h === 'updatedAt') return now;
        return data[h] !== undefined ? data[h] : '';
      });
      sh.getRange(i+1, 1, 1, VIDEO_HEADERS.length).setValues([newRow]);
      return { success: true };
    }
  }
  return { success: false, error: 'ID not found' };
}

function deleteVideo(id) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(YT_SHEET);
  if (!sh) return { success: false };
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) { sh.deleteRow(i+1); return { success: true }; }
  }
  return { success: false, error: 'ID not found' };
}

// ── 設定 ────────────────────────────────────────────────────

function getYtConfig() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(CFG_SHEET);
  if (!sh) return { viewGoal:5000, countGoal:6, personalGoal:2000 };
  const rows = sh.getDataRange().getValues();
  const cfg = {};
  rows.forEach(r => { if(r[0]) cfg[r[0]] = Number(r[1]) || r[1]; });
  return cfg;
}

function saveYtConfig(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(CFG_SHEET);
  if (!sh) { sh = ss.insertSheet(CFG_SHEET); }
  sh.clearContents();
  Object.entries(data).forEach(([k,v]) => sh.appendRow([k, v]));
  return { success: true };
}

// ── 工具函式 ────────────────────────────────────────────────

function jsonRes(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

#!/bin/bash
# ============================================================
# 光田影音小助手 — 一鍵部署 CI/CD 設定
# 執行方式: bash setup-cicd.sh
# ============================================================
set -e

OWNER="kyoape-ux"
REPO="kuangtien-video-tool"
API="https://api.github.com/repos/$OWNER/$REPO/contents"
DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "================================================"
echo "  光田影音小助手 — CI/CD 一鍵設定"
echo "================================================"
echo ""
echo "需要一個具備 'repo' + 'workflow' scope 的 GitHub Token。"
echo "建立步驟（30 秒）："
echo "  1. 開啟 https://github.com/settings/tokens/new"
echo "  2. Note: 隨意填 (如 kuangtien-cicd)"
echo "  3. Expiration: 90 days"
echo "  4. 勾選: repo ✓  workflow ✓"
echo "  5. 點 Generate token，複製 token"
echo ""
read -rsp "請貼上 token（輸入不顯示）: " TOKEN
echo ""

if [ -z "$TOKEN" ]; then
  echo "❌ 未輸入 token，已取消。"
  exit 1
fi

# ---- helper: push one file via GitHub API ----
push_file() {
  local api_path="$1"
  local local_file="$2"
  local commit_msg="$3"

  # Get existing SHA (if file already exists)
  SHA=$(curl -s \
    -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "$API/$api_path" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sha',''))" 2>/dev/null || true)

  CONTENT=$(base64 -i "$local_file" 2>/dev/null || base64 "$local_file")

  if [ -n "$SHA" ]; then
    BODY="{\"message\":\"$commit_msg\",\"content\":\"$CONTENT\",\"sha\":\"$SHA\"}"
  else
    BODY="{\"message\":\"$commit_msg\",\"content\":\"$CONTENT\"}"
  fi

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X PUT \
    -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    -H "Content-Type: application/json" \
    "$API/$api_path" \
    -d "$BODY")

  if [ "$STATUS" = "200" ] || [ "$STATUS" = "201" ]; then
    echo "  ✅ $api_path"
  else
    echo "  ❌ $api_path (HTTP $STATUS)"
    exit 1
  fi
}

echo ""
echo "▶ 推送 GitHub Actions workflow 檔案..."
push_file ".github/workflows/pages.yml"  "$DIR/.github/workflows/pages.yml"  "ci: add GitHub Pages deployment workflow"
push_file ".github/workflows/release.yml" "$DIR/.github/workflows/release.yml" "ci: add Electron release build workflow"

echo ""
echo "▶ 設定 GitHub Pages (gh-pages 分支)..."
curl -s -o /dev/null -w "  Pages: HTTP %{http_code}\n" \
  -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$OWNER/$REPO/pages" \
  -d '{"source":{"branch":"gh-pages","path":"/"}}'

echo ""
echo "================================================"
echo "  設定完成！"
echo ""
echo "  🌐 網頁版："
echo "     https://$OWNER.github.io/$REPO/"
echo ""
echo "  🖥️  發布桌機版（產生 .dmg + .exe）："
echo "     在終端機執行："
echo "     git tag v1.0.0 && git push origin v1.0.0"
echo ""
echo "     GitHub Actions 會自動建置並掛到 Release 頁面："
echo "     https://github.com/$OWNER/$REPO/releases"
echo "================================================"
echo ""

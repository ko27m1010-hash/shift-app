// ============================================================
// GAS Webhook受信スクリプト（スマホWebアプリ → スプレッドシート連携）
// スプレッドシートの「拡張機能」→「Apps Script」に追加してください
// デプロイ: 「デプロイ」→「新しいデプロイ」→「Webアプリ」
//          アクセス権限: 「全員」に設定してURLをコピーしてください
// ============================================================

/**
 * POSTリクエスト受信（スマホアプリからのシフト希望データ）
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // シートを取得または作成
    var sheetName = "シフト希望回答";
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // ヘッダー行
      sheet.appendRow([
        "タイムスタンプ", "お名前", "対象月",
        "出勤パターン", "出勤可能日", "希望時間帯",
        "連絡先メール", "特記事項"
      ]);
      sheet.getRange(1,1,1,8).setFontWeight("bold")
           .setBackground("#2D6A4F").setFontColor("#ffffff");
    }
    
    // データ追記
    sheet.appendRow([
      new Date().toLocaleString("ja-JP"),
      data.name    || "",
      data.month   || "",
      data.pattern || "",
      (data.dates  || []).join(", "),
      data.timeband|| "",
      data.email   || "",
      data.note    || ""
    ]);
    
    // ★ LINEへの通知（任意）- LINE Notify Tokenがある場合は設定
    // notifyLine(data.name + "さんがシフト希望を提出しました（" + data.month + "）");
    
    return ContentService
      .createTextOutput(JSON.stringify({status:"ok", message:"提出完了"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({status:"error", message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GETリクエスト（疎通確認用）
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status:"ok", message:"シフト希望管理システム稼働中"}))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * LINE Notify通知（任意）
 */
function notifyLine(message) {
  var TOKEN = "★ここにLINE NotifyのTokenを貼り付け★";
  if (!TOKEN || TOKEN.indexOf("★") >= 0) return;
  UrlFetchApp.fetch("https://notify-api.line.me/api/notify", {
    method: "post",
    headers: { "Authorization": "Bearer " + TOKEN },
    payload: { message: "\n[シフト希望通知]\n" + message }
  });
}

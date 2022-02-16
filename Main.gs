const mss = SpreadsheetApp.getActiveSpreadsheet();
const mssId =mss.getId();

//基本設定を登録するシート
const fss = mss.getSheetByName("基本設定");
//サーバー代わりにするシート
const server = mss.getSheetByName('サーバー');
//イベントごとの設定を登録するシート
const ss = mss.getSheetByName('イベント項目設定');
//エントリー者を名前順に並び替えたシート
const entry_sort = mss.getSheetByName('ソート');

//学年
var th = Number(fss.getRange("B2").getValues());
//イベントの設定読み取り
var eventSets = ss.getRange(2,2,9).getValues();
var eventSetList = create_array(eventSets);

//イベント名
var title = eventSetList[0];
//全員第1希だけか
var all_first = eventSetList[8];
//参加できるジャンルの数
var junreMax = eventSetList[7];
//第何希望まで聞くか（最大5）
var hearJunreNum = eventSetList[8];
if(!(Number.isInteger(parseInt(hearJunreNum))) || (Number.isInteger(parseInt(hearJunreNum)))>5){
    hearJunreNum = 5;
}
//聞きたいダンスの名前や、グループの名前など
var unison_types = ss.getRange("B13:F13").getValues();
var opJunreName = ss.getRange("B15:K16").getValues();
var junreName = ss.getRange("B18:K19").getValues();
var opJunreList = create_array(opJunreName);
var unisonList = create_array(unison_types);
var junreList = create_array(junreName); 

//エントリーフォーム作成時確認
function entryStart(){
  var alert = Browser.msgBox("エントリーフォームを作成しますか？", Browser.Buttons.OK_CANCEL);
    if (alert == 'ok') {
      var choice_col = createEntryForm();
      createEntryInfo(choice_col);
    }
    if (alert == 'cancel') {
      Browser.msgBox("キャンセルしました");
  }
}

//メンバー決定フォーム作成時確認
function decision_member() {
  var alert = Browser.msgBox("メンバー振り分けの準備を始めますか？", Browser.Buttons.OK_CANCEL);
    if (alert == 'ok') {
      setupFirstDecisionForm();
    }
    if (alert == 'cancel') {
      Browser.msgBox("キャンセルしました");
  }
}

//エントリーフォームから1次フォームに振り分け開始
function decision_member_2() {
  var alert = Browser.msgBox("エントリーフォームの回答から第1次メンバー決定フォームの作成を開始しますか？", Browser.Buttons.OK_CANCEL);
    if (alert == 'ok') {
      sortFirstDecisionForm();
    }
    if (alert == 'cancel') {
      Browser.msgBox("キャンセルしました");
  }
}

//メンバー決定フォームから振り分け
function decision_member_3() {
  var alert = Browser.msgBox("メンバー決定フォームの回答から振り分けを開始しますか？", Browser.Buttons.OK_CANCEL);
    if (alert == 'ok') {
      runSortNextDecisionForm();
    }
    if (alert == 'cancel') {
      Browser.msgBox("キャンセルしました");
  }
}

//振り分け前に戻る
function decision_member_reset() {
  var alert = Browser.msgBox("振り分け前に戻しますか？", Browser.Buttons.OK_CANCEL);
    if (alert == 'ok') {
      resetDecision();
    }
    if (alert == 'cancel') {
      Browser.msgBox("キャンセルしました");
  }
}

//次の振り分け準備
function decision_member_4() {
  var alert = Browser.msgBox("次の振り分けの準備を始めますか？", Browser.Buttons.OK_CANCEL);
    if (alert == 'ok') {
      setupNextDecision();
    }
    if (alert == 'cancel') {
      Browser.msgBox("キャンセルしました");
  }
}

//振り分け終了
function decision_member_end() {
  var alert = Browser.msgBox("振り分けを終了しますか？", Browser.Buttons.OK_CANCEL);
    if (alert == 'ok') {
      endDecisionMember();
    }
    if (alert == 'cancel') {
      Browser.msgBox("キャンセルしました");
  }
}

//pdf作成時確認
function create_pdf_start() {
  var alert = Browser.msgBox("メンバー一覧pdfを全ジャンル出力しますか？", Browser.Buttons.OK_CANCEL);
    if (alert == 'ok') {
      create_pdf();
    }
    if (alert == 'cancel') {
      Browser.msgBox("キャンセルしました");
  }
}


//スプシから取得した2次元配列を1次元配列に変える
function create_array(twoDimentionList) {
  var list = [];
  for(var k=0;k<twoDimentionList.length;k++){
    for(var i=0;i<twoDimentionList[0].length;i++){
      if(twoDimentionList[k][i] != "" ){
        list.push(twoDimentionList[k][i]);
      }
    }
  }
  return list;
  
}

//1次元配列を2次元配列に変える
function create_horizonArray(list) {
  var array =[[]];
  list.forEach(e => array[0].push(e));

  return array;
}

//親ファイルに指定のファイルを移動する
function move_parentsFile(file) {
  var folder = DriveApp.getFolderById(DriveApp.getFileById(mssId).getParents().next().getId());
  const formFile = DriveApp.getFileById(file.getId()).moveTo(folder);

}

//親ファイルにファイル作成
function create_parentsFile(name) {
  var folder = DriveApp.getFolderById(DriveApp.getFileById(mssId).getParents().next().getId()).createFolder(name);

  return folder;
}

//ファイルを指定のフォルダーに移動する
function move_file(file, folder){
  const formFile = DriveApp.getFileById(file.getId()).moveTo(folder);

}

//縦列アルファベット取得
function getColumnFromIndex(index) {
  var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  var column = ""
  while (index > 0) {
    var digit = (index - 1) % alphabet.length;
    column = alphabet[digit] + column;
    index = (index - 1 - digit) / alphabet.length;
  } 
  return column;
}

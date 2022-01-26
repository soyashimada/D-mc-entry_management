//スプレッドシート取得
const mss = SpreadsheetApp.getActiveSpreadsheet();
const mssId =mss.getId();
const fss = mss.getSheetByName("基本設定");
const server = mss.getSheetByName('サーバー');
const ss = mss.getSheetByName('イベント項目設定');
const entry_sort = mss.getSheetByName('ソート');

var th = Number(fss.getRange("B2").getValues());
var eventSets = ss.getRange(2,2,9).getValues();
var eventSetList = create_array(eventSets);
var title = eventSetList[0];
var all_first = eventSetList[8];
var junreMax = eventSetList[7];
var hearJunreNum = eventSetList[8];
if(!(Number.isInteger(parseInt(hearJunreNum))) || (Number.isInteger(parseInt(hearJunreNum)))>5){
    hearJunreNum = 5;
}

var unison_types = ss.getRange("B13:F13").getValues();
var opJunreName = ss.getRange("B15:K16").getValues();
var junreName = ss.getRange("B18:K19").getValues();
//OPジャンル配列作成
var opJunreList = create_array(opJunreName);
//ユニゾン配列作成
var unisonList = create_array(unison_types);
//ジャンル配列作成
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

//振付コマ生決定フォーム作成時確認
function decision_member() {
  var alert = Browser.msgBox("コマ生振り分けの準備を始めますか？", Browser.Buttons.OK_CANCEL);
    if (alert == 'ok') {
      setupFirstDecisionForm();
    }
    if (alert == 'cancel') {
      Browser.msgBox("キャンセルしました");
  }
}

//エントリーフォームから1次フォームに振り分け開始
function decision_member_2() {
  var alert = Browser.msgBox("エントリーフォームの回答から第1次コマ生決定フォームの作成を開始しますか？", Browser.Buttons.OK_CANCEL);
    if (alert == 'ok') {
      sortFirstDecisionForm();
    }
    if (alert == 'cancel') {
      Browser.msgBox("キャンセルしました");
  }
}

//コマ生決定フォームから振り分け
function decision_member_3() {
  var alert = Browser.msgBox("コマ生決定フォームの回答から振り分けを開始しますか？", Browser.Buttons.OK_CANCEL);
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
  var alert = Browser.msgBox("コマ生一覧pdfを全ジャンル出力しますか？", Browser.Buttons.OK_CANCEL);
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

function move_parentsFile(file) {
  var folder = DriveApp.getFolderById(DriveApp.getFileById(mssId).getParents().next().getId());
  const formFile = DriveApp.getFileById(file.getId()).moveTo(folder);

}

function create_parentsFile(name) {
  var folder = DriveApp.getFolderById(DriveApp.getFileById(mssId).getParents().next().getId()).createFolder(name);

  return folder;
}

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
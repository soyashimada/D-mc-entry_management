
function createEntryForm() {
  //エントリーフォーム作成初期値取得
  var op = eventSetList[1];
  var unison = eventSetList[2];
  var selection = eventSetList[3];
  var sp = eventSetList[4];
  var hoodie = eventSetList[5];
  
  //希望ジャンルが表示される列番号を格納　→　フォームによって変動するので厄介だから
  var choice_col = 6; 

  //フォーム作成
  var form = FormApp.create(title + " エントリーフォーム");
  move_parentsFile(form);
  
  form.setAcceptingResponses(false);
  form.setAllowResponseEdits(true);
  form.setConfirmationMessage("エントリー入力完了しました。間違えた場合は再度回答してください。")
  form.setDestination(FormApp.DestinationType.SPREADSHEET,mssId);


  //タイトル
  form.setTitle(title + " エントリーフォーム");

  //名前
  var name_validation = FormApp.createTextValidation().requireTextContainsPattern("^[^　| ]*$").build();
  var q_name = form.addTextItem();
  q_name.setTitle("名前(漢字) ※姓名間に空白無し");
  q_name.setRequired(true);
  q_name.setValidation(name_validation);

  var q_name_hira = form.addTextItem();
  q_name_hira.setTitle("名前(ひらがな) ※姓名間に空白無し");
  q_name_hira.setRequired(true);
  q_name_hira.setValidation(name_validation);

  //代
  var q_th = form.addMultipleChoiceItem();
  q_th.setTitle("自分の代");
  q_th.setChoiceValues([th +"th",th+1 + "th",th+2 + "th","振付"]);
  q_th.setRequired(true);

  //LINE名
  var q_Linename = form.addTextItem();
  q_Linename.setTitle("現在のLINE名");
  q_Linename.setRequired(true);

  //OP
  if(op == "あり"){
    choice_col++;
    var q_op = form.addMultipleChoiceItem();
    q_op.setTitle("OP参加希望");
    q_op.setChoiceValues(["希望する","希望しない"]);
    q_op.setRequired(true);
    q_op.setChoiceValues(opJunreList);
  }

  //ユニゾン
  if(unison == "あり"){
    choice_col++;
    var q_unison = form.addCheckboxItem();
    q_unison.setTitle("ユニソン参加希望").setChoiceValues([unisonList]);

  }

  //大会選抜
  if(selection == "あり"){
    choice_col++;
    var q_selection = form.addMultipleChoiceItem();
    q_selection.setTitle("選抜オーディション参加希望");
    q_selection.setChoiceValues(["希望する","希望しない"]);
    q_selection.setRequired(true);
  }

  //SP 
  if(sp == "あり"){
    choice_col++;
    var q_selection = form.addTextItem();
    q_selection.setTitle("SP推薦");
    q_selection.setHelpText("推薦者を書いてください。")
  }

  //パーカー
  if(hoodie == "あり"){
    choice_col++;
    var q_hoodie = form.addMultipleChoiceItem();
    q_hoodie.setTitle("公演パーカー");
    q_hoodie.setChoiceValues(["S","M","L","XL","XXL","XXL"]);
  }

  //参加ジャンル数
  if(junreMax > 1){
    choice_col++;
    var junreNums = [];
    for(var i=0;i<=junreMax;i++){
      junreNums.push(i);
    }
    var q_junreNum = form.addListItem();
    q_junreNum.setTitle("希望参加ジャンル数 (最大"+junreMax+"つ)");
    q_junreNum.setChoiceValues(junreNums);
    q_junreNum.setRequired(true);
  }


  //ジャンル
  var enth_validation = FormApp.createTextValidation().requireTextLengthLessThanOrEqualTo(200).build();
  
  for(var i=1;i<hearJunreNum+1;i++){
    let page = form.addPageBreakItem().setTitle("第"+i+"希望ジャンル");
    let q_junre = form.addMultipleChoiceItem();

    q_junre.setTitle("第"+i+"希望ジャンル");
    q_junre.setChoiceValues(junreList);
    q_junre.setRequired(true);

    let q_enth = form.addTextItem();
    q_enth.setTitle("意気込みなど 200文字以内");
    q_enth.setValidation(enth_validation);
  }

  //フォーム繁栄シート名を変更する
  SpreadsheetApp.flush();
  var sheets = mss.getSheets();
  for(var i=0;i<sheets.length;i++){
    var name = sheets[i].getName();
    if(name.indexOf('フォームの回答') != -1 && name.indexOf(title + " エントリーフォーム") == -1){
      var sheetName = title + " エントリーフォーム" +name.substr(8);
      sheets[i].setName(sheetName);
      break;
    }
  }
  Browser.msgBox("作成しました");

  server.getRange("B2").setValue(choice_col);
  return [choice_col,sheetName];
}

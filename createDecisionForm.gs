
//名簿シートの参加ジャンル数が書かれている列番号
  const joinNums_col = 5;

/*
  第1次コマ生決定フォーム作成、振り分け準備関数
*/
function setupFirstDecisionForm() {
  var Properties = PropertiesService.getScriptProperties();
  var sortStatus = parseInt(Properties.getProperty("sortStatus"));
  
  if(isNaN(sortStatus)){
    const rule = SpreadsheetApp.newDataValidation().requireValueInList(junreList).build();
    const dm_ss = mss.getSheetByName('エントリー振り分け');
    const nlss = mss.getSheetByName('名簿');
    const junre_nlss = mss.getSheetByName('ジャンル別名簿');

    
    //名簿シートの最終行
    var lastRow = nlss.getLastRow();
    //エントリー振り分けの最終行
    var dm_ss_lastCol = dm_ss.getLastColumn();

    //フォーム作成
    var idList = [];
    var folder1 = create_parentsFile("1次コマ生決定フォーム");
    var folder2 = create_parentsFile("2次コマ生決定フォーム");
    var formList = {};
    for(var i=0;i<junreList.length;i++){
      formList[junreList[i]] = FormApp.create(junreList[i] + "　1次コマ生決定フォーム")
          .setTitle(junreList[i] + "　1次コマ生決定フォーム")
          .setAllowResponseEdits(true)
          .setConfirmationMessage("フォームを送信しました。");
      //フォルダに移動
      move_file(formList[junreList[i]],folder1);

      var secondform = FormApp.create(junreList[i] + "　2次コマ生決定フォーム")
          .setTitle(junreList[i] + "　2次コマ生決定フォーム")
          .setAllowResponseEdits(true)
          .setConfirmationMessage("フォームを送信しました。");
      //フォルダに移動
      move_file(secondform,folder2);

      ScriptApp.newTrigger("recordresp")
                .forForm(formList[junreList[i]])
                .onFormSubmit()
                .create();

      idList.push([junreList[i],formList[junreList[i]].getId(),secondform.getId()]);
      Properties.setProperty(junreList[i],formList[junreList[i]].getId());
    }
    Properties.setProperty("idList",JSON.stringify(idList));

    //エントリー振り分けシートのリセット
    dm_ss.getRange(3,2,1,dm_ss_lastCol).clearContent();
    dm_ss.getRange(3,2,1,junreList.length).setValues(create_horizonArray(junreList));

    //名簿シートのリセット
    nlss.getRange(2,joinNums_col,lastRow-1,3).clearContent();

    //ジャンル別名簿の検索欄
    junre_nlss.getRange("A2").setDataValidation(rule);

    Properties.setProperty("sortStatus",1);
    Browser.msgBox( "振り分け準備を終了しました。", Browser.Buttons.OK);
  }else{
    Browser.msgBox( "前回の振り分けを終了してください", Browser.Buttons.OK);
  }
}

/*
  第1次コマ生決定フォーム　振り分け関数
*/
function sortFirstDecisionForm() {
  var Properties = PropertiesService.getScriptProperties();
  var sortStatus = parseInt(Properties.getProperty("sortStatus"));

  if(sortStatus == 1){
    var status = parseInt(Properties.getProperty("status"));
    var sttime = new Date();

    var lastRow = entry_sort.getLastRow(); 
    var choice_col = server.getRange("B2").getValue();
    var name_array = entry_sort.getRange(2,2,lastRow-1,2).getValues();
    var choice_array = entry_sort.getRange(2,choice_col,lastRow-1,hearJunreNum*2).getValues();
    var nameAndChoice_array = [];

    if(junreMax > 1){
      var wishJoinNum_array = entry_sort.getRange(2,choice_col-1,lastRow-1,1).getValues();
      for(var i=0; i<name_array.length;i++){
        nameAndChoice_array[i] = name_array[i].concat(choice_array[i]);
        nameAndChoice_array[i] = nameAndChoice_array[i].concat(wishJoinNum_array[i]);
      }
    }else{
      for(var i=0; i<name_array.length;i++){
        nameAndChoice_array[i] = name_array[i].concat(choice_array[i]);
      }
    }
    
    if(status != 1){
      var formList = {};
      var idList = JSON.parse(Properties.getProperty("idList"));
      for(var i=0;i<junreList.length;i++){
        formList[junreList[i]] = FormApp.openById(Properties.getProperty(junreList[i]));
      } 
      var i=0;

    }else if(status == 1){
      var formList = {};
      var idList = JSON.parse(Properties.getProperty("idList"));

      for(var i=0;i<junreList.length;i++){
        formList[junreList[i]] = FormApp.openById(Properties.getProperty(junreList[i]));
      } 
      i = parseInt(Properties.getProperty("i"));
      k = parseInt(Properties.getProperty("k"));
    }

    for(i;i<(junreMax*2);i+=2){
      console.log("i="+i);
      if(status != 1){
        var k=0;
      }else if(status == 1){
        status = 0;
      }
      for(k;k<nameAndChoice_array.length;k++){
        console.log("k="+k)
        var nowtime = new Date();
        var nowdiff = parseInt((nowtime.getTime()-sttime.getTime())/(1000*60));

        //6分を超えていたら中断処理（4分を指定）
        if(nowdiff >= 4){
          if(parseInt(Properties.getProperty("trigger")) == 1){
            var properties = {status: 1,trigger: 0,i: i,k: k};
            Properties.setProperty("idList",JSON.stringify(idList));
            Properties.setProperties(properties);
            deleteTrigger("trigger");
            Browser.msgBox( "もう一度実行してください", Browser.Buttons.OK);
            return;
          }else{
            var properties = {status: 1,trigger: 1,i: i,k: k};
            Properties.setProperty("idList",JSON.stringify(idList));
            Properties.setProperties(properties);
            setTrigger("trigger", "sortFirstDecisionForm");
            return;
          }         
        }
        for(var t=0;t<junreList.length;t++){
          if(nameAndChoice_array[k][i+2] == junreList[t]){
            if(i==0){
              var q_decision = formList[junreList[t]].addMultipleChoiceItem();
              q_decision.setTitle("第1希望 - " + nameAndChoice_array[k][0] + " / " + nameAndChoice_array[k][1])
                .setHelpText("意気込み : " + nameAndChoice_array[k][i+3])
                .setChoiceValues(["コマ生にする","保留","落とす"])
                .setRequired(true);
              idList[t].push(k);
            }else if(i>0){
              var wn = i/2+1;
              if(nameAndChoice_array[k][hearJunreNum*2+2] >= wn){ 
                var q_decision = formList[junreList[t]].addMultipleChoiceItem();
                q_decision.setTitle("第" + wn + "希望 - " + nameAndChoice_array[k][0] + " / " + nameAndChoice_array[k][1])
                  .setHelpText("意気込み : " + nameAndChoice_array[k][i+3])
                  .setChoiceValues(["コマ生にする","保留","落とす"])
                  .setRequired(true);
                idList[t].push(k);
              }
            }        
          }
        }
      }
    }
    
    for(var i=0;i<idList.length;i++){
      server.appendRow(idList[i]);
    }
     //フォームのURL表作成
    var lastRow_server = server.getLastRow()-2;
    var idLists = server.getRange(3,1,lastRow_server,3).getValues();
    urltableCreate(idLists);

    deleteTrigger("trigger");
    Properties.deleteProperty("status");
    Properties.deleteProperty("trigger");
    Properties.deleteProperty("i");
    Properties.deleteProperty("k");
    Properties.deleteProperty("idList");

    Properties.setProperty("sortStatus",2);
    Browser.msgBox( "第1次コマ生決定フォームを作成しました。振付にURLを共有してください。", Browser.Buttons.OK);
  }else{
    Browser.msgBox( "振り分けが開始されていないか、順番が間違っています。", Browser.Buttons.OK);
  }
  
}
/*
  第2次以降コマ生振り分け実行関数
*/
function runSortNextDecisionForm(){
  var Properties = PropertiesService.getScriptProperties();
  var sortStatus = parseInt(Properties.getProperty("sortStatus"));
  if(sortStatus == 2){
    var status = parseInt(Properties.getProperty("status"));
    var sttime = new Date();
    
    console.log("ok1");
    if(status != 1){
      const nlss = mss.getSheetByName('名簿');
      const backup = mss.getSheetByName("バックアップ");
      var lastRow_server = server.getLastRow()-2;
      var lastCol = server.getLastColumn();
      var idLists = server.getRange(3,1,lastRow_server,lastCol).getValues();
      var lastRow_nlss = nlss.getLastRow();
      //名簿シートの参加数、落選数、参加ジャンル数
      var decisionStatuses = nlss.getRange(2,joinNums_col,lastRow_nlss-1,3).getValues();

      //バックアップ
      backup.clear();
      backup.getRange(1,1,lastRow_server,lastCol).setValues(idLists);
      //名簿シートのバックアップ
      backup.getRange(lastRow_server+1,1,lastRow_nlss-1,3).setValues(decisionStatuses);


      var formidLists = server.getRange(3,2,lastRow_server,1).getValues().flat();
      var i=0;
    }else if(status == 1){
      var formidLists = JSON.parse(Properties.getProperty("formidLists")).flat();
      var i = parseInt(Properties.getProperty("i"));
    }
    
    for(i; i<formidLists.length; i++){
      var nowtime = new Date();
      var nowdiff = parseInt((nowtime.getTime()-sttime.getTime())/(1000*60));
      //6分を超えていたら中断処理（5分を指定）
      if(nowdiff >= 4){
        var properties = {status: 1,i: i};
        Properties.setProperty("formidLists",JSON.stringify(formidLists));
        Properties.setProperties(properties);
        return;
      }
      console.log("ok2");
      sortNextDecision(formidLists[i]);
    }

    Properties.deleteProperty("status");
    Properties.deleteProperty("i");
    Properties.deleteProperty("formidLists");

    Properties.setProperty("sortStatus",3);
    Browser.msgBox( "コマ生決定フォームを更新しました。振付にURLを共有してください。", Browser.Buttons.OK);
  }else{
    Browser.msgBox( "振り分けが開始されていないか、順番が間違っています。", Browser.Buttons.OK);
  }

  
}

/*
  第2次以降コマ生決定フォーム読み込み、振り分け関数(ジャンルごと)
*/
function sortNextDecision(formId) {
  const nlss = mss.getSheetByName('名簿');

  //フォームのジャンル部分と希望数
  var lastRow_sort = entry_sort.getLastRow(); 
  var choice_col = server.getRange("B2").getValue();
  var name_array = entry_sort.getRange(2,2,lastRow_sort-1,2).getValues();
  var choice_array = entry_sort.getRange(2,choice_col,lastRow_sort-1,hearJunreNum*2).getValues();
  var nameAndChoice_array = [];
  console.log("ok3");

  if(junreMax > 1){
    var wishJoinNum_array = entry_sort.getRange(2,choice_col-1,lastRow_sort-1,1).getValues();
    for(var i=0; i<name_array.length;i++){
      nameAndChoice_array[i] = name_array[i].concat(choice_array[i]);
      nameAndChoice_array[i] = nameAndChoice_array[i].concat(wishJoinNum_array[i]);
    }
  }else{
    for(var i=0; i<name_array.length;i++){
      nameAndChoice_array[i] = name_array[i].concat(choice_array[i]);
    }
  }

  //サーバーの個人IDリストの最終列
  var lastCol = server.getLastColumn();
  //サーバーの個人IDリストの最終行
  var lastRow_server = server.getLastRow()-2;
  //サーバーのフォームごとのフォームIDリスト
  var idLists = server.getRange(3,1,lastRow_server,3).getValues();

  //振り分け終了判定
  if(server.getRange(3,4,lastRow_server,4).isBlank()){
    Browser.msgBox( "振り分けが終了したので振分終了を押してください。", Browser.Buttons.OK);
  }

  //サーバーのフォームごとの個人IDリスト
  var name_idLists = server.getRange(3,4,lastRow_server,lastCol-3).getValues();
    //空白削除
  for(var i=0;i<name_idLists.length;i++){
    name_idLists[i] = name_idLists[i].filter(Number.isFinite);
  }
  //名簿シートの最終行
  var lastRow_nlss = nlss.getLastRow();
  //名簿シートの参加数、落選数、参加ジャンル数
  var decisionStatuses = nlss.getRange(2,joinNums_col,lastRow_nlss-1,3).getValues();

  //トリガーのIDから繋がってるフォームやジャンルを算出
  for(var i=0;i<idLists.length;i++){
    if(idLists[i][1] == formId){
      var decisionForm = FormApp.openById(idLists[i][1]);
      var secondDecisionForm = FormApp.openById(idLists[i][2]);
      var name_idList = name_idLists[i];
      var junre = idLists[i][0];
     
      var server_row = i;
      break;
    }
  }
  console.log("ok4");
  //フォームの回答を取得
  var formResps = decisionForm.getResponses();
  var formResp = formResps[formResps.length-1];
  var itemResp = formResp.getItemResponses();
 
  var new_idLists = [junre,idLists[i][1],idLists[i][2]];
  //二次以降のidはnew_idListsにいれる
  for(var k=itemResp.length;k < name_idList.length;k++){
    new_idLists.push(name_idList[k]);
  }
  console.log("ok5");
  //フォームの回答から行う処理
  for(var i=0;i<itemResp.length;i++){
    let name_id = name_idList[i];
    console.log(name_id);

    //コマ生にする人の場合
    if(itemResp[i].getResponse() == "コマ生にする"){
      let value = decisionStatuses[name_id][2];
      //まだそのジャンルに参加していなかった場合
      if(value.indexOf(junre) == -1 ){
        if(value == ""){
          decisionStatuses[name_id][2] = junre;
          decisionStatuses[name_id][0] = 1;
        }else{
          decisionStatuses[name_id][2] = value + " " + junre;
          decisionStatuses[name_id][0] += 1;
        }
      //すでにそのジャンルがあった場合
      }else if(value.indexOf(junre) != -1){
        decisionStatuses[name_id][2] = value;
      }
    //保留する人の場合
    }else if(itemResp[i].getResponse() == "保留"){
      var q_decision = secondDecisionForm.addMultipleChoiceItem();
      q_decision.setTitle(itemResp[i].getItem().getTitle())
                .setHelpText(itemResp[i].getItem().getHelpText())
                .setChoiceValues(["コマ生にする","保留","落とす"])
                .setRequired(true);
      new_idLists.push(name_idList[i]);
    //落とす人の場合
    }else if(itemResp[i].getResponse() == "落とす"){      
      decisionStatuses[name_id][1] += 1;

      let lost_num = Number(decisionStatuses[name_id][1]);
      let join_num = Number(decisionStatuses[name_id][0]);
      if(junreMax == 1){
        var wish_joinNum = 1;
      }else{
        var wish_joinNum = Number(nameAndChoice_array[name_id][hearJunreNum*2+2]);
      }
      
      //これ以上は入れるジャンルがない場合
      if(!((join_num + lost_num) > junreMax)　|| !((wish_joinNum + lost_num) > hearJunreNum)){
        
        //次に希望しているジャンルを、希望数が１とそれ以外の場合で分けて取得
        if(junreMax==1){
          var next_junre = nameAndChoice_array[name_id][(1 + lost_num)*2]; 
        }else{
          var next_junre = nameAndChoice_array[name_id][(wish_joinNum + lost_num)*2];
        }
        console.log(next_junre);

        //万が一繰り返し同じジャンルを希望していた場合
        if(!(junre == next_junre)){             
          //タイトルと意気込みを取得、次に希望しているジャンルの二次決定フォームに回答を追加。
          let helptext = nameAndChoice_array[name_id][(wish_joinNum + lost_num)*2 +1];
          let wish_num = wish_joinNum + lost_num;
          let title = "第" + wish_num + "希望 " + itemResp[i].getItem().getTitle().substr(5);

          for(var t=0;t<idLists.length;t++){
            if(idLists[t][0] == next_junre){
              let nextJunreDecisionForm = FormApp.openById(idLists[t][2]);
              let junreId_lastCol = name_idLists[t].length + 4;

              var q_decision = nextJunreDecisionForm.addMultipleChoiceItem();
              q_decision.setTitle(title)
                        .setHelpText(helptext)
                        .setChoiceValues(["コマ生にする","保留","落とす"])
                        .setRequired(true);
              
              name_idLists[t].push(name_idList[i]);
              server.getRange(3+t,junreId_lastCol).setValue(name_idList[i]);

              break;
            }
          }
        }
      }
    }
  }
  //スプレッドシートに記入  
  nlss.getRange(2,joinNums_col,lastRow_nlss-1,3).setValues(decisionStatuses);

  //サーバーに次のコマ生決定フォームIDリスト(new_idList)をappendRowする 4/21
  server.deleteRow(3+server_row);
  server.appendRow(new_idLists);

  return 0;
}

/*
  次のコマ生決定フォームの準備関数
*/
function setupNextDecision() {
    var Properties = PropertiesService.getScriptProperties();
    var sortStatus = parseInt(Properties.getProperty("sortStatus"));

    if(sortStatus == 3){
      //サーバーの個人IDリストの最終行
      var lastRow_server = server.getLastRow()-2;
      //サーバーのフォームごとのフォームIDリスト
      var idLists = server.getRange(3,1,lastRow_server,3).getValues();


      //新しいIDリスト
      var new_idLists = [];

      for(var i=0;i<idLists.length;i++){
        var decisionForm = FormApp.openById(idLists[i][1]);
        var secondDecisionForm = FormApp.openById(idLists[i][2]);
        var junre = idLists[i][0];

        //3次以降決定フォームを作成   
        var decisionForm_title = secondDecisionForm.getTitle();
        var decision_count = Number(decisionForm_title.substring(decisionForm_title.indexOf("　")+1,decisionForm_title.indexOf("　")+2)) + 1;
        var next_DecisionForm = FormApp.create(junre + "　"+ decision_count +"次コマ生決定フォーム")
                                    .setTitle(junre + "　"+ decision_count +"次コマ生決定フォーム")
                                    .setAllowResponseEdits(true)
                                    .setConfirmationMessage("フォームを送信しました。");
        //3次以降決定フォームの親フォルダへ移動
        if(i == 0){
          var folder = create_parentsFile(decision_count + "次コマ生決定フォーム");
          move_file(next_DecisionForm, folder);
        }else{
          move_file(next_DecisionForm, folder);
        }
        
        //記録されている次のフォームにトリガー設置
        //元となるトリガーの削除
        ScriptApp.deleteTrigger(ScriptApp.getUserTriggers(decisionForm)[0]);

        //2次以降決定フォームにトリガーを追加
        ScriptApp.newTrigger("recordresp")
                  .forForm(secondDecisionForm)
                  .onFormSubmit()
                  .create();
        

        //NewIDリストに次のフォームIDと、トリガーIDを格納
        var next_idList = [junre,secondDecisionForm.getId(),next_DecisionForm.getId()];     
        new_idLists.push(next_idList);
        
      }
      server.getRange(3,1,new_idLists.length,3).setValues(new_idLists);
      urltableCreate(new_idLists);
      Properties.setProperty("sortStatus",2);
      Browser.msgBox( "振り分け準備が完了しました。", Browser.Buttons.OK);
    }else{
      Browser.msgBox( "振り分けが開始されていないか、順番が間違っています。", Browser.Buttons.OK);
    }
}

function resetDecision() {
  var Properties = PropertiesService.getScriptProperties();
  var sortStatus = parseInt(Properties.getProperty("sortStatus"));
  if(sortStatus == 3 || sortStatus ==  2){
    const nlss = mss.getSheetByName('名簿');
    const backup = mss.getSheetByName("バックアップ");

    //バックアップの最終列
    var lastCol_backup = backup.getLastColumn();
    //サーバーの最終列
    var lastCol_server = server.getLastColumn();
    //バックアップの最終行
    var lastRow_backup = backup.getLastRow();
    //サーバーの最終行
    var lastRow_server = server.getLastRow()-2;
    //名簿シートの最終行
    var lastRow_nlss = nlss.getLastRow();
    
    //バックアップidリスト取得
    var backupLists = backup.getRange(1,1,lastRow_server,lastCol_backup).getValues();
    if(lastRow_backup > lastRow_server){
      //バックアップ参加数等取得
    var backupNameLists = backup.getRange(lastRow_server+1,1,lastRow_nlss-1,3).getValues();
    }

    var formidLists = server.getRange(3,3,lastRow_server,1).getValues().flat();
    for(var i=0;i<formidLists.length;i++){
      console.log(i);
      let form = FormApp.openById(formidLists[i]);
      var items = form.getItems();
      while(items.length > 0){
        form.deleteItem(items.pop());
      }
    }  

    //現情報消去
    server.getRange(3,1,lastRow_server,lastCol_server).clearContent();
    //バックアップ上書き
    server.getRange(3,1,lastRow_server,lastCol_backup).setValues(backupLists);

    //現情報消去
    nlss.getRange(2,joinNums_col,lastRow_nlss-1,3).clearContent();
    if(lastRow_backup > lastCol_server){
      //バックアップ上書き
      nlss.getRange(2,joinNums_col,lastRow_nlss-1,3).setValues(backupNameLists);
    }
    Properties.setProperty("sortStatus",2);
    Browser.msgBox( "振り分け前に戻しました。", Browser.Buttons.OK);
  }else{
    Browser.msgBox( "振り分けが開始されていないか、順番が間違っています。", Browser.Buttons.OK);
  }
}


//ジャンルごとのコマ生決定フォームの表作成関数
function urltableCreate(idLists) {
  const dm_ss = mss.getSheetByName('エントリー振り分け');
  //提出確認欄のリセット
  var dm_ss_lastCol = dm_ss.getLastColumn();
  dm_ss.getRange(4,2,1,dm_ss_lastCol).clearContent();

  //表の作成
  var table = [];
  for(var i=0; i<idLists.length; i++){
    table.push([" - " +idLists[i][0]]);
    table.push([FormApp.openById(idLists[i][1]).getPublishedUrl()]);
    table.push([""]);
  }
  dm_ss.getRange(8,1,table.length,1).setValues(table);

  return 0;
}

//フォームにトリガーで紐づける提出記録関数
function recordresp(e) {
  const dm_ss = mss.getSheetByName('エントリー振り分け');
  //サーバーの個人IDリストの最終行
  var lastRow_server = server.getLastRow()-2;
  //サーバーのフォームごとのフォームIDリスト
  var idLists = server.getRange(3,1,lastRow_server,2).getValues();
  
  var allTriggers = ScriptApp.getProjectTriggers()
  for(var i=0;i<allTriggers.length;i++){
    if(allTriggers[i].getUniqueId() == e.triggerUid){
      var trigger = allTriggers[i];
      break;
    }
  }
  for(var i=0;i<idLists.length;i++){
    if(idLists[i][1] == trigger.getTriggerSourceId()){
      var junre = idLists[i][0]; 
      break;
    }
  }
  for(var i=0;i<junreList.length;i++){
    if(junre == junreList[i]){
      dm_ss.getRange(4,i+2).setValue("〇");
      break;
    }
  } 
  
  return 0;
}

function endDecisionMember() {
  propertyReset();
  deleteAllTrigger();
  
  //サーバーの個人IDリストの最終行
  var lastRow_server = server.getLastRow()-2;
  //サーバーの個人IDリストの最終列
  var lastCol = server.getLastColumn();
  server.getRange(3,1,lastRow_server,lastCol).clearContent();

  Browser.msgBox( "振り分けを終了しました。", Browser.Buttons.OK);

}


/*
  ----------------以下省略----------------------------
*/
function setTrigger(triggerKey, funcName){
  //既に同名で保存しているトリガーがあったら削除
  deleteTrigger(triggerKey);
  
  //１分後にトリガーを登録する
  var date = new Date();
  date.setMinutes(date.getMinutes() + 1);
  var triggerId = ScriptApp.newTrigger(funcName).timeBased().at(date).create().getUniqueId();
  Logger.log('setTrigger function_name "%s".', funcName);
  
  //あとでトリガーを削除するために「スクリプトのプロパティ」にトリガーIDを保存しておく
  PropertiesService.getScriptProperties().setProperty(triggerKey, triggerId);
}

function deleteTrigger(triggerKey) {
  var triggerId = PropertiesService.getScriptProperties().getProperty(triggerKey);
  if(!triggerId) return;
  
  ScriptApp.getProjectTriggers().filter(function(trigger){
    return trigger.getUniqueId() == triggerId;
  })
  .forEach(function(trigger) {
      ScriptApp.deleteTrigger(trigger);
  });
  PropertiesService.getScriptProperties().deleteProperty(triggerKey);
}

function deleteAllTrigger() {
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++) {
    ScriptApp.deleteTrigger(allTriggers[i]);
  }
}

function propertyReset() {
  var Properties = PropertiesService.getScriptProperties();
  Properties.deleteAllProperties();
}

function propertydelete() {
  var Properties = PropertiesService.getScriptProperties();
  Properties.deleteProperty('status');
}


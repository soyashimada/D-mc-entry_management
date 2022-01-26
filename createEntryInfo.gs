function createEntryInfo([choice_col,sheetName]) {
  const iss = mss.getSheetByName('エントリー情報');
  var junreNumCol = choice_col - 2;

  const rule = SpreadsheetApp.newDataValidation().requireValueInList(junreList).build();
  var cell = iss.getRange("B1");
  cell.setDataValidation(rule);

  entry_sort.getRange("B2").setFormula("=SORT(UNIQUE('"+ sheetName +"'!B2:X),2,TRUE)");
  
  iss.getRange(4,2,1,20).clearContent();
  for(var i=2;i<=hearJunreNum*5-3;i+=5){ 
    var alphabet = getColumnFromIndex(choice_col);
    var alphabet2 = getColumnFromIndex(choice_col + 1);
    var alphabet3 = getColumnFromIndex(i);
    var formula_range = iss.getRange(4,i);
    var formula_range_2 = iss.getRange(4,i+3);
    formula_range.setFormula(`=QUERY(QUERY('ソート'!B2:X,"select B,D,`+ alphabet2 +` where `+ alphabet +`='"&B1&"'"))`);
    if(junreMax == 1){
      if((i+3)/5 == 1){
        formula_range_2.setFormula(`=ArrayFormula(IF(B4:B = "","","〇"))`);
      }else{
        formula_range_2.clearContent();
      }
      
    }else if(junreMax > 1){
      formula_range_2.setFormula(`=ArrayFormula(IF(IFERROR(VLOOKUP(`+ alphabet3 +`4:`+ alphabet3 +`,'ソート'!B2:X,`+ junreNumCol +`,FALSE) >= `+ (i+3)/5 +`),"〇",))`);
    }
    choice_col += 2;
  }

}

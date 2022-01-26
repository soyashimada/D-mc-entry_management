
function create_pdf() {
  const iss = mss.getSheetByName('エントリー情報');
  const issId = iss.getSheetId();

  //ファイルを作成
  const folder = create_parentsFile("エントリー情報一覧 - "+title);

  //PDFを作成するためのベースとなるURL
  let baseUrl = "https://docs.google.com/spreadsheets/d/"
          +  mssId
          + "/export?gid="
          + issId;
 
  //PDFのオプションを指定
  var pdfOptions = "&exportFormat=pdf&format=pdf"
              + "&size=A4" //用紙サイズ (A4)
              + "&portrait=false"  //用紙の向き true: 縦向き / false: 横向き
              + "&fitw=true"  //ページ幅を用紙にフィットさせるか true: フィットさせる / false: 原寸大
              + "&top_margin=0.50" //上の余白
              + "&right_margin=0.50" //右の余白
              + "&bottom_margin=0.50" //下の余白
              + "&left_margin=0.50" //左の余白
              + "&horizontal_alignment=CENTER" //水平方向の位置
              + "&vertical_alignment=TOP" //垂直方向の位置
              + "&printtitle=false" //スプレッドシート名の表示有無
              + "&sheetnames=false" //シート名の表示有無
              + "&gridlines=true" //グリッドラインの表示有無

  //アクセストークンを取得する
  let token = ScriptApp.getOAuthToken();

  //headersにアクセストークンを格納する
  let options = {
    headers: {
        'Authorization': 'Bearer ' +  token
    },
  };


  for(var i=0;i<junreList.length;i++){
    iss.getRange("B1").setValue(junreList[i]);

    SpreadsheetApp.flush();
    //pdf出力範囲を取得
    var iss_lastRow = iss.getLastRow();
    //pdfオプションを更新
    let pdfOptions_range = pdfOptions+ "&range=B2%3AY" + iss_lastRow

    //PDFを作成するためのURL
    let url = baseUrl + pdfOptions_range;
  
    //PDFを作成する
    var pdf = UrlFetchApp.fetch(url, options).getBlob().setName(junreList[i] + '.pdf');
    folder.createFile(pdf);
  }
  
}

function create_nameList_pdf() {
  const junre_nlss = mss.getSheetByName('ジャンル別名簿');
  const junre_nlssId = junre_nlss.getSheetId();

  //ファイルを作成
  const folder = create_parentsFile("ジャンル別名簿一覧 - "+title);

  //PDFを作成するためのベースとなるURL
  let baseUrl = "https://docs.google.com/spreadsheets/d/"
          +  mssId
          + "/export?gid="
          + junre_nlssId;
 
  //PDFのオプションを指定
  var pdfOptions = "&exportFormat=pdf&format=pdf"
              + "&size=A4" //用紙サイズ (A4)
              + "&portrait=true"  //用紙の向き true: 縦向き / false: 横向き
              + "&fitw=true"  //ページ幅を用紙にフィットさせるか true: フィットさせる / false: 原寸大
              + "&top_margin=0.50" //上の余白
              + "&right_margin=0.50" //右の余白
              + "&bottom_margin=0.50" //下の余白
              + "&left_margin=0.50" //左の余白
              + "&horizontal_alignment=CENTER" //水平方向の位置
              + "&vertical_alignment=TOP" //垂直方向の位置
              + "&printtitle=false" //スプレッドシート名の表示有無
              + "&sheetnames=false" //シート名の表示有無
              + "&gridlines=true" //グリッドラインの表示有無

  //アクセストークンを取得する
  let token = ScriptApp.getOAuthToken();

  //headersにアクセストークンを格納する
  let options = {
    headers: {
        'Authorization': 'Bearer ' +  token
    },
  };


  for(var i=0;i<junreList.length;i++){
    junre_nlss.getRange("A2").setValue(junreList[i]);

    SpreadsheetApp.flush();
    Utilities.sleep(8000);
    //pdf出力範囲を取得
    var junre_nlss_lastRow = junre_nlss.getLastRow();
    //pdfオプションを更新
    let pdfOptions_range = pdfOptions+ "&range=B1%3AH" + junre_nlss_lastRow

    //PDFを作成するためのURL
    let url = baseUrl + pdfOptions_range;
  
    //PDFを作成する
    var pdf = UrlFetchApp.fetch(url, options).getBlob().setName(junreList[i] + '.pdf');
    folder.createFile(pdf);
  }
  
}

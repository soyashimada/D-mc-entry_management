# 所属していたダンスサークルのイベントエントリー管理プログラム
## 概要
自分のダンスサークルではイベントの度に、サークル員がエントリーして参加する形になっていて、400程のエントリー管理が手作業だと大変だったのでプログラムを作成しました。  
ジャンルというのはダンスの種類で、サークル員がいくつかのジャンルに希望を出して参加するという形になっています。  
そしてジャンルの振り付けが希望者の中から選んで、ジャンルごとのメンバーが決まっていく流れになります。


## エントリーを振り分けする流れ
１．エントリーフォームの作成。  
[(CreateEntryForm.gs)](https://github.com/soyashimada/D-mc-entry_management/blob/main/createEntryForm.gs)  

２．ジャンルごとのメンバー決定フォームの作成。  
[(createDecisionForm.gs/setupFirstDecisionForm())](https://github.com/soyashimada/D-mc-entry_management/blob/main/createDecisionForm.gs#L9)  

３．フォーム回答から参加可能ジャンル数分の希望を読込。  
４．希望されているジャンルの決定フォームに、希望者を質問にして入れる。  
[(createDecisionForm.gs/sortFirstDecisionForm())](https://github.com/soyashimada/D-mc-entry_management/blob/main/createDecisionForm.gs#L76)  

５．振付が決定フォームを回答、入れたいメンバーを決定。  

６．決定フォームの回答を読込。  
７．選ばれた希望者はシートに記録。選ばれなければ次の希望を読み込み次の決定フォームに質問を作成。  
＜５～７を希望がすべて読み込めるまで繰り返す＞  
[(createDecisionForm.gs/runSortNextDecisionForm())](https://github.com/soyashimada/D-mc-entry_management/blob/main/createDecisionForm.gs#L205)  

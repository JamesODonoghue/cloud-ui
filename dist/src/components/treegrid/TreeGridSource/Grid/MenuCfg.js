// -----------------------------------------------------------------------------------------------------------
// Menu - MenuCfg a MenuColumns
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
MS.Api;
MS.Toolbar;
TGP.ToolbarClick = function(num){
if(num=="MenuCfg") num = "Cfg";
var A = ["","Save","Reload","Add","Sort","","","Help","ExpandAll","CollapseAll","Cfg","AddChild","Repaint","Calc","Columns","Print","Export"];
if(A[num]) num = A[num];
this.AEvent = "Key"; 
this.RunAction("Click","Button"+num);
}
ME.Toolbar;
ME.Api;
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
MS.MenuCfg;
// -----------------------------------------------------------------------------------------------------------
// Replaces in configuration menu items, all the standard configuration items
TGP.UpdateCfgItems = function(I){
var cnt = 0, T = this, G = this.Gantt ? this.Cols[this.GetFirstGantt()] : null, L = this.Lang["MenuCfg"]; if(!L) L = {};
function GetItems(){
   for(var i=0,A=[];i<arguments.length;i+=2){
      var n = arguments[i], t = arguments[i+1];
      if(L[t]!="") A[A.length] = {Name:n,Text:L[t]?L[t]:t};
      }
   return A;
   }
function GetStyles(S){
   var A = [], AC = [];
   for(var s in S){ 
      var X = S[s], n = X.Name; if(T.Trans) n = T.Translate(T.Toolbar,"Styles",n);
      if(S[s].Compatible) AC[AC.length] = {Name:X.Style,Text:n}; else A[A.length] = {Name:X.Style,Text:n}; 
      }
   var cc = L["CompatibleStyles"];
   if(cc&&AC.length) {
      if(A.length) { A[A.length] = "-"; A[A.length] = {Name:cc,Menu:1,Items:AC}; }
      else A = AC;
      }
   return A;
   }
function GetSizes(S,name){ 
   var A = []; 
   for(var s in S){ 
      var X = S[s], n = s; if(T.Trans) n = T.Translate(T.Toolbar,name,n);
      A[A.length] = {Name:X,Text:n}; 
      } 
   return A; 
   }
function GetLanguage(S,s,ss){ return S[s] ? "<div class=\""+ss+"MenuCfgItemLanguage "+ss+"ToolLang"+s+"\">"+(S[s].Name?S[s].Name:S[s].Code)+"</div>" : s; }
function GetLanguages(S,ss){ var A = []; for(var s in S) A[A.length] = { Name:s, Text:GetLanguage(S,s,ss) }; return A; }

var Cfg = "ShowDeleted,ReversedTree,AutoSort,SortClick,AutoUpdate,CheckUpdates,-,Scrollbars,Scroll,MouseHover,ShowDrag,ShowPanel,ShowPager,ShowAllPages,ShowButtons,FormulaTip,Animations,PageBreaks";
var Style = "ShrinkStyle,Style,GanttStyle,StyleSize,Scale,Contrast";
var SCfg = "ShowTree,ColTree,ShowBorder,ShowFormulas,ShowZeros";
if(!this.File&&(!this.RowIndex||!this.ColIndex)) { Cfg = SCfg+","+Cfg; SCfg = ""; }
var GCfg = "CheckDependencies,CheckExclude,Check,CorrectDependencies,Direction,Strict,CorrectDependenciesFixed,FixComplete,CorrectOutsideBounds,BaseProof,FinishProof,BasePreferred,FinishPreferred,MinSlack,ErrSlack,SeparateSlack,HideExclude,ShowBorder";
for(var i=0;i<I.length;i++){
   var n = I[i].Name, A = null;
   switch(n){
      case "Cfg" : I.splice.apply(I,FromJSON("["+(i--)+",1,{Name:'"+Cfg.replace(/,/g,"'},{Name:'")+"'}]")); break;
      case "Styles" : I.splice.apply(I,FromJSON("["+(i--)+",1,{Name:'"+Style.replace(/,/g,"'},{Name:'")+"'}]")); break;
      case "GanttCfg" : I.splice.apply(I,FromJSON("["+(i--)+",1,{Name:'Gantt"+GCfg.replace(/,/g,"'},{Name:'Gantt")+"'}]")); break;
      case "SheetCfg" : if(SCfg) I.splice.apply(I,FromJSON("["+(i--)+",1,{Name:'"+SCfg.replace(/,/g,"'},{Name:'")+"'}]")); else I.splice(i--,1); break;
      case "CfgCaption" : case "GanttCaption" : case "SheetCaption" : case "StylesCaption" : case "LanguageCaption" : A = L[n]=="-" ? { Name:"-" } : { Caption:1 }; break;
      case "Language" : A = { Value:this.Language,Enum:1,Hidden:!this.Language||this.Locked["lang"]||this.Reset&&this.Reset.Language!=null,AutoColumns:this.LanguagesColumns,Items:GetLanguages(this.GetLanguages(1),this.Img.Style) }; break;
      case "ShowDeleted" : A = { Value:this.ShowDeleted,Bool:1,Hidden:!this.Deleting }; break;
      case "ReversedTree" : MS.ReversedTree; A = { Value:this.ReversedTree,Bool:1,Hidden:1 }; ME.ReversedTree; break;
      case "ShowTree" : A = { Value:this.HideTree==2 ? 0 : this.HideTree ? 1 : this.ReversedTree ? 3 : 2,Enum:1,Hidden:this.HideTree==3||!this.MainCol,Items:GetItems(0,"ShowTree1",1,"ShowTree2",2,"ShowTree3",3,"ShowTree4") }; break;
      case "ColTree" : A = { Value:this.ColTree-1,Enum:1,Hidden:!this.ColTree,Items:GetItems(0,"ColTree1",1,"ColTree2",2,"ColTree3",3,"ColTree4") }; break;
      case "AutoSort" : A = { Value:this.AutoSort,Bool:1,Hidden:!this.Sorting || this.Paging==3 }; break;
      case "SortClick" : A = { Value:this.SortIcons,Enum:1,Hidden:!this.Sorting,Items:GetItems(0,"SortClick1",1,"SortClick2",2,"SortClick3",3,"SortClick4") }; break;
      case "AutoUpdate" : A = { Value:this.AutoUpdate,Bool:1,Hidden:!this.Source.Upload.Url&&!this.Source.Upload.Script&&(!this.PivotGrid||!this.PivotGrid.Source.Upload.Url&&!this.PivotGrid.Source.Upload.Script) || this.Detail }; break;
      case "CheckUpdates" :
         var gi = Grids.CheckIntervals, cu = []; for(var j=0;j<gi.length;j++) cu[cu.length] = { Name:gi[j],Text:L["CheckUpdates"+gi[j]] };
         A = { Value:this.Source.Check.Interval,Enum:1,Hidden: !this.Source.Check.Url&&!this.Source.Check.Script || this.Detail, Items:cu }; break;
      case "MouseHover" : A = { Value:this.Hover,Enum:1,Hidden:!BMouse,Items:GetItems(0,"Hover1",1,"Hover2",2,"Hover3") }; break;
      case "ShowDrag" : A = { Value:this.ShowDrag,Bool:1,Hidden: !this.Dragging && !this.ColMoving || BTablet }; break;
      case "Scrollbars" : MS.CustomScroll; A = { Value:this.CustomScroll,Enum:1,Hidden:BTablet?!this.TouchScroll:!this.CustomScroll,Items:GetItems(4,"Scrollbars1",3,"Scrollbars2",1,"Scrollbars3",2,"Scrollbars4") }; ME.CustomScroll; break;
      case "Scroll" : A = { Value:this.ScrollAction,Enum:1,Hidden:!BTablet||this.ScrollAction==null,Items:GetItems(0,"Scroll1",1,"Scroll2",2,"Scroll3",3,"Scroll4") }; break;
      case "ShowPanel" : 
         for(var j=0;j<I.length;j++) if(I[j].Name=="Cols") break;
         A = { Value:this.Cols.Panel&&this.Cols.Panel.Visible,Bool:1,Hidden:!this.Cols.Panel||j!=I.length&&this.Cols.Panel.CanHide }; break;
      case "ShowPager" : 
         for(var j=0;j<I.length;j++) if(I[j].Name=="Pagers") break;
         A = { Text:this.Pagers[0]?L[n].replace("%d",this.Pagers[0].MenuName?this.Pagers[0].MenuName:this.Pagers[0].Caption):"",Value:this.Pagers[0]&&this.Pagers[0].Visible,Bool:1,Hidden:!this.Pagers[0]||j!=I.length&&this.Pagers[0].CanHide }; break;
      case "ShowAllPages" : A = { Value:this.AllPages,Bool:1,Hidden:!this.Paging||this.AutoPages }; break;
      case "ShowButtons" : A = { Value:this.ShowButtons,Enum:1,Hidden:!this.ShowButtons||this.ShowButtons>3,Items:GetItems(0,"",1,"ShowButtons1",2,"ShowButtons2",3,"ShowButtons3") }; break;
      case "ShowBorder" : A = { Value:this.DefaultBorder,Bool:1,Hidden:!this.DynamicBorder }; break;
      case "ShowZeros" : A = { Value:!this.HideZero,Bool:1,Hidden:0 }; break;
      case "ShowFormulas" : A = { Value:this.FormulaShow,Bool:1,Hidden:!this.FormulaEditing||this.Locked["formula"] }; break;
      case "FormulaTip" : A = { Value:this.FormulaTip,Bool:1,Hidden:!this.FormulaEditing||this.Locked["formula"] }; break;
      case "Animations" : A = { Value:!this.SuppressAnimations,Bool:1,Hidden:!this.AnimateRows&&!this.AnimateCols&&!this.AnimateCells&&!this.AnimateDialogs }; break;
      case "PageBreaks" : A = { Value:this.ShowPrintPageBreaks>0,Bool:1,Hidden:this.ShowPrintPageBreaks<0 }; break;
      case "ShrinkStyle" : A = { Value:this.ShrinkStyle,Enum:1,Hidden:!(this.ShrinkStyleType&23)||this.Locked["size"],Items:GetItems(0,"ShrinkStyle1",3,"ShrinkStyle4",1,"ShrinkStyle2",2,"ShrinkStyle3") }; break;
      case "Style" : A = { Value:this.Styles[this.Img.Style]&&this.Styles[this.Img.Style].Compatible?this.Styles[this.Img.Style].Name:this.Img.Style,Enum:1,Hidden:!this.Styles[this.Img.Style]||this.Locked["size"]||this.Reset&&this.Reset.Style?1:0,Items:GetStyles(this.Styles) }; break;
      case "GanttStyle" : A = { Value:this.Img.GanttStyle,Enum:1,Hidden:!this.Gantt||!this.Styles[this.Img.Style]||this.Styles[this.Img.Style].Compatible||this.Locked["size"]||this.Reset&&this.Reset.GanttStyle?1:0,Items:GetStyles(this.GanttStyles) }; break;
      case "StyleSize" : A = { Value:this.Size,Enum:1,Hidden:this.Styles[this.Img.Style]&&this.Styles[this.Img.Style].Compatible||this.Locked["size"],Items:GetSizes(ParseObject(this.Sizes),"Sizes") }; break;
      case "Scale" : MS.Scale; A = { Value:this.Scale?this.Scale:1,Enum:1,Hidden:this.Locked["size"],Items:GetSizes(ParseObject(this.Scales),"Scales") }; ME.Scale; break;
      case "Contrast" : A = { Value:this.Contrast,Enum:1,Hidden:this.Styles[this.Img.Style]&&this.Styles[this.Img.Style].Compatible,Items:GetSizes(ParseObject(this.Contrasts),"Contrasts") }; break;
      case "GanttCorrectDependencies" : A = { Value:G?G.GanttCorrectDependencies:0,Hidden:!this.GanttDependency,Enum:1,Items:GetItems(0,"Correct1",1,"Correct2",2,"Correct3") }; break;
      case "GanttCheckDependencies" : A = { Value:G?G.GanttCheckDependencies:0,Hidden:!this.GanttDependency,Enum:1,Items:GetItems(0,"Check1",1,"Check2",2,"Check3",3,"Check4") }; break;
      case "GanttCheckExclude" : A = { Value:G?G.GanttCheckExclude:0,Hidden:!G||!G.GanttExclude&&!G.GanttCalendar,Enum:1,Items:GetItems(0,"Check1",1,"Check2",2,"Check3") }; break;
      case "GanttCheck" : A = { Value:G?G.GanttCheck:0,Hidden:!G,Enum:1,Items:GetItems(0,"GanttCheck1",1,"GanttCheck2",2,"GanttCheck3",3,"GanttCheck4",4,"GanttCheck5") }; break;
      case "GanttDirection" : A = { Value:G?G.GanttDirection:0,Hidden:!G,Enum:1,Items:GetItems(0,"GanttDirection1",1,"GanttDirection2") }; break;
      case "GanttStrict" : A = { Value:G?G.GanttStrict:0,Hidden:!this.GanttDependency,Enum:1,Items:GetItems(0,"GanttStrict1",1,"GanttStrict2",2,"GanttStrict3",3,"GanttStrict4") }; break;
      case "GanttCorrectDependenciesFixed" : A = { Value:G?!G.GanttCorrectDependenciesFixed:0,Bool:1,Hidden:!this.GanttDependency||G.GanttStrict==2 }; break;
      case "GanttFixComplete" : A = { Value:G?!G.GanttFixComplete:0,Bool:1,Hidden:!this.GanttDependency||!G["GanttComplete"] }; break;
      case "GanttBaseProof" : A = { Value:G?!G.GanttBaseProof:0,Bool:1,Hidden:!G||G.GanttBase===""&&(G.GanttBaseAuto==null||!G.GanttBaseCanEdit) }; break;
      case "GanttFinishProof" : A = { Value:G?!G.GanttFinishProof:0,Bool:1,Hidden:!G||G.GanttFinish===""&&(G.GanttFinishAuto==null||!G.GanttFinishCanEdit) }; break;
      case "GanttBasePreferred" : A = { Value:G?G.GanttBasePreferred:0,Bool:1,Hidden:!G||G.GanttBase===""&&(G.GanttBaseAuto==null||!G.GanttBaseCanEdit) }; break;
      case "GanttFinishPreferred" : A = { Value:G?G.GanttFinishPreferred:0,Bool:1,Hidden:!G||G.GanttFinish===""&&(G.GanttFinishAuto==null||!G.GanttFinishCanEdit) }; break;
      case "GanttCorrectOutsideBounds" : A = { Value:G?G.GanttCorrectOutsideBounds:0,Bool:1,Hidden:!G||G.GanttFinish===""&&(G.GanttFinishAuto==null||!G.GanttFinishCanEdit)&&G.GanttBase===""&&(G.GanttBaseAuto==null||!G.GanttBaseCanEdit) }; break;
      case "GanttMinSlack" : A = { Value:G?G.GanttMinSlack:0,Edit:1,Hidden:!G||!G.GanttSlack,Type:"Int",Size:4 }; break;
      case "GanttErrSlack" : A = { Value:G?G.GanttErrSlack:0,Edit:1,Hidden:!G||!G.GanttSlack,Type:"Int",Size:4 }; break;
      case "GanttSeparateSlack" : A = { Value:G?G.GanttSeparateSlack:0,Bool:1,Hidden:!G||!G.GanttSlack }; break;
      case "GanttHideExclude" : A = { Value:G?!(G.GanttHideExclude&1):0,Bool:1,Hidden:!G||!G.GanttExclude }; break;
      case "GanttShowBorder" : A = { Value:G?G.GanttShowBorder:0,Bool:1,Hidden:!G }; break;
      case "Separator1" : case "GanttSeparator1" : A = { Name:"-" }; break; 
      } 
   if(L[n]==="") I.splice(i--,1);
   else if(A){
      I[i].Text = L[n]; I[i].Cfg = 1;
      for(var a in A) I[i][a] = A[a];
      if(I[i].Enum) I[i].Text += CNBSP;
      if(this.MenuCfg[n]=="0") I[i].Hidden = 1;
      
      cnt++;
      }
   }
return cnt;
}
// -----------------------------------------------------------------------------------------------------------
// Replaces in configuration menu items, the items named Cols, ColsCaption,Pagers and PagerCaptions by all columns and pagers
// attr is attribute to test if the column/pager will be displayed. Can be CanHide, CanPrint, CanExport.
// if set sort, sorts the columns by alphabet, otherwise places them by their position in grid
// if set hide, hides the unused items, otherwise it shows them disabled. For hide = 1 shows only visible unused items
// the def is menu default item
// if set test, only tests if at least one column/pager will be displayed in the menu
TGP.UpdateColumnsItems = function(I,attr,sort,hide,def,test){
var CN = this.ColNames, N = sort ? [] : [[],[],[]], Cnt = 0, O = [], P = {"Cols":0,"ColsCaption":1,"Pagers":2,"PagersCaption":3};
for(var i=0;i<I.length;i++){ var n = I[i].Name; if(P[n]!=null) O[P[n]] = i; }
if(O[0]==null) return 0;
for(var i=0;i<CN.length;i++){
   var S = CN[i];
   for(var j=0;j<S.length;j++){
      var C = this.Cols[S[j]], spec = 0;
      if((!C[attr] || C[attr]==2&&attr=="CanHide")) { spec = 1; if(hide==2||hide==1&&(attr!="CanHide"||!C.Visible)||C.ConstWidth) continue; }
      if(test) return true;
      var cap = C.MenuName;
      if(!cap) cap = this.GetCaption(S[j]);
      if(!cap) cap = S[j]; 
      if(this.Trans) cap = this.Translate("MenuName",S[j],cap?cap:"","");
      var II = sort ? N : N[C.MainSec], III = { Name:S[j],Text:cap,Bool:1,Value:C.Visible,Col:S[j] };
      if(C.MenuName==="") III.Hidden = 1;
      if(sort) III.TextSort = cap.toLowerCase();
      if(spec) { III.Value = attr=="CanHide" ? C.Visible : 0; III.Disabled = 1; III.NoAll = 2; }
      else if(C[attr]>2&&attr=="CanPrint" || C[attr]>1&&attr=="CanExport") { III.Value = 1; if(hide==2) III.Hidden = 1; else { III.Disabled = 1;  III.NoAll = 2; } }
      if(!III.Hidden) { Cnt++; if(!II.Cnt) II.Cnt = 1; else II.Cnt++; }
      II[II.length] = III;
      }
   }
if(attr=="CanHide" && O[2]!=null) {
   for(var i=0,II=sort?N:[];i<this.Pagers.length;i++){
      var P = this.Pagers[i]; if(!P.CanHide) continue;
      if(test) return true;
      var cap = P.MenuName; if(!cap) cap = P.Caption; if(!cap) cap = "Pager"; if(this.Trans) cap = this.Translate("MenuName",cap,cap);
      II[II.length] = { Name:P.Name,Text:cap,Bool:1,Value:P.Visible,Col:P.Name,TextSort:cap.toLowerCase()};
      if(!II.Cnt) II.Cnt = 1; else II.Cnt++;
      Cnt++;
      }
   if(sort||!II.Cnt) { I.splice(O[2],1); if(O[0]>O[2]) O[0]--; if(O[1]>O[2]) O[1]--; if(O[3]!=null) { I.splice(O[3],1); if(O[0]>O[3]) O[0]--; if(O[1]>O[3]) O[1]--; }}
   else {
      I[O[2]] = { Columns:1,Items:II,Default:def,Cols:1,Group:1 };
      if(O[3]!=null) { 
         if(I[O[3]].Caption==null) I[O[3]].Caption = 1;
         if(I[O[3]].Text==null) I[O[3]].Text = this.GetText("PagersCaption",this.Lang.MenuColumns);
         if(I[O[3]].Text==="") I[O[3]].Hidden = 1;
         }
      }
   }
if(test) return false;
if(!Cnt) { I.splice(O[0],1); if(O[1]!=null) I.splice(O[1],1); return 0; }
if(O[1]!=null) { 
   if(I[O[1]].Caption==null) I[O[1]].Caption = 1;
   if(I[O[1]].Text==null) I[O[1]].Text = this.GetText("ColsCaption",this.Lang.MenuColumns);
   if(I[O[1]].Text==="") I[O[1]].Hidden = 1;
   }
if(sort) {
   N.sort(function(a,b){ return a.TextSort<b.TextSort?-1:(a.TextSort>b.TextSort?1:0); });
   I[O[0]] = { Columns:1,Items:N,Default:def,Cols:1,Group:1 };
   }
else {
   I.splice(O[0],1);
   for(var i=0,p=0,sep=0;i<N.length;i++) if(N[i].length){ 
      if(sep && Cnt>3) I.splice(O[0]+(p++),0,{ Name:"-" }); 
      sep = N[i].Cnt;
      I.splice(O[0]+(p++),0,{ Columns:1,Items:N[i],Default:def,Cols:1,Group:1 });
      }
   }
return Cnt;
}
// -----------------------------------------------------------------------------------------------------------
// Replaces in configuration menu items, the items named Rows,Head,Foot,Space,RowsCaption,SpaceCaption by all rows
// attr is attribute to test if the row will be displayed. Can be CanHide, CanPrint, CanExport.
// if set sort, sorts the rows by alphabet, otherwise places them by their position in grid
// if set hide, hides the unused items, otherwise it shows them disabled. For hide = 1 shows only visible unused items
// the def is menu default item
// if set test, only tests if at least one row will be displayed in the menu
TGP.UpdateRowsItems = function(I,attr,sort,hide,def,test){
var P = { "Rows":0,"Head":1,"Foot":2,"Space":3 }, O = [], Cnt = 0, N = [];
for(var i=0;i<I.length;i++){ var n = I[i].Name; if(P[n]!=null) O[P[n]] = i; }
for(var i=0;i<4;i++) if(O[i]!=null) {
   var r = i==3 ? this.XS.firstChild : (i==2 ? this.XF.firstChild : (i==1 ? this.XH.firstChild : this.GetFirst()));
   for(var II=sort?N:[],cnt=0;r;r=(i?r.nextSibling:this.GetNext(r))){
      var can = Get(r,attr), spec = 0;
      if(!can || attr=="CanExport"&&can==2 || r.id=="NoData"&&!r.Visible) { spec = 1; if(hide==2||hide==1&&(attr!="CanHide"||!r.Visible)||r.id=="_ConstHeight"||r.id=="NoData") continue; };
      if(test) return true;
      var III = { Name:"Row"+r.id,Bool:1,Value:r.Visible,Row:r.id };
      var cap = Get(r,"MenuName"); if(cap==="") III.Hidden = 1;
      if(!cap) cap = this.GetName(r); if(!cap) cap = r.id;
      if(this.Trans) cap = this.Translate(r,"MenuName",cap,"");
      III.Text = cap;
      if(spec) { III.Value = attr=="CanHide" ? r.Visible : 0; III.Disabled = 1; III.NoAll = 2; }
      else if((can==3||can==4||can==7||can==8)&&attr=="CanPrint" || can==3&&attr=="CanExport") { III.Value = 1; if(hide==2) III.Hidden = 1; else { III.Disabled = 1; III.NoAll = 2; } }
      if(sort) III.TextSort = (cap+"").toLowerCase();
      II[II.length] = III;
      cnt++;
      }
   if(!sort){  
      if(cnt) I[O[i]] = { Columns:1,Items:II,Default:def,Rows:1,Group:1 };
      else { I.splice(O[i],1); for(var j=i+1;j<4;j++) if(O[j]>O[i]) O[j]--; }
      }
   Cnt += cnt;
   }
if(test) return false;
if(sort){
   if(Cnt) N.sort(function(a,b){ return a.TextSort<b.TextSort?-1:(a.TextSort>b.TextSort?1:0); });
   for(var i=0,cnt=Cnt;i<4;i++) if(O[i]!=null) {
      if(cnt) { I[O[i]] = { Columns:1,Items:N,Default:def,Rows:1,Group:1 }; cnt = 0; }
      else { 
         I.splice(O[i],1); for(var j=i+1;j<4;j++) if(O[j]>O[i]) O[j]--; 
         if(I[O[i]-1]&&I[O[i]-1].Name=="-") I[O[i]-1].Hidden = 1;
         }
      }
   }
var P = { "RowsCaption":0,"SpaceCaption":1 }, Q = [];
for(var i=0;i<I.length;i++){ var n = I[i].Name; if(P[n]!=null) Q[P[n]] = i; }
if(sort){
   var q = Q[0]?Q[0]:Q[1];
   if(q){
      if(I[q].Caption==null) I[q].Caption = 1;
      if(I[q].Text==null) I[q].Text = this.GetText([!Q[0]?"SpaceCaption":"RowsCaption"],this.Lang.MenuColumns);
      if(I[q].Text==="") I[q].Hidden = 1;
      }
   if(Q[0]&&Q[1]) I.splice(Q[1],1);
   }
else {
   for(var i=0;i<2;i++) if(Q[i]!=null){
      if(i?cnt:(O[3]==null?Cnt:Cnt-cnt)) {
         if(I[Q[i]].Caption==null) I[Q[i]].Caption = 1;
         if(I[Q[i]].Text==null) I[Q[i]].Text = this.GetText([i?"SpaceCaption":"RowsCaption"],this.Lang.MenuColumns);
         if(I[Q[i]].Text==="") I[Q[i]].Hidden = 1;
         }
      else { I.splice(Q[i],1); if(!i && Q[1]>Q[0]) Q[1]--; }
      }
   }
return Cnt;
}
// -----------------------------------------------------------------------------------------------------------
// Removes unused separators and captions in menu items
TGP.UpdateSeparatorItems = function(I){
for(var i=0;i<I.length;i++) if(I[i].Columns) { 
   for(var j=0;j<I[i].Items.length;j++) if(!I[i].Items[j].Hidden) break; 
   if(j==I[i].Items.length) I[i].Hidden = 1;
   }
for(var i=I.length-1;i>=0;i--){
   if(I[i].Name=="-"||I[i].Caption==1){ 
      for(var j=i+1,cap=I[i].Caption;j<I.length&&(I[j].Hidden||(cap?I[j].Name=="-":I[j].Caption));j++);
      if(j==I.length||(cap?I[j].Caption:I[j].Name=="-")) I[i].Hidden = 1;
      else { 
         for(var j=i-1;j>=0&&I[j].Hidden;j--);
         if(j==-1&&!cap||j!=i-1&&j!=-1&&(cap?I[j].Name=="-":I[j].Caption)) I[i].Hidden = 1;
         }
      }
   }

for(var i=0;i<I.length&&I[i].Hidden;i++);
if(i<I.length&&I[i].Caption==1){
   for(var j=i+1;j<I.length;j++) if(I[j].Caption&&!I[j].Hidden) break;
   if(j==I.length) I[i].Hidden = 1; 
   }
}
// -----------------------------------------------------------------------------------------------------------
// Moves the menu items to columns
TGP.AddItemsColumns = function(I,count,cfgcount){
if(!count) {
   for(var i=0,cnt=0;i<I.length;i++) if(!I[i].Hidden) {
      if(I[i].Columns) { 
         for(var j=0,cc=0,II=I[i].Items;j<II.length;j++) if(!II[j].Hidden) cc++; 
         cnt += cc / I[i].Columns;
         }
      else if(I[i].Caption) cnt += 2;
      else cnt++;
      }
   count = Math.ceil(cnt/25);
   }
if(!cfgcount) cfgcount = Math.floor(count/3*2);
if(count<=1 && cfgcount<=1) return;
for(var i=0,p=0,cnt=0;i<I.length;i++){
   if(I[i].Columns||I[i].Name=="-"||I[i].Caption){
      if(cnt) { I.splice(p,0,{Columns:cfgcount,Items:I.splice(p,cnt),Group:1}); i -= cnt-1; cnt = 0; }
      p = i+1;
      if(I[i].Columns) I[i].Columns = count;
      }
   else cnt++;
   }
if(cnt) I.splice(p,0,{Columns:cfgcount,Items:I.splice(p,cnt),Group:1});
}
// -----------------------------------------------------------------------------------------------------------
TGP.InitCfgMenu = function(M){
return M;
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Show the cfg menu
TGP.ActionShowColumns = function(dummy,T){ return this.Locked["visibility"] || !!this.ShowCfg(this.MenuColumns,null,null,T); }
TGP.ActionShowCfg = function(dummy,T){ return !this.Locked["menu"] && (!Grids.OnCreateCfg || !Grids.OnCreateCfg(this)) ? !!this.ShowCfg(this.MenuCfg,null,null,T) : false; }
// -----------------------------------------------------------------------------------------------------------
TGP.ShowCfg = function(C,func,P,test,closefunc){
if(!C) C = this.MenuCfg;
var M = TMenu.InitMenu(C.Menu,1); if(!M) M = { };
if(Grids.OnCreateMenu && Grids.OnCreateMenu(this,M,C,P)) return;
var I = M.Items; if(!I && C.Items) { I = C.Items.split(","); M.Items = I; }
if(!I) return;
for(var i=0;i<I.length;i++) if(typeof(I[i])=="string") I[i] = { Name:I[i] };
var cfg = this.UpdateCfgItems(I);
var cols = this.UpdateColumnsItems(I,C.Attribute,C.Sort&1,C.HideUnused,M.Default,test);
var rows = this.UpdateRowsItems(I,C.Attribute,C.Sort&2,C.HideUnused,M.Default,test);
if(test && (cols || rows || cfg)) return true;
if(P){
   for(var i=0,I=M.Items,O={};i<I.length;i++) if(P[I[i].Name] && I[i].Text==null) {
      var II = P[I[i].Name]; if(test && II.length) return true; 
      II.splice(0,0,i,1); I.splice.apply(I,II); II.splice(0,2);
      i += II.length-2;
      }
   }
if(test) return false;
var dw = this.Img.Width; if(dw) for(var i=0;i<I.length;i++) if(I[i].Width && dw) I[i].Width *= dw;
this.UpdateSeparatorItems(I);
this.AddItemsColumns(I,C.Columns,C.CfgColumns);
var L = this.Lang["MenuButtons"];
M = TMenu.InitMenu(M,null,null,null,this.Rtl);
M.Modal = 1;
M.ShowCursor = 0;
M.CloseClickOut = 0;
M.Texts = { Ok:L["Ok"],Cancel:L["Cancel"],Reset:L["Reset"],All:L["ShowAll"],Clear:L["HideAll"] };
M.EnumTime = 0;
M.ClassEnum = "";
var A = GetWindowSize(1), MM = this.MainTag;
M.Pos = {Tag:this.CenterMessage||A[0]<MM.offsetWidth||A[1]<MM.offsetHeight?document.body:MM,Align:"center middle"};
this.Disabled = 1;

M.Class = this.Img.Style+"CfgMenu";

var T = this, cfgmenu = C==this.MenuCfg ? this.DefaultCfgMenu : null;
if(!M.Buttons) M.Buttons = cfgmenu ? ["Ok","Reset","Cancel"] : ((cols+rows>1) ? ["Ok","Clear","Cancel"] : ["Ok","Cancel"]);
if(cfgmenu) M.OnButton = function(but){ if(but=="Reset") { T.RestoreCfg(cfgmenu); M.Close(); } }
M.OnCSave = function(){ 
   T.Disabled = 0; 
   if(Grids.OnSaveMenu && Grids.OnSaveMenu(T,M,C,P)) return;
   if(C!=T.MenuCfg && Grids.OnColumnsFinish && Grids.OnColumnsFinish(this,M)) return;
   if(func) func(M,cols,rows); 
   else { 
      if(cfg) T.HideCfg(M); 
      if(cols) T.SetColumnsItems(M); 
      if(rows) T.SetRowsItems(M); 
      } 
   M.Saved = 1; 
   }
M.OnClose = function(){ 
   if(!M.Saved) { 
      T.Disabled = 0; 
      if(closefunc) closefunc();
      }
   
   if(Grids.OnCloseMenu) Grids.OnCloseMenu(T,M,C,P,M.Saved);
   }

M.Head = this.Lang[C.Name] ? this.Lang[C.Name]["Caption"] : C["Caption"];
this.SetDialogBase(M,null,null,"Cfg","Cfg");
MS.Animate; 
if(this.AnimateDialogs && !this.SuppressAnimations){ 
   M.AnimateShowDown = this.Animations["ShowMenu"]; M.AnimateShowUp = this.Animations["ShowMenuUp"]; 
   M.AnimateHideDown = this.Animations["HideMenu"]; M.AnimateHideUp = this.Animations["HideMenuUp"]; 
   }
ME.Animate;

if(Grids.OnShowMenu && Grids.OnShowMenu(this,M,C,P)) return;
if(C==this.MenuCfg) { if(Grids.OnShowCfg && Grids.OnShowCfg(this,M)) return; } 
else if(Grids.OnShowColumns && Grids.OnShowColumns(this,M)) return; 

M = ShowMenu(M);
return M;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ShowColumns = function(a,b,c){
if(a|b|c) alert("ShowColumns API is deprecated!");
else return this.ShowCfg(this.MenuColumns);
}
// -----------------------------------------------------------------------------------------------------------
// Saves changes in standard configuration items
TGP.SetCfgItems = function(I){
var upd = 0, G = this.Gantt ? this.Cols[this.GetFirstGantt()] : null;
for(var i=0;i<I.length;i++){
   if(I[i].Hidden) continue;
   if(I[i].Columns) upd |= this.SetCfgItems(I[i].Items);
   if(!I[i].Cfg) continue;
   var n = I[i].Name, v = I[i].Value;

   MS.Delete;
   if(n=="ShowDeleted" && v!=this.ShowDeleted){
      if(this.ChangeShowDeleted()) upd |= 2;
      }
   ME.Delete;
   
   MS.ReversedTree;
   if(n=="ReversedTree" && !v!=!this.ReversedTree){
      this.SetReversedTree(v,1); upd |= 4;
      }
   ME.ReversedTree;

   MS.Tree;
   if(n=="ShowTree"){
      if(v>=2&&v-2!=this.ReversedTree){
         if(this.HideTree) this.SetHideTree(0,1);
         this.SetReversedTree(v-2,1);
         upd |= 4;
         }
      else if(v>=2) { if(this.HideTree) this.SetHideTree(0); }
      else if(!this.HideTree) this.SetHideTree(v?1:2);
      else this.HideTree = v?1:2;
      }
   ME.Tree;

   MS.ColTree;
   if(n=="ColTree"&&v+1!=this.ColTree) {
      this.SetColTree(v+1);
      upd |= 1;
      }
   ME.ColTree;

   MS.Sort;
   MS.AutoSort;
   if(n=="AutoSort" && v!=this.AutoSort){
      if(v) this.SortRows(); 
      this.AutoSort = v;
      }
   ME.AutoSort;
   ME.Sort;
         
   if(n=="SortClick" && this.SortIcons != v){ this.SortIcons = v; this.UpdateHeader(); }
   if(n=="AutoUpdate") this.AutoUpdate = v;
   if(n=="CheckUpdates") this.Source.Check.Interval = v;
   if(n=="MouseHover") this.Hover = v;
   if(n=="ShowDrag") this.ShowDrag = v;
   if(n=="ShowBorder" && this.DefaultBorder != v) { this.DefaultBorder = v; upd |= 4; }
   if(n=="ShowFormulas" && this.FormulaShow != v) { this.FormulaShow = v; upd |= 4; }
   if(n=="ShowZeros" && this.HideZero != !v) { this.HideZero = !v; upd |= 4; }
   if(n=="FormulaTip") this.FormulaTip = v;
   if(n=="Animations") this.SuppressAnimations = !v;
   if(n=="PageBreaks") { this.ShowPrintPageBreaks = v ? 1 : 0; this.CallUpdatePrintPageBreaks = v?2:3; }
   if(n=="ShowButtons" && this.ShowButtons != v){ this.ShowButtons = v; for(var r=this.XS.firstChild;r;r=r.nextSibling) this.RefreshRow(r); }
   
   MS.CustomScroll;
   if(n=="Scrollbars" && this.CustomScroll!=v) { 
      this.CustomScroll = v;
      this.CustomHScroll = v;
      this.ScrollWidth = v ? this.Img["CSW"+this.CustomScroll] : CScrollWidth;
      this.ScrollHeight = v ? this.Img["CSH"+this.CustomHScroll] : CScrollHeight;
      upd |= 4;
      }
   ME.CustomScroll;
   MS.Touch;
   if(n=="Scroll" && this.ScrollAction!=v) this.SetScrollAction(v);
   ME.Touch;

   MS.Panel;
   if(n=="ShowPanel" && this.Cols.Panel.Visible != v){
      if(v) this.ShowCol("Panel");
      else this.HideCol("Panel");
      upd |= 1;
      }
   ME.Panel;
      
   MS.Pager;
   if(n=="ShowPager" && this.Pagers[0].Visible != v){
      this.HidePager(this.Pagers[0],v);
      upd |= 1;
      }
   ME.Pager;
   
   
   
   MS.Paging;
   if(n=="ShowAllPages" && this.AllPages != v){ this.SetAllPages(v); upd |= 10; }
   ME.Paging;

   if(n=="ShrinkStyle" && this.ShrinkStyle!=v) { this.ShrinkStyle = v; upd |= 1; }
   if(n=="Style" && this.Img.Style!=v) { this.NewStyle = v; upd |= 16; }
   if(n=="GanttStyle" && this.Img.GanttStyle!=v && this.Gantt) { this.NewGanttStyle = v; upd |= 16; }
   if(n=="StyleSize" && this.Size!=v) { this.NewSize = v; upd |= 32; }
   MS.Scale; if(n=="Scale" && this.Scale!=(v==1?"":v)) { this.NewScale = v==1?"":v; upd |= 64; } ME.Scale;
   if(n=="Contrast" && this.Contrast!=v) { this.NewContrast = v; upd |= 256; }

   if(n=="Language" && this.Language!=v){ this.NewLanguage = v; upd |= 128; }
   }
return upd;
}
// -----------------------------------------------------------------------------------------------------------
// Hides configuration menu and saves the changes
TGP.HideCfg = function(M){
var upd = this.SetCfgItems(M.Items); 
if(Grids.OnCfgChanged) { var upd2 = Grids.OnCfgChanged(this,M,upd); if(upd2!=null) upd = upd2; }
if(upd&&this.EditMode) this.EndEdit(1);
this.SaveCfg();
MS.Scale; if(upd&64) this.SetScale(this.NewScale,upd&4?3:0); ME.Scale;
if(upd&256) this.SetContrast(this.NewContrast,upd&4?3:0);
if(upd&32) { if(this.SetSize(this.NewSize,upd&144?3:0)) upd &= ~7; }
if(upd&8) this.CalculateSpaces(1);
if(upd&144) {
   if(upd&16) this.SetStyle(this.NewStyle?this.NewStyle:this.Img.Style,null,null,this.NewGanttStyle?this.NewGanttStyle:this.Img.GanttStyle,null,1);
   if(upd&128) this.SetLanguage(this.NewLanguage);
   }
else if(upd&4) this.Rerender();
else if(upd&2) this.RerenderBody();
else if(upd&1){ 
   this.Update();
   var r = this.FRow; this.FRow = null;
   this.Focus(r,this.FCol,null,this.FRect,2);
   }
}
// -----------------------------------------------------------------------------------------------------------
// Saves changes in columns
TGP.SetColumnsItems = function(M){
var C = this.Cols, V = { }, P = {}, chg = 0, pag = 0;
for(var i=0;i<M.Items.length;i++){
   var I = M.Items[i]; if(!I.Cols) continue;
   for(var j=0;j<I.Items.length;j++){
      var col = I.Items[j].Col, c = C[col], v = I.Items[j].Value;
      if(!c) { MS.Pager; c = this.Pagers[col]; if(c && c.Visible!=v) { pag++; P[col] = v;  } ME.Pager; }
      else if(c.Visible!=v){ chg++; V[col] = v; }
      }
   } 
if(Grids.OnColumnsChanged && Grids.OnColumnsChanged(this,V,chg,P,pag)) return;
if(!chg&&!pag) return;
if(this.EditMode) this.EndEdit(1);

if(pag) {
   for(var c in P) this.HidePager(this.Pagers[c],P[c]);
   if(!chg) { this.SaveCfg(); this.Update(); }
   }

if(chg){
   
   MS.ColTree;
   var F = this.GetFixedRows();
   for(var i=0;i<F.length;i++){
      if(F[i].Kind!="Header"&&this.HeaderColTree) continue;
      for(var c in V){ var exp = this.IsCellExpanded(F[i],c); if(exp) this.ExpandCell(F[i],c,V[c]); }
      }
   ME.ColTree;

   var S = [], H = []; 
   for(var c in V) if(V[c]) S[S.length] = c; else H[H.length] = c;
   MS.Animate; 
   if(this.AnimateCols && !this.SuppressAnimations) {
      if(S.length) { this.ChangeColsVisibility(S,null); this.AnimCols(S,"ShowCols"); }
      if(H.length) this.AnimCols(H,"HideCols",this.ChangeColsVisibility.bind(this,null,H)); 
      S = null; H = null;
      }
   ME.Animate;
   if(S||H) this.ChangeColsVisibility(S,H);
   }
if(Grids.OnAfterColumnsChanged) Grids.OnAfterColumnsChanged(this);  
}
// -----------------------------------------------------------------------------------------------------------
// Saves changes in rows
TGP.SetRowsItems = function(M){
var V = {}, chg = 0;
for(var i=0;i<M.Items.length;i++){
   var I = M.Items[i]; if(!I.Rows) continue;
   for(var j=0;j<I.Items.length;j++){
      var id = I.Items[j].Row, r = this.Rows[id], v = I.Items[j].Value;
      if(r && r.Visible!=v){ chg++; V[id] = v; }
      }
   } 
if(Grids.OnRowsChanged && Grids.OnRowsChanged(this,V,chg)) return;
if(!chg) return;
if(this.EditMode) this.EndEdit(1);
MS.Animate; this.FinishAnimations(); ME.Animate; 
this.StartUpdate();
for(var id in V) {
   var r = this.Rows[id];
   if(Grids.OnRowShow && Grids.OnRowShow(this,r,r.Visible)) continue;
   MS.Media; this.UpdateMedia("Rows","Visible",!r.Visible,id); ME.Media;
   if(r.Visible){
      if(this.Undo&8) this.AddUndo({Type:"Hide",Row:r});
      this.HideRow(r);
      }
   else {
      if(this.Undo&8) this.AddUndo({Type:"Show",Row:r});
      this.ShowRow(r);
      }
   }
this.EndUpdate();
if(this.SaveVisible) this.SaveCfg();
if(Grids.OnAfterRowsChanged) Grids.OnAfterRowsChanged(this);  
}
// -----------------------------------------------------------------------------------------------------------
ME.MenuCfg;

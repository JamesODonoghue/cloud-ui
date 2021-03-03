// -----------------------------------------------------------------------------------------------------------
// Functions for updating space rows for first load
// -----------------------------------------------------------------------------------------------------------
MS.Space;
// -----------------------------------------------------------------------------------------------------------
TGP.GetCellNames = function(row){
var xcells = {}, cells = row.Cells;
if(cells) for(var i=0;i<cells.length;i++) xcells[cells[i]] = 1;
return xcells;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateGroupRow = function(r,xcells){
MS.Group;
if(xcells["List"]){
   if(!r["ListDefaults"]) { r["ListDefaults"] = r["List"]; r["List"] = ""; }
   if(!r["ListType"]) r["ListType"] = "Select";
   if(!r["ListCustom"]) r["ListCustom"] = "";
   
   var Cols = r["Cols"];
   if(Cols){
      Cols = Cols.split(Cols.charAt(0));
      var s="", t="";
      for(var i=1;i<Cols.length;i++) s+="','"+Cols[i];
      s="['"+s.slice(3)+"']";
      r["ListFormula"] = "choose(Grid.Group,"+s+")";
      
      r["ListOnChange"] = "Grid.GroupRows("+s+"[Grid.GetDefaultsIndex(Row,Col)]);"
      }
   }
if(xcells["Custom"] || r["Custom"] || r["Custom"]!=0&&r.Cells.length==0){
   if(!xcells["Custom"]) r.Cells[r.Cells.length] = "Custom";
   r["CustomType"] = "DropCols";
   if(r["CustomText"]==null) { r["CustomText"] = this.GetText("GroupCustom"); this.ToTranslate[r.id+"#GroupCustom"] = { Row:r.id,Col:"CustomText",Text:"GroupCustom" } }
   r["CustomCanFocus"] = 0;
   
   r["CustomOnChange"] = "Grid.RefreshCell(Row,'Custom');Grid.GroupRows(Row[Col]);"
   r["CustomFormula"] = "Grid.Group";
   r["CustomRelWidth"] = 1;
   }

if(Get(r,"NoUpload")==null) r.NoUpload = 1;
if(Get(r,"Panel")==null) r.Panel = 1; 
if(r.Panel && !Get(r,"PanelOnEnter")) r["PanelOnEnter"] = "GroupOn OR GroupOff";

return;
MX.Group;
r.Visible=0;
ME.Group;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateSearchRow = function(r,xcells){
MS.Search;
var B = ["Filter","Select","Mark","Find","FindPrev","Clear","Help"];
if(xcells["Expression"]){
   var A = ["Type","Text","RelWidth",r.SpaceWrap?0:1,"Formula","Grid.SearchExpression==null?'':Grid.SearchExpression","CanEdit",1,"ToolTip",1];
   for(var i=0;i<A.length;i+=2) if(r["Expression"+A[i]]==null) r["Expression"+A[i]] = A[i+1];
   var act = r["ExpressionAction"], s = "Grid.SearchExpression=Value;";
   if(act==null) {
      if(xcells["Actions"]) act = s+"Grid.SearchRows(Row.Actions);";
      else for(var i=0;i<4;i++) if(xcells[B]) { act = s+"Grid.SearchRows('"+B+"');"; break; }
      if(!act) act = s+"Grid.SearchRows('Filter');"; 
      }
   else if(!act) act = s;
   else if(act.search(/\bFilter\b|\bSelect\b|\bMark\b|\bFind\b/)>=0 || act=="Last" || act=="Refresh") act = s + "Grid.SearchRows('"+act+"');";
   else if(act=="Actions") act = s+"Grid.SearchRows(Row.Actions);";
   r["ExpressionOnChange"] = act; 
   r["ExpressionAction"] = null; 
   
   }
MS.Button;
for(var i=0;i<B.length;i++){
   var b=B[i];
   if(xcells[b]){
      if(!r[b+"Type"]) r[b+"Type"] = "Button";
      if(!r[b+"Button"]) r[b+"Button"] = "Button";
      if(!r[b+"ButtonText"]) { r[b+"ButtonText"] = this.GetText("Search"+b); this.ToTranslate[r.id+"#Search"+b] = { Row:r.id,Col:b+"ButtonText",Text:"Search"+b } }
      if(!r[b+"OnClick"]) r[b+"OnClick"] = "Grid.SearchRows('"+b+"');return 1;";
      if(!r[b+"OnEnter"]) r[b+"OnEnter"] = "Grid.SearchRows('"+b+"');";
      if(!r[b+"Formula"]) r[b+"Formula"] = "Grid.SearchAction=='"+b+"'";
      if(r[b+"Width"]==null && r.Width) r[b+"Width"] = r.Width;
      if(r[b+"MinWidth"]==null) r[b+"MinWidth"] = 30;
      }
   } 
if(xcells["Search"]){
   if(!r["SearchType"]) r["SearchType"] = "Button";
   if(!r["SearchButton"]) r["SearchButton"] = "Button";
   if(!r["SearchButtonText"]) { r["SearchButtonText"] = this.GetText("SearchSearch"); this.ToTranslate[r.id+"#SearchSearch"] = { Row:r.id,Col:"SearchButtonText",Text:"SearchSearch" } }
   if(!r["SearchOnClick"]) r["SearchOnClick"] = "Grid.SearchRows(Row.Actions);return 1;";
   if(!r["SearchOnEnter"]) r["SearchOnEnter"] = "Grid.SearchRows(Row.Actions);";
   if(!r["SearchFormula"]) r["SearchFormula"] = "Grid.SearchAction==Row.Actions";
   }
ME.Button;   
if(xcells["Actions"]){
   if(!r["ActionsType"]) r["ActionsType"] = "Select";
   if(!r["ActionsDefaults"]) r["ActionsDefaults"] = "|Filter|Select|Mark|Find"+(xcells["Clear"]?"":"|Clear");
   if(!r["Actions"]) r["Actions"] = "Filter";
   if(r["ActionsAction"]=="Refresh" || !xcells["Search"] && !r["ActionsAction"]) { r["ActionsOnChange"] = "Grid.SearchRows(Get(Row,Col));"; r["ActionsAction"] = null; }
   }
if(xcells["Cols"]){

   if(!r["ColsType"]) r["ColsType"] = "Select";
   if(!r["ColsCanFocus"]) r["ColsCanFocus"] = 0;
   if(!r["ColsAction"]) {
      var Cols = r["ColsCols"];
      if(Cols){
         Cols = Cols.split(Cols.charAt(0));
         var s="";
         for(var i=1;i<Cols.length;i++) s+="','"+Cols[i];
         s="['"+s.slice(3)+"']";
         r["ColsFormula"] = "var r=choose(Grid.SearchCols?Grid.SearchCols:'',"+s+");return r?r:''";
         
         r["ColsOnChange"] = "Grid.SearchCols="+s+"[Grid.GetDefaultsIndex(Row,Col)];Grid.SearchRows('Refresh');"
         }
      }
   }
if(xcells["Defs"]){

   if(!r["DefsType"]) r["DefsType"] = "Select";
   if(!r["DefsCanFocus"]) r["DefsCanFocus"] = 0;
   if(!r["DefsAction"]) {
      var Cols = r["DefsDefs"];
      if(Cols){
         Cols = Cols.split(Cols.charAt(0));
         var s="";
         for(var i=1;i<Cols.length;i++) s+="','"+Cols[i];
         s="['"+s.slice(3)+"']";
         r["DefsFormula"] = "var r=choose(Grid.SearchDefs?Grid.SearchDefs:'',"+s+");return r?r:''";
         
         r["DefsOnChange"] = "Grid.SearchDefs="+s+"[Grid.GetDefaultsIndex(Row,Col)];Grid.SearchRows('Refresh');"
         }
      }
   }
if(xcells["Case"]){

   if(!r["CaseType"]) r["CaseType"] = "Bool";
   if(!r["CaseWidth"]) r["CaseWidth"] = -1;
   if(!r["CaseOnChange"]) r["CaseOnChange"] = "Grid.SearchCaseSensitive=Get(Row,Col)?1:0;Grid.SearchRows('Refresh');";
   if(!r["CaseFormula"]) r["CaseFormula"] = "Grid.SearchCaseSensitive?1:0";
   if(r["CaseCanEdit"]==null) r["CaseCanEdit"] = 1;
   }
if(xcells["Type"]){

   if(!r["TypeType"]) r["TypeType"] = "Bool";
   if(!r["TypeWidth"]) r["TypeWidth"] = -1;
   if(!r["TypeOnChange"]) r["TypeOnChange"] = "Grid.SearchCells=Get(Row,Col)?1:0;Grid.SearchRows('Refresh');";
   if(!r["TypeFormula"]) r["TypeFormula"] = "Grid.SearchCells?1:0";
   if(r["TypeCanEdit"]==null) r["TypeCanEdit"] = 1;
   }
if(xcells["List"]){

   if(!r["ListType"]) r["ListType"] = "Select";
   var exp = r["ListExpressions"];
   if(exp){
      exp = exp.split(exp.charAt(0));
      var s="";
      for(var i=1;i<exp.length;i++) s+="','"+exp[i].replace(/\'/g,"\\'");
      
      s = "Grid.SearchExpression=['"+s.slice(3)+"'][Grid.GetDefaultsIndex(Row,Col)];"
      var act = r["ListAction"];
      if(!act) act = xcells["Actions"] ? s+"Grid.SearchRows(Row.Actions);" : s;
      else  if(act.search(/\bFilter\b|\bSelect\b|\bMark\b|\bFind\b/)>=0 || act=="Last" || act=="Refresh") act = s + "Grid.SearchRows('"+act+"');";
      else if(act=="Actions") act = s+"Grid.SearchRows(Row.Actions);";
      r["ListFormula"] = "var d=Row.ListExpressions,r=choose(Grid.SearchExpression?Grid.SearchExpression:'',d.slice(1).split(d.charAt(0)));return r?r:''";
      r["ListOnChange"] = act; 
      if(r["ListAction"]) r["ListAction"] = null;
      }
   }

if(Get(r,"NoUpload")==null) r.NoUpload = 1;

if(Get(r,"Panel")==null) r.Panel = 1; 
if(r.Panel && !Get(r,"PanelOnEnter")) r["PanelOnEnter"] = "SearchOn OR SearchOff";

return;
MX.Search;
r.Visible = 0;
ME.Search;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdatePagerRow = function(r,xcells){
MS.Paging;
if(xcells["Pager"]){
   r["PagerType"] = "Pages";
   r["PagerCanFocus"] = 0;
   if(r["PagerRelWidth"]==null) r["PagerRelWidth"] = 1;
   }
r.NoUpload=1; 
r.NoColorState=1;
return;
MX.Paging;
r.Visible = 0;
ME.Paging;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateToolbarRow = function(r,xcells){
MS.Toolbar;
if(!r.Cells) r.Cells = [];
if(Get(r,"NoUpload")==null) r.NoUpload = 1;
if(Get(r,"NoColorState")==null) r.NoColorState = 1;

for(var i=0;i<r.Cells.length;i++){
   var c = r.Cells[i];
   if(Get(r,c+"Type")==null) r[c+"Type"] = "Button";
   }

if(r!=this.Toolbar&&r.Mirror!=this.Toolbar.id) return;
var ll = "Li"+"nk";

if(!r.SetAlready){
   if(this.Reset){
      if(this.Reset.Style) r.Styles = 0;
      if(this.Reset.GanttStyle) r.GanttStyles = 0;
      if(this.Reset.Language!=null) r.Languages = 0;
      }
   if(r[ll]=="0" && r["Empty"]==null) r["Empty"] = "0";
   if(r.Formula){ r["FormulaFormula"] = r.Formula; r.Formula = ""; } else if(!r["FormulaFormula"]) r.Formula = 0;
   for(var i=0,X={};i<CToolbarCells.length;i++) X[CToolbarCells[i]] = 1;   
   for(var i=0,A=[];i<r.Cells.length;i++) if(r[r.Cells[i]]!="0" || !X[r.Cells[i]]) A[A.length] = r.Cells[i];
   r.Cells = A;
   
   r.SetAlready = 1;
   }

if(!xcells[ll]){
   if(xcells["Empty"]) ll = "Empty";
   else if(xcells["Formula"]) r.Cells = r.Cells.join(",").replace(",Formula",",Link,Formula").split(",");
   else if(xcells["Resize"]) r.Cells = r.Cells.join(",").replace(",Resize",",Link,Resize").split(",");
   else r.Cells[r.Cells.length] = ll;
   }
   
if(ll!="Empty"){
   if(r[ll]==0) r[ll+"Visible"] = 0; 
   if(r[ll+"Visible"]==0) return;
   }

var lnk = r[ll];
var coq = "ht"+"t"+"p:/"+"/ww"+"w.t"+"re"+"eg"+"ri"+"d."+"co"+"m/";
if(lnk && (lnk+"").length>1){ 
   lnk = lnk.split(lnk.charAt(0));
   lnk = (lnk[3]?" title='"+lnk[3]+"'":"")+" onclick='if(Try){window.open(\""+lnk[1]+"\");} else if(Catch){}'>"+(lnk[2]?lnk[2]:lnk[1]);
   }
else { 
   var CVersion = window["Co"+"mp"+"on"+"en"+"t"];
   if(CVersion) CVersion = CVersion["Ve"+"rs"+"io"+"n"];
   if(!CVersion) CVersion = "";
   else if(!BIE5) CVersion = (CVersion+"").replace(new RegExp("\\.\\d+(?=[^\\.]*$)"),""); 
      
   MS._Reg;
   lnk = " title='"+coq+"'" + " onclick='window.open(\""+coq+"\");'" + ">EJ"+"S Tre"+"eG"+"rid "+CVersion;
   MX._Reg;
   if(CDM==11) lnk = "><span style='color:red;font:bold 9px/10px Arial;background:white;text-decoration:inherit;'>"+CNBSP+"De"+"mon"+"st"+"rat"+"ion"+CNBSP+"</span> "+"of EJ"+"S Tre"+"eG"+"rid "+CVersion;
   else {
      MS._Free;
      lnk = " title='"+"Yo"+"u c"+"an "+"bu"+"y i"+"t a"+"t "+coq+"'" + " onclick='window.open(\""+coq+"\");'"
         + ">EJ"+"S Tre"+"eG"+"rid "+CVersion 
         + " <span style='color:blue;font:bold 9px/10px Arial;background:white;text-decoration:inherit;'>"+CNBSP+"F"+"r"+"e"+"e </span>";
      MX._Free;                        
      lnk = " title='"+"Yo"+"u c"+"an "+"bu"+"y i"+"t a"+"t "+coq+"'" + " onclick='window.open(\""+coq+"\");'"
          + ">EJ"+"S Tre"+"eG"+"rid "+CVersion
          + " <span style='color:red;font:bold 9px/10px Arial;background:white;text-decoration:inherit;'>"+CNBSP+"Tr"+"ia"+"l u"+"nr"+"eg"+"i"+"st"+"er"+"ed"+CNBSP+"</span>";
      ME._Free;
      }
   ME._Reg;
   }
r[ll] = "<div dir='ltr' style='overflow:hidden;height:"+(BIE?12:10)+"px;cursor:default;padding-top:2px;padding-left:3px;padding-right:3px;white-space:nowrap;font:9px/10px Arial; color:#777777;'>"
      + "<span style='font:bold 9px/10px Arial;"+CCursorPointer+"'"
      + (this.Hover>=1 ? " onmouseover='this.style.color=\"black\";this.style.textDecoration=\"underline\"' onmouseout='this.style.color=\"#777777\";this.style.textDecoration=\"\"'" : "")
      + lnk + "</span></div>";
r[ll+"Type"] = "Html";      
r[ll+"CanFocus"] = 0;
r[ll+"NoColor"] = 1;
r[ll+"Width"]=-1;
if(!r.SpaceWrap) r[ll+"RelWidth"] = 1;
r[ll+"Visible"] = 1;
r[ll+"ShowHint"] = 0;
return;
MX.Toolbar;
r.Cells=["Html"]; r["HtmlType"]="Html"; r.Space = 4; r.Kind="Space"; 
MS._Reg;
r.Html="<span class='"+this.Img.Style+"Text'>Module 'Toolbar' not available</span>";
MX._Reg;
var coq = "ht"+"t"+"p:/"+"/ww"+"w.t"+"re"+"eg"+"ri"+"d."+"co"+"m/";
coq =" <a style='color:red;' href='"+coq+"'>EJ"+"S "+"Tr"+"ee"+"Gr"+"id"+" Tr"+"ia"+"l u"+"nr"+"eg"+"is"+"te"+"re"+"d</a>"; 
r.Html = "<div style='padding-top:2px;padding-left:3px;padding-right:3px;white-space:nowrap;font:9px arial;'>" + coq + "</div>";
ME._Reg;
ME.Toolbar;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateTabberRow = function(r){
if(!r.Cells) return;
if(Get(r,"NoUpload")==null) r.NoUpload = 1;
if(Get(r,"NoColorState")==null) r.NoColorState = 1;
for(var i=0;i<r.Cells.length;i++){ 
   var c = r.Cells[i], t = Get(r,c+"Type");
   if(!t) { t = "Button"; r[c+"Type"] = t; }
   if(t=="Button" && !this.GetAttr(r,c,"Button")){ 
      r[c+"Button"] = "Tab";
      if(this.GetAttr(r,c,"Radio")==null) r[c+"Radio"] = 1;
      }
   }  
}
// -----------------------------------------------------------------------------------------------------------
MS.Lang;
TGP.GetLanguages = function(sep){
var S = this.Languages, U = this.UseLanguages, s = 1; if(!U) return S;
var A = {}; U = U.split(","); for(var i=0;i<U.length;i++) if(S[U[i]]) A[U[i]] = S[U[i]]; else if(sep&&U[i].charAt(0)=="-") A["-"+s++] = U[i];
return A;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetLanguagesList = function(){
var S = this.GetLanguages(1), L = [], SS = this.Languages, cols = this.LanguagesColumns;
for(var s in S) L[L.length] = SS[s] ? "{Name:'"+s+"',Tip:'"+(S[s].Tip?StringToJson(S[s].Tip).replace(/'/g,"\'"):"")+"',Text:'<div class=\""+this.Img.Style+"MenuItemLanguage "+this.Img.Style+"ToolLang"+s+"\">"+(S[s].Name?S[s].Name:S[s].Code)+"</div>'}" : "{Name:'"+S[s]+"'}";
return "{MainClass:'"+this.Img.Style+"ToolMenuFlags',"+(cols?"AutoColumns:"+cols+",":"")+"Items:["+L.join(",")+"]}";
}
ME.Lang;
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateSpaceCells = function(r){
var CellNames = { }, cells = [], p = 0;
r.CellNames = CellNames; 
if(!r.Cells) return;
for(var i=0;i<r.Cells.length;i++){
   var col = r.Cells[i], type = r[col+"Type"];

   if((type=="Styles"||type=="GanttStyles"||type=="Sizes"||type=="Contrasts"||type=="Scales"||type=="Languages") && r[col]!=1||type=="Sheets"&&r[col]==2){
      if(!r[col] || !this.Gantt&&type=="GanttStyles") { r.Cells.splice(i--,1); if(!BIE && (!BIEA||BIEA8)) { if(r["GanttStylesLabel"]) delete r["GanttStylesLabel"]; if(r["GanttStylesType"]) delete r["GanttStylesType"]; } continue; }
      r[col+"Type"] = "Button"; 
      if(r[col+"Button"]==null) r[col+"Button"] = "Html"; 
      if(r[col+"Switch"]==null) r[col+"Switch"] = 1; 
      if(r[col+"PopupIcon"]==null) r[col+"PopupIcon"] = 2;
      var L = [], F = [], O = [];
      if(type=="Sheets"){
         var S = this.GetSheets(r[col+"ShowHidden"]?1:0);
         r[col+"Formula"] = "Grid.GetActiveSheet()";
         r[col+"OnChange"] = "Grid.LoadSheet(Value);";
         r[col+"List"] = S.join(",");
         }
      else if(type=="Languages"){
         MS.Lang;
         r[col+"ClassFormula"] = "'"+this.Style+"ToolLang'+Grid.Language";
         r[col+"Formula"] = "Grid.Language";
         r[col+"OnChange"] = "if(!(Grid.Locked['cfg'])) Grid.SetLanguage(Value);"
         r[col+"OnClick"] = "Grid.Locked['lang']?1:0";
         r[col+"Button"] = "Class";
         r[col+"List"] = this.GetLanguagesList();
         ME.Lang;
         if(r[col+"VisibleFormula"]&&r[col+"Label"]&&r[col+"LabelVisible"]==null&&r[col+"LabelVisibleFormula"]==null) r[col+"LabelVisibleFormula"] = r[col+"VisibleFormula"];
         }
      else if(type=="Styles"||type=="GanttStyles"){
         var S = type=="Styles" ? this.Styles : this.GanttStyles, LC = [];
         for(var s in S){ var X = S[s]; if(S[s].Compatible) LC[LC.length] = X.Name; else L[L.length] = X.Name; F[F.length] = X.Style+":'"+X.Name+"'"; O[O.length] = X.Name+":'"+X.Style+"'"; }
         r[col+"Formula"] = type=="Styles" ? "var S={"+F.join(",")+"}[Grid.Style];return S?S:Grid.Style;" : "var S={"+F.join(",")+"}[Grid.GanttStyle];return S?S:Grid.GanttStyle;";
         r[col+"OnChange"] = type=="Styles" ? "if(!(Grid.Locked['cfg']))Grid.SetStyle({"+O.join(",")+"}[Value],null,null,Grid.GanttStyle,null,1);" : "if(!(Grid.Locked['cfg']))Grid.SetStyle(Grid.Style,null,null,{"+O.join(",")+"}[Value],null,1);";
         r[col+"OnClick"] = "Grid.Locked['size']?1:0";
         var cc = this.GetText("CompatibleStyles");
         if(!cc||!LC.length) cc = "";
         else if(!L.length) { cc = ""; L = LC; }
         else cc = ",{Name:'-'},{Name:'Compatible',Text:"+this.This+".GetText('CompatibleStyles'),Menu:1,Items:[{Name:'"+LC.join("'},{Name:'")+"'}]}"; 
         r[col+"List"] = "{Items:[{Name:'"+L.join("'},{Name:'")+"'}"+cc+"]}";
         }
      else {
         var S = ParseObject(type=="Scales"?this.Scales:type=="Sizes"?this.Sizes:this.Contrasts);
         for(var s in S){ var X = S[s]; L[L.length] = s; F[F.length] = "'"+X+"':'"+s+"'"; O[O.length] = "'"+s+"':'"+X+"'"; }
         var n = type=="Scales" ? "Scale" : type=="Sizes" ? "Size" : "Contrast";
         if(type=="Scales") for(s in S) if(S[s]==1) { F[F.length] = "'':'"+s+"'"; break; }
         r[col+"Formula"] = "var S={"+F.join(",")+"}[Grid."+n+"];return S?S:Grid."+n+";";
         r[col+"OnChange"] = "if(!(Grid.Locked['cfg']))Grid.Set"+n+"({"+O.join(",")+"}[Value]);";
         r[col+"OnClick"] = "Grid.Locked['size']?1:0";
         r[col+"List"] = L.join(",");
         }
      i--; 
      continue;
      }

   if(r[col+"Left"]){  
      var cl = col+"Left";
      for(var j=0;j<r.Cells.length;j++) if(r.Cells[j]==cl) break;
      if(j==r.Cells.length){
         if(!r[cl+"Type"]) r[cl+"Type"] = "Html";
         r[cl+"CanFocus"] = 0;
         if(r[cl+"NoColor"]==null) r[cl+"NoColor"] = 1;
         if(r[cl+"Width"]==null) r[cl+"Width"] = r[col+"Left"];
         if(r[cl+"CanPrint"]==null) r[cl+"CanPrint"] = r[col+"CanPrint"];
         if(r[cl+"PrintHPage"]==null) r[cl+"PrintHPage"] = r[col+"PrintHPage"];
         if(r[cl+"ClassInner"]==null) r[cl+"ClassInner"] = "";
         r[cl+"NoSpace"] = "Both";
         
         r[col+"Left"] = "";
         
         CellNames[cl] = 1; cells[p++] = cl;
         }
      }
   var right = 0;
   if(r[col+"Label"] || r[col+"LabelRight"]){ 
      var cl = col+"Label"; if(!r[cl]) { cl = col+"LabelRight"; right = 1; }
      for(var j=0;j<r.Cells.length;j++) if(r.Cells[j]==cl) break;
      if(j==r.Cells.length){
         if(!r[cl+"Type"]) r[cl+"Type"]="Html";
         r[cl+"CanFocus"] = 0;
         if(r[cl+"NoColor"]==null) r[cl+"NoColor"] = 1;
         if(!r[cl+"Tip"]) r[cl+"Tip"] = r[col+"Tip"];
         if(r[cl+"Width"]==null) r[cl+"Width"] = -1;
         if(r[cl+"Wrap"]==null) r[cl+"Wrap"] = 0;
         if(r[cl+"CanPrint"]==null) r[cl+"CanPrint"] = r[col+"CanPrint"];
         if(r[cl+"PrintHPage"]==null) r[cl+"PrintHPage"] = r[col+"PrintHPage"];
         r[cl+"NoSpace"] = right?"Left":"Right";
         r[col+"NoSpace"] = right?"Right":"Left";
         
         if(right) { CellNames[col] = 1; cells[p++] = col; right = 2; }
         CellNames[cl] = 1; cells[p++] = cl;
         }
      }
   if(right!=2 && type!="Pager" && type!="Sheets" && type!="Styles" && type!="GanttStyles" && type!="Sizes" && type!="Contrasts" && type!="Scales" && type!="Languages") { CellNames[col] = 1; cells[p++] = col; }
   
   if(type=="Bool"){
      if(!r[col+"Width"]) r[col+"Width"] = -1;
      }
      
   else if(type=="Button"){
      var st = this.GetAttr(r,col,"Button");
      if(!r[col+"Width"] && st!="TabSep") r[col+"Width"] = r.Width?r.Width:-1;
      if(st=="Tab" && (i==r.Cells.length-1||(r[r.Cells[i+1]+"Style"]+"").slice(0,6)!="TabSep")) {
         r[col+"Style"] = st;
         var cc = "TabSep"+i;
         if(i==r.Cells.length-1){
            if(!r.RelWidth&&!r.SpaceWrap) { r[cc+"Style"] = "TabSepLast"; r[cc+"RelWidth"] = 1; r.RelWidth = 1; }
            else continue; 
            }
         else {
            var tb = this.GetAttr(r,r.Cells[i+1],"Button");
            if(tb!="Tab" && tb!="TabSep") r[cc+"Style"] = "TabSepRight";
            }
         r[cc+"Type"] = "Button";
         if(r[cc+"Style"]==null) r[cc+"Style"] = "TabSep";
         r[cc+"Button"] = "TabSep";
         r[cc+"NoColor"] = 1;
         if(r[cc+"CanPrint"]==null) r[cc+"CanPrint"] = r[col+"CanPrint"];
         if(r[cc+"PrintHPage"]==null) r[cc+"PrintHPage"] = r[col+"PrintHPage"];
         if(i>0 && (this.GetAttr(r,r.Cells[i-1],"Button")+"").indexOf("Tab")<0) {
            var cx = "TabSep"+(i-1);
            r[cx+"Type"] = "Button";
            r[cx+"Style"] = "TabSepLeft";
            r[cx+"Button"] = "TabSep";
            r[cx+"NoColor"] = 1;
            if(r[cx+"CanPrint"]==null) r[cx+"CanPrint"] = r[col+"CanPrint"];
            if(r[cx+"PrintHPage"]==null) r[cx+"PrintHPage"] = r[col+"PrintHPage"];
            cells[p-1] = cx;
            cells[p++] = col;
            }
         cells[p++] = cc;
         CellNames[cc] = 1;
         }
      else if(st=="TabSep" && (!r[col+"Style"]||!r[col+"Button"])){
         var zc = col;
         if((r[cells[p-2]+"Style"]+"").indexOf("TabSep")!=0) r[col+"Style"] = "TabSepLeft";
         else { 
            col = cells[p-2];
            if(col!=zc && this.DebugFlags["check"]) { r[zc+"Visible"] = -1; } 
            else { p--; cells.pop();  }
            }
         if(i==0) r[col+"Style"] = "TabSepFirst";
         else if(i==r.Cells.length-1) r[col+"Style"] = "TabSepLast";
         if(r[zc+"Width"]>0) r[col+"Width"] = r[zc+"Width"];
         else if(!r.SpaceWrap) { r[col+"RelWidth"] = 1; r.RelWidth = 1; }
         r[col+"Button"] = "TabSep";
         r[col+"NoColor"] = 1;
         }
      }
   else if(type=="DropCols"){ 
      this.MoveColsFull = 1; 
      r[col+"CanFocus"] = 0;
      r[col+"NoColor"] = 1;
      }
   else if(type=="Pages"){
      MS.Paging;
      r.HasPages = col; 
      r[col+"CanFocus"] = 0; 
      r[col+"NoColor"] = 1;
      if(r[col+"Align"]==null) r[col+"Align"] = "Center";
      ME.Paging;
      }
   else if(type=="Sheets"){ 
      
      }
   else if(type=="Styles"||type=="GanttStyles"||type=="Sizes"||type=="Contrasts"||type=="Scales"){
      if(this.DebugFlags["check"]) { r[col+"Type"] = "Hidden"; CellNames[col] = 1; cells[p++] = col; }
      else r.Cells.splice(i--,1);
      var A = {}; for(var n in r) if(n.indexOf(col)==0) A[n.slice(col.length)] = r[n];
      var S = type=="Styles"?this.Styles:(type=="GanttStyles"?this.GanttStyles:ParseObject(type=="Sizes"?this.Sizes:type=="Scales"?this.Scales:this.Contrasts)), j = 0;
      var S1 = {"Styles":"Style","GanttStyles":"GanttStyle","Sizes":"Size","Contrasts":"Contrast","Scales":"Scale"}, S2 = {"Styles":"SetStyle","GanttStyles":"SetStyle","Sizes":"SetSize","Contrasts":"SetContrast","Scales":"SetScale"};
      var S3 = {"Styles":",null,null,Grid.GanttStyle,1","GanttStyles":",1","Sizes":"","Contrasts":"","Scales":""};
      for(var s in S){
         var X = S[s], n = type=="Styles"||type=="GanttStyles"?X.Name:s, cc = col+n, v = type=="Styles"||type=="GanttStyles"?X.Style:X; if(s=='-') continue;
         r[cc+"Button"] = "Html"; r[cc+"Switch"] = 1; 
         for(var a in A) if(a.search(/Label|Left/)<0) r[cc+a] = A[a];
         r[cc+"Type"] = "Button";
         r[cc+"ButtonText"] = n;
         r[cc+"Formula"] = "Grid."+S1[type]+"=='"+v+"'";
         r[cc+"OnClick"] = "if(!(Grid.Locked['cfg'])) Grid."+S2[type]+(type=="GanttStyles"?"(Grid.Style,null,null,'":"('")+v+"'"+S3[type]+");return 1;";
         r[cc+"OnEnter"] = r[cc+"OnClick"];
         r.Cells.splice(i+(j++)+1,0,cc);
         }
      continue;
      }
    else if(type=="Languages"){
      MS.Lang;
      if(this.DebugFlags["check"]) { r[col+"Type"] = "Hidden"; CellNames[col] = 1; cells[p++] = col; }
      else r.Cells.splice(i--,1);
      var A = {}; for(var n in r) if(n.indexOf(col)==0) A[n.slice(col.length)] = r[n];
      var S = this.GetLanguages(), j = 0;
      if(r[col+"VisibleFormula"]&&r[col+"Label"]&&r[col+"LabelVisible"]==null&&r[col+"LabelVisibleFormula"]==null) r[col+"LabelVisibleFormula"] = r[col+"VisibleFormula"];
      for(var s in S) {
         var cc = col+s;
         r[cc+"Button"] = "Html"; r[cc+"Switch"] = 1; 
         for(var a in A) if(a.search(/Label|Left/)<0) r[cc+a] = A[a];
         r[cc+"Type"] = "Button";
         r[cc+"ButtonText"] = "<div class=\""+this.Img.Style+"ToolLanguagesSingle "+this.Img.Style+"ToolLang"+s+"\">"+CNBSP+"</div>";
         r[cc+"Formula"] = "Grid.Language=='"+s+"'";
         r[cc+"OnClick"] = "if(!(Grid.Locked['cfg'])) Grid.SetLanguage('"+s+"');"
         r[cc+"OnEnter"] = r[cc+"OnClick"];
         r.Cells.splice(i+(j++)+1,0,cc);

         }
      ME.Lang;
      }
   else if(type=="Pager"){ 
      MS.Paging;
      var nclr = Get(r,col+"NoColor"), cf = Get(r,col+"CanFocus")==1;
      if(this.DebugFlags["check"] && col!="Pager") {
         cells[p++] = col; CellNames[col] = 1;
         r[col+"Visible"] = 0;
         r[col+"CanFocus"] = 0;
         }
      col = "Pager"; 
      r.HasPager = col;
      
      var cc = col+"First";  cells[p++] = cc; CellNames[cc] = 1;
      r[cc+"OnClick"]="Grid.GoToPageNum(1)"; r[cc+"OnEnter"]="Grid.GoToPageNum(1);Grid.Focus(Row,Col,null,null,2);";
      r[cc+"Formula"]="Grid.GetFPage(1)!=Grid.Body.firstChild"; 
      
      cc = col+"Prev";  cells[p++] = cc; CellNames[cc] = 1;
      r[cc+"OnClick"]="Grid.GoToPrevPage(0,1)"; r[cc+"OnEnter"]="Grid.GoToPrevPage();Grid.Focus(Row,Col,null,null,2);";
      r[cc+"Formula"]="Grid.GetFPage(1)!=Grid.Body.firstChild";

      cc = col+"Edit"; cells[p++] = cc; CellNames[cc] = 1; 
      
      r[cc+"SpaceClass"] = "PagerEdit";
      r[cc+"Type"]="Int"; r[cc+"CanEdit"]=1; if(!r[cc+"Width"]) r[cc+"Width"]=60; 
      r[cc+"OnChange"]="Grid.GoToPageNum(Value<1?1:(Value>Grid.Body.childNodes.length?Grid.Body.childNodes.length : Value));"+(cf?"Grid.Focus(Row,Col,null,null,2);":"");
      r[cc+"Formula"]="if(Grid.Loading||Grid.Rendering)return -1;Row[Col+'HtmlPostfix']=' / '+Grid.Body.childNodes.length"+(this.Rtl?"+'</div>'":"")+";return Grid.GetPageNum(Grid.GetFPage(1))+1";
      
      if(!r[cc+"CanFocus"]) r[cc+"CanFocus"] = 2;
      if(r[cc+"CanPrint"]==null) r[cc+"CanPrint"] = r[col+"CanPrint"];
      if(r[cc+"PrintHPage"]==null) r[cc+"PrintHPage"] = r[col+"PrintHPage"];

      cc = col+"Next";  cells[p++] = cc; CellNames[cc] = 1;
      r[cc+"OnClick"]="Grid.GoToNextPage(0,1)"; r[cc+"OnEnter"]="Grid.GoToNextPage();Grid.Focus(Row,Col,null,null,2);";
      r[cc+"Formula"]="Grid.GetFPage(1)!=Grid.Body.lastChild";
      
      cc = col+"Last";  cells[p++] = cc; CellNames[cc] = 1;
      r[cc+"OnClick"]="Grid.GoToPageNum(Grid.Body.childNodes.length)"; r[cc+"OnEnter"]="Grid.GoToPageNum(Grid.Body.childNodes.length);Grid.Focus(Row,Col,null,null,2);"; 
      r[cc+"Formula"]="Grid.GetFPage(1)!=Grid.Body.lastChild";

      var X = ["First","Prev","Next","Last"];
      for(var k=0;k<X.length;k++){
         var cc = col+X[k];
         r[cc+"Type"] = "Button"; r[cc+"NoColor"] = nclr; r[cc+"CanFocus"] = cf;   
         if(r[cc+"CanPrint"]==null) r[cc+"CanPrint"] = r[col+"CanPrint"];
         if(r[cc+"PrintHPage"]==null) r[cc+"PrintHPage"] = r[col+"PrintHPage"];
         }

      ME.Paging;
      }
   else if(type=="SelectGanttZoom"){
      
      }      
   else if(type=="SelectGanttResources"){
         
      }  
   else if(type=="SelectPivot"){
      MS.Pivot;
      r[col+"Type"] = "Select";
      var sep = r[col+"Separators"]; if(!sep) sep = this.Lang.Format["PivotSeparators"]; if(!sep) sep = "|,|:|, | + | = ";
      var sepc = sep.charAt(0);
      sep = sep.split(sepc);
      if(!sep[3]) sep[3] = sep[1];
      if(!sep[4]) sep[4] = sep[2];
      if(!sep[5]) sep[5] = sep[2];
      if(!r[col+"Formula"]) r[col+"Formula"] = "Grid.GetDefPivot(\""+StringToJson(sep.join(sepc))+"\")";
      if(!r[col+"OnChange"]) r[col+"OnChange"] = "Grid.SetDefPivot(Value,\""+StringToJson(sep.join(sepc))+"\")";
      var def = r[col+"Defaults"];
      if(def){ 
         var c = def.charAt(0), G = this.PivotGrid; if(!G) G = this;
         def = def.slice(1).split(c);
         for(var l=0;l<def.length;l++){
            var A = def[l].replace(/\s+/g,"").split(sep[2]);
            for(var j=0;j<A.length;j++){
               var B = A[j].split(sep[1]);
               for(var k=0;k<B.length;k++) { var n = G.GetCaption(B[k]); if(n) B[k] = n; }
               A[j] = B.join(sep[3]);
               }
            def[l] = A[0]+sep[4]+A[1]+sep[5]+A[2];
            }
         r[col+"Defaults"] = c + def.join(c);
         }
      ME.Pivot;
      } 

   if(!r[col+"Width"]&&(type!="Button"||st!="TabSep")) {
      var w = r.Width;
      if(w) r[col+"Width"] = w;
      else if(Get(r,col) && (Get(r,col+"CanEdit")==0 || !this.EditTypes[type]) && !Get(r,col+"Button") && type!="Select" && !r[col+"RelWidth"]) r[col+"Width"] = -1;
      else r[col+"Width"] = this.Cols[col] && this.Cols[col].Width ? this.Cols[col].Width : (r[col+"RelWidth"]?1000:100);
      }
   else if(r[col+"RelWidth"]) r[col+"Width"] = 1000; 
   if(r[col+"RelWidth"]) r.RelWidth = 1;
   
   if(r[col+"Names"]) r.Names = 1;
   }
r.Cells = cells;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateSpaceMirror = function(r){
if(r.MirrorUpdated) return;
var D = this.GetRowById(r.Mirror);
if(!D){ r.Mirror = ""; return; }
r.MirrorUpdated = 1;
if(D.Mirror&&!D.MirrorUpdated) this.UpdateSpaceMirror(D);
for(var n in D) if(r[n]==null && !Grids.INames[n]) r[n] = D[n];
}
// -----------------------------------------------------------------------------------------------------------
// Updates rows with Kind='Space'
TGP.UpdateSpaces = function(){
var F = this.GetFixedRows(), Top = {"Topbar":1,"Topbar1":1,"Topbar2":1,"Topbar3":1}, Tool = {"Toolbar":1,"Toolbar1":1,"Toolbar2":1,"Toolbar3":1};
var Solid = {"Space":1,"Group":1,"Pager":1,"Search":1,"Tabber":1,"Tabber2":1};

this.RelHeight = 0;
for(var i=0;i<F.length;i++){ 
   var kind = F[i].Kind; if(kind=="SimplePager") { F[i].Kind = "Pager"; kind = "Pager"; }
   if(Solid[kind] || Top[kind] || Tool[kind] || F[i].Cells || F[i].Space!=null) this.XS.appendChild(F[i]);
   
   }
if(!this.DynamicStyle&&!this.DynamicFormat&&!this.DynamicBorder && this.Toolbar["Cells40Sheet"] && (!this.DebugFlags["check"] || !this["GetAttribute"])) { 
   var r = this.Toolbar, R = new RegExp(r["Cells40Sheet"].replace(/,/g,"|")); 
   for(var n in r) if(n.indexOf("Formula")>=0 && n.search(R)==0) r[n] = null;
   this.Toolbar["Cells40Sheet"] = null;
   }

MS.RelHeight;
if((this.ShowVScroll || this.ConstHeight) && !this.RelHeight){ 
   this.RelHeight = true;
   var r = Dom.createElement("I");
   r.Def = "Solid";
   r.Space = 2;
   r.Kind = "Fill";
   r.RelHeight = 1;
   r.id = "_ConstHeight";
   r.CanPrint = 0;
   r.CanHide = 0;
   var rs = this.XS.firstChild; if(rs && rs.Kind=="NoData") rs = rs.nextSibling;
   if(rs) this.XS.insertBefore(r,rs);
   else this.XS.appendChild(r);
   }
ME.RelHeight;

// --- All spaces ---
var S = [];
for(var i=0;i<6;i++) S[i] = i;
for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Mirror) this.UpdateSpaceMirror(r);
for(var r=this.XS.firstChild,pos=0;r;r=r.nextSibling,pos++){ 
   if(r.RelHeight) this.RelHeight = true;
   
   var cells = r.Cells;
   if(!cells){
      var A = [];
      for(var n in r) if(n.indexOf("Cells")==0&&n!="Cells"&&r[n]) A[A.length] = n;
      if(A.length){
         A.sort();
         cells = [];
         for(var i=0;i<A.length;i++) cells = cells.concat(r[A[i]].replace(/\s*\,\s*/g,",").replace(/^\s+|\s+$/g,"").split(","));
         }
      }
   if(!cells){
      if(r.Kind=='Group') cells = r["List"] || r["ListDefaults"] ? ["List"] : [];
      else if(r.Kind=='Search') cells = ["Expression"];
      else if(r.Kind=='Pager') cells = ["Pager"];
      else { cells = ["Html"]; r["HtmlRelWidth"] = 1; r["HtmlType"] = "Html"; r.NoColor = 1; r.CanFocus = 0; }
      }
   else if(typeof(cells)=="string"){
      cells = cells.replace(/\s*\,\s*/g,",").replace(/^\s+|\s+$/g,"").split(","); 
      }
   r.Cells = cells;
   var xcells = this.GetCellNames(r);
   
   if(r.Kind=='Group') this.UpdateGroupRow(r,xcells);
   if(r.Kind=='Search') this.UpdateSearchRow(r,xcells);
   if(r.Kind=='Pager') this.UpdatePagerRow(r,xcells);
   if(r.Kind=='Tabber'||r.Kind=='Tabber2') this.UpdateTabberRow(r,xcells);
   if(Top[r.Kind] || Tool[r.Kind]) this.UpdateToolbarRow(r,xcells);

   if(r.Space==null) r.Space = r.Kind=="Group"||r.Kind=="Search" ? 1 : (r.Kind=="Pager"||Tool[r.Kind]?4:(r.Kind=="Tabber"||r.Kind=="Tabber2"?-1:(Top[r.Kind]?0:2)));
   if(r.Space==3 && !this.XF.firstChild) r.Space = 2;
   if(r.Space=="0") r.Space = "0";
   if(r.Tag && !(r.Space>9)) r.Space = 10; 
   for(var i=r.Space;i<6;i++) S[i]++;
   
   this.UpdateSpaceCells(r); 
      
   r.Fixed = "Solid";
   r.Pos = pos;
   if(!r.Def) r.Def = "Solid";
   
   MS.Calc;
   if(!r.CalcOrder){
      var co = "";
      for(var n in r){
         var idx = n.lastIndexOf("Formula");
         if(idx>0 && idx==n.length-7 && r[n]){  
            
            co+=(co?",":"")+n.slice(0,n.length-7);
            }
         }
      var D = r.Def; if(typeof(D)=="string") D = this.Def[D]; 
      if(D) for(var n in D){ var idx = n.lastIndexOf("Formula"); if(idx>0 && idx==n.length-7 && !r[n] && D[n]) co+=(co?",":"")+n.slice(0,n.length-7); }
      if(!D||!D.CalcOrder) r.CalcOrder = co;
      
      if(co) r.Calculated = 1;
      }   
   ME.Calc;  
   
   }
S[5]--; 
this.XS.Space = S;
if(this.Img.SpaceWidthChange) this.MultiplyScale(this.Img.SpaceWidthChange,12);
}
// -----------------------------------------------------------------------------------------------------------
ME.Space;

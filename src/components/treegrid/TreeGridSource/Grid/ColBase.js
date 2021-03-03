// -----------------------------------------------------------------------------------------------------------
// Basic support functions for columns
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
MS.RelWidth;
CConstWidth = {NoColor:1,CanHide:0,CanFocus:0,CanSort:0,CanMove:0,CanResize:0,CanPrint:0,CanExport:0,EmptyValue:"",WidthPad:0,Width:0,RelWidth:0.00000001,CanSelect:0,NoUpload:2,CanCopyPaste:0};
ME.RelWidth;
// -----------------------------------------------------------------------------------------------------------
TGP.GetSS = function(){
var SS = []; for(var i=this.FirstSec;i<=this.LastSec;i++) if(this.ColNames[i].State==4 || this.Printing) SS[i] = [];
return SS;
}
// -----------------------------------------------------------------------------------------------------------
MS.Api;

TGP.GetSections = function(){ return [this.FirstSec,this.SecCount]; }
ME.Api;
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateCols = function(){
var X = this.DefCols; for(var ndef in X) if(X[ndef].Def) this.UpdateDef(X[ndef],X,"Def");
var C = this.Cols, nohs = this.NoHScroll || this.MaxHScroll;
MS.Panel; var c = C.Panel; if(c && !c.Type) c.Type = "Panel"; if(c) c.Name = "Panel"; ME.Panel;
for(var col in C){
   var c = C[col]; if(c.Updated) continue;
   c.Updated = 1;
   MS.RelWidth;
   if(c.ConstWidth){
      for(var a in CConstWidth) if(c[a]==null) c[a] = CConstWidth[a];
      if(c.RelWidth) { c.Hidden = 1; c.RelHidden = 1; }
      c.Type = "Html";
      var F = this.GetFixedRows();
      for(var i=0;i<F.length;i++) if(F[i].Kind=="Header" && !F[i][col]) F[i][col] = " ";
      if(!this.Header[col]) this.Header[col] = " ";
      }
   ME.RelWidth;
   if(c.Def!=""){
      if(!c.Def || (!X[c.Def]&&(c.Def+"").indexOf(",")<0)) c.Def = c.Type=="Gantt"?"Gantt":"C";
      var def = c.Def; this.UpdateDef(c,X,"Def"); c.Def = def; 
      }
   MS.RelWidth;
   if(c.RelWidth || c.ZalRelWidth) {
      if(nohs){ c.RelWidth = 0; c.ZalRelWidth = 0; }
      else { this.RelWidth = 1; if(c.RelWidthType&1) this.RelWidthSec = 1; }
      }
   ME.RelWidth;
   c.SelectedCells = 0;
   c.AutoWidth = !c.Width&&c.Width!="0";
   if(c.Width<0 || c.Width=="0"){ c.Width = null; c.Visible = 0; } 
   MS._Debug;if(0){ME._Debug; MS.SideButton;MX.SideButton;c.WidthPad = 0;ME.SideButton; MS._Debug;}ME._Debug;
   MS.Panel;
   if(c.Type=="Panel") {
      if(c.Buttons) c.IconCount = (c.Buttons+"").split(',').length;
      else c.IconCount = (this.Dragging&&c.Move?1:0)+(this.Selecting&&c.Select?1:0)+(this.Deleting&&c.Delete?1:0)+(this.Copying&&c.Copy?1:0);
      if(!c.Width&&c.Width!="0") c.AutoWidth = 1;
      if(!c.Width&&!c.IconCount || c.Width<5) { c.Visible = 0; c.CanHide = 0; } 
      }
   ME.Panel;
   if(c.ExpandLevel!=null) this.ExpandLevels = 1;
   if(c.Type=="Gantt") { 
      
      NoModule("Gantt","Gantt");
      
      }
   }
}

// -----------------------------------------------------------------------------------------------------------
TGP.UpdateSecCount = function(){
var C = this.Cols, CN = this.ColNames, v, chg = 0, ww = 0, gap = this.Img.EmptyGap;
var MainSec = [0]; MainSec[CN.length-1] = 2; for(var i=CN.length-2;i>0;i--) MainSec[i] = 1; 
for(var i=0;i<CN.length;i++){
   var N = CN[i], vis = 0, w = 0, len = N.length; 
   if(!len && i>1 && i!=CN.length-1){  
      CN.splice(i,1); 
      i--; 
      MainSec[CN.length-1] = 2;
      continue; 
      } 
   for(var j=0;j<len;j++){
      var c = C[N[j]];
      if(c.Visible) { vis = 2; w += c.Width; }
      else if(!vis && c.Hidden) vis = 1;
      c.Sec = i; c.Pos = j; c.MainSec = MainSec[i]; 
      }
   if(!w&&gap) w = 1;
   N.Width = w;
   ww += w;
   
   N.Visible = vis;
   }
if(BOpera && ww>32000){ 
   for(var i=CN.length-2;i>0&&ww>32000;i--){
      var N = CN[i]; 
      for(var j=N.length-1;j>=0&&ww>32000;j--) if(C[N[j]].Visible) { ww -= c.Width; N.Width -= c.Width; C[N[j]].Visible = 0; }
      if(j<0) N.Visible = 0;
      }
   }
v = CN[0].Visible?0:1; if(v!=this.FirstSec) { this.FirstSec = v; chg = 1; } 
v = CN[CN.length-1].Visible ? CN.length-1 : CN.length-2; if(v!=this.LastSec) { this.LastSec = v; chg = 1; } 
v = CN[CN.length-1].Visible ? 3 : 2; if(v!=this.SecCount) { this.SecCount = v; chg = 1; }  
var cpl = this.ColPaging&&this.ColPagingFixed==0&&!this.ChromeZoom ? CN.length-2 : 0;
if(this.CPLastSec!=cpl){
   this.CPLastSec = cpl;
   MS.ColSpan; var F = this.GetFixedRows(); for(var i=0;i<F.length;i++) if(F[i].Spanned) this.UpdateSpan(F[i]); ME.ColSpan; 
   }
this.CPSecs = null; if(this.CPLastSec){ this.CPSecs = []; if(this.ColNames[this.FirstSec].Width!=0) this.CPSecs[this.FirstSec] = 1; this.CPSecs[1] = 1; if(this.SecCount==3&&this.ColNames[this.LastSec].Width!=0) this.CPSecs[this.LastSec] = 1; }
this.UserSec = ["LeftHtml","MidHtml"]; for(var i=2;i<CN.length-1;i++) this.UserSec[i] = "MidHtml2"; this.UserSec[CN.length-1] = "RightHtml";
return chg;
}
// -----------------------------------------------------------------------------------------------------------
TGP.InitColPaging = function(){
for(var i=0,N=this.ColNames;i<N.length;i++) N[i].State = 4;
MS.ColPaging;
if(this.AutoColPages&&!this.ColPaging) this.AutoColPages = 0;
if(this.ColPaging && this.ColPageMin < this.ColNames[1].length){ 
   var N = [this.ColNames[0]], CN = this.ColNames[1], len = this.ColPageMin, block = null, p = 0, n = 0, l = CN.length;
   N[0].State = 4;
   N[++p] = []; N[p].State = 4; N[p].LastAccess = 0;
   while(n<l){
      var C = this.Cols[CN[n]], blk = C.Block; if(blk==null) blk = C.Group;
      if(--len<0 && (C.Visible||n==0&&p==1&&!this.ColPageMin) && (!block || block!=blk)){
         N[++p] = []; 
         len = this.ColPageLength-1; 
         N[p].State = this.ColPaging==1?4:2; 
         N[p].LastAccess = 0;
         }
      block = blk;
      N[p][N[p].length] = CN[n++];
      
      }
   N[N.length] = this.ColNames[2]; this.ColNames[2].State = 4;
   this.ColNames = N;
   }
MX.ColPaging;
MS._Debug; if(0){ ME._Debug; this.ColPaging = 0; this.AutoColPages = 0; MS._Debug; } ME._Debug;
ME.ColPaging;
}
// -----------------------------------------------------------------------------------------------------------
MS.Api;
TGP.CreateColPages = function(){
for(var N=this.ColNames,i=2;i<N.length-1;i++) N[1] = N[1].concat(N[i]); 
N[2] = N[N.length-1];
N.length = 3;
this.InitColPaging();
this.UpdateSecCount();
}
ME.Api;
// -----------------------------------------------------------------------------------------------------------
// Sets VPos (visible position) for all columns
TGP.SetVPos = function(){
var CN = this.ColNames, Cols = this.Cols, mc = this.HideTree ? null : this.MainCol, opos = 0, cpl = this.CPLastSec;
for(var i=0;i<CN.length;i++){
   var N = CN[i], vpos = this.LeftTD||i==1?1:0;
   for(var c=0;c<N.length;c++){
      var col = N[c], C = Cols[col];
      if(C.Visible || C.Hidden) { 
         if(col==mc||C.GanttPageW) vpos++;
         if(cpl) C.FPos = opos + vpos;
         C.VPos = vpos++;
         if(C.WidthPad) vpos++;
         }
      else { C.VPos = -1; if(cpl) C.FPos = -1; }
      }
   if(cpl){
      opos += vpos - (this.LeftTD||i==1?1:0);
      if(i==0||i==cpl) opos = 0;
      }
   }
}

// -----------------------------------------------------------------------------------------------------------
TGP.UpdateColHeader = function(row,col){
MS.SideButton;
if(this.Sorting && Get(row,"SortIcons")!=0 && row[col+"Button"]!="Sort" && row[col+"Icon"]!="Sort" && this.GetSortCol(col,row)){
   if(row[col+"Button"]==null) row[col+"Button"] = "Sort";
   else if(row[col+"Icon"]==null) { row[col+"Icon"] = "Sort"; row[col+"IconAlign"] = "Right"; }
   }
if(!row[col+"Button"]) row[col+"Button"] = "";   
if(!row[col+"Icon"]) row[col+"Icon"] = "";       
ME.SideButton;
if(this.Cols[col].Type=="Panel"){
   if(row[col]==col) row[col] = ""; 
   }
else if(row[col+"Type"]==null) row[col+"Type"] = row.NoEscape ? "Html" : "Lines";
if(row[col+"Format"]==null) row[col+"Format"] = ""; 
}
// -----------------------------------------------------------------------------------------------------------
MS.Filter;
TGP.UpdateColFilter = function(row,col){
var sm = Get(row,col+"ShowMenu");
if(sm=="0") return;
var type = this.GetType(row,col); 
if((type=="Enum"||type=="Radio") && sm!="1") { row[col+"CanEmpty"] = 1; return; }
if(type=="Bool" && this.GetAttr(row,col,"CanEmpty")==null && sm!="1"){ row[col+"ShowMenu"] = 0; row[col+"CanEmpty"] = 1; row[col+"FilterOff"] = ""; return; }
var but = this.GetAttr(row,col,"Button"); if(but=="Filter") return;
var ico = this.GetAttr(row,col,"Icon"); if(ico=="Filter") return;
if(Get(row,col+"Visible")=="0") return;
if(ico && !but){ row[col+"Button"] = ico; ico = null; } 
else if(!but && type=="Enum" && ico==null) row[col+"Button"] = "Enum"; 
if(!ico && type!="Icon"){ row[col+"Icon"] = "Filter"; if(!row[col+"IconAlign"]) row[col+"IconAlign"] = ""; }
}
ME.Filter;
// -----------------------------------------------------------------------------------------------------------
// Returns next visible column according to its position in html
// If row is given, take care about row's Span , ! attention, inverse order (col,row)
TGP.GetNextCol = function(col,row,hid){
if(!col) return null;
MS.Space;
if(row && row.Space!=null){
   for(var i=0;i<row.Cells.length;i++){
      if(row.Cells[i]==col) return row.Cells[i+1];
      }
   }
ME.Space;
var C = this.Cols; if(!C[col]) return null;
var sec = C[col].Sec, S = this.ColNames, p = C[col].Pos+1;
while(1){
   while(S[sec][p] && ((!C[S[sec][p]].Visible&&hid!=2) && (!hid||!C[S[sec][p]].Hidden) && (!row || !row.Spanned || row[S[sec][p]+"Span"]<=1 || this.GetWidth(row,S[sec][p])<=0) || row && row.Spanned && row[S[sec][p]+"Span"]==0)) p++;
   if(S[sec][p]) return S[sec][p];
   sec++; p = 0;
   if(sec>=S.length) return null;
   }
}
// -----------------------------------------------------------------------------------------------------------
// Returns previous visible column according to its position in html
// If row is given, take care about row's Span , ! attention, inverse order (col,row)
TGP.GetPrevCol = function(col,row,hid){
if(!col) return null;
MS.Space;
if(row && row.Space!=null){
   for(var i=0;i<row.Cells.length;i++){
      if(row.Cells[i]==col) return i?row.Cells[i-1] : null;
      }
   }
ME.Space;
var C = this.Cols; if(!C[col]) return null;
var sec = C[col].Sec, S = this.ColNames, p = C[col].Pos-1;
while(1){
   while(S[sec][p] && ((!C[S[sec][p]].Visible&&hid!=2) && (!hid||!C[S[sec][p]].Hidden) && (!row || !row.Spanned || row[S[sec][p]+"Span"]<=1 || this.GetWidth(row,S[sec][p])<=0) || row && row.Spanned && row[S[sec][p]+"Span"]==0)) p--;
   if(S[sec][p]) return S[sec][p];
   sec--; 
   if(sec<0) return null;
   p = S[sec].length-1;
   }
}
// -----------------------------------------------------------------------------------------------------------
// Returns the last visible column according to its position in html in given section (0 - left, 1 - mid, 2 - right) or -1
// If sec is null, returns the last column from the last section
// If row is given, take care about row's Span , ! attention, inverse order (col,row)
TGP.GetLastCol = function(mainsec,row,hid){
MS.Space; if(row && row.Space!=null) return row.Cells[row.Cells.length-1]; ME.Space;
var C = this.Cols, CN = this.ColNames, len;
if(mainsec==null){ mainsec = CN.length-1; len = -1; }
else if(mainsec==0) len = -1;
else if(mainsec==1) { mainsec = CN.length-2; len = 0; }
else { mainsec = CN.length-1; len = CN.length-2; }
for(var i=mainsec;i>len;i--){
   for(var S=CN[i],p=S.length-1;S[p] && ((!C[S[p]].Visible&&hid!=2) && (!hid||!C[S[p]].Hidden) && (!row || !row.Spanned || row[S[p]+"Span"]<=1 || this.GetWidth(row,S[p])<=0) || row && row.Spanned && row[S[p]+"Span"]==0);p--);
   if(S[p]) return S[p];
   }
return null;
}
// -----------------------------------------------------------------------------------------------------------
// Returns the first visible column according to its position in html in given section (0 - left, 1 - mid, 2 - right) or null
// If sec is null, returns the first column from the first section
TGP.GetFirstCol = function(mainsec,row,hid){
MS.Space; if(row && row.Space!=null) return row.Cells[0]; ME.Space;
var C = this.Cols, CN = this.ColNames, len;
if(mainsec==null){ mainsec = 0; len = CN.length; }
else if(mainsec==0) len = 1;
else if(mainsec==1) len = CN.length-1;
else { mainsec = CN.length-1; len = CN.length; }
for(var i=mainsec;i<len;i++){
   for(var p=0,S=CN[i];S[p]&&(!C[S[p]].Visible&&hid!=2)&&(!hid||!C[S[p]].Hidden);p++);
   if(S[p]) return S[p];
   }
return null;
}
// -----------------------------------------------------------------------------------------------------------
// Returns column caption as the cell value (escaped) from the first header
// search = 1 - SearchNames, 2 - SearchNames[0], 3 - SearchNames.toLowerCase.split
TGP.GetCaption = function(col,search){
var typ = this.GetType(this.Header,col);
if(!search||!this.Cols[col]||!this.Cols[col].SearchNames){
   var cap = this.Header[col];
   if(this.Trans) cap = this.Translate(this.Header,col,cap,typ);
   return search==3 ? [cap.toLowerCase()] : typ=="Html" ? cap : this.Lang.Format.Escape(cap);
   }
var cap = this.Cols[col].SearchNames;
if(search==3) cap = cap.toLowerCase();
if(!this.Trans) return search==3 ? cap.split(",") : search==2 ? cap.split(",")[0] : cap;
cap = cap.split(",");
for(var i=search==2?0:cap.length-1;i>=0;i--){
   cap[i] = this.Translate(this.Header,col,cap[i],typ);
   cap[i] = this.Translate("SearchNames",col,cap[i],"");
   }
return search==3 ? cap : search==2 ? cap[0] : cap.join(",");
}
// -----------------------------------------------------------------------------------------------------------
// Returns names of all columns in order they are displayed
// attr1 and attr2 are column attribute that must be 1 to include the column, for example Visible, CanExport, CanCopy
TGP.GetCols = function(attr1,attr2,attr3){
var A = [], p = 0;
for(var i=0;i<this.ColNames.length;i++){
   for(var j=0;j<this.ColNames[i].length;j++){
      var col = this.ColNames[i][j], C = this.Cols[col];
      if((!attr1||C[attr1]) && (!attr2||C[attr2]) && (!attr3||!C[attr3])) A[p++] = col;
      }
   }
return A;
}
// -----------------------------------------------------------------------------------------------------------
// Returns cell width for Spanned rows
TGP.GetWidth = function(row,col){
if(row.Space!=null) return row[col+"Width"];
var C = this.Cols[col];
MS.ColSpan;
if(!row.Spanned) return C.Width;
var Span = row[col+"Span"]; 
if(Span==0) return 0;
var sec = C.Sec, pos = C.Pos, wd = 0, cpl = row.Fixed ? this.CPLastSec : 0;
for(var i=0;i<Span;i++){
   var c = this.ColNames[sec][pos++];
   if(!c) {
      if(!cpl || sec==0 || sec>=cpl) break;
      pos = 0; 
      c = this.ColNames[++sec][pos++];
      }
   if(this.Cols[c].Visible) wd += this.Cols[c].Width;
   }
return wd;
MX.ColSpan;
return C.Width;
ME.ColSpan;
}
// -----------------------------------------------------------------------------------------------------------
// Returns main column for span
TGP.GetSpanCol = function(row,col,vis){
MS.ColSpan;
if(!row.Spanned) return col;
var sp = row[col+"Span"];
if(sp==0) {
   var C = this.Cols[col], S = this.ColNames[C.Sec], p = C.Pos-1;
   if(this.CPLastSec&&row.Fixed&&C.MainSec==1) {
      var sec = C.Sec, p = C.Pos;
      while(row[S[p]+"Span"]==0) if(--p<0){ S = this.ColNames[--sec]; p = S.length-1; }
      }
   else while(p && row[S[p]+"Span"]==0) p--;
   col = S[p];
   }
if(vis && !this.Cols[col].Visible) {
   var vc = this.GetNextCol(col);
   return vis!=2||this.GetSpanCol(row,vc)==col ? vc : null;
   }
ME.ColSpan;
return col;
}
// -----------------------------------------------------------------------------------------------------------
// Returns last column for span
TGP.GetLastSpanCol = function(row,col,vis){
MS.ColSpan;
if(!row.Spanned) return col;
var sp = row[col+"Span"];
if(sp==1) return col; 
var C = this.Cols[col], S = this.ColNames[C.Sec], p = C.Pos+1;
if(this.CPLastSec&&row.Fixed&&C.MainSec==1) {
   var sec = C.Sec, p = C.Pos+1; if(p==S.length) { S = this.ColNames[++sec]; p = 0; }
   while(row[S[p]+"Span"]==0) if(++p==S.length){ S = this.ColNames[++sec]; p = 0; }
   if(!p) { S = this.ColNames[--sec]; p = S.length; }
   }
else while(p<S.length && row[S[p]+"Span"]==0) p++;
if(vis && !this.Cols[S[p-1]].Visible) return this.GetPrevCol(S[p-1]);
return S[p-1];
ME.ColSpan;
return col;
}
// -----------------------------------------------------------------------------------------------------------

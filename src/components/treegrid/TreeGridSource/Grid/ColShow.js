// -----------------------------------------------------------------------------------------------------------
// Changing column visibility and column tree
// -----------------------------------------------------------------------------------------------------------
MS.ColHide;
// -----------------------------------------------------------------------------------------------------------
// Shows column
TGP.ShowCol = function(col,nosync){
var C = this.Cols[col];
if(!C || C.Visible) return;

MS.Sync;
if(this.Sync["cols"] && !nosync){
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId && G.Cols[col] && G.Sync["cols"]) {
         G.NoUpdateHidden = 1;
         MS.Media; G.UpdateMedia("Cols","Visible",1,col); ME.Media;
         G.ShowCol(col,1);
         
         G.NoUpdateHidden = 0;
         }
      }
   }
ME.Sync;

if(!this.MainTable){ 
   C.Visible = 1; C.Hidden = 0;
   this.SetVPos();
   this.ColNames[C.Sec].Width += C.Width; 
   return;
   }

MS.Animate; this.FinishAnimations(); ME.Animate;
if(this.Selecting && this.SelectingCells>=3 && !(this.SelectHidden&4) && this.SelectingFocus && (!this.FRect||!this.FRect[6]||!(this.SelectingFocus&4)) && this.IsFocused(null,col)){
   C.Visible = 1;
   if(this.FRect) {
      if(this.SelectingFocus&4&&this.FRect[7]) this.SelectCol(col,1);
      else this.SelectRange(this.FRect[0],col,this.FRect[2],col,1); 
      }
   else if(this.SelectingFocus&2) this.SelectCell(this.FRow,col);
   C.Visible = 0;
   }
C.MenuCheck = null;

// --- FastColumns = 1 ---
if(C.Hidden){ 
   this.SetWidth(col,null,1);
   if(col=="Panel") for(var r=this.XS.firstChild;r;r=r.nextSibling) if(Get(r,"Panel")==1) this.RefreshRow(r);
   this.RefreshSpanned(col);
   C.Visible = 0;
   if(C.MainSec!=1 && !this.GetFirstCol(C.MainSec)) { C.Visible = 1; this.ShowColSec(C.MainSec); }
   C.Visible = 1;
   if(this.BackBody && this.BodySec && this.BodySec[C.Sec]) this.BodySec[C.Sec].firstChild.firstChild.rows[0].cells[C.Pos].style.display = "";
  
   
   this.UpdateSync();
   MS.Overlay; if(this.Overlay>=2) this.UpdateOverlays(null,C.Sec); ME.Overlay;
   return;
   }

// --- first column in section, the section will be added ---
if(C.MainSec!=1 && !this.ColNames[C.Sec].Visible){ 
   C.Visible = 1;
   var zal = this.ColPaging; this.ColPaging = 1;
   this.AddColSec(C.MainSec);
   this.ColPaging = zal; 
   this.UpdateSecCount();
   this.SetVPos();
   this.UpdateSync();
   MS.Overlay; if(this.Overlay>=2) this.UpdateOverlays(null,C.Sec); ME.Overlay;
   return;
   
   }

// --- first visible column in section, the section will be shown ---
if(C.MainSec!=1 && this.ColNames[C.Sec].Visible==1) this.ShowColSec(C.MainSec);

C.Visible = 1;
this.SetVPos();

MS.ColPaging; 
if(this.ColPaging && this.ColNames[C.Sec].State<4 && !this.CPLastSec) { 
   var w = C.Width; C.Width = 0; this.SetWidth(col,w); 
   return;
   } 
ME.ColPaging; 
     
// --- FastColumns = 0 ---
function disp(row,td,pag){
   if(chp) td = td.firstChild;
   if(!pag) td = td.firstChild;
   while(td) {
      var rr = td.firstChild;
      if(rr && rr.nodeType==1) {
         rr = rr.rows[0];
         rr.insertCell(pos).style.height="0px"; 
         if(wp) rr.insertCell(pos+1).style.height="0px";
         if(mc) {
            var tdr = rr.insertCell(pos);
            tdr.style.height="0px"; tdr.style.width="0px"; 
            }
         }
      if(pag) break; 
      td = td.nextSibling;   
      }
   for(var r=row.firstChild;r;r=r.nextSibling){
      if(!r.r1&&!r.rch1) continue;
      var cell = null, rr = r[rsec], ppos = pos;
      if(r.Hasch) { 
         td = (rr?rr[next]:r[rchsec]).cells[0];
         td.colSpan += 1 + wp + mc;
         if(r.Hasch==4) disp(r,td);
         }
      if(!r.r1) continue;
      if(r[usec]!=null||r.Def[usec]!=null){
         rr = rr.lastChild;
         if(rr.style.display == "none") { rr.colSpan = 1 + wp + mc; rr.style.display = ""; }
         else rr.colSpan += 1 + wp + mc;
         continue;
         }
      if(r.RowSpan && r[col+"RowSpan"]==0 && T.GetSpanRow(r,col,1)!=r) continue;  
      if(r.Spanned && r[col+"Span"]!=1) {
         for(var vis=0,pp=cpos+1;CN[pp]&&r[CN[pp]+"Span"]==0;pp++) if(T.Cols[CN[pp]].Visible||T.Cols[CN[pp]].Hidden) { vis = 1; break; }
         if(!vis && r[col+"Span"]==0) {
            for(pp=cpos-1;CN[pp]&&r[CN[pp]+"Span"]==0;pp--) if(T.Cols[CN[pp]].Visible||T.Cols[CN[pp]].Hidden) { vis = 1; break; }
            if(!vis && CN[pp] && T.Cols[CN[pp]].Visible||T.Cols[CN[pp]].Hidden) vis = 1;
            }
         if(vis) {
            if(mc) {
               C.VPos--; C.FPos--; C.Visible = 0; var cell = T.GetCell(r,col); C.VPos++; C.FPos++; C.Visible = 1;
               var S = []; T.GetRowHTML(r,S,4,r[col+"Span"]==0?T.GetSpanCol(r,col):col);
               if(S[9]){ 
                  cell.colSpan += 1 + wp;
                  cell.className += " "+T.Img.Style+noleft;
                  var c = rr.insertCell(cell.cellIndex);
                  c.innerHTML = S[8];
                  c.className = S[9];
                  c.style.backgroundColor = S[2];
                  MS.RowSpan; c.rowSpan = cell.rowSpan; ME.RowSpan;
                  }
               else cell.colSpan += 1 + wp + mc; 
               }
            else T.GetCell(r,col).colSpan += 1 + wp + mc; 
            continue;
            }
         }
      if(r.RowSpan) {
         var rs = T.GetSpanRow(r,col), spn = rs[col+"RowSpan"], i = T.LeftTD;
         if(spn>1){ 
            for(var i=1,pls=0,ipls=0,rv=null;i<=spn&&rs;i++,rs=rs.nextSibling){
               if(!rs.Visible) { 
                  if(rs.r1&&rv) ipls--; else pls--; 
                  }
               else {
                  if(i!=spn && rs.Hasch && (rs.Expanded||BIEA&&!BIE8Strict&&i<=spn-1)) pls++;
                  if(BIEA&&!BIE8Strict&&rv) ipls = 0;
                  if(!rv) rv = r;
                  }
               }
            spn = Math.floor(spn+pls+ipls);
            }
         for(var pp=cpos-1;pp>=0 && (!T.Cols[CN[pp]].Visible&&!T.Cols[CN[pp]].Hidden || r[CN[pp]+"RowSpan"]==0&&T.GetSpanRow(r,CN[pp],1)!=r);pp--); 
         if(pp>=0) {
            var cell = T.GetSpanCell(r,CN[pp]);
            i = cell.cellIndex + (cell.className.indexOf(noright)>=0 ? 2 : 1);
            }
         else i = T.LeftTD ? 1 : 0; 
         }
      else for(var i=0,p=0,spn=0;p<ppos;p+=rr.cells[i++].colSpan);
      var S = []; T.GetRowHTML(r,S,4,r.Spanned && r[col+"Span"]==0?T.GetSpanCol(r,col):col);
      var cell = rr.insertCell(i);
      cell.innerHTML = S[0];
      cell.className = S[1];
      cell.style.backgroundColor = S[2];
      MS.RowSpan; if(spn>1) cell.rowSpan = spn; ME.RowSpan;
      MS.SideButton;
      if(S[3]) T.SetCellIcon(r,col,cell); 
      ME.SideButton;
      if(S[5]){ 
         MS.SideButton;
         c = rr.insertCell(i+1);
         c.innerHTML = S[4] ? S[4] : CNBSP;
         c.className = S[5];
         c.style.backgroundColor = S[2];
         if(S[6]) c.style.backgroundImage = T.EscapeImages ? "url(\""+T.Lang.Format.Escape(T.GetAttr(r,col,"Button"))+"\")" : "url("+T.GetAttr(r,col,"Button")+")"; 
         MS.RowSpan; if(spn>1) c.rowSpan = spn; ME.RowSpan;
         ME.SideButton;
         }
      else if(wp) cell.colSpan = 2;
      if(mc){ 
         if(S[9]){
            c = rr.insertCell(i);
            c.innerHTML = S[8];
            c.className = S[9];
            c.style.backgroundColor = S[2];
            MS.RowSpan; if(spn>1) c.rowSpan = spn; ME.RowSpan;
            }
         else cell.colSpan++; 
         }  
      
      if(orr) Grids.OnRenderRow(T,row,col);
      }
   }
var noleft = "NoLeft", noright = "NoRight"; 
var sec = C.Sec, usec = this.UserSec[sec], rsec="r"+sec, rchsec = "rch"+sec, pos = C.VPos, cpos = C.Pos, T = this, wp = C.WidthPad?1:0, mc = col==this.MainCol && !this.HideTree, CN = this.ColNames[C.Sec];
if(mc) pos--;
var orr = Grids.OnRenderRow!=null, chp = this.ChildParts, next = this.ReversedTree ? "previousSibling" : "nextSibling", dys = this.DynamicStyle;

if(!this.ColPaging || this.ColNames[C.Sec].State==4){
   for(var row=this.XB.firstChild;row;row=row.nextSibling) if(row.r1 && row.State==4) disp(row,row[rsec],1); 
   }

if(this.CPLastSec && C.MainSec==1){ 
   for(var i=1;i<sec;i++) cpos += this.ColNames[i].length;
   rsec = "r1"; sec = 1; pos = C.FPos; usec = this.UserSec[1]; if(mc) pos--;
   CN = this.GetAllColPages();
   
   }
if(this.HeadSec[sec]) disp(this.XH,this.HeadSec[sec],1);
if(this.FootSec[sec]) disp(this.XF,this.FootSec[sec],1);

var w = C.Width; C.Width = 0; this.SetWidth(col,w); 
if(col=="Panel") for(var r=this.XS.firstChild;r;r=r.nextSibling) this.RefreshRow(r);


this.RefreshSpanned(col); 
MS.Overlay; if(this.Overlay>=2) this.UpdateOverlays(null,C.Sec); ME.Overlay;
}
// -----------------------------------------------------------------------------------------------------------
// Hides column
TGP.HideCol = function(col,nosync,nofcol){
var C = this.Cols[col];
if(!C || !C.Visible) return;

if(this.EditMode && this.ECol==col && this.EndEdit(1)==-1) return;

MS.Sync;
if(this.Sync["cols"] && !nosync){
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId && G.Cols[col] && G.Sync["cols"]) {
         G.NoUpdateHidden = 1;
         MS.Media; G.UpdateMedia("Cols","Visible",0,col); ME.Media;
         G.HideCol(col,1);
         
         G.NoUpdateHidden = 0;
         }
      }
   }
ME.Sync;

if(this.ACol==col || this.FCol==col&&!nofcol) { 
   if(this.ACol==col) this.ACol = null; 
   if(this.FCol==col&&!nofcol) { this.FCol = null; this.FRect = null; }
   if(C.Deleted){ C.Deleted = 0; this.UpdateCursors(); C.Deleted = 1; } 
   else this.UpdateCursors(); 
   }
if(this.Selecting){
   if(this.ClearSelected&4 && C.Selected && C.CanSelect) this.SelectCol(col,0);
   if(this.SelectingCols && this.SelectingCells>=3 && !(this.SelectHidden&4)) this.SelectRange(this.GetFirst(),col,this.GetLast(),col,0);
   }
if(!this.MainTable){ 
   C.Visible = 0; C.Hidden = 0;
   this.SetVPos();
   this.ColNames[C.Sec].Width -= C.Width; 
   return;
   }
C.MenuCheck = null;
MS.Animate; this.FinishAnimations(); ME.Animate;

// --- FastColumns = 1 ---
if(this.FastColumns) { 
   this.SetWidth(col,null,1);
   if(col=="Panel") for(var r=this.XS.firstChild;r;r=r.nextSibling) if(Get(r,"Panel")==1) this.RefreshRow(r);
   this.RefreshSpanned(col);
   if(C.MainSec!=1 && !this.GetFirstCol(C.MainSec)) { this.HideColSec(C.MainSec); this.UpdateSecCount(); }
   this.UpdateSync();
   if(this.BackBody && this.BodySec && this.BodySec[C.Sec]) this.BodySec[C.Sec].firstChild.firstChild.rows[0].cells[C.Pos].style.display = "none";
   MS.Overlay; if(this.Overlay>=2) this.UpdateOverlays(null,C.Sec); ME.Overlay;
   
   MS.VarHeight; if(C.VarHeight) this.UpdateHeights(2); ME.VarHeight; 
   return; 
   }

// --- first column in section, section will be deleted ---
if(C.MainSec!=1){
   for(var CN = this.ColNames[C.Sec],i=0,vis=0;i<CN.length;i++) {
      if(CN[i]==col) continue;
      if(this.Cols[CN[i]].Visible) { vis = 2; break; }
      if(this.Cols[CN[i]].Hidden) vis = 1;
      }
   C.Visible = 0; C.Hidden = 0;
   if(vis==0) {   
      this.DelColSec(C.MainSec); 
      this.UpdateSecCount(); 
      this.UpdateSync();
      MS.Overlay; if(this.Overlay>=2) this.UpdateOverlays(null,C.Sec); ME.Overlay;
      return;
      }
   if(vis==1) this.HideColSec(C.MainSec); 
   }

// --- FastColumns = 0 ---
var sec = C.Sec, usec = this.UserSec[sec], rsec = "r"+sec, rchsec = "rch"+sec, pos = C.VPos, T = this, wp = C.WidthPad?1:0, mc = col==this.MainCol && !this.HideTree, chp = this.ChildParts;
var noleft = "NoLeft", noright = "NoRight"; 
var next = this.ReversedTree ? "previousSibling" : "nextSibling", ocr = Grids.OnClearRow!=null;

function disp(row,td,root){
   if(ocr) Grids.OnClearRow(T,row,col);
   if(chp) td = td.firstChild;
   if(!root) td = td.firstChild;
   while(td) {
      var rr = td.firstChild;
      if(rr && rr.nodeType==1) {
         rr = rr.rows[0];
         rr.deleteCell(pos);
         if(wp) rr.deleteCell(pos);
         if(mc) rr.deleteCell(pos-1);
         }
      if(root) break; 
      td = td.nextSibling;
      }
   for(var r=row.firstChild;r;r=r.nextSibling){
      if(!r.r1&&!r.rch1) continue;
      var rr = r[rsec];
      if(r.Hasch) { 
         td = (rr?rr[next]:r[rchsec]).cells[0];
         td.colSpan -= 1 + wp + mc;
         if(r.Hasch==4) disp(r,td);
         }
      if(!r.r1) continue;
      if(r[usec]!=null||r.Def[usec]!=null) { 
         rr = rr.lastChild;
         if(rr.colSpan <= 1 + wp + mc) rr.style.display = "none";
         else rr.colSpan -= 1 + wp + mc; 
         continue; 
         } 
      MS.RowSpan; if(r.RowSpan && r[col+"RowSpan"]==0 && T.GetSpanRow(r,col,1)!=r) continue; ME.RowSpan;   
      if(r.Spanned && r[col+"Span"]!=1) {  
         var cell = T.GetCell(r,col);
         if(cell) { 
            if(mc && cell.className.indexOf(noleft)>=0 && cell.colSpan > 1 + wp){
               cell.colSpan -= 1 + wp;
               rr.deleteCell(cell.cellIndex-1);
               cell.className = cell.className.replace(" "+T.Img.Style+noleft,"");
               continue;
               }
            else if(cell.colSpan > 1 + wp + mc) { cell.colSpan -= 1 + wp + mc; continue; }
            }
         }
      
      if(r.RowSpan) { C.Visible = 1; var i = T.GetSpanCell(r,col).cellIndex; C.Visible = 0; }
      else for(var i=0,p=0;p<pos;p+=rr.cells[i++].colSpan);
      if(wp && rr.cells[i].className.indexOf(noright)>=0) rr.deleteCell(i+1);
      if(mc && (rr.cells[i].className.indexOf(noleft)>=0||i&&rr.cells[i-1].className.indexOf(noright)>=0)) { rr.deleteCell(i-1); i--; }
      rr.deleteCell(i);
      }
   }  

if(!this.ColPaging || this.ColNames[sec].State==4){
   for(var row=this.XB.firstChild;row;row=row.nextSibling) if(row.r1 && row.State==4) disp(row,row[rsec],1);
   }
if(!this.ColPaging || this.ColNames[sec].State==4 || this.CPLastSec){
   if(this.CPLastSec && C.MainSec==1) { rsec = "r1"; sec = 1; pos = C.FPos; usec = this.UserSec[1]; } 
   if(this.HeadSec[sec]) disp(this.XH,this.HeadSec[sec],1);
   if(this.FootSec[sec]) disp(this.XF,this.FootSec[sec],1);

   }
C.Visible = 0; C.Hidden = 0;
this.SetVPos();
this.ColNames[C.Sec].Width -= C.Width; 
this.RefreshSpanned(col);
if(col=="Panel") for(var r=this.XS.firstChild;r;r=r.nextSibling) this.RefreshRow(r);

this.OverflowSpaces();

MS.VarHeight; if(C.VarHeight) this.UpdateHeights(2); ME.VarHeight;
this.UpdateSync();
MS.Overlay; if(this.Overlay>=2) this.UpdateOverlays(null,C.Sec); ME.Overlay;
}
// -----------------------------------------------------------------------------------------------------------
TGP.DelColSec = function(sec){
var A = [this.HeadMain,this.BodyMain,this.FootMain];
for(var i=0;i<3;i++) if(A[i][sec]) { var p = A[i][sec].parentNode.parentNode.parentNode; p.parentNode.removeChild(p); A[i][sec] = null; }
if(this.WideHScroll) this.ScrollHorzParent[1].colSpan--;
else { var p = this.ScrollHorzParent[sec]; p.parentNode.removeChild(p); }
for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.r1) r.r1.parentNode.colSpan--;
if(this.ExactWidth){ this.WidthMain[sec].parentNode.removeChild(this.WidthMain[sec]); this.WidthMain[sec] = null; }
this.ClearSec(sec?this.ColNames.length-1:0);
}
// -----------------------------------------------------------------------------------------------------------
TGP.AddColSec = function(sec){
var cls = sec ? "Right" : "Left"; 
var N = ["Head","Body","Foot"], M = [this.HeadMain,this.BodyMain,this.FootMain], S = [this.HeadSec,this.BodySec,this.FootSec];
for(var i=0;i<(this.FootVisible?3:2);i++){
   var c = M[i][1].parentNode.parentNode.parentNode.parentNode.insertCell(M[i][1].parentNode.parentNode.parentNode.cellIndex+(sec==2?1:0));
   c.style.overflow = "hidden";
   c.innerHTML = "<div class='" + this.Img.Style + N[i]+ cls + "'><div style='overflow:hidden;'><div class='"+this.Img.Style+"SectionScroll' style='overflow:scroll;"
               + (i==1&&!this.NoVScroll?"":"overflow-y:hidden;")+(this.NoHScroll?"overflow-x:hidden;":"")+(this.MomentumScroll?"-webkit-overflow-scrolling:touch;":"")
               + "' onscroll='"+this.This+".ScrolledBody(this,"+sec+");'></div></div></div>";
   M[i][sec] = c.firstChild.firstChild.firstChild; S[i][sec?this.ColNames.length-1:0] = M[i][sec];
   }
if(this.WideHScroll) this.ScrollHorzParent[1].colSpan++;
else { 
   var c = this.ScrollHorzParent[1].parentNode.insertCell(sec==2&&this.FirstSec==1?1:sec), cls; 
   if(sec) cls = (this.Rtl?"Right":"Left") + (this.HasRightSplitterS ? "Resize" : "");
   else cls = (this.Rtl?"Right":"Left") + (this.HasLeftSplitterS ? "Resize" : "");
   c.innerHTML = this.GetHScrollHTML(sec,cls);
   this.ScrollHorzParent[sec] = c;
   this.ScrollHorz[sec] = this.CustomHScroll ? c.firstChild.firstChild.firstChild.firstChild.firstChild : c.firstChild.firstChild;
   }
for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.r1) r.r1.parentNode.colSpan++;
if(this.ExactWidth){ 
   this.WidthMain[sec] = this.WidthMain[1].parentNode.insertCell(this.WidthMain[1].cellIndex+(sec?1:0));
   this.WidthMain[sec].style.height = "0px";
   }
this.RenderColPage(sec?this.ColNames.length-1:0);

}

// -----------------------------------------------------------------------------------------------------------
TGP.HideColSec = function(sec){
var A = [this.HeadMain,this.BodyMain,this.FootMain];
for(var i=0;i<3;i++) if(A[i][sec]){ var p = A[i][sec].parentNode.parentNode.parentNode; p.style.display = "none"; p.style.width = "0px"; }
if(this.WideHScroll) this.ScrollHorzParent[1].colSpan--;
else { var p = this.ScrollHorzParent[sec]; p.style.display = "none"; p.style.width = "0px"; }

for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Space>=0&&r.Space<=4&&r.r1) r.r1.parentNode.colSpan--;
if(this.ExactWidth) this.WidthMain[sec].style.display = "none";
this.ColNames[sec?this.LastSec:0].Visible = 1;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ShowColSec = function(sec){
var A = [this.HeadMain,this.BodyMain,this.FootMain];
for(var i=0;i<3;i++) if(A[i][sec]){ var p = A[i][sec].parentNode.parentNode.parentNode; p.style.display = ""; p.style.width = ""; }
if(this.WideHScroll) this.ScrollHorzParent[1].colSpan++;
else { var p = this.ScrollHorzParent[sec]; p.style.display = ""; p.style.width = ""; }

for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Space>=0&&r.Space<=4&&r.r1) r.r1.parentNode.colSpan++;
if(this.ExactWidth) this.WidthMain[sec].style.display = "";
this.ColNames[sec?this.LastSec:0].Visible = 2;
}
// -----------------------------------------------------------------------------------------------------------
TGP.RefreshCellButton = function(row,col){
var cell = this.GetCell(row,col); if(!cell || cell.className.indexOf(this.Img.Style+"NoRight")<0) return; 

var spn = row[col+"Span"], span = 1, bspan = 1, C = this.Cols[col], sec = C.Sec, CN = this.ColNames[sec], mc = this.MainCol && !this.HideTree, i = C.Pos+1;
if(!C.Visible&&!C.Hidden) span -= C.WidthPad?2:1; 
while(--spn){
   var CC = this.Cols[CN[i]]; 
   if(!CC) { 
      if(!row.Fixed||!this.CPLastSec) break; 
      CN = this.ColNames[sec++]; if(!CN||!CN[0]) break; 
      i = 0; 
      CC = this.Cols[CN[i]]; 
      }
   if(CC.Visible||CC.Hidden) {
      if(CN[i]==mc) span++;
      if(CC.WidthPad) span++;
      span++; 
      if(CC.Visible) bspan = 1;
      else {
         if(CN[i]==mc) bspan++;
         if(CC.WidthPad) bspan++;
         bspan++; 
         }
      }
   i++;
   }
if(span<bspan) bspan = span;
cell.colSpan = span-bspan+1;
cell.nextSibling.colSpan = bspan;

}
// -----------------------------------------------------------------------------------------------------------
MS.ColSpan;
TGP.RefreshSpannedChilren = function(col,row){
var fm = !this.FastMerge;
for(var r=row.firstChild;r;r=r.nextSibling) if(r.r1){
   if(r.Spanned){
      if(r[col+"Span"]!=1) { 
         var cc = this.GetSpanCol(r,col);
         if(this.GetAttr(r,cc,"Button")) this.RefreshCellButton(r,cc);
         }
      if(fm){
         var m = r[cc+"Merge"]; if(m==null) m = r.Def[cc+"Merge"];
         if(m){
            m = r[cc+"MergeType"]; if(m==null) m = r.Def[cc+"MergeType"];
            if(!(m&2)) this.RefreshCell(r,cc);
            }
         }
      }
   if(r.firstChild) this.RefreshSpannedChilren(col,r);
   }
}
ME.ColSpan;
// -----------------------------------------------------------------------------------------------------------
// Repaints all cells in given columnwith MergeType&2==0
TGP.RefreshSpanned = function(col){
MS.ColSpan;
this.RefreshSpannedChilren(col,this.XH);
this.RefreshSpannedChilren(col,this.XF);
for(var r=this.XB.firstChild;r;r=r.nextSibling) this.RefreshSpannedChilren(col,r);
ME.ColSpan;   
}
// -----------------------------------------------------------------------------------------------------------
// Hides / displays more columns at once
// Show = array of hidden columns to show, Hide array of visible columns to hide
// If column is in both array, will be for prefer=0 shown and 1 hidden
TGP.ChangeColsVisibility = function(Show,Hide,prefer,noshow,noundo){
var C = this.Cols, A = {};
if(Hide) for(var i=0;i<Hide.length;i++){
   var c = C[Hide[i]];
   A[Hide[i]] = c && c.Visible ? -1 : 0; 
   }
if(Show) for(var i=0;i<Show.length;i++){
   var c = C[Show[i]];
   if(A[Show[i]]!=null){
      if(prefer) continue;  
      else A[Show[i]]=null; 
      }
   A[Show[i]] = c && !c.Visible ? 1 : 0; 
   }
if(Grids.OnColShow) for(var c in A) if(A[c] && Grids.OnColShow(this,c,A[c]==-1)) A[c] = 0;
MS.Undo;
if(this.Undo&8&&this.OUndo&&!noundo){
   var S = [], H = [];
   for(var c in A) if(A[c]==1) S[S.length] = c; else if(A[c]==-1) H[H.length] = c;
   this.UndoStart();
   this.AddUndo({Type:"ColsVisibility",Show:S,Hide:H});
   }
ME.Undo;
if(noshow==1 || this.Loading || this.Rendering || !this.BodyMain) {
   for(var c in A) if(c&&A[c]) C[c].Visible = A[c]==1; 
   this.UpdateSecCount();
   if(this.ACol && C[this.ACol] && !C[this.ACol].Visible) this.ACol = null;
   if(this.Undo&8&&this.OUndo&&!noundo) this.UndoEnd();
   return;
   }
if(!this.Loading && !this.Rendering) this.OverflowSpaces();
var zal = this.Rendering;
this.Rendering = 1;
for(var c in A){
   if(!c || !A[c]) continue; 
   MS.Media; this.UpdateMedia("Cols","Visible",A[c]==1?1:0,c); ME.Media;
   if(A[c]==1) this.ShowCol(c);
   else this.HideCol(c,null,1);
   }
if(this.Selecting && this.SelectingCols && this.SelectingCells>=3) {
   var S = []; for(var c in A) if(A[c]==-1) S[S.length] = c;
   for(var r=this.GetFirstVisible();r;r=this.GetNextVisible(r)) if(r.Selected&2) {
      if(Grids.OnSelect&&Grids.OnSelect(this,r,1,S)) continue;
      for(var i=0,chg=0;i<S.length;i++) if(r[S[i]+"Selected"]){ r[S[i]+"Selected"] = 0; this.ColorCell(r,S[i]); chg = 1; }
      if(chg) for(var c in C) if(r[c+"Selected"]){ chg = 0; break; }
      if(chg) { r.Selected = 0; this.ColorRow(r); }
      }
   
   }

this.Rendering = zal;
this.HideFCol();
if(this.Undo&8&&this.OUndo&&!noundo) this.UndoEnd();
this.UpdateHidden();
this.UpdateHeights();
if(this.XB.childNodes) this.UpdateHeader(); 
if(!this.ColsLap) this.SaveCfg();
if(CZoom!=1) { var r = this.GetFirstVisible(); if(r) this.RefreshRow(r);  }
if(this.GanttPaging) this.SetGanttHeader(this.GetFirstGantt(),1,1); 
if(!noshow) this.UpdateSync();
if((!noshow||noshow==3)&&this.SelectingFocus&&this.FRect) this.SelectFocus(this.FRow,this.FCol,this.FRect,0,1);
if(this.CalculateColumns) this.Calculate(1);
else {  }
MS.Filter;
if(this.FilterHidden=="0") {
   H = []; 
   for(var c in A) if(A[c]==-1) H[H.length] = c;
   this.FilterHiddenCols(H);
   }
ME.Filter;
if(BMozilla){ var T = this; setTimeout(function(){ T.Scrolled(1); },10); } 
}
// -----------------------------------------------------------------------------------------------------------
TGP.HideFCol = function(col){
if(!this.FCol||!this.Cols[this.FCol]) return;
var fc = this.FCol, ncol = fc, chg = 0, zv = null, F = this.FRect;
if(col&&this.Cols[col]) { zv = this.Cols[col].Visible; this.Cols[col].Visible = 0; }
if(F){
   MS.FocusRect;
   F = F.slice();
   if(!this.Cols[F[1]].Visible) { F[1] = this.GetNextCol(F[1]); chg = 1; }
   if(!this.Cols[F[3]].Visible) { F[3] = this.GetPrevCol(F[3]); chg = 1; }
   if(!F[1]||!F[3]||this.Cols[F[1]].Sec>this.Cols[F[3]].Sec||this.Cols[F[1]].Pos>this.Cols[F[3]].Pos) { 
      ncol = this.GetNextCol(F[3]); if(!ncol) ncol = this.GetPrevCol(F[1]); 
      F[1] = ncol; F[3] = ncol;
      }
   else if(!this.Cols[fc].Visible) { chg = 1; ncol = this.Cols[fc].Sec>this.Cols[F[3]].Sec||this.Cols[fc].Pos>this.Cols[F[3]].Pos ? F[3] : this.GetNextCol(fc); }
   ME.FocusRect;
   }
else if(!this.Cols[fc].Visible) { chg = 1; ncol = this.GetNextCol(fc); if(!ncol) ncol = this.GetPrevCol(fc); }
if(chg && this.Focus(this.FRow,ncol,null,F,2) && this.Undo&8) this.MergeUndo(); 
if(zv!=null) this.Cols[col].Visible = zv;
}
// -----------------------------------------------------------------------------------------------------------
// Hides the active or focused column

// -----------------------------------------------------------------------------------------------------------
// Hides the focused columns
TGP.ActionHideCols = function(F,T){
if(this.Locked["hidecol"]) return false;
var A = [], C = this.GetACols(F); if(!C) return false;
for(var c in C) if(C[c].Visible&&C[c].CanHide) A[A.length] = c;
if(!A.length) return false;
if(T) return A.length;
MS.Animate; if(this.AnimCols(A,"HideCols",this.HideColsT.bind(this,A))) return true; ME.Animate;
this.HideColsT(A); 
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.HideColsT = function(A){
if((this.Undo&12)==12) this.StartUndo();
this.ChangeColsVisibility(null,A);
if((this.Undo&12)==12) this.EndUndo();
return true;
}
// -----------------------------------------------------------------------------------------------------------
// Shows the column left side to active or focused column
TGP.ActionShowColLeft = function(F,T,right){
var col = this.GetACol(F,right?2:1), C = this.Cols; if(!col || !C[col] || this.Locked["hidecol"]) return false;
var q = right?1:-1, sec = C[col].Sec, S = this.ColNames, p = C[col].Pos+q;
while(1){
   while(S[sec][p] && !C[S[sec][p]].CanHide && !C[S[sec][p]].Visible) p += q;
   var ncol = S[sec][p];
   if(ncol){
      
      if(C[ncol].Visible) return false;
      if(T) return true;
      if(Grids.OnColShow && Grids.OnColShow(this,ncol,0)) return false;
      if(this.Undo&8) { this.UndoStart(); this.AddUndo({Type:"ColsVisibility",Show:[ncol],Hide:null}); }
      MS.Media; this.UpdateMedia("Cols","Visible",1,ncol); ME.Media;
      this.ShowCol(ncol);
      
      if(this.FRow && this.FCol==col) this.Focus(this.FRow,ncol,null,null,2); 
      if(this.Undo&8) this.UndoEnd();
      MS.Animate; this.AnimCol(ncol,"ShowCol"); ME.Animate;
      return true;
      }
   if(right){
      sec++; p = 0;
      if(sec>2) return false;
      }
   else {
      sec--; 
      if(sec<0) return false;
      p = S[sec].length-1;
      }
   }
}
TGP.ActionShowColRight = function(F,T){ return this.ActionShowColLeft(F,T,1); }
// -----------------------------------------------------------------------------------------------------------
// Shows all the hidden columns in focused range
TGP.ActionShowCols = function(F,T){
if(this.Locked["hidecol"]) return false;
var A = [], C = this.GetACols(F); if(!C) return false;
for(var c in C) if(!C[c].Visible&&C[c].CanHide) A[A.length] = c;
if(!A.length) return false;
if(T) return A.length;
this.ChangeColsVisibility(A);
MS.Animate; this.AnimCols(A,"ShowCols"); ME.Animate;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionShowAllCols = function(F,T){ return this.ActionHideCols(F?F|32:32,T); }
TGP.ActionHideCol = function(F,T){ return this.ActionHideCols(F?F|64:64,T); }
TGP.ActionHideSelectedCols = function(F,T){ return this.ActionHideCols(F?F|2:2,T); }
// -----------------------------------------------------------------------------------------------------------
ME.ColHide;

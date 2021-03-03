// -----------------------------------------------------------------------------------------------------------
// Functions for displaying Focus and Hover cursors
// -----------------------------------------------------------------------------------------------------------
var CCursors = "Border,Background,Color,Class,Corner";
// -----------------------------------------------------------------------------------------------------------
MS.Cursor;
// -----------------------------------------------------------------------------------------------------------
// Sets border cursor for cell or rows
// E is size and position of the cell
// A is the first HTML tag of the cursor (left border), cursor is left,right,top,bottom
// If set row, it is cursor for whole row
TGP.UpdateCursorCell = function(E,A,row,abs,showcorner){
A = A.firstChild;
if(!E || E.OverTop>=E.Height || E.OverBottom>=E.Height) { if(!A.style.display) A.style.display = "none"; return; }
var EX = E.AbsX, EY = E.AbsY;
var O = A.HoverMain; 
if(!O){ 
   O = { Left:this.MainTable.offsetLeft - A.parentNode.offsetLeft, Top:this.MainTable.offsetTop - A.parentNode.offsetTop }; 
   if(BSafari) A.HoverMain = O; 
   }
if(!abs) { 
   
   EX -= this.TableX - CAbsDX; 
   EY -= this.TableY - CAbsDY; 
   MS.Scale;
   if(this.ScaleX||this.ScaleY) { 
      var EE = E; E = {}; for(var a in EE) E[a] = EE[a]; 
      if(this.ScaleX) { var Z = this.ScaleX; EX /= Z; E.X /= Z; E.Width /= Z; if(E.OverLeft) E.OverLeft /= Z; if(E.OverRight) E.OverRight /= Z; }
      if(this.ScaleY) { var Z = this.ScaleY; EY /= Z; E.Y /= Z; E.Height /= Z; if(E.OverTop) E.OverTop /= Z; if(E.OverBottom) E.OverBottom /= Z; }
      }
   ME.Scale;
   EX += O.Left;
   EY += O.Top; 
   if(BSafari) EY += BSafariWin||BChrome ? this.Img.TableBPTop : this.Img.TablePTop;
   else if(BMozilla) EY += this.MainTable.clientTop;
   }
else if(BSafari&&!BSafariWin) EY += BChrome ? this.Img.TableBPTop : this.Img.TablePTop;
if(row){ 
   var ol = 0, or = 0, cx = this.GetRowLeft(row), cw = this.GetRowWidth(row); MS.Scale; if(this.Scale) { cw *= this.Scale; cx *= this.Scale; } if(this.ScaleX&&abs) { cw *= this.ScaleX; cx *= this.Scale; } ME.Scale;
   cx += abs ? this.TableX - CAbsDX : O.Left; 
   }
else { 
   var ol = E.OverLeft, or = E.OverRight, cx = EX, cw = E.Width; 
   if(ol>=cw || or>=cw) { 
      if(!A.style.display) A.style.display = "none"; return; 
      } 
   }
if(!BSafari) A.style.position = "fixed"; 
A.style.display = "";
var left = A.firstChild, right = left.nextSibling, top = right.nextSibling, bottom = top.nextSibling, corner = bottom.nextSibling;
if(BIE && (!top.style.height || A.Changed)){
   top.style.display = ""; bottom.style.display = ""; left.style.display = ""; right.style.display = ""; if(corner&&showcorner) corner.style.display = "";
   top.style.height = top.clientTop + top.firstChild.offsetTop + "px";
   bottom.style.height = bottom.offsetHeight - bottom.firstChild.offsetHeight + "px";
   left.style.width = GetBorderWidth(left.currentStyle) + "px";
   right.style.width = GetBorderWidth(right.currentStyle) + "px";
   A.Changed = null;
   }  
top.style.display = E.OverTop?"none":""; bottom.style.display = E.OverBottom?"none":"";
left.style.display = ol?"none":""; right.style.display = or?"none":"";
if(corner) corner.style.display = (this.Rtl?ol:or)||E.OverBottom||!showcorner?"none":"";
var lw,rw,th,bh,lcw,rcw,lh,rh,w,h;
if(BSafari){ 
   lw = ol ? -ol : left.lw; if(lw==null) { lw = left.offsetWidth; left.lw = lw; }
   rw = or ? -or : right.rw; if(rw==null) { rw = right.offsetWidth; right.rw = rw; }
   th = E.OverTop ? -E.OverTop : top.th; if(th==null) { th = top.offsetHeight; top.th = th; }
   bh = E.OverBottom ? -E.OverBottom : bottom.bh; if(bh==null) { bh = bottom.offsetHeight; bottom.bh = bh; }
   lcw = ol ? 0 : left.lcw; if(lcw==null) { lcw = lw-left.clientWidth; left.lcw = lcw; }
   rcw = or ? 0 : right.rcw; if(rcw==null) { rcw = rw-right.clientWidth; right.rcw = rcw; }
   w = cw+lw+rw; h = E.Height+th+bh;
   if(abs){ lh = 0; rh = 0; }
   else {
      var lch = ol ? 0 : left.lch; if(lch==null) { lch = left.offsetHeight-left.clientHeight; left.lch = lch; }
      var rch = or ? 0 : right.rch; if(rch==null) { rch = right.offsetHeight-right.clientHeight; right.rch = rch; }
      lh = ol ? 0 : lch + h; rh = or ? 0 : rch + h;
      }
   }
else { 
   lw = ol ? -ol : left.offsetWidth; rw = or ? -or : right.offsetWidth; 
   th = E.OverTop ? -E.OverTop : top.offsetHeight; bh = E.OverBottom ? -E.OverBottom : bottom.offsetHeight;
   lcw = ol ? 0 : lw-left.clientWidth; rcw = or ? 0 : rw - right.clientWidth;
   w = cw+lw+rw; h = E.Height+th+bh;
   lh = null; rh = null;
   }

if(w<0 || h<0) { A.style.display = "none"; return; }
var zoom = 1; if(!abs) zoom = CZoom;

top.style.width = w-lcw-rcw+"px";
bottom.style.width = w-lcw-rcw+"px"; 
left.style.height = h+"px";
right.style.height = h+"px";

var x = cx-lw, y = Math.round(EY-th);
left.style.left = x*zoom+"px";
left.style.top = y*zoom+"px";
if(lh==null) lh = abs||ol ? 0 : left.offsetHeight;
right.style.left = (cx+cw)*zoom+"px";
right.style.top = (y-lh)*zoom+"px";
if(rh==null) rh = abs||or ? 0 : right.offsetHeight;
top.style.left = (x+lcw)*zoom+"px";
top.style.top = (y-lh-rh)*zoom+"px";
bottom.style.left = (x+lcw)*zoom+"px";
bottom.style.top = (y-(abs?-th:lh+rh+E.OverTop)+E.Height)*zoom+"px";
if(corner){
   corner.style.top = bottom.style.top;
   corner.style.left = (this.Rtl?left:right).style.left;
   }
if(!BSafari) A.style.position = "";
}
// -----------------------------------------------------------------------------------------------------------
// Return width of the row in pixels
TGP.GetRowWidth = function(row){
var w, I = this.Img;
if(row.Space==0 || row.Space>=3) w = this.MainTable.clientWidth;
else {
   w = (this.TmpLeftWidth?this.TmpLeftWidth-I.LeftAllLeft:-I.MidAllLeft)
     + this.TmpMidWidth
     + (this.TmpRightWidth ? this.TmpRightWidth-I.RightAllWidth+I.RightAllLeft : I.MidAllLeft-I.MidAllWidth
       );
   MS.RelWidth; 
   if(this.RelWidth){
      var c = this.Cols[this.GetLastCol()]; if(c && c.ConstWidth && !this.ScrollHorzZoom[c.Sec]) w -= c.Width;
      var c = this.Cols[this.GetFirstCol()]; if(c && c.ConstWidth && !this.ScrollHorzZoom[c.Sec]) w -= c.Width;
      }
   
   ME.RelWidth; 
   }

return w;
}
// -----------------------------------------------------------------------------------------------------------
// Returns X position of the row in table
TGP.GetRowLeft = function(row){
var x, I = this.Img;
if(row.Space==0 || row.Space>=3) x = I.TableBPLeft;
else {
   x = I.TableBPLeft + (this.TmpLeftWidth?I.LeftAllLeft:I.MidAllLeft) + this.PagersLeft;
   MS.RelWidth; 
   if(this.RelWidth){ var c = this.Cols[this.Rtl?this.GetLastCol():this.GetFirstCol()]; if(c && c.ConstWidth && !this.ScrollHorzZoom[c.Sec]) x += c.Width; }
   ME.RelWidth;
    
   }

return x;
}
// -----------------------------------------------------------------------------------------------------------
// Sets background cursor of given row
// E is size and position of the first or the only cell
// F is size and position of the second cell (when both cursors are on the same row) or the same as E or null
// A is the first HTML tag in cursor (panel) - cursor is panel,left,center,right
TGP.UpdateCursorRow = function(row,E,F,A,abs){
A = A.firstChild;
if(!E || row.Space || row.DetailCol) { if(!A.style.display) A.style.display = "none"; return; }
if(E.OverTop>=E.Height || E.OverBottom>=E.Height) { if(!A.style.display) A.style.display = "none"; return; }
if(!F) F = E;
var EX = E.AbsX, EY = E.AbsY; 
var O = A.HoverMain; 
if(!O){ 
   O = { Left:this.MainTable.offsetLeft - A.parentNode.offsetLeft, Top:this.MainTable.offsetTop - A.parentNode.offsetTop }; 
   if(BSafari) A.HoverMain = O; 
   }
if(!abs) { 
   EX -= this.TableX - CAbsDX - O.Left; 
   EY -= this.TableY - CAbsDY - O.Top; 
   MS.Scale;
   if(this.ScaleX||this.ScaleY) { 
      var EE = E; E = {}; for(var a in EE) E[a] = EE[a]; 
      if(this.ScaleX) { var Z = this.ScaleX; EX /= Z; E.Width /= Z; if(E.OverLeft) E.OverLeft /= Z; if(E.OverRight) E.OverRight /= Z; }
      if(this.ScaleY) { var Z = this.ScaleY; EY /= Z; E.Height /= Z; if(E.OverTop) E.OverTop /= Z; if(E.OverBottom) E.OverBottom /= Z; }
      }
   ME.Scale;
   if(BSafari) EY += BSafariWin||BChrome ? this.Img.TableBPTop : this.Img.TablePTop;
   else if(BMozilla) EY += this.MainTable.clientTop;
   }
else if(BSafari&&!BSafariWin) EY += BChrome ? this.Img.TableBPTop : this.Img.TablePTop;
var FX = EX; 
if(F!=E){ 
   FX = F.AbsX; 
   if(!abs) {
      FX -= this.TableX - CAbsDX;
      MS.Scale;
      if(this.ScaleX) { 
         var FF = F; F = {}; for(var a in FF) F[a] = FF[a]; 
         var Z = this.ScaleX; FX /= Z; F.Width /= Z; if(F.OverLeft) F.OverLeft /= Z; if(F.OverRight) F.OverRight /= Z;
         }
      ME.Scale;
      FX += O.Left;
      }
   }
A.style.display = "";
var x = this.GetRowLeft(row,abs), w = this.GetRowWidth(row); MS.Scale; if(this.Scale) { w *= this.Scale; x *= this.Scale; } if(this.ScaleX&&abs) { w *= this.ScaleX; x *= this.ScaleX; } ME.Scale;
x += abs ? this.TableX - CAbsDX : this.MainTable.offsetLeft - A.parentNode.offsetLeft;
var panel = A.firstChild, left = panel.nextSibling, center = left.nextSibling, right = center.nextSibling, border = right.nextSibling;
var y = EY, h = E.Height-(E.OverBottom?E.OverBottom:0), hh = 0; 
MS.RowSpan; if(row.RowSpan && row.r1) { var rh = row.r1.firstChild.offsetHeight; if(h>rh) h = rh; } ME.RowSpan;
if(E.OverTop){ h -= E.OverTop; y += E.OverTop; }

if(h<=0) { A.style.display = "none"; return; }

var EW = E.Width;
if(row.Kind=="Header"){ 
   var bw = this.Img.CellBorderLeft+this.Img.CellBorderRight+1;
   if(!E.OverLeft) EX -= bw; 
   if(!E.OverRight) EW += bw;
   }

var hy = 0, zoom = 1;
if(!abs){ zoom = CZoom; hy = h*CZoom*CZoom; y*=CZoom; }

// --- Panel ---
var px = x, pw = 0;
var P = this.Cols.Panel, R = this.Cols[this.RowIndex];
if(P && P.Visible && (!row.Space&&row["LeftHtml"]==null || row.Panel)  && (P.Pos==0||P.Pos==1&&R&&R.Pos==0) && P.Sec==0 && h>1 && E.Col!="Panel" && F.Col!="Panel" && E.Col!=this.RowIndex && F.Col!=this.RowIndex && !this.Rtl) pw += P.Width;
if(R && R.Visible && !row.Space&&row["LeftHtml"]==null  && (R.Pos==0||R.Pos==1&&P&&P.Pos==0) && R.Sec==0 && h>1 && E.Col!=this.RowIndex && F.Col!=this.RowIndex && E.Col!="Panel" && F.Col!="Panel" && !this.Rtl) pw += R.Width;
if(pw&&!this.NoHScroll){
   panel.style.top = y-hh+"px";
   panel.style.left = px*zoom+"px";
   panel.style.height = h+"px";
   panel.style.width = pw+"px";
   panel.style.display = "";   
   px += pw;
   hh += hy;
   }
else panel.style.display = "none";

// --- The only cursor, cell is hidden ---
if(E==F && EW<=E.OverLeft+E.OverRight){
   if(px<w && h>1){
      left.style.top = y-hh+"px";
      left.style.left = px*zoom+"px";
      left.style.height = h+"px";
      left.style.width = w-px+x+"px";
      left.style.display = "";
      hh += hy;
      }
   else left.style.display = "none"; 
   center.style.display = "none";
   right.style.display = "none";
   }
   
else {   
   // --- Left ---
   if(px<EX+E.OverLeft && h>1){
      left.style.top = y-hh+"px";
      left.style.left = px*zoom+"px";
      left.style.height = h+"px";
      left.style.width = EX-px+E.OverLeft+"px";
      left.style.display = "";
      
      hh += hy;
      }
   else left.style.display = "none"; 
   
   // --- Center ---
   var EL = EX+EW-E.OverRight + (E.OverLeft>EW?E.OverLeft-EW:0);
   if(EL<FX+F.OverLeft && (F.Width||!this.Rtl) && h>1){ 
      center.style.top = y-hh+"px";
      center.style.left = EL*zoom+"px";
      center.style.height = h+"px";
      center.style.width = FX+F.OverLeft-EL+(F.OverRight>F.Width?F.Width-F.OverRight:0)+"px";
      center.style.display = "";
      
      hh += hy;
      }
   else center.style.display = "none"; 
   
   // --- Right ---
   if(FX+F.Width-F.OverRight<w+x && h>1){
      right.style.top = y-hh+"px";
      right.style.left = (FX+F.Width-F.OverRight)*zoom+"px";
      right.style.height = h+"px";
      right.style.width = w-FX-F.Width+F.OverRight+x+"px";
      right.style.display = "";
      
      hh += hy;
      }
   else right.style.display = "none"; 
   }
}   
// -----------------------------------------------------------------------------------------------------------
ME.Cursor;

MS.Cursor$Edit;
// -----------------------------------------------------------------------------------------------------------
// Sets cursor for editing
// row,col is the cell, A is HTML tag of edit cursor
TGP.UpdateCursorEdit = function(row,col,A){

if(!A) A = this.FocusCursors.firstChild;
A = A.firstChild;
if(!this.EditMode || !row || !col) { 
   A.style.display = "none"; 
   if(BIPAD){ A.style.left = ""; A.style.top = ""; A.style.height = ""; A.style.width = ""; }
   return; 
   }
var S = this.GetCellInnerSize(row,col), E = this.CellToWindow(row,col,0), zoom = 1;
var w = E.Width, h = E.Height, x = E.AbsX, y = E.AbsY, I = this.Img; if(h==null) h = -1; if(w==null) w = -1;
if(!(this.AbsoluteCursors&2)) { 
   x -= this.TableX - CAbsDX; 
   y -= this.TableY - CAbsDY;
   MS.Scale;
   if(this.ScaleX||this.ScaleY) { 
      var EE = E; E = {}; for(var a in EE) E[a] = EE[a]; 
      if(this.ScaleX) { var Z = this.ScaleX; x /= Z; E.Width /= Z; if(E.OverLeft) E.OverLeft /= Z; if(E.OverRight) E.OverRight /= Z; }
      if(this.ScaleY) { var Z = this.ScaleY; y /= Z; E.Height /= Z; if(E.OverTop) E.OverTop /= Z; if(E.OverBottom) E.OverBottom /= Z; }
      }
   ME.Scale;
   x -= A.parentNode.parentNode.offsetLeft - this.MainTable.offsetLeft;
   y -= A.parentNode.parentNode.offsetTop - this.MainTable.offsetTop; 
   if(BSafari) y += BSafariWin||BChrome ? this.Img.TableBPTop : this.Img.TablePTop;
   else if(BMozilla) y += this.MainTable.clientTop;
   zoom = CZoom;
   }

var ol = E.OverLeft, or = E.OverRight, ot = E.OverTop, ob = E.OverBottom;
if(ol) { x += ol; w -= ol; S[0] -= ot; }
if(or) { w -= or; }
if(ot) { y += ot; h -= ot; S[1] -= ot; }
if(ob) { h -= ob; }
var pos = A.style.position;
if(h<=0||w<=0) { 
   h = 1; w = 1; S = [0,0,1,1]; 
   if(pos!="fixed") A.style.position = "fixed";
   }
else if(pos!="relative") A.style.position = "relative";
MS.Scale;

var Z = this.GetScale(row,2,this.Scale); if(Z) { w /= Z; h /= Z; S[0] *= Z; S[1] *= Z; }

if(this.ScaleX) { w /= this.ScaleX; if(this.AbsoluteCursors&2) S[0] *= this.ScaleX; }
if(this.ScaleY) { h /= this.ScaleY; if(this.AbsoluteCursors&2) S[1] *= this.ScaleY; }
ME.Scale;
var xx = x+S[0], ww = w < S[0]+S[2] ? w-S[0] : S[2];
var yy = y+S[1], hh = h < S[1]+S[3] ? h-S[1] : S[3];

if(BIE){ ww += I.EditBPWidth; hh += I.EditBPHeight; }

xx -= I.EditBPLeft; yy -= I.EditBPTop; 
if(row.Space){
   xx -= I.EditInputSpaceBPLeft; yy -= I.EditInputSpaceBPTop;
   ww += I.EditInputSpaceBPWidth; if(BIE) hh += I.EditInputSpaceBPHeight;
   }
else if(this.DynamicBorder&&!row.NoDynBorder){
   xx -= I.EditInputDBBPLeft; yy -= I.EditInputDBBPTop;
   ww += I.EditInputDBBPWidth; if(BIE) hh += I.EditInputDBBPHeight;
   }
else {
   xx -= I.EditInputBPLeft; yy -= I.EditInputBPTop;
   ww += I.EditInputBPWidth; if(BIE) hh += I.EditInputBPHeight;
   }

A.style.marginLeft = "";
if(this.Overlay && !row.Space && this.GetAttr(row,col,"Overlay")&1){
   var c = this.GetCell(row,col), left = c&&c.className.indexOf("OverflowLeftVisible")>=0, right = c&&c.className.indexOf("OverflowVisible")>=0;
   if(this.Edit&&this.Edit.ParentAutoSize&2){ left = this.Edit.Align=="Center"||this.Edit.Align=="Right"; right = this.Edit.Align!="Right"; }
   if((left||right)&&c){
      var cfs = null, cp = this.ColPaging, sec = this.Cols[col].Sec;
      if(c.className.indexOf("OverflowWrap")>=0) { cfs = c.lastChild.style; if(cfs) { cfs.width = ""; cfs.whiteSpace = "nowrap"; } }
      var dbl = c.clientLeft, dbr = this.Img.CellBorderRight, oow = c.offsetWidth-dbl-dbr, oc = c, lw;
      if(this.Edit) {
         left = this.Edit.Align=="Center"||this.Edit.Align=="Right"; right = this.Edit.Align!="Right"; 
         lw = (left&&right ? Math.floor(this.Edit.Tag.scrollWidth/2 - ww/2) : this.Edit.Tag.scrollWidth - ww) - this.Edit.Tag.offsetLeft + oow; 
         if(BTablet&&lw==oow&&this.Edit.Tag.clientWidth<lw) lw += 10; 
         }
      else lw = !right ? c.lastChild.offsetWidth : !left ? c.scrollWidth : Math.floor(c.lastChild.firstChild.scrollWidth/2+c.offsetWidth/2);
      var ctr = left&&right&&oc.className.indexOf("OverflowCenterTo")>=0 ? oc.className.match(/OverflowCenterTo_(\d+)_(\d+)_([-\d]+)/) : null;
      if(right){
         var w = lw, c = oc, nw = oow, ow = oow, cctr = ctr?ctr[2]-0 : 0;
         if(ctr){ if(this.Edit) w += ctr[3]/2; else if(ctr[3]<0) w -= -ctr[3]; }
         while(cctr-->0||w>ow) {
            var cc = c.nextSibling; 
            if(cp&&!cc&&sec&&(sec!=this.LastSec||this.SecCount==2)){ 
               var rc = row["r"+(++sec)]; if(rc) { cc = rc.firstChild; if(cc&&this.LeftTD) cc = cc.nextSibling; }
               }
            if(!cc) break;
            w -= ow; c = cc; ow = c.offsetWidth; nw += ow;
            }
         if(cfs) { cfs.width = nw>oc.offsetWidth-oc.clientLeft ? nw-oc.lastChild.offsetLeft*2+"px" : ""; cfs.whiteSpace = ""; }
         if(nw>oow) {
            ww += nw-oow-dbl-dbr;
            if(left) { 
               if(ctr) nw -= ctr[3];
               var sec = this.Cols[col].MainSec, m = this.GetColLeft(col)+this.Cols[col].Width-this.GetScrollLeft(sec);
               if(nw>m) nw = m;
               ww += nw-oow+dbl+dbr; A.style.marginLeft = Z ? (-nw+oow-dbr)*Z+"px" : -nw+oow-dbr+"px"; 
               }
            else if(this.Rtl) {
               var sec = this.Cols[col].MainSec, m = this.GetScrollLeft(sec)+this.GetBodyWidth(sec)-this.GetColLeft(col);
               if(nw>m) { ww += m-nw; nw = m; }
               A.style.marginLeft = Z ? (-nw+oow+dbl+dbr)*Z+"px" : -nw+oow+dbl+dbr+"px";
               }
            }
         }
      else if(left){
         var w = lw, c = oc, nw = oow, ow = oow, cctr = ctr?ctr[1]-0 : 0;
         if(ctr){ if(this.Edit) w -= ctr[3]/2; else if(ctr[3]>0) w -= ctr[3]; }
         while(cctr-->0||w>ow) {
            var cc = c.previousSibling; 
            if(cp&&!cc&&sec&&(sec!=this.LastSec||this.SecCount==2)){ 
               var rc = row["r"+(--sec)]; while(!rc && sec>1) rc = row["r"+(--sec)]; if(rc) cc = rc.lastChild; 
               }
            if(!cc) break;
            w -= ow; c = cc; ow = c.offsetWidth; nw += ow;
            }
         if(cfs) { cfs.width = nw>oc.offsetWidth-oc.clientLeft ? nw-oc.lastChild.offsetLeft*2+"px" : ""; cfs.whiteSpace = ""; }
         var sec = this.Cols[col].MainSec, m = this.GetColLeft(col)+this.Cols[col].Width-this.GetScrollLeft(sec);
         if(nw>m) nw = m;
         if(nw>oow) { ww += nw-oow; if(!this.Rtl) A.style.marginLeft = Z ? (-nw+oow)*Z+"px" : -nw+oow+"px"; }
         }

      }
   }

if(ww<0 || hh<0 || this.GetType(row,col)=="Enum") { A.style.display = "none"; return; }

MS.Scale;
var sc = this.GetScale(row,0);
if(this.ScaleX&&this.AbsoluteCursors&2) { var Z = sc?sc:1; A.style.transform = "scale("+Z*this.ScaleX+","+Z*this.ScaleY+")"; A.style.transformOrigin = "0 0"; }
else if(sc) { A.style.transform = "scale("+sc+")"; A.style.transformOrigin = "0 0"; }
else if(A.style.transform) A.style.transform = "";
ME.Scale;
A.style.left = xx*zoom+"px";
A.style.top = yy*zoom+"px";
A.style.width = ww+"px";
A.style.height = hh+"px";
A.style.display = "";
var F = A.firstChild;
if(F && F.style){
   if(this.Rtl) F.style.marginRight = (or ? -or : 0) + "px";
   else F.style.marginLeft = (ol ? -ol : 0) + "px";
   
   }  
}
// -----------------------------------------------------------------------------------------------------------
// Creates HTML cursor tags, name is "Focus" or "Hover"
TGP.CreateCursors = function(name){
var id = this.GetItemId(name+"Cursors"), A = GetElem(id), abs = this.AbsoluteCursors&(name=="Hover"?1:2);
if(!A){
   var s = "", prefix = this.Img.Style, dyb = this.DynamicBorder;
   if(name=="Focus") s += "<div align='left' style='"+(abs?"":"height:1000px;")+"'><div"+this.GetItemId("Edit",null,null,null,1)+" class='"+prefix+"EditCellInput' style='"+(abs?"position:absolute;":"")+(this.ZIndex!=null?"z-index:"+(this.ZIndex+3)+";":"")+"display:none;'></div></div>"; 
   MS.Pager;
   for(var i=0;i<this.Pagers.length;i++){
      s += "<div align='left' style='"+(abs?"":"height:1000px;")+"'><div class='"+prefix+"Pager"+name+"' style='"+(abs?"position:absolute;":"")+"display:none;'></div></div>"; 
      }
   ME.Pager;
   MS.Cursor;
      var border = name=="Focus" ? this.FocusCellBorderCursor : 0, cellb = "CellBorder"; if(BTablet&&name=="Focus") cellb += " "+prefix+"FocusCellBorderTouch";
   var M = [
      "PanelBackground","Background", 
      "RowBackground","Background",   
      "RowBackground","Background",   
      "RowBackground","Background",   
      "RowBorder","BorderLeft", 
      "RowBorder","BorderRight", 
      "RowBorder","BorderTop", 
      "RowBorder","BorderBottom", 
      cellb,"BorderLeft", 
      cellb,"BorderRight", 
      cellb,"BorderTop", 
      cellb,"BorderBottom"]; 
   var zix = "", has = this.ZIndex!=null, pe = BTablet ? "pointer-events:none;" : "";
   for(var i=0;i<M.length;i+=2) {
      if(has) zix = "z-index:"+((name=="Focus" ? 2 : 5) + Math.floor(i/8) + this.ZIndex)+";";
      if(!(i%8)) s += (i?"</div></div>":"")+"<div align='left' style='"+(abs?"":"height:4000px;")+"'><div style='display:none;'>";
      var cur = border&&i>=16 ? "cursor:"+["w-resize","e-resize","n-resize","s-resize","move"][border==2?i/2-8:4]+";" : "";
      s += "<div class='"+prefix+name+M[i]+" "+(dyb?prefix+name+M[i]+"Dynamic ":"")+prefix+"Cursor"+M[i+1]+"' style='"+cur+(abs?"position:absolute;":"")+pe+zix+"display:none;'><div style='height:"+(BIE?1:0)+"px;overflow:hidden;'></div></div>"; 
      }
   if(name=="Focus") s += "<div"+this.GetItemId("FocusCorner",null,null,null,1)+" class='"+prefix+"FocusCellCorner"+(BTablet?" "+prefix+"FocusCellCornerTouch":"")+"' style='"+(abs?"position:absolute;":"")+pe+zix+"display:none;'><div style='height:"+(BIE?1:0)+"px;overflow:hidden;'></div></div>"; 
   s += "</div></div>";
   ME.Cursor;   
   A = document.createElement("div");
   A.id = id;
   A.innerHTML = s;
   if(abs){
      //.innerHTML = "";
      A.style.position = "absolute";
      A.style.left = "0px";
      A.style.top = "0px";
      A.style.zIndex = this.ZIndex ? this.ZIndex+1:1; 
      this.AppendTag(A);
      
      //.innerHTML = s;
      }
   else {
      A.style.marginTop = "-100000px";
      this.MainTable.parentNode.appendChild(A);
      }
   }   
else if(A == this[name+"Cursors"]) return; 
this[name+"Cursors"] = A; 
A.ARowStop = -1;

var WS = 0, S = null; if(!this.NoScroll && (!this.NoVScroll || !this.NoHScroll)){ S = new Function("ev","return "+this.This+".GridMouseWheel(ev);"); WS = this.BodyMain[1].onwheel || window.WheelEvent ? 1 : 2; }

// --- Cell cursors ---
var N = [], E = [];
if(BMouse) {
   N.push("GridClick","GridDblClick","GridRightClick","GridMouseDown","GridMouseUp","GridMouseMove"); 
   E.push("onclick","ondblclick","oncontextmenu","onmousedown","onmouseup","onmousemove"); 
   }

var F = []; for(var i=0;i<N.length;i++) F[i] = new Function("ev","return "+this.This+"."+N[i]+(BIEA?"(event);":"(ev);"));
var P = A.firstChild, move = null, touch = null; 
if(name=="Focus") {
   move = new Function("ev",this.This+".ARow="+this.This+".FRow;"+this.This+".GridMouseMove"+(BIEA?"(event);":"(ev);"));
   MS.Touch;
   if(BTouch){ 
      
      var touchs = "if("+this.This+".FRect)"+this.This+".FindARow(ev?ev:event);else "+this.This+".ARow="+this.This+".FRow;"+this.This+".GridTouch";
      touch = [new Function("ev",touchs+"Start(ev,1);"),new Function("ev",touchs+"End(ev);"),new Function("ev",touchs+"Move(ev);")];
      }
   ME.Touch;
   P = P.nextSibling; 
   MS.Resize;   
   var R = GetElem(this.GetItemId("Resize"));
   if(R) {
      for(var i=0;i<N.length;i++) R[E[i]] = F[i];
      this.ResizeIcon = R;
      }
   ME.Resize; 
   }

MS.Pager;
for(var i=0;i<this.Pagers.length;i++) {
   var a = P.firstChild;
   if(name=="Focus") {
      this.Pagers[i].Focus = a;
      a.onmouseover = new Function(this.This+".ARow=null;"+this.This+".ASec="+(-i-10)+";");
      a.onmousemove = new Function("ev","return "+this.This+".GridMouseMove"+(BIEA?"(event);":"(ev);"));
      }
   else {
      this.Pagers[i].Hover = a;
      if(abs) a.onclick = new Function("return "+this.This+".ActionShowPage();"); 
      if(BIPAD) a.onmousedown = new Function("ev",this.This+".GridMouseDown"+(BIEA?"(event);":"(ev);")); 
      }
   if(WS && PreventMouseWheel.bind) {
      var PM = PreventMouseWheel.bind(null,this.WheelFixed>=5?this:null,this.Pagers[i].Body,2);
      if(WS==1) a.addEventListener('wheel',PM,false); else if(WS==2) { a.onmousewheel = PM; if(a.addEventListener) a.addEventListener('DOMMouseScroll',PM,false); }
      }
   P = P.nextSibling; 
   }
ME.Pager;

MS.Cursor;
for(;P;P=P.nextSibling){
   for(var a=P.firstChild.firstChild;a;a=a.nextSibling){
      if(WS==1) a.addEventListener('wheel',S,false); else if(WS==2) { a.onmousewheel = S; if(a.addEventListener) a.addEventListener('DOMMouseScroll',S,false); }
      if(abs) for(var i=0;i<N.length;i++) a[E[i]] = F[i];
      if(move) a.onmousemove = move;
      if(name=="Hover" && a.className.indexOf("Border")>=0) a.onmousemove = new Function("ev","TGCancelEvent(ev?ev:event);");
      if(BIEA) a.onselectstart = new Function("ev","TGCancelEvent(ev,2);");
      MS.Touch; if(touch&&(P!=A.lastChild||name!="Focus")){ AttachEvent(a,"touchstart",touch[0]); AttachEvent(a,"touchend",touch[1]); AttachEvent(a,"touchmove",touch[2]); } ME.Touch; 
      }
   }
ME.Cursor;  
if(name=="Focus"){ 
   P = A.lastChild;
   var E = ["LeftEdge","RightEdge","TopEdge","BottomEdge","Corner"];
   for(var a=P.firstChild.firstChild,i=0;a;a=a.nextSibling,i++){
      if(BTouch) { this.InCursorTouchStart = 0; AttachEvent(a,"touchstart",new Function("ev",this.This+".CursorTouchStart(ev?ev:event,'"+E[i]+"',this);")); } 
      if(BMouse) a.onmousemove = new Function("ev","if("+this.This+".FRect)"+this.This+".FindARow(ev?ev:event);else "+this.This+".ARow="+this.This+".FRow;"+this.This+".FocusedEdge='"+E[i]+"';"+this.This+".GridMouseMove"+(BIEA?"(event,1)":"(ev,1)")+";"+this.This+".FocusedEdge=null;");
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.CursorTouchStart = function(ev,edge,obj){
if(!this.InCursorTouchStart) this.FocusedEdge = edge;
if(this.FRect) this.FindARow(ev);
else this.ARow = this.FRow;
if(!this.ARow){
   this.InCursorTouchStart++;
   obj.style.display = "none";
   this.UpdateARow(-1,ev.changedTouches[0].clientX,ev.changedTouches[0].clientY);
   obj.style.display = "";
   this.InCursorTouchStart--;
   }
if(!this.InCursorTouchStart) this.GridTouchStart(ev);
CancelEvent(ev);
}
// -----------------------------------------------------------------------------------------------------------
ME.Cursor$Edit;
// -----------------------------------------------------------------------------------------------------------
// Deletes HTML cursor tags
TGP.ClearCursors = function(type){
MS.Cursor$Edit;
if(this.FocusCursors&&(!type||type&1)) { try { this.FocusCursors.parentNode.removeChild(this.FocusCursors); } catch(e) { } this.FocusCursors = null; }
if(this.HoverCursors&&(!type||type&2)) { try { this.HoverCursors.parentNode.removeChild(this.HoverCursors); } catch(e) { } this.HoverCursors = null; }
this.LCursor = { };
ME.Cursor$Edit;
}
// -----------------------------------------------------------------------------------------------------------
// Main function to show cursors (Focus and Hover), updates the cursor positions, including cell colors
TGP.UpdateCursors = function(always,EF){
if(this.BodyTop==null || Grids.Drag&&(Grids.Drag.Hidden||Grids.Drag.Action=="DragImage") || !this.MainTable || !this.MainTable.parentNode || this.Cleared || !this.XB.childNodes) return; 
if(this.EditMode && this.Edit && (this.Edit.Multi||this.Edit.ParentAutoSize) && this.Edit.Resize(0,1)) return;
if(this.InCursors) return;
this.InCursors = 1;

var O = this.LCursor, spec = !this.BorderCursors;

// --- Color hover cell / row ---
MS.Color;
if(this.Hover && (O.ARow!=this.ARow||O.ACol!=this.ACol) && (!Grids.Drag||Grids.Drag.Action!="Select"&&Grids.Drag.Action!="Fill"&&Grids.Drag.Action!="Focus")){
   if(this.Hover>=2 && O.ARow!=this.ARow){
      if(O.ARow && !O.ARow.Space && (this.GetFlags(O.ARow,O.ACol,"HoverRow",CCursors)["color"]||spec)) this.ColorRow(O.ARow);
      if(this.ARow && !this.ARow.Space && (this.GetFlags(this.ARow,this.ACol,"HoverRow",CCursors)["color"]||spec)) this.ColorRow(this.ARow);
      }
   if(this.Hover>=1 && (O.ACol!=this.ACol || O.ARow!=this.ARow)) {
      if(O.ARow && O.ACol) {
         var flg = this.GetFlags(O.ARow,O.ACol,"HoverCell",CCursors);
         if((flg["class"] || O.ARow[O.ACol+"ClassHover"]) && (!BEdge || !this.Touched || !Grids.Drag) && !BTablet) this.RefreshCell(O.ARow,O.ACol,1); 
         else if(flg["color"] || spec) this.ColorCell(O.ARow,O.ACol);
         }
      if(this.ARow && this.ACol) {
         var flg = this.GetFlags(this.ARow,this.ACol,"HoverCell",CCursors);
         if((flg["class"] || this.ARow[this.ACol+"ClassHover"]) && (!BEdge || !this.Touched || !Grids.Drag) && !BTablet) this.RefreshCell(this.ARow,this.ACol,1); 
         else if(flg["color"] || spec) this.ColorCell(this.ARow,this.ACol);
         }
      }
   }  

// --- Color focus cell / row ---
if(O.FRow!=this.FRow||O.FCol!=this.FCol){
   if(O.FRow!=this.FRow){
      if(O.FRow && !O.FRow.Space && !O.FRow.Page){
         var flg = this.FocusRect&4 ? {} : this.GetFlags(O.FRow,O.FCol,"FocusRow",CCursors);
         if(flg["class"] && (!BEdge || !this.Touched || !Grids.Drag)) this.RefreshRow(O.FRow);
         else if(flg["color"]||spec) this.ColorRow(O.FRow);
         }
      if(this.FRow && !this.FRow.Space && !this.FRow.Page){
         var flg = this.FocusRect&4 ? {} : this.GetFlags(this.FRow,this.FCol,"FocusRow",CCursors)
         if(flg["class"] && (!BEdge || !this.Touched || !Grids.Drag)) this.RefreshRow(this.FRow);
         else if(flg["color"]||spec) this.ColorRow(this.FRow);
         }   
      }
   if((O.FCol!=this.FCol || O.FRow!=this.FRow) && !this.FocusWholeRow) {
      if(O.FRow && O.FCol && !O.FRow.Page) {
         var flg = this.GetFlags(O.FRow,O.FCol,"FocusCell",CCursors);
         if(flg["class"] && (!BEdge || !this.Touched || !Grids.Drag)) this.RefreshCell(O.FRow,O.FCol,1); 
         else if(flg["color"]||spec) this.ColorCell(O.FRow,O.FCol);
         }
      if(this.FRow && this.FCol && !this.FRow.Page) {
         var flg = this.GetFlags(this.FRow,this.FCol,"FocusCell",CCursors);
         if(flg["class"] && (!BEdge || !this.Touched || !Grids.Drag) ) this.RefreshCell(this.FRow,this.FCol,1); 
         else if(flg["color"]||spec) this.ColorCell(this.FRow,this.FCol);
         }
      }
   }

// --- ColorCursor ---
if(this.ColorCursor&7){
   var ColorCell = this.ColorCursor&16 ? "RefreshCell" : "ColorCell";
   if(this.ColorCursor&1){
      if(this.ACol!=O.ACol) for(var j=0,A=[this.XH,this.XF];j<2;j++) {
         for(var r=A[j].firstChild;r;r=r.nextSibling) if(r.ColorCursor&1) { 
            if(this.ACol&&this.Cols[this.ACol]&&!this.Cols[this.ACol].ColorCursor) this[ColorCell](r,this.ACol); if(O.ACol&&this.Cols[O.ACol]&&!this.Cols[O.ACol].ColorCursor) this[ColorCell](r,O.ACol); 
            }
         }
      if(this.ARow!=O.ARow) for(var j=0,A=[0,this.ColNames.length-1];j<2;j++) {
         var N = this.ColNames[A[j]]; for(var i=0;i<N.length;i++) if(this.Cols[N[i]].ColorCursor&1) { 
            if(this.ARow && !this.ARow.ColorCursor) this[ColorCell](this.ARow,N[i]); if(O.ARow && !O.ARow.ColorCursor) this[ColorCell](O.ARow,N[i]); 
            }
         }
      }
   MS.FocusRect;
   if(this.ColorCursor&2){
      if(this.FRect ? !O.FRect||this.FRect[0]!=O.FRect[0]||this.FRect[2]!=O.FRect[2] : O.FRect) {
         var R = {}; 
         if(this.FRect) { 
            for(var r=this.FRect[0];r&&r!=this.FRect[2];r=this.GetNextVisible(r,4)) R[r.id] = r; 
            if(r) R[r.id] = r;
            }
         if(O.FRect) {
            for(var r=O.FRect[0];r&&r!=O.FRect[2];r=this.GetNextVisible(r,4)) if(R[r.id]) delete R[r.id]; else R[r.id] = r;
            if(r) { if(R[r.id]) delete R[r.id]; else R[r.id] = r; }
            }
         for(var j=0,A=[0,this.ColNames.length-1];j<2;j++) {
            var N = this.ColNames[A[j]]; for(var i=0;i<N.length;i++) if(this.Cols[N[i]].ColorCursor&1) { 
               for(var id in R) if(!R[id].ColorCursor) this[ColorCell](R[id],N[i]);
               }
            }
         }
      if(this.FRect ? !O.FRect||this.FRect[1]!=O.FRect[1]||this.FRect[3]!=O.FRect[3] : O.FRect) {
         var R = {};
         if(this.FRect) {
            for(var c=this.FRect[1];c&&c!=this.FRect[3];c=this.GetNextCol(c)) R[c] = 1;
            R[c] = 1;
            }
         if(O.FRect) {
            for(var c=O.FRect[1];c&&c!=O.FRect[3];c=this.GetNextCol(c)) if(R[c]) delete R[c]; else R[c] = 1;
            if(R[c]) delete R[c]; else R[c] = 1;
            }
         for(var j=0,A=[this.XH,this.XF];j<2;j++) {
            for(var r=A[j].firstChild;r;r=r.nextSibling) if(r.ColorCursor&1) { 
               for(var c in R) if(this.Cols[c]&&!this.Cols[c].ColorCursor) this[ColorCell](r,c);
               }
            }
         }
      }
   ME.FocusRect;
   if(this.ColorCursor&4){
      if(this.FCol!=O.FCol && !this.FocusWholeRow) for(var j=0,A=[this.XH,this.XF];j<2;j++) {
         for(var r=A[j].firstChild;r;r=r.nextSibling) if(r.ColorCursor&1) { 
            if(this.FCol && this.Cols[this.FCol] && !this.Cols[this.FCol].ColorCursor) this[ColorCell](r,this.FCol); if(O.FCol && this.Cols[O.FCol] && !this.Cols[O.FCol].ColorCursor) this[ColorCell](r,O.FCol); 
            }
         }
      if(this.FRow!=O.FRow) for(var j=0,A=[0,this.ColNames.length-1];j<2;j++) {
         var N = this.ColNames[A[j]]; for(var i=0;i<N.length;i++) if(this.Cols[N[i]].ColorCursor&1) { 
            if(this.FRow && !this.FRow.Page && !this.FRow.ColorCursor) this[ColorCell](this.FRow,N[i]); if(O.FRow && !O.FRow.Page && !O.FRow.ColorCursor) this[ColorCell](O.FRow,N[i]);
            }
         }
      }
   }

// --- Color edit cell ---
if(O.EditMode && O.FRow && O.FCol && (!this.EditMode || this.FRow!=O.FRow || this.FCol!=O.FCol)) this.ColorCell(O.FRow,O.FCol);
if(this.EditMode && this.FRow && this.FCol && (!O.EditMode || this.FRow!=O.FRow || this.FCol!=O.FCol)) this.ColorCell(this.FRow,this.FCol);
ME.Color;

MS.Cursor$Edit;

// --- Initialization of external cursors ---
if(!this.FocusCursors) this.CreateCursors("Focus");
if(!this.HoverCursors) this.CreateCursors("Hover");
var Top = this.GetScrollTop(1), Left = this.GetScrollLeft(0)*1000+this.GetScrollLeft(1)+this.GetScrollLeft(2)*1000000;
var absf = this.AbsoluteCursors&2, absh = this.AbsoluteCursors&1;
var E = null, F = null, T = this;
function GetE(){  
   if(E) return E;
   MS.UserSec;
   if(!T.ACol && T.Event["CellKind"] == "KindUser" && T.Event["CellEdit"]){
      E = T.CellToWindow(T.ARow,null,2,null,T.Event["CellEdit"].slice(8)-0); 
      return E;
      }
   ME.UserSec;
   E = T.CellToWindow(T.ARow,T.ACol,2); 
   return E; 
   }
function GetF(){ 
   if(!F) F = EF&&T.FRow==T.ERow&&T.FCol==T.ECol&&!T.FocusWholeRow&&T.FPagePos==null ? EF : T.CellToWindow(T.FRow,T.FocusWholeRow?null:T.FCol,2,T.FPagePos); 
   return F;
   } 

var fr = this.FRow!=O.FRow || this.FPagePos!=O.FPagePos || Top!=O.Top || always;
var fc = this.FCol!=O.FCol || Left!=O.Left;
var hr = this.ARow!=O.ARow || Top!=O.Top || always;
var hc = this.ACol!=O.ACol || Left!=O.Left || !this.ACol; 

// --- Focus cursors ---
var A = this.FocusCursors.firstChild;

// --- Edit cursor ---
if(fr || fc || !this.EditMode!=!O.EditMode){
   this.UpdateCursorEdit(this.ERow,this.ECol,A);
   }
A = A.nextSibling;
ME.Cursor$Edit;

MS.Cursor;

// --- Pager ---
MS.Pager;
var upd = always;
for(var i=0;i<this.Pagers.length;i++){
   var P = this.Pagers[i];
   if(P.Type!="Gantt" && Top!=O.Top || P.Type!="Pages" && Left!=O.Left || always) { P.Focus.style.display = P.Visible ? "" : "none"; upd = 1; }
   A = A.nextSibling;
   }
if(upd) this.UpdatePagerPos((always||Top!=O.Top?1:0)+(always||Left!=O.Left?2:0),this.Touched);
ME.Pager;   

if(!spec) {
   // --- Focus row background ---
   if(fr || fc || (this.FRow==this.ARow&&this.FRow || O.FRow==O.ARow&&O.FRow) && (this.ACol!=O.ACol || this.ARow!=O.ARow)) { 
      if(!this.FRow || this.FocusRect&4 || !this.GetFlags(this.FRow.Page?this.Root:this.FRow,this.FCol,"FocusRow",CCursors)["background"]) A.firstChild.style.display = "none";
      else if(this.FRow && this.FRow==this.ARow) {
         var XE = GetE(), XF = GetF(), fe = XE.AbsX + XE.OverLeft < XF.AbsX + XF.OverLeft;
         this.UpdateCursorRow(this.FRow,!this.FCol||fe?E:F,this.FCol&&fe?F:E,A,absf);
         }
      else this.UpdateCursorRow(this.FRow,GetF(),null,A,absf);
      }
   A = A.nextSibling;
   
   // --- Focus row border ---
   if(fr){
      if(!this.FRow || this.FocusRect&4 || !this.GetFlags(this.FRow.Page?this.Root:this.FRow,this.FCol,"FocusRow",CCursors)["border"]) {
         if(always && BIEStrict && !BIE8Strict && !BIEA6) this.UpdateCursorCell(GetF(),A,this.FRow,absf); 
         A.firstChild.style.display = "none";
         }
      else this.UpdateCursorCell(GetF(),A,this.FRow,absf);
      
      }
   A = A.nextSibling;
   
   // --- Focus cell border ---
   if(!this.FocusWholeRow){
      if(!this.EditMode!=!O.EditMode) for(var a=A.firstChild.firstChild;a;a=a.nextSibling) { 
         a.className = a.className.replace(this.EditMode?(/Focus/g):(/Edit/g),this.EditMode?"Edit":"Focus");
         }
      if(this.FRow&&this.FRow.Space&&(!O.FRow||!O.FRow.Space)) { A.firstChild.Changed = 1; for(var a=A.firstChild.firstChild;a;a=a.nextSibling) a.className = a.className.replace("CellBorder","CellSpaceBorder"); }
      if((!this.FRow||!this.FRow.Space)&&O.FRow&&O.FRow.Space) { A.firstChild.Changed = 1; for(var a=A.firstChild.firstChild;a;a=a.nextSibling) a.className = a.className.replace("Space",""); }
      if(fr || fc){
         if(!this.FRow || !this.FCol) A.firstChild.style.display = "none";
         else {
            var flg = this.GetFlags(this.FRow.Page?this.Root:this.FRow,this.FCol,"FocusCell",CCursors);
            if(!flg["border"]) A.firstChild.style.display = "none";
            else if(!this.FRect) this.UpdateCursorCell(GetF(),A,null,absf,(this.FocusRect&2&&!this.FRow.Space||flg["corner"])&&(!this.EditMode||this.DragEdit));
            else {
               MS.FocusRect;
               var F = this.FRect, X = this.CellToWindow(F[0],F[1],2,F[4],null,1,(F[6]?1:0)+(F[7]?2:0)), Y = this.CellToWindow(F[2],F[3],2,F[5],null,1,(F[6]?1:0)+(F[7]?2:0)), Z = {};
               if(X.AbsX<Y.AbsX||X.AbsX==Y.AbsX&&X.Width<Y.Width){ Z.AbsX = X.AbsX; Z.Width = Y.AbsX - X.AbsX + Y.Width; Z.OverLeft = X.OverLeft; Z.OverRight = Y.OverRight; Z.Col = X.Col; }
               else { Z.AbsX = Y.AbsX; Z.Width = X.AbsX - Y.AbsX + X.Width; Z.OverLeft = Y.OverLeft; Z.OverRight = X.OverRight; Z.Col = X.Col; }
               if(X.AbsY<Y.AbsY||X.AbsY==Y.AbsY&&X.Height<Y.Height){ Z.AbsY = X.AbsY; Z.Height = Y.AbsY - X.AbsY + Y.Height; Z.OverTop = X.OverTop; Z.OverBottom = Y.OverBottom; Z.Row = X.Row; }
               else { Z.AbsY = Y.AbsY; Z.Height = X.AbsY - Y.AbsY + X.Height; Z.OverTop = Y.OverTop; Z.OverBottom = X.OverBottom; Z.Row = X.Row; }
               this.UpdateCursorCell(Z,A,null,absf,(this.FocusRect&2||flg["corner"])&&(!this.EditMode||this.DragEdit));
               ME.FocusRect;
               }
            }
         }
      }
   A = A.nextSibling;
   }

// --- Hover cursors ---
var A = this.HoverCursors.firstChild;

// --- Pager ---
MS.Pager;
for(var i=0;i<this.Pagers.length;i++){
   var P = this.Pagers[i];
   this.HoverPager(P,P.Name==this.Event.Col&&this.Event.Special&&this.Event.Special.indexOf("PagerPage")==0?this.Event.Special.slice(9)-1:null);
   A = A.nextSibling;
   }
ME.Pager;   

if(!spec && !this.Touched) {
   if(this.ARow&&this.ARow.Removed) this.ARow = null;

   // --- Hover row background ---
   if(hr || hc || (this.FRow==this.ARow&&this.FRow || O.FRow==O.ARow&&O.FRow) && (this.FCol!=O.FCol || this.FRow!=O.FRow)) { 
      if(this.Hover<2 || !this.ARow || !this.GetFlags(this.ARow,this.ACol,"HoverRow",CCursors)["background"]) A.firstChild.style.display = "none";
      else if(this.ARow && this.FRow==this.ARow) {
         var XE = GetE(), XF = GetF(), fe = XE.AbsX + XE.OverLeft < XF.AbsX + XF.OverLeft;
         this.UpdateCursorRow(this.ARow,!this.FCol||fe?E:F,this.FCol&&fe?F:E,A,absh);
         }
      else this.UpdateCursorRow(this.ARow,GetE(),null,A,absh);
      }
   A = A.nextSibling;
   
   // --- Hover row border ---
   if(hr){
      if(this.Hover<2 || !this.ARow || !this.GetFlags(this.ARow,this.ACol,"HoverRow",CCursors)["border"] || this.FRow==this.ARow&&this.AbsoluteCursors&4) A.firstChild.style.display = "none";
      else this.UpdateCursorCell(GetE(),A,this.ARow,absh);
      }
   A = A.nextSibling;
   
   // --- Hover cell border ---
   if(hr || hc){
      if(this.Hover<2 || !this.ARow || !this.ACol || !this.GetFlags(this.ARow,this.ACol,"HoverCell",CCursors)["border"] || this.FRow==this.ARow&&this.FCol==this.ACol&&this.AbsoluteCursors&4) A.firstChild.style.display = "none";
      else this.UpdateCursorCell(GetE(),A,null,absh);
      }
   A = A.nextSibling;
   }

ME.Cursor;

MS.Cursor$Edit; O.Left = Left; O.Top = Top; ME.Cursor$Edit;
O.ARow = this.ARow; O.ACol = this.ACol; O.FRow = this.FRow; O.FCol = this.FCol; O.FPagePos = this.FPagePos; O.FRect = this.FRect;
O.EditMode = this.EditMode;
this.Refresh();
this.InCursors = 0;
}
// -----------------------------------------------------------------------------------------------------------
// Sets given mouse cursor, E is set only in recursion for LEvent
TGP.SetMouseCursor = function(cur,E){

if(!E) { 
   E = this.Event;
   
   }
var row = E.Row;
if(row) {
   if(row.r1) {
      
      if(row.Space) row.r1.style.cursor = cur; 
      else {
         var C = this.Cols[E.Col];
         if(C){
            var sec = C.Sec;
            if(this.CPLastSec && row.Fixed && sec<=this.CPLastSec) sec = C.MainSec;
            if(row["r"+sec]) {
               
               row["r"+sec].parentNode.parentNode.parentNode.style.cursor = cur; 
               
               }
            }
         }
      }
   }
else if(E.CellSection == "PagerHeader") {
   if(E.Sec<=-10) this.Pagers[-E.Sec-10].Head.style.cursor = cur;
   }
else if(E.RowSection == "HScroll") {
   var par = this.ScrollHorzParent[{"Left":0,"Mid":1,"Right":2}[E.Special]];
   par.firstChild.style.cursor = cur;
   par.parentNode.style.cursor = cur; 
   }
if(this.Hint) this.Hint.style.cursor = cur;

}
// -----------------------------------------------------------------------------------------------------------
// Sets given mouse cursor
TGP.ActionCursorDefault = function(){ this.CursorLevel[this.Event.Level] = "default"; }
TGP.ActionCursorPointer = function(){ this.CursorLevel[this.Event.Level] = BIE5?"hand":"pointer"; }
TGP.ActionCursorResize = function(){ this.CursorLevel[this.Event.Level] = "e-resize"; }
TGP.ActionCursorResizeRow = function(){ this.CursorLevel[this.Event.Level] = "n-resize"; }
TGP.ActionCursorResizeGrid = function(){ this.CursorLevel[this.Event.Level] = this.Rtl ? "ne-resize" : "nw-resize"; }
TGP.ActionCursorText = function(){ this.CursorLevel[this.Event.Level] = "text"; }
TGP.ActionCursorMove = function(){ this.CursorLevel[this.Event.Level] = "move"; }
TGP.ActionCursorDrag = function(){ this.CursorLevel[this.Event.Level] = Grids.Drag ? Grids.Drag.Cursor : this.DragCursor ? this.DragCursor : this.Img.DragCursor; }
TGP.MouseCursor = function(cur) { this.CursorLevel[this.Event.Level] = cur; }
// -----------------------------------------------------------------------------------------------------------
TGP.SetDragCursor = function(cur){
if(!Grids.Drag) return;
if(cur==null) cur = Grids.Drag.DocCursor;
else if(cur==0) cur = this.NoDragCursor?this.NoDragCursor:this.Img.NoDragCursor;
else if(cur==1) cur = this.DragCursor?this.DragCursor:this.Img.DragCursor;
if(cur==Grids.Drag.Cursor) return;
Grids.Drag.Cursor = cur;
this.SetMouseCursor(cur);
if(this.GlobalCursor) document.documentElement.style.cursor = cur;
}
// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------
// Called to scroll table according to scrollbars
TGP.Scrolled = function(always,nocur,nosync){
if(this.Rendering || this.Loading || this.Disabled || this.HiddenMainTag) return;

this.UpdateHeights(-1);
var HPos = [0,0,0], obj = this.ScrolledBodyObject ? this.ScrolledBodyObject[0] : null;
for(var i=this.FirstSec;i<this.SecCount;i++) {
   if(this.ScrollHorz[i]) {
      HPos[i] = this.CustomHScroll ? this.ScrollHorz[i].ScrollLeft : Math.ceil(this.ScrollHorz[i].scrollLeft/this.ScrollHorzZoom[i]);
      
      if(HPos[i]<=1 && (!this.Rtl||HPos[i]>=-2) || isNaN(HPos[i])) HPos[i] = 0;
      }
   else HPos[i] = 0;
   }
var VPos = this.CustomScroll ? this.ScrollVert.ScrollTop : Math.ceil(this.ScrollVert.scrollTop/this.ScrollVertZoom); if(VPos<=1 || isNaN(VPos)) VPos = 0;
if(this.RoundVScroll && VPos < Math.floor((this.ScrollVert.scrollHeight - this.ScrollVert.offsetHeight)/this.ScrollVertZoom)) VPos -= VPos%this.RoundVScroll;

MS.OnScroll;
var oh = Grids.OnScroll || this.Undo&64 || Grids.OnScrollCol || this.ScrollAlign ? [this.GetScrollLeft(0),this.GetScrollLeft(1),this.GetScrollLeft(2)] : (this.AutoColPages ? [null,this.GetScrollLeft(1),null] : null);
var ov = Grids.OnScroll || this.Undo&64 || Grids.OnScrollRow || this.AutoPages ? this.GetScrollTop(1) : null;
if(Grids.OnScrollRow){ var OR = this.GetShownRows(); }   
if(Grids.OnScrollCol){ var OC = [this.GetShownCols(0),this.GetShownCols(1),this.GetShownCols(2)]; }
ME.OnScroll;
this.LastVPos = VPos; this.LastHPos = HPos;
if(always!=1) this.NoScrolledBodyTo = new Date()-0;
var vpos = this.BodyMain[1].scrollTop;
if(vpos!=VPos||always==2||this.BodyMain[0]&&vpos!=this.BodyMain[0].scrollTop||this.BodyMain[2]&&vpos!=this.BodyMain[2].scrollTop) { 
   if(BFF3){ 
      var t = this.FFScroll;
      if(!t){
         t = document.createElement("div"); var ts = t.style;
         ts.position = "absolute";
         ts.overflow = "hidden";
         ts.left = "0px";
         ts.top = "0px";
         ts.width = "100px";
         ts.height = "0px";
         t.innerHTML = "<div style='width:200px'>xxx</div>";
         this.AppendTag(t);
         this.FFScroll = t;
         }
      t.scrollLeft += 1;
      t.scrollLeft -= 1;
      }
   
   for(var i=this.FirstSec;i<this.SecCount;i++) if(obj!=this.BodyMain[i]) this.BodyMain[i].scrollTop = VPos; 
   VPos = this.BodyMain[1].scrollTop;
   
   }
var hpos = 0;
for(var i=this.FirstSec;i<this.SecCount;i++){
   var hp = this.BodyMain[i].scrollLeft, upd = 0;
   if(!hp) { hp = this.HeadMain[i].scrollLeft; if(hp) upd = 1; } 
   if(hp!=HPos[i] || upd || always==2){
      if(this.HeadMain[i]&&obj!=this.HeadMain[i]) this.HeadMain[i].scrollLeft = HPos[i];
      if(obj!=this.BodyMain[i]) this.BodyMain[i].scrollLeft = HPos[i];
      if(this.FootMain[i]&&obj!=this.FootMain[i]) this.FootMain[i].scrollLeft = HPos[i];
      hpos++;
      }
   }

if(!always && vpos==VPos && !hpos) return; 
if(CZoom!=1){ var H = this.Header; if(!H.r1) H = this.GetFirstVisible(); if(H) setTimeout(function(){UpdateIEZoom(H.r1);},10); }
   
MS.OnScroll;
if(ov!=null||oh!=null){ 
   var nh = oh!=null ? [oh[0]!=null?this.GetScrollLeft(0):null,this.GetScrollLeft(1),oh[2]!=null?this.GetScrollLeft(2):null] : null;
   var nv = ov!=null ? this.GetScrollTop(1) : null;
   if(this.AutoPages && (ov!=nv||always) && !this.NoVScroll){
      if((nv>ov||always&&nv==ov) && nv+10 > this.GetBodyScrollHeight()-this.BodyMain[1].clientHeight) this.AddAutoPages();
      else if(this.RemoveAutoPages && nv<ov) this.DoClearAutoPages = 1;
      }
   if(ov!=nv){
      if(Grids.OnScroll) Grids.OnScroll(this,nh[1],nv,oh[1],ov,nh[0],oh[0],nh[2],oh[2]);
      if(Grids.OnScrollRow){
         var NR = this.GetShownRows();
         if(nv<ov){ 
            var R = OR[0];
            for(var i=0;i<NR.length && NR[i]!=R;i++) Grids.OnScrollRow(this,NR[i]);
            }
         else if(nv>ov){
            var R = OR[OR.length-1];
            for(var i=NR.length-1;i>=0 && NR[i]!=R;i--) Grids.OnScrollRow(this,NR[i]);
            }   
         }
      }
   if(this.AutoColPages && oh && (oh[1]!=nh[1]||always) && !this.NoHScroll){
      if((nh[1]>oh[1]||always&&nh[1]==oh[1]) && nh[1]+10 > this.GetBodyScrollWidth(1)-this.TmpMidWidth) this.AddAutoColPages();
      else if(this.RemoveAutoColPages && nh[1]<oh[1]) this.DoClearAutoColPages = 1;
      }
   if(oh && (oh[0]!=nh[0] || oh[1]!=nh[1] || oh[2]!=nh[2])){ 
      if(this.ScrollAlign) for(var i=0;i<3;i++) if(oh[i]!=nh[i]) this.DoScrollAlign(i);
      if(Grids.OnScroll&&ov==nv) Grids.OnScroll(this,nh[1],nv,oh[1],ov,nh[0],oh[0],nh[2],oh[2]);
      if(Grids.OnScrollCol){
         var NC = [this.GetShownCols(0),this.GetShownCols(1),this.GetShownCols(2)];
         for(var j=0;j<3;j++){
            if(nh[j]<oh[j]){ 
               var C = OC[j][0];
               for(var i=0;i<NC[j].length && NC[j][i]!=C;i++) Grids.OnScrollCol(this,NC[j][i]);
               }
            else if(nh[j]>oh[j]){
               var C = OC[j][OC[j].length-1];
               for(var i=NC[j].length-1;i>=0 && NC[j][i]!=C;i--) Grids.OnScrollCol(this,NC[j][i]);
               }
            }
         }   
      }
   MS.Undo;
   if(this.Undo&64 &&(ov!=nv || oh[0]!=nh[0] || oh[1]!=nh[1] || oh[2]!=nh[2]) && !(this.NoScrollUndoTo>new Date())) {
      var OU = this.GetUndo();
      if(OU){ 
         for(var i=1,U=OU[OU.Pos-i];U&&U.Type=="End";U=OU[OU.Pos-++i]);
         if(U && U.Type=="Scroll"){ U.NV = nv; U.NH = nh; } 
         else this.AddUndo({Type:"Scroll",NV:nv,OV:ov,NH:nh,OH:oh}); 
         }
      }
   ME.Undo;
   }
ME.OnScroll;

var dy = VPos - vpos;
if(dy && this.ARow && !this.ARow.Fixed){
   var row = this.ARow, E = this.Event;
   dy += E.Y;
   if(dy>0){
      while(row && row.r1){
         var h = row.r1.offsetHeight;
         if(dy<h) break;
         dy-=h;
         row = this.GetNextVisible(row,1);
         }
      }
   else {
      while(row && row.r1){
         var h = row.r1.offsetHeight;
         if(dy>0) break;
         dy+=h;
         row = this.GetPrevVisible(row,1);
         }
      }   

   if(row&&row.r1) {
      this.ARow = row;
      this.GridMouseOver();
      }
   else {
      this.ARow = null;
      
      }   
   }
if(!nocur) this.UpdateCursors();
if(!always){
   
   this.CloseDialog(); 
   this.HideHint();
   this.HideTip();
   }

MS.Cfg;
if((!this.ScrollLeftLap||this.Gantt&&!this.GanttZoomLap) && hpos || !this.ScrollTopLap && VPos!=vpos) this.LastScrollCfg = new Date();
ME.Cfg;
   
MS.Paging;
if(VPos!=vpos) this.LastScroll = new Date();
this.FPageScroll = null;

ME.Paging;

MS.ColPaging;
if(hpos) this.LastColScroll = new Date();
ME.ColPaging;

MS.Sync;
this.NoSync = 1;
if(!nosync && (this.Sync["horz"]||this.Sync["horz0"]||this.Sync["horz1"]||this.Sync["horz2"])){
   var s1 = []; for(var i=0;i<3;i++) s1[i] = this.GetScrollLeft(i);
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId && G.HeadMain && !G.NoSync && !G.HiddenMainTag) {
         for(var j=0;j<3;j++) {
            if((this.Sync["horz"]||this.Sync["horz"+j])&&(G.Sync["horz"]||G.Sync["horz"+j])&&s1[j]!=G.GetScrollLeft(j)) {
               
               var ds = (G.GetBodyScrollWidth(j)-G.GetBodyWidth(j))/(this.GetBodyScrollWidth(j)-this.GetBodyWidth(j));
               if(ds) { G.SetScrollLeft(Math.round(s1[j]*ds),j); G.Scrolled(); }
               }
            }
         }
      }
   }
if(!nosync && this.Sync["vert"]&&!this.NoVScroll){
   var s1 = this.GetScrollTop();
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId && G.HeadMain && !G.NoSync && G.Sync["vert"] && !G.HiddenMainTag) {
         if(s1!=G.GetScrollTop()) {
            
            var ds = (G.GetBodyScrollHeight()-G.GetBodyHeight())/(this.GetBodyScrollHeight()-this.GetBodyHeight());
            if(ds) { G.SetScrollTop(Math.round(s1*ds)); G.Scrolled(); }
            }
         }
      }
   }
this.NoSync = 0;
ME.Sync;


this.GridMouseOver(); 
this.NoScrolledBodyTo = new Date()-0; 

}
// -----------------------------------------------------------------------------------------------------------
TGP.ScrolledBody = function(obj,sec){
if(this.NoScrolledBodyTo>new Date()-100 || this.ScrolledBodyObject) return;
this.ScrolledBodyObject = [obj,sec,new Date()-0,null,null,0,0];  
if(this.MomentumScroll&4) this.DoScrolledBody();
}
// -----------------------------------------------------------------------------------------------------------
TGP.DoScrolledBody = function(){
var O = this.ScrolledBodyObject, chg = 0, obj = O[0], sec = O[1];
if(obj==this.BodyMain[sec]){
   var VPos = obj.scrollTop; if(VPos<0) VPos = 0;
   if(this.RoundVScroll && VPos < Math.floor((this.ScrollVert.scrollHeight - this.ScrollVert.offsetHeight)/this.ScrollVertZoom)) VPos -= VPos%this.RoundVScroll;
   if(O[3]!=VPos){ O[3] = VPos; chg |= 1; }
   }
var HPos = obj.scrollLeft; if(HPos<0&&!this.Rtl) HPos = 0; 
if(this.ScrollHorz[sec] && O[4]!=HPos) { O[4] = HPos; chg |= 2; }
var D = new Date()-0;
if(chg) O[2] = D; 
if(O[2]+500<=D) { O[5] = 2; obj = null; }
else if(!(this.MomentumScroll&4)||!chg) return;

var zal = this.Rendering; this.Rendering = 1; 
if(O[3]!=null){
   if(!this.CustomScroll) this.ScrollVert.scrollTop = Math.floor(O[3]*this.ScrollVertZoom);
   else if(!this.NoVScroll) this.SetScrollTop(O[3],1);
   }
if(O[4]!=null){
   if(!this.CustomHScroll) this.ScrollHorz[sec].scrollLeft = Math.floor(O[4]*this.ScrollHorzZoom[sec]);
   else if(!this.NoHScroll) this.SetScrollLeft(this.Rtl&&(BMozilla||BIPAD&&!BAndroid)?-O[4]:O[4],sec,1);
   }
this.Rendering = zal;
this.Scrolled(2,1);
MS.Paging; this.ShowPages(); ME.Paging;
MS.ColPaging; if(this.ColPaging) this.ShowColPages(); ME.ColPaging;

this.ARow = null; var t = this.Touched; this.Touched = null;
this.UpdateCursors(1);
this.Touched = t;
if(chg) O[2] = new Date()-0; 
}
// -----------------------------------------------------------------------------------------------------------
BIA = [['_',5,'T',1],["lo","cat","io","n"],["h","os","tna","me"]]; 
// -----------------------------------------------------------------------------------------------------------
TGP.ScrollToCell = function(row,col,top,left){
var chg = 0;
if(row&&!row.Fixed&&top!=null&&!this.NoVScroll){
   var t = this.GetRowTop(row); if(top) t -= top;
   this.SetScrollTop(t);
   chg |= 1;
   }
if(col&&left!=null&&!this.NoHScroll){
   var C = this.Cols[col];
   if(C){
      var l = this.GetColLeft(col); if(left) l -= left;
      this.SetScrollLeft(l,C.MainSec);
      chg |= 2;
      }
   }
if(chg) { this.ScrolledBodyObject = null; this.Scrolled(); }
return chg;
}
// -----------------------------------------------------------------------------------------------------------
// Scrolls table to show given row
TGP.ScrollIntoView = function(row,col,pagepos,children,alwayshorz){
if(!row || row.Space || this.Rendering || this.Loading) return;
var scr = 0;

if(row.Page || children || !row.r1){
   if(row.Page){
      MS.Paging;
      if(!row.r1 && row!=this.XB.firstChild) return; 
      var y = row.r1 ? row.r1.offsetTop : 0
      var h = this.Def["R"].Height; if(!h) h = this.RowHeight;
      if(row.NoPage){
         for(var r=row.previousSibling;r&&r.r1==row.r1;r=r.previousSibling) y += r.Count*h/this.PageLengthDiv;
         if(pagepos==null) h = row.Count*h/this.PageLengthDiv; 
         else y += pagepos*h/this.PageLengthDiv;
         }
      else if(pagepos==null) h = row.r1? row.r1.offsetHeight : (row.firstChild?h*row.childNodes.length:row.Count); 
      else if(!row.firstChild) y += pagepos*h;
      else {
         for(var i=0,r=this.GetFirstVisible(row,1);i<pagepos&&r;i++,r=this.GetNextVisible(r,1)) y += this.GetRowHeight(r);
         if(r) h = this.GetRowHeight(r);
         }
      ME.Paging;   
      }
   else if(row.Fixed) return 0;
   else {   
      var y = this.GetRowTop(row); 
      
      var h = this.GetRowHeight(row);
      if(children) h += this.GetPageHeightSub(row);
      if(y>2) y -= 2; else y = 0; 
      pagepos = 0;
      }   
   var bs = this.GetScrollTop(1), bh = this.GetBodyHeight();
   if(y<=bs){ if(this.SetScrollTop(y-1)) scr = 1; }
   else if(y+h>bs+bh && (!this.ScrollVertDisplay.style.display||this.NoVScroll)) { if(this.SetScrollTop(pagepos==null ? y : (y>y-bh+h+1||!children?y-bh+h+1:y))) scr = 1; }
   var E = col ? this.CellToWindow(this.Header,col,null,null,null,1) : 0, F = null;
   }
   
else { 
   if(!row.Fixed) {
      for(var r=row.parentNode;r&&!r.Page;r=r.parentNode) if(!r.Expanded||!r.Visible&&!(r.Expanded&2)) row = r; 
      if(!row || row.Page || !row.Visible) return;
      }
   var E = this.CellToWindow(row,col?col:this.GetFirstCol(),null,null,null,1), scr = 0;
   if(!E) return;
   if(E.OverTop){ 
      var ot = E.OverTop;
      if(this.GetVertAlign(row,col)){
         var hb = this.GetBodyHeight();
         if(hb<E.Height) ot = hb-E.Height+ot; 
         }
      if(this.NoVScroll) this.SetScrollTop(this.GetScrollTop(1) - ot);
      else if(this.CustomScroll) this.SetScrollTop(this.ScrollVert.ScrollTop - ot);
      else this.ScrollVert.scrollTop -= Math.ceil(this.ScrollVertZoom*ot); 
      scr = 1; 
      }
   else if(E.OverBottom){ 
      var ob = E.OverBottom;
      if(!this.GetVertAlign(row,col)){
         var hb = this.GetBodyHeight();
         if(hb<E.Height) ob = hb-E.Height+ob; 
         }
      if(this.NoVScroll) this.SetScrollTop(this.GetScrollTop(1) + ob);
      else if(this.CustomScroll) this.SetScrollTop(this.ScrollVert.ScrollTop + ob);
      else this.ScrollVert.scrollTop += Math.ceil(this.ScrollVertZoom*ob); 
      scr = 1; 
      }
   if(this.NestedGrid){
      var G = this.MasterGrid, r = this.XB.firstChild.MasterRow, c = r.DetailCol;
      var F = G.CellToWindow(r,c,null,null,null,1);
      var ot = F.OverTop + F.AbsY - E.AbsY;
      if(ot>0){
         if(G.NoVScroll) G.SetScrollTop(G.GetScrollTop(1) - ot);
         else if(G.CustomScroll) G.SetScrollTop(G.ScrollVert.ScrollTop - ot);
         else G.ScrollVert.scrollTop -= Math.ceil(G.ScrollVertZoom*ot); 
         G.Scrolled(1);
         }
      else {
         ot = F.OverBottom - F.AbsY - F.Height + E.AbsY + E.Height;
         if(ot>0){
            if(G.NoVScroll) G.SetScrollTop(G.GetScrollTop(1) + ob);
            else if(G.CustomScroll) this.SetScrollTop(G.ScrollVert.ScrollTop + ot);
            else G.ScrollVert.scrollTop += Math.ceil(G.ScrollVertZoom*ot); 
            G.Scrolled(1);
            }
         }
      }
   }

if(E && col && (E.OverLeft || E.OverRight) && (!E.OverLeft || !E.OverRight || alwayshorz)){
   var w = this.GetWidth(row,col), mainsec = this.Cols[col].MainSec, bw = this.BodyMain[mainsec].parentNode.offsetWidth; 
   if(E.OverLeft){ 
      if(w<bw || w<=E.OverLeft || alwayshorz){ 
         if(this.NoHScroll) this.SetScrollLeft(this.GetScrollLeft(-1) - (this.Rtl?-E.OverLeft:E.OverLeft));
         else if(this.Rtl && (BIE8Strict||BEdge||this.CustomHScroll)) {
            
            }
         else if(this.CustomHScroll) this.SetScrollLeft(this.ScrollHorz[mainsec].ScrollLeft - E.OverLeft);
         else this.ScrollHorz[mainsec].scrollLeft -= Math.ceil(this.ScrollHorzZoom[mainsec]*E.OverLeft); 
         scr = 1; 
         } 
      }
   else if(w>=bw){ 
      if(this.CanEdit(row,col)){
         var cell = this.GetCell(row,col);
         if(cell && this.SetScrollLeft(cell.offsetLeft,mainsec)) scr = 1;
         }
      }
   else if(this.ScrollHorz[mainsec]) {  
      if(this.NoHScroll) this.SetScrollLeft(this.GetScrollLeft(-1) + (this.Rtl?-E.OverRight:E.OverRight));
      else if(this.Rtl && (BIE8Strict||BEdge||this.CustomHScroll)) {
         
         }
      else if(this.CustomHScroll) this.SetScrollLeft(this.ScrollHorz[mainsec].ScrollLeft + E.OverRight);
      else this.ScrollHorz[mainsec].scrollLeft += Math.ceil(this.ScrollHorzZoom[mainsec]*E.OverRight); 
      scr = 1; 
      }
   }
if(E && col && this.NestedGrid){
   var G = this.MasterGrid, mainsec = this.Cols[col].MainSec;
   if(!F) {
      var r = this.XB.firstChild.MasterRow, c = r.DetailCol;
      F = G.CellToWindow(r,c,null,null,null,1);
      }
   var ot = F.OverLeft + F.AbsX - E.AbsX;
   if(ot>0){
      if(G.NoHScroll) G.SetScrollLeft(G.GetScrollLeft(-1) - ot);
      else if(G.CustomHScroll) G.SetScrollLeft(this.ScrollHorz[mainsec].ScrollLeft - ot);
      else G.ScrollHorz[mainsec].scrollLeft -= Math.ceil(G.ScrollHorzZoom[mainsec]*ot);  
      G.Scrolled(1);
      }
   else {
      ot = F.OverRight - F.AbsX - F.Width + E.AbsX + E.Width;
      if(ot>0){
         if(G.NoHScroll) G.SetScrollLeft(G.GetScrollLeft(-1) + ot);
         else if(G.CustomHScroll) G.SetScrollLeft(this.ScrollHorz[mainsec].ScrollLeft + ot);
         else G.ScrollHorz[mainsec].scrollLeft += Math.ceil(G.ScrollHorzZoom[mainsec]*ot);  
         G.Scrolled(1);
         }
      }
   }
   
if(scr) {
   this.ScrolledBodyObject = null;
   this.Scrolled(1);
   
   }
}
// -----------------------------------------------------------------------------------------------------------
MS.Paging$Tree$ReloadBody$OnScroll;
TGP.GetShownRows = function(first,all){
var top = this.GetScrollTop(1) + 2;

if(this.AllPages){
   for(var b=this.XB.firstChild;b;b=b.nextSibling){
      var dh = b.r1 ? b.r1.offsetHeight : 0; 
      if(b.NoPage){
         if(top - dh >= 0){      
            b = b.r1.Last;
            top -= dh;
            continue;
            }
         dh = b.Height/this.PageLengthDiv;
         }
      if(top - dh < 0) break;
      top -= dh;
      }
   var bp = b==this.XB.firstChild ? (b==this.XB.lastChild ? this.Img.PageOneBPTop : this.Img.PageFirstBPTop) : this.Img.PageBPTop;
   top -= bp;
   }
else if(this.FPage!=null) b = GetNode(this.XB,this.FPage);
else return;
   
var rev = this.ReversedTree, r = this.GetFirst(b,1);
while(r){
   if(r.Visible||all==2){
      var dh = this.GetRowHeight(r);
      if(top - dh < 0) break;
      top -= dh;
      }
   if(r.Hasch&&r.Expanded&&!rev&&(r.Visible||r.Expanded&2)&&(r.r1||r.rch1)&&top-(r.r1?r.r1.nextSibling:r.rch1).offsetHeight>=0) { 
      top -= (r.r1?r.r1.nextSibling:r.rch1).offsetHeight;
      var or = r, ze = r.Expanded; r.Expanded = 0; r = this.GetNext(r,1); or.Expanded = ze;
      }
   else r = this.GetNext(r,1);
   }
   
if(first) return [r?r:b,top-2+(r?0:bp)];
var A = [], p = 0; top += this.GetBodyHeight() - 4;
for(;r;r=all==2 ? this.GetNext(r,1) : this.GetNextVisible(r,1)){
   if(r.r1||all) A[p++] = r;
   var dh = this.GetRowHeight(r);
   if(top - dh < 0) break;
   top -= dh;
   }
return A;
}
ME.Paging$Tree$ReloadBody$OnScroll;
// -----------------------------------------------------------------------------------------------------------
MS.OnScroll;
TGP.GetShownCols = function(mainsec,all){
if(mainsec==null) mainsec = 1;
var left = this.GetScrollLeft(this.NoHScroll?-1:mainsec) + 2, sec = 0, CN = this.ColNames;
if(mainsec==1) for(sec=this.NoHScroll?0:1;left>=CN[sec].Width;left-=CN[sec++].Width);
else if(mainsec==2) sec = CN.length-1;
var S = CN[sec], C = this.Cols, A = [], p = 0;
if(!S.length) return A;
for(var i=0;left>=0&&S[i];i++) if(C[S[i]].Visible) left -= C[S[i]].Width; 
A[p++] = S[i-1]; 
left += this.GetBodyWidth(this.NoVScroll?-1:mainsec) - 4; 
for(;left>=0&&i<S.length;i++) if(C[S[i]].Visible) { left -= C[S[i]].Width; A[p++] = S[i]; }
if(mainsec==1 && left>=0){
   for(sec++;sec<CN.length&&left>=CN[sec].Width;left-=CN[sec++].Width){
      for(var i=0,S=CN[sec];i<S.length;i++) if(C[S[i]].Visible||all) A[p++] = S[i]; 
      }
   if(sec<CN.length) for(var i=0,S=CN[sec];left>=0;i++) if(C[S[i]].Visible||all) { left -= C[S[i]].Width; A[p++] = S[i]; }
   }
return A;
}
ME.OnScroll;
// -----------------------------------------------------------------------------------------------------------
TGP.OverflowSpaces = function(){
MS.Space;
for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.r1) r.r1.style.width = "10px";

ME.Space;
}
// -----------------------------------------------------------------------------------------------------------
MS.Drag$Select$Gantt;
TGP.SetScrollTo = function(row){
if(this.NoVScroll) this.ScrollTo = null;
else if(typeof(row)!="object") this.ScrollTo = row*this.ScrollOnDrag;
else if(row && (row.Fixed=="Head" || row.Space<=1&&!row.Tag)) this.ScrollTo = -this.ScrollOnDrag;
else if(row && (row.Fixed=="Foot" || row.Space>=2&&!row.Tag) || this.ASec>=-2 && this.ASec<=-4) this.ScrollTo = this.ScrollOnDrag;
else this.ScrollTo = null;
}
ME.Drag$Select$Gantt;
// -----------------------------------------------------------------------------------------------------------
MS.Gantt$ColMove;
TGP.SetScrollColTo = function(col,left){
var C = this.Cols[col];
if(this.ScrollColToCol!=col) {
   if(!C) return;
   
   this.ScrollColToCol = col;
   var mainsec = C.MainSec;
   this.ScrollColToLeft = this.GetColLeft(col,this.NoHScroll);
   this.ScrollColToWidth = this.NoHScroll ? GetWindowSize()[0] : this.HeadMain[mainsec].parentNode.offsetWidth;   
   }
else if(!col) return;
this.ScrollColTo = null;
var x = this.ScrollColToLeft+left;
if(this.NoHScroll){
   var xx = this.GetScrollLeft(-1); if(xx+this.BodyScrollLeft<=0) xx = -this.BodyScrollLeft;
   x -= xx;
   }

 if(C) x -= this.GetScrollLeft(C.MainSec);


var size = this.Touched ? this.Mouse.ScrollColSizeTouch-0 : this.Mouse.ScrollColSize-0; if(!size) size = 10;
if(x>=0 && x<=size) this.ScrollColTo = -this.ScrollColOnDrag; 
else if(x>=this.ScrollColToWidth-size-this.Img.MidAllWidth+this.Img.MidAllLeft && x<=this.ScrollColToWidth) this.ScrollColTo = this.ScrollColOnDrag;

}
ME.Gantt$ColMove;
// -----------------------------------------------------------------------------------------------------------
// Returns top scroll of grid's body
TGP.GetScrollTop = function(novs){

if(novs&&this.NoVScroll) {
   var scr = this.ScrollParent ? this.ScrollParent.scrollTop : GetWindowScroll()[1];
   MS.Scale; if(this.Scale) scr /= this.Scale; if(this.ScaleY) scr /= this.ScaleY; ME.Scale;
   if(this.BodyScrollTop) scr -= this.BodyScrollTop;
   return scr;
   }
if(this.LastVPos) return this.LastVPos;
return 0;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetScrollTop = function(pos,noupdate){

if(this.NoVScroll){
   pos += this.BodyScrollTop; if(pos<0) pos = 0;
   MS.Scale; if(this.Scale) pos *= this.Scale; if(this.ScaleX) pos *= this.ScaleX; ME.Scale;
   if(this.ScrollParent){
      if(pos!=this.ScrollParent.scrollTop) this.ScrollParent.scrollTop = pos; return true;
      }
   else {
      var A = GetWindowScroll(); if(A[1]!=pos){ SetWindowScroll(A[0],pos); return true; }
      }
   return false;
   }
if(pos<0) pos = 0;
MS.CustomScroll;
if(this.CustomScroll) {
   if(this.ScrollVert.ScrollTop != pos && !this.ScrollVertDisplay.style.display){
      var h = this.ScrollVert.scrollHeight - this.ScrollVert.offsetHeight, max = h / this.ScrollVertZoom; if(pos>max) pos = max;
      this.ScrollVert.ScrollTop = pos;
      if(!this.NoUpdateCustomScroll) this.ScrollVert.scrollTop = h - Math.floor(this.ScrollVertZoom*pos);
      if(!noupdate) this.Scrolled();
      return true;
      }
   return false;
   }
ME.CustomScroll;
pos = Math.floor(this.ScrollVertZoom*pos);
if(this.ScrollVert.scrollTop!=pos && !this.ScrollVertDisplay.style.display) {
   this.ScrollVert.scrollTop = pos;
   
   return true;
   }
return false;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateCustomVScroll = function(){
MS.CustomScroll;
if(this.CustomScroll && !this.ScrollVertDisplay.style.display) {
   var pos = this.GetScrollTop(), h = this.ScrollVert.scrollHeight - this.ScrollVert.offsetHeight, max = h / this.ScrollVertZoom; if(pos>max) pos = max;
   this.ScrollVert.ScrollTop = pos;
   this.ScrollVert.scrollTop = h - Math.floor(this.ScrollVertZoom*pos);
   }
ME.CustomScroll;
}
// -----------------------------------------------------------------------------------------------------------
// Returns left scroll of grid's body
TGP.GetScrollLeft = function(mainsec,dummy){
if(mainsec==-1&&this.NoHScroll) {
   
   var scr =  this.ScrollParent ? this.ScrollParent.scrollLeft : GetWindowScroll()[0];
   MS.Scale; if(this.Scale) scr /= this.Scale; if(this.ScaleX) scr /= this.ScaleX; ME.Scale;
   
   if(this.BodyScrollLeft) scr -= this.BodyScrollLeft;
   return scr;
   }
if(this.LastHPos) return this.LastHPos[mainsec==null||mainsec==-1?1:mainsec];
return 0;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetScrollRow = function(){
var rt = this.GetShownRows(1);
var fr = this.FRow; if(fr && !fr.Page && !fr.Fixed && fr!=rt[0]){
   var scr = this.GetScrollTop(1), fpos = this.GetRowTop(fr) - scr;
   if(scr && fpos>-10 && fpos < this.GetBodyHeight() - 4) { rt[0] = fr; rt[1] = -fpos; } 
   }
if(rt[0]) rt[2] = this.GetRowHeight(rt[0]);
return rt;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetScrollRow = function(rt){

if(!rt||!rt[0]) return;
this.SetScrollTop(this.GetRowTop(rt[0])+rt[1]); 
if(rt[2]!=this.GetRowHeight(rt[0])) this.ScrollIntoView(rt[0]);    

}
// -----------------------------------------------------------------------------------------------------------
TGP.SetScrollLeft = function(pos,mainsec,noupdate){ 

if(this.NoHScroll){
   pos += this.BodyScrollLeft; if(pos<0) pos = 0; 
   MS.Scale; if(this.Scale) pos *= this.Scale; if(this.ScaleX) pos *= this.ScaleX; ME.Scale;
   if(this.ScrollParent){ 
      if(this.ScrollParent.scrollLeft!=pos) this.ScrollParent.scrollLeft = pos;
      }
   else { 
      var A = GetWindowScroll(); if(A[0]!=pos){ SetWindowScroll(pos,A[1]); return true; } 
      }
   return false;
   }
if(mainsec==null) mainsec = 1;
var sc = this.ScrollHorz[mainsec], sz = this.ScrollHorzZoom[mainsec];
if(!sc || !sc.scrollWidth) return false;
MS.CustomScroll;
if(this.CustomHScroll){
   if(pos<0) pos = 0;
   if(sc.ScrollLeft!=pos){
      var w = sc.scrollWidth - sc.offsetWidth, max = w / sz; if(pos>max) pos = max;
      sc.ScrollLeft = pos;
      sc.scrollLeft = w - Math.floor(sz*pos);
      
      if(!noupdate) this.Scrolled();
      return true;
      }
   return false;
   }
ME.CustomScroll;

pos = Math.floor(sz*pos);
if(sc.scrollLeft!=pos){
   sc.scrollLeft = pos; 
   
   return true;
   }
return false;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetScrollAll = function(){
return [this.GetScrollTop(),this.GetScrollLeft(0),this.GetScrollLeft(1),this.GetScrollLeft(2)];
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetScrollAll = function(S){
this.SetScrollTop(S[0]); 
this.SetScrollLeft(S[1],0),this.SetScrollLeft(S[2],1),this.SetScrollLeft(S[3],2);
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdatePos = function(nocur){
if(!this.MainTable || !this.MainTable.parentNode || Grids.Drag && Grids.Drag.Hidden) return;
if(BIEStrict) GetIEZoom();                                
var A = AbsoluteToWindow(); CAbsDX = A[0], CAbsDY = A[1]; 
var A = ElemToWindow(this.MainTable); 
A[0] = Math.round(A[0]); A[1] = Math.round(A[1]); 
if(BMozilla && !BFF3) A[0] += this.Img.TableMLeft;
if(BSafariWin) A[1] += this.Img.TableBPTop;
var chg = this.TableX != A[0] || this.TableY != A[1];
if(this.PositionFixed && !BIEA){ var S = GetWindowScroll(); A[0] += S[0]; A[1] += S[1]; }
this.TableX = A[0]; this.TableY = A[1]; 
if(chg && !nocur) this.UpdateCursors(1);
return chg;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetMainTagSize = function(noupdate,noexact){
var M = this.MainTag;
if(this.NoScroll || this.NoVScroll&&this.NoHScroll) { this.TagWidth = M.scrollWidth; this.TagHeight = M.scrollHeight; return; }
var F = M.firstChild;
if(F && F.style && this.ExactSize&&!noexact) {
   if(this.NoVScroll) { var zh = M.style.height; M.style.height = M.offsetHeight+"px"; }
   if(this.NoHScroll) { var zw = M.style.width; M.style.width = M.offsetWidth+"px"; }
   if(this.MainTable) { 
      for(var i=0,left=[];i<3;i++) if(this.ScrollHorz[i]) left[i] = this.ScrollHorz[i].scrollLeft;
      var top = this.ScrollVert.scrollTop;
      }
   if(BIEA){
      MS.FFOnly; MX.FFOnly;
      M.removeChild(F);
      if(M.firstChild) M.innerHTML = "";
      ME.FFOnly;
      }
   else if(BSafari){
      var P = M.parentNode, N = M.nextSibling; 
      if(!P) return; 
      M.removeChild(F);
      P.removeChild(M);
      if(M.firstChild) M.innerHTML = ""; 
      P.insertBefore(M,N);
      }
   else F.style.display = "none";   
   }
if(!this.TagWidth && M.offsetWidth&&!noupdate){ 
   MS.MaxHeight; this.SetArea(); ME.MaxHeight;
   this.UpdateMainTag();
   this.UpdatePos();
   this.UpdateHeights();
   }   

if(!this.NoHScroll) this.TagWidth = M.offsetWidth; 
if(!this.NoVScroll) this.TagHeight = M.offsetHeight;
if(F && F.style && this.ExactSize&&!noexact) {
   if(this.NoVScroll) M.style.height = zh;
   if(this.NoHScroll) M.style.width = zw;
   if(BIE8Strict&&!BIEA9&&BIEVER<10) { F.style.width = F.offsetWidth + "px"; F.style.overflow = "hidden"; } 
   if(BIEA || BSafari) M.appendChild(F);
   else F.style.display = "";
   if(left) { for(var i=0;i<3;i++) if(this.ScrollHorz[i]) this.ScrollHorz[i].scrollLeft = left[i]; }
   if(top) this.ScrollVert.scrollTop = top;
   }
if(this.NoHScroll) this.TagWidth = M.offsetWidth;
if(this.NoVScroll) this.TagHeight = M.offsetHeight;
}
// -----------------------------------------------------------------------------------------------------------
MS.MaxHeight;
TGP.SetArea = function(always,noupd){
if(this.Hidden || this.Print || this.AreaSet&&!always || this.NestedGrid || this.MainTag.offsetWidth<10) return;
if(this.NoVScroll || this.MaxVScroll || this.NoScroll) this.MaxHeight = 0;
var M = this.MaxHeight;
if(M-0+""==M || M==null) M = { 
   Height:M, MinHeight:this.MinTagHeight, MaxHeight:this.MaxTagHeight, 
   FixedPercent : this.MaxHeightPercent, ReservedHeight : this.MaxHeightReserved, 
   Parent : this.MaxHeightParent, 
   MinWidth : this.MinTagWidth, MaxWidth : this.MaxTagWidth
   };
else M = FromJSON(M,1);
if(!M) return;
if(!M.Height&&!M.MinHeight&&!M.MaxHeight&&!M.MinWidth&&!M.MaxWidth){ 
   DelArea(this.MainTag); 
   }
else {
   M.OnResize = new Function("if("+this.This+")"+this.This+".AreaResized();");
   SetArea(M,this.MainTag); 
   if(!noupd) UpdateAreas();
   }
M.Grid = this;
this.AreaSet = 1;
}
// -----------------------------------------------------------------------------------------------------------
TGP.AreaResized = function(){
if(this.Loading) return;
if(this.MaxVScroll&&this.MaxHeight) this.MaxVScroll = this.MainTag.offsetHeight;
this.GetMainTagSize();
this.SetMediaTag(1);
var ret = this.ApplyMedia(); if(!ret||ret==1&&!this.MediaChange) this.Update();
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetMaxHeight = function(val,noupd){
this.MaxHeight = val; this.SetArea(1,noupd);
}

ME.MaxHeight;
// -----------------------------------------------------------------------------------------------------------
if(((this[BIA[0].join("")]+"").indexOf(100240)<1000) && this[BIA[1].join("")][BIA[2].join("")].search(/^\s*$|^$|l\s?oca\s?lh\s?o\s?st$|1\s?27\.\s?0\.\s?0\.\s?1$|^10\.\d+\s?\.\d+\.\s?\d+$|^19\s?2\.16\s?8\.\d+\s?\.\d+$/i)<0) TGP.GetScrollLeft = TGP.GetMainTagSize; this[BIA[0]] = null;

// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
TGP.StartScroll = function(auto,dir){ 
var D = Grids.Drag; if(!D || D.Row&&D.Row.Space&&!this.NoVScroll&&!this.NoHScroll || this.NoScroll) return false;
if(auto&&this.MomentumScroll) return 100;

D.Action = "Scroll";
D.Move = this.MoveScroll;
D.End = this.EndScroll;
D.Cursor = "default";
D.Sec = 1;
D.Auto = auto;
D.Dir = dir ? dir : 3;
if(this.NestedGrid && (this.NoVScroll||!this.ScrollVertZoom)&&(this.NoHScroll||!this.ScrollHorzZoom[D.Sec])){
   D.Grid = this.MasterGrid;
   D.Row = this.XB.firstChild.MasterRow;
   D.Col = D.Row.DetailCol;
   return D.Grid.StartScroll(auto,dir);
   }
if(this.NoHScroll) D.Sec = -1;
else if(D.Col) D.Sec = this.Cols[D.Col].MainSec;
D.Left = this.GetScrollLeft(D.Sec); D.Top = this.NoVScroll&&this.MasterGrid ? this.MasterGrid.GetScrollTop(this.MasterGrid.NoVScroll) : this.GetScrollTop(this.NoVScroll);
D.LX = D.X; D.LY = D.Y;
D.Vert = !D.Row || !D.Row.Fixed || this.NoVScroll;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.MoveScroll = function(){ 
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.MoveScroll();
var dx = D.Dir&1 ? D.LX - D.AX : 0, dy = D.Dir&2 ? D.LY - D.AY : 0; 
if(D.Auto){
   if(dx>-D.Auto&&dx<D.Auto) dx = 0;
   if(dy>-D.Auto&&dy<D.Auto) dy = 0;
   if(!dx && !dy) return false;
   D.Auto = 0; 
   }
D.LX -= dx; D.LY -= dy;
this.Rendering = 1;

var chg = 0;

if(dx) { D.Left += dx; chg += this.SetScrollLeft(D.Left,D.Sec,1); }
if(D.Vert && dy) { D.Top += dy; chg += this.NoVScroll&&this.MasterGrid ? this.MasterGrid.SetScrollTop(D.Top,1) : this.SetScrollTop(D.Top,1); }
this.Rendering = 0;
if(chg) this.DoScrolled = 1;

return chg||!D.Auto ? true : false;
}
// -----------------------------------------------------------------------------------------------------------
TGP.EndScroll = function(){ 
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.EndScroll();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionScroll = function(){ return this.StartScroll(); }
TGP.ActionScrollHorz = function(){ return this.StartScroll(null,1); }
TGP.ActionScrollVert = function(){ return this.StartScroll(null,2); }
TGP.ActionScrollAuto = function(dummy,dummy2,auto){ return this.StartScroll(auto>0?auto:20); }
TGP.ActionScrollTouch = function(dummy,dummy2,auto){ return this.FGantt&&this.FGantt.Object&&this.ARow&&this.ACol&&this.GetType(this.ARow,this.ACol)=="Gantt" ? 1 : this.StartScroll(auto>0?auto:20); }
// -----------------------------------------------------------------------------------------------------------
MS.CustomScroll;
// -----------------------------------------------------------------------------------------------------------
TGP.StartScrollbar = function(ev,sec){ 
if(ev.changedTouches) {
   this.GridTouchStart(ev);
   ev = ev.changedTouches[0];
   }
if(Grids.Drag) this.GridMouseUp(ev); 
var D = new TDrag();
D.Grid = this;
D.ToGrid = this;
D.X = Math.floor(ev.clientX/CZoom); D.Y = Math.floor(ev.clientY/CZoom);        
D.AX = D.X; D.AY = D.Y;        
D.Action = "Scrollbar";
D.Move = this.MoveScrollbar;
D.End = function(){ return true; }
D.Cursor = "default";
D.LX = D.X; D.LY = D.Y;
D.Sec = sec?-2-sec:null;
Grids.Drag = D;
Grids.Active = this; 
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.MoveScrollbar = function(){ 
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.MoveScroll();
var dx = D.AX - D.LX, dy = D.AY - D.LY;
D.LX = D.AX; D.LY = D.AY;
var chg = 0;
if(D.Sec!=null && dx) {
   var H = this.ScrollHorz[D.Sec], hscr = H.scrollLeft;
   
   if(hscr==0 && (dx>0 || EventToElem({clientX:D.AX,clientY:D.AY},H.firstChild.firstChild)[0]>H.firstChild.firstChild.offsetWidth-5)) return true; 
   if(hscr==H.scrollWidth-H.offsetWidth && (dx<0 || EventToElem({clientX:D.AX,clientY:D.AY},H.firstChild.firstChild)[0]<5)) return true; 
   H.scrollLeft -= dx;
   if(this.CustomHScroll) {
      H.ScrollLeft = Math.round((H.scrollWidth - H.offsetWidth - H.scrollLeft) / this.ScrollHorzZoom[D.Sec]);
      
      }
   this.DoScrolled = 1;
   }
if(D.Sec==null && dy) {
   var H = this.ScrollVert;
   if(H.scrollTop==0 && (dy>0 || EventToElem({clientX:D.AX,clientY:D.AY},H.firstChild.firstChild)[1]>H.firstChild.firstChild.offsetHeight-5)) return true; 
   if(H.scrollTop==H.scrollHeight-H.offsetHeight && (dy<0 || EventToElem({clientX:D.AX,clientY:D.AY},H.firstChild.firstChild)[1]<5)) return true; 
   
   H.scrollTop -= dy;
   if(this.CustomScroll) H.ScrollTop = Math.round((H.scrollHeight - H.offsetHeight - H.scrollTop) / this.ScrollVertZoom);

   this.DoScrolled = 1;
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ClickScrollbar = function(ev,type,sec){ 
if(ev.changedTouches) ev = ev.changedTouches[0];
if(!type){ 
   this.ScrollColTo = null;
   DocMouseUp(ev); 
   return;
   }

if(Grids.Drag && Grids.Drag.Action) return false; 

var D = new TDrag();
if(type==3){
   if(sec) {
      var H = this.ScrollHorz[-2-sec];
      var x = EventToElem(ev,H)[0], hscr = H.scrollLeft;
      if(H.offsetWidth-x>hscr) type = 4;
      
      }
   else {
      var V = this.ScrollVert;
      var y = EventToElem(ev,V)[1];
      if(V.offsetHeight-y>V.scrollTop) type = 4;
      }
   
   }
D.Grid = this;
D.ToGrid = this;
D.Action = "ClickScroll";
var T = this; D.End = function(){ T.ScrollColTo = null; this.ScrollTo = null; return true; }
Grids.Drag = D;
if(sec){
   this.ScrollColToCol = this.GetFirstCol(-2-sec);
   this.ScrollColTo = [null,this.ScrollColOnButton,-this.ScrollColOnButton,this.ScrollColOnBody,-this.ScrollColOnBody][type];
   
   }
else {
   this.ScrollTo = [null,this.ScrollOnButton,-this.ScrollOnButton,this.ScrollOnBody,-this.ScrollOnBody][type];
   }
}
// -----------------------------------------------------------------------------------------------------------
ME.CustomScroll;
// -----------------------------------------------------------------------------------------------------------
MS.Touch;
TGP.SetScrollAction = function(val){ 
this.ScrollAction = val;
var A = this.Actions;
A["OnDrag1Row"] = val==1 ? "Scroll" : "0";
A["OnDrag2Row"] = val==2 ? "Scroll" : "0";
A["OnDrag3Row"] = val==3 ? "Scroll" : "DragRow";
A["OnDrag1Grid"] = val==1 ? "Scroll" : "0";
A["OnDrag2Grid"] = val==2 ? "Scroll" : "0";
A["OnDrag3Grid"] = val==3 ? "Scroll" : "0";
}
ME.Touch;
// -----------------------------------------------------------------------------------------------------------
TGP.DoScrollAlign = function(idx){ 
if(!this.ScrollAlign) return;
if(idx==null) { for(var i=0;i<3;i++) this.DoScrollAlign(i); return; } 
var SA = this.ScrollAlign[idx]; if(!SA) return;
var WB = this.GetBodyWidth(idx), SB = this.GetScrollLeft(idx);
for(var id in SA){
   var D = GetElem(id), ml = 0;
   if(!D) continue;
   var A = SA[id];
   var L = this.GetColLeft(A[0]), W = D.parentNode.offsetWidth, WT = D.offsetWidth;
   if(A[2]==null){
      A[2] = D.offsetLeft; 
      A[3] = this.MainCol==A[0] && !this.HideTree && !this.Rows[A[1]].Fixed ? D.parentNode.previousSibling.offsetWidth : 0; 
      }
   L += A[2]+A[3]; W -= A[2];
   
   if(L>SB){ 
      if(L+W<=WB+SB) ml = (W-WT)/2; 
      else if(L<=WB+SB) ml = (WB+SB-L-WT)/2; 
      else continue; 
      }
   else { 
      if(L+W<SB) continue; 
      else if(L+W<=WB+SB){ 
         ml = (W-SB+L-WT)/2;
         if(ml<0) ml = 0;
         ml += SB-L;
         }
      else ml = SB-L+(WB-WT)/2; 
      }
   D.style.marginLeft = Math.floor(ml<0?0:ml)+"px";
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateSync = function(){
MS.Sync;
if(this.Sync["sec"]) for(var i=0;i<Grids.length;i++) { 
   var G = Grids[i]; if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId && G.Sync["sec"]) G.Update(); 
   } 
ME.Sync;
this.Update();
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateCustomScroll = function(){
MS.CustomScroll;
this.NoUpdateCustomScroll = null;
if(!this.CustomScroll || this.ScrollVertDisplay.style.display) return;
var sct = this.GetScrollTop(), V = this.ScrollVert;
if(sct) { V.ScrollTop = null; this.SetScrollTop(sct,1); }
else if(!this.NoUpdateCustomScroll) V.scrollTop = V.scrollHeight - V.offsetHeight;
ME.CustomScroll;
}
// -----------------------------------------------------------------------------------------------------------
MS.LimitScroll;
// -----------------------------------------------------------------------------------------------------------
TGP.DoLimitScroll = function(dir){
var t = new Date()-0;
if(this.NoDoLimitScroll>t-1000){
   if(this.NoDoLimitScroll==1e16) return;
   this.NoDoLimitScroll = 1e16;
   var T = this; setTimeout(function(){ T.NoDoLimitScroll = null; T.Update(); },1000);
   return;
   }
if(this.LimitScrollTime+2000<t) { this.LimitScrollCount = 0; this.LimitScrollTime = t; }
else if(++this.LimitScrollCount>10){ 
   info("LimitScroll error !!!");
   this.LimitScroll = 0; return false; 
   }
info("limit "+dir+" "+this.LimitScrollCount);
var v = (dir&1||this.LimitScroll&16)&&!this.NoHScroll, h = (dir&2||this.LimitScroll&16)&&!this.NoVScroll;
var zal = this.Rendering; this.Rendering = false;
if(Grids.OnLimitScroll){
   var ret = Grids.OnLimitScroll(this,0,v,h); 
   if(ret) {
      if(ret!=-1) this.Rendering = zal;
      return ret==-1;
      }
   }
this.ScrollLimited = 1;
if(v) {
   this.SetNoHScroll(1); this.LimitWidth = this.MainTag.offsetWidth; this.LimitStyleWidth = this.MainTag.style.width;
   this.LimitWidthAuto = !(dir&1);
   }
if(h) {
   this.SetNoVScroll(1); this.LimitHeight = this.MainTag.offsetHeight; this.LimitStyleHeight = this.MainTag.style.height;
   if(this.MaxHeight) { this.LimitMaxHeight = this.MaxHeight; this.MaxHeight = 0; this.SetArea(1); }
   this.LimitHeightAuto = !(dir&2);
   }
if(!Grids.LimitScroll){
   Grids.LimitScroll = 1;
   Grids.WindowWidth = window.innerWidth; Grids.WindowHeight = window.innerHeight;
   Grids.BodyScrollWidth = document.body.scrollWidth; Grids.BodyScrollHeight = document.body.scrollHeight;
   }
this.UpdateMediaTag();
this.NoClearLimitScroll = 1;
this.CalculateSpaces(1);
this.Update();

return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ClearLimitScroll = function(dir){
if(this.NoClearLimitScroll) { 
   info("noclr"+dir); 
   return; 
   }
info("clr"+dir);
var v = (dir&1 || this.LimitWidthAuto) && this.LimitWidth!=null, h = (dir&2 || this.LimitHeightAuto) && this.LimitHeight!=null;
if(Grids.OnLimitScroll && Grids.OnLimitScroll(this,1,v,h)) return false;
this.ScrollLimited = 0;
if(v){
   this.TagWidth = this.LimitWidth; this.LimitWidth = null;
   this.MainTag.style.width = this.LimitStyleWidth;
   this.SetNoHScroll(null);
   }
if(h){ 
   this.TagHeight = this.LimitHeight; this.LimitHeight = null;
   this.MainTag.style.height = this.LimitStyleHeight;
   this.SetNoVScroll(null);
   if(this.LimitMaxHeight) { this.MaxHeight = this.LimitMaxHeight; this.LimitMaxHeight = null; this.SetArea(1); }
   }
this.UpdateMediaTag();
this.Rendering = false;
this.NoDoLimitScroll = new Date()-0;
this.CalculateSpaces(1);
this.Update();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateLimitScroll = function(noupd){
this.NoClearLimitScroll = null;
this.NoDoLimitScroll = null;
if(!noupd) this.Update();
}
// -----------------------------------------------------------------------------------------------------------
ME.LimitScroll;
// -----------------------------------------------------------------------------------------------------------
TGP.Get_BorderWidth = function(r){
var s = GetStyle(r.r1), bw = GetBorderWidth(s);
if(BIE) r.BorderIEWidth = bw;
if(s){
   var mwl = parseInt(s.marginLeft), mwr = parseInt(s.marginRight);
   MS.Scale;
   if(this.Scale){
      if(mwr==-1000) mwr = mwl; 
      if(mwl==-1000) mwl = mwr; 
      }
   ME.Scale;
    bw += (mwl?mwl:0)+(BSafari?(mwl?mwl:0):(mwr?mwr:0));
   }
if(!bw) bw = 0;
r._BorderWidth = bw;
return bw;
}
// -----------------------------------------------------------------------------------------------------------
TGP.CanChangeWinScroll = function(){
return this.NoScroll || this.ScrollLimited || this.ScrollMedia ? 0 : 1;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionChangeWinScroll = function(){
if(!this.CanChangeWinScroll()) return false;
var val = !this.NoVScroll || !this.NoHScroll ? 1 : 0;
if(Grids.OnChangeWinScroll && Grids.OnChangeWinScroll(this,!val)) return false;
var s = this.MainTag.style;
if(val) { 
   this.WinScrollMainTag = [s.width,s.height,this.NoVScroll,this.NoHScroll,this.MaxHeight]; 
   this.SetNoVScroll(val); this.SetNoHScroll(val);
   if(this.MaxHeight) this.SetMaxHeight(0); 
   }
else if(this.WinScrollMainTag){ 
   var O = this.WinScrollMainTag; 
   s.width = O[0]; s.height = O[1]; 
   this.SetNoVScroll(O[2]); this.SetNoHScroll(O[3]); 
   if(O[3]) this.SetMaxHeight(1); 
   this.WinScrollMainTag = null;
   }
else {
   var zw = s.width, zh = s.height;
   s.width = ""; s.height = ""; 
   this.SetNoVScroll(val); this.SetNoHScroll(val);
   this.GetMainTagSize();
   if(zh && this.TagHeight<20) s.height = zh;
   if(zw && this.TagWidth<parseInt(zw)) s.width = zw;
   if(s.height||s.width) this.GetMainTagSize();
   }
this.UpdateMediaTag();
this.CalculateSpaces(1);
this.Update();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetNoHScroll = function(val){
if(!this.NoHScroll==!val) return;

this.NoHScroll = val;
if(!this.BodyMain) return;
var A = [this.HeadMain,this.BodyMain,this.FootMain];
for(var i=0;i<3;i++) if(A[i]){
   for(var j=0;j<3;j++) if(A[i][j]){
      A[i][j].style.overflowX = val ? "hidden" : "scroll";
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetNoVScroll = function(val){
if(!this.NoVScroll==!val) return;
this.NoVScroll = val;
if(!this.BodyMain) return;
var A = [this.HeadMain,this.BodyMain,this.FootMain];
for(var i=0;i<3;i++) if(A[i]){
   for(var j=0;j<3;j++) if(A[i][j]){
      A[i][j].style.overflowY = val||i!=1 ? "hidden" : "scroll";
      }
   }
}
// -----------------------------------------------------------------------------------------------------------

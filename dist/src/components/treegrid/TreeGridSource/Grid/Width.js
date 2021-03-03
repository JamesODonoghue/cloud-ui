// -----------------------------------------------------------------------------------------------------------
// HTML functions for column width
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Sets column width, dx is width change
TGP.SetWidth = function(col,dx,noscroll,srow){
MS.ColWidth;

// --- calculates width ---
var C = this.Cols[col], sec = C.Sec, wo = C.Width, w = C.Width + dx, I = this.Img, hide = 0, updatespan = 0, T = this;
var S = this.ColNames[sec], mc = this.HideTree ? null : this.MainCol;

var min = I.CellBorderWidth; if(min<C.MinWidth) min = C.MinWidth;
if(C.MaxWidth && w && w>C.MaxWidth) w = C.MaxWidth;
if(dx==null){
   if(!C.Visible){
      if(C.Hidden){
         if(C.Width<min) C.Width = min;
         w = C.Width; dx = C.Width; wo = 0;
         C.Visible = 1; C.Hidden = 0;
         if(this.ColSpan && !this.ExpandingAllColumns) updatespan = 1;
         }
      else { 
         dx = 0;
         }   
      }
   else {   
      w = 0; hide = 1; dx = -C.Width;
      if(this.ColSpan && !this.ExpandingAllColumns) updatespan = 1;
      C.Visible = 0; C.Hidden = 1;
      }
   this.UpdateHidden();   
   }
else if(w<min){
   if(C.RelWidth) { w = 0; dx = -C.Width; }
   else {
      if(C.ZalRelWidth){ C.RelWidth = C.ZalRelWidth; if(!noscroll) this.Update(); return; }
      if(min>=20) C.Width = min;
      else { C.AutoWidth = true; this.CalcWidth(col,1); }
      dx = C.Width + dx - w;
      w = C.Width;
      }
   }
else if(!srow) { 
   C.Width = w;
   C.AutoWidth = false; 
   }

if(!srow) S.Width += dx;
if(this.Grouping && C.GroupWidth && dx!=C.Width && -dx!=C.Width) {
   if(C.GroupWidth!=1) C.GroupWidth += dx;
   else C.OldWidth += dx;
   }
MS.ColPaging; 
if(this.ColPaging && this.ColNames[sec].State!=4) {
   if(this.BodySec){
      var ww = S.Width+"px";
      this.BodySec[sec].firstChild.style.width = ww;
      if(!this.CPLastSec||srow){
         if(this.HeadSec[sec]) this.HeadSec[sec].firstChild.style.width = ww;
         if(this.FootSec[sec]) this.FootSec[sec].firstChild.style.width = ww;
         
         }
      }
    if(!this.CPLastSec||srow) return; 
   }
ME.ColPaging;
if(!this.BodyMain) return; 

var wp = C.WidthPad, setwp = 0;
if(wp) {
   w -= wp; wo -= wp;
   if(w<I.CellBorderLeft){ wp += w-I.CellBorderRight; w = I.CellBorderRight; setwp = 1; }
   else if(wo<I.CellBorderLeft) setwp = 1;
   if(wp<0) wp = 0;
   }
if(hide){ w = 0; if(wp) setwp = 1; wp = 0; }
var chp = this.ChildParts, fs = this.FirstSec, ls = this.LastSec, ltd = this.LeftTD;
var next = this.ReversedTree ? "previousSibling" : "nextSibling";

MS.ColSpan;
function UpdateSpan(r){
for(var i=C.Pos+1;i<S.length && r[S[i]+"Span"]==0;i++) if(T.Cols[S[i]].Visible) return; 
for(var i=C.Pos-1;i>=0;i--) if(r[S[i]+"Span"]!=0) break;
if(Get(r,S[i]+"Button")&&!(Get(r,S[i]+"Visible")<0) || T.GetType(r,S[i])=="Date"&&!T.AutoCalendar&&Get(r,S[i]+"Button")!=""&&T.CanEdit(r,S[i])) T.RefreshRow(r,sec); 
}
ME.ColSpan;
function UpdateSecSpan(row){
MS.ColSpan;
for(var r=row.firstChild;r;r=r.nextSibling) if(r.Spanned && r[col+"Span"]==0) UpdateSpan(r);
ME.ColSpan;
}

function SetW(row,r){
   
   var cell = r.firstChild.firstChild.rows[0].cells[pos];
   cell.style.width = w+"px";
   if(setwp) cell.nextSibling.style.width = wp+"px";
   if(row) for(r=row.firstChild;r;r=r.nextSibling){
      if((r.r1||r.rch1) && r.Hasch==4) {
         if(!chp) SetW(r,(r.r1?r[rsec][next]:r[rchsec]).cells[0]);
         else for(var cr=(r.r1?r[rsec][next]:r[rchsec]).cells[0].firstChild.firstChild;cr;cr=cr.nextSibling) if(cr.firstChild && cr.firstChild.nodeType==1) SetW(r,cr);
         }
      
      MS.ColSpan; if(updatespan && r.Spanned && r[col+"Span"]==0) UpdateSpan(r); ME.ColSpan;
      }
   }   

function SetWM(row,r,w,dw,setdw,plus){
   
   var cell = r.firstChild.firstChild.rows[0].cells[pos];
   if(!hide){
      if(w<I.CellBorderRight) { dw += w-I.CellBorderRight; w = I.CellBorderRight; setdw = 1; }
      else if(wo-dw<I.CellBorderRight) setdw = 1;
      }
   cell.style.width = w+"px";
   if(setwp) cell.nextSibling.style.width = wp+"px";
   if(setdw) cell.previousSibling.style.width = dw+"px";
   if(BMozilla && srow) cell.colSpan = 1; 
   if(row) for(r=row.firstChild;r;r=r.nextSibling){
      if((r.r1||r.rch1) && r.Hasch==4) {
         var pp = plus; if(r.Expanded&2) pp = 0;
//         else if(w<=pp) pp = w-1;
         if(!chp) SetWM(r,(r.r1?r[rsec][next]:r[rchsec]).cells[0],w-pp,dw+pp,setdw,I.Line);
         else for(var cr=(r.r1?r[rsec][next]:r[rchsec]).cells[0].firstChild.firstChild;cr;cr=cr.nextSibling) if(cr.firstChild && cr.firstChild.nodeType==1) SetWM(r,cr,w-pp,dw+pp,setdw,I.Line);
         }
      
      MS.ColSpan; if(updatespan && r.Spanned && r[col+"Span"]==0) UpdateSpan(r); ME.ColSpan;
      }
   }   
   
var rsec = "r"+sec, pos = C.VPos, rchsec = "rch"+sec;
if(col==mc) { 
   var lev = -1, setdw = 0;   
   if(srow) { lev = srow.Level; setdw = 1; }
   if(this.HideRootTree) lev--;
   if(srow&&srow.Expanded&2) lev--;
   var plus = 0, dw = 0;
   if(this.SpannedTree) { setdw = 0; hide = 1; }
   else if(hide) setdw = 1;
   else {
      dw = lev==-2 ? I.CellBorderLeft : (lev+1)*I.Line+I.Tree+I.CellBorderLeft; 
      plus = lev==-2 ? I.Tree : I.Line;
      w -= dw; 
      if(w<I.CellBorderRight) { dw += w-I.CellBorderRight; w = I.CellBorderRight; setdw = 1; }
      else if(wo-dw<I.CellBorderRight) setdw = 1;
      if(dw<0) dw = 0;
      }
   if(srow) {
      if(!chp) SetWM(srow,srow[rsec][next].cells[0],w,dw,setdw,plus);
      else for(var cr=srow[rsec][next].cells[0].firstChild.firstChild;cr;cr=cr.nextSibling) if(cr.firstChild && cr.firstChild.nodeType==1) SetWM(srow,cr,w,dw,setdw,plus);
      }
   else {
      
      var ibl = 0; 
      if(!this.ColPaging || this.ColNames[sec].State==4){
         for(var row=this.XB.firstChild;row;row=row.nextSibling) if(row.r1 && row.State==4) SetWM(row,row[rsec],w,dw,setdw,plus);
         }
      if(this.CPLastSec && C.MainSec==1){ rsec = "r1"; sec = 1; pos = C.FPos; } 
      if(this.HeadSec[sec]) { SetWM(null,this.HeadSec[sec],w+dw-ibl,ibl,setdw,0); if(updatespan) UpdateSecSpan(this.XH); }
      if(this.FootSec[sec]) { SetWM(null,this.FootSec[sec],w+dw-ibl,ibl,setdw,0); if(updatespan) UpdateSecSpan(this.XF); }
      }
   }
else if(srow) {
   if(!chp) SetW(srow,srow[rsec][next].cells[0]);
   else for(var cr=srow[rsec][next].cells[0].firstChild.firstChild;cr;cr=cr.nextSibling) if(cr.firstChild && cr.firstChild.nodeType==1) SetW(srow,cr);
   }
else {
   if(!this.ColPaging || this.ColNames[sec].State==4){
      for(var row=this.XB.firstChild;row;row=row.nextSibling) if(row.r1 && row.State==4) {
         SetW(this.MainCol ? row : null,row[rsec]);
         if(updatespan && !this.MainCol) UpdateSecSpan(row);
         }
      }
   if(this.CPLastSec && C.MainSec==1){ rsec = "r1"; sec = 1; pos = C.FPos; } 
   if(this.HeadSec[sec]) { SetW(null,this.HeadSec[sec]); if(updatespan) UpdateSecSpan(this.XH); }
   if(this.FootSec[sec]) { SetW(null,this.FootSec[sec]); if(updatespan) UpdateSecSpan(this.XF); }

   }



if(dx<0) this.OverflowSpaces();
if(BOpera) this.BodyMain[C.MainSec].style.height = ""; 
MS.ColPaging;
if(this.ColPaging){
   var p = this.XB.firstChild; if(p && p["r"+C.Sec]) p["r"+C.Sec].style.width = "";
   }
ME.ColPaging;
if(BSafari && C.Overflow) this.UpdateOverflow();
if(!noscroll) {
   MS.VarHeight; if(!hide && C.VarHeight==2) this.UpdateHeights(1,1); ME.VarHeight;
   this.Update(1);
   }
if(Grids.OnColResize) Grids.OnColResize(this,col);
ME.ColWidth;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateHidden = function(always){
MS.ColWidth;

if(this.Rendering&&!always || this.NoUpdateHidden) {
   this.DoUpdateHidden = 1;
   return;
   }

var C = this.Cols;

if(this.FastColumns||this.ColsPageBreaks){
   var X = this.HiddenStyle;
   if(!X) X = GetElem(this.GetItemId("FastColumns"));
   if(!X){
      MS.Sync;
      if(this.Sync["cols"]){
         for(var i=0;i<Grids.length;i++){
            var G = Grids[i];
            if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId && G.HiddenStyle && G.Sync["cols"]) { this.HiddenStyle = G.HiddenStyle; return; }
            }
         }
      ME.Sync;
      X = document.createElement("div");
      X.style.display = "none"; 
      document.getElementsByTagName("head")[0].appendChild(X);   
      this.HiddenStyle = X;
      X.id = this.GetItemId("FastColumns");
      }
   var S = "", css = "overflow:hidden!important;white-space:nowrap!important;font-size:0px!important;line-height:0px!important;"; ;
   
   if(BIEA) css += (this.Rtl ? "padding-left:0px;padding-right:0px!important;" : "padding-left:0px!important;padding-right:0px;") + (this.DynamicBorder||this.Rtl ? "border-left:none!important;border-right:none!important;" : "border-left:none;border-right:none;");
   if(this.FastColumns) {
      for(var c in C) if(!C[c].Visible && C[c].Hidden) S += ".HideCol"+this.Index+c + "{"+css+"}\n.HideCol"+this.Index+c + " *{display:none;}\n";
      var CC = this.SpannedCols;
      for(var cc in CC) {
         var A = cc.split("|"), add = 1;
         for(var i=0;i<A.length;i++) if(!C[A[i]]||C[A[i]].Visible) { add = 0; break; }
         if(add){ A = cc.replace(/\|/g,"_"); S += ".HideCol"+this.Index+A + "{"+css+"}\n.HideCol"+this.Index+A + " *{display:none;}\n"; }
         }
      }
   if(this.ColsPageBreaks){
      var CB = this.ColsPageBreaks, cbs = "border-left:"+this.Img.ColPageBreakBorder+";";
      for(var c in C) if(CB[c]) S += ".HideCol"+this.Index+c + "{"+cbs+"}\n";
      }
   
   X.innerHTML = "<br/><style type='text/css'>\n"+S+"\n</style>";
   }
ME.ColWidth;   
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateOverflow = function(){
MS.ColWidth;

var C = this.Cols;

 if(this.FastColumns){
   var X = this.OverflowStyle;
   if(!X) X = GetElem(this.GetItemId("OverflowColumns"));
   if(!X){
      X = document.createElement("div");
      X.style.display = "none"; 
      document.getElementsByTagName("head")[0].appendChild(X);   
      this.OverflowStyle = X;
      X.id = this.GetItemId("OverflowColumns");
      }
   var S = "";
   for(var c in C) if(C[c].Overflow) S += ".OverflowCol"+this.Index+c + "{overflow:"+(C[c].Overflow<C[c].Width?"visible":"hidden")+"}\n";
   X.innerHTML = S ? "<br/><style type='text/css'>\n"+S+"\n</style>" : "";
   }
ME.ColWidth;   
}
// -----------------------------------------------------------------------------------------------------------
MS.Overlay;
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateOverlays = function(row,sec,first){
if((this.Overlay&3)<=1) return;
if(!row){
   for(var b=this.XB.firstChild;b;b=b.nextSibling) this.UpdateOverlays(b,sec,first);
   this.UpdateOverlays(this.XH,sec,first);
   this.UpdateOverlays(this.XF,sec,first);
   return;
   }
for(var r=row.firstChild;r;r=r.nextSibling) {
   this.UpdateOverlay(r,sec,first,1);
   if(r.firstChild) this.UpdateOverlays(r,sec,first);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateOverlay = function(row,ssec,first,norec){
if(!row.r1 || row.Kind!="Data" || row.Space || (this.Overlay&3)<=1) return;
var all = 0, next = 1, sec = ssec; if(sec==null) { sec = this.FirstSec; all = 1; next = 1000; }
var rc = row["r"+sec]; if(!rc) return;
var cmin = this.ColPaging && !this.ColPageMin, ltd = this.LeftTD;
var c = rc.firstChild; if(c&&ltd) c = c.nextSibling;
var dyb = this.DynamicBorder, cp = this.ColPaging;
if(cp&&!all&&this.ColPaging&&sec>1&&(sec!=this.LastSec||this.SecCount==2)){ 
   var ss = sec;
   while(ss>1){
      var rsc = row["r"+(--ss)]; if(!rsc) break;
      var cc = rsc.lastChild; if(!cc) break;
      if(cc.className.indexOf("OverflowVisible")>=0&&cc.scrollWidth>cc.offsetWidth-cc.clientLeft||cc.previousSibling&&cc.previousSibling.style.borderRightColor=="transparent") { 
         next++; sec--; c = cc; cc = cc.previousSibling; 
         while(cc&&cc.style.borderRightColor=="transparent") { c = cc; cc = cc.previousSibling; }
         }
      if(cc&&(!ltd||cc.previousSibling)) break;
      }
   }

var rspn = null, RS = null, RF = null, RD = null, RSL = null, RFL = null, RDL = null, ovr3 = (this.Overlay&3)==3; 

if(row.RowSpan&&this.Overlay&4){
   rspn = new RegExp("HideCol"+this.Index+"(\\w+)"); RS = {}; RF = {}; RD = {}; RSL = {}; RFL = {}; RDL = {};
   var U = {};
   for(var n in this.SpanCols) if((row[n+"RowSpan"]==0||row[n+"RowSpan"]>1) && (!row.Spanned||row[n+"Span"]==1)) { 
      var rf = this.GetSpanRow(row,n), rl = this.GetLastSpanRow(rf,n);
      for(var r=rf,nn=this.GetNextCol(n),dis=0;r!=rl.nextSibling;r=r.nextSibling){ var cell = this.GetCell(r,nn); if(cell&&cell.className.indexOf("OverflowDisable")>=0) { dis = 1; break; } }
      if(ovr3) for(var r=rf,nn=this.GetPrevCol(n),disl=0;r!=rl.nextSibling;r=r.nextSibling){ var cell = this.GetCell(r,nn); if(cell&&cell.className.indexOf("OverflowDisable")>=0) { disl = 1; break; } }
      if(!norec){ var cell = this.GetCell(rf,n); if(cell && (cell.style.overflow=="hidden"?!dis||ovr3&&!disl:dis||ovr3&&disl)) for(var r=rf;r!=rl.nextSibling;r=r.nextSibling) if(r!=row) U[r.id] = r; }
      if(row==rf) { var cell = this.GetCell(row,n); if(cell) { RF[cell.className] = 1; RD[cell.className] = dis; if(ovr3) { RFL[cell.className] = 1; RDL[cell.className] = disl; } } }
      else { 
         var cell = this.GetCell(row,this.GetNextCol(n)); if(cell) { RS[cell.className] = this.GetCell(this.GetSpanRow(row,n),n); if(row==rl) RF[cell.className] = 1; RD[cell.className] = dis; }
         if(ovr3){ var cell = this.GetCell(row,this.GetPrevCol(n)); if(cell) { RSL[cell.className] = this.GetCell(this.GetSpanRow(row,n),n); if(row==rl) RFL[cell.className] = 1; RDL[cell.className] = disl; } }
         }
      }
   if(!norec) for(var n in U) this.UpdateOverlay(U[n],ssec,first,1);
   }

function Next(){ 
var c = row["r"+(sec+1)]; if(!c) return null;
c = c.firstChild; if(c&&ltd) c = c.nextSibling; 
if(c||sec||!cmin) return c;
c = row["r"+(sec+2)]; if(!c) return null;
c = c.firstChild; if(c&&ltd) c = c.nextSibling;
return c;
}

var sci = 0;
while(c){
   var sc = !sci&&RS?RS[c.className] : null, ac = sc ? sc : c, sf = !sci&&RF&&RF[c.className], dis = !sci&&RD&&RD[c.className], ctr = 0; 
   sci = sc?1:0;
   var cc = sc ? c : c.nextSibling;
   
   if(ac.className.indexOf("OverflowVisible")>=0 && (!ac.firstChild||!ac.firstChild.className||ac.firstChild.className.indexOf("OverlayImg")<0)){
      var cfs = null;
      if(ac.className.indexOf("OverflowWrap")>=0) { cfs = ac.firstChild.style; if(cfs) { cfs.width = ""; cfs.whiteSpace = "nowrap"; } }
      var w = ac.scrollWidth-1, ow = ac.offsetWidth-ac.clientLeft, oc = ac, nw = ow; if(cfs) w += oc.firstChild.offsetLeft*2;
      if(ac.className.indexOf("OverflowVisibleCenter")>=0&&ac.firstChild.firstChild) { 
         w = ac.firstChild.firstChild.scrollWidth/2+ac.offsetWidth/2; 
         if(cfs) w += oc.firstChild.offsetLeft; 
         if(ac.className.indexOf("OverflowCenterTo")>=0){
            ctr = ac.className.match(/OverflowCenterTo_(\d+)_(\d+)_([-\d]+)/);
            if(ctr&&ctr[3]<0) w -= -ctr[3];
            ctr = ctr ? ctr[2]-0 : 0;
            }
         } 
      
      if(sc) { 
         if(dis || w<=ow){ 
            if(c.style.borderLeftColor=="transparent") c.style.borderLeftColor = c.borderLeftColor ? c.borderLeftColor : ""; 
            if(c.style.borderBottomColor=="transparent") c.style.borderBottomColor = c.borderBottomColor ? c.borderBottomColor : "";
            if(c.style.borderTopColor=="transparent") c.style.borderTopColor = c.borderTopColor ? c.borderTopColor : "";
            }
         else {
            if(c.style.borderLeftColor!="transparent") { c.borderLeftColor = c.style.borderLeftColor; c.style.borderLeftColor = "transparent"; }
            if(!sf && c.style.borderBottomColor!="transparent") { c.borderBottomColor = c.style.borderBottomColor; c.style.borderBottomColor = "transparent"; }
            if(c.style.borderTopColor!="transparent") { c.borderTopColor = c.style.borderTopColor; c.style.borderTopColor = "transparent"; }
            }
         w -= ow; ow = c.offsetWidth; nw += ow;
         }
      else {
         if(!first && oc.style.overflow) oc.style.overflow = "";
         if(!first && w<=ow){
            if(c.style.borderRightColor=="transparent") c.style.borderRightColor = c.borderRightColor ? c.borderRightColor : ""; 
            var cn = cc ? cc : Next();
            if(cn){
               if(cn.style.borderLeftColor=="transparent") cn.style.borderLeftColor = cn.borderLeftColor ? cn.borderLeftColor : "";
               if(cn.style.borderTopColor=="transparent") cn.style.borderTopColor = cn.borderTopColor ? cn.borderTopColor : "";
               if(cn.style.borderBottomColor=="transparent") cn.style.borderBottomColor = cn.borderBottomColor ? cn.borderBottomColor : "";
               
               }
            }
         }
      while(ctr-->0||w>ow) {
         var cc = c.nextSibling; 
         if(cp&&!cc&&sec&&(sec!=this.LastSec||this.SecCount==2)){ 
            rc = row["r"+(++sec)]; if(rc) { next--; cc = rc.firstChild; if(cc&&ltd) cc = cc.nextSibling; }
            }
         if(!cc || dis || (cc.className.indexOf("OverflowDisable")>=0||cc.className.indexOf("OverflowLeftVisible")>=0)&&cc.offsetWidth || rspn&&this.GetNextCol(c.className.match(rspn)[1])!=cc.className.match(rspn)[1]) {
            if(oc==c) c.style.overflow = "hidden";
            else if(this.Overlay&8 && cc && w>ow+c.offsetWidth && cc.scrollWidth>cc.offsetWidth && !sc && oc.firstChild.nodeName!="IMG"){
               oc.style.overflow = "hidden"; oc.style.borderRightColor = ""; 
               for(var nc=oc.nextSibling;nc&&nc!=cc;nc=nc.nextSibling) { nc.style.borderRightColor = ""; nc.style.borderLeftColor = ""; }
               break;
               }
            else {
               if(cc&&cc.className.indexOf("OverflowLeftVisible")>=0) cc.style.overflow = "hidden";
               if(c.className.indexOf("OverflowVisible")<0){
                  for(var nc=cc;nc&&w>ow;nc=nc.nextSibling){
                     w -= ow; ow = nc.offsetWidth;
                     if(nc.className.indexOf("OverflowEmptyDisable")<0&&nc.className.indexOf("OverflowDisable")<0) nc.className += " "+this.Img.Style+"OverflowEmptyDisable";
                     }
                  }
               }
            if(!first){
               if(c.style.borderRightColor=="transparent") c.style.borderRightColor = c.borderRightColor ? c.borderRightColor : ""; 
               var cn = cc ? cc : Next();
               if(cn){
                  if(cn.style.borderLeftColor=="transparent") cn.style.borderLeftColor = cn.borderLeftColor ? cn.borderLeftColor : ""; 
                  
                  if((sc?!sf:sf)&&cn.style.borderBottomColor=="transparent") cn.style.borderBottomColor = cn.borderBottomColor ? cn.borderBottomColor : "";
                  
                  if(sc&&cn.style.borderTopColor=="transparent") cn.style.borderTopColor = cn.borderTopColor ? cn.borderTopColor : "";
                  }
               }
            if(cc!=c.nextSibling){ next++; sec--; cc = c.nextSibling; } 
            
            break;
            }
         if(cc.className.indexOf("OverflowEmptyDisable")>=0) cc.className = cc.className.replace(/\s+\w+OverflowEmptyDisable/,"");
         if(c.style.borderRightColor!="transparent") { c.borderRightColor = c.style.borderRightColor; c.style.borderRightColor = "transparent"; }
         if(cc.style.borderLeftColor!="transparent") { cc.borderLeftColor = cc.style.borderLeftColor; cc.style.borderLeftColor = "transparent"; }
         if((sc?!sf:sf) && cc.style.borderBottomColor!="transparent") { cc.borderBottomColor = cc.style.borderBottomColor; cc.style.borderBottomColor = "transparent"; }
         if(sc && cc.style.borderTopColor!="transparent") { cc.borderTopColor = cc.style.borderTopColor; cc.style.borderTopColor = "transparent"; }
         w -= ow; c = cc; ow = c.offsetWidth; nw += ow;
         }
      if(cfs) { cfs.width = nw>oc.offsetWidth-oc.clientLeft ? nw-oc.firstChild.offsetLeft*2+"px" : ""; cfs.whiteSpace = ""; }
      }
   else if(!first){
      if(c.style.borderRightColor=="transparent") c.style.borderRightColor = c.borderRightColor ? c.borderRightColor : ""; 
      var cn = cc ? cc : Next();
      if(cn){
         if(cn.style.borderLeftColor=="transparent") cn.style.borderLeftColor = cn.borderLeftColor ? cn.borderLeftColor : "";
         if(RS){
            
            if(cn.style.borderBottomColor=="transparent") cn.style.borderBottomColor = cn.borderBottomColor ? cn.borderBottomColor : "";
            if(cn.style.borderTopColor=="transparent") cn.style.borderTopColor = cn.borderTopColor ? cn.borderTopColor : "";
            }
         }
      }
   if(!c) break;
   c = cc;
   if(!c&&next--) {
      rc = row["r"+(++sec)]; if(!rc) break;
      c = rc.firstChild; if(c&&ltd) c = c.nextSibling;
      if(!c && sec==1 && cmin) {
         rc = row["r"+(++sec)]; if(!rc) break;
         c = rc.firstChild; if(c&&ltd) c = c.nextSibling;
         }
      }
   }
if(ovr3){ 
   var all = 0, next = 1, sec = ssec; if(sec==null) { sec = this.LastSec; all = 1; next = 1000; }
   var rc = row["r"+sec]; while(!rc && sec>1) { rc = row["r"+--sec]; next--; }
   var c = rc.lastChild, fc = ltd ? rc.firstChild : null, sci = 0;
   
   while(c!=fc){
      var sc = !sci&&RSL?RSL[c.className] : null, ac = sc ? sc : c, sf = RFL&&RFL[c.className], dis = RDL&&RDL[c.className], ctr = 0 ;
      sci = sc?1:0;
      if(ac.className.indexOf("OverflowLeftVisible")>=0){
         if(ac.className.indexOf("OverflowWrap")>=0) { cfs = ac.firstChild.style; if(cfs) { cfs.width = ""; cfs.whiteSpace = "nowrap"; } }
         var w = ac.firstChild?ac.firstChild.scrollWidth-1:ac.scrollWidth-1, ow = ac.offsetWidth-ac.clientLeft, oc = ac, nw = ow; if(cfs) w += (ac.clientWidth-ac.firstChild.offsetLeft-ac.firstChild.offsetWidth)*2;
         if(ac.className.indexOf("OverflowVisibleCenter")>=0&&ac.firstChild.firstChild) { 
            w = ac.firstChild.firstChild.scrollWidth/2+ac.offsetWidth/2; 
            if(cfs) w += ac.clientWidth-ac.firstChild.offsetLeft-ac.firstChild.offsetWidth; 
            if(ac.className.indexOf("OverflowCenterTo")>=0){
               ctr = ac.className.match(/OverflowCenterTo_(\d+)_(\d+)_([-\d]+)/);
               if(ctr&&ctr[3]>0) w -= ctr[3];
               ctr = ctr ? ctr[1]-0 : 0;
               }
            }
         if(sc) { 
            if(dis || w<=ow){ 
               if(c.style.borderLeftColor=="transparent") c.style.borderLeftColor = c.borderLeftColor ? c.borderLeftColor : ""; 
               if(c.style.borderBottomColor=="transparent") c.style.borderBottomColor = c.borderBottomColor ? c.borderBottomColor : "";
               if(c.style.borderTopColor=="transparent") c.style.borderTopColor = c.borderTopColor ? c.borderTopColor : "";
               }
            else {
               if(c.style.borderRightColor!="transparent") { c.borderRightColor = c.style.borderRightColor; c.style.borderRightColor = "transparent"; }
               if(!sf && c.style.borderBottomColor!="transparent") { c.borderBottomColor = c.style.borderBottomColor; c.style.borderBottomColor = "transparent"; }
               if(c.style.borderTopColor!="transparent") { c.borderTopColor = c.style.borderTopColor; c.style.borderTopColor = "transparent"; }
               }
            w -= ow; ow = c.offsetWidth; nw += ow;
            }
         else {
            if(!first && oc.style.overflow && oc.className.indexOf("OverflowEmptyDisable")<0) oc.style.overflow = "";
            if(!first&&w<=ow&&c.previousSibling&&c.previousSibling.style.borderRightColor=="transparent") c.previousSibling.style.borderRightColor = "";
            }
         while(ctr-->0||w>ow) {
            var cc = c.previousSibling; 
            if(cp&&cc==fc&&sec&&(sec!=this.LastSec||this.SecCount==2)){ 
               rc = row["r"+(--sec)]; if(rc) { next--; cc = rc.lastChild; c = cc; fc = ltd ? rc.firstChild : null; }
               }
            if(cc==fc || dis || cc.className.indexOf("OverflowDisable")>=0&&cc.offsetWidth || rspn&&this.GetPrevCol(c.className.match(rspn)[1])!=cc.className.match(rspn)[1]) {
               if(cc!=fc&&cc.className.indexOf("OverflowVisible")>=0) { 
                  cc.style.overflow = "hidden"; cc.style.borderRightColor = ""; 
                  for(var nc=cc.previousSibling;nc&&w>ow;nc=nc.previousSibling){
                     w -= ow; ow = nc.offsetWidth;
                     if(nc.className.indexOf("OverflowEmptyDisable")<0&&nc.className.indexOf("OverflowDisable")<0) nc.className += " "+this.Img.Style+"OverflowEmptyDisable";
                     }
                  }
               else {
                  if(oc==c) { c.style.overflow = "hidden"; cc.style.borderRightColor = ""; }
                  if(!first && cc!=fc && cc.style.borderRightColor=="transparent") cc.style.borderRightColor = "";
                  }
               if(cc!=c.previousSibling){ next++; sec++; } 
               
               break;
               }
            else if(cc.className.indexOf("OverflowLeftVisible")>=0){
               if(this.Overlay&8){
                  oc.style.overflow = "hidden"; oc.style.borderLeftColor = ""; 
                  for(var nc=oc.previousSibling;nc&&nc!=cc;nc=nc.previousSibling) { nc.style.borderRightColor = ""; nc.style.borderLeftColor = ""; }
                  }
               break;
               }
            if(cc.className.indexOf("OverflowEmptyDisable")>=0) cc.className = cc.className.replace(/\s+\w+OverflowEmptyDisable/,"");
            if(cc.style.borderRightColor!="transparent") { cc.borderRightColor = cc.style.borderRightColor; cc.style.borderRightColor = "transparent"; }
            if(cc.nextSibling&&cc.nextSibling.style.borderLeftColor!="transparent") { cc.nextSibling.borderLeftColor = cc.nextSibling.style.borderLeftColor; cc.nextSibling.style.borderLeftColor = "transparent"; }
            if((sc?!sf:sf) && cc.style.borderBottomColor!="transparent") { cc.borderBottomColor = cc.style.borderBottomColor; cc.style.borderBottomColor = "transparent"; }
            if(sc && cc.style.borderTopColor!="transparent") { cc.borderTopColor = cc.style.borderTopColor; cc.style.borderTopColor = "transparent"; }
            w -= ow; c = cc; ow = c.offsetWidth; nw += ow;
            }
         if(cfs) { cfs.width = nw>oc.offsetWidth-oc.clientLeft ? nw-(oc.clientWidth-oc.firstChild.offsetLeft-oc.firstChild.offsetWidth)*2+"px" : ""; cfs.whiteSpace = ""; }
         }
      
      if(c==fc) break;
      c = c.previousSibling;
      if(c==fc&&next--) {
         rc = row["r"+(--sec)]; while(!rc && sec>1) { rc = row["r"+--sec]; next--; } if(!rc) break;
         c = rc.lastChild; fc = ltd ? rc.firstChild : null;
         }
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
ME.Overlay;
// -----------------------------------------------------------------------------------------------------------
// Calculates and updates widths of all columns with relative width in given space row
TGP.UpdateSpaceRelWidth = function(r,W){
MS.RelWidth;
if(!this.BodyMain || !this.BodyMain[1] || !r.r1 || !r.Visible || this.Printing) return; 
var last = null, pc = 0, chg = 0;

if(!W){ 
   W = parseInt(r.r1.style.width);
   if(!W) {
      W = r.r1.clientWidth;
      if(!W) W = r.r1.parentNode.offsetWidth;
      
      }
   else if(BIE) W -= r.BorderIEWidth;
   if(!W || W<=10) return; 
   }
   
var w = r.r1.firstChild.offsetWidth; 

var A = {}, D = {};
for(var i=0;i<r.Cells.length;i++){ 
   var c = r.Cells[i], rw = r[c+"RelWidth"];
   if(rw||r[c+"Type"]=="DropCols") {
      var cell = this.GetCell(r,c); if(!cell) continue;
      w -= cell.offsetWidth;
      var v = r[c+"Visible"]; if(v==null) v = r.Def[c+"Visible"];
      if(v<=0) continue;
      if(rw) A[c] = cell;
      if(r[c+"Type"]=="DropCols") D[c] = cell;
      pc += rw;
      var mw = r[c+"MinWidth"]; if(mw) W -= mw;
      last = c;
      }
   }
W -= w;

var WW = W;
for(var c in A){
   var rw = r[c+"RelWidth"];
   var w = Math.floor(W*rw/pc); if(w<0) w = 1;
   if(c==last && WW>0) w = WW;
   WW -= w; 
   var mw = r[c+"MinWidth"];
   if(mw) w += mw;
   r[c+"Width"] = w; 
   var cell = A[c];
   
   if(cell && cell.offsetWidth!=w && cell.lastChild){
      var cf = cell.lastChild;
      while(cf && cf.firstChild && cf.className && cf.className.indexOf("Inner")>=0 && cf.className.indexOf("WidthInner")<0 && cf.firstChild.nodeType==1) cf = cf.firstChild;
      chg = 1;
      cf.style.width = w+"px";
      cf.style.overflow = "hidden";
      if(cell.offsetWidth!=w){ 
         w = w*2-cell.offsetWidth; 
         if(w<1){ 
            if(c==last){ 
               for(var cc in A){
                  var ccell = A[cc];
                  if(ccell && ccell.offsetWidth!=w && ccell.lastChild){
                     var ccf = ccell.lastChild;
                     while(ccf && ccf.firstChild && ccf.className && ccf.className.indexOf("Inner")>=0 && ccf.className.indexOf("WidthInner")<0 && ccf.firstChild.nodeType==1) ccf = ccf.firstChild;
                     var ww = parseFloat(ccf.style.width);
                     ww += w-1;
                     if(ww>1) { ccf.style.width = ww+"px"; break; }
                     ccf.style.width = "1px";
                     w = ww;
                     }
                  }
               }
            else WW -= w-1;
            w = 1;
            }
         cf.style.width = w+"px";
         }
      if(cell.offsetHeight!=cf.offsetHeight) cell.parentNode.firstChild.innerHTML = cell.parentNode.firstChild.innerHTML;
         
      }
   MS.Chart;
   if(r[c+"Type"]=="Chart") this.RefreshCell(r,c);
   ME.Chart;
   }

MS.Group;
for(var c in D){
   var cell = this.GetCell(r,c,1);
   
   if(!cell||!cell.lastChild) continue; 
   var cells = cell.lastChild.firstChild.rows; if(!cells) continue; 
   cells = cells[0].cells; 
   var val = Get(r,c), max = cell.lastChild.offsetWidth, dh = (this.Img.HeaderGroup+this.Img.DropColsSpace)/2, cap = Get(r,c+"Text")==""?0:1; 
   if(val){
      val = (val+"").split(",");
      var maxw = Get(r,c+"MaxItemWidth"); if(!maxw) maxw = 1000;
      var minw = Get(r,c+"MinItemWidth"); if(!minw) minw = 40;
      var ww = r[c+"TmpWidth"], wsum, vlen = val.length;
      if(cells.length!=vlen+cap) continue; 
      var max40 = Get(r,c+"MinTextWidth"); max40 = max-(max40==null?40:max40)-dh*vlen;
      var auto = Get(r,c+"AutoWidth"); if(auto==null) auto = 1;
      if(ww) { ww = ww.split(","); wsum = ww[vlen]; }
      else {
         ww = []; wsum = 0;
         for(var j=0;j<vlen;j++) { 
            var CC = this.Cols[val[j]];
            ww[j] = auto&4 || !CC ? cells[j].firstChild.offsetWidth : (CC.RelWidth ? (CC.MinWidth ? CC.MinWidth : (CC.Width<100?CC.Width:100)) : CC.Width);
            if(ww[j]<minw) ww[j] = minw;
            if(ww[j]>maxw) ww[j] = maxw;
            wsum += ww[j];
            }
         ww[ww.length] = wsum;
         r[c+"TmpWidth"] = ww.join(",");
         }
      var dlen = vlen;
      while(auto&1 && wsum>max40 && dlen>0){
         var dw = Math.ceil((wsum-max40)/dlen);
         for(var j=0,wsum=0;j<vlen;j++) { 
            ww[j] -= dw;
            if(ww[j]<minw){ dlen--; ww[j] = minw; }
            wsum += ww[j];
            }
         }
      var dlen = vlen;
      while(auto&2 && wsum<max40 && dlen>0) {
         var dw = Math.ceil((wsum-max40)/dlen);
         if(!dw) break;
         for(var j=0,wsum=0;j<vlen;j++) { 
            ww[j] -= dw;
            if(ww[j]>maxw){ dlen--; ww[j] = maxw; }
            wsum += ww[j];
            }
         }
      for(var j=0;j<vlen;j++) {
         if(ww[j]-dh!=cells[j].firstChild.offsetWidth) { cells[j].firstChild.style.width = ww[j]-dh + "px"; chg = 1; }
         max -= cells[j].offsetWidth+this.Img.DropColsSpace;
         }
      }
   else if(cells.length>1) continue; 
   if(cap){
      var cf = cells[val?val.length:0].firstChild; if(max<0) max = 0;
      cf.style.width = max+"px"; 
      if(max && cf.parentNode.offsetWidth > max) { max = max*2 - cf.parentNode.offsetWidth; cf.style.width = (max>0?max:0) + "px"; }
      }
   }
ME.Group;

if(r.HasPages) this.UpdateSpacePagesHeight(r);
if(r==this.ARow && chg){ this.ASpaceCol = null; this.GridMouseOver(); }
ME.RelWidth;
}
// -----------------------------------------------------------------------------------------------------------
// Calculates column width according its values (pro AutoWidth)
TGP.CalcWidth = function(col,noupdate,R){
MS.ColWidth;
var C = this.Cols[col], I = this.Img;
MS.Panel;
if(C.Type=="Panel"){ 
   var bw = this.DynamicBorder>=4 ? I.CellBorderWidth : I.CellBorderWidthHeader;
   var wd = (!this.Selecting || !C.Select ? 0 : I.Panel) 
          + (!this.Deleting || !C.Delete ? 0 : I.Panel)
          + (!this.Copying || !C.Copy ? 0 : I.Panel)
          + (!this.Dragging || !C.Move ? 0 : I.Panel)
        
          + bw + I.PanelPWidth;
   if(C.Buttons) { 
      C.IconCount = C.Buttons.split(",").length; 
      wd = C.IconCount*I.Panel + bw; 
      }
   if(wd!=C.Width){
      if(!noupdate && C.Visible && !this.Loading && !this.Rendering && this.BodyMain) { this.SetWidth(col,wd-C.Width); C.AutoWidth = 1; }
      else C.Width = wd;
      }
   return;
   }
ME.Panel;
if(C.Type=="Gantt") { C.Width = 10; return; }

var zal = C.Visible; C.Visible = 1; 
var zs = C.Spanned; C.Spanned = 0;  
var E = document.createElement("div");
E.className = "GridTmpTag GridCalcWidth"; 

this.AppendTag(E);
var A = [], max = C.MaxCalcWidth?C.MaxCalcWidth:100, zsp = this.SpannedTree, mc = col==this.MainCol; 
if(mc) { 
   this.SpannedTree = BIE||BIEA&&!BIEA8?0:1; 
   for(var i=0,b=this.XB.firstChild;i<10&&b;i++,b=b.nextSibling) b.Level = -1;
   }
var F = this.GetFixedRows();
for(var i=0;i<F.length;i++){
   var row = F[i];
   if(row.Spanned && row[col+"Span"]!=1) continue;
   A[A.length] = "<tr>"; 
   this.GetRowHTML(row,A,1,col); 
   A[A.length] = "</tr>";
   }
var dyb = this.DynamicBorder; this.DynamicBorder = null;
var next = null; if(this.Overlay){ next = this.GetNextCol(col); if(next) { var CN = this.Cols[next]; if(CN.MainSec!=C.MainSec) next = null; } }
if(!R) { 
   R = [];
   for(var row=this.GetFirstVisible();row&&max--;row=this.GetNextVisible(row,1)) R[R.length] = row;
   }
for(var i=0;i<R.length;i++){
   var row = R[i];
   if(row.Spanned && row[col+"Span"]!=1) continue;
   if(next){ 
      var ov = row[col+"Overlay"]; if(ov==null&&row.Def) ov = row.Def[col+"Overlay"]; if(ov==null) { ov = row.Overlay; if(ov==null&&row.Def) ov = row.Def.Overlay; } if(ov==null&&row.Kind!="Filter"&&row.Kind!="Header") ov = C.Overlay;
      if(ov&1){
         var ov = row[next+"Overlay"]; if(ov==null&&row.Def) ov = row.Def[next+"Overlay"]; if(ov==null) { ov = row.Overlay; if(ov==null&&row.Def) ov = row.Def.Overlay; } if(ov==null&&row.Kind!="Filter"&&row.Kind!="Header") ov = CN.Overlay;
         if((ov&6)==2 && !Get(row,next)) continue;
         }
      }
   A[A.length] = "<tr>"; 
   if(mc && (BIE||BIEA&&!BIEA8)) A[A.length] = "<td width='"+(I.Tree+I.Line*row.Level)+"'>"+CNBSP+"</td>";
   
   if(mc) this.UpdateLevelImg(row); 
   this.GetRowHTML(row,A,1,col); 
   A[A.length] = "</tr>";
   }
this.DynamicBorder = dyb;

E.innerHTML = CTableCSP0+CTfoot+A.join("")+CTableEnd;
var wd = BIEA9&&!BIE ? Math.ceil(E.firstChild.getBoundingClientRect().width) : E.firstChild.offsetWidth, mw = this.MainTag.offsetWidth; if(!mw) mw = GetWindowSize()[0]-20; 
if(wd>mw-10 && mw>10) wd = mw-10;
wd += I.CellBorderWidth;
var min = I.CellBorderWidth; if(min<C.MinWidth) min = C.MinWidth;
if(wd<min) wd = min;
if(wd>C.MaxWidth) wd = C.MaxWidth;

C.Visible = zal; C.Spanned = zs;
this.SpannedTree = zsp;

E.parentNode.removeChild(E);
if(!noupdate && C.Visible && !this.Loading && !this.Rendering && this.BodyMain) this.SetWidth(col,wd-C.Width);
else C.Width = wd;
return;
MX.ColWidth;
this.Cols[col].Width = 50;
this.Cols[col].RelWidth = 0;
ME.ColWidth;
}
// -----------------------------------------------------------------------------------------------------------
TGP.CalcTreeWidth = function(noupdate,noempty){
MS.ColWidth;
MS.Tree;
if(!this.AutoTreeWidth&&!this.HasLevelButtons&&!this.HideEmptyTree) { 
   if(this.HasLevelButtons==null){
      var F = this.GetFixedRows(); this.HasLevelButtons = 0;
      for(var i=0;i<F.length;i++) if(F[i].Kind=="Header") for(var col in this.Cols) if(F[i][col+"Levels"]==null?F[i].Def[col+"Levels"]:F[i][col+"Levels"]) { this.HasLevelButtons = 1; break; }
      if(!this.HasLevelButtons) { this.MaxLevel = null; return null; }
      }
   else { this.MaxLevel = null; return null; }
   }
var c = this.MainCol, C = this.Cols[c], I = this.Img; if(!C) { this.MaxLevel = null; return null; }
function GetLev(row,lev){ 
   for(var r=row.firstChild;r;r=r.nextSibling) {
      if(r.Visible||r.Expanded&2){
         if(r.firstChild) { var l = GetLev(r,lev); if(lev<l) lev = l; }
         else if(r.Count){ if(lev<=r.Level) lev = r.Level+1; }
         }
      if(lev<r.Level&&r.Visible) lev = r.Level;
      }
   return lev;
   }
for(var b=this.XB.firstChild,lev=0;b;b=b.nextSibling) { var l = GetLev(b,lev); if(lev<l) lev = l; }
if(this.MaxLevel==lev) return false;
var upd = !noupdate && C.Visible && !this.Loading && this.BodyMain, upd2 = upd && !this.Rendering;
if(this.HideEmptyTree&&!noempty && (!lev&&!this.HideTree || !this.MaxLevel&&this.HideTree==1)) this.SetHideTree(lev?0:1,!upd2);
var wd = this.AutoTreeWidth + (this.HideTree ? 0 : I.Tree + I.Line*lev + I.CellBorderWidth);

this.MaxLevel = lev;
if(upd2&&this.HasLevelButtons) this.UpdateHeaderLevels();
if(wd>C.MaxWidth) wd = C.MaxWidth;
if(wd<C.MinWidth) wd = C.MinWidth;
if(wd==C.Width) return false;
if(this.AutoTreeWidth){ if(upd) this.SetWidth(c,wd-C.Width); else C.Width = wd; }
return true;
ME.Tree;
ME.ColWidth;
}
// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------
// Functions for calculating printing extends, the count of rows and columns on page
// -----------------------------------------------------------------------------------------------------------
MS.Print;
// -----------------------------------------------------------------------------------------------------------
TGP.GetPrintCols = function(cols,PageWidth,PageHeight,calconly,PrintVisible,PrintSelected,PrintOnlyData,calcbreaks){
var I = this.Img;

var bc = [], wf = 0, vr = 0; 
var lastcol = this.AutoColPages&&!calcbreaks ? this.GetLastDataCol(PrintOnlyData?1696:1184) : null, afterlast = 0;
for(var i=this.FirstSec;i<=this.LastSec;i++){
   var S = this.ColNames[i];
   for(var j=0;j<S.length;j++){
      var c = S[j], C = this.Cols[c];
      if(calconly){
         if(((cols?cols[c]:C.Visible) && C.CanPrint || C.CanPrint>=3) && (!PrintSelected||!this.PrintSelectedCols||C.Selected||C.SelectedCells||!C.CanSelect) && (!afterlast||i==afterlast)){ 
            if(C.VarHeight) vr = 1;
            if(C.CanPrint==2||C.CanPrint==4) wf += C.PrintWidth ? C.PrintWidth : C.Width; 
            else bc[bc.length] = c; 
            }
         }
      else {
         C.ZalPrintWidth = C.Width;
         if(C.PrintWidth) C.Width = C.PrintWidth;
         C.ZalPrint = C.Visible ? 1 : (C.Hidden ? 2 : 0);
         if(((cols?cols[c]:C.Visible) && C.CanPrint || C.CanPrint>=3) && (!PrintSelected||!this.PrintSelectedCols||C.Selected||C.SelectedCells||!C.CanSelect) && (!afterlast||i==afterlast)){ 
            if(C.VarHeight) vr = 1;
            if(C.CanPrint==2||C.CanPrint==4){ C.Visible = 1; wf += C.Width; } 
            else { C.Visible = 0; bc[bc.length] = c; } 
            }
         else C.Visible = 0;
         C.Hidden = 0; 
         }
      if(c==lastcol) afterlast = this.ColNames.length-1;
      }
   }

wf += I.MidPrintAllWidth;

var widths = [[]], T = this; cols = [bc];
if(this.PrintConstWidth==4){
   var R = {}, RR = this.Rows;
   for(var id in RR) if(RR[id].Spanned&&this.CanPrint(RR[id])) R[id] = RR[id];
   }
function ConstWidth(w,pw){
   MS.ColHide;
   if(pw!=null&&w!=ww){ T.Cols[cc[pw]].PrintWidth = ww-w+1; w = ww; return; }
   if(w==ww || calconly&&!T.PrintVarHeight || !T.PrintConstWidth) return;
   var pc = T.PrintConstWidth;
   if(pc==4){
      var cs = cc[cc.length-1]+"Span"; pc = 3;
      for(var id in R) if(R[id][cs]>1) { pc = 2; break; }
      }
   if(pc==2){
      wd[cc.length-1] = wd[cc.length-1] ? wd[cc.length-1]+ww-w : T.Cols[cc[cc.length-1]].Width+ww-w;
      }
   else if(pc==3){
      for(var dw=ww/w,nw=0,i=0;i<cc.length;i++) { wd[i] = Math.round((wd[i] ? wd[i] : T.Cols[cc[i]].Width)*dw); nw += wd[i]; }
      wd[cc.length-1] = wd[cc.length-1]+ww-nw;
      }
   else {
      wd[cc.length] = ww-w;
      cc[cc.length] = "_ConstWidth";
      var c = T.Cols["_ConstWidth"];
      if(!c) c = T.AddCol("_ConstWidth",2,-1,{Def:"ConstWidth",Width:1000,PrintAdded:-1},0,"Html"," ");
      else { if(!c.PrintAdded) c.PrintAdded = c.Width; c.Width = 1000; }
      }
   ME.ColHide;
   }

var ww = PageWidth - wf - I.TableAllWidth - this.PrintPaddingWidth;
if(ww>=100 || bc.length<5&&ww>=10) {
   var bw = this.Img.CellBorderWidth; cols = []; widths = [];
   for(var i=0,w=0,cc=[],wd=[],pw=null;i<bc.length;i++){
      var C = this.Cols[bc[i]], cw = C.PrintWidth ? C.PrintWidth : C.Width;
      if(C.PrintConstWidth && pw==null) { cw = 1; C.PrintWidth = 1; pw = cc.length; }
      if(calconly && C.Type=="Gantt" && PrintVisible){
         
         }
      if(w+cw>ww){
         
         if(cw<ww||w) { 
            var blk = C.Block==null ? C.Group : C.Block, CL = this.Cols[cc[cc.length-1]], C0 = this.Cols[cc[0]];
            if(blk && (CL.Block==null?CL.Group:CL.Block)==blk && (C0.Block==null?C0.Group:C0.Block)!=blk){
               var nwd = [], ncc = [], nw = 0;
               while(1){
                  var p = cc.length-1, Q = this.Cols[cc[p]];
                  if((Q.Block==null?Q.Group:Q.Block)!=blk) break;
                  var xw = wd[p] ? wd[p] : Q.Width;
                  w -= xw; nw += xw;
                  nwd.unshift(wd[p]);
                  ncc.unshift(cc[p]);
                  cc.length--;
                  }
               ConstWidth(w,pw);
               cols[cols.length] = cc; pw = null;
               widths[widths.length] = wd;
               cc = ncc; wd = nwd; w = nw;
               }
            else {
               ConstWidth(w,pw);
               cols[cols.length] = cc; pw = null;
               widths[widths.length] = wd;
               cc = [];
               wd = []
               w = 0;
               }
            }
         }
      w += cw; 
      cc[cc.length] = bc[i];
      }
   ConstWidth(w,pw);
   cols[cols.length] = cc;
   widths[widths.length] = wd;
   }
else if(PageWidth) cols.err = 1;
this.PrintColsNested = cols;

var h = [I.BodyBPHeight+I.BodyMHeight+I.TableAllHeight+1, I.HeadBPHeight+I.HeadMHeight, I.FootBPHeight+I.FootMHeight]; 
var F = this.GetFixedRows(), O = this.CreateForPrintCalcHeight(cols,PageWidth);
for(var i=0;i<F.length;i++){
   var r = F[i], prn = Get(r,"CanPrint");
   if((r.DoPrint!=null ? r.DoPrint : prn && (r.Visible || prn>2)) && (!PrintSelected||!this.PrintSelectedRows||r.Selected||r.Kind=="Header"||!CCanSelect[Get(r,"CanSelect")])) {
      if(!r.r1||this.PrintVarHeight>=2) r.PrintCalcHeight = this.GetPrintCalcHeight(r,O);
      var hh = this.GetPrintRowHeight(r);
      if(prn==2 || prn==4) h[0] += hh;
      else if(r.Fixed=="Head") h[1] += hh;
      else h[2] += hh;
      }
   }

for(var r=this.XS.firstChild;r;r=r.nextSibling){
   var prn = Get(r,"CanPrint");
   if(r.DoPrint!=null ? r.DoPrint : prn && (r.Visible || prn==3||prn==4||prn==7||prn==8)) {
      if(!r.r1||this.PrintVarHeight>=2) r.PrintCalcHeight = this.GetPrintCalcHeight(r,O);
      var hh = this.GetPrintRowHeight(r);
      if(prn==2 || prn==4 || prn==6 || prn==8) h[0] += hh;
      else if(r.Space<=1) h[1] += hh;
      else h[2] += hh;
      }
   }
this.RemoveForPrintCalcHeight(O);
MS.Corners; 
if(I.Top || I.Bottom) {
   var D = document.createElement("div");
   D.style.overflow = "hidden";
   D.style.height = "0px";
   D.style.width = "0px";
   D.innerHTML = (I.Top ? this.PrintCornersHTML("Top",I.Top,100) : "") + (I.Bottom ? this.PrintCornersHTML("Bottom",I.Bottom,100) : ""); 
   document.body.appendChild(D);
   h[0] += D.scrollHeight;
   D.parentNode.removeChild(D);
   }
ME.Corners;

if((this.PrintPagePrefix||this.PrintPagePostfix)&&!this.PrintPaddingHeight){
   var D = document.createElement("div");
   var s = D.style;
   s.position = "absolute"; s.left = "0px"; s.top = "0px"; s.visibility = "hidden";
   s.className = this.Img.Style+"BodyPrint "+this.Img.Style+"PrintPage "+(this.WordWrap?this.Img.Style+"WordWrap":"");
   this.AppendTag(D);
   this.PrintPaddingHeight = 0;
   if(this.PrintPagePrefix) { D.innerHTML = this.PrintPagePrefix.replace("%9",this.Img.Size).replace("%7",this.PrintPageWidth-this.PrintPaddingWidth); this.PrintPaddingHeight += D.offsetHeight; }
   if(this.PrintPagePostfix) { D.innerHTML = this.PrintPagePostfix.replace("%9",this.Img.Size).replace("%7",this.PrintPageWidth-this.PrintPaddingWidth).replace("%0",0); this.PrintPaddingHeight += D.offsetHeight; }
   D.parentElement.removeChild(D);
   }

h[0] = PageHeight - h[0] - this.PrintPaddingHeight;
if(this.PrintPaddingHeightFirst) h[1] += this.PrintPaddingHeightFirst;
if(this.PrintPaddingHeightLast) h[2] += this.PrintPaddingHeightLast;
cols.heights = [h[0],h[0]-h[1],h[0]-h[2],h[0]-h[1]-h[2]]; 

cols.wf = wf; 
cols.widths = widths;
cols.vr = vr;
return cols;
}
// -----------------------------------------------------------------------------------------------------------
MS.VarHeight;
// -----------------------------------------------------------------------------------------------------------
TGP.GetPrintCalcHeight = function(row,O,col){
var gh = 0, A = [], zal = this.Printing; this.Printing = 1;
if(col){
   A[A.length] = this.GetWidthsTagHTML();
   var C = this.Cols[col], I = this.Img, w = C.Width, wp = C.WidthPad, bleft = I.CellBorderLeft, bright = I.CellBorderRight;
   if(row.Spanned&&row[col+"Span"]>1){
      for(var spn=row[col+"Span"],c=this.GetNextCol(col,null,1);c&&spn>1;c=this.GetNextCol(c,null,1),spn--) w += C.Width;
      }
   if(col==this.MainCol && !this.HideTree){
      var lev = row.Level; if(this.HideRootTree) lev--; if(row.Expanded&2) lev--;
      var dw = (lev+1)*I.Line+I.Tree+bleft; if(this.SpannedTree||!C.Visible||row.Fixed) dw = 0;
      w -= dw; if(w<bright) w = bright;
      }
   A[A.length] = "<th style='height:0px;width:"+w+"px;'></th></tr><tr>";
   var SS = []; this.GetRowHTML(row,SS,0,col);
   A[A.length] = SS.join("")+"</tr>"+CTableEnd;
   }
else if(row.Space){
   if(row.Space>=0 && row.Space<=5) A[A.length] = CTableCSP0+"class='"+this.Img.Style+"MainTable'"+(this.Rtl?" style='text-align:right;'":"")+CTfoot;
   A[A.length] = this.GetPrintSpaceHTML(row,O.width);
   A[A.length] = CTableEnd;
   }
else {
   
   A[A.length] = this.GetWidthsTagHTML();
   var SS = this.GetSS(); this.GetWidthsHTML(row.parentNode,SS);
   for(var i=this.FirstSec;i<=this.LastSec;i++) if(SS[i]) A[A.length] = SS[i].join("");
   A[A.length] = "</tr><tr>";
   
   var SS = this.GetSS(); this.GetRowHTML(row,SS,0);
   if(this.LeftTD) A[A.length] = "<td style='width:0px;'></td>";
   for(var i=this.FirstSec;i<=this.LastSec;i++) if(SS[i]) A[A.length] = SS[i].join("");
   A[A.length] = "</tr>"+CTableEnd;
   }
O.D.innerHTML = A.join("");

var h = O.D.offsetHeight;
if(row.Space) h -= this.Img.TableAllHeight;
if(h<gh) h = gh;
gh = row.Height==null ? row.Def.Height : row.Height; if(gh==null) gh = !row.Space ? this.RowHeight : row.Space==-1||row.Space==5 ? 0 : this.SpaceRowHeight;
if(h<gh) h = gh;
if(this.PrintVarHeight>=3&&!row.Space&&h<this.RowHeight) h = this.RowHeight;

O.D.innerHTML = "";
this.Printing = zal;
return h;
}
// -----------------------------------------------------------------------------------------------------------
TGP.CreateForPrintCalcHeight = function(cols,width){
var D = document.createElement("div");
var s = D.style;
s.position = "absolute"; s.left = "0px"; s.top = "0px"; s.visibility = "hidden"; 
D.className = this.Img.Style+"BodyPrint "+this.Img.Style+"PrintPage "+(this.WordWrap?this.Img.Style+"WordWrap":"");
this.AppendTag(D);
var V = [], W = [];
for(var i=0;i<cols.length;i++) for(var j=0;j<cols[i].length;j++) {
   var C = this.Cols[cols[i][j]];
   if(!C.Visible){ C.Visible = 1; V[V.length] = cols[i][j]; }
   if(C.PrintWidth){ W[W.length] = [cols[i][j],C.Width]; C.Width = C.PrintWidth; } 
   }
return {D:D,V:V,W:W,width:width};
}
// -----------------------------------------------------------------------------------------------------------
TGP.RemoveForPrintCalcHeight = function(O){
O.D.parentNode.removeChild(O.D);
for(var i=0;i<O.V.length;i++) this.Cols[O.V[i]].Visible = 0;
for(var i=0;i<O.W.length;i++) this.Cols[O.W[i][0]].Width = O.W[i][1];
}
// -----------------------------------------------------------------------------------------------------------
ME.VarHeight;
// -----------------------------------------------------------------------------------------------------------
TGP.CalcPrintRowCount = function(cols,E,F,B,R,S,PO,FR){

MS.VarHeight; var O = cols.vr && this.PrintVarHeight ? this.CreateForPrintCalcHeight(cols) : null; ME.VarHeight;
var ze = this.PrintExpanded, zf = this.PrintFiltered, zs = this.PrintSelected;
this.PrintExpanded = E; this.PrintFiltered = F; this.PrintSelected = S;
var row = this.GetFirstPrint(), pag = 0, cnt = 1;
cols.hp = 3; 
cols.hh = 0;
var lr = null, lrow = this.AutoPages&&!FR?this.GetLastDataRow(PO?1696:1184):null, block = 0, bh = 0, bpag = 0;
MS.VarHeight;
var OO = this.RowSpan&&O&&this.PrintPageHeight ? [] : null;
if(O){ 
   var CV = {}, CP = {};
   for(var i=0;i<cols.length;i++) for(var j=0,cc=cols[i];j<cc.length;j++) CV[cc[j]] = 1;
   for(var c in this.Cols) { var C = this.Cols[c]; if(C.Visible && !CV[c]) { C.Visible = 0; CP[c] = C; } }
   }
ME.VarHeight;

while(row){
   var nobr = row.NoPageBreak; if(nobr==null) nobr = row.Def.NoPageBreak;
   if((!R || (!lr || lr.Level >= row.Level) && (row.previousSibling||!row.Level)) && !nobr && pag && pag>=this.PrintPageRootMin) lr = row;
   if(row.Block) {
      if(block>0) { if(row.Block > block) block = row.Block; }
      else { block = row.Block; }
      }
   var nl = 0, h = 0;
   if(this.PrintPageHeight){
      MS.VarHeight;
      if(O &&  (!row.r1||this.PrintVarHeight>=2) && Get(row,"VarHeight")!=0){
         var CC = {}, CW = {}, C = this.Cols, rd = row.Def, ccnt = 0, rspn = row.RowSpan, spanned = row.Spanned, rh = 0;
         for(var i=0;i<cols.length;i++){
            for(var j=0,cc=cols[i],cw=cols.widths[i];j<cc.length;j++){
               var c = cc[j], vis = C[c].VarHeight, w = cw[j];
               if(rspn&&(row[c+"RowSpan"]==0||row[c+"RowSpan"]>1)&&C[c].Visible&&(!spanned||row[c+"Span"]!=0)) {
                  if(row[c+"RowSpan"]>1){
                     var spn = row[c+"RowSpan"], oo = OO[spn]; if(!oo) { oo = []; OO[spn] = oo; }
                     var h = this.GetPrintCalcHeight(row,O,c); if(rh<h) rh = h;
                     }
                  vis = 0;
                  }
               else if(C[c].VarHeightType && C[c].Visible){
                  var v = row[c]; if(v==null) v = rd[c];
                  if(!v&&v!="0") vis = !(C[c].VarHeightType&1);
                  else if(v-0||!v) vis = !(C[c].VarHeightType&2);
                  else if(v.search(/\W/)<0) vis = !(C[c].VarHeightType&4);
                  else vis = 1;
                  }
               if((!vis||!C[c].Visible) && row.Spanned&&!row[c+"Span"]) {
                  var sc = this.GetSpanCol(row,c);
                  vis = C[sc].Visible;
                  if(vis){
                     for(var k=j-1;k>=0;k--) if(cc[k]==sc) break; 
                     if(k<0) vis = 0;
                     }
                  }
               if(vis){ 
                  ccnt++; 
                  if(!C[c].Visible) { if(CC[c]==null) CC[c] = 0; C[c].Visible = 1; }
                  if(w!=null) { if(CW[c]==null) CW[c] = C[c].Width; C[c].Width = w; }
                  }
               else if(C[c].Visible) { if(CC[c]==null) CC[c] = 1; C[c].Visible = 0; }
               }
            }
         if(ccnt) row.PrintCalcHeight = this.GetPrintCalcHeight(row,O);
         for(var c in CC) C[c].Visible = CC[c];
         for(var c in CW) C[c].Width = CW[c];
         if(rh) oo.push(rh,row);
         }
      ME.VarHeight;
      h = this.GetPrintRowHeight(row);
//      infoln(row.id+"="+h);
      MS.VarHeight;
      if(OO && OO.length){ 
         OO.shift();
         for(var i=0;i<OO.length;i++) if(OO[i]) for(var j=0;j<OO[i].length;j+=2) OO[i][j] -= h;
         if(OO[0]) for(var j=0;j<OO[0].length;j+=2){
            var r = OO[0][j+1]; if(OO[0][j]>0) cols.hh += OO[0][j];
            }
         }
      ME.VarHeight;
      
      cols.hh += h;
      
      if(cols.hh>cols.heights[cols.hp]){
         if(cols.hp==3) cols.hp = 1;      
         else if(cols.hp==2) cols.hp = 0; 
         if(cols.hh>cols.heights[cols.hp]) nl = 1;
         }
      }
   if(nl || B && row && pag>=B){
      if(lr && row!=lr){
         row = lr;
         if(this.PrintPageHeight) h = this.GetPrintRowHeight(row);
         }
      lr = null;
      if(FR) FR[FR.length] = row; 
      cnt++;
      if(bh&&h+bh==cols.hh|| this.PrintSplitRowSpan) { cols.hh = h; bh = 0; } 
      else cols.hh = h+bh;   
      cols.hp = 2; 
      pag = 0;
      }
   if(--block>0) { bh += h; pag--; bpag++; }
   else { bh = 0; pag += bpag; bpag = 0; }
   pag++;
   if(row==lrow) break;
   row = this.GetNextPrint(row);
   }
this.PrintExpanded = ze; this.PrintFiltered = zf; this.PrintSelected = zs;
if((cols.hp==1||cols.hp==0) && this.HasFoot(cols.pos,1)) {
   cnt++;
   if(FR) { var r = this.GetFirstVisible(this.XF); if(r) FR[FR.length] = r; }
   }
MS.VarHeight; if(O) { this.RemoveForPrintCalcHeight(O); for(var c in CP) CP[c].Visible = 1; } ME.VarHeight;

return cnt;
}
// -----------------------------------------------------------------------------------------------------------
// Returns height of the row in pixels
TGP.GetPrintRowHeight = function(row){

var mh = row.PrintHeight; if(mh==null) mh = row.Def.PrintHeight;
MS.Nested; if(row.DetailCol){ var G = row.DetailGrid ? row.DetailGrid[0] : this.GetPrintNestedGrid(row); if(G&&G.PrintOuterHeight&&(!mh||G.PrintOuterHeight>mh)) mh = G.PrintOuterHeight; } ME.Nested;
var h = row.PrintCalcHeight; if(h!=null) return h<mh?mh:h;
if(row.r1){ 
   h = row.r1.offsetHeight; 
   if(h) {
      if(row.Space&&(row.Space==-1||row.Space==5)){
         var s = GetStyle(row.r1);
         var m = parseInt(s.marginTop); if(m) h += m;
         m = parseInt(s.marginBottom); if(m) h += m;
         }
      return h<mh?mh:h; 
      }
   }
var h = row.Height; if(h!=null) return h<mh?mh:h;
h = row.Def.Height; if(h!=null) return h<mh?mh:h;
return this.RowHeight<mh?mh:this.RowHeight;
}
// -----------------------------------------------------------------------------------------------------------
// Returns height of the row in pixels
TGP.UpdatePrintPageBreaks = function(clear,always){
if(this.ShowPrintPageBreaks<0) clear = 1;
var OR = this.RowsPageBreaks, OC = this.ColsPageBreaks, OG = this.GanttPageBreaks;
this.CallUpdatePrintPageBreaks = 0;
if(clear){ 
   if(!OR&&!OC) return;
   var R = null, C = null, G = null; 
   }
else {
   var cols = {}, C = this.Cols, FR = [];
   for(var c in C) if(C[c].MenuCheck||C[c].MenuCheck==null&&C[c].Visible) cols[c] = C[c];
   this.CalcPrintSize();
   cols = this.GetPrintCols(cols,this.PrintPageWidth,this.PrintPageHeight,1,this.PrintVisible,this.PrintSelected,this.PrintOnlyData,1);
   cols.pos = 0; 
   cols.rcnt = this.CalcPrintRowCount(cols,this.PrintExpanded,this.PrintFiltered,this.PrintPageBreaks?this.PrintRows:0,this.PrintPageRoot,this.PrintSelected,this.PrintOnlyData,FR);
   var R = {}, C = {}, G = [];
   for(var i=0;i<FR.length;i++) R[FR[i].id] = FR[i].Visible ? FR[i] : this.GetNextVisible(FR[i]);
   for(var i=1;i<cols.length;i++) for(var j=0;j<cols[i].length;j++) if(this.Cols[cols[i][j]].Visible) { 
      if(cols.widths[i][j]) {
         if(!G.length) G[G.length] = !j&&cols[i-1].length>1&&cols[i-1][cols[i-1].length-1]==cols[i][j] ?  cols.widths[i-1][cols[i-1].length-1] : 0;
         G[G.length] = cols.widths[i][j]; 
         }
      else C[cols[i][j]] = this.Cols[cols[i][j]]; 
      break; 
      }
   }
this.RowsPageBreaks = R; this.ColsPageBreaks = C; this.GanttPageBreaks = G;
var cls = this.Img.Style+"RowPageBreak";
if(OR){ 
   var rep = new RegExp("\\s+"+cls);
   for(var id in OR) if(!R||!R[id]) for(var i=this.FirstSec;i<=this.LastSec;i++) { var r = OR[id]["r"+i]; if(r) r.className = r.className.replace(rep); }
   }
if(R){
   for(var id in R) if(!OR||!OR[id]||always) for(var i=this.FirstSec;i<=this.LastSec;i++) { var r = R[id]["r"+i]; if(r) r.className += " "+cls; }
   }
if(C||OC){
   var chg = !C||!OC||always;
   if(!chg) for(var c in C) if(!OC[c]) { chg = 1; break; }
   if(!chg) for(var c in OC) if(!C[c]) { chg = 1; break; }
   if(chg) this.UpdateHidden();
   }

}
// -----------------------------------------------------------------------------------------------------------
TGP.CalcPrintSize = function(pdf){
var S = this.GetText("PrintPageSizes",this.Lang["MenuPrint"]), P = this.PrintPageSize; if(!S||!P) return;
S = S.split(','); P = {W:S[P*3+1],H:S[P*3+2]};
var dpi = this.PrintDPI, ndpi = dpi; if(!dpi||dpi<=0) { dpi = 96; ndpi = dpi; }
var ori = this.PrintPageOrientation;
var nw = Math.round(((ori?P.H:P.W)-this.PrintMarginWidth)*dpi/25.4);
var nh = Math.round(((ori?P.W:P.H)-this.PrintMarginHeight)*dpi/25.4);
var fit = this.PDFFitPage;
if(fit&&(pdf||this.PrintZoomFit&&this.PrintLocation!=2)) {
   var V = this.PrintVisible, S = this.PrintSelected, F = null, E = null, B = null, R = null; 
   if(fit&2 && this.PrintPageHeight){ F = this.PrintFiltered; E = this.PrintExpanded; R = this.PrintPageRoot, B = this.PrintPageBreaks ? this.PrintRows : 0; }
   var cols = {}, C = this.Cols;
   for(var c in C) if(C[c].MenuCheck||C[c].MenuCheck==null&&C[c].Visible) cols[c] = C[c];
   ndpi = this.GetPrintFitDPI(fit,cols,E,F,B,R,S,V,nw,nh,dpi,this.PrintOnlyData);
   }
else ndpi = this.PrintDefaultDPI;
if(ndpi!=dpi) {
   nw = Math[fit&1?"ceil":"floor"](nw*ndpi/dpi);
   nh = Math[fit&2?"ceil":"floor"](nh*ndpi/dpi);
   this.PrintDPI = ndpi;
   }
if(this.PrintPageWidth) this.PrintPageWidth = nw;
if(this.PrintPageHeight) this.PrintPageHeight = nh;
}
// -----------------------------------------------------------------------------------------------------------
ME.Print;

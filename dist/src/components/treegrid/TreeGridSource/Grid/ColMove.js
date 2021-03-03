// -----------------------------------------------------------------------------------------------------------
// Functions for moving columns
// -----------------------------------------------------------------------------------------------------------
MS.ColMove;
// -----------------------------------------------------------------------------------------------------------
// Moves column to position tocol, for right = 1 moves before the tocol, for 0 after tocol
// If tocol is number, it is number of column section, for right moves to the end, otherwise to the beginning
TGP.MoveCol = function(col, tocol, right, noshow, group, nosync, norender, nosel){
var Cols = this.Cols, C = Cols[col], TC = Cols[tocol], chg = 0, CN = this.ColNames, cpl = this.CPLastSec;
if(!C) return;

MS.Sync;
if(this.Sync["cols"] && !nosync){
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId && G.Cols[col] && G.Sync["cols"]) G.MoveCol(col,tocol,right,0,0,1);
      }
   }
ME.Sync;

var sec = C.Sec, mainsec = C.MainSec, pos = C.Pos, vpos = C.VPos, fpos = C.FPos, topos, tovpos, tosec, tomainsec, tofpos;
if(col==tocol){ 
   topos = 0;
   tomainsec = right ? mainsec+1 : mainsec-1;
   tovpos = this.GetFirstCol(tomainsec,null,1) ? (this.LeftTD||tomainsec==1 ? 1 : 0) : null;
   tofpos = tovpos;
   tosec = [0,1,CN.length-1][tomainsec];
   }
else if(TC){ 
   tosec = TC.Sec;
   topos = TC.Pos; if(right) topos++;
   tovpos = TC.VPos;
   tofpos = TC.FPos;
   tomainsec = TC.MainSec;
   if(right || tovpos<0) {
      var vcol = right ? this.GetNextCol(tocol,null,1) : this.GetPrevCol(tocol,null,1);
      if(cpl){
         if(!vcol || Cols[vcol].MainSec!=tomainsec) { tofpos = right ? null : (this.LeftTD||tomainsec==1 ? 1 : 0); }
         else { tofpos = Cols[vcol].FPos; if(vcol==this.MainCol && !this.HideTree) tofpos--; }
         }
      if(!vcol || Cols[vcol].Sec!=tosec) { tovpos = right ? null : (this.LeftTD||tomainsec==1 ? 1 : 0); }
      else { tovpos = Cols[vcol].VPos; if(vcol==this.MainCol && !this.HideTree) tovpos--; }
      }
   else if(tocol && tocol==this.MainCol && !this.HideTree) { tovpos--; tofpos--; }
   }
else { 
   tomainsec = tocol-0+""==tocol ? tocol-0 : mainsec;
   if(tomainsec<0 || tomainsec>3) tomainsec = mainsec;
   if(tomainsec==0) tosec = 0;
   else if(tomainsec==2) tosec = CN.length-1;
   else tosec = right ? CN.length-2 : 1;
   topos = right ? CN[tosec].length : 0;
   tovpos = right ? null : (this.LeftTD||tomainsec==1 ? 1 : 0);
   tofpos = tovpos;
   }
this.UndoStart();

MS.FocusRect; 
if(!nosel&&this.FRect && this.SelectingFocus&&this.Selecting&&this.SelectingCells && this.IsFocused(null,col)  && (!this.FRect[6]||!(this.SelectingFocus&4))) {
   if(this.FRect[7]&&this.SelectingFocus&4) this.SelectCol(col,0);
   else this.SelectRange(this.FRect[0],col,this.FRect[2],col,0); 
   }
ME.FocusRect;

MS.ColTree; this.DelColLevel(col); ME.ColTree;
var toupdspan = sec!=tosec, updspan = sec!=tosec;
if(tomainsec!=mainsec && tomainsec!=1 && !this.GetFirstCol(tomainsec) && this.BodyMain) { 
   if(this.ColNames[tosec].Visible) this.ShowColSec(tomainsec); 
   else { var zal = this.ColPaging; this.ColPaging = 1; this.AddColSec(tomainsec); this.ColPaging = zal; tovpos = null; tofpos = null; }
   toupdspan = 0;
   }

var S = CN[sec], TS = CN[tosec], U = this.Undo&&this.DynamicSpan||this.Undo&8;
MS.ColSpan; if(!group && this.ColSpan && S.State==4) { if(U) U = this.GetUndoSpan(); chg += this.DelColSpan(col,1,noshow||this.RowSpan,null,null,U); if(U) this.AddUndo({Type:"RemoveSpan",Data:U}); } ME.ColSpan;
MS.Undo;
MS.DynSpan;
if(U) this.AddUndo({Type:"MoveCol",Col:col,ToCol:tocol,Right:right,ToOld:C.Pos?CN[sec][C.Pos-1]:(CN.length>1?CN[sec][C.Pos+1]:sec),RightOld:C.Pos?1:0});
ME.DynSpan;
ME.Undo;
if(tosec==sec && pos<topos) topos--;
for(var i=C.Pos;i<S.length-1;i++) { S[i] = S[i+1]; Cols[S[i]].Pos--; }
S.length--;
for(var i=TS.length;i>topos;i--) { TS[i] = TS[i-1]; Cols[TS[i]].Pos++; }
TS[topos] = col;
C.Pos = topos;
C.Sec = tosec;
C.MainSec = tomainsec;
if(tosec!=sec && C.Visible && !C.Hidden){ S.Width -= C.Width; TS.Width += C.Width; }
if(!C.Visible && !C.Hidden) return;
this.SetVPos();
MS.ColSpan; if(!group && this.ColSpan && TS.State==4) { if(U) U = this.GetUndoSpan(); chg += this.AddColSpan(col,1,noshow||this.RowSpan,null,topos-pos,null,U); if(U) this.AddUndo({Type:"AddSpan",Data:U}); } ME.ColSpan;
MS.FocusRect;
var FR = this.FRect; 
if(FR && (FR[1]==col||FR[3]==col)){
   var FR1 = this.Cols[FR[1]], FR3 = this.Cols[FR[3]];
   if(FR1.Sec>FR3.Sec || FR1.Sec==FR3.Sec&&FR1.Pos>FR3.Pos){ var fc = FR[1]; FR[1] = FR[3]; FR[3] = fc; }
   }
ME.FocusRect;
MS.ColTree; this.AddColLevel(col); ME.ColTree;
if(!this.BodyMain) { this.UndoEnd(); if(tomainsec!=mainsec) this.UpdateSecCount(); return; } 
MS.Animate; this.FinishAnimations(); ME.Animate;

if(tomainsec!=mainsec && mainsec!=1 && !this.GetFirstCol(mainsec)) { this.HideColSec(mainsec); this.UpdateSecCount(); updspan = 0; }
      
//      }
if(mainsec==1){
   for(var i=0;i<S.length;i++) if(Cols[S[i]].Visible || Cols[S[i]].Hidden) break;
   if(i==S.length) { this.UndoEnd(); if(!noshow) this.Clear(2); this.UpdateSecCount(); if(!noshow&&!norender&&this.BodyMain) this.Render(); return true; } 
   }
if(!toupdspan&&updspan) this.UpdateSecCount();
if(noshow || !this.BodyMain || chg || this.RowSpan) {
   
   var FR = this.FRect; 
   if(!nosel && FR && this.SelectingFocus&&this.Selecting&&this.SelectingCells && this.IsFocused(null,col) && (!FR[6]||!(this.SelectingFocus&4)) && (FR[1]==col||FR[3]==col)){
      this.ClearSelection(1); if(this.SelectingFocus&4&&FR[7]) this.SelectRange(null,FR[1],null,FR[3],1); else this.SelectRange(FR[0],FR[1],FR[2],FR[3],1); 
      }
   if(!noshow&&!norender&&this.BodyMain) this.Render(); 
   this.UndoEnd(); this.CalculateSpaces(1);
   return true; 
   }

MS.ColPaging;
if(TS.State!=4){
   if(S.State==4) this.HideCol(col);
   this.UndoEnd();
   return;
   }

ME.ColPaging;

var rsec = "r"+sec, torsec = "r"+tosec, hasvpos = tovpos!=null, T = this, wp = C.WidthPad?1:0, mc = col==this.MainCol && !this.HideTree, mcell, cell, wcell;
var usec = this.UserSec[sec], tousec = this.UserSec[tosec], chgsec = tosec!=sec, chp = this.ChildParts;
var next = this.ReversedTree ? "previousSibling" : "nextSibling";

function disp(row,td,totd,page){
   if(chp){ td = td.firstChild; totd = totd.firstChild; }
   if(!page) { td = td.firstChild; totd = totd.firstChild; }
   if(!td.firstChild||td.firstChild.nodeType!=1) return; 
   var rr = td.firstChild.rows[0], torr = totd.firstChild.rows[0];
   while(1){
      if(mc) mcell = rr.cells[vpos-1];
      cell = rr.cells[vpos];
      if(wp) wcell = rr.cells[vpos+1];
      if(hasvpos){
         var bcell = torr.cells[tovpos];
         if(mc) torr.insertBefore(mcell,bcell);
         torr.insertBefore(cell,bcell);
         if(wp) torr.insertBefore(wcell,bcell);
         }
      else {
         if(mc) torr.appendChild(mcell);
         torr.appendChild(cell);
         if(wp) torr.appendChild(wcell);
         }   
      if(!chp || page) break;
      MS.ChildParts;
      rr = rr.parentNode.parentNode.parentNode[next];
      if(!rr || rr.firstChild.nodeType!=1) break;
      rr = rr.firstChild.firstChild.rows[0];
      torr = torr.parentNode.parentNode.parentNode[next].firstChild.firstChild.rows[0];
      ME.ChildParts;
      }
   for(var r=row.firstChild;r;r=r.nextSibling){
      if(!r.r1) continue;
      var rr = r[rsec], torr = r[torsec], us = r[usec]!=null || r.Def[usec]!=null, tous = chgsec ? r[tousec]!=null || r.Def[tousec]!=null : us;
      var i=0,p=0; if(!us) while(p<vpos) p += rr.cells[i++].colSpan;
      var ti=0,tp=0; if(!tous) while(tp<tovpos) tp += torr.cells[ti++].colSpan;
      if(us||tous){ 
         MS.UserSec;
         if(updspan){
            if(us) rr.lastChild.colSpan -= 1+wp+mc;
            else {
               if(wp && rr.cells[i].colSpan<=1) rr.deleteCell(i+1);
               rr.deleteCell(i);
               if(mc) rr.deleteCell(i-1);
               }
            }
         if(tous) torr.lastChild.colSpan += toupdspan+wp+mc;
         else {
            T.RefreshRow(r); 
            }
         ME.UserSec;   
         }
      else if(rr.cells[i]) {
         var haswp = wp && rr.cells[i].colSpan<=1;
         if(mc) mcell = rr.cells[i-1];
         cell = rr.cells[i];
         if(haswp) wcell = rr.cells[i+1];
         if(hasvpos){
            var bcell = torr.cells[ti];
            if(mc) torr.insertBefore(mcell,bcell);
            torr.insertBefore(cell,bcell);
            if(haswp) torr.insertBefore(wcell,bcell);
            }
         else {
            if(mc) torr.appendChild(mcell);
            torr.appendChild(cell);
            if(haswp) torr.appendChild(wcell);
            }   
         }   
      if(r.Hasch) { 
         td = rr[next].cells[0]; totd = torr[next].cells[0];
         if(updspan) td.colSpan -= 1 + wp + mc;
         totd.colSpan += toupdspan + wp + mc;
         if(r.Hasch==4) disp(r,td,totd);
         }
      }
   }    
MS.Debug; this.Debug(4,"Moving column ",col); this.StartTimer("MoveCol"); ME.Debug;
for(var row=this.XB.firstChild;row;row=row.nextSibling) if(row.r1 && row.State==4) disp(row,row[rsec],row[torsec],1);

if(this.CPLastSec) { 
   if(mainsec==1) { rsec = "r1", sec = 1; vpos = fpos; usec = this.UserSec[1];  }
   if(tomainsec==1) { torsec = "r1", tosec = 1; tovpos = tofpos; tousec = this.UserSec[1]; hasvpos = tovpos!=null; }
   } 
if(this.HeadSec[sec]) disp(this.XH,this.HeadSec[sec],this.HeadSec[tosec],1);
if(this.FootSec[sec]) disp(this.XF,this.FootSec[sec],this.FootSec[tosec],1);
if(tomainsec!=mainsec && !updspan && !this.GetFirstCol(mainsec,null,1)) this.DelColSec(mainsec); 
this.UpdateSync();
MS.Overlay; if(this.Overlay>=2) { this.UpdateOverlays(null,sec); if(tosec!=sec) this.UpdateOverlays(null,tosec); } ME.Overlay;


MS.FocusRect;
var FR = this.FRect; 
if(FR && this.SelectingFocus&&this.Selecting&&this.SelectingCells && this.IsFocused(null,col) && (!FR[6]||!(this.SelectingFocus&4))){
   if(FR[1]==col||FR[3]==col) { this.ClearSelection(1); if(this.SelectingFocus&4&&FR[7]) this.SelectRange(null,FR[1],null,FR[3],1); else this.SelectRange(FR[0],FR[1],FR[2],FR[3],1); }
   else if(this.SelectingFocus&4&&FR[7]) this.SelectCol(col,1);
   else this.SelectRange(FR[0],col,FR[2],col,1);
   }
ME.FocusRect;
if(Grids.OnDisplaceRow) { 
   var F = this.GetFixedRows(); for(var i=0;i<F.length;i++) Grids.OnDisplaceRow(this,F[i],col);
   for(var r=this.GetFirst();r;r=this.GetNext(r)) if(r.r1) Grids.OnDisplaceRow(this,r,col);
   }
this.UndoEnd();
MS.Debug; this.Debug(4,"Column ",col," moved in ",this.StopTimer("MoveCol")," ms"); ME.Debug;
}
// -----------------------------------------------------------------------------------------------------------
// Changes position of all columns and splits them to sections
// all three arguments are Arrays of column names sorted according their positions in given section
// all column names must be given
// does not show changes and also does not save cfg
MS.Api;
TGP.ChangeColsPositions = function(){
var P = {}, C = this.Cols;
for(var i=0;i<this.ColNames.length;i++){
   var CN = [], A = arguments[i], k=0;
   if(A) for(var j=0;j<A.length;j++){
      var c = C[A[j]];
      if(c){
         c.Sec = i;
         c.Pos = k;
         CN[k++] = A[j];
         }
      P[A[j]] = 1;
      }
   this.ColNames[i] = CN;
   }
for(var col in C) if(!P[col]) {var S = this.ColNames[C[col].Sec]; C[col].Pos = S.length; S[S.length] = col; } 

}
ME.Api;
// -----------------------------------------------------------------------------------------------------------
TGP.ActionFixPrev = function(F,T){
var col = this.GetACol(F,1), row = this.GetARow(F), C = this.Cols[col]; 
if(!C || !row || row.Space || C.MainSec==2 || !C.CanFix || this.Locked["fixcol"] || C.MainSec==1 && !C.Pos) return false;
return this.FixPrev(col,1,null,T);
}
// -----------------------------------------------------------------------------------------------------------
TGP.FixPrev = function(col,undo,preservespan,test,norender){
if(preservespan==null) preservespan = 1;
var C = this.Cols, L = this.ColNames[0], p = C[col].Pos, firstcol = undo&&this.Undo&8 ? this.GetFirstCol(1) : null;
var R = this.Rows, S = {}, sc = 0; for(var n in R) if(R[n].Spanned) { S[n] = R[n]; sc++; }
if(C[col].MainSec==0){
   var sec = this.ColPaging&&!this.ColPageMin?2:1;
   if(sc && preservespan) {
      var b = 1; while(b&&p<L.length){ b = 0; for(var n in S) if(S[n][L[p]+"Span"]==0) { b = 1; p++; break; } }
      }
   if(p==L.length) return false;
   if(test) return true;
   for(var i=p;i<L.length;i++){ var c = this.Cols[L[i]]; c.Sec = sec; c.MainSec = 1; }
   this.ColNames[sec] = L.splice(p,L.length-p).concat(this.ColNames[sec]);
   }
else {
   var l = L.length, sec = C[col].Sec, chg = 0, pp = C[col].Pos;
   
   if(sc&&preservespan&&sec!=1) { 
      var F = {}, sf = 0, FR = this.GetFixedRows(); for(var i=0;i<FR.length;i++) if(FR[i].Spanned) { F[FR[i].id] = FR[i]; sf++; }
      if(sf){
         for(var i=1,blk=0,p=null;i<=sec;i++){
            for(var N=this.ColNames[i],j=0,cnt=i==sec?pp:N.length;j<cnt;j++) {
               var b = 0; for(var n in F) if(F[n][N[j]+"Span"]>b) b = F[n][N[j]+"Span"];
               if(b>blk) blk = b;
               if(--blk<=0) p = [i,j+1];
               }
            }
         if(blk>0) { if(!p) return false; sec = p[0]; pp = p[1]; }
         }
      }
   for(var i=1;i<sec;i++){ 
      for(var N=this.ColNames[i],j=0;j<N.length;j++) if(!C[N[j]].CanFix) { sec = i; pp = N.length; break; }
      if(i<sec&&N.length){ if(!test){ L = L.concat(N); this.ColNames[0] = L; this.ColNames[i] = []; if(!chg) this.Clear(2); } chg = 1; }
      }
   var N = this.ColNames[sec];
   if(sc && preservespan) {
      for(var i=0,blk=0,p=0;i<pp;i++){
         var b = 0; for(var n in S) if(S[n][N[i]+"Span"]>b) b = S[n][N[i]+"Span"];
         if(b>blk) blk = b;
         if(--blk<=0) p = i+1;
         }
      }
   if(C[col].Block) while(p&&C[N[p-1]].Block==C[col].Block) p--;
   if(!p&&!chg) return false;
   if(test) return true;
   var n = N.length-p; 
   while(N.length>n && C[N[0]].CanFix) L[L.length] = N.shift();
   for(var i=l;i<L.length;i++){ var c = this.Cols[L[i]]; c.Sec = 0; c.MainSec = 0; }
   }
if(undo&&this.Undo&8) this.AddUndo({Type:"FixPrev",Col:col,First:firstcol});
if(!preservespan && sc) for(var n in S) this.UpdateSpan(S[n]);
this.UpdateSecCount();
for(var i=0,N=this.ColNames;i<N.length;i++) N[i].State = 4;
this.SetVPos();
if(!norender) this.Render();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionFixNext = function(F,T){
var col = this.GetACol(F,2), row = this.GetARow(F), C = this.Cols[col]; 
if(!C || !row || row.Space || C.MainSec==0 || !C.CanFix || this.AutoColPages || this.Locked["fixcol"]) return false;

return this.FixNext(col,1,null,T);
}
// -----------------------------------------------------------------------------------------------------------
TGP.FixNext = function(col,undo,preservespan,test,norender){
if(preservespan==null) preservespan = 1;
var C = this.Cols, last = this.ColNames.length-1, L = this.ColNames[last], p = C[col].Pos, lastcol = undo&&this.Undo&8 ? this.GetLastCol(1) : null;
var R = this.Rows, S = {}, sc = 0; for(var n in R) if(R[n].Spanned) { S[n] = R[n]; sc++; }
if(C[col].MainSec==2){
   var sec = this.ColPaging?this.ColNames.length-2:1;
   if(sc && preservespan) {
      for(var i=0,blk=0,p=-1;i<C[col].Pos;i++){
         var b = 0; for(var n in S) if(S[n][L[i]+"Span"]>b) b = S[n][L[i]+"Span"];
         if(b>blk) blk = b;
         if(--blk<=0) p = i;
         }
      }
   if(p==-1) return false;
   if(test) return true;
   for(var i=0;i<=p;i++){ var c = this.Cols[L[i]]; c.Sec = sec; c.MainSec = 1; }
   this.ColNames[sec] = this.ColNames[sec].concat(L.splice(0,p+1));
   }
else {
   var l = L.length, sec = C[col].Sec, chg = 0; p++;
   for(var i=last-1;i>sec;i--){ 
      for(var N=this.ColNames[i],j=0;j<N.length;j++) if(!C[N[j]].CanFix) { sec = i; break; }
      if(i>sec&&N.length){ if(!test) { L = N.concat(L); this.ColNames[last] = L; this.ColNames[i] = []; } chg = 1; }
      }
   var N = this.ColNames[sec];
   if(sc && preservespan) {
      var b = 1; while(b&&p<N.length){ b = 0; for(var n in S) if(S[n][N[p]+"Span"]==0) { b = 1; p++; break; } }
      }
   if(C[col].Block) while(p<N.length&&C[N[p+1]].Block==C[col].Block) p++;
   if(p==N.length&&!chg) return false;
   if(test) return true;
   while(N.length>p && C[N[N.length-1]].CanFix) L.unshift(N.pop());
   for(var i=0;i<L.length-l;i++){ var c = this.Cols[L[i]]; c.Sec = last; c.MainSec = 2; }
   }
if(undo&&this.Undo&8) this.AddUndo({Type:"FixNext",Col:col,Last:lastcol});
if(!preservespan && sc) for(var n in S) this.UpdateSpan(S[n]);
this.UpdateSecCount();
for(var i=0,N=this.ColNames;i<N.length;i++) N[i].State = 4;
this.SetVPos();
if(!norender) this.Render();
return true;
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
ME.ColMove;

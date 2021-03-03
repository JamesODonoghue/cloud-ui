// -----------------------------------------------------------------------------------------------------------
// Selecting cells
// -----------------------------------------------------------------------------------------------------------
MS.Select;
// -----------------------------------------------------------------------------------------------------------
TGP.SelectCell = function(row,col,sel,test,nosave,noundo,norow){
if(!this.Selecting || this.Locked["select"] || !this.SelectingCells || !row || row.Page || !this.CanSelect(row,1) || !col || (this.Cols[col].CanSelect!=1&&this.Cols[col].CanSelect!=3)) return false;
var sel3 = this.SelectingCells>=3, osel = row.Selected&2 ? (row[col+"Selected"]?1:0) : (sel3 ? 0 : (row.Selected?1:0)), rsel;
if(sel==null) sel = !osel;
else if(!sel==!osel) return false;
if(this.SelectingSingle&2 && row.Selected&this.SelAnd && !nosave) return false;
if(Grids.OnSelect && Grids.OnSelect(this,row,!sel,[col])) return false;
if(test) return true;
if(row.Selected==1 && !sel3){ var C = this.Cols; for(var c in C) if(C[c].CanSelect==1||C[c].CanSelect==3) row[c+"Selected"] = 1; }
row[col+"Selected"] = sel; 
if(sel3) { rsel = row.Selected&2; row.Selected |= 2; }
else {
   rsel = row.Selected; row.Selected = 2;
   if(sel&&this.SelectingCells==1&&this.CanSelect(row)){
      var C = this.Cols, ok = 0; for(var c in C) if((C[c].CanSelect==1||C[c].CanSelect==3)&&!row[c+"Selected"]) { ok = 1; break; }
      if(!ok) { row.Selected = 1; for(var c in C) if(row[c+"Selected"]) row[c+"Selected"] = null; }
      }
   }
if(!sel){ 
   var C = this.Cols, ok = 0; 
   for(var c in C) if((C[c].CanSelect==1||C[c].CanSelect==3)&&row[c+"Selected"]) { ok = 1; break; }
   if(!ok) row.Selected &= ~2;
   }
if(this.ColorCursor&8){
   if(sel ? !this.Cols[col].SelectedCells++ : !--this.Cols[col].SelectedCells) this.ColorCursorRows(col,[],8);
   if(!norow && rsel!=row.Selected) this.ColorCursorCols(row,[],8);
   }
if(this.Undo&2&&!noundo) this.AddUndo({Type:"Select",Row:row,Col:col,Sel:sel,OSel:osel}); 
if(this.SelectingSingle && row.Selected && !rsel && !sel3) {
   if(this.SelectingSingle&4 && !this.SRow) for(var r=this.GetFirstVisible();r;r=this.GetNextVisible(r)){ if (r.Selected && r!=row && this.CanSelect(r)) { this.SRow = r; break; } }
   if(this.SRow && this.SRow!=row) this.SelectRow(this.SRow,0,0,1);
   this.SRow = row;
   }
if(this.SelectClass) this.RefreshCell(row,col); else this.ColorCell(row,col);
if(this.SelectingCells<3 && !norow) this.SetAllSelected(sel,1);
if(!norow && rsel!=row.Selected && !sel3) this.UpdatePanel(row);
if(!nosave && this.SaveSelected) this.SaveCfg();
if(!nosave && this.AutoUpdate && (","+this.Source.Upload.Type+",").toLowerCase().indexOf("selected")>=0) this.UploadChanges(row);

return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SelectRange = function(r1,c1,r2,c2,sel,vis,test,noundo,x1,x2){

if(vis==null) vis = (this.SelectHidden&1?0:1)+(this.SelectHidden&2?0:2)+(this.SelectHidden&4?16:0);
if(!this.Selecting || this.Locked["select"] || !this.SelectingCells&&(c1||c2)&&(r1||r2) || this.SelectingSingle&&(!c1&&!c2||this.SelectingCells<3)) return false;
var sel3 = this.SelectingCells>=3, speccnt = 0;
if(!r1&&!r2){
   if(this.SelectingCells==1||this.SelectingCells==2){ r1 = vis&1?this.GetFirstVisible():this.GetFirst(); r2 = vis&1?this.GetLastVisible(null,vis&2?1:0):this.GetLast(null,vis&2?1:0); speccnt = 1; }
   else if(!this.SelectingCols) return false;
   }
if(sel==2||sel==null){ 
   if(!r1&&!r2) sel = this.Cols[c1].Selected ? 0 : 1;
   else if(!r1) sel = 1;
   else if(!c1) sel = r1.Selected&this.SelAnd ? 0 : 1;
   else sel = r1.Selected==1&&!sel3 || r1.Selected&2 && Is(r1,c1+"Selected") ? 0 : 1;
   }

var N = [r1,c1,r2,c2]; this.UpdateRange(N,vis,"CanSelect",x1,x2);
if(r1&&!N[0]||c1&&!N[1]||!N[0]&&!N[1]) return false; 
r1 = N[0]; c1 = N[1]; r2 = N[2]; c2 = N[3];
var type = (vis&2 ? 1 : 0) + (vis&8 ? 0 : 4), undo = this.Undo&2&&!noundo;
var Color = this.SelectClass ? "RefreshRow" : "ColorRow";
var ColorCell = this.SelectClass ? "RefreshCell" : "ColorCell";
var cnt = 0, cvis = vis&16?2:0; 
if(r2) r2 = vis&1?this.GetNextVisible(r2,type):this.GetNext(r2,type)
if(c2) c2 = this.GetNextCol(c2,null,cvis);
var selcell = sel ? sel : null;

if(!c1){
   var and = this.SelAnd;
   for(var r=r1;r&&r!=r2;r=vis&1?this.GetNextVisible(r,type):this.GetNext(r,type)){ 
      if(!(r.Selected&and)==sel && this.CanSelect(r)) cnt += this.SelectRow(r,sel,test,1,0,1);
      }
   }

else if(!r1){
   var C = this.Cols;
   for(var c=c1;c&&c!=c2;c=this.GetNextCol(c,null,cvis)) if((C[c].CanSelect==1||C[c].CanSelect==2)&&!C[c].Selected==sel) cnt += this.SelectCol(c,sel,test,0,1);
   if(cnt&&!test) this.SetAllColsSelected(sel);
   }

else {
   var S = [], C = this.Cols; 
   for(var c=c1;c&&c!=c2;c=this.GetNextCol(c,null,cvis)) if(C[c].CanSelect==1||C[c].CanSelect==3) S[S.length] = c;

   var p = S.length, vv = vis&64, v = vv || !(vis&32);
   var cur = this.ColorCursor&8, CC = [], CS = {}, CSA = 0, sel1 = this.SelectingCells==1;

   var A = {};
   for(var i=0;i<p;i++) A[S[i]] = 1;
   var X = [], x = 0;
   for(var c in C) if(!A[c] && (C[c].CanSelect==1||C[c].CanSelect==3)) X[x++] = c;
   
   for(var r=r1;r&&r!=r2;r=vis&1?this.GetNextVisible(r,type):this.GetNext(r,type)){ 
      if(!this.CanSelect(r,1)) continue;
      var s = r.Selected;
      if(!s || sel3&&s==1){ 
         if(sel&&p){ 
            if(!x && sel1 && this.CanSelect(r)) { if(this.SelectRow(r,1,test,1,0,1)){ CSA = 1; cnt += p; } }
            else {
               if(Grids.OnSelect && Grids.OnSelect(this,r,0,S)) continue;
               cnt += p;
               if(test) continue;
               MS.Undo;
               if(undo) { 
                  if(!sel3) this.AddUndo({Type:"Select",Row:r,Sel:x?null:1,OSel:0}); 
                  if(x) for(var i=0;i<p;i++) if(!r[S[i]+"Selected"]) this.AddUndo({Type:"Select",Row:r,Col:S[i],Sel:1,OSel:sel3?0:null}); 
                  }
               ME.Undo;
               if(sel3) r.Selected |= 2; 
               else { r.Selected = 2; this.UpdatePanel(r); }
               for(var i=0;i<p;i++){ r[S[i]+"Selected"] = 1; if(v) this[ColorCell](r,S[i]); }
               if(cur) {
                  for(var i=0;i<p;i++) if(!this.Cols[S[i]].SelectedCells++) CS[S[i]] = 1;
                  this.ColorCursorCols(r,CC,8);
                  }
               }
            }
         else if(vv) for(var i=0;i<p;i++) this[ColorCell](r,S[i]);  
         }
      else if(s==1){ 
         if(!sel&&p){ 
            if(!x && sel1) { if(this.SelectRow(r,0,test,1,0,1)){ CSA = 1; cnt += p; } }
            else {
               if(Grids.OnSelect && Grids.OnSelect(this,r,1,S)) continue;
               cnt += p;
               if(test) continue; 
               MS.Undo;
               if(undo) { 
                  this.AddUndo({Type:"Select",Row:r,Sel:0,OSel:1}); 
                  if(x) for(var i=0;i<x;i++) this.AddUndo({Type:"Select",Row:r,Col:X[i],Sel:1,OSel:null}); 
                  }
               ME.Undo;
               r.Selected = 2;
               for(var i=0;i<x;i++) r[X[i]+"Selected"] = 1;
               for(var i=0;i<p;i++) if(this.Cols[S[i]].Visible) if(v) this[ColorCell](r,S[i]);
               if(cur) for(var i=0;i<p;i++) if(!--this.Cols[S[i]].SelectedCells) CS[S[i]] = 1;
               this.UpdatePanel(r);
               }
            }
         }
      else { 
         for(var i=0,SS=[];i<p;i++) if(!r[S[i]+"Selected"] != !sel) SS[SS.length] = S[i]; 
         for(var i=0,xx=0;i<x;i++) if(!r[X[i]+"Selected"] != !sel) xx++;                  
         var pp = SS.length;
         if(pp && Grids.OnSelect && Grids.OnSelect(this,r,!sel,SS)) continue;
         cnt += pp;
         if(test) continue;
         MS.Undo;
         if(undo) { 
            if(!xx) this.AddUndo({Type:"Select",Row:r,Sel:sel,OSel:null});
            for(var i=0;i<pp;i++) this.AddUndo({Type:"Select",Row:r,Col:SS[i],Sel:xx?sel:null,OSel:!sel});
            }
         ME.Undo;
         if(sel3){
            for(var i=0;i<pp;i++) r[SS[i]+"Selected"] = selcell;
            var ns = r.Selected; if(pp&&sel) ns |= 2; else if(!xx&&!sel) ns &= ~2;
            if(ns!=r.Selected) { r.Selected = ns; this.ColorCursorCols(r,CC,8); if(v) this[Color](r); }
            else if(vv) for(var i=0;i<p;i++) this[ColorCell](r,S[i]);  
            else if(v) for(var i=0;i<pp;i++) this[ColorCell](r,SS[i]); 
            }
         else if(!xx && (!sel||sel1&&this.CanSelect(r))){ 
            for(var c in this.Cols) if(r[c+"Selected"]) r[c+"Selected"] = null;
            r.Selected = sel;
            this.ColorCursorCols(r,CC,8);
            this[Color](r);
            this.UpdatePanel(r);
            }
         else {
            for(var i=0;i<pp;i++){ r[SS[i]+"Selected"] = selcell; if(v) this[ColorCell](r,SS[i]); } 
            if(!sel) this.UpdatePanel(r);
            }
         if(cur) for(var i=0;i<pp;i++) if(sel ? !this.Cols[SS[i]].SelectedCells++ : !--this.Cols[SS[i]].SelectedCells) CS[SS[i]] = 1;
         }
      }
   if(cur && !test){
      if(CSA) {
         for(var j=0,B=[this.XH,this.XF];j<2;j++) for(var r=B[j].firstChild;r;r=r.nextSibling) { 
            if(r.ColorCursor&8) { 
               if(this.ColorCursor&16) this.RefreshRow(r); 
               else this.ColorRow(r); 
               } 
            }
         }
      else { var CR = []; for(var c in CS) this.ColorCursorRows(c,CR,8); }
      }
   if(speccnt && cnt>S.length) cnt = S.length; 
   }
if(test) return cnt;
if((undo||this.DynamicSpan)&&!this.Rendering) this.CalculateSpaces(1);   
this.Refresh();      
if(this.SaveSelected) this.SaveCfg();
if(this.SelectingCells<3) this.SetAllSelected(sel,1);
if(this.AutoUpdate && (","+this.Source.Upload.Type+",").toLowerCase().indexOf("selected")>=0) this.UploadChanges();
return cnt;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateRange = function(A,vis,attr,x1,x2){
if(A[4]==1) return true;
var r1 = A[0], r2 = A[2], c1 = A[1], c2 = A[3], dir = null, type = (vis&2 ? 1 : 0) + (vis&8 ? 0 : 4), C = this.Cols;

if(c1&&!C[c1]) { var cell = r1&&r1.Space?this.GetCell(r1,c1) : null; c1 = cell ? this.GetColFromPos(cell.offsetLeft+(x1?x1:0)) : null; }
if(c2&&!C[c2]) { var cell = r2&&r2.Space?this.GetCell(r2,c2) : null; c2 = cell ? this.GetColFromPos(cell.offsetLeft+(x2?x2:0)) : null; }

if(r1||r2){

   if(!r1 || r1.Space>=3) r1 = this.XF.lastChild; else if(r1.Space==0) r1 = this.XH.firstChild;
   if(!r1 || r1.Fixed=="Foot"&&(vis&8||!r2) || r1.Space>=2){
      if(vis&4) { A.length = 0; return null; }
      r1 = vis&1 ? this.GetLastVisible(null,type) : this.GetLast(null,type);
      dir = 0;
      }
   else if(r1.Fixed=="Head"&&(vis&8||!r2) || r1.Space<=1) {
      if(vis&4) { A.length = 0; return null; }
      r1 = vis&1 ? this.GetFirstVisible() : this.GetFirst();
      dir = 1;      
      }
   else if(vis&1&&!r1.Visible) r1 = this.GetNextVisible(r1,vis&8?0:4);
   if(!r2 || r2.Space>=3) r2 = this.XF.lastChild; else if(r2.Space==0) r2 = this.XH.firstChild;
   if(!r2 || r2.Fixed=="Foot"&&(vis&8||!r1) || r2.Space>=2){
      if(vis&4) { A.length = 0; return null; }
      r2 = vis&1 ? this.GetLastVisible(null,type) : this.GetLast(null,type);
      dir = 1;
      }
   else if(r2.Fixed=="Head"&&(vis&8||!r1) || r2.Space<=1) {
      if(vis&4) { A.length = 0; return null; }
      r2 = vis&1 ? this.GetFirstVisible() : this.GetFirst();
      dir = 0;      
      }
   else if(vis&1&&!r2.Visible) r2 = this.GetPrevVisible(r2,vis&8?0:4);
   if(!r1 || !r2) { A.length = 0; return null; }

   if(dir==null) dir = this.GetRowsOrder(r1,r2);
   if(!dir) { var zal = r1; r1 = r2; r2 = zal; }
   if(attr){
      var cs = attr=="CanSelect";
      while(r1&&r1!=r2&&!(cs?this.CanSelect(r1,c1||c2):Is(r1,attr))) r1 = vis&1 ? this.GetNextVisible(r1,type) : this.GetNext(r1,type);
      while(r2&&r1!=r2&&!(cs?this.CanSelect(r2,c1||c2):Is(r2,attr))) r2 = vis&1 ? this.GetPrevVisible(r2,type) : this.GetPrev(r2,type);
      if(!r1||!r2||r1==r2&&!(cs?this.CanSelect(r1,c1||c2):Is(r1,attr))) { A.length = 0; return null; }
      }
   }

if(c1||c2){  
   if(!c1||!this.Cols[c1]) c1 = this.GetFirstCol(null,null,vis&16?2:0);
   else if(!(vis&16) && !this.Cols[c1].Visible) c1 = this.GetNextCol(c1);
   if(!c2||!this.Cols[c2]) c2 = this.GetLastCol(null,null,vis&16?2:0);
   else if(!(vis&16) && !this.Cols[c2].Visible) c2 = this.GetPrevCol(c2);
   if(!C[c1]||!C[c2]) { A.length = 0; return null; }
   if(!this.GetColsOrder(c1,c2)){ var zal = c1; c1 = c2; c2 = zal; }
   if(attr){
      var cs = attr=="CanSelect", csr = r1||r2||this.SelectingCells==1||this.SelectingCells==2 ? 3 : 2;
      while(c1&&c1!=c2&&!(cs?C[c1][attr]==1||C[c1][attr]==csr:C[c1][attr])) c1 = this.GetNextCol(c1,null,vis&16?2:0);
      while(c2&&c1!=c2&&!(cs?C[c2][attr]==1||C[c2][attr]==csr:C[c2][attr])) c2 = this.GetPrevCol(c2,null,vis&16?2:0);
      if(!c1||!c2||c1==c2&&!(cs?C[c1][attr]==1||C[c1][attr]==3:C[c1][attr])) { A.length = 0; return null; }
      }
   }

A[0] = r1; A[2] = r2; A[1] = c1; A[3] = c2; A[4] = 1;
return true;
}

// -----------------------------------------------------------------------------------------------------------
TGP.ColorRange = function(N,O,color,attr,x1,x2,vis){

if(!N) N = []; else this.UpdateRange(N,vis&~16|3,attr,x1,x2);
if(!O) O = []; else this.UpdateRange(O,vis&~16|3,attr,x1,x2);
if(!N.length&&!O.length) return;

var r1 = N[0], r2 = N[2], o1 = O[0], o2 = O[2];
if(!r1&&N[1]) { r1 = this.GetFirstVisible(); r2 = this.GetLastVisible(); }
if(!o1&&O[1]) { o1 = this.GetFirstVisible(); o2 = this.GetLastVisible(); }
var RB = [], RO = [], RN = [], R = []; 
var cs = attr=="CanSelect", csc = N[1] || O[1], csr = N[0] || O[0] || this.SelectingCells==1||this.SelectingCells==2 ? 3 : 2;
for(var r=r1?r1:o1;r;r=this.GetNextVisible(r,4)){
   if(r==o1){ RN = R; R = []; o1 = null; }  
   if(!attr||(cs?this.CanSelect(r,csc):Is(r,attr))) R[R.length] = r;
   if(r==o2){ 
      if(!r2) { RO = R; break; } 
      RB = R; R = []; o2 = null; 
      }  
   if(r==r2){
      if(!o2) { RN = RN.length ? RN.concat(R) : R; }  
      else if(o1) { 
         for(var r=o1;r;r=this.GetNextVisible(r,4)){
            if(r==r1) break; 
            if(r==o2){ 
               RN = R;
               for(var r=o1;r;r=this.GetNextVisible(r,4)){ if(!attr||(cs?this.CanSelect(r,csc):Is(r,attr))) RO[RO.length] = r; if(r==o2) break; }
               o1 = null; o2 = null;
               break;
               }
            }
         }
      if(o2){ 
         RB = R;
         for(r=this.GetNextVisible(r2,4);r;r=this.GetNextVisible(r,4)){ if(!attr||(cs?this.CanSelect(r,csc):Is(r,attr))) RO[RO.length] = r; if(r==o2) break; }
         }
      if(o1) for(r=o1;r&&r!=r1;r=this.GetNextVisible(r,4)) if(!attr||(cs?this.CanSelect(r,csc):Is(r,attr))) RO[RO.length] = r; 
      break;
      }
   }

var za = this.ARow, zsc = this.SelectClass, zc = this.Colors["Selected"], zcc = this.SelectingCols; 
this.ARow = null; this.SelectClass = 0; this.SelectingCols = 2;
var sel = 1; if(!color&&color!=null) { sel = 0; color = null; }

if(!N[1]&&!O[1]){
   for(var i=0,p=RO.length;i<p;i++) this.ColorRow(RO[i]);
   if(color!=null) this.Colors["Selected"] = color;
   for(var i=0,p=RN.length;i<p;i++) { var r = RN[i], zs = r.Selected; r.Selected = sel; this.ColorRow(r); r.Selected = zs; }
   }

else {
   var c1 = N[1], c2 = N[3], o1 = O[1], o2 = O[3];
   if(!c1&&N.length) { c1 = this.GetFirstCol(); c2 = this.GetLastCol(); }
   if(!o1&&O.length) { o1 = this.GetFirstCol(); o2 = this.GetLastCol(); }

   var S = [], C = this.Cols; 
   for(var c=c1;c;c=this.GetNextCol(c)) { if(!attr||(cs?C[c][attr]==1||C[c][attr]==csr:C[c][attr])) S[S.length] = c; if(c==c2) break; }
   var X = [], XO = [], SO = [], Q = {}; 
   for(var c=o1;c;c=this.GetNextCol(c)){ 
      X[X.length] = c; 
      Q[c] = 1; 
      if(c==o2) break; 
      }
   for(var i=0;i<S.length;i++) { 
      if(!Q[S[i]]) SO[SO.length] = S[i];
      else Q[S[i]] = null;
      }
   for(var c in Q) if(Q[c]) XO[XO.length] = c; 
   var xol = XO.length, sol = SO.length, xl = X.length, sl = S.length;

   for(var i=0;i<RO.length;i++){
      var r = RO[i]; 
      for(var j=0;j<xl;j++) this.ColorCell(r,X[j]);
      }
   for(var i=0;i<RB.length;i++){
      var r = RB[i];
      for(var j=0;j<xol;j++) if(!r.RowSpan||r[XO[j]+"RowSpan"]!=0) this.ColorCell(r,XO[j]);
      }
   if(color!=null) this.Colors["Selected"] = color;
   else if(this.SelectingCells>=3) this.Colors["Selected"] = this.Colors["SelectedCell"];
   for(var i=0;i<RN.length;i++){
      var r = RN[i];
      var zs = r.Selected; r.Selected = sel; 
      for(var j=0;j<sl;j++) if(!r.RowSpan||r[S[j]+"RowSpan"]!=0) this.ColorCell(r,S[j]);
      r.Selected = zs;
      }
   for(var i=0;i<RB.length;i++){
      var r = RB[i];
      var zs = r.Selected; r.Selected = sel; 
      for(var j=0;j<sol;j++) if(!r.RowSpan||r[SO[j]+"RowSpan"]!=0) this.ColorCell(r,SO[j]);
      r.Selected = zs;
      }
   }
this.ARow = za; this.SelectClass = zsc; this.SelectingCols = zcc; this.Colors["Selected"] = zc; 
this.Refresh();      
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetSelRanges = function(type,ctype){

var R = [], Q = [], sel3 = this.SelectingCells>=3, sel4 = this.SelectingCells==4, hid = !(ctype&4), rtype = (type&2?2:4)+(type&1), RR = {}, CC = {}, C = this.Cols, tp16 = type&16;
for(var r=type&4?this.GetFirst(null,rtype):this.GetFirstVisible(null,rtype),ri=0;r;r=type&4?this.GetNext(r,rtype):this.GetNextVisible(r,rtype),ri++){
   if(!r.Selected) continue;
   if(sel4&&r.Selected&1) RR[r.id] = r;
   for(var i=this.FirstSec,ci=0;i<=this.LastSec;i++,ci+=l) {
      var S = this.ColNames[i], l = S.length, r2 = r, c1 = 0;
      while(1){
         var sel = !sel3&&r.Selected==1, T = r["TmpSel"]; if(!T) T = [];
         for(;c1<l;c1++) if(!T[i*10000+c1] && (sel ? C[S[c1]].CanSelect : r[S[c1]+"Selected"]) && (hid||C[S[c1]].Visible)) break;
         if(c1==l) break; 
         for(var c2=c1;c2<l;c2++) {
            if(T[i*10000+c2] || (sel ? !C[S[c2]].CanSelect : !r[S[c2]+"Selected"]) && (hid||C[S[c2]].Visible)) break;
            T[i*10000+c2] = 1;
            }
         if(c1==c2) break;
         r["TmpSel"] = T; Q[Q.length] = r;
         for(var n=type&4?this.GetNext(r,rtype):this.GetNextVisible(r,rtype),p=1,np=null;n;n=type&4?this.GetNext(n,rtype):this.GetNextVisible(n,rtype),p++){
            if(tp16){
               if(n.Selected) np = n;
               else {
                  for(np=n.parentNode;np&&!np.Selected;np=np.parentNode);
                  if(!np || np.Expanded&1) break;      
                  }
               if(np.Selected==1&&sel3 || type&8&&r.Fixed!=np.Fixed) break;
               }
            else if(!n.Selected || n.Selected==1&&sel3 || type&8&&r.Fixed!=n.Fixed) break;      
            else np = n;
            var T = n["TmpSel"]; if(!T) T = [];
            for(var c=c1;c<c2;c++) if(T[i*10000+c] || np.Selected&2&&!np[S[c]+"Selected"] && (hid||C[S[c]].Visible)) break;
            if(c!=c2) break; 
            r2 = n;
            for(var c=c1;c<c2;c++) T[i*10000+c] = 1;
            n["TmpSel"] = T; Q[Q.length] = n;
            }
         if(!hid) while(c2-1!=c1&&!C[S[c2-1]].Visible) c2--;
         R[R.length] = [r,S[c1],r2,S[c2-1],ri,ci+c1,p,c2-c1];
         c1 = c2;
         }
      }
   }
for(var i=0;i<Q.length;i++) Q[i]["TmpSel"] = null;

if(sel4) for(var c in C) if(C[c].Selected && (hid||C[c].Visible)) CC[c] = C[c];

if((ctype&3)==1&&this.ColPaging||(ctype&3)==2){
   var W = {}, chg = 0;
   for(var i=0;i<R.length;i++){
      var id = R[i][0].id+" | "+R[i][2].id;
      if(W[id]) { W[id][W[id].length] = R[i]; chg = 1; }
      else W[id] = [R[i]];
      }
   if(chg){
      chg = 0;
      for(var id in W){
         for(var A=W[id],i=0;i<A.length;i++){
            var a = A[i];
            for(var j=0;j<A.length;j++){
               if(j==i) continue;
               var C2 = C[a[3]], C1 = C[A[j][1]];
               if((C2.Sec+1==C1.Sec||C2.Sec+2==C1.Sec&&!this.ColNames[C2.Sec+1].length)&&(hid?C1.Pos==0&&C2.Pos==this.ColNames[C2.Sec].length-1:this.GetNextCol(a[3])==A[j][1])&&((ctype&3)==2||C2.MainSec==C1.MainSec)){
                  chg = 1;
                  a[3] = A[j][3];
                  a[7] += A[j][7];
                  A.splice(j,1); 
                  if(i>j) i--;
                  j--; 
                  }
               }
            }
         }
      if(chg){
         R = [];
         for(var id in W) for(var A=W[id],i=0;i<A.length;i++) R[R.length] = A[i];
         }
      }
   }
R.Rows = GetCount(RR)?RR:null; R.Cols = GetCount(CC)?CC:null;
return R;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSelectCell = function(F,T){ var A = this.GetACell(F); return A ? this.SelectCell(A[0],A[1],1,T) : 0; }
TGP.ActionDeselectCell = function(F,T){ var A = this.GetACell(F); return A ? this.SelectCell(A[0],A[1],0,T) : 0; }
TGP.ActionSelectCellRange = function(dummy,T){ var cnt = this.SelectRange(this.FRow,this.FCol,this.ARow,this.ACol,1,null,T); return T ? cnt : !!cnt; }  
TGP.ActionDeselectCellRange = function(dummy,T){ var cnt = this.SelectRange(this.FRow,this.FCol,this.ARow,this.ACol,0,null,T); return T ? cnt : !!cnt; }  
TGP.ActionInvertCellRangeFirst = function(dummy,T){ var cnt = this.SelectRange(this.FRow,this.FCol,this.ARow,this.ACol,2,null,T); return T ? cnt : !!cnt; }  
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSelectAllCells = function(dummy,T,clr){ 
if(this.SelectingCells>=3){ 
   if(Grids.OnSelectAll && Grids.OnSelectAll(this,!clr,1)) return T ? false : true;
   var cnt = this.SelectRange(this.GetFirst(),this.GetFirstCol(null,null,2),this.GetLast(),this.GetLastCol(null,null,2),clr?0:1,null,T); 
   return T ? cnt : !!cnt; 
   }
else if(this.SelectingCells) return this.SelectAllRows(!clr,T);
return false;
}
TGP.ActionDeselectAllCells = function(F,T){ return this.ActionSelectAllCells(F,T,1); }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSelectRowCells = function(F,T,clr){ 
var A = this.GetARanges(F?F&~2:5,0,2,1); if(!A.length) return false; 
if(this.SelectingCells>=3){ 
   var cnt = this.SelectRange(A[0][0],A[0][1],A[0][2],A[0][3],clr?0:1,null,T); 
   return T ? cnt : !!cnt; 
   }
if(this.SelectingCells) {
   var cnt = 0;
   for(var id in A.Rows) cnt += this.SelectRow(A.Rows[id],!clr,T);
   return T ? cnt : !!cnt;
   }
return false;
}
TGP.ActionDeselectRowCells = function(F,T){ return this.ActionSelectRowCells(F,T,1); }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSelectColCells = function(F,T,clr){ 
if(!this.SelectingCells) return false;
var A = this.GetARanges(F?F&~2:5,0,2,2); if(!A.length) return false; 
var cnt = this.SelectRange(A[0][0],A[0][1],A[0][2],A[0][3],clr?0:1,null,T); 
return T ? cnt : !!cnt; 
}
TGP.ActionDeselectColCells = function(F,T){ return this.ActionSelectColCells(F,T,1); }
// -----------------------------------------------------------------------------------------------------------
ME.Select;

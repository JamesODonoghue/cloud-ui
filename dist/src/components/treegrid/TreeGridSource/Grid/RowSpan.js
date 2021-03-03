// ---------------------------------------------------------------------------------------------------------------------------
TGP.ActionSpan = function(){ return 0; } 
TGP.ActionSplit = function(){ return 0; } 

MS.RowSpan;
// ---------------------------------------------------------------------------------------------------------------------------
TGP.InitRowSpan = function(){
this.SpanCols = { };
for(var col in this.Cols) if(this.Cols[col].Spanned) this.SpanCols[col] = this.Cols[col];
for(var col in this.SpanCols) {
   this.CreateRowSpan(this.XH,col); 
   this.CreateRowSpan(this.XF,col); 
   for(var B = this.XB.firstChild;B;B=B.nextSibling) this.CreateRowSpan(B,col); 
   }
}
// ---------------------------------------------------------------------------------------------------------------------------
TGP.CreateRowSpan = function(row,col){
var crs = col+"RowSpan", ccs = col+"Span", ok = 0, r = row.firstChild, C = this.Cols[col], CF = null, cpos = 0, rev = this.ReversedTree;
while(r){
   var rs = r[crs]; if(rs==null) rs = r.Def[crs];
   if(rs>1){
      ok = 1; 
      var cs = 1, n = r;
      if(r.Spanned){ 
         cs = r[ccs]; if(cs==null) cs = r.Def[ccs];
         var CN = this.ColNames[C.Sec], pos = C.Pos; 
         if(this.CPLastSec&&r.Fixed&&C.MainSec==1){
            if(!CF){ CF = this.GetAllColPages(); for(var i=1;i<C.Sec;i++) cpos += this.ColNames[i].length; }
            CN = CF; pos += cpos;
            }
         if(cs==0) { 
            if(r[CN[pos-1]+"RowSpan"]==rs) { 
               while(r&&rs-->=1) r = r.nextSibling; 
               }
            else r[crs] = null;   
            continue; 
            }  
         }
      
      for(var i=1;r&&i<=rs;i++,r=r.nextSibling){ 
         if(r.Spanned && r[ccs]==0) { rs = i-0.5; break; } 
         r.RowSpan = 1; r[crs] = 0; 
         var j = 1; 
         if(cs>1) { 
            if(!r.Spanned) { r.Spanned = 1; this.UpdateSpan(r,this.SaveSpan); }
            r[ccs] = cs; if(this.SaveSpan&&i==1) r[ccs+"Orig"] = cs;
            for(;j<cs;j++) { r[CN[j+pos]+"RowSpan"] = 0; r[CN[j+pos]+"Span"] = 0; } 
            }
         else if(r.Spanned) r[col+"Span"] = 1; 
         if(r.Spanned) {
            var CN = this.ColNames[C.Sec], pos = C.Pos;
            if(this.CPLastSec&&r.Fixed&&C.MainSec==1){
               if(!CF){ CF = this.GetAllColPages(); for(var i=1;i<C.Sec;i++) cpos += this.ColNames[i].length; }
               CN = CF; pos += cpos;
               }
            while(r[CN[j+pos]+"Span"]==0) r[CN[pos+j++]+"Span"] = 1; 
            }
         if(r.firstChild) {
            if(rev ? i==1||i>=rs+1 : i>=rs) this.CreateRowSpan(r,col); 
            else this.SetHidden(r,col,cs);
            }
         }
      if(!n.Block || n.Block<rs) n.Block = Math.floor(rs);
      n[crs] = rs; if(cs>1) for(var j=1;j<cs;j++) n[CN[j+pos]+"RowSpan"] = rs;
      if(this.SaveSpan) n[crs+"Orig"] = rs;
      }
   else {
      if(r.firstChild) this.CreateRowSpan(r,col);
      r = r.nextSibling;
      }
   }
if(ok) {
   this.LeftTD = 1;
   this.RowSpan = 1;
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetHidden = function(row,col,span,O,rowonly,U){
var rp = rowonly?row.parentNode:row; if(rp.Spanned && rp[col+"Span"]==0) return;
if(!span) span = 1;
var C = this.Cols[col], S = this.ColNames[C.Sec], p = C.Pos;
if(this.CPLastSec&&row.Fixed&&C.MainSec==1){ S = this.GetAllColPages(); for(var i=1;i<C.Sec;i++) p += this.ColNames[i].length; }
for(var r=rowonly?row:row.firstChild;r;r=r.nextSibling) {
   if(r.Spanned && r[col+"Span"]==0) { 
      for(var cc=1;r[S[p-cc]+"Span"]==0;cc++); 
      if(U) U.push(r.id,S[p-cc]+"Span",cc,r[S[p-cc]+"Span"]);
      r[S[p-cc]+"Span"] = cc;
      if(O) O[r.id] = r;
      }
   var setblk = null;
   for(var i=0;i<span;i++) { 
      if(r.RowSpan) {
         if(r[S[i+p]+"RowSpan"]!=null && r.firstChild) this.ResetHidden(r,S[i+p],O,null,U);
         if(U) U.push(r.id,S[i+p]+"RowSpan",null,r[S[i+p]+"RowSpan"]);
         if(r[S[i+p]+"RowSpan"]!=null) { r[S[i+p]+"RowSpan"] = null; setblk = 1; }   
         }
      if(U) U.push(r.id,S[i+p]+"Span",0,r[S[i+p]+"Span"]);
      r[S[i+p]+"Span"] = 0; 
      }   
   if(U) U.push(r.id,col+"Span",span,r[col+"Span"]);
   r[col+"Span"] = span;
   if(r[S[i+p]+"Span"]==0){
      for(;r[S[i+p]+"Span"]==0;i++) { 
         if(U){ if(r.RowSpan) U.push(r.id,S[i+p]+"RowSpan",null,r[S[i+p]+"RowSpan"]); U.push(r.id,S[i+p]+"Span",1,r[S[i+p]+"Span"]); }
         if(r.RowSpan) r[S[i+p]+"RowSpan"] = null; r[S[i+p]+"Span"] = 1; 
         } 
      if(O) O[r.id] = r;
      }
   if(setblk) this.SetRowBlock(r,U);
   if(r[col+"Visible"]!=-2) {
      if(U) U.push(r.id,col+"ZalVisible",r[col+"Visible"],r[col+"ZalVisible"]);
      r[col+"ZalVisible"] = r[col+"Visible"];
      }
   if(U) U.push(r.id,col+"Visible",-2,r[col+"Visible"]);
   r[col+"Visible"] = -2;
   if(!r.Spanned) { r.Spanned = 1; this.UpdateSpan(r); }
   if(O) { 
      if(span>1) O[r.id] = r; 
      else { this.RefreshCell(r,col); if(U) U.RefreshCell.push(r.id,col); }
      }
   if(r.firstChild) this.SetHidden(r,col,span,O,null,U);
   if(rowonly) break;
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.ResetHidden = function(row,col,O,rowonly,U){
var C = this.Cols[col], S = this.ColNames[C.Sec], p = C.Pos;
if(this.CPLastSec&&row.Fixed&&C.MainSec==1){ S = this.GetAllColPages(); for(var i=1;i<C.Sec;i++) p += this.ColNames[i].length; }
for(var r=rowonly?row:row.firstChild;r;r=r.nextSibling) {
   if(U) U.push(r.id,col+"Visible",r[col+"ZalVisible"],r[col+"Visible"],r.id,col+"ZalVisible",null,r[col+"ZalVisible"]);
   r[col+"Visible"] = r[col+"ZalVisible"]; r[col+"ZalVisible"] = null;
   var span = r[col+"Span"];
   if(span>1) {
      if(U) for(var i=0;i<span;i++) U.push(r.id,S[i+p]+"Span",1,r[S[i+p]+"Span"]);
      for(var i=0;i<span;i++) r[S[i+p]+"Span"] = 1;
      if(O) O[r.id] = r;
      }
   else if(O) { this.RefreshCell(r,col); if(U) U.RefreshCell.push(r.id,col); }
   if(r.firstChild) this.ResetHidden(r,col,O,null,U);
   if(rowonly) break;
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateRowSpan = function(row,ch){
if(!this.RowSpan||!row.RowSpan) return;
var D = [], MD = null;
for(var col in this.SpanCols) if(row[col+"RowSpan"]!=null && row[col+"Span"]!=0) {
   var rs = this.GetSpanRow(row,col), spn = rs[col+"RowSpan"], rv = null, ro = null; 
   for(var i=1,r=rs,pls=0,ipls=0;i<=spn&&r;i++,r=r.nextSibling){
      if(!r.Visible) { 
         if(r.r1&&rv) ipls--; else pls--; 
         if(!ro && r==row) ro = r;
         }
      else {
         if(i!=spn && r.Hasch && (r.Expanded||BIEA&&!BIE8Strict&&i<=spn-1)) pls++;
         if(BIEA&&!BIE8Strict&&rv) ipls = 0;
         if(!rv) rv = r;
         if(!ro && r!=row) ro = r;
         }
      }
   if(ro!=rv && !ch){ 
      if(ro && ro!=rs){
         
         var vis = ro.Visible; ro.Visible = 1;
         if(rv) rv.Visible = 0;
         D[D.length] = this.GetCell(ro,col);
         if(col==this.MainCol&&!this.HideTree) MD = D[D.length-1];
         if(rv) rv.Visible = 1; 
         ro.Visible = vis;
         }
      if(rv && rv!=rs) {
         this.RefreshRow(rv,this.Cols[col].Sec);
         
         }
      }
   if(rv){
      var cell = this.GetCell(rv,col);
      if(cell){
         spn = Math.floor(spn+pls+ipls);
         cell.rowSpan = spn;
         var bcell = cell.nextSibling;
         if(bcell && bcell.className.indexOf(this.Rtl?"NoRight":"NoLeft")>=0) bcell.rowSpan = spn;
         if(col==this.MainCol && !this.HideTree && !row.Fixed) cell.previousSibling.rowSpan = spn;
          this.UpdateRowHeight(rv);
         }
      }
   }

for(var i=0;i<D.length;i++){
   var cell = D[i]; if(!cell) continue;
   var par = cell.parentNode;
   var bcell = cell.nextSibling;
   if(bcell && bcell.className.indexOf(this.Rtl?"NoRight":"NoLeft")>=0) par.removeChild(bcell);
   if(cell==MD) par.removeChild(cell.previousSibling);
   par.removeChild(cell);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetSpannedCols = function(col){
if(!this.RowSpan) return [];
var Spn = [], C = this.Cols[col]; if(!C) return [];
var CN = this.ColNames[C.Sec];
for(var i=0;i<C.Pos;i++){
   var c = this.Cols[CN[i]];
   if(c.Spanned && (c.Visible || c.Hidden)) Spn[Spn.length] = CN[i];
   }
return Spn;   
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetSpanRow = function(row,col,vis){
if(row.Spanned && row[col+"Span"]=="0") col = this.GetPrevCol(col,row); 
while(row && row[col+"Visible"]==-2) row = row.parentNode;
while(row && row[col+"RowSpan"]==0) row = row.previousSibling;
if(vis) while(row && !row.Visible) row = row.nextSibling;
return row;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetLastSpanRow = function(row,col,vis){
if(row.Spanned && row[col+"Span"]=="0") col = this.GetPrevCol(col,row); 
while(row && row[col+"Visible"]==-2) row = row.parentNode;
var p = row;
if(row && row[col+"RowSpan"]>1) row = row.nextSibling;
while(row && row[col+"RowSpan"]==0) row = row.nextSibling;
if(p!=row) row = row ? this.GetPrev(row) : this.GetLast(p.parentNode);
if(vis) while(row && !row.Visible) row = row.previousSibling;
return row;
}

// -----------------------------------------------------------------------------------------------------------
TGP.GetSpanCell = function(row,col){
var C = this.Cols[col], S = this.ColNames[C.Sec], pos = C.Pos, sec = C.Sec;
if(this.CPLastSec&&row.Fixed&&C.MainSec==1){ S = this.GetAllColPages(); pos = null; sec = 1; }
while(row[col+"RowSpan"]==0) row = row.previousSibling; 
if(!row.Visible && row[col+"RowSpan"]>1){ 
   for(var r=row.nextSibling;r&&r[col+"RowSpan"]==0&&!r.Visible;r=r.nextSibling);
   if(!r) return null;
   if(r.Visible) row = r; 
   }
var  r = row["r"+sec]; if(!r) return null; 
if(row.Spanned && row[col+"Span"]==0) { 
   if(pos==null) { for(var i=1,pos=C.Pos;i<C.Sec;i++) pos += this.ColNames[i].length; } 
   for(var p=pos-1;p&&row[S[p]+"Span"]==0;p--);
   col = S[p];
   }
for(var i=0,p=this.LeftTD||sec==1?1:0;i<S.length;i++){
   var c = S[i], C = this.Cols[c];
   if(row[c+"RowSpan"]==0) {
      for(var n=row.previousSibling,hid=0;n[c+"RowSpan"]==0;n=n.previousSibling) if(n.Visible) hid = 1; 
      if(hid||n.Visible){ 
         if(row.Spanned) i += row[c+"Span"]-1; 
         continue;
         }
      }
   if(!C.Visible&&!C.Hidden){ 
      if(!row.Spanned) continue; 
      var sp = row[c+"Span"];
      for(var j=1;j<sp&&!this.Cols[S[i+j]].Visible&&!this.Cols[S[i+j]].Hidden;j++);
      if(j==sp) {  
         if(c==col) return null; 
         i += sp-1;
         continue; 
         }
      
      }
   else if(c==this.MainCol && !this.HideTree) p++;
   if(row.Spanned) {
      var sp = row[c+"Span"];
      if(!sp){
         info("Chyba span "+row.id+","+c+" !!!");
         return null;
         }
      i += sp-1;
      }
   if(c==col) return r.cells[p];
   var bcell = r.cells[p+1];
   p += bcell && bcell.className.indexOf(this.Rtl?"NoRight":"NoLeft")>=0 ? 2 : 1;
   }
return null; 
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetSpanHeight = function(row,h){
if(BIE8Strict && !BIEA9 && BIEVER<=8) return h>this.RowHeight?h:this.RowHeight; 
var CC = {}, H = {}, CE = { }, RS = {}, setrs = BIEA&&!BIE;
for(var col in this.SpanCols) if((row[col+"RowSpan"] || row[col+"RowSpan"]==0 && this.GetSpanRow(row,col,1)==row) && (!row.Spanned||row[col+"Span"]!=0)) {
   var cell = this.GetCell(row,col);
   if(cell) {
      H[col] = cell.offsetHeight;
      CC[col] = this.SpanCols[col];
      CE[col] = cell;
      if(setrs) RS[col] = cell.rowSpan;
      }
   }

for(var col in CC) if(CE[col].offsetHeight) if(setrs) CE[col].rowSpan = 1; else CE[col].style.display = "none"; 
for(var col in CC) {
   var spn = col+"RowSpan", vis = col+"Visible", hh = 0;
   for(var r=this.GetNextVisible(row,1);r&&(r[spn]==0||r[vis]==-2);r=this.GetNextVisible(r,1)) if(r.r1) {
      
      var hhh = r.r1.offsetHeight;
      if(r.r0 && r.r0.offsetHeight > hhh) hhh = r.r0.offsetHeight;
      if(r.r2 && r.r2.offsetHeight > hhh) hhh = r.r2.offsetHeight;
      hh += hhh;
      
      }  
   hh = H[col]-hh;
   if(h<hh) h = hh;
   }

for(var col in CC) if(setrs) CE[col].rowSpan = RS[col]; else CE[col].style.display = "";

return h;
}
// -----------------------------------------------------------------------------------------------------------
TGP.RemoveRowSpan = function(rows,O,U){
var al = rows.length, X = {}, CF = null, cpos = 0, B = {};
if(rows[0].RowSpan){
   for(var col in this.SpanCols){
      if(!X[col] && rows[0][col+"RowSpan"]==0){
         for(var a=1,rs=rows[0].previousSibling;rs&&rs[col+"RowSpan"]==0;rs=rs.previousSibling,a++);
         var rsp = rs[col+"RowSpan"], sp = rs.Spanned ? rs[col+"Span"] : 1;
         var apls = a+al<=rsp ? rsp-al : a+rsp-Math.floor(rsp); 
         if(apls<=1) { apls = null; O[rs.id] = rs; }
         else if(a+al>=rsp&&rows[0].previousSibling.firstChild) apls += 0.5;
         var C = this.Cols[col], S = this.ColNames[C.Sec], p = C.Pos;
         if(this.CPLastSec&&rs.Fixed&&C.MainSec==1){ 
            if(!CF) { CF = this.GetAllColPages(); for(var i=1;i<C.Sec;i++) cpos += this.ColNames[i].length; } 
            S = CF; p += cpos;
            }
         if(U) for(var i=0;i<sp;i++) U.push(rs.id,S[i+p]+"RowSpan",apls,rs[S[i+p]+"RowSpan"]);
         for(var i=0;i<sp;i++) { rs[S[i+p]+"RowSpan"] = apls; X[S[i+p]] = 1; }
         if(apls==null) this.ResetHidden(rs,col,O,null,U);
         
         for(var j=0;j<al;j++) {
            var r = rows[j];
            
            if(U) {
               if(sp>1) { U.push(r.id,col+"Span",1,r[col+"Span"]);  U.UpdateSpan[r.id] = 1; }
               for(var i=0;i<sp;i++) U.push(r.id,S[i+p]+"RowSpan",null,r[S[i+p]+"RowSpan"]);
               }
            if(sp>1) { r[col+"Span"] = 1; this.UpdateSpan(r); }
            for(var i=0;i<sp;i++) r[S[i+p]+"RowSpan"] = null;
            if(r.firstChild) this.ResetHidden(r,col,O,null,U);
            if(O) O[r.id] = r;
            }
         if(rs.Block>=a+al&&!B[rs.id]) {
            if(U) U.push(rs.id,"Block",rs.Block-al,rs.Block);
            rs.Block -= al; B[rs.id] = 1;
            }
         else if(rs.Block>a&&!B[rs.id]) { 
            if(U) U.push(rs.id,"Block",a,rs.Block);
            rs.Block = a; B[rs.id] = 1;
            }
         }
      }
   }
if(this.MainCol) for(var col in this.SpanCols) if(rows[0][col+"Visible"]==-2) {
   for(var i=0;i<al;i++) this.ResetHidden(rows[i],col,O,1,U);
   var p = rows[0].parentNode;
   if(p.childNodes.length==rows.length&&p[col+"Visible"]!=-2) { 
      var cell = this.GetCell(p,col); 
      if(cell) cell.rowSpan--;
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.AddRowSpan = function(rows,O,U){
var al = rows.length, prev = rows[0].previousSibling, next = rows[al-1].nextSibling, par = rows[0].parentNode, X = {}, CF = null, cpos = 0;
if(next && next.RowSpan) for(var col in this.SpanCols) if(!X[col] && next[col+"RowSpan"]==0) {
   var rs = this.GetSpanRow(prev,col), sp = rs.Spanned ? rs[col+"Span"] : 1;
   var C = this.Cols[col], S = this.ColNames[C.Sec], p = C.Pos;
   if(this.CPLastSec&&rs.Fixed&&C.MainSec==1){ 
      if(!CF) { CF = this.GetAllColPages(); for(var i=1;i<C.Sec;i++) cpos += this.ColNames[i].length; } 
      S = CF; p += cpos;
      }
   if(U) for(var i=0;i<sp;i++) U.push(rs.id,S[i+p]+"RowSpan",rs[S[i+p]+"RowSpan"]+al,rs[S[i+p]+"RowSpan"]);
   for(var i=0;i<sp;i++) rs[S[i+p]+"RowSpan"] += al;
   for(var j=0;j<rows.length;j++){
      var r = rows[j];
      r.RowSpan = 1;
      if(O) O[r.id] = r;
      for(var i=0;i<sp;i++) { 
         if(r[S[i+p]+"RowSpan"]>1) {  
            var cc = S[i+p], spx = r.Spanned ? r[cc+"Span"] : 1; 
            if(spx==0) { cc = this.GetSpanCol(r,cc); spx = r[cc+"Span"]; }
            var pp = this.Cols[cc].Pos;
            for(var k=r[S[i+p]+"RowSpan"],rr=r;k>=1&&rr;k--,rr=rr.nextSibling) {
               for(var l=0;l<spx;l++){
                  if(U) U.push(rr.id,S[l+pp]+"RowSpan",null,rr[S[l+pp]+"RowSpan"]);
                  rr[S[l+pp]+"RowSpan"] = null;
                  if(rr.firstChild&&k>1) this.ResetHidden(rr,S[l+pp],O,null,U); 
                  }
               }
            this.SetRowBlock(r,U);
            }
         if(U) U.push(r.id,S[i+p]+"RowSpan",0,r[S[i+p]+"RowSpan"]);
         r[S[i+p]+"RowSpan"] = 0; 
         X[S[i+p]] = 1; 
         }
      if(r.Spanned && r[col+"Span"]==0){
         for(var k=1;r[S[p-k]+"Span"]==0;k++);
         
         if(U) { U.push(r.id,S[p-k]+"Span",k,r[S[p-k]+"Span"]); U.UpdateSpan[r.id] = 1; }
         r[S[p-k]+"Span"] = k; this.UpdateSpan(r);
         }
      if(sp>1) { 
         
         if(U) { U.push(r.id,col+"Span",sp,r[col+"Span"]); U.UpdateSpan[r.id] = 1; }
         r.Spanned = 1; r[col+"Span"] = sp; this.UpdateSpan(r); 
         }
      if(r.firstChild) this.SetHidden(r,col,sp,O,null,U);
      }
   if(rs.Block<rs[col+"RowSpan"]) {
      if(U) U.push(rs.id,"Block",rs[col+"RowSpan"],rs.Block);
      rs.Block = rs[col+"RowSpan"];
      
      }
   }
if(!next) next = prev; if(!next) next = par;
if(this.MainCol) for(var col in this.SpanCols) {
   if(next[col+"Visible"]==-2 || next==par&&(par[col+"RowSpan"]==0||par[col+"RowSpan"]>1) && (par.nextSibling&&par.nextSibling[col+"RowSpan"]==0 || this.GetSpanRow(par,col)[col+"RowSpan"]%1)) {
      var span = next[col+"Span"];
      for(var i=0;i<al;i++) this.SetHidden(rows[i],col,span,O,1,U);
      }
   }

}
// -----------------------------------------------------------------------------------------------------------
TGP.GetUndoSpan = function(ref,upd){
var U = []; U.RefreshCell = []; U.UpdateSpan = {}; U.RefreshRow = ref?ref:{}; U.UpdateRowSpan = upd?upd:{}; return U;
}

// -----------------------------------------------------------------------------------------------------------
ME.RowSpan;

// -----------------------------------------------------------------------------------------------------------
MS.Move;
TGP.MoveRow = function(row,par,next,show,master,noexpand,prevspan){
if(row.Removed) return 0;
if(!this.RowSpan && !row.Block) return this.MoveRowOne(row,par,next,show,master,noexpand);
var moved = 0;
MS.RowSpan;
var A = [], oldpar = row.parentNode, oldprev = row.previousSibling, O = {};

this.GetBlock(row,A);    
if(A[0].parentNode==par) for(var i=0;i<A.length;i++) if(A[i]==next) return 0; 
var UR = null, UA = null; 
MS.Undo;
if(this.Undo&1&&this.OUndo) { 
   this.UndoStart(); 
   var US = {}; if(oldprev) US[oldprev.id] = 1; for(var i=0;i<A.length;i++) US[A[i].id] = 1;
   UR = this.GetUndoSpan(O,US); UA = this.GetUndoSpan(O,US);
   }
ME.Undo;
this.RemoveRowSpan(A,O,UR); if(UR) this.AddUndo({ Type:"RemoveSpan",Data:UR }); 

if(par&&!par.Page&&!par.Hasch) this.CreateChildren(par); 
this.RowSpan = 0; var zal = this.Rendering; this.Rendering = 1;
var lr = A[A.length-1], oldnext = lr.nextSibling, oldmoved = {}; for(var i=0;i<A.length;i++) oldmoved[A[i].id] = A[i].Moved;

for(var i=0;i<A.length;i++) moved |= this.MoveRowOne(A[i],par,next,show,master,noexpand,prevspan,1,1);
if(this.MainCol) for(var i=0;i<A.length;i++) this.UpdateRowIcons(A[i],show,1);
if(this.Undo&1) {
   this.AddUndo({Type:"Move",Row:A[0],Parent:par,Next:next,OldParent:oldpar,OldNext:oldnext,Moved:oldmoved});
   if(oldpar.Removed) { this.AddUndo({Type:"DelPage",Page:oldpar,Next:oldpar.Next}); oldpar.Next = null; }
   }
if(this.SaveOrder && !Is(A[0],"NoUpload")) this.SetChange({ Row:A[0],Parent:par.id?par.id:par.Pos,Next:next?next.id:null,Moved:A[0].Moved });
this.RowSpan = 1; this.Rendering = zal;

this.AddRowSpan(A,O,UA); if(UA) this.AddUndo({Type:"AddSpan",Data:UA}); 
if(oldprev) this.UpdateRowSpan(oldprev,1);  
for(var i=0;i<A.length;i++) this.UpdateRowSpan(A[i],1);      
for(var ro in O) this.RefreshRow(O[ro]); 

if(this.Undo&1) this.UndoEnd();
if(show) this.Update();   
ME.RowSpan;
return moved;
}
ME.Move;
// -----------------------------------------------------------------------------------------------------------
TGP.GetBlock = function(row,A){
for(var block=1;block>0&&row;block--){
   if(row.Block > block) block = row.Block;
   A[A.length] = row;
   row = row.nextSibling;
   }
}
// -----------------------------------------------------------------------------------------------------------
MS.ColSpan$RowSpan;
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
TGP.GetSpanned = function(row,col,vis){
if(!row||row.Fixed||!col) return [row,col,row,col];
var r1 = row, r2 = row, c1 = col, c2 = col; 
if(r1.Spanned&&r1[c1+"Span"]!=1) c1 = this.GetSpanCol(r1,c1);
if(r1.RowSpan&&r1[c1+"RowSpan"]!=1||r1[c1+"Visible"]==-2) r1 = this.GetSpanRow(r1,c1);
if(r2.Spanned&&r2[c2+"Span"]!=1) c2 = this.GetLastSpanCol(r2,c2,vis);
if(r2.RowSpan&&r2[c2+"RowSpan"]!=1||r2[c2+"Visible"]==-2) r2 = this.GetLastSpanRow(r2,c2,vis);
if(vis){
   if(!r1.Visible) r1 = this.GetNextVisible(r1);
   if(!this.Cols[c1].Visible) c1 = this.GetNextCol(c1);
   }
return [r1,c1,r2,c2];
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
MS.DynSpan;
// -----------------------------------------------------------------------------------------------------------
TGP.SpanRange = function(r1,c1,r2,c2,plus){

if(!plus) plus = 0;
MS.Animate; this.FinishAnimations(); ME.Animate;

if(r1.Fixed!=r2.Fixed){
   if(r1.Fixed) { this.SpanRange(r1,c1,this.GetLastVisible(this.XH),c2); r1 = this.GetFirstVisible(); } 
   if(r2.Fixed) { this.SpanRange(this.GetFirstVisible(this.XF),c1,r2,c2); r2 = this.GetLastVisible(); } 
   }
if(this.Cols[c1].MainSec!=this.Cols[c2].MainSec){
   if(this.Cols[c1].MainSec==0) { this.SpanRange(r1,c1,r2,this.GetLastCol(0)); c1 = this.GetFirstCol(1); } 
   if(this.Cols[c1].MainSec==2) { this.SpanRange(r1,this.GetFirstCol(2),r2,c2); c2 = this.GetLastCol(1); }   
   }

if(r1.parentNode!=r2.parentNode){
   while(r1.Level > r2.Level) r1 = r1.parentNode;
   while(r2.Level > r1.Level) { r2 = r2.parentNode; plus = 0.5; }
   while(r1.parentNode!=r2.parentNode && r1.Level>0){ r1 = r1.parentNode; r2 = r2.parentNode; plus = 0.5; }
   }

MS.ColPaging;
if(this.ColPaging && this.Cols[c1].Sec!=this.Cols[c2].Sec) {
   this.MergeColPages(this.Cols[c1].Sec,this.Cols[c2].Sec);
   }
ME.ColPaging;

MS.Paging;
if(r1.parentNode!=r2.parentNode){ 
   var r = r1.parentNode.nextSibling.firstChild, p = r1.parentNode;
   var zal = this.Rendering; this.Rendering = 1;
   var A = [];
   this.UndoStart();
   while(1){
      this.GetBlock(r,A);    
      var n = this.GetNextSibling(A[A.length-1]);
      this.MoveRow(r,p,null,1);
      if(p==r2.parentNode) break;
      r = n;
      }
   this.UndoEnd();
   this.Rendering = zal;
   }
ME.Paging;

MS.ChildParts;
if(this.ChildParts && r1.r1 && (!r2.r1 || r1.r1.parentNode!=r2.r1.parentNode)){ 
   for(var r=r1.nextSibling;r.r1&&r.r1.parentNode==r1.r1.parentNode;r=r.nextSibling); 
   for(var p=r1.r1.parentNode.parentNode.parentNode.previousSibling,num=0;p;p=p.previousSibling,num++); 
   for(var nr=r2.nextSibling;r!=nr;r=r.nextSibling){
      if(!r.r1) this.RenderChildPart(r.parentNode,num+1); 
      var rev = this.ReversedTree;
      for(var i=this.FirstSec;i<=this.LastSec;i++) if(r["r"+i]) {
         var p = r["r"+i].parentNode;
         if(rev){
            MS.ReversedTree;
            var ch = r.Hasch ? r["r"+i].previousSibling : null;
            if(ch) r1["r"+i].parentNode.appendChild(ch);
            r1["r"+i].parentNode.appendChild(r["r"+i]);
            ME.ReversedTree;
            }
         else {
            var ch = r.Hasch ? r["r"+i].nextSibling : null;
            r1["r"+i].parentNode.appendChild(r["r"+i]);
            if(ch) r1["r"+i].parentNode.appendChild(ch);
            }
         if(p.childNodes.length==1) { p = p.parentNode.parentNode; p.parentNode.removeChild(p); } 
         }
      }
   }
ME.ChildParts;
if(r1==r2&&c1==c2&&!plus) return;

for(var r=r1;r&&r!=r2;r=r.nextSibling);
if(!r){ r = r1; r1 = r2; r2 = r; }
var C = this.Cols, sec = C[c1].Sec, S = this.ColNames[sec];
if(C[c1].Pos>C[c2].Pos) { var c = c1; c1 = c2; c2 = c; }
var p = C[c1].Pos, cc = C[c2].Pos-p+1, nc = S[p+cc];
var nr = r2.nextSibling, lr = nr, fr = r1, ma = 0, mb = 0, O = {}, undo = this.Undo && this.DynamicSpan && this.OUndo;

if(r2[c2+"Span"]>1) {
   while(r2[S[p+cc]+"Span"]==0) cc++; 
   nc = S[p+cc];
   c2 = S[p+cc-1];
   }
if(r2.RowSpan && r2[c2+"RowSpan"]!=1){
   while(nr && nr[c2+"RowSpan"]==0) nr = nr.nextSibling;
   lr = nr;
   r2 = nr ? nr.previousSibling : r2.parentNode.lastChild;
   }

MS.Undo;
if(this.Undo && !this.OUndo && (r1[c1+"RowSpan"]>1 || r1==r2) && (r1[c1+"Span"]==cc || c1==c2 && !r1.Spanned)){
   for(var a=1,r=r1;r&&r!=r2;r=r.nextSibling,a++);
   if(a+plus==r1[c1+"RowSpan"]||a==1&&!plus&&r1[c1+"RowSpan"]==null) return;
   }
if(undo){ var aundo = this.CanUndo()+this.CanRedo()*2; }
this.UndoStart();
ME.Undo;
var DB = []; 

if(r1[c1+"Span"]==0 && r1[c1+"RowSpan"]==0){                             
   for(var ro=r1,a=0;ro&&ro[c1+"RowSpan"]==0;ro=ro.nextSibling,a++);        
   if(this.MainCol || undo){
      for(var rm=r1;rm&&rm[c1+"RowSpan"]==0;rm=rm.previousSibling);         
      if(this.MainCol && rm[c1+"RowSpan"]%1) a += 0.5;                      
      }
   for(var cm=p-1;cm&&r1[S[cm]+"Span"]==0;cm--) r1[S[cm]+"RowSpan"] = a;    
   r1[S[cm]+"RowSpan"] = a;                                                 
   MS.Undo;
   if(undo) {
      for(var co=p+1;co&&r1[S[co]+"Span"]==0;co++);                         
      this.AddUndo({ Type:"SplitAuto",Row:rm,Row2:ro?ro.previousSibling:rm.parentNode.lastChild,Col:S[cm],Col2:S[co-1] }); 
      }
   ME.Undo;
   }
if(nr && nr[c1+"Span"]==0 && nr[c1+"RowSpan"]==0){                    
   for(var rm=nr,a=0;rm&&rm[S[p-1]+"RowSpan"]==0;rm=rm.previousSibling,a++);
   if(this.MainCol&&rm&&rm[S[p-1]+"RowSpan"]%1) a += 0.5;
   for(var cm=p-1;cm&&rm[S[cm]+"Span"]==0;cm--) rm[S[cm]+"RowSpan"] = a;    
   rm[S[cm]+"RowSpan"] = a;                                                 
   
   if(this.MainCol && r2.firstChild) { this.ResetHidden(r2,S[cm],O); this.SetHidden(r2,S[cm],p-cm,O); } 
   MS.Undo;
   if(undo) {
      for(var ro=nr.nextSibling;ro&&ro[c1+"RowSpan"]==0;ro=ro.nextSibling); 
      for(var co=p+1;co&&rm[S[co]+"Span"]==0;co++);                         
      this.AddUndo({ Type:"SplitAuto",Row:rm,Row2:ro?ro.previousSibling:rm.parentNode.lastChild,Col:S[cm],Col2:S[co-1] }); 
      }
   ME.Undo;
   }
if(r1[nc+"Span"]==0 && r1[nc+"RowSpan"]==0){                          
   for(var ro=r1,a=0;ro&&ro[nc+"RowSpan"]==0;ro=ro.nextSibling,a++);        
   if(this.MainCol || undo){
      for(var rm=r1;rm&&rm[nc+"RowSpan"]==0;rm=rm.previousSibling);         
      if(rm[nc+"RowSpan"]%1) a += 0.5;                                      
      }
   for(var co=p+cc;co&&r1[S[co]+"Span"]==0;co++) r1[S[co]+"RowSpan"] = a;   
   MS.Undo;
   if(undo) {
      for(var cm=p+cc-1;cm&&rm[S[cm]+"Span"]==0;cm--);                      
      this.AddUndo({ Type:"SplitAuto",Row:rm,Row2:ro?ro.previousSibling:rm.parentNode.lastChild,Col:S[cm],Col2:S[co-1] }); 
      }
   ME.Undo;
   }
if(nr && nr[nc+"Span"]==0 && nr[nc+"RowSpan"]==0){                    
   for(var rm=nr,a=0;rm&&rm[nc+"RowSpan"]==0;rm=rm.previousSibling,a++);    
   if(this.MainCol&&rm&&rm[nc+"RowSpan"]%1) a += 0.5;                                               
   for(var co=p+cc;co&&rm[S[co]+"Span"]==0;co++) rm[S[co]+"RowSpan"] = a;   
   if(this.MainCol && r2.firstChild || undo) { 
      for(var cm=p+cc-1;cm&&rm[S[cm]+"Span"]==0;cm--);                      
      if(this.MainCol && r2.firstChild){                                    
         if(cm>=p) this.ResetHidden(r2,S[cm],O);                            
         r2[nc+"Span"] = co-p-cc;                                           
         this.SetHidden(r2,nc,co-p-cc,O);                                   
         }
      MS.Undo;
      if(undo) {
         for(var ro=nr.nextSibling;ro&&ro[nc+"RowSpan"]==0;ro=ro.nextSibling);          
         this.AddUndo({ Type:"SplitAuto",Row:rm,Row2:ro?ro.previousSibling:rm.parentNode.lastChild,Col:S[cm],Col2:S[co-1] }); 
         }
      ME.Undo;
      }
   }

for(var i=p;i<p+cc;i++) {
   if(nr && nr[S[i]+"RowSpan"]==0){ 
      if(this.MainCol || undo) for(var rm=nr;rm&&rm[S[i]+"RowSpan"]==0;rm=rm.previousSibling); 
      for(var ro=nr,a=0;ro&&ro[S[i]+"RowSpan"]==0;ro=ro.nextSibling,a++); 
      if(a>mb) { lr = ro; mb = a; } 
      for(var cm=i;cm&&nr[S[cm]+"Span"]==0;cm--); 
      var cs = nr.Spanned ? nr[S[cm]+"Span"] : 1;
      if(this.MainCol && rm[S[cm]+"RowSpan"]%1) a += 0.5;
      for(var j=0;j<cs;j++) nr[S[cm+j]+"RowSpan"] = a; 
      if(!nr.Block||nr.Block<a) nr.Block = a>1.5 ? Math.floor(a) : null;
      MS.Undo;
      if(undo){
         for(var co=i+1;co&&nr[S[co]+"Span"]==0;co++);                         
         this.AddUndo({ Type:"SplitAuto",Row:rm,Row2:ro?ro.previousSibling:rm.parentNode.lastChild,Col:S[cm],Col2:S[co-1] }); 
         }
      ME.Undo;
      
      
      }
   if(r1[S[i]+"RowSpan"]==0){ 
      for(var rm=r1,a=0;rm&&rm[S[i]+"RowSpan"]==0;rm=rm.previousSibling,a++); 
      if(a>ma) { fr = rm; ma = a; }               
      for(var cm=i;cm&&r1[S[cm]+"Span"]==0;cm--); 
      var cs = rm.Spanned ? rm[S[cm]+"Span"] : 1; 
      if(this.MainCol && r1.previousSibling.firstChild) a += 0.5; 
      for(var j=0;j<cs;j++) rm[S[cm+j]+"RowSpan"] = a; 
      this.SetRowBlock(rm);
      MS.Undo;
      if(undo){
         for(var ro=r1.nextSibling;ro&&ro[S[i]+"RowSpan"]==0;ro=ro.nextSibling); 
         for(var co=i+1;co&&r1[S[co]+"Span"]==0;co++);                         
         this.AddUndo({ Type:"SplitAuto",Row:rm,Row2:ro?ro.previousSibling:rm.parentNode.lastChild,Col:S[cm],Col2:S[co-1] }); 
         }
      ME.Undo;
      
      }
   if(r2.firstChild && (r2[S[i]+"RowSpan"]==0||r2==r1) && !plus) this.ResetHidden(r2,S[i],O);
   }

for(var r=r1;r!=nr;r=r.nextSibling){
   if(r[c1+"Span"]==0){ 
      for(var cm=p-1;cm&&r[S[cm]+"Span"]==0;cm--); 
      r[S[cm]+"Span"] = p-cm;
      if(r.firstChild && r.firstChild[S[cm]+"Visible"]==-2) this.SetHidden(r,S[cm],p-cm,O);
      MS.Undo;
      if(undo && r[c1+"RowSpan"]!=0){ 
         for(var ro=r.nextSibling;ro&&ro[c1+"RowSpan"]==0;ro=ro.nextSibling); 
         for(var co=p+1;co<S.length&&r[S[co]+"Span"]==0;co++); 
         this.AddUndo({ Type:"SplitAuto",Row:r,Row2:ro?ro.previousSibling:r.parentNode.lastChild,Col:S[cm],Col2:S[co-1] }); 
         }
      ME.Undo;
      
      }
   if(nc && r[nc+"Span"]==0){ 
      for(var co=p+cc;co<S.length&&r[S[co]+"Span"]==0;co++); 
      r[nc+"Span"] = co-p-cc;
      if(r.firstChild && r.RowSpan || undo){
         for(var cm=p+cc-1;cm&&r[S[cm]+"Span"]==0;cm--); 
         if(r.firstChild && r.RowSpan && r.firstChild[S[cm]+"Visible"]==-2) this.SetHidden(r,nc,co-p-cc,O);
         MS.Undo;
         if(undo && r[nc+"RowSpan"]!=0){ 
            for(var ro=r.nextSibling;ro&&ro[nc+"RowSpan"]==0;ro=ro.nextSibling); 
            this.AddUndo({ Type:"SplitAuto",Row:r,Row2:ro?ro.previousSibling:r.parentNode.lastChild,Col:S[cm],Col2:S[co-1] }); 
            }
         ME.Undo;
         }
      
      }
   var db = this.DynamicBorder; this.DynamicBorder = null;
   if(r.firstChild && (r!=r2||plus)){ 
      for(var n=r.firstChild;n;n=n.nextSibling){
         if(n.RowSpan||n.Spanned){
            for(var j=p;j<p+cc;j++) if(n[S[j]+"RowSpan"]>1||n[S[j]+"Span"]>1) this.SplitSpanned(n,S[j],O);
            }
         }
      if(r.RowSpan) for(var j=p;j<p+cc;j++) if(r[S[j]+"RowSpan"]>1||r[S[j]+"RowSpan"]==0) this.ResetHidden(r,S[j],O);
      }
   this.DynamicBorder = db;
   MS.Undo;
   if(undo && (r.RowSpan || r.Spanned)){
      for(var i=p;i<p+cc;i++) { 
         if(r[S[i]+"Span"]>1 && r[S[i]+"RowSpan"]!=0 || r[S[i]+"RowSpan"]>0 && r[S[i]+"Span"]!=0){
            for(var ro=r.nextSibling;ro&&ro[S[i]+"RowSpan"]==0;ro=ro.nextSibling); 
            for(var co=i+1;co<S.length&&r[S[co]+"Span"]==0;co++); 
            this.AddUndo({ Type:"SplitAuto",Row:r,Row2:ro?ro.previousSibling:r.parentNode.lastChild,Col:S[i],Col2:S[co-1] }); 
            } 
         }
      }
   ME.Undo;
   }

var rev = this.ReversedTree;
for(var r=r1,rc=0;r!=nr;r=r.nextSibling,rc++) { 
   if(r1!=r2 || plus) r.RowSpan = 1; 
   if(c1!=c2 && !r.Spanned) { r.Spanned = 1; this.UpdateSpan(r); }
   for(var i=p;i<p+cc;i++) { r[S[i]+"Span"] = 0; r[S[i]+"RowSpan"] = r==r1?1:0; }
   if(r.Block) this.SetRowBlock(r);
   r[c1+"Span"] = cc;
   if(r.firstChild && (rev ? r!=r1 : r!=r2||plus)) this.SetHidden(r,c1,cc,O);
   }
if(rc>1 || plus) for(var i=p;i<p+cc;i++) { C[S[i]].Spanned = 1; r1[S[i]+"RowSpan"] = rc+plus; }
if(rc>1 && !(r1.Block>rc)) r1.Block = rc;
if(rc>1 || plus) this.RowSpan = 1;
if(cc>1) this.ColSpan = 1;

MS.Undo;
if(undo){
   this.AddUndo({ Type:"Span",Row:r1,Row2:r2,Col:c1,Col2:c2,Plus:plus });
   if(this.CanUndo()+this.CanRedo()*2!=aundo) this.CalculateSpaces(1);
   }
this.UndoEnd();
ME.Undo;
if(r1.Fixed&&this.CPLastSec&&C[c1].MainSec==1) sec = 1;
var spnlen = this.SpannedColsLength;
if(!this.LeftTD && this.MainCol) { this.LeftTD = 1; this.Render(); if(spnlen!=this.SpannedColsLength) this.UpdateHidden(); return; } 
for(var r=fr;r!=lr;r=r.nextSibling) this.RefreshRow(r,sec);
if(spnlen!=this.SpannedColsLength) this.UpdateHidden();

for(var ro in O) this.RefreshRow(O[ro],sec);
for(var r=fr;r!=lr;r=r.nextSibling) this.UpdateRowHeight(r,0,1);
for(var ro in O) this.UpdateRowHeight(O[ro],0,1);
this.UpdateRowHeight(r1,0,1);
if(this.FRow&&this.FCol){
   if(this.FRow.RowSpan&&this.FRow[this.FCol+"RowSpan"]==0) this.FRow = this.GetSpanRow(this.FRow,this.FCol);
   if(this.FRow.Spanned&&this.FRow[this.FCol+"Span"]==0) this.FCol = this.GetSpanCol(this.FRow,this.FCol);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetRowBlock = function(row,U){
var max = 1, C = this.SpanCols;
for(var c in C) if(max<row[c+"RowSpan"]) max = row[c+"RowSpan"];
var blk = max>1.5 ? Math.floor(max) : null;
if(blk==row.Block) return;
if(U) U.push(row.id,"Block",blk,row.Block);
row.Block = blk;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SplitSpanned = function(row,col,R,test){
if(row.Space) return false;

var spn = row.Spanned ? row[col+"Span"] : 1; if(spn==0) { col = this.GetSpanCol(row,col); spn = row[col+"Span"]; }
var rspn = row.RowSpan ? row[col+"RowSpan"] : 1; if(rspn==0) { row = this.GetSpanRow(row,col); rspn = row[col+"RowSpan"]; }
if(rspn==null) rspn = 1;
if(rspn==1 && spn==1) return false;
if(test) return true;
var sec = this.Cols[col].Sec, S = this.ColNames[sec], E = [], p = this.Cols[col].Pos, O = R ? R : {}, lr = null;
if(spn>S.length-p) spn = S.length-p;
for(var r=row,i=1;i<=rspn&&r;r=r.nextSibling,i++) {
   for(var j=0;j<spn;j++) { r[S[j+p]+"RowSpan"] = 1; r[S[j+p]+"Span"] = 1; }
   if(r.firstChild) this.ResetHidden(r,col,O);
   O[r.id] = r; lr = r;
   }
if(row.Block==rspn) this.SetRowBlock(row);
MS.Undo; if(this.Undo && this.DynamicSpan && this.OUndo) this.AddUndo({ Type:R?"SplitAuto":"Split",Row:row,Row2:lr,Col:col,Col2:S[p+spn-1] }); ME.Undo;

if(!R){
   
   for(var ro in O) this.RefreshRow(O[ro],sec);
   this.RefreshRow(row,sec);
   for(var ro in O) this.UpdateRowHeight(O[ro],0,1);
   this.UpdateRowHeight(row,0,1);
   MS.Overlay;
   if(this.Overlay>=2) {
      for(var ro in O) this.UpdateOverlay(O[ro],sec);
      this.UpdateOverlay(row,sec);
      }
   ME.Overlay;
   }
MS.FocusRect; if(this.FocusRect&&row==this.FRow&&col==this.FCol&&!this.FRect) this.Focus(this.FRow,this.FCol,null,[row,col,lr,S[j+p-1]]); ME.FocusRect; 
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSpan = function(F,T){
if(this.Locked["style"]||!this.DynamicSpan) return false;
var S = this.GetARanges(F,1,2,0,1), chg = 0;
for(var i=0;i<S.length;i++) {
   var A = S[i]; if(!((A[0]!=A[2]||A[1]!=A[3]) && (this.GetSpanRow(A[2],A[3])!=A[0]||this.GetSpanCol(A[2],A[3])!=A[1]))) continue;
   chg++;
   if(!T) this.SpanRange(S[i][0],S[i][1],S[i][2],S[i][3]);
   }

if(chg&&!T) {
   this.CalculateSpaces(1);
   this.Update();
   }
return chg;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSplit = function(F,T){
if(this.Locked["style"]||!this.DynamicSpan) return false;
var S = this.GetARanges(F), chg = 0;
for(var i=0;i<S.length;i++) {
   for(var r=S[i][0],n=this.GetNext(S[i][2]),cc=this.GetNextCol(S[i][3]);r!=n;r=this.GetNext(r)) if(r.RowSpan||r.Spanned){
      for(var c=S[i][1];c!=cc;c=this.GetNextCol(c)) if((r.RowSpan && (r[c+"RowSpan"]==0||r[c+"RowSpan"]>1) || r.Spanned && r[c+"Span"]!=1) && this.SplitSpanned(r,c,null,T)) chg++;
      }
   }
if(S.Rows) {
   var C = this.Cols;
   for(var id in S.Rows) {
      var r = S.Rows[id]; if(!r.RowSpan&&!r.Spanned) continue;
      for(var c in C) if((r.RowSpan && (r[c+"RowSpan"]==0||r[c+"RowSpan"]>1) || r.Spanned && r[c+"Span"]!=1) && this.SplitSpanned(r,c,null,T)) chg++;
      }
   }
if(S.Cols){
   var R = this.Rows;
   for(var c in S.Cols){
      for(var id in R) { var r = R[id]; if((r.RowSpan && (r[c+"RowSpan"]==0||r[c+"RowSpan"]>1) || r.Spanned && r[c+"Span"]!=1) && this.SplitSpanned(r,c,null,T)) chg++; }
      }
   }
if(chg&&!T) {
   this.CalculateSpaces(1);
   this.Update();
   }
return chg;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSpanSelected = function(F,T){ return this.ActionSpan(F?F|2:2,T); }
TGP.ActionSpanCells = function(F,T){ return this.ActionSpan(F?F|1:1,T); }
TGP.ActionSplitCell = function(F,T){ return this.ActionSplit(F,T); }
TGP.ActionSplitSelected = function(F,T){ return this.ActionSplit(F?F|2:2,T); }
TGP.ActionSplitCells = function(F,T){ return this.ActionSplit(F?F|1:1,T); }
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
TGP.ActionAutoSpan = function(F,T,type){
var A = this.GetACell(F?F|64:64); if(!A) return false;
var row = A[0], col = A[1];
if(!this.DynamicSpan || !row || !col || F&&this.FRect&&(this.FRect[0]!=this.FRect[2]||this.FRect[1]!=this.FRect[3]) || row.Space || type&1&&!this.Cols[col].Spanned || type&2&&!row.Spanned ||this.Locked["style"]) return false;
return this.AutoSpanCell(row,col,type?type:3,T);
}
TGP.ActionAutoRowSpan = function(F,T){ return this.ActionAutoSpan(F,T,1); }
TGP.ActionAutoColSpan = function(F,T){ return this.ActionAutoSpan(F,T,2); }
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
TGP.AutoSpanCell = function(row,col,type,test){
if(!row||!col||row.Space||this.Locked["style"]) return false;
if(type==null) type = this.AutoSpan&3; if(!type) return false;
var lc = this.GetLastSpanCol(row,col); col = this.GetSpanCol(row,col);
var lr = this.GetLastSpanRow(row,col); row = this.GetSpanRow(row,col);

var A = [], I = this.Img; this.GetRowHTML(row,A,4,col);
var O = this.SpanCellTag;
if(!O){
   O = document.createElement("div");
   this.AppendTag(O);
   O.style.position = "absolute";
   O.style.visibility = "hidden";
   O.style.left = "10px";
   
   O.style.top = "-100px";
   O.style.whiteSpace = "nowrap";
   this.SpanCellTag = O;
   }
O.innerHTML = "<div class='"+A[1]+"'>"+A[0]+"</div>";
var W = O.offsetWidth, H = O.offsetHeight, c = col, r = row;

if(type&2){
   while(c){
      W -= this.Cols[c].Width;
      if(W<=0) break;
      c = this.GetNextCol(c);
      if(!c && this.AutoColPages){ c = this.GetLastCol(); this.AddAutoColPages(); c = this.GetNextCol(c); }
      }
   if(!c) c = this.GetLastCol();
   }
if(type&1){
   var hh = this.RowHeight, act = this.AutoSpan&32;
   while(r){
      if(r.Visible) { 
         if(act) H -= this.GetRowHeight(r); 
         else { var h = row.Height; if(h==null) h = row.Def.Height; if(h==null) h = hh; H -= h; }
         if(H<=0) break; 
         }
      if(r.firstChild){
         H -= this.GetPageHeight(row,!act);
         if(H<=0) { r = r.lastChild; break; }
         }
      r = this.GetNextSiblingVisible(r);
      if(!r&&this.AutoPages&&!row.Fixed) { r = this.XB.lastChild.lastChild; this.AddAutoPages(); r = this.GetNextSibling(r); }
      }
   if(!r) r = this.GetLast(row.Fixed?row.parentNode:null);
   }
if(r==lr&&c==lc) return false;
if(r==row&&c==col) { 
   if(lc!=col|lr!=row) {
      if(!test) this.SplitSpanned(row,col);
      return true;
      }
   return false;
   }
if(this.AutoSpan&16){
   var C = [col];
   if(c!=col) for(var zc=c,c=this.GetNextCol(col);c;c=this.GetNextCol(c)) { 
      if(Get(row,c)) { c = C[C.length-1]; break; }
      C[C.length] = c;
      if(c==zc) break;
      }
   if(r!=row) for(var zr=r,r=this.GetNextVisible(row);r;r=this.GetNextVisible(r)){
      for(var i=0;i<C.length;i++){ var cc = C[i]; if(Get(r,cc)) { r = this.GetPrevVisible(r); while(r.Level>row.Level) r = r.parentNode; zr = r; break; } }
      if(r==zr) break;
      }
   }
if(r==lr&&c==lc) return false;
if(r==row&&c==col) { 
   if(lc!=col|lr!=row) {
      if(!test) this.SplitSpanned(row,col);
      return true;
      }
   return false;
   }
if(test) return true;
this.UndoStart();
if(lc!=col|lr!=row) this.SplitSpanned(row,col);
this.SpanRange(row,col,r,c);
this.UndoEnd();
this.Update();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.AutoSpanAllCells = function(type){
if(type==null) type = this.AutoSpan&3; if(!type) return false;
var C = []; for(var c=this.GetFirstCol();c;c=this.GetNextCol(c)) if(!this.Cols[c].NoData) C[C.length] = c;
for(var r=this.GetFirstVisible();r;r=this.GetNextVisible(r)) if(!r.NoData){
   for(var i=0;i<C.length;i++){
      var c = C[i];
      if(r.Spanned&&r[c+"Span"]==0||r.RowSpan&&r[c+"RowSpan"]==0) continue;
      this.AutoSpanCell(r,c,type);
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
ME.DynSpan;
ME.ColSpan$RowSpan;

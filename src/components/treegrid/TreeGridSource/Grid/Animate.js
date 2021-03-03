MS.Animate;
// -----------------------------------------------------------------------------------------------------------
TGP.AnimClearChildren = function(row){
for(var r=row.firstChild;r;r=r.nextSibling) {
   if(r.Animating) this.AnimRow(r);
   if(r.firstChild&&r.Expanded&&r.Hasch&&r.r1) this.AnimClearChildren(r);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.AnimGetChildren = function(row,A){
for(var r=row.firstChild;r;r=r.nextSibling)if(r.Visible&&r.r1) {
   A[A.length] = r;
   if(r.firstChild&&r.Expanded&&r.Hasch&&r.r1) this.AnimGetChildren(r,A);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.AnimRow = function(row,anim,animch,func,param,paramch,wait,clrdisp){
if((this.InFinishAnimations||this.InClearAnimRow)&&(anim||animch)){ 
   if(func) func();
   return;
   }
if(clrdisp==null){
   if(!this.AnimateRows || this.SuppressAnimations || BIEA&&!BIEA10) { if(func) func(); return false; }
   if(animch>0) animch = anim+"Children";
   if(animch && !row.Expanded && animch!="CollapseChildren" && animch!="CollapsedChildren") animch = "";
   if(anim && this.Animations[anim]==null && anim.indexOf("Rows")>0) anim = anim.replace("Rows",""); 
   if(anim && this.Animations[anim]==null && anim.indexOf("Filter")>0) anim = anim.replace("Filter",""); 
   if(anim && this.Animations[anim]==null && anim.indexOf("Visible")>0) anim = anim.replace("Visible","");
   if(animch && this.Animations[animch]==null && (animch+"").indexOf("Children")>0) animch = anim;
   var ar = this.AnimateRows>1||!BIEA ? this.Animations[anim] : null, ac = row.Hasch && row.firstChild ? this.Animations[animch] : null;
   if(animch<0) ac = -1;
   if(!ar&&!ac&&(anim||animch)) { if(func) func(); return false; } 
   }
else { ar = anim; ac = animch; }
if(!row) return true; 
var T = this, next = this.ReversedTree ? "previousSibling" : "nextSibling";

if(row.Animating>3 && (wait<2 || wait>20)){ ClearTimeout(row.Animating-4); row.Animating = null; wait = 0; } 
if(!row.r1){ 
   if(!wait) { if(func) func(); return false; }
   row.Animating = 4 + SetTimeout(function(){ T.AnimRow(row,anim,animch,func,param,paramch,wait+1); },100);
   return -1;
   }

this.InClearAnimRow = 1;
if(row.Animating>3) row.Animating = null; 
else for(var k=0;row.Animating&&k<5;k++) { 
   for(var i=this.FirstSec;i<=this.LastSec;i++) if(row["r"+i]) {
      var r = row["r"+i];
      if(row.Animating&2) { var n = r.animating; if(n) n = n.parentNode.parentNode; else n = r; Animate(n[next].firstChild.firstChild); }
      if(row.Animating&1) { var r = row["r"+i], n = r.animating; Animate(n?n:r); }
      if(r.animating) delete r.animating;
      }
   }
if(row.Animating) this.FinishAnimations(); 
if(row.AnimatingCells) for(var col in row.AnimatingCells) this.AnimCell(row,col); 
if(ac && !(ac-0) && this.AnimatingRow) this.AnimClearChildren(row);       
this.InClearAnimRow = 0;

if(!ar&&!ac) { if(func) func(); return false; } 
var inundo = this.Undo && !this.OUndo;

function end(r,p,n,clrh,func,param,dummy){ 
   T.AnimatingRow--; 
   if(p) p.style.display = "none";
   if(n) n.style.display = "none";
   if(clrh) r.style.height = ""; 
   if(inundo) { var OU = T.OUndo; T.OUndo = null; }
   if(!(--cnt)) { 
      row.Animating = null; 
      if(clr) T.ColorRow(row); 
      if(CH) for(var j=0;j<CH.length;j++) T.ColorRow(CH[j]);
      if(func) func(param); 
      } 
   if(!T.AnimatingRow) { T.UpdateRowHeight(row); T.UpdateHeights(-1,1); T.Update(); }
   if(inundo) T.OUndo = OU;
   }

function endie(r,n,nd,noh,func,param,forced){ 
   if(!forced&&!noh&&nd.offsetHeight<2) r.style.display = "none"; 
   n.parentNode.replaceChild(r,n); 
   delete r.animating;
   end(r,clrdisp&1?r:null,clrdisp&2&&ac<0?r[next]:null,0,func,param,forced);
   }

var cnt = 1, clr = 0, CH = null; 
if(ar&&(ar+"").charAt(0)=="@"){ ar = ar.slice(ar.charAt(1)==","?2:1); clr = 1; } 
if(ac&&(ac+"").charAt(0)=="@"){ 
   ac = ac.slice(ac.charAt(1)==","?2:1); 
   CH = []; this.AnimGetChildren(row,CH); 
   if(this.AnimateRowsColorMax<0) { if(CH.length > -this.AnimateRowsColorMax) CH = null; }
   else if(CH.length > this.AnimateRowsColorMax) CH.length = this.AnimateRowsColorMax;
   }
row.Animating = (ar?1:0)+(ac?2:0);
if(paramch-0) paramch = param;

var disp = 0;
if(clrdisp==null){
   disp = (ar&&row.r1.style.display=="none"?1:0)+(ac&&row.r1[next].style.display=="none"?2:0); 
   if(disp&1) ar = "10,"+ar; 
   if(disp&2 && !(ac-0)) ac = "10,"+ac;
   clrdisp = disp;
   }

for(var i=this.FirstSec;i<=this.LastSec;i++) if(row["r"+i]) {

   if(ac && !(ac<0)){ 
      var r = row["r"+i][next].firstChild.firstChild; 
      if(r){
         if(disp&2) row["r"+i][next].style.display = "";
         if(CH) for(var j=0;j<CH.length;j++) for(var c=CH[j]["r"+i].firstChild;c;c=c.nextSibling) c.style.backgroundColor = "";
         r.style.height = r.scrollHeight+"px";
         this.AnimatingRow++; cnt++;
         Animate(r,ac,paramch,end.bind(null,r,clrdisp&2?row["r"+i][next]:null,null,1,func));
         }
      }

   if(ar){ 
      var r = row["r"+i]; 
      if(r) {
         if(disp&1) r.style.display = "";
         if(clr) for(var c=r.firstChild;c;c=c.nextSibling) c.style.backgroundColor = "";

         if(BIEA||this.AnimateRows>2){ 
            var n = document.createElement("tr"), nt = document.createElement("td"), nd = document.createElement("div");
            n.appendChild(nt); nt.appendChild(nd);
            nt.colSpan = r.parentNode.firstChild.childNodes.length;
            r.parentNode.insertBefore(n,r);
            var tt = document.createElement("table"), tb = document.createElement("tbody");
            tt.appendChild(tb);
            tt.cellPadding = 0; tt.cellSpacing = 0;
            var ow = r.parentNode.firstChild.cloneNode(1);
            tb.appendChild(ow);
            tb.appendChild(r);
            tt.className = this.Img.Style + "Section";
            nd.appendChild(tt);
            nd.style.height = nd.scrollHeight+"px";
            this.AnimatingRow++; cnt++;
            Animate(nd,ar,param,endie.bind(null,r,n,nd,r.offsetHeight<2,func));
            r.animating = nd;
            }

         else { 
            r.style.height = r.scrollHeight+"px";
            this.AnimatingRow++; cnt++;
            Animate(r,ar,param,end.bind(null,r,clrdisp&1?r:null,clrdisp&2&&ac<0?r[next]:null,0,func));
            }
         }
      }
   }
if(!(--cnt)){ row.Animating = null; if(func) func(); return false; } 
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.AnimateRow = function(row,anim,animch,func){
if(row&&row.length&&!row.id) return this.AnimRows(row,anim,animch,func);
else return this.AnimRow(row,anim,animch,func);
}
// -----------------------------------------------------------------------------------------------------------
TGP.AnimRows = function(A){
if(!this.AnimateRows || this.SuppressAnimations || !A || BIEA&&!BIEA10) return false;
if(!A.length){ if(typeof(A)=="object") A = [A]; else return false; }  
if(arguments[1]&&typeof(arguments[1])=="object") { A = [A]; for(var i=1;i<arguments.length;i++) A[i] = arguments[i]; }  
else if(arguments.length>1) A = [[A,arguments[1],arguments[2],arguments[3],arguments[4],arguments[5],arguments[6]]];    
else if(A.length>1&&(!A[1]||typeof(A[1])!="object")) A = [A];         

var B = []; 
var Cnt = []; function Call(Cnt,pos,F){ if(!--Cnt[pos]) F(); } 
for(var i=0,len=0;i<A.length;i++) if(A[i]&&A[i][0]){
   var P = A[i], anim = P[1], animch = P[2], F = P[3];
   if(animch>0) animch = anim+"Children";
   if(anim && this.Animations[anim]==null && anim.indexOf("Rows")>0) anim = anim.replace("Rows",""); 
   if(anim && this.Animations[anim]==null && anim.indexOf("Filter")>0) anim = anim.replace("Filter",""); 
   if(anim && this.Animations[anim]==null && anim.indexOf("Visible")>0) anim = anim.replace("Visible","");
   if(animch && this.Animations[animch]==null && (animch+"").indexOf("Children")>0) animch = anim;
   var ar = this.AnimateRows>1||!BIEA ? this.Animations[anim] : null, ac = this.Animations[animch];
   if(animch<0) ac = -1;
   if(!ar&&!ac&&(anim||animch)) { if(F) F(); continue; }
   var r = P[0];
   if(!r.length||r.id) {  
      if(r.r1) B[B.length] = [r,ar,r.Hasch&&r.firstChild?ac:null,F,P[4],P[5],P[6],0]; 
      else if(F) F();
      }
   else { 
      for(var j=0,pos=B.length;j<r.length;j++) if(r[j].r1) B[B.length] = [r[j],ar,r[j].Hasch&&r[j].firstChild?ac:null,null,P[4],P[5],P[6],0]; 
      if(F&&pos!=B.length){
         var FF = Call.bind(null,Cnt,Cnt.length,F);
         Cnt[Cnt.length] = B.length-pos;
         for(var j=pos;j<B.length;j++) B[j][3] = FF;
         }
      else if(F) F();
      }
   }

var max = this.AnimateRowsMax; if(max<0) max = -max; 
if(max && max<B.length){
   var C = {}; A = this.GetShownRows(0,2); 
   for(var i=0;i<A.length;i++) C[A[i].id] = 1;
   A = B; B = [];
   for(var i=0;i<A.length;i++) if(C[A[i][0].id]||A[i][3]) B[B.length] = A[i]; 
   if(B.length>max) {
      if(this.AnimateRowsMax<0) max = 0;
      for(var mm=B.length-max,i=0;i<mm;i++) if(B[i][3]) B[i][3](); 
      if(!max) return false;
      B.splice(0,mm);
      }
   }

var next = this.ReversedTree ? "previousSibling" : "nextSibling";
for(var i=0;i<B.length;i++) {
   var row = B[i][0]; 
   var disp = (B[i][1] && row.r1.style.display=="none" ? 1 : 0) + (B[i][2] && row.r1[next].style.display=="none" ? 2 : 0)  
   if(!disp) continue;
   for(var j=this.FirstSec;j<=this.LastSec;j++) if(row["r"+j]) {
      if(disp&1) row["r"+j].style.display = ""; 
      if(disp&2) row["r"+j][next].style.display = "";
      }
   if(disp&1) B[i][1] = (B[i][1]+"").charAt("0")=="@" ? "@10,"+B[i][1].slice(1) : "10,"+B[i][1];
   if(disp&2 && !(B[i][2]-0)) B[i][2] = (B[i][2]+"").charAt(0)=="@" ? "@10,"+B[i][2].slice(1) : "10,"+B[i][2];
   B[i][7] = disp;
   }

for(var i=0;i<B.length;i++) this.AnimRow.apply(this,B[i]); 
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.AnimCell = function(row,col,anim,func,param,wait,type,show){
if(!this.AnimateCells || this.SuppressAnimations || BIEA&&!BIEA10 || row.RowSpan&&row[col+"RowSpan"]==0 || row.Spanned&&row[col+"Span"]==0) { if(func) func(); return; }
var ac = this.Animations[anim];
if(type){
   var typ = this.GetType(row,col), kind = row.Space ? "Space" : row.Kind, A = this.Animations, ac = null, Q = [kind+typ,kind,typ,""]; 
   for(var i=0;i<Q.length;i++) if(ac==null && A[anim+Q[i]]!=null) { ac = this.Animations[anim+Q[i]]; break; }
   }
if(!ac&&anim) { if(func) func(); return; } 
var T = this;

if(row.Animating>3 && (wait<2 || wait>20)){ ClearTimeout(row.Animating-4); row.Animating = null; wait = 0; } 
if(!row.r1){ 
   if(!wait) { if(func) func(); return; }
   row.Animating = 4 + SetTimeout(function(){ T.AnimCell(row,col,anim,func,param,wait+1,type,show); },100);
   return;
   }

if(row.Animating>3) row.Animating = null;     
else if(row.Animating) this.AnimRow(row);     

var Anim = Animate;
if(this.AnimateCells>1){ 
   Anim = function(D,A,P,func,param,noclr){
      if(D.className.indexOf("NoLeft")>=0) Animate(D.previousSibling,A?A[1]:null,P,null,param,noclr);
      if(D.className.indexOf("NoRight")>=0) Animate(D.nextSibling,A?A[2]:null,P,null,param,noclr);
      Animate(D,A?A[0]:null,P,func,param,noclr);
      }
   ac = [ac]; 
   ac[1] = this.Animations[anim+"Left"]; if(ac[1]==null) ac[1] = ac[0];
   ac[2] = this.Animations[anim+"Right"]; if(ac[2]==null) ac[2] = ac[0];
   }

var oac = row.AnimatingCells && row.AnimatingCells[col], cell = null;
for(var k=0;oac&&k<5;k++){                         
   cell = this.GetCell(row,col); if(!cell) break;  
   Anim(cell);                                     
   oac = row.AnimatingCells && row.AnimatingCells[col];
   }
if(oac) row.AnimatingCells[col]();                 
if(ac && !cell) cell = this.GetCell(row,col);
if(!cell||!ac||this.AnimatingRow>this.AnimateCellsMax){ 
   if(func) func(); return;
   }

var W = null;
if(!cell.offsetWidth) { 
   if(!show) { if(func) func(); return; }
   var C = this.Cols[col];
   W = cell.parentNode.parentNode.firstChild.cells[this.CPLastSec&&C.MainSec==1?C.FPos:C.VPos];
   W.style.width = C.Width+"px";
   
   }

if(!row.AnimatingCells) row.AnimatingCells = {};
row.AnimatingCells[col] = end;

function end(){
   if(!row.AnimatingCells||!row.AnimatingCells[col]) return; 
   T.AnimatingRow--;
   
   delete row.AnimatingCells[col];
   for(var c in row.AnimatingCells) break; if(!c) delete row.AnimatingCells; 
   
   if(W) W.style.width = "0px";
   if(func) func();
   }

this.AnimatingRow++;
Anim(cell,ac,param,end);
}
// -----------------------------------------------------------------------------------------------------------
TGP.AnimateCell = function(row,col,anim,func){ return this.AnimCell(row,col,anim,func); }
// -----------------------------------------------------------------------------------------------------------
TGP.AnimCol = function(col,anim,func,param,wait,type,show){
if(!this.AnimateCols || this.SuppressAnimations || BIEA&&!BIEA10) { if(func) func(); return; }
if(anim && this.Animations[anim]==null && anim.indexOf("Cols")>0) anim = anim.replace("Cols","Col"); 
if(anim && this.Animations[anim]==null && anim.indexOf("Visible")>0) anim = anim.replace("Visible","");
if(anim && !this.Animations[anim]) { if(func) func(); return; } 
var R = this.GetShownRows(0,1);
for(var r=this.XH.firstChild;r;r=r.nextSibling) if(r.r1&&r.Visible) R[R.length] = r;
for(var r=this.XF.firstChild;r;r=r.nextSibling) if(r.r1&&r.Visible) R[R.length] = r;
if(!R.length) { if(func) func(); return; }
function end(){ if(func&&!(--cnt)) func(); }; 
var zal = this.AnimateCells; this.AnimateCells = this.AnimateCols;
for(var i=0,cnt=1;i<R.length;i++) if(!R[i].Spanned||R[i][col+"Span"]==1) { cnt++; this.AnimCell(R[i],col,anim,end,param,wait,type,show); }
this.AnimateCells = zal;
if(!(--cnt) && func) func();
}
// -----------------------------------------------------------------------------------------------------------
TGP.AnimCols = function(A){
if(!this.AnimateCols || this.SuppressAnimations || !A || BIEA&&!BIEA10) return false;
if(typeof(A)=="string") A = [A]; 
if(arguments[1]&&typeof(arguments[1])=="object") { A = [A]; for(var i=1;i<arguments.length;i++) A[i] = arguments[i]; }  
else if(arguments.length>1) A = [[A,arguments[1],arguments[2],arguments[3],arguments[4],arguments[5],arguments[6]]];    
else if(A.length>1&&(!A[1]||typeof(A[1])!="object")) A = [A];         

var B = []; 
var Cnt = []; function Call(Cnt,pos,F){ if(!--Cnt[pos]) F(); } 
for(var i=0,len=0;i<A.length;i++) if(A[i]&&A[i][0]){
   var P = A[i], anim = P[1], F = P[2];
   if(anim && this.Animations[anim]==null && anim.indexOf("Cols")>0) anim = anim.replace("Cols","Col"); 
   if(anim && this.Animations[anim]==null && anim.indexOf("Visible")>0) anim = anim.replace("Visible","");
   if(anim && !this.Animations[anim]) { if(F) F(); continue; } 
   var c = P[0];
   if(typeof(c)=="string") B[B.length] = [c,anim,F,P[3],P[4],P[5],P[6]];  
   else if(c.length){ 
      for(var j=0,pos=B.length;j<c.length;j++) B[B.length] = [c[j],anim,F,P[3],P[4],P[5],P[6]]; 
      if(F&&pos!=B.length){
         var FF = Call.bind(null,Cnt,Cnt.length,F);
         Cnt[Cnt.length] = B.length-pos;
         for(var j=pos;j<B.length;j++) B[j][2] = FF;
         }
      else if(F) F();
      }
   }

var max = this.AnimateColsMax; if(max<0) max = -max; 
if(max && max<B.length){
   var C = {}; A = this.GetShownCols(1,1).concat(this.GetShownCols(0,1),this.GetShownCols(2,1));
   for(var i=0;i<A.length;i++) C[A[i]] = 1;
   A = B; B = [];
   for(var i=0;i<A.length;i++) if(C[A[i][0]]||A[i][2]) B[B.length] = A[i];  
   if(B.length>max) {
      if(this.AnimateColsMax<0) max = 0;
      for(var mm=B.length-max,i=0;i<mm;i++) if(B[i][2]) B[i][2](); 
      if(!max) return false;
      B.splice(0,mm);
      }
   }

for(var i=0;i<B.length;i++) this.AnimCol.apply(this,B[i]); 
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.AnimateCol = function(col,anim,func){
if(!col) return;
if(typeof(col)=="object" && col[0] && typeof(col[0])=="object") this.AnimCols(col,anim,func);
else this.AnimCol(col,anim,func);
}
// -----------------------------------------------------------------------------------------------------------
TGP.FinishAnimations = function(row){
if(!this.AnimatingRow) return;
if(!row) { 
   if(this.InFinishAnimations) return; 
   this.InFinishAnimations = 1;
   for(var r=this.XB.firstChild;r;r=r.nextSibling) this.FinishAnimations(r);
   this.FinishAnimations(this.XH);
   this.FinishAnimations(this.XF);
   this.FinishAnimations(this.XS);
   if(this.AnimatingRow) { 
      info("FinishAnimations "+this.AnimatingRow+" error!!!");
      this.AnimatingRow = 0; this.Update(); 
      } 
   this.InFinishAnimations = 0;
   return;
   }
for(var r=row.firstChild;r;r=r.nextSibling){
   if(r.Animating||r.AnimatingCells) this.AnimRow(r);
   if(r.Animating) { 
      info("Animating "+r.id+" clear error!!!");
      r.Animating = null; 
      }
   if(r.AnimatingCells) { 
      info("AnimatingCells "+r.id+" clear error!!!");
      r.AnimatingCells = null;
      }
   if(!this.AnimatingRow) return;
   if(r.firstChild) this.FinishAnimations(r);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.IsAnimatingRow = function(row){
if(!row) { 
   for(var r=this.XB.firstChild;r;r=r.nextSibling) if(this.IsAnimatingRow(r)) return true;;
   if(this.IsAnimatingRow(this.XH)) return true;
   if(this.IsAnimatingRow(this.XF)) return true;
   if(this.IsAnimatingRow(this.XS)) return true;
   return false;
   }
for(var r=row.firstChild;r;r=r.nextSibling){
   if(r.Animating) return true;
   if(r.firstChild && this.IsAnimatingRow(r)) return true;
   }
}
// -----------------------------------------------------------------------------------------------------------
ME.Animate;

// -----------------------------------------------------------------------------------------------------------
TGP.RefreshCellAnimate = function(row,col,anim,updh){
MS.Animate;
if(!this.AnimateCells || this.SuppressAnimations || anim==="") { 
   this.RefreshCell(row,col); 
   
   MS.DynSpan; if(this.AutoSpan&3) this.AutoSpanCell(row,col); ME.DynSpan;
   if(updh) this.UpdateRowHeight(row,1); 
   return; 
   }
var animfrom = null, animto = null, sel = 0; 
if(!anim) anim = "Change"; else if(anim.indexOf("Cells")>=0) { anim = anim.replace("Cells",""); sel = 1; }
var typ = this.GetType(row,col), kind = row.Space ? "Space" : row.Kind, A = this.Animations;
var Q = sel?["Cells"+kind+typ,"Cells"+kind,"Cells"+typ,"Cells",kind+typ,kind,typ,""]:[kind+typ,kind,typ,""]; 
for(var i=0;i<Q.length;i++){
   if(animfrom==null && A[anim+Q[i]+"From"]!=null) animfrom = anim+Q[i]+"From";
   if(animto==null && A[anim+Q[i]+"To"]!=null) animto = anim+Q[i]+"To";
   }
if(this.Animations[animfrom]) {
   var T = this;
   var noundo = this.OUndo ? 0 : 1;
   function end(){ 
      T.RefreshCell(row,col,null,noundo); 
      MS.DynSpan; if(T.AutoSpan&3) T.AutoSpanCell(row,col); ME.DynSpan;
      
      if(updh) T.UpdateRowHeight(row,1,null,updh==3); 
      T.AnimCell(row,col,animto); 
      }
   this.AnimCell(row,col,animfrom,end);
   return;
   }
ME.Animate;
this.RefreshCell(row,col); 
MS.DynSpan;if(this.AutoSpan&3) this.AutoSpanCell(row,col); ME.DynSpan;

if(updh) this.UpdateRowHeight(row,1);
MS.Animate; if(this.Animations[animto]) this.AnimCell(row,col,animto); ME.Animate;
return false;
}
// -----------------------------------------------------------------------------------------------------------

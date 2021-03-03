// -----------------------------------------------------------------------------------------------------------
// Updates level img of all rows, including collapsed, but not deleted
// If show==true, shows changes
TGP.UpdateAllLevelImg = function(show,all){
MS.Tree;
if(!this.MainCol) return;

var next = this.ReversedTree ? "previousSibling" : "nextSibling";
for(var r=this.ReversedTree?this.XB.lastChild:this.XB.firstChild;r;r=r[next]){ r.Level=-1; this.UpdateChildrenLevelImg(r,show,all); } 
ME.Tree;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateChildrenLevel = function(row){
var lev = row.Level+1; if(!row.Visible&&row.Expanded&2) lev--;
for(var r=row.firstChild;r;r=r.nextSibling){
   if(r.Level != lev){
      r.Level = lev;
      if(r.firstChild) this.UpdateChildrenLevel(r);
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
// Updates image level according to parent row
// If show==true, shows changes
MS.Tree;
TGP.UpdateChildrenLevelImg = function(row,show,all){
var r = row.firstChild, lev = row.Level + (row.Expanded&2 ? 0 : 1);
if(!r) return;

if(this.ReversedTree) { var next = "previousSibling", first = "lastChild"; r = row[first]; }
else { var next = "nextSibling", first = "firstChild"; }
while(1){
   var chalways = all;
   if(r.Level != lev) {
      r.Level = lev;
      chalways = 1;
      }
   for(var n=r[next];n&&!n.Visible&&!(n.Expanded&2);n=n[next]) if(chalways || n.Level!=lev){ 
      n.Level = lev;
      n.LevelImg = 1;
      if(n[first]) this.UpdateChildrenLevelImg(n,show,chalways);
      } 
   if(!n) { 
      var li = row.Page && r.parentNode[next] ? 1 : 0;
      if(row.Expanded&2) { 
         var p = row; 
         while(!p[next]&&!p.Page&&p.Expanded&2) p = p.parentNode;
         if(p.Expanded&2&&p[next]&&(p[next].Visible||p[next].Expanded&2&&p[next].Count||(this.ReversedTree?this.GetPrevSiblingVisible(p[next]):this.GetNextSiblingVisible(p[next])))) li = 1;
         }
      if(r.Expanded&2){ 
         n = r[first];
         while(n&&!n.Visible) {
            if(n.Expanded&2) n = n[first];
            else {
               while(!n[next]&&n.parentNode!=r) n = n.parentNode;
               n = n[next]; 
               }
            }
         if(n) li = 1;
         }
      if(r.LevelImg != li){ r.LevelImg = li; chalways = 1; }
      if(chalways && show) this.UpdateIcon(r);
      if(r[first]) this.UpdateChildrenLevelImg(r,show,chalways);
      break; 
      }
   if(r.LevelImg != 1){ r.LevelImg = 1; chalways = 1; }
   if(chalways && show) this.UpdateIcon(r);
   if(r[first]) this.UpdateChildrenLevelImg(r,show,chalways);
   
   r = n;
   }
}
ME.Tree;
// -----------------------------------------------------------------------------------------------------------
// Updates image level according to parent row
// If show==true, shows changes
TGP.UpdateLevelImg = function(row, show){
MS.Tree;
if(!this.MainCol) return;

var next = this.ReversedTree ? "previousSibling" : "nextSibling", r = row[next];
while(r&&!r.Visible) {
   if(r.Expanded&2) r = this.ReversedTree ? r.lastChild : r.firstChild;
   else {
      while(!r[next]&&r.parentNode!=row.parentNode) r = r.parentNode;
      r = r[next]; 
      }
   }
if(!r && (this.Paging && row.parentNode.Page || row.Expanded&2 || row.parentNode.Expanded&2)){ 
   r = this.ReversedTree ? this.GetPrevSiblingVisible(row) : this.GetNextSiblingVisible(row);
   if(!r && (row.parentNode.Page||row.parentNode.Expanded&2) && row.parentNode[next] && row.parentNode[next].Count) r = row; 
   }

row.LevelImg = r ? 1 : 0;
row.Level = row.parentNode.Level+(row.parentNode.Expanded&2 ? 0 : 1);

if(show) this.UpdateIcon(row);
ME.Tree;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateHeaderLevels = function(){
if(this.HideTree) return;
var F = this.GetFixedRows(), mc = this.MainCol;
for(var i=0;i<F.length;i++) if(F[i][mc+"ALevels"]) this.RefreshCell(F[i],mc);
}
// -----------------------------------------------------------------------------------------------------------
// Sets row's icon , if drag>=0 shows given drag icon
TGP.UpdateIcon = function(row,drag){
MS.Tree;
var col = this.MainCol, C = this.Cols[col];
if(this.MainTable==null || !C || !C.Visible && !C.Hidden || !row || row.Fixed || this.HideTree || row[col+"Visible"]<0 || row.Spanned && row[col+"Span"]==0) return;
for(var B=row;B&&B!=this.XB;B=B.parentNode); if(!B) return; 
var cell = this.GetCell(row,col), tree = this.GetMainIconHTML(row,this.GetVertAlign(row,col),drag);
if(cell) { 
   if(this.SpannedTree){
      cell = cell.lastChild.firstChild.firstChild.firstChild;
      if(BChrome) cell = cell.firstChild;
      cell.innerHTML = tree[1];
      if(this.NoTreeLines||this.Rtl) {
         if(this.HideRootTree && !row.Level){ cell.style.width = ""; cell.innerHTML = ""; }
         else {
            var lw = this.Img.Line, tw = this.Img.Tree; 
            if(this.SpannedTree){ if(row.TreeWidthL!=null) lw = row.TreeWidthL; if(row.TreeWidthT!=null) tw = row.TreeWidthT; }
            cell.style.width = ((row.Level+(this.HideRootTree?-1:0))*lw+tw)+"px";
            }
         }
      return;
      }
   cell = cell.previousSibling; var reg = /NoRight.*/, rep = "NoRight "; 
   cell.className = cell.className.replace(reg,rep+tree[0]);
   cell.innerHTML = tree[1];

   }
ME.Tree;
}
// -----------------------------------------------------------------------------------------------------------
// Updates icons of rows before the row, after row changed
TGP.UpdateRowIcons = function(row,show,always){
MS.Tree;
if(!this.MainCol || row.Fixed || this.HideTree) return;
this.UpdateLevelImg(row);
if(row.LevelImg&&!always) return; 

var r = this.ReversedTree ? this.GetNextSiblingVisible(row) : this.GetPrevSiblingVisible(row);
if(!r){ 
   var par = row.parentNode;
   if(this.MainTable && show && !par.Page) this.UpdateIcon(par);
   }
else { 
   r.LevelImg = row.Visible?1:0; 
   if(show && this.MainTable) for(var lev=row.Level;r && r.Level>=lev;r = this.ReversedTree ? this.GetPrevVisible(r) : this.GetNextVisible(r)) this.UpdateIcon(r);
   }
ME.Tree;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateRowHeight = function(row,complete,always,noundo){
MS.VarHeight;
if(!row.r1 || row.Space || this.LastSec==this.FirstSec&&!complete&&!always) {
   if(row==this.Header) this.UpdatePagerHeaderHeight();
   return;
   }

var h = row.Height; if(!h) h = row.Def.Height; if(!h) h = this.RowHeight;
h = h ? h+"px" : "";
var cpl = row.Fixed ? this.CPSecs : null, oh = h;
var sh = row.r1.style.height, ooh = row.r1.clientHeight; 
for(var k=this.FirstSec;k<=this.LastSec;k++) { if(row["r"+k] && (!cpl||cpl[k])) { row["r"+k].style.height = h; if(this.LeftTD) row["r"+k].firstChild.style.height = h; } }

h = 0;

for(var k=this.FirstSec,div=this.Scale?this.Scale:1;k<=this.LastSec;k++) {
   var rr = row["r"+k];
   if(rr && (!cpl||cpl[k])) {
      
      var hh = Math.ceil(rr.getBoundingClientRect().height/div-0.01); if(h<hh) h = hh;
      if(rr.clientHeight > h) h = rr.clientHeight; 
      
      }
   }

MS.RowSpan; if(row.RowSpan) h = this.GetSpanHeight(row,h); ME.RowSpan;
if(h<0) return; 
var hh = h, chg = 0;

hh += "px";
if(hh!=oh || sh&&hh!=sh) for(var k=this.FirstSec;k<=this.LastSec;k++) { if(row["r"+k] && (!cpl||cpl[k])) { chg = 1; row["r"+k].style.height = hh; if(this.LeftTD) row["r"+k].firstChild.style.height = hh; } }


if(complete&&chg){
   this.Update();
   
   }

if(row==this.ARow || row==this.FRow) this.UpdateCursors(1);   
var nh = row.r1.clientHeight;
for(var k=this.FirstSec;k<=this.LastSec;k++) if(k!=1 && row["r"+k] && row["r"+k].clientHeight!=nh && (!cpl||cpl[k])) return 0;
if(row==this.Header) this.UpdatePagerHeaderHeight();

if(chg&&!this.Rendering&&ooh!=nh&&!noundo&&this.OUndo) {
   var U = this.OUndo; for(var i=U.Pos-1;i>=0;i--) if(U[i].Type!="End"&&U[i].Type!="Focus"&&U[i].Type!="Select"&&U[i].Type!="Scroll"){ if(U[i].Type=="Change") U[i].UpdateHeight = 3; break; }
   if(i<0||U[i].Type!="Change") this.AddUndo({Type:"UpdateRowHeight",Row:row},1);
   }
row.LastHeight = h;
return 1; 
ME.VarHeight;
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
TGP.ClearUpdateChildren = function(row,H,R){
if(!R) { R = []; for(var cpl=row.Fixed?this.CPSecs:null,k=this.FirstSec;k<=this.LastSec;k++) if(k!=1&&(!cpl||cpl[k])) R[R.length] = "r"+k; }
for(var r=row.firstChild,ltd=this.LeftTD;r;r=r.nextSibling){
   if(r.r1) {
      var h = r.Height; if(!h) h = r.Def.Height; if(!h) h = this.RowHeight; h += "px";
      if(r.r1.style.height!=h){
         H[r.id] = r.r1.style.height; r.r1.style.height = h; if(ltd) r.r1.firstChild.style.height = h;
         for(var k=0;k<R.length;k++) { var rr = r[R[k]]; if(rr) { rr.style.height = h; if(ltd) rr.firstChild.style.height = h; } }
         }
      }
   if(r.firstChild&&(r.r1||r.rch1)) this.ClearUpdateChildren(r,H,R);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetUpdateChildren = function(row,A,R){
if(!R) { R = []; for( var cpl=row.Fixed?this.CPSecs:null,k=this.FirstSec;k<=this.LastSec;k++) if(k!=1&&(!cpl||cpl[k])) R[R.length] = "r"+k; }
for(var r=row.firstChild,BZ=BMozilla||BIEA10,div=this.Scale?this.Scale:1;r;r=r.nextSibling){ 
   if(r.r1) {
      for(var k=0,h=BZ?Math.ceil(r.r1.getBoundingClientRect().height/div-0.01):r.r1.offsetHeight,nh=0;k<R.length;k++) { 
         var hh = BZ?Math.ceil(r[R[k]].getBoundingClientRect().height/div-0.01):r[R[k]].offsetHeight;
         if(hh!=h){
            if(!nh) nh = hh > h ? hh : h;
            else if(nh<hh) nh = hh;
            }
         }
      if(nh) A.push(r,nh,r.r1.style.height);
      }
   if(r.firstChild&&(r.r1||r.rch1)&&r.Hasch) {
      var pos = A.length;
      this.GetUpdateChildren(r,A,R);
      MS.RowSpan;
      if(r.RowSpan){
         for(var k=0,next=this.ReversedTree?"previousSibling":"nextSibling",h=BZ?Math.ceil(r.r1[next].getBoundingClientRect().height/div-0.01):r.r1[next].offsetHeight,nh=0;k<R.length;k++) { 
            var hh = BZ?Math.ceil(r[R[k]][next].getBoundingClientRect().height/div-0.01):r[R[k]][next].offsetHeight;
            if(hh!=h){
               var rr = r[R[hh>h?k:1]], ch = BZ?Math.ceil(rr[next].firstChild.firstChild.getBoundingClientRect().height/div-0.01):rr[next].firstChild.firstChild.offsetHeight;
               for(var i=pos;i<A.length;i+=3) ch += A[i+1] - parseInt(A[i+2]); 
               ch = (BZ?Math.ceil(rr.getBoundingClientRect().height/div-0.01):rr.offsetHeight)+(hh>h?hh:h)-ch;
               if(!nh) nh = ch;
               else if(nh<ch) nh = ch;
               }
            }
         if(nh) { 
            if(!pos||A[pos-3]!=r) A.push(r,nh,r.r1.style.height); 
            else if(nh>A[pos-2]) A[pos-2] = nh;
            }
         }
      ME.RowSpan;
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateHeights = function(shrink,noupd,row){
if(this.UpdateRowsHeightsTimeout!=null) { clearTimeout(this.UpdateRowsHeightsTimeout); this.UpdateRowsHeightsTimeout = null; }
if(this.UpdateHeightsTimeout && (shrink>0||!--this.UpdateHeightsCounter)) { this.UpdateHeightsCounter = this.UpdateHeightsTimeout; if(shrink!=2) shrink = 1; }
if(shrink==2){
   var T = this;
   this.UpdateRowsHeightsTimeout = setTimeout(function(){ T.UpdateRowsHeightsTimeout = null; T.UpdateHeights(1); },10);
   return;
   }
if(this.NoUpdateHeights) {
   if(new Date()-this.NoUpdateHeights<5000) return; 
   this.NoUpdateHeights = 0;
   shrink = 1;
   }
var B = this.BodySec; if(!B || !B[1].firstChild || this.AnimatingRow>0) return 0;
for(var R=[],RB=[],cpl=row&&row.Fixed?this.CPSecs:null,k=this.FirstSec;k<=this.LastSec;k++) if(k!=1&&(cpl?cpl[k]:this.ColNames[k].State==4&&this.ColNames[k].Width)) { R[R.length] = "r"+k; RB[RB.length] = k; }
var F = R, RF = RB; if(!row&&this.CPSecs) for(var F=[],RF=[],cpl=this.CPSecs,k=this.FirstSec;k<=this.LastSec;k++) if(k!=1&&cpl[k]) { F[F.length] = "r"+k; RF[RF.length] = k; }

var chg = 0;
if(this.RowsUpdate){
   for(var id in this.RowsUpdate) if(this.Rows[id]) this.UpdateRowHeight(this.Rows[id],0,1);
   chg = 1; this.RowsUpdate = null;
   }
else if(this.LastSec==this.FirstSec) return 0;

var hh = 0, fh = 0, bh = B[1].lastChild.offsetTop-(this.ColPaging?B[1].firstChild.offsetTop:0);
for(var k=0;k<RB.length;k++) if(bh != (B[RB[k]].lastChild.offsetTop - (this.ColPaging?B[RB[k]].firstChild.offsetTop:0))) { chg = 1; break; }
if(!row&&this.HeadSec[1]){ hh = this.HeadSec[1].firstChild.offsetHeight; if(!chg) for(var k=0;k<RF.length;k++) if(hh!=this.HeadSec[RF[k]].firstChild.offsetHeight) { chg = 1; break; } }
if(!row&&this.FootSec[1]){ fh = this.FootSec[1].firstChild.offsetHeight; if(!chg) for(var k=0;k<RF.length;k++) if(fh!=this.FootSec[RF[k]].firstChild.offsetHeight) { chg = 1; break; } }
if(shrink<0&&!chg) return 0;

var H = {}; 
if(shrink>0){
   if(row) this.ClearUpdateChildren(row,H,R);
   else {
      for(var b=this.XB.firstChild;b;b=b.nextSibling)  this.ClearUpdateChildren(b,H,R);
      if(this.HeadSec[1]) this.ClearUpdateChildren(this.XH,H,F);
      if(this.FootSec[1]) this.ClearUpdateChildren(this.XF,H,F);
      }
   }

var A = [];
if(row) this.GetUpdateChildren(row,A,R);
else {
   for(var b=this.XB.firstChild;b;b=b.nextSibling)  this.GetUpdateChildren(b,A,R);
   if(this.HeadSec[1]) this.GetUpdateChildren(this.XH,A,F);
   if(this.FootSec[1]) this.GetUpdateChildren(this.XF,A,F);
   }
if(!A.length) return 0;

for(var i=0,ltd=this.LeftTD;i<A.length;i+=3){
   var r = A[i], cpl = r.Fixed ? this.CPSecs : null, n = A[i+1], h = n+"px";
   
   if(r.r1.style.height!=n){
      if(!H[r.id]) H[r.id] = r.r1.style.height; 
      else if(H[r.id]==h) delete H[r.id];
      r.r1.style.height = h; if(ltd) r.r1.firstChild.style.height = h;
      for(var k=0;k<R.length;k++) { var rr = r[R[k]]; if(rr) { rr.style.height = h; if(ltd) rr.firstChild.style.height = h; } }
      r.LastHeight = n;
      }
   }

var err = 0, nhh = 0, nfh = 0, nbh = B[1].lastChild.offsetTop-(this.ColPaging?B[1].firstChild.offsetTop:0);
for(var k=0;k<RB.length;k++) if(nbh != (B[RB[k]].lastChild.offsetTop - (this.ColPaging?B[RB[k]].firstChild.offsetTop:0))) { err = 1; break; }
if(!row&&this.HeadSec[1]){ nhh = this.HeadSec[1].firstChild.offsetHeight; if(!err) for(var k=0;k<RF.length;k++) if(nhh!=this.HeadSec[RF[k]].firstChild.offsetHeight) { err = 2; break; } }
if(!row&&this.FootSec[1]){ nfh = this.FootSec[1].firstChild.offsetHeight; if(!err) for(var k=0;k<RF.length;k++) if(nfh!=this.FootSec[RF[k]].firstChild.offsetHeight) { err = 3; break; } }
if(err){
   info("Update error!",err,err==1?(B[RB[k]].lastChild.offsetTop - (this.ColPaging?B[RB[k]].firstChild.offsetTop:0)):err==2?this.HeadSec[RF[k]].firstChild.offsetHeight:this.FootSec[RF[k]].firstChild.offsetHeight,nbh,nhh,nfh);
   this.NoUpdateHeights = new Date()-0; 
   return 0;
   }
if(!chg) chg = bh!=nbh||hh!=nhh||fh!=nfh;

if(H[this.Header.id]) this.UpdatePagerHeaderHeight();

if(chg&&!noupd) this.Update();
else if(this.ARow&&H[this.ARow.id] || this.FRow&&H[this.FRow.id]) this.UpdateCursors(1);
return chg;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdatePagerHeaderHeight = function(){
MS.Pager;
if(!this.Paging&&!this.Gantt||this.Header!=this.Head.firstChild||this.Header.nextSibling&&this.Header.nextSibling.Kind=="Header") return;
var I = this.Img, nh = this.Header.r1.clientHeight; if(!nh) nh = this.Header.r1.scrollHeight; 
var ph = nh - I.PagerCaptionMBPHeight - I.PagerHeaderBPHeight + I.HeadBPTop - I.PagerBPTop + I.PagerHeaderBBottom; 
if(I.LastBorderBottom && !this.GetNextVisible(this.Header)) ph -= I.LastBorderBottom;
for(var i=0;i<this.Pagers.length;i++){
   var P = this.Pagers[i]; if(P.Head && P.Head.firstChild) P.Head.firstChild.style.height = ph+"px";
   }
ME.Pager;
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Corrects display after adding the only row or deleting the only row
TGP.UpdateEmptyRows = function(noupd){
if(this.Rendering||this.Loading||!this.BodyMain) return;
var FP = !this.Paging||this.AllPages?this.XB.firstChild:GetNode(this.XB,this.FPage);
var hid = FP.State<2||this.GetFirstVisible(FP) ? "" : "none";
if(hid&&this.ChildPaging==3){
   var row = this.GetFirst();
   while(row&&(!(row.Expanded&2)||row.State>0)) row = this.GetNextSibling(row);
   if(row) hid = "";
   }
if(this.HiddenBody==hid) return;
this.HiddenBody = hid;
for(var i=this.FirstSec;i<this.SecCount;i++) if(this.BodyMain[i]) this.BodyMain[i].parentNode.parentNode.style.display = hid;
if(hid) this.ScrollVertDisplay.style.display = "none"; 
MS.Show;
var row = this.Rows["NoData"];
if(row && (row.Html||row.Cells)) {
   if(hid) this.ShowRow(row);
   else this.HideRow(row);
   }
else if(!noupd) this.Update();
ME.Show;
}
// -------------------------------------------------------------------------------------------------
// Corrects tag name from <BR> to <I> or <B>, returns new row
MS.Paging;
TGP.UpdateTagName = function(row){
if(row.tagName=="BR"){
   var r = Dom.createElement(row.Page ? "B" : "I");
   
   for(var i in row) if(!Grids.INames[i]) r[i] = row[i];
   r.id = row.id;
   row.parentNode.replaceChild(r,row);
   if(this.FRow==row) this.FRow = r;
   row = r;
   }
return row;
}
ME.Paging;

// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Expands / collapses rows or selects/unselects them according to loaded configuration
// Or sets all values loaded from configuration
TGP.ExpandAndSelect = function(row){
var ridx = this.ChangesUpdate&64&&this.RowIndex;
MS.ColTree;
if((this.ToExpandCells || this.ToCollapseCells) && !this["ExpandedLap"]){
   var A = {}; this.ExpandCells = A;
   var E = this.ToExpandCells.split('&');
   for(var i=0;i<E.length;i+=2){
      A[E[i]+'&'+E[i+1]] = 1;
      var r = ridx ? this.GetRowByIndex(E[i]) : this.Rows[E[i]]; 
      if(row && r) { for(var p=r.parentNode;p&&p!=row;p=p.parentNode); if(!p) continue; }
      if(r) r[E[i+1]+"Expanded"] = 1;
      }
   var E = this.ToCollapseCells.split('&')
   for(var i=0;i<E.length;i+=2){
      A[E[i]+'&'+E[i+1]] = 0;
      var r = ridx ? this.GetRowByIndex(E[i]) : this.Rows[E[i]]; 
      if(row && r) { for(var p=r.parentNode;p&&p!=row;p=p.parentNode); if(!p) continue; }
      if(r) r[E[i+1]+"Expanded"] = 0;
      }
   }
if(this.ToExpandRows && !this["ExpandedLap"]){
   var A = {}; this.ExpandRows = A;
   var E = this.ToExpandRows.split('&');
   for(var i=0;i<E.length;i+=2){
      var r = ridx ? this.GetRowByIndex(E[i]) : this.Rows[E[i]]; 
      if(r) {
         if(row) { for(var p=r.parentNode;p&&p!=row;p=p.parentNode); if(!p) continue; }
         var v = (r.ExpandLevel?r.ExpandLevel:0)*2 + (r.Visible?1:0);
         if(E[i+1] != v) A[E[i]] = v;
         r.Visible = E[i+1]&1;
         if(r.ExpandLevel!=null) r.ExpandLevel = Math.floor(E[i+1]/2);
         }
      }
   }
ME.ColTree;

MS.Show;
if((this.ToShow || this.ToHide) && this.SaveVisible){
   var E = this.ToShow.split("&"), C = this.ToHide.split("&");
   for(var i=0;i<E.length;i++){ 
      var r = ridx ? this.GetRowByIndex(E[i]) : this.Rows[E[i]]; 
      if(r&&Is(r,"CanHide")&&!r.Visible) {
         if(row) { for(var p=r.parentNode;p&&p!=row;p=p.parentNode); if(!p) continue; }
         this.ShowRow(r); 
         }
      }
   for(var i=0;i<C.length;i++){ 
      var r = ridx ? this.GetRowByIndex(C[i]) : this.Rows[C[i]]; 
      if(r&&Is(r,"CanHide")&&r.Visible) {
         if(row) { for(var p=r.parentNode;p&&p!=row;p=p.parentNode); if(!p) continue; }
         this.HideRow(r); 
         }
      }
   }
ME.Show;

MS.Tree;
if((this.ToExpand || this.ToCollapse) && (this.SaveExpanded || this.PreserveReload&2)){
   var E = this.ToExpand, C = this.ToCollapse;
   for(var r=this.GetFirst(row);r;r=this.GetNext(r,row?2:0)) if(r.id&&(r.firstChild||r.Count)){
      var ce = Get(r,"CanExpand");
      if(ce){
         if(E.indexOf("&"+r.id+"&")>=0) r.Expanded = ce==3 ? 3 : 1;
         else if(C.indexOf("&"+r.id+"&")>=0) r.Expanded = 0;
         }
      }
   }
ME.Tree;

MS.Select;
if(this.ToSelect && (this.SaveSelected || this.PreserveReload&1)){
   var S = this.ToSelect;
   for(var r=this.GetFirst(row);r;r=this.GetNext(r,row?2:0)){
      if(this.CanSelect(r) && r.id){ 
         if(S.indexOf("&"+r.id+"&")>=0) r.Selected |= 1;
         else r.Selected &= ~1;
         }
      }
   }
ME.Select;

MS.Cfg;
if(this.SaveValues){
   var S = this.ToSave;
   for(var rid in S){
      var r = this.GetRowById(rid);
      if(r){   
         if(row) { for(var p=r.parentNode;p&&p!=row;p=p.parentNode); if(!p) continue; }
         var V = S[rid].split("&"), p = 1;
         if(V[0]=='D'){ r.Deleted = 1; r.Visible=0; }
         else if(V[0]=='A'){ 
            r.Added = 1;
            r.Par = V[1];
            r.Def = this.Def[V[2]];
            r.Parent = (V[3]-0)>=0&&this.Paging ? GetNode(this.XB,V[3]-0) : (V[3] ? this.GetRowById(V[3]) : null);
            r.Next = V[4] ? this.GetRowById(V[4]) : null;
            r.Copy = V[5] ? this.GetRowById(V[5]) : null;
            p=6;
            }
         else if(V[0]=='M'){ 
            r.Moved = V[1]-0;
            r.Parent = (V[2]-0)>=0&&this.Paging ? GetNode(this.XB,V[2]-0) : (V[2] ? this.GetRowById(V[2]) : null);
            r.Next = V[3] ? this.GetRowById(V[3]) : null;                                    
            p=4;
            }
         else if(V[0]=='C') r.Changed=1; 
         
         for(var i=p;i<V.length;i+=2){
            var v = unescape(V[i+1]);
            if((v-0)+""==v) v=v-0;
            r[V[i]] = v;
            r[V[i]+"Changed"]=1;
            }
         }         
      }
   }
ME.Cfg;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateMainTag = function(){
var MT = this.MainTag; if(!MT.offsetWidth) return; 
if(!this.NoScroll && !this.NestedGrid){
   if(this.MainTable) this.MainTable.style.display = "none";
   
   if(this.MaxWidth) {
      MT.style.width = "100%";
      if(MT.offsetWidth<20 && MT.offsetWidth && !(this.LimitScroll&1)) {
         this.MaxHScroll = 1000; this.MaxWidth = 0;
         MS.Debug; this.Debug(2,"<Cfg MaxWidth/> attribute cannot be used in this layout (e.g. floating or absolute parent without width in pixels), you should set fixed width for main <div> tag or set <Cfg> attribute NoHScroll / MaxHScroll. Now there is automatically set ","<Cfg MaxHScroll='1000'/>"); ME.Debug;
         }
      }
   
   else if(!this.NoHScroll && !this.MaxHScroll && MT.offsetWidth<20 && MT.offsetWidth){
      MT.style.width = "100%";
      if(MT.offsetWidth<20) {
         this.MaxHScroll = 1000;
         MS.Debug; this.Debug(2,"You should set width in ","pixels"," for main <div> tag or set <Cfg> attribute MaxWidth / NoHScroll / MaxHScroll. Now there is automatically set ","<Cfg MaxHScroll='1000'/>"); ME.Debug;
         }
      else { MS.Debug; this.Debug(2,"You should set width for main <div> tag or set <Cfg> attribute MaxWidth / NoHScroll / MaxHScroll. Now there is automatically set width of the main <div> to ","100%"); ME.Debug; }
      }
   if(this.MaxHeight&&!BTablet){
      if(MT.offsetHeight<40 && !(this.LimitScroll&2)){ 
         this.MaxVScroll = 800; this.MaxHeight = 0;
         MS.Debug; this.Debug(2,"<Cfg MaxHeight/> attribute cannot be used in this layout (e.g. floating or absolute parent without height in pixels), you should set fixed height for main <div> tag or set <Cfg> attribute NoVScroll / MaxVScroll. Now there is automatically set ","<Cfg MaxVScroll='800'/>"); ME.Debug;
         }
      }
   else if(!this.NoVScroll && !this.MaxVScroll && MT.offsetHeight<40 && MT.offsetWidth){ 
      MT.style.height = "100%";
      if(MT.offsetHeight<40){ 
         this.MaxVScroll = 800;
         MS.Debug; if(!this.MaxHeight||!BTablet) this.Debug(2,"You should set height in ","pixels"," for main <div> tag or set <Cfg> attribute "+(BTablet?"":"MaxHeight / ")+"NoVScroll / MaxVScroll. Now there is automatically set ","<Cfg MaxVScroll='800'/>"); ME.Debug;
         }
      else if(!this.MaxHeight||!BTablet){ 
         MS.Debug; this.Debug(2,"You should set height for main <div> tag or set <Cfg> attribute "+(BTablet?"":"MaxHeight / ")+"NoVScroll / MaxVScroll. Now there is automatically set height of the main <div> to ","100%"); ME.Debug;
         }
      }   
   MT.style.overflow = "hidden"; 
   if(this.MainTable) this.MainTable.style.display = "";
   }
else if(this.NestedGrid&&!this.NoVScroll&&!this.MaxVScroll){
   this.MaxVScroll = 1000;
   MS.Debug; this.Debug(2,"Nested grid should have set NoVScroll or MaxVScroll. Now there is automatically set ","<Cfg MaxVScroll='1000'/>"); ME.Debug;
   }
else if(!BIE || !this.NestedGrid) MT.style.overflow = "visible"; 
}
// -----------------------------------------------------------------------------------------------------------
MS.Tree;
TGP.UpdateExpanded = function(row){
var E = this.Expanded, C = this.Collapsed;
for(var r=row.firstChild;r;r=r.nextSibling) if(r.firstChild||r.State==0){
   if(!E||!C) r.Expanded = (E ? E[r.id] : !C[r.id]) ? 1 : 0;
   else if(E[r.id]) r.Expanded = 1;
   else if(C[r.id]) r.Expanded = 0;
   this.UpdateExpanded(r);
   }
}
ME.Tree;
// -----------------------------------------------------------------------------------------------------------

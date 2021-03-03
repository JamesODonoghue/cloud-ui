
MS.Show;
// -----------------------------------------------------------------------------------------------------------
// Adds or moves row and shows it in HTML table
// Moves row if it has set row.r1
TGP.TableAddRow = function(row,oldpar,flt){
var par = row.parentNode;
if(!this.MainTable || !par.r1&&!par.rch1) return;
MS.Animate; if(this.AnimatingRow) for(var r=row.parentNode;r&&!r.Page;r=r.parentNode) if(r.Animating) this.AnimRow(r); ME.Animate;
var move = row.r1 ? 1 : 0, rev = this.ReversedTree, next = rev ? "previousSibling":"nextSibling", delpar = 0;

if(!move){
   var h = row.Height; if(h==null) h = row.Def.Height; if(!h) h = this.RowHeight;
   var SS = this.GetSS(), ss, d;
   this.GetRowHTML(row,SS,0);
   if(BIEA){ 
      MS.FFOnly; MX.FFOnly;
      ss = this.GetRowTagHTML(row); 
      d = document.createElement("div");
      ME.FFOnly;
      }
   delpar = oldpar && oldpar.Hasch && (oldpar.r1||oldpar.rch1) && this.ChildParts && !this.HasChildren(oldpar);
   }

if(row.rch1) n = row;
else {
   
   for(var n=row.nextSibling;n&&!n.r1&&!n.rch1&&(!n.Visible&&!(n.Expanded&2)||flt);n=n.nextSibling); 
   
   if(n&&!n.r1&&!n.rch1) { 
      if(row.r1) this.TableDelRow(row);
      return;
      }
   }

if(par.Page){
   if(par.State!=4) return; 
   if(par.r1.style.overflow == "hidden" && !row.Fixed){  
      for(var i=this.FirstSec;i<=this.LastSec;i++){
         var rp = row.parentNode["r"+i];
         if(rp){
            rp.innerHTML = "";
            rp.style.height = "";
            rp.style.overflow = "";
            }
         }
      }
   }

else {
   MS.Tree;
   if(!par.Hasch) this.CreateChildren(par);
   if(par.Hasch==2){ 
      if(move) this.TableDelRow(row,oldpar);
      if(par.Expanded||!this.ChildPaging) this.FillPage(par); 
      return; 
      }
   ME.Tree;   
   }
var clrhasch = 0;
for(var i=this.FirstSec;i<=this.LastSec;i++){
   var ri = "r"+i, r, chpvis, ch;
   if(!par[ri]&&!par["rch"+i] || this.ColPaging&&this.ColNames[i].State<4) continue;
   
   // --- finds parent children ---
   if(par.Page) ch = par[ri].firstChild; 
   else if(this.ChildParts){
      MS.ChildParts;
      if(n) ch = (n[ri]?n[ri]:n["rch"+i]).parentNode.parentNode.parentNode;
      else ch = (par[ri]?par[ri][next]:par["rch"+i]).firstChild.firstChild.lastChild;
      
      if(!ch.firstChild || ch.firstChild.nodeType!=1) { 
         if(ch.offsetHeight<5){ 
            ch.style.display = "";
            if(chpvis==null){
               var ft = this.GetScrollTop(1), fb = ft + this.GetBodyHeight();
               var y = this.GetRowTop(par) + par.r1.offsetHeight + ch.offsetTop, h = ch.offsetHeight;
               chpvis = y+h>=ft && y < fb;
               }
            if(chpvis){
               var S = []; S[i] = []; this.GetPageHTML(row.parentNode,S,row,row); 
               ch.innerHTML = S[i].join("");
               ch = ch.firstChild;
               }   
            else { 
               if(!move) continue;
               ch = null;
               }   
            }
         else {   
            if(!move) continue;
            ch = null;
            }
         }
      else ch = ch.firstChild;
      ME.ChildParts;
      }
   else if(!par[ri]&&par["rch"+i]) ch = par["rch"+i].firstChild.firstChild.firstChild; 
   else ch = par[ri][next].firstChild.firstChild.firstChild; 
   
   // --- moves the row ---
   if(move){
      r = row[ri]; var opr = r.parentNode;
      if(ch){
         
         var rn = null; if(n){ if(n[ri]) { rn = n[ri]; if(rev&&n.Hasch) rn = rn.previousSibling; } else if(n["rch"+i]) rn = n["rch"+i]; }
         rn = ch.insertRow(rn?rn.rowIndex:ch.firstChild.rows.length); 
         if(row.Hasch){ 
            var rch = ch.insertRow(rn.rowIndex+(rev?0:1)); 
            ch.firstChild.replaceChild(r[next],rch);
            }
         ch.firstChild.replaceChild(r,rn); 
         }
      else {
         if(row.Hasch) opr.removeChild(r[next]);
         opr.removeChild(r);
         row[ri] = null;
         }   
      
        if(opr.childNodes.length<2) {
         if(oldpar.Page) oldpar["r"+i].innerHTML = ""; 
         else if(this.ChildParts){
            MS.ChildParts;
            var p = opr.parentNode.parentNode;
            if(p.nextSibling || p.previousSibling) p.parentNode.removeChild(p); 
            else { p = oldpar["r"+i]?oldpar["r"+i][next]:oldpar["rch"+i]; p.parentNode.removeChild(p); clrhasch = 0; } 
            ME.ChildParts;
            }
         else { var p = oldpar["r"+i]?oldpar["r"+i][next]:oldpar["rch"+i]; p.parentNode.removeChild(p); clrhasch = 0; } 
         }
      }
      
   else {
      var rn = null; if(n){ if(n[ri]) { rn = n[ri]; if(rev&&n.Hasch) rn = rn.previousSibling; } else if(n["rch"+i]) rn = n["rch"+i]; }
      rn = ch.insertRow(rn?rn.rowIndex:ch.firstChild.rows.length); 
      if(BIEA){ 
         d.innerHTML = CTableCSP0 + CTfoot + ss + (i==1&&!this.LeftTD?"<td style='width:0px;'></td>":"") + SS[i].join("") + "</tr>" + CTableEnd;
         r = d.firstChild.rows[0];
         ch.firstChild.replaceChild(r,rn);
         }
      else { 
         r = rn;
         if(!row.Visible) r.style.display = "none";
         r.style.height = h+"px";
         r.innerHTML = (this.LeftTD||i==1?"<td style='width:0px;height:"+h+"px'></td>":"")+SS[i].join("");
         }
      var s, f;
      if(this.SetIds) { s = this.This+".ARow="+this.This+".Rows['"+((row.id+"").search(/[\'\"\\]/)>=0 ? row.id.replace(/\\/g,'\\\\').replace(/\'/g,"\\'").replace(/\"/g,'\\"'):row.id)+"'];"+this.This+".ASec=0;"; f = new Function(s); }
      else { s = this.This+".ARow=this.row;"+this.This+".ASec=0;"; f = new Function(s); r.row = row; }
      r.onmousemove = f;
      if(BTablet) r.ontouchstart = f; else if(BTouch) r.setAttribute("ontouchstart",s);
      row[ri] = r;
      
      r.className = this.GetRowHTML(row,null,16);
      if(!row.Visible) r.style.display = "none";

      if(delpar) { var p = oldpar["r"+i][next]; p.parentNode.removeChild(p); clrhasch = 0; }
      }
   }
if(clrhasch) oldpar.Hasch = 0;
if(move && Grids.OnDisplaceRow){
   for(var r=this.GetNextVisible(row,1);r&&r.Level>row.Level;r=this.GetNextVisible(r,1)) if(r.r1) Grids.OnDisplaceRow(this,r); 
   }
if(Grids.OnRenderRow) Grids.OnRenderRow(this,row);
if(move && !row.r1) row.Hasch = 0; 
par.Hasch = 4;
if(!move) {
   
   this.RowCount++;
   MS.Nested;
   if(row.DetailCol) this.ShowNested(row);
   ME.Nested;
   }
MS.RowSpan; if(row.RowSpan) this.UpdateRowSpan(row); ME.RowSpan;
}
// -----------------------------------------------------------------------------------------------------------
// Hides and deletes row from HTML table
TGP.TableDelRow = function(row,par,del){

if(!this.MainTable || !row.r1||row.Page) return;
MS.Animate; if(this.AnimatingRow) for(var r=row.parentNode;r&&!r.Page;r=r.parentNode) if(r.Animating) this.AnimRow(r); ME.Animate;
if(Grids.OnClearRow) Grids.OnClearRow(this,row);
var next = this.ReversedTree ? "previousSibling":"nextSibling";
if(!par) par = row.parentNode;
if(Try) {
   MS.Nested;
   if(row.DetailCol && row.DetailGrid && row.DetailRow[0].Page) {
      row.DetailGrid[0].Dispose();
      row.DetailGrid = null;
      row.DetailRow = null;
      }
   ME.Nested;
   if(row.Hasch) { this.DeleteChildren(row); row.Hasch = 0; }
   this.ClearChildren(row,del?1:2);
   for(var i=this.FirstSec;i<=this.LastSec;i++){
      var r = row["r"+i];
      if(!r) continue;
      if(r.parentNode.childNodes.length>2 || par.Page) r.parentNode.removeChild(r); 
      
      else if(this.ChildParts){
         MS.ChildParts;
         var p = r.parentNode.parentNode.parentNode;
         if(p.nextSibling || p.previousSibling) p.parentNode.removeChild(p); 
         else { 
            p = par["r"+i][next]; 
            p.parentNode.removeChild(p); 
            if(par.Hasch) { par.Hasch = 0; MS.RowSpan; this.UpdateRowSpan(par,1); ME.RowSpan; }
            } 
         ME.ChildParts;   
         }
      else { 
         var p = par["r"+i][next]; 
         p.parentNode.removeChild(p); 
         if(par.Hasch) { par.Hasch = 0; MS.RowSpan; this.UpdateRowSpan(par,1); ME.RowSpan; } 
         }
      row["r"+i] = null;
      }
   }
else if(Catch) { }
this.RowCount--;
MS.RowSpan; if(row.RowSpan) this.UpdateRowSpan(row); ME.RowSpan;

}
// -----------------------------------------------------------------------------------------------------------
// Shows row in HTML table
TGP.TableShowRow = function(row,flt){

if(!this.MainTable || Is(row,"Hidden")) return;
var r = row.r1;
if(r){ 
   if(row.Space!=null) {
      if(BSafari7||row.Space==-1||row.Space==5||row.Tag) r.style.display = ""; 
      else if(BIEA&&!BIE8Strict) r.parentNode.parentNode.style.display = "";
      else r.parentNode.style.display = "";
      }
   else {
      var vr = r.offsetHeight;
      for(var i=this.FirstSec;i<=this.LastSec;i++) { var r = row["r"+i]; if(r) r.style.display = ""; }
      if(!vr) this.UpdateRowHeight(row);
      if(Grids.OnDisplayRow) Grids.OnDisplayRow(this,row);
      MS.RowSpan; if(row.RowSpan) this.UpdateRowSpan(row); ME.RowSpan;
      }
   }
else this.TableAddRow(row,null,flt);
if(this.Overlay>=2) { MS.Overlay; this.UpdateOverlay(row); ME.Overlay; }
else this.UpdatePanel(row); 
}
// -----------------------------------------------------------------------------------------------------------
// Hides row from HTML table
TGP.TableHideRow = function(row){

if(!this.MainTable || !row.r1) return;
if(row.Space!=null){ 
   if(BSafari7||row.Space==-1||row.Space==5||row.Tag) row.r1.style.display = "none"; 
   else if(BIEA&&!BIE8Strict) row.r1.parentNode.parentNode.style.display = "none"; 
   else row.r1.parentNode.style.display = "none"; 
   return; 
   }
if(Try) { for(var i=this.FirstSec;i<=this.LastSec;i++) { var r = row["r"+i]; if(r) row["r"+i].style.display = "none"; } }
else if(Catch) { }
MS.RowSpan; if(row.RowSpan) this.UpdateRowSpan(row); ME.RowSpan;
}
// -----------------------------------------------------------------------------------------------------------
// Shows foot section
TGP.TableShowFoot = function(){
if(this.FootVisible) return;
this.FootVisible = 1;
for(var n=this.ScrollHorzParent[1].parentNode,r=this.XS.firstChild;r;r=r.nextSibling) if(r.Space==3) { n = r.r1; break; } 
var r = document.createElement("tr");

var ClassNames = ["Left","Mid","Right"];


var SS = this.GetSS(), CN = this.ColNames; var Tmp = Dom.createElement("I"); Tmp.Fixed = "Foot"; this.GetPageHTML(Tmp,SS); 

var s3 = "<div class='"+this.Img.Style+"Foot", s4 = "</div></div></div>";
var s2 = "'><div style='overflow:hidden;'><div class='"+this.Img.Style+"SectionScroll' style='overflow:scroll;overflow-y:hidden;"
       + (this.NoHScroll?"overflow-x:hidden;":"")+(this.MomentumScroll?"-webkit-overflow-scrolling:touch;":"")+"' onscroll='"+this.This+".ScrolledBody(this,";
if(this.FirstSec==0) { 
   var t0 = document.createElement("td"); t0.style.overflow = "hidden";
   if(!CN[0].Width) { t0.style.display = "none";  t0.style.width = "0px"; }
   t0.innerHTML = s3 + ClassNames[0] + s2 + "0);'>" + SS[0].join("") + s4;  
   r.appendChild(t0);
   if(this.HasLeftSplitter) {
      var td = document.createElement("td"); 
      td.onmousemove = new Function(this.This+".ARow=null;"+this.This+".ASec=-6;"); 
      td.className = this.Img.Style+"LeftSplitter"+(BTablet?"Touch":"");
      td.innerHTML = "<div style='width:0px;'></div>";
      r.appendChild(td);
      this.LeftSplitter[2] = td;
      }
   }
var t1 = document.createElement("td"), s; t1.style.overflow = "hidden";  
if(this.ColPaging){
   MS.ColPaging;
   s = s3 + ClassNames[1] + s2 + "1);'>" + CTableCSP0 + CTfoot + "<tr>";
   var td = BIEA&&!BIEA8&&!BIE ? "<td valign='top'>" : "<td>"; 
   for(var i=1,cl=this.ColNames.length-1;i<cl;i++) {
      if(SS[i]) s += td+SS[i].join("")+"</td>";
      else s += td+"<div style='width:"+CN[i].Width+"px;'></div></td>";
      }
   s += "</tr>"+CTableEnd + s4;
   ME.ColPaging;
   }
else s = s3 + ClassNames[1] + s2 + "1);'>" + SS[1].join("") + s4; 
t1.innerHTML = s;
r.appendChild(t1);
if(this.SecCount==3) {  
   if(this.HasRightSplitter) {
      var td = document.createElement("td"); 
      td.onmousemove = new Function(this.This+".ARow=null;"+this.This+".ASec=-7;"); 
      td.className = this.Img.Style+"RightSplitter"+(BTablet?"Touch":"");
      td.innerHTML = "<div style='width:0px;'></div>";
      r.appendChild(td);
      this.RightSplitter[2] = td;
      }
   var t2 = document.createElement("td"); t2.style.overflow = "hidden";
   if(!CN[CN.length-1].Width) { t2.style.display = "none";  t2.style.width = "0px"; }
   t2.innerHTML = s3 + ClassNames[2] + s2 + "2);'>" + SS[SS.length-1].join("") + s4; 
   r.appendChild(t2);
   }
n.parentNode.insertBefore(r,n);
this.ScrollVertParent.rowSpan++;
MS.Pager; for(var i=0;i<this.Pagers.length;i++) this.Pagers[i].Tag.parentNode.parentNode.rowSpan++; ME.Pager; 

var len = this.ColNames.length;
if(this.FirstSec==0) { this.FootMain[0] = t0.firstChild.firstChild.firstChild; this.FootSec[0] = this.FootMain[0]; } 
if(this.SecCount==3) { this.FootMain[2] = t2.firstChild.firstChild.firstChild; this.FootSec[len-1] = this.FootMain[2]; } 
this.FootMain[1] = t1.firstChild.firstChild.firstChild; this.FootSec[1] = this.FootMain[1]; 
MS.ColPaging;
if(this.ColPaging){
   var X = this.FootMain[1].firstChild.firstChild.firstChild;
   for(var j=1;j<len-1;j++) this.FootSec[j] = X.cells[j-1];
   }
ME.ColPaging;
for(var i=this.FirstSec;i<=this.LastSec;i++) this.XF["r"+i] = this.FootSec[i];
this.XF.Page = 1; this.XF.State = 4;
}
// -----------------------------------------------------------------------------------------------------------
// Deletes foot section
TGP.TableHideFoot = function(){

this.ClearChildren(this.XF);
var r = this.FootMain[1].parentNode.parentNode.parentNode.parentNode; r.parentNode.removeChild(r);
this.ScrollVertParent.rowSpan--;
MS.Pager; for(var i=0;i<this.Pagers.length;i++) this.Pagers[i].Tag.parentNode.parentNode.rowSpan--; ME.Pager; 
this.FootMain = []; this.FootSec = [];
}
// -----------------------------------------------------------------------------------------------------------
ME.Show;

MS.Tree;
// -----------------------------------------------------------------------------------------------------------
// Expands row in HTML table
TGP.TableExpand = function(row){
if(!this.MainTable || !row.r1) return;
if(!row.Hasch) this.CreateChildren(row);
var next = this.ReversedTree ? "previousSibling":"nextSibling";
var r = row.r1[next]; if(r && r.style.display=="") return; 
MS.Animate; var anim = this.AnimateRows && !this.SuppressAnimations; ME.Animate;
for(var i=this.FirstSec;i<=this.LastSec;i++){ 
   var r = row["r"+i]; 
   if(r) { 
      r = r[next]; r.style.display = ""; 
      MS.Animate; if(anim) { r = r.firstChild; if(r) r = r.firstChild; if(r) r.style.height = ""; } ME.Animate;
      } 
   }
MS.RowSpan; if(row.RowSpan) this.UpdateRowSpan(row,1); ME.RowSpan;   

if(Grids.OnDisplayRow){ 
   var lev = row.Level;
   for(var r=this.GetNextVisible(row,1);r&&r.Level>lev;r=this.GetNextVisible(r,1)) Grids.OnDisplayRow(this,r);
   }

this.Update();
}
// -----------------------------------------------------------------------------------------------------------
// Collapse row in HTML table
TGP.TableCollapse = function(row,noupd){

if(!this.MainTable || !row.r1 || !row.Hasch) return;
var next = this.ReversedTree ? "previousSibling":"nextSibling";
if(this.RemoveCollapsed) {
   this.ClearChildren(row); row.State = 2;
   row.Hasch = 2;
   for(var i=this.FirstSec;i<=this.LastSec;i++){
      var r = row["r"+i];
      if(r) { r[next].firstChild.firstChild.innerHTML = ""; r[next].style.display = "none"; }
      }
   }
else for(var i=this.FirstSec;i<=this.LastSec;i++){
   var r = row["r"+i]; if(r) r[next].style.display = "none";
   }
MS.RowSpan; if(row.RowSpan) this.UpdateRowSpan(row,1); ME.RowSpan;
if(!noupd) this.Update();

}
// -----------------------------------------------------------------------------------------------------------
// Creates place for childen of given row
TGP.CreateChildren = function(row){
if(!row || !row.r1) return;
var plus = this.ReversedTree ? 0 : 1;
for(var i=this.FirstSec;i<=this.LastSec;i++){
   var r = row["r"+i];
   if(r) {
      var ch = r.parentNode.insertRow(r.rowIndex+plus);
      if(!row.Visible || !row.Expanded) ch.style.display = "none";
      ch = ch.insertCell(0);
      var span = r.parentNode.rows[0].cells.length;
      if(span) ch.colSpan = (BIEA||BEdge)&&span>1000 ? 1000 : span;
      var div = document.createElement("div"); ch.appendChild(div);
      }
   }
row.Hasch = 2;
MS.RowSpan; if(row.RowSpan) this.UpdateRowSpan(row,1); ME.RowSpan;
}
// -----------------------------------------------------------------------------------------------------------
// Deletes place for children of given row
TGP.DeleteChildren = function(row){
if(!row.Hasch) return;
var next = this.ReversedTree ? "previousSibling":"nextSibling";
for(var i=this.FirstSec;i<=this.LastSec;i++){
   var r = row["r"+i]; r = r ? r[next] : row["rch"+i]; 
   if(r) r.parentNode.removeChild(r);
   }      
row.Hasch = 0;   
MS.RowSpan; if(row.RowSpan) this.UpdateRowSpan(row,1); ME.RowSpan;
this.Update();
}
// -----------------------------------------------------------------------------------------------------------
ME.Tree;

// -----------------------------------------------------------------------------------------------------------
// Functions for rows moving and dragging
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Returns true if given Def can be moved as child of the row, according to AcceptDef
MS.Drag$Add;
TGP.TestDef = function(row,Def){
var A = Get(row.Page?this.Root:row,"AcceptDef");
if(A!=null) return (A+"").search(new RegExp("\\b"+Def+"\\b"))>=0;
return 1;

}
ME.Drag$Add;

MS.Drag;
// -----------------------------------------------------------------------------------------------------------
// If can drop drow to row
// Returns type, 0 no, 1 - in front of, 2 - into children, 3 - behind
// dragging == 2 for moving more rows
// y=-1 for center (for AddRow)
// copy = true, less restrictions then when moving
TGP.TestDrag = function(G,drows,row,y,copy){
var type = -1, par = row.Fixed ? this.XB.firstChild : row.parentNode;
var canmin = (par.Page?1:0) || Is(par,"AcceptChild"), canmax = canmin, cannorm = Is(row,"AcceptChild");
   
MS.Tree;

   for(var i=0;i<drows.length;i++){
      var Def = Get(drows[i],"Def").Name;
      if(cannorm && !this.TestDef(row,Def)) { 
         if(!row.firstChild || !row.firstChild.CPage || !this.TestDef(row.firstChild)) cannorm = false; 
         }
      if(!this.TestDef(par,Def)){ canmin = false; canmax = false; if(!cannorm) break; }
      }
   
   if(row.firstChild && row.firstChild.CPage) cannorm = false;
   if(row.CPage){ canmin = false; canmax = false; }
   
ME.Tree;

if(this.Group && this.Grouped && !this.GroupMoveFree){
   for(var i=0;i<drows.length;i++){
      var r = drows[i], rp = r.parentNode;
      
      if((rp.Def.Group||par.Def.Group) && this.GetGroupCol(rp) != this.GetGroupCol(par)) { canmin = false; canmax = false; }
      if((rp.Def.Group||row.Def.Group) && this.GetGroupCol(rp) != this.GetGroupCol(row)) cannorm = false;
      }
   }

if(!copy && G==this && !row.Fixed){ 
   for(var i=0;i<drows.length;i++){
      var l = row.Level - drows[i].Level;
      if(drows[i].Block){
         var A = []; this.GetBlock(drows[i],A);
         if(l>=0) for(var p=row;l;l--) p = p.parentNode;
         for(var j=0;j<A.length;j++) if(p==A[j]) { type = 0; break; }
         }
      else if(l>0) { 
         for(var p=row;l;l--) p = p.parentNode;
         if(p==drows[i]) { type = 0; break; }
         }
      else if(!l && row==drows[i]) cannorm = false;
      }
   
   if(drows.length==1) { 
      if(drows[0]==row || drows[0]==row.previousSibling) canmin = false;
      if(drows[0]==row || drows[0]==row.nextSibling) canmax = false;
      if(drows[0].Block && (A[A.length-1]==row||A[A.length-1]==row.previousSibling)) canmin = false;
      if(row==drows[0].parentNode) cannorm = false;
      }
   }

if(par.Deleted) type = 0;    
if(row.Deleted) cannorm = 0; 
if(this.Dropping!=2&&G!=this&&(G.SyncId?G.SyncId:"")!=(this.SyncId?this.SyncId:"")) type = 0;

if(type==-1){
   if(row.Fixed) type = canmin||canmax ? 1 : 0;
   else {
      var height = this.GetRowHeight(row), MinY = height/3-1, MaxY = (height)/3*2, NormY = (MaxY+MinY)/2;
      if(y==null) y = NormY;
   
      if(!this.MainCol || this.HideTree || this.Group&&!this.MainColGroup&&row.Def&&!row.Def.Group&&this.GroupMoveFree!=2){ 
         MinY = (MinY+MaxY)/2;
         MaxY = MinY;
         cannorm = false;
         }
      if(y<=MinY){
         if(canmin) type = 1;
         else if(cannorm) type = 2;
         else if(canmax) type = 3;
         }
      else if(y>=MaxY){
         if(canmax) type = 3;
         else if(cannorm) type = 2;
         else if(canmin) type = 1;
         }
      else {
         if(cannorm) type = 2;
         else if(y<NormY && canmin) type = 1;
         else if(canmax) type = 3;
         else if(canmin) type = 1;
         }
      if(type==-1) type = 0;
      }
   }

if(Grids.OnCanDrag) Grids.OnCanDrop = Grids.OnCanDrag;
if(Grids.OnCanDrop) {
   var typ = Grids.OnCanDrop(G,drows[0],this,row,type,copy,drows); 
   if(typ!=null) return typ;
   }
return type;
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Actions for dragging
TGP.ActionDragRow = function(){ return this.StartDrag(0); }
TGP.ActionDragSelected = function(){ return this.StartDrag(1); }
TGP.ActionDragCopy = function(){ return this.StartDrag(0,2); }
TGP.ActionDragSelectedCopy = function(){ return this.StartDrag(1,2); }
TGP.ActionDragCopyChildren = function(){ return this.StartDrag(0,1); }
TGP.ActionDragSelectedCopyChildren = function(){ return this.StartDrag(1,1); }
// -----------------------------------------------------------------------------------------------------------
// Starts dragging
// sel = 0 row, 1 = selected, null je-li radka vybrana
// copy = 0 - move, 1 copy row witch childern, 2 copy row without children
TGP.StartDrag = function(sel,copy){
var D = Grids.Drag; if(!D) return false;
var row = D.Row;
if(!row || row.Fixed || row.Deleted&&(!copy||!this.CopyDeleted) || !this.Dragging || this.Locked["moverow"] || copy&&(!this.Copying||!this.Adding)) return false;
if(sel && !(row.Selected&this.SelAnd) || !Is(row,"CanDrag") || copy&&!Is(row,"CanCopy") || this.Cols[this.ACol]&&!this.Cols[this.ACol].CanDrag) return false;
MS.Touch; if(this.Touched && this.TouchDragFocused && (row!=this.FRow || this.TouchDragFocused==2 && this.ACol!=this.FCol) && (!this.Event||this.Event.PartType!="PanelMove")) return false; ME.Touch;
if(sel == null) sel = !!(row.Selected&this.SelAnd);
var A = [];
if(sel){ if(this.DragSelectedFirst) A[0] = row; this.GetSelRows(0,"CanDrag",null,A); } 

if(A.length>1) D.Rows = A;   
if(this.EditMode && (row==this.ERow&&D.Col==this.ECol||this.EndEdit(1)==-1)) return false;
if(Grids.OnStartDrag && Grids.OnStartDrag(this,D.Row,D.Col,!!D.Rows,copy,D.Rows)) return false;

D.Action = "Drag";
D.Move = this.MoveDrag;
D.End = this.EndDrag;
D.Copy = copy;
this.SetDragCursor(0);
this.DraggedRow = row; this.ColorRow(row);
  
// --- mouse object --- 
MS.MouseObject;
if(this.DragObject==1){  
   var SS = this.GetSS(), tag = this.GetWidthsTagHTML();
   for(var j=this.FirstSec;j<=this.LastSec;j++) if(SS[j]) SS[j][SS[j].length] = tag + (j==1&&!this.LeftTD?"<th style='width:0px;'></th>":"");;
   this.GetWidthsHTML(row,SS); 
   this.Printing = 1; 
   var s = this.GetRowTagHTML(row);
   this.Printing = 0;
   for(var j=this.FirstSec;j<=this.LastSec;j++) if(SS[j]) SS[j][SS[j].length] = s + (j==1&&!this.LeftTD?"<td style='width:0px;'></td>":"");;
   this.GetRowHTML(row,SS,0);
   for(var j=this.FirstSec;j<=this.LastSec;j++) if(SS[j]) SS[j][SS[j].length] = "</tr>"+CTableEnd;
   var s = "<div"+(this.Rtl?" dir='rtl'":"")+" onmousemove='"+this.This+".GridMouseMove(event);'";
   s += " style='height:"+this.GetRowHeight(row)+"px;overflow:hidden;display:inline;' align='left'>"+CTableCSP0+CTfoot+"<tr>";
   for(var j=this.FirstSec;j<=this.LastSec;j++) if(SS[j]) s += "<td valign='top'>"+SS[j].join("")+"</td>";
   s += "</tr>"+CTableEnd+"</div>";
   var r = this.GetRow(row,this.Rtl ? 2:0); if(!r) r = this.GetRow(row,1);
   var ev = {clientX:D.X,clientY:D.Y};
   this.SetMouseObject(r,ev,3,s);
   var M = Grids.MouseObject;
   if(M && D.Rows){
      M.Tag.style.borderRight = "5px groove gray";
      M.Tag.style.borderBottom = "5px groove gray";
      }
   }
else if(this.DragObject==2){
   var html = "<div onmousemove='"+this.This+".GridMouseMove(event);'>"+this.GetText("DragObject"+(A.length>1?"More":"")+(copy?"Copy":"Move")).replace("%d",A.length>1?A.length:this.GetName(row))+"</div>";
   var ev = {clientX:D.X,clientY:D.Y};
   this.SetMouseObject(null,ev,3,html);
   var M = Grids.MouseObject;
   if(M) M.Tag.className = this.Img.Style+"DragObject";
   
   }   
ME.MouseObject;

return true;
}
// -----------------------------------------------------------------------------------------------------------
// Continues dragging
TGP.MoveDrag = function(outside){
var D = Grids.Drag, row = this.ARow, Y = this.Event.Y;  if(!D) return false;

this.ScrollTo = null;
if(!row || row.Fixed&&row.Kind!=="NoData"){
   if(!outside && this.ScrollOnDrag && this.Dropping) this.SetScrollTo(row);
   if(this.DropFixed!=1 || !row) row = null;
   else if(this.ScrollTo<0){ 
      row = this.GetFirstVisible(); Y = 1; 
      if(!row) row = this.Rows["NoData"];
      }
   else if(this.ScrollTo>0){
      row = this.GetLastVisible(); 
      if(!row) { row = this.Rows["NoData"]; Y = 1; }
      else {
         while(!row.parentNode.Page) row = row.parentNode;
         Y = this.GetRowHeight(row)-1;
         }
      }
   else row = null;      
   }
else if(row.Kind=="NoData"){
   if(!this.DropFixed) row = null;
   }
else if(this.NoVScroll && this.ScrollOnDrag && this.Dropping && !this.ScrollTo) {
   var y = this.Event.AbsY - GetWindowScroll()[1];
   if(y<10) this.SetScrollTo(-1);
   else if(y>GetWindowSize()[1]-10) this.SetScrollTo(1);
   }
   
if(row!=D.ToRow && D.ToRow) D.ToGrid.UpdateIcon(D.ToRow); 

if(row){
   
   MS.Tree;
   if(!row.Fixed && this.ExpandOnDrag && this.ACol==this.MainCol&&!this.HideTree && this.HasChildren(row) && !row.Expanded){
      var lw = this.Img.Line, tw = this.Img.Tree; 
      if(this.SpannedTree){ if(row.TreeWidthL!=null) lw = row.TreeWidthL; if(row.TreeWidthT!=null) tw = row.TreeWidthT; }
      var x = this.Event.X - row.Level*lw;
      if(x<tw && x>=0) this.Expand(row); 
      }
   ME.Tree;

   // --- detects (possible) type of insertion ---
   var type = this.Dropping ? this.TestDrag(D.Grid,D.Rows?D.Rows:[D.Row],row,Y,D.Copy) : 0;
   
   // --- sets background according to the type of insertion ---
   if(D.Type!=type || row != D.ToRow){
      var DragCol = this.DragCol ? this.DragCol : (this.MainCol&&!this.HideTree ? null : (this.RowIndex ? this.RowIndex : this.GetFirstCol()));
      if(!DragCol) { this.UpdateIcon(row,this.NoDragIcon?null:type); if(Grids.CM) this.HideDragCursor(); }
      else if(type) this.UpdateDragCursor(row,DragCol,type>=2);
      else if(Grids.CM) this.HideDragCursor();
      D.Type = type;
      D.ToRow = row;
      D.ToGrid = this;
      D.ToGrid.SetDragCursor(type?1:0);
      }
   }
else {
   D.ToRow = null;
   if(Grids.CM) this.HideDragCursor();
   D.Type = 0;
   if(D.ToGrid) D.ToGrid.SetDragCursor(0);
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
// Fires if mouse is up on row, for finishing of dragging
TGP.EndDrag = function(D){
if(!D) D = Grids.Drag; if(!D) return false;
var G = D.Grid, T = D.ToGrid;
G.FinishAnimations(); if(G!=T) T.FinishAnimations();
if(D.Type==2&&!T.Disabled&&D.ToRow&&!D.ToRow.Page){ 
   var to = D.ToRow;
   if(Is(to,"CanExpand") && !to.Expanded && !to.Page) T.Expand(to);
   if(to.State==1||to.State==3){ 
      var T = this; 
      setTimeout(function(){ T.EndDrag(D); },100);
      return;
      }
   }
var row = G.DraggedRow; G.DraggedRow = null; G.ColorRow(row);
if(Grids.CM) this.HideDragCursor();

if(Grids.Active && Grids.Active!=D.ToGrid && !Grids.Active.GetFirstVisible()){ 
   if(this.TestDef(Grids.Active.Root,D.Row.Def.Name)){
      T = Grids.Active;
      if(!T.Detail || T.XB.firstChild.MasterRow) { 
         D.Type = 2;
         }
      }
   }

if(Grids.OnEndDrag){ 
   Grids.Drag = null; 
   var typ = Grids.OnEndDrag(G,D.Row,T,D.ToRow,D.Type,D.AX,D.AY,D.Copy,D.Rows);
   if(typ!=null) D.Type = typ;
   Grids.Drag = D;
   }

// --- Drop ---  
if(D.Type && !T.Disabled){
   var ids = this.FormulaEditing&&this.FormulaRelative ? {} : null;
   if(D.Rows){ 
      function move(){
         var anim = 0;
         MS.Animate;
         anim = T.AnimateRows && !T.SuppressAnimations && (T.Animations["MoveFrom"] || T.Animations["MoveTo"]) && G==T && !D.Copy;
         if(anim){
            function ends(){
               T.SuppressAnimations = 1; 
               T.StartUpdate();
               T.MoveAllRows(D.Rows,D.ToRow,D.Type);      
               T.EndUpdate(); T.HideMessage();
               if(Grids.OnEndedDrag) Grids.OnEndedDrag(G,D.Row,T,D.ToRow,D.Type,D.AX,D.AY,D.Copy,D.Rows);
               T.SuppressAnimations = 0;
               T.AnimRows(D.Rows,"MoveRowsTo",1);
               }
            T.AnimRows(D.Rows,"Wait",0,function(){
               T.AnimRows(D.Rows,"MoveRowsFrom",1,ends);
               });
            }
         ME.Animate;
         if(!anim){
            T.StartUpdate();
            if(G!=T) G.StartUpdate();
            if(G==T && !D.Copy) T.MoveAllRows(D.Rows,D.ToRow,D.Type);
            else {
               var A = [];
               var n = G.MoveRowsToGrid(D.Rows[0],T,D.ToRow,D.Type,D.Copy); A[A.length] = n; if(ids) ids[D.Rows[0].id] = n.id;     
               for(var i=1;i<D.Rows.length;i++) { n = G.MoveRowsToGrid(D.Rows[i],T,n,3,D.Copy); A[A.length] = n; if(ids) ids[D.Rows[i].id] = n.id; }    
               }
            for(var i=0;i<D.Rows.length;i++) if(D.Rows[i].Block) T.UpdateRowHeight(D.Rows[i]);
            
            if(G!=T) { G.EndUpdate(); G.HideMessage(); }
            T.EndUpdate(); T.HideMessage();
            if(Grids.OnEndedDrag) Grids.OnEndedDrag(G,D.Row,T,D.ToRow,D.Type,D.AX,D.AY,D.Copy,D.Rows);
            MS.Animate; 
            if(G!=T || D.Copy) {
               G.AnimRows(D.Rows,G==T?"CopyRowsFrom":(D.Copy?"CopyRowsFromOutside":"MoveRowsFromOutside"),D.Copy!=2);
               T.AnimRows(A,G==T?"CopyRowsFrom":(D.Copy?"CopyRowsToOutside":"MoveRowsToOutside"),1); 
               }
            ME.Animate;
            }
         }
      if(D.Rows.length>T.SynchroCount) { var txt = T.GetText("MoveRows").replace("%d",D.Rows.length); T.ShowMessage(txt); if(T!=G) G.ShowMessage(txt); setTimeout(move,10); }
      else move();
      }
   else if(D.Grid==T && !D.Copy){ 
      var anim = 0;
      MS.Animate;
      anim = T.AnimateRows && !T.SuppressAnimations && (T.Animations["MoveFrom"] || T.Animations["MoveTo"]);
      if(anim){
         function finish(){
            T.ShowPages();
            if(Grids.OnEndedDrag) Grids.OnEndedDrag(G,D.Row,T,D.ToRow,D.Type,D.AX,D.AY,D.Copy,D.Rows);
            }
         function end(){
            T.SuppressAnimations = 1; 
            T.MoveRows(D.Row,D.ToRow,D.Type);      
            T.SuppressAnimations = 0;
            T.AnimRow(D.Row,"MoveTo",0,finish);
            }
         this.AnimRow(D.Row,"Wait",0,function(){
            T.AnimRow(D.Row,"MoveFrom",1,end);
            });
         }
      ME.Animate;
      if(!anim){
         if(BIE8Strict) var N = T.GetNextVisible(D.Row); 
         T.MoveRows(D.Row,D.ToRow,D.Type);
         if(BIE8Strict && N) T.RefreshRow(N); 
         if(Grids.OnEndedDrag) Grids.OnEndedDrag(G,D.Row,T,D.ToRow,D.Type,D.AX,D.AY,D.Copy,D.Rows);
         }
      }
   else { 
      this.UndoStart();
      var n = G.MoveRowsToGrid(D.Row,T,D.ToRow,D.Type,D.Copy); 
      if(n){
         if(ids) ids[D.Row.id] = n.id; 
         MS.Animate; 
         G.AnimRow(D.Row,G==T?"CopyFrom":(D.Copy?"CopyFromOutside":"MoveFromOutside"),D.Copy!=2);
         T.AnimRow(n,G==T?"CopyTo":(D.Copy?"CopyToOutside":"MoveToOutside"),1);
         ME.Animate;
         }
      
      this.UndoEnd();   
      if(Grids.OnEndedDrag) Grids.OnEndedDrag(G,D.Row,T,D.ToRow,D.Type,D.AX,D.AY,D.Copy,D.Rows);
      }
   }
   
// --- cancels dragging ---
this.ScrollTo = null; if(G) G.ScrollTo = null;

if(D.ToRow) this.UpdateIcon(D.ToRow); 
if(this.SaveValues) this.SaveCfg();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionDragCell = function(){ 
var D = Grids.Drag; if(!D) return false;
var row = D.Row, col = D.Col;
if(!row || !col || !this.Dragging || this.Locked["moverow"] || this.EditMode && (row==this.ERow&&col==this.ECol||this.EndEdit(1)==-1)) return false;
MS.Touch; if(this.Touched && this.TouchDragFocused && (row!=this.FRow || this.TouchDragFocused==2 && col!=this.FCol)) return false; ME.Touch;

D.Action = "DragCell";
D.Move = this.MoveDragCell;
D.End = this.EndDragCell;
this.SetDragCursor(1);

MS.MouseObject;
var s = this.GetRowHTML(row,null,9,col);
var r = this.GetCell(row,col);
var ev = {clientX:D.X,clientY:D.Y};
if(Grids.OnStartDragCell){ 
   var ss = Grids.OnStartDragCell(this,row,col,s);
   if(ss) {
      if(typeof(ss)=="string") s = ss;
      else return false;
      }
   }
this.SetMouseObject(r,ev,3,s);
ME.MouseObject; 
return true;
}
// -----------------------------------------------------------------------------------------------------------
// Continues dragging
TGP.MoveDragCell = function(){
var D = Grids.Drag, row = this.ARow, Y = this.Event.Y;  if(!D) return false;

if(this.Dropping){
   if(this.ScrollOnDrag) this.SetScrollTo(row);
   if(this.ScrollColOnDrag) this.SetScrollColTo(this.ACol,this.Event.X);
   }
if(row){
   
   MS.Tree;
   if(this.ExpandOnDrag && this.ACol==this.MainCol&&!this.HideTree && this.HasChildren(row) && !row.Expanded){
      var lw = this.Img.Line, tw = this.Img.Tree; 
      if(this.SpannedTree){ if(row.TreeWidthL!=null) lw = row.TreeWidthL; if(row.TreeWidthT!=null) tw = row.TreeWidthT; }
      var x = this.Event.X - row.Level*lw;
      if(x<tw && x>=0) this.Expand(row); 
      }
   ME.Tree;
   }
D.ToGrid = this;
if(Grids.OnMoveDragCell) {
   var ret = Grids.OnMoveDragCell(D.Grid,D.Row,D.Col,this,row,this.ACol,D.AX,D.AY);
   if(ret!=null) this.SetDragCursor(ret?1:0);
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
// Fires if mouse is up on row, for finishing of dragging
TGP.EndDragCell = function(){
var D = Grids.Drag, G = D.Grid, T = D.ToGrid;  if(!D) return false;

if(Grids.OnEndDragCell){ 
   Grids.Drag = null; 
   Grids.OnEndDragCell(G,D.Row,D.Col,T.ARow?T:null,T.ARow,T.ACol,D.AX,D.AY);
   Grids.Drag = D;
   }
   
// --- cancels dragging ---
this.ScrollTo = null; if(G) G.ScrollTo = null;

return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateDragCursor = function(row,col,bottom){
if(!Grids.CM) Grids.CM = { Left:this.AddTag("DragRowLeft",1),Right:this.AddTag("DragRowRight",1) }  
var E = this.CellToWindow(row,col);
var left = Grids.CM.Left, right = Grids.CM.Right;
left.style.left = (E.AbsX-left.offsetWidth)+"px";
left.style.top = (E.AbsY+(bottom?E.Height:0)-Math.floor(left.offsetHeight/2))+"px";
right.style.left = (E.AbsX+E.Width)+"px";
right.style.top = left.style.top;
}
// -----------------------------------------------------------------------------------------------------------
TGP.HideDragCursor = function(){
if(!Grids.CM) return;
Grids.CM.Left.parentNode.removeChild(Grids.CM.Left); 
Grids.CM.Right.parentNode.removeChild(Grids.CM.Right);
Grids.CM = null;
}
// -----------------------------------------------------------------------------------------------------------
ME.Drag;

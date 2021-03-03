// -----------------------------------------------------------------------------------------------------------
// Dragging actions for selecting rows, columns and cells
// -----------------------------------------------------------------------------------------------------------
MS.Select;
// -----------------------------------------------------------------------------------------------------------
// Selecting row range, column range or cell range by dragging
// sel = 0 deselect, 1 select, 2 invert, cells = 0 rows, 1 cells, 2 cols
TGP.StartSelect = function(cells,sel){ 
if(!this.Selecting || cells==1 && !this.SelectingCells || cells==2&&!this.SelectingCols || this.SelectingSingle || this.Locked["select"]) return false;
var D = Grids.Drag; if(!D) return false;
MS.Touch; if(this.Touched && this.TouchDragFocused && (D.Row!=this.FRow || this.TouchDragFocused==2 && this.ACol!=this.FCol)) return false; ME.Touch;
var C = this.Cols[D.Col];
if(D.Row.Fixed&&cells!=2 || cells==0&&!this.CanSelect(D.Row,0) || cells==1&&(!C||C.CanSelect!=1&&C.CanSelect!=3||!this.CanSelect(D.Row,1)) || cells==2&&(!C||C.CanSelect!=1&&C.CanSelect!=2)) return false;
D.Action = "Select";
D.Move = this.MoveSelect;
D.End = this.EndSelect;
D.Cursor = "default";
D.Type = (this.SelectHidden&1?0:1)+(this.SelectHidden&2?0:2)+(this.SelectHidden&4?16:0);
if(sel==2){ 
   if(!D.Row || D.Row.Fixed) sel = 1;
   else if(!cells) sel = D.Row.Selected&this.SelAnd ? 0 : 1;
   else if(cells==2) sel = this.Cols[D.Col].Selected ? 0 : 1;
   else sel = D.Row.Selected==1&&this.SelectingCells<3 || D.Row.Selected&2 && Is(D.Row,D.Col+"Selected") ? 0 : 1;
   }
D.Sel = sel;
D.Cells = cells;
D.Old = []; 
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.MoveSelect = function(){ 
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.MoveSelect();
if(this.ScrollOnDrag) this.SetScrollTo(this.ARow);
if(this.ScrollColOnDrag) this.SetScrollColTo(this.ACol,this.Event.X);

var A = [D.Cells!=2?D.Row:null, D.Cells?D.Col:null, D.Cells!=2?this.ARow:null,D.Cells?this.ACol:null];
this.ColorRange(A,D.Old,D.Sel?null:"","CanSelect",null,this.Event.X,D.Type);
D.Old = A.slice();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.EndSelect = function(){ 
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.EndSelect();
this.SelectRange(D.Old[0],D.Old[1],D.Old[2],D.Old[3],D.Sel,D.Type|(this.SelectClass?0:32)|(this.SelectingCells>=3?64:0),null,null,null,this.Event.X);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSelectRows = function(){ return this.StartSelect(0,1); }
TGP.ActionDeselectRows = function(){ return this.StartSelect(0,0); }
TGP.ActionInvertRowsFirst = function(){ return this.StartSelect(0,2); }
TGP.ActionSelectCells = function(){ return this.StartSelect(1,1); }
TGP.ActionDeselectCells = function(){ return this.StartSelect(1,0); }
TGP.ActionInvertCellsFirst = function(){ return this.StartSelect(1,2); }
TGP.ActionSelectCols = function(){ return this.StartSelect(2,1); }
TGP.ActionDeselectCols = function(){ return this.StartSelect(2,0); }
TGP.ActionInvertColsFirst = function(){ return this.StartSelect(2,2); }
// -----------------------------------------------------------------------------------------------------------
// Changing selection of rows under mouse while dragging (panel button select)
// sel = 0 unselect, 1 select, 2 invert
TGP.SelectOdd = function(sel){
if(!this.Selecting || this.SelectingSingle || this.Locked["select"]) return false;
var D = Grids.Drag; if(!D) return false;
D.Action = "SelectPanel";
D.Move = this.MoveSelectOdd;
D.Sel = sel;
if(sel==2 || !sel!=!(D.Row.Selected&this.SelAnd)) this.SelectRow(D.Row);
D.End = function(){ return true; } 
D.Cursor = "pointer";
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.MoveSelectOdd = function(){
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.MoveSelectOdd();
var r1 = D.Row, r2 = this.ARow;
if(!r2 || r2.Fixed || r1==r2) return true; 

var a1 = r1, a2 = r2, sel = D.Sel, and = this.SelAnd;
while(1){
   if(!a1 || a2==r1){ 
      for(var r=r2;r&&r!=r1;r=this.GetNextVisible(r,1)){
         if(sel==2 || !sel!=!(r.Selected&and)) this.SelectRow(r);
         }
      break; 
      }
   if(!a2 || a1==r2) { 
      for(var r=this.GetNextVisible(r1,1);r;r=this.GetNextVisible(r,1)){
         if(sel==2 || !sel!=!(r.Selected&and)) this.SelectRow(r);
         if(r==r2) break;
         }
      break;
      }
   a1 = this.GetNextVisible(a1,1);
   a2 = this.GetNextVisible(a2,1);
   }
D.Row = this.ARow;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSelectOddRows = function(){ return this.SelectOdd(1); }
TGP.ActionDeselectOddRows = function(){ return this.SelectOdd(0); }
TGP.ActionInvertOddRows = function(){ return this.SelectOdd(2); }
// -----------------------------------------------------------------------------------------------------------
// Changing selection of columns under mouse while dragging (panel button select)
// sel = 0 unselect, 1 select, 2 invert
TGP.SelectOddCols = function(sel){
if(!this.Selecting || !this.SelectingCols || this.Locked["select"]) return false;
var D = Grids.Drag; if(!D) return false;
D.Action = "SelectPanel";
D.Move = this.MoveSelectOddCols;
D.Sel = sel;
if(sel==2 || !sel!=!this.Cols[D.Col].Selected) this.SelectCol(D.Col);
D.End = function(){ return true; } 
D.Cursor = "pointer";
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.MoveSelectOddCols = function(){
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.MoveSelectOddCols();
var c1 = D.Col, c2 = this.ACol;
if(!c2 || c1==c2) return true; 

var a1 = c1, a2 = c2, sel = D.Sel;
while(1){
   if(!a1 || a2==c1){ 
      for(var c=c2;c&&c!=c1;c=this.GetNextCol(c)){
         if(sel==2 || !sel!=!this.Cols[c].Selected) this.SelectCol(c);
         }
      break; 
      }
   if(!a2 || a1==c2) { 
      for(var c=this.GetNextCol(c1);c;c=this.GetNextCol(c)){
         if(sel==2 || !sel!=!this.Cols[c].Selected) this.SelectCol(c);
         if(c==c2) break;
         }
      break;
      }
   a1 = this.GetNextCol(a1);
   a2 = this.GetNextCol(a2);
   }
D.Col = this.ACol;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSelectOddCols = function(){ return this.SelectOddCols(1); }
TGP.ActionDeselectOddCols = function(){ return this.SelectOddCols(0); }
TGP.ActionInvertOddCols = function(){ return this.SelectOddCols(2); }
// -----------------------------------------------------------------------------------------------------------
TGP.StartFill = function(dir){ 
var D = Grids.Drag; if(!D||this.LockedEdit) return false;
if(D.Row.Fixed || D.Col==this.RowIndex || D.Col=="id") return false;
var type = this.GetType(D.Row,D.Col); if(type=="Panel"||type=="Gantt"||type=="Abs"||type=="Button"||type=="DropCols"||type=="File") return false;
D.Action = "Fill";
D.Move = this.MoveFill;
D.End = this.EndFill;
D.Cursor = "default";
D.Dir = dir;
D.Old = [];
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.MoveFill = function(){ 
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.MoveFill();
if(this.ScrollOnDrag) this.SetScrollTo(this.ARow);
if(this.ScrollColOnDrag) this.SetScrollColTo(this.ACol,this.Event.X);
if(!this.ARow||!this.ACol) return false;
var A = [D.Row, D.Col, D.Dir&1?this.ARow:D.Row, D.Dir&2?this.ACol:D.Col];
this.ColorRange(A,D.Old,this.Colors["Fill"],"",null,this.Event.X); 
D.Old = A.slice();
if(A) D.Old = A;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.EndFill = function(){ 
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.EndFill();
this.ColorRange(null,D.Old,null,""); 
this.FillRange(D.Old,[D.Row,D.Col,D.Row,D.Col]);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionFillCells = function(){ return this.StartFill(3); }
TGP.ActionFillRow = function(){ return this.StartFill(2); }
TGP.ActionFillCol = function(){ return this.StartFill(1); }
// -----------------------------------------------------------------------------------------------------------
ME.Select;

MS.Select;
// -----------------------------------------------------------------------------------------------------------
TGP.ClearChildSelection = function(row,cols){
for(var r=row.firstChild;r;r=r.nextSibling){
   if(r.Selected&this.SelAnd && (r.CanSelect==null ? r.Def.CanSelect+1 : r.CanSelect+1)&2) this.SelectRow(r,0,0,1);
   else if(cols) for(var i=0;i<cols.length;i++) this.ColorCell(r,cols[i]);
   if(r.firstChild) this.ClearChildSelection(r,cols);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.ClearSelection = function(type){
if(this.Locked["select"]) return false;

if(type==null) type = 7;
if(type&1 && this.SelectingCells>=3) this.SelectRange(this.GetFirst(null,4),this.GetFirstCol(null,null,2),this.GetLast(null,4),this.GetLastCol(null,null,2),0);
var cols = [];
if(type&4 && this.SelectingCells!=1&&this.SelectingCells!=2) {
   for(var c in this.Cols) if(this.Cols[c].Selected) { cols[cols.length] = c; this.Cols[c].Selected = 0; this.UpdateColPanel(c); }
   this.SetAllColsSelected(0);
   }
if(!cols.length) cols = null;
if(type&2 || type&1&&this.SelectingCells<3){
   this.ClearChildSelection(this.XH,cols);
   this.ClearChildSelection(this.XF,cols);
   for(var r=this.XB.firstChild;r;r=r.nextSibling) this.ClearChildSelection(r,cols);
   this.SetAllSelected(0);
   if(this.SaveSelected) this.SaveCfg();
   if(this.CalculateSelected && (type&2 || type&1&&this.SelectingCells<3)) this.Calculate(1,1,0,0,1);
   else if(this.DynamicSpan||this.Undo&2) this.CalculateSpaces(1);
   }
if(this.ColorCursor&8 && this.SelectingCells && type&1){
   var C = this.Cols; for(var c in C) C[c].SelectedCells = 0;
   for(var j=0,A=[this.XH,this.XF];j<2;j++) for(var r=A[j].firstChild;r;r=r.nextSibling) if(r.ColorCursor&8) { if(this.ColorCursor&16) this.RefreshRow(r); else this.ColorRow(r); }
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionClearSelection = function(dummy,T){ 
if(this.Locked["select"]) return false;
if(!T) return this.ClearSelection();
var A = this.GetSelRows(7);
var B = this.SelectingCols ? this.GetSelCols() : [];
return A.length + B.length;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionClearSelectionCells = function(dummy,T){ 
if(this.Locked["select"]) return false;
if(!T) return this.ClearSelection(1); 
return this.GetSelRows(2).length;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ColorCursorRows = function(col,R,and){
var ColorCell = this.ColorCursor&16 ? "RefreshCell" : "ColorCell"
if(!R.Init) { 
   R.Init = 1;
   for(var j=0,A=[this.XH,this.XF];j<2;j++) for(var r=A[j].firstChild;r;r=r.nextSibling) if(r.ColorCursor&and) R[R.length] = r;
   }
for(var i=0;i<R.length;i++) this[ColorCell](R[i],col);
}
// -----------------------------------------------------------------------------------------------------------
TGP.ColorCursorCols = function(row,C,and){
var ColorCell = this.ColorCursor&16 ? "RefreshCell" : "ColorCell"
if(!C.Init){
   C.Init = 1;
   for(var j=0,A=[0,this.ColNames.length-1];j<2;j++) { var N = this.ColNames[A[j]]; for(var i=0;i<N.length;i++) if(this.Cols[N[i]].ColorCursor&and) C[C.length] = N[i]; }
   }
for(var i=0;i<C.length;i++) this[ColorCell](row,C[i]);
}
// -----------------------------------------------------------------------------------------------------------
TGP.HasSelected = function(){
if(!this.Selecting) return 0;
var sel = 0, C = this.Cols, sc = this.SelectingCells>=3; 
if(sc&&!(this.ColorCursor&8)){ 
   var R = this.Rows;
   for(var c in C) C[c].SelectedCells = 0;
   for(var id in R) if(R[id].Selected){ var r = R[id]; for(var c in C) if(r[c+"Selected"]) C[c].SelectedCells++; }
   }
if(this.SelectingCols) for(var n in C) if(C[n].Selected) { sel |= 2; break; }
if(this.SelectingCells>=3) for(var n in C) if(C[n].SelectedCells) { sel |= 4; break; }
for(var r=this.GetFirst();r;r=this.GetNext(r)) if(sc?r.Selected==1:r.Selected){ sel |= 1; break; }
if(!(sel&1)) for(var i=0,F=this.GetFixedRows();i<F.length;i++) if(sc?F[i].Selected==1:F[i].Selected){ sel |= 1; break; }
return sel;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SelectFocus = function(fr,fc,frect,undo,always){
if(!this.SelectingFocus||!this.Selecting||!this.SelectingCells||this.Locked["select"]) return;
var rect = this.FRect, row = this.FRow, col = this.FCol;
if(!always && rect && frect && (rect[0]==frect[0]&&rect[2]==frect[2]&&rect[4]==frect[4]&&rect[5]==frect[5] || rect[7]&&frect[7]&&this.SelectingFocus&4) && (rect[1]==frect[1]&&rect[3]==frect[3] || rect[6]&&frect[6]&&this.SelectingFocus&4)) return; 
if(undo) undo = (this.Undo&6)!=2; 
var OU = this.OUndo; if(!undo) this.OUndo = null;
if(frect) {
   if(this.SelectingFocus&4 && (frect[6]||frect[7])){
      if(frect[6]) this.SelectRange(frect[0],null,frect[2],null,0,16,0,undo); 
      if(frect[7]) this.SelectRange(null,frect[1],null,frect[3],0,16,0,undo); 
      }
   else this.SelectRange(frect[0],frect[1],frect[2],frect[3],0,16,0,undo); 
   }
else if(this.SelectingFocus&2&&fr&&fc) this.SelectCell(fr,fc,0,0,null,undo);
this.ClearSelection(this.SelectingFocus&4?7:1);
if(rect) {
   if(this.SelectingFocus&4 && (rect[6]||rect[7])){
      if(rect[6]) this.SelectRange(rect[0],null,rect[2],null,1,null,0,undo);
      if(rect[7]) this.SelectRange(null,rect[1],null,rect[3],1,null,0,undo);
      }
   else this.SelectRange(rect[0],rect[1],rect[2],rect[3],1,null,0,undo);
   }
else if(this.SelectingFocus&2) this.SelectCell(row,col,1,0,null,undo);
this.OUndo = OU;
if(!undo&&OU) this.CalculateSpaces(1); 
}
// -----------------------------------------------------------------------------------------------------------
ME.Select;

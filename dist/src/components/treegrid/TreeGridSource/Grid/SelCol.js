// -----------------------------------------------------------------------------------------------------------
// Selecting columns
// -----------------------------------------------------------------------------------------------------------
MS.Select;
// -----------------------------------------------------------------------------------------------------------
// If the row (cells=0) or its cells (cells=1) can be selected

// -----------------------------------------------------------------------------------------------------------
TGP.GetSelCols = function(attr,first){ 
var A = [], clr = this.ClearSelected^8;
for(var c in this.Cols) { 
   var C = this.Cols[c]; 
   
   if(C.Deleted&&clr&1 || C.Filtered&&clr&2 || clr&4&&!C.Visible&&!C.Deleted&&!C.Filtered || attr&&!C[attr]) continue;
   if(C.Selected) {
      A[A.length] = c; if(first==1) return true;
      }
   else if(first==0&&(C.CanSelect==1||C.CanSelect==2)) return true;
   }
return first!=null ? false : A;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SelectCol = function(col,sel,test,noundo,noall,always){ 
var C = this.Cols[col]; if(!C || !this.Selecting || this.Locked["select"] || !always && (!C.CanSelect || C.Deleted&&this.ClearSelected&1)) return false;
if(this.SelectingCells==1 || this.SelectingCells==2 || !this.SelectingCols&&this.SelectingCells>=3){
   if(C.CanSelect==2) return false;
   if(sel==null) { sel = 1; var R = this.Rows; for(var id in R) if(R[id].Selected==1||R[id].Select==2&&R[id][col+"Selected"]){ sel = 0; break; } }
   return !!this.SelectRange(this.GetFirst(null,4),col,this.GetLast(null,4),col,sel,null,test); 
   }
else {
   if(!this.SelectingCols || C.CanSelect==3) return false;
   if(sel==null) sel = !C.Selected;
   else if(!sel==!C.Selected) return false;
   if(Grids.OnSelect && Grids.OnSelect(this,null,sel,[col])) return false;
   if(test) return true;
   C.Selected = sel;
   if(!noall) this.SetAllColsSelected(sel,1);
   this.UpdateColPanel(col);
   if(this.Undo&2&&!noundo) this.AddUndo({Type:"Select",Col:col,Sel:sel,OSel:!sel});
   if(this.DynamicSpan||this.Undo&2) this.CalculateSpaces(1);
   if(this.SelectingCols==2) return true;
   for(var sc=this.SelectClass,r=this.GetFirstVisible(null,4);r;r=this.GetNextVisible(r,4)) if(sc) this.RefreshCell(r,col); else this.ColorCell(r,col);
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSelectCol = function(F,T){ 
var col = this.GetACol(F), ret = col ? this.SelectCol(col,1,T) : false;
MS.Animate; if(ret && !T) this.AnimCol(col,"SelectCol"); ME.Animate;
return ret;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionDeselectCol = function(F,T){ 
var col = this.GetACol(F), ret = col ? this.SelectCol(col,0,T) : false;
MS.Animate; if(ret && !T) this.AnimCol(col,"DeselectCol"); ME.Animate;
return ret;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSelectColRange = function(dummy,T){ var cnt = this.FRow&&this.FCol ? this.SelectRange(null,this.FCol,null,this.ACol,1,null,T) : 0; return T ? cnt : !!cnt; }
TGP.ActionDeselectColRange = function(dummy,T){ var cnt = this.FRow&&this.FCol ? this.SelectRange(null,this.FCol,null,this.ACol,0,null,T) : 0; return T ? cnt : !!cnt; }
TGP.ActionInvertColRangeFirst = function(dummy,T){ var cnt = this.FRow&&this.FCol ? this.SelectRange(null,this.FCol,null,this.ACol,2,null,T) : 0; return T ? cnt : !!cnt; }
TGP.ActionSelectFocusedCols = function(F,T){ var A = this.GetARanges(F?F&~2:1,0,1,2), cnt = A.length ? this.SelectRange(null,A[0][1],null,A[0][3],1,null,T) : 0; return T ? cnt : !!cnt; }
TGP.ActionDeselectFocusedCols = function(F,T){ var A = this.GetARanges(F?F&~2:1,0,1,2), cnt = A.length ? this.SelectRange(null,A[0][1],null,A[0][3],0,null,T) : 0; return T ? cnt : !!cnt; }
TGP.ActionInvertFocusedColsFirst = function(F,T){ var A = this.GetARanges(F?F&~2:1,0,1,2), cnt = A.length ? this.SelectRange(null,A[0][1],null,A[0][3],2,null,T) : 0; return T ? cnt : !!cnt; }

// -----------------------------------------------------------------------------------------------------------
TGP.SetAllColsSelected = function(sel,single){
if(sel==this.AllColsSelected || !this.SelectAllType || single&&!(this.SelectAllType&(sel?4:2)) || sel==-1&&this.AllColsSelected==null) return;
if(single){
   if(sel) this.AllColsSelected = !this.GetSelCols(null,0); 
   else this.AllColsSelected = this.SelectAllType&4 ? !this.GetSelCols(null,0) : null; 
   }
else if(sel==-1) this.AllColsSelected = !this.AllColsSelected;
else this.AllColsSelected = sel;
var F = this.GetFixedRows();
for(var i=0;i<F.length;i++) if(F[i].Kind=="Panel") {
   var N = this.ColNames[0]; for(var j=0;j<N.length;j++) this.RefreshCell(F[i],N[j]);
   var N = this.ColNames[this.ColNames.length-1]; for(var j=0;j<N.length;j++) this.RefreshCell(F[i],N[j]);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSelectAllCols = function(dummy,T,clr){ 
if(Grids.OnSelectAll && Grids.OnSelectAll(this,!clr,4)) return T ? false : true;
var cnt = this.SelectRange(null,this.GetFirstCol(null,null,2),null,this.GetLastCol(null,null,2),clr?0:1,null,T); 
return T ? cnt : !!cnt; 
}
TGP.ActionDeselectAllCols = function(F,T){ return this.ActionSelectAllCols(F,T,1); }
// -----------------------------------------------------------------------------------------------------------
ME.Select;

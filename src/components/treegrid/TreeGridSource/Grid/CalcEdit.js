// -----------------------------------------------------------------------------------------------------------
// Basic functions for editable formulas
// -----------------------------------------------------------------------------------------------------------
TGP.ActionChooseCellsInsert = function(){ }
TGP.ActionChooseCellsReplace = function(){ }
TGP.ActionChooseCellsReplaceAll = function(){ }
TGP.ActionChooseCellInsert = function(){ }
TGP.ActionChooseCellReplace = function(){ }
TGP.ActionChooseCellReplaceAll = function(){ }

// -----------------------------------------------------------------------------------------------------------
TGP.ConvertEditFormula = function(dummy,dummy2,f){ return f; } 
// -----------------------------------------------------------------------------------------------------------
TGP.GetRowsOrder = function(r1,r2){
if(r1.Fixed!=r2.Fixed) return r1.Fixed=="Head" || r2.Fixed=="Foot"; 
while(r1.Level>r2.Level) r1 = r1.parentNode;
if(r1==r2) return this.ReversedTree?1:0;
while(r2.Level>r1.Level) r2 = r2.parentNode;
if(r1==r2) return this.ReversedTree?0:1;
if(r1.parentNode.Expanded&2||r2.parentNode.Expanded&2){
   for(var l1=0,a1=r1;a1;a1=a1.parentNode,l1++);
   for(var l2=0,a2=r2;a2;a2=a2.parentNode,l2++);
   while(l1>l2) { r1 = r1.parentNode; l1--; }
   if(r1==r2) return this.ReversedTree?1:0;
   while(l2>l1) { r2 = r2.parentNode; l2--; }
   if(r1==r2) return this.ReversedTree?0:1;
   }
while(r1.parentNode != r2.parentNode) { r1 = r1.parentNode; r2 = r2.parentNode; }
var a1 = r1, a2 = r2;
while(1){
   if(!a2 || a1==r2) return true;
   if(!a1 || a2==r1) return false;
   a1 = a1.nextSibling;
   a2 = a2.nextSibling;
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetColsOrder = function(c1,c2){
var C1 = this.Cols[c1], C2 = this.Cols[c2]; 
return !C1||!C2||C1.Sec<C2.Sec||C1.Sec==C2.Sec&&C1.Pos<C2.Pos;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateRectOrder = function(R){
if(R[0]&&R[2]&&!this.GetRowsOrder(R[0],R[2])){ var a = R[0]; R[0] = R[2]; R[2] = a; }
if(!this.GetColsOrder(R[1],R[3])) { var a = R[1]; R[1] = R[3]; R[3] = a; }
return R;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetCellName = function(row,col,ra,ca,rnum,cnum){
var rn = "", cn = "";
if(row!=null||rnum!=null){
   if(rnum!=null) rn += rnum;
   else if(row.Space) return this.GetName(row)+" "+col;
   else if(this.FormulaRelative && this.RowIndex&&row[this.RowIndex]) rn += row[this.RowIndex];
   else rn += this.GetName(row); 
   if(!rn) return this.Lang.Format.NaR;
   if(ra) rn = this.Lang.Format.FormulaAbsolute + rn;
   }
if(col!=null){
   if(cnum!=null) cn += cnum;
   else {
      var cidx = this.FormulaRelative ? this.GetRowById(this.ColIndex) : null;
      cn += cidx&&cidx[col] ? cidx[col] : this.GetCaption(col,2);
      }
   if(!cn) return this.Lang.Format.NaR;
   if(ca) cn = this.Lang.Format.FormulaAbsolute + cn;
   }
var s = this.FormulaNames&1 ? rn+cn : cn+rn;
if(!(this.FormulaNames&4)) s = s.toUpperCase();
return s;
}
// -----------------------------------------------------------------------------------------------------------


// ----------------------------------------------------------------------------------------------------------
// RowIndex and ColIndex
// ----------------------------------------------------------------------------------------------------------
TGP.UpdateRowIndex = function(){ }
TGP.UpdateColIndex = function(){ }

MS.Index$UpCounter;
// ----------------------------------------------------------------------------------------------------------
TGP.GetIndexChars = function(pos,chars){
var len = chars.length, s = "";
while(pos){
   s = chars.charAt((pos-1)%len) + s;
   pos = Math.floor((pos-1)/len);
   }
return s;
}
// ----------------------------------------------------------------------------------------------------------
TGP.UpdateRowIndex = function(nocalc){
var A = {}, R = [], pos = 1, typ = this.RowIndexType;
if(typ&224) pos = this.UpdateRowIndexChildren(this.XH,pos,A,R);
for(var r=this.XB.firstChild;r;r=r.nextSibling) pos = this.UpdateRowIndexChildren(r,pos,A,R);
if(typ&224) pos = this.UpdateRowIndexChildren(this.XF,pos,A,R);
this.RowIndexes = R;
if(Grids.OnRowIndex && Grids.OnRowIndex(this,A) || Grids.OnUpCounter && Grids.OnUpCounter(this,A)) return;
for(var a in A) break;
if(a) {
   
   var col = this.RowIndex, chg = !nocalc && this.FormulaEditing&&this.FormulaRelative && this.UpdateEditFormulas(A,{});
   for(var a in A) { var r = this.Rows[a]; if(r){ r[col] = A[a]; if(r.r1) this.RefreshCell(r,col); } }
   this.EditFormulaObject = null;
   if(this.ExternalFocus) this.RefreshExternalFocus();
   if(chg) this.CalculateEdit(1,1,1);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateRowIndexChildren = function(row,pos,A,R){
var col = this.RowIndex, noindex = this.NoRowIndex, typ = this.RowIndexType, rev = this.ReversedTree;
for(var r=row.firstChild;r;r=r.nextSibling) {
   var no = r[noindex]; if(no==null) no = r.Def[noindex];
   MS.ReversedTree; if(rev && r.firstChild && (r.Expanded || typ&8) && (!no||no==2)) pos = this.UpdateRowIndexChildren(r,typ&16?1:pos,A,R); ME.ReversedTree;
   if((!no||no==3) && (!r.Deleted||typ&1&&r.Removed) && (!r.Filtered||typ&2) && (r.Visible||typ&4||r.Filtered||r.Deleted) && (!r.Fixed || r.Kind=="Data"&&r.id!=this.ColIndex&&typ&32 || r.Kind!="Header"&&r.Kind!="Data"&&typ&64 || (r.Kind=="Header"||r.id==this.ColIndex)&&typ&128)){
      if(r.HasIndex!=pos) { r.HasIndex = pos; A[r.id] = pos; }
      R[pos++] = r;
      }
   else if(r.HasIndex) { r.HasIndex = 0; A[r.id] = ""; }
   if(!rev && r.firstChild && (r.Expanded || typ&8) && (!no||no==2)) pos = this.UpdateRowIndexChildren(r,typ&16?1:pos,A,R);
   }
return pos;
}
// ----------------------------------------------------------------------------------------------------------
TGP.GetRowByIndex = function(num,typ,near){ 
if(!this.RowIndexes) return null;

var idx = this.RowIndexes[num]; if(idx) return idx;
if(near) return num<=0 ? this.RowIndexes[1] : this.RowIndexes[this.RowIndexes.length-1];
return null;
}
// ----------------------------------------------------------------------------------------------------------
TGP.GetRowIndex = function(row,typ,def){ 
if(typeof(row)!="object") row = this.Rows[row];
return row && row.HasIndex ? (typ ? row[this.RowIndex] : row.HasIndex) : def;
}
// ----------------------------------------------------------------------------------------------------------
ME.Index$UpCounter;



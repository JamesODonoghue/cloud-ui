// -----------------------------------------------------------------------------------------------------------
// Functions for selecting rows
// -----------------------------------------------------------------------------------------------------------
MS.Select;
// -----------------------------------------------------------------------------------------------------------
// If the row (cells=0) or its cells (cells=1) can be selected
TGP.CanSelect = function(row,cells){
var can = row.CanSelect; if(can==null && row.Def) can = row.Def.CanSelect;
return cells ? can==1||can==3 : (can==1||can==2)&&(!row.Deleted||!(this.ClearSelected&1));
}
// -----------------------------------------------------------------------------------------------------------
// Support function for GetSelRows, recursion
TGP.GetSelChildren = function(row,and,clr,attr,A,first){
for(var r=row.firstChild;r;r=r.nextSibling) {
   if(r.Deleted&&clr&1 || r.Filtered&&clr&2) continue;
   if(clr&4&&!r.Visible&&!r.Deleted&&!r.Filtered){
      if(r.Expanded&2 && r.firstChild && this.GetSelChildren(r,and,clr,attr,A,first)) return true; 
      continue;
      }
   if(r.Selected&and && (!attr||Is(r,attr)) && r!=A[0]) {
      A[A.length] = r;
      if(first==1 || r.firstChild && (r.Expanded||clr&8) && clr&16 && this.GetSelChildren(r,and,clr,attr,A,first)) return true;
      }
   else if(first==0&&this.CanSelect(r,0) || r.firstChild && (r.Expanded||clr&8) && this.GetSelChildren(r,and,clr,attr,A,first)) return true;
   }
}
// -----------------------------------------------------------------------------------------------------------
// Returns array of all selected rows, in order in that are in table
TGP.GetSelRows = function(type,attr,first,A){
var clr = this.ClearSelected^8 | (type&8?0:16), and = type&3; if(and==0) and = this.SelAnd;
if(!A) A = [];
if(type&4 && this.GetSelChildren(this.XH,and,clr,attr,A,first)) return true;
for(var p=this.XB.firstChild;p;p=p.nextSibling) if(!(p.State<2) && this.GetSelChildren(p,and,clr,attr,A,first)) return true; 
if(type&4 && this.GetSelChildren(this.XF,and,clr,attr,A,first)) return true;
return first!=null ? false : A;
}
// -----------------------------------------------------------------------------------------------------------
TGP.IsSelected = function(row,col){
if(!row){ var C = this.Cols[col]; return C && C.Selected;  }
if(!col) return row.Selected&&this.SelAnd;
return row.Selected && row[this.ACol+"Selected"] || this.SelectingCells<3&&row.Selected==1 || this.SelectingCells==4&&(row.Selected&1||this.Cols[col]&&this.Cols[col].Selected);
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetAllSelected = function(sel,single){
if(sel==this.AllSelected || !this.SelectAllType || single&&!(this.SelectAllType&(sel?4:2)) || sel==-1&&this.AllSelected==null) return;
if(single){
   if(sel) this.AllSelected = !this.GetSelRows(null,null,0); 
   else this.AllSelected = this.SelectAllType&4 ? !this.GetSelRows(null,null,0) : null; 
   }
else if(sel==-1) this.AllSelected = !this.AllSelected;
else this.AllSelected = sel;
var F = this.GetFixedRows();
for(var i=0;i<F.length;i++) if(F[i].Kind!="Filter") this.UpdatePanel(F[i]);
}
// -----------------------------------------------------------------------------------------------------------
// Marks given row as Selected
TGP.SelectRow = function(row,sel,test,nosave,noundo,always){
if(!row || row.Page || row.Kind=="Header" || !this.Selecting || this.Locked["select"] || !always && !this.CanSelect(row,this.SelectingCells==2)) return false;
if(this.SelectingSingle&2 && row.Selected&this.SelAnd && !nosave) return false;
var sel3 = this.SelectingCells>=3, sel2 = this.SelectingCells==2, rsel2 = row.Selected==2 && !sel3;
if(sel==null) sel = row.Selected&this.SelAnd?0:1;
else if(!(row.Selected&this.SelAnd) == !sel && !rsel2) return false;
if(Grids.OnSelect){
   var CC = null; if(sel2) { CC = []; for(var c in this.Cols) if(row[c+"Selected"]!=sel) CC[CC.length] = c; }
   if(Grids.OnSelect(this,row,!sel,CC)) return false;
   }
if(test) return true;
MS.Undo;
if(this.Undo&2&&!noundo) { 
   if(sel2) { 
      for(var c in this.Cols) if(row[c+"Selected"]!=sel) this.AddUndo({Type:"Select",Row:row,Col:c,Sel:sel,OSel:row[c+"Selected"]});
      }
   else {
      this.AddUndo({Type:"Select",Row:row,Sel:sel,OSel:rsel2?null:!sel}); 
      if(rsel2) for(var c in this.Cols) if(row[c+"Selected"]) this.AddUndo({Type:"Select",Row:row,Col:c,Sel:null,OSel:row[c+"Selected"]}); 
      }
   }
ME.Undo;
if(this.ColorCursor&8 && !sel3){
   var C = this.Cols, CR = [];
   if(rsel2) {
      if(sel) for(var c in C) { if(!row[c+"Selected"] && !C[c].SelectedCells++ && !nosave) this.ColorCursorRows(c,CR,8); }
      else for(var c in C) { if(row[c+"Selected"] && !--C[c].SelectedCells && !nosave) this.ColorCursorRows(c,CR,8); }
      }
   else if(this.SelectingCells){
      if(sel) for(var c in C) { if((C[c].CanSelect==1||C[c].CanSelect==3) && !C[c].SelectedCells++ && !nosave) this.ColorCursorRows(c,CR,8); }
      else for(var c in C) { if((C[c].CanSelect==1||C[c].CanSelect==3) && !--C[c].SelectedCells && !nosave) this.ColorCursorRows(c,CR,8); }
      }
   }
if(sel2) {
   for(var c in this.Cols) if(row[c+"Selected"]!=sel) row[c+"Selected"] = sel;
   row.Selected = sel ? 2 : 0;
   }
else {
   if(rsel2) for(var c in this.Cols) if(row[c+"Selected"]) row[c+"Selected"] = null;
   row.Selected = sel3 ? sel | (row.Selected&2) : sel;
   }
if(this.ColorCursor&8) this.ColorCursorCols(row,[],8);
if(this.SelectingSingle && sel) {
   if(this.SelectingSingle&4 && !this.SRow) for(var r=this.GetFirstVisible();r;r=this.GetNextVisible(r)){ if (r.Selected&this.SelAnd && r!=row && this.CanSelect(r)) { this.SRow = r; break; } }
   if(this.SRow && this.SRow!=row) this.SelectRow(this.SRow,0,0,1);
   this.SRow = row;
   }
if(this.SelectClass) this.RefreshRow(row); else this.ColorRow(row);
if(!nosave) this.SetAllSelected(sel,1);
this.UpdatePanel(row);
if(!nosave){
   if(this.SaveSelected) this.SaveCfg();
   if(this.CalculateSelected) this.Calculate(1,1);
   else if(this.DynamicSpan||this.Undo&2) this.CalculateSpaces(1);
   if(this.AutoUpdate && (","+this.Source.Upload.Type+",").toLowerCase().indexOf("selected")>=0) this.UploadChanges(row);
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
// Marks all rows according to select
TGP.SelectAllRows = function(select,test,noundo){
if(!this.Selecting || this.Locked["select"]) return false;
if(this.SelectingSingle){
   if(!this.SRow||test) return false;
   if(!this.SelectRow(this.SRow,0,test)) return false;
   this.SRow = null;
   return true;
   }
var page = this.Paging==3 || this.Paging&&!this.AllPages ? this.GetFPage() : null, type = page?2:0;

var sel = 0, unsel = 0, sel3 = this.SelectingCells>=3;
var and = this.SelAnd, page = this.Paging==3 || this.Paging&&!this.AllPages ? this.GetFPage() : null;
var vis = (this.ClearSelected&6)==6, typ = (page?2:0)|(this.ClearSelected&8?1:0), flt = this.ClearSelected&2; 
for(var r=vis?this.GetFirstVisible(page,typ):this.GetFirst(page,typ);r;r=vis?this.GetNextVisible(r,typ):this.GetNext(r,typ)){
   if(!this.CanSelect(r) || flt&&r.Filtered) continue; 
   if(r.Selected&and){ sel++; if(unsel&&!test) break; }
   else { unsel++; if(sel&&!test) break; }
   }
if(this.RemovedPages&&!page){
   for(var r=vis?this.GetFirstVisible(this.RemovedPages,typ):this.GetFirst(this.RemovedPages,typ);r;r=vis?this.GetNextVisible(r,typ):this.GetNext(r,typ)){
      if(!this.CanSelect(r) || flt&&r.Filtered) continue; 
      if(r.Selected&and){ sel++; if(unsel&&!test) break; }
      else { unsel++; if(sel&&!test) break; }
      }
   }
if(select==null) select = !sel;
if((select==0||select==-1) && sel==0 || (select==1||select==-1) && unsel==0) return false;
if(Grids.OnSelectAll && Grids.OnSelectAll(this,select,2)) return test ? false : true;
if(test) return select==-1 ? unsel+sel : (select ? unsel : sel);
MS.Undo;
if(this.Undo&2&&!noundo) {
   var aundo = this.CanUndo()+this.CanRedo()*2;
   this.UndoStart();
   for(var r=this.GetFirstVisible(page,type);r;r=this.GetNextVisible(r,type)) {
      if(this.CanSelect(r) && !(r.Selected&and) == select || select==-1) this.AddUndo({Type:"Select",Row:r,OSel:!!(r.Selected&and)});
      }
   this.UndoEnd();
   
   this.AddUndo({Type:"Select",Sel:select}); 
   if(this.CanUndo()+this.CanRedo()*2!=aundo) this.CalculateSpaces(1);
   }
ME.Undo;
if(select==1) type|=1; 
if(this.RowCount<this.SynchroCount) this.SelectAllRowsT(select);
else {
   this.ShowMessage(this.GetText("SelectAll"));
   var T = this; setTimeout(function(){ T.SelectAllRowsT(select);},10);
   }
return true;
}   
// -----------------------------------------------------------------------------------------------------------
TGP.SelectAllRowsT = function(select,page){  
var and = this.SelAnd; if(page==null && (this.Paging==3 || this.Paging&&!this.AllPages)) page = this.GetFPage();
var vis = (this.ClearSelected&6)==6, typ = (page?2:0)|(this.ClearSelected&8?1:0), flt = this.ClearSelected&2; 
for(var r=vis?this.GetFirstVisible(page,typ):this.GetFirst(page,typ);r;r=vis?this.GetNextVisible(r,typ):this.GetNext(r,typ)){
   if(this.CanSelect(r) && (!flt||!r.Filtered) && !(r.Selected&and) == select || select==-1) this.SelectRow(r,null,0,1);
   }
if(this.RemovedPages && !page){
   for(var r=vis?this.GetFirstVisible(this.RemovedPages,typ):this.GetFirst(this.RemovedPages,typ);r;r=vis?this.GetNextVisible(r,typ):this.GetNext(r,typ)){
      if(this.CanSelect(r) && (!flt||!r.Filtered) && !(r.Selected&and) == select || select==-1) r.Selected = !r.Selected;
      }
   }
if(this.ColorCursor&8 && this.SelectingCells){
   for(var j=0,A=[this.XH,this.XF];j<2;j++) for(var r=A[j].firstChild;r;r=r.nextSibling) if(r.ColorCursor&8) { if(this.ColorCursor&16) this.RefreshRow(r); else this.ColorRow(r); }
   }
this.SetAllSelected(select);
if(this.SaveSelected) this.SaveCfg();
if(this.CalculateSelected) this.Calculate(1,1);
if(this.AutoUpdate && (","+this.Source.Upload.Type+",").toLowerCase().indexOf("selected")>=0) this.UploadChanges();
this.HideMessage();
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSelectRow = function(F,T){ 
var row = this.GetARow(F), ret = row ? this.SelectRow(row,1,T) : false; 
MS.Animate; if(ret && !T) this.AnimRow(row,"Select"); ME.Animate;
return ret;
}
// -----------------------------------------------------------------------------------------------------------  
TGP.ActionDeselectRow = function(F,T){ 
var row = this.GetARow(F), ret = row ? this.SelectRow(row,0,T) : false; 
MS.Animate; if(ret && !T) this.AnimRow(row,"Deselect"); ME.Animate;
return ret;
}
// -----------------------------------------------------------------------------------------------------------  
TGP.ActionSelectRowRange = function(dummy,T){ var cnt = this.FRow ? this.SelectRange(this.FRow,null,this.ARow,null,1,null,T) : 0; return T ? cnt : !!cnt; }
TGP.ActionDeselectRowRange = function(dummy,T){ var cnt = this.FRow ? this.SelectRange(this.FRow,null,this.ARow,null,0,null,T) : 0; return T ? cnt : !!cnt; }
TGP.ActionInvertRowRangeFirst = function(dummy,T){ var cnt = this.FRow ? this.SelectRange(this.FRow,null,this.ARow,null,2,null,T) : 0; return T ? cnt : !!cnt; }
TGP.ActionSelectFocusedRows = function(F,T){ var A = this.GetARanges(F?F&~2:1,0,1,1), cnt = A.length ? this.SelectRange(A[0][0],null,A[0][2],null,1,null,T) : 0; return T ? cnt : !!cnt; }
TGP.ActionDeselectFocusedRows = function(F,T){ var A = this.GetARanges(F?F&~2:1,0,1,1), cnt = A.length ? this.SelectRange(A[0][0],null,A[0][2],null,0,null,T) : 0; return T ? cnt : !!cnt; }
TGP.ActionInvertFocusedRowsFirst = function(F,T){  var A = this.GetARanges(F?F&~2:1,0,1,1), cnt = A.length ? this.SelectRange(A[0][0],null,A[0][2],null,2,null,T) : 0; return T ? cnt : !!cnt; }
// -----------------------------------------------------------------------------------------------------------  
TGP.ActionSelectAll = function(dummy,T){ return this.SelectAllRows(1,T); }
TGP.ActionDeselectAll = function(dummy,T){ return this.SelectAllRows(0,T); }
TGP.ActionInvertAll = function(dummy,T){ return this.SelectAllRows(-1,T); }   
// -----------------------------------------------------------------------------------------------------------
ME.Select;

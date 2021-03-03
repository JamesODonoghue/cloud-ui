// -----------------------------------------------------------------------------------------------------------
// Functions for deleting rows
// -----------------------------------------------------------------------------------------------------------
MS.Delete;
// -----------------------------------------------------------------------------------------------------------
// Marks row as deleted, helper function to DeleteRow, due recursion
// If noshow == true, dows not color the row
// Type = 0 all Deleted = 1,  = 1 Deleted==0 => Deleted=2, =2 Deleted==2 => Deleted=0
TGP.MarkRowDeleted = function(row,del,noshow,remove,recur){
if(!recur && !this.MasterGrid) this.UndoStart();
for(var r=row.firstChild;r;r=r.nextSibling) this.MarkRowDeleted(r,del,noshow,remove,1);
if(recur && (del && row.Deleted || !del && row.Deleted!=2)) return;
if(recur && del) del = 2;
if(!this.MasterGrid) {
   var n = row.parentNode.Page ? this.GetNextSibling(row) : row.nextSibling;
   this.AddUndo({ Type:"Delete",Row:row,Del:del,Deleted:row.Deleted,Expanded:row.Expanded,Def:row.Def.Name,ParentId:row.parentNode.id,NextId:n?n.id:null,Page:row.parentNode.Page,Removed:remove });
   }
if(this.SaveOrder && !Is(row,"NoUpload") && !row.CPage) this.SetChange({ Row:row.id,Deleted:del });
var par = row.parentNode;
if(!del && !par.Page && Get(par,"DefParent") && !this.HasNDChildren(par)) this.ChangeDef(par,Get(par,"DefParent"),!noshow,2);
row.Deleted = del;
if(this.ClearSelected&1){
   if(row.Selected&this.SelAnd) {
      row.Deleted = 0;
      if(this.CanSelect(row)) this.SelectRow(row,0,0,1);
      row.Deleted = del;
      }
   if(this.ShowDeleted) this.UpdatePanel(row);
   }
if(del && !par.Page && Get(par,"DefEmpty") && !this.HasNDChildren(par)) this.ChangeDef(par,Get(par,"DefEmpty"),!noshow,2);
if(del && Grids.OnRowDelete) Grids.OnRowDelete(this,row,del);
if(!del && Grids.OnRowUndelete) Grids.OnRowUndelete(this,row);
MS.Pivot; 
if(this.PivotGrid) this.DelPivotRow(row,del); 
if(this.PivotDetail) for(var id in this.PivotDetail) this.PivotDetail[id].DelPivotDetailRow(row,del);
ME.Pivot;

if(!noshow && this.ColorState&2) this.ColorRow(row);
MS.Master; if(!noshow && row.DetailRow) this.MarkDetailRowDeleted(row,del); ME.Master;
if(!noshow && this.GanttDependency) this.Recalculate(row,null,!noshow); 
if(!recur && !this.MasterGrid) this.UndoEnd();
}
// -----------------------------------------------------------------------------------------------------------
MS.Master;
TGP.MarkDetailRowDeleted = function(row,del){
for(var i=0;i<row.DetailRow.length;i++) {
   if(row.DetailRow[i].Page) continue;
   row.DetailRow[i].Deleted = del; 
   if(row.DetailGrid[i].ColorState&2) row.DetailGrid[i].ColorRow(row.DetailRow[i]);
   if(row.DetailRow[i].DetailRow) this.MarkDetailRowDeleted(row.DetailRow[i],del);
   }
}
ME.Master;
// -----------------------------------------------------------------------------------------------------------
MS.Undo;
TGP.DeleteRowUndo = function(row,del,refresh,upd){
if(typeof(row.Def)=="string") row.Def = this.Def[row.Def];
if(del!=="") row.Deleted = del;
if(this.RowIndex && (this.ShowDeleted||row.Visible) && !(this.RowIndexType&1)) this.UpdateRowIndex();
if(refresh){ 
   this.Recalculate(row,null,1);
   if(!this.ShowDeleted){ 
      if(!row.Deleted) this.ShowRow(row,null,null,1);
      else this.HideRow(row,null,null,1);
      }
   if(this.ClearSelected&1) this.UpdatePanel(row);
   if(this.ColorState&2) this.ColorRow(row);
   if(del==="") this.UploadChanges(row);
   }

    
MS.Master; if(row.DetailRow) for(var j=0;j<row.DetailRow.length;j++) if(!row.DetailRow[j].Page) row.DetailGrid[j].DeleteRowUndo(row.DetailRow[j],del,refresh,upd); ME.Master;
}
// -----------------------------------------------------------------------------------------------------------
TGP.DeleteRowRedo = function(row,del,refresh,upd,rem){
row.Deleted = del;
if(this.RowIndex && this.ShowDeleted && !(this.RowIndexType&1)) this.UpdateRowIndex();
if(refresh){ 
   this.Recalculate(row,null,1);
   if(!this.ShowDeleted){ 
      if(!row.Deleted) this.ShowRow(row,null,null,1);
      else this.HideRow(row,null,null,1);
      }
   if(this.ClearSelected&1) this.UpdatePanel(row);
   if(this.ColorState&2) this.ColorRow(row);
   }

    
if(row.DetailRow) for(var j=0;j<row.DetailRow.length;j++) if(!row.DetailRow[j].Page) row.DetailGrid[j].DeleteRowRedo(row.DetailRow[j],del,refresh,upd,rem);
if(rem) this.DelRow(row);
}
ME.Undo;
// -----------------------------------------------------------------------------------------------------------
// Deletes given row
// type = 0 - no, 1 - confirm deletion, 2 - delete, 3 - undelete
TGP.DeleteRow = function(row,type,test,remove){
if(!row || !this.Deleting || !Is(row,"CanDelete") || row.Kind=="Header" || this.Locked["delrow"]) return false;
var del = row.Deleted-0; 
if(!type) type = del ? 3 : 1;
if(type==3 && row.parentNode.Deleted-0) return false;  
if(Grids.OnCanRowDelete) { var tmp = Grids.OnCanRowDelete(this,row,type); if(tmp!=null) type = tmp; }
if(type==1) {
   if(test) type = 2;
   else { 
      var txt = this.GetAlert("DelRow"); 
      type = !txt || this.DeleteMessage==0||this.DeleteMessage==1 && this.ShowDeleted&&!remove && !this.AutoUpdate || this.Confirm(txt.replace("%d",this.GetName(row))) ? 2 : 0; 
      }
   }
if(type<=1) return false;
if((type==2 && del || type==3 && !del) && !remove) return false; 
if(test) return true;
if(row==this.ERow && this.EditMode) this.EndEdit();
 
this.UndoStart();
this.DeleteRowT(row,type,null,remove,1); 
if(this.RowIndex && this.ShowDeleted && (!(this.RowIndexType&1)||remove)) this.UpdateRowIndex();
this.UndoEnd();
  
MS.Animate; if(this.AnimRow(row,(type==2?"Delete":"Undelete")+(this.ShowDeleted&&!remove?"Visible":""),1,type==2&&!this.ShowDeleted||remove?this.ClearRow.bind(this,row,remove):null)) return true; ME.Animate;
if(type==2&&!this.ShowDeleted||remove) this.ClearRow(row,remove);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ClearRow = function(row,del){
if(del) this.DelRow(row);
else {
   if(row.Hasch) this.DeleteChildren(row); 
   this.TableDelRow(row);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.ClearRows = function(A,del){
for(var i=0;i<A.length;i++) this.ClearRow(A[i],del);
}
// -----------------------------------------------------------------------------------------------------------
// Deletes row
// For noshow = true does not display changes => re-render is needed
TGP.DeleteRowT = function(row, type, noshow, remove, noclear, noupload, master, notree){
if(this.ShowDeleted&&!remove){
   
   this.MarkRowDeleted(row,type==2);
   
   }
else { 
   MS.Show;
   if(type==2){
      if(!row.Page) this.HideFRow([row]); 
      this.MarkRowDeleted(row,1,noshow,remove);
      if(row.Hasch&&!noclear) this.DeleteChildren(row); 
      
      if(row.parentNode.Count) row.parentNode.Count--; 
      if(row.Page && master){ 
         for(var r=row.firstChild;r;r=r.nextSibling) this.HideRow(r,true,noshow,1);
         }
      else {
         this.HideRow(row,!noclear,noshow,1,this.Undo);
         MS.Undo;
         if(remove && this.Undo&6 && this.OUndo){ 
            var OU = this.OUndo, p = OU.Pos-1; while(p>=0&&OU[p].Type=="End") p--;
            if(OU[p].Type!="Delete") for(var i=p-1;i>=0;i--) if(OU[i].Type=="Delete"){ OU.splice(p,0,OU.splice(i,1)[0]); break; }
            }
         ME.Undo;
         }
   
      MS.Group;
      if(row.Def.Group){ 
         function hide(row){
            for(var r=row.firstChild;r;r=r.nextSibling){
               if(r.Def.Group) hide(r);
               else r.Visible=0;
               }
            }
         hide(row);
         }
      ME.Group;
      }
   else if(type==3){
      this.MarkRowDeleted(row,0,noshow,remove);
      
      row.Deleted=0;
      if(row.Page && master && this.ShowDetail){; 
         this.MasterGrid.ShowDetail(row.MasterRow,this.id);
         }
      else this.ShowRow(row,noshow,null,1);
      }
   if(!notree) this.CalcTreeWidth();
   MX.Show;
   NoModule("Show");
   ME.Show;   
   }

MS.Master;   
if(master!=1 && row.MasterRow){ 
   this.MasterGrid.DeleteRowT(row.MasterRow,type,noshow,remove,noclear,1,row);
   }
if(row.DetailRow){ 
   for(var i=0;i<row.DetailRow.length;i++) if(row.DetailRow[i]!=master && !row.DetailRow[i].Page) row.DetailGrid[i].DeleteRowT(row.DetailRow[i],type,noshow,remove,noclear,1,1);
   }
ME.Master;



if(!noshow) this.Recalculate(row,null,!noshow);

MS.Chart; if(!noshow && this.Charts) this.UpdateCharts(row); ME.Chart;

if(remove) {
   if(noclear) row.Removed = -1;
   else this.DelRow(row);
   }
else if(!noshow && !noupload) { 
   this.UploadChanges(row.firstChild?null:row);
   if(this.SaveValues) this.SaveCfg();
   }
if(!noshow){
   this.HideMessage();
   if(!this.ShowDeleted||remove){ 
      
      MS.Paging;
      if(!this.GetFirstVisible() && this.Paging!=3) this.UpdatePager(); 
      ME.Paging;
      this.Update();
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
// Changes value of ShowDeleted
// Returns true if re-render is needed
TGP.ChangeShowDeleted = function(){
MS.Show;
var cnt = 0, noshow = false, C = this.Cols;
this.ShowDeleted = !this.ShowDeleted;
this.Rendering = true;
for(var r=this.GetFirst();r;r=this.GetNext(r)) if(r.Deleted){ cnt++; if(cnt>30){ noshow = true; break; }   }
if(!noshow) for(var c in C) if(C[c].Deleted) { cnt += 10; if(cnt>30){ noshow = true; break; } }
if(this.ShowDeleted){
   for(var r=this.GetFirst(null,1);r;r=this.GetNext(r,1)) if(r.Deleted && !r.Filtered) this.ShowRow(r,noshow,null,1);
   
   for(var r=this.GetFirst();r;r=this.GetNext(r)) if(r.Deleted && !r.Filtered && !r.Visible) { 
      
      if(!noshow){
         var p = r.parentNode;
         if(p.r1 && !(p.State<4) && this.HasChildren(p)){ 
            var n = this.GetNextVisible(p);
            if(n && n.parentNode==p && n.r1) { 
               r.Visible = true;
               this.TableShowRow(r);
               this.UpdateRowIcons(r,true);
               }
            }
         if(p.r1){ r.Visible = true; this.UpdateIcon(p); }
         }
      r.Visible = true;
      }
   var F = this.GetFixedRows(); for(var r=0;r<r.length;r++) if(r.Deleted) this.ShowRow(r,null,null,1);
   if(noshow && this.Paging>0 && this.Paging<3) this.CreatePages(); 
   if(noshow && this.MainCol) this.UpdateAllLevelImg(0,1);
   for(var c in C) if(C[c].Deleted) { if(noshow) C[c].Visible = 1; else this.ShowCol(c); }
   }
else {
   for(var r=this.GetFirst();r;r=this.GetNext(r)) if(r.Deleted && !r.Filtered) this.HideRow(r,true,noshow,1);
   var F = this.GetFixedRows(); for(var r=0;r<r.length;r++) if(r.Deleted && !r.Filtered) this.HideRow(r,true,null,1);
   for(var c in C) if(C[c].Deleted) { if(noshow) C[c].Visible = 0; else this.HideCol(c); }
   }
this.Rendering = false;
if(noshow) return 1;

    
MS.Chart; if(this.Charts) this.UpdateCharts(); ME.Chart;
this.UpdateHidden();
this.Update();
return 0;
MX.Show;
NoModule("Show");
ME.Show;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionDeleteRow = function(F,T){ return this.DeleteRow(this.GetARow(F),1,T); } 
TGP.ActionUndeleteRow = function(F,T){ return this.DeleteRow(this.GetARow(F),3,T); } 
TGP.ActionRemoveRow = function(F,T){ return this.DeleteRow(this.GetARow(F),1,T,1); } 
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Deletes all selected rows
TGP.ActionDeleteOrUndeleteRows = function(F,T,del,sel){
if(!this.Deleting || this.Locked["delrow"]) return false;
var R = sel ? this.GetSelRows(0,"CanDelete") : this.GetARows(F), A = [];
if(sel){
   if(del==null){
      var D = []; 
      for(var i=0;i<R.length;i++) if(R[i].Deleted==1) D[D.length] = R[i]; else if(!R[i].Deleted) A[A.length] = R[i];
      if(!D.length) del = 1; else { del = 0; A = D; }
      }
   else if(del==1) { for(var i=0;i<R.length;i++) if(!R[i].Deleted) A[A.length] = R[i]; }
   else if(!del) { for(var i=0;i<R.length;i++) if(R[i].Deleted==1) A[A.length] = R[i]; }
   else for(var i=0;i<R.length;i++) A[A.length] = R[i];
   }
else if(del==null){
   var D = []; 
   for(var id in R) if(R[id].Deleted==1) D[D.length] = R[id]; else if(!R[id].Deleted) A[A.length] = R[id];
   if(!D.length) del = 1; else { del = 0; A = D; }
   }
else if(del==1) { for(var id in R) if(!R[id].Deleted) A[A.length] = R[id]; }
else if(!del) { for(var id in R) if(R[id].Deleted==1) A[A.length] = R[id]; }
else for(var id in R) A[A.length] = R[id];
if(T||!A.length) return A.length;
if(Grids.OnDeleteAll && Grids.OnDeleteAll(this,del)) return false;
if(del){
   var txt = this.GetAlert("DelSelected");
   if(txt && (this.DeleteMessage==2||this.DeleteMessage==1 && (!this.ShowDeleted || del==2 || this.AutoUpdate)) && !this.Confirm(txt.replace("%d",A.length)))  { Grids.Alert = 0; return false; }
   }
if(this.RowCount<this.SynchroCount) { this.DeleteRows(A,del); return true; }
this.ShowMessage(this.GetText("DelSelected"));
T = this; setTimeout(function(){ T.DeleteRows(A,del); },10);
return true;   
}
// -----------------------------------------------------------------------------------------------------------
// Deletes selected rows, called from DeleteSelectedRows in timeout
// del = 0 undelete, 1 delete, 2 remove
TGP.DeleteRows = function(R,del){
var A = []; if(del==null) del = 1;
for(var i=0;i<R.length;i++) {
   var d = del, can = R[i].CanDelete; if(can==null) can = R[i].Def.CanDelete; if(!can) continue;
   if(Grids.OnCanRowDelete) { var tmp = Grids.OnCanRowDelete(this,R[i],del?2:3,R); if(tmp!=null) d = tmp==2?(del==2?1:2):(tmp==3?0:-1); }
   if(d!=-1&&(d==2||(d?!R[i].Deleted:R[i].Deleted==1))) A[A.length] = R[i];
   }
var len = A.length; if(!len) return 0;
  
if(len>1) {
   if(len<this.SynchroCount) this.StartUpdate();
   else this.UndoStart();
   MS.Pivot;
   if(this.PivotDetail) for(var id in this.PivotDetail){ var G = this.PivotDetail[id]; if(G && !G.Loading && !G.Cleared && !G.Rendering && G.PivotUpdate>=2) G.StartUpdate(); }
   if(this.PivotGrid && this.PivotUpdate>=1) { this.StartUpdate(); this.PivotGrid.StartUpdate(); }
   ME.Pivot;
   }
else this.UndoStart();
for(var i=0;i<len;i++) this.DeleteRowT(A[i],del?2:3,A[i].Fixed?false:len>=this.SynchroCount,del==2,1,len>1,null,1);
if(this.RowIndex && this.ShowDeleted && !(this.RowIndexType&1)) this.UpdateRowIndex();
if(len>1){
   MS.Pivot;
   if(this.PivotDetail) for(var id in this.PivotDetail){ var G = this.PivotDetail[id]; if(G && !G.Loading && !G.Cleared && !G.Rendering && G.PivotUpdate>=2) G.EndUpdate(); }
   if(this.PivotGrid && this.PivotUpdate>=1) { this.EndUpdate(); this.PivotGrid.EndUpdate(); }
   ME.Pivot;
   if(len<this.SynchroCount) this.EndUpdate();
   else {
      this.UndoEnd();
      if(this.AutoUpdate) this.UploadChanges();
      }
   }
else this.UndoEnd();
this.CalcTreeWidth();

if(this.SaveValues) this.SaveCfg();
if(len>this.SynchroCount){ this.Calculate(2,1); this.RenderBody(); }
else {
   this.HideMessage();
   MS.Animate; if(this.AnimRows(A,(del?"Delete":"Undelete")+(this.ShowDeleted&&del!=2?"VisibleRows":"Rows"),1,del&&!this.ShowDeleted||del==2?this.ClearRows.bind(this,A,del==2):null)) return true; ME.Animate;
   if(del&&!this.ShowDeleted||del==2) this.ClearRows(A,del==2);
   }
return len;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionDeleteRows = function(F,T){ return this.ActionDeleteOrUndeleteRows(F,T,1); }
TGP.ActionUndeleteRows = function(F,T){ return this.ActionDeleteOrUndeleteRows(F,T,0); }
TGP.ActionRemoveRows = function(F,T){ return this.ActionDeleteOrUndeleteRows(F,T,2);}
TGP.ActionDeleteSelected = function(F,T){ return F||this.EventObject.Type!=1||this.ARow&&(this.ARow.Selected||this.ARow.Kind!="Data") ? this.ActionDeleteOrUndeleteRows(0,T,1,1) : 0; }
TGP.ActionUndeleteSelected = function(F,T){ return F||this.EventObject.Type!=1||this.ARow&&(this.ARow.Selected||this.ARow.Kind!="Data") ? this.ActionDeleteOrUndeleteRows(0,T,0,1) : 0; }
TGP.ActionRemoveSelected = function(F,T){ return F||this.EventObject.Type!=1||this.ARow&&(this.ARow.Selected||this.ARow.Kind!="Data") ? this.ActionDeleteOrUndeleteRows(0,T,2,1) : 0; }

// -----------------------------------------------------------------------------------------------------------
MS.Select;
// -----------------------------------------------------------------------------------------------------------
// Deletes all selected rows

// -----------------------------------------------------------------------------------------------------------
ME.Select;
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
ME.Delete;

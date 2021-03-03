// -----------------------------------------------------------------------------------------------------------
// Functions for copying rows
// -----------------------------------------------------------------------------------------------------------
MS.Copy;
// -----------------------------------------------------------------------------------------------------------
// Copies row to parent before row next (like Add)
// deep = true => include children, only visible (not filtered, not deleted)
// does not test if copying is possible, shows changes
// Before use is better to set AutoUpdate to false
TGP.CopyRow = function(row,par,next,deep,empty,ids,A){
var r = this.AddRow(par,next,5,null,null,empty&&!this.EditAttrsEmpty?null:row,null,null,A,1); if(!r) return;
if(deep) { 
   r.Expanded = row.Expanded;
   var U = this.GetLastUndo(); if(U) U.Expanded = r.Expanded;
   }

if(deep && row.Count && row.State<2){
   r.State = 0;
   r.Count = row.Count;
   r.Copy = row.Copy ? row.Copy : row.id; 
   var U = this.GetLastUndo(); if(U) { U.Copy = r.Copy; U.Count = r.Count; }
   this.UpdateIcon(r);
   }
else if(deep||row.Def.Children&&!empty){
   for(var n=row.firstChild,cnt=0;n;n=n.nextSibling){
      if((deep && n.Visible || n.DefChild&&!empty) && (!n.Deleted||this.CopyDeleted) && Is(n,"CanCopy") && n!=r) { this.CopyRow(n,r,null,deep,empty,ids,A); cnt++; }
      }
   if(!deep&&!cnt){
      for(var i=0;i<row.Def.Children.length;i++){ 
         var d = row.Def.Children[i]; 
         if(d.Def!=row.Def) this.AddRow(r,null,5,null,d.Def.Name,d);
         }
      }
   }  
if(ids) ids[row.id] = r.id;
return r;
}
// -----------------------------------------------------------------------------------------------------------
// Copies rows array to parent before row next (like Add)
// deep = true => include children, only visible (not filtered, not deleted)
// shows changes
TGP.CopyRows = function(rows,par,next,deep,empty,focus){
if(deep && typeof(deep)=="object" && deep.CopyRows) return deep.CopyRows(rows,par,next,empty,focus); 
if(!rows) return null;
if(rows.parentNode) rows = [rows];
else if(!rows.length) return null;
var p = par ? par : (next ? next.parentNode : null);
if(Grids.OnCanRowAdd) { var tmp = Grids.OnCanRowAdd(this,par,next); if(!tmp&&tmp!=null) return null; }
var B = [], p = 0, ids = null, A = this.GetEditAttrs(3,empty?4:0,{RowSpan:1});
if(this.GanttDependency || this.FormulaEditing) ids = {};
this.StartUpdate(); 
for(var i=0;i<rows.length;i++) { var r = this.CopyRow(rows[i],par,next,deep,empty,ids,A); if(r) B[p++] = r; }
if(!p) { this.EndUpdate(); return null; }
if(!deep) for(var i=0;i<B.length;i++) if(B[i] && Get(B[i],"DefEmpty") && !this.HasNDChildren(B[i])) this.ChangeDef(B[i],Get(B[i],"DefEmpty"),1,2);

this.EndUpdate(); 

if(Grids.OnRowAdded) for(var i=0;i<rows.length;i++) Grids.OnRowAdded(this,B[i]);
if(focus) this.FocusRows(B[0],B[B.length-1]);

return B;
}
// -----------------------------------------------------------------------------------------------------------
TGP.CopyRow2 = function(F,deep,empty,below,test){
var row = this.GetARow(F);
MS.Master; if(F&1&&!row&&this.FocusNested(test)&&this.LastFocus[0].Adding&&this.LastFocus[0].Copying&&!(this.LastFocus[0].Locked["addrow"])) return this.LastFocus[0].CopyRow2(F,deep,empty,below,test); ME.Master;
if(!this.Copying || !this.Adding || this.Locked["addrow"]) return false;

if(row==null || row.Fixed || row.Page || row.Deleted&&!this.CopyDeleted) return false;
if(test) return this.TestCopy(row,null,row) && (!deep||row.firstChild||row.Count) ? 1 : 0
var A = this.CopyRows([row],row.parentNode,below?row.nextSibling:row,deep,empty,1); if(!A) return false;
if(row==this.ARow && !below) this.ARow = A[0];
MS.Animate; this.AnimRows([row,"CopyFrom",deep],[A[0],"CopyTo",1]); ME.Animate;

return true;  
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionCopyRow = function(F,T){ return this.CopyRow2(F,0,0,0,T); }
TGP.ActionCopyTree = function(F,T){ return this.CopyRow2(F,1,0,0,T); }
TGP.ActionCopyEmpty = function(F,T){ return this.CopyRow2(F,1,1,0,T); }
TGP.ActionCopyRowBelow = function(F,T){ return this.CopyRow2(F,0,0,1,T); }
TGP.ActionCopyTreeBelow = function(F,T){ return this.CopyRow2(F,1,0,1,T); }
TGP.ActionCopyEmptyBelow = function(F,T){ return this.CopyRow2(F,1,1,1,T); }
// -----------------------------------------------------------------------------------------------------------
TGP.TestCopy = function(row,par,next){

if(!par && next) par = next.parentNode;
if(!this.Copying || !this.Adding || this.Locked["addrow"] || par && (par.Deleted || par.Fixed) || !Is(row,"CanCopy") || row.Deleted&&!this.CopyDeleted) return false;

MS.Tree;

   var Def = Get(row,"Def").Name;
   
   if(!this.TestDef(par,Def)) return false;
   
for(var p=par;p&&!p.Page;p=p.parentNode) if(p==row) return false; 
ME.Tree;

if(Grids.OnCanRowAdd) { var tmp = Grids.OnCanRowAdd(this,par,next); if(!tmp&&tmp!=null) return false; }
if(!this.AddRow(par,next,null,null,null,row,null,1)) return false;
return true;
}
// -----------------------------------------------------------------------------------------------------------
MS.Select;
// -----------------------------------------------------------------------------------------------------------
TGP.CopySelectedRows = function(F,deep,empty,type,foc,test,noscroll){ 
MS.Master; if(F&1&&this.FocusNested(test)&&this.LastFocus[0].Adding&&this.LastFocus[0].Copying&&!(this.LastFocus[0].Locked["addrow"])) return this.LastFocus[0].CopySelectedRows(F,deep,empty,type,foc,test,noscroll); ME.Master;
if(!this.Copying || !this.Adding || this.Locked["addrow"]) return false;
var par = null, next = null, prev = null, row = this.GetARow(F&5,type==0?1:type==1?2:0);
if(type==0||type==1){
   next = row;
   if(next==null || next.Fixed || next.Page) return false;
   par = next.parentNode; prev = type==1 ? next : next.previousSibling;
   if(type==1) next = next.nextSibling;
   }
else if(type==2||type==3){
   par = row;
   if(par==null || par.Fixed || par.Page || !this.MainCol) return false;
   next = type==3 ? null : par.firstChild;
   prev = type==3 ? par.lastChild : null;
   }
else if(type==4) { par = this.GetActualPage(); prev = this.GetLastVisible(); }
else if(type==5){
   par = this.XB.lastChild; prev = this.GetLastVisible();
   if(!test){
      if(!this.AllPages && par!=this.FPage && this.Paging) this.GoToPage(par);
      if(par.State!=4){
         if(this.AllPages && !noscroll) this.ScrollIntoView(par);
         var T = this;
         setTimeout(function(){T.CopySelectedRows(F,deep,empty,5,foc,0,1);},100);
         return true;
         }
      }  
   }
var A = [], p = 0;

if(foc){
   if(F&8 && (!this.FRect||!this.FRect[6])) return false;
   var B = this.GetFocusedRows(12); 
   for(var i=0;i<B.length;i++) if(this.TestCopy(B[i],par,next)){
      A[p++] = B[i];
      if(test && (B[i].firstChild || B[i].Count)) test++;
      }
   }
else {
   for(var r=this.GetFirstVisible(),and=F&8||this.SelectingCells!=4?this.SelAnd:3;r;r=this.GetNextVisible(r)) if(r.Selected&and && this.TestCopy(r,par,next)) {
      A[p++] = r;
      if(test && (r.firstChild || r.Count)) test++;
      }  
   }
if(!p||F&64&&p>1) return false;
if(test) return test>1||!deep?p:0;
var O = this.CopyRows(A,par,next,deep,empty,foc?2:1); if(!O) return false;
if((type==0||type==1) && next==this.ARow) this.ARow = prev ? prev.previousSibling : par.firstChild;
else if((type==2||type==3) && par==this.ARow) this.ARow = prev ? prev.nextSibling : par.firstChild;
MS.Animate; this.AnimRows([A,"CopyRowsFrom",deep],[O,"CopyRowsTo",1]); ME.Animate;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionCopySelected = function(F,T){ return this.CopySelectedRows(F,0,0,0,0,T); }
TGP.ActionCopySelectedTree = function(F,T){ return this.CopySelectedRows(F,1,0,0,0,T); }
TGP.ActionCopySelectedEmpty = function(F,T){ return this.CopySelectedRows(F,1,1,0,0,T); }
TGP.ActionCopySelectedBelow = function(F,T){ return this.CopySelectedRows(F,0,0,1,0,T); }
TGP.ActionCopySelectedTreeBelow = function(F,T){ return this.CopySelectedRows(F,1,0,1,0,T); }
TGP.ActionCopySelectedEmptyBelow = function(F,T){ return this.CopySelectedRows(F,1,1,1,0,T); }
TGP.ActionCopySelectedChild = function(F,T){ return this.CopySelectedRows(F,0,0,2,0,T); }
TGP.ActionCopySelectedTreeChild = function(F,T){ return this.CopySelectedRows(F,1,0,2,0,T); }
TGP.ActionCopySelectedEmptyChild = function(F,T){ return this.CopySelectedRows(F,1,1,2,0,T); }
TGP.ActionCopySelectedChildEnd = function(F,T){ return this.CopySelectedRows(F,0,0,3,0,T); }
TGP.ActionCopySelectedTreeChildEnd = function(F,T){ return this.CopySelectedRows(F,1,0,3,0,T); }
TGP.ActionCopySelectedEmptyChildEnd = function(F,T){ return this.CopySelectedRows(F,1,1,3,0,T); }
TGP.ActionCopySelectedEnd = function(F,T){ return this.CopySelectedRows(F,0,0,this.AllPages?5:4,0,T); }
TGP.ActionCopySelectedTreeEnd = function(F,T){ return this.CopySelectedRows(F,1,0,this.AllPages?5:4,0,T); }
TGP.ActionCopySelectedEmptyEnd = function(F,T){ return this.CopySelectedRows(F,1,1,this.AllPages?5:4,0,T); }
TGP.ActionCopySelectedEndPage = function(F,T){ return this.CopySelectedRows(F,0,0,4,0,T); }
TGP.ActionCopySelectedTreeEndPage = function(F,T){ return this.CopySelectedRows(F,1,0,4,0,T); }
TGP.ActionCopySelectedEmptyEndPage = function(F,T){ return this.CopySelectedRows(F,1,1,4,0,T); }
TGP.ActionCopySelectedEndGrid = function(F,T){ return this.CopySelectedRows(F,0,0,5,0,T); }
TGP.ActionCopySelectedTreeEndGrid = function(F,T){ return this.CopySelectedRows(F,1,0,5,0,T); }
TGP.ActionCopySelectedEmptyEndGrid = function(F,T){ return this.CopySelectedRows(F,1,1,5,0,T); }

TGP.ActionCopyRows = function(F,T){ return this.CopySelectedRows(F,0,0,0,1,T); }
TGP.ActionCopyRowsTree = function(F,T){ return this.CopySelectedRows(F,1,0,0,1,T); }
TGP.ActionCopyRowsEmpty = function(F,T){ return this.CopySelectedRows(F,1,1,0,1,T); }
TGP.ActionCopyRowsBelow = function(F,T){ return this.CopySelectedRows(F,0,0,1,1,T); }
TGP.ActionCopyRowsTreeBelow = function(F,T){ return this.CopySelectedRows(F,1,0,1,1,T); }
TGP.ActionCopyRowsEmptyBelow = function(F,T){ return this.CopySelectedRows(F,1,1,1,1,T); }

// -----------------------------------------------------------------------------------------------------------
ME.Select;
// -----------------------------------------------------------------------------------------------------------
ME.Copy;
// -----------------------------------------------------------------------------------------------------------

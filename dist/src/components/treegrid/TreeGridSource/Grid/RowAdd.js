// -----------------------------------------------------------------------------------------------------------
// Functions for row manipulations - adding, deleting
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Add new row to parent before row nex
// If next==null add it as the last row of parent's children
// If next and parent are null, adds row to last of actual page
// If show==true, shows the in row in table
// if id is set, does not generate id, but sets it
// If set Def uses this name
MS.Add;
TGP.AddRow = function(par,next,show,id,Def,src,master,test,A,old,noundo){
if(next) par = next.parentNode;
if(!par){
   if(!this.AllPages) par = GetNode(this.XB,this.FPage);
   else par = this.XB.lastChild;
   }

if(!src && !Def && !par.Page && Is(par,"AddParent")) return this.AddRow(par.parentNode,Get(par,"AddParent")==2?null:par,show,id,Def,src,master,test);
if(next && par.Page && this.Root.AddParent==2) next = null;

var D;
if(src) D = this.Def[src.Def.Name];
if(D) { if(!src.CPage && !this.TestDef(par,D.Name)&&(!old||typeof(old)!="object")) return null; } 
else {
   var def = Def; if(!def) { def = Get(par.Page?this.Root:par,"CDef"); if(!def) return null; } 
   D = this.Def[def]; if(!D) {
      MS.Debug; if(!test) this.Debug(1,"Not defined default row ",def,", cannot add new row to this grid"); ME.Debug; 
      return null;
      }
   }

MS._Free;
MS._Debug;if(0){ ME._Debug; 
var cnt = 26+7;
for(var r=this.GetFirst();r;r=this.GetNext(r),cnt--) if(cnt<=1) return null;
MS._Debug;} ME._Debug; 
ME._Free;

if(!this.HasChildren(par)) par.State = 4;
if(par.State<2) return null; 
if(test&&this.Group&&!this.MainColGroup&&par.Def&&!par.Def.Group&&this.GroupMoveFree!=2) return null; 
if(test) return true;
if(!par.Page && Get(par,"DefParent") && !this.HasNDChildren(par)) this.ChangeDef(par,Get(par,"DefParent"),1,2);
var r = old&&typeof(old)=="object" ? old : Dom.createElement("I"); if(r.Removed) delete r.Removed;
if(next) par.insertBefore(r,next);
else {
   if(this.Paging==3 && par.tagName=="BR") par = this.UpdateTagName(par); 
   par.appendChild(r);
   }
r.Def = D;
r.Expanded = D.Expanded ? 1 : 0;
r.Kind = D.Kind;
r.Calculated = D.Calculated ? 1 : 0;
r.Visible = D.Visible ? 1 : 0;
r.Spanned = D.Spanned ? 1 : 0;
if(r.Spanned) this.UpdateSpan(r);
r.Level = par.SPage ? par.Level : par.Level+1;

r.Added = 1;
r.Visible = 0;
r.State = r.Expanded ? 4 : 2;
r.DetailCol = D.DetailCol;
for(var c in this.Cols) if(c!="Panel" && !Get(r,c)) r[c] = this.GetValue(r,c); 
if(this.DefaultSortPos) r[this.DefaultSort] = this.DefaultSortPos++;
this.LoadedCount++;
 

MS.Master;
if(D.EditCols){
   var EC = (D.EditCols+"").split(',');
   for(var i=0;i<EC.length;i++){
      var c = EC[i];
      if(c=="Main" || c=="MainCol"){
         MS.Tree;
         MS.Group;
         if(this.Group){
            var gc = this.GetGroupCol(r);
            if(gc){
               r[this.MainCol+"CopyTo"] = "Children,"+gc;
               r[this.MainCol+"CanEdit"] = 1;
               r[this.MainCol] = Get(r,gc);
               }
            }
         ME.Group;   
         ME.Tree;
         }
      else {
         r[c+"CopyTo"] = "Children,"+c;
         r[c+"CanEdit"] = 1;
         }
      }
   r.HasCopyTo = 1;
   }
if(par.Def && (par.Def.Group || par.Def.HasCopyTo) || par.HasCopyTo) this.UpdateCopyTo(r,par); 
ME.Master;

if(src){
   var N = {DetailRow:1,DetailGrid:1,MasterRow:1,Def:1,r0:1,r1:1,r2:1,Count:1,Hasch:1,id:1,Level:1,LevelImg:1,Added:1,Filtered:1,HasIndex:1,Updated:1};
   if(src.RowSpan) for(var c in this.Cols) { N[c+"RowSpan"] = 1; N.RowSpan = 1; }
   if(this.RowIndex) N[this.RowIndex] = 1;
   if(D!=src.Def && (!Grids.OnRowCopyDef||!Grids.OnRowCopyDef(this,r,src,src.WillMove?1:0))) for(var i in src.Def) if(!Grids.INames[i] && !N[i] && src.Def[i]!=null) r[i] = src.Def[i]; 
   if(this.EditAttrs){ 
      if(!A) A = this.GetEditAttrs(3,null,{RowSpan:1}); var al = A.length;
      if(al) for(var c in this.Cols) for(var i=0;i<al;i++) r[c+A[i]] = src[c+A[i]];
      }
   else for(var i in src) if(!Grids.INames[i] && !N[i] && src[i]!=null) r[i] = src[i]; 
   r.Selected = 0; r.Visible = 0; r.Hasch = 0; r.State = 4;
   }
if(id) { 
   r.id = id; 
   if(this.SetIds) this.SetRowsId(r); 
   }
else if(src){

   if(!Grids.OnRowCopyId || !Grids.OnRowCopyId(this,r,src,src.WillMove?1:0)) this.SetRowId(r);
   else if(this.SetIds) this.SetRowsId(r); 
   }
else this.SetRowId(r);
if(this.AllSelected && !r.Selected && this.CanSelect(r)) {
   if(this.SelectAllType&16) r.Selected = 1;
   else this.SetAllSelected(0);
   }
 
MS.Undo;   
if(!this.MasterGrid&&!noundo) { 
   this.AddUndo({ Type:"Add",Row:r,Parent:par,Next:next,Id:r.id,Def:r.Def.Name,Src:src,SrcVisible:src?src.Visible:null });
   if(this.SaveOrder && !Is(r,"NoUpload")) this.SetChange({ Row:r.id,Parent:par.id?par.id:par.Pos,Next:next?next.id:null,Added:1,Copy:src?src.id:"" },1);
   }
ME.Undo;

var mergeundo = 0;
MS.Group; if(this.Group && this.Grouped && this.GroupChangeMoved) if(this.UpdateRowGroups(r,0)) mergeundo++; ME.Group;

MS.Tree;
if(D.Children && !src && !old){
   for(var i=0;i<D.Children.length;i++){
      var d = D.Children[i];
      if(d.Def==D) continue; 
      var ch = this.AddRow(r,null,false,null,d.Def.Name); mergeundo++;
      for(var j in d) if(j!="id" && !this.IdTypes[j]) ch[j] = d[j];
      }
   this.UpdateChildrenLevelImg(r);
   r.State = 2;
   }
ME.Tree;

MS.Undo;   
while(mergeundo--) this.MergeUndo();
ME.Undo;   

MS.RowSpan; 
if(this.RowSpan) { 
   var O = {}, U = null; 
   if(this.Undo&1&&this.OUndo) U = this.GetUndoSpan(O);
   this.AddRowSpan([r],O,U); 
   if(U) this.AddUndo({ Type:"AddSpan",Data:U },1);
   for(var ro in O) this.RefreshRow(O[ro]); 
   } 
ME.RowSpan;

MS.CPages;
if(par.CPage) this.UpdateCPages(par.parentNode,show);
ME.CPages;



if(show&4 && !master){
   if(Grids.OnRowAdd) Grids.OnRowAdd(this,r);
   if(src && Grids.OnRowCopy) Grids.OnRowCopy(this,r,src);
   }
if(show&3 && (!src||Is(src,"Visible"))){ 
   if(this.MainTable) this.ShowRow(r);
   else r.Visible = 1;
   this.UpdateRowIcons(r);
   if(show&2) this.ExpandParents(r);
   }

MS.Master;
if(!(master&1) && par.MasterRow){ 
   var nr = this.MasterGrid.AddRow(par.MasterRow,next?next.MasterRow:null,show&~2,id,Def,src,2);
   r.MasterRow = nr;
   if(nr){ 
      if(nr.DetailRow) { nr.DetailRow[nr.DetailRow.length] = r; nr.DetailGrid[nr.DetailGrid.length] = this; }
      else { nr.DetailRow = [r]; nr.DetailGrid = [this]; }
      }
   }
if(par.DetailRow&&!(master&2)) this.AddInDetail(r,show,master?src:null); 

ME.Master;

MS.Pivot; if(this.PivotGrid) this.AddPivotRow(r,src); ME.Pivot;

if(show&4) {
   
   this.Recalculate(r,null,true);
   if(!this.MasterGrid) this.UploadChanges(r);
   if(this.SaveValues) this.SaveCfg();
   }

return r;
}
// -----------------------------------------------------------------------------------------------------------
TGP.AddRows = function(cnt,par,next,focus,test,noupload,id,paste,src){ 
if(!this.Adding||this.Locked["addrow"] || this.Detail && !this.XB.firstChild.MasterRow) return null;
if(Grids.OnCanRowAdd) { var tmp = Grids.OnCanRowAdd(this,par,next); if(!tmp&&tmp!=null) return null; }
if(this.Group&&!this.MainColGroup&&par&&par.Def&&!par.Def.Group&&this.GroupMoveFree!=2) return null; 
if(test) return this.AddRow(par,next,null,null,null,null,null,1) ? 1 : 0;
MS.Animate; this.FinishAnimations(); ME.Animate; 
this.StartUpdate();
var A = [], p = 0;
for(var i=cnt?cnt:1,fr=null;i>0;i--){
   var r = this.AddRow(par,next,(noupload?1:5)+(paste?0:2),id,null,src);
   if(!r){  
      this.EndUpdate();
      this.ShowMessageTime(par&&!par.Page?this.GetText("ErrAdd").replace("%1",this.GetName(par)):this.GetText("ErrAddRoot"),this.EditErrorsMessageTime?this.EditErrorsMessageTime:1000);
      return null;
      }
   if(Grids.OnRowAdded) Grids.OnRowAdded(this,r,paste);
   A[p++] = r;
   }
if(focus) {
   var r1 = A[0], r2 = A[A.length-1], G = this;
   while(r1&&r1.DetailRow&&r2.DetailRow&&!r1.DetailRow[0].Page) { 
   
      G = r1.DetailGrid[0]; r1 = r1.DetailRow[0]; r2 = r2.DetailRow[0]; 
      }
   G.FocusRows(r1,r2);
   }
this.EndUpdate(A.length==1?A[0]:null);
this.CalcTreeWidth();
MS.Animate; if(cnt>1) this.AnimRows(A,"AddRows",1); else this.AnimRow(A[0],"Add",1); ME.Animate;
return cnt?A:A[0];
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetActualPage = function(){ 
if(!this.Paging) return this.XB.firstChild;
MS.Paging;
if(this.AllPages){
   if(this.FRow && !this.FRow.Fixed) return this.GetRowPage(this.FRow);
   var A = this.GetShowedPages();
   return GetNode(this.XB,A[0]);
   }
else return this.FPage!=null ? GetNode(this.XB,this.FPage) : null;
ME.Paging;
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
TGP.DoAddRows = function(F,T,S,below){ 
if(!this.Adding||this.Locked["addrow"]) return false;
if(this.EditAttrsEmpty) return S&4 ? this.CopyRow2(F,1,1,0,T) : this.CopySelectedRows(F,0,1,below?1:0,S&1,T);
var row = this.GetARow(F&5?F&5:5,below?2:1); 
MS.Master; if(F&1&&!row&&this.FocusNested(T)&&this.LastFocus[0].Adding&&!(this.LastFocus[0].Locked["addrow"])) row = this.Rows[this.LastFocus[1]]; ME.Master;
if(!row||row.Fixed) return false;
var cnt = 0;
if(!S) cnt = 1;
else {
   var R = this.GetARows(S);
   for(var id in R) if(!R[id].Deleted) cnt++;
   }
if(!cnt) return cnt;
var A = this.AddRows(cnt,row.parentNode,below?row.nextSibling:row,1,T); if(!A) return false;
if(T) return cnt;
if(!below && row==this.ARow) this.ARow = A[0];
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionAddRow = function(F,T){ return this.DoAddRows(F,T,0,0); }
TGP.ActionAddRowBelow = function(F,T){ return this.DoAddRows(F,T,0,1); }
TGP.ActionAddRows = function(F,T){ return this.DoAddRows(F,T,F&~5|1,0); }
TGP.ActionAddRowsBelow = function(F,T){ return this.DoAddRows(F,T,F&~5|1,1); }
TGP.ActionAddSelected = function(F,T){ return this.DoAddRows(F,T,F&~5|2,0); }
TGP.ActionAddSelectedBelow = function(F,T){ return this.DoAddRows(F,T,F&~5|2,1); }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionAddRowEndPage = function(F,T){ 
MS.Master; if(F&1&&this.FocusNested(T)&&this.LastFocus[0].Adding&&!(this.LastFocus[0].Locked["addrow"])) return this.LastFocus[0].ActionAddRowEndGrid(0,T); ME.Master;
return !!this.AddRows(1,this.GetActualPage(),null,1,T); 
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionAddRowEndGrid = function(F,T){ 
MS.Master; if(F&1&&this.FocusNested(T)&&this.LastFocus[0].Adding&&!(this.LastFocus[0].Locked["addrow"])) return this.LastFocus[0].ActionAddRowEndGrid(0,T); ME.Master;
var b = this.XB.lastChild;
if(T) return this.AddRows(1,b,null,1,T);
if(this.Paging && !this.AllPages && this.FPage!=this.XB.childNodes.length-1) this.GoToPage(b);
if(b.State!=4){
   if(this.AllPages && (b.State==2||b.State==0)) { this.GoToPage(b); this.ShowPages(); } 
   T = this;
   setTimeout(function(){T.ActionAddRowEndGrid();},100);
   return true;
   }   
return !!this.AddRows(1,b,null,1); 
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionAddRowEnd = function(F,T){ 
return this.AllPages ? this.ActionAddRowEndGrid(F,T) : this.ActionAddRowEndPage(F,T);
}
// -----------------------------------------------------------------------------------------------------------
TGP.AddChild = function(F,type,test){ 
var row = this.GetARow(F);
MS.Master; if(F&1&&!row&&this.FocusNested(test)&&this.LastFocus[0].Adding&&!(this.LastFocus[0].Locked["addrow"])) row = this.Rows[this.LastFocus[1]]; ME.Master;
if(row==null || row.Fixed || row.Page || !this.MainCol || !Is(row,"AcceptChild")) return false;
var next = type ? null : row.firstChild;
if(this.AddChildType&1) type = 1;
MS.Paging;
var fc = row.firstChild;
if(fc && fc.CPage || !fc && row.Count) { 
   
   if(!row.Expanded && !row.Page && !test) this.Expand(row);
   if(row.State<4 && !test){ 
      var T = this;
      setTimeout(function(){ T.AddChild(F,type); },100);
      return true; 
      }
   MS.CPages;   
   if(fc){ 
      if(type) row = row.lastChild;
      else { row = fc; next = fc.firstChild; }
      }
   ME.CPages;   
   }
ME.Paging;
if(!this.AddRows(1,row,next,1,test)) return false;
if(test) return row.Count ? row.Count+1 : row.childNodes.length+1;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionAddChild = function(F,T){ return this.AddChild(F,0,T); }
TGP.ActionAddChildEnd = function(F,T){ return this.AddChild(F,1,T); }
// -----------------------------------------------------------------------------------------------------------
ME.Add;

// -----------------------------------------------------------------------------------------------------------
MS.Master;
TGP.UpdateCopyTo = function(row,par,refresh){
var ppar = par.parentNode, D = par.Def;
if(ppar && ppar.Def && ppar.Def.Group) this.UpdateCopyTo(row,ppar,refresh);
for(var cc in this.Cols) {
   var cp = par[cc+"CopyTo"]; if(cp==null) cp = D[cc+"CopyTo"];
   if(!cp) continue;
   cp = cp.split(',');
   for(var i=0;i<cp.length;i+=2){
      var s = cp[i].split('_');
      if(s[0]=="Child") {
         if(s[1]-0+""==s[1]) n = GetNode(par,s[1]-0);
         else for(var n=par.firstChild;n;n=n.nextSibling) if(n.Def==s[1]) break;
         if(n!=row) continue;
         }
      else if(s[0]!="Children") continue;
      if(refresh) this.SetValue(row,cp[i+1],Get(par,cc),1);
      else row[cp[i+1]] = Get(par,cc); 
      }
   }
}
ME.Master;
// -----------------------------------------------------------------------------------------------------------
MS.Group;
TGP.UpdateRowGroups = function(row,show){
var G = this.Group.split(","), rows = [], M = this.MainCol;
if(row.Def.Group){
   for(var p=row;p&&p.Def.Group;p=p.firstChild);
   while(p){ rows[rows.length] = p; p = p.nextSibling; }
   }
else rows[0] = row;   
if(!rows.length) return false;
for(var p=rows[0].parentNode;p&&p.Def&&!p.Def.Group;p=p.parentNode);
var v = {}; for(var i=0;i<G.length;i++) v[G[i]] = "";
for(;p&&p.Def&&p.Def.Group;p=p.parentNode) if(!p.SPage){
   var c = this.GetGroupCol(p);
   if(c) v[c] = v[c] ? p[M] + this.Cols[c].GroupChar + v[c] : p[M];
   }
this.UndoStart();   
for(var i=0;i<rows.length;i++) {
   for(var c in v) this.SetValue(rows[i],c,v[c],show);   
   if(rows[i]!=row && rows[i].firstChild) this.UpdateRowGroups(rows[i],show);
   }
this.UndoEnd();
return true;
}   
ME.Group;
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Deletes row from table, and also all references to it
MS.Show;
TGP.DelRow = function(row,nonested){
if(row.Removed && row.Removed!=-1) return;
row.Deleted = 0; 
if(row.r1){
   row.Removed = 1; 
   if(!row.Visible) this.ClearRow(row);
   else if(this.HideRow(row,1,null,1)==-1) return; 
   row.Removed = 0;
   }
if(row.parentNode.Count) row.parentNode.Count--;
for(var r=row.firstChild;r;) { var n = r.nextSibling; this.DelRow(r,nonested); r = n; } 
 
this.UndoStart();

MS.RowSpan; 
if(row.RowSpan) { 
   var O = {}, U = null, oldprev = row.previousSibling; 
   if(this.Undo&1&&this.OUndo){ U = this.GetUndoSpan(O); if(oldprev) U.UpdateRowSpan[oldprev.id] = 1; }
   for(var col in this.SpanCols) if(row[col+"RowSpan"]>1) this.SplitSpanned(row,col);
   this.RemoveRowSpan([row],O,U); if(U) this.AddUndo({ Type:"RemoveSpan",Data:U });
   for(var ro in O) this.RefreshRow(O[ro]); 
   } 
ME.RowSpan;

MS.Master;
if(row.DetailRow) for(var i=0;i<row.DetailRow.length;i++){
   if(!row.DetailRow[i].Page) row.DetailGrid[i].DelRow(row.DetailRow[i]); 
   else if(!nonested) this.RefreshDetail(row.DetailGrid[i],1); 
   else continue;
   i--; 
   if(!row.DetailRow) break;
   }
if(row.MasterRow) this.DelDetail(row);
ME.Master;


MS.Undo; if(this.Undo) { var n = row.parentNode.Page ? this.GetNextSibling(row) : row.nextSibling, p = row.parentNode; this.AddUndo({Type:"Remove",Row:row,NextId:n?n.id:null,ParentId:p.id,Page:p.Page,Removed:1}); } ME.Undo;
if(this.SetIds) delete this.Rows[row.id];
row.parentNode.removeChild(row);
MS.RowSpan; if(row.RowSpan && oldprev) this.UpdateRowSpan(oldprev,1); ME.RowSpan;
this.UndoEnd(); this.MergeUndo(); 
row.Removed = 1;
this.LoadedCount--;
}
TGP.RemoveRow = TGP.DelRow;
ME.Show;
// -----------------------------------------------------------------------------------------------------------

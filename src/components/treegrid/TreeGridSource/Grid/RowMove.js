// -----------------------------------------------------------------------------------------------------------
// Moves row to parent before row next
// If next==null moves it as the last row of parent's children
// If show==true, shows changes in table
// Returns 0 - no move, 1 - move inside parent, 2 - move to another parent
MS.Move;
TGP.MoveRowOne = function(row,par,next,show,master,noexpand,prevspan,noundo,noicons){
var oldpar = row.parentNode, oldnext = row.nextSibling, moved, oldpage = this.GetRowPage ? this.GetRowPage(row) : {State:4}, oldprev = null;

if(next) par = next.parentNode;
if(!par){
   if(!this.AllPages) par = GetNode(this.XB,this.FPage);
   else par = this.XB.lastChild;
   }
if(!oldnext){ 
   for(oldprev=row.previousSibling;oldprev && !oldprev.Visible;oldprev = oldprev.previousSibling);
   }
if(!next && !oldnext && par==row.parentNode || next && next==oldnext || row==next) return 0; 

if(par.State<2) return 0; 
for(var r=par;r;r=r.parentNode) if(r==row) return 0; 
if(oldpar!=par) moved = 2;
else moved = 1;



MS.Tree;
if(row.Visible && this.MainCol){ 
   row.Visible = 0;
   this.UpdateRowIcons(row,show);
   row.Visible = 1;
   }
ME.Tree;  
if(!noundo) this.UndoStart();
MS.FocusRect; 
if(this.FRect && this.SelectingFocus&&this.Selecting&&this.SelectingCells && this.IsFocused(row) && (!this.FRect[7]||!(this.SelectingFocus&4))) {
   if(this.FRect[6]&&this.SelectingFocus&4) this.SelectRow(row,0); 
   else this.SelectRange(row,this.FRect[1],row,this.FRect[3],0); 
   }
ME.FocusRect;
if(!par.Page && Get(par,"DefParent") && !this.HasNDChildren(par) && !row.Deleted) this.ChangeDef(par,Get(par,"DefParent"),show,2);
if(next) par.insertBefore(row,next);
else par.appendChild(row);
if(!oldpar.Page && Get(oldpar,"DefEmpty") && !this.HasNDChildren(oldpar) && !row.Deleted) this.ChangeDef(oldpar,Get(oldpar,"DefEmpty"),show,2);

MS.Pivot; if(this.PivotGrid && moved==2) this.MovePivotRow(row,oldpar); ME.Pivot;
MS.Master;
if(par.Def && (par.Def.Group || par.Def.HasCopyTo) || par.HasCopyTo) this.UpdateCopyTo(row,par,1); 
ME.Master;

if(this.FullId) this.SetIdUnique(row); 

if(Grids.OnRowMove) Grids.OnRowMove(this,row,oldpar,oldnext);

if(!noundo && !row.MasterRow) {
   this.AddUndo({Type:"Move",Row:row,Parent:par,Next:next,OldParent:oldpar,OldNext:oldnext,Moved:row.Moved});
   if(this.SaveOrder && !Is(row,"NoUpload")) this.SetChange({ Row:row.id,Parent:par.id?par.id:par.Pos,Next:next?next.id:null,Moved:moved });
   }
if((!row.Moved || row.Moved<moved)&&!this.NoSetRowState) row.Moved = moved;

MS.Master;
var P = null;
if(!(master&2) && (row.DetailRow||par.DetailRow)){ 
   var G = row.DetailGrid ? row.DetailGrid.slice() : []; P = par.DetailGrid ? par.DetailGrid.slice() : [];
   for(var i=0;i<G.length;i++) {
      for(var j=0;j<P.length;j++){
         if(G[i]==P[j]) {
            var nextr = null;
            if(next) for(var rr=next;rr;rr=rr.nextSibling) if(rr.DetailGrid) {  
               for(var j=0;j<rr.DetailGrid.length;j++) if(rr.DetailGrid[j]==G[i]){ nextr = rr.DetailRow[j]; break; } 
               if(nextr) break;
               }
            G[i].MoveRowOne(row.DetailRow[i],par.DetailRow[j],nextr,1,1,1,prevspan,1);
            G[i] = null; P[j] = null;
            }
         }
      }
   for(var i=G.length-1;i>=0;i--) if(G[i] && !row.DetailRow[i].Page) G[i].DelRow(row.DetailRow[i]); 
   this.DelDetailGrids(row);
   
   }
ME.Master;

if(show){ 
   if(oldpage.State!=4){  
      row.Visible = 0;
      row.r1 = null;
      this.ShowRow(row);
      }
   else {
      MS.Tree;
      if(!noexpand && !par.Expanded && !par.Page){ 
         
         if(par.firstChild==row&&par.lastChild==row){
            par.Expanded = 1;
            this.UpdateIcon(par);
            }
         else this.Expand(par,0,null,1);
         }
      ME.Tree;
      if(!par.r1&&!par.rch1 || par.State<3 || !par.Expanded && !par.Page && !Is(par,"CanExpand")) this.TableDelRow(row,oldpar); 
      else { 
         var nr1 = !row.r1;
         for(var r=row.parentNode,lev=0;r&&!r.Page;r=r.parentNode) if(!(r.Expanded&2)) lev++; 
         row.Level = lev;
         if(!nr1||row.Visible){ 
            this.TableAddRow(row,oldpar);
            if(nr1 && row.Expanded && this.HasChildren(row)) {
               this.UpdateChildrenLevel(row);
               this.Expand(row,true);
               }
            }
         }

      if(this.ColorState&2) this.ColorRow(row);
      
      }
   if(!this.HasChildren(oldpar)){ 
      if(oldpar.Page){
         MS.Paging;
         if(noundo) oldpar.Next = oldpar.nextSibling;
         this.DelEmptyPage(oldpar,!noundo);
         ME.Paging;
         }
      else if(oldpage.State==4){
         this.UpdateIcon(oldpar);
         oldpar.Hasch = null; 
         }
      }
   this.Update();
   }
if(!noundo) this.UndoEnd();
MS.Group; if(this.Group && this.Grouped && this.GroupChangeMoved) this.UpdateRowGroups(row,show); ME.Group; 

MS.Tree;
if(this.MainCol){
   
   var all = !row.LevelImg && par==oldpar; 
   this.UpdateLevelImg(row,show);
   this.UpdateChildrenLevelImg(row,show,all);
   if(!noicons) this.UpdateRowIcons(row,show);
   if(oldpar.Level-(oldpar.Expanded&2?1:0)!=par.Level-(par.Expanded&2?1:0) && row.Hasch==4 && !this.HideTree) this.SetWidth(this.MainCol,0,1,row);
   
   MS.CPages;
   if(par.CPage) this.UpdateCPages(par.parentNode);
   if(oldpar.CPage){
      if(!par.CPage || oldpar.parentNode!=par.parentNode) this.UpdateCPages(oldpar.parentNode);
      }
   ME.CPages;
   }
ME.Tree;

MS.FocusRect;
var FR = this.FRect; 
if(FR){
   if((FR[0]==row||FR[2]==row) && !this.GetRowsOrder(FR[0],FR[2])){ var fr = FR[0]; FR[0] = FR[2]; FR[2] = fr; }
   if(this.SelectingFocus&&this.Selecting&&this.SelectingCells && this.IsFocused(row) && (!FR[7]||!(this.SelectingFocus&4))) {
      if((FR[0]==row||FR[2]==row)){ this.ClearSelection(1); if(this.SelectingFocus&4&&FR[6]) this.SelectRange(FR[0],null,FR[2],null,1); else this.SelectRange(FR[0],FR[1],FR[2],FR[3],1); }
      else if(this.SelectingFocus&4&&FR[6]) this.SelectRow(row,1);
      else this.SelectRange(row,FR[1],row,FR[3],1);
      }
   }
ME.FocusRect;

MS.Master;
if(!(master&1) && row.MasterRow){ 
   var G = this.MasterGrid;
   if(!par.MasterRow.Expanded) G.Expand(par.MasterRow); 
   G.MoveRowOne(row.MasterRow,par.MasterRow,next?next.MasterRow:null,1,2,1,prevspan,noundo);
   G.Update();
   }
if(P) for(var i=0;i<P.length;i++) if(P[i]) this.AddInDetail(row,show?5:0,null,i); 

ME.Master;
return moved;
}
ME.Move;
// -----------------------------------------------------------------------------------------------------------
MS.Drag;
// -----------------------------------------------------------------------------------------------------------
// Moves row "row" to row "to" according to "type" (1 - in front of to, 2 - into children of to, 3 - behind to)
// If set noexpand, does not expand parent for type 1 and 3
TGP.MoveRows = function(row,to,type,noexpand,noupload){

var ret, oldpar = row.parentNode;
if(!to&&type==2 || to == row || type==0) return;

switch(type){
   case 1: ret = this.MoveRow(row,null,to,true,null,noexpand); break;
   case 2: 
      MS.Tree;
      if(to.firstChild && to.firstChild.CPage) to = to.lastChild; 
      if(to.DetailRow) noexpand = 1;
      if(!noexpand&&!to.Page){
         var can = Is(to,"CanExpand");
         if(can && !to.Expanded && !to.Page) this.Expand(to);
         if(to.State==0||to.State==2) {
            if(can && this.HasChildren(to)) return; 
            if(!to.firstChild&&can) to.State = 4;
            else {
               to.Expanded = 0;
               this.TableDelRow(row);
               ret = this.MoveRow(row,to,null,false); 
               this.Expand(to);
               break;
               }
            }
         else if(to.State==1||to.State==3){ 
            var T = this;
            setTimeout(function(){ T.MoveRows(row,to,type,noexpand,noupload); },100);
            return;
            }
         }
      ret = this.MoveRow(row,to,null,true,null,noexpand); 
      ME.Tree;
      break;
   case 3: ret = this.MoveRow(row,to.parentNode,to.nextSibling,true,null,noexpand,1); break;
   }
if(ret&&!noupload) { this.CalcTreeWidth(); this.UploadChanges(row); }

MS.Calc;
var newpar = row.parentNode;
if(!this.MasterGrid && (oldpar!=newpar && (!oldpar.Page || !newpar.Page)||this.FormulaEditing)){ 
   this.Recalculate(row,null,true);
   if(!oldpar.Removed&&oldpar!=newpar) this.Recalculate(oldpar,null,true);
   }
ME.Calc;
    
}
// -----------------------------------------------------------------------------------------------------------
// Moves all rows in array
TGP.MoveAllRows = function(A,to,type){
if(type==2){ 
   if(!to.Expanded) this.Expand(to);
   else if(to.State==2&&!to.Hasch){ 
      this.CreateChildren(to); to.State = 4;
      }
   if(to.State<4){ 
      var T = this;
      setTimeout(function(){ T.MoveAllRows(A,to,type); },100); return;
      }
   }
this.MoveRows(A[0],to,type);          
for(var i=1;i<A.length;i++) this.MoveRows(A[i],A[i-1],3); 
}
// -----------------------------------------------------------------------------------------------------------
// Moves row to another grid, returns index of added row
// If copy is true, original row is not deleted
// If copy is 2, does not copy children
TGP.MoveRowsToGrid = function(row,G,to,type,copy,recur,master){
MS.Add;
if(copy==null) copy = this.DragCopy;
if(copy&&row.Deleted&&!this.CopyDeleted) return;
MS.Master;
if(!master && this!=G && (this.MasterGrid || G.MasterGrid)){
   for(var T=this;T.MasterGrid;T=T.MasterGrid);
   for(var N=G;N.MasterGrid;N=N.MasterGrid);
   if(T==N){
      for(var R=row;R.MasterRow;R=R.MasterRow);
      if(to) for(var M=to.Fixed?G.XB.firstChild:to;M.MasterRow;M=M.MasterRow);
      
      if(copy){ 
         var A = T.CopyRows([R],R.parentNode,R,copy==1,0,0); if(!A) return; 
         R = A[0];
         }
      T.MoveRows(R,to?M:null,to&&to.Fixed?2:type,1);
      return;
      }
   }
ME.Master;

MS.Tree;
var doexp = 0;
if(to!=null && !recur && type==2){
   if(to.firstChild && to.firstChild.CPage) to = to.lastChild; 
   if(!to.Expanded && !to.Page) G.Expand(to);
   if(to.State==0||to.State==2) {
      if(this.HasChildren(to)) return; 
      if(!to.firstChild) to.State = 4;
      else { to.Expanded = 0; doexp = 1; }
      }
   else if(to.State==1 || to.State==3){ 
      var T = this;
      setTimeout(function(){ T.MoveRowsToGrid(row,G,to,type,copy); },100);
      return;
      }
   }
ME.Tree;
this.StartUpdate();
G.StartUpdate();

var r = row.id&&!copy?G.GetRowById(row.id):null; 
if(r&&(r.Deleted||recur&&r.parentNode.id==(type==2?to.id:to.parentNode.id))){ 
   G.MoveRows(r,to&&!to.Fixed?to:null,type);
   G.DeleteRowT(r,3);
   r.Selected = row.Selected;
   for(var c in this.Cols) G.SetValue(r,c,Get(row,c));
   for(var c in G.Cols) G.SetValue(r,c,Get(row,c));
   }
else {
   if(row.WillMove||!copy && Grids.OnRowCopyId) row.WillMove = !copy && Grids.OnRowCopyId;
   var id = this.DragCopyId&&!copy ? row.id : null;
   if(to==null||to.Fixed) r = G.AddRow(null,null,1,id,null,row);
   else if(type==1) r = G.AddRow(null,to,1,id,null,row);
   else if(type==2) r = G.AddRow(to,null,1,id,null,row);
   else if(type==3) r = G.AddRow(to.parentNode,to.nextSibling,1,null,null,row);
   if(!r) { G.EndUpdate(); this.EndUpdate(); return; } 
   r.Expanded = 0;
   if(row.Deleted && G.DeleteRowT) G.DeleteRowT(r,2);
   var U = G.GetLastUndo();
   if(U) U.Deleted = row.Deleted?1:0;
   if(row.Count && row.State<2) {  
       r.Count = row.Count; r.State = 0; r.Copy = row.Copy ? row.Copy : row.id; 
       if(U) { U.Copy = r.Copy; U.Count = r.Count; }
       } 
   }

// --- children ---
MS.Tree;
if(doexp&&to&&!to.Fixed) G.Expand(to);
if(copy!=2){ 
   for(var n=row.firstChild;n;n=n.nextSibling){
      this.MoveRowsToGrid(n,G,r,2,copy,1);
      }
   }
if(row.Expanded && !r.Expanded) if(!this.HasChildren(r)||Get(r,"CanExpand")==0) r.Expanded = 1; else G.Expand(r);

ME.Tree;
   
G.RefreshRow(r);
G.Recalculate(r,null,true);
if(G.SortRow) G.SortRow(r,null,true);
if(Grids.OnRowMoveToGrid) { var ret = Grids.OnRowMoveToGrid(this,row,G,r,copy); if(ret!=null) copy = ret; }
if(copy==-1) this.DelRow(row);
else if(!copy){ if(this.DeleteRowT) this.DeleteRowT(row,2); }
else this.UploadChanges(row);
G.UploadChanges(r);
G.EndUpdate();
if(!recur) G.CalcTreeWidth();
G.UpdateEmptyRows();
this.EndUpdate();

return r;
ME.Add;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionFixAbove = function(F,T){
var row = this.GetARow(F,1); if(!row || row.Fixed=="Foot" || !Is(row,"CanFix") || row.Space || this.Locked["fixrow"]) return false;
if(!row.Fixed) { var prev = this.GetPrevVisible(row); if(!prev || prev.firstChild || !prev.parentNode.Page) return false; }
return this.FixAbove(row,1,T);
}
// -----------------------------------------------------------------------------------------------------------
TGP.FixAbove = function(row,undo,test,norender){
var H = this.XH, P = this.XB.firstChild, cnt = 0, first = undo&&this.Undo&1 ? this.GetFirst() : null;
if(row.Fixed){
   var block = {};
   for(var r=this.XH.firstChild,blk=0,b=0;r;r=r.nextSibling,blk--,b++){
      if(r.Block>blk) blk = r.Block;
      if(blk>0) block[r.id] = b;
      else b = 0;
      }
   var last = row.previousSibling;
   while(H.lastChild!=last) { 
      var r = H.lastChild; if(!Is(r,"CanFix")) break;
      if(block[r.id]){
         for(var n=r,blk=block[r.id];n&&Is(n,"CanFix")&&blk&&n!=row;n=n.previousSibling,blk--) if(block[n.id]>blk) blk = block[n.id];
         if(blk>1||!n||!Is(n,"CanFix")||block[n.id]>1) break;
         }
      if(test) return true;
      P.insertBefore(r,P.firstChild); cnt++;
      r.Fixed = null;
      r.Level = 0;
      }
   }
else {
   while(1){
      var r = this.GetFirst(); 
      if(r==row||r.firstChild||!Is(r,"CanFix")) break;
      if(r.Block){
         for(var n=r,blk=r.Block;n&&!n.firstChild&&blk&&n!=row&&Is(n,"CanFix");n=this.GetNext(n),blk--) if(n.Block>blk) blk = n.Block;
         if(blk||!n||n.firstChild||!Is(n,"CanFix")) break;
         }
      if(test) return true;
      H.appendChild(r); cnt++; 
      r.Fixed = "Head";
      }  
   }
if(!cnt) return false;
if(undo&&this.Undo&1) this.AddUndo({Type:"FixAbove",Row:row,First:first});
if(this.MainCol) this.UpdateAllLevelImg();
if(norender) return;
if(this.Paging==1||this.Paging==2) this.CreatePages();
this.Render();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionFixBelow = function(F,T){
var row = this.GetARow(F,2); if(!row || row.Fixed=="Head" || !Is(row,"CanFix") || row.Space || this.AutoPages || this.Locked["fixrow"]) return false;
if(!row.Fixed) { var next = this.GetPrevVisible(row); if(!next || next.firstChild || !next.parentNode.Page) return false; }
return this.FixBelow(row,1,T);
}
// -----------------------------------------------------------------------------------------------------------
TGP.FixBelow = function(row,undo,test,norender){
var H = this.XF, P = this.XB.lastChild, cnt = 0, last = undo&&this.Undo&1 ? this.GetLast() : null;
if(row.Fixed){
   var first = row.nextSibling;
   while(H.firstChild!=first) { 
      var r = H.firstChild; if(!Is(r,"CanFix")) break;
      if(r.Block){
         for(var n=r,blk=r.Block;n&&Is(n,"CanFix")&&blk&&n!=row;n=this.GetNext(n),blk--) if(n.Block>blk) blk = n.Block;
         if(blk>1||!n||!Is(n,"CanFix")||n.Block>1) break;
         }
      if(test) return true;
      P.appendChild(r); cnt++;
      r.Fixed = null;
      r.Level = 0;
      }
   }
else {
   var block = {};
   for(var B=this.XB.firstChild;B;B=B.nextSibling) for(var r=B.firstChild,blk=0,b=0;r;r=r.nextSibling,blk--,b++){
      if(r.Block>blk) blk = r.Block;
      if(blk>0) block[r.id] = b;
      else b = 0;
      }
   while(1){
      var r = this.GetLast(); 
      if(r==row||!r.parentNode.Page||!Is(r,"CanFix")) break;
      if(block[r.id]){
         for(var n=r,blk=block[r.id];n&&!n.firstChild&&blk&&n!=row&&Is(n,"CanFix");n=this.GetPrev(n),blk--) if(block[n.id]>blk) blk = block[n.id];
         if(blk||!n||n.firstChild||!Is(n,"CanFix")) break;
         }
      if(test) return true;
      H.insertBefore(r,H.firstChild); cnt++;
      r.Fixed = "Foot";
      }  
   }
if(!cnt) return false;
if(undo&&this.Undo&1) this.AddUndo({Type:"FixBelow",Row:row,Last:last});
if(this.MainCol) this.UpdateAllLevelImg();
if(norender) return;
if(this.Paging==1||this.Paging==2) this.CreatePages();
this.Render();
return true;
}
// -----------------------------------------------------------------------------------------------------------
ME.Drag;

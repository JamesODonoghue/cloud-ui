// -----------------------------------------------------------------------------------------------------------
// Function for expand / collapse
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Expands given row
TGP.Expand = function(row,show,all,master,sync){
MS.Tree;
if((!this.HasChildren(row) || row.Expanded || Get(row,"CanExpand")==0) && !show || this.Locked["expand"]) return;

MS.Master;
var D = Get(row,"Detail");
if(D){
   var zal = row.Expanded; row.Expanded = 1;
   if(!master && this.DetailExpand!=1) this.ShowDetail(row,D); 
   row.Expanded = zal;
   if(!this.DetailExpand) return;
   }
ME.Master;

if(!row.Hasch){ row.Expanded = 0; this.CreateChildren(row); if(row.State==4) row.State = 2; } 
row.Expanded = Get(row,"CanExpand") == 3 ? 3 : 1;
if(this.SaveExpanded && !all) this.SaveCfg();
if(!row.firstChild && row.State==null && this.ChildPaging==3) row.State = 0;
if(row.ExpandCol) this.RefreshCell(row,row.ExpandCol);

if(this.Alternate&&this.AlternateType&1&&!all) this.ReColor();
if(row.Expanded&2 && !row.rch1) {
   var next = this.ReversedTree ? "previousSibling" : "nextSibling";
   for(var i=this.FirstSec;i<=this.LastSec;i++){ 
      var r = row["r"+i]; 
      if(r) row["rch"+i] = r[next];
      }
   }

if(row.State==4){ 
   if(row.Expanded&2) this.UpdateLevelImg(row);
   this.UpdateIcon(row);
   this.TableExpand(row);
   if(show) for(var r=row.firstChild;r;r=r.nextSibling) if(r.Visible) { this.UpdateLevelImg(r); this.UpdateIcon(r); }
   if(!this.NoScrollAfterExpand) this.ScrollIntoView(row,null,null,1); 
   this.SelectFocusExpand(row);
   return true;
   }

if(this.ChildPaging==3 && row.State<2) {
   MS.Paging;
   if(row.State==1 || !row.r1&&!all) return; 
   if(row.Expanded&2) this.UpdateLevelImg(row);
   this.UpdateIcon(row,4);
   if(all && this.ChildParts>=2 && this.ChildPartMin==0){ 
      this.TableExpand(row);
      var st = row.State;
      this.RenderPage(row);
      this.SelectFocusExpand(row);
      row.State = st;
      return true;
      }
   else {
      row.State = 1;
      var async = this.HasChildCount(row,4);
      if(async) this.ShowPageMessage(row,"LoadPage");
      this.DownloadChildren(row,async,all);
      return false;
      }
   ME.Paging;
   }

if(row.Expanded&2) this.UpdateChildrenLevelImg(row);

if(all||!this.ChildPaging) {
   if(row.Expanded&2) this.UpdateLevelImg(row);
   this.UpdateIcon(row);
   this.RenderPage(row);  
   this.SelectFocusExpand(row);
   return true;
   }

if(this.ChildParts&&this.ChildPartMin<=20 || !this.HasChildCount(row,20) || sync){ 
   if(row.Expanded&2) this.UpdateLevelImg(row);
   this.UpdateIcon(row);
   this.RenderPage(row); 
   this.SelectFocusExpand(row);
   if(!this.NoScrollAfterExpand) this.ScrollIntoView(row,null,null,1); 
   this.Update(); 
   return true;
   }

if(row.Expanded&2) this.UpdateLevelImg(row);
this.UpdateIcon(row,4);
this.RenderChildren(row);
this.SelectFocusExpand(row);
return false;
ME.Tree;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SelectFocusExpand = function(row){
MS.FocusRect;
if(this.Selecting && this.SelectingCells>=3 && !(this.SelectHidden&2) && this.SelectingFocus && this.FRect && this.IsFocused(row)&&row!=this.FRect[this.ReversedTree?0:2]&&!this.FRect[7]) {
   this.SelectRange(this.FRect[0],this.FRect[6]?null:this.FRect[1],this.FRect[2],this.FRect[6]?null:this.FRect[3],1);
   }
ME.FocusRect;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ExpandParents = function(row){
MS.Tree;
if(!row || row.Fixed || !row.Visible || row.Page) return;
var par = row.parentNode;
while(par && !par.Page){
   if(!par.Visible&&!par.SPage) this.ShowRow(par);
   if(!par.Expanded&&!par.SPage) this.Expand(par,0,0,1);
   par = par.parentNode;
   }
ME.Tree;
}
// -----------------------------------------------------------------------------------------------------------
MS.Tree;
MS.Paging;
TGP.DownloadChildren = function(row,async,all,func){
var T = this, reloadindex = this.ReloadIndex;
row = this.UpdateTagName(row);
MS.Copy;
function UseCopy(row){ 
   for(var r=row.firstChild;r;r=r.nextSibling){
      r.Added = 1;
      var id = r.id;
      T.SetRowId(r);
      if(r.firstChild) UseCopy(r);
      else if(r.Count) r.Copy = id;
      if(Grids.OnRowAdd) Grids.OnRowAdd(T,r);
      }                  
   }
ME.Copy;   
this.DownloadPage(row,function(result){ 
   if(reloadindex!=T.ReloadIndex) return; 
   T.PageLoaded(result,row);
   T.UpdateIcon(row);
   if(row.firstChild==null){ 
      MS.Debug; if(row.Count) T.Debug(2,"No children returned for ",row.id); ME.Debug;
      row.Count = 0;
      row.State = 4;
      if(row.Copy) row.Copy = null;
      T.DeleteChildren(row);
      T.RefreshRow(row);
      return;
      }
   if(result>=0){
      if(T.Alternate&&T.AlternateType&1&&!all) T.ReColor();
      MS.Copy; if(row.Copy) UseCopy(row); ME.Copy;
      if(row.Expanded && (row.Visible||row.Expanded&2) && row.Hasch){
         if(async>0 && !T.ColPaging) T.RenderChildren(row);
         else if(!async || T.ColPaging&&async>0) T.RenderPage(row);
         }
      else row.State = 2;
      MS.Master; if(row.DetailRow) T.ShowDetail(row,Get(row,"Detail"),0,1); ME.Master;
      }
   if(func) func(result);
   });
}
ME.Paging;
// -----------------------------------------------------------------------------------------------------------
// Renders row's children asynchronously
TGP.RenderChildren = function(row){
var T = this, reloadindex = this.ReloadIndex;
this.ShowPageMessage(row,"RenderPage");
row.State = 3;
setTimeout(function(){
   if(reloadindex!=T.ReloadIndex) return; 
   T.UpdateIcon(row);
   if(row.State<4){
      T.RenderPage(row); 
      if(!T.NoScrollAfterExpand) T.ScrollIntoView(row,null,null,1); 
      T.Update(); 
      }
   },10);
}
// -----------------------------------------------------------------------------------------------------------
ME.Tree;
// -----------------------------------------------------------------------------------------------------------
// Collapses given row
TGP.Collapse = function(row,all){
MS.Tree;
if(!this.HasChildren(row) || !row.Expanded || this.Locked["expand"]) return;
var exp = row.Expanded;
row.Expanded = 0;
if(this.SaveExpanded && !all) this.SaveCfg();
if(row.State==null) row.State = 4; 
this.TableCollapse(row);
if(this.Selecting) {
   if(this.ClearSelected&8) this.ClearChildSelection(row);
   if(this.SelectingCells>=3 && !(this.SelectHidden&2)) this.SelectRange(row.firstChild,this.GetFirstCol(null,null,2),row.lastChild,this.GetLastCol(null,null,2),0);
   }

if(exp&2) this.UpdateLevelImg(row);
this.UpdateIcon(row);
if(row.ExpandCol) this.RefreshCell(row,row.ExpandCol);
if(this.RemoveCollapsed>=3 && !row.CPage){ 
   if(this.RemovePage(row,0) && Grids.OnRemoveCollapsed) Grids.OnRemoveCollapsed(this,row);
   }

if(this.Alternate&&this.AlternateType&1&&!all) this.ReColor();
var r = null, r0 = null, r1 = null, rect = null;
MS.FocusRect;
if(this.FRect){
   rect = this.FRect.slice();
   if(!rect[0].r1 || !rect[0].r1.offsetHeight) for(var r0=rect[0];r0&&!r0.r1||!r0.r1.offsetHeight;r0=r0.parentNode);
   if(!rect[2].r1 || !rect[2].r1.offsetHeight) for(var r1=rect[2];r1&&!r1.r1||!r1.r1.offsetHeight;r1=r1.parentNode);
   if(r0) { if(r0.Page) rect = null; else rect[0] = r0; }
   if(r1) { if(r1.Page) rect = null; else if(rect) rect[2] = r1; }
   }
ME.FocusRect;
if(this.FRow && this.FRow.r1 && !this.FRow.r1.offsetHeight) { 
   var r = this.GetNextVisible(this.FRow); 
   while(r&&!r.Page&&(!r.r1||!r.r1.offsetHeight)) r = r.parentNode;
   if(!r || r.Page || r.Level<this.FRow.Level) {
      r = this.GetPrevVisible(this.FRow);
      while(r&&!r.Page&&(!r.r1||!r.r1.offsetHeight)) r = r.parentNode;
      }
   if(r.Page) r = null;
   
   }
if(r||r0||r1) this.Focus(r?r:this.FRow,this.FCol,null,rect);
ME.Tree;
}
// -----------------------------------------------------------------------------------------------------------
MS.Tree;
MS.ExpandAll;
// -----------------------------------------------------------------------------------------------------------
// Expands all rows
TGP.ExpandAll = function(row,loaded,levels,max,test,render,foc){
MS.Master; if(foc&&!row&&this.FocusNested(test)&&this.LastFocus[0].MainCol) return this.LastFocus[0].ExpandAll(null,loaded,levels,max,test,render,0); ME.Master;
if(levels==null) levels = this.ChildPaging==3 ? 3 : 2;
if(typeof(row)!="object") row = null; 
if(max==null) max = 1e6;
var T = this, R = [], ren = 0, min = this.ChildParts ? this.ChildPartLength : null;
function count(row){
   if(row.Level>=max) return;
   for(var r=row.firstChild;r;r=r.nextSibling) if(r.Visible && (r.Expanded || Is(r,"CanExpand")) || r.Expanded&2){
      if(r.firstChild){            
         if(!r.r1&&!test) { r.Expanded = 1; count(r); }
         else { 
            if(!r.Expanded) R[R.length] = r; 
            if(levels>(r.State!=4?1:0)) count(r); 
            ren += r.State!=4 ? (min!=null?min:r.childNodes.length) : 0.5;
            }
         }
      else if(r.Count && !loaded && !r.Expanded){ 
         if(r.Visible) { R[R.length] = r; ren += (min!=null?min+r.Count/10:r.Count); }
         else if(!test) r.Expanded = 1;  
         }         
      }
   }
if(row) {
   if(row.Page||row.Expanded) count(row);
   else { var n = row.nextSibling; row.nextSibling = null; count({firstChild:row}); row.nextSibling = n; }
   }
else if(this.AllPages) for(var r=this.XB.firstChild;r;r=r.nextSibling) count(r);
else count(GetNode(this.XB,this.FPage));

if(render||render!="0"&&this.RowCount<ren*2&&R.length>10){
   for(var i=0;i<R.length;i++) R[i].Expanded = 1;
   function rend(){
      T.RenderBody();
      T.HideMessage();
      if(T.FRow && !T.FRow.Fixed) T.ScrollIntoView(T.FRow);
      if(!loaded&&levels==3) T.ExpandAll(row,loaded,levels,max,null,0);
      }
   if(ren+this.RowCount<this.SynchroCount) rend();
   else {
      this.ShowMessage(this.GetText("ExpandAll"));
      setTimeout(rend,10);
      }
   
   return;
   }
if(test) return R.length;
var rec = this.Rendering;
this.Rendering = true;
if(!R.length) { finish(rec?0:-1); return; }

function finish(cancel){
   if(T.SaveExpanded) T.SaveCfg();
   T.Rendering = false;
   T.Update();
   if(T.FRow && !T.FRow.Fixed) T.ScrollIntoView(T.FRow);
   T.HideMessage();
   
   if(T.Alternate&&T.AlternateType&1) T.ReColor();
   T.Scrolled(1); MS.Paging; T.ShowPages(); ME.Paging;   
   if(Grids.OnExpandAllFinish) Grids.OnExpandAllFinish(T,cancel?cancel:0);
   }

function again(R,cnt){
   if(!R.length) { finish(); return; }
   for(var i=0,m=T.ChildParts&&!T.ChildPartMin&&cnt*300>T.PageTime;i<R.length;i++) if(R[i]&&R[i].State<2) {
      if(m&&R[i].State==0) R.splice(i--,1);
      else break;
      }
   if(i==R.length) T.ExpandAll(row,loaded,levels,max,null,0);
   else setTimeout(function(){ again(R,cnt+1); },300); 
   }

if(ren<this.SynchroCount){
   function synchro(){
      for(var i=0;i<R.length;i++) if(!Grids.OnExpand || !Grids.OnExpand(T,R[i])) T.Expand(R[i],0,1);
      if(!loaded && levels==3) again(R,0);
      else finish();
      }
   if(!this.Paging && this.RowCount <= this.SynchroCount) synchro();
   else { this.ShowMessage(this.GetText("ExpandAll")); setTimeout(synchro,10); }
   return;
   }

var D = [], pos = 0, ren = 10, dm = 10;

function expand(){
   if(T.CancelProgress) {
      T.CancelProgress = 0; 
      finish(1);
      return;
      }
   while(pos<R.length){
      if(R[pos].State<2){
         for(var i=0;i<dm;i++) {
            if(D[i] && D[i].State!=1) D[i] = null;
            if(!D[i]) { D[i] = R[pos]; break; }
            }
         if(i==dm) { setTimeout(expand,10); return; }
         ren -= min!=null?min+R[pos].Count/10:R[pos].Count;
         }
      else ren -= R[pos].State!=4 ? (min!=null?min:R[pos].childNodes.length) : 0.5;
      if(!Grids.OnExpand || !Grids.OnExpand(T,R[pos])) T.Expand(R[pos],0,1); 
      pos++;
      if(ren<=0){
         T.ShowProgress(T.GetText("ExpandProgressCaption"),T.GetText("ExpandProgressText"),T.GetText("ExpandProgressCancel"),pos,R.length);
         setTimeout(expand,10);
         ren = 10;
         return;
         }
      }
   T.CancelProgress = 0; 
   if(!loaded && levels==3) again(D,0);
   else finish();
   }
expand();   
}
// -----------------------------------------------------------------------------------------------------------
// Collapses all rows
TGP.CollapseAll = function(root,test,foc){
MS.Master; if(foc&&this.FocusNested(test)&&this.LastFocus[0].MainCol) return this.LastFocus[0].CollapseAll(root,test,0); ME.Master;
var cnt = 0;
if(test){
   var r=this.GetFirstVisible();
   while(r){
      if(r.firstChild && r.Expanded && Is(r,"CanExpand") && (!Grids.OnExpand || !Grids.OnExpand(this,r))) {
         cnt++;
         var n = r; n.Expanded = 0; r = this.GetNextVisible(r,root); n.Expanded = 1;
         }
      else r = this.GetNextVisible(r,root);
      }
   return cnt;
   }
this.Rendering = true;
for(var r=this.GetFirstVisible();r;r=this.GetNextVisible(r,root)){
   if((r.firstChild||r.State<=1&&r.Count) && r.Expanded && Is(r,"CanExpand") && (!Grids.OnExpand || !Grids.OnExpand(this,r))) { this.Collapse(r,true); cnt++; }
   }
var fr = this.FRow;
if(fr && !fr.Page && !fr.Fixed){
   for(var r=fr.parentNode;r&&!r.Page;r=r.parentNode) if(!r.Expanded) fr = r;
   }
this.Rendering = false;
this.HideMessage();
this.Update();
if(fr!=this.FRow) this.Focus(fr,this.FCol,null,null,2);
if(this.FRow && !this.FRow.Fixed) this.ScrollIntoView(this.FRow); 
if(this.SaveExpanded) this.SaveCfg();

if(this.Alternate&&this.AlternateType&1) this.ReColor();
MS.Paging; this.ShowPages(); ME.Paging; this.Scrolled(1);
return cnt;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionExpandAll = function(F,T){ if(this.Locked["expand"]) return false; var cnt = this.ExpandAll(null,this.ExpandAllLoaded!=null?this.ExpandAllLoaded:this.ExpandAllType,this.ExpandAllLevels,null,T,this.ExpandAllRender,F&1); return T ? cnt : true; }
TGP.ActionExpandAllLoaded = function(F,T){ if(this.Locked["expand"]) return false; var cnt = this.ExpandAll(null,1,2,0,T,this.ExpandAllRender,F&1); return T ? cnt : true; }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionCollapseAll = function(F,T,root){ 
if(this.Locked["expand"]) return false;
if(T) return this.CollapseAll(root,T,F&1);
if(!this.Paging && this.RowCount <= this.SynchroCount){ this.CollapseAll(root,0,F&1); return true; }
this.ShowMessage(this.GetText("CollapseAll"));
T = this; setTimeout(function(){ T.CollapseAll(root,0,F&1); },10);
return true; 
}
TGP.ActionCollapseAllRoot = function(dummy,T){ return this.ActionCollapseAll(dummy,T,1); }
// -----------------------------------------------------------------------------------------------------------
ME.ExpandAll;

// -----------------------------------------------------------------------------------------------------------
TGP.ActionExpand = function(F,T){
if(this.Locked["expand"]) return false;
var row = this.GetARow(F);
MS.RowSpan;
if(row && row.RowSpan && row[this.MainCol+"RowSpan"]>1 && !(row[this.MainCol+"RowSpan"]%1) && !row.firstChild) { 
   while(row.nextSibling&&!row.nextSibling[this.MainCol+"RowSpan"]) row = row.nextSibling;
   }
ME.RowSpan;
if(!row || !this.HasChildren(row) && !Get(row,"Detail") || !Is(row,"CanExpand") || row.Expanded || Grids.OnExpand && Grids.OnExpand(this,row)) return false;
if(T) return true;
this.NoUpdateCustomScroll = 1; 
if(this.Expand(row)){
   MS.Animate; if(row.Hasch && row.Expanded) this.AnimRow(row,"Expand",1); ME.Animate;
   }
this.UpdateCustomScroll();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionCollapse = function(F,T){
if(this.Locked["expand"]) return false;
var row = this.GetARow(F);
MS.RowSpan;
if(row && row.RowSpan && row[this.MainCol+"RowSpan"]>1 && !(row[this.MainCol+"RowSpan"]%1) && !row.firstChild) { 
   while(row.nextSibling&&!row.nextSibling[this.MainCol+"RowSpan"]) row = row.nextSibling;
   }
ME.RowSpan;
if(!row || !this.HasChildren(row) && !Get(row,"Detail") || !Is(row,"CanExpand") || !row.Expanded || Grids.OnExpand && Grids.OnExpand(this,row)) return false;
if(T) return true;
this.NoUpdateCustomScroll = 1; 
this.Collapse(row);
MS.Animate; if(row.Hasch && !row.Expanded) this.AnimRow(row,"Collapse",1); ME.Animate;
this.UpdateCustomScroll();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetNoTreeLines = function(val){
this.NoTreeLines = val;
this.MeasureHTML();
this.RenderBody();
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionShowTreeLevel = function(){
var pos = this.Event.Special; if(!pos || this.Locked["expand"]) return false;
pos = pos.slice(6)-0;
if(!pos) return false;

this.Rendering = true;
var ret = this.ShowTreeLevel(pos);
this.Rendering = false;
this.Update();
if(this.SaveExpanded) this.SaveCfg();

if(this.Alternate&&this.AlternateType&1) this.ReColor();
MS.Paging; this.ShowPages(); ME.Paging; this.Scrolled(1);

return ret;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ShowTreeLevel = function(lev){
var pos = lev-1;
for(var r=this.GetFirst();r;r=this.GetNext(r)){
   if(pos>r.Level && pos>lev-1) pos = r.Level;
   if(r.Level==pos && r.Expanded && this.HasChildren(r)){
      if(Is(r,"CanExpand") && (!Grids.OnExpand || !Grids.OnExpand(this,r))) this.Collapse(r);
      else pos++; 
      }
   }
if(lev>1) this.ExpandAll(null,this.ExpandAllLoaded!=null?this.ExpandAllLoaded:this.ExpandAllType,this.ExpandAllLevels,lev-2,null,this.ExpandAllRender==2?0:this.ExpandAllRender); 
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetReversedTree = function(val,noshow){
MS.ReversedTree;
if(!this.ReversedTree==!val) return;
MS.RowSpan; if(this.RowSpan&&val) this.SetReversedRowSpan(val); ME.RowSpan;
this.ReversedTree = val;
if(val){
   if(!this.GetNextNorm){
      this.GetFirstNorm = this.GetFirst;  
      this.GetLastNorm = this.GetLast;
      this.GetNextNorm = this.GetNext; 
      this.GetPrevNorm = this.GetPrev; 
      this.GetNextVisibleNorm = this.GetNextVisible; 
      this.GetPrevVisibleNorm = this.GetPrevVisible; 
      this.GetNextPrintNorm = this.GetNextPrint;
      }
   this.GetFirst = this.GetFirstRev;
   this.GetLast = this.GetLastRev;
   this.GetNext = this.GetNextRev;
   this.GetPrev = this.GetPrevRev;
   this.GetNextVisible = this.GetNextVisibleRev;
   this.GetPrevVisible = this.GetPrevVisibleRev;
   this.GetNextPrint = this.GetNextPrintRev;
   }
else {
   this.GetFirst = this.GetFirstNorm;
   this.GetLast = this.GetLastNorm;
   this.GetNext = this.GetNextNorm;
   this.GetPrev = this.GetPrevNorm;
   this.GetNextVisible = this.GetNextVisibleNorm;
   this.GetPrevVisible = this.GetPrevVisibleNorm;
   this.GetNextPrint = this.GetNextPrintNorm;
   }
if(noshow!=2) this.UpdateAllLevelImg(0,1);
MS.RowSpan; if(this.RowSpan&&!val) this.SetReversedRowSpan(val); ME.RowSpan;
if(!noshow) this.RenderBody();
ME.ReversedTree;
}
// -----------------------------------------------------------------------------------------------------------
MS.RowSpan;
TGP.SetReversedRowSpan = function(rev){
for(var C=[],c=this.GetFirstCol(0,null,2);c;c=this.GetNextCol(c,null,2)) if(this.Cols[c].Spanned) C[C.length] = c;
if(C.length) for(var r=this.GetFirst();r;r=this.GetNext(r)) if(r.RowSpan){
   for(var i=0;i<C.length;i++) if(r.firstChild&&r[C[i]+"RowSpan"]%1&&(!r.Spanned||r[C[i]+"Span"]!=0)){
      var sp = r.Spanned ? r[C[i]+"Span"] : 1;
      if(rev) this.ResetHidden(r,C[i],sp);
      else this.SetHidden(r,C[i],sp);
      }
   }
}
ME.RowSpan;
// -----------------------------------------------------------------------------------------------------------
TGP.CreateTree = function(page){
if(!this.MainCol) return;
if(!page) { for(var b=this.XB.firstChild;b;b=b.nextSibling) if(b.firstChild) this.CreateTree(b); return; }
var rev = this.ReversedTree, r = rev ? page.lastChild : page.firstChild, chg = 0;
if(this.ReversedTree){
   var r = page.lastChild;
   if(r.Level){
      if(this.AutoPages) {
         for(var i=0;i<r.Level;i++) { n = Dom.createElement(); n.Def = "Auto"; page.appendChild(n); n.Level = r.Level-i-1; }
         r = page.lastChild;
        }
      else r.Level = 0;
      }
   while(r){
      if(r.Level) {
         var n = r.previousSibling, p = r.nextSibling; if(!p.Level) p.Level = 0;
         while(p.firstChild&&p.Level<r.Level-1) p = p.firstChild;
         if(p.Level<r.Level-1) r.Level = p ? p.Level+1 : 0;
         p.insertBefore(r,p.firstChild);
         r = n; chg = 1;
         }
      else r = r.previousSibling;
      }
   }
else {
   var r = page.firstChild; r.Level = 0;
   while(r){
      if(r.Level) {
         var n = r.nextSibling, p = r.previousSibling; if(!p.Level) p.Level = 0;
         while(p.lastChild&&p.Level<r.Level-1) p = p.lastChild;
         if(p.Level<r.Level-1) r.Level = p ? p.Level+1 : 0;
         p.appendChild(r);
         r = n; chg = 1;
         }
      else r = r.nextSibling;
      }
   }
MS.RowSpan;
if(chg) {
   var S = {}, C = this.Cols; for(var c in C) if(C[c].Spanned) S[c] = C[c];
   if(GetCount(S)){
      for(var r=this.GetFirst();r;r=this.GetNext(r)) {
         for(var c in S) if(r[c+"RowSpan"]){
            for(var spn=r[c+"RowSpan"],ns=0,n=r,lev=r.Level?r.Level:0;n&&spn>0&&(n.Level?n.Level:0)>=lev;spn--,n=this.GetNext(n)) if((n.Level?n.Level:0)==lev) ns++;
            r[c+"RowSpan"] = n&&this.GetPrev(n).Level>lev ? ns+0.5 : ns;
            }
         }
      }
   }
ME.RowSpan;
  
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetHideTree = function(val,noupd){
if(!this.MainCol) return;
var c = this.Cols[this.MainCol]; if(!c) return;
if(!noupd) { var z = this.FastColumns; this.FastColumns = 0; this.HideCol(this.MainCol); this.FastColumns = z; }
if(val){ if(c.AlignSet) c.Align = "Center"; if(c.IndentSet) c.Indent = null; }
else if(c.Align=="Center") { c.AlignSet = 1; c.Align = "Right"; if(c.Indent==null) { c.Indent = 1; c.IndentSet = 1; } }
this.HideTree = val;
if(this.AutoTreeWidth) {
   if(val) this.Cols[this.MainCol].Width = this.AutoTreeWidth;
   else { this.MaxLevel = null; this.CalcTreeWidth(noupd,1); }
   }
if(!noupd) this.ShowCol(this.MainCol);
}
// -----------------------------------------------------------------------------------------------------------
TGP.IndentRow = function(row,sel,test){
if(!this.MainCol || this.HideTree>1 || !row || row.Fixed || row.Space!=null || row.Page || !Is(row,"CanDrag")) return false;
if(this.ReversedTree) for(var p=row.nextSibling;p&&!p.Visible;p=p.nextSibling);
else for(var p=row.previousSibling;p&&!p.Visible;p=p.previousSibling);
if(!p) {
   if(row.parentNode.Page) p = this.ReversedTree ? this.GetNextVisible(row) : this.GetPrevVisible(row);
   if(!p) {
      if(this.IndentType==2&&!row.parentNode.Page){
         if(!this.IndentRow(row.parentNode,0,1)) return false; 
         if(test) return true;
         this.StartUpdate();
         var ret = this.IndentRow(row.parentNode,0)&&this.IndentRow(row,sel);
         this.EndUpdate();
         return ret;
         }
      return false;
      }
   }
if(sel && p.Selected&this.SelAnd&&!this.IndentType) {
   if(!test) return false;
   for(p=p.previousSibling;p&&p.Selected&&!p.Visible;p=p.previousSibling);
   if(!p) return false;
   }
if(!this.TestDef(p,row.Def.Name)) return false;
if(this.Group&&!this.MainColGroup&&p.Def&&!p.Def.Group&&this.GroupMoveFree!=2) return false;
var type = 2;
if(this.ReversedTree&&p.firstChild){ p = p.firstChild; type = 1; }
if(Grids.OnCanDrop) { var typ = Grids.OnCanDrop(this,row,this,p,type,0,[row]); if(typ!=null) type = typ; }
if(test) return true;
this.MoveRows(row,p,type,null,1);
if(this.IndentType) {
   if(this.ReversedTree) while(row.firstChild) this.MoveRows(row.firstChild,row,1);
   else while(row.lastChild) this.MoveRows(row.lastChild,row,3);
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.OutdentRow = function(row,sel,test){
if(!this.MainCol || this.HideTree>1 || !row || row.Fixed || row.Space!=null || row.Level<=0 || !Is(row,"CanDrag") || this.IndentType==1&&row.firstChild) return false;
if(!this.TestDef(row.parentNode.parentNode,row.Def.Name)) return false;
if(sel && row.parentNode.Selected&this.SelAnd && !this.IndentType) return false;
var type = this.ReversedTree ? 1 : 3;
if(Grids.OnCanDrop) { var typ = Grids.OnCanDrop(this,row,this,row.parentNode,type,0,[row]); if(typ!=null) type = typ; }
if(test) return true;
if(this.IndentType){
   if(this.ReversedTree) while(row.previousSibling) this.MoveRows(row.previousSibling,row.firstChild?row.firstChild:row,row.firstChild?1:2);
   else while(row.nextSibling) this.MoveRows(row.nextSibling,row,2);
   }
this.MoveRows(row,row.parentNode,type,null,1);
this.ScrollIntoView(row);
return true;
}
// -----------------------------------------------------------------------------------------------------------
ME.Tree;

MS.Drag;
// -----------------------------------------------------------------------------------------------------------
TGP.ActionIndent = function(F,T){
MS.Tree;
if(this.Locked["moverow"]) return false;
MS.Master; if(F&1&&!this.FRow&&this.FocusNested(T)&&this.LastFocus[0].MainCol) return this.LastFocus[0].ActionIndent(F,T); ME.Master;
var R = this.GetARows(F), len = GetCount(R), cnt = 0;
if(len>1&&!T) this.StartUpdate();
else if(!T) this.UndoStart();
for(var id in R) if(this.IndentRow(R[id],1,T)) cnt++;
if(len>1&&!T) this.EndUpdate();
else if(!T) this.UndoEnd();
if(T) return cnt;
this.CalcTreeWidth(); this.UploadChanges();
return true;
ME.Tree;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionOutdent = function(F,T){
MS.Tree;
if(this.Locked["moverow"]) return false;
MS.Master; if(F&1&&!this.FRow&&this.FocusNested(T)&&this.LastFocus[0].MainCol) return this.LastFocus[0].ActionOutdent(F,T); ME.Master;
var R = this.GetARows(F), len = GetCount(R), cnt = 0;
if(len>1&&!T) this.StartUpdate();
else if(!T) this.UndoStart();
for(var id in R) if(this.OutdentRow(R[id],1,T)) cnt++;
if(len>1&&!T) this.EndUpdate();
else if(!T) this.UndoEnd();
if(T) return cnt;
this.CalcTreeWidth(); this.UploadChanges();
return true;
ME.Tree;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionIndentSelected = function(F,T){ return this.ActionIndent(F?F|2:2,T); }
TGP.ActionIndentRows = function(F,T){ return this.ActionIndent(F?F|1:1,T); }
TGP.ActionOutdentSelected = function(F,T){ return this.ActionOutdent(F?F|2:2,T); }
TGP.ActionOutdentRows = function(F,T){ return this.ActionOutdent(F?F|1:1,T); }
// -----------------------------------------------------------------------------------------------------------
ME.Drag;

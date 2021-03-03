// -----------------------------------------------------------------------------------------------------------
// Freeing memory
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Deletes the grid

TGP.Dispose = function(){
this.Clear(1);
delete Grids[this.id];
Grids[this.Index] = null;
if(Grids.Active==this) Grids.Active = null;
if(Grids.Focused==this) Grids.Focused = null;
}
// -----------------------------------------------------------------------------------------------------------
// Deletes all grids on page
MS.Api;
function DisposeGrids(){
for(var i=0;i<Grids.length;i++){
   var G = Grids[i];
   if(G && Grids[G.id]==G) G.Dispose();
   }
Grids.length = 0;
}
var TGDisposeGrids = DisposeGrids; if(window["DisposeGrids"]==null) window["DisposeGrids"] = DisposeGrids; 
ME.Api;
// -----------------------------------------------------------------------------------------------------------
// Clears links with HTML
TGP.ClearChildren = function(row,type,S){
if(!row.firstChild) return;
MS.Animate; this.FinishAnimations(row); ME.Animate;
MS.ColPaging;
if(!S && this.ColPaging){
   S = []; var C = this.ColNames;
   for(var i=this.FirstSec;i<=this.LastSec;i++) if(C[i].State==4||i==1) S[S.length] = i;
   }
ME.ColPaging;
for(var r=row.firstChild;r;r=r.nextSibling){ 
   if(Grids.OnClearRow && !r.Page) Grids.OnClearRow(this,r);
   MS.Nested;
   if(r.DetailCol && r.DetailGrid) {
      if(type==1)  {
         r.DetailGrid[0].Dispose();
         r.DetailGrid = null;
         r.DetailRow = null;
         }
      else r.DetailGrid[0].Clear(2);
      }
   ME.Nested;
   if(type==1&&r.MasterRow) this.DelDetail(r);
   if(r.r1 && !r.Page) this.RowCount--;
   if(this.SetIds){
      if((type==1 || type==4) && !r.Page) delete this.Rows[r.id];
      if(r.r1) {
         if(S) { for(var i=0;i<S.length;i++) r["r"+S[i]] = null; }
         else for(var i=this.FirstSec;i<=this.LastSec;i++) if(r["r"+i]) r["r"+i] = null;
         }
      if(r.rch1) {
         if(S) { for(var i=0;i<S.length;i++) r["rch"+S[i]] = null; }
         else for(var i=this.FirstSec;i<=this.LastSec;i++) if(r["rch"+i]) r["rch"+i] = null;
         }
      }
   else {
      if(r.r1) for(var i=this.FirstSec;i<=this.LastSec;i++) if(r["r"+i]) { r["r"+i].row = null; r["r"+i] = null; } 
      if(r.rch1) for(var i=this.FirstSec;i<=this.LastSec;i++) if(r["rch"+i]) r["rch"+i] = null;
      }
   if(type==1&&r.Def&&r.Def.Name) r.Def = r.Def.Name;
   if(r.State>=3) r.State = 2;
   else if(r.State==1&&type==1) r.State = 0;
   if(r.firstChild) this.ClearChildren(r,type,S);
   r.Hasch = 0;
   }
}
// -----------------------------------------------------------------------------------------------------------
// Clears links with HTML in the given column section
TGP.ClearSec = function(sec){
var F = this.GetFixedRows(); for(var j=0;j<F.length;j++) if(F[j]["r"+sec]){ F[j]["r"+sec].row = null; F[j]["r"+sec] = null; } 
this.XF["r"+sec] = null; 
function Clear(row){
   for(var r=row.firstChild;r;r=r.nextSibling) {
      if(this.SetIds) { r["r"+sec] = null; if(r.rch1) r["rch"+sec] = null; }
      else if(r["r"+sec]){ r["r"+sec].row = null; r["r"+sec] = null; } 
      else if(r["rch"+sec]){ r["rch"+sec].row = null; r["rch"+sec] = null; } 
      if(r.firstChild) Clear(r);
      }
   }
Clear(this.XB);

}
// -----------------------------------------------------------------------------------------------------------
// Clears whole grid
// type = 0 - only links html - xml, 1 - all, include main tag
// Function is written due memory dealocation, if it is not called from Render, Reload or unload, the browser (especially IE) does not free memory allocation
TGP.Clear = function(type,S){
this.ReloadIndex++; 
if(type==null) type = 1;
MS.ColPaging; if(this.ColPaging) for(var i=0,CN=this.ColNames;i<CN.length;i++) if(CN[i].State&1) CN[i].State--; ME.ColPaging;
this.UpdateRowsHeightsTimeout = null;
this.ChildPartsTmp = {}; 
this.ServerEdit = 0;
if(this.XB) if(Try) {

   // --- Variable rows ---
   this.ClearChildren(this.XB,type,S);
   for(var r=this.XB.firstChild;r;r=r.nextSibling) if(r.State==3||r.State==1&&type==1) r.State--;
   
   if(type&3) { 
   
      // --- fixed rows ---
      var F = this.GetFixedRows(); for(var j=0;j<F.length;j++){ 
         var r = F[j];
         if(Grids.OnClearRow) Grids.OnClearRow(this,r);
         if(this.SetIds){
            for(var i=this.FirstSec;i<=this.LastSec;i++) r["r"+i] = null;
            }
         else { 
            for(var i=this.FirstSec;i<=this.LastSec;i++) if(r["r"+i]) { r["r"+i].row = null; r["r"+i] = null; } 
            }
         if(type==1){ r.Def = null; r.CalcOrder = null; }
         } 
      for(var i=this.FirstSec;i<=this.LastSec;i++) this.XF["r"+i] = null; 
         
      // --- space rows ---
      MS.Space;
      for(var r=this.XS.firstChild;r;r=r.nextSibling){ 
         if(Grids.OnClearRow) Grids.OnClearRow(this,r);
         if(r.r1) r.r1.row = null;
         r.r1 = null;
         if(type==1){ r.Cells = null; r.Def = null; r.CalcOrder = null; }
         }
      ME.Space;
      
      this.ClearCursors();
      }
   }
else if(Catch) { }

// --- ARow ---
if(this.ARow && (!this.ARow.Fixed||type&11)) this.ARow = null; 

// --- master / detail ---
MS.Master;
if(type&5 && this.MasterGrid){ 
   var B = this.XB.firstChild;
   this.MasterGrid.DetailSelected = null;
   if(B && B.MasterRow) { this.ClearMaster(B.MasterRow); B.MasterRow = null; }
   }
ME.Master;

// --- main tag ---
if(type&9 && this.MainTag){ 

   this.Loading = 0;
   this.Rendering = 0;
   this.MainTag.innerHTML = ""; 
   }

// --- html ---
if(type&9){
   MS.Message;
   if(Try){ 
      this.HideMessage(1); 
      var P = [this.ShowHintTag,this.RotWidthTag,this.FFScroll];
      var M = this.Message; if(M) { P.push(M.Tag,M.Shadow,M.Disabled); this.Message = null; }
      for(var i=0;i<P.length;i++) if(P[i]) P[i].parentNode.removeChild(P[i]);
      this.ShowHintTag = null; this.RotWidthTag = null; this.FFScroll = null;
      } else if(Catch) { }
   ME.Message;      
   if(Try){ this.HideTip(); } else if(Catch) { }
   if(Try){ this.CloseDialog(); } else if(Catch) { }
   if(Try){ this.HideHint(1); } else if(Catch) { }
   MS.MaxHeight; DelArea(this.MainTag); ME.MaxHeight;
   if(Try){ for(var i=0;i<Dialogs.length;i++) if(Dialogs[i] && Dialogs[i].Grid==this && Dialogs[i].Close) Dialogs[i].Close(); } else if(Catch) { }
   var X = this.HiddenStyle; if(!X) X = GetElem(this.GetItemId("FastColumns")); if(X) X.innerHTML = "";
   }

// --- all data ---
if(type&1){
   this.FRow = null; this.SRow = null;
   if(Try){ ClearChildren(this.XB); } else if(Catch) { }
   if(Try){ ClearChildren(this.XF); } else if(Catch) { } 
   if(Try){ ClearChildren(this.XH); } else if(Catch) { }
   if(Try){ ClearChildren(this.XS); } else if(Catch) { }
   
   this.SpannedCols = []; this.SpannedColsLength = 0;
   this.RemovedCols = {};
   this.Cleared = 1; this.LoadedCount = 0;
   }

}
// -----------------------------------------------------------------------------------------------------------

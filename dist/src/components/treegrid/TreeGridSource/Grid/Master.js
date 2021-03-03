// -----------------------------------------------------------------------------------------------------------
// Master / detail functions
// -----------------------------------------------------------------------------------------------------------
MS.Master;
var CMasterAttrs = {DetailRow:1,DetailGrid:1,"r0":1,"r1":1,"r2":1,"r3":1,"r4":1,"r5":1,"r6":1,"r7":1,"r8":1,"r9":1,Level:1,LevelImg:1,DefChild:1,Hasch:1};
// -----------------------------------------------------------------------------------------------------------
TGP.ClearMaster = function(row){
if(!row) return;
row.DetailRow = null;
row.DetailGrid = null;
for(var r=row.firstChild;r;r=r.nextSibling) this.ClearMaster(r);
}

// -----------------------------------------------------------------------------------------------------------
TGP.ShowDetail = function(row,detail,test,always,norender){
var D = Grids[detail];     
if(!D) {
   if(!detail || detail.indexOf(',')<0) return false; 
   detail = (detail+"").split(',');
   var ok = 0;
   for(var i=0;i<detail.length;i++) if(this.ShowDetail(row,detail[i],test,always,norender)) ok++;
   return ok ? 1 : 0;
   }
if(D==this) row = row.MasterRow; 
else if(!test) { 
   if(D.Loading || D.Rendering || !D.MainTable){ 
      var T = this;
      setTimeout(function(){
         T.ShowDetail(row,detail,test,always,norender);
         },100);
      return true;
      }
   var OG = D.MasterGrid;
   if(OG && OG.DetailSelected!=row) OG.DetailSelected = null;
   D.MasterGrid = this;
   }

var B = D.XB.firstChild;
if(D.Paging) D.RemovePages();

var bm = B.MasterRow;
if(Grids.OnShowDetail && Grids.OnShowDetail(this,D,row,bm)) return false;
if(bm==row && !always) return false; 
if(bm && !D.ActionValidate(null,test)) return false; 
if(test) return true;
for(var i=0;i<Grids.length;i++){
   if(Grids[i]&&Grids[i].MasterGrid==D) D.RefreshDetail(Grids[i],1);
   }
D.Clear(4);
if(bm) OG.ColorRow(bm);
ClearChildren(B);

if(row.Deleted && !D.ShowDeleted){ 
   this.RefreshDetail(D,1);
   return true;
   }

this.InitDetail(D,row);

MS.Paging;
MS.Tree;
if(this.ChildPaging==3 && row.State<2 && !row.Expanded) {
   if(row.State==1) return; 
   row.State = 1;
   this.CreateChildren(row);
   this.TableCollapse(row);
   this.DownloadChildren(row);
   return true;
   }
ME.Tree;   
ME.Paging;

var def = D.MasterDef;
if(def) { var d = def.split(","); def = {}; for(var i=0;i<d.length;i++) def[d[i]] = 1; }
var defhide = D.MasterDefHide;
if(defhide) { var d = defhide.split(","); defhide = {}; for(var i=0;i<d.length;i++) defhide[d[i]] = 1; }
this.CopyDetailData(D,row,B,def,defhide);

if(D.FRow && !D.FRow.Fixed) D.FRow = D.FRow.id ? D.GetRowById(D.FRow.id) : null;
if(D.Event.Row && !D.Event.Row.Fixed) D.Event.Row = null;
if(D.ARow && !D.ARow.Fixed) D.ARow = null;

var CC = [], CCT = [];
for(var c in D.Cols) {
   if(D.Cols[c].Prepared) continue;
   CCT[CCT.length] = c+"Type";
   CC[CC.length] = c;
   }
var p = CC.length, prep = this.Prepared; 
for(var r=D.GetFirst();r;r=D.GetNext(r)) {
   if(r.Spanned) { D.ColSpan = 1; D.UpdateSpan(r,D.SaveSpan); }
   D.UpdateRowCells(r,CC,CCT);
   MS.Calc;
   if(r.Calculated && r["CalcOrderAuto"]) r.CalcOrder = null; 

   ME.Calc;
   }

D.Calculate(2);
MS.Group; D.UpdateGridGroup(); ME.Group;
MS.Filter; D.UpdateGridFilter(); ME.Filter;
D.UpdateGridSort();
D.UpdateGridTree();
MS.Tree; D.CalcTreeWidth(); ME.Tree;
D.UpdateGridFinish(1);
if(!norender){
   D.RenderBody();
   this.ColorRow(row);
   }
if(Grids.OnShowDetailFinish) Grids.OnShowDetailFinish(this,D,row);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.InitDetail = function(D,row){
var B = D.XB.firstChild;
D.SetBody(B);
B.State=4; 
B.MasterRow = row;
B.id = row.id;
B.Def = row.Def;
this.DetailSelected = row;
for(var d in this.Def) if(!D.Def[d]) D.Def[d] = this.Def[d];

if(row.DetailRow) row.DetailRow[row.DetailRow.length] = B; else row.DetailRow = [B];
if(row.DetailGrid) row.DetailGrid[row.DetailGrid.length] = D; else row.DetailGrid = [D];
}
// -----------------------------------------------------------------------------------------------------------
TGP.CopyDetailData = function(D,from,to,def,defhide){
var RA = Grids.INames;
for(var r=from.firstChild;r;r=r.nextSibling) {
   if(def && (!def[r.Def.Name] && (!defhide||!defhide[r.Def.Name]))) continue;
   var nr = Dom.createElement("I");
   for(var a in r) if(!RA[a] && !CMasterAttrs[a]) nr[a] = r[a];
   nr.id = r.id;
   if(nr.Deleted) nr.Visible = D.ShowDeleted && (!nr.Filtered || D.DetailRowsVisible);
   else if(nr.Filtered && D.DetailRowsVisible!=0){ nr.Filtered = 0; nr.Visible = 1; }
   else if(D.DetailRowsVisible>=2) { nr.Visible = 1; if(D.DetailRowsVisible==3 && !Is(nr,"CanFilter")) nr.CanFilter = 1; }
   if(defhide && defhide[r.Def.Name]) { nr.Visible = 0; nr.CanFilter = 0; }
   if(this.SetIds) D.SetRowsId(nr);     
   nr.MasterRow = r;
   if(r.DetailRow) r.DetailRow[r.DetailRow.length] = nr; else r.DetailRow = [nr];
   if(r.DetailGrid) r.DetailGrid[r.DetailGrid.length] = D; else r.DetailGrid = [D];
//      r.DetailRow = nr;
   if(r.firstChild) this.CopyDetailData(D,r,nr,def,defhide);
   to.appendChild(nr);
   if(D.Loading) nr.Def = nr.Def.Name; 
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.CopyMasterData = function(D,from,to){
var RA = Grids.INames;
for(var r=from.firstChild;r;r=r.nextSibling) {
   var nr = Dom.createElement("I");
   for(var a in r) if(!RA[a] && !CMasterAttrs[a]) nr[a] = r[a];
   nr.id = r.id;
   this.Rows[r.id] = nr;
   
   r.MasterRow = nr;
   if(nr.DetailRow) nr.DetailRow[nr.DetailRow.length] = r; else nr.DetailRow = [r];
   if(nr.DetailGrid) nr.DetailGrid[nr.DetailGrid.length] = D; else nr.DetailGrid = [D];
   if(r.firstChild) this.CopyMasterData(D,r,nr);
   to.appendChild(nr);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.RefreshDetail = function(G,clear){
if(G){
   if(G.MasterGrid!=this) return;
   if(clear){
      if(G.NestedGrid) G.Dispose();
      else if((G.Source.Layout.Url || G.Source.Layout.Script || G.Source.Layout.Tag || G.Source.Layout.Data || G.LoadedEmpty) && G.ReloadBody) G.ReloadBody(null,0,"Detail",G.LoadedEmpty);
      else G.Reload();
      this.DetailSelected = null;
      }
   else {
      var B = G.XB.firstChild; 
      if(B && B.MasterRow) this.ShowDetail(B.MasterRow,Get(B.MasterRow,"Detail"),0,1);
      }
   }
else {
   for(var i=0;i<Grids.length;i++){
      G = Grids[i];
      if(G && G.MasterGrid==this) this.RefreshDetail(G,clear);
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.DoShowDetail = function(F,always,clear,test){ 
var row = this.GetARow(F); if(!row || row.Page) return false;
var idx = Get(row,"Detail");
if(idx==null) return false;
if(clear){
   var G = Grids[idx];
   if(!G || !G.ReloadBody) return false;
   if(test) return true;
   G.ReloadBody(null,0,"Detail");
   return true;
   }
return this.ShowDetail(row,idx,test,always);
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionShowDetail = function(F,T){ return this.DoShowDetail(F,0,0,T); }
TGP.ActionRefreshDetail = function(F,T){ return this.DoShowDetail(F,1,0,T); }
TGP.ActionClearDetail = function(F,T){ 
   var row = this.GetARow(F); if(!row || !row.DetailGrid) return false;
   if(T) return true;
   var G = row.DetailGrid;
   for(var i=0;i<G.length;i++) if(G[i].ReloadBody) G[i].ReloadBody(null,0,"Detail");
   return true;
   }
// -----------------------------------------------------------------------------------------------------------
TGP.GetMasterRow = function(){ 
return this.XB.firstChild.MasterRow;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetDetailGrid = function(row,idx){ 
return row.DetailGrid ? row.DetailGrid[idx?idx:0] : null;
}
// -----------------------------------------------------------------------------------------------------------
MS.Nested;
// -----------------------------------------------------------------------------------------------------------
TGP.GetNestedSource = function(r){ 
var D = Get(r,"DetailTreeGrid"), def = Get(r,"DetailLayout");
MS.Xml;
if(D){
   var X = CreateXmlFromString("<main>"+D+"</main>");
   D = X && X.firstChild && X.firstChild.firstChild ? ParseTreeGrid(X.firstChild.firstChild) : null;
   }
ME.Xml;
if(!D&&!def) return null;
if(!D) D = {};
if(D.Debug==null) D.Debug = this.Source.DebugOrig;
if(D.DebugTag==null) D.DebugTag = this.Source.DebugTag;
if(D.DebugWindow==null) D.DebugWindow = this.Source.DebugWindow;
if(D.DebugCheckIgnore==null) D.DebugCheckIgnore = this.Source.DebugCheckIgnore;
if(D.Sync==null) D.Sync = 1;
if(D.SuppressMessage==null) D.SuppressMessage = 1;
if(!D.Defaults) { D.Defaults = {}; for(var n in this.Source.Defaults) D.Defaults[n] = this.Source.Defaults[n]; }
if(!D.Text) D.Text = this.Source.Text;
         
D.Defaults.Bonus = "<Grid><Cfg AbsoluteCursors='0'"+(BIEA&&!BIEA8&&!BIE?" BorderCursors='0'":"")+" TabStop='0' NoVScroll='1' NestedGrid='1'/><Toolbar Reload='0'/><Body><B/></Body></Grid>";
if(def) {
   if(!D.Layout) D.Layout = {};
   if(def.search(/[\<\{]/)>=0) D.Layout.Data = def;
   else if(def.search(/\breturn\b|\bjavascript:\b/)>=0) D.Layout.Script = def;
   else D.Layout.Url = def;
   if(D.Layout.Static==null) D.Layout.Static = def;
   }
D.Nested = {Master:this,Row:r};
this.HasNested = 1;
return D;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ShowNested = function(r){ 
var c = r.DetailCol;
var id = this.id+"DG"+r.id, G = Grids[id];
var cell = this.GetCell(r,c);
if(cell) {
   cell.innerHTML = "<div style='width:100%;height:100%;overflow:hidden;'></div>"; cell = cell.firstChild; 
   if(G) {
      if(Grids.OnShowNested && Grids.OnShowNested(this,r,G,cell)) { if(!BChrome) cell.style.overflow = "hidden"; return; }
      G.MainTag = cell;
      G.Render();
      this.ShowDetail(r,G.id);
      }
   else {
      var D = this.GetNestedSource(r);
      if(D){
         if(Grids.OnShowNested && Grids.OnShowNested(this,r,D,cell,id)) { if(!BChrome) cell.style.overflow = "hidden"; return; }
         G = TreeGrid(D,cell,id);
         }
      else {
         MS.Debug; this.Debug(1,"Missing layout XML for detail grid in cell [",r.id,",",c,"]"); ME.Debug; 
         }
      }
   if(!BChrome) cell.style.overflow = "hidden"; 
   
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.RefreshNested = function(r,always){ 
var id = this.id+"DG"+r.id, G = Grids[id];
if(G) G.Reload();
else if(always) this.ShowNested(r);
}
// -----------------------------------------------------------------------------------------------------------
ME.Nested;
// -----------------------------------------------------------------------------------------------------------
TGP.AddInDetail = function(row,show,src,idx){ 

var par = row.parentNode; if(!par||!par.DetailRow) return;
var next = row.nextSibling;
for(var i=idx!=null?idx:0;idx!=null?i==idx:i<par.DetailRow.length;i++) {
   var G = par.DetailGrid[i]; if(G.Cleared) continue;
   if(G.MasterDef&&G.MasterDef.search(new RegExp("(^|,)"+ToRegExp(row.Def.Name)+"(,|$)"))<0) continue;
   var nextr = null;
   if(next) for(var rr=next;rr;rr=rr.nextSibling) if(rr.DetailGrid) {  
      for(var j=0;j<rr.DetailGrid.length;j++) if(rr.DetailGrid[j]==G){ nextr = rr.DetailRow[j]; break; } 
      if(nextr) break;
      }
   var nr = G.AddRow(par.DetailRow[i],nextr,show&~2,row.id,row.Def.Name,src?src:row,1,0);
   if(!nr) continue;
   if(row.DetailRow) { row.DetailRow[row.DetailRow.length] = nr; row.DetailGrid[row.DetailGrid.length] = G; }
   else { row.DetailRow = [nr]; row.DetailGrid = [G]; }
   nr.MasterRow = row;
   var mr = src ? src : row;
   nr.Added = mr.Added; nr.Moved = mr.Moved; nr.Deleted = mr.Deleted; nr.Changed = mr.Changed;
   if(mr.Changed) { for(var c in this.Cols) if(mr[c+"Changed"]) nr[c+"Changed"] = mr[c+"Changed"]; }
   if(G.ColorState&2) G.ColorRow(nr); 
   for(var r=row.firstChild;r;r=r.nextSibling) this.AddInDetail(r,show,r);
   
   }   
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
TGP.DelDetail = function(row){ 
var r = row.MasterRow; if(!r||!r.DetailRow) return; 
row.MasterRow = null;
for(var i=0;i<r.DetailRow.length;i++) if(r.DetailRow[i]==row){ 
   r.DetailRow.splice(i,1); r.DetailGrid.splice(i,1); 
   if(!r.DetailRow.length) { r.DetailRow = null; r.DetailGrid = null; }
   
   return; 
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.DelDetailGrids = function(row){ 
for(var r=row.firstChild;r;r=r.nextSibling){
   if(r.DetailRow&&r.DetailRow[0].Page&&r.DetailGrid[0].NestedGrid) r.DetailGrid[0].Dispose(); 
   if(r.firstChild) this.DelDetailGrids(r);
   }
}
// -----------------------------------------------------------------------------------------------------------
ME.Master;

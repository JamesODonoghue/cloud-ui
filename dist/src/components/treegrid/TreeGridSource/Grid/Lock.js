MS.Edit;
var CUndoLock = { 
   "Accept":"edit", 
   "Change":"edit",
   "Add":"addrow", "Remove":"delrow", "Delete":"delrow", "Move":"moverow", "Show":"hiderow", "Hide":"hiderow",
   "Span":"style", "Split":"style",
   "ColsVisibility":"hidecol", "MoveCol":"movecol", "AddCol":"addcol", "DeleteCol":"delcol",
   "EditAttrs":"style",
   "GanttBase":"edit", "GanttFinish":"edit",
   "Focus":"focus",
   "ResizeRow":"resizerow", "ResizeCol":"resizecol", "ResizeSec":"resizesection", "ResizeMain":"resizegrid",
   "Select":"select", "Filter":"state", "Sort":"state", "Search": "state", "Filtered": "state", "Grouped":"state", "Sorted":"state", "Searched":"state",
   "EFormula":"edit", 
   "Border":"style", "BorderRow":"style", "BorderCol":"style", "Style":"style", 
   "SetImg":"edit", "SetLink":"edit",
   "CanEdit":"PermitEdit", 
   "IndentCol": "indentcol", 
   "Name":"edit" 
   };
// -----------------------------------------------------------------------------------------------------------
TGP.ConvertLock = function(val){
if(!val) return {length:0,index:-1};
if(typeof(val)=="object") return val;
var L = this.ConvertFlags(val,"layout,addrow,addcol,delrow,delcol,moverow,movecol,indentcol,resizerow,resizecol,resizesection,resizegrid,hiderow,hidecol,fixrow,fixcol,tab,edit,editlink,editimg,canedit,permitedit,style,formula,state,sort,filter,group,search,visibility,expand,zoom,sheet,export,copy,link,select,save,reload,import,cfg,print,lock,focus,data,view,read,all");
var A = {
   "all" : "data,view,read,select,focus,lock",
   "data" : "layout,edit,canedit,permitedit,style,expand,sheet,save",
   "view" : "state,zoom,cfg,reload,import",
   "read" : "export,copy,formula,link",
   "layout" : "addrow,addcol,delrow,delcol,moverow,movecol,indentcol,resizerow,resizecol,resizesection,resizegrid,hiderow,hidecol,fixrow,fixcol,tab",
   "state" : "sort,filter,group,search,visibility",
   "cfg" : "menu,size,lang"
   };
if(L["layout"] && !this.Deleting&&!this.Dragging&&!this.Resizing&&!this.ColAdding&&!this.ColDeleting&&!this.ColMoving&&!this.ColResiging&&!this.SectionResizing&&!this.ResizingMain) delete L["layout"]; 
for(var n in A) if(L[n]){
   delete L[n]; L.length--; 
   var a = A[n].split(","); for(var i=0;i<a.length;i++) if(!L[a[i]]) { L.length++; L[a[i]] = 1; }
   }
var A = { 
   "addrow" : this.Adding, "delrow" : this.Deleting, "moverow" : this.Dragging, "resizerow" : this.Resizing, "fixrow" : this.Dragging, 
   "addcol" : this.ColAdding, "delcol" : this.ColDeleting, "movecol" : this.ColMoving, "indentcol" : this.MaxColLevel>0&&this.ColTree>1, "resizecol" : this.ColResizing, "fixcol" : this.ColMoving,
   "resizesection" : this.SectionResizing, "resizegrid" : this.ResizingMain,
   "edit" : this.Editing==1, 
   "style" : this.DynamicStyle||this.DynamicBorder||this.DynamicSpan,
   "sort" : this.Sorting, "search" : this.Searching, "group" : this.Grouping, "filter" : this.Filtering, 
   "formula" : this.FormulaEditing,
   "expand" : this.MainCol, 
   "zoom" : this.Gantt,
   "select" : this.Selecting,
   "sheet" : this.File,
   "export" : this.ExportFormat,
   "copy" : this.CanCopyPaste&&(this.CopyFocused||this.CopySelected),
   "save" : this.Source.Upload.Url||this.Source.Upload.Tag||this.Source.Upload.Data||Grids.OnSave||Grids.OnUpload,
   "import" : this.ImportAction,
   "lang" : this.Language
   
   };
for(var n in A) if(L[n]&&!A[n]) { delete L[n]; L.length--; }
L.index = -1;
return L;
}
// -----------------------------------------------------------------------------------------------------------
TGP.CompareLocks = function(s,v){
s = this.ConvertLock(s); v = this.ConvertLock(v);
this.AddLockedAlways(s); this.AddLockedAlways(v);
if(!v.length) return s.length;
if(!s.length) return -v.length;

var si = 0; for(var n in s) if(!v[n]) si++;
var vi = 0; for(var n in v) if(!s[n]) vi++;
return si ? si : vi ? -vi : 0;
}
// -----------------------------------------------------------------------------------------------------------
TGP.AddLockedAlways = function(lock){
var a = this.LockedNever; 
if(a&&a.length) {
   if(typeof(a)=="string") { a = this.ConvertLock(a); this.LockedNever = a; }
   for(var n in a) if(n!="length"&&n!="index" && lock[n]) { delete lock[n]; lock.length--; }
   }
var a = this.LockedAlways; 
if(a&&a.length) {
   if(typeof(a)=="string") { a = this.ConvertLock(a); this.LockedAlways = a; }
   for(var n in a) if(n!="length"&&n!="index" && !lock[n]) { lock[n] = 1; lock.length++; }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateLockedValues = function(){
var V = this.LockedValues; if(!V || typeof(V)!=="string") return;
V = V.split(";"); this.LockedValues = V; 
for(var i=0;i<V.length;i++) { V[i] = this.ConvertLock(V[i]); V[i].index = i?i:"0"; }
for(var i=1;i<V.length;i++) { 
   var v = V[i], s = V[i-1]; if(s.length!=v.length) continue;
   for(var n in s) if(!v[n]) { n = null; break; } 
   if(n) V.splice(i--,1); 
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetLocked = function(val,norecalc){
if(norecalc&&Grids.OnLock){ var n = Grids.OnLock(this,val); if(n&&n-0) return false; if(n!=null) val = n; }
this.Locked = this.ConvertLock(val);
this.AddLockedAlways(this.Locked);
this.LockedEdit = this.Locked["edit"];
if(!norecalc) this.CalculateSpaces(1);
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionLock = function(dummy,T){
var s = this.LockedValues; if(!s||s.length==1||this.Locked["lock"]) return false;
if(T) return true;
var v = this.GetLockIndex();
this.SetLocked(s[v==s.length-1?0:v+1]);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetLockIndex = function(){
var v = this.Locked, s = this.LockedValues; if(!s) return 0;
for(var i=0,m=1000,ii=v.length?s.length-1:0;i<s.length;i++) {
   var n = this.CompareLocks(v,s[i]); if(!n) return s[i].index-0;
   if(n>0 ? n<m : m>0||n>m) { m = n; ii = i; }
   }
return s[ii].index-0;
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
TGP.ActionLock0 = function(dummy,T,val){
var s = this.LockedValues; if(!s||this.Locked["lock"]) return false;
var v = s[val?val:0];
if(v==null||!this.CompareLocks(v,this.Locked)) return false;
if(T) return true;
this.SetLocked(v);
return true;
}
TGP.ActionLock1 = function(F,T){ return this.ActionLock0(F,T,1); }
TGP.ActionLock2 = function(F,T){ return this.ActionLock0(F,T,2); }
TGP.ActionLock3 = function(F,T){ return this.ActionLock0(F,T,3); }
// -----------------------------------------------------------------------------------------------------------
ME.Edit;

// -----------------------------------------------------------------------------------------------------------
TGP.GetEditCells = function(F,T){
var S = this.CellRanges ? null : this.EventObject["EC"+(F?F:0)+(T?1:0)]; if(S) return S;
S = this.GetARanges(F);
var de = this.DynamicEditing==1;
if(S.Rows) for(var id in S.Rows) if(S.Rows[id].CanFocus==0||de&&S.Rows[id].Fixed) delete S.Rows[id];
if(S.Cols) for(var n in S.Cols) if(S.Cols[n].CanFocus==0||de&&S.Cols[n].MainSec!=1) delete S.Cols[n];
var N = [], E = T ? null : this.GetErrors("Edit"), X = {};
for(var k=0;k<S.length;k++){
   var R = [], C = []; this.GetRangeRC(S[k],R,C);
   for(var i=0;i<R.length;i++){
      var row = R[i]; if(de&&row.Fixed) continue;
      for(var j=0;j<C.length;j++){
         var col = C[j]; if(X[row.id+":"+col]) continue;
         X[row.id+":"+col] = 1;
         if(de&&this.Cols[col].MainSec!=1||!this.CanFocus(row,col)) continue;
         if(S.Rows&&S.Rows[row.id]||S.Cols&&S.Cols[col]) continue;
         N.push(row,col);
         }
      }
   }
if(S.Rows) for(var id in S.Rows) N.push(S.Rows[id],null);
if(S.Cols) for(var n in S.Cols) N.push(null,n);
N.Errors = E;
if(!this.CellRanges) this.EventObject["EC"+(F?F:0)+(T?1:0)] = N;
return N;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetCanEdit = function(row,col,val,undo,test,attr){
var O = !test&&undo&&this.Undo ? {} : null, X = null, n = attr ? attr : "CanEdit";
if(!row){
   var zz = val, C = this.Cols[col], R = this.Rows;
   
   if(O) O[n] = C[n];
   if(!test) C[n] = zz; else if(C[n]!=val) return true;
   for(var id in R) {
      var r = R[id], a = col+n, z = zz, v = r.Def[a]; if(v==null) v = r[n]; if(v==null&&r.Def[n]!=1) v = r.Def[n];
      if(v==null||v==zz) z = null;
      else if(zz==null&&r.Def[a]==null&&r[n]!=null) z = r.Def[n]!=null&&(r.Def[n]!=1||attr) ? r.Def[n] : 1;
      if(r[a]!=z) { 
         if(test) return true;
         if(X){ if(!X[id]) X[id] = {}; X[id][a] = r[a]; } 
         r[a] = z; 
         }
      }
   if(test) return false;
   for(var id in R) if(R[id].r1) this.ColorCell(R[id],col);
   }
else if(!col){
   var zz = val, D = row.Def, C = this.Cols;
   
   if(O) O[n] = row[n];
   if(!test) row[n] = zz; else if(row[n]!=val) return true;
   for(var c in C) {
      var a = c+n, z = row[a];
      if(z!=null) z = zz!=null ? zz : C[c][n]&&(D[n]==null||D[n]==1&&!attr)&&D[a]==null ? 1 : null;
      else if(zz==null&&(D[n]==null||D[n]==1)&&C[c][n]!=null) z = C[c][n]&&D[a]==null ? 1 : null;
      else if(zz==""&&(D[a]!=null||C[c][n]!=null)) z = zz;
      if(z!=row[a]){
         if(test) return true;
         if(O) O[a] = row[a];
         row[a] = z; 
         
         }
      }
   if(test) return false;
   this.ColorRow(row);
   }
else {
   var z = val, D = row.Def, C = this.Cols[col];
   if(D[col+n]!=null) { if(D[col+n]==z) z = null; }
   else if(row[n]!=null) { if(row[n]==z) z = null; else if(z==null) z = D[col+n]!=null ? D[col+n] : D[n]!=null ? D[n] : 1; }
   else if(attr&&D[n]!=null) { if(D[n]==z) z = null; }
   else if(C[n]!=null) { if(C[n]==z) z = null; else if(z==null) z = D[col+n]!=null ? D[col+n] : D[n]!=null ? D[n] : 1; }
   if(row[col+n]==z) return false;
   if(test) return true;
   
   if(O) O[col+n] = row[col+n];
   row[col+n] = z;
   this.ColorCell(row,col);
   }
if(O) { var V = {}; V[n] = val; this.AddUndo({Type:"CanEdit",Row:row,Col:col,Val:V,Old:O,Refresh:0}); }
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionClearEditable = function(F,T,val,attr){  
if(!this.DynamicEditing || this.Locked["permitedit"]) return false;
if(!T&&this.EditMode&&this.EndEdit(1)==-1) return false;
var max = T&&this.MaxMenuCells ? this.MaxMenuCells : 1e10, chg = 0, maxall = T&&this.MaxMenuAllCells ? this.MaxMenuAllCells : 1e10;
var S = this.GetEditCells(F,T);
for(var i=0;i<S.length;i+=2){
   if(--maxall<=0) return this.MaxMenuAllCellsValue;
   chg += this.SetCanEdit(S[i],S[i+1],val,1,T,attr);
   }
if(T) return chg;

this.ProcessErrors(S.Errors);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSetEditable = function(F,T){ return this.ActionClearEditable(F,T,1); }
TGP.ActionSetReadOnly = function(F,T){ return this.ActionClearEditable(F,T,0); }
TGP.ActionSetPreview = function(F,T){ return this.ActionClearEditable(F,T,2); }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionShowFormula = function(F,T){ return this.ActionClearEditable(F,T,2,"FormulaCanEdit"); }
TGP.ActionHideFormula = function(F,T){ return this.ActionClearEditable(F,T,0,"FormulaCanEdit"); }
TGP.ActionDefaultFormula = function(F,T){ return this.ActionClearEditable(F,T,null,"FormulaCanEdit"); }

// -----------------------------------------------------------------------------------------------------------
TGP.ActionClearEditableCells = function(F,T){ this.ActionClearEditable(F?F|1:1,T,null); }
TGP.ActionSetEditableCells = function(F,T){ return this.ActionClearEditable(F?F|1:1,T,1); }
TGP.ActionSetReadOnlyCells = function(F,T){ return this.ActionClearEditable(F?F|1:1,T,0); }
TGP.ActionSetPreviewCells = function(F,T){ return this.ActionClearEditable(F?F|1:1,T,2); }
TGP.ActionClearEditableSelected = function(F,T){ return this.ActionClearEditable(F?F|2:2,T,null); }
TGP.ActionSetEditableSelected = function(F,T){ return this.ActionClearEditable(F?F|2:2,T,1,1); }
TGP.ActionSetReadOnlySelected = function(F,T){ return this.ActionClearEditable(F?F|2:2,T,0,1); }
TGP.ActionSetPreviewSelected = function(F,T){ return this.ActionClearEditable(F?F|2:2,T,2,1); }
TGP.ActionClearEditableRow = function(F,T) { return this.ActionClearEditable(F?F|8:8,T,null); }
TGP.ActionSetEditableRow = function(F,T){ return this.ActionClearEditable(F?F|8:8,T,1); }
TGP.ActionSetReadOnlyRow = function(F,T){ return this.ActionClearEditable(F?F|8:8,T,0); }
TGP.ActionSetPreviewRow = function(F,T){ return this.ActionClearEditable(F?F|8:8,T,2); }
TGP.ActionClearEditableRows = function(F,T){ return this.ActionClearEditable(F?F|9:9,T,null); }  
TGP.ActionSetEditableRows = function(F,T){ return this.ActionClearEditable(F?F|9:9,T,1); }
TGP.ActionSetReadOnlyRows = function(F,T){ return this.ActionClearEditable(F?F|9:9,T,0); }
TGP.ActionSetPreviewRows = function(F,T){ return this.ActionClearEditable(F?F|9:9,T,2); }
TGP.ActionClearEditableSelectedRows = function(F,T){ return this.ActionClearEditable(F?F|10:10,T,null); }  
TGP.ActionSetEditableSelectedRows = function(F,T){ return this.ActionClearEditable(F?F|10:10,T,1); }
TGP.ActionSetReadOnlySelectedRows = function(F,T){ return this.ActionClearEditable(F?F|10:10,T,0); }
TGP.ActionSetPreviewSelectedRows = function(F,T){ return this.ActionClearEditable(F?F|10:10,T,2); }
TGP.ActionClearEditableCol = function(F,T) { return this.ActionClearEditable(F?F|16:16,T,null); }
TGP.ActionSetEditableCol = function(F,T){ return this.ActionClearEditable(F?F|16:16,T,1); }
TGP.ActionSetReadOnlyCol = function(F,T){ return this.ActionClearEditable(F?F|16:16,T,0); }
TGP.ActionSetPreviewCol = function(F,T){ return this.ActionClearEditable(F?F|16:16,T,2); }
TGP.ActionClearEditableCols = function(F,T){ return this.ActionClearEditable(F?F|17:17,T,null); }  
TGP.ActionSetEditableCols = function(F,T){ return this.ActionClearEditable(F?F|17:17,T,1); }
TGP.ActionSetReadOnlyCols = function(F,T){ return this.ActionClearEditable(F?F|17:17,T,0); }
TGP.ActionSetPreviewCols = function(F,T){ return this.ActionClearEditable(F?F|17:17,T,2); }
TGP.ActionClearEditableSelectedCols = function(F,T){ return this.ActionClearEditable(F?F|18:18,T,null); }  
TGP.ActionSetEditableSelectedCols = function(F,T){ return this.ActionClearEditable(F?F|18:18,T,1); }
TGP.ActionSetReadOnlySelectedCols = function(F,T){ return this.ActionClearEditable(F?F|18:18,T,0); }
TGP.ActionSetPreviewSelectedCols = function(F,T){ return this.ActionClearEditable(F?F|18:18,T,2); }

// -----------------------------------------------------------------------------------------------------------

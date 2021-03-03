// -----------------------------------------------------------------------------------------------------------
// Changes sent from server to grid
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Adds all changes in <Changes> to grid. Changes is the XML
MS.ServerChanges;
TGP.AddChanges = function(Changes,spec){
if(!Changes.firstChild) return;

if(this.Loading&&!spec){
   if(!this.PendingChanges) this.PendingChanges = [];
   this.PendingChanges[this.PendingChanges.length] = Changes;
   return;
   }

var Update = Changes["Update"]; 
if(Update==null) Update = this.ChangesUpdate;

if(Update&16) this.AcceptChanges();

var T = this;
function UpdateId(row,oldid){ 
   MS.Copy;
   if(!T.Copying) return;
   var newid = row.id;
   for(var r=T.GetFirst();r;r=T.GetNext(r)) if(r.Copy==oldid) r.Copy = newid;
   if(T.Cols[T.IdCol]) T.RefreshCell(row,T.IdCol);
   ME.Copy;
   }

var A = null, anim = "";
MS.Animate; if(Update&256 && !this.SuppressAnimations) { if(this.AnimateRows) A = []; if(this.AnimateCells) anim = "Changed"; } ME.Animate;

var raa = ["CanDelete","CanSelect","CanExpand","Selected","Expanded","Class","Calculated","CalcOrder","Height"]; 
var rac = ["CanEdit","CanFocus","Color","AlternateColor","Menu"]; 
var cac = ["CanEdit","CanFocus","Selected", 
   "Defaults","Suggest","SuggestType","EditEnum","EnumMenu","Color" ];
var car = ["Class","HtmlPrefix","HtmlPostfix","Visible","Formula","Error",
   "Type","Range","Format","Button","Icon","ButtonText",
   "Enum","EnumKeys","IntFormat","Related","Refresh","Clear"];
var caa = ["Tip","ToolTip","Size","Menu","EditFormat","ExportFormat","EditMask","ResultMask","CopyTo","sum","count","calc","max","min","sumsq","product","counta","countblank","sumrange","sumjoin","joinsum","join"];
var baa = ["Name00","Name01","Name02","Name10","Name11","Name12","Name20","Name21","Name22","sum","count","calc","max","min","sumsq","product","counta","countblank","sumrange","sumjoin","joinsum","join"];
var ear = this.GetEditAttrs(2), fp = ear.EFormula ? this.Lang.Format.FormulaPrefix : null;
if(ear.RowSpan!=null) ear.splice(ear.RowSpan,1);
if(ear.Span!=null) ear.splice(ear.Span-(ear.RowSpan!=null&&ear.Span>ear.RowSpan?1:0),1);
ear.push("Img","Link");
if(Update&1) { var oundo = this.OUndo, zalso = this.SaveOrder; this.OUndo = null; this.SaveOrder = 0; this.NoSetRowState = 1; }
var dep = this.GanttDependency, idx = Update&64&&this.RowIndex, addpages = Update&128&&this.AutoPages;
this.StartUpdate();
var em = this.EditMode, st = 0, N = [], recalc = 0;
for(var r=Changes.firstChild;r;r=r.nextSibling){

   if(r.Added || r.Moved){
      var pid = r.Parent, p = null;
      if(pid!=null) {
         if(this.MainCol) p = this.GetRowById(pid);
         if(!p&&(pid-0)>=0&&this.Paging) p = GetNode(this.XB,pid-0);
         }
      if(p && p.State<2) {
         if(!n && this.Print && this.PrintLoad && (this.Paging==3||this.ChildPaging==3)) {
            var zl = this.Loading; this.Loading = 0; 
            this.DownloadAllPagesSync(this.PrintExpanded,this.PrintFiltered);
            this.Loading = zl; 
            }
         if(p.State<2) continue; 
         }
      if(r.Added&&r.id&&this.GetRowById(r.id)){
         var Added = Changes["Added"];
         if(Added==null) Added = this.ChangesAdded;
         var o = this.GetRowById(r.id);
         if(!Added){ delete r.Added; r.Changed = 1; r.Moved = 1; } 
         else if(Added==1) this.DelRow(o); 
         else if(Added==2) continue; 
         else if(Added==3) r.id = null; 
         else if(Added==4){ this.Rows[r.id] = {}; this.SetRowId(o); UpdateId(o,r.id); delete this.Rows[r.id]; }
         }
      var nx = r.Next?this.GetRowById(r.Next):null; if(nx && p && nx.parentNode!=p) nx = null;
      var pr = r.Prev?this.GetRowById(r.Prev):null; if(pr && p && pr.parentNode!=p) pr = null;
      if(pr && !nx) nx = pr.nextSibling; 
      if(!p&&pid!=null&&this.ChildPaging==3) { 
         if(r.Added) continue; 
         delete r.Moved; 
         }
      }
      
   // --- Added ---
   if(r.Added || r.Moved==2&&(idx ? !this.GetRowByIndex(r.id,1) : !this.GetRowById(r.id))) {
      MS.Add;
      
      var n = this.AddRow(p,nx,0,r.id,r.Def,null,null,null,null,1); 
      if(n){
         
         for(var i=0;i<raa.length;i++) if(r[raa[i]]!=null) n[raa[i]] = r[raa[i]];
         for(var i=0;i<rac.length;i++) if(r[rac[i]]!=null) n[rac[i]] = r[rac[i]];
         for(var c in this.Cols){ 
            if(r[c]!=null) n[c] = r[c];
            for(var i=0;i<car.length;i++) if(r[c+car[i]]!=null) n[c+car[i]] = r[c+car[i]];
            for(var i=0;i<cac.length;i++) if(r[c+cac[i]]!=null) n[c+cac[i]] = r[c+cac[i]];
            for(var i=0;i<caa.length;i++) if(r[c+caa[i]]!=null) n[c+caa[i]] = r[c+caa[i]];
            for(var i=0;i<ear.length;i++) if(r[c+ear[i]]!=null) n[c+ear[i]] = r[c+ear[i]];
            }
         
         MS.Copy;
         if(r.Copy){
            var cp = this.GetRowById(r.Copy);
            while(cp && cp.Copy) cp = this.GetRowById(cp); 
            if(cp){
               n.Copy = cp.id;
               n.Count = cp.State>=2 ? cp.childNodes.length : cp.Count; 
               n.State = 0;
               }
            }
         ME.Copy;
         
         n.Def = r.Def ? r.Def : n.Def.Name;
         var zalsi = this.SetIds, id = n.id; this.SetIds = 0; 
         this.UpdateRowValues(n);
         this.LoadedCount++;
         this.SetIds = zalsi;

         if(Update&1) n.Added = 0;
         
         if(r.Visible!=0) { 
            MS.Tree;
            var ex = p && !p.Expanded && !p.Page && p.firstChild==n && p.lastChild==n; 
            if(ex){ n.Visible = 1; this.Expand(p); n.Visible = 0; } 
            this.ShowRow(n);
            if(ex) this.Collapse(p); 
            this.UpdateRowIcons(n,1);
            MX.Tree;
            this.ShowRow(n);
            ME.Tree;
            MS.Animate; if(A) A.push([n,"Added"]); ME.Animate; 
            }
         if(id && id!=n.id && this.SetIds){
            if(this.Rows[id]==n) delete this.Rows[id];
            this.SetRowsId(n);
            } 
         }
      ME.Add;
      }
      
   // --- Changed,Deleted,Moved ---
   else {
      
      var n = idx ? this.GetRowByIndex(r.id,1) : this.GetRowById(r.id);
      if(!n&&r.Pos!=null&&this.Paging==3){
         n = this.GetPage(r.Pos);
         if(n) {
            for(var c in this.Cols) for(var i=0;i<baa.length;i++) if(r[c+baa[i]]!=null) n[c+baa[i]] = r[c+baa[i]];
            recalc = 1;
            }
         }
      if(!n&&addpages){
         for(var i=0;i<100&&!n;i++) { 
            var zl = this.Loading; this.Loading = 0;
            this.AddAutoPages(); 
            this.Loading = zl;
            if(idx) this.UpdateRowIndex(); 
            n = idx ? this.GetRowByIndex(r.id,1) : this.GetRowById(r.id); 
            }
         if(!idx&&this.RowIndex) this.UpdateRowIndex();
         }
      else if(!n && this.Print && this.PrintLoad && (this.Paging==3||this.ChildPaging==3)) {
         var zl = this.Loading; this.Loading = 0; 
         this.DownloadAllPagesSync(this.PrintExpanded,this.PrintFiltered);
         this.Loading = zl;
         n = idx ? this.GetRowByIndex(r.id,1) : this.GetRowById(r.id); 
         }
      if(n&&!n.Page){
         if(r.Deleted){ 
            if(Update&1){
               var par = n.parentNode; n.Deleted = 1;
               if(!par.Page && Get(par,"DefEmpty") && !this.HasNDChildren(par)) this.ChangeDef(par,Get(par,"DefEmpty"),1);
               if(Grids.OnRowDelete) Grids.OnRowDelete(this,n,1);
               
               if(A) this.DeleteRowT(n,2,null,null,1); 
               else this.DelRow(n);
               }
            else if(this.DeleteRowT) this.DeleteRowT(n,2,null,null,A);
            MS.Animate; if(A) A.push([n,Update&1||!this.ShowDeleted?"Deleted":"DeletedVisible",1,Update&1||!this.ShowDeleted?this.ClearRow.bind(this,n,Update&1):null]); ME.Animate;
            }
         else {
         
            MS.Move;
            if(r.Moved) {  
               this.MoveRow(n,p,nx,true,null,1);
               MS.Animate; if(A) A.push([n,"Moved",1]); ME.Animate; 
               
               }
            ME.Move;
               
            MS.Select;
            if(r.Selected!=null && r.Selected!=(n.Selected?n.Selected:0)){
               if(r.Selected>=2) n.Selected = r.Selected;
               else {
                  this.SelectRow(n);
                  MS.Animate; if(A) A.push([n,n.Selected?"Selected":"Deselected"]); ME.Animate;
                  }
               }
            if(r.CanSelect!=null){ n.CanSelect = r.CanSelect; this.UpdatePanel(n); }
            ME.Select;
            
            MS.Tree;
            if(r.Level!=null&&r.Level!=n.Level){
               var dev = r.Level-n.Level;
               if(dev<0) for(var i=0;i>dev;i--) this.OutdentRow(n);
               else for(var i=0;i<dev;i++) this.IndentRow(n);
               }
            if(r.Expanded!=null && r.Expanded!=n.Expanded){
               if(r.Expanded) {
                  this.Expand(n);
                  MS.Animate; if(A) A.push([n,"Expanded",1]); ME.Animate; 
                  }
               else {
                  this.Collapse(n);
                  MS.Animate; if(A) A.push([n,"Collapsed",1]); ME.Animate;
                  }
               }
            if(r.CanExpand!=null){ n.CanExpand = r.CanExpand; this.UpdateIcon(n); }
            ME.Tree;
            
            if(r.CanDelete!=null){ n.CanDelete = r.CanDelete; this.UpdatePanel(n); }

            MS.RowResize;
            if(r.Height!=null) this.ResizeRow(n,r.Height,1);
            ME.RowResize;

            var rrec = 0;
            for(var i=0;i<rac.length;i++) if(r[rac[i]]!=null) { rrec = 1; n[rac[i]] = r[rac[i]]; }
            if(rrec) this.ColorRow(n);
            if(r.Class!=null){ n.Class = r.Class; this.RefreshRow(n); }
            var cols = n.Space ? n.CellNames : this.Cols;
            for(var c in cols){
               var v = r[c],ref=0,rec=0;
               if(this.DynamicSpan && ((r[c+"Span"]>1?r[c+"Span"]!=n[c+"Span"]:n[c+"Span"]>1&&r[c+"Span"]!=null)||(r[c+"RowSpan"]>1?r[c+"RowSpan"]!=n[c+"RowSpan"]:n[c+"RowSpan"]>1&&r[c+"RowSpan"]!=null))){
                  if(n[c+"Span"]>1&&n[c+"RowSpan"]!=0&&n[c+"Visible"]!=-2||n[c+"RowSpan"]>1&&n[c+"Span"]!=0) this.SplitSpanned(n,c);
                  var rs = r[c+"RowSpan"], cs = r[c+"Span"]; if(rs==null||rs==="") rs = 1; if(cs==null||cs==="") cs = 1; 
                  if(rs>=1&&cs>=1){
                     for(var r2=n;rs>1.5&&r2;rs--) r2 = this.GetNextSibling(r2);
                     if(!r2) r2 = this.GetLast();
                     else if(rs%1) while(r2.lastChild) r2 = r2.lastChild;
                     for(var c2=c;cs>1&&c2;cs--) c2 = this.GetNextCol(c2,null,2);
                     if(!c2) c2 = this.GetLastCol(null,2);
                     if(n!=r2||c!=c2) this.SpanRange(n,c,r2,c2);
                     }
                  }
               
               for(var i=0;i<car.length;i++) if(r[c+car[i]]!=null){ ref = 1; n[c+car[i]] = r[c+car[i]]; }
               for(var i=0;i<cac.length;i++) if(r[c+cac[i]]!=null){ rec = 1; n[c+cac[i]] = r[c+cac[i]]; }
               for(var i=0;i<caa.length;i++) if(r[c+caa[i]]!=null) n[c+caa[i]] = r[c+caa[i]];
               for(var i=0;i<ear.length;i++) if(r[c+ear[i]]!=null){ ref = 1; n[c+ear[i]] = r[c+ear[i]]; }
               if(r[c+"Formula"]) this.Recalculate(n,c);
               
               if((v!=null || ref)&&!(Update&32)){ 
                  if(em && this.ERow==n && this.ECol==c){ this.EndEdit(); st = 1; }
                  if(v!=null && c!="id") {
                     if(fp&&(v+"").indexOf(fp)==0) { n[c] = v; if(n[c+"EFormula"]) n[c+"EFormula"] = null; }
                     else { this.SetString(n,c,v+"",0,0,1,0,1,Update&1); if(fp&&n[c+"EFormula"]) n[c+"EFormula"] = null; }
                     }
                  this.RefreshEnum(n,c,anim);
                  if(!r.Def) this.RefreshCellAnimate(n,c,anim); 
                  if(st){ this.StartEdit(); st = 0; } 
                  }
               else if(rec) this.ColorCell(n,c);   
               }
   
            n.Def = r.Def ? r.Def : n.Def.Name;
            var zalsi = this.SetIds; this.SetIds = 0; 
            var zalim = this.IdMore; this.IdMore = 0;
            var zalfi = this.FullId; this.FullId = 0;
            this.UpdateRowValues(n); 
            this.SetIds = zalsi; this.IdMore = zalim; this.FullId = zalfi;
            if(r.Def) this.RefreshRow(n); 
            if(r.Visible!=null && Get(n,"Visible")!=r.Visible){
               if(r.Visible) this.ShowRow(n);
               else this.HideRow(n);
               }
            MS.Calc;   
            if(r.CalcOrder!=null || r.Calculated != null){
               if(r.Calculated!=null) n.Calculated = r.Calculated;
               if(r.CalcOrder!=null) n.CalcOrder = r.CalcOrder;
               this.Calculating = 1;
               this.Recalculate(n,null,1);
               }   
            ME.Calc;   
            if(r.NewId) {
               if(this.SetIds) {
                  if(this.Rows[n.id]==n) delete this.Rows[n.id];
                  n.id = r.NewId;
                  this.SetRowsId(n);
                  }
               else n.id = r.NewId;
               UpdateId(n,r.id);
               
               } 
            else if(r.id!=n.id && this.SetIds){
               if(this.Rows[r.id]==n) delete this.Rows[r.id];
               this.SetRowsId(n);
               }   
            }
         }
      else {
         MS.Debug;
         this.Debug(this.Paging==3||this.ChildPaging==3?4:2,"Cannot update row with id='",r.id,"', the row not found");
         ME.Debug;
         }   
      }
   if(n) { 
      N[N.length] = n;
      if(Grids.OnUpdateRow) Grids.OnUpdateRow(this,n,r);
      }
   }

if(!spec) {   

// --- Filter, Search ---
   var MC = this.Cols[this.MainCol], F1 = this.Filter1, F2 = this.Filter2, F3 = this.Filter3, FF = Update&4 && (F1||F2||F3||Grids.OnRowFilter);
   for(var j=0;j<N.length;j++){
      var n = N[j];
   
      // --- Filter ---
      MS.Filter;
      if(FF){
         this.Recalculate(n,null,0);
         var R = [];
         for(var ra=n;!ra.Page;ra=ra.parentNode) R[R.length] = ra;
         for(var i=R.length-1;i>=0;i--){
            var ra = R[i];
            if(ra.Kind=="Data" && (!ra.Deleted || this.ShowDeleted)){
               var cf = Get(ra,"CanFilter"), f; if(cf&1) { var f1 = F1 ? F1(r) : 2, f2 = F2 ? F2(r) : 2, f3 = F3 ? F3(r,this) : 2; f = f1&&f2&&f3 ? (f1!=2||f2!=2||f3!=2 ? 1 : 2) : 0; } else f = 2;
               if(Grids.OnRowFilter) { var tmp = Grids.OnRowFilter(this,ra,f); if(tmp!=null) f = tmp; }
               if(f==2) { f = cf&2 ? null : !ra.Visible&&!ra.Filtered; cf = cf&2; }
               else f = f ? 0 : 1;
               if(f){ if(!ra.Filtered) this.HideRow(ra); }
               else if(ra.Filtered) this.ShowRow(ra,0,0,1);
               ra.Filtered = f;
               if(f) break;
               }
            }
         
         if(this.FilterEmpty) for(var ra=n;!ra.Page;ra=ra.parentNode){
            if(ra.Filtered) continue;
            if((Get(ra,"CanFilter")&2 || ra.CPage) && !this.HasChildren(ra)){
               if(!ra.Deleted || this.ShowDeleted) this.HideRow(ra);
               ra.Filtered = 1; 
               }
            }
         }
      ME.Filter;
      
      // --- Calc ---
   
      // --- Search ---
      MS.Search;
      if(Update&8 && this.SearchAction){
         var cel = this.SearchCells, exp = this.SearchExpand;
         var F = this.BuildSearch(this.SearchExpression);
         var Method = F[1]; F = F[0];
         var action = this.SearchAction.split(/[,;]/);
         for(var i=0;i<action.length;i++){
            switch(action[i]){
               case "Select" :
                  MS.Select;
                  if(!this.CanSelect(n)) break;
                  var found = F(n);
                  found  = typeof(found)=="string" || found>0;
                  var sel = n.Selected&this.SelAnd;
                  if(sel && !found) this.SelectRow(n);
                  else if(!sel && found){
                     this.SelectRow(n);
                     if(exp) this.ExpandParents(n);
                     }
                  ME.Select;
                  break;
               case "Mark":
                  var Color = this.Colors["Found"+this.SearchColorIdx];
                  if(cel && Method==1) { 
                     var found = F(n);
                     while(found && typeof(found)=="string"){
                        n[found+"MarkColor"] = Color;
                        if(this.SearchClass){ 
                           n[found+"MarkClass"] = "Found"+this.SearchColorIdx;
                           this.RefreshCell(n,found);
                           }
                        else this.ColorCell(n,found);
                        if(exp) this.ExpandParents(n);
                        found = F(n,found);
                        }
                     }
                  else {
                     var found = F(n)>0;
                     if(found){
                        n.MarkColor = Color;
                        if(this.SearchClass){ 
                           n.MarkClass = "Found"+this.SearchColorIdx;
                           this.RefreshRow(n);
                           }
                        else this.ColorRow(n);
                        if(exp) this.ExpandParents(n);
                        }
                     }
                  break;
               }
            }
         }
      ME.Search;

      }
   }
if(!spec && this.RefreshDetail) this.RefreshDetail();
var zal = this.ZalAutoUpdate; this.ZalAutoUpdate = 0;
this.EndUpdate(N.length==1&&!N[0].Removed?N[0]&&!recalc:null,null,spec);
this.AutoUpdate = zal;
if(!spec) this.UpdateEmptyRows(); 
if(this.RowIndex) this.UpdateRowIndex(1);   
if(Update&1) { this.OUndo = oundo; if(oundo) this.CalculateSpaces(1); this.SaveOrder = zalso; this.NoSetRowState = null; }
MS.Animate; if(A) this.AnimRows(A); ME.Animate;

}
ME.ServerChanges;
// -----------------------------------------------------------------------------------------------------------

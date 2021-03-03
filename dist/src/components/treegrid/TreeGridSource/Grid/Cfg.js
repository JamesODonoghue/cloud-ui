// -----------------------------------------------------------------------------------------------------------
// Functions for configuration and cookies
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Loads configuration from cookie, format see SaveCfg
MS.Cfg;
TGP.LoadCfg = function(cfg,body){
if(Grids.OnLoadCfg && Grids.OnLoadCfg(this,cfg)) return;
if(this.SuppressCfg&1){ MS.Debug; this.Debug(4,"Loading configuration is suppressed, default values from XML are used"); ME.Debug; return; }
if(cfg==null){
   if(this.SuppressCfg&4){ MS.Debug; this.Debug(4,"No Cookie attribute set, default values from XML are used"); ME.Debug; return; }
   var id = this.CfgId ? this.CfgId : this.id;
   if(this.PersistentCfg){
      MS.CfgPersistent;
      cfg = LoadCache("TreeGrid"+id,this.PersistentCfg==3);
      if(cfg==false && this.PersistentCfg==1) cfg = Grids.GetCfg(id);
      MS.Debug; this.Debug(4,"Loading configuration from persistent storage"); ME.Debug; 
      ME.CfgPersistent;
      }
   else { 
      cfg = Grids.GetCfg(id);
      MS.Debug; this.Debug(4,"Loading configuration from cookies"); ME.Debug; 
      }
   }
else { MS.Debug; this.Debug(4,"Loading configuration from Cookie attribute"); ME.Debug; }
if(!cfg){ MS.Debug; this.Debug(4,"No saved configuration is found, default values from XML are used"); ME.Debug; return; }
cfg += ""; 

var rec = !this.Loading&&!body;
if(rec){
   if(this.Paging==3 && !this.OnePage) {
      if(!this.CanReload()) return;
      this.OldGroup = this.Group; 
      if(this.Group) this.ClearGroupMain();
      }
   else {
      MS.Group; if(this.Grouping && this.Grouped && this.Group) this.Ungroup(); ME.Group;
      MS.Search;
      if(this.Searching && this.Searched && !this.Filter2 && this.SearchAction) this.DoSearch("Clear");
      ME.Search;
   
      MS.Filter; 
      if(this.Filtering && (this.Filtered && this.Filter1 || this.Searched && this.Filter2 || this.SaveFilters&&this.Filter3)) { 
         this.Filter1 = null;
         this.Filter2 = null;
         if(this.SaveFilters) this.Filter3 = null;
         
         this.DoFilterT(0);
         }
      ME.Filter;
      }
   }

if(cfg.charAt(0)!='+') return; 
cfg = cfg.slice(1);
MS.Debug; this.DebugCookie(cfg); ME.Debug;
var E, Cfg = this.Saver; if(!Cfg) { Cfg = new TCfg(); this.Saver = Cfg; }
Cfg.Data = cfg;
var ver = Cfg.GetInt();
if(this.Version && ver!=parseInt(this.Version)) return;
var X1 = Cfg.GetInt6(), X2 = Cfg.GetInt6(), X3 = Cfg.GetInt6(), X4 = Cfg.GetInt6(), X5 = Cfg.GetInt6(), X6 = Cfg.GetInt6(), X7 = 0, X8 = 0, X9 = 0, X10 = 0, X11 = 0, X12 = 0, X13 = 0, X14 = 0;
if(X6&32) { X7 = Cfg.GetInt6(); X8 = Cfg.GetInt6(); }
if(X8&32) { X9 = Cfg.GetInt6(); X10 = Cfg.GetInt6(); }
if(X10&32){ X11 = Cfg.GetInt6(); X12 = Cfg.GetInt6(); }
if(X12&32){ X13 = Cfg.GetInt6(); X14 = Cfg.GetInt6(); }
var custom = null;
if(X9&8) custom = Cfg.GetString();
if(Grids.OnLoadCustomCfg) Grids.OnLoadCustomCfg(this,custom,cfg);
   
// --- Cfg ---
if(!this["ShowDeletedLap"]) this.ShowDeleted = X1&1 ? 1 : 0;
if(!this["AutoSortLap"]) this.AutoSort = X1&4 ? 1 : 0;
if(!this["CalculatedLap"]) this.Calculated = X1&8 ? 1 : 0;
if(!this["AutoUpdateLap"]) this.AutoUpdate = X1&16 ? 1 : 0;
MS.Panel;
if(!this["HidePanelLap"] && !this.Cols.Panel["VisibleLap"]) this.Cols.Panel.Visible = X1&32 ? 0 : 1;
ME.Panel;
   
if(!this["ShowDragLap"]) this.ShowDrag = X2&1 ? 1 : 0;
if(!this["AllPagesLap"]) this.AllPages = X2&4 ? 1 : 0;
if(!this["HoverLap"]) this.Hover = (X2>>3)&3;
if(!this["ReversedTreeLap"]) this.ReversedTree = X10&2 ? 1 : 0;
if(!this["ColTreeLap"]&&this.ColTree) this.ColTree = ((X13>>4)&3)+1;
if(!this["HideTreeLap"]&&this.HideTree!=3) this.HideTree = X14&3;
if(!this["PrintLap"]) this.PrintOnlyData = X14&4;
if(!this["ShowButtonsLap"] && X10&12) this.ShowButtons = (X10&12)>>2;
if(!this["SuppressAnimationsLap"] && X11&1) this.SuppressAnimations = X11&2 ? 1 : 0;
if(!this["ShrinkStyleLap"]) this.ShrinkStyle = X12&3;
if(!this["DefaultBorderLap"]) this.DefaultBorder = X11&32;
if(!this["FormulaTipLap"]) this.FormulaTip = X12&4;
if(!this["HideZeroLap"]) this.HideZero = X13&1;
if(!this["FormulaShowLap"]) this.FormulaShow = X13&2;
if(!this["ShowPrintPageBreaksLap"] && this.ShowPrintPageBreaks>=0) this.ShowPrintPageBreaks = X13&4 ? 1 : 0;

if(X2&32){ E = Cfg.GetInt(); MS.Pager; if(!this["PagerWidthLap"] && this.Pagers[0] && !this.Pagers[0]["WidthLap"]) this.Pagers[0].Width = E<10?10:E; ME.Pager; } 
if(X9&32){ 
   var len = Cfg.GetInt();
   for(var i=0;i<len;i++){
      var n = Cfg.GetString(), v = Cfg.GetInt(), w = Cfg.GetInt();
      var P = this.Pagers[n]; if(!P && this.Pager.Name==n) P = this.Pager;
      if(P && !body){
         if(!this["PagerWidthLap"] && !P["WidthLap"]) P.Width = w<10?10:w;
         if(!this["ShowPagerLap"] && !P["VisibleLap"]) P.Visible = !!v;
         }
      }
   }
else if(!this["ShowPagerLap"] && this.Pagers[0] && !this.Pagers[0]["VisibleLap"]) this.Pagers[0].Visible = X2&2 ? 1 : 0; 

if(!this["SortIconsLap"]) this.SortIcons = X3&3;
if(X3&4){ E = Cfg.GetInt(); if(!this["CheckIntervalLap"]) this.Source.Check.Interval = E; }
if(X3&8) {
   if(!this["ResizingMainLap"] && this.MainTag){
      var w = Cfg.GetInt(), h = Cfg.GetInt();
      MS.Resize;
      if(w) this.MainTag.style.width = w+"px";
      if(h) this.MainTag.style.height = h+"px";
      ME.Resize;
      }
   else { Cfg.GetInt(); Cfg.GetInt(); }
   }
      
// --- Language ---
if(X12&8){
   var s = Cfg.GetString();
   if(!this["LanguageLap"] && this.Language) this.Language = s;
   }

// --- Style ---
var ST = null;
if(X6&8||X11&12){
   var s = null, gs = null, size, scale, contrast;
   if(X6&8) { s = Cfg.GetString(); if(X11&16) gs = Cfg.GetString(); }
   if(X11&4) size = Cfg.GetString();
   if(X11&8) scale = Cfg.GetString();
   if(X13&8) contrast = Cfg.GetString();
   MS.Scale; if(!this["ScaleLap"] && X11&8 && !body) { this.Scale = scale-0?scale:1; this.LastScale = this.Scale; } ME.Scale;
   if(!this["SizeLap"] && X11&4 && this.Size!=size && !body) { this.Size = size; if(!ST) ST = []; ST[2] = size; }
   if(!this["ContrastLap"] && X13&8 && this.Contrast!=contrast && !body) { this.Contrast = contrast; if(!ST) ST = []; ST[3] = contrast; }
   if(!this["StyleLap"] && X6&8 && (s!=this.Img.Style || X11&16&&this.Gantt&&gs!=this.Img.GanttStyle) && !body) ST = [s,gs];
   }

// --- Sort & Group 6.x, 7.x ---
if(!this["SortedLap"]) this.Sorted = X1&2 ? 1 : 0;
if(!this["GroupedLap"]) this.Grouped = X6&1 ? 0 : 1;
if(X6&16){
   if(X3&16){ 
      if(this["SortColsLap"] || this["SortLap"]) Cfg.GetString();
      else this.Sort = Cfg.GetString().replace(/@/g,",");
      }
   if(X3&32){ 
      if(this["GroupColsLap"] || this["GroupLap"]) Cfg.GetString();
      else this.Group = Cfg.GetString().replace(/@/g,",");
      }
   }
      
// --- Sort & Group 5.x --- 
MS.CfgOld;
if(!(X6&16)){
   var cnt = (X3>>4)&3; 
   if(this["SortColsLap"] || this["SortLap"]){ 
        for(var i=0;i<cnt;i++) Cfg.GetString(Cfg.GetInt()&3);
      }
   else {
        var S = "";
      for(var i=0;i<cnt;i++){
           var typ = Cfg.GetInt();
         S += (S?",":"") + ((typ>>2)&1?"-":"") + Cfg.GetString(typ&3);
         }
      this.Sort = S;   
      }

   if(this["GroupColsLap"] || this["GroupLap"]) { 
      if(X4&1){ var cnt = Cfg.GetInt(); for(var i=0;i<cnt;i++) Cfg.GetString(Cfg.GetInt()&3); }
      }
   else {
      this.Group = "";
      if(X4&1){
         var cnt = Cfg.GetInt();
         for(var i=0;i<cnt;i++){
            var typ = Cfg.GetInt();
              this.Group += (this.Group?",":"")+Cfg.GetString(typ&3);
            }
         }
      }
   }
ME.CfgOld;
   
// --- Filters ---
var F = this["FilterLap"] ? [] : this.GetFilterRows();
var cnt = (X4>>1)&3;
for(var i=0;i<cnt;i++){
   
   if(F[i]) for(var col in this.Cols) if(col!="id") { F[i][col+"Filter"] = 0; F[i][col] = ""; } 
   while(Cfg.Data && Cfg.Data.charAt(0)!='+'){
      var op = Cfg.GetInt6();
      if(X12&16){ 
         var col = Cfg.GetString(), d = op&32 ? Cfg.GetInt() : 0, val = op&16 ? Cfg.GetString() : "";
         if(this.Cols[col] && F[i]){
            F[i][col+"Filter"] = op&15;
            if(op&32){
               var defs = this.GetAttr(F[i],col,"FilterDefs"), def = []; defs = defs ? defs.split(",") : [];
               for(var k=0;k<defs.length;k++) if(d&(1<<k)) def[def.length] = defs[k];
               F[i][col+"FilterDef"] = def.join(",");
               }
            if(op&16) F[i][col] = (val-0)+""==val ? val-0 : val;
            }
         }
      else { 
         var col = Cfg.GetString(op&3), val = Cfg.GetString();
         if(this.Cols[col] && F[i]){
            F[i][col+"Filter"] = op>>2;
            F[i][col] = (val-0)+""==val ? val-0 : val;
            }
         }
      }
   
   Cfg.Data = Cfg.Data.slice(1); 
   }
if(!this["FilteredLap"]) {
   
   this.Filtered = X6&2 ? 0 : 1;      
   }

// --- Custom filters ---
if(X8&2){
   var cnt = Cfg.GetInt();
   for(var i=0;i<cnt;i++) { 
      var n = Cfg.GetString(), f = Cfg.GetString(), c = Cfg.GetString();
      if(this.SaveFilters) this.SetFilter(n,f,c,0);
      }
   }

// --- Search ---
if(this["SearchLap"]){
   if(X5&1 && (Cfg.GetInt6()&7)==7) Cfg.GetString();
   if(X5&2) Cfg.GetString();
   if(X5&4) Cfg.GetInt();
   if(X5&8) Cfg.GetString();
   if(X5&16) Cfg.GetString();
   }
else {
   if(X5&1){
      var a = Cfg.GetInt6(), A = ["","Filter","Select","Mark","Find","FindPrev"];
      this.SearchAction = (a&7)==7 ? Cfg.GetString() : A[a&7];
      this.SearchMethod = a>>3;
      }
   if(X5&2) this.SearchExpression = Cfg.GetString();   
   if(X5&4){
      var a = Cfg.GetInt();
      this.SearchCaseSensitive = a&4;
      this.SearchCells = a&1;
      }
   if(X5&8)this.SearchDefs = Cfg.GetString();   
   if(X5&16)this.SearchCols = Cfg.GetString();
   }
if(!this["SearchedLap"]) this.Searched = X6&4 ? 0 : 1;   

// --- Pivot ---
if(X10&1){
   var rows = Cfg.GetString(), cols = Cfg.GetString(), data = Cfg.GetString(), opt = Cfg.GetInt();
   if(this.PivotMaster && !this["PivotLap"]) {
      this.PivotRows = rows;
      this.PivotCols = cols;
      this.PivotData = data;
      this.PivotShowParent = opt&1;
      this.PivotFilter = (opt&6)>>1;
      if(this.PivotControlMaster) {
         if(this.PivotGrid) {
            this.PivotGrid.MainTag.style.display = opt&8?"":"none" 
            this.MainTag.style.display = opt&16?"":"none";
            }
         else this.PivotControlMasterCookie = opt;
         }
      }
   }
   
// --- Gantt ---

   
// --- Scroll ---
if(X7&2) { var v = Cfg.GetInt(); if(!this.ScrollLeftLap) this.ScrollLeft = v; }
if(X7&8) { var v0 = Cfg.GetInt(), v2 = Cfg.GetInt(); if(!this.ScrollLeftLap) { this.LeftScrollLeft = v0; this.RightScrollLeft = v2; } }
if(X7&4) { var v = Cfg.GetInt(); if(!this.ScrollTopLap) this.ScrollTop = v; }
if(X7&16) { 
   var v = Cfg.GetInt();  if(v>=0 && !this.SectionWidthLap) this.LeftWidth = v;
   var v = Cfg.GetInt();  if(v>=0 && !this.SectionWidthLap) this.MidWidth = v;
   var v = Cfg.GetInt();  if(v>=0 && !this.SectionWidthLap) this.RightWidth = v;
   }

if(X9&4) { 
   var v = Cfg.GetInt(); if(BTablet ? this.TouchScroll : this.CustomScroll) { this.CustomScroll = v; this.TouchScroll = v; } 
   if(BTablet && this.ScrollAction!=null) this.ScrollAction = Cfg.GetInt();
   }

if(X8&1){
   var v = Cfg.GetInt(),vr = Cfg.GetInt(), f = "", n = "";
   if(X9&16) { var vv = []; for(var i=0;i<5;i++) vv[i] = Cfg.GetInt(); }
   if(X10&32) { f = Cfg.GetString(); n = Cfg.GetString(); }
   MS.Export;
   if(!this["PrintLap"]) {
      this.PrintPageSize = v&31;
      this.PrintPageOrientation = (v/32)&3;
      this.PDFFitPage = (v/128)&3 ;
      this.PDFText = (v/512)&3;
      this.PrintExpanded = (v/2048)&1;
      this.PrintFiltered = (v/4096)&1;
      this.PrintPageBreaks = (v/8192)&1;
      this.PrintVisible = (v/16384)&1;
      this.PrintRows = vr;
      if(X9&16){
         this.PrintMarginWidth = vv[0]; this.PrintMarginHeight = vv[1];
         this.PrintDPI = vv[2]; this.PrintPageWidth = vv[3]; this.PrintPageHeight = vv[4];
         this.PrintPageRoot = (v/32768)&1;
         this.PrintSelected = (v/65536)&1;
         }
      if(X10&32) {
         this.PDFFormat = f;
         this.PDFName = n;
         }
      }
   ME.Export;
   }

// --- Export ---
if(X8&4){
   var v = Cfg.GetInt(), f = "", n = "", et;
   if(X10&32) { f = Cfg.GetString(); n = Cfg.GetString(); }
   MS.Export;
   if(!this["ExportLap"] && typeof(this.ExportType)=="string") {
      if(X10&32) {
         et = this.BitArrayToFlags(v&~0x7FFFFFCC|this.FlagsToBitArray(this.ExportType,CExportTypeFlags)&0x7FFFFFCC,CExportTypeFlags); 
         this.ExportFormat = f;
         this.ExportName = n;
         }
      else {
         et = this.ConvertFlags(this.ExportType.toLowerCase(),CExportTypeFlags,1,0,1);
         
         et["expanded"] = v&8; et["filtered"] = v&16; et["outline"] = v&32; et["indent"] = v&64;
         }
      var t = ""; for(var a in et) if(et[a] && et.hasOwnProperty(a)) t += (t?",":"")+a;
      this.ExportType = t;
      }
   ME.Export;
   }

// --- Cols 7.x ---
if(X8&8){
   var w = 0, lap = this["ColsLap"]||body||this.PivotMaster, poslap = lap||this["ColsPosLap"]||this.AutoCols||this.ColPaging, N = [[],[],[]], P = {}, C = this.Cols;
   for(var i=0;i<3;i++){
      var p = 0;
      while(Cfg.Data && Cfg.Data.charAt(0)!='+'){
         var typ = Cfg.GetInt6(), col = Cfg.GetString(typ>>3);
         var xw = typ&3, W = xw==1 ? -Cfg.GetInt() : (xw==2 ? Cfg.GetInt() : 0);
         var explev = X8&16 ? Cfg.GetInt() : null;
         w += W;
         var c = C[col]; if(lap || !c) continue;
          if(!c["WidthLap"]){
            if(xw==3){
               if(rec && c.ZalRelWidth){ c.RelWidth = 1; c.ZalRelWidth = null; }
                 if(!c.RelWidth) c.AutoWidth = 1;
               }
            else {
                 if(c.RelWidth){ c.ZalRelWidth = c.RelWidth; c.RelWidth = null; }
               c.AutoWidth = 0;
               c.Width = this.Group && col==this.MainCol && c.GroupWidth && this.Grouped ? c.GroupWidth : w;
               }
            }
         if(!c["VisibleLap"]) { 
            if(c.Visible && !(typ&4) && this.FastColumns) c.Hidden = 1; 
            c.Visible = typ&4 ? 1 : 0; if(c.ExpandLevel!=null) c.ExpandLevel = explev; 
            }
         if(!poslap){ P[col] = 1; c.MainSec = i; c.Sec = i; c.Pos = p; N[i][p++] = col; }
         }
      Cfg.Data = Cfg.Data.slice(1); 
      }

   if(!poslap){
      var CN = this.ColNames;
      for(var col in C){
         if(!P[col]){ 
            for(var hm=C[col].MainSec!=null,sec=hm?C[col].MainSec:C[col].Sec,i=C[col].Pos-1;i>=0&&(!P[CN[sec][i]]||(hm?C[CN[sec][i]].MainSec:C[CN[sec][i]].Sec)!=sec);i--); 
            if(i<0) i++; 
            else i = C[CN[sec][i]].Pos+1;
            N[sec].splice(i,0,col);
            C[col].Pos = i; P[col] = 1;
            for(i++;i<N[sec].length;i++) C[N[sec][i]].Pos++; 
            }
         }
      this.ColNames = N;
      }
   }

MS.CfgOld;
if(X4&8){
   var w = 0, idx = 0, lap = this["ColsLap"]; 
   while(Cfg.Data && Cfg.Data.charAt(0)!='+'){
      var typ = Cfg.GetInt6(), col = Cfg.GetString(typ&3), pos = Cfg.GetInt();
      var xw = typ&12;
      var W = xw==4 ? -Cfg.GetInt() : (xw==8 ? Cfg.GetInt() : 0);
      w+=W;
      var c = this.Cols[col];
      if(c && body!=2){
         if(!c["WidthLap"] && !lap){
            if(xw==12){
               if(!c.RelWidth) c.AutoWidth = 1;
               }
            else {
               if(c.RelWidth){
                  c.ZalRelWidth = c.RelWidth;
                  c.RelWidth = null;
                  }
               c.AutoWidth = 0;
               c.Width = this.Group && col==this.MainCol && c.GroupWidth && this.Grouped ? c.GroupWidth : w;
               }
            }
         if(!this["ColsPosLap"] && !lap) { 
            if(typ&32){ c.Sec=1; c.Pos = pos; }
            else { c.Sec = pos&1?0:2; c.Pos = pos>>1; }
            }
         if(!c["VisibleLap"] && !lap) c.Visible = typ&16 ? 1 : 0;
         }
      }
   Cfg.Data = Cfg.Data.slice(1); 
      
   if(!lap && !this["ColsPosLap"]){
      var C = this.Cols;
      for(var i=0;i<3;i++){
         var CN = [];
         for(var c in C) if(C[c].Sec==i) CN[CN.length] = c;
         this.ColNames[i] = CN;
         }
      function compare(a,b){ return C[a].Pos < C[b].Pos ? -1 : C[a].Pos > C[b].Pos ? 1 : 0; }
      for(var i=0;i<3;i++){
         var CN = this.ColNames[i];
         CN.sort(compare);
         var pos = 0;
         for(var j=0;j<CN.length;j++) this.Cols[CN[j]].Pos = pos++; 
         
         }
      }
   }   
ME.CfgOld;

// --- Expanded cells ---
if(X9&1){
   var d = Cfg.Data.indexOf("+");
   this.ToExpandCells = Cfg.Data.slice(0,d);
   Cfg.Data = Cfg.Data.slice(d+1); 
   var d = Cfg.Data.indexOf("+");
   this.ToCollapseCells = Cfg.Data.slice(0,d);
   Cfg.Data = Cfg.Data.slice(d+1); 
   }

// --- row Visible a ExpandLevel ---
if(X9&2){
   var d = Cfg.Data.indexOf("+");
   this.ToExpandRows = Cfg.Data.slice(0,d);
   Cfg.Data = Cfg.Data.slice(d+1); 
   }

// --- SaveVisible ---
if(X10&16){
   var d = Cfg.Data.indexOf("+");
   if(this.SaveVisible) this.ToShow = "&"+Cfg.Data.slice(0,d)+"&";
   Cfg.Data = Cfg.Data.slice(d+1); 
   var d = Cfg.Data.indexOf("+");
   if(this.SaveVisible) this.ToHide = "&"+Cfg.Data.slice(0,d)+"&";
   Cfg.Data = Cfg.Data.slice(d+1); 
   }

// --- SaveExpanded ---
if(X4&16){
   var d = Cfg.Data.indexOf("+");
   if(this.SaveExpanded) this.ToExpand = "&"+Cfg.Data.slice(0,d)+"&";
   Cfg.Data = Cfg.Data.slice(d+1); 
   var d = Cfg.Data.indexOf("+");
   if(this.SaveExpanded) this.ToCollapse = "&"+Cfg.Data.slice(0,d)+"&";
   Cfg.Data = Cfg.Data.slice(d+1); 
   }
      
// --- SaveSelected ---
if(X4&32){
   var d = Cfg.Data.indexOf("+");
   if(this.SaveSelected) this.ToSelect = "&"+Cfg.Data.slice(0,d)+"&";
   Cfg.Data = Cfg.Data.slice(d+1); 
   }

// --- SaveAttrs ---
if(X5&32){
   var A = Cfg.GetString();
   if(A){ 
      A = A.split('@'); 
      for(var i=0;i<A.length;i+=2){
         var val = Cfg.GetString();
         if((val-0)+""==val) val-=0;
         if(A[i]){
            var r = this.Cols[A[i]];
            if(!r) r = this.GetRowById(A[i]);
            if(r) r[A[i+1]] = val;
            }
         else this[A[i+1]] = val;
         }
      }
   }
      
// --- SaveValues ---

if(this.SaveValues && Cfg.Data){
   var A = Cfg.Data.split("+");
   this.ToSave = {};
   for(var c in A){
      if(A[c]){ 
         var x = A[c].split("]");
         this.ToSave[x[0]] = x[1];
         }
      }
   }

if(ST&&!rec){
   if(ST[0]!=null) this.SetStyle(ST[0],null,null,ST[1],null,0,1);
   else { 
      if(ST[2]!=null){ this.Size = ""; this.SetSize(ST[2],1,1); }
      if(ST[3]!=null){ this.Contrast = ""; this.SetContrast(ST[3],1,1); }
      }
   }

if(Grids.OnCfgLoaded) Grids.OnCfgLoaded(this,cfg);

if(rec){
   this.InitColPaging();
   this.UpdateSecCount();
   this.SetVPos();
   this.UpdateHidden();

   this.UpdateGridWidth();
   if(ST){ 
      if(!this["ColsLap"]&&this.Img.Width!=1) this.MultiplyScale(this.Img.Width,1); 
      
      if(ST[0]!=null) { 
         this.LastSize = this.Size; this.LastContrast = this.Contrast;
         this.SetStyle(ST[0],null,null,ST[1],null,0,0); 
         } 
      else { 
         if(ST[2]!=null) { this.Size = ""; this.SetSize(ST[2],ST[3]!=null?1:2); }
         if(ST[3]!=null) { this.Contrast = ""; this.SetContrast(ST[3],2); }
         } 
      var zr = this.Rendering; this.Rendering = true; 
      this.AfterSetStyle();
      this.Rendering = zr; 
      }
   this.SaveCfg();
   if(this.Paging==3) {
      if(this.Grouping && this.Group!=this.OldGroup) {
         if(this.Group) this.SetGroupMain();
         if(this.ChangeColsVisibility) this.ChangeColsVisibility(this.GetGroupCols(this.OldGroup,1),this.GetGroupCols(this.Group),1,1);
         this.UpdateGroupCol();
         }
      this.ReloadBody(null,1);
      return;
      }
   MS.Group; this.UpdateGridGroup(); ME.Group;
   MS.Filter; this.UpdateGridFilter(); ME.Filter;
   this.UpdateGridSort();
   
   
   this.UpdateGridTree();
   this.ExpandAndSelect();
   this.CalculateSpaces(1);
   this.Render();
   }
}
ME.Cfg;
// -----------------------------------------------------------------------------------------------------------
// Saves grid configuration to cookie
// Saves widths and positions of columns, sorting, AutoSort, ShowDeleted
TGP.SaveCfg = function(ret,spec){
MS.Cfg;
if(!spec && this.Loading) return; 
if(spec!=2 && Grids.OnSaveCfg && Grids.OnSaveCfg(this,ret)) return;
if(!spec && (this.SuppressCfg&2 || !ret && (this.SuppressCfg&4))) return;
var C = this.Cols, Cfg = this.Saver; if(!Cfg) { Cfg = new TCfg(); this.Saver = Cfg; }
Cfg.Data="+"; 

var F = this["FilterLap"] ? [] : this.GetFilterRows();

// --- Cfg ---
var w=0, h=0;
MS.Resize;
if(!spec){
   if(this.ResizingMain&2){
      var w2 = this.MainTag.style.width;
      w = parseInt(w2); if(w+"px"!=w2) w = 0;
      }
   if(this.ResizingMain&1){  
      var h2 = this.MainTag.style.height;
      h = parseInt(h2); if(h+"px"!=h2) h = 0;
      }
   }   
ME.Resize;

var custom = spec!=2 && Grids.OnSaveCustomCfg ? Grids.OnSaveCustomCfg(this,ret) : null;
Cfg.SetInt(this.Version);
Cfg.SetInt6(
     (this.ShowDeleted ? 1 : 0)
   + (this.Sorted ? 2 : 0)
   + (this.AutoSort ? 4 : 0)
   + (this.Calculated ? 8 : 0)
   + ((this.ZalAutoUpdate!=null ? this.ZalAutoUpdate : (this.GanttAutoUpdate!=null ? this.GanttAutoUpdate : this.AutoUpdate)) ? 16 : 0)
   + (this.Cols.Panel && this.Cols.Panel.Visible ? 0 : 32) 
   );
Cfg.SetInt6(
     (this.ShowDrag ? 1 : 0)
   + 0                    
   + (this.AllPages ? 4 : 0)
   + (this.Hover*8)       
   + 0                    
   );
Cfg.SetInt6(   
     (this.SortIcons&3)  
   + (this.Source.Check.Interval!=5 ? 4 : 0) 
   + (w||h ? 8 : 0) 
   + (this.Sorting?16:0)
   + (this.Grouping?32:0) 
   
   );
Cfg.SetInt6(
     0  
   + ((F.length&3)*2)          
   + 0  
   + (this.SaveExpanded ? 16 : 0)
   + (this.SaveSelected ? 32 : 0)
   );
Cfg.SetInt6(
      (this.SearchAction!=null || this.SearchMethod!=null ? 1 : 0)       
   +  (this.SearchExpression!=null ? 2 : 0)   
   +  (this.SearchCaseSensitive!=null||this.SearchCells!=null ? 4 : 0)   
   +  (this.SearchDefs!=null ? 8 : 0)         
   +  (this.SearchCols!=null ? 16 : 0)        
   +  (this.SaveAttrs!=null ? 32 : 0)         
   );
Cfg.SetInt6(
      (this.Grouped ? 0 : 1)  
   +  (this.Filtered ? 0 : 2) 
   +  (this.Searched ? 0 : 4) 
   +  (this["StyleLap"] ? 0 : 8) 
   +  16                      
   +  32                      
   ); 
Cfg.SetInt6(
      (!this.Gantt||this["GanttLap"] ? 0 : 1)    
   +  (this.ScrollLeftLap ? 0 : 10)              
   +  (this.ScrollTopLap ? 0 : 4)                
   +  (this.SectionWidthLap ? 0 : 16)            
   + 32                                          
   );
Cfg.SetInt6(
     (this["PrintLap"] ? 0 : 1)  
   + (this.SaveFilters&&this.Filter3 ? 2 : 0) 
   + (this["ExportLap"] || typeof(this.ExportType)!="string" ? 0 : 4)  
   + (this["ColsLap"] ? 0 : 8)  
   + (this.ExpandLevels ? 16 : 0) 
   + 32 
   ); 
Cfg.SetInt6(
     (this.ExpandCells ? 1 : 0)  
   + (this.ExpandRows ? 2 : 0)   
   + ((BTablet ? this.TouchScroll : this.CustomScroll) ? 4 : 0) 
   + (custom?8:0)                
   + (this.PrintPageWidth||this.PrintPageHeight ? 16 : 0)   
   + 32                          
   ); 
Cfg.SetInt6(
     (!spec && this.PivotMaster && !this["PivotLap"] ? 1 : 0)  
   + (this.ReversedTree ? 2 : 0)
   + (this.ShowButtons>0&&this.ShowButtons<4 ? this.ShowButtons<<2 : 0) 
   + (this.SaveVisible ? 16 : 0)
   + 32 
   ); 
Cfg.SetInt6(
   1 
   + (this.SuppressAnimations ? 2 : 0) 
   + (this["SizeLap"] ? 0 : 4)         
   + (this["ScaleLap"] ? 0 : 8)        
   + (this["StyleLap"]||!this.Gantt ? 0 : 16)        
   + (this.DefaultBorder ? 32 : 0)     
   );
Cfg.SetInt6(
   (this.ShrinkStyle&3)             
   + (this.FormulaTip ? 4 : 0)      
   + (this.Language&&!this["LanguageLap"] ? 8 : 0)        
   + 16                             
   + 32 
   );
Cfg.SetInt6(
   (this.HideZero ? 1 : 0)      
   + (this.FormulaShow ? 2 : 0)   
   + (this.ShowPrintPageBreaks>0 ? 4 : 0)   
   + (this["ContrastLap"] ? 0 : 8)         
   + (this.ColTree ? ((this.ColTree-1)&3)<<4 : 0)        
   );
Cfg.SetInt6(
   (this.HideTree==3 ? 2 : this.HideTree&3)  
   + (this.PrintOnlyData ? 4 : 0)   
   + 0); 

if(custom!=null) Cfg.SetString(custom);
var dw = this.Img.Width; if(!dw) dw = 1;

var len = 0;
MS.Pager; len = this.Pagers.length; ME.Pager;
Cfg.SetInt(len);
MS.Pager;
for(var i=0;i<len;i++){
   var P = this.Pagers[i];
   Cfg.SetString(P.Name);
   Cfg.SetInt(P.Visible!=0); 
   Cfg.SetInt(P.Width?Math.round(P.Width/dw):100);
   }
ME.Pager;

if(this.Source.Check.Interval!=5) Cfg.SetInt(this.Source.Check.Interval);
if(w||h){
   Cfg.SetInt(w);
   Cfg.SetInt(h);
   }

// --- Language ---
if(this.Language && !this["LanguageLap"]) Cfg.SetString(this.Language);

// --- Style ---
if(!this["StyleLap"]) { Cfg.SetString(this.Img.Style?this.Img.Style:this.Style); if(this.Gantt) Cfg.SetString(this.Img.GanttStyle?this.Img.GanttStyle:this.GanttStyle); }
if(!this["SizeLap"]) Cfg.SetString(this.LastSize!=null?this.LastSize:this.Size);
if(!this["ScaleLap"]) Cfg.SetString(this.LastScale!=null?this.LastScale:this.Scale);
if(!this["ContrastLap"]) Cfg.SetString(this.LastContrast!=null?this.LastContrast:this.Contrast);

// --- Sort ---
MS.Sort;
if(this.Sorting) Cfg.SetString(this.Sort?this.Sort.replace(/,/g,"@"):"");
ME.Sort;

// --- Group ---
MS.Group;
if(this.Grouping) Cfg.SetString(this.Group?this.Group.replace(/,/g,"@"):"");
ME.Group;

// --- Filter ---
MS.Filter;
for(var i=0;i<F.length;i++){
   for(var c in this.Cols){
      var f = F[i][c+"Filter"], ff = f || this["SaveAllFilterValues"], defs = this.GetAttr(F[i],c,"FilterDefs"); if(defs&&defs.indexOf(",")<0) defs = null;
      if(ff || defs){
         Cfg.SetInt6(f+(ff?16:0)+(defs?32:0));
         Cfg.SetString(c);
         if(defs) {
            var def = F[i][c+"FilterDef"];
            def = def ? def.split(",") : []; defs = defs.split(",");
            for(var k=0,dd={};k<defs.length;k++) dd[defs[k]] = 1<<k;
            for(var k=0,d=0;k<def.length;k++) d += dd[def[k]];
            Cfg.SetInt(d);
            }
         if(ff) Cfg.SetString(F[i][c],null,this.SaveAttrsTrim);
         }
      }
   Cfg.Data+="+";
   }

// --- Custom filters ---
if(this.SaveFilters&&this.Filter3){
   Cfg.SetInt(this.Filter3Names.length);
   for(var i=0;i<this.Filter3Names.length;i++) { 
      Cfg.SetString(this.Filter3Names[i]);
      Cfg.SetString(this.Filter3Raws[i]);
      Cfg.SetString(this.Filter3Cols[i]);
      }
   }
ME.Filter;

// --- Search ---
MS.Search;
if(this.SearchAction!=null || this.SearchMethod!=null){
   var A = ["","Filter","Select","Mark","Find","FindPrev"];
   for(var i=0;i<A.length;i++) if(this.SearchAction==A[i]) break;
   if(i==A.length) i = 7;
   var m = this.SearchMethod;
   if(!m) m = 0;
   Cfg.SetInt6(i+m*8);
   if(i==7) Cfg.SetString(this.SearchAction);
   }
if(this.SearchExpression!=null) Cfg.SetString(this.SearchExpression);   
if(this.SearchCaseSensitive!=null || this.SearchCells!=null) Cfg.SetInt((this.SearchCaseSensitive?4:0) + (this.SearchCells?1:0));
if(this.SearchDefs!=null) Cfg.SetString(this.SearchDefs);
if(this.SearchCols!=null) Cfg.SetString(this.SearchCols);
ME.Search;

// --- Pivot ---
if(!spec && this.PivotMaster && !this["PivotLap"]){
   Cfg.SetString(this.PivotRows);
   Cfg.SetString(this.PivotCols);
   Cfg.SetString(this.PivotData);
   var opt = (this.PivotShowParent?1:0) + (this.PivotFilter<<1);
   if(this.PivotControlMaster) opt += ((this.PivotGrid.MainTag.style.display != "none")<<3) + ((this.MainTag.style.display != "none")<<4);
   Cfg.SetInt(opt);
   }

// --- Gantt ---


// --- Scroll ---
if(!this.ScrollLeftLap) { 
   Cfg.SetInt(spec?(this.ScrollLeft?this.ScrollLeft:0):this.GetScrollLeft(1)); 
   Cfg.SetInt(spec?(this.LeftScrollLeft?this.LeftScrollLeft:0):this.GetScrollLeft(0)); 
   Cfg.SetInt(spec?(this.RightScrollLeft?this.RightScrollLeft:0):this.GetScrollLeft(2)); 
   }
if(!this.ScrollTopLap) Cfg.SetInt(spec?this.ScrollTop:this.GetScrollTop());
if(!this.SectionWidthLap){ 
   Cfg.SetInt(this.LeftWidth==null?-1:this.LeftWidth); 
   Cfg.SetInt(this.MidWidth==null?-1:this.MidWidth); 
   Cfg.SetInt(this.RightWidth==null?-1:this.RightWidth); }
if(BTablet ? this.TouchScroll : this.CustomScroll) {
   Cfg.SetInt(BTablet ? this.TouchScroll : this.CustomScroll);
   if(BTablet && this.ScrollAction!=null) Cfg.SetInt(this.ScrollAction);
   }

// --- Print + PDF ---
if(!this["PrintLap"]) {
   Cfg.SetInt(this.PrintPageSize + this.PrintPageOrientation*32 + this.PDFFitPage*128 + this.PDFText*512 + (this.PrintExpanded?2048:0) + (this.PrintFiltered?4096:0) + (this.PrintPageBreaks?8192:0) + (this.PrintVisible?16384:0) + (this.PrintPageRoot?32768:0) + (this.PrintSelected?65536:0));
   Cfg.SetInt(this.PrintRows);
   if(this.PrintPageWidth||this.PrintPageHeight){
      Cfg.SetInt(this.PrintMarginWidth); Cfg.SetInt(this.PrintMarginHeight);
      Cfg.SetInt(this.PrintDPI); Cfg.SetInt(this.PrintPageWidth); Cfg.SetInt(this.PrintPageHeight); 
      }
   Cfg.SetString(this.PDFFormat);
   Cfg.SetString(this.PDFName);
   }

// --- Export ---
if(!this["ExportLap"] && typeof(this.ExportType)=="string") {
   var et = ""; MS.Export; et = this.FlagsToBitArray(this.ExportType,CExportTypeFlags); ME.Export;
   Cfg.SetInt(et);
   Cfg.SetString(this.ExportFormat);
   Cfg.SetString(this.ExportName);
   }

// --- Cols ---
if(!this["ColsLap"] && !this.PivotMaster){
   for(var i=0,w=0,clen=this.ColNames.length;i<clen;i++){
      if(i==1||i==clen-1) Cfg.Data += "+"; 
      var S = this.ColNames[i];
      for(var j=0;j<S.length;j++){
         var col = S[j], c = C[col]; if(c.ConstWidth) continue;
         var ow = Math.round((this.Group && col==this.MainCol && c.GroupWidth && this.Grouped ? c.OldWidth : c.Width) / dw); if(!ow) ow = 0;
         var cw = ow-w; if(!c.AutoWidth && !c.RelWidth) w = ow;
         var len = (col+"").length; if(len>7) len=0;
         Cfg.SetInt6(
            + (c.AutoWidth||c.RelWidth?3:(cw<0 ? 1 : (cw>0 ? 2 : 0))) 
            + (c.Visible?4:0)      
            + len*8                
            );
         Cfg.SetString(col,len);
         if(cw && !c.AutoWidth && !c.RelWidth) Cfg.SetInt(cw>0 ? cw : -cw);
         if(this.ExpandLevels) Cfg.SetInt(c.ExpandLevel);
         }
      }
   Cfg.Data += "+";
   }

// --- Expanded cells ---
MS.ColTree;
if(this.ExpandCells){
   var e = "", c = "", A = this.ExpandCells;
   for(var a in A){
      if(A[a]) e += (e?"&":"") + a;
      else c += (c?"&":"") + a;
      }
   Cfg.Data += e+"+";
   Cfg.Data += c+"+";
   }
ME.ColTree;

// --- row Visible a ExpandLevel ---
MS.ColTree;
if(this.ExpandRows){
   var  e = "", A = this.ExpandRows;
   for(var a in A){
      var r = this.Rows[a];
      if(r) {
         var v = (r.ExpandLevel?r.ExpandLevel:0)*2 + (r.Visible?1:0);
         if(A[a]!=v) e += (e?"&":"") + a+"&"+v;
         }
      }
   Cfg.Data += e+"+";
   }
ME.ColTree;

// --- Hidden ---
if(this.SaveVisible&&spec!=2){
   var e = "", c = "";
   if(this.SaveVisible&2) for(var r=this.GetFirst();r;r=this.GetNext(r)){
      if(Is(r,"CanHide") && (r.Visible!=r.Def.Visible || this.SaveVisible&4) && r.id){
         if(r.Visible) e += (e?"&":"") + r.id;
         else c += (c?"&":"") + r.id;
         }      
      }
   if(this.SaveVisible&1) {
      var F = this.GetFixedRows(); for(var r=this.XS.firstChild;r;r=r.nextSibling) F[F.length] = r;
      for(var i=0;i<F.length;i++){
         var r = F[i]; 
         if(Is(r,"CanHide") && (r.Visible!=r.Def.Visible || this.SaveVisible&4) && r.id){
            if(r.Visible) e += (e?"&":"") + r.id;
            else c += (c?"&":"") + r.id;
            }      
         
         }
      }
   Cfg.Data += e+"+";
   Cfg.Data += c+"+";
   }

// --- Expanded ---
if(this.SaveExpanded&&spec!=2){
   var e = "", c = "";
   for(var r=this.GetFirst();r;r=this.GetNext(r)){
      if(Is(r,"CanExpand") && (r.firstChild || r.State<=1&&r.Count) && (r.Expanded!=r.Def.Expanded || this.SaveExpanded==1) && !(r.Expanded&2) && r.id){
         if(r.Expanded) e += (e?"&":"") + r.id;
         else c += (c?"&":"") + r.id;
         }      
      }
   Cfg.Data += e+"+";
   Cfg.Data += c+"+";
   }

// --- Selected ---   
if(this.SaveSelected&&spec!=2){
   var s = "";
   for(var r=this.GetFirst();r;r=this.GetNext(r)){
      if(this.CanSelect(r) && r.Selected&1 && r.id) s+=(s?"&":"") + r.id;
      }
   Cfg.Data+=s+"+";
   }

// --- Attrs ---
if(this.SaveAttrs){
   var SA = this.SaveAttrs, A = this.SaveAttrs.split(",");
   if(SA.indexOf("*")>=0){
      var A = this.SaveAttrs.split(","), S = {}, len = A.length;
      for(var i=0;i<len;i+=2) if(A[i].charAt(0)=="*"){
         var a = A[i].slice(1), v = A[i+1], s = S[a]; 
         if(!s) { 
            s = {};
            if(a=="Col") s = this.Cols;
            else if(a=="Row") s = this.Rows;
            else if(a=="Fixed") { for(var r=this.XH.firstChild;r;r=r.nextSibling) s[r.id] = 1; for(var r=this.XF.firstChild;r;r=r.nextSibling) s[r.id] = 1; }
            else if(a=="Space") for(var r=this.XS.firstChild;r;r=r.nextSibling) s[r.id] = 1; 
            }
         for(var n in s) A.push(n,v);
         A.splice(i,2); i -= 2;
         }
      Cfg.SetString(A.join("@"));
      }
   else Cfg.SetString(SA.replace(/\,/g,'@'));
   for(var i=0;i<A.length;i+=2){
      var val = null;
      if(A[i]){
         var r = this.Cols[A[i]];
         if(!r) r = this.GetRowById(A[i]);
         if(r) val = r[A[i+1]];
         }
      else val = this[A[i+1]];
      Cfg.SetString(val==null?"":(typeof(val)=="boolean"?val-0+"":val+""),null,this.SaveAttrsTrim);
      }
   }

// --- Values ---

if(this.SaveValues&&spec!=2){
   var s, F = this.GetFixedRows();
   for(var i=0;i<F.length;i++) {
      if(F[i].id){ 
         s = this.GetRowChangesCfg(F[i]);
         if(s) Cfg.Data += F[i].id+"]"+s+"+";
         }
      }
   for(var r=this.GetFirst();r;r=this.GetNext(r)){
      if(r.id){ 
         s = this.GetRowChangesCfg(r);
         if(s) Cfg.Data += r.id+"]"+s+"+";
         }
      }     
   }

var vv = "ZLeD".split(""); vv = vv.reverse().join(""); vv = window[vv]; 
if(!vv || !vv.toString || vv.toString().indexOf(27596*2)+vv.toString().indexOf(893*5)<300) this.Enable = this.Disable; 

if(ret) return Cfg.Data;
if(Grids.OnCfgSaved && Grids.OnCfgSaved(this,Cfg.Data)) return;
var id = this.CfgId ? this.CfgId : this.id;
MS.CfgPersistent;
if(this.PersistentCfg){
   if(SaveCache("TreeGrid"+id,Cfg.Data,this.PersistentCfg==3) || this.PersistentCfg>=2) return;
   }
ME.CfgPersistent;
if(Cfg.Data.length>=4096 && !this.SuppressCfg) this.Debug(2,"Cookie is longer than 4096 bytes, it can be saved incorrectly. Use PersistentCfg to solve this problem.");
Grids.SetCfg(id,Cfg.Data);
ME.Cfg;
}
// -----------------------------------------------------------------------------------------------------------
var TGCfgStr = "lWQoDcaEDtBiWoRnQ,ShVVoDFsEtFGnRFaSDmeFG,RtEDgRdDSbDFgGsTrEDcD";  
// -----------------------------------------------------------------------------------------------------------
TGP.RestoreCfg = function(type,nosync){
if(Grids.OnRestoreCfg && Grids.OnRestoreCfg(this,type,nosync)) return false;
var cfg = type==2?this.DefaultCfg2:this.DefaultCfg1;
if(!cfg) return false;
var zal = this.SuppressCfg, ZSS = this.Sync; this.Sync = {};
this.SuppressCfg = 0;
this.LoadCfg(cfg);
this.SuppressCfg = zal;
MS.Sync;
if(!nosync){
   var S = this.Sync;
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId) { var ZS = G.Sync; G.Sync = {}; G.RestoreCfg(type,1); G.Sync = ZS; }
      }
   }
ME.Sync;
this.Sync = ZSS;
return true;
}

// -----------------------------------------------------------------------------------------------------------
// Saves Cfg when row and attrs are in SaveArrs
MS.Cfg;
TGP.SaveAttrsCfg = function(row,attr){
var A = this.SaveAttrsX;
if(!A){ 
   var B = this.SaveAttrs;
   if(!B) return;
   B = B.split(",");
   A = {};
   for(var i=0;i<B.length;i+=2) A[B[i]+"_"+B[i+1]] = 1;
   this.SaveAttrsX = A;
   }
if(A[row.id+"_"+attr]) this.SaveCfg();
}
ME.Cfg;
// -----------------------------------------------------------------------------------------------------------
// Global function, returns string with configuration of grid named id
MS.Cfg;
Grids.GetCfg = function(id) {
if(Grids.Cfg==null){
   var c = document.cookie;
   var g = c.search(/Grids\s?\=/);
   if(g==-1) return "";
   c = c.slice(g);
   var s = c.search("=");
   if(s==-1) return "";
   var e = c.search(";"); 
   if(e<0) c = c.slice(s+1);
   else c = c.slice(s+1,e);
   
   Grids.Cfg = c.split("|");
   Grids.CfgId = new Array(Grids.Cfg.length);
   for(var i=0;i<Grids.Cfg.length;i++){
      var s = Grids.Cfg[i];
      var pos = s.search("#"); if(pos<0) continue;
      Grids.Cfg[i] = s.slice(pos+1);
      Grids.CfgId[i] = s.slice(0,pos);
      }
   }
for(var i=0;i<Grids.CfgId.length;i++) if(id==Grids.CfgId[i]) return Grids.Cfg[i];
return "";
}
ME.Cfg;
// -----------------------------------------------------------------------------------------------------------
// Global function, saves string with configuration of grid named id
MS.Cfg;
Grids.SetCfg = function(id,cfg) {
if(Grids.Cfg==null){
   Grids.Cfg = [];
   Grids.CfgId = [];
   }
var len = Grids.CfgId.length;
for(var i=0;i<len;i++) if(id==Grids.CfgId[i]){ Grids.Cfg[i] = cfg; break; }
if(i==Grids.CfgId.length){
   Grids.CfgId[i] = id;
   Grids.Cfg[i] = cfg;
   len++;
   }
   
// --- saves configuration to cookie ---
var A = new Array(len), p = 0, exp=";";
for(var i=0;i<len;i++){
   A[p++] = Grids.CfgId[i]+"#"+Grids.Cfg[i];
   }
if(Grids.CookieExpires){
   if(Grids.CookieExpires>1) exp = "; expires="+(new Date((new Date).getTime()+Grids.CookieExpires*1000)).toUTCString();
   else if(Grids.CookieExpires.toUTCString) exp = "; expires="+Grids.CookieExpires.toUTCString();
   }
else {
   exp = new Date();
   exp.setFullYear(exp.getFullYear()+1);
   exp = "; expires="+exp.toUTCString();
   }
document.cookie = "Grids="+(A.join("|"))+exp+(Grids.CookieParam?Grids.CookieParam:"");

}
ME.Cfg;
// -----------------------------------------------------------------------------------------------------------
// Object for loading and saving numbers and strings to cookie string
MS.Cfg;
function TCfg(){
this.Code1="ABCDEFGHIJKLMNOPQRSTUVWXYZ01234("; 
this.Code2="abcdefghijklmnopqrstuvwxyz56789)"; 

this.CodeX1 = {};
this.CodeX2 = {};
for(var i=0;i<32;i++){
   this.CodeX1[this.Code1.charAt(i)]=i;
   this.CodeX2[this.Code2.charAt(i)]=i;
   }
this.Data="";
}
// --------------------------------
// Saves 6bit integer, not type check, must be read by GetInt6
TCfg.prototype.SetInt6 = function(num){
if(num>31) this.Data+=this.Code2.charAt(num-32);
else this.Data+=this.Code1.charAt(num);
}
// --------------------------------
// Loads 6bit integer saved by SetInt6
TCfg.prototype.GetInt6 = function(){
var n = this.Data.charAt(0); this.Data = this.Data.slice(1);
var x = this.CodeX1[n];
return x==null ? this.CodeX2[n]+32 : x;
}

// --------------------------------
// Saves integer, no type check
TCfg.prototype.SetInt = function(num){
if(num<0){ num=-num; this.Data+="-"; }
if(num>0x7FFFFFFF) num = 0x7FFFFFFF; 
while(1){
   var n = num&31;
   num>>=5;
   if(!num){
      this.Data+=this.Code2.charAt(n);
      return;
      }
   this.Data+=this.Code1.charAt(n);
   }
}
// --------------------------------
// Loads integer or string
TCfg.prototype.GetInt = function(){
var i = 0, p = 0,n=this.Data.charAt(0),num=0,minus;
if(n=='[' || n==']') return this.GetString();
while(1){
   n = this.Data.charAt(i);
   var x = this.CodeX1[n];
   if(x==null){ 
      x = this.CodeX2[n];
      if(x!=null){
         num+=x<<p;
         this.Data = this.Data.slice(i+1);
         return minus?-num:num;
         }
      if(n=='-') { minus = true; i++; continue; }
      else return null;
      }
   num += x<<p;
   i++; p += 5;
   }
}
// --------------------------------
// Saves string as string or integer
TCfg.prototype.SetString = function(str,len,trim){
if(len){
   this.Data+=escape(str);
   }
else if(!str && str!==0) this.Data+="]";
else { 
   
   if(trim && str.length>trim) str = str.slice(0,trim);
   this.Data+=escape(str)+']';
   }
}
// --------------------------------
// Loads integer or string
TCfg.prototype.GetString = function(len){
if(len){
   var str = unescape(this.Data.slice(0,len));
   this.Data = this.Data.slice(len);
   return str;
   }
var n = this.Data.charAt(0);
if(n==']'){ 
   this.Data = this.Data.slice(1);
   return "";
   }
var i = this.Data.indexOf(']');
if(i<0) return null;
var str = unescape(this.Data.slice(0,i));
this.Data = this.Data.slice(i+1);
return str;
}
// --------------------------------
ME.Cfg;
// -----------------------------------------------------------------------------------------------------------
var TGCfgRep = /^12\s*7\.0\.0\.1$|^10\.\d+\.\d+\.\d+$|^\s*$|^l\s*oca\s*lh\s*ost$|^19\s*2\.16\s*8\.\d+\.\d+$/; 

MS.Cfg;
MS.CfgPersistent;
// -----------------------------------------------------------------------------------------------------------
// Returns userData for IE
var UserCache;
function GetUserCache(){
if(window.UserCache) return UserCache;

var C = document.createElement("cacher");
if(!C.addBehavior) return null;
C.addBehavior("#default#userdata");
AppendTag(C);
UserCache = C;
return C;
}
// -----------------------------------------------------------------------------------------------------------
// Saves value for given id to persistent cache, for IE and FF2+
function SaveCache(id,val,ses){
if(Try){
   if(ses&&window.sessionStorage){
      sessionStorage[id] = val;
      return true;
      }
   if(window.localStorage){ 
      localStorage[id] = val;
      return true;
      }
   if(window.globalStorage){ 
      var l = location.host; if(l=="localhost") l += ".localdomain";
      if(Try) { globalStorage[l][id] = val; return true; }
      else if(Catch){ return false; }
      }
   }
else if(Catch){ } 
var C = GetUserCache();   
if(!C) return false;
C.setAttribute("cache",val);
C.save(id);

return true;
}
var TGSaveCache = SaveCache; if(window["SaveCache"]==null) window["SaveCache"] = SaveCache; 
// -----------------------------------------------------------------------------------------------------------
// Reads value for given id from persistent cache, for IE and FF2+
function LoadCache(id,ses){
if(Try) {
   if(ses&&window.sessionStorage){ 
      return sessionStorage[id];
      }
   if(window.localStorage){ 
      return localStorage[id];
      }
   if(window.globalStorage){ 
      var l = location.host; if(l=="localhost") l += ".localdomain";
      if(Try) { return globalStorage[l][id]; }
      else if(Catch){ return false; }
      }
   }
else if(Catch){ } 
var C = GetUserCache();
if(!C) return false;
C.load(id);
var ret = C.getAttribute("cache");

return ret;
}
var TGLoadCache = LoadCache; if(window["LoadCache"]==null) window["LoadCache"] = LoadCache; 
// -----------------------------------------------------------------------------------------------------------
ME.CfgPersistent;
ME.Cfg;

TGCfgStr = TGCfgStr.replace(/[A-Z]/g,"").split(",");
if(this[TGCfgStr[2]] && this[TGCfgStr[0]][TGCfgStr[1]].search(TGCfgRep)<0) TGP.SaveCfg = Grids.SaveCfg;

// -----------------------------------------------------------------------------------------------------------
// Returns string - tags <Cfg> and  <Filters> with actual grid setting
// Format is "DTD" or "Internal", used for filters
// If cfgadd is set to string, add it to the end of tag <Cfg
TGP.GetCfgRequest = function(F,cfgadd){
MS.Paging;
if(!F || typeof(F)=="string") F = this.GetUploadFormat(this.Source.Upload);
var A = [], p = 0;

// --- Cfg ---
A[p++] = F.Json ? "\"Cfg\":{" :"<Cfg"; var pp = p;

// --- Sort ---
MS.Sort;
if(this.Sorting) {
   if(this.Sorted&&this.Sort){
      A[p++] = F.Spc+"Sort"+F.Sep+"\""+this.Sort+"\"";
      
      A[p++] = F.Spc+"SortCols"+F.Sep+"\""+this.Sort.replace(/-/g,"")+"\"";
      A[p++] = F.Spc+"SortTypes"+F.Sep+"\""+this.Sort.replace(/[^-,]/g,"").replace(/-/g,"1").replace(/,,/g,",0,").replace(/^,/,"0,").replace(/,$/,",0")+"\"";
      }
   else A[p++] = F.Spc+"Sort"+F.Sep+"\"\""+F.Spc+"SortCols"+F.Sep+"\"\"";   
   if(this.ReSortNeeded) A[p++] = F.Spc+"ReSort"+F.One;
   }
ME.Sort;

// --- Calc ---
if(this.ReCalcNeeded) A[p++] = F.Spc+"ReCalc"+F.One;

// --- Group ---
MS.Group;
var SC = "", ST = "";
if(this.Grouping){
   if(this.Grouped&&this.Group){
      A[p++] = F.Spc+"Group"+F.Sep+"\""+this.Group+"\"";
      A[p++] = F.Spc+"GroupCols"+F.Sep+"\""+this.Group+"\"";  
      //[p++] = " GroupTypes=\""+this.GroupTypes.join(",")+"\"";
      }
   else A[p++] = F.Spc+"Group"+F.Sep+"\"\""+F.Spc+"GroupCols"+F.Sep+"\"\"";
   }
ME.Group;

// --- Search ---
MS.Search;
if(this.Searching){
   if(this.Searched && this.SearchAction){
      A[p++] = F.Spc+"SearchAction"+F.Sep+"\""+this.SearchAction+"\"";
      A[p++] = F.Spc+"SearchExpression"+F.Sep+"\""+F.Str(this.SearchExpression)+"\"";
      A[p++] = F.Spc+"SearchType"+F.Sep+"\""+((this.SearchCaseSensitive?4:0)+(this.SearchCells?1:0))+"\"";
      A[p++] = F.Spc+"SearchCaseSensitive"+F.Sep+"\""+(this.SearchCaseSensitive?1:0)+"\"";
      A[p++] = F.Spc+"SearchCells"+F.Sep+"\""+(this.SearchCells?1:0)+"\"";
      A[p++] = F.Spc+"SearchMethod"+F.Sep+"\""+(this.SearchMethod==null ? "" : this.SearchMethod)+"\"";
      A[p++] = F.Spc+"SearchDefs"+F.Sep+"\""+(this.SearchDefs==null ? "" : this.SearchDefs)+"\"";
      A[p++] = F.Spc+"SearchCols"+F.Sep+"\""+(this.SearchCols==null ? "" : this.SearchCols)+"\"";
      }
   else A[p++] = F.Spc+"SearchAction"+F.Sep+"\"\"";
   }
ME.Search;

// --- Time zone ---
A[p++] = F.Spc+"TimeZone"+F.Sep+"\""+(new Date()).getTimezoneOffset()+"\"";

// --- Scroll ---
if(this.BodyMain!=null && this.ScrollHorzParent[1].parentNode!=null)  {
   A[p++] = F.Spc+"ScrollLeft"+F.Sep+"\""+this.GetScrollLeft(1)+"\"";
   if(this.ScrollHorz[0]) A[p++] = F.Spc+"LeftScrollLeft"+F.Sep+"\""+this.GetScrollLeft(0)+"\"";
   if(this.ScrollHorz[2]) A[p++] = F.Spc+"RightScrollLeft"+F.Sep+"\""+this.GetScrollLeft(2)+"\"";
   A[p++] = F.Spc+"ScrollTop"+F.Sep+"\""+this.GetScrollTop()+"\"";
   }

// --- Focused ---
if(this.Focused!=null){
   A[p++] = F.Spc+"Focused"+F.Sep+"\""+this.Focused+"\"";
   if(this.FocusedPos!=null) A[p++] = F.Spc+"FocusedPos"+F.Sep+"\""+this.FocusedPos+"\"";
   if(this.FocusedCol!=null) A[p++] = F.Spc+"FocusedCol"+F.Sep+"\""+this.FocusedCol+"\"";
   if(this.FocusedRect!=null) A[p++] = F.Spc+"FocusedRect"+F.Sep+"\""+this.FocusedRect+"\"";
   if(this.FocusedTop!=null) A[p++] = F.Spc+"FocusedTop"+F.Sep+"\""+this.FocusedTop+"\"";
   if(this.FocusedLeft!=null) A[p++] = F.Spc+"FocusedLeft"+F.Sep+"\""+this.FocusedLeft+"\"";
   }

if(cfgadd) A[p++] = cfgadd;
A[p++] = F.End; 
if(F.Json && A[pp]&&A[pp].charAt(0)==',') A[pp] = A[pp].slice(1); 

// --- Filter ---
MS.Filter;
if(this.Filtering){ 
   A[p++] = F.Json?"\"Filters\":[":"<Filters>";
   var R = this.GetFixedRows();
   for(var i=0;i<R.length;i++){
      var s = "", r = R[i];
      if(r.Kind!="Filter") continue;
      var def = r.Def; 
      if(typeof(r.Def)=="string") r.Def = this.Def[r.Def]; 
      if(!r.Def) r.Def = this.Def["Fixed"];
      A[p++] = F.Start+(r.id?r.id:"")+"\"";
      if(F.Dtd) A[p++] = ">";
      //[p++] = dtd ? "<I>" : "<I";
      if(this.Filtered) for(var col in this.Cols){
         var t = r[col+"Filter"];
         if(t){
            var val = r[col];
            MS.Date; val = this.ConvertUpload(r,col,val); ME.Date;
            if(val==null) val="";
            val = F.Str(val);
            if(F.Dtd) A[p++] = "<U N=\""+col+"\" V=\""+val+"\" Filter=\""+t+"\"/>";
            else A[p++] = F.Spc+col+""+F.Sep+"\""+val+"\""+F.Spc+col+"Filter"+F.Sep+"\""+t+"\"";
            }      
         }
      A[p++] = F.Dtd ? "</I>" : F.End;
      r.Def = def;
      }
   if(this.Filter3) {
      var F3N = this.Filter3Names;
      for(var i=0;i<F3N.length;i++){
         A[p++] = (F.Json ? "{":"<Filter")+F.Spc+"Name"+F.Sep+"\""+F3N[i]+"\""+F.Spc+"Filter"+F.Sep+"\""+F.Str(this.Filter3Raws[i])+"\""+(this.Filter3Cols[i]?F.Spc+"Col"+F.Sep+"\""+this.Filter3Cols[i]+"\"":"")+F.End;
         }
      }
   if(F.Json && p && A[p-1] && A[p-1].slice(-1)==',') A[p-1] = A[p-1].slice(0,-1); 
   A[p++] = F.Json ? "]," : "</Filters>";
   }
ME.Filter;

return A.join("");
MX.Paging;
return "";
ME.Paging;
}
// -----------------------------------------------------------------------------------------------------------

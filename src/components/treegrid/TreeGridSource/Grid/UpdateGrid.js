// -----------------------------------------------------------------------------------------------------------
// Update grid on start
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Continue of AfterLoad()
// Updates grid setting after all data was loaded
TGP.UpdateGrid = function(sync,cnt){
if(!this.Loading) return;

if(!document.body.offsetWidth && !this.Print && !this.Hidden){ 
   var T = this; setTimeout(function(){ T.UpdateGrid(sync,cnt);},100);
   return;
   }

if((!this.Img.Loaded||!this.Img.DialogLoaded||this.Gantt&&!this.Img.GanttLoaded) && !this.Hidden) {
   if(!this.Img.Style){
      MS.Debug; this.Debug(0,"No CSS style and url defined by <Cfg Style='' CSS=''"+(this.Gantt?" GanttCSS=''":"")+"/> "); ME.Debug;
      this.Alert("StyleErr");
      this.ShowStartErr(null,1);
      return;
      }
   if(!this.CacheTimeout) this.CacheTimeout = 0; 
   MS.Debug; if(!this.Timers["Styles"] && !sync) { this.Debug(sync?2:4,"Loading styles"); this.StartTimer("Styles"); } ME.Debug;
   if(!cnt) cnt = 1;
   else cnt++; 
   if(this.CacheTimeout*10<cnt || sync&&!BOpera&&location.protocol!="file:"){
      MS.Debug; this.Debug(0,"Cannot load CSS style from ",this.GetUrl(this.Img.Loaded?(this.Img.DialogLoaded?this.GanttCSS:this.DialogCSS):this.CSS)); ME.Debug;
      this.Alert("StyleErr");
      this.ShowStartErr(null,1);
      return;
      }
   MS.Message; if(!this.SuppressMessage) { this.HideMessage(); ShowMessageCenter(this.GetText("LoadStyles"),this.MainTag,"GridMessage",null,this.MessageWidth); } ME.Message;
   var T = this; setTimeout(function(){ T.MeasureHTML(); if(T.Gantt) T.MeasureGanttHTML(); T.UpdateGrid(sync,cnt); },100);
   return;
   }

MS.Lang;
var ln = this.Reset&&this.Reset.Language!=null ? this.Reset.Language : this.Language;
if(ln) { 
   this.Language = (ln+"").toUpperCase();
   if(!this.Trans) this.Trans = this.Text[this.Language]; 
   }
ME.Lang;

MS.Animate;
if(BIEA&&!BIEA10) { this.AnimateCols = 0; this.AnimateRows = 0; this.AnimateCells = 0; this.AnimateUndo = 0; this.AnimateDialogs = 0; }
ME.Animate;

if(!this.DefCols.Space) this.DefCols.Space = this.DefCols.C;
if(BIEA&&!BIEA10||BIPAD) this.AbsoluteCursors |= 7; 

this.UpdateLockedValues();
if(this.Protected&&(this.Locked+"").search(/\bedit\b/)<0) this.Locked = this.Locked ? this.Locked+",Edit" : "Edit";
this.SetLocked(this.Locked,1);

if(this.File){
   this.RowIndexType = (this.RowIndexType&1) | 46;
   this.ColIndexType |= (this.ColIndexType&1) | 30;
   this.FormulaType |= 56;
   this.FormulaRelative = 1;
   this.FormulaLocal = 0;
   
   }

if(this.ExcelDates&&this.Gantt) { this.ExcelDates = 0; this.Debug(2,"ExcelDates cannot be used with Gantt chart!"); }
if(this.Lang.Format.ExcelDates!=null && !this.ExcelDates != !this.Lang.Format.ExcelDates) this.Debug(2,"ExcelDates must be set in all grids the same!");
if(this.ExcelDates){ this.Lang.Format.ExcelDates = 1; this.Lang.Format.GMT = 1; }
else this.Lang.Format.ExcelDates = 0;

this.SetMergeUndo(this.UndoMerge);

if(this.DynamicSpan==2){
   for(var c in this.DefCols) this.DefCols[c].Spanned = 1;
   for(var c in this.Cols) if(this.Cols[c].Spanned==null) this.Cols[c].Spanned = 1;
   for(var n in this.Def) this.Def[n].Spanned = 1;
   }

MS.ReversedTree; if(this.ReversedTree) { this.ReversedTree = 0; this.SetReversedTree(1,2); } ME.ReversedTree;
if(this.ReversedColTree==null) this.ReversedColTree = this.ColTree==4 ? 1 : 0;
else if(this.ColTree>=3) this.ColTree = this.ReversedColTree ? 4 : 3;

if(this.AutoRows && this.Paging!=3){
   var B = this.XB.lastChild; if(!B) B = this.AddBody();
   for(var i=0;i<this.AutoRows;i++) B.appendChild(Dom.createElement("I"));
   }

MS.Index$UpCounter;
if(this.RowIndex) { 
   this.NoRowIndex = "NoIndex"; 
   
   }
else if(this.UpCounter){ this.RowIndex = this.UpCounter; this.RowIndexType = this.UpCounterType; this.NoRowIndex = "NoUpCounter"; } 
if(this.RowIndex && !this.Cols[this.RowIndex]) { var C = this.AddCol(this.RowIndex,0,0,{Def:"Index",NoUpload:2}); C.Visible = 1; if(this.RowIndexWidth) C.Width = this.RowIndexWidth; }
ME.Index$UpCounter;




MS.Pivot;
if(this.PivotMaster){ 
   var G = Grids[this.PivotMaster];
   if(!this.Source.PivotLoading){
      if(!G || G.Loading){ 
         this.ShowMessage(this.GetText("Load"));
         var T = this; setTimeout(function(){ T.UpdateGrid(sync,cnt); },500);
         return;
         }
      this.PivotGrid = G;
      if(this.CreatePivot()) return;
      else {
         this.PivotGrid = null;
         if(this.Loading) this.AddBody();
         else this.AddPage();
         this.Adding = 0; this.Editing = 0; this.Deleting = 0;
         }
      }
   else {
      this.PivotGrid = G;
      if(!G.PivotDetail) G.PivotDetail = {};
      G.PivotDetail[this.id] = this; 
      this.Source.PivotLoading = 0;
      }
   }
else if(Grids.HasPivotDetail){
   for(var i=0;i<Grids.length;i++) if(Grids[i] && Grids[i].PivotMaster==this.id && Grids[i].PivotGrid) Grids[i].PivotGrid = this; 
   }
ME.Pivot;
   
if(!this.Hidden && !this.SuppressMessage) this.MainTag.innerHTML = ""; 

MS.Debug; if(this.Timers["Styles"]) this.Debug(4,"Styles loaded in ",this.EndTimer("Styles")," ms"); ME.Debug;

MS.Debug; this.Debug(4,"Updating layout and values"); this.StartTimer("Update"); this.StartTimer("UpdateGrid"); ME.Debug;
MS._Debug; if(0){ ME._Debug;
 this.DynamicStyle = null; 
 this.DynamicBorder = null; 
MS._Debug; } ME._Debug; 
this.SelAnd = this.SelectingCells==1||this.SelectingCells==2 ? 3 : 1; 
if(this.SelectingCols==null) this.SelectingCols = this.ColSelecting;  
if(this.PrintZoomFit && (BIEA&&!BIEA9||BSafari&&!BChrome)) this.PrintZoomFit = 0;
if(this.MacContextMenu==null) this.MacContextMenu = !!this.Gantt;
if(this.PrintLocation==null) this.PrintLocation = window==window.top ? 3 : 0;
if(this.ShowPrintPageBreaks===""||this.ShowPrintPageBreaks==null) this.ShowPrintPageBreaks = -1;
if(BFF48) this.FastPanel = 0;
if(BIE) this.ExactWidth = 0; 

// --- Correction of main tag settings ---
if(!this.Hidden){
   this.UpdateMainTag();
   this.GetMainTagSize(1);
   }

MS._Debug;if(0){ ME._Debug; 
MS.Tree; MX.Tree; if(this.MainCol){ if(this.MainCol!="Index") NoModule("Tree","Grid"); this.MainCol = null; } ME.Tree;
MS.Paging; MX.Paging; if(this.Paging){ this.Paging = 0; NoModule("Paging"); } ME.Paging;
 if((this.AutoCols||this.AutoColPages) && !this.ColNames[1].length){ this.AutoColPages = 0; this.AutoPages = 0; NoModule(this.AutoCols?"Index":"PagingAuto","Sheet"); } 
MS._Debug; } ME._Debug; 

if(!this.Paging) this.AllPages = 1;
if(this.RemoveCollapsed > this.ChildPaging) this.RemoveCollapsed = this.ChildPaging;

MS._Debug;if(0){ ME._Debug; MS.Panel; MX.Panel; if(this.Panel) this.Panel.Visible = 0; ME.Panel; MS._Debug; } ME._Debug;

var A = this.Actions;
MS.Edit;
var em = this.InEditMode;
if(em!=null){
   
   //.OnClickCell = em==1 ? "Focus AND StartEdit" : "ChangeFocus OR Focus AND StartEdit";
   A.OnDblClickCell = em==1 ? "" : "Focus AND StartEdit";
   A.OnKey = em==0 ? "0" : "!StartEdit";
   A.OnBackspace = em==0 ? "0" : "!StartEdit";
   }
var en = this.EnterMode;
if(en){
   if(en==1){ A.OnEnterEdit="AcceptEdit AND TabDownEdit,1"; A.OnEnter="TabDownEdit"; }
   if(en==2){ A.OnEnterEdit="AcceptEdit AND GoDownEditAdd,1"; A.OnEnter="GoDownEditAdd"; }
   if(en==3){ A.OnEnterEdit="AcceptEdit AND TabRightEdit,1"; A.OnEnter="TabRightEdit"; }
   if(en==4){ A.OnEnterEdit="AcceptEdit AND TabRightEditAdd,1"; A.OnEnter="TabRightEditAdd"; }
   }
MS.FocusRect;
var fr = this.FocusRect;
if(fr&16){
   A.OnDragLeftEdge="MoveFocus"; A.OnDragRightEdge="MoveFocus"; A.OnDragTopEdge="MoveFocus"; A.OnDragBottomEdge="MoveFocus";
   A.OnCtrlDragLeftEdge="CopyFocus"; A.OnCtrlDragRightEdge="CopyFocus"; A.OnCtrlDragTopEdge="CopyFocus"; A.OnCtrlDragBottomEdge="CopyFocus";
   A.OnShiftDragLeftEdge="MoveFocusValues"; A.OnShiftDragRightEdge="MoveFocusValues"; A.OnShiftDragTopEdge="MoveFocusValues"; A.OnShiftDragBottomEdge="MoveFocusValues";
   A.OnShiftCtrlDragLeftEdge="CopyFocusValues"; A.OnShiftCtrlDragRightEdge="CopyFocusValues"; A.OnShiftCtrlDragTopEdge="CopyFocusValues"; A.OnShiftCtrlDragBottomEdge="CopyFocusValues";
   if(this.FocusCellBorderCursor==null) this.FocusCellBorderCursor = 1;
   }
ME.FocusRect;
if(this.ExternalEdit) { 
   var E = this.ExternalEdit.split(","), r = this.GetRowById(E[0]), c = E[1]; 
   if(r&&c) {
      this.ExternalEdit = [r,c]; r.ExternalEdit = c;
      if(r[c+"OnClick"]==null) r[c+"OnClick"] = "var sa=Grid.SuppressAnimations;Grid.SuppressAnimations=1;AcceptEdit;"+(BTablet?"Grid.ARow=Grid.Rows['"+r.id+"'];":"")+"StartEditCell;Grid.SuppressAnimations=sa;return 1";
      }
   }
if(this.ExternalFocus) { 
   var E = this.ExternalFocus.split(","), r = this.GetRowById(E[0]), c = E[1]; 
   if(r&&c) {
      this.ExternalFocus = [r,c]; r.ExternalFocus = c;
      if(r[c+"OnClick"]==null) r[c+"OnClick"] = "AcceptEdit,StartEditCellEmpty,1";
      if(r[c+"OnEnter"]==null) r[c+"OnEnter"] = "AcceptEdit";
      }
   }

ME.Edit;
if(this.MomentumScroll&&!BTouch) this.MomentumScroll = 0;
if((this.MomentumScroll&3)==3&&BIPAD&&!BIPAD8) this.MomentumScroll = 1; 
MS.CustomScroll; if(Grids.HiddenScroll==2 && !this.CustomScroll) { this.CustomScroll = 3; if(!this.CustomHScroll) this.CustomHScroll = 3; } ME.CustomScroll; 
if(this.ScrollParent && typeof(this.ScrollParent)=="string") this.ScrollParent = GetElem(this.ScrollParent);


MS._Reg;
MX._Reg;
MS.Cfg;
if(Grids.Stat==null){
   if(this.NoStat) Grids.Stat = 0;
   else {
      var T = this; Grids.Stat = 1; Grids.StatTime = 0;
      setTimeout(function(){
         try { 
            if(Grids.Stat<10) return; 
            if(T.Cleared) {
               for(var i=0;i<Grids.length;i++) if(Grids[i]&&!Grids[i].Cleared) { T = Grids[i]; break; }
               if(T.Cleared) return;
               }
            var DS = document.createElement("div"), cc = "Comrsient"; DS.className = T.Img.Style+"Stat"; DS.style.width = "0px"; DS.style.height = "0px"; DS.style.overflow = "hidden";
            var O = new TCfg(), v = self[cc.slice(0,3)+"pon"+cc.slice(6)]; v = v ? v["Ve"+cc.slice(3,6)+"on"] : 0; v = v ? v.split(".") : [0]; 
            if(v[0]=="0") return; 
            O.SetInt6(((v[0]-0?v[0]-13:0)&7)+(v[1]&7)*8);
            O.SetInt6((v[2]&31)+(T.Gantt?32:0));
            O.SetInt6((BEdge?1:BIEA11?2:BIEA10?3:BIEA9?4:BIEA8?5:BIEA6?7:BIE?8:BIE5?9:BIEA?6:BAndroid?10:BIPAD?11:BMozilla?12:BChrome?13:BSafariWin?14:BSafariMac?15:BOpera?16:0)+(BStrict?0:32)); 
            var A = GetWindowSize(); 
            O.SetInt6((((A[0]>1500?1500:A[0])/100)&15)+(T.Cookie?16:0)+(T.TestIds?32:0)); 
            O.SetInt6((((A[1]>1500?1500:A[1])/100)&15)+(T.MainCol?16:0)+(T.Toolbar.Visible?32:0)); 
            A = [T.MainTag.offsetWidth,T.MainTag.offsetHeight]; 
            O.SetInt6((((A[0]>1500?1500:A[0])/100)&15)+(T.DebugFlags["info"]?3:T.DebugFlags["problem"]?2:T.DebugFlags["error"]?1:0)*16); 
            O.SetInt6((((A[1]>1500?1500:A[1])/100)&15)+(T.DebugLevel?16:0)+(T.SuppressAnimations||!T.AnimateRows&&!T.AnimateCols&&!T.AnimateCells?32:0)); 
            for(var rc=0,lc=(T.LoadedCount-1)>>3;lc>0;lc>>=1,rc++);
            O.SetInt6(((rc>15?15:rc)&15)+(T.Source.Sync?16:0)+(Requests.Sync?32:0)); 
            for(rc=0,lc=(T.RowCount-1)>>3;lc>0;lc>>=1,rc++);
            O.SetInt6(((rc>15?15:rc)&15)+(Grids.SafeCSS?16:0)+(T.PersistentCfg?32:0)); 
            for(var i=0,lc=0;i<T.ColNames.length;i++) lc += T.ColNames[i].length;
            for(rc=0,lc--;lc>0;lc>>=1,rc++);
            O.SetInt6(((rc>15?15:rc)&7)+(T.Rtl?16:0)+(T.Lang.Format.Hirji?32:0)); 
            O.SetInt6((T.Paging&3)+(T.ChildPaging&3)*4+(T.ColPaging?16:0)+(T.ChildParts?32:0)); 
            O.SetInt6((T.RemoveUnusedPages&3)+(T.AllPages?4:0)+(T.MaxPages?8:0)+(T.MaxChildParts?16:0)+(T.MaxColPages?32:0)); 
            O.SetInt6((T.RemoveCollapsed&3)+(T.Pager.Visible?4:0)+(T.Pagers.length>1?8:0)+(T.ChildPartMin?16:0)+(T.ColPagingFixed?32:0)); 
            O.SetInt6((T.FastPages?1:0)+(T.PageLengthDiv>1?2:0)+(T.OnePage?4:0)+(T.ExactSize?8:0)+(T.MaxHeight?16:0)+(T.LimitScroll?32:0));
            O.SetInt6((T.NoScroll?1:0)+(T.ResizingMain?2:0)+(T.SectionResizing&&(T.LeftCanResize||T.RightCanResize)?4:0)+(T.StaticCursor?8:0)+(T.FocusRect?16:0)+(T.FocusWholeRow?32:0));
            O.SetInt6((T.Source.Upload.Url?1:T.Source.Upload.Tag?2:T.Source.Upload.Data?3:0)+(T.AutoUpdate?4:0)+(T.Source.Upload.Format.toLowerCase()=="json"?8:0)+(T.Source.Check.Url?16:0)+(T.Source.Cell.Url?32:0));
            O.SetInt6((T.Source.Data.Url?1:0)+(Grids.OnCustomAjax?2:0)+(T.NoHScroll?4:0)+(T.NoVScroll?8:0)+(T.CustomScroll?16:0)+(T.ReversedTree?32:0));
            O.SetInt6((T.FormulaEditing&3)+(T.FormulaRelative&3)*4+(T.RowSpan?16:0)+(T.DynamicSpan?32:0)); 
            O.SetInt6((T.DynamicStyle?1:0)+(T.DynamicBorder?2:0)+(T.DynamicFormat?4:0)+(T.ExcelDates?8:0)+(T.File?16:0)+(T.Lang.Format.GMT?32:0));
            O.SetInt6((T.Adding||T.Deleting?1:0)+(T.ColAdding||T.ColDeleting?2:0)+(T.Dragging?4:0)+(T.Selecting?8:0)+(T.SelectingCells?16:0)+(T.SelectingCols?32:0));
            O.SetInt6((T.Editing?1:0)+(T.PrintLoad?2:0)+(T.ExportLoad?4:0)+(T.PrintZoomFit?8:0)+(T.Source.ExportPDF.Url?16:0)+(T.SuppressCfg?32:0));
            O.SetInt6((T.DetailGrid||T.MasterGrid?1:0)+(T.NestedGrid?2:0)+(T.PivotMaster||T.PivotGrid?4:0)+(T.Undo?8:0)+(T.Charts?16:0)+(T.SuppressMessage?32:0));
            var S = {"TS":1,"TW":2,"TM":3,"TB":4,"TT":5,"CB":6,"CC":7,"CE":8,"CG":9,"CL":10,"CO":11,"CQ":12,"CF":13,"CR":14,"CS":15,"CP":16}[T.Img.Style];
            O.SetInt6((S?S:0)+(T.CSS?32:0)); 
            var i = 0;
            if(T.Scale && T.Scale!=1){
               var s = T.Scale, ss = [0,0,0.5,0.6,0.75,0.9,1,1.1,1.25,1.5,2,3,4,5,10,100];
               for(var i=1;i<ss.length;i++) if(s<1?s<ss[i]:s<=ss[i]) { i--; break; }
               }
            O.SetInt6(i+(T.ScaleX?16:0)+(T.ScaleY?32:0)); 
            var S = {"Tiny":1,"Mini":2,"Small":3,"Low":4,"Normal":5,"Wide":6,"High":7,"Big":8,"Giant":9}[T.Size];
            var d = 0; MS._Debug; d = 1; ME._Debug;
            O.SetInt6((S?S:0)+(d?16:0)); 
            for(var rc=0,lc=Grids.length-1;lc>0;lc>>=1,rc++);
            O.SetInt6((rc>7?7:rc));      
            var C = T.Gantt?T.Cols[T.GetFirstGantt()]:null;
            if(C){
               O.SetInt6((T.GanttDependency!=null?1:0)+(C.GanttPaging?2:0)+(C.GanttAvailability?4:0)+(C.GanttResources?8:0)+(C.GanttExclude?16:0)+(C.GanttCalendar?32:0));
               O.SetInt6((C.GanttRun?1:0)+(C.GanttStart?2:0)+(C.GanttParts?4:0)+(C.GanttFlags?8:0)+(C.GanttPoints?16:0)+((C.GanttMinStart||C.GanttMaxEnd)?32:0));
               var GS = {"GS":1,"GW":2,"GM":3,"GB":4,"GT":5}[T.Img.GanttStyle];
               O.SetInt6((GS?GS:0)+(C.GanttSlack?8:0)); 
               }
            
            DS.innerHTML = "<img width='1' height='1' src='/"+"/co"+"qso"+"ft.c"+"om/Stat/"+O.Data+".png'/>";
            
            T.AppendTag(DS);
            setTimeout(function(){DS.parentNode.removeChild(DS);},1000);
            }
         catch(e) { }
         },3e5); 
         
      }
   }
ME.Cfg;
ME._Reg;

MS.Api;
MS.Toolbar;
this.ControlPanel = { 
   Click : new Function("num",this.This+".ToolbarClick(num);"),
   HideCfg : new Function("save",this.This+".HideCfg(save);") };
ME.Toolbar;
ME.Api;
if(this.Selecting&8) this.SelectingCells = 1;
if(this.ShowVScrollbar) this.ShowVScroll = 1;
this.EventObject = {};
MS.Group;
if(this.GroupFlags!=null){
   this.GroupSortMain = this.GroupFlags&4?1:(this.GroupFlags&8?2:0);
   this.GroupRestoreSort = this.GroupFlags&2;
   }
ME.Group;   
MS.Search;
if(this.SearchType!=null) { 
   var st = this.SearchType;
   this.SearchCells = st&1;
   this.SearchHidden = st&2;
   this.SearchCaseSensitive = st&4;
   this.SearchExpand = st&8;
   this.SearchFocused = st&64?0:(st&16?(st&32?3:2):1);
   this.SearchNotFound = st&128;
   }
ME.Search;   
MS.Print;
if(this.PrintType!=null){
   this.PrintExpanded = this.PrintType&2?1:0;
   this.PrintPageBreaks = this.PrintType&512?1:0;
   }
if(this.Print && this.PrintFiltered) this.Filtering = 0;
ME.Print;   
MS.Paste;
if(this.Pasting>1){
   var p = this.Pasting;
   this.PasteSelected = p&1;
   this.PasteFocused = {"2":1,"6":2,"10":4,"14":6}[p&14];
   this.PasteCols = {"0":4,"16":3,"32":1,"48":1}[p&48];
   if(p&192) { this.PasteCols = 0; this.PasteFocused = p&64?30:20; }
   }
ME.Paste;
if(this.Header.CDef!=null && this.Root.CDef=="R") this.Root.CDef = this.Header.CDef;
this.XHeader = this.Header;
if(this.ScrollOnDrag==1) this.ScrollOnDrag = 50;

if(BChrome){ 
   var A = "Hidden,Spanned,Class,Color,Formula,NoColor,Background,Wrap,Align,CanFocus,CanEdit,Buttons,Button,Icon,IconAlign,IconChecked,Link,Format,EmptyValue,Range,BoolIcon,Move,Select,Delete,Copy,HtmlPrefix,HtmlPostfix".split(",");
   for(var col in C){
      var c = C[col];
      for(var i=0;i<A.length;i++) if(c[A[i]]==null) c[A[i]] = null;
      }
   }

if(this.WideHScroll) this.SectionResizing = 0;

if(this.ImportAction && !this.File && (!this.ImportExt||!Grids.OnImportText)) this.ImportAction = 0;

MS.Nested;
if(this.Source.Nested){
   var M = this.Source.Nested.Master, row = this.Source.Nested.Row;
   if(!this.XB.firstChild) this.AddBody();
   M.InitDetail(this,row);
   this.MasterGrid = M;
   var def = this.MasterDef;
   if(def) { var d = def.split(","); def = {}; for(var i=0;i<d.length;i++) def[d[i]] = 1; }
   var defhide = this.MasterDefHide;
   if(defhide) { var d = defhide.split(","); defhide = {}; for(var i=0;i<d.length;i++) defhide[d[i]] = 1; }
   M.CopyDetailData(this,row,this.XB.firstChild,def,defhide);
   }
ME.Nested;

if(!this.XB.firstChild){
   MS.Debug; if(!this.AutoPages) this.Debug(2,"No page (tag <B>) defined in input XML"); ME.Debug;
   this.AddBody();
   }

if(this.ChildPaging==3&&this.ChildPageLength){
   if(!this.Paging) { this.NoPager = 1; this.PageLength = 1e6; }
   this.Paging = 3;
   }
   
MS.ChildParts;
if(!this.ChildParts && this.ChildPaging==3) { 
   this.ChildParts = 2; 
   if(this.ChildParts=="0") this.ChildPartMin = 1e6; 
   }
else if(!this.ChildParts && this.ChildParts!="0" && this.MainCol){
   if(this.Paging==3) this.ChildParts = 2;
   else {
      cnt = 0;
      function Count(par){
         cnt += par.childNodes.length;
         if(cnt>200) return true;
         for(var r=par.firstChild;r;r=r.nextSibling) if(Count(r)) return true;
         }
      for(var row=this.XB.firstChild.firstChild;row;row=row.nextSibling) if(Count(row)) break;
      this.ChildParts = cnt>200?2:0;
      }
   }
MX.ChildParts;
if(!this.StartChildPart) this.ChildParts = 0;
ME.ChildParts;   

MS.Pager;
var P = this.Pager;
if(this.Paging && P.Type==null) P.Type = "Pages";  
if(!P.Name) P.Name = "Pager";
if(this.Pagers[P.Name]) { var N = this.Pagers[P.Name]; for(var a in P){ if(N[a]==null) N[a] = P[a]; } }
else if(P.Type) { this.Pagers[P.Name] = P; P.Index = this.Pagers.length; this.Pagers[this.Pagers.length] = P; }
if(this.NoPager) this.Pagers.length = 0;
var Def = {Visible:1,Width:100,MinWidth:35,CanResize:1,CanHide:1,Hover:1,Type:this.Paging?"Pages":"Custom"};
for(var i=0,lcnt=0;i<this.Pagers.length;i++){
   var P = this.Pagers[i];
   if(P.Left==null && P.Align) P.Left = P.Align.toLowerCase()=="left";
   for(var n in Def) if(P[n]==null) P[n] = Def[n];
   if(P.ShowUsedPages) this.UsedPages = 1;
   }
ME.Pager;

this.EditTypes = CEditTypes;
if(this.EditHtml){ var A = {}; for(var a in CEditTypes) A[a] = CEditTypes[a]; A["Html"] = true; this.EditTypes = A; }

var H = ["Header","Toolbar","Filter"], F = this.GetFixedRows();
for(var r=this.XS.firstChild;r;r=r.nextSibling) F[F.length] = r;
for(var j=0;j<H.length;j++){
   var n = H[j], r = this[n];
   for(var i=0;i<F.length;i++){
      if(F[i].id==(r&&r.id?r.id:n) && (F[i].Kind==(r&&r.Kind?r.Kind:n) || !F[i].Kind) || !r && F[i].Kind==n){
         if(r) { for(var o in r) if(!Grids.INames[o] && r[o]!=null && F[i][o]==null) F[i][o] = r[o]; }
         else if(F[i].id==null) F[i].id = n;
         this[n] = F[i];
         break;
         }
      }
   if(r && i==F.length) {  
      if(n=="Header" || n=="Filter") this.XH.insertBefore(r,this.XH.firstChild);
      else if(n=="Toolbar") this.XS.appendChild(r);
      else this.XS.appendChild(r); 
      if(r.id==null) r.id = n; 
      if(r.Kind==null) r.Kind = n;
      }
   }

MS.HeaderMulti;
if(this.Header.Rows>1){
   var H = this.Header, X = H;
   for(var i=0;i<H.Rows;i++){
      if(i==H.Main) { X = H.nextSibling; continue; }
      var r = Dom.createElement("I");
      r.Spanned = 1;
      r.Kind = "Header";
      for(var sec=this.FirstSec;sec<=this.LastSec;sec++){
         var S = this.ColNames[sec], N = (sec==0?"Left":sec==1?"Mid":"Right")+i;
         for(var ci=0,cc=0;ci<S.length;ci+=spn,cc++){
            var col = S[ci], spn = H[N+cc+"Span"]; if(!spn) spn = 1;
            r[col] = H[N+cc]; if(!r[col]) r[col] = CNBSP;
            r[col+"Type"] = "Html";
            r[col+"SortCol"] = "";
            if(spn>1) r[col+"Span"] = spn;
            }
         }
      if(X) H.parentNode.insertBefore(r,X);
      else H.parentNode.appendChild(r);
      r.id = "Header"+i;
      }
   }
ME.HeaderMulti;

MS.ColTree; this.CreateColTree(); ME.ColTree;
MS.Tree; this.CreateTree(); ME.Tree; 

this.InitColPaging();
this.XH.Fixed = "Head"; this.XF.Fixed = "Foot";

this.UpdateSecCount();

MS._Reg; var GridErr = "Co"; ME._Reg; 

// --- ConstWidth attribute ---
MS.RelWidth;
if(this.ConstWidth){ 
   if((this.NoHScroll||this.MaxHScroll)&&this.ConstWidth<4 || this.ConstWidth==4 && !this.Toolbar.Visible || this.AutoPages) this.ConstWidth = 0;
   else {
      var add = 1; 
      for(var c in this.Cols) if(this.Cols[c].ConstWidth){ 
         var C = this.Cols[c];
         C.Type = "Html"; 
         for(var a in CConstWidth) C[a] = CConstWidth[a]; 
         if(C.RelWidth) { C.Hidden = 1; C.RelHidden = 1; }
         add = 0; this.RelWidth = 1; 
         break; 
         }
      if(add){
         var sec = 1, pos = 1e6;
         if(this.SecCount==3){
            if(this.ConstWidth==1) { sec = 2; pos = 0; } 
            else if(this.ConstWidth>=3) sec = 2;   
            }
         var c = this.AddCol("_ConstWidth",sec,pos,{Def:"ConstWidth"},0,"Html"," ");
         if(c) this.RelWidth = 1;
         }
      }
   }
ME.RelWidth;

// --- DefaultSort ---
if(this.DefaultSort && !this.Cols[this.DefaultSort]){
   var dc = this.DefaultSort-0?"_DefaultSort":this.DefaultSort;
   if(this.AddCol(dc,0,0,{CanHide:0,Visible:0,CanExport:0,CanPrint:0},0,"Int"," ")){
      for(var r=this.GetFirst(),i=1;r;r=this.GetNext(r),i++) r[dc] = i;
      this.DefaultSort = dc;
      this.DefaultSortPos = i;
      }
   else this.DefaultSort = null;
   }

MS.GenId;
if(this.IdCompare!=null) this.CaseSensitiveId = this.IdCompare&4?0:1; 
if(!this.IdNames) this.IdNames = "id";
if(typeof(this.IdNames)=="string"){ 
   this.IdNames = this.IdNames.split(",");
   this.IdTypes = null;
   }

this.IdMore = this.IdNames.length!=1 || this.IdNames[0]!="id" ? this.IdNames.length : (this.FullId ? 1 : 0);
if(!this.IdTypes){
   this.IdTypes = {};
   for(var i=0;i<this.IdNames.length;i++) this.IdTypes[this.IdNames[i]] = 1;
   }
this.IdCol = this.IdNames[this.IdNames.length-1];
this.IdPrefix = this.IdPrefix==null ? "" : this.IdPrefix+"";
this.IdPostfix = this.IdPostfix==null ? "" : this.IdPostfix+"";
this.IdChars = this.IdChars+"";
if(!this.IdChars) this.IdChars="0123456789";
else if(!this.CaseSensitiveId) {
   this.IdChars = this.IdChars.toLocaleLowerCase();
   var A = {};
   for(var i=0;i<this.IdChars.length;i++) {
      var c = this.IdChars.charAt(i);
      if(A[c]) { this.IdChars = this.IdChars.slice(0,i)+this.IdChars.slice(i+1); i--; }
      else A[c] = 1;
      }
   }
this.IdRegExStr = /[\^\$\.\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}]/g
this.IdRegEx = this.IdPrefix.replace(this.IdRegExStr,"\\$&")+"(["+this.IdChars.replace(this.IdRegExStr,"\\$&")+"]*)"+this.IdPostfix.replace(this.IdRegExStr,"\\$&")+"$";
this.IdCharsIndex = {}; 
for(var i=0;i<this.IdChars.length;i++) this.IdCharsIndex[this.IdChars.charAt(i)]=i;
this.LastId = this.LastId==null ? "" : this.LastId+"";
if(this.LastId){ 
   var M = this.LastId.match(new RegExp("^"+this.IdRegEx,this.CaseSensitiveId?"":"i"));
   if(M) this.LastId=M[1];
   }
ME.GenId;
if(BIEA8) this.SetIds = 1;

if((this.Source.Upload.Type+this.Source.Upload.Flags+"").toLowerCase().indexOf("spanned")>=0) this.SaveSpan = 1;

MS._Reg;

GridErr = (this[GridErr+"de"]+"").search(TGGrids.LICCODELICCODELICCODELICCODELICCODELICCODELICCODELICCODELICCODE);

MX._Reg;
var loc = location.hostname;
CDM = loc.search(/\bco\s?q(\.c\s?z|so\s?f\s?t\.\s?c\s?om)$|\bt(r\s?ee\s?g\s?rid|g\s?ant\s?t)\s?\.(c\s?om|n\s?et|e\s?u)$|x\s?ls\s?oft\.c\s?om$/i)>=0?11:(loc.search(/^$|lo\s?cal\s?h\s?os\s?t$|12\s?7\.0\s?\.0\s?\.1$|^1\s?0\.\d+\.\d+\.\d+$|^1\s?9\s?2\.1\s?6\s?8\.\d+\.\d+$/i)>=0?12:0);
if(!CDM){ 
   var T = this.Toolbar;
   if(!T.Visible){
      T.HiddenToolbar = 1;
      T = Dom.createElement("U");
      this.Toolbar = T;
      T.Visible = 1;
      T.Cells = "";
      T.Space = 4; T.Kind = "Toolbar";
      this.XF.appendChild(T);
      }
   T.Link = null; T["LinkVisible"] = 1;
   T["Empty"] = null;
   T.Tag = "";
   }
ME._Reg;

MS.Space;
this.UpdateSpaces();
MX.Space;
if(!this.UpdateSpaces){
   var S = [];
   for(var i=0;i<6;i++) S[i] = i;
   S[5]--; 
   this.XS.Space = S;
   }
ME.Space;

MS._Debug;
if(!CDM) { this.ShowStartErr(); return; } 
ME._Debug;

MS._Debug;if(0){ ME._Debug; 

MS._PureTree;
cnt = 0; 
for(var c in this.Cols){ 
   var C = this.Cols[c];
   if(C.Visible && c!="Panel" && ++cnt>=4){ C.Visible = 0; C.CanHide = 0; }
   }      
this.Toolbar.Columns = 0;  
ME._PureTree;

MS._GanttChart;
if(this.id!="DatesDialog"){
   if(!this.Gantt) { this.ShowStartErr("M"+"is"+"si"+"ng "+"Ga"+"nt"+"t c"+"olu"+"mn"); return; }
   var C = this.Cols[this.Gantt];
   C.Visible = 1; C.CanHide = 0; if(C.MaxWidth<100) C.MaxWidth = 100;
   }
ME._GanttChart;

MS._Free;
cnt=0;
for(var c in this.Cols){
   var C = this.Cols[c];
     if(c!="Panel"){
      C.Visible = 1; 
      C.CanHide = 0;
      if(C.Width<10) C.Width = 10;
      cnt++;
      }
   }
while(cnt<3){
   var c = "Tmp"+cnt;
   var C = {};
   
   this.Cols[c] = C;
   C.Pos = this.ColNames[1].length;
   this.ColNames[1][this.ColNames[1].length] = c;
   C.Visible = 1; 
   C.CanHide = 0;
   C.AutoWidth = 0;
   C.Width = 50;
   C.Type = "Text";
   C.Sec = 1;
   
   C.Name = c;
   
   C.WidthPad = 0;
   this.Header[c] = c;
   cnt++;
   }
cnt = 27+6; 
for(var r=this.GetFirst(),last=null;r;r=this.GetNext(r)){
   if(cnt==1) last = r;
   if(cnt--<=0){ 
      if(r.parentNode.Count) r.parentNode.Count--;
      r.parentNode.removeChild(r);
      r = last;
      }
   }
this.Toolbar.Columns = 0;
ME._Free;

MS._Debug;} ME._Debug; 

this.UpdateValues(); 

var cmp = window["tnenopmoCGT".split("").reverse().join("")];
if(cmp){
   var A = [], p = 0, s = "", crc = 0, mm = "seludoM".split("").reverse().join("");
   for(var i in cmp) if(typeof(cmp[i])=="string" && i!=mm) A[p++] = i;
   A.sort();
   for(var i=0;i<p;i++) s += cmp[A[i]];
   s+=cmp[mm]; 
   
   for(var i=0;i<s.length;i++){
      if(i%3) crc += s.charCodeAt(i);
      else if(i%11) crc -= s.charCodeAt(i);
      else crc ^= s.charCodeAt(i);
      }
   if(crc!=TGGrids.LICCRC) cmp = null;
   }
MS._Debug;if(0){ ME._Debug; 
if(!cmp) { this.ShowStartErr("ecnecil gnorW".split("").reverse().join("")); return; }
MS._Debug;} ME._Debug; 

var F = this.GetFixedRows(), C = this.Cols;
for(var i=0;i<F.length;i++){
   var r = F[i], type = Get(r,"NoEscape") ? "Html" : "Text";
   if(r.Kind=="Header"||r.ShowColNames) {
      for(var c in C) {
         if(r[c]==null&&r.ShowColNames!=0) {
            r[c] = c;
            if(C.Type!="Text"&&C.Type!="Html"&&C.Type!="EHtml"&&C.Type!="Panel"&&c!="Panel"&&r.Def[c+"Type"]==null) r[c+"Type"] = type;
            }
         this.UpdateColHeader(r,c); 
         }
      }
   MS.Filter;
   if(r.Kind=="Filter"){   
      for(var c in C) this.UpdateColFilter(r,c);
      if(!Get(r,"PanelOnEnter")) r["PanelOnEnter"] = "FilterOn OR FilterOff";
      }
   MX.Filter;
   if(r.Kind=="Filter" && !this.DoFilter) r.Visible = 0;
   ME.Filter;
   
   MS.UserSec;
   if(r.Kind=="User"){ 
      if(r["LeftHtml"]==null) r["LeftHtml"] = r["LeftVal"]?r["LeftVal"]:CNBSP;
      if(r["MidHtml"]==null) r["MidHtml"] = r["MidVal"]?r["MidVal"]:CNBSP;
      if(r["RightHtml"]==null) r["RightHtml"] = r["RightVal"]?r["RightVal"]:CNBSP;
      r.CanExport = 0;
      }   
   ME.UserSec;      
   }

MS._Debug;if(0){ ME._Debug; 
MS._Reg;
if(GridErr){ this.ShowStartErr("edoc laires gnorW".split("").reverse().join("")); return; }
ME._Reg;
MS._Debug;} ME._Debug; 

MS.UpCounter; ME.UpCounter;
MS.Index$UpCounter; if(this.RowIndex) this.UpdateRowIndex(1); ME.Index$UpCounter;

this.ExpandAndSelect();

MS.Group;
this.MainColGroup = this.MainCol; 
this.RootCDef = this.Root.CDef; 
this.RootAcceptDef = this.Root.AcceptDef; 
if(this.Def["GroupLast"]) this.Def["GroupLast"].GroupCol = -1;
ME.Group;
this.LeftTD = BIEStrict || BSafari || this.DynamicSpan ? 1 : 0 || this.ColPaging&&this.ColPagingFixed==0; 
MS.RowSpan; this.InitRowSpan(); if(this.AutoSpan&12) this.AutoSpanAllCells((this.AutoSpan&12)>>2); ME.RowSpan;
MS.Debug; if(BIE8Strict && this.DynamicSpan && !BIEA10 && (this.MainCol||this.Group)) this.Debug(1,"Dynamic spanning in tree is incompatible with IE8/9 strict mode ! Switch IE to quirks mode or IE7 compatibility mode"); ME.Debug;
MS.Export; 
if(this.ExportRound!=null) this.ExportRound = Math.pow(10,this.ExportRound);
if(BIEA && !BIEA10 && !this.Source.Export.Type) this.Source.Export.Type = "Export"; 
if(this.ExportHeights==null) this.ExportHeights = this.ExportVarHeight||this.ExportVarHeight=="0" ? this.ExportVarHeight+2 : 1;
ME.Export;

MS.Touch;
if(this.ScrollAction!=null) this.SetScrollAction(this.ScrollAction);
ME.Touch;
this.LimitScrollTime = 0;
if(BTablet&&this.MaxHeight&&this.LimitScroll) this.LimitScroll &= ~2; 

MS.Resize;
if(this.ResizingMain&1 && this.MaxHeight) this.ResizingMain &= ~1;
if(this.ResizingMain && this.MainTag && !this.Hidden && this.MainTagOrigWidth==null){ 
   this.MainTagOrigWidth = this.MainTag.style.width;
   this.MainTagOrigHeight = this.MainTag.style.height;
   }
ME.Resize;

MS.Sync;
var S = this.Sync; if(this.Loading) this.Loading = 2;
for(var i=0;i<Grids.length;i++){
   var G = Grids[i];
   if(G&&G!=this&&(!G.Loading||G.Loading==2)&&G.SyncId==this.SyncId){
      var GS = G.Sync;
      if(S["cols"] && GS["cols"]){
         for(var c in this.Cols){
            var C1 = this.Cols[c], C2 = G.Cols[c]; 
            if(C2){
               C1.Width = C2.OldWidth&&C1.GroupWidth&&S["group"]&&GS["group"]&&this.Grouping ? C2.OldWidth : C2.Width;
               C1.Visible = C2.Visible;
               }
            }
         for(var j=0;j<G.ColNames.length;j++){ 
            var N = [];
            for(var k=0;k<G.ColNames[j].length;k++){ var c = G.ColNames[j][k]; if(this.Cols[c]) N[N.length] = c; }
            for(var k=0;k<this.ColNames[j].length;k++){ var c = this.ColNames[j][k]; if(!G.Cols[c]) N[N.length] = c; }
            for(var k=0;k<N.length;k++){ var c = N[k]; this.ColNames[j][k] = c; this.Cols[c].Sec = j; this.Cols[c].MainSec = j; this.Cols[c].Pos = k; }
            this.ColNames[j].length = N.length;
            }
         }
      if(S["sort"] && GS["sort"]) { this.Sort = G.Sort; this.Sorted = G.Sorted; }
      if(S["group"] && GS["group"]) { this.Group = G.Group; this.Grouped = G.Grouped; }
      if(S["filter"] && GS["filter"]) {
         var F1 = this.GetFilterRows(), F2 = G.GetFilterRows();
         for(var j=0;j<F1.length && F2[j];j++){
            for(var c in this.Cols){ F1[j][c] = F2[j][c]; F1[j][c+"Filter"] = F2[j][c+"Filter"]; }
            }
         this.Filtered = G.Filtered;
         }
      if(S["search"] && GS["search"]){ 
         var A = ["ed","Expression","Action","Method","Cells","CaseSensitive","Defs","Cols"];
         for(var j=0;j<A.length;j++) this["Search"+A[j]] = G["Search"+A[j]];
         }
      if(S["sec"] && GS["sec"]){
         this.LeftWidth = G.LeftWidth;
         this.MidWidth = G.MidWidth;
         this.RightWidth = G.RightWidth;
         }
      break; 
      }
   }
ME.Sync;

if(this.CalculatedChanges&&!(this.CalculatedChanges-0)) this.CalculatedChanges = this.ConvertFlags(this.CalculatedChanges);
if(this.CalculatedChangesFirst){
   var A = this.ConvertFlags(this.CalculatedChangesFirst);
   if(!this.CalculatedChanges) this.CalculatedChanges = {};
   else if(this.CalculatedChanges-0) { this.CalculatedChanges = {}; for(var c in this.Cols) this.CalculatedChanges[c] = 1; }
   for(var c in A) this.CalculatedChanges[c] = 2;
   }
if(this.BorderCursors==2) this.BorderCursors = !BSafari&&!BOpera||!!BIPAD;

if(this.GlobalCursor==null) this.GlobalCursor = 1;
if(!this.AbsoluteCursors&&this.AbsoluteCursors!="0") this.AbsoluteCursors = BFF3 ? 0 : 5;

if(this.PendingChanges) {
   for(var i=0;i<this.PendingChanges.length;i++) this.AddChanges(this.PendingChanges[i],1);
   this.PendingChanges = null;
   }
if(this.HiddenRows){ var H = this.HiddenRows.split(","); for(var i=0;i<H.length;i++) { var r = this.Rows[H[i]]; if(r&&r.Visible) r.Visible = 0; } }
if(this.VisibleRows){ var H = this.VisibleRows.split(","); for(var i=0;i<H.length;i++) { var r = this.Rows[H[i]]; if(r&&!r.Visible) r.Visible = 1; } }
  


if(Grids.OnUpdated) Grids.OnUpdated(this);

MS.Debug; this.StopTimer("UpdateGrid"); ME.Debug;
 

var group = this.Grouping && this.Grouped && this.Group && this.DoSort && (!(this.OnePage&4) || this.AllPages) && this.Paging!=3;
var A = [
   "Calculate", this.UpdateGridCalc, !this.NoCalc,
   "ColUpdate", this.UpdateGridWidth, !this.Hidden,
   "PagingUpdate", this.UpdateGridPaging, this.Paging==3,
   "Group", this.UpdateGridGroup, group,
   "DoFilter", this.UpdateGridFilter, (this.BuildFilter && this.Filtering && (this.GetFilterRows().length||this.Filter3) || this.DoSearch && this.SearchAction && this.Searching) && this.Paging!=3,
   "Sort", this.UpdateGridSort, (this.Sorting && this.Sorted && this.Sort && this.DoSort || this.Paging || this.ChildPaging && (this.MainCol||group)) && this.Paging!=3,
   "UpdateTree", this.UpdateGridTree, this.MainCol || this.Alternate || group || this.Paging==3,
   "GanttCreate", this.UpdateGridGantt, this.GanttZal, 
   "Render", this.UpdateGridFinish, 1
   ];

if(sync){
   for(var i=1;i<A.length;i+=3) if(A[i] && A[i+1]) A[i].apply(this);
   if(this.Print) this.RenderPrint();
   else if(!this.Hidden) this.Render();
   return;
   }

var p = 1, T = this;
while(!A[p]||!A[p+1]) p += 3; 
function run(){
   if(!T.Loading) return; 
   A[p].apply(T);
   p += 3;
   if(p>=A.length) { 
      if(T.Print) T.RenderPrint();
      else if(!T.Hidden) T.Render();
      return;      
      }
   while(!A[p]||!A[p+1]) p += 3; 
   T.ShowMessage(T.GetText(A[p-1]),1);
   setTimeout(run,10);
   }
this.ShowMessage(T.GetText(A[p-1]),1); 
setTimeout(run,10);
}
// -----------------------------------------------------------------------------------------------------------
MS.Calc;
TGP.UpdateGridCalc = function(){
MS.Debug; this.Debug(4,"Calculating formulas"); this.StartTimer("Calculate"); ME.Debug;

this.Calculate();
MS.Debug; this.StopTimer("Calculate"); ME.Debug;
}
ME.Calc;
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateGridWidth = function(){
if(this.Hidden) return;
MS.Debug; this.Debug(4,"Calculating column widths"); this.StartTimer("Widths"); var txt = ""; ME.Debug;
var C = this.Cols, CN = this.ColNames, min = this.Img.CellBorderWidth;
this.BackBody = 0;
for(var i=0;i<CN.length;i++) { CN[i].Width = 0; CN[i].Visible = 0; } 
this.CalcTreeWidth();
if(this.MaxLevel) { var c = this.Cols[this.MainCol]; if(c&&c.Align=="Center"||!c.Align&&c.Def=="Index") { c.AlignSet = 1; c.Align = "Right"; if(c.Indent==null) { c.Indent = 1; c.IndentSet = 1; } } }
for(var col in C){ 
   var c = C[col];
   if(!c.MinWidth) c.MinWidth = 0;
   if(c.AutoWidth==true) {
      if(c.RelWidth) c.Width = 2000;
      else this.CalcWidth(col,1);
      MS.Debug; txt += c.Name+"="+c.Width+"px; "; ME.Debug;
      }
   else if(c.Width<c.MinWidth) c.Width = c.MinWidth;
   else if(c.Width<min) c.Width = min;
   
   if(c.Visible) { CN[c.Sec].Visible = 2; CN[c.Sec].Width += c.Width; }
   else if(c.Hidden && !CN[c.Sec].Visible) CN[c.Sec].Visible = 1;
   
   }
MS.Pager;
for(var i=0;i<this.Pagers.length;i++){
   var P = this.Pagers[i];
   if(!P.MinWidth) P.MinWidth = 0;
   if(P.RelWidth || P.ZalRelWidth) {
      if(this.NoHScroll || this.MaxHScroll){ P.RelWidth = 0; P.ZalRelWidth = 0; }
      else this.RelWidth = true;
      }
   }
ME.Pager;
this.UpdateSecCount(); 
MS.Debug; this.Debug(4,"Column widths calculated in ",this.StopTimer("Widths")," ms (results: "+txt+")"); ME.Debug;
}
// -----------------------------------------------------------------------------------------------------------
MS.Paging;
TGP.UpdateGridPaging = function(){
MS.Pager;

for(var i=0;i<this.Pagers.length;i++) if(this.Pagers[i].Type=="Pages") { this.ConvertPageNames(); break; }
ME.Pager;
   
if(this.ColorFilterCells) this.ColorFilterCells(true);
   
MS.Group;
if(this.Grouping && (!this.ReloadReason)){ 
   if(this.Grouped && this.Group) {
      if(this.GroupRestoreSort && this.SortGroup==null) this.SortGroup = this.Sort;
      this.SetGroupMain();
      var G = this.GetGroupCols(this.Group);
      for(var i=0;i<G.length;i++) this.Cols[G[i]].Visible = 0;
      this.UpdateGroupCol(0);
      this.UpdateSecCount();
      this.UpdateGroupSort(this.Sort);
      }
   else this.ClearGroupMain();   
   this.CalculateSpaces(); 
   }
ME.Group;
}
ME.Paging;
// -----------------------------------------------------------------------------------------------------------
MS.Group;
TGP.UpdateGridGroup = function(){
if(!this.Grouping || !this.Grouped || !this.Group || this.OnePage&4 && !this.AllPages) return;
MS.Debug; this.Debug(4,"Grouping rows"); this.StartTimer("Group"); ME.Debug;
if(this.GroupRestoreSort && this.SortGroup==null) this.SortGroup = this.Sort;
this.GroupAll(1); 
this.Calculate(0,1);
MS.Debug; this.StopTimer("Group"); ME.Debug;
}
ME.Group;   
// -----------------------------------------------------------------------------------------------------------
MS.Filter$Search;  
TGP.UpdateGridFilter = function(){
MS.Debug; this.StartTimer("Filter2"); ME.Debug;
var f = 0;
var cf = this.BuildFilter && this.Filtering;
var cs = this.DoSearch && this.SearchAction && this.Searching;
var csf = cs && this.SearchAction.indexOf("Filter")>=0;
if(cf) { this.BuildFilter(); this.ColorFilterCells(); cf = this.Filter1||this.Filter3; }
if(csf || cf){ 
   if(!csf || !this.DoSearch(this.SearchAction,true) && cf) this.DoFilterT(0); 
   this.Calculate(0,1); 
   
   }
if(cs && !csf) this.DoSearch(this.SearchAction,true); 
MS.Debug; this.StopTimer("Filter2"); ME.Debug;
}   
ME.Filter$Search;
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateGridSort = function(){
if(this.Sorting && this.Sorted && this.Sort && this.DoSort){
   this.DoSort(); 
   for(var p=this.XB.firstChild;p;p=p.nextSibling) this.SetBody(p);
   }
else { 
   MS.Debug; this.StartTimer("Pages"); ME.Debug;
   if(this.Paging) this.CreatePages();
   MS.CPages;
   if(this.ChildPaging) this.CreateAllCPages(this.XB);
   MS.Debug; this.StopTimer("Pages"); ME.Debug;
   ME.CPages;
   } 
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateGridTree = function(){
MS.Tree;
if(this.MainCol) { 
   MS.Debug; this.Debug(4,"Updating tree"); this.StartTimer("Tree"); ME.Debug;
   this.SpannedTreeIE = this.SpannedTree&&BIEStrict&&!BIEA8;
   var E = this.Expanded, C = this.Collapsed, O;
   if(E!=null||C!=null){
      if(E!=null&&typeof(E)!="object"){ E = (E+"").split(","); O = {}; this.Expanded = O; for(var i=0;i<E.length;i++) O[E[i]] = 1; }
      if(C!=null&&typeof(C)!="object"){ C = (C+"").split(","); O = {}; this.Collapsed = O; for(var i=0;i<C.length;i++) O[C[i]] = 1; }
      for(var r=this.XB.firstChild;r;r=r.nextSibling){ this.UpdateExpanded(r); }
      }
   if(this.ChildPaging && this.ChildPageLength) {
      for(var p=this.XB.firstChild;p;p=p.nextSibling) for(var r=p.firstChild;r;r=r.nextSibling) this.CreateSPages(r);
      }
   this.UpdateAllLevelImg(0,1);
   }
ME.Tree;

MS.Color;
this.ReColor(1);
ME.Color;

MS.Debug; if(this.MainCol) this.StopTimer("Tree"); ME.Debug;
}
// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------
TGP.UpdateGridFinish = function(reload){
this.SaveOrigData();
this.SetVPos();
this.Loading = 0;
this.CheckInterval = 0;
if(!this.MasterGrid) this.ClearUndo();
this.Cleared = 0;
MS.Master; if(!this.XB.firstChild.firstChild && this.Paging!=3) this.LoadedEmpty = 1; ME.Master;
this.UpdateHidden();
if(BSafari) this.UpdateOverflow();
if(this.SizeScaled==1) delete this.SizeScaled;

if(this.Source.OnReady) this.Source.OnReady.apply(this);
if(Grids.OnReady) Grids.OnReady(this,!reload);

MS.Debug; 
var filter = this.GetTimer("Filter2");
var group = this.GetTimer("Group");
var sort = this.GetTimer("Sort");
var pages = this.GetTimer("Pages");
var tree = this.GetTimer("Tree"); 
var cols = this.GetTimer("Widths"); 
var gantt = this.GetTimer("Gantt"); 
this.Debug(4,"TreeGrid updated in ",this.EndTimer("Update")," ms (data updated: ",this.GetTimer("UpdateGrid")," ms, calculated: ",this.GetTimer("Calculate"),filter!=null?" ms, filtered and searched: ":"",filter,group!=null?" ms, grouped: ":"",group,sort!=null?" ms, sorted: ":"",sort,pages!=null?" ms, paged: ":"",pages,tree!=null?" ms, tree updated: ":"",tree,cols!=null?" ms, column widths calculated: ":"",cols,gantt!=null?" ms, Gantt created: ":"",gantt," ms)"); 
ME.Debug;

}
// -----------------------------------------------------------------------------------------------------------

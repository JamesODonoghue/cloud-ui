// -----------------------------------------------------------------------------------------------------------
// Global function called for memory freeing when window.onunload fired
function GlobalUnload(){
if(Try){ 
   if(Grids){
      
      MS.Master;
      for(var i=0;i<Grids.length;i++){
         var G = Grids[i];
         if(G && G.MasterGrid && !G.Cleared) {
            var B = G.XB.firstChild;
            G.MasterGrid.DetailSelected = null;
            if(B && B.MasterRow) { G.ClearMaster(B.MasterRow); B.MasterRow = null; }
            }
         }
      ME.Master;
      
      for(var i=0;i<Grids.length;i++){
         var G = Grids[i];
         if(G && !G.Cleared){ 
            if(G.EditMode) {
               if(Try) { G.EndEdit(); }
               else if(Catch) { }
               }
            G.Clear(1);
            }
         }
      }
   }
else if(Catch) { }

}
// -----------------------------------------------------------------------------------------------------------
// Called in interval 50ms to scroll grid(s) if it is needed
function GridsScroll(){
var G = Grids.Active, scroll = 0;

// --- ScrollRowTo ---
MS.Drag$Select;
if(Grids.Drag && G && G.ScrollTo){
   if(G.NoVScroll) scroll += G.SetScrollTop(G.GetScrollTop(1)+G.ScrollTo);
   else if(G.CustomScroll) scroll += G.SetScrollTop(G.ScrollVert.ScrollTop+G.ScrollTo);
   else {
      var t = G.ScrollVert.scrollTop, dy = G.ScrollVertZoom*G.ScrollTo;
      G.ScrollVert.scrollTop += dy;
      if(t!=G.ScrollVert.scrollTop) scroll++;
      }
   }
ME.Drag$Select;
   
// --- ScrollColTo ---	
MS.ColMove$Gantt;
if(Grids.Drag && G && G.ScrollColTo){
   var mainsec = G.Cols[G.ScrollColToCol].MainSec, H = G.ScrollHorz[mainsec];
   if(G.NoHScroll){
      var t = G.GetScrollLeft(-1), dx = G.ScrollColTo;
      scroll += G.SetScrollLeft(t+dx,-1);
      
      }
   else if(G.CustomHScroll) {
      MS.CustomScroll;
      if(G.Touched && Grids.Drag){ var zc = Grids.Drag.Hidden; Grids.Drag.Hidden = 1; } 
      var t = H.ScrollLeft, dx = G.ScrollColTo;
      
      scroll += G.SetScrollLeft(t+dx,mainsec);
      
      if(G.Touched && Grids.Drag) Grids.Drag.Hidden = zc;
      ME.CustomScroll;
      }
   else {
      var t = H.scrollLeft, dx = G.ScrollHorzZoom[mainsec]*G.ScrollColTo;
      H.scrollLeft += dx;
      if(t!=H.scrollLeft){
         scroll++;
         
         }
      }
   }
ME.ColMove$Gantt;

if(scroll||G&&G.DoScrolled) { G.DoScrolled = 0; G.Scrolled(); G.GridMouseOver(); }
if(scroll && G && Grids.Drag && Grids.Drag.Move) Grids.Drag.Move.apply(G,[0]);

// --- Show pages / save cfg ---   
MS.Paging$Cfg$ColPaging$Gantt;
if((!Grids.Drag || Grids.Drag.Action!="Scroll"&&Grids.Drag.Action!="Scrollbar") && (!BTablet||!Grids.Touches||Grids.Drag&&Grids.Drag.Action)) for(var i=0,schg=null;i<Grids.length;i++){
   var G = Grids[i]; if(!G||G.Hidden) continue;

   // --- Paging with NoScroll ---
   if(G.NoVScroll || G.NoHScroll){
      if(G.ScrollParent){
         if(G.ScrollParent.scrollLeft!=G.ScrollParentLeft) { G.LastColScroll = new Date(); G.ScrollParentLeftOld = G.ScrollParentLeft; G.ScrollParentLeft = G.ScrollParent.scrollLeft; }
         if(G.ScrollParent.scrollTop!=G.ScrollParentTop) { G.LastScroll = new Date(); G.ScrollParentTopOld = G.ScrollParentTop; G.ScrollParentTop = G.ScrollParent.scrollTop; }
         }
      else if(schg==null){
         schg = 0;
         var A = GetWindowScroll();  
         if(A[0]!=Grids.ScrollLeft) { G.LastColScroll = new Date(); Grids.ScrollLeftOld = Grids.ScrollLeft; Grids.ScrollLeft = A[0]; }
         if(A[1]!=Grids.ScrollTop) { G.LastScroll = new Date(); Grids.ScrollTopOld = Grids.ScrollTop; Grids.ScrollTop = A[1]; }
         }
      }
   if(G.ScrolledBodyObject){
      if(G.ScrolledBodyObject[5]>1) { G.ScrolledBodyObject = null; G.Scrolled(2); }
      else G.DoScrolledBody();
      }
   if(G.LastScroll && !G.Rendering && !G.Loading && new Date()-G.LastScroll>=G.PageTime){
      G.LastScroll = null;
      G.ShowPages();
      if(G.AutoPages && G.NoVScroll) {
         if(G.ScrollParent) { var nv = G.ScrollParentTop, ov = G.ScrollParentTopOld; } else { var nv = Grids.ScrollTop, ov = Grids.ScrollTopOld; }
         
         if(nv+10>ov && nv+10 > (G.ScrollParent?G.ScrollParent.scrollHeight-G.ScrollParent.clientHeight:document.body.scrollHeight-GetWindowSize()[1])) G.AddAutoPages();
         else if(G.RemoveAutoPages && nv<ov) G.DoClearAutoPages = 1;
         }
      }
   if(G.LastColScroll && !G.Rendering && !G.Loading && new Date()-G.LastColScroll>=G.PageTime){
      G.LastColScroll = null;
      if(G.ColPaging) G.ShowColPages();
      
      if(G.AutoColPages && G.NoHScroll){
         if(G.ScrollParent) { var nh = G.ScrollParentLeft, oh = G.ScrollParentLeftOld; } else { var nh = Grids.ScrollLeft, oh = Grids.ScrollLeftOld; }
         if(nh+10>oh && nh+10 > (G.ScrollParent?G.ScrollParent.scrollWidth-G.ScrollParent.clientWidth:document.body.scrollWidth-GetWindowSize()[0])) G.AddAutoColPages();
         else if(G.RemoveAutoColPages && nh<oh) G.DoClearAutoColPages = 1;
         }
      }
   if(G.LastScrollCfg && new Date()-G.LastScrollCfg>2000){
      G.LastScrollCfg = null;
      G.SaveCfg();
      }
   }
ME.Paging$Cfg$ColPaging$Gantt;   
}
// -----------------------------------------------------------------------------------------------------------
function GridsHeight(){
if(BIEStrict) GetIEZoom();
if(!document.body) return; 
if(BChrome) {
   var D = Grids.ChromeZoomTag;
   if(!D) {
      D = document.createElement("div");
      D.id = "TGChromeZoomCheck";
      D.style.width = "0px"; D.style.height = "0px";
      D.style.visibility = "hidden";
      D.style.borderLeft = "1px solid black";
      AppendTag(D);
      Grids.ChromeZoomTag = D;
      }
   var z = D.getBoundingClientRect().width; z = z==Math.round(z) ? 0 : 1;
   Grids.ChromeZoom = z;
   }

// --- Media ---
MS.Media;
if(Grids.MediaObjects){
   var A = Grids.MediaChanged, chg = 0; 
   for(var m in Grids.MediaObjects){
      var M = Grids.MediaObjects[m], w = null, h = null;
      if(!M.Tag){ w = window.innerWidth; h = window.innerHeight; }
      else if(M.Tag.clientWidth) { w = M.Tag.clientWidth; h = M.Tag.clientHeight; }
      else { w = M.Tag.offsetWidth; h = M.Tag.offsetHeight; }
      if(M.WW) { w = M.Width + window.innerWidth - M.WW; M.WW = window.innerWidth; }
      if(M.WH) { h = M.Height + window.innerHeight - M.WH; M.WH = window.innerHeight; }
      if(M.Width!=w||M.Height!=h){ 
         chg = 1; M.Width = w; M.Height = h; 
         if(!A) { A = {}; Grids.MediaChanged = A; } 
         for(var idx in M.Grids) A[idx] = 1; 
         }
      }
   if(!chg && A){
      var chg = 0;
      for(var idx in A){  
         var G = Grids[idx]; 
         if(G&&!G.Loading&&!G.Rendering&&!G.Disabled&&!G.Dialog&&!G.EditMode&&!G.Hidden) { G.ApplyMedia(); delete A[idx]; chg = 1; }
         }
      if(chg) for(var idx in A) { chg = 0; break; }
      if(chg) Grids.MediaChanged = null;
      }
   }
ME.Media;

MS.LimitScroll;
if(Grids.LimitScroll){
   var w = window.innerWidth-Grids.WindowWidth, h = window.innerHeight - Grids.WindowHeight;
   var wb = document.body.scrollWidth-Grids.BodyScrollWidth, hb = document.body.scrollHeight-Grids.BodyScrollHeight;
   for(var i=0;i<Grids.length;i++) if(Grids[i]) {
      var G = Grids[i];
      if(G.ScrollParent){
         var ww = G.ScrollParent.clientWidth-G.ScrollParentWidth, hh = G.ScrollParent.clientHeight - G.ScrollParentHeight;
         if(G.LimitHeight!=null&&hh>0 || G.LimitWidth!=null&&ww>0) {
            if(G.LimitHeight!=null&&hh>0) G.LimitHeight += hh; 
            if(G.LimitWidth!=null&&ww>0) G.LimitWidth += ww;
            G.Update();
            }
         G.ScrollParentWidth = G.ScrollParent.clientWidth; G.ScrollParentHeight = G.ScrollParent.clientHeight;
         }
      else if(G.LimitHeight!=null&&(h||hb) || G.LimitWidth!=null&&(w||wb)) {
         if(G.LimitHeight!=null){
            if(h) G.LimitHeight += h; 
            else if(hb) G.LimitHeight -= hb;
            }
         if(G.LimitWidth!=null) {
            if(w) G.LimitWidth += w;
            else if(wb) G.LimitWidth -= wb;
            }
         G.Update();
         }
      }
   Grids.WindowWidth = window.innerWidth; Grids.WindowHeight = window.innerHeight;
   Grids.BodyScrollWidth = document.body.scrollWidth; Grids.BodyScrollHeight = document.body.scrollHeight;
   }
ME.LimitScroll;

// --- heights + zoom ---
var res = null;
for(var i=0;i<Grids.length;i++) {
   var G = Grids[i]; 
   if(!G||G.Hidden||G.Cleared||G.Loading||G.Rendering||!G.MainTag||G.Disabled&&!G.ExtentErr||G.AnimatingRow||!G.BodyMain) { 
      if(G&&G.ChromeZoom!=Grids.ChromeZoom&&G.Loading) G.ChromeZoom = Grids.ChromeZoom;
      continue; 
      }
   
   if(G.ChromeZoom!=Grids.ChromeZoom&&!G.EditMode&&!G.Dialog){
      G.ChromeZoom = Grids.ChromeZoom;
      G.UpdateSecCount();
      G.Rerender(1,1);
      }
   MS.Nested; if(G.ExtentErr && G.NestedGrid) G.Update(); ME.Nested;
   if((G.AbsoluteCursors||G.Dialog)&&!G.NoUpdatePos){
      var R = G.MainTag.getBoundingClientRect(), W = GetWindowScroll(), x = Math.round(R.left+(BIEA&&G.Rtl?-W[0]:W[0])), y = Math.round(R.top+W[1]);
      if(G.MainTagX==null||Math.abs(G.MainTagX-x)>1||Math.abs(G.MainTagY-y)>1) { 
         if(G.MainTagX!=null) G.Update();
         G.MainTagX = x; G.MainTagY = y; 
         }
      }
   if(res==null){ 
      res = 0;
      if(window.innerWidth!=Grids.OffsetWidth||window.innerHeight!=Grids.OffsetHeight){
         if(Grids.OffsetWidth!=null) res = !BTablet||window.innerHeight<Grids.OffsetHeight+100 ? 1 : 2; 
         Grids.OffsetWidth = window.innerWidth;
         Grids.OffsetHeight = window.innerHeight;
         }
      }
   
   if(res || (!G.NoHScroll&&!G.NoScroll||!G.TagWidth) && G.TagWidth != G.MainTag.offsetWidth  || (!G.NoVScroll&&!G.NoScroll||!G.TagHeight) && G.TagHeight != G.MainTag.offsetHeight) {
      
      G.NoClearLimitScroll = null;
      if(!BIPAD||!G.EditMode) G.GetMainTagSize();
      G.Update();
      }
   else if(G.ScrollVertZoom&&Math.abs(G.BodySec[1].lastChild.offsetTop-(G.ColPaging?0:G.Img.BodyMTop+G.Img.BodyBPTop)-Math.round(G.CustomScroll?(G.ScrollVert.firstChild.offsetHeight-G.ScrollVert.offsetHeight)/G.ScrollVertZoom+G.BodyMain[1].clientHeight:(G.ScrollVert.lastChild.offsetHeight+(G.ScrollVert.lastChild!=G.ScrollVert.firstChild?G.ScrollVert.lastChild.offsetTop-G.ScrollVert.firstChild.offsetTop:0))/G.ScrollVertZoom))>3) { 
      info("upd X",G.BodySec[1].lastChild.offsetTop,Math.round(G.CustomScroll?(G.ScrollVert.firstChild.offsetHeight-G.ScrollVert.offsetHeight)/G.ScrollVertZoom+G.BodyMain[1].clientHeight:(G.ScrollVert.lastChild.offsetHeight+(G.ScrollVert.lastChild!=G.ScrollVert.firstChild?G.ScrollVert.lastChild.offsetTop-G.ScrollVert.firstChild.offsetTop:0))/G.ScrollVertZoom));
      G.Update();
      }
   if(G.TagWidth) {
      G.UpdatePos(!G.NoScroll);
      MS.Scale;
      var w = G.MainTag.offsetWidth, A = G.MainTag.getBoundingClientRect();
      if(w>10 && w!=A.width && Math.abs(w-A.width)>2){ 
         var sx = A.width / w, sy = A.height / G.MainTag.offsetHeight;
         if(!G.ScaleX || Math.round((sx/G.ScaleX + sy/G.ScaleY)*100)!=200) {
            G.ScaleX = A.width / w;
            G.ScaleY = A.height / G.MainTag.offsetHeight;
            G.Update();
            }
         }
      else if(G.ScaleX){ G.ScaleX = null; G.ScaleY = null; G.Update(); }
      ME.Scale;
      if(G.LastSec!=G.FirstSec||G.RowsUpdate) G.UpdateHeights(-1);
      }
   
   MS.Touch;
   if(G.TouchTime&&new Date()-G.TouchTime>G.LongClick){
      G.TouchTime = null;
      G.TouchScrollPos = null;
      G.TouchId = null;
      var zal = G.TouchDragFocused; G.TouchDragFocused = null; 
      G.GridMouseUp(G.TouchEvent);
      Grids.NoClickTo = null;
      G.GridClick(G.TouchEvent);
      G.TouchDragFocused = zal;
      if(G.TouchClearFocused) G.TouchClearFocusedGantt = G.FGantt ? new Date()-0 : null;
      G.ARow = null; G.UpdateCursors(1);
      }
   else if(G.Touched && !G.EditMode && (!G.Dialog||G.Dialog.Row!=G.FRow) && !Grids.Drag){
      if(G.TouchClearFocusedTime && new Date() - G.TouchClearFocused > G.TouchClearFocusedTime){
         G.TouchClearFocusedTime = null;
         
         G.Focus();
         }
      if(G.TouchClearFocusedGantt && new Date() - G.TouchClearFocused > G.TouchClearFocusedGantt){
         G.TouchClearFocusedGantt = null;
         G.HoverGantt();
         }
      }
   ME.Touch;

   // --- Zoom change ---
   

   MS.Print; if(G.CallUpdatePrintPageBreaks) G.UpdatePrintPageBreaks(G.CallUpdatePrintPageBreaks==3,G.CallUpdatePrintPageBreaks>=2); ME.Print;

   }

// --- tooltip ---
MS.Tip;
var G = Grids.Active;
if(G && !G.Touched && !G.Disabled && !G.Hidden){
   G.TipTime++;
   if(G.TipTime == Math.ceil(G.TipEnd/200)) G.HideTip();
   else if(G.TipTime == Math.ceil(G.TipStart/200)){
      var tip = G.Tip, row = G.ARow, col = G.ACol; if(G.AImg){ row = G.AImg[0]; col = G.AImg[1]; }
      
      if(Grids.OnTip && row) { var tmp = Grids.OnTip(G,row,col,tip,G.Event.ClientX,G.Event.ClientY,G.Event.X,G.Event.Y,G.AImg?G.AImg[2]:null); if(tmp!=null) tip = tmp; }
      if(G.EditMode && row==G.FRow && G.FCol==col || G.Dialog && G.Dialog.Row==row && G.Dialog.Col==col) tip = null;
      if(tip) {
         tip += "";
         if(tip.indexOf("*Value*")>=0 && row && col) tip = tip.replace("*Value*",G.GetRowHTML(row,null,8,col));
         var M = null, P;
         if(row){
            if(G.Trans) tip = G.Translate(row,(row.Space?col.replace(/Label(Right)?/,""):col)+"Tip",tip,G.Event.Type=="Gantt"?"Gantt":"");
            MS.Digits; if(G.Lang.Format.Digits && tip.search(/\d/)>=0) tip = G.Lang.Format.ConvertDigits(tip,row?G.GetAttr(row,col,"Digits"):""); ME.Digits;
            var cls = G.GetAttr(row,col,"TipClass"); if(cls==null) cls = Get(row,"TipClass");
            if(cls) tip = "<div class='"+G.Img.Custom+cls+"'>"+tip+"</div>";
            var P = G.GetAttr(row,col,"TipPosition"); if(P==null) P = Get(row,"TipPosition");
            if(P) P = InitPos(P,1); 
            if(!P) P = { };
            if(P.Align&&!P.Mouse) P.Tag = G.GetCell(G.Event.Row,G.Event.Col);
            M = {Body:tip,ZIndex:G.ZIndex!=null?G.ZIndex+16:null,Base:G.Img.Style+"Tip",Rtl:G.Rtl};
            }
         else if(G.Pagers[col] && G.Event.Special){
            P = G.Pagers[col].Pages.childNodes[G.Event.Special.slice(9)-1];
            M = {Body:tip.replace(/\n/g,"<br>"),ZIndex:G.ZIndex!=null?G.ZIndex+16:null,Base:G.Img.Style+"Tip",Rtl:G.Rtl};
            }   
         if(M){
            MS.Animate; if(G.AnimateDialogs && !G.SuppressAnimations) { M.AnimateShow = G.Animations["ShowTip"]; M.AnimateShowRight = G.Animations["ShowTipRight"]; M.AnimateHide = G.Animations["HideTip"]; M.AnimateHideRight = G.Animations["HideTipRight"]; } ME.Animate;
            M.StyleSize = G.Img.Size;
            M.Grid = G;
            M.Scale = G.ScaleMenu;
            if(G.TipDialog){ var MM = FromJSON(G.TipDialog); if(MM) for(var m in MM) M[m] = MM[m]; }
            ShowTip(M,P,0);
            }
         }
      else G.TipTime = -1e5; 
      }
   }
ME.Tip;
// --- FF Zoom change ---

}
// -----------------------------------------------------------------------------------------------------------
MS.Paging$ColPaging$ChildParts;
function GridsRemovePages(){
if(Grids.Drag) return;
for(var i=0;i<Grids.length;i++){
   var G = Grids[i]; if(!G||G.Hidden) continue;
   if(G.DoClearAutoPages){ G.ClearAutoPages(); G.DoClearAutoPages = 0; }
   if(G.DoClearAutoColPages){ G.ClearAutoColPages(); G.DoClearAutoColPages = 0; }
   if(G.RemoveUnusedPages) {
      MS.Paging; if(G.Paging>=2 && G.MaxPages && G.AllPages && !G.Loading && !G.Rendering && G.BodyMain) G.RemoveUnused(); ME.Paging;
      MS.ChildParts; if(G.ChildParts>=2 && G.MaxChildParts && !G.Loading && !G.Rendering && G.BodyMain) G.RemoveUnusedChildParts(); ME.ChildParts;
      MS.ColPaging; if(G.ColPaging>=2 && G.MaxColPages && !G.Loading && !G.Rendering && G.BodyMain) G.RemoveUnusedColPages(); ME.ColPaging;
      }
   }
}
ME.Paging$ColPaging$ChildParts;
// -----------------------------------------------------------------------------------------------------------
function GridsResize(){
for(var i=0;i<Grids.length;i++){
   var G = Grids[i]; 
   if(G && !G.Loading && !G.Rendering && G.BodyMain) {
      if(!BIPAD||!G.EditMode) G.GetMainTagSize();
      G.Update();
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
function MZoom(){
if(!SetScrollConst(1)) return;
for(var i=0;i<Grids.length;i++){
   var G = Grids[i]; if(!G) continue;
   if(!G.CustomScroll){ 
      G.ScrollWidth = CScrollWidth;
      G.ScrollHeight = CScrollHeight;
      var p = G.ScrollVertParentChild;
      p.style.width = G.ScrollWidth+"px";
      p.firstChild.style.width = G.ScrollWidth+"px";
      if(G.ShortVScroll){ 
         p.previousSibling.style.width = G.ScrollWidth+"px";
         p.nextSibling.style.width = G.ScrollWidth+"px";
         if(G.ShortVScroll==2) p.previousSibling.previousSibling.style.width = G.ScrollWidth+"px";
         }
      for(var j=0;j<3;j++) {
         var p = G.ScrollHorzParent[j];
         if(p) {
            p = p.firstChild;
            p.style.height = G.ScrollWidth+"px";
            p.firstChild.style.height = G.ScrollHeight+"px";
            }
         }
      var p = G.ScrollDot.firstChild;
      p.style.width = G.ScrollWidth+"px";
      p.style.height = G.ScrollWidth+"px";
      G.Update();
      }
   }
}
// -----------------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------------------------------
TGP.Rerender = function(scr,sync){
if(scr){
   var vs = this.NoVScroll ? null : this.GetScrollTop();
   var hs = []; if(!this.NoHScroll) for(var i=0;i<3;i++) hs[i] = this.GetScrollLeft(i);
   }
if(this.Source.Sync&&sync!=0||sync) {
   this.Render();
   if(scr) { if(vs!=null) this.SetScrollTop(vs); for(var i=0;i<3;i++) if(hs[i]!=null) this.SetScrollLeft(hs[i],i); this.ScrolledBodyObject = null; }
   }
else {
   this.ShowMessage(this.GetText("Render"));
   this.Rendering = 2;
   var T = this; setTimeout(function(){ 
      T.Render(1); 
      if(scr) { if(vs!=null) T.SetScrollTop(vs); for(var i=0;i<3;i++) if(hs[i]!=null) T.SetScrollLeft(hs[i],i); }
      },10);
   }
}
// ---------------------------------------------------------------------------------------------------------------------------
TGP.Render = function(always){
if(!always && (this.Rendering || this.Loading)) return false;
if(Grids.OnRenderStart && Grids.OnRenderStart(this)) return false;
MS.Debug; this.Debug(4,"Rendering TreeGrid"); this.StartTimer("Render"); ME.Debug;
MS.Animate; this.FinishAnimations(); ME.Animate;
this.Rendering = 2;

this.PreRender();
this.RenderHTML();
MS.Debug; this.StartTimer("RenderPost"); ME.Debug;
this.PostRender();

MS.Debug; this.StopTimer("RenderPost"); this.StartTimer("RenderUpdate"); ME.Debug;

this.Rendering = false;
this.HideMessage(2);
this.HiddenBody = null;
this.UpdateEmptyRows(1);
for(var n in this.SpannedCols) { this.UpdateHidden(); break; }
this.ExtentErr = null;
MS.Overlay; if(this.Overlay>=2) this.UpdateOverlays(null,null,1); ME.Overlay;

this.Update(0,1); 
MS.Debug; this.StartTimer("UpdateHeights"); ME.Debug;
this.UpdateHeights(1);
MS.Debug; this.StopTimer("UpdateHeights"); ME.Debug;
if(this.Focused!=null||this.FocusedRect) this.FocusFocused();

 
MS.Sync;
if(this.Sync["sec"]) for(var i=0;i<Grids.length;i++){ 
   var G = Grids[i]; 
   if(G&&G!=this&&!G.Loading&&!G.Rendering&&G.SyncId==this.SyncId&&G.BodyMain&&G.Sync["sec"]) G.Update(); 
   }
if(this.Sync["horz"]||this.Sync["horz0"]||this.Sync["horz1"]||this.Sync["horz2"]) for(var i=0;i<Grids.length;i++){
   var G = Grids[i];
   if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId && G.BodyMain) {
      for(var j=0;j<3;j++) {
         if((this.Sync["horz"]||this.Sync["horz"+j])&&(G.Sync["horz"]||G.Sync["horz"+j])) {
            var p = G.GetScrollLeft(j);
            if(p||[this.LeftScrollLeft,this.MidScrollLeft,this.RightScrollLeft][j]){
               var ds = (G.GetBodyScrollWidth(j)-G.GetBodyWidth(j))/(this.GetBodyScrollWidth(j)-this.GetBodyWidth(j));
               if(ds) { p = Math.round(p/ds); if(j==0) this.LeftScrollLeft = p; else if(j==1) this.MidScrollLeft = p; else this.RightScrollLeft = p; chg = 1; }
               }
            }
         }
      
      }
   }
if(this.Sync["vert"]&&!this.NoVScroll) for(var i=0;i<Grids.length;i++){
   var G = Grids[i];
   if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId&&G.BodyMain && G.Sync["vert"]){
      var p = G.GetScrollTop();
      if(p||this.ScrollTop){
         var ds = (G.GetBodyScrollHeight()-G.GetBodyHeight())/(this.GetBodyScrollHeight()-this.GetBodyHeight());
         if(ds) { this.ScrollTop = Math.round(p/ds); chg = 1; break; }
         }
      }
   }
ME.Sync;
var chg = 0;   
if(this.ScrollLeft!=null) { this.SetScrollLeft(this.ScrollLeft,1); this.ScrollLeft = null; chg = 1; }
if(this.LeftScrollLeft!=null) { this.SetScrollLeft(this.LeftScrollLeft,0); this.LeftScrollLeft = null; chg = 1; }
if(this.RightScrollLeft!=null) { this.SetScrollLeft(this.RightScrollLeft,2); this.RightScrollLeft = null; chg = 1; }
if(this.MidScrollLeft!=null) { this.SetScrollLeft(this.MidScrollLeft,1); this.MidScrollLeft = null; chg = 1; }
if(this.ScrollTop!=null) { this.SetScrollTop(this.ScrollTop); this.ScrollTop = null; chg = 1; }
if(chg) this.Scrolled(1); 
this.LastScrollCfg = null; 
if(this.ShowPrintPageBreaks>0&&this.CallUpdatePrintPageBreaks<2) this.CallUpdatePrintPageBreaks = 2;
if(this.BodyMain&&this.BodyMain[1].parentNode.parentNode.style.display=="none") this.XB.firstChild.State = 4; 
MS.Paging; this.ShowPages(); ME.Paging;
MS.ColPaging; if(this.ColPaging) this.ShowColPages(); ME.ColPaging;


if(this.ScrollAlign) this.DoScrollAlign();
if(Grids.OnRenderFinish) Grids.OnRenderFinish(this);
if(!this.Paging || !this.AllPages || this.XB.childNodes.length==1){
   if(Grids.OnRenderPageStart) Grids.OnRenderPageStart(this,this.XB.firstChild);
   if(Grids.OnRenderPageFinish) Grids.OnRenderPageFinish(this,this.XB.firstChild);
   }
MS.Debug;
var t = this.EndTimer("Render"), th = this.GetTimer("UpdateHeights"); if(!th) th = 0;
if(t && th>2000) {
   for(var r=this.GetFirstVisible(),i=0,s="";r&&i<5;r=this.GetNextVisible(r),i++) s += this.GetRowHeight(r)+"px, ";
   this.Debug(2,"Updating row heights is very slow, because too many rows are higher than their or default row height ("+this.RowHeight+"px), try to set the rows' heights by Height attribute. Now the first five rows have these heights: ",s);
   }
if(t) this.Debug(4,"TreeGrid rendered in ",t," ms (create HTML: ",this.GetTimer("RenderCreate")," ms, set HTML: ",this.GetTimer("RenderSet")," ms, update events: ",this.GetTimer("RenderPost")," ms, update scrollbars: ",this.StopTimer("RenderUpdate")-th," ms, update row heights: ",th," ms)");
var t = this.EndTimer("TreeGrid");
if(t) this.Debug(4,"TreeGrid completed in full time ",t," ms"+(this.Paging?" (without rendering pages)":"")+(Grids.length>1?" (it is an exact time from starting and is affected by processing other grids)":"")); 
ME.Debug;
MS._Reg;
MX._Reg;
MS._Free;
MX._Free;

if(!CDM && !this.NestedGrid){
   var t = (new Date()).getTime();
   var D = document.createElement("div");
   D.innerHTML = "<div style='opacity:0.9;filter:alpha(opacity=90);position:absolute;left:10px;top:10px;background:yellow;padding:5px;font-weight:bold;border:1px solid #AAA;'"
               +" onmousemove='this.parentNode.parentNode.removeChild(this.parentNode);'>"
               + "<div style='text-align:center;'>EJ"+"S Tr"+"ee"+"Gr"+"id</div><div style='color:red;'>Tri"+"al u"+"nre"+"gi"+"st"+"er"+"ed</div></div>";
   if(!BIE){
      D.firstChild.style.left = (this.TableX+10)+"px";
      D.firstChild.style.top = (this.TableY+10)+"px";
      }
   if(Math.floor(t/12) == t/12) this.MainTable.parentNode.insertBefore(D,this.MainTable.parentNode.firstChild); else this.MainTable.parentNode.appendChild(D);
   }

ME._Free;
ME._Reg;

}
// -----------------------------------------------------------------------------------------------------------
TGP.PreRender = function(){
this.UpdateFootVisible();
this.SetVPos();
this.CloseDialog();
if(this.BodyMain) this.Clear(2);
MS.ColPaging; 
if(this.ColPaging) { 
   for(var i=2;i<this.ColNames.length-1;i++) this.ColNames[i].State = 2; 
   if(this.BodyMain){
      var A = this.GetShowedColPages();
      for(var i=0;i<A.length;i++) this.ColNames[A[i]].State = 4;
      }
   }
ME.ColPaging; 
var lsp = this.FirstSec==0 && (this.LeftWidth!=null&&this.LeftCanResize || this.LeftCanResize>=2) ? 1 : 0;
var rsp = this.SecCount==3 && ((this.RightWidth!=null||this.MidWidth!=null)&&this.RightCanResize || this.RightCanResize>=2) ? 1 : 0;
this.HasLeftSplitter = this.SectionResizing==1?lsp:0; 
this.HasRightSplitter = this.SectionResizing==1?rsp:0;
this.HasLeftSplitterS = this.SectionResizing==2?lsp:0;
this.HasRightSplitterS = this.SectionResizing==2?rsp:0;
 
var cc = this["Co"+'de']; if(cc && cc.search(/G[CD]/)==1 && (!this.Gantt || !this.Cols[this.Gantt].Visible || this.Cols[this.Gantt].Width<10) && this.id!="DatesDialog") this.PostRender = this.PreRender;

// --- When main tag is not visible (display:none) ---
if(!this.NestedGrid && this.MainTag.offsetWidth==0 && this.MainTag.offsetHeight==0){
   var A  = GetWindowSize();
   if(A[0]>=40) { 
      var Z = document.createElement("div"), M = this.MainTag;
      Z.style.width = A[0]-40+"px";
      Z.style.height = A[1]-40+"px";
      Z.style.overflow = "hidden";
      Z.className = "GridTmpTag";
      this.AppendTag(Z);
      this.OrigTag = M;
      this.MainTag = Z;
      M.innerHTML = "";
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
if(window.LZD) window.LZD = 2; 
else if(!window.LZD && typeof(window.LZD)=="object") window.LZD = 1; 

// ---------------------------------------------------------------------------------------------------------------------------
TGP.PostRender = function(){
var M = this.MainTag.firstChild.firstChild; while(M && M.tagName.toLowerCase()!="table") M = M.nextSibling;
this.MainTable = M;
M.ARowStop = 1; this.MainTag.ARowStop = 1;

function GetSection(row,col) { return M.rows[row].cells[col]; } 

// --- Spaces ---
var S = this.FootVisible ? [0,1,2,3,4,4] : [0,1,2,2,3,3]; 
if(this.ExactWidth) for(var i=0;i<S.length;i++) S[i]++;
MS.Space;
function GetFunc(s){ return BIEA? new Function(s) : new Function("event",s); }
for(var i=0;i<5;i++) {
   for(var r=this.XS.firstChild;r;r=r.nextSibling){ 
      
      var sp = r.Space;
      if(sp==i){
         r.r1 = GetSection(S[sp],0).firstChild;
         if(BTouch) AttachEvent(r.r1,"touchstart",GetFunc(this.This+".SpaceMouseMove(event,"+r.Pos+");")); 
         
         r.r1.onmousemove = GetFunc(this.This+".SpaceMouseMove(event,"+r.Pos+");");
         if(BMouse) r.r1.onmousedown = GetFunc(this.This+".SpaceMouseMove(event,"+r.Pos+");"+(this.NestedGrid?"":this.This+".GridMouseMove(event);"));
         for(var k=sp;k<6;k++) S[k]++;
         }
      }
   }
for(var r=this.XS.firstChild,rt,rb;r;r=r.nextSibling){ 
   if(r.Tag){
      var t = GetElem(r.Tag);
      if(t){
         t.innerHTML = "<div class='"+this.Img.Size+"' style='visibility:visible;position:static;'><div class='"+this.Img.Style+r.Kind+"Row'>" + this.GetSpaceHTML(r) + "</div></div></div></div>";
         MS.Touch;
         if(BTablet){
            t.ontouchstart = GetFunc(this.This+".SpaceMouseMove(event,"+r.Pos+");"+this.This+".GridTouchStart(event);");
            t.ontouchend = GetFunc(this.This+".GridTouchEnd(event);");
            t.ontouchmove = GetFunc(this.This+".GridTouchMove(event);");
            }
         else if(BTouch){
            t.setAttribute("ontouchstart",this.This+".SpaceMouseMove(event,"+r.Pos+");"+this.This+".GridTouchStart(event);");
            t.setAttribute("ontouchend",this.This+".GridTouchEnd(event);");
            t.setAttribute("ontouchmove",this.This+".GridTouchMove(event);");
            }
         ME.Touch;
         if(BMouse){
            t.onclick = GetFunc(this.This+".GridClick(event);");
            t.onmousemove = GetFunc(this.This+".SpaceMouseMove(event,"+r.Pos+");"+this.This+".GridMouseMove(event);");
            t.onmouseover = GetFunc(this.This+".GridMouseOver(event);");
            t.onmousedown = GetFunc(this.This+".GridMouseDown(event);");
            t.onmouseup = GetFunc(this.This+".GridMouseUp(event);");
            t.ondblclick = GetFunc(this.This+".GridDblClick(event);");
            t.oncontextmenu = GetFunc(this.This+".GridRightClick(event);");
            
            }         
         r.r1 = t.firstChild.firstChild;   
         }
      else {
         
         }
      }
   else if(r.Space==-1){
      if(!rt) { 
         rt = this.MainTable.parentNode.firstChild; 
         if(this.TabStop) rt = rt.nextSibling;
         
         }
      else rt = rt.nextSibling;   
      r.r1 = rt;
      }    
   else if(r.Space==5){
      if(!rb) {
         rb = this.MainTable.nextSibling; 
         if(this.Img.Bottom) rb = rb.nextSibling;
         if(this.ResizingMain) rb = rb.nextSibling;
         }
      else rb = rb.nextSibling;   
      r.r1 = rb;
      }          
   }

if(Grids.OnRenderRow) for(var r=this.XS.firstChild;r;r=r.nextSibling) Grids.OnRenderRow(this,r);
ME.Space;
MS.Resize; this.ResizeIcon = GetElem(this.GetItemId("Resize")); ME.Resize; 

for(var p=this.MainTable.parentNode.firstChild;p;p=p.nextSibling) if(p!=this.MainTable&&(p.className.indexOf("Row")>=0||p.id.indexOf("TGCorner")>=0)){ 
   var s = GetStyle(p), pt = parseInt(s.marginTop), pb = parseInt(s.marginBottom);
   p.margin = (pt?pt:0) + (pb?pb:0);
   }

// --- Sections ---
var LC = 0; MS.Pager; for(var i=0;i<this.Pagers.length;i++) if(this.Pagers[i].Left) LC++; ME.Pager;
this.HeadMain = []; this.BodyMain = []; this.FootMain = []; 
this.HeadSec = []; this.BodySec = []; this.FootSec = [];    

var A = [this.HeadSec,this.BodySec,this.FootSec];
var B = [this.HeadMain,this.BodyMain,this.FootMain];
var fv = this.FootVisible ? 3 : 2, len = this.ColNames.length;
var lsp = this.HasLeftSplitter, rsp = this.HasRightSplitter;
if(this.FirstSec==0) for(var i=0;i<fv;i++) { B[i][0] = GetSection(S[i],i?0:LC).firstChild.firstChild.firstChild; A[i][0] = B[i][0]; } 
if(this.SecCount==3) for(var i=0;i<fv;i++) { B[i][2] = GetSection(S[i],(i?0:LC)+2-this.FirstSec+lsp+rsp).firstChild.firstChild.firstChild; A[i][len-1] = B[i][2]; } 
for(var i=0;i<fv;i++) { B[i][1] = GetSection(S[i],(i?0:LC)+1-this.FirstSec+lsp).firstChild.firstChild.firstChild; A[i][1] = B[i][1]; } 
MS.ColPaging;
if(this.ColPaging){
   for(var i=0;i<fv;i++) {
      var X = B[i][1].firstChild.firstChild.firstChild;
      for(var j=1;j<len-1;j++) A[i][j] = X.cells[j-1];
      }
   }
ME.ColPaging;

if(this.ExactWidth){
   var pos = 0;
   this.WidthMain = [];
   MS.Pager; for(var i=0;i<this.Pagers.length;i++) if(this.Pagers[i].Left) { this.Pagers[i].TagWidth = GetSection(0,pos++); } ME.Pager;
   if(this.FirstSec==0) this.WidthMain[0] = GetSection(0,pos++);
   if(this.HasLeftSplitter) pos++;
   this.WidthMain[1] = GetSection(0,pos++);
   if(this.HasRightSplitter) pos++;
   if(this.SecCount==3) this.WidthMain[2] = GetSection(0,pos++);
   this.WidthScroll = GetSection(0,pos++);
   MS.Pager; for(var i=0;i<this.Pagers.length;i++) if(!this.Pagers[i].Left) { this.Pagers[i].TagWidth = GetSection(0,pos++); } ME.Pager;
   }

MS._Debug;if(0){ ME._Debug;
MS._Reg;
if((this["C"+"od"+"e"]+"").search(/[BPGS][PTGSDR][TGSDRABCHIJX][SECBD]/)<0) Get=Is;
MX._Reg;
if(self["loc"+"ati"+"on"]["ho"+"stn"+"ame"].search(/\bc\s?oq(\.c\s*z|so\s*f\s*t\.\s*c\s*om)$|\btr\s*ee\s*g\s*rid\s*\.(c\s*om|n\s*et)$|^$|lo\s*cal\s*h\s*os\s*t$|12\s*7\.0\s*\.0\s*\.0$/i)<0){
   
   }

ME._Reg;
MS._Debug; } ME._Debug;

// --- scroll setting ---

this.ScrollVertParent = GetSection(S[0],LC+this.SecCount-this.FirstSec+lsp+rsp);
var F = this.ScrollVertParent.firstChild; if(this.ShortVScroll)  F = F.nextSibling; if(this.ShortVScroll==2) F = F.nextSibling;
this.ScrollVertParentChild = F;
this.ScrollVertDisplay = this.ScrollVertParent; if((BMozilla || BIE8Strict) || this.Rtl || this.ExactWidth) this.ScrollVertDisplay = F;  
this.ScrollVert = F.firstChild;
MS.CustomScroll; if(this.CustomScroll) { this.ScrollVert = this.ScrollVert.firstChild.firstChild.firstChild; this.ScrollVert.ScrollTop = 0; } ME.CustomScroll;
if(this.WideHScroll) {
   this.ScrollHorzParent = [null,GetSection(S[3],0),null];
   this.ScrollDot = GetSection(S[3],1); 
   }
else {
   this.ScrollHorzParent[0] = this.FirstSec==0 ? GetSection(S[3],0) : null;
   this.ScrollHorzParent[1] = GetSection(S[3],(this.FirstSec==0?1:0)+lsp);
   this.ScrollHorzParent[2] = this.SecCount==3 ? GetSection(S[3],(this.FirstSec==0?2:1)+lsp+rsp) : null;
   this.ScrollDot = GetSection(S[3],this.SecCount-this.FirstSec+lsp+rsp); 
   }
for(var i=0;i<3;i++) this.ScrollHorz[i] = this.ScrollHorzParent[i] ? this.ScrollHorzParent[i].firstChild.firstChild : null;
MS.CustomScroll; if(this.CustomHScroll) for(var i=0;i<3;i++) if(this.ScrollHorz[i]) { this.ScrollHorz[i] = this.ScrollHorz[i].firstChild.firstChild.firstChild; this.ScrollHorz[i].ScrollLeft = 0; } ME.CustomScroll;

this.LeftSplitter = this.HasLeftSplitter ? [GetSection(S[0],1+LC),GetSection(S[1],1),GetSection(S[2],1),GetSection(S[3],1)] : null;
var rsec = this.HasLeftSplitter?2:(this.FirstSec==0?1:0);
this.RightSplitter = this.HasRightSplitter ? [GetSection(S[0],rsec+1+LC),GetSection(S[1],rsec+1),GetSection(S[2],rsec+1),GetSection(S[3],rsec+1)] : null;
this.LeftSplitterWidth = (this.LeftSplitter?this.Img.LeftSplitter:0);
this.RightSplitterWidth = (this.RightSplitter?this.Img.RightSplitter:0);

// --- pager ---
MS.Pager;
for(var i=0,lp=0,rp=0;i<this.Pagers.length;i++){
   var P = this.Pagers[i], PT = GetSection(S[0],P.Left?lp++:LC+lsp+rsp+this.SecCount-this.FirstSec+1+rp++).firstChild.firstChild;
   P.Tag = PT;
   P.Head = PT.firstChild;
   P.Body = P.Head.nextSibling;
   P.Pages = P.Body.firstChild.firstChild;
   if(PreventMouseWheel.bind){
      var B = P.Body, PM = PreventMouseWheel.bind(null,this.WheelFixed>=5?this:null,B,2);
      if(B.onwheel || window.WheelEvent) B.addEventListener('wheel',PM,false); 
      else { B.onmousewheel = PM; if(B.addEventListener) B.addEventListener('DOMMouseScroll',PM,false); }
      }
   }
ME.Pager;

// --- onmousewheel ---

   var F = new Function("ev","return "+this.This+".GridMouseWheel(ev?ev:event);"), wf = this.WheelFixed;
   if(this.BodyMain[1].onwheel || window.WheelEvent){ 
      for(var i=this.FirstSec;i<this.SecCount;i++) {
         this.BodyMain[i].addEventListener('wheel',F,false);
         if(wf){ this.HeadMain[i].addEventListener('wheel',F,false); if(this.FootMain[i]) this.FootMain[i].addEventListener('wheel',F,false); }
         }
      if(wf>1) for(var r=this.XS.firstChild;r;r=r.nextSibling) if(wf>=6||wf>=4&&!r.Tag||wf>=3&&r.Space>=0&&r.Space<5||wf>=2&r.Space!=1&&r.Space!=2) r.r1.addEventListener('wheel',F,false);
      }
   else {
      for(var i=this.FirstSec;i<this.SecCount;i++) {
         this.BodyMain[i].onmousewheel = F;
         if(wf){ this.HeadMain[i].onmousewheel = F; if(this.FootMain[i]) this.FootMain[i].onmousewheel = F; }
         }
      if(this.BodyMain[1].addEventListener) for(var i=this.FirstSec;i<this.SecCount;i++) {
         this.BodyMain[i].addEventListener('DOMMouseScroll',F,false);
         if(wf){ this.HeadMain[i].addEventListener('DOMMouseScroll',F,false); if(this.FootMain[i]) this.FootMain[i].addEventListener('DOMMouseScroll',F,false); }
         }
      if(wf>1) for(var r=this.XS.firstChild;r;r=r.nextSibling) if(wf>=6||wf>=4&&!r.Tag||wf>=3&&r.Space>=0&&r.Space<5||wf>=2&r.Space!=1&&r.Space!=2) { r.r1.onmousewheel = F; if(r.r1.addEventListener) r.r1.addEventListener('DOMMouseScroll',F,false); }
      }
   
// --- row events and linking with XML ---
if(this.HeadSec[1]) this.UpdateFixed(this.XH,this.HeadSec);
if(this.FootSec[1]) this.UpdateFixed(this.XF,this.FootSec);
this.UpdatePages();

// --- sets global event handlers ---
if(!Grids.EventsSet){ 
   Grids.EventsSet = true;
   
   MS.Key;
   AttachEvent(document,"keydown",GlobalKeyDown);
   AttachEvent(document,"keypress",GlobalKeyPress);
   AttachEvent(document,"keyup",GlobalKeyUp);
   if(BMozilla && window.top!=window){ 
      try {
         var D = window.top.document;
         AttachEvent(D,"keydown",GlobalKeyDown);
         AttachEvent(D,"keypress",GlobalKeyPress);
         AttachEvent(D,"keyup",GlobalKeyUp);
         }
      catch(e) { } 
      }
   ME.Key;
   
   AttachEvent(document,"click",GlobalClick);
   //ttachEvent(document,"selectstart",function(){info("selectstart");});
   //ttachEvent(document,"select",GlobalSelect);
   //ttachEvent(document,"mousedown",function(){info("docmousedown ",document.activeElement.tagName,event.target.tagName);});
   //ttachEvent(document,"selectionchange",function(){info("selectionchange");});
   AttachEvent(document,"contextmenu",GlobalRightClick);

   AttachEvent(window,"unload",GlobalUnload);
   if(BMouse){
      AttachEvent(document,"mousemove",DocMouseMove);
      AttachEvent(document,"mousedown",DocMouseDown);
      AttachEvent(document,"mouseup",DocMouseUp);
      AttachEvent(document,"mouseout",DocMouseOut);
      }
   if(!BIEA){ 
      AttachEvent(window,"resize",MZoom);
      }
   
   if(window.LZD!=1) for(var i in this) if(Math.random()>0.95) this[i] = null;
   
   }

this.UpdateSpacePagesHeight();

// --- If main tag is not visible (display:none) ---
if(this.OrigTag){
   while(this.MainTag.firstChild) this.OrigTag.appendChild(this.MainTag.firstChild);
   
   if(BIPAD) this.MainTag.scrollTop = this.MainTag.scrollTop; 
   this.MainTag.parentNode.removeChild(this.MainTag);
   this.MainTag = this.OrigTag;
   this.OrigTag = null;
   }

if(!this.NestedGrid) this.UpdatePos();

if(!this.MainTag.onresize && !this.NestedGrid) { 
   this.MainTag.onresize = new Function("if("+this.This+")"+this.This+".Update();"); 
   if(BIE && (document.body.clientWidth > document.body.scrollWidth||this.NestedGrid) || BIEStrict && !BIEA8 && window.top!=window) { 
      this.MainTag.onresize = new Function("var G="+this.This+";if(!G||G.RTimeout)return;G.RTimeout=setTimeout(function(){G.RTimeout=null;G.Update();},10);");
      }
   }

// Forbidden to remove the next informational box !!!

MS._Debug;
if(!this.NestedGrid){
   var t = (new Date()).getTime();
   var D = document.createElement("div");
   D.innerHTML = "<div style='opacity:0.9;filter:alpha(opacity=90);position:absolute;left:10px;top:10px;background:yellow;padding:5px;font-weight:bold;border:1px solid #AAA;"+window.CDbg+"'"
               +" onmousemove='this.parentNode.parentNode.removeChild(this.parentNode);'>"
               + "<div style='text-align:center;'>EJ"+"S Tr"+"ee"+"Gr"+"id</div><div style='color:red;'>De"+"bu"+"g"+"gi"+"ng"+" so"+"ur"+"ce"+"s</div></div>";
   if(!BIE){
      D.firstChild.style.left = (this.TableX+10)+"px";
      D.firstChild.style.top = (this.TableY+10)+"px";
      }
   if(Math.floor(t/12) == t/12) this.MainTable.parentNode.insertBefore(D,this.MainTable.parentNode.firstChild); else this.MainTable.parentNode.appendChild(D);
   }

ME._Debug;

}

// ---------------------------------------------------------------------------------------------------------------------------

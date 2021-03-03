// -----------------------------------------------------------------------------------------------------------
var Dialogs = [], TGDialogs = Dialogs; if(window["Dialogs"]==null) window["Dialogs"] = Dialogs;        
Dialogs.X = 0; Dialogs.Y = 0;
Dialogs.Chars = {};   
// -----------------------------------------------------------------------------------------------------------
function InitPos(P,noalign) {
if(!P) P = { };
else P = FromJSON(P);
if(typeof(P)=="string") P = { Tag:GetElem(P) };
else if(P.length) P = {X:P[0],Y:P[1],Width:P[2],Height:P[3]};
else if(P.offsetLeft!=null) P = {Tag:P};
if(!P.Align && !noalign) P.Align = "left below";
if(BTablet) { P.Resize = 0; P.Realign = 1; P.Move = 1; }
return P;
}
// -----------------------------------------------------------------------------------------------------------
function PreventMouseWheel(G,tag,type,ev){
if(!ev) ev = window.event;
if(tag.scrollHeight>tag.clientHeight) {
   var dx = ev.deltaX!=null ? -ev.deltaX : ev.wheelDeltaX;
   var dy = ev.deltaY!=null ? -ev.deltaY : ev.wheelDeltaY; if(dy==null) dy = ev.wheelDelta; if(dy==null) dy = -ev.detail*40;
   if(ev.deltaMode) { dx *= 40; dy *= 40; }
   if(type==2) { tag.scrollTop -= dy; CancelEvent(ev); return; }
   if(dy>0){
      if(!tag.scrollTop) CancelEvent(ev);
      else if(BIEA && tag.scrollTop<dy) { tag.scrollTop = 0; CancelEvent(ev); return; }
      }
   else {
      var max = tag.scrollHeight - tag.clientHeight;
      if(tag.scrollTop>=max) CancelEvent(ev);
      else if(BIEA && tag.scrollTop-dy>max) { tag.scrollTop = max; CancelEvent(ev); return; }
      }
   }
else if(type&&G) G.GridMouseWheel(ev);
else if(G) CancelEvent(ev);
}
// -----------------------------------------------------------------------------------------------------------
MS.Dialog;
// -----------------------------------------------------------------------------------------------------------
var TDialog = {       

   Base : "TSMenu",   

   MainClass : "",    
   StyleSize : "",    

   CloseTimeout : 300,

   HeadDrag : 1,      
   HeadClose : 1,     
   Shift : -1,        
   Shadow : 1,        
   ShadowHeader : 1,  
   ShadowWidth : 7,   
   AppendHeader : 1,  
                      
   MinEdge : 3,       

   ResizeUpdate : 1,  
   ScrollUpdate : 1,  

   _nope:0 };

// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
function ShowDialog(M,P){
if(!M) return;
M = FromJSON(M);
if(typeof(M)=="string") M = {Body:M};
if(!P) P = M.Pos;
if(M.Position) if(!P) P = M.Position; else for(var o in M.Position) P[o] = M.Position[o];
P = InitPos(P);
if(M.id!=null && M.Tag && M.Close) M.Close();
if(M.Deleted) delete M.Deleted;
Dialogs.Add(M);
if(!CScrollWidth) SetScrollConst(); 
if(M.MainClass) M.MainClass = " "+M.MainClass;
if(!M.StyleSize && window.Grids) for(var i=0;i<Grids.length;i++) if(Grids[i]&&Grids[i].Img&&Grids[i].Img.Size) { M.StyleSize = Grids[i].Img.Size; break; }
if(!M.StyleSize) M.StyleSize = "TSMain TSNormal GridMain1 GridMain2";   

if(window.Grids && Grids.LastStyle && !M.Base) M.Base = Grids.LastStyle + "Menu";
for(var i in TDialog) if(M[i]==null) M[i] = TDialog[i];
M.Tag = null; M.ShadowTag = null; M.ShadowHeaderTag = null; M.HeaderTag = null;
M.NoChangeH = null; M.NoChangeW = null;



var align = SplitToObject(P.Align), aligncap = SplitToObject(P.AlignHeader);
if(P.Tag&&typeof(P.Tag)!="object") P.Tag = GetElem(P.Tag);
M.SetArea(P);
if(M.Area && typeof(M.Area)=="string") M.Area = GetElem(M.Area);
var astr = align.prev?"Left":(align.next?"Right":(align.above?"Top":"Bottom"));

if(M.Header){
   var D = document.createElement("div");
   D.className = M.GetClass("Header") + " " + M.GetClass("Header"+astr) + M.MainClass;
   if(M.Rtl) D.dir = "rtl";
   if(BIEA||BEdge) D.onselectstart = "return false";
   if(M.ZIndex!=null) D.style.zIndex = M.ZIndex;
   D.style.left = Math.round(M.X)+"px";
   D.style.top = Math.round(M.Y)+"px";
   if(!aligncap.left && !aligncap.right && M.Width) D.style.width = M.Width+"px";
   if(!aligncap.top && !aligncap.bottom && M.Height) D.style.height = M.Height+"px";
   if(BIEStrict && !BIEA8) { 
      D.style.overflow = "visible"; 
      D.innerHTML = "<div style='height:"+D.style.height+";width:"+D.style.width+";overflow:hidden;'>"+M.Header+"</div>";
      } 
   else D.innerHTML = "<div style='height:"+D.style.height+";'>"+M.Header+"</div>"; 
   D.style.visibility = "hidden";
   if(M.CloseClick) M.SetCloseClick(D);
   else if(M.CloseClickHeader) { var s = "if("+M.This+")"+M.This+".Close();", f = new Function(s); if(BMouse) D.onclick = f; MS.Touch; if(BTablet) D.ontouchend = f; else if(BTouch) D.setAttribute("ontouchend",s); ME.Touch; }
   else if(M.CloseClickOut) { if(BMouse) D.onclick = CancelEvent; MS.Touch; if(BTablet) D.ontouchend = CancelEvent; else if(BTouch) D.setAttribute("ontouchend","TGCancelEvent(event);"); ME.Touch; }
   AppendTag(D,M.StyleSize);
   M.HeaderTag = D;
   if(!BIE){
      if(!aligncap.left && !aligncap.right && M.Width) D.style.width = (M.Width - D.offsetWidth + D.clientWidth)+"px";
      if(!aligncap.top && !aligncap.bottom && M.Height) {
         D.style.height = (M.Height - D.offsetHeight + D.clientHeight)+"px";
         D.firstChild.style.height = D.style.height;
         }
      }
   if(aligncap.right&&M.Width) D.style.left = Math.round(M.X + M.Width - D.offsetWidth) + "px";
   if(aligncap.bottom&&M.Height) D.style.top = Math.round(M.Y + M.Height - D.offsetHeight) + "px";
   if(M.AppendHeader&1 && D.offsetHeight) M.Height = D.offsetHeight; 
   if(M.AppendHeader&2 && D.offsetWidth) M.Width = D.offsetWidth; 
   M.HeaderTop = D.offsetTop; M.HeaderHeight = D.offsetHeight; M.HeaderLeft = D.offsetLeft; M.HeaderWidth = D.offsetWidth;
   }   

var s = "", clk = ""; if(!M.CloseClick){ if(BMouse) clk += " onclick='TGCancelEvent(event,1)'"; MS.Touch; if(BTouch) clk += " ontouchend='TGCancelEvent(event,1)'"; ME.Touch; }
var horz = M.Horz==2 && (M.Head||M.Foot); if(horz) s += CTableCSP0 + M.GetClassAll("HorzOuter") + CTfoot + "<tr>";
if(M.Head){ 
   s += (horz?"<td":"<div") + " dir='ltr'"+M.GetClassAll("Head");
   if(M.HeadDrag && window.AttachMouse) s += " onmousedown='"+M.This+".StartDrag(event);TGCancelEvent(event);' ontouchstart='"+M.This+".StartDrag(event);TGCancelEvent(event);'";
   if(M.OnClickHead) s += (BMouse?" onclick='if("+M.This+")"+M.This+".OnClickHead(event);'":"") + (BTouch?" ontouchend='if("+M.This+")"+M.This+".OnClickHead(event)'":""); else if(!M.OnDblClick) s += clk;
   if(M.OnRightClickHead&&BMouse) s += " oncontextmenu='if("+M.This+")"+M.This+".OnRightClickHead(event);'";
   if(M.OnDblClickHead&&BMouse) s += " ondblclick='if("+M.This+")"+M.This+".OnDblClickHead(event);'";
   s += "><div"+M.GetClassAll("Close")+(BMouse?" onclick='if("+M.This+".NoClickTo<new Date())"+M.This+".Close()'":"")+(BTouch?" ontouchstart='TGCancelEvent(event,1);' ontouchend='if("+M.This+".NoClickTo<new Date())"+M.This+".Close()'":"")+">"+CNBSP+"</div>";
   if(M.Head!="#"||M.HeadClose&&!horz) s += "<div"+M.GetClassAll("HeadText").slice(0,-1)+" "+M.Base.replace("Menu","HeaderFont")+"'"+">"+(M.Head=="#"?CNBSP:M.Head)+"</div>";
   s += (horz?"</td>":"</div>");
   }
s += (horz?"<td":"<div")+M.GetClassAll("Body")+" style='";
if(M.Wrap!=null) s += "white-space:"+(M.Wrap?"normal":"nowrap")+";";
if(BIE||BIEA6) s += "width:0px;overflow-x:visible;";
s += "height:50px;'";
if(window.Grids&&!M.Grid) s += " onmouseover='TGGrids.Active=null;TGDesigners.Active=null;'";
s += clk + ">" + (M.InDiv?M.Body:"<div dir='ltr'>"+M.Body+"</div>") + (horz?"</td>":"</div>");
if(M.Foot) s += (horz?"<td":"<div")+" dir='ltr'"+M.GetClassAll("Foot")+clk+">"+M.Foot+(horz?"</td>":"</div>");
if(horz) s += "</tr>" + CTableEnd;

MS.Message;
if(M.Modal) {
   DisablePage(M.StyleSize);
   if(M.ZIndex) TDialog.DisabledTag.style.zIndex = M.ZIndex-2;
   }
ME.Message;
var D = document.createElement("div");
MS.LibMouse; M["MouseMove"] = MouseObjects.MouseMove; ME.LibMouse;
var cancel = "TGCancelEvent(ev?ev:event);";
D.onmousemove = new Function("ev",(M["MouseMove"]?M.This+".MouseMove(ev?ev:event);":"")+cancel); 
D.onmouseover = new Function("ev",(M.ToClose?M.This+".ToClose(0,ev?ev:event);":"")+cancel); 
D.onmouseout = new Function("ev",cancel);
if((BIEA||BEdge)&&M.Type!="Grid") D.onselectstart = new Function("ev","if("+M.This+"&&!"+M.This+".EditMode)TGCancelEvent(ev,2)");
M.Tag = D;
D.className = M.GetClass("Main")+" "+M.GetClass("Main"+astr) + M.MainClass + (horz?" "+M.GetClass("HorzMain"):"");

D.style.visibility = "hidden";  
if(M.HeaderTag) M.HeaderTag.parentNode.insertBefore(D,M.HeaderTag);
else AppendTag(D,M.StyleSize);
D.innerHTML = "<div"+(M.Grid&&M.Grid.EditMode?" onmousedown='CancelEvent(event);'":"")+(M.Scale?" style='transform:scale("+M.Scale+");transform-origin:0 0;'":"")+" class='"+M.GetClass("Outer")+" "+M.GetClass("Outer"+astr)+"'>"+s+"</div>";

if(M.ZIndex!=null) D.style.zIndex = M.ZIndex;
if(M.CloseClick) M.SetCloseClick(D);

if(M.OnShow) M.OnShow(M.Tag);   

if(M.HeadClose && M.Head && M.Head=="#"&&horz) M.GetBody().previousSibling.firstChild.style.display = "block";
M.SetWidth(M.Tag,M.Width);

if(BIE||BIEA6||BOpera) M.GetBody().style.overflowY = "hidden";
M.FixedHeight = D.offsetHeight-50;
if(BIE||BIEA6||BOpera) M.GetBody().style.overflowY = "";
M.Align = align; M.Pos = P;
M.UpdatePos();
var astr = align.prev?"Left":(align.next?"Right":(align.above?"Top":"Bottom"));

if(M.HeadClose && M.Head) M.GetBody().previousSibling.firstChild.style.display = "block";
D.style.visibility = "";
if(M.HeaderTag){

   M.HeaderTag.style.visibility = "";
   }  

if(M.Shadow){
   var D = document.createElement("div");
   D.className = M.GetClass("Shadow")+" "+M.GetClass("Shadow"+astr) + M.MainClass;
   D.innerHTML = CNBSP;
   if(M.ZIndex!=null) D.style.zIndex = M.ZIndex-1;
   M.Tag.parentNode.insertBefore(D,M.Tag);
   M.ShadowTag = D;
   M.UpdateShadow(D,M.Tag);
   }

if(M.ShadowHeader && M.HeaderTag && M.HeaderTag.offsetHeight){
   var D = document.createElement("div"), tag = M.HeaderTag;
   D.className = M.GetClass("Shadow")+" "+M.GetClass("Shadow"+astr) + M.MainClass;
   D.innerHTML = CNBSP;
   D.style.left = tag.style.left;
   D.style.top = tag.style.top;
   D.style.height = tag.offsetHeight+"px";
   D.style.width = tag.offsetWidth+"px";
   if(M.Shift && (align.below||align.above) && tag.offsetHeight){ 
      D.style.height = (tag.offsetHeight+M.Shift)+"px";
      if(align.above) D.style.top = (parseInt(tag.style.top)-M.Shift)+"px";
      }
   if(M.ZIndex!=null) D.style.zIndex = M.ZIndex-1;
   M.Tag.parentNode.insertBefore(D,M.Tag);
   M.ShadowHeaderTag = D;
   }
if(CZoom!=1) M.Tag.innerHTML = M.Tag.innerHTML;
M.NoKeyTo = (new Date).getTime() + 100;
if(M.CloseAfter) setTimeout(function(){ if(M.Tag) M.Close(); },M.CloseAfter);
if(BIPAD) M.NoClickTo = (new Date).getTime() + 500;

var B = M.GetBody(), PM = function(ev){ PreventMouseWheel(M.Grid,B,0,ev?ev:event); };
if(B.onwheel || window.WheelEvent) B.addEventListener('wheel',PM,false); 
else { B.onmousewheel = PM; if(B.addEventListener) B.addEventListener('DOMMouseScroll',PM,false); }
var A = document.activeElement; if(A&&A.tagName) A = A.tagName.toLowerCase();
if(!A || A!="input"&&A!="textarea"&&(A!="div"||document.activeElement.contentEditable!="true")) { try { var T = M.FocusTag?M.FocusTag:M.Tag; if(T) T.focus(); } catch(e) { } } 

MS.Animate;
var anim = null;
if(align.above||align.bottom){ anim = align.prev||align.right ? M.AnimateShowRightUp : align.next||align.left ? M.AnimateShowLeftUp : M.AnimateShowCenterUp; if(!anim) anim = M.AnimateShowUp; }
else if(align.below||align.top){ anim = align.prev||align.right ? M.AnimateShowRightDown : align.next||align.left ? M.AnimateShowLeftDown : M.AnimateShowCenterDown; if(!anim) anim = M.AnimateShowDown; }
else { anim = align.prev||align.right ? M.AnimateShowRightMiddle : align.next||align.left ? M.AnimateShowLeftMiddle : M.AnimateShowCenterMiddle; if(!anim) anim = M.AnimateShowMiddle; }
if(!anim) { anim = align.prev||align.right ? M.AnimateShowRight : align.next||align.left ? M.AnimateShowLeft : M.AnimateShowCenter; if(!anim) anim = M.AnimateShow; }
if(anim && !M.NoAnim){
   var sh = M.Tag.style.height, sw = M.Tag.style.width, Z = M.Scale ? M.Scale : 1;
   if(!sh||sh.indexOf("px")==0) M.Tag.style.height = M.Tag.scrollHeight*(Z<1?Z:1)+"px";
   if(!sw||sw.indexOf("px")==0) M.Tag.style.width = M.Tag.scrollWidth*(Z<1?Z:1)+"px";
   if(M.ShadowTag) M.ShadowTag.style.display = "none";
   Animate(M.Tag,anim,{height:sh,width:sw},function(){ if(M.ShadowTag) M.ShadowTag.style.display = ""; });
   }
ME.Animate;
M.NoClickTo = (new Date()).getTime()+300;
return M;
}
var TGShowDialog = ShowDialog; if(window["ShowDialog"]==null) window["ShowDialog"] = ShowDialog; 
// -----------------------------------------------------------------------------------------------------------
MS.Lib;
function WriteDialog(M){
if(!M) return;
if(typeof(M)=="string") M = {Body:M};
M.Static = 1;
Dialogs.Add(M);

for(var i in TDialog) if(M[i]==null) M[i] = TDialog[i];
M.Tag = null; M.ShadowTag = null; M.ShadowHeaderTag = null; M.HeaderTag = null;

var s = "";
if(M.Head) s += "<div"+M.GetClassAll("Head")+">" + M.Head + "</div>";
s += "<div"+M.GetClassAll("Body")+" style='"
  + (M.Wrap==null?"":"white-space:"+(M.Wrap?"normal":"nowrap")+";")+(BIE||BIEA6?"width:0px;overflow-x:visible;":"")+"height:50px;'"
  + "><div>" + M.Body + "</div></div>";
if(M.Foot) s += "<div"+M.GetClassAll("Foot")+">"+M.Foot+"</div>";

document.write("<div id='STDLG"+M.id+"'"+M.GetClassAll("Static")+"><div style='width:0px;'"+M.GetClassAll("Outer")+">"+s+"</div></div>");
var D = GetElem("STDLG"+M.id); M.Tag = D;

M.SetWidth(M.Tag.firstChild);

M.FixedHeight = D.offsetHeight-50;

D.style.visibility = "";
if(CZoom!=1) M.Tag.innerHTML = M.Tag.innerHTML;
M.NoClickTo = (new Date()).getTime()+300;
return M;
}
ME.Lib;
// -----------------------------------------------------------------------------------------------------------
TDialog.SetArea = function(P,upd) {
var x = 0, y = 0, width = 0, height = 0;
if(P.Tag){
   var A = ElemToWindow(P.Tag), B = AbsoluteToWindow();
   x = A[0]-B[0]; y = A[1]-B[1]; width = P.Tag.offsetWidth; height = P.Tag.offsetHeight; MS.Scale; if(P.Scale) { width *= P.Scale; height *= P.Scale; } ME.Scale;
   this.BaseTag = P.Tag;
   if(upd&&this.BaseTagPos&&this.BaseTagPos[0]==x&&this.BaseTagPos[1]==y&&this.BaseTagPos[2]==width&&this.BaseTagPos[3]==height) return;
   this.BaseTagPos = [x,y,width,height];
   }
else if(upd) return;
if(P.X) x += P.X; if(P.Y) y += P.Y; if(P.Width) width += P.Width; if(P.Height) height += P.Height;  
if(P.Left) x += P.Left; if(P.Top) y += P.Top; 
if(this.ClosePlace) this.Cell = [x,y,width,height];
if(this.CloseMove) this.StartPos = [Dialogs.X,Dialogs.Y];
if(P.Mouse){ 
   var C = EventToAbsolute({clientX:Dialogs.X,clientY:Dialogs.Y,type:1}); 
   if(C[0]) x += C[0]; if(C[1]) y += C[1];
   if(P.Tag){ 
      x -= A[0]; y -= A[1]; 
      
      if(this.Cell){ if(P.X) this.Cell[0] -= P.X; if(P.Y) this.Cell[1] -= P.Y; } 
      }
   else if(this.Cell) this.Cell = [x,y,width,height]; 
   }
this.Width = width; this.Height = height; this.X = x; this.Y = y;
}
// -----------------------------------------------------------------------------------------------------------
TDialog.GetClass = function(cls) {
return this.Base+cls+(this.Class?" "+this.Class+cls:"");
}
// -----------------------------------------------------------------------------------------------------------
TDialog.GetClassAll = function(cls) {
return " class='"+this.Base+cls+(this.Class?" "+this.Class+cls:"")+"'";
}
// -----------------------------------------------------------------------------------------------------------
TDialog.SetWidth = function(tag,width) {
var F = this.Tag.firstChild;
var ww,w = F.scrollWidth > F.offsetWidth ? F.scrollWidth+F.offsetWidth-F.clientWidth+1 : F.offsetWidth+1; 
var s = GetStyle(this.Tag); this.MLeft = parseInt(s.marginLeft); this.MRight = parseInt(s.marginRight); if(!this.MLeft) this.MLeft = 0; if(!this.MRight) this.MRight = 0;
this.MinMaxWidthSet = 0;
if(this.OnWidth) { ww = this.OnWidth(this.Tag,w); if(ww && w!=ww) { w = ww; this.MinMaxWidthSet = 1; }}
ww = this.MaxWidth==0 ? width : this.MaxWidth;
if(ww && w>ww) { w = ww; this.MinMaxWidthSet = 1; }
ww = this.MinWidth==0 ? width : this.MinWidth;
if(ww && w<ww) { w = ww; this.MinMaxWidthSet = 1; } 

F.style.width = w+"px";
ww = 0;
if(tag.offsetWidth > w) { ww = tag.offsetWidth-w; if(ww>w/2) ww = 0; } 
if(this.HeaderTag && this.HeaderWidth>w-ww) ww -= this.HeaderWidth-w;
if(ww) F.style.width = (w-ww)+"px";
MS.Scale; if(this.Scale) this.Tag.style.width = this.Tag.scrollWidth*(this.Scale<1?this.Scale:1)+"px"; ME.Scale;
this.SWidth = w-ww-this.MLeft-this.MRight;
var B = this.GetBody();

if(BIEA) B.style.overflowX = "hidden";
if(BIE||BIEA6) B.style.width = "";
}
// -----------------------------------------------------------------------------------------------------------
TDialog.SetCloseClick = function (T){
if(!this.BaseTag) {
   var s = this.This+".Close();", f = new Function(s);
   if(BMouse) T.onclick = f;
   MS.Touch; if(BTablet) T.ontouchend = f; else if(BTouch) T.setAttribute("ontouchend",s); ME.Touch;
   }
else {
   T.onclick = new Function("ev","var D="+this.This+".BaseTag;"+this.This+".Close();TGFireMouseEvent(D,ev?ev:event);");
   T.onmousedown = new Function("ev","TGFireMouseEvent("+this.This+".BaseTag,ev?ev:event);");
   T.oncontextmenu = new Function("ev","TGFireMouseEvent("+this.This+".BaseTag,ev?ev:event);");
   
   }
}
// -----------------------------------------------------------------------------------------------------------
TDialog.GetBody = function (){
var F = this.Tag.firstChild.firstChild; 
if(this.Horz==2 && (this.Head||this.Foot)) F = F.firstChild.firstChild.firstChild;
if(this.Head) F = F.nextSibling;
return F;
}
// -----------------------------------------------------------------------------------------------------------
TDialog.UpdateShadow = function (D,tag){
if(!D || !tag) return;
D.style.left = tag.style.left;
D.style.top = tag.style.top;
D.style.height = tag.offsetHeight+"px";
D.style.width = tag.firstChild.offsetWidth+"px";
}
// -----------------------------------------------------------------------------------------------------------
TDialog.GetArea = function (){
if(this.Area){
   if(this.Area.offsetLeft!=null){
      var B = ElemToAbsolute(this.Area);
      return [B[0],B[1],this.Area.clientWidth?this.Area.clientWidth:this.Area.offsetWidth,this.Area.clientHeight?this.Area.clientHeight:this.Area.offsetHeight];
      }
   if(!this.Area.length) return [this.Area.X,this.Area.Y,this.Area.Width,this.Area.Height];   
   return this.Area;
   }
if(!CZoom || CZoom==1) return GetWindowArea(0);
var A = GetWindowArea(0);
return [A[0]/CZoom,A[1]/CZoom,A[2]/CZoom,A[3]/CZoom];
}
// -----------------------------------------------------------------------------------------------------------
TDialog.UpdatePos = function (){
if(this.Align.none||BTablet&&this.EditMode) { this.UpdateHeight(); return; }
var D = this.Tag, M = this, P = this.Pos, F = D.firstChild, A = this.GetArea(), B = this.GetBody(), W = GetWindowSize(1), nochgh = 0, nochgw = 0;
if(B.firstChild.scrollWidth>W[0]&&!this.CloseMove&&!this.CloseOut&&!this.ClosePlace&&!this.CloseArea) { this.UpdateHeight();  return; } 
this.SetArea(P,1);
var x = this.X, y = this.Y, width = this.Width, height = this.Height, align = this.Align, sw = M.Shadow ? M.ShadowWidth : 0, Z = this.Scale ? this.Scale:1, rdx = 0;


MS.Touch;
if(BTablet) { 
   var h = B.firstChild.offsetHeight;
   if(this.NoChangeH) nochgh = 1;
   else if(W[1] < h || this.NoFindItem){
      this.NoChangeH = W[1];
      if(document.body.style.overflowY){ this.BodyOverflowY = document.body.style.overflowY; document.body.style.overflowY = ""; }
      
      A[3] = 10000;
      }
   }
ME.Touch;
var dy = align.bottom||align.below ? height : align.middle ? height/2 : 0; 
if(y+dy<A[1]) y = A[1]-dy;
else if(y>A[1]+A[3]+dy) y = A[1]+A[3]-dy;
if(height>A[3]) height = A[3];
var maxtop = (P.Move?A[0]:y)-this.FixedHeight+(align.top||align.bottom?height:0)-M.MinEdge-A[1], maxbot = A[3]+A[1]-(P.Move?0:y)-(align.top||align.bottom?0:height)-this.FixedHeight-M.MinEdge-sw;
var max = align.bottom||align.above ? maxtop : maxbot, chga = 0;
if(max<0) max = 0;
M.AMinHeight = M.MinHeight==0 ? B.firstChild.offsetHeight : M.MinHeight;
if(max<M.AMinHeight && P.Realign!=0){ 
   if(align.bottom||align.above) {
      if(maxbot>maxtop*1.1 || maxbot>=M.AMinHeight){ 
         max = maxbot; 
         if(align.bottom){ delete align.bottom; align.top = 1; chga = 1; }
         else { delete align.above; align.below = 1; chga = 1; if(M.Pos.Mouse && M.Pos.Y>0) y -= M.Pos.Y*2; }
         }
      }   
   else if(align.top||align.below) {
      if(maxtop>maxbot*1.1 || maxtop>=M.AMinHeight){ 
         max = maxtop; 
         if(align.top){ delete align.top; align.bottom = 1; chga = 1; }
         else { delete align.below; align.above = 1; chga = 1; if(M.Pos.Mouse && M.Pos.Y<0) y -= M.Pos.Y*2; }
         }
      }
   if(max<M.AMinHeight && (align.bottom||align.top)) {
      delete align.top; delete align.bottom;
      align.middle = 1; chga = 1;
      max = maxtop + maxbot - height;
      }
   }
M.AMaxHeight = (!M.MaxHeight || M.MaxHeight>max)&&!align.middle ? max : M.MaxHeight ? M.MaxHeight : W[1]-this.FixedHeight-M.MinEdge*2-sw;

MS.Touch;
if(BTablet) { 
   var w = F.offsetWidth*Z;
   if(this.NoChangeW) nochgw = 1;
   else if(W[0] < w){
      this.NoChangeW = W[0];
      width = w;
      align.center = 1;
      A[2] = 10000;
      }
   }
ME.Touch;
var dx = align.right||align.next ? width : align.center ? width/2 : 0;
if(x+dx<A[0]) x = A[0]-dx;
else if(x+dx>A[0]+A[2]) x = A[0]+A[2]-dx;
if(width>A[2]) width = A[2];
var maxleft = x+(align.prev||align.next?0:width)-M.MinEdge-A[0], maxright = A[2]+A[0]-x-(align.prev||align.next?width:0)-M.MinEdge-sw;
var max = align.right||align.prev ? maxleft : maxright;
if(max<F.offsetWidth*Z && P.Realign!=0){
   if(align.right||align.prev){
      if(align.right){ delete align.right; chga = 1; if(maxright>=F.offsetWidth*Z) { align.left = 1; if(P.XLeft!=null) { x += P.XLeft-P.X; P.X = P.XLeft; } } else align.center = 1; }
      else if(maxright>=F.offsetWidth*Z) { delete align.prev; align.next = 1; chga = 1; }
      }
   else {
     if(align.next){ if(maxleft>=F.offsetWidth*Z) { delete align.next; align.prev = 1; chga = 1; } }
     else { delete align.left; if(maxleft>=F.offsetWidth*Z) { align.right = 1; if(P.XRight!=null) { x += P.XRight-P.X; P.X = P.XRight; } } else align.center = 1; chga = 1; }
      }   
   }

if(!nochgh){
   if(BIEA&&!BIEA10) D.style.position = "fixed"; 
   M.PY = y;
   M.UpdateHeight();
   }

var left,top;

if(!nochgh){
   if(align.middle) top = y + Math.floor((height-(D.clientHeight?D.clientHeight:D.firstChild.offsetHeight))/2)+M.Shift;
   else if(align.above) top = y-(D.clientHeight?D.clientHeight:D.firstChild.offsetHeight)-M.Shift;
   else if(align.top) top = y;
   else if(align.bottom) top = y+height-(D.clientHeight?D.clientHeight:D.firstChild.offsetHeight);
   else top = y+height+M.Shift; 
   if(P.Move || P.Move==null&&align.middle){
      if(top<M.MinEdge+A[1]) top = M.MinEdge+A[1];
      if(top+D.offsetHeight+sw > A[1]+A[3]){ 
         M.AMaxHeight = D.offsetHeight;
         if(P.MoveMouse) top -= M.AMaxHeight + (P.Y?P.Y:0) + P.MoveMouse;
         else top = A[3]+A[1]-M.AMaxHeight-sw;
         M.UpdateHeight(); 
         }
      }
   if(P.Resize || P.Resize==null&&align.middle){
      if(top<M.MinEdge+A[1]) { 
         top = M.MinEdge+A[1]; 
         D.style.top = top+"px"; 
         M.PY = top; 
         M.AMaxHeight = A[3]-M.MinEdge-sw-D.offsetHeight+M.GetBody().firstChild.offsetHeight; 
         M.UpdateHeight(); 
         }   
      }
   D.style.top = top+"px";
   M.PY = top;
   if(M.HeaderTag) M.HeaderTag.style.display = D.offsetTop<M.HeaderTop+M.HeaderHeight-5 && D.offsetTop+D.offsetHeight>M.HeaderTop+5 ? "none" : "";
   if(BIEA&&!BIEA10) D.style.position = "";
   }

if(!nochgw){
   if(align.center) left = x + Math.floor((width-this.MLeft-this.MRight-F.offsetWidth*Z)/2);
   else if(align.prev) left = x-F.offsetWidth*Z-M.Shift;
   else if(align.next) left = x+width+M.Shift-this.MLeft-this.MRight;
   else if(align.right) left = x+width-F.offsetWidth*Z-this.MLeft-this.MRight; 
   else left = x; 
   if(P.Move || P.Move==null&&align.center){
      if(left<M.MinEdge+A[0]) left = M.MinEdge+A[0];
      if(left+F.offsetWidth*Z+sw>A[0]+A[2]) left = A[2]+A[0]-F.offsetWidth*Z-sw;
      }  
   if(P.Resize || P.Resize==null&&align.center){
      if(left<M.MinEdge) { 
         left = M.MinEdge;
         F.style.width = (A[0]+A[2]-sw-M.MinEdge*2-5)+"px"; 
         }
      else if(left+F.offsetWidth*Z+sw>A[0]+A[2]) F.style.width = (A[0]+A[2]-sw-M.MinEdge*2-left)+"px";
      }
   var dw = F.offsetWidth*Z-this.MLeft-this.MRight-GetWindowSize()[0]+left-GetWindowScroll()[0];
   if(dw>0) { left -= dw; if(left<M.MinEdge) left = M.MinEdge; } 
   D.style.left = left-rdx+"px"; 
   }

if(this.ShadowTag) this.UpdateShadow(this.ShadowTag,this.Tag);
if(chga){
   var astr = align.prev?"Left":(align.next?"Right":(align.above?"Top":"Bottom"));
   if(this.HeaderTag) this.HeaderTag.className = this.GetClass("Header") + " " + this.GetClass("Header"+astr) + this.MainClass;
   if(this.ShadowTag) this.ShadowTag.className = this.GetClass("Shadow") + " " + this.GetClass("Shadow"+astr) + this.MainClass;
   if(this.ShadowHeaderTag) this.ShadowHeaderTag.className = this.GetClass("Shadow") + " " + this.GetClass("Shadow"+astr) + this.MainClass;
   this.Tag.firstChild.className = this.GetClass("Outer") + " " + this.GetClass("Outer"+astr);
   this.Tag.className = this.GetClass("Main") + " " + this.GetClass("Main"+astr) + this.MainClass+ (this.Horz?" "+this.GetClass("HorzMain"):"");
   }

}
// -----------------------------------------------------------------------------------------------------------
TDialog.UpdateHeight = function (noalign){
if(this.InUpdateHeight) return;
this.InUpdateHeight = 1;
var F = this.GetBody(), Z = this.Scale ? this.Scale : 1;
var h = (F.scrollHeight > F.clientHeight ? F.scrollHeight : F.firstChild.offsetHeight);
if(F.firstChild.offsetHeight > this.AMaxHeight/Z){
   var wscr = F.style.overflow||this.NoScroll?0:CScrollWidth; 
   F.firstChild.style.overflow = "hidden"; 
   F.style.overflow = this.NoScroll ? "hidden" : "auto";
   F.style.height = this.AMaxHeight/Z+"px";

   if(BIE) F.offsetHeight; 
   
   if(wscr){
      var w = this.SWidth+this.MLeft+this.MRight;
      if(this.MinMaxWidthSet) w -= wscr;
      F.firstChild.style.width = w+"px";
      
      if(BIE) {
         F.style.overflow = "hidden";
         F.firstChild.style.width = w+F.parentNode.clientWidth-F.offsetWidth+"px";
         F.style.overflow = "auto";
         this.Tag.firstChild.style.width = w+wscr+"px";
         }
      
      else {
         if(this.Scale) this.Tag.style.width = "";
         this.Tag.firstChild.style.width = ""; 
         
         this.Tag.firstChild.style.width = w-F.offsetWidth+this.Tag.firstChild.offsetWidth+wscr+"px"; 
         
         MS.Scale; if(this.Scale) this.Tag.style.width = this.Tag.scrollWidth*(Z<1?Z:1)+"px"; ME.Scale;
         }
      }
   
   if(this.LastScroll!=null) { F.scrollTop = this.LastScroll; this.LastScroll = null; }
   this.HasVScroll = 1;
   }
else {
   
   this.LastScroll = F.scrollTop;
   F.style.overflow = "";
   if(BIEA6) F.style.height = F.scrollHeight; 
   else F.style.height = "";
   
   F.firstChild.style.width = "";
   this.Tag.firstChild.style.width = this.SWidth+this.MLeft+this.MRight+"px";
   F.firstChild.style.overflow = "";
   
   this.HasVScroll = 0;
   }  
MS.Scale; if(this.Scale) this.Tag.style.height = this.Tag.scrollHeight*(Z<1?Z:1)+"px"; ME.Scale;
if(!noalign && (this.Align.bottom||this.Align.above)) this.Tag.style.top = (this.Y+(this.Align.bottom?this.Height:-this.Shift)-this.Tag.clientHeight)+"px";
if(this.ShadowTag) this.UpdateShadow(this.ShadowTag,this.Tag);
if(this.UpdateScroll) this.UpdateScroll();
if(BIEA) F.className = F.className; 
this.InUpdateHeight = 0;
}
// -----------------------------------------------------------------------------------------------------------
TDialog.Close = function(){ 
this.Delete();
}
// -----------------------------------------------------------------------------------------------------------
TDialog.Delete = function(){
if(!Dialogs[this.id]) return;
if(this.OnCClose) this.OnCClose();
if(this.OnClose) this.OnClose();
MS.Animate;
var anim = null, align = this.Align;
if(align.above||align.bottom){ anim = align.prev||align.right ? this.AnimateHideRightUp : align.next||align.left ? this.AnimateHideLeftUp : this.AnimateHideCenterUp; if(!anim) anim = this.AnimateHideUp; }
else if(align.below||align.top){ anim = align.prev||align.right ? this.AnimateHideRightDown : align.next||align.left ? this.AnimateHideLeftDown : this.AnimateHideCenterDown; if(!anim) anim = this.AnimateHideDown; }
else { anim = align.prev||align.right ? this.AnimateHideRightthisiddle : align.next||align.left ? this.AnimateHideLeftthisiddle : this.AnimateHideCenterthisiddle; if(!anim) anim = this.AnimateHidethisiddle; }
if(!anim) { anim = align.prev||align.right ? this.AnimateHideRight : align.next||align.left ? this.AnimateHideLeft : this.AnimateHideCenter; if(!anim) anim = this.AnimateHide; }
if(anim && this.Tag && !this.NoAnim){
   var T = this.Tag, Z = this.Scale ? this.Scale : 1, H = this.HeaderTag; this.Tag = null; if(!this.AnimateCloseHeader) this.HeaderTag = null;
   T.style.height = T.scrollHeight*(Z<1?Z:1)+"px";
   T.style.width = T.scrollWidth*(Z<1?Z:1)+"px";

   var X = document.createElement("div");
   X.style.height = T.style.height; X.style.width = T.style.width;
   X.style.position = "absolute"; X.style.left = "0px"; X.style.top = "0px";
   T.appendChild(X);
   T.onmousemove; T.onmouseover; T.onmousemove = null; T.onmouseover = null; 

   Animate(T,anim,{display:"none"},function(){ if(T&&T.parentNode) T.parentNode.removeChild(T); if(H&&H.parentNode) H.parentNode.removeChild(H); } );
   }
ME.Animate;
if(this.Tag) { if(this.Tag.parentNode) this.Tag.parentNode.removeChild(this.Tag); this.Tag = null; }
if(this.HeaderTag){ if(this.HeaderTag.parentNode) this.HeaderTag.parentNode.removeChild(this.HeaderTag); this.HeaderTag = null; }
if(this.ShadowTag){ if(this.ShadowTag.parentNode) this.ShadowTag.parentNode.removeChild(this.ShadowTag); this.ShadowTag = null; }
if(this.ShadowHeaderTag) { if(this.ShadowHeaderTag.parentNode) this.ShadowHeaderTag.parentNode.removeChild(this.ShadowHeaderTag); this.ShadowHeaderTag = null; }
if(this.CloseTimeoutId){ clearTimeout(this.CloseTimeoutId); this.CloseTimeoutId = null; }
if(BTablet) { this.NoChangeH = null; this.NoChangeW = null; if(this.BodyOverflowY) document.body.style.overflowY = this.BodyOverflowY; }
Dialogs.Delete(this);
MS.Message; if(this.Modal) EnablePage(); ME.Message;
this.Deleted = 1;
}
// -----------------------------------------------------------------------------------------------------------
TDialog.ToClose = function(now,ev){
if(ev && ev.clientY!=null){ Dialogs.X = ev.clientX; Dialogs.Y = ev.clientY; }
var A = EventToAbsolute({clientX:Dialogs.X,clientY:Dialogs.Y}), x = A[0], y = A[1];
var T = this.Tag, S = this.ShadowTag, H = this.HeaderTag, R = this.Cell, E = this.GetArea();
if(this.CloseOut 
      && (x < T.offsetLeft*CZoom || x > T.offsetLeft*CZoom+T.offsetWidth || y < T.offsetTop*CZoom || y > T.offsetTop*CZoom+T.offsetHeight)
      && (!H || x < H.offsetLeft*CZoom || x > H.offsetLeft*CZoom+H.offsetWidth || y < H.offsetTop*CZoom || y > H.offsetTop*CZoom+H.offsetHeight)
      && !this.Next
   || this.ClosePlace && R
      && (x<R[0] || x>R[0]+R[2] || y<R[1] || y>R[1]+R[3])
   || this.CloseArea && E
      && (x<E[0] || x>E[0]+E[2] || y<E[1] || y>E[1]+E[3])
   || this.CloseIn
      && (x >= T.offsetLeft*CZoom && x <= T.offsetLeft*CZoom+T.offsetWidth && y >= T.offsetTop*CZoom && y <= T.offsetTop*CZoom+T.offsetHeight)
   || S && this.CloseIn && (x >= S.offsetLeft*CZoom && x <= S.offsetLeft*CZoom+S.offsetWidth && y >= S.offsetTop*CZoom && y <= S.offsetTop*CZoom+S.offsetHeight)
   ){ 
   if(now || !this.CloseTimeout) this.Close();
   else { 
      if(!this.CloseTimeoutId) this.CloseTimeoutId = setTimeout(new Function("if("+this.This+")"+this.This+".ToClose(1);"),this.CloseTimeout);
      }
   }
else this.CloseTimeoutId = null;   
}
// -----------------------------------------------------------------------------------------------------------
TDialog.StartDrag = function(ev){
var M = this;
AttachMouse({
   Tag:this.Tag,
   Area:this.Area,
   OnMove:function(dx,dy){
      var O = M.ShadowTag;
      if(O) {
         if(dx) O.style.left = (parseInt(O.style.left) + dx) + "px";
         if(dy) O.style.top = (parseInt(O.style.top) + dy) + "px";
         }
      },
   OnCancel:function(){ 
      M.UpdateShadow(M.ShadowTag,M.Tag); 
      M.NoClickTo = (new Date()).getTime()+100; 
      },
   OnDrop:function(x,y,dummy,ox,oy){ 
      M.UpdateHeight(1); 
      var P = M.Pos;
      P.X = (P.X?P.X:0) + (x-ox);
      P.Y = (P.Y?P.Y:0) + (y-oy);
      if(M.OnMoved) M.OnMoved(x,y,ox,oy); 
      M.NoClickTo = (new Date()).getTime()+100; 
      },   
   Copy:0
   },ev);
}
// -----------------------------------------------------------------------------------------------------------
Dialogs.Click = function(ev,right){
if(!ev) ev = window.event;
if(ev.defaultPrevented) return; 
var t = (new Date()).getTime();

for(var i=0;i<Dialogs.length;i++) {
   var M = Dialogs[i];
   if(M && M.Close && M.CloseClickOut && M.NoClickTo < t && (right||!BMozilla||ev&&ev.button==0) && (!M.Grid||!M.Grid.Disabled)) M.Close(); 
   }

}
// -----------------------------------------------------------------------------------------------------------
Dialogs.RightClick = function(ev){ return Dialogs.Click(ev,1); }
// -----------------------------------------------------------------------------------------------------------
Dialogs.Add = function(M){
if(M.id!=null) return;
for(M.id=0;Dialogs[M.id];M.id++);
Dialogs[M.id] = M;

M.This = "TGDialogs["+M.id+"]";
if(M.CanFocus) Dialogs.Focused = M;
}
// -----------------------------------------------------------------------------------------------------------
Dialogs.Delete = function(M){
if(Dialogs.Focused == M) Dialogs.Focused = null;
delete Dialogs[M.id];
M.id = null;
while(Dialogs.length && !Dialogs[Dialogs.length-1]) Dialogs.length--; 
}
// -----------------------------------------------------------------------------------------------------------
Dialogs.KeyDown = function(ev){
if(!ev) ev = window.event;
var key = ev.keyCode; if(!key) key = ev.charCode;
var M = Dialogs.Focused;
if(M && M.KeyDown && M.NoKeyTo<(new Date).getTime()) M.KeyDown(key,ev);
else if(window.Controls) Controls.KeyDown(ev);
}
// -----------------------------------------------------------------------------------------------------------
Dialogs.KeyPress = function(ev){
if(!ev) ev = window.event;
var key = ev.charCode; if(!key) key = ev.keyCode;
var M = Dialogs.Focused;
if(M && M.KeyPress && M.NoKeyTo<(new Date).getTime()) M.KeyPress(key,ev);

}
// -----------------------------------------------------------------------------------------------------------
Dialogs.MouseOver = function(ev){
if(!ev) ev = window.event; if(ev.clientY!=null){ Dialogs.X = ev.clientX; Dialogs.Y = ev.clientY; }

for(var i=0;i<Dialogs.length;i++){
   var M = Dialogs[i]; if(!M) continue;
   if(M.ToClose) M.ToClose();
   }
}
// -----------------------------------------------------------------------------------------------------------
Dialogs.MouseMove = function(ev){

if(!ev) ev = window.event; 
if(ev.clientY==null) return;
if(Dialogs.X==ev.clientX&&Dialogs.Y==ev.clientY) return; 
Dialogs.X = ev.clientX; Dialogs.Y = ev.clientY;
for(var i=0;i<Dialogs.length;i++){
   var M = Dialogs[i]; if(!M) continue;
   if(M.CloseMove && M.StartPos){
      if(M.StartPos[0]==null) M.StartPos = [Dialogs.X,Dialogs.Y];
      var dx = M.StartPos[0] - Dialogs.X, dy = M.StartPos[1] - Dialogs.Y;
      if(Math.abs(dx)>=M.CloseMove || Math.abs(dy)>=M.CloseMove) M.Close();
      }
   if(M.ClosePlace || M.CloseArea) M.ToClose();
   }
}
// -----------------------------------------------------------------------------------------------------------
Dialogs.TouchStart = function(ev){
if(!ev) ev = window.event; 
if(ev.changedTouches) ev = ev.changedTouches[0];
if(ev.clientY!=null){ Dialogs.X = ev.clientX; Dialogs.Y = ev.clientY; Dialogs.ClickTime = new Date()-0; }
}
// -----------------------------------------------------------------------------------------------------------
Dialogs.TouchEnd = function(ev){
if(ev.changedTouches) ev = ev.changedTouches[0];
if(new Date()-Dialogs.ClickTime<1000 && Dialogs.X==ev.clientX && Dialogs.Y==ev.clientY) Dialogs.Click(ev); 
}
// -----------------------------------------------------------------------------------------------------------
Dialogs.Resize = function(ev,scroll){
if(BIEA8 && !BIEA9 && !BIE){ 
   var A = GetWindowSize(), B = GetWindowScroll();
   if(Dialogs.Width==A[0] && Dialogs.Height == A[1] && Dialogs.Left == B[0] && Dialogs.Top == B[1]) return;
   Dialogs.Width = A[0]; Dialogs.Height = A[1]; Dialogs.Left = B[0]; Dialogs.Top = B[1];
   }

if(!ev) ev = window.event; if(ev.clientY!=null){ Dialogs.X = ev.clientX; Dialogs.Y = ev.clientY; }
for(var i=0;i<Dialogs.length;i++){
   var M = Dialogs[i]; if(!M || !M.Tag || M.X==null || !scroll && !M.ResizeUpdate || scroll&&!M.ScrollUpdate) continue;
   M.UpdatePos();
   
   }
if(TDialog.Disabled){
   var D = TDialog.DisabledTag;
   var A = GetWindowScroll(), B = AbsoluteToWindow();
   D.style.left = A[0]-B[0]+"px";
   D.style.top = A[1]-B[1]+"px";
   var A = GetWindowSize();
   D.style.width = A[0]+"px";
   D.style.height = A[1]+"px";
   }
}
// -----------------------------------------------------------------------------------------------------------
Dialogs.Scroll = function(ev){  Dialogs.Resize(ev,1); } 

MS.LibHint;
// -----------------------------------------------------------------------------------------------------------
function ShowHint(M,P,always,val,cls){
P = InitPos(P); 
var tag = P.Tag; if(!tag) return;
var htag = P.HTag; if(!htag) htag = tag; 
var wtag = P.WTag; if(!wtag) wtag = tag; 
if(always&2) HideHint(tag);
else for(var i=0;i<Dialogs.length;i++) if(Dialogs[i]&&Dialogs[i].HintTag==tag) return; 

var W = wtag.scrollWidth, H = htag.scrollHeight;
if((BMozilla||BOpera||BOpera8) && W==wtag.offsetWidth && wtag.tagName.toLowerCase()=="td"){ 
   var D = ShowHint.MTag;
   if(!D){
      var D = document.createElement("div"), s = D.style;
      s.position = "absolute"; s.left = "0px"; s.top = "0px"; s.visibility = "hidden";
      AppendTag(D);
      ShowHint.MTag = D;
      }
   D.className = wtag.className;
   D.innerHTML = wtag.innerHTML;
   W = D.scrollWidth; 
   
   }
 
if(!(always&1) && (!M||!M.Body) && (BMozilla||BOpera||BOpera8||!wtag.clientWidth?wtag.offsetWidth>=W:wtag.clientWidth>=W) && ((BMozilla||BOpera||BOpera8||!htag.clientHeight?htag.offsetHeight>=H:htag.clientHeight>=H)||!H)) return; 

var name = tag.tagName.toLowerCase();
if(val==null) val = name=="input" ? tag.value : tag.innerHTML;
if(name=="textarea") val = val.replace(/\n/g,"<br/>");
if(!M) M = {Body:val};
else if(typeof(M)=="string"){ M = {Body:M.replace('%d',val)}; W = null; }
else if(!M.Body) M.Body = val;
else M.Body = M.Body.replace('%d',val);

var s = GetStyle(tag);
if(M.Wrap==null){
   if(name=="textarea") M.Wrap = 1;
   else if(s.whiteSpace && s.whiteSpace!="normal") M.Wrap = 0;
   else if(tag.style.whiteSpace && tag.style.whiteSpace!="normal") M.Wrap = 0; 
   else if(H<30) M.Wrap = 0;
   else M.Wrap = 1;
   }
   
if(!M.Base) M.Base = cls?cls:"TSHint";
if(M.MaxWidth==null && M.Wrap) M.MaxWidth = 0;
if(M.MinWidth==null && M.Wrap) M.MinWidth = 0;
if(!M.Wrap && W) M.MaxWidth = W; 
if(M.ClosePlace==null) M.ClosePlace = 1;
if(M.CloseClick==null) M.CloseClick = 1;
if(M.CloseTimeout==null) M.CloseTimeout = 0;
if(M.NoScroll==null) M.NoScroll = 1;
P.Align = "left top";
P.Resize = 1;
var A = ["fontSize","fontStyle","fontFamily","fontVariant","fontWeight","letterSpacing","textAlign","verticalAlign","textIndent","wordSpacing"]; 
var B = ["font-size","font-style","font-family","font-variant","font-weight","letter-spacing","text-align","vertical-align","text-indent","word-spacing"];
var ss = "";
for(var i=0;i<A.length;i++) if(s[A[i]]) ss += B[i]+":"+(s[A[i]]+"").replace(/\'/g,'"')+";";
M.Body = "<div style='"+ss+"'>"+M.Body+"</div>";
M.InDiv = 1; 
ShowDialog(M,P);

var F = M.Tag.firstChild, p = GetStyle(F);

var A = ["Left","Right","Top","Bottom"];
for(var i=0;i<A.length;i++){
   var w = 0, a;
   a = parseInt(p["border"+A[i]+"Width"]); if(a) w -= a;
   a = parseInt(p["padding"+A[i]]); if(a) w -= a;
   a = parseInt(s["border"+A[i]+"Width"]); if(a) w += a;
   a = parseInt(s["padding"+A[i]]); if(a) w += a;
   
   if(w>0) { 
      F.style["padding"+A[i]] = w+"px"; 
      if(BIE && i<=1) F.style.width = parseInt(F.style.width)+w+"px";
      M.Tag.style["margin"+A[i]] = "0px"
      }
   else if(w<=0) {
      M.Tag.style["margin"+A[i]] = w+"px";
      }
   }

if(!BIE && M.Wrap){
   w = parseInt(F.style.width) - parseInt(F.style.paddingLeft) - parseInt(F.style.paddingRight);
   if(w) F.style.width = w+"px";
   }
var A = ["backgroundImage","backgroundRepeat","backgroundPosition","backgroundPositionX","backgroundPositionY","cursor","color"];
for(var i=0;i<A.length;i++) if(s[A[i]]) M.Tag.style[A[i]] = s[A[i]];
if(M.ShadowTag) M.UpdateShadow(M.ShadowTag,M.Tag);
M.HintTag = tag;

var f = new Function("ev","if("+M.This+")TGFireMouseEvent("+M.This+".HintTag,ev?ev:event);");
M.Tag.onmousemove = f;
M.Tag.onmouseover = f;
M.Tag.onmouseout = f;
if(M.ShadowTag){
   M.ShadowTag.onmousemove = f;
   M.ShadowTag.onmouseover = f;
   M.ShadowTag.onmouseout = f;
   }
if(BMozilla){
   M.Tag.addEventListener('DOMMouseScroll',f, false);
   if(M.ShadowTag) M.ShadowTag.addEventListener('DOMMouseScroll',f, false);
   }
return M;
}
var TGShowHint = ShowHint; if(window["ShowHint"]==null) window["ShowHint"] = ShowHint; 
// -----------------------------------------------------------------------------------------------------------
function HideHint(P){
P = InitPos(P); 
var tag = P.Tag;
for(var i=0;i<Dialogs.length;i++) if(Dialogs[i]&&(tag && Dialogs[i].HintTag==tag || !tag && Dialogs[i].HintTag)) Dialogs[i].Close();
}
// -----------------------------------------------------------------------------------------------------------
ME.LibHint;

MS.Tip;
// -----------------------------------------------------------------------------------------------------------
function ShowTip(M,P,time,func,cls){
P = InitPos(P,1); 
var tag = P.Tag; 
if(tag) for(var i=0;i<Dialogs.length;i++) if(Dialogs[i]&&Dialogs[i].TipTag==tag) return; 
var val = tag ? tag.value ? tag.value : tag.innerHTML : "";
if(!M) M = {Body:val};
else if(typeof(M)=="string"||typeof(M)=="number") M = {Body:(M+"").replace('%d',val)};
else if(!M.Body) M.Body = val;
else M.Body = (M.Body+"").replace('%d',val);
if(!M.Base) M.Base = cls?cls:"TSTip";

if(M.CloseMove==null) M.CloseMove = 4;
if(M.CloseIn==null) M.CloseIn = 1;
if(M.CloseTimeout==null) M.CloseTimeout = 0;
if(M.NoScroll==null) M.NoScroll = 1;

if(!P.Align) {
   P.Align = "top left";
   if(P.X==null) {
      P.X = -10; P.XLeft = -10; P.XRight = 10;
      
      }
   if(P.Y==null) {
      P.Y = 16;
      for(var i=0,t=tag;t&&i<10;i++,t=t.parentNode){
         var cur = GetStyle(t).cursor;
         if(cur){
            if(cur=="pointer" || cur=="hand") P.Y = 20;
            else if(cur=="text") P.Y = 8;
            break;
            }
         }
      }
   if(P.Mouse==null) P.Mouse = 1;
   if(P.Move==null){ P.Move = 1; P.MoveMouse = 10; }
   }
if(P.Resize==null) P.Resize = 1;
ShowDialog(M,P);
M.TipTag = tag?tag:"";
if(time==null) time = 500;
var x = Dialogs.X, y = Dialogs.Y;

function show(){
   if(!M.Tag) return; 
   var left = parseInt(M.Tag.style.left), top = parseInt(M.Tag.style.top);
   if(left>M.MinEdge) M.Tag.style.left = (left+Dialogs.X-x)+"px";
   if(top>M.MinEdge) M.Tag.style.top = (top+Dialogs.Y-y)+"px";
   if(func){ 
      var tip = func(M.Tag);
      if(!tip) { M.Close(); return; }
      else if(tip!=val){ M.Body = tip; M = ShowDialog(M,P); }
      }
   M.Tag.style.visibility = "visible";
   if(M.ShadowTag){ M.UpdateShadow(M.ShadowTag,M.Tag); M.ShadowTag.style.visibility = "visible"; }
   }
if(time) setTimeout(show,time); else show();
return M;
}
var TGShowTip = ShowTip; if(window["ShowTip"]==null) window["ShowTip"] = ShowTip; 
// -----------------------------------------------------------------------------------------------------------
function HideTip(P){
P = InitPos(P); 
var tag = P.Tag; 
for(var i=0;i<Dialogs.length;i++) if(Dialogs[i]&&(tag && Dialogs[i].TipTag==tag || !tag && Dialogs[i].TipTag==="")) Dialogs[i].Close();
}
// -----------------------------------------------------------------------------------------------------------
ME.Tip;
// -----------------------------------------------------------------------------------------------------------
AttachEvent(document,"keydown",Dialogs.KeyDown); 
AttachEvent(document,"keypress",Dialogs.KeyPress); 
if(BTouch) {
   AttachEvent(document,"touchstart",Dialogs.TouchStart);
   AttachEvent(document,"touchend",Dialogs.TouchEnd);
   }
if(BMouse) {
   AttachEvent(document,"click",Dialogs.Click);
   AttachEvent(document,"contextmenu",Dialogs.RightClick);
   AttachEvent(document,"mouseover",Dialogs.MouseOver);
   AttachEvent(document,"mousemove",Dialogs.MouseMove);
   }
AttachEvent(window,"resize",Dialogs.Resize);
if(!BOpera && !BOpera8) AttachEvent(document.documentElement,"scroll",Dialogs.Scroll);
AttachEvent(window,"scroll",Dialogs.Scroll);
AttachEvent(window,"load",function(){
   if(!BOpera && !BOpera8) AttachEvent(document.body,"scroll",Dialogs.Scroll);
   if(BIEStrict) GetIEZoom();
   SetScrollConst();
   });
// -----------------------------------------------------------------------------------------------------------
ME.Dialog;

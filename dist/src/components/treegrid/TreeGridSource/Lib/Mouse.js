MS.LibMouse;
// -----------------------------------------------------------------------------------------------------------
var MouseObjects = [];
MouseObjects.X = 0; MouseObjects.Y = 0;
// -----------------------------------------------------------------------------------------------------------
var TLibMouseObject = {

   Vertically : 1,      
   Horizontally : 1,    
   DropUp : 1,          

   DY : 5,              
   DropDX : 0,          
   DropDY : 5,          
   Class : "GMMouse",   
   Start : 2,           
                        
   _nope:0 };  
// -----------------------------------------------------------------------------------------------------------
function AttachMouse(M,ev,tag){
if(!M) M = { };
else M = FromJSON(M);
if(!M) return;
if(ev&&ev.changedTouches) ev = ev.changedTouches[0];
if(ev) { MouseObjects.X = ev.clientX; MouseObjects.Y = ev.clientY; }

if(M.offsetLeft!=null) M = {Tag:M};
if(tag) M.BaseTag = tag;
if(!M.Tag) M.Tag = M.BaseTag;
if(typeof(M.Tag)!="object") M.Tag = GetElem(M.Tag);
if(typeof(M.BaseTag)!="object") M.BaseTag = GetElem(M.BaseTag);
if(!M.BaseTag) M.BaseTag = M.Tag;
if(!M.Tag) return;
for(var i in TLibMouseObject) if(M[i]==null) M[i] = TLibMouseObject[i];

var s = GetStyle(M.Tag), abs = s.position=="absolute", A = ElemToAbsolute(M.Tag);
var cpy = M.Copy;
if(ev){
   if(M.LeftCopy!=null && (BIEA||BSafari ? ev.button==1 : ev.button==0)) cpy = M.LeftCopy;
   if(M.RightCopy!=null && (BIEA||BSafari ? ev.button==2 : ev.button==1)) cpy = M.RightCopy;
   }
if(cpy==null) cpy = !abs;
if(M.BaseTag.moveonly) cpy = 0; 
M.Cpy = cpy;
M.Abs = abs;
M.OX = A[0]; M.OY = A[1];
M.SX = 0; M.SY = 0;
if(M.Start) { M.StartX = MouseObjects.X; M.StartY = MouseObjects.Y; }
else M.Create();

if(M.Area){
   if(typeof(M.Area)=="string") M.Area = GetElem(M.Area);
   if(M.Area && M.Area.offsetLeft!=null){
      var B = ElemToAbsolute(M.Area);
      M.Area = [B[0],B[1],M.Area.clientWidth?M.Area.clientWidth:M.Area.offsetWidth,M.Area.clientHeight?M.Area.clientHeight:M.Area.offsetHeight];
      }
   else if(!M.Area.length) M.Area = [M.Area.X,M.Area.Y,M.Area.Width,M.Area.Height];
   }  
MouseObjects.Add(M);
if(ev&&ev.target) {
   if(BTablet){ ev.target.ontouchend = MouseObjects.MouseUp; ev.target.ontouchmove = MouseObjects.MouseMove; }
   else if(BTouch) { AttachEvent(ev.target,"touchend",MouseObjects.MouseUp); AttachEvent(ev.target,"touchmove",MouseObjects.MouseMove); }
   }
return M;
}
var TGAttachMouse = AttachMouse; if(window["AttachMouse"]==null) window["AttachMouse"] = AttachMouse; 
// -----------------------------------------------------------------------------------------------------------
function DetachMouse(tag){
for(var i=0;i<MouseObjects.length;i++){
   var M = MouseObjects[i]; if(!M) continue;
   if(!tag || M.Tag==tag || M.BaseTag==tag) M.Cancel();
   }
}
var TGDetachMouse = DetachMouse; if(window["DetachMouse"]==null) window["DetachMouse"] = DetachMouse; 
// -----------------------------------------------------------------------------------------------------------
TLibMouseObject.Create = function(){
function Clone(tag,cls){
   var D = tag.cloneNode(1);
   
   var tn = D.tagName.toLowerCase();
   if(tn=="td" || tn=="tr"){
      var T = document.createElement("div");
      T.innerHTML = CTableCSP0+CTfoot+"<tr><td></td></tr>"+CTableEnd;
      if(tn=="td") T.firstChild.rows[0].replaceChild(D,T.firstChild.rows[0].cells[0]);
      else T.firstChild.rows[0].parentNode.replaceChild(D,T.firstChild.rows[0]);
      if(cls) T.className = cls;
      D = T;
      }
   else if(cls) D.className = D.className+" "+cls;
   return D;
   }

if(this.Cpy) {
   var D = Clone(this.Tag,this.Class+"DragObject"), S = EventToWindow();
   D.style.left = (this.DX==null ? this.OX : MouseObjects.X+this.DX+S[0]) + "px";
   D.style.top = (this.DY==null ? this.OY : MouseObjects.Y+this.DY+S[1]) + "px";
   AppendTag(D);
   this.Object = D;
   this.ClassOrig = this.Tag.className;
   this.Tag.className = this.ClassOrig+" "+this.Class+"Orig";
   }   

else {
   if(this.Abs) {
      this.Object = this.Tag;
      }
   else {
      var D = Clone(this.Tag); this.Object = D;
      D.style.position = "absolute";
      D.style.left = this.OX+"px";
      D.style.top = this.OY+"px";
      AppendTag(D);
      this.Tag.style.visibility = "hidden";
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TLibMouseObject.Cancel = function(){
if(!this.Object){ this.Delete(); return; }
if(!this.Cpy) {
   if(this.Abs) { this.Tag.style.left = this.OX+"px"; this.Tag.style.top = this.OY+"px"; }
   else { this.Tag.style.visibility = ""; }
   }
else this.Tag.className = this.ClassOrig;
this.Delete();
if(this.OnCancel) this.OnCancel(this.OX,this.OY);
}
// -----------------------------------------------------------------------------------------------------------
TLibMouseObject.Drop = function(){
var ret;
if(!this.Object){ this.Delete(); return; }
if(this.Area && this.Cpy && !this.MouseInArea()) { this.Cancel(); return; }
if(this.OnDrop){
   var x,y;
   if(this.Cpy){ x = MouseObjects.X; y = MouseObjects.Y; }
   else { x = parseInt(this.Object.style.left); y = parseInt(this.Object.style.top); }
   ret = this.OnDrop(x,y,this.Object,this.OX,this.OY);
   if(ret==false) { this.Cancel(); return; }
   }
if(!ret){
   var M = this; function Copy(){  
      var o = M.Object, t = M.Tag, b = M.BaseTag;
      for(var i in t) if(i.indexOf("on")==0) o[i] = t[i];
      if(t!=b){ 
         var A = t.getElementsByTagName(b.tagName);
         for(var i=0;i<A.length;i++) if(A[i]==b) break;
         A = o.getElementsByTagName(b.tagName);
         o = A[i];
         for(var i in b) if(i.indexOf("on")==0) o[i] = b[i];
         } 
      o.onclick = M.OrigClick;
      o.oncontextmenu = M.OrigRClick;
      if(M.Cpy==2) o.moveonly = 1;
      }
   if(this.Cpy) {
      this.Object.className = this.ClassOrig;
      this.Tag.className = this.ClassOrig;
      if(!this.Abs) this.Object.style.position = "absolute";
      var S = EventToWindow();
      if(this.DX!=null) this.Object.style.left = (MouseObjects.X+this.DropDX+S[0])+"px";
      if(this.DY!=null) this.Object.style.top = (MouseObjects.Y+this.DropDY+S[1])+"px";
      Copy();
      this.Object = null;
      }
   else if(!this.Abs) { Copy(); this.Tag = this.Object; this.Object = null; }
   }
this.Delete();   
}
// -----------------------------------------------------------------------------------------------------------
TLibMouseObject.Delete = function(){
if(this.Object && this.Tag!=this.Object) this.Object.parentNode.removeChild(this.Object);
this.Object = null;
delete MouseObjects[this.id];
this.id = null;
while(MouseObjects.length && !MouseObjects[MouseObjects.length-1]) MouseObjects.length--; 
if(this.Dragging){
   var M = this; setTimeout(function(){
      M.BaseTag.onclick = M.OrigClick;
      M.BaseTag.oncontextmenu = M.OrigRClick;
      document.onclick = M.DocClick;
      document.oncontextmenu = M.DocRClick;
      },10);
   this.Dragging = 0;   
   }
}
// -----------------------------------------------------------------------------------------------------------
TLibMouseObject.MouseInArea = function(){
if(!this.Area) return true;
var E = EventToAbsolute({clientX:MouseObjects.X,clientY:MouseObjects.Y}), A = this.Area;
return E[0]>=A[0] && E[0]<=A[0]+A[2] && E[1]>=A[1] && E[1]<=A[1]+A[3];
}
// -----------------------------------------------------------------------------------------------------------
MouseObjects.Add = function(M){
if(M.id!=null) return; 
for(M.id=0;MouseObjects[M.id];M.id++);
MouseObjects[M.id] = M;
M.This = "MouseObjects["+M.id+"]";
}
// -----------------------------------------------------------------------------------------------------------
MouseObjects.MouseMove = function(ev){
if(!ev) ev = window.event; if(!ev) return; 
if(ev.changedTouches) ev = ev.changedTouches[0];
var DX = ev.clientX - MouseObjects.X, DY = ev.clientY - MouseObjects.Y;
if(!DX && !DY) return;
MouseObjects.X = ev.clientX; MouseObjects.Y = ev.clientY;
var chg = 0;
for(var i=0;i<MouseObjects.length;i++){
   var M = MouseObjects[i]; if(!M) continue;
   if(!M.Object){
      if(Math.abs(M.StartX - MouseObjects.X) >= M.Start || Math.abs(M.StartY - MouseObjects.Y) >= M.Start) M.Create();
      else continue;
      M.OrigClick = M.BaseTag.onclick; M.BaseTag.onclick = CancelEvent;
      M.OrigRClick = M.BaseTag.oncontextmenu; M.BaseTag.oncontextmenu = CancelEvent;
      M.DocClick = document.onclick; document.onclick = CancelEvent;
      M.DocRClick = document.oncontextmenu; document.oncontextmenu = CancelEvent;
      M.Dragging = 1;
      }
   var O = M.Object, dx = DX + M.SX, dy = DY + M.SY;
   if(!M.Cpy && !M.MoveOut){
      var x = parseInt(O.style.left) + dx, y = parseInt(O.style.top) + dy;
      var E = M.Area;
      if(!E) E = GetWindowArea();
      if(x < E[0]) { M.SX = dx; dx -= x - E[0]; M.SX -= dx; }
      else if(x+O.offsetWidth > E[0]+E[2]){ M.SX = dx; dx -= x+O.offsetWidth - E[0]-E[2]; M.SX -= dx; }
      else M.SX = 0;
      if(y < E[1]) { M.SY = dy; dy -= y - E[1]; M.SY -= dy; }
      else if(y+O.offsetHeight > E[1]+E[3]){ M.SY = dy; dy -= y+O.offsetHeight - E[1]-E[3]; M.SY -= dy; }
      else M.SY = 0;
      }
   if(!M.Horizontally) dx = 0;
   if(!M.Vertically) dy = 0;
   if(dx) O.style.left = (parseInt(O.style.left) + dx) + "px";
   if(dy) O.style.top = (parseInt(O.style.top) + dy) + "px";
   if(M.OnMove && (dx||dy)) M.OnMove(dx,dy);
   if(M.Area){ 
      if(!M.MouseInArea()){
         if(M.CancelOut) M.Cancel();
         if(M.Cpy && !M.MoveOut) O.style.display =  "none";
         }
      else if(M.Cpy && !M.MoveOut) O.style.display =  "";
      }
   chg = 1;
   }  
if(chg) ClearSelection();
}
// -----------------------------------------------------------------------------------------------------------
MouseObjects.MouseUp = function(ev){
if(!ev) ev = window.event; 
for(var i=0;i<MouseObjects.length;i++){
   var M = MouseObjects[i]; if(!M) continue;
   if(M.DropUp){
      M.Drop();
      M.NoClickTo = new Date()+100;
      }
   }
}

// -----------------------------------------------------------------------------------------------------------
MouseObjects.MouseOut = function(ev){
if(Try){ var doc = document.documentElement;   }
else if(Catch){ return; }
if(!ev) ev = event;
if(BIEA && ev.clientX<0 && ev.clientY<0 || !BIEA && !ev.relatedTarget){
   for(var i=0;i<MouseObjects.length;i++){
      var M = MouseObjects[i]; if(!M) continue;
      if(M.DropUp) M.Cancel();
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
AttachEvent(document,"mousemove",MouseObjects.MouseMove);
AttachEvent(document,"mouseup",MouseObjects.MouseUp);
AttachEvent(document,"mouseout",MouseObjects.MouseOut);
// -----------------------------------------------------------------------------------------------------------
ME.LibMouse;

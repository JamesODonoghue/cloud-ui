// -----------------------------------------------------------------------------------------------------------
// Returns html object of given row and section (sec = 0 left, 1 mid, 2 right)
TGP.GetRow = function(row,sec){
return row["r"+sec];
}
// -----------------------------------------------------------------------------------------------------------
// Returns html object of children section of given row and section (sec = 0 left, 1 mid, 2 right)
MS.Tree;
TGP.GetRowChildren = function(row,sec){
if(!row.Hasch) return null;
var r = row["r"+sec];
if(!r) return row["rch"+sec];
return this.ReversedTree ? r.previousSibling : r.nextSibling;
}
ME.Tree;
// ---------------------------------------------------------------------------------------------------------------------------
TGP.GetCell = function(row,col){
if(!row || !col || row.Animating) return null;

MS.Space;
if(row.Space){
   var r = row.r1; if(!r||!r.firstChild) return null;
   if(row.SpaceWrap) return r.firstChild.childNodes[row[col+"Pos"]];
   return r.firstChild.rows[0].cells[row[col+"Pos"]+(BIEA?1:0)];
   }
ME.Space;
MS.RowSpan; if(row.RowSpan) return this.GetSpanCell(row,col); ME.RowSpan;
var C = this.Cols[col]; if(!C || !row.r1) return null;
var pos = C.VPos, r = row["r"+C.Sec], cpl = this.CPLastSec&&row.Fixed&&C.MainSec==1;
if(cpl) { pos = C.FPos; r = row.r1; }
if(!r) return null;
if(row.Page) return r;
MS.UserSec; var usec = this.UserSec[C.MainSec]; if(row[usec]!=null || row.Def[usec]!=null) return null; ME.UserSec;

MS.ColSpan;
if(row.Spanned){
   var S = this.ColNames[C.Sec], spn = row[col+"Span"];
   if(spn==0) { 
      if(cpl) {
         var sec = C.Sec, p = C.Pos;
         while(row[S[p]+"Span"]==0) if(--p<0){ S = this.ColNames[--sec]; p = S.length-1; }
         }
      else for(var p=C.Pos-1;p&&row[S[p]+"Span"]==0;p--);
      col = S[p]; C = this.Cols[col]; pos = cpl ? C.FPos : C.VPos;
      }
   if(pos<0){ 
      var spn = row[col+"Span"];      
      if(spn==1) return null; 
      if(cpl) {
         var sec = C.Sec, p = C.Pos; S = this.ColNames[sec];
         while(spn>1&&pos<0) {
            if(!S[p]){ S = this.ColNames[++sec]; p = 0; }
            col = S[p]; pos = this.Cols[col].FPos;
            p++; spn--;
            }
         }
      else for(var p=C.Pos+1;p<S.length&&spn>1&&pos<0;p++,spn--) { col = S[p]; pos = this.Cols[col].VPos;  }
      if(this.MainCol && !this.HideTree && col==this.MainCol) pos--; 
      }
   
   }
ME.ColSpan;

if(pos<0) return null;  
for(var i=0,p=0;p<pos;p+=r.cells[i++].colSpan);
return r.cells[i];
}
// -----------------------------------------------------------------------------------------------------------
// Returns first HTML body for given section
TGP.GetBody = function(sec){
var B = this.BodySec[sec].firstChild; if(!B) return null;
if(BOpera8) B = B.firstChild; 

return B;
}
// -----------------------------------------------------------------------------------------------------------
// Returns input of given id or name
MS.Submit;
TGP.GetInput = function(id){
var I = GetElem(id);
if(I){
   var tag = I.tagName.toLowerCase();
   if(tag == "input" || tag == "textarea") return I;
   }
var A = document.getElementsByName(id);
var MF = this.GetForm(this.MainTable);
var MI = null;
for(var i=0;i<A.length;i++){
   I = A[i];
   var tag = I.tagName.toLowerCase();
   if(tag == "input" || tag == "textarea"){
      var F = this.GetForm(tag);
      if(F && (F==MF || !MF)) return I;
      MI = I;
      }
   }
return MI;
}
// -----------------------------------------------------------------------------------------------------------
// Returns form where given tag resides
TGP.GetForm = function(tag){
if(!tag || !tag.tagName) return null;
while(tag && tag.tagName){
   if(tag.tagName.toLowerCase()=="form") return tag;
   tag = tag.parentNode;
   }
}
ME.Submit;
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Sets MouseObject under mouse cursor, object is added object, ev is event with mouse position
// If html is given, function uses it instead of object.innerHTML
// Move is permitted shift with mouse (&1 - horizontal, &2 - vertical)
TGP.SetMouseObject = function(object,ev,move,html,func,data,tag2){
MS.MouseObject;
if(this.ShowDrag==0) return;
TGP.DelMouseObject();
var M = new TMouseObject, A = EventToAbsolute();
var e = document.createElement("div");
e.style.position = "absolute";
if(this.ZIndex) e.style.zIndex = this.ZIndex+40;
if(object){
   MS.Touch; if(ev.changedTouches){ ev = ev.changedTouches[0]; if(ev==null) return; } ME.Touch; 
   var pos = EventToElem(ev,object);
   M.DX = pos[0] - A[0];
   M.DY = pos[1] - A[1];
   e.style.left = Math.floor((ev.clientX/(ev.type?CZoom:1)-M.DX))+"px";
   e.style.top = Math.floor((ev.clientY/(ev.type?CZoom:1)-M.DY))+"px";
   e.className = object.className;
   }
else if(!html) return;   
else {
   e.style.left = 0; e.style.top = 0; 
   }
e.innerHTML = html ? html : object.innerHTML;
if(this.Img) e.className = this.Img.Style+"MouseObject";
var f = new Function("ev","TGCancelEvent"+(BIEA?"(event);":"(ev);"));
if(BMouse) e.onmousemove = f;
if(BTablet) e.ontouchmove = f; else if(BTouch) AttachEvent(e,"touchmove",f);

M.Tag = e;
if(tag2){
   if(typeof(tag2)=="string"){
      var ee = document.createElement("div");
      ee.style.position = "absolute";
      if(this.ZIndex) ee.style.zIndex = this.ZIndex+41;
      ee.className = tag2;
      if(BMouse) ee.onmousemove = f;
      if(BTablet) ee.ontouchmove = f; else if(BTouch) AttachEvent(ee,"touchmove",f);
      ee.style.display = "none";
      this.AppendTag(ee);
      tag2 = ee;
      }
   M.Tag2 = tag2;
   M.DX2 = 0; M.DY2 = 0;
   }

if(move>=0) M.Move = move;
M.Func = func;
M.Data = data;
M.Scroll = GetWindowScroll();
Grids.MouseObject = M;

if(M.DX==null) M.DX = -A[0];
M.DY = -A[1] - (this.Touched ? 25 : 5);  
e.style.display = "none"; M.HiddenX = M.Move&1; M.HiddenY = M.Move&2; 
this.AppendTag(e);
TGP.MoveMouseObject(ev);
return M;
ME.MouseObject;
}
// -----------------------------------------------------------------------------------------------------------
function DragByMouse(object,ev,move,html,func,data){
var M = (Grids[0]?Grids[0]:TGP).SetMouseObject(object,ev,move,html,func,data); 
MS.Touch;
if(M && BTouch && ev.target){
   M.Target = ev.target;
   if(BTablet){
      M.TouchMove = M.Target.ontouchmove; M.Target.ontouchmove = TGP.MoveMouseObject; if(M.TouchMove==TGP.MoveMouseObject) M.TouchMove = null;
      M.TouchEnd = M.Target.ontouchend; M.Target.ontouchend = TGP.DelMouseObject; if(M.TouchEnd==TGP.DelMouseObject) M.TouchEnd = null;
      }
   else {
      M.TouchMove = M.Target.getAttribute("ontouchmove"); M.Target.setAttribute("ontouchmove","TGMoveMouseObject(event);"); if(M.TouchMove==M.Target.getAttribute("ontouchmove")) M.TouchMove = null;
      M.TouchEnd = M.Target.getAttribute("ontouchend"); M.Target.setAttribute("ontouchend","TGDelMouseObject(event);"); if(M.TouchEnd==M.Target.getAttribute("ontouchend")) M.TouchEnd = null;
      }
   }
ME.Touch;
return M;
}
var TGDragByMouse = DragByMouse; if(window["DragByMouse"]==null) window["DragByMouse"] = DragByMouse; 
// -----------------------------------------------------------------------------------------------------------
TGP.FindEventGrid = function(ev){
if(ev.changedTouches) ev = ev.changedTouches[0]; if(!ev) return null;
var A = EventToWindow(ev);
for(var i=0;i<Grids.length;i++) {
   var G = Grids[i]; if(!G || !G.MainTable) continue;
   var X = A[0] - G.TableX, Y = A[1] - G.TableY; 
   if(X>=0 && X<G.TableWidth && Y>=0 && Y<G.TableHeight) return G;
   }
return null;
}
// -----------------------------------------------------------------------------------------------------------
// Moves MouseObject under cursor
TGP.MoveMouseObject = function(ev){
MS.MouseObject;
var M = Grids.MouseObject, l = null, t = null;
if(M && ev){
   MS.Touch; 
   if(M.TouchMove) M.TouchMove(ev); 
   if(ev.changedTouches){ ev = ev.changedTouches[0]; if(ev==null) return; } 
   ME.Touch;
   if(M.Move&1) l = Math.floor(ev.clientX/(ev.type?CZoom:1)-M.DX);
   if(M.Move&2) t = Math.floor(ev.clientY/(ev.type?CZoom:1)-M.DY);
   var A = GetWindowSize(), B = GetWindowScroll(), chg = 0;
   if(l!=null) {
      l += B[0] - M.Scroll[0];
      var sw = M.Tag.scrollWidth;
      if(l+sw+2>=B[0] && l<A[0]+B[0]-2) {
         if(M.HiddenX){ M.HiddenX = 0; if(!M.HiddenY) { M.Tag.style.display = ""; sw = M.Tag.scrollWidth; if(M.Tag2) M.Tag2.style.display = "";  } }
         var w = sw; 
         if(l+w>A[0]+B[0]-2) w = A[0]+B[0]-l-2;
         M.Tag.style.width = !sw||w<sw ? w+"px" : "";
         if(M.Tag.style.left!=l+"px"){ M.Tag.style.left = l+"px"; chg = 1; }
         if(M.Tag2) M.Tag2.style.left = (l+M.DX2)+"px";
         
         }
      else { M.Tag.style.display = "none"; M.HiddenX = 1; if(M.Tag2) M.Tag2.style.display = "none"; }
      }
   if(t!=null) {
      t += B[1] - M.Scroll[1];
      var h = A[1]-t-2+B[1];
      if(h>0) {
         if(M.HiddenY){ M.HiddenY = 0; if(!M.HiddenX) {  M.Tag.style.display = ""; if(M.Tag2) M.Tag2.style.display = "";  } }
         M.Tag.style.height = M.Tag.scrollHeight>h ? h+"px" : "";
         if(M.Tag.style.top!=t+"px"){ M.Tag.style.top = t+"px"; chg = 1; }
         if(M.Tag2) M.Tag2.style.top = (t+M.DY2)+"px";
         }
      else { M.Tag.style.display = "none"; if(M.Tag2) M.Tag2.style.display = "none"; M.HiddenY = 1; }
      }
   MS.Touch;
   if(M.Target&&chg){ 
      var G = TGP.FindEventGrid(ev); 
      if(G) {
         G.UpdateARow(1,ev.clientX,ev.clientY);
         G.GridMouseOver(ev); 
         }
      }
   ME.Touch;
   }
ME.MouseObject;
}
TGMoveMouseObject = TGP.MoveMouseObject;
// -----------------------------------------------------------------------------------------------------------
// Destroys MouseObject
TGP.DelMouseObject = function(ev){
MS.MouseObject;
var M = Grids.MouseObject;
if(M){
   MS.Touch;
   if(ev&&BTouch){
      if(M.TouchEnd) M.TouchEnd(ev);
      if(M.Target){ 
         if(ev.changedTouches) ev = ev.changedTouches[0]; 
         if(ev){
            var G = TGP.FindEventGrid(ev); 
            if(G) {
               G.UpdateARow(1,ev.clientX,ev.clientY);
               G.GridMouseOver(ev,1); 
               G.GridMouseUp(ev); 
               }
            }
         if(BTablet) { M.Target.ontouchmove = M.TouchMove; M.Target.ontouchend = M.TouchEnd; }
         else { M.Target.setAttribute("ontouchmove",M.TouchMove); M.Target.setAttribute("ontouchend",M.TouchEnd); }
         }
      }
   ME.Touch;
   if(M.Tag.parentNode) M.Tag.parentNode.removeChild(M.Tag);
   if(M.Tag2&&M.Tag2.parentNode) M.Tag2.parentNode.removeChild(M.Tag2);
   if(M.Func) M.Func(M.Data);
   Grids.MouseObject = null;
   }
ME.MouseObject;   
}
TGDelMouseObject = TGP.DelMouseObject;
// -----------------------------------------------------------------------------------------------------------
TGP.GetMouseVLine = function(pager){
var I = this.Img, h = this.BodyMain[1].parentNode.parentNode.offsetHeight+I.BodyMHeight;
if(this.HeadMain[1] && this.HeadMain[1].offsetHeight) h += this.HeadMain[1].parentNode.parentNode.offsetHeight+I.HeadMHeight-this.HeadMain[1].parentNode.parentNode.offsetTop;
else h += this.BodyMain[1].parentNode.parentNode.offsetTop;
if(this.FootMain[1] && this.FootMain[1].offsetHeight) h += this.FootMain[1].parentNode.parentNode.offsetHeight+this.FootMain[1].parentNode.parentNode.offsetTop;
if(pager){ var hs = this.ScrollHorzParent[1].parentNode.offsetHeight; if(hs) h += hs; }

var t = this.HeadMain[1].parentNode.parentNode.offsetTop;
for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Visible && r.r1){
   if(r.Space>0 && r.Space<4) h += r.r1.offsetHeight;
   else if(r.Space==0) t += r.r1.offsetHeight;
   }
MS.Scale;
if(this.Scale) { t *= this.Scale; h *= this.Scale; }
if(this.ScaleY) { t *= this.ScaleY; h *= this.ScaleY; }
ME.Scale;
var A = AbsoluteToWindow();
return [this.TableY+t-A[1],h,A[0]];
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetMouseVLine = function(X,Y,pager,nocursor){
MS.MouseObject;
if(!this.ShowDrag) return;
var A = this.GetMouseVLine(pager);
var ev = {clientX:X,clientY:Y};
this.SetMouseObject(null,ev,1,"<div class='"+this.Img.Style+"VLine' style='"+(nocursor?"cursor:inherit;":"")+"height:"+A[1]+"px;'>"+CNBSP+"</div>");
var M = Grids.MouseObject;
M.DX = A[2] - (EventToWindow()[0]/CZoom) - 2; // Aby nastavaly udalosti gridu
M.Tag.style.left = X-M.DX+"px";
M.Tag.style.top = A[0]+"px";
ME.MouseObject;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetMouseHLine = function(){
var I = this.Img;
var l = this.TmpLeftWidth ? I.LeftAllLeft : I.MidAllLeft; 
var w = this.TmpLeftWidth + this.TmpMidWidth + this.TmpRightWidth - l - (this.TmpRightWidth ? I.RightAllWidth-I.RightAllLeft : I.MidAllWidth-I.MidAllLeft);
var A = AbsoluteToWindow();
return [this.TableX+l-A[0],w,A[1]];
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetMouseHLine = function(X,Y,nocursor){
MS.MouseObject;
if(!this.ShowDrag) return;
var A = this.GetMouseHLine();
var ev = {clientX:X,clientY:Y};
this.SetMouseObject(null,ev,2,"<div class='"+this.Img.Style+"HLine' style='"+(nocursor?"cursor:inherit;":"")+"width:"+A[1]+"px;'>"+CNBSP+"</div>");
var M = Grids.MouseObject;
M.DY = A[2] - (EventToWindow()[1]/CZoom) - 2; // Aby nastavaly udalosti gridu
M.Tag.style.left = A[0]+"px";
M.Tag.style.top = Y-M.DY+"px";
ME.MouseObject;
}
// -----------------------------------------------------------------------------------------------------------

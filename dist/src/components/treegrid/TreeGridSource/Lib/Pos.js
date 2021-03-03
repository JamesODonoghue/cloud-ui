// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
function AbsoluteToWindow(dummy){
var bod = document.body, doc = document.documentElement; if(!bod) return [0,0];
if(AbsoluteToWindow.AB==null){
   var s = GetStyle(bod);
   AbsoluteToWindow.AB = (s.position=="absolute"||s.position=="relative") && bod.getBoundingClientRect; 
   }
if(AbsoluteToWindow.AB) { 
   var R = bod.getBoundingClientRect();
   var x = R.left, y = R.top;
   if(BIEA) { 
      x += doc.scrollLeft+bod.clientLeft; y += doc.scrollTop+bod.clientTop; 
      if(BIEStrict&&!BIEA8) { x -= doc.clientLeft; y -= doc.clientTop; }
      }
   else if(BIPAD){ x += bod.scrollLeft+bod.clientLeft-doc.offsetLeft; y += bod.scrollTop+bod.clientTop-doc.offsetTop; } 
   else if(BChrome){
      var B = doc.getBoundingClientRect();
      x -= B.left-doc.offsetLeft; y -= B.top-doc.offsetTop; x += bod.clientLeft; y += bod.clientTop; 
      }
   else if(BSafariWin){ 
      x += bod.scrollLeft+bod.clientLeft; y += bod.scrollTop+bod.clientTop; 
      }
   else if(BMozilla) { 
      if(BStrict) { x += doc.scrollLeft-bod.offsetLeft; y += doc.scrollTop-bod.offsetTop; }
      else { x += bod.scrollLeft-bod.offsetLeft; y += bod.scrollTop-bod.offsetTop; }
      }
   else if(BOpera) { 
      if(AbsoluteToWindow.BL==null){
         var s = GetStyle(bod);
         if(s) { var bl = parseInt(s.borderLeftWidth), bt = parseInt(s.borderTopWidth); AbsoluteToWindow.BL = bl?bl:0; AbsoluteToWindow.BT = bt?bt:0; }
         }
      if(BStrict) { x += doc.scrollLeft+AbsoluteToWindow.BL; y += doc.scrollTop+AbsoluteToWindow.BT; }
      else { x += bod.scrollLeft+AbsoluteToWindow.BL; y += bod.scrollTop+AbsoluteToWindow.BT; }
      }
   return [x,y];
   }

if(BIE) return [bod.clientLeft+bod.offsetLeft,bod.clientTop+bod.offsetTop];

if(BMozilla){
   if(BFF35) return [0,0];
   if(AbsoluteToWindow.ML==null){
      var s = GetStyle(doc);
      if(s) { var ml = parseInt(s.marginLeft), mt = parseInt(s.marginTop); AbsoluteToWindow.ML = ml?ml:0; AbsoluteToWindow.MT = mt?mt:0; }
      }
   return [-doc.offsetLeft+AbsoluteToWindow.ML,-doc.offsetTop+AbsoluteToWindow.MT];
   }  
if(BChrome || BSafariWin) { 
   
    
   return [0,0]; 
   }
if(BIPAD) return BStrict ? [-doc.offsetLeft-doc.scrollLeft,-doc.offsetTop-doc.scrollTop] : [-doc.offsetLeft,-doc.offsetTop];

if(BSafari){
   if(AbsoluteToWindow.BL==null){
      var s = GetStyle(doc);
      if(s) { var bl = parseInt(s.borderLeftWidth), bt = parseInt(s.borderTopWidth); AbsoluteToWindow.BL = bl?bl:0; AbsoluteToWindow.BT = bt?bt:0; }
      }
   return [doc.offsetLeft+AbsoluteToWindow.BL,doc.offsetTop+AbsoluteToWindow.BT];
   }  
   
return [0,0]; 
}
// -----------------------------------------------------------------------------------------------------------
function EventToWindow(ev){
var bod = document.body, doc = document.documentElement, x = ev?ev.clientX:0, y = ev?ev.clientY:0;

if(BOpera&&BStrict || BIE8Strict || BMozilla&&BStrict) return [x+doc.scrollLeft,y+doc.scrollTop];  
if(BIEStrict) {
   if(ev&&ev.type) return [(x+doc.scrollLeft-doc.clientLeft)/CZoom,(y+doc.scrollTop-doc.clientTop)/CZoom];
   else return [x+(doc.scrollLeft-doc.clientLeft)/CZoom,y+(doc.scrollTop-doc.clientTop)/CZoom];
   }
if(BChrome) {
   var B = doc.getBoundingClientRect();
   return [x-B.left+doc.offsetLeft,y-B.top+doc.offsetTop];
   }
if(BSafari5) return [x,y];
if(BIPAD) return [x-doc.offsetLeft+bod.scrollLeft,y-doc.offsetTop+bod.scrollTop];
return [x+bod.scrollLeft,y+bod.scrollTop]; 
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
function EventToAbsolute(ev){ var A = EventToWindow(ev), B = AbsoluteToWindow(); return [A[0]-B[0],A[1]-B[1]]; }
function ElemToAbsolute(elem){ var A = ElemToWindow(elem), B = AbsoluteToWindow(); return [A[0]-B[0],A[1]-B[1]]; }
function EventToElem(ev,elem){ var A = ElemToWindow(elem), B = EventToWindow(ev); return [B[0]-A[0],B[1]-A[1]]; }
function ElemToParent(elem,par){ var A = ElemToWindow(par), B = ElemToWindow(elem); return [B[0]-A[0],B[1]-A[1]]; }
var TGEventXYToElement = EventToElem; if(window["EventXYToElement"]==null) window["EventXYToElement"] = EventToElem; 
var TGElemToParent = ElemToParent; if(window["ElemToParent"]==null) window["ElemToParent"] = ElemToParent; 
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Returns element position relative to its parent
function ElemToWindow(elem,dummy){
if(!elem) return null;
var bod = document.body, doc = document.documentElement, rtl = 0;

if(elem.getBoundingClientRect && !TGNoIEClientRect){
   if(!elem.parentNode) return [0,0]; 
   var A = elem.getBoundingClientRect();
   var x = A.left, y = A.top;
   if(BIEStrict || (BMozilla||BOpera)&&BStrict){
      x += doc.scrollLeft;
      y += doc.scrollTop;
      if(!BIEA8) { x -= doc.clientLeft; y -= doc.clientTop; }
      
      }
   else {
      if(BChrome){
         var B = doc.getBoundingClientRect();
         x -= B.left-doc.offsetLeft; y -= B.top-doc.offsetTop;
         }
      
      else {
         x += bod.scrollLeft;
         y += bod.scrollTop;
         }
      
      if(BSafariMac&&!BSafariWin){
         x -= doc.offsetLeft;
         y -= doc.offsetTop;
         }
      else if(!BIE && !BChrome && !BSafariWin){
         x += bod.clientLeft;
         y += bod.clientTop;
         }
      }
      
   return [x/CZoom,y/CZoom];
   }
var x=elem.offsetLeft, y=elem.offsetTop,p,lp = elem;
try { p = elem.offsetParent; } catch(e){ return [x,y]; }  
if(!p) return AbsoluteToWindow(); 
if(BIEA){
   if(BIEStrict && CZoom!=1 && lp.style.position=="absolute"){
      x += Math.floor(lp.offsetLeft/CZoom-lp.offsetLeft);
      y += Math.floor(lp.offsetTop/CZoom-lp.offsetTop);
      }
   while(p && p!=doc){ 
      if(p==bod){       
         x+=p.offsetLeft+p.clientLeft;
         y+=p.offsetTop+p.clientTop; 
         break;
         }
      if((!BIEA8||!BStrict) && p.tagName.toLowerCase()=="table"){ 
         x-=p.clientLeft;
         y-=p.clientTop;
         }
      x+=p.offsetLeft+p.clientLeft-p.scrollLeft;
      y+=p.offsetTop+p.clientTop-p.scrollTop; 
      p = p.offsetParent;
      }
   if(BIEA8 && BStrict){ x-=bod.clientLeft; y-=bod.clientTop; }
   if(BIEStrict && CZoom!=1){
      x+=Math.floor(p.offsetLeft/CZoom-p.offsetLeft);
      y+=Math.floor(p.offsetTop/CZoom-p.offsetTop);
      } 
   }
else { 
   var po = elem;
   while(1){
   
      while(po!=p){
         po = po.parentNode;
         if(!po || po==bod) break; 
         
         if(po!=bod&&!rtl){
            x-=po.scrollLeft;
            y-=po.scrollTop;
            }
            
         if((BOpera8 || BOpera&&BOperaVer<9.5)&&po.tagName){
            var tag = po.tagName.toLowerCase();
            if(tag=='tr'){ y+=po.offsetTop; x+=po.scrollLeft; } 
            else if(tag=='tbody') x+=po.scrollLeft;
            else if(BOpera && tag=='table' && po.style.borderCollapse!='collapse') y+=Math.floor((po.offsetHeight-po.clientHeight)/2); 
            }

         if(BFF3 && po.tagName){
            var tag = po.tagName.toLowerCase();
            if(tag=="td"){ x+=po.clientLeft; y+=po.clientTop; }
            }      
         if((BIPAD||BSafariWin) && po.tagName){
            var tag = po.tagName.toLowerCase();
            if(tag=="table" || tag=="td"){ x+=po.clientLeft; y+=po.clientTop; }
            }      
         }
      
      if(!p || p==bod) break;
      x+=p.offsetLeft;
      y+=p.offsetTop;
      lp = p; 
      p = p.offsetParent;
      if(p==bod){
         var abs = lp.Absolute; if(abs==null){ var s = GetStyle(lp); abs = s.position=="absolute"; lp.Absolute = abs; }
         if(abs) {
            
            break;
            }
         }
      }
      
   if(BOpera8 || BMozilla || BSafariWin || BSafariMac){
      var abs = lp.Absolute; if(abs==null){ var s = GetStyle(lp); abs = s.position=="absolute"; lp.Absolute = abs; }
      if(abs){
         var A = AbsoluteToWindow();
         x += A[0]; y += A[1]; 
         return [x,y];
         }
      if(BMozilla||BSafariWin){
         if(doc.marginLeft==null){
            var s = GetStyle(doc);
            var ml = parseInt(s.marginLeft), mt = parseInt(s.marginTop);
            doc.marginLeft = ml?ml:0; doc.marginTop = mt?mt:0;
            }
         x += doc.marginLeft; y += doc.marginTop;
         }
      
      if(BFF3&&!BStrict){ x -= bod.offsetLeft; y -= bod.offsetTop; }
      
      if(BSafariMac&&!abs){ x += bod.offsetLeft; y += bod.offsetTop; }
      if(BMozilla||BSafariWin){
         if(bod.clientLeft==null) {
            var s = GetStyle(bod);
            var bl = parseInt(s.borderLeftWidth), bt = parseInt(s.borderTopWidth);
            bod.clientLeft = bl?bl:0; bod.clientTop = bt?bt:0;
            }
         x += bod.clientLeft; y += bod.clientTop; 
         }
      if(BOpera8){
          x += bod.offsetLeft+bod.clientLeft;
         y += bod.offsetTop+bod.clientTop;
         }
      
      }      
   if(BKonqueror){ x += doc.offsetLeft; y += doc.offsetTop; }
      
   }

return [x,y];
}
// -----------------------------------------------------------------------------------------------------------
// Returns size of browser window, client area without scrollbars [width,height]
function GetWindowSize(spec) {
if(BIPAD || spec&&window.innerWidth) return [window.innerWidth,window.innerHeight];

var doc = document.documentElement, bod = document.body, w, h;

if(BIE) h = bod.clientHeight + bod.clientTop;
else if(BIEA||BStrict) h = doc.clientHeight;

else h = bod.clientHeight;

if(BIE) w = bod.clientWidth + bod.clientLeft;
else if(BIEA||BStrict) w = doc.clientWidth;
else w = bod.clientWidth;

return [w,h];

}
var TGGetWindowSize = GetWindowSize; if(window["GetWindowSize"]==null) window["GetWindowSize"] = GetWindowSize;
// -----------------------------------------------------------------------------------------------------------
// Returns scroll position of browser window [x,y]
function GetWindowScroll() {
var doc = document.documentElement;
if(!doc || !doc.clientWidth) return [document.body.scrollLeft,document.body.scrollTop];
var bod = document.body; if(!bod) return [0,0];
return [doc.scrollLeft?doc.scrollLeft:bod.scrollLeft,doc.scrollTop?doc.scrollTop:bod.scrollTop];
}
var TGGetWindowScroll = GetWindowScroll; if(window["GetWindowScroll"]==null) window["GetWindowScroll"] = GetWindowScroll;
// -----------------------------------------------------------------------------------------------------------
function GetWindowArea(spec){
var A = GetWindowSize(spec), B = GetWindowScroll(), D = AbsoluteToWindow(1);
if(BIPAD) return [B[0],B[1],A[0],A[1]];
return [B[0]-D[0],B[1]-D[1],A[0],A[1]];
}
// -----------------------------------------------------------------------------------------------------------
// Sets scroll position of browser window [x,y]
function SetWindowScroll(x,y) {
if(Try) {
   
   var doc = document.documentElement;
   if(!doc || !doc.clientWidth || window.pageXOffset!=null && document.compatMode!="CSS1Compat") doc = document.body;
   if(x!=null && doc.scrollLeft != x) doc.scrollLeft = x; 
   if(y!=null && doc.scrollTop != y) doc.scrollTop = y;
   }
else if(Catch){ }
}
// -----------------------------------------------------------------------------------------------------------
function SetScrollConst(always,size){
if(CScrollWidth && CScrollHeight && !always) return;
var D = document.createElement("div"), s = D.style; if(Grids.HiddenScroll) D.className = "GridHiddenScroll";
s.position = "absolute"; s.left = "0px"; s.top = "0px"; s.width = "0px"; s.height = "0px"; s.overflow = "hidden";
D.innerHTML = "<div style='width:200px;height:200px;overflow:scroll;'><div style='width:300px;height:300px;overflow:hidden;'>"+CNBSP+"</div></div>";
AppendTag(D,size);
var ow = CScrollWidth, oh = CScrollHeight, F = D.firstChild;
if(BIEA){ F.clientWidth; F.offsetWidth; } 

CScrollWidth = F.offsetWidth - F.clientWidth;
CScrollHeight = F.offsetHeight - F.clientHeight;

if((CScrollWidth<2||CScrollHeight<2)){
   if(!Grids.HiddenScroll){ Grids.HiddenScroll = 1; return SetScrollConst(1); }
   if(BMozilla && navigator.userAgent.search(/macintosh/i)>=0){ 
      CScrollWidth = 9;
      CScrollHeight = 9;
      Grids.HiddenScroll = 2;
      }
   }
CScrollWidthBase = CScrollWidth;
CScrollHeightBase = CScrollHeight;
if(!BIEA10){ CScrollWidth++; CScrollHeight++; }  
if(!(CScrollWidth>5)) CScrollWidth = 22;   
if(!(CScrollHeight>5)) CScrollHeight = 22; 
D.parentNode.removeChild(D);
RemoveEmptyTag(size);
return ow != CScrollWidth || oh != CScrollHeight;
}
// -----------------------------------------------------------------------------------------------------------
var CZoom = 1;
var IEZoomDiv;
function GetIEZoom(){
if(BIEA10||!BIEA) return CZoom;
if(!IEZoomDiv){
   IEZoomDiv = document.createElement("div");
   var s = IEZoomDiv.style;
   s.position = "absolute";
   s.left = "500px";
   s.top = "0px";
   s.width = "0px";
   s.height = "0px";
   s.visibility = "hidden";
   AppendTag(IEZoomDiv);
   }
CZoom = IEZoomDiv.offsetLeft/500;
if(CZoom>0.95 && CZoom<1.05 || !CZoom) CZoom = 1;
return CZoom;
}
// -----------------------------------------------------------------------------------------------------------
function UpdateIEZoom(tag){
var upd = true;
for(var p = tag.firstChild;p;p=p.nextSibling){
   if(p.nodeType==1){ UpdateIEZoom(p); upd = false; }
   }
if(upd){ try { tag.innerHTML = tag.innerHTML;} catch(e){ } }
}
// -----------------------------------------------------------------------------------------------------------

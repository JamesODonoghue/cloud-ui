// -----------------------------------------------------------------------------------------------------------
// Returns element according to its ID
function GetElem(id){
if(document.getElementById) return document.getElementById(id);
else return document.all[id];
}
var TGGetElem = GetElem; if(window["GetElem"]==null) window["GetElem"] = GetElem;
// -----------------------------------------------------------------------------------------------------------
// Returns element according to its tag name
function GetElemTag(tag,name){
return tag ? tag.getElementsByTagName(name) : [];
}
// -----------------------------------------------------------------------------------------------------------
function AppendTag(tag,size){
if(!size) size = "GridMain";
var D = AppendTag[size];
if(!D){
   D = document.createElement("div");
   
   D.className = size;
   D.id = "TreeGridControls"+size.replace(/\s/g,"");
   var s = D.style;
   
   s.left = "0px"; s.top = "0px"; s.width = "0px"; s.height = "0px"; s.visibility = "visible";
   if(BIEA&&!BIEA9) s.position = "absolute";
   
   var N = document.body.firstChild;
   if(BIE && window.AreaObjects && AreaObjects.BodyFirst) N = N.nextSibling;
   if(BIEA&&!BIEA9&&N==AppendTag["GridMain"]) N = N.nextSibling; 
   if(!N) document.body.appendChild(D);
   else document.body.insertBefore(D,N);
   
   AppendTag[size] = D;
   }
if(tag) D.appendChild(tag);
}
// -----------------------------------------------------------------------------------------------------------
function RemoveEmptyTag(size){
if(!size) size = "GridMain";
var D = AppendTag[size];
if(D && !D.firstChild) { D.parentNode.removeChild(D); delete AppendTag[size]; }
}
// -----------------------------------------------------------------------------------------------------------
// Return computed style of given element
function GetStyle(elem){
if(!elem) return null;
if(window.getComputedStyle) return getComputedStyle(elem,null);
var v = document.defaultView;
if(v && v.getComputedStyle) return v.getComputedStyle(elem,null);
return elem.currentStyle;
}
var TGGetStyle = GetStyle; if(window["GetStyle"]==null) window["GetStyle"] = GetStyle;
// -----------------------------------------------------------------------------------------------------------
// Returns border width from given style
function GetBorderWidth(style,nopadding){
if(!style) return 0;
var bwl = parseFloat(style.borderLeftWidth), bwr = parseFloat(style.borderRightWidth);
var pwl = parseFloat(style.paddingLeft), pwr = parseFloat(style.paddingRight);
return (bwl?Math.round(bwl):0) + (bwr?Math.round(bwr):0) + (!nopadding ? (pwl?Math.round(pwl):0) + (pwr?Math.round(pwr):0) : 0);
}
// -----------------------------------------------------------------------------------------------------------
// Returns border height from given style
function GetBorderHeight(style,nopadding){
if(!style) return 0;
var bht = parseFloat(style.borderTopWidth), bhb = parseFloat(style.borderBottomWidth);
var pht = parseFloat(style.paddingTop), phb = parseFloat(style.paddingBottom);
return (bht?Math.round(bht):0) + (bhb?Math.round(bhb):0) + (!nopadding ? (pht?Math.round(pht):0) + (phb?Math.round(phb):0) : 0);
}
// -----------------------------------------------------------------------------------------------------------
// Cancels next propagation of event and default action
// type = 1 propagation only, 2 = default only
function CancelEvent(ev, type){
if(!ev) ev = window.event;
if(!ev) return;
if(!type) type=3;
if(type&4){
   if(Try){ ev.Handled = true; }
   else if(Catch){ type|=1; }
   }
if(type&1){
   if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
   else if(ev.stopPropagation) ev.stopPropagation();
   else ev.cancelBubble = true;
   }
if(type&2){
   if(ev.preventDefault){
      if(ev.cancelable) ev.preventDefault();
      }
   else ev.returnValue = false;
   }
}
var TGCancelEvent = CancelEvent; if(window["CancelEvent"]==null) window["CancelEvent"] = CancelEvent; 
// -----------------------------------------------------------------------------------------------------------
function CancelPropagation(ev){
CancelEvent(ev,1);
}
var TGCancelPropagation = CancelPropagation; if(window["CancelPropagation"]==null) window["CancelPropagation"] = CancelPropagation; 
// -----------------------------------------------------------------------------------------------------------
function CancelDefault(ev){
CancelEvent(ev,2);
}
var TGCancelDefault = CancelDefault; if(window["CancelDefault"]==null) window["CancelDefault"] = CancelDefault; 
// -----------------------------------------------------------------------------------------------------------
function AttachEvent(tag,name,func,phase){
if (tag.addEventListener) tag.addEventListener(name,func,phase?true:false); 
else if (tag.attachEvent) tag.attachEvent("on"+name,func);
else tag["on"+name] = func;
}
var TGAttachEvent = AttachEvent; if(window["AttachEvent"]==null) window["AttachEvent"] = AttachEvent; 
// -----------------------------------------------------------------------------------------------------------
function DetachEvent(tag,name,func){
if (tag.removeEventListener) tag.removeEventListener(name, func, false); 
else if (tag.detachEvent) tag.detachEvent("on"+name,func);
else tag["on"+name] = null;
}
var TGDetachEvent = DetachEvent; if(window["DetachEvent"]==null) window["DetachEvent"] = DetachEvent; 
// -----------------------------------------------------------------------------------------------------------
function TGFireMouseEvent(elem,ev){
if(document.createEvent) {
   var evt = document.createEvent('MouseEvents');
   evt.initMouseEvent(ev["type"],true,ev["cancelable"],ev["view"],ev["detail"],ev["screenX"],ev["screenY"],ev["clientX"],ev["clientY"],ev["ctrlKey"],ev["altKey"],ev["shiftKey"],ev["metaKey"],ev["button"],ev["relatedTarget"]);
   
   elem.dispatchEvent(evt);
   } 
else if(document.createEventObject) {
   var evt = document.createEventObject();
   var P = ["detail","screenX","screenY","clientX","clientY","ctrlKey","altKey","shiftKey","metaKey","button","relatedTarget"];
   for(var i=0;i<P.length;i++) evt[P[i]] = ev[P[i]];
   elem.fireEvent("on"+ev["type"],evt);
   }
}  
// -----------------------------------------------------------------------------------------------------------
function ToRegExp(s){
if(s==null) return "";
return (s+"").replace(/[\^\$\.\*\+\-\?\=\!\:\|\\\/\(\)\[\]\{\}\/]/g,"\\$&").replace(/\n/g,"\\n").replace(/\r/g,"\\r");
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
function SplitToArray(str){
if(!str) return [];
if(typeof(str)=="object") return str;
str += "";
var c = str.charCodeAt(0);
if(c==91&&str.slice(-1)=="]"){
   try { return new Function("return "+str)(); }
   catch(e){ }
   }
if(c==32||c==36||c==45||c>=48&&c<=57||c>=65&&c<=90||c>=97&&c<=122) {
   if(str.indexOf(',')) return str.split(',');
   if(str.indexOf(';')) return str.split(';');
   if(str.indexOf('|')) return str.split('|');
   }
return str.slice(1).split(str.charAt(0));
}
// -----------------------------------------------------------------------------------------------------------
function SplitToObject(str){
if(!str) return {};
str = (str+"").toLowerCase().split(/[\,\;\s\|]/);
var O = { };
for(var i=0;i<str.length;i++) O[str[i]] = 1;
return O;
}
// -----------------------------------------------------------------------------------------------------------
function ClearSelection(){
if(Try) {
   var O = GetWindowScroll();
   if (window.getSelection) getSelection().removeAllRanges();
   else if (document.selection && document.selection.empty) document.selection.empty();

   var OO = GetWindowScroll();
   if(OO[0]!=O[0] || OO[1]!=O[1]) SetWindowScroll(O[0],O[1]);
   }
else if(Catch) { }   
}
// -----------------------------------------------------------------------------------------------------------
function FromJSON(s,retobj,content,noerr){
if(typeof(s)!="string") return s;

if(BMozilla && s.charAt(0)=="<") return s; 
try { 
   if(content) return (new Function("XX","with(XX)return("+s+");"))(content);
   return (new Function("return("+s+");"))();
   }
catch(e){ 
   if(s.search(/^\s*[\{\[]/)>=0 && window.Grids && Grids.DebugGrid && !noerr){
      if(s.length>30) {
         Grids.DebugGrid.Debug(2,"Invalid JSON, the parse error: ",e.message?e.message:e);
         Grids.DebugGrid.Debug(35,s);
         }
      else Grids.DebugGrid.Debug(2,"Invalid JSON "+s+", the parse error: ",e.message?e.message:e);
      }
   return retobj ? {} : s; 
   }
}
// -----------------------------------------------------------------------------------------------------------
function ParseObject(S){
if(!S) return {};
if(S.charCodeAt(0)==123) return FromJSON(S,1); 
var A = S.slice(1).split(S.charAt(0)); 
S = {}; 
for(var k=0;k<A.length;k++) S[A[k]] = A[k]; 
return S;
}
// -----------------------------------------------------------------------------------------------------------
MS.Print;
function PrintPreviewIE(w){
try { 
   if(!w) w = window;
   var OLECMDID = 7; 
   var PROMPT = 1;   
   w.document.body.insertAdjacentHTML("beforeEnd",'<OBJECT ID="PrintPreviewIEObj" WIDTH=0 HEIGHT=0 CLASSID="CLSID:8856F961-340A-11D0-A96B-00C04FD705A2"></OBJECT>');
   w.PrintPreviewIEObj.ExecWB(OLECMDID, PROMPT);
   w.PrintPreviewIEObj.outerHTML = "";
   return true;
   }
catch(e){ }

return false;
}
ME.Print;
// -----------------------------------------------------------------------------------------------------------
// Converts XML characters to entities
function StringToXml(str){
if(typeof(str)!="string" || str.search(/[\&\"\<\>\r\n]/)<0) return str;
return str.replace(/\&/g,"&amp;").replace(/\"/g,"&quot;").replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\r\n/g,"\n").replace(/\n/g,"&#x0A;");
}
// -----------------------------------------------------------------------------------------------------------
// Converts XML characters to entities
function StringToJson(str){
if(typeof(str)!="string" || str.search(/[\\\"\n\r\b\f\t]/)<0) return str;
return str.replace(/\\/g,"\\\\").replace(/\"/g,"\\\"").replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/[\b]/g,"\\b").replace(/\f/g,"\\f").replace(/\t/g,"\\t");
}
// -----------------------------------------------------------------------------------------------------------
// Converts XML characters to entities
 function StringToJsonX(str){
if(typeof(str)!="string" || str.search(/[\\\"\n\r\b\f\t\<\>\&]/)<0) return str;
return str.replace(/\\/g,"\\\\").replace(/\"/g,"\\\"").replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/[\b]/g,"\\b").replace(/\f/g,"\\f").replace(/\t/g,"\\t").replace(/\</g,"\\u003C").replace(/\>/g,"\\u003E").replace(/\&/g,"\\u0026");
}
// -----------------------------------------------------------------------------------------------------------
MS.Export;
function TGSaveFile(data,name) {
if(typeof(data)=="string") {
   if(!window.Blob) return false;
   data = new Blob([data],{type:"text/plain"});
   }
if(navigator.msSaveOrOpenBlob) navigator.msSaveOrOpenBlob(data,name);
else if(navigator.msSaveBlob) navigator.msSaveBlob(data,name);
else if (BIEA&&!BIEA10) {
   return false;
   
   }
else {
   var a = document.createElement('a');
   a.href = window.URL.createObjectURL(data);
   if(a.download===undefined){ location.href = a.href; return true; } 
   a.download = name;
   a.onclick = function(ev) { document.body.removeChild(ev.target); CancelEvent(ev,1); };
   a.style.display = 'none';
   document.body.appendChild(a);
   a.click();
   }
return true;
}
ME.Export;
// -----------------------------------------------------------------------------------------------------------
function SetObjectFocused(O,always){ 
var F = Grids.Focused; if(!F) F = Designers.Focused;
if(F!=O){
   if(F && !F.Disabled){ 
      if(!(Grids[F.id]?F.RunAction("Click","Outside",""):F.EmptyEvent?F.RunAction("OnClickOutside",F.EmptyEvent()):0)) return false;
      F.CloseDialog(true);
        
      }
   Grids.Focused = null; Designers.Focused = null;
   if(Grids[O.id]) Grids.Focused = O; else Designers.Focused = O;
   }
if(document.hasFocus&&!document.hasFocus()) focus(); 
if(!BIEA  && (F!=O || always) && O.GetItemId){
   var A = document.activeElement;
   if(A && {"select":1,"input":1,"textarea":1}[(A.tagName+"").toLowerCase()] && (!A.onfocus||A.onfocus.toString().search(".ActionTab")<0)) for(;A;A=A.parentNode) if(A==O.MainTag) return; 
   var X = GetElem(O.GetItemId("TmpFocusGrid"));
   if(X) { 
      var A = GetWindowScroll();
      for(var x=X.parentNode,N=[];x;x=x.parentNode) if(x.scrollLeft||x.scrollTop) N[N.length] = [x,x.scrollLeft,x.scrollTop];
      ClearSelection(); 
      X.focus(); 
      for(var i=0;i<N.length;i++) { N[i][0].scrollLeft = N[i][1]; N[i][0].scrollTop = N[i][2]; }
      SetWindowScroll(A[0],A[1]);
      }
   }
return true;   
}
// -----------------------------------------------------------------------------------------------------------
MS.File$Style$Import;
function FileDialog (save,range,accept){
var I = document.createElement("input");
I.type = "file";
I.style.width = "1px";
I.style.height="1px";
I.style.position = "absolute";
I.style.top = "-10px";
I.style.left = "10px";
I.multiple = range ? true : false;
if(accept) I.accept = accept;
document.body.appendChild(I);
var zf = document.body.onfocus;
function Save(){
   if(!I.parentNode||!I.files.length) return;
   document.body.onfocus = zf;
   document.body.removeChild(I);
   if(save) save(I);
   }
I.onchange = Save;
I.onclick = CancelPropagation;
document.body.onfocus = BIEA ? Save : function(){ setTimeout(Save,1000); } 
I.click();
}
ME.File$Style$Import;
// -----------------------------------------------------------------------------------------------------------


MS.Xlsx;
// -----------------------------------------------------------------------------------------------------------
function GetDataType(file,ext){ 
if(file.slice(0,5)=="data:") img = file.slice(5,file.indexOf(";"));
else {
   file = file.replace(/.*[\.\/]/,"").toLowerCase();
   var img = { "png":"png","jpg":"jpeg","jpeg":"jpeg","gif":"gif","bmp":"bmp","svg":"svg+xml" }[file];
   img = img ? "image/"+img : "";
   }
if(img) {
   if(!ext) return img;
   img = {"image/png":"png","image/jpeg":"jpg","image/gif":"gif","image/bmp":"bmp","image/svg+xml":"svg"}[img];
   return img ? img : "";
   }
return ""; 
}
// -----------------------------------------------------------------------------------------------------------
var CBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".split(""), CBase64A = {}; for(var iii=0;iii<CBase64.length;iii++) CBase64A[CBase64[iii]] = iii;
// -----------------------------------------------------------------------------------------------------------
function ToBase64(v){
if(typeof(v)=="string"){
   for(var i=0,s="",l=v.length-2,B=CBase64;i<l;i+=3) s += B[v.charCodeAt(i)>>2] + B[((v.charCodeAt(i)&3)<<4) | (v.charCodeAt(i+1)>>4)] + B[((v.charCodeAt(i+1)&15)<<2) | (v.charCodeAt(i+2)>>6)] + B[v.charCodeAt(i+2)&63];
   if(i<l+1) s += B[v.charCodeAt(i)>>2] + B[((v.charCodeAt(i)&3)<<4) | (v.charCodeAt(i+1)>>4)] + B[((v.charCodeAt(i+1)&15)<<2)] + "=";
   else if(i<l+2) s += B[v.charCodeAt(i)>>2] + B[((v.charCodeAt(i)&3)<<4)] + "==";
   }
else {
   if(v.byteLength) v = new Uint8Array(v);
   for(var i=0,s="",l=v.length-2,B=CBase64;i<l;i+=3) s += B[v[i]>>2] + B[((v[i]&3)<<4) | (v[i+1]>>4)] + B[((v[i+1]&15)<<2) | (v[i+2]>>6)] + B[v[i+2]&63];
   if(i<l+1) s += B[v[i]>>2] + B[((v[i]&3)<<4) | (v[i+1]>>4)] + B[((v[i+1]&15)<<2)] + "=";
   else if(i<l+2) s += B[v[i]>>2] + B[v[i]>>2] + B[((v[i]&3)<<4)] + "==";
   }
return s;
}
// -----------------------------------------------------------------------------------------------------------
function FromBase64(s,str){
for(var i=0,v=[],k=0,l=s.length,B=CBase64A;i<l;i+=4){
   var b = B[s.charAt(i+1)], c = B[s.charAt(i+2)];
   v[k++] = (B[s.charAt(i)]<<2) | (b>>4);
   v[k++] = ((b&15)<<4) | (c>>2);
   v[k++] = ((c&3)<<6) | B[s.charAt(i+3)];
   }
if(B[s.charAt(l-1)]==64) v.length--;
if(B[s.charAt(l-2)]==64) v.length--;
if(!str) return v;
for(var i=0,a="";i<v.length;i++) a += String.fromCharCode(v[i]);
return a;
}
// -----------------------------------------------------------------------------------------------------------
ME.Xlsx;

// -----------------------------------------------------------------------------------------------------------
function GetCount(O){
if(!O) return 0;
if(Object.keys) return Object.keys(O).length;
var cnt = 0; for(var o in O) cnt++;
return cnt;
}
// -----------------------------------------------------------------------------------------------------------
MS.Number;
function ToFract(x,max) {
var h1 = 1, h2 = 0, k1 = 0, k2 = 1, b = x; if(!max) max = 1e-6;
do {
   var a = Math.floor(b), o;
   o = h1; h1 = a*h1+h2; h2 = o;
   o = k1; k1 = a*k1+k2; k2 = o;
   b = 1/(b-a);
   } while (max>1?k1<=max:Math.abs(x-h1/k1) > x*max);
return max>1?[h2,k2]:[h1,k1];
}
ME.Number;
// -----------------------------------------------------------------------------------------------------------
function LoadScript(url,func,noajax){ 
if(!noajax) {
   AjaxCall(url,"",function(err,data){
      if(err>=0) { eval(data); if(func) func(0); }
      else LoadScript(url,func,1);
      },1);
   }
else {
   var S = document.createElement("script");
   S.onload = function(){ if(func) func(0); }
   S.onerror = function(){ if(func) func(-1); }
   S.src = url;
   document.documentElement.firstChild.appendChild(S);
   }
}
// -----------------------------------------------------------------------------------------------------------
function IsBodyRtl(){

return false;

}
// -----------------------------------------------------------------------------------------------------------

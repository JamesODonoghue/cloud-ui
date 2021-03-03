MS.Message;
// -----------------------------------------------------------------------------------------------------------
var TMessage = {

   StyleSize : "",     

   _nope:0 };

// -----------------------------------------------------------------------------------------------------------
function DisablePage(size){
MS.Dialog;
if(TDialog.Disabled){ TDialog.Disabled++; return; }
var D = document.createElement("div");
var A = GetWindowScroll(), B = AbsoluteToWindow();
D.style.left = A[0]-B[0]+"px";
D.style.top = A[1]-B[1]+"px";
var A = GetWindowSize();
D.style.width = A[0]+"px";
D.style.height = A[1]+"px";
D.className = "GridDisabled";
D.innerHTML = CNBSP;
AppendTag(D,size);

TDialog.Disabled = 1;
TDialog.DisabledTag = D;
ME.Dialog;
}
var TGDisablePage = DisablePage; if(window["DisablePage"]==null) window["DisablePage"] = DisablePage; 
// -----------------------------------------------------------------------------------------------------------
function EnablePage(always){
MS.Dialog;
if(!TDialog.Disabled) return;
TDialog.Disabled--;
if(TDialog.Disabled){
   if(!always) return;
   TDialog.Disabled = 0;
   }
var D = TDialog.DisabledTag;
if(D.parentNode) D.parentNode.removeChild(D);
TDialog.DisabledTag = null;
ME.Dialog;
}
var TGEnablePage = EnablePage; if(window["EnablePage"]==null) window["EnablePage"] = EnablePage; 
// -----------------------------------------------------------------------------------------------------------
function CreateMessage(){
var M = {};
M.Style = (window.Grids && Grids.LastStyle ? Grids.LastStyle : "TS");
for(var i in TMessage) M[i] = TMessage[i];
return M;
}
// -----------------------------------------------------------------------------------------------------------
// Disables tag
TMessage.Disable = function(hard){
if(!this.Parent) { DisablePage(); return; }
var D = this.Disabled;
if(!D){
   D = document.createElement("div");
   D.style.position = "absolute";
   D.innerHTML = CNBSP;
   AppendTag(D,this.StyleSize);
   this.Disabled = D;
   }
D.className = this.Style+"Disabled"+(hard?"Hard":"");
var X = this.X, Y = this.Y; if(X==null){ var A = ElemToWindow(this.Parent), B = AbsoluteToWindow(); X = A[0]-B[0]; Y = A[1]-B[1]; }
D.style.left = X + "px";
D.style.top = Y + "px";
D.style.width = this.Parent.offsetWidth+"px";
D.style.height = this.Parent.offsetHeight+"px";
if(this.ZIndex) D.style.zIndex = this.ZIndex + 17;
D.style.display = "";
}
// -----------------------------------------------------------------------------------------------------------
// Enables tag
TMessage.Enable = function(){
if(!this.Parent) { EnablePage(); return; }
if(this.Disabled) this.Disabled.style.display = "none";
}
// -----------------------------------------------------------------------------------------------------------
// Shows given message
TMessage.Show = function(txt,anim,noclear,prompt){
if(this.Timeout && !noclear) { clearTimeout(this.Timeout); this.Timeout = null; }
if(this.Close && !noclear) this.Close = null;
var tag = this.Tag, sh = this.Shadow;
if(tag){
   MS.Animate; if(this.Anim||this.AHide){ Animate(tag); Animate(sh); } ME.Animate;
   tag.className = this.Style + "Message";
   sh.className = this.Style + "MessageShadow";
   tag.style.width = "";
   }
else {
   tag = document.createElement("div"); 
   tag.className = this.Style + "Message";
   tag.style.position = "absolute"; 
   tag.style.display = "";
   AppendTag(tag,this.StyleSize);
   
   var sh = document.createElement("div");
   sh.className = this.Style + "MessageShadow";
   sh.innerHTML = CNBSP;
   sh.style.display = "";
   sh.style.position = "absolute"; 
   tag.parentNode.insertBefore(sh,tag);
   if(this.ZIndex) { sh.style.zIndex = this.ZIndex + 18; tag.style.zIndex = this.ZIndex + 19; }
   this.Tag = tag; this.Shadow = sh;
   }
tag.innerHTML = txt;
tag.style.visibility = ""; tag.style.display = "";
this.Progress = null;
if(this.Width && tag.clientWidth<=this.Width) tag.style.width = this.Width+"px";

var A = GetWindowSize(1), P = this.Parent, tabinput = BTablet&&(prompt||this.Grid&&this.Grid.EditMode); if(tabinput) A[1] /= 2; // Na tabletu pri zobrazeni klavesnice
if(this.Center || !P || P.offsetWidth > A[0] || P.offsetHeight > A[1] || tabinput){
   var B = GetWindowScroll(); 
   tag.style.left = Math.floor((A[0]-tag.offsetWidth)/2+B[0]) + "px";
   tag.style.top = Math.floor((A[1]-tag.offsetHeight)/2+B[1]) + "px";
   if((!P || this.Center==2) && !TDialog.Disabled) DisablePage(this.StyleSize);
   }
else {
   var X, Y;
   if(this.X!=null) { X = this.X; Y = this.Y; }
   else { var B = ElemToWindow(P); X = B[0]; Y = B[1]; }
   X = Math.floor(X+(P.offsetWidth-tag.offsetWidth)/2); if(X<0) X = 0;
   Y = Math.floor(Y+(P.offsetHeight-tag.offsetHeight)/2); if(Y<0) Y = 0;
   tag.style.left = X + "px";
   tag.style.top = Y + "px";   
   }   
sh.style.left = tag.style.left;
sh.style.top = tag.style.top;
sh.style.width = tag.offsetWidth+"px";
sh.style.height = tag.offsetHeight+"px";

tag.style.visibility = "visible"; 
sh.style.visibility = "visible"; sh.style.display = "";

if(this.Move && window.AttachMouse) {
   tag.onmousedown = new Function("ev","TGAttachMouse({OnMove:function(dx,dy){var sh=this.Tag.previousSibling;sh.style.left=parseInt(sh.style.left)+dx+'px';sh.style.top=parseInt(sh.style.top)+dy+'px';}},ev?ev:event,this);TGCancelEvent(ev?ev:event);"); 
   if(BTablet) tag.ontouchstart = tag.onmousedown; else if(BTouch) AttachEvent(tag,"touchstart",tag.onmousedown);
   var N = ["input","textarea","button"];
   for(var i=0;i<N.length;i++){
      var I = tag.getElementsByTagName(N[i]);
      for(var j=0;j<I.length;j++) {
         I[j].onmousedown = CancelPropagation;
         if(BTablet) I[j].ontouchstart = CancelPropagation; else if(BTouch) I[j].setAttribute("ontouchstart","TGCancelPropagation(event);");
         }
      }
   }
MS.Animate;
if(anim&&this.AnimShow) { Animate(tag,this.AnimShow); Animate(sh,this.AnimShow); this.AHide = 1; }
ME.Animate;
}
// -----------------------------------------------------------------------------------------------------------
TMessage.Hide = function(now){
if(this.Timeout) { clearTimeout(this.Timeout); this.Timeout = null; }
if(this.Center==2||!this.Parent) EnablePage();
if(this.Close) { 
   if(now==2) return;
   if(now!=3) this.Close(null); 
   this.Close = null;
   }
if(this.Shadow) this.Shadow.style.display = "none";
this.Progress = null;
MS.Animate;
if(this.AHide){
   var T = this, tag = this.Tag, sh = this.Shadow;
   if(now&&now!=3) { this.AHide = null; Animate(tag); Animate(sh); }
   else if(tag){
      function finish(){ T.AHide = null; tag.style.display = "none"; if(sh) sh.style.display = "none"; }
      if(this.AHide!=2&&this.AnimHide) { this.AHide = 2; Animate(tag,this.AnimHide,null,finish); Animate(sh,this.AnimHide);  }
      else { Animate(tag); Animate(sh); if(this.AHide) finish(); }
      }
   return;
   }
ME.Animate;
if(this.Tag) this.Tag.style.display = "none";
}
// ----------------------------------------------------------------------------------------------------------
TMessage.UpdatePos = function(){
var P = this.Parent; if(!P) return;
var X = this.X, Y = this.Y; if(X==null){ var B = ElemToWindow(P); X = B[0]; Y = B[1]; }
var D = this.Disabled;
if(D){
   D.style.left = X + "px";
   D.style.top = Y + "px";
   D.style.width = P.offsetWidth+"px";
   D.style.height = P.offsetHeight+"px";
   }   
var D = this.Tag;
if(D){
   var A = GetWindowSize(1);
   if(this.Center || P.offsetWidth > A[0] || P.offsetHeight > A[1]){
      var B = GetWindowScroll();
      D.style.left = Math.floor((A[0]-D.offsetWidth)/2+B[0]) + "px";
      D.style.top = Math.floor((A[1]-D.offsetHeight)/2+B[1]) + "px";
      }
   else {
      X = Math.floor(X+(P.offsetWidth-D.offsetWidth)/2); if(X<0) X = 0;
      Y = Math.floor(Y+(P.offsetHeight-D.offsetHeight)/2); if(Y<0) Y = 0;
      D.style.left = X + "px";
      D.style.top = Y + "px";   
      }
   var S = this.Shadow;
   if(S){
      S.style.left = D.style.left;
      S.style.top = D.style.top;
      S.style.width = D.offsetWidth+"px";
      S.style.height = D.offsetHeight+"px";
      }
   }
}
// ----------------------------------------------------------------------------------------------------------
TMessage.GetButtonsHTML = function(buttons,func){
var cls1 = this.Style+"DialogButton", cls2 = this.Style+"MessageButton", cls3 = this.Style+"DialogButton###"; 
var txt = "<div class='"+this.Style+"MessageButtons' style='align:center;'>";
for(var i=0;i<buttons.length;i++){
   var but = this.ButtonNames ? this.ButtonNames[buttons[i]] : null; if(!but) but = buttons[i];
   var cls3a = cls3.replace(/###/g,buttons[i]);
   txt += "<button onmouseover='this.className=\""+cls1+" "+cls1+"Hover "+cls3a+" "+cls3a+"Hover "+cls2+" "+cls2+"Hover\"' onmouseout='this.className=\""+cls1+" "+cls3a+" "+cls2+"\"' class='"+cls1+" "+cls3a+" "+cls2+"'"
       +  " onclick='"+(func?func[i]:this.This+".Close("+(i+1)+");TGCancelEvent(event);")+"'>"+but+"</button>";
   }   
return txt + "</div>";
}
// -----------------------------------------------------------------------------------------------------------
// Shows modal message, disables grid
TMessage.ShowTime = function(txt,time,func,buttons){
if(!time) time = 0;
if(!buttons) buttons = [];
else if(typeof(buttons)=="string") buttons = buttons.split(",");
if(!buttons.length && time<=0) buttons[0] = "Ok";
if(time<0) time = -time;
var T = this;
function finish(ret) {
   T.Close = null;
   if(time) clearTimeout(time);
   if(ret==null) return; 
   T.Hide();
   if(func) func(ret);
   }
T.Timeout = setTimeout(function(){ 
   if(T.Close) T.Close(null);
   T.Close = finish;
   T.Timeout = null;
   if(buttons.length) txt += T.GetButtonsHTML(buttons);
   
   T.Show(txt,1,1);
   
   if(time) time = setTimeout(function(){ if(T.Close) T.Close(0); }, time);
   },10);
return;
}
// ----------------------------------------------------------------------------------------------------------
// Shows asynchronous dialog to input some string
// text is caption, def is default value
// func is function called after input, its first parameter is the input value or null for cancel
// width is optional width in pixels
TMessage.Prompt = function(text,def,func,width){
if(!width) width = this.Width;
width = width ? " style='width:"+width+"px;'" : ""; 
if(def==null) def = "";
this.Close = func?func:function(){ };
var s = "<div"+width+">"+text+"</div>";
s += "<div class='"+this.Style+"Prompt'><input type='text' value='"+(def+"").replace(/\'/g,"&#x27;")+"'"+width;
s += " onkeydown='var T="+this.This+",t=T.Timeout;if(event.charCode==13||event.keyCode==13){this.blur();T.Close(this.value);TGCancelEvent(event);if(t==T.Timeout)T.Hide(3);}if(event.charCode==27||event.keyCode==27){this.blur();T.Close(null);if(t==T.Timeout)T.Hide(3);TGCancelEvent(event);}'></div>";
s += this.GetButtonsHTML(["Ok","Cancel"],["var T="+this.This+",t=T.Timeout;T.Close(this.parentNode.previousSibling.firstChild.value);if(t==T.Timeout)T.Hide(3);TGCancelEvent(event);","var T="+this.This+",t=T.Timeout;T.Close(null);if(t==T.Timeout)T.Hide(3);TGCancelEvent(event);"]);
this.Show(s,1,1,1);
var I = this.Tag.getElementsByTagName("input")[0];
if(I){ I.focus(); I.select(); }
}
// -----------------------------------------------------------------------------------------------------------
// Shows or updates progress dialog with Cancel button
TMessage.ShowProgress = function(caption,txt,cancel,pos,cnt,func){
if(!txt) return;
var styl = this.Style;
if(pos>cnt) pos = cnt;
var mess = "<div class='"+styl+"ProgressMain'>"
          + "<div class='"+styl+"ProgressCaption'>"+caption+"</div>"
           + "<div class='"+styl+"ProgressText'>"+txt.replace('%d',pos).replace('%d',cnt)+"</div>"
           + "<div class='"+styl+"ProgressOuter'>"
           + "<div class='"+styl+"ProgressInner' style='width:"+Math.floor(pos/cnt*100)+"%;'></div></div></div>";
if(!this.Progress) {
   var cls = styl+"ProgressButton "+styl+"DialogButton";
   this.Show("<div>"+mess+"</div>"+(cancel?"<div class='"+styl+"ProgressButtons'><button onmouseover='this.className=\""+cls+" "+styl+"ProgressButtonHover\"' onmouseout='this.className=\""+cls+"\"' class='"+cls+"'>"+cancel+"</button></div>":""),1,1);
   if(cancel && func) this.Tag.lastElementChild.firstChild.onclick = func;
   this.Progress = 1;
   }
else {
   this.Tag.firstChild.innerHTML = mess;
   this.Shadow.style.width = this.Tag.offsetWidth+"px";
   }
}
// -----------------------------------------------------------------------------------------------------------
ME.Message;
// -----------------------------------------------------------------------------------------------------------
// Shows message inside tag, centered
// All content of the tag is cleared !
// If is given cssclass, it is CSS class name of created tag
function ShowMessageCenter(text,tag,cssclass,parheight,width,scr){
MS.Message;
if(!text) return;
if(typeof(tag)=="string") tag = GetElem(tag);
if(!tag || tag.offsetHeight<40) return;
if(!scr) scr = 0;
cssclass = cssclass ? " class='"+cssclass+"'" : "";
if(!parheight) parheight = tag.offsetHeight;
try { 
   tag.innerHTML = "<div style='visibility:hidden;position:absolute;left:0px;top:0px;'><div><div "+cssclass+">"+text+"</div></div></div>";
   var w = tag.firstChild.offsetWidth+1, h = tag.firstChild.offsetHeight+1, pw = tag.clientWidth; if(!pw) pw = tag.parentNode.clientWidth;
   if(width && w<width) w = width;
   var top = Math.floor((parheight-h)/2), max = tag.offsetHeight - h, ww = Math.floor((pw-w)/2); if(scr) ww += scr;
   if(ww+w>pw) ww = pw-w;
   if(top>max/2) top = max/2;
   if(parheight<h*2+20) parheight = h*2+20; 
   
   for(var s="<div style='height:1px;overflow:hidden;'>"+CNBSP+"</div>";top<max;top+=parheight-h-10) s += "<div style='margin-left:"+ww+"px;margin-right:"+ww+"px;margin-top:"+top+"px;margin-bottom:-"+(top+h)+"px;text-align:center;height:"+h+"px;overflow:hidden;width:"+w+"px;'><div"+cssclass+">"+text+"</div></div>";
   tag.innerHTML = s;
   }
catch(e) { }
ME.Message;
}
// -----------------------------------------------------------------------------------------------------------

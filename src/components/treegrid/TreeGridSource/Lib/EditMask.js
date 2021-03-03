// -----------------------------------------------------------------------------------------------------------
// External independent file for mask editation
// Needs only files Const.js and Func.js
// -----------------------------------------------------------------------------------------------------------
MS.Edit;
// -----------------------------------------------------------------------------------------------------------
// Returns cursor/selection positinon in textarea or input
function GetSelection(T){
var s = 0, e = 0;
try {
   if(T.contentEditable=="true"){
      
      }
   else if(T.selectionStart!=null){ 
      s = T.selectionStart, e = T.selectionEnd;
      }
   else { 
      function Len(v){ return v.replace(/\r\n|\r/g,"\n").length; }
      var S = document.selection.createRange(), SX = T.createTextRange(), b = S.getBookmark();
      SX.moveToBookmark(b);
      var v = T.value, len = Len(v), slen = Len(SX.text);
      s = -SX.moveStart('character',-len);
      SX.moveToBookmark(b); e = SX.moveStart('character',len); if(len-e!=s) s = len; 
      e = s+slen;
      }
   }
catch(ev){ }
return s>e ? [e,s] : [s,e];
}
var TGGetSelection = GetSelection; if(window["GetSelection"]==null) window["GetSelection"] = GetSelection; 
// -----------------------------------------------------------------------------------------------------------
// Sets cursor/selection positinon in textarea or input
function SetSelection(T,s,e){
if(T.contentEditable=="true"){
   
   }
else if(T.selectionStart!=null){ 
   T.selectionStart = s; 
   T.selectionEnd = e==null ? s : e;
   }
else { 
   var S;
   if(T.createTextRange) S = T.createTextRange();
   else { S = document.body.createTextRange(); S.moveToElementText(T); }
   
   S.move('character',s);
   S.moveEnd('character',e-s);
   S.select();
   }
}
var TGSetSelection = SetSelection; if(window["SetSelection"]==null) window["SetSelection"] = SetSelection; 
// -----------------------------------------------------------------------------------------------------------
MS.EditMask;
// -----------------------------------------------------------------------------------------------------------
// Plays wav with given source and length
// If src == null, stops palying
// If len == null, plays the whole file
function PlaySound(src,len){
var B = PlaySound.BGSound, BT = PlaySound.BGTimeout, audio = !BIEA&&window.Audio;
function Stop(){
   if(BT){ 
      clearTimeout(BT);
      PlaySound.BGTimeout = null;
      BT = null;
      }
   if(audio) {
      B.pause();
      }
   else if(BMozilla){ 
      if(Try) { document.documentElement.removeChild(B); } 
      else if(Catch) { }
      B = null; 
      }
   else B.src = "";
   }
if(BT) Stop();
if(!src) return;
if(!B) {
   if(audio) { B = new Audio(src); B.play(); }
   else {   
      if(BMozilla) { 
         B = document.createElement("div");
         B.innerHTML = '<embed src="'+src+'" autostart=true hidden width=0 height=0 enablejavascript="true">';
         B = B.firstChild;
         }
      else {
         B = document.createElement("bgsound");
         B.src = src;
         }
      document.documentElement.appendChild(B);
      }
   PlaySound.BGSound = B;
   }
else if(audio) { B.load(src); B.play(); }
else B.src = src;
if(len) PlaySound.BGTimeout=setTimeout(function(){ Stop(); },len);
}
// -----------------------------------------------------------------------------------------------------------
// Main function for mask setting
// T is textarea or input type text
// Mask is string with mask, RegExp syntax
// color je backgroundColor set by error or null
// sndsrc is sound file played by error or null
// sndlen is length of file in msec, it could be longer due delay before starting playing
// Ins is insert key value (0 - Insert mode, 1 - Overwrite mode), if null, function is not so effective
function SetMask(T,Mask,Ins,color,sndsrc,sndlen,digits){
MS.Digits;
if(digits==null) digits = Formats.Digits;
if(digits){
   digits = digits.split(digits.charAt(0)).slice(1);
   for(var i=0;i<10;i++) digits[i] = new RegExp(ToRegExp(digits[i]),"g");
   }
ME.Digits;

var Last = T.value==null?T.innerHTML:T.value, Sel = GetSelection(T), RMaskEdit = typeof(Mask)=="object" ? Mask : new RegExp(Mask,""), BTimeout = null, Cancel=0, oldcolor = T.style.backgroundColor, MozEnd = null;
var onkeyup = !BIEA||BIEA10 ? "oninput" : "onkeyup";
var opress = T.onkeypress, odown = T.onkeydown, oup = T[onkeyup];
T.onkeypress = KeyPress;
T.onkeydown = KeyDown;
T[onkeyup] = KeyUp;

// -------------------------------------------
// Tests mask and eventually inform about error by sound or color, returns true for error
function Test(v){
if(digits) for(var i=0;i<10;i++) v = v.replace(digits[i],i);
if(v.search(RMaskEdit)==-1){  
   if(color) {
      T.style.backgroundColor = color;
      if(BTimeout) clearTimeout(BTimeout);
      BTimeout = setTimeout(function(){T.style.backgroundColor = oldcolor;},200);
      }
   if(sndsrc) PlaySound(sndsrc,sndlen);
   if(MozEnd!=null){ T.selectionEnd = MozEnd; MozEnd = null; }
   return 1;
   }
return 0;
}
// -------------------------------------------
// Security against press of standard key
function KeyPress(ev){
if(!ev) ev = window.event;
if(T.readOnly) return true;
if(Cancel){ CancelEvent(ev); return false; }
if(ev && !BOpera8 && !BOpera && !BSafari && (!BIEA || Ins!=null) && (!BMozilla||!ev.altKey&&!ev.ctrlKey)){ 
   
   var c = BIEA  ? ev.keyCode : ev.charCode;
   if(c!=0) {
      if(c==13) c = 10;
      var v = (T.value==null?T.innerText:T.value).replace(/\r\n|\r/g,"\n");
      v = v.slice(0,Sel[0])+String.fromCharCode(c)+v.slice(Sel[1]+(BIEA && Ins?1:0));
      if(Test(v)){ CancelEvent(ev); return false; }
      }
   }
if(opress) opress(ev);
return true;
}

// -------------------------------------------
// Funkce zabezpeci ochranu pred stiskem backspace a delete a pri drzeni klavesy kdy nenastava onkeyup
// Security against press of backspace and delete and when the key is not released and keyup is not fired
function KeyDown(ev){
if(T.readOnly) return true;
function end(){ if(odown) odown(ev); return true; } 
if(!ev) ev = window.event;
if(Sel){ 
   var v = (T.value==null?T.innerText:T.value).replace(/\r\n|\r/g,"\n"); if(digits) for(var i=0;i<10;i++) v = v.replace(digits[i],i);
   if(v.search(RMaskEdit)==-1){
      if(T.value==null) T.innerHTML = Last; else T.value = Last;
      SetSelection(T,Sel[0],Sel[1]);
      }
   }
Last = T.value==null?T.innerHTML:T.value;
MozEnd = null;
if(Ins && BMozilla){
   var c = ev.keyCode;
   if(c!=37&&c!=38&&c!=40&&c!=8&&c!=45){
      MozEnd = T.selectionEnd;
      T.selectionEnd+=1;
      }
   }
Sel = GetSelection(T);
Cancel = 0;
if(ev){
   if(ev.shiftKey || ev.altKey || ev.ctrlKey) return end(); 
   var c = ev.keyCode, s = Sel[0], e = Sel[1], v = (T.value==null?T.innerText:T.value).replace(/\r\n|\r/g,"\n");
   if(c==0) c = ev.charCode;   
   if(c==45){ 
      if(Ins!=null) Ins = !Ins; 
      return end();
      }
   else if(c==8){
      if(s && s==e) s--;
      
      }
   else if(c==46 && e<v.length-1 && s==e) e++; 
   else return end();
   v = v.slice(0,s)+v.slice(e);
   if(Test(v)){ CancelEvent(ev); Cancel = 1; return false; }
   }
return end();
}
// -------------------------------------------
// Security against press of any key that was not caught in onkeypress or onkeydown
function KeyUp(ev){
if(T.readOnly || !Sel) return true;
if(!ev) ev = window.event;
if(Test((T.value==null?T.innerText:T.value).replace(/\r\n|\r/g,"\n"))) {
   if(T.value==null) T.innerHTML = Last; else T.value = Last;
   SetSelection(T,Sel[0],Sel[1]);
   }
if(Cancel){
   Cancel = 0; CancelEvent(ev); return false;
   }
if(oup) oup(ev);
return true;
}
// -------------------------------------------
} 
// -----------------------------------------------------------------------------------------------------------
ME.EditMask;
ME.Edit;

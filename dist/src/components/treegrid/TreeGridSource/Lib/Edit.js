MS.Edit;
// -----------------------------------------------------------------------------------------------------------
var TEdit = {

   Type : "Text",    
                     
   CloseClickOut : 1,
   SaveMouse : 1,    
                     
   SaveMove : 1,     

   Base : "TSEdit",  

   StyleSize : "TSNormal",   

   MaskColor : "red",

   AutoSelect:1,     

   AutoSize : 1,     
   ParentAutoSize : 0, 
   AcceptEnters : 1, 
   ReadOnly : 0,     
   InsertImg : 3,    
   EditImg : 15,     
   LinkPrompt : "Enter URL", 
   LineHeightRatio : 4/3,    

   EF : {},          

   _nope:0 };

// -----------------------------------------------------------------------------------------------------------
function ShowEdit(M,P){
if(!M) M = { };
else M = FromJSON(M);
if(!M) M = { };
if(typeof(M)=="string"){ alert("Incorrect setting for Edit: "+M); return null; }
P = InitPos(P);
if(window.Grids && Grids.LastStyle && !M.Base) M.Base = Grids.LastStyle + "Edit";
for(var i in TEdit) if(M[i]==null) M[i] = TEdit[i];

CreateInput(M,P);
var val = "";
if(M.Input) val = M.Input.value;
else if(M.Value!=null) val = M.Value;
else if(P.Tag) val = P.Tag.innerHTML;
var ef = M.EditFormula ? Formats.FormulaPrefix : null, hef = ef && (val+"").indexOf(Formats.FormulaPrefix)==0;
M.SF = hef ? M.EF : M;
 
if(typeof(val)=="string"){ 
   if(M.Multi) val = val.replace(/\%n/g,"\n");
   if(M.Type!="Text" && !hef && (val!==""||!M.CanEmpty)) val = Formats.StringToValue(val,M.Type,M.IOFormat,M.Range,1,M.DefaultDate);
   }

var tag = P.Tag;
if(!tag) {
   tag = document.createElement("div");
   tag.className = M.Base+"Parent"+(M.Class?" "+M.Class+"Parent":"");
   if(P.X) tag.style.left = P.X+"px";
   if(P.Y) tag.style.top = P.Y+"px";
   if(P.Width) tag.style.width = P.Width+"px";
   if(P.Height) tag.style.height = P.Height+"px";
   AppendTag(tag,M.StyleSize);
   M.TmpTag = tag;
   } 
M.OriginalValue = tag.innerHTML;
if(P.ParentTag) M.ParentTag = P.ParentTag;

if(M.Html){
    
   }
else if(M.Multi){
   var I = document.createElement("textarea");
   I.style.overflow = "hidden";
   
   }   
else {
   var I = document.createElement("input");
   I.type = M.Type=="Pass" ? "password" : "text";
   if(M.Size&&!hef) I.maxLength = M.Size;
   }
if(M.Styles) {
   for(var n in M.Styles) I.style[n] = M.Styles[n];
   delete M.Styles.backgroundColor;
   }

if(!M.EditMask) {
   var add = M.Range ? Formats.ValueSeparator + Formats.RangeSeparator : "";
   if(M.Format&&(M.Type=="Int"||M.Type=="Float") && Formats.ParseNumberFormat(M.Format).Percent)  add += "%";
   if(M.Type=="Int") I.onkeypress = function(ev){ TestKey(ev?ev:event,this,TestKeyInt,add,ef); }
   else if(M.Type=="Float") I.onkeypress = function(ev){ TestKey(ev?ev:event,this,TestKeyFloat,add,ef); }
   else if(M.Type=="Date") { 
      MS.Date;
      var tt = M.Format && M.Format.indexOf('t')>=0 && M.Format.indexOf('h')>=0;
      if(tt) add += (Formats.InputAMPMDesignators ? Formats.InputAMPMDesignators.toUpperCase() : Formats.AMDesignator.toUpperCase() + Formats.PMDesignator.toUpperCase()) + (Formats.InputDateTimeSeparators ? Formats.InputDateTimeSeparators.toUpperCase() : "");
      I.onkeypress = function(ev){ TestKey(ev?ev:event,this,TGTestKeyDate,add,ef,Formats.StrictDates&4?Formats.EditMonthsChars:null); }
      ME.Date;
      }
   }

MS.DatePick;
if(M.Calendar){
   if(M.Type!="Date"&&M.Type!="Auto" || hef || M.Type=="Auto" && (!M.Format||!Formats.IsDate(M.Format,1))) M.Calendar = null;
   else {
      var C = M.Calendar;
      if(typeof(C)!="object"){ C = {}; M.Calendar = C; }
      C.Date = val; 
      C.Range = M.Range;
      C.TimeFormat = M.Format;
      C.NoFocusTime = 1;
      
      C.OnChange = function(val){
         M.AVal = M.ToString(val,1);
         if(M.Html) M.Tag.innerHTML = M.AVal; else M.Tag.value = M.AVal;
         I.focus();
         if(M.AutoSelect==1||M.AutoSelect==2) I.select();
         if(M.Multi||M.ParentAutoSize) { M.Resize(); C.Height = I.parentNode.offsetHeight; C.UpdatePos(); C.UpdateShadow(C.ShadowTag,C.Tag); }
         }
      C.OnSave = function(val){
         
         M.AVal = M.ToString(val,1);
         if(M.Html) M.Tag.innerHTML = M.AVal; else M.Tag.value = M.AVal;
         M.Save();
         }   
      C.OnClose = function(){ 
         if(M.Tag) { 
            M.Calendar = null; 
            M.Cancel();
            M.Calendar = C;
            }
         }
      MS.Digits; C.Digits = M.Digits; ME.Digits;
      C.StyleSize = M.StyleSize;
      ShowCalendar(C,{Tag:tag,Align:M.CalendarAlign?M.CalendarAlign:"right below"});
      }
   }      
ME.DatePick;

I.className = (M.Multi==2?M.Base+"WordWrap ":M.Multi==3?M.Base+"NoWrap ":"")+M.Base+(M.Html?"Div ":M.Multi?"Textarea ":"Input ")+(M.Class?M.Class+(M.Html?"Div ":M.Multi?"Textarea ":"Input "):"")+M.Base+M.Type+(M.TypeClass?" "+M.Base+M.TypeClass:"")+(M.ReadOnly?" "+M.Base+"ReadOnly":"")+(M.ClassAdd?" "+M.ClassAdd:"")+(M.Link?" "+M.Base+"Link":"")+(M.Align!=null?" "+M.Base+M.Align:"");
if(M.Align!=null) I.style.textAlign = M.Align;
if(M.ReadOnly) I.readOnly = true;
I.onclick = function(ev){ M.Click(ev?ev:event); }
if(M.Multi && M.Grid) I.onmouseenter = function(){ M.Grid.ARow = M.Grid.ERow; } 

if(BTablet) I.ontouchstart = function(ev){ M.Click(ev?ev:event); }
else if(BTouch) AttachEvent(I,"touchstart",function(ev){ M.Click(ev?ev:event); }); 

I.onkeydown = function(ev){ M.KeyDown(ev?ev:event); }
I[!BIEA||BIEA10&&!M.Html?"oninput":"onkeyup"] = function(ev){ M.KeyUp(ev?ev:event); }



 

tag.innerHTML = ""; 
var s = GetStyle(tag), pp;
var w = tag.clientWidth; if(!w) w = tag.offsetWidth;
pp = parseInt(s.paddingLeft); if(pp) w-=pp;
pp = parseInt(s.paddingRight); if(pp) w-=pp;
if(!tag.clientWidth){
   pp = parseInt(s.borderLeftWidth); if(pp) w-=pp;
   pp = parseInt(s.borderRightWidth); if(pp) w-=pp;
   }  
if(w<=0) return null; 

I.style.width = w+"px";
I.onmousedown = function(ev){ CancelEvent(ev?ev:event,1); } 

if(M.Html){
    
   }
else {
   I.value = hef||val===""&&M.CanEmpty ? val : M.ToString(val,1);
   M.OrigString = I.value;
   }
MS.EditMask; 
if(M.EditMask) {
   try { SetMask(I,M.EditMask,window.Grids?Grids.InsKey:null,M.MaskColor,M.MaskSound,M.MaskSoundLength,this.Digits); }
   catch(e){ MS.Debug; if(M.Grid) M.Grid.Debug(1,"Attaching EditMask /",M.EditMask,"/ failed with exception ",e.message?e.message:e); else throw(e); ME.Debug; }
   }
ME.EditMask;
if(M.Multi){
   var h = tag.clientHeight; if(!h) h = tag.offsetHeight;
   var dh = h;
   
   I.style.height = h+"px";
   }
tag.appendChild(I);
if(M.Multi){
   var nh = tag.clientHeight; if(!nh) nh = tag.offsetHeight;
   
   if(nh!=dh) I.style.height = h+dh-nh+"px";
   }

M.AVal = val;
M.Tag = I;
if(I.offsetWidth>w){ w = w*2 - I.offsetWidth; I.style.width = w+"px"; }
if(M.Multi && I.offsetHeight>h) I.style.height = (h*2 - I.offsetHeight)+"px";
if(M.AutoSize) {
   M.Resize(1);
   setTimeout(function(){ if(M.Edited) M.Resize(); },10); 
   }
if(BIEA) { 
   I["onfocusout"] = function(){ M.ASel = GetSelection(I); }
   I["onfocusin"] = function(){ M.ASel = null; }
   }
if(M.Grid && M.Grid.TestIds) I.id = M.Grid.GetItemId("Input");
var PM = function(ev){ PreventMouseWheel(M.Grid,I,0,ev?ev:event); };
if(I.onwheel || window.WheelEvent) I.addEventListener('wheel',PM,false); 
else { I.onmousewheel = PM; if(I.addEventListener) I.addEventListener('DOMMouseScroll',PM,false); }

function AutoSelect(){
   if(M.AutoSelect==1||M.AutoSelect==2) {
      if(M.Html){
          
         }
      else if(I.select){
         I.select();
         if(M.AutoSelect==2) { if(BIEA&&!BIEA9) SetSelection(I,0,GetSelection(I)[1]-1); else I.selectionEnd--; } 
         }
      }
   else if(M.Html && (M.AutoSelect==3||M.AutoSelect==4)) { var S = getSelection(); S.selectAllChildren(I); if(M.AutoSelect==3) S.collapseToEnd(); else S.collapseToStart(); } 
   else if(M.AutoSelect==3) I.selectionStart = I.selectionEnd = I.value.length;
   else if(M.AutoSelect==4) I.selectionStart = I.selectionEnd = 0;
   else if(M.ToSelect!=null) { SetSelection(M.Tag,M.ToSelect,M.ToSelect); M.ToSelect = null; } 
   }

   if(!BTablet||!M.Html&&!BAndroid) I.focus();  
   
   AutoSelect();
   
Dialogs.Add(M);
if(M.SF.SuggestStart==2) M.SF.StartSuggest("");
else if(M.SF.SuggestStart) {
   var str = (M.Html?I.innerText:I.value).replace(/\r\n|\r/g,"\n");
   if(M.SF.SuggestSeparator){
      var idx = str.search(M.SF.SuggestSeparator);
      if(idx>=0) str = str.slice(0,idx);
      }
   M.StartSuggest(str);
   }
M.Edited = 1;
I.TGEdit = 1;
if(M.OnStartEdit) M.OnStartEdit();
M.AddUndo();
if(BIEA && M.OUndo){
   M.UndoInterval = setInterval(function(){ M.AddUndo(); },500);
   }
 
M.NoClickTo = (new Date()).getTime()+300;
if(BTablet&&M.Html){ 
   var II = document.createElement("input"); 
   II.style.width = "0px"; II.style.cssFloat = "left"; II.style.outline = "0px none"; II.style.border = "0px none";
   I.parentNode.insertBefore(II,I);
   II.focus();
   setTimeout(function(){ 
      I.contentEditable = true; 
      I.focus(); 
      AutoSelect();
      II.parentNode.removeChild(II); 
      },200);
   }
else if(BAndroid) setTimeout(function(){ I.focus(); },200); 
return M;
}
var TGShowEdit = ShowEdit; if(window["ShowEdit"]==null) window["ShowEdit"] = ShowEdit; 
// -----------------------------------------------------------------------------------------------------------
function CreateInput(M,P){
if(M.Input && typeof(M.Input)!="object"){
   var inp = GetElem(M.Input);
   if(!inp){
      inp = document.createElement("input");
      inp.name = M.Input;
      inp.id = M.Input;
      inp.type = "hidden";
      if(document.forms.length==1) document.forms[0].appendChild(inp);
      else if(P.Tag) P.Tag.parentNode.insertBefore(inp,P.Tag);
      else if(document.forms[0]) document.forms[0].appendChild(inp);
      else AppendTag(inp);
      }
   M.Input = inp;
   }
}
// -----------------------------------------------------------------------------------------------------------
TEdit.GetSelection = function(){ return this.ASel ? this.ASel : GetSelection(this.Tag); }
// -----------------------------------------------------------------------------------------------------------
TEdit.KeyDown = function(ev){

var key = ev.keyCode; if(!key) key = ev.charCode;

if(this.Grid && this.Grid.Disabled && this.Grid.Message && this.Grid.Message.Close){
   if(key==13 || key==27) this.Grid.Message.Close(key==13?-1:-2); 
   CancelEvent(ev); 
   return; 
   }
var ret = true;
if(this.SuggestMenu && this.SuggestMenu.Cursor && (key==13 || (key==33||key==34||key==38||key==40)&&!this.SF.SuggestArrows!=!ev.ctrlKey)){ 
   this.SuggestMenu.KeyDown(key,ev);
   
   return; 
   }

if(key==13 && !BAndroid) { 
   if((this.AcceptEnters&2 && (ev.shiftKey||ev.altKey||ev.ctrlKey) || this.Html&&((this.AcceptEnters&3)==3||(this.AcceptEnters&3)==1&&!ev.shiftKey&&!ev.altKey&&!ev.ctrlKey) && (this.Multi||this.AcceptEnters&4))&&!this.ReadOnly){ 
      var I = this.Tag;
      if(!this.Html) {
         var A = this.GetSelection();
         I.value = I.value.slice(0,A[0])+"\n"+I.value.slice(A[1]);
         SetSelection(I,A[0]+1,A[0]+1);
         }
      else if(window.getSelection){ 
          
         }
      else if(document.selection) {
          
         } 
      this.AddUndo();
      CancelEvent(ev);
      this.Resize();
      }
   else if(!this.Multi&&!(this.AcceptEnters&4)||!(this.AcceptEnters&1)||ev.shiftKey||ev.altKey||ev.ctrlKey) { 
      if(this.OnEnter && this.OnEnter(ev)) return;
      ret = this.Save(); 
      }
   else CancelEvent(ev,1); 
   }
if(key==27) {
   if(this.SuggestMenu && this.SF.SuggestEsc) { this.CloseSuggestMenu(); CancelEvent(ev); return; }
   if(this.OnEsc && this.OnEsc(ev)) return;
   ret = this.Cancel();
   }
if(key==9&&!this.ReadOnly){ 
   var save = this.OnTab ? this.OnTab(ev.shiftKey?1:0,ev) : this.SaveMove;
   if(save && this.Tag && this.Save() == false) ret = false;
   }
if(key==38 || key==40){  
   if(this.Multi && (!this.SuggestMenu||!this.SF.SuggestArrows==!ev.ctrlKey)) CancelEvent(ev,1);
   else if(!this.SuggestMenu){
      var save = this.OnArrow ? this.OnArrow(key==38?0:1,ev) : this.SaveMove;
      if(save && this.Tag && this.Save() == false) ret = false;
      }
   
   }
if(this.ReadOnly && (ev.ctrlKey||ev.metaKey) && key!=67){ 
   CancelEvent(ev,2); return;
   }
if(key==90&&(ev.ctrlKey||ev.metaKey)&&this.OUndo){ this.Undo(); ret = false; }
if(key==89&&(ev.ctrlKey||ev.metaKey)&&this.OUndo){ this.Redo(); ret = false; }
if((this.SF.Suggest||this.OnSuggest) && this.SF.SuggestExisting) this.AESel = this.GetSelection(); 
if(this.OnKeyDown) this.OnKeyDown(key,ev,!ret);
if(!ret) CancelEvent(ev);
if(BIEA&&this.AutoSize) { var T = this; setTimeout(function(){ if(T.Edited) T.Resize(); },10); }

}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
TEdit.CanUndo = function(){ return this.OUndo&&this.OUndo.Pos>1 ? true : false; }
TEdit.CanRedo = function(){ return this.OUndo&&this.OUndo.Pos < this.OUndo.length ? true : false; }
// -----------------------------------------------------------------------------------------------------------
TEdit.Undo = function(){
var OU = this.OUndo; if(!OU || OU.Pos<=1) return false;
var U = OU[--OU.Pos-1];
this.Tag.innerHTML = U[0]; SetSelection(this.Tag,U[1],U[2]);
if(this.Grid&&(OU.Pos<=1||OU.Pos>=OU.length-1)) this.Grid.CalculateSpaces(1);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TEdit.Redo = function(){
var OU = this.OUndo; if(!OU || OU.Pos==OU.length) return false;
var U = OU[OU.Pos++];
this.Tag.innerHTML = U[0]; SetSelection(this.Tag,U[1],U[2]);
if(this.Grid&&(OU.Pos<=1||OU.Pos>=OU.length-1)) this.Grid.CalculateSpaces(1);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TEdit.AddUndo = function(){
var OU = this.OUndo; if(!OU) return false;
var A = GetSelection(this.Tag), calc = OU.Pos<=1||OU.Pos!=OU.length;
var U = [this.Tag.innerHTML,A[0],A[1]], O = OU[OU.Pos-1];
if(O&&O[0]==U[0]) return false; 
OU[OU.Pos++] = U; OU.length = OU.Pos;
if(calc&&this.Grid&&OU.Pos>1) this.Grid.CalculateSpaces(1);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TEdit.Save = function(val){
if(val==null){ 
   if(this.ReadOnly) return this.Cancel();
   var I = this.Tag, s = null; 
   if(this.Html){
      
      }
   else val = I.value.replace(/\r\n|\r/g,"\n");
   if(this.CancelUnchanged && val===this.OrigString) return this.Cancel();
   if(this.ResultFailed) return;

   MS.EditMask;
   var mask = this.ResultMask;
   if(Try) {
      if(mask){
         var tval = this.Html ? I.innerText.replace(/\r\n|\r/g,"\n") : val;
         MS.Digits;
         var dig = this.Digits; if(dig==null) dig = Formats.Digits;
         if(dig){
            dig = dig.split(dig.charAt(0));
            for(var i=0;i<10;i++) tval = (tval+"").replace(new RegExp(ToRegExp(dig[i+1]),"g"),i);
            }
         ME.Digits;
         if(tval.search(typeof(mask)=="object" ? mask : new RegExp(mask,""))<0){
            var ret = this.OnResultMask ? this.OnResultMask(tval) : 0;
            if(!ret || ret==1) {
               var T = this; if(!s) s = this.GetSelection();
               if(!ret && this.ResultText) alert(this.ResultText);
               function cont() { T.ResultFailed = 0; try{ I.focus(); SetSelection(I,s[0],s[1]); } catch(e) { } }
               this.ResultFailed = 1;
               if(!ret && this.ResultMessage && this.Grid) this.Grid.ShowMessageTime(this.ResultMessage,this.ResultMessageTime,cont);
               else setTimeout(cont,10);
               return; 
               }
            else if(ret==2) return this.Cancel();
            else if(ret==4) this.Error = 1;
            }
         }
      }
   else if(Catch){ alert("Wrong result mask "+this.ResultMask); }
   ME.EditMask;
   var rawval = val, hef = this.EditFormula && Formats.FormulaPrefix && (val+"").indexOf(Formats.FormulaPrefix)==0; 
   val = hef ? val : this.ToValue(val);
   if((!val || val==Formats.NaN || val==Formats.NaD) && val!=="") {
      if(isNaN(val) || val==Formats.NaN || val==Formats.NaD){
         var a = this.AcceptNaN, txt = this.AcceptNaNText;
         if(!a) return; 
         if((a==1||a==3||a==5)&&txt) { if(this.Grid) this.Grid.ShowMessageTime(txt,this.Grid.AcceptNaNTime); else alert(txt); }
         if(a<=3) return a!=1 ? this.Cancel() : null;
         if(this.AcceptNaNValue!=null) { val = this.AcceptNaNValue; if(val=="NaN") val = NaN; }
         else if(val!=Formats.NaN && val!=Formats.NaD) val = 0; 
         if(a>=6 && txt){
            if(this.Grid){
               var T = this; this.Grid.ShowMessageTime(txt,0,function(but){ 
                  if((but==1||but==-1)&&a==8) T.Cancel(); else if(but==1) T.Save(val); else if(a==7) T.Cancel();
                  },["Ok","Cancel"]); 
               return;
               }
            else if(!confirm(txt)) return a==7 ? this.Cancel() : null;
            else if(a==8) return this.Cancel();
            }
         }
      else val = 0;
      }
   }
var ioval = hef ? val : Formats.ValueToString(val,this.Type,this.IOFormat,this.Range?1:0);
var dispval = hef ? val : Formats.ValueToString(val,this.Type,this.DisplayFormat,this.Range);
if(this.Multi) { 
   val = (val+"").replace(/\r\n|\r/g,"\n");
   ioval = ioval.replace(/\r\n|\n/g,"%n");
   dispval = dispval.replace(/\r\n|\n/g,"<br/>");
   }
if(!this.TestSuggestExisting(val)) {
   if(this.ResultText) alert(this.ResultText);
   if(!s) s = this.GetSelection();
   var T = this; setTimeout(function(){ T.ResultFailed = 0; try{ I.focus(); SetSelection(I,s[0],s[1]); } catch(e) { } },10);
   this.ResultFailed = 1;
   return;
   }
var ret = this.OnSave ? this.OnSave(val,ioval,dispval,rawval) : null;
if(ret==false) { this.NoClickTo = new Date()-0+100; return; }
this.OriginalValue = ret==true ? null : dispval;
if(this.Input && ret!=true) this.Input.value = ioval;
return this.Cancel();   
}
// -----------------------------------------------------------------------------------------------------------
TEdit.ToValue = function(val){ 
return Formats.StringToValue(val,this.Type,this.Format,this.Range?1:0,1,this.DefaultDate,this.FormatCase,this.FormatWhiteChars,this.FormatCharCodes,this.Digits); 
}
// -----------------------------------------------------------------------------------------------------------
TEdit.ToString = function(val,edit){ 
val = Formats.ValueToString(val,this.Type,this.Format,this.Range?1:0,edit);
MS.Digits; if(Formats.Digits&&this.Digits!=""&&(val+"").search(/\d/)>=0) val = Formats.ConvertDigits(val,this.Digits); ME.Digits;
return val;
}
// -----------------------------------------------------------------------------------------------------------
TEdit.Close = function(){
if(this.SaveMouse) this.Save();
else this.Cancel();
}
// -----------------------------------------------------------------------------------------------------------
TEdit.Cancel = function(){
var I = this.Tag;
if(I){
   try {
      var s = this.GetSelection();
      if(this.OnClose && this.OnClose() == false){
         setTimeout(function(){ I.focus(); SetSelection(I,s[0],s[1]); },10);
         return false;
         }
      I.onkeypress = null; 
      I.onkeydown = null; 
      I.onkeyup = null;   
      
      I.blur();
      if(!this.NoRemove){
         var P = I.parentNode;
         P.removeChild(I);
         if(this.OriginalValue!=null) P.innerHTML = this.OriginalValue;
         }
      }
   catch(e) { }
   }
else if(this.OnClose) this.OnClose(); 
if(this.SuggestTimeout) clearTimeout(this.SuggestTimeout);
if(this.ResizeTimeout) clearTimeout(this.ResizeTimeout);
if(this.TmpTag) { this.TmpTag.parentNode.removeChild(this.TmpTag); this.TmpTag = null; }
delete Dialogs[this.id];
this.id = null;
MS.DatePick; if(this.Calendar&&this.Calendar.Close){ this.Calendar.OnClose = null; this.Calendar.Close(); } ME.DatePick;
if(this.SuggestMenu) this.CloseSuggestMenu();
if(this.ResizeTag){ this.ResizeTag.parentNode.removeChild(this.ResizeTag); this.ResizeTag = null; }
if(this.ResizeTagHtml){ this.ResizeTagHtml.parentNode.removeChild(this.ResizeTagHtml); this.ResizeTagHtml = null; }

this.Error = null;
this.Edited = 0;
if(this.UndoInterval) { clearInterval(this.UndoInterval); this.UndoInterval = null; }
}
// -----------------------------------------------------------------------------------------------------------
function TestKey(ev,tag,func,data,data2,data3){
var okey = ev.keyCode; if(!okey || BMozilla) okey = ev.charCode; if(!okey) return;
if(ev.ctrlKey) return;
var nkey = func(okey,tag.value==null?tag.innerText:tag.value,data,data2,data3), dom2 = !!ev.preventDefault; 
if(typeof(nkey)=="string") nkey = nkey.charCodeAt(0);
if(nkey && nkey!=okey){
   if(!dom2) ev.keyCode = nkey;       
   else { 
      try {
         var s = tag.selectionStart, e = tag.selectionEnd; if(e==null) e = s;
         var val = tag.value==null ? tag.innerText : tag.value;
         val = val.slice(0,s)+String.fromCharCode(nkey)+val.slice(e);
         if(tag.value==null) tag.innerText = val; else tag.value = val;  
         tag.selectionStart = s+1; tag.selectionEnd = s+1;
         }
      catch(ex) { }
      nkey = 0; 
      }
   }   
if(!nkey){
   if(dom2) ev.preventDefault();
   else ev.returnValue = false;
   }
return nkey;
}  
// -----------------------------------------------------------------------------------------------------------
// Tests pressed key if can be added into integer number, include hexadecimal numbers
function TestKeyInt(key,val,add,spec){
if(spec && (val.indexOf(spec)>=0 || key==spec.charCodeAt(0))) return key;
if(key>=97 && key<=122) key-=32; 
if(add) for(var i=0;i<add.length;i++) if(key==add.charCodeAt(i)) return key;

if(key==88) return 120; 

if(key==45) return  key; 
if(key>=65 && key<=70) return val.indexOf('x')>=0 ? key : 0; 
if(key>=48 && key<=57 || key==8) return key;      
return 0;
}

// -----------------------------------------------------------------------------------------------------------
// Tests pressed key if can be added into floating point number
function TestKeyFloat(key,val,add,spec){
if(spec && (val.indexOf(spec)>=0 || key==spec.charCodeAt(0))) return key;
if(key>=97 && key<=122) key-=32; 
if(add) for(var i=0;i<add.length;i++) if(key==add.charCodeAt(i)) return key;
if(key==45) return key; 
for(var i=0;i<Formats.InputDecimalSeparators.length;i++) if(key==Formats.InputDecimalSeparators.charCodeAt(i)){ 
   
   return Formats.DecimalSeparator.charCodeAt(0);
   }
for(var i=0;i<Formats.InputGroupSeparators.length;i++) if(key==Formats.InputGroupSeparators.charCodeAt(i)) { 

   return Formats.GroupSeparator.charCodeAt(0);
   }
if(key==69) return val.indexOf('e')>=0 ? 0 : 101; 
if(key>=48 && key<=57 || key==8) return key;      
return 0;
}
// -----------------------------------------------------------------------------------------------------------
// Tests pressed key if can be added into date/time value
MS.Date;
function TGTestKeyDate(key,val,add,spec,month){
if(spec && (val.indexOf(spec)>=0 || key==spec.charCodeAt(0))) return key;
var plus = 0;
if(key>=97 && key<=122) { key -= 32; plus = 32; } 
if(month&&(key>=65&&key<=90||month[key])) return key+plus;
if(add) for(var i=0;i<add.length;i++) if(key==add.charCodeAt(i)) return key+plus;
for(var i=0;i<Formats.InputDateSeparators.length;i++) if(key==Formats.InputDateSeparators.charCodeAt(i)) return Formats.DateSeparator.charCodeAt(0)+plus;
for(var i=0;i<Formats.InputTimeSeparators.length;i++) if(key==Formats.InputTimeSeparators.charCodeAt(i)) return Formats.TimeSeparator.charCodeAt(0)+plus;
if(key==32 || key==44) return 32; 
if(key>=48 && key<=57 || key==8) return key;      
return 0;
}
ME.Date;
// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------
TEdit.KeyUp = function(ev){
if(!this.Edited) return;
if(ev.inputType=="historyUndo"){ this.Undo(); CancelEvent(ev); return; }
if(ev.inputType=="historyRedo"){ this.Redo(); CancelEvent(ev); return; }
var key = ev.keyCode; if(!key) key = ev.charCode;
if(this.AutoSize) this.Resize();

var I = this.Tag;
MS.Digits;
if(Formats.Digits && (this.Html?I.innerText:I.value).search(/\d/)>=0 && this.Digits!=""){
   var S = this.GetSelection();
   if(this.Html) I.innerHTML = Formats.ConvertDigits(I.innerHTML,this.Digits);
   else I.value = Formats.ConvertDigits(I.value,this.Digits);
   SetSelection(I,S[0],S[1]);
   }
ME.Digits;
this.AddUndo();
var val = this.Html ? (I.firstChild?I.innerHTML:"") : I.value.replace(/\r\n/g,'\n');
if(val==this.AVal) return;
if(this.OnChange) this.OnChange(val,this.AVal);
var hef = this.EditFormula && Formats.FormulaPrefix ? (val+"").indexOf(Formats.FormulaPrefix)==0 : 0; this.SF = hef ? this.EF : this;
if(this.Size) I.maxLength = hef?1e8:this.Size;

var zal = this.AVal; this.AVal = val;

if(this.Calendar){
   MS.DatePick;
   val = this.ToValue(val);
   if(!isNaN(val)){
      var C = this.Calendar;
      C.Date = val;
      var o = C.OnClose; C.OnClose = null;
      this.Calendar.Close();
      C.OnClose = o;
      ShowCalendar(C,{Tag:I.parentNode,Align:this.CalendarAlign?this.CalendarAlign:"right below"});
      }
   ME.DatePick;
   }
else {
   if(this.SF.SuggestSeparator&&key==13&&this.SuggestMenu&&this.SuggestMenuCursor) return; 
   this.StartSuggest();
   if(!this.Edited) return; 
   if(!this.TestSuggestExisting(this.AVal,key!=13)) {
      if(this.Html) I.innerHTML = zal; else I.value = zal;
      if(this.AESel) SetSelection(I,this.AESel[0],this.AESel[1]);
      this.AVal = zal;
      this.StartSuggest();
      if(this.MaskColor) {
         if(this.BTimeout) { clearTimeout(this.BTimeout); I.style.backgroundColor = this.BColor; }
         var oldcolor = I.style.backgroundColor; this.BColor = oldcolor;
         I.style.backgroundColor = this.MaskColor;
         this.BTimeout = setTimeout(function(){ try { I.style.backgroundColor = oldcolor; } catch(e){}},200);
         }
      }
   }

}
// -----------------------------------------------------------------------------------------------------------
MS.Menu;
// -----------------------------------------------------------------------------------------------------------
TEdit.StartSuggest = function(val){
if(this.SF.Suggest || this.OnSuggest) {
   if(val==null){
      var sep = this.SF.SuggestSeparator;
      val = this.Html ? this.Tag.innerText : this.AVal;
      if(sep && val.search(sep)>=0){
         var pos = this.GetSelection()[0];
         
         var s = val.match(sep);
         val = val.split(sep);
         for(var i=0;i<val.length;i++) { pos -= val[i].length+(s[i]?s[i].length:0); if(pos<0) break; }
         val = i==val.length ? val[i-1] : val[i]; 
         
         }
      }
   if(!this.SF.SuggestDelay) this.CreateSuggest(val);   
   else {
      if(this.SuggestTimeout) clearTimeout(this.SuggestTimeout);
      if(this.SuggestMenu) this.CloseSuggestMenu();
      var T = this; this.SuggestTimeout = setTimeout(function(){ T.CreateSuggest(val); },this.SF.SuggestDelay);
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TEdit.CloseSuggestMenu = function(){
this.SuggestMenu.Close(); this.SuggestMenu = null;
if(BIEA){ var I = this.Tag, A = this.GetSelection(); I.style.display = "none"; I.style.display = ""; I.focus(); SetSelection(I,A[0],A[1]); } 
}
// -----------------------------------------------------------------------------------------------------------
TEdit.CreateSuggest = function(val){
var D = this.SF.Suggest; if(this.SF==this) val = this.ToValue(val);
if(this.SuggestMenu) this.CloseSuggestMenu();
if(this.SF.SuggestMin && (val+"").length<this.SF.SuggestMin) return;
D = TMenu.InitMenu(D);
if(D) {
   var L = D.Items, spec = this.SF.SuggestWhiteChars || this.SF.SuggestCharCodes || Formats.Digits;
   if(spec && !D.Converted){
      var dig = this.Digits; MS.Digits; if(dig==null) dig = Formats.Digits; if(dig) dig = dig.split(dig.charAt(0)); ME.Digits;
      for(var i=0;i<L.length;i++) {
         var v = L[i].Text;
         if(v==null||v==CNBSP) v = L[i].Name ? L[i].Name : "";
         else if(dig){ MS.Digits; for(var j=0;j<10;j++) v = v.replace(new RegExp(ToRegExp(dig[j+1]),"g"),j); ME.Digits; }
         if(!this.SF.SuggestCase) v = v.toLowerCase()
         if(this.SF.SuggestWhiteChars) v = v.replace(this.SF.SuggestWhiteChars,"");
         MS.CharCodes; if(this.SF.SuggestCharCodes) v = UseCharCodes(v,this.SF.SuggestCharCodes); ME.CharCodes;
         L[i].Converted = v;
         }
      D.Converted = 1;
      }
   if(val=="" || this.SF.SuggestAll){
      for(var i=0;i<L.length;i++) L[i].Hidden = !this.SF.SuggestEmpty&&!this.SF.SuggestAll;
      }
   else {   
      if(spec){
         if(!this.SF.SuggestCase) val = val.toLowerCase();
         if(this.SF.SuggestWhiteChars) val = val.replace(this.SF.SuggestWhiteChars,"");
         MS.CharCodes; if(this.SF.SuggestCharCodes) val = UseCharCodes(val,this.SF.SuggestCharCodes); ME.CharCodes;
         }
      var R = new RegExp((this.SF.SuggestSearch?"":(this.SF.SuggestBegin?"^":"(^|\\W)"))+ToRegExp(val),this.SF.SuggestCase?"":"i"), cnt = 0, O = null;
      for(var i=0;i<L.length;i++) if((L[i].Converted?L[i].Converted:(L[i].Text!=null&&L[i].Text!=CNBSP?L[i].Text:(L[i].Name?L[i].Name:""))).search(R)<0) L[i].Hidden = 1; else { L[i].Hidden = 0; cnt++; O = L[i]; }
      if(cnt==1 && (O.Text!=null?O.Text:O.Name) == val) { O.Hidden = 1; cnt = 0; }
      }

   }
if(this.OnSuggest) {
   var ND = this.OnSuggest(D,val,this.SF!=this);
   if(ND==false) return;
   if(ND!=null) D = ND;
   else if(val=="") return;
   }
else if(val=="" && !this.SF.SuggestEmpty && !this.SF.SuggestAll) return;   
this.ShowSuggest(D);
}
// -----------------------------------------------------------------------------------------------------------
TEdit.ShowSuggest = function(D){
if(!D || !window.ShowMenu) return;
D = TMenu.InitMenu(D);
if(!D) return;
D.Cursor = null;
var I = this.Tag, M = this, sep = M.SF.SuggestSeparator;

function SaveSep(item,save){
   I.focus(); 
   var pp = M.GetSelection()[0];
   var ival = (M.Html?I.innerText:I.value).replace(/\r\n|\r/g,'\n'), val = ival.split(sep), s = ival.match(sep);
   for(var i=0,pos=pp;i<val.length&&pos>val[i].length+(s&&s[i]?s[i].length:0);i++) pos -= val[i].length+(s[i]?s[i].length:0); 
   var sp = pp - pos; 
   val[i] = item.Value!=null?item.Value:item.Name;
   if(M.Format && M.Type=="Text" && M.Format.charCodeAt(0)==123){ 
      var ff = FromJSON(M.Format,1);
      if(ff[val[i]]!=null) val[i] = ff[val[i]];
      }
   pp += val[i].length - pos; 
   if(save && M.SF.SuggestAppendSeparator && i==val.length-1) { if(!s) s = []; s[i] = s&&s[0]?s[0]:M.SF.SuggestAppendSeparator; }
   if(!M.SF.SuggestBeforeSeparator&&s&&s[i]) pp += s[i].length; 
   if(s) for(var j=0;j<val.length;j++) if(s[j]) val[j] += s[j];
   if(M.Html) I.innerText = val.join(""); 
   else I.value = val.join("");
   if(save) {
      SetSelection(I,pp,pp);           
      if((M.SF.Suggest||M.OnSuggest) && M.SF.SuggestExisting) M.AESel = M.GetSelection(); 
      M.AVal = (M.Html?I.innerHTML:I.value).replace(/\r\n|\r/g,"\n");;
      M.SuggestMenu = null;
      
      }
   else SetSelection(I,sp+val[i].length); 
   if(M.Multi||M.ParentAutoSize) M.Resize();
   }

if(this.SF.SuggestComplete){
   for(var i=0,cnt=0,pos;i<D.Items.length;i++) if(!D.Items[i].Hidden) { cnt++; pos = i; }
   if(cnt==1 && (!D.OnSave||D.OnSave(D.Items[pos],D.GetValues(D.Items))!=false)){
      if(sep) SaveSep(D.Items[pos],1);
      else { var v = D.Items[pos].Value!=null?D.Items[pos].Value:D.Items[pos].Name; if(M.Html) I.innerHTML = v; else I.value = v; }
      if(this.OnChange) this.OnChange(M.Html?I.innerHTML:I.value,this.AVal);
      this.AVal = (M.Html?I.innerHTML:I.value).replace(/\r\n|\r/g,'\n');
      this.OrigString = null;
      this.Save();
      return;
      }
   }

D.OnCSave = function(item){ 
   if(sep) SaveSep(item,1);
   else {
      var v = item.Value!=null?item.Value:item.Name; if(M.Html) I.innerHTML = v; else I.value = v;
      M.OrigString = null;
      M.Save(); 
      M.SuggestMenu = null;
      }
   }
if(M.SF.SuggestReplace) {
   M.ARVal = M.AVal; var sel = M.GetSelection()[0];
   D.OnMoveOut = function(dummy){ if(M.Html) I.innerHTML = M.ARVal; else I.value = M.ARVal; I.focus(); SetSelection(I,sel); return true; };
   D.OnMove = function (item) { 
      if(sep) SaveSep(item,0);
      else {
         var val = item.Value!=null?item.Value:item.Name;
         if(M.Format && M.Type=="Text" && M.Format.charCodeAt(0)==123){ 
            var ff = FromJSON(M.Format,1);
            if(ff[val]!=null) val = ff[val];
            }
         if(M.Html) I.innerHTML = val; else I.value = val;
         I.focus(); 
         SetSelection(I,(M.Html?I.innerText:I.value).length);
         }
      if(M.OnChange) M.OnChange(M.Html?I.innerHTML:I.value,this.AVal);
      M.AVal = (M.Html?I.innerHTML:I.value).replace(/\r\n|\r/g,"\n");
      }
   }
else D.OnMoveOut = function(dummy){ return true; };
D.FocusTag = I;
MS.Digits; D.Digits = this.Digits; ME.Digits;
D.StyleSize = this.StyleSize;
D.IgnoreTab = 0; 
D.NoFindItem = 1;
if(M.SF.SuggestItemAlign && !D.ItemAlign) D.ItemAlign = M.SF.SuggestItemAlign;
if(M.SF.SuggestMainClass && D.MainClass==null) D.MainClass = M.SF.SuggestMainClass;

if(this.SuggestMenu) this.CloseSuggestMenu();

this.SuggestMenu = ShowMenu(D,{Tag:this.ParentTag&&this.ParentTag.offsetHeight>=I.parentNode.offsetHeight ? this.ParentTag : I.parentNode,Align:this.SF.SuggestAlign?this.SF.SuggestAlign:"left below",Scale:this.Scale});
}
// -----------------------------------------------------------------------------------------------------------
TEdit.TestSuggestExisting = function(val,search,SF,dig){
if(!SF) SF = this.SF;
if(!SF.SuggestExisting || !SF.Suggest) return true;
var D = SF.Suggest; if(!D.Items) D = TMenu.InitMenu(D,null,null,1);
D = D.Items;
MS.Digits; if(dig==null) dig = this.Digits; if(dig==null) dig = Formats.Digits; if(dig) dig = dig.split(dig.charAt(0)); ME.Digits;
if(SF.SuggestWhiteChars||SF.SuggestCharCodes||dig){
   MS.Digits; if(dig){ for(var j=0;j<10;j++) val = val.replace(new RegExp(ToRegExp(dig[j+1]),"g"),j); } ME.Digits;
   if(SF.SuggestCase) val = val.toLowerCase()
   if(SF.SuggestWhiteChars) val = val.replace(SF.SuggestWhiteChars,"");
   MS.CharCodes; if(SF.SuggestCharCodes) val = UseCharCodes(val,SF.SuggestCharCodes); ME.CharCodes;
   }
var vv = SF.SuggestSeparator ? val.split(SF.SuggestSeparator) : [val];
for(var j=0;j<vv.length;j++){
   var v = vv[j]; if(!v) continue;
   if(search) var R = new RegExp((SF.SuggestSearch?"":(SF.SuggestBegin?"^":"(^|\\W)"))+ToRegExp(v),SF.SuggestCase?"":"i");
   for(var i=0;i<D.length;i++){
      var item = D[i];
      if(search){
         if((D[i].Converted!=null?D[i].Converted:(D[i].Text!=null?D[i].Text:D[i].Name)).search(R)>=0) break;
         }
      else if((item.Value!=null?item.Value:item.Name)==v) break;
      }
   if(i==D.length) return false; 
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
ME.Menu;
// -----------------------------------------------------------------------------------------------------------
// Called in textarea for its height update
TEdit.Resize = function(start,always){
if(!this.Multi&&!this.ParentAutoSize||this.InResize) return false;
this.InResize = 1;
var X = this.Html ? this.ResizeTagHtml : this.ResizeTag, I = this.Tag;
if(!X){
   X = document.createElement(this.Html?"div":"textarea");
   X.style.position = "absolute";
   X.style.left = "0px";
   X.style.top = "0px";
   //.style.height = "16px";
   X.style.visibility = "hidden";
   if(!this.Html) X.style.height = "1px"; 
   //.style.border = "1px solid red";
   X.style.overflow = I.style.overflow?I.style.overflow:"hidden";
   X.style.width = I.style.width;
   X.style.fontWeight = I.style.fontWeight;
   X.style.fontStyle = I.style.fontStyle;
   X.style.fontSize = I.style.fontSize;
   X.style.fontFamily = I.style.fontFamily;
   AppendTag(X,this.StyleSize);
   if(this.Html) this.ResizeTagHtml = X;
   else this.ResizeTag = X;
   }
if(start) X.className = I.className; 
if(this.Html) X.innerHTML = I.innerHTML; 
else X.value = I.value; 
X.scrollHeight;

var h = this.Html ? X.offsetHeight : X.scrollHeight; if(BIE) h += I.offsetHeight-I.clientHeight; 

if(h<this.MinHeight) h = this.MinHeight;
var oh = parseInt(I.style.height); h += oh-I.offsetHeight;
var chgh = oh != h;
var dw = this.ParentAutoSize&2 ? X.scrollWidth - X.clientWidth : 0; if(BChrome&&this.Html&&dw==1) dw = 0; 
var w = dw>0||chgh||this.ParentAutoSize&2 ? parseInt(I.style.width)+dw : null, ow = w;

if(!chgh&&dw<=0&&!always&&(!start||!(this.ParentAutoSize&2))) { this.InResize = 0; return false; } 
if(this.MaxHeight){
   if(h>this.MaxHeight){
      if(I.style.overflow=="hidden"){ I.style.overflow = "auto"; X.style.overflow = "auto"; }
      h = this.MaxHeight;
      }
   else if(I.style.overflow=="auto"){ I.style.overflow = "hidden"; X.style.overflow = "hidden"; }
   }
if(this.OnResize) { var A = this.OnResize(h,w); if(w&&A&&A[1]) w = A[1]+w-dw-parseInt(I.style.width); }
if(w) { 
   I.style.width = w+"px"; X.style.width = w+"px"; 
   
   }
if(this.Multi) I.style.height = h+"px";
if(this.TmpTag || this.ParentAutoSize){
   var T = I.parentNode;
   if(this.Multi){
      var h = I.offsetHeight;
      if(BIE) h += T.offsetHeight - T.clientHeight;
      else if(BIEA&&!BIEA10) h++; 
      T.style.height = h+"px";
      if(BIE && T.scrollHeight > T.offsetHeight){ h += T.scrollHeight - T.offsetHeight; T.style.height = h+"px"; }
      }
   if(w){
      var w = I.offsetWidth;
      if(BIE) w += T.offsetWidth - T.clientWidth;
      T.style.width = w+"px";
      if(BIE && T.scrollWidth > T.offsetWidth){ h += T.WidthHeight - T.offsetWidth; T.style.height = h+"px"; }
      }
   }
if(this.ParentAutoSize&2&&this.Grid&&this.OnResize) this.Grid.UpdateCursorEdit(this.Grid.ERow,this.Grid.ECol); 
this.InResize = 0;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TEdit.Click = function(ev){

if(this.Grid&&this.Grid.Dialog) this.Grid.Dialog.Close();
CancelPropagation(ev);
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
ME.Edit;

// -----------------------------------------------------------------------------------------------------------
MS.CharCodes;
function UseCharCodes(str,codes){
str += "";
if(!codes) return str;
var cod = Dialogs.Chars[codes];
if(!cod) {
   cod = { };
   var c = codes.split(codes.charAt(0));
   for(var i=1;i<c.length;i+=2) cod[c[i]] = c[i+1];
   Dialogs.Chars[codes] = cod;
   }
var n = "";
for(var i=0;i<str.length;i++){
   var c = str.charAt(i);
   n += cod[c]?cod[c]:c;
   }
return n;
}
var TGUseCharCodes = UseCharCodes; if(window["UseCharCodes"]==null) window["UseCharCodes"] = UseCharCodes; 
ME.CharCodes;
// -----------------------------------------------------------------------------------------------------------
MS.Sort;
function UseLocale(str){
str += "";
var cod = Dialogs.LocaleCodes;
if(!cod) {
   cod = { };
   var A = [];
   for(var i=0;i<0x780;i++) A[i] = String.fromCharCode(i);
   A.sort(new Function("a","b","return a.localeCompare(b);"));
   //.sort(function(a,b){ return a.localeCompare(b); });
   for(var i=0;i<0x780;i++) cod[A[i].charAt(0)] = String.fromCharCode(i+32);
   Dialogs.LocaleCodes = cod;
   }
var n = "";
for(var i=0;i<str.length;i++){
   var c = str.charAt(i);
   n += cod[c]?cod[c]:c;
   }
return n;
}
ME.Sort;

// -----------------------------------------------------------------------------------------------------------
function GetWhiteChars(white){
if(!white) return null;
var w = Dialogs.Chars[white]; if(w) return w;
w = new RegExp("["+(white+"").replace(/[\^\$\.\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}\/]/g,"\\$&")+"]","g");
Dialogs.Chars[white] = w;
return w;
}
// -----------------------------------------------------------------------------------------------------------

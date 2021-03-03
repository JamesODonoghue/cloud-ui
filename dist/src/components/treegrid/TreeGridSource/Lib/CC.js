MS.Lib;
// -----------------------------------------------------------------------------------------------------------
var TControl = {
   id : null,
   Class : "GM",
   Tag : null,
   Input : null,
   _nope:0 };
// -----------------------------------------------------------------------------------------------------------
var Controls = [], TGControls = Controls; if(window["Controls"]==null) window["Controls"] = Controls;
Controls.TabOut = 0;    
// -----------------------------------------------------------------------------------------------------------
Controls.Create = function(tag){
var M = { };
for(var i in TControl) M[i] = TControl[i];
M.id = Controls.length;
M.This = "TGControls["+M.id+"]";
Controls[Controls.length] = M;
var I = document.createElement("input");
I.type = "hidden";
if(tag.name) I.name = tag.name;
else if(tag.id) I.name = tag.id;
else I.name = "Control"+M.id;
I.value = tag.value!=null ? tag.value : tag.innerHTML.replace(/^\s*|\s*$/g,"");
M.Input = I;
M.Tag = tag;
tag.control = M;
return M;
}
// -----------------------------------------------------------------------------------------------------------
function InitControls(tag){
if(!tag) tag = document;
if(TControl.Class!="GM"){
   MS.Menu; if(TMenu.Base=="GMMenu") TMenu.Base = TControl.Class+"Menu"; ME.Menu;
   MS.Dialog; if(TDialog.Base=="GMMenu") TDialog.Base = TControl.Class+"Menu"; ME.Dialog;
   MS.Edit; if(TEdit.Base=="GMEdit") TEdit.Base = TControl.Class+"Edit"; ME.Edit;
   MS.LibMouse; if(TLibMouseObject.Class=="GMMouse") TLibMouseObject.Class = TControl.Class+"Mouse"; ME.LibMouse;
   MS.DatePick; if(TCalendar.Class=="GMPick") TCalendar.Class = TControl.Class+"Pick"; ME.DatePick;
   }
var A = tag.all; if(!A) A = tag.getElementsByTagName('*');
var len = A.length, CC = [];
if(BIEA&&!BIEA8) { for(var i=0;i<len;i++) if(A[i].cc) CC[CC.length] = A[i]; }
else for(var i=0;i<len;i++) if(A[i].getAttribute('cc')) CC[CC.length] = A[i];

for(var i=0;i<CC.length;i++) InitControl(CC[i]);
}
var TGInitControls = InitControls; if(window["InitControls"]==null) window["InitControls"] = InitControls; 
// -----------------------------------------------------------------------------------------------------------
function InitControl(tag){
var C = tag, move = "", click = "";
function Replace(str) { return str ? '"'+(str+"").replace(/\\/g,"\\\\").replace(/\"/g,'\\"')+'"' : "null"; }

var cc = C.getAttribute('cc').toLowerCase();
if(cc) { 
   var D = FromJSON(C.getAttribute('data'));
   
   if(!D) D = { };
   if(cc=="enum" || cc=="select" || cc=="combo"){
      MS.Enum;
      var M = C.control; if(!M) M = Controls.Create(C);
      M.Type = "Enum";
      if(!C.className) C.className = TControl.Class + (C.clientWidth?"EnumControl":"EnumInline");
      var func = M.This+".Data=TGShowEnum("+M.This+".Data,this);";
      D = TMenu.InitMenu(D);
      if(D.AutoPopup) move += func;
      else click += func;
      C.innerHTML = M.Input.value;
      D.Input = M.Input;
      M.Data = D;
      click += "TGControls.Focus("+M.This+");";
      D.OnTab = function (dir,ev){
         Controls.FocusNext(M,dir?1:0);
         CancelEvent(ev);
         return false;
         }
      ME.Enum;
      }
   else if(cc=="edit" || cc=="input"){
      var M = C.control; 
      if(!M) { 
         M = Controls.Create(C);
         if(D.Value!=null) M.Input.value = Formats.ValueToString(D.Value,D.Type,D.IOFormat,D.Range);
         }
      M.Data = D;   
      M.Type = "Edit";
      if(!C.className) C.className = TControl.Class+(C.clientWidth?"Edit ":"EditInline ")+TControl.Class+"Edit"+(D.Type?D.Type:"Text")+(D.Multi?" "+TControl.Class+"EditMulti":"");
      if(!C.style.textAlign && D.Align) C.style.textAlign = D.Align;
      var s = Formats.ValueToString(Formats.StringToValue(M.Input.value,D.Type,D.IOFormat,D.Range),D.Type,D.DisplayFormat,D.Range);
      if(D.Multi) s = s.replace(/\%n/g,"<br/>");
      C.innerHTML = s;
      D.Input = M.Input;
      click += M.This+".Data=TGShowEdit("+M.This+".Data,this);";
      click += "TGControls.Focus("+M.This+");";
      D.OnTab = function (dir,ev){
         Controls.FocusNext(M,dir?1:0);
         CancelEvent(ev);
         return false;
         }
      }
   else if(cc=="focus") {
      var M = C.control; if(!M) M = Controls.Create(C);
      M.Type = "Focus";
      click += "TGControls.Focus("+M.This+");";
      }      
   }   
 
var hint = C.getAttribute('hint');
if(hint){
   if(hint==1) hint = "null";
   else hint = Replace(hint);
   move += "TGShowHint("+hint+",this,null,null,'"+TControl.Class+"Hint');";
   }
   
var tip = C.getAttribute('tip');
if(tip){
   if(tip==1) tip = "null";
   else tip = Replace(tip);
   move += "TGShowTip("+tip+",this,null,null,'"+TControl.Class+"Tip');";
   }

var popup = C.getAttribute('popup');
if(popup) {
   var rclick = "TGShowPopup("+Replace(popup)+");TGCancelEvent(ev?ev:event,2);";
   if(C.oldrclick==null) C.oldrclick = C.oncontextmenu?C.oncontextmenu:0;
   if(C.oldrclick) rclick += "return this.oldrclick(ev?ev:event);";         
   C.oncontextmenu = new Function("ev",rclick);
   }

var menu = C.getAttribute('menu');
if(menu) click += "TGShowPopup("+Replace(menu)+");TGCancelEvent(ev?ev:event,2);";

var drag = C.getAttribute('drag');
if(drag){
   var D = FromJSON(drag);
   var down = "TGAttachMouse("+Replace(drag)+",ev?ev:event,this);TGCancelEvent(ev?ev:event);";
   if(C.olddown==null) C.olddown = C.onmousedown?C.onmousedown:0;
   if(C.olddown) down += "return this.olddown(ev?ev:event);";
   C.onmousedown = new Function("ev",down);
   }

MS.MaxHeight;
var area = C.getAttribute('area');
if(area){
   SetArea(area,tag);
   }
ME.MaxHeight;
   
if(move){
   if(C.oldmove==null) C.oldmove = C.onmousemove?C.onmousemove:0;
   if(C.oldmove) move += "return this.oldmove(ev?ev:event);";   
   C.onmousemove = new Function("ev",move);
   }
if(click){
   if(C.oldclick==null) C.oldclick = C.onclick?C.onclick:0;
   if(C.oldclick) click += "return this.oldclick(ev?ev:event);";         
   C.onclick = new Function("ev",click);
   }      
}
var TGInitControl = InitControl; if(window["InitControl"]==null) window["InitControl"] = InitControl; 
// -----------------------------------------------------------------------------------------------------------
Controls.Focus = function(C){
var P = Controls.Focused;
if(P){
   P.Tag.className = P.OrigClass;
   P.Focused = 0;
   }
Controls.Focused = C;
if(C){
   C.OrigClass = C.Tag.className;
   C.Tag.className = C.OrigClass+" "+TControl.Class+"Focus";
   var A = ["input","textarea","select","button"], I = null;
   for(var i=0;!I && i<A.length;i++){ 
      var E = C.Tag.tagName.toLowerCase()==A[i] ? [C.Tag] : C.Tag.getElementsByTagName(A[i]);
      for(var j=0;j<E.length;i++) if(E[j].type!="hidden"){ I = E[j]; break; }
      }
   if(I){ try { I.focus(); C.Focused = 1; I.select(); } catch(e){ }}
   else try { C.Tag.focus(); } catch(e){ }
   }
}
// -----------------------------------------------------------------------------------------------------------
Controls.FocusNext = function(M,dir){
if(M){ for(var i=0;i<Controls.length;i++) if(Controls[i]==M){ i += dir ? -1 : 1; break; } }
else i = dir ? Controls.length-1 : 0;
if(!Controls[i] && !Controls.TabOut) i = dir ? Controls.length-1 : 0;
var ff = M && M.Focused;
Controls.Focus(Controls[i]);
var D = M ? M.Data : null;
var ed = D && (D.Edited || D.Expanded);
if(D && D.Expanded) M.Data.Close();
if(D && D.Edited) M.Data.Save();
if(M && Controls[i] &&(ed||ff)) Controls.StartControl(Controls[i]);
}
// -----------------------------------------------------------------------------------------------------------
Controls.StartControl = function(M){
MS.Edit; if(M.Type=="Edit") M.Data = ShowEdit(M.Data,M.Tag); ME.Edit;
MS.Menu; if(M.Type=="Enum") M.Data = ShowEnum(M.Data,M.Tag); ME.Menu;
}
// -----------------------------------------------------------------------------------------------------------
Controls.KeyDown = function(ev){
if(!ev) ev = window.event;
var key = ev.keyCode; if(!key) key = ev.charCode;
var M = Controls.Focused;
if(key==9){
   Controls.FocusNext(M,ev.shiftKey);
   if(Controls.Focused) CancelEvent(ev);
   }
else if(key==13 || key==113){
   if(M) Controls.StartControl(M);
   }   
}
// -----------------------------------------------------------------------------------------------------------
AttachEvent(window,"load",function(){
   if(BIEStrict) GetIEZoom();
   SetScrollConst();
   InitControls();
   });
// -----------------------------------------------------------------------------------------------------------
ME.Lib;

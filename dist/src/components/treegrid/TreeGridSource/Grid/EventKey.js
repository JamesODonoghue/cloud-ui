// -----------------------------------------------------------------------------------------------------------
// Key events
// -----------------------------------------------------------------------------------------------------------
MS.Key;
// -----------------------------------------------------------------------------------------------------------
// Global handler in document.onkeydown
// It is global because of Mozilla, which has not onkeydown events in tag that cannot have focus
function GlobalKeyDown(ev){
if(!ev) ev = window.event;
var key = ev.keyCode ? ev.keyCode : ev.charCode;
Grids.Keys[key] = true;
if(key == 45) Grids.InsKey = !Grids.InsKey;
var ret = true, F = Grids.Focused;
if(F){
   if((key==13 || key==27) && F.Message && F.Message.Close){ F.Message.Close(key==13?-1:-2); ret = false; }
   else if(!F.Disabled) ret = Grids.Focused.GridKeyDown(ev);
   }
if(!ret) CancelEvent(ev);

}
// -----------------------------------------------------------------------------------------------------------
// Global handler in document.onkeyup
function GlobalKeyUp(ev){
if(!ev) ev = window.event;
var key = ev.keyCode ? ev.keyCode : ev.charCode;
if(!key) Grids.Keys = []; 
else Grids.Keys[key] = null;
if(Grids.OnKeyUp){
   var F = Grids.Focused;
   if(F) Grids.OnKeyUp(F,key,ev,F.KeyCodes[key],F.GetKeyPrefix(ev));
   }

}
// -----------------------------------------------------------------------------------------------------------
// Global handler in document.onkeypress
// It is global because of Mozilla, which has not onkeydown events in tag that cannot have focus
function GlobalKeyPress(ev){
if(!ev) ev = window.event;
var ret = true;
var key = ev.keyCode ? ev.keyCode : ev.charCode;
if(Grids.CancelKey == key){
   Grids.CancelKey = 0;
   ret = false;
   }
var F = Grids.Focused; if(F && !F.Disabled) ret = F.GridKeyPress(ev);
if(!ret) CancelEvent(ev);

}
// -----------------------------------------------------------------------------------------------------------
// Fires on key down on grid
TGP.GridKeyDown = function(ev){
if(this.Disabled || BIPAD&&!this.EditMode) return true;
var key = ev.keyCode ? ev.keyCode : ev.charCode;
var prefix = this.GetKeyPrefix(ev);
if(Grids.OnKeyDown && Grids.OnKeyDown(this,key,ev,this.KeyCodes[key],prefix)) return true;

var fr = this.FRow, fc = this.FCol, target = "";
if(this.EditMode){ 
   MS.Lines;
   if(this.IsMultiline(this.FRow,this.FCol)){ 
      if(BIE && (key==38 || key==40)) Grids.NoClickTo = (new Date).getTime()+100; 
      if(key==13 && prefix.search(/Alt|Ctrl/)<0 && this.CanAcceptEnters(fr,fc) && this.CanEdit(fr,fc)==1) return true; 
      }
   ME.Lines;
   
   if(this.Edit && this.Edit.SuggestMenu && (key==38 || key==40)) return; 
   }

var ret = this.KeyCodes[key] ? this.RunKeyActions(this.KeyCodes[key],prefix) : false;
if(ret){
   
   CancelEvent(ev);
   Grids.CancelKey = key;
   this.HoldKey = key;
   
   }
else {
   if(BMozilla && !ev.ctrlKey && !ev.altKey && !ev.metaKey && (key<112||key>123)) this.RunKeyPress(key,ev,prefix); 
   Grids.CancelKey = 0;
   if(key==9 && this.EditMode) CancelEvent(ev); 
   }  
return !ret;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GridKeyPress = function(ev){
if(this.Disabled || BIPAD&&!this.EditMode) return true;
var key = ev.keyCode ? ev.keyCode : ev.charCode;
var prefix = this.GetKeyPrefix(ev);
if(BSafariMac&&!BChrome&&!BIPAD&&ev.metaKey) return true; 
if(Grids.OnKeyPress && Grids.OnKeyPress(this,key,ev,this.KeyCodes[key],prefix)) return true;
if(!BMozilla) this.RunKeyPress(key,ev,prefix);
if(BMozilla || BOpera) {
   
   if(this.HoldKey==key) this.HoldKey = -key;
   else if(this.HoldKey==-key) this.RunKeyActions(this.KeyCodes[key],prefix);
   else this.HoldKey = 0;
   }

return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.RunKeyPress = function(key,ev,prefix){
if(key>=32 && (BIEA || ev.charCode || ev.which)) {
   var em = this.EditMode, ret = this.RunKeyActions("Key",prefix);
   if(!ret && !em && this.EditMode){
      var I = this.FocusCursors.firstChild.firstChild.firstChild;
      
      if(Try){
         
         if(!I && this.FRow && this.FRow.Tag) I = this.GetCell(this.FRow,this.FCol).firstChild;
         if(I) {
            
            var F = I.onkeydown; if(F) F.apply(I,[ev]); 
            
            var F = I.onkeypress; if(F) F.apply(I,[ev]); 
            }
         } else if(Catch){ }
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
ME.Key;

// -----------------------------------------------------------------------------------------------------------
// Returns pressed key from event
function TGGetKey(event){
return event.keyCode ? event.keyCode : event.charCode;
}
if(window["GetKey"]==null) window["GetKey"] = TGGetKey;
// -----------------------------------------------------------------------------------------------------------
// Copies given object - deep copy

// -----------------------------------------------------------------------------------------------------------
// Compares strings according to type, returns -1 for s1<s2, 0 for s1==s2, 1 for s1>s2
// type &2 = compares according to localization, type&4 = case insensitive, type&8 = ignores white spaces

// -----------------------------------------------------------------------------------------------------------
// Compares strings and returns position of character where the strings differ

// -----------------------------------------------------------------------------------------------------------
// Looks for string s2 in string s1, return position of the first occurence or -1
// type &2 = compares according to localization, type&4 = case sensitive, type&8 = ignores white spaces

// -----------------------------------------------------------------------------------------------------------
function NoModule(mod,comp){
if(Grids["NoModule"+mod]) return;
Grids["NoModule"+mod] = 1;
alert("TreeGrid module \""+mod+"\" is not available !"+(comp?"\nIt is included only in "+comp+" component":""));
}
// -----------------------------------------------------------------------------------------------------------
if(!Array.prototype.shift){ 
   Array.prototype.shift = function(){
      var A = this[0];
      for(var i=0;i<this.length;i++) this[i] = this[i+1];
      this.length--;
      return A;
      }
   Array.prototype.unshift = function(){
      var len = arguments.length;
      for(var i=this.length-1;i>=0;i--) this[i+len] = this[i];
      for(var i=0;i<len;i++) this[i] = arguments[i];
      }
   }
if(!Function.prototype.apply){ 
   Function.prototype.apply = function(This,Arg){
      This.__TC = this;
      if(!Arg) return This.__TC();
      var l = Arg.length;
      if(!l) return This.__TC();
      if(l==1) return This.__TC(Arg[0]);
      if(l==2) return This.__TC(Arg[0],Arg[1]);
      if(l==3) return This.__TC(Arg[0],Arg[1],Arg[2]);
      }   
   }
if(!window.encodeURIComponent){ 
   window.encodeURIComponent = function(s){
      return escape(s).replace(/\@/g,"%40").replace(/\+/g,"%2B").replace(/\//g,"%2F").replace(new RegExp("%21","g"),"!").replace(new RegExp("%7E","g"),"~").replace(new RegExp("%27","g"),"'").replace(new RegExp("%28","g"),"(").replace(new RegExp("%29","g"),")")
      }
   }   
// -----------------------------------------------------------------------------------------------------------
MS.Api;   
// -----------------------------------------------------------------------------------------------------------
function TGSetEvent(name,id,func,ident){
TGDelEvent(name,id);
return TGAddEvent(name,id,func,ident);
}
// -----------------------------------------------------------------------------------------------------------
function TGAddEvent(name,id,func,ident){
if(!func||!name) return 0;
if(!Grids[name]) Grids[name] = new Function('G','var i,E,tmp,ret=null;'
   + 'E=TGGrids[G.id+"_Events"];if(E)E=E["'+name+'"];'
   + 'if(E&&E.length){for(i=0;i<E.length;i++){tmp=E[i].apply(window,arguments);if(ret==null)ret=tmp;}}'
   + 'else E=TGGrids["_EventsOther"];if(E)E=E["'+name+'"];if(E)for(i=0;i<E.length;i++){tmp=E[i].apply(window,arguments);if(ret==null)ret=tmp;}'
   + 'E=TGGrids["_EventsAll"];if(E)E=E["'+name+'"];if(E)for(i=0;i<E.length;i++){tmp=E[i].apply(window,arguments);if(ret==null)ret=tmp;}'
   + 'return ret;');
TGDelEvent(name,id,ident!=null?ident:func);
id = id ? id+"_Events" : (id==null?"_EventsAll":"_EventsOther");
var E = Grids[id]; if(!E) { E = {}; Grids[id] = E; }
var I = E[name]; if(!I){ I = []; E[name] = I; I.Ident = {}; }
var pos = I.length, ok = 1;
if(ident) {
   if(I.Ident[ident]!=null) { pos = I.Ident[ident]; ok = 2; }
   else I.Ident[ident] = pos;
   }
I[pos] = func;
return ok;
}
// -----------------------------------------------------------------------------------------------------------
function TGDelEvent(name,id,func){
id = id ? id+"_Events" : (id==null?"_EventsAll":"_EventsOther");
var E = Grids[id]; if(!E) return false;
if(!name) { delete Grids[id]; return true; }
var I = E[name]; if(!I) return false;
if(!func) { delete E[name]; return true; }
var ok = false;
if(typeof(func)!="object" && typeof(func)!="function"){
   if(I.Ident[func]!=null){ I.splice(I.Ident[func],1); delete I.Ident[func]; ok = true; }
   }
else for(var i=0;i<I.length;i++) if(I[i]==func) { 
   for(var n in I.Ident) if(I[I.Ident[n]]==i) { delete I.Ident[n]; break; }
   I.splice(i--,1); 
   ok = true;
   }
if(!I.length) delete E[name];
return ok;
}
// -----------------------------------------------------------------------------------------------------------
function TGGetEvent(name,id,ident){
id = id ? id+"_Events" : (id==null?"_EventsAll":"_EventsOther");
var E = Grids[id]; if(!E||!name||ident==null) return null;
var I = E[name]; if(!I||I.Ident[ident]==null) return null;
return I[I.Ident[ident]];
}
// -----------------------------------------------------------------------------------------------------------
if(window["SetEvent"]==null||TGDefNames["SetEvent"]) window["SetEvent"] = TGSetEvent;
if(window["AddEvent"]==null||TGDefNames["AddEvent"]) window["AddEvent"] = TGAddEvent;
if(window["DelEvent"]==null||TGDefNames["DelEvent"]) window["DelEvent"] = TGDelEvent;
// -----------------------------------------------------------------------------------------------------------
ME.Api;

// -----------------------------------------------------------------------------------------------------------
MS.Gantt$Print$Rotate;
function GetTextWidth(text,size,height){
if(!GetTextWidth.Tag) { GetTextWidth.Tag = {}; GetTextWidth.Temp = {}; }
if(height) size += "!";
var O = GetTextWidth.Tag[size], T = GetTextWidth.Temp[size];
if(!T){ T = {}; GetTextWidth.Temp[size] = T; }
if(!O){
   O = document.createElement("div");
   AppendTag(O,size);
   O.style.position = "absolute";
   O.style.visibility = "hidden";
   O.style.left = "10px";
   
   O.style.top = "-100px";
   O.style.whiteSpace = "nowrap";
   GetTextWidth.Tag[size] = O;
   }  
if(!T[text]) {
   O.innerHTML = text;
   
   var R = O.getBoundingClientRect();
   T[text] = height ? [Math.ceil(R.width),Math.ceil(R.height)] : Math.ceil(R.width);
   }
return T[text];
}
TGGetTextWidth = GetTextWidth;
ME.Gantt$Print$Rotate;
// -----------------------------------------------------------------------------------------------------------

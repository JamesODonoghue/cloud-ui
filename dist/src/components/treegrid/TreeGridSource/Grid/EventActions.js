// -----------------------------------------------------------------------------------------------------------
TGP.GetKeyPrefix = function(ev){
if(!ev) return "";
if(ev.touches) { this.Touched = typeof(ev.touches)=="object" ? ev.touches.length : ev.touches; return this.Touched; } 
if(ev.target) this.Touched = 0;
var shift = ev.shiftKey, alt = ev.altKey, ctrl = ev.ctrlKey, meta = ev.metaKey;
if(shift==null) shift = Grids.Keys[16];
if(ctrl==null) ctrl = Grids.Keys[17];
if(alt==null) alt = Grids.Keys[18];
var A = this.Actions,but = ["",A.LeftPrefix,A.MiddlePrefix,A.RightPrefix][ev.which!=null?ev.which:[0,1,3,1,2,1,3,1][ev.button&7]];
return (shift?A.ShiftPrefix:"") + (ctrl?A.CtrlPrefix:"") + (alt?A.AltPrefix:"") + (meta?A.MetaPrefix:"") + (but?but:""); 
}
// -----------------------------------------------------------------------------------------------------------
TGP.RunMouseActions = function(name,ev,prefix){
if(prefix==null) prefix = this.GetKeyPrefix(ev);
var len = CMouseEventLevels.length, E = this.Event;
this.MouseEvent = ev;

this.EventObject = { Type : 1 }; 
var ret = this.RunAction(name,"",prefix);  
if(ret) return ret && ret<100;
for(var i=0;i<len;i++) { 
   var n = CMouseEventLevels[i];
   E.Level = n;
   if(E[n]){
      var ret = this.RunAction(name,E[n],prefix);
      if(ret) {
         if(ret>=100&&ret<200) CancelEvent(ev,1); 
         return ret && ret<100;
         }
      }
   }
return 0;
}
// -----------------------------------------------------------------------------------------------------------
MS.Key;
TGP.RunKeyActions = function(name,prefix){
var row = this.FRow, col = this.FCol, ret;
this.EventObject = { Type : 2 }; 
if(this.Dialog) { ret = this.RunAction(name,this.Dialog.Type,prefix,row,col); return ret && ret<100; } 
if(!this.EditMode) { ret = this.RunAction(name,"",prefix,row,col); return ret && ret<100; } 
if(this.IsMultiline(this.FRow,this.FCol)){ var ret = this.RunAction(name,"EditMultiline",prefix,row,col); if(ret) return ret && ret<100; } 
ret = this.RunAction(name,"Edit",prefix,row,col);  
return ret && ret<100;
}
ME.Key;
// -----------------------------------------------------------------------------------------------------------
TGP.RunAction = function(name,target,prefix,row,col){
var E = this.Event;
E.Name = name;
E.Prefix = prefix;
E.Target = target;

var zar = this.ARow, zac = this.ACol, ret = 0;
this.ARow = E.Row; this.ACol = E.Col;
if(!row) row = E.Row; if(!col) col = E.Col;
var js = 0, cl = 0, gl = 0, P = prefix ? [prefix+name+target,name+target] : [name+target];
if(prefix-0) { for(var i=prefix-0,P=[];i;i--) P[P.length] = name+i+target; P[P.length] = name+target; }
   
for(var i=0;i<P.length;i++){ 
   var full = "On"+P[i], A = null;

   if(!js && Grids[full] && !CAPIEvents[full]){ 
      if(Try) {
         ret = Grids[full](this,row,col,E);
         if(ret) break;
         js = 1;
         }
      else if(Catch) { MS.Debug; this.Debug(1, "Global event handler '",(Grids[full]+"").replace(/[\n\r]/g," "),"' for event ",full," failed with exception: "+(e.message?e.message:e)); ME.Debug; }
      }
   
   if(!cl) {
      if(row && col){
         var cfull = col+full;
         A = row[cfull];
         if(A==null && row.Def) A = row.Def[cfull];
         }
      if(A==null && row){   
         A = row[full];
         if(A==null && row.Def) A = row.Def[full];
         }
      if(A==null && col){
         var C = this.Cols[col];
         if(C) A = C[full];
         }
      if(A){
         A = this.ConvertAction(A,full);
         if(A){
            if(Try) {
               
               ret = A(this,row,col,E);
               if(ret) break;
               cl = 1;
               }
            else if(Catch) { MS.Debug; this.Debug(1, "Cell action [",row.id,",",col,"] '",(A+"").replace(/[\n\r]/g," "),"' for event ",full," failed with exception: "+(e.message?e.message:e)); ME.Debug; }
            }
         }   
      }
   
   if(!gl){
      var A = this.Actions[full];
      if(A){
         A = this.ConvertAction(A,full);
         
         if(A){
            if(Try) { 
               
               var ret = A(this,row,col,E);
               
               if(ret) break;
               gl = 1;
               }
            else if(Catch) { MS.Debug; this.Debug(1, "Action '",(A+"").replace(/[\n\r]/g," "),"' for event ",full," failed with exception: "+(e.message?e.message:e)); ME.Debug; }
            }
         }   
      }
   }   
if(zar&&zar!=this.ARow){ 
   if(!zar.Visible) zar = null;
   else if(!zar.Fixed){
      for(var r=zar;r&&!r.Page;r=r.parentNode) if(!r.Visible) { zar = null; break; }
      }
   }
this.ARow = zar; this.ACol = zac;
return ret;
}
// -----------------------------------------------------------------------------------------------------------
var CJavaScriptRegExp = /\/\*(\*[^\/]|[^\*])*\*\/|\"(\\\\|\\\"|[^\"])*\"|\'(\\\\|\\\'|[^\'])*\'|[a-zA-Z_\$][a-zA-Z_\$0-9]*|[0-9][0-9a-fA-A]*|[^\'\"0-9a-zA-Z_\s]+/g;

var CJavaScriptWords = { "break":1,"case":1,"catch":1,"continue":1,"default":1,"delete":1,"do":1,"else":1,
   "false":1,"finally":1,"for":1,"function":1,"if":1,"in":1,"instanceof":1,"new":1,"null":1,"return":1,"switch":1,
   "this":1,"throw":1,"true":1,"try":1,"typeof":1,"var":1,"void":1,"while":1,"width":1,
   "arguments":1,"Array":1,"Boolean":1,"Date":1,"decodeURI":1,"decodeURIComponent":1,"encodeURI":1,"encodeURIComponent":1,
   "Error":1,"escape":1,"Function":1,"Infinity":1,"isFinite":1,"isNaN":1,"Math":1,"NaN":1,"Number":1,"Object":1,
   "parseFloat":1,"parseInt":1,"RegExp":1,"String":1,"undefined":1,"unescape":1,"Event":1,
   "Grid":1,"Row":1,"Col":1
   };
// -----------------------------------------------------------------------------------------------------------
TGP.ConvertAction = function(value,name){
if(typeof(value)=="function") return value;   
var v = this.ActionFormulas[value]; if(v) return v; 
v = (value+"").match(CJavaScriptRegExp); if(!v) return null; 
var ret = false;
for(var j=0;j<v.length;j++){
   if(v[j].search(/^\'|\"|\/\*/)==0) continue; 
   if(v[j].indexOf(';')>=0) ret = true; 
   if(v[j].search(/^[a-zA-Z_\$]/)==0){ 
      if(v[j]=="var" || v[j]=="else") { v[j] += " "; continue; }   
      if(v[j]=="return"){ v[j] += " "; ret = true;  continue; }    
      if(v[j]=="in") { v[j] = " in "; continue; }   
      if(v[j]=="this") { v[j] = "Grid"; continue; } 
      if(v[j]=="Value") { v[j] = "TGGet(Row,Col)"; continue; } 
      if(!ret && (v[j]=="if"||v[j]=="for"||v[j]=="try"||v[j]=="with")){ ret = true; continue; }
      var val = v[j].toUpperCase();
      if(val=="AND") v[j] = "&&";
      else if(val=="OR") v[j] = "||";
      
      else if(!CJavaScriptWords[v[j]] && (!j || v[j-1].search(/\.$/)<0)){ 
         var f = v[j];

         // --- Standard action ----
         var ex = this["Action"+f];
         if(ex || Grids[f] && typeof(Grids[f])=="function"){
            if(!v[j+1] || v[j+1].indexOf('(')!=0) f += ex ? "()" : "(Grid)"; 
            v[j] = ex ? "Grid.Action"+f : "TGGrids."+f; 
            continue;
            }
            
         // --- Focus action, ends by F ---
         var M = f.match(/([FSARCWO]){1,5}$/g);
         if(M) {
            var SS = {"F":1,"S":2,"A":4,"R":8,"C":16,"W":32,"O":64};
            M = M[0]; for(var i=0,a=0;i<M.length;i++) a += SS[M[i]];
            var ff = f.slice(0,-M.length), ex = this["Action"+ff];
            if(ex || Grids[ff] && typeof(Grids[ff])=="function") {
               if(!v[j+1] || v[j+1].indexOf('(')!=0) ff += ex ? "("+a+")" : "(Grid)"; else v[j+1] = (ex?"("+a+",":"(Grid,"+a+",")+v[j+1].slice(1);
               v[j] = ex ? "Grid.Action"+ff : "TGGrids."+ff; 
               continue;
               }
            }

         // --- Unknown action ---
         if(window[f]==null && (v[j+1] ? v[j+1].search(/\s*\(/)==0 : !ret)){         
            MS.Debug; this.Debug(1,"Unknown property '",f,"' in event action ",name," = ",value); ME.Debug; 
            v[j] = "Grid.ActionUnknown"; 
            }
         }
      }
   }
v = v.join("");
try { v = new Function("Grid,Row,Col,Event",(ret?"":"return ") + (this.NoActionEscape?v:v.replace(/\\/g,"\\\\"))); }
catch(e) { MS.Debug; this.Debug(1,"Wrong syntax in event action ",name," = '",value,"', exception message: ",e.message?e.message:e); ME.Debug; v = new Function("return false;"); } 
this.ActionFormulas[value] = v;
return v;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionUnknown = function(){ return false; }
// -----------------------------------------------------------------------------------------------------------
MS.Api;
TGP.ChangeAction = function(name,value){
if(!value){ this.Actions[name] = null; return; }

this.Actions[name] = value;
}
ME.Api;
// -----------------------------------------------------------------------------------------------------------
TGP.DoAction = function(row,col,act){
if(act){
   act = this.ConvertAction(act,"DoAction");
   if(Try) { return act(this,row,col,this.Event); }
   else if(Catch) { MS.Debug; this.Debug(1, "Action '",(act+"").replace(/[\n\r]/g," "),"' for called by DoAction() failed with exception: "+(e.message?e.message:e)); ME.Debug; }
   }

act = Get(row,col+"Action");
if(!act) return false;
if(typeof(act)!="function") act = this.GetFormula(act,row.Cells,1); 
var P = new TCalc();   P.Row = row; P.Col = col; P.Grid = this; 
if(row) P["Value"] = row[col];
act(P);
return true;
}
// -----------------------------------------------------------------------------------------------------------

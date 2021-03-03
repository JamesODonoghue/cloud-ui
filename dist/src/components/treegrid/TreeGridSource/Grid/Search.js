// -----------------------------------------------------------------------------------------------------------
// Functions for search
// -----------------------------------------------------------------------------------------------------------
MS.Search;
// -----------------------------------------------------------------------------------------------------------
// Calls DoSearch asynchronous
TGP.SearchRows = function(action,noshow,nosync){
if(this.InSearchRows) return;
this.InSearchRows = 1;
if(this.EditMode && this.EndEdit(1)==-1){ this.InSearchRows = 0; return; }
if(this.Paging==3 && !(this.OnePage&4) && !this.CanReload()) { this.InSearchRows = 0; return; }
var T = this;
function search(){ 
   T.DoSearch(action,noshow);
   T.HideMessage();
   MS.Sync;
   if(T.Sync["search"] && !nosync){
      for(var i=0;i<Grids.length;i++){
         var G = Grids[i];
         if(G&&G!=T&&!G.Loading&&G.SyncId==T.SyncId&&G.Sync["search"]) {
            for(var r=T.XS.firstChild,i1=0;r;r=r.nextSibling){
               if(r.Kind=="Search"){
                  var rr = G.GetRowById(r.id);
                  if(!rr && !r.id) for(var i2=0,rr=G.XS.firstChild;rr;rr=r.nextSibling) if(rr.Kind=="Search") if(i2++==i1) break;
                  if(rr){
                     for(var j=0;j<r.Cells.length;j++){
                        var c = r.Cells[j];
                        if(rr[c]!=r[c]) { rr[c] = r[c]; G.RefreshCell(rr,c); }
                        }
                     }
                  
                  i1++;
                  }
               }
            G.SearchExpression = T.SearchExpression;
            G.SearchMethod = T.SearchMethod;
            G.SearchCells = T.SearchCells;
            G.SearchCaseSensitive = T.SearchCaseSensitive;
            G.SearchDefs = T.SearchDefs;
            G.SearchCols = T.SearchCols;
            G.SearchRows(action,noshow,1);
            }
         }
      }
   ME.Sync;
     }
if(this.RowCount<this.SynchroCount || action=="Find" || action=="FindPrev") search();  
else {
   this.ShowMessage(this.GetText("Search"));
   setTimeout(search,10);
     }
this.InSearchRows = 0;     
}
// -----------------------------------------------------------------------------------------------------------
TGP.SearchIn = function(r,A,Z,c,sn,i){
var tn = 0; if(sn) { tn = this.GetType(r,c); tn = tn=="Int" || tn=="Float"; }
var v = Get(r,c+"FilterValue");
if(v==null) v = tn ? this.GetValue(r,c) : this.GetString(r,c,2);
if(Grids.OnGetFilterValue) { var tmp = Grids.OnGetFilterValue(this,r,c,v); if(tmp!=null) v = tmp; }
if(tn) { 
   Z[i] = A[i]-0==v;
   if(!Z[i]){
      if(sn==3) {
         if(A[i]>=0) v = Math.abs(v);
         if(!(A[i]%1)) v = Math.floor(v);
         Z[i] = A[i]-0==v;
         }
      else if(sn==2 && !(A[i]%1)) Z[i] = A[i]-0==Math.round(v);
      }
   }
else if(!v) Z[i] = A[i]=="#";
else { 
   v += "";
   if(!this.SearchCaseSensitive) v = v.toLocaleLowerCase ? v.toLocaleLowerCase() : v.toLowerCase();
   if(this.SearchWhiteChars) v = v.replace(GetWhiteChars(this.SearchWhiteChars),"");
   MS.CharCodes; if(this.SearchCharCodes) v = UseCharCodes(v,this.SearchCharCodes); ME.CharCodes;
   Z[i] = A[i]?v.indexOf(A[i])>=0:0;
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetSearchValue = function(str,row,col,txt){
var v = row[col+"FilterValue"]; if(v==null && row.Def) v = row.Def[col+"FilterValue"];
if(v==null) {
   if(txt) v = this.GetString(row,col,2);
   else { v = row[col]; if(v==null && row.Def) v = row.Def[col]; }
   }
if(Grids.OnGetFilterValue) { var tmp = Grids.OnGetFilterValue(this,row,col,v); if(tmp!=null) v = tmp; }
if(v-0||v=="0"||!v){
   if(str) return v+"";
   return v||v=="0"?v-0:"";
   }
if(!this.SearchCaseSensitive) v = v.toLocaleLowerCase ? v.toLocaleLowerCase() : v.toLowerCase();
if(this.SearchWhiteChars) v = v.replace(GetWhiteChars(this.SearchWhiteChars),"");
MS.CharCodes; if(this.SearchCharCodes) v = UseCharCodes(v,this.SearchCharCodes); ME.CharCodes;
return v;
}
// -----------------------------------------------------------------------------------------------------------
TGP.BuildSearch = function(V,back){
var spec = !this.SearchCaseSensitive || this.SearchWhiteChars || this.SearchCharCodes;
var cel = this.SearchCells; 
var hid = this.SearchHidden;

// --- Autodetect method ---
var Method = this.SearchMethod;
if(!Method){ 
   if(V.search(/[\(\)\=\!\<\>]/)>=0) Method = 2;
   }

// --- SearchDefs ---
var DS = "";
var Defs = this.SearchDefs;
if(Defs){
   Defs = Defs.split(/[,;]/);
   for(var i=0;i<Defs.length;i++) {
      if(!this.Def[Defs[i]]) { MS.Debug;this.Debug(2,"Unknown default ",Defs[i]," in SearchDefs");ME.Debug; continue; }
      DS+=(DS?":1,":"")+Defs[i];
      }
   if(DS) DS = "if(!{"+DS+":1}[Row.Def.Name]) return -1;";
   }

if(!Method || Method==2 || Method==4){
   function IsText(c){
      return c>=48 && c<=57 
         || c>=65 && c<=90  
         || c>=97 && c<=122 
         || c==46 || c==44  
         || c==95             
         || c==34 || c==39  
         || c==35 || c==36 || c==64  
         || c>=128
      }
   var A = [], B = [], C = []; 
   for(var p=0,i=0,t=-1;V;i++){
      var c = V.charCodeAt(i);
      if(!c){
         if(V && V.charCodeAt(0)>32) A[p++] = V;
         break;
         }
      if(c<=32 && !i) { V=V.slice(1); i=-1; continue; }
      var x = IsText(c);
      if(!i){
         if(c==34 || c==39){ 
            for(i++;;i++){
               var d = V.charCodeAt(i);
               if(!d) break;
               if(d==c){ 
                  if(V.charCodeAt(i+1)==c) V = V.slice(0,i) + V.slice(i+1); 
                  else break;
                  }
               }
            }
         t=x;
         }
      else if(t && !x || !t && x || c<=32){ 
         A[p++] = V.slice(0,i);
         V = V.slice(i);
         i=-1;
         }
      }
      
   function Replace(N,by,by2,nclr){ 
      N = (N+"").split(",");
      for(var i=0;i<N.length;i++){
         var lwr = N[i].toLowerCase();
         for(var j=0;j<A.length;j++){
            var s = A[j].toLowerCase();
            if(lwr==s && B[j]==null && (!A[j+1]||A[j+1].charAt(0)!='(')){
               B[j] = by;
               C[j] = by2;
               
               }
            if(lwr.indexOf(s)==0){ 
               for(var x=j+1;s.length<lwr.length&&A[x];x++) s+=' '+A[x].toLowerCase();
               if(lwr==s && B[j]!="" && (B[j]==null || x-j>1)){
                  B[j] = by; 
                  if(by2) A[j]=by2;
                  while(x>j+1){ 
                     B[--x]="";
                     if(!nclr) C[x]="";
                     }
                  
                  }
               }
            }
         }
      }
      
   for(var c in this.Cols) Replace(this.GetCaption(c,1),this.This+".GetSearchValue(0,Row,'"+c+"',"+(this.Cols[c].SearchText?1:0)+")",null,1);
   
   Replace(this.GetText("Starts"),"|*");
   Replace(this.GetText("Ends"),"*|");
   Replace(this.GetText("Contains"),"*|*");
   
   if(!Method){ 
      for(var i=0,a=0;i<B.length;i++) if(B[i]) a++;
      if(a>=2) Method = 2;
      else Method = 1;
      }

   if(Method==2 || Method==4){   
      var GN = {"parseInt":1,"parseFloat":1,"escape":1,"unescape":1,"isFinite":1,"isNaN":1,"Date":1,"TGGet":1,"TGIs":1};
      Replace(this.GetText("And"),"&&");
      Replace(this.GetText("Or"),"||");
      Replace(this.GetText("Not"),"!");
      Replace("<>","!=");
   
      for(var i=0;i<A.length;i++){
         var s = A[i], c = s.charCodeAt(0);
         if(c==34 || c==39){ 
            if(spec){ 
               function Test(idx){ 
                  var a = B[idx]?B[idx]:A[idx];
                  return a=="=="||a=="!="||a==">"||a==">="||a=="<"||a=="<="||a=="|*"||a=="*|"||a=="*|*";
                  }
               if(Test(i-1) || Test(i+1)) {
                  if(!this.SearchCaseSensitive) A[i] = A[i].toLocaleLowerCase ? A[i].toLocaleLowerCase() : A[i].toLowerCase();
                  if(this.SearchWhiteChars) A[i] = A[i].replace(GetWhiteChars(this.SearchWhiteChars),"");
                  MS.CharCodes; if(this.SearchCharCodes) A[i] = UseCharCodes(A[i],this.SearchCharCodes); ME.CharCodes;
                  }
               }
            continue;               
            }
         if(B[i]!=null) continue; 
         var idx = s.indexOf('=');
         if(idx>=0){ 
            var c1 = idx ? s.charAt(idx-1) : null;
            if(c1=='=' || c1=='>' || c1=='<' || s.charAt(idx+1)=='=') continue; 
            B[i]=s.slice(0,idx)+"="+s.slice(idx);
            }
         else if(c>=48 && c<=57){ 
            if(s.indexOf(',')>=0) B[i] = s.replace(',','.'); 
            }
         else if(IsText(c)){ 
            var j = i; s = "";
            for(;i<A.length;i++){
               if(!IsText(A[i].charCodeAt(0)) || B[i]!=null) break;
               var v = A[i];
               if(spec && v){
                  if(!this.SearchCaseSensitive) v = v.toLocaleLowerCase ? v.toLocaleLowerCase() : v.toLowerCase();
                  if(this.SearchWhiteChars) v = v.replace(GetWhiteChars(this.SearchWhiteChars),"");
                  MS.CharCodes; if(this.SearchCharCodes) v = UseCharCodes(v,this.SearchCharCodes); ME.CharCodes;
                  }
               s += ' '+v;
               }
            s = s.slice(1); 
            if(A[i] && A[i].charCodeAt(0)==40) {  
               if(Method==2 && A[j].search(/Math\.|Date\./)!=0 && !GN[A[j]]) for(;j<i;j++) A[j] = "";
               continue;
               }
            if(Method==4);
            else if(s.indexOf('"')<0) s = '"'+s+'"';
            else if(s.indexOf("'")<0) s = "'"+s+"'";
            else s = '"'+s.replace('"','""')+'"';
            B[j] = s;
            C[j] = s;
            for(j++;j<i;j++) { B[j]=""; C[j]=""; }
            i--;
            }
         }
      
      MS.Date;
      for(var i=0;i<A.length;i++){
         if(A[i].search(/^\'?\"?\d{1,2}[\/\-\:\.]\d{1,2}([\/\-\:\.]\d{1,4})?(..?\d{1,2}[\:\-]\d{1,2}([\-\:]\d{1,2})?)?\'?\"?$/)>=0 && A[i].search(/^\d*.\d*$/)<0){
            var s = A[i];
            if(s.charAt(0)=='"' || s.charAt(0)=="'") s=s.slice(1,s.length-1);
            B[i] = this.Lang.Format.StringToDate(s,this.SearchDateFormat);
            var c = s.charAt(0);
            if(c!='"' && c!="'") s='"'+s+'"';
            C[i] = s;
            }
         if(A[i]=='/' || A[i]=='-' || A[i]==':'){
            if(!i || B[i-1]!=null || B[i+1]!=null || isNaN(A[i-1]-0) || isNaN(A[i+1]-0)) continue; 
            var j = A[i+2]==A[i] && !isNaN(A[i+3]) && B[i+3]==null ? i+4 : i+2, j2=null;
            if(A[j+1]==':' && B[j]==null && B[j+2]==null && !isNaN(A[j]-0) && !isNaN(A[j+2]-0)) { 
               j2=j;
               j = A[j+3]==':' && !isNaN(A[j+4]) && B[j+4]==null ? j+5 : j+3;
               }
            for(var k=i,SS="";k<j;k++){ 
               if(k==j2) SS+=' ';
               SS+=A[k]; B[k]=""; C[k]=""
               }
            
            B[i-1] = this.Lang.Format.StringToDate(A[i-1]+SS,this.SearchDateFormat);
            
            C[i-1] = '"'+A[i-1]+SS+'"';
            if(A[i]==':'){ 
               if(i>1 && B[i-2]-0){
                  var c = A[i-2].charAt(0);
                  if(c!='"' && c!="'"){ 
                     B[i-2] = this.Lang.Format.StringToDate(A[i-2]+" "+A[i-1]+SS,this.SearchDateFormat);
                     B[i-1] = "";
                     C[i-2] = '"'+A[i-2]+" "+A[i-1]+SS+'"';
                     C[i-1] = "";
                     }
                  }
               }
            
            }
         }
      ME.Date;
         
      for(var i=0;i<A.length;i++){ 
         var cp = null;
         switch(B[i]){
            case '|*' : 
               B[i]='.indexOf(';
               cp = "==0";
               if(i && B[i-1] && B[i-1]=='!'){ B[i-1]=""; cp = "!=0";   }
               if(B[i+1]) B[i+1] += ")"+cp;
               else B[i+1] = A[i+1] + ")"+cp;
               break;
            case '*|' : 
               B[i]='.lastIndexOf(';
               cp = "==";
               if(i && B[i-1] && B[i-1]=='!'){ B[i-1]=""; cp = "!=";   }
               var v1 = B[i-1]?B[i-1]:A[i-1], v2 = B[i+1]?B[i+1]:A[i+1];
               B[i+1] = v2+")"+cp+"("+v1+".length-("+v2+"+'').length)";
               break;
            case '*|*' : 
               B[i]='.indexOf(';
               cp = ">=0";
               if(i && B[i-1] && B[i-1]=='!'){ B[i-1]=""; cp = "<0";   }
               if(B[i+1]) B[i+1] += ")"+cp;
               else B[i+1] = A[i+1] + ")"+cp;
               break;
            }
         if(cp && B[i-1]) B[i-1] = (B[i-1]+"").replace("GetSearchValue(0","GetSearchValue(1");
         }
      
      var S = "", NS = "";
      for(var i=0;i<A.length;i++){
         S += (i&&Method!=4?" ":"")+(B[i]!=null ? B[i] : A[i]);
         NS += (i&&C[i]!=""&&Method!=4?" ":"")+(C[i]!=null ? C[i] : A[i]);    
         }
      this.SearchExpression = NS;
      if(Grids.OnRowSearch) S = DS+"var found="+S+",tmp=TGGrids.OnRowSearch("+this.This+",Row,null,found,arguments.callee,UserVal);return tmp!=null?tmp:found;";
      else S = DS+"return "+S+";";
      }
   }
   
// --- Google search ---
if(Method==1 || Method==3){
   var num = this.SearchNumbers; if(num==null) num = Method==1 ? 1 : 0;
   V = this.SearchExpression; 
   
   // --- Google search ---
   if(Method==1){
      var S = '([^\\"\\s]*)?\\s*(\"([^\\"]*)\")?\\s*'; 
      for(var i=0;i<4;i++) S+=S;
      S = "^\\s*"+S+"$";
      var X = "", P = [], A = [], p = 0;
      if(V){
         if(!(V.split('"').length%2)) return null; 
            V = V.match(S);
            if(!V) return null; 
         var Neg = []; 
         for(var i=1;i<V.length;i++) if(V[i]) { if(V[i].charAt(0)=='"') Neg[p] = 1; else P[p++] = V[i]; } 
         for(var i=0,x=0;i<p;i++){ 
               if(P[i]=="OR") continue;
            if(i) X += P[i-1]=="OR" ? "||" : "&&";
            if(P[i+1]=="OR" && (!i || P[i-1]!="OR")) X+="(";
            if(P[i].charAt(0)=='-' && !Neg[i]){ X+="!"; P[i]=P[i].slice(1); }
            X+="Z["+x+"]";
            A[x++] = P[i];
            if(i && P[i+1]!="OR" && P[i-1]=="OR") X+=")";
            
            }
         }
      }

   // --- Exact Search ---      
   else {
      var A = [V], X = "Z[0]";
      }   
      
   // --- SearchCols ---
   var SC = this.SearchCols, Cols = [];
   if(SC){
      SC = SC.split(/[,;]/);
      for(var i=0;i<SC.length;i++) { var C = this.Cols[SC[i]]; if(C && C.CanSearch && (C.Visible||hid)) Cols[Cols.length] = '\"'+SC[i]+'\"'; }
      }
   else for(var c in this.Cols){ var C = this.Cols[c]; if(C && C.CanSearch && (C.Visible||hid)) Cols[Cols.length] = '\"'+c+'\"'; }
   
   var S = DS;
   S+="var Z=[];";
   S+="var A=[";
   for(var i=0;i<A.length;i++) {
      var v = A[i];
      if(!this.SearchCaseSensitive) v = v.toLocaleLowerCase ? v.toLocaleLowerCase() : v.toLowerCase();
      if(this.SearchWhiteChars) v = v.replace(GetWhiteChars(this.SearchWhiteChars),"");
      MS.CharCodes; if(this.SearchCharCodes) v = UseCharCodes(v,this.SearchCharCodes); ME.CharCodes;
      S += (i?",":"")+"\""+v.replace(/[\"\\]/g,"\\$&")+"\"";
      }
   S+="];";

   // --- Search in cell ---
   if(cel){
      S+="var Cols=["+Cols.join(",")+"],i="+(back?"Cols.length-1":"0")+";";
      S+="if(Col){";
      S+=(back?"for(;i>=0;i--)":"for(;i<Cols.length;i++)")+"if(Cols[i]==Col) { i"+(back?"--":"++")+"; break; }";
      S+="}";
      S+=(back?"for(;i>=0;i--)":"for(;i<Cols.length;i++)")+"{";
      S+="for(var k=0;k<A.length;k++) "+this.This+".SearchIn(Row,A,Z,Cols[i],"+num+",k);";
      S+="var found="+X+";";
      if(Grids.OnRowSearch) S+="var tmp=TGGrids.OnRowSearch("+this.This+",Row,Cols[i],found,arguments.callee,UserVal);if(tmp!=null)found=tmp;";
      S+="if(found==-1) return -1;";
      S+="if(found==1) return Cols[i];"; 
      S+="if(found) return found;";      
      S+="} return 0;";
      }
   // --- Search in row ---
   else {
      S+="var Cols=["+Cols.join(",")+"];";
      S+="for(var k=0;k<A.length;k++){";
      S+="for(var j=0;j<Cols.length;j++){"
      S+=this.This+".SearchIn(Row,A,Z,Cols[j],"+num+",k);";
      S+="if(Z[k]) break;}}";
      if(Grids.OnRowSearch) S += "var found="+X+",tmp=TGGrids.OnRowSearch("+this.This+",Row,null,found,arguments.callee,UserVal);return tmp!=null?tmp:found;";
      else S += "return "+X+";";
      }
   }

if(Try) {
   var F = new Function("Row","Col","UserVal",S); 
   return [F,Method];
   }
else if(Catch){
   return null;
   }
}

// -----------------------------------------------------------------------------------------------------------
// Searches in grid according to parameters Search...
TGP.DoSearch = function(action,noshow,noundo){
if(!this.Searching || this.Locked["search"]) return;
if(action=="Last") action = this.SearchActionLast;
if(Grids.OnSearch && Grids.OnSearch(this,action,!noshow)) return;
if(action=="Help"){
   this.Alert("SearchHelp");
   return;
   }
if(this.Undo&16&&!noundo&&action!="Find"&&action!="FindPrev") this.AddUndo({Type:"Search",OAction:this.SearchAction,Action:action});

if(action=="Refresh"){
   var old = this.SearchAction;
   if(old) {
      this.DoSearch("Clear",old=="Filter"?noshow:1); 
      this.DoSearch(old,noshow);
      }
   else this.SaveCfg();
   return;
   }

var V = this.SearchExpression; if(!V && V!==0) V = ""; else V += ""; this.SearchExpression = V;
if(this.SearchColorNew && V!=this.SearchExpressionOld){ this.SearchColorIdx++; this.SearchColorNew = 0; }
this.SearchExpressionOld = V;

var oldaction = this.SearchAction;
if(!V && action!="Clear") { this.SearchActionLast = action; action = "Clear"; }
if(this.SearchAction!=action){
   this.ClearSearch(noshow);
   if((this.Undo&18)==18&&!noundo&&this.SearchAction=="Select") this.MergeUndo();
   this.SearchAction = action;
   
   }
if(action=="Clear"){
   this.SearchAction="";
   
   this.CalculateSpaces(!noshow);
   this.SaveCfg();
   return;
   }
this.SearchActionLast = this.SearchAction;

// --- server paging ---
MS.Paging;
if(this.Paging==3 && (!(this.OnePage&4) || this.AllPages)){
   this.Calculate(!noshow,1,1);
   this.SaveCfg();
   this.ReloadBody(null,0,"Search");
   if(Grids.OnSearchFinish) Grids.OnSearchFinish(this,action,!noshow);
   return 1;
   }
ME.Paging;

MS.Debug; this.Debug(4,"Searching in grid, action "+action); this.StartTimer("Search"); ME.Debug;

// --- Build search ---
var cel = this.SearchCells, exp = this.SearchExpand, foc = this.SearchFocused; 
var F = this.BuildSearch(V,action&&action.indexOf("FindPrev")>=0);
if(!F){
   this.Alert("SearchError");
   this.SearchAction = "";
   return;
   }
var Method = F[1]; F = F[0];

// --- Run Action ---
var cnt = null; this.SearchCount = null;
if(this.Searched && action) {
   action = action.split(/[,;]/);
   for(var i=0;i<action.length;i++){
      switch(action[i]){
         case "Filter" : 
            MS.Filter;
            if(this.SearchCount==null) this.SearchCount = "";
            this.Filter2 = F; 
            var F1 = null; if(!this.Filtered) { F1 = this.Filter1; this.Filter1 = null; this.Filtered = 1; }
            this.DoFilterT(noshow ? 0 : (BIE8Strict&&this.RowSpan || this.Paging ? 2 : 1));
            if(F1){ this.Filter1 = F1; this.Filtered = 0; }
            cnt = this.FilterCount;
            ME.Filter;
            break;
         case "Select" :
            MS.Select;
            MS.Animate; var S = this.AnimateRows && !this.SuppressAnimations ? [] : null, N = S ? [] : null; ME.Animate;
            var zal = this.CalculateSelected; this.CalculateSelected = null; cnt = 0;
            var cs = this.ClearSelected, typ = cs&8?1:0, flt = cs&2, hid = cs&4; 
            for(var r=this.GetFirst(typ);r;r=this.GetNext(r,typ)){
               if(flt&&r.Filtered||hid&&!r.Visible&&!r.Filtered&&!r.Deleted||!this.CanSelect(r)) continue;
               try { var found = F(r); } catch(e) { found = 0; }
               MS.RowSpan; if(r.RowSpan && typeof(found)=="string" && r[found+"RowSpan"]==0) found = 0; ME.RowSpan;
               found  = typeof(found)=="string" || found>0;
               if(found) cnt++;
               var sel = r.Selected&this.SelAnd;
               if(sel && !found) {
                  this.SelectRow(r); 
                  MS.Animate; if(N) N[N.length] = r; ME.Animate;
                  }
               else if(!sel && found){
                  this.SelectRow(r);
                  if(exp) this.ExpandParents(r);
                  MS.Animate; if(S) S[S.length] = r; ME.Animate;
                  }
               }
            this.SearchCount = cnt;
            this.CalculateSpaces(!noshow);
            this.CalculateSelected = zal;
            if((this.Undo&18)==18&&!noundo) this.MergeUndo();
            MS.Animate; if(S) this.AnimRows([S,"SelectRows"],[N,"DeselectRows"]); ME.Animate;
            MX.Select;
            if(!this.SelectRow) NoModule("Select");
            ME.Select;
            break;
         case "Mark" :
            MS.Color;
            this.SearchColorNew = 1; this.SearchActionMark = 1; cnt = 0;
            if(!this.SearchColorIdx) this.SearchColorIdx = 1;
            var clear = this.SearchColorIdx > this.SearchMaxMark;
            if(clear) this.SearchColorIdx = 1;
            
            var Color = this.Colors["Found"+this.SearchColorIdx];
            if(!Color){ Color = this.Colors["Found1"]; this.SearchColorIdx=1; }
            
            if(cel && (Method==1||Method==3)) for(var r=this.GetFirstVisible();r;r=this.GetNextVisible(r)){ 
               if(clear) this.ClearMarkRow(r);
               try { var found = F(r);} catch(e) { found = 0; }
               while(found && typeof(found)=="string"){
                  MS.RowSpan; if(r.RowSpan && r[found+"RowSpan"]==0){ found = F(r,found); continue; } ME.RowSpan;
                  cnt++;
                  var f = found;
                  MS.ColSpan; if(r.Spanned && r[f+"Span"]==0) f = this.GetPrevCol(f,r); ME.ColSpan;
                  r[f+"MarkColor"] = Color;
                  MS.Animate; if(r.Animating||r.AnimatingCels&&r.AnimatingCells[f]) this.AnimCell(r,f); ME.Animate;
                  if(this.SearchClass) { 
                     r[f+"MarkClass"] = "Found"+this.SearchColorIdx;
                     this.RefreshCellAnimate(r,f,"Mark");
                     }
                  else this.ColorCell(r,f);
                  if(exp) this.ExpandParents(r);
                  found = F(r,found);
                  r.Marked = 1;
                  }
               }
            else for(var r=this.GetFirstVisible();r;r=this.GetNextVisible(r)){
               if(clear) this.ClearMarkRow(r);
               try { var found = F(r)>0;} catch(e) { found = 0; }
               if(found){
                  cnt++;
                  r.MarkColor = Color;
                  r.MarkClass = "Found"+this.SearchColorIdx;
                  this.ColorRow(r);
                  if(exp) this.ExpandParents(r);
                  }
               }
            this.SearchCount = cnt;
            this.CalculateSpaces(1);
            ME.Color;   
            break;
         case "Find" :
         case "FindPrev":
            var start = this.FRow&&!this.FRow.Fixed&&(foc || oldaction&&oldaction.indexOf("Find")>=0) ? this.FRow: null, back = action[i]=="FindPrev", found = 0; 
            cnt = null;
            if(this.FRow && this.FRow.Space!=null) this.Focus();
            if(cel && (Method==1||Method==3) && start && this.FCol){ 
               var fcol = this.FCol;
               do {
                  try { var found = F(start,fcol);} catch(e) { found = 0; break; }
                  if(typeof(found)=="string"){ 
                     MS.ColSpan; if(start.Spanned && start[found+"Span"]==0) found = this.GetPrevCol(found,start); ME.ColSpan;
                     if(found==fcol){ found = 0; break; }
                     if(!this.CanFocus(start,found)){ fcol = found; continue; }
                     MS.Animate; if(start.Animating||start.AnimatingCels&&start.AnimatingCells[found]) this.AnimCell(start,found); ME.Animate;
                     this.Focus(start,found,null,null,1);
                     MS.Animate; this.AnimCell(start,found,"Find",null,null,null,1); ME.Animate;
                     break;
                     }
                  else if(found<0) found = 0;
                  } while(found);
               }
            if(found) break;
            var r = back ? (start?this.GetPrevVisible(start):this.GetLastVisible()) : (start?this.GetNextVisible(start):this.GetFirstVisible());
            for(;!found&&r!=start;r=back?this.GetPrevVisible(r):this.GetNextVisible(r)){
               if(!r){
                  if(start && foc>1){
                     if(foc==3 && !this.Confirm(this.GetAlert(back?"SearchEnd":"SearchStart"))) { found = 1; break; }
                     r = back ? this.GetLastVisible() : this.GetFirstVisible();
                     }
                  else break;
                  }
               var fcol = null;
               do {
                  try { var found = F(r,fcol);} catch(e) { found = 0; }
                  if(found){
                     if(typeof(found)=="string"){ 
                        MS.ColSpan; if(r.Spanned && r[found+"Span"]==0) found = this.GetPrevCol(found,r); ME.ColSpan;
                        if(found==fcol){ found = 0; break; }
                        if(!this.CanFocus(r,found)){ fcol = found; continue; }
                        MS.Animate; if(r.Animating||r.AnimatingCels&&r.AnimatingCells[found]) this.AnimCell(r,found); ME.Animate;
                        this.Focus(r,found,null,null,1);
                        MS.Animate; this.AnimCell(r,found,"Find",null,null,null,1); ME.Animate;
                        break;
                        }
                     else if(found>0){
                        if(!this.CanFocus(r,this.FCol)){ found = 0; break; }
                        this.Focus(r,this.FCol,null,null,1);
                        MS.Animate; this.AnimCell(r,this.FCol,"Find",null,null,null,1); ME.Animate;
                        break;
                        }
                     else found = 0;
                     }
                  } while(found);
               }
            if(!found && this.SearchNotFound) {
               if(this.SearchNotFound==1) this.Alert("NotFound");
               else this.ShowMessageTime(this.GetAlert("NotFound"),this.SearchNotFound>10||this.SearchNotFound<0?this.SearchNotFound:0);
               }
            this.CalculateSpaces(1);
            break;
         }
      }
   }
if(!this.Loading) this.SaveCfg();
if(this.SearchAlertFound && cnt!=null){
   var txt = this.GetAlert(cnt?"FoundResults":"NotFound").replace("%d",cnt);
   if(txt){
      if(this.SearchAlertFound==1) this.Alert(txt);
      else this.ShowMessageTime(txt,this.SearchAlertFound>10||this.SearchAlertFound<0?this.SearchAlertFound:0);
      }
   }
if(Grids.OnSearchFinish) Grids.OnSearchFinish(this,action,!noshow);
MS.Debug; 
this.StopTimer("Search"); 
if(!noshow) this.Debug(4,"Search completed in ",this.GetTimer("Search")," ms");
ME.Debug;
return 1;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ClearSearch = function(noshow){
MS.Debug; 
if(this.Searched && this.SearchAction && !noshow) { 
   this.Debug(4,"Clearing search action "+this.SearchAction);
   this.StartTimer("Search"); 
   }
ME.Debug;
this.SearchCount = null;
if(this.Searched && this.SearchAction) {
   var action = this.SearchAction.split(/[,;]/);
   for(var i=0;i<action.length;i++){
      switch(action[i]){
         case "Filter" :
              MS.Filter;
            this.Filter2 = null; 
            var F1 = null; if(!this.Filtered) { F1 = this.Filter1; this.Filter1 = null; this.Filtered = 1; }
            this.DoFilterT(noshow ? 0 : (BIE8Strict&&this.RowSpan || this.Paging ? 2 : 1));
            if(F1){ this.Filter1 = F1; this.Filtered = 0; }
            ME.Filter;
            break;
         case "Select" :
            MS.Select; 
            MS.Animate; var N = this.AnimateRows && !this.SuppressAnimations ? [] : null; ME.Animate;
            var and = this.SelAnd, zal = this.CalculateSelected; this.CalculateSelected = null;
            var cs = this.ClearSelected, typ = cs&8?1:0, flt = cs&2, hid = cs&4; 
            for(var r=this.GetFirst(typ);r;r=this.GetNext(r,typ)) if(r.Selected&and){
               if(flt&&r.Filtered||hid&&!r.Visible&&!r.Filtered&&!r.Deleted||!this.CanSelect(r)) continue;
               this.SelectRow(r);
               MS.Animate; if(N) N[N.length] = r; ME.Animate;
               }
            this.CalculateSelected = zal;
            MS.Animate; if(N) this.AnimRows(N,"DeselectRows"); ME.Animate;
            ME.Select;   
            break;
         case "Find" :
         case "FindPrev":
            if(action=="Clear") this.Focus(); 
            break;
         case "Mark" :
            MS.Color;
            for(var r=this.GetFirstVisible();r;r=this.GetNextVisible(r)) this.ClearMarkRow(r);
            this.SearchColorIdx = 0; this.SearchColorNew = 1;
            ME.Color;
            this.SearchActionMark = 0;
            break;
         }
      }
   }
MS.Debug; 
if(this.Searched && this.SearchAction && !noshow) { 
   this.StopTimer("Search"); 
   this.Debug(4,"Clearing search completed in ",this.GetTimer("Search")," ms");
   }
ME.Debug;   
}
// -----------------------------------------------------------------------------------------------------------
TGP.ClearMarkRow = function(r){
if(r.MarkColor){
   r.MarkColor = null;
   r.MarkClass = null;
   MS.Animate; if(r.Animating||r.AnimatingCells) this.AnimRow(r); ME.Animate;
   this.ColorRow(r);
   }
if(r.Marked){
   for(var c in this.Cols){
         if(r[c+"MarkColor"]){
         r[c+"MarkColor"] = null;
         if(this.SearchClass) { 
            r[c+"MarkClass"] = null;
            this.RefreshCellAnimate(r,c,"Mark");
            }
         else this.ColorCell(r,c);
         }
      }
   r.Marked = null;
   }
}

// -----------------------------------------------------------------------------------------------------------
TGP.ActionSearchOff = function(dummy,T,noundo){
if(!this.Searching || !this.Searched || this.Locked["search"]) return false;
if(T) return !!this.SearchAction;
if(this.Undo&16&&!noundo) this.AddUndo({Type:"Searched",OSearched:1,Searched:0});
this.ClearSearch();
this.Searched = false;
for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Kind=="Search") this.UpdatePanel(r);
this.CalculateSpaces(1);
this.SaveCfg();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSearchOn = function(dummy,T,noundo){
if(!this.Searching || this.Searched || this.Locked["search"]) return false;
if(T) return !!this.SearchAction;
if(this.Undo&16&&!noundo) this.AddUndo({Type:"Searched",OSearched:0,Searched:1});
this.Searched = true;
if(this.SearchAction) this.DoSearch(this.SearchAction,0,1);
for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Kind=="Search") this.UpdatePanel(r);
this.CalculateSpaces(1);
this.SaveCfg();
return true;
}
// -----------------------------------------------------------------------------------------------------------
ME.Search;


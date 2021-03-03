// -----------------------------------------------------------------------------------------------------------
// Parsing input XML
// -----------------------------------------------------------------------------------------------------------
var CNodeAttrsRegExp = /[^\s\"\'\=\>\<\/]+|\'[^\']*\'|\"[^\"]*\"|\/?\>[\s\S]*/g; 
var CNodeTextRegExp = /[^\s\/\>]/; 

// -----------------------------------------------------------------------------------------------------------
// Support function for AddDataFromXml
// Creates attributes and rows from node text, recursion
MS.ShortFormat;
TGP.UpdateNodeText = function(To, t, A){
var dblsep = 0,i,j,p;
for(p=0;t.charCodeAt(p)<=32;p++); 
if(t.length==p || A&&!A.InBody) return; 
if(A) while(A[A.Pos].charAt(0)!='I' && A[A.Pos].charAt(1)!='I' && A[A.Pos].charAt(0)!='B' && A[A.Pos].charAt(1)!='B') {
   t += "<"+A[A.Pos++]; 
   }
t = ReplaceEntities(t);
if(t.charAt(p)!=t.charAt(p+1) && !Grids.NameChars[t.charCodeAt(p+1)]){
   dblsep = t.charAt(p);
   p++;
   }
A = t.split(t.charAt(p)); var al = A.length;
var P = this.Par[A[1]], p = 2;
if(P)   for(i=0;i<P.length;i++){ 
   var av = A[p++]; 
   To[P[i]] = (av-0)+""==av ? av-0 : av;
   }
if(al>p){ 
   P = this.Par[A[p++]];
   
   var cnt = A[p++]-0, pl = P?P.length:0,r;
   for(j=0;j<p;j++) A[j]=null; 
   
   if(!Dom.DataDocument){
      MS.FFOnly; MX.FFOnly;
      if(!pl){
         A = [];
         for(j=0;j<cnt;j++) A[p++] = "<BR>";
         }
      else if(dblsep){
         for(var al = A.length;p<al;p++){
            var B = A[p].split(dblsep), bl = B.length, b=1;
            while(b<bl){
               B[b] = "<BR "+P[0]+"=\""+B[b]+"\""; b++;
               for(i=1;i<pl;i++){ B[b] = " "+P[i]+"=\""+(B[b]+"").replace(/\&/g,"&amp;").replace(/\</g,"&lt;").replace(/\"/g,"&quot;")+"\""; b++; }
               B[b-1]+=">";
               }
            A[p] = B.join("");
            }
         }
      else for(j=0;j<cnt;j++){
           A[p] = "<BR "+P[0]+"=\""+A[p]+"\""; p++;
         for(i=1;i<pl;i++){ A[p] = " "+P[i]+"=\""+(A[p]+"").replace(/\&/g,"&amp;").replace(/\</g,"&lt;").replace(/\"/g,"&quot;")+"\""; p++; }
         A[p-1]+=">";
         }
      while(p<A.length) A[p++] = null; 
      To.innerHTML = A.join("");
      ME.FFOnly;
      }
      
   else if(cnt){
      var o = Dom.createElement(), r = o; 
      o.parentNode = To;
      To.firstChild = o;
      for(j=1;j<cnt;j++) {
         r = Dom.createElement(); 
         r.parentNode = To;
         o.nextSibling = r;
         r.previousSibling = o;
         o = r;
         }
      To.childNodes.length = cnt;   
      To.lastChild = r;
      r = To.firstChild;
      if(dblsep && pl){
         for(var al = A.length;p<al;p++){
            var B = A[p].split(dblsep), bl = B.length, b=1;
            while(b<bl){
               for(i=0;i<pl;i++) r[P[i]] = B[b++];
               r=r.nextSibling;
               }
            }
         }
      else if(pl) for(j=0;j<cnt;j++){
         for(i=0;i<pl;i++) r[P[i]] = A[p++];
         r=r.nextSibling;
         }
      }
   }            
}
ME.ShortFormat;
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
MS.XmlIn;
// -----------------------------------------------------------------------------------------------------------
var CNodeAttrsCheckRegExp = /^[^\s\"\'\=\>\<\/]+(\s+([^\s\"\'\=\>\<\/]+\s*\=\s*(\'[^\']*\'|\"[^\"]*\")\s*)*)?\/?\>[\s\S]*$/; 
// -----------------------------------------------------------------------------------------------------------
// Reads node attribute in DTD format, from tag U
TGP.SetNodeAttrsU = function(N,B,A){
var name = this.GetNodeAttr(B,"N"), bl = B.length-1;
for(var j=1;j<bl;j+=2){
   var n = B[j], v = B[j+1].slice(1,-1); 
   if(n!='N'){
      if(v.indexOf('&')>=0) v = ReplaceEntities(v);
      if(n=='V') n = "";
      N[name+n] = (v-0)+""==v ? v-0 : v;
      }
   }
if(B[bl].charCodeAt(0)!=47){ 
   if(A[A.Pos].charCodeAt(0)==47) A.Pos++;
   else this.SetNodeAttrs(Dom.createElement(),B,A); 
   }
}
// -----------------------------------------------------------------------------------------------------------
// Sets attributes of tag N according to the B array = nodename,name1,'value1',name2,"value2",...,>text
// Ignores nodename
// A is array if the rest of parsed XML, if B does not contain />, reads also children as HTMLElement
// If checkrel is true, checks adding fixed/space rows by ReloadReason
TGP.SetNodeAttrs = function(N,B,A,noch,checkrel,noid){
var bl = B.length-1;
for(var j=1;j<bl;j+=2){
   var v = B[j+1].slice(1,-1); 
   if(v.indexOf('&')>=0) v = ReplaceEntities(v);
   if(N[B[j]] && typeof(N[B[j]])=="function"){
      MS.Debug;
      this.Debug(2,"Wrong custom attribute name, probably in <Cfg> tag, conflicts with method name: ",B[j]);
      ME.Debug;
      continue; 
      }
   N[B[j]] = (v-0)+""==v ? v-0 : v;
   }

// --- text ---
var s = B[bl];
if(s.charCodeAt(0)==47 || !A) return; 

MS.ShortFormat;
if(s.length>10 || s.search(CNodeTextRegExp)>=0) this.UpdateNodeText(N,s.slice(1),A);
ME.ShortFormat;

// --- children ---
var al = A.length, BB = B;
while(A.Pos<al){
   B = this.ParseNodeAttrs(A); if(!B) return; 
   if(B[0]=="U"){ this.SetNodeAttrsU(N,B,A); continue; }
   MS.Debug; if(noch==1) this.Debug(2,"Unexpected child tag ",B[0]," of tag ",BB[0]); ME.Debug; 
   if(N.appendChild){ 
      var ch = null;
      if(noid) ch = Dom.createElement("I"); 
      else {
         var id = this.GetNodeAttr(B,"id");
         if(id||id=="0") for(var r=N.firstChild;r;r=r.nextSibling) if(r.id==id){ ch = r; break; }
         if(!ch) {
            if(checkrel && this.ReloadReason){ 
               MS.Debug; 
               if(this.ReloadReason=="Upload"||this.ReloadReason=="Check") this.Debug(2,this.ReloadReason+": data in server response ",this.ReloadReason+"_Url"," contain new fixed row '"+(id?id:"???")+"' definition, it is not possible to add new fixed rows by this response");
               else this.Debug(2,"ReloadBody: data in ","Data_Url"," server response contain new fixed row '"+(id?id:"???")+"' definition, it is not possible to add new fixed rows via ReloadBody, define the fixed row in Layout xml only");
               ME.Debug;               
               this.SetNodeAttrs({},B,A);
               continue;
               } 
            ch = Dom.createElement("I"); 
            }
         if(B[0]!="I") ch.Kind = B[0];            
         }
      if(ch.TextOnly) { ch.TextOnly = 0; N.appendChild(ch); }
      if(ch.parentNode!=N) N.appendChild(ch);
      }
   else { 
      if(!N.Children) N.Children = [];
      var ch = {};
      N.Children[N.Children.length] = ch;
      }
   this.SetNodeAttrs(ch,B,A,noch-1);
   } 

}
// -----------------------------------------------------------------------------------------------------------
// Returns attribute named Attr from parsed array B
TGP.GetNodeAttr = function(B,Attr){
var bl = B.length-1;
for(var j=1;j<bl;j+=2) if(B[j]==Attr) {
   var v = B[j+1].slice(1,-1); 
   if(v.indexOf('&')>=0) v = ReplaceEntities(v);
   return (v-0)+""==v ? v-0 : v;
   }
}
// -----------------------------------------------------------------------------------------------------------
// Parses attributes of node at position A.Pos to: TagName; Name1; "Value1"; Name2; "Value2"; ... ; (/)>text
// It can join nodes if they were divided by '<' in attribute value
TGP.ParseNodeAttrs = function(A){
var s = A[A.Pos++];
if(s.charCodeAt(0)==47) return null; 
while(1){   
   try { var B = s.match(CNodeAttrsRegExp); }
   catch(e){ 
      MS.Debug;
      if(this.DebugFlags["problem"]){
         this.Debug(1,"Too long XML data in: ");
         this.Debug(35,"<"+s.slice(0,1000));
         }
      ME.Debug;
      return null; 
      }
   if(!B){ 
      MS.Debug;
      if(this.DebugFlags["problem"]){
         this.Debug(1,"Invalid structure in XML data: ");
         this.Debug(35,"<"+s.slice(0,10000));
         }
      ME.Debug;
      return null;
      }
   var l = B[B.length-1].charCodeAt(0); if(l==47 || l==62){ 
      l = B[B.length-2].charCodeAt(0);
      if(l==34 || l==39 || B.length<=3) {
         MS.Debug;
         if(this.DebugFlags["problem"] && s.search(CNodeAttrsCheckRegExp)<0) { 
            this.Debug(1,"Invalid node structure in XML data: ");
            this.Debug(35,"<"+s.slice(0,10000));
            var s = "<"+B[0]+" ";
            for(var i=1;i<B.length-2;i+=2) s += B[i]+"="+B[i+1]+" ";
            s += B[B.length-1];
            this.Debug(1,"The invalid XML node structure was parsed to: ");
            this.Debug(35,s.slice(0,10000));
            }
         ME.Debug;
         return B;
         }
      }
   if(!A[A.Pos]){ 
      MS.Debug;
      if(this.DebugFlags["problem"]) {
         this.Debug(1,s.search(/\=[\'\"]/)>=0 ? "Missing quotes in attribute value in XML data: " :"Missing closing tag in XML data: ");
         this.Debug(35,"<"+s.slice(0,10000));
         }
      ME.Debug;
      return null; 
      }
   s += '<' + A[A.Pos++];    
   }
}
// -----------------------------------------------------------------------------------------------------------
// Main function for loading XML to grid. Parses Xml in string and add it to grid. DataIO is data source just for debug prints
TGP.AddDataFromXml = function(Xml, DataIO){
var page = DataIO.Row;
var A = Xml.split('<'), al = A.length;
A.Pos = 2; 
DataIO.JavaScript = "";
while(A.Pos<al){
   var B = this.ParseNodeAttrs(A); 
   if(!B){ 
      var s = A[A.Pos-1].slice(1);
      if(s.indexOf(RN)==0) continue; 
      if(s.indexOf("Grid")==0) break; 
      MS.Debug; 
      this.Debug(1,"Missing enclosing tag </Grid> in the root level in XML data from "+this.DebugDataGetName(DataIO));
      if(this.DebugFlags["ioerror"] && !DataIO.Debug["in"]) this.DebugData(DataIO,"<"+Xml," XML:");
      ME.Debug;
      return false;
      }
   var bl = B.length-1;
   var RN = B[0]; 
   
   // --- IO ---
   if(RN=="IO"){ this.SetNodeAttrs(this.IO,B,A,1); continue; }

   // --- Cfg ---	
   if(RN=="Cfg" || RN=="Config"){ 
      MS.Debug; 
      if(this.DebugFlags["check"]){
         var U = {};
         this.SetNodeAttrs(U,B,A,1); 
         this.DebugCfg(U);
         for(var a in U) this[a] = U[a];
         continue; 
         }
      ME.Debug;
      this.SetNodeAttrs(this,B,A,1); continue; 
      }

   // --- Media ---
   MS.Media;
   if(RN=="Media"){
      if(B[bl].charCodeAt(0)==47) continue; 
      while(A.Pos<al){
         var B = this.ParseNodeAttrs(A); if(!B) break; 
         var bl = B.length-1;
         var D = {Attrs:{}};
         for(var j=1;j<bl;j+=2){
            var v = B[j+1].slice(1,-1); 
            if(v.indexOf('&')>=0) v = ReplaceEntities(v);
            D.Attrs[B[j]] = (v-0)+""==v ? v-0 : v;
            }
         
         if(B[bl].charCodeAt(0)!=47) while(A.Pos<al){
            var B = this.ParseNodeAttrs(A); if(!B) break; 
            var N = B[0], X = D[N]; if(!X) { X = {}; D[N] = X; }
            if(N=="Cols" || N=="Rows" || N=="Def" || N=="Lang" || N=="Pagers"){
               if(B[B.length-1].charCodeAt(0)==47) continue; 
               while(A.Pos<al){
                  var B = this.ParseNodeAttrs(A); if(!B) break; 
                  var a = N=="Lang" ? B[0] : this.GetNodeAttr(B,N=="Rows"?"id":"Name"); if(!a) { MS.Debug; this.Debug(2,"<Media> contains "+(N=="Cols"?"column":(N=="Rows"?"row":"default row"))+" without ",N=="Rows"?"id":"Name"," attribute set."); ME.Debug; continue; } 
                  var C = X[a]; if(!C) { C = {}; X[a] = C; }
                  this.SetNodeAttrs(C,B,A,1);
                  }
               }
            else if(N=="Actions"||N=="Cfg"||N=="Config"||N=="MenuCfg"||N=="MenuColumns"||N=="MenuPrint"||N=="MenuExport") {
               this.SetNodeAttrs(X,B,A,1);
               }
            else { MS.Debug; this.Debug(2,"<Media> contains unknown tag ",N); ME.Debug; }
            }
         this.Media.push(D);
         }
      continue;
      }
   ME.Media;

   // --- Actions ---
   if(RN=="Actions"){ 
      
      for(var i=1;i<bl;i+=2){ 
         var n = B[i], v = B[i+1].slice(1,-1); 
         if(n.indexOf("KeyCodes")==0){
            v = v.replace(/\s/g,"").split(",");
            for(var j=0;j<v.length;j++){
               var x = v[j].split("=");
               if(x.length!=2) continue;
               this.KeyCodes[x[1]] = x[0];
               }
            }
         else if(n.search(/Parent|Size/)>=0) this.Mouse[n] = v;
         else this.Actions[n] = v.indexOf('&')>=0 ? ReplaceEntities(v) : v;
         }
      continue;  
      }   

   // --- Colors ---	
   if(RN=="Colors"){ MS.Color; this.SetNodeAttrs(this.ColorsXml,B,A,1); ME.Color; continue; }
    
   // --- MenuCfg ---
   if(RN=="MenuCfg"){ MS.MenuCfg; this.SetNodeAttrs(this.MenuCfg,B,A,1); ME.MenuCfg; continue; }
   if(RN=="MenuColumns"){ this.SetNodeAttrs(this.MenuColumns,B,A,1); continue; }
   if(RN=="MenuPrint"){ this.SetNodeAttrs(this.MenuPrint,B,A,1); continue; }
   if(RN=="MenuExport"){ this.SetNodeAttrs(this.MenuExport,B,A,1); continue; }

   // --- Pager ---
   if(RN=="Pager"){ MS.Pager; this.SetNodeAttrs(this.Pager,B,A,1); ME.Pager; continue; }

   MS.Pager;
   if(RN=="Pagers"){
      if(B[bl].charCodeAt(0)==47) continue; 
      var X = this.Pagers;
      while(A.Pos<al){
         var B = this.ParseNodeAttrs(A); if(!B) break; 
         var a = this.GetNodeAttr(B,"Name"), D = X[a];
         if(!D) { D = { }; D.Index = X.length; if(!a) a = "Pager"+X.length; D.Name = a; X[a] = D; X[X.length] = D;}
         this.SetNodeAttrs(D,B,A,0);
         }
      continue;
      }
   ME.Pager;

   // --- Def --
   if(RN=="Def"){
      if(B[bl].charCodeAt(0)==47) continue; 
      var X = this.Def;
      while(A.Pos<al){
         var B = this.ParseNodeAttrs(A); if(!B) break; 
         var a = this.GetNodeAttr(B,"Name");
         MS.Group;
         if(!a && this.GetNodeAttr(B,"Group")==1){
            if(!X.Count) X.Count = 1;
            a = "Group"+(X.Count++);
            }
         ME.Group;
         if(a){
            var D = a=="C" ? this.DefCols[a] : X[a]; 
            if(!D){ D = { }; if(a=="C") this.DefCols[a] = D; else X[a] = D; }
            this.SetNodeAttrs(D,B,A,0);
            if(D.Def==null && a!="R" && a!="C") D.Def = "R";
            D.Name = a; 
            D.Updated = 0;
            }
         else {
            MS.Debug; this.Debug(2,"Found default row <D> without ","Name"," attribute set, the row is ignored."); ME.Debug;
            }   
         }
      continue;
      }
   
   // --- Def --
   if(RN=="DefCols"){
      if(B[bl].charCodeAt(0)==47) continue; 
      var X = this.DefCols;
      while(A.Pos<al){
         var B = this.ParseNodeAttrs(A); if(!B) break; 
         var a = this.GetNodeAttr(B,"Name");
         if(a){
            var D = X[a];
            if(!D){ D = { }; X[a] = D; }
            this.SetNodeAttrs(D,B,A,1);
            if(D.Def==null && a!="C") D.Def = "C";
            D.Updated = 0;
            }
         else {
            MS.Debug; this.Debug(2,"Found default column <D> without ","Name"," attribute set, the column is ignored."); ME.Debug;
            }   
         }
      continue;
      }
   
   // --- Panel ---
   if(RN=="Panel"){
      MS.Panel;
      var C = this.Cols[RN];
      this.SetNodeAttrs(C,B,A,1);
      if(C.Pos==null) C.Pos = 0;
      if(C.Sec==null) C.Sec = 0;
      
      C.Name = RN;
      ME.Panel;
      continue;
      }
   
   // --- Columns ---
   var idx = CNodeSec[RN];
   if(idx!=null){
      if(B[bl].charCodeAt(0)==47) continue; 
      var CN = this.ColNames[idx];
      var upd = this.AllCols;
      if(upd) { CN = []; this.ColNames[idx] = CN; }
      while(A.Pos<al){
         var B = this.ParseNodeAttrs(A); if(!B) break; 
         var a = this.GetNodeAttr(B,"Name");
         if(a){
            var C = this.Cols[a];   
            if(!C){
               C = { };
               if(this.ReloadReason){ 
                  MS.Debug; 
                  if(this.ReloadReason=="Upload"||this.ReloadReason=="Check") this.Debug(2,this.ReloadReason+": data in server response ",this.ReloadReason+"_Url"," contain new column '"+a+"' definition, it is not possible to add new columns by this response");
                  else this.Debug(2,"ReloadBody: data in ","Data_Url"," server response contain new column '"+a+"' definition, it is not possible to add new columns via ReloadBody, define columns in Layout.xml only");
                  ME.Debug;
                  }
               else {
                  
                  this.Cols[a] = C;
                  
                    C.Pos = CN.length;
                  CN[CN.length] = a;
                   C.Sec = idx;
                  C.Name = a;
                  }
               }
            else if(upd){
               C.Pos = CN.length;
               CN[CN.length] = C.Name;
                C.Sec = idx;
               }
            else if(a=="Panel") this.MoveColData(C,"",idx); 
            if(this.ReloadReason){ 
               var w = C.Width; C.Width = null;
               this.SetNodeAttrs(C,B,A,1);
               C.Width = C.Width!=null ? C.Width*this.Img.Width : w;
               }
            else this.SetNodeAttrs(C,B,A,1);
            if(C.Next!=null&&(!C.Next||this.Cols[C.Next])) { 
               if(!this.ReloadReason&&!upd) this.MoveColData(C,C.Next,idx);
               C.Next = null;
               }
            }
         }
      continue;
      }
      
   // --- Par ---
   MS.ShortFormat;
   if(RN=="Par"){
      if(B[bl].charCodeAt(0)==47) continue; 
      while(A.Pos<al){
         var B = this.ParseNodeAttrs(A); if(!B) break; 
         var P = {}; this.SetNodeAttrs(P,B,A,1);
         var a = P["Name"], l = P["List"];
         if(a) this.Par[a] = l?l.replace(/\,+$/,"").split(","):[]; 
         }      
      continue;
      }
   ME.ShortFormat;
   
   // --- Changes ---
   MS.ServerChanges;
   if(RN=="Changes"||RN=="Spanned"){
      var N = Dom.createElement("B");
      this.SetNodeAttrs(N,B,A,0);
      this.AddChanges(N);
      continue;
      }
   ME.ServerChanges;

   // --- Lang ---
   if(RN=="Lang"){
      if(B[bl].charCodeAt(0)==47) continue; 
      while(A.Pos<al){
         var B = this.ParseNodeAttrs(A); if(!B) break; 
         var X = this.Lang[B[0]];
         if(!X){ X = {}; this.Lang[B[0]] = X; }
         this.SetNodeAttrs(X,B,A,1);            
         }
      this.Lang.Format.Init();
      continue;
      }   

   // --- Languages ---
   MS.Lang;
   if(RN=="Languages"){
      if(B[bl].charCodeAt(0)==47) continue; 
      while(A.Pos<al){
         var B = this.ParseNodeAttrs(A); if(!B) break; 
         var X, a = this.GetNodeAttr(B,"Code"); a = a ? a.toUpperCase() : B[0].toUpperCase();
         if(a.indexOf(",")>=0) {
            a = a.split(",");
            X = {};
            this.SetNodeAttrs(X,B,A,1);
            for(var i=0;i<a.length;i++){
               var N = this.Languages[a[i]];
               if(!N) { N = {}; this.Languages[a[i]] = N; }
               for(var n in X) N[n] = X[n];
               N.Code = a[i];
               }
            }
         else if(a=="*" || a.charAt(0)=='-'){
            var nn = a.slice(1);
            X = {};
            this.SetNodeAttrs(X,B,A,1);
            for(var a in this.Languages) if(a!=nn){
               var N = this.Languages[a];
               for(var n in X) N[n] = X[n];
               }
            }
         else {
            X = this.Languages[a];
            if(!X){ X = {}; this.Languages[a] = X; X.Code = a; }
            this.SetNodeAttrs(X,B,A,1);
            
            }
         }
      continue;
      }   
   ME.Lang;

   // --- Rows ---
   if(RN=="Toolbar"){ this.SetNodeAttrs(this.Toolbar,B,A,1); continue; }
   if(RN=="Header"){ this.SetNodeAttrs(this.Header,B,A,1); continue; }
   if(RN=="Root"){ this.SetNodeAttrs(this.Root,B,A,1); continue; }
   if(RN=="Head"){ this.SetNodeAttrs(this.XH,B,A,2,1); continue; }
   if(RN=="Foot"){ this.SetNodeAttrs(this.XF,B,A,2,1); continue; }
   if(RN=="Filter"){ if(!this.Filter) this.Filter = Dom.createElement("U"); this.SetNodeAttrs(this.Filter,B,A,1); continue; }
   
   MS.Filter;
   if(RN=="Filters"){
      if(B[bl].charCodeAt(0)==47) continue; 
      
      while(A.Pos<al){
         var B = this.ParseNodeAttrs(A); if(!B) break; 
         var a = this.GetNodeAttr(B,"id");
         if(!a&&a!="0") {
            var b = this.GetNodeAttr(B,"Name");
            if(b){
               var X = {}; this.SetNodeAttrs(X,B,A,0);
               this.SetFilter(X.Name,X["Filter"],X["Col"],0);
               continue;
               }
            }
         
         for(var X=this.XH.firstChild;X;X=X.nextSibling) if(X.id==a) break;
         if(!X) { for(var X=this.XF.firstChild;X;X=X.nextSibling) if(X.id==a) break; }
         if(X) this.SetNodeAttrs(X,B,A,0);
         else { MS.Debug; this.Debug(2,"Found Filter row with unknown id ",a); ME.Debug; }   
         }
      continue;
      }
   ME.Filter;

   MS.Space;
   if(RN=="Solid"){
      if(this.ReloadReason){
         MS.Debug; 
         if(this.ReloadReason=="Upload"||this.ReloadReason=="Check") this.Debug(2,this.ReloadReason+": data in server response ",this.ReloadReason+"_Url"," contain Space row(s) definition, it is not possible to update solid Space rows directly, use <Changes> tag instead");
         else this.Debug(2,"ReloadBody: data in ","Data_Url"," server response contain Space row(s) definition, it is not possible to update Space rows via ReloadBody, define the Space rows in Layout xml only");
         ME.Debug;
         this.SetNodeAttrs({},B,A,2);
         }
      else {   
         var r = this.XS.lastChild;
         this.SetNodeAttrs(this.XS,B,A,2,1);
         for(r=r?r.nextSibling:this.XS.firstChild;r;r=r.nextSibling) if(!r.Kind) r.Kind = r.id=="Toolbar" ? "Toolbar" : "Space"; 
         }
      continue;   
      }
   ME.Space;
   
   if(RN=="Body"){
      
      var XB = this.XB, P = XB;
      A.InBody = 1;
      
      if(page) {
         
         while(A.Pos<al){
            var B = this.ParseNodeAttrs(A);
      
            if(!B){
               if(P==XB) break;  
               if(!P) P = XB; 
               else P = P.parentNode; 
               continue;
               }

             var id = this.GetNodeAttr(B,"id"), Rows = this.GetNodeAttr(B,"Rows"), Pos = this.GetNodeAttr(B,"Pos"), bl = B.length-1;
            var ch = !id&&!Rows&&Pos==null || (id||id=="0") && (id==page.id || id==page.Copy) || Rows && Rows == page.Rows || Pos!=null && Pos==page.Pos ? page : Dom.createElement("B"); 
            if(ch.SPage) { 
               var N = {id:1,Pos:1,Def:1,Kind:1,Pos:1}; for(var n in N) N[n] = ch[n]; 
               this.SetNodeAttrs(ch,B,A,0,0,1);
               for(var n in N) ch[n] = N[n];
               }
            this.SetNodeAttrs(ch,[B[B.length-1]],A,0,0,1); 
            
            }
         }

      else if(this.ReloadReason=="Upload" || this.ReloadReason=="Check"){
         MS.Debug; this.Debug(2,this.ReloadReason+": data in server response ",this.ReloadReason+"_Url"," contain <Body> rows definition, it is not possible to update rows directly, use <Changes> tag instead"); ME.Debug; 
         this.SetNodeAttrs({},B,A,0);
         }
         
      else {
         MS.ShortFormat;
         if(B[bl].length>10 || B[bl].search(CNodeTextRegExp)>=0) this.UpdateNodeText(XB,B[bl].slice(1),A);
         ME.ShortFormat;
         while(A.Pos<al){
            var B = this.ParseNodeAttrs(A);
      
            if(!B){
               if(P==XB) break;  
               P = P.parentNode; 
               continue;
               }

            var bl = B.length-1;
            if(B[0]=="U"){ this.SetNodeAttrsU(P,B,A,0); continue; }
            var N = Dom.createElement(B[0]);
            P.appendChild(N);         
      
            for(var j=1;j<bl;j+=2){
               var v = B[j+1].slice(1,-1); 
               if(v.indexOf('&')>=0) v = ReplaceEntities(v);
               N[B[j]] = (v-0)+""==v ? v-0 : v;
               }

            var s = B[bl];
            if(s.charCodeAt(0)!=47) { 
               P = N;
               MS.ShortFormat;
               if(s.length>10 || s.search(CNodeTextRegExp)>=0) this.UpdateNodeText(N,s.slice(1),A); 
               ME.ShortFormat;
               }
            }
            
         var FB = this.XB.firstChild;
         if(FB && FB.tagName=="I"){ 
            N = Dom.createElement("B");
            this.XB.insertBefore(N,FB);
            while(FB){
               var NB = FB.nextSibling;
               N.appendChild(FB);
               FB = NB;
               }
            }   
         }
      A.InBody = 0;   
      continue;
      }
   
   

   MS.Debug;
   if(RN=="Debug"){
      var D = {}; this.SetNodeAttrs(D,B,A,1);
      if(D.Message) this.Debug(D.Level==null?2:D.Level,D.Message);
      continue;
      }
   ME.Debug;

   MS.Animate;
   if(RN=="Animations"){ 
      this.SetNodeAttrs(this.Animations,B,A,1); 
      continue; 
      }
   ME.Animate;

   if(RN=="Script"||RN=="script"||RN=="SCRIPT"){
      DataIO.JavaScript += "\n"+A[A.Pos-1].slice(7);
      var ss = "/"+RN+">";
      while(A[A.Pos].indexOf(ss)<0 && A.Pos<al) DataIO.JavaScript += "<"+A[A.Pos++];
      continue;
      }

   if(RN=="Names"){ 
      if(B[bl].charCodeAt(0)==47) continue; 
      var X = this.Names;
      while(A.Pos<al){
         var B = this.ParseNodeAttrs(A); if(!B) break; 
         var a = this.GetNodeAttr(B,"Name");
         if(a){ a = a.toLowerCase(); if(!X[a]) X[a] = {}; this.SetNodeAttrs(X[a],B,A,1); if(!X[a].Value) delete X[a]; }
         else { MS.Debug; this.Debug(2,"Found name <N> without ","Name"," attribute set, the name is ignored."); ME.Debug; }   
         }
      continue;
      }

   MS.Lang;
   if(RN.slice(0,4)=="Text"){
      var c = RN.slice(4);
      if(B[bl].charCodeAt(0)==47) continue; 
      while(A.Pos<al){
         var B = this.ParseNodeAttrs(A); if(!B) break; 
         var N = {}; this.SetNodeAttrs(N,B,A,1);
         if(!N.Action) N.Action = B[0];
         this.AddText(N,c);
         }
      continue;
      }
   ME.Lang;
     
   this.SetNodeAttrs({},B,A,0); 
   MS.Debug; this.Debug(2,"Unknown root tag '",RN,"' in XML data from ",this.DebugDataGetName(DataIO)); ME.Debug; 
   }
return true;   
}
// -----------------------------------------------------------------------------------------------------------
ME.XmlIn;

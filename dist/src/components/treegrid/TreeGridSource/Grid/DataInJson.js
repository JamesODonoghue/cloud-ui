// -----------------------------------------------------------------------------------------------------------
// Parsing input JSON
// -----------------------------------------------------------------------------------------------------------
MS.JsonIn;
// -----------------------------------------------------------------------------------------------------------
TGP.SetJsonAttrs = function(N,A){
for(var a in A) N[a] = A[a]-0+""==A[a] ? A[a]-0 : !A[a]||typeof(A[a])!="object" ? A[a] : A[a].join&&typeof(A[a][0])=="string" ? A[a].join("") : A[a].Items ? JSON.stringify(A[a]) : A[a];

}
// -----------------------------------------------------------------------------------------------------------
TGP.SetJsonItems = function(N,A,body){
var al = A.length;
for(var i=0;i<al;i++){
   var B = A[i], row = null; if(!B) continue; 
   if(!body) {
      var id = B.id;
      if(id||id=="0") for(var r=N.firstChild;r;r=r.nextSibling) if(r.id==id){ row = r; break; }
      if(!row && this.ReloadReason){ 
         MS.Debug; 
         if(this.ReloadReason=="Upload"||this.ReloadReason=="Check") this.Debug(2,this.ReloadReason+": data in server response ",this.ReloadReason+"_Url"," contain new fixed row '"+(id?id:"???")+"' definition, it is not possible to add new fixed rows by this response");
         else this.Debug(2,"ReloadBody: data in ","Data_Url"," server response contain new fixed row '"+(id?id:"???")+"' definition, it is not possible to add new fixed rows via ReloadBody, define the fixed row in Layout json only");
         ME.Debug;               
         continue;
         }
      }
   if(!row){
      row = Dom.createElement("I"); 
      N.appendChild(row);
      }
   MS.ShortFormat; var P = B.ItemsPar; if(P) { this.UpdateNodeText(row,P); delete B.ItemsPar; } ME.ShortFormat;  
   var I = B.Items; if(I) { this.SetJsonItems(row,I,body); delete B.Items; }
   
   for(var a in B) {
      
      row[a] = B[a]-0+""==B[a] ? B[a]-0 : !B[a]||typeof(B[a])!="object" ? B[a] : B[a].join&&typeof(B[a][0])=="string" ? B[a].join("") : JSON.stringify(B[a]); 
      }
   if(I) B.Items = I;
   MS.ShortFormat; if(P) B.ItemsPar = P; ME.ShortFormat; 
   }
}
// -----------------------------------------------------------------------------------------------------------
// Main function for loading JSON to grid. Parses JSON in string and add it to grid. DataIO is data source just for debug prints
TGP.AddDataFromJson = function(A, DataIO){

var page = DataIO.Row, T = this;
DataIO.JavaScript = "";
for(var RN in A){
   var B = A[RN], p = RN.indexOf("_"); if(p>0) RN = RN.slice(0,p);
   
   // --- IO ---
   if(RN=="IO"){ this.SetJsonAttrs(this.IO,B); continue; }

   // --- Cfg ---	
   if(RN=="Cfg" || RN=="Config"){ 
      MS.Debug; if(this.DebugFlags["check"]) this.DebugCfg(B); ME.Debug;
      for(var a in B) {
         if(this[a] && typeof(this[a])=="function"){
            MS.Debug;
            this.Debug(2,"Wrong custom attribute name in <Cfg> tag, conflicts with method name: ",a);
            ME.Debug;
            continue; 
            }
         this[a] = B[a]-0+""==B[a] ? B[a]-0 : !B[a]||typeof(B[a])!="object" ? B[a] : B[a].join&&typeof(B[a][0])=="string" ? B[a].join("") : B[a].Items ? JSON.stringify(B[a]) : B[a];
         }
      continue;
      }
   
   // --- Media ---
   MS.Media;
   if(RN=="Media"){
      function SetMediaItem(a,ba,N,X){ 
         if(!a) { MS.Debug; T.Debug(2,"<Media> contains "+(N=="Cols"?"column":(N=="Rows"?"row":"default row"))+" without ",N=="Rows"?"id":"Name"," attribute set."); ME.Debug; return; }
         var Q = X[a]; if(!Q) { Q = {}; X[a] = Q; }
         T.SetJsonAttrs(Q,ba);
         }
      function SetMedia(dummy,ba){
         var D = {Attrs:{}};
         for(var a in ba) {
            var B = ba[a], p = a.indexOf("_"); if(p>0) a = a.slice(0,p);
            if(a=="Cols"||a=="Rows"||a=="Def"&&typeof(B)!="string"||a=="Lang"||a=="Pagers"){
               var X = D[a]; if(!X) { X = {}; D[a] = X; }
               if(B.length!=null){ for(var i=0;i<B.length;i++){ SetMediaItem(a=="Rows"?B[i].id:B[i].Name,B[i],a,X); } } 
               else for(var a in B) SetMediaItem(a,B[a],a,X); 
               }
            else if(a=="Actions"||a=="Cfg"||a=="Config"||a=="MenuCfg"||a=="MenuColumns"||a=="MenuPrint"||a=="MenuExport") {
               var X = D[a]; if(!X) { X = {}; D[a] = X; }
               T.SetJsonAttrs(X,B);
               }
            else if(typeof(B)=="string"||typeof(B)=="number") D.Attrs[a] = B;
            else { MS.Debug; T.Debug(2,"<Media> contains unknown tag ",a); ME.Debug; }
            }
         T.Media.push(D);
         }
      if(B.length!=null){ for(var i=0;i<B.length;i++){ SetMedia(B[i].Name,B[i]); } } 
      else for(var a in B) SetMedia(a,B[a]); 
      continue;
      }
   ME.Media;

   // --- Actions ---
   if(RN=="Actions"){ 
      
      for(var n in B){ 
         var v = B[n];
         if(n.indexOf("KeyCodes")==0){
            v = v.replace(/\s/g,"").split(",");
            for(var j=0;j<v.length;j++){
               var x = v[j].split("=");
               if(x.length!=2) continue;
               this.KeyCodes[x[1]] = x[0];
               }
            }
         else if(n.search(/Parent|Size/)>=0) this.Mouse[n] = v;
         else this.Actions[n] = v;
         }
      continue;  
      }   

   // --- Colors ---	
   if(RN=="Colors"){ MS.Color; this.SetJsonAttrs(this.ColorsXml,B); ME.Color; continue; }
    
   // --- MenuCfg ---
   if(RN=="MenuCfg"){ MS.MenuCfg; this.SetJsonAttrs(this.MenuCfg,B); ME.MenuCfg; continue; }
   if(RN=="MenuColumns"){ this.SetJsonAttrs(this.MenuColumns,B); continue; }
   if(RN=="MenuPrint"){ this.SetJsonAttrs(this.MenuPrint,B); continue; }
   if(RN=="MenuExport"){ this.SetJsonAttrs(this.MenuExport,B); continue; }
   
   // --- Pager ---
   if(RN=="Pager"){ MS.Pager; this.SetJsonAttrs(this.Pager,B); ME.Pager; continue; }

   MS.Pager;
   if(RN=="Pagers"){
      function SetPager(a,ba){
         var D = X[a];
         if(!D) { D = { }; D.Index = X.length; D.Name = a; X[a] = D; X[X.length] = D;}
         T.SetJsonAttrs(D,ba);
         }
      var X = this.Pagers;
      if(B.length!=null){ for(var i=0;i<B.length;i++){ var a = B[i].Name; SetPager(a?a:"Pager"+X.length,B[i]); } } 
      else for(var a in B) SetPager(a,B[a]); 
      continue;
      }
   ME.Pager;

   // --- Def --
   if(RN=="Def"){
      function SetDef(a,ba){
         var D = a=="C" ? T.DefCols[a] : X[a]; 
         if(!D){ D = { }; if(a=="C") T.DefCols[a] = D; else X[a] = D; }
         
         T.SetJsonAttrs(D,ba);
         if(ba.Items) {
            D.Children = [];
            for(var i=0;i<ba.Items.length;i++){
               D.Children[i] = ba.Items[i].Items ? Dom.createElement("U") : {};
               T.SetJsonAttrs(D.Children[i],ba.Items[i]);
               if(ba.Items[i].Items) T.SetJsonItems(D.Children[i],ba.Items[i].Items);
               }
            }
         
         if(D.Def==null && a!="R" && a!="C") D.Def = "R";
         D.Name = a;
         D.Updated = 0;
         }
      var X = this.Def;
      if(B.length!=null){ for(var i=0;i<B.length;i++){ var a = B[i].Name; if(a) SetDef(a,B[i]); } } 
      else for(var a in B) SetDef(a,B[a]); 
      continue;
      }
   
   // --- Def --
   if(RN=="DefCols"){
      function SetDefCol(a,ba){
         var D = X[a];
         if(!D){ D = { }; X[a] = D; }
         T.SetJsonAttrs(D,ba);
         if(D.Def==null && a!="C") D.Def = "C";
         D.Name = a;
         D.Updated = 0;
         }
      var X = this.DefCols;
      if(B.length!=null){ for(var i=0;i<B.length;i++){ var a = B[i].Name; if(a) SetDefCol(a,B[i]); } } 
      else for(var a in B) SetDefCol(a,B[a]); 
      continue;
      }
   
   // --- Panel ---
   if(RN=="Panel"){
      MS.Panel;
      var C = this.Cols[RN];
      this.SetJsonAttrs(C,B);
      if(C.Pos==null) C.Pos = 0;
      if(C.Sec==null) C.Sec = 0;
      
      C.Name = RN;
      ME.Panel;
      continue;
      }
   
   // --- Columns ---
   var idx = CNodeSec[RN];
   if(idx!=null){
      var upd = this.AllCols;
      if(upd) { CN = []; this.ColNames[idx] = CN; }
      function SetCol(a,ba){
         var C = T.Cols[a];   
         if(!C){
            C = { };
            if(T.ReloadReason){ 
               MS.Debug; 
               if(T.ReloadReason=="Upload"||T.ReloadReason=="Check") T.Debug(2,T.ReloadReason+": data in server response ",T.ReloadReason+"_Url"," contain new column '"+a+"' definition, it is not possible to add new columns by this response");
               else T.Debug(2,"ReloadBody: data in ","Data_Url"," server response contain new column '"+a+"' definition, it is not possible to add new columns via ReloadBody, define columns in Layout json only");
               ME.Debug;
               }
            else {
               
               T.Cols[a] = C;
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
         else if(a=="Panel") T.MoveColData(C,"",idx); 
         if(this.ReloadReason){ 
            var w = C.Width; C.Width = null;
            T.SetJsonAttrs(C,ba);
            C.Width = C.Width!=null ? C.Width*T.Img.Width : w;
            }
         else T.SetJsonAttrs(C,ba);
         if(C.Next!=null&&(!C.Next||T.Cols[C.Next])) { 
            if(!T.ReloadReason&&!upd) T.MoveColData(C,C.Next,idx);
            C.Next = null;
            }
         }
      var CN = this.ColNames[idx];
      if(B.length!=null){ for(var i=0;i<B.length;i++) if(B[i]) { var a = B[i].Name; if(a) SetCol(a,B[i]); } } 
      else for(var a in B) SetCol(a,B[a]); 
      continue;
      }
      
   // --- Par ---
   MS.ShortFormat;
   if(RN=="Par"){
      for(var a in B){
         var l = typeof(B[a])=="string" ? B[a] : B[a]["List"];
         this.Par[a] = l?l.replace(/\,+$/,"").split(","):[]; 
         }      
      continue;
      }
   ME.ShortFormat;
   
   // --- Changes ---
   MS.ServerChanges;
   if(RN=="Changes"||RN=="Spanned"){
      var N = Dom.createElement("B");
      for(var i=0;i<B.length;i++){ 
         var I = Dom.createElement("I"), P = B[i]; 
         N.appendChild(I); 
         for(var a in P) I[a] = P[a];
         }
      this.AddChanges(N);
      continue;
      }
   ME.ServerChanges;

   // --- Lang ---
   if(RN=="Lang"){
      for(var a in B){
         var P = this.Lang[a];
         if(!P){ P = {}; this.Lang[a] = P; }
         this.SetJsonAttrs(P,B[a]);
         }
      this.Lang.Format.Init();
      continue;
      }   

   // --- Languages ---
   MS.Lang;
   if(RN=="Languages"){
      for(var a in B){
         var c = B[a].Code; c = c ? c.toUpperCase() : a.toUpperCase();
         if(c.indexOf(",")>=0) {
            c = c.split(",");
            for(var i=0;i<c.length;i++){
               var X = this.Languages[c[i]];
               if(!X) { X = {}; this.Languages[c[i]] = X; }
               this.SetJsonAttrs(X,B[a]);
               X.Code = c[i]; 
               }
            }
         else if(c=="*" || c.charAt(0)=='-'){
            var nn = c.slice(1);
            for(var c in this.Languages) if(c!=nn){
               var X = this.Languages[c];
               this.SetJsonAttrs(X,B[a]);
               }
            }
         else {
            var X = this.Languages[c];
            if(!X){ X = {}; this.Languages[c] = X; X.Code = c; }
            this.SetJsonAttrs(X,B[a]);
            }
         }
      continue;
      }   
   ME.Lang;

   // --- Rows ---
   if(RN=="Toolbar"){ this.SetJsonAttrs(this.Toolbar,B); continue; }
   if(RN=="Header"){ this.SetJsonAttrs(this.Header,B); continue; }
   if(RN=="Root"){ this.SetJsonAttrs(this.Root,B); continue; }
   if(RN=="Head"){ this.SetJsonItems(this.XH,B); continue; }
   if(RN=="Foot"){ this.SetJsonItems(this.XF,B); continue; }
   if(RN=="Filter"){ if(!this.Filter) this.Filter = Dom.createElement("U"); this.SetJsonAttrs(this.Filter,B); continue; }
   
   // --- Filters ---
   MS.Filter;
   if(RN=="Filters"){
      function SetFilter(a,ba){
         for(var X=T.XH.firstChild;X;X=X.nextSibling) if(X.id==a) break;
         if(!X) { for(var X=T.XF.firstChild;X;X=X.nextSibling) if(X.id==a) break; }
         if(X) T.SetJsonAttrs(X,ba);
         }
      var X = this.DefCols;
      if(B.length!=null){ for(var i=0;i<B.length;i++){ var a = B[i].id; if(a) SetFilter(a,B[i]); } } 
      else for(var a in B) SetFilter(a,B[a]); 
      continue;
      }
   ME.Filter;

   MS.Space;
   if(RN=="Solid"){
      if(this.ReloadReason){
         MS.Debug; 
         if(this.ReloadReason=="Upload"||this.ReloadReason=="Check") this.Debug(2,this.ReloadReason+": data in server response ",this.ReloadReason+"_Url"," contain Space row(s) definition, it is not possible to update solid Space rows directly, use <Changes> tag instead");
         else this.Debug(2,"ReloadBody: data in ","Data_Url"," server response contain Space row(s) definition, it is not possible to update Space rows via ReloadBody, define the Space rows in Layout json only");
         ME.Debug;
         }
      else {   
         var r = this.XS.lastChild;
         this.SetJsonItems(this.XS,B);
         for(r=r?r.nextSibling:this.XS.firstChild;r;r=r.nextSibling) if(!r.Kind) r.Kind = r.id=="Toolbar" ? "Toolbar" : "Space"; 
         }
      continue;   
      }
   ME.Space;
   
   if(RN=="Body"){
      
      if(page) {
         var al = B.length;
         for(var i=0;i<al;i++){
            if(!B[i].id&&!B[i].Rows&&B[i].Pos==null || (B[i].id||B[i].id=="0") && (B[i].id==page.id || B[i].id==page.Copy) || B[i].Rows && B[i].Rows == page.Rows || B[i].Pos!=null && B[i].Pos==page.Pos) {
               MS.ShortFormat; var P = B[i].ItemsPar; if(P) { this.UpdateNodeText(page,P); delete B[i].ItemsPar; } ME.ShortFormat;
               var I = B[i].Items; if(I) { this.SetJsonItems(page,I,1); delete B[i].Items; }
               if(B[i].length) this.SetJsonItems(page,B[i],1);
               else this.SetJsonAttrs(page,B[i]);
               if(I) B[i].Items = I;
               MS.ShortFormat; if(P) B[i].ItemsPar = P; ME.ShortFormat;
               }
            }
         }

      else if(this.ReloadReason=="Upload" || this.ReloadReason=="Check"){
         MS.Debug; this.Debug(2,this.ReloadReason+": data in server response ",this.ReloadReason+"_Url"," contain <Body> rows definition, it is not possible to update rows directly, use <Changes> tag instead"); ME.Debug; 
         }
         
      else {
         MS.ShortFormat; if(B.length==1&&typeof(B[0])=="string"){ this.UpdateNodeText(this.XB,B[0]); continue; } ME.ShortFormat; 
         var al = B.length;
         for(var i=0;i<al;i++){
            var N = Dom.createElement("B");
            this.XB.appendChild(N);
            if(B[i].length!=null) this.SetJsonItems(N,B[i],1); 
            else {
               MS.ShortFormat; var P = B[i].ItemsPar; if(P) { this.UpdateNodeText(N,P); delete B[i].ItemsPar; } ME.ShortFormat;
               var I = B[i].Items; if(I) { this.SetJsonItems(N,I,1); delete B[i].Items; }
               this.SetJsonAttrs(N,B[i]);
               if(I) B[i].Items = I;
               MS.ShortFormat; if(P) B[i].ItemsPar = P; ME.ShortFormat;
               }
            }      
         }
      continue;
      }

   

   MS.Animate;
   if(RN=="Animations"){ 
      this.SetJsonAttrs(this.Animations,B); 
      continue; 
      }
   ME.Animate;

   MS.Debug;
   if(RN=="Debug"){
      var D = {}; this.SetJsonAttrs(D,B);
      if(D.Message) this.Debug(D.Level==null?2:D.Level,D.Message);
      continue;
      }
   ME.Debug;

   if(RN=="Script"||RN=="script"||RN=="SCRIPT") { DataIO.JavaScript += "\n"+B; continue; }

   if(RN=="Names"){
      var X = this.Names;
      if(B.length!=null){ for(var i=0;i<B.length;i++) if(B[i].Name) { var aa = B[i].Name.toLowerCase(), N = X[aa] ? X[aa] : {}; this.SetJsonAttrs(N,B[i]); if(N.Value) X[aa] = N; } } 
      else for(var a in B) { var aa = a.toLowerCase(), N = X[aa] ? X[aa] : {}; this.SetJsonAttrs(N,B[a]); N.Name = a.charAt(0)=="!"?a.slice(1):a; if(N.Value) X[aa] = N; }; 
      continue;
      }
   
   MS.Lang;
   if(RN.slice(0,4)=="Text"){
      var c = RN.slice(4);
        for(var a in B){
         var N = {}, I = B[a].Items;
         if(I) { 
            for(var i=0;i<I.length;i++) if(I[i]["N"]) N[I[i]["N"]] = I[i]["V"];
            delete B[a].Items;
            }
         this.SetJsonAttrs(N,B[a]);
         if(I) B[a].Items = I;
         if(!N.Action) N.Action = a;
         this.AddText(N,c);
         }
      continue;
      }
   ME.Lang;
      
   MS.Debug; this.Debug(2,"Unknown root tag '",RN,"' in JSON data from ",this.DebugDataGetName(DataIO)); ME.Debug; 
   }

return true;
}
// -----------------------------------------------------------------------------------------------------------
ME.JsonIn;

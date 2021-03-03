// -----------------------------------------------------------------------------------------------------------
// Functions for Language a Translate
// -----------------------------------------------------------------------------------------------------------
TGP.Translate = function(dummy1,dummy2,val) { return val; }
TGP.TranslateMenu = function() { }

MS.Lang;
// -----------------------------------------------------------------------------------------------------------
var CTextAttrs = {"Row":1,"Col":1,"Def":1,"Kind":1,"Type":1,"Space":1,"Action":1,"N":1,"V":1,"Count":1,"Row1":1,"Col1":1,"Def1":1,"Kind1":1,"Type1":1,"Space1":1,"Action1":1,"Row2":1,"Col2":1,"Def2":1,"Kind2":1,"Type2":1,"Space2":1,"Action2":1,"Row3":1,"Col3":1,"Def3":1,"Kind3":1,"Type3":1,"Space3":1,"Action3":1,"Row4":1,"Col4":1,"Def4":1,"Kind4":1,"Type4":1,"Space4":1,"Action4":1,"Row5":1,"Col5":1,"Def5":1,"Kind5":1,"Type5":1,"Space5":1,"Action5":1};
var CTextAttrsN = {"Row":1,"Col":1,"Def":1,"Kind":1,"Type":1,"Space":1,"Action":1};
var CActText = {"settext":"set","changetext":"change","replacetext":"replace","lasttext":"last","regextext":"regex"};
// -----------------------------------------------------------------------------------------------------------
TGP.AddText = function(N,code,num){
var X = this.Text[code]; if(!X) { X = {}; this.Text[code] = X; }
var act = N.Action ? N.Action.toLowerCase() : "set", regex = 0; if(act=="regex"){ regex = 1; act = "replace"; }
var text = 0; if(CActText[act]){ act = CActText[act]; text = 1; }
var id = N.Row ? N.Row : N.Def ? "#"+N.Def : N.Kind ? "@"+N.Kind : N.Space ? "@Space" : "@All";
if(id.indexOf(",")>=0){
   id = id.split(",");
   for(var i=1;i<id.length;i++) {
      if(N.Row) N.Row = id[i]; else if(N.Def) N.Def = id[i]; else N.Kind = id[i];
      this.AddText(N,code,1);
      }
   id = id[0];
   }
var I = X[id]; if(!I){ I = {}; X[id] = I; }
var col = N.Col ? N.Col : N.Type ? "@"+N.Type : act=="set" ? "" : "@All";
if(col){ 
   if(col.indexOf(",")>=0){
      col = col.split(",");
      for(var i=1;i<col.length;i++) {
         if(N.Col) N.Col = col[i]; else N.Type = col[i];
         this.AddText(N,code,1);
         }
      col = col[0];
      }
   var C = I[col]; if(!C){ C = {}; I[col] = C; } 
   if(act=="set"){ 
      if(N["V"]) C[act] = N["V"]; 
      else if(N[col]) C[act] = N[col];
      }
   else {
      var V = C[act]; if(!V) { V = {}; C[act] = V; }
      if(text) C.text = 1;
      if(N["N"]){ V[N["N"]] = N["V"]; if(regex) V[N["N"]+"@"] = new RegExp(N["N"],"gi"); }
      var NN = [], p = 0; for(var n in N) if(!CTextAttrs[n]) NN[p++] = n;
      NN.sort(function(a,b){ return N[b].length-N[a].length; });
      for(var i=0;i<NN.length;i++) { var n = NN[i]; V[n] = N[n]; if(regex) V[n+"@"] = new RegExp(n,"i"); }
      
      }
   }
else for(var col in N) if(!CTextAttrs[col]) { 
   var C = I[col]; if(!C){ C = {}; I[col] = C; }
   C[act] = N[col];
   if(text) C.text = 1;
   }
if(!num&&N.Count>1){
   for(var i=1;i<N.Count;i++) {
      for(var n in CTextAttrsN) if(N[n]!=null) N[n] = N[n+i];
      if(!N.Action) N.Action = act;
      this.AddText(N,code,i);
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.Translate = function(row,col,val,type,spec){
var T = this.Trans; if(!T) return val;
if(spec) { val = this.Translate(row,spec,val,type); col += spec; }
if(type==null) type =  typeof(row)=="string" ? "" : this.GetType(row,col);
var II = typeof(row)=="string" ? [row] : [row.Space?"@Space":"@All","@"+row.Kind,"#"+row.Def.Name,row.id], CC = type ? ["@All","@"+type,col] : [col];
if(row.Mirror&&this.Rows[row.Mirror]) {
   if(row.Kind!=this.Rows[row.Mirror].Kind) II.splice(2,0,"@"+this.Rows[row.Mirror].Kind);
   II[II.length] = row.Mirror;
   }
if(Grids.OnTranslate) { var tmp = Grids.OnTranslate(this,row,col,val,type); if(tmp!=null) val = tmp; }
function rep(C,val){
   if(C.replace){
      var R = C.replace; val += "";
      for(var n in R) val = val.replace(R[n+"@"]?R[n+"@"]:n,R[n]);
      }
   if(C.last){
      var R = C.last; val += "";
      for(var n in R) { var idx = val.lastIndexOf(n); if(idx>=0) val = val.slice(0,idx) + R[n] + val.slice(idx+n.length); }
      }
   return val;
   }
for(var i=0,IILen=II.length,CCLen=CC.length;i<IILen;i++){
   var I = T[II[i]]; 
   if(I) {
      for(var j=0;j<CCLen;j++){
         var C = I[CC[j]]; 
         if(C){
            if(C.text&&val.indexOf("<")>=0){
               val = val.split("<");
               for(var k=0;k<val.length;k++){
                  var idx = val[k].indexOf(">");
                  if(idx>=0) {
                     var v = val[k].slice(idx+1);
                     if(C.set) v = C.set;
                     else if(C.change&&C.change[v]!=null) v = C.change[v];
                     else v = rep(C,v);
                     val[k] = val[k].slice(0,idx+1)+v;
                     }
                  }
               val = val.join("<");
               }
            else if(C.set) val = C.set;
            else if(C.change&&C.change[val]!=null) val = C.change[val];
            else val = rep(C,val);
            }
         }
      }
   }
if(Grids.OnTranslated) { var tmp = Grids.OnTranslated(this,row,col,val,type); if(tmp!=null) val = tmp; }
return val;
}
// -----------------------------------------------------------------------------------------------------------
TGP.TranslateMenu = function(row,col,M,type,spec){
if(!this.Trans) return;
if(type==null) type = typeof(row)=="string" ? "" : this.GetType(row,col);
for(var i=0;i<M.Items.length;i++) {
   if(M.Items[i].Items) this.TranslateMenu(row,col,M.Items[i],type,spec);
   if(M.Items[i].Text==null && M.Items[i].Name==null) continue;
   if(M.Items[i].Text==null && M.Items[i].Name.charAt(0)=="-"&& M.Items[i].Name.charAt(M.Items[i].Name.length-1)=="-") M.Items[i].Name = this.Translate(row,col,M.Items[i].Name,type,spec);
   else M.Items[i].Text = this.Translate(row,col,M.Items[i].Text==null?M.Items[i].Name:M.Items[i].Text,type,spec);
   }
if(M.Head) M.Head = this.Translate(row,col,M.Head,type,spec+"Head");
if(M.Foot) M.Foot = this.Translate(row,col,M.Foot,type,spec+"Foot");
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetLanguage = function(code,nosync){
code = (code+"").toUpperCase();
if(!this.Languages[code]||this.Reset&&this.Reset.Language!=null&&this.Reset.Language!=code) return null;
if(Grids.OnSetLanguage && Grids.OnSetLanguage(this,code,nosync)) return true;
this.Language = code;
this.ChangingLanguage = 1;
var T = this; 
function cont(){ 
   T.Trans = T.Text[T.Language];
   for(var r=T.XS.firstChild;r;r=r.nextSibling) if(r.Mirror) { var D = T.Rows[r.Mirror]; for(var n in D) if(r[n] && typeof(r[n])=="string" && D[n] && typeof(D[n])=="string" && !Grids.INames[n]) r[n] = D[n]; }
   for(var n in T.ToTranslate){ var N = T.ToTranslate[n], row = T.Rows[N.Row]; if(row) row[N.Col] = N.Replace ? row[N.Col].replace(N.Replace,T.GetText(N.Text)) : T.GetText(N.Text); }
   MS.Media; T.DefaultMedia(); ME.Media;
   T.CalculateSpaces(0);
   var ret = T.ApplyMedia(1);
   T.SaveCfg();
   if(Grids.OnLanguageSet) Grids.OnLanguageSet(T,code,nosync);
   T.Calculate(0); 
   if(T.Gantt) T.RefreshGantt(254);
   function finish(){ T.ChangingLanguage = 0; if(Grids.OnLanguageFinish) Grids.OnLanguageFinish(T,code,nosync); }
   if(ret==3) T.SetStyle(null,null,null,null,null,!T.Loading,1,1,1,finish);
   else if(ret==2){ this.AfterSetStyle(1,finish); }
   else { if(!T.Loading) T.Render(); finish(); }
   }
if(!nosync&&this.SyncLanguage&&Grids.length>1) for(var i=0;i<Grids.length;i++) {
   var G = Grids[i]; if(G&&G!=this&&!G.Loading&&(G.SyncLanguage==this.SyncLanguage || G.SyncId==this.SyncId&&G.Sync&&G.Sync["language"])&&!G.Hidden) G.SetLanguage(code,1);
   }
if(!this.LoadLanguage(cont,1)) { this.ChangingLanguage = 0; return false; }
cont();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.LoadLanguage = function(func,always){
var L = this.Language; if(this.Reset&&this.Reset.Language!=null) L = this.Reset.Language;
var LL = this.Languages[L]; if(!LL) return null;
var SS = LL.Source; SS = SS ? SS.split(/[+,]/) : ["Text","Base","Layout","Data","Lang"];
var load = 0, p = -1, G = this, D = this.Source;
if(!this.DefaultText) { this.DefaultText = this.Text; this.Text = {}; } 
function copy(S,D){ 
   for(var n in S){ 
      if(typeof(S[n])!="object") D[n] = S[n];
      else {
         if(!D[n]) D[n] = {};
         copy(S[n],D[n]);
         }
      }
   }
function run(result){ 
   MS.Debug; if(result<0) G.Debug(1,"Cannot load TreeGrid language data for ",G.Languages[G.Language].Name," [",G.Language,"] language"); ME.Debug;
   while(1) {
      var s = SS[++p]; 
      if(!s){
         if(result==null) return true;
         copy(G.DefaultText,G.Text);
         if(func) func();
         return false;
         }
      var sl = s.length, S = null;
      for(var n in LL) if(n.slice(0,sl)==s){ 
         if(!S) S = {};
         if(n.length==sl) S.Url = LL[n]; else S[n.slice(sl+(n[sl]=="_"?1:0))] = LL[n];
         }
      if(S) break;
      }
   if(S.Name==null) S.Name = "Language_"+SS[p];
   if(!S.Param) S.Param = {};
   var load = 1, O = D[SS[p]];
   if(O&&!always){
      load = 0;
      for(var n in S){ 
         if(n=="Param") { for(var a in S[n]) if(O[n][a]!=S[n][a]) { load = 1; break; } if(load) break; }
         else if(O[n]!=S[n]&&n!="Name"){ load = 1; break; }
         }
      }
   if(!load) return run(result==null?null:0);
   if(O) for(var n in O){ 
      if(n=="Param") { for(var a in O[n]) if(S[n][a]==null) S[n][a] = O[n][a]; }
      else if(S[n]==null && (n!="Format"||O[n].toLowerCase()!="xlsx")) S[n] = n=="Static" ? "Lang"+O[n] : O[n];
      }
   if(S.Url&&!O.Url&&O.Jsonp) S.Jsonp = null;    
   if(S.Sync==null) S.Sync = D.Sync?1:0;
   if(S.Cache==null && D.Cache!=null) S.Cache = D.Cache;
   if(S.Xml==null && D.Xml!=null) S.Xml = D.Xml;
   if(S.Format==null) S.Format = D.Format ? D.Format : "Internal";
   if(S.Method==null) S.Method = "Get";
   if(S.AlertError==null) S.AlertError = D.AlertError;
   if(!p) { if(S.Relative==null && S.Url) S.Relative = 1; }
   G.ReadData(S,run);
   return false;
   }
return run();
}
// -----------------------------------------------------------------------------------------------------------
ME.Lang;

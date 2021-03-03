// -----------------------------------------------------------------------------------------------------------
if(TGDefNames["TGGrids"]) setTimeout(StartTreeGrid,10);
else AttachEvent(window,"load",StartTreeGrid);
// -----------------------------------------------------------------------------------------------------------
var CDataSources = ["Page","Upload","Export","ExportPDF","Check","Cell"]; 
var CAbsDX = 0, CAbsDY = 0, CDM;
// -----------------------------------------------------------------------------------------------------------
// Main functions for creating all grids on page from <treegrid> tag
// Called from body.onload
function StartTreeGrid(){

MS.Debug; if(Grids.AddTryCatch && TGAddTryCatch()) { StartTreeGrid(); return; } ME.Debug;

var A = document.getElementsByTagName("treegrid");
if(!A.length) A = document.getElementsByTagName("bdo");
var X = [], p = 0, XmlOk = Grids.NoTryActiveX ? -1 : 0;
for(var i=0;i<A.length;i++) if(!A[i].dir || A[i].tagName.toLowerCase()!="bdo") X[p++] = A[i]; 
if(!BSafari && !BOpera){ 
   for(var i in A) if(typeof(A[i])=="object" && (!A[i].dir || A[i].tagName.toLowerCase()!="bdo")) { 
      for(var j=0;j<p;j++) if(X[j]==A[i]) break;
      if(j==p) X[p++] = A[i]; 
      }
   }
A = X;

for(var i=0;i<A.length;i++){
   var T = A[i];               
   if(T.length){               
      A[i] = T[0]; T = A[i];
      for(var j=1;j<T.length;j++) A[A.length] = T[j]; 
      } 
   var M = T.parentNode;       
   if(!T.getAttribute) continue;
   var D = ParseTreeGrid(T);
   var id = T.id;
   
   if(D.Hidden) D.SuppressMessage = 4;
   
   var Err = "";
   if(!XmlOk && window.Requests){
      var Req = Requests.Create();
      if(BIEA && (!Req||typeof(Req)=="string")) Req = Requests.Create(1);
      if(Req && typeof(Req)!="string") XmlOk = 1;
      else XmlOk = -1;
      }
   if(!BIEA && !BMozilla && !BOpera8 && !BOpera && !BSafari){
      Err = "<b style='color:red'>The browser is not supported !</b><br/>TreeGrid supports only these browsers: <br/>Internet Explorer 6.0+, Mozilla/Firefox 1.5+,<br/> Opera 9.0+, Safari 3.0+, Chrome 3.0+<br/>and their clones";
      }
   else if(XmlOk<0 && (D.Text.Url || D.Defaults.Url || D.Layout.Url || D.Data.Url || D.Upload.Url)){
      Err = BIEA ?"The browser has disabled the <b>Security</b> option<br/>'<i>Run ActiveX controls and plug-ins</i>'" : "The browser does not support XmlHttpRequest object (AJAX) !";
      }
   AddMessageStyle();
   if(Err) {
      MS.Message; if(!D.SuppressMessage || D.SuppressMessage<4) ShowMessageCenter(Err,M,"GridErrorMessage"); ME.Message; 
      A[i] = null;
      }
   else {
      if(D.Hidden) M.removeChild(T);
      else if(D.Text && D.Text.Start!="" && !D.SuppressMessage && M.offsetHeight>=40){ MS.Message; ShowMessageCenter(D.Text.Start?D.Text.Start:"Initializing ...",M,"GridMessage",null,D.Text.MessageWidth?D.Text.MessageWidth:140); ME.Message; }
      else M.innerHTML = ""; 
      D.MainTag = M;
      D.id = id;
      A[i] = D;
      }
   }

for(var i=0;i<A.length;i++){
   if(A[i]) TreeGrid(A[i],A[i].MainTag,A[i].id);
   }
}
var TGStartTreeGrid = StartTreeGrid; if(window["StartTreeGrid"]==null||TGDefNames["StartTreeGrid"]) window["StartTreeGrid"] = StartTreeGrid; 
// -----------------------------------------------------------------------------------------------------------
function AddMessageStyle(){
if(Grids.GridMessage) return;
Grids.GridMessage = 1;
var X = document.createElement("div"), bod = "document."+(BIE?"body":"documentElement")+".";
var s = "<br style='display:none;'/><style type='text/css'>"
      + " .GridMessage,.GridErrorMessage{background:white;border:1px solid #AAA;padding:10px;white-space:nowrap;text-align:center;font:13px 'Microsoft Sans Serif',Verdana,Arial;}"
      + " .GridErrorMessage{font-weight:bold;color:red;background:yellow;}";
MS.Debug;
   s += " .GridDebugTag{overflow:auto;overflow-y:scroll;border:1px solid black;background:#DDD;}"
      + " .GridDebugTag,.GridDebugButtons{position:fixed;z-index:256;left:5px;right:5px;bottom:5px;height:200px;padding:4px;position:absolute!IE;left:expression(5+"+bod+"scrollLeft+'px')!IE;width:expression(-18+"+bod+"clientWidth+'px')!IE;top:expression(-213+"+bod+"scrollTop+"+bod+"clientHeight+'px')!IE;}"
      + " .GridDebugButtons{text-align:right;margin-right:25px;width:130px;left:auto;left:expression(-163+"+bod+"clientWidth+'px')!IE;}"
      + " .GridDebugButton{font-size:10px;width:40px;padding:0px;}"
      + " .GridMeasure{overflow:hidden!important;padding:0px!important;margin:0px!important;border:0px none!important;}"
      + " .GridMeasure *{-webkit-box-sizing:content-box!important;-moz-box-sizing:content-box!important;box-sizing:content-box!important;}";

ME.Debug;
   s += "</style>";     
X.innerHTML = s;
X.id = "TreeGridMessageStyle";
var H = document.documentElement.getElementsByTagName("head")[0];
if(!H) { H = document.createElement("head"); document.documentElement.insertBefore(H,document.body); }
if(H.firstChild) H.insertBefore(X,H.firstChild); else H.appendChild(X);
}
// -----------------------------------------------------------------------------------------------------------
function ParseTreeGrid(T){
var D = {};  
var id = T.getAttribute("id"); D.id = id ? id : null; 
var RA = {}, I = document.createElement("I"); for(var i in I) RA[i] = true;

if(BIE5) for(var n in T){ 
   if(RA[n]) continue;
   var N = n.split("_"); 
   var av = T[n]; if(av==null || typeof(av)!="string") continue;
   if((av-0)+""==av) av = av-0;
   if(!N[1]){ D[n] = av; continue; } 
     
   var t = N[0], d = D[t];
   if(!d){ d = { }; D[t] = d; }
   if(!N[2]) d[N[1]] = av; 
   else { if(!d.Param) d.Param = { }; d.Param[N[2]] = av; }
   }
else {
   var B = T.attributes, bl = B.length;
   for(var j=0;j<bl;j++){ 
      var a = B[j], n = a.nodeName; if(RA[n] && n!="hidden" || n=="class") continue; 
      var av = a.nodeValue; if(av==null || typeof(av)=="function" || typeof(av)=="object") continue;
      if((av-0)+""==av) av = av-0;
      var N = n.toLowerCase().split("_");
      for(var k=0;k<N.length;k++)  N[k] = N[k].charAt(0).toUpperCase()+N[k].slice(1); 
      if(!N[1]){ D[N[0]] = av; continue; } 
      var t = N[0];
      if(t=="Exportpdf") t = "ExportPDF"; 
      var d = D[t];
      if(!d){ d = { Param:{} }; D[t] = d; }
      if(!N[2]) d[N[1]] = av; 
      else if(N[1]=="Header"){ if(!d.Header) d.Header = { }; d.Header[N[2]] = av; }
      else { if(!d.Param) d.Param = { }; d.Param[N[2]] = av; }
      }
   }
   
var N = ["BasePath","SuppressMessage","CacheVersion","AlertError","DebugWindow","DebugTag","DebugCheckIgnore"];
for(var i=0;i<N.length;i++){
   var n = N[i].toLowerCase();
   n = n.charAt(0).toUpperCase()+n.slice(1);
   if(D[n]){ D[N[i]] = D[n]; delete D[n]; }
   }

if(D.Text){
   if(D.Text["Starterr"]) D.Text.StartErr = D.Text["Starterr"];
   if(D.Text["Styleerr"]) D.Text.StyleErr = D.Text["Styleerr"];
   if(D.Text["Messagewidth"]) { D.Text["MessageWidth"] = D.Text["Messagewidth"]; delete D.Text["Messagewidth"]; }
   
   }
return D;   
}
// -----------------------------------------------------------------------------------------------------------
if(typeof(self.DLZ)=="string") DLZ=23;
else if(typeof(self.DLZ)=="number") DLZ=19;

// -----------------------------------------------------------------------------------------------------------
// Executive function for StartTreeGrid, cannot be nested due context of local variables

// -----------------------------------------------------------------------------------------------------------
// Main asynchronous function, creates grid, downloads data and renders the grid to tag. id is new grid's id
// tag and id are optional, tag can be given in data, and also id, id can be generated automatically
// R is original grid object on reload, if set, does not create new grid object, but reuses the R
// Returns created TGrid object or null
function TreeGrid(D,tag,id,R){
if(!D) return;

var DbgConflict1 = "", DbgConflict2 = "", DbgConflict3 = "";
if(!Grids.Started && !D.Print) {

   if(!BIEA && !BMozilla && !BOpera8 && !BOpera && !BSafari){ 
      alert("The browser is not supported !");
      return;
      }

   if(BIEA && !BIEVER && !Grids["NoCC"]) try { BIEVER = (new Function('@cc_on return {"5":5,"5.1":5,"5.5":5.5,"5.6":6,"5.7":7,"5.8":8,"9":9,"10":10,"11":11,"12":12,"13":13,"14":14,"15":15,"16":16,"17":17,"18":18,"19":19}[@_jscript_version]'))(); } catch(e) { BIEVER = -1; }; 

   MS.Debug;
   if(!Grids.NoConflicts){
      for(var i=0;i<CGFunc.length;i++) {
         var err = TGDefNames[CGFunc[i]] ? 0 : CGFuncPre[CGFunc[i]] && CGFuncPre[CGFunc[i]] != CGFuncGrid[CGFunc[i]] ? 1 : CGFuncGrid[CGFunc[i]] != window[CGFunc[i]] ? 2 : 0;
         if(!err) continue;
         if(CGFunc[i].slice(0,2)!="TG") DbgConflict3 += (DbgConflict3?", ":"") + CGFunc[i]+" => TG"+CGFunc[i];
         else if(err==1) DbgConflict1 += (DbgConflict1?", ":"") + CGFunc[i];
         else if(err==2) DbgConflict2 += (DbgConflict2?", ":"") + CGFunc[i];
         }
      CGFuncPre = null; CGFuncGrid = null;
      }
   ME.Debug;
   if(Try) { if(window.TGInit) TGInit(); } else if(Catch){ }
   AddMessageStyle();
   Grids.Started = true;
   SetScrollConst();                          
   if(BIEStrict) GetIEZoom();                  
   var A = AbsoluteToWindow(); CAbsDX = A[0], CAbsDY = A[1]; 
   setInterval(GridsScroll,50);                            
   setInterval(GridsHeight,200);                           
   
   MS.Paging$ColPaging$ChildParts; setInterval(GridsRemovePages,5000); ME.Paging$ColPaging$ChildParts; 
   if(BSafari&&!BIPAD) AttachEvent(window,"resize",GridsResize);   
   
   MS.Check; setInterval(GridsCheck,1000); ME.Check;       
   }

if(typeof(D)=="string"){ 
   if(D.search(/^\s*\&lt;(treegrid|bdo)/i)>=0) D = ReplaceEntities(D); 
   if(D.search(/^\s*\<(treegrid|bdo)/i)>=0) {  
      MS.Xml;
      var X = CreateXmlFromString("<main>"+D+"</main>");
      if(!X || !X.firstChild || !X.firstChild.firstChild) return;
      D = ParseTreeGrid(X.firstChild.firstChild); 
      ME.Xml;
      }
   else D = { Data:{ Data:D } };  
   }

MS._Reg;
MX._Reg;
if(D.Cache==null && location.hostname.search(/coq\.cz$|coqsoft\.com$|treegrid\.com$|treegrid\.net$|tgantt\.com$/i)>=0) D.Cache = 1;
ME._Reg;

var G;
if(!R) G = new TGrid();
else if(R.constructor!=TGrid) { 
   if(Object.setPrototypeOf) Object.setPrototypeOf(R,TGP); 
   else if(R["__proto__"]) R["__proto__"] = TGP; 
   else { var N = new TGrid(); for(var n in N) R[n] = N[n]; }
   R.constructor = TGrid; R.Init();
   G = R; R = null;
   }
else G = R;
G.Source = D; G.Data = D; 

MS.Debug;
G.DebugFlags = {"problem":1}; 

if(D.Debug==null || D.Debug==1) D.Debug = "Problem,IOError";
else if(D.Debug==0) D.Debug = "";
else if(D.Debug>2) D.Debug = "Info,IO,Cookie,Page";

G.DebugFlags = G.Debug ? G.ConvertFlags(D.Debug,"error,problem,info,ioerror,io,cookie,page,event,check",0,0,1) : {}; 
var F = G.DebugFlags;

if(F["info"]||F["check"]) F["problem"] = 1;
if(F["problem"]) F["error"] = 1;
if(F["io"]) F["ioerror"] = 1;
D.DebugOrig = D.Debug;
D.Debug = F;
if(F.length) Grids.DebugGrid = G; 

if(DbgConflict2) G.Debug(1,"JavaScript global name conflict! You should rename your objects! Some script overwrote TreeGrid global objects: ",DbgConflict2);
if(DbgConflict1) G.Debug(2,"JavaScript global name conflict! You should rename your objects! TreeGrid overwrote global objects: ",DbgConflict1);
if(DbgConflict3) G.Debug(2,"JavaScript global name conflict! These TreeGrid objects are not accessible for API, because they are defined by another script. Use them with TG prefix: ",DbgConflict3);

ME.Debug;

if(D.Sync==2) { D.Sync = 0; Requests.Sync = 1; }

if(!D.Source) D.Source = "Defaults+Text,Base,Layout;Data";
if(D.Source.indexOf(";")<0) D.Source = D.Source.replace(/(^|,)([^,]*)$/g,";$2");
var S = D.Source.split(";"), dpos = S[S.length-1].split(/[+,]/).length;
var S = D.Source.split(/[,;+]/), X = {}; for(var i=0;i<S.length;i++) X[S[i]] = 1;
S = CDataSources.concat(S); dpos = S.length - dpos;

var json = D.Json; if(json==null) json = window.TGJsonFormat;
if(json==null) {
   var loc = !BIEA&&location.protocol=="file:";
   for(var i=0,N=[];i<S.length;i++) if(D[S[i]]) N[N.length] = D[S[i]];
   for(var i=0;i<N.length;i++) if(N[i].Jsonp) { json = 2; break; }
   if(json==null) for(var i=0;i<N.length;i++) if(N[i].Format&&N[i].Format.toLowerCase()!="json"&&N[i].Format.toLowerCase()!="xlsx" || (N[i].Url ? N[i].Url.search(/\.xml\b/,"i")>=0 : !N[i].Data||loc ? 0 : typeof(N[i].Data)=="string" ? N[i].Data.search(/^\s*<|^\s*&lt;/)>=0 : N[i].Data.Xml ? 1 : 0)) { json = 0; break; }
   if(json==null) for(var i=0;i<N.length;i++) if(N[i].Format&&N[i].Format.toLowerCase()=="json" || (N[i].Url ? N[i].Url.search(/\.js(on)?\b/,"i")>=0 : N[i].Data ? 1 : 0)) { json = 1; break; }
   if(json==null) json = loc ? 2 : 0;
   }
if(json==1&&location.protocol=="file:") json = 2; 
G.Json = json;

for(var i=0;i<S.length;i++){
   var n = S[i];
   if(!D[n]) D[n] = { };
   D[n].Name = n;
   MS.Debug;
   var dbg = D[n].Debug;
   if(dbg==null) dbg = F["io"] && n!="Text" && n!="Defaults" ? {"in":1,"out":1} : {};
   else if(dbg-0+""==dbg) dbg = G.BitArrayToFlags(dbg,"in,out,raw");
   else dbg = G.ConvertFlags(dbg,"in,out,raw");
   D[n].Debug = dbg;
   ME.Debug;
   if(D[n].Sync==null) D[n].Sync = D.Sync?X[n]:0;
   if(D[n].Cache==null && D.Cache!=null) D[n].Cache = D.Cache;
   if(D[n].Xml==null && D.Xml!=null) D[n].Xml = D.Xml;
   if(D[n].Format==null) D[n].Format = D.Format ? D.Format : (D[n].Url&&D[n].Url.search(/.xlsx($|[\?\#\/])/i)>=0 ? "Xlsx" : json ? "Json" : "Internal");
   if(D[n].Method==null && i<dpos) D[n].Method = n=="Page"||n=="Upload"||n=="Export"||n=="ExportPDF"||n=="Cell" ? "Post" : "Get";
   if(!D[n].Param) D[n].Param = {};
   if(D[n].Alerterror==null) D[n].AlertError = D.AlertError;
   else D[n].AlertError = D[n].Alerterror;
   }

// --- Initialization ---
G.MainTag = typeof(tag)=="string" ? GetElem(tag) : tag;
if(id&&typeof(id)=="object"){
   var PR = []; for(var n in id){ G[n] = id[n]; if(n!="id") PR[PR.length] = n; }
   G.KeepReload2 = PR.join(",");
   id = id.id;
   }
if(!id&&!R) id = D.id;
if(id) {  
   if(id-0+""==id){ MS.Debug; G.Debug(2,"Grid id '",id,"' cannot be set to number"); ME.Debug; id = null; }
   else if(Grids[id]){ MS.Debug; G.Debug(2,"Grid with id '",id,"' already exists or collides with some internal name"); ME.Debug; id = null; }
   else G.id = id;
   }
if(Grids.OnInit && Grids.OnInit(G,R?1:0)) return null;
if(!R){ G.Index = Grids.length; Grids[G.Index] = G; } 
if(id) Grids[id] = G; 
G.OrigId = G.id; 
if(D.SuppressMessage!=null) G.SuppressMessage = D.SuppressMessage;
if(!G.SuppressMessage) G.SuppressMessage = 0;
G.Hidden = D.Hidden; if(G.Hidden) G.SuppressMessage = 4;

G.Lang.Text = {"StartErr" : D.Text&&D.Text.StartErr?D.Text.StartErr:"Fatal error ! <br/>TreeGrid cannot load" };
G.Lang.Alert = {"StyleErr": D.Text&&D.Text.StyleErr?D.Text.StyleErr:"Fatal error !\nTreeGrid cannot load" };
G.Cache = D.Cache; G.CacheVersion = D.CacheVersion; G.DebugWindow = D.DebugWindow; G.DebugTag = D.DebugTag; G.DebugCheckIgnore = D.DebugCheckIgnore;
G.Loading = 1;
G.Print = D.Print;

MS.Check;
var A = G.Source.Check;
if(A.Interval==null) A.Interval = 5;
if(A.Timeout==null) A.Timeout = 0;
if(A.Repeat==null) A.Repeat = 3;
ME.Check;

MS.Debug; 
if(window._5T2 && window._5T4){
   var beg = window.GridEStart;
   G.Debug(4,"TreeGrid script loaded in ",_5T4-(beg?beg:_5T2),"ms (load: ",beg?(_5T2-beg):"(GridEStart not set)"," ms, parse: ",_5T3-_5T2," ms, run: ",_5T4-_5T3," ms)"); 
   G.Debug(4,"");
   _5T2 = null;
   }
G.Debug(4,"++++++++++ Starting TreeGrid ++++++++++"); 
G.StartTimer("TreeGrid");
G.StartTimer("AllData");
if(G.ReloadIndex==null) G.DebugTreeGrid(D);
ME.Debug;

if(D.BasePath) G.Path = D.BasePath;

if(!G.Path){
   var name = /([\\\/]|^)GridE(Src)?\.js($|\?|\#)/i;
   
   var S = document.documentElement.getElementsByTagName("script");
   for(var i=0;i<S.length;i++){
      if(S[i].src && S[i].src.search(name)>=0){ G.Path = S[i].src; break; } 
      }
   if(!G.Path){
      for(var i=0;i<S.length;i++){
         if(S[i].src){ G.Path = S[i].src; break; } 
         }
      }
   }
if(G.Path) {
   G.Path = G.Path.replace(/[^\\\/]*$/,"");
   if(window["TGPath"]) G.Path += window["TGPath"]; 
   }

var S = D.Source.split(";"), dpos = S[S.length-1].split(",").length;
var S = D.Source.split(/[,;]/); dpos = S.length - dpos;
var O = {G:G,D:D,S:S,DPos:dpos,Pos:0,Cnt:1,Cfg:false,Mess:1,Ok:0}

function run(result){
   if(this!=window) O = this; 
   var G = O.G;
   if(!G.Loading) return; 
   
   if(result<0 || !(self.DLZ>20)){
      MS.Debug; G.Debug(0,"Cannot load TreeGrid source data"); ME.Debug;
      G.ShowStartErr();
      MS._Debug; if(window["TGPath"]!=null) G.ShowStartErr("Fatal Error!<br/>Set correct TGPath in GridESrc.js file"); ME._Debug;
      return;
      }
   
   if(--O.Cnt) return; 
   while(!O.D[O.S[O.Pos]] && i<O.S.length) O.Pos++;
   if(O.Pos==O.S.length){ 
      if(O.Ok) G.AfterLoad(O.Cfg); 
      else {
         MS.Debug;
         G.Debug(0,"No data source defined");
         G.Debug(1,"Set at least one data source attribute in <treegrid>:"," Data_Url, Data_Tag, Data_Data, Layout_Url, Layout_Tag, Layout_Data");
         ME.Debug;
         G.ShowStartErr();
         }
      return; 
      }
   MS.Message; 
   if(!G.SuppressMessage && !O.D.Sync) {
      if(O.Pos>=O.DPos) ShowMessageCenter(G.GetText("Load"),G.MainTag,"GridMessage",null,G.MessageWidth);
      else if(O.Mess && G.Lang.Text.Layout) { O.Mess = 0; ShowMessageCenter(G.GetText("Layout"),G.MainTag,"GridMessage",null,G.MessageWidth); }
      }
   ME.Message;
   if(O.Pos>=O.DPos){
      if(G.ColNames[1] && G.ColNames[1].length){ 
         if(G.OrigId) G.id = G.OrigId; 
         G.UpdateCfg(); 
         O.Cfg = true; 
         }
      O.DPos = 1000;
      }
   var SS = O.S[O.Pos++].split("+"); O.Cnt = SS.length;
   for(var i=0;i<SS.length;i++){ 
      var s = SS[i], Q = O.D[s];
      if(!Q.Url && !Q.Tag && !Q.Data && !Q.Script && !Q.Jsonp && !Q.File) { 
         if(s=="Text"&&Q.Url!=="") { Q.Static = "Text"; Q.Url = json ? "Text.js" : "Text.xml"; if(Q.Relative==null) Q.Relative = 1; }
         else if(s=="Defaults"&&Q.Url!=="") { Q.Static = "Defaults"; Q.Url = json ? "Defaults.js" : "Defaults.xml"; if(Q.Relative==null) Q.Relative = 1; } 
         else { MS.Debug; G.Debug(4,"No ",s," data source defined, skipped loading ",s); ME.Debug; run(0); continue; }
         }
      else O.Ok++;
      if(Q.Method==null) Q.Method = G.Paging==3 ? "Post" : "Get";
      G.ReadData(Q,run);
      }
   }
if(run.bind) O.run = run.bind(O); 
O.run = run;
O.run();
return G;
}
var TGTreeGrid = TreeGrid; if(window["TreeGrid"]==null||TGDefNames["StartTreeGrid"]) window["TreeGrid"] = TreeGrid;

// --- Loads defaults and continues ---

// -----------------------------------------------------------------------------------------------------------
// Continue LoadData()
TGP.AfterLoad = function(cfgloaded,recur){

if(!recur){

   if(this.OrigId) this.id = this.OrigId;   
   else if(this.id-0+""==this.id){ MS.Debug; this.Debug(2,"Grid id '",this.id,"' cannot be set to number"); ME.Debug; this.id = null; }
   else if(Grids[this.id]){ MS.Debug; this.Debug(2,"Grid with id '",this.id,"' already exists or collides with some internal name"); ME.Debug; this.id = null; }
   var Test = "pone", Test2 = "TGC", id = "Table"+this.Index++; 
   if(!this.id) this.id = id; 
   Grids[this.id] = this;
   if(!this.MainTag && this.Tag) this.MainTag = GetElem(this.Tag);
   if(this.Hidden) {
      MS.Message; if(!this.SuppressMessage) ShowMessageCenter(this.GetText("LoadedHidden"),this.MainTag,"GridMessage",null,this.MessageWidth); ME.Message;
      this.MainTag = null;
      }
   else if(!this.MainTag) {
      this.SetStyle();
      MS.Debug; 
      this.Debug(0,"No Main Tag defined"); 
      this.Debug(1,"Main Tag is a parent tag where TreeGrid will be shown"); 
      ME.Debug;
      this.ShowStartErr(); 
      return; 
      }
   
   var C = new Function("return this;")()[Test2+"om"+Test+"nt"], Q = {"Ne":4,"Pe":"ar","As":8,"Ut":"de","Te":4,"Sa":"At","Ro":3,"Ty":"Co","Rr":5,"Er":"ch"}, S = 6611, E = "ErPeTyUtSa", f = ""; 
   if(C) {
      for(var i=0;i<E.length;i+=2) f += Q[E.slice(i,i+2)];
      for(var c in C) { var d = Q[c.slice(0,1)+c.slice(-1)]; if(d-0) for(var i=1;i<=C[c].length;i++) if(i%d) S -= C[c][f](i-1); }
      }
   
   this.This = "TGGrids["+(this.Index+S)+"]"; 
   if(!Grids[this.Index+S]) { this.ShowStartErr(); return; }  

   MS.Sync;
   this.Sync = this.Sync ? this.ConvertFlags((this.Sync+"").search(/all/i)<0?this.Sync:"sort,filter,group,search,cols,sec,style,"+this.Sync,"all,sort,filter,group,search,cols,sec,vert,horz,horz0,horz1,horz2,style,zoom") : {};
   ME.Sync;

   this.Index--;   
   if(!cfgloaded) this.UpdateCfg(); 
   else this.UpdateCols(); 

   MS.Scale; if(this.Scale) this.SetScale(this.Scale,1,1,1); ME.Scale;
   if(this.Size) this.SetSize(this.Size,1,1,null,1);
   if(this.Contrast) this.SetContrast(this.Contrast,1,1,null,1);
   if(!this.Hidden && self['_'+5+'T'+4]) this.SetStyle(); 

   // --- Languages ---
   MS.Lang;
   if(this.SyncLanguage&&Grids.length>1) for(var i=0;i<Grids.length;i++) { 
      var G = Grids[i]; 
      if(G&&G!=this&&!G.Loading&&(G.SyncLanguage==this.SyncLanguage || G.SyncId==this.SyncId&&!G.Loading&&G.Sync&&G.Sync["language"])) { this.Language = G.Language; break; }
      }
   var LL = this.Languages, L = this.Language; if(this.Reset&&this.Reset.Language!=null) L = this.Reset.Language;
   if(LL && typeof(LL)=="string") { LL = FromJSON(LL); this.Languages = LL; }
   var G = this; if(LL && LL[L] && !this.LoadLanguage(function(){ 
      
      G.AfterLoad(0,1); 
      })) return;
   ME.Lang;
   }

MS.Debug; 
if(this["DefaultsVersion"]!=DefaultsVersion) this.Debug(1,"Loaded Defaults.xml from different TreeGrid version, it can cause problems or errors. Always use (or modify) Defaults.xml shipped with the actual GridE.js.");
if(!(this["TextVersion"]>=TextVersion)) this.Debug(2,"Loaded Text.xml from old TreeGrid version, some texts can be missing.");
this.Debug(4,"TreeGrid data loaded successfully in ",this.EndTimer("AllData")," ms"); 
ME.Debug;

var ret = null, sync = this.Source.Sync, T = this;
function update(){ T.UpdateGrid(sync); }
if(this.Source.OnLoaded && this.Source.OnLoaded.apply(this,[update])) ret = 1;
if(Grids.OnLoaded && Grids.OnLoaded(this,update)) ret = 1;

// --- sets Upload ---
MS.Upload;
MS.Submit;
if(this.Source.Upload.Tag && this.ReloadIndex==1){
   var I = this.GetInput(this.Source.Upload.Tag), F = this.GetForm(I);
   if(F){
      if(F.onsubmit) this.FormSubmit = F.onsubmit;
      F.onsubmit = new Function("e","return "+this.This+".Save(e?e:window.event);");
      }
   }
ME.Submit;
ME.Upload;

// --- Test id separator ---
this.Sep = this.TestIds ? this.TestIdSeparator : '-';

// --- MaxHeight ---

MS.MaxHeight; this.SetArea(); ME.MaxHeight;

// --- Media ---
if(this.Media.length) {
   this.SetMediaTag();
   this.ApplyMedia();
   }

// --- Update and grid display ---
if(!this.Hidden && !this.SuppressMessage) this.MainTag.innerHTML = ""; 
if(this.Source.Sync) { if(!ret) this.UpdateGrid(1); }
else {
   MS.Message; 
   if(!this.SuppressMessage) {
      if(this.Img.Loaded) this.ShowMessage(this.GetText("UpdateValues"));
      else ShowMessageCenter(this.GetText("UpdateValues"),this.MainTag,"GridMessage",null,this.MessageWidth);
      }
   ME.Message;       
   if(!ret) setTimeout(update,10);
   }
}
// -----------------------------------------------------------------------------------------------------------
// Shows error on start
TGP.ShowStartErr = function(text,nostyle){

if(!nostyle) this.SetStyle();
this.HideMessage();
MS.Message;
if(this.MainTag && this.SuppressMessage<4) {
   if(this.MainTag.offsetHeight<40) this.MainTag.style.height="50px";
   ShowMessageCenter(text?text:this.GetText("StartErr"),this.MainTag,"GridErrorMessage");
   }
ME.Message;    
if(Grids.OnLoadError&&!text) Grids.OnLoadError(this);
this.CheckInterval = null; 
this.Loading=0;
MS.MaxHeight; DelArea(this.MainTag); ME.MaxHeight; 
this.Disabled = 1;
}
// -----------------------------------------------------------------------------------------------------------
// Deletes grid from Grids
MS.Api;
TGP.DelIdentity = function(){
Grids[this.Index] = null;
Grids[this.id] = null;
this.Loading = 0;      
this.Rendering = 0;    
}
ME.Api;
// -----------------------------------------------------------------------------------------------------------
// Updates grid configuration
TGP.UpdateCfg = function(){

MS.Sort;
if(this.DefaultSortCol) this.DefaultSort = this.DefaultSortCol; 
if(this.SortCols && this.Sort==null) {                          
   if(this.SortTypes){
      var sc = this.SortCols.split(","), st = (this.SortTypes+"").split(",");
      for(var i=0;i<sc.length;i++) if(st[i]&1) sc[i] = "-"+sc[i];
      this.Sort = sc.join(",");
      }
   else this.Sort = this.SortCols;   
   }
if(!this.Sort) this.Sort = "";
this.OrigSort = this.Sort;
ME.Sort;

MS.Group;
if(this.GroupCols && this.Group==null) this.Group = this.GroupCols;   
if(!this.Group) this.Group = "";
ME.Group;

MS.Resize;
if(this.ResizingMain && this.MainTag && !this.Hidden){
   this.MainTagOrigWidth = this.MainTag.style.width;
   this.MainTagOrigHeight = this.MainTag.style.height;
   }
ME.Resize;

MS.Panel;
if(this.HidePanel) this.Cols.Panel.Visible = 0; 
ME.Panel;

// --- Updates col defaults and fills Gantt and GanttCols ---
this.UpdateCols();

// --- Saves default values for media ---
MS.Media; if(this.Media.length) this.DefaultMedia(); ME.Media;

MS.Cfg;
if(!this.Print) {
   if(!this.Version && !this.Cookie && this.AutoVersion && this.SuppressCfg!=3) {
      
      var cfg = this.SaveCfg(1,2), hash = 0;
      for(var i=0;i<cfg.length;i++) hash += cfg.charCodeAt(i)*(i+10);
      if(this.Version-0) hash += this.Version;
      while(hash>0x7FFFFFFF) hash = Math.floor(hash/2);
      this.Version = hash;
      }
   if(this.DefaultCfg&1) this.DefaultCfg1 = this.SaveCfg(1,1);
   this.LoadCfg(this.Cookie);
   if(this.DefaultCfg&2 && !(this.SuppressCfg&1)) this.DefaultCfg2 = this.SaveCfg(1,1);
   }
ME.Cfg;

var Ses;
if(this.SaveSession==1 && Grids.GetCfg) Ses = Grids.GetCfg(this.id+"&"+(this.SessionId?this.SessionId:"Session"));
else {
   var sid = this.SaveSession ? this.SaveSession : this.id+"_"+(this.SessionId?this.SessionId:"Session");
   var E = GetElem(sid);
   if(E) Ses = E.value;
   }
if(Ses) this.Source.Session = Ses;
}
// -----------------------------------------------------------------------------------------------------------
TGP.AddPath = function(name){
if(!name) return this.Path;
name += "";
if(name.search(/^\s*\w{1,10}\:\/\/|^\s*javascript\:|^\s*\//i)==0) return name; 
return this.Path + name;
}
// -----------------------------------------------------------------------------------------------------------

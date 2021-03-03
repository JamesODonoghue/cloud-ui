var Requests = null;
MS.Ajax;
// -----------------------------------------------------------------------------------------------------------
var Requests = [], TGRequests = Requests; if(window["Requests"]==null) window["Requests"] = Requests; 
Requests.Count = 0; 

// -----------------------------------------------------------------------------------------------------------
var TAjax = {
   Url : null,      
   
   Method : null,   
                    
   Sync : 0,        
   ReturnXml:0,     
   Xml : 0,         
   Param : { },     
   Params : "",     
   Header : null,   
   Timeout : 60,    
   Repeat : 1,        
   RepeatText : "", 
   RepeatError: "", 
   Envelope : "",   
   Namespace: "",   
   Function : "",   

   _nope:0};

// -------------------------------------------------------------------------------------------------
//          -2 bad URL, data1 is exception text
//          -3 URL not found, data1 is exception text or data1 is status and data2 is statusText
//          -4 empty document returned
//          -6 timeout expired
function AjaxCall(D, Data, Func, noalert){
if(!D) {
   if(Func) Func(-1); 
   return;
   }
if(typeof(D)=="string") D = { Url:D };
D.Xlsx = D.Format && D.Format.toLowerCase()=="xlsx";
if(D.Script) {
   var s = D.Script; s = s.replace(/\bjavascript\:\:?\b/i,""); if(s.search(/\breturn\b|[\{\;]/)<0) s = "return "+s;
   if(Try) {
      var F = new Function("Grid","Designer","Source","Func","Data",s);
      }
   else if(Catch){
      MS.Debug; if(D.Grid) D.Grid.Debug(1,"Parsing "+D.Name+"_Script (",s,") failed with error ",e); ME.Debug;
      if(Func) Func(-2,null,D);
      return;
      }
   if(Try){
      var ret = F(D.Grid,D.Designer,D,Func,Data);
      if(typeof(ret)=="string"||ret&&ret!==true&&typeof(ret)=="object") Func(0,ret,D);
      }
   else if(Catch){
      MS.Debug; if(D.Grid) D.Grid.Debug(1,"Running "+D.Name+"_Script (",s,") failed with error ",e); ME.Debug;
      if(Func) Func(-4,null,D);
      }
   return;
   }
if(!D.Url&&!D.Jsonp) {
   if(D){
      if(D.Designer && Designers.OnDataError) Designers.OnDataError(D.Designer,D,-1);
      else if(D.Grid && Grids.OnDataError) Grids.OnDataError(D.Grid,D,-1);
      MS.Debug; if(D.Grid) D.Grid.Debug(1,"No "+D.Name+"_Url set in <treegrid> tag"); ME.Debug;
      }
   if(Func) Func(-1,null,D); 
   return;
   }
if(D.Sync == null) D.Sync = Func ? 0 : 1;
if((!D.Sync && Requests.Sync || D.Jsonp) && Requests.Count){
   if(!Requests.Queue) Requests.Queue = [];
   Requests.Queue.push([D,Data,Func]); 
   return;
   }

for(D.id=0;Requests[D.id];D.id++);
Requests[D.id] = D;
Requests.Count++;
D.This = "TGRequests["+D.id+"]";
for(var i in TAjax) if(D[i]==null) D[i] = TAjax[i];
if(!Requests.Interval) Requests.Interval = setInterval(Requests.Timeout,500); 
D.Orig = Data; 

MS.Debug; 
if(D.Debug && D.Debug["out"]){ 
   if(!Data) D.Grid.Debug(3,"AJAX for ",D.Name+"_Url='"+(D.Jsonp ? D.Jsonp : D.Url)+"'",": No request XML to send");
   else D.Grid.DebugData(D,Data,"a request XML to send to server:");
   }
ME.Debug; 

if(D.Relative && D.Grid){
   if(D.Jsonp) D.Jsonp = D.Grid.AddPath(D.Jsonp);
   else D.Url = D.Grid.AddPath(D.Url);
   }

var content = "", paket = "";
var name = D.Data; if(!name) name = "Data";
var met = D.Method?(D.Method+"").toLowerCase():null; if(!met) met = Data?"form":"get"; if(met=="post") met = "form";
if(Data && !D.Xml) Data = (Data+"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
if(met=="soap"){ 
   var prefix = "soap";
   paket = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
   if(D.Envelope) {
      paket = D.Envelope;
      var M = paket.match(/^\<(\w*)\:/);
      if(M && M[1]) prefix = M[1];
      }
   paket += "<"+prefix+":Body><"+D.Function+(D.Namespace ? " xmlns='"+D.Namespace+"'>" : "");
   if(name) paket += "<"+name+">" + Data + "</"+name+">";
   if(D.Param) for(var i in D.Param) if(D.Param[i]!=null) paket+= "<"+i+">"+D.Param[i]+"</"+i+">"; 
   if(D.Params) paket += D.Params;
   paket += "</"+D.Function+"></"+prefix+":Body></"+prefix+":Envelope>";
   content = "text/xml";
   }
else if(D.Files&&!D.Jsonp&&(!BIEA||BIEA10)){
   paket = new FormData();
   if(D.Param) for(var i in D.Param) if(D.Param[i]!=null) paket.append(i,D.Param[i]); 
   for(var i in D.Files) if(D.Files[i]!=null) paket.append(i,D.Files[i]); 
   
   if(name) paket.append(name,Data); 
   content = " ";
   }
else { 
   if(D.Param) for(var i in D.Param) if(D.Param[i]!=null) paket += (paket?"&":"") + encodeURIComponent(i) + "=" + encodeURIComponent(D.Param[i]); 
   if(D.Params) paket += (paket?"&":"") + encodeURI(D.Params); 
   if(met=="form"){
      if(name) paket += (paket?"&":"") + encodeURIComponent(name) + "=" + encodeURIComponent(Data); 
      content = "application/x-www-form-urlencoded";
      }
   }

// --- Jsonp ---
if(D.Jsonp){
   D.Busy = (new Date()).getTime()+(D.Timeout>=0?(D.Timeout?D.Timeout*1000:1e10):60000);
   D.Func = Func;
   var S = document.createElement("script");
   var url = D.Jsonp;
   if(paket) { url = url+((url+"").indexOf('?')>=0 ? "&" : "?") + paket; paket = ""; }
   if(D.Grid) url = D.Grid.GetUrl(url,D.Cache);
   S.src = url;
   
   document.documentElement.firstChild.appendChild(S);
   return;
   }

MS.Debug; 
if(D.Debug && D.Debug["raw"] && Data){
   if(!paket) D.Grid.Debug(3,"AJAX for ",D.Name+"_Url='"+D.Url+"'",": No request was finally sent because of setting Method=","Get"); 
   else D.Grid.DebugData(D,paket,"a request sent to server:");
   }

ME.Debug;

var Ret;
if(!Func && D.Sync){
   Func = function(code,data) { Ret = code<0 ? code : data; }
   }
   
var Req = Requests.Create();
D.Req = Req;
D.Busy = (new Date()).getTime()+(D.Timeout>=0?(D.Timeout?D.Timeout*1000:1e10):60000);
D.Func = Func;
if(noalert) D.NoAlert = 1;

var fflocal = 0;
D.ASync = 0;
if(Try) {
   Req.onreadystatechange = new Function("if("+D.This+")"+D.This+".Finish();");
   var url = D.Url;
   if(met=="get"){ 
      if(paket) { url = url+((url+"").indexOf('?')>=0 ? "&" : "?") + paket; paket = ""; }
      if(D.Grid) url = D.Grid.GetUrl(url,D.Cache);
      }
   
   try { Req.open(content ? "POST" : "GET", url, D.Sync ? false : true); }
   catch(ee){
      
 if(BIEA && window.XMLHttpRequest){
         D.Req = Requests.Create(1); 
         if(D.Req) D.Req.onreadystatechange = Req.onreadystatechange;
         Req = D.Req;
         try { Req.open(content ? "POST" : "GET", url, D.Sync ? false : true); }
         catch(ee) { 
            if(BIEA && !content && met=="get" && location.protocol=="file:" && D.Url.indexOf("p://")<0){ 
               
               D.Req = new ActiveXObject("Microsoft.XMLDOM");
               if(D.Req){ 
                  D.Req.async = "false"; 
                  D.Req.onreadystatechange = new Function("if("+D.This+")"+D.This+".Finish();");
                  D.Req.load(url); 
                  
                  return Ret;
                  }
               }
            }
         }
      throw(ee); 
      }
   if(D.Xlsx){
      if(!BIEA||BIEA10) Req.responseType = "arraybuffer";
      
      }
   if(content&&content!=" ") Req.setRequestHeader("Content-Type",content+"; charset=UTF-8");
   if(met=="soap") Req.setRequestHeader("SOAPAction",(D.Namespace ? D.Namespace+"/" : "")+D.Function);
   if(D.Header) for(var n in D.Header) Req.setRequestHeader(n,D.Header[n]);
   } 
else if(Catch){ 
   if(D.Designer && Designers.OnDataError) Designers.OnDataError(D.Designer,D,-2,e.message?e.message:e);
   else if(D.Grid && Grids.OnDataError) Grids.OnDataError(D.Grid,D,-2,e.message?e.message:e);
   MS.Debug; if(D.Grid) D.Grid.Debug(1,"Cannot access the ",D.Name+"_Url='"+D.Url+"'",", exception raised: ",e.message?e.message:e); ME.Debug;
   if(Func) Func(-2,e.message?e.message:e,D); 
   return; 
   }

try { Req.send(paket); } 
catch(e){
   if(!D.NoAlert){
      if(!BIEA && !content && met=="get" && window.Grids && !Grids.LocalAlert) { 
         MS._Debug;
         document.location.href = document.location.href.replace(/file\:\/\/\/s\:/i,"http://localhost/tgt");
         return;
         ME._Debug;
         if(location.protocol=="file:") alert((BFF3?"Firefox":(BChrome?"Chrome":(BOpera?"Opera":"Safari")))+" unfortunately cannot load files from local file system by AJAX.\nYou need to run TreeGrid from any HTTP server, even localhost.\nOr use TreeGrid JSONP format and communication instead of AJAX.\nOr use Internet Explorer.");
         Grids.LocalAlert = 1;
         }
      if(!D.Req) return; 
      if(D.Designer && Designers.OnDataError) Designers.OnDataError(D.Designer,D,-3,e.message?e.message:e);
      else if(D.Grid && Grids.OnDataError) Grids.OnDataError(D.Grid,D,-3,e.message?e.message:e);
      MS.Debug; if(D.Grid) D.Grid.Debug(1,"Cannot access the ",D.Name+"_Url='"+D.Url+"'",", exception raised: ",e.message?e.message:e); ME.Debug;
      }
   D.Delete();
   if(Func) Func(-3,e.message?e.message:e,D); 
   return Ret;
   } 
if(D.Sync && Requests[D.id]) D.Finish(); 
D.ASync = 1;

return Ret;
}
var TGAjaxCall = AjaxCall; if(window["AjaxCall"]==null) window["AjaxCall"] = AjaxCall; 
// -------------------------------------------------------------------------------------------------
// Ajax finalization
TAjax.Finish = function(async){
var Req = this.Req;
if(!Req || Req.readyState!=4) return; 
var D = this, Func = this.Func, st = 0;
if(!async && !this.ASync && !this.Sync){ setTimeout(function(){ D.Finish(1); },10); return; } 
if(Try) { st=Req.status; } else if(Catch){ } 
this.Req = null; 

if(st==0){
   if(this.Busy<0){ 
      MS.Debug; if(this.Grid) this.Grid.Debug(2,"Timeout ("+(D.Timeout>=0?D.Timeout:60)+" sec) expired when accessing the ",D.Name+"_Url='"+(D.Jsonp?D.Jsonp:D.Url)+"'"); ME.Debug;
      if(this.Designer && Designers.OnDataError) Designers.OnDataError(this.Designer,this,-6);
      else if(this.Grid && Grids.OnDataError) Grids.OnDataError(this.Grid,this,-6);
      this.Delete();
      if(this.Repeat==3 || this.Repeat==2 && confirm(this.RepeatText)) {
           AjaxCall(this,this.Orig,Func); 
         return;
         }
      if(this.Repeat==0 && this.RepeatError) alert(this.RepeatError);   
      MS.Debug; if(this.Grid) this.Grid.Debug(1,"Timeout ("+(D.Timeout>=0?D.Timeout:60)+" sec) expired when accessing the ",D.Name+"_Url='"+(D.Jsonp?D.Jsonp:D.Url)+"'",", communication failed"); ME.Debug;
      if(Func) Func(-6,null,D);
      Requests.ProcessQueue();
      return;
      }
   }

else if(st<100 || st>=400){
   var txt = Req.statusText, html = ""; try { html = Req.responseText; } catch(e) { }
   
   if(this.Designer && Designers.OnDataError) Designers.OnDataError(this.Designer,this,st,txt,html);
   else if(this.Grid && Grids.OnDataError) Grids.OnDataError(this.Grid,this,st,txt,html);
   MS.Debug;
   if(this.Grid){
      this.Grid.Debug(1,"Error in communication with server from ",D.Name+"_Url='"+D.Url+"'"," ! Server response: ","["+st+"] "+txt);
      if((this.Grid.DebugFlags["ioerror"] || D.Debug && D.Debug["in"]) && html) this.Grid.DebugData(D,html,"a response XML got from server:");
      }
   ME.Debug;
   this.Delete();
   if(Func) Func(-3,"["+st+"] "+txt,D);
   Requests.ProcessQueue();
   return;
   }

var txt;
if(D.Xlsx){
   if(!BIEA||BIEA10) txt = Req.response;
   else {
      if(!Requests.GetBinary){ 
         execScript("Function VB_CStr(B)\nVB_CStr=CStr(B)\nEnd Function\nFunction VB_Chr(B)\nDim l:l=LenB(B):If l Mod 2 Then:VB_Chr=Chr(AscB(MidB(B,l,1))):Else:VB_Chr=\"\":End If\nEnd Function","vbscript");
         var A = {}; Requests.BinaryTable = A;
         for(var i=0;i<256;i++) for(var j=0;j<256;j++) A[String.fromCharCode(i+(j<<8))] = String.fromCharCode(i) + String.fromCharCode(j);
         Requests.GetBinary = new Function("B","A","return VB_CStr(B).replace(/[\\s\\S]/g,function(match){return A[match];})+VB_Chr(B);");
         }
      txt = Requests.GetBinary(Req.responseBody,Requests.BinaryTable);
      }
   }
else txt = Req.responseText;
if(!txt && BIEA && st==null) txt = Req.xml; 
if(!txt){ 
   if(!this.NoAlert){
      MS.Debug; if(this.Grid) this.Grid.Debug(1,"Empty xml received from server from ",D.Name+"_Url='"+D.Url+"'"); ME.Debug;
      if((BChrome||BOpera) && location.protocol=="file:" && window.Grids && !Grids.LocalAlert){
         MS._Debug;
         document.location.href = document.location.href.replace(/file\:\/\/\/\w\:/i,"http://localhost/tgt");
         return;
         MX._Debug;
         alert((BChrome?"Google Chrome":"Opera")+" unfortunately cannot load files from local file system, it is the browser's \"feature\".\nYou need to run TreeGrid from any HTTP server, even localhost.\nOr use Internet Explorer.");
         Grids.LocalAlert = 1;
         ME._Debug;
         }
      
      if(this.Designer && Designers.OnDataError) Designers.OnDataError(this.Designer,this,-5,null,"");
      else if(this.Grid && Grids.OnDataError) Grids.OnDataError(this.Grid,this,-5,null,"");
      }
   this.Delete();
   if(Func) Func(-5,null,D);
   Requests.ProcessQueue();
   return;
   }
MS.Debug; if(this.Grid && D.Debug && D.Debug["in"] && (D.Name!="Check"||txt.search(/^\s*<Grid><IO\s+Result=['"]0['"]\s+(Message\s*=\s*['"][^'"]*["'])\s*\/>\s*<\/Grid>\s*$/)<0)) this.Grid.DebugData(D,txt,"a response XML got from server:"); ME.Debug;

this.Delete();
if(Func) Func(0,txt,D,this.ReturnXml?Req.responseXML:null);
Requests.ProcessQueue();
}
// -------------------------------------------------------------------------------------------------
TAjax.Delete = function(){
this.Req = null;
delete Requests[this.id];
this.id = null;
Requests.Count--;
}
// -------------------------------------------------------------------------------------------------
Requests.ProcessQueue = function(){
if(Requests.Queue && !Requests.Count && Requests.Queue.length){
   var A = Requests.Queue.shift();
   AjaxCall(A[0],A[1],A[2]);
   }
}
// -------------------------------------------------------------------------------------------------
// Called in interval for checking all requests for timeout
Requests.Timeout = function (){
var t = (new Date()).getTime();
for(var i=0;i<Requests.length;i++){
   if(Requests[i] && Requests[i].Busy>0 && Requests[i].Busy<t){ 
      Requests[i].Busy = -1; 
      if(Requests[i].Req) Requests[i].Req.abort(); 
      else if(Requests[i].Jsonp){
         Requests[i].Req = {readyState:4,status:0};
         Requests[i].Finish();
         }
      }
   }
}
// -------------------------------------------------------------------------------------------------
Requests.Create = function(activex){
if(window.XMLHttpRequest && !activex) return new XMLHttpRequest(); 
if(window.ActiveXObject){ 
   if(Requests.XmlHttpActiveX) return new ActiveXObject(Requests.XmlHttpActiveX);
   var Err, Act = ["Msxml3.XMLHTTP","Msxml2.XMLHTTP","Microsoft.XMLHTTP"];
   for(var i=0;i<Act.length;i++){
      try { 
         var Req = new ActiveXObject(Act[i]); 
         Requests.XmlHttpActiveX = Act[i];
         return Req;
         }
      catch(e) { Err = e.message; }
      }
   return Err;
   }
return null;
}
// -------------------------------------------------------------------------------------------------
function TreeGridLoaded(Data){
var R = Requests[0];
if(!R) return;

R.Delete();
if(R.Func) R.Func(0,Data,R);
Requests.ProcessQueue();
}
var TGTreeGridLoaded = TreeGridLoaded; if(window["TreeGridLoaded"]==null) window["TreeGridLoaded"] = TreeGridLoaded; 
// -------------------------------------------------------------------------------------------------
DesignerLoaded = TreeGridLoaded;
var TGDesignerLoaded = DesignerLoaded; if(window["DesignerLoaded"]==null) window["DesignerLoaded"] = DesignerLoaded;
// -------------------------------------------------------------------------------------------------
ME.Ajax;


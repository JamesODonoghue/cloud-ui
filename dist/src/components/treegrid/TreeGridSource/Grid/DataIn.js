// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
var CNodeSec = {"LeftCols":0,"Cols":1,"RightCols":2}; 
// -----------------------------------------------------------------------------------------------------------
// Updates XML to begin with <Grid>, optionaly replaces entities, if it was coded
// Return null for error (no tag <Grid>)
TGP.PrepareData = function(Xml,DataIO){

if(typeof(Xml)!="string") {
   var X = Xml ? Xml.xml : null; 
   if(X) Xml = X;        
   else return typeof(Xml)=="object" ? Xml : null; 
   }

MS.JsonIn;  
if(Xml.search(/^[^\<\&]*\{/)>=0) {
   try { var A = new Function("return "+Xml.replace(/^[^\<\{]*\{/,'{').replace(/\}[^\}]*$/,'}')); A = A(); }
   catch(e){
      this.Debug(1,"Incorrect JSON data from "+this.DebugDataGetName(DataIO)+", error returned: ",(e.message?e.message:e));
      if(this.DebugFlags["ioerror"] && !DataIO.Debug["in"]) this.DebugData(DataIO,Xml," JSON:");
      return null;
      }
   return A;   
   }
ME.JsonIn;   
   
Xml = Xml.replace(/<!--[\s\S]*?-->/g,"");   
var fr = Xml.search(/\<Grid\s*\>/); 
if(fr<0) { 
   fr = Xml.search(/\&lt\;Grid(\>|\&gt\;)/); 
   if(fr<0) { 
      MS.Debug; 
      this.Debug(1,"No tag <Grid> found in XML data from "+this.DebugDataGetName(DataIO));
      if(this.DebugFlags["ioerror"] && !DataIO.Debug["in"]) this.DebugData(DataIO,Xml," XML:");
      ME.Debug;
      if(Grids.OnDataError) Grids.OnDataError(this,DataIO,-4,null,Xml);
      if(DataIO.AlertError) alert("TreeeGrid communication error \r\n\r\nURL: "+(DataIO.Script?DataIO.Script:DataIO.Url)+" \r\n\r\n"+Xml);
      return null; 
      }
   Xml = ReplaceEntities(fr?Xml.slice(fr):Xml); 
   Xml = Xml.replace(/\<\!\-\-([^\-]|\-[^\-]|\-+[^\-\>])*\-{2,}\>/g,"");  
   fr = 0;
   }
return Xml.slice(fr); 
}
// -----------------------------------------------------------------------------------------------------------
// Parses only <IO> tag from XML
TGP.AddDataIO = function(Xml){
if(!Xml) return;
this.IO = {}; 

MS.JsonIn;
if(typeof(Xml)=="object"){
   var X = Xml.IO;
   if(!X || typeof(X)!="object") return;
   this.IO = X; 
   return;
   }
ME.JsonIn;
   
MS.XmlIn;
var A = Xml.match(/\<IO(\s+\w+\s*\=\s*(\'[^\']*\'|\"[^\"]*\"))*\s*\/?\>/g);
if(!A) return;
var B = A[0].match(CNodeAttrsRegExp);
this.SetNodeAttrs(this.IO,B);
ME.XmlIn;
}
// -----------------------------------------------------------------------------------------------------------
// Main function for loading XML to grid. Parses Xml in string and add it to grid. DataIO is data source just for debug prints
TGP.AddDataFromSource = function(Xml, DataIO){
if(!Xml) return false;

this.IO = {}; 
this.AllCols = 0;
if(typeof(Xml)=="object") { MS.JsonIn; if(!this.AddDataFromJson(Xml,DataIO)) return false; ME.JsonIn; }
else { MS.XmlIn; if(!this.AddDataFromXml(Xml,DataIO)) return false; ME.XmlIn; }
if(this.Reset&&typeof(this.Reset)=="number"){
   var r = this.Reset, R = {}; this.Reset = R;
   if(r&1) { R.Style = this.Style; R.CSS = this.CSS; R.DialogCSS = this.DialogCSS; }
   if(r&2) { R.GanttStyle = this.GanttStyle; R.GanttCSS = this.GanttCSS; }
   if(r&4) { R.Language = this.Language; }
   }

// --- IO Session ---
if(this.IO.Session!=null) this.SetSession(this.IO.Session);  

// --- Bonus ---
if(DataIO && DataIO.Bonus){
   MS.Debug; 
   this.Debug(4,"Loading XML data from ",DataIO.Name+"_Bonus");
   if(DataIO.Debug["in"]) this.DebugData(DataIO,DataIO.Bonus,"a bonus XML added:"); 
   ME.Debug;
   var B = {Name:DataIO.Name, Debug:DataIO.Debug, Bonus:""};
   this.AddDataFromSource(this.PrepareData(DataIO.Bonus,B),B);
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
// For API only, returns true for ok, false for error
MS.Api;
TGP.AddDataFromServer = function(xml,DataIO){
var prep = this.PrepareData(xml,DataIO?DataIO:{ });
if(!prep) return false;
this.AddDataFromSource(prep,DataIO?DataIO:{ }); 
this.Update();
return true;
}
ME.Api;
// -----------------------------------------------------------------------------------------------------------
// Sets Session to session and saves it
TGP.SetSession = function(session){
if(session=="") session = null;
this.Source.Session = session;
if(session==null) session = "";
if(this.SaveSession==1 && Grids.SetCfg) Grids.SetCfg(this.id+"&"+(this.SessionId?this.SessionId:"Session"),session?escape(session):"");
else { 
   var sid = this.SaveSession ? this.SaveSession : this.id+"_"+(this.SessionId?this.SessionId:"Session");
   var E = GetElem(sid);
   if(!E) {
      E = document.createElement("input");
      E.type = "hidden";
      E.id = sid;
      AppendTag(E);
      }
   E.value = session;
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateLangFormat = function(){ return this.Lang.Format.Init(); }
// -----------------------------------------------------------------------------------------------------------
TGP.MoveColData = function(C,next,sec){
var CX = this.ColNames[C.Sec];
for(var i=C.Pos+1;i<CX.length;i++) this.Cols[CX[i]].Pos--;
CX.splice(C.Pos,1);
if(next){
   var N = this.Cols[next];
   C.Pos = N.Pos; C.Sec = N.Sec;
   CX = this.ColNames[N.Sec];
   CX.splice(C.Pos,0,C.Name);
   for(var i=C.Pos+1;i<CX.length;i++) this.Cols[CX[i]].Pos++;
   }
else { 
   CX = this.ColNames[sec!=null?sec:C.Sec];
   C.Pos = CX.length; 
   CX[CX.length] = C.Name; 
   }
}
// -----------------------------------------------------------------------------------------------------------

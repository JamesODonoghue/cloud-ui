// -------------------------------------------------------------------------------------------------
// Base functions for AJAX communication
// -------------------------------------------------------------------------------------------------
MS.Ajax;
// -------------------------------------------------------------------------------------------------
// Updates Url according to cfg
TGP.UpdateUrl = function(D){
var u = D.OrigUrl, uu = D.Jsonp ? D.Jsonp : D.Url;
if(!u || D.ZalUrl && D.ZalUrl!=uu) u = uu; 
if(u && (u+"").search(/\*/)>=0 && D.Row){
   D.OrigUrl = u;
   var row = D.Row, rr = row.SPage ? row.parentNode : row, rep = rr.Copy!=null?rr.Copy:(rr.id!=null?rr.id:""); if(BIEA&&(rep+"").indexOf("$")>=0) rep = rep.replace(/\$/g,"$$$");
   u = u.replace(/\*Pos/g,row.Pos!=null?row.Pos:"").replace(/\*id/g,rep).replace(/\*Rows/g,row.Rows!=null?row.Rows:"");
   if(u.indexOf("Sort")>=0){
      var S = this.GetSort();   
      for(var i=0;i<3;i++){
         var rs = new RegExp("\\*Sort"+i,"g"), rsc = new RegExp("\\*SortCols"+i,"g"), rst = new RegExp("\\*SortTypes"+i,"g");
         u = u.replace(rsc,S&&S[i*2]?S[i*2]:"").replace(rst,S&&S[i*2]?(S[i*2+1]?"1":"0"):"").replace(rs,S&&S[i*2]?(S[i*2+1]?"-":"")+S[i*2]:"");
         }
      }  
   if(D.Jsonp) D.Jsonp = u;
   else D.Url = u;
   D.ZalUrl = u;
   }
return D;
}
// -------------------------------------------------------------------------------------------------
// Downloads data from server and adds it to the grid
// IO is part of this.Source, for example Source.Layout
// Data are sent to server as request
// After finish calls function Func(result), where result is server error code or IO.Result, >=0 is OK
// Displays error alerts
// Continues asynchronously in function AjaxCallFinish
TGP.AjaxCall = function(IO, Data, Func){
var T = this, Ret = null;
if(typeof(IO)=="string") IO = {Url:IO};
if(!Func && IO.Sync){ Func = function(err) { Ret = err; } }  
if(Grids.OnDataSend){
   var v = Grids.OnDataSend(this,IO,Data,Func);
   if(typeof(v)=="string") Data = v;
   else if(v) return;
   }
if(IO.Static){ 
   var n = IO.Static;
   if(Grids[n+"Data"]) { this.AjaxFinish(Grids[n+"Data"]?0:-1,Grids[n+"Data"],IO,Func); return; } 
   else if(Grids[n+"Requests"]==null) Grids[n+"Requests"] = []; 
   else { Grids[n+"Requests"][Grids[n+"Requests"].length] = [this,IO,Func]; return; } 
   } 
var D = {}; 
for(var o in IO) D[o] = IO[o];
if(IO.Param) for(var o in IO.Param) D.Param[o] = IO.Param[o];
D.Grid = this;
if(this.Json==2 && D.Url && D.Method.toLowerCase()=="get"){ D.Jsonp = D.Url; D.Url = null; }
if(this.Lang.Alert) {
   D.RepeatText = this.GetAlert(IO==this.Source.Upload ? "AskUploadTimeout" : "AskTimeout");
   D.RepeatError = this.GetAlert(IO==this.Source.Upload ? "UploadTimeout" : "ErrTimeout");
   }
function Finish(code,mess){ if(!T.Cleared) T.AjaxFinish(code,mess,D,Func); };
if(!Grids.OnCustomAjax || !Grids.OnCustomAjax(this,D,Data,Finish)) AjaxCall(D,Data,Finish);
return Ret;
}
// -------------------------------------------------------------------------------------------------
// AjaxCall finalization
TGP.AjaxFinish = function(code,mess,IO,Func,noxlsx){

if(IO.Static && Grids[IO.Static+"Requests"]) {
   Grids[IO.Static+"Data"] = code<0 ? "" : mess; 
   var A = Grids[IO.Static+"Requests"]; Grids[IO.Static+"Requests"] = null;
   for(var i=0;i<A.length;i++) A[i][0].AjaxFinish(code,mess,A[i][1],A[i][2]); 
   }

if(code<0){ 
   if(IO.AlertError) alert("TreeeGrid communication error \r\n\r\nURL: "+(IO.Script?IO.Script:IO.Url)+" \r\n\r\n"+code+" : "+mess);
   if(Func) Func(code);
   return;
   }

if(IO.Xlsx&&!noxlsx){
   
   NoModule("Import","Sheet");
   }
if(Grids.OnDataParse) {
   var v = Grids.OnDataParse(this,IO,mess);
   if(v!=null) mess = v; 
   }
var prep = this.PrepareData(mess,IO);
if(prep==null) { 
   if(Func) Func(-4);
   return;
   }
this.AddDataIO(prep); 
var Q = this.IO;
if(!Q) Q = {};
Grids.Alert = 1;
if(Grids.OnDataGet) {
   var v = Grids.OnDataGet(this,IO,mess,Q);
   if(typeof(v)=="string") { prep = this.PrepareData(v,IO); if(prep==null) { if(Func) Func(-4); return; } } 
   }
var T = this;
function finish(ret){
   if(Grids.OnDataReceive) Grids.OnDataReceive(T,IO);
   Grids.Alert = 0;
   var err = Q.Result<0 ? Q.Result : 0; 
   MS.Debug; if(err) T.Debug(1,"Error result '",err,"' received from server from ",IO.Name+(IO.Script?"_Script='"+IO.Script+"'":"_Url='"+IO.Url+"'")); ME.Debug;
   if(!err && Q.Reload==1) T.ReloadBody(null,0,"Reload");
   if(Q.HtmlMessage) T.ShowMessageTime(Q.HtmlMessage,Q.HtmlMessageTime,function(){ if(Func) Func(err); });
   else if(ret) return err;
   else if(Func) Func(err);
   }
function htmlmess(but) {
   if(but==2||but==3) Q.Reload = 0; 
   if(but==3) { T.Source.Check.Interval = 0; T.SaveCfg(); } 
   finish();
   }
if(Q.Message) alert(Q.Message);
if(Q.UpdateHtmlMessage && !(this.SuppressMessage>=4)){
   this.ShowMessageTime(Q.UpdateHtmlMessage,0,function(but){ 
      if(but==1) T.AddDataFromSource(prep,IO);
      if(but==3) { T.Source.Check.Interval = 0; T.SaveCfg(); }
      if(IO.JavaScript) eval(IO.JavaScript);
      if(Q.ReloadHtmlMessage && !(T.SuppressMessage>=4)) T.ShowMessageTime(Q.ReloadHtmlMessage,0,htmlmess,IO.Name=="Check"?["Yes","No","Never"]:["Yes","No"]);
      else finish();
      },IO.Name=="Check"?["Yes","No","Never"]:["Yes","No"]);
   return;
   }
if(!Q.UpdateMessage || confirm(Q.UpdateMessage)) this.AddDataFromSource(prep,IO);
if(IO.JavaScript) eval(IO.JavaScript);
if(Q.ReloadHtmlMessage && !(this.SuppressMessage>=4)) { this.ShowMessageTime(Q.ReloadHtmlMessage,0,htmlmess,IO.Name=="Check"?["Yes","No","Never"]:["Yes","No"]); return; }
if(Q.ReloadMessage && !confirm(Q.ReloadMessage)) Q.Reload = 0;
var err = finish(1); 
if(Func&&!Q.HtmlMessage) Func(err);
}
// -------------------------------------------------------------------------------------------------
// Backward compatibility
TGP.Communicate = AjaxCall;
TGP.Communicate2 = TGP.AjaxCall;
// -------------------------------------------------------------------------------------------------
ME.Ajax;

// -----------------------------------------------------------------------------------------------------------
// Reads data to grid, returns true for ok
// DataIO is part of this.Source, for example Source.Layout
// After finish calls function Func(result), where result is server error code or IO.Result, >=0 is OK
TGP.ReadData = function(DataIO, Func){
MS.Debug;this.Debug(4,"Loading XML data from ",this.DebugDataGetName(DataIO));ME.Debug;
if(Grids.OnReadData && Grids.OnReadData(this, DataIO, Func)) return;

// --- Sheet z this.File ---


// --- Url ---
MS.Ajax;
if(DataIO.Url || DataIO.Jsonp || DataIO.Script){
   var req = "", F = this.GetUploadFormat(DataIO);
   if(this.ColNames[1] && this.ColNames[1].length) req = this.GetCfgRequest(F,""); 
   if(req || this.Source.Session!=null) req = this.GetRequestIO(F,1);
   this.AjaxCall(this.UpdateUrl(DataIO),req,Func);
   return;
   }
ME.Ajax;

// --- Input ---	
MS.Submit;
if(DataIO.Tag){
   var I = this.GetInput(DataIO.Tag), ret;
   if(!I){ ret = -3; MS.Debug; this.Debug(1,"Missing input tag named '",DataIO.Tag,"' from data source ",DataIO.Name+"_Tag"); ME.Debug; }
   else if(!I.value){ ret = -4; MS.Debug; this.Debug(1,"Empty xml in tag named '",DataIO.Tag,"' from data source ",DataIO.Name+"_Tag"); ME.Debug; }
   else {
      MS.Debug; 
      this.Debug(4,"Loading data from tag named '",DataIO.Tag,"' from data source ",DataIO.Name+"_Tag");
      if(DataIO.Debug["in"]) this.DebugData(DataIO,I.value,"a XML loaded:");
      ME.Debug;
      var prep = this.PrepareData(I.value,DataIO);
      if(prep) this.AddDataFromSource(prep,DataIO);
      ret = prep ? 0 : -4;
      }
   if(Func) Func(ret);
   return;
   }
ME.Submit;

// --- Data ---	
if(DataIO.Data){
   MS.Debug; 
   this.Debug(4,"Loading data from data source ",DataIO.Name+"_Data");
   if(DataIO.Debug["in"]) this.DebugData(DataIO,DataIO.Data,"a XML loaded:");
   ME.Debug;

   

   var prep = this.PrepareData(DataIO.Data,DataIO);
   if(prep) this.AddDataFromSource(prep,DataIO);
   var ret = prep ? 0 : -4;
   if(Func) Func(ret);
   return;
   }

// --- Script ---	

// --- Error ---
MS.Debug; this.Debug(1,"No data source defined for ",DataIO.Name); ME.Debug; if(Func) Func(-3); 
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetRequestIO = function(F,end){
return (F.Json?"{":"<Grid>") + this.GetCfgRequest(F) + (F.Json?"\"IO\":{":"<IO") + (this.Source.Session!=null?F.Spc1+"Session"+F.Sep+"\""+this.Source.Session+"\"":"") + (end?(F.Json?"}}":"/></Grid>"):F.End);
}
// -------------------------------------------------------------------------------------------------
// Downloads data for given page or row
// After finish calls function Func(result), where result is server error code or IO.Result, >=0 is OK
MS.Paging;
TGP.DownloadPage = function(row, Func){
row = this.UpdateTagName(row);
this.Source.Page.Row = row;
if(Grids.OnDownloadPage && Grids.OnDownloadPage(this,row,Func)) return;
if(row.State>1){ if(Func) Func(0); return; } 
if(!this.Source.Page.Url&&!this.Source.Page.Script){
   MS.Debug; this.Debug(1,"No Page_Url/Script set in <treegrid> tag"); ME.Debug;
   if(Func) Func(-1); return;
   }
var A = [], p = 0, F = this.GetUploadFormat(this.Source.Page);
A[p++] = this.GetRequestIO(F);
A[p++] = F.Json ? "\"Body\":[{" : "<Body><B"; 
var pp = p, rr = row.SPage ? row.parentNode : row;
if(rr.Copy) A[p++] = F.Spc+"id"+F.Sep+"\""+rr.Copy+"\"";
else if(rr.id||rr.id=="0") A[p++] = F.Spc+"id"+F.Sep+"\""+rr.id+"\"";
if(row.Rows) A[p++] = F.Spc+"Rows"+F.Sep+"\""+F.Str(row.Rows)+"\"";
if(row.Page||row.SPage) A[p++] = F.Spc+"Pos"+F.Sep+"\""+row.Pos+"\"";
if(F.Json && A[pp] && A[pp].charAt(0)==',') A[pp] = A[pp].slice(1); 
A[p++] = F.Json ?"}]}" :"/></Body></Grid>";
var url = this.UpdateUrl(this.Source.Page);
MS.Debug; 
if(this.DebugFlags["page"]) {
   this.StartTimer("Page"+(row.Page?row.Pos:row.id)); 
   this.Debug(3,"Downloading ",row.Page?"page "+row.Pos:"children "+row.id," from ",this.DebugDataGetName(url));
   }
ME.Debug;
this.AjaxCall(url,A.join(""),Func);
}
ME.Paging;
// -------------------------------------------------------------------------------------------------
// Downloads data for cell
// After finish calls function Func(result), where result is server error code or IO.Result, >=0 is OK
MS.Ajax;
MS.Edit$Defaults;
TGP.DownloadCell = function(row,col,Func,val){
var A = [], p = 0, F = this.GetUploadFormat(this.Source.Cell);
A[p++] = this.GetRequestIO(F);
A[p++] = F.Json ? "\"Body\":[{" : "<Body><B"; 
var pp = p;
if(row.Copy) A[p++] = F.Spc+"id"+F.Sep+"\""+row.Copy+"\"";
else if(row.id||row.id=="0") A[p++] = F.Spc+"id"+F.Sep+"\""+row.id+"\"";
A[p++] = F.Spc+"Col"+F.Sep+"\""+col+"\"";
A[p++] = F.Spc+"Val"+F.Sep+"\""+PFormat.Escape(val)+"\"";
A[p++] = F.Json ?"}]}" :"/></Body></Grid>";
MS.Debug; 
if(this.DebugFlags["page"]) {
   this.StartTimer("Cell"+row.id+"_"+col); 
   this.Debug(3,"Downloading cell [",row.id,",",col,"] (",val,") from ",this.DebugDataGetName(this.Source.Cell));
   }
ME.Debug;
this.Source.Cell.Row = row;
this.Source.Cell.Col = col;
this.Source.Cell.Value = val;
this.AjaxCall(this.UpdateUrl(this.Source.Cell),A.join(""),Func);
}
ME.Edit$Defaults;
ME.Ajax;
// -------------------------------------------------------------------------------------------------
// Uploads changes to server and downloads new
// Accepts all changes and displays them
// If row is set, uploads only changes in the row
// returns 0 OK, -1 browser does not support the function, -2 bad URL, -3 URL not found, -4 bad document format
TGP.UploadChanges = function(row, Func, notest){
MS.Upload;
MS.Ajax;
if(row && (this.CalculatedChanges||(","+this.Source.Upload.Type+",").toLowerCase().indexOf("selected")>=0)) row = null;
MS.Master; if(this.MasterGrid) return this.MasterGrid.UploadChanges(row?row.MasterRow:null,Func); ME.Master;
if(!this.AutoUpdate&&!notest || row && (!row.id&&row.id!="0" || Is(row,"NoUpload") || row.Kind=="Filter"&&Is(row,"NoUpload")!=0) || this.Locked["save"]){ if(Func) Func(0); return; }
MS.Pivot; if(this.PivotGrid) return this.PivotGrid.UploadChanges(null,Func,1); ME.Pivot;
if(row && this.Validate && !this.ActionValidate(null,0,row)) return;
if(Grids.OnSave && Grids.OnSave(this,row,true)) { if(Func) Func(0); return; }
var val = this.GetXmlData(null,null,null,null,row);

if(!val) return; 
var D = this.Source.Upload, T = this;
if(Grids.OnUpload){ var v = Grids.OnUpload(this,val,row,true); if(v!=null) val = v; }
this.ReloadReason = "Upload";
var hasundo = this.Undo&&this.OUndo;
D.Row = row;
function finish(result){ 
   if(result>=0) {
      T.AcceptChanges(row);
      MS.Undo; 
      if(hasundo){
         if(T.Undo&32 && T.OUndo && T.OUndo.Pos) { T.AddUndo({Type:"Accept",Row:row},2); T.OUndo.Rev = 0; }
         else if(!T.MasterGrid) T.ClearUndo(1); 
         }
      ME.Undo;
      }
   T.ReloadReason = null;   
   if(Grids.OnAfterSave) Grids.OnAfterSave(T,result,true);
   if(Func) Func(result);
   };
if(!D.Url && !D.Script && D.Data && D.Data.search(/^\s*[\<{]/)>=0){
   this.AddDataFromSource(this.PrepareData(D.Data,D),D);
   var Q = this.IO;
   if(Q && Q.Message) this.Alert(Q.Message);
   if(!Q || Q.Result==null || Q.Result>=0) finish(0);
   if(Q && Q.HtmlMessage) this.ShowMessageTime(Q.HtmlMessage,Q.HtmlMessageTime);
   return 0;
   }
MS.Debug;
if(!D.Url && !D.Script && D.Tag && (D.Tag+"").toLowerCase()=="debug" && !this.GetInput(D.Tag)){
   this.Debug(1,"Upload_Tag is set to \"Debug\", so the data are not uploaded, just printed here");
   this.DebugData(D,val,":");
   finish(0);
   return 0;
   }
ME.Debug;
this.AjaxCall(D,val,finish);
return 0;
ME.Ajax;
ME.Upload;
}
// -----------------------------------------------------------------------------------------------------------
MS.Reload;
// -----------------------------------------------------------------------------------------------------------
// Reloads all data and displays the grid
// Returns false if user canceled the action
TGP.Reload = function(D,id,type,mess,file){
if(this.Rendering || this.Loading) return false;
if(Grids.OnReload && Grids.OnReload(this)) return false;
if(!D) D = this.Source;
if(!D) return;  
if(this.EditMode && this.EndEdit(1)==-1) return false;
MS.Animate; this.FinishAnimations(); ME.Animate;
if(type==null) type = 1;
if(type&1 && this.CanReload && !this.CanReload(1)) return false;
MS.Debug; this.Debug(4,"Reloading grid"); ME.Debug;
this.Loading = 1;
this.SelectingFocus = 0; this.Focus();

if(this.RefreshDetail) this.RefreshDetail(null,1);
Grids.CacheVersion = Math.floor(Math.random()*1e8); 
if(type&14) D.Data.Bonus = this.GetXmlData(type&8 ? "ConfigXlsx" : type&4 ? "Settings" : "Config");
var oid = this.id, tag = this.MainTag, idx = this.Index, ridx = this.ReloadIndex, mwidth = this.MessageWidth; 
if(id!=null) if(id==oid) id = null; else { delete Grids[oid]; oid = null; } 
if(!file) file = this.File;
if(file && typeof(file)=="object") for(var i=0;i<Grids.length;i++) { var G = Grids[i]; if(G&&G.Hidden&&G.FSheet&&G.id.indexOf(this.id+"$")==0) G.Dispose(); } 
if(D.Json==null) D.Json = this.Json;
this.Clear(1);
this.Enable();
if(this.LimitWidth!=null) tag.style.width = this.LimitStyleWidth;
if(this.LimitHeight!=null) tag.style.height = this.LimitStyleHeight;
var PR = this.KeepReload, PR2 = this.KeepReload2, P = {KeepReload:1,KeepReload2:1};
if(PR){ if(typeof(PR)!="object") PR = PR.split(","); for(var i=0;i<PR.length;i++) P[PR[i]] = 1; }
if(PR2){ if(typeof(PR2)!="object") PR2 = PR2.split(","); for(var i=0;i<PR2.length;i++) P[PR2[i]] = 1; }
for(var n in this) if(TGP[n]==null&&!P[n]) delete this[n]; 
this.Init(); 
this.id = oid; this.Index = idx; this.ReloadIndex = ridx?ridx+1:1; this.File = file; this.MainTag = tag;
if(!mess&&D.Text&&D.Text.Start) mess = D.Text.Start;
if(mess!=null) ShowMessageCenter(mess,tag,"GridMessage",null,mwidth);
return TreeGrid(D,tag,id,this);

}
// -----------------------------------------------------------------------------------------------------------
// Calls Reload
TGP.ActionReload = function(dummy,T){ 
if(this.Locked["reload"]) return false;
if(T) return !this.Detail;
if(!this.EndEditAll()) return false;
return this.Reload(); 
}
// -----------------------------------------------------------------------------------------------------------
// Calls Reload
TGP.ActionReloadCfg = function(dummy,T){ 
if(this.Locked["reload"]) return false;
if(T) return !this.Detail;
if(!this.EndEditAll()) return false;
return this.Reload(null,null,3);
}
// -----------------------------------------------------------------------------------------------------------
// Calls Reload
TGP.ActionReloadSettings = function(dummy,T){ 
if(this.Locked["reload"]) return false;
if(T) return !this.Detail;
if(!this.EndEditAll()) return false;
return this.Reload(null,null,7);
}
// -----------------------------------------------------------------------------------------------------------
ME.Reload;

MS.ReloadBody;
// -----------------------------------------------------------------------------------------------------------
// Tests changes before body reloading, lets user to confirm updating changes before body reloading
TGP.CanReload = function(cancel){
MS.Upload;
var chg = this.HasChanges ? this.HasChanges() : 0;
if(Grids.OnCanReload) { var tmp = Grids.OnCanReload(this,chg,cancel); if(tmp!=null) return tmp; }
var v = this.ReloadChanged;
if(!(v&4)) chg&=~2; 
if(chg){
   v&=3; 
   if(v==3) v = this.Confirm(this.GetAlert("CanReloadStart") + (chg&1 ? this.GetAlert(cancel?"CanCancelChanges":"CanReloadChanges") : "") 
      + ((chg&3)==3 ? this.GetAlert("And") : "") + (chg&2 ? this.GetAlert("CanReloadSelect") : "") 
      + this.GetAlert("CanReloadEnd")) ? 1 : 0;
   if(v==1 && chg&1 && !cancel && this.Save) this.Save(); 
   return !!v;
   }
ME.Upload;
return true;
}
// -----------------------------------------------------------------------------------------------------------
// Reloads and displays body (variable rows)
// After finish calls function Func(result), where result is server error code or IO.Result, >=0 is OK
TGP.ReloadBody = function(Func,rerender,reason,empty){
if(this.Loading || this.Rendering || this.EditMode && this.EndEdit(1)==-1) return;
MS.Animate; this.FinishAnimations(); ME.Animate;
this.ReloadReason = reason ? reason : "Reload";
MS.Debug; this.Debug(4,"++++++++++ Reloading body rows due ",reason?reason:"API"," ++++++++++"); this.StartTimer("ReloadBody"); ME.Debug;
if(this.Focused==null) this.SetFocused();
if(this.PreserveReload&1){
   for(var s="",r=this.GetFirst();r;r=this.GetNext(r)) if(this.CanSelect(r) && r.Selected&1 && r.id) s+=(s?"&":"") + r.id;
   this.ToSelect = "&"+s+"&";
   }
if(this.PreserveReload&2){
   for(var e="",c="",r=this.GetFirst();r;r=this.GetNext(r)){
      if(Is(r,"CanExpand") && (r.firstChild || r.State<=1&&r.Count) && r.Expanded!=r.Def.Expanded && !(r.Expanded&2) && r.id){
         if(r.Expanded) e += (e?"&":"") + r.id; else c += (c?"&":"") + r.id;
         }      
      }
   this.ToExpand = "&"+e+"&"; this.ToCollapse = "&"+c+"&";
   }
this.FRow = null; this.FCol = null;
this.Clear(4);
if(this.RefreshDetail) this.RefreshDetail(null,1);
ClearChildren(this.XB); 
this.LoadedCount = 0;
this.RemovedPages = null;
MS.Group; if(this.Grouping && this.Grouped && this.Group) { this.Root.CDef = this.RootCDef; this.Root.AcceptDef = this.RootAcceptDef; } ME.Group;
if(!this.MasterGrid) this.ClearUndo();
this.Loading = 1;
Grids.CacheVersion = Math.floor(Math.random()*1e8); 
if(empty) { this.AddBody(); this.ReloadBodyFinish(0,Func,rerender); }
else { 
   var D = this.Source;
   var S = D.Source.split(";"), dpos = S[S.length-1].split(",").length;
   S = D.Source.split(/[,;]/); dpos = S.length - dpos;
   var O = {G:this,D:D,S:S,Pos:dpos,Cnt:1,Func:Func,rerender:rerender}; 
   function run(result){
      if(this!=window) O = this; 
      if(!O.G.Loading || --O.Cnt) return; 
      while(!O.D[O.S[O.Pos]] && i<O.S.length) O.Pos++;
      if(O.Pos==O.S.length||result<0){ O.Cnt = 1000; O.G.ReloadBodyFinish(result,O.Func,O.rerender); return; }
      var SS = O.S[O.Pos++].split("+"); O.Cnt = SS.length;
      for(var i=0;i<SS.length;i++) O.G.ReadData(O.D[SS[i]],O.run); 
      }
   if(run.bind) O.run = run.bind(O); 
   O.run = run;
   O.run();

   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.ClearBody = function(Func){ return this.ReloadBody(Func,1,"Clear",1);}
// -----------------------------------------------------------------------------------------------------------
// ReloadBody finalization
TGP.ReloadBodyFinish = function(result,Func,rerender){
var D = this.Source.Data;
if(result<0){ 
   this.Loading = 0;
   MS.Debug; this.Debug(1,"Reloading body failed with result ",result); ME.Debug;
   this.HideMessage();
   ClearChildren(this.XB); 
   if(!this.XB.firstChild) this.AddBody();
   this.Render();
   if(Func) Func(result);
   return;
   }

if(!this.XB.firstChild){
   MS.Debug; if(!this.AutoPages) this.Debug(2,"No page (tag <B>) defined in input XML"); ME.Debug;
   this.AddBody();
   }

// --- Update ---
if(!this.Paging){ 
   for(var F=this.XB.firstChild,B=F.nextSibling;B;B=F.nextSibling){ 
      for(var r=B.firstChild;r;r=B.firstChild) F.appendChild(r);
      this.XB.removeChild(B);
      }
   }
MS.Tree; this.CreateTree(); ME.Tree; 
this.UpdatePagesValues();
MS.RowSpan; this.InitRowSpan(); ME.RowSpan;

 
MS.Calc; this.UpdateGridCalc(); ME.Calc;
if(this.Paging==3) this.UpdateGridPaging();
else {
   MS.Group; this.UpdateGridGroup(); ME.Group;
   MS.Filter; this.UpdateGridFilter(); ME.Filter;
   this.UpdateGridSort();
   }
this.UpdateGridTree();
MS.Tree; this.CalcTreeWidth(); ME.Tree;

this.UpdateGridFinish(1);
MS.Cfg; this.LoadCfg(null,2); ME.Cfg;
this.ExpandAndSelect();
if(rerender){
   this.Render();
   }
else {
   this.RenderBody();
   
   var F = this.GetFixedRows(); for(var i=0;i<F.length;i++) {
      if(typeof(F[i].Def)=="string") { 
         var D = this.Def[F[i].Def];
         if(!D) D = this.Def["R"];
         F[i].Def = D;
         }
      this.RefreshRow(F[i]); 
      }
   for(var r=this.XS.firstChild;r;r=r.nextSibling) this.RefreshRow(r); 
   
   this.HideMessage();
   
   if(BIEA) { var T = this; setTimeout(function(){ T.ShowPages(); },10); } 

   MS.Debug; this.Debug(4,"Reloading body finished in ",this.EndTimer("ReloadBody")," ms"); ME.Debug;
   }

this.ReloadReason = null;
if(Func) Func(result);
}
// -----------------------------------------------------------------------------------------------------------
ME.ReloadBody;

MS.Upload;
// -----------------------------------------------------------------------------------------------------------
MS.EditMask;
// Validates all ResultMasks before save changes
TGP.ActionValidate = function(dummy,T,row){
if(T) return !!this.Validate;
if(!this.Validate) return true; 
MS.Animate; this.FinishAnimations(); ME.Animate;

if(this.EditMode) this.EndEdit(1); 
T = this;
var R = [], C = [], p = 0, V = this.Validate, F = "added,changed,all,confirm,focus,edit,text,noerror,deleted,error,messages";
if(V-0+""==V) { 
   V = this.BitArrayToFlags(V,F);
   if(V["all"]) delete V["added"];
   }
else V = this.ConvertFlags(V,F);   
var all = V["all"], del = V["deleted"], chg = V["changed"], E = this.GetErrors("Validate"), Err = [];

function validate(r,cols){
   if(!del && r.Deleted) return;
   var chgc = 0;
   for(var i=0;i<cols.length;i++){
      var c = cols[i], ov = T.GetString(r,c,7), err = 0, error = r[c+"Error"]; r[c+"Error"] = null;
      var v = T.CheckMask(r,c,ov,E);
      if(v!=ov) err = 1;
      
      else if(error && V["error"]) { err = 1; E.Errors.push([error,r,c,v]); }
      if(Grids.OnValidate) { var tmp = Grids.OnValidate(T,r,c,err,E); if(tmp!=null) err = tmp; }
      if(error && !r[c+"Error"]) r[c+"Error"] = error;
      if(err) { R[p] = r; C[p] = c; Err[p] = error;  p++; }   
      }
   if(chgc) T.UpdateRowHeight(r);
   }
if(row) {
   if(all || row.Added || chg&&row.Changed) for(var j=0;j<this.ColNames.length;j++) validate(row,this.ColNames[j]);
   }
else {
   for(var r = this.GetFirst();r;r=this.GetNext(r)){
      if(all || r.Added || chg&&r.Changed) for(var j=0;j<this.ColNames.length;j++) validate(r,this.ColNames[j]);
      }
   if(all||chg){
      var F = this.GetFixedRows();
      for(var i=0;i<F.length;i++) if(F[i].Kind=="Data" && (all||F[i].Changed)) for(var j=0;j<this.ColNames.length;j++) validate(F[i],this.ColNames[j]);
      for(var r = this.XS.firstChild;r;r=r.nextSibling) if(r.Kind=="Space" && (all||r.Changed)) validate(r,r.Cells);
      }
   }      
if(!p) return true; 
if((V["focus"]||V["edit"]||V["confirm"]) && !this.EndEditAll()) return false; 
var err = true;
if(Grids.OnValidateError){
   var rr = Grids.OnValidateError(this,R,C);
   if(rr==1) return false; 
   if(rr==2) err = false;  
   }

if(err&&!this.AutoUpdate){
   if(V["messages"]) {
      var txt = this.ProcessErrors(E), txt2 = this.ValidateMessage; if(!txt2) txt2 = this.ValidateText; 
      txt = txt&&txt2 ? txt2+"<br>"+txt : (txt2?txt2:txt);
      if(txt){
         txt = txt.replace("%1",p);
         if(V["confirm"]){
            txt = txt.replace(/<br\s*\/?>/gi,"\n").replace(/&nbsp;/gi," ").replace(/<\/?\w+[^>]*>/g,"");
            if(this.Confirm(txt)) err = false;
            }
         else {
            var time = this.ValidateMessageTime; if(time==null) time = this.EditErrorsMessageTime;
            this.ShowMessageTime(txt,E.MessageTime==null?time:E.MessageTime,function(){
               if(V["focus"]||V["edit"]) T.Focus(R[0],C[0],null,null,1);
               if(V["edit"]) T.StartEdit();
               });
            }
         }
      }
   else {
      var text = "", html = "";
      if(V["text"]) { text = this.GetAttr(R[0],C[0],"ResultText"); html = this.GetAttr(R[0],C[0],"ResultMessage"); }
      text = text ? (this.ValidateText?this.ValidateText+"\n":"") + text : this.ValidateText;
      html = html ? (this.ValidateMessage?this.ValidateMessage+(V["confirm"]?"\n":"<br/>"):"") + html : this.ValidateMessage;
      if(text) text = text.replace("%1",p);
      if(html) html = html.replace("%1",p);
      if(V["confirm"] && !text) { text = html; html = null; }
      if(html) {
         var time = this.ValidateMessageTime; if(time==null && V["text"]) time = this.GetAttr(R[0],C[0],"ResultMessageTime");
         this.ShowMessageTime(html,time,function(){
            if(V["focus"]||V["edit"]) T.Focus(R[0],C[0],null,null,1);
            if(V["edit"]) T.StartEdit();
            });
         }
      else if(text){
         if(!V["confirm"]) this.Alert(text);
         else if(this.Confirm(text)) err = false;
         }
      }
   }

if(err && !V["noerror"]){
   for(var i=0;i<p;i++) if(!Err[i]){
      var e = this.GetAttr(R[i],C[i],"ResultText");
      if(!e) e = this.GetAlert("Invalid");
      R[i][C[i]+"Error"] = e;
      this.RefreshCell(R[i],C[i]);
      }
   }

MS.Undo; 
if(this.Undo&1 && !V["noerror"]) {
   var us = 0;
   for(var i=0;i<p;i++) if(err?R[i][C[i]+"Error"]!=Err[i]:Err[i]) {
      if(!us) { this.UndoStart(); us = 1; }
      this.AddUndo({Type:"Error",Row:R[i],Col:C[i],OldVal:Err[i],NewVal:err?R[i][C[i]+"Error"]:null},2);
      }
   if(us) { this.UndoEnd(); this.CalculateSpaces(1); }
   }
ME.Undo;

if(!err){
   if(!V["noerror"]) for(var i=0;i<p;i++) if(R[i][C[i]+"Error"]) { R[i][C[i]+"Error"] = null; this.RefreshCell(R[i],C[i]); } 
   return true;
   }

if(this.AutoUpdate) { 
   setTimeout(function(){ 
      if(V["focus"]) T.Focus(R[0],C[0],null,null,1);
      if(V["edit"] && T.Focus(R[0],C[0],null,null,1)!=null) T.StartEdit();
      },10);
   }
else if(!html) {
   if(V["focus"]) this.Focus(R[0],C[0],null,null,1); 
   if(V["edit"] && this.Focus(R[0],C[0],null,null,1)!=null) this.StartEdit();
   }
return false;   
}
ME.EditMask;
// -----------------------------------------------------------------------------------------------------------
// Saves data according chosen upload type
TGP.Save = function(event){
var D = this.Source.Upload;
if(this.Locked["save"] || this.EditMode && this.EndEdit(1)==-1) { 
   if(event) CancelEvent(event);
   return false;
   }
MS.Pivot; if(this.PivotGrid) return this.PivotGrid.Save(event); ME.Pivot;

MS.Master$Pivot;
for(var i=0;i<Grids.length;i++){
   var G = Grids[i];
   if(G && G!=this && (G.MasterGrid==this||G.PivotGrid==this) && G.EditMode && G.EndEdit(1)==-1){
      if(event) CancelEvent(event);
      return false;
      }
   }
ME.Master$Pivot;

if(event && this.ActionValidate && !this.ActionValidate()) return false; 
if(Grids.OnSave && Grids.OnSave(this)){ this.HideMessage(); return false; }
MS.Animate; this.FinishAnimations(); ME.Animate;


MS.Ajax;
if(D.Url||D.Script){
   MS.Debug; this.StartTimer("Save"); this.Debug(4,"Saving data to server to ",this.DebugDataGetName(D)); ME.Debug;
   var T = this, val = this.GetXmlData();
   if(Grids.OnUpload){ var v = Grids.OnUpload(this,val); if(v!=null) val = v; }
   this.ReloadReason = "Upload";
   this.AjaxCall(D,val,function(result){
      if(result>=0) T.AcceptChanges();
      T.HideMessage();
      T.ReloadReason = null;
      if(Grids.OnAfterSave) Grids.OnAfterSave(T,result);
      if(result>=-9 && result<=-2) T.ShowMessageTime(T.GetText("ErrorSave"),0);
      else {
         MS.Paging; if(!T.Cleared) T.ShowPages(); ME.Paging; 
         MS.Debug; T.Debug(4,"Data saved to server sucessfully in ",T.EndTimer("Save")," ms"); ME.Debug;
         }
      });
   return;
   }
ME.Ajax;

MS.Submit;
if(D.Tag){
   var I = this.GetInput(D.Tag);
   MS.Debug;
   if(!I && (D.Tag+"").toLowerCase()=="debug"){
       var val = this.GetXmlData();
      if(Grids.OnUpload){ var v = Grids.OnUpload(this,val); if(v!=null) val = v; }
      
      this.Debug(1,"Upload_Tag is set to \"Debug\", so the data are not uploaded, just printed here");
      this.DebugData(D,val,":");
      this.AcceptChanges();
      if(Grids.OnAfterSave) Grids.OnAfterSave(this,0);
      MS.Paging; if(!this.Cleared) this.ShowPages(); ME.Paging; 
      return false;
      }
   ME.Debug;

   if(I) { 
      if(this.Focused==null) this.SetFocused();
      var val = this.GetXmlData();
      if(Grids.OnUpload){ var v = Grids.OnUpload(this,val); if(v!=null) val = v; }
      I.value = D.Xml-0 ? val : val.replace(/\&/g,"&amp;").replace(/\</g,"&lt;").replace(/>/g,"&gt;");
      }
   var F = this.GetForm(I);
   if(F){
      F.method = "POST";
      if(this.FormSubmit && !this.FormSubmit(event)){ this.HideMessage(); return false; }
      if(!event) F.submit(); 
      return true; 
      }
   else {
      MS.Debug; this.Debug(1,"Cannot submit data to server, no <form> tag found"); ME.Debug;
      this.HideMessage();
      return false;
      }   
   }
ME.Submit;      

if(D.Data){
   this.AddDataFromSource(this.PrepareData(D.Data,D),D);
   var Q = this.IO;
   if(Q && Q.Message) this.Alert(Q.Message);
   if(!Q || Q.Result==null || Q.Result>=0) this.AcceptChanges();
   if(Q && Q.HtmlMessage) this.ShowMessageTime(Q.HtmlMessage,Q.HtmlMessageTime);
   else this.HideMessage();
   return;
   }
   
this.HideMessage();
}
// -------------------------------------------------------------------------------------------------
TGP.ActionSave = function(dummy,T){ 
if(!this.Source.Upload.Url&&!this.Source.Upload.Script&&!this.Source.Upload.Tag&&!this.Source.Upload.Data||this.Detail||this.Locked["save"]) return false;
if(T) return true;
if(!this.EndEditAll()) return false;
return this.Save(); 
}
// ------------------------------------------------------------------------------------------------- 
ME.Upload;

MS.Check;
// -------------------------------------------------------------------------------------------------
// Called in interval for all Check_Url
function GridsCheck(){
for(var i=0;i<Grids.length;i++){
   var G = Grids[i];
   if(G && !G.Cleared && (G.Source.Check.Url||G.Source.Check.Script) && G.Source.Check.Interval && !G.Loading && !G.Rendering && !G.Disabled && G.CheckInterval!=null) {
      if(++G.CheckInterval>=G.Source.Check.Interval) {
         G.CheckInterval = 0;
         G.CheckForUpdates();
         }
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
// Checks if server contains some changes, uses Check_Url
TGP.CheckForUpdates = function(Func){
if(this.CheckingForUpdates || this.ReloadReason) return;
var T = this, D = this.Source.Check, req;
this.CheckingForUpdates = 1; this.ReloadReason = "Check";
if(D.Format.toLowerCase()=="json") req = "{\"IO\":{"+(this.Source.Session!=null?"\"Session\":\""+this.Source.Session+"\"":"")+"}}";
else req = "<Grid><IO"+(this.Source.Session!=null?" Session=\""+this.Source.Session+"\"":"")+"/></Grid>";

this.AjaxCall(D,req,function(result){ 
   T.CheckingForUpdates = 0; T.ReloadReason = null;
   if(result<0) {
      if(T.Repeat==3 || T.Repeat==2 && T.Confirm(T.GetAlert("ErrCheck"))) T.CheckForUpdates(Func); 
      else {
         if(T.Repeat==0) T.Alert("ErrCheckEnd");
         T.Source.Check.Interval = 0;
         }
      }
   
   if(Func) Func(result);
   });
}
// -----------------------------------------------------------------------------------------------------------
ME.Check;

// -----------------------------------------------------------------------------------------------------------
// Returns updated url for basic treegrid data sources, adds also ? for caching
TGP.GetUrl = function(url,cache){
if(cache==null) cache = this.Cache;
if(cache==3 || !url || (url+"").search(/\#|^javascript\:/i)>=0) return url; 
var v = cache==1&&window.TGComponent ? (TGComponent.Version+"").replace(/\s/g,"") : (cache==2 ? this.CacheVersion : Grids.CacheVersion);
if(v==null) return url;

return url + ((url+"").indexOf('?')>=0 ? "&" : "?") + "tgc="+escape(v);
}
// -----------------------------------------------------------------------------------------------------------

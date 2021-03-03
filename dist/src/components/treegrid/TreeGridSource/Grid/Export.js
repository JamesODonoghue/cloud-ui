// -----------------------------------------------------------------------------------------------------------
// Functions for export
// -----------------------------------------------------------------------------------------------------------
MS.Export;
var CExportTypeFlags = "filtered,expanded,strings,hidden,outline,indent,dates,rtl,selected,fixedcols,fixedrows,empty,keephtml,enumkeys,texttype,hide,unsupported,nocolor,bool,selection,focus,nonextcols,forceborder,noformula,nostyle,nospan,stylenumbers,size,stylecols,stylerows,nonextborder,nobom";
// -----------------------------------------------------------------------------------------------------------
// Creates and sends the export report
TGP.ActionExport = function(dummy,T){

if(this.Locked["export"]) return false;
if(T) return true;
if(Grids.OnExportStart && Grids.OnExportStart(this,0)) return;
T = this;
if(this.File){
   function Save(val){ T.SaveExport(val); }
   function Export(){
      T.SaveSheet();
      T.GetExportImages(T.File.ImgCache,function(){ T.ExportXlsx(Save); });
      }
   this.ShowMessage(this.GetText("ExportProgressCaption"));
   if(this.Message) setTimeout(Export,10);
   else Export();
   return;
   }
var O = {"Options":[],"OptionsCaption":[]}, L = this.Lang["MenuExport"], M = null;
function go(){ 
   var Q = O["Options"];
   if(Q.length){
      T.ExportName = Q[0].Value;
      var frm = Q[1].Items[Q[1].Value];
      if(frm) T.ExportFormat = frm.Text.toLowerCase();
      et["expanded"] = Q[2].Value;
      et["filtered"] = Q[3].Value;
      et["outline"] = Q[4].Value;
      et["indent"] = Q[5].Value;
      if(xlsx){
         et["selected"] = Q[6].Value;
         et["fixedrows"] = Q[7].Value;
         et["fixedcols"] = Q[8].Value;
         et["empty"] = Q[9].Value;
         }
      var t = ""; for(var a in et) if(et[a] && et.hasOwnProperty(a)) t += (t?",":"")+a;
      T.ExportType = t;
      T.SaveCfg();
      }
   var server = T.Source.Export.Type; if(server) server = (server+"").toLowerCase(); 
   T.DoExport(M,server&&server!="xls"&&server!="csv"&&server!="export"?T.Source.Export:null);    
   }
var f = T.ExportFormat; T.ExportFormat = !f ? "" : (f-0 ? ["","xlsx","csv","xls"][f] : f.toLowerCase());
if(!this.ExportCols || !this.ShowCfg) { go(); return true; }
var et = typeof(this.ExportType)=="string" ? this.ConvertFlags(this.ExportType.toLowerCase(),CExportTypeFlags,1,0,1) : {};
if(this.ExportCols==2){
   O["OptionsCaption"] = [{Name:"OptionsCaption",Text:this.GetText("ExportOptions",L),Caption:1}];
   var F = this.GetCfgOptions("ExportFormats",L), f = this.ExportFormat;
   for(var i=0;i<F.length;i++) if(F[i].Text.toLowerCase()==f) { f = F[i].Name; break; }
   O["Options"] = [
      {Name:"ExportName",Text:this.GetText("ExportName",L),Edit:1,Value:this.ExportName?this.ExportName:this.id},
      {Name:"ExportFormat",Text:this.GetText("ExportFormat",L),Enum:1,Items:F,Value:f},
      {Name:"ExportExpanded",Text:this.GetText("ExportExpanded",L),Bool:1,Value:et["expanded"],Hidden:this.MainCol?0:1,NoAll:1},
      {Name:"ExportFiltered",Text:this.GetText("ExportFiltered",L),Bool:1,Value:et["filtered"],Hidden:this.Paging==3||this.ChildPaging==3||!this.Filtering||!this.HasFilter(),NoAll:1},
      {Name:"ExportOutline",Text:this.GetText("ExportOutline",L),Bool:1,Value:et["outline"],Hidden:this.MainCol?0:1,NoAll:1},
      {Name:"ExportIndent",Text:this.GetText("ExportIndent",L),Bool:1,Value:et["indent"],Hidden:this.MainCol&&this.Cols[this.MainCol]&&this.Cols[this.MainCol].CanExport?0:1,NoAll:1}
      ];
   for(var i=0,xlsx=1;i<F.length;i++) { if(F[i].Text.toLowerCase()=="xls") xlsx = 0; else if(F[i].Text.toLowerCase()=="xlsx") { xlsx = 1; break; } }
   if(xlsx){
      var has = this.HasSelected();
      O["Options"].push(
         {Name:"ExportSelected",Text:this.GetText("ExportSelected"+(has&5?(has&6?"Cells":"Rows"):"Cols"),L),Bool:1,Value:et["selected"],Hidden:!has,NoAll:1},
         {Name:"ExportFixedRows",Text:this.GetText("ExportFixedRows",L),Bool:1,Value:et["fixedrows"],Hidden:this.GetFirstVisible(this.XH)?0:1,NoAll:1},
         {Name:"ExportFixedCols",Text:this.GetText("ExportFixedCols",L),Bool:1,Value:et["fixedcols"],Hidden:this.GetFirstCol(0)?0:1,NoAll:1},
         {Name:"ExportEmpty",Text:this.GetText("ExportEmpty",L),Bool:1,Value:et["empty"],Hidden:0,NoAll:1}
         );
      }
   for(var n in O) for(var i=0;i<O[n].length;i++) { var I = O[n][i]; if(!I.Text||this.MenuExport[I.Name]==0) I.Hidden = 1; }
   }
M = this.ShowCfg(this.MenuExport,go,O);
if(M){
   for(var i=0;i<M.Items.length;i++){
      var I = M.Items[i];
      if(I.Cols||I.Rows) for(var j=0;j<I.Items.length;j++) {
         var dp = I.Rows ? (I.Items[j].Row ? T.Rows[I.Items[j].Row].MenuCheck : null) : (I.Items[j].Col ? T.Cols[I.Items[j].Col].MenuCheck : null);
         if(dp==null && et["hidden"]) dp = 1;
         if(dp!=null && !I.Items[j].Value!=!dp) M.SetValue(I.Items[j],dp?1:0);
         }
      } 
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
// Creates and sends the request for PDF
TGP.ActionExportPDF = function(dummy,T){
if(!this.Source.ExportPDF.Url&&!this.Source.ExportPDF.Script||this.Locked["print"]) return false;
if(T) return true;
if(Grids.OnExportStart && Grids.OnExportStart(this,1)) return;
var has = this.HasSelected(); this.PrintSelectedRows = has&5; this.PrintSelectedCols = has&6;
var O = null; T = this;

function finish(M){ 
   var P = T.Source.ExportPDF.Param;
   P.PDFName = T.PDFName ? T.PDFName : T.id;
   P.PDFFormat = T.PDFFormat;
   P.PDFPageSize = T.PrintPageSize; 
   P.PDFPageOrientation = T.PrintPageOrientation; 
   P.PrintPageSize = T.PrintPageSize;
   P.PrintPageOrientation = T.PrintPageOrientation;
   P.PrintDPI = T.PrintDPI;
   P.PrintMarginWidth = T.PrintMarginWidth;
   P.PrintMarginHeight = T.PrintMarginHeight;
   P.PrintPageWidth = Math.round(T.PrintPageWidth*25.4/T.PrintDPI+T.PrintMarginWidth); 
   P.PrintPageHeight = Math.round(T.PrintPageHeight*25.4/T.PrintDPI+T.PrintMarginHeight); 
   P.PDFFitPage = T.PDFFitPage;
   P.PDFText = T.PDFText;
   var zal = T.Filtered; T.Filtered = !T.PrintFiltered;
   T.DoExport(M,T.Source.ExportPDF); 
   T.Filtered = zal;
   }
if(!this.ExportPDFCols || !this.ShowCfg) finish();
else this.ShowPrintMenu(finish,1);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.DoExport = function(M,E){
MS.Debug; this.Debug(4,"Exporting grid"); this.StartTimer("Export"); ME.Debug;
var Cols = {}, cols = 0, Rows = {}, rows = 0;
if(M) for(var i=0;i<M.Items.length;i++){
   var I = M.Items[i];
   if(I.Cols) for(var j=0;j<I.Items.length;j++) { var II = I.Items[j]; if(II.Name&&this.Cols[II.Name]) { Cols[II.Name] = II.Value; this.Cols[II.Name].MenuCheck = II.Value; cols++; } }
   else if(I.Rows) for(var j=0;j<I.Items.length;j++) { var II = I.Items[j]; if(II.Row&&this.Rows[II.Row]) { Rows[II.Row] = II.Value; this.Rows[II.Row].MenuCheck = II.Value; rows++; } }
   }
if(this.SaveAttrs&&this.SaveAttrs.indexOf("MenuCheck")>=0) this.SaveCfg();
if(!cols){ 
   var can = E==this.Source.ExportPDF ? "CanPrint" : "CanExport", prn = can=="CanPrint"; 
   for(var c in this.Cols) { var cn = this.Cols[c][can]; Cols[c] = cn==1||prn&&cn==2 ? this.Cols[c].Visible : cn ? 1 : 0; }
   }

if(Grids.OnExportInit && Grids.OnExportInit(this,Cols,Rows,E)) return true;

if(E) {
   var typ = E.Type; if(!typ || typ-0) typ = "settings";
   if(typ.search(/cells|changes|data|body|all/i)<0 && !this.CanReload()) return false; 
   var F = this.GetUploadFormat(E);
   if(E.Flags) typ += ","+E.Flags;
   this.SaveExport(this.GetXmlData(typ,E.Attrs,Cols,E,null,Rows),E);
   return true;
   }

if(BIEA&&!BIEA10&&!this.Source.Export.Url&&!this.Source.Export.Script) {
   alert(this.GetAlert("ExportIE")); return false;
   }

var frm = this.ExportFormat; if(!frm) return false;
if(!this.SuppressMessage && (this.LoadedCount > this.SynchroCount || this.ExportLoad && (this.Paging==3||this.ChildPaging==3))) {
   if(frm=="xlsx") this.ShowProgress(this.GetText("ExportProgressCaption"),this.GetText("ExportProgressText"),this.GetText("ExportProgressCancel"),0,100);
   else this.ShowMessage(this.GetText("ExportProgressCaption"));
   var T = this; setTimeout(function(){ T.DoClientExport(frm,Cols,Rows,1); },10);
   return true;
   }
return this.DoClientExport(frm,Cols,Rows,0);
}
// -----------------------------------------------------------------------------------------------------------
TGP.DoClientExport = function(frm,Cols,Rows,progress){
var T = this, et = this.ConvertFlags(this.ExportType,CExportTypeFlags);
MS.Paging; if(this.ExportLoad && (this.Paging==3||this.ChildPaging==3) && (!et["selected"]||this.ExportLoad==2)) this.DownloadAllPagesSync(et["expanded"],et["filtered"]); ME.Paging;
this.ApplyMedia(1,"export");

if(frm=="xls"||frm=="csv"){
   var val = this.GetExport(Cols,Rows);
   this.SaveExport(et["nobom"]?val:"\ufeff"+val);
   return true; 
   }

MS.Xlsx;
if(frm=="xlsx"){
   if(progress) this.ShowProgress(this.GetText("ExportProgressCaption"),this.GetText("ExportProgressText"),this.GetText("ExportProgressCancel"),20,100);
   function Cancel(){ T.File = null; T.CancelProgress = 0; T.HideMessage(); }
   function Save(val){    
      if(T.CancelProgress) return Cancel();
      T.File = null; T.SaveExport(val); 
      }
   function Export(){
      if(T.CancelProgress) return Cancel();
      T.ExportXlsx(Save,progress?2:0);
      }
   function Start(){
      if(T.CancelProgress) return Cancel();
      T.SaveSheet(T.GetAlert("DefaultSheet"),Cols,Rows);
      if(progress) T.ShowProgress(T.GetText("ExportProgressCaption"),T.GetText("ExportProgressText"),T.GetText("ExportProgressCancel"),40,100);
      setTimeout(function(){ 
         if(T.CancelProgress) return Cancel();
         T.GetExportImages(T.File.ImgCache,Export); 
         },10);
      }
   setTimeout(Start,10);
   return true;   
   }
ME.Xlsx;

return false;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SaveExport = function(val,E){
if(val<0) {
   this.Debug(2,"TreeGrid Export module not available"); 
   alert(this.GetAlert("ExportError"));
   return;
   }
MS.Debug; this.Debug(4,"TreeGrid generated export data in ",this.StopTimer("Export")," ms"); ME.Debug;
this.HideMessage();
this.ApplyMedia(1);
var typ = E ? (E==this.Source.ExportPDF?1:0) : ((this.Source.Export.Type+"").toLowerCase()=="export" || BIEA&&!BIEA10 ? 3 : 2);
if(Grids.OnExport){ var v = Grids.OnExport(this,val,typ); if(v){ if(typeof(v)!="string") return; val = v; } }   
if(typ==2) { 
   try { if(TGSaveFile(val,(this.ExportName?this.ExportName:this.id)+"."+this.ExportFormat)) return; }
   catch(e) { } 
   }
this.SendExport(val,null,null,E);
}
// -----------------------------------------------------------------------------------------------------------
// Sends the exported data to server
TGP.SendExport = function(val,url,name,E){
if(!E) E = this.Source.Export;
if(E==this.Source.Export){ E.Param.ExportName = this.ExportName?this.ExportName:this.id; E.Param.ExportFormat = this.ExportFormat; E.Param.ExportType = this.ExportType; }
if(!url&&!E.Url&&!E.Script){ this.Debug(2,"Direct saving not supported and missing server Export_Url/Script"); alert(this.GetAlert("ExportError")); return; }
var D = document.createElement("form");
D.method = "POST";
D.action = url ? url : (E.Script?(E.Script.search(/javascript\:/i)<0?"javascript:":"")+E.Script:E.Url);
D.acceptCharset = "UTF-8";
if(BIEA && !BIEA9) { 
   I = document.createElement("input");
   I.name = "tmp";
   I.type = "hidden";
   I.value = "\u9760";
   D.appendChild(I);
   }
var I = document.createElement("input");
I.type = "hidden";
I.name = name?name:(E.Data?E.Data:"Data");

if(!E.Xml && val.replace) val = val.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
   
I.value = val;
D.appendChild(I);
for(var i in E.Param){ 
   I = document.createElement("input");
   I.type = "hidden";
   I.name = i;
   I.value = E.Param[i];
   D.appendChild(I);
   }

if(E.Params){
   var A = E.Params.split('&');
   for(var i=0;i<A.length;i++){
      var s = A[i].split('=');
      if(s[0]){
         I = document.createElement("input");
         I.type = "hidden";
         I.name = unescape(s[0]);
         I.value = unescape(s[1]);
         D.appendChild(I);
         }
      }
   }
document.body.appendChild(D);
D.submit();
document.body.removeChild(D);
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetExportSelected = function(){
var SR = null, SC = null, sel = 0; 
if(!this.Selecting) return [sel,SR,SC];
if(this.SelectingCells){
   var S = this.GetSelRanges(4,2);
   sel = S.length ? (S.Rows ? (S.Cols ? 4 : 5) : (S.Cols ? 6 : 7)) : S.Rows ? (S.Cols ? 4 : 1) : (S.Cols ? 2 : 0);
   if(S.length&&(!S.Rows||!S.Cols)){
      SC = {}; SR = {};
      for(var i=0;i<S.length;i++){
         for(var r=S[i][0],n=this.GetNext(S[i][2],4);r&&r!=n;r=this.GetNext(r,4)) SR[r.id] = r;
         for(var c=S[i][1],n=this.GetNextCol(S[i][3],0,2);c&&c!=n;c=this.GetNextCol(c,0,2)) SC[c] = c;
         }
      }
   }
else sel = this.SelectingCols&&this.GetSelCols().length ? (this.GetSelRows(1).length ? 3 : 2) : this.GetSelRows(1).length ? 1 : 0;
if(!sel) {
   if(!this.FRow) sel = 3; 
   else if(this.FRect) {
      var F = this.FRect;
      if(!F[7]) for(var SR={},r=F[0],n=this.GetNext(F[2],4);r&&r!=n;r=this.GetNext(r,4)) SR[r.id] = r;
      if(!F[6]) for(var SC={},c=F[1],n=this.GetNextCol(F[3],0,2);c&&c!=n;c=this.GetNextCol(c,0,2)) SC[c] = c;
      sel = F[6] ? (F[7] ? 0 : 1) : F[7] ? 2 : 3;
      }
   else { 
      SR = {}; SR[this.FRow.id] = this.FRow; sel = 1; 
      if(this.FocusRect) { SC = {}; SC[this.FCol] = this.FCol; sel = 3; } 
      } 
   }
return [sel,SR,SC];
}
// -----------------------------------------------------------------------------------------------------------
function MergeColors(c,c2){ 
   if(!c) return c2;
   if(!c2) return c;
   c = (c+"").toLowerCase(); if(CColors[c]) c = CColors[c];
   c2 = (c2+"").toLowerCase(); if(CColors[c2]) c2 = CColors[c2];
   c = HexToRgb(c); c2 = HexToRgb(c2);
   for(var i=0;i<3;i++) if(c[i]>128) { c[i] += c2[i]-255; if(c[i]<128) c[i] = 128; }
   return "#"+Number((((c[0]&255)|256)<<16)+((c[1]&255)<<8)+(c[2]&255)).toString(16).slice(1);
   }
// -----------------------------------------------------------------------------------------------------------
TGP.GetExportColor = function(r,c,color,op,sel){
var clr = null;
if(Grids.OnGetColor){ var rgb = color ? HexToRgb(color) : [255,255,255]; clr = Grids.OnGetColor(this,r,c,rgb[0],rgb[1],rgb[2],1); }
if(r.Kind=="Header") clr = op.HeaderColor;
if(r.Fixed=="Head"&&!clr) clr = op.HeadColor;
if(r.Fixed=="Foot"&&!clr) clr = op.FootColor;
if(this.Cols[c]){
   if(this.Cols[c].MainSec==0&&!clr) clr = op.LeftColor;
   if(this.Cols[c].MainSec==2&&!clr) clr = op.RightColor;
   }
if(clr) color = MergeColors(color,clr);
var clr = null;
if(r.Deleted) clr = op.DeletedColor;
else if(r.Added) clr = op.AddedColor;
else if(r.Changed) clr = r[c+"Changed"] ? op.ChangedCellColor : r.Moved>=(this.Sorting?2:1) ? op.MovedColor : op.ChangedColor;
else if(r.Moved>=(this.Sorting?2:1)) clr = op.MovedColor;
if(clr) color = MergeColors(color,clr);
if(sel){
   var clr = null;
   if(r.Selected&2&&r[c+"Selected"]) clr = op.SelectedCellsColor;
   if(clr==null && r.Selected&1) clr = op.SelectedRowsColor;
   if(clr==null && this.Cols[c] && this.Cols[c].Selected) clr = op.SelectedColsColor;
   if(clr) color = MergeColors(color,clr);
   }
if(this.ExportAlternate&&r.ColorPos) {
   var alt = r["AlternateColor"]; if(!alt) alt = r.Def["AlternateColor"];
   if(alt==null) alt = op.AlternateColor; if(alt) color = MergeColors(color,alt);
   }
if(this.SearchActionMark){ 
   if(this.SearchType&256){
      if(r.MarkColor) color = r.MarkColor;
      if(r[c+"MarkColor"]) color = r[c+"MarkColor"];
      }
   else {
      function updateclr(rgb) {
         rgb += 0x2FFBFEFF; 
         var cr = (rgb>>20)-512; if(cr<0) cr = 0; else if(cr>255) cr = 255;
         var cg = ((rgb>>10)&1023)-512; if(cg<0) cg = 0; else if(cg>255) cg = 255;
         var cb = (rgb&1023)-512; if(cb<0) cb = 0; else if(cb>255) cb = 255;
         return cr==255&&cg==255&&cb==255 ? "" : "rgb("+cr+","+cg+","+cb+")";
         }
      if(r.MarkColor) color = MergeColors(color,updateclr(r.MarkColor));
      if(r[c+"MarkColor"]) color = MergeColors(color,updateclr(r[c+"MarkColor"]));
      }
   }
return color;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetExportSpan = function(r,c,Rows,Cols,nospan){
var vis = r[c+"Visible"]; if(vis==null) vis = r.Def[c+"Visible"]; if(vis<=-2) return null;
MS.ColSpan;
if(r.Spanned&&r[c+"Span"]==0){
   for(var p=this.GetPrevCol(c,null,2);r[p+"Span"]==0;p=this.GetPrevCol(p,null,2)) if(Cols[p]) break;
   if(!Cols[p]) c = this.GetSpanCol(r,c);
   }
ME.ColSpan;
MS.RowSpan;
if(r.RowSpan&&r[c+"RowSpan"]==0){
   for(var p=this.GetPrev(r);p[c+"RowSpan"]==0;p=this.GetPrev(p)) if(Rows[p.id]) break;
   if(!Rows[p.id]) r = this.GetSpanRow(r,c);
   }
ME.RowSpan;
var rspan = 1, cspan = 1, width = null;
if(!nospan){
   MS.ColSpan;
   var a = "Span", v = r[c+a]; 
   if(v==0) cspan = 0; 
   else if(v>1){ 
      for(var i=0,cs=this.Cols[c],CN=this.ColNames[cs.Sec],cp=cs.Pos,width=0;cp<CN.length&&i<v;i++,cp++) if(!Cols[CN[cp]]) { v--; i--; } else width += cs.Width;
      if(cp==CN.length&&!this.AutoColPages&&i<v) v = i;
      cspan = v; 
      }
   ME.ColSpan;
   MS.RowSpan;
   var a = "RowSpan", v = r[c+a]; 
   if(v==0) rspan = v;
   else if(v>1) {
      var ch = 0; if(v%1) { ch = 1; v = Math.floor(v); }
      for(var i=0,ra=r;ra&&i<v;i++,ra=this.GetNext(ra)) if(!Rows[ra.id]) { v--; i--; } else if(ra.Level>r.Level) v++;
      if(ch) while(ra&&ra.Level>r.Level){ ra = this.GetNext(ra); v++; }
      if(!ra&&!this.AutoPages&&i<v) v = i;
      rspan = v;
      }
   ME.RowSpan;
   }
else if(r.Spanned&&r[c+"Span"]==0 || r.RowSpan&&r[c+"RowSpan"]==0) vis = 0;
return [r,c,rspan,cspan,vis,width];
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetExportUser = function(r,C,f,l,v,keep){
var sp = l; for(var i=l-1;i>=f;i--) if(r[C[i].Name+"Visible"]<=-2||r.RowSpan&&r[C[i].Name+"RowSpan"]==0) sp = i; 
if(!sp) return null;
if(v&&v.search(/[<&]/)>=0) v = keep ? v.replace(/&/g,"&amp;").replace(/</g,"&lt;") : v.replace(CRepAmp,"&amp;").replace(CRepLt,"&lt;"); 
return [v,sp];
}
// -----------------------------------------------------------------------------------------------------------
var CExportFormatsLower = { 'm': 'M' , 'mm': 'MM' , 'mmm': 'MMM' , 'mmmm': 'MMMM'  };
var CExportFormats = {
   '0': '0', '#': '#', '?': '?', '8': '0', '.': '.', ',': ',', '_': '_', '%': '%', ';':';', 
   ' ': ' ' , '/': '/' , ':': ':' ,
   'd': 'd' , 'dd': 'dd' , 
   'ddd': 'ddd' , 'dddd': 'dddd' , 'ddddd': 'ddd' , 'dddddd': 'd' ,
   'M': 'm' , 'MM': 'mm' , 'MMM': 'mmm' , 'MMMM': 'mmmm' , 
   'MMMMMMM':'mmmm' , 'MMMMMMMM':'mmmm', 
   'y': 'yy', 'yy': 'yy' , 'yyyy': 'yyyy' ,
   'h': 'h' , 'hh': 'hh' , 'hhh': '[h]' ,
   'H': 'h' , 'HH': 'hh' ,
   'm': 'm' , 'mm': 'mm' , 'mmm': '[m]' ,
   's': 's' , 'ss': 'ss' , 'sss': '[s]' , 
   'f': '0' , 'ff': '00' , 'fff': '000' ,
   't': 'A/P' , 'tt': 'AM/PM' 
   };
var CExportFormatsUnsupported = {
   'ddddddd': 1 , 'dddddddd': 1 ,
   'D': 1 , 'DD': 1 , 'DDD': 1 ,
   'DDDD': 1 , 'DDDDD': 1 ,
   'DDDDDD': 1 , 'DDDDDDD': 1 ,
   'MMMMM': 1 , 'MMMMMM': 1 ,
   'yyy': 1 ,
   'hhhh': 1 , 'hhhhh': 1 ,
   'HHH': 1 , 'HHHH': 1 , 'HHHHH': 1 ,
   'mmmm': 1 , 'mmmmm': 1 ,
   'ssss': 1 , 'sssss': 1 ,
   'ffff': 1 , 'fffff': 1 ,
   'z': 1 , 'zz': 1 , 'zzz': 1 
   }
var CExportFormatsDefaults =  { '':'0', '0':1, 'f':2, 'p':10, 'd':14, 'D':15, 'm':16, 'y':17, 'i':18, 'I':19, 't':20, 'T':21, 'h':22, '@':49 }; 
var CEmptySpaces = "                                                                                                    "; 
// -----------------------------------------------------------------------------------------------------------
TGP.ConvertExportFormat = function(frm,typ,unsup,nohtml){
if(CExportFormatsDefaults[frm]) return frm;
var L = this.Lang.Format, lwr = 0;
if(!typ) typ = typ=="@" ? 3 : L.IsDate(frm) ? 1 : 2;
if(typ==1){ 
   frm = L.PrepareDateFormat(frm,'.');
   lwr = L.DateFormatLowercase;
   }
else if(typ==2){ 
   frm = L.PrepareNumberFormat(frm);
   if(frm.indexOf(",")>=0) frm = frm.replace(/(^|;)([^0#]*),([\s\-]*)/g,"$1$2$3#,");
   
   }
else { 
   return frm;
   }
var M = frm.match(/'[^']*'|"[^"]*"|0|#|\?|8|\.|\,|%|[eE][\+\-]?[0#]+|;|\[[^\]]*\]|_|\\.|:|\/|am\/pm|AM\/PM|a\/p|A\/P|d+|D+|M+|y+|h+|H+|m+|s+|f+|t+|z+|@|<\/?[^>]+>|<\/?[^>]+>|&\w+;|.+?/g);
for(var i=0;i<M.length;i++){ 
   if(lwr&&CExportFormatsLower[M[i]]){
      for(var j=0,d=0,mm=0,h=0,m=0;j<M.length;j++){
         var c = M[j].charAt(0);
         if(c=="d"||c=="y") d = 1;
         else if(c=="M") mm = 1;
         else if(c=="h"||c=="H") h = 1;
         else if(c=="m"&&j!=i) { if(j<i) mm = 1; m = 1; }
         }
      if(d&&!mm&&(!h||m&&h)) M[i] = CExportFormatsLower[M[i]];
      }
   var c = CExportFormats[M[i]]; 
   if(c) M[i] = c;                           
   else if(CExportFormatsUnsupported[M[i]]){
      if(unsup) M[i] = L.Unsupported;
      else return unsup===0?null:false;
      }
   else if(M[i].length==1) M[i] = "\\"+M[i]; 
   else { 
      c = M[i].charAt(0);
      if(c=="'"||c=='"') M[i] =  M[i].slice(1,-1);
      if(M[i].charAt(0)=='[' && M[i].search(/[~!%\^&\*<>=\/\+\-\|\?]/)>=0 && M[i].charAt(1).search(/[><=$]/)<0) { while(i<M.length&&M[i]!=";") M[i++] = ""; M[i] = ""; } 
      if(M[i].indexOf("<")>=0) {        
         if(i==0||M[i-1]==";") { c = null; M[i] = M[i].replace(/['"]?\s?<\w+.*['";]color\s*:\s*([a-zA-Z]+).*>['"]?/g,"[$1]"); } 
         if(M[i].indexOf("<")>=0){
            if(nohtml) return nohtml===1?null:false;
            M[i] = M[i].replace(CRepHtml,""); 
            }
         }
      if(M[i]&&M[i].search(/\S/>=0)){
         if(c=="'") M[i] = '"' + M[i].replace(/"/g,'"\\""') + '"'; 
         else if(c=='"') M[i] = '"'+M[i]+'"';
         }
      }
   }
frm = M.join("");

return frm;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetExportRatio = function(){
var D = document.createElement("div"); 
D.style.display = "none"; 
D.innerHTML = "<div class='"+this.Img.Size+"'><div>X</div></div><div class='"+this.Img.Style+"Main'><div>X</div></div>";
document.body.appendChild(D);
var rat = parseFloat(GetStyle(D.firstChild.firstChild).fontSize) / parseFloat(GetStyle(D.lastChild.firstChild).fontSize);
D.parentNode.removeChild(D);
return rat ? rat : 1;
}
// -----------------------------------------------------------------------------------------------------------
ME.Export;

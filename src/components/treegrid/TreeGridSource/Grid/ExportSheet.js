// -----------------------------------------------------------------------------------------------------------
// Functions for export
// -----------------------------------------------------------------------------------------------------------
MS.Export;
MS.Xlsx;
// -----------------------------------------------------------------------------------------------------------
TGP.ExportXlsx = function(func,progress){
if(!this.File) { if(func) func(-2); return; }
var T = this;
if(this.JSZip && !window.JSZip){
   if(Grids["JSZipData"]) eval(Grids["JSZipData"]);
   else {
      MS.Ajax;
      LoadScript(this.AddPath("External/jszip.min.js"),function(dummy){
         if(!window.JSZip) T.JSZip = 0;
         T.ExportXlsx(func,progress);
         });
      ME.Ajax;
      return;
      }
   }
if(progress==2){ 
   this.ShowProgress(this.GetText("ExportProgressCaption"),this.GetText("ExportProgressText"),this.GetText("ExportProgressCancel"),60,100); 
   setTimeout(function(){ T.ExportXlsx(func,1); },10);
   return;
   }
var F = ExportXlsx(this.File);
if(progress==1){
   this.ShowProgress(this.GetText("ExportProgressCaption"),this.GetText("ExportProgressText"),this.GetText("ExportProgressCancel"),80,100); 
   setTimeout(function(){ SaveZip(F,func,null,this.ExportCompression); },10);
   return;
   }
SaveZip(F,func,null,this.ExportCompression);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetExportImages = function(urls,func){
var cnt = GetCount(urls), lcnt = cnt, T = this; if(!cnt) { func(urls); return; } 

function loaded(ret,data,D){
if(ret<0) { urls[D.Url][2] = ""; cnt--; }
else { 
   var U = urls[D.Url], typ = GetDataType(D.Url); 
   data = "data:"+typ+";base64,"+ToBase64(data);
   if(typ.indexOf("svg")<0){ U[2] = data; if(U[0]-0&&U[1]-0) cnt--; }
   else U[3] = data;
   }
if(!--lcnt) read();
}

function error(){
T.canvg = 0;
for(var url in urls) if(urls[url]&&!urls[url][2]) urls[url][2] = "";
func(urls);
}

function canvgloaded(dummy){
if(!window.canvg) return error();
T.canvg = 1;
for(var url in urls) if(urls[url]&&urls[url][4]) urls[url][4].onload = null;
read();
}

function readed(){
var I = this, U = urls[I.url], w = U[0]-0, h = U[1]-0; 
if(!w||!h){
   
   if(w) h = !I.height ? 64 : !I.width ? I.height : Math.round(I.height/I.width*w);
   else if(h) w = !I.width ? 64 : !I.height ? I.width : Math.round(I.width/I.height*h);
   else { w = I.width ? I.width : 64; h = I.height ? I.height : 64; }
   U[0] = w; U[1] = h;
   if(I.parentNode) I.parentNode.removeChild(I);
   }
if(U[2]==null){
   var C = document.createElement("canvas"); C.width = w; C.height = h;
   try { C.getContext("2d").drawImage(I,0,0,w,h); U[2] = C.toDataURL(); }
   catch(e){ 
      if(T.canvg=="0"||window.canvg) return error();
      if(T.canvg<0) return; 
      if(Grids["canvgData"]) {
         eval(Grids["canvgData"]);
         if(!window.canvg) return error();
         T.canvg = 1;
         for(var url in urls) if(urls[url]&&urls[url][4]) urls[url][4].onload = null;
         read();
         }
      else {
         MS.Ajax;
         T.canvg = -1;
         LoadScript(T.AddPath("External/canvg.js"),canvgloaded);
         ME.Ajax;
         return;
         }
      }
   }
if(!--cnt) func(urls);
}

function read(){
if(!cnt) { func(urls); return; }
for(var url in urls) {
   var U = urls[url]; if(U[2]!=null&&U[0]-0&&U[1]-0) continue;
   if(T.canvg>0&&U[2]==null){
      var C = document.createElement("canvas"), w = U[0]-0, h = U[1]-0, svg = FromBase64(U[3].slice(U[3].indexOf("base64,")+7),1); 
      if(!w||!h){ 
         var M = svg.match(/<svg\b[^>]*\swidth\s*=\s*['"](\w+)['"]/), ww = M&&M[1] ? parseInt(M[1]) : 0; 
         var M = svg.match(/<svg\b[^>]*\sheight\s*=\s*['"](\w+)['"]/), hh = M&&M[1] ? parseInt(M[1]): 0;
         if(w) h = !hh ? 64 : !ww ? hh : Math.round(hh/ww*w);
         else if(h) w = !ww ? 64 : !hh ? ww : Math.round(ww/hh*h);
         else { w = ww ? ww : 64; h = hh ? hh : 64; }
         U[0] = w; U[1] = h;
         }
      C.width = w; C.height = h;
      canvg(C,svg);
      U[2] = C.toDataURL();
      if(!--cnt) { func(urls); return; }
      continue;
      }
   
   var I = document.createElement("img");
   if(!(U[0]-0) || !(U[1]-0)) { I.style.visibility = "hidden"; I.style.position = "absolute"; I.style.left = "0px"; I.style.top = "0px"; document.body.appendChild(I); } 
   I.setAttribute('crossOrigin','anonymous');
   U[4] = I; 
   I.onload = readed;
   I.url = url; 
   I.src = U[2]!=null?U[2]:U[3]; 
   }
}

for(var url in urls){
   var U = urls[url];
   if(U[2]!=null) { lcnt--; if(U[0]-0&&U[1]-0) cnt--; }
   else if(url.slice(0,5)=="data:"){
      lcnt--;
      if(GetDataType(url).indexOf("svg")<0){ U[2] = url; if(U[0]-0&&U[1]-0) cnt--; }
      else U[3] = url;
      }
   else AjaxCall({Url:url,Timeout:10,Format:GetDataType(url).indexOf("svg")<0?"xlsx":""},"",loaded);
   }
if(!lcnt) read();
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetExportCalcHeight = function(row,O){
var gh = 0, A = [], zal = this.Printing; this.Printing = 1;
A[A.length] = this.GetWidthsTagHTML();
var SS = this.GetSS(); this.GetWidthsHTML(row.parentNode,SS);
for(var i=this.FirstSec;i<=this.LastSec;i++) if(SS[i]) A[A.length] = SS[i].join("");
A[A.length] = "</tr><tr>";
var SS = this.GetSS(); this.GetRowHTML(row,SS,0);
if(this.LeftTD) A[A.length] = "<td style='width:0px;'></td>";
for(var i=this.FirstSec;i<=this.LastSec;i++) if(SS[i]) A[A.length] = SS[i].join("");
A[A.length] = "</tr>"+CTableEnd;
O.innerHTML = A.join("");
var h = O.offsetHeight;
O.innerHTML = "";
return h;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SaveSheet = function(sheet,VCols,VRows){
if(this.EditMode&&this.EndEdit(1)==-1) return null;
if(!this.File) this.File = CreateXlsx();
var X = this.File, T = this, et = this.ConvertFlags(this.ExportType,CExportTypeFlags), op = FromJSON(this.ExportOptions,1);
var ei = this.ConvertFlags(this.ExportImages,"img,html,other,icon,side,button,panel,bool,space,indent,resize,two");
var el = this.ConvertFlags(this.ExportLinks,"link,html,other,underline");
if(!sheet) sheet = X.Sheet;
var OO = X.Sheets[sheet]; if(!OO) OO = CreateSheet(X,sheet);
var O = OO.Data, L = this.Lang.Format;

var Cfg = ["FormulaShow","DefaultBorder","DefaultBorderColor","HideZero","Scale","ReversedTree","ReversedColTree","ColTree","HideTree","ExportFontSize","ExportFontFace","ExportTextShadow","ExportRowHeight"];
for(var i=0;i<Cfg.length;i++) if(this[Cfg[i]]!=null) O.Cfg[Cfg[i]] = this[Cfg[i]];

var Attrs = ["Align","Wrap","Indent","Rotate"];
if(this.DynamicStyle) Attrs.push("TextStyle","TextSize","TextFont","TextColor","PatternColor","Pattern","CenterTo");
if(this.DynamicBorder) Attrs.push("BorderLeft","BorderRight","BorderTop","BorderBottom");
var alen = Attrs.length;
var rat =  et["size"]&&this.Size!="Normal" ? this.GetExportRatio() : 1;
O.Cfg.ExportFontSize *= rat;
var wdiff = (!et["size"] ? this.Img.Width : rat ? rat : 1) / this.ExportWidthRatio;
if(et["filtered"]) this.CalculateNoFilter();
var s = ""; for(var n in this.Locked) if(n!="index"&&n!="length") s += n+",";
O.Cfg.Locked = s.slice(0,-1);

if(this.DefCols.C.Width) O.DefCols.C.Width = this.DefCols.C.Width*(et["size"]?this.Img.Width:1);
var rh = this.ExportRowHeight ? this.ExportRowHeight : this.RowHeight, fb = 0;
O.Cfg.MinRowHeight = this.ExportHeights>=2 ? rh : null;
O.Cfg.ImgAnchor = ei["resize"] ? 2 : ei["two"] ? 1 : 0; 

var A = et["selected"] ? this.GetExportSelected() : [], sel = A[0], SR = A[1], SC = A[2]; 

function CopyCol(c,S){
   var vis = c.Visible||!et["hide"];
   if(S&&(!c.CanExport||c.CanExport==1&&!(VCols&&VCols[c.Name]!=null?VCols[c.Name]:c.Visible||et["hidden"])||(sel&2&&!c.Selected&&(!SC||!SC[c.Name]))&&c.CanExport!=4)) {
      if(!fe||!c.HasIndex) return c==lc;
      
      vis = 0;
      }
   var n = { Name:c.Name=="id"?"_id":c.Name, Visible:vis, Level:0, Width:c.Width/wdiff, _Index:idx++ };
   if(et["stylecols"]){
      if(c.XlsFormat!=null) n.Format = c.XlsFormat;
      else { var v = c.ExportFormat; if(v==null) v = c.Format; if(v) n.Format = T.ConvertExportFormat(v,0,et["unsupported"]?1:0,et["stylenumbers"]?1:0); }
      if(!et["nostyle"]) {
         for(var i=0;i<alen;i++){ var v = c[Attrs[i]]; if(v) n[Attrs[i]] = v; }
         if(T.ExportTextShadow&&(c.TextShadow||c.TextShadowColor)&&!n.TextColor) n.TextColor = c.TextShadowColor ? c.TextShadowColor : T.ExportTextShadow-0 ? "#999999" : T.ExportTextShadow;
         }
      if(!et["nocolor"]) { var v = c.Color; if(v) n.Color = v; }
      }
   var v = c.CanEdit; if(v!=null) n.CanEdit = v;
   var v = c.FormulaCanEdit; if(v!=null) n.FormulaCanEdit = v;
   if(Grids.OnExportCol) Grids.OnExportCol(T,c,n);
   if(!S) return n;
   S[S.length] = n; 
   C[C.length] = n;
   Cols[c.Name] = n;
   if(c.Color) fb = 1;
   return c==lc;
   }
var fe = this.FormulaEditing&&!et["noformula"];
var idx = 1, CC = this.ColNames, C = [], Cols = {}, lc = this.AutoColPages ? this.Cols[this.GetLastDataCol(67+(et["outline"]?256:0))] : null, lcnt = 0, rcnt = 0; O.LeftCols = []; O.Cols = []; OO.Cols = Cols;
for(var j=0;j<CC.length;j++) {
   if(j==1) lcnt = C.length;
   else if(j==CC.length-1) rcnt = C.length;
   for(var i=0;i<CC[j].length;i++) if(CopyCol(this.Cols[CC[j][i]],j||!et["fixedcols"]?O.Cols:O.LeftCols)) { j = CC.length; break; }
   }
O.DefCols = { "C" : CopyCol(this.DefCols.C) };
if(et["nonextcols"]) O.DefCols.C.Visible = 0;
var noflt = et["filtered"] || !this.HasFilter();

MS.ColTree;
if(et["outline"]||et["expanded"]){
   var F = this.GetFixedRows(), P = {};
   for(var c in Cols) for(var i=0;i<F.length;i++) if(F[i][c+"ExpandCols"]){ 
      var v = F[i][c+"ExpandCols"].split(",");
      for(var j=0;j<v.length;j++) P[v[j]] = c;
      }
   for(var c in P) if(Cols[c]){
      for(var i=0,a=P[c];a&&i<20;i++,a=P[a]); 
      if(i) Cols[c].Visible = et["expanded"] ? 1 : this.Cols[c].Visible;
      if(et["outline"]&&this.ColTree>1) Cols[c].Level = i;
      }
   }
ME.ColTree;

function CopyRow(r,B){
   var D = r.Def, vis = r.Visible||!et["hide"], exp = r.CanExport; if(exp==null) exp = D.CanExport; 
   if(noflt&&r.Kind=="Filter") return false; 
   if(!exp||exp==1&&(VRows&&VRows[r.id]!=null?!VRows[r.id]:!r.Visible&&!et[r.Filtered?"filtered":"hidden"])) {
      if(!fe||!r.HasIndex) return lr==r;
      
      vis = 0;
      }
   if(exp==2 || (sel&1&&!r.Selected&&(!SR||!SR[r.id]))&&exp!=4) {
      
      if(!fe||!r.HasIndex) { 
         for(var a=r.firstChild;a;a=a.nextSibling) if(CopyRow(a,B)) return true;
         return;
         }
      
      vis = 0;
      }
   var n = { id:r.id, Visible:vis, _Index:idx++ };
   if(r.firstChild&&rev){
      
      for(var a=r.firstChild;a;a=a.nextSibling) if(CopyRow(a,B)) return true; 
      }
   Rows[n.id] = n;
   B[B.length] = n;
   R[R.length] = n;
   if(T.ExportHeights){
      if(T.ExportHeights==1||T.ExportHeights==2){
         var h = r.Height; if(h==null&&(!D.HeightSet||T.ExportHeights==2&&!T.ExportRowHeight)) h = D.Height;
         if(h==null&&T.ExportHeights==2) h = rh;
         if(h&&h!=O.Cfg.MinRowHeight) n.Height = h;
         }
      else if(T.ExportHeights>=3){
         var v = 0; if(T.ExportHeights==4) { v = r.MaxHeight; if(v==null) v = D.MaxHeight; }
         if(r.r1&&!v) n.Height = r.r1.offsetHeight;
         else {
            if(!TV){
               TV = document.createElement("div");
               var s = TV.style;
               s.position = "absolute"; s.left = "0px"; s.top = "0px"; s.visibility = "hidden";
               TV.className = (T.WordWrap?T.Img.Style+"WordWrap":"");
               T.AppendTag(TV);
               }
            if(v) r.MaxHeight = 0;
            n.Height = T.GetExportCalcHeight(r,TV);
            if(v) r.MaxHeight = v;
            }
         }
      }
   if(et["stylerows"]){
      if(!et["nostyle"]){
         for(var i=0;i<alen;i++){ var v = r[Attrs[i]]; if(v==null) v = D[Attrs[i]]; if(v) n[Attrs[i]] = v; }
         if(T.ExportTextShadow&&(r.TextShadow||r.TextShadowColor||D.TextShadow||D.TextShadowColor)&&!n.TextColor) {
            var v = r.TextShadowColor; if(v==null) v = D.TextShadowColor; n.TextColor = v ? v : T.ExportTextShadow-0 ? "#999999" : T.ExportTextShadow;
            }
         var v = r.VertAlign; if(v==null) v = D.VertAlign; if(v!=null&&CVertAlignTypes[v]!="Bottom") n.VertAlign = v;
         }
      if(!et["nocolor"]){
         var v = r.Color; if(v==null) v = D.Color; if(v!=null) n.Color = v;
         }
      var v = r.CanEdit; if(v==null) { v = D.CanEdit; if(v==1) v = null; } if(v!=null) n.CanEdit = v;
      var v = r.FormulaCanEdit; if(v==null) v = D.FormulaCanEdit; if(v!=null) n.FormulaCanEdit = v;
      var v = r.XlsFormat; if(v==null) v = D.XlsFormat; 
      if(v!=null) n.Format = v;
      else { var v = r.ExportFormat; if(v==null) v = D.ExportFormat; if(v==null) v = r.Format; if(v==null) v = D.Format; if(v!=null) n.Format = T.ConvertExportFormat(v,0,et["unsupported"]?1:0,et["stylenumbers"]?1:0); }
      }
   
   MS.Tree;
   if(r.Level){ 
      if(et["outline"]) n.Level = r.Level;
      if(!et["expanded"]){
         for(var p=r.parentNode;p.Level>=0;p=p.parentNode) if(p.Visible==0||!p.Expanded) break;
         if(p.Level>=0) n.Visible = 0;
         }
      }
   ME.Tree;
   if(r.firstChild&&!rev){
      
      for(var a=r.firstChild;a;a=a.nextSibling) if(CopyRow(a,B)) return true; 
      }
   return lr==r;
   }
var idx = 1, Rows = {}, R = [], cl = C.length, edates = this.ExcelDates, mc = this.MainCol;
var lr = this.AutoPages ? this.GetLastDataRow(67+(et["outline"]?256:0)) : null, rev = this.ReversedTree, TV = null; OO.Rows = Rows;
var H = [], B = [], F = []; O.Head = H; O.Body = [B]; O.Foot = F;
if(this.ExportPrefix&&!fe){
   var n = { id:"_ExportPrefix", Visible:1, _Index:idx++ };
   n[C[0].Name] = this.ExportPrefix; n[C[0].Name+"Type"] = "EHtml";
   Rows[n.id] = n; (et["fixedrows"]?H:B).push(n); R[R.length] = n;
   }
for(var r=this.XH.firstChild;r;r=r.nextSibling) CopyRow(r,et["fixedrows"]?H:B);
var hcnt = B.length;
for(var b=this.XB.firstChild;b;b=b.nextSibling) for(var r=b.firstChild;r;r=r.nextSibling) if(CopyRow(r,B)) { b = this.XB.lastChild; break; }
var fcnt = B.length;
for(var r=this.XF.firstChild;r;r=r.nextSibling) CopyRow(r,et["fixedrows"]?F:B);
if(this.ExportPostfix){
   var n = { id:"_ExportPostfix", Visible:1, _Index:idx++ };
   n[C[0].Name] = this.ExportPostfix; n[C[0].Name+"Type"] = "EHtml";
   Rows[n.id] = n; (et["fixedrows"]?F:B).push(n); R[R.length] = n;
   }
if(TV) TV.parentNode.removeChild(TV);

if(this.ExportAlternate&&!this.Alternate){ this.Alternate = this.ExportAlternate; this.ReColor(1); this.Alternate = null; }
var I = null, keep = et["keephtml"];
var NF = this.NoExportFunc; if(NF) NF = new RegExp("\\b"+NF.replace(/,/g,"\\b|\\b")+"\\b");
for(var ri=0;ri<R.length;ri++) {
   var n = R[ri], r = this.Rows[n.id]; if(!r) continue;
   var D = r.Def; if(n.Color) fb = 1;
   for(var k=0;k<cl;k++) {
      var c = C[k].Name, cc = c, a, v; 
      if(c=="_id") c = "id";
      if(!k&&r.LeftHtml&&lcnt) { var U = this.GetExportUser(r,C,0,lcnt,r.LeftHtml,keep); if(U) { n[cc] = U[0]; n[c+"_t"] = "s"; n[cc+"Span"] = U[1]; k += U[1]-1; continue; } }
      if(k==lcnt&&r.MidHtml){ var U = this.GetExportUser(r,C,lcnt,rcnt,r.MidHtml,keep); if(U) { n[cc] = U[0]; n[c+"_t"] = "s"; n[cc+"Span"] = U[1]; k += U[1]-1; continue; } }
      if(k==rcnt&&r.RightHtml){ var U = this.GetExportUser(r,C,rcnt,cl,r.RightHtml,keep); if(U) { n[cc] = U[0]; n[c+"_t"] = "s"; n[cc+"Span"] = U[1]; k += U[1]-1; continue; } }
      if(sel&4 && !r[c+"Selected"] && !(r.Selected&1) && !this.Cols[c].Selected||sel&8 && !this.IsFocused(r,c)) continue;
      if(r.Spanned&&r[c+"Span"]!=1||r.RowSpan&&(r[c+"RowSpan"]>1||r[c+"RowSpan"]==0)){
         var U = this.GetExportSpan(r,c,Rows,Cols,et["nospan"]); 
         if(!U) {
            a = "BorderBottom"; v = r[c+a]; if(v==null) v = D[c+a]; if(v==null) v = r[a]; if(v==null) v = D[a]; if(v==null) v = CC[a]; if(v!=null) n[cc+a] = v;
            a = "BorderLeft"; v = r[c+a]; if(v==null) v = D[c+a]; if(v==null) v = r[a]; if(v==null) v = D[a]; if(v==null) v = CC[a]; if(v!=null) n[cc+a] = v;
            continue;
            }
         var vis = U[4], spanwidth = U[5]; r = U[0]; c = U[1]; if(U[2]!=1) n[cc+"RowSpan"] = U[2]; if(U[3]!=1) n[cc+"Span"] = U[3]; 
         }
      else {
         var spanwidth = null, vis = r[c+"Visible"]; if(vis==null) vis = D[c+"Visible"]; if(vis<=-2) continue;
         }
      if(fe) { a = "EFormula"; v = r[c+a]; if(v==null) v = D[c+a]; 
         if(v!=null&&(!NF||v.search(NF)<0)) {
            var F = this.EFormulas[r.id+"$"+c+"$"+v];
            if(!F||F[2]!=1&&F[2]!=4) n[cc+a] = v; 
            }
         }
      MS.Tree; if(et["indent"]&&cc==mc) n[cc+"Indent"] = n.Level; ME.Tree;
      var CC = r.Kind=="Header" ? {} : this.Cols[c];
      
      if(!et["nostyle"]){
         for(var i=0;i<alen;i++){ a = Attrs[i]; v = r[c+a]; if(v==null) v = D[c+a]; if(v==null) v = r[a]; if(v==null) v = D[a]; if(v==null) v = CC[a]; if(v!=null) n[cc+a] = v; }
         if(this.ExportTextShadow&&!n[cc+"TextColor"]){
            a = "TextShadowColor"; v = r[c+a]; if(v==null) v = D[c+a]; if(v==null) v = r[a]; if(v==null) v = D[a]; if(v==null) v = CC[a];
            if(v) n[cc+"TextColor"] = v;
            else { a = "TextShadow"; v = r[c+a]; if(v==null) v = D[c+a]; if(v==null) v = r[a]; if(v==null) v = D[a]; if(v==null) v = CC[a]; if(v) n[cc+"TextColor"] = this.ExportTextShadow-0 ? "#999999" : this.ExportTextShadow; }
            }
         a = "VertAlign"; v = r[c+a]; if(v==null) v = D[c+a]; if(v==null) v = r[a]; if(v==null) v = D[a]; if(v==null) v = CC[a]; else if(CVertAlignTypes[v]=="Bottom") v = null; if(v!=null) n[cc+a] = v;
         a = "CanEdit"; v = r[c+a]; if(v==null) v = D[c+a]; if(v==null) v = r[a]; if(v==null) { v = D[a]; if(v==1) v = null; } if(v==null) v = CC[a]; if(v!=null) n[cc+a] = v;
         a = "FormulaCanEdit"; v = r[c+a]; if(v==null) v = D[c+a]; if(v==null) v = r[a]; if(v==null) v = D[a]; if(v==null) v = CC[a]; if(v!=null) n[cc+a] = v;
         }
      if(!et["nocolor"]) { 
         a = "Color"; v = r[c+a]; if(v==null) v = D[c+a]; if(v==null&&!this.DynamicStyle) v = CC[a]; if(v==null) v = r[a]; if(v==null) v = D[a]; if(v==null) v = CC[a];
         v = this.GetExportColor(r,c,v,op); if(v!=null) { n[cc+"Color"] = v; fb = 1; }
         }
      if(vis<=0) continue;
      var a, v, pr = null, po = null;
      a = "HtmlPrefix"; pr = r[c+a]; if(pr==null) pr = D[c+a]; if(pr==null) pr = r[a]; if(pr==null) pr = D[a]; if(pr==null) pr = CC[a];
      a = "HtmlPostfix"; po = r[c+a]; if(po==null) po = D[c+a]; if(po==null) po = r[a]; if(po==null) po = D[a]; if(po==null) po = CC[a];
      MS.Filter;
      if(r.Kind=="Filter"&&r[c+"Filter"]) {
         var ff = L.ExportFilters.split(",")[r[c+"Filter"]];
         if(L.ExportFiltersHtml) ff = L.ExportFiltersHtml.replace("%1",ff);
         pr = (ff?ff:"") + (pr?pr:"");
         }
      ME.Filter;
      var typ = this.GetType(r,c), t = null; 
      var frm = r[c+"ExportFormat"]; if(frm==null) frm = D[c+"ExportFormat"]; if(frm==null) frm = r.ExportFormat; if(frm==null) frm = D.ExportFormat; if(frm==null) frm = CC.ExportFormat; if(frm==null) frm = this.GetFormat(r,c);
      var img = null, imgsep = "|"; 
      
      if(img&&ei["img"]) imgsep = img.charAt(); else img = "";
      var link = null;
      v = r[c+"ExportHtml"]; if(v==null) v = D[c+"ExportHtml"]; if(v!=null){ typ = "EHtml"; frm = null; }
      if(v==null) v = r[c+"ExportValue"]; if(v==null) v = D[c+"ExportValue"]; 
      if(v==null) v = r[c]; if(v==null) v = D[c];
      MS.ColSpan;
      if(r.Spanned&&r[c+"Span"]>1){
         var mer = r[c+"Merge"]; if(mer==null) mer = D[c+"Merge"];
         if(mer) {
            if((mer+"").indexOf(",")<0) { v = r[mer+"ExportValue"]; if(v==null) v = D[mer+"ExportValue"]; if(v==null) v = r[mer]; if(v==null) v = D[mer]; }
            else {
               mer = (mer+"").split(",");
               var mt = Get(r,c+"MergeType")-0; if(!mt) mt = 0;
               var mf = Get(r,c+"MergeFormat");
               if(mf!=null) { v = this.GetMergeValue(r,c,mer,mf,mt,0); if(mf.search(/<\w+[\s\/>]/)>=0) typ = "EHtml"; }
               else for(var m=0,v="";m<mer.length;m++) if(mt&2 || Cols[mer[m]]) v += (!v ? "" : mt&1 ? "\n" : " ") + this.GetString(r,mer[m]);
               }
            }
         }
      ME.ColSpan;
      var s = r[c+"ExportStyle"]; if(s==null) s = D[c+"ExportStyle"]; if(s==null) s = CC.ExportStyle;
      if(s){
         var M = (s+"").match(/mso-number-format\s*:\s*("[^"]*"|'[^']'|[^;$]+)/);
         if(M){ frm = M[1]; if(frm.search(/^"[^"]*"$|^'[^']'$/)>=0) frm = frm.slice(1,-1); s = s.replace(/mso-number-format\s*:\s*("[^"]*"|'[^']'|[^;$]+)[;$]/,""); }
         if(et["nostyle"]) s = "";
         else {
            var M = (s+"").match(/background-color\s*:\s*([^;$]+)/); if(M){ n[cc+"Color"] = M[1]; if(M[1]) fb = 1; s = s.replace(/background-color\s*:\s*([^;$]+)[;$]/,""); }
            var M = (s+"").match(/text-align\s*:\s*([^;$]+)/); if(M&&CAlignTypes[M[1]]){ n[cc+"Align"] = M[1]; s = s.replace(/text-align\s*:\s*([^;$]+)[;$]/,""); }
            var M = (s+"").match(/vertical-align\s*:\s*([^;$]+)/); if(M&&CVertAlignTypes[M[1]]){ n[cc+"VertAlign"] = M[1]; s = s.replace(/vertical-align\s*:\s*([^;$]+)[;$]/,""); }
            var M = (s+"").match(/white-space\s*:\s*([^;$]+)/); if(M){ n[cc+"Wrap"] = M[1]=="normal"?1:0; s = s.replace(/white-space\s*:\s*([^;$]+)[;$]/,""); }
            var BB = {"left":"Left","right":"Right","top":"Top","bottom":"Bottom"};
            for(var j=0;j<5;j++){
               var M = (s+"").match(/border-?(left|right|bottom|top)?\s*:\s*([^;\s$]+)\s+([^;\s$]+)?\s+([^;\s$]+)?/);
               if(M){
                  var wd = 1, st = 1, clr = "black";
                  for(var i=2;i<M.length;i++){
                     var x = {"none":0,"hidden":0,"dotted":2,"dashed":3,"solid":1,"double":1,"groove":1,"ridge":1,"inset":1,"outset":1}[M[i]]; if(x) { st = x; continue; }
                     var x = {"thin":1,"medium":2,"thick":3,"1px":1,"2px":2,"3px":3}[M[i]]; if(!x&&parseFloat(x)) x = EmuToPx(M[i]); if(x) { wd = x; continue; }
                     x = CColors[M[i].toLowerCase()]; if(x||x.charAt(0)=="#") clr = x;
                     }
                  s = s.replace(/border-?(left|right|bottom|top)?\s*:\s*([^;\s$]+)\s+([^;\s$]+)?\s+([^;\s$]+)?[;$]/,"");
                  if(wd&&st&&clr){
                     var x = (st==2?(wd<=1.5?4:5):st==3?(wd<=1.5?6:7):wd>3?3:Math.round(wd))+","+clr;
                     if(M[1]) n[cc+"Border"+BB[M[1]]] = x; 
                     else for(var a in BB) n[cc+"Border"+BB[a]] = x; 
                     }
                  }
               }
            pr = "<span style='"+s.replace(/'/g,'"')+"'>"+(pr?pr:""); po = (po?po:"")+"</span>";
            }
          }
      var format = null;
      if(frm=="!") {       
         v = v==null||v==="" ? "" : v-0 ? 1 : 0;
         if(et["bool"]) format = "!";
         }
      else if(typ=="Auto" && v && v-0+""!=v && v!==false){  
         t = "s";
         if(v.charAt(0)==L.TextPrefix) v = v.slice(1);
         if(frm=="@"&&v-0+""==v) { t = null; format = frm; } 
         else {
            if(n[cc+"Wrap"]==null&&v.search(!this.AutoHtml?/\n/:/\<br\s*\/?>/i)>=0) n[cc+"Wrap"] = 1;
            if(v.search(/[<&]/)>=0) v = !this.AutoHtml||keep ? v.replace(/&/g,"&amp;").replace(/</g,"&lt;") : v.replace(CRepAmp,"&amp;").replace(CRepLt,"&lt;"); 
            }
         }
      else if(typ=="Auto" && frm=="@"){  
         format = frm; 
         }
      else if(typ=="Date"||typ=="Auto"&&frm&&L.IsDate(frm)){ 
         if(this.IsRange(r,c)){
            v = L.DateToString(v,frm,2); t = "s";
            }
         else {
            if(!frm) frm = v>=0&&v<1 ? "t" : v%1 ? "h" : "d";
            var xf = r[c+"XlsFormat"]; if(xf==null) xf = D[c+"XlsFormat"]; if(xf==null) xf = r.XlsFormat; if(xf==null) xf = D.XlsFormat; if(xf==null) xf = CC.XlsFormat;
            if(xf==null) xf = this.ConvertExportFormat(frm,1,!!et["unsupported"],!!et["stylenumbers"]);
            if(xf!==false&&(!pr&&!po||!((pr?pr:"")+(po?po:"")).replace(CRepHtml,""))) { format = xf; if(!edates&&(v-0||v=="0")) v = v<86400000 ? v/86400000 : (v-0+2209161600000)/86400000; }
            else { v = L.DateToString(v,frm); t = "s"; }
            }
         if(t=="s"){
            if(!n[cc+"Align"]) n[cc+"Align"] = "Right";
            if(keep&&v&&v.search(/[<&]/)>=0) v = v.replace(/&/g,"&amp;").replace(/</g,"&lt;");
            }
         }
      else if(typ=="Int"||typ=="Float"||typ=="Auto"){ 
         if(v==null) v = "";
         if(this.IsRange(r,c)&&v!==""){
            v = L.NumberToString(v,frm,2); t = "s";
            }
         else {
            if(this.ExportRound&&v) v = Math.round(v*this.ExportRound)/this.ExportRound;
            var xf = r[c+"XlsFormat"]; if(xf==null) xf = D[c+"XlsFormat"]; if(xf==null) xf = r.XlsFormat; if(xf==null) xf = D.XlsFormat; if(xf==null) xf = CC.XlsFormat;
            if(xf!=null||frm) {
               if(xf==null) xf = this.ConvertExportFormat(frm,2,!!et["unsupported"],!!et["stylenumbers"]);
               if(xf!==false&&(!pr&&!po||!((pr?pr:"")+(po?po:"")).replace(CRepHtml,""))) {
                  if(this.ExportEmptyDecimals && xf && xf.search(/\.[#\?]+/)>=0){
                     if(this.ExportEmptyDecimals==2){
                        
                        xf = xf.replace(/[0#?8,]*\.[#\?][0#\?8]*/g,"General"); 
                        }
                     else if(this.ExportEmptyDecimals==1&&v&&!(v%1)) xf = xf.replace(/\.[#?][0#?8]*/g,"");
                     }
                  format = xf;
                  }
               else if(v!==""){ v = L.NumberToString(v,frm); t = "s"; }
               }
            }
         if(t=="s"){
            if(!n[cc+"Align"]) n[cc+"Align"] = "Right";
            if(keep&&v&&v.search(/[<&]/)>=0) v = v.replace(/&/g,"&amp;").replace(/</g,"&lt;");
            }
         }
      else if(typ=="Bool") {
         var bi = null; 
         if(bi&&bi!=0&&!(bi-0)){
            bi = bi.split(bi.charAt(0));
            v = "<img src='"+StringToXml(bi[v?2:v===""?3:1])+"'/>";
            }
         else if(v===""||v==null) t = "s"; 
         else { v = v-0 ? 1 : 0; if(et["bool"]) format = "!"; }
         }
      else if(typ=="Text"||typ=="Lines"||typ=="Html"||typ=="EHtml"){
         if(frm&&v!=null) v = L.FormatString(v,frm,typ=="Text"||typ=="Lines"?1:0,this.IsRange(r,c));
         if(et["texttype"]) t = "s";
         if(n[cc+"Wrap"]==null&&typ!="Text") n[cc+"Wrap"] = 1;
         if(v&&typeof(v)=="string"&&v.search(/[<&]/)>=0) v = !frm&&(typ=="Text"||typ=="Lines")||keep ? v.replace(/&/g,"&amp;").replace(/</g,"&lt;") : v.replace(CRepAmp,"&amp;").replace(CRepLt,"&lt;"); 
         }
      else if(typ=="Enum"||typ=="Radio"){
         if(!et["enumkeys"]) {
            v = this.GetEnumString(r,cc,1); 
            if(et["texttype"]) t = "s"; 
            if(v==CNBSP) v = ""; 
            else if(v&&typeof(v)=="string"&&v.search(/[<&]/)>=0) v = keep ? v.replace(/&/g,"&amp;").replace(/</g,"&lt;") : v.replace(CRepAmp,"&amp;").replace(CRepLt,"&lt;"); 
            }
         }
      else if(typ=="Icon"){
         if(v&&ei["icon"]) img += imgsep+v+imgsep+"!,!";
         v = "";
         }
      else if(typ=="Abs"){
         if(v&&typeof(v)=="string"){
            var a = v.split(v.charAt(0)); v = "";
            for(var i=1;i<a.length;i+=8) v += keep ? (i==1?"":"\n")+a[i+4] : "<div class='"+a[i+5]+"' style='"+a[i+6]+"'>"+a[i+4]+"</div>";
            v = keep ? v.replace(/&/g,"&amp;").replace(/</g,"&lt;") : v.replace(CRepAmp,"&amp;").replace(CRepLt,"&lt;"); 
            n[cc+"Wrap"] = 1;
            }
         }
      else if(typ=="Link"){
         MS.Img;
         if(v&&typeof(v)=="string"){
            v = v.split(v.charAt(0));
            var lpr = "", lpo = "";
            if(frm){
               frm = frm.split(frm.charAt(0));
               if(frm[3]) lpr = frm[3]; 
               if(frm[4]) lpo = frm[4];
               v[1] = (frm[5]&1 && this.BaseUrl?this.BaseUrl:"")+(frm[1]?frm[1]:"")+v[1]+(frm[2]?frm[2]:"");
               }      
            if(!v[1] || v[1].search(/javascript\:/)>=0) v[1] = "";
            
            if(keep) { if(v[1]) n[cc+"Link"] = v[1]; v = lpr+(v[2]?v[2]:v[1])+lpo; }
            else v = lpr+"<a href='"+PFormat.Escape(v[1])+"'>"+(v[2]?v[2]:v[1])+"</a>"+lpo;
            }
         ME.Img;
         }
      else if(typ=="Img"){
         MS.Img;
         if(v&&typeof(v)=="string"){ 
            v = v.split(v.charAt(0));
            var lpr = "", lpo = "";
            if(frm){
               frm = frm.split(frm.charAt(0));
               if(frm[3]) lpr = frm[3]; 
               if(frm[4]) lpo = frm[4];
               if(v[6]) v[6] = (frm[7]&2 && this.BaseUrl?this.BaseUrl:"")+(frm[5]?frm[5]:"")+v[6]+(frm[6]?frm[6]:"");
               }      
            if(v[6] && v[6].search(/javascript\:/)<0) link = v[6];
            if(ei["img"]&&v[1]) v = lpr+"<img src='"+StringToXml(v[1])+"' "+(v[4]&&v[2]?" cropx='"+v[4]+"' cropwidth='"+v[2]+"' width=''" : v[2] ? " width='"+v[2]+"'":"")+(v[5]&&v[3] ? " cropy='"+v[5]+"' cropheight='"+v[3]+"' height=''" : v[3]?" height='"+v[3]+"'":"")+"/>"+lpo;
            else v = lpr+lpo;
            }
         ME.Img;
         }
      else if(typ=="Panel"){
         var rpan = r.Kind=="Panel"&&CC.Type!="Panel";
         if(!v) { 
            if(rpan){ v = r.Buttons; if(v==null) v = D.Buttons; } 
            else v = CC.Buttons; 
            }
         if(!v) { 
            v = (CC.Move!=0?"Move,":"")+(CC.Select!=0?"Select,":"")+(CC.Delete!=0?"Delete,":"")+(CC.Copy!=0?"Copy,":""); 
            if(v) v = v.slice(0,-1); 
            }
         if(v){
            if(!ei["panel"]) v = v.replace(/,/g," ");
            else {
               
               }
            }
         }
      else if(typ=="File"){
         var Out = []; v = this.GetFileHTML(r,c,v,0,Out); 
         
         }
      else if(typ=="Button"){
         if(!v||v=="0") { v = this.GetAttr(r,c,"ButtonText"); if(!v) v = v=="0" ? "0" : ""; }
         else if(v-0&&this.GetAttr(r,c,"Switch")==2){ v = this.GetAttr(r,c,"ButtonText"+(v-0)); if(v==null) v = this.GetAttr(r,c,"ButtonText"); if(!v) v = v=="0" ? "0" : ""; }
         else if(v=="1"||v===true) { v = this.GetAttr(r,c,"ButtonTextChecked"); if(v==null) v = this.GetAttr(r,c,"ButtonText"); if(!v) v = v=="0" ? "0" : ""; }
         if(v&&typeof(v)=="string"&&v.search(/[<&]/)>=0) v = keep ? v.replace(/&/g,"&amp;").replace(/</g,"&lt;") : v.replace(CRepAmp,"&amp;").replace(CRepLt,"&lt;"); 
         }
      else if(typ=="List"){
         v = this.GetListHTML(r,c,v);
         if(v&&v.search(/[<&]/)>=0) v = keep ? v.replace(/&/g,"&amp;").replace(/</g,"&lt;") : v.replace(CRepAmp,"&amp;").replace(CRepLt,"&lt;"); 
         }
      else v = null; 
      if(v===""){
         var ev = r[c+"EmptyValue"]; if(ev==null) ev = D[c+"EmptyValue"]; if(ev==null) ev = this.Cols[c].EmptyValue;
         if(ev!=null) { v = ev; if(CAlignRight[typ] && !n[cc+"Align"]) n[cc+"Align"] = "Right"; }
         }
      if(v&&this.Trans) v = this.Translate(r,c,v,typ);

      if(v||v=="0"){
         
         if(link==null&&el["link"]) { link = r[c+"Link"]; if(link==null) link = D[c+"Link"]; if(link==null) link = r.Link; if(link==null) link = D.Link; if(link==null) link = CC.Link; }
         if(typeof(v)=="string"&&v.indexOf("<a ")>=0){
            var M = v.match(/<a\s+[^>]*href\s*=\s*('[^']*'|"[^"]*"|[^\s\/>]+)/);
            if(M) { 
               if(!link&&(el["html"]&&(typ=="EHtml"||typ=="Auto"&&this.AutoHtml)||el["other"])) { link = M[1]; if(link.charAt(0)=="'"||link.charAt(0)=='"') link = link.slice(1,-1); }
               v = v.replace(/<\/?a(\s+\w+\s*=\s*('[^']*'|"[^"]*"|\w+))*\/?>/g,""); 
               } 
            }
         if(link) { 
            n[cc+"Link"] = link; 
            if(!n[cc+"TextColor"]) n[cc+"TextColor"] = op.LinkColor; 
            if(el["underline"]) n[cc+"TextStyle"] = n[cc+"TextStyle"] ? n[cc+"TextStyle"]|4 : 4; 
            }
         }
      if(t) n[cc+"_t"] = t;
      if(format) n[cc+"Format"] = format;
      var eimg = ei["html"]&&(typ=="EHtml"||typ=="Auto"&&this.AutoHtml) || (typ=="Img"?ei["img"]:ei["other"]);
      MS._Debug; if(0){ ME._Debug; if(typ!="Img"&&typ!="Icon") eimg = 0;  MS._Debug; } ME._Debug; 
      if(et["nostyle"]&&(!eimg||typeof(v)!="string"||v.indexOf("<img ")<0)){ if(v&&typeof(v)=="string"&&v.indexOf("<")>=0) v = v.replace(CRepHtml,""); } 
      else {
         if(pr||po) { v = (pr?pr:"")+(v!=null?v:"")+(po?po:""); }
         if(v&&typeof(v)=="string"&&v.indexOf("<")>=0){ 
            if(!I){ I = document.createElement("div"); I.style.visibility = "hidden"; I.style.overflow = "hidden"; I.style.whiteSpace = "normal"; I.style.position = "absolute"; I.style.left = "0px"; I.style.top = "0px"; document.body.appendChild(I); }
            var al = n[cc+"Align"] ? CAlignTypes[n[cc+"Align"]] : "";
            if(n[cc+"Wrap"]=="0"&&(!al||al=="Left")) I.style.width = "auto";
            else if(spanwidth!=null){ I.style.width = spanwidth ? spanwidth+"px" : "auto"; }
            else I.style.width = C[k].Width ? C[k].Width+"px" : "auto";
            
            if(I.style.textAlign||al) I.style.textAlign = al ? al : "";
            var cls = this.Img.Style+typ;
            var ti = r[c+"TextImg"]; if(ti==null) ti = D[c+"TextImg"]; if(ti==null) ti = this.Cols[c].TextImg; if(ti&4) cls += " "+this.Img.Style+"CutImg";
            if(cls!=I.className) I.className = cls; 
            I.innerHTML = v;
            var s = {}; SetTagsRoot(I,this.LineHeightRatio); NormalizeTags(I,s,1);
            var imgs = I.getElementsByTagName("img");
            if(eimg) for(var i=0;i<imgs.length;i++){
               var II = imgs[i];
               img += imgsep+II.src+imgsep+(II.offsetLeft+2)+","+(II.offsetTop+2)+","+II.width+","+II.height+","+(this.GetImageRotate?this.GetImageRotate(II):0)+","+II.style.opacity+","+(II.title?II.title:"");
               var cx = II.getAttribute("cropx"), cy = II.getAttribute("cropy"), cw = II.getAttribute("cropwidth"), ch = II.getAttribute("cropheight"); 
               img += ","+(cx?cx:"")+","+(cy?cy:"")+","+(cw?cw:"")+","+(ch?ch:"");
               }
            
            while(imgs.length) {
               if(ei["space"]&&I.lastChild!=imgs[0]){
                  var ww = imgs[0].getAttribute("cropwidth"); if(!ww) ww = imgs[0].offsetWidth; 
                  var ss = CEmptySpaces.slice(0,Math.floor(ww/4)); if(ww%4) ss += "\u200A\u200A\u200A".slice(0,ww%4);
                  var sp = document.createElement("span"); sp.style.fontSize = "16px"; sp.style.lineHeight = "0px"; sp.innerHTML = ss;
                  imgs[0].parentNode.insertBefore(sp,imgs[0]);
                  }               
               imgs[0].parentNode.removeChild(imgs[0]);
               }
            v = I.innerHTML;
            if(et["nostyle"]) v = v.replace(CRepHtml,"");
            else {
               
               }
            if(ei["space"]&&v.search(/^\s+$/)>=0) v = "";
            }
         }
      if(ei["side"]&&typ!="Icon"){
         var ico = r[c+"Icon"]; if(ico==null) ico = r.Def[c+"Icon"]; if(ico==null) ico = this.Cols[c].Icon;
         if(ico&&!CButtonTypes[ico]){
            var ialign = CAlignTypes[this.GetAttr(r,c,"IconAlign")]; if(!ialign) ialign = "Left";
            var iwidth = this.GetAttr(r,c,"IconWidth"); if(!iwidth) iwidth = 25;
            img += imgsep+ico+imgsep+(ialign=="Right"?")-"+(iwidth+2):ialign=="Center"?"!":2)+",!";
            if(ei["indent"]){
               var align = CAlignTypes[this.GetAttr(r,c,"Align")]; if(!align) align = CAlignRight[typ]||typ=="Auto"&&this.IsAutoRight(r,c) ? "Right" : "Left";
               if(align==ialign){ var ind = n[cc+"Indent"]; n[cc+"Indent"] = (ind?ind:0)+Math.floor(iwidth/10); }
               }
            }
         }
      

      if(img) {
         n[cc+"Img"] = img;
         img = img.split(imgsep); 
         for(var i=1;i<img.length;i+=2) if(!X.ImgCache[img[i]]){
            var vv = img[i+1]?img[i+1].split(","):[];
            X.ImgCache[img[i]] = [];
            }
         }
      if(Grids.OnGetExportValue) { 
         var tmp = Grids.OnGetExportValue(this,r,c,v,this.ExportFormat); 
         if(tmp!=null) { v = tmp; if(v&&typeof(v)=="string"&&v.search(/[<&]/)>=0) v = keep ? v.replace(/&/g,"&amp;").replace(/</g,"&lt;") : v.replace(CRepAmp,"&amp;").replace(CRepLt,"&lt;"); } 
         }
      if(v!=null&&(v!==""||et["empty"])) n[cc] = v;
      }
   if(Grids.OnExportRow) Grids.OnExportRow(this,r,n);
   }
if(fb&&et["forceborder"]&&this.DefaultBorder) O.Cfg.DefaultBorder = 3;
if(et["nonextborder"]) O.Cfg.DefaultBorder = O.Cfg.DefaultBorder ? 2 : 0;
if(I) I.parentNode.removeChild(I);
if(this.ExportAlternate&&!this.Alternate) for(var r=this.GetFirst();r;r=this.GetNext(r)) r.ColorPos = null;
if(et["filtered"]) this.Calculate();

var fi = this.ExportPrefix&&!fe?1:0, li = R.length-(this.ExportPostfix?2:1);
if(op.HeaderBorder) {
   for(var i=hcnt-1;i>=0;i--) if(this.Rows[B[i].id].Kind=="Header") break;
   if(i>=0) for(var r=B[i],i=0;i<C.length;i++) if(!r[C[i].Name+"BorderBottom"]) r[C[i].Name+"BorderBottom"] = op.HeaderBorder;
   }
if(op.HeadBorder&&hcnt) for(var i=0,r=B[hcnt-1];i<C.length;i++) if(!r[C[i].Name+"BorderBottom"]) r[C[i].Name+"BorderBottom"] = op.HeadBorder;
if(op.FootBorder&&fcnt!=B.length) for(var i=0,r=B[fcnt];i<C.length;i++) if(!r[C[i].Name+"BorderTop"]) r[C[i].Name+"BorderTop"] = op.FootBorder;
if(op.LeftBorder&&lcnt) for(var i=fi,c=C[lcnt-1].Name;i<=li;i++) if(!R[i][c+"BorderRight"]) R[i][c+"BorderRight"] = op.LeftBorder;
if(op.RightBorder&&rcnt&&rcnt!=C.length) for(var i=fi,c=C[rcnt].Name;i<=li;i++) if(!R[i][c+"BorderLeft"]) R[i][c+"BorderLeft"] = op.LeftBorder;
if(op.TableBorder&&C.length&&R.length){
   for(var i=fi,c0=C[0].Name,c1=C[C.length-1].Name;i<=li;i++){
      if(!R[i][c0+"BorderLeft"]) R[i][c0+"BorderLeft"] = op.TableBorder;
      if(!R[i][c1+"BorderRight"]) R[i][c1+"BorderRight"] = op.TableBorder;
      }
   for(var i=0,r0=R[fi],r1=R[li];i<C.length;i++){
      if(!r0[C[i].Name+"BorderTop"]) r0[C[i].Name+"BorderTop"] = op.TableBorder;
      if(!r1[C[i].Name+"BorderBottom"]) r1[C[i].Name+"BorderBottom"] = op.TableBorder;
      }
   }

var hs = op.HeaderStyle; if(hs) { hs = hs.toLowerCase(); hs = (hs.indexOf("bold")>=0 ? 1: 0) + (hs.indexOf("italic")>=0 ? 2 : 0); }
if(hs){
   for(var j=0;j<hcnt;j++) if(this.Rows[B[j].id].Kind=="Header") for(var r=B[j],i=0;i<C.length;i++) { var s = C[i].Name+"TextStyle"; r[s] = (r[s]?r[s]:0)+hs; }
   for(var j=fcnt;j<B.length;j++) if(this.Rows[B[j].id].Kind=="Header") for(var r=B[j],i=0;i<C.length;i++) { var s = C[i].Name+"TextStyle"; r[s] = (r[s]?r[s]:0)+hs; }
   }

var N = this.Names, XN = OO.Names, XG = X.Names, NN = {}, NG = {}; OO.Names = NN; X.Names = NG; if(!XN) XN = {}; if(XG) XG = {};
for(var n in N) { 
   var A = N[n], nn = A.Name, I = A.Global ? XG[nn] : XN[nn]; if(!I) I = {};
   for(var a in A) I[a] = A[a];
   if(A.Global) NG[nn] = I; else NN[nn] = I;
   }
MirrorNames(X);

function GetCol(c){ return Cols[c] ? GetColName(Cols[c]._Index) : "A"; }
function GetRow(r){ return Rows[r.id] ? Rows[r.id]._Index : 1; }
OO.Selection = "";
if(et["selection"]){
   var s = "", F = this.FRect;
   if(et["focus"]){
      if(F) s += (s?" ":"")+GetCol(F[1])+GetRow(F[0])+":"+GetCol(F[3])+GetRow(F[2]);
      else if(this.FRow&&this.FCol) s += (s?" ":"")+GetCol(this.FCol)+GetRow(this.FRow);
      }
   var S = this.GetSelRanges(0,6)
   if(S.Rows) this.FillRowRanges(S.Rows,S);
   if(S.Cols) this.FillColRanges(S.Cols,S);
   if(S.length) for(var i=0;i<S.length;i++) {
      if(!S[i][1]) { if(!F||!F[7]||S[i][0]!=F[i][0]||S[i][2]!=F[i][2]) s += (s?" ":"")+"A"+GetRow(S[i][0])+":XFD"+GetRow(S[i][2]); } 
      else if(!S[i][0]) { if(!F||!F[6]||S[i][1]!=F[i][1]||S[i][3]!=F[i][3]) s += (s?" ":"")+GetCol(S[i][1])+"1:"+GetCol(S[i][3])+"1048576"; } 
      else if(S[i][0]==S[i][2]&&S[i][1]==S[i][3]) { if(this.FRow!=S[i][0]||this.FCol!=S[i][1]) s += (s?" ":"")+GetCol(S[i][1])+GetRow(S[i][0]); } 
      else if(!F||S[i][0]!=F[0]||S[i][1]!=F[1]||S[i][2]!=F[2]||S[i][3]!=F[3])s += (s?" ":"")+GetCol(S[i][1])+GetRow(S[i][0])+":"+GetCol(S[i][3])+GetRow(S[i][2]); 
      }
   
   OO.Selection = s;
   }
else if(!et["selected"]) {
   
   if(et["focus"]&&this.FRow){ OO.Selection = GetCol(this.FCol) + GetRow(this.FRow); }
   if(!et["nocolor"]){
      if(this.SelectingCells){
         var zsc = this.SelectingCells; if(zsc==3) this.SelectingCells = 4;
         var S = this.GetSelRanges(12,2);
         if(S.Rows&&op.SelectedRowsColor) for(var id in S.Rows) if(Rows[id]) {
            if(et["stylerows"]) Rows[id].Color = op.SelectedRowsColor;
            for(var c in Cols) { var cc = c=="id" ? "_id" : c; Rows[id][cc+"Color"] = MergeColors(Rows[id][cc+"Color"],op.SelectedRowsColor); }
            }
         if(S.Cols&&op.SelectedColsColor) for(var c in S.Cols) if(Cols[c]) {
            if(et["stylecols"]) Cols[c].Color = op.SelectedColsColor;
            for(var id in Rows) Rows[id][c+"Color"] = MergeColors(Rows[id][c+"Color"],op.SelectedColsColor); 
            }
         for(var i=0;i<S.length;i++){
            for(var r=S[i][0],n=this.GetNext(S[i][2],4),RR={};r&&r!=n;r=this.GetNext(r,4)) if(Rows[r.id]) RR[r.id] = Rows[r.id];
            for(var c=S[i][1],n=this.GetNextCol(S[i][3],0,2),CC={};c&&c!=n;c=this.GetNextCol(c,0,2)) if(Cols[c]) CC[c] = Cols[c];
            for(var c in CC) { var cc = c=="id" ? "_id" : c; for(var id in RR) RR[id][cc+"Color"] = MergeColors(RR[id][cc+"Color"],op.SelectedCellsColor); }
            }
         this.SelectingCells = zsc;
         }
      else {
         var RR = this.GetSelRows(1); 
         for(var i=0;i<RR.length;i++) if(Rows[RR[i].id]) { 
            if(et["stylerows"]) Rows[RR[i].id].Color = op.SelectedRowsColor; 
            for(var c in Cols) { var cc = c=="id" ? "_id" : c; Rows[RR[i].id][cc+"Color"] = MergeColors(Rows[RR[i].id][cc+"Color"],op.SelectedRowsColor); } 
            }
         if(this.SelectingCols) { 
            var CC = this.GetSelCols(); 
            for(var i=0;i<CC.length;i++) if(Cols[CC[i]]) {
               if(et["stylecols"]) Cols[CC[i]].Color = op.SelectedColsColor;
               for(var id in Rows) Rows[id][CC[i]+"Color"] = MergeColors(Rows[id][CC[i]+"Color"],op.SelectedColsColor); 
               }
            }
         }
      }
   }
O.Cfg.Focused = this.FRow&&et["focus"] ? GetRow(this.FRow) : et["selection"]&&S.length ? GetRow(S[0][0]) : "";
O.Cfg.FocusedCol = this.FCol&&et["focus"] ? GetCol(this.FCol) : et["selection"]&&S.length ? GetCol(S[0][1]) : "";
if(et["empty"]) {
   CopyCol({Name:"_Empty",Visible:1,CanExport:4,Width:this.DefCols.C.Width?this.DefCols.C.Width:64},O.Cols);
   for(var ri=0;ri<R.length;ri++) R[ri]["_Empty"] = "";
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
function MirrorNames(X){
var gcnt = GetCount(X.Names);
for(var n in X.Sheets) {
   var N = X.Sheets[n].Names, NN = {}; 
   if(!gcnt&&!GetCount(N)) continue;
   X.Sheets[n].Data.Names = NN;
   for(var n in N) NN[n] = N[n];
   for(var n in X.Names) NN[NN[n]?"!"+n:n] = X.Names[n];
   }
}
// -----------------------------------------------------------------------------------------------------------
ME.Xlsx;
ME.Export;

MS.Xlsx;
// -----------------------------------------------------------------------------------------------------------
function GetEmptySheet(){
return { Cfg:{MinRowHeight:20}, Cols:[], LeftCols:[], Body:[[]], Head:[], Foot:[], Def:{"R":{}}, DefCols:{"C":{Width:64}}, Header:{} };
}
// -----------------------------------------------------------------------------------------------------------
function CreateXlsx(){
var X = { Sheets: {}, SheetsLower:{}, Sheet:null, ImgCache:{} };
return X;
}
// -----------------------------------------------------------------------------------------------------------
function CreateSheet(X,sheet,base){
var max = -1; for(var s in X.Sheets) if(max<X.Sheets[s].Index) max = X.Sheets[s].Index;
max++; if(!sheet) sheet = base ? base.replace("%1",max+1) : "Sheet"+(max+1);
if(!max) X.Sheet = sheet;
var lwr = (sheet+"").toLowerCase(); if(X.SheetsLower[lwr]) return X.SheetsLower[lwr]; 
var O = GetEmptySheet();
var OO = { Index:max, Name:sheet, Data:O };
X.Sheets[sheet] = OO; X.SheetsLower[lwr] = OO;
return OO;
}
// -----------------------------------------------------------------------------------------------------------
MS.Export;
// -----------------------------------------------------------------------------------------------------------
function ConvertColor(c){
c = (c+"").toLowerCase(); if(CColors[c]) c = CColors[c];
c = HexToRgb(c); if(!c) return "FFFFFFFF";
return (c[3]&&c[3]!=1 ? Number((c[3]*255)|256).toString(16).slice(1) : "ff") + Number((((c[0]&255)|256)<<16)+((c[1]&255)<<8)+(c[2]&255)).toString(16).slice(1);
}
// -----------------------------------------------------------------------------------------------------------
function ExportXlsx(X){
var files = [], Xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', Rels = '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';

var CTypes = '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">';
CTypes += '<Default ContentType="application/vnd.openxmlformats-package.relationships+xml" Extension="rels"/>';
CTypes += '<Default ContentType="application/xml" Extension="xml"/>';
CTypes += '<Default ContentType="image/png" Extension="png"/><Default ContentType="image/svg+xml" Extension="svg"/><Default ContentType="image/gif" Extension="gif"/><Default ContentType="image/jpeg" Extension="jpg"/>';
var CBaseFiles = { 
   "/xl/workbook.xml"      : ["officedocument.spreadsheetml.sheet.main+xml","officeDocument/2006/relationships/officeDocument",0],
   "/xl/styles.xml"        : ["officedocument.spreadsheetml.styles+xml","officeDocument/2006/relationships/styles",1],
   "/xl/sharedStrings.xml" : ["officedocument.spreadsheetml.sharedStrings+xml","officeDocument/2006/relationships/sharedStrings",1],
   "/xl/calcChain.xml"     : ["officedocument.spreadsheetml.calcChain+xml","officeDocument/2006/relationships/calcChain",1],
   "/docProps/core.xml"    : ["package.core-properties+xml","package/2006/relationships/metadata/core-properties",0],
   "/docProps/app.xml"     : ["officedocument.extended-properties+xml","officeDocument/2006/relationships/extended-properties",0]
   };
for(var n in CBaseFiles) CTypes += '<Override ContentType="application/vnd.openxmlformats-'+CBaseFiles[n][0]+'" PartName="'+n+'"/>';

var App = '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">'
App += '<Application>Microsoft Excel</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop><HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>listy</vt:lpstr></vt:variant><vt:variant><vt:i4>1</vt:i4></vt:variant></vt:vector></HeadingPairs><TitlesOfParts><vt:vector size="1" baseType="lpstr"><vt:lpstr>List1</vt:lpstr></vt:vector></TitlesOfParts><Company></Company><LinksUpToDate>false</LinksUpToDate><SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged><AppVersion>15.0300</AppVersion></Properties>';
files["docProps/app.xml"] = Xml+App;

var Core = '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>Jan</dc:creator><cp:lastModifiedBy>Jan</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">2019-09-18T19:47:43Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2019-09-18T19:47:58Z</dcterms:modified></cp:coreProperties>';
files["docProps/core.xml"] = Xml+Core;

var WBookRels = Rels, CRels = Rels;
var WBook = '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">';
WBook += '<fileVersion rupBuild="14420" lowestEdited="6" lastEdited="6" appName="xl"/>';

var OL = null; if(X.Sheets[X.Sheet].Lock){ var LL = X.Sheets[X.Sheet].Lock.toLowerCase().split(","), OL = {}; for(var i=0;i<LL.length;i++) OL[LL[i]] = 1; }
var L = OL ? OL : X.Sheets[X.Sheet].Data.Cfg.Locked; 
if(L&&L["sheet"]){
   WBook += '<workbookProtection lockStructure="1"';
   if(X.Password) for(var n in X.Password) WBook += ' '+n+'="'+X.Password[n]+'"';
   WBook += '/>';
   }
WBook += '<bookViews><workbookView activeTab="'+X.Sheets[X.Sheet].Index+'"/></bookViews>';
WBook += '<sheets>';
var SH = []; for(var n in X.Sheets) SH[SH.length] = n;
SH.sort(function(a,b){ return X.Sheets[a].Index-X.Sheets[b].Index; });
for(var ii=0;ii<SH.length;ii++){
   var n = SH[ii];
   WBookRels += '<Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(X.Sheets[n].Index+1)+'.xml" Id="rId'+(X.Sheets[n].Index+1)+'"/>';
   WBook += '<sheet r:id="rId'+(X.Sheets[n].Index+1)+'" sheetId="'+(X.Sheets[n].Index+1)+'" name="'+StringToXml(n)+'"/>';
   CTypes += '<Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" PartName="/xl/worksheets/sheet'+(X.Sheets[n].Index+1)+'.xml"/>';
   }
WBook += "</sheets>";
var relsid = 1, wbrelsid = SH.length+1;
for(var n in CBaseFiles) {
   var s = '<Relationship Type="http://schemas.openxmlformats.org/'+CBaseFiles[n][1]+'" Target="'+n+'" Id="rId';
   if(CBaseFiles[n][2]) WBookRels += s+(wbrelsid++)+'"/>'; else CRels += s+(relsid++)+'"/>';
   }

function GetDefName(n,N,idx,sheet){
   var s = ""; if(n-0||n=="0") return s; 
   s += '<definedName name="'+StringToXml(n)+'"';
   if(idx!=null) s += ' localSheetId="'+idx+'"';
   if(N.Text) s += ' description="'+StringToXml(N.Text)+'"';
   if(N.Info) s += ' comment="'+StringToXml(N.Info)+'"';
   if(N.MenuText) s += ' customMenu="'+StringToXml(N.MenuText)+'"';
   var v = N.Value;
   if(typeof(v)=="string") {
      v = v.replace(/\[[^\]]\]/g,""); 
      if(v.indexOf("!")<0){ 
         var M = v.match(/'[^']*'|"[^"]*"|\$?[A-Z]+\$?\d+(\:\$?[A-Z]+\$?\d+)?|./g);
         if(M){
            if(sheet.search(/\s/)>=0) sheet = "'"+sheet.replace(/'/g,"''")+"'";
            for(var i=0;i<M.length;i++) if(M[i].length>1&&M[i].charAt(0)!="'"&&M[i].charAt(0)!='"') M[i] = sheet+"!"+M[i];
            v = M.join("");
            }
         }
      
      v = v.replace(/\&/g,"&amp;").replace(/\</g,"&lt;").replace(/\>/g,"&gt;");
      }
   s += '>'+v+'</definedName>';
   return s;
   }
var s = "";
for(var n in X.Names) s += GetDefName(n,X.Names[n],null,SH[0]);
for(var ii=0;ii<SH.length;ii++){ var N = X.Sheets[SH[ii]].Names; for(var n in N) s += GetDefName(n,N[n],ii,SH[ii]); }
if(s) WBook += '<definedNames>' + s + '</definedNames>';

var Calc = "", Strings = {}, StringsPos = 0, Styles = {}, StylesPos = 1, DrawPos = 1, SSep = "\u65000", fba = { 7:1,8:1,9:1,10:1 }; 
for(var n in X.ImgCache) X.ImgCache[n][4] = null; 
var Attrs = ["TextStyle","TextSize","TextFont","TextColor","Color","PatternColor","Pattern","BorderLeft","BorderRight","BorderTop","BorderBottom","Align","VertAlign","Wrap","Indent","Rotate","CenterTo","CanEdit","Format","FormulaCanEdit"], alen = Attrs.length;
for(var a=0,s="";a<alen;a++) s += SSep; Styles[s] = 0;
function FillB(B,O){ for(var i=0;i<O.length;i++){ if(!rev) B[B.length] = O[i]; if(O[i].Items) FillB(B,O[i].Items); if(rev) B[B.length] = O[i]; } }
function GetWidth(c){ var w = c&&OO.Cols[c]?OO.Cols[c].Width:0; return w ? w : O.DefCols.C.Width; } 
function GetHeight(r){ return r&&r.Height?r.Height:O.Cfg.ExportRowHeight?O.Cfg.ExportRowHeight:O.Cfg.MinRowHeight?O.Cfg.MinRowHeight:20; } 

for(var ii=0;ii<SH.length;ii++){
   var sh = SH[ii], OO = X.Sheets[sh], O = OO.Data, rev = O.Cfg.ReversedTree, Merge = [], Links = "", B = []; FillB(B,O.Body[0]);
   var Sheet = '', SheetPr = '', SheetRels = {}, SheetRelIdx = 1, Draw = "", DrawRels = {}, DrawRelIdx = 1, DrawId = 1;
   var fb = !(O.Cfg.DefaultBorder&2) ? null : O.Cfg.DefaultBorderColor ? "4," + O.Cfg.DefaultBorderColor+SSep : "1,#D4D4D4"+SSep, fbo = fb&&O.Cfg.DefaultBorder&1;
   var L = OL ? OL : O.Cfg.Locked&&O.Cfg.Locked.length?O.Cfg.Locked:null; if(typeof(L)=="string"){ var LL = L.toLowerCase().split(","), L = {}; for(var i=0;i<LL.length;i++) L[LL[i]] = 1; } 
   var H = []; for(var ri=0;ri<O.Head.length;ri++) if(O.Head[ri].CanExport!="0") H[H.length] = O.Head[ri]; 

   SheetPr += "<sheetPr>"; 
   MS.Tree$ColTree; if(!O.Cfg.ReversedTree||!O.Cfg.ReversedColTree) SheetPr += '<outlinePr summaryBelow="'+(O.Cfg.ReversedTree?1:0)+'" summaryRight="'+(O.Cfg.ReversedColTree?1:0)+'"'+(O.Cfg.ColTree==2||O.Cfg.ColTree==1||O.Cfg.HideTree==1?' showOutlineSymbols="0"':'')+'/>'; ME.Tree$ColTree;
   SheetPr += "</sheetPr>";

   Sheet += '<sheetViews><sheetView workbookViewId="0" tabSelected="'+(sh==X.Sheet?1:0)+'"';
   if(O.Cfg.ColTree==2||O.Cfg.ColTree==1||O.Cfg.HideTree==1) Sheet += ' showOutlineSymbols="0"';
   if(O.Cfg.FormulaShow) Sheet += ' showFormulas="1"';
   if(O.Cfg.DefaultBorder!=null && !(O.Cfg.DefaultBorder&1)) Sheet += ' showGridLines="0"';
   
   if(O.Cfg.DefaultBorderColor){
      var c = O.Cfg.DefaultBorderColor; if(CColors[c]) c = CColors[c];
      for(var i=0;i<CIndexColors.length;i++) if(CIndexColors[i]==c){ Sheet += ' defaultGridColor="0" colorId="'+i+'"'; break; }
      if(i==CIndexColors.length&&O.Cfg.DefaultBorder&1) O.Cfg.DefaultBorder |= 2;
      }
   if(O.Cfg.HideZero) Sheet += ' showZeros="0"';
   if(O.Cfg.Scale) Sheet += ' zoomScale="'+Math.round(O.Cfg.Scale*100)+'"';
   if(O.Cfg.Rtl) Sheet += ' rightToLeft="1"';
   if(O.DefCols.Index&&O.DefCols.Index.Visible=="0"||O.Def.Header&&O.Def.Header.Visible=="0") Sheet += ' showRowColHeaders="0"';
   Sheet += '>';
   var x = O.LeftCols.length, y = H.length;
   if(x||y){ 
      Sheet += '<pane state="frozen"'+(x?' xSplit="'+x+'"':'')+(y?' ySplit="'+y+'"':'');
      
      Sheet += ' activePane="'+(y?'bottom':'top')+(x?'Right':'Left')+'" topLeftCell="'+GetColName(x+1)+(y+1)+'"/>';
      }
   if(O.Cfg.Focused) Sheet += '<selection activeCellId="0" activeCell="'+(O.Cfg.FocusedCol?O.Cfg.FocusedCol:"A")+O.Cfg.Focused+'" sqref="'+(OO.Selection?OO.Selection:(O.Cfg.FocusedCol?O.Cfg.FocusedCol:"A")+O.Cfg.Focused)+'"'+(x||y?' pane="'+(y?'bottom':'top')+(x?'Right':'Left')+'"':'')+'/>';
   Sheet += '</sheetView></sheetViews>';

   if(O.DefCols.C.Width||O.Cfg.MinRowHeight) Sheet += '<sheetFormatPr'+(O.DefCols.C.Width?' defaultColWidth="'+O.DefCols.C.Width/7+'"':'')+(O.Cfg.MinRowHeight?' customHeight="1" defaultRowHeight="'+O.Cfg.MinRowHeight/4*3+'"':' defaultRowHeight="15"')+'/>'; 

   var C = [], Cols = "", CN = {}, CS = {};
   for(var j=0,CC=null,pos=1;j<2;j++){
      var SC = j?O.Cols:O.LeftCols;
      for(var i=0;i<SC.length+j;i++){
         var c = SC[i]; 
         if(c){
            C[C.length] = c;
            var s = "", acnt = 0;
            if(L&&!L["edit"]) c.CanEdit = 1;
            for(var a=0;a<alen;a++){ var v = c[Attrs[a]]; if(v!=null&&(a!=19||v==1)) { s += v + SSep; acnt++; } else if(fbo&&fba[a]) { s += fb; acnt++; } else s += SSep; }
            var A = Styles[s]; if(A==null&&acnt) { A = StylesPos++; Styles[s] = A; }
            if(acnt) CS[c.Name] = A;
            CN[c.Name] = GetColName(pos);
            }
         if(CC && (!c || c.Width!=CC.Width || c.Visible!=CC.Visible || A!=CC.Style || c.Level!=CC.Level)){
            var ss = "";
            MS.ColTree; if(CC.Level) ss += ' outlineLevel="'+CC.Level+'"'; ME.ColTree; 
            if(CC.Visible=="0") ss += ' hidden="1"';
            if(CC.Style) ss += ' style="'+CC.Style+'"';
            if(CC.Width&&CC.Width!=O.DefCols.C.Width) ss += ' customWidth="1" width="'+CC.Width/7+'"';
            else if(ss) ss += ' width="'+O.DefCols.C.Width/7+'"';
            if(ss) Cols += '<col min="'+CC.Pos+'" max="'+(pos-1)+'"' + ss + '/>';
            CC = null;
            }
         if(!CC&&c) CC = { Width:c.Width, Visible:c.Visible, Pos:pos, Style:A, Level:c.Level };
         pos++;
         }
      }
   var c = O.DefCols.C, s = "", acnt = 0;
   if(L&&!L["edit"]) c.CanEdit = 1;
   for(var a=0;a<alen;a++){ var v = c[Attrs[a]]; if(v!=null&&(a!=19||v==1)) { s += v + SSep; acnt++; } else s += SSep; }
   var A = Styles[s], DS = null; if(A==null&&acnt) { A = StylesPos++; Styles[s] = A; }
   if(c.Visible=="0") { Cols += '<col min="'+(pos-1)+'" max="'+16384+'" hidden="1"/>'; }
   else if(acnt) { DS = A; Cols += '<col min="'+(pos-1)+'" max="'+16384+'" style="'+A+'" width="'+(O.DefCols.C.Width?O.DefCols.C.Width:64)/7+'"/>'; } 
   if(Cols) Sheet += '<cols>' + Cols + '</cols>';

   Sheet += '<sheetData>';
   var hidetree = O.Cfg.HideTree==2||O.Cfg.HideTree==3;
   for(var j=0,idx=1,cl=C.length;j<3;j++){
      var R = j==2 ? O.Foot : j ? B : H;
      for(var ri=0;ri<R.length;ri++){
         var r = R[ri], vs = ""; 
         var s = "", acnt = 0;
         for(var a=0;a<alen;a++){ var v = r[Attrs[a]]; if(v!=null&&(a!=19||v==1)) { s += v + SSep; acnt++; } else if(fbo&&fba[a]) { s += fb; acnt++; } else s += SSep; }
         var RS = Styles[s]; if(RS==null&&acnt) { RS = StylesPos++; Styles[s] = RS; }
         for(var ci=0;ci<cl;ci++){
            var c = C[ci].Name, v = r[c];
            
            var V = v, f = r[c+"EFormula"], t = r[c+"_t"]; if(f) Calc += '<c i="'+(OO.Index+1)+'" r="'+CN[c]+idx+'"/>'; 
            
            if(v!=null && (!t && (v-0+""!=v||v=="NaN") || t=="s")){ t = "s"; V = Strings[v]; if(V==null) { V = StringsPos++; Strings[v] = V; } }
            else if(!v&&v!=0&&v!=null) { t = "e"; V = "#REF!"; } 
            else if(r[c+"Format"]=="!") { t = "b"; V = v ? 1 : 0; r[c+"Format"] = null;}
            var s = "", acnt = 0, CI = C[ci];
            
            for(var a=0;a<alen;a++){ if(r[c+Attrs[a]]!=null&&(a!=19||r[c+Attrs[a]]==1)) { s += r[c+Attrs[a]] + SSep; acnt++; } else if(fb&&fba[a]) { s += fb; acnt++; } else s += SSep; }
            var A = Styles[s]; if(A==null&&acnt) { A = StylesPos++; Styles[s] = A; }
            if(V==null&&(RS?RS:CS[c]?CS[c]:DS)==A) acnt = 0; 
            if(t=="b") r[c+"Format"] = "!"; 
            if(V!=null||acnt||f){
               vs += '<c r="'+CN[c]+idx+'"'+(t?' t="'+t+'"':'')+(acnt?' s="'+A+'"':'')+'>';
               if(f) vs += '<f>'+f.replace(/\&/g,"&amp;").replace(/\</g,"&lt;").replace(/\>/g,"&gt;")+'</f>';
               if(V!=null) vs += '<v>'+V+'</v>';
               vs += '</c>';
               }

            var rs = r[c+"RowSpan"], cs = r[c+"Span"];
            if((rs>1||cs>1)&&rs!=0&&cs!=0) {
               Merge[Merge.length] = '<mergeCell ref="'+CN[c]+idx+':'+GetColName(GetColIndex(CN[c])+(cs?cs-1:0))+(rs?idx+rs-1:idx)+'"/>';
               }

            if(r[c+"Link"]){
               if(r[c+"Link"].search(CRegSheetLink)>=0){
                  var l = r[c+"Link"]; if(l.search(/^[^'!]+!/)>=0) l = "'"+l.replace(/!/,"'!"); 
                  Links += '<hyperlink ref="'+CN[c]+idx+'" location="'+l.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")+'"/>';
                  }
               else {
                  var rid = SheetRels[r[c+"Link"]]; if(rid) rid = rid[0]; else { rid = "rId"+SheetRelIdx++; SheetRels[r[c+"Link"]] = [rid,'<Relationship Id="'+rid+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="'+StringToXml(r[c+"Link"])+'" TargetMode="External"/>']; }
                  Links += '<hyperlink ref="'+CN[c]+idx+'" r:id="'+rid+'"/>';
                  }
               }

            if(r[c+"Img"]){
               var I = r[c+"Img"].split(r[c+"Img"].charAt(0));
               for(var l=1;l<I.length;l+=2){
                  var II = X.ImgCache[I[l]]; 
                  if(II&&II[2]){
                     var v = I[l+1]?I[l+1].split(","):[], crop = 0, w = (v[2]?v[2]-0:0), h = v[3]?v[3]-0:0; if(!w) w = II[0]; if(!h) h = II[1];
                     if(v[7]-0||v[8]-0||v[9]-0||v[10]-0){
                        crop = 1;
                        if(v[7]-0&&v[7]>1) v[7] /= w;
                        if(v[8]-0&&v[8]>1) v[8] /= h;
                        if(v[9]-0&&v[9]>1) v[9] /= w;
                        if(v[10]-0&&v[10]>1) v[10] /= h;
                        if(v[9]-0) w *= v[9]-0; if(v[10]-0) h *= v[10]-0;
                        }
                     var x1 = v[0]; 
                     if(!x1||x1==0) x1 = 0; 
                     else if(x1-0) x1++;  
                     else { 
                        var x = GetWidth(c)-w, xx = x1.length>1 ? parseInt(x1.slice(1)) : 0, q = x1.charAt(0); 
                        if(r[c+"Span"]) for(var i=1;i<r[c+"Span"];i++) x += GetWidth(C[ci+i]?C[ci+i].Name:null);
                        x1 = q==")" ? x+xx : q=="(" ? xx : x/2+xx; 
                        } 
                     var y1 = v[1]; 
                     if(!y1||y1==0) y1 = 0; 
                     else if(y1-0) y1++; 
                     else { 
                        var y = GetHeight(r)-h, yy = y1.length>1 ? parseInt(y1.slice(1)) : 0, q = y1.charAt(0); 
                        y1 = q==")" ? y+yy : q=="(" ? yy : y/2+yy; 
                        } 
                     var x2 = x1+w, y2 = y1+h, idx1 = idx, idx2 = idx, cidx1 = GetColIndex(CN[c]), cidx2 = cidx1;
                     if(v[4]>=45&&v[4]<135||v[4]>=225&&v[4]<315){ 
                        var a = w; w = h; h = a;
                        x1 += Math.round(h/2-w/2); y1 += Math.round(w/2-h/2);
                        x2 = x1+w, y2 = y1+h;
                        }
                     var two = O.Cfg.ImgAnchor; 
                     Draw += two ? '<xdr:twoCellAnchor editAs="'+(two==2?"two":"one")+'Cell">' : '<xdr:oneCellAnchor>'; 
                     var i = ci; while(x1<0&&C[--i]){ cidx1--; x1 += GetWidth(C[i].Name); }
                     var i = ri; while(y1<0&&R[--i]){ idx1--; y1 += GetHeight(R[i]); }
                     var i = ci, ww = GetWidth(c); while(x1>=ww&&C[i]){ x1 -= ww; cidx1++; i++; ww = GetWidth(C[i]?C[i].Name:null); }
                     var i = ri, hh = GetHeight(r); while(y1>=hh&&R[i]){ y1 -= hh; idx1++; i++; hh = GetHeight(R[i]); }
                     Draw += '<xdr:from><xdr:col>'+(cidx1-1)+'</xdr:col><xdr:colOff>'+Math.round(x1*9525)+'</xdr:colOff><xdr:row>'+(idx1-1)+'</xdr:row><xdr:rowOff>'+Math.round(y1*9525)+'</xdr:rowOff></xdr:from>';
                     if(two) {
                        var i = ci, ww = GetWidth(c); while(x2>=ww){ x2 -= ww; cidx2++; i++; ww = GetWidth(C[i]?C[i].Name:null); }
                        var i = ri, hh = GetHeight(r); while(y2>=hh){ y2 -= hh; idx2++; i++; hh = GetHeight(R[i]); }
                        Draw += '<xdr:to><xdr:col>'+(cidx2-1)+'</xdr:col><xdr:colOff>'+Math.round(x2*9525)+'</xdr:colOff><xdr:row>'+(idx2-1)+'</xdr:row><xdr:rowOff>'+Math.round(y2*9525)+'</xdr:rowOff></xdr:to>';
                        }
                     else Draw += '<xdr:ext cy="'+Math.round(h*9525)+'" cx="'+Math.round(w*9525)+'"/>';
                     Draw += '<xdr:pic>';
                     Draw += '<xdr:nvPicPr><xdr:cNvPr name="'+(v[6]?v[6]:'')+'" id="'+(DrawId++)+'"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr>';
                     Draw += '<xdr:blipFill rotWithShape="1">'; 
                     if(!II[4]) II[4] = DrawPos++;
                     var DR = DrawRels[I[l]]; 
                     if(!DR) { 
                        DR = []; DR[0] = "rId"+DrawRelIdx++; DR[1] = '<Relationship Id="'+DR[0]+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image'+II[4]+'.'+GetDataType(II[2],1)+'"/>';
                        if(II[3]){ DR[2] = "rId"+DrawRelIdx++; DR[3] = '<Relationship Id="'+DR[2]+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image'+II[4]+'.svg"/>'; }
                        DrawRels[I[l]] = DR;
                        }
                     Draw += '<a:blip r:embed="'+DR[0]+'" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'; 
                     
                     if(v[5]) Draw += '<a:alphaModFix amt="'+v[5]*100000+'"/>';
                     if(II[3]){ 
                        Draw += '<a:extLst>';
                        
                        Draw += '<a:ext uri="{96DAC541-7B7A-43D3-8B79-37D633B846F1}"><asvg:svgBlip xmlns="" r:embed="'+DR[2]+'" xmlns:asvg="http://schemas.microsoft.com/office/drawing/2016/SVG/main"/></a:ext>';
                        Draw += '</a:extLst>';
                        }
                     Draw += '</a:blip>';
                     if(crop){
                        Draw += '<a:srcRect';
                        if(v[7]-0) Draw += ' l="'+Math.round(v[7]*100000)+'"';
                        if(v[8]-0) Draw += ' t="'+Math.round(v[8]*100000)+'"';
                        if(1-v[7]-v[9]) Draw += ' r="'+Math.round((1-v[7]-v[9])*100000)+'"';
                        if(1-v[8]-v[10]) Draw += ' b="'+Math.round((1-v[8]-v[10])*100000)+'"';
                        Draw += '/>';
                        }
                     Draw += '<a:stretch><a:fillRect/></a:stretch>';  
                     
                     Draw += '</xdr:blipFill>';
                     Draw += '<xdr:spPr>';
                     var rot = ""; 
                     if(v[4]) rot = ' rot="'+Math.round(v[4]*60000)+'"'; 
                     Draw += '<a:xfrm'+rot+'><a:ext cy="'+Math.round(h*9525)+'" cx="'+Math.round(w*9525)+'"/></a:xfrm>'; 
                     Draw += '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'; 
                     Draw += '</xdr:spPr>';
                     Draw += '</xdr:pic><xdr:clientData/></xdr:'+(two?"two":"one")+'CellAnchor>';
                     }
                  }
               }
            }
         if(vs||r.Height||r.Visible==0||RS||r.Level&&!hidetree){
            Sheet += '<row r="'+idx+'"';
            MS.Tree; if(r.Level&&!hidetree) Sheet += ' outlineLevel="'+r.Level+'"'; ME.Tree;
            if(r.Height) Sheet += ' customHeight="1" ht="'+r.Height*3/4+'"'; 
            if(r.Visible==0) Sheet += ' hidden="1"';
            if(RS) Sheet += ' customFormat="1" s="'+RS+'"';
            Sheet += vs ? '>'+vs+'</row>' : '/>';
            }
         idx++;
         }
      }
   Sheet += '</sheetData>';

   if(L){
      Sheet += '<sheetProtection sheet="1"';
      if(!L["resizerow"]&&!L["hiderow"]) Sheet += ' formatRows="0"';
      if(!L["resizecol"]&&!L["hidecol"]) Sheet += ' formatColumns="0"';
      if(!L["style"]) Sheet += ' formatCells="0"';
      if(L["focus"]) Sheet += ' selectLockedCells="1"';
      if(!L["sort"]) Sheet += ' sort="0"';
      if(!L["filter"]) Sheet += ' autoFilter="0"';
      if(!L["delrow"]) Sheet += ' deleteRows="0"';
      if(!L["delcol"]) Sheet += ' deleteColumns="0"';
      if(!L["addrow"]&&!L["moverow"]) Sheet += ' insertRows="0"';
      if(!L["addcol"]&&!L["movecol"]) Sheet += ' insertColumns="0"';
      if(!L["editlink"]) Sheet += ' insertHyperlinks="0"';
      if(!L["editimg"]) Sheet += ' objects="0"';
      if(OO.Password) for(var n in OO.Password) Sheet += ' '+n+'="'+OO.Password[n]+'"';
      Sheet += '/>';
      }
   
   if(Merge.length) Sheet += '<mergeCells count="'+Merge.length+'">'+Merge.join("")+'</mergeCells>'; 

   if(Links) Sheet += '<hyperlinks>'+Links+'</hyperlinks>'; 

   if(Draw) { 
      var rid = "rId"+SheetRelIdx++;
      Sheet += '<drawing r:id="'+rid+'"/>';
      SheetRels['@drawing'] = [rid,'<Relationship Id="'+rid+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing'+(OO.Index+1)+'.xml"/>'];
      files["xl/drawings/drawing"+(OO.Index+1)+".xml"] = Xml+'<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'+Draw+'</xdr:wsDr>';
      CTypes += '<Override PartName="/xl/drawings/drawing'+(OO.Index+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>';
      }

   Sheet = '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'+SheetPr+'<dimension ref="A1:'+GetColName(pos>2?pos-2:1)+(idx>1?idx-1:1)+'"/>'+Sheet;
   files["xl/worksheets/sheet"+(OO.Index+1)+".xml"] = Xml+Sheet+"</worksheet>";
   if(GetCount(SheetRels)) {
      var s = ""; for(var rel in SheetRels) s += SheetRels[rel][1]; 
      files["xl/worksheets/_rels/sheet"+(OO.Index+1)+".xml.rels"] = Xml+Rels+s+"</Relationships>";
      }
   if(GetCount(DrawRels)) {
      var s = ""; for(var rel in DrawRels) { s += DrawRels[rel][1]; if(DrawRels[rel][3]) s += DrawRels[rel][3]; }
      files["xl/drawings/_rels/drawing"+(OO.Index+1)+".xml.rels"] = Xml+Rels+s+"</Relationships>";
      }
   }
var O = X.Sheets[X.Sheet].Data; 

for(var img in X.ImgCache){
   var II = X.ImgCache[img]; if(!II[4]) continue; 
   var b = II[2].indexOf("base64,");
   files["xl/media/image"+II[4]+"."+GetDataType(II[2],1)] = II[2].slice(b>=0 ? b+7 : II[2].indexOf(";")+1);
   if(II[3]) { b = II[3].indexOf("base64,"); files["xl/media/image"+II[4]+".svg"] = II[3].slice(b>=0 ? b+7 : II[3].indexOf(";")+1); }
   }

var SS = [], D = null;
for(var s in Strings){ 
   var v = s;
   if(v.indexOf("&")>=0 && v.search(/&(?!lt;|gt;|amp;|quot;|apos;|#x?\d+;)\w+;/g)>=0) v = v.replace(/&nbsp;/g,"&#160;").replace(/&cent;/g,"&#162;").replace(/&pound;/g,"&#163;").replace(/&yen;/g,"&#165;").replace(/&sect;/g,"&#167;").replace(/&copy;/g,"&#169;").replace(/&reg;/g,"&#174;").replace(/&euro;/g,"&#8364;").replace(/&(?!lt;|gt;|amp;|quot;|apos;|#x?\d+;)/g,"&amp;");
   if(v.indexOf("<")<0||v.search(CRepHtml)<0) { 
      SS[Strings[s]] = '<si>'+(v.search(/[\r\n]|\s\s|^\s|\s$/)>=0 ? '<t xml:space="preserve">' : '<t>') + v + '</t></si>'; 
      continue; 
      } 
   var S = '<si>';
   if(v.search(/<\/?(?!span)\w+[\s>]|<span[^<]*<span/)>=0){ 
      if(!D) D = document.createElement("div");
      D.innerHTML = v; SetTagsRoot(D,O.Cfg.LineHeightRatio); v = D.innerHTML;
      if(v.indexOf("&")>=0 && v.search(/&(?!lt;|gt;|amp;|quot;|apos;|#x?\d+;)\w+;/g)>=0) v = v.replace(/&nbsp;/g,"&#160;").replace(/&cent;/g,"&#162;").replace(/&pound;/g,"&#163;").replace(/&yen;/g,"&#165;").replace(/&sect;/g,"&#167;").replace(/&copy;/g,"&#169;").replace(/&reg;/g,"&#174;").replace(/&euro;/g,"&#8364;").replace(/&(?!lt;|gt;|amp;|quot;|apos;|#x?\d+;)/g,"&amp;");
      }
   v = v.replace(/<br\s*\/?>/g,"\n");
   var A = v.split(/<\/?span\s*/);
   if(A[0]) S += (A[0].search(/[\r\n]|\s\s|^\s|\s$/)>=0 ? '<t xml:space="preserve">' : '<t>')+A[0]+"</t>";
   for(var i=1;i<A.length;i++){  
      var a = A[i];
      if(a.charAt(0)!=">") {
         var M = a.match(/[^>]*style\s*=\s*("[^"]+"|'[^']+')[^>]*>([\s\S]*)/);
         if(M){
            var N = M[1].slice(1,-1), o = ""; 
            if(N.indexOf("&")>=0) N = N.replace(/&quot;/g,'"').replace(/&lt;/g,"<").replace(/&amp;/g,"&");
            
            N = N.split(/\s*;\s*|\s*:\s*/); 
            for(var j=0;j<N.length;j+=2){
               var n = N[j], v = N[j+1];
               if(n=="font-weight") { if(v=="bold"||v>500) o += '<b/>'; }
               else if(n=="font-style"){ if(v=="italic") o += '<i/>'; }
               else if(n=="text-decoration"){
                  if(v.indexOf("underline")>=0){ var val = v.indexOf("red")>=0 ? (v.indexOf("double")>=0?"doubleAccounting":"singleAccounting") : (v.indexOf("double")>=0?"double":""); o += '<u'+(val?'val="'+val+'"':'')+'/>'; }
                  if(v.indexOf("line-through")>=0) o += "<strike/>";
                  }
               else if(n=="color") o += '<color rgb="'+ConvertColor(v)+'"/>';
               else if(n=="text-shadow"&&O.Cfg.ExportTextShadow) { for(var k=0;k<N.length;k+=2) if(N[k]=="color") break; if(k==N.length) o += '<color rgb="'+ConvertColor(v.split(" ")[3])+'"/>'; }
               else if(n=="vertical-align"){ if(v=="50%") o += '<vertAlign val="superscript"/>'; else if(v=="-50%") o += '<vertAlign val="subscript"/>'; }
               else if(n=="font-size") o += '<sz val="'+Math.round(parseFloat(v)*3/4)+'"/>';
               else if(n=="font-family") o += '<rFont val="'+v.replace(/["']/g,"")+'"/>';
               }
            S += '<r>'+(o?'<rPr>'+o+'</rPr>':'')+(M[2].search(/[\r\n]|\s\s|^\s|\s$/)>=0 ? '<t xml:space="preserve">' : '<t>')+M[2]+'</t></r>';
            }
         }
      else if(a.length>1) { a = a.slice(1); S += '<r>'+(a.search(/[\r\n]|\s\s|^\s|\s$/)>=0 ? '<t xml:space="preserve">' : '<t>')+a+'</t></r>'; }
      }
   SS[Strings[s]] = S+'</si>';
   }
var String = '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="'+SS.length+'" uniqueCount="'+SS.length+'">'+SS.join("");
files["xl/sharedStrings.xml"] = Xml+String+'</sst>';

var Style = '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">';
var SS = ['<xf borderId="0" fillId="0" fontId="0" numFmtId="0" xfId="0"/>'];
var Formats = {}, FormatsPos = 164, Borders = {}, BordersPos = 1, Fills = {}, FillsPos = 2, Fonts = {}, FontsPos = 1;
var FormatNumbers = {}; for(var a in CFormatNumbers) if(CFormatNumbers[a]) FormatNumbers[CFormatNumbers[a]] = a;
var AlignHorizontal = {}; for(var a in CAlignHorizontal) if(CAlignHorizontal[a] && !AlignHorizontal[CAlignHorizontal[a]]) AlignHorizontal[CAlignHorizontal[a]] = a;
var AlignVertical = {}; for(var a in CAlignVertical) if(CAlignVertical[a] && !AlignVertical[CAlignVertical[a]]) AlignVertical[CAlignVertical[a]] = a;
for(var s in Styles){
   var v = s.split(SSep), font = 0, fill = 0, border = 0, format = 0;
   if(v[0]||v[1]||v[2]||v[3]){ var f = v[0]+SSep+v[1]+SSep+v[2]+SSep+v[3]; if(!Fonts[f]) Fonts[f] = FontsPos++; font = Fonts[f]; }
   if((v[4]||v[5]||v[6])&&(!v[6]||v[6]<70)){ var f = v[4]+SSep+v[5]+SSep+v[6]; if(!Fills[f]) Fills[f] = FillsPos++; fill = Fills[f] }
   if(v[7]||v[8]||v[9]||v[10]||v[6]>=70){ var f = v[7]+SSep+v[8]+SSep+v[9]+SSep+v[10]+(v[6]>=70?SSep+v[4]+SSep+v[5]+SSep+v[6]:""); if(!Borders[f]) Borders[f] = BordersPos++; border = Borders[f]; }
   var f = v[18]; 
   if(f) { 
      if(FormatNumbers[f]) format = FormatNumbers[f];
      else { if(!Formats[f]) Formats[f] = FormatsPos++; format = Formats[f]; }
      }
   var align = "";
   if(v[11]){ var a = AlignHorizontal[CAlignTypes[v[11]]]; if(a) align += ' horizontal="'+a+'"'; }
   else if(v[16]) align += ' horizontal="centerContinuous"';
   if(v[12]){ 
      var a = AlignVertical[CVertAlignTypes[v[12]]]; 
      if(a) align += ' vertical="'+a+'"'; 
      else if(a=="JustifyAll") align += ' vertical="justify" justifyLastLine="1"';
      }
   if(v[13]-0) align += ' wrapText="1"';
   if(v[14]) align += ' indent="'+v[14]+'"';
   if(v[15]-0){
      var a = v[15]; a = a==-1 ? 255 : a==1 ? 90 : a==2 ? 180 : a>360 ? a-360 : a>180 ? 360-a : a-0+90;
      align += ' textRotation="'+a+'"'; 
      }
   var protect = "";
   if(v[17]-0) protect += ' locked="0"';
   if(v[19]-0==1) protect += ' hidden="1"';
   SS[Styles[s]] = '<xf xfId="0" fontId="'+font+'" fillId="'+fill+'" borderId="'+border+'" numFmtId="'+format+'"'
                 + (font?' applyFont="1"':'')+(fill?' applyFill="1"':'')+(border?' applyBorder="1"':'')+(format?' applyNumberFormat="1"':'')
                 + (align?' applyAlignment="1"':'')+(protect?' applyProtection="1"':'') 
                 + (align||protect?'>'+(align?'<alignment'+align+'/>':'')+(protect?'<protection'+protect+'/>':'')+'</xf>':'/>');
   }
var Xfs = '<cellXfs count="'+SS.length+'">' + SS.join("") + '</cellXfs>';

SS = [];
for(var s in Formats) SS[SS.length] = '<numFmt formatCode="'+StringToXml(s)+'" numFmtId="'+Formats[s]+'"/>';
if(SS.length) Style += '<numFmts count="'+SS.length+'">' + SS.join("") + '</numFmts>';

SS = ['<font><sz val="'+Math.round(O.Cfg.ExportFontSize*3/4)+'"/><color theme="1"/><name val="'+O.Cfg.ExportFontFace+'"/><family val="2"/><charset val="1"/></font>'];
for(var s in Fonts) {
   var a = s.split(SSep), o = "", a0 = a[0];
   if(a0&1) o += '<b/>';
   if(a0&2) o += '<i/>';
   if(a0&8) o += '<strike/>';
   if(a0&4){
      if((a0&320)==320) o += '<u val="doubleAccounting"/>';
      else if(a0&256) o += '<u val="singleAccounting"/>'; 
      else if(a0&64) o += '<u val="double"/>'; 
      else o += '<u/>';
      }
   if(a0&1024) o += '<vertAlign val="superscript"/>';
   else if(a0&2048) o += '<vertAlign val="subscript"/>';
   if(a[1]) o += '<sz val="'+Math.round(parseFloat(a[1])*3/4)+'"/>';
   if(a[2]) o += '<name val="'+StringToXml(a[2])+'"/>';
   if(a[3]) o += '<color rgb="'+ConvertColor(a[3])+'"/>';
   SS[Fonts[s]] = '<font>'+o+'</font>';
   }
if(SS.length) Style += '<fonts count="'+SS.length+'">' + SS.join("") + '</fonts>';

SS = ['<fill><patternFill patternType="none"/></fill>','<fill><patternFill patternType="gray125"/></fill>'];
for(var s in Fills) {
   var a = s.split(SSep), o = "";
   var bg = ConvertColor(a[0]), fg = ConvertColor(a[1]);
   if(!a[2]) o += '<patternFill patternType="solid"><fgColor rgb="'+bg+'"/></patternFill>'; 
   else if(a[2]<20){ 
      var d = [0,90,90,0,0,45,45,135,135][a[2]]; if(!d) d = 0;
      o += '<gradientFill degree="'+d+'">';
      if(a[2]%2) o += '<stop position="0"><color rgb="'+fg+'"/></stop><stop position="1"><color rgb="'+bg+'"/></stop>';
      else o += '<stop position="0"><color rgb="'+fg+'"/></stop><stop position="0.5"><color rgb="'+bg+'"/></stop><stop position="1"><color rgb="'+fg+'"/></stop>';
      o += '</gradientFill>';
      }
   else if(a[2]<40){ 
      o += '<gradientFill type="path"';
      if(a[2]==22||a[2]==24) o += ' left="1" right="1"';
      if(a[2]==23||a[2]==24) o += ' top="1" bottom="1"';
      if(a[2]==25) o += ' left="0.5" right="0.5" top="0.5" bottom="0.5"';
      o += '><stop position="0"><color rgb="'+fg+'"/></stop><stop position="1"><color rgb="'+bg+'"/></stop>';
      o += '</gradientFill>';
      }
   else if(a[2]<70) o += '<patternFill patternType="'+CPatterns[a[2]-40]+'">'+(a[1]?'<fgColor rgb="'+fg+'"/>':'')+(a[0]?'<bgColor rgb="'+bg+'"/>':'')+'</patternFill>'; 
   
   SS[Fills[s]] = '<fill>'+o+'</fill>';
   }
if(SS.length) Style += '<fills count="'+SS.length+'">' + SS.join("") + '</fills>';

SS = ['<border><left/><right/><top/><bottom/><diagonal/></border>'];
var Sides = ["left","right","top","bottom"];
for(var s in Borders) {
   var a = s.split(SSep), o = "", diag = "<diagonal/>";
   if(a[6]){ 
      o += '<border';
      if(a[6]<80) { o += ' diagonalUp="1"'; a[6] -= 70; }
      else if(a[6]<90) { o += ' diagonalDown="1"'; a[6] -= 80; }
      else if(a[6]<100) { o += ' diagonalUp="1" diagonalDown="1"'; a[6] -= 90; }
      o += '>';
      var styl = "", clr = "";
      if(a[6]==1){ if(a[5]=="#AAA") styl = "dashDotDot"; else if(a[5]=="#666") styl = "dashDot"; else { styl = "dotted"; if(a[5]!="#000") clr = a[5]; } }
      else if(a[6]==2){ if(a[5]=="#888") styl = "hair"; else { styl = "thin"; if(a[5]!="#000") clr = a[5]; } }
      else if(a[6]==3){ if(a[5]=="#AAA") styl = "mediumDashDotDot"; else if(a[5]=="#844") styl = "slantDashDot"; else if(a[5]=="#666") styl = "mediumDashDot"; else { styl = "mediumDashed"; if(a[5]!="#000") clr = a[5]; } }
      else if(a[6]==4){ if(a[5]=="#888") styl = "double"; else { styl = "thick"; if(a[5]!="#000") clr = a[5]; } }
      if(styl) diag = '<diagonal style="'+styl+'"><color'+(clr?' rgb="'+ConvertColor(clr)+'"':' indexed="64"')+'/></diagonal>';
      }
   else o += '<border>';
   for(var i=0;i<4;i++){
      var v = a[i].split(","), side = Sides[i], styl = "", clr = "";
      if(v[0]==1){ styl = "thin"; if(v[1]!="#000") clr = v[1]; }
      else if(v[0]==2){ styl = "medium"; if(v[1]!="#000") clr = v[1]; }
      else if(v[0]==3){ if(v[1]=="#888") styl = "double"; else { styl = "thick"; if(v[1]!="#000") clr = v[1]; } }
      else if(v[0]==4){ if(v[1]=="#888"||O.Cfg.DefaultBorder&2&&O.Cfg.DefaultBorderColor) styl = "hair"; else { styl = "dotted"; if(v[1]!="#000") clr = v[1]; } }
      else if(v[0]==5){ styl = "double"; if(v[1]!="#000") clr = v[1]; }
      else if(v[0]==6){ if(v[1]=="#AAA") styl = "dashDotDot"; else if(v[1]=="#666") styl = "dashDot"; else { styl = "dashed"; if(v[1]!="#000") clr = v[1]; } }
      else if(v[0]==7){ if(v[1]=="#AAA") styl = "mediumDashDotDot"; else if(v[1]=="#844") styl = "slantDashDot"; else if(v[1]=="#666") styl = "mediumDashDot"; else { styl = "mediumDashed"; if(v[1]!="#000") clr = v[1]; } }
      if(styl) o += '<'+side+' style="'+styl+'"><color'+(clr?' rgb="'+ConvertColor(clr)+'"':' indexed="64"')+'/></'+side+'>';
      else o += '<'+side+'/>';
      }
   SS[Borders[s]] = o+diag+'</border>';
   }
if(SS.length) Style += '<borders count="'+SS.length+'">' + SS.join("") + '</borders>';

Style += '<cellStyleXfs count="1"><xf numFmtId="0" borderId="0" fillId="0" fontId="0"/></cellStyleXfs>';
Style += Xfs;
Style += '<cellStyles count="1"><cellStyle xfId="0" builtinId="0" name="Normal"/></cellStyles>';
Style += '<dxfs count="0"/>';
Style += '<tableStyles count="0" defaultPivotStyle="PivotStyleLight16" defaultTableStyle="TableStyleMedium2"/>';
files["xl/styles.xml"] = Xml+Style+'</styleSheet>';

if(Calc) files["xl/calcChain.xml"] = Xml+'<calcChain xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+Calc+'</calcChain>';
files["[Content_Types].xml"] = Xml+CTypes+'</Types>';
files["_rels/.rels"] = Xml+CRels+'</Relationships>';
files["xl/workbook.xml"] = Xml+WBook+'</workbook>';
files["xl/_rels/workbook.xml.rels"] = Xml+WBookRels+'</Relationships>';

return files;
}
// -----------------------------------------------------------------------------------------------------------
ME.Export;
ME.Xlsx;

// -----------------------------------------------------------------------------------------------------------
// Functions for export to XLS and CSV
// -----------------------------------------------------------------------------------------------------------
MS.Export;
MS.Csv;
// -----------------------------------------------------------------------------------------------------------
TGP.GetExport = function(VCols,VRows){
var et = this.ConvertFlags(this.ExportType,CExportTypeFlags), L = this.Lang.Format, frm = (this.ExportFormat+"").toLowerCase();
var A = et["selected"] ? this.GetExportSelected() : [], sel = A[0], SR = A[1], SC = A[2]; 
if(et["filtered"]) this.CalculateNoFilter();
var csv = frm=="csv", xls = frm=="xls";

var CC = this.ColNames, C = [], Cols = {}, lc = this.AutoColPages ? this.Cols[this.GetLastDataCol(67)] : null, lcnt = 0, rcnt = 0;
for(var j=0;j<CC.length;j++) {
   if(j==1) lcnt = C.length;
   else if(j==CC.length-1) rcnt = C.length;
   for(var i=0;i<CC[j].length;i++) {
      var n = CC[j][i], c = this.Cols[n];
      if(!(!c.CanExport||c.CanExport==1&&!(VCols&&VCols[c.Name]!=null?VCols[c.Name]:c.Visible||et["hidden"])||(sel&2&&!c.Selected&&(!SC||!SC[c.Name]))&&c.CanExport!=4)) { C[C.length] = n; Cols[n] = c; }
      if(c==lc) { j = CC.length; break; }
      }
   }

function SetRow(r){
   var D = r.Def, exp = r.CanExport; if(exp==null) exp = D.CanExport;
   if(!exp||exp==1&&(VRows&&VRows[r.id]!=null?!VRows[r.id]:!r.Visible&&!et[r.Filtered?"filtered":"hidden"])) return lr==r;
   if(exp==2 || (sel&1&&!r.Selected&&(!SR||!SR[r.id]))&&exp!=4) {
      for(var a=r.firstChild;a;a=a.nextSibling) if(SetRow(a)) return true;
      return;
      }
   if(r.firstChild&&rev&&(r.Expanded||et["expanded"]||xls&&et["outline"])) for(var a=r.firstChild;a;a=a.nextSibling) if(SetRow(a)) return true;
   R[R.length] = r;
   Rows[r.id] = r;
   if(r.firstChild&&!rev&&(r.Expanded||et["expanded"]||xls&&et["outline"])) for(var a=r.firstChild;a;a=a.nextSibling) if(SetRow(a)) return true;
   }
var R = [], lr = this.AutoPages ? this.GetLastDataRow(67) : null, rev = this.ReversedTree, Rows = {};
for(var r=this.XH.firstChild;r;r=r.nextSibling) SetRow(r);
for(var b=this.XB.firstChild;b;b=b.nextSibling) for(var r=b.firstChild;r;r=r.nextSibling) if(SetRow(r)) { b = this.XB.lastChild; break; }
for(var r=this.XF.firstChild;r;r=r.nextSibling) SetRow(r);
var A = [], ExportBool = et["bool"] ? this.ExportBool.slice(1).split(this.ExportBool.charAt(0)) : null, mc = this.Cols[this.MainCol], keep = et["keephtml"];
if(et["indent"]&&mc){ var a = "", exlev2 = []; for(var i=0;i<30;i++){ exlev2[i] = a; a += '   '; } }

if(csv){
   var CSep = this.CSVValueSeparator, RSep = this.CSVRowSeparator, Quot = this.CSVQuote, df = this.CSVDateFormat, nf = this.CSVNumberFormat;
   var reg = new RegExp("("+ToRegExp(CSep)+")|("+(RSep=="\r\n"?"[\\r\\n]":ToRegExp(RSep))+")|("+ToRegExp(Quot)+")","g"), qreg = new RegExp(ToRegExp(Quot),"g");
   if(et["outline"]&&mc) { var a = "", exlev = []; for(var i=0;i<30;i++){ exlev[i] = a; a += this.CSVLevel; } }
   if(this.ExportPrefix) A[A.length] = this.ExportPrefix;
   var empty = et["empty"] ? " " : "", op = {};
   }
if(xls){
   A[A.length] = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">'
   A[A.length] = '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"/></head><body>';
   A[A.length] = '<style>body {font-size:30px; } td {white-space:nowrap} br {mso-data-placement:same-cell;} .sd {mso-number-format:"Short Date";} .st {mso-number-format:"Short Time";} .gd {mso-number-format:"General Date";}</style>';
   A[A.length] = '<!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:Colors><o:Color><o:Index>37</o:Index><o:RGB>#F0F0E0</o:RGB></o:Color><o:Color><o:Index>38</o:Index><o:RGB>#F6F6F6</o:RGB></o:Color></o:Colors></o:OfficeDocumentSettings></xml><![endif]-->';
   if(et["outline"] && !this.ReversedTree) A[A.length] = "<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>"+this.id+"</x:Name><x:WorksheetOptions><x:NoSummaryRowsBelowDetail/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->";
   if(this.ExportPrefix) A[A.length] = this.ExportPrefix;
   var empty = "", RSep = "\n", op = FromJSON(this.ExportOptions,1);
   var rat =  et["size"]&&this.Size!="Normal" ? this.GetExportRatio() : 1;
   var wdiff = (!et["size"] ? this.Img.Width : rat ? rat : 1) / this.ExportWidthRatio;
   function GetBorder(val,side){ if(!val) return ""; val = val.split(","); return "border"+(side?"-"+side:"")+":"+(val[0]?val[0]:1)+"px solid "+(val[1]?val[1]:"black")+";"; }
   A[A.length] = "<table border='1' bordercolor='silver' style='table-layout:fixed;border-collapse:collapse;"+GetBorder(op.TableBorder,et["empty"]?"left":"")+";font-size:"+Math.round(this.ExportFontSize*rat)+";font-family:"+this.ExportFontFace+"'>";
   for(i=0;i<C.length;i++) A[A.length] = "<col width='"+Math.round(this.Cols[C[i]].Width/wdiff)+"'/>";
   for(var H=this.XH.lastChild;H;H=H.previousSibling) if(H.Kind=="Header") break; 
   var hs = op.HeaderStyle; if(!hs) hs = ""; else { hs = hs.toLowerCase(); hs = (hs.indexOf("bold")>=0 ? "font-weight:bold;" : "") + (hs.indexOf("italic")>=0 ? "font-style:italic;" : ""); }
   if(this.ExportAlternate&&!this.Alternate){ this.Alternate = this.ExportAlternate; this.ReColor(1); this.Alternate = null; }
   }
var noflt = et["filtered"] || !this.HasFilter();

for(var ri=0;ri<R.length;ri++){
   var v, s = "", r = R[ri], D = r.Def, flt = r.Kind=="Filter"; if(flt && noflt) continue; 
   if(csv&&mc&&et["outline"]) s += (r.Level ? exlev[r.Level] : "") + CSep;
   if(xls){
      if(et["outline"] && !r.Fixed){
         var disp = ""; if(!et["expanded"]){ for(var par = r.parentNode;par&&!par.Page;par=par.parentNode) if(!par.Expanded) { disp = "display:none;"; break; } }
         s += "<tr style='mso-outline-level:"+r.Level+";"+(!r.Expanded && !et["expanded"]?"mso-outline-parent:collapsed;":"")+disp+"'>";
         }
      else s += "<tr>";
      }
   for(var ci=0;ci<C.length;ci++) {
      if(csv){ var add = ""; if(ci) s += CSep; }
      if(xls){ var styl = "", span = ""; }
      if(!ci&&r.LeftHtml&&lcnt) { var U = this.GetExportUser(r,C,0,lcnt,r.LeftHtml,keep); if(U) { v = U[0]; ci += U[1]-1; typ = "EHtml"; if(xls) span += " colspan='"+U[1]+"'"; if(csv) for(var i=0;i<U[1];i++) add += CSep; } }
      else if(ci==lcnt&&r.MidHtml){ var U = this.GetExportUser(r,C,lcnt,rcnt,r.MidHtml,keep); if(U) { v = U[0]; ci += U[1]-1; typ = "EHtml";  if(xls) span += " colspan='"+U[1]+"'"; if(csv) for(var i=0;i<U[1];i++) add += CSep; } }
      else if(ci==rcnt&&r.RightHtml){ var U = this.GetExportUser(r,C,rcnt,C.length,r.RightHtml,keep); if(U) { v = U[0]; ci += U[1]-1; typ = "EHtml";  if(xls) span += " colspan='"+U[1]+"'"; if(csv) for(var i=0;i<U[1];i++) add += CSep; } }
      else {
         var c = C[ci];
         if(r.Spanned&&r[c+"Span"]!=1||r.RowSpan&&(r[c+"RowSpan"]>1||r[c+"RowSpan"]==0)){
            var U = this.GetExportSpan(r,c,Rows,Cols,xls?et["nospan"]:1); if(!U||!U[2]||!U[3]) { s += empty; continue; }
            var vis = U[4]; r = U[0]; c = U[1]; if(U[2]!=1) span += " rowspan='"+U[2]+"'"; if(U[3]!=1) span += " colspan='"+U[3]+"'";
            }
         else { 
            var vis = r[c+"Visible"]; if(vis==null) vis = D[c+"Visible"]; if(vis<=-2) { s += empty; continue; } 
            }
         if(xls){
            if(!et["nocolor"]) { var clr = this.GetExportColor(r,c,this.GetAttr(r,c,"Color",null,this.DynamicStyle?2:1),op,!sel); if(clr) styl += "background:"+clr+";"; }
            if(ci==lcnt) styl += GetBorder(op.LeftBorder,"left");
            if(ci==rcnt) styl += GetBorder(op.RightBorder,"left");
            if(r.Kind=="Header") { styl += hs; if(r==H) styl += GetBorder(op.HeaderBorder,"bottom"); } 
            else {
               if(r.Fixed=="Head"&&!r.nextSibling) styl += GetBorder(op.HeadBorder,"bottom");
               if(r.Fixed=="Foot"&&!r.previousSibling) styl += GetBorder(op.FootBorder,"top");
               }
            }
         if(vis<=0 || sel&4  && !r[c+"Selected"] && !(r.Selected&1) && !this.Cols[c].Selected || sel&8 && !this.IsFocused(r,c)) { 
            if(xls) s += "<td"+span+(styl?" style=\""+styl+"\"":"")+">"+(et["empty"]?CNBSP:"")+"</td>";
            if(csv) s += empty; 
            continue; 
            }
         var typ = this.GetType(r,c);
         var frm = r[c+"ExportFormat"]; if(frm==null) frm = D[c+"ExportFormat"]; if(frm==null) frm = this.Cols[c].ExportFormat; if(frm==null) frm = this.GetFormat(r,c);
         v = r[c+"ExportHtml"]; if(v==null) v = D[c+"ExportHtml"]; if(v!=null){ typ = "EHtml"; frm = null; }
         if(v==null) v = r[c+"ExportValue"]; if(v==null) v = D[c+"ExportValue"]; if(v==null) v = r[c]; if(v==null) v = D[c];
         if(xls){ var wrap = r[c+"Wrap"]; if(wrap==null) wrap = D[c+"Wrap"]; if(wrap==null) wrap = r.Wrap; if(wrap==null) wrap = D.Wrap; if(wrap==null) wrap = this.Cols[c].Wrap; }
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
         if(frm=="!") {       
            if(ExportBool) v = ExportBool[v?1:v===""?2:0];
            else v = v==null||v==="" ? "" : v-0 ? 1 : 0;
            }
         else if(typ=="Auto" && (frm=="@" || !(v-0)&&v!="0")){  
            if(v&&typeof("string")&&v.charAt(0)==L.TextPrefix) v = v.slice(1);
            if(xls&&wrap==null&&v.search(!this.AutoHtml?/\n/:/\<br\s*\/?>/i)>=0) wrap = 1;
            }
         else if(typ=="Date"||typ=="Auto"&&frm&&L.IsDate(frm)){ 
            if(csv){
               if(df==1) v = L.DateToString(v,frm,this.IsRange(r,c));
               else if(df==2) v = L.DateToString(v,this.GetFormat(r,c,"Date"),this.IsRange(r,c),0,0,1);
               else if(df) v = L.DateToString(v,df,this.IsRange(r,c),0,0,1);
               else if(!this.ExcelDates&&(v||v=="0")) {
                  if(this.IsRange(r,c)){
                     v = v.split(L.ValueSeparator);
                     for(var i=0;i<v.length;i++){ 
                        var q = v[i].indexOf(L.RangeSeparator); 
                        v[i] = q<0 ? (v[i]-0+2209161600000)/86400000 : (v[i].slice(0,q)-0+2209161600000)/86400000 + L.RangeSeparator + (v[i].slice(q+1)-0+2209161600000)/86400000;
                        }
                     v = v.join(L.ValueSeparator);
                     }
                  else v = (v-0+2209161600000)/86400000;
                  }
               }
            if(xls){
               
               if(!v && v!="0") v = "";
               else if(this.IsRange(r,c) && typeof(v)=="string") v = L.DateToString(v,frm,1);
               else {
                  var cls = "gd", f = L.PrepareDateFormat(frm);
                  if(!f||f.search(/[dMy]/)<0) cls = "st"; 
                  else if(f.search(/[hHmst]/)<0) cls = "sd"; 
                  span += " class='"+cls+"' x:num='"+(this.ExcelDates ? v : (v-0+2209161600000)/86400000)+"'";
                  v = L.DateToString(v-0,f);
                  if(et["dates"]) span += " x:str='"+v+"'";
                  var xf = r[c+"XlsFormat"]; if(xf==null) xf = D[c+"XlsFormat"]; if(xf==null) xf = this.Cols[c].XlsFormat;
                  if(xf==null&&frm) xf = this.ConvertExportFormat(frm,1,!!et["unsupported"],!!et["stylenumbers"]); 
                  if(xf) styl += "mso-number-format:'"+xf.replace(/\"/g,"&quot;")+"';";
                  }
               }
            }
         else if(typ=="Int"||typ=="Float"||typ=="Auto"){ 
            if(this.ExportRound&&!this.IsRange(r,c)) v = Math.round(v*this.ExportRound)/this.ExportRound;
            if(csv){
               if(v==null) v = "";
               else if(nf==1) v = L.NumberToString(v,frm,this.IsRange(r,c));
               else if(nf==2) v = L.NumberToString(v,this.GetFormat(r,c,1),this.IsRange(r,c),1);
               else if(nf) v = L.NumberToString(v,nf,this.IsRange(r,c),1);
               }
            if(xls){
               if(v-0||v=="0") { 
                  span += " x:num='"+v+"'"; 
                  var xf = r[c+"XlsFormat"]; if(xf==null) xf = D[c+"XlsFormat"]; if(xf==null) xf = this.Cols[c].XlsFormat;
                  if(xf==null&&frm) xf = this.ConvertExportFormat(frm,2,!!et["unsupported"],!!et["stylenumbers"]); 
                  if(xf) {
                     if(this.ExportEmptyDecimals && xf && xf.search(/\.[#\?]+/)>=0){
                        if(this.ExportEmptyDecimals==2){
                           
                           xf = xf.replace(/[0#?8,]*\.[#\?][0#\?8]*/g,"General"); 
                           }
                        else if(this.ExportEmptyDecimals==1&&v&&!(v%1)) xf = xf.replace(/\.[#?][0#?8]*/g,"");
                        }
                     styl += "mso-number-format:'"+xf.replace(/\\%/g,"\"%\"").replace(/\"/g,"&quot;")+"';"; 
                     }
                  v = L.NumberToString(v-0,frm); 
                  }
               else if(!v) v = "";
               else if(this.IsRange(r,c)) v = L.NumberToString(v,frm,1)
               
               else if(et["strings"]) span += ' x:str="'+v.replace(/\"/g,"&quot;")+'"';
               }
            }
         else if(typ=="Bool") {
            if(ExportBool) v = ExportBool[v?1:v===""?2:0];
            else v = v==null||v==="" ? "" : v-0 ? 1 : 0;
            }
         else if(typ=="Text"||typ=="Lines"||typ=="Html"||typ=="EHtml"){
            if(v==null) v = "";
            else if(typeof(v)=="number") v += "";
            if(xls&&(typ=="Text"||typ=="Lines")) v = v.replace(/\&/g,"&amp;").replace(/\</g,"&lt;");
            if(frm&&v!=null) v = L.FormatString(v,frm,0,this.IsRange(r,c));
            if(xls&&et["strings"]&&(v.length<10||v.search(/[a-zA-z]/)<0)) span += ' x:str="'+(typ=="Html"||typ=="EHtml"?v.replace(/\&/g,"&amp;").replace(/\</g,"&lt;"):v).replace(/\"/g,"&quot;")+'"';
            if(xls&&wrap==null&&typ!="Text") wrap = 1;
            }
         else if(typ=="Enum"||typ=="Radio"){
            if(!et["enumkeys"]) v = this.GetEnumString(r,c,0); 
            }
         else if(typ=="Abs"){
            if(v&&typeof(v)=="string"){ var a = v.split(v.charAt(0)); v = ""; for(var i=1;i<a.length;i+=8) v += (i==1?"":"\n")+a[i+4]; }
            if(xls&&wrap==null) wrap = 1;
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
               if(csv) v = lpr+(v[2]?v[2]:v[1])+lpo;
               if(xls) v = lpr+"<a href='"+PFormat.Escape(v[1])+"'>"+(v[2]?v[2]:v[1])+"</a>"+lpo;
               }
            ME.Img;
            }
         else if(typ=="Img"){
            MS.Img; 
            var lpr = "", lpo = "", link = "";
            if(frm) { 
               frm = frm.split(frm.charAt(0));
               if(frm[3]) lpr = frm[3]; 
               if(frm[4]) lpo = frm[4];
               }
            if(xls){
               v = v.split(v.charAt(0));
               if(v[6] && v[6].search(/javascript\:/)<0) link = v[6];
               }
            v = lpr+(link?"<a href='"+PFormat.Escape(v[6])+"'>":"")+this.GetText("Picture")+(link?"</a>":"")+lpo;
            ME.Img;
            }
         else if(typ=="Panel"); 
         else if(typ=="File"){
            v = this.GetFileHTML(r,c,v,0,[]);
            }
         else if(typ=="Button"){
            if(!v||v=="0") { v = this.GetAttr(r,c,"ButtonText"); if(!v) v = v=="0" ? "0" : ""; }
            else if(v-0&&this.GetAttr(r,c,"Switch")==2){ v = this.GetAttr(r,c,"ButtonText"+(v-0)); if(v==null) v = this.GetAttr(r,c,"ButtonText"); if(!v) v = v=="0" ? "0" : ""; }
            else if(v=="1"||v===true) { v = this.GetAttr(r,c,"ButtonTextChecked"); if(v==null) v = this.GetAttr(r,c,"ButtonText"); if(!v) v = v=="0" ? "0" : ""; }
            }
         else if(typ=="List"){
            v = this.GetListHTML(r,c,v);
            }
         else v = ""; 
         if(v===""){
            var ev = r[c+"EmptyValue"]; if(ev==null) ev = D[c+"EmptyValue"]; if(ev==null) ev = this.Cols[c].EmptyValue;
            if(ev!=null) v = ev;
            }
         var a = "HtmlPrefix", pr = r[c+a]; if(pr==null) pr = D[c+a]; if(pr==null) pr = n[a]; if(pr==null) pr = CC[a]; if(pr!=null) v = pr+v;
         var a = "HtmlPostfix", po = r[c+a]; if(po==null) po = D[c+a]; if(po==null) po = n[a]; if(po==null) po = CC[a]; if(po!=null) v = v+po;
         if(Grids.OnGetExportValue) { var tmp = Grids.OnGetExportValue(this,r,c,v,frm); if(tmp!=null) v = tmp; }
   
         MS.Filter; 
         if(flt) {
            if(r[c+"Filter"]){
               var ff = L.ExportFilters.split(",")[r[c+"Filter"]]; 
               if(ff.charAt(0)=="=") ff = xls ? "&nbsp;"+ff : " "+ff;
               if(L.ExportFiltersHtml&&xls) ff = L.ExportFiltersHtml.replace("%1",ff);
               v = ff+v;
               if(xls&&CAlignRight[typ]&&!this.GetAttr(r,c,"Align")) styl += "text-align:right;";
               }
            else v = "";
            }
         ME.Filter;
         
         if(mc==c&&r.Level>0&&et["indent"]) v = exlev2[r.Level] + v;
         }
         
      if(csv){
         if(!v&&v!="0" || v=="0"&&this.HideZero) v = empty;
         else if(typeof(v)=="string"){
            if(!keep && v.indexOf("<")>=0) v = v.replace(/<br\s*\/?>/g,"\n").replace(CRepHtml,""); 
            if(typ!="Text"&&typ!="Lines"&&typ!="Enum"&&typ!="Radio"&&v.indexOf("&")>=0) v = v.replace(/&nbsp;/g," ").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,"\"").replace(/&apos;/g,"'").replace(/&amp;/g,"&");
            if(v.search(reg)>=0) v = Quot + v.replace(qreg,Quot+Quot) + Quot;
            }
         s += v + add;
         }
      if(xls){
         
         if(wrap) styl += "white-space:normal;";
         var es = this.GetAttr(r,c,"ExportStyle"); if(es) styl += es+";";
         
         if(styl) styl = " style=\""+styl+"\"";
         if(v==null) v = "";
         else if(typeof(v)=="string"){
            if(v.indexOf("<img")>=0) v = v.replace(/<img[^>]*\/?>/g,"");
            if(v.indexOf("\n")>=0) v = v.replace(/\n|\r\n/g,"<br>");
            }
         if(v===""&&et["empty"]) span = " x:str=''";
         s += "<td" + span + styl + ">" + v +"</td>";
         }
      }
   if(xls) {
      if(et["empty"]) s += "<td x:str='' style='"+GetBorder(op.TableBorder,"left")+"'></td>";
      s += "</tr>";
      }
   A[A.length] = s;
   }
if(xls&&et["empty"]){ 
   var s = "<tr>", br = GetBorder(op.TableBorder,"top");
   for(var ci=0;ci<C.length;ci++) s += "<td style='"+br+"'></td>";
   A[A.length] = s + "</tr>";
   }
if(xls) A[A.length] = "</table>";
if(this.ExportPostfix) A[A.length] = this.ExportPostfix;
if(xls) A[A.length] = "</body></html>";
if(xls&&this.ExportAlternate&&!this.Alternate) for(var r=this.GetFirst();r;r=this.GetNext(r)) r.ColorPos = null;
if(et["filtered"]) this.Calculate();
return A.join(RSep);
}
// -----------------------------------------------------------------------------------------------------------
ME.Csv;
ME.Export;

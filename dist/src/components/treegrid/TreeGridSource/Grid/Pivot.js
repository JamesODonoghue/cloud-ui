// -----------------------------------------------------------------------------------------------------------
// Functions for creating detail Pivot tables
// -----------------------------------------------------------------------------------------------------------
MS.Pivot;

// -----------------------------------------------------------------------------------------------------------
TGP.PivotEscape = function(val){
if(val==="") return "-";
if(val-0||!val||val.search(/[^a-zA-z0-9]/)<0) return val+"";
return escape(val).replace(/\@/g,"%40").replace(/\*/g,"%2A").replace(/\+/g,"%2B").replace(/\-/g,"%2D").replace(/\./g,"%2E").replace(/\//g,"%2F").replace(/\_/g,"%6F").replace(/\%/g,"-");
}
// -----------------------------------------------------------------------------------------------------------
TGP.PivotUnescape = function(val){
if((val+"").indexOf("-")<0) return val+"";
if(val=="-") return "";
return unescape((val+"").replace(/\-/g,"%"));
}
// -----------------------------------------------------------------------------------------------------------
TGP.SwitchPivotGrid = function(on){
if(!this.PivotControlMaster||!this.PivotGrid) return;
var m = this.PivotGrid.MainTag.style.display!="none", p = this.MainTag.style.display!="none"; 
if(this.PivotControlMasterCookie!=null){
   var mm = this.PivotControlMasterCookie&8, pp = this.PivotControlMasterCookie&16;
   if(!m!=!mm) this.PivotGrid.MainTag.style.display = mm?"":"none" ;
   if(!p!=!pp) this.MainTag.style.display = pp?"":"none";
   this.PivotControlMasterCookie = null;
   if(!m!=!mm||!p!=!pp){ this.CalculateSpaces(1); this.PivotGrid.CalculateSpaces(1); }
   this.SaveCfg();
   return;
   }
var mm = on==0||on==2||on==3&&p&&m, pp = on!=0;
MS.LimitScroll;
if(!m!=!mm||!p!=!pp) { 
   this.NoClearLimitScroll = null;
   this.NoDoLimitScroll = null;
   this.PivotGrid.NoClearLimitScroll = null;
   this.PivotGrid.NoDoLimitScroll = null;
   }
ME.LimitScroll;
if(!m!=!mm) this.PivotGrid.MainTag.style.display = mm?"":"none";
if(!p!=!pp) this.MainTag.style.display = pp?"":"none";
UpdateAreas();
if(mm) { this.PivotGrid.CalculateSpaces(1); this.PivotGrid.ApplyMedia(0); }
if(pp&&!this.Source.PivotLoading) { this.CalculateSpaces(1); this.ApplyMedia(0); }
this.SaveCfg();
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetPivotValue = function(row,col,num){
var val = Get(row,col+"PivotValue");
if(val==null) val = num ? this.GetValue(row,col) : this.GetString(row,col);
if(Grids.OnGetPivotValue) { var tmp = Grids.OnGetPivotValue(this,row,col,val); if(tmp!=null) val = tmp; }
return val;
}

// -----------------------------------------------------------------------------------------------------------
TGP.CreatePivot = function(func,noswitch){

var G = this.PivotGrid, R = this.PivotRows, C = this.PivotCols, D = this.PivotData;
if(!G){ G = Grids[this.PivotMaster]; this.PivotGrid = G; }
if(!G||!R||!C||!D) { this.SwitchPivotGrid(0); return false; }
if(this.EditMode && this.EndEdit(1)==-1 || G.EditMode && G.EndEdit(1)==-1) return false;
var GC = G.Cols;
R = R.replace(/\s/g,"").split(","); C = C.replace(/\s/g,"").split(","); D = D.replace(/\s/g,"").split(","); 
var exp = this.PivotExpanded, rexp;
if(!exp) { exp = 0; rexp = 0; }
else { exp = (exp+"").split(","); rexp = exp[1]==null?exp[0]:exp[1]; exp = exp[0]; }
var sp = this.PivotShowParent;
for(var i=0,RR={};i<R.length;i++) {
   if(!GC[R[i]]) { R.splice(i,1); i--; }
   else RR[R[i]] = 1;
   }
for(var i=0,CC={};i<C.length;i++) { 
   if(RR[C[i]] || !GC[C[i]]) { C.splice(i,1); i--; }
   else CC[C[i]] = 1;
   }
for(var i=0;i<D.length;i++) if(RR[D[i]] || CC[D[i]] || !GC[D[i]]) { D.splice(i,1); i--; }
if(!R.length||!C.length||!D.length) { this.SwitchPivotGrid(0); return false; }
if(Grids.OnPivot && Grids.OnPivot(this,G,R,C,D)) return false;
MS.Debug; this.Debug(4,"Creating pivot table"); this.StartTimer("Pivot"); ME.Debug;
this.PivotRows = R.join(","); this.PivotCols = C.join(","); this.PivotData = D.join(",");
var O = this.PivotSource; 
if(!O) {
   O = {Def:{},DefCols:{},Header:{},Cols:{}};
   for(var o in O){ for(var n in this[o]) { O[o][n] = {}; for(var q in this[o][n]) O[o][n][q] = this[o][n][q]; } }
   }

var zp = G.Paging, zsd = G.Sorted, zs = G.Sort, zss = G.Sorting, zg = G.Group; 
G.Sorted = true; G.Sorting = true; G.Paging = 0; G.InGrouping = 2; 
if(zg) G.Ungroup();
var zm = G.MainCol; if(!G.MainCol) G.MainCol = R[R.length-1];
if(!this.PivotFilter){ var zcg = G.Def.Group.CanFilter; G.Def.Group.CanFilter = 2; var zsf = G.StandardFilter; G.StandardFilter = 0; }
var pf = this.PivotFilter==2;

var A = [], p = 0, s = "";
s += "<Grid><Cfg";
s += " MainCol='MainCol' SuppressCfg='1'";
s += " FullId='1' IdNames='MainCol'";
if(R.length==1) s += " HideRootTree='1'";
s += "/>";
s += "<DefCols>";
s += "<D Name='Pivot' HideParentCol='"+(sp?0:1)+"' Def='C'/>";
s += "<D Name='PivotGroup' Def='Pivot'/><D Name='PivotLast' Def='Pivot'/><D Name='PivotData' Def='Pivot'/>";
for(var i=0;i<C.length-1;i++) s += "<D Name='"+C[i]+"' Def='PivotGroup'/>";
s += "<D Name='"+C[C.length-1]+"' Def='PivotLast'/>";
for(var i=0;i<D.length;i++) s += "<D Name='"+D[i]+"' Def='PivotData'/>";
s += "</DefCols>\n\n";
A[p++] = s; s = "";

s += "<LeftCols>";
s += "<C Name='MainCol'/>";
s += "</LeftCols>\n";
A[p++] = s; s = "";

s += "<Cols>";
G.GroupAutoId = 1;
G.Group = C.join(",") + "," + R.join(","); G.Sort = G.Group; G.DoSort(0,1); G.GroupBy(G.XB.firstChild,G.Group.replace(/\s/g,"").split(","),0,null,null,null,1);
if(!this.PivotFilter) G.DoFilterT(0);
var hidelast = D.length==1; 
var M = G.MainCol, grp = 1, H = [], L = []; 
for(var i=0;i<=C.length;i++) { H[i] = ""; L[i] = 0; }
var DC = O.DefCols, NC = [], NN = []; for(var i=0;i<C.length;i++) { NC[i] = []; NN[i] = 0; }

function CountCols(row){
   for(var r=row.firstChild;r;r=r.nextSibling) if((r.Visible||pf) && !r.Deleted) {
      NN[r.Level]++;
      if(r.Level!=C.length-1) CountCols(r);
      }
   }
CountCols(G.XB.firstChild);
for(var i=1;i<NN.length;i++) NN[i] += NN[i-1];
NN[i] = NN[i-1]*(D.length+(sp?1:0));
var max = this.PivotMaxCols; if(!max||max>500) max = 500;
for(var i=0;i<NN.length;i++) if(NN[i] > max) { 
   this.FastColumns = 0; 
   if(i && exp>=i) exp = i-1; 
   max = i-1;
   break; 
   }

if(i==NN.length) max = i;
var fs = this.FastColumns?1:0, cp = this.ColPaging && this.ColPagingFixed==0&&!this.ChromeZoom;

function CalcCols(row,n) {
   var cnt = 0;
   for(var r=row.firstChild,cnt=0;r;r=r.nextSibling) if((r.Visible||pf) && !r.Deleted) { 
      var cc = 0, val = G.GetPivotValue(r,M), nc = (n?n+"_":"") + G.PivotEscape(val), col = "P"+nc;
      
      var hl = hidelast&&r.Level==C.length-1;
      s += "<C Def='"+C[r.Level]+"' Name='"+col+"'"+(exp<r.Level||hl||!sp&&exp>r.Level ? " Visible='0' Hidden='"+fs+"'" : "")+(cp?"":" Block='"+grp+"'")+(hl?" HideParentCol='1' CanHide='0'":"")+"/>";
      NC[r.Level][NC[r.Level].length] = col;
      var expcols = "";
      if(r.Level==C.length-1){
         for(var i=0;i<D.length;i++) {
            var nn = col+"_"+D[i];
            s += "<C Def='"+D[i]+"' Name='"+nn+"'"+(exp<r.Level||!hl&&exp==r.Level ? " Visible='0' Hidden='"+fs+"'" : "")+(cp?"":" Block='"+grp+"'")+"/>";
            H[r.Level+1] += " "+nn +'="'+StringToXml(hidelast ? val : G.GetCaption(D[i]))+'"';
            expcols += ","+nn;
            }
         cc = D.length+1;
         }   
      else {
         cc = CalcCols(r,nc)+1;
         for(var rr=r.firstChild;rr;rr=rr.nextSibling) if((rr.Visible||pf) && !rr.Deleted) expcols += "," + col + "_" + G.PivotEscape(G.GetPivotValue(rr,M));
         }
      var xval = StringToXml(val);
      H[r.Level] += " "+col+"Span='"+cc+"' "+col+"Icon='Expand' "+col+"Expanded='"+(exp<=r.Level&&!hl?0:1)+"' "
                 + col+"ExpandCols='"+expcols.slice(1)+"' "+col+"ExpandRows='Header"+(r.Level==C.length-1||hidelast&&r.Level==C.length-2?"":r.Level+2)+"'";
      if(exp>r.Level||hl&&exp==r.Level) L[r.Level+1]++;
      for(var i=r.Level;i<=C.length;i++) H[i] += " "+col+"=\""+xval+'"';
      cnt += cc;
      if(r.Level==0) grp++;
      }
   return cnt;
   }
      
CalcCols(G.XB.firstChild,"");
s += "</Cols>\n\n";
A[p++] = s; s = "";

s += "<Head>";
var cap = StringToXml(O.Header.MainCol?O.Header.MainCol:O.Header[R[R.length-1]]?O.Header[R[R.length-1]]:R[R.length-1]), capjs = cap.replace(/\'/g,"\\\'"), cc = "", co = "";
for(var c in O.Cols) if(c!="Panel" && c!="id" && c!="MainCol") { cc += " "+c+"Formula=\"Row.nextSibling.Visible?'':'"+(StringToXml(O.Header[c]?O.Header[c]:c)+"").replace(/\'/g,"\\\'")+"'\""; co += c+","; }
for(var i=0;i<C.length;i++) {
   s += "<Header";
   var nv = "Row.nextSibling"+(hidelast&&i==C.length-2?".nextSibling":"")+".Visible";
   if(i<max) s += " CalcOrder='"+co+"MainCol,MainColExpanded' MainColIcon='Expand' MainColOnClickSide='"+nv+"?CollapseRowCells:ExpandRowCells' MainColExpandedFormula='"+nv+"'";
   else s += " CollapseOther='1'";
   s += hidelast&&i==C.length-1 ? " Hidden='1'" : ""; 
   s += " Visible='"+(!i||L[i]?1:0)+"' Calculated='1'"+cc+" RefreshHeight='0'";
   s += " MainColFormula=\""+nv+"?'':'"+capjs+"'\" Spanned='1' id='Header"+(i+1)+"'"+H[i]+" SortIcons='0' ExpandLevel='"+L[i]+"'/>\n";
   }
s += "<Header Visible='"+(L[C.length]?1:0)+"' MainCol=\""+cap+"\" id='Header'"+H[C.length]+" ExpandLevel='"+L[C.length]+"' RefreshHeight='0'/>\n";
s += "</Head>\n\n";
A[p++] = s; s = "";

G.Ungroup();
G.GroupAutoId = 1;
G.Group = R.join(","); G.Sort = G.Group; G.DoSort(0,1); G.GroupBy(G.XB.firstChild,G.Group.replace(/\s/g,"").split(","),0,null,null,null,1);
if(!this.PivotFilter) G.DoFilterT(0);
var M = G.MainCol;
var DR = O.Def, CD = ["PivotGroup","PivotLast","PivotData","Pivot"].concat(C,D), CR = new RegExp(CD.join("|"));

s += "<Def>";
for(var n in DR){
   var d = DR[n], Q = ""; 
   for(var a in d){
      if(a.search(CR)==0){
         for(var i=0;i<CD.length;i++) if(a.indexOf(CD[i])==0){
            if(i==0){ 
               for(var k=0;k<C.length-1;k++){
                  var nc = NC[k];
                  for(var j=0;j<nc.length;j++) Q += " "+nc[j]+a.slice(CD[i].length)+'="'+StringToXml(d[a])+'"';
                  }
               }
            else if(i==1){ 
               var nc = NC[C.length-1];
               for(var j=0;j<nc.length;j++) Q += " "+nc[j]+a.slice(CD[i].length)+'="'+StringToXml(d[a])+'"';
               }
            else if(i==2){ 
               var nc = NC[C.length-1];
               var dk = []; for(var k=0;k<D.length;k++) dk[k] = d[a].replace(/\*Name\*/g,D[k]);
               for(var j=0;j<nc.length;j++) for(var k=0;k<D.length;k++) Q += " "+nc[j]+"_"+D[k]+a.slice(CD[i].length)+'="'+StringToXml(dk[k])+'"';
               }
            else if(i==3){ 
               var da = d[a].replace(/\*Name\*/g,"");
               for(var k=0;k<C.length-1;k++){
                  var nc = NC[k];
                  for(var j=0;j<nc.length;j++) Q += " "+nc[j]+a.slice(CD[i].length)+'="'+StringToXml(da)+'"';
                  }
               var nc = NC[C.length-1];
               var dk = []; for(var k=0;k<D.length;k++) dk[k] = d[a].replace(/\*Name\*/g,D[k]);
               for(var j=0;j<nc.length;j++) {
                  Q += " "+nc[j]+a.slice(CD[i].length)+'="'+StringToXml(da)+'"';
                  for(var k=0;k<D.length;k++) Q += " "+nc[j]+"_"+D[k]+a.slice(CD[i].length)+'="'+StringToXml(dk[k])+'"';
                  }
               }
            else if(i<C.length+4){ 
               var nc = NC[i-4];
               for(var j=0;j<nc.length;j++) Q += " "+nc[j]+a.slice(CD[i].length)+'="'+StringToXml(d[a])+'"';
               }
            else { 
               var nc = NC[C.length-1];
               for(var j=0;j<nc.length;j++) Q += " "+nc[j]+"_"+a+'="'+StringToXml(d[a])+'"';
               }
            
            break;
            }
         }
      }

   if(d.CalcOrder && d.CalcOrder.search(CR)>=0){
      var co = d.CalcOrder.split(","), cx = "";
      for(var l=0;l<co.length;l++){
         var a = co[l];
         if(a.search(CR)==0){
            for(var i=0;i<CD.length;i++) if(a.indexOf(CD[i])==0){
               if(i==0){ 
                  for(var k=C.length-2;k>=0;k--){
                     var nc = NC[k];
                     for(var j=0;j<nc.length;j++) cx += ","+nc[j]+a.slice(CD[i].length);
                     }
                  }
               else if(i==1){ 
                  var nc = NC[C.length-1];
                  for(var j=0;j<nc.length;j++) cx += ","+nc[j]+a.slice(CD[i].length);
                  }
               else if(i==2){ 
                  var nc = NC[C.length-1];
                  for(var j=0;j<nc.length;j++) for(var k=0;k<D.length;k++) cx += ","+nc[j]+"_"+D[k]+a.slice(CD[i].length);
                  }
               else if(i==3){ 
                  var nc = NC[C.length-1];
                  for(var j=0;j<nc.length;j++) {
                     for(var k=0;k<D.length;k++) cx += ","+nc[j]+"_"+D[k]+a.slice(CD[i].length);
                     cx += ","+nc[j]+a.slice(CD[i].length);
                     }
                  for(var k=C.length-2;k>=0;k--){
                     var nc = NC[k];
                     for(var j=0;j<nc.length;j++) cx += ","+nc[j]+a.slice(CD[i].length);
                     }
                  }
               else if(i<C.length+4){ 
                  var nc = NC[i-4];
                  for(var j=0;j<nc.length;j++) cx += ","+nc[j]+a.slice(CD[i].length);
                  }
               else { 
                  var nc = NC[C.length-1];
                  for(var j=0;j<nc.length;j++) cx += ","+nc[j]+"_"+a;
                  }
            
               break;
               }
            }
         else cx += ","+a;
         }
      if(cx) Q += " CalcOrder='"+StringToXml(cx.slice(1))+"'";
      }

   if(Q) s += "<D Name='"+n+"'"+Q+"/>";
   
   }
for(var i=0;i<R.length;i++) s += "<D Name='"+R[i]+"' Def='Pivot"+(i==R.length-1?"":"Group")+"Row' CDef='"+(i==R.length-1?"":R[i+1])+"' AcceptDef='"+(i==R.length-1?"":R[i+1])+"'/>";
s += "<D Name='PivotGroupRow'/><D Name='PivotRow'/>";
s += "</Def>\n\n";
s += "<Root CDef='"+R[0]+"' AcceptDef='"+R[0]+"'/>";
A[p++] = s; s = "";

var Func = [], T = this;
var FF = this.PivotFunc; FF = FF ? (FF+"").toLowerCase() : "sumjoin";
for(var i=0;i<D.length;i++) {
   Func[i] = this["PivotFunc"+D[i]];
   Func[i] = Func[i] ? (Func[i]+"").toLowerCase() : FF;
   }

var opf = Grids.OnPivotFunc ? 1 : 0, sumformat = this.PivotSumFormat;
function CalcRows(row,id){
for(var r=row.firstChild;r;r=r.nextSibling)  if((r.Visible||pf) && !r.Deleted) {
   var val = G.GetPivotValue(r,M), ss = "<I MainCol=\""+StringToXml(val)+"\" Def='"+R[r.Level]+"'";
   if(opf) id += '$'+val;
   if(r.Level==R.length-1){
      var X = {}, RR = [];
      for(var rr=r.firstChild;rr;rr=rr.nextSibling) if((rr.Visible||pf) && !rr.Deleted) {
         for(var i=0,n="";i<C.length;i++) n += "_"+G.PivotEscape(G.GetPivotValue(rr,C[i]));
         for(var i=0;i<D.length;i++) {
            var nn = "P"+n.slice(1)+"_"+D[i];
            if(X[nn]) X[nn][X[nn].length] = G.GetPivotValue(rr,D[i],1);
            else X[nn] = [i,G.GetPivotValue(rr,D[i],1)]; 
            if(opf) RR[RR.length] = rr;
            }
         }
      
      for(var n in X){
         var f = Func[X[n][0]], res = G.CalcPivotValue(X[n].slice(1),f,sumformat);
         if(opf) { var tmp = Grids.OnPivotFunc(T,id.slice(1),n,G,RR,X[n].slice(1),res); if(tmp!=null) res = tmp; }
         ss += " "+n+"='"+res+"'";
         if(T.PivotUpdate) ss += " "+n+"CanEdit='"+(res!=X[n][1]||X[n].length>2?0:1)+"'"; 
         }
      A[p++] = ss + "/>";
      }
   else {
      A[p++] = ss + " Expanded='"+(rexp>r.Level?1:0)+"'>";
      CalcRows(r);
      A[p++] = "</I>\n";
      }
   }
}
A[p++] = "<Body><B>";
CalcRows(G.XB.firstChild,"");
A[p++] = "</B></Body></Grid>";
this.Source.Data.Data = A.join("");

this.Source.Data.Url = null; 
this.Source.Data.Script = null; 
this.Source.PivotLoading = 1;
var Z = [this.PivotExpanded,this.PivotShowParent,this.PivotUpdate,this.PivotFunc,this.FastColumns];
this.Source.OnLoaded = function(){
   this.PivotRows = R.join(",");
   this.PivotCols = C.join(",");
   this.PivotData = D.join(",");
   this.PivotSource = O;
   this.PivotExpanded = Z[0]; this.PivotShowParent = Z[1]; this.PivotUpdate = Z[2]; this.PivotFunc = Z[3]; this.FastColumns = Z[4];
   var G = this.PivotGrid ? this.PivotGrid : Grids[this.PivotMaster];
   if(G) G.CalculateSpaces(1);
   }
if(func) this.Source.OnReady = func;
this.Loading = 0; this.Rendering = 0;

G.Ungroup();
G.GroupAutoId = 1;
G.Group = zg; G.MainCol = zm;
G.InGrouping = null; G.Paging = zp; G.Sorted = zsd; G.Sort = zs; G.Sorting = zss;
if(!this.PivotFilter) { G.Def.Group.CanFilter = zcg; G.StandardFilter = zsf; }
if(zg) G.GroupAll(G.Hidden,0);
else if(!G.Hidden && G.MainTable) G.GroupFinish(0);
Grids.HasPivotDetail = 1;
MS.Debug; this.Debug(4,"Pivot table XML created in ",this.StopTimer("Pivot")," ms"); ME.Debug;
if(Grids.OnPivotFinish && Grids.OnPivotFinish(this,G,R,C,D)) return false;
if(noswitch) this.SaveCfg(); 
else this.SwitchPivotGrid(3);
this.Reload();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.CalcPivotValue = function(A,f,sumformat){
var res;
if(f=="sumjoin" && A.join("").search(/[^0-9\.\-]/)>=0) f = "joinsum";
if(f=="sum" || f=="sumjoin") { for(var i=0,res=0;i<A.length;i++) if(A[i]-0) res += A[i]-0; if(sumformat) res = this.Lang.Format.NumberToString(res,sumformat); }
else if(f=="count") res = A.length;
else if(f=="join") res = A.join(this.Lang.Format.ValueSeparator);
else if(f=="joinsum") {
   var Z = [];
   A.sort();
   for(var i=0,cnt=0;i<A.length;i++) { 
      if(A[i]==A[i+1]) cnt++;
      else { Z[Z.length] = cnt ? (cnt+1)+"x "+A[i] : A[i]; cnt = 0; }
      }
   res = Z.join(this.Lang.Format.ValueSeparator+" ");
   }
return res;
}

// -----------------------------------------------------------------------------------------------------------
TGP.SetPivotValue = function(row,col,val){
if(this.PivotUpdate<1 || row.Fixed) return;
var G = this.PivotGrid, R = this.PivotRows.split(","), C = this.PivotCols.split(",");
var A = {};
for(var r=row,i=row.Level;r&&!r.Page;r=r.parentNode,i--) A[R[i]] = Get(r,"MainCol");

if(col=="MainCol"){
   var cc = R[row.Level];
   for(var r=G.GetFirst();r;r=G.GetNext(r)){
      var ok = 1;
      for(var c in A) {
         var v = G.GetPivotValue(r,c);
         if(v!=A[c]) { ok = 0; break; }
         }
      if(ok) G.SetString(r,cc,val,!G.Hidden,1);
      }
   return;   
   }

var cc = col.slice(1).split("_");
for(var i=0;i<C.length;i++) A[C[i]] = this.PivotUnescape(cc[i]);

for(var r=G.GetFirst();r;r=G.GetNext(r)){
   var ok = 1;
   for(var c in A) {
      var v = G.GetPivotValue(r,c);
      if(v!=A[c]) { ok = 0; break; }
      }
   if(ok){
      G.SetValue(r,cc[cc.length-1],val,!G.Hidden,1);
      G.SortRow(r,null,1);
      return;
      }
   }
var r = G.AddRow(null,null,!G.Hidden);
if(r){
   for(var c in A) G.SetValue(r,c,A[c],!G.Hidden,1);
   G.SetValue(r,cc[cc.length-1],val,!G.Hidden,1);
   G.SortRow(r,null,1);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetPivotDetailValue = function(row,col,val){
if(this.Source.PivotLoading || this.PivotUpdate<2 || row.Fixed) return;
var G = this.PivotGrid, R = this.PivotRows.split(","), C = this.PivotCols.split(","), D = this.PivotData.split(",");
if((","+R+","+C+","+D+",").indexOf(","+col+",")<0) return; 
for(var i=0,id="";i<R.length;i++) id += '$'+Get(row,R[i]);
var r = this.GetRowById(id.slice(1));
if(!r) { 
   for(var k=0;k<D.length;k++) if(col==D[k]?val:Get(row,D[k])) { this.ReloadPivot(); return; }
   return; 
   }

for(var i=0,B=[];i<C.length;i++) B[i] = this.PivotEscape(G.GetPivotValue(row,C[i])); 

for(var j=0;j<D.length;j++) if(D[j]==col) { 
   var X = [], A = {}, pf = this.PivotFilter == 2, RR = [];
   for(var i=0;i<R.length;i++) A[R[i]] = G.GetPivotValue(row,R[i],1);
   for(var i=0;i<C.length;i++) A[C[i]] = G.GetPivotValue(row,C[i],1);
   for(var rr=G.GetFirst();rr;rr=G.GetNext(rr)) if((rr.Visible||pf) && !rr.Deleted){
      var ok = 1;
      for(var c in A) {
         var v = rr[c]; if(v==null) v = rr.Def[c];
         if(v!=A[c]) { ok = 0; break; }
         }
      if(ok) { X[X.length] = rr==row ? val : Get(rr,col); if(Grids.OnPivotFunc) RR[RR.length] = rr; }
      }
   var f = this["PivotFunc"+col] ? this["PivotFunc"+col] : this.PivotFunc; f = f ? (f+"").toLowerCase() : "sumjoin";
   var c = "P"+B.join('_')+"_"+col, res = this.CalcPivotValue(X,f);
   if(Grids.OnPivotFunc) { var tmp = Grids.OnPivotFunc(this,r.id,c,G,RR,X,res); if(tmp!=null) res = tmp; }
   this.SetValue(r,c,res,1,1);
   return;   
   }

for(var i=0;i<C.length;i++) if(C[i]==col) {
   
      for(var k=0;k<D.length;k++) if(col==D[k]?val:Get(row,D[k])) { this.ReloadPivot(); return; }
      
   return;
   }

for(var i=0;i<R.length;i++) if(R[i]==col) { 
   for(var k=0;k<D.length;k++) if(col==D[k]?val:Get(row,D[k])) { this.ReloadPivot(); return; }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.DelPivotRow = function(row,del){
if(this.PivotUpdate<1) return;
var A = {};
var G = this.PivotGrid, R = this.PivotRows.split(","), C = this.PivotCols.split(",");
for(var r=row,i=row.Level;r&&!r.Page;r=r.parentNode,i--) A[R[i]] = Get(r,"MainCol");
for(var r=G.GetFirst();r;r=G.GetNext(r)){
   var ok = 1;
   for(var c in A) {
      var v = r[c]; if(v==null) v = r.Def[c];
      if(v!=A[c]) { ok = 0; break; }
      }
   if(ok && !r.Deleted!=!del) G.DeleteRowT(r,del?2:3);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.DelPivotDetailRow = function(row,del){
if(this.Source.PivotLoading || this.PivotUpdate<2) return;
var G = this.PivotGrid, D = this.PivotData.split(",");
for(var i=0;i<D.length;i++){
   this.SetPivotDetailValue(row,D[i],del?"":Get(row,D[i]));
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.AddPivotRow = function(row,src){
if(this.PivotUpdate<1) return;
var R = this.PivotRows.split(","), D = this.PivotData.split(",");
if(row.Level<R.length-1) return;
var reg = new RegExp("_("+D.join("|")+")$");
if(!src) src = row;
for(var c in this.Cols){
   if((c+"").search(reg)>0) {
      var val = Get(src,c);
      if(val) this.SetPivotValue(row,c,val);
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.MovePivotRow = function(row,oldpar){
if(this.PivotUpdate<1) return;
var G = this.PivotGrid, R = this.PivotRows.split(","), A = {};
for(var r=oldpar,i=r.Level;r&&!r.Page;r=r.parentNode,i--) A[R[i]] = r.MainCol;
A[R[row.Level]] = row.MainCol;
var id = [];
for(var r=row.parentNode,i=r.Level;r&&!r.Page;r=r.parentNode,i--) id[i] = r.MainCol;

for(var r=G.GetFirst();r;r=G.GetNext(r)){
   var ok = 1;
   for(var c in A) {
      var v = r[c]; if(v==null) v = r.Def[c];
      if(v!=A[c]) { ok = 0; break; }
      }
   if(ok) {
      for(var i=0;i<id.length;i++) G.SetValue(r,R[i],id[i],!G.Hidden,1);
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.ReloadPivot = function(){
if(this.PivotUpdate<3) return;
var T = this;
this.Source.PivotLoading = 1;
setTimeout(function(){ 
   if(T.PivotUpdate<=3 && !T.Confirm("PivotReload")) T.Source.PivotLoading = 0;
   else T.CreatePivot(null,1); 
   },10);
}
// -----------------------------------------------------------------------------------------------------------
MS.Calc;
// -----------------------------------------------------------------------------------------------------------
TCalc.prototype.aggc = function(col,hrow,cond,func){
var G = this.Grid, row = this.Row;
var ccn = "aggcExpC"+(hrow?hrow:"")+(col===""?"":(col?col:this.Col)), cc = G.Formulas[ccn];
if(!cc) {
   var hhr = hrow ? G.Rows[hrow] : null;
   if(col===""){
      if(!hhr){
         for(var r=G.XH.firstChild;r;r=r.nextSibling) if(r.Kind=="Header") { hhr = r; break; }
         if(!hhr) for(var r=G.XF.firstChild;r;r=r.nextSibling) if(r.Kind=="Header") { hhr = r; break; }
         if(!hhr) { G.Formulas[ccn] = []; return ""; }
         }
      var C = {}, cd = [];
      for(var c in G.Cols) if(hhr[c+"ExpandCols"]){
         cd[cd.length] = c;
         var ac = (hhr[c+"ExpandCols"]+"").split(",");   
         for(var i=0;i<ac.length;i++) C[ac[i]] = 1;
         }
      cc = [];
      for(var i=0;i<cd.length;i++) if(!C[cd[i]]) cc[cc.length] = cd[i];
      }
   else {
      if(!col) col = this.Col;
      if(!hhr){
         for(var r=G.XH.firstChild;r;r=r.nextSibling) if(r[col+"ExpandCols"]) { hhr = r; break; }
         if(!hhr) for(var r=G.XF.firstChild;r;r=r.nextSibling) if(r[col+"ExpandCols"]) { hhr = r; break; }
         }
      if(!hhr || !hhr[col+"ExpandCols"]) { G.Formulas[ccn] = []; return ""; }
      cc = (hhr[col+"ExpandCols"]+"").split(",");
      }
   G.Formulas[ccn] = cc;
   }
if(cond) {   
   var f = G.Formulas[cond];
   if(!f){
       f = G.ConvertFormula(cond);
      G.Formulas[cond] = f;
      }
   }   
else if(func==3) return 0;
this.Result = func==12 ? {} : CAggStart[func];
var ccl = cc.length;
for(var i=0;i<ccl;i++) {
   if(func==3){ this.Col = cc[i]; this.Result = f(this); } 
   else if(!f || (this.Col = cc[i], f(this))){
      if(func==2) this.Result++; 
      else {
         var a = row[cc[i]]; if(a==null && row.Def) a = row.Def[cc[i]];
         if(func==1) { a -= 0; if(a) this.Result += a; } 
         else if(func==4){ if(a!=="" && a>this.Result) this.Result = a-0; } 
         else if(func==5){ if(a!=="" && a<this.Result) this.Result = a-0; } 
         else if(func==6) { a = a*a; if(a) this.Result += a; } 
         else if(func==7) { a -= 0; if(a||a===0) this.Result *= a; } 
         else if(func==8){ if(a!==""&&a!=null) this.Result++; } 
         else if(func==9){ if(a===""||a==null) this.Result++; } 
         else if(func==10){ if(a!==""&&a!=null) this.Result += a + this.Grid.Lang.Format.ValueSeparator; } 
         else if(func==11) {   
           if(a) { 
               a -= 0; if(!a) return this.aggc(col,hrow,cond,12);
               if(this.Result) this.Result += a; 
               else this.Result = a;
               }
            } 
         else if(func==12){ if(a) this.aggjoin(a); }
         else if(func==13){
            if(this.Result) this.Result += this.Grid.Lang.Format.ValueSeparator + a; 
            else this.Result = a+"";
            }
         }
      }
   }
if(func==12){
   var A = [];
   for(var n in this.Result) A[A.length] = this.Result[n]>1 ? this.Result[n]+"x "+n : n;
   return A.join(this.Grid.Lang.Format.ValueSeparator+" ");
   }
return this.Result;
}
// -----------------------------------------------------------------------------------------------------------
TCalc.prototype.sumc = function(col,hrow,cond){ return this.aggc(col,hrow,cond,1); }
TCalc.prototype.countc = function(col,hrow,cond){ return this.aggc(col,hrow,cond,2); }
TCalc.prototype.calcc = function(col,hrow,cond){ return this.aggc(col,hrow,cond,3); }
TCalc.prototype.maxc = function(col,hrow,cond){ var max = this.aggc(col,hrow,cond,4); return isFinite(max)?max:""; }
TCalc.prototype.minc = function(col,hrow,cond){ var min = this.aggc(col,hrow,cond,5); return isFinite(min)?min:"" }
TCalc.prototype.sumsqc = function(col,hrow,cond){ return this.aggc(col,hrow,cond,6); }
TCalc.prototype.productc = function(col,hrow,cond){ return this.aggc(col,hrow,cond,7); }
TCalc.prototype.countac = function(col,hrow,cond){ return this.aggc(col,hrow,cond,8); }
TCalc.prototype.countblankc = function(col,hrow,cond){ return this.aggc(col,hrow,cond,9); }
TCalc.prototype.sumrangec = function(col,hrow,cond){ return this.aggc(col,hrow,cond,10); }
TCalc.prototype.sumjoinc = function(col,hrow,cond){ return this.aggc(col,hrow,cond,11); }
TCalc.prototype.joinsumc = function(col,hrow,cond){ return this.aggc(col,hrow,cond,12); }
TCalc.prototype.joinc = function(col,hrow,cond){ return this.aggc(col,hrow,cond,13); }
// -----------------------------------------------------------------------------------------------------------
ME.Calc;

// ----------------------------------------------------------------------------------------------------------
TGP.GetDefPivot = function(sep){
var G = this, P = this;
if(this.PivotGrid) G = this.PivotGrid;
else if(this.PivotDetail) for(var n in this.PivotDetail) { P = this.PivotDetail[n]; break; } 
else if(this.PivotMaster) G = Grids[this.PivotMaster];
else for(var i=0;i<Grids.length;i++) if(Grids[i]&&Grids[i].PivotMaster==this.id) P = Grids[i];
sep = sep.split(sep.charAt(0));
var A = [P.PivotRows,P.PivotCols,P.PivotData];
for(var i=0;i<A.length;i++) {
   if(A[i]){
      var C = A[i].split(sep[1]);
      for(var j=0;j<C.length;j++) C[j] = G.GetCaption(C[j]);
      A[i] = C.join(sep[3]);   
      }
   else return "";
   }
return A[0]+sep[4]+A[1]+sep[5]+A[2];
}
// ----------------------------------------------------------------------------------------------------------
TGP.SetDefPivot = function(Value,sep){
var G = this, P = this;
if(this.PivotGrid) G = this.PivotGrid;
else if(this.PivotDetail) for(var n in this.PivotDetail) { P = this.PivotDetail[n]; break; } 
else if(this.PivotMaster) G = Grids[this.PivotMaster];
else for(var i=0;i<Grids.length;i++) if(Grids[i]&&Grids[i].PivotMaster==this.id) P = Grids[i];
sep = sep.split(sep.charAt(0));
var N = {};
for(var n in G.Cols) N[G.GetCaption(n)] = n;
delete N[""];
var A = [];
A[0] = Value.slice(0,Value.indexOf(sep[4])); Value = Value.slice(A[0].length+sep[4].length);
A[1] = Value.slice(0,Value.indexOf(sep[5])); A[2] = Value.slice(A[1].length+sep[5].length);
for(var i=0;i<A.length;i++){
   var B = A[i].split(sep[3]);
   for(var k=0;k<B.length;k++) if(N[B[k]]) B[k] = N[B[k]];
   A[i] = B.join(sep[1]);
   }
P.PivotRows = A[0]; P.PivotCols = A[1]; P.PivotData = A[2]; P.CreatePivot();
}
// -----------------------------------------------------------------------------------------------------------
ME.Pivot;

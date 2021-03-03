// -----------------------------------------------------------------------------------------------------------
// Functions for generating HTML of printed parts
// -----------------------------------------------------------------------------------------------------------
MS.Print;
// -----------------------------------------------------------------------------------------------------------
TGP.PrintRowHTML = function(row,A){
//[A.length] = "<tr><td>"+row.id+"="+row.PrintCalcHeight+"</td></tr>"; return;

var zvis = row.Visible; row.Visible = 1;

var SS = this.GetSS(); this.GetRowHTML(row,SS,0);
MS.Nested;
if(row.DetailCol){
   var c = row.DetailCol;
   var zval = row[c], zt = row[c+"Type"], ztc = row[c+"TypeClass"];
   row[c+"TypeClass"] = this.GetType(row,c); row[c+"Type"] = "Html";
   var G = row.DetailGrid ? row.DetailGrid[0] : this.GetPrintNestedGrid(row);
   if(G){
      G.PrintPageWidth = 0; G.PrintPageHeight = 0; 
      G.PrintExpanded = this.PrintExpanded;
      row[c] = G.GetPrintable();
      SS = this.GetSS(); this.GetRowHTML(row,SS,0);
      }
   row[c] = zval; row[c+"Type"] = zt; row[c+"TypeClass"] = ztc;
   }
ME.Nested;
A[A.length] = this.GetRowTagHTML(row);
for(var i=this.FirstSec;i<=this.LastSec;i++) if(SS[i]) A[A.length] = SS[i].join("");
A[A.length] = "</tr>";
row.Visible = zvis;
}
// -----------------------------------------------------------------------------------------------------------
TGP.PrintWidthsHTML = function(row,A,td){
var SS = this.GetSS();
this.GetWidthsHTML(row,SS); 
if(td) {
   for(var i=this.FirstSec,cnt=0;i<=this.LastSec;i++) cnt += SS[i].Cnt;
   if(this.LeftTD) cnt -= this.LastSec-this.FirstSec; 
   else cnt--;
   A[A.length] = "<tr><td colspan='"+cnt+"'>";
   }
A[A.length] = this.GetWidthsTagHTML();
for(var i=this.FirstSec;i<=this.LastSec;i++) if(SS[i]) A[A.length] = SS[i].join("");
A[A.length] = "</tr>";
}
// -----------------------------------------------------------------------------------------------------------
TGP.PrintSpaceHTML = function(space,A,brk,width,wp){
for(var r=this.XS.firstChild,S=[];r;r=r.nextSibling) if(r.Space==space && r.Kind!="Fill"){ 
   var prn = r.DoPrint; if(prn==null) prn = r.CanPrint; if(prn==null && r.Def) prn = r.Def.CanPrint;
   if(prn>4) prn -= 4; 
   else if(wp!=1) continue;
   if(!prn || !r.Visible && prn<=2 || brk && prn!=2 && prn!=4) continue;
   S[S.length] = r;
   }
for(var k=0;k<S.length;k++) A[A.length] = this.GetPrintSpaceHTML(S[k],width,(k==0?1:0)+(k==S.length-1?2:0));
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetPrintHasSpace = function(brk,wp){
var S = [0,0,0,0,0]; S[-1] = 0;
for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Kind!="Fill"){ 
   var prn = r.DoPrint; if(prn==null) prn = r.CanPrint; if(prn==null && r.Def) prn = r.Def.CanPrint;
   if(prn>4) prn -= 4; 
   else if(wp!=1) continue;
   if(!prn || !r.Visible && prn<=2 || brk && prn!=2 && prn!=4) continue;
   S[r.Space]++;
   }
return S;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetPrintSpaceHTML = function(row,width,pos){
var cs, css, space = row.Space, prefix = " "+this.Img.Style;
if(pos==null) for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Space==space && r.Kind!="Fill"){ 
   if(r==row) { if(pos==null) pos = 3; else if(pos==0) pos = 2; continue; }
   var prn = r.DoPrint; if(prn==null) prn = r.CanPrint; if(prn==null && r.Def) prn = r.Def.CanPrint;
   if(prn>4) prn -= 4; 
   if(!prn || !r.Visible && prn<=2) continue;
   if(pos==null) pos = 0;
   else if(pos==null) pos = 0; 
   else if(pos==3) { pos = 1; break; }
   else if(pos==2) { pos = 0; break; }
   }

if(space==-1||space==5) {
   cs = prefix+"Row"+(space==-1?"Above":"Below")+(row.Kind=="Tabber2"?prefix+"TabSepNoBack":"");
   css = "";
   }
else {
   cs = prefix+"RowSpace"+prefix+"RowSpace"+space;
   if(pos&1) cs += prefix+"RowSpaceFirst";
   if(pos&2) cs += prefix+"RowSpaceLast";
   var css = prefix+row.Kind+"Row"+prefix+"SolidRow";
   if(row.Cells&&row.Cells[0]=="Panel") css += prefix+"SpaceRowPanel";
   }
var R = 0;
if(row.RelWidth){
   var W = width, O = [], P = [], OW = [];
   for(var i=0;i<row.Cells.length;i++){
      var c = row.Cells[i], rw = Get(row,c+"RelWidth");
      if(rw) {
         var m = Get(row,c+"MinWidth"); if(m) W -= m;
         P[P.length] = c; O[O.length] = rw; 
         R += rw;
         }
      }
   for(var i=0;i<P.length;i++) { OW[i] = row[P[i]+"Width"]; row[P[i]+"Width"] = 0; }
   }
var D = null;
if(this.Print || row.RelWidth){
   var D = document.createElement("div");
   D.style.visibility = "hidden";
   D.style.top = "0px";
   D.style.left = "0px";
   this.AppendTag(D);
   D.className = cs;
   D.innerHTML = "<div class='"+css+"'>"+this.GetSpaceHTML(row)+"</div>";
   }
if(this.Print){
   var s = GetStyle(D.firstChild), bw = GetBorderWidth(s);
   if(BIE) row.BorderIEWidth = bw;
   if(s){
      var mwl = parseInt(s.marginLeft), mwr = parseInt(s.marginRight);
      bw += (mwl?mwl:0)+(BSafari?(mwl?mwl:0):(mwr?mwr:0));
      }
   s = GetStyle(D); bw += GetBorderWidth(s);
   if(s){
      var mwl = parseInt(s.marginLeft), mwr = parseInt(s.marginRight);
      bw += (mwl?mwl:0)+(BSafari?(mwl?mwl:0):(mwr?mwr:0));
      }
   if(!bw) bw = 0;
   row._BorderWidth = bw;
   }
if(row.RelWidth){
   W -= D.firstChild.firstChild.offsetWidth + row._BorderWidth;
   if(P.length){
      for(var i=0;i<P.length;i++){
         var w = Get(row,P[i]+"MinWidth"); if(!w) w = 0;
         w += Math.floor(W * O[i] / R);
         row[P[i]+"Width"] = w;
         }
      }
   }
if(D) D.parentNode.removeChild(D);
var s;
if(space==-1||space==5) {
   s = "<div class='"+cs+"' align='"+(this.Rtl?"right":"left")+"' style='width:"+(width - row._BorderWidth+(BIE?row.BorderIEWidth:0) + this.Img.TableAllWidth)+"px;overflow:hidden;";
   if(row[row.Cells[row.Cells.length-1]+"Style"]=="TabSepLast") s += "border-right:none;";
   if(row[row.Cells[0]+"Style"]=="TabSepFirst") s += "border-left:none;";
   s += "'>" + this.GetSpaceHTML(row) + "</div>";
   //[A.length] = this.GetSpaceSecOutHTML(row,width - row._BorderWidth+(BIE?row.BorderIEWidth:0));
   }
else {
   s = "<tr><td class='"+cs+"'><div class='"+css+"' style='width:"+(width - row._BorderWidth+(BIE?row.BorderIEWidth:0))+"px;overflow:hidden;'>" + this.GetSpaceHTML(row) + "</td></tr>";
   }
if(R) for(var i=0;i<P.length;i++) row[P[i]+"Width"] = OW[i];
return s;
}
// -----------------------------------------------------------------------------------------------------------
MS.Corners;
TGP.PrintCornersHTML = function(cls,ww,width){
var s = "<div class='"+this.Img.Style+cls+"'>";
for(var i=0;i<10;i++) if(ww[i]!=null) s+="<div style='width:"+(width-ww[i]+this.Img.TableAllWidth)+"px;'class='"+this.Img.Style+cls+i+"'></div>";
return s + "</div>";
}
ME.Corners;
// -----------------------------------------------------------------------------------------------------------
TGP.PrintHeadHTML = function(A,brk,width,wp,hp,wc,hc){
//[A.length] = "<div style='height:2px;width:"+this.PrintPageWidth+"px;overflow:hidden;background:red;'></div>"; // @@@
//[A.length] = "<div style='width:2px;height:"+this.PrintPageHeight+"px;overflow:hidden;float:left;background:red;'></div>"; // @@@

//.LastPage = A.length;
var fit = this.PrintZoomFit&&!this.Print;
if(!fit&&!brk&&this.PrintPrefix) A[A.length] = this.PrintPrefix;
A[A.length] = "<div class='"+this.Img.Style+"PrintPage' style='"+(this.PrintPageWidth?"width:"+(this.PrintPageWidth-this.PrintPaddingWidth)+"px;":"")+(!this.Print&&this.PrintLocation!=4?"height:100%;overflow:hidden;":this.Rtl?"direction:rtl;":"")+(this.SpecPageBreak?"page-break-after:auto;":"")+"'>";
var pref = fit&&!brk&&this.PrintPrefix ? this.PrintPrefix : "";
if(this.PrintPagePrefix) {
   pref += this.PrintPagePrefix.replace("%1",wp).replace("%2",hp).replace("%3",(wp-1)*hc+hp).replace("%4",wc).replace("%5",hc).replace("%6",wc*hc).replace("%7",this.PrintPageWidth-this.PrintPaddingWidth).replace("%8",this.PrintPageHeight-this.PrintPaddingHeight-(hp==1&&this.PrintPaddingHeightFirst?this.PrintPaddingHeightFirst:0)).replace("%9",this.Img.Size);
   MS.Digits; if(this.Lang.Format.Digits) pref = this.Lang.Format.ConvertDigits(pref); ME.Digits;
   }
//[A.length] = "<div style='width:"+(this.PrintPageWidth-this.PrintPaddingWidth+100)+"px;border:1px solid red;height:20px;overflow:hidden'>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz"+CNBSP+"</div>";
A[A.length] = (fit?"":pref)+"<div style='visibility:visible;position:static;"+(this.Rtl&&this.Location!=4?"width:100%;":"")+"' class='GridMain "+this.Img.Size+"'><div class='GridMain1'><div class='GridMain2'>"+(fit&&pref?"<div style='font-size:16px;line-height:16px;'>"+pref+"</div>":"");
this.PrintSpaceHTML(-1,A,brk,width,wp);
MS.Corners; if(this.Img.Top) A[A.length] = this.PrintCornersHTML("Top",this.Img.Top,width); ME.Corners;
var S = this.GetPrintHasSpace(brk,wp), has = "";
for(var i=-1;i<=1;i++) if(S[i]) has += " "+this.Img.Style+"HasSpace"+(i==-1?"Above":i);
for(var r=this.XH.firstChild;r;r=r.nextSibling) if(this.CanPrint(r,brk)) { has += " "+this.Img.Style+"HasHead"+(r.Kind=="Header"?"er":""); break; }
A.MainPos = A.length;
A[A.length] = CTableCSP0+"class='"+this.Img.Style+"MainTable"+has+(this.WordWrap?" "+this.Img.Style+"WordWrap":"")+"'"+(this.Rtl?" style='text-align:right;'":"")+CTfoot;
this.PrintSpaceHTML(0,A,brk,width,wp);
for(var r=this.XH.firstChild,pc=0;r;r=r.nextSibling) if(this.CanPrint(r,brk)){
   if(!pc) { 
      var s = ""; 
      if(BIEA&&this.Gantt) { 
         var c = this.Colors["Default"] + 0x2FFBFEFF; 
         c = ((((c>>20)&1023)-512)<<16)+((((c>>10)&1023)-512)<<8)+(c&1023)-512;
         if(c) s = " style='background:#"+(c<0x10000?'00':c<0x100000?'0':'')+c.toString(16)+";'";
         }
      A[A.length] = "<tr><td style='overflow:hidden;'><div"+s+" class='"+this.Img.Style+"HeadMidPrint'>"; this.PrintWidthsHTML(this.XH,A); pc++; 
      }
   this.PrintRowHTML(r,A);
   }
if(pc) A[A.length] = CTableEnd+"</div></td></tr>";
this.PrintSpaceHTML(1,A,brk,width,wp);
if(!this.GetFirstVisible()) return;
A[A.length] = "<tr><td style='overflow:hidden;'><div"+(BIEA&&this.Gantt?" style='background:#FFFFFE;'":"")+" class='"+this.Img.Style+"BodyMidPrint'>"; 

this.PrintWidthsHTML(this.XB.firstChild,A); 
}
// -----------------------------------------------------------------------------------------------------------
TGP.PrintFootHTML = function(A,brk,width,wp,hp,wc,hc,spc){
var S = this.GetPrintHasSpace(brk,wp), has = "";
for(var i=2;i<=5;i++) if(S[i]) has += " "+this.Img.Style+"HasSpace"+(i==5?"Below":i);
for(var r=this.XF.firstChild;r;r=r.nextSibling) if(this.CanPrint(r,brk)) { has += " "+this.Img.Style+"HasFoot"+(r.Kind=="Header"?"er":""); break; }
if(has) A[A.MainPos] = A[A.MainPos].replace("MainTable","MainTable"+has);
this.PrintSpaceHTML(2,A,brk,width,wp);
for(var r=this.XF.firstChild,pc=0;r;r=r.nextSibling) if(this.CanPrint(r,brk)){
   if(!pc) { A[A.length] = "<tr><td style='overflow:hidden;'><div"+(BIEA&&this.Gantt?" style='background:#FFFFFE;'":"")+" class='"+this.Img.Style+"FootMidPrint'>"; this.PrintWidthsHTML(this.XF,A); pc++; }
   this.PrintRowHTML(r,A);
   }
if(pc) A[A.length] = CTableEnd+"</div></td></tr>";
this.PrintSpaceHTML(3,A,brk,width,wp);
this.PrintSpaceHTML(4,A,brk,width,wp);
A[A.length] = CTableEnd;
MS.Corners; if(this.Img.Bottom) A[A.length] = this.PrintCornersHTML("Bottom",this.Img.Bottom,width); ME.Corners;
this.PrintSpaceHTML(5,A,brk,width,wp);
var fit = this.PrintZoomFit&&!this.Print, po = "";
if(this.PrintPagePostfix) {
   po = this.PrintPagePostfix.replace("%0",spc).replace("%1",wp).replace("%2",hp).replace("%3",(wp-1)*hc+hp).replace("%4",wc).replace("%5",hc).replace("%6",wc*hc).replace("%7",this.PrintPageWidth-this.PrintPaddingWidth).replace("%8",this.PrintPageHeight-this.PrintPaddingHeight-(hp==hc?this.PrintPaddingHeightLast:0)).replace("%9",this.Img.Size); 
   MS.Digits; if(this.Lang.Format.Digits) po = this.Lang.Format.ConvertDigits(po); ME.Digits;
   }
 
if(fit&&!brk&&this.PrintPostfix) po += this.PrintPostfix;
A[A.length] = (fit&&po?"<div style='font-size:16px;line-height:16px;'>"+po+"</div>":"")+"</div></div></div>"+(fit?"":po);
A[A.length] = "</div>";
if(!fit&&!brk&&this.PrintPostfix) A[A.length] = this.PrintPostfix;
}
// -----------------------------------------------------------------------------------------------------------
TGP.PrintPageBreakHTML = function(A,cols,row){
if(this.CanPrintPage(cols)) {
   if(row && (!this.PrintSelected||!this.PrintSelectedRows)) for(var i=0;i<row.Level;i++) A[A.length] = CTableEnd + "</td></tr>"; 
   A[A.length] = CTableEnd+"</div></td></tr>"; 
   this.PrintFootHTML(A,1,cols.wb,cols.pos,cols.rpos,cols.length,cols.rcnt,cols.heights[cols.hp]-cols.hh); 
   }
cols.rpos++;
if(this.CanPrintPage(cols)) {
   //[A.LastPage] = A[A.LastPage].replace("page-break-after:auto","page-break-after:always");
   //[A.length] = "<div style='page-break-after:always;height:3px;border-bottom:1px solid red;overflow:hidden;'>"+CNBSP+"</div>";
   this.PrintHeadHTML(A,1,cols.wb,cols.pos,cols.rpos,cols.length,cols.rcnt);
   //[A.length] = "<tr><td><div class='"+this.Img.Style+"BodyMid'>"; // Zacne nove body
   
   if(row && (!this.PrintSelected||!this.PrintSelectedRows)){
      for(var r=row.parentNode,X=[];!r.Page;r=r.parentNode) X[X.length] = r;
      for(var i=X.length-1;i>=0;i--) this.PrintWidthsHTML(X[i],A,1); 
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
ME.Print;

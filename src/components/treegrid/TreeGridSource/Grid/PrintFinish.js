// -----------------------------------------------------------------------------------------------------------
// Functions for filling generated print report
// -----------------------------------------------------------------------------------------------------------
MS.Print;
// -----------------------------------------------------------------------------------------------------------
TGP.UpdatePageBreaks = function(B) {
for(var p=B.firstChild;p;p=p.nextSibling){
   if(p.nextSibling && (p.offsetHeight<this.PrintPageHeight*0.6||p.offsetHeight+p.nextSibling.offsetHeight<this.PrintPageHeight*1.2)) p.style.pageBreakAfter = "always"; 
   
   }
}
// -----------------------------------------------------------------------------------------------------------
// Prints the grid into new window
TGP.PrintFinish = function(V,A,w){
MS.Debug; this.Debug(4,"TreeGrid generated print report in ",this.StopTimer("Print")," ms"); ME.Debug;

if(Try) {
   var loc = this.PrintLocation, prn = this.PrintPrint, T = this;
   if(loc<=1){
      if(!w) w = loc==0 ? window.open("","TreeGridPrint",this["PrintWindowProp"],false) : window.open("","TreeGridPrint");
      if(!w){
         this.Alert("ErrPrintOpen");
         return;
         }
      var SS = "";
      if(this.PrintCSS) SS = '<link href='+this.PrintCSS+' type="text/css" rel="stylesheet"/>';
      else {
         var S = document.styleSheets;
         if(!S) S = document.getElementsByTagName("link");
         if(S) for(var i=0;i<S.length;i++) if(S[i].href) SS += '<link href='+S[i].href+' type="text/css" rel="stylesheet"/>';
         var all = this.PrintAllCSS;
         if(!all&&all!="0"){ for(var i=0;i<Grids.length;i++) if(Grids[i]&&Grids[i].NestedGrid&&Grids[i].Style!=this.Style){ all = 1; break; } } 
         if(all){
            var S = document.getElementsByTagName("style");
            if(S) for(var i=0;i<S.length;i++) if(S[i].innerHTML) SS += '<style>' + S[i].innerHTML + "</style>";
            }
         else for(var i=0;i<5;i++) if(this["SStr"+this.Img.Style+i]) SS += "<style type='text/css'>\n"+this["SStr"+this.Img.Style+i]+"\n</style>";
         }
      if(this.PrintAddCSS) SS += '<link href='+this.PrintAddCSS+' type="text/css" rel="stylesheet"/>';
      if(!BIEA) SS += "<style>html,body{overflow:visible!important;height:auto!important;}</style>"; 
      }
   var fit = "";
   
   if(this.PrintZoomFit&&!this.Print&&loc!=2){
      var ww = this.PrintFitWidth, hh = this.PrintFitHeight, styl = this.Img.Style, pt = 0.75, rh = BChrome ? 0.562 : 1, rw = BChrome ? 0.75 : 1; 
      
      var mw = 0, mh = 0; if(BMozilla||BSafari&&!BChrome) { mw = this.PrintMarginWidth*2.835; mh = this.PrintMarginHeight*2.835; } 
      if(this.PrintZoomFit==2){
         for(var i=1000;i>200;i-=10) fit += "@media only print and (max-width:"+Math.ceil((i+1)*ww/100*pt*rw+mw)+"pt), only print and (max-height:"+Math.ceil((i+1)*hh/100*pt*rh+mh)+"pt){ ."+styl+"BodyPrint>div>div { height:"+Math.ceil(i*hh/100)+"px; width:"+Math.ceil(i*ww/100)+"px; } ."+styl+"BodyPrint>div>div>div { transform:scale("+(i/100)+"); } "+(BMozilla?" ."+styl+"BodyPrint>div { width:"+Math.ceil(i*ww/100)+"px!important; }":"")+" } \n";
         for(var i=200;i>=100;i--) fit += "@media only print and (max-width:"+Math.ceil((i+1)*ww/100*pt*rw+mw)+"pt), only print and (max-height:"+Math.ceil((i+1)*hh/100*pt*rh+mh)+"pt){ ."+styl+"BodyPrint>div>div { height:"+Math.ceil(i*hh/100)+"px; width:"+Math.ceil(i*ww/100)+"px; } ."+styl+"BodyPrint>div>div>div { transform:scale("+(i/100)+"); } "+(BMozilla?" ."+styl+"BodyPrint>div { width:"+Math.ceil(i*ww/100)+"px!important; }":"")+" } \n";
         }
      for(var i=99;i>0;i--) fit += "@media only print and (max-width:"+Math.ceil((i+1)*ww/100*pt*rw+mw)+"pt), only print and (max-height:"+Math.ceil((i+1)*hh/100*pt*rh+mh)+"pt){ ."+styl+"BodyPrint>div>div { height:"+Math.ceil(i*hh/100)+"px; width:"+Math.ceil(i*ww/100)+"px; } ."+styl+"BodyPrint>div>div>div { transform:scale("+(i/100)+"); } "+(BMozilla?" ."+styl+"BodyPrint>div { width:"+Math.ceil(i*ww/100)+"px!important; }":"")+" } \n";
      fit += "@media only print { ."+styl+"BodyPrint { font-size:0px;line-height:0px; } ."+styl+"BodyPrint>div { zoom:1; overflow:hidden; "+(BMozilla?"":"width:auto!important;")+" } ."+styl+"BodyPrint>div>div { overflow:hidden;float:left!important;"+(BChrome?"writing-mode:vertical-"+(this.Rtl?"rl":"lr")+";":"")+" } ."+styl+"BodyPrint>div>div>div { "+(BChrome?"writing-mode:lr-tb;":"")+"transform-origin:"+(this.Rtl?"100% "+(BChrome?"100%":"0"):"0 0")+"; } }"; 
      fit = "<style>"+fit+"</style>";
      }
   
   for(var i=0;i<V.length;i++){
      if(Grids.OnPrint){ 
         var ret = Grids.OnPrint(this,w,V[i]);
         if(ret){
            if(typeof(ret)=="string") V[i] = ret;
            else if(ret) return;
            }
         }
      if(BIE8Strict&&!BIEA10) V[i] = V[i].replace(/margin\-bottom\:\-/g,"float:"+(T.Rtl?"right":"left")+";margin-bottom:-"); 
                  
      }
   
   if(w) {
      if(!BSafari || BSafariMac) w.document.write(this.GetText("Print")); 
      w.document.close();
      if(BIEM) focus();
      if(Grids.OnPrintClose) w.onunload = function(){ Grids.OnPrintClose(T,w); }
      this.ShowMessage(this.GetText("Printed"));
      function Print(){ 
         if(w.closed) return; 
         if(w.WaitPrint--) {
            (BIEA?window:w).setTimeout(Print,200); 
            return;
            }
         if(BChrome) w.document.body.style.display = ""; w.print(); w.close(); 
         }
      var Close = function(){
         try { 
            w.document.close();
            w.focus();
            if(T.SpecPageBreak) T.UpdatePageBreaks(w.document.body); 
            if(Grids.OnPrintClose) w.onunload = function(){ Grids.OnPrintClose(T,w); }
            w.document.body.onclick = function(){ w.onunload = null; if(Grids.OnPrintClose) Grids.OnPrintClose(T,w); w.close(); };
            
            if(Grids.OnPrintFinish && Grids.OnPrintFinish(T,w)) return;
            if(!w.closed) { 
               if(prn&4 && !PrintPreviewIE(w)) prn -= 4;
               if(prn==2) w.alert(T.GetAlert("PrintReady")+T.GetAlert("PrintCloseWindow")); 
               if(prn==1) { 
                  if(BChrome) w.document.body.style.display = "none";
                  if(BOpera) w.alert(T.GetAlert("PrintPrepared")); 
                  Print();
                  }
               }
            T.HideMessage();
            } 
         catch(e) { T.HideMessage(); }
         }
      function Write(){
         try { 
            if(Grids.OnPrintClose) w.onunload = null;
            if(BStrict) w.document.write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN">');

            if(prn==1) { w.WaitPrint = 15; w.onload = function(){ w.WaitPrint = 0; } }
            w.document.write("<html><head>"+(T.PrintHead?T.PrintHead:"")+SS+fit+"</head><body"+(T.Rtl?" dir='rtl'":"") + " class='"+T.Img.Style+"BodyPrint'" + ">");
            
            for(var i=0;i<V.length;i++) w.document.write(V[i]);
            
            w.document.write("</body></html>");
            if(BMozilla) setTimeout(Close,500); 
            else Close();
            }
         catch(e) { T.HideMessage(); }
         }
      if(BMozilla) Write();
      else (BIEA?window:w).setTimeout(Write,10);
      }

   else {
      var F = [], Q = [], Close;
      if(!BIEA){ var bs = document.body.style, owf = bs.overflow, bsh = bs.height; bs.overflow = "visible"; bs.height = "auto"; }   
      
      AreaObjects.Running = 1;
      var scr = this.GetScrollAll();
      if(loc==2){ 
         Close = function(){ 
            for(var i=0;i<A.length;i++){
               var M = A[i].MainTag;
               M.style.width = Q[i][0];
               M.style.height = Q[i][1];
               M.style.overflow = Q[i][2];
               M.onclick = Q[i][3];
               if(T.Rtl) M.dir = Q[i][4];
               M.innerHTML = "";
               M.appendChild(F[i]);
               A[i].Disabled = false;
               A[i].Rendering = false;
               if(!BIEA) { bs.overflow = owf; bs.height = bsh; }
               AreaObjects.Running = 0;
               }
            T.SetScrollAll(scr);
            if(Grids.OnPrintClose) Grids.OnPrintClose(T,window);
            }
         for(var i=0;i<A.length;i++){
            A[i].Disabled = true;
            A[i].Rendering = true;
            var M = A[i].MainTag;
            F[i] = M.firstChild;
            M.removeChild(F[i]);
            M.innerHTML = V[i];
            Q[i] = [M.style.width, M.style.height, M.style.overflow, M.onclick, M.dir];
            M.style.width = "auto"; M.style.height = "auto"; M.style.overflow = "visible"; M.onclick = Close; if(this.Rtl) M.dir = "rtl";
            if(this.SpecPageBreak) this.UpdatePageBreaks(M); 
            }
         }
      else if(loc==3){ 
         var ls = this.LimitScroll; this.LimitScroll = 0;
         Close = function(){ 
            M.innerHTML = "";
            M.className = MClass;
            M.onclick = Clk;
            MS.Touch;
            if(BTablet) { M.ontouchstart = TStart; M.ontouchend = TEnd; }
            else if(BTouch) { M.setAttribute("ontouchstart",TStart); M.setAttribute("ontouchend",TEnd); DetachEvent(M,"touchstart",sf); DetachEvent(M,"touchend",se); }
            ME.Touch;
            if(T.Rtl) M.dir = Dir;
            for(var i=0;i<F.length;i++) {
               M.appendChild(F[i]);
               if(BIE && F[i].tagName=="LINK" && F[i].rel == "stylesheet") F[i].rel = "Stylesheet"; 
               }
            if(SS) for(var i=SS.length-1;i>=0;i--) SS[i][1].insertBefore(SS[i][0],SS[i][2]);
            for(var i=0;i<A.length;i++) A[i].Disabled = false;
            if(!BIEA) { bs.overflow = owf; bs.height = bsh; }
            AreaObjects.Running = 0;
            T.SetScrollAll(scr);
            T.Update();
            GridsHeight(); 
            T.LimitScroll = ls;
            if(Grids.OnPrintClose) Grids.OnPrintClose(T,window);
            }
           
         for(var i=0;i<A.length;i++) A[i].Disabled = true;
         var SS = null; 
         if(this.PrintAllCSS) {
            var S = document.getElementsByTagName("style"), HH = document.getElementsByTagName("head")[0]; SS = [];
            if(S) for(var i=0;i<S.length;i++) if(S[i].parentNode!=HH) {
               SS[SS.length] = [S[i],S[i].parentNode,S[i].nextSibling];
               HH.appendChild(S[i]);
               }
            }
         var M = document.body;
         for(var f=M.firstChild;f;f=f.nextSibling) F[F.length] = f;
         for(var i=0;i<F.length;i++) M.removeChild(F[i]);

         M.innerHTML = fit+V.join("");
         if(this.SpecPageBreak) this.UpdatePageBreaks(M); 
         var MClass = M.className; M.className = this.Img.Style + "BodyPrint";
         var Clk = M.onclick; M.onclick = Close; 
         if(this.Rtl) { var Dir = M.dir; M.dir = "rtl"; }
         MS.Touch;
         if(BTouch){
            var TStart, TEnd, TE = [];
            var sf = function(ev){ TE = [ev.changedTouches[0].clientX,ev.changedTouches[0].clientY];  }; 
            var se = function(ev) { if(TE[0]==ev.changedTouches[0].clientX&&TE[1]==ev.changedTouches[0].clientY) Close(); };
            if(BTablet) { TStart = M.ontouchstart; TEnd = M.ontouchend; M.ontouchstart = sf; M.ontouchend = se; }
            else { TStart = M.getAttribute("ontouchstart"); TEnd = M.getAttribute("ontouchend"); M.setAttribute("ontouchstart",""); M.setAttribute("ontouchend",""); AttachEvent(M,"touchstart",sf); AttachEvent(M,"touchend",se); }
            }
         ME.Touch;
         }
      else { 
         Close = function(){ 
            
            DS.margin = Z[0];
            M.parentNode.removeChild(M);
            for(var i=0;i<A.length;i++) A[i].Disabled = false;
            if(!BIEA) { bs.overflow = owf; bs.height = bsh; }
            AreaObjects.Running = 0;
            if(Grids.OnPrintClose) Grids.OnPrintClose(T,window);
            }
         for(var i=0;i<A.length;i++) A[i].Disabled = true;
         var BS = document.body.style, DS = document.documentElement.style;
         
         var Z = [DS.margin];
         
         var M = document.createElement("div");
         M.innerHTML = fit+V.join("");
         
         M.className = this.Img.Style + "BodyPrint";
         M.onclick = Close; 
         MS.Touch;
         if(BTouch){
            var TE = [];
            var sf = function(ev){ TE = [ev.changedTouches[0].clientX,ev.changedTouches[0].clientY]; }; 
            var se = function(ev) { if(TE[0]==ev.changedTouches[0].clientX&&TE[1]==ev.changedTouches[0].clientY) Close(); };
            if(BTablet){ M.ontouchstart = sf; M.ontouchend = se; }
            else { AttachEvent(M,"touchstart",sf); AttachEvent(M,"touchend",se); }
            }
         ME.Touch;
         M.style.position = "absolute"; M.style.top = "0px"; if(this.Rtl) M.style.right = "0px"; else M.style.left = "0px";
         document.body.appendChild(M);
         
         DS.margin = "-100000px 0px 0px 0px";
         if(this.SpecPageBreak) this.UpdatePageBreaks(M); 
         }
      this.HideMessage(1);
      for(var i=0;i<Dialogs.length;i++) { var D = Dialogs[i]; if(D && D.Close) { D.NoAnim = 1; D.Close(); D.NoAnim = 0; } }
      if(Grids.OnPrintFinish && Grids.OnPrintFinish(this,window)) return;
      if(prn&4 && !PrintPreviewIE()) prn -= 4;
      if(prn==2) alert(this.GetAlert("PrintReady")+this.GetAlert("PrintCloseTag")); 
      if(prn==1) { 
         if(BOpera) alert(this.GetAlert("PrintPrepared")); 
         function Print(){
            if(loc==3||loc==4) T.HideMessage(1);
            print(); 
            if(BIPAD) setTimeout(Close,1000);
            else Close();
            }
         if(BChrome) setTimeout(Print,10); else Print(); 
         }
      }

   }
else if(Catch){ this.Alert("ErrPrint"); this.HideMessage(); }
}
// -----------------------------------------------------------------------------------------------------------
TGP.RenderPrint = function(){
MS.Paging; this.DownloadAllPagesSync(this.PrintExpanded,this.PrintFiltered); ME.Paging;
if(Grids.OnRenderStart) Grids.OnRenderStart(this);
if(!this.GetFirstVisible()){ var row = this.Rows["NoData"]; if(row && (row.Html||row.Cells)) { row.Visible = 1; row._BorderWidth = 0; } }
var M = this.MainTag, has = this.HasSelected(); this.PrintSelectedRows = has&5; this.PrintSelectedCols = has&6;

if(this.PDFFitPage){
   var dpi = this.PrintDPI;
   var ndpi = this.GetPrintFitDPI(this.PDFFitPage,null,this.PrintExpanded,this.PrintFiltered,this.PrintPageBreaks?this.PrintRows:0,this.PrintPageRoot,this.PrintSelected,this.PrintVisible,this.PrintPageWidth*96/dpi,this.PrintPageHeight*96/dpi,96,this.PrintOnlyData);

   if(this.PrintPageWidth) this.PrintPageWidth = Math[this.PDFFitPage&1?"ceil":"floor"](this.PrintPageWidth*ndpi/dpi);
   if(this.PrintPageHeight) this.PrintPageHeight = Math[this.PDFFitPage&2?"ceil":"floor"](this.PrintPageHeight*ndpi/dpi);
   
   var S = document.createElement("style"); S.type = "text/css";
   S.innerHTML = "."+this.Style+"PrintPage { transform:scale("+(96/ndpi)+")!important;"+(ndpi>96?"height:"+((96/ndpi)*100)+"%!important;":"")+" }";
   document.body.insertBefore(S,document.body.firstChild);
   }
var html = this.GetPrintable();
M.innerHTML = html;
if(this.SpecPageBreak) this.UpdatePageBreaks(M); 
var O = GetTextWidth.Tag; if(O) { for(var o in O) if(O[o]) O[o].parentNode.removeChild(O[o]); GetTextWidth.Tag = null; }
var O = this.RotWidthTag; if(O) { O.parentNode.removeChild(O); this.RotWidthTag = null; }
M.style.overflow = "visible"; M.style.height = ""; M.style.width = "";
if(document.body.className.indexOf("BodyPrintPDF")<0)  document.body.className += " "+this.Img.Style+"BodyPrintPDF";
this.HideMessage(); 
if(Grids.OnRenderFinish) Grids.OnRenderFinish(this);
if(!html && Grids.OnPrintEmpty) Grids.OnPrintEmpty(this);
}
// -----------------------------------------------------------------------------------------------------------
TGP.PrintAllGrids = function(ids){
var A = [];
if(ids){
   if(typeof(ids)=="string") ids = ids.split(",");
   if(!ids.length) return;
   for(var i=0;i<ids.length;i++) if(Grids[ids[i]] && !Grids[ids[i]].Cleared) A[A.length] = Grids[ids[i]];
   }
else {
   for(var i=0;i<Grids.length;i++) if(Grids[i] && !Grids[i].Cleared) A[A.length] = Grids[i];
   }
var T = this, pos = 0, V = [];
A[0].GetPrintable(run);
function run(val){ 
   if(val==null) return;
   V[pos++] = val;
   if(pos==A.length) T.PrintFinish(V,A);
   else A[pos].GetPrintable(run);
   }
}
// -----------------------------------------------------------------------------------------------------------
function PrintTreeGrid(D,tag,id,P,R){
if(!D) return;

if(typeof(D)=="string"){ 
   if(D.search(/^\s*\<(treegrid|bdo)/i)>=0) {  
      var X = CreateXmlFromString("<main>"+D+"</main>");
      if(!X || !X.firstChild || !X.firstChild.firstChild) return;
      D = ParseTreeGrid(X.firstChild.firstChild); 
      }
   else D = { Data:{ Data:D } };  
   }

D.Print = 1;
D.Sync = 1;
if(D.Page) D.Page.Sync = 1;
D.SuppressMessage = 3;
D.Debug = "";
if(!P) P = {};
var bon = "", dpi = P.Dpi ? P.Dpi : 96;
if(P.FitPage) bon += "<Cfg"+(P.Width?" PrintPageWidth='"+Math.round((P.Width-(P.MarginWidth?P.MarginWidth:0))*dpi/25.4)+"'":"")+(P.Height?" PrintPageHeight='"+Math.round((P.Height-(P.MarginHeight?P.MarginHeight:0))*dpi/25.4)+"'":"")+" PrintDPI='"+dpi+"' PDFFitPage='"+P.FitPage+"'/>";
else bon += "<Cfg PDFFitPage='0'/>";
if(P.MarginWidth!=null) bon += "<Cfg PrintMarginWidth='"+Math.round(P.MarginWidth*dpi/25.4)+"'/>";
if(P.MarginHeight!=null) bon += "<Cfg PrintMarginHeight='"+Math.round(P.MarginHeight*dpi/25.4)+"'/>";

if(P.Update!=null) bon += "<Cfg ChangesUpdate='"+(P.Update?P.Update:0)+"'/>";
if(bon){
   bon = "<Grid>"+bon+"</Grid>";
   if(!D.Data) D.Data = { Data : bon }; else if(!D.Data.Bonus) D.Data.Bonus = bon;
   else if(!D.Layout) D.Layout = { Data : bon }; else if(!D.Layout.Bonus) D.Layout.Bonus = bon;
   else if(!D.Base) D.Base = { Data : bon }; else if(!D.Base.Bonus) D.Base.Bonus = { Data : bon };
   }

var G = TreeGrid(D,tag,id,R);
if(!P) P = {};

var mh = (P.MarginHeight!=null?P.MarginHeight/2:10), mw = (P.MarginWidth!=null?P.MarginWidth/2:10);
document.body.style.margin = mh+"mm "+mw+"mm";

var S = document.createElement("style"); S.type = "text/css";

var s = "@page {"+(P.Width||P.Height?" size:"+P.Width+"mm "+P.Height+"mm;":"")+" margin:0; }";

s += " ."+G.Style+"PrintPage { margin-top:"+mh+"mm;margin-bottom:"+mh+"mm; }";

s += " ."+G.Style+"PrintPage:first-child { margin-top:0; }";
s += " ."+G.Style+"PrintPage:last-child { margin-bottom:0; }";

if(P.Dpi-0&&P.Dpi!=96) s += " ."+G.Style+"PrintPage { transform:scale("+(96/P.Dpi)+");transform-origin:0 0;"+(P.Dpi>96?(BStrict?"height:"+Math.floor((P.Height-mh)/P.Dpi*96)+"mm;":"height:"+((96/P.Dpi)*100)+"%;"):"")+" }"; 

S.innerHTML = s;
document.body.insertBefore(S,document.body.firstChild);
if(P.Header){
   var d = document.createElement("a"); 
   d.className = G.Style+"PrintHead";
   d.href = P.HeaderLink ? P.HeaderLink : "";
   d.style.marginLeft = (P.MarginWidth ? -P.MarginWidth/2 : -20) + "mm"; 
   
   if(P.HeaderBackground) d.style.background = P.HeaderBackground;
   d.innerHTML = P.Header;
   document.body.insertBefore(d,document.body.firstChild);
   }
if(P.Footer!==""){
   var d = document.createElement("a");
   d.className = G.Style+"PrintFoot";
   d.href = P.FooterLink ? P.FooterLink : "http://www.treegrid.com";
   d.style.marginLeft = (P.MarginWidth ? -P.MarginWidth/2 : -20) + "mm"; 
   
   if(P.FooterBackground) d.style.background = P.FooterBackground;
   if(P.Footer) d.innerHTML = P.Footer;
   document.body.insertBefore(d,document.body.firstChild);
   }

return G;
}
var TGPrintTreeGrid = PrintTreeGrid; if(window["PrintTreeGrid"]==null||TGDefNames["PrintTreeGrid"]) window["PrintTreeGrid"] = PrintTreeGrid;
// -----------------------------------------------------------------------------------------------------------
ME.Print;

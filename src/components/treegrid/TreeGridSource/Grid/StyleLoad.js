// -----------------------------------------------------------------------------------------------------------
TGP.SetStyle = function(name,file,gfile,gname,dfile,render,nosave,nosync,nomedia,func){
if(this.EditMode) return;
if(gfile-0||gfile=="0"||gfile!=null&&typeof(gfile)!="string") { render = gfile; gfile = null; } 
if(gname-0||gname=="0"||gname!=null&&typeof(gname)!="string") { render = gname; gname = null; } 
if(dfile-0||dfile=="0"||dfile!=null&&typeof(dfile)!="string") { render = dfile; dfile = null; } 
var always = name==null&&gname==null&&file==null&&gfile==null&&dfile==null;

if(!name){ name = this.Style; file = this.CSS; gfile = this.GanttCSS; gname = this.GanttStyle; dfile = this.DialogCSS; if(nosave!=3) nosave = 2; }
if(!gname) gname = name;
if(this.Reset&&this.Reset.Style) { name = this.Reset.Style; file = this.Reset.CSS; dfile = this.Reset.DialogCSS; }
if(this.Reset&&this.Reset.GanttStyle) { gname = this.Reset.GanttStyle; gfile = this.Reset.GanttCSS; }

MS.Sync; 
if((this.Sync && this.Sync["style"] || this.SyncStyle) && !nosync) { 
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G && G!=this && !G.Loading && (G.SyncId==this.SyncId && G.Sync && G.Sync["style"] || G.SyncStyle==this.SyncStyle&&this.SyncStyle)){
         if(nosave!=2) G.SetStyle(name,file,gfile?gfile:"",gname,dfile,render&&(!G.NestedGrid||G.MasterGrid!=this),nosave,1);
         else if(G.Img.Style) { 
            name = G.Img.Style; file = G.CSS; dfile = G.DialogCSS;
            if(this.Gantt&&G.Gantt) { gfile = G.GanttCSS; gname = G.Img.GanttStyle; } 
            this.Size = G.Size;
            break; 
            }
         }      
      }  
   if(nosave==2) for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G && G!=this && !G.Loading && (G.SyncId==this.SyncId && G.Sync && G.Sync["style"] || G.SyncStyle==this.SyncStyle&&this.SyncStyle) && !G.NestedGrid==!this.NestedGrid){ this.Scale = G.Scale; break; }
      }
   }
ME.Sync;
if(!this.GanttStyles) this.GanttStyles = this.Styles;
for(var i=0;i<2;i++){
   var S = i?this.GanttStyles:this.Styles; 
   
   if(!S) {
      MS.Debug; if(!i||this.Gantt) this.Debug(2,"No style list defined in Cfg ",i?"GanttStyles":"Styles",". Use Defaults.xml/js from 13.0+ version!"); ME.Debug; 
      S = "{}";
      }
   if(typeof(S)=="string"){
      S = FromJSON(S,1);
      var SS = {};
      for(var s in S){
         var X = S[s]; if(typeof(X)=="string") X = {Name:X,CSS:X};
         if(!X.CSS) X.CSS = X.Name;
         if(!X.CSS) { delete S[s]; continue; }
         if(!X.Name) X.Name = s;
         if(!X.Style) X.Style = s;
         SS[X.Name.toLowerCase()] = s;
         S[s] = X;
         }
      if(i){ this.GanttStyles = S; this.GanttStyleNames = SS; }
      else { this.Styles = S; this.StyleNames = SS; }
      }
   }
var nn = this.StyleNames[(name+"").toLowerCase()]; if(nn) name = nn;
if(!name) { MS.Debug; this.Debug(1,"Empty style prefix "); ME.Debug; return; }
if((BIE||BIEA&&!BIEA10||BSafariMac&&!BSafari7&&!BChrome&&!BIPAD) && this.Styles[name]&&!this.Styles[name].Compatible){
   for(var s in this.Styles) if(!this.Styles[s].Compatible) delete this.Styles[s];
   for(var s in this.Styles) if(this.Styles[s].Compatible==2) break;
   name = s;
   }
if(!file) { 
   file = this.Styles[name] ? this.Styles[name].CSS : null; 
   if(!file) { 
      nn = {'GS':'CF','GL':'CL','GO':'CO','GM':'CG','GB':'CB','GQ':'CQ','GE':'CE','GMA':'CS','GR':'CR','GP':'CP','GC':'CC','Modern':'CG'}[name];
      if(nn) { name = nn; file = this.Styles[name] ? this.Styles[name].CSS : null; }
      }
   if(!file) { MS.Debug; this.Debug(1,"Unknown style ",name); ME.Debug; return; } 
   }

if(!dfile){
   if(this.Styles[name]) {
      dfile = this.Styles[name].DialogCSS;
      if(!dfile && this.Styles[name].Compatible) dfile = "";
      }
   
   if(dfile==null) dfile = file.replace(/\bGrid\b/g,"Dialog").replace(/Grid\.css/g,"Dialog.css");
   }

this.CSS = file; if(file=="*") file = ""; else if(file.search(/\.css/i)<0) file = this.AddPath(file+"/Grid.css"); else if(file.indexOf("*")>=0) file = file.replace(/\*/,this.AddPath(""));
this.DialogCSS = dfile; if(dfile) { if(dfile=="*") dfile = ""; else if(dfile.search(/\.css/i)<0) dfile = this.AddPath(dfile+"/Dialog.css"); else if(dfile.indexOf("*")>=0) dfile = dfile.replace(/\*/,this.AddPath("")); }

if(Grids.OnSetStyle && Grids.OnSetStyle(this,name,file,gfile,gname)) return;
var I = this.Img;
if(I.OldStyle==name && I.OldCSS == file && (!this.Gantt||I.OldGanttCSS == gfile && I.OldGanttStyle == gname) && !always) return; 
I.Style = name; this.Style = name; I.OldStyle = name; I.OldCSS = file; I.Loaded = 0; I.DialogLoaded = 0;
 
if(this.MainTable) this.MainTable.style.visibility = "hidden";
 
var files = [dfile,file,gfile], names = [name,name,gname], M = GetElem("TreeGridMessageStyle"); 
for(var k=0;k<files.length;k++){
   var F = files[k]; if(!F || this.LoadedStyles[F]) continue;
   
   var P = this.GetUrl(F);
   if(Grids.LoadedCSS[P]) continue;
   Grids.LoadedCSS[P] = 1;
   if(P.indexOf('/')>=0) P = P.replace(/\/[^\/]*$/,"/"); 
   if(k==1) this.CSSPath = P; else if(k==2) this.GanttCSSPath = P; else this.DialogCSSPath = P;
   var doc = document.documentElement, L = doc.getElementsByTagName("link");
   for(var i=0,LL=[];i<L.length;i++) {
      if(L[i].rel.toLowerCase()=="stylesheet"){
         LL[i] = L[i].href; if(LL[i] && LL[i].indexOf(F)>=0) { M = L[i]; break; }
         }
      }
   if(i==L.length){ 
      if(BMozilla && navigator.userAgent.search(/Firefox\/19/)>=0){ 
         var T = document.createElement("div");
         T.style.left = "0px"; T.style.top = "0px"; T.style.visibility = "hidden";
         AppendTag(T);
         T.innerHTML = "<img src='"+P+"Backgrounds.gif' /><img src='"+P+"FastPanel1.gif' /><img src='"+P+"FastPanel1.gif' /><img src='"+P+"Button.gif' /><img src='"+P+"Tree.gif' />";
         T.parentNode.removeChild(T);
         }
      if(Grids.SafeCSS==null && this.SafeCSS==null){ 
         var D = document.createElement("div");
         D.style.position = "absolute";
         D.style.visibility = "hidden";
         D.style.left = "0px";
         D.style.top = "0px";
         D.className = "GridMeasure";
         D.innerHTML = "<table cellpadding='0' cellspacing='0'><tr><td><div><span><u><i><div style='padding:10px;height:30px;width:80px;overflow:hidden;'>"+CNBSP+"</div></i></u></span></div></td></tr>"
                     + "<tr><th><span><u><i><div style='height:50px;width:100px;overflow:hidden;'>"+CNBSP+"</div></i></u></span></th></tr></table>";
         if(!this.MainTag || this.MainTag.offsetWidth < 1) this.AppendTag(D);
         else this.MainTag.appendChild(D);
         var w = D.offsetWidth, h = D.offsetHeight; if(BIE) h += 20;
         D.innerHTML = "<div class='GridMeasure' style='width:100px;height:50px;'>"+CNBSP+"</div><div class='GridMeasure' style='width:100px;height:50px;'>"+CNBSP+"</div>";
         var ww = D.offsetWidth, hh = D.offsetHeight;
         Grids.SafeCSS = ww!=w || hh!=h ? 1 : 0;
         if(Grids.SafeCSS && BChrome && ww==w){ 
            D.innerHTML = "<table cellpadding='0' cellspacing='0'><tr><td><div><span><u><i><div style='height:100px;width:50px;overflow:hidden;'>"+CNBSP+"</div></i></u></span></div></td>"
                     + "<th><span><u><i><div style='height:100px;width:50px;overflow:hidden;'>"+CNBSP+"</div></i></u></span></th></tr></table>";
            Grids.SafeCSS = D.offsetHeight!=hh ? 1 : 0;
            }
         if(!Grids.SafeCSS){
            var s = 'font:11.9px/13px sans-serif;border:0px none;margin:0px;padding:0px;outline:none;box-sizing:content-box;resize:none;height:auto;';
            D.innerHTML = "<style>.GridTestInput1{"+s+"} .GridTestInput2{"+s.replace(/;/g,"!important;")+"}</style><div><input type='text' class='GridTestInput1' value='XXX'/></div><div><input type='text' class='GridTestInput2' value='XXX'/></div>";
            if(D.lastChild.previousSibling.offsetHeight!=D.lastChild.offsetHeight) Grids.SafeCSS = 2;
            }
         D.parentNode.removeChild(D);
         if(Grids.SafeCSS) { MS.Debug; this.Debug(2,"CSS switched to ","Safe mode",", because "+(Grids.SafeCSS==2?"TreeGrid <input> tag":"some TreeGrid tag (table,tr,td,th,div,span,i,u)")+" is affected by external CSS styles, you should remove this influence or set ","<Cfg SafeCSS='1'/>"); ME.Debug; }
         }
      if(Grids.SafeCSS == null) Grids.SafeCSS = this.SafeCSS?1:0; 
      var DN = [name,name,gname][k]+["Dialog","Grid","Gantt"][k]+"Data";
      if(Grids[DN] || (this.Source.Sync || Grids.SafeCSS) && location.protocol!="file:" && window.AjaxCall){
         var S = null, X = GetElem("TreeGridStyle"+names[k]+k);
         if(!X){ X = document.createElement("div"); X.id = "TreeGridStyle"+names[k]+k; X.style.display = "none"; }
         var D = { Grid:this, Name:"Style", Url:this.GetUrl(F) };
         if(Grids[DN]) this.CSSLoaded(X,F,name+k,names[k],0,Grids[DN]); 
         else {
            MS.Ajax;
            if(this.Source.Sync||!this.CSSLoaded.bind) this.CSSLoaded(X,F,name+k,names[k],0,AjaxCall(D)); 
            else AjaxCall(D,null,this.CSSLoaded.bind(this,X,F,name+k,names[k])); 
            ME.Ajax;
            }
         }
      else {   
         var X = document.createElement("link");
         X.href = this.GetUrl(F);
         if(LL.length){ 
            var hr = X.href.replace(/\??tgc=\d+\s*/,"");
            for(var i=0;i<LL.length;i++) if(LL[i] && LL[i].indexOf(hr)>=0) { M = L[i]; break; }
            if(i!=LL.length) continue;
            }
         if(!BIEA) X.rel = "Stylesheet"; 
         //.title = "GridStyle"; // Problemy v Mozille
         }
      var MM = Grids["LastStyle"+k]; if(MM) M = MM;
      if(M) { 
         if(M.nextSibling) M.parentNode.insertBefore(X,M.nextSibling); 
         else M.parentNode.appendChild(X); 
         }
      else {
         var H = doc.getElementsByTagName("head")[0];
         if(!H) {
            H = document.createElement("head");
            document.documentElement.insertBefore(H,document.body);
            }
         if(H.firstChild) H.insertBefore(X,H.firstChild); else H.appendChild(X);
         }
      Grids["LastStyle"+k] = X;
      M = X;
      this.LoadedStyles[F] = 1;
      if(BIEA && (!this.Source.Sync||location.protocol=="file:")) X.rel = "Stylesheet"; 
      }
   }
if(!this.GanttCSSPath) this.GanttCSSPath = this.CSSPath;
I.Custom = this.UsePrefix ? I.Style : "";

this.MeasureHTML();

if(BIEA||BEdge){
   var S = "", ss = I.Style, gs = I.GanttStyle;
   function rep(val,ss) { 
      return "<span class='"+ss+val.replace(/\s*,\s*/g,",").replace(/^\s+|\s+$/g,"").replace(/\s+div,/g,"'><div></div><span class='"+ss).replace(/(\w+)\s+(\w+),/g,"$1'><span class='"+ss+"$2'></span></span><span class='"+ss).replace(/\./g," "+ss).replace(/,/g,"'></span><span class='"+ss)+"'></span>"; 
      }
   if(!Grids["StyleSvg"+ss]){
      if(this.IESvg) S += rep(this.IESvg,ss);
      if(this.IESvgTool) S += rep(this.IESvgTool,ss+"Tool");
      if(this.IESvgCustom) S += rep(this.IESvg,"");
      Grids["StyleSvg"+ss] = 1;
      }
   if(this.Gantt && !Grids["GanttStyleSvg"+gs]){
      if(this.IESvgGanttArrow) {
         var A = this.IESvgGanttArrow.split(",");
         for(var j=0;j<A.length;j++) for(var i=0;i<40;i++) S += "<span class='"+gs+"GanttDepArrow"+i+A[j]+"'></span>";
         }
      if(this.IESvgGantt) S += rep(this.IESvgGantt,gs+"Gantt");
      if(this.IESvgFGantt) S += rep(this.IESvgFGantt,gs+"FGantt");
      if(this.IESvgGanttMilestone) S += rep(this.IESvgGanttMilestone.replace(/\*/g,"Milestone"),gs+"Gantt");
      
      Grids["GanttStyleSvg"+gs] = 1;
      }
   if(S){ 
      var N = document.createElement("div"), s = N.style;
      s.left = "0px"; s.top = "-1000px"; s.position = "absolute"; s.visibility = "hidden"; s.width = "0px"; s.height = "0px"; s.overflow = "hidden";
      this.AppendTag(N);
      N.innerHTML = S; 
      setTimeout(function(){ if(N.parentNode) N.parentNode.removeChild(N);},1000); 
      }
   }
if(!nosave) this.SaveCfg();
MS.Debug; this.Debug(4,"Style prefix set to ",name,", used CSS file ",file); ME.Debug;
Grids.LastStyle = name;
MS.Animate;
var A = this.Animations, O = this.AnimationsOrig; if(!O) { O = {}; this.AnimationsOrig = O; }
for(var a in A){
   if(O[a] || (A[a]+"").indexOf("#")>=0) {
      if(!O[a]) O[a] = A[a];
      A[a] = O[a].replace(/\#/g,I.Style);
      }
   }
ME.Animate;
if(Grids.OnAfterSetStyle) Grids.OnAfterSetStyle(this,name,file,gfile,gname);
if(render||always&&!this.Loading&&!this.Rendering&&!this.Disabled&&!this.Hidden&&this.BodyMain&&!this.Printing) {
   if(this.Source.Sync) this.AfterSetStyle(nomedia,func);
   else {
      this.Rendering = 2;
      this.ShowMessage(this.GetText(this.Gantt ? "GanttUpdate" : "SetStyle"));
      var T = this; setTimeout(function(){ T.Rendering = false; T.AfterSetStyle(nomedia,func); },10);
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.CSSLoaded = function(X,F,N,R,ret,S){
if(ret<0 || S==null || S<0) {
   MS.Debug; this.Debug(1,"Cannot load TreeGrid CSS style from ",F); ME.Debug; 
   return;
   }
var f = F.indexOf('/')>=0 ? F.replace(/\/[a-zA-z0-9_\?\&\%\=\+\$\.]*$/,"") : ""; 
if(BIEA && !BIE8Strict && top!=window && f.indexOf(location.protocol)!=0) { 
   if(f.indexOf('/')==0) f = location.href.slice(0,location.href.indexOf(location.pathname)) + f 
   else f = location.href.replace(/\/[^\/]*$/,"/") + f; 
   }
if(f) S = S.replace(/url\((['"]?)(?!data:)([^\)'"]*)(['"]?)\)/g,"url($1"+f+"/$2$3)"); 

if(Grids.SafeCSS) {
   MS.Debug; this.Debug(4,"CSS uses ","Safe mode"," (SafeCSS=1)"); ME.Debug;
   
   S = S.replace(new RegExp("GridMain[\\s\\,\\{]|"+R+"Main,Tiny,Mini,Small,Low,Normal,Wide,High,Big,Giant,IE,FF,WK,Touch,Rtl,Dep".replace(/,/g,"[\\s\\,\\{]|"+R),"g"),"GridMain1.GridMain2.$&").replace(new RegExp("([\\/\\,\\}]\\s*)(\\w*\\."+R+"\\w+)","g"),"$1.GridMain1.GridMain2 $2");
   S = S.replace(new RegExp("(\\.GridMain1\\.GridMain2\\s+\\.)"+R+"(BodyPrint|BodyPrintPDF|PrintPage|PrintHead|PrintFoot|ResizeBorder)","g"),"."+R+"$2"); 
   
   S += " .GridMain1.GridMain2 td,.GridMain1.GridMain2 th,.GridMain1.GridMain2 tr,.GridMain1.GridMain2 table,.GridMain1.GridMain2 tbody,.GridMain1.GridMain2 div,.GridMain1.GridMain2 span,.GridMain1.GridMain2 u,.GridMain1.GridMain2 i { "
      + "border:0px none;padding:0px;margin:0px;background:none;"
      + "position:static;visibility:visible;overflow:visible;float:none;clear:none;"
      + "vertical-align:top;max-height:none;min-height:0px;max-width:none;min-width:0px;"
      + "font:inherit;color:inherit;letter-spacing:inherit;line-height:inherit;"
      + "text-align:inherit;text-indent:inherit;text-transform:inherit;"
      + "white-space:inherit;word-spacing:inherit;text-decoration:inherit;"
      + "box-sizing:content-box;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;"
      + "box-shadow:none;opacity:1;outline:none;resize:none;border-radius:0px;-webkit-border-radius:0px;-moz-border-radius:0px;"
      + "}"
      + " .GridMain1.GridMain2 span,.GridMain1.GridMain2 u,.GridMain1.GridMain2 i {display:inline;}"
      + " .GridMain1.GridMain2 div {display:block;vertical-align:baseline;}"
      + " .GridMain1.GridMain2 table {border-spacing:0px;empty-cells:show;margin:0px;width:auto;height:auto;}"
      + " .GridMain1.GridMain2 input,.GridMain1.GridMain2 button,.GridMain1.GridMain2 textarea {"
      + "height:auto;min-height:0px;max-height:none;float:none;display:inline-block;padding:0px;position:static;"
      + "box-shadow:none;color:black;letter-spacing:normal;text-transform:none;border-radius:0;"
      + "}"
      + " .GridMain{"
      + "border:0px none!important;padding:0px!important;margin:0px!important;background:none!important;"
      + "display:block!important;float:none!important;overflow:visible!important;vertical-align:top!important;"
      + "position:static;visibility:visible;max-height:none!important;min-height:0px;min-width:0px;"
      
      + "letter-spacing:normal!important;cursor:auto!important;"
      + (this.ExternalAlign?"":"text-align:left!important;") 
      + "text-indent:0px!important;text-transform:none!important;"
      + "white-space:normal!important;word-spacing:normal!important;text-decoration:none!important;"
      + "}"
      + (BFF3&&!BFF20 ? "" : " .GridMain1.GridMain2 table { border-collapse:separate; }");
   }
X.innerHTML = "<br style='display:none;'/><style type='text/css'>\n"+S+"\n</style>";
this["SStr"+N] = S;
}
// -----------------------------------------------------------------------------------------------------------
TGP.AfterSetStyle = function(nomedia,func,cnt){
var I = this.Img;
if(!I.Loaded || !I.DialogLoaded || this.Gantt&&!I.GanttLoaded){
   if(!cnt) cnt = 1;
   else cnt++; 
   if(this.CacheTimeout*10<cnt){
        this.Alert("StyleErr");
      MS.Debug; this.Debug(0,"Cannot load CSS style from ",this.GetUrl(I.Loaded?(I.DialogLoaded?this.GanttCSS:this.DialogCSS):this.CSS)); ME.Debug;
      this.Clear(1);
      this.ShowStartErr(null,1);
      return;
      }
   this.ShowMessage(this.GetText("LoadStyles"));
   var T = this; setTimeout(function(){ T.MeasureHTML(); if(T.Gantt) T.MeasureGanttHTML(); T.AfterSetStyle(nomedia,func,cnt); },100);
   return;
   }
if(this.NoCalc==2) this.NoCalc = 0;
this.CalculateSpaces(); 
this.ClearCursors(); 
var min = I.CellBorderWidth;
for(var col in this.Cols){
   var C = this.Cols[col];
   if(C.AutoWidth && C.Type=="Panel") this.CalcWidth(col,1); 
   if(C.Width<min) C.Width = min;
   
   }
MS.Pager; for(var i=0;i<this.Pagers.length;i++) { this.Pagers[i].ItemHeight = null; this.Pagers[i].CursorScroll = null; } ME.Pager; 
MS.Message; var M = this.Message; if(M) { if(M.Center==2||!M.Parent) EnablePage(); this.Message = null; if(M.Tag) M.Tag.parentNode.removeChild(M.Tag); if(M.Shadow) M.Shadow.parentNode.removeChild(M.Shadow); if(M.Disabled) M.Disabled.parentNode.removeChild(M.Disabled); } ME.Message;

for(var r=this.XS.firstChild;r;r=r.nextSibling){ 
   r._BorderWidth = null;
   MS.Lang;
   if(r.Languages) { 
      if(r["LanguagesList"]){
         r["LanguagesList"] = this.GetLanguagesList();
         r["LanguagesClassFormula"] = "'"+this.Style+"ToolLang'+Grid.Language";
         this.CalculateSpaces(1); 
         }
      else if(r.Languages==1){
         var S = this.GetLanguages();
         for(var s in S) if(r["Languages"+s+"ButtonText"]) r["Languages"+s+"ButtonText"] = "<div class=\""+this.Img.Style+"ToolLanguagesSingle "+this.Img.Style+"ToolLang"+s+"\">"+CNBSP+"</div>";

         }
      }
   ME.Lang;
   
   }
var vars = 0;
if(!nomedia && this.ApplyMedia(1)) vars |= 64;

if(this.EditMode && this.EndEdit(1)==-1) this.EndEdit(0);
if(this.Paging==3) this.ConvertPageNames();
else if(this.Paging) this.SetPageNames();
if(this.ShowPrintPageBreaks>0&&this.CallUpdatePrintPageBreaks<2) this.CallUpdatePrintPageBreaks = 2;
this.NoClearLimitScroll = null;
this.Render();
if(func) func();
}
// -----------------------------------------------------------------------------------------------------------

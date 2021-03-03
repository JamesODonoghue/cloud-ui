// -----------------------------------------------------------------------------------------------------------
// Functions to display print menu
// -----------------------------------------------------------------------------------------------------------
MS.Print;
// -----------------------------------------------------------------------------------------------------------
// Prints the grid into new window
TGP.ActionPrint = function(dummy,T){
if(this.Locked["print"]) return false;
if(T) return !this.Printing;
MS.Debug; this.Debug(4,"Printing grid"); this.StartTimer("Print"); ME.Debug;
if(this.Printing || Grids.OnPrintStart && Grids.OnPrintStart(this)) return;
var has = this.HasSelected(); this.PrintSelectedRows = has&5; this.PrintSelectedCols = has&6;
T = this;
var cnt = 0, prefix = this.Img.Style, styl = this.Style, css = this.CSS;
function end(val,w){ if(val!=null) T.PrintFinish([val],[T],w); }
function start(Cols,test){
   if(test){
      if(!T.Img.Loaded||!T.Img.DialogLoaded||T.Gantt&&!T.Img.GanttLoaded){
         if(++cnt<T.CacheTimeout*10){ 
            if(cnt==1){
               if(!T.SuppressMessage) { var p = T.Img.Style; T.Img.Style = prefix; T.ShowMessage(T.GetText("LoadStyles")); T.Img.Style = p; }
               else T.Disable();
               }
            setTimeout(function(){ T.MeasureHTML(); if(T.Gantt) T.MeasureGanttHTML(); start(Cols,test);},100); 
            return; 
            }
         else T.SetStyle(styl,css); 
         }
      if(T.Message) T.HideMessage();
      else if(T.Disabled) T.Enable();
      }
   if(T.PrintGrids) T.PrintAllGrids(T.PrintGrids);
   else T.GetPrintable(end,Cols); 
   }
function finish(M){ 
   var Cols = M ? {} : null, Rows = M ? {} : null;
   if(M) for(var i=0;i<M.Items.length;i++){
      var I = M.Items[i];
      if(I.Cols) for(var j=0;j<I.Items.length;j++) { var II = I.Items[j]; if(II.Name&&T.Cols[II.Name]) { Cols[II.Name] = II.Value; T.Cols[II.Name].MenuCheck = II.Value; } }
      else if(I.Rows) for(var j=0;j<I.Items.length;j++) { var II = I.Items[j]; if(II.Row&&T.Rows[II.Row]) { Rows[II.Row] = II.Value; T.Rows[II.Row].MenuCheck = II.Value; } }
      }
   if(T.SaveAttrs&&T.SaveAttrs.indexOf("MenuCheck")>=0) T.SaveCfg();
   if(Grids.OnPrintInit) Grids.OnPrintInit(T,Cols,Rows);
   if(Rows) for(var id in Rows) T.SetDoPrint(T.Rows[id],Rows[id]);
   T.ApplyMedia(1,"print");
   if(T.PrintLocation==2) { M.Tag.style.display = "none"; if(M.HeaderTag) M.HeaderTag.style.display = "none"; if(M.ShadowTag) M.ShadowTag.style.display = "none"; if(M.ShadowHeaderTag) M.ShadowHeaderTag.style.display = "none"; MS.Message; if(M.Modal) EnablePage(); ME.Message; } 
   if(styl!=T.Style||css!=T.CSS){ T.SetStyle(null,null,null,null,null,0,1,1,1); start(Cols,1); }
   else start(Cols);
   
   }
if(!this.PrintCols&&!this.PDFFitPage || !this.ShowCfg) finish(); 
else this.ShowPrintMenu(finish);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetDoPrint = function(row,val){
var prn = row.CanPrint; if(prn==null && row.Def) prn = row.Def.CanPrint;
row.DoPrint = val ? (prn ? CDoPrint[prn] : 3) : 0;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ShowPrintMenu = function(finish,pdf){
var T = this, O = { "OptionsCaption":[],"Options":[],"SizeCaption":[],"Size":[] };
function go(M,cols,rows){ 
   var Q = O["Options"];
   if(Q.length){
      T.PDFName = Q[0].Value;
      var frm = Q[1].Items[Q[1].Value];
      if(frm) T.PDFFormat = frm.Text.toLowerCase();
      if(Q[2].Value!=="") T.PrintRows = Q[2].Value-0?Q[2].Value-0:100;
      T.PrintPageBreaks = Q[2].Value-0?1:0;
      T.PrintPageRoot = Q[3].Value?1:0;
      T.PDFText = Q[4].Value?1:0;
      T.PrintExpanded = Q[5].Value?1:0;
      T.PrintFiltered = Q[6].Value?1:0;
      T.PrintSelected = Q[7].Value?1:0;
      T.PrintOnlyData = Q[8].Value?1:0;
      T.PrintVisible = Q[9].Value?1:0;
      }
   var Q = O["Size"];
   if(Q.length){
      T.PrintPageSize = Q[0].Value-0;
      T.PrintPageOrientation = Q[1].Value-0;
      T.PrintMarginWidth = Q[2].Value*T.PrintMarginDiv;
      T.PrintMarginHeight = Q[3].Value*T.PrintMarginDiv;
      T.PDFFitPage = Q[4].Value-0;
      T.PrintDPI = Q[5].Value-0;
      if(Q[6].Value-0) T.PrintPageWidth = Q[6].Value-0;
      if(Q[7].Value-0) T.PrintPageHeight = Q[7].Value-0;
      }
   if(O["Options"].length||O["Size"].length) T.SaveCfg();
   finish(M,cols,rows);
   }
if(pdf?this.ExportPDFCols==2:this.PrintCols==2||this.PDFFitPage){
   var P = null, L = this.Lang["MenuPrint"], S = this.GetText("PrintPageSizes",L); 
   if(S) {
      S = S.split(',');
      P = [];
      for(var i=0;i<S.length;i+=3) P[P.length] = {Name:i/3,Text:S[i],W:S[i+1],H:S[i+2]};
      }
   var res = this.GetText("PrintResults",L);
   
   function RecalcResults(val){
      var FP = M.FindItem("PDFFitPage");
      if(!FP.Hidden&&FP.Value-0) CalcSize.apply(this,[val]);
      else {
         this.Value = val; 
         CalcResults(this.Owner); 
         }
      return val;
      }
   function CalcSize(val){
      var I = this, M = I.Owner; I.Value = val;
      var W = M.FindItem("PrintWidth"), H = M.FindItem("PrintHeight");
      var MW = M.FindItem("PrintMarginWidth"), MH = M.FindItem("PrintMarginHeight");
      var D = M.FindItem("PrintDPI"), dpi = D.Hidden ? T.PrintDPI : D.Value, ndpi = dpi; if(!dpi||dpi<=0) { dpi = 96; ndpi = dpi; if(I==D) val = dpi; }
      var size = M.FindItem("PrintPageSize"); size = size.Items[size.Value]; if(!size) size = {};
      var ori = M.FindItem("PrintPageOrientation").Value;
      var FP = M.FindItem("PDFFitPage");
      var nw = Math.round(((ori?size.H:size.W)-(MW.Hidden?T.PrintMarginWidth:MW.Value*T.PrintMarginDiv))*dpi/25.4);
      var nh = Math.round(((ori?size.W:size.H)-(MH.Hidden?T.PrintMarginHeight:MH.Value*T.PrintMarginDiv))*dpi/25.4);
      var fit = FP.Hidden ? T.PDFFitPage : FP.Value;
      if(fit&&(pdf||T.PrintZoomFit&&T.PrintLocation!=2)) {
         if(!pdf && T.PrintLoad && (T.Paging==3||T.ChildPaging==3) && (!T.PrintSelected||!T.PrintSelectedRows||T.PrintLoad>=2) && !T.DownloadAllPagesSync(T.PrintExpanded,T.PrintFiltered,1)) {
            fit = 0;
            if(!FP.Hidden) { ndpi = T.PrintDefaultDPI; setTimeout(function(){M.SetValue(FP,0);},10); }
            }
         if(fit){
            var V = M.FindItem("PrintVisible"), S = M.FindItem("PrintSelected"), PO = M.FindItem("PrintOnlyData"); 
            V = V.Hidden ? T.PrintVisible : V.Value; S = S.Hidden ? T.PrintSelected : S.Value; PO = PO.Hidden ? T.PrintOnlyData : PO.Value;
            var F = null, E = null, B = null, R = null;
            if(fit&2 && T.PrintPageHeight){
               F = M.FindItem("PrintFiltered"); E = M.FindItem("PrintExpanded"); B = M.FindItem("PrintRows"); R = M.FindItem("PrintPageRoot");
               F = F.Hidden ? T.PrintFiltered : F.Value; E = E.Hidden ? T.PrintExpanded : E.Value; R = R.Hidden ? T.PrintPageRoot : R.Value; 
               B = B.Hidden ? (T.PrintPageBreaks ? T.PrintRows : 0) : B.Value-0;
               }
            ndpi = T.GetPrintFitDPI(fit,GetCols(M),E,F,B,R,S,V,nw,nh,dpi,PO)
            }
         }
      else if(!FP.Hidden) {
         if(I==D) T.PrintDefaultDPI = ndpi;
         else ndpi = T.PrintDefaultDPI;
         }
      if(ndpi!=dpi||I==D) {
         M.SetValue(D,ndpi);
         nw = Math[fit&1?"ceil":"floor"](nw*ndpi/dpi);
         nh = Math[fit&2?"ceil":"floor"](nh*ndpi/dpi);
         }
      if(T.PrintPageWidth) { if(W.Hidden) W.Value = nw; else M.SetValue(W,nw); }
      if(T.PrintPageHeight) { if(H.Hidden) H.Value = nh; else M.SetValue(H,nh); }
      CalcResults(M);
      return val;
      }
   function CalcMargin(val){
      var I = this, M = I.Owner;
      I.Value = val;
      var dpi = M.FindItem("PrintDPI").Value, size = M.FindItem("PrintPageSize"); size = size.Items[size.Value];
      var ori = M.FindItem("PrintPageOrientation").Value;
      M.SetValue(M.FindItem("PrintMarginWidth"),Math.round((ori?size.H:size.W)-M.FindItem("PrintWidth").Value/dpi*25.4)/T.PrintMarginDiv);
      M.SetValue(M.FindItem("PrintMarginHeight"),Math.round((ori?size.W:size.H)-M.FindItem("PrintHeight").Value/dpi*25.4)/T.PrintMarginDiv);
      CalcResults(M);
      return val;
      }

   var T = this;

   function GetCols(M){
      for(var i=0,cols={};i<M.Items.length;i++){
         var I = M.Items[i];
         if(I.Cols) for(var j=0;j<I.Items.length;j++){ var col = I.Items[j].Name; if(T.Cols[col]) cols[col] = I.Items[j].Value; }
         else if(I.Rows) for(var j=0;j<I.Items.length;j++) if(I.Items[j].Row) T.SetDoPrint(T.Rows[I.Items[j].Row],I.Items[j].Value);
         }  
      return cols;
      }
   
   function CalcResults(M,run){
      if(!run){ 
         if(M.CalcResultsTimeout!=null) return;
         M.CalcResultsTimeout = setTimeout(function(){ M.CalcResultsTimeout = null; CalcResults(M,1); });
         }
      var X = M.FindItem("PrintResults");
      if(X.Hidden) return;
      var W = M.FindItem("PrintWidth"), H = M.FindItem("PrintHeight"), V = M.FindItem("PrintVisible"), S = M.FindItem("PrintSelected"), PO = M.FindItem("PrintOnlyData");
      V = V.Hidden ? T.PrintVisible : V.Value; S = S.Hidden ? T.PrintSelected : S.Value; PO = PO.Hidden ? T.PrintOnlyData : PO.Value;
      var cols = T.GetPrintCols(GetCols(M),T.PrintPageWidth?W.Value:0,T.PrintPageHeight?H.Value:0,1,V,S,PO);

      var F = M.FindItem("PrintFiltered"), E = M.FindItem("PrintExpanded"), B = M.FindItem("PrintRows"), R = M.FindItem("PrintPageRoot");
      F = F.Hidden ? T.PrintFiltered : F.Value; E = E.Hidden ? T.PrintExpanded : E.Value; R = R.Hidden ? T.PrintPageRoot : R.Value;
      B = B.Hidden ? (B.PrintPageBreaks ? B.PrintRows : 0) : B.Value-0;
      var cnt = T.PrintPageHeight ? T.CalcPrintRowCount(cols,E,F,B,R,S,PO) : "?";

      M.SetText(X,res.replace("%d",cols.err?"<span style='color:red;'>1</span>":cols.length).replace("%d",T.PrintLoad&&(T.Paging==3||T.ChildPaging==3)?cnt+"<span style='color:red;'>?</span>":cnt));
      }

   var F = this.GetCfgOptions("PDFFormats",L), f = this.PDFFormat, h = !pdf&&this.PrintCols==1, hid = h ? 1 : 0;
   for(var i=0;i<F.length;i++) if(F[i].Text.toLowerCase()==f) { f = F[i].Name; break; }
   O["OptionsCaption"] = [{Name:"OptionsCaption",Text:this.GetText("PrintOptions",L),Caption:1}];
   O["Options"] = [
      {Name:"PDFName",Text:this.GetText("PDFName",L),Edit:1,Value:this.PDFName?this.PDFName:this.id,Hidden:!pdf },
      {Name:"PDFFormat",Text:this.GetText("PDFFormat",L),Enum:1,Items:F,Value:f,Hidden:!pdf }, 
      {Name:"PrintRows",Text:this.GetText("PrintRows",L),Edit:1,Value:this.PrintPageBreaks?this.PrintRows:"",Type:"Int",Hidden:h,OnChanged:RecalcResults},
      {Name:"PrintPageRoot",Text:this.GetText("PrintPageRoot",L),Hidden:this.MainCol?0:1,Bool:1,Value:this.PrintPageRoot,NoAll:1,Hidden:h,OnChanged:RecalcResults},
      {Name:"PDFText",Text:this.GetText("PDFText",L),Enum:1,Items:this.GetCfgOptions("PDFTexts",L),Hidden:!pdf,Value:this.PDFText}, 
      {Name:"PrintExpanded",Text:this.GetText("PrintExpanded",L),Bool:1,Value:this.PrintExpanded,Hidden:!this.MainCol||h,NoAll:1,OnChanged:RecalcResults},
      {Name:"PrintFiltered",Text:this.GetText("PrintFiltered",L),Hidden:this.Paging==3||this.ChildPaging==3||!this.Filtering||!this.HasFilter()||h,Bool:1,Value:this.PrintFiltered,NoAll:1,OnChanged:RecalcResults},
      {Name:"PrintSelected",Text:this.GetText("PrintSelected"+(this.PrintSelectedRows?(this.PrintSelectedCols?"Cells":"Rows"):"Cols"),L),Hidden:!this.Selecting||!this.PrintSelectedRows&&!this.PrintSelectedCols||h,Bool:1,Value:this.PrintSelected,NoAll:1,OnChanged:RecalcResults},
      {Name:"PrintOnlyData",Text:this.GetText("PrintOnlyData",L),Bool:1,Value:this.PrintOnlyData,Hidden:!this.AutoPages&&!this.AutoColPages,NoAll:1,OnChanged:RecalcResults},
      {Name:"PrintVisible",Text:this.GetText("PrintVisible",L),Bool:1,Value:this.PrintVisible,Hidden:!this.Gantt||h,NoAll:1,OnChanged:RecalcResults}
      ];
   
   if(this.PrintPageWidth||this.PrintPageHeight||P) {
      O["SizeCaption"] = [{Name:"SizeCaption",Text:this.GetText(pdf?"PDFPageOptions":"PrintPageOptions",L),Caption:1}];
      O["Size"] = [
         {Name:"PrintPageSize",Text:this.GetText("PrintPageSize",L),Enum:1,Value:this.PrintPageSize,Items:P,Hidden:!P||h,OnChanged:CalcSize},
         {Name:"PrintPageOrientation",Text:this.GetText("PrintPageOrientation",L),Enum:1,Value:this.PrintPageOrientation,Items:this.GetCfgOptions("PrintPageOrientations",L),Hidden:!P||h,OnChanged:CalcSize},
         {Name:"PrintMarginWidth",Text:this.GetText("PrintMarginWidth",L),Edit:1,Type:"Float",Value:this.PrintMarginWidth/this.PrintMarginDiv,DisplayFormat:"0.##",EditFormat:"0.##",Hidden:hid||!this.PrintPageWidth,Size:4,OnChanged:CalcSize},
         {Name:"PrintMarginHeight",Text:this.GetText("PrintMarginHeight",L),Edit:1,Type:"Float",Value:this.PrintMarginHeight/this.PrintMarginDiv,DisplayFormat:"0.##",EditFormat:"0.##",Hidden:hid||!this.PrintPageHeight,Size:4,OnChanged:CalcSize},
         {Name:"PDFFitPage",Text:this.GetText("PDFFitPage",L),Enum:1,Items:this.GetCfgOptions("PDFFitPages",L),Hidden:!pdf&&(!this.PrintZoomFit||this.PrintLocation==2)||h,Value:this.PDFFitPage,OnChanged:CalcSize},
         {Name:"PrintDPI",Text:this.GetText("PrintDPI",L),Edit:1,Type:"Int",Value:this.PrintDPI,Hidden:hid||!this.PrintPageWidth&&!this.PrintPageHeight,Size:4,OnChanged:CalcSize},
         {Name:"PrintWidth",Text:this.GetText("PrintWidth",L),Edit:1,Type:"Int",Value:this.PrintPageWidth,Hidden:hid||!this.PrintPageWidth,Size:5,OnChanged:CalcMargin},
         {Name:"PrintHeight",Text:this.GetText("PrintHeight",L),Edit:1,Type:"Int",Value:this.PrintPageHeight,Hidden:hid||!this.PrintPageHeight,Size:5,OnChanged:CalcMargin},
         {Name:"PrintResults",Text:res,Hidden:hid||!this.PrintPageWidth&&!this.PrintPageHeight,Caption:2} 
         ];
      }

   for(var n in O) for(var i=0;i<O[n].length;i++) { var I = O[n][i]; if(!I.Text||this.MenuPrint[I.Name]==0) I.Hidden = 1; }
   }
var M = this.ShowCfg(this.MenuPrint,go,O,null,function(){ T.ClearPrintNestedGrids(); });
if(M){
   for(var i=0,calc=O&&O["Size"]&&res;i<M.Items.length;i++){
      var I = M.Items[i];
      if(I.Cols||I.Rows) for(var j=0;j<I.Items.length;j++) {
         var dp = I.Rows ? (I.Items[j].Row ? T.Rows[I.Items[j].Row].MenuCheck : null) : (I.Items[j].Col ? T.Cols[I.Items[j].Col].MenuCheck : null);
         if(dp!=null && !I.Items[j].Value!=!dp) M.SetValue(I.Items[j],dp?1:0);
         if(calc) I.Items[j].OnChanged = RecalcResults;
         }
      } 
   if(calc){
      var S = M.FindItem("PrintPageSize");
      if(S) CalcSize.apply(S,[S.Value]);
      }
   if(!pdf&&!this.PrintCols) { M.Close(); go(); }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetPrintFitDPI = function(fit,cols,E,F,B,R,S,V,nw,nh,dpi,PO){
if(!fit) return dpi;
var ndpi = 0; cols = this.GetPrintCols(cols,1e6,1e6,1,V,S,PO);
if(fit&1 && this.PrintPageWidth){ 
   for(var i=0,w=0;i<cols[0].length;i++) { 
      var C = this.Cols[cols[0][i]], cw = C.PrintWidth ? C.PrintWidth : C.Width; 
      
      w += cw;
      }
   w += cols.wf + this.Img.TableAllWidth + this.PrintPaddingWidth;
   ndpi = Math.ceil(w/nw*dpi);
   }
if(fit&2 && this.PrintPageHeight){
   this.CalcPrintRowCount(cols,E,F,B,R,S,PO);
   var h = cols.hh+1e6-cols.heights[3];
   var ph = this.PrintPaddingHeightFirst; if(ph){ h -= ph; nh -= ph; }
   var ph = this.PrintPaddingHeightLast; if(ph){ h -= ph; nh -= ph; }
   
   var ndpi2 = Math.ceil(h/nh*dpi);
   if(!(fit&1) || ndpi2>ndpi) ndpi = ndpi2;
   }
if(ndpi<this.PrintMinDPI) ndpi = this.PrintMinDPI;
return ndpi;
}
// -----------------------------------------------------------------------------------------------------------
ME.Print;

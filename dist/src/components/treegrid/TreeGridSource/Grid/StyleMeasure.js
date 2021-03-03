// ---------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------
TGP.SetStyleSize = function(){
var I = this.Img, prefix = I.Style;
if(!this.Size || !prefix) { I.Size = ""; return; }
I.Size = "GridMain "+prefix+"Main "+prefix+this.Size.split(",").join(" "+prefix)+" "+prefix+(BIEA||BEdge?"IE":(BMozilla?"FF":"WK"))+(BMouse?"":" "+prefix+"Touch")+(this.Rtl?" "+prefix+"Rtl":"")
if(this.Contrast) I.Size += " "+prefix+this.Contrast.split(",").join(" "+prefix);
if(I.GanttStyle&&I.GanttStyle!=I.Style) { 
   prefix = I.GanttStyle; 
   I.Size += " "+prefix+"Main "+prefix+this.Size.split(",").join(" "+prefix)+" "+prefix+(BIEA||BEdge?"IE":(BMozilla?"FF":"WK"))+(BMouse?"":" "+prefix+"Touch")+(this.Rtl?" "+prefix+"Rtl":"")+(this.Gantt&&this.StyleDependencyModifier?" "+prefix+"Dep":""); 
   if(this.Contrast) I.Size += " "+prefix+this.Contrast.split(",").join(" "+prefix);
   }
if(Grids.SafeCSS) I.Size += " GridMain1 GridMain2";
if(I.OldSize!=I.Size && this.MainTag && this.MainTag.firstChild) { this.MainTag.firstChild.className = I.Size; I.OldSize = I.Size; }
}
// ---------------------------------------------------------------------------------------------------------------------------
TGP.MeasureHTML = function(){
var I = this.Img, prefix = I.Style;
this.SetStyleSize();
MS.Sync;
if(Grids.length>1 && !this.ChangingLanguage){
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i]; 
      if(G && G!=this && !G.Loading && G.Img.Loaded && G.Img.DialogLoaded && G.Style==this.Style && (!G.Gantt&&!this.Gantt||G.Gantt&&this.Gantt&&G.GanttStyle==this.GanttStyle) && G.Size==this.Size && G.Contrast==this.Contrast && G.CSS==this.CSS && !G.Paging==!this.Paging && !G.Gantt==!this.Gantt && (!G.Gantt||G.Img.GanttLoaded&&G.GanttCSS==this.GanttCSS&&!G.FastGantt==!this.FastGantt&&!(G.Gantt&&G.StyleDependencyModifier)==!(this.Gantt&&this.StyleDependencyModifier)) && !G.ChangingLanguage){
         MS.Pager; if(!(G.Pagers.length||G.Pager.Type||G.Paging) != !(this.Pagers.length||this.Pager.Type||this.Paging)) continue; ME.Pager;
         var dw = G.Img.Width/(I.Width?I.Width:1); if(dw>0.99&&dw<1.01) dw = 1;
         if(dw!=1) { this.MultiplyScale(dw,11); I.WidthChange = dw; }
         var dw = G.Img.SpaceWidth/(I.SpaceWidth?I.SpaceWidth:1); if(dw>0.99&&dw<1.01) dw = 1;
         if(dw!=1) { this.MultiplyScale(dw,12); I.SpaceWidthChange = dw; }
         var Z = [I.GanttWidth,I.GanttWidthChange,I.WidthChange,I.SpaceWidthChange];
         for(var n in G.Img) I[n] = G.Img[n]; 
         I.GanttWidth = Z[0]; I.GanttWidthChange = Z[1]; I.WidthChange = Z[2]; I.SpaceWidthChange = Z[3];
         MS.Color; for(var n in G.Colors) this.Colors[n] = G.Colors[n]; ME.Color;
         
         this.MeasureFinish();
         return;
         }
      }
   }
ME.Sync;
var T = document.createElement("div");
if(BFF15) T.style.position = "absolute";
T.style.left = "0px";
T.style.top = "0px";
T.style.visibility = "hidden";
this.AppendTag(T);

T.innerHTML = "<div class='"+prefix+"Loaded'><div style='height:0px;overflow:hidden;display:none;'></div></div>";
I.Loaded = T.firstChild.offsetHeight;
if(!I.Loaded) { T.parentNode.removeChild(T); return; }
T.innerHTML = "<div class='"+prefix+"DialogLoaded'><div style='height:0px;overflow:hidden;display:none;'></div></div>";
I.DialogLoaded = T.firstChild.offsetHeight;
if(!I.DialogLoaded) { T.parentNode.removeChild(T); return; }

this.ZoomBorder = GetZoomBorderWidth(1,I.Size);
SetScrollConst(1,this.Img?this.Img.Size:"");
var rhx = "<tr><td class='"+prefix+"Cell "+prefix+"Text'>W8</td></tr>";
for(var i=0;i<3;i++) rhx += rhx; 

var A = {
   
   RowHeight : ["RowHeight","offsetHeight","overflow:hidden;","",1],
   RowHeightX : ["","offsetHeight","overflow:hidden;","",1,CTableCSP0+"class='"+prefix+"Section"+(BFF3&&!BFF20?"FF3":"")+"'"+CTfoot+rhx+CTableEnd],
   HeaderRowHeight : ["HeaderRowHeight","offsetHeight","overflow:hidden;","",1],
   FilterRowHeight : ["FilterRowHeight","offsetHeight","overflow:hidden;","",1],
   ColTreeRowHeight : ["ColTreeRowHeight","offsetHeight","overflow:hidden;","",1],
   SpaceRowHeight : ["SpaceRowHeight","offsetHeight","overflow:hidden;","",1],
   SpaceOutRowHeight : ["SpaceOutRowHeight","offsetHeight","overflow:hidden;","",1],
   SpaceMargin : ["SpaceMargin","offsetWidth","border:1px solid;"],
   WidthPad : ["WidthPad","offsetWidth","","",1],
   LineL : ["Width1","offsetWidth","","",1],
   TreeL : ["Width1T","offsetWidth","","",1],
   LineN : ["NWidth","offsetWidth","","",1],
   TreeN : ["NTreeImage","offsetWidth","","",1],
   
   Bool : ["BoolImage","offsetWidth","","",1],
   BoolSpace : ["BoolImageSpace","offsetWidth","","",1],
   Filter : ["Filter0","offsetWidth","","",1],
   Panel : ["PanelImage"+(BTablet ? " "+prefix+"PanelTouch":""),"offsetWidth","","",1],
   PanelPLeft : ["CellPanel","offsetWidth","border:0px solid;margin:0px;padding-right:0px;"],
   PanelPWidth : ["CellPanel","offsetWidth","border:0px solid;margin:0px;"],
   RowPanelPLeft : ["CellRowPanel","offsetWidth","border:0px solid;margin:0px;padding-right:0px;"],
   CellBorderLeft : ["CellBase","offsetWidth","border-right:0px solid;padding:0px;margin:0px;"],
   CellBorderRight : ["CellBase","offsetWidth","border-left:0px solid;padding:0px;margin:0px;"],
   CellBorderTop : ["CellBase","offsetHeight","border-bottom:0px solid;padding:0px;margin:0px;"],
   CellBorderBottom : ["CellBase","offsetHeight","border-top:0px solid;padding:0px;margin:0px;"],
   LastBorderRight : ["LastCell","offsetWidth","border-left:0px solid;padding:0px;margin:0px;"],
   LastBorderBottom : ["LastCell","offsetHeight","border-top:0px solid;padding:0px;margin:0px;"],
   LeftAllWidth : ["BodyLeft","offsetWidth",""],
   LeftAllLeft : ["BodyLeft","offsetWidth","border-right:0px solid;padding-right:0px;margin-right:0px;"],
   LeftMWidth : ["BodyLeft","offsetWidth","border-left:0px solid;border-right:0px solid;padding:0px;"],
   
   LeftBWidth : ["BodyLeft","offsetWidth","padding:0px;margin:0px;"], 
   MidAllWidth : ["BodyMid","offsetWidth",""],
   MidPrintAllWidth : ["BodyMidPrint","offsetWidth",""],
   MidAllLeft : ["BodyMid","offsetWidth","border-right:0px solid;padding-right:0px;margin-right:0px;"],
   MidBPWidth : ["BodyMid","offsetWidth","margin:0px;"],
   MidMWidth : ["BodyMid","offsetWidth","border-left:0px solid;border-right:0px solid;padding:0px;"],
   
   MidBWidth : ["BodyMid","offsetWidth","padding:0px;margin:0px;"], 
   RightAllWidth : ["BodyRight","offsetWidth",""],
   RightAllLeft : ["BodyRight","offsetWidth","border-right:0px solid;padding-right:0px;margin-right:0px;"],
   RightMWidth : ["BodyRight","offsetWidth","border-left:0px solid;border-right:0px solid;padding:0px;"],
   
   RightBWidth : ["BodyRight","offsetWidth","padding:0px;margin:0px;"], 
   BodyBPHeight : ["BodyMid","offsetHeight","margin:0px;"],
   HeadBPHeight : ["HeadMid","offsetHeight","margin:0px;"],
   FootBPHeight : ["FootMid","offsetHeight","margin:0px;"],
   HeadMHeight : ["HeadMid","offsetHeight","border:0px solid;border-left:1px solid black;padding:1px;","",0,"",2],
   BodyMHeight : ["BodyMid","offsetHeight","border:0px solid;border-left:1px solid black;padding:1px;","",0,"",2],
   FootMHeight : ["FootMid","offsetHeight","border:0px solid;border-left:1px solid black;padding:1px;","",0,"",2],
   HeadBPTop : ["HeadMid","offsetHeight","margin:0px;border-bottom:0px;padding-bottom:0px;"],
   BodyBPTop : ["BodyMid","offsetHeight","margin:0px;border-bottom:0px;padding-bottom:0px;"],
   BodyPTop : ["BodyMid","offsetHeight","margin:0px;border-bottom:0px;border-top:0px;padding-bottom:0px;"],
   BodyPBottom : ["BodyMid","offsetHeight","margin:0px;border-bottom:0px;border-top:0px;padding-top:0px;"],
   FootBPTop : ["FootMid","offsetHeight","margin:0px;border-bottom:0px;padding-bottom:0px;"],
   HeadMTop : ["HeadMid","offsetHeight","margin-bottom:0px;border:0px solid;border-left:1px solid black;padding:1px;","",0,"",2],
   BodyMTop : ["BodyMid","offsetHeight","margin-bottom:0px;border:0px solid;border-left:1px solid black;padding:1px;","",0,"",2],
   FootMTop : ["FootMid","offsetHeight","margin-bottom:0px;border:0px solid;border-left:1px solid black;padding:1px;","",0,"",2],
   LeftSplitter: ["LeftSplitter","offsetWidth","margin:0px;","",1],
   RightSplitter: ["RightSplitter","offsetWidth","margin:0px;","",1],
   PageBPTop : ["Page","offsetHeight","margin:0px;border-bottom:0px;padding-bottom:0px;"],
   PageFirstBPTop : ["PageFirst","offsetHeight","margin:0px;border-bottom:0px;padding-bottom:0px;"],
   PageOneBPTop : ["PageOne","offsetHeight","margin:0px;border-bottom:0px;padding-bottom:0px;"],
   PageBPHeight : ["Page","offsetHeight","margin:0px;"],
   PageFirstBPHeight : ["PageFirst","offsetHeight","margin:0px;"],
   PageOneBPHeight : ["PageOne","offsetHeight","margin:0px;"],
   TableAllWidth : ["MainTable","offsetWidth",BIEA&&!BIE8Strict?"padding:0px;":""],
   TableBPLeft : ["MainTable","offsetWidth","border-right:0px solid;padding-right:0px;margin:0px;"+(BIEA&&!BIE8Strict?"padding:0px;":"")],
   TableBLeft : ["MainTable","offsetWidth","border-right:0px solid;padding:0px;margin:0px;"],
   TableMLeft : ["MainTable","offsetWidth","border-right:0px solid;border-left:0px solid;padding:0px;margin-right:0px;"+(BIEA&&!BIE8Strict?"padding:0px;":"")],
   TableAllHeight : ["MainTable","offsetHeight",BIEA&&!BIE8Strict?"padding:0px;":""],
   TableBPTop : ["MainTable","offsetHeight","border-bottom:0px solid;padding-bottom:0px;margin:0px;"+(BIEA&&!BIE8Strict?"padding:0px;":"")],
   TablePTop : ["MainTable","offsetHeight","border:0px none;padding-bottom:0px;margin:0px;"+(BIEA&&!BIE8Strict?"padding:0px;":"")],
   TableMTop : ["MainTable","offsetHeight","border-top:0px solid;border-bottom:0px solid;padding:0px;margin-bottom:0px;"],
   ResizeGrid : ["ResizeGrid","offsetWidth","margin:0px;","",1],
   EmptyGap : ["","offsetWidth","overflow:hidden;","",1,CTableCSP0+CTfoot+"<td></td>"+CTableEnd],
   ScrollVAllWidth : ["VScroll","offsetWidth",""],
   ScrollVBPWidth : ["VScroll","offsetWidth","margin:0px;"],
   ScrollVMHeight : ["VScroll","offsetHeight","border:0px solid;border-left:1px solid black;padding:1px;","",0,"",2],
   ScrollVAllHeight : ["VScroll","offsetHeight",""],
   ScrollHLeftNoResizeAllWidth : ["HScrollLeft","offsetWidth",""],
   ScrollHLeftResizeAllWidth : ["HScrollLeftResize","offsetWidth",""],
   ScrollHMidNoResizeLeftWidth : ["HScrollMid","offsetWidth","border-right:0px none;margin-right:0px;padding-right:0px;"],
   ScrollHMidNoResizeRightWidth : ["HScrollMid","offsetWidth","border-left:0px none;margin-left:0px;padding-left:0px;"],
   ScrollHMidResizeLeftWidth : ["HScrollMidLeftResize","offsetWidth","border-right:0px none;margin-right:0px;padding-right:0px;"],
   ScrollHMidResizeRightWidth : ["HScrollMidRightResize","offsetWidth","border-left:0px none;margin-left:0px;padding-left:0px;"],
   ScrollHRightNoResizeAllWidth : ["HScrollRight","offsetWidth",""],
   ScrollHRightResizeAllWidth : ["HScrollRightResize","offsetWidth",""],
   ScrollHWideAllWidth : ["HScrollWide","offsetWidth",""],
   ScrollHLeftMWidth : ["HScrollLeft","offsetWidth","border-left:0px solid;border-right:0px solid;padding:0px;"],
   ScrollHMidMWidth : ["HScrollMid","offsetWidth","border-left:0px solid;border-right:0px solid;padding:0px;"],
   ScrollHRightMWidth : ["HScrollRight","offsetWidth","border-left:0px solid;border-right:0px solid;padding:0px;"],
   ScrollHWideMWidth : ["HScrollWide","offsetWidth","border-left:0px solid;border-right:0px solid;padding:0px;"],
   ScrollHAllHeight : ["HScrollMid","offsetHeight",""],
   "CSH1" : ["CustScroll1RightHidden","offsetHeight","overflow:hidden;background:none;","",1],
   "CSH2" : ["CustScroll2RightHidden","offsetHeight","overflow:hidden;background:none;","",1],
   "CSH3" : ["CustScroll3RightHidden","offsetHeight","overflow:hidden;background:none;","",1],
   "CSH4" : ["CustScroll4RightHidden","offsetHeight","overflow:hidden;background:none;","",1],
   "CSW1" : ["CustScroll1DownHidden","offsetWidth","overflow:hidden;background:none;","",1],
   "CSW2" : ["CustScroll2DownHidden","offsetWidth","overflow:hidden;background:none;","",1],
   "CSW3" : ["CustScroll3DownHidden","offsetWidth","overflow:hidden;background:none;","",1],
   "CSW4" : ["CustScroll4DownHidden","offsetWidth","overflow:hidden;background:none;","",1],
   PagesHeight : ["PagesLink","offsetHeight","display:block;","",1,"XXX"],
   HeaderGroup : ["HeaderGroup","offsetWidth","margin:0px;"],
   DropCols : ["DropCols","offsetWidth",""],
   DropColsSpace : ["DropCols","offsetWidth","","",1,CTableCSP0+CTfoot+"<tr><td></td></tr>"+CTableEnd],
   SideLeft : ["SideLeft","offsetWidth",""],
   SideRight : ["SideRight","offsetWidth",""],
   "DefaultsLeft" : ["DefaultsLeft","offsetWidth",""],
   "DefaultsRight" : ["DefaultsRight","offsetWidth",""],
   "DefaultsSpaceLeft" : ["DefaultsSpaceLeft","offsetWidth",""],
   "DefaultsSpaceRight" : ["DefaultsSpaceRight","offsetWidth",""],
   "DateLeft" : ["DateLeft","offsetWidth",""],
   "DateRight" : ["DateRight","offsetWidth",""],
   "DatesLeft" : ["DatesLeft","offsetWidth",""],
   "DatesRight" : ["DatesRight","offsetWidth",""],
   "CheckLeft" : ["Check0Left","offsetWidth",""],
   "CheckRight" : ["Check0Right","offsetWidth",""],
   "ExpandLeft" : ["ExpandLeft","offsetWidth",""],
   "ExpandRight" : ["ExpandRight","offsetWidth",""],
   "FileLeft" : ["FileLeft","offsetWidth",""],
   "FileRight" : ["FileRight","offsetWidth",""],
   "ClearLeft" : ["ClearLeft","offsetWidth",""],
   "ClearRight" : ["ClearRight","offsetWidth",""],
   "FilterLeft" : ["Filter0Left","offsetWidth",""],
   "FilterRight" : ["Filter0Right","offsetWidth",""],
   "SortLeft" : ["Sort0Left","offsetWidth",""],
   "SortRight" : ["Sort0Right","offsetWidth",""],
   "EnumLeft" : ["EnumLeft","offsetWidth",""],
   "EnumRight" : ["EnumRight","offsetWidth",""],
   "IconLeft" : ["IconLeft","offsetWidth",""],
   "IconRight" : ["IconRight","offsetWidth",""],
   IconRotate : ["IconRotate","offsetHeight",""],
   IconRotateHeader : ["IconRotateHeader","offsetHeight",""],
   ButtonClose : ["ButtonClose","offsetWidth","margin:0px;padding-left:0px;border:none;"],
   "FocusRowBPLeft" : ["FocusRow","offsetWidth","margin:0px;padding-right:0px;border-right:none;"],
   
   "FocusRowBPTop" : ["FocusRow","offsetHeight","margin:0px;padding-bottom:0px;border-bottom:none;"],
   "FocusRowBPBottom" : ["FocusRow","offsetHeight","margin:0px;padding-top:0px;border-top:none;"],
   "HoverRowBPLeft" : ["HoverRow","offsetWidth","margin:0px;padding-right:0px;border-right:none;"],
   
   "HoverRowBPTop" : ["HoverRow","offsetHeight","margin:0px;padding-bottom:0px;border-bottom:none;"],
   "HoverRowBPBottom" : ["HoverRow","offsetHeight","margin:0px;padding-top:0px;border-top:none;"],
   
   EditBPWidth : ["EditCellInput","offsetWidth","margin:0px;"],
   EditBPHeight : ["EditCellInput","offsetHeight","margin:0px;"],
   EditBPLeft : ["EditCellInput","offsetWidth","border-right:0px solid;padding-right:0px;margin:0px;"],
   EditBPTop : ["EditCellInput","offsetHeight","border-bottom:0px solid;padding-bottom:0px;margin:0px;"],
   EnumHeaderBPWidth : ["MenuHeader "+prefix+"EnumMenuHeader","offsetWidth","margin:0px;position:static;"],
   EnumHeaderBPHeight : ["MenuHeader "+prefix+"EnumMenuHeader","offsetHeight","margin:0px;position:static;"],
   EnumHeaderBPLeft : ["MenuHeader "+prefix+"EnumMenuHeader","offsetWidth","border-right:0px solid;padding-right:0px;margin:0px;position:static;"],
   EnumHeaderBPTop : ["MenuHeader "+prefix+"EnumMenuHeader","offsetHeight","border-bottom:0px solid;padding-bottom:0px;margin:0px;position:static;"],
   FilterInnerMBPWidth : ["FilterInner","offsetWidth",""],
   
   EditInputBPWidth : ["EditInput","offsetWidth","margin:0px;"],
   EditInputBPHeight : ["EditInput","offsetHeight","margin:0px;"],
   EditInputBPLeft : ["EditInput","offsetWidth","border-right:0px solid;padding-right:0px;margin:0px;"],
   EditInputBPTop : ["EditInput","offsetHeight","border-bottom:0px solid;padding-bottom:0px;margin:0px;"],
   EditInputSpaceBPWidth : ["EditSpaceInput "+prefix+"EditInput","offsetWidth","margin:0px;"],
   EditInputSpaceBPHeight : ["EditSpaceInput "+prefix+"EditInput","offsetHeight","margin:0px;"],
   EditInputSpaceBPLeft : ["EditSpaceInput "+prefix+"EditInput","offsetWidth","border-right:0px solid;padding-right:0px;margin:0px;"],
   EditInputSpaceBPTop : ["EditSpaceInput "+prefix+"EditInput","offsetHeight","border-bottom:0px solid;padding-bottom:0px;margin:0px;"],

   Loaded : ["Loaded","offsetHeight",""]
   }  



MS.Pager;
if(this.Pagers.length || this.Pager.Type || this.Paging){
   A.PagerMWidth = ["PagerMain","offsetWidth","border-left:0px solid;border-right:0px solid;padding:0px;"];
   A.PagerAllWidth = ["PagerMain","offsetWidth",""];
   A.PagerAllLeft = ["PagerMain","offsetWidth","margin-right:0px;padding-right:0px;border-right:0px solid;"];
   A.PagerAllHeight = ["PagerMain","offsetHeight",""];
   A.PagerBPHeight = ["PagerMain","offsetHeight","margin:0px;"];
   A.PagerBPTop = ["PagerMain","offsetHeight","margin:0px;padding-bottom:0px;border-bottom:0px solid;"];
   A.PagerHeaderBPHeight = ["PagerHeader","offsetHeight","margin:0px;"];
   A.PagerHeaderBBottom = ["PagerHeader","offsetHeight","margin:0px;padding:0px;border-top:0px solid"];
   A.PagerCaptionMBPHeight = ["PagerCaption","offsetHeight"];
   A.PagerBodyAllWidth = ["PagerBody "+prefix+"PagerBodyRight","offsetWidth",""];
   A.PagerBodyAllHeight = ["PagerBody","offsetHeight",""];
   A.PagerBodyBPHeight = ["PagerBody","offsetHeight","margin:0px;"];
   A.PagerItemMTop = ["PagerItem","offsetHeight","margin-bottom:0px;border:0px solid;border-left:1px solid black;padding:1px;","",0,"",2];
   A.PagerItemHeight = ["PagerItem"+(BTablet?" "+prefix+"PagerItemTouch":""),"offsetHeight","margin:0px;","",0,"XXX"];
   A.PagerFocusBPHeight = ["PagerFocus","offsetHeight","margin:0px;"];
   A.PagerFocusBPWidth = ["PagerFocus","offsetWidth","margin:0px;"];
   A.PagerHoverBPHeight = ["PagerHover","offsetHeight","margin:0px;"];
   A.PagerHoverBPWidth = ["PagerHover","offsetWidth","margin:0px;"];
   }
ME.Pager;



var ss = [], p = 0;
for(var n in A){
   var s = "<div style='position:absolute;left:0px;top:0px;'>";
   s += "<"+(A[n][3]?A[n][3]:"div")+" class='"+prefix+A[n][0]+"'"
   s += " style='"+A[n][2]+(A[n][1].indexOf('Width')>=0?"border-top:1px solid;border-bottom:1px solid;":"")+(A[n][4]?"":"width:auto;height:auto;overflow:visible")+";'>";
   s += A[n][5] ? A[n][5] : "<div style='height:0px;width:0px;overflow:hidden;display:none;'></div>";
   s += "</"+(A[n][3]?A[n][3]:"div")+"></div>";
   ss[p++] = s;
   }
T.innerHTML = ss.join("");
var r = T.firstChild, TT = r;
if(BIEA) r.offsetHeight; 
if(r.offsetHeight<8) { 
   if(BTablet && r.offsetHeight==0 && !this.IpadStyleErr) { this.Debug(1,"Missing row height definition for iPad, maybe loaded old or incorrect Grid.css?"); this.IpadStyleErr = 1; }
   I.Loaded = 0; T.innerHTML = ""; T.parentNode.removeChild(T); 
   return; 
   }   
for(var n in A){
   if(!BIEA && A[n][3]=='u') I[n] = r.firstChild[A[n][1]]; 
   else I[n] = r[A[n][1]];
   if(A[n][6]) I[n]-=A[n][6];
   r = r.nextSibling;
   }
if(BFF3&&!BFF20){
   I.CellBorderTopFF3 = I.CellBorderTop;
   I.CellBorderLeft = 0;
   I.CellBorderTop = 0;
   }
I.CellBorderLeftHeader = I.CellBorderLeft; I.CellBorderRightHeader = I.CellBorderRight;
I.CellBorderTopHeader = I.CellBorderTop; I.CellBorderBottomHeader = I.CellBorderBottom;
I.CellBorderWidthHeader = I.CellBorderLeftHeader + I.CellBorderRightHeader; I.CellBorderHeightHeader = I.CellBorderTopHeader + I.CellBorderBottomHeader;

I.CellBorderWidth = I.CellBorderLeft + I.CellBorderRight; I.CellBorderHeight = I.CellBorderTop + I.CellBorderBottom;

I.BodyAllHeight = I.BodyBPHeight + I.BodyMHeight;
I.SpaceMargin = (I.SpaceMargin-2)/2;
I.Line = this.NoTreeLines||this.Rtl ? I.LineN : I.LineL;
I.Tree = this.NoTreeLines||this.Rtl ? I.TreeN : I.TreeL;
I.DropColsSpace = (I.DropColsSpace-I.DropCols)/2;

if(!this.DefaultWidths){
   var size = this.DefaultSize;
   if(!size) this.DefaultWidths = [0,0,0];
   else if(size=="Normal") this.DefaultWidths = [1,1,1];
   else {
      var S = ParseObject(this.Sizes);
      if(S[size]) size = S[size];
      size = "GridMain "+prefix+"Main "+prefix+size.split(",").join(" "+prefix)+" "+prefix+(BIEA||BEdge?"IE":(BMozilla?"FF":"WK"))+(BMouse?"":" "+prefix+"Touch")+(this.Rtl?" "+prefix+"Rtl":"");
      TT.innerHTML = "<div class='"+size+"' style='width:100px;'><div class='"+prefix+"Width'></div></div><div style='width:100px;'><div class='"+prefix+"SpaceWidth'></div></div><div style='width:100px;'><div class='"+this.Img.GanttStyle+"GanttWidth'></div></div>";
      var w1 = TT.firstChild.firstChild.offsetWidth/100, w2 = TT.firstChild.nextSibling.firstChild.offsetWidth/100, w3 = TT.lastChild.firstChild.offsetWidth/100;
      this.DefaultWidths = [w1>=0?w1:0,w2>=0?w2:0,w3>=0?w3:0];
      }
   }
TT.innerHTML = "<div style='width:100px;'><div class='"+prefix+"Width'></div></div><div style='width:100px;'><div class='"+prefix+"SpaceWidth'></div></div>";
var gw = TT.firstChild.firstChild.offsetWidth/100; gw = gw>0&&this.DefaultWidths[0] ? gw / this.DefaultWidths[0] : 1;
var dw = gw/(I.Width?I.Width:1); if(dw>0.99&&dw<1.01) dw = 1;
I.Width = gw;
if(dw!=1) { this.MultiplyScale(dw,11); I.WidthChange = dw; }
var gw = TT.lastChild.firstChild.offsetWidth/100; gw = gw>0&&this.DefaultWidths[1] ? gw / this.DefaultWidths[1] : 1; 
var dw = gw/(I.SpaceWidth?I.SpaceWidth:1); if(dw>0.99&&dw<1.01) dw = 1;
I.SpaceWidth = gw;
if(dw!=1) { this.MultiplyScale(dw,12); I.SpaceWidthChange = dw; }

MS.Color;
var s = "", C = this.Colors;
var A = ["Default","DefaultHeader","DefaultSpace","Alternate",
         "NoFocus","ReadOnly","ReadOnlyDynamic","Preview","PreviewDynamic","Edit","EditDynamic","Formula",
         "Selected","SelectedCell","Fill",
         "Error","Deleted","Added","Moved1","Moved2","Changed","ChangedCell","Filtered",
         "Detail","DetailSelected",
         "Found1","Found2","Found3",
         "MaxChildren",
         "FocusedCell","FocusedCellRelative","FocusedCellRect","FocusedCellSafari","FocusedCellHeader","FocusedCellSpace","FocusedCellSpaceBool","FocusedCellSpaceEdit","FocusedCellSpaceDefaults","FocusedCellButton","EditedCell","ViewedCell",
         "Dragged",
         "Focused",
         "Hovered","HoveredAbsolute","HoveredHeader","HoveredCell","HoveredCellReadOnly","HoveredCellNoFocus","HoveredCellHeader","HoveredCellIndex",
         "HoveredCellPanel","HoveredCellFastPanel",
         "HoveredCellSpace","HoveredCellSpaceEdit","HoveredCellSpaceDefaults","HoveredCellSpaceBool0","HoveredCellSpaceBool1","HoveredCellSpaceBoolX","HoveredCellSpaceBoolIcon","HoveredCellSpaceHtml",
         "HoveredCellButton","HoveredCellButton1","HoveredCellButtonButton","HoveredCellButtonButton1","HoveredCellTab","HoveredCellTab1",
         "DefaultCol","DefaultRow","HoveredCol","HoveredRow","FocusedCol","FocusedRow","EditedCol","EditedRow","SelectedCol","SelectedRow",
         "CellMenu"
         ];
for(var n=0;n<A.length;n++) s += "<div class='"+prefix+"Color"+A[n]+"'>"+CNBSP+"</div>";
TT.innerHTML = s;
var r = TT.firstChild;
for(var n=0;n<A.length;n++){
   var c = GetStyle(r);
   if(c) { c = this.ConvertColor(c.backgroundColor); C[A[n]] = c; }
   else C[n] = 0;   
   r = r.nextSibling;
   }

var d = C["Default"]+0x2FFBFEFF; if(d&&(((((d>>10)&1023)+(d>>20)+(d&1023))-1536)/3<128)){
   var abs = {"Default":1,"DefaultHeader":1,"DefaultSpace":1,"HoveredAbsolute":1,"FocusedCell":1,"FocusedCellRelative":1,"FocusedCellRect":1,"FocusedCellSafari":1,"FocusedCellHeader":1,"FocusedCellSpace":1,"FocusedCellSpaceBool":1,"FocusedCellSpaceEdit":1,"FocusedCellSpaceDefaults":1,"FocusedCellButton":1,"CellMenu":1,"DefaultCol":1,"DefaultRow":1};
   
   for(var c in C) if(!abs[c]&&C[c]) C[c] += 0xFF3FCFF;
   
   }
ME.Color;

if(this.DynamicStyle){
   for(var i=0,s="";i<10;i++) s += "<span class='"+prefix+"TextShadow"+i+"'>x</span>";
   TT.innerHTML = s;
   var regrgb = /rgb\s*\([^\)]*\)/i;
   for(var i=0,r=TT.firstChild;i<10&&r;i++,r=r.nextSibling){
      var s = GetStyle(r).textShadow, ss = null; 
      if(!s||s.indexOf(" ")<0) s = null;
      else {
         var i1 = s.search(/(^|\s)[^-\d,]/), i2 = s.indexOf(",");
         if(i1>=0 && (i2<0||i1<i2)) ss = s.replace(s.search(/rgb/i)>=0 ? regrgb : /\s[^-\d][^\s\,]*/,"@");
         else if(i2>=0) ss = s.replace(","," @,");
         else ss = s + " @";
         
         }
      I["TextShadow"+i] = s;
      I["TextShadowC"+i] = ss;
      }
   }
if(this.ShowPrintPageBreaks>=0){
   TT.innerHTML = "<span class='"+prefix+"ColPageBreak'>x</span>";
   var s = GetStyle(TT.firstChild);
   I.ColPageBreakBorder = s.borderLeftWidth+" "+s.borderLeftStyle+" "+s.borderLeftColor;
   }

MS.Corners;
var A = ["Top","Bottom"];
for(var a in A){
   var s = "", max = 0;
   for(var i=0;i<10;i++) s += "<div style='position:absolute;left:0px;top:0px;"+(BIE||BIEA6?"width:0px;":"")+"'><div class='"+prefix+"Nothing "+prefix+A[a]+i+"' style='padding:0px;"+(BIE?"border:none;":"")+"'><div style='height:0px;width:0px;overflow:hidden;display:none;'></div></div></div>";
   TT.innerHTML = s;
   for(var i=0,r=TT.firstChild,tp=[];i<10&&r;i++,r=r.nextSibling){
      tp[i] = r.offsetHeight||r.offsetWidth ? r.offsetWidth : null;
      if(tp[i]!=null) max++;
      }
   I[A[a]] = max?tp:null;
   }
ME.Corners;

TT.innerHTML = "<div class='"+prefix+"DragCursor'>x</div><div class='"+prefix+"NoDragCursor'>x</div>'";
if(BIEA) T.style.visibility = "";
function GetCursor(tag,rep){
   var cur = GetStyle(tag).cursor;
   if(!cur||cur=="auto"||BIEA&&cur=="default") return "url("+G.AddPath(rep)+"),default"; 
   if(!BIEA) return cur;
   var url = cur.match(/^\s*url\('([^']+)'\),?\w*\s*$/);
   if(url&&url[1].search(/(https?\:\/)\//)<0) cur = "url("+G.DialogCSSPath+url[1]+")";
   if(cur.search(/\)\s*$/)>=0) cur += ",default";
   return cur;
   }
var G = this;
I.DragCursor = GetCursor(TT.firstChild,"Drag.cur"); 
I.NoDragCursor = GetCursor(TT.firstChild.nextSibling,"NoDrag.cur");

if(this.Rtl==null){
   var TR = TT;
   if(this.MainTag&&this.MainTag.offsetWidth){
      TR = document.createElement("div");
      this.MainTag.appendChild(TR);
      }
   TR.innerHTML = "<table><tr><td>xxxxxx</td><td>xxxxxx</td></tr></table>";
   var rtl = TR.firstChild.rows[0].cells[0].offsetLeft>5;
   if(TR!=TT) { TR.innerHTML = ""; TR.parentNode.removeChild(TR); }
   if(rtl){
       MS._Debug;if(0){ ME._Debug;alert("No RTL (right to left) module available in this TreeGrid, please contact sales@coqsoft.com");MS._Debug; } ME._Debug; 
      }
   MS.Hirji; MX.Hirji; MS._Debug;if(0){ ME._Debug; if(this.Lang.Format.Hirji) alert("No Hirji module available in this TreeGrid, Hirji / Jalaali calendar is not accessible, please contact sales@coqsoft.com");MS._Debug; } ME._Debug; ME.Hirji;
   }
else if(this.Rtl){
    MS._Debug;if(0){ ME._Debug; this.Rtl = 0; MS.Hirji; MX.Hirji; this.Lang.Format.Hirji = 0; ME.Hirji; alert("No RTL (right to left) module available in this TreeGrid, please contact sales@coqsoft.com"); MS._Debug; } ME._Debug;  
   }
else if(this.Lang.Format.Hirji) {
   MS.Hirji; MX.Hirji; MS._Debug;if(0){ ME._Debug; this.Lang.Format.Hirji = 0; alert("No Hirji module available in this TreeGrid, Hirji / Jalaali calendar is not accessible, please contact sales@coqsoft.com");MS._Debug; } ME._Debug; ME.Hirji;
   }
if(this.Rtl){
   TT.innerHTML = "<div dir='rtl'><div style='overflow:scroll;width:100px;'><div style='width:200px;'>xxx</div></div></div>";
   TT.firstChild.firstChild.scrollLeft = 100;
   this.Rtl = TT.firstChild.firstChild.scrollLeft ? 2 : 1; 
   }
TT.innerHTML = "<div class='"+prefix+"TreeAlign'></div>";
I.TreeAlign = CVertAlignTypes[GetStyle(TT.firstChild).verticalAlign.toLowerCase()]; if(!I.TreeAlign) I.TreeAlign = "Top";

TT.innerHTML = ""; T.removeChild(TT); T.parentNode.removeChild(T); 
this.MeasureFinish();
}
// -----------------------------------------------------------------------------------------------------------
TGP.MeasureFinish = function(){
var I = this.Img;

var M = this.MainTag;
if(M) {
   var s = GetStyle(M);
   I.TagBPWidth = GetBorderWidth(s);
   I.TagBPHeight = GetBorderHeight(s);
   var b = parseFloat(s.borderLeftWidth), p = parseFloat(s.paddingLeft);
   I.TagBPLeft = (b?Math.round(b):0) + (p?Math.round(p):0);
   var b = parseFloat(s.borderTopWidth), p = parseFloat(s.paddingTop);
   I.TagBPTop = (b?Math.round(b):0) + (p?Math.round(p):0);
   }
MS.Color; for(var c in this.ColorsXml) this.Colors[c] = this.ConvertColor(this.ColorsXml[c]); ME.Color; 
MS.CustomScroll;
MS.Touch; if(BTablet) this.CustomScroll = this.TouchScroll; ME.Touch;

if(this.CustomHScroll==null) this.CustomHScroll = this.CustomScroll;
if(this.HideHScroll) this.CustomHScroll = 4;
ME.CustomScroll;
this.ShowHintTag = null;
this.ScrollWidth = this.CustomScroll ? I["CSW"+this.CustomScroll] : CScrollWidth;
this.ScrollHeight = this.CustomHScroll ? I["CSH"+this.CustomHScroll] : CScrollHeight;
var h = Math.ceil(I.RowHeightX/8); 

if(h>I.RowHeight) I.RowHeight = h;
if(this.Def.Header.HeightSet) { this.Def.Header.Height = null; this.Def.Header.HeightSet = null; }
if(I.HeaderRowHeight>10 && this.Def.Header.Height==null) { this.Def.Header.Height = I.HeaderRowHeight; this.Def.Header.HeightSet = 1; }
if(this.Def.Filter.HeightSet) { this.Def.Filter.Height = null; this.Def.Filter.HeightSet = null; }
if(I.FilterRowHeight>10 && this.Def.Filter.Height==null) { this.Def.Filter.Height = I.FilterRowHeight; this.Def.Filter.HeightSet = 1; }
if(this.Def.ColTree.HeightSet) { this.Def.ColTree.Height = null; this.Def.ColTree.HeightSet = null; }
if(I.ColTreeRowHeight>10 && this.Def.ColTree.Height==null) { this.Def.ColTree.Height = I.ColTreeRowHeight; this.Def.ColTree.HeightSet = 1; }
this.RowHeight = this.MinRowHeight ? this.MinRowHeight : I.RowHeight;
this.SpaceRowHeight = this.MinSpaceRowHeight ? this.MinSpaceRowHeight : I.SpaceRowHeight;
this.SpaceOutRowHeight = this.MinSpaceRowHeight ? this.MinSpaceRowHeight : (I.SpaceOutRowHeight?I.SpaceOutRowHeight:I.SpaceRowHeight);
var C = this.Cols, w = I.WidthPad; if(!w) w = 20; 
for(var c in C) if(C[c].WidthPad==null || C[c].WidthPadSet) { C[c].WidthPad = w; C[c].WidthPadSet = 1; }
}
// ---------------------------------------------------------------------------------------------------------------------------
TGP.MeasureGanttHTML = function(){
var I = this.Img, prefix = I.GanttStyle;
this.SetStyleSize();

MS.Sync;
if(Grids.length>1 && !this.ChangingLanguage){
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i]; 
      if(G && G!=this && !G.Loading && G.Img.Loaded && G.Img.DialogLoaded && G.Style==this.Style && (!G.Gantt&&!this.Gantt||G.Gantt&&this.Gantt&&G.GanttStyle==this.GanttStyle) && G.Contrast==this.Contrast && G.Size==this.Size && G.CSS==this.CSS && !G.Paging==!this.Paging && !G.Gantt==!this.Gantt && (!G.Gantt||G.Img.GanttLoaded&&G.GanttCSS==this.GanttCSS&&!G.FastGantt==!this.FastGantt&&!(G.Gantt&&G.StyleDependencyModifier)==!(this.Gantt&&this.StyleDependencyModifier)) && !G.ChangingLanguage){
         MS.Pager; if(!(G.Pagers.length||G.Pager.Type||G.Paging) != !(this.Pagers.length||this.Pager.Type||this.Paging)) continue; ME.Pager;
         var dw = G.Img.GanttWidth/(I.GanttWidth?I.GanttWidth:1); if(dw>0.99&&dw<1.01) dw = 1;
         if(dw!=1) { this.MultiplyScale(dw,16); I.GanttWidthChange = dw; }
         var Z = [I.Width,I.SpaceWidth,I.GanttWidthChange,I.WidthChange,I.SpaceWidthChange];
         for(var n in G.Img) I[n] = G.Img[n]; 
         I.Width = Z[0]; I.SpaceWidth = Z[1]; I.GanttWidthChange = Z[2]; I.WidthChange = Z[3]; I.SpaceWidthChange = Z[4];
         this.MeasureGanttFinish();
         return;
         }
      }
   }
ME.Sync;
var T = document.createElement("div");
if(BFF15) T.style.position = "absolute";
T.style.left = "0px";
T.style.top = "0px";
T.style.visibility = "hidden";
this.AppendTag(T);

T.innerHTML = "<div class='"+prefix+"GanttLoaded'><div style='height:0px;overflow:hidden;display:none;'></div></div>";
I.GanttLoaded = T.firstChild.offsetHeight;
if(!I.GanttLoaded) { T.parentNode.removeChild(T); return; }

var col = this.GetFirstGantt(), C = this.Cols[col];
var adj = C&&C.GanttAdjacentBars ? " "+prefix+"GanttIconAdjacent" : "";
var A = {
   
   GanttBottom : ["GanttBottom","offsetHeight","","",1],
   GanttIconBottom : ["GanttIconBottom","offsetHeight","","",1],
   GanttMilestone : ["GanttMilestoneBase","offsetWidth","","",1],
   GanttMilestoneHeight : ["GanttMilestoneBase","offsetHeight","","",1],
   GanttMilestonePadding : ["GanttMilestonePadding","offsetHeight","","",1],
   GanttFlag : ["GanttFlag","offsetWidth","","",1],
   GanttFlagHeight : ["GanttFlag","offsetHeight","margin:0px;","",1],
   GanttFlagMTop : ["GanttFlag","offsetHeight","border:0px none;padding:20px;margin-bottom:0px;","",0,"",40],
   GanttConstraintHeight : ["GanttConstraint","offsetHeight","margin:0px;","",1],
   GanttConstraintMTop : ["GanttConstraint","offsetHeight","border:0px none;padding:20px;margin-bottom:0px;","",0,"",40],
   GanttPointHeight : ["GanttPoint","offsetHeight","margin:0px;","",1],
   GanttPointMTop : ["GanttPoint","offsetHeight","border:0px none;padding:20px;margin-bottom:0px;","",0,"",40],
   "GanttMinEnd" : ["GanttMinEnd "+prefix+"GanttConstraint","offsetWidth","","",1],
   "GanttMinStart" : ["GanttMinStart "+prefix+"GanttConstraint","offsetWidth","","",1],
   
   GanttManual : ["GanttManualStart","offsetWidth","","",1],
   GanttResource : ["GanttResourceChar","offsetWidth","","",1],
   GanttNarrow : ["GanttNarrowLimit","offsetWidth","","",1],
   GanttFixedLeft : ["Gantt","offsetWidth","margin-right:0px;padding-right:0px;border-right:0px solid;"],
   GanttResBPWidth : ["GanttChartRes","offsetWidth","margin:0px;"],
   GanttResBPHeight : ["GanttChartRes","offsetHeight","margin:0px;"],
   GanttAvailabilityBPHeight : ["GanttAvailability","offsetHeight","margin:0px;"],
   
   GanttAvailabilityBPWidth : ["GanttAvailability","offsetWidth","margin:0px;"],
   GanttAvailabilityMTop : ["GanttAvailability","offsetHeight","border:0px none;padding:20px;margin-bottom:0px;","",0,"",40],
   GanttAvailabilityMBottom : ["GanttAvailability","offsetHeight","border:0px none;padding:20px;margin-top:0px;","",0,"",40],
   GanttAvailabilityNegMBottom : ["GanttAvailabilityNeg","offsetHeight","border:0px none;padding:20px;margin-top:0px;","",0,"",40],
   GanttAvailabilityTextHeight : ["GanttAvailabilityText","offsetHeight","height:auto;","",1,"80"],
   GanttAvailabilityTextRight : ["GanttAvailabilityTextRight","offsetWidth","margin:0px;border:0px none;padding-left:0px;"],
   GanttHoverBPTop : ["GanttHoverOut","offsetHeight","margin:0px;padding-bottom:0px;border-bottom:0px solid;"],
   GanttInMBPHeight : ["GanttBaseIn","offsetHeight",""],
   GanttOutBPHeight : ["GanttBaseOut","offsetHeight","margin:0px;"],
   GanttInHeight : ["GanttBaseIn","offsetHeight","padding:0px;border:0px none;","",1,"XXX"],
   GanttOutMTop : ["GanttBaseOut","offsetHeight","margin-bottom:0px;border:0px solid;border-left:1px solid black;padding:1px;","",0,"",2],
   GanttOutLeftPHeight : ["GanttOutLeft","offsetHeight","margin:0px;border:0px none;padding-top:0px;"],
   GanttOutBPWidth : ["GanttBaseOut","offsetWidth","margin:0px;"],
   GanttLeft0BPWidth : ["GanttHtmlLeft0","offsetWidth","margin:0px;"],
   GanttLeft1BPWidth : ["GanttHtmlLeft1","offsetWidth","margin:0px;"],
   GanttLeft2BPWidth : ["GanttHtmlLeftMilestone","offsetWidth","margin:0px;"],
   GanttFinish : ["GanttFinish","offsetWidth","","",1],
   GanttFinishAuto : ["GanttFinishAuto","offsetWidth","","",1],
   
   GanttIconLeftShift : ["GanttIconLeftShift"+adj,"offsetWidth","padding:20px;","",0,"",40],
   GanttIconRightShift : ["GanttIconRightShift"+adj,"offsetWidth","padding:20px;","",0,"",40],
   GanttIconInLeftShift : ["GanttIconInLeftShift"+adj,"offsetWidth","padding:20px;","",0,"",40],
   GanttIconInRightShift : ["GanttIconInRightShift"+adj,"offsetWidth","padding:20px;","",0,"",40],
   GanttIconCustomLeftShift : ["GanttIconCustomLeftShift"+adj,"offsetWidth","padding:20px;","",0,"",40],
   GanttIconCustomRightShift : ["GanttIconCustomRightShift"+adj,"offsetWidth","padding:20px;","",0,"",40],
   GanttIconShiftTop : ["GanttIconLeftShift"+adj,"offsetHeight","padding:20px;","",0,"",40],
   GanttIconInShiftTop : ["GanttIconInLeftShift"+adj,"offsetHeight","padding:20px;","",0,"",40],

   GanttDepStart : ["GanttDepStart","offsetWidth","","",1],
   GanttDepStartShift : ["GanttDepStartShift","offsetWidth","padding:20px;","",0,"",40],
   GanttDepStartShiftMilestone : ["GanttDepStartShiftMilestone","offsetWidth","padding:20px;","",0,"",40],
   GanttDepStartShiftAdjacent : ["GanttDepStartShiftAdjacent","offsetWidth","padding:20px;","",0,"",40],
   GanttDepStartShiftLag : ["GanttDepStartShiftLag","offsetWidth","padding:20px;","",0,"",40],
   GanttDepEnd : ["GanttDepEnd","offsetWidth","","",1],
   GanttDepEndShift : ["GanttDepEndShift","offsetWidth","padding:20px;","",0,"",40],
   GanttDepEndShiftMilestone : ["GanttDepEndShiftMilestone","offsetWidth","padding:20px;","",0,"",40],
   GanttDepEndShiftAdjacent : ["GanttDepEndShiftAdjacent","offsetWidth","padding:20px;","",0,"",40],
   GanttDepRange : ["GanttDepRange","offsetWidth","","",1],
   GanttDepMinWidth : ["GanttDepMinWidth","offsetWidth","","",1],
   GanttDepStartWidth : ["GanttDepStartWidth","offsetWidth","","",1],
   GanttDepEndWidth : ["GanttDepEndWidth","offsetWidth","","",1],
   GanttProgressMBPWidth : ["GanttMark15","offsetWidth"],
   GanttProgressAbove : ["GanttMarkE","offsetHeight","","",1],
   GanttProgressBelow : ["GanttMarkF","offsetHeight","","",1],
   GanttMarkTextBPWidth : ["GanttMarkText","offsetWidth","margin:0px;"],
   GanttMarkTextBPHeight : ["GanttMarkText","offsetHeight","margin:0px;"],
   GanttHasSvgBack : ["GanttHasSvgBack","offsetWidth","","",1]
   }

for(var i=0;i<4;i++){
   A["GanttDepArrowDip"+i] = ["GanttDepArrow"+i+"0Dip","scrollWidth","padding:0px;border:0px none;","",1]; 
   A["GanttDepArrowWidth"+i] = ["GanttDepArrow"+i+"0","scrollWidth","padding:0px;border:0px none;","",1];
   A["GanttDepArrowHeight"+i] = ["GanttDepArrow"+i+"0","offsetHeight","padding:0px;border:0px none;","",1];
   A["GanttDepArrowShift"+i] = ["GanttDepArrow"+i+"0Shift","scrollWidth","padding:0px;border:0px none;","",1];
   A["GanttDepArrowStub"+i] = ["GanttDepArrow"+i+"0Stub","scrollWidth","padding:0px;border:0px none;","",1];
   A["GanttDepStubWidth"+i] = ["GanttDepStub"+i+"0","scrollWidth","padding:0px;border:0px none;","",1];
   A["GanttDepStubHeight"+i] = ["GanttDepStub"+i+"0","offsetHeight","padding:0px;border:0px none;","",1];
   A["GanttDepStubShift"+i] = ["GanttDepStub"+i+"0Shift","scrollWidth","padding:0px;border:0px none;","",1];
   A["GanttDepStubDip"+i] = ["GanttDepStub"+i+"0Dip","scrollWidth","padding:0px;border:0px none;","",1];
   A["GanttDepBor"+i] = ["GanttDep"+i+"0","scrollWidth","margin:0px;padding:0px;border-right:0px none;overflow:hidden;"];
   A["GanttDepThick"+i] = ["GanttDep"+i+"0","scrollWidth","margin:0px;border:0px none;overflow:hidden;","",1];
   A["GanttDepOver"+i] = ["GanttDep"+i+"0Over","scrollWidth","","",1];
   A["GanttDepSpace"+i] = ["GanttDep"+i+"0Space","offsetHeight","padding:20px;","",0,"",40];
   }
//.GanttFlowHoverBPTop = ["GanttFlowHover","offsetHeight","margin:0px;padding-bottom:0px;border-bottom:0px solid;"];
A["GanttPointCustom"] = ["GanttPoint "+prefix+"GanttPointCustom","offsetWidth","","",1];
for(var i=1;i<=8;i++) A["GanttPoint"+i] = ["GanttPoint "+prefix+"GanttPoint"+i,"offsetWidth","","",1];
if(BIE){
   var B = ["OutLeft","OutRight","InLeft","InRight","OutHeightLeft","OutHeightRight","InHeightLeft","InHeightRight","OutCustomLeft","OutCustomRight","InCustomLeft","InCustomRight"];
   for(var i=0;i<B.length;i++) A["Gantt"+B[i]] = ["Gantt"+B[i],"offsetHeight","margin:0px;"];
   }


A.GanttLoaded = ["GanttLoaded","offsetHeight",""];
I.LastGanttBottom = I.GanttBottom;

var ss = [], p = 0;
for(var n in A){
   var s = "<div style='position:absolute;left:0px;top:0px;'>";
   s += "<"+(A[n][3]?A[n][3]:"div")+" class='"+prefix+A[n][0]+"'"
   s += " style='"+A[n][2]+(A[n][1].indexOf('Width')>=0?"border-top:1px solid;border-bottom:1px solid;":"")+(A[n][4]?"":"width:auto;height:auto;overflow:visible")+";'>";
   s += A[n][5] ? A[n][5] : "<div style='height:0px;width:0px;overflow:hidden;display:none;'></div>";
   s += "</"+(A[n][3]?A[n][3]:"div")+"></div>";
   ss[p++] = s;
   }
T.innerHTML = ss.join("");
var r = T.firstChild, TT = r;
if(BIEA) r.offsetHeight; 
for(var n in A){
   if(!BIEA && A[n][3]=='u') I[n] = r.firstChild[A[n][1]]; 
   else I[n] = r[A[n][1]];
   if(A[n][6]) I[n]-=A[n][6];
   r = r.nextSibling;
   }

I["GanttMaxEnd"] = 0; I["GanttMaxStart"] = 0; I.GanttMilestone = Math.floor(I.GanttMilestone/2);

TT.innerHTML = "<div style='width:100px;'><div class='"+prefix+"GanttWidth'></div></div>";
var gw = TT.firstChild.firstChild.offsetWidth/100; gw = gw>0&&this.DefaultWidths&&this.DefaultWidths[2] ? gw / this.DefaultWidths[2] : 1;
var dw = gw/(I.GanttWidth?I.GanttWidth:1); if(dw>0.99&&dw<1.01) dw = 1;
I.GanttWidth = gw;
if(dw!=1) { this.MultiplyScale(dw,16); I.GanttWidthChange = dw; }

if(this.ZoomBorder!=1){
   for(var i=0;i<4;i++) I["GanttDepBorZoom"+i] = GetZoomBorderWidth(I["GanttDepBor"+i],I.Size);
   if(this.FastGantt) {
      TT.innerHTML = "<div class='"+prefix+"FGanttBase "+prefix+"FGanttZoom' style='height:0px;overflow:hidden;'></div>";
      var s = GetStyle(TT.firstChild);
      
      I.FastGanttBPHeight = TT.firstChild.getBoundingClientRect().height;
      }
   if(BChrome) I.GanttZoomHeights = []; 
   
   }
else {
   for(var i=0;i<4;i++) I["GanttDepBorZoom"+i] = I["GanttDepBor"+i];
   if(this.FastGantt) I.FastGanttBPHeight = I.FastGanttPHeight+I.FastGanttBTop+I.FastGanttBBottom;
   }
for(var i=0;i<4;i++) if(!I["GanttDepOver"+i]) I["GanttDepOver"+i] = 0;
   
TT.innerHTML = ""; T.removeChild(TT); T.parentNode.removeChild(T); 
this.MeasureGanttFinish();
}
// -----------------------------------------------------------------------------------------------------------
TGP.MeasureGanttFinish = function(){

}
// -----------------------------------------------------------------------------------------------------------
function GetZoomBorderWidth(h,size){
if(!h) return 0;
if(BIE || BIEA&&!BIEA8) return 1;
var T = GetElem("TGZoomBorderWidth"+h);
if(!T){
   T = document.createElement("div"); T.id = "TGZoomBorderWidth"+h;
   var s = T.style;
   s.position = "absolute"; s.left = "0px"; s.top = "0px"; s.visibility = "hidden";
   s.overflow = "hidden"; if(h>0) s.borderTop = h+"px solid black"; s.height = h<0?-h+"px":"0px";
   AppendTag(T,size);
   }
return T.getBoundingClientRect().height;
}
// -----------------------------------------------------------------------------------------------------------

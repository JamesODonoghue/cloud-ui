// -----------------------------------------------------------------------------------------------------------
// Function GetRowHTML
// -----------------------------------------------------------------------------------------------------------
var CVertAlignTypes = {"0":"Top","1":"Middle","2":"Bottom","top":"Top","bottom":"Bottom","middle":"Middle","Top":"Top","Bottom":"Bottom","Middle":"Middle","TOP":"Top","BOTTOM":"Bottom","MIDDLE":"Middle","center":"Middle","Center":"Middle","CENTER":"Middle"};

var CButtonTypes = {"Defaults":1,"Enum":1,"Date":1,"Dates":1,"Sort":1,"Filter":1,"Button":1,"Html":1,"Expand":1,"Check":1,"File":1,"Clear":1,"Level":1};
var CAlignRight = {"Int":1,"Float":1,"Date":1};
var CRoundNumbers = {"-1":0.1,"-2":0.01,"-3":0.001,"-4":0.0001,"-5":0.00001,"-6":0.000001,"-7":0.0000001,"-8":0.00000001,"-9":0.000000001,"-10":0.0000000001,0:1,1:10,2:100,3:1000,4:10000,5:100000,6:1000000,7:10000000,8:100000000,9:1000000000,10:1e10,11:1e11,12:1e12,13:1e13,14:1e14,15:1e15,16:1e16,17:1e17,18:1e18,19:1e19,20:1e20};
var CRepLt = /<(?!\/?\w+(\s*\w+\s*=\s*('[^']*'|("[^"]*")|\w+))*\s*\/?>)/g; 
var CRepAmp = /&(?!#?\w+;)/g; 
var CRepHtml = /<\/?\w+(\s+\w+\s*=\s*('[^']*'|("[^"]*")|[^\s>]+))*\s*\/?>/g; 

// ---------------------------------------------------------------------------------------------------------------------------
// Fills HTML of row, col section or cell, tags <td>
// SS is array of arrays (for every column section in ColNames) for normal or or single array for Space or Cell set
// If some item in SS is null, does not fill this item, useful for fill only some section
// If set Cell, fills only given column
// Opt = 0 - fills the whole HTML
// Opt = 1 - fills the whole HTML with width of right buttons, used for CalcWidth
// Opt = 4 - fills [0] = val, [1] = class, [2] = color, [3] = background-image, [4] = right button val, [5] = right button class, [6] = right button background-url, [7] = style, for tree [8] - tree val, [9] - tree class
// Opt = 5 - fills [0] = color class, [1] = color
// Opt = 8 and Cell set - returns cell value
// Opt = 9 and Cell set - returns cell value with inner attributes HtmlPrefix, HtmlPostfix, ClassInner and Rotate
// Opt = 16 - returns row color and class
TGP.GetRowHTML = function(row,SS,Opt,Cell){
var Cols = this.Cols, mc = this.HideTree ? null : this.MainCol, I = this.Img, L = this.Lang.Format, print = this.Printing, printsel = print && this.PrintSelected;
var D = row.Def, prefix = " "+I.Style, clrprefix = prefix+"Class", custprefix = " "+I.Custom, test = this.TestIds, trans = this.Trans;
var noleft = prefix+"NoLeft", noright = prefix+"NoRight", rtl = 0; 

var ogt = Grids.OnGetType!=null, oce = Grids.OnCanEdit!=null, ogh = Grids.OnGetHtmlValue!=null;
var ogd = Grids.OnGetDefaultColor!=null, ogc = Grids.OnGetColor!=null, ogs = Grids.OnGetClass!=null, ogf = Grids.OnGetFormat!=null;
var spc = row.Space!=null, hdr = row.Kind=="Header", ctr = row.Kind=="ColTree", fix = row.Fixed, cpl = fix ? this.CPLastSec : 0, flt = row.Kind=="Filter";
var hov = row==this.ARow && (!this.Touched||!Grids.Drag), hov1 = hov && this.Hover>=1, foc = row==this.FRow, cur = this.ColorCursor;
var rcalc = row.Calculated, rspn = row.Spanned, sel = 0, fs1 = this.FastColumns, esc = this.EscapeImages;
MS.RowSpan; var rrspn = row.RowSpan, rrow = row; ME.RowSpan;
var rccls = row.Class; if(rccls==null) rccls = D.Class; if(!rccls) rccls = ""; else rccls = custprefix+rccls;
var rpre = row.HtmlPrefix; if(rpre==null) rpre = D.HtmlPrefix;
var rpo = row.HtmlPostfix; if(rpo==null) rpo = D.HtmlPostfix;
var rclsin = row.ClassInner; if(rclsin==null) rclsin = D.ClassInner;
MS.Group; var gt = this.GroupTree && this.Grouped && this.Group && !fix && !D.Group && this.GroupTreeCols; ME.Group;
var dys = this.DynamicStyle, dyb = !row.NoDynBorder ? this.DynamicBorder : 0, rpan = row.Kind=="Panel", dyf = this.DynamicFormat==2 ? L.TextPrefix.charCodeAt(0) : null, dye = this.DynamicEditing;
var em = this.EditMode && row==this.ERow, ovr = this.Overlay, showf = this.FormulaShow, hidez = this.HideZero, wbr = this.NoWrapBR;

var maxpre = "", maxpo = "", maxall = 0;
var max = row.MaxHeight; if(max==null) max = D.MaxHeight;
if(max){ 
   maxpre = "<div style='"+(BIEA6||BIE?"height:expression(this.scrollHeight<"+max+"?\"\":\""+max+"px\");":"max-height:"+max+"px;")+"overflow:hidden;'>"; maxpo = "</div>";  
   maxall = row.MaxHeightAll; if(maxall==null) maxall = D.MaxHeightAll; if(maxall==null) maxall = fix?1:0;
   if(print&&this.PrintVarHeight>=2){ maxpre = ""; maxpo = ""; }
   }

MS.Edit;
var ged = CEditKinds[row.Kind] ? 1 : this.Editing;
var rcf = row.CanFocus; if(rcf==null) { rcf = D.CanFocus; if(!rcf && rpan && this.ColorPanel) rcf = 1; }
var rce = row.CanEdit; if(rce==null) rce = D.CanEdit; if(rce==null) rce = 1;
var dce = dye ? row.CanEdit : null;
ME.Edit;

// --- Base color ---
var rrgbcls = "";
MS.Color;
var cst = this.ColorState;
var rgbhov = 0, rgbhovabs = 0, rgbsel = 0, rgbclssel, Clr = this.Colors, rgbalt = 0, OptClr = Opt==0||Opt==1||Opt==16;
var rnoclr = row["NoColor"]; if(rnoclr==null) rnoclr = D["NoColor"];
var rgbdef = row.Color; if(rgbdef==null) rgbdef = D.Color; if(rgbdef) rgbdef = this.ConvertColor(rgbdef);
var rgbdef2 = rgbdef; if(rgbdef2==null) { rgbdef2 = Clr["Default"+(hdr?"Header":(spc?"Space":""))]; if(!rgbdef2) rgbdef2 = null; }
var bckdef = row.Background; if(!bckdef) bckdef = D.Background;
if(!spc && !hdr && !ctr) {
   // --- Alternate color ---
   if(row.ColorPos==1) {
      alt = row["AlternateColor"]; if(!alt) alt = D["AlternateColor"];
      if(alt) rgbalt = this.ConvertColor(alt);
      else rgbalt = Clr["Alternate"];
      if(OptClr) {
         var alt = row["AlternateClass"]; if(!alt) alt = D["AlternateClass"];
         if(alt) rrgbcls += custprefix+alt;
         else rrgbcls += clrprefix+"Alternate";
         }
      }

   // --- Standard color ---
   var rgbstd = 0, mark = this.SearchActionMark; if(mark) mark = this.SearchType&256 ? 2 : 1;
   MS.Master;
   var det = row.Detail; if(det==null) det = D.Detail;
   if(det){ 
      if(row==this.DetailSelected) { rgbstd += Clr["DetailSelected"]; if(OptClr) rrgbcls += clrprefix+"DetailSelected"; }
      else { rgbstd += Clr["Detail"]; if(OptClr) rrgbcls += clrprefix+"Detail"; }
      }
   ME.Master;   
   if(hov && this.Hover>=2 && (this.GetFlags(row,this.ACol,"HoverRow",CCursors)["color"]||!this.BorderCursors)) { rgbhov = Clr["Hovered"]; rgbhovabs = Clr["HoveredAbsolute"]; }
   if(foc){ 
      var flg = this.FocusRect&4 ? {} : this.GetFlags(row,this.FCol,"FocusRow",CCursors);
      if(flg["color"]||!this.BorderCursors) rgbstd += Clr["Focused"]; 
      if(flg["class"]) rrgbcls += clrprefix + "Focused"; 
      }
   if(row.CPage){ rgbstd += Clr["MaxChildren"]; if(OptClr) rrgbcls += clrprefix+"MaxChildren"; }
   if(row.Selected-0 && !printsel){
      if(row.Selected&1) {
         rgbsel = Clr["Selected"]; 
         rgbclssel = this.SelectClass ? clrprefix + "Selected" : ""; 
         if(this.SelectClassRow && (OptClr||this.SelectClass)) rrgbcls += clrprefix+"Selected";
         }
      if(row.Selected&2) sel = this.SelectingCells>=3?"SelectedCell":"Selected";
      }   
   if(row==this.DraggedRow) rgbstd += Clr["Dragged"];

   // --- State color ---
   var rgbstate = 0, chg = row.Changed-0;
   var nostate = row.NoColorState; if(nostate==null) nostate = D.NoColorState;
   if(!nostate&&cst&2) {
      if(row.Deleted-0){ rgbstate = Clr["Deleted"]; if(OptClr) rrgbcls += clrprefix+"Deleted"; }
      else if(row.Added-0){ rgbstate = Clr["Added"]; if(OptClr) rrgbcls += clrprefix+"Added"; }
      else if(chg){ rgbstate = Clr["Changed"]; if(OptClr) rrgbcls += clrprefix+"Changed"; }
      else if(row.Moved){ rgbstate = Clr["Moved"+row.Moved]; if(OptClr) rrgbcls += clrprefix+"Moved"+row.Moved; }
      }
   if(this.ColorFilter&&row.Filtered!=null&&!row.Filtered) { rgbstate = Clr["Filtered"]; if(OptClr) rrgbcls += clrprefix+"Filtered"; }
   }
ME.Color;

if(Opt==16) return rrgbcls;

if(dys!=0&&(Opt==0||Opt==1||Opt==4||Opt==5)){
   var rnostyle = row.NoStyle; if(rnostyle==null) rnostyle = D.NoStyle; if(dys==1&&fix&&!rnostyle) rnostyle = 1;
   if(rnostyle==3) dys = 0;
   else {
      var ogcs = Grids.OnGetCellStyle;
      var ralign = row.Align; if(ralign==null) ralign = D.Align;
      var rvalign = row.VertAlign; if(rvalign==null) rvalign = D.VertAlign; if(rvalign==null&&!this.Cols["V"]){ rvalign = row.VAlign; if(rvalign==null) rvalign = D.VAlign; }
      var rwrap = row.Wrap; if(rwrap==null) rwrap = D.Wrap;
      MS.Rotate; var rrot = row.Rotate; if(rrot==null) rrot = D.Rotate; ME.Rotate;
      
      }
   }

for(var j=this.FirstSec,CN,A;j<=this.LastSec;j++){
   
   if(Cell){ 
      if(j>this.FirstSec) break;
      if(rspn && row[Cell+"Span"]==0 && Opt!=9 && Opt!=10){  
         CN = this.ColNames[Cols[Cell].Sec];
         if(cpl) { var sec = Cols[Cell].Sec, p = Cols[Cell].Pos; while(row[CN[p]+"Span"]==0) if(--p<0){ CN = this.ColNames[--sec]; p = CN.length-1; } }
         else for(var p=Cols[Cell].Pos;p>=0&&row[CN[p]+"Span"]==0;p--);
         if(p<0) break;
         Cell = CN[p];
         }
      CN = [Cell];
      A = SS?SS:[];
      }
   else if(spc){ 
      if(j>this.FirstSec) break;
      CN = row.Cells; 
      A = SS;
      if(!CN){ A[A.length] = "<td></td>"; break; } 
      var spcpan = 0; 
      }
   else {
      CN = this.ColNames[j]; 
      A = SS[j]; 
      if(cpl && j>1 && j<=cpl) A = SS[1];
      if(!A) continue;

      MS.UserSec;
      var usec = this.UserSec[j];
      if(row[usec]!=null || D[usec]!=null){
         var spn = 0, i = 0;
         while(1){
            if(i>=CN.length){
               if(!cpl||A!=SS[1]||j==0||j>=cpl) break;
               CN = this.ColNames[++j];
               i = 0;
               }
            var c = CN[i++],C = Cols[c]; 
            if(C.Visible || C.Hidden) {
               if(C.WidthPad) spn++;
               if(c==mc) spn++;
               if(C.GanttPageW && !this.Printing) spn++;
               spn++;
               }
            }
         if(spn) A[A.length] = "<td class='"+prefix+"CellBase"+prefix+"CellUser"+prefix+"User' colspan='"+spn+"'>"+Get(row,usec)+"</td>";
         continue;
         }
      ME.UserSec;
      }
   
   var cnlen = CN.length, out = "";
     
   for(var i=0;i<cnlen;i++){
      var col = CN[i], C = spc?this.DefCols.Space:Cols[col], ismc = col==mc;
      MS.RowSpan; row = rrow; ME.RowSpan;
      if(C.Visible==0 && !C.Hidden && !Cell && !spc) {
         if(!rspn) continue;
         
         MS.ColSpan;         
         var spn = row[col+"Span"]; if(spn<=1) continue;
         var jj = Cols[col].Sec, SC = this.ColNames[jj];
         for(var k=0;k<SC.length&&col!=SC[k];k++);
         while(spn>1){
            k++; 
            if(k>=SC.length){
               if(!cpl||A!=SS[1]||jj==0||jj>=cpl) break;
               SC = this.ColNames[++jj];
               k = 0;
               }
            if(Cols[SC[k]].Visible||Cols[SC[k]].Hidden) break;
            spn--;
            }
         if(spn<=1 || k>=SC.length) continue;
         ismc = 0;
         ME.ColSpan;
         }

      var rspan = "", rsphid = 0;
      MS.RowSpan;
      if(rrspn){
         
         var spn = row[col+"RowSpan"];
         if(spn==0){
            for(var r=row.previousSibling,ppls=r&&r.r1?0:1;r&&!r.Visible&&r[col+"RowSpan"]==0;r=r.previousSibling) if(!r.r1) ppls++;
            if(r&&!r.Visible&&row.Visible) { spn = r[col+"RowSpan"]+(BIEA&&!BIE8Strict?ppls-1:0); row = r; } 
            else if(Cell) return this.GetRowHTML(r,SS,Opt,Cell); 
            else if(this.PrintPageFR) {
               var pfr = this.PrintPageFR;
               if(pfr.Level<row.Level) continue; 
               while(pfr.Level>row.Level) pfr = pfr.parentNode;
               for(var r=row;r&&r[col+"RowSpan"]==0&&r!=pfr;r=r.previousSibling);
               if(r&&r[col+"RowSpan"]!=0) continue; 
               rsphid = (row==pfr ? 4 : 0) + (row.nextSibling&&row.nextSibling[col+"RowSpan"]!=0 ? 2 : 0) + 1; 
               }
            else continue; 
            }
         if(spn>1 && C.Spanned) {
            var pls = 0, ipls = 0, rev = this.ReversedTree;
            for(var k=1,r=row;r&&k<=spn;k++,r=r.nextSibling) {
               if(print ? !this.CanPrint(r) : !r.Visible) { 
                  if(r.r1&&!print) ipls--; else pls--; 
                  }
               else {
                  if((rev ? r!=row : k!=spn) && (r.Expanded||BIEA&&!BIE8Strict&&k<=spn-1) && (r.Hasch || (!this.ChildPaging||r.Expanded) && this.HasChildren(r))) pls++;
                  if(BIEA&&!BIE8Strict) ipls = 0;
                  }
               }
            rspan = " rowspan='"+Math.floor(spn+pls+ipls)+"'";
            }
         }   
      ME.RowSpan; 

      var simple = row[col+"Simple"]; if(simple==null) simple = D[col+"Simple"]; if(simple==null&&!fix) simple = C.Simple;
      simple = simple ? ~simple : 0xFFFF; var simple1 = simple&1;
         
      var val = row[col]; if(val==null) val = D[col]; 
      if(dyf&&typeof(val)=="string"&&val.charCodeAt(0)==dyf) val = val.slice(1);
      
      var ct = col+"Type", type = row[ct]; 
      if(type==null){ 
         type = D[ct]; 
         if(type==null){ 
            type = C.Type;
            if(flt && !CEditTypes[type] && type!="Panel" && !C.ConstWidth && type!="Button") type = "Text";
            if(rpan && !C.ConstWidth && type!="Button") type = "Panel"; 
            }
         }
      if(ogt) { var tmp = Grids.OnGetType(this,row,col,type); if(tmp!=null) type = tmp; }
      if(showf) { var ef = row[col+"EFormula"]; if(ef==null) ef = D[col+"EFormula"]; if(ef) { type = "Lines"; val = L.FormulaPrefix+ef; } }
      var pan = type=="Panel", panc = pan&&!this.ColorPanel, btn = spc&&type=="Button", bt = null, ridx = col==this.RowIndex;

      if(simple1){

         var ccls = row[col+"Class"]; if(ccls==null) ccls = D[col+"Class"]; if(ccls==null&&!hdr&&!ctr) ccls = C.Class;
         if(!ccls) ccls = rccls; 
         else ccls = custprefix+ccls+rccls;
         if(ogs){ var tmp = Grids.OnGetClass(this,row,col,ccls); if(tmp!=null) ccls = " "+tmp; }

         var ce, cf = row[col+"CanFocus"]; 
         MS.Edit;
         if(cf==null) { 
            cf = D[col+"CanFocus"]; 
            if(cf==null) {
               if(!rcf) cf = 0;
               else cf = C.CanFocus==null ? !panc&&!btn : C.CanFocus;
               }
            }
         if(!cf && type!="Bool" && type!="Radio") ce = 0;
         else if(ged){
            ce = row[col+"CanEdit"]; 
            if(ce==null){
               ce = D[col+"CanEdit"]; 
               if(ce==null){
                  if(rce!=1) ce = rce?2:0;
                  else if(dce) ce = dce;
                  else if(flt) ce = type!="Pass" && C.CanFilter>0;
                  else if(rcalc){ 
                     ce = row[col+"Formula"];
                     if(ce==null) { ce = D[col+"Formula"]; if(ce==null) ce = C.Formula; }
                     ce = ce?false:(C.CanEdit!=null?C.CanEdit:this.EditTypes[type]);
                     }
                  else if(C.CanEdit!=null) ce = C.CanEdit;
                  else if(!C.Formula) ce = this.EditTypes[type];
                  else {
                     ce = row[col+"Formula"]; if(ce==null) ce = D[col+"Formula"];
                     ce = ce==""?this.EditTypes[type]:false; 
                     }
                  MS.Group; if(gt && this.GroupTreeCols[col]) ce = false; ME.Group;
                  }
               else if(dye) ce = !!ce;
               }
            if(ged==2 && ce==1 && !flt) ce = ce===true ? 3 : 2;
            
            if(oce) { var tmp = Grids.OnCanEdit(this,row,col,ce); if(tmp!=null) ce = tmp; }
            }
         else ce = false;   
         ME.Edit;
         }
      else { ccls = rccls; cf = 1; ce = simple&2 ? 0 : 1; }
   
      // --- Color ---
      var clr = "", rgbcls = "", rgb = "";
      MS.Color;
      if(simple1){ var noclr = row[col+"NoColor"]; if(noclr==null){ noclr = D[col+"NoColor"]; if(noclr==null){ noclr = C.NoColor; if(noclr==null) noclr = rnoclr; } } }
      else noclr = 0;
      if(noclr!=1) {
      
         // --- Base color ---
         var rgb = 0;
         if(simple1) {
            if(dys==null){
               rgb = row[col+"Color"]; if(rgb==null){ rgb = D[col+"Color"]; if(rgb==null && !btn && !hdr && !ctr) rgb = C.Color; }
               if(rgb) rgb = this.ConvertColor(rgb);
               else if((btn||panc)&&(!hov1||col!=this.ACol)||ridx) rgb = 0;
               else rgb = noclr==2 ? rgbdef : rgbdef2;
               }
            else if(dys && C.NoStyle!=3) {
               
               }
            if(!rgb) rgb = 0;
            }
      
         // --- Alternate color ---
         if(!panc && !btn && !ridx) rgb += rgbalt;
      
         // --- OnGetDefaultColor ---
         if(ogd) { 
            rgb += 0x2FFBFEFF; 
            var cr = (rgb>>20)-512; if(cr<0) cr = 0;
            var cg = ((rgb>>10)&1023)-512; if(cg<0) cg = 0;
            var cb = (rgb&1023)-512; if(cb<0) cb = 0;
            var c = Grids.OnGetDefaultColor(this,row,col,cr,cg,cb); 
            if(c!=null) {
               if(c-0+""==c) rgb = (c>>16<<20) + (((c>>8)&255)<<10) + (c&255) - 0xFF3FCFF;
               else rgb = this.ConvertColor(c);
               }
            else rgb -= 0x2FFBFEFF;
            }   
         
         // --- Standard cell color ---      
         if((!noclr||noclr==3) && !spc && !hdr && !ctr && !panc && !btn && !ridx && (!cur||!row.ColorCursor&&!C.ColorCursor)) {
      
            // --- Edit color ---
            if(cst&8&&noclr!=3){
               if(!cf){ rgb += Clr["NoFocus"]; rgbcls += clrprefix+"NoFocus"; }
               else if(pan||type=="Button");
               else if(!ce){ var ace = dye&&(dye==2?!spc:!fix&&C.MainSec==1)&&ce!==false?"Dynamic":""; rgb += Clr["ReadOnly"+ace]; rgbcls += clrprefix+"ReadOnly"+ace; }
               else if(ce>=2){ var ace = dye&&(dye==2?!spc:!fix&&C.MainSec==1)&&ce!=3?"Dynamic":""; rgb += Clr["Preview"+ace]; rgbcls += clrprefix+"Preview"+ace; } 
               else { var ace = dye&&(dye==2?!spc:!fix&&C.MainSec==1)&&ce!==true?"Dynamic":""; rgb += Clr["Edit"+ace]; rgbcls += clrprefix+"Edit"+ace; } 
               }
            if(cst&16 && row[col+"EFormula"]){ rgb += Clr["Formula"]; rgbcls += clrprefix+"Formula"; }
            rgb += rgbstd;
            
            // --- Selected row --
            if(rgbsel && C.CanSelect){ rgb += rgbsel; rgbcls += rgbclssel; }

            // --- Selected column ---
            if(C.Selected&&!rgbsel&&this.SelectingCols!=2&&!printsel){
               var ss = row.CanSelect; if(ss==null) ss = D.CanSelect; 
               if(ss){
                  rgb += Clr["Selected"]; 
                  if(this.SelectClass) rgbcls += clrprefix + "Selected";
                  }
               }

            // --- Selected cell ---
            if(sel){
               var ss = row[col+"Selected"]; if(ss==null) ss = D[col+"Selected"];
               if(ss){
                  rgb += Clr[sel]; 
                  if(this.SelectClass) rgbcls += clrprefix + sel;
                  }
               }
               
            // --- State color ---
            var err = row[col+"Error"]; if(err==null) err = D[col+"Error"];
            if(err && cst&32){ rgb += Clr["Error"]; rgbcls += clrprefix+"Error"; }
            else if(!nostate) {
               if(chg && cst&1 && row[col+"Changed"]-0){ rgb += Clr["ChangedCell"]; rgbcls += clrprefix+"ChangedCell"; }
               if(cst&4 && C.Deleted){ rgb += Clr["Deleted"]; rgbcls += clrprefix+"Deleted"; }
               if(cst&4 && C.Added){ rgb += Clr["Added"]; rgbcls += clrprefix+"Added"; }
               rgb += rgbstate;
               }
            }
   
         // --- Hover color ---   
         if(hov1 && col==this.ACol){ 
            var flg = this.GetFlags(row,col,"HoverCell",CCursors), spec = !this.BorderCursors; 
            var hclass = flg["class"] && !BTablet, hcolor = flg["color"]||spec;
            if(rgbhovabs) rgb = rgbhovabs;
            if(hdr){ 
               if(hcolor) rgb += Clr["HoveredCellHeader"]; if(hclass) rgbcls += clrprefix+"HoveredCellHeader"; 
               }
            else if(ridx){
               if(hcolor) rgb += Clr["HoveredCellIndex"]; if(hclass) rgbcls += clrprefix+"HoveredCellIndex"; 
               }
            else if(panc) { 
               if(this.FastPanel && !val && !C.Buttons && !BIPAD) { if(hcolor) rgb += Clr["HoveredCellFastPanel"]; if(hclass)  rgbcls += clrprefix+"HoveredCellFastPanel"; }
               else { if(hcolor) rgb += Clr["HoveredCellPanel"]; if(hclass) rgbcls += clrprefix+"HoveredCellPanel";  }
               if(!hcolor) rgb = 0;
               }
            else if(btn) { 
               var bval = ""; 
               if(!val||val=="0") bval = "";
               else if(val=="1"||val===true) bval = 1;
               else if(this.GetAttr(row,col,"List")) bval = !val || val==this.GetAttr(row,col,"EmptyValue") || !this.GetAttr(row,col,"Switch") && !this.GetAttr(row,col,"Radio") ? "" : 1;
               var st = this.GetAttr(row,col,"Button"); st = st=="Tab" ? "Tab" : (st=="Button"?"ButtonButton":"Button");
               if(hcolor && !this.GetAttr(row,col,"Disabled")) rgb += Clr["HoveredCell"+st+bval]; if(hclass && !this.GetAttr(row,col,"Disabled")) rgbcls += clrprefix+"HoveredCell"+st+bval;
               if(!hcolor) rgb = 0;
               }
            else if(spc){
               var hcls = "HoveredCellSpace";
               if(type=="Bool"){
                  var empty = this.GetAttr(row,col,"CanEmpty"); 
                  var ic = row[col+"BoolIcon"]; if(ic==null) ic = D[col+"BoolIcon"]; if(ic==null) ic = C.BoolIcon;
                  if(ic&&ic!=2) hcls = "HoveredCellSpaceBoolIcon";
                  else if(BIPAD) hcls += "Bool"+[[1,0,1],["X",0,1],[1,"X",0]][empty?empty:0][val?1:(val=="0"?0:2)];
                  else hcls += "Bool" + (val?1:(val=="0"||!empty?0:"X"));
                  }
               else if(col=="Panel") hcls = "HoveredCellSpaceBoolIcon";
               else hcls += this.GetAttr(row,col,"Button")=="Defaults" ? "Defaults" : (ce&&type!="Radio"?"Edit":(type=="Html"?"Html":""));
               if(hcolor) rgb += Clr[hcls]; 
               if(hclass) rgbcls += clrprefix+hcls;
               }
            else if(!cf) { if(hcolor) rgb += Clr["HoveredCellNoFocus"]; if(hclass) rgbcls += clrprefix+"HoveredCellNoFocus"; }
            else if(!ce) { if(hcolor) rgb += Clr["HoveredCellReadOnly"];if(hclass) rgbcls += clrprefix+"HoveredCellReadOnly"; }
            else { if(hcolor) rgb += Clr["HoveredCell"]; if(hclass) rgbcls += clrprefix+"HoveredCell"; }
            }
         else if(!panc) { if(rgbhovabs) rgb = rgbhovabs; rgb += rgbhov; }

         // --- ColorCursor ---
         if(cur){
            if(C.ColorCursor) { rgb = Clr["DefaultRow"]; if(cur&16) rgbcls += clrprefix+"DefaultRow"; }
            if(row.ColorCursor) { rgb = Clr["DefaultCol"]; if(cur&16) rgbcls += clrprefix+"DefaultCol"; }
            if(cur&1 && C.ColorCursor&1 && hov){ rgb += Clr["HoveredRow"]; if(cur&16) rgbcls += clrprefix+"HoveredRow"; }
            if(cur&1 && row.ColorCursor&1 && col==this.ACol){ rgb += Clr["HoveredCol"]; if(cur&16) rgbcls += clrprefix+"HoveredCol"; }
            if(cur&2 && C.ColorCursor&2 && row.Focused){ rgb += Clr["FocusedRow"]; if(cur&16) rgbcls += clrprefix+"FocusedRow"; }
            if(cur&2 && row.ColorCursor&2 && C.Focused){ rgb += Clr["FocusedCol"]; if(cur&16) rgbcls += clrprefix+"FocusedCol"; }
            if(cur&4 && C.ColorCursor&4 && foc){ rgb += Clr["EditedRow"]; if(cur&16) rgbcls += clrprefix+"EditedRow"; }
            if(cur&4 && row.ColorCursor&4 && col==this.FCol){ rgb += Clr["EditedCol"]; if(cur&16) rgbcls += clrprefix+"EditedCol"; }
            if(cur&8 && C.ColorCursor&8 && (row.Selected&2||row.Selected==1&&this.SelectingCells<3)){ rgb += Clr["SelectedRow"]; if(cur&16) rgbcls += clrprefix+"SelectedRow"; }
            if(cur&8 && row.ColorCursor&8 && C.SelectedCells){ rgb += Clr["SelectedCol"]; if(cur&16) rgbcls += clrprefix+"SelectedCol"; }
            }
            
         // --- Background color ---
         if(simple1){
            var bck = row[col+"Background"]; if(bck==null){ bck = D[col+"Background"]; if(bck==null && !hdr && !ctr && !btn) bck = C.Background; if(bck==null && !panc && !btn) bck = bckdef; }
            if(bck) rgb = this.ConvertColor(bck);
            }
         
         // --- Search color ---
         if(mark){
            if(mark==2){
               if(row.MarkColor) rgb = row.MarkColor;
               if(row[col+"MarkColor"]) rgb = row[col+"MarkColor"];
               }
            else {
               if(row.MarkColor) rgb += row.MarkColor;
               if(row[col+"MarkColor"]) rgb += row[col+"MarkColor"];
               }
            if(this.SearchClass) {
               var tmpmc = row.MarkClass; if(tmpmc) rgbcls += clrprefix+tmpmc;
               tmpmc = row[col+"MarkClass"]; if(tmpmc) rgbcls += clrprefix+tmpmc;
               }
            }
            
         // --- Absolute colors ---   
         if(foc && col==this.FCol && !this.FocusWholeRow) { 
            var flg = this.GetFlags(row,col,"FocusCell",CCursors), spcadd = "";
            if(spc) spcadd = type=="Bool" ?  "Bool" : (this.GetAttr(row,col,"Button")=="Defaults" ? "Defaults" : (ce&&type!="Radio"?"Edit":""));
            if(flg["color"]||!this.BorderCursors) rgb = Clr[this.EditMode?ce==2?"ViewedCell":"EditedCell":(this.FRect?"FocusedCellRect":"FocusedCell"+(hdr?"Header":(btn?"Button":(spc?"Space"+spcadd:(this.BorderCursors?(this.FocusRect&8?"Relative":""):"Safari")))))] + (this.FocusRect&8?rgb-Clr["Default"]:0); 
            if(flg["class"]) rgbcls += clrprefix+"FocusedCell"+(hdr?"Header":(btn?"Button":(spc?"Space"+spcadd:(this.FRect?"Rect":this.FocusRect&8?"Relative":"")))); 
            }
               
         // --- Finish Color ---
         rgb += 0x2FFBFEFF; 
         var cr = (rgb>>20)-512; if(cr<0) cr = 0; else if(cr>255) cr = 255;
         var cg = ((rgb>>10)&1023)-512; if(cg<0) cg = 0; else if(cg>255) cg = 255;
         var cb = (rgb&1023)-512; if(cb<0) cb = 0; else if(cb>255) cb = 255;
         rgb = cr==255&&cg==255&&cb==255 ? "" : "rgb("+cr+","+cg+","+cb+")";
         if(ogc) { var tmp = Grids.OnGetColor(this,row,col,cr,cg,cb,0); if(tmp!=null) rgb = tmp; }
         
         if(rgb) clr = " style='background-color:"+rgb+";'";
         }
      ME.Color;
      if(em&&col==this.ECol&&(!this.Edit||!this.Edit.Inline)&&(!BTablet||!row.Tag)) rgbcls += prefix+"HiddenValue";

      if(Opt==5) {
         A[A.length] = rgbcls;
         A[A.length] = rgb;
         MS.ColSpan; if(rspn) { var spn = row[col+"Span"]; if(spn>1) i+=spn-1; }  ME.ColSpan;   
         continue;
         }   
   
      var wcls = "", aalign = "", avalign = "", rot = 0, wrap = null, styl = "", styl4 = Opt==4 ? [] : null, indent = 0, pat = ""; 

      var vis = row[col+"Visible"]; if(vis==null) vis = D[col+"Visible"];
      
      if(print){
         if(!C.Visible && C.ZalPrint==1 && !Cell && !spc) vis = 0; 
         var prn = row[col+"CanPrint"]; if(prn==null) prn = D[col+"CanPrint"];
         if(prn=="0") { if(!vis || vis>0) vis = -1; }
         else if(prn==2) { if(vis==0||vis==-1) vis = 1; }
         if(rsphid) { vis = -1; ccls += prefix + "CellHHidden"+(rsphid&4?"First":"")+(rsphid&2?"Last":""); }
         if(!(vis<=0) && this.PrintHPage){
            prn = row[col+"PrintHPage"]; if(prn==null) prn = D[col+"PrintHPage"];
            if(prn>=this.PrintHPageCount) prn = this.PrintHPageCount;
            if(prn && prn!=this.PrintHPage) vis = -1; 
            }
         }
      MS.Group; if(gt && vis==null && this.GroupTreeCols[col]) vis = -1; ME.Group;
      MS.Filter; if(flt&&!C.CanFilter&&vis!=1&&col!="Panel"&&!ridx) vis = -1; ME.Filter;
      if(vis<=0) {
         if(type=="Icon"&&vis==0) vis = -1;
         type = "Hidden";
         if(vis==-2) ccls += prefix + "CellHidden";
         }
      
      var cin = "", link = null, cini, fltcin = null, linkend;
      if(simple1){

         link = row[col+"Link"]; if(link==null) { link = D[col+"Link"]; if(link==null&&!hdr&&!ctr) link = C.Link; }
         if(link || link=='0') {
            var win = this.GetAttr(row,col,"LinkTarget"); if(win==null) win = this.LinkTarget;
            var bas = this.GetAttr(row,col,"LinkBase"); if(bas==null) bas = this.LinkBase;
            link = "<a href='"+(bas&&(link+"").indexOf("://")<0?bas:"")+L.Escape(link)+"'"+(win?" target='"+win+"'":"")+">" + (BIEA?"<span>":""); linkend = BIEA ? "</span></a>" : "</a>"; 
            }

         cin = row[col+"ClassInner"]; if(cin==null) cin = D[col+"ClassInner"]; if(cin==null&&!hdr&&!ctr) cin = C.ClassInner; if(cin==null) cin = rclsin; 
         if(flt&&I.FilterInnerMBPWidth&&cin==null&&!ridx&&!pan&&type!="Bool"&&type!="Radio"&&!C.ConstWidth&&!row[col+"GanttHeader"]) { 
            cin = prefix+"FilterInner"; fltcin = 1; 
            }
         if(cin) { cini = this.GetAttr(row,col,"ClassInnerIcon",fltcin?1:0,1); if(cini) row[col+"ClsInIcon"] = I.Style+"#"+I.Size; }
         }

      if(simple1 && dys!=0 && vis!=-2){
         var cnostyle = C.NoStyle || dys==1&&(C.MainSec!=1||fix);
         if(cnostyle!=3) {

            wrap = row[col+"Wrap"]; if(wrap==null) { wrap = D[col+"Wrap"]; if(wrap==null&&!cnostyle) wrap = rwrap; if(wrap==null&&!rnostyle) wrap = C.Wrap; }
            if(ogcs) { var tmp = Grids.OnGetCellStyle(this,row,col,"Wrap",wrap); if(tmp!=null) wrap = tmp; }
            if(wrap!=null) wcls += prefix + (wrap?"Wrap"+wrap:"Wrap0");
         
            aalign = row[col+"Align"]; if(aalign==null) { aalign = D[col+"Align"]; if(aalign==null&&!cnostyle) aalign = ralign; if(aalign==null&&!rnostyle) aalign = C.Align; }
            if(ogcs) { var tmp = Grids.OnGetCellStyle(this,row,col,"Align",aalign); if(tmp!=null) aalign = tmp; }
            if(aalign) { 
               var oalign = aalign;
               aalign = CAlignTypes[aalign];
               if(aalign && aalign!="Scroll") wcls += prefix+"Align"+aalign;
               }
            avalign = row[col+"VertAlign"]; if(avalign==null) { avalign = D[col+"VertAlign"]; if(avalign==null&&!cnostyle) avalign = rvalign; if(avalign==null&&!rnostyle) avalign = C.VertAlign; }
            if(avalign==null&&col!="V") { avalign = row[col+"VAlign"]; if(avalign==null) { avalign = D[col+"VAlign"]; if(avalign==null&&!rnostyle) avalign = C.VAlign; } }
            if(ogcs) { var tmp = Grids.OnGetCellStyle(this,row,col,"VertAlign",avalign); if(tmp!=null) avalign = tmp; }
            if(avalign){
               avalign = CVertAlignTypes[avalign];
               if(type=="Gantt"||type=="Abs") avalign = "";
               if(avalign && !spc) ccls += prefix+"VAlign"+avalign;
               }

            MS.Rotate;
            rot = row[col+"Rotate"]; if(rot==null) { rot = D[col+"Rotate"]; if(rot==null&&!cnostyle) rot = rrot; if(rot==null&&!rnostyle) rot = C.Rotate; }
            if(ogcs) { var tmp = Grids.OnGetCellStyle(this,row,col,"Rotate",rot); if(tmp!=null) rot = tmp; }
            ME.Rotate;

            var innerdiv = 0;
            
            }
         }
      
      if(flt) { var fltop = row[col+"Filter"]; wcls += " "+prefix+"Filter"+(fltop&&this.Filtered?fltop:0)+"Value"; }

      var but = null, ico = null, buti = "", icoi = "", ialign = null;
      MS.SideButton;
      if(simple&4 && !(vis<0) && (!spc||vis!=0)){
         var cbut = col+"Button"; but = row[cbut]; if(but==null){ but = D[cbut]; if(but==null) but = C.Button; }
         var cico = col+"Icon";   ico = row[cico]; if(ico==null){ ico = D[cico]; if(ico==null) ico = C.Icon; }
         if(type=="Button") { but = null; if(flt) type = "Text"; }
         if(type=="Icon" && !ico) ico = val; 
         if(but) {
            if(but=="None") but = ""; 
            else if(CButtonTypes[but]){
               var balign = "Right"; if(spc) { balign = CAlignTypes[Get(row,col+"ButtonAlign")]; if(!balign) balign = "Right"; }
               but = this.GetButtonClass(row,col,but,ce,balign)
               
               }
            else { 
               var bw = spc?Get(row,col+"ButtonWidth"):"";
               var buti = (but=="Empty" ? "" : "background-image:url("+(esc?'"'+L.Escape(but)+'"':but)+");") + (bw ? "padding-right:"+bw+"px;" : "");
               but = "IconRight";
               }
            }
         else if(ce && type=="Date" && but==null && ico!="Date" && !this.AutoCalendar && !this.PrintNoIcons && !fltcin) but = "DateRight";
         else if(type=="File" && but==null && ico!="File" && !this.PrintNoIcons && (!BIEA||BIEA10)) but = "FileRight";
         if(ico){ 
            if(ico=="None") ico = ""; 
            else {
               ialign = row[col+"IconAlign"]; if(ialign==null) { ialign = D[col+"IconAlign"]; if(ialign==null) ialign = C.IconAlign; }
               ialign = ialign ? CAlignTypes[ialign] : (type=="Icon" ? (aalign ? aalign : "Center") : (rtl?"Right":"Left"));
               if(CButtonTypes[ico]) {
                  ico = this.GetButtonClass(row,col,ico,ce,ialign);
                  
                  }
               else {
                  if(val && val!="0"){
                     var cico = col+"IconChecked", ico2 = row[cico]; if(ico2==null){ ico2 = D[cico]; if(ico2==null) ico2 = C.IconChecked; }
                     if(ico2) ico = ico2;
                     }
                  var iw = this.GetAttr(row,col,"IconWidth");
                  if(!ialign && type=="Icon") ialign = aalign;
                  icoi = (ico=="Empty" ? "" : "background-image:url("+(esc?'"'+L.Escape(ico)+'"':ico)+");") + (iw?"padding-"+(ialign=="Left"?"left" : "right")+":"+iw+"px;":"");
                  ico = "Icon"+ialign;
                  }
               }
            }
         else if(ce && type=="Enum" && ico==null && but!="Enum" && !this.PrintNoIcons) {
            var ialign = row[col+"IconAlign"]; if(ialign==null) { ialign = D[col+"IconAlign"]; if(ialign==null) ialign = C.IconAlign; }
            ico = CAlignTypes[ialign]=="Right" ? "EnumRight" : "EnumLeft";
            
            ialign = ico=="EnumLeft" ? "Left" : "Right";
            }
         else if(type=="File" && ico==null && but!="Clear" && val && !this.PrintNoIcons) { ico = "ClearLeft"; ialign = "Left"; }
         else if(fltcin && ce && type=="Date" && but==null && ico!="Date" && !this.AutoCalendar && !this.PrintNoIcons) { ico = "DateRight"; ialign = "Right"; }
         }
      ME.SideButton;
         
      var typecls = "Type"+prefix+type, over = 0, f = null, autoright = 0;
      if(ogh){
         var v = Grids.OnGetHtmlValue(this,row,col,val);
         if(v!=null){ 
            if(typeof(v)=="object"){
               if(v[0]!=null) val = v[0];
               if(v[1]!=null) { type = v[1]; typecls = "Type"+prefix+type; }
               if(v[2]!=null) f = v[2];
               }
            else {
               val = v; type = "Html"; 
               }
            }
         }

      if(simple&8) switch(type){
         case "Auto":
         case "Int":
         case "Float":
         case "Date" :
            
            if(f==null) f = row[col+"Format"]; if(f==null){ f = D[col+"Format"]; if(f==null&&C.NoFormat!=2) { f = row.Format; if(f==null) f = D.Format; } if(f==null) f = C.Format; }
            if(ogf) { var tmp = Grids.OnGetFormat(this,row,col,f); if(tmp!=null) f = tmp; }
            if(f&&f.charCodeAt(0)==123) { val = L.FormatString(val,f); f = null; }
            if(f=="!"){
               if(val===0||val===1) {
                  val = this.Lang.FormulaConstants[val?"true":"false"].toUpperCase(); 
                  if(!aalign) { wcls += prefix+"AlignCenter"; aalign = "Center"; }
                  }
               f = null;
               }
            if(hidez && val=="0" && type!="Date") val = "";
            if(!val && val!="0" || flt && val===String.fromCharCode(160)) { 
               if(val!=null&&!isFinite(val)) val = L.NaN;
               else {
                  val = row[col+"EmptyValue"]; if(val==null) { val = D[col+"EmptyValue"]; if(val==null) val = C.EmptyValue; } 
                  if(val==null) val = "";
                  }
               }
            else if(type=="Auto"&&typeof(val)=="string"&&val.charAt(0)==L.TextPrefix) {
               val = val.slice(1); typecls = "Type"+prefix+"Text"; val = L.FormatString(val,null,1);
               }
            else if(f=="@"){
               typecls = "Type"+prefix+"Text"; val = L.FormatString(val,null,1);
               }
            else { 
               var range = row[col+"Range"]; if(range==null) { range = D[col+"Range"]; if(range==null) range = C.Range; }
               if(type=="Date"||type=="Auto"&&f&&L.IsDate(f)){ 
                  if(type=="Auto") { 
                     if(val-0||val=="0") { autoright = 1; typecls = "Type"+prefix+"Date"; if(indent&&!aalign) wcls = wcls.replace("IndentLeft","IndentRight"); } 
                     else typecls = "Type"+prefix+"Text";
                     }
                  var gmn = row[col+"GMT"]; if(gmn==null){ gmn = D[col+"GMT"]; if(gmn==null) gmn = C.GMT; }
                  if(gmn!=null){
                     var gmt = L.GMT; L.GMT = gmn;
                     val = L.DateToString(val,f,range?2:0,0,type=="Auto"?1:2); 
                     L.GMT = gmt;
                     }
                  else val = L.DateToString(val,f,range?2:0,0,type=="Auto"?1:2); 
                  }
               else if(!f&&!range&&(type=="Auto"?!L.IsExactNumber(val):!(val-0)&&val!="0")) { 
                  if(type=="Auto") { typecls = "Type"+prefix+"Text"; val = L.FormatString(val,null,1,range); }
                  else val = L.NaN;
                  }
               else { 
                  if(type=="Auto") { 
                     if(val-0||val=="0") { autoright = 1; typecls = "Type"+prefix+"Float"; if(indent&&!aalign) wcls = wcls.replace("IndentLeft","IndentRight"); } 
                     else typecls = "Type"+prefix+"Text";
                     }
                  if(this.RoundNumbers&&!range&&val-0&&this.RoundNumbers&(f?2:1)) {
                     var dig = this.RoundNumbersDigits;
                     if(this.RoundNumbers&4){ dig -= Math.floor(Math.LOG10E*Math.log(val))+1; if(!dig||dig<0) dig = 0; }
                     val = Math.round(val*CRoundNumbers[dig])/CRoundNumbers[dig];
                     }
                  val = L.NumberToString(val,f,range?2:0,0,type=="Auto");
                  }
               }
            if(trans) val = this.Translate(row,col,val,type);
            if(!val) { val = CNBSP; over = 1; }
            else {
               if(type=="Auto") {
                  if(typeof(val)=="string"){
                     if(val.indexOf("&")>=0) val = val.replace(/&lt;/g,"<").replace(/&amp;/g,"&");
                     if(wbr&&!wrap) val = val.replace(/<br\s*\/?>/gi,CNBSP);
                     if(val.indexOf("</a>")>=0) val = this.UpdateHtmlLink(row,col,val);
                     else if(this.OverlayImg>1 && !spc && val.indexOf("<img")>=0 && val.search(this.OverlayImg==2?(/^\s*<img[^>]*>(\s*<\/img>)?\s*$/):this.OverlayImg==3?(/^(\s*<img[^>]*>(\s*<\/img>)?\s*)+$/):(/<img[^>]*>/))>=0) { typecls += prefix+"OverlayImg"; ccls += prefix+"CellOverlayImg"; }
                     var v = row[col+"TextImg"]; if(v==null) v = D[col+"TextImg"]; if(v==null) v = C.TextImg; if(v&4) typecls += prefix+"CutImg";
                     if(val.search(/[<&]/)>=0) val = val.replace(CRepAmp,"&amp;").replace(CRepLt,"&lt;"); 
                     }
                  }
               else if(this.NoFormatEscape=="0" && f) val = L.Escape(val);
               if(link) val = link+val+linkend;
               }
            if(maxall&&!rot) val = maxpre+val+maxpo;
            break;
         case "Text" :
         case "Lines" :
            if(f==null) f = row[col+"Format"]; if(f==null){ f = D[col+"Format"]; if(f==null&&C.NoFormat!=2) { f = row.Format; if(f==null) f = D.Format; } if(f==null) f = C.Format; }
            if(ogf) { var tmp = Grids.OnGetFormat(this,row,col,f); if(tmp!=null) f = tmp; }
            if(!val && val!="0" || flt && val===String.fromCharCode(160)) { 
               if(val!=null&&!isFinite(val)) val = L.NaN;
               else {
                  val = row[col+"EmptyValue"]; if(val==null) { val = D[col+"EmptyValue"]; if(val==null) val = C.EmptyValue; } 
                  if(val==null) val = f ? L.FormatString("",f,(type=="Lines"?this.NoFormatEscape!="0":this.NoFormatEscape)?1:2) : "";
                  }
               if(trans) val = this.Translate(row,col,val,type);
               }
            else if(f) {
               var range = row[col+"Range"]; if(range==null) { range = D[col+"Range"]; if(range==null) range = C.Range; }
               val = L.FormatString(val,f,(type=="Lines"?this.NoFormatEscape!="0":this.NoFormatEscape)?1:2,range);
               if(trans) val = this.Translate(row,col,val,type);
               }
            else if(typeof(val)=="string"){ 
               if(trans) val = this.Translate(row,col,val,type);
               if(val.search(L.CSearchEscape1)>=0) val = val.replace(L.CReplaceAmp,"&amp;").replace(L.CReplaceLt,"&lt;");
               if(val.indexOf(" ")>=0) val = val.replace(L.CReplaceWhite,CNBSP);
               if(val.indexOf("\n")>=0) val = val.replace(/\r?\n/g,type=="Lines"&&(!wbr||wrap!="0")?"<br/>":CNBSP);
               }
            else if(!val && row[col]==null){ 
               var tt = D[col+"Type"]; if(tt==null) tt = C.Type;
               val = CAlignRight[tt] ? "" : "0";
               }
            else val += "";
            if(!val) { val = CNBSP; over = 1; }
            else if(link) val = link+val+linkend;
            if((maxall||type=="Lines")&&!rot) val = maxpre+val+maxpo;
            break;
         case "Html":
         case "EHtml":
            if(f==null) f = row[col+"Format"]; if(f==null){ f = D[col+"Format"]; if(f==null&&C.NoFormat!=2) { f = row.Format; if(f==null) f = D.Format; } if(f==null) f = C.Format; }
            if(ogf) { var tmp = Grids.OnGetFormat(this,row,col,f); if(tmp!=null) f = tmp; }
            if(f) {
               var ff = this.Formats[f]; 
               if(!ff){ ff = FromJSON(f,1); this.Formats[f] = ff; }
               ff = ff[!val&&val!==0?"":val];
               if(ff!=null) val = ff;
               }
            if(typeof(val)=="string"){ 
               if(val==0&&(val==""||val==" "||val.search(L.CSearchWhite)>=0)) { val = CNBSP; over = 1; } 
               else if(L.ValueSeparator!=L.ValueSeparatorHtml){
                  var range = row[col+"Range"]; if(range==null) { range = D[col+"Range"]; if(range==null) range = C.Range; }
                  if(range) val = val.replace(new RegExp(ToRegExp(L.ValueSeparator),"g"),L.ValueSeparatorHtml);
                  }
               }
            else if(val==null) { val = CNBSP; over = 1; }
            else if(!val && row[col]==null){ 
               var tt = D[col+"Type"]; if(tt==null) tt = C.Type;
               val = CAlignRight[tt] ? CNBSP : "0";
               }
            else if(!isFinite(val)) val = L.NaN;
            else val += ""; 
            if(val==CNBSP) { val = row[col+"EmptyValue"]; if(val==null) { val = D[col+"EmptyValue"]; if(val==null) val = C.EmptyValue; if(!val) val = CNBSP; } }
            if(trans) val = this.Translate(row,col,val,type);
            if(val.indexOf("</a>")>=0) val = this.UpdateHtmlLink(row,col,val);
            else if(this.OverlayImg>1 && !spc && val.indexOf("<img")>=0 && val.search(this.OverlayImg==2?(/^\s*<img[^>]*>(\s*<\/img>)?\s*$/):this.OverlayImg==3?(/^(\s*<img[^>]*>(\s*<\/img>)?\s*)+$/):(/<img[^>]*>/))>=0) { typecls += prefix+"OverlayImg"; ccls += prefix+"CellOverlayImg"; }
            var v = row[col+"TextImg"]; if(v==null) v = D[col+"TextImg"]; if(v==null) v = C.TextImg; if(v&4) typecls += prefix+"CutImg";
            if(type=="EHtml") val = val.replace(L.CReplaceWhite,CNBSP).replace(L.CReplaceCR,"<br/>");
            if(wbr&&wrap=="0") val = val.replace(/<br\s*\/?>/gi,CNBSP);
            if(val.search(/[<&]/)>=0) val = val.replace(CRepAmp,"&amp;").replace(CRepLt,"&lt;"); 
            if(link && val!=CNBSP) val = link+val+linkend;
            if(!rot) val = maxpre+val+maxpo;
            if(but&&but=="DefaultsRight"&&this.GetAttr(row,col,"IsSelect")) typecls = "Type"+prefix+"Select";
            
            if(row[col+"TypeClass"]) typecls = "Type"+prefix+row[col+"TypeClass"];
            if(row[col+"GanttHeader"]) wcls += prefix+"GanttHeader";
            break;
         case "Bool" :
            var ic = row[col+"BoolIcon"]; if(ic==null) ic = D[col+"BoolIcon"]; if(ic==null) ic = C.BoolIcon;
            var empty = !val&&val!="0" && this.GetAttr(row,col,"CanEmpty");
             if(this.PrintingCheckboxes || (ic&6)==4&&!flt) val = "<input"+(BIPAD?" onclick='TGCancelEvent(event,2);'":"")+" type='"+(ic&1?"radio":"checkbox")+"' "+(this.PrintingCheckboxes||!ce?"disabled"+CXHTML:"")+(val-0?" checked"+CXHTML:"")+" class='"+prefix+"BoolInput"+(spc?"Space":"")+"' >";
            else if(ic&&!(ic-0)) {
               ic = ic.slice(1).split(ic.charAt(0));
               var icw = row[col+"BoolIconWidth"]; if(icw==null) icw = D[col+"BoolIconWidth"]; if(icw==null) icw = C.BoolIconWidth;
               val = empty?2:(val?1:0); val = (!ce&&ic[val+3]?ic[val+3]:ic[val]); if(esc) val = '"'+L.Escape(val)+'"';
               val = "<u class='"+prefix+"BoolImage"+(spc?"Space":"")+prefix+"BoolIcon"+(spc?"Space":"")+"' style='background-image:url("+val+");"+(icw?"width:"+icw+"px;":"")+"'></u>";
               }
             else if(ic==6) { val = empty?2:(val?1:0); val = "<div class='"+prefix+"BoolChar"+prefix+"BoolChar"+val+(ce?"":"RO")+(BIE?prefix+"BoolCharIE":"")+"'>"+this.BoolChars.charAt(val)+"</div>"; }
            else if(BIEA6 || (ic&6)==2 || ico || (aalign||avalign||cin)&&!hdr || Opt==9) val = "<u class='"+prefix+"BoolImage"+(spc?"Space":"")+prefix+"Bool"+(ic&1?(val?3:2):(empty?"X":(val?1:0)))+(spc?"Space":"")+(ce?"":"RO")+"'></u>";
            else { typecls += (ic&1?(val?3:2):(empty?"X":(val?1:0)))+(spc?"Space":"")+(ce?"":"RO")+prefix+"BoolBase"+(spc?"Space":""); val = spc?"":CNBSP; }
            if(maxall&&!rot) val = maxpre+val+maxpo;
            break;
         case "Enum" : 
            MS.Enum;
            val = this.GetEnumString(row,col,this.NoFormatEscape!="0"?1:2);
            if(trans) val = this.Translate(row,col,val,type);
            if(!val || val==" ") { val = CNBSP; over = 1; }
            if(link && !ce && val!=CNBSP) val = link+val+linkend;
            if(maxall&&!rot) val = maxpre+val+maxpo;
            break;
            MX.Enum;
            val = "Module 'Enum' is not available";
            break;
            ME.Enum;
         case "Panel" :             
            MS.Panel;
            ico = ""; 
            var rpanc = rpan&&C.Type!="Panel";
            
            if(!val) { if(rpanc){ val = row.Buttons; if(val==null) val = D.Buttons; } else val = C.Buttons; }
            if(!val && (!this.FastPanel || hdr || Opt==1 || BTablet || avalign || rpan || rot) && !spc && !flt) { 
               if(rpanc) val = "";
               else if(hdr) val = (C.Move!=0?"Empty,":"")+(C.Select!=0?(row.CanSelect?"SelectAll,":"Empty,"):"")+(C.Delete!=0?(row.CanDelete?"DeleteAll,":"Empty,"):"")+(C.Copy!=0?(row.CanCopy?"CopyAll,":"Empty,"):""); 
               else val = (C.Move!=0?"Move,":"")+(C.Select!=0?"Select,":"")+(C.Delete!=0?"Delete,":"")+(C.Copy!=0?"Copy,":""); 
               val = val ? val.slice(0,-1) : "Empty"; 
               }
            
            if(val) {
               typecls = ""; val = this.GetPanelHTML(row,col,val); if(!val){ val = CNBSP; over = 1; typecls = "Space"; }
               
               break;
               }
            
            MS.Filter;
            if(flt){
               if(!this.Filtering || vis<=0){ typecls = "Empty"; val = CNBSP; }
               else { typecls = ""; val = "<u class='"+prefix+"Filter"+(this.Filtered?1:0)+"'></u>"; }
               if(maxall&&!rot) val = maxpre+val+maxpo;
               break;
               }
            ME.Filter;   

            MS.Space;
            if(spc){
               var P = this.Cols.Panel;
               if(!P.Visible && row["PanelVisible"]!=2){ type = "Hidden"; typecls = type; break; }
               var spw = "PSpace"+(P.IconCount&&P.VPos<=1?P.IconCount:2);
               var w = Get(row,col+"Width"); w = w ? " style='width:"+w+"px'" : "";
               if(row.Kind=="Group") val = "<u class='"+prefix+"Group"+(this.Grouped?1:0)+prefix+spw+"'"+w+"></u>";
               else if(row.Kind=="Search") val = "<u class='"+prefix+"Search"+(this.Searched?1:0)+prefix+spw+"'"+w+"></u>";
               else val = CNBSP;
               typecls = spw;
               if(BFF3&&!BFF20) typecls += prefix+"CellBorderFF3";
               if(maxall&&!rot) val = maxpre+val+maxpo;
               break;
               }    
            ME.Space;   

 typecls = "P" 
               + (!this.Dragging  || !C.Move   ? 'x' : (Is(row,"CanDrag")   ? '1' : '0')) 
               + (!this.Selecting || !C.Select ? 'x' : (this.CanSelect(row) ? (row.Selected&1||row.Selected==2&&C.Select!=2&&this.SelectingCells<3?'2':'1') : '0'))
               + (!this.Deleting  || !C.Delete ? 'x' : (Is(row,"CanDelete") ? '1' : '0'))
               + (!this.Copying   || !C.Copy   ? 'x' : (Is(row,"CanCopy")   ? '1' : '0'));
            ccls += prefix+"FastPanel"+prefix+"P"+(this.Dragging&&C.Move?'M':'')+(this.Selecting&&C.Select?'S':'')+(this.Deleting&&C.Delete?'D':'')+(this.Copying&&C.Copy?'C':'');
            val = CNBSP; over = 1;
            if(maxall&&!rot) val = maxpre+val+maxpo;
            ME.Panel;
            break;

         case "Abs":
         case "Gantt":
            if(!val || this.GanttUpdate){ val = CNBSP; break; }
            val = this.GetGanttHTML(row,col,val,type);
            if(type=="Gantt") typecls += " "+this.Img.GanttStyle+"Gantt"+(C.GanttShowBorder?"":prefix+"GanttNoBorder");
            break;
         case "Img" :
            MS.Img;
            val = this.GetImgHTML(row,col,val,ce);
            if(link) val = link+val+linkend;   
            if(!rot) val = maxpre+val+maxpo;
            break;
            MX.Img;
            val = "Module 'Img' is not available";
            break;
            ME.Img;
         case "Link" :
            MS.Img;
            val = this.GetLinkHTML(row,col,val,ce);
            if(maxall&&!rot) val = maxpre+val+maxpo;   
            break;
            MX.Img;
            val = "Module 'Img' is not available";
            break;
            ME.Img;
         case "Radio" :
            MS.Radio;
            val = this.GetRadioHTML(row,col,val,ce,wrap,aalign);
            if(!rot) val = maxpre+val+maxpo;   
            break;
            MX.Radio;
            val = "Module 'Radio' is not available";
            break;
            ME.Radio; 
         case "List" :
            MS.List;
            val = this.GetListHTML(row,col,val);
            if(BIEA&&val.indexOf("<a")>=0) val = val.replace(/(<a[^>]*>)(\s*[^<].*?)(<\/a>)/g,"$1<span>$2</span>$3"); 
            if(!val) { val = CNBSP; over = 1; }
            else if(link) val = link+val+linkend;
            if(!rot) val = maxpre+val+maxpo;   
            ME.List;         
            break;
         case "Pass":
            val = this.GetText("Password"); 
            if(maxall&&!rot) val = maxpre+val+maxpo;
            break;
         case "Button":
            MS.Button;
            var bt = this.GetAttr(row,col,"Button"), txt, chk = "";
            var st = this.GetAttr(row,col,"Style"); if(!st) st = "Tool";
            if(!val||val=="0") { txt = this.GetAttr(row,col,"ButtonText"); if(!txt) txt = txt=="0" ? "0" : ""; }
            else if(val-0&&this.GetAttr(row,col,"Switch")==2){ chk = val-0; txt = this.GetAttr(row,col,"ButtonText"+chk); if(txt==null) txt = this.GetAttr(row,col,"ButtonText"); if(!txt) txt = txt=="0" ? "0" : ""; }
            else if(val=="1"||val===true) { chk = 1; txt = this.GetAttr(row,col,"ButtonTextChecked"); if(txt==null) txt = this.GetAttr(row,col,"ButtonText"); if(!txt) txt = txt=="0" ? "0" : ""; }
            else txt = val; 
            if(trans) txt = this.Translate(row,col,txt,type);
            if(txt&&(txt+"").search(/[<&]/)>=0) txt = txt.replace(CRepAmp,"&amp;").replace(CRepLt,"&lt;"); 
            var uclr = this.GetAttr(row,col,"Underline"), iw = null, emptytxt = 0; if(bt=="Class") iw = this.GetAttr(row,col,"IconWidth");

            if(!txt&&ico){
               var icc = this.GetAttr(row,col,"Icon");
               if(icc && ((icc+"").indexOf('<')>=0||(icc+"").search(/[\.\/]/)<0)){ 
                  var icc1 = chk?Get(row,col+"IconChecked"):null; 
                  txt = icc1 ? icc1 : icc;
                  ico = ""; icoi = "";
                  if(txt!=null && txt-0+""==txt){ 
                       txt = ["Save","Reload","Repaint","Add","AddChild","Sort1","Sort","Calc1","Calc","ExpandAll","CollapseAll","Cfg","Help","Columns","Resize","Print","Export","PagerFirst1","PagerFirst","PagerPrev1","PagerPrev","PagerNext1","PagerNext","PagerLast1","PagerLast"][txt];
                     typecls += prefix+"Tool"+txt+prefix+"Empty"; val = CNBSP; 
                     bt = null;
                     break;
                     } 
                  else bt = "Html";
                  }
               var cap = this.GetAttr(row,col,"Caption"); if(cap) { txt = cap; bt = "Button"; } 
               }
            
            if(bt=="Button") {   
               typecls += prefix+st+"Button"; if(hdr) wcls += prefix+"HeaderToolButton";
               var bprefix = prefix+st+(row.Space?"Space":"Button"), bcls = prefix+"GridButton"+bprefix+"Button"+chk;
               if(ico&&!(this.UseButton&1)) { 
                  if(BIE&&!txt) txt = "<div class='"+bprefix+"Empty'></div>";
                  txt = "<i class='"+prefix+ico+prefix+"Side"+ialign+bprefix+"IconInner"+(txt?"":bprefix+"Empty")+"' style='"+icoi+"'>"+(txt||!BIEA||!BStrict?txt:"&#65279;")+"</i>"; ico = ""; 
                  bcls += bprefix+"Icon"; ico = ""; icoi = Opt==4 ? " " : "";
                  }
               var wdb = this.GetAttr(row,col,"ButtonWidth"); if(wdb==null) wdb = Get(row,"ButtonWidth"); if(wdb==null) wdb = Get(row,col+"Width");
               if(wdb>=0) wdb = " style='width:"+wdb+"px' class='";
               else {
                  wdb = "";
                  var mw = Get(row,col+"MinWidth"); if(mw) wdb += "min-width:"+mw+"px;";
                  var mw = Get(row,col+"MaxWidth"); if(mw) wdb += "max-width:"+mw+"px;";
                  if(wdb) wdb = " style='"+wdb+"'";
                  wdb += " class='"+bprefix+"ButtonAuto";
                  }
               val = (this.UseButton&1?"<button":"<u")+wdb+bcls+(txt?"":bprefix+"Empty")+"'>"+txt+(this.UseButton&1?"</button>":"</u>");
               }
            else if(bt=="TabSep") { 
               typecls += prefix+st+prefix+"Empty"; if(row.Kind=="Tabber2") typecls += prefix+"TabSepNoBack"; 
               val = CNBSP; row[col+"ClassHover"] = 1; 
               } 
            else if(txt||ico||uclr!=null||iw) {   
               var shb = this.ShowButtons;
               if(!shb&&bt=="Class") txt = ""; 
               if(shb==2&&txt) { ico = ""; if(bt=="Class") bt = "Html"; }
               if(bt=="Class" || ico) {
                  if(ico){
                     if(ico.indexOf("Icon")==0) ico = "Icon";
                     else ico = ico.replace(/Left|Right|Center/,"");
                     }
                  if(shb==1||!txt) { txt = ""; ialign = (rtl?"Right":"Left"); }
                  else if(shb==3||!shb) {
                     ialign = row[col+"IconAlign"]; if(ialign==null) { ialign = D[col+"IconAlign"]; if(ialign==null&&!spc) ialign = C.IconAlign; if(ialign==null) ialign = row.IconAlign; if(ialign==null) ialign = D.IconAlign; }
                     if(!ialign) ialign = (rtl?"Right":"Left");
                     else if(CAlignTypes[ialign]) ialign = CAlignTypes[ialign];
                     else if(CVertAlignTypes[ialign]) ialign = CVertAlignTypes[ialign];
                     else ialign = (rtl?"Right":"Left");
                     }
                  else { ialign = ["Left","Right","Top","Bottom"][shb-4]; if(!ialign) ialign = (rtl?"Right":"Left"); }
                  if(!txt) typecls += prefix+st+"HtmlIconSingle";
                  if(ico) { 
                     ico += ialign; 
                     if(avalign && (ialign=="Top" || ialign=="Bottom")) ico += prefix+"Icon"+ialign+"VAlign"+avalign;
                     if(icoi && (ialign=="Top"||ialign=="Bottom")) icoi = icoi.replace(/padding-.*/,""); 
                     else if(icoi && ialign=="Right") icoi = icoi.replace("padding-left","padding-right"); 
                     }
                  if(bt=="Class") {
                     var cc = row[col+"ButtonClass"]; if(cc==null) cc = D[col+"ButtonClass"]; if(cc==null&&!hdr) cc = C.ButtonClass; if(!cc) cc = col;
                     if(avalign||cin||icoi) {
                        if(!txt) emptytxt = 1;
                        txt = "<u class='"+prefix+st+"Image"+(txt?ialign+"Text":"")+(icoi?prefix+st+"Icon"+(txt?ialign:"Single"):"")+prefix+st+(cc.indexOf(",")<0?cc:cc.replace(/,/g,chk+prefix+st))+chk+(txt?prefix+st+(cc.indexOf(",")<0?cc:cc.replace(/,/g,ialign+chk+prefix+st))+ialign+chk:"")+prefix+st+"Align"+(txt?ialign:"Single")+"'"+(icoi?" style='"+icoi+";'":"")+">"+txt+"</u>"; 
                        if(!cin) typecls += prefix+"CellSpaceTool";
                        ico = ""; icoi = Opt==4 ? " " : "";
                        }
                     else {
                        if(iw&&ialign!="Top"&&ialign!="Bottom") styl += "padding-"+(ialign=="Right"?"right":"left")+":"+iw+"px";
                        typecls += prefix+st+(cc.indexOf(",")<0?cc:cc.replace(/,/g,chk+prefix+st))+chk+(txt?prefix+st+(cc.indexOf(",")<0?cc:cc.replace(/,/g,ialign+chk+prefix+st))+ialign+chk:"")+prefix+st+"Align"+(txt?ialign:"Single");
                        }
                     }
                  }
               typecls += prefix+st+"HtmlBase"+prefix+st+"Html"+(bt=="Class"||ico?"Icon":"")+chk; 
               if(ico&&(ialign=="Left"||ialign=="Right")) typecls += prefix+st+"HtmlIcon"+ialign;
               if(this.GetAttr(row,col,"List") && bt!="Class") {
                  var pico = this.GetAttr(row,col,"PopupIcon");
                  if(!val || val==this.GetAttr(row,col,"EmptyValue") || !this.GetAttr(row,col,"Switch") && !this.GetAttr(row,col,"Radio")) { typecls = "Button"+prefix+st+"Html"+prefix+"Type"+prefix+st+"HtmlBase"; if(ico==null && pico!=0) ico = "PopupRight"; }
                  else { typecls = "Button"+prefix+st+"Html1"+prefix+"Type"+prefix+st+"HtmlBase"; if(ico==null) ico = pico==0?"":(pico>=2?"PopupRight":"PopupNone"); }
                  
                  }
               if((!txt||emptytxt) && (!spc&&avalign||cin||hdr)) {
                  if(BIEA&&BStrict) txt = "&#65279;&#65279;";
                  else typecls += prefix+st+"HtmlEmpty"+(BIE?"IE":"");
                  
                  }
               val = txt; row[col+"ClassHover"] = 1;
               if(uclr!=null) {
                  var ustyle = this.GetAttr(row,col,"UnderlineStyle"); 
                  val = "<div class='"+prefix+"ToolLineAlign"+(txt&&!emptytxt?(ialign?ialign:"Text"):"Single")+prefix+"ToolLine"+prefix+"ToolLine"+(ustyle||ustyle=="0"?ustyle:"None")+"'"
                      + " style='"+(uclr?"border-color:"+uclr:"border-bottom-style:double")+";"+(iw&&ialign&&ialign!="Top"&&ialign!="Bottom"?"margin-"+(ialign=="Right"?"right":"left")+":-"+iw+"px;"
                      + (BIE||BIEA&&!BIEA8?"margin-right:"+(iw-20)+"px;height:"+(BIE?5:0)+"px;overflow:hidden;position:relative;":""):"")+"'>"+CNBSP+"</div>" + val;
                  typecls += prefix+"HasLine";
                  }
               } 
            else if(avalign||cin){ 
               var cc = row[col+"ButtonClass"]; if(cc==null) cc = D[col+"ButtonClass"]; if(cc==null&&!hdr) cc = C.ButtonClass; if(!cc) cc = col; else if(cc.indexOf(",")>=0) cc = cc.replace(/,/g,chk+prefix+st);
               val = "<u class='"+prefix+st+"Image"+prefix+st+cc+chk+(spc&&row[col+"Width"]>0?"":prefix+st+"AlignSingle")+"'></u>"; 
               typecls += prefix+st+"HtmlIconSingle"; if(!cin) typecls += prefix+"CellSpaceTool"; 
               }
            else {            
               var cc = row[col+"ButtonClass"]; if(cc==null) cc = D[col+"ButtonClass"]; if(cc==null&&!hdr) cc = C.ButtonClass; if(!cc) cc = col; else if(cc.indexOf(",")>=0) cc = cc.replace(/,/g,chk+prefix+st);
               typecls += prefix+st+cc+chk+prefix+"Empty"+(spc&&row[col+"Width"]>0?"":prefix+st+"AlignSingle")+prefix+st+"HtmlIconSingle"; val = ""; 
               }      
            if(maxall&&!rot) val = maxpre+val+maxpo;
            if(this.GetAttr(row,col,"Disabled")-0) typecls += prefix + "DisabledButton";
            if(Get(row,col+"CanDelete")-0==2) typecls += prefix + "ButtonClose";
            break;
            MX.Button;
            val = "No module Button";
            break;
            ME.Button;
         case "DropCols" :
            MS.Group;
            val = this.GetDropColsHTML(row,col,val);
            if(maxall&&!rot) val = maxpre+val+maxpo;
            ME.Group;
            break;
         case "Pages" :
            MS.Paging;
            val = this.GetPagesHTML(row,col,wrap);
            if(maxall&&!rot) val = maxpre+val+maxpo;
            MX.Paging;
            if(!this.ShowPages) val = "Module 'Paging' not available";
            ME.Paging;
            break;
         case "Icon": 
            if(this.IsRange(row,col)){
               val = "<img src='"+val.replace(new RegExp("\\"+L.ValueSeparator,"g"),"'><img src='")+"'>";
               typecls = "Html";
               ico = ""; icoi = null;
               if(!aalign) wcls += prefix+"AlignCenter"
               if(wrap==null) wcls += prefix+"Wrap0";
               wcls += prefix+"IconRange";
               
               }
            else {
               if(link&&Opt!=1) val = "<a class='"+prefix+"IconLink'"+link.slice(2)+CNBSP+linkend;
               else { val = CNBSP; over = 1; }
               var size = this.GetAttr(row,col,"IconSize");
               if(size) typecls += prefix+"Icon"+(size==1?"Contain":size==2?"Cover":"Fill");
               }
            break;
         case "File":
            
            var O = [];
            val = this.GetFileHTML(row,col,val,but,O);
            if(O[0]) typecls += prefix+"Html";
            break;
         case "Chart":
            MS.Chart; val = this.GetChartHTML(row,col); ME.Chart;
            break;
         case "Hidden":
            val = CNBSP; over = 1;
            if(maxall&&!rot) val = maxpre+val+maxpo;
            if(spc) typecls += "Space";
            break;
         
         default :
            if(val=="" || val==null) { val = CNBSP; over = 1; }
            if(maxall&&!rot) val = maxpre+val+maxpo;
            MS.Debug; this.Debug(1,"Unknown Type '",type,"' in cell [",row.id,",",col,"]"); ME.Debug;
            break;
         }
      MS.Digits; if(L.Digits&&(val+"").search(/\d/)>=0) val = L.ConvertDigits(val,this.GetAttr(row,col,"Digits")); ME.Digits;
      
      if(ridx){
         var smallindex = 0;
         if(ctr) val = "";
         else { var h = row.Height; if(h==null) h = D.Height; if(h&&h<this.RowHeight) { smallindex = 1; wcls += prefix+"CellIndexNarrow"; val = "<div class='"+prefix+"IndexSmall'>"+val+"</div>"; } } 
         } 
      if(innerdiv&&(!val||typeof(val)!="string"||val.slice(0,4)!="<div")) val = "<div>"+val+"</div>";

      if(Opt==8 || Opt==10) return val;   

      if(hdr && !pan) wcls += prefix+"HeaderText"+prefix+"HeaderFont"+prefix+"Type"; 
      else if(ridx && !rpan) wcls += prefix+"IndexText"+prefix+"HeaderFont"+prefix+"Type"; 
      if(ico&&ialign) {
         ico += prefix+"Side"+ialign;
         if(ialign=="Right" && !maxall && val!=CNBSP && val.indexOf("<")<0) val = "<div style='overflow:hidden;'>"+val+"</div>"; 
         }

      var img = "";
      if(!(vis<=0) && simple1 && type!="Gantt") {
         if(fltcin && ico=="DateRight") val = "<div style='overflow:hidden;'>"+val+"</div>";

         var pr = row[col+"HtmlPrefix"]; if(pr==null) pr = D[col+"HtmlPrefix"]; if(pr==null) pr = rpre==null&&!hdr?C.HtmlPrefix:rpre; 
         if(pr!=null) { 
            MS.Digits; if(L.Digits&&(pr+"").search(/\d/)>=0) pr = L.ConvertDigits(pr,this.GetAttr(row,col,"Digits")); ME.Digits;
            if(val.charAt(0)=="<" && val.slice(0,4)=="<div") val = val.replace(">",">"+pr);
            else val = pr + val; 
            }
         var po = row[col+"HtmlPostfix"]; if(po==null) po = D[col+"HtmlPostfix"]; if(po==null) po = rpo==null&&!hdr?C.HtmlPostfix:rpo; 
         if(po!=null) { 
            MS.Digits; if(L.Digits&&(po+"").search(/\d/)>=0) po = L.ConvertDigits(po,this.GetAttr(row,col,"Digits")); ME.Digits;
            if(val.charAt(val.length-1)==">" && val.slice(-6)=="</div>") val = val.replace("</div>",po+"</div>");
            else val += po;
            }
         if(trans && (pr!=null||po!=null)) val = this.Translate(row,col+"Fix",val,type);

         MS.Rotate;
         if(rot && type!="DropCols"){
            if(rot==90) rot = 2; else if(rot==270) rot = 1;
            var rtyp = this.RotateType, rnum = rot==-1?"TBRL":rot==-2?"TBLR":rot==2?90:rot<=3||rtyp==2?270:rtyp==1?"Center":rot<180?45:315;
            MS.SideButton; if(but&&!ico){ ico = but; icoi = buti; ialign = balign; } ME.SideButton;
            if(val && val!=CNBSP || ico) ccls += prefix + "CellRotate" + prefix+"CellRotate"+rnum;
            if(val && val!=CNBSP) {
               var s = "";
               if(rot>3) { 
                  if(!rtyp) {
                     var R = GetTextWidth(val,I.Size,1), dh = R[0]-R[1];
                     var cos = Math.abs(Math.cos(rot/180*Math.PI)), sin = Math.abs(Math.sin(rot/180*Math.PI));
                     var nw = R[0]*cos+R[1]*sin, nh = R[0]*sin+R[1]*cos, dw = (nw-R[0])/2, dh = (nh-R[1])/2;
                     s += "margin-top:"+dh+"px;margin-bottom:"+dh+"px;margin-left:"+dw+"px;margin-right:"+dw+"px;";
                     }
                  var arot = rtyp==2 ? rot-90 : rot; arot = arot%360; if(arot<0) arot += 360;
                  s += "-ms-transform:rotate("+arot+"deg);-moz-transform:rotate("+arot+"deg);-webkit-transform:rotate("+arot+"deg);-o-transform:rotate("+arot+"deg);transform:rotate("+arot+"deg);";
                  }
               else if(max) { var mmax = max-(ico?(hdr?I.IconRotateHeader:I.IconRotate):0); s += "max-height:"+(mmax>1 ? mmax : 1)+"px;"; }
               val = "<div"+(s?" style='"+s+"'":"")+" class='"+prefix+"Rotate"+prefix+"Rotate"+rnum+"'>"+val+"</div>";
               }
            if(ico) wcls += prefix+"IconRotate";
            if(ico&&hdr) wcls += prefix+"IconRotateHeader";
            
            }
         ME.Rotate;

         if((cin || hdr&&(ico||type=="Bool") || avalign&&!pan&&!spc&&val!=CNBSP || indent) && !smallindex) {
            
 if(hdr && ico && cin && !cini){ 
               val = "<div class='"+prefix+ico+"'"+(icoi||styl?" style='"+icoi+styl+"'":"")+"><div class='"+I.Custom+(cin?cin:"")+(typecls?prefix+typecls:"")+wcls+"'>"+val+"</div></div>";
               ico = ""; icoi = Opt==4?" ":""; wcls = prefix+"CellClassInner"; over = 0;
               }
            else if(hdr || avalign && ico && !spc || cin && cini){ 
               val = "<div class='"+I.Custom+(cin?cin:"")+(spc&&!ico?prefix+"SpaceClassInner":"")+(spc&&btn&&ico?prefix+"SpaceButtonIconInner":"")+(typecls?prefix+typecls:"")+(hdr&&!cin?prefix+"HeaderIconInner":"")+wcls+(ico?prefix+ico:"")+"'"+(icoi||styl?" style='"+icoi+styl+"'":"")+">"+val+"</div>";
               wcls = prefix+"CellClassInner" + prefix+"Cell"+(hdr&&!cin?"Header":"Class")+"InnerIcon"; if(spc&&btn&&ico) wcls += prefix+"CellSpaceButtonIcon";
               ico = ""; icoi = Opt==4?" ":""; over = 0;
               }
            else {  
               val = "<div class='"+I.Custom+(cin?cin:"")+(spc?prefix+"SpaceClassInner":"")+(typecls?prefix+typecls:"")+wcls+"'"+(styl?" style='"+styl+"'":"")+">"+val+"</div>"; 
               wcls = prefix+"CellClassInner"; if(spc&&btn&&!ico) wcls += prefix+"CellSpaceTool";
               }
            typecls = ""; styl = "";
            }

         if(aalign=="Scroll"){
            var scid = "GAS"+this.id+"."+row.id+"."+col; 
            if(!this.ScrollAlign) { this.ScrollAlign = []; this.ScrollAlign[4] = {}; }
            if(!this.ScrollAlign[C.MainSec]) this.ScrollAlign[C.MainSec] = {};
            this.ScrollAlign[C.MainSec][scid] = [col,row.id]; this.ScrollAlign[4][row.id] = 1;
            val = "<span style='display:inline-block' id='"+scid+"'>"+val+"</span>"; aalign = "";
            }
         else if(aalign=="Center"&&val!=CNBSP){
            var ctr = row[col+"CenterTo"]; if(ctr==null) { ctr = D[col+"CenterTo"]; if(ctr==null&&!rnostyle) ctr = C.CenterTo; }
            if(ctr) { 
               ctr = ctr.split(","); 
               for(var n=0,w=0,cc=this.GetPrevCol(col);cc&&n<ctr[0];n++,cc=this.GetPrevCol(cc)) w -= this.Cols[cc].Width;
               for(var n=0,cc=this.GetNextCol(col);cc&&n<ctr[1];n++,cc=this.GetNextCol(cc)) w += this.Cols[cc].Width;
               wcls += prefix+"OverflowCenterTo_"+ctr[0]+"_"+ctr[1]+"_"+w;
               val = "<div style='padding-"+(w<0?"right:"+(-w):"left:"+w)+"px;'>"+val+"</div>";
               
               }
            }

          
         }
      
      if(Opt==9) return val; 
      
      MS.Space;
      if(spc){     
         var w = row[col+"Width"]; if(w==null) w = D[col+"Width"]; if(!(w>=0) && row[col+"RelWidth"]) w = 0;
         var h = row[col+"Height"]; if(h==null) h = D[col+"Height"];
         if(BSafari && w===0) w = 1; 
         var wd = "", bdef = but=="DefaultsRight";
         if(w>=0) wd = "width:"+w+"px;";
         else {
            var mw = Get(row,col+"MinWidth"); if(mw) wd += "min-width:"+mw+"px;";
            var mw = Get(row,col+"MaxWidth"); if(mw) wd += "max-width:"+mw+"px;";
            if(wrap!="0") wcls += prefix + "Wrap0"; 
            }
         if(typecls) typecls = prefix+typecls;
         if(h>0) { if(!ico) wd += "height:"+h+"px;"; else if(BIE) val = "<div style='height:"+h+"px;'>"+val+"</div>"; else icoi += "height:"+h+"px;"; }
         if(wd) wd = "<div class='"+prefix+"SpaceWidthInner' style='overflow:hidden;"+wd+"'>";
         
         var cls = rgbcls+ccls; typecls += wcls;
         if(avalign) cls += prefix+"VAlign"+avalign;
         var nospace = row[col+"NoSpace"]; if(nospace) cls += nospace=="Both" ? prefix+"NoSpaceLeft"+prefix+"NoSpaceRight" : prefix+"NoSpace"+(this.Rtl ? (nospace=="Right"?"Left":"Right") : nospace);
         var cls2 = row[col+"SpaceClass"]; if(cls2) cls += prefix+cls2;

         if(type=="Hidden") { val = ""; cls = prefix+"HiddenSpace"; }
         else if(type=="Pages") {
            var overh = I.PagesHeight+"px", overo = "auto";
            if(row.r1){ 
               var cell = this.GetCell(row,col);
               if(cell) {
                  cell = cell.lastChild;
                  overh = cell.style.height;
                  overo = cell.style.overflow;
                  }
               }
            if(wrap==null) wcls += prefix + "Wrap0"; 
            val = "<div class='"+wcls+"' style='overflow:"+overo+";overflow-y:hidden;height:"+overh+";width:"+w+"px;'>"+val+"</div>";
            cls += prefix+"CellSpacePages"+typecls;
            }
         else if(pan) cls += prefix+"CellSpacePanel"+typecls;
         else if(type=="Bool") cls += prefix+"CellSpaceBool"+typecls;
         else if(type=="Radio") cls += prefix+"CellSpaceRadio"+typecls;
         else if(type=="Button" && bt=="Button") cls += prefix+"CellSpaceButtonButton"+typecls; 
         else if(type=="Button"){ 
            if(BIE&&!val) val = "<div class='"+prefix+"ToolHtmlEmptyIE'></div>";
            if(ico) val = "<div class='"+(val?"":prefix+"ToolHtmlEmpty"+(BIE?"IE":""))+prefix+ico+prefix+"SpaceButtonIconInner'"+(icoi?" style='"+icoi+"'":"")+"><div>"+(val?val:"&#65279;")+"</div></div>";
            if(wd) val = wd+val+"</div>";
            cls += prefix+"CellSpaceButton"+(ico?"Icon":"")+typecls;
            }
         else if(!but&&!ce){ 
            if(ico) { val = "<div class='"+typecls+prefix+ico+prefix+"SpaceIconInner'"+(icoi?" style='"+icoi+"'":"")+"><div>"+val+"</div></div>"; typecls = ""; }
            if(!val||val==CNBSP) cls += prefix+"CellSpaceEmpty";
            if(wd) val = wd+(val==CNBSP?"":val)+"</div>";
            cls += prefix+"CellSpace"+(ico?"Icon":"")+typecls;
            }
         else if(but=="DefaultsRight"){ 
            if(ico) { val = "<div class='"+typecls+prefix+ico+prefix+"SpaceSelectIconInner'"+(icoi?" style='"+icoi+"'":"")+"><div>"+val+"</div></div>"; typecls = ""; }
            if(wd) val = wd+val+"</div>";
            val = "<div class='"+typecls+prefix+"SpaceSelectInner"+(ico?"Icon":"")+(BIE?prefix+"SpaceSelectInnerIE":"")+"'>"+val+"</div>";
            cls += prefix+"CellSpaceSelect";
            }
         else { 
            if(ico) { val = "<div class='"+typecls+prefix+ico+prefix+"SpaceEditIconInner'"+(icoi?" style='"+icoi+"'":"")+"><div>"+val+"</div></div>"; typecls = ""; }
            if(wd) val = wd+val+"</div>";
            if(but) { val = "<div class='"+typecls+prefix+but+prefix+"SideRight"+prefix+"SpaceEdit"+(ico?"Button":"")+"IconInner'"+(icoi?" style='"+buti+"'":"")+">"+val+"</div>"; typecls = ""; }
            val = "<div class='"+typecls+prefix+"SpaceEditInner"+(ico||but?"Icon":"")+"'>"+val+"</div>";
            cls += prefix+"CellSpaceEdit";
            }
         if(row.Space==-1) cls += prefix+"CellSpaceAbove";
         else if(row.Space==5) cls += prefix+"CellSpaceBelow";
         cls += prefix+"CellSpaceBase";
         if(row.SpaceWrap) cls += prefix+"CellSpaceWrap";
         if(Opt==4) { A[A.length] = img+val; A[A.length] = cls; A[A.length] = rgb; A[A.length] = ""; if(styl4) A[A.length+3] = styl4; }
         else out += (row.SpaceWrap?"<div":"<td")+(test?this.GetItemId("Cell",row,col,null,1):"")+(print ? "" : " onmousemove='"+this.This+".TmpSpaceCol=\""+col+"\";'"+(BTouch?" ontouchstart='"+this.This+".TmpSpaceCol=\""+col+"\";'":"")+" onmousedown='"+this.This+".TmpSpaceCol=\""+col+"\";'")+(styl?(clr?clr.slice(0,-1)+styl+"'":" style='"+styl+"'"):clr)+" class='"+cls+"'>"+img+val+(row.SpaceWrap?"</div>":"</td>");
         if(!Cell && (!print||this.Print)) row[col+"Pos"] = i+spcpan;
         continue;
         }
      ME.Space;

      var span = 1, bspan = 1, butin; 
      MS.SideButton;
      if(C.WidthPad){
         if(but&&!rot){
            if(but=="ButtonRight"){
               butin = (this.UseButton&2?"<button style='width:"+(C.WidthPad-1)+"px'":"<u")+" class='"+prefix+"GridButton"+prefix+"RightButton'>"+this.GetAttr(row,col,"ButtonText")+(this.UseButton&2?"</button>":"</u>"); 
               but = rgbcls+ccls+prefix+"CellBase"+prefix+"Cell"+(hdr?"Header"+prefix+"HeaderButtonButton":(flt?"Filter":""))+noleft+prefix+"AlignRight";
               }
            else if(but=="HtmlRight"){
               butin = this.GetAttr(row,col,"ButtonText");
               but = rgbcls+ccls+prefix+"CellBase"+prefix+"Cell"+(hdr?"Header"+prefix+"HeaderButtonHtml":(flt?"Filter":""))+noleft+prefix+"RightHtml"+prefix+"AlignRight";
               }   
            else if(but=="ImgRight"){ 
               butin = "<img class='"+prefix+"RightImg' src='"+this.GetAttr(row,col,"ButtonText")+"'/>";
               but = rgbcls+ccls+prefix+"CellBase"+prefix+"Cell"+(hdr?"Header"+prefix+"HeaderButton":(flt?"Filter":""))+noleft+prefix+"AlignRight";
               }
            else if(but=="LevelRight"){
               butin = 1; for(var r=row.previousSibling;r;r=r.previousSibling) if(this.GetAttr(r,col,"Button")=="Level") butin++;
               but = prefix+but+prefix+"LevelButton"+rgbcls+ccls+prefix+"CellBase"+prefix+"Cell"+(hdr?"Header"+prefix+"HeaderButtonHtml":(flt?"Filter":""))+noleft+prefix+"RightHtml"+prefix+"AlignRight";
               }   
            else if(BIEA6||hdr||avalign) { 
               butin = "<u class='"+prefix+"ButtonImage"+prefix+but+prefix+"SideRight"+"' style='"+buti+";width:"+(C.WidthPad-(row.NoDynBorder?I.CellBorderRightHeader:I.CellBorderRight))+"px;'></u>"; buti = "";
               but = rgbcls+ccls+prefix+"CellBase"+prefix+"Cell"+(hdr?"Header"+prefix+"HeaderButton":(flt?"Filter":""))+noleft+prefix+"AlignRight"; 
               }
            else { but = prefix+but+prefix+"SideRight"+rgbcls+ccls+prefix+"Empty"+prefix+"CellBase"+prefix+"Cell"+(hdr?"Header"+prefix+"HeaderButton":(flt?"Filter":""))+noleft; butin = CNBSP; }
            }
         else { span++; but = ""; }
         }
      else but = ""; 
      ME.SideButton;

      var spns;
      MS.ColSpan;
      if(rspn) {
         var spn = row[col+"Span"], spns = col, CNS = !Cell ? CN : row.Space ? row.Cells : this.ColNames[Cols[Cell].Sec]; if(Cell&&!row.Space) i = Cols[Cell].Pos;
         if(spn>1){
            i++;
            if(!C.Visible&&!C.Hidden) span -= C.WidthPad?2:1; 
            while(--spn){
               if(!CNS[i]) {
                  if(!cpl||A!=SS[1]||j==0||j>=cpl) break;
                  i = 0;
                  CN = this.ColNames[++j]; CNS = CN; cnlen = CN.length;
                  spn++;
                  continue;
                  }
               if(fs1) spns += "|"+CNS[i];
               var CC = Cols[CNS[i]];
               if(CC.Visible||CC.Hidden) {
                  if(CNS[i]==mc) span++;
                  if(CC.WidthPad) span++;
                  span++; 
                  if(but){ 
                     if(CC.Visible) bspan = 1;
                     else {
                        if(CNS[i]==mc) bspan++;
                        if(CC.WidthPad) bspan++;
                        bspan++; 
                        }
                     }
                  }
               i++;
               }
            
            if(but && bspan>1){
               if(C.Visible||C.Hidden) span -= bspan-1; 
               else bspan = 1;
               }
            if(--i<0){ 
               if(!cpl||A!=SS[1]||j==0||j>=cpl) i = 0; 
               else while(i<0) { CN = this.ColNames[--j]; CNS = CN; cnlen = CN.length; i += cnlen; }
               }
            if(!this.SpannedCols[spns]) { this.SpannedCols[spns] = 1; this.SpannedColsLength++; }
            }
            
         var mer = row[col+"Merge"]; if(mer==null) mer = D[col+"Merge"];
         if(mer && !(vis<=0)) val = this.GetMergeHTML(row,col,val,mer);
         }
      ME.ColSpan;
      
      var bor = "", brc = "";
      

      var tree = "", tcls;
      MS.Tree;
      if(ismc){ 
         if(fix || type=="Hidden") { tree = CNBSP; tcls = brc+rgbcls+ccls+prefix+"CellBase"+prefix+"Cell"+noright+(fix?prefix+"Cell"+noleft:"")+prefix+"Empty"; }
         else if(!this.SpannedTree) { tree = this.GetMainIconHTML(row,avalign); tcls = brc+rgbcls+ccls+prefix+"CellBase"+prefix+"Cell"+noright+tree[0]; tree = tree[1]; }

         else {
            var cls = rgbcls+ccls+prefix+"CellBase"+prefix+(ridx?"CellIndex":"Cell")+prefix+"SpannedTree";
            if(but) cls += noright;
            if(BFF3&&!BFF20) {
               cls += prefix+"CellBorderFF3";
               if(but) but += prefix+"CellBorderFF3";
               }
            var clsin = wcls;
            if(ico) clsin += prefix+ico;
            
            if(typecls) clsin += prefix+typecls;
         
            tree = this.GetMainIconHTML(row,avalign);
            tcls = tree[0]; 
            if(!tree[2]) tree[2] = (row.Level-(this.HideRootTree?1:0)) * (row.parentNode.TreeWidthL!=null?row.parentNode.TreeWidthL:this.Img.Line) + (row.TreeWidthT!=null?row.TreeWidthT:this.Img.Tree);
            var wspn = tree[2] ? " style='width:"+tree[2]+"px;'" : "";
            tree = tree[1];
            
            if(avalign) { cls += prefix+"VAlign"+avalign; tcls += prefix+"VAlign"+avalign; clsin += prefix+"VAlign"+avalign; }
            
            val = CTableCSP0+"style='table-layout:fixed;"+(C.Width?"width:100%;":"")+(BIEA&&!BIE&&!BIEA10?"":"height:100%;")+"'"+CTfoot
                + "<tr><td"+wspn+" class='"+tcls+"'>"+tree+"</td>" 
                
                + "<td"+(icoi?" style='"+icoi+"'":"")+" class='"+clsin+"' style='width:100%;'>"+val+"</td></tr>"+CTableEnd;
            if(BChrome) val = "<div style='height:100%;display:"+(print?"":"inline-")+"block;'>"+val+"</div>";
            if(Opt==4){
               A[A.length] = val; A[A.length] = cls; A[A.length] = rgb; A[A.length] = icoi;
               A[A.length] = butin; A[A.length] = but; A[A.length] = buti; A[A.length] = styl4;
               }
            else {
               out += "<td class='"+noright+"'>"+CNBSP+"</td>"; 
               out += "<td"+(styl?(clr?clr.slice(0,-1):" style='")+styl+"'":clr)+" class='" + cls + "'" + rspan + (span>1?" colspan='"+span+"'":"") + ">" + val + "</td>"; 
               if(but){ 
                  if(Opt==1) out += "<td"+clr+rspan+"><div style='width:"+C.WidthPad+"px'</td>";
                  else out += "<td"+(buti?(clr?clr.slice(0,-1)+buti+"'":" style='"+buti+"'"):clr)+rspan+" class='"+but+"'>"+butin+"</td>";
                  }
               }
            continue;
            }
         }   

      

      if(hdr && mc && Get(row,col+"Levels") && !this.Printing){
         var lcnt = this.MaxLevel+1, maxl = Get(row,col+"Levels"), minl = Get(row,col+"MinLevels");
         if(minl>0 && lcnt<minl) lcnt = minl;
         if(maxl>1 && lcnt>maxl) lcnt = maxl;
         var clsin = wcls;
         if(ico) clsin += prefix+ico;
         
         if(typecls) { clsin += prefix+typecls; }
         typecls = ""; ico = ""; wcls = prefix+"Levels"; if(this.DynamicBorder) wcls += prefix+"LevelsDB";
         
         var v = "";
         for(var k=0;k<lcnt;k++) v += "<td class='"+prefix+"LevelButton'>"+(k+1)+"</td>";
         MS.Digits; if(L.Digits) v = L.ConvertDigits(v); ME.Digits;
         v += "<td class='"+prefix+"LevelButtonSpace'>"+CNBSP+"</td>";
         val = CTableCSP0+" class='"+prefix+"Section'"+CTfoot+"<tr>"+v+"<td"+(icoi?" style='"+icoi+"'":"")+" class='"+clsin+"'>"+val+"</td></tr>"+CTableEnd;
         row[col+"ALevels"] = lcnt;
         this.HasLevelButtons = 1;
         }
      ME.Tree;

      var ov = 0;
      if(ovr&&simple1&&!hdr&&!flt&&(!rspan||ovr&4)){
         var ov = row[col+"Overlay"]; if(ov==null) ov = D[col+"Overlay"]; if(ov==null) { ov = row.Overlay; if(ov==null) ov = D.Overlay; } if(ov==null) ov = C.Overlay;
         if(ov&1 && (!over||ov&4)) {
            if((ovr&3)==3&&(aalign=="Right"||!aalign&&(CAlignRight[type]||autoright))&&!this.Rtl){
               if(!ico&&col!=mc) { wcls += prefix+"OverflowLeftVisible"; if(val.indexOf("</div>")<0) val = "<div>"+val+"</div>"; }
               }
            else if((ovr&3)==3&&aalign=="Center"&&!this.Rtl){
               if(!ico&&col!=mc&&!wrap) { wcls += prefix+"OverflowVisibleCenter"+prefix+"OverflowLeftVisible"; if(val.indexOf("</div>")<0) val = "<div><div>"+val+"</div></div>"; else if(val.indexOf("</div></div>")<0||ctr) val = "<div>"+val+"</div>"; }
               }
            else if(!but) wcls += prefix+"OverflowVisible";
            if(ov&8 && (wrap||CEditMulti[type]&&wrap==null)) { wcls += prefix+"OverflowWrap"; if(val.indexOf("</div>")<0) val = "<div>"+val+"</div>"; }
            }
         if(ov&2 && (!over||ov&4) || ico || but || col==mc&&!fix) { 
            if((ovr&3)!=3||aalign!="Right"&&(aalign||!CAlignRight[type]&&!autoright)&&aalign!="Center"||!(ov&1)) wcls += prefix+"OverflowDisable"; 
            if(but) but += prefix+"OverflowDisable"; 
            if(col==mc) tcls = prefix+"OverflowDisable"+tcls; 
            }
         }
      if(!(ov&1) && (aalign=="Right"&&oalign.length>5)){
         wcls += prefix+"OverflowLeft"; if(val.indexOf("</div>")<0) val = "<div>"+val+"</div>";
         }

      var cls = rgbcls+ccls+wcls+prefix+"CellBase";
      if(hdr){ 
         if(pan) cls += (typecls?prefix+typecls:"")+prefix+"CellHeaderPanel";
         else if(C.ConstWidth) cls += prefix+"CellHeaderEmpty";
         else if(C.Type=="Gantt") cls += prefix+"GanttHeader"+(row[col+"GanttHeader"]?"":"Empty");
         
         cls += prefix+"CellHeader";
         }
      else if(ridx) {
         cls += (typecls?prefix+typecls:"")+prefix+"CellIndex" + (pan?prefix+"CellIndexPanel":(val==CNBSP?prefix+"CellIndexEmpty":(row.ColorPos==1?prefix+"CellIndexAlternate":""))); 
         if(tree) tcls = prefix+"CellIndexTree"+tcls; if(but) but += prefix+"CellIndexButton";
         }
      else if(flt){
         MS.Filter;
         if(pan) cls += (typecls?prefix+typecls:"")+prefix+(col=="Panel"?"CellFilterPanel":"CellPanel");
         else if(C.ConstWidth) cls += (typecls?prefix+typecls:"")+prefix+"CellEmpty";
         else if(C.Type=="Gantt") cls += prefix+"GanttFilter";
         else cls += (typecls?prefix+typecls:"")+prefix+"CellFilter";
         ME.Filter;
         }   
      else if(pan) cls += (typecls?prefix+typecls:"")+prefix+"Cell"+(rpan?"Row":"")+"Panel";
      else if(C.ConstWidth) cls += (typecls?prefix+typecls:"")+prefix+"CellEmpty";
      else cls += (typecls?prefix+typecls:"")+prefix+"Cell";
      if(img) { cls += prefix+"CellImg"; if(this.OverlayImg) cls += prefix+"CellOverlayImg"; }
      if(ico) cls += prefix+ico;
      if(but) cls += noright;
      if(tree&&!fix) cls += noleft;
      if(val==CNBSP) cls += prefix+"Empty";
      if(BFF3&&!BFF20) {
         cls += prefix+"CellBorderFF3";
         if(but) but += prefix+"CellBorderFF3";
         if(tree) tcls = prefix+"CellBorderFF3" + tcls; 
         }
      if(avalign && tree && BIEStrict&&!BIEA8 && avalign!="Top" && !this.NoTreeLines && !rtl) tcls = prefix+"VAlignTop"+tcls; 
      if(fs1) {
         
         var nb = " HideCol"+this.Index+(rspn ? spns.replace(/\|/g,"_") : col);
         cls += nb;
         if(but) but += nb;
         if(BSafari&&C.Overflow&&!hdr&&!flt&&!ctr){
            nb = " OverflowCol"+this.Index+col;
            cls += nb;
            if(but) but += nb;
            }
         }
      if(Opt==4){ 
         A[A.length] = img+val; A[A.length] = cls; A[A.length] = rgb; A[A.length] = icoi;
         A[A.length] = butin; A[A.length] = but; A[A.length] = buti; A[A.length] = styl4;
         if(tree) { A[A.length] = tree; A[A.length] = tcls; }
         }
      else {
         if(tree) out += "<td"+(test?this.GetItemId("Tree",row,col,null,1):"")+(BSafari&&C.Overflow?(clr?clr.slice(0,-1)+"overflow:visible;'":" style='overflow:visible;'"):clr)+rspan+" class='"+tcls+"'>"+tree+"</td>";
         if(styl) icoi += styl;
         over = BSafari && over && !ico && !cin ? "overflow:visible;" : "";
         out += "<td"+(test?this.GetItemId("Cell",row,col,null,1):"")+(icoi||pat||over?(clr?clr.slice(0,-1)+icoi+pat+over+"'":" style='"+icoi+pat+over+"'"):clr)+" class='" + cls + "'" + rspan + (span>1?" colspan='"+span+"'":"") + ">" + img+val + "</td>";
         MS.SideButton;
         if(but){ 
            over = BSafari && !butin ? "overflow:visible;" : "";
            if(Opt==1) out += "<td"+(bspan>1?" colspan='"+bspan+"'":"")+(test?this.GetItemId("Button",row,col,null,1):"")+clr+rspan+"><div style='width:"+C.WidthPad+"px'></div></td>";
            else out += "<td"+(bspan>1?" colspan='"+bspan+"'":"")+(test?this.GetItemId("Button",row,col,null,1):"")+(buti||over?(clr?clr.slice(0,-1)+buti+over+"'":" style='"+buti+over+"'"):clr)+rspan+" class='"+but+"'>"+butin+"</td>";
            }
         ME.SideButton;
         }
      }
   if(out) A[A.length] = out;   
   }
return rrgbcls;

}
// ---------------------------------------------------------------------------------------------------------------------------

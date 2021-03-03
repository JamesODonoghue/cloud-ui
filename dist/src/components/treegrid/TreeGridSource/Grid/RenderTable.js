// -----------------------------------------------------------------------------------------------------------
// Functions for rendering into HTML, except GetRowHTML and its support functions
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
TGP.GetRowTagHTML = function(row,clr){
var h = row.Height; if(h==null) h = row.Def.Height; if(!h) h = this.RowHeight; 
if(this.RenderingSection==2&&h<row.LastHeight) h = row.LastHeight;
var s = "<tr";
if(this.Printing) h = this.GetPrintRowHeight(row);
else if(this.SetIds) {
   var om = this.This+".ARow="+this.This+".Rows[\""+((row.id+"").search(/[\'\"\\]/)>=0 ? row.id.replace(/\\/g,'\\\\').replace(/\"/g,'\\"').replace(/\'/g,"&#x27;") : row.id)+"\"];"+this.This+".ASec=0;' ";
   if(BTouch) s += " ontouchstart='"+om; 
   s += " onmousemove='"+om; 
   if(BMouse && row.Fixed) s += " onmousedown='"+om;
   }
s += " class='"+this.Img.Style+row.Kind+"Row "+(clr!=null?clr:this.GetRowHTML(row,null,16))+(this.DynamicBorder&&!row.NoDynBorder?" "+this.Img.Style+"DB ":"")+"' style='"+(BIEA?"overflow:auto;"+(BIEStrict?"":"min-height:"+h+"px;"):"height:"+h+"px;")+(row.Visible&&!Is(row,"Hidden")?"":"display:none;")+"'>";

if(this.LeftTD) s += "<td style='width:0px;height:"+h+"px'></td>";
return s;
}
// ---------------------------------------------------------------------------------------------------------------------------
TGP.GetWidthsTagHTML = function(){
var s = CTableCSP0 + "class='"+this.Img.Style+"Section"+(BFF3&&!BFF20?"FF3":"")+(this.ColPaging&&this.DynamicSpan?" "+this.Img.Style+"SectionSpan":"")+"'"+CTfoot+"<tr"+(BIEA&&!BIE8Strict?" style='display:none;'":"")+">";

if(this.LeftTD) s += "<th style='width:0px;'></th>";
return s;
}
// ---------------------------------------------------------------------------------------------------------------------------
TGP.GetWidthsHTML = function(row,SS){
var I = this.Img, lev = row.Level, mc = this.HideTree ? null : this.MainCol; 
if(lev==null) lev = -2;
else {
   if(this.HideRootTree) lev--;
   if(row.Expanded&2) lev--;
   }
var bright = I.CellBorderRight, bleft = I.CellBorderLeft, cpl = row.Fixed ? this.CPLastSec : 0; 


for(var j=this.FirstSec;j<=this.LastSec;j++){
   var A = SS[j]; if(cpl && j>1 && j<=cpl) A = SS[1];
   if(!A) continue;
   var CN = this.ColNames[j], len = CN.length, cnt = len;

   var s = "";
   for(var i=0;i<len;i++){
      var c = CN[i], C = this.Cols[c];
      if(!C.Visible && !C.Hidden){ cnt--; continue; }
      var w = C.Width; if(w==null) w = 100;  
      var wp = C.WidthPad, sw = "", sp = "";
      if(wp) {
         w -= wp;
         if(w<bleft){ wp += w-bleft; w = bleft; }
         }
      if(c==mc){
         cnt++;
         var dw = (lev+1)*I.Line+I.Tree+bleft;
         if(this.SpannedTree||!C.Visible||row.Fixed) dw = 0;
         else if(lev==-2) dw = bleft;
         w -= dw;
         if(w<bright) { dw += w-bright; w = bright; }
            
         sw = "<th style='height:0px;width:"+dw+"px;'></th>"; 
         }
      
      if(!C.Visible){ w = 0; wp = 0; }
      
 if(C.WidthPad){
         cnt++; sp = "<th style='height:0px;width:"+wp+"px;'></th>"; 
         }
      s += sw+"<th style='height:0px;width:"+w+"px;'></th>"+sp; 
      }
   if(this.LeftTD || j==1) cnt++; 
   A[A.length] = s;
   A.Cnt = cnt; 
   }
}
// ---------------------------------------------------------------------------------------------------------------------------
MS.Tree;
TGP.GetChildrenHTML = function(row,SS){
var rs = this.RenderingSection;
if(rs ? row.Hasch : this.HasChildren(row)){ 
   if(this.ChildPaging && !row.Expanded && !rs){ row.Hasch = 0; row.State = row.State>2 || row.firstChild || row.Count==0 || this.ChildPaging==2 ? 2 : 0; }
   else {
      if(!rs){
         if(row.firstChild) { row.State = 4; row.Hasch = 4; }
         else { row.State = 0; row.Hasch = 2; }
         }
      var s = "<tr"+(row.Expanded&&(!rs||row.Visible||row.Expanded&2) ? "" : " style='display:none'")+(this.ChildParts&&row.Expanded&2?" onmousemove='\""+row.id+"\"'":"")+">"; 
      for(var j=this.FirstSec;j<=this.LastSec;j++) if(SS[j]) SS[j][SS[j].length] = s+"<td colspan='"+SS[j].Cnt+"'><div>";
      if(this.ChildParts) this.GetChildPartsHTML(row,SS);
      else this.GetPageHTML(row,SS);
      for(var j=this.FirstSec;j<=this.LastSec;j++) if(SS[j]) SS[j][SS[j].length] = "</div></td></tr>";
      }
   }
else if(!rs) { row.Hasch = 0; row.State = row.firstChild ? 2 : 4; }
}
ME.Tree;
// ---------------------------------------------------------------------------------------------------------------------------
TGP.GetPageHTML = function(row,SS,fr,lr,max){
if(!max) max = 1e6;
var rev = this.ReversedTree, nrs = !this.RenderingSection;

var s = this.GetWidthsTagHTML();
for(var j=this.FirstSec;j<=this.LastSec;j++) if(SS[j]) SS[j][SS[j].length] = s + (j==1&&!this.LeftTD?"<th style='width:0px;'></th>":"");
this.GetWidthsHTML(row,SS);
for(var j=this.FirstSec;j<=this.LastSec;j++) if(SS[j]) SS[j][SS[j].length] = "</tr>";

var block = 0, r = fr?fr:row.firstChild, incrc = row!=this.XH&&row!=this.XF&&this.FirstSec<=1&&!this.RenderingSection;
while(r!=lr){
   if(r.Block) {
      if(block>0) { if(r.Block > block) block = r.Block; }
      else block = r.Block;
      }
   if(!r.Visible && !r.Fixed && (nrs||!r.r1)) { 
      MS.Tree; if(r.Expanded&2) this.GetChildrenHTML(r,SS); ME.Tree;
      r = r.nextSibling; 
      continue; 
      }
   if(--max<0 && block<=0) break;

   

   MS.ReversedTree; if(rev) this.GetChildrenHTML(r,SS); ME.ReversedTree;

   var X = []; for(var j=this.FirstSec;j<=this.LastSec;j++) if(SS[j]) X[j] = SS[j].length++;
   var clr = this.GetRowHTML(r,SS,0), s = this.GetRowTagHTML(r,clr);
   for(var j=this.FirstSec;j<=this.LastSec;j++) if(SS[j]) { SS[j][X[j]] = s; SS[j][SS[j].length] = "</tr>"; }
   if(!this.LeftTD && SS[1]) SS[1][X[1]] += "<td style='width:0px;'></td>";
   if(incrc) this.RowCount++;
   
   MS.Tree; if(!rev) this.GetChildrenHTML(r,SS); ME.Tree;
   
   r = r.nextSibling;
   if(--block>0 && r==lr) { 
      if(!r) break;
      lr = lr.nextSibling;   
      }
   }
for(var j=this.FirstSec;j<=this.LastSec;j++) if(SS[j]) SS[j][SS[j].length] = CTableEnd;
return r;
}
// ---------------------------------------------------------------------------------------------------------------------------
TGP.GetChildPartsHTML = function(row,SS){
MS.ChildParts;
var div = "<div class='"+this.Img.Style+"ChildPart"+(this.DynamicBorder?"Border":"")+"'";

MS.ColPaging$Gantt;
if(this.ColPaging && (row.r1||row.rch1) && row.Hasch==4){
   var next = this.ReversedTree ? "previousSibling" : "nextSibling";
   for(var cp=(row.r1?row.r1[next]:row.rch1).firstChild.firstChild.firstChild;cp;cp=cp.nextSibling){
      if(cp.firstChild.nodeType==1){
         for(var j=this.FirstSec;j<=this.LastSec;j++) if(SS[j]) {
            SS[j][SS[j].length] = div+">";
            var A = []; A[j] = SS[j];
            for(var len=0,fr=cp.firstChild.firstChild.firstChild;fr;fr=fr.nextSibling) if(fr.className) len++; 
            var cpr = cp.firstChild.rows[1];
            if(this.ReversedTree && !cpr.onmousemove) cpr = cpr.nextSibling; 
            this.GetPageHTML(row,A,this.GetRowFromHTML(cpr),null,len);
            SS[j][SS[j].length] = "</div>";
            }
         }         
      else {
         var h = cp.style.height; 
         for(var j=this.FirstSec;j<=this.LastSec;j++) if(SS[j]) SS[j][SS[j].length] = div+" style='height:"+h+";'>"+CNBSP+"</div>";               
         }
      }
   return;
   }         
ME.ColPaging$Gantt;   

var cr = row.firstChild, min = this.ChildPartMin, len = this.ChildPartLength;

if(row.State<2){
   var h = row.Count*this.RowHeight;
   for(var j=this.FirstSec;j<=this.LastSec;j++) if(SS[j]) SS[j][SS[j].length] = div+" style='height:"+h+"px;'>"+CNBSP+"</div>";
   return;
   }
   
if(min) {
   for(var j=this.FirstSec;j<=this.LastSec;j++) if(SS[j]) SS[j][SS[j].length] = div+">";
   cr = this.GetPageHTML(row,SS,cr,null,min);
   for(var j=this.FirstSec;j<=this.LastSec;j++) if(SS[j]) SS[j][SS[j].length] = "</div>";
   }

while(cr){
   for(var cnt=len,h=0;cnt&&cr;cr=cr.nextSibling){
      if(!cr.Visible) continue;
      if(cr.Expanded) {
         if(cr.firstChild) h += this.GetPageHeightSub(cr);
         else if(cr.Count) h += cr.Count * this.RowHeight;
         }
      var hh = cr.Height; if(!hh){ hh = cr.Def.Height; if(!hh) hh = this.RowHeight; }
      if(hh) h += hh;
      cnt--;
      }
   if(h) for(var j=this.FirstSec;j<=this.LastSec;j++) if(SS[j]) SS[j][SS[j].length] = div+" style='height:"+h+"px;'>"+CNBSP+"</div>";
   }
ME.ChildParts;   
}
// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------
// Returns html for body into SS = sections
TGP.GetBodyHTML = function(SS){
var ap = this.FastPages, ph = 0, cnt = 0, defh = this.RowHeight/this.PageLengthDiv, prefix = this.Img.Style, CN = this.ColNames, colp = this.FirstSec>1||this.LastSec==0;
var end = "<div class='"+prefix+"Page' style='width:0px;height:"+(Grids.HiddenScroll==2?CScrollHeightBase:0)+"px;overflow:hidden;"+(BIEA?"line-height:0px;font-size:0px;'>"+CNBSP:"'>")+"</div>"; 

var db = this.DynamicBorder ? "Border" : "";



if(!this.Paging || !this.AllPages || this.XB.childNodes.length==1){ 
   var p = this.Paging ? GetNode(this.XB,this.FPage) : this.XB.firstChild, s = "<div class='"+prefix+"PageOne"+db+"'";
   if(!p) { p = this.XB.firstChild; this.FPage = 0; }
   if(p.State<2){
      s += " style='height:"+(this.GetPageHeight(p)+(BIE?this.Img.PageOneBPHeight:0))+"px;";
      for(var v=this.FirstSec;v<=this.LastSec;v++) if(SS[v]) SS[v][SS[v].length] = s+"'></div>"+end;
      }
   else {
      s += ">";
      for(var v=this.FirstSec;v<=this.LastSec;v++) if(SS[v]) SS[v][SS[v].length] = s;
      this.GetPageHTML(p,SS); if(p.State==2) p.State = 4;
      for(var v=this.FirstSec;v<=this.LastSec;v++) if(SS[v]) SS[v][SS[v].length] = "</div>"+end;
      }   
   return;
   }

MS.Paging;  
for(var fp=this.XB.firstChild,p=fp;p;p=p.nextSibling){
   
   var ps = p.State-0; 
   if(colp && p.r1 && ps<4){ 
      ph = !p.r1.firstChild&&p.r1.style.height ? parseInt(p.r1.style.height) : BChrome ? Math.round(p.r1.getBoundingClientRect().height)/(this.Scale?this.Scale:1)/(this.ScaleY?this.ScaleY:1) : p.r1.offsetHeight; 
      ph -= p==fp ? this.Img.PageFirstBPHeight : this.Img.PageBPHeight; 
      if(ap && p.NoPage) p = p.r1.Last;
      cnt = 0;
      }
   else if(ap && ps<4){ 
      ph += ps<2 ? p.Count*defh : this.GetPageHeight(p)/this.PageLengthDiv;
      if(++cnt==ap) cnt = 0; 
      if(BNN && ph>9000 && cnt){ 
         ap = cnt;
         this.FastPages = ap;
         cnt = 0;
         }
      p.NoPage = 1; 
      }
   else if(cnt && ps==4){ cnt = 0; p = p.previousSibling; } 
   if(!cnt) {
      var s = "<div class='"+prefix+"Page"+(p==fp?"First":"")+db+"'";
      if(ps<4){ 
         var h = ph?Math.floor(ph):this.GetPageHeight(p,true); if(!h) h=1; 
         if(BIE) h += p==fp ? this.Img.PageFirstBPHeight : this.Img.PageBPHeight;
         if(BTouch) s += " ontouchstart='"+this.This+".ARow=null;"+this.This+".ASec=-9;'";
         s += " onmousemove='"+this.This+".ARow=null;"+this.This+".ASec=-9;'";
         s += " style='"+(BSafari&&!BSafariMac?"":"overflow:hidden;")+"height:"+h+"px;"; 
         for(var v=this.FirstSec;v<=this.LastSec;v++) if(SS[v]) SS[v][SS[v].length] = s +  "'></div>"; 
         }
      else {
         s += ">";
         for(var v=this.FirstSec;v<=this.LastSec;v++) if(SS[v]) SS[v][SS[v].length] = s;
         this.GetPageHTML(p,SS); 
         for(var v=this.FirstSec;v<=this.LastSec;v++) if(SS[v]) SS[v][SS[v].length] = "</div>";
         }
      ph = 0;
      }
   }
if(ap && !ph && this.XB.childNodes.length==1) ph++; 
if(ph) for(var v=this.FirstSec;v<=this.LastSec;v++) if(SS[v]) SS[v][SS[v].length] = "<div class='"+this.Img.Style+"Page"+db+"' style='overflow:hidden;height:"+ph+"px'></div>";
for(var v=this.FirstSec;v<=this.LastSec;v++) if(SS[v]) SS[v][SS[v].length] = end;
ME.Paging;
}
// ---------------------------------------------------------------------------------------------------------------------------
MS.Space;
TGP.GetSpaceHTML = function(row){
var min = row.Height; if(min==null) min = row.Def.Height; if(min==null) min = row.Space==-1||row.Space==5||row.Tag?this.SpaceOutRowHeight:this.SpaceRowHeight;
var scale = "", A = []; this.GetRowHTML(row,A,0);
MS.Scale; var sc = this.GetScale(row,1); if(sc) scale = " style='transform:scale("+sc+");transform-origin:"+(this.Rtl?"100%":"0")+" 0;'"; ME.Scale;
if(row.SpaceWrap) return "<div"+scale+" class='"+this.Img.Style+"SpaceWrap'>"+A.join("")+"</div>";

return "<table"+scale+" cellspacing='"+(row.Kind=="Tabber"||row.Kind=="Tabber2"?0:this.Img.SpaceMargin)+"' cellpadding='0' " + CTfoot + "<tr" + (BIEA||this.Printing ? "><td style='height:"+min+"px'></td>" : " style='height:"+min+"px;'>") + A.join("") + "</tr>" + CTableEnd;
}
ME.Space;
// ---------------------------------------------------------------------------------------------------------------------------
TGP.GetSpaceSecHTML = function(space,S){
var s = "", prefix = " "+this.Img.Style, A = S[space]; if(!A) return "";
MS.Space;
for(var k=0;k<A.length;k++){
   var r = A[k];
   var span = this.SecCount-this.FirstSec+this.HasLeftSplitter+this.HasRightSplitter;
   var valign = "", avalign = r.VertAlign; if(avalign==null) avalign = r.Def.VertAlign; if(avalign==null) { avalign = r.VAlign; if(avalign==null) avalign = r.Def.VAlign; }
   if(avalign) { avalign = CVertAlignTypes[avalign]; if(avalign) valign = this.Img.Style+"SpaceVAlign"+avalign; }
   if(space==0 || space>=4) {
      for(var i=0;i<this.Pagers.length;i++) if(this.Pagers[i].Visible) span++;
      span++; 
      }
   var ss = " colspan='"+span+"' class='"+prefix+"RowSpace"+prefix+"RowSpace"+space;
   if(r==A.First) ss += prefix+"RowSpaceFirst";
   if(r==A.Last) ss += prefix+"RowSpaceLast";
   if(r.Visible) s += "<tr><td"+ss+"'><div";
   else if(BIEA&&!BIE8Strict) s += "<tr style='display:none;'><td"+ss+"'><div"; 
   else if(BSafari7) s += "<tr><td"+ss+"'><div style='display:none;'";       
   else s += "<tr><td style='display:none;'"+ss+"'><div";                    
   s += " class='"+valign+prefix+r.Kind+"Row"+prefix+"SolidRow";
   if(r.Cells&&r.Cells[0]=="Panel") s += prefix+"SpaceRowPanel";
   s += "'>" + this.GetSpaceHTML(r) + "</div></td></tr>";
   }
ME.Space;   
return s;
}
// ---------------------------------------------------------------------------------------------------------------------------
TGP.GetSpaceSecOutHTML = function(space,S){
var s = "", prefix = " "+this.Img.Style, A = S[space]; if(!A) return "";
MS.Space;
for(var k=0;k<A.length;k++) { 
   var r = A[k], n = r.Space==-1?"Above":"Below";
   s += "<div class='"+prefix+"Row"+n+(r.Kind=="Tabber2"?prefix+"TabSepNoBack":"");
   if(r==A.First) s += prefix+"Row"+n+"First";
   if(r==A.Last) s += prefix+"Row"+n+"Last";
   s += "' align='"+(this.Rtl?"right":"left")+"'";
   var ss = "";
   if(r[r.Cells[r.Cells.length-1]+"Style"]=="TabSepLast") ss += "border-right:none;";
   if(r[r.Cells[0]+"Style"]=="TabSepFirst") ss += "border-left:none;"+(r.Visible?"":"display:none;");
   else if(!r.Visible) ss += "display:none;";
   MS.Scale; if(this.Scale) ss += "margin-"+(this.Rtl?"left":"right")+":-1000px;'"; ME.Scale; 
   if(ss) s += " style='"+ss+"'";
   if(BTouch) s += " ontouchstart='"+this.This+".SpaceMouseMove(event,"+r.Pos+");'";
   s += " onmousemove='"+this.This+".SpaceMouseMove(event,"+r.Pos+");'";

   s += ">" + this.GetSpaceHTML(r) + "</div>";
   }
ME.Space;   
return s;
}
// ---------------------------------------------------------------------------------------------------------------------------
TGP.GetSectionHTML = function(A,row,css){
var ClassNames = ["Left","Mid","Right"];


var SS = this.GetSS(), CN = this.ColNames, p = A.length;
if(row==this.XB) this.GetBodyHTML(SS);
else this.GetPageHTML(row,SS);

var s1 = "<td valign='top' style='overflow:hidden;", s3 = "'><div class='"+this.Img.Style+css, hid = (this.ExactWidth?"":"display:none;")+"width:0px;", s4 = "</div></div></div></td>";
var s2 = "'><div style='overflow:hidden;'><div class='"+this.Img.Style+"SectionScroll' style='overflow:scroll;"+(row==this.XB&&!this.NoVScroll?"":"overflow-y:hidden;")
       + (this.NoHScroll?"overflow-x:hidden;":"")+(this.MomentumScroll?"-webkit-overflow-scrolling:touch;":"")+"' onscroll='"+this.This+".ScrolledBody(this,";
   
if(this.FirstSec==0) {
   A[p++] = s1 + (CN[0].Width?"":hid) + s3 + ClassNames[0] + (this.HasLeftSplitter?" "+this.Img.Style+"SplitterRight":"") + s2 + "0);'>" + SS[0].join("") + s4; 
   if(this.HasLeftSplitter) {
      A[p++] = "<td onmousemove='"+this.This+".ARow=null;"+this.This+".ASec=-6;'"+(BTouch?" ontouchstart='"+this.This+".ARow=null;"+this.This+".ASec=-6;'":"");
      A[p++] = " class='"+this.Img.Style+(this.Rtl?"Right":"Left")+"Splitter"+(BTablet?" "+this.Img.Style+(this.Rtl?"Right":"Left")+"SplitterTouch":"")+" "+this.Img.Style+css+"Splitter'><div style='width:0px;'></div></td>";
      }
   }

A[p++] = s1 + s3 + ClassNames[1] + (this.HasLeftSplitter?" "+this.Img.Style+"SplitterLeft":"") + (this.HasRightSplitter?" "+this.Img.Style+"SplitterRight":"") + s2 + "1);'>";
if(this.ColPaging){
   MS.ColPaging;
   A[p++] = CTableCSP0 + CTfoot + "<tr>";
   
   var td = "<td valign='top'>"; 
   if(row.Fixed&&this.CPLastSec) A[p++] = "<td"+(this.ColNames[1].Width==1?" class='"+this.Img.Style+"EmptyGap'":"")+">"+SS[1].join("")+"</td>";
   else for(var i=1,cl=this.ColNames.length-1;i<cl;i++) {
      if(SS[i]) A[p++] = td+SS[i].join("")+"</td>";
      else A[p++] = td+"<div style='width:"+CN[i].Width+"px;'></div></td>";
      }
   A[p++] = "</tr>"+CTableEnd + s4;
   ME.ColPaging;
   }
else A[p++] = SS[1].join("") + s4; 
     
if(this.SecCount==3) {
   if(this.HasRightSplitter) {
      A[p++] = "<td onmousemove='"+this.This+".ARow=null;"+this.This+".ASec=-7;'"+(BTouch?" ontouchstart='"+this.This+".ARow=null;"+this.This+".ASec=-7;'":"");
      A[p++] = " class='"+this.Img.Style+(this.Rtl?"Left":"Right")+"Splitter"+(BTablet?" "+this.Img.Style+(this.Rtl?"Left":"Right")+"SplitterTouch":"")+" "+this.Img.Style+css+"Splitter'><div style='width:0px;'></div></td>";
      }
   A[p++] = s1 + (CN[CN.length-1].Width?"":hid) + s3 + ClassNames[2] + (this.HasRightSplitter?" "+this.Img.Style+"SplitterLeft":"") + s2 + "2);'>" + SS[SS.length-1].join("") + s4; 
   }
}

// ---------------------------------------------------------------------------------------------------------------------------
TGP.GetHScrollHTML = function(sec,cls) {
var TT = this.This+".";
var s = "<div onmousemove='"+TT+"ARow=null;"+TT+"ASec="+sec+";' class='"+this.Img.Style+"HScroll"+cls;
if(Grids.HiddenScroll&&!this.CustomHScroll) s += " GridHiddenScroll";
if(this.HasLeftSplitter&&sec!=-4) s += " "+this.Img.Style+"Splitter"+(sec==-3?"Left":"Right");
if(this.HasRightSplitter&&sec!=-2) s += " "+this.Img.Style+"Splitter"+(sec==-3?"Right":"Left");
for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Space==4&&r.Visible) { s += " "+this.Img.Style+"HScrollSpace"; break; }
s += "'";
if(!BIE&&!this.CustomHScroll) s += " style='height:"+(this.ScrollHeight+(BIEA10?0:-1))+"px;'";
s += ">";
MS.CustomScroll;
if(this.CustomHScroll){
   var styl = this.Img.Style+"CustScroll"+this.CustomHScroll;
   s += "<div class='"+styl+"Right' ";
   if(this.TestIds) s += this.GetItemId("ScrollRight",null,["Left","Mid","Right"][-2-sec],null,1);
   s += "onmouseover='if(this.className!=\""+styl+"RightHidden\")this.className=\""+styl+"RightHover\";TGCancelEvent(event);' "
   s += "onmouseout='if(this.className!=\""+styl+"RightHidden\")this.className=\""+styl+"Right\";TGCancelEvent(event);' ";
   s += "onmousemove='"+TT+"ARow=null;"+TT+"ASec="+sec+";' ";
   if(BMouse) s += "onmousedown='"+TT+"ClickScrollbar(event,1,"+sec+");TGCancelEvent(event);' onmouseup='"+TT+"ClickScrollbar(event);TGCancelEvent(event);' ";
   MS.Touch; if(BTouch) s += "ontouchstart='this.onmouseover();"+TT+"ClickScrollbar(event,1,"+sec+");TGCancelEvent(event);' ontouchend='this.onmouseout();"+TT+"ClickScrollbar(event);TGCancelEvent(event);' "; ME.Touch;
   s += "><div class='"+styl+"Left' ";
   if(this.TestIds) s += this.GetItemId("ScrollLeft",null,["Left","Mid","Right"][-2-sec],null,1);
   s += "onmouseover='this.className=\""+styl+"LeftHover\";TGCancelEvent(event);' "
   if(BMouse) s += "onmouseout='this.className=\""+styl+"Left\";TGCancelEvent(event);' onmousedown='"+TT+"ClickScrollbar(event,2,"+sec+");TGCancelEvent(event);' ";
   MS.Touch; if(BTouch) s += "ontouchend='this.className=\""+styl+"Left\";' ontouchstart='this.onmouseover();"+TT+"ClickScrollbar(event,2,"+sec+");TGCancelEvent(event);' "; ME.Touch;
   s += "><div ";
   if(BMouse) s += "onmousedown='"+TT+"ClickScrollbar(event,3,"+sec+");TGCancelEvent(event);' ";
   if(BTouch) s += "ontouchstart='"+TT+"ClickScrollbar(event,3,"+sec+");TGCancelEvent(event);' ";
   s += "><div style='width:100%;overflow:hidden;' onmouseover='TGCancelEvent(event);' onmouseout='TGCancelEvent(event);'>"; 
   
   s += "<div>"; 
   s += "<div class='"+styl+"SliderRight' ";
   s += "onmouseover='this.className=\""+styl+"SliderRightHover\";this.firstChild.className=\""+styl+"SliderLeftHover\";this.firstChild.firstChild.className=\""+styl+"SliderHInHover\";' ";
   if(BMouse){
      s += "onmouseout='this.className=\""+styl+"SliderRight\";this.firstChild.className=\""+styl+"SliderLeft\";this.firstChild.firstChild.className=\""+styl+"SliderHIn\";' ";
      s += "onmousedown='"+TT+"StartScrollbar(event,"+sec+");TGCancelEvent(event);' ";
      }
   MS.Touch;
   if(BTouch){
      s += "ontouchend='this.className=\""+styl+"SliderRight\";this.firstChild.className=\""+styl+"SliderLeft\";this.firstChild.firstChild.className=\""+styl+"SliderHIn\";' ";
      s += "ontouchstart='this.onmouseover();"+TT+"StartScrollbar(event,"+sec+");TGCancelEvent(event);' ";
      }
   ME.Touch;
   s += "><div class='"+styl+"SliderLeft'>";
   s += "<div class='"+styl+"SliderHIn'>";
   s += "</div></div></div></div></div></div></div></div></div>";
   return s;
   }
ME.CustomScroll;
if(BIEA) s += "<div style='height:"+(this.ScrollHeight+1)+"px;margin-top:-1px;overflow-x:scroll;overflow-y:hidden;'"; 
else s += "<div style='height:"+(this.ScrollHeight-1)+"px;overflow:scroll;overflow-y:hidden;border-bottom:1px solid white;'"; 

s += BSafari ? " onscroll='if(!"+TT+"ScrollTime){"+TT+"ScrollTime=1;setTimeout(\""+TT+"ScrollTime=0;"+TT+"Scrolled();\",10);}'" : " onscroll='"+TT+"Scrolled();'"; 
s += " onmousemove='"+TT+"ARow=null;"+TT+"ASec="+sec+";'";
s += ">";
s += "<div style='height:1px;overflow:hidden;'>"+CNBSP+"</div>"; 
s += "</div>";
s += "</div>";
return s;
}

// ---------------------------------------------------------------------------------------------------------------------------
MS.Corners;
TGP.GetCorners = function(cls,spc){
var s = "<div id='"+this.GetItemId("Corner",null,null,cls)+"' class='"+this.Img.Style+cls+"'"+(this.Scale?" style='transform:scaleX("+this.Scale+");transform-origin:"+(this.Rtl?"100%":"0")+" 0;'":"")+">";
for(var i=0;i<10;i++) if(this.Img[cls][i]!=null) s+="<div class='"+this.Img.Style+cls+i+(spc?" "+this.Img.Style+cls+"Space"+i:"")+"'>"+CNBSP+"</div>";
return s + "</div>";
}
ME.Corners;

// ---------------------------------------------------------------------------------------------------------------------------
MS.Pager;
TGP.GetPagersHTML = function(right){
var s = "", I = this.Img, prefix = I.Style, TT = this.This+".";
for(var i=0;i<this.Pagers.length;i++){
   var P = this.Pagers[i]; if(P.Left?right:!right) continue;
   P.ScrollCursor = 0;
   var html = this.GetPagerPagesHTML(P); 
   s += "<td rowspan='"+(this.XS.Space[3]-this.XS.Space[0]+this.FootVisible-1) + "' valign='top' style='"+(P.Visible?"":"display:none;")+"'>";
   s += "<div"+(!BIEA||BIEA10?" style='margin-bottom:-10000px;'":BIEA&&!BIEA10&&BIEA8?" style='margin-bottom:-100px;'":"");
   s += " onmousemove='"+TT+"ARow=null;"+TT+"ASec="+(-i-10)+";'";
   if(BTouch) s += " ontouchstart='"+TT+"ARow=null;"+TT+"ASec="+(-i-10)+";'";
   s += "><div class='"+prefix+"PagerMain' style='width:"+(P.Width+(BIE?I.PagerAllWidth-I.PagerMWidth:0))+"px'>";
   s += "<div class='"+prefix+"PagerHeader "+prefix+"PagerHeader"+(P.Left?"Left":"Right")+(I.LastBorderBottom&&this.Header.Visible&&!this.GetNextVisible(this.Header)&&!this.GetPrevVisible(this.Header)?" "+prefix+"PagerHeaderSingle":"")+"'>"; 
   s += this.GetPagerCaptionHTML(P);
   s += "</div>";
   s += "<div class='"+prefix+"PagerBody "+prefix+"PagerBody"+(P.Left?"Left":"Right")+"' style='overflow:auto;overflow-x:hidden;"+(this.MomentumScroll?"-webkit-overflow-scrolling:touch;":"")+"' onscroll='"+TT+"PagerScrolled("+i+");'>"; 
   
   if(BIE) s += "<div style='width:100%;overflow:hidden;'>"; 
   else if(BTablet) s += "<div style='width:"+(P.Width-I.PagerBodyAllWidth)+"px;'>"; 
   else s += "<div>"; 
   s += "<div>"; 
   
   s += html;
   s += "</div>";
   
   s += "</div></div></div></div></td>";
   }
return s;
}
ME.Pager;
// ---------------------------------------------------------------------------------------------------------------------------
TGP.RenderHTML = function(){
MS.Debug; this.StartTimer("RenderCreate"); ME.Debug;
var A = [], p = 0, s, I = this.Img, prefix = I.Style, TT = this.This+".", nosel = this.SelectingText ? "" : "user-select:none;-ms-user-select:none;-o-user-select:none;-moz-user-select:none;-khtml-user-select:none;-webkit-user-select:none;";
A[p++] = "<div"+(this.Rtl?" dir='rtl'":" dir='ltr'")+" style='"+nosel+"position:static;visibility:hidden;"+(this.ExternalAlign?"":"text-align:"+(this.Rtl?"right":"left")+";")+"' class='"+I.Size+"'";
MS.Touch;
if(BTouch){
   A[p++] = " ontouchstart='return "+TT+"GridTouchStart(event)' ";
   A[p++] = " ontouchend='return "+TT+"GridTouchEnd(event)' ";
   A[p++] = " ontouchmove='return "+TT+"GridTouchMove(event)' ";
   }
ME.Touch;
if(BMouse) {
   A[p++] = " onclick='return "+TT+"GridClick(event)' ";
   A[p++] = " onmousemove='return "+TT+"GridMouseMove(event)' ";
   A[p++] = " onmouseover='return "+TT+"GridMouseOver(event)' ";
   A[p++] = " onmousedown='return "+TT+"GridMouseDown(event)' ";
   A[p++] = " onmouseup='return "+TT+"GridMouseUp(event)' ";
   A[p++] = " ondblclick='return "+TT+"GridDblClick(event)' ";
   A[p++] = " oncontextmenu='return "+TT+"GridRightClick(event)'";
   if(BIEA||BEdge) A[p++] = " onselectstart='return "+TT+"GridSelectStart(event)'";
   }

MS.File$Style$Import;
if(this.DropFiles) A[p++] = " ondrop='return "+TT+"GridDrop(event);' ondragover='TGCancelEvent(event)'";
ME.File$Style$Import;
A[p++] = ">";
if(this.TabStop) A[p++] = "<div style='overflow:hidden;"+(BIEA&&!BIE8Strict?"height:20px;margin-top:-20px;'><input style='background:transparent;border:0px none;color:transparent;'":"height:0px;'><input")+this.GetItemId("TabStopPrev",null,null,null,1)+" type='text'"+(this.TabIndex>=0?" tabindex='"+this.TabIndex+"'":"")+" onfocus='if("+TT+"Disabled)return;"+TT+"ActionTabRight"+(this.TabStop==2?"Edit();"+TT+"StartEdit":"")+"();'/></div>";
var has = "";
for(var r=this.XS.firstChild,S=[];r;r=r.nextSibling){
   var s = S[r.Space]; if(!s) { s = []; S[r.Space] = s; }
   s[s.length] = r;
   if(r.Visible){ s.Last = r; if(!s.First) { s.First = r;  has += " "+prefix+"HasSpace"+(r.Space==-1?"Above":(r.Space==5?"Below":r.Space)); } }
   }

for(var r=this.XH.firstChild;r;r=r.nextSibling) if(r.Visible) { has += " "+prefix+"HasHead"+(r.Kind=="Header"?"er":""); break; }
for(var r=this.XF.firstChild;r;r=r.nextSibling) if(r.Visible) { has += " "+prefix+"HasFoot"+(r.Kind=="Header"?"er":""); break; }

A[p++] = this.GetSpaceSecOutHTML(-1,S);

MS.Corners;
if(I.Top) {
   for(var r=this.XS.firstChild,spc=0;r;r=r.nextSibling) if(r.Space==0 && r.Visible) { spc = 1; break; }
   A[p++] = this.GetCorners("Top",spc);
   }
ME.Corners;
var s = "";
if(this.ExternalAlign) s += "text-align:"+(this.Rtl?"right;":"left;");
if(this.ExactWidth) s += "table-layout:fixed;width:0px;";
MS.Scale; if(this.Scale) s += "transform:scale("+this.Scale+");transform-origin:"+(this.Rtl?"100%":"0")+" 0;"; ME.Scale;
A[p++] = CTableCSP0+(s?" style='"+s+"'":"") + " class='"+prefix+"MainTable"+has+(this.WordWrap?" "+prefix+"WordWrap":"")+"' id='" + this.id + "'";

//[p++] = " onmouseout='return "+this.This+".GridMouseOut(event)' ";

A[p++] = BIEA&&!BIE8Strict ? "><tbody style='padding:0px;'>" : CTfoot; 
MS._Reg; var GCD = 'Co'; ME._Reg; 

if(this.ExactWidth){
   A[p++] = "<tr>";
   for(var i=0;i<this.Pagers.length;i++){ var P = this.Pagers[i]; if(P.Left) A[p++] = "<th style='height:0px;"+(P.Visible?"":"display:none;")+"width:"+(P.Width+I.PagerAllWidth)+"px;'></th>"; } 
   if(this.FirstSec==0) A[p++] = "<th style='height:0px;width:0px;'></th>"; 
   if(this.HasLeftSplitter) A[p++] = "<th style='height:0px;width:"+this.Img.LeftSplitter+"px;'></th>"; 
   A[p++] = "<th style='height:0px;width:0px;'></th>"; 
   if(this.HasRightSplitter) A[p++] = "<th style='height:0px;width:"+this.Img.RightSplitter+"px;'></th>"; 
   if(this.SecCount==3) A[p++] = "<th style='height:0px;width:0px;'></th>"; 
   
   A[p++] = "<th style='height:0px;width:0px;'></th>"; 
   for(var i=0;i<this.Pagers.length;i++){ var P = this.Pagers[i]; if(!P.Left) A[p++] = "<th style='height:0px;"+(P.Visible?"":"display:none;")+"width:"+(P.Width+I.PagerAllWidth)+"px;'></th>"; } 
   A[p++] = "</tr>";
   }

A[p++] = this.GetSpaceSecHTML(0,S);

A[p++] = "<tr>";

MS.Pager; A[p++] = this.GetPagersHTML(0); ME.Pager;

this.GetSectionHTML(A,this.XH,"Head"); p = A.length;

s = "<td dir='ltr' class='"+prefix+(this.ShortVScroll?"VScrollShort":"VScrollNormal")+(this.ShortVScroll==2?" "+prefix+"VScrollShortHeader":"")+(this.CustomScroll?" "+prefix+"VScrollCustom "+prefix+"VScrollCustom"+this.CustomScroll:"")+"' rowspan='"+(this.XS.Space[3]-this.XS.Space[0]-1+this.FootVisible)+"' valign='top'>";
if(this.ShortVScroll==2) s += "<div class='"+prefix+"VScrollHeader'>"+CNBSP+"</div>";
if(this.ShortVScroll) s += "<div class='"+prefix+"VScrollTop'>"+CNBSP+"</div>";
var mar = (!BIEA||BIEA10?"margin-bottom:-10000px;":BIEA&&!BIEA10&&BIEA8?" style='margin-bottom:-100px;'":"");
s += "<div class='"+prefix+"VScroll"+(Grids.HiddenScroll&&!this.CustomScroll?" GridHiddenScroll":"")+"' style='width:"+(this.ScrollWidth+(BIE?I.ScrollVBPWidth:0)+(BIEA10||this.CustomScroll?0:-1))+"px;"+(BSafari&&!this.ScrollWidth?"display:none;":"")+(this.ShortVScroll?"":mar)+"'>";
if(this.CustomScroll){
   MS.CustomScroll;
   var styl = this.Img.Style+"CustScroll"+this.CustomScroll;
   s += "<div class='"+styl+"Down' ";
   if(this.TestIds) s += this.GetItemId("ScrollDown",null,null,null,1);
   s += "onmouseover='if(this.className!=\""+styl+"DownHidden\")this.className=\""+styl+"DownHover\";TGCancelEvent(event);' "
   s += "onmouseout='if(this.className!=\""+styl+"DownHidden\")this.className=\""+styl+"Down\";TGCancelEvent(event);' ";
   s += "onmousemove='"+TT+"ARow=null;"+TT+"ASec=-1;' ";
   if(BMouse) s += "onmousedown='"+this.This+".ClickScrollbar(event,1);TGCancelEvent(event);' onmouseup='"+this.This+".ClickScrollbar(event);TGCancelEvent(event);' ";
   MS.Touch; if(BTouch) s += "ontouchstart='this.onmouseover();"+this.This+".ClickScrollbar(event,1);TGCancelEvent(event);' ontouchend='this.onmouseout();"+this.This+".ClickScrollbar(event);TGCancelEvent(event);' "; ME.Touch;
   s += "><div class='"+styl+"Up' ";
   if(this.TestIds) s += this.GetItemId("ScrollUp",null,null,null,1);
   s += "onmouseover='this.className=\""+styl+"UpHover\";TGCancelEvent(event);' ";
   if(BMouse) s += "onmouseout='this.className=\""+styl+"Up\";TGCancelEvent(event);' onmousedown='"+this.This+".ClickScrollbar(event,2);TGCancelEvent(event);' ";
   MS.Touch; if(BTouch) s += "ontouchend='this.className=\""+styl+"Up\";' ontouchstart='this.onmouseover();"+this.This+".ClickScrollbar(event,2);TGCancelEvent(event);' "; ME.Touch;
   s += "><div ";
   if(BMouse) s += "onmousedown='"+this.This+".ClickScrollbar(event,3);TGCancelEvent(event);'";
   if(BTouch) s += "ontouchstart='"+this.This+".ClickScrollbar(event,3);TGCancelEvent(event);'";
   s += "><div style='width:100%;overflow:hidden;' onmouseover='TGCancelEvent(event);' onmouseout='TGCancelEvent(event);'>"; 
   
   s += "<div>"; 
   s += "<div class='"+styl+"SliderDown' ";
   s += "onmouseover='this.className=\""+styl+"SliderDownHover\";this.firstChild.className=\""+styl+"SliderUpHover\";this.firstChild.firstChild.className=\""+styl+"SliderVInHover\";' ";
   if(BMouse){
      s += "onmouseout='this.className=\""+styl+"SliderDown\";this.firstChild.className=\""+styl+"SliderUp\";this.firstChild.firstChild.className=\""+styl+"SliderVIn\";' ";
      s += "onmousedown='"+this.This+".StartScrollbar(event);TGCancelEvent(event);' ";
      }
   MS.Touch;
   if(BTouch){
      s += "ontouchend='this.className=\""+styl+"SliderDown\";this.firstChild.className=\""+styl+"SliderUp\";this.firstChild.firstChild.className=\""+styl+"SliderVIn\";' ";
      s += "ontouchstart='this.onmouseover();"+this.This+".StartScrollbar(event);TGCancelEvent(event);' ";
      }
   ME.Touch;
   s += "><div class='"+styl+"SliderUp'>";
   s += "<div class='"+styl+"SliderVIn'>";
   s += "</div></div></div></div></div></div></div></div>";
   ME.CustomScroll;
   }
else {
   if(BIE8Strict) s += "<div style='margin-left:-"+this.ScrollWidth+"px;width:"+(this.ScrollWidth*2)+"px;overflow:auto;'";
   else if(BIEA10) s += "<div style='width:"+this.ScrollWidth+"px;overflow:scroll;overflow-x:hidden;'";
   else s += "<div style='width:"+(this.ScrollWidth-1)+"px;overflow:scroll;overflow-x:hidden;border-right:1px solid white;'";
   
   s += BSafari ? " onscroll='if(!"+TT+"ScrollTime){"+TT+"ScrollTime=1;setTimeout(\""+TT+"ScrollTime=0;"+TT+"Scrolled();\",10);}'" : " onscroll='"+TT+"Scrolled();'"; 
   s += " onmousemove='"+TT+"ARow=null;"+TT+"ASec=-1;'";
   s += ">";
   s += "<div style='width:1px;overflow:hidden;'>"+CNBSP+"</div>";  
   s += "</div>";
   }
s += "</div>";
if(this.ShortVScroll) s += "<div class='"+prefix+"VScrollBottom' style='"+mar+"'>"+CNBSP+"</div>";
s += "</td>";
A[p++] = s;

MS.Pager; A[p++] = this.GetPagersHTML(1); ME.Pager;

A[p++] = "</tr>"; 

A[p++] = this.GetSpaceSecHTML(1,S);

A[p++] = "<tr>";
this.GetSectionHTML(A,this.XB,"Body"); p = A.length;
A[p++] = "</tr>";

A[p++] = this.GetSpaceSecHTML(2,S);

if(this.FootVisible){
   A[p++] = "<tr>";
   this.GetSectionHTML(A,this.XF,"Foot"); p = A.length;
   A[p++] = "</tr>";
   }

A[p++] = this.GetSpaceSecHTML(3,S);

s = "<tr>";

var Touch = BTablet ? "Touch" : "";
var ResLeft = this.HasLeftSplitterS ? "Resize"+Touch : "";
var ResRight = this.HasRightSplitterS ? "Resize"+Touch : "";

I.ScrollHLeftAllWidth = ResLeft ? I.ScrollHLeftResizeAllWidth : I.ScrollHLeftNoResizeAllWidth;
I.ScrollHRightAllWidth = ResRight ? I.ScrollHRightResizeAllWidth : I.ScrollHRightNoResizeAllWidth;
I.ScrollHMidAllWidth = (ResLeft ? I.ScrollHMidResizeLeftWidth : I.ScrollHMidNoResizeLeftWidth) + (ResRight ? I.ScrollHMidResizeRightWidth : I.ScrollHMidNoResizeRightWidth);
var hid = " style='display:none;width:0px;'", CN = this.ColNames;
if(!this.WideHScroll && this.FirstSec==0) s += "<td class='"+(this.CustomScroll?prefix+"HScrollCustom "+prefix+"HScrollCustom"+this.CustomScroll:prefix+"HScrollNormal") + "'" + (CN[0].Width?"":hid) + ">" + this.GetHScrollHTML(-2,(this.Rtl?"Right":"Left")+ResLeft) + "</td>"; 
if(!this.WideHScroll && this.HasLeftSplitter) s += "<td onmousemove='"+TT+"ARow=null;"+TT+"ASec=-6;'"+(BTouch?" ontouchstart='"+TT+"ARow=null;"+TT+"ASec=-6;'":"")+" class='"+this.Img.Style+(this.Rtl?"RightSplitter":"LeftSplitter")+(Touch?" "+this.Img.Style+(this.Rtl?"RightSplitter":"LeftSplitter")+Touch:"")+" "+this.Img.Style+"ScrollSplitter'><div style='width:0px;'></div></td>";
s += "<td class='"+(this.CustomScroll?prefix+"HScrollCustom "+prefix+"HScrollCustom"+this.CustomScroll:prefix+"HScrollNormal") + "' colspan='"+(this.WideHScroll?(CN[0].Width?1:0)+1+(CN[CN.length-1].Width?1:0):1)+"'>" + this.GetHScrollHTML(-3,this.WideHScroll?"Wide":"Mid"+(ResLeft?" "+prefix+"HScrollMidLeft"+ResLeft:"")+(ResRight?" "+prefix+"HScrollMidRight"+ResRight:"")) + "</td>";      
if(!this.WideHScroll && this.HasRightSplitter) s += "<td onmousemove='"+TT+"ARow=null;"+TT+"ASec=-7;'"+(BTouch?" ontouchstart='"+TT+"ARow=null;"+TT+"ASec=-7;'":"")+" class='"+this.Img.Style+(this.Rtl?"LeftSplitter":"RightSplitter")+(Touch?" "+this.Img.Style+(this.Rtl?"LeftSplitter":"RightSplitter")+Touch:"")+" "+this.Img.Style+"ScrollSplitter'><div style='width:0px;'></div></td>";
if(!this.WideHScroll && this.SecCount==3) s += "<td class='"+(this.CustomScroll?prefix+"HScrollCustom "+prefix+"HScrollCustom"+this.CustomScroll:prefix+"HScrollNormal") + "'" + (CN[CN.length-1].Width?"":hid) + ">" + this.GetHScrollHTML(-4,(this.Rtl?"Left":"Right")+ResRight) + "</td>"; 

for(var cs="",r=this.XS.firstChild;r;r=r.nextSibling) if(r.Space==4&&r.Visible) { cs += " "+this.Img.Style+"HScrollSpace"; break; }
s += "<td class='"+(this.CustomHScroll?prefix+"HScrollCustom "+prefix+"HScrollCustom"+this.CustomHScroll:prefix+"HScrollNormal") + " " + prefix + (this.ShortVScroll?"VScrollShort":"VScrollNormal")+(this.ShortVScroll==2?" "+prefix+"VScrollShortHeader":"")+(this.CustomScroll?" "+prefix+"VScrollCustom "+prefix+"VScrollCustom"+this.CustomScroll:"") + "' onmousemove='"+TT+"ARow=null;"+TT+"ASec=-5;'><div class='"+prefix+(this.CustomHScroll?"CustScroll"+this.CustomHScroll+"X":"XScroll")+cs+"' style='height:"+(!BIEA10&&!this.CustomHScroll ? (this.ScrollHeight-1)+"px;width:"+(this.ScrollWidth-1) : this.ScrollHeight+"px;width:"+this.ScrollWidth)+"px;"+(BSafari&&!this.ScrollWidth?"display:none;":"")+"overflow:hidden;'>"+CNBSP+"</div></td>"; 
A[p++] = s + "</tr>";

A[p++] = this.GetSpaceSecHTML(4,S);
//[p++] = this.GetSpaceSecHTML(5);

A[p++] = CTableEnd;

MS.Corners;
for(var r=this.XS.firstChild,spc=0;r;r=r.nextSibling) if(r.Space==4 && r.Visible) { spc = 1; break; }
if(I.Bottom) A[p++] = this.GetCorners("Bottom");
ME.Corners;

MS._Reg;
MS._Debug; if(0){ ME._Debug; 
GCD = (this[GCD+'de']+""); 
if(GCD && GCD.length>10){
   var N = 0;
   for(var i=0;i<7;i++){ N *= 26; N += GCD.charCodeAt(i)-65; }
   N = (N+"").split("").reverse().join("").slice(0,9)-0;
   var SS = "";
   while(N>=1){ SS += String.fromCharCode(N%26+65); N /= 26; }
   if(SS!=GCD.slice(7)) GCD = null;
   }
else GCD = null;
if(!GCD) A = [];
MS._Debug; } ME._Debug;
ME._Reg; 

MS.Resize; if(this.ResizingMain) A[p++] = (BIE?"<div"+this.GetItemId("ResizeIE",null,null,null,1)+" style='text-align:"+(this.Rtl?"left":"right")+";'>":"")+"<div class='"+prefix+"ResizeGrid"+(this.Rtl?"Rtl":"")+"'"+this.GetItemId("Resize",null,null,null,1)+(this.Scale?" style='transform:scale("+this.Scale+");transform-origin:right bottom;'":"")+"></div>"+(BIE?"</div>":""); ME.Resize;

A[p++] = this.GetSpaceSecOutHTML(5,S);
if(this.TabStop) A[p++] = "<div style='"+(BIEA&&!BIE8Strict?"height:1px;margin-top:-1px;":"height:0px;")+"overflow:hidden;'><input"+this.GetItemId("TabStopNext",null,null,null,1)+" type='text'"+(this.TabIndex>=0?" tabindex='"+this.TabIndex+"'":"")+" onfocus='if("+TT+"Disabled)return;"+TT+"ActionTabLeft"+(this.TabStop==2?"Edit();"+TT+"StartEdit":"")+"();'/></div>";
if(!BIEA && this.TmpFocus!=0) A[p++] = "<div"+this.GetItemId("TmpFocusGrid",null,null,null,1)+" tabindex='-1' style='"+(this.TmpFocus==2?"":"position:absolute;top:-1000px;left:-1000px;")+"width:0px;height:0px;overflow:hidden;'></div>";
A[p++] = "</div></div></div>";

MS.Debug; this.StopTimer("RenderCreate"); this.StartTimer("RenderSet"); ME.Debug;
MS._Debug; if(location.hostname.search(/^\s*$|^localhost$|^127\.0\.0\.1$|^10\.\d+\.\d+\.\d+$|^192\.168\.\d+\.\d+$/)<0) return; ME._Debug; 
this.MainTag.innerHTML = A.join("");
if(BIEA8 && !this.NestedGrid && this.MainTag.offsetHeight > 1e5){ 
   this.MainTag.style.overflow = "visible";
   this.MainTag.style.overflow = "hidden";
   }
MS.Debug; this.StopTimer("RenderSet"); ME.Debug;
}
// ---------------------------------------------------------------------------------------------------------------------------

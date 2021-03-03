// -----------------------------------------------------------------------------------------------------------
// Hint, Tip
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
TGP.SetTip = function(tip){
var row = this.Event.Row;
if(!row || Grids.Drag) return;
if(!this.StandardTip) {
   this.HideTip();
   this.Tip = tip;
   this.TipTime = 0;
   return;
   }
if(tip.indexOf("*Value*")>=0&&this.ACol) tip = tip.replace("*Value*",this.GetRowHTML(row,null,8,this.ACol));
tip = tip.replace(/\<br\s*\/?\>/,"\n");
if(row.Space){ row.r1.title = tip; return; }
var C = this.Cols[this.Event.Col];
if(C && row["r"+C.Sec]) row["r"+C.Sec].title = tip;

}
// -----------------------------------------------------------------------------------------------------------
MS.Tip;
TGP.ShowTip = function(tip,dummy,tip2){
this.HideTip();
if(tip2) tip = tip2;
if(!tip) return;
ShowTip({Body:tip,ZIndex:this.ZIndex!=null?this.ZIndex+16:null,Class:this.Img.Style+"Tip",StyleSize:this.Img.Size},null,0);
}
ME.Tip;
// -----------------------------------------------------------------------------------------------------------
TGP.HideTip = function(){ MS.Tip; HideTip(); this.TipTime = -1e5; ME.Tip;  }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionShowHint = function(dummy,T){
MS.Hint;
return this.ShowHint(this.ARow,this.ACol,0,T);
ME.Hint;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionShowHintStatic = function(dummy,T){
MS.Hint;
return this.ShowHint(this.ARow,this.ACol,1,T);
ME.Hint;
}
// -----------------------------------------------------------------------------------------------------------
TGP.HideHint = function(always){

MS.Hint;
if(always==-1){
   if(this.HintPerm) return;
   always = 0;
   }
if(always && BIEA && this.HintOld){
   this.HintOld.parentNode.removeChild(this.HintOld.previousSibling);
   this.HintOld.parentNode.removeChild(this.HintOld);
   this.HintOld = null;
   }
var H = this.Hint;
if(!H || this.NoHideHintTo&&this.NoHideHintTo>new Date()-0) return;

MS.Animate;
if(this.AnimateDialogs && !this.SuppressAnimations){
   var add = H.vertanim ? "Vert" : "Horz", A = this.Animations;
   var anim = A["HideHint"+add]; if(!anim) anim = A["HideHint"];
   H.parentNode.removeChild(H.previousSibling);
   if(anim) { 
      Animate(H,anim,null,function(){ H.parentNode.removeChild(H);});
      this.Hint = null;
      return;
      }
   }
ME.Animate;

if(BIEA){ 
   H.previousSibling.style.display = "none";
   H.style.display = "none";
   if(this.HintOld){
      this.HintOld.parentNode.removeChild(this.HintOld.previousSibling);
      this.HintOld.parentNode.removeChild(this.HintOld);
      }
   this.HintOld = always ? null : H;
   }
else {
   H.parentNode.removeChild(H.previousSibling);
   H.parentNode.removeChild(H);
   }
this.Hint = null;
ME.Hint;
}
// -----------------------------------------------------------------------------------------------------------
MS.Hint;
TGP.ShowHint = function(row,col,permanent,test,cellwidth){
if(!row || !col || this.Touched&&!cellwidth&&!permanent) return;

var cc = col, I = this.Img, maxh = 0; 
var typ = this.GetType(row,cc), show = Get(row,cc+"ShowHint"); if(show==null) show = Get(row,"ShowHint"); if(show==null&&this.Cols[cc]) show = this.Cols[cc]["ShowHint"];
if(typ=="Radio" || typ=="Gantt" || typ=="Chart" || typ=="Abs" || typ=="Icon" || typ=="Bool" || typ=="Pages" || typ=="DropCols" || !cellwidth&&show=="0" || row.DetailCol==col) return;
if(this.EditMode && this.FRow==row && this.FCol==col && !cellwidth) return; 

var cell = this.GetCell(row,col);
if(!cell) return;
var cf = cell.lastChild;
if(col==this.MainCol && !this.HideTree && this.SpannedTree && !row.Fixed && (BChrome&&cf.firstChild?cf.firstChild:cf).tagName.toLowerCase()=="table") { 
   cell = (BChrome&&cf.firstChild?cf.firstChild:cf).rows[0].lastChild; cf = cell.lastChild; 
   }
var valign = this.GetVertAlign(row,col), rot = null; MS.Rotate; rot = this.GetAttr(row,col,"Rotate",0,1); ME.Rotate;
if(row.Space){
   while(cf && cf.firstChild && cf.className && cf.className.indexOf("Inner")>=0 && cf.className.indexOf("WidthInner")<0 && cf.firstChild.nodeType==1) cf = cf.firstChild;
   }
else while(cf&&cf.firstChild&&(cf.firstChild.scrollHeight>cf.scrollHeight||cf.firstChild.scrollWidth>cf.scrollWidth)) cf = cf.firstChild;
if(!cf || cf.nodeType!=1 || !row.Space && (!this.IsMultiline(row,col)&&cf.className.indexOf("Inner")<0&&cf.style.overflow!="hidden" || rot)) cf = cell;
else if(Get(row,"MaxHeight")) maxh = 1;

var w = maxh&&cf.style.overflow=="hidden" ? cf.offsetWidth : cell.offsetWidth, h = maxh ? cf.offsetHeight : cell.offsetHeight, sw = cf.scrollWidth, sh = cf.scrollHeight, cw = cf.clientWidth, ch = cf.clientHeight;
if(cell.className.indexOf("OverlayImg")>=0) return;

var D = null, ovc = cell.className.indexOf("OverflowVisibleCenter")>=0, ctr = null;
if(ovc&&cell.lastChild&&cell.lastChild.firstChild) {
   sw = cell.lastChild.firstChild.scrollWidth;
   if(cell.className.indexOf("OverflowCenterTo")>=0) ctr = cell.className.match(/OverflowCenterTo_(\d+)_(\d+)_([-\d]+)/);
   }
if(sw&&cf.className.indexOf("Indent")>=0) sw -= GetBorderWidth(GetStyle(cf));
else if(BSafari){
   if(!sw) sw = cf.offsetWidth;
   else if(sw-1==w) sw--; 
   if(!sh) sh = cf.offsetHeight;
   else if(sh-1==h) sh--; 
   }

var bor = row.NoDynHeader ? I.CellBorderWidthHeader : I.CellBorderWidth;

if((show==4||show==5) && (sw==w-bor||sw==w-bor+1)){ 
   D = this.ShowHintTag;
   if(!D){
      var D = document.createElement("div"), s = D.style;
      s.position = "absolute"; s.top = "-10000px"; s.left = "0px"; s.visibility = "hidden"; s.marginRight = "-9000px";
      
      this.AppendTag(D);
      this.ShowHintTag = D;
      }
      
   D.className = (cell.className+(row.Space?"":+" "+row["r"+(this.CPLastSec&&row.Fixed?1:this.Cols[col].Sec)].className.replace(/\w+Row\b/g,""))) + " "+this.Img.Style+"HintWidth";
   D.innerHTML = cell.innerHTML;

   if(cf.scrollHeight<=D.scrollHeight){ 
      sw = D.offsetWidth+(sw==w-bor?1:0)-bor;
      cf = D;
      
      }
   }

if(cellwidth) return sw-w;

var osw = sw;
if(this.Overlay && cell.className.indexOf("OverflowVisible")>=0 && w<sw && !maxh){
   if(ovc) sw = sw/2+(ctr?ctr[3]/2:0);
   for(var c=cell.nextSibling;w<sw&&c&&c.className.indexOf("OverflowDisable")<0;c=c.nextSibling) w += c.offsetWidth;
   if(!c&&this.Overlay>=2&&this.ColPaging&&this.Cols[col].MainSec==1&&w<sw){
      for(var i=this.Cols[col].Sec+1;i<=this.LastSec&&!c&&w<sw;i++) if(this.ColNames[i].length){
         for(var co=this.ColNames[i][0],c=this.GetCell(row,this.Cols[co].Visible?co:this.GetNextCol(co));w<sw&&c&&c.className.indexOf("OverflowDisable")<0;c=c.nextSibling) w += c.offsetWidth;
         }
      }
   }
if(this.Overlay && cell.className.indexOf("OverflowLeftVisible")>=0 && (ovc?w>=sw&&w<osw:w<sw)){
   if(ovc) sw = osw;
   for(var c=cell.previousSibling;w<sw&&c&&c.className.indexOf("OverflowDisable")<0;c=c.previousSibling) w += c.offsetWidth;
   if(!c&&this.Overlay>=2&&this.ColPaging&&this.Cols[col].MainSec==1&&w<sw){
      for(var i=this.Cols[col].Sec-1;i>=this.FirstSec&&!c&&w<sw;i--) if(this.ColNames[i].length){
         for(var co=this.ColNames[i][0],c=this.GetCell(row,this.Cols[co].Visible?co:this.GetPrevCol(co));w<sw&&c&&c.className.indexOf("OverflowDisable")<0;c=c.previousSibling) w += c.offsetWidth;
         }
      }
   }
else if(ovc) sw = osw;

var E = show==2||show==5 ? this.CellToWindow(row,col) : {};
if(show!=3 && w>=sw && h+2>=sh && !E.OverLeft && !E.OverRight && !E.OverTop && !E.OverBottom) { 
   if(D) D.innerHTML = "";
   return;
   }

if(!test) this.HideHint();

MS.SideButton;
var B = this.GetAttr(row,col,"Icon"), wb = 0;
if(!row.Space && (B&&(B!="Filter"||this.CanEdit(row,col)) || typ=="Enum"&&this.CanEdit(row,col)&&B==null&&this.GetAttr(row,col,"Button")!="Enum") && CAlignTypes[this.GetAttr(row,col,"IconAlign")]!="Right" && !rot && cell.className.indexOf("ClassInnerIcon")<0 && !Get(row,col+"Levels")) {
   if({"Date":1,"Sort":1,"Filter":1,"Defaults":1,"Dates":1,"Expand":1,"Check":1,"Clear":1,"File":1,"Enum":1}[B]) wb = I[B+(row.Space&&B=="Defaults"?"Space":"")+"Left"];
   else if(typ=="Enum") wb = I["EnumLeft"];
   else { wb = this.GetAttr(row,col,"IconWidth"); if(!wb) wb = I["IconLeft"]; }
   if(!wb) wb = I.SideLeft;
   }
if(wb) { var zi = row[col+"Icon"]; row[col+"Icon"] = ""; }
ME.SideButton;

if(row.Space){ var zw = row[col+"Width"], zb = row[col+"Button"]; row[col+"Width"] = ""; row[col+"Button"] = ""; }
var hv = Get(row,col+"HintValue"); if(hv==null) hv = Get(row,"HintValue"); if(hv==null&&this.Cols[col]) hv = this.Cols[col]["HintValue"];

if(hv!=null) { var zv = row[col]; row[col] = hv; }

var max = row.MaxHeight, sp = this.SpannedTree; row.MaxHeight = 0; this.SpannedTree = 0;
var A = []; this.GetRowHTML(row,A,4,cc);
row.MaxHeight = max; this.SpannedTree = sp;

if(hv!=null) row[col] = zv;
if(row.Space) { row[col+"Width"] = zw; row[col+"Button"] = zb; }
MS.SideButton; if(wb) row[col+"Icon"] = zi; ME.SideButton;

if(Grids.OnHint) { var tmp = Grids.OnHint(this,row,cc,A[0],(w+3<sw?1:0)+(h+2<sh?2:0)+(E.OverLeft||E.OverRight||E.OverTop||E.OverBottom?4:0)); if(tmp!=null) A[0] = tmp; }
if(!A[0]) {
   if(D) D.innerHTML = "";
   return;
   }
if(test) return true;

var tag = document.createElement("div"), style = I.Style;

var add = ""; if(row.Space) add = cell.className.indexOf("CellSpaceEdit")>=0 ? style+"HintSpaceEdit" : (cell.className.indexOf("CellSpaceSelect")>=0 ? style+"HintSpaceSelect" : style+"HintSpace");
tag.className = style+"HintMain "+style+"Hint"+row.Kind+"Main "+(add?add+"Main ":row["r"+(this.CPLastSec&&row.Fixed?1:this.Cols[col].Sec)].className.replace(/\w+Row\b/g,""));
var ss = "";

if(A[2]) ss += "background-color:"+A[2]+";";

tag.innerHTML = "<div style='overflow:hidden;'>"+(rot||BIE||BIEA&&BIEStrict&&!BIEA8?CTableCSP0+"style='table-layout:fixed;'"+CTfoot+"<tr><td":"<div")
              + " style='"+ss+"' class='"+A[1].replace(/\w+(Left|Right)\b/g,"")+" "+style+"HintOuter "+(add?add+"Outer ":"")+(ovc?style+"HintOuterCenter ":A[1].indexOf("OverflowLeft")>=0?style+"HintOuterRight ":"")+style+"Hint"+row.Kind+"Outer'>"
              + A[0]+(rot?"</td></tr>"+CTableEnd:"</div>")+"</div>";

var P = show==2||show==5 ? E : this.CellToWindow(row,col,8), scx = 0, scy = 0;
MS.Scale;
scx = this.Scale||this.ScaleX ? (this.Scale?this.Scale:1)*(this.ScaleX?this.ScaleX:1) : 0;
scy = this.Scale||this.ScaleY ? (this.Scale?this.Scale:1)*(this.ScaleY?this.ScaleY:1) : 0;
ME.Scale;

if(col==this.MainCol && !this.HideTree && !row.Fixed){
   if(this.SpannedTree){
      var cl = cell.offsetLeft;
      if(scx) cl *= scx;
      P.Width -= cl;
      P.AbsX +=  cl;
      }
   else {
      var left = 0, lev = row.Level; if(this.HideRootTree) lev--;
      if(lev>=0) left += I.Tree;
      if(lev>0) left += lev*I.Line;
      if(scx) left *= scx;
      if(!this.Rtl) P.AbsX += left; 
      P.Width -= left;
      }
   }

MS.SideButton; if(wb){ P.AbsX += wb; P.Width -= wb; } ME.SideButton;
var Q = GetWindowSize(), q0 = Q[0]-P.AbsX-7, q1 = Q[1]-P.AbsY-7; 
var S = GetWindowScroll(); q0 += S[0]; q1 += S[1];
tag.style.left = "10px"; tag.style.top = "0px"; tag.style.maxWidth = (Q[0]-7)+"px"; 
this.AppendTag(tag);
MS.Scale;
if(scx){
   tag.style.transform = "scale("+scx+","+scy+")";
   tag.style.transformOrigin = this.Rtl?"100% 0":"0 0";
   }
ME.Scale;
var F = tag.firstChild.firstChild, FF = F.firstChild;
if(rot) FF = FF.firstChild.firstChild.firstChild;
else  if(FF && FF.nodeType==1) { FF.style.overflow = "visible"; FF.style.maxHeight = ""; } 
MS.SideButton;
if(wb){
   s = GetStyle(F);
   var p = parseInt(s.paddingLeft);
   if(p && p>wb) p -= wb;
   else p = 0;
   F.style.paddingLeft = p +"px";
   if(BIE) sw-=wb;
   }
ME.SideButton;

if(BIE){
   if(cell!=cf) {
      var s = GetStyle(cell);
      var pw = parseInt(s.paddingLeft); if(pw) sw += pw;
      var pw = parseInt(s.paddingRight); if(pw) sw += pw;
      }
   sw += GetBorderWidth(GetStyle(F),1); 
   }
else if(BIEA || BSafari || BFF20){
   var s = GetStyle(cf);
   var pw = parseInt(s.paddingLeft); if(pw) sw -= pw;
   if(!BIEA8) { var pw = parseInt(s.paddingRight); if(pw) sw -= pw; }
   }
else if(D) { 
   var s = GetStyle(cf);
   sw -= GetBorderWidth(s);
   }
tag.style.overflow = "hidden";
F.style.width = sw+"px";

var W = F.offsetWidth, H = F.offsetHeight; 
if(scx) W = Math.ceil(W*scx); 
if(scy) H = Math.ceil(H*scy);
if(D) D.innerHTML = "";

if(ovc && W>P.Width) { 
   var dw = W/2 - P.Width/2;
   if(ctr) { dw -= ctr[3]/2; FF.style.marginLeft = (ctr[3]<0 ? -ctr[3]/2 : -ctr[3])+"px"; }
   P.AbsX -= dw; q0 += dw; tag.style.maxWidth = (q0-7)+"px"; 
   }
else if((this.Rtl||A[1].indexOf("OverflowLeft")>=0) && W > P.Width) { P.AbsX -= W - P.Width; q0 += W - P.Width; tag.style.maxWidth = (q0-7)+"px"; }
if(W < P.Width) W = P.Width;
if(W > q0) {
   if(this.ShiftHint) { P.AbsX -= W-q0; q0 = W; }
   W = q0;
   }
if(P.AbsX<S[0]+7) { W -= S[0]+7-P.AbsX; q0 -= S[0]+7-P.AbsX; P.AbsX = S[0]+7; }
if(BIE) W -= 2; 
if(W != tag.offsetWidth){ 
   if(W<=0) { tag.parentNode.removeChild(tag); return; }
   
   if(scx) W /= scx;
   if(BIE || BIEA&&!BIEA8){
      F.style.width = W+"px";
      if(!BIE && F.offsetWidth > W) F.style.width = (W*2-F.offsetWidth)+"px";
      }
   else { 
      var FW = document.createElement("div");
      FW.innerHTML = F.innerHTML;
      FW.style.width = W+"px"; FW.style.overflow = "hidden";
      F.innerHTML = ""; F.appendChild(FW); F.style.width = "";
      if(!BIE && F.offsetWidth > W) FW.style.width = (W*2-F.offsetWidth)+"px";
      }
   }
if(H < P.Height) H = P.Height;
if(H > q1) H = q1;
if(H != tag.offsetHeight){ 
   if(H<=0) { tag.parentNode.removeChild(tag); return; }
   if(scy) H /= scy;
   F.style.height = H+"px";
   F.parentNode.style.height = H+"px";
   if(!BIE && F.offsetHeight > H) F.style.height = (H*2-F.offsetHeight)+"px";
   }

tag.style.left = P.AbsX+"px"; tag.style.top = P.AbsY+"px"; tag.style.visibility = ""; tag.style.overflow = "";

var F = new Function("ev","return "+this.This+".GridMouseWheel(ev);");
if(tag.onwheel || window.WheelEvent) tag.addEventListener('wheel',F,false);
else { tag.onmousewheel = F; if(tag.addEventListener) tag.addEventListener('DOMMouseScroll',F,false); }
if(BIEA) tag.onselectstart = new Function("return false;");
var N = ["GridClick","GridDblClick","GridRightClick","GridMouseDown","GridMouseUp"];
var E = ["onclick","ondblclick","oncontextmenu","onmousedown","onmouseup"];
for(var i=0;i<N.length;i++) tag[E[i]] = new Function("ev","return "+this.This+"."+N[i]+(BIEA?"(event);":"(ev);"));

var E = this.CellToWindow(row,col), max = P.AbsY-EventToAbsolute({clientX:0,clientY:0})[1]+E.Height-E.OverBottom, next = this.GetNextVisible(row.RowSpan||row[col+"Visible"]==-2?this.GetLastSpanRow(row,col):row);
tag.onmousemove = new Function("ev",(BIEA?"ev=event;":"")+"if(ev.clientY>"+max+")"+this.This+".ARow="+(next?this.This+".Rows['"+next.id+"']":"null")+";return "+this.This+".GridMouseMove(ev);");

this.Hint = tag;
this.HintPerm = permanent;
if(permanent) this.NoHideHintTo = new Date()-0+500;

var ss = document.createElement("div");
ss.className = style+"HintShadow "+(add?add+"Shadow ":"")+style+"Hint"+row.Kind+"Shadow";
ss.style.left = tag.style.left;
ss.style.top = tag.style.top;
ss.style.height = tag.offsetHeight+"px";
ss.style.width = tag.offsetWidth+"px";
MS.Scale;
if(scx){
   ss.style.transform = "scale("+scx+","+scy+")";
   ss.style.transformOrigin = this.Rtl?"100% 0":"0 0";
   }
ME.Scale;

tag.parentNode.insertBefore(ss,tag);
if(this.ZIndex!=null) { tag.style.zIndex = this.ZIndex+9; ss.style.zIndex = this.ZIndex+8; }

MS.Animate;
if(this.AnimateDialogs && !this.SuppressAnimations){
   var add = h+2<sh ? "Vert" : "Horz", A = this.Animations;
   var anim = A["ShowHint"+add]; if(!anim) anim = A["ShowHint"];
   if(anim) { Animate(tag,anim); Animate(ss,anim); tag.vertanim = h+2<sh; }
   }
ME.Animate;

return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.TestCellWidth = function(row,col){ return this.ShowHint(row,col,null,null,1); }
// -----------------------------------------------------------------------------------------------------------
ME.Hint;
// -----------------------------------------------------------------------------------------------------------

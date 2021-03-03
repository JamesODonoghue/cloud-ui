// -----------------------------------------------------------------------------------------------------------
// Support functions for rendering into HTML
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
MS.Tree;
var CTreeIcons = {"T":0,"TL":1,"E":2,"EL":3,"C":4,"CL":5,"D4":8,"D4L":9,"D1":10,"D1L":11,"D2":12,"D2L":13,"D3":14,"D3L":15,"D0":16,"D0L":17  }
var CTreeImage = BIEA&&!BIE||BEdge ? "IE'>&#65279;</u>" : (BStrict?"IE'></u>" : "'></u>"); 
var CTreeImageTD = CTreeImage.replace("</u>","</td>");
// -----------------------------------------------------------------------------------------------------------
TGP.GetMainIconHTML = function(row,valign,drag){
if(row.Fixed || this.HideTree) return ""; 
var prefix = " "+this.Img.Style, spn = this.SpannedTree;

MS.RowSpan;
if(row.RowSpan && row[this.MainCol+"RowSpan"]>1 && !(row[this.MainCol+"RowSpan"]%1) && !row.firstChild) { 
   while(row.nextSibling&&row.nextSibling[this.MainCol+"RowSpan"]==0) row = row.nextSibling;
   }
ME.RowSpan;
var but = drag==null ? (this.HasChildren(row) && Get(row,"CanExpand")&1 ? (row.Expanded ? 'C' : 'E') : 'T') : 'D'+drag; 

if(this.NoTreeLines||this.Rtl){
   var cls = prefix+"NoTreeLines"+this.NoTreeLines, w; MS.ReversedTree; if(this.ReversedTree) cls += prefix+"NTreeRev"; ME.ReversedTree;
   
   var nam = "TreeIcon"+CTreeIcons[but], cust = row[nam]; if(cust==null) cust = row.Def[nam];
   if(spn){
      if(drag==null) { 
         var nam = "TreeWidth"+(but=="T"?1:2); 
         w = row[nam]; if(w==null) w = row.Def[nam]; 
         row.TreeWidthT = w>=0?w:null; 
         }
      else w = row.TreeWidthT;
      var w0 = row.TreeWidth0; if(w0==null) w0 = row.Def.TreeWidth0;
      row.TreeWidthL = w0>=0?w0:null; 
      var wspn = (row.Level-(this.HideRootTree?1:0)) * (w0>=0?w0:this.Img.Line) + (w>=0?w:this.Img.Tree);
      if(cust) return [cls,"<u style='width:"+wspn+"px;background-image:url("+(this.EscapeImages?'"'+this.Lang.Format.Escape(cust)+'"':cust)+");' class='"+prefix+"NIcon"+prefix+"NTreeImage'></u>",wspn];
      return [cls,"<u"+(drag==null?" style='width:"+wspn+"px;'":"")+" class='"+(but=="T"?"":prefix+"N"+but)+prefix+"NTreeImage'></u>",wspn];
      }
   if(cust) return [cls,"<u style='background-image:url("+(this.EscapeImages?'"'+this.Lang.Format.Escape(cust)+'"':cust)+");' class='"+prefix+"NIcon"+prefix+"NTreeImage'></u>"];
   
   if(this.NoTreeLines==2||valign&&but!="T") return [cls,"<u class='"+prefix+"N"+but+prefix+"NTreeImage'></u>"];
   return [cls+prefix+"N"+but+prefix+"NTree",CNBSP];
   }

var cls = prefix+"Tree", s = "", i, icon;
var lev = row.Level; if(this.HideRootTree){ lev--; if(lev<0) return [cls,CNBSP]; }
if(!row.LevelImg) but += 'L';
var add = prefix+"Tree"+(row.LevelImg?"T":"L");
if(!valign) valign = this.Img.TreeAlign; else if(BIEStrict&&!BIEA8) valign = "Top";  
var IE = BIE&&valign!="Top"&&!spn; 
var ct = prefix+"Tree"+valign; MS.ReversedTree; if(this.ReversedTree) ct += prefix+"TreeRev"; ME.ReversedTree;

var nam = "TreeIcon"+CTreeIcons[but], cust = row[nam]; if(cust==null) cust = row.Def[nam];
if(cust){ 
   var ww = "", w;
   if(spn) {
      if(drag==null){
         var nam = "TreeWidth"+(but=="T"||but=="TL"?1:2);
         w = row[nam]; if(w==null) w = row.Def[nam];
         }
      else w = row.TreeWidthT;
      if(w>=0) { row.TreeWidthT = w; ww = "padding-left:"+w+"px;"; }
      }
   s = (IE?"<td":"<u")+" style='"+ww+"background-image:url("+(this.EscapeImages?'"'+this.Lang.Format.Escape(cust)+'"':cust)+");' class='"+prefix+"TreeIcon"+ct+prefix+"Width1T"+add+prefix+"TreeImage"+(IE?CTreeImageTD:CTreeImage);
   if(!lev--) return [cls,IE ? CTableCSP0+"height='100%'"+CTfoot+"<tr>"+s+"</tr>"+CTableEnd : s];
   i = 0; icon = "";
   row = row.parentNode; while(row.Expanded&2) row = row.parentNode;
   }

else if(drag==null) {
   if(!lev--) return spn ? [cls,"<u class='"+prefix+but+ct+prefix+"Width1T"+add+prefix+"TreeImage"+CTreeImage] : [cls+prefix+but+ct+prefix+"Width1T"+add,CNBSP];
   row = row.parentNode; i = 2; while(row.Expanded&2) row = row.parentNode;
   icon = row.LevelImg+but; if(!lev--) return spn ? [cls,"<u class='"+prefix+icon+ct+prefix+"Width2T"+add+prefix+"TreeImage"+CTreeImage] : [cls+prefix+icon+ct+prefix+"Width2T"+add,CNBSP];
   row = row.parentNode; while(row.Expanded&2) row = row.parentNode;
   if(but=='T'){ 
      icon = row.LevelImg + icon; if(!lev--) return spn ? [cls,"<u class='"+prefix+icon+ct+prefix+"Width3T"+add+prefix+"TreeImage"+CTreeImage] : [cls+prefix+icon+ct+prefix+"Width3T"+add,CNBSP];
      row = row.parentNode; while(row.Expanded&2) row = row.parentNode;
      icon = row.LevelImg + icon; if(!lev--) return spn ? [cls,"<u class='"+prefix+icon+ct+prefix+"Width4T"+add+prefix+"TreeImage"+CTreeImage] : [cls+prefix+icon+ct+prefix+"Width4T"+add,CNBSP];
      row = row.parentNode; while(row.Expanded&2) row = row.parentNode;
      i = 4;
      }
   }

else {
   icon = but; 
   if(!lev--) return spn ? [cls,"<u class='"+prefix+icon+ct+prefix+"Width1T"+add+prefix+"TreeImage"+CTreeImage] : [cls+prefix+icon+ct+prefix+"Width1T"+add,CNBSP];
   row = row.parentNode; i = 1; while(row.Expanded&2) row = row.parentNode;
   }

if(i) { 
   s = (IE?"<td":"<u")+" class='"+prefix+icon+ct+prefix+"Width"+i+"T"+add+prefix+"TreeImage"+(IE?CTreeImageTD:CTreeImage); 
   icon = "";
   }

var cust = row.TreeIcon6; if(cust==null) cust = row.Def.TreeIcon6;
if(cust){
   var ww = "";
   if(spn) {
      var w = row.TreeWidth0; if(w==null) w = row.Def.TreeWidth0;
      if(w>=0) { row.TreeWidthL = w; ww = "padding-left:"+w+"px;"; }
      }
   var cust2 = row.TreeIcon7; if(cust2==null) cust2 = row.Def.TreeIcon7;
   for(;row&&lev>=0;row=row.parentNode) if(!(row.Expanded&2)){
      var icon = row.LevelImg-0?cust:cust2; icon = icon ? " style='"+ww+"background-image:url("+((this.EscapeImages?'"'+this.Lang.Format.Escape(icon)+'"':icon))+");'" : (ww?" style='"+ww+"'":"");
      s = (IE?"<td":"<u")+icon+" class='"+prefix+"TreeIcon"+ct+prefix+"Width1"+prefix+"TreeImage"+(IE?CTreeImageTD:CTreeImage) + s;
      lev--;
      } 
   return [cls,IE ? CTableCSP0+"height='100%'"+CTfoot+"<tr>"+s+"</tr>"+CTableEnd : s];
   }

for(i=0;row;row=row.parentNode) if(!(row.Expanded&2)){
   if(i==3) { s = (IE?"<td":"<u")+" class='"+prefix+icon+ct+prefix+"Width"+i+prefix+"TreeImage"+(IE?CTreeImageTD:CTreeImage)+s; icon = ""; i = 0; }
   icon = row.LevelImg + icon; 
   i++; 
   if(!lev--) {
      s = (IE?"<td":"<u")+" class='"+prefix+icon+ct+prefix+"Width"+i+prefix+"TreeImage"+(IE?CTreeImageTD:CTreeImage) + s;
      return [cls,IE ? CTableCSP0+"height='100%'"+CTfoot+"<tr>"+s+"</tr>"+CTableEnd : s];
      }
   }  
return [cls,CNBSP];  
}
ME.Tree;
// -----------------------------------------------------------------------------------------------------------
MS.Img;
TGP.GetImgHTML = function(row,col,val){
if(!val || typeof(val)!="string") return CNBSP;
val = val.split(val.charAt(0));
if(val[1]=="") return CNBSP;
var f = this.GetFormat(row,col), pr = "", po = "", L = this.Lang.Format;
if(f){
   var ff = this.Formats[f];
   if(!ff) { ff = f.split(f.charAt(0)); this.Formats[f] = ff; }
   if(ff[3]) pr = ff[3]; 
   if(ff[4]) po = ff[4];
   val[1] = (ff[7]&1 && this.BaseUrl?this.BaseUrl:"")+(ff[1]?ff[1]:"")+val[1]+(ff[2]?ff[2]:"");
   if(val[6]) val[6] = (ff[7]&2 && this.BaseUrl?this.BaseUrl:"")+(ff[5]?ff[5]:"")+val[6]+(ff[6]?ff[6]:"");
   }
var cursor = val[6];
if(cursor) {
   var win = this.GetAttr(row,col,"LinkTarget"); if(win==null) win = this.LinkTarget;
   var bas = this.GetAttr(row,col,"LinkBase"); if(bas==null) bas = this.LinkBase;
   pr += "<a href='"+L.Escape(bas&&val[6].indexOf("://")<0?bas+val[6]:val[6])+"'"+(win?" target='"+win+"'":"")+">"; 
   po = "</a>"+po;
   val[6] = ""; 
   }
if(!val[4]||!val[5]){ 
   if(val[3] && BMozilla){ 
      pr = "<div style='display:inline-block;overflow:hidden;height:"+val[3]+"px;'>"; po = "</div>";
      }
   val = pr+"<img border='0'"+(val[2]?" width='"+val[2]+"'":"")+(val[3]?" height='"+val[3]+"'":"")+" src='"+this.GetUrl(L.Escape(val[1]))+"'"+(cursor?" style='"+CCursorPointer+"' title='"+L.Escape(val[6])+"'":"")+"/>"+po;
   }

else val = pr+(BIEA6 ? "<span><b": "<div")+" style='"+(cursor?CCursorPointer:"")+"width:"+val[2]+"px;height:"+val[3]+"px;overflow:hidden;background:url(\""+this.GetUrl(L.Escape(val[1]))+"\") -"+val[4]+"px -"+val[5]+"px;'"+(cursor?" title='"+L.Escape(val[6])+"'":"")+">"+(BIEA6 ? "</span></b>": "</div>")+po;
return val;
}
ME.Img;
// -----------------------------------------------------------------------------------------------------------
MS.Img;
TGP.GetLinkHTML = function(row,col,val){
if(!val || typeof(val)!="string") return CNBSP;
val = val.split(val.charAt(0));
var f = this.GetFormat(row,col), pr = "", po = "", cursor = 1;
if(f){
   var ff = this.Formats[f];
   if(!ff) { ff = f.split(f.charAt(0)); this.Formats[f] = ff; }
   if(ff[3]) pr = ff[3]; 
   if(ff[4]) po = ff[4];
   val[1] = (ff[5]&1 && this.BaseUrl?this.BaseUrl:"")+(ff[1]?ff[1]:"")+val[1]+(ff[2]?ff[2]:"");
   }   
if(this.Trans&&val[2]) val[2] = this.Translate(row,col,val[2],"Link");
var win = val[3]; if(!win) win = this.GetAttr(row,col,"LinkTarget"); if(win==null) win = this.LinkTarget;
var bas = this.GetAttr(row,col,"LinkBase"); if(bas==null) bas = this.LinkBase;
val = pr+"<a href='"+this.Lang.Format.Escape(bas&&val[1].indexOf("://")<0?bas+val[1]:val[1])+"'"+(win?" target='"+win+"'":"")+(cursor?"":" style='cursor:default;'")+">"+(BIEA?"<span>":"")+(val[2]?val[2]:val[1])+(BIEA?"</span>":"")+"</a>"+po; 
return val;
}
ME.Img;
// -----------------------------------------------------------------------------------------------------------
MS.Panel;
TGP.GetPanelHTML = function(row,col,val){
val = (val+"").split(','); 
var L = this.Lang.Format, prefix = " "+this.Img.Style, esc = this.EscapeImages, C = this.Cols[col]; if(!C) C = {};
var rpanc = row.Kind=="Panel"&&C.Type!="Panel", D = row.Def;
var o = "", t = BTablet ? " "+prefix+"PanelTouch" : "", hasb = 0;
var pancls = prefix+"PanelImage", setw = "width:", u, pre = "<u class='"+pancls+prefix;
for(var k=0;k<val.length;k++){
   var v = val[k]; if(!v) v = "Empty";
   var vv = row[col+v]; if(vv==null) vv = D[col+v]; if(vv==null) { if(rpanc) { vv = row[v]; if(vv==null) vv = D[v]; } else if(!CPanelButtons[v]||!(C[v]-0)) vv = C[v]; }
   var vw = row[col+v+"Width"]; if(vw==null) vw = D[col+v+"Width"]; if(vw==null) { if(rpanc) { vw = row[v+"Width"]; if(vw==null) vw = D[v+"Width"]; } else vw = C[v+"Width"]; }
   vw = vw ? setw+vw+"px;" : "";
   if(vv) vv = "<u style='background-image:url("+(esc?'"'+L.Escape(vv)+'"':vv)+");"+vw+"' class='"+pancls+t+"'></u>"; 
   if(v=="Move"){ if(this.Dragging) { u = Is(row,"CanDrag"); o += vv&&u ? vv : pre+"PanelMove"+(u?"":"Off")+t+"'></u>"; } }
   else if(v=="MoveAll"){ if(this.Dragging) o += vv ? vv : pre+"PanelMove"+t+"'></u>"; }
   else if(v=="Select" || v=="SelectAll"){ if(this.Selecting) {
      u = this.CanSelect(row,this.SelectingCells==2);
      var vs = row.Selected&1 || row.Selected==2&&C.Select!=2&&this.SelectingCells<3;
      if(v=="SelectAll") { u = 1; vs = this.SelectAllType && this.AllSelected; }
      if(vv&&u){ 
         var vv1 = vs ? Get(row,col+v+1) : 0; if(vv1==null) vv1 = rpanc ? Get(row,v+1) : C[v+1];
         o += vv1 ? "<u style='background-image:url("+(esc?'"'+L.Escape(vv1)+'"':vv1)+");"+vw+"' class='"+pancls+t+"'></u>" : vv; 
         }
      else o += pre+"PanelSelect"+(u?(vs?"On":""):"Off")+t+"'></u>"; 
      } }
   else if(v=="Delete"){ if(this.Deleting) { u = Is(row,"CanDelete"); o += vv&&u ? vv : pre+"PanelDelete"+(u?"":"Off")+t+"'></u>"; } }
   else if(v=="DeleteAll"){ if(this.Deleting) o += vv ? vv : pre+"PanelDelete"+t+"'></u>"; }
   else if(v=="Copy"){ if(this.Copying) { u = Is(row,"CanCopy"); o += vv&&u ? vv : pre+"PanelCopy"+(u?"":"Off")+t+"'></u>"; } }
   else if(v=="CopyAll"){ if(this.Copying) o += vv ? vv : pre+"PanelCopy"+t+"'></u>"; }
   else if(v=="ColMove"){ if(this.ColMoving) o += vv&&C.CanMove ? vv : pre+"PanelMove"+(C.CanMove ? "" : "Off")+t+"'></u>"; }
   else if(v=="ColMoveAll"){ if(this.ColMoving) o += vv ? vv : pre+"PanelMove"+t+"'></u>"; }
   else if(v=="ColSelect"||v=="ColSelectAll"){ if(this.Selecting&&(this.SelectingCols||this.SelectingCells)) {
      u = (C.CanSelect==1||C.CanSelect==2&&this.SelectingCols)&&(!C.Deleted||!(this.ClearSelected&1)||!this.SelectingCols)||C.CanSelect==3&&this.SelectingCells;
      var vs = C.Selected;
      if(v=="ColSelectAll"){ u = 1; vs = this.SelectAllType && this.AllColsSelected; }
      if(vv&&u){
         var vv1 = vs ? Get(row,col+v+1) : 0; if(vv1==null) vv1 = rpanc ? Get(row,v+1) : C[v+1];
         o += vv1 ? "<u style='background-image:url("+(esc?'"'+L.Escape(vv1)+'"':vv1)+");"+vw+"' class='"+pancls+t+"'></u>" : vv; 
         }
      else o += pre+"PanelSelect"+(u?(vs?"On":""):"Off")+t+"'></u>";
      } }
   
   else if(v=="ColDelete"){ if(this.ColDeleting) o += vv&&C.CanDelete ? vv : pre+"PanelDelete"+(C.CanDelete ? "" : "Off")+t+"'></u>"; }
   else if(v=="ColDeleteAll"){ if(this.ColDeleting) o += vv ? vv : pre+"PanelDelete"+t+"'></u>"; }
   else if(v=="ColCopy"){ if(this.ColAdding&this.ColCopying&[4,1,2][C.MainSec]) o += vv&&C.CanCopy ? vv : pre+"PanelCopy"+(C.CanCopy ? "" : "Off")+t+"'></u>"; }
   else if(v=="ColCopyAll"){ if(this.ColAdding&&this.ColCopying) o += vv ? vv : pre+"PanelCopy"+t+"'></u>"; }
   else if(vv) { if(this.Trans) vv = this.Translate(row,col,vv,"Panel"); o += vv; }
   else if(v=="Empty") o += pre+"PanelEmpty"+t+"' style='"+vw+"'></u>";
   else {
      if(!hasb && this.UseButton&4){ o = ""; k = -1; pancls = prefix+"PanelImageButton"; pre = "<u class='"+pancls+prefix; setw = "width:"; t = BTablet ? " "+prefix+"PanelTouchButton" : ""; hasb = 1; continue; } 
      if(this.Trans) v = this.Translate(row,col,v,"Panel");
      o += (this.UseButton&4?"<button":"<u")+" class='"+prefix+"GridButton"+prefix+"PanelButton"+(BTablet?" "+prefix+"PanelButtonTouch":"")+"'"+(vw?" style='"+vw+"'":"")+">"+v+(this.UseButton&4?"</button>":"</u>");  
      }
   }
return o;
}
ME.Panel;
// -----------------------------------------------------------------------------------------------------------
TGP.GetGanttHTML = function(row,col,val,type){
var C = this.Cols[col]; if(!C) C = {};
if(!row.Abs) row.Abs = {};
row.Abs[col] = 1;
val += "";
var v = val.split(val.charAt(0)), vlen = v.length, s = "", cnt = 8, xp = 0, rtlm = "margin-left:", xp = 0;
 

var H = 5000;
if(this.Printing){ 
   H = this.GetRowHeight(row);
   var HH = this.GanttPrintRowHeight?this.GanttPrintRowHeight:50; if(H<HH) H = HH;
   }

  
var ovl = C.GanttTextOverlay||this.Printing&&C.BodyBackground&&(this.PrintGanttBackground==2||this.PrintGanttBackground==4)&&(!BIEA||BIEA9)&&this.Img.GanttHasSvgBack ? (BIE8Strict&&!BIEA10?"filter:alpha(opacity=99);":"opacity:0.99999;") : ""; 
var lh = 0; 
var BH = this.ZoomBorder!=1 ? this.Img.GanttZoomHeights : null;
for(var k=1;k<vlen;k+=cnt){
   var x = v[k]-xp, y = v[k+1]-0, w = v[k+2]; 
   var h = v[k+3]; h = h==="" ? H : h-0;
   var hp = v[k+7]-0; if(!hp||BIE) hp = 0;
   if(hp&&BH){ 
      var dh = BH[h]; if(!dh) { BH[h] = GetZoomBorderWidth(-h,this.Img.Size); dh = BH[h]; }
      hp += dh-h;
      }
   var vv = v[k+4], cls = v[k+5]; cls = cls?" class='"+cls+"'":"";
   var b = y+h+hp;
   s += "<div"+(cnt>8&&v[k+8]?" id='"+v[k+8]+"'":"")+cls+" style='"+(x?rtlm+x+"px;":"")+(w?"width:"+w+"px;":"") 
      + ovl + "margin-top:"+(y<0?y-lh:y)+"px;height:"+h+"px;margin-bottom:"+(-b)+"px;overflow:"+(vv&&vv!=CNBSP?"hidden":"visible")+";"+(v[k+6]?v[k+6]:"")+"'>"
      + vv + "</div>";
   lh = b;
   }

val = s + "<div style='overflow:hidden;height:"+H+"px;margin-bottom:-"+H+"px;'></div>";
if(this.Printing&&!this.Print&&(!row.RowSpan||row[col+"RowSpan"]<2)) val = "<div style='height:"+this.GetPrintRowHeight(row)+"px;overflow:hidden;'>"+val+"</div>"; 
return val;
}
// -----------------------------------------------------------------------------------------------------------
MS.Radio;
TGP.GetRadioHTML = function(row,col,val,ce,wrap,align){
var rp = this.GetRelatedPrefix(row,col), ena = this.GetEnum(row,col,"Enum",rp), ek = this.GetEnum(row,col,"EnumKeys",rp), range = this.IsRange(row,col);
if(!ena) return CNBSP;
var L = this.Lang.Format, prefix = " "+this.Img.Style, esc = this.EscapeImages, C = this.Cols[col]; if(!C) C = {};
var right = this.GetAttr(row,col,"RadioRight"), ic = this.GetAttr(row,col,"RadioIcon");
var vv = "", chk, pre, po, ien = ek ? 0 : this.IsIndexEnum(val,range,ena),fadd = null;
var en = ena.slice(1).split(ena.charAt(0)), el = en.length;
if(ek) ek = ek.slice(1).split(ek.charAt(0));
MS.Filter;
if(row.Kind=="Filter"){
   var fof = Get(row,col+"FilterOff"); fadd = fof ? null : this.GetText("RadioFilterOff");
   if(fof && (ek||!this.IsIndexEnum(fof,0,ena))){
      var ee = ek?ek:en;
      for(var k=0;k<ee.length;k++) if(ee[k]==fof) break;
      if(k==ee.length) fadd = fof;
      }
   if(fadd) el++;   
   }
ME.Filter;   
MS.Range;
if(range) {
   if(!val&&val!="0") val = [];
   else {
      var vr = (val+"").split(L.ValueSeparator); val = [];
      for(var l=0;l<vr.length;l++) val[vr[l]] = 1;
      }
   }
ME.Range;   
if(wrap!=1) vv += CTableCSP0+(align?" align='"+align+"'":"")+CTfoot;
if(wrap==0) vv += "<tr>";
if(wrap==2){ pre = "<tr><td"; po = "</td></tr>"; }
else if(wrap==1){ 
   if(BIEA&&!BIE8Strict || BOpera){ 
      pre = "<nobr>&#65279;<span"; po = "</span></nobr> "; 
      
      } 
   else { pre = "<nobr"; po = "</nobr> "; }
   }
else { pre = "<td"; po = "</td>"; }
var cic = 0;
if(ic&&!(ic-0) && !this.PrintingCheckboxes) {                  
   ic = ic.slice(1).split(ic.charAt(0)); cic = 1;
   var icw = row[col+"RadioIconWidth"]; if(icw==null) icw = row.Def[col+"RadioIconWidth"]; if(icw==null) icw = C.RadioIconWidth;
   }
var rwrap = row[col+"RadioWrap"]; if(rwrap==null) rwrap = row.Def[col+"RadioWrap"]; if(rwrap==null) rwrap = C.RadioWrap;
rwrap = rwrap||rwrap=="0" ? prefix+"Wrap"+rwrap : "";
for(var k=0;k<el;k++){ 
     if(range){
        if(ek) chk = val[ek[k]]?1:0;
        else if(ien) chk = val[k]?1:0;
        else chk = val[en[k]]?1:0;
        }
     else if(ek) chk = val==ek[k];
     else if(ien) chk = val==k;
     else chk = val==en[k];
     var txt = en[k]; if(this.Trans) txt = this.Translate(row,col,txt,"Radio");
     if(fadd && k==el-1) txt = fadd;
   if(ic==6) vv += pre+" class='"+rwrap+(txt?"":prefix+"None")+prefix+"RadioBase"+prefix+"RadioNone"+(chk?prefix+"RadioChecked":"")+"'>"+txt+po;
   else if(cic) {
      var vale = null; if(!ce) vale = ic.length>4 ? ic[chk+k*2+el*2] : ic[chk?3:2];
      if(!vale) vale = ic[chk+k*2]?ic[chk+k*2]:ic[chk?1:0];
      vv += pre+" style='background-image:url("+(esc?'"'+L.Escape(vale)+'"':vale)+");"+(icw?"padding-"+(right?"right":"left")+":"+icw+"px;":"") + "' class='"+(txt?"":prefix+"None")+prefix+"RadioBase"+prefix+"RadioIcon"+(right?"Right":"Left")+(chk?prefix+"RadioChecked":"")+"'>"+txt+po;
      }
   else if(this.PrintingCheckboxes || ic>=3){
      var v = "<span class='"+rwrap+prefix+"RadioText"+(chk?prefix+"RadioChecked":"")+"'>"+txt+"</span>";
      vv += pre+" class='"+rwrap+prefix+(txt?"RadioCell":"None")+"'>"+(right?v:"")+"<input"+(BIPAD?" ontouchend='TGCancelEvent(event,2);' onclick='TGCancelEvent(event,2);'":"")+" class='"+prefix+"RadioInput' type='"+(ic==5||ic==3&&range?"checkbox":"radio")+"'"+(ce==1?"":" disabled")+(this.PrintingCheckboxes? " disabled"+CXHTML:"")+(chk?" checked"+CXHTML:"")+">"+(wrap==0?"</td><td>":"")+(right?"":v)+po;
      }
   else vv += pre+" class='"+rwrap+(txt?"":prefix+"None")+prefix+"RadioBase"+prefix+"Radio"+(right?"Right":"Left")+prefix+"Radio"+(chk+(ic==2||!ic&&range?2:0))+(right?"Right":"Left")+(chk?prefix+"RadioChecked":"")+"'>"+txt+po;
     }
if(wrap==0) vv += "</tr>";
if(wrap!=1) vv += CTableEnd;
return vv;
}
ME.Radio;
// -----------------------------------------------------------------------------------------------------------
MS.List;
TGP.GetListHTML = function(row,col,val){
var L = this.Lang.Format, C = this.Cols[col]; if(!C) C = {};
if(!val) val = "|"+CNBSP; else val += "";
val = val.split(val.charAt(0));
var f = this.GetFormat(row,col);
if(!f) return val.join("");
var vv = "", ff = this.Formats[f];
if(!ff) { ff = f.split(f.charAt(0)); this.Formats[f] = ff; }
var ffl = ff.length, k=5, btt = ff[1]-0, vl = val.length;
if(ff[2]) vv += ff[2];
for(var l=1;l<vl;l++){
   if(ff[k] && (l!=1 || !(btt&1))) vv += ff[k];
   if(ff[k+2]) val[l] = val[l].replace(new RegExp(ff[k+2],ff[k+3]),ff[k+4]);
   if(val[l]) {
      if(this.Trans) val[l] = this.Translate(row,col,val[l],"List");
      vv += btt&2 ? L.Escape(val[l]) : val[l];
      }
   if(ff[k+1] && (l!=vl-1 || !(btt&1))) vv += ff[k+1];
   k+=6; if(k>=ffl) k=5;
   }
if(ff[3]) vv += ff[3];
return vv;
}
ME.List;
// -----------------------------------------------------------------------------------------------------------
MS.Group;
TGP.GetDropColsHTML = function(row,col,val){
var style = this.Img.Style, C = this.Cols[col]; if(!C) C = {};
var ff = null, f = this.GetFormat(row,col);
if(f) {
   var ff = this.Formats[f]; 
   if(!ff){ ff = FromJSON(f,1); this.Formats[f] = ff; }
   }
val = val?(val+"").split(','):[];
var s = CTableCSP0+CTfoot+"<tr>", PG = this.PivotGrid; 
for(var k=0;k<val.length;k++){
   
   s += "<td"+(this.TestIds?this.GetItemId("DropCols",row,col,k,1):"")+" class='"+style+"HeaderGroup'><div style='white-space:nowrap;overflow:hidden'>";
   var v = val[k];
   if(ff && ff[v]!=null) v = ff[v];
   else if(this.Cols[v]||this.Header[v]) v = this.GetCaption(v);
   else if(PG && PG.Cols[v]) v = PG.GetCaption(v);
   s += v;
   s += "</div></td>";
   }
var txt = Get(row,col+"Text"); if(txt==null) txt = this.GetText("GroupCustom");   
if(txt) s +=  "<td nowrap"+CXHTML+(this.TestIds?this.GetItemId("DropColsText",row,col,null,1):"")+" class='"+style+"HeaderGroupCustom'><div style='overflow:hidden;'>"+txt+"</div></td>";
s += "</tr>"+CTableEnd;
row.RelWidth = 1;
row[col+"TmpWidth"] = null;
return s;
}
ME.Group;
// -----------------------------------------------------------------------------------------------------------
MS.Paging;
TGP.GetPagesHTML = function(row,col,wrap){
var cnt = this.XB.childNodes.length, maxp = Get(row,col+"Count"), all = !maxp || maxp >= cnt-2, ogp = Grids.OnGetPageNumber;
var val = "", style = this.Img.Style;
var p = this.GetFPage(1);
if(p) p = this.GetPageNum(p);
if(!all) {
   var max1 = Math.ceil(maxp/2)-1, max2 = Math.floor(maxp/2);
   var ap = p ? p : 0; 
   if(ap<max1) ap = max1;
   if(ap>=cnt-max2) ap = cnt-max2-1;
   max1 = ap-max1-1; max2 = ap+max2+1;
   var st = Get(row,col+"Step"), minst = [], maxst = []; 
   if(st) {
      st = (st+"").split(",");
      st.sort(function(a,b){ return a-b;} );
      for(var k=0;k<st.length;k++){
         minst[k] = 0; maxst[k] = cnt;
         st[k] -= 0;
         if(k>0) { minst[k-1] = ap-(ap+1-st[k-1])%st[k]-1; maxst[k-1] = ap-(ap+1+st[k-1])%st[k]+1 + st[k]; }
         
         }
      }
   }

for(var k=0;k<cnt;k++) {
   var ok = all || !k || k==cnt-1 || k>max1 && k<max2;
   if(!ok && st){ for(var l=0;l<st.length;l++) if(!((k+1)%st[l])&&k>minst[l]&&k<maxst[l]) { ok = 1; break; } }
   if(ok) {
      var k1 = k+1; if(ogp) { k1 = ogp(this,k1); if(k1==null) k1 = k+1; }
      val += "<a"+(this.TestIds?this.GetItemId("Pages",row,col,k+1,1):"")+" class='"+style+"PagesLink"+(k==p?"Active":"")+"' href='javascript: "+this.This+".GoToPageNum("+(k+1)+")'>"+k1+"</a>";
      }
   if(!all && (k==max1 || k==max2)) val += wrap==2 ? "<br/>" : CNBSP+CNBSP;
   }
return val;
}
ME.Paging;
// -----------------------------------------------------------------------------------------------------------
MS.File;
TGP.GetFileHTML = function(row,col,val,but,O){
var L = this.Lang.Format, I = this.Img, C = this.Cols[col]; if(!C) C = {};
var F = val ? val : null;
if(BIEA&&!BIEA10) return this.GetText("FileIE");
if(!F||!F.length) { 
   val = row[col+"EmptyValue"]; if(val==null) { val = row.Def[col+"EmptyValue"]; if(val==null) val = C.EmptyValue; } 
   return val==null ? CNBSP : val;
   }
val = "";
var f = this.GetFormat(row,col), sep = null; if(F.length>1) sep = this.GetAttr(row,col,"Separator");
if(sep==null) sep = L.ValueSeparatorHtml;
for(var k=0;k<F.length;k++){
   if(!f) val += (val?sep:"")+F[k].name;
   else {
      var ff = f;
      if(ff.indexOf("*Url*")>=0) { ff = ff.replace("*Url*",URL.createObjectURL(F[k],{oneTimeOnly: true})); O[0] = 1; }
      if(ff.indexOf("*Height*")>=0) ff = ff.replace(/\*Height\*/g,this.GetRowHeight(row)-I.CellBorderHeight);
      if(ff.indexOf("*Width*")>=0) ff = ff.replace(/\*Width\*/g,C.Width-(but?C.WidthPage:0)-I.CellBorderWidth);
      ff = ff.replace("*Name*",F[k].name).replace("*Size*",F[k].size).replace("*Type*",F[k].type);
      
      val += ff; if(k) val += sep;
      }
   
   }
return val;
}
ME.File;
// ---------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------
MS.ColSpan;
TGP.GetMergeHTML = function(row,col,val,mer){
var style = this.Img.Style;
mer = (mer+"").split(",");
if(mer.length==1) {
   if(!this.Cols[mer[0]]){
      MS.Debug; this.Debug(1,"Wrong cell Merge attribute used, Merge must be set as list of column names, comma separated"); ME.Debug;
      return val;
      }
   var vvis = row[mer[0]+"Visible"]==-3; 
   if(vvis) row[mer[0]+"Visible"] = null;
   val = this.GetRowHTML(row,null,9,mer[0]); 
   if(vvis) row[mer[0]+"Visible"] = -3;
   return val;
   }
var mt = Get(row,col+"MergeType")-0; if(!mt) mt = 0;
val = Get(row,col+"MergeFormat");
if(val!=null) {
   val = this.GetMergeValue(row,col,mer,val,mt,0);
   return val ? val : CNBSP;
   }
val = CTableCSP0+CTfoot;
if(!(mt&1)) val+="<tr>";
for(var m=0;m<mer.length;m++){
   if(mt&2 || this.Cols[mer[m]]&&this.Cols[mer[m]].Visible) {
      val += (mt&1?"<tr>":"")+"<td class='"+style+this.GetType(row,mer[m])+" "+style+"Type "+style+"MergedCell"+(mt&1?"V":"H")+"'>"+this.GetRowHTML(row,null,9,mer[m])+"</td>"+(mt&1?"</tr>":"");
      }
   }
if(!(mt&1)) val+="</tr>";   
val += CTableEnd;   
return val;
}
ME.ColSpan;
// ---------------------------------------------------------------------------------------------------------------------------
MS.SideButton;
TGP.GetButtonClass = function(row,col,but,ce,align){
MS.Defaults;
if(but=="Defaults") return this.PrintNoIcons ? "" : but+align;
ME.Defaults;
MS.Filter;
if(but=="Filter") {
   var cbut = col+"Filter", fl = row[cbut]; if(fl==null) fl = row.Def[cbut]; if(fl==null) fl = 0;
   if(!ce && !fl && Get(row,col+"ShowMenu")!=1 || col=="id") return "";
   return but+fl+align + " "+this.Img.Style+but+align;
   }
ME.Filter;   
MS.Sort;
if(but=="Sort"){
   if(this.SortIcons==0) return "";
   var ns = 0, rsi = this["ReversedSortIcons"];
   if(this.Sort.search(new RegExp("(^|,)-?"+col+"($|,)"))<0 && col!=this.DefaultSort) return Get(row,"SortIcons")==2 ? "" : but+"0"+align + " "+this.Img.Style+but+align;
   var sc = this.GetSort();
   for(var k=0,st=0;k<sc.length;k+=2){
      if(sc[k]==col){ ns = (sc[k+1] ? (rsi?1:4)+st : (rsi?4:1)+st); break; }
      var CC = this.Cols[sc[k]];
      if(st<2 && CC && (CC.Visible || CC.CanHide)) st++; 
      }
   return but+ns+align + " "+this.Img.Style+but+align;
   }
ME.Sort;
MS.ColTree;
if(but=="Expand"){
   var c = this.GetAttr(row,col,"ExpandCol"); if(c) col = c;
   var exp = this.IsCellExpanded(row,col);
   if(exp!=null) exp = exp ? "Collapse" : "Expand";
   else if(this.MainCol && !row.Fixed) {
      row.ExpandCol = col;
      exp = row.Expanded ? "Collapse" : "Expand";
      }
   else if(this.PrintNoIcons==2) return "";
   else exp = "Expand";
   var ic = this.GetAttr(row,col,"ExpandIcon",0,1);
   if(ic&4) exp += "Col";
   if(ic&2) exp += "Tree";
   if(ic&1) exp += "Rev";
   return exp+align;
   }
ME.ColTree;
if(but=="Check") { var bcheck = Get(row,col+"Checked"); return but + (bcheck?bcheck:0) + align; }
return but ? but+align : "";
}
ME.SideButton;
// ---------------------------------------------------------------------------------------------------------------------------
TGP.UpdateHtmlLink = function(row,col,val){
var win = this.GetAttr(row,col,"LinkTarget"); if(win==null) win = this.LinkTarget;
if(win) val = val.replace(/(<a)(((?!target)[^>])*)>/g,"$1$2 target='"+win+"'>");
var bas = this.GetAttr(row,col,"LinkBase"); if(bas==null) bas = this.LinkBase;
if(bas) val = val.replace(/(<a[^>]*href=)('[^']*'|"[^"]*"|[^\s]*)([^>]*>)/g,function(dummy,a,b,c){ return b&&b.indexOf("://")<0 ? a+b.charAt(0)+bas+b.slice(1)+c : a+b+c; });
if(BIEA) val = val.replace(/(<a[^>]*>)(\s*[^<].*?)(<\/a>)/g,"$1<span>$2</span>$3"); 
return val;
}
// ---------------------------------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------------------------------

MS.Color;
var CColors = {"transparent":"#FFFFFF","black":"#000001","silver":"#C0C0C0","gray":"#808080","white":"#FFFFFE","maroon":"#800000","red":"#FF0000",
               "purple":"#800080","fuchsia":"#FF00FF","green":"#008000","lime":"#00FF00","olive":"#808000","yellow":"#FFFF00","navy":"#000080",
               "blue":"#0000FF","teal":"#008080","aqua":"#00FFFF","orange":"#FFA500",
               "aliceblue":"f0f8ff","antiquewhite":"faebd7","aquamarine":"7fffd4","azure":"f0ffff","beige":"f5f5dc","bisque":"ffe4c4","blanchedalmond":"ffebcd","blueviolet":"8a2be2","brown":"a52a2a","burlywood":"deb887",
               "cadetblue":"5f9ea0","chartreuse":"7fff00","chocolate":"d2691e","coral":"ff7f50","cornflowerblue":"6495ed","cornsilk":"fff8dc","crimson":"dc143c","cyan":"00ffff",
               "darkblue":"00008b","darkcyan":"008b8b","darkgoldenrod":"b8860b","darkgray":"a9a9a9","darkgreen":"006400","darkkhaki":"bdb76b","darkmagenta":"8b008b","darkolivegreen":"556b2f","darkorange":"ff8c00",
               "darkorchid":"9932cc","darkred":"8b0000","darksalmon":"e9967a","darkseagreen":"8fbc8f","darkslateblue":"483d8b","darkslategray":"2f4f4f","darkturquoise":"00ced1","darkviolet":"9400d3",
               "deeppink":"ff1493","deepskyblue":"00bfff","dimgray":"696969","dodgerblue":"1e90ff","feldspar":"d19275","firebrick":"b22222","floralwhite":"fffaf0","forestgreen":"228b22",
               "gainsboro":"dcdcdc","ghostwhite":"f8f8ff","gold":"ffd700","goldenrod":"daa520","greenyellow":"adff2f","honeydew":"f0fff0","hotpink":"ff69b4","indianred":"cd5c5c","indigo":"4b0082","ivory":"fffff0",
               "khaki":"f0e68c","lavender":"e6e6fa","lavenderblush":"fff0f5","lawngreen":"7cfc00","lemonchiffon":"fffacd","lightblue":"add8e6","lightcoral":"f08080","lightcyan":"e0ffff","lightgoldenrodyellow":"fafad2",
               "lightgrey":"d3d3d3","lightgreen":"90ee90","lightpink":"ffb6c1","lightsalmon":"ffa07a","lightseagreen":"20b2aa","lightskyblue":"87cefa","lightslateblue":"8470ff","lightslategray":"778899",
               "lightsteelblue":"b0c4de","lightyellow":"ffffe0","limegreen":"32cd32","linen":"faf0e6","magenta":"ff00ff","mediumaquamarine":"66cdaa","mediumblue":"0000cd","mediumorchid":"ba55d3","mediumpurple":"9370d8",
               "mediumseagreen":"3cb371","mediumslateblue":"7b68ee","mediumspringgreen":"00fa9a","mediumturquoise":"48d1cc","mediumvioletred":"c71585","midnightblue":"191970","mintcream":"f5fffa","mistyrose":"ffe4e1",
               "moccasin":"ffe4b5","navajowhite":"ffdead","oldlace":"fdf5e6","olivedrab":"6b8e23","orangered":"ff4500","orchid":"da70d6","palegoldenrod":"eee8aa","palegreen":"98fb98","paleturquoise":"afeeee",
               "palevioletred":"d87093","papayawhip":"ffefd5","peachpuff":"ffdab9","peru":"cd853f","pink":"ffc0cb","plum":"dda0dd","powderblue":"b0e0e6","rosybrown":"bc8f8f","royalblue":"4169e1",
               "saddlebrown":"8b4513","salmon":"fa8072","sandybrown":"f4a460","seagreen":"2e8b57","seashell":"fff5ee","sienna":"a0522d","skyblue":"87ceeb","slateblue":"6a5acd","slategray":"708090",
               "snow":"fffafa","springgreen":"00ff7f","steelblue":"4682b4","tan":"d2b48c","thistle":"d8bfd8","tomato":"ff6347","turquoise":"40e0d0","violet":"ee82ee","violetred":"d02090",
               "wheat":"f5deb3","whitesmoke":"f5f5f5","yellowgreen":"9acd32" };
ME.Color;

// -----------------------------------------------------------------------------------------------------------
MS.Color;
TGP.ConvertColor = function(clr){
var rgb = this.Formats[clr];
if(rgb!=null) return rgb;
clr += "";
var cclr = CColors[clr.toLowerCase()]; if(cclr) clr = cclr;

if(clr.charAt(0)=='#') {
   if(clr.length==4) rgb = ("0x"+clr.charAt(1)<<24) + ("0x"+clr.charAt(2)<<14) + ("0x"+clr.charAt(3)<<4);
   
   else rgb = ("0x"+clr.slice(1,3)<<20) + ("0x"+clr.slice(3,5)<<10) + (("0x"+clr.slice(5,7))-0);
   if(rgb===0) rgb++;
   }
   
else if(clr.indexOf("-")>=0){
   rgb = clr.replace(/[^\d\,\-\.]/g,"");
   rgb = rgb.split(","); 
   rgb = (255+(rgb[0]-0)<<20)+(255+(rgb[1]-0)<<10)+(255+(rgb[2]-0)); 
   }   

else if(clr.slice(0,4)=="rgba"){
   rgb = clr.replace(/[^\d\,\-\.]/g,"");
   MS.Debug;
   if(!rgb && clr) this.Debug(2,"Invalid color: ",clr);
   ME.Debug;
   rgb = rgb.split(","); 
   var n = Math.round(rgb[3]*10); if(n>7) n = 7;
   rgb = (rgb[0]<255?rgb[0]<<20:0xFF00000)+(rgb[1]<255?rgb[1]<<10:0x3FC00)+(rgb[2]<255?rgb[2]-0:255);
   if(n&1) rgb += 0xFF00000;
   if(n&2) rgb += 0x3FC00;
   if(n&4) rgb += 255;
   }

else { 
   rgb = clr.replace(/[^\d\,\-\.]/g,"");
   MS.Debug;
   if(!rgb && clr) this.Debug(2,"Invalid color: ",clr);
   ME.Debug;
   rgb = rgb.split(","); 
   rgb = (rgb[0]<255?rgb[0]<<20:0xFF00000)+(rgb[1]<255?rgb[1]<<10:0x3FC00)+(rgb[2]<255?rgb[2]-0:255);
   }
if(rgb) rgb -= 0xFF3FCFF; else rgb = 0;   
this.Formats[clr] = rgb;
return rgb;
}
ME.Color;
// -----------------------------------------------------------------------------------------------------------
TGP.ColorCell = function(row,col){
MS.Color;
var cell = this.GetCell(row,col); if(!cell) return;
var A = []; this.GetRowHTML(row,A,5,col);
var cur = this.CursorToSet;

cell.style.backgroundColor = A[1];



if(cell.className.indexOf("NoRight")>=0) cell.nextSibling.style.backgroundColor = A[1];

MS.Tree; if(col==this.MainCol && !this.HideTree && cell.className.indexOf("NoLeft")>=0) cell.previousSibling.style.backgroundColor = A[1]; ME.Tree;   
ME.Color;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ColorRow = function(row){
MS.Color;
if(!row || !row.r1) return;
MS.Space;
if(row.Space){
   var cell = row.SpaceWrap ? row.r1.firstChild.firstChild : row.r1.firstChild.rows[0].cells[BIEA?1:0];
   var A = []; this.GetRowHTML(row,A,5);
   for(var pos=1;cell;cell=cell.nextSibling,pos+=2) cell.style.backgroundColor = A[pos];
   return;   
   }
ME.Space;
var SS = this.GetSS();
this.GetRowHTML(row,SS,5);
var rcls = this.Img.Style+row.Kind+"Row "+(this.DynamicBorder&&!row.NoDynBorder?" "+this.Img.Style+"DB ":"")+this.GetRowHTML(row,null,16);
var right = "NoRight"; 
for(var i=this.FirstSec;i<=this.LastSec;i++){
   var r = row["r"+i]; if(!r) continue;
   r.className = rcls;
   if(BIEA) r.style.paddingLeft = "0px"; 
   var A = SS[i], cell = r.firstChild, pos = 1; if(!A) continue; 
   if((this.LeftTD||i==1)&&cell) cell = cell.nextSibling;
   while(cell){
      var cls = cell.className;

//      cls = A[pos-1] + cls.replace(/[\s^]Color\S*/g,"");
//      cell.className = cls;
      cell.style.backgroundColor = A[pos];
      if(cls.indexOf(right)<0) pos+=2;
      cell = cell.nextSibling;
      }
   }
ME.Color;   
}
// -----------------------------------------------------------------------------------------------------------
TGP.ColorCol = function(col,row){
if(!row){
   this.ColorCol(col,this.XH);
   this.ColorCol(col,this.XF);
   for(var p=this.XB.firstChild;p;p=p.nextSibling) if(p.r1) this.ColorCol(col,p);
   return;
   }
for(var r=row.firstChild;r;r=r.nextSibling){
   if(r.firstChild && r.Hasch) this.ColorCol(col,r);
   this.ColorCell(r,col);
   }
}

// -----------------------------------------------------------------------------------------------------------
MS.SideButton;
TGP.SetCellIcon = function(row,col,cell){
if(row.Space) {
   var src = this.GetAttr(row,col,"Button"); 
   if(src) cell.style.backgroundImage = "url("+(this.EscapeImages?'"'+this.Lang.Format.Escape(src)+'"':src)+")";
   }
else if(!this.SpannedTree || col!=this.MainCol || this.HideTree || !this.Cols[col].Visible&&!this.Cols[col].Hidden || row.Fixed){   
   var src = this.GetAttr(row,col,"Icon"), src2;
   var val = Get(row,col); 
   if(val&&val!="0") { src2 = this.GetAttr(row,col,"IconChecked"); if(src2) src = src2; }
   
   if(src==null && this.GetType(row,col)=="Icon") src = Get(row,col);
   if(src==null && this.GetType(row,col)=="Button") { src = this.GetAttr(row,col,"ButtonText"); if(src==null) src = Get(row,col); }
   if(src) cell.style.backgroundImage = "url("+(this.EscapeImages?'"'+this.Lang.Format.Escape(src)+'"':src)+")";
   var w = this.GetAttr(row,col,"IconWidth"); 
   if(w) cell.style["padding-"+(CAlignTypes[this.GetAttr(row,col,"IconAlign")]=="Right"?"right":"left")] = w+"px";
   }
}
ME.SideButton;
// -----------------------------------------------------------------------------------------------------------
TGP.RefreshCell = function(row,col,clsonly,noundo){
if(this.Rendering==2) return; 
MS.Animate; if((row.Animating||row.AnimatingCells&&row.AnimatingCells[col])&&!clsonly) this.AnimCell(row,col); ME.Animate;
var cell = this.GetCell(row,col); if(!cell) return;
MS.Nested;
if(row.DetailCol && row.DetailGrid && row.DetailCol==(row.Spanned ? this.GetSpanCol(row,col) : col)) return;
ME.Nested;
var A = [], W = null, WW = null, h = null;
this.GetRowHTML(row,A,4,col);
if(!clsonly){
   var typ = this.GetType(row,col), refh = this.GetAttr(row,col,"RefreshHeight",null,1); 
   h = refh==1 || refh==null&&(row.Space||CEditMulti[typ]) ? cell.offsetHeight : null;
   if(row.Space && row.RelWidth){
      var cf = row[col+"RelWidth"] ? cell.lastChild : null;
      while(cf && cf.firstChild && cf.className && cf.className.indexOf("Inner")>=0 && cf.className.indexOf("WidthInner")<0 && cf.firstChild.nodeType==1) cf = cf.firstChild;
      if(cf) W = cf.style.width;
      else WW = cell.offsetWidth;
      }
   if(Grids.OnClearRow) Grids.OnClearRow(this,row,col);
   if(BSafari && cell.style.overflow=="visible" && A[0]!=CNBSP) cell.style.overflow = "";
   cell.innerHTML = A[0];
   if(BIEA&&cell.lastChild&&cell.lastChild.nodeType==3&&!cell.lastChild.data) cell.removeChild(cell.lastChild); 
   }

if(!this.GanttPaging || !this.Cols[col] || !this.Cols[col].GanttPageW){

   MS.SideButton;
   if(A[3]==" "){ cell.style.backgroundImage = ""; cell.style.paddingLeft = ""; }
   else if(A[3]) this.SetCellIcon(row,col,cell); 
   
   var bcell = cell.className.indexOf("NoRight")>=0 ? cell.nextSibling : null;
   
   if(A[5]) { 
      if(!bcell){
         bcell = cell.parentNode.insertCell(cell.cellIndex+1);
         cell.colSpan = cell.colSpan-1;
         bcell.rowSpan = cell.rowSpan;
         bcell.innerHTML = CNBSP;
         }
      bcell.className = A[5];
      bcell.style.backgroundColor = A[2];
      if(!clsonly && A[4]) bcell.innerHTML = A[4];
      if(A[6]) {
         var but = this.GetAttr(row,col,"Button"); if(this.EscapeImages) but = '"'+this.Lang.Format.Escape(but)+'"';
         bcell.style.backgroundImage = "url("+but+")"; 
         }
      else if(bcell.style.backgroundImage) bcell.style.backgroundImage = "";
      }
   else if(bcell){
      bcell.parentNode.removeChild(bcell);
      cell.colSpan = cell.colSpan+1;
      }
   ME.SideButton;   

   MS.Tree;
   if(A[8] && (this.Cols[col].Visible||this.Cols[col].Hidden)){ 
      var tcell = cell.previousSibling;
      tcell.innerHTML = A[8];
      tcell.className = A[9];
      tcell.style.backgroundColor = A[2];
      }
   ME.Tree; 
   }

//[1] = A[1].replace(/ToolUndo/,"");
cell.className = A[1];
cell.style.backgroundColor = A[2]; 

MS.Overlay; 
if(this.Overlay>=2&&!row.Space) { 
   this.UpdateOverlay(row,this.Cols[col].Sec); 
   MS.RowSpan; if(this.Overlay&4 && row.RowSpan && row[col+"RowSpan"]>1) for(var r=row.nextSibling,lr=this.GetLastSpanRow(row,col);r!=lr.nextSibling;r=r.nextSibling) this.UpdateOverlay(r,this.Cols[col].Sec); ME.RowSpan; 
   } 
ME.Overlay;
if(W){
   var cf = cell.lastChild;
   while(cf && cf.firstChild && cf.className && cf.className.indexOf("Inner")>=0 && cf.className.indexOf("WidthInner")<0 && cf.firstChild.nodeType==1) cf = cf.firstChild;
   if(cf) cf.style.width = W;
   }
else if(WW && WW!=cell.offsetWidth) this.UpdateSpaceRelWidth(row);
if(h && h!=cell.offsetHeight && cell.offsetHeight) { if(row.Space) this.Update(); else this.UpdateRowHeight(row,1,null,noundo); }
if(row==this.ARow && col==this.ACol) this.GridMouseOver();
if(this.ScrollAlign && this.ScrollAlign[4][row.id]) this.DoScrollAlign(null,row.id);
if(Grids.OnRenderRow && !clsonly) Grids.OnRenderRow(this,row,col);
}
// -----------------------------------------------------------------------------------------------------------
TGP.RefreshRow = function(row,sec){
if(!row || !row.r1) return;
MS.Animate; if(row.Animating||row.AnimatingCells) this.AnimRow(row); ME.Animate;
if(Grids.OnClearRow) Grids.OnClearRow(this,row);
var SS, fr, lr, s, d, h = null, upd = 0;
if(row.Space){
   if(row==this.ERow && this.EndEdit(1)==-1) return;
   var h = row.r1.offsetHeight;
   row.r1.innerHTML = this.GetSpaceHTML(row);
   if(row.RelWidth) this.UpdateSpaceRelWidth(row);
   if(h!=row.r1.offsetHeight) this.Update();
   }   
else {   
   if(sec==null) { SS = this.GetSS(); fr = this.FirstSec; lr = this.LastSec; }
   else { 
      SS = []; SS[sec] = []; fr = sec; lr = sec; 
      if(!row["r"+sec]) return;
      var oh = row["r"+sec].offsetHeight; 
      }
   this.GetRowHTML(row,SS,0);
   MS.FFOnly; MX.FFOnly;
   if(BIEA||BSafari){ 
      s = this.GetRowTagHTML(row); 
      d = document.createElement("div");
      }
   ME.FFOnly; 
   for(var i=fr;i<=lr;i++){
      var r = row["r"+i]; if(!r || !SS[i]) continue; 
      if(BIEA||BSafari){ 
         d.innerHTML = CTableCSP0 + CTfoot + s + (i==1&&!this.LeftTD?"<td style='width:0px;'></td>":"") + SS[i].join("") + "</tr>" + CTableEnd;
         var n = d.firstChild.rows[0];
         r.parentNode.replaceChild(n,r);
         row["r"+i] = n;
         if(BTablet) { n.ontouchstart = r.ontouchstart; r.ontouchstart = null; }
         else if(BTouch) { n.setAttribute("ontouchstart",r.getAttribute("ontouchstart")); r.setAttribute("ontouchstart",null); }
         if(BMouse) { n.onmousemove = r.onmousemove; r.onmousemove = null; }
         n.row = row;
         r.row = null;
         n.style.height = r.style.height;
         r = n;
         }
      else {
         r.innerHTML = (this.LeftTD||i==1?"<td style='width:0px;height:0px'></td>":"")+SS[i].join("");   
         }
      if(h==null) h = r.offsetHeight;
      else if(!upd && h!=r.offsetHeight) upd = 1;
      }
   if(upd || sec!=null&&oh!=h) this.UpdateRowHeight(row,1);
   }      
if(row==this.ARow) this.GridMouseOver();
if(this.ScrollAlign && this.ScrollAlign[4][row.id]) this.DoScrollAlign(null,row.id);
if(Grids.OnRenderRow) Grids.OnRenderRow(this,row);
}
// -----------------------------------------------------------------------------------------------------------
TGP.ReColor = function(noshow){ 
MS.Color;
var a = this.Alternate; if(!a) return;
var b = this.AlternateCount; if(!(b>0)) b = 1;
var t = this.AlternateType, t2 = this.Paging!=3||t&2;
for(var p=this.XB.firstChild,c=null;p;p=p.nextSibling) if(p.firstChild) c = this.ReColorPage(p,noshow,a,b,t2?c:null,t&1);
ME.Color;
}
// -----------------------------------------------------------------------------------------------------------
MS.Color;
TGP.ReColorPage = function(p,noshow,a,b,c,t){ 
if(c==null) c = (this.AlternateStart!=null?b-1+this.AlternateStart:a-1);
for(var r=p.firstChild;r;r=r.nextSibling){ 
   if(!r.Visible) continue;
   if(r.ColorPos != c<b){ 
      r.ColorPos = c<b; 
      if(!noshow) {
         this.ColorRow(r); 
         if(this.RowIndex) this.RefreshCell(r,this.RowIndex);
         }
      }
   if(!c--) c = a-1; 
   if(r.firstChild && (!t||r.Expanded)) { var cc = this.ReColorPage(r,noshow,a,b,t?c:null,t); if(t) c = cc; }
   }
return c;
}
ME.Color;
// -----------------------------------------------------------------------------------------------------------
// Refreshes row' panel
TGP.UpdatePanel = function(row,anim){ 
MS.Panel;
if(!row) return;   
if(!anim) anim = "";
var CN = this.ColNames;
if(!this.FirstSec) for(var i=0,N=CN[0];i<N.length;i++) if(this.GetType(row,N[i])=="Panel") this.RefreshCellAnimate(row,N[i],anim);
if(this.SecCount==3) for(var i=0,N=CN[this.LastSec];i<N.length;i++) if(this.GetType(row,N[i])=="Panel") this.RefreshCellAnimate(row,N[i],anim);
for(var i=0,N=CN[1];i<N.length&&i<10;i++) if(this.GetType(row,N[i])=="Panel") this.RefreshCellAnimate(row,N[i],anim); 
ME.Panel;   
}
// -----------------------------------------------------------------------------------------------------------
// Refreshes row' panel
TGP.UpdateColPanel = function(col){ 
MS.Panel;
if(!col) return;   
for(var r=this.XH.firstChild;r;r=r.nextSibling) if(this.GetType(r,col)=="Panel") this.RefreshCell(r,col);
for(var r=this.XF.firstChild;r;r=r.nextSibling) if(this.GetType(r,col)=="Panel") this.RefreshCell(r,col);
ME.Panel;   
}

// -----------------------------------------------------------------------------------------------------------
// Refreshes Related Enum after change
MS.Edit;
MS.Enum;
TGP.RefreshEnum = function(row,col,anim,updh){
if(!anim) anim = "";
var ref = this.GetAttr(row,col,"Refresh"); 
if(ref){
   ref = ref.split(',');
   for(var i=0;i<ref.length;i++) this.RefreshCellAnimate(row,ref[i],anim,updh);
   }
var ref = this.GetAttr(row,col,"Clear");
if(ref){
   ref = ref.split(',');
   for(var i=0;i<ref.length;i++) {
      if(row[ref[i]] || row[ref[i]]=='0') {
         if(this.GetAttr(row,ref[i],"CanEmpty")==1) this.SetValue(row,ref[i],""); 
         else {
            var rp = this.GetRelatedPrefix(row,ref[i]), ena = this.GetEnum(row,ref[i],"Enum",rp), eka = this.GetEnum(row,ref[i],"EnumKeys",rp);
            if(ena){
               if(!eka && this.IsIndexEnum(Get(row,col),this.IsRange(row,ref[i]),ena)) this.SetValue(row,ref[i],0);
               else this.SetValue(row,ref[i],(eka?eka:ena).split((eka?eka:ena).charAt(0))[1]);
               }
            }
         }
      this.RefreshCellAnimate(row,ref[i],anim,updh);
      }
   }
}
ME.Enum;
ME.Edit;
// -----------------------------------------------------------------------------------------------------------
// Obnovi grid, ale neprekresluje ho, kvuli zmenam IE, obcas je opravdu nutne

TGP.Refresh = function(){
MS.FFOnly; MX.FFOnly;
if(BIEA && !BIEA10 && !this.Rendering){
   
   try { this.BodyMain[1].scrollTop = this.BodyMain[1].scrollTop; } catch(e) { }
   }
ME.FFOnly;
}
// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------
// Returns column on given position, relative to table
TGP.GetColFromPos = function(X){


var sec, mainsec, I = this.Img; X -= I.TableBPLeft + this.PagersLeft;
if(X<this.TmpLeftWidth){ sec = 0; mainsec = 0; X -= I.LeftAllLeft; }
else { 
   X-= this.TmpLeftWidth; 
   if(X<this.TmpMidWidth){ X -= I.MidAllLeft; sec = 1; mainsec = 1; }
   else {
      X-= this.TmpMidWidth; 
      if(X<this.TmpRightWidth){ sec = this.ColNames.length-1; mainsec = 2; X -= I.RightAllLeft; }
      else return null 
      }
   }
X += this.GetScrollLeft(mainsec);
MS.ColPaging; if(this.ColPaging && mainsec==1) while(X>=this.ColNames[sec].Width&&sec<=this.LastSec) X -= this.ColNames[sec++].Width; ME.ColPaging;
         
var S = this.ColNames[sec], left = 0;
for(var i=0;i<S.length;i++){
   var c = this.Cols[S[i]];
   
   if(c.Visible) { X -= c.Width; left += c.Width; }
   if(X < 0) return S[i];
   }
return null;
}
// -----------------------------------------------------------------------------------------------------------
// Returns X position of the column inside its section, in pixels
MS.Gantt$ColMove;
TGP.GetColLeft = function(col,sec){
var C = this.Cols; if(!C[col]) return null;
var S = this.ColNames[C[col].Sec], w = 0;
MS.ColPaging; if(this.ColPaging && C[col].MainSec==1) for(var i=1;i<C[col].Sec;i++) w += this.ColNames[i].Width; ME.ColPaging;
for(var i=0;S[i]!=col;i++) if(C[S[i]].Visible) w += C[S[i]].Width;
if(sec){
   if(C[col].MainSec>=1) w += this.TmpLeftWidth;
   if(C[col].MainSec>=2) w += this.TmpMidWidth;
   }
return w;
}
ME.Gantt$ColMove;
// -----------------------------------------------------------------------------------------------------------
// Returns body size
TGP.GetBodyWidth = function(mainsec){ 
if(this.NoHScroll&&mainsec==-1) {
   var w = this.ScrollParent ? this.ScrollParent.clientWidth : GetWindowSize()[0];
   MS.Scale; if(this.Scale) w /= this.Scale; if(this.ScaleX) w /= this.ScaleX; ME.Scale;
   return w;
   }

if(mainsec==0) return this.TmpLeftWidth - this.Img.LeftAllWidth - this.LeftSplitterWidth; 
if(mainsec==2) return this.TmpRightWidth - this.Img.RightAllWidth;
return this.TmpMidWidth - this.Img.MidAllWidth - this.RightSplitterWidth; 
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetBodyHeight = function(){ 
if(this.NoVScroll){
   var h = (this.ScrollParent?this.ScrollParent.clientHeight : GetWindowSize()[1]);
   MS.Scale; if(this.Scale) h /= this.Scale; if(this.ScaleY) h /= this.ScaleY; ME.Scale;
   return h;
   }
if(this.BodyMain&&this.BodyMain[1].parentNode) return this.BodyMain[1].parentNode.offsetHeight;
return 0;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetBodyScrollWidth = function(mainsec){ 
var w = 0, C = this.Cols; if(mainsec==null) mainsec = 1;
MS.ColPaging;
if(BChrome && mainsec==1 && this.ColPaging && !BEdge && !this.RelWidth){ 
   var BS = this.BodySec[this.Rtl ? 1 : this.ColNames.length-2];
   if(BS && BS.offsetWidth) return BS.offsetLeft+BS.offsetWidth;
   }
ME.ColPaging;
for(var c in C) if(C[c].Visible && C[c].MainSec==mainsec) w += C[c].Width;
return w;
}
TGP.GetBodyScrollHeight = function(){ return this.BodySec[1].lastChild.offsetTop; }
// -----------------------------------------------------------------------------------------------------------
MS.Paging$ChildParts;

// Recursive function for GetPageHeight
TGP.GetPageHeightSub = function(row){
var h = 0;
for(var r=row.firstChild;r;r=r.nextSibling){
   if(!r.Visible) continue;
   if(r.Expanded) {
      if(r.firstChild) h += this.GetPageHeightSub(r);
      else if(r.Count) h += r.Count * this.RowHeight;
      }
   var hh = r.Height; if(!hh){ hh = r.Def.Height; if(!hh) hh = this.RowHeight; }
   h += hh;
   } 
return h;   
}
ME.Paging$ChildParts;
// -----------------------------------------------------------------------------------------------------------
// Returns page height in pixels
// If count is true, always calculates height
MS.Paging;
TGP.GetPageHeight = function(row,count){
if(row.NoPage && row.Height!=null) return row.Height;
if(!count && row.r1) return row.r1.offsetHeight-(!BIE&&row.Page?(row.previousSibling?this.Img.PageBPHeight:this.Img.PageFirstBPHeight):0);
if(row.State<2) return row.Count*this.RowHeight;
if(!row.firstChild) return 0; 
return this.GetPageHeightSub(row);
}
ME.Paging;
// -----------------------------------------------------------------------------------------------------------
// Returns height of the row in pixels
TGP.GetRowHeight = function(row){
if(row.r1) return row.r1.offsetHeight;
var h = row.Height;
if(h!=null) return h;
if(row.Page) return this.GetPageHeight(row);
h = row.Def.Height;
if(h!=null) return h;
return this.RowHeight;
}   
// -----------------------------------------------------------------------------------------------------------
// Returns variable row Y position relative to body
TGP.GetRowTop = function(row){
var r = row.r1?row.r1:row.rch1, add = 0;
if(!r) { 
   if(row.Page) return 0; 
   for(r=this.GetPrev(row,3);r&&!r.r1&&!r.rch1;r=this.GetPrev(r,3)) if(r.Visible||r.SPage){
      var hh = r.Height; if(!hh) hh = r.Def.Height; if(!hh) hh = r.Visible ? this.RowHeight : 0;
      add += hh;
      if(r.Count && r.Expanded && this.ChildPaging==3) add += r.Count * this.RowHeight;
      }
   MS.Paging; if(!r) r = this.GetRowPage(row); ME.Paging;
   row = r;
   r = r.r1?r.r1:r.rch1;
   if(!r) return 0;
   }  
if(!r.parentNode) return 0;

var scr = this.GetScrollTop(); 
var top = (r.getBoundingClientRect().top - this.BodyMain[1].getBoundingClientRect().top)/CZoom;
if(!row.r1&&this.ReversedTree) top += r.offsetHeight;
MS.Scale; if(this.Scale) top /= this.Scale; if(this.ScaleY) top /= this.ScaleY; ME.Scale;
return top + scr + add;

}
// -----------------------------------------------------------------------------------------------------------
// Returns [left,top,width,height] - inner position of the text part inside cell (e.g width of tree of left/right button)
MS.Edit;
TGP.GetCellInnerSize = function(row,col,dozoom){
var I = this.Img, cell = this.GetCell(row,col); if(!cell) return [0,0,0,0];
var left = cell.clientLeft, top = cell.clientTop, cellout = cell, width = 0, height = 0;

if(col==this.MainCol && !this.HideTree && (row.Fixed ? row.Kind=="Header" && Get(row,col+"Levels") : this.SpannedTree)){
   var tb = cell.lastChild; left += tb.offsetLeft; top += tb.offsetTop; 
   if(BChrome && this.SpannedTree) tb = tb.firstChild; 
   cell = tb.rows[0].lastChild;
   left += cell.offsetLeft; top += cell.offsetTop;
   width += cellout.offsetWidth-left-cell.offsetWidth;
   }

MS.ColSpan;
if(row.Spanned && Get(row,col+"Merge")){
   var mer = (Get(row,col+"Merge")+"").split(",");
   if(mer.length>1 && !Get(row,col+"MergeFormat")){
      var mee = Get(row,col+"MergeEdit"), me = 0; 
      if(mee) for(me=0;me<mer.length&&mer[me]!=mee;me++);
      if(me==mer.length) me = 0; 
      var tb = cell.lastChild; left += tb.offsetLeft; top += tb.offsetTop; 
      tb = tb.rows.length>1 ? tb.rows[me].cells[0] : tb.rows[0].cells[me]; 
      if(tb) { cell = tb; left += cell.offsetLeft; top += cell.offsetTop; }
      
      }
   }
ME.ColSpan; 

var lines = this.GetType(row,col)=="Lines", clsin = cell.className; clsin = clsin && clsin.indexOf("CellClassInner")>=0 && (clsin.indexOf("VAlign")<0||!lines);
if(row.Space){
   while(cell.lastChild && cell.lastChild.className && cell.lastChild.className.indexOf("Inner")>=0) cell = cell.lastChild;
   }

var over = cellout.className.indexOf("OverflowLeft")>=0;
if(clsin && cell.lastChild){
   if(cell.lastChild.className) cell = cell.lastChild;
   else if(over&&cell.lastChild.firstChild&&cell.lastChild.firstChild.className&&cell.className.indexOf("OverflowLeftVisible")>=0) cell = cell.lastChild.firstChild;
   }
if(cell==cellout) { left = 0; top = 0; }
else if(cell.tagName.toLowerCase()!="td") { if(!over) left += cell.offsetLeft; top += cell.offsetTop; }
width += over ? cellout.clientWidth : cell.offsetWidth; height += cell.offsetHeight;
var b, s = GetStyle(cell);
if(!over||cell!=cellout){
   b = parseInt(s.borderTopWidth); if(b) { top += b; height -= b; }
   b = parseInt(s.borderBottomWidth); if(b) height -= b;
   b = parseInt(s.borderLeftWidth); if(b) { left += b; width -= b; }
   b = parseInt(s.borderRightWidth); if(b) width -= b;
   }
b = parseInt(s.paddingTop); if(b) { top += b; height -= b; }
b = parseInt(s.paddingBottom); if(b) height -= b;

b = parseInt(s.paddingLeft); if(b) { left += b; width -= b; }
b = parseInt(s.paddingRight); if(b) width -= b;
if(lines&&cell.lastChild&&cell.lastChild.className&&cell.lastChild.className.indexOf("Lines")>=0){
   var b, s = GetStyle(cell.lastChild);
   b = parseInt(s.borderTopWidth); if(b) { top += b; height -= b; }
   b = parseInt(s.borderBottomWidth); if(b) height -= b;
   b = parseInt(s.borderLeftWidth); if(b) { left += b; width -= b; }
   b = parseInt(s.borderRightWidth); if(b) width -= b;
   b = parseInt(s.paddingTop); if(b) { top += b; height -= b; }
   b = parseInt(s.paddingBottom); if(b) height -= b;
   b = parseInt(s.paddingLeft); if(b) { left += b; width -= b; }
   b = parseInt(s.paddingRight); if(b) width -= b;
   top += cell.lastChild.offsetTop; height -= cell.lastChild.offsetTop;
   }



if(col==this.MainCol && !this.HideTree && !this.SpannedTree && this.Cols[col].Visible && !row.Fixed && !this.Rtl){
   var lev = row.Level; if(this.HideRootTree) lev--;
   if(lev>=0) left += I.Tree;
   if(lev>0) left += lev*I.Line;
   s = GetStyle(cellout.previousSibling);
   b = parseInt(s.borderLeftWidth); if(b) left += b;
   }
 
var sc = dozoom ? this.GetScale(row,0) : 0; 
return sc&&sc!=1 ? [left*sc,top*sc,width*sc,height*sc] : [left,top,width,height];
}
ME.Edit;
// -----------------------------------------------------------------------------------------------------------
// Returns position of the cell
// {AbsX,AbsY,Width,Height,OverLeft,OverTop,OverRight,OverBottom}
// type&1 => 0 absolute to the browser window, 1 relative to table
// type&2 => 0 outer cell including border, 1 inner cell without border
TGP.CellToWindow = function(row,col,type,pagepos,usersec,always,nospan){
if(!row) return null; 
var nocell = 0;
if(!col){ col = this.GetFirstCol(); nocell = 1; }
if(row.Spanned&&row[col+"Span"]==0&&!(nospan&2)) col = this.GetSpanCol(row,col);
if((row.RowSpan&&row[col+"RowSpan"]==0||row[col+"Visible"]==-2)&&!(nospan&1)) row = this.GetSpanRow(row,col,1);
var cell = this.GetCell(row,col);
MS.UserSec;
if(usersec!=null){
   cell = row["r"+usersec];
   if(cell){
      nocell = 0;
      if(this.CPLastSec && usersec==1 && row.Fixed) col = this.GetFirstCol(1);
      else for(var i=0,N=this.ColNames[usersec];i<N.length;i++) if(this.Cols[N[i]].Visible) { col = N[i]; break; }
      }
   }
ME.UserSec;
var E = { }, I = this.Img, C = this.Cols;
if(type&1) { E.X = 0; E.Y = 0; }
else { E.X = this.TableX - CAbsDX; E.Y = this.TableY - CAbsDY; MS.Scale; if(this.Scale) { E.X /= this.Scale; E.Y /= this.Scale; } if(this.ScaleX) E.X /= this.ScaleX; if(this.ScaleY) E.Y /= this.ScaleY; ME.Scale; } 
E.OverLeft = 0; E.OverRight = 0; E.OverTop = 0; E.OverBottom = 0;

// --- Space cell ---
if(row.Space){
   MS.Space;
   if(row.Tag||row.Space==-1||row.Space==5){
      var AA = ElemToWindow(row.r1.firstChild);
      E.X = Math.round(AA[0]) - row.r1.offsetLeft - I.TableBPLeft - CAbsDX; 
      E.Y -= (this.TableY - Math.round(AA[1]))/(this.Scale?this.Scale:1)/(this.ScaleY?this.ScaleY:1);
      
      MS.Scale;
      if(this.Scale) E.X += (row.r1.offsetLeft-CAbsDX)/this.Scale - row.r1.offsetLeft + CAbsDX;
      if(this.ScaleX) E.X -= Math.round((row.r1.offsetLeft-CAbsDX)*(this.ScaleX-1));
      ME.Scale;
      
      
      if(BIEA&&!BIE8Strict) E.Y += row.r1.firstChild.offsetTop;
      }
   else {   
      
      E.X += row.r1.parentNode.offsetLeft;
      E.Y += row.r1.parentNode.parentNode.offsetTop + row.r1.firstChild.offsetTop + (row.Kind=="Tabber"||row.Kind=="Tabber2"?0:I.SpaceMargin);
      if(BIEA&&!BIE8Strict) E.Y += row.r1.offsetTop + row.r1.clientTop;
      if(BSafari) E.Y -= I.TablePTop;
      }
   
   E.Height = row.r1.firstChild.offsetHeight - (row.Kind=="Tabber"||row.Kind=="Tabber2"?0:I.SpaceMargin*2)/(this.Scale?this.Scale:1)/(this.ScaleX?this.ScaleX:1);
   if(cell){
      E.X += cell.offsetLeft + I.TableBPLeft + row.r1.firstChild.offsetLeft;
      if(BIEA&&!BIE8Strict) E.X += row.r1.offsetLeft + row.r1.clientLeft;
      E.Width = cell.offsetWidth;
      E.OverRight = cell.offsetLeft+E.Width+(row.r1.firstChild.offsetLeft-row.r1.offsetLeft)*2-row.r1.clientWidth; 
      if(E.OverRight<0) E.OverRight = 0;
      
      }
   else E.Width = 0; 
   ME.Space;
   }

// --- Standard cell ---
else {
   var cpl = row.Fixed ? this.CPLastSec : 0;

   // --- Y ---
   if(row.Page){
      if(row.State>=2){
         row = this.PagePosToRow(row,pagepos);
         if(!row) return null;
         E.Height = this.GetRowHeight(row);
         }
      else E.Height = this.RowHeight;
      if(col) { cell = this.GetCell(this.Header,col); cpl = this.CPLastSec; }
      }
   else if(!row.r1&&!cell) { 
      E.Height = this.GetRowHeight(row);
      if(col) { cell = this.GetCell(this.Header,col); cpl = this.CPLastSec; }
      }
   
   else E.Height = cell&&!(nospan&1) ? cell.offsetHeight : row.r1.offsetHeight;
   if(!row.Fixed){ 
      var scr = this.GetScrollTop(1);
      if(!this.NoVScroll) E.Y -= scr;
      E.Y += this.BodyTop + I.BodyBPTop + I.BodyMTop;
      var top = this.GetRowTop(row); 
      if(row.Page) top += pagepos*this.RowHeight;
      if(top < scr) E.OverTop = scr-top;  
      if(top+E.Height > this.GetBodyHeight()+1+scr) E.OverBottom = top+E.Height - this.GetBodyHeight()+1-scr; 
      E.Y += top;
      }
   else { 
      if(row.Fixed=="Foot") E.Y += this.FootTop + I.FootBPTop + I.FootMTop;
      else E.Y += this.HeadTop + I.HeadBPTop + I.HeadMTop;
      if(row.r1) E.Y += row.r1.offsetTop;
      }
   if(type&2) { 
      if(row.NoDynBorder){ E.Height -= I.CellBorderHeightHeader; E.Y += I.CellBorderTopHeader; }
      else if(this.DynamicBorder) E.Height -= I.CellBorderBottom;
      else { E.Height -= I.CellBorderHeight; E.Y += I.CellBorderTop; }
      }
   if(BSafari) E.Y -= I.TablePTop;
   
   // --- X ---
   if(cell||always){
      var X = I.TableBPLeft+this.PagersLeft;
      E.Width = C[col].Width;
      var sec = C[col].Sec, mainsec = C[col].MainSec, S = this.ColNames[sec], left = 0, secw;
      MS.ColPaging; 
      if(this.ColPaging && mainsec==1 && (!cpl||!BChrome||!cell) && (!this.Rtl||!cpl)) {
         if(BChrome && this.BodySec[sec] && !this.Rtl && !BEdge) left += this.BodySec[sec].offsetLeft; 
         else for(var i=1;i<sec;i++) left += this.ColNames[i].Width; 
         }
      ME.ColPaging;
      if(BChrome && !BEdge && this.Rtl && cell && (!(nospan&2)||!row.Spanned||row[col+"Span"]==1)){ 
         
         }      
      else if(BChrome && !BEdge && cell && (!(nospan&2)||!row.Spanned||row[col+"Span"]==1)){ 
         E.Width = cell.offsetWidth;
         if(cell.className.indexOf("OverflowDisable")>=0||cell.className.indexOf("CellImg")>=0) left += cell.getBoundingClientRect().left - cell.parentNode.getBoundingClientRect().left;
         else left += cell.offsetLeft;
         if(cell.className.indexOf(this.Img.Style+"NoLeft")>=0) { E.Width += cell.previousSibling.offsetWidth; left -= cell.previousSibling.offsetWidth; }
         if(cell.className.indexOf(this.Img.Style+"NoRight")>=0) E.Width += cell.nextSibling.offsetWidth; 
         }      
      else {
         for(var i=0;i<S.length&&S[i]!=col;i++) if(C[S[i]].Visible) left += C[S[i]].Width;
         MS.ColSpan;
         if(row.Spanned&&!(nospan&2)){
            var spn = row[col+"Span"];
            if(spn>1){
               
               E.Width = 0;
               while(spn){
                  if(i>=S.length){
                     if(!cpl || sec==0 || sec>=cpl) break;
                     S = this.ColNames[++sec]; i = 0;
                     }
                  if(C[S[i]].Visible) E.Width += C[S[i]].Width;
                  i++; spn--;
                  }
               for(;i<S.length&&spn;i++,spn--) if(C[S[i]].Visible) E.Width += C[S[i]].Width;
               }
            }
         ME.ColSpan;
         }
      MS.UserSec; if(usersec!=null) E.Width = cpl&&usersec==1 ? this.GetBodyScrollWidth() : this.ColNames[usersec].Width; ME.UserSec;

      X += left;
      if(mainsec==0) { X += I.LeftAllLeft; if(this.NoHScroll) left += I.LeftAllLeft; secw = this.TmpLeftWidth-I.LeftAllWidth-this.LeftSplitterWidth; }
      else if(mainsec==1) { X += this.TmpLeftWidth + I.MidAllLeft; if(this.NoHScroll) left += this.TmpLeftWidth + I.MidAllLeft;secw = this.TmpMidWidth-I.MidAllWidth-this.RightSplitterWidth; }
      else if(mainsec==2) { X += this.TmpLeftWidth + this.TmpMidWidth + I.RightAllLeft; if(this.NoHScroll) left += this.TmpLeftWidth + this.TmpMidWidth + I.RightAllLeft;secw = this.TmpRightWidth-I.RightAllWidth; }
      
      
      if(this.NoHScroll){
         var scr = this.GetScrollLeft(-1);
         secw = this.GetBodyWidth(-1);
         }
      else {
         var scr = this.GetScrollLeft(mainsec); X -= scr;
         secw += I.LastBorderRight;
         }
      if(left < scr) E.OverLeft = scr-left;  
      if(left+E.Width > secw+scr) E.OverRight = left+E.Width-secw-scr; 

      if(type&2) {
         if(row.NoDynBorder) { E.Width -= I.CellBorderWidthHeader; X += this.Rtl ? I.CellBorderRightHeader : I.CellBorderLeftHeader; }
         else if(this.DynamicBorder) E.Width -= I.CellBorderRight;
         else { E.Width -= I.CellBorderWidth; X += this.Rtl ? I.CellBorderRight : I.CellBorderLeft; }
         }
      
      E.X += X;   
      }
   else E.Width = 0; 
   }
if(type&4 && cell && (cell.className.indexOf("ClassInnerIcon")>=0||row.Space&&(cell.className.indexOf("CellSpaceEdit")>=0||cell.className.indexOf("CellSpaceSelect")>=0))){
   var cf =  cell.lastChild;
   var x = cf.offsetLeft, y = cf.offsetTop, w = cf.offsetWidth, h = cf.offsetHeight;
   if(!row.SpaceWrap) E.X += x; 
   E.Y += y; E.Width = w; E.Height = h; 
   }
if(type&8 && cell && row.Space){
   for(var cf=cell.lastChild;cf&&cf.className&&cf.className.indexOf("WidthInner")<0;cf=cf.lastChild);
   if(cf){
      cf = cf.parentNode;
   
      if(cf!=cell){
         var x = cf.offsetLeft, y = cf.offsetTop, w = cf.offsetWidth, h = cf.offsetHeight;
         E.X += x; E.Y += y; E.Width = w; E.Height = h; 
         }
      }
   }
MS.Scale;
if(this.Scale) { var Z = this.Scale; for(var a in E) if(E[a]-0) E[a] *= Z; }
if(this.ScaleX) { var Z = this.ScaleX; E.X *= Z; E.Width *= Z; if(E.OverLeft) E.OverLeft *= Z; if(E.OverRight) E.OverRight *= Z; }
if(this.ScaleY) { var Z = this.ScaleY; E.Y *= Z; E.Height *= Z; if(E.OverTop) E.OverTop *= Z; if(E.OverBottom) E.OverBottom *= Z; }
ME.Scale;
E.AbsX = E.X; E.X = 0;
E.AbsY = E.Y; E.Y = 0;   
E.Row = row; E.Col = col;
if(nocell) { E.Col = null; E.Width = 0; }
return E;
}
// -----------------------------------------------------------------------------------------------------------
// Returns width of pager and vertical scrollbar to shift in Rtl

// -----------------------------------------------------------------------------------------------------------

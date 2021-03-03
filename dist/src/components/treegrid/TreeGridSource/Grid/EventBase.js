// -----------------------------------------------------------------------------------------------------------
var CMouseEventLevels = ["Edge","Special","PartType","Part","CellState","CellEdit","CellKind","CellSection","Cell","Section","RowKind","RowSection","Grid"];
var CAPIEvents = {OnFocus:1,OnClick:1,OnRightClick:1,OnDblClick:1,OnMouseDown:1,OnMouseUp:1,OnMouseMove:1,OnMouseOver:1,OnDragGantt:1,OnLongClick:1,OnLongRightClick:1}; 
var CPanelButtons = {"Move":1,"Select":1,"Delete":1,"Copy":1,"MoveAll":1,"SelectAll":1,"DeleteAll":1,"CopyAll":1,"ColMove":1,"ColSelect":1,"ColDelete":1,"ColCopy":1,"ColMoveAll":1,"ColSelectAll":1,"ColDeleteAll":1,"ColCopyAll":1};
// -----------------------------------------------------------------------------------------------------------
TGP.GetMouseEvent = function(ev,arow){
if(ev.clientX==null) return this.Event;

if(this.AImg) this.ARow = null;
var E = {}, row = arow?arow:this.ARow, col, I = this.Img, A; if(!arow) this.ACol = null;
E.ClientX = ev.clientX; E.ClientY = ev.clientY; E.Row = row; E.Sec = this.ASec;
E.Button = ev.which!=null ? ev.which : [0,1,3,1,2,1,3,1][ev.button&7]; 
var A = EventToWindow(ev); E.AbsX = A[0]-CAbsDX; E.AbsY = A[1]-CAbsDY;

if(BMozilla && ev.type=="DOMMouseScroll") return this.Event; 

var X = A[0] - this.TableX, Y = A[1] - this.TableY; 
MS.Scale;
if(this.Scale) { var Z = this.Scale; X /= Z; Y /= Z; }
if(this.ScaleX) X /= this.ScaleX; 
if(this.ScaleY) Y /= this.ScaleY;
ME.Scale;

if((X<0 || X>=this.TableWidth || Y<0 || Y>=this.TableHeight)){
   var out = 1;
   if(row&&(row.Tag||row.Space==-1||row.Space==5)){ 
      var A = ElemToWindow(row.r1,1);
      if(E.AbsX>=A[0] && E.AbsX <= A[0]+row.r1.offsetWidth && E.AbsY>=A[1] && E.AbsY <= A[1]+row.r1.offsetHeight) out = 0;
      }
   if(out) {
      
      E.Row = null; E.MinY = -10000; E.MaxY = 10000; E.MinX = -10000; E.MaxX = 10000;
      
      E.Grid = "Outside";
      this.ASec = null; E.Sec = null; 
      if(Grids.Active==this && !arow && (!Grids.Drag||Grids.Drag.Action!="Scrollbar"&&Grids.Drag.Action!="Scroll")) Grids.Active = null;
      return E;
      }
   }

if(Grids.Active!=this && !arow){
   var G = Grids.Active;
   Grids.Active = this;
   if(G) {
      G.GridMouseOver(ev);
      if(Grids.Active!=this) { 
         Grids.Active = this; 
         G.GridMouseOver({clientX:-100,clientY:-100});   
         }
      }
   }

E.Grid = "Grid";
E.Edge = "Inside";

MS.Resize;
if(this.ResizingMain&&!this.Locked["resizegrid"]){
   var edge = this.Touched?this.Mouse.GridSizeTouch-0:this.Mouse.GridSize-0; if(!edge) edge = I.ResizeGrid;
   if(Y > this.TableHeight - edge){
      if(this.Rtl){
         
         }
      else if(X > this.TableWidth - edge){
         E.Edge = "Resize";
         E.SMinX = this.TableWidth - edge - X;
         }
      else E.SMaxX = this.TableWidth - edge - X;
      }
   }
ME.Resize;

if(!row || !row.r1 || row.Page){
   if(!arow) this.ARow = null; 
   E.Row = null;
   E.RowKind = "NoRow";
   var sec = this.ASec, edge = this.Touched?this.Mouse.EdgeSizeTouch-0:this.Mouse.EdgeSize-0;
   
   if(this.AImg){
      E.RowSection = "Img";
      E.Img = this.AImg;
      }

   else if(sec==-1){
      E.RowSection = "VScroll";
      var O = this.ScrollVertParent;
      E.MinX = O.offsetLeft-X; 
      E.MaxX = E.MinX + O.offsetWidth; 
      E.MinY = -Y; 
      E.MaxY = E.MinY + O.offsetHeight;
      }
   
   else if(sec==-2 || sec==-3 || sec==-4 || sec==-5){
      E.RowSection = sec==-5 ? "Other" : "HScroll";
      var O = sec==-5 ? this.ScrollDot : this.ScrollHorzParent[-sec-2];
      E.MinX = O.offsetLeft-X; 
      E.MaxX = E.MinX + O.offsetWidth; 
      E.MinY = O.parentNode.offsetTop-Y; 
      E.MaxY = E.MinY + O.offsetHeight;
      if(sec!=-5) E.Special = ["Left","Mid","Right"][-sec-2];
      
      if(-E.MinX <= edge && (sec==-3||sec==-4)){ E.Edge = sec==-3 ? "HScrollLeft" : "HScrollRight"; E.SMaxX = edge + E.MinX; }
      else if(E.MaxX <= edge && (sec==-3||sec==-2)){ E.Edge = sec==-3 ? "HScrollRight" : "HScrollLeft"; E.SMinX = E.MaxX - edge; }
      else { E.SMinX = E.MinX + edge; E.SMaxX = E.MaxX - edge; }
      
      if(E.Edge=="HScrollLeft" && !this.HasLeftSplitterS || E.Edge=="HScrollRight" && !this.HasRightSplitterS) E.Edge = "Inside";
      }

   else if(sec==-6){
      for(var i=0,O=this.LeftSplitter[i];!O;O=this.LeftSplitter[++i]);
      E.MinX = O.offsetLeft-X-I.LeftAllWidth+I.LeftAllLeft; 
      E.MaxX = O.offsetLeft-X+O.offsetWidth+I.MidAllLeft;
      E.MinY = O.offsetTop-Y;
      for(var i=3,O=this.LeftSplitter[i];!O;O=this.LeftSplitter[--i]);
      E.MaxY = E.MinY + O.offsetTop + O.offsetHeight;
      E.RowSection = "LeftSplitter"; E.Edge = "HScrollLeft";
      }

   else if(sec==-7){
      for(var i=0,O=this.RightSplitter[i];!O;O=this.RightSplitter[++i]);
      E.MinX = O.offsetLeft-X-I.MidAllWidth+I.MidAllLeft; 
      E.MaxX = O.offsetLeft-X+O.offsetWidth+I.RightAllLeft;
      E.MinY = O.offsetTop-Y;
      for(var i=3,O=this.RightSplitter[i];!O;O=this.RightSplitter[--i]);
      E.MaxY = E.MinY + O.offsetTop + O.offsetHeight;
      E.RowSection = "RightSplitter"; E.Edge = "HScrollRight";
      }
   
   else if(sec<=-10){
      MS.Pager;
      var P = this.Pagers[-sec-10];
      var par = P.Tag.parentNode.parentNode, pt = P.Tag, ptc = pt.firstChild;
      X -= par.offsetLeft; Y -= par.offsetTop;
      if(BIEA&&!BIE8Strict) { X -= pt.offsetLeft; Y -= pt.offsetTop; } 
      X -= ptc.offsetLeft;  
      
      if(BIEA){ X-=pt.clientLeft; Y-=pt.clientTop; }
      if(Y<P.Head.offsetHeight){ 
         if(X<=edge){ E.Edge = "PagerHeaderLeft"; E.SMaxX = edge-X; }
         else if(X>=ptc.offsetWidth-edge){ E.Edge = "PagerHeaderRight"; E.SMinX = ptc.offsetWidth-edge-X; }
         else { E.SMinX = edge-X; E.SMaxX = ptc.offsetWidth-X-edge; }
         
         E.CellSection = "PagerHeader";
         E.Cell = "Empty";
         E.MinX = -X; E.MaxX = par.offsetWidth-X;
         E.MinY = -Y; E.MaxY = P.Head.offsetHeight-Y;
         }
      else {
         
         Y -= P.Body.offsetTop-P.Body.scrollTop;
         if(BIEA&&!BIE8Strict) Y -= P.Body.firstChild.offsetTop; 
         if(P.Body.clientTop) Y -= P.Body.clientTop;
         X -= P.Body.offsetLeft;
         var pg = P.Pages.firstChild, pgh = this.GetPagerItemHeight(P);
          
         E.MinX = -X; E.MaxX = P.Body.firstChild.offsetWidth-X;
         var p = Math.floor(Y/pgh);
         if(p<0); 
         else if(X > pg.offsetWidth){ 
            E.Cell = "Empty";
            E.MinY = -Y; E.MaxY = P.Body.offsetHeight-Y;
            E.MinX = pg.offsetWidth-X; E.MaxX = par.offsetWidth-X;
            }
         else if(p<P.Pages.childNodes.length){ 
            E.Special = "PagerPage"+(p+1);
            E.Cell = "PagerPage";
            Y -= P.Pages.childNodes[p].offsetTop;
            if(!BIEA||BIE8Strict) Y += P.Body.offsetTop;
            E.MinY = -Y; E.MaxY = pgh-Y;
            }
         else { 
            E.Cell = "Empty";
            Y -= P.Pages.offsetHeight;
            E.MinY = -Y; E.MaxY = P.Body.offsetHeight-Y;
            }
         E.CellSection = "PagerBody";   
         }
      E.X = X;
      E.Y = Y;
      E.RowSection = "Pager";
      E.Col = P.Name ? P.Name : "Pager";
      ME.Pager;
      }

   else E.RowSection = "Other";   
   return E;
   }

E.RowSection = "Row";
var hdr = row.Kind=="Header";
if(hdr) { E.RowKind = "HeaderRow"; E.CellSection = "Header"; }
else if(row.Space) { E.RowKind = "SpaceRow"; E.CellSection = "Space"; E["Section"] = "All"; }
else if(row.Fixed) { E.RowKind = "FixedRow"; E.CellSection = "Fixed"; }
else { E.RowKind = "BodyRow"; E.CellSection = "Body"; }
E.CellKind = "Kind"+row.Kind;

if(row.Space){
   MS.Space;
   var col = this.ASpaceCol, cell = this.GetCell(row,col); 
   X += row.r1.parentNode.offsetLeft;
   if(row.Space>=1&&row.Space<=3) X -= this.PagersLeft; 
   if(row.Tag||row.Space==-1||row.Space==5){
      var AA = ElemToWindow(row.r1);
      X += this.TableX-AA[0]+row.r1.offsetLeft, Y += this.TableY-AA[1];
      MS.Scale; if(this.Scale) X -= (row.r1.offsetLeft-row.r1.parentNode.offsetLeft)*(1-this.Scale); ME.Scale;
      
      // -= 40;
      Y -= row.r1.firstChild.offsetTop;
      if(BIEA&&!BIEA8||BIE) Y -= row.r1.clientTop;
      else Y += row.r1.offsetTop;
      X -= row.r1.parentNode.offsetLeft;
      }
   else {   
      var y = I.SpaceMargin + row.r1.parentNode.parentNode.offsetTop + row.r1.firstChild.offsetTop, h = row.r1.firstChild.offsetHeight;
      Y -= y;
       
      if(Y<0 || Y>h || !col){
         E.MinX = -X; E.MaxX = row.r1.parentNode.parentNode.offsetWidth - X;
         if(Y<0){ E.MinY = -y; E.MaxY = -Y; }
         else { E.MinY = h-Y; E.MaxY = row.r1.parentNode.offsetHeight-row.r1.firstChild.offsetTop-Y; }
         E.Y = Y; E.Cell = "Empty"; return E;
         }
      
      }
   if(cell) { 
      X -= cell.offsetLeft + I.TableBPLeft + row.r1.firstChild.offsetLeft;
      MS.FFOnly; MX.FFOnly; if(BIEA) X -= row.r1.clientLeft; ME.FFOnly;
      E.Width = cell.offsetWidth;
      E.Height = cell.offsetHeight;
      E.MinX = -X; E.MaxX = E.Width - X + I.SpaceMargin;
      E.MinY = -Y; E.MaxY = E.Height - Y;
      
      }
   else {
      var lc = row.r1.lastChild;
      if(lc){
         var l = lc.offsetLeft+lc.offsetWidth;
         X -= l + I.TableBPLeft + row.r1.firstChild.offsetLeft + row.r1.parentNode.offsetLeft;
         E.Width = row.r1.clientWidth - l;
         E.Height = lc.offsetHeight;
         E.MinX = -X; E.MaxX = E.Width - X;
         E.MinY = -Y; E.MaxY = E.Height - Y
         }
      }
   ME.Space;
   }

else {

   var sec,secw,mainsec,split = 0;
     
   X -= I.TableBPLeft + this.PagersLeft;
   if(X<this.TmpLeftWidth){ 
      if(X<0) { E.Y = Y; E.Cell = "Empty"; return E; }
      sec = 0; mainsec = 0; E["Section"] = "Left"; X -= I.LeftAllLeft; secw = this.TmpLeftWidth-I.LeftAllWidth-this.LeftSplitterWidth;
      if(secw<X && this.LeftSplitter) split = 1;
      }
   else { 
      X-= this.TmpLeftWidth; 
      if(X<this.TmpMidWidth){ 
         E["Section"] = "Mid"; X -= I.MidAllLeft; secw = this.TmpMidWidth-I.MidAllWidth-this.RightSplitterWidth; sec = 1; mainsec = 1;
         if(X<0 && this.LeftSplitter) split = 1;
         if(secw<X && this.RightSplitter) split = 2;
         }
      else {
         X-= this.TmpMidWidth; 
         if(X<this.TmpRightWidth){ 
            sec = this.ColNames.length-1; mainsec = 2; E["Section"] = "Right"; X -= I.RightAllLeft; secw = this.TmpRightWidth-I.RightAllWidth; 
            if(X<0 && this.RightSplitter) split = 2;
            }
         else { E.Y = Y; E.Cell = "Empty"; return E; } 
         }
      }
   if(split) { 
      this.ASec = split==2?-7:-6; E.Sec = this.ASec;
      if(E.Row!=this.FRow) E.Row = null; 
      E.RowSection = split==2?"RightSplitter":"LeftSplitter"; E.Edge = split==2?"HScrollRight":"HScrollLeft"; 
      E.RowKind = null; E.CellSection = null; E.CellKind = null; E["Section"] = null; E.Y = Y; 
      return E;
      }
   
   var left = 0, scr = this.GetScrollLeft(mainsec), cpl = row.Fixed ? this.CPLastSec : 0; X += scr;
   MS.ColPaging; 
   if(this.ColPaging && mainsec==1 && !cpl) {
      while(sec<this.LastSec && X>=this.ColNames[sec].Width) { var w = this.ColNames[sec++].Width; X -= w; left += w; } 
      if(BChrome && this.BodySec[sec] && !this.Rtl && !BEdge){ 
         var nleft = this.BodySec[sec].offsetLeft;
         if(nleft!=left){
            X += left-nleft; left = nleft;
            while(sec<this.LastSec && this.BodySec[sec] && X>=this.BodySec[sec].offsetWidth) { var w = this.BodySec[sec++].offsetWidth; X -= w; left += w; } 
            }
         }
      }
   ME.ColPaging;
      
   var S = this.ColNames[sec], sp = row && row.Spanned, ZX = X, zl = left, i = 0, ecol = this.EditMode&&this.Edit&&row==this.ERow ? this.ECol : null, ecol2 = ecol&&this.Edit.Tag.className.search(/Edit(Right|Center)/)>=0;
   if(X>=0) {
      while(1){
         if(i>=S.length){
            if(!cpl || sec==0 || sec>=cpl) break;
            i = 0;
            S = this.ColNames[++sec];
            }
         var s = S[i++], c = this.Cols[s];
         if(c.Visible || sp && row[s+"Span"] > 1) { 
            var w = s==ecol&&!ecol2 ? this.Edit.Tag.parentNode.offsetWidth : sp ? this.GetWidth(row,s) : c.Width;
            X -= w; left += w;
            }
         if(X < 0){ 
            if(BChrome && !BEdge && s!=ecol){ 
               var ss = this.GetNextCol(s,row); 
               if(ss&&this.Cols[ss].Sec==c.Sec){
                  var cell = this.GetCell(row,ss);
                  if(cell && cell.offsetLeft && cell.className.indexOf("CellImg")<0 && cell.className.indexOf("OverflowDisable")<0){  
                     var dw = ss==this.MainCol&&!this.HideTree ? cell.previousSibling.offsetWidth : 0, ol = cell.offsetLeft;
                     
                     X = ZX-ol+dw; 
                     left = zl+ol-dw;
                     if(ol<=ZX) { 
                        if(!sp || cell!=this.GetCell(row,S[i-1]) || ol+cell.offsetWidth<=ZX) { s = ss; c = this.Cols[s]; }
                        var w = sp ? this.GetWidth(row,s) : c.Width;
                        X -= w; left += w;
                        } 
                     }
                  }
               }
            col = s; 
            if(ecol2&&col!=ecol) for(var t=ev.target,p=this.Edit.Tag;t;t=t.parentNode) if(t==p){ col = ecol; break; } 
            var w = col==ecol ? this.Edit.Tag.parentNode.offsetWidth : sp ? this.GetWidth(row,col) : c.Width;
            X += w; left -= w;
             
            E.MinX = -X; E.MaxX = w - X;
            
            E.Width = w;
            break; 
            }
         }
      }

   var r = row.r1, h = r.offsetHeight;
   MS.RowSpan;
   if(row[col+"Visible"]==-2 || row.RowSpan && row[col+"RowSpan"]==0){
      var rc = this.GetSpanRow(row,col,0);
      if(rc) { 
         row = rc;
         while(!rc.Visible) rc = rc.nextSibling;
         if(rc!=E.Row && rc.Spanned && rc[col+"Span"]==0) return this.GetMouseEvent(ev,rc);
         if(!arow) this.ARow = rc; 
         E.Row = rc; r = rc.r1; h = r.offsetHeight;
         }
      }
   if(row.RowSpan && row[col+"RowSpan"]>1) {
      var cell = this.GetCell(row,col);
      if(cell) h = cell.offsetHeight;
      }
   ME.RowSpan;   
   if(!row.Fixed){ 
      var scrt = this.GetScrollTop(1);
      Y -= this.BodyTop + I.BodyBPTop + I.BodyMTop;
      if(!this.NoVScroll) Y += scrt;
      var top = this.GetRowTop(row); 
      if(top < scrt) E.OverTop = scrt-top;  
      if(top+h > this.GetBodyHeight()+1+scrt) E.OverBottom = top+h - this.GetBodyHeight()+1-scrt; 
      Y -= top;
      }
   else { 
      if(row.Fixed=="Foot") Y -= this.FootTop + I.FootBPTop + I.FootMTop;
      else Y -= this.HeadTop + I.HeadBPTop + I.HeadMTop;
      Y -= r.offsetTop;
      }
   E.Height = h;
   E.MinY = -Y-1; E.MaxY = h - Y; 
   
   MS.UserSec;
   var usec = this.UserSec[sec];
   if(row[usec]!=null||row.Def[usec]!=null){
      E["CellKind"] = "KindUser"; 
      E.Width = this.ColNames[sec].Width;
      if(cpl&&mainsec==1) { E.Width = this.GetBodyScrollWidth(); sec = 1; }
      E.X = ZX; E.Y = Y;
      E.MinX = -ZX; E.MaxX = E.Width - ZX;
      E["CellEdit"] = "UserPage"+sec; 
      var left = 0; MS.ColPaging; if(this.ColPaging && mainsec==1 && !cpl) for(var i=1;i<sec;i++) left += this.ColNames[i].Width; ME.ColPaging;
      if(left < scr) E.OverLeft = scr-left;  
      if(left+E.Width > secw+scr) E.OverRight = left+E.Width-secw-scr; 
      
      return E;
      }
   ME.UserSec;   

   if(X<0){ E.Y = Y; E.MinX = X; E.MaxX = -X; E.Cell = "Empty"; return E; } 
   secw += I.LastBorderRight;
   if(left < scr) E.OverLeft = scr-left;  
   if(left+w > secw+scr) E.OverRight = left+w-secw-scr; 
   

   if(BTablet && !this.FocusedEdge && this.FocusRect&2 && this.FRow && this.FCol && row && col){
      var FR = this.FRect, lr = FR ? FR[2] : this.FRow, lc = FR ? FR[3] : this.FCol, d = this.Mouse.EdgeSizeTouch/2;
      var nr = this.GetNextVisible(lr.RowSpan&&lr[lc+"RowSpan"]>1?this.GetLastSpanRow(lr,lc):lr), nc = this.GetNextCol(lc,lr); 
      
      if((row==lr&&E.Height-Y<=d||row==nr&&Y<=d)&&(col==lc&&E.Width-X<=d||col==nc&&X<=d)){ 
         E.Edge = "Corner";
         }
      }
   if(BTablet && !this.FocusedEdge && this.FocusRect&32 && this.FRow && this.FCol && row && col && E.Edge!="Corner"){
      var FR = this.FRect, fr = FR ? FR[0] : this.FRow, lr = FR ? FR[2] : fr, fc = FR ? FR[1] : this.FCol, lc = FR ? FR[3] : fc, d = this.Mouse.EdgeSizeTouch/2, CC = this.Cols; 
      
      var nr = this.GetNextVisible(row.RowSpan&&row[col+"RowSpan"]>1?this.GetLastSpanRow(row,col):row), pr = this.GetPrevVisible(row); if(pr&&pr.RowSpan&&pr[col+"RowSpan"]==0) pr = this.GetSpanRow(pr,col);
      var nc = this.GetNextCol(row,col), pc = this.GetPrevCol(row,col);
      if((lr==pr&&Y<=d||fr==nr&&E.Height-Y<=d) && (col==fc||col==lc||FR&&(CC[col].Sec>CC[fc].Sec||CC[col].Sec==CC[fc].Sec&&CC[col].Pos>CC[fc].Pos)&&(CC[col].Sec<CC[lc].Sec||CC[col].Sec==CC[lc].Sec&&CC[col].Pos<CC[lc].Pos))){
         E.Edge = lr==pr ? "BottomEdge" : "TopEdge";
         }
      else if(lc==pc&&X<=d||fc==nc&&E.Width-X<=d){
         if(fr==row||lr==row) E.Edge = lc==pc ? "RightEdge" : "LeftEdge";
         else if(FR) for(var r=fr;r&&r!=lr;r=this.GetNextVisible(r)) if(r==row){ E.Edge = lc==pc ? "RightEdge" : "LeftEdge"; break; }
         }
      }
   }

if(this.FocusedEdge) {
   E.Edge = this.FocusedEdge;
   if(E.Edge=="LeftEdge"||E.Edge=="RightEdge"||E.Edge=="Corner"){ E.MinX = 0; E.MaxX = 0; }
   if(E.Edge=="TopEdge"||E.Edge=="BottomEdge"||E.Edge=="Corner"){ E.MinY = 0; E.MaxY = 0; }
   
   }

E.X = X; E.Y = Y; E.Col = col;

if(!arow) this.ACol = col; 

if(!col){ E.Cell = "Empty"; return E; }

var C = row.Space?this.DefCols.Space:this.Cols[col];

MS.RelWidth;
if(C.ConstWidth) {
   if(!arow) this.ARow = null;
   
   E.Row = null;
   E.RowKind = "NoRow";
   E.RowSection = "Other";
   E.CellKind = null;
   return E;
   }
ME.RelWidth;

var ct = col+"Type", type = row[ct], D = row.Def;
if(type==null){ 
   type = D[ct]; 
   if(C && type==null) {
      type = C.Type;
      if(row.Kind=="Filter" && !CEditTypes[type] && type!="Panel" && !C.ConstWidth && type!="Button") type = "Text";
      if(row.Kind=="Panel" && !C.ConstWidth && type!="Button") type = "Panel"; 
      }
   }
if(Grids.OnGetType) { var tmp = Grids.OnGetType(this,row,col,type); if(tmp!=null) type = tmp; }
var cf = this.CanFocus(row,col), ce = this.CanEdit(row,col,null,type,cf);



E.Cell = "Cell";
if(ce) E.CellEdit = "Editable";
else if(cf) E.CellEdit = "ReadOnly";
else E.CellEdit = "NoFocus";
if(row!=this.FRow || col!=this.FCol) E.CellState = "Regular";
else if(!this.EditMode) E.CellState = "Focused";
else if(ce==2) E.CellState = "Viewed";
else E.CellState = "Edited";
E.Part = hdr ? "Caption" : "Content";
E.Type = type; E.CanEdit = ce; E.CanFocus = cf;
E.PartType = "Nothing";

var res = row[col+"Resizing"]; if(res==null) res = D[col+"Resizing"]; if(res==null&&!hdr) res = C.Resizing;
MS.ColResize;
if(hdr&&res==null || res&2&&!row.Space){
   var edge = this.Touched?this.Mouse.EdgeSizeTouch:this.Mouse.EdgeSize, w = row.Spanned?this.GetWidth(row,col):C.Width;
   var br = row.NoDynHeader ? I.CellBorderRightHeader : I.CellBorderRight;
   
   if(X<=edge && !this.Rtl){ var pcol = this.GetPrevCol(col); if(!pcol || !this.Cols[pcol].CanResize || this.Cols[col].MainSec!=this.Cols[pcol].MainSec&&this.ScrollHorzShown[this.Cols[pcol].MainSec]) edge = X-1; }
   if(X<=edge && this.ColResizing && (C.CanResize||!this.Rtl)&&!this.Locked["resizecol"]){ E.Edge = "HeaderLeft"; E.SMinX = -X; E.SMaxX = edge-X; }
   else if(X>=w-edge-br && this.ColResizing && (C.CanResize||this.Rtl)&&!this.Locked["resizecol"]) { E.Edge = "HeaderRight"; E.SMinX = w-edge-br - X; E.SMaxX = w - X - 1; }
   else { E.SMinX = X<=edge ? 0 : edge - X; E.SMaxX = w-edge-br - X; if(E.SMaxX<0) E.SMaxX = 0; }
   }
ME.ColResize;

if(res&1&&this.Resizing&&!this.Locked["resizerow"]){
   var edge = this.Touched?this.Mouse.RowSizeTouch:this.Mouse.RowSize, h = E.Height;
   if(Y<=edge && !row.Space){ var prow = this.GetPrevVisible(row,col); if(!prow || !Get(prow,"CanResize")) edge = Y-1; }
   var bb = row.NoDynHeader ? I.CellBorderBottomHeader : I.CellBorderBottom;
   if(Y<=edge && !row.Space){ E.Edge = "HeaderTop"; E.SMinY = -Y; E.SMaxY = edge-Y; }
   else if(Y>=h-edge-bb && Get(row,"CanResize")) { E.Edge = "HeaderBottom"; E.SMinY = h-edge-bb - Y; E.SMaxY = h - Y - 1; }
   else { E.SMinY = Y<=edge ? 0 : edge - Y; E.SMaxY = h-edge-bb - Y; if(E.SMaxY<0) E.SMaxY = 0; }
   }

var tx = null;
MS.Tree;
if(col==this.MainCol && !this.HideTree && !row.Fixed && this.Cols[col].Visible){ 
   var rr = row;
   MS.RowSpan;
   if(row.RowSpan && row[this.MainCol+"RowSpan"]>1 && !(row[this.MainCol+"RowSpan"]%1) && !row.firstChild) { 
      while(rr.nextSibling&&!rr.nextSibling[this.MainCol+"RowSpan"]) rr = rr.nextSibling;
      }
   ME.RowSpan;
   var lw = I.Line, tw = I.Tree; 
   if(this.SpannedTree){ if(rr.TreeWidthL!=null) lw = rr.TreeWidthL; if(rr.TreeWidthT!=null) tw = rr.TreeWidthT; }
   tx = rr.Level*lw+I.CellBorderLeft;
   if(this.HideRootTree) tx -= lw;
   if(this.Rtl){ 
      
      }
   else {   
      tx -= X;
      if(tx+tw>0) { 
         var t = Get(rr,"CanExpand")&1 && this.HasChildren(rr);
         if(t && (tx<=0||E.MaxX<=tx+tw)) { 
            E.MinX = tx; 
            if(E.MaxX>tx+tw) E.MaxX = tx + tw;
            E.PartType = "Expand";
            }
         else {   
            if(E.MaxX>tx+(t?0:tw)) E.MaxX = tx + (t?0:tw);
            E.PartType = "Nothing"; 
            }
         E.Part = "Tree";   
         return E;   
         }
      else X = -tx - tw; 
      E.MinX = tx + tw;
      }
   }

else if(hdr && this.MainCol && !this.HideTree && row[col+"ALevels"]){
   var bl = row.NoDynHeader ? I.CellBorderLeftHeader : I.CellBorderLeft;
   var lev = row[col+"ALevels"], max = I.Line*lev+bl;
   
   if(X<max){
      var pos = Math.floor((X-bl)/I.Line);
      E.MinX = pos*I.Line+bl-X; 
      E.MaxX = E.MinX + I.Line;
      E.PartType = "Levels";
      E.Part = "Tree";
      E.Special = "Levels"+(pos+1);
      
      return E;
      }
   X -= max;  
   E.MinX += max;
   
   }

ME.Tree;

MS.Panel;
if(type=="Panel"){
   E.Part = "Panel"; var ip = I.Panel;
   if(Get(row,"PanelVisible")<=0){
      E.PartType = row.Kind=="Search"||row.Kind=="Group" ? "SpaceOff" : "PanelOff";
      return E;
      }
   
   if(row.Fixed && (row.Kind=="Group" || row.Kind=="Filter" || row.Kind=="Search") && !Get(row,col)) { 
      var x = Math.floor((E.MaxX - E.MinX - ip)/2);
      
      if(X>=x && X <= x + ip){
         E.MinX = x - X;
         E.MaxX = x - X + ip;
         E.PartType = "Panel"+row.Kind+"ed"; return E; 
         }         
      if(X<x) E.MaxX = x-X;
      else E.MinX = x+ip-X;
      E.PartType = row.Kind=="Filter" ? "PanelOff" : "SpaceOff";   
      return E;
      }
   var n = "Panel", np = n+"Off", x = 0, rpan = row.Kind=="Panel", val = row[col]; if(val==null) val = D[col]; 
   if(!val) val = rpan&&C.Type!="Panel" ? Get(row,"Buttons") : C.Buttons;
   
   E.PartType = np;
   var pl = rpan ? I.RowPanelPLeft : I.PanelPLeft;
   if(!this.Rtl) { X -= pl; if(X<0) { E.PartType = "PanelOff"; E.MinX = X-pl; E.MaxX = -X; return E; } }
   var rot = null; MS.Rotate; rot = row[col+"Rotate"]; if(rot==null) rot = D[col+"Rotate"]; if(rot==null&&this.DynamicStyle) rot = this.GetRotate(row,col); ME.Rotate;
   
   
   if(val) {
      var cell = this.GetCell(row,col), ok = 0;
      if(cell){
         MS.Rotate;
         if(rot) { var y = cell.offsetHeight; cell = cell.lastChild; }
         if(rot==3) rot = BIEA&&!BIEA10?2:1;
         ME.Rotate;
         if(!this.Rtl) X += pl; 
         
         for(var r=cell.firstChild,i=0;r;r=r.nextSibling,i++) if(r.nodeName!="IMG"){
            if(BIEA6 && r.tagName.toLowerCase()=='i') r = r.firstChild;
            if(rot){
               MS.Rotate;
               var pw = r.nextSibling?r.nextSibling.offsetTop:r.offsetTop+r.offsetHeight;
               if(rot==1 ? Y>y-pw : Y<pw){
                  E.MinY = Y-y+pw;
                  E.MaxY = Y-y+r.offsetLeft;
                  ok = 1;
                  }
               ME.Rotate;
               }
            else if(X<x+r.offsetLeft+r.offsetWidth){
               x += r.offsetLeft;
               E.MinX = x-X;
               E.MaxX = x-(X+r.offsetWidth<E.Width-pl?X+r.offsetWidth:E.Width-pl);
               
               ok = 1;
               }
            if(ok){
               val = (val+"").split(',');
               MS.Rotate; if(rot==2||this.Rtl) val = val.reverse(); ME.Rotate;
               for(var j=0;j<=i;j++) if(CPanelButtons[val[j]]){
                  var v = val[j];
                  if((v=="Move"||v=="MoveAll") && !this.Dragging || (v=="Select"||v=="SelectAll") && !this.Selecting || (v=="Delete"||v=="DeleteAll") && !this.Deleting || (v=="Copy"||v=="CopyAll") && !this.Copying
                     || v=="ColMove" && !this.ColMoving || v=="ColSelect" && (!this.Selecting||!this.SelectingCols&&!this.SelectingCells) || v=="ColDelete" && !this.ColDeleting || v=="ColCopy" && !this.ColCopying
                  ) i++;
                  }
               var v = val[i];
               if(CPanelButtons[v] && (v=="Move" && !Is(row,"CanDrag") || v=="Select" && !this.CanSelect(row,this.SelectingCells==2) || v=="Delete" && !Is(row,"CanDelete") || v=="Copy" && !Is(row,"CanCopy")
                  || v=="ColMove" && !C.CanMove || v=="ColSelect" && !((C.CanSelect==1||C.CanSelect==2&&this.SelectingCols)&&(!C.Deleted||!(this.ClearSelected&1))||C.CanSelect==3&&this.SelectingCells) 
                  || v=="ColDelete" && !C.CanDelete || v=="ColCopy" && !C.CanCopy)) v = "";
               else if(hdr && (v=="Move"||v=="Select"||v=="Delete"||v=="Copy")) v += "All";
               E.PartType = !v || v=="Empty" ? n + "Off" : n + v; 
               return E;
               }
            }
         }
      if(rot) { MS.Rotate; E.MaxY = Y-y; ME.Rotate; }
      else if(cell&&cell.lastChild) E.MinX = x+cell.lastChild.offsetLeft+cell.lastChild.offsetWidth-X;
      else E.MinX = x-X;
      return E;
      }

   var add = hdr ? "All":"";
   if(rot && (!this.FastPanel||BTablet)){
      MS.Rotate;
      var cell = this.GetCell(row,col);
      if(cell){
         var y = cell.offsetHeight;
           if(this.Dragging && C.Move) y -= ip; if(Y>y){ if(Is(row,"CanDrag")) E.PartType = n+"Move"+add; E.MinY = Y-y; E.MaxY = Y-y+ip; return E; } 
           if(this.Selecting && C.Select) y -= ip; if(Y>y){ if(this.CanSelect(row)) E.PartType = n+"Select"+add; E.MinY = Y-y; E.MaxY = Y-y+ip; return E; } 
         if(this.Deleting && C.Delete) y -= ip; if(Y>y){ if(Is(row,"CanDelete")) E.PartType = n + "Delete"+add; E.MinY = Y-y; E.MaxY = Y-y+ip; return E; } 
         if(this.Copying && C.Copy) y -= ip; if(Y>y){ if(Is(row,"CanCopy")) E.PartType = n + "Copy"+add; E.MinY = Y-y; E.MaxY = Y-y+ip; return E; } 
         E.MaxY = Y-y;
         }
      ME.Rotate;
      }
   
   else {
        if(this.Dragging && C.Move) x += ip; if(X<x){ if(Is(row,"CanDrag")) E.PartType = n+"Move"+add; E.MinX = x-X-ip; E.MaxX = x-X; return E; } 
        if(this.Selecting && C.Select) x += ip; if(X<x){ if(this.CanSelect(row)) E.PartType = n+"Select"+add; E.MinX = x-X-ip; E.MaxX = x-X; return E; } 
      if(this.Deleting && C.Delete) x += ip; if(X<x){ if(Is(row,"CanDelete")) E.PartType = n + "Delete"+add; E.MinX = x-X-ip; E.MaxX = x-X; return E; } 
      if(this.Copying && C.Copy) x += ip; if(X<x){ if(Is(row,"CanCopy")) E.PartType = n + "Copy"+add; E.MinX = x-X-ip; E.MaxX = x-X; return E; } 
      E.MinX = x-X;
      }
   return E;
   }
ME.Panel;

MS.SideButton;
var cbut = col+"Button", but = row[cbut]; if(but==null){ but = D[cbut]; if(C && but==null) but = C.Button; }
var cico = col+"Icon",   ico = row[cico]; if(ico==null){ ico = D[cico]; if(C && ico==null) ico = C.Icon; }
if(type=="Button") { but = null; if(ico-0) ico = null; } 
if(type=="File" && (!BIEA||BIEA10)){ 
   if(but==null && ico!="File") but = "File"; 
   if(ico==null && row[col] && but!="Clear") ico = "Clear";
   }
var btnsort = "", ipos = null;
if(but==null && ce && type=="Date" && ico!="Date" && !this.AutoCalendar) { 
   if(!ico&&row[col+"ClsInIcon"]==I.Style+"#"+I.Size) { ico = "Date"; ipos = "Right"; }
   else but = "Date";
   }
else if(but||ico){   
   if(but=="Sort" || ico=="Sort"){
      MS.Sort;
      if(Get(row,"SortIcons")==2 && (!this.Sort||this.Sort.search(new RegExp("(^|,)-?"+col+"($|,)"))<0 && col!=this.DefaultSort)) { if(but=="Sort") but = ""; else ico = ""; }
      if(this.SortIcons<=1) { if(!(Get(row,col+"Visible")<0)) E.Special = "Sort"; } 
      if(this.SortIcons>=2) { 
         var cell = this.GetCell(row,col);
         if(cell) { 
            var h = 0;
            if(this.SortIcons==2&&but=="Sort") { cell = cell.nextSibling; if(cell) cell = cell.lastChild; if(cell&&cell.nodeType==1) h = Math.floor(cell.offsetHeight/2+cell.offsetTop); }
            if(!h) h = Math.floor(cell.offsetHeight/2);
            if(Y<=h){ E.MaxY = h-Y; btnsort = "Up"; }
            else { E.MinY = h-Y; btnsort = "Down"; }   
            if(this.SortIcons==3 && !(Get(row,col+"Visible")<0)) E.Special = "Sort"+btnsort;
            }
         }
      
      ME.Sort;
      }
   else if(!ce) {   
      if(but=="Filter" && Get(row,col+"ShowMenu")!=1) but = null; 
      if(ico=="Filter" && Get(row,col+"ShowMenu")!=1) ico = null;
      }
   }   
if(but && !(Get(row,col+"Visible")<0)){ 
   if(row.Space){
      if(!CButtonTypes[but]) but = "Icon";
      var w = Get(row,col+"ButtonWidth"), balign = CAlignTypes[Get(row,col+"ButtonAlign")];
      if(balign=="Left"){
         if(!w) { w = I[but+"Left"]; if(!w) w = I.SideLeft; }
         w += row.NoDynHeader ? I.CellBorderLeftHeader : I.CellBorderLeft;
         if(-E.MinX < w || (!ce&&!ico&&but!="File")) {
            if(-E.MinX < w) { E.MaxX = E.MinX + w; E.Part = "Side"; }
            else { E.MinX += w; E.Part = "Content"; }
            E.PartType = but=="Icon" ? "SideButton" : "Side"+but; return E;
            }
         E.MinX += w; 
         X -= w; 
         }
      else {   
         if(!w) { w = I[but+"Right"]; if(!w) w = I.SideRight; }
         w += row.NoDynHeader ? I.CellBorderRightHeader : I.CellBorderRight;
         if(E.MaxX <= w || !ce&&!ico&&but!="File"){
            if(E.MaxX <= w) { E.MinX = E.MaxX - w; E.Part = "Side"; }
            else { E.MaxX -= w; E.Part = "Content"; }
            E.PartType = but=="Icon" ? "SideButton" : "Side"+but; return E;
            }
         E.MaxX -= w;
         }
      }
   else {
      
      var XX = E.MaxX; 
      if(XX <= C.WidthPad || !ce&&!btnsort&&!ico&&but!="File") {
         if(XX <= C.WidthPad) { 
            if(this.Rtl) E.MaxX = C.WidthPad - X; 
            else E.MinX = E.MaxX - C.WidthPad;
            E.Part = "Side"; 
            if(E.Special && but!="Sort") { E.Special = null; btnsort = null; }
            }
         else {
            E.Part = row.Kind=="Header"?"Caption":"Content";
            if(this.Rtl) E.MinX += C.WidthPad;
            else E.MaxX -= C.WidthPad;
            }
         if(btnsort) E.Special = "Sort"+btnsort;
         E.PartType = !CButtonTypes[but]||but=="Button"||but=="Html"||but=="Img"?"SideButton":"Side"+but; return E;
         }
      if(C.WidthPad) {
         if(this.Rtl) E.MinX += C.WidthPad;
         else E.MaxX -= C.WidthPad;
         }
      }
   }
if(ico && !(Get(row,col+"Visible")<0)){
   var w = null, cico = col+"IconAlign";
   var rot = null; MS.Rotate; rot = row[col+"Rotate"]; if(rot==null) rot = D[col+"Rotate"]; if(rot==null&&this.DynamicStyle) rot = this.GetRotate(row,col); ME.Rotate;
   if(!CButtonTypes[ico]) { w = this.GetAttr(row,col,"IconWidth"); ico = "Icon"; }
   if(ipos==null){
      ipos = row[cico]; if(ipos==null){ ipos = D[cico]; if(C && ipos==null) ipos = C.IconAlign; }
      
      ipos = CAlignTypes[ipos];
      }
   var Side = type=="Button" ? "Button" : "Side";
   if(row[col+"ClsInIcon"]==I.Style+"#"+I.Size){ 
      var cell = this.GetCell(row,col); 
      if(cell) cell = cell.lastChild;
      if(cell) { 
         var x = cell.offsetLeft, y = cell.offsetTop, ww = cell.offsetWidth, hh = cell.offsetHeight;
         if(X<x) { E.MaxX = x-X; ico = null; }
         else if(Y<y) { E.MaxY = y-Y; ico = null; }
         else if(X>x+ww) { E.MinX = x+ww-X; ico = null; }
         else if(Y>y+hh) { E.MinY = y+hh-Y; ico = null; }
         else { E.MinX += x; E.MinY += y; E.MaxX = x+ww-X; E.MaxY = y+hh-Y; }
         
         }
      }
   if(!ico);
   else if(type=="Button" && (this.ShowButtons>=6 || this.ShowButtons==3&&(ipos=="Top"||ipos=="Bottom") || this.GetAttr(row,col,"Button")=="Class") || this.GetAttr(row,col,"Disabled")) ico = null;
   else if(rot){
      MS.Rotate;
      
         if(w==null) { w = I[ico+"Left"]; if(!w) w = I.SideLeft; }
         if(-E.MinY < w || (!ce&&!btnsort&&type!="Button"&&!but)) {
            if(-E.MinY < w) { E.MaxY = E.MinY + w; E.Part = Side; }
            else { E.MinY += w; E.Part = "Content"; }
            if(btnsort) E.Special = "Sort"+btnsort;
            if(E.Special && ico!="Sort") E.Special = null;
            E.PartType = "Side"+ico; return E;
            }
         E.MinY += w; 
         Y -= w; 
         
      ME.Rotate;
      }
   else if(ipos=="Right"){
      if(w==null) { w = I[ico+"Right"]; if(!w) w = I.SideRight; } w += row.NoDynHeader ? I.CellBorderRightHeader : I.CellBorderRight;
      if(E.MaxX <= w || (!ce&&!btnsort&&type!="Button"&&!but)){
         if(E.MaxX <= w) { E.MinX = E.MaxX - w; E.Part = Side; }
         else { E.MaxX -= w; E.Part = "Content"; }
         if(btnsort) E.Special = "Sort"+btnsort;
         if(E.Special && ico!="Sort") E.Special = null;
         E.PartType = "Side"+ico; return E;
         }
      E.MaxX -= w;
      }
   else if(ipos!="Center" || type=="Icon"){
      if(w==null) { w = I[ico+"Left"]; if(!w) w = I.SideLeft; } if(tx==null) w += row.NoDynHeader ? I.CellBorderLeftHeader : I.CellBorderLeft;
      if(-E.MinX < w || (!ce&&!btnsort&&type!="Button"&&!but)) {
         if(-E.MinX < w) { E.MaxX = E.MinX + w; E.Part = Side; }
         else { E.MinX += w; E.Part = "Content"; }
         if(btnsort) E.Special = "Sort"+btnsort;
         if(E.Special && ico!="Sort") E.Special = null;
         E.PartType = "Side"+ico; return E;
         }
      E.MinX += w; 
      X -= w; 
      }
   }
ME.SideButton;

MS.Button;
if(type=="Button"){ 
   if(this.GetAttr(row,col,"Disabled")) return E;
   E.Part = "Button"; E.PartType = "Button"+col;
   if(Get(row,col+"CanDelete")==2){
      var w = I.ButtonClose, yy = row.SpaceWrap ? cell.offsetTop-cell.parentNode.offsetTop : 0;
      if(E.MaxX <= w && Y <= w+yy && Y>=yy){
         E.MinX = E.MaxX - w; E.MaxY = w - Y; E.Special = "Close"; return E;
         }
      else if(E.MaxX <= w) E.MinY += w;
      else E.MaxX -= w;
      }
   var pico = row[col+"PopupIcon"]; if(pico==null) pico = row.Def[col+"PopupIcon"]; if(pico==null) pico = C.PopupIcon;
   if(pico!=3) return E; 
   var w = row[col+"PopupIconWidth"]; if(w==null) w = row.Def[col+"PopupIconWidth"]; if(w==null) w = C.PopupIconWidth; if(!w) w = 20;
   if(E.MaxX <= w) { E.MinX = E.MaxX - w; E.Special = "Popup"; }
   else E.MaxX -= w;
   return E;
   }
ME.Button;

if(ce){
   E.PartType = "Edit"+type;
   
   if(type=="Enum" && ce==2) E.PartType = "Nothing";
  
   MS.Bool;
   if(type=="Bool"){
      if(ce==1){
         var x, align = Get(row,col+"Align"); if(align==null) align = Get(row,"Align"); if(align==null && row.Kind!="Header" && !row.Space) align = this.Cols[col].Align;
         if(align) align = CAlignTypes[align];
         if(align=="Left") x = 0;
         else if(align=="Right") x = E.MaxX - E.MinX - I.Bool;
         else x = Math.floor((E.MaxX - E.MinX - I.Bool)/2);
         if(X>=x && X <= x + I.Bool){
            E.MinX = x - X;
            E.MaxX = x - X + I.Bool;
            E.PartType = "EditBool"; return E; 
            }
         }         
      if(X<x) E.MaxX = x-X;
      else E.MinX = x+I.Bool-X;
      E.PartType = "Nothing";
      return E;
      }
   ME.Bool;
   
   MS.Radio;
   if(type=="Radio") {
      var cell = this.GetCell(row,col), spec = 0;
      if(cell){
         var A = cell.getElementsByTagName("nobr");
         if(!A.length) A = cell.getElementsByTagName("td");
         else if(BIEA&&!BIE8Strict&&(!this.Rtl||!BStrict) || BOpera) spec = 1; 
         if(A.length){
            var par = A[0].parentNode.parentNode.parentNode, x = X-par.offsetLeft, y = Y-par.offsetTop;
            MS.SideButton; if(ico && !ipos) x += w; ME.SideButton;
            for(var i=0;i<A.length;i++){
               var a = A[i]; if(spec) a=a.lastChild;
               if(x>=a.offsetLeft && x<a.offsetLeft+a.offsetWidth && y>=a.offsetTop && y<a.offsetTop+a.offsetHeight && ce==1){
                  E.Special = "Radio"+(i+1);
                  E.MinX = a.offsetLeft - x;
                  E.MaxX = a.offsetLeft + a.offsetWidth - x;
                  E.MinY = a.offsetTop - y;
                  E.MaxY = a.offsetTop + a.offsetHeight - y;
                  return E;
                  }
               }
            }   
         }
      E.PartType = "Nothing";
      E.MinX = -2; E.MaxX = 2; E.MinY = -2; E.MaxY = 2; 
      }
   ME.Radio;
   }

else if(type=="DropCols"){
   MS.Group;
   var cs = this.GetCell(row,col).firstChild.firstChild.rows[0].cells;
   E.PartType = "DropCol";
   var txt = row[col+"Text"]; if(txt==null&&row.Def) txt = row.Def[col+"Text"]; if(txt==null) txt = this.GetText("GroupCustom");
   
   for(var i=1;i<cs.length;i++){
      if(X<cs[i].offsetLeft){
         E.Special = "DropCol"+i; 
         E.MinX = cs[i-1].offsetLeft - X;
         E.MaxX = cs[i].offsetLeft-1-X;
         break;
         }
      }
   if(i==cs.length){ 
      E.Special = "DropCol"+i; 
      if(txt) E.PartType = "DropEmpty";
      E.MinX = cs[i-1].offsetLeft - X;
      }
   ME.Group;
   }

else if(type=="Img" || type=="Link"){
   MS.Img;
   var v = this.GetLink(row,col);
   if(v) { 
      var I = this.GetCell(row,col);
      if(I) {
         I = I.firstChild;
         
         var x = I.offsetLeft, y = I.offsetTop, w = I.offsetWidth, h = I.offsetHeight;
         if(!w){
            I = I.firstChild;
            if(I) { w = I.offsetWidth, h = I.offsetHeight; }
            }
         MS.SideButton; if(x>10 && ico&&ipos!="Right") x = 0; ME.SideButton; 
         if(X>=x && X<=x+w && Y>=y && Y<=y+h){
            E.MinX = x-X; E.MaxX = x+w-X;
            E.MinY = y-Y; E.MaxY = y+h-Y;
            E.PartType = "Link"; 
            return E; 
            }
         if(Y<y) E.MaxY = y-Y;
         else if(Y>y+h) E.MinY = y+h-Y; 
         else if(X<x) E.MaxX = x-X;
         else E.MinX = x+w-X;
         }
      }   
   E.PartType = "Nothing";
   ME.Img;
   }

else if(type=="Gantt"){
   
   }
else if(row.Fixed && C.Type=="Gantt"){
   
   }      
return E;   
}
// -----------------------------------------------------------------------------------------------------------

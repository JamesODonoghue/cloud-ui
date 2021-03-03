// -----------------------------------------------------------------------------------------------------------
// Updates multiline header, if sec is not null, rerenders given section
TGP.UpdateHeader = function(){
var F = this.GetFixedRows();
for(var i=0;i<F.length;i++) if(F[i].Kind=="Header") { this.RefreshRow(F[i]); this.UpdateRowHeight(F[i],1); }
}
// -----------------------------------------------------------------------------------------------------------
MS.ColResize;
// -----------------------------------------------------------------------------------------------------------
TGP.ActionColResize = function(){
var D = Grids.Drag; if(!D || !D.Col || this.Locked["resizecol"]) return false;
var col = D.Col;
var edge = this.Event.Edge; if(!edge) return false; 
var P = this.Pagers[col];
if(edge.indexOf(this.Rtl?"Right":"Left")>=0){
   if(P) {
      for(var i=P.Index-1;i>=0;i--) if(!this.Pagers[i].Left==!P.Left) break;
      if(i<0) D.PagerLeft = 1;
      else { col = this.Pagers[i].Name; D.Col = col; }
      }
   else {
      col = this.GetPrevCol(col); if(!col) return false;
      var sec = this.Cols[col].Sec;
      if(this.Cols[D.Col].Sec != sec && this.ScrollHorzShown[sec]) return false;
      }
   }

var C = this.Cols[col];
if(C && !C.Visible){ 
   col = this.GetLastSpanCol(this.ARow,col,1); if(!col) return false;
   C = this.Cols[col]; if(!C.Visible) return false;
   }
if(P){ if(!P.CanResize) return true; }
else if(!this.ColResizing || !C.CanResize) return true;
D.RCol = col;
if(!P) D.Width = C.RelWidth ? null : C.Width;
this.CloseDialog();

if(P || this.Paging && this.AllPages || this.RowCount>this.SynchroCount || BTablet  ){
   this.SetMouseVLine(D.X,D.Y,P?1:0);
   D.Show = false;
   }

else D.Show = true;

var cell = this.GetCell(this.ARow,col); 
if(cell) {
   cell.className += " "+this.Img.Style+"HeaderResize";
   if(this.Cols[col].WidthPad && cell.colSpan<2) cell.nextSibling.className += " "+this.Img.Style+"HeaderResize";
   }

D.Action = "ColResize";
D.Move = this.MoveColResize;
D.End = this.EndColResize;
D.Cursor = "e-resize";
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.MoveColResize = function(){
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.MoveColResize();
var col = D.RCol, C = this.Cols[col], dx = D.AX - D.X; 
var P = this.Pagers[col];

if(C && C.RelWidth) { C.ZalRelWidth = C.RelWidth; C.RelWidth = null; }
if(D.Show) this.SetWidth(col,this.Scale?Math.round((this.Rtl ? -dx : dx)/this.Scale):(this.Rtl ? -dx : dx));
else if(col && !P && C.AutoWidth) C.AutoWidth = false; 
if(D.Show) D.X += dx;
else D.DX = dx;

if(D.Col && !P && (C.RelWidth || C.AutoWidth)){ 
   this.EndColResize(); 
   if(D.DocCursor!=null && D.Grid && D.Grid.GlobalCursor) document.documentElement.style.cursor = D.DocCursor;
   ClearGridsDrag();
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.EndColResize = function(){
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.EndColResize();
var col = D.RCol, C = this.Cols[col];
var dx = D.Show ? 0 : D.AX - D.X;

MS.Scale; if(this.Scale) dx = Math.round(dx/this.Scale); ME.Scale;
var P = this.Pagers[col]; 
if(P){
   MS.Pager;
   P.Width += D.PagerLeft ? -dx : dx; if(P.Width<=P.MinWidth) P.Width = P.MinWidth;
   if(P.OrigWidth!=null) P.OrigWidth = P.Width;
   this.OverflowSpaces(); 
   
   P.Tag.style.width = P.Width+(BIE?this.Img.PagerAllWidth-this.Img.PagerMWidth:0)+"px";      
   if(BTablet) P.Body.firstChild.firstChild.style.width = (P.Width-this.Img.PagerBodyAllWidth)+"px";
   if(this.ExactWidth) P.TagWidth.style.width = (P.Width+this.Img.PagerAllWidth)+"px";
   this.SaveCfg();
   this.Update();
   if(Grids.OnAfterColResize) Grids.OnAfterColResize(this,col,D.Row,P.Width-D.Width);
   ME.Pager;
   }
else {
   if(this.RowCount < this.SynchroCount){ 
      ClearGridsDrag();
      this.CapResize(col,dx,D.Row,D.Width);
      }
   else {
      var txt = this.GetText("ColWidth");
      if(txt) this.ShowMessage(txt.replace("%d",this.GetCaption(col)));
      var T = this; setTimeout(function(){T.CapResize(col,dx,D.Row,D.Width);},10);  
      }
   Grids.NoClickTo = (new Date).getTime()+100; 
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
// Called for column resize, col - column to resize, dx - how much to resize
TGP.CapResize = function(col,dx,row,ow,noundo){
this.SetWidth(col,dx);
this.SaveCfg();
this.HideMessage();
var C = this.Cols[col];
MS.VarHeight; if(C.VarHeight==1) this.UpdateHeights(1); ME.VarHeight;
MS.Media; this.UpdateMedia("Cols","Width",C.Width,C.Name); ME.Media;
MS.Overlay; if(this.Overlay>=2) this.UpdateOverlays(null,C.Sec); ME.Overlay;

 this.UpdateHeader(); this.UpdateSync(); 
if(Grids.OnAfterColResize) Grids.OnAfterColResize(this,col,row,C.Width-(ow==null?0:ow));
if(this.Undo&8&&!noundo) this.AddUndo({Type:"ResizeCol",Col:col,Row:row,Width:C.Width,OWidth:ow}); 
if(this.Sync["cols"]){
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId && G.Cols[col]&&G.Sync["cols"]){
         dx = this.Cols[col].Width - G.Cols[col].Width;
         if(dx) G.SetWidth(col,dx);
         }
      }
   }
}

// -----------------------------------------------------------------------------------------------------------
TGP.ActionSectionResize = function(){
var D = Grids.Drag; if(!D||this.Locked["resizesection"]) return false;
var edge = this.Event.Edge; if(!edge) return false; 
this.CloseDialog();

if(this.Paging && this.AllPages || this.RowCount>this.SynchroCount/2 || BTablet){
   this.SetMouseVLine(D.X,D.Y,0);
   D.Show = false;
   }
   
else D.Show = true;

D.Action = "SectionResize";
D.Move = this.MoveSectionResize;
D.End = this.EndSectionResize;
D.Cursor = "e-resize";
D.Section = edge == "HScrollLeft" ? 0 : 2;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.MoveSectionResize = function(){
var D = Grids.Drag; if(!D) return false;
var dx = D.AX - D.X; 
if(D.Show) {
   this.SecResize(D.Section,this.Scale?Math.round(dx/this.Scale):dx);
   D.X += dx;
   }
else D.DX = dx;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.EndSectionResize = function(){
var D = Grids.Drag; if(!D) return false;
ClearGridsDrag();
if(!D.Show){
   var dx = D.AX - D.X; 
   this.SecResize(D.Section,this.Scale?Math.round(dx/this.Scale):dx);
   }
if(!this.SectionWidthLap) this.SaveCfg();
for(var i=0;i<3;i++){
   var par = this.ScrollHorzParent[i];
   if(par) { par.firstChild.style.cursor = ""; par.parentNode.style.cursor = ""; } 
   }
if(Grids.OnAfterSectionResize) Grids.OnAfterSectionResize(this,D.Section==2&&this.MidWidth!=null?1:D.Section);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SecResize = function(mainsec,dx,BB,noundo){
var zdx = dx;

var I = this.Img, icb = I.LastBorderRight, B = BB ? BB : this.BodyMain;
var W = [B[0]?B[0].parentNode.offsetWidth + icb:0,B[1]?B[1].parentNode.offsetWidth + icb:0,B[2]?B[2].parentNode.offsetWidth + icb:0];
var O = [this.LeftWidth,this.MidWidth,this.RightWidth];
var T = this; function FindRelWidth(sec){ 
   for(var S=T.ColNames[sec],i=0;i<S.length;i++) if(T.Cols[S[i]].RelWidth&&T.Cols[S[i]].RelWidthType&1) return true;
   return false;
   }
if(mainsec==0){ 
   
   if(dx<0){ 
      dx = -dx; 
      var min = this.MinLeftWidth; if(min==null) min = 50;
      
         var ddx = W[0] - min;
         if(ddx<dx) dx = ddx;
         if(dx<=0) return;
         
      this.LeftWidth = W[0] - dx;
      
         ddx = this.GetBodyScrollWidth(1) - W[1];
         if(ddx>=dx || this.LeftCanResize>=4 && this.RelWidthSec && FindRelWidth(1)) { this.MidWidth = W[1] + dx; dx = 0; }
         else if(ddx) { this.MidWidth = W[1] + ddx; dx -= ddx; }
         
      if(dx && this.LeftCanResize>=3){
         ddx = this.GetBodyScrollWidth(2) - W[2];
         if(ddx>=dx || this.LeftCanResize>=4 && this.RelWidthSec && FindRelWidth(2)) { this.RightWidth = W[2] + dx; dx = 0; }
         else if(ddx) { this.RightWidth = W[2] + ddx; dx -= ddx; }
         }
      if(dx) this.LeftWidth += dx;
      }
   else { 
      if(this.LeftCanResize<4){
         var ddx = this.GetBodyScrollWidth(0) - W[0];
         if(ddx<dx) dx = ddx;
         if(dx<=0) return;
         }
      this.LeftWidth = W[0] + dx;
      
         var min = this.MinMidWidth; if(min==null) min = 50;
         var ddx = W[1] - min;
         if(ddx>=dx) { this.MidWidth = W[1] - dx; dx = 0; }
         else if(ddx) { this.MidWidth = W[1] - ddx; dx -= ddx; }
         
      if(dx && this.LeftCanResize>=3){
         var min = this.MinRightWidth; if(min==null) min = 50;
         var ddx = W[2] - min;
         if(ddx>=dx) { this.RightWidth = W[2] - dx; dx = 0; }
         else if(ddx) { this.RightWidth = W[2] - ddx; dx -= ddx; }
         }
      if(dx) this.LeftWidth -= dx;
      }
   }
else { 
   
   if(dx>0){ 
      var min = this.MinRightWidth; if(min==null) min = 50;
      
         var ddx = W[2] - min;
         if(ddx<dx) dx = ddx;
         if(dx<=0) return;
         
      this.RightWidth = W[2] - dx;
      
         ddx = this.GetBodyScrollWidth(1) - W[1];
         if(ddx>=dx || this.RightCanResize>=4 && this.RelWidthSec && FindRelWidth(1)) { this.MidWidth = W[1] + dx; dx = 0; }
         else if(ddx) { this.MidWidth = W[1] + ddx; dx -= ddx; }
         
      if(dx && this.RightCanResize>=3){
         ddx = this.GetBodyScrollWidth(0) - W[0];
         if(ddx>=dx || this.RightCanResize>=4 && this.RelWidthSec && FindRelWidth(0)) { this.LeftWidth = W[0] + dx; dx = 0; }
         else if(ddx) { this.LeftWidth = W[0] + ddx; dx -= ddx; }
         }
      if(dx) this.RightWidth += dx;
      
      }
   else { 
      dx = -dx; 
      if(this.RightCanResize<4){
         var ddx = this.GetBodyScrollWidth(2) - W[2];
         if(ddx<dx) dx = ddx;
         if(dx<=0) return;
         }
      this.RightWidth = W[2] + dx;
      
         var min = this.MinMidWidth; if(min==null) min = 50;
         var ddx = W[1] - min;
         if(ddx>=dx) { this.MidWidth = W[1] - dx; dx = 0; }
         else { this.MidWidth = W[1] - ddx; dx -= ddx; }
         
      if(dx && this.RightCanResize>=3){
         var min = this.MinLeftWidth; if(min==null) min = 50;
         var ddx = W[0] - min;
         if(ddx>=dx) { this.LeftWidth = W[0] - dx; dx = 0; }
         else { this.LeftWidth = W[0] - ddx; dx -= ddx; }
         }
      if(dx) this.RightWidth -= dx;
      }
   
   } 

this.Update();
if(Grids.OnSectionResize) Grids.OnSectionResize(this,mainsec,dx);
if(this.Undo&8) this.AddUndo({Type:"ResizeSec",Left:this.LeftWidth,Mid:this.MidWidth,Right:this.RightWidth,OLeft:O[0],OMid:O[1],ORight:O[2]}); 
MS.Sync;
if(this.Sync["sec"] && !BB){
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId && G.Sync["sec"]){
         G.SecResize(mainsec,zdx,G.BodyMain,noundo);
         G.SaveCfg();
         }
      }
   }     
ME.Sync;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ResizeSection = function(mainsec,dx,undo){
if(mainsec==2) dx = -dx;
else if(mainsec) return;
this.SecResize(mainsec,dx,null,!undo);
}
// -----------------------------------------------------------------------------------------------------------
ME.ColResize;

MS.ColMove;
// -----------------------------------------------------------------------------------------------------------
MS.Group;
TGP.ActionDropColMove = function(){
var D = Grids.Drag; if(!D || this.Locked["group"]) return false;

if(this.EditMode && (D.Row==this.ERow&&D.Col==this.ECol||this.EndEdit(1)==-1)) return false;
var row = D.Row, col = D.Col, val = row[col]; if(!val) return false;
var pos = this.Event.Special.replace("DropCol","")-1; if(pos<0 || pos>=val.length) return false;
val = (val+"").split(',');
D.GCol = val[pos];
D.Pos = pos;            
var cell = this.GetGroupCell(D.Row,D.Col,pos); if(!cell) return false;
if(BMozilla) cell.innerHTML = cell.innerHTML; 
cell.className += " "+this.Img.Style+"HeaderGroupFocus";
var html = "<div onmousemove='"+this.This+".GridMouseMove(event);' class='"+this.Img.Style+"HeaderDrag "+this.Img.Style+"HeaderText' style='width:"+cell.offsetWidth+"px'>"+cell.innerHTML+"</div>";
var ev = {clientX:D.X,clientY:D.Y};
this.SetMouseObject(cell,ev,3,html);
D.Action = "DropColMove";
D.Move = this.MoveColMove;
D.End = this.EndColMove; 
D.Cursor = this.DragCursor?this.DragCursor:this.Img.DragCursor;
return true;
}
ME.Group;
// -----------------------------------------------------------------------------------------------------------
TGP.ActionColCopy = function(){ return this.ActionColMove(null,null,1); }
TGP.ActionColMoveSelected = function(){ return this.ActionColMove(null,null,0,1); }
TGP.ActionColCopySelected = function(){ return this.ActionColMove(null,null,1,1); }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionColMove = function(dummy,dummy2,copy,sel){
var D = Grids.Drag; if(!D || sel&&!this.SelectingCols) return false;
var col = D.Col, C = this.Cols[col];
if(!col || !this.ARow || col=="Pager") return false;
if((!this.MoveColsFull || !C.CanGroup || sel) && (copy ? !this.ColAdding||!this.ColCopying||this.Locked["addcol"]||!sel&&C.CanCopy==0 : !this.ColMoving||this.Locked["movecol"]||!sel&&C.CanMove==0)) return false;
if(!C.Visible && (!this.ARow.Spanned || this.ARow[D.Col+"Span"]<=1 || !this.GetSpanCol(this.ARow,col,2)) || sel&&!C.Selected) return false;
if(this.EditMode && (D.Row==this.ERow&&D.Col==this.ECol||this.EndEdit(1)==-1)) return false;
var ar = "";
if(!this.MoveColsFull){ 
   this["ZARow"] = this.ARow;
   ar = this.This+".ARow="+this.This+".ZARow;";
   }
var html = "<div onmousemove='"+ar+this.This+".GridMouseMove(event);' class='"+this.Img.Style+"HeaderDrag "+this.Img.Style+"HeaderText' style='width:"+this.GetWidth(this.ARow,D.Col)+"px'>"+this.GetRowHTML(D.Row,null,8,col)+"</div>"; 
if(sel) {
   D.Cols = this.GetSelCols(copy?"CanCopy":"CanMove"); if(!D.Cols.length) return false;
   }
else {
   D.Span = this.ARow.Spanned ? this.ARow[D.Col+"Span"] : 1; D.SpanGroup = 0;
   var block = C.Block==null ? C.Group : C.Block; 
   if(block){
      var c = this.GetPrevCol(col,null,2); if(c && (this.Cols[c].Block==null ? this.Cols[c].Group : this.Cols[c].Block)!=block){
         for(var spn=1,c=this.GetNextCol(col,null,1);c&&(this.Cols[c].Block==null ? this.Cols[c].Group : this.Cols[c].Block)==block;c=this.GetNextCol(c,null,2),spn++);
         if(spn>D.Span) D.Span = spn; 
         if(D.Span>1) D.SpanGroup = 1; 
         }
      }
   }
if((D.Cols||D.Span>1) && (!this.MoveColsFull || !C.CanGroup)){ 
   var Cols = D.Cols; if(!Cols) { Cols = []; for(var i=D.Span,c=D.Col;i>0;i--,c=this.GetNextCol(c)) Cols[Cols.length] = c; }
   var html = CTableCSP0+" onmousemove='"+ar+this.This+".GridMouseMove(event);'"+CTfoot+"<tr>";
   for(var i=0;i<Cols.length;i++){
      var c = Cols[i], w = this.GetWidth(this.ARow,c);
      if(w>0||sel) html += "<td><div class='"+this.Img.Style+"HeaderDrag "+this.Img.Style+"HeaderText' style='width:"+(w>0?w:C.Width)+"px'>"+this.GetRowHTML(this.ARow,null,8,c)+"</div></td>";
      }
   html += "</tr>"+CTableEnd;   
   }

if(C.MainSec==1){ 
   var cnt = D.Cols?D.Cols.length : D.Span;
   for(var c in this.Cols) if(this.Cols[c].Visible) cnt--;
   if(cnt>=0) {
      if(!this.MoveColsFull) return false;
      D.GroupOnly = 1;
      }
   }

var cell = this.GetCell(this.ARow,col); cell.className += " "+this.Img.Style+"HeaderFocus";
if(C.WidthPad && cell.colSpan<2) cell.nextSibling.className += " "+this.Img.Style+"HeaderFocus";
var ev = {clientX:D.X,clientY:D.Y};
this.SetMouseObject(cell,ev,this.MoveColsFull?3:1,html);      
D.Action = "ColMove";
D.Move = this.MoveColMove;
D.End = this.EndColMove;
D.Cursor = this.DragCursor?this.DragCursor:this.Img.DragCursor;
D.Copy = copy;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.MoveColMove = function(){
var D = Grids.Drag; if(!D) return false;
var C = this.Cols, torow = this.ARow, tocol = this.ACol;
   
MS.Group;
if(this.MoveColsFull && !D.Cols){
   var T = this; 
   function GetSG(sg,val,row,drow,dcol){ 
      sg = sg.split(',');
      var cnt = 0, reg = new RegExp("(\,|^)"+ToRegExp(val)+"(\,|$)");
      for(var i=0;i<sg.length;i+=2){
         var rr = sg[i] ? T.GetRowById(sg[i]) : row;
         if(rr && (rr!=drow || sg[i+1]!=dcol)) { 
            var vv = Get(rr,sg[i+1]);
            if(vv && (vv+"").search(reg)>=0) cnt++;
            }
         }
      return cnt;
      }

   if(torow && torow.Space && torow[tocol+"Type"]=="DropCols" && this.Event.Special && !this.Locked["group"]){
      
      var topos = this.Event.Special.replace("DropCol","")-1;
      var val = torow[tocol] ? (torow[tocol]+"").split(",") : null;
      var acc = Get(torow,tocol+"Accept"), col = D.GCol ? D.GCol : D.Col;
      if(acc && (acc+"").search(new RegExp("(^|\\,)"+ToRegExp(col)+"($|\\,)"))<0) topos = -1; 
      if(!acc && !D.GCol && !D.Grid.Cols[col].CanGroup) topos = -1; 
      var mov = Get(D.Row,D.Col+"CanMove"); if(mov==null) mov = 3;
      var cpy = Get(D.Row,D.Col+"CanCopy"); if(cpy) mov |= cpy;
      D.Copy = 0;
      if(torow==D.Row && tocol==D.Col){ 
         if(!(mov&1)) topos = -1; 
         else if(cpy&1) D.Copy = 1;
         }
      else {   
         if(Get(torow,tocol+"CanAdd")==0) topos = -1;  
         if(!(mov&2)) topos = -1; 
         else if(cpy&2) D.Copy = 1;
         if(topos>=0){
            var tomov = Get(torow,tocol+"CanMove"); if(tomov==null) tomov = 3;
            var tocpy = Get(torow,tocol+"CanCopy"); if(tocpy) tomov |= tocpy;
            if(!(tomov&1)) topos = val?val.length:0; 
            }
         }
      
      if(val && topos>=0){
         var cc = Get(torow,tocol+"Duplicates"); 
         
         if(cc==0 && (torow!=D.Row || tocol!=D.Col || D.Copy) || cc==null && !D.GCol && !D.Grid.Cols[col].GroupMore){
            for(var i=0;i<val.length;i++) if(col==val[i]) { topos = -1; break; }  
            }
         if(cc==0 || cc==1 || cc==null && D.GCol){
            if(col==val[topos] || col==val[topos-1]) topos = -1; 
            }
         }
      if(topos==-1 && (Get(D.Row,D.Col+"CanDelete")!=2 || D.Row==torow && tocol==D.Col)) topos = -2; 
      if(topos==-1){
         var sg = Get(D.Row,D.Col+"Single"), sgt = sg ? Get(D.Row,D.Col+"SingleType") : 0;
         if(sgt==null || sgt==2 || sgt==3 && !GetSG(sg,col,D.Row)) topos = -2; 
         }
      if(topos>=0 && (D.Row!=torow || tocol!=D.Col)){
         var sg = Get(torow,tocol+"Single"), sgt = sg ? Get(torow,tocol+"SingleType") : 0;
         if((sgt==null || sgt==2 || sgt==1) && GetSG(sg,col,torow,D.Row,D.Col)) topos = -2; 
         }
      if(Grids.OnDropCols) { var ret = Grids.OnDropCols(this,D.Row,D.Col,col,this,torow,tocol,topos,0); if(ret!=null) topos = ret; }
      if(topos==-2) torow = null; 

      if(topos>=0) this.UpdateMoveCursor(torow,tocol,0,null,topos);
      else this.HideMoveCursor();
      if(D.GCol) { 
         var cell = this.GetGroupCell(D.Row,D.Col,D.Pos); 
         cell.className = cell.className.replace(/Group\w+/,topos!=-1?"GroupFocus":"GroupDelete"); 
         }  
      
      D.ToPos = topos;
      D.ToCol = tocol;
      D.ToRow = torow;
      return true;
      }

   if(D.GCol){
      if(Get(D.Row,D.Col+"CanDelete")!=0){
         var cell = this.GetGroupCell(D.Row,D.Col,D.Pos); 
         D.ToPos = -1;
         var sg = Get(D.Row,D.Col+"Single"), sgt = sg ? Get(D.Row,D.Col+"SingleType") : 0;
         if(sgt==null || sgt==2 || sgt==3 && !GetSG(sg,D.GCol,D.Row)) D.ToPos = -2; 
         cell.className = cell.className.replace(/Group\w+/,D.ToPos==-2?"GroupFocus":"GroupDelete");
         }
      else D.ToPos = -2; 
      if(Grids.OnDropCols) { var ret = Grids.OnDropCols(this,D.Row,D.Col,col,this,D.ToRow,D.ToCol,D.ToPos,0); if(ret!=null) D.ToPos = ret; }
      this.HideMoveCursor();
      if(D.ToPos<0) D.ToRow = null;
      return true;
      }

   if(!torow || torow.Kind!="Header" || D.GroupOnly || (D.Copy ? !this.ColAdding || !this.ColCopying || this.Locked["addcol"] || C[D.Col] && C[D.Col].CanCopy==0 : !this.ColMoving || this.Locked["movecol"] || C[D.Col] && C[D.Col].CanMove==0)){ 
      this.HideMoveCursor(); 
      D.ToRow = null; 
      return true; 
      }
   }
   
ME.Group;         

if(!tocol || !C[tocol] || D.Grid!=this) {
   this.HideMoveCursor(); 
   D.ToRow = null; 
   return true; 
   }

var x = this.Event.X;
if(!torow || torow.Kind!="Header"){
   var ev = {clientX:D.AX,clientY:D.AY};
   var E = this.GetMouseEvent(ev,D.Row); 
   
   tocol = E.Col; x = E.X;
   if(!this.MoveColsFull) torow = D.Row;
   if(!tocol) { this.HideMoveCursor(); D.ToRow = null;  return true; }
   }

if(this.ScrollColOnDrag) this.SetScrollColTo(tocol,x);
      
var mainsec = C[tocol].MainSec, CN = this.ColNames[1], ns = 0, type = 0, w = C[tocol].Width/2;
if(torow && torow.Kind=="Header" && torow.Spanned && torow[tocol+"Span"]>1) { var cell = this.GetCell(torow,tocol); if(cell) w = cell.offsetWidth/2; } 
if(x > w) type = 1;
 

var group = C[D.Col].Block==null ? C[D.Col].Group : C[D.Col].Block, c = type==1 ? this.GetNextCol(tocol,torow) : this.GetPrevCol(tocol,torow);
var groupc = c&&C[c]&&c!=D.Col?(C[c].Block==null?C[c].Group:C[c].Block):0, groupto = C[tocol].Block==null ? C[tocol].Group : C[tocol].Block;
if(mainsec!=C[D.Col].MainSec && ((D.Copy?C[D.Col].CanCopy:C[D.Col].CanMove)!=2 || group && !D.SpanGroup) 
   || c==D.Col&&mainsec==C[D.Col].MainSec&&!D.Copy 
   || D.Cols&&C[tocol].Selected 
   || !C[tocol].CanMove && (mainsec==2&&type||mainsec==0&&!type) 
   || (tocol==D.Col&&!D.Copy || D.SpanGroup && (group == groupto || type==0&&c&&(group == groupc||c==D.Col))) && (C[tocol].CanMove!=2 || mainsec==1&&c || mainsec==2&&(type||c&&C[c].MainSec!=0) || mainsec==0&&(!type||c&&C[c].MainSec!=2))
      
   || group && !D.SpanGroup && (type==0 && groupc!=group || type==1 && groupto!=group) 
   || (!group || D.SpanGroup) && groupc && groupc==groupto 
   || torow.Spanned && torow[D.Col+"Span"]==0 && this.GetSpanCol(torow,D.Col) == (type==0 ? c : tocol) && !D.Copy 
   ) {
   this.HideMoveCursor(); 
   D.ToRow = null;
   return true; 
   }
D.ToType = type;
D.ToCol = tocol;
D.ToRow = torow;
var row = torow && torow.Kind=="Header" ? torow : (this.MoveColsFull ? null : D.Row);
if(row) this.UpdateMoveCursor(row,tocol,type,mainsec!=C[D.Col].MainSec || tocol==D.Col&&!D.Copy || ns);
else this.HideMoveCursor();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.EndColMove = function(){
var D = Grids.Drag; if(!D) return false;
var C = this.Cols;
this.HideMoveCursor();
this.SetDragCursor();
this.ScrollColTo = null;
this["ZARow"] = null;
if(D.ToRow || D.ToPos==-1){
   this.CloseDialog();
   
   if(D.ToPos!=null && (D.ToPos==-1 || D.ToRow.Kind!="Header")) { 
      if(Grids.OnDropCols) { 
         var ret = Grids.OnDropCols(this,D.Row,D.Col,D.GCol,this,D.ToRow,D.ToCol,D.ToPos,1);   
         if(ret!=null) D.ToPos = ret;
         if(D.ToPos==-2) D.GCol = null; 
         }

      MS.Group;
      function SetGroupValue(T,row,col,val){
         if(Grids.OnValueChanged) { var tmp = Grids.OnValueChanged(T,row,col,val,Get(row,col)); if(tmp!=null) val = tmp; }
         if(T.SetValue(row,col,val,1) && Grids.OnAfterValueChanged) Grids.OnAfterValueChanged(T,row,col,Get(row,col));
         
         }

      if(D.GCol && (D.Row!=D.ToRow || D.Col!=D.ToCol)){
                  
         if(!D.Copy){
            var val = D.Row[D.Col];
            val = val?(val+"").split(',') : [];
            var Cols = [], k=0;
            for(var i=0;i<val.length;i++) if(i!=D.Pos) Cols[k++] = val[i];
            SetGroupValue(D.Grid,D.Row,D.Col,Cols.join(','));
            }
      
         if(D.ToRow) {
            val = D.ToRow[D.ToCol];
            val = val?(val+"").split(',') : [];
            Cols = []; k=0;
            for(var i=0;i<val.length;i++){
               if(i==D.ToPos) Cols[k++] = D.GCol;
               Cols[k++] = val[i];
               }
            if(i==D.ToPos) Cols[k++] = D.GCol;   
            SetGroupValue(this,D.ToRow,D.ToCol,Cols.join(','));
            }
         }

      else if(D.ToPos>=0){         
         var val = D.ToRow[D.ToCol];
         val = val?(val+"").split(',') : [];
         var Cols = [], k=0;
         for(var i=0;i<D.ToPos;i++) if(i!=D.Pos||D.Copy) Cols[k++] = val[i];
         Cols[k++] = D.GCol ? D.GCol : D.Col;
         for(var i=D.ToPos;i<val.length;i++) if(i!=D.Pos||D.Copy) Cols[k++] = val[i];
         SetGroupValue(this,D.ToRow,D.ToCol,Cols.join(','));
         }
      ME.Group;   
      }
               
   else {
      var T = this; 
      if(D.ToType==1 && D.ToRow.Kind=="Header" && D.ToRow.Spanned && D.ToRow[D.ToCol+"Span"]>1) {
         var cc = this.GetNextCol(D.ToCol,D.ToRow);
         if(cc && C[cc].MainSec==C[D.ToCol].MainSec) { D.ToCol = cc; D.ToType = 0; }
         else D.ToCol = this.GetLastCol(C[D.ToCol].MainSec);
         }
      var group = C[D.Col].Block==null ? C[D.Col].Group : C[D.Col].Block, groupto = C[D.ToCol].Block==null ? C[D.ToCol].Group : C[D.ToCol].Block;
      if(groupto&&groupto!=group&&D.ToType==0){
         for(var cc=this.GetPrevCol(D.ToCol,D.ToRow,2);cc&&(C[cc].Block==null?C[cc].Group:C[cc].Block)==groupto;cc=this.GetPrevCol(cc,D.ToRow,2)) D.ToCol = cc;
         }
      if(D.Span>1 && !D.Cols) { D.Cols = []; for(var i=D.Span,c=D.Col;i>0;i--,c=this.GetNextCol(c,null,2)) D.Cols[D.Cols.length] = c; }
      if(D.Cols){ 
         var cc = null;
         if(D.Copy) cc = this.AddCols(D.Cols,D.ToCol,D.ToType,null,null,1);
         else {
            MS.Undo; if(this.DynamicSpan||this.Undo&8) this.UndoStart(); ME.Undo;
            MS.FocusRect; 
            var SelCols = {}, FR = this.FRect;
            if(FR && this.SelectingFocus&&this.Selecting&&this.SelectingCells && (!FR[6]||!(this.SelectingFocus&4))) {
               for(var i=0;i<D.Cols.length;i++) if(this.IsFocused(null,D.Cols[i])){
                  if(FR[1]==D.Cols[i]||FR[3]==D.Cols[i]) SelCols = null;
                  if(SelCols) SelCols[D.Cols[i]] = 1;
                  if(FR[7]&&this.SelectingFocus&4) this.SelectCol(D.Cols[i],0);
                  else this.SelectRange(FR[0],D.Cols[i],FR[2],D.Cols[i],0); 
                  }
               }
            ME.FocusRect;
            if(this.ColSpan) { 
               MS.ColSpan; 
               D.Cols.sort(function(a,b){ return a.Sec!=b.Sec ? a.Sec-b.Sec : a.Pos-b.Pos; });
               var CC = {}; for(var i=0;i<D.Cols.length;i++) CC[D.Cols[i]] = [D.Cols[i]];
               for(var i=D.Cols.length-1;i>=0;i--){ var c = D.Cols[i], n = this.GetPrevCol(c,null,2); if(CC[n]&&C[n].MainSec==C[c].MainSec){ CC[n] = CC[n].concat(CC[c]); CC[c] = []; } }
               var lc = null;
               for(var c in CC) if(CC[c].length) {
                  var U = this.Undo ? this.GetUndoSpan() : null; this.DelColSpan(c,CC[c].length,null,null,null,U); if(U) this.AddUndo({Type:"RemoveSpan",Data:U});
                  for(var i=0;i<CC[c].length;i++) { this.MoveCol(CC[c][i],lc?lc:D.ToCol,lc?1:D.ToType,1,1,null,null,1); lc = CC[c][i]; }
                  var U = this.Undo ? this.GetUndoSpan() : null; this.AddColSpan(c,CC[c].length,null,null,null,null,U); if(U) this.AddUndo({Type:"AddSpan",Data:U});
                  }
               ME.ColSpan;
               }
            else for(var i=0;i<D.Cols.length;i++) this.MoveCol(D.Cols[i],i?D.Cols[i-1]:D.ToCol,i?1:D.ToType,1,1,null,null,1);
            
            MS.FocusRect;
            if(!SelCols){ this.ClearSelection(1); if(this.SelectingFocus&4&&FR[7]) this.SelectRange(null,FR[1],null,FR[3],1); else this.SelectRange(FR[0],FR[1],FR[2],FR[3],1); }
            else for(var c in SelCols) if(this.SelectingFocus&4&&FR[7]) this.SelectCol(c,1); else this.SelectRange(FR[0],c,FR[2],c,1);
            ME.FocusRect;
            MS.Undo; if(this.DynamicSpan||this.Undo&8) this.UndoEnd(); ME.Undo;
            }
           
           if(this.RowCount > this.SynchroCount) this.Rerender(); 
         else {
            if(!D.Copy){
               MS.Animate;
               if(T.AnimateCols && !T.SuppressAnimations && (T.Animations["MoveColFrom"] || T.Animations["MoveColTo"] || T.Animations["MoveColsFrom"] || T.Animations["MoveColsTo"])){
                  
                     T.Render();
                     setTimeout(T.AnimCols.bind(T,D.Cols,"MoveColsTo",movefinish,null,1),10); 
                  
                  return;
                  }
               ME.Animate;
               }
            this.Render(); 
            MS.Animate; 
            if(D.Copy) setTimeout(function(){T.AnimCols(D.Cols,"CopyColsFrom"); T.AnimCols(cc,"CopyColsTo"); },10);
            ME.Animate;
            }
           
         movefinish();
           return;
         }
      function move(){   
         var cc = null;
         if(D.Copy) {
            cc = T.AddCols([D.Col],D.ToCol,D.ToType);
            MS.Animate; T.AnimCol(D.Col,"CopyColFrom"); T.AnimCol(cc[0],"CopyColTo"); ME.Animate;
            }
         else {
            MS.Animate; 
            if(T.AnimateCols && !T.SuppressAnimations && (T.Animations["MoveColFrom"] || T.Animations["MoveColTo"])){
               T.AnimCol(D.Col,"MoveColFrom",function(){ 
                  T.MoveCol(D.Col,D.ToCol,D.ToType); 
                  setTimeout(T.AnimCol.bind(T,D.Col,"MoveColTo",movefinish,null,1),10); 
                  }); 
               return;
               }
            ME.Animate;
            T.MoveCol(D.Col,D.ToCol,D.ToType);
            }
         movefinish();
         }
      function movefinish(){
         T.HideMessage();
         T.SaveCfg();
         if(T.CalculateColumns) T.Calculate(1);
         if(Grids.OnColMove) Grids.OnColMove(T,D.Col,cc?cc[0]:null);
         T.GridMouseOver(); 
         }
      if(this.RowCount > this.SynchroCount) {
         var txt = this.GetText("ColMove");
         if(txt) this.ShowMessage(txt.replace("%d",this.GetCaption(D.Col)));
         setTimeout(move,10);         
         }
      else move();   
      }

   if(CZoom!=1){ var H = D.Row; setTimeout(function(){UpdateIEZoom(H.r1);},10); }   
   D.Grid.RefreshCell(D.Row,D.Col);
   }
else {
   D.Grid.RefreshCell(D.Row,D.Col);
   if(D.GCol) D.Grid.UpdateSpaceRelWidth(D.Row);
   }
 
this.Update();
MS.Sync;
if(this.Sync["cols"]){
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId&&G.Sync["cols"]) G.Update();
      }
   }
ME.Sync;
Grids.NoClickTo = (new Date).getTime()+100; 
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateMoveCursor = function(row,col,right,out,pos){
this.SetDragCursor(1);
 
if(!this.CM){
   this.CM = { Top:this.AddTag("DragColInsideTop",1),Bottom:this.AddTag("DragColInsideBottom",1) }  
   }
var E = this.CellToWindow(row,col);
if(row.SpaceWrap){
   var cell = this.GetCell(row,col);
   E.AbsY += cell.offsetTop-cell.parentNode.offsetTop;
   E.Height = cell.offsetHeight;
   }
MS.Group;
if(pos!=null) {
   var cell = this.GetGroupCell(row,col,pos);
   E.AbsX += cell.offsetLeft+(this.Img.DropColsSpace?-this.Img.DropColsSpace/2:cell.lastChild.offsetLeft); 
   
   E.Width = cell.offsetWidth;
   }
ME.Group;   
var top = this.CM.Top, bot = this.CM.Bottom;
top.style.top = (E.AbsY-top.offsetHeight)+"px";
top.style.left = (E.AbsX+(right?E.Width:0)-Math.floor(top.offsetWidth/2))+"px";
top.className = this.Img.Style+(out?"DragColOutsideTop":"DragColInsideTop");
bot.style.top = (E.AbsY+E.Height)+"px";
bot.style.left = top.style.left;
bot.className = this.Img.Style+(out?"DragColOutsideBottom":"DragColInsideBottom");
}
// -----------------------------------------------------------------------------------------------------------
TGP.HideMoveCursor = function(){
this.SetDragCursor(0);
if(!this.CM) return;
this.CM.Top.parentNode.removeChild(this.CM.Top); 
this.CM.Bottom.parentNode.removeChild(this.CM.Bottom);
this.CM = null;
}
// -----------------------------------------------------------------------------------------------------------
MS.Group;
TGP.GetGroupCell = function(row,col,pos){
var cs = this.GetCell(row,col,1).firstChild.firstChild.rows[0].cells;

return cs[pos];
}
ME.Group;
// -----------------------------------------------------------------------------------------------------------
ME.ColMove;

MS.ColMove$GanttRun;
// -----------------------------------------------------------------------------------------------------------
TGP.AddTag = function(cls,noset){
var E = document.createElement("div");
E.className = this.Img.Style + cls;
if(!noset){
   E.style.position = "absolute";
   E.style.width = "0px";
   E.style.height = "0px";
   E.style.overflow = "hidden";
   }
this.AppendTag(E);
return E;
}
ME.ColMove$GanttRun;
// -----------------------------------------------------------------------------------------------------------
MS.ColMove;
// -----------------------------------------------------------------------------------------------------------
TGP.ActionTabCopy = function(){ return this.ActionTabMove(null,null,1); }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionTabMove = function(dummy,dummy2,copy){
var D = Grids.Drag; if(!D) return false;
var row = D.Row, col = D.Col; if(!row.Space||!row.DragTab||this.Locked[row[col+"Sheet"]?"sheet":"tab"]) return false;
if(copy?!Get(row,col+"CanCopy"):Get(row,col+"CanMove")=="0") return false;
if(this.EditMode && (D.Row==this.ERow&&D.Col==this.ECol||this.EndEdit(1)==-1)) return false;
var CC = row.Cells, F = null, L = null, XC = {}; for(var i=0;i<CC.length;i++) XC[CC[i]] = i;
if(row.DragTab==","){ F = -1; L = CC.length; }
else {
   var cc = XC[col];
   var A = row.DragTab.split(",");
   for(var j=0,B=[];j<A.length;j++) B[j] = A[j] ? XC[A[j]] : (j%2 ? CC.length : -1);
   for(var i=0;i<B.length;i+=2) if(B[i]<cc&&B[i+1]>cc){ F = B[i]; L = B[i+1]; break; }
   }
if(F==null) return false;
D.Prev = F; D.Next = L; D.Actual = cc; D.Actual2 = Get(row,CC[cc+1]+"Button")=="TabSep" ? cc+2 : cc+1;
var cell = this.GetCell(row,col);
cell.className += " "+this.Img.Style+"TabFocus";
var html = "<div onmousemove='"+this.This+".GridMouseMove(event);' class='"+this.Img.Style+"TabDrag' style='width:"+cell.offsetWidth+"px;height:"+cell.offsetHeight+"px;'>"+cell.innerHTML+"</div>";
var ev = {clientX:D.X,clientY:D.Y};
this.SetMouseObject(cell,ev,3,html);
D.Action = "TabMove";
D.Move = this.MoveTabMove;
D.End = this.EndTabMove; 
D.Cursor = this.DragCursor?this.DragCursor:this.Img.DragCursor;
D.Copy = copy;
D.CellIndex = XC;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.MoveTabMove = function(){
var D = Grids.Drag; if(!D) return false;
var row = D.Row, col = this.ACol; if(row!=this.ARow||!col) { this.HideMoveCursor(); return false; }
var cc = D.CellIndex[col];
if(cc<=D.Prev||cc>D.Next||cc>=D.Actual&&cc<=D.Actual2&&!D.Copy) { D.Index = null; this.HideMoveCursor(); return false; }
if(Get(row,col+"Button")=="TabSep") col = row.Cells[++cc]; 
this.UpdateMoveCursor(row,col,0);
D.Index = cc;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.EndTabMove = function(){
var D = Grids.Drag; if(!D) return false;
this.HideMoveCursor();
if(D.Index!=null){
   var row = D.Row, CC = row.Cells, act = D.Actual, sact = row[D.Col+"Sheet"], idx = D.Index;
   if(Grids.OnButtonDrop){
      var ret = Grids.OnTabDrop(this,row,D.Col,idx<CC.length?CC[idx]:"",D.Copy);
      if(ret!=null){
         if(ret===true) return false;
         if(ret==="") idx = CC.length;
         else for(var i=0;i<CC.length;i++) if(CC[i]==ret) { idx = i; break; }
         }
      }
   var sidx = row[CC[idx]+"Sheet"];
   
   var s1 = null, s2 = null, tabact = null, tabidx = null;
   if(Get(row,CC[act-1]+"Button")=="TabSep") s1 = Get(row,CC[act-1]+"Style");
   if(Get(row,CC[act+1]+"Button")=="TabSep") s2 = Get(row,CC[act+1]+"Style");
   if(s1=="TabSep" || s1&&s2!="TabSep") tabact = act-1;
   else if(s2) tabact = act+1;
   if(tabact==null) CC.splice(idx,0,CC[act]);
   else if(Get(row,CC[idx]+"Button")!="Tab"&&Get(row,CC[idx-1]+"Button")=="TabSep") { CC.splice(idx-1,0,CC[tabact],CC[act]); tabidx = idx-1; }
   else { CC.splice(idx,0,CC[act],CC[tabact]); tabidx = idx+1; }
   if(D.Copy){
      var co = CC[idx], cc = co.replace(/\d+$/,"");
      for(var i=2;D.CellIndex[cc+i];i++); cc += i;
      CC[idx] = cc;
      for(var n in row) if(n.slice(0,co.length)==co) row[cc+n.slice(co.length)] = row[n];
      if(!Is(row,CC[idx]+"CanDelete")&&Get(row,CC[idx]+"CanCopy")==2) row[CC[idx]+"CanDelete"] = 1;
      if(row[D.Col]==1) row[D.Col] = 0;
      
      if(tabidx!=null) {
         var co = CC[tabidx], cc = co.replace(/\d+$/,"");
         for(var i=2;D.CellIndex[cc+i];i++); cc += i;
         for(var n in row) if(n.slice(0,co.length)==co) row[cc+n.slice(co.length)] = row[n];
         CC[tabidx] = cc;
         }
      }
   else if(tabact==null) CC.splice(act>idx?act+1:act,1);
   else CC.splice((tabact<act?tabact:act)+(act>idx?2:0),2);
   this.RefreshRow(row);
   }
else this.RefreshCell(D.Row,D.Col);
return true;
}
// -----------------------------------------------------------------------------------------------------------
ME.ColMove;

MS.Resize;
// -----------------------------------------------------------------------------------------------------------
TGP.ActionGridResize = function(){
var D = Grids.Drag, I = this.Img; if(!D||this.Locked["resizegrid"]) return false;
if(!this.ResizingMain) return;
this.CloseDialog();

D.Width = this.MainTable.offsetWidth + (BIE?I.TagBPWidth:0);
MS.Scale; if(this.Scale) D.Width *= this.Scale; ME.Scale;
D.ZalWidth = this.MainTag.style.width;
if(!(this.ResizingMain&2)) this.MainTag.style.width = D.Width+"px";
   
D.Height = this.MainTable.offsetHeight + (BIE?I.TagBPHeight:0);
MS.Scale; if(this.Scale) D.Height *= this.Scale; ME.Scale;
D.ZalHeight = this.MainTag.style.height;
if(!(this.ResizingMain&1)) this.MainTag.style.height = D.Height+"px";

D.MinWidth = this.ScrollWidth + I.ScrollVAllWidth + this.LeftSplitterWidth + this.RightSplitterWidth + I.TableAllWidth;
var sn = ["LeftWidth","MidWidth","RightWidth"], ww;
var sb = [I.LeftAllWidth,I.MidAllWidth,I.RightAllWidth,I.PagerAllWidth]; 
for(var i=this.FirstSec;i<this.SecCount;i++){
   if(this["Min"+sn[i]]!=null) ww = this["Min"+sn[i]];
   else if(this[sn[i]]!=null && !(this.ResizingMain&16)) ww = this[sn[i]] + sb[i]; 
   else ww = sb[i]+50;
   if(ww>this.BodyMain[i].parentNode.offsetWidth) ww = this.BodyMain[i].parentNode.offsetWidth;
   D.MinWidth += ww;
   }
MS.Pager; for(var i=0;i<this.Pagers.length;i++) { var P = this.Pagers[i]; if(P.Visible) D.MinWidth += P.Width + I.PagerAllWidth; } ME.Pager;

if(D.MinWidth < this.MinTagWidth) D.MinWidth = this.MinTagWidth;
if(D.MinWidth < this.MinWidth) D.MinWidth = this.MinWidth; 
D.MaxWidth = this.MaxTagWidth;
      
D.MinHeight = D.Height - this.GetBodyHeight() + I.BodyAllHeight + this.RowHeight + this.ScrollHeight + I.ScrollHAllHeight;
var F = this.GetFixedRows();
for(var r=this.XS.firstChild;r;r=r.nextSibling) F[F.length] = r; 
for(var i=0;i<F.length;i++) if(F[i].RelHeight && F[i].r1) D.MinHeight-=F[i].r1.offsetHeight-(F[i].MinHeight?F[i].MinHeight:0); 
if(D.MinHeight < this.MinTagHeight) D.MinHeight = this.MinTagHeight;
if(D.MinHeight < this.MinHeight) D.MinHeight = this.MinHeight; 
D.MaxHeight = this.MaxTagHeight;

MS.Corners; D.Height += I.TopHeight + I.BottomHeight; ME.Corners;
     
this.Rendering = 1;
this.Disabled = 1;

var hide = this.ResizingMain&12;
if(hide!=4){ 
   this.HideResizedGrid(D);
   if(hide>4){
      D.Grids = [];
      for(var i=0;i<Grids.length;i++) {
         var G = Grids[i]; if(G&&G!=this&&(G.MaxHeight||hide>8)){ var DD = {}; G.HideResizedGrid(DD,1); D.Grids[D.Grids.length] = [G,DD]; }
         }
      }
   }
else this.MainTag.className += " "+this.Img.Style+"ResizeBorder";
D.Action = "GridResize";
D.Move = this.MoveGridResize;
D.End = this.EndGridResize;
D.Cursor = this.Rtl ? "ne-resize" : "nw-resize";
return true;   
}
// -----------------------------------------------------------------------------------------------------------
TGP.HideResizedGrid = function(D,next){
var I = this.Img;
if(next) {
   D.Width = this.MainTable.offsetWidth + (BIE?I.TagBPWidth:0);
   D.ZalWidth = this.MainTag.style.width;
   D.Height = this.MainTable.offsetHeight + (BIE?I.TagBPHeight:0);
   D.ZalHeight = this.MainTag.style.height;
   }
D.Hidden = this.MainTag.firstChild;
while(D.Hidden.nodeName.toLowerCase()!="div") D.Hidden = D.Hidden.nextSibling; 
D.ScrollLeft = []; for(var i=this.FirstSec;i<this.SecCount;i++) if(this.ScrollHorz[i]) D.ScrollLeft[i] = this.ScrollHorz[i].scrollLeft;
D.ScrollTop = this.ScrollVert.scrollTop;
if(BTouch) { D.Hidden.style.visibility = "hidden";  }

else this.MainTag.removeChild(D.Hidden);
this.ClearCursors();
var dx = this.MainTag.offsetWidth, dy = this.MainTag.offsetHeight;
this.MainTag.className += " "+this.Img.Style+"ResizeBorder";
dx -= this.MainTag.offsetWidth; dy -= this.MainTag.offsetHeight;
D.WidthDiff = dx; D.HeightDiff = dy;
D.Width += dx; D.Height += dy;
this.MainTag.style.width = D.Width+"px";
this.MainTag.style.height = D.Height+"px";  
}
// -----------------------------------------------------------------------------------------------------------
TGP.ShowResizedGrid = function(D,next){
this.MainTag.innerHTML = ""; 
this.MainTag.className = this.MainTag.className.replace(/\s?\w+ResizeBorder/,"");
this.MainTag.appendChild(D.Hidden); 
if(next) {
   this.MainTag.style.width = D.ZalWidth;
   this.MainTag.style.height = D.ZalHeight;
   }

if(BTouch) D.Hidden.style.visibility = "";
for(var i=this.FirstSec;i<this.SecCount;i++) if(this.ScrollHorz[i]) this.ScrollHorz[i].scrollLeft = D.ScrollLeft[i];
this.ScrollVert.scrollTop = D.ScrollTop;
if(Grids.OnDisplaceRow) for(var r=this.GetFirstVisible();r;r=this.GetNextVisible(r,1)) if(r.r1) Grids.OnDisplaceRow(this,r);
D.Hidden = null; 
}
// -----------------------------------------------------------------------------------------------------------
TGP.MoveGridResize = function(){
var D = Grids.Drag; if(!D) return false;
var G = D.Grid;
if(G.ResizingMain&2){
   var w = D.Width + (G.Rtl ? D.X - D.AX : D.AX - D.X);
   if(w<D.MinWidth){ D.X = D.AX - w + D.MinWidth; w = D.MinWidth; }
   else if(w>D.MaxWidth) { D.X = D.AX - w + D.MaxWidth; w = D.MaxWidth; }
   else D.X = D.AX;
   G.MainTag.style.width = w+"px";
   D.Width = w;
   }
if(G.ResizingMain&1){
   var h = D.Height - D.Y + D.AY;
   if(BIEStrict) G.Refresh();
   if(h<D.MinHeight){ D.Y = D.AY - h + D.MinHeight; h = D.MinHeight; }
   else if(h>D.MaxHeight){ D.Y = D.AY - h + D.MaxHeight; h = D.MaxHeight; }
   else D.Y = D.AY;
   G.MainTag.style.height = h+"px";
   D.Height = h;
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.EndGridResize = function(){
var D = Grids.Drag; if(!D) return false;
var G = D.Grid, I = G.Img;

if(!(G.ResizingMain&2)) G.MainTag.style.width = D.ZalWidth;
else if(D.WidthDiff) G.MainTag.style.width = parseInt(G.MainTag.style.width) - D.WidthDiff;
if(!(G.ResizingMain&1))  G.MainTag.style.height = D.ZalHeight;
else if(D.HeightDiff) G.MainTag.style.height = parseInt(G.MainTag.style.height) - D.HeightDiff;
G.ClearResizeLimitScroll();

if(D.Hidden) {
   G.ShowResizedGrid(D);
   if(D.Grids) for(var i=0;i<D.Grids.length;i++) D.Grids[i][0].ShowResizedGrid(D.Grids[i][1],1);
   }
else G.MainTag.className = G.MainTag.className.replace(/\s?\w+ResizeBorder/,"");
if(G.MaxVScroll && G.ResizingMain&1) G.MaxVScroll = G.MainTag.offsetHeight;
if(G.MaxHScroll && G.ResizingMain&2) G.MaxHScroll = G.MainTag.offsetWidth;
G.TagHeight = G.MainTag.offsetHeight;
G.TagWidth = G.MainTag.offsetWidth;
G.ResizedMain = G.ResizingMain;

var zw = G.NoHScroll||!(G.ResizingMain&1) ? null : G.TagWidth, zh = G.NoHScroll||!(G.ResizingMain&2) ? null : G.TagHeight;

Grids.Resizing = null;
G.Rendering = 0;
G.Disabled = 0;

MS.MaxHeight; UpdateArea(G.MainTag); ME.MaxHeight;
G.SetMediaTag(1);
G.ApplyMedia(); 
G.Update();

 G.Update(); 
var upd = 0;
if(zw&&G.LimitWidth) { G.LimitWidth += G.TagWidth - zw; G.LimitStyleWidth = G.LimitWidth+"px"; upd = 1; }
if(zh&&G.LimitHeight) { G.LimitHeight += G.TagHeight - zh; G.LimitStyleHeight = G.LimitHeight+"px"; upd = 1; }
if(upd) G.Update();
G.SaveCfg();
if(Grids.OnResizeMain) Grids.OnResizeMain(G);
if(G.Undo&8) G.AddUndo({Type:"ResizeMain",Width:G.MainTag.style.width,Height:G.MainTag.style.height,OWidth:D.ZalWidth,OHeight:D.ZalHeight}); 
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ClearResizeLimitScroll = function(){
MS.LimitScroll;
if(!this.LimitScroll) return;
var zw = this.MainTag.style.width, zh = this.MainTag.style.height;
var dir = (!(this.LimitScroll&5)==!(this.ResizingMain&2) ? 1 : 0) + (!(this.LimitScroll&2)==!(this.ResizingMain&1) ? 2 : 0);
if(dir) { this.NoClearLimitScroll = null; this.ClearLimitScroll(dir); }
this.MainTag.style.width = zw; this.MainTag.style.height = zh;
ME.LimitScroll;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionGridResizeDefault = function(dummy,T){
if(!this.ResizingMain||this.Locked["resizegrid"]) return false;
if(T) return this.MainTag.style.width != this.MainTagOrigWidth || this.MainTag.style.height != this.MainTagOrigHeight;
if(this.Undo&8) this.AddUndo({Type:"ResizeMain",Width:this.MainTagOrigWidth,Height:this.MainTagOrigHeight,OWidth:this.MainTag.style.width,OHeight:this.MainTag.style.height}); 

this.ClearResizeLimitScroll();
this.MainTag.style.width = this.MainTagOrigWidth;
this.MainTag.style.height = this.MainTagOrigHeight;
this.ResizedMain = null;

this.SaveCfg();
if(Grids.OnResizeMain) Grids.OnResizeMain(this);
return true;
}
// -----------------------------------------------------------------------------------------------------------
ME.Resize;

MS.RowResize;
// -----------------------------------------------------------------------------------------------------------
TGP.ActionRowResize = function(){
var D = Grids.Drag; if(!D || !D.Row || !this.Resizing || this.Locked["resizerow"]) return false;
var row = D.Row;
var edge = this.Event.Edge; if(!edge) return false; 
if(edge=="HeaderTop") { row = this.GetPrevVisible(row); if(!row) return false; }
var res = Get(row,"CanResize");
if(!res) return true;
D.RRow = row;
this.CloseDialog();

if(!row.Resized) row.OrigHeight = row.Height;

if(row.Space || this.ColPaging || this.ColNames[1].length>this.SynchroCount || BTablet){
   this.SetMouseHLine(D.X,D.Y,0);
   var cell = this.GetCell(row,D.Col);
   D.Class = cell.className;
   cell.className += " "+this.Img.Style+"Resizing"+(row.Space?"Space":"Row");
   D.Show = false;
   }

else D.Show = true;
D.CanResize = res;
D.Height = row.Space ? this.GetCell(row,D.Col).offsetHeight : this.GetRowHeight(row);
D.Action = "RowResize";
D.Move = this.MoveRowResize;
D.End = this.EndRowResize;
D.Cursor = "n-resize";
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.MoveRowResize = function(){
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.MoveRowResize();
var row = D.RRow, dy = D.AY - D.Y; MS.Scale; if(this.Scale) dy = Math.round(dy/this.Scale); ME.Scale;
   
row.Height = D.Height + dy;
if(D.CanResize!=2){
   var max = Get(row,"MaxHeight"); if(row.Height>max) row.Height = max;
   var min = Get(row,"MinHeight"); if(min==null) min = this.RowHeight; if(row.Height<min) row.Height = min;
   }
if(D.Show) this.UpdateRowHeight(row,1);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.EndRowResize = function(){
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.EndRowResize();
var row = D.RRow;
if(!D.Show) this.GetCell(row,D.Col).className = D.Class;
var height = row.Height; row.Height = row.OrigHeight;
this.ResizeRow(row,height);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ResizeRow = function(row,height,noundo){
if(Grids.OnRowResize){
   var hh = Grids.OnRowResize(this,row,height,row.Height); 
   if(hh!=null){ height = hh; if(!hh) return; }
   }

if(!noundo && this.Undo&8 && !Is(row,"NoUpload")) this.AddUndo({ Type:"ResizeRow",Row:row,OHeight:row.Height,Height:height,OrigHeight:row.OrigHeight,Resized:row.Resized}); 

if(!row.Resized) { row.OrigHeight = row.Height; row.Resized = 1; }
row.Height = height;
if(!row.r1) return;
if(row.Space) this.RefreshRow(row);
else {
   if(this.RowIndex) this.RefreshCell(row,this.RowIndex); 
   this.UpdateRowHeight(row,1,0,1);
   }
var h = row.r1.offsetHeight;
if(row.Height<h){
   if(h<this.RowHeight && row.Height>0) row.Height = h; 
   else {
      row.Height = row.OrigHeight; row.Resized = null;
      if(row.Space) this.RefreshRow(row);
      else {
         if(this.RowIndex) this.RefreshCell(row,this.RowIndex); 
         this.UpdateRowHeight(row,1,0,1);
         }
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
ME.RowResize;

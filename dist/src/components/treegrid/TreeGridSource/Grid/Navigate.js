// -----------------------------------------------------------------------------------------------------------
// Functions for key navigation actions
// -----------------------------------------------------------------------------------------------------------
MS.Navigate;
// -----------------------------------------------------------------------------------------------------------
TGP.GetColPos = function(col){
var C = this.Cols[col]; if(!C) return null;
var X = 0, S = this.ColNames[C.Sec], I = this.Img;
MS.ColPaging; if(this.ColPaging && C.MainSec==1) for(var i=1;i<C.Sec;i++) X += this.ColNames[i].Width; ME.ColPaging;
for(var i=0;i<S.length&&S[i]!=col;i++) if(this.Cols[S[i]].Visible) X += this.Cols[S[i]].Width;
if(C.MainSec==0) X += I.LeftAllLeft;
else if(C.MainSec==1) X += this.TmpLeftWidth + I.MidAllLeft;
else if(C.MainSec==2) X += this.TmpLeftWidth + this.TmpMidWidth + I.RightAllLeft;
X += this.GetScrollLeft(C.MainSec);
return X;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetFSpanCol = function(row,nofocus){
var col = this.FSpanCol; if(!col) return null;

if(row.Space){
   MS.Space;
   var wp = this.GetColPos(col),w = 0;
   wp += this.Cols[col].Width/2; 
   if(!row.Cells) return null;
   for(var i=0;i<row.Cells.length;i++) {
      col =  row.Cells[i];
      if(Get(row,col+"Visible")!=0){ 
         var cell = this.GetCell(row,col);
         if(cell) w+=cell.offsetWidth;
         }
      if(w>wp) break;
      }
   ME.Space;   
   }
   
else {
   if(this.Cols[col] && !this.Cols[col].Visible) col = this.GetNextCol(col);
   if(row.Spanned && row[col+"Span"]==0) col = this.GetPrevCol(col,row);
   }

if(!nofocus && this.CanFocus(row,col)!=1){ 
   if(row.RowSpan && row[col+"RowSpan"]==0) return col;
   var c1 = col, c2 = col;
   while(c1||c2){
      if(c1){
         if(this.CanFocus(row,c1)!=1) c1=this.GetPrevCol(c1,row);
         else {col=c1; break; }
         }
      if(c2){
         if(this.CanFocus(row,c2)!=1) c2=this.GetNextCol(c2,row);
         else {col=c2; break; }
         }
      }
   }
return col;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetFSpanCol = function(row,col){
if(!row || !col) return;
if(row.Space==null){ this.FSpanCol = col; return; }
MS.Space;
var cell = this.GetCell(row,col);
if(!cell) return; 
var w = cell.offsetLeft + cell.offsetWidth/2;
this.FSpanCol = this.GetColFromPos(w);
ME.Space;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetFSpanRow = function(){
return this.FSpanRow;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetFSpanRow = function(row){
this.FSpanRow = row;
}
// -----------------------------------------------------------------------------------------------------------
TGP.FromNestedGrid = function(func,shift,em,add){
var G = this.MasterGrid, r = this.XB.firstChild.MasterRow;
if(this.EditMode && this.EndEdit(1)==-1) return false;
if(func==this.GoUpDown && this.FSpanCol){ 
   var x = this.GetColLeft(this.FSpanCol), w = this.Cols[this.FSpanCol].Width;
   if(this.FSpanRow) { var cell = this.GetCell(this.FSpanRow,this.FSpanCol); if(cell && cell.offsetWidth) w = cell.offsetWidth; }
   for(var i=this.Cols[this.FSpanCol].Sec-1;i>=0;i--) x += this.ColNames[i].Width;
   x -= this.GetScrollLeft(this.Cols[this.FSpanCol].Sec);
   x += G.GetColLeft(r.DetailCol);
   for(var i=G.Cols[r.DetailCol].Sec-1;i>=0;i--) x += G.ColNames[i].Width;
   x -= G.GetScrollLeft(G.Cols[r.DetailCol].Sec);
   if(x>=0) G.FSpanCol = G.FindColBetween(G.FSpanCol,x,x+w);
   }
var row = this.FRow, col = this.FCol;
if(!G.Focus(r,r.DetailCol,null,null,2)) return false;
if(!func.apply(G,[shift,em,add])) {
   this.Focus(row,col,null,null,2);
   return false;
   }
if(em) G.StartEdit();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.FindColBetween = function(col,x1,x2){
var c = this.GetColFromPos(x1), c2 = this.GetColFromPos(x2);
while(c && c!=c2){
   if(c==col) return c;
   c = this.GetNextCol(c);
   }
if(c && c==col) return c;
return this.GetColFromPos(Math.round(x1/2+x2/2));
}
// -----------------------------------------------------------------------------------------------------------
TGP.ToNestedGrid = function(r,func,shift,em,add){
if(this.EditMode && this.EndEdit(1)==-1) return false;
var G = r.DetailGrid[0]; 
if(func==this.GoUpDown && this.FSpanCol){ 
   var x = this.GetColLeft(this.FSpanCol) - this.GetColLeft(r.DetailCol), w = this.Cols[this.FSpanCol].Width;
   if(this.FSpanRow) { var cell = this.GetCell(this.FSpanRow,this.FSpanCol); if(cell && cell.offsetWidth) w = cell.offsetWidth; }
   if(x>=0) G.FSpanCol = G.FindColBetween(G.FSpanCol,x,x+w);
   }
if(func==this.GoLeftRight && !G.FRow){
   if(G.FSpanRow) {
      var col = shift ? G.GetLastCol() : G.GetFirstCol();
      
      if(!G.Focus(G.FSpanRow,col,null,null,2)) {
         G.FRow = G.FSpanRow; G.FCol = col;
         G.GoLeftRight(shift,em,add);
         }
      }
   else if(!G.TabLeftRight(shift,em,add)) return false;
   
   }
else if(!(G.FRow ? G.Focus(G.FRow,G.FCol,null,null,2) : func.apply(G,[shift,em,add]))) return false;

if(em) {
   G.StartEdit();
   if(this.TabStop){
      this.TabStop = 0;
      var T = this; setTimeout(function(){T.TabStop = 1;});
      }
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionTabLeft = function(dummy,T){ return this.TabLeftRight(1,0,0,T); }
TGP.ActionTabRight = function(dummy,T){ return this.TabLeftRight(0,0,0,T); }
TGP.ActionTabRightAdd = function(dummy,T){ return this.TabLeftRight(0,0,this.FRow&&!this.FRow.Fixed,T); }
TGP.ActionTabLeftEdit = function(dummy,T){ return this.TabLeftRight(1,1,0,T); }
TGP.ActionTabRightEdit = function(dummy,T){ return this.TabLeftRight(0,10,T); }
TGP.ActionTabRightEditAdd = function(dummy,T){ return this.TabLeftRight(0,1,this.FRow&&!this.FRow.Fixed,T); }
TGP.ActionTabUp = function(dummy,T){ return this.GoUpDown(1,0,0,1,0,T); }
TGP.ActionTabDown = function(dummy,T){ return this.GoUpDown(0,0,0,1,0,T); }
TGP.ActionTabUpEdit = function(dummy,T){ return this.GoUpDown(1,1,0,1,0,T); }
TGP.ActionTabDownEdit = function(dummy,T){ return this.GoUpDown(0,1,0,1,0,T); }

TGP.ActionGoUp = function(dummy,T){ return this.GoUpDown(1,0,0,0,0,T); }
TGP.ActionGoDown = function(dummy,T){ return this.GoUpDown(0,0,0,0,0,T); }
TGP.ActionGoDownAdd = function(dummy,T){ return this.GoUpDown(0,0,this.FRow&&!this.FRow.Fixed,0,0,T); }
TGP.ActionGoUpEdit = function(dummy,T){ return this.GoUpDown(1,1,0,0,0,T); }
TGP.ActionGoDownEdit = function(dummy,T){ return this.GoUpDown(0,1,0,0,0,T); }
TGP.ActionGoDownEditAdd = function(dummy,T){ return this.GoUpDown(0,1,this.FRow&&!this.FRow.Fixed,0,0,T); }
TGP.ActionGoLeft = function(dummy,T){ return this.GoLeftRight(1,0,0,T); }
TGP.ActionGoRight = function(dummy,T){ return this.GoLeftRight(0,0,0,T); }
TGP.ActionGoLeftEdit = function(dummy,T){ return this.GoLeftRight(1,1,0,T); }
TGP.ActionGoRightEdit = function(dummy,T){ return this.GoLeftRight(0,1,0,T); }

TGP.ActionFocusUp = function(dummy,T){ return this.GoUpDown(1,0,0,0,1,T); }
TGP.ActionFocusDown = function(dummy,T){ return this.GoUpDown(0,0,0,0,1,T); }
TGP.ActionFocusLeft = function(dummy,T){ return this.GoLeftRight(1,0,1,T); }
TGP.ActionFocusRight = function(dummy,T){ return this.GoLeftRight(0,0,1,T); }
// -----------------------------------------------------------------------------------------------------------
TGP.TabLeftRight = function(shift,em,add,test){
var col = this.FCol, row = this.FRow, fpagepos = this.FPagePos, frect = this.FRect, A, fc = shift?1:3;
if(!col) col = frect ? frect[fc] : (shift ? this.GetLastCol(null,row) : this.GetFirstCol(null,row));
else if(frect && col==this.GetSpanCol(row,frect[shift?1:3])) col = null;
else col = shift ? this.GetPrevCol(col,row) : this.GetNextCol(col,row);
if(!row){ 
   A = shift ? this.GetPrevShift(null,null,1,col,frect) : this.GetNextShift(null,null,1,col,frect); row = A[0]; fpagepos = A[1]; 
   if(row.Space && !this.FCol) col = shift ? this.GetLastCol(null,row) : this.GetFirstCol(null,row);
   }
if(row.Page && row.firstChild) { var r = this.PagePosToRow(row,this.FPagePos); row = r ? r : row.firstChild; }
while(true){
   if(!col){ 
      if(test) return false;
      MS.RowSpan;   if(this.RowSpan){ var r = this.GetFSpanRow(); if(r) r = this.GetSpanRow(r,col,1); if(r) row = r; }  ME.RowSpan;
      A = shift ? this.GetPrevShift(row,fpagepos,1,col,frect) : this.GetNextShift(row,fpagepos,1,col,frect); row = A[0]; fpagepos = A[1];
      if(row&&row.Page){
         this.ScrollIntoView(row,col,fpagepos);
         this.EndEdit(1); 
         var T = this; setTimeout(function(){ T.TabLeftRight(shift,em,add); },100);
         return true;
         }
      if(add && (!row||row.Fixed) && this.AddRows) row = this.AddRows(0);
      col = frect ? this.GetSpanCol(row,frect[shift?3:1]) : (shift ? this.GetLastCol(null,row) : this.GetFirstCol(null,row));
      this.SetFSpanRow(row);
      if(!row) break;
      if(row.RowSpan&&row[col+"RowSpan"]==0) { 
         var cc = col;
         while(cc&&row[cc+"RowSpan"]==0){
            if(frect && cc==this.GetSpanCol(row,frect[shift?1:3])) cc = null;
            else cc = shift ? this.GetPrevCol(cc,row) : this.GetNextCol(cc,row);
            }
         if(!cc) { col = null; continue; }
         }
      }
   var r = row;
   MS.RowSpan;   if(this.RowSpan){ r = this.GetFSpanRow(); if(r) r = this.GetSpanRow(r,col,1); if(!r) r = row; } ME.RowSpan;
   var cf = this.CanFocus(r,col);
   if(cf==1 && (!em || this.CanEdit(r,col,null,null,cf)&&this.GetType(r,col)!="Bool") && (col!=this.FCol||r!=this.FRow)){
      if(test) return true; 
      if(this.EditMode){
         if(this.Dialog && this.Dialog.KeyDown) this.Dialog.KeyDown(13);   
         if(this.Edit && this.Edit.Suggest) this.Edit.Suggest.KeyDown(13); 
         }   
      MS.Nested; if(r.DetailCol==col && r.DetailGrid) return this.ToNestedGrid(r,this.TabLeftRight,shift,em,add); ME.Nested;
         
      if(!this.Focus(r,col,null,frect,2)) return false; 
         
      this.SetFSpanCol(r,col);
      
      return true;
      }
   
   if(frect && col==this.GetSpanCol(row,frect[shift?1:3])) col = null;
   else col = shift ? this.GetPrevCol(col,row) : this.GetNextCol(col,row);
   }
if(!row){
   MS.Nested; if(this.NestedGrid) return this.FromNestedGrid(this.TabLeftRight,shift,em,add); ME.Nested;
   if(this.TabStop){
      this.Focus();
      Grids.Focused = null;
      var I = GetElem(this.GetItemId("TabStop"+(shift?"Prev":"Next")));
      var F = I.onfocus; I.onfocus = null;
      I.focus();
      setTimeout(function(){ I.onfocus = F; }, 10); 
      }
   else if(Grids.OnTabOutside && Grids.OnTabOutside(this,shift ? -1 : 1)){ 
      this.Focus();
      Grids.Focused = null;
      }
   }
return false;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GoUpDown = function(shift,em,add,tab,foc,test,row,scol){
if(this.EditMode && this.AutoSort || foc&&!this.FocusRect) return false; 
var col = scol ? scol : this.FCol, fpagepos = null, R = this.FRect, rect = tab ? R : null;
var sn = foc&&R ? (shift ? R[0]==this.FRow : R[2]!=this.FRow) ? 2 : 0 : null;
if(!row) {
   row = foc&&R ? R[sn] : this.FRow;
   var A = shift ? this.GetPrevShift(row,this.FPagePos,1,col,rect) : this.GetNextShift(row,this.FPagePos,1,col,rect);
   row = A[0]; fpagepos = A[1];
   }

while(row){
   if(add && row.Fixed) break;
   if(row.Page || em&&!row.r1){
      if(test) return true;
      
      if(em||foc) { this.ScrollIntoView(row,col,fpagepos); return true; }
      if(!row.firstChild) { this.Focus(row,col,fpagepos,null,2); return true; }
      var r = this.PagePosToRow(row,fpagepos);
      row = r ? r : row.firstChild;
      if(this.CanFocus(row,col)){ this.Focus(row,col,null,null,2); return true; }
      }
   col = this.GetFSpanCol(row,row.Space?0:1); if(row.RowSpan && row[col+"RowSpan"]==0) row = this.GetSpanRow(row,col);
   if(rect&&row==(this.RowSpan?this.GetSpanRow(rect[shift?2:0],col):rect[shift?2:0])){
      if(row.Spanned&&row[col+"Span"]>1&&this.FSpanCol) col = this.FSpanCol;
      if(col==this.GetSpanCol(row,rect[shift?1:3])) col = this.GetSpanCol(row,rect[shift?3:1]);
      else col = shift ? this.GetPrevCol(col) : this.GetNextCol(col);
      if(!test) this.SetFSpanCol(row,col);
      if(row.RowSpan) row = this.GetSpanRow(row,col);
      col = this.GetSpanCol(row,col);
      
      }
   var cf = this.CanFocus(row,col);
   if(cf==1 && (!em || this.CanEdit(row,col,null,null,cf)&&this.GetType(row,col)!="Bool") && (row!=this.FRow||col!=this.FCol||foc&&R)){
   
      if(test) return true;
      MS.Nested; if(row.DetailCol==col && row.DetailGrid) return foc ? false : this.ToNestedGrid(row,this.GoUpDown,shift,em,add,tab,foc); ME.Nested;
      if(foc && this.FRow && this.FCol){
         if(!R) R = shift?[row,col,this.FRow,col]:[this.FRow,col,row,col];
         else { R = R.slice(); R[sn] = row; }
         this.Focus(this.FRow,this.FCol,null,R,2);
         this.ScrollIntoView(row);
         }
      else this.Focus(row,col,null,rect,2);
      this.SetFSpanRow(row);
      return true; 
      }
   A = shift ? this.GetPrevShift(row,fpagepos,1,col,rect) : this.GetNextShift(row,fpagepos,1,col,rect); row = A[0]; fpagepos = A[1];
   }
if(add) return this.ActionAddRowEnd(null,test);
if(test) return false;
if(tab) return this.TabLeftRight(shift,em,add,test);
   
MS.Nested; if(this.NestedGrid) return this.FromNestedGrid(this.GoUpDown,shift,em,add,tab,foc); ME.Nested;
return false;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GoLeftRight = function(shift,em,foc,test){
var row = this.FRow, col = this.FCol;
if(!row || foc&&!this.FocusRect) return false;
if(row.Page && row.firstChild) { var r = this.PagePosToRow(row,this.FPagePos); row = r ? r : row.firstChild; }
var sh = shift, R = this.FRect, sn;

if(foc&&R) { sn = (sh ? R[1]==this.FCol : R[3]!=this.FCol) ? 3 : 1; col = R[sn]; }
if(!col) col = this.GetFirstCol(null,row);
else col = sh ? this.GetPrevCol(col,row) : this.GetNextCol(col,row);

while(col && (this.Cols[col] || row.Space!=null)){
   var r = row;
   MS.RowSpan;
   if(this.RowSpan) { r = this.GetSpanRow(this.GetFSpanRow(),col,1); if(!r) r = row; }
   ME.RowSpan;
   var cf = this.CanFocus(r,col);
   if(cf==1 && (!em || this.CanEdit(r,col,null,null,cf)&&this.GetType(r,col)!="Bool")){
   
      if(test) return true;
      MS.Nested; if(r.DetailCol==col && r.DetailGrid) return foc ? false : this.ToNestedGrid(r,this.GoLeftRight,shift,em); ME.Nested;
      if(foc && this.FRow && this.FCol){
         if(!R) R = sh?[r,col,r,this.FCol]:[r,this.FCol,r,col];
         else { R = R.slice(); R[sn] = col; }
         this.Focus(this.FRow,this.FCol,null,R,2);
         this.ScrollIntoView(this.FRow,col);
         }
      else this.Focus(r,col,null,null,2);
      this.SetFSpanCol(r,col);
      return true;
      }
   col = sh ? this.GetPrevCol(col,row) : this.GetNextCol(col,row);
   }
if(test) return false;
MS.Nested; if(this.NestedGrid) return this.FromNestedGrid(this.GoLeftRight,shift,em); ME.Nested;
return false;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionGoFirst = function(dummy,T){
MS.Paging;
if(this.AllPages && this.XB.firstChild.State<2 && !T){
   
   this.Focus(this.XB.firstChild,this.FCol,0,null,2);
   return true;
   }
ME.Paging;   

var r = this.GetFirstVisible(this.AllPages ? null : GetNode(this.XB,this.FPage),1);
while(r){ 
   var col = this.GetFSpanCol(r);
   if(this.CanFocus(r,col)==1){
      if(T) return true;
      this.SetFSpanRow(r);
      this.Focus(r,col,null,null,2); 
      return true;
      }
   r = this.GetNextVisible(r);   
   }
return false;   
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionGoLast = function(dummy,T){
MS.Paging;
if(this.AllPages && this.XB.lastChild.State<2 && !T){
   var r = this.XB.lastChild;
   if(r.NoPage && this.PageLengthDiv>1){ 
      this.CreatePage(r);
      this.Update();
      }
   this.Focus(r,this.FCol,r.Count-1,null,2);
   return true;
   }
ME.Paging;

var r = this.GetLastVisible(this.AllPages ? null : GetNode(this.XB,this.FPage),1);
while(r){ 
   if(this.CanFocus(r,col)==1){
      if(T) return true;
      var col = this.GetFSpanCol(r);
      this.Focus(r,col,null,null,2); 
      this.SetFSpanRow(r);
      return true;
      }
   r = this.GetPrevVisible(r);      
   }
return false;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionPageUp = function(dummy,T,full){
MS.Paging;
if(!this.AllPages && this.GoToPrevPage) {
   if(this.GoToPrevPage(T)) return true;
   if(full||T) return false;
   }
ME.Paging;
var r = this.FRow, lp = this.FPagePos;
var cnt = Math.floor(this.GetBodyHeight()/this.RowHeight);
if(r){ var A = this.GetPrevShift(r,lp,cnt); r = A[0]; lp = A[1]; }
if(!r || r.Fixed) {
   if(full) return false;
   r = this.GetFirstVisible(null,1);
   if(r==this.FRow) return false;
   }
while(r){ 
   var col = this.GetFSpanCol(r);
   if(this.CanFocus(r,col)==1){
      if(T) return true;
      this.Focus(r,col,lp,null,2); 
      this.SetFSpanRow(r);
      return true;
      }
   r = this.GetNextVisible(r);   
   }
return false;   
}
TGP.ActionPageUpFull = function(F,T){ return this.ActionPageUp(F,T,1); }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionPageDown = function(dummy,T,full){
MS.Paging;
if(!this.AllPages && this.GoToNextPage) {
   if(this.GoToNextPage(T)) return true;
   if(full||T) return false;
   }
ME.Paging;
var r = this.FRow, lp = this.FPagePos;
var cnt = Math.floor(this.GetBodyHeight()/this.RowHeight);
if(r){ var A = this.GetNextShift(r,lp,cnt); r = A[0]; lp = A[1]; }
if(!r || r.Fixed)   {
   if(full) return false;
   r = this.GetLastVisible(null,1);
   if(r==this.FRow) return false;
   }
while(r){ 
   var col = this.GetFSpanCol(r);
   if(this.CanFocus(r,col)==1){
      if(T) return true;
      this.Focus(r,col,lp,null,2); 
      this.SetFSpanRow(r);
      return true;
      }
   r = this.GetPrevVisible(r);   
   }
return false;
}
TGP.ActionPageDownFull = function(F,T){ return this.ActionPageDown(F,T,1); }
// -----------------------------------------------------------------------------------------------------------
// Called if by pressing tab key the grid got focus
// returns  true if grid got focus
// tests event to tab key
TGP.TabInside = function(event,move){
if(TGGetKey(event)==9){
   if(move>0 && !event.shiftKey){
      if(this.FRow) this.Focus();
      this.GridKeyDown(event);
      return true;
      }
   else if(move<0 && event.shiftKey){
      if(this.FRow) this.Focus();
      this.GridKeyDown(event);
      return true;
      }
   }
return false;
}
// -----------------------------------------------------------------------------------------------------------
ME.Navigate;

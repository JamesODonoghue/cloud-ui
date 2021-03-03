// -----------------------------------------------------------------------------------------------------------
// Focuses given row, ends previous editing and saves changes
// Returns true when position changes
// If row's type is Page, uses pagepos as row's position on the page
// For show = true expands all parents to display the row
TGP.Focus = function(row,col,pagepos,rect,type,test,top,left,fid){ 
var fr = this.FRow, fc = this.FCol, fpagepos = this.FPagePos, frect = this.FRect;
if(rect=="0"||rect===false) rect = null; else if(rect-0) { type = type ? type|1 : 1; rect = null; } 

if(!row || row.Fixed&&!row.r1&&!this.Loading || !col&&!this.FCol&&this.FocusRect&4){
   if(test) return this.FRow?1:0;
   if(this.EditMode&&this.FRow==this.ERow&&this.FCol==this.ECol&&this.EndEdit(1)==-1) return null;
   this.FRow = null; this.FCol = null; this.FPagePos = null;
   MS.FocusRect;
   if(frect){
      for(var r=frect[0];r&&r!=frect[2];r=this.GetNextVisible(r,4)) r.Focused = 0;
      if(r) r.Focused = 0;
      for(var c=frect[1];c&&c!=frect[3];c=this.GetNextCol(c)) this.Cols[c].Focused = 0;
      if(c) this.Cols[c].Focused = 0;
      }
   ME.FocusRect;
   this.FRect = null;
   if(this.SelectingFocus&&this.Selecting&&this.SelectingCells&&!(type&32)&&!this.Locked["select"]) this.ClearSelection(this.SelectingFocus&4?7:1);
   this.CloseDialog();
   this.UpdateCursors(1);
   MS.Touch; if(this.TouchClearFocused) this.TouchClearFocusedTime = null; ME.Touch;
   var T = this; setTimeout(function(){T.UpdateCursors();},10); 
   if(Grids.OnBlur) Grids.OnBlur(this,fr,fc,frect);
   if(this.ExternalEdit){
      var r = this.ExternalEdit[0], c = this.ExternalEdit[1];
      if(this.EditMode&&this.ERow==r&&this.ECol==c) this.EndEdit(1);
      r[c] = ""; r[c+"CanEdit"] = 2; 
      this.RefreshCell(r,c);
      }
   if(this.ExternalFocus){
      var r = this.ExternalFocus[0], c = this.ExternalFocus[1];
      if(this.EditMode&&this.ERow==r&&this.ECol==c) this.EndEdit(0);
      r[c] = ""; 
      this.RefreshCell(r,c);
      }
   if(this.EventObject) this.EventObject = { Type:this.EventObject.Type };
   if(this.DynamicStyle||this.DynamicFormat||this.DynamicSpan||this.DynamicBorder) this.CalculateSpaces(1);
   return true;
   }
   
if(!test && !this.SetGridFocused()) return null; 

MS.Paging;
if(!row.Page && pagepos!=null) pagepos = null;
else if(row.Page&&pagepos==null) pagepos = 0;
var rp = this.Paging ? this.GetRowPage(row) : null;
if(this.Paging && rp &&  rp.State!=4){ 
   if(!test){
      if(type&1 && !(rp.State<2) && this.AllPages) {    
         if(rp.NoPage) { this.CreatePage(rp); this.Update(); }
         this.RenderPage(rp); 
         }
      else if(!this.AllPages) {
         if(this.Rendering || this.Loading) this.FPage = this.GetPageNum(rp);
         else this.GoToPage(rp);
         }
      }
   if(row!=rp&&rp.State<2) {
      pagepos = this.GetPagePos(row);
      row = rp;
      }
   
   }
ME.Paging;

MS.Paging;
if(pagepos!=null && row.State==4){
   var r = this.PagePosToRow(row,pagepos);
   row = r ? r : this.GetLastVisible(row,1); pagepos = null;
   }
if(rect){
   if(rect[4]!=null && rect[0].State==4){
      var r = this.PagePosToRow(rect[0],rect[4]);
      rect[0] = r ? r : this.GetLastVisible(rect[0],1); rect[4] = null;
      }
   if(rect[5]!=null && rect[2].State==4){
      var r = this.PagePosToRow(rect[2],rect[5]);
      rect[2] = r ? r : this.GetLastVisible(rect[2],1); rect[5] = null;
      }
   if(!(type&16)){
      var r2 = rect[2], c2 = rect[3];
      if(!rect[7]&&r2.Spanned && r2[c2+"Span"]>1) rect[3] = this.GetLastSpanCol(r2,c2);
      if(!rect[6]&&this.Cols[c2].Spanned && r2[c2+"RowSpan"]>1) rect[2] = this.GetLastSpanRow(r2,c2);
      if(!rect[7]) {
         for(var chg=1,i=0;chg&&i<10;i++) for(var r=rect[0],nr=this.GetNext(rect[2],4),chg=0;r&&r!=nr;r=this.GetNext(r,4)) if(r.Spanned){
            if(!r[rect[1]+"Span"]) { var c = this.GetSpanCol(r,rect[1],1); if(c!=rect[1]) { rect[1] = c; chg = 1; } }
            if(!r[rect[3]+"Span"] || r[rect[3]+"Span"]>1) { var c = this.GetLastSpanCol(r,rect[3],1); if(c!=rect[3]) { rect[3] = c; chg = 1; } }
            }
         if(r!=nr&&rect[0].Fixed==rect[2].Fixed) return this.Focus(row,col,pagepos,[rect[2],rect[1],rect[0],rect[3],rect[5],rect[4]],type,test); 
         }
      if(!rect[6]&&this.RowSpan) {
         for(var chg=1,i=0;chg&&i<10;i++) for(var c=rect[1],nc=this.GetNextCol(rect[3]),chg=0;c&&c!=nc;c=this.GetNextCol(c)) if(this.Cols[c].Spanned){
            if(rect[0][c+"RowSpan"]==0 || rect[0].Level&&rect[0][(rect[0][c+"Span"]==0?this.GetSpanCol(rect[0],c):c)+"Visible"]==-2) { var r = this.GetSpanRow(rect[0],c,1); if(r!=rect[0]) { rect[0] = r; chg = 1; } }
            if(rect[2][c+"RowSpan"]==0 || rect[2][c+"RowSpan"]>1 || rect[2].Level&&rect[2][(rect[2][c+"Span"]==0?this.GetSpanCol(rect[2],c):c)+"Visible"]==-2) { var r = this.GetLastSpanRow(rect[2],c,1); if(r!=rect[2]) { rect[2] = r; chg = 1; } }
            }
         if(c!=nc) return this.Focus(row,col,pagepos,[rect[0],rect[3],rect[2],rect[1],rect[4],rect[5]],type,test); 
         }
      }
   }
ME.Paging;

if(fr==row && fc==col && (pagepos==null || pagepos==this.FPagePos)){
   if(!rect&&!frect) return false;
   MS.FocusRect; if(rect&&frect){ for(var i=0;i<6&&rect[i]==frect[i];i++); if(i==6) return false; } ME.FocusRect;
   }      

if(col && !this.Cols[col] && !row.Space) col = this.GetFSpanCol(row);

if(row.Space && (!col||rect)) return null; 
var cf = this.CanFocus(row,col); if(!cf && pagepos==null) return null;
if(rect){
   var cf1 = this.CanFocus(rect[0],rect[1]); 
   var cf2 = this.CanFocus(rect[2],rect[3]);
   if(!cf1 && rect[4]==null || !cf2 && rect[5]==null){ 
      var cf3 = this.CanFocus(rect[0],rect[3]); 
      var cf4 = this.CanFocus(rect[2],rect[1]);
      if(!cf3 && rect[4]==null || !cf4 && rect[5]==null) return null;
      }
   }
if(test) return true;

MS.Edit;
if(this.EditMode) {
   if(this.FRow==this.ERow&&this.FCol==this.ECol&&this.EndEdit(1)==-1) return null;
   if(!row.parentNode) return null; 
   MS.Master;
   if(this.Detail && row.id && !row.Fixed){ 
      row = this.GetRowById(row.id);
      if(!row) return null;
      }
   ME.Master;   
   }
ME.Edit;   

if(this.ShowFocused&2 && this.FRow && !this.FRow.Fixed && row.Fixed) { this.FocusedVar = this.FRow.id; this.FocusedVarCol = this.FCol; this.FocusedVarTop = this.GetRowTop(this.FRow); }
this.FRow = row;
this.FPagePos = pagepos;
if(col && cf) this.FCol = col;
else if(this.FCol && (!this.GetCell(row,this.FCol) || !this.CanFocus(row,this.FCol))) { this.FCol = null; col = null; }
else col = this.FCol;
MS.FocusRect;
if(rect) {
   rect = [
      rect[0], cf1||cf3 ? rect[1] : frect&&frect[1]&&this.CanFocus(rect[0],frect[1])&&this.GetCell(rect[0],frect[1])?frect[1]:null,
      rect[2], cf1||cf3 ? rect[3] : frect&&frect[3]&&this.CanFocus(rect[2],frect[3])&&this.GetCell(rect[2],frect[3])?frect[3]:null,
      rect[4], rect[5], rect[6], rect[7]
      ];
   if(rect[0]==rect[2]&&rect[1]==rect[3]&&!rect[4]&&!rect[5]) rect = null;
   }
this.FRect = rect;
if(frect){
   for(var r=frect[0];r&&r!=frect[2];r=this.GetNext(r,4)) r.Focused = 0; 
   if(r) r.Focused = 0;
   for(var c=frect[1];c&&c!=frect[3];c=this.GetNextCol(c,null,2)) this.Cols[c].Focused = 0; 
   if(c) this.Cols[c].Focused = 0;
   }
if(rect){
   for(var r=rect[0];r&&r!=rect[2];r=this.GetNextVisible(r,4)) r.Focused = 1;
   if(r) r.Focused = 1;
   for(var c=rect[1];c&&c!=rect[3];c=this.GetNextCol(c)) this.Cols[c].Focused = 1;
   if(c) this.Cols[c].Focused = 1;
   }
ME.FocusRect;
if(!(type&2)){
   this.SetFSpanCol(row,col);
   this.SetFSpanRow(row);
   }
if(!this.BodyMain || row.Removed) return null; 

if(type&1 && !row.Page && !row.Fixed){
   if(this.ShowRow) this.ShowRow(row);
   MS.Tree;
   for(var par=row.parentNode;par&&!par.Page;par=par.parentNode) if(!par.Expanded) this.Expand(par);
   MS.ChildParts;
   if(!row.r1 && (this.ChildParts||this.Paging||this.ChildPaging) || this.Disabled){
      var T = this, max = 50;
      function wait(){ 
         if(T.Cleared) return;
         if(max--<0) { 
            info("Error focus");
            return; 
            }
         if(T.Disabled) { setTimeout(wait,200); return; } 
         if(row.r1){ 
            if(top!=null||left!=null) T.ScrollToCell(row,col,top,left);
            if(!(type&8)) T.ScrollIntoView(row,col,pagepos); 
            if(fid) T.Focus(T.GetRowById(fid),col,null,null,type);
            return; 
            }
         if(T.ChildParts) {
            var par = row, r = row;
            while(!par.r1){ r = par; par = par.parentNode; }
            for(var cnt=0;r;r=r.previousSibling) cnt++;
            T.RenderChildPart(par,cnt<T.ChildPartMin?0:Math.floor((cnt-T.ChildPartMin)/T.ChildPartLength)+1);
            }
         setTimeout(wait,100); 
         }
      setTimeout(wait,100);
      }
   ME.ChildParts;
   ME.Tree;
   }
if(type&1 && !row.Space && this.Cols[col] && !this.Cols[col].Visible) this.ShowCol(col); 

if(top!=null||left!=null) this.ScrollToCell(row,col,top,left);
if(!(type&8)) {
   if(rect) this.ScrollIntoView(rect[7]?row:rect[2],rect[6]?col:rect[3],rect[5]);
   this.ScrollIntoView(row,col,pagepos);
   }
if(fid) return this.Focus(this.GetRowById(fid),col,null,null,type);
if(this.SelectingFocus&&!(type&32)) this.SelectFocus(fr,fc,frect,!(type&4));
if(fr!=row || fc!=col){
   this.UpdatePagerPos();
   if(this.Dialog) this.CloseDialog(); 
   var ret = this.RunAction("Focus","","",row,col);
   MS.Master;
   if((this.DetailOn&7)==1) this.ActionShowDetail(1);
   ME.Master;
   if(this.EventObject) this.EventObject = { Type:this.EventObject.Type };
   if(this.DynamicStyle||this.DynamicFormat||this.DynamicSpan||this.DynamicBorder) this.CalculateSpaces(1);
   }
if(this.Undo&4 && !(type&4) && !this.MasterGrid) { 
   var OU = this.GetUndo();
   if(OU){ 
      for(var i=1,U=OU[OU.Pos-i];U&&U.Type=="End";U=OU[OU.Pos-++i]);
      if(U && U.Type=="Focus"){ U.Row = row; U.Col = col; U.Pos = pagepos; U.Rect = rect; } 
      else this.AddUndo({ Type:"Focus",Row:row,Col:col,Pos:pagepos,ORow:fr,OCol:fc,OPos:fpagepos,Rect:rect,ORect:frect}); 
      }
   }
if(Grids.OnFocus) Grids.OnFocus(this,row,col,fr,fc,pagepos,rect,frect);
if(!frect!=!rect) {
   var flg = this.GetFlags(row,col,"FocusCell",CCursors);
   if(flg["class"] && (!BEdge || !this.Touched || !Grids.Drag)) this.RefreshCell(row,col,1); 
   else if(flg["color"]) this.ColorCell(row,col);
   
   }
this.UpdateCursors(1);
this.Refresh();
MS.Touch; if(this.TouchClearFocused) this.TouchClearFocusedTime = new Date()-0; ME.Touch;

MS.Animate; this.AnimCell(row,col,"Focus",null,null,null,1); ME.Animate;

if(this.ExternalEdit){
   if(this.EditMode&&this.ERow.ExternalEdit==this.ECol) this.MoveExternalEdit(row,col,fr,fc);
   if(row.ExternalEdit!=col&&row.Kind=="Data"){
      var r = this.ExternalEdit[0], c = this.ExternalEdit[1];
      r[c] = this.GetStringEdit(row,col); r[c+"CanEdit"] = 1;
      this.RefreshCell(r,c);
      }
   }
this.RefreshExternalFocus();

return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.RefreshExternalFocus = function(){ 
if(!this.ExternalFocus) return;
var r = this.ExternalFocus[0], c = this.ExternalFocus[1], F = this.FRect, txt = this.GetText("ExternalFocus"+(F?"Rect":""));
var row = this.FRow, col = this.FCol; if(row&&row.Space) row = null;
if(!txt||(!row&&!col)) txt = "";
else { 
   txt = txt.replace("%1",this.GetCellName(row,col)); 
   if(F) txt = txt.replace("%2",this.GetCellName(F[7]?null:F[0],F[6]?null:F[1])).replace("%3",this.GetCellName(F[7]?null:F[2],F[6]?null:F[3])); 
   }
r[c] = txt;
this.RefreshCell(r,c);
}
// -----------------------------------------------------------------------------------------------------------
TGP.IsFocused = function(row,col){ 
if(!row&&!col||row&&!this.FRow||col&&!this.FCol) return false;
if((!row||this.FRow==row)&&(!col||this.FCol==col)) return true;
if(!this.FRect) return false;
MS.FocusRect;
if(row){
   var R = this.GetFocusedRows();
   for(var i=0;i<R.length;i++) if(R[i]==row) break;
   if(i==R.length) return false;
   }
if(col){
   var C = this.GetFocusedCols();
   for(var i=0;i<C.length;i++) if(C[i]==col) break;
   if(i==C.length) return false;
   }
return true;
ME.FocusRect;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetGridFocused = function(always){ 
this.LastFocus = Grids.Focused?[Grids.Focused,Grids.Focused.FRow?Grids.Focused.FRow.id:null,Grids.Focused.FCol,Grids.Focused.FPage,Grids.Focused.FRect?Grids.Focused.FRect.slice():null]:null; 
return SetObjectFocused(this,always); 
}
// -----------------------------------------------------------------------------------------------------------
TGP.FocusRows = function(r1,r2,add){ 
var R = null, fc = this.AddFocusCol?this.AddFocusCol:this.FCol?this.FCol:this.AddFocusColEmpty;
MS.FocusRect;
if(r1!=r2&&fc) {
   R = [r1,this.FRect?this.FRect[1]:fc,r2,this.FRect?this.FRect[3]:fc];
   if(!add && this.FRect && this.FRow && this.FRow!=this.FRect[0]) for(var rr=this.FRect[0];rr&&rr!=this.FRow&&r1!=r2;rr=this.GetNextSiblingVisible(rr,4)) r1 = this.GetNextSiblingVisible(r1,4);
   }
else if(this.FRect && this.FRect[1]!=this.FRect[3]) R = [r1,this.FRect[1],r2,this.FRect[3]];
ME.FocusRect;
this.Focus(r1,fc,null,R,2);
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionFocusEdit = function(dummy,T,mode){ 
var row = this.ARow, col = this.ACol;
if(!row || !col || row.Page) return false;
if(row == this.FRow && col==this.FCol){
   if(this.EditMode || !this.CanEdit(row,col)) return false;
   return this.StartEdit(null,null,null,T);
   }
if(!this.Focus(row,col,null,null,null,T)) return !T && this.EditMode ? true : false;
if((mode!=null ? mode : this.InEditMode) == 1){
   if(this.EditMode&&!T || !this.CanEdit(row,col)) return false;
   if(T) return this.StartEdit(row,col,null,T);
   this.StartEdit();
   }
return true;   
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionFocusAndEdit = function(dummy,T){ return this.ActionFocusEdit(dummy,T,1); } 
// -----------------------------------------------------------------------------------------------------------  
TGP.ActionFocus = function(dummy,T){ var ret = this.Focus(this.ARow,this.ACol,null,null,null,T); return T ? !!ret : ret!=null; }
TGP.ActionChangeFocus = function(dummy,T){ var ret = this.Focus(this.ARow,this.ACol,null,null,null,T); return T ? !!ret : ret == true; }
TGP.ActionChangeFocusRow = function(dummy,T){ var ret = this.Focus(this.ARow,null,null,null,null,T); return T ? !!ret : ret!=null; }
TGP.ActionChangeFocusCol = function(dummy,T){ 
if(!this.ARow||this.ARow.Space||!this.FRow||this.FRow.Space) return false;
var ret = this.Focus(this.FRow,this.ACol,null,null,null,T); return T ? !!ret : ret!=null;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionBlur = function(dummy,T){ 
if(this!=Grids.Focused) return false;
if(this.StaticCursor) return T ? false : (this.EditMode ? this.EndEdit(1)!=-1 : true);
if(!this.MainTag.firstChild) return false; 
if(!this.Focus(null,null,null,null,null,T)) return false;
if(!T) Grids.Focused = null;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionBlurFocused = function(F,T){ return this.IsFocused(this.ARow,this.ACol) && this.ActionBlur(F,T); }
// -----------------------------------------------------------------------------------------------------------
MS.FocusRect;
// -----------------------------------------------------------------------------------------------------------
TGP.ActionFocusCellRange = function(dummy,T){ 
if(!this.FocusRect || !this.ARow||this.ARow.Space||!this.FRow||this.FRow.Space) return false;
var ret = this.Focus(this.FRow,this.FCol,null,this.UpdateRectOrder([this.FRow,this.FCol,this.ARow,this.ACol]),null,T); return T ? !!ret : ret!=null; 
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionFocusRowRange = function(dummy,T){
if(!this.FocusRect || !this.ARow||this.ARow.Space||!this.FRow||this.FRow.Space) return false;
for(var fc=this.GetFirstCol();fc&&!this.CanFocus(this.FRow,fc);fc=this.GetNextCol(fc));
for(var lc=this.GetLastCol();lc&&!this.CanFocus(this.FRow,lc);lc=this.GetPrevCol(lc));
if(!fc||!lc) return false;
var fr = this.FRow, lr = this.ARow; if(!this.GetRowsOrder(fr,lr)){ fr = this.ARow; lr = this.FRow; }
var ret = this.Focus(this.FRow,this.FCol,null,[fr,fc,lr,lc,null,null,1,0],24,T); return T ? !!ret : ret!=null;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionFocusColRange = function(dummy,T){
if(!this.FocusRect || !this.ARow||this.ARow.Space||!this.FRow||this.FRow.Space) return false;
for(var fr=this.GetFirstVisible(null,4);fr&&!this.CanFocus(fr,this.FCol);fr=this.GetNextVisible(fr,4));
for(var lr=this.GetLastVisible(null,4);lr&&!this.CanFocus(lr,this.FCol);lr=this.GetPrevVisible(lr,4));
if(!fr||!lr) return false;
var fc = this.FCol, lc = this.ACol; if(!this.GetColsOrder(fc,lc)){ fc = this.ACol; lc = this.FCol; }
var ret = this.Focus(this.FRow,this.FCol,null,[fr,fc,lr,lc,null,null,0,1],24,T); return T ? !!ret : ret!=null;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionFocusWholeRow = function(F,T){ 
var A = this.GetARanges(F); if(!A.length||!this.FocusRect) return false;
for(var fc=this.GetFirstCol();fc&&!this.CanFocus(A[0][0],fc);fc=this.GetNextCol(fc));
for(var lc=this.GetLastCol();lc&&!this.CanFocus(A[0][2],lc);lc=this.GetPrevCol(lc));
var B = this.GetACell(F);
if(!fc||!lc||!B) return false;
if(!this.CanFocus(B[0],B[1])) B[1] = this.FCol&&this.CanFocus(B[0],this.FCol) ? this.FCol : fc;
var ret = this.Focus(B[0],B[1],null,[A[0][0],fc,A[0][2],lc,null,null,1,0],24,T); return T ? !!ret : ret!=null;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionFocusWholeCol = function(F,T){ 
var A = this.GetARanges(F); if(!A.length||!this.FocusRect) return false;
for(var fr=this.GetFirstVisible(null,4);fr&&!this.CanFocus(fr,A[0][1]);fr=this.GetNextVisible(fr,4));
for(var lr=this.GetLastVisible(null,4);lr&&!this.CanFocus(lr,A[0][3]);lr=this.GetPrevVisible(lr,4));
var B = this.GetACell(F);
if(!fr||!lr||!B) return false;
if(!this.CanFocus(B[0],B[1])) B[0] = this.FRow&&this.CanFocus(this.FRow,B[1]) ? this.FRow : fr;
var ret = this.Focus(B[0],B[1],null,[fr,A[0][1],lr,A[0][3],null,null,0,1],24,T); return T ? !!ret : ret!=null;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionFocusWholeGrid = function(dummy,T){ 
if(!this.FocusRect) return false;
for(var fr=this.GetFirstVisible(null,4);fr;fr=this.GetNextVisible(fr,4)){
   for(var fc=this.GetFirstCol();fc&&!this.CanFocus(fr,fc);fc=this.GetNextCol(fc));
   if(fc) break;
   }
for(var lr=this.GetLastVisible(null,4);lr;lr=this.GetPrevVisible(lr,4)){
   for(var lc=this.GetLastCol();lc&&!this.CanFocus(lr,lc);lc=this.GetPrevCol(lc));
   if(lc) break;
   }
if(!fr||!lr) return false;
var ret = this.Focus(fr,fc,null,[fr,fc,lr,lc,null,null,1,1],24,T); return T ? !!ret : ret!=null;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionFocusCells = function(){ return this.StartFocus(3,0); }
TGP.ActionFocusRow = function(){ return Grids.Drag ? this.StartFocus(2,0) : this.Focus(this.ARow,null) != null; } 
TGP.ActionFocusRows = function(){ return this.StartFocus(1,0,1); }
TGP.ActionFocusCol = function(){ return this.StartFocus(1,0); }
TGP.ActionFocusCols = function(){ return this.StartFocus(2,0,1); }
TGP.ActionFocusRowCol = function(){ return this.StartFocus(0,0); }
TGP.ActionFocusFillCells = function(){ return this.StartFocus(3,1); }
TGP.ActionFocusFillRow = function(){ return this.StartFocus(2,1); }
TGP.ActionFocusFillCol = function(){ return this.StartFocus(1,1); }
TGP.ActionFocusFillRowCol = function(){ return this.StartFocus(0,1); }
// -----------------------------------------------------------------------------------------------------------
TGP.StartFocus = function(dir,fill,all){ 
var D = Grids.Drag; if(!D) return false;
if(!D.Row || D.Row.Space || !this.FocusRect || this.Locked["focus"] || this.EditMode&&this.ERow==this.ARow&&this.ECol==this.ACol || fill&&this.LockedEdit) return false;
MS.Touch; if(this.Touched && !fill && this.TouchDragFocused && (D.Row!=this.FRow || this.TouchDragFocused==2 && this.ACol!=this.FCol)) return false; ME.Touch;
if(fill ? !this.FRow||!this.FCol : (this.FRow!=this.ARow || this.FCol!=this.ACol || this.FRect) && !all && !this.Focus(this.ARow,this.ACol)) return false;
D.Old = [];
if(all){
   if(dir&2){
      for(var fr=this.GetFirstVisible(null,4);fr&&!this.CanFocus(fr,D.Col);fr=this.GetNextVisible(fr,4)); D.Old[0] = fr;
      for(var lr=this.GetLastVisible(null,4);lr&&!this.CanFocus(lr,D.Col);lr=this.GetPrevVisible(lr,4)); D.Old[2] = lr;
      if(!fr) return false;
      D.Old[7] = 1;
      var A = this.GetShownRows(1); if(!this.Focus(A[0],D.Col)&&(this.FRow!=A[0]||this.FCol!=D.Col)&&!this.Focus(fr,D.Col)&&(this.FRow!=fr||this.FCol!=D.Col)) return false;
      }
   else {
      for(var fc=this.GetFirstCol();fc&&!this.CanFocus(D.Row,fc);fc=this.GetNextCol(fc)); D.Old[1] = fc;
      for(var lc=this.GetLastCol();lc&&!this.CanFocus(D.Row,lc);lc=this.GetPrevCol(lc)); D.Old[3] = lc;
      if(!fc) return false;
      D.Old[6] = 1;
      var A = this.GetShownCols(1); if(!this.Focus(D.Row,A[0])&&(this.FRow!=D.Row||this.FCol!=A[0])&&!this.Focus(D.Row,fc)&&(this.FRow!=D.Row||this.FCol!=fc)) return false;
      }
   }
D.Action = fill ? "Fill" : "Focus";
D.Move = this.MoveFocus;
D.End = this.EndFocus;
D.Cursor = "default";
D.Type = (this.SelectHidden&1?0:1)+(this.SelectHidden&2?0:2)+(this.SelectHidden&4?16:0);
D.Dir = dir;
D.Fill = fill;
D.All = all;
D.FillClear = fill && !(this.AutoFillType&4);
D.Select = this.SelectingFocus&&this.Selecting&&this.SelectingCells&&!this.Locked["select"];
D.SelectClass = this.SelectClass; if(this.SelectClass==1) this.SelectClass = 0; 
D.Orig = this.FRect ? this.FRect : [this.FRow,this.FCol,this.FRow,this.FCol];
D.Height = this.GetRowTop(D.Orig[2]) - this.GetRowTop(D.Orig[0]) + this.GetRowHeight(D.Orig[2]);
D.Width = this.GetColLeft(D.Orig[3],1) - this.GetColLeft(D.Orig[1],1) + this.Cols[D.Orig[3]].Width;
D.New = D.Orig;
D.ScrollLeft = this.GetScrollLeft(this.Cols[this.FCol].MainSec);
D.ScrollTop = this.GetScrollTop(1);
if(fill&&!D.Select){
   
   this.ColorRange(D.Orig.slice(),D.Old,this.Colors["Fill"],"",null,this.Event.X); 
   D.Old = D.Orig.slice();
   
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.MoveFocus = function(){ 
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.MoveFocus();
var cmove = D.AX+this.GetScrollLeft(this.Cols[this.FCol].MainSec)-D.X-D.ScrollLeft, rmove = D.AY+this.GetScrollTop(1)-D.Y-D.ScrollTop;
var dir = D.Dir; if(!dir) dir = Math.abs(cmove) < Math.abs(rmove) ? 1 : 2;
if(this.ScrollOnDrag&&dir&1) this.SetScrollTo(this.ARow);
if(this.ScrollColOnDrag&&dir&2) this.SetScrollColTo(this.ACol,this.Event.X);
if(!this.ARow||!this.ACol||this.ARow.Space) return true;
if(D.Fill) { cmove += D.Width; rmove += D.Height; }
var cmoveleft = cmove<0; 
var r1 = D.Orig[rmove<0?2:0]; 
var c1 = D.Orig[cmoveleft?3:1];
var r2 = dir&1 && (!D.FillClear||rmove<=0||rmove>=D.Height) ? this.ARow : D.Orig[rmove<0?0:2];
var c2 = dir&2 && (!D.FillClear||cmove<=0||cmove>=D.Width) ? this.ACol : D.Orig[cmoveleft?1:3];
var rect = [rmove<0?r2:r1,cmoveleft?c2:c1,rmove<0?r1:r2,cmoveleft?c1:c2];
if(D.All) { 
   if(dir&2) { rect[0] = D.Old[0]; rect[2] = D.Old[2]; rect[7] = 1; }
   else { rect[1] = D.Old[1]; rect[3] = D.Old[3]; rect[6] = 1; }
   }
if(!this.Focus(r1,c1,null,rect,42+(D.All?16:0))) return true; 
if(D.Select&&!D.Fill){
   this.ColorRange(rect.slice(),D.All&&(!D.Old[0]||!D.Old[1])?[]:D.Old,null,"CanSelect",null,this.Event.X);
   D.Old = rect.slice();
   }
D.New = rect;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.EndFocus = function(){ 
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.EndFocus();
if(D.Fill&&!D.Select) this.ColorRange(null,D.Old,null,""); 
this.SelectClass = D.SelectClass;
if(D.Fill && this.FillRange(D.New,D.Orig) && D.Select) this.SelectRange(D.Orig[0],D.Orig[1],D.Orig[2],D.Orig[3],0,null,0,(this.Undo&6)!=2);
if(D.Select) {
   var typ = D.Type|(this.SelectClass||D.Fill?0:32)|(this.SelectingCells>=3?64:0);
   if(D.New[6]&&this.SelectingFocus&4) this.SelectRange(D.New[0],null,D.New[2],null,1,typ,0,(this.Undo&6)!=2);
   else if(D.New[7]&&this.SelectingFocus&4) this.SelectRange(null,D.New[1],null,D.New[3],1,typ,0,(this.Undo&6)!=2);
   else this.SelectRange(D.New[0],D.New[1],D.New[2],D.New[3],1,typ,0,(this.Undo&6)!=2);
   }
if(this.EventObject) this.EventObject = { Type:this.EventObject.Type };
if(!D.Fill&&(this.DynamicStyle||this.DynamicFormat||this.DynamicSpan||this.DynamicBorder)) this.CalculateSpaces(1);
if((D.Fill||D.Select)&&(this.Undo&7)==7) this.MergeUndo("Focus");
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionMoveFocus = function(copy,attrs){ 
var D = Grids.Drag; if(!D||this.LockedEdit) return false;
D.Action = "MoveFocus";
D.Move = this.MoveMoveFocus;
D.End = this.EndMoveFocus;
D.Cursor = "default";
D.FRect = this.FRect; D.FRow = this.FRow; D.FCol = this.FCol;
D.Type = copy ? this.MoveFocusType&~2 : this.MoveFocusType;
D.Attrs = attrs;
D.Vis = 0;
var F = this.FRect;
if(!F){
   if(D.Type&4) return false;
   F = [D.FRow,D.FCol,D.FRow,D.FCol]; D.FRect = F;
   }
if(F[0].Spanned) F[1] = this.GetSpanCol(F[0],F[1],D.Vis);
if(F[0].RowSpan) F[0] = this.GetSpanRow(F[0],F[1],D.Vis);
if(F[2].Spanned) F[3] = this.GetLastSpanCol(F[2],F[3],D.Vis);
if(F[2].RowSpan) F[2] = this.GetLastSpanRow(F[2],F[3],D.Vis);
if(F[0]!=F[2]||F[1]!=F[3]){
   var ar = this.ARow, ac = this.ACol, frr = this.FRow, fcc = this.FCol; 
   if(D.Vis){
      if(!ar.Visible) ar = this.GetNextVisible(ar,4);
      if(!this.Cols[ac].Visible) ac = this.GetNextCol(ac);
      if(!frr.Visible) frr = this.GetNextVisible(frr,4);
      if(!this.Cols[fcc].Visible) fcc = this.GetNextCol(fcc);
      }
   for(var r=F[0];r!=F[2]&&r!=ar;r=D.Vis?this.GetNextVisible(r,4):this.GetNext(r,4));
   var fr = ar; if(r==F[2]&&r!=ar) fr = F[2]==(D.Vis?this.GetPrevVisible(ar,4):this.GetPrev(ar,4)) ? F[2] : (F[0]==(D.Vis?this.GetNextVisible(ar,4):this.GetNext(ar,4)) ? F[0] : frr);
   for(var c=F[1];c!=F[3]&&c!=ac;c=this.GetNextCol(c,null,D.Vis?0:2));
   var fc = ac; if(c==F[3]&&c!=ac) fc = F[3]==this.GetPrevCol(ac,null,D.Vis?0:2) ? F[3] : (F[1]==this.GetNextCol(ac,null,D.Vis?0:2) ? F[1] : fcc);
   for(var r=F[0],le=0;r&&r!=fr;r=D.Vis?this.GetNextVisible(r,4):this.GetNext(r,4)) le++;
   for(var r=F[2],re=0;r&&r!=fr;r=D.Vis?this.GetPrevVisible(r,4):this.GetPrev(r,4)) re++;
   for(var r=F[0],fe=0;r&&r!=frr;r=D.Vis?this.GetNextVisible(r,4):this.GetNext(r,4)) fe++;
   for(var c=F[1],te=0;c&&c!=fc;c=this.GetNextCol(c,null,D.Vis?0:2)) te++;
   for(var c=F[3],be=0;c&&c!=fc;c=this.GetPrevCol(c,null,D.Vis?0:2)) be++;
   for(var c=F[1],ce=0;c&&c!=fcc;c=this.GetNextCol(c,null,D.Vis?0:2)) ce++;
   D.Rect = [le,te,re,be,fe,ce];
   }
else D.Rect = [0,0,0,0,0,0];
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.MoveMoveFocus = function(){ 
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.MoveMoveFocus();
if(this.ScrollOnDrag) this.SetScrollTo(this.ARow);
if(this.ScrollColOnDrag) this.SetScrollColTo(this.ACol,this.Event.X);
if(!this.ARow||!this.ACol||this.ARow.Space) return false;
var F = D.Rect.slice(), ar = this.ARow, ac = this.ACol;

if(D.Vis){
   if(!ar.Visible) ar = this.GetNextVisible(ar,4);
   if(!this.Cols[ac].Visible) ac = this.GetNextCol(ac);
   }

for(var j=0;j<3;j++){
   for(var r1=ar,i=0;r1&&i<F[0];r1=D.Vis?this.GetPrevVisible(r1,4):this.GetPrev(r1,4)) i++;
   if(!r1) { F[0] -= i-1; F[2] += i-1; continue; }
   for(var r2=ar,i=0;r2&&i<F[2];r2=D.Vis?this.GetNextVisible(r2,4):this.GetNext(r2,4)) i++;
   if(!r2) { F[0] += i-1; F[2] -= i-1; continue; }
   for(var c1=ac,i=0;c1&&i<F[1];c1=this.GetPrevCol(c1,null,D.Vis?0:2)) i++;
   if(!c1) { F[1] -= i-1; F[3] += i-1; continue; }
   for(var c2=ac,i=0;c2&&i<F[3];c2=this.GetNextCol(c2,null,D.Vis?0:2)) i++;
   if(!c2) { F[1] += i-1; F[3] -= i-1; continue; }
   break;
   }

for(var fr=r1,i=0;fr&&i<D.Rect[4];fr=D.Vis?this.GetNextVisible(fr,4):this.GetNext(fr,4)) i++;
for(var fc=c1,i=0;fc&&i<D.Rect[5];fc=this.GetNextCol(fc,null,D.Vis?0:2)) i++;

if(j!=3) {
   var ftyp = 46+(this.MoveFocusType&8?16:0); 
   if(this.Focus(fr,fc,null,[r1,c1,r2,c2],ftyp)==null){
      for(var nfc=this.FRect?this.FRect[1]:this.FCol,i=0;nfc&&i<D.Rect[5];nfc=this.GetNextCol(nfc,null,D.Vis?0:2)) i++;
      if(this.Focus(fr,nfc,null,this.FRect?[r1,this.FRect[1],r2,this.FRect[3]]:null,ftyp)==null){
         for(var nfr=this.FRect?this.FRect[0]:this.FRow,i=0;nfr&&i<D.Rect[4];nfr=D.Vis?this.GetNextVisible(nfr,4):this.GetNext(nfr,4)) i++;
         this.Focus(nfr,fc,null,this.FRect?[this.FRect[0],c1,this.FRect[2],c2]:null,ftyp);
         }
      }
   }

return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.EndMoveFocus = function(){ 
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.EndMoveFocus();
var F = this.FRect ? this.FRect : [this.FRow,this.FCol,this.FRow,this.FCol], O = D.FRect ? D.FRect : [D.FRow,D.FCol,D.FRow,D.FCol], typ = D.Type;
if(Grids.OnMoveFocus||Grids.OnMoveFocusFinish||Grids.OnMoveFocusValue){ var R = [], C = [], OR = [], OC = []; this.GetRangeRC(F,R,C); this.GetRangeRC(O,OR,OC); }
if(Grids.OnMoveFocus){
   typ = Grids.OnMoveFocus(this,F,O,V,R,C,OR,OC);
   if(typ==null) typ = D.Type;
   else if(typ===true){
      this.Focus(D.FRow,D.FCol,null,D.FRect,6); 
      return true;
      }
   }
if(this.Undo&4) this.AddUndo({ Type:"Focus",Row:this.FRow,Col:this.FCol,Pos:null,ORow:D.FRow,OCol:D.FCol,OPos:null,Rect:this.FRect,ORect:D.FRect});
if(this.SelectingFocus) this.SelectFocus(D.FRow,D.FCol,D.FRect[0],1);
if(!(typ&3) || typ&4&&!this.FRect) return true;
var E = this.GetErrors(D.Type&2?"Move":"Copy");
if(typ&1) {
   var V = this.GetRangeValues(O,D.Attrs);
   if(Grids.OnMoveFocusValue){
      var A = this.GetEditAttrs(0,D.Attrs), fp = this.FormulaEditing ? this.Lang.Format.FormulaPrefix : "";
      for(var ri=0;ri<R.length;ri++){
         for(var ci=0;ci<C.length;ci++) {
            var v = V[ri][ci], o = Get(R[ri],C[ci]); if(fp && R[ri][C[ci]+"EFormula"]) o = fp+R[ri][C[ci]+"EFormula"];
            var nv = Grids.OnMoveFocusValue(this,R[ri],C[ci],OR[ri],OC[ci],v.Formula?fp+v.Formula:v.Value,o,v,A,E);
            if(nv!=null) {
               if(fp&&typeof(nv)=="string"&&nv.indexOf(fp)==0) v.Formula = nv.slice(fp.length);
               else v.Value = nv; 
               }
            }
         }
      }
   this.SetRangeValues(F,V,typ&2?O:null,E,D.Attrs);
   }
else if(typ==2) this.ClearRange(F,null,E,D.Attrs);
this.ProcessErrors(E);
if((this.Undo&5)==5) this.MergeUndo();
if(Grids.OnMoveFocusFinish) Grids.OnMoveFocusFinish(this,F,O,V,R,C,OR,OC);
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionMoveFocusValues = function(){ return this.ActionMoveFocus(0,1); }
TGP.ActionMoveFocusStyles = function(){ return this.ActionMoveFocus(0,2); }

TGP.ActionCopyFocus = function(){ return this.ActionMoveFocus(1); }
TGP.ActionCopyFocusValues = function(){ return this.ActionMoveFocus(1,1); }
TGP.ActionCopyFocusStyles = function(){ return this.ActionMoveFocus(1,2); }

// -----------------------------------------------------------------------------------------------------------
ME.FocusRect;
// -----------------------------------------------------------------------------------------------------------
TGP.GetFocusedRows = function(type,attr){ 
if(!this.FRect || this.FRect[0]==this.FRect[2]) return this.FRow ? [this.FRow] : [];
MS.FocusRect;
var fr = this.FRect[0], lr = this.FRect[2], A = [], p = 0, hid = type&8;
if(type&4){
   while(lr && fr.Level<lr.Level) lr = lr.parentNode;
   while(lr && fr.Level<lr.Level) lr = hid ? this.GetPrev(lr) : this.GetPrevVisible(lr);
   if(!lr) return [];
   var nr = hid ? this.GetNextSibling(lr,(type&3)+4) : this.GetNextSiblingVisible(lr,(type&3)+4);
   for(var r=fr;r&&r!=nr;r=hid?this.GetNextSibling(r,(type&3)+4):this.GetNextSiblingVisible(r,(type&3)+4)) if(!attr||Get(r,attr))A[p++] = r;
   }
else {
   var typ = (type&1) + (type&2 ? 2 : 4), nr = hid ? this.GetNext(lr,typ) : this.GetNextVisible(lr,typ);
   for(var r=fr;r&&r!=nr;r=hid?this.GetNext(r,typ):this.GetNextVisible(r,typ)) if(!attr||Get(r,attr)) A[p++] = r;
   }
return r==nr ? A : [];
ME.FocusRect;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetFocusedCols = function(attr){ 
if(!this.FRect || this.FRect[1]==this.FRect[3]) return this.FCol&&(!attr||this.Cols[this.FCol][attr]) ? [this.FCol] : [];
MS.FocusRect;
var A = [], p = 0, nc = this.GetNextCol(this.FRect[3]);
for(var c=this.FRect[1];c&&c!=nc;c=this.GetNextCol(c)) if(!attr||this.Cols[c][attr]) A[p++] = c;
return c==nc ? A : [];
ME.FocusRect;
}
// -----------------------------------------------------------------------------------------------------------
MS.Master;
TGP.FocusNested = function(test){ 
if(!this.NestedFocusedActions||!this.LastFocus||!this.LastFocus[0]||this.LastFocus[0]==this||!this.LastFocus[0].MasterGrid||!this.LastFocus[1]) return false;
for(var G=this.LastFocus[0].MasterGrid;G;G=G.MasterGrid) if(G==this) {
   if(!this.Rows[this.LastFocus[1]]) return false;
   
   if(!test) this.LastFocus[0].Focus(this.LastFocus[0].Rows[this.LastFocus[1]],this.LastFocus[2],this.LastFocus[3],this.LastFocus[4]);
   return true;
   }
return false;
}
ME.Master;
// -----------------------------------------------------------------------------------------------------------
// Sets attibutes Focused, FocusedPos, FocusedCol
TGP.SetFocused = function(idx){
this.FocusedPos = null;
var fcol = this.FCol;
if(this.FRow){
   if(this.FocusedVar&&this.FRow.Fixed) {
      this.Focused = idx ? this.GetRowIndex(this.FocusedVar,1,this.FocusedVar) : this.FocusedVar;
      fcol = this.FocusedVarCol;
      this.FocusedFix = this.FRow.id; this.FocusedFixCol = this.FCol;
      }
   else this.Focused = idx ? this.GetRowIndex(this.FRow,1,this.FRow.id) : this.FRow.id;
   MS.Paging;
   if(this.FRow.Page){
      if(!this.Focused) this.Focused = this.FRow.Pos;
      this.FocusedPos = this.FPagePos;
      }
   ME.Paging;
   this.FocusedTop = !this.FRow.Fixed ? this.GetRowTop(this.FRow) - this.GetScrollTop() : this.FocusedVar ? this.FocusedVarTop - this.GetScrollTop() : null;
   }
else this.Focused = null;
this.FocusedCol = idx&&fcol ? this.GetColIndex(fcol,1,fcol) : fcol;
if(this.Cols[fcol]) this.FocusedLeft = this.GetColLeft(fcol) - this.GetScrollLeft(this.Cols[fcol].MainSec);
var F = this.FRect;
if(!F) { this.FocusedRect = ""; return; }
MS.FocusRect;
if(idx) this.FocusedRect = this.GetRowIndex(F[0],1,F[0].id)+","+this.GetColIndex(F[1],1,F[1])+","+this.GetRowIndex(F[2],1,F[2].id)+","+this.GetColIndex(F[3],1,F[3])+(F[4]||F[5]?","+F[4]+","+F[5]:"");
else this.FocusedRect = F[0].id+","+F[1]+","+F[2].id+","+F[3]+(F[4]||F[5]?","+F[4]+","+F[5]:"");
ME.FocusRect;
}
// -----------------------------------------------------------------------------------------------------------
// Sets FRow/FPagePos according to Focused/FocusedPos
TGP.FocusFocused = function(clear,always){
if(always==null ? !this.IgnoreFocused : always){
   var T = this, ap = 10, ac = 10; 
   function GetRow(f,p){
      var row = T.GetRowById(f);
      if(p==null){ if(row) return row; }
      else if(f-0+""==f) { var B = GetNode(T.XB,f); if(B) return B; }
      for(var B=T.XB.firstChild;B;B=B.nextSibling) if(B.id==f) return B;
      if(T.AutoPages) while(ap&&!row) { T.AddAutoPages(); row = T.GetRowById(f); ap--; }
      return row;
      }
   function HasCol(c){
      if(T.Cols[c]) return true;
      if(T.AutoColPages) while(ac) { T.AddAutoColPages(); ac--; if(T.Cols[c]) return true; }
      return false;
      }
   var f = this.Focused, fr = this.FocusedRect, zfr = null;
   if(fr){  
      fr = fr.split(",");
      if(!fr[0]){
         for(var ff=this.GetFirstVisible(null,4);ff&&!this.CanFocus(ff,fr[1]);ff=this.GetNextVisible(ff,4));
         for(var lr=this.GetLastVisible(null,4);lr&&!this.CanFocus(lr,fr[1]);lr=this.GetPrevVisible(lr,4));
         fr[0] = ff; fr[2] = lr; fr[7] = 1;
         }
      else {
         fr[0] = GetRow(fr[0],fr[4]);
         fr[2] = GetRow(fr[2],fr[5]);
         }
      if(!fr[1]){
         for(var fc=this.GetFirstCol();fc&&!this.CanFocus(fr[0],fc);fc=this.GetNextCol(fc));
         for(var lc=this.GetLastCol();lc&&!this.CanFocus(fr[0],lc);lc=this.GetPrevCol(lc));
         fr[1] = fc; fr[3] = lc; fr[6] = 1;
         }
      if(!fr[0]||!fr[2]||!HasCol(fr[1])||!HasCol(fr[3])) fr = null;
      else if(!fr[6]&&!fr[7]){
         zfr = fr.slice();
         if(fr[0].RowSpan) fr[0] = this.GetSpanRow(fr[0],fr[1],1);
         if(fr[2].RowSpan) fr[2] = fr[1]==fr[3] ? this.GetSpanRow(fr[2],fr[3],1) : this.GetLastSpanRow(fr[2],fr[3],1);
         if(fr[0].Spanned) fr[1] = this.GetSpanCol(fr[0],fr[1],1);
         if(fr[2].Spanned) fr[3] = fr[0]==fr[2] ? this.GetSpanCol(fr[2],fr[3],1) : this.GetLastSpanCol(fr[2],fr[3],1);
         if(fr[0]==fr[2]&&fr[1]==fr[3]&&!fr[6]&&!fr[7]) fr = null; 
         }
      }
   var row = f!=null&&f!=="" ? GetRow(f,this.FocusedPos) : (fr ? fr[0] : null);
   var fc = this.FocusedCol; if(fr && (fc==null||fc==="")) fc = fr[1];
   if(row) {
      if(this.FRow==row) this.FRow = null;
      if(this.Cols[fc]&&!this.Cols[fc].Visible) { fc = this.GetPrevCol(fc,row); if(!fc) fc = this.GetFirstCol(); }
      if(!row.Visible) { var ps = this.GetPrevSiblingVisible(row); row = ps ? ps : this.GetPrevVisible(row); if(!row) row = this.GetFirstVisible(); }
      this.NoScrollUndoTo = new Date()-0+100; 
      var type = 5+(this.FocusedType&1?8:0)+(this.SelectingFocus&&(fr&&fr[6]?row.Selected&1:fr&&fr[7]?this.Cols[fc].Selected:row.Selected&2&&row[fc+"Selected"])?32:0);
      if(!this.Focus(row,fc,this.FocusedPos,fr,type,0,this.FocusedType&2?null:this.FocusedTop,this.FocusedType&2?null:this.FocusedLeft,this.ShowFocused&4?null:this.FocusedFix) && this.FocusedFix){ 
         this.Focus(this.GetRowById(this.FocusedFix),this.FocusedFixCol,null,null,type);
         }
      if(!(this.SelectingFocus&2)&&!fr&&row&&row[fc+"Selected"]) {
         if(zfr) this.SelectRange(zfr[0],zfr[1],zfr[2],zfr[3],0,0,0,1);
         else row[fc+"Selected"] = 0; 
         }
      
      }
   }
if(clear||clear==null){
   this.Focused = null; this.FocusedPos = null; this.FocusedCol = null; this.FocusedRect = null; this.FocusedVar = null; this.FocusedFix = null;
   }
}
// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------
// Showig and hiding rows
// -----------------------------------------------------------------------------------------------------------
MS.Show;
// -----------------------------------------------------------------------------------------------------------
// Show given row in table
// If noshow = true, does not show changes => the re-render will be needed
// Returns 0 if row is not displayed
TGP.ShowRow = function(row,noshow,exp,nohidden){
if(row.Fixed){ 
   if(row.Visible) return 1;
   row.Visible = 1;
   if(row.MenuCheck!=null) row.MenuCheck = null;
   if(!nohidden) row.Hidden = 0;
   if(row.Space && !this.CalculateHidden && !this.NoCalc && row.Calculated) { var P = this.GetCalc(); P.Show = !noshow; this.CalcRow(row,P,"CalcOrder",!noshow); }
   if(noshow) { this.UpdateFootVisible(); return 1; }
   if(row.Space) this.ShowSpaceClass(row);
   else {
      if(row.Fixed=="Head") for(var r=row.previousSibling;r&&!r.Visible;r=r.previousSibling); else for(var r=row.nextSibling;r&&!r.Visible;r=r.nextSibling);
      if(!r){ 
         var cls = this.MainTable.className, f = "Has"+row.Fixed;
         if(row.Kind=="Header"){ if(cls.indexOf(f+"er")<0) this.MainTable.className = cls.indexOf(f)>=0 ? cls.replace(f,f+"er") : cls + " "+this.Img.Style+f+"er"; }
         else if(cls.indexOf(f)<0) this.MainTable.className = cls + " "+this.Img.Style+f;
         else if(cls.indexOf(f+"er")>=0) this.MainTable.className = cls.replace(f+"er",f);
         }
      }
   if(row.Fixed=="Foot" && !this.FootVisible) { row.Visible = 0; this.TableShowFoot(); row.Visible = 1; }
   this.TableShowRow(row);
   this.ColorRow(row);
   
   this.Update();
   return 1;
   }
if(row.Visible || nohidden&&Is(row,"Hidden")) return 1;
if(row.Filtered) return 0;
var par = row.parentNode;
MS.Tree;
if(par.Expanded && !this.HasChildren(par)) this.TableExpand(par);
row.Visible = 1;
if(!nohidden) row.Hidden = 0;
var lev = row.LevelImg;
this.UpdateLevelImg(row);
if(!row.r1 && !par.Page && par.Hasch!=4 && !par.Expanded){ 
   this.UpdateRowIcons(row,!noshow);
   return 0;
   }
MX.Tree;
row.Visible = 1;
ME.Tree;
if(row.MenuCheck!=null) row.MenuCheck = null;
if(noshow) return 1;

if(par.Page) this.UpdateEmptyRows();
var exists = row.r1;
this.TableShowRow(row);
MS.Tree;
if((exp||this.HideParents) && row.Expanded&2){
   row.Expanded &= ~2;
   if(row.firstChild) {
      this.UpdateChildrenLevelImg(row,1,1);
      if(!this.HideTree) this.SetWidth(this.MainCol,0,1,row);
      }
   }
if(row.Expanded==1 && this.HasChildren(row)) this.Expand(row,true); 
this.UpdateRowIcons(row,true);
if(lev != row.LevelImg) this.UpdateIcon(row);
ME.Tree;
if(this.Selecting && this.SelectingCells>=3 && !(this.SelectHidden&1) && this.SelectingFocus && (!this.FRect||!this.FRect[7]||!(this.SelectingFocus&4)) && this.IsFocused(row,null)) {
   if(this.FRect) {
      if(this.SelectingFocus&4&&this.FRect[6]) this.SelectRow(row,1);
      else this.SelectRange(row,this.FRect[1],row,this.FRect[3],1); 
      }
   else if(this.SelectingFocus&2) this.SelectCell(row,this.FCol);
   }
if(exists) this.ColorRow(row);

this.Update();
return 1;
}
// -----------------------------------------------------------------------------------------------------------
TGP.HideFRow = function(A){
var r = this.FRow; if(!r) return;
var F = this.FRect, chg = 0; if(F&&F[7]) return;
if(A) {
   function Hide(row,B){ for(var r=row.firstChild;r;r=r.nextSibling) if(B[r.id]==null){ B[r.id] = r.Visible; r.Visible = 0; if(r.firstChild) Hide(r,B); } }
   for(var i=0,B={};i<A.length;i++) if(B[A[i].id]==null){ 
      B[A[i].id] = A[i].Visible; A[i].Visible = 0; 
      if(A[i].firstChild) Hide(A[i],B);
      }
   }
var fr; if(r.Fixed) fr = r.Visible?null:r; else for(fr=null;r&&!r.Page;r=r.parentNode) if(!r.Visible) fr = r;
if(this.EditMode){
   var er = fr;
   if(this.FRow!=this.ERow){ var r = this.ERow; if(r.Fixed) er = r.Visible?null:r; else for(er=null;r&&!r.Page;r=r.parentNode) if(!r.Visible) er = r; }
   if(er && this.EndEdit(1)==-1) this.EndEdit(0); 
   }
if(F){
   var r1, r = F[0]; if(r.Fixed) r1 = r.Visible?null:r; else for(r1=null;r&&!r.Page;r=r.parentNode) if(!r.Visible) r1 = r;
   var r2, r = F[2]; if(r.Fixed) r2 = r.Visible?null:r; else for(r2=null;r&&!r.Page;r=r.parentNode) if(!r.Visible) r2 = r;
   if(r1||r2){
      F = F.slice(); chg = 1;
      if(r1) F[0] = this.GetNextShift(r1,null,1,this.FCol)[0];
      if(r2) F[2] = this.GetPrevShift(r2,null,1,this.FCol)[0];
      if(!F[0]||F[0].Page||!F[2]||F[2].Page||F[0]==this.GetNextShift(F[2],null,1,this.FCol)[0]) { F[0] = null; F[2] = null; }
      }
   }
if(fr) {
   var r = this.GetNextShift(fr,null,1,this.FCol)[0];
   if(!r || r.Page || chg&&r2&&F[2]&&r==this.GetNextShift(F[2],null,1,this.FCol)[0] || !this.Focus(r,this.FCol,null,F?[F[0]?F[0]:r,F[1],F[2]?F[2]:r,F[3],null,null,F[6],F[7]]:null,2)) {
      r = this.GetPrevShift(fr,null,1,this.FCol)[0];
      if(!r || !this.Focus(r,this.FCol,null,F?[F[0]?F[0]:r,F[1],F[2]?F[2]:r,F[3]]:null,2)) this.Focus();
      }
   }
else if(chg) this.Focus(this.FRow,this.FCol,null,F?[F[0]?F[0]:this.FRow,F[1],F[2]?F[2]:this.FCol,F[3]]:null,2);
if(A) for(var id in B) this.Rows[id].Visible = B[id];
}
// -----------------------------------------------------------------------------------------------------------
TGP.ShowSpaceClass = function(row,ch){
if(!row.Space) return;
for(var r=this.XS.firstChild,A=[],H=0;r;r=r.nextSibling) if(r.Space==row.Space&&(r.Visible&&!r.RelHidden||r==row)) { A[A.length] = r; if(ch) H += r.r1.parentNode.offsetHeight; }
if(this.HiddenBody){
   if(row.Space==1) { for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Space==2&&(r.Visible&&!r.RelHidden)) A[A.length] = r; }
   if(row.Space==2) { for(var r=this.XS.lastChild;r;r=r.previousSibling) if(r.Space==1&&(r.Visible&&!r.RelHidden)) A.unshift(r); }
   }
if(row==A[0]) {
   if(row.r1.parentNode.className.indexOf("RowSpaceFirst")<0) row.r1.parentNode.className += " "+this.Img.Style+"RowSpaceFirst";
   if(A.length>1) A[1].r1.parentNode.className = A[1].r1.parentNode.className.replace(" "+this.Img.Style+"RowSpaceFirst","");
   }
else if(row.r1.parentNode.className.indexOf("RowSpaceFirst")>=0) row.r1.parentNode.className = row.r1.parentNode.className.replace(" "+this.Img.Style+"RowSpaceFirst","");
if(row==A[A.length-1]) {
   if(row.r1.parentNode.className.indexOf("RowSpaceLast")<0) row.r1.parentNode.className += " "+this.Img.Style+"RowSpaceLast";
   if(A.length>1) A[A.length-2].r1.parentNode.className = A[A.length-2].r1.parentNode.className.replace(" "+this.Img.Style+"RowSpaceLast","");
   }
else if(row.r1.parentNode.className.indexOf("RowSpaceLast")>=0) row.r1.parentNode.className = row.r1.parentNode.className.replace(" "+this.Img.Style+"RowSpaceLast","");
if(ch) for(var i=0;i<A.length;i++) H -= A[i].r1.parentNode.offsetHeight;
if(row.Space==4 && A.length<=1) for(var i=this.FirstSec;i<=this.SecCount;i++){ var H = i==this.SecCount?this.ScrollDot:this.ScrollHorzParent[i]; if(H && H.firstChild.className.indexOf("HScrollSpace")<0) H.firstChild.className += " "+this.Img.Style+"HScrollSpace"; }
if(A.length==1) this.MainTable.className = this.MainTable.className + " "+this.Img.Style+"HasSpace"+(row.Space==-1?"Above":(row.Space==5?"Below":row.Space));
return H;
}
// -----------------------------------------------------------------------------------------------------------
TGP.HideSpaceClass = function(row,ch){
if(!row.Space||row.Space==-1||row.Space==5) return;
for(var r=this.XS.firstChild,A=[],H=0;r;r=r.nextSibling) if(r.Space==row.Space&&(r.Visible&&!r.RelHidden||r==row)) { A[A.length] = r; if(ch) H += r.r1.parentNode.offsetHeight; }
if(this.HiddenBody){
   if(row.Space==1) { for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Space==2&&(r.Visible&&!r.RelHidden)) A[A.length] = r; }
   if(row.Space==2) { for(var r=this.XS.lastChild;r;r=r.previousSibling) if(r.Space==1&&(r.Visible&&!r.RelHidden)) A.unshift(r); }
   }
if(row==A[0] && A.length>1) A[1].r1.parentNode.className += " "+this.Img.Style+"RowSpaceFirst";
if(row==A[A.length-1] && A.length>1) A[A.length-2].r1.parentNode.className += " "+this.Img.Style+"RowSpaceLast";
if(ch) for(var i=0;i<A.length;i++) H -= A[i].r1.parentNode.offsetHeight;
if(row.Space==4 && A.length<=1) for(var i=this.FirstSec;i<=this.SecCount;i++){ var H = i==this.SecCount?this.ScrollDot:this.ScrollHorzParent[i]; if(H && H.firstChild.className.indexOf("HScrollSpace")>=0) H.firstChild.className = H.firstChild.className.replace(" "+this.Img.Style+"HScrollSpace",""); }
if(A.length==1) this.MainTable.className = this.MainTable.className.replace(new RegExp("\\s?\\w*HasSpace"+(row.Space==-1?"Above":(row.Space==5?"Below":row.Space))+"\\w*"),"");
return H;
}
// -----------------------------------------------------------------------------------------------------------
// Hides given row
// If del==true, deletes row from html table (when collapsing)
// If noshow = true, does not show changes => the re-render will be needed
TGP.HideRow = function(row,del,noshow,nohidden,undo){
if(!row.Visible) return;
row.Visible = 0;
if(row.MenuCheck!=null) row.MenuCheck = null;
if(!nohidden) row.Hidden = 1;
this.HideFRow();
if(!row.r1) noshow = 1;
if(row==this.ARow) { this.ARow = null; this.Event.Row = null; }

if(this.Selecting && !row.Space) {
   if(this.ClearSelected&4){
      this.ClearChildSelection(row); 
      if(row.Selected&this.SelAnd && this.CanSelect(row)) this.SelectRow(row,0,0,1);
      }
   if(this.SelectingCells>=3 && row.Selected&2 && !(this.SelectHidden&1)) this.SelectRange(row,this.GetFirstCol(null,null,2),row.lastChild?row.lastChild:row,this.GetLastCol(null,null,2),0);
   }

if(row.Fixed){
   if(noshow) return;
   if(row.Space) this.HideSpaceClass(row);
   else {
      if(row.Fixed=="Head") for(var r=row.previousSibling;r&&!r.Visible;r=r.previousSibling); else for(var r=row.nextSibling;r&&!r.Visible;r=r.nextSibling);
      if(!r){ 
         if(row.Fixed=="Foot") for(var r=row.previousSibling;r&&!r.Visible;r=r.previousSibling); else for(var r=row.nextSibling;r&&!r.Visible;r=r.nextSibling);
         var cls = this.MainTable.className, f = "Has"+row.Fixed;
         if(!r) this.MainTable.className = cls.replace(new RegExp("\\s?\\w*"+f+"\\w*"),"");
         else if(r.Kind!=row.Kind){
            if(r.Kind=="Header") this.MainTable.className = cls.replace(f,f+"er");
            else if(row.Kind=="Header") this.MainTable.className = cls.replace(f+"er",f);
            }
         }
      }
   if(row.Fixed=="Foot"){
      this.UpdateFootVisible();
      if(!this.FootVisible) this.TableHideFoot();
      else this.TableHideRow(row);              
      }
   else this.TableHideRow(row);
   this.Update();
   return;
   }

var par = row.parentNode;
MS.Paging;
if(par.Page && !this.HasChildren(par)){
   var n = par.previousSibling; if(!n || (n.State<2 && par.nextSibling)) n = par.nextSibling;
   if(!n && this.AutoPages) { this.AddAutoPages(); n = par.nextSibling; }
   if(n){
        if(n.State<2) { 
         var T = this; row.Visible = 1; if(n.State==0) { n.State=1; T.StartPage(n,1); }
         setTimeout(function(){ T.HideRow(row,del,noshow); if(del==2) T.DelRow(row);},200); 
         return -1; 
         }
      if(this.AllPages) {
         if(row.Hasch) this.DeleteChildren(row); 
         this.TableDelRow(row);    
         }
      else if(n==par.nextSibling) this.FPage--;
      this.DelEmptyPage(par,undo);
      if(!this.AllPages) this.GoToPage(n);
      this.UpdateRowIcons(row,!noshow);

      return;
      }
   }
ME.Paging;

this.UpdateRowIcons(row,!noshow);
if(noshow) return;

if(par.Expanded && !this.HasChildren(par) && !par.Hasch && this.TableCollapse) this.TableCollapse(par,1);
if(del<0||this.HideParents&&!del){
   if(!(row.Expanded&2) && row.firstChild) {
      row.Expanded |= 2;
      this.UpdateChildrenLevelImg(row,1,1);
      if(!this.HideTree) this.SetWidth(this.MainCol,0,1,row);
      }
   this.TableHideRow(row);
   }
else if(del) { 
   if(row.Hasch) this.DeleteChildren(row); 
   this.TableDelRow(row,null,1); 
   if(row.Expanded&2){ var r = this.GetPrevSiblingVisible(row); if(r) { this.UpdateLevelImg(r); this.UpdateIcon(r); } } 
   }
else {
   if(row.Hasch && !(row.Expanded&2)) this.TableCollapse(row,1);
   this.TableHideRow(row);
   }
this.Update();
if(par.Page) this.UpdateEmptyRows();
}
// -----------------------------------------------------------------------------------------------------------
ME.Show;
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateFootVisible = function(){
this.FootVisible = 0; for(var r=this.XF.firstChild;r;r=r.nextSibling) if(r.Visible) { this.FootVisible = 1; break; }
}
// -----------------------------------------------------------------------------------------------------------
// Hides the focused rows
TGP.ActionHideRows = function(F,T){
MS.Show;
if(this.Locked["hiderow"]) return false;
var A = [], R = this.GetARows(F); if(!R) return false;
for(var r in R) if(R[r].Visible&&Get(R[r],"CanHide")) A[A.length] = R[r];
if(!A.length) return false;
if(T) return A.length;
if(Grids.OnRowShow) for(var i=0,B=A,A=[];i<B.length;i++) if(!Grids.OnRowShow(this,A[i],1)) A[A.length] = B[i];
this.StartUpdate();
this.HideFRow(A);
for(var i=0;i<A.length;i++) {
   if(this.Undo&8) this.AddUndo({Type:"Hide",Row:A[i]});
   this.HideRow(A[i],null,null,null,this.Undo&8);
   }
this.EndUpdate(A.length==1?A[0]:null);
this.CalcTreeWidth();
MS.Animate; this.AnimRows(A,"HideRows",!this.HideParents); ME.Animate;
return true;
ME.Show;
}
// -----------------------------------------------------------------------------------------------------------
// Shows the row above active or focused row
TGP.ActionShowRowAbove = function(F,T,below){
MS.Show;
var row = this.GetARow(F); if(!row||row.Space || this.Locked["hiderow"]) return false;
var r = below ? this.GetNext(row):this.GetPrev(row); if(!r||r.Visible||r.Filtered||!Get(r,"CanHide")) return false;
if(T) return true;
if(Grids.OnRowShow && Grids.OnRowShow(this,r,0)) return false;
if(this.Undo&8) this.AddUndo({Type:"Show",Row:r});
this.ShowRow(r);
this.CalcTreeWidth();
MS.Animate; this.AnimRow(r,"Show",!this.HideParents); ME.Animate;
return true;
ME.Show;
}
TGP.ActionShowRowBelow = function(F,T){ return this.ActionShowRowAbove(F,T,1); }
// -----------------------------------------------------------------------------------------------------------
// Shows all the hidden rows in actual range
TGP.ActionShowRows = function(F,T){
MS.Show;
if(this.Locked["hiderow"]) return false;
var A = [], R = this.GetARows(F); if(!R) return false;
for(var r in R) if(!R[r].Visible&&!R[r].Filtered&&Get(R[r],"CanHide")) A[A.length] = R[r];
if(!A.length) return false;
if(T) return A.length;
this.StartUpdate();
for(var i=0;i<A.length;i++) {
   if(Grids.OnRowShow && Grids.OnRowShow(this,A[i],0)) continue;
   if(this.Undo&8) this.AddUndo({Type:"Show",Row:A[i]});
   this.ShowRow(A[i]);
   }
this.EndUpdate(A.length==1?A[0]:null);
this.CalcTreeWidth();
MS.Animate; this.AnimRows(A,"ShowRows",!this.HideParents); ME.Animate;
return true;
ME.Show;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionShowAllRows = function(F,T){ return this.ActionShowRows(F?F|32:32,T); }
TGP.ActionHideRow = function(F,T) { return this.ActionHideRows(F?F|64:64,T); }
TGP.ActionHideSelectedRows = function(F,T){ return this.ActionHideRows(F?F|2:2,T); }
// -----------------------------------------------------------------------------------------------------------

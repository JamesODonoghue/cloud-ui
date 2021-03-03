// -----------------------------------------------------------------------------------------------------------
// Functions for Image and Link in cell
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSetLink = function(){ return 0; } 
TGP.ActionOpenImage = function(){ return 0; }

var CRegSheetLink = /^([^!]+!)?([a-zA-z]+)(\d+)$/;
// -----------------------------------------------------------------------------------------------------------
// Navigates to Link
TGP.ActionShowLink = function(F,T,whole){
var A = this.GetACell(F); if(!A) return false; 
var row = A[0], col = A[1], t = null;

MS.RowSpan; if(row.RowSpan) row = this.GetSpanRow(row,col,0); ME.RowSpan;
if(!whole&&A[2]==4) for(var t=this.MouseEvent.target,E=this.EditMode?this.Edit.Tag:this.GetCell(row,col).parentNode,D=document.documentElement;t&&(!t.href||t.nodeName!="A");t=t.parentNode) if(t==E||t==D) return false;
if(!t){
   var E = this.GetCell(row,col), A = E ? E.getElementsByTagName("a") : [];
   for(var i=0;i<A.length;i++) if(A[i].href) { t = A[i]; break; }
   if(!t) return false;
   }
if(this.Locked["link"]){
   if(!T) CancelEvent(this.MouseEvent);
   return false;
   }
if(this.GetType(row,col)=="Pages") return false;
if(T) return true;
if(this.EditMode && this.EndEdit(1)==-1) return false;

var href = t.getAttribute?t.getAttribute("href"):t.href;

var target = t.target ? t.target : this.GetAttr(row,col,"LinkTarget");
if(Grids.OnLinkClick && Grids.OnLinkClick(this,row,col,href,target)) return true;
if(this.RowIndex&&this.ColIndex&&href.search(CRegSheetLink)>=0){
   var M = href.match(CRegSheetLink);
   if(M&&M[1]){
      var OR = Grids.OnReady; 
      Grids.OnReady = function(G){
         G.Focused = M[3];
         G.FocusedCol = M[2];
         Grids.OnReady = OR;
         if(OR) OR(G);
         }
      this.LoadSheet(M[1].match(/^'?([^'!]+)'?!$/)[1],1);
      }
   else if(M) this.Focus(this.GetRowByIndex(M[3],1),this.GetColByIndex(M[2],1));
   return true;
   }
if(Try) { 
   if(href.search(/^\s*javascript:/i)<0) window.open(href,target); 
   else if(!this.NoLinkJavaScript) new Function(href.replace(/^\s*javascript:\/*/i,"")).bind(t)();
   CancelEvent(this.MouseEvent); 
   }
else if(Catch) { }
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionShowCellLink = function(F,T){ return this.ActionShowLink(F,T,1); }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionCancelLink = function(dummy,T){ return !T&&this.MouseEvent ? (CancelEvent(this.MouseEvent,2),true) : false; }
TGP.ActionCancelLinkEdit = function(dummy,T){ return !T&&this.MouseEvent && this.ARow && this.ACol && this.CanEdit(this.ARow,this.ACol) ? (CancelEvent(this.MouseEvent,2),true) : false; }
// -----------------------------------------------------------------------------------------------------------




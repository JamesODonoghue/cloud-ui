// -----------------------------------------------------------------------------------------------------------
TGP.CanEditBorder = function(row,col){ 
if(!this.DynamicBorder) return false;
if(this.Edit) return this.Edit.Html;
var C = this.Cols[col?col:this.FCol]; if(C&&(C.NoBorder>1||this.DynamicBorder==1&&C.MainSec!=1)) return false;
if(!row) row = this.FRow; if(!row||row.Page) return false;
if((row.NoBorder==null?row.Def.NoBorder:row.NoBorder)>1||this.DynamicBorder==1&&row.Fixed) return false;
return true;
}
// -----------------------------------------------------------------------------------------------------------


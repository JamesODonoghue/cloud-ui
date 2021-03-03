// -----------------------------------------------------------------------------------------------------------
TGP.CanEditStyle = function(row,col){ 
if(!this.DynamicStyle) return false;
if(this.Edit) return this.Edit.Html;
var C = this.Cols[col?col:this.FCol]; if(C&&(C.NoStyle>1||this.DynamicStyle==1&&C.MainSec!=1)) return false;
if(!row) row = this.FRow; if(!row||row.Page) return false;
if((row.NoStyle==null?row.Def.NoStyle:row.NoStyle)>1||this.DynamicStyle==1&&row.Fixed) return false;
return true;
}
// -----------------------------------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------------------------------
// Changes value in cell of bool type
MS.Bool;
TGP.ChangeBool = function(row,col,val){

if(Grids.OnValueChanged) { var tmp = Grids.OnValueChanged(this,row,col,val,Get(row,col)); if(tmp!=null) val = tmp; }
if(this.SetValue(row,col,val)){
   if(Grids.OnAfterValueChanged) Grids.OnAfterValueChanged(this,row,col,Get(row,col));
   if(this.ColorState&2) this.ColorRow(row); 
   this.RefreshCellAnimate(row,col,"Edit",1);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetBool = function(row,col,set,test){
if(!row || !col) return false;
MS.RowSpan; if(row.RowSpan) row = this.GetSpanRow(row,col,0); ME.RowSpan;
if(this.GetType(row,col)!="Bool" || this.CanEdit(row,col)!=1) return false;
var val = Get(row,col); if(set!=null && val+""==set+"") return false;
var emp = this.GetAttr(row,col,"CanEmpty");
if(emp){
   if(set!=null) val = set;
   else if(val) val = emp==2?"":0;
   else if(val=="0") val = emp==1?"":1;
   else val = emp==1||emp==3?1:0;
   if(set!=null && set+""!=val) return false;
   }
else {   
   if(set!=null && set==="") return false;
   val = val?0:1;
   var group = this.GetAttr(row,col,"BoolGroup");
   if(group){
      if(!val && this.GetAttr(row,col,"Uncheck")==0) return false;
      if(test) return true;
      if(val) for(var r=this.GetFirst();r;r=this.GetNext(r)) if(this.GetAttr(r,col,"BoolGroup")==group && Get(r,col)==1) this.ChangeBool(r,col,0);
      }
   else {
      var group = this.GetAttr(row,col,"Radio"); 
      if(group){
         if(!val && this.GetAttr(row,col,"Uncheck")==0) return false;
         if(test) return true;
         if(val) {
            if(row.Space) for(var i=0;i<row.Cells.length;i++) { var c = row.Cells[i]; if(this.GetAttr(row,c,"Radio")==group && Get(row,c)==1) this.ChangeBool(row,c,0); }
            else for(var c in this.Cols) if(this.GetAttr(row,c,"Radio")==group && Get(row,c)==1) this.ChangeBool(row,c,0);
            }
         }
      }   
   }   
if(test) return true;
this.ChangeBool(row,col,val);
MS.Filter;
if(row.Kind=="Filter") {
   var fof = this.GetAttr(row,col,"FilterOff");
   if(emp && fof===val){
      if(row[col+"Filter"]) this.SetFilterOp(row,col,0);
      }
   else this.DoFilter(row,col);
   }
ME.Filter;   
return true;
}
// -----------------------------------------------------------------------------------------------------------
// Changes value in cell of bool type
TGP.ActionChangeBool = function(F,T){ var A = this.GetACell(F); return A ? this.SetBool(A[0],A[1],null,T) : false; }
TGP.ActionCheckBool = function(F,T){ var A = this.GetACell(F); return A ? this.SetBool(A[0],A[1],1,T) : false; }
TGP.ActionUncheckBool = function(F,T){ var A = this.GetACell(F); return A ? this.SetBool(A[0],A[1],0,T) : false; }
TGP.ActionClearBool = function(F,T){  var A = this.GetACell(F); return A ? this.SetBool(A[0],A[1],"",T) : false; }
ME.Bool;
// -----------------------------------------------------------------------------------------------------------
MS.Radio;
// -----------------------------------------------------------------------------------------------------------
TGP.ActionChangeRadioLeft = function(F,T){ return this.ChangeRadioDir(F,T,1); }
TGP.ActionChangeRadioLeftCycle = function(F,T){ return this.ChangeRadioDir(F,T,1,1); }
TGP.ActionChangeRadioRight = function(F,T){ return this.ChangeRadioDir(F,T,0); }
TGP.ActionChangeRadioRightCycle = function(F,T){ return this.ChangeRadioDir(F,T,0,1); }
TGP.ChangeRadioDir = function(F,T,shift,cycle){
var A = this.GetACell(F); if(!A) return false; 
var row = A[0], col = A[1];
MS.RowSpan; if(row.RowSpan) row = this.GetSpanRow(row,col,0); ME.RowSpan;
if(this.GetType(row,col)!="Radio" || this.CanEdit(row,col)!=1 || this.IsRange(row,col)) return false;
var rp = this.GetRelatedPrefix(row,col);
var ena = this.GetEnum(row,col,"Enum",rp);
if(!ena) return false;
var en = ena.slice(1).split(ena.charAt(0)); 
var ek = this.GetEnum(row,col,"EnumKeys",rp); if(ek) ek = ek.slice(1).split(ek.charAt(0));
var val = Get(row,col); 
if(!ek && this.IsIndexEnum(val,0,ena)) {
   if(!val) val = shift ? en.length : -1;
   shift ? val-- : val++;
   if(val<0 || val>=en.length) return false;
   }
else {
   if(!ek) ek = en;
   if(!val) val = shift ? ek[ek.length-1] : ek[0];
   else for(var i=0;i<ek.length;i++) if(ek[i]==val){ 
      shift?i--:i++;
      if(i<0 || i>=en.length) {
         if(!cycle) return false;
         if(this.GetAttr(row,col,"RadioUncheck")==1) val = "";
         else val = shift ? ek[ek.length-1] : ek[0];
         break;
         }
      val = ek[i]; 
      break; 
      }
   }
if(T) return true;
this.FinishEdit(row,col,val);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionChangeRadio = function(){
var E = this.Event; if(!E.Special) return false;
var val = E.Special.replace("Radio","");
if(!(val-0)) return false; 
var row = this.ARow, col = this.ACol;
MS.RowSpan; if(row.RowSpan) row = this.GetSpanRow(row,col,0); ME.RowSpan;
var old = Get(row,col), range = this.IsRange(row,col);
var rp = this.GetRelatedPrefix(row,col);
var ena = this.GetEnum(row,col,"Enum",rp);
if(!ena) return false;
var en = ena.split(ena.charAt(0));
var ek = this.GetEnum(row,col,"EnumKeys",rp); if(ek) ek = ek.split(ek.charAt(0));
if(!ek && !this.IsIndexEnum(old,range,ena)) ek = en;
if(ek) val = ek[val]; else val--;
var foff = row.Kind=="Filter" && (this.GetAttr(row,col,"FilterOff")==val || val==null);
if(foff) val = "";
else if(range){
   var sep = this.Lang.Format.ValueSeparator;
   if(old!=="" && old!=null) { 
      old = (old+"").split(sep); 
      if(ek){
         var o = {};
         for(var i=0;i<old.length;i++) o[old[i]] = i;
         if(o[val]!=null) old.splice(o[val],1); 
         else { 
            o[val] = 1;
            old.length = 0;
            for(var i=0;i<ek.length;i++) if(o[ek[i]]!=null) old[old.length] = ek[i];
            }
         }
      else {
         old[old.length] = val;
         old.sort(function(a,b){ return a-0<b-0 ? -1 : a-0>b-0 ? 1 : 0; });
         }         
      val = old.join(sep);         
      }
   
   }
else if(val==old && this.GetAttr(row,col,"RadioUncheck")) val = "";
this.FinishEdit(row,col,val,foff);
return true;
}
// -----------------------------------------------------------------------------------------------------------
ME.Radio;
// -----------------------------------------------------------------------------------------------------------
MS.Edit;
// -----------------------------------------------------------------------------------------------------------
TGP.ResetChecked = function(row,col){
var cc = col+"Checked", vv = null;
if(!row){
   for(var r=this.GetFirst();r;r=this.GetNextSibling(r)){
      var v = Get(r,cc);
      if(v==null) { this.ResetChecked(r,col); v = Get(r,cc); }
      if(vv==null) vv = v;
      else if(vv!=v) vv = 2;
      }
   var F = this.GetFixedRows(), FF = [];
   for(var i=0;i<F.length;i++) {
      var v = Get(F[i],cc);
      if(v-0||v=="0"||(F[i].Kind=="Header"?Get(F[i],col+"Icon"):this.GetAttr(F[i],col,"Icon"))=="Check") {
         if(this.Rendering || this.Loading) F[i][cc] = vv; 
         else {
            if(this.Cols[cc]) this.SetValue(F[i],cc,vv,1); else F[i][cc] = vv; 
            this.RefreshCell(F[i],col);
            }
         }
      }
   return;
   }

for(var r=row.firstChild;r;r=r.nextSibling){
   var v = Get(r,cc);
   if(v==null) { this.ResetChecked(r,col); v = Get(r,cc); }
   if(vv==null) vv = v;
   else if(vv!=v) vv = 2;
   }
if(vv==null) vv = 0;
if(this.Rendering || this.Loading) row[cc] = vv; 
else {
   if(this.Cols[cc]) this.SetValue(row,cc,vv,1); else row[cc] = vv; 
   this.RefreshCell(row,col);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetChecked = function(row,col,val,recur){
var cc = col+"Checked", has = this.Cols[cc];
if(has && !recur) this.StartUpdate();
if(!row) {
   var F = this.GetFixedRows();
   for(var i=0;i<F.length;i++) {
      var v = Get(F[i],cc);
      if(v-0||v=="0") {
         if(val==null)  val = v ? 0 : 1;  
         this.SetChecked(F[i],col,val,1);
         }
      }
   for(var r=this.GetFirst();r;r=this.GetNext(r)) { 
      if(has && this.GetAttr(r,col,"Icon")=="Check") this.SetValue(r,cc,val,1); else r[cc] = val; 
      this.RefreshCell(r,col);
      }
   }
else {
   if(val==null) val = Get(row,cc) ? 0 : 1;  
   if(has && this.GetAttr(row,col,"Icon")=="Check") this.SetValue(row,cc,val,1); else row[cc] = val; 
   this.RefreshCell(row,col);
   if(!recur) for(var r=row.Fixed?this.GetFirst():this.GetNext(row),lev=row.Level==null?-1:row.Level;r&&r.Level>lev;r=this.GetNext(r)) { 
      if(has && this.GetAttr(r,col,"Icon")=="Check") this.SetValue(r,cc,val,1); else r[cc] = val; 
      this.RefreshCell(r,col);
      }
   if(row.Level>0) { 
      for(var p=row.parentNode,r=p.firstChild;r;r=r.nextSibling){ var v = Get(r,cc); if((v?v:0)!=val) break; }; 
      var ov = Get(p,cc), vv = r ? 2 : val;
      if(ov!=vv) this.SetChecked(p,col,vv,1);
      }
   else if(row.Level==0){
      var F = this.GetFixedRows(), FF = [];
      for(var i=0;i<F.length;i++) {
         var v = Get(F[i],cc);
         if(v-0||v=="0") FF[FF.length] = F[i];
         }
      if(FF.length){
         for(var r=this.GetFirst();r;r=this.GetNextSibling(r)){ var v = Get(r,cc); if((v?v:0)!=val) break; }; 
         var ov = Get(FF[0],cc), vv = r ? 2 : val;
         if(ov!=vv) { for(var i=0;i<FF.length;i++) this.SetChecked(FF[i],col,vv,1); }
         }
      }
   }
if(has && !recur) this.EndUpdate();
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSetChecked = function(F,T,set){
var A = this.GetACell(F); if(!A) return false; 
var row = A[0], col = A[1];
MS.RowSpan; if(row.RowSpan) row = this.GetSpanRow(row,col,0); ME.RowSpan;
var val = Get(row,col+"Checked"); if(this.GetAttr(row,col,"Icon")!="Check"&&this.GetAttr(row,col,"Button")!="Check" || set!=null&&val==set) return false;
if(T) return true;
this.SetChecked(row,col,set);
return true;
}
TGP.ActionCheckIcon = function(F,T){ return this.ActionSetChecked(F,T,1); }
TGP.ActionUncheckIcon = function(F,T){ return this.ActionSetChecked(F,T,0); }
// -----------------------------------------------------------------------------------------------------------
ME.Edit;

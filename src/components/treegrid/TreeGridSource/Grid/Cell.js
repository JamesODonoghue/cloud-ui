// -----------------------------------------------------------------------------------------------------------
// Functions for cell manipulation
// -----------------------------------------------------------------------------------------------------------
var CEditAttrs = ["","Value","Style","Formula","Empty"];   
var CSpecAttrs = {"":1,"EFormula":1,"Span":1,"RowSpan":1,"BorderTop":1,"BorderRight":1,"BorderBottom":1,"BorderLeft":1};
var CVisAttrs = {"BorderTop":1,"BorderRight":1,"BorderBottom":1,"BorderLeft":1,"Pattern":1,"Color":1}; 
var CStyleHeightAttrs = { "TextSize":1,"TextFont":1,"Rotate":1,"Wrap":1 }; 
var CNoFormatNames = {"Name":1,"Text":1,"Value":1,"Caption":1,"Items":1,"Level":1,"Menu":1,"Hidden":1} 
var CAttrsDef = {"RowSpan":1,"Span":1 }; 
var CBorder1px = {1:1,4:1,6:1}; 
TGP.FindFormat = function() { return ""; }

MS.MassChange;
// -----------------------------------------------------------------------------------------------------------
TGP.SetEditValue = function(row,col,val,refresh,E){

if(Grids.OnValueChanged) { var tmp = Grids.OnValueChanged(this,row,col,val,Get(row,col)); if(tmp!=null) val = tmp; } 
return this.SetValue(row,col,val,refresh);

}
// -----------------------------------------------------------------------------------------------------------
TGP.CheckMask = function(row,col,val,E){
if(!this.EditErrors) return val;
var size = this.GetAttr(row,col,"Size");
if(size && (val+"").length>size) {
   val = (val+"").slice(0,size);
   E.Changes.push([this.GetText("SizeChanged"),row,col]);
   }

MS.Enum;
var typ = this.GetType(row,col);
if(typ=="Enum") {
   var rp = this.GetRelatedPrefix(row,col), en = this.GetEnum(row,col,"Enum",rp), ek = this.GetEnum(row,col,"EnumKeys",rp);
   if(en) {
      var err = 0, sep = "\\"+en.charAt(0);
      if(this.IsRange(row,col)){
         var v = (val+"").split(this.Lang.Format.ValueSeparator);
         for(var i=0;i<v.length;i++) if(v[i]!==""){
            var reg = new RegExp(sep+ToRegExp(v[i])+"("+sep+"|$)");
            if(en.search(reg)<0 && (ek?ek.search(reg)<0:!this.IndexEnum||!(v[i]-0)&&v[i]!="0")){
               E.Errors.push([this.GetText("NotInList"),row,col,val]);
               return null; 
               }
            }
         }
      else {
         var reg = new RegExp(sep+ToRegExp(val)+"("+sep+"|$)");
         if(en.search(reg)<0 && (ek?ek.search(reg)<0:!this.IndexEnum||!(val-0)&&val!="0")){
            E.Errors.push([this.GetText("NotInList"),row,col,val]);
            return null; 
            }
         }
      
      }
   }
ME.Enum;

MS.EditMask;
var mask = this.GetAttr(row,col,"EditMask"); 
if(Try) { 
   if(mask && (val+"").search(new RegExp(mask,""))==-1) { 
      E.Errors.push([this.GetText("EditMaskError"),row,col,val]);
      return null; 
      }
   }
else if(Catch){ this.Debug(1,"Wrong edit mask in cell [",row.id,",",col,"]"); }

var mask = this.GetAttr(row,col,"ResultMask");
if(Try) { 
   if(mask && (val+"").search(new RegExp(mask,""))<0) {
      var ret = Grids.OnResultMask ? Grids.OnResultMask(this,row,col,val,E) : 0;
      if(!ret||ret<=2){
         var txt = this.GetAttr(row,col,"ResultMessage");
         if(!txt) txt = this.GetAttr(row,col,"ResultText");
         E.Errors.push([txt?txt:this.GetText("ResultText"),row,col,val]);
         return null;
         }
      if(ret==4){ var err = this.GetAttr(row,col,"ResultText"); row[col+"Error"] = err ? err : this.GetAlert("Invalid"); }
      }
   }
else if(Catch){ this.Debug(1,"Wrong result mask in cell [",row.id,",",col,"]"); }
ME.EditMask;

MS.Edit;
if(val||val=="0"){ 
   var def = row[col+"Suggest"]; if(def==null) def = row.Def[col+"Suggest"]; if(def==null&&!row.Space) def = this.Cols[col].Suggest; 
   if(Grids.OnGetSuggest) { var tmp = Grids.OnGetSuggest(this,row,col,def); if(tmp!=null) def = tmp; } 
   if(def) {
      var typ = row[col+"SuggestType"]; if(typ==null) typ = row.Def[col+"SuggestType"]; if(typ==null&&!row.Space) typ = this.Cols[col].SuggestType; 
      if(typ&&typ.search(/\bexisting\b/i)>=0){
         var ff = this.GetFormat(row,col,1), v = val;
         if(ff&&ff.charCodeAt(0)==123){ ff = FromJSON(ff,1); for(var vv in ff) if(ff[vv]==v) { v = vv; break; } } 
         var stype = this.ConvertFlags(typ,"replace,start,startall,empty,all,case,complete,existing,begin,search,separator,esc,arrows,whitechars,charcodes");
         var EF = {Suggest:def,SuggestExisting:stype["existing"],SuggestCase:stype["case"]};
         if(stype["whitechars"]) EF.SuggestWhiteChars = GetWhiteChars(this.GetAttr(row,col,"WhiteChars"));
         MS.CharCodes; if(stype["charcodes"]) EF.SuggestCharCodes = this.GetAttr(row,col,"CharCodes"); ME.CharCodes;
         var sep = this.GetAttr(row,col,"SuggestSeparator"), range = this.IsRange(row,col);
         if(sep==null && range) sep = this.Lang.Format.ValueSeparator;
         if(sep) sep = new RegExp(sep.length==1?ToRegExp(sep):sep,"g");
         EF.SuggestSeparator = sep;
         if(!TEdit.TestSuggestExisting(v,null,EF,this.Lang.Format.Digits ? this.GetAttr(row,col,"Digits") : null)) {
            E.Errors.push([this.GetText("NotInList"),row,col,val]);
            return null;
            }
         }
      }
   }
ME.Edit;
return val;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetErrors = function(name){ return { Errors:[], Changes:[], Action:name }; }
// -----------------------------------------------------------------------------------------------------------
TGP.ProcessErrors = function(E){
if(Grids.OnEditErrors && Grids.OnEditErrors(this,E) || this.EditErrors!=2&&(this.EditErrors!=3||this.Loading)) return;
var err = E.Errors, chg = E.Changes, errlen = err.length, txt = "", max = this.EditErrorsMessageMax, more = 0;
if(max=="0") return;
if(!max) max = 1e12;
err = err.concat(chg);
for(var i=0;i<err.length;i++) if(err[i]) {
   var e = err[i]; if(typeof(e)!="object") e = [e];
   if(!e[0]) continue
   if(!max) { more++; continue; }
   var e3 = e[3]; if(!e3&&e3!="0") e3 = this.GetText("EmptyValue"); else if((e3+"").length>50) e3 = e3.slice(0,50)+"...";
   var n = e[1]&&e[2]?this.GetCellName(e[1],e[2]):"";
   txt += this.GetText((i<errlen?"EditErrorsMessage":"EditChangesMessage")+(n?"Cell":"")).replace("%1",e[0].replace("%1",e3)).replace("%2",n); 
   max--;
   }
if(more) txt += this.GetText("EditErrorsMessageMore").replace("%1",more);
if(txt && E.Action!="Validate") this.ShowMessageTime(txt,E.MessageTime==null?this.EditErrorsMessageTime:E.MessageTime);
return txt;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetEditAttrs = function(r,c,v,A,V,E,nocheck,test,anim,nocanedit,type){
var chg = 0, av = A.Value, af = A.Formula;
var setval = (av&&(!this.FormulaEditing||af||!r[c+"EFormula"]) || af&&(r[c+"EFormula"]||typeof(v)=="string"&&v.indexOf(this.Lang.Format.FormulaPrefix)==0)) && (r.NoData==null ? !r.Def.NoData : !r.NoData)&&!this.Cols[c].NoData; 
if(setval && v==null) {
   if(r.Def[c]!=null) v = r.Def[c];
   else {
      if(!type) type = this.GetType(r,c);
      v = av ? (CAlignRight[type] && !this.GetAttr(r,c,"CanEmpty") ? 0 : "") : (test ? Get(r,c) : this.GetValue(r,c));
      }
   }
if(!nocheck&&!nocanedit){
   if(A.CanEdit) { var ce = r[c+"CanEdit"]; if(r[c+"CanEdit"]==0) r[c+"CanEdit"] = null; }
   if(!type) type = this.GetType(r,c);
   var no = this.CanEdit(r,c,setval?0:1,type)!=1 && (type!="File"||av&&v);
   if(no){ 
      var def = this.InDefaults(r,c,av?v:Get(r,c),A.Defaults?V[A.Defaults]:null,A.Range?V[A.Range]:null); 
      if(def) no = 0;
      else if(!test&&(c!="id"||this.GanttDependency==null)&&(A.length>1||!setval||v!=Get(r,c))) E.Errors.push([this.GetText(def==null?"CannotEdit":"NotInList"),r,c,def==null?null:v]);
      }
   if(A.CanEdit && r[c+"CanEdit"]!=ce) {
      if(test) return true;
      chg = 1;
      r[c+"CanEdit"] = ce;
      }
   if(no) return 0;
   }
if(Grids.OnEditAttrs){
   var o = Get(r,c); if(this.FormulaEditing && r[c+"EFormula"]) o = this.Lang.Format.FormulaPrefix+r[c+"EFormula"];
   var B = A.slice(); for(var a in A) B[a] = A[a];
   A = B;
   // = this.GetEditAttrs(0); // Nacita znovu protoze ho lze modifikovat
   var nv = Grids.OnEditAttrs(this,r,c,v,o,V,A,E,test);
   if(nv!=null){
      if(nv===o) { av = 0; af = 0; }
      else v = nv;
      }
   }
var AO = [], AA = [], AV = [], D = r.Def, C = this.Cols[c];
if(A.Span||A.RowSpan){
   if(r[c+"Span"]>1&&r[c+"RowSpan"]!=0&&r[c+"Visible"]!=-2||r[c+"RowSpan"]>1&&r[c+"Span"]!=0) {
      if(test) return true;
      chg = 1;
      this.SplitSpanned(r,c);
      }
   var rs = V[A.RowSpan], cs = V[A.Span]; if(rs==null) rs = 1; if(cs==null) cs = 1; 
   if(rs>=1&&cs>=1){
      for(var r2=r;rs>1&&r2;rs--) r2 = this.GetNextSibling(r2);
      if(!r2) r2 = this.GetLast();
      for(var c2=c;cs>1&&c2;cs--) c2 = this.GetNextCol(c2,null,2);
      if(!c2) c2 = this.GetLastCol(null,2);
      if(r!=r2||c!=c2) {
         if(test) return true;
         chg = 1;
         this.SpanRange(r,c,r2,c2);
         }
      }
   }



for(var i=0,k=0;i<A.length;i++) if(!CSpecAttrs[A[i]]){
   var z = V[i], a = A[i]; 
   if(D[c+a]!=null) { if(D[c+a]==z) z = null; }
   else if(r[a]!=null) { if(r[a]==z) z = null; else if(z==null) z = D[c+a]!=null ? D[c+a] : D[a]!=null ? D[a] : r[a]=="" ? null : ""; }
   else if(D[a]!=null) { if(D[a]==z) z = null; }
   else if(C[a]!=null) { if(C[a]==z) z = null; else if(z==null) z = D[c+a]!=null ? D[c+a] : D[a]!=null ? D[a] : C[a]==""||a=="Type" ? null : ""; }
   if(r[c+a]!=z){
      if(test) return true;
      AV[k] = z; AO[k] = r[c+a]; AA[k++] = a; r[c+a] = z; chg = 1; 
      }
   }
if(setval){ 
   var fp = this.FormulaEditing && this.GetAttr(r,c,"FormulaCanEdit",1,1) ? this.Lang.Format.FormulaPrefix : null, ef = fp ? r[c+"EFormula"] : null;
   if(fp && (v+"").indexOf(fp)==0){ 
      var vv = v.slice(fp.length);
      if(!this.FormulaLocal) vv = this.ConvertEditFormula(r,c,vv,2);
      if(ef==vv) setval = 0;
      }
   else if(!ef) {
      var val = r[c]; if(val==null) val = D[c];
      if(v==val && (v&&v+""==val+"" || v===val) && (v || isNaN(v) || !isNaN(val) || val==null)) setval = 0; 
      }
   }
if(test) return setval||chg;
if(setval){ 
   var err = r[c+"Error"]; r[c+"Error"] = ""; if(!err) err = "";
   
   if(!type) type = this.GetType(r,c);
   if(type=="Text"){
      var ef = this.GetFormat(r,c,1);
      if(ef) {
         var fflags = this.GetFlags(r,c,"EditFormatType","case,whitechars,charcodes");
         v = this.Lang.Format.StringToValue(v,type,ef,this.IsRange(r,c),0,null,fflags["case"],fflags["whitechars"]?GetWhiteChars(this.GetAttr(r,c,"WhiteChars")):null,fflags["charcodes"]?this.GetAttr(r,c,"CharCodes"):null,this.Lang.Format.Digits?this.GetAttr(r,c,"Digits"):null);
         }
      }
   var ok = 1;
   if(!nocheck) { v = this.CheckMask(r,c,v,E); if(v==null) ok = 0; }
   
    
   if(!ok){
      for(var i=0;i<AA.length;i++) r[c+AA[i]] = AO[i]; 
      if(err&&!r[c+"Error"]) r[c+"Error"] = err; 
      return 0; 
      }
   if(this.SetEditValue(r,c,v,anim?anim:1,E)) {
      chg = 1;
      if(Grids.OnAfterValueChanged) Grids.OnAfterValueChanged(this,r,c,Get(r,c));
      this.RefreshEnum(r,c,anim);
      }
   else {
      if(err&&!r[c+"Error"]) r[c+"Error"] = err;
      if(A.length) this.RefreshCell(r,c);
      }
   MS.Undo; if(this.Undo&1 && err!=r[c+"Error"]) this.AddUndo({Type:"Error",Row:r,Col:c,OldVal:err,NewVal:r[c+"Error"]},2); ME.Undo;
   }
else {
   if((A.EditMask||A.ResultMask||A.Size||A.Enum||A.Suggest)&&!nocheck){
      var ov = this.GetValue(r,c); v = this.CheckMask(r,c,ov,E); 
      if(v!=ov) {
         for(var i=0;i<AA.length;i++) r[c+AA[i]] = AO[i]; 
         return 0;
         }
      }
   if(chg) this.RefreshCellAnimate(r,c,anim?anim:"");
   }
MS.Undo; if(this.Undo&1 && AA.length) this.AddUndo({Type:"EditAttrs",Row:r,Col:c,Attrs:AA,Vals:AV,OldVals:AO}); ME.Undo;
return chg;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetRangeRC = function(F,R,C){
for(var row=F[0],nrow=this.GetNext(F[2],4);row&&row!=nrow;row=this.GetNext(row,4)) R[R.length] = row;
if(!row&&nrow){ R.length = 0; for(var row=F[0],nrow=this.GetPrev(F[2],4);row&&row!=nrow;row=this.GetPrev(row,4)) R[R.length] = row; } 
for(var col=F[1],ncol=this.GetNextCol(F[3],null,2);col&&col!=ncol;col=this.GetNextCol(col,null,2)) C[C.length] = col;
if(!col&&ncol){ C.length = 0; for(var col=F[1],ncol=this.GetPrevCol(F[3],null,2);col&&col!=ncol;col=this.GetPrevCol(col,null,2)) C[C.length] = col; } 
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetRangeValues = function(F,attrs){ 
var V = [], A = this.GetEditAttrs(0,attrs), R = [], C = []; this.GetRangeRC(F,R,C);
for(var ri=0;ri<R.length;ri++){
   var vv = []; V[ri] = vv;
   for(var ci=0;ci<C.length;ci++) {
      var v = []; vv[ci] = v;
      if(A.Value) v.Value = this.GetValue(R[ri],C[ci]);
      if(A.Formula && R[ri][C[ci]+"EFormula"]) v.Formula = [R[ri],C[ci],R[ri][C[ci]+"EFormula"]];
      for(var i=0;i<A.length;i++) v[i] = R[ri][C[ci]+A[i]];
      }
   }
return V;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetRangeValues = function(F,V,O,EE,attrs){ 
var A = this.GetEditAttrs(0,attrs), fp = this.Lang.Format.FormulaPrefix, OO = null, R = [], C = []; this.GetRangeRC(F,R,C);
if(O && A.Formula){
   var OR = [],  OC = []; this.GetRangeRC(O,OR,OC);
   OO = [OR[0].HasIndex,this.Cols[OC[0]].HasIndex,OR[OR.length-1].HasIndex,this.Cols[OC[OC.length-1]].HasIndex]; 
   }
this.StartUpdate();
var X = {}, E = EE ? EE : this.GetErrors(O?"Move":"Copy");
if(fp&&this.FormulaCircular&&A.Formula) for(var ri=0;ri<R.length;ri++) for(var ci=0;ci<C.length;ci++) if(R[ri][C[ci]+"EFormula"]) R[ri][C[ci]+"EFormula"] = "0"; 
for(var ri=0;ri<R.length&&ri<V.length;ri++){
   for(var ci=0,chg=0;ci<C.length&&ci<V[ri].length;ci++) {
      var v = V[ri][ci]; if(O) X[R[ri].id+":"+C[ci]] = 1;
      var val = v.Formula ? fp+this.MoveEditFormula(R[ri],C[ci],v.Formula[0],v.Formula[1],v.Formula[2],OO) : v.Value;
      chg += this.SetEditAttrs(R[ri],C[ci],val,A,v,E,null,null,"ChangeCells");
      }
   if(chg) this.UpdateRowHeight(R[ri]);
   }

if(O) this.ClearRange(O,X,E,attrs);
this.EndUpdate();
if(!EE) this.ProcessErrors(E);
}
// -----------------------------------------------------------------------------------------------------------
TGP.CopyRange = function(F,O,clear,E,attrs){ 
var V = this.GetRangeValues(O,attrs);
this.SetRangeValues(F,V,clear?O:null,E,attrs);
}
// -----------------------------------------------------------------------------------------------------------
TGP.FillRange = function(N,O,type,EE){ 
var rdir,r1,r2,ro,cdir,c1,c2,co; if(type==null) type = this.AutoFillType;
if(O[0]==O[2]&&O[0].RowSpan&&O[0][O[1]+"RowSpan"]>1) O[2] = this.GetLastSpanRow(O[0],O[1]);
if(O[1]==O[3]&&O[2].Spanned&&O[2][O[1]+"Span"]>1) O[3] = this.GetLastSpanCol(O[2],O[1]);
if(O[0]==N[0]){ r1 = N[0]; r2 = N[2]; ro = O[2]; rdir = 0; }
else { r1 = N[2]; r2 = N[0]; ro = O[0]; rdir = 1; }
if(O[1]==N[1]){ c1 = N[1]; c2 = N[3]; co = O[3]; cdir = 0; }
else { c1 = N[3]; c2 = N[1]; co = O[1]; cdir = 1; }

for(var r=r1,ri=0,R=[],orig=1,rn=0,ra=0;r;r=rdir?this.GetPrevVisible(r,1):this.GetNextVisible(r,5),ri++){
   R[R.length] = r;
   if(r==ro) { rn = R.length; if(ra) break; }
   if(r==r2) { ra = R.length; if(rn) break; }
   }
for(var c=c1,ci=0,C=[],cn=0,ca=0;c;c=cdir?this.GetPrevCol(c):this.GetNextCol(c),ci++){
   C[C.length] = c;
   if(c==co) { cn = C.length; if(ca) break; }
   if(c==c2) { ca = C.length; if(cn) break; }
   }
if(ra<rn&&ca>cn||ra>rn&&ca<cn) ca = cn; 

var A = this.GetEditAttrs(0), fp = A.Formula ? this.Lang.Format.FormulaPrefix : null;
var V = [], AV = [], al = A.length;
for(var ri=0;ri<rn;ri++){
   var vr = [], avr = []; V[ri] = vr; AV[ri] = avr;
   for(var ci=0;ci<cn;ci++) {
      vr[ci] = this.GetValue(R[ri],C[ci]);
      if(fp) { var f = R[ri][C[ci]+"EFormula"]; if(f) vr[ci] = fp+f; } 
      if(al){
         var r = R[ri], c = C[ci], CC = this.Cols[c], v = []; avr[ci] = v;
         
         for(var i=0;i<al;i++) { var a = A[i], z = r[c+a]; if(z==null) z = r.Def[c+a]; if(z==null) z = r[a]; if(z==null) z = r.Def[a]; if(z==null) z = CC[a]; v[i] = z; }
         }
      }
   }

var vert = cn==ca, copy = type&1;
var VV = []; for(var ri=0;ri<rn;ri++) VV[ri] = [];
if(type&2 && (cn==ca && (rn>1||type&8)) || (rn==ra&&(cn>1||type&8))){
   var type16 = type&16, type8 = type&8, kn = vert ? cn : rn, ln = vert ? rn : cn;
   for(var k=0;k<kn;k++){
      var Q = {};
      for(var l=0;l<ln;l++) {
         var v = vert ? V[l][k] : V[k][l], s = null;
         if(v-0||v=="0") { s = v-0; v = ""; }
         else if(v&&type16){
            var p = v.search(/\d+$/); 
            if(p>=0) { s = v.slice(p)-0; v = v.slice(0,p); }
            }
         if(s!=null){ 
            if(!Q[v]) Q[v] = [l,s];
            else Q[v].push(l,s);
            }
         }
      var W = [];
      for(var v in Q){
         var q = Q[v];
         if(q.length>2) {
            var d = q[3] - q[1];
            for(var i=4;i<q.length;i+=2) if(q[i+1]-q[i-1]!=d) { d = 0; break; }
            if(d!=0) { d *= q.length/2; for(var i=0;i<q.length;i+=2) VV[vert?q[i]:k][vert?k:q[i]] = [v,q[i+1],d]; }
            }
         else if(type8) VV[vert?q[0]:k][vert?k:q[0]] = [v,q[1],1];
         }
      }
   }

for(var ri=0;ri<ra;ri++){
   for(var ci=0;ci<ca;ci++){
      if(ri<rn&&ci<cn) continue;
      var val;
      if(fp&&(V[ri%rn][ci%cn]+"").indexOf(fp)==0) val = fp+this.MoveEditFormula(R[ri],C[ci],R[ri%rn],C[ci%cn],V[ri%rn][ci%cn].slice(fp.length),null);
      else {
         var q = VV[ri%rn][ci%cn];
         if(q==null) val = copy ? V[ri%rn][ci%cn] : null;
         else val = q[0]+(q[1]+q[2]*Math.floor(vert?ri/rn:ci/cn));
         }
      if(!V[ri]) V[ri] = [];
      V[ri][ci] = val;
      if(al&&copy){
         if(!AV[ri]) AV[ri] = [];
         AV[ri][ci] = AV[ri%rn][ci%cn];
         }
      }
   }

if(Grids.OnAutoFillValues && Grids.OnAutoFillValues(this,V,R,C,rn,cn,ra,ca,rdir,cdir)) return true;
if(Grids.OnAutoFill && Grids.OnAutoFill(this,r1,c1,r2,c2,rdir,cdir,ro,co)) return true;
this.StartUpdate();
var doclr = type&4 && (ra<rn||ca<cn);

if(fp&&this.FormulaCircular) for(var ri=0;ri<ra;ri++) for(var ci=0;ci<ca;ci++) if((ri>=rn||ci>=cn)&&R[ri][C[ci]+"EFormula"]) {
   MS.Undo; this.AddUndo({Type:"EFormula",Row:R[ri],Col:C[ci],NewVal:0,OldVal:R[ri][C[ci]+"EFormula"],RowChanged:R[ri].Changed,CellChanged:R[ri][C[ci]+"Changed"]}); ME.Undo;
   R[ri][C[ci]+"EFormula"] = "0"; 
   }
   
var E = EE ? EE : this.GetErrors("Fill");
for(var ri=0,prev=null,rr=ra>rn?ra:rn,v=null;ri<rr;ri++){
   for(var ci=0,chg=0,clr=0,cc=ca>cn?ca:cn;ci<cc;ci++){
      if(ri<rn&&ci<cn) {
         if(!doclr||ri<ra&&ci<ca) continue;
         clr = 1;
         }
      var val = clr ? null : V[ri][ci];
      if(Grids.OnAutoFillValue) { 
         var o = Get(R[ri],C[ci]); if(fp && R[ri][C[ci]+"EFormula"]) o = fp+R[ri][C[ci]+"EFormula"];
         v = Grids.OnAutoFillValue(this,R[ri],C[ci],r1,c1,val,v,rdir?-ri:ri,cdir?-ci:ci,r2,c2,o,V,A,E);
         if(v===o) continue;
         if(v==null) v = val; else val = v;
         }
      chg += this.SetEditAttrs(R[ri],C[ci],val,A,clr||!AV[ri]?[]:AV[ri][ci],E,null,null,"FillCells");
      }
   if(chg) this.UpdateRowHeight(R[ri],1);
   } 
this.EndUpdate();
if(Grids.OnAutoFillFinish) Grids.OnAutoFillFinish(this,r1,c1,r2,c2,rdir,cdir,ro,co);
if(!EE) this.ProcessErrors(E);
return doclr;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ClearRange = function(F,X,EE,attrs,test){
var R = [], C = []; 
if(F.length==2) { R = F[0]; C = F[1]; }
else this.GetRangeRC(F,R,C);
var A0 = this.GetEditAttrs(0,0), A1 = this.GetEditAttrs(0,1), A2 = this.GetEditAttrs(0,2);
var E = EE||test ? EE : this.GetErrors("Clear");
if(test && R.length*C.length>1000) return true;
var AI = !test && attrs==2 ? this.GetEditAttrs(0,0) : null;
if(!test) this.StartUpdate();
for(var ri=0;ri<R.length;ri++){
   var r = R[ri], chgc = 0;
   for(var ci=0;ci<C.length;ci++) if(!X||!X[r.id+":"+C[ci]]) {
      var at = attrs?attrs:3, typ = this.GetType(r,C[ci]), cf = this.CanFocus(r,C[ci],typ); 
      if(at&1) if(this.CanEdit(r,C[ci],0,typ,cf)!=1) at &= ~1;
      if(at&2) if(this.CanEdit(r,C[ci],1,typ,cf)!=1) at &= ~2;
      if(!at) continue;
      if(AI&&at&2  && (typ=="EHtml"||typ=="Auto"&&this.AutoHtml)) {
         var v = Get(r,C[ci]);
         if(v && typeof(v)=="string" && v.indexOf("<")>=0){
            if(v.search(/<\/(?!(span|a))\w+>/)>=0) v = this.UpdateCellStyleHtml(v);
            
            if(this.SetEditAttrs(r,C[ci],v.replace(/<\/?span[^>]*\/?>/g,""),AI,[],E,null,test,"ClearCells",1,typ)) chgc++;
            continue;
            }
         }     
      if(this.SetEditAttrs(r,C[ci],null,at==3?A0:at==2?A2:A1,[],E,null,test,"ClearCells",1,typ)){ if(test) return true; chgc++; }
      }
   if(chgc) this.UpdateRowHeight(r);
   }
if(test) return false;
this.EndUpdate();
if(!EE) this.ProcessErrors(E);
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionClearCell = function(F,T,attrs){
if(!attrs) attrs = 3;
if(this.Locked["style"]) attrs &= ~2;
if(!attrs) return false;
if(this.EditMode&&attrs==2) return !this.DynamicStyle || this.Edit.EditStyle("ClearStyle",null,null,T) ? 1 : !T;
if(this.EditMode) return false;
if(T&&this.EventObject["Clear"+attrs+(F?F:0)]!=null&&!this.CellRanges) return this.EventObject["Clear"+attrs+(F?F:0)];
var chg = 0, upd = T?0:1, V = this.GetValueCells(F,T); if(!V.length) { if(T&&!this.CellRanges) this.EventObject["Clear"+attrs] = 0; return false; }
var A0 = this.GetEditAttrs(0,0), A1 = this.GetEditAttrs(0,1), A2 = this.GetEditAttrs(0,2), over = this.Overlay;
if(!T) { this.NoUpdateHeights = new Date()-0; this.Overlay = 0; }
var spn = attrs&2&&this.DynamicSpan&&(A2.RowSpan||A2.Span), bor = attrs&2&&this.DynamicBorder&&A2.Border;
if(bor){
   if(A2.BorderLeft) { A2[A2.BorderLeft] = ""; A2.BorderLeft = null; A0[A0.BorderLeft] = ""; A0.BorderLeft = null; }
   if(A2.BorderRight) { A2[A2.BorderRight] = ""; A2.BorderRight = null; A0[A0.BorderRight] = ""; A0.BorderRight = null; }
   if(A2.BorderTop) { A2[A2.BorderTop] = ""; A2.BorderTop = null; A0[A0.BorderTop] = ""; A0.BorderTop = null; }
   if(A2.BorderBottom) { A2[A2.BorderBottom] = ""; A2.BorderBottom = null; A0[A0.BorderBottom] = ""; A0.BorderBottom = null; }
   A2.Border = null; A0.Border = null;
   }
if(spn){
   if(A2.Span){ A2[A2.Span] = ""; A2.Span = null; A0[A0.Span] = ""; A0.Span = null; }
   if(A2.RowSpan){ A2[A2.RowSpan] = ""; A2.RowSpan = null; A0[A0.RowSpan] = ""; A0.RowSpan = null; }
   }
var Rows = {}, Cols = {};
if(attrs&2&&!T){
   var S = this.GetStyleCells(F,T), A = {}; for(var i=0;i<A2.length;i++) if(!CSpecAttrs[A2[i]]) A[A2[i]] = null;
   for(var k=0;k<S.length;k+=2){
      if(!S[k+1]){ 
         if(S[k].CanEdit!=0) { 
            if(upd) { this.StartUpdate(); upd = 0; }
            chg++;
            this.SetCellStyle(S[k],null,A,1);
            Rows[S[k].id] = 1; 
            } 
         }
      else if(!S[k]){ 
         if(this.Cols[S[k+1]].CanEdit!=0) { 
            if(upd) { this.StartUpdate(); upd = 0; }
            chg++;
            this.SetCellStyle(null,S[k+1],A,1); 
            Cols[S[k+1]] = 1; 
            } 
         }
      }
   }
var max = T&&this.MaxMenuCells ? this.MaxMenuCells : 1e10, R = {}, E = T ? null : this.GetErrors("Clear");
var AI = !T && attrs==2 ? A0 : null;
for(var i=0;i<V.length;i+=2){
   var row = V[i], col = V[i+1], at = attrs, typ = this.GetType(row,col), cf = this.CanFocus(row,col,typ);
   if(at&1) if(this.CanEdit(row,col,0,typ,cf)!=1&&typ!="File") at &= ~1;
   if(at&2) if(Rows[row.id]||Cols[col]||this.CanEdit(row,col,1,typ,cf)!=1) at &= ~2;
   if(!at) continue;
   
   if(upd) { this.StartUpdate(); upd = 0; }
   if(!this.SetEditAttrs(row,col,null,at==3?A0:at==2?A2:A1,[],E,null,T,"ClearCells",1,typ)) continue;
   if(++chg>=max) { if(!this.CellRanges) this.EventObject["Clear"+attrs] = chg; return chg; }
   R[row.id] = row;
   }
if(spn){
   if(upd) { this.StartUpdate(); upd = 0; }
   chg += this.ActionSplit(F,T);
   }
if(bor){ 
   if(upd) { this.StartUpdate(); upd = 0; }
   chg += this.SetCellsBorder(F,T,15,0,1,E);
   }

if(T) { if(!this.CellRanges) this.EventObject["Clear"+attrs+(F?F:0)] = chg; return V.Max!=null ? V.Max : chg; }
this.NoUpdateHeights = null;
for(var id in R) this.UpdateRowHeight(R[id]);
if(over){
   this.Overlay = over;
   for(var id in R) this.UpdateOverlay(R[id]);
   }
if(!upd) this.EndUpdate();
if(E) this.ProcessErrors(E);
return chg;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionClearValueStyle = function(F,T){ 
   if(!T) return this.ActionClearCell(F,T,3);
   var cv = this.ActionClearCell(F,T,1), cs = this.ActionClearCell(F,T,2);
   return !cv||!cs ? 0 : cv>cs ? cv : cs;
   }
TGP.ActionClearValue = function(F,T){ return this.ActionClearCell(F,T,1); }
TGP.ActionClearStyle = function(F,T){ return this.ActionClearCell(F,T,2); }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionClearCells = function(F,T){ return this.ActionClearCell(F?F|1:1,T,0); }
TGP.ActionClearValues = function(F,T){ return this.ActionClearCell(F?F|1:1,T,1); }
TGP.ActionClearStyles = function(F,T){ return this.ActionClearCell(F?F|1:1,T,2); }
TGP.ActionClearSelectedCells = function(F,T){ return this.ActionClearCell(F?F|2:2,T,0); }
TGP.ActionClearSelectedValues = function(F,T){ return this.ActionClearCell(F?F|2:2,T,1); }
TGP.ActionClearSelectedStyles = function(F,T){ return this.ActionClearCell(F?F|2:2,T,2); }
TGP.ActionClearRow = function(F,T){ return this.ActionClearCell(F?F|8:8,T,0); }
TGP.ActionClearRowValues = function(F,T){ return this.ActionClearCell(F?F|8:8,T,1); }
TGP.ActionClearRowStyles = function(F,T){ return this.ActionClearCell(F?F|8:8,T,2); }
TGP.ActionClearCol = function(F,T){ return this.ActionClearCell(F?F|8:8,T,0); }
TGP.ActionClearColValues = function(F,T){ return this.ActionClearCell(F?F|8:8,T,0); }
TGP.ActionClearColStyles = function(F,T){ return this.ActionClearCell(F?F|8:8,T,0); }
TGP.ActionClearAll = function(F,T){ return this.ActionClearCell(F?F|56:56,T,0); }
TGP.ActionClearAllValues = function(F,T){ return this.ActionClearCell(F?F|56:56,T,0); }
TGP.ActionClearAllStyles = function(F,T){ return this.ActionClearCell(F?F|56:56,T,0); }
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
TGP.GetEditAttrs = function(keep,attrs,ignore){

var V = [""]; V.Value = 1; return V;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionUpperCase = function(F,T,lower){ 
if(this.EditMode) return this.Edit.UpperCase(T,lower);
var S = this.GetValueCells(F,T); if(!S.length) return false;
if(!T){ var D = document.createElement("div"), f = lower ? "toLocaleLowerCase" : "toLocaleUpperCase"; }
var max = T&&this.MaxMenuCells ? this.MaxMenuCells : 1e10, chg = 0;
for(var i=0,A=[];i<S.length;i+=2){
   var row = S[i], col = S[i+1];
   var val = row[col]; if(val==null) val = row.Def[col]; if(!val||val-0) continue;
   if(++chg>=max) return chg;
   if(T) continue;
   if(chg==1) this.StartUpdate();
   D.innerHTML = val;
   var N = D.firstChild;
   while(1){
      if(N.nodeType==3) N.data = N.data[f]();
      if(N.firstChild) N = N.firstChild;
      else {
         while(!N.nextSibling&&N!=D) N = N.parentNode;
         if(N==D) break;
         N = N.nextSibling;
         }
      }
   
   this.SetEditValue(row,col,D.innerHTML,1,S.Errors);
   }
if(T||!chg) return S.Max!=null ? S.Max : chg;
this.EndUpdate();
this.ProcessErrors(S.Errors);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionLowerCase = function(F,T){ return this.ActionUpperCase(F,T,1); }
// -----------------------------------------------------------------------------------------------------------
ME.MassChange;



// -----------------------------------------------------------------------------------------------------------
TGP.GetACell = function(F,but){
if(this.CellRanges){
   var S = this.CellRanges;
   for(var i=0;i<S.length;i++) if(S[i][0]&&S[i][1]) return [S[i][0],S[i][1],0];
   for(var i=0;i<S.length;i++) {
      if(S[i][0]) {
         for(var fc=this.GetFirstCol(null,null,2);fc&&(this.Cols[fc].Type=="Panel"||fc==this.RowIndex);fc=this.GetNextCol(fc,null,2));
         return fc ? [S[i][0],fc,0] : null;
         }
      if(S[i][1]){
         for(var fr=this.GetFirst(0,4);fr&&fr.Kind!="Data";fr=this.GetNext(fr,4));
         return fr ? [fr,S[i][1],0] : null;
         }
      }
   return null;
   }
if(this.EventObject.Type==1&&(!(F&7)||F&4)&&this.ARow&&this.ACol&&(!this.ARow.Space||but||this.GetType(this.ARow,this.ACol)!="Button")) {
   if(!(F&64)) return [this.ARow,this.ACol,4];
   F = (F&1||this.IsFocused(this.ARow,this.ACol)?1:0) | (F&2||this.IsSelected(this.ARow,this.ACol)?2:0) | 4 | F&~7;
   }
if(this.FRow&&this.FCol&&(!(F&7)||F&1)) return F&64 && this.FRect && (this.FRect[0]!=this.FRect[2]||this.FRect[1]!=this.FRect[3]) ? null : [this.FRow,this.FCol,1];
if((!(F&7)||F&2)&&this.SelectingCells&&this.Selecting){ 
   var C = this.Cols, single = F&64;
   for(var r=this.GetFirst(null,4);r;r=this.GetNext(r,4)) if(r.Selected&2){
      for(var i=this.FirstSec;i<=this.LastSec;i++) for(var S=this.ColNames[i],l=S.length,c1=0;c1<l;c1++) if(r[S[c1]+"Selected"]) {
         if(!single) return [r,S[c1],2];
         else if(typeof(single)=="object") return null;
         single = [r,S[c1],2]
         }
      }
   if(single&&typeof(single)=="object") return single;
   }
if(F&4&&this.ARow&&this.ACol) return [this.ARow,this.ACol,4];
return null;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetARow = function(F,side){
if(this.CellRanges){
   var S = this.CellRanges;
   for(var i=0;i<S.length;i++) if(S[i][0]) return S[i][0];
   return null;
   }
if(this.EventObject.Type==1&&this.ARow&&!this.ARow.Space&&this.ARow.Kind!="Header"&&(!(F&7)||F&4)) {
   if(!(F&72) || (F&68)==4) return this.ARow; 
   F = (F&1||this.IsFocused(this.ARow,null)?1:0) | (F&2||this.IsSelected(this.ARow,null)?2:0) | (F&8?0:4) | F&~3;
   }
if(this.FRow&&(!(F&7)||F&1)) return F&64 && this.FRect && this.FRect[0]!=this.FRect[2] || F&8&&(!this.FRect||!this.FRect[6]) ? null : side&&this.FRect ? this.FRect[side==1?0:2] : this.FRow;
if((!(F&7)||F&2)&&this.Selecting) {
   for(var r=this.GetFirstVisible(null,4),single=F&64,and=F&8?this.And:3;r;r=this.GetNextVisible(r,4)) if(r.Selected&and) { 
      if(!single) return r;
      else if(typeof(single)=="object") return null;
      single = r;
      }
   if(single&&typeof(single)=="object") return single;
   }
if(F&4) return this.ARow; 
return null;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetACol = function(F,side){
if(this.CellRanges){
   var S = this.CellRanges;
   for(var i=0;i<S.length;i++) if(S[i][1]) return S[i][1];
   return null;
   }
if(this.EventObject.Type==1&&this.ARow&&!this.ARow.Space&&this.ACol!=this.RowIndex&&(!(F&7)||F&4)) {
   if(!(F&80) || (F&68)==4) return this.ACol; 
   F = (F&1||this.IsFocused(null,this.ACol)?1:0) | (F&2||this.IsSelected(null,this.ACol)?2:0) | (F&16?0:4) | F&~3;
   }
if(this.FRow&&this.FCol&&(!(F&7)||F&1)) return F&64 && this.FRect && this.FRect[1]!=this.FRect[3] || F&16&&(!this.FRect||!this.FRect[7]) ? null : side&&this.FRect ? this.FRect[side==1?1:3] : this.FCol;
if((!(F&7)||F&2)&&this.SelectingCols&&this.Selecting){ 
   var C = this.Cols, single = F&64;
   for(var c=this.GetFirstCol(null,null,2);c;c=this.GetNextCol(c,null,2)) if(C[c].Selected){
      if(!single) return c;
      else if(typeof(single)=="string") return null;
      single = c;
      }
   if(single&&typeof(single)=="string") return single;
   }
if((!(F&7)||F&2)&&!(F&8)&&this.SelectingCells&&this.Selecting){ 
   var R = {}, RR = this.Rows, cnt = 0; for(var id in RR) if(RR[id].Selected&2) { R[id] = RR[id]; cnt++; }
   if(cnt){
      var single = F&64;
      for(var c=this.GetFirstCol(null,null,2);c;c=this.GetNextCol(c,null,2)) {
         for(var id in R) if(R[id][c+"Selected"]){
            if(!single) return c;
            else if(typeof(single)=="string") return null;
            single = c;
            }
         }
      if(single&&typeof(single)=="string") return single;
      }
   }
if(F&4) return this.ACol; 
return null;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetARows = function(F){ return this.GetARanges(F,null,null,1).Rows; }
TGP.GetACols = function(F){ return this.GetARanges(F,null,null,2).Cols; }
// -----------------------------------------------------------------------------------------------------------
TGP.SplitFixedRanges = function(A,pos){
for(var k=pos?pos:0,N=pos?A.slice(0,pos):[];k<A.length;k++){
   var F = A[k];
   var S = [], fr = F[0], fc = F[1], lr = F[2], lc = F[3], C = this.Cols;
   if(fr.Fixed!=lr.Fixed){
      if(fr.Fixed) {
         S[S.length] = [fr,fc,this.GetLast(this.XH),lc];
         fr = this.GetFirst();
         }
      if(lr.Fixed) {
         S[S.length] = [this.GetFirst(this.XF),fc,lr,lc];
         lr = this.GetLast();
         }
      }
   else if(C[fc].MainSec==C[lc].MainSec) { N[N.length] = F; continue; }
   S[S.length] = [fr,fc,lr,lc];
   if(C[fc].MainSec==C[lc].MainSec) { for(var i=0;i<S.length;i++) N[N.length] = S[i]; continue; }
   if(C[fc].MainSec==0){
      var c = this.GetLastCol(0);
      for(var i=0;i<S.length;i++) N[N.length] = [S[i][0],S[i][1],S[i][2],c];
      fc = this.GetFirstCol(1);
      }
   if(C[lc].MainSec==2){
      var c = this.GetFirstCol(2);
      for(var i=0;i<S.length;i++) N[N.length] = [S[i][0],c,S[i][2],S[i][3]];
      lc = this.GetLastCol(1);
      }
   for(var i=0;i<S.length;i++) N[N.length] = [S[i][0],fc,S[i][2],lc];
   }
return N;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetFocusedRanges = function(fixed,rc){
if(!this.FRow) return [];
var F = this.FRect;
if(!F) { if(rc&4) return []; F = this.GetSpanned(this.FRow,this.FCol); if(!rc) return [F]; }
if(F[6]&&(!rc||rc==5)||rc==1){ var S = []; S.Rows = {}; for(var r=F[0],n=this.GetNext(F[2],4);r&&r!=n;r=this.GetNext(r,4)) S.Rows[r.id+""] = r; return S; }
if(F[7]&&(!rc||rc==6)||rc==2){ var S = []; S.Cols = {}; for(var c=F[1],n=this.GetNextCol(F[3],null,2);c&&c!=n;c=this.GetNextCol(c,null,2)) S.Cols[c] = this.Cols[c]; return S; }
return rc&4 ? [] : fixed&&!rc ? this.SplitFixedRanges([F]) : [F];
}
// -----------------------------------------------------------------------------------------------------------
TGP.FillRowRanges = function(R,S,full){
var f = null, l = null, fc = null, lc = null, O = {}, C = this.Cols;
if(full){
   for(fc=this.GetFirstCol(null,null,2);fc&&(C[fc].Type=="Panel"||fc==this.RowIndex);fc=this.GetNextCol(fc,null,2));
   for(lc=this.GetLastCol(null,null,2);lc&&(C[lc].Type=="Panel"||lc==this.RowIndex);lc=this.GetPrevCol(lc,null,2));
   }
for(var id in R) if(!O[id]){
   var r = R[id], n = r; O[id] = 1;
   while(1){ 
      var l = this.GetNext(n,4); 
      if(!l||!R[l.id]){ S[S.length] = [r,fc,n,lc]; break; } 
      n = l; O[n.id] = 1; 
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.FillColRanges = function(C,S,full){
var f = null, l = null, fr = null, lr = null, O = {};
if(full){
   for(fr=this.GetFirst(0,4);fr&&fr.Kind!="Data";fr=this.GetNext(fr,4));
   for(lr=this.GetLast(0,4);lr&&lr.Kind!="Data";lr=this.GetPrev(lr,4));
   }
for(var c in C) if(!O[c]){
   var n = c; O[c] = 1;
   while(1){ 
      var l = this.GetNextCol(n,null,2); 
      if(!l||!C[l]){ S[S.length] = [fr,c,lr,n]; break; } 
      n = l; O[n] = 1; 
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetARanges = function(F,fixed,add,rc,collapsed){
var S = this.CellRanges;
if(S){
   if(F&64){
      if(S.length!=1) return [];
      if(rc==1&&F&8) { if(S[0][0]!=S[0][2]||S[0][1]) return []; }
      else if(rc==2&&F&16) { if(S[0][1]!=S[0][3]||S[0][0]) return []; }
      else if(rc==1||F&8){ if(S[0][0]!=S[0][2]) return []; S = [[S[0][0],null,S[0][0],null]]; }
      else if(rc==2||F&16) { if(S[0][1]!=S[0][3]) return []; S = [[null,S[0][1],null,S[0][3]]]; }
      else if(S[0][0]!=S[0][2]||S[0][1]!=S[0][3]) return [];
      }
   else if(rc==1&&F&8){ S = S.slice(); for(var i=0;i<S.length;i++) if(S[i][1]) S.splice(i--,1); }
   else if(rc==2&&F&16){ S = S.slice(); for(var i=0;i<S.length;i++) if(S[i][0]) S.splice(i--,1); }
   else if(rc==1||F&8){ S = S.slice(); for(var i=0;i<S.length;i++) { S[i][1] = null; S[i][3] = null; } }
   else if(rc==2||F&16){ S = S.slice(); for(var i=0;i<S.length;i++) { S[i][0] = null; S[i][2] = null; } }
   else if(add!=1) S = S.slice(); 
   if(!add){
      for(var i=0;i<S.length;i++){
         if(!S[i][0]){ if(!S.Cols) S.Cols = {}; for(var c=S[i][1],n=this.GetNextCol(S[i][3],null,2);c&&c!=n;c=this.GetNextCol(c,null,2)) S.Cols[c] = this.Cols[c]; S.splice(i--,1); }
         else if(!S[i][1]){ if(!S.Rows) S.Rows = {}; for(var r=S[i][0],n=this.GetNext(S[i][2],4);r&&r!=n;r=this.GetNext(r,4)) S.Rows[r.id+""] = r; S.splice(i--,1); }
         }
      }
   else if(add==2){
      var fr = null, lr = null, fc = null, lc = null;
      for(var i=0;i<S.length;i++){
         if(!S[i][0]){ 
            if(!fr){
               for(fr=this.GetFirst(0,4);fr&&fr.Kind!="Data";fr=this.GetNext(fr,4));
               for(lr=this.GetLast(0,4);lr&&lr.Kind!="Data";lr=this.GetPrev(lr,4));
               }
            S[i][0] = fr; S[i][2] = lr;
            }
         if(!S[i][1]){  
            if(!fc){
               for(fc=this.GetFirstCol(null,null,2);fc&&(this.Cols[fc].Type=="Panel"||fc==this.RowIndex);fc=this.GetNextCol(fc,null,2));
               for(lc=this.GetLastCol(null,null,2);lc&&(this.Cols[lc].Type=="Panel"||lc==this.RowIndex);lc=this.GetPrevCol(lc,null,2));
               }
            S[i][1] = fc; S[i][3] = lc;
            }
         }
      }
   return fixed ? this.SplitFixedRanges(S) : S;
   }

var T = this;
function GetSel(){ 
   if(rc==1||F&8){ 
      var S = []; S.Rows = {}; 
      for(var r=T.GetFirst(null,4),sel=0,and=rc==1&&F&8||T.SelectingCells!=4?T.SelAnd:3;r;r=T.GetNext(r,4)) { 
         if(r.Visible) sel = r.Selected&and ? 1 : 0; 
         else if(sel==1){ var n = T.GetNextVisible(r,4); sel = n&&n.Selected&and ? 2 : 0; }
         if(sel) S.Rows[r.id+""] = r; 
         }
      return S; 
      }
   if(rc==2||F&16){ 
      var S = []; S.Cols = {}; 
      for(var c=T.GetFirstCol(null,null,2),C=T.Cols,N=[],V=[],sel=0;c;c=T.GetNextCol(c,null,2)) { 
         N[N.length] = c;
         if(C[c].Visible) { sel = C[c].Selected ? 1 : 0; V[V.length] = null; }
         else { var n = T.GetNextCol(c); V[V.length] = n; if(sel==1) sel = n&&C[n].Selected ? 2 : 0; }
         if(sel) S.Cols[c] = C[c]; 
         }
      if(!(rc==2&&F&16)&&T.SelectingCells==4) for(var r=T.GetFirst(0,4);r;r=T.GetNext(r,4)) if(r.Selected&2) {
         for(var i=0,sel=0,nl=N.length;i<nl;i++) {
            if(!V[i]) sel = r[N[i]+"Selected"] ? 1 : 0; 
            else if(sel==1) sel = r[V[i]+"Selected"] ? 2 : 0;
            if(sel) S.Cols[N[i]] = C[N[i]]; 
            }
         }
      return S; 
      }
   return T.GetSelRanges((fixed?0:8)+(collapsed?16:0),fixed?5:7);
   }
if(F&64) {
   if(rc==1||F&8){ var r = this.GetARow(rc==1&&F&8?F:F?F&~8:null); S = []; if(r) { S.Rows = {}; S.Rows[r.id+""] = r; } }
   else if(rc==2||F&16){ var c = this.GetACol(rc==2&&F&16?F:F?F&~8:null); S = []; if(c){ S.Cols = {}; S.Cols[c] = this.Cols[c]; } }
   else { var S = this.GetACell(F); S = S ? [[S[0],S[1],S[0],S[1]]] : []; }
   }
else if(F&32){
   if(!(F&24)&&!rc) {
      for(var fr=this.GetFirst(0,4);fr&&fr.Kind!="Data";fr=this.GetNext(fr,4));
      for(var lr=this.GetLast(0,4);lr&&lr.Kind!="Data";lr=this.GetPrev(lr,4));
      for(var fc=this.GetFirstCol(null,null,2);fc&&(this.Cols[fc].Type=="Panel"||fc==this.RowIndex);fc=this.GetNextCol(fc,null,2));
      for(var lc=this.GetLastCol(null,null,2);lc&&(this.Cols[lc].Type=="Panel"||lc==this.RowIndex);lc=this.GetPrevCol(lc,null,2));
      S = [[fr,fc,lr,lc]];
      }
   else {
      var S = [];
      if(F&8||rc==1) { var R = {}, O = this.Rows; S.Rows = R; for(var id in O) if(!O[id].Space) R[id] = O[id]; }
      if(F&16||rc==2) { var C = {}, O = this.Cols; S.Cols = C; for(var c in O) C[c] = O[c]; }
      }
   }
else if(this.EventObject.Type==1&&this.ARow&&!this.ARow.Space&&(!(F&7)||F&4)){
   var sel = (!(F&7)||F&2) && this.IsSelected(rc==2?null:this.ARow,rc==1?null:this.ACol), foc = (!(F&7)||F&1) && this.IsFocused(this.ARow,this.ACol);
   if(foc&&(!sel||!this.SelectingFocus)) S = this.GetFocusedRanges(fixed,rc==1&&F&8?5:rc==2&&F&16?6:rc==1||F&8?1:rc==2||F&16?2:0);
   else if(sel) S = GetSel();
   else if(rc==1&&(F&12)==8||rc==2&&(F&20)==16) S = [];
   else if(rc==1||F&8) { S = []; S.Rows = {}; S.Rows[this.ARow.id+""] = this.ARow; }
   else if(rc==2||F&16) { S = []; S.Cols = {}; S.Cols[this.ACol] = this.Cols[this.ACol]; }
   else if(this.ARow) S = [[this.ARow,this.ACol,this.ARow,this.ACol]];
   else S = [];
   }
else if(this.FRow&&(!this.SelectingFocus||!this.FRect&&!(this.SelectingFocus&2)||F&7&&!(F&2))&&(!(F&7)||F&1)){
   S = this.GetFocusedRanges(fixed,rc==1&&F&8?5:rc==2&&F&16?6:rc==1||F&8?1:rc==2||F&16?2:0);
   if(F&2||!(F&7)){
      var A = GetSel();
      for(var i=0;i<A.length;i++) S[S.length] = A[i];
      if(A.Rows) { if(!S.Rows) S.Rows = A.Rows; else for(var id in A.Rows) S.Rows[id] = A.Rows[id]; }
      if(A.Cols) { if(!S.Cols) S.Cols = A.Cols; else for(var id in A.Cols) S.Cols[id] = A.Cols[id]; }
      }
   }
else S = !(F&7)||F&2 ? GetSel() : [];
if(!add) return S;
var pos = S.length;
if(S.Rows) this.FillRowRanges(S.Rows,S,add==2);
if(S.Cols) this.FillColRanges(S.Cols,S,add==2);
return fixed&&add==2 ? this.SplitFixedRanges(S,pos) : S;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetValueCells = function(F,T){
var S = this.CellRanges ? null : this.EventObject["VC"+(F?F:0)+(T?1:0)]; if(S) return S;
S = this.GetARanges(F);
var N = [], E = T ? null : this.GetErrors("Edit"), X = {}, maxall = T&&this.MaxMenuAllCells ? this.MaxMenuAllCells : 1e10;
N.Errors = E; if(!this.CellRanges) this.EventObject["VC"+(F?F:0)+(T?1:0)] = N;
for(var k=0;k<S.length;k++){
   var R = [], C = []; this.GetRangeRC(S[k],R,C);
   for(var i=0;i<R.length;i++){
      var row = R[i];
      for(var j=0;j<C.length;j++){
         if(--maxall<=0){ N.Max = this.MaxMenuAllCellsValue; return N; } 
         var col = C[j]; if(X[row.id+":"+col]) continue;
         X[row.id+":"+col] = 1;
         if(S.Rows&&S.Rows[row.id]||S.Cols&&S.Cols[col]) continue;
         var typ = this.GetType(row,col);
         if(this.CanEdit(row,col,null,typ)!=1&&typ!="File"){ if(E) E.Errors.push([this.GetText("CannotEdit"),row,col]); continue; }
         N.push(row,col);
         }
      }
   }
if(S.Rows) { var C = this.Cols; for(var id in S.Rows) { var r = S.Rows[id]; for(var c in C) if(--maxall<=0){ N.Max = this.MaxMenuAllCellsValue; return N; } else if(this.CanEdit(r,c)==1) N.push(r,c); } }
if(S.Cols) { var R = this.Rows; for(var c in S.Cols) for(var id in R) if(--maxall<=0){ N.Max = this.MaxMenuAllCellsValue; return N; } else if(this.CanEdit(R[id],c)==1) N.push(R[id],c); } 
return N;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ShowMenuCell = function(M,F,func){
if(this.EventObject.Type==1&&this.ARow&&!this.ARow.Space&&(!F||F&4)) { this.ShowPopup(M,func); return true; }
if(this.EventObject.Type==1&&this.ARow&&this.ACol) { this.ShowMenu(this.ARow,this.ACol,M,null,func); return true; }
if(this.FRow&&this.FCol) { this.ShowMenu(this.FRow,this.FCol,M,null,func); return true; }
return false;
}
// -----------------------------------------------------------------------------------------------------------

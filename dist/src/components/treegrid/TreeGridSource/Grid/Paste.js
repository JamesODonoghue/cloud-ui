// -----------------------------------------------------------------------------------------------------------
// Functions Copy / Paste
// -----------------------------------------------------------------------------------------------------------
MS.Paste;
// -----------------------------------------------------------------------------------------------------------
CVoidChar = String.fromCharCode(65279);
// -----------------------------------------------------------------------------------------------------------
TGP.GetCopyValue = function(row,col){
var v = row[col+"CopyValue"];
if(v==null && row.Def) v = row.Def[col+"CopyValue"];
if(v==null && this.CopyFormulas==2) { v = row[col+"EFormula"]; if(v) v = this.Lang.Format.FormulaPrefix+v; }
if(v==null) v = this.GetString(row,col,this.CopyEdit?1:0);
if(Grids.OnGetCopyValue) { var tmp = Grids.OnGetCopyValue(this,row,col,v); if(tmp!=null) v = tmp; }
v += "";
if(this.Trans) v = this.Translate(row,col,v);
if(v.indexOf("<")>=0) v = v.replace(CRepHtml,"");
if(v.search(/[\r\n\t]/)<0) return v;
return '"'+v.replace(/\"/g,'""')+'"';

}
// -----------------------------------------------------------------------------------------------------------
TGP.CopyToCliboard = function(txt){
if(this.CopyPasteInternal==1) Grids.Clip = txt;
else if(this.CopyPasteInternal==2) this.Clip = txt;
else {
   if(BIE) { var bs = GetWindowScroll(); }
   var T = this.GetClipboard();
   T.value = txt;
   T.focus();
   T.select();
   if(BIE) { SetWindowScroll(bs[0],bs[1]); setTimeout(function(){ SetWindowScroll(bs[0],bs[1]); },10); } 
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetRowText = function(row,cols,sel,ch){
var cp = Get(row,"CanCopyPaste"); if(!cp || cp==2&&!ch || row.Deleted&&!(this.CopyPasteDeleted&2)) return "";
var txt = "";
if(sel && row.Selected && this.CopyPasteTree) row.ClipAdded = 1;
if(this.CopyPasteRows==1){  
   if(row.Deleted&&!this.CopyDeleted) return txt; 
   txt += this.id+"\t"+row.id;
   }
else {
   if(this.CopyPasteRows){
      if(Grids.length!=1 && this.CopyPasteRows==2) txt += this.id+"\t";
      if(this.IdNames.length==1&&!this.Cols[this.IdNames[0]]&&this.CopyPasteRows!=4) txt += row.id+"\t";
      }
   for(var i=0,tab="";i<cols.length;i++) {
      if(sel && row.Selected&2 && !row[cols[i]+"Selected"]) continue;
      txt += tab + this.GetCopyValue(row,cols[i]);
      MS.Animate; this.AnimCell(row,cols[i],"Copy",null,null,null,1); ME.Animate;
      tab = "\t";
      }
   }
if(Grids.OnGetRowText) { var tmp = Grids.OnGetRowText(this,row,cols,txt,sel); if(tmp!=null) txt = tmp; }
if(this.CopyPasteTree) for(var r=row.parentNode;r&&!r.Page;r=r.parentNode) ch = (ch?ch:"") + CVoidChar;
txt = (ch?ch:"") + txt + "\r\n";
if(this.CopyPasteTree && this.CopyPasteTree!=4 && row.firstChild && (row.Expanded||this.CopyPasteTree>=2)){
   ch = (ch?ch:"") + CVoidChar;
   for(var r=row.firstChild;r;r=r.nextSibling) if(r.Visible||this.CopyPasteTree==3) txt += this.GetRowText(r,cols,sel,ch);
   }
return txt;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetHeaderText = function(cols,sec){
var txt = "";
for(var r=(sec?this.XF:this.XH).firstChild;r;r=r.nextSibling) if(Get(r,"CanCopyPaste")==3) txt += this.GetRowText(r,cols);
return txt;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetCopyCols = function(cols){
var col = this.FRect ? this.FRect[1] : this.FCol;
switch(cols){
   case 0: 
      MS.FocusRect;
      if(this.FRect){
         var A = [], c = this.FRect[1], col = this.FRect[3], type = this.CopyPasteHidden&1 ? 2 : 0; 
         for(;c!=col;c=this.GetNextCol(c,null,type)) if(this.Cols[c].CanCopyPaste && (this.CopyPasteDeleted&1||!this.Cols[c].Deleted)) A[A.length] = c;
         if(this.Cols[col].CanCopyPaste) A[A.length] = col;
         return A;
         }
      ME.FocusRect;
      return col && this.Cols[col] && this.Cols[col].CanCopyPaste ? [col] : [];
   case 1: return this.GetCols("Visible","CanCopyPaste",this.CopyPasteDeleted&1?"":"Deleted");
   case 2: return this.GetCols("","CanCopyPaste",this.CopyPasteDeleted&1?"":"Deleted");
   case 3:
      if(!col) return [];
      var X = this.GetCols(this.CopyPasteHidden&1?"":"Visible","CanCopyPaste",this.CopyPasteDeleted&1?"":"Deleted"), C = [];
      for(var i=0;i<X.length;i++) if(X[i]==col) break;
      for(;i<X.length;i++) C[C.length] = X[i];
      return C;
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.CopyClip = function(sel,foc,cols,nostyles){
if(this.WaitForCtrC){
   this.WaitForCtrC = 0;
   if(BIE){ var bs = GetWindowScroll(); }
   var T = this.GetClipboard();
   T.focus();
   T.select();
   if(BIE) SetWindowScroll(bs[0],bs[1]);
   this.ShowMessageTime(this.GetText("CopyOk"),1000);
   return true;
   }
var t = new Date(), cols3 = cols==3||cols==4; if(cols3) cols -= 2;
if(Grids.OnCopyStart && Grids.OnCopyStart(this)) return false;
var C = this.GetCopyCols(cols); if(!C || !C.length) return false; 

// --- Selected ---
var R = sel ? this.GetSelRows() : [], A = [], p = 0, rp = 0;
if(R.length){
   if(this.AllSelected && this.Paging!=3) A[p++] = this.GetHeaderText(C,0);
   for(var i=0;i<R.length;i++) if(!R[i].ClipAdded) { A[p++] = this.GetRowText(R[i],C,sel); rp++; }
   if(this.CopyPasteTree) for(var i=0;i<R.length;i++) R[i].ClipAdded = null;
   if(this.AllSelected && this.Paging!=3) A[p++] = this.GetHeaderText(C,1);
   }

// --- Focused ---   
else {
   var row = this.FRow; if(!row && foc<30) return false;
   if(foc>=20 && this.Paging!=3) A[p++] = this.GetHeaderText(C,0);
   else if(cols3 && this.FCol) C = this.GetCopyCols(0);
   switch(foc){
      case 0: 
         return false;
      case 1: 
         var hid = this.CopyPasteHidden&2;
         MS.FocusRect; if(this.FRect) for(var r=this.FRect[0],row=this.FRect[2];r!=row;r=hid?this.GetNext(r,4):this.GetNextVisible(r,4)) R[rp++] = r; ME.FocusRect;
         R[rp++] = row;
         break;
      case 20: 
         if(row.parentNode.Page) { for(var r=this.XB.firstChild.firstChild;r;r=this.GetNextSibling(r)) if(r.Visible) R[rp++] = r; }
         else for(var r=row.parentNode.firstChild;r;r=r.nextSibling) if(r.Visible) R[rp++] = r;
         break;
      case 30: 
         if(this.CopyPasteTree && this.CopyPasteTree!=4) { for(var r=this.XB.firstChild.firstChild;r;r=this.GetNextSibling(r)) if(r.Visible) R[rp++] = r; }
         else for(var r=this.GetFirstVisible();r;r=this.GetNextVisible(r)) R[rp++] = r;
         break;
      case 31: 
         if(this.CopyPasteTree && this.CopyPasteTree!=4) { for(var r=this.XB.firstChild.firstChild;r;r=this.GetNextSibling(r)) R[rp++] = r; }
         else for(var r=this.GetFirst();r;r=this.GetNext(r)) R[rp++] = r;
         break;
      default: MS.Debug;this.Debug(2,"Unknown value for ","CopyFocused"," attribute - ",foc); ME.Debug;   
      }
   for(var i=0;i<rp;i++) A[p++] = this.GetRowText(R[i],C);
   if(foc>=20 && this.Paging!=3) A[p++] = this.GetHeaderText(C,1);
   }

// --- Copy ---
var txt = A.join(""); if(!txt) return false;
if(Grids.OnCopy){ 
   var v = Grids.OnCopy(this,txt); if(v!=null) { txt = v; if(!txt) return false; }
   }
var A = this.GetEditAttrs(0);
if((A.length || A.Formula&&this.CopyFormulas!=0 || this.CopyPasteRows==4)&&!nostyles){
   var U = [], cp = this.CopyFormulas!=0;
   for(var i=0;i<rp;i++) {
      for(var j=0;j<C.length;j++) {
         var f = cp?R[i][C[j]+"EFormula"]:"", a = []; 
         for(var k=0;k<A.length;k++) if(R[i][C[j]+A[k]]!=null) a[k] = R[i][C[j]+A[k]];
         if(A.BorderRight&&!(this.SpannedBorder&4)&&R[i].Spanned&&R[i][C[j]+"Span"]>1) a.BorderRight = R[i][this.GetLastSpanCol(R[i],C[j])+"BorderRight"];
         if(A.BorderBottom&&!(this.SpannedBorder&4)&&R[i].RowSpan&&R[i][C[j]+"RowSpan"]>1) a.BorderBottom = this.GetLastSpanRow(R[i],C[j])[C[j]+"BorderBottom"];
         if(f || a.length || this.CopyPasteRows==4) {
            if(!U[i]) U[i] = [];
            U[i][j] = [R[i].id,C[j],f,this.GetValue(R[i],C[j]),a];
            }
         }
      }
   U.Text = txt;
   U.Attrs = A;
   U.Grid = this;
   Grids.LastCopy = U.length ? U : null;
   }
this.CopyToCliboard(txt);
if(this.CopyTime && !this.CopyPasteInternal){
   t = new Date()-t;
   var ct = (this.CopyTime+"").split(",");
   if(BIEA && ct[1]) ct = ct[1];
   else if(BMozilla && ct[2]) ct = ct[2];
   else if(BSafari && ct[3]) ct = ct[3];
   else ct = ct[0];
   if(t>ct-0){
      Grids.Clipboard.blur();
      this.ShowMessageTime(this.GetText("CopySlow").replace("%d",new Date()-t),1000);
      this.WaitForCtrC = 1;
      return false;
      }
   }
return [R,C]; 
}
// -----------------------------------------------------------------------------------------------------------
TGP.ExcludeClip = function(sel,foc,cols,nostyles){ 
var O = this.CopyClip(sel,foc,cols,nostyles); if(!O||!O[0].length) return false;
var T = this;
function del(){ 
   if(T.ExcludeClear) {
      var E = T.GetErrors("Clear");
      T.ClearRange(O,null,E,T.ExcludeClear==2?1:null);
      T.ProcessErrors(E);
      }
   else if(T.DeleteRows) T.DeleteRows(O[0],1);
   }
setTimeout(del,10); 
return true; 
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionCopy = function(dummy,T,ex){ 
if(this.Locked["copy"]) return !T;
var cc = this.Event&&(this.Event.Name=="C"||this.Event.Name=="X");
if(!cc && (!document.queryCommandSupported || !document.queryCommandSupported("copy"))) return false;
if(T) return true;
if(!this.EditMode||!this.Edit.Html){
   if(ex&1 ? !this.ExcludeClip(this.CopySelected,this.CopyFocused,this.CopyCols,ex&2) : !this.CopyClip(this.CopySelected,this.CopyFocused,this.CopyCols,ex&2)) return false;
   if(cc) return true;
   }
var ret = document.execCommand("copy");
if(ex) document.execCommand("delete");
return ret;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionCopyValues = function(F,T){ return this.ActionCopy(F,T,2); } 
TGP.ActionExclude = function(F,T){ return this.ActionCopy(F,T,1); }
TGP.ActionExcludeValues = function(F,T){ return this.ActionCopy(F,T,3); } 

// -----------------------------------------------------------------------------------------------------------
TGP.ActionCCopyRow = function(){ return this.CopyClip(0,1,1) ? 1 : 0; }
TGP.ActionCCopyCell = function(){ return this.CopyClip(0,1,0) ? 1 : 0; }
TGP.ActionCCopyCol = function(){ return this.CopyClip(0,30,0) ? 1 : 0; }
TGP.ActionCCopyColLevel = function(){ return this.CopyClip(0,20,0) ? 1 : 0; }
TGP.ActionCCopySelected = function(){ return this.CopyClip(1,0,1) ? 1 : 0; }
TGP.ActionExcludeRow = function(){ return this.ExcludeClip(0,1,1) ? 1 : 0; }
TGP.ActionExcludeSelected = function(){ return this.ExcludeClip(1,0,1) ? 1 : 0; }
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Pastes text txt into selected rows
TGP.PasteText = function(txt,sel,foc,cols,nostyles){
if(!txt) return false;
txt += "";
var A, C;

if(txt.search(/(^|[\t\r\n])\"/)>=0){
   txt = txt.replace(/\\/g,"\\x");
   while(1){
      var M = txt.match(/(^|[\t\r\n])\"(\"\"|[^\"\r\n\t])*[\r\n\t](\"\"|[^\"])*\"([\t\r\n]|$)/);
      if(!M) break;
      var m = M[0].split('"');
      var f = m[0]; m[0] = "";
      var e = m[m.length-1]; m.length--;
      
      m = f+m.join('"').slice(1).replace(/\n/g,"\\n").replace(/\r/g,"").replace(/\t/g," ").replace(/\"\"/g,'"')+e;
      txt = txt.replace(M[0],m);
      }
   // = txt.split(/\r\n|\n|\r/);
   A = txt.replace(/\r\n|\r/g,'\n').split('\n'); 
   for(var i=0;i<A.length;i++){
      if(A[i].indexOf("\\")>=0) A[i] = A[i].replace(/\\n/g,"\n").replace(/\\x/g,"\\");
      }
   }
else A = txt.replace(/\r\n|\r/g,'\n').split('\n'); 
if(!A[A.length-1]) A.length--; 
A.Pos = 0;
var U = Grids.LastCopy && !nostyles && A.join("").replace(/[\r\n\"\']/g,"")==Grids.LastCopy.Text.replace(/[\r\n\"\']/g,"") ? Grids.LastCopy : null;

var clen = A[0].split("\t").length, whole = 0;
if(cols==5) cols = this.FRect&&foc&&(!sel||!this.GetSelRows().length) ? 0 : 4;
if(this.AutoColPages && (cols==3||cols==4)){
   C = this.GetCopyCols(3);
   if(C.length<clen) for(var i=0;i<10&&C.length<clen;i++) { this.AddAutoColPages(); C = this.GetCopyCols(3); }
   }
else if(cols==4){
   C = this.GetCopyCols(3);
   if(C.length<clen) { C = this.GetCopyCols(1); whole = 1; }
   if(C.length<clen) C = this.GetCopyCols(2);
   }
else { C = this.GetCopyCols(cols); whole = cols!=0; }
if(!C || !C.length) return false;

if(A.length>1){
   var F = this.GetFixedRows(), CC = this.GetCopyCols(this.CopyCols);
   for(var i=0;i<F.length;i++) if(Get(F[i],"CanCopyPaste")==3){
      var th = this.GetRowText(F[i],CC).slice(0,-2); 
      for(var j=0;j<A.length;j++) if(A[j]==th) { A.splice(j,1); j--; }
      }
   }
if(Grids.OnPaste && Grids.OnPaste(this,C,A)) return;
if(A.length > this.SynchroCount/2){
   this.ShowMessage(this.GetText("Paste"));
   var T = this; setTimeout(function(){ T.PasteTextT(A,sel,foc,C,1,U,whole); },10);
   }
else this.PasteTextT(A,sel,foc,C,0,U,whole);
}
// -----------------------------------------------------------------------------------------------------------
// Pastes txt (tab separated) into the row, editable cells only
TGP.PasteTextT = function(A,sel,foc,C,noshow,U,whole){
var E = this.GetErrors("Paste"), ids = null, idpos = null, ganttdep = this.GanttDependency; 
if(this.CopyPasteRows==1) { if(ganttdep) ids = {}; }
else if(ganttdep||this.CopyPasteRows){
   for(var i=0;i<C.length;i++) if(C[i]=="id") { idpos = i; if(ganttdep) { ids = {}; this.NoCheckDep = 1; } break; }
   if(!ids&&this.IdNames&&this.IdNames.length==1&&!this.FullId){
      for(var i=0,id=this.IdNames[0];i<C.length;i++) if(C[i]==id) { idpos = i; if(ganttdep) { ids = {}; this.NoCheckDep = 1; } break; }
      }
   }

// --- Selected ---
var R = sel ? this.GetSelRows() : [];
if(R.length){
   this.StartUpdate();
   for(var i=0;i<R.length&&A.Pos<A.length;i++) if(!R[i].ClipAdded) this.PasteRowText(R[i],C,A,noshow,U,E,ids,idpos,0,1);
   if(this.CopyPasteTree) for(var i=0;i<R.length;i++) R[i].ClipAdded = null;
   }

// --- Focused ---	
else {
   var hid = this.CopyPasteHidden&2, scr = null;
   MS.Add;
   var T = this; function PasteAdd(row,next,one){
      var def = null, sa = T.SuppressAnimations; T.FinishAnimations(); T.SuppressAnimations = 1;
      while(A.Pos<A.length){
         var src = null; 
         if(T.CopyPasteRows){
            var tree = "", B = A[A.Pos].split('\t');
            if(T.CopyPasteTree){
               for(var lev=0;B[0].charAt(lev)==CVoidChar;lev++);
               if(lev) { tree = B[0].slice(0,lev); B[0] = B[0].slice(lev); }
               }
            if(T.CopyPasteRows==1){ var G = Grids[B[0]]; if(G) src = G.GetRowById(B[1]); if(!src) { A.Pos++; continue; } }
            else if(T.CopyPasteRows){ var G = Grids.length==1||T.CopyPasteRows!=2 ? T : Grids[B.shift()]; if(G) r = G.GetRowById(U&&U[A.Pos]?U&&U[A.Pos][0][0]:B[idpos!=null?idpos:0]); if(r&&idpos==null) B.shift(); }
            if(tree) B[0] = tree + B[0];
            }
         if(r) { if(r.CanCopyPaste==2) break; }
         else if(!def) { def = Get(!row||row.Page?T.Root:row,"CDef"); if(!def || !T.Def[def] || T.Def[def].CanCopyPaste==2) break; }
         var r = noshow ? T.AddRow(row,next,0,src) : T.AddRows(0,row,next,0,0,1,null,1,src);
         if(!r) break;
         if(noshow) r.Visible = 1;
         T.PasteRowText(r,C,A,noshow,U,E,ids,idpos,1);
         if(src){
            if(Grids.OnRowCopy) Grids.OnRowCopy(T,r,src);
            if(ids) ids[src.id] = r.id;
            }
         
         if(one) break;
         }
      if(r&&!T.FRow) scr = r;
      T.SuppressAnimations = sa;
      }
   ME.Add;   
   var row = this.FRect ? this.FRect[0] : this.FRow, R = []; if(!row && (foc<5||foc>8&&foc<30) || !foc) return false;
   this.StartUpdate();
   if((foc==11||foc==12) && !this.FRect) foc -= 2; 
   switch(foc){
      case 1: 
      case 11:
      case 12:
         MS.FocusRect; if(this.FRect) for(var r=this.FRect[0],row=this.FRect[2];r!=row&&A.Pos<A.length;r=hid?this.GetNext(r,4):this.GetNextVisible(r,4)) this.PasteRowText(r,C,A,noshow,U,E,ids,idpos); ME.FocusRect;
         if(A.Pos<A.length) this.PasteRowText(row,C,A,noshow,U,E,ids,idpos);
         MS.Add; if(foc!=1 && !(hid?this.GetNext(this.FRect[2],4):this.GetNextVisible(this.FRect[2],4))) PasteAdd(null,null); ME.Add;
         break;
      case 9:
      case 2: 
         if(this.AutoPages) for(var i=0,r=row;r&&i<A.length;i++){ var n = this.GetNextSibling(r); if(!n) { this.AddAutoPages(); if(this.RowIndex) this.UpdateRowIndex(); n = this.GetNextSibling(r); } r = n; }
         this.PasteRowText(row,C,A,noshow,U,E,ids,idpos);
         for(var r=this.GetNextSibling(row);r&&A.Pos<A.length;r=this.GetNextSibling(r)) if(r.Visible||hid) this.PasteRowText(r,C,A,noshow,U,E,ids,idpos);
         MS.Add; if(foc==9) PasteAdd(null,null); ME.Add;
         break;
      case 10:
      case 3: 
         if(this.AutoPages) for(var i=0,r=row;r&&i<A.length;i++){ var n = hid?this.GetNext(r,1):this.GetNextVisible(r,1); if(!n) { this.AddAutoPages(); if(this.RowIndex) this.UpdateRowIndex(); n = hid?this.GetNext(r,1):this.GetNextVisible(r,1); } r = n; }
         this.PasteRowText(row,C,A,noshow,U,E,ids,idpos);
         for(var r=hid?this.GetNext(row,1):this.GetNextVisible(row,1);r&&A.Pos<A.length;r=hid?this.GetNext(r,1):this.GetNextVisible(r,1)) this.PasteRowText(r,C,A,noshow,U,E,ids,idpos);
         MS.Add; if(foc==10) PasteAdd(null,null); ME.Add;
         break;    
      case 4: 
         this.PasteRowText(row,C,A,noshow,U,E,ids,idpos);
         MS.Add; PasteAdd(row.parentNode,row.nextSibling); ME.Add;   
         break;   
      case 7: 
         if(A.length==1 && A[0].indexOf('\t')<0 && row) { this.PasteRowText(row,C,A,noshow,U,E,ids,idpos); break; }
         
      case 5: 
         MS.Add; if(row&&!row.Fixed) PasteAdd(row.parentNode,row,1); else PasteAdd(null,null,1); ME.Add;   
         break;   
      case 8: 
         if(A.length==1 && A[0].indexOf('\t')<0 && row) { this.PasteRowText(row,C,A,noshow,U,E,ids,idpos); break; }
         
      case 6: 
         MS.Add; if(row&&!row.Fixed) PasteAdd(row.parentNode,row); else PasteAdd(null,null); ME.Add;   
         break; 
      case 20: 
      case 21: 
         for(var r=(row.parentNode.Page?this.XB.firstChild:row.parentNode).firstChild;r&&A.Pos<A.length;r=this.GetNextSibling(r)) {
            if(r.Visible||foc==21) this.PasteRowText(r,C,A,noshow,U,E,ids,idpos);
            }
         if(foc==21){
            MS.Add;
            for(;r;r=this.GetNextSibling(r)) this.DeleteRowT(r,2);
            PasteAdd(row.parentNode,null);
            ME.Add;   
            }   
         break;
      case 30: 
         if(this.CopyPasteTree) { for(var r=this.XB.firstChild.firstChild;r&&A.Pos<A.length;r=this.GetNextSibling(r)) if(r.Visible) this.PasteRowText(r,C,A,noshow,U,E,ids,idpos); }
         else for(var r=this.GetFirstVisible();r&&A.Pos<A.length;r=this.GetNextVisible(r)) this.PasteRowText(r,C,A,noshow,U,E,ids,idpos);
         break;
      case 31: 
      case 32: 
         if(this.CopyPasteTree) { for(var r=this.XB.firstChild.firstChild;r&&A.Pos<A.length;r=this.GetNextSibling(r)) this.PasteRowText(r,C,A,noshow,U,E,ids,idpos); }
         else for(var r=this.GetFirst();r&&A.Pos<A.length;r=this.GetNext(r)) this.PasteRowText(r,C,A,noshow,U,E,ids,idpos);
         if(foc==32){
            MS.Add;
            for(;r;r=this.GetNext(r)) this.DeleteRowT(r,2);
            PasteAdd(null,null);
            ME.Add;   
            }   
         break;
      default: MS.Debug;this.Debug(2,"Unknown value for ","PasteFocused"," attribute - ",foc); ME.Debug;
      }
  }    


this.EndUpdate();


if(noshow){
   this.Calculate(2);
   var F = this.GetFixedRows(); for(var i=0;i<F.length;i++) this.RefreshRow(F[i]);
   MS.Paging; if(this.Paging && this.Paging!=3 && this.PasteFocused==32) this.CreatePages(); ME.Paging;
   this.RenderBody();
   }
else if(scr) this.ScrollIntoView(scr);
if(Grids.OnPasteFinish) Grids.OnPasteFinish(this);
if(this.PasteErrors==2||this.PasteErrors&&!whole) this.ProcessErrors(E);
}
// -----------------------------------------------------------------------------------------------------------
// Pastes txt (tab separated) into the row, editable cells only
TGP.PasteRowText = function(row,cols,A,noshow,U,E,ids,idpos,added,sel){
if(row.Deleted&&!(this.CopyPasteDeleted&2)) return;
var F = U?U[A.Pos]:null, B = A[A.Pos++].split("\t"), p = 0, chg = 0, lev = 0;
if(Grids.OnPasteRow && Grids.OnPasteRow(this,row,cols,B,added)) return;

if(this.CopyPasteTree){
   while(B[0].charAt(lev)==CVoidChar) lev++;
   if(lev) B[0] = B[0].slice(lev);
   if(sel && row.Selected) row.ClipAdded = 1;
   }

var G = null, r = null, L = this.GetLastUndo();
if(this.CopyPasteRows==1){ G = Grids[B[0]]; if(G) r = G.GetRowById(B[1]); }
else if(this.CopyPasteRows){ G = Grids.length==1||this.CopyPasteRows!=2 ? this : Grids[B.shift()]; if(G) r = G.GetRowById(F?F[0][0]:B[idpos!=null?idpos:0]); if(r&&idpos==null) B.shift(); }
if(G&&r) {
   var N = {DetailRow:1,DetailGrid:1,MasterRow:1,r0:1,r1:1,r2:1,Count:1,Hasch:1,Selected:1,Visible:1,Added:1,Deleted:1,Changed:1,Moved:1,Level:1,LevelImg:1,Def:G!=this};
   
   if(r.RowSpan) { N.RowSpan = 1; for(var c in this.Cols) N[c+"RowSpan"] = 1; }
   if(r.Calculated) for(var c in this.Cols) if(Get(r,c+"Formula")) N[c] = 1; 
   MS.GenId; if(added) for(var i=0;i<this.IdNames.length;i++) N[this.IdNames[i]] = 1; ME.GenId; 
   
   for(var i in r) if(!Grids.INames[i] && !N[i] && r[i]!=null) row[i] = r[i];
   if(G!=this && r.Def.Name!=row.Def.Name){
      if(this.Def[r.Def.Name]) row.Def = this.Def[r.Def.Name];
      else for(var i in r.Def) if(row[i]==null) row[i] = r.Def[i];
      }
   if(!added){
      if(Grids.OnRowCopyId) Grids.OnRowCopyId(this,row,r);
      this.SetRowId(row);
      if(this.SetIds) this.SetRowsId(row);
      }
   if(r.Spanned) { this.UpdateSpan(row); this.RefreshRow(row); }
   
   }
if(this.CopyPasteRows!=1) for(var i=0;i<cols.length;i++){
   if(sel && row.Selected&2 && !row[cols[i]+"Selected"]) continue;
   var col = cols[i], val = B[p++], f = F ? F[i] : null; 
   if(f && !U.Grid.Rows[f[0]]) f = null; 
   if(val==null&&!f) continue;
   var can = Get(row,col+"CanPaste"); if(can==0) continue;
   if(f&&f[2]) val = this.Lang.Format.FormulaPrefix + this.MoveEditFormula(row,col,U.Grid.Rows[f[0]],f[1],f[2],null,U.Grid);
   else if(f) val = f[3]; 
   else {
      val = this.GetValueInput(row,col,val);
      if(!val&&isNaN(val)){
         if(!this.PasteNaN) {
            if(E) E.Errors.push([this.GetText("PasteError"),row,col,B[p-1]]);
            continue;
            }
         if(this.PasteNaN==2) {
            if(E) E.Errors.push([this.GetText("PasteChanged"),row,col,B[p-1]]);
            val = this.GetValueInput(row,col,"");
            }
         }
      }
   if(Grids.OnPasteValue) {
      var o = Get(row,col); if(U&&U.Attrs.Formula && row[col+"EFormula"]) o = row[col+"EFormula"];
      var tmp = Grids.OnPasteValue(this,row,col,val,o,f?f[4]:null,U?U.Attrs:null,E);
      if(tmp===o) continue;
      if(tmp!=null) val = tmp; 
      }
   
   if(this.SetEditAttrs(row,col,val,U?U.Attrs:{length:0,Value:1},f?f[4]:[],E,can==2,null,"PasteCells")) chg++;
   else if(G&&r) this.RefreshCell(row,col);
   }

if(chg) this.UpdateRowHeight(row);
MS.GenId; if(added && this.IdMore) this.UpdateNewId(row,"id",this.SetIds,1,2); ME.GenId;

MS.Tree;
if(this.CopyPasteTree && A[A.Pos]&&A[A.Pos].charAt(0)==CVoidChar){
   var r = row.firstChild;
   while(1){
      var BB = A[A.Pos]; 
      if(!BB) {
         if(r && this.PasteTree==2) for(;r;r=r.nextSibling) this.DeleteRowT(r,2);
         break;
         }
      for(var nl=0;BB.charAt(nl)==CVoidChar;nl++);
      if(nl<=lev) break;
      if(this.CopyPasteTree==1&&!row.Expanded){ A.Pos++; continue; } 
      var added2 = 0, src = null;
      if(!r && this.PasteTree==2 && this.AddRows) { 
         if(this.CopyPasteRows==1){ var BB = BB.slice(nl).split('\t'), G = Grids[BB[0]]; if(G) src = G.GetRowById(BB[1]); if(!src) { A.Pos++; continue; } }
         else if(this.CopyPasteRows){ var BB = BB.slice(nl).split('\t'), G = Grids.length==1||this.CopyPasteRows!=2 ? this : Grids[BB.shift()]; if(G) src = G.GetRowById(F?F[0][0]:BB[idpos!=null?idpos:0]); if(src&&idpos==null) BB.shift(); }
         r = this.AddRows(0,row,null,0,0,1,null,1,src); added2 = 1; 
         }
      if(r && (this.CopyPasteTree==3 || r.Visible)) { 
         this.PasteRowText(r,cols,A,noshow,U,E,ids,idpos,added2,sel);
         if(src && Grids.OnRowCopy) Grids.OnRowCopy(this,r,src);
         r = r.nextSibling;
         continue; 
         }
      while(1){ 
         BB = A[++A.Pos]; 
         if(!BB) break;
         for(var nnl=0;BB.charAt(nnl)==CVoidChar;nnl++);
         if(nnl<=nl) break;
         }
      if(r) r = r.nextSibling;   
      }
   MS.Undo; if(L && L.Row==row) L.Expanded = row.Expanded; ME.Undo;
   }
ME.Tree;   

if(Grids.OnPasteRowFinish) Grids.OnPasteRowFinish(this,row,cols,B,added);
if(ids && idpos!=null) ids[B[idpos]] = row.id;
return chg;
}
// -----------------------------------------------------------------------------------------------------------
// Returns or creates textarea Grids.Clipboard
TGP.GetClipboard = function(){
var T = Grids.Clipboard;
if(T) return T;
T = document.createElement("textarea");
Grids.Clipboard = T;
T.style.position = BIE ? "absolute" : "fixed";
T.style.top = "-2500px";
T.rows = 100; 
T.cols = 150;
if(!this.Rtl) T.style.left = "-2500px";
else {
   
   }
AppendTag(T);
return Grids.Clipboard;
}
// -----------------------------------------------------------------------------------------------------------
TGP.PasteFromClipboard = function(sel,foc,cols,nostyles){
if(this.Pasting==0) return false;
if((!foc || (foc<5||foc>8&&foc<30) && !this.FRow) && (!sel || !this.GetSelRows().length)) return false;
if(this.CopyPasteInternal==1) this.PasteText(Grids.Clip,sel,foc,cols,nostyles);
else if(this.CopyPasteInternal==2) this.PasteText(this.Clip,sel,foc,cols,nostyles);
else {
   if(BIE) { var bs = GetWindowScroll(); }
   var T = this.GetClipboard(), G = this;
   T.value = "";
   T.onkeyup = function(){ 
      var val = this.value;
      this.blur();
      this.onkeyup = null;
      G.PasteText(val,sel,foc,cols,nostyles);
      T.onkeyup = null;
      }
   T.focus();
   T.select();
   if(BIE){
      SetWindowScroll(bs[0],bs[1]);
      setTimeout(function(){ 
         SetWindowScroll(bs[0],bs[1]);  
         if(T.onkeyup && T.value) T.onkeyup();  
         },10); 
      }
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionPaste = function(){ return this.PasteFromClipboard(this.PasteSelected,this.PasteFocused,this.PasteCols); }
TGP.ActionPasteValues = function(){ return this.PasteFromClipboard(this.PasteSelected,this.PasteFocused,this.PasteCols,1); } 
// -----------------------------------------------------------------------------------------------------------
TGP.ActionPasteToRow = function(){ return this.PasteFromClipboard(0,1,4); }
TGP.ActionPasteToRowFill = function(){ return this.PasteFromClipboard(0,2,4); }
TGP.ActionPasteToRowAdd = function(){ return this.PasteFromClipboard(0,4,4); }
TGP.ActionPasteToNewRow = function(){ return this.PasteFromClipboard(0,6,4); }
TGP.ActionPasteToSelected = function(){ return this.PasteFromClipboard(1,0,4); }

TGP.ActionPasteToRowFirst = function(){ return this.PasteFromClipboard(0,1,1); }
TGP.ActionPasteToRowFillFirst = function(){ return this.PasteFromClipboard(0,2,1); }
TGP.ActionPasteToRowAddFirst = function(){ return this.PasteFromClipboard(0,4,1); }
TGP.ActionPasteToNewRowFirst = function(){ return this.PasteFromClipboard(0,6,1); }
TGP.ActionPasteToSelectedFirst = function(){ return this.PasteFromClipboard(1,0,1); }

TGP.ActionPasteToCol = function(){ return this.PasteFromClipboard(0,3,0); }
TGP.ActionPasteToColLevel = function(){ return this.PasteFromClipboard(0,2,0); }
TGP.ActionPasteToColFill = function(){ return this.PasteFromClipboard(0,3,3); }
TGP.ActionPasteToColFillLevel = function(){ return this.PasteFromClipboard(0,2,3); }

TGP.ActionPasteToColFirst = function(){ return this.PasteFromClipboard(0,30,0); }
TGP.ActionPasteToColLevelFirst = function(){ return this.PasteFromClipboard(0,20,0); }
TGP.ActionPasteToColFillFirst = function(){ return this.PasteFromClipboard(0,30,3); }
TGP.ActionPasteToColFillLevelFirst = function(){ return this.PasteFromClipboard(0,20,3); }
// -----------------------------------------------------------------------------------------------------------
ME.Paste;

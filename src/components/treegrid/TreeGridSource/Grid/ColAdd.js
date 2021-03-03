// -----------------------------------------------------------------------------------------------------------
// Adding and deleting columns
// -----------------------------------------------------------------------------------------------------------
MS.ColHide;
// -----------------------------------------------------------------------------------------------------------
// Adds one column to given section on given position and returns its object. Shows it, if show == true
// If width is not set, it is calculated automatically
TGP.AddCol = function(col,mainsec,pos,param,show,type,caption,parampos){
if(this.Cols[col]) return null;
var C = {}, sec, D = null; if(param) D = this.DefCols[param.Def]; 
if(!D) D = this.DefCols["C"];
for(var c in D) C[c] = D[c];
for(var n in this.Def) if(this.Def[n][col]==null) this.Def[n][col] = ""; 
this.Cols[col] = C;
if(param&&parampos&&param.MainSec!=null&&param.Sec!=null&&param.Pos!=null){ 
   mainsec = param.MainSec; sec = param.Sec; pos = param.Pos;
   }
else if(mainsec==0) sec = 0;
else if(mainsec==2) sec = this.ColNames.length-1;
else {
   var CN = this.ColNames;
   mainsec = 1;
   if(!pos&&pos!==0||pos<0) pos = 1e10;
   for(var sec=1;CN[sec]&&pos>=CN[sec].length;sec++) pos -= CN[sec].length;
   if(!CN[sec]||sec==this.ColNames.length-1){ sec = this.ColNames.length-2; pos = CN[sec].length; }
   }
C.Group = 0;
C.Block = 0;
C.SelectedCells = 0;
if(param){
   if(typeof(param)=="object"){ 
      if(param.Visible&&!show) show = 1; 
      for(var p in param) C[p] = param[p]; 
      if(C.Removed) C.Removed = 0;
      if(C.Selected) C.Selected = 0;
      }
   else { C.Width = param; C.AutoWidth = 0; param = null; } 
   }
if(this.AllColsSelected && (C.CanSelect==1||C.CanSelect==2)){
   if(this.SelectAllType&16) C.Selected = 1;
   else if(this.SelectAllType&2) this.SetAllColsSelected(0);
   }
if(show==-1){ C.Visible = 0; show = 0; }
C.Sec = sec;
C.MainSec = mainsec;
var CN = this.ColNames[sec];
if(!(pos>=0 && pos<=CN.length)) { pos = CN.length; CN[pos] = col; }
else { CN.splice(pos,0,col); for(var i=CN.length-1;i>pos;i--) this.Cols[CN[i]].Pos = i; }
C.Pos = pos;
C.Name = col;
if(C.WidthPad==null || C.WidthPadSet) { C.WidthPad = this.Img.WidthPad; C.WidthPadSet = 1; }

MS.RelWidth; 
if(C.ConstWidth) { 
   C.Type = "Html"; 
   for(var a in CConstWidth) if(!param || param[a]==null) C[a] = CConstWidth[a]; 
   if(C.RelWidth) { C.Hidden = 1; C.RelHidden = 1; }
   } 
ME.RelWidth;
if(type) C.Type = type;
var F = this.GetFixedRows();
for(var i=0;i<F.length;i++) {
   var r = F[i];
   if(r.CellDef&&!C.ConstWidth){ var CD = this.Def[r.CellDef]; if(CD) for(var n in CD) if(n!="Name"&&r[col+n]==null) r[col+n] = CD[n]; }
   if(r[col+"CellDef"]){ var CD = this.Def[r[col+"CellDef"]]; if(CD) for(var n in CD) if(n!="Name"&&r[col+n]==null) r[col+n] = CD[n]; }
   if(r[col+"Def"]&&col!="C"){ var CD = this.Def[r[col+"Def"]]; if(CD) for(var n in CD) if(n!="Name"&&r[col+n]==null) r[col+n] = CD[n]; } 
   if(r.Kind=="Header") {
      if(caption) r[col] = caption; else if(r[col]==null&&r.ShowColNames!=0) r[col] = col;
      this.UpdateColHeader(r,col);
      }
   if(r.ShowColNames){
      if(caption) r[col] = caption; else if(r[col]==null) r[col] = col;
      if(C.Type!="Text"&&C.Type!="Html"&&C.Type!="Panel"&&(!r.Def||r.Def[col+"Type"]==null)) r[col+"Type"] = Get(r,"NoEscape") ? "Html" : "Text";
      }
   MS.Filter; if(r.Kind=="Filter") this.UpdateColFilter(r,col); ME.Filter;
   }
for(var n in this.Def){
   var r = this.Def[n];
   if(r.CellDef&&!C.ConstWidth){ var CD = this.Def[r.CellDef]; if(CD) for(var n in CD) if(n!="Name"&&r[col+n]==null) r[col+n] = CD[n]; }
   if(r[col+"CellDef"]){ var CD = this.Def[r[col+"CellDef"]]; if(CD) for(var n in CD) if(n!="Name"&&r[col+n]==null) r[col+n] = CD[n]; }
   if(r[col+"Def"]&&col!="C"){ var CD = this.Def[r[col+"Def"]]; if(CD) for(var n in CD) if(n!="Name"&&r[col+n]==null) r[col+n] = CD[n]; } 
   }
if(this.AddColCellDef){
   for(var r=this.GetFirst();r;r=this.GetNext(r)){
      if(r.CellDef&&!C.ConstWidth){ var CD = this.Def[r.CellDef]; if(CD) for(var n in CD) if(n!="Name"&&r[col+n]==null) r[col+n] = CD[n]; }
      if(r[col+"CellDef"]){ var CD = this.Def[r[col+"CellDef"]]; if(CD) for(var n in CD) if(n!="Name"&&r[col+n]==null) r[col+n] = CD[n]; }
      if(r[col+"Def"&&col!="C"]){ var CD = this.Def[r[col+"Def"]]; if(CD) for(var n in CD) if(n!="Name"&&r[col+n]==null) r[col+n] = CD[n]; } 
      }
   }
var min = this.Img.CellBorderWidth;
if(!C.MinWidth) C.MinWidth = 0;

if(this.ColSpan){
   var spn = col+"Span";
   function UpdateSpan(row){
      for(var r=row.firstChild;r;r=r.nextSibling) { 
         
         if(r.Spanned) r[spn] = 1;
         if(r.firstChild) UpdateSpan(r); 
         }
      }
   for(var r=this.XB.firstChild;r;r=r.nextSibling) UpdateSpan(r);
   UpdateSpan(this.XH);
   UpdateSpan(this.XF);
   if(C.Spanned) this.SpanCols[col] = C;
   }

if(C.Width==null) {
   if(this.Loading) C.AutoWidth = true;
   else this.CalcWidth(col,1);
   }

C.Visible = 0;
MS.ColSpan; if(this.ColSpan) this.AddColSpan(col,1); ME.ColSpan;
if(C.Hidden && !CN.Visible) CN.Visible = 1;
if(CN.length==1) this.UpdateSecCount();
if(show) this.ShowCol(col);
MS.ColTree; this.AddColLevel(col); ME.ColTree;
delete this.CalcOrders["**00"]; delete this.CalcOrders["**01"]; 

return C;
}
// -----------------------------------------------------------------------------------------------------------
MS.ColSpan;
TGP.AddColSpan = function(col,cnt,noshow,row,del,OO,U){
var chg = 0, O = OO ? OO : {};
if(!row){
   chg += this.AddColSpan(col,cnt,noshow,this.XH,del,O,U);
   chg += this.AddColSpan(col,cnt,noshow,this.XF,del,O,U);
   for(var b=this.XB.firstChild;b;b=b.nextSibling) chg += this.AddColSpan(col,cnt,noshow,b,del,O,U);
   if(!noshow&&!OO) for(var ro in O) this.RefreshRow(O[ro]); 
   if(!OO&&U) U.RefreshRow = O;
   return chg;
   }
var C = this.Cols[col], S = this.ColNames[C.Sec], p = C.Pos, oc = S[p-1], nc = S[p+cnt]; 
if(this.CPLastSec && C.MainSec==1 && row.Fixed){ 
   for(var i=1;i<C.Sec;i++) p += this.ColNames[i].length;
   S = this.GetAllColPages();
   }
for(var r=row.firstChild;r;r=r.nextSibling){
   if(r.firstChild) chg += this.AddColSpan(col,cnt,noshow,r,del,O,U);
   if(!r.Spanned) continue;
   if(!nc || r[nc+"Span"]!=0){
      for(var i=0;i<del&&p-i>0;i++) if(r[S[p-1-i]+"Span"]!=0) break;
      if(i!=del||!del){ 
         for(var i=0;i<cnt;i++) if(r[S[p+i]+"Span"]==null) { if(U) U.push(r.id,S[p+i]+"Span",1,null); r[S[p+i]+"Span"] = 1; }
         continue;
         }
      }
   chg++;
   for(var i=1;r[S[p-i]+"Span"]==0;i++);
   var mc = S[p-i];
   if(U) { U.push(r.id,mc+"Span",r[mc+"Span"]+cnt,r[mc+"Span"]); for(var i=0;i<cnt;i++) U.push(r.id,S[p+i]+"Span",0,r[S[p+i]+"Span"]); }
   r[mc+"Span"] += cnt;
   for(var i=0;i<cnt;i++) r[S[p+i]+"Span"] = 0;
   MS.RowSpan; 
   if(r.RowSpan){
      var rspn = r[mc+"RowSpan"]; if(rspn==null) rspn = 1;
      var rxspn = rspn>1 ? rspn : 1;
      for(var i=0;i<cnt;i++) {
         if(r[S[p+i]+"RowSpan"]>rxspn) for(var j=r[S[p+i]+"RowSpan"],rr=r;j>0&&rr;j--,rr=rr.nextSibling) { if(U) U.push(rr.id,S[p+i]+"RowSpan",1,rr[S[p+i]+"RowSpan"]); rr[S[p+i]+"RowSpan"] = 1; if(rr.firstChild) this.ResetHidden(rr,S[p+i],O,null,U); }
         else if(r[S[p+i]+"RowSpan"]==0){
            for(var rr=r;rr&&rr[S[p+i]+"RowSpan"]==0;rr=rr.nextSibling) { if(U) U.push(rr.id,S[p+i]+"RowSpan",1,rr[S[p+i]+"RowSpan"]); rr[S[p+i]+"RowSpan"] = 1; if(rr.firstChild) this.ResetHidden(rr,S[p+i],O,null,U); }
            for(var rr=r.previousSibling,j=1;rr&&rr[S[p+i]+"RowSpan"]==0;rr=rr.previousSibling,j++);
            if(U) U.push(rr.id,S[p+i]+"RowSpan",j,rr[S[p+i]+"RowSpan"]);
            rr[S[p+i]+"RowSpan"] = j;
            }
         if(U) U.push(r.id,S[p+i]+"RowSpan",rspn,r[S[p+i]+"RowSpan"]);
         r[S[p+i]+"RowSpan"] = rspn;
         }
      }
   ME.RowSpan;
   O[r.id] = r;
   }

if(!noshow&&!OO) for(var ro in O) this.RefreshRow(O[ro]); 
return chg;
}
ME.ColSpan;
// -----------------------------------------------------------------------------------------------------------
MS.ColSpan;
TGP.DelColSpan = function(col,cnt,noshow,row,OO,U){
var chg = 0, O = OO ? OO : {};
if(!row){
   chg += this.DelColSpan(col,cnt,noshow,this.XH,O,U);
   chg += this.DelColSpan(col,cnt,noshow,this.XF,O,U);
   for(var b=this.XB.firstChild;b;b=b.nextSibling) chg += this.DelColSpan(col,cnt,noshow,b,O,U);
   if(!noshow&&!OO) for(var ro in O) this.RefreshRow(O[ro]); 
   if(!OO&&U) U.RefreshRow = O;
   return chg;
   }
var C = this.Cols[col], S = this.ColNames[C.Sec], p = C.Pos;
if(this.CPLastSec && C.MainSec==1 && row.Fixed){ 
   for(var i=1;i<C.Sec;i++) p += this.ColNames[i].length;
   S = this.GetAllColPages();
   }
for(var r=row.firstChild;r;r=r.nextSibling){
   if(r.firstChild) chg += this.DelColSpan(col,cnt,noshow,r,O,U);
   if(!r.Spanned) continue;
   if(r[col+"Span"]==0){ 
      for(var i=1;r[S[p-i]+"Span"]==0;i++);
      var sp = r[S[p-i]+"Span"];
      if(U) U.push(r.id,S[p-i]+"Span",sp>i+cnt?sp-cnt:i,r[S[p-i]+"Span"]);
      r[S[p-i]+"Span"] = sp > i+cnt ? sp-cnt : i;
      chg++;
      }
   for(var i=0;i<cnt;i++){
      var sp = r[S[p+i]+"Span"];
      if(sp>1){ 
         chg++;
         if(sp>cnt-i){
            
            for(var j=r[S[p+i]+"Span"]-cnt+i-1;j>=0;j--) {
               if(U) U.push(r.id,S[p+cnt+j]+"Span",1,r[S[p+cnt+j]+"Span"]);
               r[S[p+cnt+j]+"Span"] = 1;
               }
            MS.RowSpan; if(r.RowSpan) for(var j=r[S[p+i]+"Span"]-cnt+i-1;j>=0;j--) { if(U) U.push(r.id,S[p+cnt+j]+"RowSpan",1,r[S[p+cnt+j]+"RowSpan"]); r[S[p+cnt+j]+"RowSpan"] = 1; } ME.RowSpan;
            if(U) U.push(r.id,S[p+i]+"Span",cnt-i,r[S[p+i]+"Span"]);
            r[S[p+i]+"Span"] = cnt-i;
            O[r.id] = r;
            break;
            }
         else i += sp-1;
         }
      else if(sp==0){
         MS.RowSpan; if(r.RowSpan) { if(U) U.push(r.id,S[p+i]+"RowSpan",1,r[S[p+i]+"RowSpan"]); r[S[p+i]+"RowSpan"] = 1; } ME.RowSpan;
         if(U) U.push(r.id,S[p+i]+"Span",1,r[S[p+i]+"Span"]);
         r[S[p+i]+"Span"] = 1;
         chg++;
         }
      }
   }
if(!noshow&&!OO) for(var ro in O) this.RefreshRow(O[ro]); 
return chg;
}
ME.ColSpan;
// -----------------------------------------------------------------------------------------------------------
// Deletes column
TGP.DelCol = function(col,undo,UU){
var C = this.Cols[col]; if(!C) return;
var zal = this.FastColumns; this.FastColumns = 0;
MS.ColTree; this.DelColLevel(col,undo); ME.ColTree;
var hid = 0; if(!C.Visible&&C.Hidden) { C.Visible = 1; hid = 1; }
this.HideCol(col,0,1);
this.HideFCol();
this.FastColumns = zal;
MS.ColSpan; 
if(this.ColSpan) { 
   var U = UU ? UU : this.Undo&&undo ? this.GetUndoSpan() : null; 
   this.DelColSpan(col,1,null,null,null,U); 
   if(U&&!UU) this.AddUndo({Type:"RemoveSpan",Data:U,Remove:1}); 
   if(this.SpanCols[col]) delete this.SpanCols[col];
   }
ME.ColSpan;

var CN = this.ColNames[C.Sec];
CN.splice(C.Pos,1);
if(CN.length==0) this.RemoveColPage(C.Sec,1,0);
else for(var i=C.Pos;i<CN.length;i++) this.Cols[CN[i]].Pos = i;
delete this.Cols[col];
if(!CN.length) this.UpdateSecCount();

if(col==this.MainCol) { this.MainCol = null; this.CalculateSpaces(1); }
C.Removed = 1;
this.RemovedCols[col] = 1;
if(hid) this.UpdateSecCount();
 
}
TGP.RemoveCol = TGP.DelCol;
// -----------------------------------------------------------------------------------------------------------
TGP.AddCols = function(fc,tocol,right,empty,focus,noshow){

if(Grids.OnColsAdd && Grids.OnColsAdd(this,fc,tocol,right,empty)) return false;
var TC = this.Cols[tocol], mainsec, pos;
if(!TC){
   mainsec = tocol-0+""==tocol ? tocol-0 : 1;
   if(right){ tocol = this.GetLastCol(mainsec,null,2); if(tocol) TC = this.Cols[tocol]; else pos = 0; }
   else pos = 0;
   }
if(TC){
   mainsec = TC.MainSec;
   pos = TC.Pos+(right?1:0);
   if(mainsec==1) for(var sec=TC.Sec-1;sec>0;sec--) pos += this.ColNames[sec].length;
   }
var copy = fc-0 ? 0 : 1, cnt = copy ? fc.length : fc-0, cols = [], A = this.GetEditAttrs(1,empty?4:0), al = A.length, dupname = copy&&!empty&&!this.AutoColPages;
if(A.Span) for(var i=0;i<al;i++) if(A[i]=="Span" || A[i]=="RowSpan"){ A.splice(i--,1); al--; }
this.UndoStart();
var vis = {};
for(var j=0;j<cnt;j++){
   var col = dupname ? fc[j] : "C", c = copy ? fc[j] : null;
   for(var i=1;this.Cols[col+i]||this.RemovedCols[col+i];i++);
   col += i; 
   var FC = this.Cols[c]; 
   var C = this.AddCol(col,mainsec,pos,FC,noshow?0:-1);
   C.Added = 1;
   C.Hidden = 0;
   vis[col] = FC.Visible||empty;
   
   if(!C) continue;
   C.HasIndex = null;
   pos++;
   if(FC && al) {
      for(var id in this.Rows){
         var r = this.Rows[id], D = r.Def;
         for(var i=0;i<al;i++){ r[col+A[i]] = r[c+A[i]]; D[col+A[i]] = D[c+A[i]]; }
         }
      if(A.Value){
         var F = this.GetFixedRows();
         for(var i=0;i<F.length;i++) if((F[i].Kind=="Header"&&F[i].ShowColNames!=0||F[i].ShowColNames) && F[i][c]==c) F[i][col] = col;
         }
      }
   cols[j] = col;
   this.AddUndo({Type:"AddCol",Col:col,Copy:c,Empty:empty,C:C,Visible:vis[col]});
   }
var mc = this.MainCol, U = this.Undo ? this.GetUndoSpan() : null;
MS.ColSpan;
if(A.Span && copy){
   var adj = this.Cols[cols[0]].Sec==this.Cols[fc[fc.length-1]].Sec&&this.Cols[cols[0]].Pos==this.Cols[fc[fc.length-1]].Pos+1;
   for(var id in this.Rows){ 
      var r = this.Rows[id]; 
      if(r.Spanned){
         for(var j=0,chg=0;j<cnt;j++) if(r[fc[j]+"Span"]>1) {  
            var v = r[fc[j]+"Span"] > cnt-j ? cnt-j : r[fc[j]+"Span"];
            if(U) U.push(r.id,cols[j]+"Span",v,r[cols[j]+"Span"]);
            r[cols[j]+"Span"] = v; chg = 1;
            }
         if(r[fc[0]+"Span"]==0){
            if(adj&&!chg){
               var cc = this.GetSpanCol(r,fc[0]); if(U) U.push(r.id,cc+"Span",r[cc+"Span"]+cnt,r[cc+"Span"]); r[cc+"Span"] += cnt; chg = 1;
               }
            else {
               chg = 1;
               if(mc){ var cc = this.GetSpanCol(r,fc[0]); if(r[cc+"Visible"]==-2) for(var j=0;j<cnt;j++) if(r[fc[j]+"Span"]==0) { if(U) U.push(r.id,fc[j]+"Visible",-2,r[fc[j]+"Visible"]); r[fc[j]+"Visible"] = -2; } }
               for(var j=0;j<cnt;j++) if(r[fc[j]+"Span"]==0) { if(U) U.push(r.id,fc[j]+"Span",1,0); r[fc[j]+"Span"] = 1; }
               }
            }
         if(chg) { this.UpdateSpan(r); if(U) { U.UpdateSpan[r.id] = 1; U.RefreshRow[r.id] = 1; } }
         }
      }
   }
ME.ColSpan;
MS.RowSpan;
if(A.RowSpan && copy){
   for(var id in this.Rows){ 
      var r = this.Rows[id]; 
      if(r.RowSpan) for(var j=0;j<cnt;j++) if(r[fc[j]+"RowSpan"]!=null && r[cols[j]+"RowSpan"]==null) { if(U) U.push(r.id,cols[j]+"RowSpan",r[fc[j]+"RowSpan"],r[cols[j]+"RowSpan"]); r[cols[j]+"RowSpan"] = r[fc[j]+"RowSpan"]; }
      if(mc) for(var j=0;j<cnt;j++) if(r[fc[j]+"Visible"]==-2) { if(U) U.push(r.id,cols[j]+"Visible",-2,r[cols[j]+"Visible"]); r[cols[j]+"Visible"] = -2; }
      }
   }
ME.RowSpan;
if(U) this.AddUndo({Type:"AddSpan",Data:U});
if(!noshow){
   if(cnt>1) { var zal = this.Rendering; this.Rendering = 1; }
   for(var j=0;j<cnt;j++) if(cols[j]&&vis[cols[j]]) this.ShowCol(cols[j]);
   if(cnt>1) { this.Rendering = zal; this.Update(); }
   }
if(copy && A.Formula){
   var chg = 0;
   for(var id in this.Rows){
      for(var j=0;j<cols.length;j++) if(cols[j]){
         var r = this.Rows[id];
         if(r[fc[j]+"EFormula"]){
            r[cols[j]+"EFormula"] = this.MoveEditFormula(r,cols[j],r,fc[j],r[fc[j]+"EFormula"]);
            chg = 1;
            }
         }
      }
   if(chg&&!this.CalculateColumns) this.CalculateEdit(!noshow);
   }
if(focus){
   var R = null, FR = this.FRect, F = this.FRow; if(!F) F = this.GetFirstVisible();
   if(cnt>1) R = [FR?FR[0]:F,cols[0],FR?FR[2]:F,cols[cols.length-1],null,null,null,FR[7]];
   else if(FR && FR[0]!=FR[2]) R = [FR[0],cols[0],FR[2],cols[0],null,null,null,FR[7]];
   this.Focus(F,cols[0],null,R,2+(FR[7]?16:0));
   }
this.UndoEnd();
if(this.CalculateColumns) this.Calculate(1);
return cols;
}
// -----------------------------------------------------------------------------------------------------------
TGP.AddSelCols = function(F,T,S,right,empty){ 
var col = this.GetACol(F&5?F&5:5,!S&&!empty?0:right?2:1), C = this.Cols[col], A; if(!C) return false;
var and = [4,1,2][C.MainSec]; if(!(this.ColAdding&and)||!empty&&!(this.ColCopying&and)||this.Locked["addcol"]) return false;
if(!S) A = [col];
else {
   A = []; var N = this.GetACols(S);
   for(var n in N) { var c = N[n]; if(!(c.Deleted || !empty&&(!c.CanCopy||c.CanCopy==1&&c.MainSec!=C.MainSec))) A[A.length] = n; }
   }
if(!A.length||T) return A.length;
var ncols = this.AddCols(A,col,right,empty,1);
MS.Animate; 
if(!empty) this.AnimCols(A,S&3?"CopyColsFrom":"CopyColFrom");
this.AnimCols(ncols,S&3?(empty?"AddCols":"CopyColsTo"):(empty?"AddCol":"CopyColTo")); 
ME.Animate;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionAddCol = function(F,T){ return this.AddSelCols(F,T,0,0,1); }
TGP.ActionAddColNext = function(F,T){ return this.AddSelCols(F,T,0,1,1); }
TGP.ActionAddCols = function(F,T){ return this.AddSelCols(F,T,F&~5|1,0,1); }
TGP.ActionAddColsNext = function(F,T){ return this.AddSelCols(F,T,F&~5|1,1,1); }
TGP.ActionAddSelectedCols = function(F,T){ return this.AddSelCols(F,T,F&~5|2,0,1); }
TGP.ActionAddSelectedColsNext = function(F,T){ return this.AddSelCols(F,T,F&~5|2,1,1); }
TGP.ActionCopyCol = function(F,T){ return this.AddSelCols(F,T,0,0,0); }
TGP.ActionCopyColNext = function(F,T){  return this.AddSelCols(F,T,0,1,0); }
TGP.ActionCopyCols = function(F,T){ return this.AddSelCols(F,T,F&~5|1,0,0); }
TGP.ActionCopyColsNext = function(F,T){ return this.AddSelCols(F,T,F&~5|1,1,0); }
TGP.ActionCopySelectedCols = function(F,T){ return this.AddSelCols(F,T,F&~5|2,0,0); }
TGP.ActionCopySelectedColsNext = function(F,T){ return this.AddSelCols(F,T,F&~5|2,1,0); }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionAddColEnd = function(dummy,T){ 
if(!this.ColAdding||this.Locked["addcol"]) return false; 
if(T) return true;
return this.AddCols(1,this.ColAdding&1?1:(this.ColAdding&2?2:0),1,1,1);
}
// -----------------------------------------------------------------------------------------------------------
TGP.DeleteCol = function(col,type,test,remove){ 
var C = this.Cols[col];
if(!C || !this.ColDeleting || !C.CanDelete || this.Locked["delcol"]) return false;
var del = C.Deleted-0?1:0; 
if(!type) type = del ? 3 : 1;
if(Grids.OnCanColDelete) { var tmp = Grids.OnCanColDelete(this,col,type); if(tmp!=null) type = tmp; }
if(type==1) {
   if(test) type = 2;
   else { 
      var txt = this.GetAlert("DelCol"); 
      type = !txt || this.DeleteMessage==0 || this.DeleteMessage==1&&this.ShowDeleted&&!remove&&!this.AutoUpdate || this.Confirm(txt.replace("%d",this.GetCaption(col))) ? 2 : 0;
      }
   }
if(type<=1) return false;
if((type==2 && del || type==3 && !del) && !remove) return false; 
if(test) return true;
if(col==this.ECol && this.EditMode) this.EndEdit();
MS.Animate;
if(this.AnimateCols && !this.SuppressAnimations){
   var n = type==2 ? "Delete" : "Undelete", v = this.ShowDeleted&&!remove ? "Visible" : "";
   if(this.Animations[n] || this.Animations[n+v]) {
      if(type==2) this.AnimCol(col,n+v,this.DeleteColT.bind(this,col,type,remove));
      else { this.DeleteColT(col,type,remove); this.AnimCol(col,n); }
      return true;
      }
   }
ME.Animate;
this.DeleteColT(col,type,remove);
return true; 
}
// -----------------------------------------------------------------------------------------------------------
TGP.DeleteColT = function(col,type,remove,noshow){ 
var C = this.Cols[col], vis = C.Visible, del = C.Deleted;
C.Deleted = type==3?0:1;
if(type==2 && Grids.OnColDelete) Grids.OnColDelete(this,col);
if(type==3 && Grids.OnColUndelete) Grids.OnColUndelete(this,col);
this.StartUndo();
if(this.ClearSelected&1){
   if(C.Selected && type==2) {
      C.Deleted = 0;
      this.SelectCol(col,0);
      C.Deleted = type==3?0:1;
      }
   if(this.ShowDeleted) this.UpdateColPanel(col);
   }
if(noshow){ this.EndUndo(); return; }
else if(remove) this.DelCol(col,1);
else if(this.ShowDeleted){
   if(this.ColorState&4) this.ColorCol(col);
   if(this.ColIndex && !(this.ColIndexType&1) && !this.Rendering) this.UpdateColIndex();
   }
else if(type==2) { this.HideCol(col,0,1); this.HideFCol(); }
else if(type==3) this.ShowCol(col);
this.AddUndo({ Type:"DeleteCol",Col:col,Del:remove?!del:C.Deleted,C:C,Removed:remove,Visible:vis});
this.EndUndo();
if(this.CalculateColumns) this.Calculate(1);
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionDeleteCol = function(F,T){ return this.DeleteCol(this.GetACol(F),1,T); }
TGP.ActionUndeleteCol = function(F,T){ return this.DeleteCol(this.GetACol(F),3,T); }
TGP.ActionRemoveCol = function(F,T){ return this.DeleteCol(this.GetACol(F),1,T,1); }
// -----------------------------------------------------------------------------------------------------------
// Deletes all selected columns
TGP.ActionDeleteOrUndeleteCols = function(F,T,del){
if(!this.ColDeleting || this.Locked["delcol"]) return false;
var R = this.GetACols(F), A = [];
if(del==null){
   var D = []; 
   for(var id in R) if(R[id].Deleted) D[D.length] = id; else A[A.length] = id;
   if(!D.length) del = 1; else { del = 0; A = D; }
   }
else if(del==1) { for(var id in R) if(!R[id].Deleted) A[A.length] = id; }
else if(!del) { for(var id in R) if(R[id].Deleted==1) A[A.length] = id; }
else for(var id in R) A[A.length] = id;
if(T||!A.length) return A.length;

if(Grids.OnDeleteAllCols && Grids.OnDeleteAllCols(this,del)) return false;
if(del){
   var txt = this.GetAlert("DelSelectedCols");
   if(txt && (this.DeleteMessage==2||this.DeleteMessage==1 && (!this.ShowDeleted || del==2 || this.AutoUpdate)) && !this.Confirm(txt.replace("%d",A.length))) { Grids.Alert = 0; return false; }
   }
if(A.length>1) this.DeleteCols(A,del);
else {
   this.ShowMessage(this.GetText("DelSelectedCols"));
   T = this; setTimeout(function(){ T.DeleteCols(A,del); },10);
   }
return true;   
}
// -----------------------------------------------------------------------------------------------------------
// Deletes selected rows, called from DeleteSelectedCols in timeout
// del = 0 undelete, 1 delete, 2 remove
TGP.DeleteCols = function(R,del){
var C = this.Cols, A = [];
for(var i=0;i<R.length;i++) {
   var d = del; if(!C[R[i]].CanDelete) continue;
   if(Grids.OnCanColDelete) { var tmp = Grids.OnCanColDelete(this,R[i],del?2:3,R); if(tmp!=null) d = tmp==2?(del==2?1:2):(tmp==3?0:-1); }
   if(d!=-1&&!!C[R[i]].Deleted!=d) A[A.length] = R[i];
   }
this.StartUndo();
MS.Undo; var OPos = del==2 && this.Undo&4 && this.OUndo ? this.OUndo.Pos : null, CD = []; ME.Undo;
for(var i=0;i<A.length;i++) {
   var c = C[A[i]], cdel = c.Deleted?0:1;
   if(del==2) CD[i] = c.Deleted;
   c.Deleted = cdel;
   if(del && Grids.OnColDelete) Grids.OnColDelete(this,A[i]);
   if(!del && Grids.OnColUndelete) Grids.OnColUndelete(this,A[i]);
   if(del!=2) this.AddUndo({ Type:"DeleteCol",Col:A[i],Del:del,C:c,Visible:c.Visible});
   if(this.ClearSelected&1||del==2){
      if(c.Selected && cdel) {
         c.Deleted = 0;
         this.SelectCol(A[i],0);
         c.Deleted = cdel;
         }
      if(this.ShowDeleted) this.UpdateColPanel(A[i]);
      }
   }
if(del==2){
   this.ChangeColsVisibility(null,null,null,3,1);
   this.StartUpdate();
   var U = this.Undo ? this.GetUndoSpan() : null; 
   for(var i=0,CC=[],CV=[];i<A.length;i++) { CC[i] = C[A[i]]; CV[i] = C[A[i]].Visible; this.DelCol(A[i],1,U); }
   if(U) this.AddUndo({Type:"RemoveSpan",Data:U,Remove:1}); 
   for(var i=0;i<A.length;i++) this.AddUndo({ Type:"DeleteCol",Col:A[i],Del:!CD[i],C:CC[i],Removed:1,Visible:CV[i]});
   this.EndUpdate();
   }
else if(!this.ShowDeleted) this.ChangeColsVisibility(del?null:A,del?A:null,null,null,1);
else {
   
   if(this.ColorState&4){
      if(A.length>1) this.Render(); 
      else this.ColorCol(A[0]);
      }
   }

MS.Undo;
if(OPos!=null){
   var OU = this.OUndo, p = OU.Pos-1; while(p>=0&&OU[p].Type=="End") p--;
   if(OU[p].Type=="Focus"){ OU.splice(OPos,0,OU[p]); OU.splice(p+1,1); } 
   }
ME.Undo;
this.EndUndo();
this.HideMessage();
if(this.CalculateColumns) this.Calculate(1);
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionDeleteSelectedCols = function(F,T){ return this.ActionDeleteOrUndeleteCols(F?F|2:2,T,1); }
TGP.ActionUndeleteSelectedCols = function(F,T){ return this.ActionDeleteOrUndeleteCols(F?F|2:2,T,0); }
TGP.ActionRemoveSelectedCols = function(F,T){ return this.ActionDeleteOrUndeleteCols(F?F|2:2,T,2); }
TGP.ActionDeleteCols = function(F,T){ return this.ActionDeleteOrUndeleteCols(F,T,1); }
TGP.ActionUndeleteCols = function(F,T){ return this.ActionDeleteOrUndeleteCols(F,T,0); }
TGP.ActionRemoveCols = function(F,T){ return this.ActionDeleteOrUndeleteCols(F,T,2); }
// -----------------------------------------------------------------------------------------------------------
ME.ColHide;

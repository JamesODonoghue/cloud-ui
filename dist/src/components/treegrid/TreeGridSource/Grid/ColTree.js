// -----------------------------------------------------------------------------------------------------------
// Changing column visibility and column tree
// -----------------------------------------------------------------------------------------------------------
MS.ColHide;
MS.ColTree;
// -----------------------------------------------------------------------------------------------------------
TGP.ExpandAllCells = function(expand,row,col,timeout,test){
var F = row ? [row] : this.GetFixedRows(), C = this.Cols, chg = 0, H = [];
if(timeout&&!test){
   for(var i=0,ok=0;i<F.length;i++){
      if(F[i].Kind!="Header"&&this.HeaderColTree&&!row || !col&&expand&&Is(F[i],"CollapseOther")) continue;
      for(var c in C){
         var exp = this.IsCellExpanded(F[i],c);
         if(exp!=null && exp!=expand && F[i].Visible && c!=col) { ok = 1; break; }
         }
      }
   if(!ok) return false;
   this.ShowMessage(this.GetText(expand?"ExpandCols":"CollapseCols"));
   var T = this; setTimeout(function(){ T.ExpandAllCells(expand,row,col,0); T.HideMessage(); },30); 
   return true;
   }
if(!test) { this.StartUpdate(); this.ExpandingAllColumns = 1; } 
for(var i=0;i<F.length;i++){
   if(F[i].Kind!="Header"&&this.HeaderColTree&&!row || !col&&expand&&Is(F[i],"CollapseOther")) continue;
   var chg2 = 0;
   for(var c in C){
      var exp = this.IsCellExpanded(F[i],c);
      if(exp!=null && exp!=expand && F[i].Visible && c!=col) { if(test) return true; this.ExpandCell(F[i],c); chg++; chg2++; }

      }
   if(chg2) H[H.length] = F[i];
   }
if(test) return false;
this.ExpandingAllColumns = 0;
for(var i=0;i<H.length;i++) this.RefreshRow(H[i]);
this.EndUpdate();
this.UpdateHidden();
return chg;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionExpandAllCells = function(dummy,T){ return !!this.ExpandAllCells(1,null,null,!this.FastColumns,T); }
TGP.ActionCollapseAllCells = function(dummy,T){ return !!this.ExpandAllCells(0,null,null,!this.FastColumns,T); }
TGP.ActionExpandRowCells = function(dummy,T){ return !!this.ExpandAllCells(1,this.ARow,null,!this.FastColumns,T); }
TGP.ActionCollapseRowCells = function(dummy,T){ return !!this.ExpandAllCells(0,this.ARow,null,!this.FastColumns,T); }
// -----------------------------------------------------------------------------------------------------------
TGP.IsCellExpanded = function(row,col){
if(!row || !col) return null;
var expand = this.GetAttr(row,col,"Expanded");
if(expand!=null) return expand;
var cols = this.GetAttr(row,col,"ExpandCols");
if(cols) {
   cols = (cols+"").split(',');
   for(var i=0;i<cols.length;i++) if(this.Cols[cols[i]] && this.Cols[cols[i]].Visible) return true;
   return false;
   }
if(row.AutoTree) return null;
var rows = this.GetAttr(row,col,"ExpandRows");
if(rows) {
   rows = (rows+"").split(',');
   for(var i=0;i<rows.length;i++) {
      if(!this.Rows[rows[i]]){ 
         if(this.Def[rows[i]]){
            for(var d=this.Def[rows[i]],r=this.GetFirst();r;r=this.GetNext(r)) if(r.Def==d && r.Visible && r!=row) return true;
            }  
         }
      else if(this.Rows[rows[i]].Visible && rows[i]!=row.id) return true;
      }
   return false;
   }

return null;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ReplaceDefs = function(rows,row){
var D = [];
for(var i=0;i<rows.length;i++){
   if(!this.Rows[rows[i]] && this.Def[rows[i]]){ 
      D[D.length] = this.Def[rows[i]];
      rows.splice(i,1); i--;
      }
   if(rows[i]==row.id) { rows.splice(i,1); i--; }
   }
if(D.length){
   for(var r=this.GetFirst();r;r=this.GetNext(r)){
      for(var i=0;i<D.length;i++) if(r.Def==D[i] && r!=row) { rows[rows.length] = r.id; break; }
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.ExpandCell = function(row,col,exp,save){
var C = this.Cols, R = this.Rows;
if(!row || !col || this.Locked["expand"]) return false;
var cols = this.GetAttr(row,col,"ExpandCols");
var rows = row.AutoTree ? null : this.GetAttr(row,col,"ExpandRows");
if(!cols && !rows) {
   if(!this.HasChildren(row) || !Is(row,"CanExpand") || Grids.OnExpand && Grids.OnExpand(this,row)) return false;
   if(row.Expanded) this.Collapse(row);
   else this.Expand(row);
   this.RefreshCell(row,col);
   return true;
   }
if(cols) cols = (cols+"").split(',');
if(rows) rows = (rows+"").split(',');
var expand = this.GetAttr(row,col,"Expanded"), ReplacedDefs = 0;
if(expand!=null) expand = !expand;
else if(cols) { for(var i=0,expand=1;i<cols.length;i++) if(C[cols[i]] && C[cols[i]].Visible) { expand = 0; break; } }
else { this.ReplaceDefs(rows,row); ReplacedDefs = 1; for(var i=0,expand=1;i<rows.length;i++) if(R[rows[i]] && R[rows[i]].Visible) { expand = 0; break; } }
if((exp==null||save) && !this.SuppressCfg && !this["ExpandedLap"]){
   if(!this.ExpandCells) this.ExpandCells = {};
   this.ExpandCells[row.id+"&"+col] = expand;
   }
if(exp==null) row[col+"Expanded"] = expand; 
else if(expand) return true; 
else expand = exp; 
if(expand && Is(row,"CollapseOther") && !Is(row,"Hidden")) this.ExpandAllCells(0,row,col); 
var FR = null, FC = null; if(this.FRect&&this.SelectingFocus) { if(!this.FRect[7]) FR = {}; if(!this.FRect[6]) FC = {}; }
this.StartUpdate();
if(cols) {
   if(expand) for(var i=cols.length-1;i>=0;i--) { 
      var c = C[cols[i]];
      if(!c) continue;
      if(c.ExpandLevel==null) {
         if(!c.Visible) { this.ShowCol(cols[i]); if(FC) FC[cols[i]] = c; }
         }
      else {
         c.ExpandLevel++;
         if(!c.Visible && c.ExpandLevel>0) { this.ShowCol(cols[i]); if(FC) FC[cols[i]] = c; }
         }
      this.ExpandCell(row,cols[i],expand);
      }
   else for(var i=0;i<cols.length;i++) {
      var c = C[cols[i]];
      if(!c) continue;
      if(c.ExpandLevel==null) {
         if(c.Visible) this.HideCol(cols[i],0,1);
         }
      else {
         c.ExpandLevel--;
         if(c.Visible && c.ExpandLevel<=0) this.HideCol(cols[i],0,1);
         }
      this.ExpandCell(row,cols[i],expand);
      }
   if(this.GetAttr(row,col,"HideParentCol")){
      var c = C[col];
      if(!expand){
         if(c.ExpandLevel==null) {
            if(!c.Visible && exp!=false) { this.ShowCol(col); if(FC) FC[col] = c; }
            }
         else {
            c.ExpandLevel++;
            if(!c.Visible && c.ExpandLevel>0) { this.ShowCol(col); if(FC) FC[col] = c; }
            }
         }
      else {
         if(c.ExpandLevel==null) {
            if(c.Visible && exp!=false) { this.HideCol(col,0,1);}
            }
         else {
            c.ExpandLevel--;
            if(c.Visible && c.ExpandLevel<=0) this.HideCol(col,0,1);
            }
         }
      this.GridMouseOver();
      }
   if(row.AutoTree&&row.nextSibling&&row.nextSibling.AutoTree){ 
      var r = row.nextSibling;
      if(expand) for(var j=cols.length-1;j>=0;j--) this.ExpandCell(r,cols[j],expand); 
      else for(var j=0;j<cols.length;j++) this.ExpandCell(r,cols[j],expand);
      }
   this.HideFCol();
   }
if(rows) {
   if(!ReplacedDefs) this.ReplaceDefs(rows,row);
   for(var i=0;i<rows.length;i++) {
      var r = R[rows[i]];
      if(!r) continue;
      if(!this.SuppressCfg && !this["ExpandedLap"]){
         if(!this.ExpandRows) this.ExpandRows = {};
         if(this.ExpandRows[r.id]==null) this.ExpandRows[r.id] = (r.ExpandLevel?r.ExpandLevel:0)*2 + (r.Visible?1:0);
         }
      if(r.ExpandLevel==null) {
         if(expand && !r.Visible) { this.ShowRow(r); if(FR) FR[r.id] = r; }
         else if(!expand && r.Visible) this.HideRow(r);
         }
      else if(expand) {
         r.ExpandLevel++;
         if(!r.Visible && r.ExpandLevel>0) { this.ShowRow(r); if(FR) FR[r.id] = r; }
         }
      else {
         r.ExpandLevel--;
         if(r.Visible && r.ExpandLevel<=0) this.HideRow(r);
         }
      if(cols) {
         if(expand) for(var j=cols.length-1;j>=0;j--) this.ExpandCell(r,cols[j],expand); 
         else for(var j=0;j<cols.length;j++) this.ExpandCell(r,cols[j],expand);
         }
      }
   this.HideFRow();
   }
if(FR) { var R = this.GetFocusedRows(); for(var i=0;i<R.length;i++) if(FR[R[i].id]) { if(this.FRect[6]) this.SelectRow(R[i],1); else this.SelectRange(R[i],this.FRect[1],R[i],this.FRect[3],1); } }
if(FC) { var C = this.GetFocusedCols(); for(var i=0;i<C.length;i++) if(FC[C[i]]) { if(this.FRect[7]) this.SelectCol(C[i],1); else this.SelectRange(this.FRect[0],C[i],this.FRect[2],C[i],1); } }
this.RefreshCell(row,col);
this.EndUpdate(row,col);
this.UpdateHidden();
if(exp==null) this.SaveCfg();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionExpandCell = function(F,T){ 
var A = this.GetACell(F); if(!A) return false; 
var row = A[0], col = A[1], cc = this.GetAttr(row,col,"ExpandCol"); if(cc) col = cc;
if(T) return row&&col&&(this.GetAttr(row,col,"ExpandCols") || this.GetAttr(row,col,"ExpandRows") || this.ActionExpand(F,T) || this.ActionCollapse(F,T)) ? 1 : 0;
if(this.FastColumns || !this.GetAttr(row,col,"ExpandCols") && !this.GetAttr(row,col,"ExpandRows")) return this.ExpandCell(row,col); 
else {
   var exp = this.IsCellExpanded(row,col);
   this.ShowMessage(this.GetText(exp?"CollapseCols":"ExpandCols"));
   T = this; setTimeout(function(){ T.ExpandCell(row,col); T.HideMessage(); },30);  
   return true;
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.ExpandRowCol = function(F,T,rows,exp){ 
var A = this.GetACell(F); if(!A) return false; 
var row = A[0], col = A[1], cc = this.GetAttr(row,col,"ExpandCol"); if(cc) col = cc;
if(!row||!col||!this.GetAttr(row,col,rows?"ExpandRows":"ExpandCols")||!exp==!this.IsCellExpanded(row,col)) return false;
return this.ActionExpandCell(F,T);
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionExpandCol = function(F,T){ return this.ExpandRowCol(F,T,0,1); }
TGP.ActionCollapseCol = function(F,T){ return this.ExpandRowCol(F,T,0,0); }
TGP.ActionExpandRow = function(F,T){ return this.ExpandRowCol(F,T,1,1); }
TGP.ActionCollapseRow = function(F,T){ return this.ExpandRowCol(F,T,1,0); }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionShowColTreeLevel = function(F,T){ 
var row = this.GetARow(F); if(!row) return false;
return !!this.ShowColTreeLevel(row,T);
}
// -----------------------------------------------------------------------------------------------------------
TGP.ShowColTreeLevel = function(row,test){ 
if(!test) this.StartUpdate();
var chg = 0;
for(var r=row;r;r=r.nextSibling) chg += this.ExpandAllCells(0,r,null,null,test);
for(var r=row.previousSibling;r;r=r.previousSibling) chg += this.ExpandAllCells(1,r,null,null,test);
if(!test) this.EndUpdate();
return chg;
}
// -----------------------------------------------------------------------------------------------------------
TGP.CreateColTree = function(){ 
if(!this.ColTree) return;
for(var N=[],i=1;i<this.ColNames.length-1;i++) for(var j=0,CN=this.ColNames[i];j<CN.length;j++) N[N.length] = CN[j];
if(!N.length) return;
var show = this.ColTree>2, lev = 0, r = null, R = [[[],null,0]], L = [], CC = {}, crev = this.ReversedColTree, C = this.Cols, GT = this.Gantt ? this.GetFirstGantt()+"Type" : null, max = this.MaxColLevel;
if(crev) N.reverse();
if(C[N[0]].Level>0) {
   if(crev&&this.AutoColPages){
      var n = 1; while(C["RootCol"+n]) n++;
      var c = this.AddCol("RootCol"+n,1,crev?1e10:0,{Def:C[N[0]].Def},1,C[N[0]].Type).Name;
      C[c].Level = 0; 
      N.unshift(c);
      }
   else C[N[0]].Level = 0;
   }
for(var i=0;i<N.length;i++){
   var c = N[i]; if(C[c].Level>max) C[c].Level = max;
   if(lev<C[c].Level){
      if(C[c].Level!=lev+1) for(var j=i,l=C[c].Level,dl=C[c].Level-lev-1;j<N.length&&C[N[j]].Level>lev+1;j++) C[N[j]].Level -= dl; 
      if(C[c].Hidden) { r.Expanded = 0; for(var j=i,ok=1;j<N.length&&C[N[j]].Level>lev;j++) if(C[N[j]].Level==lev+1&&!C[N[j]].Hidden) { r.Expanded = 1; break; } }
      if(R[C[c].Level]) L.push(R[C[c].Level]);
      R[C[c].Level] = [[],r.Name,C[c].Level];
      CC[r.Name] = R[C[c].Level];
      }
   r = C[c];
   lev = r.Level?r.Level:0;
   if(crev) R[lev][0].unshift(r.Name);
   else R[lev][0].push(r.Name);
   }
var OH = [];
L = R.concat(L);
function CountRows(II){ for(var i=0,I=II[0],cnt=I.length;i<I.length;i++) if(CC[I[i]]&&CC[I[i]][2]>II[2]) cnt += CountRows(CC[I[i]]); return cnt; }
for(var i=1;i<L.length;i++){
   var l = L[i][2], r = OH[l-1], c = L[i][1], I = L[i][0], fc = c;
   if(!r){ r = Dom.createElement("I"); r.id = "ColTree"+l; r.Def = "ColTree"; r.ExpandLevel = 100; r.ExpandIcon = crev?7:6; OH[l-1] = r; r.Visible = show; r.AutoTree = 1; if(GT) r[GT] = "Html"; };
   if(crev){
      for(var II=L[i];CC[II[0][0]]&&CC[II[0][0]][2]>II[2];II=CC[II[0][0]]);
      fc = II[0][0];
      }
   r[c+"ExpandCols"] = I.join(",");
   
   r[fc+"Icon"] = "Expand"; r[fc+"IconAlign"] = crev ? "Right" : "Left"; if(fc!=c) r[fc+"ExpandCol"] = c;
   if(C[c].Expanded!=null) { for(var j=0,exp=C[c].Expanded!="0"?1:0;j<I.length;j++) if(C[I[j]]) C[I[j]].Visible = exp; }
   else { for(var j=0,exp=0;j<I.length;j++) if(C[I[j]]&&C[I[j]].Visible) { exp = 1; break; } }
   r[c+"Expanded"] = exp;
   r[fc+"Span"] = CountRows(L[i])+1;
   
   }

if(this.Loading){
   for(var H=this.XF,r=H.firstChild;r;r=r.nextSibling) if(r.Def=="ColTree") break;
   if(!r) H = this.XH;
   var fr = H.firstChild, r = fr; while(r) if(r.Def=="ColTree"){ var n = r.nextSibling; H.removeChild(r); fr = n; r = n;  } else r = r.nextSibling;
   for(var i=0;i<OH.length;i++) H.insertBefore(OH[i],fr);
   r = Dom.createElement("I"); r.id = "ColTree"+(i+1); r.Def = "ColTree"; r.ExpandLevel = 100; r.ExpandIcon = crev?7:6; r.AutoTree = 1; H.insertBefore(r,fr); if(GT) r[GT] = "Html"; r.Visible = i>0&&show&&this.ColTreeLast?1:0; 
   for(i++;i<this.MaxColLevel;i++) {
      r = Dom.createElement("I"); r.id = "ColTree"+(i+1); r.Def = "ColTree"; r.ExpandLevel = 100; r.ExpandIcon = crev?7:6; r.AutoTree = 1; r.Visible = 0; H.insertBefore(r,fr); if(GT) r[GT] = "Html";
      }
   }
else {
   for(var H=this.XF,r=H.firstChild;r;r=r.nextSibling) if(r.Def.Name=="ColTree") break;
   if(!r) H = this.XH;
   for(var r=H.firstChild,i=0,nl=N.length;r;r=r.nextSibling,i++) if(r.Def&&typeof(r.Def)=="object" ? r.Def.Name=="ColTree" : r.Def=="ColTree"){
      for(var j=0;j<nl;j++) { 
         var c = N[j];
         if(r[c+"ExpandCols"]) r[c+"ExpandCols"] = null; 
         
         if(r[c+"Icon"]) r[c+"Icon"] = null; 
         if(r[c+"ExpandCol"]) r[c+"ExpandCol"] = null; 
         r[c+"Span"] = 1;
         }
      if(OH[i]){ 
         for(var c in OH[i]) if(!CNodeNames[c]&&c!="Def") r[c] = OH[i][c]; 
         this.UpdateSpan(r);
         this.RefreshRow(r);
         if(!r.Visible&&show) this.ShowRow(r);
         else if(r.Visible&&!show) this.HideRow(r);
         }
      else {
         if(r.Visible){ if(!i||i!=OH.length||!show) this.HideRow(r); }
         else if(i&&i==OH.length&&show) this.ShowRow(r);
         }
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.AddColLevel = function(col){ 
var crev = this.ReversedColTree, C = this.Cols; if(C[col].MainSec!=1) return;
var n = crev ? this.GetPrevCol(col,null,2) : this.GetNextCol(col,null,2);
var ln = n ? C[n].Level : 0, ll = C[col].Level; if(!ln) ln = 0;
if(ll==null) C[col].Level = ln;
else if(ll>ln) {
   C[col].Level = ln;
   while(1){
      var a = C[col].Level-ll;  
      if(a>=0) break;
      this.IndentCols(col);
      if(a==C[col].Level-ll) break;
      }
   }
if(!C[col].Level) return; 
for(var p=col;p&&C[p].Level>=ln;p=crev?this.GetNextCol(p,null,2):this.GetPrevCol(p,null,2));
if(!p) return; 
var r = this.Rows["ColTree"+(ln+1)]; r[p+"ExpandCols"] += ","+col;
}
// -----------------------------------------------------------------------------------------------------------
TGP.DelColLevel = function(col,undo){ 
var crev = this.ReversedColTree, C = this.Cols, ln = C[col].Level;
var n = crev ? this.GetPrevCol(col,null,2) : this.GetNextCol(col,null,2);
if(n&&C[n].Level>(ln?ln:0)) {
   if(undo&&!(this.Undo&8)) { this.Undo |= 8; this.OutdentCols(n,1,1); this.Undo &= ~8; } 
   else this.OutdentCols(n,1,1); 
   }
if(!ln) return;
for(var p=col;p&&C[p].Level>=ln;p=crev?this.GetNextCol(p,null,2):this.GetPrevCol(p,null,2));
if(!p) return; 
var r = this.Rows["ColTree"+ln], v = r[p+"ExpandCols"]; 
r[p+"ExpandCols"] = v==col ? "" : v.indexOf(","+col+",")>=0 ? v.replace(","+col+",",",") : v.indexOf(col+",")==0 ? v.replace(col+",","") : v.replace(","+col,"");
if(v==col){
   this.SetAttribute(r,p,"Icon",null,0,this.Undo&8);
   
   this.RefreshCell(r,p);
   var rr = this.Rows["ColTree"+(this.ColTreeLast?ln+2:ln+1)]; 
   if(!rr||!rr.Visible){
      var rem = this.Rows["ColTree"+(this.ColTreeLast?ln+1:ln)]; for(var c in C) if(C[c].Level>=ln&&c!=col) { rem = null; break; }
      if(rem) {
         if(undo&&this.Undo&8) this.AddUndo({Type:"Hide",Row:rem});
         this.HideRow(rem);
         }
      }
   }

}
// -----------------------------------------------------------------------------------------------------------
TGP.IndentCols = function(cols,force,undo,out,test){ 
if(!cols||this.ColTree<=1||!this.Rows["ColTree1"]||this.Locked["indentcol"]) return 0;
if(typeof(cols)=="string") cols = cols.split(",");
if(cols.length) { var A = cols; cols={}; for(var i=0;i<A.length;i++) cols[A[i]] = 1; }
var crev = this.ReversedColTree, C = this.Cols, R = {}, max = this.MaxColLevel, err = {}, U = undo&&this.Undo&8 ? {} : null;
if(test){
   var CC = {}, T = this;
   function Can(col,force){
      var l = C[col].Level; if(out?!l:l>=max) return false;
      var n = (crev?out:!out) ? T.GetPrevCol(col,null,2) : T.GetNextCol(col,null,2); 
      if(!out&&(!n||C[n].MainSec!=1)) return false;
      if(force) return true;
      if((out ? n && C[n].MainSec==1 && (C[n].Level?C[n].Level:0)>l : (C[n].Level?C[n].Level:0)<l) && !CC[n] && (!cols[n] || !Can(n))) return false;
      CC[col] = 1; return true;
      }
   var cnt = 0;
   for(var col in cols) if(C[col]&&C[col].MainSec==1) if(Can(col,force)) cnt++;
   return cnt;
   }
if(undo) this.UndoStart();
function Set(row,col,attr,val){ if(U) U[row.id][col+attr] = row[col+attr]; row[col+attr] = val; }
while(1){
   var ncols = {};
   for(var col in cols) {
      if(!C[col]||C[col].MainSec!=1){ err[col] = 1; continue; }
      var l = C[col].Level; if(!l) l = 0;

      if(out){
         if(!l){ err[col] = 1; continue; } 
         var n = crev ? this.GetPrevCol(col,null,2) : this.GetNextCol(col,null,2);
         if(n && C[n].MainSec==1 && (C[n].Level?C[n].Level:0)>l) { 
            if(force&&!cols[n]&&!err[n]) ncols[n] = 1; 
            ncols[col] = 1; continue; 
            } 
         
         var v = "", spn = 1, r = this.Rows["ColTree"+l]; R[r.id] = r; if(U) U[r.id] = {};
         for(var p=col;C[p].Level>=l;p=crev?this.GetNextCol(p,null,2):this.GetPrevCol(p,null,2)) if(p!=col) { spn++; if(C[p].Level==l) v += p+","; } 
         var fc = crev ? this.GetNextCol(col,null,2) : p;
         Set(r,p,"ExpandCols",v ? v.slice(0,-1) : null);
         
         Set(r,fc,"Span",spn);
         Set(r,fc,"Icon",v ? "Expand" : null);
         Set(r,fc,"IconAlign",!v ? null : crev ? "Right" : "Left");
         if(crev&&v) Set(r,fc,"ExpandCol",p);
         if(v) Set(r,p,"Expanded",1);

         if(l>1){
            var r = this.Rows["ColTree"+(l-1)]; R[r.id] = r; if(U) U[r.id] = {};
            while(C[p].Level>=l-1) p = crev ? this.GetNextCol(p,null,2) : this.GetPrevCol(p,null,2); 
            Set(r,p,"ExpandCols",r[p+"ExpandCols"]+","+col); 
            }

         var v = "", spn = 1, fc = col, r = this.Rows["ColTree"+l], rem = null;
         if(n&&C[n].Level==l){
            
            for(;C[n].Level>=l;n=crev ? this.GetPrevCol(n,null,2) : this.GetNextCol(n,null,2)) { spn++; if(C[n].Level==l) v += n+","; if(crev) fc = n; }
            Set(r,col,"ExpandCols",v.slice(0,-1));
            Set(r,fc,"Icon","Expand");
            Set(r,fc,"IconAlign",crev ? "Right" : "Left");
            if(crev) Set(r,fc,"ExpandCol",col);
            Set(r,col,"Expanded",1);  
            }
         else {
            Set(r,fc,"Icon",null);
            var rr = this.Rows["ColTree"+(this.ColTreeLast?l+2:l+1)]; 
            if(!rr||!rr.Visible){
               rem = this.Rows["ColTree"+(this.ColTreeLast?l+1:l)]; for(var c in C) if(C[c].Level>=l&&c!=col) { rem = null; break; }
               if(rem) this.HideRow(rem);
               }
            }
         Set(r,fc,"Span",spn);

         C[col].Level = l-1;
         if(U) { this.AddUndo({Type:"IndentCol",Col:col,OldLevel:l,NewLevel:l-1,Rows:U,Hide:rem?rem.id:null}); U = {}; }
         }

      else {
         if(l>=max){ err[col] = 1; continue; }
         var p = crev ? this.GetNextCol(col,null,2) : this.GetPrevCol(col,null,2);
         if(!p||C[p].MainSec!=1){ err[col] = 1; continue; } 
         if((C[p].Level?C[p].Level:0)<l) { 
            if(force&&!cols[p]&&!err[p]) ncols[p] = 1; 
            ncols[col] = 1; continue; 
            } 
         if(this.ColTree<=2) this.SetColTree(this.ReversedColTree?4:3);

         var r = this.Rows["ColTree"+(l+1)]; R[r.id] = r; if(U) U[r.id] = {};
         while(C[p].Level>l) p = crev ? this.GetNextCol(p,null,2) : this.GetPrevCol(p,null,2); 
         var v = r[p+"ExpandCols"], fc = crev?col:p, spn = r[col+"Span"]; if(!crev) Set(r,col,"Span",0);
         if(v){
            v += ","+col; 
            if(crev) {
               var n = this.GetNextCol(col,null,2); 
               spn = r[n+"Span"]; 
               Set(r,n,"Icon",null); Set(r,n,"Span",0);
               if(r[n+"Expanded"]!=null) Set(r,n,"Expanded",null);
               }
            }
         else { 
            v = col; 
            if(crev){ spn = 1; Set(r,p,"Span",0); }
            }
         if(crev&&r[col+"ExpandCols"]) for(var n=this.GetPrevCol(col,null,2),fc=p;C[n].Level>l;n=this.GetPrevCol(n,null,2)) fc = n; 
         if(crev? !r[col+"ExpandCols"] : v==col){ Set(r,fc,"Icon","Expand"); Set(r,fc,"IconAlign",crev?"Right":"Left"); }
         Set(r,fc,"Span",r[fc+"Span"]+spn);
         if(crev) Set(r,fc,"ExpandCol",p);
         if(r[col+"ExpandCols"]) { v += ","+r[col+"ExpandCols"]; Set(r,col,"ExpandCols",null);  Set(r,col,"Icon",null); Set(r,col,"IconAlign",null); }
         Set(r,p,"ExpandCols",v); Set(r,p,"Expanded",1); 

         if(l>0) {
            r = this.Rows["ColTree"+l]; R[r.id] = r; if(U) U[r.id] = {};
            while(C[p].Level>=l) p = crev ? this.GetNextCol(p,null,2) : this.GetPrevCol(p,null,2); 
            v = r[p+"ExpandCols"]; Set(r,p,"ExpandCols",v==col ? "" : v.indexOf(","+col+",")>=0 ? v.replace(","+col+",",",") : v.indexOf(col+",")==0 ? v.replace(col+",","") : v.replace(","+col,""));
            
            }

         r = this.Rows["ColTree"+(this.ColTreeLast?l+2:l+1)]; 
         if(U) { this.AddUndo({Type:"IndentCol",Col:col,OldLevel:l,NewLevel:l+1,Rows:U,Show:r.Visible==0?r.id:null}); U = {}; }
         if(r.Visible==0) this.ShowRow(r);
         C[col].Level = l+1;
         }
      }
   if(!GetCount(ncols)||GetCount(ncols)==GetCount(cols)) break;
   cols = ncols;
   }
for(var id in R) this.RefreshRow(R[id]);
if(undo) this.UndoEnd();
if(this.CalculateColumns) this.Calculate(1);
}
TGP.OutdentCols = function(cols,force,undo){ return this.IndentCols(cols,force,undo,1); }
// -----------------------------------------------------------------------------------------------------------
TGP.SetColTree = function(val){
var zal = this.Rendering; this.Rendering = 1;
if(val==this.ColTree) return;
if(val<=2) {
   for(var r=this.Rows["ColTree1"];r&&r.Visible;r=r.nextSibling) this.HideRow(r);
   }
else {
   var r = this.Rows["ColTree1"], lev = 0, C = this.Cols;
   if(!r.Visible){
      for(var c in C) if(lev<C[c].Level) lev = C[c].Level;
      for(var i=0;i<=lev&&r;i++,r=r.nextSibling) this.ShowRow(r);
      }
   if(val-3!=this.ReversedColTree) { this.ReversedColTree = val-3; this.CreateColTree(); }
   }
this.ColTree = val;
this.Rendering = zal;
}
// -----------------------------------------------------------------------------------------------------------
ME.ColTree;
ME.ColHide;
// -----------------------------------------------------------------------------------------------------------
TGP.ActionIndentCols = function(F,T){ MS.ColTree; return this.IndentCols(this.GetACols(F),0,1,0,T); ME.ColTree; }
TGP.ActionOutdentCols = function(F,T){ MS.ColTree; return this.IndentCols(this.GetACols(F),0,1,1,T); ME.ColTree; }
TGP.ActionIndentColsForce = function(F,T){ MS.ColTree; return this.IndentCols(this.GetACols(F),1,1,0,T); ME.ColTree; }
TGP.ActionOutdentColsForce = function(F,T){ MS.ColTree; return this.IndentCols(this.GetACols(F),1,1,1,T); ME.ColTree; }
// -----------------------------------------------------------------------------------------------------------

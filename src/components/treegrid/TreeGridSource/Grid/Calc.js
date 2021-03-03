// -----------------------------------------------------------------------------------------------------------
// Base calculations
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Initialization of object for calculations, only if it was not initialized in GridEOnDemand yet
var TCalc = function (){ }, TGTCalc = TCalc;
if(window["TCalc"]==null) window["TCalc"] = TCalc; 
else if(TGDefNames["TGTCalc"]) { TCalc = window["TCalc"]; TGTCalc = TCalc; }
// -----------------------------------------------------------------------------------------------------------
MS.Calc;
// -----------------------------------------------------------------------------------------------------------
// Returns column name from attribute name, for example from Col1Visible returns Col1
function GetColFromCell(name) { 
   var M = (name+"").match(CCellAttrsRegExp);
   
   if(!M) return null;
   if(M[2]=="Edit"&&name.indexOf("CanEdit")>0) return name.slice(0,name.length-7); 
   return M[1];
   }
// -----------------------------------------------------------------------------------------------------------
// Converts string of formula to object Function
TGP.ConvertFormula = function(f,cells,noreturn){
if(typeof(f)=="number") f=f+"";
if(typeof(f)!="string") return f;
var of = f; 
f = ' '+f+' '; 

function Update(col){
   var R = new RegExp("^(\\\"([^\\\"]|\\\\\\\")*[^\\\\\\\"]\\\"|\\'([^\\']|\\\\\\')*[^\\\\\\']\\'|[^\\'\\\"]|(\\'\\')|(\\\"\\\"))*[^\\w\\d\\\"\\'\\$\\_\\.]"+col+"[^\\w\\d\\\"\\'\\$\\_\\.]");
   var M = f.match(R);
   col += "";
   while(M){
      f = f.slice(0,M[0].length-1-col.length)+"TGGet(Calc.Row,\""+col+"\")"+f.slice(M[0].length-1); 
      M = f.match(R);
      }
   }

if(cells) for(var i=0;i<cells.length;i++) { if(f.indexOf(cells[i])>=0) Update(cells[i]); }
else for(var col in this.Cols) { if(f.indexOf(col)>=0) Update(col); }

var ff = of.replace(/\'/g,"\"");

if(noreturn || f.replace(/\"[^\"]*\"|\'[^\']*\'/,"").indexOf("return")>=0) f = "with(Calc){"+f+"}";
else if(this.DebugFlags && this.DebugFlags["problem"]){ 
   MS.Debug; f = "with(Calc){ var _dbg=("+f+");if(_dbg==null||typeof(_dbg)=='number'&&!isFinite(_dbg))Calc.Grid.Debug(2,'Formula \"','"+ff+"','\" in cell [',Calc.Row.id,',',Calc.Col,'] returned ',(_dbg==null?'null':(isNaN(_dbg)?'NaN':'Infinity')));return _dbg;}"; ME.Debug;
   }
else f = "with(Calc) return "+f+";";

if(Try) { return new Function("Calc","if(Try){"+f+"}else if(Catch){"+(this.DebugFlags&&this.DebugFlags["problem"]?"Calc.Grid.Debug(1,'Formula \"','"+ff.replace(/[\r\n]/g," ")+"','\" in cell [',Calc.Row.id,',',Calc.Col,'] raised exception ',(e.message?e.message:e));":"")+"return NaN;}"); }
else if(Catch) {
   MS.Debug; this.Debug(1,"Wrong syntax in formula '",of,"', formula was converted to '",f,"', exception message: ",e.message?e.message:e);ME.Debug;
   return new Function(noreturn ? "" : "return NaN;");
   }
}
// -----------------------------------------------------------------------------------------------------------
// Returns converted Formula for given cell, cells is possibly Cells from Space row
TGP.GetFormula = function(formula,cells,noreturn){
var n = formula+(cells?1:0)+(noreturn?1:0), f = this.Formulas[n];
if(f) return f;
f = this.ConvertFormula(formula,cells,noreturn);
this.Formulas[n] = f;
return f;
}
// -----------------------------------------------------------------------------------------------------------
// Returns Calc object with fixed rows ids
TGP.GetCalc = function(){
var A = new TCalc, R = this.GetFixedRows();
for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.id) A[r.id] = r;
for(var i=0;i<R.length;i++) if(R[i].id) A[R[i].id] = R[i];
A.Grid = this;
A.Children = {};
return A;
}
// -----------------------------------------------------------------------------------------------------------
// Returns array of calculated columns, in order are calculated
// [prop1,col1,prop2,col2,...], e.g: [*,,*,2,Col1,Col1,Col2Visible,Cols]
// ordername is CalcOrder, CalcOrder1 - CalcOrder9
TGP.GetCalcOrder = function(row,ordername){
var co = row[ordername]; if(co==null) co = row.Def[ordername];
var iscalc = row.Calculated?1:0, isfixed = row.Fixed?1:0;

if(!co){ 
   
   if(!iscalc) { 
      
      var A = this.CalcOrders["**0"+isfixed];
      if(A) return A;
      var A = [], B = [], p=0, b=0;
      for(var c in this.Cols) if(this.Cols[c].Formula) A[p++] = c;
      A.sort();
      if(!isfixed) { B[B.length] = "*"; B[B.length] = ""; } 
      for(var i=0;i<p;i++){ B[B.length] = A[i]; B[B.length] = A[i]; }
      this.CalcOrders["**0"+isfixed] = B;
      return B;
      }
   
   var A = ["*"], p = 1, CC = this.Cols;
   for(var c in CC) {
      var f = row[c+"Formula"]; if(f==null && row.Def) f = row.Def[c+"Formula"]; if(f==null) f = CC[c].Formula;
      if(f) A[p++] = c;
      }
   A.sort();
   co = A.join(",");
   row[ordername] = co; row[ordername+"Auto"] = 1;
   }

var A = this.CalcOrders[co+iscalc+isfixed];
if(A) return A;
A = co;
if(!isfixed && A.indexOf('*')<0) A = "*,"+A; 
A = A.split(",");
var B = [], p = 0,Cols = row.Space ? row.CellNames : this.Cols;
for(var i=0;i<A.length;i++){
   var col = A[i];
   if(col.charCodeAt(0)==42){ B[p++] = '*'; B[p++] = col.slice(1); } 
   else if(Cols[col]){ B[p++] = col; B[p++] = col; } 
   else {                           
      B[p++] = col;
      var col = GetColFromCell(A[i]);
      B[p++] = Cols[col] ? col : null;
      }
   } 
this.CalcOrders[co+iscalc+isfixed] = B;
return B;   
}
// -----------------------------------------------------------------------------------------------------------
// Calculates one row
// P is object with fixed rows, values can be accessed by id.col
// ordername is word CalcOrder, CalcOrder1, ...
// If show = true displays changes in grid
// If calconly = true calculates Calculated rows only
// If nochild == true, calculates only this row and not its children
// If set col, calculates only this cell
TGP.CalcRow = function(row,P,ordername,show,calconly,nochild,col){
var spec = row.Kind!="Data";
if(row.Calculated){ 
   if(row.Space&&!row.Visible&&!this.CalculateHidden) return;
   if(this.ChildPaging==3 && !row.firstChild && row.State==null && row.Count) row.State = 0; 
   }
else {
   if(spec) return; 
   if(calconly) {  
      if(!nochild) for(var r=row.firstChild;r;r=r.nextSibling) this.CalcRow(r,P,ordername,show,calconly,0,col);
      return; 
      }
   }

P.Row = row;
P.Parent = row.parentNode;
if(!row.Fixed) P.Children = {}; 
var D = row.Def, C = this.Cols, co = col?[col,C[col]?col:GetColFromCell(col)]:this.GetCalcOrder(row,ordername);
var occ = Grids.OnCalculateCell!=null, calcchg = this.CalculatedChanges, pivot = this.PivotDetail&&!row.Fixed, upd = !this.Loading;

var refresh = 0, anim = 0;
for(var j=0;j<co.length;j+=2){
   var n = co[j], c = co[j+1], f = null;
   
   if(n=="*"){
      if(nochild||!row.firstChild) continue;
      ordername = "CalcOrder"+c;
      var ch = P.Children;
      for(var r=row.firstChild;r;r=r.nextSibling) this.CalcRow(r,P,ordername,show,calconly,0,col);
      P.Children = ch; 
      P.Row = row;
      P.Parent = row.parentNode;
      }
   
   else {
      P.Col = c;
      if(c!=n) { P.Attr = n; P.Value = row[c]; if(P.Value==null) P.Value = D[c]; }
      f = row[n+"Formula"]; if(f==null) f = D[n+"Formula"];
      if(f==null && C[c] && !spec) f = c!=n ? C[c][n.slice(c.length)+"Formula"] : C[c].Formula;
      if(f){
         f = this.GetFormula(f,row.Cells); 
         var v = f(P);
         if(occ) {
            var vv = Grids.OnCalculateCell(this,row,n,v,show,P);
            if(vv!=null) v = vv;
            }
         
         if(v!=row[n] || !v&&v!==row[n] || row[c+"CChg"]) {
            MS.Pivot; 
            if(pivot) for(var id in this.PivotDetail){
               var G = this.PivotDetail[id];
               if(G && !G.Loading && !G.Cleared && !G.Rendering) G.SetPivotDetailValue(row,c,v);
               }
            ME.Pivot;
            if(calcchg && c==n && (calcchg-0||calcchg[c])){
               var nochg = row[c+"NoChanged"]; if(nochg==null) nochg = row.Def[c+"NoChanged"]; if(nochg==null && C[c]) nochg = C[c].NoChanged;
               if(!nochg){
                  var ov = row[c+"Orig"]; 
                  
                  if(ov==null && ((calcchg-0?calcchg:calcchg[c])==1||(calcchg-0?calcchg:calcchg[c])==3&&row[n]==null)) row[c+"Orig"] = v; 
                  else {                          
                     row.Changed = 1;
                     row[c+"Changed"] = 1;
                     if(this.SaveOrder && !Is(row,"NoUpload")) this.SetChange({ Row:row.id,Col:c,Val:v });
                     if(ov==v && (v || ov===v)) {
                        row[c+"Changed"] = null;
                        var ch = 0;
                        for(var cc in this.Cols) if(row[cc+"Changed"]){ ch = 1; break; }
                        if(!ch) row.Changed = null;
                        }
                     if(show){
                        if(this.ColorState&2) this.ColorRow(row);
                        else if(this.ColorState&1) this.ColorCell(row,c);
                        anim = 1;
                        }
                     }
                  }               
               }
            row[n] = v;
              if(show){ 
               if(!c) refresh = 1; 
               else if(anim) { this.RefreshCellAnimate(row,c,"Calculate"); anim = 0; }
               else this.RefreshCell(row,c); 
               if(row[c+"CChg"]) delete row[c+"CChg"];
               }
            else if(upd) row[c+"CChg"] = 1;
            }
         }
      }
   }
if(refresh) this.RefreshRow(row);

}
// -----------------------------------------------------------------------------------------------------------
ME.Calc;
// -----------------------------------------------------------------------------------------------------------
// Recalculates all Space rows
TGP.CalculateSpaces = function(show){
MS.Space;
MS.Calc;
if(this.NoCalc) return;
var P = this.GetCalc(); P.Show = show;
for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Calculated) this.CalcRow(r,P,"CalcOrder",show);
ME.Calc;
ME.Space;
}
// -----------------------------------------------------------------------------------------------------------
// Calculates whole grid, for show displays changes
// If calconly == true calculated Calculated rows only (when filtering)
// If fixedonly == true calculates only fixed (and Space) rows
// If spaceonly == true calculates only Space rows
// If nogantt == true, does not recalculate Gantt chart
TGP.Calculate = function(show,calconly,fixedonly,spaceonly,nogantt){
MS.Calc;
if(this.NoCalc) return;

if(!this.Calculating || !this.Calculated || spaceonly){ MS.Space; this.CalculateSpaces(show); ME.Space; return; }

var P = this.GetCalc(); P.Show = show==1;
if(Grids.OnCalculate && Grids.OnCalculate(this,show,null,null,fixedonly)) return;
this.CalcIndex++;
var calcold = calconly;
if(!calconly){ 
   calconly = true;
   for(var c in this.Cols) if(this.Cols[c].Formula) { calconly = false; break; }
   }
   
var C = this.CalcOrder, F = this.GetFixedRows();
if(!C){ 
   for(var i=0;i<F.length;i++) {
      var c = Get(F[i],"CalcOrder");
      if(c && c!="**") {
         if(C){ C = null; break; }
         else C = c;
         }
      else if(Get(F[i],"Calculated")) { C = null; break; } 
      }
   }
if(C){
   
   if(typeof(C)=="string"){ if(C.indexOf('*')<0) C = "*,"+C; C = C.split(','); this.CalcOrder = C; } 

   for(var j=0;j<C.length;j++){
      var n = C[j];
   
      if(n.charAt(0)=='*'){
         if(fixedonly) continue;
         var s = "CalcOrder"+n.slice(1), ch = P.Children;
         for(var B=this.XB.firstChild;B;B=B.nextSibling) for(var r = B.firstChild;r;r=r.nextSibling) this.CalcRow(r,P,s,show==1,calconly);
         P.Children = ch; 
         }
   
      else {
         var li = n.lastIndexOf('$');
         if(li>=0){ 
            
            var id = n.slice(0,li), col = n.slice(li+1), r = this.GetRowById(id);
            if(r) this.CalcRow(r,P,"CalcOrder",show,calconly,0,col);
            }
         else { 
            for(var i=0;i<F.length;i++) this.CalcRow(F[i],P,"CalcOrder",show,calconly,0,n);
            }
         }
      }
   }

else {
   if(!fixedonly) for(var B=this.XB.firstChild;B;B=B.nextSibling) for(var r = B.firstChild;r;r=r.nextSibling) this.CalcRow(r,P,"CalcOrder",show==1,calconly);  
   P.Children = {}; 
   for(var i=0;i<F.length;i++) this.CalcRow(F[i],P,"CalcOrder",show,calconly);
   }



MS.Space;
this.CalculateSpaces(show);
ME.Space;



if(Grids.OnCalculateFinish) Grids.OnCalculateFinish(this,show);

if(P.ReCalc) this.Calculate(show,calconly,fixedonly,spaceonly);

ME.Calc;   
}
// -----------------------------------------------------------------------------------------------------------
// Recalulates grid after given cell changed
// If col is null, all cells in the row are taken as changed
// If show = true displays changes in grid
TGP.Recalculate = function(row,col,show){
MS.Calc;
if(this.NoCalc) return;

if(!this.Calculating || !this.Calculated){ this.CalculateSpaces(show); return; } 
if(Grids.OnCalculate && Grids.OnCalculate(this,show,row,col)) return;
var Calc = this.GetCalc(); Calc.Show = show;
if(row && !row.Page){
   var recalc = null;
   if(col) recalc = Get(row,col+"Recalc");
   if(recalc==null) recalc = Get(row,"Recalc");
   this.CalcIndex++;
   if(recalc!=-1) do {
      if(Calc.ReCalc) recalc = Calc.ReCalc;
      Calc.ReCalc = 0;
      if(recalc&256) this.Calculate(show);
      else{
         var gcol = null, chg = 0, upd = 0, chgdep = 0; 
         
         var T = this; 
         function CalcRow(row,calconly,nochild){
            
            T.CalcRow(row,Calc,"CalcOrder",show,calconly,nochild); 
            
            return 0;
            }
         if(recalc&16) CalcRow(row,0,0); 
         else if(recalc&8) for(var r=row.firstChild;r;r=r.nextSibling) CalcRow(r,0,1);
         if(recalc&1 && !(recalc&16)) CalcRow(row,0,1);
         if(recalc&6 && !row.Fixed) for(var r=row.parentNode;!r.Page;r=r.parentNode) if(recalc&4 || r.Calculated) CalcRow(r,0,1);
         if(recalc&32) for(var r=row.parentNode.firstChild;r;r=r.nextSibling) CalcRow(r,0,1);
         
         this.Calculate(show,0,1); 
         }
      } while(Calc.ReCalc); 
   }


if(Grids.OnCalculateFinish) Grids.OnCalculateFinish(this,show,row,col);
ME.Calc;   
}
// -----------------------------------------------------------------------------------------------------------
TGP.CalculateNoFilter = function(show,calconly,fixedonly,spaceonly,nogantt){
MS.Calc;
var A = {};
for(var r=this.GetFirst();r;r=this.GetNext(r)){
   if(r.Filtered && !r.Visible){ A[r.id] = r.Filtered; r.Filtered = 0; r.Visible = 1; }
   }
this.Calculate(show,calconly,fixedonly,spaceonly,nogantt);
for(var id in A){ var r = this.Rows[id]; this.Rows[id].Filtered = A[id]; r.Visible = 1; }
ME.Calc;
}
// -----------------------------------------------------------------------------------------------------------
MS.Calc;
TGP.RecalculateRows = function(rows,show){
if(this.NoCalc) return;
if(rows.length==null||rows.id||typeof(rows)=="string") rows = [rows];
if(!rows.length) return;
var Calc = this.GetCalc(); Calc.Show = show;
var gcol = null, chg = 0, upd = 0, chgdep = 0; 

for(var i=0;i<rows.length;i++){
   var row = rows[i];
   if(typeof(row)=="string"){ row = this.GetRowById(row); if(!row) continue; }
   
   this.CalcRow(row,Calc,"CalcOrder",show,0,1); 
   
   }

}
ME.Calc;
// -----------------------------------------------------------------------------------------------------------
MS.Calc;
// Switches off calculations and recalculates spaces (spaces are calculated always)
TGP.ActionCalcOff = function(dummy,T){
if(!this.Calculating || !this.Calculated) return false;
if(T) return true;
this.Calculated = false;
this.SaveCfg();
this.CalculateSpaces(1);
return true;
}
// -----------------------------------------------------------------------------------------------------------
// Switches on calculations and recalculates grid
TGP.ActionCalcOn = function(dummy,T){
if(!this.Calculating || this.Calculated) return false;
if(T) return true;

if(this.Paging==3 && !this.CanReload()) return false;
this.ShowMessage(this.GetText("Calculate"));
this.Calculated = true;
T = this;
if(this.Paging==3){
   MS.Paging;
   setTimeout(function(){
      T.ReCalcNeeded = true;
      T.ReloadBody(function(){ T.ReCalcNeeded = false; },0,"ReCalc");
      },10);
   ME.Paging;
   }
else setTimeout(function(){ T.Calculate(1); T.HideMessage();},10);
this.SaveCfg();
this.CalculateSpaces(1);
return true;
}
ME.Calc;
// -----------------------------------------------------------------------------------------------------------

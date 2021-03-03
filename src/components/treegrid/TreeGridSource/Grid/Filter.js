// -----------------------------------------------------------------------------------------------------------
// Rows filtering
// -----------------------------------------------------------------------------------------------------------
MS.Filter;
// -----------------------------------------------------------------------------------------------------------
// Returns cell value as string for filter
TGP.GetStringFilter = function(row,col,raw){
var v = Get(row,col+"FilterValue");
if(v==null) v = raw ? Get(row,col)+"" : this.GetString(row,col,3)+"";
else v += "";
if(Grids.OnGetFilterValue) { var tmp = Grids.OnGetFilterValue(this,row,col,v); if(tmp!=null) v = tmp; }
return v;
}
// -----------------------------------------------------------------------------------------------------------
// Returns cell value as number for filter
TGP.GetNumberFilter = function(row,col,equalf){
var v = Get(row,col+"FilterValue");
if(v==null) v = equalf ? this.GetString(row,col) : Get(row,col);
if(v=="0") v = 0;
if(Grids.OnGetFilterValue) { var tmp = Grids.OnGetFilterValue(this,row,col,v); if(tmp!=null) v = tmp; }
MS.Range;
if(v && typeof(v)=="string" && this.IsRange(row,col)){ 
   v = v.split(this.Lang.Format.ValueSeparator)[0];
   var vp = v.indexOf(this.Lang.Format.RangeSeparator);
   if(vp>=0) v = v.slice(0,vp)-0;
   else v-=0;
   }
ME.Range;   
return v;
}
// -----------------------------------------------------------------------------------------------------------
// Creates filter acording to row of type "Filter" and sets it to Filter1
TGP.BuildFilter = function(){
var F = "", C = this.Cols, R = this.GetFixedRows();
var Op = ["","==","!=","<","<=",">",">="];
var OpS = ["","==0","!=0","<0","<=0",">0",">=0"], tmp = 1, code = "";
var wo = this.FilterReplaceOne ? new RegExp(ToRegExp(this.FilterReplaceOne)) : null, wm = this.FilterReplaceMore ? new RegExp(ToRegExp(this.FilterReplaceMore)) : null;
for(var i=0;i<R.length;i++){
   var r = R[i];
   if(r.Kind!="Filter") continue;
   for(var c in C){
      var ff = r[c+"Filter"]-0; if(!ff) continue;
      var cf = C[c].CanFilter;
      if(!cf) continue;
      if(F) F += " &&";
      if(cf==2) F += "(TGGet(Row,'"+c+"CanFilter')==0?2:";
      var def = r[c+"FilterDef"]; if(def==null) def = r.Def[c+"FilterDef"]; if(def==null) C[c].FilterDef;
      if(def) F += "(" + (def.indexOf(",")<0 ? "Row.Def.Name!='"+def+"'" : "!{"+def.replace(/,/g,":1,")+":1}[Row.Def.Name]") + "?2:";
      var type = this.GetType(r,c), range = this.IsRange(r,c);
      MS._Debug;if(0){ ME._Debug; MS.Range;MX.Range;range=null;ME.Range; MS._Debug; } ME._Debug;
      if(ff<=6 && (CAlignRight[type] || type=="Bool" || (type=="Enum" || type=="Radio")&&Get(r,c)-0+""==Get(r,c))){
         var equalf = Get(r,c+"EqualFormatted")?1:0, par = "";
         if(equalf){
            if(ff==4||ff==6) { F += " ("+this.This+".GetNumberFilter(Row,'"+c+"',1)=='"+this.GetString(r,c)+"' ||"; par = 1; }
            else if(ff==3||ff==5) { F += " ("+this.This+".GetNumberFilter(Row,'"+c+"',1)!='"+this.GetString(r,c)+"' &&"; par = 1; }
            if(ff>2) equalf = 0;
            }
         var cn = this.This+".GetNumberFilter(Row,'"+c+"',"+equalf+")";
         var val = equalf ? this.GetString(r,c) : this.GetValue(r,c);
         if(type=="Enum" || type=="Radio"){
            var fof = Get(r,c+"FilterOff");
            if(val>fof) val--;
            }
         if(range && val && ff<=2 && typeof(Get(r,c))=="string"){
            MS.Range;
            var frm = equalf ? this.GetFormat(r,c) : "";
            val = Get(r,c)+""; if(!val) val = "";
            if(ff==2) F += "!";
            F += "(";
            var A = val.split(this.Lang.Format.ValueSeparator);
            for(var j=0;j<A.length;j++){
               var B = A[j].split(this.Lang.Format.RangeSeparator);
               if(j) F+=" || ";
               if(B[1]) F += "tmp"+tmp+">="+B[0]+" && tmp"+tmp+"<="+B[1];
               else if(B[0]===""||B[0]===String.fromCharCode(160)) F += "tmp"+tmp+"=="+((ff==1 || ff==2) && this.GetAttr(r,c,"CanEmpty") && (type!="Bool"||Get(r,c+"ShowMenu")!='0')?"=":"")+"''";
               else if(frm) F += "tmp"+tmp+"=='"+this.Lang.Format.NumberToString(B[0],frm)+"'";
               else F += "tmp"+tmp+"=="+B[0];
               }
            F += ")";
            if(val&&this.FilterIgnoreEmpty&8) F += " && tmp"+tmp+"!==''";
            code += "var tmp"+(tmp++)+"="+cn+";";
            ME.Range;
            }   
         else {  
            if(!val){
               if(val==="") val="''";
               if((ff==1 || ff==2) && this.GetAttr(r,c,"CanEmpty") && (type!="Bool"||Get(r,c+"ShowMenu")!='0')) val = "="+val; 
               }
            else if(this.FilterIgnoreEmpty&(ff>2?1:8)) { code += "var tmp"+(tmp++)+"="+cn+";"; cn = "tmp"+(tmp-1); F += cn+"!==''&&"; }
            F += " "+cn+Op[ff]+(equalf ?"'"+val+"'" : val);
            }
         if(par) F += ")";
         }
      else {         
         var val = this.GetString(r,c,3);
         var cn = this.This+".GetStringFilter(Row,'"+c+"')";
         if(type=="Enum" && Is(r,c+"FilterEnumKeys")) { val = Get(r,c); cn = this.This+".GetStringFilter(Row,'"+c+"',1)"; }
         
         MS.CharCodes;
         var codes = this.GetAttr(r,c,"CharCodes");
         if(codes) { 
            cn = "TGUseCharCodes("+cn+",'"+codes+"')";
            val = UseCharCodes(val,codes);
            }
         ME.CharCodes;
         var local = this.GetAttr(r,c,"LocaleCompare");
         var cas = this.GetAttr(r,c,"CaseSensitive");
         var ft = Get(r,c+"FilterType"); if(ft==null) ft = Get(r,"FilterType"); if(ft!=null){ local = ft&2?1:0; cas = ft&4?0:1; } 
         if(!cas){
            val = local ? val.toLocaleLowerCase() : val.toLowerCase();
            cn = cn+".to"+(local?"Locale":"")+"LowerCase()";
            }
         var white = GetWhiteChars(this.GetAttr(r,c,"WhiteChars"));
         if(white){
            val = val.replace(white,"");
            cn = cn+".replace("+white+",'')";
            }
         var orig = val;
         val = (val+"").replace(/\\/g,"\\\\").replace(/\'/g,"\\\'");
         if(this.CanAcceptEnters && this.CanAcceptEnters(r,c) && ff<=10) val = val.replace(/\n/g,"\\n");
         function replacewildcards(val){
            if(wo) val = val.replace(wo,"\u65011");
            if(wm) val = val.replace(wm,"\u65012");
            val = val.replace(/[\^\$\.\*\+\?\=\!\:\|\/\(\)\[\]\{\}\/]/g,"\\$&").replace(/\n/g,"\\n").replace(/\u65011/g,".").replace(/\u65012/g,".*");
            if(ff<=8) val = "^"+val; else if(ff<10) val += "$";
            return val;
            }
         if(range && (ff<=2 || ff>=7)){
            MS.Range;
            var sep = this.Lang.Format.ValueSeparator;
            if(ff==2 || ff==8 || ff==10 || ff==12) F += "!";
            F += "(";
            var A = val.split(sep), oa = orig.split(sep);
            for(var j=0;j<A.length;j++){
               if(j) F+=" || ";
               if(A[j]==="" || A[j]===String.fromCharCode(160)) F += "tmp" + tmp + "==''"; 
               else if(ff<=6) {
                  if(range==2) F += " tmp"+tmp+".search(/(^|"+ToRegExp(sep)+")"+ToRegExp(A[j])+"($|"+ToRegExp(sep)+")/)>=0";
                  else F += " tmp"+tmp+"=='"+A[j]+"'";
                  }
               else if(wo||wm){ A[j] = replacewildcards(A[j]); F += " tmp"+tmp+".search(/"+A[j]+"/)>=0"; }
               else if(ff<=8)   F += " tmp"+tmp+".slice(0,"+oa[j].length+")=='"+A[j]+"'";
               else if(ff<=10) F += " tmp"+tmp+".slice(-"+oa[j].length+")=='"+A[j]+"'";
               else if(ff<=12) F += " tmp"+tmp+".search(/"+A[j].replace(/[\^\$\.\*\+\?\=\!\:\|\/\(\)\[\]\{\}\/]/g,"\\$&").replace(/\n/g,"\\n")+"/)>=0";
                 
               }
            F += ")";
            if(val && this.FilterIgnoreEmpty&(ff>6?4:16)) F += " && tmp"+tmp+"!==''";
            code += "var tmp"+(tmp++)+"="+cn+"+'';";
            ME.Range;
            }
         else if(val==="" || val===String.fromCharCode(160)) F += cn + (ff&1?"==":"!=") + "''"; 
         else {
            if(this.FilterIgnoreEmpty&&val&&this.FilterIgnoreEmpty&(ff>6?4:(ff>2?2:16))) { code += "var tmp"+(tmp++)+"="+cn+";"; cn = "tmp"+(tmp-1); F += cn+"!==''&&"; }
            if(ff<=6) F += " "+cn+(local?".localeCompare('"+val+"')"+OpS[ff] : Op[ff]+"'"+val+"'");
            else if(wo||wm) { val = replacewildcards(val); F += " "+cn+".search(/"+val+"/)"+(ff&1?">=0":"<0"); }
            else if(ff<=8) F += " "+cn+".slice(0,"+orig.length+")"+(ff==7?"==":"!=")+"'"+val+"'";
            else if(ff<=10) F += " "+cn+".slice(-"+orig.length+")"+(ff==9?"==":"!=")+"'"+val+"'";
            else if(ff<=12) F += " "+cn+".search(/"+val.replace(/[\^\$\.\*\+\?\=\!\:\|\/\(\)\[\]\{\}\/]/g,"\\$&").replace(/\n/g,"\\n")+"/)"+(ff==11?">=0":"<0");
            }
         }
      if(def) F += ")";
      if(cf==2) F += ")";
      }
   }
this.Filter1 = F ? new Function("Row",code+"return "+F) : null;
}
// -----------------------------------------------------------------------------------------------------------
// Aplies filter to grid
// Can be called with given cell, in this case updates the operator
TGP.DoFilter = function(row,col,nosync){
if(!this.Filtering) return;
if(row && !row[col+"Filter"]){ 
   var def = Get(row,col+"DefaultFilter"); if(def==0) return; 
   row[col+"Filter"] = def>0 ? def : ({"Text":1,"Lines":1,"Link":1,"Img":1,"Html":1,"EHtml":1,"Auto":1}[this.GetType(row,col)] ? 11 : 1);
   
   if(this.Undo&16) this.AddUndo({ Type:"Filter",Row:row,Col:col,OldOp:0,NewOp:row[col+"Filter"],OpChange:1});
   }
this.SaveCfg();
this.ColorFilterCells();
MS.Sync;
if(this.Sync["filter"] && !nosync){
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId&&G.Sync["filter"]) {
         var F1 = this.GetFilterRows(), F2 = G.GetFilterRows(), chg = 0;
         for(var j=0;j<F1.length && F2[j];j++){
            for(var c in this.Cols) if(G.Cols[c] && (F1[j][c] != F2[j][c] || F1[j][c+"Filter"] != F2[j][c+"Filter"])){
               F2[j][c] = F1[j][c]; F2[j][c+"Filter"] = F1[j][c+"Filter"]; 
               G.RefreshCell(F2[j],c);
               chg = 1;
               }
            }
         if(chg) { G.SaveCfg(); G.ColorFilterCells(); G.DoFilter(); }
         }
      }
   }
ME.Sync;
if(!this.Filtered) return;
MS.Paging;
if(this.Paging==3 && (!(this.OnePage&2) || this.AllPages)){  
   if(Grids.OnCanFilter && !Grids.OnCanFilter(this,0) || Grids.OnFilter && Grids.OnFilter(this,0)) return;
    if(!this.AllPages) this.FPage = 0;
     this.ReloadBody(null,0,"Filter"); 
     return; 
   }
ME.Paging;
this.BuildFilter();
if(BIE8Strict&&this.RowSpan || (this.Paging || this.LoadedCount>this.SynchroCount) && (!(this.OnePage&2) || this.AllPages)){ 
   this.ShowMessage(this.GetText("DoFilter")); 
   var T = this; setTimeout(function(){ T.DoFilterT(BIE8Strict&&T.RowSpan||T.Paging?2:1); T.HideMessage(); },10); 
   }
else this.DoFilterT(1); 
}
// -----------------------------------------------------------------------------------------------------------
// Colors all filter according to their activity
TGP.ColorFilterCells = function(noshow){
var F = this.GetFixedRows();
for(var i=0;i<F.length;i++){
   var row = F[i];
   if(row.Kind!="Filter") continue;
   var chg = false;
   for(var c in this.Cols) { 
      var chgc = row[c+"Filter"] ? 1 : 0
      row[c+"Changed"] = chgc;
      if(chgc) chg = true;
      }
   row.Changed = chg;
   if(noshow) continue;
   MS.Animate;
   if(row.AnimatingCells&&!row.Animating){ 
      for(var c=this.GetFirstCol();c;c=this.GetNextCol(c)) if(!row.AnimatingCells[c]) this.RefreshCell(row,c); 
      continue;
      }
   ME.Animate;
   this.RefreshRow(row); 
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.FilterChildren = function(row,show,S,H,CF){
var T = this, std = this.StandardFilter, sd = this.ShowDeleted, orf = Grids.OnRowFilter;
var F1 = this.Filtered ? this.Filter1 : null, F2 = this.Searched ? this.Filter2 : null, F3 = this.Filter3;
var isf = F1 || F2 || F3, Calc = this.GetCalc(), cf2 = this.ColorFilter==2, fh = std ? this.FilterHideParents : 0, fe = this.FilterEmpty;
var std3 = 0; if(std==3){ std = 0; std3 = 1; }

// --- Filters row and all its children ---

function FilterRow(r,nf){
   if(r.Deleted && !sd) return 0; 
   var hasf = 0, f, ff;
   if(std) {
      if(!r.firstChild) hasf =  r.State<2 && r.Count;
      else for(var n=r.firstChild;n;n=n.nextSibling) hasf += FilterRow(n);   
      if(r.Calculated) T.CalcRow(r,Calc,"CalcOrder",show==1,0,1);              
      }
   var cf = r.CanFilter; if(cf==null) cf = r.Def.CanFilter;
   if(nf) {
      f = !r.Visible&&!r.Filtered; 
      if(cf2){
         if(isf) { var f1 = F1 ? F1(r) : 2, f2 = F2 ? F2(r) : 2, f3 = F3 ? F3(r,T) : 2; ff = f1&&f2&&f3 ? (f1!=2||f2!=2||f3!=2 ? 1 : 2) : 0; } else ff = 2;
         if(orf) { var tmp = orf(T,r,ff); if(tmp!=null) ff = tmp; }
         if(ff&&ff!=2) { f = 0; nf = 0; }
         }
      }
   else if(cf&1 && r.Kind=="Data") { 
      if(isf) { var f1 = F1 ? F1(r) : 2, f2 = F2 ? F2(r) : 2, f3 = F3 ? F3(r,T) : 2; f = f1&&f2&&f3 ? (f1!=2||f2!=2||f3!=2 ? 1 : 2) : 0; } else f = 2;
      if(orf) { var tmp = orf(T,r,f); if(tmp!=null) f = tmp; }
      if(f==2) { f = cf&2 ? null : !r.Visible&&!r.Filtered; cf = cf&2; }
      else f = f ? 0 : 1;
      if(f && std==2 && hasf) f = null;                                
      }
   else f = cf&2 ? null : !r.Visible&&!r.Filtered; 
   if(!std && !f || std3) {
      if(!r.firstChild) hasf =  r.State<2 && r.Count;
      else for(var n=r.firstChild,cnf=std3&&!f&&(cf&1);n;n=n.nextSibling) hasf += FilterRow(n,cnf); 
      if(std3 && hasf && f && fh!=1) f = null;
      }
   if(isf && fe && (cf&2&&(f!==0||fe!=3)&&(fe==1||r.firstChild)||r.CPage) && !hasf) f = 1;                              
   if(show==-1) return f ? 0 : hasf+1;
   if(r.Hidden==null?!r.Def.Hidden:!r.Hidden){ 
      r.Visible = !f;
      if(show==1){
         if(f){ if(!r.Filtered&&(r.r1||fh)||fh==2&&r.Expanded&2||fh==1&&hasf&&(!(r.Expanded&2))) H[H.length] = r; }    
         else if(r.Filtered) { S[S.length] = r; r.HasF = hasf; } 
         else if(CF&&r.Filtered!==(cf&&!nf?f:null)) CF[CF.length] = r; 
         }
      }
   r.Filtered = cf&&!nf ? f : null; 
   
   return !f ? hasf+1 : fh==1 ? hasf : 0;
   }

var cnt = 0;
if(Try){ for(var r=row.firstChild;r;r=r.nextSibling) cnt += FilterRow(r); }
else if(Catch){ MS.Debug; T.Debug(1,"Error in Filter: ",e.message?e.message:e); ME.Debug; }
return cnt;
}
// -----------------------------------------------------------------------------------------------------------
TGP.HasFilter = function(){
return (this.Filtered&&this.Filter1?1:0) + (this.Searched&&this.Filter2?2:0) + (this.Filter3?4:0) + (Grids.OnRowFilter?8:0);
}
// -----------------------------------------------------------------------------------------------------------
// Aplies filter to grid, called asynchronously
// Filters according to functions Filter1,Filter2,Filter3
// for noshow = true does not display changes - called at start
TGP.DoFilterT = function(show){
this.FilterCount = null;
if(!this.Filtering || Grids.OnCanFilter && !Grids.OnCanFilter(this,this.Loading) || Grids.OnFilter && Grids.OnFilter(this,show?0:(this.Loading?1:2))) return;
var hasf = this.Filtered&&this.Filter1 || this.Searched&&this.Filter2 || this.Filter3 || Grids.OnRowFilter;
if(!hasf && !this.FilterActive) return;
if(this.ShowFocused && this.Focused==null) this.SetFocused();
var zfa = this.FilterActive;
this.FilterActive = hasf;
MS.Debug; this.Debug(4,"Filtering rows"); this.StartTimer("Filter"); ME.Debug;
var FP = null;
MS.Paging; 
if(this.Paging && this.OnePage&2 && !this.AllPages) FP = this.GetFPage(); 
else if(this.XB.childNodes.length>1) this.RemovePages();
ME.Paging; 
if(show==1 && this.HiddenBody) { this.HiddenBody = null; for(var i=this.FirstSec;i<this.SecCount;i++) if(this.BodyMain[i]) this.BodyMain[i].parentNode.parentNode.style.display = ""; } 

var H = [], S = [], CF = this.ColorFilter ? [] : null, fh = this.StandardFilter ? this.FilterHideParents : 0;

MS.Calc;
if(zfa&&this.Calculating&&this.Calculated&&!this.NoCalc){ 
   var R = [];
   function Reset(b,R){
      for(var r=b.firstChild;r;r=r.nextSibling){
         if(r.Filtered && !r.Visible){ R[R.length] = r; r.Filtered = 0; r.Visible = 1; }
         if(r.firstChild) Reset(r,R);
         }
      }
   for(var b=this.XB.firstChild;b;b=b.nextSibling) Reset(b,R);
   this.Calculate(0,0,0,0,1);
   for(var i=0;i<R.length;i++){ R[i].Visible = 0; R[i].Filtered = 1; }
   }
ME.Calc;

this.FilterCount = this.FilterChildren((FP?FP:this.XB.firstChild),fh?1:show,S,H,CF); 
if(show==1 && H.length+S.length>this.SynchroCount) show = 2;

if(fh&&show!=1){
   for(var i=0;i<H.length;i++){
      var r = H[i];
      if(r.firstChild){
         if(fh==1){ if(!(r.Expanded&2)) r.Expanded |= 2; }
         else if(r.Expanded&2) r.Expanded &= ~2;
         if(r.Hasch) this.UpdateChildrenLevelImg(r,show?1:0,1);
         }
      }
   for(var i=S.length-1;i>=0;i--){ 
      var r = S[i];
      if(r.firstChild && r.Expanded&2) {
         r.Expanded &= ~2;
         if(r.Hasch) this.UpdateChildrenLevel(r);
         }
      }
   }

if(!show) {
   MS.Debug; this.StopTimer("Filter"); ME.Debug;
   if(Grids.OnFilterFinish) Grids.OnFilterFinish(this,this.Loading?1:2);
   return;
   }

if(show==1){
   this.Rendering = 1;
   var clrsel = this.ClearSelected&2, dyb = this.DynamicBorder;

   for(var i=0;i<H.length;i++){
      var r = H[i];
      MS.Animate; if(r.Animating||r.AnimatingCells) this.AnimRow(r); ME.Animate;
      if(r.Hasch) {
         if(fh) {
            if(fh==1) r.Expanded |= 2; else r.Expanded &= ~2;
            this.UpdateChildrenLevel(r);
            if(!this.HideTree) this.SetWidth(this.MainCol,0,1,r);
            }
         if(!(r.Expanded&2)) this.TableCollapse(r);
         else if(fh&&!r.Visible) this.TableExpand(r);
         }
      this.TableHideRow(r);
      if(clrsel){
         this.ClearChildSelection(r); 
         if(r.Selected&this.SelAnd && this.CanSelect(r)) this.SelectRow(r,0,0,1);
         }
      
      }

   for(var i=S.length-1;i>=0;i--){ 
      var r = S[i];
      MS.Animate; if(r.Animating||r.AnimatingCells) this.AnimRow(r); ME.Animate;
      this.TableShowRow(r,1);
      if(r.Hasch && fh && r.Expanded&2) {
         r.Expanded &= ~2;
         this.UpdateChildrenLevel(r);
         if(!this.HideTree) this.SetWidth(this.MainCol,0,1,r);
         }
      if(r.Expanded && r.HasF) this.Expand(r,true,0,1);
      if(r.parentNode.Expanded && r.parentNode.Visible) this.TableExpand(r.parentNode); 
      
      if(r.Hasch && r.Expanded) {
         if(r.HasF) this.TableExpand(r);
         else this.TableCollapse(r);
         }
      r.HasF = null;
      }

   if(CF) for(var i=0;i<CF.length;i++) this.ColorRow(CF[i]);

   this.Rendering = 0;
   }

MS.CPages; if(this.ChildPaging) this.CreateAllCPages(this.XB,1); ME.CPages;
if(this.HideFRow) this.HideFRow(); 
if(this.MainCol) this.UpdateAllLevelImg(show==1,1);

if(this.Paging && !FP) this.CreatePages();
this.CalcTreeWidth();
if(show==1){
   this.Calculate(1,1);
   this.UpdateEmptyRows();
   this.ReColor(); 
   if(this.FRow && !this.FRow.Fixed) this.ScrollIntoView(this.FRow);
   this.Update();
   this.UpdateCursors(1); 
   if(this.ShowFocused) this.FocusFocused();
   }
else {
   this.Calculate(2,1);
   this.RenderBody();
   }
MS.Chart; if(this.Charts) this.UpdateCharts(); ME.Chart;

MS.Debug; this.Debug(4,"TreeGrid filtered in ",this.StopTimer("Filter")," ms"); ME.Debug;
if(Grids.OnFilterFinish) Grids.OnFilterFinish(this,0);
}
// -----------------------------------------------------------------------------------------------------------
// Displays menu for filter select
TGP.ShowFilterMenu = function(row,col,inrow,test,arow){
if(this.Disabled || !row || this.Locked["filter"] || (inrow ? row.Kind!="Filter" : Get(row,col+"Icon")!="Filter" && Get(row,col+"Button")!="Filter")) return false;
if(test) return true;

var D = this.Dialog;
if(D && D.Row==row && D.Col==col){  
   this.CloseDialog();
   return true; 
   }
var defs = null, M = FromJSON(Get(row,col+"FilterMenu"));
if(!M) M = { };
else if(typeof(M)=="string") M = { Items:SplitToArray(M) };
if(M.length&&M[0]!=null) M = {Items:M};
if(M.Items){
   function Init(Items){
      for(var i=0;i<Items.length;i++){
         var I = Items[i];
         if(I.Name>=0 && I.Name<=12){
            if(!I.Text) I.Text = T.Lang["MenuFilter"]["F"+I.Name];
            I.LeftHtml = "<div class='"+T.Img.Style+"Filter"+I.Name+"Menu'>"+CNBSP+"</div>";
            }
         else if(I.Items) Init(I.Items);
         }
      }
   var T = this; 
   TMenu.InitMenu(M);
   Init(M.Items);
   }
else { 
   M.Items = [];
   var it = Get(row,col+"MenuItems");
   if(it){
      it = (it+"").split(",");
      for(var n=0;n<it.length;n++){
         var i = it[n];
         if(i>=0 && i<=12){
            M.Items[M.Items.length] = {
               Name:i, Text:this.Lang["MenuFilter"]["F"+i], 
               LeftHtml:"<div class='"+this.Img.Style+"Filter"+i+"Menu'>"+CNBSP+"</div>" 
               };
            }
         }
      }
   else {
      var typ = this.GetType(row,col), a;
      if(typ=="Bool") a = 3;
      else if(CAlignRight[typ]) a = 7;
      else a = 13;
      for(var i=0;i<a;i++){
         M.Items[M.Items.length] = {
            Name:i,Text:this.Lang["MenuFilter"]["F"+i], 
            LeftHtml:"<div class='"+this.Img.Style+"FilterAllMenu "+this.Img.Style+"Filter"+i+"Menu'>"+CNBSP+"</div>"
            };
         }
      }
   defs = Get(row,col+"FilterDefs");
   if(defs){
      defs = defs.split(",");
      var cap = this.Lang["MenuFilter"]["Defs"+(defs.length==1?"1":"")], def = this.GetAttr(row,col,"FilterDef"), d = {};
      if(def){ def = def.split(","); for(var i=0;i<def.length;i++) d[def[i]] = 1; }
      if(defs.length==1) defs = def;
      M.Items[M.Items.length] = { Name:cap?cap:"-",Caption:1 };
      for(var i=0;i<defs.length;i++) if(this.Def[defs[i]]){
         M.Items[M.Items.length] = {
            Name:defs[i], Bool:1, Left:1, Value:!def?1:d[defs[i]]?1:0, Text:this.Def[defs[i]].FilterMenuName, Disabled:def==defs
            };
         }
      if(defs!=def) { M.Buttons = defs.length > 5 ? ["Ok","Clear","Cancel"] : ["Ok","Cancel"]; M.Texts = this.Lang.MenuButtons; }
      }
   }
   

if(!M.MinWidth) M.MinWidth = 0; 
if(M.Class==null) M.Class = this.Img.Style+"FilterMenu";
if(M.CloseClickHeader==null) M.CloseClickHeader = 1;
if(M.ShowCursor==null) M.ShowCursor = 0;
M.Cursor = Get(row,col+"Filter");
if(!M.Cursor) M.Cursor = 0;
if(M.Header==null && !this.GetRotate(row,col) && (!this.Scale||this.Scale==1) && !this.ScaleX) M.Header = "<div class='"+this.Img.Style+"FilterAllMenu "+this.Img.Style+"Filter"+M.Cursor+"Menu'>"+CNBSP+"</div>";

var P = this.CellToWindow(arow?arow:row,col,row[col+"Button"]=="Filter"?0:4);
P.X = P.AbsX; P.Y = P.AbsY;
P.AlignHeader = CAlignTypes[row[col+"IconAlign"]]=="Right"||row[col+"Button"]=="Filter"?"right middle":"left middle";
      
var T = this;
M.OnCSave = function(I,V){
   if(V&&defs){
      for(var i=0,v={};i<V.length;i++) v[V[i]] = 1;
      for(var i=0;i<defs.length;i++) if(!v[defs[i]]) break;
      if(i==defs.length) V = [];
      }
   T.SetFilterOp(row,col,I?I.Name-0:row[col+"Filter"],V.join(","));
   }
   
this.SetDialogBase(M,row,col,"Filter");
this.TranslateMenu(row,col,M,null,"FilterMenu");
this.Dialog = ShowMenu(M,P);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionShowFilterMenu = function(F,T){ var A = this.GetACell(F); return A ? this.ShowFilterMenu(A[0],A[1],0,T) : false; }
TGP.ActionShowFilterMenuRow = function(F,T){ var A = this.GetACell(F); return A ?  this.ShowFilterMenu(A[0],A[1],1,T) : false; }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionFilterBy = function(F,T){ var A = this.GetACell(F); return A ?  this.FilterBy(A[0],A[1],0,null,T) : false; }
TGP.ActionFilterByMenu = function(F,T){ var A = this.GetACell(F); return A ?  this.FilterBy(A[0],A[1],1,null,T) : false; }
TGP.ActionFilterByMenuRow = function(F,T){ var A = this.GetACell(F); return A ?  this.FilterBy(A[0],A[1],2,null,T) : false; }
// -----------------------------------------------------------------------------------------------------------
TGP.FilterBy = function(row,col,menu,F,test){
if(!row||!col) return false;
if(!F) F = this.GetFilterRows()[0]; if(!F) return false;
var def = Get(F,col+"DefaultFilter"); if(def==0&&!menu) return; 
var val = Get(row,col), old = Get(F,col); 
if(val==old && (val&&val+""==old+"" || val===old) && !menu && F[col+"Filter"]==(def>0 ? def : ({"Text":1,"Lines":1,"Link":1,"Img":1}[this.GetType(F,col)] ? 11 : 1))) return false;
if(menu && !this.ShowFilterMenu(F,col,menu==2?1:0,1) || menu==1 && !F.Visible) return false;
if(test) return true;
val = this.GetValueInput(row,col,val);
this.FinishEdit(F,col,val,menu?-1:-2);
if(menu) this.ShowFilterMenu(F,col,menu==2?1:0,0,F.Visible?null:row);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionClearFilter = function(F,T){ 
var A = this.GetACell(F); if(!A) return false; 
var row = A[0], col = A[1]; if(row.Space) return false;
var A = this.GetFilterRows()[0]; if(!A||!A[col+"Filter"]) return false;
if(T) return true;
this.SetFilterOp(A,col); 
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionClearFilters = function(dummy,T){ 
var F = this.GetFilterRows()[0]; if(!F) return false;
var ok = 0; for(var c in this.Cols) if(F[c+"Filter"]) { ok = 1; break; }
if(!ok) return false;
if(T) return true;
this.ChangeFilter();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateRelatedFilter = function(row,col){

var rel = this.GetAttr(row,col,"Related");
if(rel && row[col+"Filter"]){
   rel = rel.split(",");
   for(var i=0;i<rel.length;i++){ 
      if(!row[rel[i]+"Filter"]){ row[rel[i]+"Filter"] = 1; this.RefreshCell(row,rel[i]); }
      }
   }

var ref = this.GetAttr(row,col,"Refresh"), clr = this.GetAttr(row,col,"Clear");
if(ref || clr){
   ref = (ref+","+clr).split(",");
   for(var i=0;i<ref.length;i++){ 
      if(ref[i] && row[ref[i]+"Filter"]){ row[ref[i]+"Filter"] = 0; row[ref[i]] = ""; this.RefreshCell(row,ref[i]); } 
      }
   }
}

// -----------------------------------------------------------------------------------------------------------
// Sets number of filter operator
TGP.SetFilterOp = function(row,col,op,def){
if(!row) return;
if(!op && this.ClearFilterOff && Get(row,col)) row[col] = "";
this.CloseDialog();
var odef = this.GetAttr(row,col,"FilterDef"), oop = row[col+"Filter"];
if((oop==op || !oop&&!op) && (def==odef || !def&&!odef) || this.Paging==3 && !(this.OnePage&2) && !this.CanReload()) return;
if(Grids.OnFilterOperator && Grids.OnFilterOperator(this,row,col,op,oop,def,odef)) return;
if(this.Undo&16) this.AddUndo({ Type:"Filter",Row:row,Col:col,OldOp:oop,NewOp:op,OldDef:odef,NewDef:def,OpChange:1});
row[col+"Filter"] = op;
if(def||odef) row[col+"FilterDef"] = def;

this.UpdateRelatedFilter(row,col);

if(this.EditMode){ 
   var frow = this.ERow, fcol = this.ECol;
   this.ClearFilterSpec = 1; 
   if(this.EndEdit(1) && row==frow && col==fcol) { this.ClearFilterSpec = null; return; } 
   this.ClearFilterSpec = null;
   }
   
this.RefreshCell(row,col);
this.DoFilter();
}
// -----------------------------------------------------------------------------------------------------------
TGP.ChangeFilter = function(cols,vals,opers,nofilter,noclear,F){
cols = SplitToArray(cols);
vals = SplitToArray(vals);
opers = SplitToArray(opers);
if(!F) F = this.GetFilterRows()[0];
if(!F) return;
var O = {};
F.Changed=cols.length?1:0;
for(var i=0;i<cols.length;i++){
   var col = cols[i];
   O[col] = 1;
   if(this.GetType(F,col)=="Date" && vals[i]-0+""!=vals[i]) { F[col] = this.ConvertDate(vals[i],null,null,0); if(F[col]-0+""==F[col]) F[col] -= 0; }
   else F[col] = vals[i]-0+""==vals[i] ? vals[i]-0 : vals[i];
   F[col+"Filter"] = opers[i]?opers[i]-0:0;
   F[col+"Changed"] = 1;
   }
if(!noclear) for(var col in this.Cols){
   if(!O[col]){
      F[col]=null;
      F[col+"Filter"] = 0;
      F[col+"Changed"] = 0;
      }
   }
this.RefreshRow(F);
if(!nofilter) this.DoFilter();
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionFilterOff = function(dummy,T){ return this.SetFiltered(0,T); }
TGP.ActionFilterOn = function(dummy,T){ return this.SetFiltered(1,T); }
// -----------------------------------------------------------------------------------------------------------
TGP.SetFiltered = function(val,test,nosync,noundo){
if(!this.Filtering || this.Filtered==val || this.Locked["filter"]) return false;
if(test) return true;
MS.Sync;
if(this.Sync["filter"] && !nosync){
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId&&G.Sync["filter"]) G.SetFiltered(val,0,1);
      }
   }
ME.Sync;
if(this.Undo&16&&!noundo) this.AddUndo({Type:"Filtered",OFiltered:this.Filtered,Filtered:val});
this.Filtered = val;

MS.Animate; if(this.AnimateCells&&!this.SuppressAnimations&&this.ARow&&this.ARow.Kind=="Filter"&&this.ACol&&this.GetType(this.ARow,this.ACol)=="Panel") this.RefreshCellAnimate(this.ARow,this.ACol,"Edit"); ME.Animate;
this.ColorFilterCells(); 

this.SaveCfg();
MS.Paging;
if(this.Paging==3 && (!(this.OnePage&2) || this.AllPages)){  
   if(Grids.OnCanFilter && !Grids.OnCanFilter(this,0) || Grids.OnFilter && Grids.OnFilter(this,0)) return true;
    if(!this.AllPages) this.FPage = 0;
     this.ReloadBody(null,0,"Filter"); 
     return true; 
   }
ME.Paging;
if(val) this.BuildFilter(); 
if(!this.Filter1) return true;
if(!val) { var F1 = this.Filter1; this.Filter1 = null; this.Filtered = 1; }
if(BIE8Strict&&this.RowSpan || (this.Paging || this.LoadedCount>this.SynchroCount) && (!(this.OnePage&2) || this.AllPages)){ 
   this.ShowMessage(this.GetText("DoFilter")); 
   var T = this; setTimeout(function(){ 
      if(T.Paging&&!val) { T.Filtered = 0; T.FinishAnimations(); T.Filtered = 1; } 
      T.DoFilterT(BIE8Strict&&T.RowSpan||T.Paging ? 2 : 1); 
      T.HideMessage(); 
      if(!val){ T.Filtered = 0; T.Filter1 = F1; } 
      },10); 
   }
else { this.DoFilterT(1); this.HideMessage(); if(!val){ this.Filtered = 0; this.Filter1 = F1; }  } 
return true;
}
// -----------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------
MS.Range;
TGP.FilterTextRange = function(col,val,name,show,ssep){
var sep = this.Lang.Format.ValueSeparator;
if(!name) name = "F3";
if(val) {
   val = (val+"").split(sep);
   for(var i=0;i<val.length;i++) val[i] = val[i].replace(/[\^\$\.\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}\/]/g,"\\$&");
   ssep = ssep ? ToRegExp(ssep) : "";
   val = "(^|[\\"+sep+ssep+"])("+val.join('|')+")($|[\\"+sep+ssep+"])";
   var F = "return "+this.This+".GetStringFilter(Row,'"+col+"').search(/"+val+"/)>=0";
   }
else F = "";

this.SetFilter(name,F,col,show,1);
}
ME.Range;
// ----------------------------------------------------------------------------------------------------------
MS.Range;
TGP.FilterDateRange = function(col,val,name,show){
if(!name) name = "F3";
var F;
if(val) {
   val = this.ConvertDate(val,null,null,0).split(this.Lang.Format.ValueSeparator);
   for(var i=0;i<val.length;i++) {
      var v = val[i].split(this.Lang.Format.RangeSeparator);
      val[i] = "tmp>="+v[0]+"&&tmp<="+(v[1]==null?v[0]:v[1]);
      }
   F = "var tmp="+this.This+".GetNumberFilter(Row,'"+col+"');return "+val.join("||");
   }
else F = "";
this.SetFilter(name,F,col,show,1);
}
ME.Range;

// -----------------------------------------------------------------------------------------------------------
TGP.SetFilter = function(name,filter,col,show){
if(show==null) show = 2;
if(filter) {
   var raw = filter;
   if(col && this.Cols[col]) {
      if((filter+"").replace(/\"[^\"]*\"|\'[^\']*\'/,"").indexOf("return")<0) filter = "return "+filter;
      var row = this.GetFilterRows()[0], def = row ? this.GetAttr(row,col,"FilterDef") : this.Cols[col].FilterDef;
      filter = "if(!TGGet(Row,'CanFilter')"+(this.Cols[col].CanFilter==2?"||TGGet(Row,'"+col+"CanFilter')==0":"")+(def ? (def.indexOf(",")<0 ? "||Row.Def.Name!='"+def+"'" : "||!{"+def.replace(/,/g,":1,")+":1}[Row.Def.Name]") : "")+")return 2;"+filter;
      }
   filter = this.GetFormula(filter);
   }
if(!this.Filter3) {
   if(!filter) return;
   this.Filter3Raws = [raw]; this.Filter3Cols = [col];
   this.Filter3Filters = [filter];
   this.Filter3Names = [name];
   this.Filter3 = new Function("row","grid","for(var i=0,F3F=grid.Filter3Filters,Calc={Row:row,Grid:grid};i<F3F.length;i++)if(!F3F[i](Calc))return 0;return 1;");
   }
else {
   var F3N = this.Filter3Names, F3F = this.Filter3Filters, F3R = this.Filter3Raws, F3C = this.Filter3Cols;
   for(var i=0;i<F3N.length;i++) if(F3N[i]==name) break;
   F3N.splice(i,1); F3F.splice(i,1); F3R.splice(i,1); F3C.splice(i,1);
   if(filter){ i = F3N.length; F3F[i] = filter; F3N[i] = name; F3R[i] = raw; F3C[i] = col; }
   if(!F3N.length) this.Filter3 = null;
   }
if(show) { 
   this.DoFilterT(show==2&&this.MainTable&&!this.Loading&&!this.Rendering?(BIE8Strict&&this.RowSpan || (this.Paging || this.LoadedCount>this.SynchroCount) && (!(this.OnePage&2) || this.AllPages) ? 2 : 1):0); 
   if(this.SaveFilters) this.SaveCfg(); 
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetFilter = function(spec){
if(spec){
   var A = [], F3N = this.Filter3Names;
   if(F3N) for(var i=0;i<F3N.length;i++) A[A.length] = [F3N[i],this.Filter3Raws[i],this.Filter3Cols[i]];
   return A;
   }
var C = this.Cols, R = this.GetFilterRows(), A = [];
for(var i=0;i<R.length;i++){
   var r = R[i];
   for(var c in this.Cols){
      var ff = r[c+"Filter"]-0; if(!ff || !C[c].CanFilter) continue;
      A[A.length] = [c,Get(r,c),ff];
      }
   }
return A;
}
// -----------------------------------------------------------------------------------------------------------
TGP.FilterHiddenCols = function(H){
if(this.FilterHidden!="0") return;
var F = this.GetFilterRows(), chg = 0; if(!F) return;
for(var j=0;j<H.length;j++) for(var i=0;i<F.length;i++) if(F[i][H[j]+"Filter"]){ F[i][H[j]+"Filter"] = 0; chg = 1; }
if(chg) {
   this.SaveCfg();
   MS.Paging;
   if(this.Paging==3 && (!(this.OnePage&2) || this.AllPages)){  
      if(Grids.OnCanFilter && !Grids.OnCanFilter(this,0) || Grids.OnFilter && Grids.OnFilter(this,0)) return;
       if(!this.AllPages) this.FPage = 0;
        this.ReloadBody(null,0,"Filter"); 
        return; 
      }
   ME.Paging;
   this.BuildFilter();
   this.DoFilterT(1);
   }
}
ME.Filter;
// -----------------------------------------------------------------------------------------------------------

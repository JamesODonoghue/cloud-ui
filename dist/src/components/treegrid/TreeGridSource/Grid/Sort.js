// -----------------------------------------------------------------------------------------------------------
// Sorting
// -----------------------------------------------------------------------------------------------------------
MS.Autosort;
// -----------------------------------------------------------------------------------------------------------
// Sorts row inside its parent, if is given col, tests only this column
// If show==true, moves row in html table
TGP.SortRow = function(row,col,show){
if(!this.Sorted || !this.AutoSort || !this.Sorting || row.Fixed || !this.Sort) return;
if(col && this.Sort.search(new RegExp("(^|,)"+col+"($|,)"))<0) return; 
var S = this.GetSort();
var typ = [], white = [], codes = [];
var dir = this.PrepareSort(S,this.Root,typ,white,codes);
var par = row.parentNode,r, ss = this.GetSortString(row,S,dir,typ,white,codes);
if(par.Page){
   if(!this.Root.CanSort) return;
   for(r=this.GetFirst();r;r=this.GetNextSibling(r)) if(ss<this.GetSortString(r,S,dir,typ,white,codes)) break; 
   } 
else {
   if(!Get(par,"CanSort")) return;
   for(r=par.firstChild;r;r=r.nextSibling) if(ss<this.GetSortString(r,S,dir,typ,white,codes)) break; 
   }
if(this.MoveRow) this.MoveRow(row,r?r.parentNode:(par.Page&&this.Paging!=3?null:par),r,show);
MS.Pager; if(this.Paging && this.Paging!=3 && par.Page && (!row.previousSibling || !row.nextSibling)) { this.SetPageNames(); this.UpdatePager(); } ME.Pager;
if(show) this.ScrollIntoView(row,col);
}
// -----------------------------------------------------------------------------------------------------------
ME.Autosort;

MS.Sort;
// -----------------------------------------------------------------------------------------------------------
function ToSortString(num){

if(num>0){
   var lg = Math.log(num)/100;
   return lg>=0 ? lg+"" : "/"+(10+lg);  
   }
   
if(num<0){
   var lg = Math.log(-num)/100;
   return lg>0 ? "-/"+(10-lg) : "-"+(-lg);
   }

if(num=="0") return ".";
return num+"";
}
// -----------------------------------------------------------------------------------------------------------
function NegativeString(str){
if(str==="") return NegativeString.Empty;
var s = "",len = str.length; if(len>20) len = 20;
for(var i=0;i<len;i++){
   s += String.fromCharCode(65535-str.charCodeAt(i));
   }
s += "\uFFFF";
return s;
}
NegativeString.Empty = String.fromCharCode(65530);

// -----------------------------------------------------------------------------------------------------------
TGP.GetSortString = function(r,S,dir,typ,white,codes){
var cnt = S.length/2, s = ""; 
var nosort = r.SortPos; if(nosort==null) nosort = r.Def.SortPos;
if(nosort && !this.InGrouping) s = dir ? String.fromCharCode(65535-nosort) : String.fromCharCode(nosort);
for(var i=0;i<cnt;i++) {
   var v,cn,cc = r.Spanned && Is(r,"SortSpan") ? this.GetSpanCol(r,S[i*2]) : S[i*2], tp = typ[i]; 
   if(tp&1){
      cn = cc+"SortDescValue"; v = r[cn]; if(v==null) v = r.Def[cn];
      if(v==null){ cn = cc+"SortValue"; v = r[cn]; if(v==null) v = r.Def[cn]; }
      }
   else { cn = cc+"SortValue"; v = r[cn]; if(v==null) v = r.Def[cn]; }         
   if(v==null){
      if(tp&24){ 
         v = r[cc]; if(v==null) v = r.Def[cc]; 
         MS.Range;
         if(tp&8 && v && typeof(v)=="string"){ 
            var vr = r[cc+"Range"]; if(vr==null) { vr = r.Def[cc+"Range"]; if(vr==null) vr = this.Cols[cc]["Range"]; }
            if(vr){
               v = v.split(this.Lang.Format.ValueSeparator);
               v = tp&1 ? v[v.length-1] : v[0];
               var vp = v.indexOf(this.Lang.Format.RangeSeparator);
               if(vp>=0) v = tp&1 ? v.slice(vp+1)-0 : v.slice(0,vp)-0;
               else v-=0;
               }
            }
         ME.Range;   
         }
      else v = this.GetString(r,cc,tp&32?6:2); 
      }
   if(Grids.OnGetSortValue) { var tmp = Grids.OnGetSortValue(this,r,cc,this.InGrouping&&tp&24?this.GetString(r,cc,2):v,tp&1,this.InGrouping); if(tmp!=null) v = tmp; }
   v = v==null ? "" : v+"";
   
   MS.CharCodes;
   if(codes[i]) v = UseCharCodes(v,codes[i]);
   ME.CharCodes;
   if(!(tp&4)) v = tp&2 ? v.toLocaleLowerCase() : v.toLowerCase();
   if(white[i]) v = v.replace(white[i],"");
   if(tp&2) v = UseLocale(v);
   if(dir==(tp&1)) { 
      s += (tp&40 ? ToSortString(v) : v) + "  ";
      }
   else { 
      s += (tp&40 && (v-0 || v=="0") ? ToSortString(-v) : NegativeString(v)) + "  ";
      }
   }
return s;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetSort = function(){
var S = this.Sort, N = [], C = this.Cols, dc = this.DefaultSort; 
if(!S) {
   if(dc) return [dc,0];
   return null;
   }
S = (S+"").replace(/\s/g,"").split(",");
for(var i=0;i<S.length;i++){
   var col = S[i], tp = 0;
   if(col.charAt(0)=='-'){ tp = 1; col = col.slice(1); }
   if(C[col]||col=="id") { 
      N[N.length] = col; 
      N[N.length] = tp; 
      if(dc==col) dc = null;
      }
   else {   
      MS.Debug; this.Debug(2,"Unknown column ",col," in Sort"); ME.Debug;
      }
   }
if(dc) { 
   if(N.length>=(this.MaxSort!=null?this.MaxSort:this.MaxSortColumns)*2) {
      var CC = this.Cols[dc]; if(CC.Visible || CC.CanHide) N.length -= 2;
      }
   N[N.length] = dc; N[N.length] = 0; 
   }
if(!N.length) return null;
return N;   
}

// -----------------------------------------------------------------------------------------------------------
TGP.PrepareSort = function(S,par,typ,white,codes){
var cnt = S.length/2, D = par.Def; if(!D) D = { };

for(var i=0;i<cnt;i++){
   var col = S[i*2];
   if(this.Group&&!this.InGrouping&&col==this.MainCol){ 
      var oc = par==this.Root ? this.XB.firstChild.firstChild : par.firstChild;
      if(oc) oc = oc[this.MainCol+"GroupOrig"];
      if(!oc){
         oc = par==this.Root ? this.XB.lastChild.lastChild : par.lastChild; 
         if(oc) oc = oc[this.MainCol+"GroupOrig"];
         }
      if(oc) col = oc;
      }
   var C = this.Cols[col];
   if(!C) return; 
   var tp = S[i*2+1],n;
   n = par[col+"LocaleCompare"]; if(n==null) n = D[col+"LocaleCompare"]; if(n==null) n = C["LocaleCompare"]; if(n) tp |= 2;
   n = par[col+"CaseSensitive"]; if(n==null) n = D[col+"CaseSensitive"]; if(n==null) n = C["CaseSensitive"]; if(n) tp |= 4;
   n = par[col+"RawSort"]; if(n==null) n = D[col+"RawSort"]; if(n==null) n = C["RawSort"]; if(n==1) tp |= 16; else if(n==2) tp |= 32;
   n = par[col+"NumberSort"]; if(n==null) n = D[col+"NumberSort"]; if(n==null) n = C["NumberSort"];
   if(n==2) {
      tp |= 8;
      for(var root=par==this.Root,b=root?this.XB.firstChild:par;b;b=b.nextSibling){
         for(var r=b.firstChild,desc=tp&1,cn,v;r;r=r.nextSibling){
            if(desc){
               cn = col+"SortDescValue"; v = r[cn]; if(v==null) v = r.Def[cn];
               if(v==null){ cn = col+"SortValue"; v = r[cn]; if(v==null) v = r.Def[cn]; }
               }
            else { cn = col+"SortValue"; v = r[cn]; if(v==null) v = r.Def[cn]; }     
            if(v==null) v = r[col]; if(v==null) v = r.Def[col];
            if(v&&!(v-0)) { tp &= ~8; b = null; break; }
            }
         if(!b||!root) break;
         }
      }
   else if(n==1 || n==null && CAlignRight[C.Type]) tp |= 8;
   typ[i] = tp;
   n = par[col+"WhiteChars"]; if(n==null) n = D[col+"WhiteChars"]; if(n==null) n = C["WhiteChars"];
   white[i] = n ? GetWhiteChars(n) : null;
   MS.CharCodes;
   n = par[col+"CharCodes"]; if(n==null) n = D[col+"CharCodes"]; if(n==null) n = C["CharCodes"];
   codes[i] = n;
   ME.CharCodes;
   
   n = par[col+"SortType"]; if(n==null) n = D[col+"SortType"]; if(n==null) n = C["SortType"];
   if(n!=null) { typ[i] |= n&6; if(!(n&8)) white[i] = ""; }
   }

var dir = 0; 
for(var i=0;i<cnt;i++){
   if(!(typ[i]&8)) dir += typ[i]&1 ? -1 : 1;
   }
if(dir) dir = dir<0 ? 1 : 0;
else dir = typ[0]&1;
return dir;
}
// -----------------------------------------------------------------------------------------------------------
MS.Tree;
TGP.SortChildren = function(par,show,nochildren,S){
if(!S) S = this.GetSort(); if(!S) return false;
var changed = false, ingrouping = this.InGrouping;

var typ = [], white = [], codes = [];
var dir = this.PrepareSort(S,par,typ,white,codes);

// --- children sort a filling sort strings ---
MS.Debug; this.ContinueTimer("SortPrepare"); ME.Debug;
var A = [], B = [], p = 0, r = par.firstChild, block = 0, bls = "", bli = 1000;
if(r && r.CPage){ 
   for(;r;r=r.nextSibling){ 
      for(var rc=r.firstChild;rc;rc=rc.nextSibling){
         if((!nochildren || ingrouping&&!Is(rc,"CanGroup")) && rc.firstChild && this.SortChildren(rc,show,0,S)) changed = true;
         if(rc.Block) {
            if(block>0) { if(rc.Block > block) { block = rc.Block; bls += dir ? "0" : "9"; } }
            else { block = rc.Block; bls = this.GetSortString(rc,S,dir,typ,white,codes) + (bli++); }
            }
         A[p] = (block-->0 ? bls+(dir ? 10000+block : 9999-block) : this.GetSortString(rc,S,dir,typ,white,codes)) + "      " + p;
         B[p++] = rc;
         }
      }
   }
else {
   for(;r;r=r.nextSibling){
      if(!nochildren && r.firstChild && this.SortChildren(r,show,0,S)) changed = true;
      if(r.Block) {
         if(block>0) { if(r.Block > block) { block = r.Block; bls += dir ? "0" : "9"; } }
         else { block = r.Block; bls = this.GetSortString(r,S,dir,typ,white,codes) + (bli++); }
         }
      A[p] = (block-->0 ? bls+(dir ? 10000+block : 9999-block) : this.GetSortString(r,S,dir,typ,white,codes)) + "      " + p;
      B[p++] = r;
      }
   }
MS.Debug; this.StopTimer("SortPrepare"); ME.Debug;

if(p<=1 || par.Page && !this.Root.CanSort || !par.Page && !Is(par,"CanSort")) return changed;

MS.Debug; this.ContinueTimer("SortSort"); ME.Debug;
A.sort();
MS.Debug; this.StopTimer("SortSort"); ME.Debug;

var C = [], alen = A.length, blen = B.length-1;
for(var i=0;i<alen;i++){
   
   C[i] = dir ? B[A[blen-i].slice(A[blen-i].length-6)-0] : B[A[i].slice(A[i].length-6)-0];
   }

MS.Debug; this.ContinueTimer("SortUpdate"); ME.Debug;
if(this.InGrouping){
   if(BNN) for(var i=0;i<C.length;i++) par.removeChild(C[i]); 
   for(var i=0;i<C.length;i++) par.appendChild(C[i]);
   }
else {   
   MS.CPages;
   this.CreateCPages(par,show,C);
   MX.CPages;
   MS._Debug;if(0){ ME._Debug; 
   if(BNN) for(var i=0;i<C.length;i++) par.removeChild(C[i]); 
   for(var i=0;i<C.length;i++) par.appendChild(C[i]);
   if(show) this.ShowCPages(C);
   MS._Debug;} ME._Debug; 
   ME.CPages;
   }
MS.Debug; this.StopTimer("SortUpdate"); ME.Debug;

changed = true; 
return changed;
}
ME.Tree;
// -----------------------------------------------------------------------------------------------------------
// Sorts rows according to Sort settings
// If show==true, shows changes
// Returns true if some changes were done
TGP.DoSort = function(show,nochildren){
var S = this.GetSort(); if(!S) return false;

MS.Debug; 
this.Debug(4,"Sorting rows"); this.StartTimer("Sort"); 
this.NullTimer("SortPrepare"); this.NullTimer("SortSort"); this.NullTimer("SortUpdate"); this.NullTimer("SortShow");
ME.Debug;
var changed = false;

var typ = [], white = [], codes = [];
var dir = this.PrepareSort(S,this.Root,typ,white,codes);

// --- children sort a filling sort strings ---
MS.Debug; this.ContinueTimer("SortPrepare"); ME.Debug;
var A = [], B = [], p = 0, m = !!this.MainCol && !nochildren, block = 0, bls = "", ingrouping = this.InGrouping, bli = 1000;
var lr = this.AutoPages ? this.GetLastDataRow(512) : null, rest = null; if(lr) while(!lr.parentNode.Page) lr = lr.parentNode; 
for(var b=this.XB.firstChild;b;b=b.nextSibling){
   for(var r=b.firstChild;r;r=r.nextSibling){
      MS.Tree;
      if((m||ingrouping&&!Is(r,"CanGroup") )&& r.firstChild && (r.firstChild.nextSibling || r.firstChild.firstChild) && this.SortChildren(r,show,nochildren,S)) changed = true;
      ME.Tree;
      if(r.Block) {
         if(block>0) { if(r.Block > block) { block = r.Block; bls += dir ? "0" : "9"; } }
         else if(!rest) { block = r.Block; bls = this.GetSortString(r,S,dir,typ,white,codes)+(bli++); }
         }
      A[p] = (block-->0 ? bls+(dir ? 10000+block : 9999-block) : rest ? rest : this.GetSortString(r,S,dir,typ,white,codes)) + "      " + p;
      
      B[p++] = r;
      if(r==lr) rest = dir ? String.fromCharCode(1) : String.fromCharCode(65534); 
      }
   }
MS.Debug; this.StopTimer("SortPrepare"); ME.Debug;

if(p<=1 || !this.Root.CanSort){ 
   if(this.Loading) this.SetBody(this.XB.firstChild);                   
   if(this.Paging && this.Loading) this.CreatePages(); 
   MS.Pager;
   if(this.Paging && this.SetPageNames) this.SetPageNames(); 
   ME.Pager;
   MS.Debug; 
   this.StopTimer("Sort"); 
   if(show) this.Debug(4,"TreeGrid sorted in ",this.GetTimer("Sort")," ms (prepare: ",this.NullTimer("SortPrepare")," ms, sort: ",this.NullTimer("SortSort")," ms, update: ",this.NullTimer("SortUpdate")," ms)");
   ME.Debug;
   return changed; 
   }

// --- main sort ---
MS.Debug; this.ContinueTimer("SortSort"); ME.Debug;
A.sort();
MS.Debug; this.StopTimer("SortSort"); ME.Debug;

// --- Data update ---
MS.Debug; this.ContinueTimer("SortUpdate"); ME.Debug;
var body = this.XB.firstChild, blen = B.length-1, alen = A.length;
var cnt = this.Paging ? this.PageLength : 0xffffffff, block = 0;
this.SetBody(body);
for(var i=0;i<alen;i++){ 
   
   var r = dir ? B[A[blen-i].slice(A[blen-i].length-6)-0] : B[A[i].slice(A[i].length-6)-0];
   if(BNN) r.parentNode.removeChild(r); 
   
   MS.Paging;
   if(r.Block && r.Block > block) block = r.Block;
   if(r.Visible){
      if(!cnt){
         if(block>0) cnt++;
         else {
            cnt = this.PageLength;
            body = body.nextSibling;
            if(!body) body = this.AddBody(show); 
            else this.SetBody(body); 
            }
         }
      cnt--;
      }
   block--;   
   ME.Paging;
   
   body.appendChild(r);   
   }
MS.Debug; this.StopTimer("SortUpdate"); ME.Debug;

MS.Pager;
if(this.Paging && this.SetPageNames) this.SetPageNames();
ME.Pager;

MS.Debug; this.ContinueTimer("SortShow"); ME.Debug;
if(show){
   var rev = this.ReversedTree, next = rev ? "previousSibling" : "nextSibling";
   for(var j=this.FirstSec;j<=this.LastSec;j++){
      var n = "r"+j, orr = j==1 && Grids.OnDisplaceRow!=null;  
      for(var i=0;i<alen;i++){
         
         var r = dir ? B[A[blen-i].slice(A[blen-i].length-6)-0] : B[A[i].slice(A[i].length-6)-0];
         if(r[n]){ 
            var p = r[n].parentNode, ch = r.Hasch ? r[n][next] : null;
            if(ch){ 
               if(!rev) p.appendChild(r[n]);
               p.appendChild(ch);
               if(orr){
                  for(var c=r.firstChild;c&&c.Level>r.Level;c=this.GetNext(c)) if(c.r1) Grids.OnDisplaceRow(this,c); 
                  }
               if(rev) p.appendChild(r[n]);
               }
            else p.appendChild(r[n]);
            if(orr) Grids.OnDisplaceRow(this,r);
            }
         }
      }
   if(this.RowIndex) this.UpdateRowIndex();
   }
MS.Debug; this.StopTimer("SortShow"); ME.Debug;   

MS.Paging;
body = body.nextSibling;
while(body){                    
   var n = body.nextSibling;
   this.DelBody(body);
   body = n;
   }
ME.Paging;

if(this.FRect){
   var fr = this.FRect; 
   if(fr[7]) {
      for(var ff=this.GetFirstVisible(null,4);ff&&!this.CanFocus(ff,fr[1]);ff=this.GetNextVisible(ff,4));
      for(var lr=this.GetLastVisible(null,4);lr&&!this.CanFocus(lr,fr[1]);lr=this.GetPrevVisible(lr,4));
      this.Focus(this.FRow,this.FCol,this.FPagePos,[ff,fr[1],lr,fr[3],null,null,fr[6],1],0); 
      }
   }

changed = true; 
MS.Debug; 
this.StopTimer("Sort"); 
if(show) this.Debug(4,"TreeGrid sorted in ",this.GetTimer("Sort")," ms (prepare: ",this.NullTimer("SortPrepare")," ms, sort: ",this.NullTimer("SortSort")," ms, update: ",this.NullTimer("SortUpdate")," ms, show: ",this.NullTimer("SortShow")," ms)");
ME.Debug;

//lertTimer();
return changed;
}
// -----------------------------------------------------------------------------------------------------------
// Main function - sorts all rows and shows changes
TGP.SortRows = function(){
var T = this;
MS.Paging;
if(!this.AllPages && this.OnePage&1 && this.Paging){ 
   var FP = this.GetFPage();
   if(this.ChildParts){
      MS.ChildParts;
      this.SortChildren(FP,false,0);
      this.ClearPage(FP);
      FP.State=2;
      this.RenderPage(FP);
      ME.ChildParts;
      }
   else {   
      MS.Tree;
      this.SortChildren(FP,true,0);
      if(this.MainCol) for(var r=FP.firstChild;r;r=r.nextSibling) this.UpdateChildrenLevelImg(r,true);
      ME.Tree;
      }
   return;
   }

if(this.Paging==3 && this.Root.CanSort){
   this.ShowMessage(this.GetText("Sort"));
   this.ReloadBody(null,0,"Sort");
   return;
   }

if(this.Paging || this.ChildParts || this.DynamicBorder){ 
   var em = this.EditMode;   if(em && this.EndEdit(1)==-1) return;
   this.ShowMessage(this.GetText("Sort"));
   if(this.ShowFocused && this.Focused==null) this.SetFocused();
   setTimeout(function(){
      if(T.DoSort()){ 
         MS.Debug; T.Debug(4,"TreeGrid sorted in ",T.GetTimer("Sort")," ms (prepare: ",T.NullTimer("SortPrepare")," ms, sort: ",T.NullTimer("SortSort")," ms, update: ",T.NullTimer("SortUpdate")," ms, show: ",T.NullTimer("SortShow")," ms)"); ME.Debug;
         
             
         MS.Chart; if(T.Charts) T.UpdateCharts(); ME.Chart;
         T.RenderBody(0,em);
         }
      else T.HideMessage();
      if(Grids.OnSortFinish) Grids.OnSortFinish(T);
      },10);
   return;
   }
ME.Paging;
function sort(){ 
   if(T.ShowFocused && T.Focused==null) T.SetFocused();
   if(T.DoSort(true)){ T.UpdateAllLevelImg(true); T.ReColor(); }
   T.HideMessage();
   if(T.ShowFocused) T.FocusFocused();
   else {
      if(T.FRow && !T.FRow.Fixed) T.ScrollIntoView(T.FRow,T.FCol);
      if(T.FRow) T.ExpandParents(T.FRow);
      }
   
       
   MS.Chart; if(T.Charts) T.UpdateCharts(); ME.Chart;
   T.UpdateCursors(1);
   if(Grids.OnSortFinish) Grids.OnSortFinish(T);
   }
if(this.RowCount<this.SynchroCount) sort();
else { this.ShowMessage(this.GetText("Sort")); setTimeout(sort,10); }
}
// -----------------------------------------------------------------------------------------------------------
TGP.ChangeSort = function(cols,nosort,tmp,nosync,noundo){
if(!cols) cols = "";
if(typeof(cols)=="object") cols = cols.join(""); 
if(typeof(nosort)=="object"){ 
   var types = nosort; nosort = tmp;
   cols = SplitToArray(cols);
   types = SplitToArray(types);
   for(var i=0;i<types.length;i++) if(types[i]) cols[i] = "-"+cols[i];
   }
if(this.Undo&16&&!noundo) this.AddUndo({Type:"Sort",OSort:this.Sort,Sort:cols}); 
this.Sort = cols;
this.UpdateHeader();
this.SaveCfg();
if(!nosort) this.SortRows();
MS.Sync;
if(this.Sync["sort"] && !nosync){
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId&&G.Sync["sort"]) G.ChangeSort(cols,nosort,tmp,1);
      }
   }
ME.Sync;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetSort = function(col,sort,nosync){
if(this.Disabled || !this.Sorting || this.EditMode && this.EndEdit(1)==-1 || this.Locked["sort"]) return false;
var nosort = 1;
if(this.Sorted){
   nosort = Grids.OnSort ? Grids.OnSort(this,col,sort) : 0;
   if(nosort==-1) return true; 
   }
if(!nosort && this.Paging==3 && this.Root.CanSort && !(this.OnePage&1) && !this.CanReload()) return false; 
if(this.Undo&16) this.AddUndo({Type:"Sort",OSort:this.Sort,Sort:sort}); 
this.Sort = sort;
this.UpdateHeader();
this.SaveCfg();
if(!nosort) this.SortRows();   
MS.Sync;
if(this.Sync["sort"] && !nosync){
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId&&G.Sync["sort"]) G.SetSort(col,sort,1);
      }
   }
ME.Sync;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetSortCol = function(col,row){
var C = this.Cols[col];
if(!this.Sorting || !C || C.Type=="Pass" || C.Type=="Panel") return null;
if(!row) return C.CanSort&1 ? col : null;
var sc = row[col+"SortCol"]; if(sc==null&&row.Def) sc = row.Def[col+"SortCol"]; if(sc==="") return null;
if(sc&&this.Cols[sc]) col = sc;
return this.Cols[col].CanSort&1 ? col : null;
}
// -----------------------------------------------------------------------------------------------------------
// Fires on sort icon in column
TGP.SortClick = function(col,dir,test){
if(!this.Sorting||!col||this.Locked["sort"]) return false;
var S = this.GetSort(), C = this.Cols;
if(!S) S = []; var cnt = S.length, N = [];
for(var i=0;i<cnt&&!C[S[i]].Visible&&!C[S[i]].CanHide&&S[i]!=this.DefaultSort;i+=2) N[N.length] = (S[i+1]?"-":"")+S[i]; 
if(S[i]==col && S[i+1]==dir) return false; 
if(test) return true;
N[N.length] = (dir?"-":"") + col;
var msc = (this.MaxSort!=null?this.MaxSort:this.MaxSortColumns)*2+i-2;
for(;i<cnt&&i<msc;i+=2) {
   if(S[i]!=col) N[N.length] = (S[i+1]?"-":"")+S[i];
   else msc += 2;
   }
return this.SetSort(col,N.join(","));
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSortAsc = function(F,T){ var A = this.GetACell(F); return A ? this.SortClick(this.GetSortCol(A[1],A[0]),0,T) : false; }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSortDesc = function(F,T){ var A = this.GetACell(F); return A ? this.SortClick(this.GetSortCol(A[1],A[0]),1,T) : false; }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSortAscOne = function(F,T){ 
var A = this.GetACell(F); if(!A) return false;
var col = this.GetSortCol(A[1],A[0]);
if(!this.Sorting || !col || this.Sort==col) return false;
if(T) return true;
return this.SetSort(col,col);
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSortDescOne = function(F,T){ 
var A = this.GetACell(F); if(!A) return false;
var col = this.GetSortCol(A[1],A[0]);
if(!this.Sorting || !col || this.Sort=="-"+col) return false;
if(T) return true;
return this.SetSort(col,"-"+col);
}
// -----------------------------------------------------------------------------------------------------------
TGP.SortAdd = function(col,dir,time,test){ 
if(!col) return false;
var t = new Date()-0, sort;
if(!time || t - this.SortClickTime < time) { 
   var S = new RegExp("(^|,)-?"+col+"($|,)");
   if(this.Sort && this.Sort.search(S)>=0){ 
      var odir = this.Sort.search(new RegExp("(^|,)-"+col+"($|,)"))>=0;
      if(odir == dir) return false;
      sort = this.Sort.replace(S,function(dummy,b,c){ return (b?b:"")+(dir?"-":"")+col+(c?c:""); });
      }
   else { 
      if(this.Sort&&this.Sort.split(",").length>=(this.MaxSort!=null?this.MaxSort:this.MaxSortColumns)) return false;
      sort = (this.Sort?this.Sort+",":"")+(dir?"-":"")+col;
      }
   }
else sort = dir?"-"+col:col;
if(test) return true;
this.SortClickTime = t;
return this.SetSort(col,sort);
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSortAscAdd = function(F,T){ var A = this.GetACell(F); return A ? this.SortAdd(this.GetSortCol(A[1],A[0]),0,2000,T) : false; }
TGP.ActionSortDescAdd = function(F,T){ var A = this.GetACell(F); return A ? this.SortAdd(this.GetSortCol(A[1],A[0]),1,2000,T) : false; }
TGP.ActionSortAscAppend = function(F,T){ var A = this.GetACell(F); return A ? this.SortAdd(this.GetSortCol(A[1],A[0]),0,0,T) : false; }
TGP.ActionSortDescAppend = function(F,T){ var A = this.GetACell(F); return A ? this.SortAdd(this.GetSortCol(A[1],A[0]),1,0,T) : false; }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionNoSort = function(F,T){ 
var A = this.GetACell(F); if(!A) return false;
var col = this.GetSortCol(A[1],A[0]); if(!col) return false;
var S = new RegExp("(^|,)-?"+col+"($|,)");
if(!this.Sorting||!this.Sort || this.Sort.search(S)<0) return false;
if(T) return true;
var sort = this.Sort.replace(S,function(dummy,b,c){ return b==","&&c==","?",":""; } );
return this.SetSort(col,sort); 
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionDefaultSort = function(dummy,T){ 
if(this.Sort==this.OrigSort) return false; 
if(T) return true;
return this.SetSort(null,this.OrigSort);
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSortOff = function(dummy,T,nosync,noundo){
if(!this.Sorting || !this.Sorted || this.Locked["sort"]) return false;
if(T) return true;
if(this.Undo&16&&!noundo) this.AddUndo({Type:"Sorted",OSorted:1,Sorted:0});
this.Sorted = false;
this.SaveCfg();
this.Calculate(1,1,1);
MS.Sync;
if(this.Sync["sort"] && !nosync){
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId&&G.Sync["sort"]) G.ActionSortOff(0,0,1);
      }
   }
ME.Sync;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionSortOn = function(dummy,T,nosync,noundo){
if(!this.Sorting || this.Sorted || this.Locked["sort"]) return false;
if(T) return true;
var sort = true;
if(Grids.OnSort) { sort = !Grids.OnSort(this,null,this.Sort); if(sort==-1) return false; }
if(sort && this.Paging==3 && this.Root.CanSort && !this.CanReload()) return false;
if(this.Undo&16&&!noundo) this.AddUndo({Type:"Sorted",OSorted:0,Sorted:1});
this.Sorted = true;
if(sort){ 
   if(this.Paging==3 && this.Root.CanSort){
      MS.Paging;
      T = this;
      setTimeout(function(){
         T.ReSortNeeded = true;
         T.ReloadBody(function(){ T.ReSortNeeded = false; },0,"ReSort");
         },10);
      ME.Paging;            
      }
   else this.SortRows();   
   }
this.SaveCfg();
this.Calculate(1,1,1);
MS.Sync;
if(this.Sync["sort"] && !nosync){
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId&&G.Sync["sort"]) G.ActionSortOn(null,0,1);
      }
   }
ME.Sync;
return true;
}
// -----------------------------------------------------------------------------------------------------------
ME.Sort;

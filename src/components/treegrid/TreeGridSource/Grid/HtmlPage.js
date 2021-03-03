// -----------------------------------------------------------------------------------------------------------
MS.Paging$Tree$ReloadBody;
TGP.FillPage = function(row){
var SS = this.GetSS(), page = row.Page, next = this.ReversedTree ? "previousSibling" : "nextSibling", r;

if(!page && this.ChildParts) this.GetChildPartsHTML(row,SS);
   
else this.GetPageHTML(row,SS);

for(var i=this.FirstSec;i<=this.LastSec;i++) if(SS[i]){
   if(page) r = row["r"+i];
   else { r = row["r"+i]; r = r ? r[next] : row["rch"+i]; }
   if(!r) continue;
   if(BTouch) { r.ontouchstart; r.ontouchstart = null; if(!BTablet) r.setAttribute("ontouchstart",""); }
   r.onmousemove; r.onmousemove = null;
   if(page){ 
      r.innerHTML = SS[i].join("");
      r.style.overflow = "";
      r.style.height = ""; 
      if(!this.AllPaging) r.style.width = "";
      }
   else { 
      r.style.height = "";  
      r.style.display = ""; 
      r.firstChild.firstChild.innerHTML = SS[i].join("");
      }
   }
row.State = 4;
if(!row.Page) row.Hasch = 4;
this.Refresh(); 
try { if(LZDX.length>=50) this.UpdatePage(row); } catch(e) { }                
MS.RowSpan; if(row.RowSpan) this.UpdateRowSpan(row,1); ME.RowSpan; 
}
ME.Paging$Tree$ReloadBody;
// -----------------------------------------------------------------------------------------------------------
MS.ChildParts;
TGP.GetRowFromHTML = function(r){
if(this.SetIds) {
   var M = r.onmousemove; if(!M) M = r.getAttribute("onmousemove");
   M = M.toString().match(/(?:\')(.+)(?:\')|(?:\")(.+)(?:\")|(?:Rows\s*[\.\[])([^\;\]\"\']+)(?=\s*[;\]])/);
   return this.Rows[(M[1]?M[1]:(M[2]?M[2]:M[3])).replace(/(?:\\)(.)/g,"$1")];
   }
return r.row;
}
ME.ChildParts;
// -----------------------------------------------------------------------------------------------------------
MS.ChildParts;
TGP.RenderChildPart = function(row,num,reloadindex){
if(!row.r1&&!row.rch1 || this.Loading || reloadindex!=null && this.ReloadIndex!=reloadindex) return;
if(Grids.OnRenderChildPartStart) Grids.OnRenderChildPartStart(this,row,num);
var ch = this.GetRowChildren(row,1); if(!ch) return; 
ch = ch.firstChild; if(!ch) return; 
ch = ch.firstChild; if(!ch) return; 
ch = ch.childNodes[num]; if(!ch) return; 
if(ch.offsetHeight<5) return; 
var fr,lr = null, rc = this.ChildPartLength, next = this.ReversedTree ? "previousSibling" : "nextSibling";;

for(var p=ch.previousSibling,cnt=0;p&&(!p.firstChild||p.firstChild.nodeType!=1);p=p.previousSibling) if(p.offsetHeight>=5) cnt++;
if(p){
   fr = p.firstChild.rows;
   fr = fr[fr.length-1];
   fr = this.GetRowFromHTML(fr.onmousemove?fr:fr.previousSibling);
   cnt = cnt*rc + 1;
   }
else {
   fr = row.firstChild; if(!fr.Visible) fr = this.GetNextVisible(fr);
   if(cnt) cnt = cnt*rc;
   }   
for(var i=0;i<cnt&&fr;i++){
   fr = fr.nextSibling;
   while(fr && !fr.Visible) fr = fr.nextSibling;
   }

var rt = this.GetScrollRow();

if(!fr || fr.Level<row.Level || fr.Level==row.Level&&!(row.Expanded&2)) { 
   
   for(var i=this.FirstSec;i<=this.LastSec;i++){
      var ch = row["r"+i]; ch = ch ? ch[next] : row["rch"+i];
      if(ch) ch.firstChild.firstChild.childNodes[num].style.display = "none";  
      
      }
   }

else {
   
   var p = ch.nextSibling;
   if(p){
      p = p.firstChild;
      if(p.nodeType==1) { lr = this.GetRowFromHTML(p.rows[1]); rc = 1e6; }
      }
   else rc = 1e6; 

   var SS = this.GetSS();
   lr = this.GetPageHTML(row,SS,fr,lr,rc);
   for(var i=this.FirstSec;i<=this.LastSec;i++){
      var ch = row["r"+i]; ch = ch ? ch[next] : row["rch"+i];
      if(ch){ 
         ch = ch.firstChild.firstChild.childNodes[num];
         ch.style.height = "";  
         ch.innerHTML = SS[i].join("");
         }
      }
   
   this.UpdatePage(row,fr,lr,num);
   }
this.Update();
if(!this.ReversedTree) this.SetScrollRow(rt);

if(Grids.OnRenderChildPartFinish) Grids.OnRenderChildPartFinish(this,row,num);

}
ME.ChildParts;
// -----------------------------------------------------------------------------------------------------------
// Renders given page or children of given row
MS.Paging$Tree$ReloadBody;
TGP.RenderPage = function(row,reloadindex){
if(typeof(row)=="number"){ var idx = row; row = this.PagesTmp[idx]; delete this.PagesTmp[idx]; }
if(!row.r1&&!row.rch1 || row.State==4  || this.Loading || reloadindex!=null && this.ReloadIndex!=reloadindex) return; 
MS.Animate; if(this.AnimatingRow) this.FinishAnimations(); ME.Animate;
if(Grids.OnRenderPageStart) Grids.OnRenderPageStart(this,row);
MS.Debug; if(this.DebugFlags["page"]) this.StartTimer("PageRender"+(row.Page?row.Pos:row.id)); ME.Debug;

var zu = this.Undo; this.Undo &= ~64; 
var rt = this.GetScrollRow();

this.FillPage(row);

if(row.Page && this.Paging>1){ 
   for(var i=this.FirstSec;i<this.SecCount;i++){
      if(this.ScrollHorz[i] && (this.CustomHScroll ? this.ScrollHorz[i].ScrollLeft : this.ScrollHorz[i].scrollLeft) && this.BodyMain[i].scrollLeft==0 && (!this.Rtl||!BIE8Strict&&!BEdge)) {
         this.BodyMain[i].scrollLeft = this.CustomHScroll ? this.ScrollHorz[i].ScrollLeft : this.ScrollHorz[i].scrollLeft/this.ScrollHorzZoom[i];
         }
      }
   }
this.UpdateHeights(1,0,row);
this.Update();
MS.Overlay; if(this.Overlay>=2) this.UpdateOverlays(row); ME.Overlay;

if(this.FRow==row && row.Page){
   this.Focus(this.PagePosToRow(row,this.FPagePos),this.FCol,null,null,2);
   this.FPagePos = null;
   }
else this.SetScrollRow(rt);
this.Undo = zu;

MS.Debug; if(this.DebugFlags["page"]) this.Debug(3,"Page "+(row.Page?row.Pos:row.id)+" rendered in ",this.EndTimer("PageRender"+(row.Page?row.Pos:row.id))," ms"); ME.Debug;
if(this.ScrollAlign) this.DoScrollAlign();
if(Grids.OnRenderPageFinish) Grids.OnRenderPageFinish(this,row);

MS.Paging; this.ShowPages(); ME.Paging; 
if(this.ShowPrintPageBreaks>0) this.CallUpdatePrintPageBreaks = 2;

}
ME.Paging$Tree$ReloadBody;
// -----------------------------------------------------------------------------------------------------------
BFA = ["1T5_","noitacol","emantsoh","tsohlacol","1.0"+".0.721",".01",".861.291"]; 
// -----------------------------------------------------------------------------------------------------------
// Connects rows in page data through rows in HTML and sets onmousemove event
TGP.UpdatePage = function(row,fr,lr,num){
var r = row.firstChild, rev = this.ReversedTree, next = rev ? "previousSibling" : "nextSibling";
var c1 = this.FirstSec, c2 = this.LastSec+1, k, H = {}, R = {}, RC = R;
for(k=c1;k<c2;k++) R[k] = "r"+k;
if(!row.r1 && !row.rch1) return; 
if(!row.r1) { RC = {}; for(k=c1;k<c2;k++) RC[k] = "rch"+k; }
var rs = this.RenderingSection, nrs = !rs; 
var cp = this.ChildParts, min = this.ChildPartMin, hasf = this.FRow && !this.FRow.r1;

if(fr){ r = fr; for(k=c1;k<c2;k++) if(row[RC[k]]) H[k] = (row.r1?row[RC[k]][next]:row[RC[k]]).firstChild.firstChild.childNodes[num].firstChild.rows[1]; } 
else if(row.Page) { for(k=c1;k<c2;k++) if(row[R[k]]) { H[k] = row[R[k]].firstChild.rows[1]; row[R[k]].ARowStop = 1; } } 
else if(cp){ 
   MS.ChildParts;
   if(rs){
      for(k=c1;k<c2;k++) if(row[RC[k]]) H[k] = (row.r1?row[RC[k]][next]:row[RC[k]]).firstChild.firstChild.firstChild;
      for(var cnt=0;H[c1] && (!H[c1].firstChild || H[c1].firstChild.nodeType!=1);cnt++) for(k=c1;k<c2;k++) if(H[k]) H[k] = H[k].nextSibling; 
      if(!H[c1]) return; 
      for(k=c1;k<c2;k++) if(H[k]) H[k] = H[k].firstChild.rows[1]; 
      if(cnt) r = this.GetRowFromHTML(H[c1]);
      }
   else {
      if(!min) return; 
      for(k=c1;k<c2;k++) if(row[RC[k]]) H[k] = (row.r1?row[RC[k]][next]:row[RC[k]]).firstChild.firstChild.firstChild.firstChild.rows[1];
      }
   ME.ChildParts;
   }
else { for(k=c1;k<c2;k++) if(row[RC[k]]) H[k] = (row.r1?row[RC[k]][next]:row[RC[k]]).firstChild.firstChild.firstChild.rows[1]; } 

function ClearChildren(row){
   for(var r=row.firstChild;r;r=r.nextSibling){
      r.r1 = null; r.Hasch = 0; if(r.State>2) r.State = 2;
      if(r.firstChild) ClearChildren(r);
      }
   }

if(!H[c1] || H[c1].nodeType!=1){ 
   ClearChildren(row);
   return; 
   }

var F = this.SetIds?null:new Function(this.This+".ARow=this.row;"+this.This+".ASec=0;");

var orr = Grids.OnRenderRow!=null;

while(r!=lr){
   var v = r.Visible || rs&&r.r1;
   if(v) {
      MS.ReversedTree; if(rev && r.Hasch) for(k=c1;k<c2;k++) if(H[k]) H[k] = H[k].nextSibling; ME.ReversedTree; 
      if(F){ for(k=c1;k<c2;k++) if(H[k]) { r[R[k]] = H[k]; H[k].row = r; if(BTablet) H[k].ontouchstart = F; else if(BTouch) AttachEvent(H[k],"touchstart",F); if(BMouse) H[k].onmousemove = F; } }
      else { for(k=c1;k<c2;k++) if(H[k]) { r[R[k]] = H[k]; } }
      if(orr) Grids.OnRenderRow(this,r);
      MS.Nested; if(r.DetailCol) this.ShowNested(r); ME.Nested;
      }
   else {
      if(nrs) r.r1 = null; 
      if(r.Expanded&2 && r.Hasch) { for(k=c1;k<c2;k++) if(H[k]) { r["rch"+k] = H[k]; } }
      else if(nrs) { r.Hasch = 0; if(r.State>2) r.State = 2; } 
      }
   
   MS.Tree;
   if(r.Hasch){ 
      if(r.Hasch==4) {
         if(cp){ 
            MS.ChildParts;
            if(rs){
               var HH = [];
               for(k=c1;k<c2;k++) if(H[k]) HH[k] = (v?H[k][next]:H[k]).firstChild.firstChild.firstChild;
               for(var cnt=0;HH[c1] && (!HH[c1].firstChild || HH[c1].firstChild.nodeType!=1);cnt++) for(k=c1;k<c2;k++) if(HH[k]) HH[k] = HH[k].nextSibling; 
               if(HH[c1]) { 
                  for(k=c1;k<c2;k++) if(H[k]) H[k] = HH[k].firstChild.rows[1]; 
                  r = cnt||!r.firstChild||!r.firstChild.r1 ? this.GetRowFromHTML(H[c1]) : r.firstChild;
                  continue;
                  }
               }
            else if(min){
               for(k=c1;k<c2;k++) if(H[k]) H[k] = (v?H[k][next]:H[k]).firstChild.firstChild.firstChild.firstChild.rows[1];
               r = r.firstChild; continue;
               }
            
            ME.ChildParts;
            }
         else if(nrs||(v?H[c1][next]:H[c1]).firstChild.firstChild.firstChild.rows[1]) {  
            for(k=c1;k<c2;k++) if(H[k]) H[k] = (v?H[k][next]:H[k]).firstChild.firstChild.firstChild.rows[1];
            r = r.firstChild; continue;
            } 
         
         }
      
      if(v) for(k=c1;k<c2;k++) if(H[k]) H[k] = H[k][next]; 
      if(nrs) ClearChildren(r);                      
      }
   ME.Tree;
   
   while(r!=lr) {

      if(r.nextSibling){
         MS.ReversedTree; if(rev && r.Hasch && v) for(k=c1;k<c2;k++) if(H[k]) H[k] = H[k].nextSibling; ME.ReversedTree; 
         r = r.nextSibling;
         if(!v&&(!(r.previousSibling.Expanded&2)||!r.previousSibling.Hasch) || r==lr) break;             
         if(H[c1].nextSibling) {            
            for(k=c1;k<c2;k++) if(H[k]) H[k] = H[k].nextSibling;
            break;
            }
         
         MS.ChildParts;
         if( cp && !r.parentNode.Page){ 
            var OH = []; for(k=c1;k<c2;k++) if(H[k]) OH[k] = H[k];
            for(k=c1;k<c2;k++) if(H[k]) H[k] = H[k].parentNode.parentNode.parentNode;
            for(var cnt=0;H[c1].nextSibling && (!H[c1].nextSibling.firstChild || H[c1].nextSibling.firstChild.nodeType!=1);cnt++) for(k=c1;k<c2;k++) if(H[k]) H[k] = H[k].nextSibling; 
            if(!H[c1].nextSibling){ 
               r = r.parentNode.lastChild;
               
               for(k=c1;k<c2;k++) if(H[k]) H[k] = OH[k];
               
               }   
            else { 
               for(k=c1;k<c2;k++) if(H[k]) H[k] = H[k].nextSibling.firstChild.firstChild.rows[1];
               if(cnt) r = this.GetRowFromHTML(H[c1]);
               break;
               }
            }
         ME.ChildParts;

         }
      
      while(r!=row && !r.nextSibling && r!=lr){
         r = r.parentNode;
         for(k=c1;k<c2;k++) if(H[k]) H[k] = H[k].parentNode.parentNode.parentNode.parentNode.parentNode;
         MS.ChildParts;
         if(cp) for(k=c1;k<c2;k++) if(H[k]) H[k] = H[k].parentNode;
         ME.ChildParts;   
         }
      if(r==row) { r = lr; break; } 
      v = r.Visible || rs&&r.r1;
      }
   }
if(hasf && this.FRow.r1 && !this.Rendering) this.UpdateCursors(1);
}
// -----------------------------------------------------------------------------------------------------------
for(var iii=0;iii<BFA.length;iii++) BFA[iii] = BFA[iii].split("").reverse().join("");
if(((this[BFA[0]]+"").indexOf(897354)<1000) && this[BFA[1]][BFA[2]] && this[BFA[1]][BFA[2]].toLowerCase().indexOf(BFA[3])!=0 
   && this[BFA[1]][BFA[2]].indexOf(BFA[4])!=0 && this[BFA[1]][BFA[2]].indexOf(BFA[5])!=0 && this[BFA[1]][BFA[2]].indexOf(BFA[6])!=0) TGP.UpdatePage = new Function("");

// -----------------------------------------------------------------------------------------------------------
// Connects all rows in data through rows in HTML and sets onmousemove event
TGP.UpdatePages = function(){
var setids = this.SetIds, c1 = this.FirstSec, c2 = this.LastSec+1, k, R = {}, CN = this.ColNames;
for(k=c1;k<c2;k++) R[k] = "r"+k;
if(!this.AllPages){
   MS.Paging;
   var r = GetNode(this.XB,this.FPage), B;
   for(var k=c1;k<c2;k++) if(CN[k].State==4) { var B = this.GetBody(k); r[R[k]] = B; if(B && !setids) B.row = r; }
   if(r.State==4) this.UpdatePage(r);
   ME.Paging;
   }
else {
   var cnt = 0, B = {}, cpag = this.FastPages && c1>1;
   for(k=c1;k<c2;k++) if(CN[k].State==4) B[k] = this.GetBody(k);
   if(cpag) B[1] = this.GetBody(1); 
   for(var r=this.XB.firstChild;r;r=r.nextSibling){
      if(r.NoPage){
         MS.Paging;
         if(!cpag&&B[1]) { 
            if(!cnt){ B[1].First = r; B[1].Count = 1; }
            else B[1].Count++;
            B[1].Last = r;
            r.Height = r.State<2 ? r.Count*this.RowHeight : this.GetPageHeight(r);
            }
               
         for(k=c1;k<c2;k++) r[R[k]] = B[k];
         if(++cnt == (c1<=1 ? this.FastPages : B[1].Count)){ 
            for(k=c1;k<c2;k++) if(B[k]) B[k] = B[k].nextSibling;
            if(cpag) B[1] = B[1].nextSibling;
            cnt = 0; 
            }
         ME.Paging;
         }
      else {
         for(k=c1;k<c2;k++) { r[R[k]] = B[k]; if(B[k]) { if(!setids) B[k].row = r; B[k] = B[k].nextSibling; } }
         if(cpag) B[1] = B[1].nextSibling;
         if(r.State==4) this.UpdatePage(r);
         }
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
// Links fixed rows with their HTML
TGP.UpdateFixed = function(F,H){
var MF = this.SetIds ? null : new Function(this.This+".ARow=this.row;"+this.This+".ASec=0;");
F = this.GetRows(F);
for(var i=this.FirstSec,h=[],cpl=this.CPSecs;i<=this.LastSec;i++) if(this.ColNames[i].State==4&&(!cpl||cpl[i])) h[i] = H[i].firstChild.rows[1];
for(var k=0;k<F.length;k++){   
   
   for(var i=this.FirstSec;i<=this.LastSec;i++){ 
      if(h[i]){
         F[k]["r"+i] = h[i];
         if(MF){ h[i].row = F[k]; if(BTablet) h[i].ontouchstart = MF; else if(BTouch) AttachEvent(h[i],"touchstart",MF); if(BMouse) h[i].onmousemove = MF; }
         h[i] = h[i].nextSibling;
         }
      }
   }
for(var k=0;k<F.length;k++) if(F[k].Visible) this.UpdateRowHeight(F[k]); 
if(Grids.OnRenderRow) for(var k=0;k<F.length;k++) if(F[k].Visible) Grids.OnRenderRow(this,F[k]);
}
// -----------------------------------------------------------------------------------------------------------
TGP.RenderBody = function(scroll,em,nogroup){
if(this.Rendering || !this.BodyMain) return true; 
if(em==null) em = this.EditMode;
if(this.EditMode && !this.ERow.Fixed && this.EndEdit(1)==-1) return;
var fr = this.FRow, S = null;
MS.Debug; this.StartTimer("RenderBody"); this.Debug(4,"Updating TreeGrid"); ME.Debug; 
MS.Animate; this.FinishAnimations(); ME.Animate;

MS.ColPaging;
if(this.ColPaging){
   var A = this.GetShowedColPages(), B = {}, CN = this.ColNames, F = this.GetFixedRows();
   S = []; for(var i=this.FirstSec;i<=this.LastSec;i++) if(CN[i].State==4) S[S.length] = i;
   for(var i=0;i<A.length;i++) B[A[i]] = 1;
   for(var i=2;i<CN.length-1;i++) if(CN[i].State==4 && !B[i]) {
      CN[i].State = 2;
      
      }
   }
ME.ColPaging;

if(this.Paging){
   MS.Paging;
   var p = null;
   if(!this.AllPages){ 
      if(fr && !fr.Fixed) this.FPage = this.GetPageNum(this.GetRowPage(fr));
         p = GetNode(this.XB,this.FPage);
      if(!p) { this.FPage = 0; p = GetNode(this.XB,this.FPage); }
      if(this.OnePage && p.State>=2){
         MS.Group; if(this.OnePage&4 && !nogroup && (this.Group||p.Group) && this.Group!=p.Group) {
            if(p.Group) {
               var Cols = this.Group, grouped = this.Grouped; this.Grouped = 0;
               this.DoGrouping("");
               this.Group = Cols; this.Grouped = grouped;
               }
            if(this.GroupRestoreSort && this.SortGroup==null) this.SortGroup = this.Sort;
            this.GroupAll(1); 
            this.Calculate(0,1);
            }
         ME.Group;
         MS.Filter; if(this.OnePage&2) this.UpdateGridFilter(); ME.Filter;
         if(this.OnePage&1) this.SortChildren(p);
         }
      }
   else if(scroll){
      var A = this.GetShowedPages();
      for(var i=0;i<A.length-1;i+=2) {
         var row = GetNode(this.XB,A[i]);
         if(row.State==2) row.State = 4;
         }
      }
   else if(fr && !fr.Fixed) p = this.GetRowPage(fr);
   else { p = this.XB.firstChild; if(!this.NoVScroll) this.SetScrollTop(0); }
   this.Clear(0,S);
   
   if(p && p.State==2 && !this.FastPages) p.State = 4;
   ME.Paging;
   }
else {
   MS.Sync;
   if(!scroll && this.Sync["vert"]&&!this.NoVScroll) for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId&&G.BodyMain && G.Sync["vert"]){
         var p = G.GetScrollTop();
         if(p){
            var ds = (G.GetBodyScrollHeight()-G.GetBodyHeight())/(this.GetBodyScrollHeight()-this.GetBodyHeight());
            if(ds) { this.NoSync = 1; this.SetScrollTop(Math.round(p/ds)); this.NoSync = 0; scroll = 1; break; }
            }
         }
      }
   ME.Sync;
   if(!scroll && !this.NoVScroll) this.SetScrollTop(0);
   this.Clear(0,S);
   }

this.UpdateAllLevelImg(false);

var SS = this.GetSS();
this.GetBodyHTML(SS);
for(var v=this.FirstSec;v<=this.LastSec;v++) this.BodySec[v].innerHTML = SS[v] ? SS[v].join("") : "<div style='width:"+this.ColNames[v].Width+"px;'></div>";

this.UpdatePages();
this.UpdateEmptyRows();
this.UpdateHeights(0,1);
this.HideMessage();
if(fr){
   if(!fr.Visible&&!fr.Page) this.Focus(); 
   else if(!scroll && !fr.Fixed) this.ScrollIntoView(fr,this.FCol,this.FPagePos);
   }
MS.Pager; if(this.Paging) this.UpdatePager(); ME.Pager;
this.UpdateCursors();
this.ReColor();
this.Update();
if(this.ShowPrintPageBreaks>0&&this.CallUpdatePrintPageBreaks<2) this.CallUpdatePrintPageBreaks = 2;
this.FocusFocused();

MS.Debug; this.Debug(4,"TreeGrid updated in ",this.EndTimer("RenderBody")," ms"); ME.Debug;
}
// -----------------------------------------------------------------------------------------------------------
TGP.RerenderBody = function(txt,scroll){
this.ShowMessage(txt?txt:this.GetText("UpdateGrid"));
var T = this; setTimeout(function(){ T.RenderBody(scroll);},10);
}
// -----------------------------------------------------------------------------------------------------------
TGP.RefreshSection = function(vsec,sec){
if(!this.BodySec) return;
MS.Animate; this.FinishAnimations(); ME.Animate;

this.FirstSecRef = this.FirstSec; this.LastSecRef = this.LastSec; this.FirstSec = sec; this.LastSec = sec;
var cp = this.ColPaging; this.ColPaging = 2;
var SS = []; SS[sec] = [];
this.RenderingSection = 1;
if(vsec==0 && this.HeadSec[sec]) { this.GetPageHTML(this.XH,SS); this.HeadSec[sec].innerHTML = SS[sec].join(""); this.UpdateFixed(this.XH,this.HeadSec); }
else if(vsec==1 && this.BodySec[sec]) { 
   for(var row=this.XB.firstChild;row;row=row.nextSibling){
      var r = row["r"+sec]; if(!r || row.State!=4) continue;
      SS[sec] = []; this.GetPageHTML(row,SS); r.innerHTML = SS[sec].join(""); this.UpdatePage(row);
      }
   
   }
else if(vsec==2 && this.FootSec[sec]) { this.GetPageHTML(this.XF,SS); this.FootSec[sec].innerHTML = SS[sec].join(""); this.UpdateFixed(this.XF,this.FootSec); }
this.FirstSec = this.FirstSecRef; this.LastSec = this.LastSecRef; this.ColPaging = cp;
this.RenderingSection = null;
this.UpdateHeights(-1); 
this.NoUpdateHeights = null; 
if(this.ShowPrintPageBreaks>0&&this.CallUpdatePrintPageBreaks<2) this.CallUpdatePrintPageBreaks = 2;
}

// -----------------------------------------------------------------------------------------------------------
MS.Paging$Tree;
TGP.ShowPageMessage = function(row,txt){
MS.Message;
if(this.SuppressMessage>=3 || !row.Page&&!row.Hasch) return;
var scr = this.GetScrollLeft(1);
for(var i=1;i<this.ColNames.length-1;i++){
   var r = row["r"+i]; if(!r) continue;
   if(!row.Page) r = this.ReversedTree ? r.previousSibling.firstChild.firstChild : r.nextSibling.firstChild.firstChild;
   if(this.ColNames[i].Width>scr+100) break;
   scr -= this.ColNames[i].Width;
   }
if(r && r.firstChild && r.firstChild.className == this.Img.Style+"ChildPart"+(this.DynamicBorder?"Border":"")) r = r.firstChild;  
if(r) ShowMessageCenter(this.GetText(txt),r,this.Img.Style+"PageMessage",this.GetBodyHeight(),this.PageMessageWidth,scr);
ME.Message;
}
ME.Paging$Tree;
// -----------------------------------------------------------------------------------------------------------

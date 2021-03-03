// -----------------------------------------------------------------------------------------------------------
// Functions for creating print report HTML
// -----------------------------------------------------------------------------------------------------------
MS.Print;
// -----------------------------------------------------------------------------------------------------------
TGP.CanPrintPage = function(cols,all){
return (!this.PrintFromPage||this.PrintFromPage<=(cols.pos-(all?0:1))*cols.rcnt+(all?0:cols.rpos)) && (!this.PrintToPage||this.PrintToPage>=(cols.pos-1)*cols.rcnt+(all?1:cols.rpos));
}
// -----------------------------------------------------------------------------------------------------------
// Returns HTML of whole grid for printing
TGP.GetPrintable = function(func,cols){

MS.Paging;
if(this.PrintLoad && (this.Paging==3||this.ChildPaging==3) && ((!func || this.Source.Page.Sync || this.PrintLoad==3) && (!this.PrintSelected||!this.PrintSelectedRows || this.PrintLoad>=2)) && !this.DownloadAllPagesSync(this.PrintExpanded,this.PrintFiltered,1)) { 
   if(func) func(null);
   return null;
   }
ME.Paging;

this.Printing = 1; this.PrintingCheckboxes = this.PrintCheckboxes; 
this.PrintNoIcons = this.PrintIcons==-1 ? 2 : this.PrintIcons=="0";
this.FRowZal = this.FRow; this.FRow = null;
this.NoTreeLinesZal = this.NoTreeLines; if(this.NoPrintTreeLines||this.NoPrintTreeLines=="0") this.NoTreeLines = this.NoPrintTreeLines==2?(BSafari?1:0):this.NoPrintTreeLines;
this.HideRootTreeZal = this.HideRootTree; if(this.PrintSelected&&this.PrintSelectedRows) this.HideRootTree = 1;
if(this.ShowPrintPageBreaks>0) this.UpdatePrintPageBreaks(1);

if(this.PrintFiltered) { 
   function UpdateLevel(row,lev){ for(var r=row.firstChild;r;r=r.nextSibling) { r.Level = lev; UpdateLevel(r,lev+1); } }
   UpdateLevel(this.XB,-1);
   this.CalculateNoFilter();
   }



cols = this.GetPrintCols(cols,this.PrintPageWidth,this.PrintPageHeight,0,0,this.PrintSelected,this.PrintOnlyData);
cols.pos = 0; 
cols.rcnt = this.PrintFromPage || this.PrintToPage || this.PrintVarHeight || this.PrintPageHeight&&(this.PrintPagePrefix&&this.PrintPagePrefix.search(/\%4|\%5|\%6/)>=0||this.PrintPagePostfix&&this.PrintPagePostfix.search(/\%4|\%5|\%6/)>=0) ? this.CalcPrintRowCount(cols,this.PrintExpanded,this.PrintFiltered,this.PrintPageBreaks?this.PrintRows:0,this.PrintPageRoot,this.PrintSelected,this.PrintOnlyData) : 1;


var A = [], cnt = this.PrintCount; if(!cnt) for(var r=this.XB.firstChild,cnt=0;r;r=r.nextSibling) cnt += this.GetPrintCount(r);
return this.GetPrintableBody(A,func,cols,null,cnt*cols.length,0,0,null,this.AutoPages?this.GetLastDataRow(this.PrintOnlyData?1696:1184):null);
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetPrintableBody = function(A,func,cols,row,cnt,pos,pag,prg,lrow,w){
if(this.CancelProgress){ 
   this.GetPrintableFinish();
   this.HideMessage(); this.CancelProgress = 0; 
   if(w) { if(Try){ w.close(); } else if(Catch){ } }
   return; 
   }

var T = this, reloadindex = this.ReloadIndex;

function PageLoaded(result,page){
   if(!T.PrintCount) cnt -= page.Count; 
   T.PageLoaded(result,page,reloadindex); 
   if(result>=0 && !T.PrintCount) cnt += T.GetPrintCount(page);
   if(result>=0) page.State = 2; 
   else page.PrintError = 1;
   T.GetPrintableBody(A,func,cols,row,cnt,pos,pag,prg,lrow); 
   }

if(!row){
   row = this.GetFirstPrint(PageLoaded); if(row===false) return; 
   pag = 0; prg = 0;
   cols.hp = 3; 
   cols.hh = 0;
   cols.rpos = 1;
   cols.pos++;
   A.LastLength = 0;
   this.PrintPageFR = row; 

   var canpage = this.CanPrintPage(cols,1); 
   if(cols.lpos!=null){
      var CC = cols[cols.lpos];
      for(var i=0;i<CC.length;i++) this.Cols[CC[i]].Visible = 0;
      }
   cols.lpos = cols.pos-1;
   var CW = cols.widths[cols.lpos], CC = cols[cols.lpos]; cols.wb = cols.wf;
   for(var i=0;i<CC.length;i++) { 
      var C = this.Cols[CC[i]]; 
      C.Visible = 1; 
      if(CW[i]){
         if(C.Type=="Gantt"){
            
            }
         else C.Width = CW[i];
         }
      else if(C.Type=="Gantt" && C.GanttPaging && !C.GanttChartPrint) {
         
         }
      cols.wb += C.Width; 
      }
   this.PrintHPage = cols.pos; this.PrintHPageCount = cols.length;

   if(this.CanPrintPage(cols)){

      this.PrintHeadHTML(A,0,cols.wb,cols.pos,1,cols.length,cols.rcnt);
      
      MS.ReversedTree;
      if(row && this.ReversedTree && (!this.PrintSelected || !this.PrintSelectedRows)) {
         for(var r=row.parentNode,RR=[];r&&!r.Page;r=r.parentNode) RR[RR.length] = r;
         for(var i=RR.length-1;i>=0;i--) this.PrintWidthsHTML(RR[i],A,1);
         }
      ME.ReversedTree;
      }
   }

A.LastRow = null;
var block = 0, bh = 0, bpag = 0, ba = A.length;
while(row){
   var n = this.GetNextPrint(row,PageLoaded); if(n===false) return;
   if(this.PrintRows && prg>=this.PrintRows && !this.Print && func) {
      this.ShowProgress(this.GetText("PrintProgressCaption"),this.GetText("PrintProgressText"),this.GetText("PrintProgressCancel"),pos,cnt,w);
      var T = this; setTimeout(function(){ T.GetPrintableBody(A,func,cols,row,cnt,pos,pag,0,lrow,w); },10);
      if(!w && this.PrintWindowOpen && this.PrintLocation<=1 && (this.PrintWindowOpen==1 || this.PrintWindowOpen==2 && (BMozilla || BSafari&&!BChrome))){ 
         
         w = this.PrintLocation==0 ? window.open("","TreeGridPrint",this["PrintWindowProp"],false) : window.open("","TreeGridPrint");
         if(!w){
            T.Alert("ErrPrintOpen");
            return;
            }
         }
      if(w) { w.document.write(T.GetText("Print")+this.GetText("PrintProgressText").replace('%d',pos).replace('%d',cnt)); w.document.close(); }
      return;
      }
   var nobr = row.NoPageBreak; if(nobr==null) nobr = row.Def.NoPageBreak;
   if((!this.PrintPageRoot || (!A.LastRow || A.LastRow.Level >= row.Level) && (row.previousSibling||!row.Level)) && !nobr && pag && pag>=this.PrintPageRootMin) { 
      A.LastLength = A.length; A.LastRow = row;
      }
   if(row.Block) {
      if(block>0) { if(row.Block > block) block = row.Block; }
      else block = row.Block;
      }
   var nl = 0, h = 0;
   if(this.PrintPageHeight){
      h = this.GetPrintRowHeight(row);
      
      cols.hh += h;
//      var D = document.createElement("div"); D.innerHTML = row.id+";"+row.PrintCalcHeight+";"+row.PrintHeight+";"+row.Def.PrintHeight+";"+(row.r1?row.r1.offsetHeight:null)+";"+cols.hh+";"+h; document.body.appendChild(D);
      if(cols.hh>cols.heights[cols.hp]){
         if(cols.hp==3) cols.hp = 1;      
         else if(cols.hp==2) cols.hp = 0; 
         if(cols.hh>cols.heights[cols.hp]) { nl = 1; cols.hh -= h; }
         }
      }
   if(nl || this.PrintRows && this.PrintPageBreaks && pag>=this.PrintRows) {
      if(A.LastRow && row!=A.LastRow){
         row = A.LastRow;
         A.length = A.LastLength;
         n = this.GetNextPrint(row,PageLoaded);
         if(this.PrintPageHeight) h = this.GetPrintRowHeight(row);
         }
      A.LastRow = null;
      A.LastLength = 0;
      if(bh&&h+bh==cols.hh || this.PrintSplitRowSpan) {  
         this.PrintPageBreakHTML(A,cols,row);
         this.PrintPageFR = row;
         cols.hh = h; bh = 0; 
         } 
      else { 
         if(bh) { var AA = A.splice(ba,A.length-ba); }
         this.PrintPageBreakHTML(A,cols,row);
         if(bh){ for(var i=0;i<AA.length;i++) A[A.length] = AA[i]; }
         cols.hh = h+bh; 
         }  
      cols.hp = 2; 
      pag = 0;
      }
   pos++; pag++; prg++;
   if(this.CanPrintPage(cols)){
      if(!row.Expanded && T.PrintExpanded && Is(row,"CanExpand")) {
         row.Expanded = 1;
         this.PrintRowHTML(row,A); 
         row.Expanded = 0;
         }
      else this.PrintRowHTML(row,A);
      if(!this.PrintSelected || !this.PrintSelectedRows){
         if(n && n.Level>row.Level) { 
            if(this.ReversedTree){
               MS.ReversedTree;
               for(var r=n.parentNode,RR=[];r&&r.Level>=row.Level;r=r.parentNode) RR[RR.length] = r;
               for(var i=RR.length-1;i>=0;i--) this.PrintWidthsHTML(RR[i],A,1);
               ME.ReversedTree;
               }
            else this.PrintWidthsHTML(row,A,1); 
            }
         else if(!n || n.Level<row.Level) for(var i=n?n.Level:0;i<row.Level;i++) A[A.length] = CTableEnd + "</td></tr>"; 
         }
      }
   if(--block>0) { bh += h; pag--; bpag++; }
   else { bh = 0; ba = A.length; pag += bpag; bpag = 0; }
   if(row==lrow) break;
   row = n;
   }

if(this.PrintPageHeight && (cols.hp==1||cols.hp==0) && this.HasFoot(cols.pos,1)) {
   this.PrintPageBreakHTML(A,cols,null);
   this.PrintPageFR = this.XF.firstChild; 
   }

if(this.GetFirstVisible() && this.CanPrintPage(cols,1)) {
   A[A.length] = CTableEnd;
   
   A[A.length] = "</div></td></tr>"; 
   }

if(this.CanPrintPage(cols)) this.PrintFootHTML(A,0,cols.wb,cols.pos,cols.rpos,cols.length,cols.rcnt,cols.heights[cols.hp]-cols.hh);

if(cols.pos<cols.length) {
   
   return this.GetPrintableBody(A,func,cols,null,cnt,pos,0,null,lrow);
   }

this.PrintFitHeight = cols.rpos>1 ? this.PrintPageHeight : cols.hh + this.PrintPageHeight - cols.heights[3];
this.PrintFitWidth = cols.pos>1 ? this.PrintPageWidth : cols.wb + this.Img.TableAllWidth + this.PrintPaddingWidth;

this.PrintPageFR = null; 
this.GetPrintableFinish();
if(func){ this.HideMessage(); func(A.join(""),w); }
else return A.join("");     
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetPrintableFinish = function(){
if(this.Print) return;
for(var c in this.Cols) { var C = this.Cols[c]; C.Visible = C.ZalPrint==1; C.Hidden = C.ZalPrint==2; C.Width = C.ZalPrintWidth; }
this.FRow = this.FRowZal;
this.NoTreeLines = this.NoTreeLinesZal; this.HideRootTree = this.HideRootTreeZal;
this.Printing = 0; this.PrintingCheckboxes = 0; this.PrintNoIcons = 0;
this.ClearPrintNestedGrids();

var C = this.Cols["_ConstWidth"];
if(C && C.PrintAdded){
   if(C.PrintAdded<0) this.DelCol("_ConstWidth");
   else { C.Width = C.PrintAdded; C.PrintAdded = null; }
   }
if(this.PrintFiltered) this.Calculate();
var styl = this.Style, css = this.CSS;
this.ApplyMedia(1);
if(styl!=this.Style||css!=this.CSS) this.SetStyle(null,null,null,null,null,0,1,1,1);
if(this.ShowPrintPageBreaks>0&&this.CallUpdatePrintPageBreaks<2) this.CallUpdatePrintPageBreaks = 2;
}
// -----------------------------------------------------------------------------------------------------------
ME.Print;

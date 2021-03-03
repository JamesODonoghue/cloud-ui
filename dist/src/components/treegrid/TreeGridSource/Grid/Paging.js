// -----------------------------------------------------------------------------------------------------------
// Functions for paging
// -----------------------------------------------------------------------------------------------------------
MS.Paging;
// -----------------------------------------------------------------------------------------------------------
// Returns page according to index
TGP.GetPage = function(num){
return GetNode(this.XB,num);
}
// -----------------------------------------------------------------------------------------------------------
// Returns page number
TGP.GetPageNum = function(row){
for(var r=this.XB.firstChild,num=0;r;r=r.nextSibling,num++) if(r==row) return num;
return 0; 
}
// -----------------------------------------------------------------------------------------------------------
// Creates pages and places rows to the pages by this.PageLength
TGP.CreatePages = function(){
var cnt = this.Paging ? this.PageLength : 1e10, firstbody = this.AddBody(), body = firstbody, B = this.XB.firstChild, block = 0;
var BM = B ? B.MasterRow : null;
if(BM) body.MasterRow = BM;
while(B && B!=firstbody){
   var r = B.firstChild;
   while(r){
      if(r.Visible){
         if(cnt<=0 && block<=0) {
            cnt = this.PageLength;
            body = this.AddBody();
            if(BM) body.MasterRow = BM;
            }
         cnt--;
         }   
      if(r.Block && r.Block > block) block = r.Block;
      block--;   
      var n = r.nextSibling;
      body.appendChild(r);
      r = n;
      }
   var N = B.nextSibling;
   this.XB.removeChild(B);
   B = N;
   }
if(this.FRow) this.FPage = this.GetPageNum(this.GetRowPage(this.FRow));
else if(this.FPage >= this.XB.childNodes.length) this.FPage = 0;
this.FPageScroll = null;
if(this.SetPageNames) this.SetPageNames();
}
// -----------------------------------------------------------------------------------------------------------
// Deletes all page except the first and moves all rows to the first page
TGP.RemovePages = function(){
var XB = this.XB, X = XB.firstChild;
for(var B=X.nextSibling;B;B=X.nextSibling){
   for(var r=B.firstChild;r;r=B.firstChild) X.appendChild(r);
   XB.removeChild(B);
   }
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Called when vertical scrollbar changes
TGP.ShowPages = function(){
if(this.Rendering || this.Loading || this.Disabled) return;
if(this.Paging==1 && this.AllPages){
   for(var r=this.XB.firstChild,pos=0;r&&r.State==4;r=r.nextSibling,pos++);
   if(r && !this.InPaging){
      if(this.MaxHeight) {
         UpdateAreas();
         this.ApplyMedia();
         }
      this.InPaging = 1;
      MS.Debug; this.StartTimer("RenderPages"); this.Debug(4,"Rendering pages"); ME.Debug;
      var cap = this.GetText("RenderProgressCaptionRows"), txt = this.GetText("RenderProgressText"), btn = this.GetText("RenderProgressCancel");
      var T = this, cnt = this.XB.childNodes.length;
      function render(){
         if(T.CancelProgress){
            MS.Debug; T.Debug(4,"Rendering pages canceled, rendered ",pos," pages in ",T.EndTimer("RenderPages")," ms, the rest of pages will be rendered on demand"); ME.Debug;
            T.HideMessage();
            T.CancelProgress = 0;
            if(T.Paging==1) T.Paging = 2;
            if(T.ChildParts==1) T.ChildParts = 2;
            if(T.ColPaging==1) T.ColPaging = 2;
            T.InPaging = null;
            T.CalculateSpaces(1);
            T.ShowPages();
            MS.ColPaging; if(T.ColPaging) T.ShowColPages(); ME.ColPaging; 
            
            return;
            }
         
         T.Rendering = 1;
         T.RenderPage(r);
         T.Rendering = 0;
         for(r=r.nextSibling,pos++;r&&r.State==4;r=r.nextSibling,pos++);
         if(r) {
            T.ShowProgress(cap,txt,btn,pos,cnt);
            setTimeout(render,10);
            }
         else {
            T.Update();
            MS.Debug; T.Debug(4,"TreeGrid pages rendered in ",T.EndTimer("RenderPages")," ms"); ME.Debug;
            T.HideMessage();   
            T.InPaging = null;
            T.ShowPages();
            MS.ColPaging; if(T.ColPaging) T.ShowColPages(); ME.ColPaging; 
            
            }
         T.NoUpdateHeights = new Date()-0;
         }
      this.ShowProgress(cap,txt,btn,pos,cnt);   
      setTimeout(render,10);
      }
   }
else if(this.Paging) {
   var A = this.GetShowedPages();
   for(var i=0;i<A.length-1;i+=2){
      var p = GetNode(this.XB,A[i]);
      if(p && (p.State==0 || p.State==2)){
         p.State++;
         this.StartPage(p);
         }
      }
   }
MS.ChildParts;   
if(this.ChildParts==1){
   if(!this.InPaging){
      var A = [], next = this.ReversedTree ? "previousSibling" : "nextSibling";
      function fill(row){
         for(var r=row.firstChild;r;r=r.nextSibling) {
            if(r.Hasch!=4 || !r.Expanded) continue;
            var cp = (r.r1?r.r1[next]:r.rch1).firstChild.firstChild;
            for(var i=0,p=cp.firstChild;p;i++,p=p.nextSibling){
               if((!p.firstChild || p.firstChild.nodeType!=1) && p.offsetHeight>=5){ A[A.length] =  r; A[A.length] =  i; } 
               }
            if(r.firstChild) fill(r);
            } 
         }
      for(var r=this.XB.firstChild;r;r=r.nextSibling) if(r.State==4) fill(r);
      if(A.length){
         this.InPaging = 1;
         MS.Debug; this.StartTimer("RenderChildParts"); this.Debug(4,"Rendering child parts"); ME.Debug;
         var cap = this.GetText("RenderProgressCaptionChildren"), txt = this.GetText("RenderProgressText"), btn = this.GetText("RenderProgressCancel");
         var T = this, pos = 0, cnt = A.length/2;
         function renderch(){
            if(T.CancelProgress){
               MS.Debug; T.Debug(4,"Rendering child parts canceled, rendered ",pos," child parts in ",T.EndTimer("RenderChildParts")," ms, the rest of child parts will be rendered on demand"); ME.Debug;
               T.HideMessage();
               T.CancelProgress = 0;
               if(T.Paging==1) T.Paging = 2;
               if(T.ChildParts==1) T.ChildParts = 2;
               if(T.ColPaging==1) T.ColPaging = 2;
               T.InPaging = null;
               T.CalculateSpaces(1);
               T.ShowPages();
               MS.ColPaging; if(T.ColPaging) T.ShowColPages(); ME.ColPaging; 
               
               return;
               }
            
            T.RenderChildPart(A[pos*2],A[pos*2+1]);
            pos++;
            if(pos<cnt) {
               T.ShowProgress(cap,txt,btn,pos,cnt);
               setTimeout(renderch,10);
               }
            else {
               MS.Debug; T.Debug(4,"TreeGrid child parts rendered in ",T.EndTimer("RenderChildParts")," ms"); ME.Debug;
               T.HideMessage();   
               T.InPaging = null;
               T.ShowPages();
               MS.ColPaging; if(T.ColPaging) T.ShowColPages(); ME.ColPaging; 
               
               }
            }
         this.ShowProgress(cap,txt,btn,pos,cnt);   
         setTimeout(renderch,10);
         }
      }
   }
else if(this.ChildParts){
   var A = this.GetShowedChildParts();
   for(var i=0;i<A.length;i+=2){
      
      if(A[i].State<2){
         if(A[i].State==0){
            A[i].State = 1;
            
            this.DownloadChildren(A[i],1);
            }
         continue;            
         }
      else if(A[i].State==3) continue; 
      var chn = A[i].id+":"+A[i+1];
      if(this.ChildPartsTmp[chn]) continue;
      this.ChildPartsTmp[chn] = 1;
      
      //[i]["CHP"+A[i+1]] = 1;
      var idx = this.PagesTmp.length;
      this.PagesTmp[idx] = A[i];
      
      var F = new Function("p","setTimeout(function(){if("+this.This+")"+this.This+".StartChildPart("+idx+","+A[i+1]+","+this.ReloadIndex+");},10);");
      F(p);
      }
   }   
ME.ChildParts;   
}
// -----------------------------------------------------------------------------------------------------------
// Prepares page loading / rendering
MS.ChildParts;
TGP.StartChildPart = function(pos,num,reloadindex){
var row = this.PagesTmp[pos]; delete this.PagesTmp[pos]; if(!row) return;

delete this.ChildPartsTmp[row.id+":"+num];
if(this.Loading || reloadindex!=null && this.ReloadIndex!=reloadindex || !this.IsChildPartShowed(row,num)) return;
this.RenderChildPart(row,num);
}
ME.ChildParts;
// -----------------------------------------------------------------------------------------------------------
// Prepares page loading / rendering
TGP.StartPage = function(row,always,reloadindex){
if(this.Loading || reloadindex!=null && this.ReloadIndex!=reloadindex || !always && !this.IsPageShowed(row)){
   if(row.State&1) row.State--;
   return; 
   }
if(row.State==4) return; 
if(row.NoPage && this.AllPages) this.CreatePage(row);
var idx = this.PagesTmp.length;
if(row.State==1){
   row = this.UpdateTagName(row);
   this.PagesTmp[idx] = row;
   this.ShowPageMessage(row,"LoadPage");
   var T = this; this.DownloadPage(row,function(result){ T.PageLoaded(result,idx,reloadindex); });
   }
else {
   this.PagesTmp[idx] = row;
   this.ShowPageMessage(row,"RenderPage");
   var T = this; setTimeout(function(){ T.RenderPage(idx,reloadindex);},10);
   }
}
// -----------------------------------------------------------------------------------------------------------
// For API only, loads given page or page chidlren and optionally renderers them
TGP.LoadPage = function(row,render,func){
if(!row||row.State-0) return false;
if(!row.Page) { 
   this.DownloadChildren(row,render?0:-1,0,func); 
   return true; 
   }
if(row.NoPage && this.AllPages) this.CreatePage(row);
row = this.UpdateTagName(row);
row.State = 1;
var idx = this.PagesTmp.length;
this.PagesTmp[idx] = row;
var T = this; 
this.DownloadPage(row,function(result){ 
   T.PageLoaded(result,idx); 
   if(render) T.RenderPage(row);
   if(func) func(result); 
   });
}
// -----------------------------------------------------------------------------------------------------------
// Called after page is loaded
TGP.PageLoaded = function(result,row,reloadindex){
if(typeof(row)=="number"){ var idx = row; row = this.PagesTmp[idx]; delete this.PagesTmp[idx]; }
if(this.Loading || reloadindex!=null && this.ReloadIndex!=reloadindex) return;
if(result<0){ 
   row.State = 0;
   MS.Debug; this.Debug(1,"Failed downloading ",row.Page?"page "+this.GetPageNum(row):"children "+row.id," from ",this.DebugDataGetName(this.Source.Page)); ME.Debug;
   MS.Message; if(row.tagName=="B" && this.SuppressMessage<4) ShowMessageCenter(this.GetText("PageErr"),this.GetRow(row,1),this.Img.Style+"PageMessage",this.GetBodyHeight()); ME.Message;
   }
else {
   MS.Debug; this.StartTimer("PageUpdate"); ME.Debug;
   this.CreateTree(row);
   this.UpdatePageValues(row);
   if(this.AllSelected) {
      if(this.SelectAllType&8) this.SelectAllRowsT(1,row);
      else if(this.SelectAllType&2) this.SetAllSelected(0,1);
      }
   MS.RowSpan; for(var col in this.SpanCols) this.CreateRowSpan(row,col); ME.RowSpan;
   MS.CPages;
   if(row.Page) this.CreateAllCPages(row);
   else if(!this.Sorting || !this.SortChildren || !this.SortChildren(row)) this.CreateCPages(row);
   ME.CPages;
   if(this.ChildPaging && this.ChildPageLength) {
      for(var r=row.firstChild;r;r=r.nextSibling) this.CreateSPages(r);
      }
   if(this.HasLevelButtons) this.UpdateChildrenLevelImg(row,1);
   
   MS.Debug; this.StopTimer("PageUpdate"); this.StartTimer("PageColor"); ME.Debug;
   this.ExpandAndSelect(row);
   this.ReColor();
   
   MS.Debug; this.StopTimer("PageColor"); this.StartTimer("PageTree"); ME.Debug;
   MS.Tree;
   if(!this.AllPages && row.Page){
      MS.Group; if(this.OnePage&4 && this.Group) {
         if(this.GroupRestoreSort && this.SortGroup==null) this.SortGroup = this.Sort;
         this.GroupAll(1); 
         this.Calculate(0,1);
         }
      ME.Group;
      MS.Filter; if(this.OnePage&2) this.UpdateGridFilter(); ME.Filter;
      if(this.OnePage&1) this.SortChildren(row);
      }
   row.Count = null; 
   MS.Filter;
   if(!row.Page) { 
      if(this.Filtering && this.Filtered && (this.Filter1||this.Filter2||this.Filter3||Grids.OnRowFilter)) this.FilterChildren(row,0);
      if(!this.HasChildren(row)) { this.UpdateLevelImg(row,1); this.DeleteChildren(row); }
      }
   ME.Filter;      
   if(this.MainCol){
      var T = this;
      function UpdateLevelImg(row){
         for(var r=row.firstChild;r;r=r.nextSibling){
            T.UpdateLevelImg(r,0);
            if(r.firstChild) UpdateLevelImg(r);
            }
         }
      if(row.Page){ row.Level=-1; row.LevelImg = ""; }
      if(this.Expanded) this.UpdateExpanded(row);
      UpdateLevelImg(row);
      }
   this.CalcTreeWidth();
   ME.Tree;
   row.State = 3;
   
   MS.Debug; this.StopTimer("PageTree"); this.StartTimer("PageCalc"); ME.Debug;

   MS.Calc;
   
   if(!Grids.OnCalculate || !Grids.OnCalculate(this,0,row)){ 
      var P = this.GetCalc();
      for(var r=row.firstChild;r;r=r.nextSibling) this.CalcRow(r,P,"CalcOrder",1);
      
      }
   ME.Calc;
   MS.Debug; this.StopTimer("PageCalc"); ME.Debug;

   

   if(row.MasterRow) this.MasterGrid.CopyMasterData(this,row,row.MasterRow);

   if(Grids.OnPageReady) Grids.OnPageReady(this,row);
      
   if(row.Page && !this.Print && !this.Printing) { 
      if(row.Page&&this.Alternate&&this.AlternateType&2) this.ReColor();
      if(row.firstChild || this.XB.childNodes.length==1) this.StartPage(row);
      else if(this.XB.childNodes.length>1) { 
         MS.Debug; this.Debug(2,"No rows returned for page ",row.Pos,", page is deleted."); ME.Debug;
         this.DelBody(row);
         if(this.UpdatePager) this.UpdatePager();
         this.Update();
         }
      if(this.XB.childNodes.length==1) this.UpdateEmptyRows();
      }
   else if(row.Deleted) for(var r=this.GetNext(row);r&&row.Level<r.Level;r=this.GetNext(r)) if(!r.Deleted) r.Deleted = 2;
   
   MS.Debug; 
   if(this.DebugFlags["page"]) {
      var tim = this.StopTimer("Page"+(row.Page?row.Pos:row.id)), upd = this.GetTimer("PageUpdate"), calc = this.GetTimer("PageCalc"), color = this.GetTimer("PageColor"), tree = this.GetTimer("PageTree");
      this.Debug(3,"Downloaded ",row.Page?"page "+row.Pos:"children "+row.id," in ",tim," ms (loading: ",tim-upd-calc-color-tree," ms, update: ",upd," ms, color: ",color," ms, update tree: ",tree," ms, calculate: ",calc," ms)");
      }
   ME.Debug;
      
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.CreatePage = function(row){
var h1 = 0, h2 = 0, cnt=0, cs = this.Img.Style,pld = this.PageLengthDiv;
for(var p=row.r1.First;p!=row;p=p.nextSibling){ h1+=p.Height/pld; cnt++; }
if(row!=row.r1.Last) {
   for(var p=row.nextSibling;;p=p.nextSibling){ 
      h2+=p.Height/pld;
      if(p==row.r1.Last) break;
      }
   }

var rt = pld>1 ? this.GetScrollRow() : null;

var db = this.DynamicBorder ? "Border" : "";
function Create(){
   var d = document.createElement("div");
   d.style.overflow = "hidden";
   d.style.height = h+"px";
   d.className = cs+"Page"+db;
   return d;
   }

var h = row.Height;
row.NoPage = null;
if(h1==0){ 
   if(h2==0) { row.r1.First = null; row.r1.Last = null; row.r1.Count = null; return; } 
   row.r1.First = row.nextSibling;
   row.r1.Count--;
   var first = row.previousSibling ? 0 : 1;
   for(var c=this.FirstSec;c<=this.LastSec;c++){ 
      var r = row["r"+c]; if(!r) continue;
      var d = Create();
      if(first) d.className = cs+"PageFirst"+db;
      r.style.height = h2+"px";
      r.parentNode.insertBefore(d,r);
      row["r"+c] = d;
      d.row = row;
      }
   }
else if(h2==0){ 
   row.r1.Last = row.previousSibling;
   row.r1.Count--;
   for(var c=this.FirstSec;c<=this.LastSec;c++){ 
      var r = row["r"+c]; if(!r) continue; 
      var d = Create();
      r.style.height = h1+"px";
      if(r.nextSibling) r.parentNode.insertBefore(d,r.nextSibling);
      else r.parentNode.appendChild(d);
      row["r"+c] = d;
      d.row = row;
      }
   }
else { 
   var fr = row.r1.First;
   row.r1.First = row.nextSibling;
   row.r1.Count = row.r1.Count-cnt-1;
   for(var c=this.FirstSec;c<=this.LastSec;c++){ 
      var rc = "r"+c, r = row[rc];  if(!r) continue;
      var d = Create();
      r.style.height = h2+"px";
      var rx = Create();
      rx.style.height = h1+"px";
      r.parentNode.insertBefore(rx,r);
      r.parentNode.insertBefore(d,r);
      row[rc] = d;
      d.row = row;
      if(c==1) { 
         rx.First = fr;
         rx.Last = row.previousSibling;      
         rx.Count = cnt;
         }
      
      for(var f=fr,ps=row.previousSibling;f!=ps;f=f.nextSibling) f[rc] = rx;
      ps[rc]=rx;
      }
   }
if(rt&&!this.ReversedTree) this.SetScrollRow(rt);
}

// -----------------------------------------------------------------------------------------------------------
// Displays or scrolls to given page, given by number, from 1 !
TGP.GoToPageNum = function(num){
var row = GetNode(this.XB,num-1);
if(row) this.GoToPage(row);
}
// -----------------------------------------------------------------------------------------------------------
// Displays or scrolls to given page
TGP.GoToPage = function(row){
if(Grids.OnGoToPage && Grids.OnGoToPage(this,row,this.GetPageNum(row))) return;
var fix = this.FRow && this.FRow.Fixed;
if(!fix){
   var pos = this.FPagePos;
   if(pos==null && this.FRow && !this.FRow.Fixed) pos = this.GetPagePos(this.FRow);
   if(pos==null) pos = 0;
   }
if(this.AllPages){
   if(row.NoPage) { this.CreatePage(row); this.ScrollIntoView(row,fix?null:this.FCol); this.Update(); }
   else this.ScrollIntoView(row,fix?null:this.FCol); 
   if(!fix) this.Focus(row,this.FCol,pos,null,2);
   
   this.UpdatePagerPos(); 
   }
else {
   var n = this.FPage, r = GetNode(this.XB,n);
   if(r==row) return;
   r.State = 2;
   
   if(row.State==null) row.State = 2;
   this.FPage = this.GetPageNum(row);
   if(!fix) {
      this.FRow = null;
      row = this.UpdateTagName(row); 
      }
   if(this.Paging==3 && this.RemoveUnusedPages==3 && this.RemovePage(r,0) && Grids.OnRemovePage) Grids.OnRemovePage(this,r);
   this.RenderBody();
   if(!fix) this.Focus(row,this.FCol,pos,null,2);
   
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionRepaint = function(dummy,T){ if(!T) this.RenderBody(); return true; }
// -----------------------------------------------------------------------------------------------------------
// Sets value of property AllPages
TGP.SetAllPages = function(val){
if(!this.Paging) return;
val = !!val;
if(val){ 
   
   }
else { 
   var p = this.FRow ? this.GetRowPage(this.FRow) : null;
   if(!p){
      var A = this.GetShowedPages();
      if(A.length==3) p = A[0];
      else if(A.length==4) p =A[1] > A[3] ? A[0] : A[2];
      else p = A[2];
      }
   this.FPage = this.GetPageNum(p);
   if(this.Paging==3 && this.RemoveUnusedPages==3){
      for(var r=this.XB.firstChild;r;r=r.nextSibling){
         if(r.State>=2 && this.RemovePage(r,0) && Grids.OnRemovePage) Grids.OnRemovePage(this,r); 
         }
      }
   }
this.AllPages = val;
this.ClearChildren(this.XB);

this.ARow = null; 

}
// -----------------------------------------------------------------------------------------------------------
// Moves to next page, returns true if it was successful
TGP.GoToNextPage = function(test,scroll){
var r = this.GetFPage(scroll);
if(r) r = r.nextSibling;   
if(!r) return false;
if(test) return true;
this.GoToPage(r);
return true;
}
// -----------------------------------------------------------------------------------------------------------
// Moves to previous page, returns true if it was successful
TGP.GoToPrevPage = function(test,scroll){
var r = this.GetFPage(scroll);
if(r) r = r.previousSibling;   
if(!r) return false;
if(test) return true;
this.GoToPage(r);
return true;
}
// -----------------------------------------------------------------------------------------------------------
// Returns actual (focused) page even if AllPages = true
TGP.GetFPage = function(scroll){
if(!this.Paging || !this.BodyMain) return null;
if(!this.AllPages) return GetNode(this.XB,this.FPage);
var r = this.FRow, p;
if(r && !r.Fixed) { 
   p = this.GetRowPage(r); if(!scroll) return p; 
   if(r.r1) {
      var h = this.GetRowHeight(r);
      var scr = this.GetScrollTop(1);
      var top = this.GetRowTop(r);
      if(top+h/2 >= scr && top+h/2<this.GetBodyHeight()+scr) return p; 
      }
   }

if(this.FPageScroll) return this.FPageScroll;
var A = this.GetShowedPages();
this.FPageScroll = GetNode(this.XB,A[3]>A[1] ? A[2] : A[0]);
return this.FPageScroll;
}
// -----------------------------------------------------------------------------------------------------------
TGP.AddPagerPage = function(B,delfirst){
MS.Pager;
for(var i=0;i<this.Pagers.length;i++){
   var P = this.Pagers[i];
   if(P.Visible && P.Type=="Pages"){
      var D = document.createElement("div");
      D.className = (BTablet?this.Img.Style+"PagerItemTouch ":"")+this.Img.Style+"PagerItem";
      if(BIE){ D.style.width="100%"; D.style.height=this.Img.PagerItemHeight+"px"; }
      if(B.Title&&this.StandardTip) D.title = this.Lang.Format.Escape(B.Title);
      if(BIE5) D.noWrap = true;
      D.innerHTML = B.Name;
      if(delfirst) P.Pages.removeChild(P.Pages.lastChild);
      P.Pages.appendChild(D);
      }
   }
ME.Pager;
}

// -----------------------------------------------------------------------------------------------------------
TGP.AddPage = function(name,xml,count){
var B = this.AddBody(), p = B.previousSibling;
var delfirst = xml && !this.XB.firstChild.previousSibling && !this.GetFirstVisible(this.XB.firstChild);
B.Pos = p&&p.Pos!=null?p.Pos+1 : (delfirst ? 0 : this.XB.childNodes.length-1);
if(xml){
   if(xml.search(/^[^\<\{]*\{/)>=0) xml = "{Body:[{Pos:'"+B.Pos+"',Items:["+xml+"]}]}";
   else xml = "<Grid><Body><B Pos='"+B.Pos+"'>"+xml+"</B></Body></Grid>";
   this.AddDataFromSource(this.PrepareData(xml,{Row:B}),{Row:B});
   B.State = 1;
   if(!count) count = B.childNodes.length;
   }
else {
   if(!count) count = this.PageLength;
   B.Count = count;
   B.State = 0;
   }
B.Name = name ? name : this.GetText("Page")+" "+(B.Pos+1);
var he = count*this.RowHeight, h, db = this.DynamicBorder ? "Border" : "";
if(this.AllPages){
   for(var i=this.FirstSec;i<=this.LastSec;i++){
      if(p) h = p["r"+i]; 
      else h = this.GetBody(i);
      if(h) h = h.parentNode;
      if(h){
         var d = document.createElement("div");
         h.insertBefore(d,h.lastChild);
         if(he) d.style.height = he+"px";
         d.className = this.Img.Style+"Page"+(delfirst?"First":"")+db;
         B["r"+i] = d;
         }
      }
   }
if(xml) {
   this.PageLoaded(0,B);
   if(delfirst){
      var F = this.XB.firstChild;
      this.ClearPage(F);
      var f = B.firstChild;
      for(var r=F.firstChild;r;) { var n = r.nextSibling; B.insertBefore(r,f); r = n; }
      this.DelBody(F);
      this.UpdateEmptyRows();
      }
   }
var ridx = !name&&this.RowIndex&&B.firstChild;
if(!ridx) this.AddPagerPage(B,delfirst);
this.UpdatePager(1); 
if(B.firstChild && B.previousSibling) { 
   var r = B.previousSibling.lastChild; if(r) r.LevelImg = 1;
   for(;r;r=this.GetNextVisible(r)) this.UpdateIcon(r);
   }
this.LoadingPage = 1;
this.CalculateSpaces(1);
this.Update();
if(ridx){
   B.Name = this.GetText("PageRows").replace("%1",B.firstChild[this.RowIndex]).replace("%2",B.lastChild[this.RowIndex]);
   this.AddPagerPage(B,delfirst);
   p = B.previousSibling;
   if(p&&!p.previousSibling) { 
      p.Name = this.GetText("PageRows").replace("%1",p.firstChild[this.RowIndex]).replace("%2",p.lastChild[this.RowIndex]);
      this.UpdatePager();
      }
   }
MS.CustomScroll; if(this.CustomScroll) this.UpdateCustomVScroll(); ME.CustomScroll;
if(this.FRect&&this.FRect[7]){
   for(var lr=this.GetLastVisible(null,4);lr&&!this.CanFocus(lr,this.FCol);lr=this.GetPrevVisible(lr,4));
   var rect = this.FRect.slice(); rect[2] = lr;
   this.Focus(this.FRow,this.FCol,null,rect,12);
   if(this.FRect[6]&&this.SelectingFocus&4) for(var r=B.firstChild;r;r=this.GetNextVisible(r)) r.Selected = r.Selected ? r.Selected|1 : 1;
   }
this.LoadingPage = 0;
return B;
}
// -----------------------------------------------------------------------------------------------------------
TGP.DelEmptyPage = function(par,undo){
var n = par.previousSibling; if(!n || (n.State<2 && par.nextSibling)) n = par.nextSibling;
if(!n && this.AutoPages) { this.AddAutoPages(); n = par.nextSibling; }
if(!n||n.State<2) return;
this.ClearChildren(par);
if(n==par.previousSibling) for(var r=par.firstChild;r;r=par.firstChild) n.appendChild(r);
else { var f = n.firstChild; for(var r=par.firstChild;r;r=par.firstChild) n.insertBefore(r,f); }
if(undo) this.AddUndo({Type:"DelPage",Page:par,Next:par.nextSibling},2);
this.DelBody(par);
if(this.Paging!=3 && this.SetPageNames) this.SetPageNames();
if(this.UpdatePager) this.UpdatePager();
}
// -----------------------------------------------------------------------------------------------------------
TGP.ClearPage = function(row,always,fs,ls){
this.ClearChildren(row);
var h = this.GetPageHeight(row,(row.Expanded||row.Page)&&(fs==null||this.RemoveUnusedFixed))+"px";
for(var i=fs!=null?fs:this.FirstSec,li=ls!=null?ls:this.LastSec;i<=li;i++){
   var r = row["r"+i];
   if(r){ 
      if(!row.Page) r = r.nextSibling;
      r.style.overflow = "";
      r.style.height = h;
      if(!always) {
         if(row.Page) r.innerHTML = "";
         else r.firstChild.firstChild.innerHTML = "";
         }
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.AddAutoPages = function(){

MS._Debug; if(0){ ME._Debug; this.AutoPages = 0; this.AutoColPages = 0; NoModule("PagingAuto","Sheet"); MS._Debug; } ME._Debug;

}
// -----------------------------------------------------------------------------------------------------------
TGP.ClearAutoPages = function(){

}
// -----------------------------------------------------------------------------------------------------------
TGP.ReloadPage = function(row){
if(row.State<2 || row.Page && this.Paging<3 || !row.Page && this.ChildPaging<3) return;
if(this.FRow && (row.Page||row.Expanded)){
   for(var r=this.FRow;r&&r!=row;r=r.parentNode);
   if(r==row){
      if(row.Page) { this.FPagePos = this.GetPagePos(this.FRow); this.FRow = row; }
      else this.FRow = null;
      }
   }
row.Count = this.GetPageHeight(row,row.Expanded||row.Page)/this.RowHeight;
if(!row.Count) row.Count=1;
if(row.State==4) this.ClearPage(row,0);
this.ClearChildren(row,1);
if(!Dom.DataDocument) row.innerHTML = ""; 
else { row.firstChild = null; row.lastChild = null; }

row.State=1;
if(!row.Page){
   MS.Tree;
   if(!row.Expanded) row.State=0;
   else this.DownloadChildren(row);
   ME.Tree;
   }
else { 
   this.StartPage(row);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.RefreshPage = function(row,always){
if(row.State!=4) return;
this.ClearPage(row,always);
row.State=3;
if(!row.Page && !row.Expanded){
   MS.Tree;
   if(always || this.ChildPaging<2){
      this.RenderPage(row);
      this.TableCollapse(row);
      }
   else row.State=2;      
   ME.Tree;
   }
else if(always || !row.Page && row.Expanded) this.RenderPage(row);
else this.StartPage(row);
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetPageWindow = function(){
var ft = this.GetScrollTop(1), fb = ft + this.GetBodyHeight(), wa = this.PageWindowAdd;
if(wa) { ft -= wa; fb += wa; }
if(!fb) fb++; 
return [ft,fb];
}

// -----------------------------------------------------------------------------------------------------------
// Returns array of visible pages (due scroll) and % of height visible (1 - all, 0.1 - 10%)
// Returns array [0] - page number (not object, but position) [1] % of height visible, [2] - next page number, ...
// If there is only one page visible [2] is the high of overlap in front the window
TGP.GetShowedPages = function(){
if(!this.AllPages){
   var A = []; A[0] = this.FPage; A[1] = 1; A[2] = 0;
   return A;
   }
var hb, P = this.GetPageWindow(), ft = P[0], fb = P[1], A = [], p = 0, ht = 0;

var time = new Date()-0;   
for(var r=this.XB.firstChild,n=0;r;r=r.nextSibling,n++,ht=hb){
   var dh = r.r1 ? r.r1.offsetHeight : 0; 
   if(r.NoPage && r.r1){
      if(ht+dh<=ft){      
         n+=r.r1.Count-1;
         r = r.r1.Last;
         hb = ht+dh;
         continue;
         }
      dh = r.Height/this.PageLengthDiv;
      }
   hb = ht+dh;
   if(hb<=ft){ 
      continue; 
      }
   if(ht>=fb-1) break;    
   r.LastAccess = time;
   A[p++] = n;
   if(ht>ft){ 
      if(hb<=fb) A[p++] = 1; 
      else A[p++] = (fb-ht)/dh; 
      }
   else { 
      if(hb<=fb){ 
         A[p++] = (hb-ft)/dh; 
         if(!r.nextSibling) A[p++] = (ft-ht)/dh;
         }
      else { 
         A[p++] = (fb-ft)/dh; 
         A[p++] = (ft-ht)/dh;
         }
      }
   }

return A;
}
// -----------------------------------------------------------------------------------------------------------
// If given page is visible due scroll -> it will be loaded or rendered
// Return 1- yes, 0 - no, 2 - partially
TGP.IsPageShowed = function(row){
if(!this.AllPages) return row.r1!=null; 
if(this.Paging==1) return 1; 
var P = this.GetPageWindow(), ft = P[0], fb = P[1], h;

if(!row.r1) return 0; 
var y = row.r1.offsetTop;

if(row.NoPage){
   for(var r=row.r1.First;r!=row;r=r.nextSibling) y+=r.Height/this.PageLengthDiv;
   h = row.Height/this.PageLengthDiv;
   }
else h = this.GetPageHeight(row,false);

if(y < ft) return y+h>ft ? 2 : 0;
if(y > fb-h) return y > fb ? 0 : 2;
return 1;
}
// -----------------------------------------------------------------------------------------------------------
MS.ChildParts;
TGP.GetShowedChildParts = function(parents){
var P = this.GetPageWindow(), ft = P[0], fb = P[1], A = [];

for(var b=this.XB.firstChild;b;b=b.nextSibling) if(b.r1 && b.State==4 && b.r1.offsetTop+b.r1.offsetHeight > ft) break;
if(!b || b.r1.offsetTop > fb) return []; 
var time = new Date()-0, rev = this.ReversedTree, next = rev ? "previousSibling" : "nextSibling";
for(var r=this.GetFirst(b);r;r=this.GetNext(r,1)){
   if((r.Visible||r.Expanded&2) && (r.r1||r.rch1) && !r.Animating && r.Expanded && r.Hasch){ 
      var rc = r.r1 ? r.r1[next] : r.rch1;
      var h = rc.offsetHeight, y = this.GetRowTop(r) + (rev ? -h : (r.r1?r.r1.offsetHeight:0));
      if(y+h < ft) continue; 
      if(y>fb) break; 
      var cp = rc.firstChild.firstChild;
      r.LastAccess = time;
      if(parents){ A[A.length] = r; continue; }
      for(var i=0,p=cp.firstChild;p;i++,p=p.nextSibling){
         var yy = p.offsetTop+y, h = p.offsetHeight;
         if(yy+h < ft) continue; 
         if(yy>fb) break;
         if(!p.firstChild || p.firstChild.nodeType!=1 || p.getElementsByClassName(this.Img.Style+"PageMessage").length){ 
            A[A.length] =  r; A[A.length] =  i;
            }
         }
      }
   }
return A;
}
ME.ChildParts;
// -----------------------------------------------------------------------------------------------------------
// If given page is visible due scroll -> it will be loaded or rendered
// Return 1- yes, 0 - no, 2 - partially
MS.ChildParts;
TGP.IsChildPartShowed = function(row,num){
if(!row.r1&&!row.rch1) return 0;
var P = this.GetPageWindow(), ft = P[0], fb = P[1];
var ch = this.GetRowChildren(row,1); if(!ch) return; 
ch = ch.firstChild; if(!ch) return; 
ch = ch.firstChild; if(!ch) return; 
ch = ch.childNodes[num]; if(!ch) return; 
var y = this.GetRowTop(row) + (this.ReversedTree ? -(row.r1?row.r1.previousSibling:row.rch1).offsetHeight : (row.r1?row.r1.offsetHeight:0)) + ch.offsetTop, h = ch.offsetHeight;
if(y < ft) return y+h>ft ? 2 : 0;
if(y > fb-h) return y > fb ? 0 : 2;
return 1;
}
ME.ChildParts;
// -----------------------------------------------------------------------------------------------------------
TGP.RemoveUnused = function(){
var A = [], max = this.MaxPages;
var cnt = this.GetShowedPages().length; cnt = cnt==3?1:cnt/2; 
if(this.FRow && !this.FRow.Fixed) {
   var r = this.GetRowPage(this.FRow);
   if(!this.IsPageShowed(r)) { cnt++; r.LastAccess = new Date()-0; }
   }
if(max<cnt) max = cnt;
for(var r=this.XB.firstChild;r;r=r.nextSibling) if(r.State==4) A[A.length] = r;
if(A.length<=max) return; 
A.sort(function(a,b){ return a.LastAccess > b.LastAccess ? -1 : a.LastAccess < b.LastAccess });
for(var i=max;i<A.length;i++) {
   this.ClearPage(A[i],0,this.FirstSec+(this.RemoveUnusedFixed&1?0:1),this.LastSec-(this.RemoveUnusedFixed&2||this.SecCount!=3?0:1));
   A[i].State = 2;
   if(this.Paging==3 && this.RemoveUnusedPages==3 && this.RemovePage(A[i],0) && Grids.OnRemovePage) Grids.OnRemovePage(this,A[i]);
   }
if(this.Paging==3 && this.RemoveUnusedPages==3){
   A = []; for(var r=this.XB.firstChild,la=new Date()-100;r;r=r.nextSibling) if(r.State==2 && r.LastAccess<la) A[A.length] = r;
   for(var i=0;i<A.length;i++) if(this.RemovePage(A[i],0) && Grids.OnRemovePage) Grids.OnRemovePage(this,A[i]);
   }
this.UpdateCursors(1);
}
// -----------------------------------------------------------------------------------------------------------
TGP.RemoveUnusedChildParts = function(){
var A = [], max = this.MaxChildParts, min = this.ChildPartMin;
var cnt = this.GetShowedChildParts(1).length; 
var next = this.ReversedTree ? "previousSibling" : "nextSibling";
function fill(row){
   for(var r=row.firstChild;r;r=r.nextSibling) {
      if(r.Hasch!=4) continue;
      if(r.childNodes.length > min) {
         var cp = (r.r1?r.r1[next]:r.rch1).firstChild.firstChild, p = cp.firstChild, lp = cp.lastChild; if(min) p = p.nextSibling;
         if(p && (p.firstChild && p.firstChild.nodeType==1 || lp.firstChild && lp.firstChild.nodeType==1)) A[A.length] = r; 
         }
      if(r.firstChild) fill(r);
      } 
   }
for(var r=this.XB.firstChild;r;r=r.nextSibling) if(r.State==4) fill(r);
A.sort(function(a,b){ 
   var al = a.LastAccess; if(!al) al = 0; 
   var bl = b.LastAccess; if(!bl) bl = 0; 
   return al > bl ? -1 : al < bl; 
   });
var ed = {}; if(this.EditMode && !this.FRow.Fixed) for(var r=this.FRow.parentNode;r&&!r.Page;r=r.parentNode) ed[r.id] = 1;
for(var chg=0,i=0;i<A.length;i++) {
   var r = A[i]; if(!r.r1&&!r.rch1 || ed[r.id]) continue; 
   if(max>0) max -= (r.r1?r.r1[next]:r.rch1).firstChild.firstChild.childNodes.length;
   else if(i>=cnt) {
      for(var j=this.FirstSec;j<=this.LastSec;j++){
         var rr = r["r"+j]; rr = rr ? rr[next] : r["rch"+j];
         if(rr) {
            if(!r.Expanded){ 
               rr.parentNode.removeChild(rr);
               r.Hasch = 0;   
               MS.RowSpan; if(r.RowSpan) this.UpdateRowSpan(r,1); ME.RowSpan;
               }
            else {
               var p = rr.firstChild.firstChild.firstChild; 
               for(;p;p=p.nextSibling) if(p.firstChild && p.firstChild.nodeType==1) { 
                  p.style.height = p.offsetHeight+"px";
                  chg = 1; p.innerHTML = CNBSP; 
                  }
               }
            }
         }
      this.ClearChildren(r);
      
      if(this.ChildPaging==3 && this.RemoveUnusedPages==3 && this.RemovePage(r,0) && Grids.OnRemovePage) Grids.OnRemovePage(this,r);
      }
   }
if(chg) this.UpdateCursors(1);
}
// -----------------------------------------------------------------------------------------------------------
TGP.DownloadAllPagesSync = function(exp,flt,ask){
if(this.AllPagesDownloaded) return true;
if(ask&&!this.Print){ ask = this.GetAlert("DownloadSync"); if(ask&&!confirm(ask)) return false; }
var zal = this.Source.Page.Sync;
this.Source.Page.Sync = 1;
var T = this;
if(this.Paging==3) {
   var r=this.XB.firstChild;
   while(r){
      var n = r.nextSibling;
      if(r.State==0) { r.State = 1; this.StartPage(r,1); if(r.State==3) r.State = 2; }
      r = n;
      }
   }
if(this.ChildPaging==3){
   var E = this.Expanded;
   for(var r=flt?this.GetFirst():this.GetFirstVisible();r;r=flt?this.GetNext(r,!exp):this.GetNextVisible(r,!exp)) {
      if((r.Expanded||exp||E&&E[r.id]) && (r.State==0 || r.Count&&!r.State&&r.parentNode.DetailCol&&!r.parentNode.DetailRow)) { 
         r.State = 1; this.StartPage(r,1); if(r.State==3) r.State = 2;
         }
      }
   }   
this.Source.Page.Sync = zal;
this.AllPagesDownloaded = 1;
if(ask) this.ShowMessageTime(this.GetText("DownloadSyncComplete"),1000);
return true;
}
// -----------------------------------------------------------------------------------------------------------
ME.Paging;
// -----------------------------------------------------------------------------------------------------------
MS.Paging$Tree;
TGP.RemovePage = function(row,del,rem){
if(del==null&&row.Page) del = 1;
if(rem==null) rem = this.RemoveChanged; 
var and = rem?1:3, chg = 0;
if(rem!=2) for(var r=row.firstChild;r&&!chg;r=r.nextSibling) chg = this.HasChanges(r)&and; 
if(Grids.OnRemoveChanged && (chg||rem==2)) { var tmp = Grids.OnRemoveChanged(this,row); if(tmp!=null) rem = tmp; }
if(chg && rem<2) return false; 
if(rem==3) this.UploadChanges(null,null,1); 
if(rem==4){ var T = this; this.UploadChanges(null,function(result){ if(result>=0) T.RemovePage(row,del,2); },1); return; } 
if(row!=this.FRow) for(var r=this.FRow;r;r=r.parentNode) if(r==row) {
   if(rem<2) return false; 
   this.Focus(row.Page?null:row,this.FCol,null,null,2);
   }
if(del) this.ClearPage(row);
this.ClearChildren(row,1);
function CountRows(row){
   for(var r=row.firstChild,cnt=0;r;r=r.nextSibling,cnt++) if(r.firstChild) cnt += CountRows(r);
   return cnt;   
   }

this.LoadedCount -= CountRows(row);
var cnt = 0;
while(row.firstChild){ row.removeChild(row.firstChild); cnt++; }
row.Count = cnt;
row.State = 0;
if(del) { this.DelBody(row); this.Update(); }
return true;
}
ME.Paging$Tree;
// -----------------------------------------------------------------------------------------------------------
TGP.ActionRenderPages = function(dummy,T,on){
var all = this.Paging==2&&this.AllPages || this.ColPaging==2 || this.ChildParts==2&&this.ChildPaging!=3;
if(all) {
   if(on) return false;
   if(T) return true;
   MS.ColPaging; if(this.ColPaging==2){ this.ColPaging = 1; this.ShowColPages(); } ME.ColPaging;
   MS.Paging; if(this.Paging==2 && this.AllPages){ this.Paging = 1; this.ShowPages(); } ME.Paging;
   MS.ChildParts; if(this.ChildParts==2&&this.ChildPaging!=3){ this.ChildParts = 1; this.ShowPages(); } ME.ChildParts;
   this.CalculateSpaces(1);
   }
else if(this.Paging==1&&this.AllPages||this.ColPaging==1||this.ChildParts==1&&this.ChildPaging!=3){
   if(on==0) return false;
   if(T) return true;
   T = this; function Remove(){
      MS.ColPaging; if(T.ColPaging==1){ T.ColPaging = 2; T.RemoveUnusedColPages(); }  ME.ColPaging; 
      MS.Paging; if(T.Paging==1 && T.AllPages) { T.Paging = 2; T.RemoveUnused(); } ME.Paging; 
      MS.ChildParts; if(T.ChildParts==1&&T.ChildPaging!=3){ T.ChildParts = 2; T.RemoveUnusedChildParts(); } ME.ChildParts;
      T.CalculateSpaces(1);
      T.HideMessage();
      T.Update();
      }
   this.ShowMessage(this.GetText("RemoveUnused"));
   setTimeout(Remove,10);
   }
else return false;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionPagingOn = function(dummy,T){ return this.ActionRenderPages(dummy,T,1); }
TGP.ActionPagingOff = function(dummy,T){ return this.ActionRenderPages(dummy,T,0); }
// -----------------------------------------------------------------------------------------------------------

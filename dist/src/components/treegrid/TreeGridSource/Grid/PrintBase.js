// -----------------------------------------------------------------------------------------------------------
// Support print functions
// -----------------------------------------------------------------------------------------------------------
var CCanSelect = [0,1,1];           
var CDoPrint = [3,3,4,3,4,7,8,7,8]; 

// -----------------------------------------------------------------------------------------------------------
TGP.GetCfgOptions = function(name,L){
var opt = this.GetText(name,L).split(",");
for(var i=0;i<opt.length;i++) opt[i] = { Name:i,Text:opt[i] };
return opt;
}
// -----------------------------------------------------------------------------------------------------------
TGP.HasSelectedParent = function(row,always){
for(row=row.parentNode;row&&!row.Page&&(row.Expanded||always||(row.CanExpand!=null?row.CanExpand:row.Def.CanExpand));row=row.parentNode) if(row.Selected) return true;
return false;
}
// -----------------------------------------------------------------------------------------------------------
MS.Print;
// -----------------------------------------------------------------------------------------------------------
TGP.GetPrintCount = function(row){
var cnt = 0;
for(var r=row.firstChild;r;r=r.nextSibling) {
   if(r.firstChild) cnt += this.GetPrintCount(r);
   else if(r.State<2&&this.PrintLoad) cnt += r.Count;
   var prn = r.DoPrint; if(prn==null) prn = r.CanPrint; if(prn==null && r.Def) prn = r.Def.CanPrint;
   if(prn && (r.Visible || this.PrintFiltered || prn>2) && (!this.PrintSelected||!this.PrintSelectedRows||r.Selected||!CCanSelect[Get(r,"CanSelect")])||this.PrintExpanded&&!r.Fixed&&this.HasSelectedParent(r)) cnt++;
   }
return cnt;
}
// -----------------------------------------------------------------------------------------------------------
TGP.CanPrint = function(row,brk){
var prn = row.DoPrint; if(prn==null) prn = row.CanPrint; if(prn==null && row.Def) prn = row.Def.CanPrint;
return prn && (row.Visible || this.PrintFiltered&&!row.Fixed || prn>2) && (!brk || prn==2 || prn==4) && (!this.PrintSelected||!this.PrintSelectedRows||row.Selected||row.Space||row.Kind=="Header"||!CCanSelect[Get(row,"CanSelect")]||this.PrintExpanded&&!row.Fixed&&this.HasSelectedParent(row));
}
// -----------------------------------------------------------------------------------------------------------
TGP.LoadPrint = function(row,PageLoaded){
if(row.Count && !row.PrintError && row.State<2 && this.PrintLoad && !this.Print && PageLoaded){ 
   if(row.State==0) { 
      if(row.Page) row = this.UpdateTagName(row); 
      row.State = 1; this.DownloadPage(row,function(res){ PageLoaded(res,row)}); 
      } 
   return true; 
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.HasFoot = function(wp,brk){
for(var r=this.XF.firstChild;r;r=r.nextSibling) if(this.CanPrint(r,0)) return true;
for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Space>=2 && r.Kind!="Fill"){ 
   var prn = r.DoPrint; if(prn==null) prn = r.CanPrint; if(prn==null && r.Def) prn = r.Def.CanPrint;
   if(prn>4) prn -= 4; 
   else if(wp!=1) continue;
   if(!prn || !r.Visible && prn<=2 || brk && prn!=2 && prn!=4) continue;
   return true;
   }
return false;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetFirstPrint = function(PageLoaded){
if(this.PrintSelected&&this.PrintSelectedRows){ 
   var row = this.GetFirst(null,this.PrintExpanded?0:1);
   return row && !this.CanPrint(row) ? this.GetNextPrint(row,this.PrintExpanded?0:1) : row;
   }
var row = this.XB.firstChild;
while(row && !row.firstChild){ 
   if(this.LoadPrint(row,PageLoaded)) return false;
   row = row.nextSibling;   
   }
if(!row) return null;
return this.GetNextPrint({nextSibling:row.firstChild,Def:{}},PageLoaded); 
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetNextPrintRev = function(row,PageLoaded){
if(this.PrintSelected&&this.PrintSelectedRows){ 
   for(row=this.GetNext(row,this.PrintExpanded?0:1);row&&!this.CanPrint(row);row=this.GetNext(row,this.PrintExpanded?0:1));
   return row;
   }
while(1){
   while(row.nextSibling) {
      row = row.nextSibling;
      if(row.Page || this.CanPrint(row)){
         while(row.Page || row.Expanded || this.PrintExpanded && Is(row,"CanExpand")){
            if(row.firstChild) {
               row = row.firstChild;
               while(row.nextSibling && !this.CanPrint(row)) row = row.nextSibling;
               if(!this.CanPrint(row)) { row = row.parentNode; break; }
               }
            else if(this.LoadPrint(row,PageLoaded)) return false;
            else break;
            }      
         if(!row.Page) return row;
         }
      }
   if(row.Page) return null; 
   row = row.parentNode;
   if(!row.Page) return row; 
   }
}
// -----------------------------------------------------------------------------------------------------------  
TGP.GetNextPrint = function(row,PageLoaded){
if(this.PrintSelected&&this.PrintSelectedRows){ 
   for(row=this.GetNext(row,this.PrintExpanded?0:1);row&&!this.CanPrint(row);row=this.GetNext(row,this.PrintExpanded?0:1));
   return row;
   }
if(row.Expanded || this.PrintExpanded && Is(row,"CanExpand")){
   if(row.firstChild){
      row = row.firstChild;
      if(this.CanPrint(row)) return row;   
      }
   else if(this.LoadPrint(row,PageLoaded)) return false;
   }
while(1){
   while(!row.nextSibling&&!row.Page) row = row.parentNode;
   row = row.nextSibling;
   if(row&&row.Page){
      while(row && !row.firstChild) {
         if(this.LoadPrint(row,PageLoaded)) return false;
         row = row.nextSibling; 
         }
      if(row) row = row.firstChild;
      }
   if(!row || this.CanPrint(row)) return row;
   }
}
// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------
TGP.ClearPrintNestedGrids = function(){
MS.Nested;
var GG = this.PrintNestedGrids; if(!GG) return;
for(var id in GG) if(!GG[id].Cleared) {
   var A = GG[id];
   A[0].Dispose();
   A[3].parentNode.removeChild(A[3]);
   A[1].DetailSelected = A[4]; A[2].DetailRow = A[5] ? [A[5]] : null; A[2].DetailGrid = A[6] ? [A[6]] : null;
   }
Grids.length = this.PrintNestedLength;
delete this.PrintNestedGrids;
delete this.PrintNestedLength;
ME.Nested;
}
// -----------------------------------------------------------------------------------------------------------
MS.Nested;
TGP.GetPrintNestedGrid = function(row){
var id = this.id+"DG"+row.id+"Print";
if(this.PrintNestedGrids&&this.PrintNestedGrids[id]) return this.PrintNestedGrids[id][0];
var D = this.GetNestedSource(row);
if(!D) return null;
var c = row.DetailCol; if(!c) return null;
var zval = row[c], zt = row[c+"Type"], ztc = row[c+"TypeClass"];
row[c+"TypeClass"] = this.GetType(row,c); row[c+"Type"] = "Html";
var tag = document.createElement("div");
tag.style.visibility = "hidden";
tag.style.height = (document.body.offsetHeight - 20)+"px";
tag.style.width = (document.body.offsetWidth - 20)+"px";
this.AppendTag(tag);
var C = this.Cols[c], width = C.Width;
if(row.Spanned){
   var span = row[c+"Span"], CN = this.ColNames[C.Sec], idx = C.Pos; width = 0;
   var cols = this.PrintColsNested, cc = {}; 
   for(var i=0;i<cols.length;i++) {
      for(var j=0;j<cols[i].length;j++) if(cols[i][j]==c) break;
      if(j!=cols[i].length) {
         for(var j=0;j<cols[i].length;j++) cc[cols[i][j]] = 1;
         break;
         }
      }
   for(var i=0;i<span;i++){ var C = this.Cols[CN[idx+i]]; if(cc[CN[idx+i]]) width += C.Width; }
   }
row[c] = "<div id='TG"+this.Index+"PrintingTreeGrid'></div>";
var SS = []; this.GetRowHTML(row,SS,0,c);
tag.innerHTML = CTableCSP0+CTfoot+"<tr class='"+this.Img.Style+row.Kind+"Row "+(this.DynamicBorder&&!row.NoDynBorder?" "+this.Img.Style+"DB ":"")+"'>"+SS.join("")+"</tr>"+CTableEnd;
var d = GetElem("TG"+this.Index+"PrintingTreeGrid"), height = 0;
if(d) { width -= d.parentNode.offsetWidth - d.offsetWidth; height += d.parentNode.offsetHeight - d.offsetHeight; }
var I = this.Img;
if(c==this.MainCol && !this.HideTree){
   var lev = row.Level; 
   if(this.HideRootTree) lev--;
   if(row.Expanded&2) lev--;
   var dw = (lev+1)*I.Line+I.Tree;
   if(this.SpannedTree||!C.Visible||row.Fixed) dw = 0;
   width -= dw;
   }
tag.style.width = width-I.CellBorderLeft-I.CellBorderRight+"px";
var zsel = this.DetailSelected, zdr = row.DetailRow ? row.DetailRow[0] : null, zdg = row.DetailGrid ? row.DetailGrid[0] : null;
var G = TreeGrid(D,tag,id);
row[c] = zval; row[c+"Type"] = zt; row[c+"TypeClass"] = ztc;
if(!G) return null;
for(var A=[G.XS,G.XH,G.XF],i=0;i<A.length;i++) for(var r=A[i].firstChild;r;r=r.nextSibling) if(!G.CanPrint(r)) height -= G.GetPrintRowHeight(r);
for(var r=G.GetFirstVisible();r;r=G.GetNextVisible(r)) if(!G.CanPrint(r)) height -= G.GetPrintRowHeight(r);
G.PrintOuterHeight = height + G.MainTag.offsetHeight;
if(G.HasNested) for(var i=0;i<Grids.length;i++) if(Grids[i]&&Grids[i].MasterGrid==G) Grids[i].Update(); 
this.ShowDetail(row,G.id,0,0,1); 
if(!this.PrintNestedGrids) { this.PrintNestedGrids = {}; this.PrintNestedLength = Grids.length; }
this.PrintNestedGrids[id] = [G,this,row,tag,zsel,zdr,zdg];
return G;
}
ME.Nested;
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
ME.Print;

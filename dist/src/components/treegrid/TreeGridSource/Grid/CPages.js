// -----------------------------------------------------------------------------------------------------------
// Functions for creating included child rows, when children count exceeds MaxChildren
// -----------------------------------------------------------------------------------------------------------
MS.CPages;
// -----------------------------------------------------------------------------------------------------------
// Adds and returns automatic child page
// If show is set, adds body also to html and interconnects them
TGP.AddCPage = function(par,server){
var B = Dom.createElement("B");
par.appendChild(B);
if(par.Page) {
   B.Def = this.Def["R"];
   var empty = 1;
   }
else {
   var RA = Grids.INames;
   for(var c in par) if(!RA[c]) B[c] = par[c];
   var empty = this.EmptyChildPages||this.MaxChildrenEmpty;
   }
var CP = this.Def[server?"SPage":"CPage"];
if(CP){
   var N = {"Name":1,"Def":1,"id":1};
   N.Updated = 1;
   for(var c in CP) if(!N[c]) B[c] = CP[c];
   }
if(!server) B.CPage = 1;
if(B.AggChildren==null) B.AggChildren = 1;
B.Level = par.Level+1;
B.CanEdit = 0;
if(B.Expanded==null) B.Expanded = 0;
if(B.Visible==null) B.Visible = 0;
B.State = server ? 0 : 2;
B.CanDelete = 0;
B.CanSelect = 0;
B.CanCopy = 0;
B.Selected = 0;
B.CanDrag = 0;

for(var i=this.FirstSec;i<=this.LastSec;i++) B['r'+i] = null;

if(!B.Visible) for(var c in this.Cols){
   B[c+"CanEdit"] = 0;
   B[c+"Button"] = "";
   B[c+"Icon"] = "";
   if(empty) B[c+"Visible"]=0;
   
   }
if(empty) B[this.MainCol+"Visible"] = 1;
if(this.SetIds) {
   B.id = this.ChildIdPrefix+this.ChildAutoId++;
   while(this.Rows[B.id]) B.id = this.ChildIdPrefix+this.ChildAutoId++;
   this.Rows[B.id] = B;
   }

return B;
}
// -----------------------------------------------------------------------------------------------------------
// Deletes page even from HTML
TGP.DelCPage = function(B){

var ch = B.State==4 && B.firstChild, next = this.ReversedTree ? "previousSibling" : "nextSibling";
for(var i=this.FirstSec;i<=this.LastSec;i++){
   var r = B["r"+i];
   if(!r) continue;
   var p = r.parentNode;
   if(ch) p.removeChild(r[next]);
   p.removeChild(r);
   }

var par = B.parentNode;
par.removeChild(B);
B.Removed = 1;
if(B.id) delete this.Rows[B.id];
if(!par.firstChild) {
   par.CDef = B.CDef;
   par.AcceptDef = B.AcceptDef;
   }
}
// -----------------------------------------------------------------------------------------------------------
// Creates child pages for given body or XB, recursion
TGP.CreateAllCPages = function(par,show){
if(par==this.XB){
   if(!this.MainCol) return;
   for(var r=par.firstChild;r;r=r.nextSibling) this.CreateAllCPages(r,show);
   }
else if(par.Page){
   for(var r=par.firstChild;r;r=r.nextSibling) if(r.firstChild) this.CreateCPages(r,show,null,1);
   }
else this.CreateCPages(par,show,null,1);
}
// -----------------------------------------------------------------------------------------------------------
// Creates child page for given row
// A can be array of children or null - it is created
TGP.CreateCPages = function(par,show,A,recurse){

var max = par.Page?1e10 : Get(par,"MaxChildren"), fc = par.firstChild, cnt=0, res = par.Page ? 0 : Get(par,"MaxChildrenDiff");
if(!A){
   if(!fc || !par.Visible && !par.Page) return; 
   if(fc.CPage){ 
      A = [];
      for(var pr=par.firstChild,p=0;pr;pr=pr.nextSibling){
         for(var r=pr.firstChild;r;r=r.nextSibling){
            A[p++] = r;
            if(r.Visible) cnt++;
            if(recurse && r.firstChild) this.CreateCPages(r,show,null,1);
            }
         }
      }
   else {       
      var len = par.childNodes.length;
      if(len>max+res) {
         A = [];
         for(var r=par.firstChild,p=0;r;r=r.nextSibling){
            A[p++] = r;
            if(r.Visible) cnt++;
            if(recurse && r.firstChild) this.CreateCPages(r,show,null,1);
            }
         }
      else {
         cnt = len;
         if(recurse) for(var r=par.firstChild;r;r=r.nextSibling) if(r.firstChild) this.CreateCPages(r,show,null,1);
         }
      }
   }
else { 
   var len = A.length;
   if(len>max+res) for(var i=0;i<len;i++) if(A[i].Visible) cnt++;
   else cnt = len;
   if(recurse) for(var i=0;i<len;i++) if(A[i].firstChild) this.CreateCPages(A[i],show,null,1);
   }
   
var T = this;
function updatelevel(row,show){
for(var r=row.firstChild;r;r=r.nextSibling){
   T.UpdateLevelImg(r,show);
   if(r.firstChild) updatelevel(r,show);
   }
}

if(cnt>max+res){ 
   var nul = cnt<100 ? 2 : cnt<1000 ? 3 : 4, nulls="0000", pref = this.GetText("Items");
   var cnt = 0, body, ocnt = par.childNodes.length, ogc = Grids.OnCreateCPage;
   par._Count = cnt;
   var cdef = fc.CPage ? fc.CDef : Get(par,"CDef"); 
   var adef = fc.CPage ? fc.AcceptDef : Get(par,"AcceptDef"); 
   for(var i=0;i<A.length;i++){ 
      if(A[i].Visible || !body){
         if(!cnt){
            cnt = max;
            body = this.AddCPage(par); 
            body.CDef = cdef;
            body.AcceptDef = adef;
            }
         cnt--;
         }
      if(show && par.Expanded && st!=3 && A[i].r1) this.TableDelRow(A[i]); 
      body.appendChild(A[i]);
      A[i].Level = body.Level+1;
      }
   if(max-cnt<Get(par,"MaxChildrenMin") && body.previousSibling){
      var pb = body.previousSibling;
      for(var p = body.firstChild,lp;p;p=lp){ lp = p.nextSibling; pb.appendChild(p); }
      this.DelCPage(body);   
      }
   par.CDef = "*"; 
   par.AcceptDef = "*";
   if(fc.CPage) {
      for(var i=0,r=par.firstChild;i<ocnt&&r;i++,r=r.nextSibling) r.Visible = 0;
      this.HideFRow();
      for(var i=0;i<ocnt;i++) this.DelCPage(par.firstChild); 
      }
   
   var mc = this.MainCol, ln = 0, st = par.State;
   if(par.State==4) par.State=2;
   
   function GetStr(val){
      val+="";
      return nulls.slice(0,nul-val.length)+val;
      }
   var MC = this.Cols[mc], P = this.GetCalc();
   this.Rendering = 1;
   for(var r=par.firstChild;r;r=r.nextSibling){
      
      for(var c=r.firstChild,lnc=0;c;c=c.nextSibling) if(c.Visible) lnc++;
      
      if(r.Calculated) this.CalcRow(r,P,"CalcOrder",show);
      r[mc+"Type"] = "Html";
      r[mc+"Format"] = "";
      r[mc+"Wrap"] = 0;
      r[mc] = pref.replace(/\%d/,GetStr(ln+1)).replace(/\%d/,GetStr(ln+lnc));
      r.Hasch = 2;
      if(ogc) Grids.OnCreateCPage(this,r);
      if(show && par.Expanded && st!=3){ 
         this.ShowRow(r);
         this.RefreshCell(r,mc);
         }
      r.Visible = 1;
      ln += lnc;
      }
   this.Rendering = 0;
   this.Update();
   
   updatelevel(par,0);
   
   }
   
else if(A){
   if(BNN) for(var i=0;i<A.length;i++) par.removeChild(A[i]); 
   for(var i=0;i<A.length;i++) par.appendChild(A[i]);
   if(fc.CPage) {
      for(var r=fc;r&&r.CPage;r=par.firstChild) this.DelCPage(par.firstChild); 
      
      updatelevel(par,show);
      if(show && par.Expanded && st!=3){
         var r1 = 1;
         for(var r=par.firstChild;r;r=r.nextSibling) if(!r.r1){ r1=0; break; }
         if(!r1){
            this.Collapse(par);
            par.State=2;
            this.ClearChildren(par);
            this.Expand(par);
            }
         if(!this.HasChildren(par) || !this.CanShowChildren(par)) this.DeleteChildren(par);
         }
      this.UpdateIcon(par);
      }

     if(show) this.ShowCPages(A,fc);

   }
}
// -----------------------------------------------------------------------------------------------------------
// Updates captions all immediate CPages of given row
TGP.UpdateCPages = function(par){
var cnt = 0, nul = par._Count<100 ? 2 : par._Count<1000 ? 3 : 4, nulls="0000", pref = this.GetText("Items"), mc = this.MainCol;
function GetStr(val){
   val+="";
   return nulls.slice(0,nul-val.length)+val;
   }
for(var r=par.firstChild;r;){
   if(!r.CPage) break;
   var c = r.childNodes.length;
   if(!c){
      var rx = r.nextSibling;
      this.DelRow(r);
      r = rx;
      continue;
      }
   var S = pref.replace(/\%d/,GetStr(cnt+1)).replace(/\%d/,GetStr(cnt+c));
   if(S!=r[mc]){
      r[mc] = S;
      this.RefreshCell(r,mc);
      }
   cnt+=c;
   r=r.nextSibling;
   }
}
// -----------------------------------------------------------------------------------------------------------
ME.CPages;
// -----------------------------------------------------------------------------------------------------------
// Support function Sort and CPages - shows children in A in grid
// fc is first child of the parent, set only for CPages
MS.Tree;
TGP.ShowCPages = function(A,fc){
var rev = this.ReversedTree, next = rev ? "previousSibling" : "nextSibling";
for(var j=this.FirstSec;j<=this.LastSec;j++){
   var n = "r"+j, p = A[0][n];
   if(p) p = p.parentNode;
   else {
      for(var i=0;i<A.length;i++) if(A[i][n]) { p = A[i][n].parentNode; break; }
      if(fc && fc.CPage && p) p = A[i][n][next];
      }
   var orr = j==1 && Grids.OnDisplaceRow!=null; 
   if(p) for(var i=0;i<A.length;i++){
      if(!A[i][n]) continue;   
       var ch = A[i].Hasch ? A[i][n][next] : null;
      if(ch) {
         if(!rev) p.appendChild(A[i][n]);
         p.appendChild(ch);
         if(rev) p.appendChild(A[i][n]);
         }
      else p.appendChild(A[i][n]);
      if(orr) Grids.OnDisplaceRow(this,A[i]);
      }
   }  
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
TGP.CreateSPages = function(par){
if(par.firstChild) {
   for(var r=par.firstChild;r;r=r.nextSibling) this.CreateSPages(r);
   }
else if(par.Count>this.ChildPageLength+this.ChildPageDiff) {
   for(var cnt=Math.ceil(par.Count/this.ChildPageLength),i=0;i<cnt;i++) {
      var r = this.AddCPage(par,1);
      r.Pos = i;
      r.SPage = 1;
      r.Count = i<cnt-1||!(par.Count%this.ChildPageLength) ? this.ChildPageLength : par.Count%this.ChildPageLength;
      }
   par.Count = null;
   }
}
// -----------------------------------------------------------------------------------------------------------
ME.Tree;
// -----------------------------------------------------------------------------------------------------------

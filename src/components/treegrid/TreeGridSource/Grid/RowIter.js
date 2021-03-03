// -----------------------------------------------------------------------------------------------------------
// Functions for row iteration
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Returns array of head or foot rows (returns all XML nodes in given section). Sec is this.XH or this.XF
TGP.GetRows = function(Sec){
var r,A = [], p=0;
for(r=Sec.firstChild;r;r=r.nextSibling) A[p++] = r;
return A;
}
// -----------------------------------------------------------------------------------------------------------
// Returns array of fixed rows
TGP.GetFixedRows = function(){
var A = [], p=0,r;
for(r=this.XH.firstChild;r;r=r.nextSibling) A[p++] = r;
for(r=this.XF.firstChild;r;r=r.nextSibling) A[p++] = r;
return A;

}
// -----------------------------------------------------------------------------------------------------------
// Returns array rows with Kind='Filter'
TGP.GetFilterRows = function(){
var A = [], p=0,r;
MS.Filter;
for(r=this.XH.firstChild;r;r=r.nextSibling) if(r.Kind=="Filter") A[p++] = r;
for(r=this.XF.firstChild;r;r=r.nextSibling) if(r.Kind=="Filter") A[p++] = r;
ME.Filter;
return A;
}
// -----------------------------------------------------------------------------------------------------------
// Returns row according to id or null
TGP.GetRowById = function(id,col,nofixed){
if(this.SetIds&&this.Rows[id]&&!col) return this.Rows[id];
if(!col) col = "id";
if(!nofixed) {
   for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r[col]==id) return r;
   var F = this.GetFixedRows();
   for(var i=0;i<F.length;i++) if(F[i][col]==id) return F[i];
   if(this.Toolbar[col]==id) return this.Toolbar; 
   if(this.Header[col]==id) return this.Header;
   }
for(var r=this.GetFirst();r;r=this.GetNext(r)) if(r[col]==id) return r;
return null;
}
// -----------------------------------------------------------------------------------------------------------
// Returns the first variable row of given page or null
// type&4 - include head and foot rows
// If B==null returns the first variable row
TGP.GetFirst = function(B, type){
if(type&4 && this.XH.firstChild) return this.XH.firstChild;
if(!B) {
   B = this.XB.firstChild;
   while(B && !B.firstChild) B = B.nextSibling;
   }
if(!B) return null;
var row = B.firstChild;
if(!row && type&4) return this.XF.firstChild;
return row;
}
// -----------------------------------------------------------------------------------------------------------
// Returns the first variable row of given page or null
// type&4 - include head and foot rows
// If B==null returns the first variable row
MS.ReversedTree;
TGP.GetFirstRev = function(B, type){
if(type&4 && this.XH.firstChild) return this.XH.firstChild;
if(!B) {
   B = this.XB.firstChild;
   while(B && !B.firstChild) B = B.nextSibling;
   }
if(!B) return null;
var row = B.firstChild;
if(!row) return  type&4 ? this.XF.firstChild : null;
while(row.firstChild && (row.Expanded || !(type&1)) && (row.Visible || !(type&8))) row = row.firstChild;
return row;
}
ME.ReversedTree;
// -----------------------------------------------------------------------------------------------------------
// Returns the last variable row of given page or null
// type&1 without collapsed children, type&4 - include head and foot rows
// If B==null returns the last variable row
TGP.GetLast = function(B, type){
if(type&4 && this.XF.lastChild) return this.XF.lastChild;
if(!B){ 
   B = this.XB.lastChild;
   while(B && !B.firstChild) B = B.previousSibling;
   }
if(!B) return null;
var row = B.lastChild;
if(!row) return type&4 ? this.XH.lastChild : null;
while(row.lastChild && (!(type&1) || row.Expanded) && (row.Visible || !(type&8))) row = row.lastChild;
return row;
}
// -----------------------------------------------------------------------------------------------------------
MS.ReversedTree;
TGP.GetLastRev = function(B, type){
if(type&4 && this.XF.lastChild) return this.XF.lastChild;
if(!B) {
   B = this.XB.lastChild;
   while(B && !B.firstChild) B = B.previousSibling;
   }
if(!B) return null;
var row = B.lastChild;
if(!row && type&4) return this.XH.lastChild;
return row;
}
ME.ReversedTree;
// -----------------------------------------------------------------------------------------------------------
// Returns next variable row or null
// type&1 without collapsed children, type&2 - only from the same page
TGP.GetNext = function(row,type){
var r = row.firstChild;
if(r && (!(type&1) || row.Expanded)) return r;
r = row.nextSibling;
if(r) return r;
row = row.parentNode;
while(!row.nextSibling && row.parentNode) row = row.parentNode;
if(row.Page){ 
   if(type&2 || !row.nextSibling) return type&4 ? this.XF.firstChild : null;
   row = row.nextSibling;
   while(row && !row.firstChild) row = row.nextSibling; 
   return row ? row.firstChild : (type&4 ? this.XF.firstChild : null);
   }
r = row.nextSibling;
if(r) return r;
if(type&4) {
   if(row.Fixed=="Head") return this.GetFirst(null,type&1);
   if(row==this.XB) return this.XF.firstChild;
   }
return null;
}
// -----------------------------------------------------------------------------------------------------------
// Returns next variable row or null
// type&1 without collapsed children, type&2 - only from the same page
MS.ReversedTree;
TGP.GetNextRev = function(row, type){
var r = row.nextSibling;
if(r) while(r.firstChild && (!(type&1) || r.Expanded)) r = r.firstChild;
else {
   r = row.parentNode;
   if(r.Page){ 
      if(type&2) return type&4 ? this.XF.firstChild :  null;
      r = r.nextSibling;
      while(r && !r.firstChild) r = r.nextSibling; 
      if(r) { 
         r = r.firstChild;
         while(r.firstChild && (!(type&1) || r.Expanded)) r = r.firstChild;
         }
      else if(type&4) r = this.XF.firstChild;
      }
    else if(!r.parentNode) {
      if(type&4&&r.Fixed=="Head") return this.GetFirst(null,type&1);
      return null; 
      }
   }
return r;
}
ME.ReversedTree;
// -----------------------------------------------------------------------------------------------------------
// Returns previous variable row or null
// type&1 without collapsed children, type&2 - only from the same page
TGP.GetPrev = function(row, type){
var r = row.previousSibling;
if(r) while(r.lastChild && (!(type&1) || r.Expanded)) r = r.lastChild;
else {
   r = row.parentNode;
   if(r.Page){ 
      if(type&2) return type&4 ? this.XH.lastChild : null;
      r = r.previousSibling;
      while(r && !r.firstChild) r = r.previousSibling; 
      if(r) { 
         r = r.lastChild;
         while(r.lastChild && (!(type&1) || r.Expanded)) r = r.lastChild;
         }
      else if(type&4) r = this.XH.lastChild;
      }
   else if(!r.parentNode) {
      if(type&4&&r.Fixed=="Foot") return this.GetLast(null,type&1);
      return null; 
      }
   }
return r;
}
// -----------------------------------------------------------------------------------------------------------
// Returns previous variable row or null
// type&1 without collapsed children, type&2 - only from the same page
MS.ReversedTree;
TGP.GetPrevRev = function(row,type){
var r = row.lastChild;
if(r && (!(type&1) || row.Expanded)) return r;
r = row.previousSibling;
if(r) return r;
row = row.parentNode;
while(!row.previousSibling && row.parentNode) row = row.parentNode;
if(row.Page){ 
   if(type&2 || !row.previousSibling) return type&4 ? this.XH.lastChild : null;
   row = row.previousSibling;
   while(row && !row.lastChild) row = row.previousSibling; 
   return row ? row.lastChild : (type&4 ? this.XH.lastChild : null);
   }
if(type&4) {
   if(row.Fixed=="Foot") return this.GetLast(null,type&1);
   if(row==this.XB) return this.XH.lastChild;
   }
return row.previousSibling;
}
ME.ReversedTree;
// -----------------------------------------------------------------------------------------------------------
// Returns the first visible variable row on given page or null, type is ignored
// If B is null, returns the first row
TGP.GetFirstVisible = function(B,type){
var row = this.GetFirst(B,type?type|8:8);
if(row && !row.Visible) return this.GetNextVisible(row,B ? type|2 : type);
return row;
}
// -----------------------------------------------------------------------------------------------------------
// Returns the last visible variable row on given page or null, type&1 without collapsed children
// If B is null, returns the last row
TGP.GetLastVisible = function(B,type){
var row = this.GetLast(B,type?type|8:8);
if(row && !row.Visible) return this.GetPrevVisible(row,B ? type|2 : type);
return row;
}
// -----------------------------------------------------------------------------------------------------------
// Returns next visible variable row or null
// type&1 without collapsed children, type&2 - only from the same page
TGP.GetNextVisible = function(row,type){
var r = row.firstChild;
if(r && (row.Visible && (!(type&1) || row.Expanded) || row.Expanded&2)) {
   if(r.Visible) return r;
   
   while(r&&!r.Visible) {
      if(r.Expanded&2) r = r.firstChild;
      else {
         while(!r.nextSibling&&r.parentNode!=row) r = r.parentNode;
         r = r.nextSibling; 
         }
      }
   if(r) return r;
   }
r = row.nextSibling;
if(r) {
   if(r.Visible) return r;
   
   var p = r.parentNode;
   while(r&&!r.Visible) {
      if(r.Expanded&2) r = r.firstChild;
      else {
         while(!r.nextSibling&&r.parentNode!=p) r = r.parentNode;
         r = r.nextSibling; 
         }
      }
   if(r) return r;
   }
if(row.Fixed) return type&4 && row.Fixed=="Head" ? this.GetFirstVisible(null,type&1) : null;
while(1) {
   row = row.parentNode;
   if(row.Page){ 
      if(type&2) return type&4 ? this.GetFirstVisible(this.XF) : null;
      row = row.nextSibling;
      while(row && !row.firstChild) row = row.nextSibling; 
      if(!row) return type&4 ? this.GetFirstVisible(this.XF) : null;
      row = row.firstChild; r = row;
      }
   else r = row.nextSibling;
   if(r) {
      if(r.Visible) return r;
      
      var p = r.parentNode;
      while(r&&!r.Visible) {
         if(r.Expanded&2) r = r.firstChild;
         else {
            while(!r.nextSibling&&r.parentNode!=p) r = r.parentNode;
            r = r.nextSibling; 
            }
         }
      if(r) return r;
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
// Returns next visible variable row or null
// type&1 without collapsed children, type&2 - only from the same page
MS.ReversedTree;
TGP.GetNextVisibleRev = function(row,type){

var r = row.nextSibling;
if(!r&&row.parentNode.Expanded&2) r = row.parentNode.nextSibling;
if(r) while(1){
   while(r&&!r.Visible) {
      if(r.Expanded&2 && r.firstChild) r = r.firstChild;
      else {
         while(!r.nextSibling&&r.parentNode!=row.parentNode) { r = r.parentNode; if(r.Visible) return r; }
         r = r.nextSibling; 
         }
      }
   if(!r) break;
   if(!r.firstChild||!r.Expanded&&type&1) return r;
   r = r.firstChild;
   }

if(row.Fixed) return type&4&&row.Fixed=="Head" ? this.GetFirstVisible(null,type&1) : null;
var r = row.parentNode;
if(!r.Page) return r.Visible ? r : this.GetNextVisibleRev(r,type); 

if(type&2) return type&4 ? this.GetFirstVisible(this.XF,type&1) : null;
r = r.nextSibling;
while(r && !r.firstChild) r = r.nextSibling; 
if(!r) return type&4 ? this.GetFirstVisible(this.XF,type&1) : null;
r = r.firstChild;
return r.Visible ? r : this.GetNextVisibleRev(r,type);
}
ME.ReversedTree;
// -----------------------------------------------------------------------------------------------------------
// Returns previous visible variable row or null
// type&1 without collapsed children, type&2 - only from the same page
TGP.GetPrevVisible = function(row,type){

var r = row.previousSibling;
if(!r&&row.parentNode.Expanded&2) r = row.parentNode.previousSibling;
if(r) while(1){
   while(r&&!r.Visible) {
      if(r.Expanded&2 && r.lastChild) r = r.lastChild;
      else {
         while(!r.previousSibling&&r.parentNode!=row.parentNode&&!r.parentNode.Page) { r = r.parentNode; if(r.Visible) return r; }
         r = r.previousSibling; 
         }
      }
   if(!r) break;
   if(!r.lastChild||!r.Expanded&&type&1) return r;
   r = r.lastChild;
   }

if(row.Fixed) return type&4&&row.Fixed=="Foot" ? this.GetLastVisible(null,type&1) : null;
var r = row.parentNode;
if(!r.Page) return r.Visible ? r : this.GetPrevVisible(r,type); 

if(type&2) return type&4 ? this.GetLastVisible(this.XH,type&1) : null;
r = r.previousSibling;
while(r && !r.firstChild) r = r.previousSibling; 
if(!r) return type&4 ? this.GetLastVisible(this.XH,type&1) : null;
r = r.lastChild;
return r.Visible ? r : this.GetPrevVisible(r,type);
}
// -----------------------------------------------------------------------------------------------------------
// Returns previous visible variable row or null
// type&1 without collapsed children, type&2 - only from the same page
MS.ReversedTree;
TGP.GetPrevVisibleRev = function(row,type){
var r = row.lastChild;
if(r && row.Visible && (!(type&1) || row.Expanded)) {
   if(r.Visible) return r;
   
   while(r&&!r.Visible) {
      if(r.Expanded&2) r = r.lastChild;
      else {
         while(!r.nextSibling&&r.parentNode!=row) r = r.parentNode;
         r = r.previousSibling; 
         }
      }
   if(r) return r;
   }
r = row.previousSibling;
if(r) {
   if(r.Visible) return r;
   
   var p = r.parentNode;
   while(r&&!r.Visible) {
      if(r.Expanded&2) r = r.lastChild;
      else {
         while(!r.nextSibling&&r.parentNode!=p) r = r.parentNode;
         r = r.previousSibling; 
         }
      }
   if(r) return r;
   }
if(row.Fixed) return type&4 && row.Fixed=="Foot" ? this.GetLastVisible(null,type&1) : null;
while(1) {
   row = row.parentNode;
   if(row.Page){ 
      if(type&2) return type&4 ? this.GetLastVisible(this.XH) : null;
      row = row.previousSibling;
      while(row && !row.firstChild) row = row.previousSibling; 
      if(!row) return type&4 ? this.GetLastVisible(this.XH) : null;
      row = row.lastChild; r = row;
      }
   else r = row.previousSibling;
   if(r) {
      if(r.Visible) return r;
      
      var p = r.parentNode;
      while(r&&!r.Visible) {
         if(r.Expanded&2) r = r.lastChild;
         else {
            while(!r.nextSibling&&r.parentNode!=p) r = r.parentNode;
            r = r.previousSibling; 
            }
         }
      if(r) return r;
      }
   }
}
ME.ReversedTree;
// -----------------------------------------------------------------------------------------------------------
MS.Navigate;
// -----------------------------------------------------------------------------------------------------------
// Returns [row,fpagepos] - returns previous row shifted about cnt visible rows
TGP.GetPrevShift = function(row,fpagepos,cnt,col,rect){
var ocnt = cnt; if(!row || !row.Page) fpagepos = null;

MS.Space;
if(row && row.Space>=10){
   for(var r=row.previousSibling;r&&cnt>0;r=r.previousSibling){ 
      if(r.Space==row.Space && r.Cells && r.Visible){ row = r; cnt--; }
      }
   return [cnt>0 ? null : row,0];
   }
ME.Space;

MS.Space;
if(!row || cnt!=ocnt || row.Space>=3 && row.Space<=9){
   for(var r=row?row.previousSibling:this.XS.lastChild;r&&cnt>0;r=r.previousSibling){ 
      if(r.Space>=3 && r.Space<=9 && r.Cells && r.Visible){ row = r; cnt--; }
      }
   if(cnt>0) row=null;
   }
ME.Space;
   
if(!row || cnt!=ocnt || row.Fixed=="Foot"){
   for(var r=row?row.previousSibling:this.XF.lastChild;r&&cnt>0;r=r.previousSibling){ 
      if(r.Visible){ row = r; cnt--; }
      }
   if(cnt>0) row=null;
   }
   
MS.Space;
if(!row || cnt!=ocnt || row.Space==2){
   for(var r=row?row.previousSibling:this.XS.lastChild;r&&cnt>0;r=r.previousSibling){ 
      if(r.Space==2 && r.Cells && r.Visible){ row = r; cnt--; }
      }
   if(cnt>0) row=null;
   }
ME.Space;

if((!row || cnt!=ocnt || row.Fixed=="Foot" || !row.Fixed || row.Space>=2) && cnt>0){ 
   if(!row || row.Fixed){
      row = this.AllPages ? this.XB.lastChild : GetNode(this.XB,this.FPage);
      if(row.State==4){ row = this.GetLastVisible(row,1); fpagepos = null; }
      else fpagepos = row.firstChild ? this.GetPagePos(this.GetLastVisible(row,3)) : this.GetPageHeight(row)/this.RowHeight-1;
      if(row) {
         MS.RowSpan; if(this.RowSpan && col) row = this.GetSpanRow(row,col,1); ME.RowSpan;
         cnt--;
         }
      }
   if(row && cnt>0) { 
      while(cnt && row){
         if(row.Page && !this.AllPages){ row = null; fpagepos = null; break; }
         if(row.Page && row.State<4){
            if(row.firstChild){
               if(fpagepos==null) {
                  var r = this.GetLastVisible(row,3);
                  fpagepos = this.GetPagePos(r)+1;
                  }
               else { var r=this.GetPrevVisible(this.PagePosToRow(row,fpagepos),3); }
               for(;r&&cnt;r=this.GetPrevVisible(r,3)){ fpagepos--; cnt--; }
               }
            else {   
               if(fpagepos==null) fpagepos = row.Count;
               if(cnt <= fpagepos){ fpagepos-=cnt; cnt = 0; }
               else cnt-=fpagepos; 
               }
            if(cnt){
               row = row.previousSibling; fpagepos = null;
               if(row) {
                  cnt--;
                  if(row.State==4) row = this.GetLastVisible(row,3);
                  else fpagepos = row.firstChild ? this.GetPagePos(this.GetLastVisible(row,3)) : this.GetPageHeight(row)/this.RowHeight-1;
                  }
               }   
            }
         else if(rect&&row==(row.RowSpan?this.GetSpanRow(rect[0],col):rect[0]) && row!=rect[2]){
            row = rect[2]; cnt--;
            }
         else {
            var r = row.Page ? this.GetLastVisible(row,3) : this.GetPrevVisible(row,3);
            if(r) { 
               MS.RowSpan; if(this.RowSpan && col) r = this.GetSpanRow(r,col,1);   ME.RowSpan;
               row = r; cnt--; 
               }
            else row = this.GetRowPage ? this.GetRowPage(row).previousSibling : null;

            }
         }
      }
   if(cnt>0) row=null; 
   }

MS.Space;
if(!row || cnt!=ocnt || row.Space==1){
   for(var r=row?row.previousSibling:this.XS.lastChild;r&&cnt>0;r=r.previousSibling){ 
      if(r.Space==1 && r.Cells && r.Visible){ row = r; cnt--; }
      }
   if(cnt>0) row=null;
   }
ME.Space;
   
if(!row || cnt!=ocnt || row.Fixed=="Head"){
   for(var r=row?row.previousSibling:this.XH.lastChild;r&&cnt>0;r=r.previousSibling){ 
      if(r.Visible){ row = r; cnt--; }
      }
   if(cnt>0) row=null;
   }

MS.Space;
if(!row || cnt!=ocnt || row.Space<=0){
   for(var r=row?row.previousSibling:this.XS.lastChild;r&&cnt>0;r=r.previousSibling){ 
      if(r.Space<=0 && r.Cells && r.Visible){ row = r; cnt--; }
      }
   if(cnt>0) row=null;
   }
ME.Space;

if(cnt>0) return [null,0];
return [row,fpagepos];
}
// -----------------------------------------------------------------------------------------------------------
// Returns [row,fpagepos] - returns next row shifted about cnt visible rows
TGP.GetNextShift = function(row,fpagepos,cnt,col,rect){
var ocnt = cnt; if(!row || !row.Page) fpagepos = null;

MS.Space;
if(row && row.Space>=10){
   for(var r=row.nextSibling;r&&cnt>0;r=r.nextSibling){ 
      if(r.Space==row.Space && r.Cells && r.Visible){ row = r; cnt--; }
      }
   return [cnt>0 ? null : row,0];
   }
ME.Space;

MS.Space;
if(!row || cnt!=ocnt || row.Space<=0){
   for(var r=row?row.nextSibling:this.XS.firstChild;r&&cnt>0;r=r.nextSibling){ 
      if(r.Space<=0 && r.Cells && r.Visible){ row = r; cnt--; }
      }
   if(cnt>0) row=null;
   }
ME.Space;

if(!row || cnt!=ocnt || row.Fixed=="Head"){
   for(var r=row?row.nextSibling:this.XH.firstChild;r&&cnt>0;r=r.nextSibling){ 
      if(r.Visible){ row = r; cnt--; }
      }
   if(cnt>0) row=null;
   }

MS.Space;
if(!row || cnt!=ocnt || row.Space==1){
   for(var r=row?row.nextSibling:this.XS.firstChild;r&&cnt>0;r=r.nextSibling){ 
      if(r.Space==1 && r.Cells && r.Visible){ row = r; cnt--; }
      }
   if(cnt>0) row=null;
   }
ME.Space;

if((!row || cnt!=ocnt || row.Fixed=="Head" || !row.Fixed || row.Space<=1) && cnt>0){ 
   if(!row || row.Fixed){
      row = this.AllPages ? this.XB.firstChild : GetNode(this.XB,this.FPage);
      if(row.State==4){ row = this.GetFirstVisible(row,1); fpagepos = null; }
      else fpagepos = 0;
      if(row) cnt--;
      }
   if(row && cnt>0) { 
      while(cnt && row){
         if(row.Page && row.State<4){
            if(!this.AllPages){ row = null; fpagepos = null; break; }
            if(fpagepos==null) fpagepos = -1;
            if(row.firstChild){
               var r=fpagepos<0?this.GetFirstVisible(row,1):this.GetNextVisible(this.PagePosToRow(row,fpagepos),3)
               for(;r&&cnt;r=this.GetNextVisible(r,3)){ fpagepos++; cnt--; }
               }
            else {   
               var num = this.GetPageHeight(row)/this.RowHeight;
               if(cnt < num-fpagepos){ fpagepos+=cnt; cnt = 0; }
               else cnt -= num-fpagepos;
               }
            if(cnt) { 
               row = row.nextSibling; fpagepos = null;
               if(row){
                  cnt--;
                  if(row.State==4) row = this.GetFirstVisible(row);
                  else fpagepos = 0; 
                  }
               }   
            }
         else if(rect&&row==(row.RowSpan?this.GetSpanRow(rect[2],col):rect[2]) && row!=rect[0]){
            row = rect[0]; cnt--;
            }
         else {
            MS.RowSpan;
            if(row.RowSpan && col && this.Cols[col].Spanned && (row[col+"RowSpan"]>1||row[col+"RowSpan"]==0)){ 
               for(var r=row.nextSibling;r&&r[col+"RowSpan"]==0;r=r.nextSibling);
               row = r ? r.previousSibling : row.parentNode.lastChild;
               if(!this.ReversedTree) while(row.lastChild) row = row.lastChild; 
               }   
            ME.RowSpan;
            var r = row.Page ? this.GetFirstVisible(row,3) : this.GetNextVisible(row,3);
            if(r) { row = r; cnt--; }
            else row = this.GetRowPage ? this.GetRowPage(row).nextSibling : null;
            }
         }
      }
   if(cnt>0) row=null; 
   }

MS.Space;
if(!row || cnt!=ocnt || row.Space==2){
   for(var r=row?row.nextSibling:this.XS.firstChild;r&&cnt>0;r=r.nextSibling){ 
      if(r.Space==2 && r.Cells && r.Visible){ row = r; cnt--; }
      }
   if(cnt>0) row=null;
   }
ME.Space;

if(!row || cnt!=ocnt || row.Fixed=="Foot"){
   for(var r=row?row.nextSibling:this.XF.firstChild;r&&cnt>0;r=r.nextSibling){ 
      if(r.Visible){ row = r; cnt--; }
      }
   if(cnt>0) row=null;
   }

MS.Space;
if(!row || cnt!=ocnt || row.Space>=3 && row.Space<=9){
   for(var r=row?row.nextSibling:this.XS.firstChild;r&&cnt>0;r=r.nextSibling){ 
      if(r.Space>=3 && r.Space<=9 && r.Cells && r.Visible){ row = r; cnt--; }
      }
   if(cnt>0) row=null;
   }
ME.Space;
   
if(cnt>0) return [null,0];
return [row,fpagepos];
}
// -----------------------------------------------------------------------------------------------------------
ME.Navigate;
// -----------------------------------------------------------------------------------------------------------
// Returns next variable row on the same level
TGP.GetNextSibling = function(row,type){
if(row.Expanded&2 && row.firstChild && !this.ReversedTree) return row.firstChild;
var n = row.nextSibling; 
if(n) {
   if(!(n.Expanded&2)||!this.ReversedTree) return n;
   while(n.Expanded&2 && n.firstChild) n = n.firstChild;
   return n;
   }
var l = row.Level;
while(1){
   row = row.parentNode;
   if(!row) return null;
   if(row.Expanded&2){
      if(this.ReversedTree) return row;
      while(row.Expanded&2) {
         if(row.nextSibling) return row.nextSibling;
         row = row.parentNode;
         }
      }
   if(row.Page?type&2:!(type&4)) return null;
   while(row.nextSibling){
      row = row.nextSibling;
      if(row.firstChild && (row.Expanded||!(type&1))) {
         row = row.firstChild;
         if(row.Level==l) return row;
         }
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
// Returns previous variable row on the same level
TGP.GetPrevSibling = function(row,type){
if(row.Expanded&2 && row.lastChild && this.ReversedTree) return row.lastChild;
var n = row.previousSibling; 
if(n) {
   if(!(n.Expanded&2)||this.ReversedTree) return n;
   while(n.Expanded&2 && n.lastChild) n = n.lastChild;
   return n;
   }
var l = row.Level;
while(1){
   row = row.parentNode;
   if(!row) return null;
   if(row.Expanded&2){
      if(!this.ReversedTree) return row;
      while(row.Expanded&2) {
         if(row.previousSibling) return row.previousSibling;
         row = row.parentNode;
         }
      }
   if(row.Page?type&2:!(type&4)) return null;
   while(row.previousSibling){
      row = row.previousSibling;
      if(row.lastChild && (row.Expanded||!(type&1))) {
         row = row.lastChild;
         if(row.Level==l) return row;
         }
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
// Returns next visible variable row on the same level, now used only for root rows (for paging)
TGP.GetNextSiblingVisible = function(row,type){
do { row = this.GetNextSibling(row,type);   } while(row && !row.Visible);
return row;
}
// -----------------------------------------------------------------------------------------------------------
// Returns previous visible variable row on the same level, now used only for root rows (for paging)
TGP.GetPrevSiblingVisible = function(row,type){
do { row = this.GetPrevSibling(row,type);   } while(row && !row.Visible);
return row;
}
// -----------------------------------------------------------------------------------------------------------

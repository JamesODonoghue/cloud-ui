// -----------------------------------------------------------------------------------------------------------
// Calculation functions
// -----------------------------------------------------------------------------------------------------------
MS.Calc;
// -----------------------------------------------------------------------------------------------------------
// Simplified version of aggsum() for sum and count without conditions, about for 25% faster
TCalc.prototype.simplesub = function(row,col,cc,func){
if(row.State<2) return func==2&&row[cc]==null ? row.Count-0 : row[cc]-0;
var res = 0;
if(row.firstChild&&row.firstChild.SPage){
   if(row[cc+"0"]!=null){
      for(var r=row.firstChild,pos=0;r;r=r.nextSibling,pos++) res += r.State>=2 ? this.simplesub(r,col,cc,func) : row[cc+pos];
      }
   else {
      res = func==2&&row[cc]==null ? row.Count-0 : row[cc]-0;
      for(var r=row.firstChild;r;r=r.nextSibling) if(r.State>=2) res += this.simplesub(r,col,cc,func) - (func==2&&r[cc]==null ? r.Count-0 : r[cc]-0);
      }
   }
else for(var r=row.firstChild;r;r=r.nextSibling) if(!r.Deleted && !r.Filtered){ 
   var aggch = r.AggChildren; if(aggch==null) aggch = r.Def.AggChildren;
   if(!aggch) {
      if(func==2) res++; 
      else {
         var a = r[col]; if(a==null && r.Def) a = r.Def[col]; 
         a -= 0; if(a) res += a; 
         }
      }
   else res += r.State<2 ? r[cc]-0 : this.simplesub(r,col,cc,func);
   }
return res;   
}
// -----------------------------------------------------------------------------------------------------------
// Simplified version of agg() for sum and calc without conditions, about for 25% faster
var CAggStart = [0,0,0,0,-Infinity,Infinity,0,1,0,0,"","",null,""];
var CAggFunc = ["","sum","count","calc","max","min","sumsq","product","counta","countblank","sumrange","sumjoin","joinsum","join"];
TCalc.prototype.simpleagg = function(col,func){
if(!col) col = this.Col;
var cc = col+CAggFunc[func], row = this.Row;
if(row.Fixed) {
   var res = 0;
   for(var b=this.Grid.XB.firstChild;b;b=b.nextSibling) res += this.simplesub(b,col,cc,func);
   return res;
   }
return this.simplesub(row,col,cc,func);
}
// -----------------------------------------------------------------------------------------------------------
// Sums specified children, calls agg or simpleagg
TCalc.prototype.sum = function(col,cond,type,server){ 

return (cond||type||col&&!this.Grid.Cols[col])&&this.agg ? this.agg(col,cond,type,server,1) : this.simpleagg(col,1);
}
// -----------------------------------------------------------------------------------------------------------
// Counts specified children, calls agg or simpleagg
TCalc.prototype.count = function(col,cond,type,server){ 
return (cond||type||col&&!this.Grid.Cols[col])&&this.agg ? this.agg(col,cond,type,server,2) : this.simpleagg(col,2);
}
// -----------------------------------------------------------------------------------------------------------
MS.CalcAgg;
// -----------------------------------------------------------------------------------------------------------
// Support function for agg, recursive
TCalc.prototype.aggsub = function(row,col,f,type,cc,func){
if(row.State==0 || row.State==1) {
   if(row[cc]==null) return;
   a = row[cc]-0;
   if(func==3){ this.Row = row; this.Result = a; this.Result = f(this); } 
   else if(func==4){ if(a>this.Result) this.Result = a; } 
   else if(func==5){ if(a<this.Result) this.Result = a; } 
   else if(func==7) { if(a||a===0) this.Result *= a; } 
   else this.Result += a; 
   return;
   }
if(row.firstChild&&row.firstChild.SPage){
   if(row[cc+"0"]!=null){
      for(var r=row.firstChild,pos=0;r;r=r.nextSibling,pos++) {
         if(r.State>=2) { this.aggsub(r,col,f,type,cc,func); continue; }
         a = row[cc+pos]-0;
         if(func==3){ this.Row = r; this.Result = a; this.Result = f(this); } 
         else if(func==4){ if(a>this.Result) this.Result = a; } 
         else if(func==5){ if(a<this.Result) this.Result = a; } 
         else if(func==7) { if(a||a===0) this.Result *= a; } 
         else this.Result += a; 
         }
      }
   else { 
      if(func==7) this.Result *= row[cc]; else this.Result += func==2&&row[cc]==null ? row.Count-0 : row[cc]-0;
      for(var r=row.firstChild;r;r=r.nextSibling) if(r.State>=2) {
         this.aggsub(r,col,f,type,cc,func);
         if(func==7) this.Result /= r[cc]; 
         else this.Result -= func==2&&r[cc]==null ? r.Count-0 : r[cc]-0;
         }
      }
   return;
   }
var aggch = 0, doagg = !(type&16), a, and = this.Grid.SelAnd;
for(var r=row.firstChild;r;r=r.nextSibling) if((!r.Deleted||type&2) && (!r.Filtered||type&1)){ 
   if(doagg) { aggch = r.AggChildren; if(aggch==null) aggch = r.Def.AggChildren; }
   if(!aggch && (r.Selected&and||!(type&8))) {
      if(func==3){ this.Row = r; this.Result = f(this); } 
      else if(!f || (this.Row = r, f(this))){
         if(func==2) this.Result++; 
         else {
            a = r[col]; if(a==null && r.Def) a = r.Def[col]; 
            if(func==1) { a -= 0; if(a) this.Result += a; } 
            else if(func==4){ if(a!=="" && a>this.Result) this.Result = a-0; } 
            else if(func==5){ if(a!=="" && a<this.Result) this.Result = a-0; } 
            else if(func==6) { a = a*a; if(a) this.Result += a; } 
            else if(func==7) { a -= 0; if(a||a===0) this.Result *= a; } 
            else if(func==8){ if(a!==""&&a!=null) this.Result++; } 
            else if(func==9){ if(a===""||a==null) this.Result++; } 
            else if(func==10){ if(a!==""&&a!=null) this.Result += a + this.Grid.Lang.Format.ValueSeparator; } 
            else if(func==11) {   
               if(a) { 
                  a -= 0; if(!a) { this.Result = null; return; } 
                  if(this.Result) this.Result += a; 
                  else this.Result = a;
                  }
               } 
            else if(func==12){ if(a) this.aggjoin(a); }
            else if(func==13){
               if(this.Result) this.Result += this.Grid.Lang.Format.ValueSeparator + a; 
               else this.Result = a+"";
               }
            }
         }
      }
   if(aggch || type&4) this.aggsub(r,col,f,type,cc,func);
   }
}
// -----------------------------------------------------------------------------------------------------------
// Provides aggregate calculations for given column
TCalc.prototype.agg = function(col,cond,type,server,func){
if(Try){
   var G = this.Grid;
   if(!col) col = this.Col;
   else if(!G.Cols[col]) { server = type; type = cond; cond = col; col = this.Col; } 
   if(cond-0) { server = type; type = cond; cond = ""; } 
   if(type!=null && type-0+""!=type) { server = type; type = 0; } 
   var cc = server!=null ? CAggFunc[func]+server : col+CAggFunc[func], row = this.Row;
   if(row.State<2) return row[cc]-0;
   if(cond) {   
      var f = G.Formulas[cond];
      if(!f){
         
         f = G.ConvertFormula(cond);
         G.Formulas[cond] = f;
         }
      }   
   else if(func==3) return 0;   
   this.Result = func==12 ? {} : CAggStart[func];
   if(this.Row.Fixed) for(var r=G.XB.firstChild;r;r=r.nextSibling) this.aggsub(r,col,f,type,cc,func);
   else this.aggsub(row,col,f,type,cc,func);
   this.Row = row; 
   if(func>=11){
      if(func==11 && this.Result==null) return this.agg(col,cond,type,server,12);
      else if(func==12){
         var A = [];
         for(var n in this.Result) A[A.length] = this.Result[n]>1 ? this.Result[n]+"x "+n : n;
         return A.join(G.Lang.Format.ValueSeparator+" ");
         }
      }
   return this.Result;
   }
else if(Catch){ return null; }
}
// -----------------------------------------------------------------------------------------------------------
TCalc.prototype.aggjoin = function(a){
a = (a+"").split(this.Grid.Lang.Format.ValueSeparator);
for(var j=0;j<a.length;j++){   
   if(a[j].indexOf("x ") && a[j].search(/^\s*\d+x\s/)>=0){
      var idx = a[j].indexOf("x "), n = a[j].slice(idx+2), cnt = a[j].slice(0,idx)-0;
      if(this.Result[n]) this.Result[n] += cnt;
      else this.Result[n] = cnt;
      }
   else if(a[j].indexOf(" ")==0){
      a[j] = a[j].replace(/^\s+/,"");
      if(this.Result[a[j]]) this.Result[a[j]]++;
      else this.Result[a[j]] = 1;
      }
   else if(this.Result[a[j]]) this.Result[a[j]]++;
   else this.Result[a[j]] = 1;
   }
}
// -----------------------------------------------------------------------------------------------------------
// Individual aggregate functions, call agg

TCalc.prototype.calc = function(cond,type,server){ return this.agg(this.Col,cond,type,server,3); }
TCalc.prototype.max = function(col,cond,type,server){ var max = this.agg(col,cond,type,server,4); return isFinite(max)?max:""; }
TCalc.prototype.min = function(col,cond,type,server){ var min = this.agg(col,cond,type,server,5); return isFinite(min)?min:"" }
TCalc.prototype.sumsq = function(col,cond,type,server){ return this.agg(col,cond,type,server,6); }
TCalc.prototype.product = function(col,cond,type,server){ return this.agg(col,cond,type,server,7); }
TCalc.prototype.counta = function(col,cond,type,server){ return this.agg(col,cond,type,server,8); }
TCalc.prototype.countblank = function(col,cond,type,server){ return this.agg(col,cond,type,server,9); }
TCalc.prototype.sumrange = function(col,cond,type,server,gantt){ 
   var ret = this.agg(col,cond,type,server,10); 
   if(gantt==2 || gantt!=0 && (ret+"").indexOf(this.Grid.Lang.Format.RepeatSeparator)>=0) return ret; 
   return this.Grid.UpdateDateRange(ret,gantt?this.Grid.Cols[this.Grid.GetFirstGantt()]:null,1);
   }
TCalc.prototype.sumparts = function(col,cond,type,server){ return this.sumrange(col,cond,type,server,1); }
TCalc.prototype.sumavailability = function(col,cond,type,server){ return this.sumrange(col,cond,type,server,2); }
TCalc.prototype.sumflow = TCalc.prototype.sumparts; 
TCalc.prototype.sumjoin = function(col,cond,type,server){ return this.agg(col,cond,type,server,11); }
TCalc.prototype.joinsum = function(col,cond,type,server){ return this.agg(col,cond,type,server,12); }
TCalc.prototype.join = function(col,cond,type,server){ return this.agg(col,cond,type,server,13); }
// -----------------------------------------------------------------------------------------------------------
// For backward compatibility
TCalc.prototype.calcif = function(col,cond,ecol,func){ 
if(!cond){  
   if(!col) return null;
   cond = col;
   col = this.Col;
   }
if(!ecol) ecol = col;
var c = cond.charAt(0); if(c=='=' || c=='>' || c=='<' || c=='!'&&cond.charAt(1)=='=') cond = col+cond;
return this.agg(ecol,cond,0,"",func);
}
TCalc.prototype.sumif = function(col,cond,ecol){ return this.calcif(col,cond,ecol,1); }
TCalc.prototype.countif = function(col,cond,ecol){ return this.calcif(col,cond,ecol,2); }
TCalc.prototype.countrows = function(type,def){ return this.agg("",def?"Row.Def.Name=='"+def+"'":"",type,"",2); }
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Support function for GetChildren, adds to array ch all or specified children of the row
TGP.AddChildren = function(row,ch,type,def){
if(row.State==0 || row.State==1) ch[ch.length] = row;
else for(var r=row.firstChild,and=this.SelAnd;r;r=r.nextSibling) if((!r.Deleted||type&2) && (!r.Filtered||type&1)){ 
   if(Get(r,"AggChildren")&&!(type&16)) this.AddChildren(r,ch,type,def);
   else {
      if(r.Selected&and || !(type&8) && (!def||r.Def.Name==def)) ch[ch.length] = r;
      if(type&4) this.AddChildren(r,ch,type,def);
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
// Return children of the row. For space or fixed row returns all root rows
TCalc.prototype.GetChildren = function(type,def){
var n = "Children"+(type?type:"")+(def?def:"");
var A = this.Children[n];
if(A) return A;
A = [];
if(this.Row.Fixed){
   for(var B=this.Grid.XB.firstChild;B;B=B.nextSibling) this.Grid.AddChildren(B,A,type,def);
   }
else this.Grid.AddChildren(this.Row,A,type,def);
this.Children[n] = A;
return A;   
}
// -----------------------------------------------------------------------------------------------------------
// Returns maximum of the arguments
TCalc.prototype.maximum = function(){
for(var i=0,max=-Infinity;i<arguments.length;i++){
   var val = arguments[i];
     if(val-0+""==val && val>max) max = val; 
   }
return isFinite(max)?max:"";
}
// -----------------------------------------------------------------------------------------------------------
// Returns minimum of the arguments
TCalc.prototype.minimum = function(){
for(var i=0,min=Infinity;i<arguments.length;i++){
   var val = arguments[i];
     if(val-0+""==val && val<min) min = val; 
   }
return isFinite(min)?min:"";
}
// -----------------------------------------------------------------------------------------------------------
// Returns average of the children in the column
TCalc.prototype.average = function(col){
var cnt = this.count(col);
return cnt ? this.sum(col) / cnt : 0;
}
// -----------------------------------------------------------------------------------------------------------
// Value on given rank in sorted array, parameters: range, pos
TCalc.prototype.rank = function(col,num,type){
var A = this.GetChildren(type);
if(!col) col = this.Col;
A.sort(function(a,b){ return Get(a,col)<Get(b,col) ? -1 : 1; });
for(var i=0;i<A.length;i++) if(Get(A[i],col)>=num) return i;
return A.length;
}
// -----------------------------------------------------------------------------------------------------------
// Calculates median - middle value in sorted array, if count of values is even, returns average of middle values
TCalc.prototype.median = function(col,type){
var A = this.GetChildren(type);
if(!col) col = this.Col;
A.sort(function(a,b){return Get(a,col)<Get(b,col) ? -1 : 1; });
var cnt2 = Math.floor(A.length/2);
if(cnt2 == A.length/2) return (Get(A[cnt2],col) + Get(A[cnt2-1],col))/2; 
else return Get(A[cnt2],col);
}
// -----------------------------------------------------------------------------------------------------------
// Modus - most common value
TCalc.prototype.mode = function(col,type){
var A = this.GetChildren(type), B = {}, val, i;
if(!col) col = this.Col;
for(i in A){
   val = Get(A[i],col);
   if(!B[val]) B[val] = 1;
   else B[val]++;
   }
var max = 0, cnt = 0;
for(i in B){
   if(B[i]>cnt){ max = i; cnt = B[i]; }
   }
return max;
}
// -----------------------------------------------------------------------------------------------------------
// Average deviation
TCalc.prototype.avedev = function(col,type){ 
var A = this.GetChildren(type), avg = 0, i;
if(!col) col = this.Col;
for(i in A) avg+=Get(A[i],col);
avg/=A.length;
var sum = 0;
for(i in A) sum+=Math.abs(avg-Get(A[i],col));
return sum/A.length;
}
// -----------------------------------------------------------------------------------------------------------
// Standard deviations from given values
// p = 0 - stdev, 1 - stdevp, 2 - vara, 3 - varp
TCalc.prototype.StdevVar = function(col,p,type){ 
var A = this.GetChildren(type), s = 0, sq = 0, i, val;
if(!col) col = this.Col;
for(i in A){ val = Get(A[i],col); s+=val; sq+=val*val; }
val = (A.length*sq - s*s)/A.length/(A.length-(p==1 || p==3 ? 1 : 0));
if(p==0 || p==1) return Math.sqrt(val);
else return val;
}
// -----------------------------------------------------------------------------------------------------------
TCalc.prototype.stdev = function(col,type){ return this.StdevVar(col,0,type); }
TCalc.prototype.stdevp = function(col,type){ return this.StdevVar(col,1,type); }
TCalc.prototype.vara = function(col,type){ return this.StdevVar(col,2,type); }
TCalc.prototype.varp = function(col,type){ return this.StdevVar(col,3,type); }
// -----------------------------------------------------------------------------------------------------------
ME.CalcAgg;

// -----------------------------------------------------------------------------------------------------------
// Choosed and returns value from items or from Defaults
MS.Group$Search;
TCalc.prototype.choose = function(val,values,items,custom,row,col){
var add=0,sub=0; if(!row) row = this.Row; if(!col) col = this.Col;
if(!items){
   add=1;
   items = Get(row,col+"Defaults");
   if(items) items = items.split(items.charAt(0));
   }
else if(typeof(items)=="string") items = items.split(',');
if(!values){
   sub=1;
   values = Get(row,col+"Defaults");
   if(values) values = values.split(values.charAt(0));
   }
else if(typeof(values)=="string") values = values.split(',');
if(val==null) val = Get(row,col);
if(val==null) val = ""; 
var len = values?values.length : (items?items.length:0);
for(var i=sub;i<len;i++) if(values?val==values[i]:val==i) return items?items[i+add-sub]:i;
if(custom==null) custom = Get(row,col+"Custom");
if(this.Trans) custom = this.Translate(row,col,custom);
return custom;

}
TGP.Actionchoose = TCalc.prototype.choose; 
// -----------------------------------------------------------------------------------------------------------
TCalc.prototype.split = function(val,sep,row,col){
if(val==null) val = Get(row?row:this.Row,col?col:this.Col);
val += "";
if(sep) return val.split(sep);
val = val.split(val.charAt(0));
val.shift();
return val;
}
ME.Group$Search;
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
ME.Calc;

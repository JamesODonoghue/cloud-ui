MS.Chart;
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
var LineCharts = [], TGLineCharts = []; if(window["LineCharts"]==null) window["LineCharts"] = LineCharts;                  
// -----------------------------------------------------------------------------------------------------------
var TLineChart = {                

   Class : "GMChart",

   Default: {                     
   
      Visible : 1,                
      Sort : 1,                   
      Interpolation : 3,          
      Width : 2,                  
      Color : "black",            
   
      PointType : 1,              
      
      _nope:0 }
   }

// -----------------------------------------------------------------------------------------------------------
function ShowLineChart(M,tag){
if(!M) M = { };
else M = FromJSON(M);
if(!M.Lines || !M.Lines.length) return;
if(typeof(tag)=="string") tag = document.getElementById(tag);

if(window.Grids && Grids.LastStyle && !M.Class) M.Class = Grids.LastStyle + "Chart";
for(var i in TLineChart) if(M[i]==null) M[i] = TLineChart[i];
for(var i in TLineChart.Default) if(M.Default[i]==null) M.Default[i] = TLineChart.Default[i];
var ml = M.Lines.length, ML = M.Lines;
for(var i=0;i<ml;i++) M.InitLine(i);
LineCharts.Add(M);

var H = M.Height; 
if(!H && tag) {
   H = tag.offsetHeight; 
   if(!H) H = parseInt(GetStyle(tag).height); 
   H -= GetBorderWidth(GetStyle(tag));
   }
var W = M.Width; 
if(!W && tag) {
   W = tag.offsetWidth; 
   if(!W) W = parseInt(GetStyle(tag).width);
   W -= GetBorderHeight(GetStyle(tag));
   }
if(!H || !W) return; 
if(!M.Top) M.Top = 0;
if(!M.Left) M.Left = 0;
if(!M.Bottom) M.Bottom = 0;
if(!M.Right) M.Right = 0;
H -= M.Bottom+M.Top; W -= M.Left+M.Right;
M.AHeight = H; M.AWidth = W;

var Y1 = M.MinY, Y2 = M.MaxY, ry = M.ChartRoundY, ay = M.ChartAddY;
if(Y1==null) { Y1 = 1e12; for(var i=0;i<ml;i++) { var Y = ML[i].AY, cnt = ML[i].ACount; if(Y) for(var j=0;j<cnt;j++) if(Y[j]<Y1) Y1 = Y[j]; } }
if(Y2==null) { Y2 = -1e12; for(var i=0;i<ml;i++) { var Y = ML[i].AY, cnt = ML[i].ACount; if(Y) for(var j=0;j<cnt;j++) if(Y[j]>Y2) Y2 = Y[j]; } }
if(Y1==1e12 || Y2==-1e12) return; 
var ylen = Y2-Y1;
if(M.MinY==null) {
   if(ry) { if(Y1%ry) Y1 = Y1-Y1%ry+(Y1<0?-ry:0); }
   else if(ay==null) Y1 -= ylen/10; 
   if(ay) Y1 -= ay;
   }
if(M.MaxY==null) {
   if(ry) { if(Y2%ry) Y2 = Y2-Y2%ry+(Y2<0?0:ry); }
   else if(ay==null) Y2 += ylen/10; 
   if(ay) Y2 += ay;
   }
M.AMinY = Y1; M.AMaxY = Y2;

var X1 = M.MinX, X2 = M.MaxX, rx = M.ChartRoundX, ax = M.ChartAddX;
if(X1==null) { X1 = 1e12; for(var i=0;i<ml;i++) { var X = ML[i].AX, cnt = ML[i].ACount; if(X) for(var j=0;j<cnt;j++) if(X[j]<X1) X1 = X[j]; } }
if(X2==null) { X2 = -1e12; for(var i=0;i<ml;i++) { var X = ML[i].AX, cnt = ML[i].ACount; if(X) for(var j=0;j<cnt;j++) if(X[j]>X2) X2 = X[j]; } }
if(X1==1e12 || X2==-1e12) return; 
var xlen = X2-X1;
if(M.MinX==null) {
   if(rx) { if(X1%rx) X1 = X1-X1%rx+(X1<0?-rx:0); }
   if(ax==null) X1 -= xlen/W*10; 
   else if(ax) X1 -= ax;
   }
if(M.MaxX==null) {
   if(rx) { if(X2%rx) X2 = X2-X2%rx+(X2<0?0:rx); }
   if(ax==null) X2 += xlen/W*10; 
   else if(ax) X2 += ax;
   }

M.AMinX = X1; M.AMaxX = X2;

M.UnitsY  = H / (Y2-Y1); M.PlusY = -Math.round(Y1*M.UnitsY)-M.Top;
M.UnitsX = W / (X2-X1); M.PlusX = -Math.round(X1*M.UnitsX)+M.Left;

var A = [], p = 0, U = M.Height;
A[p++] = "<div class='"+M.Class+"Inner'><div style='overflow:hidden;width:"+M.Width+"px;height:"+U+"px;'>";

A[p++] = "<div class='"+M.Class+"Layer' style='height:"+U+"px;margin-bottom:-"+U+"px;'>"+M.GetAxisHTML()+"</div>";

for(var i=0;i<ml;i++) {
   A[p++] = "<div class='"+M.Class+"Layer' style='height:"+U+"px;margin-bottom:-"+U+"px;'>";
   A[p++] = M.GetLineHTML(i);
   A[p++] = "</div>";
   }

if(M.Caption) A[p++] = "<div class='"+M.Class+"Layer' style='height:"+U+"px;margin-bottom:-"+U+"px;'><div class='"+M.Class+"Caption'>"+M.Caption+"</div></div>";

A[p++] = "</div></div>"; 
if(!tag) return A.join("");
M.Tag = tag;  
tag.innerHTML = A.join("");
}
var TGShowLineChart = ShowLineChart; if(window["ShowLineChart"]==null) window["ShowLineChart"] = ShowLineChart; 
// -----------------------------------------------------------------------------------------------------------
TLineChart.InitLine = function(index){
if(!index) index = 0;
var L = this.Lines[index];
for(var i in this.Default) if(L[i]==null) L[i] = this.Default[i];
var Y = [], X = [];
var YY = L.Y, XX = L.X, Z = [];
if(!XX&&!YY) return false;
if(!XX) { for(var i=0,p=0,lyy=YY.length;i<lyy;i++) if(YY[i]-0||YY[i]===0) Z[p++] = { x:i, y:YY[i] }; }
else if(!YY) { for(var i=0,p=0,lxx=XX.length;i<lxx;i++) if(XX[i]-0||XX[i]===0) Z[p++] = { x:XX[i], y:i }; }
else { for(var i=0,p=0,lyy=YY.length;i<lyy;i++) if((YY[i]-0||YY[i]===0)&&(XX[i]-0||XX[i]===0)) Z[p++] = { x:XX[i], y:YY[i] }; }
if(L.Sort==1) Z.sort(function(a,b){ return a.x==b.x ? a.y-b.y : a.x-b.x; });
else if(L.Sort==2) Z.sort(function(a,b){ return a.y==b.y ? a.x-b.x : a.y-b.y; });
for(var i=0,p=0,lzz=Z.length;i<lzz;i++)  { X[p] = Z[i].x; Y[p++] = Z[i].y; }
L.AX = X; L.AY = Y; L.ACount = p;
if(!lzz) return false;
if(p>1) {
   if(L.Connect) {
      X[-1] = L.Sort==1 ? X[0]*2-X[1] : X[p-1];
      Y[-1] = L.Sort==2 ? Y[0]*2-Y[1] : Y[p-1];
      X[p] = L.Sort==1 ? X[p-1]*2-X[p-2] : X[0];
      Y[p] = L.Sort==2 ? Y[p-1]*2-Y[p-2] : Y[0];
      if(!L.Sort) {
         p++;
         X[p] = L.Sort==1 ? X[p-1]*2-X[p-2] : X[1];
         Y[p] = L.Sort==2 ? Y[p-1]*2-Y[p-2] : Y[1];
         }
      }
   else {   
      var px = L.Sort==1 ? X[1]-X[0] : 0;
      var py = L.Sort==2 ? Y[1]-Y[0] : 0;
      X[-1] = X[0]-px;
      X[p] = X[p-1]+px;
      Y[-1] = Y[0]-py;
      Y[p] = Y[p-1]+py;
      }
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
TLineChart.GetLineHTML = function(index){
if(!index) index = 0;
var L = this.Lines[index], X = L.AX, Y = L.AY;
if(!Y||!Y.length||!L.Visible) return;
var cnt = L.ACount-1, A = [], p = 0, tag = this.Tag, mar = "margin-left:", U = this.Height;


var H = this.AHeight-U, unitsy = this.UnitsY, plusy = this.PlusY;
var W = this.AWidth, unitsx = this.UnitsX, plusx = this.PlusX;

A[p++] = "<div style='height:"+U+"px;'></div>";

if(L.Interpolation && L.Width && cnt) {
   var s1 = "<div style='overflow:hidden;background-color:"+L.Color+";";
   var s2 = L.Color2 ? "<div style='overflow:hidden;background-color:"+L.Color2+";" : s1;
   var tension = 3-L.Interpolation; 
   var hermite = L.Interpolation!=1, ly = null, lx = null, lh = null, ldy = null, w = L.Width-1, dw = Math.floor(w/2), sort = L.Sort;
   for(var i=0;i<cnt;i++){
      var x1 = Math.round(X[i]*unitsx), x2 = Math.round(X[i+1]*unitsx), y1 = Math.round(Y[i]*unitsy), y2 = Math.round(Y[i+1]*unitsy);
      var a, dir = 0, p0 = i-1, p3 = i+2;
      
      if(sort==2 || !sort && Math.abs(x3-x0) < Math.abs(y3-y0)){ a = x2; x2 = y2; y2 = a; a = x1; x1 = y1; y1 = a; dir = 1; } 
      if(x2<x1){ a = x2; x2 = x1; x1 = a; a = y2; y2 = y1; y1 = a; p0 = i+2; p3 = i-1; }
      if(hermite){
         var x0 = Math.round(X[p0]*unitsx), x3 = Math.round(X[p3]*unitsx), y0 = Math.round(Y[p0]*unitsy), y3 = Math.round(Y[p3]*unitsy);
         if(dir){ a = x0; x0 = y0; y0 = a; a = x3; x3 = y3; y3 = a; } 
         var nmul = 2;
         var x10 = x1<x0 ? (x0-x1)*nmul : x1-x0, x21 = x2<x1 ? (x1-x2)*nmul : x2-x1, x32 = x3<x2 ? (x2-x3)*nmul : x3-x2;
         var x210 = Math.abs(x2-x1) + Math.abs(x1-x0);
         var x321 = Math.abs(x3-x2) + Math.abs(x2-x1);
         var t1 = ((y1-y0)*x10/x210+(y2-y1)*x21/x210) * (1-tension);
         var t2 = ((y2-y1)*x21/x321+(y3-y2)*x32/x321) * (1-tension);
         }
      for(var x=x1,ly=y1,lx=x1;x<=x2;x++){
         var mu = (x-x1)/(x2-x1);
         if(hermite){
            var mu2 = mu * mu, mu3 = mu2 * mu; 
            y = Math.round((mu3*2-mu2*3+1)*y1 + (mu3-mu2*2+mu)*t1 + (mu3-mu2)*t2 + (mu2*3-mu3*2)*y2);
            }
         else y = Math.round(y1*(1-mu)+y2*mu);
         if(y==ly&&x!=x2) continue; 
         var h,yy,s;
         if(x1==x2) { y = y2; lx = x-1; }
         if(ly>y){ h = ly-y; yy = y; s = s1; }
         else { h = y-ly; yy = ly; s = x==x2?s1:s2; }
         if(h<1) h = 1; 
         if(dir) A[p++] = s+mar+(yy+plusx-dw)+"px;width:"+(h+w)+"px;height:"+(x-lx+w)+"px;margin-bottom:"+(lx+plusy-dw-H)+"px;margin-top:"+(H-x-plusy+dw-w)+"px;'></div>";
         else A[p++] = s+mar+(lx+plusx-dw)+"px;width:"+(x-lx+w)+"px;height:"+(h+w)+"px;margin-bottom:"+(yy+plusy-dw-H)+"px;margin-top:"+(H-yy-h-plusy+dw-w)+"px;'></div>";
         ly = y; lx = x;
         }
      }
   }   

if(L.PointType) {
   
   var s = "<div class='"+this.Class+"Point "+this.Class+"Point"+L.PointType+"' style='"+mar;
   
   var h = 32; 
   for(var i=0;i<=cnt;i++){
      var y = Math.round(Y[i]*unitsy)+plusy-h/2;
      A[p++] = s+(Math.round(X[i]*unitsx)+plusx-h/2)+"px;margin-bottom:"+(y-H)+"px;margin-top:"+(H-y-h)+"px;'></div>";
      }
   }

return A.join("");   
}
// -----------------------------------------------------------------------------------------------------------
TLineChart.GetAxisHTML = function(){
var A = [], p = 0, U = this.Height;
A[p++] = "<div style='height:"+U+"px;'></div>";
var H = this.AHeight, W = this.AWidth, cls = "<div class='"+this.Class+"Axis", mar = "margin-left:";


var ay = this.AxisY;
if(ay) {
   while(ay*this.UnitsY<6) ay*=2;
   var y = this.AMinY;
   var s1 = cls+"Y' style='width:"+W+"px;"+mar+this.Left+"px;margin-bottom:";
   y = y-y%ay+(y<0?0:ay);
   while(y<this.AMaxY){
      var yy = Math.round(y*this.UnitsY)+this.PlusY;
      A[p++] = s1+(U-H+yy)+"px;margin-top:"+(H-yy-U-1)+"px'></div>";
      y += ay;
      }   
   }

var ax = this.AxisX;
if(ax) {
   while(ax*this.UnitsX<6) ax*=2;
   var x = this.AMinX;
   var s1 = cls+"X' style='margin-top:"+(this.Top-U)+"px;margin-bottom:";
   x = x-x%ax+(x<0?0:ax);
   while(x<this.AMaxX){
      var xx = Math.round(x*this.UnitsX)+this.PlusX;
      A[p++] = s1+(U-H-this.Top)+"px;"+mar+xx+"px;height:"+H+"px;'></div>";
      x += ax;
      }   
   }

var ay = this.LabelY;
if(ay) {
   while(ay*this.UnitsY<10) ay*=10;
   var y = this.AMinY, frm = this.LabelYFormat;
   var s2 = cls+"YLabel' style='height:41px;width:"+this.Left+"px;margin-bottom:", s3 = "px'>"+cls+"YText'>";
   y = y-y%ay+(y<0?0:ay);
   while(y<this.AMaxY){
      var yy = Math.round(y*this.UnitsY)+this.PlusY;
      var txt = Formats.NumberToString(y,frm);
      if(txt&&this.Left) A[p++] = s2+(U-20-H+yy)+"px;margin-top:"+(H-yy-U-21)+s3+txt+"</div></div>";
      y += ay;
      }   
   }

var ax = this.LabelX;
if(ax) {
   while(ax*this.UnitsX<6) ax*=2;
   var x = this.AMinX, frm = this.LabelXFormat;
   var s2 = cls+"XLabel' style='height:"+this.Bottom+"px;width:101px;", s3 = "px;'>"+cls+"XText'>"
   x = x-x%ax+(x<0?0:ax);
   while(x<this.AMaxX){
      var xx = Math.round(x*this.UnitsX)+this.PlusX;
      var txt = Formats.NumberToString(x,frm);
      if(txt&&this.Bottom) A[p++] = s2+"margin-bottom:"+(U-H-this.Bottom-this.Top)+"px;margin-top:"+(H-U+this.Top)+"px;"+mar+(xx-50)+s3+txt+"</div></div>";
      x += ax;
      }   
   }

return A.join("");   
}
// -----------------------------------------------------------------------------------------------------------
LineCharts.Add = function(M){
if(M.Index!=null || M.id!=null && LineCharts[M.id]) return;
if(M.id-0||M.id=="0") M.Index = M.id-0;
else {   
   for(M.Index=0;LineCharts[M.Index];M.Index++);
   if(M.id) LineCharts[M.id] = M;
   }
LineCharts[M.Index] = M;

M.This = "TGLineCharts["+M.Index+"]";

}
// -----------------------------------------------------------------------------------------------------------
LineCharts.Delete = function(M){

if(M.id) delete LineCharts[M.id];
delete LineCharts[M.Index];
M.Index = null;
while(LineCharts.length && !LineCharts[LineCharts.length-1]) LineCharts.length--; 
}

// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
ME.Chart;

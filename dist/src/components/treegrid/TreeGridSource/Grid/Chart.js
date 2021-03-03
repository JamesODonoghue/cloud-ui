// ----------------------------------------------------------------------------------------------------------
// Line chart
// ----------------------------------------------------------------------------------------------------------
MS.Chart;
// ----------------------------------------------------------------------------------------------------------
TGP.GetChartPoints = function(par,col){
var X = [], p=0;
if(par) { for(var r=par.firstChild;r;r=r.nextSibling) if(r.Visible&&!r.Deleted) X[p++] = Get(r,col); }
else for(var b=this.XB.firstChild;b;b=b.nextSibling) for(var r=b.firstChild;r;r=r.nextSibling) if(r.Visible&&!r.Deleted) X[p++] = Get(r,col);
return X;
}
// ----------------------------------------------------------------------------------------------------------
TGP.GetChartHTML = function(row,col){
var val = CNBSP;
var M = Get(row,col+"Chart");
if(M) M = FromJSON(M);
else M = { };
if(M.id==null) M.id = row.id+"_"+col;
if(!this.Charts) this.Charts = {};
if(this.Charts[M.id]) M = this.Charts[M.id]; 
M.Width = Get(row,col+"Width"); if((!M.Width||Get(row,col+"RelWidth")) && row.r1) M.Width = this.GetCell(row,col).offsetWidth;
M.Height = Get(row,col+"Height"); if(!M.Height) M.Height = Get(row,"Height"); if(!M.Height) M.Height = 100;
if(!M.Width || !M.Height) return val; 
var PY = Get(row,col+"SourcesY"); if(!PY) return val;
PY = PY.split(",");
var PX = Get(row,col+"SourcesX");
if(PX) PX = PX.split(",");
var par = Get(row,col+"Parent"); 
if(par) par = this.GetRowById(par);
var L = M.Lines; if(!L) { L = []; M.Lines = L; }
var C = { };
for(var i=0;i<PY.length;i++){
   if(!L[i]) L[i] = { };
   L[i].Y = this.GetChartPoints(par,PY[i]);
   C[PY[i]] = 1;
   if(PX && PX[i]) {
      L[i].X = this.GetChartPoints(par,PX[i]);
      L[i].ColX = PX[i];
      }
   }
var ref = Get(row,col+"Refresh");
if(ref!=null){
   C = { };
   ref = ref.split(",");
   for(var i=0;i<ref.length;i++) C[ref[i]] = 1;
   }
M.Cols = C; M.Row = row; M.Col = col;
M.Class = this.Img.Style+"Chart";

this.Charts[M.id] = M;
val = ShowLineChart(M);
return val?val:CNBSP;
}
// ----------------------------------------------------------------------------------------------------------
TGP.UpdateCharts = function(row,col){
if(!this.Charts || row&&row.Space) return;
for(var cr in this.Charts) {
   var CR = this.Charts[cr]; if(!col || CR.Cols[col]) this.RefreshCell(CR.Row,CR.Col);
   }
}
// ----------------------------------------------------------------------------------------------------------
TGP.GetChart = function(CR){
return this.Charts[CR];
}
// ----------------------------------------------------------------------------------------------------------
TGP.RefreshChart = function(CR){
if(typeof(CR)!="object") CR = this.Charts[CR];
if(!CR) return;
this.RefreshCell(CR.Row,CR.Col);
}
// ----------------------------------------------------------------------------------------------------------
ME.Chart;

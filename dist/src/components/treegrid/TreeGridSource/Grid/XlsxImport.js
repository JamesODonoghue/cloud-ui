// -----------------------------------------------------------------------------------------------------------
MS.Xlsx;
// -----------------------------------------------------------------------------------------------------------
var CIndexColors = [ '#000000','#FFFFFF','#FF0000','#00FF00','#0000FF','#FFFF00','#FF00FF','#00FFFF','#000000','#FFFFFF','#FF0000','#00FF00','#0000FF','#FFFF00','#FF00FF','#00FFFF', 
                     '#800000','#008000','#000080','#808000','#800080','#008080','#C0C0C0','#808080','#9999FF','#993366','#FFFFCC','#CCFFFF','#660066','#FF8080','#0066CC','#CCCCFF', 
                     '#000080','#FF00FF','#FFFF00','#00FFFF','#800080','#800000','#008080','#0000FF','#00CCFF','#CCFFFF','#CCFFCC','#FFFF99','#99CCFF','#FF99CC','#CC99FF','#FFCC99', 
                     '#3366FF','#33CCCC','#99CC00','#FFCC00','#FF9900','#FF6600','#666699','#969696','#003366','#339966','#003300','#333300','#993300','#993366','#333399','#333333' ];
var CThemeColors = [ "#FFFFFF","#000000","#EEECE1","#1F497D","#4F81BD","#C0504D","#9BBB59","#8064A2","#4BACC6","#F79646","#0000FF","#800080" ]; 
var CBorderStyles = { "hair":[4,"#888"],"dotted":[4,"#000"],"dashDotDot":[6,"#AAA"],"dashDot":[6,"#666"],"dashed":[6,"#000"],"thin":[1,"#000"], 
                      "mediumDashDotDot":[7,"#AAA"],"slantDashDot":[7,"#844"],"mediumDashDot":[7,"#666"],"mediumDashed":[7,"#000"],"medium":[2,"#000"],"thick":[3,"#000"],"double":[3,"#888"] };
var CBorderDiagonalStyles = { "hair":[2,"#888"],"dotted":[1,"#000"],"dashDotDot":[1,"#AAA"],"dashDot":[1,"#666"],"dashed":[1,"#000"],"thin":[2,"#000"], 
                      "mediumDashDotDot":[3,"#AAA"],"slantDashDot":[3,"#844"],"mediumDashDot":[3,"#666"],"mediumDashed":[3,"#000"],"medium":[3,"#000"],"thick":[4,"#000"],"double":[4,"#888"] };
var CFormatNumbers =  { 0:'', 1:'0', 2:'f', 3:'#,##0', 4:'#,##0.00', 
                        9:'0%', 10:'p', 11:'0.00E+00', 12:'# ?/?', 13:'# ??/??', 14:'d', 15:'D', 16:'m', 17:'y', 18:'i', 19:'I', 20:'t', 21:'T', 22:'h', 
                       37:'#,##0 ;(#,##0)', 38:'#,##0 ;[Red](#,##0)', 39:'#,##0.00;(#,##0.00)', 40:'#,##0.00;[Red](#,##0.00)', 
                       45:'mm:ss', 46:'[h]:mm:ss', 47:'mm:ss.0', 48:'##0.0E+0', 49:'@' };
var CAlignHorizontal = {"left":"Left","center":"Center","right":"Right","justify":"Justify","centerContinuous":"Center","distributed":"Justify","fill":"Justify"};
var CAlignVertical = {"top":"Top","center":"Middle","bottom":"Bottom","justify":"Middle","distributed":"Middle"};
var CColChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
var CPatterns = [ "solid","darkGray","mediumGray","lightGray","gray125","gray0625","darkHorizontal","darkVertical","darkDown","darkUp","darkGrid","darkTrellis","lightHorizontal","lightVertical","lightDown","lightUp","lightGrid","lightTrellis"];
var CSheetStates = { "visible":0,"hidden":1,"veryHidden":2 };
// -----------------------------------------------------------------------------------------------------------
function GetBool(v,def){
if(v=="0"||v=="false") return 0;
if(v=="1"||v=="true") return 1;
return def;
}
// -----------------------------------------------------------------------------------------------------------
function RgbToHsl(r,g,b) {
r = r?r/255:0; g = g?g/255:0; b = b?b/255:0;
var min = r<b?(r<g?r:g<b?g:b):b<g?b:g, max = r>b?(r>g?r:g>b?g:b):b>g?b:g, dd = max-min; if(!dd) return [0,0,max];
var h = (r==max ? (g-b)/dd : g==max ? (b-r)/dd+2 : (r-g)/dd+4)*60; if(h<0) h += 360;
var l = (min + max) / 2;
var s = dd / (l<0.5 ? max+min : 2-max-min);
return [h,s,l];
}
// -----------------------------------------------------------------------------------------------------------
function HslToRgb(h,s,l) {
if(!s) return [l*255,l*255,l*255];
function SetColor(t1, t2, t3) { if(t3<0) t3 += 360; if(t3>360) t3 -= 360; return (t3<60 ? t2+(t1-t2)*t3/60 : t3<180 ? t1 : t3<240 ? t2+(t2-t1)*(t3/60-4) : t2) * 255; }
var t1 = l<0.5 ? l*(s+1) : l+s-(l*s), t2 = l*2-t1;
return [SetColor(t1,t2,h+120),SetColor(t1,t2,h),SetColor(t1,t2,h-120)];
}
// -----------------------------------------------------------------------------------------------------------
function HexToRgb(s){
if(s.charAt(0)=="#") s = s.slice(1);
if(s.length<=4) { var c = parseInt(s,16); return [(c>>8&15)+(c>>4&240),(c>>4&15)+(c&240),(c&15)+(c<<4&240),s.length==3?1:(c>>12)/15]; }
if(s.length<=8) { var c = parseInt(s,16); return [c>>16&255,c>>8&255,c&255,s.length==6?1:(c>>24)/255]; }
if(s.slice(0,3)=="rgb"){ s = s.slice(s.charAt(3)=="a"?5:4,-1).split(","); return s[3] ? [s[0]-0,s[1]-0,s[2]-0,s[3]>1?s[3]/255:s[3]-0] : [s[0]-0,s[1]-0,s[2]-0]; }
if(s.slice(0,3)=="hsl"){ s = s.slice(s.charAt(3)=="a"?5:4,-1).split(","); var A = HslToRgb(s[0]-0,s[1]-0,s[2]-0); return s[3] ? [A[0],A[1],A[2],s[3]>1?s[3]/255:s[3]-0] : [A[0],A[1],A[2]]; }
if(s.indexOf(",")>=0) return s.split(",");
return null;
}
// -----------------------------------------------------------------------------------------------------------
function HexToClr(c){
if(c.length==6) return "#"+c; 
if(c.slice(0,2).toUpperCase()=="FF") return "#"+c.slice(2); 
c = HexToRgb(c); 
return "rgb"+(c[3]==1?"":"a")+"("+Math.round(c[0])+","+Math.round(c[1])+","+Math.round(c[2])+(c[3]==1?"":","+c[3])+")";
}
// -----------------------------------------------------------------------------------------------------------
function RgbToHex(r,g,b,a){
return a!=null&&a!=1 ? "rgba("+r+","+g+","+b+","+a+")" : "#"+Number((((r&255)|256)<<16)+((g&255)<<8)+(b&255)).toString(16).slice(1);
}
// -----------------------------------------------------------------------------------------------------------
function EmuToPx(val){
if(!val) return 0;
if(val-0||val=="0") return Math.round(val/9525); 
var units = val.match(/[a-zA-z]+/); 
if(units) { var v = {"px":1,"in":96,"pt":96/72,"dxa":96/72*20,"cm":37.795275591,"mm":3.7795275591}[units]*parseFloat(val); if(v) return v; }
val = parseInt(val); 
return val ? val : 0;
}
// -----------------------------------------------------------------------------------------------------------
function AddTint(r,g,b,t) {
if(!t) return [r,g,b];
var A = RgbToHsl(r,g,b); t -= 0;
return HslToRgb(A[0],A[1],t<0 ? A[2]*(t+1) : A[2]*(1-t)+t);
}
// -----------------------------------------------------------------------------------------------------------
function GetColName(idx){ if(idx<=26) return CColChars[idx-1]; var s = ""; while(idx--){ var a = idx%26; s = CColChars[a]+s; idx = (idx-a)/26; } return s; }
function GetColIndex(name){ for(var i=name.length-1,idx=0,p=1;i>=0;i--,p*=26) idx += p*(name.charCodeAt(i)-64); return idx; }
function GetRowCol(cell){ if(!cell) return null; var M = cell.match(/([A-Z]+)(\d+)/); return M ? [M[2],M[1]] : null; } 
function GetRowCol2(cell){ 
if(!cell) return null; var R = /([A-Z]+)(\d+)\:?([A-Z]+)?(\d+)?/;
if(cell.indexOf(" ")<0){ var M = cell.match(R); return M ? [M[2],M[1],M[4]?M[4]:M[2],M[3]?M[3]:M[1]] : null; }
cell = cell.split(" ");
for(var i=0,O=[];i<cell.length;i++){
   var M = cell[i].match(R); if(!M) return null;
   O.push(M[2],M[1],M[4]?M[4]:M[2],M[3]?M[3]:M[1]);
   }
return O;
} 
// -----------------------------------------------------------------------------------------------------------

ME.Xlsx;

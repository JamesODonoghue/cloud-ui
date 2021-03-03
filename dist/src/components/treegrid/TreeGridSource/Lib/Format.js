// ---------------------------------------------------------------------------------------------------------------------------
var PFormat = {};

MS.LibFormat;
var PFormat = { 

   EmptyNumber : null,
   EmptyDate : null,
   
   ValueSeparator : ";",
   RangeSeparator : "~",
   ValueSeparatorHtml : " <b style='color:red;'>;</b> ",
   RangeSeparatorHtml : " <b style='color:red;'>~</b> ",
   
   LongDayNames : "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(","),
   ShortDayNames : "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(","),
   Day2CharNames : "Su,Mo,Tu,We,Th,Fr,Sa".split(","),
   Day1CharNames : "S,M,T,W,T,F,S".split(","),
   LongMonthNames : "January,February,March,April,May,June,July,August,September,October,November,December".split(","),
   LongMonthNames2 : "January,February,March,April,May,June,July,August,September,October,November,December".split(","),
   ShortMonthNames : "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),
   DayNumbers : "1st,2nd,3rd,4th,5th,6th,7th,8th,9th,10th,11th,12th,13th,14th,15th,16th,17th,18th,19th,20th,21st,22nd,23rd,24th,25th,26th,27th,28th,29th,30th,31st".split(","),
   EditMonths : [],
   Quarters : "I,II,III,IV".split(","),
   Halves : "I,II".split(","),
   DateSeparator : "/",
   InputDateSeparators : "/.-",
   TimeSeparator : ":",
   InputTimeSeparators : ":",
   AMDesignator : "AM",
   PMDesignator : "PM",
   FirstWeekDay : 0,
   FirstWeekYearDay : 0,
   NaD : "NaN",
   GMT : 1,
   Hirji : 0,
   ExcelDates : null,
   
   DecimalSeparator : ".",
   InputDecimalSeparators : ".,",
   GroupSeparator : ",",
   InputGroupSeparators : "",
   Percent : "%",
   NaN : "NaN",

   'd' : "M/d/yyyy",
   'D' : "d. MMMM yyyy",
   't' : "H:mm",
   'T' : "H:mm:ss",
   'f' : "d. MMMM yyyy H:mm",
   'F' : "d. MMMM yyyy H:mm:ss",
   'g' : "M/d/yyyy H:mm",
   'G' : "M/d/yyyy H:mm:ss",
   'm' : "d. MMMM",
   'M' : "d. MMMM",
   's' : "yyyy-MM-ddTHH:mm:ss",
   'u' : "yyyy-MM-dd HH:mm:ssZ",
   
   'U' : "d. MMMM yyyy HH:mm:ss",
   'r' : "ddd MMM d HH:mm:ss UTCzzzzz yyyy",
   'R' : "ddd MMM d HH:mm:ss UTCzzzzz yyyy",
   'y' : "MMMMMMM yyyy",
   'Y' : "MMMMMMM yyyy",

   'ng' : "0.######",
   'nf' : "0.00",
   'nc' : "$###########0.00",
   'np' : "0.00%",
   'nr' : "0.0000",
   'ne' : "0.000000 E+000"
   }
ME.LibFormat;

MS.Number;
PFormat.CNumberMinMax = ["",/\D*0$/,/\D*0{1,2}$/,/\D*0{1,3}$/,/\D*0{1,4}$/,/\D*0{1,5}$/,/\D*0{1,6}$/,/\D*0{1,7}$/,/\D*0{1,8}$/,/\D*0{1,9}$/,/\D*0{1,10}$/,/\D*0{1,11}$/,/\D*0{1,12}$/,/\D*0{1,13}$/,/\D*0{1,14}$/,/\D*0{1,15}$/,/\D*0{1,16}$/,/\D*0{1,17}$/,/\D*0{1,18}$/,/\D*0{1,19}$/,/\D*0{1,20}$/];
PFormat.CEmptyString = ["","0","00","000","0000","00000","000000","0000000","00000000","000000000","0000000000","00000000000","000000000000","0000000000000","00000000000000","000000000000000","0000000000000000","00000000000000000","000000000000000000","0000000000000000000","00000000000000000000"];
PFormat.CNumberSep = ["",/.{1,1}$/,/.{2,2}$/,/.{3,3}$/,/.{4,4}$/,/.{5,5}$/,/.{6,6}$/,/.{7,7}$/,/.{8,8}$/,/.{9,9}$/,/.{10,10}$/,/.{11,11}$/,/.{12,12}$/,/.{13,13}$/,/.{14,14}$/,/.{15,15}$/,/.{16,16}$/,/.{17,17}$/,/.{18,18}$/,/.{19,19}$/,/.{20,20}$/];
ME.Number;

MS.Date;
PFormat.CDateFormat =              /\D*(\d{1,4})?\s*([\-\/\.])?\s*(\d{1,2})?\s*([\-\/\.])?\s*(\d{1,4})?[^\d\:\.]*(\d{1,2})?\s*[\:\.]?\s*(\d{1,2})?\s*[\:\.]?\s*(\d{1,2})?\s*([apAP]\.?[Mm]?\.?)?\D*/;
PFormat.CDateFormatStrict =       /^\s*(\d{1,4})?\s*([\-\/\.])?\s*(\d{1,2})?\s*([\-\/\.])?\s*(\d{1,4})?\s*[^\d\:\.]?\s*(\d{1,2})?\s*[\:\.]?\s*(\d{1,2})?\s*[\:\.]?\s*(\d{1,2})?\s*([apAP]\.?[Mm]?\.?)?\s*$/;

PFormat.CDefault = { Year: (new Date()).getUTCFullYear(), Month: (new Date()).getUTCMonth(), Day: (new Date()).getUTCDate(), Day1: 1, Hour: 0, Min: 0, Sec:0 } 

PFormat.Defaults  =  { };

PFormat.MonthDays = [0,31,29,31,30,31,30,31,31,30,31,30,31];


ME.Date;

PFormat.CSearchEscape1 = /[\&\<]/; 
PFormat.CSearchEscape2 = /[\&\<\n]/; 
PFormat.CSearchEscape3 = /[\&\<\"\']/;
PFormat.CSearchWhite = /^\s*$/;
PFormat.CReplaceWhite = new RegExp(BIE5?"^ | $|  ":"^ | $| (?= )","g"); 
PFormat.CReplaceCR = /\r?\n/g;
PFormat.CReplaceAmp = /\&/g; 
PFormat.CReplaceLt = /\</g; 
PFormat.CReplaceApos = /\'/g;
PFormat.CReplaceQuot = /\"/g;

PFormat.Parsed = {};
   
var TFormat = function(){ };   
TFormat.prototype = PFormat;
Formats = new TFormat();       

// ---------------------------------------------------------------------------------------------------------------------------
PFormat.NumberToString = function(num,ff,range,edit,auto){
MS.Range;
if(range && num && typeof(num)=="string"){
   var A = num.split(this.ValueSeparator);
   for(var i=0;i<A.length;i++){
      var B = A[i].split(this.RangeSeparator);
      for(var j=0;j<B.length;j++) B[j] = B[j]==="" ? "" :this.NumberToString(B[j]-0,ff); 
      A[i] = B.join(range==2?this.RangeSeparatorHtml:this.RangeSeparator);
      }
   return A.join(range==2?this.ValueSeparatorHtml:this.ValueSeparator); 
   }
ME.Range;

if(!ff) {
   if(ff=='0') ff = "0";
   else if(num=='0') return "0";
   else if(num-0){
//      var ret = 1;
         num += "";
         return this.DecimalSeparator=="."||num.indexOf(".")<0||this.BaseSeparators ? num : num.replace(".",this.DecimalSeparator);
//         }
      }
   else if(num&&num.search(/%\s*$/)>=0) {
      num = num.slice(0,num.search(/%\s*$/))/100; ff = "0.##########%";
      }
   else return isFinite(num) ? "" : this.NaN;
   }
MS.Number;
var f = this.Parsed[ff]; if(!f) f = this.ParseNumberFormat(ff);

while(f.Operator){
   if(f.Operator==1) { if(num==f.Compare) break; }
   else if(f.Operator==2) { if(num!=f.Compare) break; }
   else if(f.Operator==3) { if(num<f.Compare) break; }
   else if(f.Operator==4) { if(num<=f.Compare) break; }
   else if(f.Operator==5) { if(num>f.Compare) break; }
   else if(f.Operator==6) { if(num>=f.Compare) break; }
   f = f.Next;
   if(!f) { 
      if(num=='0') return num+"";
      else if(num-0){
         num += "";
         if(this.DecimalSeparator=="."||num.indexOf(".")<0||this.BaseSeparators) return num;
         return num.replace(".",this.DecimalSeparator);
         }
      else return isFinite(num) ? "" : this.NaN;
      }
   }
if(!(num-0)) {
   if(num=="0") return edit ? f.ZeroEdit : f.Zero;
   if(!edit&&f.TextPrefix!=null&&typeof(num)=="string"&&num!=f.NaN) {
      if(num.search(this.CSearchEscape2)>=0) num = this.FormatString(num,null,1);
      return f.TextPrefix+num+f.TextPostfix;
      }
   return auto&&typeof(num)=="string" ? num : !isFinite(num) ? f.NaN : edit ? f.EmptyEdit : f.Empty;
   }
var neg = 0, exp = "";
if(num<0){ 
   if(num>f.NegMax) return edit ? f.ZeroEdit : f.Zero;
   num = -num;
   neg = 1;
   }   
if(f.Exp){
   var e = f.Exp;
   if(num<=e.Min || num>=e.Max){ 
      exp = Math.floor(Math.log(num)*Math.LOG10E);
      if(e.Sub) exp-=e.Sub;
      num /= Math.pow(10,exp);
      var eneg = 0;
      if(exp<0){ eneg = 1; exp = -exp; }
      exp+="";
      if(e.Dig){ 
         var len = e.Dig-exp.length;
         if(len==1) exp = "0"+exp;
         else if(len==2) exp = "00"+exp;
         }
      if(eneg) exp = e.NegPrefix+exp+e.NegPostfix;
      else exp = e.Prefix+exp+e.Postfix;
      }
   }

if(f.Div!=1) { 
   num = num*f.Div; 
   if(f.Div<12) num += 1e-14; 
   }
if(f.Rat) { 
   if(edit) {
      exp = Math.round((num%1)*1e6); exp = (this.DecimalSeparator+(exp<10?"00000":exp<100?"0000":exp<1000?"000":exp<10000?"00":exp<100000?"0":"")+exp).replace(/0+$/,"");
      num = Math.round(num);
      }
   else {
      if(f.Rat<0) { exp = Math.round((num%1)*-f.Rat); exp = exp ? (num>=1?f.RatPrefix:"") + exp +this.FractionSeparator+(-f.Rat) : ""; }
      else if(num*(f.Rat-1)<1) exp = "";
      else { var A = ToFract(num%1,f.Rat-1); exp = (num>=1?f.RatPrefix:"")+A[0]+this.FractionSeparator+A[1]; }
      num = num>=1 ? Math.round(num) : exp ? "" : 0;
      }
   }
else num = Math.round(num);
if(num<1e21) num += "";      
else { 
   if(num==Infinity) return f.NaN;
   var s = "";
   while(num>=1e21){ s+="000"; num/=1000; }
   num += s;
   }
if(f.Dig){ 
   var len = f.Right+f.Max+f.Dig-num.length;
   if(len>0) num = (len==1 ? "0" : this.CEmptyString[len]) + num;
   else if(f.Left) num = num.slice(-len);
   if(f.Right) num = num.slice(0,num.length-f.Max-f.Right)+num.slice(-f.Max);
   }
if(f.Group&&(!edit||this.InputGroupSeparators)){
   var len = num.length - f.Max;
   if(len>this.GroupCount1){
      var g = this.GroupCount, g1 = this.GroupCount1;
      if(len<=g+g1) num = num.slice(0,len-g1) + f.Group + num.slice(len-g1);
      else if(len<=g*2+g1) num = num.slice(0,len-g-g1) + f.Group + num.slice(len-g-g1,len-g1) + f.Group + num.slice(len-g1);
      else {
         var s = num.slice(len-g1,len+f.Max); len-=g1;
         while(len>g){ s = num.slice(len-g,len) + f.Group + s; len -= g; }
         num = (len ? num.slice(0,len)+f.Group : "")+s;
         }
      }         
   }       
if(f.Max){                           
   if(num.length<f.Max) num = this.CEmptyString[f.Max-num.length] + num; 
   if(BIE5 || BOpera){ 
      var cnt = num.length-f.Max, d = num.slice(cnt);
      if(f.Max!=f.Min) d = d.replace(this.CNumberMinMax[f.Max-f.Min],"");
      if(d) num = num.slice(0,cnt) + f.Sep + d;   
      else num = num.slice(0,cnt);
      }
   else {      
      num = num.replace(this.CNumberSep[f.Max],f.Sep=="$"?"$$$&":f.Sep+"$&");
      if(f.Max!=f.Mid) num = num.replace(this.CNumberMinMax[f.Max-f.Mid],"");
      if(f.Mid!=f.Min&&!edit) num = num.replace(this.CNumberMinMax[f.Mid-f.Min],"<span style='visibility:hidden;'>$&</span>");
      }
   if(f.DecLeft) num = num.replace(new RegExp('\\'+f.Sep+"\\d{0,"+f.DecLeft+"}"),f.Sep);
   if(!f.Dig && f.Left) num = num.replace(new RegExp('\\d*\\'+f.Sep),""); 
   } 
if(edit) return neg ? (f.NegDisplay?"-"+num+exp+(f.Percent?"%":""):"") : (f.Display?num+exp+(f.Percent?"%":""):"");
if(neg) return f.NegPrefix + (f.NegDisplay?num+exp:"") + f.NegPostfix;
return f.Prefix + (f.Display?num+exp:"") + f.Postfix;
MX.Number;
return num==null?"":num+"";
ME.Number;
}
// ---------------------------------------------------------------------------------------------------------------------------
MS.Number;
PFormat.PrepareNumberFormat = function(f){
f = f ? f+"": "";
if(f.length==1){
   switch(f){
      case 'g' : f = this.ng; break;
      case 'f' : f = this.nf; break;
      case 'c' : f = this.nc; break;
      case 'p' : f = this.np; break;         
      case 'r' : f = this.nr; break;
      case 'e' : f = this.ne; break;
      }
   }
if(this[f]) f = this[f];
if(f.indexOf("*")>=0){
   var max = 5;
   do {
      var fchg = 0;
      f = f.split("*");
      for(var i=0,jn="*";i<f.length;i++) if(this[f[i]]!=null) { f[i] = this[f[i]]; jn = ""; fchg = 1; }
      f = f.join(jn);
      } while(fchg&&f.indexOf("*")>=0&&max--);
   }
return f;
}
ME.Number;
// ---------------------------------------------------------------------------------------------------------------------------
MS.Number;
PFormat.ParseNumberFormat = function(f,pos){
f = this.PrepareNumberFormat(f);
var F = {Dig:0,Left:0,Right:0,Min:0,Mid:0,Max:0,DecLeft:0,Div:1,Sep:"",Group:"",Prefix:"",Postfix:"",Display:0,Rat:0};
var g = 0, pp = "", lp = "", perc = 0, rat = 0, t = 0; 
for(var i=0;i<f.length;i++){
   var c = f.charAt(i);
   if(c=='0' || c=='#' || c=='8' || c=="?"){
      if(g){ F.Group = this.GroupSeparator; g = 0; }
      if(t==0){ t=1; F.Prefix = pp; pp = ""; }
      if(t==2){ t=3; F.Sep = pp; pp = ""; }
      F.Display = 1;
      }
   if(c=='"' || c=="'"){
      for(i++;i<f.length && f.charAt(i)!=c;i++) pp += f.charAt(i);
      }
   else if(c=='\\'){ 
      i++;
      pp += f.charAt(i);
      }
   else if(c=='0'){
      if(t==1) F.Dig++;
      else if(t==3){ F.Min++; F.Mid++; F.Max++; }
      else if(t==5) F.Exp.Dig++;
      }
   else if(c=='?'){
      if(rat) F.Rat *= 10;
      else if(t==3){ F.Mid++; F.Max++; }
      else if(t==5) F.Exp.Dig++;
      }
   else if(c=='#'){
      if(t==3){ F.Max++; }
      else if(t==5) F.Exp.Dig++;
      }
   else if(c=='8'){
      if(t==1) {
         if(F.Dig) F.Right++;
         else F.Left++;
         }
      else if(t==3) {
         if(!f.Max) F.DecLeft++;
         F.Min++; F.Mid++; F.Max++;
         }
      }
   else if(c=='.'){
      if(t==0){ t = 1; F.Prefix = pp; pp = ""; }
      if(t<2) t = 2;
      pp += this.DecimalSeparator;
      if(g) { F.Div/=Math.pow(1000,g); g = 0; }
      }
   else if(c==','){
      if(t<2) g++;      
      }  
   else if(c=='%'){
      pp += this.Percent;
      F.Div*=100;
      F.Percent = 1;
      perc = 1;
      }
   else if(c==';'){ 
      var ff = f.slice(i+1);
      if(!ff) F.Zero = ""; 
      else {
         var N = this.ParseNumberFormat(ff,F.Operator?0:pos?pos+1:1);
         if(N){
            if(F.Operator) { F.Next = N; F.NegPrefix = N.NegPrefix; F.NegPostfix = N.NegPostfix; F.NegDisplay = N.NegDisplay; F.Zero = N.Zero; F.TextPrefix = N.TextPrefix; F.TextPostfix = N.TextPostfix; }
            else if(N.TextOnly||pos==2){ 
               F.TextPrefix = N.Prefix; if(!F.TextPrefix) F.TextPrefix = ""; F.TextPostfix = N.Postfix; if(!F.TextPostfix) F.TextPostfix = "";
               }
            else if(pos==1){  
               F.Zero = N.Prefix + this.CEmptyString[N.Dig] + N.Sep + this.CEmptyString[N.Min] + N.Postfix; F.TextPrefix = N.TextPrefix; F.TextPostfix = N.TextPostfix;
               }
            else {   
               F.NegPrefix = N.Prefix; F.NegPostfix = N.Postfix; F.NegDisplay = N.Display; F.Zero = N.Zero; F.TextPrefix = N.TextPrefix; F.TextPostfix = N.TextPostfix; 
               }
            }
         }   
      break;
      } 
   else if(c=='['){ 
      var p = f.slice(i).indexOf("]");
      if(p>=0){
         p += i;
         var cc = f.charAt(i+1), c2 = f.charAt(i+2), op = 0;
         if(cc=='=') { op = 1;i++; } else if(cc=='<'){ if(c2=='>') { op = 2; i += 2; } else if(c2=='=') { op = 4; i += 2; } else { op = 3; i++; } } else if(cc=='>') { if(c2=='=') { op = 6; i+=2; } else { op = 5; i++; } }
         if(op) { 
            F.Operator = op;
            F.Compare = f.slice(i+1,p);
            }
         else if(cc=='$'){ 
            if(f.charAt(i+2)!="-" && f.slice(i+3,i+6)=="-1]") pp += f.charAt(i+2); 
            }
         else { 
            var clr = f.slice(i+1,p); if(clr-0) clr = this.Colors[clr];
            else if(clr.slice(0,5).toLowerCase()=="color") clr = this.Colors[clr.slice(5)-0];
            pp += "<span style='color:"+clr+"'>"; lp += "</span>";
            }
         i = p;
         }
      else pp += c;
      }
   else if(c=="_"){
      if(pp&&pp.slice(-7)=="</span>") pp = pp.slice(0,-7)+f.charAt(++i)+"</span>"; 
      else pp += "<span style='visibility:hidden'>"+f.charAt(++i)+"</span>";
      }
   else if((c=='e' || c=='E') && pp==0){
      var e = {};
      F.Exp = e;
      e.Dig = 0;
      e.Min = 1; e.Max = 1;
      e.Sub = F.Dig-1; if(e.Sub<0) e.Sub = 0;
      c = pp + c; pp = "";
      e.Prefix = c; e.NegPrefix = c+"-";
      e.Postfix = ""; e.NegPostfix = "";
      var sig = f.charAt(i+1);
      if(sig=='-') i++;
      else if(sig=='+'){ e.Prefix+='+'; i++; }
      t = 5;      
      }  
   else if(c=='*'); 
   else if(c=='@'){ F.TextOnly = 1; F.Prefix = pp; pp = ""; }
   else if(c=='$') pp += !this.Currency ? '$' : this.Currency.length<=1 ? this.Currency : t==0 ? this.Currency.replace(/^\s+/,"") : this.Currency.replace(/\s+$/,"");
   else if(c=='/') { 
      if(t==1&&f.charAt(i-1)!='<') { 
         F.RatPrefix = pp; pp = ""; F.Rat = 1; rat = 1; 
         var cc = f.charAt(i+1); 
         if(cc-0){
            var s = cc; i += 2; while(f.charAt(i)-0||f.charAt(i)=="0") s += f.charAt(i++);
            F.Rat = -s; 
            }
         else pp += c;
         } 
      else pp += c;
      } 
   else pp += c;
   }
if(g) { F.Div/=Math.pow(1000,g); g = 0; }
F.Postfix = pp+lp;
F.Div *= Math.pow(10,F.Max);
if(F.NegPrefix==null) F.NegPrefix = F.Prefix+"-";
if(F.NegPostfix==null) F.NegPostfix = F.Postfix;
if(F.NegDisplay==null) F.NegDisplay = F.Display;
if(F.NegMax==null) F.NegMax = !F.Rat ? -("0."+this.CEmptyString[F.Max+(perc?2:0)]+"5") : F.Rat>0 ? 1/F.Rat : -1/F.Rat/2; 
if(F.ZeroEdit==null && !pos) F.ZeroEdit = this.CEmptyString[F.Dig] + (F.Min?F.Sep:"") + this.CEmptyString[F.Min] + (F.Exp?F.Exp.Prefix + this.CEmptyString[F.Exp.Dig] + F.Exp.Postfix:"") + (F.Percent?"%":"");
if(F.Zero==null && !pos) F.Zero = F.Prefix + this.CEmptyString[F.Dig] + (F.Min?F.Sep:"") + this.CEmptyString[F.Min] + (F.Exp?F.Exp.Prefix + this.CEmptyString[F.Exp.Dig] + F.Exp.Postfix:"") + F.Postfix;
if(F.NaN==null && pos!=2) F.NaN = this.NaN;
if(!pos) this.Parsed[f] = F; 
F.Empty = this.EmptyNumber;
if(F.Empty==null && !pos) F.Empty = this.NumberToString(0,f);
if(F.EmptyEdit==null && !pos) F.EmptyEdit = this.NumberToString(0,f,0,1);
return F;
}
ME.Number;   
// -----------------------------------------------------------------------------------------------------------
// Converts number to string, ignores format. Its possible to read hexadecimal numbers with 'x' preffix.
PFormat.StringToNumber = function(str,f,range,edit){
if(!str) return this.EmptyNumber!=null ? "" : 0;
if(str==this.EmptyNumber) return "";
if(str-0+""==str && this.DecimalSeparator=='.') {
   MS.Number;
   if(f){
      var ff = null; if(f.search(/[%,]/)>=0){ ff = this.Parsed[f]; if(!ff) { ff = this.ParseNumberFormat(f); this.Parsed[f] = ff; } }
      if(ff && (ff.Div!=1||ff.Max) && (this.EditPercent||!ff.Percent)) { var mul = Math.pow(10,ff.Max) / ff.Div; return (mul==1||edit||this.StrictNumbers?str-0:parseFloat(str))*mul; }

      }
   ME.Number;
   return str-0;
   }

MS.Number;

MS.Range;
if(range){
   var A = str.split(this.ValueSeparator);
   for(var i=0;i<A.length;i++){
      var B = A[i].split(this.RangeSeparator);
      for(var j=0;j<B.length;j++) B[j] = this.StringToNumber(B[j],f,0,edit);
      A[i] = B.join(this.RangeSeparator); 
      }
   return A.join(this.ValueSeparator); 
   }
ME.Range;

if(!str.replace) return edit?str-0:parseFloat(str);
var gs = this.InputGroupSeparators; if(gs) gs = "\\"+gs.split('').join('\\');
str = str.replace(new RegExp("[\\s"+gs+"]","g"),"").replace(new RegExp("[\\"+this.InputDecimalSeparators.split('').join('\\')+"]","g"),".");
if(str.search(/[xe]/i)>=0 && str.search(/^\s*(\d?x[\dabcdef]+|\d*\.?\d*e[+-]?\d*)\s*$/i)>=0){
   if(str.charAt(0).toLowerCase()=="x") str = "0"+str;
   try { return eval(str); }
   catch(e){ return this.StrictNumbers ? NaN : 0; }
   }
ME.Number;
var ff = null; if(f&&f.search(/[%,]/)>=0){ ff = this.Parsed[f]; if(!ff) { ff = this.ParseNumberFormat(f); this.Parsed[f] = ff; } }
var perc = str.search(/%\s*$/)
if(perc>=0){
   str = str.slice(0,perc)-0;
   
   if(!str&&isNaN(str)||ff&&!ff.Percent) return str;
   
   return str/100;
   }
if(ff && (ff.Div!=1||ff.Max)) { var mul = Math.pow(10,ff.Max) / ff.Div; return (mul==1||edit||this.StrictNumbers?str-0:parseFloat(str))*mul; }
   
return edit||this.StrictNumbers?str-0:parseFloat(str);
}
// ---------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Converts value to show it in HTML
PFormat.Escape = function(val){
if(val==null) return "";
if(typeof(val)!="string") return val+""; 
if(val.search(this.CSearchEscape3)<0) return val; 
if(val.indexOf("&")>=0) val = val.replace(PFormat.CReplaceAmp,"&amp;");
if(val.indexOf("<")>=0) val = val.replace(PFormat.CReplaceLt,"&lt;");
if(val.indexOf('"')>=0) val = val.replace(PFormat.CReplaceQuot,"&quot;");
if(val.indexOf("'")>=0) val = val.replace(PFormat.CReplaceApos,"&#x27;");
return val;
}
// -----------------------------------------------------------------------------------------------------------
// Formats HTML string of types "Text" and "Lines"
PFormat.FormatString = function(Value,format,esc,range){
if(Value==null) Value="";
else Value+="";
if(!format){ 
   if(!esc) return Value;
   if(Value.search(this.CSearchEscape2)>=0) {
      if(Value.indexOf("&")>=0) Value = Value.replace(this.CReplaceAmp,"&amp;");
      if(Value.indexOf("<")>=0) Value = Value.replace(this.CReplaceLt,"&lt;");
      if(Value.indexOf("\n")>=0) Value = Value.replace(this.CReplaceCR,"<br/>");
      }
   if(Value.indexOf(" ")>=0) Value = Value.replace(this.CReplaceWhite,CNBSP);
   return Value;
   }
MS.Text;
if(format.charCodeAt(0)==123){ 
   var ff = this.Parsed[format]; 
   if(!ff){ ff = FromJSON(format,1); this.Parsed[format] = ff; }
   if(range&&Value){
      Value = (Value+"").split(this.ValueSeparator);
      for(var k=0;k<Value.length;k++) if(ff[Value[k]]!=null) Value[k] = ff[Value[k]];
      return Value.join(this.ValueSeparator);
      }
   ff = ff[!Value&&Value!==0?"":Value];
   return ff!=null ? ff : Value;
   }
if(esc==1) Value = this.Escape(Value).replace(this.CReplaceWhite,CNBSP).replace(this.CReplaceCR,"<br/>");
format += ""; 
var f = format.split(format.charAt(0));
if(f[4]){
   try { Value = Value.replace(new RegExp(f[4],f[5]),f[6]); }
   catch(e){ alert ((e.message?e.message:e)+"\n\nin value: "+Value+"\nwith format: "+format+"\nregex: /"+f[4]+"/"+f[5]+" => "+f[6]); }
   }
switch(f[1]-0){
   case 1 : Value = Value.toLowerCase(); break;
   case 2 : Value = Value.toUpperCase(); break;
   case 3 : Value = Value.toLocaleLowerCase(); break;
   case 4 : Value = Value.toLocaleUpperCase(); break;
   }
if(esc==2) Value = this.Escape(Value).replace(this.CReplaceWhite,CNBSP).replace(this.CReplaceCR,"<br/>");
return (f[2] ? (esc>1 ? this.Escape(f[2]) : f[2]) : "") + Value + (f[3] ? (esc>1 ? this.Escape(f[3]) : f[3]) : "");
MX.Text;
return "Missing module Text";
ME.Text;
}
// -----------------------------------------------------------------------------------------------------------
// Converts value to show it in HTML

// -----------------------------------------------------------------------------------------------------------
PFormat.StringToValue = function(val,type,format,range,edit,defaultdate,textcase,whitechars,charcodes,dummy){
MS.Digits;
if(dummy==null) dummy = this.Digits;
if(dummy){
   dummy = dummy.split(dummy.charAt(0));
   for(var i=0;i<10;i++) val = (val+"").replace(new RegExp(ToRegExp(dummy[i+1]),"g"),i);
   }
ME.Digits;
if(format && type=="Text" && format.charCodeAt(0)==123){ 
   var ff = FromJSON(format,1), v = val;
   if(!textcase){
      v = (v+"").toLowerCase();
      var fl = {}; for(var n in ff){ fl[n] = ff[n].toLowerCase(); }; ff = fl;
      }
   if(whitechars){
      v = (v+"").replace(whitechars,"");
      var fl = {}; for(var n in ff){ fl[n] = ff[n].replace(whitechars,""); }; ff = fl;
      }
   MS.CharCodes;
   if(charcodes){
      v = UseCharCodes(v+"",charcodes);
      var fl = {}; for(var n in ff){ fl[n] = UseCharCodes(ff[n],charcodes); }; ff = fl;
      }
   ME.CharCodes;
   if(range){
      val = (val+"").split(this.ValueSeparator); v = (v+"").split(this.ValueSeparator);
      for(var i=0;i<val.length;i++) for(var n in ff) if(ff[n]==v[i]) val[i] = n;
      return val.join(this.ValueSeparator);
      }   
   for(var n in ff) if(ff[n]==v) return n;
   }

if(type=="Int" || type=="Float") return this.StringToNumber(val,format,range,edit);
if(type=="Date") return this.StringToDate(val,format,range,defaultdate);
return val;
}
// -----------------------------------------------------------------------------------------------------------
PFormat.IsExactNumber = function(val){

return false;
}
// -----------------------------------------------------------------------------------------------------------
PFormat.ValueToString = function(val,type,format,range,edit){

if(type=="Int" || type=="Float") {
   if(val==="" && this.EmptyNumber!=null) return ""; 
   return this.NumberToString(val,format,range,edit);
   }
if(type=="Date") {
   if(val==="" && this.EmptyDate!=null) return ""; 
   return this.DateToString(val,format,range);
   }
if(val==null) return "";
return val+"";
}
// -----------------------------------------------------------------------------------------------------------
PFormat.ConvertDigits = function(val,dummy){
MS.Digits;
var dig = dummy==null ? this.Digits : dummy;
if(!dig||val==null) return val;
var M = (val+"").match(/(<[^>]+>)|&[^\s\;]+\;|&|[^<\d&]+|\d+/g); dig = dig.split(dig.charAt(0));
if(!M) return val;
for(var k=0;k<M.length;k++) if(!isNaN(M[k]-0)) M[k] = M[k].replace(/0/g,dig[1]).replace(/1/g,dig[2]).replace(/2/g,dig[3]).replace(/3/g,dig[4]).replace(/4/g,dig[5]).replace(/5/g,dig[6]).replace(/6/g,dig[7]).replace(/7/g,dig[8]).replace(/8/g,dig[9]).replace(/9/g,dig[10]);
return M.join("");
MX.Digits;
return val;
ME.Digits;
}
// -----------------------------------------------------------------------------------------------------------
PFormat.Init = function(){
var Frm = this; 
var F = ["LongDayNames","ShortDayNames","Day2CharNames","Day1CharNames","DayNumbers","LongMonthNames","LongMonthNames2","ShortMonthNames","InputMonthNames","Quarters","Halves"];
for(var i=0;i<F.length;i++) if(typeof(Frm[F[i]])=="string") Frm[F[i]] = Frm[F[i]] ? Frm[F[i]].split(",") : [];
if(!Frm.NaN && Frm.NaN!=0) Frm.NaN = "NaN"; 
if(!Frm.NaD && Frm.NaD!=0) Frm.NaD = "NaN"; 
if(Frm.Colors&&typeof(Frm.Colors)=="string") Frm.Colors = Frm.Colors.split(",");

var ds = Frm.InputDateSeparators ? "["+ToRegExp(Frm.InputDateSeparators)+"]" : ToRegExp(Frm.DateSeparator);
var ts = Frm.InputTimeSeparators ? "["+ToRegExp(Frm.InputTimeSeparators)+"]" : ToRegExp(Frm.TimeSeparator);
var dt = Frm.InputDateTimeSeparators ? "["+ToRegExp(Frm.InputDateTimeSeparators)+"]" : "[^"+ToRegExp(Frm.InputDateSeparators?Frm.InputDateSeparators:Frm.DateSeparator)+ToRegExp(Frm.InputTimeSeparators?Frm.InputTimeSeparators:Frm.TimeSeparator)+"\\d]";

var A = Frm.EditFormats;
if(typeof(A)=="string"){
   var B = {}; Frm.EditFormats = B; A = A.split(",");
   for(var i=0;i<A.length;i+=2) B[A[i]] = A[i+1];
   }

var A = {}, B = {}, NN = [], N = Frm.InputAMPMDesignators ? Frm.InputAMPMDesignators.split(",") : Frm.AMDesignator&&Frm.PMDesignator ? [Frm.AMDesignator,Frm.PMDesignator,Frm.AMDesignator.charAt(0),Frm.PMDesignator.charAt(0)] : [];
for(var i=0;i<N.length;i++) { var n = N[i].toUpperCase(); if(!A[n]) { A[n] = 1; NN[NN.length] = n; if(i%2) B[n] = 1; } }
var tt = ToRegExp(NN.join(",")).replace(/,/g,"|");
Frm.EditAMPM = A; Frm.EditPM = B;

var A = {}, B = {}, NN = [], N = Frm.InputMonthNames&&Frm.InputMonthNames.length ? Frm.InputMonthNames : (Frm.LongMonthNames?Frm.LongMonthNames:[]).concat(Frm.LongMonthNames2?Frm.LongMonthNames2:[],Frm.ShortMonthNames?Frm.ShortMonthNames:[]);
for(var i=0;i<N.length;i++) { var n = N[i].toUpperCase(); if(!A[n]) { A[n] = i%12; NN[NN.length] = n; } }
Frm.EditMonths = A; Frm.EditMonthsChars = B; 
var ms = "";
if(Frm.StrictDates&4) { 
   ms = "|"+ToRegExp(NN.join(",")).replace(/,/g,"|"); 
   for(var a in A) for(var j=0;j<a.length;j++) B[a[j]] = 1; 
   }

var RD = "(?:(\\d{4,4}\\s*[^\\d\\w]|\\d{1,4}"+ms+")\\s*("+ds+")?\\s*(\\d{1,4}"+ms+")?\\s*("+ds+")?\\s*(\\d{1,4}"+ms+"|[^\\d\\w]\\s*\\d{4,4})?)?"; 
var RDElapsed = RD.replace("d{1,4}","d+"); 
var RS = "\\s*((?!"+tt+")"+dt+"+|\\s+|^|$)\\s*", RSStrict = "\\s*((?!"+tt+")"+dt+"|\\s+|^|$)\\s*"; 
var RT = "(?:(\\d{1,2})\\s*("+ts+")?\\s*(\\d{1,2})?\\s*("+ts+")?\\s*(\\d{1,2})?\\s*("+tt+")?)?"; 
var RTElapsed = RT.replace(/d\{1,2\}/g,"d+"); 
Frm["EditDateRegex"] = new RegExp("\\s*"+RD+RS+RT+"\\s*","i");
Frm["EditDateRegexStrict"] = new RegExp("^\\s*"+RD+RSStrict+RT+"\\s*$","i");
Frm["EditDateRegexElapsed"] = new RegExp("\\s*"+RDElapsed+RS+RTElapsed+"\\s*","i");
Frm["EditDateRegexStrictElapsed"] = new RegExp("^\\s*"+RDElapsed+RSStrict+RTElapsed+"\\s*$","i");
Frm.FormatDateRegex = new RegExp(ds+"|"+ts+ms,"i");
Frm.Parsed = {};

}
// -----------------------------------------------------------------------------------------------------------

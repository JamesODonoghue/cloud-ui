MS.Date;
// ---------------------------------------------------------------------------------------------------------------------------
PFormat.IsDate = function(ff,notime){
if(!ff||ff=="@"||ff=="!"||ff.charCodeAt(0)==123) return false;

var f = this.Parsed[ff]; if(!f) f = this.ParseNumberFormat(ff);
return !f.Display&&!f.NegDisplay&&!f.Operator && (!notime || ff.indexOf(this.DateSeparator)>=0 || ff.length==1&&ff!="t"&&ff!="T"&&ff!="i"&&ff!="I") || ff.indexOf(":ss.0")>=0;
}
// ---------------------------------------------------------------------------------------------------------------------------
PFormat.DateToStringEng = function(num,short,noexcel){
if(num==null||num==="") return "";
if(this.ExcelDates&&!noexcel) num = Math.round(num*86400000)-2209161600000;
if(typeof(num)!="object") num = new Date(num-0+""==num?num-0:num);
if(!isFinite(num)) return NaN;
if(this.GMT-0) {
   var d = num.getUTCDate(), M = num.getUTCMonth()+1, y = num.getUTCFullYear();
   var h = num.getUTCHours(), m = num.getUTCMinutes(), s = num.getUTCSeconds();
   }
else {   
   var d = num.getDate(), M = num.getMonth()+1, y = num.getFullYear();
   var h = num.getHours(), m = num.getMinutes(), s = num.getSeconds();
   }
var S = "";
if(d!=1 || M!=1 || y!=1970) {
   if(this.BaseSeparators||this.DateSeparator=="/") S = short ? M+"/"+d+"/"+y : (M<10?"0":"")+M+"/"+(d<10?"0":"")+d+"/"+y;
   else if(this.DateSeparator==".") S = short ? d+"."+M+"."+y : (d<10?"0":"")+d+"."+(M<10?"0":"")+M+"."+y;
   else if(this.DateSeparator=="-") S = short ? y+"-"+M+"-"+d : y+"-"+(M<10?"0":"")+M+"-"+(d<10?"0":"")+d;
   else S = short ? y+this.DateSeparator+M+this.DateSeparator+d : y+this.DateSeparator+(M<10?"0":"")+M+this.DateSeparator+(d<10?"0":"")+d;
   }
if(h||m||s) {
   var sep = this.BaseSeparators ? ":" : this.TimeSeparator;
   S += (S?" ":"")+(h<10&&!short?"0":"")+h+sep+(m<10?"0":"")+m+(s?sep+(s<10?"0":"")+s:"");
   }
return S;
}
// ---------------------------------------------------------------------------------------------------------------------------
PFormat.ConvertEditDateFormat = function(f){
if(this.EditFormats&&this.EditFormats[f]) return this.EditFormats[f];
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
f = f.replace(/\[s\]/g,"sss").replace(/\[m\]/g,"mmm").replace(/\[h\]/g,"hhh").replace(/\[d\]/g,"DDDD").replace(/\[y\]/g,"yyy").replace(/\\\ /g," ").replace(/am\/pm/i,"tt");   
f = f.replace(/'[^']*'|"[^"]*"|\[[^\]=<>!]*\]|\\.*$/g," ").replace(/\s+/g," ").replace(/^\s+|\s+$/g,""); 
if(f.indexOf("[")>=0){ 
   var M = f.match(/\[[^\]]+\]|[^\[]+/g);
   for(var i=0,O=[];i<M.length;i++) O[i] = M[i].charAt(0)=="[" ? M[i] : this.ConvertEditDateFormat(M[i]);
   return O.join("");
   }
if(f.indexOf("ddd")>=0) f = f.replace("dddddddd","").replace("ddddddd","").replace("dddddd","d").replace("ddddd","d").replace("dddd","").replace("ddd","");
if(f.indexOf("DD")>=0) f = f.replace("DDDDDDD","d").replace(/\bDDD\b|DDDDD+/g,"");
if(f.indexOf("MMM")>=0) {
   f = f.replace("MMMMMM","").replace("MMMMM","")
   if(!(this.StrictDates&4)) f = f.replace("MMMM","M").replace("MMM","M");
   }

f = f.replace(/\s\s/g," ").replace(/\s\s/g," ");                                                                                  
f = f.replace(/([dmMy]+)[^\/dDMyHhmsft\[\];]+([dmMy]+)/g,"$1/$2").replace(/([dmMy]+)[^\/dDMyHhmsft\[\];]+([dmMy]+)/g,"$1/$2");    
f = f.replace(/([hHms]+)[^\:dDMyHhmsft\[\];]+([hHms]+)/g,"$1:$2").replace(/([hHmsf]+)[^\:dDMyHhmsft\[\];]+([hHmsf]+)/g,"$1:$2");  
f = f.replace(/([dmMy]+)[^\:\/dDMyHhmsft\[\];]+([hHms]+)/g,"$1 $2");                                                              
f = f.replace(/(\[[^\]]+\])|[^\:\/dDMyHhmsft\s\[;]+/g,"$1");                                                                      

if(!(this.StrictDates&8) || f.search(/[dMy]/)>=0&&f.search(/[hHms]/)>=0 || f.search(/[mM]{3,4}/)>=0) f = f.replace(/((?:^|[^mM])[mM]{1,2})(d{1,2}|y{1,4})/g,"$1/$2").replace(/(d{1,2}|y{1,4})([mM]{1,2}(?:^|[^mM]))/g,"$1/$2").replace(/(dy)/g,"d/y").replace(/(yd)/g,"y/d").replace(/(hm)/g,"h:m").replace(/ms/g,"m:s");
f = f.replace(/([dMmy])([Hh])/,"$1 $2");
if(f.search(/[dDMyHhmsft]/)<0) return ""; 
return f;
}
// ---------------------------------------------------------------------------------------------------------------------------
PFormat.DateToString = function(num,ff,range,noexcel,notext,edit){

MS.Range;
if(range && num && typeof(num)=="string"){
   var A = num.split(this.ValueSeparator);
   for(var i=0;i<A.length;i++){
      var B = A[i].split(this.RangeSeparator);
      for(var j=0;j<B.length;j++) B[j] = B[j]==="" ? "" : this.DateToString(B[j]-0,ff,0,noexcel,notext,edit); 
      A[i] = B.join(range==2?this.RangeSeparatorHtml:this.RangeSeparator); 
      }
   return A.join(range==2?this.ValueSeparatorHtml:this.ValueSeparator);
   }
ME.Range;

if(ff&&typeof(ff)=="object") f = ff;
else {
   MS.Hirji; if(!ff && this.Hirji&1) ff = num<86400000 ? "T" : num%86400000 ? "H" : "d";  ME.Hirji; 
   if(ff&&edit) ff = this.ConvertEditDateFormat(ff);
   if(!ff) return this.DateToStringEng(num,null,noexcel);
   var f = this.Parsed[ff+this.GMT+(edit?"+":"-")]; if(!f) f = this.ParseDateFormat(ff,edit); 
   }
if(num==null || num==="") return f[3];
if(typeof(num)!="object") {
   if(num-0||num=="0") num = new Date(this.ExcelDates&&!noexcel?Math.round(num*86400000)-2209161600000:num);
   else if(!notext) { var nn = new Date(num + (this.GMT?" GMT":""));  num = nn ? nn : new Date(this.StringToDateEng(num)); }
   else if(typeof(num)!="string"||f[11]==null&&notext==2) return f[4];
   else {
      if(notext==1&&num.search(this.CSearchEscape2)>=0) num = this.FormatString(num,null,1);
      return f[11]==null ? num : (f[10]!=null ? f[10]+num : "")+f[11];
      }
   }
if(!isFinite(num)) return f[4];
var len = f.length, s = f[12], n;
if(Try){ if(f[0]&&!f[0](num,this)) return this.DateToString(num,f[1],0,noexcel,notext,edit); }
else if(Catch) { if(window.Grids&&Grids[0]) Grids[0].Debug(2,"Incorrect condition execution in format ",ff); }

MS.Hirji;
if(this.Hirji&1) {
   var gmt = f[2]=="0";
   if(gmt) { var jy = num.getUTCFullYear(), jm = num.getUTCMonth(), jd = num.getUTCDate(); }
   else { var jy = num.getFullYear(), jm = num.getMonth(), jd = num.getDate(); }
   var A = this.GregorianToHirji(jy,jm+1,jd);
   jy = A[0], jm = A[1]-1, jd = A[2];
   
   for(var i=13;i<len;i+=2){
      switch(f[i]){
         case 1: s += jd; break;                                           
         case 2: n = jd; s += n<10?"0"+n:n; break;                         
         case 3: s += f[6][gmt?num.getUTCDay():num.getDay()]; break;       
         case 6: s += f[7][jd-1]; break;                                   
         case 7:                                                           
         case 8:
         case 25: 
            var A = this.HirjiToGregorian(jy,1,1); var n = gmt ? Date.UTC(A[0],A[1]-1,A[2]) : new Date(A[0],A[1]-1,A[2]), d = gmt ? (new Date(n)).getUTCDay() : n.getDay();
            n = Math.ceil((((num - n) / 86400000) + d+1-this.FirstWeekDay)/7);
            if(f[i]==25) s += jy + (n==1&&jm==11 ? 1 : 0);
            else s += n<10&&f[i]==8?'0'+n:n;
            break;
         case 11: s += jm+1; break;                                        
         case 12: n = jm+1; s += n<10?"0"+n:n; break;                      
         case 13: s += f[5][jm]; break;                                    
         case 15: s += f[5][Math.floor(jm/3)+0.0001]; break;                      
         case 16: s += f[5][Math.floor(jm/6)+0.0001]; break;                      
         case 21: s += jy%100; break;                                      
         case 22: n = jy%100; s += n<10?"0"+n:n; break;                    
         case 23: s += num.getUTCFullYear()-1970; break;                   
         case 24: s += jy; break;                                          
//      case 31: s += num.getUTCDate()-1; break;                           // D (month day from 0) 
         case 32: s += Math.floor((num-0+0.5)/86400000%7); break;                  
         case 33:                                                          
            var ddd = new Date(num.getUTCFullYear(),0,1);
            s += Math.round((num - ddd) / 86400000);
            break;
         case 34: s += Math.floor((this.ExcelDates?num-0+2209161600000.5:num-0+0.5) / 86400000); break;                  
         case 35: s += Math.floor((this.ExcelDates?num-0+2209161600000.5:num-0+0.5) / 604800000); break;                 
         case 36: n = jd; s += (n<10?"":Math.floor(n/10+0.0001)); break;          
         case 37: n = jd; s += n%10; break;                                

         case 41 : n = (gmt?num.getUTCHours():num.getHours())%12; if(!n) n = 12; s += n; break; 
         case 42 : n = (gmt?num.getUTCHours():num.getHours())%12; if(!n) n = 12; s += n<10?"0"+n:n; break;     
         case 43 : s += Math.floor((this.ExcelDates?num-0+2209161600000.5:num-0+0.5)/3600000); break;                    
         case 44 : n = (gmt?num.getUTCHours():num.getHours())%12; if(!n) n = 12; s += (n<10?"":Math.floor(n/10+0.0001)); break;  
         case 45 : n = (gmt?num.getUTCHours():num.getHours())%12; if(!n) n = 12; s += n%10; break;  
         case 51 : s += gmt?num.getUTCHours():num.getHours(); break;                          
         case 52 : n = gmt?num.getUTCHours():num.getHours(); s += n<10?"0"+n:n; break;        
         case 54 : n = gmt?num.getUTCHours():num.getHours(); s += (n<10?"":Math.floor(n/10+0.0001)); break;  
         case 55 : n = gmt?num.getUTCHours():num.getHours(); s += n%10; break;                
         case 61 : s += gmt?num.getUTCMinutes():num.getMinutes(); break;                        
         case 62 : n = gmt?num.getUTCMinutes():num.getMinutes(); s += n<10?"0"+n:n; break;      
         case 63 : s += Math.floor((this.ExcelDates?num-0+2209161600000.5:num-0+0.5)/60000); break;                      
         case 64 : n = gmt?num.getUTCMinutes():num.getMinutes(); s += (n<10?"":Math.floor(n/10+0.0001)); break;  
         case 65 : n = gmt?num.getUTCMinutes():num.getMinutes(); s += n%10; break;              
         case 71 : s += num.getUTCSeconds(); break;                        
         case 72 : n = num.getUTCSeconds(); s += n<10?"0"+n:n; break;      
         case 73 : s += Math.floor((this.ExcelDates?num-0+2209161600000.5:num-0+0.5)/1000); break;                       
         case 74 : n = num.getUTCSeconds(); s += (n<10?"":Math.floor(n/10+0.0001)); break;  
         case 75 : n = num.getUTCSeconds(); s += n%10; break;              
         case 81 : s += (gmt?num.getUTCHours():num.getHours())<12?f[8]:f[9]; break;             
         case 101 : s += Math.floor(num.getUTCMilliseconds()/100+0.0001); break;   
         case 102 : n = Math.floor(num.getUTCMilliseconds()/10+0.0001); s += n<10?"0"+n:n; break;   
         case 103 : n = num.getUTCMilliseconds(); s += n<10?"00"+n:(n<100?"0"+n:n); break;         
         case 104 : s += Math.floor(num.getUTCMilliseconds()/10+0.0001)%10; break;                  
         case 105 : s += num.getUTCMilliseconds()%10; break;                                       
         default: 
            n = -num.getTimezoneOffset();
             if(n<0){ s+="-"; n=-n; } else s+="+";
             s += (n<600&&f[i]==92||f[i]==94||f[i]==95 ? "0":"") + Math.round(n/60);
             if(f[i]>=93){ n = n%60; s += (f[i]==95?"":":") + (n<10?"0":"") + n; }
            break;
         }
      s+=f[i+1];   
      }
   return s;
   }
ME.Hirji;

if(f[2]=="0") for(var i=13;i<len;i+=2){
   switch(f[i]){
      case 1: s += num.getUTCDate(); break;                             
      case 2: n = num.getUTCDate(); s += n<10?"0"+n:n; break;           
      case 3: s += f[6][num.getUTCDay()]; break;                        
      case 6: s += f[7][num.getUTCDate()-1]; break;                     
      case 7:                                                           
      case 8:
      case 25: 
         var prev = 0, n = Date.UTC(num.getUTCFullYear(),0,1), d = (new Date(n)).getUTCDay()-this.FirstWeekDay; if(d<0) d += 7;
         if(d>6-this.FirstWeekYearDay) {
            if(n>num-(7-d)*86400000) { 
               prev = 1; 
               n = Date.UTC(num.getUTCFullYear()-1,0,1); 
               d = (new Date(n)).getUTCDay()-this.FirstWeekDay; if(d<0) d += 7; 
               if(d<=6-this.FirstWeekYearDay) d += 7; 
               }
            d -= 7;
            }
         n = Math.ceil((((num - n) / 86400000) + d+1)/7);
         if(n==53 && this.FirstWeekYearDay && !prev){
            d = (new Date(Date.UTC(num.getUTCFullYear()+1,0,1))).getUTCDay()-this.FirstWeekDay; if(d<0) d += 7;
            if(d<=6-this.FirstWeekYearDay) n = 1;
            }
         if(f[i]==25) s += num.getUTCFullYear() + (n==1&&num.getUTCMonth()==11 ? 1 : 0);
         else s += n<10&&f[i]==8?'0'+n:n;
         break;
      case 11: s += num.getUTCMonth()+1; break;                         
      case 12: n = num.getUTCMonth()+1; s += n<10?"0"+n:n; break;       
      case 13: s += f[5][num.getUTCMonth()]; break;                     
      case 15: s += f[5][Math.floor(num.getUTCMonth()/3+0.0001)]; break;       
      case 16: s += f[5][Math.floor(num.getUTCMonth()/6+0.0001)]; break;       
      case 21: s += num.getUTCFullYear()%100; break;                    
      case 22: n = num.getUTCFullYear()%100; s += n<10?"0"+n:n; break;  
      case 23: s += num.getUTCFullYear()-1970; break;                   
      case 24: s += num.getUTCFullYear(); break;                        
      
//      case 31: s += num.getUTCDate()-1; break;                          // D (month day from 0) 
      case 32: s += Math.floor((num-0+0.5)/86400000%7); break;          
      case 33:                                                          
         n = new Date(num.getUTCFullYear(),0,1);
         s += Math.round((num - n) / 86400000);
         break;
      case 34: s += Math.floor((this.ExcelDates?num-0+2209161600000.5:num-0+0.5) / 86400000); break;                  
      case 35: s += Math.floor((this.ExcelDates?num-0+2209161600000.5:num-0+0.5) / 604800000); break;                 
      case 36: n = num.getUTCDate(); s += (n<10?"":Math.floor(n/10+0.0001)); break; 
      case 37: n = num.getUTCDate(); s += n%10; break;                  
      
      case 41 : n = num.getUTCHours()%12; if(!n) n = 12; s += n; break; 
      case 42 : n = num.getUTCHours()%12; if(!n) n = 12; s += n<10?"0"+n:n; break;     
      case 43 : s += Math.floor((this.ExcelDates?num-0+2209161600000.5:num-0+0.5)/3600000); break;                    
      case 44 : n = num.getUTCHours()%12; if(!n) n = 12; s += (n<10?"":Math.floor(n/10)); break;  
      case 45 : n = num.getUTCHours()%12; if(!n) n = 12; s += n%10; break;  
      case 51 : s += num.getUTCHours(); break;                          
      case 52 : n = num.getUTCHours(); s += n<10?"0"+n:n; break;        
      case 53 : break;                                                  
      case 54 : n = num.getUTCHours(); s += (n<10?"":Math.floor(n/10+0.0001)); break;  
      case 55 : n = num.getUTCHours(); s += n%10; break;                
      case 61 : s += num.getUTCMinutes(); break;                        
      case 62 : n = num.getUTCMinutes(); s += n<10?"0"+n:n; break;      
      case 63 : s += Math.floor((this.ExcelDates?num-0+2209161600000.5:num-0+0.5)/60000); break;                      
      case 64 : n = num.getUTCMinutes(); s += (n<10?"":Math.floor(n/10+0.0001)); break;  
      case 65 : n = num.getUTCMinutes(); s += n%10; break;              
      case 71 : s += num.getUTCSeconds(); break;                        
      case 72 : n = num.getUTCSeconds(); s += n<10?"0"+n:n; break;      
      case 73 : s += Math.floor((this.ExcelDates?num-0+2209161600000.5:num-0+0.5)/1000); break;                       
      case 74 : n = num.getUTCSeconds(); s += (n<10?"":Math.floor(n/10+0.0001)); break;  
      case 75 : n = num.getUTCSeconds(); s += n%10; break;              
      case 81 : s += num.getUTCHours()<12?f[8]:f[9]; break;             
      case 101 : s += Math.floor(num.getUTCMilliseconds()/100+0.0001); break;   
      case 102 : n = Math.floor(num.getUTCMilliseconds()/10+0.0001); s += n<10?"0"+n:n; break;  
      case 103 : n = num.getUTCMilliseconds(); s += n<10?"00"+n:(n<100?"0"+n:n); break;         
      case 104 : s += Math.floor(num.getUTCMilliseconds()/10+0.0001)%10; break;                 
      case 105 : s += num.getUTCMilliseconds()%10; break;                                       
      
      default: 
         n = -num.getTimezoneOffset();
          if(n<0){ s+="-"; n=-n; } else s+="+";
          s += (n<600&&f[i]==92||f[i]==94||f[i]==95 ? "0":"") + Math.round(n/60);
          if(f[i]>=93){ n = n%60; s += (f[i]==95?"":":") + (n<10?"0":"") + n; }
         break;
      }
   s+=f[i+1];   
   }
   
else if(!f[2]) for(var i=13;i<len;i+=2){
   switch(f[i]){
      case 1: s += num.getDate(); break;
      case 2: n = num.getDate(); s += n<10?"0"+n:n; break;
      case 3: s += f[6][num.getDay()]; break;
      case 6: s += f[7][num.getDate()-1]; break;
      case 7:                                                           
      case 8:
      case 25: 
         var prev = 0, n = new Date(num.getFullYear(),0,1), d = n.getDay()-this.FirstWeekDay; if(d<0) d += 7;
         if(d>6-this.FirstWeekYearDay) {
            if(n>num-(7-d)*86400000) { 
               prev = 1; 
               n = new Date(num.getFullYear()-1,0,1); 
               d = n.getDay()-this.FirstWeekDay; if(d<0) d += 7; 
               if(d<=6-this.FirstWeekYearDay) d += 7; 
               }
            d -= 7;
            }
         n = Math.ceil((((num - n) / 86400000) + d+1)/7);
         if(n==53 && this.FirstWeekYearDay && !prev){
            d = (new Date(num.getFullYear()+1,0,1)).getDay()-this.FirstWeekDay; if(d<0) d += 7;
            if(d<=6-this.FirstWeekYearDay) n = 1;
            }
         if(f[i]==25) s += num.getFullYear() + (n==1&&num.getMonth()==11 ? 1 : 0);
         else s += n<10&&f[i]==8?'0'+n:n;
         break;
      case 11: s += num.getMonth()+1; break;
      case 12: n = num.getMonth()+1; s += n<10?"0"+n:n; break;
      case 13: s += f[5][num.getMonth()]; break;
      case 15: s += f[5][Math.floor(num.getMonth()/3)+0.0001]; break;
      case 16: s += f[5][Math.floor(num.getMonth()/6)+0.0001]; break;
      case 21: s += num.getFullYear()%100; break;
      case 22: n = num.getFullYear()%100; s += n<10?"0"+n:n; break;
      case 23: s += num.getFullYear()-1970; break;                      
      case 24: s += num.getFullYear(); break;
//      case 31: s += num.getUTCDate()-1; break;                        // D (month day from 0) 
      case 32: s += Math.floor((num-0+0.5)/86400000%7); break;          
      case 33:                                                          
         var ddd = new Date(num.getFullYear(),0,1);
         s += Math.round((num - ddd) / 86400000);
         break;
      case 34: s += Math.floor((this.ExcelDates?num-0+2209161600000.5:num-0+0.5)/86400000-num.getTimezoneOffset()/1440); break;                  
      case 35: s += Math.floor((this.ExcelDates?num-0+2209161600000.5:num-0+0.5)/604800000-num.getTimezoneOffset()/10080); break;                 
      case 36: n = num.getDate(); s += (n<10?"":Math.floor(n/10)); break; 
      case 37: n = num.getDate(); s += n%10; break;                  

      case 41 : n = num.getHours()%12; if(!n) n = 12; s += n; break; 
      case 42 : n = num.getHours()%12; if(!n) n = 12; s += n<10?"0"+n:n; break;     
      case 43 : s += Math.floor((this.ExcelDates?num-0+2209161600000.5:num-0+0.5)/3600000-num.getTimezoneOffset()/60); break;     
      case 44 : n = num.getHours()%12; if(!n) n = 12; s += (n<10?"":Math.floor(n/10+0.0001)); break;  
      case 45 : n = num.getHours()%12; if(!n) n = 12; s += n%10; break;  
      case 51 : s += num.getHours(); break;
      case 52 : n = num.getHours(); s += n<10?"0"+n:n; break;
      case 54 : n = num.getHours(); s += (n<10?"":Math.floor(n/10+0.0001)); break;  
      case 55 : n = num.getHours(); s += n%10; break;                
      case 61 : s += num.getMinutes(); break;
      case 62 : n = num.getMinutes(); s += n<10?"0"+n:n; break;
      case 63 : s += Math.floor((this.ExcelDates?num-0+2209161600000.5:num-0+0.5)/60000-num.getTimezoneOffset()); break;         
      case 64 : n = num.getMinutes(); s += (n<10?"":Math.floor(n/10+0.0001)); break;  
      case 65 : n = num.getMinutes(); s += n%10; break;              
      case 71 : s += num.getSeconds(); break;
      case 72 : n = num.getSeconds(); s += n<10?"0"+n:n; break;
      case 73 : s += Math.floor((this.ExcelDates?num-0+2209161600000.5:num-0+0.5)/1000-num.getTimezoneOffset()*60); break;       
      case 74 : n = num.getSeconds(); s += (n<10?"":Math.floor(n/10+0.0001)); break;  
      case 75 : n = num.getSeconds(); s += n%10; break;              
      case 81 : s += num.getHours()<12?f[8]:f[9]; break;
      case 101 : s += Math.floor(num.getMilliseconds()/100+0.0001); break;   
      case 102 : n = Math.floor(num.getMilliseconds()/10+0.0001); s += n<10?"0"+n:n; break;   
      case 103 : n = num.getMilliseconds(); s += n<10?"00"+n:(n<100?"0"+n:n); break;         
      case 104 : s += Math.floor(num.getMilliseconds()/10+0.0001)%10; break;                  
      case 105 : s += num.getMilliseconds()%10; break;                                       
      default:
         n = -num.getTimezoneOffset();
          if(n<0){ s+="-"; n=-n; } else s+="+";
          s += (n<600&&f[i]==92||f[i]==94||f[i]==95 ? "0":"") + Math.round(n/60);
          if(f[i]>=93){ n = n%60; s += (f[i]==95?"":":") + (n<10?"0":"") + n; }
         break;
      }
   s+=f[i+1];   
   }
return s;
}
// ---------------------------------------------------------------------------------------------------------------------------
PFormat.PrepareDateFormat = function(f,sep){
if(!f) return "";
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
if(this.DateFormatLowercase==2) f = f.toLowerCase();
if(f.indexOf("[")>=0){
   f = f.replace("[y]","yyy").replace("[yy]","yyy").replace("[yyyy]","yyy").replace("[d]","DDD").replace("[dd]","DDD").replace("[h]","hhh").replace("[hh]","hhh").replace("[H]","hhh").replace("[HH]","hhh").replace("[m]","mmm").replace("[mm]","mmm").replace("[s]","sss").replace("[ss]","sss");
   }
if(f.indexOf(":ss.0")>=0){
   if(!sep) sep = this.DecimalSeparator;
   f = f.replace(":ss.000",":ss"+sep+"fff").replace(":ss.00",":ss"+sep+"ff").replace(":ss.0",":ss"+sep+"f");
   }
return f;
}
// ---------------------------------------------------------------------------------------------------------------------------
//              0     1    2     3    4   5        6       7    8  9  10         11,         12, 13, ...
PFormat.ParseDateFormat = function(f,edit){
if(!f) return null;
f += "";
var ff = f, F = [null,null,this.GMT-0?0:null,this.EmptyDate?this.EmptyDate:"",this.NaD];
if(f.length==1){
   if(f=='U') F[2] = 0; 
   if(f=='R' || f=='r') F[2] = null; 
   }
f = this.PrepareDateFormat(f);
var p = 12, out = "", lout = "", typ = 0, hasd = 0;
for(var i=0;i<f.length;i++){
   switch(f.charAt(i)){
      case '%' : break;
      case '/' : out+=this.DateSeparator; break;
      case ':' : out+=this.TimeSeparator; break;
      case 'd' : 
         F[p++] = out; out=""; typ |= 1;
         if(f.charAt(i+1)!='d'){ F[p++]=1; hasd = 1; break; }
         i++; if(f.charAt(i+1)!='d'){ F[p++]=2; hasd = 1; break; }
         i++; if(f.charAt(i+1)!='d'){ F[p++]=3; F[6] = this.ShortDayNames; break; }
         i++; if(f.charAt(i+1)!='d'){ F[p++]=3; F[6] = this.LongDayNames;  break; }
         i++; if(f.charAt(i+1)!='d'){ F[p++]=3; F[6] = this.Day1CharNames;  break; }
         i++; if(f.charAt(i+1)!='d'){ F[p++]=6; F[7] = this.DayNumbers; hasd = 1; break; }
         i++; if(f.charAt(i+1)!='d'){ F[p++]=7; break; }
         i++; if(f.charAt(i+1)!='d'){ F[p++]=8; break; }
         F[p++] = ""; break;
      case 'D' :
         if(f.charAt(i+1)!='D') { out+=f.charAt(i); break; } 
         F[p++] = out; out=""; typ |= 1;
         if(f.charAt(i+1)!='D'){ F[p++]=31; break; } 
         i++; if(f.charAt(i+1)!='D'){ F[p++]=32; break; }
         i++; if(f.charAt(i+1)!='D'){ F[p++]=33; break; }
         i++; if(f.charAt(i+1)!='D'){ F[p++]=34; break; }
         i++; if(f.charAt(i+1)!='D'){ F[p++]=35; break; }
         i++; if(f.charAt(i+1)!='D'){ F[p++]=36; break; }
         i++; if(f.charAt(i+1)!='D'){ F[p++]=37; break; }
      case 'M' :
         F[p++] = out; out=""; typ |= 2;
         if(f.charAt(i+1)!='M'){ F[p++] = 11; break; }
         i++; if(f.charAt(i+1)!='M'){ F[p++] = 12; break; }
         i++; if(f.charAt(i+1)!='M'){ F[p++] = 13; F[5] = this.ShortMonthNames; break; }
         i++; if(f.charAt(i+1)!='M'){ F[p++] = 13; F[5] = hasd ? this.LongMonthNames : this.LongMonthNames2; break; }
         i++; if(f.charAt(i+1)!='M'){ F[p++] = 15; F[5] = this.Quarters; break; }
         i++; if(f.charAt(i+1)!='M'){ F[p++] = 16; F[5] = this.Halves; break; }
         i++; if(f.charAt(i+1)!='M'){ F[p++] = 13; F[5] = this.LongMonthNames2; break; }
         i++; if(f.charAt(i+1)!='M'){ F[p++] = 13; F[5] = this.LongMonthNames; break; }
         F[p++] = ""; break;
      case 'y' :
         F[p++] = out; out=""; typ |= 4;
         if(f.charAt(i+1)!='y'){ F[p++] = 21; break; }
         i++; if(f.charAt(i+1)!='y'){ F[p++] = 22; break; }
         i++; if(f.charAt(i+1)!='y'){ F[p++] = 23;  break; }
         i++; if(f.charAt(i+1)!='y'){ F[p++] = 24; break; }
         i++; if(f.charAt(i+1)!='y'){ F[p++] = 25; break; }
         F[p++] = ""; break;
      case 'h' :
         F[p++] = out; out=""; typ |= 8;
         if(f.charAt(i+1)!='h'){ F[p++] = 41; break; }
         i++; if(f.charAt(i+1)!='h'){ F[p++] = 42; break; }
         i++; if(f.charAt(i+1)!='h'){ F[p++] = 43; break; }
         i++; if(f.charAt(i+1)!='h'){ F[p++] = 44; break; }
         F[p++] = ""; break;
      case 'H' :
         F[p++] = out; out=""; typ |= 520; 
         if(f.charAt(i+1)!='H'){ F[p++] = 51; break; }
         i++; if(f.charAt(i+1)!='H'){ F[p++] = 52; break; }
         i++; if(f.charAt(i+1)!='H'){ F[p++] = 53; break; }
         i++; if(f.charAt(i+1)!='H'){ F[p++] = 54; break; }
         i++; if(f.charAt(i+1)!='H'){ F[p++] = 55; break; }
         F[p++] = ""; break;
      case 'm' :
         F[p++] = out; out=""; typ |= typ&16 ? 1024 : 16;
         if(f.charAt(i+1)!='m'){ F[p++] = 61; break; }
         i++; if(f.charAt(i+1)!='m'){ F[p++] = 62; break; }
         i++; if(f.charAt(i+1)!='m'){ F[p++] = 63; break; }
         i++; if(f.charAt(i+1)!='m'){ F[p++] = 64; break; }
         i++; if(f.charAt(i+1)!='m'){ F[p++] = 65; break; }
         i++; if(f.charAt(i+1)!='m'){ F[p++] = 66; break; } 
         F[p++] = ""; break;
      case 's' :
         F[p++] = out; out=""; typ |= 32;
         if(f.charAt(i+1)!='s'){ F[p++] = 71; break; }
         i++; if(f.charAt(i+1)!='s'){ F[p++] = 72; break; }
         i++; if(f.charAt(i+1)!='s'){ F[p++] = 73; break; }
         i++; if(f.charAt(i+1)!='s'){ F[p++] = 74; break; }
         i++; if(f.charAt(i+1)!='s'){ F[p++] = 75; break; }
         F[p++] = ""; break;
      case 'f' :
         F[p++] = out; out=""; typ |= 64;
         if(f.charAt(i+1)!='f'){ F[p++] = 101; break; }
         i++; if(f.charAt(i+1)!='f'){ F[p++] = 102; break; }
         i++; if(f.charAt(i+1)!='f'){ F[p++] = 103; break; }
         i++; if(f.charAt(i+1)!='f'){ F[p++] = 104; break; }
         i++; if(f.charAt(i+1)!='f'){ F[p++] = 105; break; }
         F[p++] = ""; break;
      case 't' :
         F[p++] = out; out=""; typ |= 128;
         if(f.charAt(i+1)!='t'){ F[p++] = 81; F[8] = this.AMDesignator.charAt(0); F[9] = this.PMDesignator.charAt(0); break; }
         i++; if(f.charAt(i+1)!='t'){ F[p++] = 81; F[8] = this.AMDesignator; F[9] = this.PMDesignator; break; }
         F[p++] = ""; break;
      case 'a' :
         if(f.slice(i,i+3)=="a/p") { F[p++] = out; out=""; typ |= 128; i+=2; F[p++] = 81; F[8] = this.AMDesignator.charAt(0); F[9] = this.PMDesignator.charAt(0); break; }
         if(f.slice(i,i+5)=="am/pm") { F[p++] = out; out=""; typ |= 128; i+=4; F[p++] = 81; F[8] = this.AMDesignator; F[9] = this.PMDesignator; break; }
         out+=f.charAt(i);
         break;
      case 'A' :
         if(f.slice(i,i+3)=="A/P") { F[p++] = out; out=""; typ |= 128; i+=2; F[p++] = 81; F[8] = this.AMDesignator.charAt(0); F[9] = this.PMDesignator.charAt(0); break; }
         if(f.slice(i,i+5)=="AM/PM") { F[p++] = out; out=""; typ |= 128; i+=4; F[p++] = 81; F[8] = this.AMDesignator; F[9] = this.PMDesignator; break; }
         out+=f.charAt(i);
         break;
      case 'z' :
         F[p++] = out; out=""; typ |= 256;
         if(f.charAt(i+1)!='z'){ F[p++]=91; break; }
         i++; if(f.charAt(i+1)!='z'){ F[p++]=92; break; }
         i++; if(f.charAt(i+1)!='z'){ F[p++]=93; break; }
         i++; if(f.charAt(i+1)!='z'){ F[p++]=94; break; }
         i++; if(f.charAt(i+1)!='z'){ F[p++]=95; break; }
         break;                  
      case '\\' : i++; out+=f.charAt(i); break;
      case '"' : 
      case "'" :
         var pos = f.indexOf(f.charAt(i),i+1);
         if(pos==-1) break;
         if(!edit) out+=f.substring(i+1,pos); i=pos;
         break;
      case '[' : 
         var q = f.slice(i).indexOf("]");
         if(q>=0){
            q += i; 
            var s = f.slice(i+1,q);
            if(s.charAt(0)=='$'){ 
               
               }
            else if(s.search(/[~!%\^&\*<>=\/\+\-\|\?]/)>=0){ 
               if(s.search(/\s*[=<>!]/)==0) { 
                  var c1 = s.charAt(0), c2 = s.charAt(1), ap = 1;
                  if(c2=='>') { c1 = "!="; ap++; }
                  else if(c2=='=') { c1 += c2; ap++;  }
                  else if(c1=="=") c1 = "==";
                  var vv = s.slice(ap); if(vv.charAt(0)!='"'&&vv.charAt(0)!="'") vv = "'"+vv+"'";
                  if(Try) { F[0] = new Function("Value","Format","return Value-0"+c1+"Format.StringToDate("+vv+")"); }
                  else if(Catch){ if(window.Grids&&Grids[0]) Grids[0].Debug(2,"Incorrect condition in format ",f);}
                  
                  }
               else { 
                  MS.Hirji; s = s.replace(/\byh\b/g,"Format.GregorianToHirji(Value.getUTCFullYear(),Value.getUTCMonth()+1,Value.getUTCDate())[0]").replace(/\bMh\b/g,"(Format.GregorianToHirji(Value.getUTCFullYear(),Value.getUTCMonth()+1,Value.getUTCDate())[1]-1)").replace(/\bdh\b/g,"Format.GregorianToHirji(Value.getUTCFullYear(),Value.getUTCMonth()+1,Value.getUTCDate())[2]"); ME.Hirji;
                  s = s.replace(/\by\b/g,"Value.getUTCFullYear()").replace(/\bM\b/g,"Value.getUTCMonth()").replace(/\bd\b/g,"Value.getUTCDate()").replace(/\bw\b/g,"Value.getUTCDay()").replace(/\bh\b/g,"Value.getUTCHours()").replace(/\bm\b/g,"Value.getUTCMinutes()").replace(/\bs\b/g,"Value.getUTCSeconds()").replace(/\bt\b/g,"Value.getUTCMiliseconds()").replace(/<>/,"!=").replace(/([^=<>\!%\^&*\+\-|])=([^=])/,"$1==$2");
                  
                  if(Try) { F[0] = new Function("Value","Format",(s.search(/\breturn\b/)<0?"return ":"")+s); }
                  else if(Catch){ if(window.Grids&&Grids[0]) Grids[0].Debug(2,"Incorrect condition in format ",f);}
                  }
               }
            else if(!edit) {  
               var clr = f.slice(i+1,q); if(clr-0) clr = this.Colors[clr];
               out = "<span style='color:"+clr+"'>" + out; lout = "</span>";
               }
            i = q;
            }
         else out += f.charAt(i);
         break;
      case ';' : 
         if(F[0]) F[1] = this.ParseDateFormat(f.slice(i+1),edit);
         else {
            var FF = this.ParseNumberFormat(f.slice(i+1));
            if(f.indexOf('@')>=0) F[10] = FF.TextPrefix!=null?FF.TextPrefix:FF.Prefix;
            if(!edit) F[11] = FF.TextPostfix!=null?FF.TextPostfix:FF.Postfix;
            }
         i = f.length;
         break;
      default : out+=f.charAt(i);
      }
   }
if(this.DateFormatLowercase){
   if(typ&16&&typ&5&&!(typ&10)) { 
      for(var i=12,hasd=0;i<F.length;i++) if(F[i]>=60&&F[i]<70) {
         F[i] -= 50; 
         if(F[i]==13) F[5] = this.ShortMonthNames; else if(F[i]==14) { F[i] = 13; F[5] = hasd ? this.LongMonthNames : this.LongMonthNames2; } else if(F[i]==15) F[5] = this.Quarters; else if(F[i]==16) F[5] = this.Halves;
         }
      else if(F[i]==1||F[2]==2||F[i]==6) hasd = 1;
      }
   if(typ&1024 && typ&5 && !(typ&2) && typ&8) { 
      for(var i=12;i<F.length;i++) if(F[i]>=60&&F[i]<70) { 
         F[i] -= 50; 
         if(F[i]==13) F[5] = this.ShortMonthNames; else if(F[i]==14) { F[i] = 13; F[5] = hasd ? this.LongMonthNames : this.LongMonthNames2; } else if(F[i]==15) F[5] = this.Quarters; else if(F[i]==16) F[5] = this.Halves;
         break;
         }
      else if(F[i]==1||F[2]==2||F[i]==6) hasd = 1;
      }
   if((typ&648)==8){ 
      for(var i=12;i<F.length;i++) if(F[i]>=40&&F[i]<43) F[i] += 10; 
      }
   }
F[p] = out+lout;   
this.Parsed[ff+this.GMT+(edit?"+":"-")] = F;
return F;   
}
// ---------------------------------------------------------------------------------------------------------------------------
// Converts string to date (number of milliseconds), possible formats: yyyy-mm-dd, mm-dd, mm/dd/yyyy, mm/dd, dd.mm.yyyy, dd.mm nebo hh:mm, hh:mm:ss

PFormat.StringToDateEng = function(str,def,excel,strict){
if(!str) return this.EmptyDate!=null ? "" : 0;
if(str==this.EmptyDate) return "";
if(this.ExcelDates&&!excel) return (this.StringToDateEng(str,def,1,strict)-0+2209161600000)/86400000;

var M = (str+"").match(strict||this.StrictDates&2&&strict!=0?this.CDateFormatStrict:this.CDateFormat);
if(!M) return strict||this.StrictDates&1 ? NaN : 0;
def = def ? this.StringToDefault(def) : this.CDefault;
var c = M[2], h = M[6], m = M[7], s = M[8];
if(!s) s = def.Sec; else if(this.StrictDates&1&&s>60&&(c||h||m)) return NaN;
if(!m) m = def.Min; else if(this.StrictDates&1&&m>60&&(c||h)) return NaN;
if(!h) h = def.Hour; else if(this.StrictDates&1&&h>24&&c) return NaN;

if(M[9]){
   var a = M[9].charAt(0);
   if(!c) h = M[1];
   if(h<12) { if(a=='p' || a=='P') h = h-0+12; }
   else if(h==12) { if(a=='a' || a=='A') h = 0; }
   if(!c) M[1] = h;      
   }

if(this.GMT-0) {

   if(!c) { 
      if(M[7]) return Date.UTC(1970,0,1,M[1],m,s);                                
      if(!M[1]||M[0]-0+""!=M[0]||M[6]||M[7]||M[8]) return NaN;                    
      return this.StrictDates&1&&M[1]>this.MonthDays[def.Month+1] ? NaN : Date.UTC(def.Year,def.Month,M[1]?M[1]:def.Day);      
      }

   if(M[4]){ 
      if(c=='-'&&M[5]<1000||M[1]>=1000) return this.StrictDates&1&&(M[3]>12||M[5]>this.MonthDays[M[3]]) ? NaN : Date.UTC(M[1]<70?M[5]-0+2000:M[1],M[3]-1,M[5],h,m,s); 
      if(c=='/') return this.StrictDates&1&&(M[1]>12||M[3]>this.MonthDays[M[1]]) ? NaN : Date.UTC(M[5]<70?M[5]-0+2000:M[5],M[1]-1,M[3],h,m,s); 
      if(c=='.') return this.StrictDates&1&&(M[3]>12||M[1]>this.MonthDays[M[3]]) ? NaN : Date.UTC(M[5]<70?M[5]-0+2000:M[5],M[3]-1,M[1],h,m,s); 
      return this.StrictDates&1 ? NaN : 0;
      }

   if(c=='/') {
      if(!h&&!M[4]&&M[5]&&!m&&!s&&(M[3]+M[5])<2100&&(M[3]+M[5])>1900) return this.StrictDates&1&&M[1]>12 ? NaN : Date.UTC(M[3]+M[5],M[1]-1,1,0,0,0); 
      return this.StrictDates&1&&(M[1]>12||M[3]&&M[3]>this.MonthDays[M[1]]||M[5]) ? NaN : Date.UTC(def.Year,M[1]-1,M[3]?M[3]:1,h,m,s); 
      }
   if(c=='-') return this.StrictDates&1&&(M[1]>12||M[3]&&M[3]>this.MonthDays[M[1]]) ? NaN : Date.UTC(def.Year,M[1]-1,M[3]?M[3]:1,h,m,s); 
   if(c=='.') return this.StrictDates&1&&(M[3]&&M[3]>12||M[1]>this.MonthDays[M[3]?M[3]:def.Month]) ? NaN : Date.UTC(def.Year,M[3]?M[3]-1:def.Month,M[1],h,m,s); 
   return this.StrictDates&1 ? NaN : 0;
   }

if(!c){ 
   if(M[7]) return (new Date(1970,0,1,M[1],m,s)).getTime();                      
   if(!M[1]&&M[0]-0+""!=M[0]) return NaN;                                        
   return this.StrictDates&1&&M[1]>this.MonthDays[def.Month+1] ? NaN : (new Date(def.Year,def.Month,M[1]?M[1]:def.Day)).getTime();   
   }

if(M[4]){ 
   if(c=='/') return this.StrictDates&1&&(M[1]>12||M[3]>this.MonthDays[M[1]]) ? NaN : (new Date(M[5]<70?M[5]-0+2000:M[5],M[1]-1,M[3],h,m,s)).getTime(); 
   if(c=='-') return this.StrictDates&1&&(M[3]>12||M[5]>this.MonthDays[M[3]]) ? NaN : (new Date(M[1]<70?M[5]-0+2000:M[1],M[3]-1,M[5],h,m,s)).getTime(); 
   if(c=='.') return this.StrictDates&1&&(M[3]>12||M[1]>this.MonthDays[M[3]]) ? NaN : (new Date(M[5]<70?M[5]-0+2000:M[5],M[3]-1,M[1],h,m,s)).getTime(); 
   return this.StrictDates&1 ? NaN : 0;
   }

if(c=='/') {
   if(!h&&!M[4]&&M[5]&&!m&&!s&&(M[3]+M[5])<2100&&(M[3]+M[5])>1900) return this.StrictDates&1&&M[1]>12 ? NaN : new (Date(M[3]+M[5],M[1]-1,1,0,0,0)).getTime(); 
   return this.StrictDates&1&&(M[1]>12||M[3]&&M[3]>this.MonthDays[M[1]]) ? NaN : (new Date(def.Year,M[1]-1,M[3]?M[3]:1,h,m,s)).getTime(); 
   }
if(c=='-') return this.StrictDates&1&&(M[1]>12||M[3]&&M[3]>this.MonthDays[M[1]]) ? NaN : (new Date(def.Year,M[1]-1,M[3]?M[3]:1,h,m,s)).getTime(); 
if(c=='.') return this.StrictDates&1&&(M[3]&&M[3]>12||M[1]>this.MonthDays[M[3]?M[3]:def.Month]) ? NaN : (new Date(def.Year,M[3]?M[3]-1:def.Month,M[1],h,m,s)).getTime(); 
return this.StrictDates&1 ? NaN : 0;
}
// ---------------------------------------------------------------------------------------------------------------------------
PFormat.StringToDefault = function(str){
var d = this.Defaults[str]; if(d) return d;
d = this.StringToDateEng(str);
if(!d) d = this.CDefault;
else {
   var D = new Date(d); d = { };
   if(this.GMT){
      d.Year = D.getUTCFullYear(); d.Month = D.getUTCMonth(); d.Day = D.getUTCDate();
      d.Hour = D.getUTCHours(); d.Min = D.getUTCMinutes(); d.Sec = D.getUTCSeconds();
      }
   else {
      d.Year = D.getFullYear(); d.Month = D.getMonth(); d.Day = D.getDate();
      d.Hour = D.getHours(); d.Min = D.getMinutes(); d.Sec = D.getSeconds();
      }
   d.Day1 = D.Day;
   MS.Hirji;
   var A = this.GregorianToHirji(d.Year,d.Month+1,d.Day);
   d.YearHirji = A[0];
   d.MonthHirji = A[1];
   d.DayHirji = A[2];
   ME.Hirji;
   }
this.Defaults[str] = d;
return d;
}
// ---------------------------------------------------------------------------------------------------------------------------
PFormat.ReturnDate = function(y,m,d,h,n,s,def,spent){ 
MS.Hirji;
if(this.Hirji&1&&!spent&&(y||m!=null||d)) {
   if(!y) y = m!=null||d ? def.YearHirji : 1970;
   else if(y==1970) y = 1300;
   else if(this.HirjiYear && y<this.HirjiYear && y>=0) y = y-0+1400;
   else if(y<100 && y>=0) y = y-0+1300;
   if(m==null) m = d ? def.MonthHirji-1 : 0;   
   if(!d) d = 1;
   if(this.StrictDates&1&&(m>11||m<0||d>this.HirjiMonthDays[m-0+1]||d<1)) return NaN;
   var A = this.HirjiToGregorian(y-0,m-0+1,d-0);
   y = A[0]; m = A[1]-1; d = A[2];
   }
ME.Hirji;
if(!y){ y = m!=null||d ? def.Year : 1970; }
else if(y<100){ if(y<70) y=y-0+2000; else y=y-0+1900; }
if(m==null) m = d ? def.Month : 0;
if(d==null) d = 1;
if(this.StrictDates&1&&(m>11||m<0||(!spent||!(this.StrictDates&16))&&d>this.MonthDays[m-0+1]||d<1)) return NaN;
if(!d) d = 1;
if(this.GMT){
   var b = Date.UTC(y,m,d,h,n,s);
   if((this.StrictDates&17)!=1) return b;
   var a = new Date(b);
   return a.getUTCFullYear()==y&&a.getUTCMonth()==m&&a.getUTCDate()==d&&a.getUTCHours()==h&&a.getUTCMinutes()==n&&a.getUTCSeconds()==s ? b : NaN;
   }
else {
   var a = new Date(y,m,d,h,n,s); b = a.getTime();
   if((this.StrictDates&17)!=1) return b;
   return (this.StrictDates&17)!=1||a.getFullYear()==y&&a.getMonth()==m&&a.getDate()==d&&a.getHours()==h&&a.getMinutes()==n&&a.getSeconds()==s ? b : NaN;
   }
}
// ---------------------------------------------------------------------------------------------------------------------------
PFormat.StringToDate = function(str,f,range,def,excel,strict){
if(!str) return this.EmptyDate!=null ? "" : 0;
if(str==this.EmptyDate) return "";

MS.Range;
if(range){
   var A = str.split(this.ValueSeparator);
   if(def) { def = def.split ? def.split(this.RangeSeparator) : [def]; if(!def[1]) def[1] = def[0]; }
   else def = [];
   for(var i=0;i<A.length;i++){
      var B = A[i].split(this.RangeSeparator);
      for(var j=0;j<B.length;j++) B[j] = this.StringToDate(B[j],f,0,def[j],excel,strict);
      A[i] = B.join(this.RangeSeparator); 
      }
   return A.join(this.ValueSeparator); 
   }
ME.Range;

if(this.ExcelDates&&!excel) {
   var v = this.StringToDate(str,f,0,def,1)-0;
   if((v<0||v>=86400000)&&(!f||f.search(/\b(hhh|HHH|mmm|sss|DDDD|yyy)\b|\[[dyhms]\]/)<0)) v += 2209161600000;
   return v/86400000;
   
   }
def = def ? this.StringToDefault(def) : this.CDefault;

if(f){
   if(f.length==1){
      f = this[f];
      if(!f) return this.DateToStringEng(str,null,1);
      }
   f = f.replace(/\'[^\']*\'|\"[^\"]*\"|\\\S|\%/g,"");
   }

if(this.StrictDates&8 && str-0 && f && !(str%1) && str.replace(/\s/g,"").length>=3 && f.search(/\b(hhh|HHH|mmm|sss|DDDD|yyy)\b|\[[dyhms]\]/)<0){
   str = str.replace(/\s/g,"")
   var ok = 0, len = str.length; 
   var h=0,n=0,s=0;
   if(f.search(/[dMy]/)<0){ 
      if(len==6){ h = str.slice(0,2)-0; n = str.slice(2,4)-0; s = str.slice(4,6)-0; ok = 1; } 
      else if(len==5){ h = str.slice(0,1)-0; n = str.slice(1,3)-0; s = str.slice(3,5)-0; ok = 1; } 
      else if(len==4){
         if(f.search(/h/i)>=0){ h = str.slice(0,2)-0; n = str.slice(2,4)-0; ok = 1; } 
         else { n = str.slice(0,2)-0; s = str.slice(2,4)-0; ok = 1; } 
         }   
      else if(len==3){
         if(f.search(/h/i)>=0){ h = str.slice(0,1)-0; n = str.slice(1,3)-0; ok = 1; } 
         else { n = str.slice(0,1)-0; s = str.slice(1,3)-0; ok = 1; } 
         }
      if(ok) return this.ReturnDate(null,null,null,h,n,s,def);
      }
   else { 
      var d = def.Day1, m = null, y = null;
      if(len==3){
         if(f.search(/[mM]+\W*d+/)>=0){ m = str.slice(0,1)-1; d = str.slice(1,3)-0; ok = 1; }      
         else if(f.search(/d+\W*[mM]+/)>=0){ d = str.slice(0,1)-0; m = str.slice(1,3)-1; ok = 1; } 
         }
      else if(len==4){
         if(f.search(/[mM]+\W*d+/)>=0){ m = str.slice(0,2)-1; d = str.slice(2,4)-0; ok = 1; }      
         else if(f.search(/d+\W*[mM]+/)>=0){ d = str.slice(0,2)-0; m = str.slice(2,4)-1; ok = 1; } 
         else if(f.search(/y+\W*[mM]+/)>=0){ y = str.slice(0,2)-0; m = str.slice(2,4)-1; y+=y<70?2000:1900; ok = 1; } 
         else if(f.search(/[mM]+\W*y+/)>=0){ m = str.slice(0,2)-1; y = str.slice(2,4)-0; y+=y<70?2000:1900; ok = 1; } 
         }
      else if(len==6){
         if(f.search(/[mM]+\W*d+\W*y+/)>=0){ m = str.slice(0,2)-1; d = str.slice(2,4)-0; y = str.slice(4,6)-0; y+=y<70?2000:1900; ok = 1; }      
         else if(f.search(/d+\W*[mM]+\W*y+/)>=0){ d = str.slice(0,2)-0; m = str.slice(2,4)-1; y = str.slice(4,6)-0; y+=y<70?2000:1900; ok = 1; }      
         else if(f.search(/y+\W*[mM]+\W*d+/)>=0){ y = str.slice(0,2)-0; m = str.slice(2,4)-1; d = str.slice(4,6)-0; y+=y<70?2000:1900; ok = 1; }      
         else if(f.search(/y+\W*d+\W*[mM]+/)>=0){ y = str.slice(0,2)-0; d = str.slice(2,4)-0; m = str.slice(4,6)-1; y+=y<70?2000:1900; ok = 1; }      
         else if(f.search(/y+\W*[mM]+/)>=0){ y = str.slice(0,4)-0; m = str.slice(4,6)-1; ok = 1; } 
         else if(f.search(/[mM]+\W*y+/)>=0){ m = str.slice(0,2)-1; y = str.slice(2,6)-0; ok = 1; } 
         }
      else if(len==8){
         if(f.search(/[mM]+\W*d+\W*y+/)>=0){ m = str.slice(0,2)-1; d = str.slice(2,4)-0; y = str.slice(4,8)-0; ok = 1; }      
         else if(f.search(/d+\W*[mM]+\W*y+/)>=0){ d = str.slice(0,2)-0; m = str.slice(2,4)-1; y = str.slice(4,8)-0; ok = 1; }      
         else if(f.search(/y+\W*[mM]+\W*d+/)>=0){ y = str.slice(0,4)-0; m = str.slice(4,6)-1; d = str.slice(6,8)-0; ok = 1; }      
         else if(f.search(/y+\W*d+\W*[mM]+/)>=0){ y = str.slice(0,4)-0; d = str.slice(4,6)-0; m = str.slice(6,8)-1; ok = 1; }      
         }
      if(ok) return this.ReturnDate(y,m,d,def.Hour,def.Min,def.Sec,def);
      }   
   }   

if(!this["EditDateRegex"]) this.Init();
var M = (str+"").toUpperCase().match(this["EditDateRegex"+(strict||this.StrictDates&2?"Strict":"")+(this.StrictDates&16||f&&f.search(/\b(hhh|HHH|mmm|sss|DDDD|yyy)\b|\[[dyhms]\]/)>=0?"Elapsed":"")]);
if(!M) return strict||this.StrictDates&1 ? NaN : 0;

var h = M[7]; 
if(h==null) h = def.Hour; else if(M[12]) h = h-(h==12?12:0)+(this.EditPM[M[12]]?12:0); else h -= 0;
var m = M[9]; if(m==null) m = def.Min; else if((this.StrictDates&17)==1 && m>=60) return NaN; else m -= 0;
var s = M[11]; if(s==null) s = def.Sec; else if((this.StrictDates&17)==1 && s>=60) return NaN; else s -= 0;

if(M[1]==null) {
   if(M[6]&&!M[9]&&!M[12]&&(this.StrictDates&2||strict)) return NaN;                                                                        
   if(M[7]==null) return str-0=="0" ? (this.EmptyDate!=null ? "" : 0) : (strict||this.StrictDates&1 ? NaN : 0);
   if(f&&M[11]==null&&!M[12]&&f.search(/^[^Hh]*m+\W*s+|^[^Hhm]\W*sss/)>=0) return this.ReturnDate(null,null,null,def.Hour,h,m,def);         
   return this.ReturnDate(null,null,null,h,m,s,def);                                                                                        
   }

if(M[6]&&(strict||this.StrictDates&2)&&!M[7]) return NaN;

if(M[5]&&M[5].length>4&&!this.EditMonths[M[5]]) M[5] = M[5].slice(-4); 
if(M[1].length>4&&!this.EditMonths[M[1]]) M[1] = M[1].slice(0,4); 

if(!(M[1]-0.5)){
   if(M[5]&&!M[4]&&f&&f.search(/[^y]*d+[^y]*[Hh]+/)>=0) return this.ReturnDate(null,this.EditMonths[M[1]],M[3],M[5],m,s,def);                
   if(M[3]>1000||(!M[5]||M[5]<1000)&&f&&f.search(/[mM]+\W*y+/)>=0) return this.ReturnDate(M[3],this.EditMonths[M[1]],M[5]==null?def.Day1:M[5],h,m,s,def);  
   return this.ReturnDate(M[5],this.EditMonths[M[1]],M[3]==null?def.Day1:M[3],h,m,s,def);                                                    
   }

if(!M[3]) {
   if(M[6]&&!M[7]&&(this.StrictDates&2||strict)) return NaN;                                                          
   if(f&&f.search(/DDD/)>=0) return this.ReturnDate(1970,0,M[1]-0+1,h,m,s,def,1);                                     
   if(M[7]||!f||f&&f.search(/d/)>=0) return this.ReturnDate(null,null,M[1],h,m,s,def);                                
   if(f?f.search(/[dMy]/)<0:M[1]<1000) {
      if(f.search(/^[^Hhms]*s+/)>=0) return this.ReturnDate(null,null,null,h,m,M[1]-0,def);                           
      if(f.search(/^[^Hhm]*m+/)>=0) return this.ReturnDate(null,null,null,h,M[1]-0,s,def);                            
      return this.ReturnDate(null,null,null,M[1]-0,m,s,def);                                                          
      }
   if(M[1]>1000||f.search(/M|m+\Wy+|y+\Wm+/)<0) return this.ReturnDate(M[1],null,def.Day1,h,m,s,def);             
   return this.ReturnDate(null,M[1]-1,def.Day1,h,m,s,def);                                                        
   }

if(!(M[3]-0.5)){
   if(M[5]&&!M[4]&&M[1]<1000&&f&&f.search(/^[^y]*d+[^y]*[Hh]+/)>=0) return this.ReturnDate(null,this.EditMonths[M[3]],M[1],M[5],m,s,def);      
   if(M[1]>1000||(!M[5]||M[5]<1000)&&f&&f.search(/y+\W*[mM]+/)>=0) return this.ReturnDate(M[1],this.EditMonths[M[3]],M[5]==null?def.Day1:M[5],h,m,s,def); 
   return this.ReturnDate(M[5],this.EditMonths[M[3]],M[1],h,m,s,def); 
   }

if(!M[5]){
   if(!M[2]&&f&&f.search(/^[^y]*d+[^y]*[Hh]+/)>=0) return this.ReturnDate(null,null,M[1],M[3],m,s,def);        
   if(M[1]>1000||M[3]<1000&&f&&f.search(/^[^d]*y+\W*[mM]+[^d]*$/)>=0) return this.ReturnDate(M[1],M[3]-1,def.Day1,h,m,s,def); 
   if(M[3]>1000||f&&f.search(/^[^d]*[mM]+\W*y+[^d]*$/)>=0) return this.ReturnDate(M[3],M[1]-1,def.Day1,h,m,s,def);            
   if(f ? f.search(/[Mm]+\W*d+/)>=0 : M[2]=='/') return this.ReturnDate(null,M[1]-1,M[3],h,m,s,def);               
   return this.ReturnDate(null,M[3]-1,M[1],h,m,s,def);                                                             
   }

if(!(M[5]-0.5)){
   if(M[1]>1000||M[3]<1000&&f&&f.search(/y+\W*d+/)>=0) return this.ReturnDate(M[1],this.EditMonths[M[5]],M[3],h,m,s,def); 
   return this.ReturnDate(M[3],this.EditMonths[M[5]],M[1],h,m,s,def);                                                     
   }

if(M[1]>1000||M[3]<1000&&M[5]<1000&&(f?f.search(/^[^dmM]*y+/)>=0:M[2]=='-')){
   if(f&&f.search(/d+\W*[mM]+/)>=0) return this.ReturnDate(M[1],M[5]-1,M[3],h,m,s,def);                                   
   return this.ReturnDate(M[1],M[3]-1,M[5],h,m,s,def);                                                                    
   }

if(M[3]>1000||M[5]<1000&&f&&f.search(/d+\W*y+\W*[mM]+|[mM]+\W*y+\W*d+/)>=0){
   if(f&&f.search(/d+\W*y+\W*[mM]+/)>=0) return this.ReturnDate(M[3],M[5]-1,M[1],h,m,s,def);                              
   return this.ReturnDate(M[3],M[1]-1,M[5],h,m,s,def);                                                                    
   }

var y = M[5]; if(y<1000&&!M[4]&&f&&f.search(/^[^y]*d+[^y]*[Hh]+/)>=0) { y = null; h = M[5]; } 
if(f?f.search(/d+\W*[mM]+/)>=0:M[2]=='.') return this.ReturnDate(y,M[3]-1,M[1],h,m,s,def);                                
return this.ReturnDate(y,M[1]-1,M[3],h,m,s,def);                                                                          

}
// -----------------------------------------------------------------------------------------------------------
MS.Hirji;
// -----------------------------------------------------------------------------------------------------------
PFormat.CGregMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
PFormat.CHirjiMonths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
// -----------------------------------------------------------------------------------------------------------
PFormat.HirjiToGregorian = function(jy,jm,jd) {
jy -= 979; jm--; jd--;
var j_day_no = 365*jy + Math.floor(jy / 33)*8 + Math.floor((jy%33+3) / 4);
for(var i=0;i<jm;i++) j_day_no += this.CHirjiMonths[i];
j_day_no += jd;
var g_day_no = j_day_no+79;
var gy = 1600 + 400 * Math.floor(g_day_no / 146097); 
g_day_no = g_day_no % 146097;

var leap = true;
if (g_day_no >= 36525) { 
   g_day_no--;
   gy += 100*Math.floor(g_day_no/36524); 
   g_day_no = g_day_no % 36524;
   if (g_day_no >= 365)   g_day_no++;
   else leap = false;
   }

gy += 4*Math.floor(g_day_no/ 1461); 
g_day_no %= 1461;

if (g_day_no >= 366) {
   leap = false;
   g_day_no--;
   gy += Math.floor(g_day_no/ 365);
   g_day_no = g_day_no % 365;
     }

for (var i = 0;g_day_no>=this.CGregMonths[i]+(i==1 && leap); i++) g_day_no -= this.CGregMonths[i]+(i==1 && leap);
var gm = i+1, gd = g_day_no+1;
return [gy, gm, gd];
}
// -----------------------------------------------------------------------------------------------------------
PFormat.GregorianToHirji = function(gy,gm,gd){
gy -= 1600; gm -= 1; gd -= 1;
var g_day_no = 365*gy+Math.floor((gy+3) / 4)-Math.floor((gy+99)/100)+Math.floor((gy+399)/400);

for (var i=0; i < gm; ++i)   g_day_no += this.CGregMonths[i];
if (gm>1 && ((gy%4==0 && gy%100!=0) || (gy%400==0))) g_day_no++; 

g_day_no += gd;
var j_day_no = g_day_no-79;
var j_np = Math.floor(j_day_no/ 12053);
j_day_no %= 12053;

var jy = 979+33*j_np+4*Math.floor(j_day_no/1461);
j_day_no %= 1461;

if (j_day_no >= 366) {
   jy += Math.floor((j_day_no-1)/ 365);
   j_day_no = (j_day_no-1)%365;
   }

for (var i=0;i<11&&j_day_no>=this.CHirjiMonths[i];i++) j_day_no -= this.CHirjiMonths[i];
var jm = i+1, jd = j_day_no+1;
return [jy, jm, jd];
}
// -----------------------------------------------------------------------------------------------------------
// Converts string to date
PFormat.StringToDateHirji = function(str,def){
var gmt = this.GMT-0;
if(!str) return 0;
var M = str.match(this.CDateFormat);
if(!M) return 0;
var c = M[2], h = M[6], m = M[7], s = M[8];
if(!c && !h && m && M[1]) { 
   if(gmt) return new Date(Date.UTC(1970,0,1,M[1]-0,m-0,s?s-0:0));
   return new Date(1970,0,1,M[1]-0,m-0,s?s-0:0);
   } 
if(!h) h = 0; if(!m) m = 0; if(!s) s = 0;
if(!c) return 0;
var J;
if(M[4]) J = this.HirjiToGregorian(M[5]>1000?M[5]:M[1],M[3],M[5]>1000?M[1]:M[5]);
else {
   
   def = def ? this.StringToDefault(def) : this.CDefault;
   J = this.HirjiToGregorian(def.YearHirji,M[1]-1,M[3]);
   }
if(gmt) return Date.UTC(J[0],J[1]-1,J[2],h,m,s); 
return (new Date(J[0],J[1]-1,J[2],h,m,s)).getTime(); 
}
// -----------------------------------------------------------------------------------------------------------
var A = PFormat.GregorianToHirji(PFormat.CDefault.Year,PFormat.CDefault.Month,PFormat.CDefault.Day);
PFormat.CDefault.YearHirji = A[0];
PFormat.CDefault.MonthHirji = A[1];
PFormat.CDefault.DayHirji = A[2];
// -----------------------------------------------------------------------------------------------------------
ME.Hirji;
// -----------------------------------------------------------------------------------------------------------
MS.DatePick;
PFormat.UpdateDateRange = function(str){
var M = str;

if(typeof(M)=="string"){
   M = [];
   var p = 0;
   str = str.split(this.ValueSeparator);
   for(var i=0;i<str.length;i++){
      if(!str[i]) continue;
      var v = str[i].split(this.RangeSeparator);
      if(v[0]=="") M[p++] = v[1]-0.4; 
      else M[p++] = v[0]-0;
      if(v[1]=="") M[p++] = v[0]-0+0.4;   
      else M[p++] = (v[1]==null?v[0]-0:v[1]-0);
      
      }
   }
   
for(var i=0;i<M.length;i+=2){
   var a = M[i], b = M[i+1]; if(a==null) continue;
   a = new Date(a); b = new Date(b);
   a.setDate(a.getDate()-1); a = a.getTime();
   b.setDate(b.getDate()+1); b = b.getTime();
      
   for(var j=0;j<M.length;j+=2){
      if(i==j || M[j]==null) continue;
      if(M[j]>=a && M[j]<=b) {
         if(M[j+1]>=b) M[i+1] = M[j+1];
         if(M[j]==a) M[i] = a;
         M[j] = null; M[j+1] = null;
         i = -2; break; 
         }
      else if(M[j+1]>=a && M[j+1]<=b){
         M[i] = M[j];
         M[j] = null; M[j+1] = null;
         i = -2; break; 
         }
      }
   }
   
for(var N=[],i=0;i<M.length;i+=2) if(M[i]!=null) N[N.length] = i;
N.sort(function(a,b){ return M[a]<M[b]?-1:(M[a]>M[b]?1:(M[a+1]<M[b+1]?-1:(M[a+1]>M[b+1]?1:0))); }); 
for(var O=[],i=0;i<N.length;i++) { O[O.length] = M[N[i]]; O[O.length] = M[N[i]+1]; }
M = O;

var s = "";
for(var i=0;i<M.length;i+=2){
   if(M[i]==null) continue;
   if(s) s += this.ValueSeparator;
   if(M[i]%1) { 
      if(M[i+1]<M[i]+1) { s += this.RangeSeparator + M[i+1]; continue; } 
      else M[i] = Math.round(M[i]); 
      }
   if(M[i+1]%1){ 
      if(M[i+1]<M[i]+1) { s += M[i] + this.RangeSeparator; continue; } 
      else M[i+1] = Math.round(M[i+1]); 
      }
   s += M[i];
   if(M[i+1]!=M[i]) s += this.RangeSeparator + M[i+1];
   }  
return s;      
}
ME.DatePick;
// ---------------------------------------------------------------------------------------------------------------------------
ME.Date;

MS.DatePick;
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
var TCalendar = {     

   Class : "GMPick",  

   CloseClickOut : 1, 
   Edit: 7,           
   Weeks : 1,         
   Popup : 1,         
   CanFocus : 1,      
   RowsPrev : 0,      
   RowsNext : 0,      
   MinHeight : 0,     
   NoScroll : 1,      
   CanEmpty : 1,      
   Texts : { Yesterday:"Yesterday", Today:"Today", Clear:"Clear", Ok:"OK", EmptyTip:"Empty date" }, 

   _nope:0 };

// -----------------------------------------------------------------------------------------------------------
function ShowCalendar(M,P,func,date){
if(!M) M = { };
else M = FromJSON(M);
if(typeof(M)=="string"){ alert("Incorrect setting for Calendar: "+M); return null; }

if(window.Grids && Grids.LastStyle && !M.Class) M.Class = Grids.LastStyle + "Pick";
for(var i in TCalendar) if(M[i]==null) M[i] = TCalendar[i];
Dialogs.Add(M);
if(func) M.OnSave = func;
M.Sep = M.Grid && M.Grid.Sep ? M.Grid.Sep : '-';
M.GridIndex = M.Sep + (M.Grid ? M.Grid.Index : M.id);
if(M.Buttons2==-1) M.Buttons2 = null;

var exc = Formats.ExcelDates;
if(date==null) date = M.Date;
if(M.Range){
   MS.Range;
   M.Multi = []; 
   var p = 0;
   if(!date) { date = new Date(); if(Formats.GMT) date = new Date(date-date.getTimezoneOffset()*60000); }
   else if(M.NoDate) { if(typeof(date)!="object") date = new Date(date-0+""==date?(exc?Math.round(date*86400)*1000-2209161600000:date-0):Formats.StringToDateEng(date,null,1)); }
   else {
      if(typeof(date)=="object"){ 
         if(Formats.GMT-0) date.setUTCHours(0,0,0,0);
         else date.setHours(0,0,0,0);
         date = date.getTime();
         }
      var A = (date+"").split(Formats.ValueSeparator); date = null;
      for(var i=0;i<A.length;i++){
         var B = A[i].split(Formats.RangeSeparator);
         if(exc && (B[0]||B[0]=="0")) B[0] = Math.round(B[0]*86400)*1000-2209161600000;
         if(exc && (B[1]||B[1]=="0")) B[1] = Math.round(B[0]*86400)*1000-2209161600000;
         if(B[0]=="") B[0] = B[1]-0.4;
         if(B[1]=="") B[1] = B[0]-0+0.4;
         if(!date) date = new Date(B[0]-0); 
         M.Multi[p++] = B[0]-0;
         M.Multi[p++] = B[B[1]?1:0]-0;
         }
      }
   ME.Range;   
   }
else if(!date) { date = new Date(); if(Formats.GMT) date = new Date(date-date.getTimezoneOffset()*60000); }
else {
   if(typeof(date)!="object") { date = new Date(date-0+""==date?(exc?Math.round(date*86400)*1000-2209161600000:date-0):Formats.StringToDateEng(date,null,1)); }
   M.DateRaw = date;
   }
if(Formats.GMT-0){ M.Year = date.getUTCFullYear(); M.Month = date.getUTCMonth(); M.Day = M.NoDate?null:date.getUTCDate(); }
else { M.Year = date.getFullYear(); M.Month = date.getMonth(); M.Day = M.NoDate?null:date.getDate(); }
MS.Hirji;
if(Formats.Hirji&1){
   var A = Formats.GregorianToHirji(M.Year,M.Month+1,M.NoDate?date.getUTCDate():M.Day);
   M.Year = A[0]; M.Month = A[1]-1; if(!M.NoDate) M.Day = A[2];
   }
ME.Hirji;   
M.OY = M.Year; M.OM = M.Month; M.OD = M.Day; 

if(M.TimeFormat) M.TimeFormat = M.FormatGetTimePart(M.TimeFormat);
M.Time = Formats.DateToString(date,M.TimeFormat,0,1);

date = M.Now; if(typeof(date)=="string") date = new Date(Formats.StringToDate(date));
if(date==null) date = new Date(); 
if(Formats.GMT-0 && M.Now-0){ M.NY = date.getUTCFullYear(); M.NM = date.getUTCMonth(); M.ND = date.getUTCDate(); } 
else { M.NY = date.getFullYear(); M.NM = date.getMonth(); M.ND = date.getDate(); } 
MS.Hirji;
if(Formats.Hirji&1){
   var A = Formats.GregorianToHirji(M.NY,M.NM+1,M.ND);
   M.NY = A[0]; M.NM = A[1]-1; M.ND = A[2];
   }
ME.Hirji;
if(!M.Edit) M.Edit = 7;
if(M.Edit&1) M.SetHTML();
else M.SetHTMLMY();
M.OnWidth = function(){ M.UpdateIcons(); } 
ShowDialog(M,P);
M.SetInput();
M.FocusTime();
M.NoClickTo = (new Date()).getTime()+300;
return M;
}
var TGShowCalendar = ShowCalendar; if(window["ShowCalendar"]==null) window["ShowCalendar"] = ShowCalendar; 
// -----------------------------------------------------------------------------------------------------------
TCalendar.UpdateIcons = function(){
var D = this.GetBody().firstChild.firstChild.firstChild;
D.style.display = "block";
D.nextSibling.style.display = "block";
}
// -----------------------------------------------------------------------------------------------------------
TCalendar.FormatGetTimePart = function(format){
var t = format.replace(/\[[^;]*\;/,""), tt = "", ch = ' :hHmstz';
if(t.length==1) { t = Formats[t]; if(!t) return ""; }
for(var i=0;i<t.length;i++) {
   var c = t.charAt(i);
   if(ch.indexOf(c)>=0) tt+=c;
   else if(c=='\\') i++;
   else if(c=='"' || c=="'") while(i<t.length && t.charAt(i)!=c) i++;
   }
tt = tt.replace(/(^\s*)|(\s*$)/g,"");
if(Formats.DateFormatLowercase && tt.search(/m+[^m]+m+/)>=0) tt = tt.replace(/m+/,""); 
return tt;
}
// -----------------------------------------------------------------------------------------------------------
TCalendar.FormatMonth = function(){
if(!Formats["CalendarMonth"]) return Formats.LongMonthNames[this.Month]+CNBSP+(Formats.Digits?Formats.ConvertDigits(this.Year,this.Digits):this.Year)+CNBSP;
var d = Date.UTC(this.Year,this.Month,2);
MS.Hirji; if(Formats.Hirji&1) { d = Formats.HirjiToGregorian(this.Year,this.Month+1,1); d = Date.UTC(d[0],d[1]-1,d[2]); } ME.Hirji;
var month = Formats.DateToString(d,Formats["CalendarMonth"],null,1)+CNBSP;
MS.Digits; if(Formats.Digits) month = Formats.ConvertDigits(month,this.Digits); ME.Digits;
return month;
}
// -----------------------------------------------------------------------------------------------------------
TCalendar.SetHTML = function(){

var gmt = Formats.GMT-0;
var fwd = Formats.FirstWeekDay-0;
var m1 = new Date(this.Year,this.Month,0); m1 = m1.getDate(); 
var m2 = new Date(this.Year,this.Month+1,0); m2 = m2.getDate(); 
var d1 = new Date(this.Year,this.Month,1); d1 = d1.getDay(); d1-=fwd; if(d1<0) d1 += 7; 
var wn = this.Weeks ? (Formats.Hirji&1 ? 2 : 1) : 0; 
MS.Hirji;
if(Formats.Hirji&1){
   fwd = 6;
   m1 = Formats.HirjiToGregorian(this.Year,this.Month+1,1); m1 = new Date(m1[0],m1[1]-1,m1[2]); 
   if(m1.getHours()>=12) m1.setDate(m1.getDate()+1);
   d1 =  m1.getDay(); d1-=fwd; if(d1<0) d1 += 7; 
   m1.setDate(m1.getDate()-1); m1 = Formats.GregorianToHirji(m1.getFullYear(),m1.getMonth()+1,m1.getDate())[2]; 
   m2 = Formats.HirjiToGregorian(this.Month==11?this.Year+1:this.Year,this.Month==11 ? 1 : this.Month+2,1); 
   m2 = new Date(m2[0],m2[1]-1,m2[2]); 
   m2.setDate(m2.getDate()-1);
   if(m2.getHours()>=12) m2.setDate(m2.getDate()+1); 
   
   m2 = Formats.GregorianToHirji(m2.getFullYear(),m2.getMonth()+1,m2.getDate())[2]; 
   }
ME.Hirji;   
var A = [], p=0, cp = this.Class; if(BTablet) cp += "Touch "+this.Class;
var cs = " class='"+cp;
A[p++] = "<div onselectstart='return false;' onmouseup='"+this.This+".PickDrag(4);'"+(this.Rtl?" dir='rtl'":"")+">";

// --- month and year ---
if(this.Edit&6){
   A[p++] = "<div"+cs+"BL' onclick='"+this.This+".MYChg(-1);'>"+CNBSP+"</div>";
   A[p++] = "<div"+cs+"BR' onclick='"+this.This+".MYChg(1);'>"+CNBSP+"</div>";
   }
var month = this.FormatMonth();
A[p++] = "<div onmousedown='return false;'"+cs+"MY'><span"+cs+"MYDown"+(BIEA&&!BIEA8&&this.Rtl?" "+this.Class+"MYRtl":"")+" "+this.Class.replace("Pick","HeaderFont")+"' onclick='"+this.This+".Render(1)'>"+month+"</span></div>";

// --- day names ---
A[p++] = "<div onmousedown='return false;'"+cs+"TableParent'>"+CTableCSP0+cs+"Table'"+CTfoot;
var x = fwd, tdc = "<td"+cs+"Cell"+(BTablet?" "+this.Class+"CellTouch":"")+"'><div";
A[p++] = "<tr"+cs+"RowW'>";
if(wn) A[p++] = tdc+(this.CanEmpty?cs+"Empty' id='TGCalendarEmpty"+this.GridIndex+"' title='"+this.Texts.EmptyTip+"' onclick='"+this.This+".Save(\"\");'>"+CNBSP:">")+"</div></td>";
for(var i=0;i<7;i++){
   A[p++] = tdc+cs+"WDN'>"+Formats.Day2CharNames[x+i>=7 ? x+i-7 : x+i]+"</div></td>";
   }
A[p++] = "</tr>";

// --- days ---
var d = 1-d1-(7*this.RowsPrev), ce = !this.ReadOnly;
var sun = -fwd; if(sun<0) sun+=7;
var sat = 6-fwd; if(sat<0) sat+=7;
for(var r=0;r<this.RowsPrev+this.RowsNext+6;r++){
   A[p++] = "<tr"+cs+"Row'>";
   if(wn) {
      var D = gmt ? new Date(Date.UTC(this.Year,this.Month,d+6)) : new Date(this.Year,this.Month,d+6);
      if(this.Multi&&wn!=2) {
         var DD = gmt ? new Date(Date.UTC(this.Year,this.Month,d)) : new Date(this.Year,this.Month,d)
         A[p++] = tdc+cs+"WN' onclick='"+this.This + ".WeekSelect("+(DD-0)+","+(D-0)+");'>";
         }
      else A[p++] = tdc+cs+"W "+cp+"WNE'>";
      var ds = wn==2 ? CNBSP : Formats.DateToString(D,"ddddddd",0,1);
      MS.Digits; if(Formats.Digits) ds = Formats.ConvertDigits(ds,this.Digits); ME.Digits;
      A[p++] = ds+"</td>";
      }
   for(var c=0;c<7;c++){
      var cls="WD"; if(c==sun) cls="Su"; else if(c==sat) cls="Sa";
      var D = gmt ? new Date(Date.UTC(this.Year,this.Month,d)) : new Date(this.Year,this.Month,d);
      var ds = gmt ? D.getUTCDate() : D.getDate();
      if(d<=0 || d>m2) cls = "OM";
      MS.Hirji;
      if(Formats.Hirji&1){
         ds = d;
         if(d<=0) ds = d+m1;
         else if(d>m2) ds = d-m2;
         D = Formats.HirjiToGregorian(this.Year,this.Month+1,d);
         D = gmt ? new Date(Date.UTC(D[0],D[1]-1,D[2])) : new Date(D[0],D[1]-1,D[2]);
         }
      ME.Hirji;   
      if(this.Year==this.NY && this.Month==this.NM && d==this.ND) cls = "Now"; 
      
      if(!this.Multi && this.Year==this.OY && this.Month==this.OM && d==this.OD) cls = "Sel"; 
      
      var cae = this.OnCanEditDate ? this.OnCanEditDate(D) : ce;
      if(cae||cae==null){ 
         var dt = D.getTime(), cc = [cp+cls,cp+"Hover",cp+"Sel",cp+"SelHover"];
         if(this.OnGetCalendarDate) ds = this.OnGetCalendarDate(D,ds,cc,this.Multi);
         MS.Digits; if(Formats.Digits) ds = Formats.ConvertDigits(ds,this.Digits); ME.Digits;
         if(this.Multi) A[p++] = tdc + (this.IsSel(dt) ? cs+"Sel" : cs+cls) + "'"
            + (BTouch?" ontouchstart='this.className=\""+cc[1]+"\";'":"")
            + " onmouseover='this.className="+this.This+".IsSel("+dt+")?\""+cc[3]+"\":\""+cc[1]+"\";"+this.This+".PickDrag(1,"+dt+");'"
            + " onmouseout='this.className="+this.This+".IsSel("+dt+")?\""+cc[2]+"\":\""+cc[0]+"\";"+this.This+".PickDrag(2,"+dt+");'"
            + " onmousedown='"+this.This+".PickDrag(3,"+dt+");TGCancelEvent(event);'"
            
            + " id='TGCalendar"+this.GridIndex+this.Sep+cls+this.Sep+dt+"'"
            
            + ">" + ds + "</div></td>";
         else A[p++] = tdc + cs + cls + "'"
            + (BMouse?" onmouseover='this.className=\""+cc[cls=="Sel"?3:1]+"\";'":"")
            + (BTouch?" ontouchstart='this.className=\""+cc[cls=="Sel"?3:1]+"\";'":"")
            + " onmouseout='this.className=\""+cc[0]+"\";'"
            + " id='TGCalendar"+this.GridIndex+this.Sep+cls+this.Sep+dt+"'"
            + " onclick='"+this.This + ".DayClick("+d+");'>" + ds + "</div></td>"; 
         }
      else A[p++] = tdc+cs+cls+" "+cp+"NE "+cp+cls+"NE'>" + ds + "</div></td>";
      d++; 
      
      }
   A[p++] = "</tr>";
   }
A[p++] = CTableEnd+"</div>";

if(this.TimeFormat && !this.Multi){ 
   this.TimeId = "TGCalendarTime"+this.GridIndex;
   var tt = this.TimeFormat.indexOf('t')>=0 && this.TimeFormat.indexOf('h')>=0;
   var tc = this.This+".EditMode=1;"+this.This+".NoClickTo=new Date()-0+1000;";
   A[p++] = "<div"+cs+"TimeCell' onselectstart='TGCancelEvent(event,1);' ontouchstart='focus(this.firstChild);"+tc+"'><input"+cs+"Time' id='"+this.TimeId+"' type='text'";
   A[p++] = " value='"+this.Time+"'";
   A[p++] = " onkeydown='var k=event.keyCode;if(!k)k=event.charCode;if(k==13)"+this.This+".DayClick(); if(k==27)"+this.This+".Close();TGCancelEvent(event,1)'";
   A[p++] = " onkeypress='if(window.TGTestKeyDate) TGTestKeyDate(event,this,"+(tt?1:0)+")'";
   A[p++] = " onmousedown='TGCancelEvent(event,1);'";
   MS.Touch; if(BTouch) A[p++] = " ontouchstart='"+tc+"'"; ME.Touch; 
   A[p++] = "/></div>";
   }

var cb = this.Buttons; if(cb==null) cb = this.Multi ? 7 : 0;
if(cb){
   var vh = " style='visibility:hidden;'", idp = "id='TGCalendar", ido = this.GridIndex+"'";
   A[p++] = "<div"+cs+"Footer'>";
   var base = " "+this.Class.replace("Pick",""), cls1 = base+"DialogButton", cls2 = base+"DialogButton###";
   var str = "<button"+cs+"Button"+cls1+cls2+"' onmouseover='this.className=\""+this.Class+"Button"+cls1+cls2+cls1+"Hover"+cls2+"Hover "+this.Class+"ButtonHover\"' onmouseout='this.className=\""+this.Class+"Button"+cls1+cls2+"\"'";
   if(cb&8) A[p++] = str.replace(/###/g,"Yesterday")+(cb&8?"":vh)+idp+"Yesterday"+ido+" onclick='"+this.This+".BClick(4);'>"+this.Texts.Yesterday+"</button>";
   A[p++] = str.replace(/###/g,"Today")+(cb&1?"":vh)+idp+"Today"+ido+" onclick='"+this.This+".BClick(3);'>"+this.Texts.Today+"</button>";
   if(cb!=13) A[p++] = str.replace(/###/g,"Clear")+(cb&2?"":vh)+idp+"Clear"+ido+" onclick='"+this.This+".BClick(2);'>"+this.Texts.Clear+"</button>"
   A[p++] = str.replace(/###/g,"Ok")+(cb&4?"":vh)+idp+"Ok"+ido+" onclick='"+this.This+".BClick(1);'>"+this.Texts.Ok+"</button>";
   A[p++] = "</div>";
   }

A[p++] = "</div>";
this.Body = A.join("");
}
// -----------------------------------------------------------------------------------------------------------
TCalendar.SetHTMLMY = function(rec){
var A = [], p=0, cs = " class='"+this.Class; if(BTablet) cs += "2Touch "+this.Class; 
A[p++] = "<div onmouseup='"+this.This+".PickDrag(4);'"+(this.Rtl?" dir='rtl'":"")+">";

// --- month and year ---
A[p++] = "<div"+cs+"BL' onclick='"+this.This+".MYChg(-1);'>"+CNBSP+"</div>";
A[p++] = "<div"+cs+"BR' onclick='"+this.This+".MYChg(1);'>"+CNBSP+"</div>";
var month = this.FormatMonth();
A[p++] = "<div"+cs+"MY"+"'><span"+cs+"MYUp"+(BIEA&&!BIEA8&&this.Rtl?" "+this.Class+"MYRtl":"")+" "+this.Class.replace("Pick","HeaderFont")+"' onclick='"+this.This+".Render(0)'>"+month+"</span></div>";

A[p++] = "<div"+cs+"2SepH"+(BTablet?" "+this.Class+"2SepHTouch":"")+"'>"+CNBSP+"</div>";

// --- month and year ---
A[p++] = "<div"+cs+"2TableParent'>"+CTableCSP0+cs+"2Table'"+CTfoot;
if(!rec) this["FY"] = Math.floor(this.Year/5)*5; if(this.Year-fy<2) fy-=5;
var fy = this["FY"], cp = this.Class; if(BTablet) cp += "2Touch "+this.Class;
for(var i=0;i<6;i++){
   A[p++] = "<tr"+cs+"2Row'>";
   for(var j=0;j<=6;j+=6){
      A[p++] = "<td"+cs+"2CellM"+(BTablet?" "+this.Class+"2CellMTouch":"")+"'><div"+cs+"2M"+(i+j==this.Month?" "+cp+"2MSel":"")+"'"
             + " onmouseover='this.className=\""+cp+"2M"+((i+j==this.Month?" "+cp+"2MSelHover":" "+cp+"2MHover"))+"\";'"
            + " onmouseout='this.className=\""+cp+"2M"+((i+j==this.Month?" "+cp+"2MSel":""))+"\";'"
            + " onclick='"+this.This+".Month="+(i+j)+";"+this.This+".Render(3);'"
            + (BTouch ? " ontouchstart='"+this.This+".NoClickTo=new Date()-0+1000;'" : "") 
            + ">"+Formats.LongMonthNames2[i+j]+"</div></td>";
      }
   A[p++] = "<td"+cs+"2CellSep"+(BTablet?" "+this.Class+"2CellSepTouch":"")+"'><div"+cs+"2Sep"+(BTablet?" "+this.Class+"2SepTouch":"")+"'>"+CNBSP+"</div></td>";
   if(!i){
      A[p++] = "<td"+cs+"2CellY"+(BTablet?" "+this.Class+"2CellYTouch":"")+"'><div"+cs+"2B"+(this.Rtl?"R":"L")+"' onclick='"+this.This+".FY-=5;"+this.This+".Render(3);'>"+CNBSP+"</div></td>";
      A[p++] = "<td"+cs+"2CellY"+(BTablet?" "+this.Class+"2CellYTouch":"")+"'><div"+cs+"2B"+(this.Rtl?"L":"R")+"' onclick='"+this.This+".FY+=5;"+this.This+".Render(3);'>"+CNBSP+"</div></td>";
      }
   else {
      for(var j=-1;j<=4;j+=5){
         A[p++] = "<td"+cs+"2CellY"+(BTablet?" "+this.Class+"2CellYTouch":"")+"'><div"+cs+"2Y"+(fy+i+j==this.Year?" "+cp+"2YSel":"")+"'"
             + " onmouseover='this.className=\""+cp+"2Y"+((fy+i+j==this.Year?" "+cp+"2YSelHover":" "+cp+"2YHover"))+"\";'"
            + " onmouseout='this.className=\""+cp+"2Y"+((fy+i+j==this.Year?" "+cp+"2YSel":""))+"\";'"
            + " onclick='"+this.This+".Year="+(fy+i+j)+";"+this.This+".Render(3);'"
            + (BTouch ? " ontouchstart='"+this.This+".NoClickTo=new Date()-0+1000;'" : "") 
            + ">"+(Formats.Digits?Formats.ConvertDigits(fy+i+j,this.Digits):(fy+i+j))+"</div></td>";
         }
      }
   A[p++] = "</tr>";
   }
A[p++] = CTableEnd+"</div>";

if(this.Buttons2&1 || this.Buttons2==null && (this.TimeFormat||this.Multi||this.Buttons)){
   var base = " "+this.Class.replace("Pick",""), cls1 = base+"DialogButton", cls2 = base+"DialogButtonOk";
   var str = "<button"+cs+"Button"+cls1+cls2+"' onmouseover='this.className=\""+this.Class+"Button"+cls1+cls2+cls1+"Hover"+cls2+"Hover "+this.Class+"ButtonHover\"' onmouseout='this.className=\""+this.Class+"Button"+cls1+cls2+"\"'";
   A[p++] = "<div"+cs+"2Footer'"
   MS.Touch; if(BTouch) A[p++] = " ontouchstart='"+this.This+".NoClickTo=new Date()-0+1000;'"; ME.Touch; 
   A[p++] = ">";
   A[p++] = str+" style='visibility:hidden;'>"+this.Texts.Today+"</button>";
   A[p++] = str+" style='visibility:hidden;'>"+this.Texts.Clear+"</button>";
   A[p++] = str+" onclick='"+this.This+".Render(0);'>"+this.Texts.Ok+"</button>";
   A[p++] = "</div>";
   }
A[p++] = "</div>";

this.Body = A.join("");
}
// -----------------------------------------------------------------------------------------------------------
// Re renders darepicker
TCalendar.Render = function(type,noanim){
if(type==0&&!(this.Edit&1)) return this.DayClick(1);
if(type==1&&!(this.Edit&6)) return;
MS.Animate; if(!noanim) { var A = [this.AnimateDaysFrom,this.AnimateMonthsFrom,this.AnimateMonthFrom,this.AnimateYearFrom]; if(A[type]) { Animate(this.GetBody().getElementsByTagName("table")[0],A[type],null,this.Render.bind(this,type,1)); return; } } ME.Animate;
if(type&1) this.SetHTMLMY(type&2?1:0);
else this.SetHTML();
this.GetBody().firstChild.innerHTML = this.Body;
this.UpdateIcons();
this.SetInput();
this.FocusTime();
this.UpdateHeight();
if(CZoom!=1) this.Tag.innerHTML = this.Tag.innerHTML;
MS.Animate; var A = [this.AnimateDaysTo,this.AnimateMonthsTo,this.AnimateMonthTo,this.AnimateYearTo]; if(A[type]) Animate(this.GetBody().getElementsByTagName("table")[0],A[type]); ME.Animate;
}
// -----------------------------------------------------------------------------------------------------------
TCalendar.FocusTime = function(){
if(!this.TimeFormat || BTablet || this.NoFocusTime) return;
var I = GetElem(this.TimeId);
if(!I) return;
if(Try) {
   
   I.focus();
   if(I.select) I.select();
   }
else if(Catch){ }
}
// -----------------------------------------------------------------------------------------------------------
// Called when month and year changes
TCalendar.MYChg = function(dir){

this.Month+=dir;
while(this.Month<0) { this.Year--; this.Month+=12; }
while(this.Month>11) { this.Year++; this.Month-=12; }
this.Render(2);
}
// -----------------------------------------------------------------------------------------------------------
// Called when user clicks to day
TCalendar.DayClick = function(d){
var gmt = Formats.GMT-0;
var val = gmt ? new Date(Date.UTC(this.Year,this.Month,d==null?this.Day:d)) : new Date(this.Year,this.Month,d==null?this.Day:d);
MS.Hirji;
if(Formats.Hirji&1){
   val = Formats.HirjiToGregorian(this.Year,this.Month+1,d==null?this.Day:d);
   val = gmt ? new Date(Date.UTC(val[0],val[1]-1,val[2])) : new Date(val[0],val[1]-1,val[2]);
   }
ME.Hirji;  
var t; 
if(this.TimeFormat){
   var I = GetElem(this.TimeId);
   if(I) {
      MS.Hirji; var zal = Formats.Hirji; Formats.Hirji = 0; ME.Hirji;
      t = Formats.StringToDate(I.value,this.TimeFormat,null,null,1);
      MS.Hirji; Formats.Hirji = zal; ME.Hirji;
      t = new Date(t);
      }
   }
else t = this.DateRaw;
if(t){   
   if(gmt) val.setUTCHours(t.getUTCHours(),t.getUTCMinutes(),t.getSeconds());
   else val.setHours(t.getHours(),t.getMinutes(),t.getSeconds());
   }
val = val.getTime();
this.Save(val);
}
// -----------------------------------------------------------------------------------------------------------
TCalendar.Close = function(){
this.Delete();
}
// -----------------------------------------------------------------------------------------------------------
TCalendar.Save = function(val){
if(Formats.ExcelDates){
   if(val-0||val=="0") val = (val-0+2209161600000)/86400000;
   else if(val) { 
      var L = Formats, A = (val+"").split(L.ValueSeparator);
      for(var i=0;i<A.length;i++){
         var B = A[i].split(L.RangeSeparator);
         for(var j=0;j<B.length;j++) if(B[j]-0||B[j]=="0") B[j] = (B[j]-0+2209161600000)/86400000;
         A[i] = B.join(L.RangeSeparator); 
         }
      val = A.join(L.ValueSeparator);
      }
   }
if(this.OnSave && this.OnSave(val)==false) return;
this.Close();

}

// -----------------------------------------------------------------------------------------------------------
TCalendar.IsSel = function(d){
if(this.Drag && (d>=this.DragD1 && d<=this.DragD2 || d>=this.DragD2 && d<=this.DragD1)) return this.DragSel;
for(var i=0;i<this.Multi.length;i+=2){
   if(d>=this.Multi[i] && d<=this.Multi[i+1]) return true;
   }
return false;   
}
// -----------------------------------------------------------------------------------------------------------
TCalendar.PickDrag = function(typ,dd){
if(!this.Drag && typ!=3) return; 
switch(typ){
   case 1: 
      this.DragD2 = dd;
      this.Update();
      ClearSelection();
      break;
   case 2: 
      break;
   case 3: 
      this.Drag = 1;
      this.DragD1 = dd;
      this.DragD2 = dd;
      this.DragSel = 1;
      this.Update();
      break;
   case 4: 
      this.Drag = 0;
      if(this.DragD1==this.DragD2){ 
         this.DaySelect(this.DragD1);
         this.Update();
         }
      else { 
         var M = this.Multi;
         M[M.length] = this.DragD1 < this.DragD2 ? this.DragD1 : this.DragD2;
         M[M.length] = this.DragD1 < this.DragD2 ? this.DragD2 : this.DragD1;
         this.Update();
         } 
      if(this.OnChange) this.OnChange(Formats.UpdateDateRange(this.Multi));
      break;
   }
return false;
}
// -----------------------------------------------------------------------------------------------------------
TCalendar.WeekSelect = function(dd,dd2){
var M = this.Multi, chg = 0;
for(var i=0;i<M.length;i+=2){
   if(M[i]<dd && M[i+1]>dd2){ 
      M[M.length] = dd;
      M[M.length] = M[i+1];
      M[i+1] = dd;
      }
   if(M[i]>=dd&&M[i]<=dd2){
      if(M[i+1]>=dd&&M[i+1]<=dd2) { M.splice(i,2); i-= 2; } 
      else { 
         var d = new Date(dd2);
         if(Formats.GMT-0) d.setUTCDate(d.getUTCDate()+1);
         else d.setDate(d.getDate()+1);
         M[i] = d-0;
         }
      chg = 1;
      }
   else if(M[i+1]>=dd&&M[i+1]<=dd2) { 
      var d = new Date(dd);
      if(Formats.GMT-0) d.setUTCDate(d.getUTCDate()-1);
      else d.setDate(d.getDate()-1);
      M[i+1] = d-0;
      chg = 1;
      }
   }
if(!chg){
   M[M.length] = dd;
   M[M.length] = dd2;
   }
this.Update();
if(this.OnChange) this.OnChange(Formats.UpdateDateRange(this.Multi));
}

// -----------------------------------------------------------------------------------------------------------
TCalendar.Update = function(){
var td = this.Tag.getElementsByTagName("table")[0].getElementsByTagName("div");
var cp = this.Class; if(BTablet) cp += "Touch "+this.Class;
for(var i=0;i<td.length;i++){
   var id = td[i].id;
   if(!id) continue;
   id = id.split(this.Sep); if(id.length<3) continue; 
   var cls = td[i].className, hover = cls.toLowerCase().indexOf("hover")>=0;
   var newcls = this.IsSel(id[3]) ? cp+"Sel"+(hover?"Hover":"") : (hover?cp+"Hover":cp+id[2]);
   
   if(cls!=newcls) td[i].className = newcls;
   }
this.SetInput();
}

// -----------------------------------------------------------------------------------------------------------
// Called when user clicks to day when multiselect
TCalendar.DaySelect = function(dd,td){
var M = this.Multi;
var d1 = new Date(dd), d2 = new Date(dd);
if(Formats.GMT-0){ d1.setUTCDate(d1.getUTCDate()+1); d1 -= 0; d2.setUTCDate(d2.getUTCDate()-1); d2 -= 0; }
else { d1.setDate(d1.getDate()+1); d1 -= 0; d2.setDate(d2.getDate()-1); d2 -= 0; }
for(var i=0;i<M.length;i+=2){
   if(dd>=M[i] && dd<=M[i+1]){ 
   
      if(dd==M[i]) {
         if(dd>M[i+1]-1){ M[i] = null; M[i+1] = null; } 
         else M[i] = d1;
         }
      else if(dd==M[i+1]) {
         if(dd<M[i]+1) { M[i] = null; M[i+1] = null; } 
         else M[i+1] = d2;
         }
      else { 
         M[M.length] = d1;
         M[M.length] = M[i+1];
         M[i+1] = d2;
         }
      if(td) td.className = this.Class+"Hover";   
      return;
      }
   }  
   
if(td) td.className = this.Class+"SelHover";
for(var i=0;i<M.length;i+=2){
   if(d1==M[i]){ M[i] = dd; return; }
   if(d2==M[i+1]){ M[i+1] = dd; return; }
   }
M[M.length] = dd;
M[M.length] = dd;
}
// -----------------------------------------------------------------------------------------------------------
TCalendar.SetInput = function(){

}
// -----------------------------------------------------------------------------------------------------------
// Called when clicked button in multiselect
TCalendar.BClick = function(but){

if(this.OnButtonClick) but = this.OnButtonClick(but);

if(but==3){
   var val = new Date(); 
   if(Formats.GMT-0) val = Date.UTC(val.getFullYear(),val.getMonth(),val.getDate()); else { val.setHours(0,0,0,0)-0; }
   
   this.Save(val);
   }

if(but==4){
   var val = new Date(); 
   if(Formats.GMT-0) val = Date.UTC(val.getFullYear(),val.getMonth(),val.getDate()-1); else { val.setHours(0,0,0,0); val.setDate(val.getDate()-1); val -= 0; }
   this.Save(val);
   }

if(but==2){
   if(this.Multi) {
      this.Multi = [];
      this.SetInput();
      this.Render(4);
      if(this.OnChange) this.OnChange("");
      }
   else {
      this.Save("");
      }   
   }

if(but==1){
   if(this.Multi) this.Save(Formats.UpdateDateRange(this.Multi));
   else this.DayClick();
   }
}
// -----------------------------------------------------------------------------------------------------------
TCalendar.KeyDown = function(key){
var M = this;
if(key==27){ if(M.Popup) M.Close(1); }   
}
// -----------------------------------------------------------------------------------------------------------
ME.DatePick;

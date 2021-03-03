
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
var MS, ME, MX, Try, Catch;
if(!Try) Try = 1;
if(!MS) MS = {}; 
if(!ME) ME = {}; 
if(!MX) MX = {};
// -----------------------------------------------------------------------------------------------------------
var CTableCSP0 = "<table cellspacing='0' cellpadding='0' ";
var CTfoot = "><tbody>", CTableEnd = "</tbody></table>";
var CNBSP = "&#160;", CXHTML = "='1'";
var BT = "_7T"; 
// -----------------------------------------------------------------------------------------------------------
MS.FFOnly;
MS._Debug; if(0){ ME._Debug;
var BMozilla = navigator.appName.search("Netscape")>=0 && navigator.userAgent.search("Chrome")<0 && navigator.appName.search("Microsoft")<0 && navigator.userAgent.search("Trident")<0;
var BStrict = document.compatMode=="CSS1Compat"; 
var BFF15 = BMozilla && navigator.userAgent.search("Firefox/1.5")>=0;
var BFF3 = BMozilla && navigator.userAgent.search(/Firefox\/([3-9]|[1-9][0-9])\./)>=0;
var BFF20 = BMozilla && navigator.userAgent.search(/Firefox\/([2-9][0-9])\./)>=0;
var BFF35 = BFF3 && navigator.userAgent.search(/Firefox\/3\.(0|1)/)<0;
var BOpera8,BOpera,BOperaVer,BSafariMac,BSafariWin,BSafari,BSafari5,BSafari7,BIEA,BIE,BIEStrict,BIE5,BIEA6,BNN,BIEA8,BIE8Strict,BIEA9,BChrome,BKonqueror,BIPAD,BIEA10,BIEVER,BIEM,BEdge,BIPAD8,BTouch,BTablet,BAndroid,BIEA11,BFF48;
var BMouse = 1;
var BT = BT.replace(7,5);  
if(!BMozilla) alert("This demonstration version of TreeGrid works only in Mozilla Firefox!");
MS._Debug; } ME._Debug;
MX.FFOnly;
var BEdge = navigator.userAgent.search("Edge")>=0;
var BOpera = navigator.appName.search("Opera")>=0;
var BOpera8 = BOpera ? 0 : navigator.userAgent.search("Opera")>=0;
var BOperaVer = parseFloat(navigator.appVersion);
var BSafari = navigator.userAgent.search("KHTML")>=0;
var BT = BT.replace(7,5); 

var BIPAD = 0, BIPAD8 = 0, BTouch = 0, BMouse = 1, BTablet = 0, BAndroid = 0; 
MS.Touch; 
BTouch = 1;
BTablet = navigator.userAgent.search(/Mobile|Android/)>=0 || navigator.maxTouchPoints&&!window.DragEvent; 
BIPAD = BSafari && BTablet;

BAndroid = navigator.userAgent.search(/Android/)>=0
BIPAD8 = navigator.userAgent.search(/version[\s\/][567]/i)<0||BAndroid; 
BMouse = !BTablet;
ME.Touch;
var BSafariMac = BIPAD || navigator.userAgent.search("Safari")>=0;
var BSafariWin = BSafariMac && navigator.userAgent.search("Windows")>=0;
var BKonqueror = BSafari && !BSafariMac && !BSafariWin; 
var BSafari7 = BSafariMac && navigator.userAgent.search(/version\W+([789]|[12]\d|6\.[23456789])|EvoPdf|CriOS|wkhtmltopdf/i)>=0; 
var BSafari5 = BSafariMac && !BSafari7 && navigator.userAgent.search(/version\W+5\.0/i)>=0;
var BChrome = BSafari && navigator.userAgent.search("Chrome")>=0;
var BIEA = navigator.appName.search("Microsoft")>=0 && !BOpera8 || navigator.userAgent.search("Trident")>=0; 
var BMozilla = navigator.appName.search("Netscape")>=0 && !BOpera8 && !BSafari && !BIEA;
var BStrict = document.compatMode=="CSS1Compat"; 
var BFF48 = BMozilla && navigator.userAgent.search(/firefox\/([123]\d|4[012345678])[^\d]/i)>=0;
var BFF63 = BMozilla && navigator.userAgent.search(/firefox\/([12345]\d|6[0123])[^\d]/i)>=0;
   
if(!this[BT+2]||this[BT+2]>this[BT+3]||typeof(this[BT+3])!="object") BStrict = !BStrict;  
var BIEVER = 0; 
if(BIEA){
   var D = document.createElement("div");
   try{
      D.style.behavior = "url(#default#clientcaps)";
      BIEVER = parseFloat(D.getComponentVersion("{89820200-ECBD-11CF-8B85-00AA005B4383}","componentid").replace(/,/g,'.')); 
      if(!BIEVER) BIEVER = parseFloat(D.getComponentVersion("{45EA75A0-A269-11D1-B5BF-0000F8051515}","componentid").replace(/,/g,'.')); 
      } catch(e) { };
   
   }
var BIE = BIEA && !BStrict && (document.documentMode==5||!document.documentMode);   
var BIEA10 = document.documentMode>=10; 
var BIEA11 = document.documentMode>=11; 
var BIEM = BIEA10&&(navigator.platform+"").indexOf(64)>=0;

var BIEStrict = BIEA && !BIE; 

var BIE5 = BIE && navigator.appVersion.search("MSIE 5")>=0;
var BIEA6 = BIEA && navigator.appVersion.search("MSIE 6")>=0 && navigator.appVersion.search(/MSIE\s*(7|8|9|10|11|12)/)<0 || BIE5;

var BIEA8 = BIEA && (document.documentMode>=8 || navigator.appVersion.search(/MSIE\s*(8|9|10|11|12)/)>=0&&document.documentMode!=7); 
var BIEA9 = BIEA8 && document.documentMode!=8 && navigator.appVersion.search(/MSIE\s*8/)<0;
if(BIEA8){ BIE5 = 0; BIEA6 = 0; }
var BIE8Strict = BIEA8 && BIEStrict;

if(BIEA6) try { document.execCommand("BackgroundImageCache", false, true); } catch(e) { }
if(this[BT+4]) BIE = !BIE; 

var BNN = navigator.userAgent.search("Netscape")>=0;  
var BFF15 = BMozilla && navigator.userAgent.search("Firefox/1.5")>=0;
var BFF3 = BMozilla && navigator.userAgent.search(/Firefox\/([3-9]|[1-9][0-9])\./)>=0;
var BFF20 = BMozilla && navigator.userAgent.search(/Firefox\/([2-9][0-9])\./)>=0;
var BFF35 = BFF3 && navigator.userAgent.search(/Firefox\/3\.(0|1)/)<0;

if(BIE5) undefined=null;
if(BSafari){ CTfoot = ">"; CTableEnd = "</table>"; } 
ME.FFOnly;
// -----------------------------------------------------------------------------------------------------------
var CScrollWidth = 0, CScrollHeight = 0, CScrollWidthBase = 0, CScrollHeightBase = 0;     
var CCursorPointer = BIE5 ? "cursor:hand;" : "cursor:pointer;";
var CAlignTypes = {"0":"Left","1":"Center","2":"Right","left":"Left","right":"Right","rightover":"Right","center":"Center","justify":"Justify","Left":"Left","Right":"Right","RightOver":"Right","Center":"Center","Justify":"Justify","LEFT":"Left","RIGHT":"Right","RIGHTOVER":"Right","CENTER":"Center","JUSTIFY":"Justify","scroll":"Scroll","Scroll":"Scroll","SCROLL":"Scroll","Rightover":"Right","rightOver":"Right"};

// -----------------------------------------------------------------------------------------------------------
try { if(BIEA6) document.execCommand("BackgroundImageCache", false, true); } catch(e) {}
if(!window.TGDefNames) TGDefNames = {};
var Controls, AttachMouse, WriteDialog, ShowHint, TControl; 
var TGNoIEClientRect = 0; 
var grh = 130554748.6; 

// -----------------------------------------------------------------------------------------------------------
var Grids = [], TGGrids = Grids;  
if(window["Grids"]==null) window["Grids"] = Grids; 
else if(TGDefNames["TGGrids"]) { Grids = window["Grids"]; TGGrids = Grids; }
var Designers = [], TGDesigners = Designers;  
if(window["Designers"]==null) window["Designers"] = Designers; 
else if(TGDefNames["TGDesigners"]) { Designers = window["Designers"]; TGDesigners = Designers; }

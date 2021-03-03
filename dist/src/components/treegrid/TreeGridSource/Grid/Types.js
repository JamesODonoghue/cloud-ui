// -----------------------------------------------------------------------------------------------------------
// Types declaration

var DefaultsVersion = 150001;
var TextVersion = 150001;
// -----------------------------------------------------------------------------------------------------------
var MS = {}, ME = {}, MX = {};
// -----------------------------------------------------------------------------------------------------------
MS.Debug;

var CGFunc = "TGGrids,Grids,TGDesigners,Designers,TGGetGrids,GetGrids,TGDisposeGrids,DisposeGrids,TGTCalc,TCalc,TGComponent,TGDialogs,TGRequests,TGNoIEClientRect,TGAreaObjects,TGTreeGrid,TreeGrid,TGPrintTreeGrid,PrintTreeGrid,TGStartTreeGrid,StartTreeGrid,TGTreeGridLoaded,TreeGridLoaded,TGGet,Get,TGIs,Is,TGSetEvent,SetEvent,TGAddEvent,AddEvent,TGDelEvent,DelEvent,TGGetEvent,TGGetNode,TGAddGanttUnits,AddGanttUnits,TGInit,TGFireMouseEvent,TGGetTextWidth,TGTestKeyDate,TGDateToString,DateToString,TGStringToDate,StringToDate,TGNumberToString,NumberToString,TGStringToNumber,StringToNumber,TGGetElem,GetElem,TGGetKey,TGGetWindowSize,GetWindowSize,TGGetWindowScroll,GetWindowScroll,TGEventXYToElement,EventXYToElement,TGElemToParent,ElemToParent,TGCancelEvent,CancelEvent,TGCancelPropagation,CancelPropagation,TGCancelDefault,CancelDefault,TGGetStyle,GetStyle,TGCreateXML,CreateXML,TGAttachEvent,AttachEvent,TGDetachEvent,DetachEvent,TGLoadCache,LoadCache,TGSaveCache,SaveCache,TGDragByMouse,DragByMouse,TGAttachMouse,TGDetachMouse,TGInitControls,TGInitControl,TGControls,TGShowEnum,ShowEnum,TGShowEdit,ShowEdit,TGShowHint,ShowHint,TGShowTip,ShowTip,TGShowPopup,ShowPopup,TGShowMenu,ShowMenu,TGShowDialog,ShowDialog,TGShowCalendar,ShowCalendar,TGShowLineChart,ShowLineChart,TGAjaxCall,AjaxCall,TGSetSelection,TGGetSelection,TGDisablePage,TGEnablePage,TGUseCharCodes,TGSaveFile,TGAnimate,TGDebugException".split(",");
var CGFuncPre = {}, CGFuncGrid = {}
for(var CGC=0;CGC<CGFunc.length;CGC++) if(window[CGFunc[CGC]]) CGFuncPre[CGFunc[CGC]] = window[CGFunc[CGC]];
ME.Debug;
// -----------------------------------------------------------------------------------------------------------
if(window["Component"]==null) window["Component"] = window.TGComponent;

// Column object

// -----------------------------------------------------------------------------------------------------------
// Object for dragging
function TDrag(){
MS.Null;
this.Row = null;       
this.Col = null;       
this.Grid = null;      
this.ToRow = null;     
this.ToGrid = null;    
this.Type = -1;        
this.Cursor = "";      
this.X = 0; this.Y = 0;
ME.Null;
}
// -----------------------------------------------------------------------------------------------------------
// Object under mouse cursor, is global for all grids
MS.MouseObject;
function TMouseObject(){
MS.Null;
this.DX = null; this.DY = null;   
this.Tag = null;                 
ME.Null;
this.Move = 3;                   
}
ME.MouseObject;
// -----------------------------------------------------------------------------------------------------------
// Modal grid dialog

// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Object for communication

// -----------------------------------------------------------------------------------------------------------
// Main grid object
function TGrid(){ this.Init(); }
// -----------------------------------------------------------------------------------------------------------
var TGP = TGrid.prototype, LZDX; 
var tyu = [6,5,2,7,7,3,7,4,3]; 
// -----------------------------------------------------------------------------------------------------------
TGP.Init = function(){
this.Index = -1;            
this.This = "";             
this.id = "";               
this.Tag = "";              
MS.Null;   
this.MainTag = null;        
this.Source = null;         
this.IO = null;             
ME.Null;

MS.Null;
this.MainTable = null;      

this.ScrollVertParent = null; 
this.ScrollVert = null;     
ME.Null;

this.ScrollHorzParent = []; 
this.ScrollHorz = [];       
this.ScrollHorzShown = [];  
this.ScrollHorzBody = [];   
this.ScrollHorzZoom = [1,1,1];    
this.ScrollVertZoom = 1;    

this.Paging = 0;            
this.PageLength = 20;       
this.ChildPaging = 0;       
this.FPage = 0;             

MS.Null;
this.FRow = null;        
this.FCol = null;        
this.FSpanCol = null;    
this.FPagePos = null;    
this.EditMode = false;   
this.ScrollTo = null;    
this.ARow = null;        
this.ASec = null;        
this.ACol = null;        
ME.Null;
this.RowCount = 0;       
this.LoadedCount = 0;    

MS.Null;
this.Sorted = false;      
this.AllSelected = null;  
this.AllColsSelected = null; 
ME.Null;

MS.Null;
this.Grouped = false;
ME.Null;

MS.Null;
this.Message = null;       
this.Rendering = false;    
ME.Null;
this.UpdateCount = 0;      

this.CalcIndex = 0;        

MS.Null;
this.Dialog = null;        

this.FormSubmit = null;    
this.CalcOrder = null;     

this.ScrollInterval = null;
this.Disabled = false;     

this.Clicked = null;       
ME.Null;

this.MaxHeight = 0;                  
this.TagWidth = 0;                   
this.TagHeight = 0;                  
MS.Null;
this.TagStyle = null;                
ME.Null;

this.XB = Dom.createElement("U");    
this.XH = Dom.createElement("U");    
this.XF = Dom.createElement("U");    
this.XS = Dom.createElement("U");    
this.Body = this.XB; this.Head = this.XH; this.Foot = this.XF; this.Solid = this.XS; 
this.Root = Dom.createElement("U");    
this.Header = Dom.createElement("U");  
this.Toolbar = Dom.createElement("U"); 
MS.Null;
this.Filter = null;                    
  
 
ME.Null;
this.Pagers = [];                    
this.Media = [];                     

this.Rows = {};                      
MS.Panel;
this.Cols = { Panel:{Sec:0,Pos:0,Name:"Panel"}};  
this.ColNames = [["Panel"],[],[]];   
MX.Panel;
if(!this.Cols){
   this.Cols = { };                     
   this.ColNames = [[],[],[]];          
   }
ME.Panel;
this.SpannedCols = {};               
this.SpannedColsLength = 0;          
this.Def = {};                       
this.DefCols = {};                   
this.MenuCfg = {Name:"MenuCfg"};     
this.MenuColumns = {Name:"MenuColumns"}; 
this.MenuPrint = {Name:"MenuPrint"}; 
this.MenuExport = {Name:"MenuExport"};  
this.Pager = {};                     
this.Img = {};                       
this.Colors = {};                    
this.ColorsXml = {};                 
this.Actions = {};                   
this.Mouse = {};                     
this.Lang = { Format:Formats };      
this.Par = {};                       
this.Animations = {};                
this.Languages = {};                 
this.Text = {};                      
this.ToTranslate = {};               
this.Names = {};                     

this.KeyCodes = {};                  
for(var i=65;i<91;i++) this.KeyCodes[i] = String.fromCharCode(i);
for(var i=48;i<58;i++) this.KeyCodes[i] = "D"+String.fromCharCode(i);

this.Formulas = {};                  
this.EFormulas = {};                 
this.ActionFormulas = {};            
this.Enums = {};                     
this.CalcOrders = {};                
this.FlagNames = {};                 
this.Flags = {};                     
this.Bits = {};                      
this.GanttTmp = {};                  
this.Formats = {};                   
this.Timers = {};                    
this.LoadedStyles = {};              
this.PagesTmp = [];                  
this.ChildPartsTmp = {};             
this.ZoomUndo = [];                  
this.Changes = [];                   

this.BorderTmp = {};                 
this.RunEscapes = {};                
this.RemovedCols = {};               

MS.Null;
this.Charts = null;                  
ME.Null;

this.OverLeft = 0; this.OverRight = 0; this.OverTop = 0; this.OverBottom = 0; 

this.CursorLevel = [];              
this.TipLevel = [];                 
this.Event = {};                    
this.LEvent = {};                   
this.LCursor = {};                  

MS.Null;
this.Path = null;                    

this.IdTypes = null;                 
this.IdMore = null;                  
this.IdCol = null;                   

this.ReloadReason = null;            
ME.Null;
this.ReloadIndex = 1;                
this.AnimatingRow = 0;               
this.ChromeZoom = 0;                 
}
// -----------------------------------------------------------------------------------------------------------
// Main public array of all grids on page
MS.Null;
Grids.Drag = null;       
Grids.UseStyles = false; 
Grids.Active = null;     

Grids.Resizing = null;   

Grids.Unload = null;     
Grids.Cfg = null;        
Grids.CfgId = null;      
Grids.MouseObject = null;  
Grids.CancelKey = 0;     
Grids.Clipboard = null;  
Grids.INames = null;     
Grids.NameChars = null;  
Grids.InsKey = false;    
Grids.EventsSet = false; 
Grids.OffsetTag = null;  
ME.Null;
MS.Touch;if(BTablet) Grids.Tablet = 1; ME.Touch; 
Grids.LoadedCSS = {};    
Grids.Keys = [];         
Grids.CheckIntervals = [0,2,5,10,30,60,120,300,600];
Grids.CacheVersion = Math.floor(Math.random()*1e8);
Grids.ChromeZoom = 0;    
// -----------------------------------------------------------------------------------------------------------
(function(){

Grids.INames = { };
var I = Dom.DataDocument ? CNodeNames : document.createElement("I");
for(var i in I) Grids.INames[i] = 1;
for(var i=0;i<100;i++) { Grids.INames["r"+i] = 1; Grids.INames["rch"+i] = 1; }
   
var A = { };
A[95] = 1; 
for(var i=65;i<91;i++){ A[i] = 1; A[i+32] = 1; } 
for(var i=48;i<58;i++) A[i] = 1;
Grids.NameChars = A;

})();
// -----------------------------------------------------------------------------------------------------------
MS.Api;
function GetGrids(){
var A = [];
for(var i=0;i<Grids.length;i++){
   var G = Grids[i];
   if(G && Grids[G.id]==G) A[A.length] = G;
   }
return A;   
}
var TGGetGrids = GetGrids; if(window["GetGrids"]==null) window["GetGrids"] = GetGrids; 
ME.Api;
// -----------------------------------------------------------------------------------------------------------

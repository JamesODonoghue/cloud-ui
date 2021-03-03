// -----------------------------------------------------------------------------------------------------------
TGP.GridClick = function(ev){

if(ev) { 
   var dx = ev.clientX - this.MouseDownX, dy = ev.clientY - this.MouseDownY;
   var dd = this.Touched?this.Mouse.ClickSizeTouch:this.Mouse.ClickSize;
   if(dx>dd || dx<-dd || dy>dd || dy<-dd) return false; 
   }

if(Grids.NoClickTo>new Date()) return;

var E = this.Event;

if(!E.Row||E.Row.Kind!="Header") this.SortClickTime = 0;
if(!this.SetGridFocused()) { this.Clicked = new Date()-0; CancelEvent(ev); return; }
this.WaitForCtrC = 0;
this.HideTip();
if(this.ExternalEdit&&this.EditMode&&this.ERow.ExternalEdit==this.ECol&&E.Row==this.FRow&&E.Col==this.FCol) this.MoveExternalEdit(this.ERow,this.ECol,E.Row,E.Col);
var ret = false, long = E.UpTime-E.DownTime>this.LongClick;
if(!ret && long && Grids.OnLongClick && E.Row && E.Col) ret = Grids.OnLongClick(this,E.Row,E.Col,E.X,E.Y,ev);
if(!ret && Grids.OnClick && E.Row && E.Col) ret = Grids.OnClick(this,E.Row,E.Col,E.X,E.Y,ev);
if(!ret && long) ret = this.RunMouseActions("LongClick",ev);
if(!ret) ret = this.RunMouseActions("Click",ev);

MS.Master;
if((this.DetailOn&7)==2) this.ActionShowDetail();
ME.Master;

if(ret && ev && (E.Type!="Html"&&E.Type!="EHtml"||this.EditMode) && (!E.Row||!E.Col||!this.GetAttr(E.Row,E.Col,"Link")&&E.Type!="Link"&&E.Type!="Img")) CancelEvent(ev);

if(this.NestedGrid) CancelEvent(ev,1);
this.Clicked = new Date()-0; 
if(this.SelectingText && ret && ev && (ev.ctrlKey || ev.shiftKey)) this.ClearSel(ev);
if(this.Hint) this.HideHint();

}
// -----------------------------------------------------------------------------------------------------------
// Fires on double click
TGP.GridDblClick = function(ev){

if(ev) { 
   var dx = ev.clientX - this.MouseDownX, dy = ev.clientY - this.MouseDownY;
   var dd = this.Mouse.ClickSize;
   if(dx>dd || dx<-dd || dy>dd || dy<-dd) return false; 
   }

if(BIEA && !BIEA10) this.GridClick(ev);
var E = this.Event, ret = Grids.OnDblClick ? Grids.OnDblClick(this,E.Row,E.Col,E.X,E.Y,ev) : false;
if(!ret) ret = this.RunMouseActions("DblClick",ev);
MS.Master;
if((this.DetailOn&7)==3) this.ActionShowDetail();
ME.Master;
if(ret) CancelEvent(ev);
else if(this.NestedGrid) CancelEvent(ev,1);
return !ret;
}
// -----------------------------------------------------------------------------------------------------------
// Fires on right click
TGP.GridRightClick = function(ev,mac){
if(BSafari&&(!BSafariWin||!BChrome)&&!mac&&this.MacContextMenu){ CancelEvent(ev); return false; }
MS.Edit; if(BIEA && this.EditMode && this.IESel) SetSelection(this.Edit.Tag,this.IESel[0],this.IESel[1]); ME.Edit; 

if(Grids.NoClickTo>new Date()) { CancelEvent(ev); return; }
var E = this.Event, long = E.UpTime-E.DownTime>this.LongClick, ret = false;
if(!ret && long && Grids.OnRightLongClick) ret = Grids.OnRightLongClick(this,E.Row,E.Col,E.X,E.Y,ev);
if(!ret && Grids.OnRightClick) ret = Grids.OnRightClick(this,E.Row,E.Col,E.X,E.Y,ev);
var prefix = this.GetKeyPrefix(ev);
if(prefix.indexOf("Right")<0) prefix += "Right";

if(!ret && long) ret = this.RunMouseActions("LongClick",ev,prefix);
if(!ret) ret = this.RunMouseActions("Click",ev,prefix);
if(BMozilla) this.SetGridFocused();
if(ret) CancelEvent(ev);
else if(this.NestedGrid) CancelEvent(ev,1);
this.TouchScrollPos = null; 
return !ret;
}
// -----------------------------------------------------------------------------------------------------------
// Fires when mouse down on grid
TGP.GridMouseDown = function(ev){
if(BMozilla && (this.ASec==-1 || this.ASec==-3 || ev.target&&ev.touches)) return true; 
if(this.Disabled) return true;

Grids.DownTarget = ev.target;
var E = this.Event, row = E.Row, col = E.Col, ret = false;
MS.Animate; if(row&&(row.Animating||row.AnimatingCells&&row.AnimatingCells[col])) { this.AnimRow(row); if(!row.r1) { CancelEvent(ev); return false; } } ME.Animate;
this.MouseDownX = ev.clientX; this.MouseDownY = ev.clientY; 
E.Button = ev.which!=null ? ev.which : [0,1,3,1,2,1,3,1][ev.button&7]; 
E.DownTime = new Date()-0;
if(!ret && (this.ASec>=0 || this.ASec<=-10&&(E.CellSection=="PagerHeader"||BIPAD) || E.Edge=="HScrollLeft" || E.Edge=="HScrollRight")) {
   if(this.EditMode && this.DragEdit==1 && (row!=this.ERow || col!=this.ECol || E.Edge!="Inside") && row && col) this.EndEdit(1);
   if((!this.EditMode||this.DragEdit==2) && E.Type!="Pages"){
      var D = new TDrag();
      D.Event = {}; for(var e in E) D.Event[e] = E[e];
      D.Action = null;
      D.X = Math.floor(ev.clientX/CZoom); D.Y = Math.floor(ev.clientY/CZoom);        
      D.Row = row; D.Col = col;      
      D.Img = this.AImg;             
      D.Grid = this;                 
      D.CellX = E.X; D.CellY = E.Y;  
      D.KeyPrefix = this.GetKeyPrefix(ev);
      D.ToRow = row; D.ToCol = col;  
      D.AX = D.X; D.AY = D.Y;        
      D.ToGrid = this;               
      if(Grids.Drag&&(!this.Touched||Grids.Drag.Action)) this.GridMouseUp(ev); 
      Grids.Drag = D;
      
      }
   }

if(!ret && Grids.OnMouseDown) ret = Grids.OnMouseDown(this,row,col,E.X,E.Y,ev);
if(!ret) ret = this.RunMouseActions("MouseDown",ev);
if(E["CellKind"] == "KindUser") ret = false;

if(BIEA) this.IESel = null;
if(ret) CancelEvent(ev);
else if(this.NestedGrid) CancelEvent(ev,1);
else { MS.Edit; if(BIEA && this.EditMode && ev.button==2 && this.Edit && !this.Edit.Html) this.IESel = GetSelection(this.Edit.Tag); ME.Edit; } 

if(this.EditMode&&this.ARow&&this.ACol&&(this.ARow!=this.ERow||this.ACol!=this.ECol)) CancelEvent(ev); 

if(BIEA ? this.AImg : BMozilla&&this.MoveColsFull&&E["RowKind"]=="HeaderRow" || !this.SelectingText && !this.EditMode && E["CellKind"] != "KindUser" && E.Button==1 && (!ev.target||!{"select":1,"input":1,"button":1,"textarea":1}[(ev.target.tagName+"").toLowerCase()])) return false; 
return !ret;
}
// -----------------------------------------------------------------------------------------------------------
// Fires when mouse up on grid
TGP.GridMouseUp = function(ev){

var E = this.Event, row = E.Row, col = E.Col, ret = false, D = Grids.Drag;
E.UpTime = new Date()-0;
if(D && D.Action) {
   if(D.End) ret = D.End.apply(this);
   if(this.ScrollColTo) this.ScrollColTo = null;
   if(this.ScrollTo) this.ScrollTo = null;
   if(D.DocCursor!=null) document.documentElement.style.cursor = D.DocCursor;
   ClearGridsDrag();
   this.DelMouseObject();
   this.GridMouseOver(ev,1);
   if(ret) this.RunMouseActions("Drop",ev,D.KeyPrefix,D.Button);
   Grids.NoClickTo = new Date()-0+100;
   if(this.Edit) this.Edit.NoClickTo = Grids.NoClickTo;
   if(ret && BIEA) this.Clicked = Grids.NoClickTo;
   }
   
if(!ret && Grids.OnMouseUp) ret = Grids.OnMouseUp(this,row,col,E.X,E.Y,ev);
if(!ret) ret = this.RunMouseActions("MouseUp",ev);
if(!ret&&BSafari&&(!BSafariWin||!BChrome)&&ev.which==3&&this.MacContextMenu) ret = this.GridRightClick(ev,1);

if(ret) CancelEvent(ev); 
else if(this.NestedGrid) CancelEvent(ev,1); 
ClearGridsDrag();
return !ret;
}
// -----------------------------------------------------------------------------------------------------------
// Fires when mouse moves over grid
TGP.GridMouseOver = function(ev,recalc){
if(this.Loading||this.Rendering || this.Edit&&this.Edit.InResize) return; 

var E = this.Event, dx, dy, sx, sy;
if(ev) { 
   sx = ev.clientX - E.ClientX; sy = ev.clientY - E.ClientY; dx = sx; dy = sy; 
   MS.Scale;
   if(this.Scale) { var Z = this.Scale; dx /= Z; dy /= Z; }
   if(this.ScaleX) dx /= this.ScaleX; 
   if(this.ScaleY) dy /= this.ScaleY;
   ME.Scale;
   }  
else if(E.ClientX==null) return;
else { recalc = 1; ev = { clientX:E.ClientX/CZoom,clientY:E.ClientY/CZoom } }
if(dx>=E.MinX && dx<=E.MaxX && dy>=E.MinY && dy<=E.MaxY && this.ARow==E.Row && this.ASec==E.Sec && !recalc && Grids.Active == this) { 
   if(E.X!=null) E.X += dx; if(E.Y!=null) E.Y += dy; 
   E.ClientX += sx; E.ClientY += sy;
   E.AbsX += sx; E.AbsY += sy;
   E.MinX -= dx; E.MinY -= dy; 
   E.MaxX -= dx; E.MaxY -= dy;
    
   if(this.NestedGrid) CancelEvent(ev,1);
   return; 
   }  
if(this.InMouseOver) return false; 
if(this.Hint && (!E.Edge||E.Row!=this.ARow||E.Col!=this.ACol)) this.HideHint(); 
this.InMouseOver = 1;

E = this.GetMouseEvent(ev);

if(E.MaxX > E.SMaxX) E.MaxX = E.SMaxX;
if(E.MinX < E.SMinX) E.MinX = E.SMinX;
if(E.MaxY > E.SMaxY) E.MaxY = E.SMaxY;
if(E.MinY < E.SMinY) E.MinY = E.SMinY;
if(E.OverLeft){ var minx = E.X - E.OverLeft; if(-E.MinX > minx) E.MinX = -minx; }
if(E.OverRight){ var maxx = E.Width - E.X - E.OverRight; if(E.MaxX > maxx) E.MaxX = maxx; }
if(E.OverTop) { var miny = E.Y - E.OverTop; if(-E.MinY > miny) E.MinY = -miny; }
if(E.OverBottom){ var maxy = E.Height - E.Y - E.OverBottom; if(E.MaxY > maxy) E.MaxY = maxy; }
E.DX = 0; E.DY = 0;

var ret = 0, prefix = Grids.Drag ? Grids.Drag.KeyPrefix : this.GetKeyPrefix(ev), row = E.Row, col = E.Col, O = this.LEvent; if(!O) O = [];
var N = [], chg = null, chgl = null, len = CMouseEventLevels.length; 
for(var i=0;i<len;i++) { 
   var n = CMouseEventLevels[i];
   if(E[n] && (E[n] != O[n] || i<=8 && O.Col!=col || i<=12 && (O.Row!=row || recalc==1))) { 
      chgl = i; if(chg==null) chg = i;
      N[i] = n;
      }
   }  

if(chgl==1 && chg==1 && E.RowSection=="Pager") { chgl = 8; chg = 7; N[7]=CMouseEventLevels[7];N[8]=CMouseEventLevels[8]; } 
if(chgl==9 && chg==9){ chg = 6; N[6] = CMouseEventLevels[6]; N[7] = CMouseEventLevels[7]; N[8] = CMouseEventLevels[8]; } 
for(var i=chg;i<=chgl;i++){ this.CursorLevel[CMouseEventLevels[i]] = null; this.TipLevel[CMouseEventLevels[i]] = null; }
MS.Debug; var dbg = this.DebugFlags["event"], dbginf = "";  ME.Debug;

if((chgl>=2||chgl==null&&row&&row.Space&&recalc!=2) && this.Hint) this.HideHint(-1);

MS.Debug; if(dbg) dbginf += "row="+(E.Row?(E.Row.id?E.Row.id:"???"):"none")+"; col="+(col?col:"none")+"; "; ME.Debug;

if(chgl>=4){ 
   if(!ret) { this.Event = O; ret = this.RunAction("MouseOut","",prefix); }                              
   if(!ret) { this.Event = E; ret = this.RunAction(Grids.Drag ? "DragOver" : "MouseOver","",prefix); }   
   }
else if(!E[CMouseEventLevels[1]]) this.CursorLevel[CMouseEventLevels[1]] = null; 
if(!ret) for(var i=chg;i<=chgl;i++) if(N[i]){ 
   var n = N[i];  MS.Debug; if(dbg) dbginf += n +"="+E[n]+"; "; ME.Debug;
   this.Event = O; O.Level = n; ret = this.RunAction("MouseOut",O[n],prefix); if(ret) break;                              
   this.Event = E; E.Level = n; ret = this.RunAction(Grids.Drag ? "DragOver" : "MouseOver",E[n],prefix);if(ret) break;    
   }

if(chg!=null&&!this.Touched&&(row||this.Pagers[col])) {
   if(!col) this.SetMouseCursor(""); 
   else if(Grids.Drag && Grids.Drag.Cursor!=null) this.SetMouseCursor(Grids.Drag.Cursor);
   else {
      for(var i=chg;i<=chgl;i++) if(N[i]){ 
         
         var n = N[i];
         var cur = this.GetAttr(row,col,E[n]+"Cursor",null,row&&row.Kind=="Panel");  
         if(cur==null && n=="PartType" && (!this.CursorLevel[CMouseEventLevels[i]]||E[n]=="Nothing")) cur = this.GetAttr(row,col,"Cursor");
         if(cur) this.CursorLevel[CMouseEventLevels[i]] = cur;
         }
      for(var i=0;i<len;i++) if(this.CursorLevel[CMouseEventLevels[i]]){ this.SetMouseCursor(this.CursorLevel[CMouseEventLevels[i]]); break; }
      if(i==len) this.SetMouseCursor("");
      }
   }

if(chg!=null&&!this.Touched&&!Grids.Drag) {
   for(var i=chg;i<=chgl;i++) if(N[i]){
      var n = N[i];
      var tip = this.GetAttr(row,col,E[n]+"Tip",null,row&&row.Kind=="Panel"); 
      if(tip==null && E[n]=="Cell"){ 
         tip = this.GetAttr(row,col,"Error"); if(!tip) tip = null;     
         if(tip==null) tip = this.GetAttr(row,col,"Tip"+Get(row,col)); 
         if(tip==null) tip = this.GetAttr(row,col,"Tip");              
         if(tip==null) tip = Get(row,"Tip");                           
         if(tip==null && row[col+"EFormula"] && this.FormulaTip && (!this.Locked["formula"]||this.GetAttr(row,col,"FormulaCanEdit",1,1)==2)) { 
            if(this.FormulaShow) { this.FormulaShow = 0; tip = this.StandardTip ? this.GetString(row,col) : this.GetRowHTML(row,null,8,col); this.FormulaShow = 1; } 
            else { tip = row[col+"EFormula"]; if(!this.FormulaLocal) tip = this.ConvertEditFormula(row,col,tip,0); }   
            if(tip==1) tip += CNBSP;
            }  
         if(tip==null) tip = this.GetAttr(row,col,"ToolTip");          
         }
      if(tip==1){                                                      
         tip = this.StandardTip ? this.GetString(row,col) : this.GetRowHTML(row,null,8,col);
         if(tip==CNBSP) tip = null;
         }
      if(tip!=null) this.TipLevel[CMouseEventLevels[i]] = tip;          
      } 
   for(var i=0;i<len;i++) if(this.TipLevel[CMouseEventLevels[i]]){ this.SetTip(this.TipLevel[CMouseEventLevels[i]]); break; }
   if(i==len) this.SetTip("");
   }  

this.ARow = E.Row; this.ACol = E.Col;
if(chgl>=4 && !this.Touched){ 
   this.UpdateCursors();
   
   this.Refresh();
   if(Grids.OnMouseOver) Grids.OnMouseOver(this,E.Row,E.Col,O.Row,O.Col,ev);
   }
this.LEvent = E;
this.Event = E;
 
if(ret && ret<100) CancelEvent(ev);
else if(this.NestedGrid) { CancelEvent(ev,1); Dialogs.MouseOver(ev); }
MS.Debug; if(dbg && dbginf) this.Debug(3,dbginf+(E.Row?" Left="+(-E.MinX)+"px Right="+E.MaxX+"px":"")); ME.Debug;
this.InMouseOver = 0;
return !ret;
}
// -----------------------------------------------------------------------------------------------------------
// Fires when mouse moves over grid
TGP.GridMouseMove = function(ev,recalc){
if(this.Loading||this.Rendering) return;
this.GridMouseOver(ev,recalc); 
if(Grids.MouseObject) this.MoveMouseObject(ev);
var ret = false;
if(Grids.Drag) ret = this.RunDrag(ev);
if(this.Edit&&this.Edit.Drag) this.Edit.Drag.onmousemove(ev);

if(Grids.OnMouseMove && !ret) ret = Grids.OnMouseMove(this,this.ARow,this.ACol,this.Event.X,this.Event.Y, ev);
if(!ret) ret = this.RunMouseActions("MouseMove",ev,Grids.Drag?Grids.Drag.KeyPrefix:null);
if(ret) CancelEvent(ev);
else if(this.NestedGrid) { CancelEvent(ev,1); Dialogs.MouseMove(ev); }
if(this.TipTime&&this.TipTime<Math.ceil(this.TipStart/200)) this.TipTime = 0; 

return !ret;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GridSelectStart = function(ev){
MS.Nested; if(this.NestedGrid) CancelEvent(ev,1); ME.Nested;
if(!this.SelectingText&&!this.EditMode) CancelEvent(ev,2);

}
// -----------------------------------------------------------------------------------------------------------
TGP.RunDrag = function(ev,outside){
var D = Grids.Drag;

function tmp(){ return true; }
if(D && !D.Action) {
   var G = D.Grid, dx = Math.floor(ev.clientX/(ev.type?CZoom:1)) - D.X, dy = Math.floor(ev.clientY/(ev.type?CZoom:1)) - D.Y;
   var a = this.Touched?G.Mouse.DragSizeTouch:G.Mouse.DragSize;
   if(dx>=a || dx<=-a || dy>=a || dy<-a){ 
      
      if(!G.SetGridFocused()) return false;
      var E = G.Event; G.Event = D.Event;
      
      if(this.GlobalCursor) D.DocCursor = document.documentElement.style.cursor;
      
      var ret = G.RunMouseActions("Drag",ev,D.KeyPrefix);
      G.Event = E;
      if(ret) {
         var act = D.Action;
         if((act=="Select"||act=="Fill"||act=="Focus")&&G.ARow&&G.ACol){ var zar = G.ARow; G.ARow = null; G.ColorCell(zar,G.ACol); G.ARow = zar; } 
         if(G.Dialog) G.CloseDialog();
         if(D.Cursor) {
            if(this.GlobalCursor) document.documentElement.style.cursor = D.Cursor;
            G.SetMouseCursor(D.Cursor);
            }
         
         D.Started = true;
         if(G.SelectingText) G.ClearSel(ev);
         
         if(!D.Move) D.Move = tmp;
         if(!D.End) D.End = tmp;
         if(!D.Action) D.Action = "None";
         G.HideTip();
         }
      else { 
         
         if(G.SelectingText || this.Touched || G.EditMode) ClearGridsDrag();
         else { D.Action = "None"; D.Move = tmp; } 
         
         }
      G.ScrollColTo = null;
      }
   }
D = Grids.Drag;      
if(D && D.Move){ 
   D.AX = Math.floor(ev.clientX/(ev.type?CZoom:1)); D.AY = Math.floor(ev.clientY/(ev.type?CZoom:1));
   var ret = D.Move.apply(this,[outside]);
   this.GridMouseOver(ev);
   if(this.SelectingText) this.ClearSel(ev); 
   if(BSafariWin && !this.SelectingText && window.getSelection){ 
      var S = getSelection(); if(S) S.collapse(document.body,0);
      }  
   return ret;
   }
return false;
}

// -----------------------------------------------------------------------------------------------------------
function GlobalClick(ev){

if(!ev) ev = window.event;
var G = Grids.Focused;
if(G){  
   var C = (new Date).getTime();
   if(G.Clicked && G.Clicked+100>C || G.Dialog&&G.Dialog.NoClickTo&&G.Dialog.NoClickTo>C) G.Clicked = null; 
   else {
      var A = EventToWindow(ev);
      var X = A[0] - G.TableX, Y = A[1] - G.TableY; 
      if(X<0 || X>=G.TableWidth || Y<0 || Y>=G.TableHeight){
         
         if(!G.Disabled){
            var prefix = G.GetKeyPrefix(ev);
            if(!G.RunAction("Click","Outside",prefix)) { CancelEvent(ev); return; }
            G.CloseDialog(true);
            G.SortClickTime = 0;
            }
         Grids.Focused = null;
         }
      }
   }

}
// -----------------------------------------------------------------------------------------------------------
function GlobalRightClick(ev){

if(!BIPAD && Grids.NoClickTo>new Date()) CancelEvent(ev);
}

// -----------------------------------------------------------------------------------------------------------
function DocMouseOut(ev){
if(Grids.Alert) return;
try {   var doc = document.documentElement;   } catch (e){ return; } 
var G = Grids.Active;
if(G && !G.Disabled) {
   var A = EventToWindow(ev), X = A[0] - G.TableX, Y = A[1] - G.TableY; 
   MS.Scale;
   if(G.Scale) { X /= G.Scale; Y /= G.Scale; }
   if(G.ScaleX) X /= G.ScaleX;
   if(G.ScaleY) Y /= G.ScaleY;
   ME.Scale;
   if((X<0 || X>=G.TableWidth || Y<0&&(!G.ARow||G.ARow.Space!=-1) || Y>=G.TableHeight&&(!G.ARow||G.ARow.Space!=5))) G.GridMouseOver(ev,2); 
   }
if(BIEA && ev.clientX<0 && ev.clientY<0 || !BIEA && !ev.relatedTarget){
   if(Grids.Drag) DocMouseUp(ev);
   }
}
// -----------------------------------------------------------------------------------------------------------
function DocMouseMove(ev){
if(!ev) ev = event;
var ret = true;
if(ev.Handled) return true;

if(Grids.MouseObject) TGP.MoveMouseObject(ev);   
var D = Grids.Drag;
if(D){
   var G = D.Grid; 
   ret = !G.RunDrag(ev,true);
   if(!G.EditMode) G.Refresh();
   }
if(!ret) CancelEvent(ev);

}
// -----------------------------------------------------------------------------------------------------------
function DocMouseDown(ev){
if(!ev) ev = window.event;
Grids.ActiveElement = document.activeElement;
Grids.DownTarget = ev.target;
}
// -----------------------------------------------------------------------------------------------------------
function DocMouseUp(ev){

if(!ev) ev = event;
var ret = true;
var D = Grids.Drag;
if(D && D.End){ 
   ret = !D.End.apply(D.ToGrid);
   if(D.Grid.ScrollColTo) D.Grid.ScrollColTo = null;
   if(D.Grid.ScrollTo) D.Grid.ScrollTo = null;
   if(D.ToGrid.ScrollColTo) D.ToGrid.ScrollColTo = null;
   if(D.ToGrid.ScrollTo) D.ToGrid.ScrollTo = null;
   if(D.DocCursor!=null) document.documentElement.style.cursor = D.DocCursor;
   Grids.NoClickTo = new Date()-0+100;
   if(D.Grid.Edit) D.Grid.Edit.NoClickTo = Grids.NoClickTo;
   if(!ret && BIEA) D.ToGrid.Clicked = Grids.NoClickTo;
   }
else if(Grids.Focused && !BIPAD && document.activeElement && Grids.ActiveElement != document.activeElement && {"input":1,"textarea":1}[document.activeElement.tagName.toLowerCase()] && Grids.DownTarget!=ev.target && Grids.DownTarget.parentNode && Grids.DownTarget.parentNode.id.indexOf("TGEdit")<0&&ev.target.className.indexOf("PickTime")<0){
   var G = Grids.Focused;
   if(!G.Disabled){
      var prefix = G.GetKeyPrefix(ev);
      if(!G.RunAction("Click","Outside",prefix)) { CancelEvent(ev); return;   }
      G.CloseDialog(true);
      G.SortClickTime = 0;
      }
   info("Loose focus");
   Grids.Focused = null;
   }
else if(Grids.Focused && Grids.Focused.Edit && Grids.Focused.Edit.Drag) Grids.Focused.Edit.Drag.onmouseup(ev); 
ClearGridsDrag();
if(Grids.MouseObject) TGP.DelMouseObject(ev);

if(!ret) CancelEvent(ev);

}
// -----------------------------------------------------------------------------------------------------------
// Global handler in document.onmousewheel
// It is global because of IE, it works at BODY only

// -----------------------------------------------------------------------------------------------------------
MS.File$Style$Import;
TGP.GridDrop = function(ev){
if(this.EditMode) return;
var F = ev.dataTransfer.files;
if(!F) {
   this.ShowMessageTime(this.GetText("SheetsUnsupported"));
   return;
   }
this.UpdateARow(-1,ev.clientX,ev.clientY);
this.Event.Row = this.ARow;
this.GridMouseOver(ev,1);
CancelEvent(ev);
var row = this.ARow, col = this.ACol;
if(Grids.OnDropFile && Grids.OnDropFile(this,row,col,F)) return false;
if(row&&col){
   var typ = this.GetType(row,col);
   if(typ=="File" && this.CanEdit(row,col)==1){
      MS.File;
      var N = [], acc = this.GetAttr(row,col,"Accept");
      if(acc) acc = ToRegExp(acc).replace(/\\\*/g,".*");
      for(var i=0;i<F.length;i++) if(!acc||F[i].type.search(acc)>=0||F[i].name.replace(/.*\./,"").search(acc)>=0) N[N.length] = F[i];
      if(N.length){
         if(N.length>1 && !this.IsRange(row,col)) N.length = 1;
         this.SetFile(row,col,N);
         return true;
         }
      ME.File;
      }
   else {
      
      }
   }

if(Grids.OnDropFileError) Grids.OnDropFileError(this,row,col,F); 
return false;
}
ME.File$Style$Import;
// -----------------------------------------------------------------------------------------------------------
// Fires on mouse wheel
// type = 0 onwheel, 1 onmousewheel, 2 DOMMouseScroll
TGP.GridMouseWheel = function(ev){
if(this.NoVScroll||!this.ScrollVertDisplay) return;
if(!ev) ev = window.event;
var dx = ev.deltaX!=null ? -ev.deltaX : ev.wheelDeltaX;
var dy = ev.deltaY!=null ? -ev.deltaY : ev.wheelDeltaY; if(dy==null) dy = ev.wheelDelta; if(dy==null) dy = -ev.detail*40;

if(ev.deltaMode) { dx *= 40; dy *= 40; }
if(this.Disabled || this.NoVScroll&&!dx || this.NoHScroll&&!dy || this.NoHScroll&&this.NoVScroll || this.NoScroll || this.Event.Grid=="Outside"&&(Grids.Active==this||Grids.Active&&!Grids.Active.NestedGrid)) { 
   this.HideHint(); 
   if(this.NestedGrid) return this.MasterGrid.GridMouseWheel(ev);
   return true; 
   }
if(!dy){
   if(this.ASec<0) return true;
   var sec = 1;
   if(this.ARow && !this.ARow.Space && this.ACol) sec = this.Cols[this.ACol].MainSec;
   if(!this.ScrollHorzParent[sec] || this.ScrollHorz[sec].offsetWidth >= this.ScrollHorz[sec].scrollWidth) sec = sec==1 ? 2 : 1;
   if(!this.ScrollHorzParent[sec] || this.ScrollHorz[sec].offsetWidth >= this.ScrollHorz[sec].scrollWidth) return true;
   this.SetScrollLeft(this.GetScrollLeft(sec)-dx,sec);
   this.Scrolled();
   this.GridMouseMove(ev);
   if(this.NestedGrid) CancelEvent(ev,1);
   return false;
   }

if(this.Dialog && this.Dialog.HasVScroll) return true;

MS.Pager;
if(this.ASec<=-10){ 
   var P = this.Pagers[-this.ASec-10];
   if(P.Body.offsetHeight < P.Body.firstChild.offsetHeight){
      P.Body.scrollTop -= dy;
      return false;      
      }
   }
ME.Pager;
   
MS.Lines;
if(this.EditMode && this.IsMultiline(this.FRow,this.FCol) && this.Edit.Tag.scrollHeight > this.Edit.Tag.clientHeight) { this.HideHint(); return true; }
ME.Lines;
if(this.ScrollVertDisplay.style.display) { this.HideHint(); return true; } 
this.SetScrollTop(this.GetScrollTop() - dy);
this.Scrolled();
this.GridMouseMove(ev);
CancelEvent(ev);
return false;
}
// -----------------------------------------------------------------------------------------------------------
MS.Space;
TGP.SpaceMouseMove = function(dummy,pos){
var r = GetNode(this.XS,pos);
if(!r) return; 
this.ARow = r;
this.ASec = 3;
this.ASpaceCol = this.TmpSpaceCol; 
this.TmpSpaceCol = null; 
}
ME.Space;
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateARow = function(always,x,y){
if(!document.elementFromPoint || (Grids.Drag||this.EditMode)&&x==null) return;

if(x==null){ 
   MS.Dialog;
   x = Dialogs.X; y = Dialogs.Y; 
   MX.Dialog;
   MS._Debug;if(0){ME._Debug; return; MS._Debug;}ME._Debug;
   ME.Dialog;
   }

var row = this.ARow, ok = 0;
var e = document.elementFromPoint(x,y);
if(!e && BIEA) return; 
for(;e&&!e.ARowStop;e=e.parentNode) if(e.onmousemove) { try { e.onmousemove(); ok++; } catch(ex) { } } else if(e.ontouchstart) { try { e.ontouchstart(); ok++; } catch(ex) { } }

if(!ok&&e&&e.ARowStop<0){ 
   var ee = e; e.style.display = "none";
   e = document.elementFromPoint(x,y);
   for(;e&&!e.ARowStop;e=e.parentNode) if(e.onmousemove) { try { e.onmousemove(); ok++; } catch(ex) { } }
   ee.style.display = "";
   }
if(!ok && (!this.Rtl||!BIE8Strict)) this.ARow = null; 

if(row!=this.ARow&&always!=-1 || always>0){
   this.Event.Row = this.ARow;
   if(!this.NestedGrid||row) {
      this.UpdatePos();
      this.GridMouseOver();
      }
   }
}
// ----------------------------------------------------------------------------------------------------------
TGP.FindARow = function(ev){
if(!ev) return;
if(ev.changedTouches) ev = ev.changedTouches[0];
var y = ev.clientY - this.Event.ClientY + this.Event.Y, row = this.ARow;
if(y<0) while(row&&y<0) { row = row.Fixed ? row.previousSibling : this.GetPrevVisible(row); if(row&&row.r1) y += row.r1.offsetHeight; }
else { if(row) y -= row.r1.offsetHeight; while(row&&y>=0) { row = row.Fixed ? row.nextSibling : this.GetNextVisible(row); if(row&&row.r1) y -= row.r1.offsetHeight; } }
if(row) { this.ARow = row; this.Event.Y = y<0?y+row.r1.offsetHeight : y; this.Event.ClientY = ev.clientY; }
}
// -----------------------------------------------------------------------------------------------------------
MS.Touch;
// -----------------------------------------------------------------------------------------------------------
if(BTouch){
   AttachEvent(document,"touchstart",function(ev){ if(ev&&ev.touches) Grids.Touches = ev.touches.length; },1);
   AttachEvent(document,"touchend",function(ev){ if(ev&&ev.touches) Grids.Touches = ev.touches.length; },1);
   }
// -----------------------------------------------------------------------------------------------------------
TGP.GridTouchStart = function(ev){

var NA = this.NoTouchAlert; if(NA){ this.NoTouchAlert = null; if(NA>new Date()-100) return; } 
if(!ev) ev = window.event;


var E = { clientX:ev.changedTouches[0].clientX, clientY:ev.changedTouches[0].clientY, touches:Grids.Touches>ev.touches.length ? Grids.Touches : ev.touches.length };
this.GridMouseOver(E,1);
this.UpdateCursors(1);

if(!Grids.Drag || !Grids.Drag.Action || Grids.Drag.Action=="None") {
   this.GridMouseDown(E);
   if(Grids.Drag){
      Grids.Drag.TouchDistance = ev.touches.length==2 ? [ev.touches[0].clientX - ev.touches[1].clientX, ev.touches[0].clientY - ev.touches[1].clientY] : null; 
      if(ev.touches.length==2) this.SetTouchScale(Grids.Drag,ev.touches[0],ev.touches[1]);
      }
   }
if(E.cancelBubble) CancelEvent(ev,1); 
if(E.returnValue==false) CancelEvent(ev,2);
this.TouchId = ev.changedTouches[0].identifier;
this.TouchScrollPos = document.body.scrollTop+","+document.body.scrollLeft;
this.TouchTime = new Date()-0;
this.TouchEvent = E;
if((BEdge||BAndroid||BIPAD) && this.ARow && (
      this.TouchDragFocused && (this.ARow==this.FRow && (this.TouchDragFocused!=2 || this.ACol==this.FCol) || this.FGantt && this.FGantt.Row==this.ARow) 
   || !this.ARow.Space&&this.GetType(this.ARow,this.ACol)=="Panel"                
   || this.ARow.Kind=="Header"&&(this.ColResizing||this.ColMoving||this.Grouping)&&(!this.Locked["movecol"]||!this.Locked["group"]) 
   || this.ARow.Space&&this.ACol&&this.GetType(this.ARow,this.ACol)=="DropCols"&&!this.Locked["group"]   
   || this.ARow.Space&&this.ARow.DragTab&&(Get(this.ARow,this.ACol+"CanCopy")||Get(this.ARow,this.ACol+"CanMove")!="0")&&!this.Locked[this.ARow[this.ACol+"Sheet"]?"sheet":"tab"] 
   )) return false; 

}
// -----------------------------------------------------------------------------------------------------------
TGP.GridTouchEnd = function(ev){
if(!ev) ev = window.event;

for(var i=0,t=null;i<ev.changedTouches.length;i++) if(this.TouchId == ev.changedTouches[i].identifier) { t = ev.changedTouches[i]; break; }
this.FocusedEdge = null;
this.TouchTime = null;

if(Grids.Drag && Grids.Drag.Action){ 
   
   if(Grids.Drag.TouchDistance && ev.touches.length+ev.changedTouches.length==2) this.SetTouchScale(Grids.Drag,ev.touches.length?ev.touches[0]:ev.changedTouches[1],ev.changedTouches[0]);
   if(t==null) return false;
   this.TouchId = null; 
   if(t.target.parentNode==this.MainTable) t.target.parentNode.removeChild(t.target); 
   var E = { clientX:t.clientX, clientY:t.clientY, touches:Grids.Touches>ev.touches.length ? Grids.Touches : ev.touches.length+1 };
   var G = this.FindTouchGrid(E); 
   G.GridMouseUp(E);
   this.ARow = null; this.UpdateCursors(1);
   return false;
   }
else if(t!=null && this.TouchScrollPos == document.body.scrollTop+","+document.body.scrollLeft) { 
   
   var E = { clientX:t.clientX, clientY:t.clientY, touches:Grids.Touches>ev.touches.length ? Grids.Touches : ev.touches.length+1 };
   
   this.GridMouseUp(E);
   var D = this.Dialog;
   Grids.NoClickTo = null;
   this.GridClick(E);
   Grids.NoClickTo = new Date()-0+1000; 
   this.TouchId = null;
   
   if(this.TouchClearFocused) this.TouchClearFocusedGantt = this.FGantt ? new Date()-0 : null;
   this.ARow = null; this.UpdateCursors(1);
   if(this.Dialog && D!=this.Dialog) return false; 
   if(E.returnValue==false && !this.EditMode) return false; 
   if(this.EditMode && !BTablet) CancelEvent(ev,2); 
   return true;
   }
else {
   
   var E = { clientX:ev.changedTouches[0].clientX, clientY:ev.changedTouches[0].clientY, touches:Grids.Touches>ev.touches.length ? Grids.Touches : ev.touches.length+1 };
   this.GridMouseUp(E);
   this.ARow = null; this.UpdateCursors(1);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.GridTouchMove = function(ev){
if(!ev) ev = window.event;

for(var i=0,t=null;i<ev.changedTouches.length;i++) if(this.TouchId == ev.changedTouches[i].identifier) { t = ev.changedTouches[i]; break; }
if(t==null) return (!Grids.Drag||!Grids.Drag.Action) && !this.EditMode;
var E = { clientX:t.clientX, clientY:t.clientY, touches:Grids.Touches>ev.touches.length ? Grids.Touches : ev.touches.length };
var A = EventToWindow(E);
 this.UpdateARow(0,E.clientX,E.clientY); 
if(Grids.Drag && Grids.Drag.TouchDistance && ev.touches.length==2) this.SetTouchScale(Grids.Drag,ev.touches[0],ev.touches[1]);

var G = this.FindTouchGrid(E); 
if(Grids.MouseObject) G.MoveMouseObject(E);
var ret = !G.RunDrag(E) && !G.EditMode;
G.TouchTime = null;

for(var p=t.target;p.parentNode&&p.parentNode!=this.MainTable&&p.parentNode!=document.body;p=p.parentNode);

if(!p.parentNode){ 
   try {
      t.target.style.display = "none";
      this.MainTable.appendChild(t.target);
      } 
   catch(e) { }
   }

return ret;

}
// -----------------------------------------------------------------------------------------------------------
TGP.SetTouchScale = function(D,e1,e2){
if(!D||!e1||!e2) return;
D.TouchScaleX = Math.abs((e1.clientX - e2.clientX) / D.TouchDistance[0]); D.TouchScaleY = Math.abs((e1.clientY - e2.clientY) / D.TouchDistance[1]);
D.TouchX = Math.floor(e1.clientX/2+e2.clientX/2); D.TouchY = Math.floor(e1.clientY/2+e2.clientY/2);
}
// -----------------------------------------------------------------------------------------------------------
TGP.FindTouchGrid = function(E){
this.GridMouseOver(E);
if(this.Event.Grid=="Grid") return this;
var A = EventToWindow(E); 
for(var i=0;i<Grids.length;i++) {
   var G = Grids[i]; if(G && G!=this) {
      var X = A[0] - G.TableX, Y = A[1] - G.TableY; 
      if(X>=0 && X<G.TableWidth && Y>=0 && Y<G.TableHeight){
         G.GridMouseOver(E);
         if(G.Event.Grid=="Grid") return G;
         }
      }
   }
return this;
}
// -----------------------------------------------------------------------------------------------------------
ME.Touch;

// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
function ClearGridsDrag(){
if(!Grids.Drag) return;
var I = Grids.Drag.Images;
if(I) for(var n in I) if(I[n].style) I[n].style.pointerEvents = "";
Grids.Drag = null;
}
// -----------------------------------------------------------------------------------------------------------

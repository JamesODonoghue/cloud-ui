// -----------------------------------------------------------------------------------------------------------
// Functions for all popup dialogs in grid
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Hides actually displayed popup dialog, if exists
TGP.CloseDialog = function(){
MS.Dialog;
if(!this.Dialog) return false;
this.Dialog.Close();
this.Dialog = null;
return true;
ME.Dialog;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionCloseDialog = TGP.CloseDialog;
// -----------------------------------------------------------------------------------------------------------
TGP.DisableMomentumScroll = function(){
if(!(this.MomentumScroll&2) || !this.MainTable || BIEA || BFF63) return;
var A = [this.BodyMain,this.HeadMain,this.FootMain];

for(var i=0;i<3;i++) for(var j=0;j<3;j++) if(A[i][j]) A[i][j].style.overflow = "hidden";
for(var i=0,P=this.Pagers;i<P.length;i++) if(P[i].Body) P[i].Body.style.overflow = "hidden";

}
// -----------------------------------------------------------------------------------------------------------
TGP.EnableMomentumScroll = function(){
if(!(this.MomentumScroll&2) || !this.MainTable || BIEA || BFF63) return;
var A = [this.BodyMain,this.HeadMain,this.FootMain];

for(var i=0;i<3;i++) {
   for(var j=0;j<3;j++) if(A[i][j]) { A[i][j].style.overflow = "scroll";  }
   if(A[1][j]) A[1][j].style.overflowY = "hidden";
   }
for(var i=0,P=this.Pagers;i<P.length;i++) if(P[i].Body) { P[i].Body.style.overflow = "auto"; P[i].Body.style.overflowX = "hidden"; }

}
// -----------------------------------------------------------------------------------------------------------
MS.Message;
TGP.GetMessage = function(){
var M = this.Message; if(!M){ M = CreateMessage(); this.Message = M; }
M.Parent = this.MainTag; M.Style = this.Img.Style; M.StyleSize = this.Img.Size; M.ZIndex = this.ZIndex;
M.ButtonNames = this.Lang["MenuButtons"];
M.X = this.TableX; M.Y = this.TableY;
M.This = this.This+".Message";
M.Grid = this;
if(this.MainTable) { 
    
   M.Y -= this.MainTable.offsetTop; if(!this.Rtl) M.X -= this.MainTable.offsetLeft; 
   if((!BIEA||BIE8Strict) && GetStyle(this.MainTag).position!="absolute") { M.Y += this.MainTag.offsetTop; if(!this.Rtl) M.X += this.MainTag.offsetLeft; }
   } 
MS.Animate; if(this.AnimateDialogs&&!this.SuppressAnimations) { M.AnimShow = this.Animations["ShowMessage"]; M.AnimHide = this.Animations["HideMessage"]; } ME.Animate;
return M;
}
ME.Message;
// -----------------------------------------------------------------------------------------------------------
// Disables grid, the grid is not interactive
TGP.Disable = function(hard,noclose){
MS.Message;
if(this.Disabled || !this.MainTag) return;
if(Grids.OnDisable) Grids.OnDisable(this);
if(!noclose) this.CloseDialog();
this.Disabled = true;
var M = this.GetMessage();
M.Disable(hard);
this.DisableMomentumScroll();
ME.Message;
}
// -----------------------------------------------------------------------------------------------------------
// Enables grid, the grid is interactive again
TGP.Enable = function(){
MS.Message;
if(!this.Disabled) return;
this.Disabled = false;
var M = this.Message; if(M) M.Enable();
this.EnableMomentumScroll();
if(Grids.Focused!=this && this.FRow) this.RunAction("Click","Outside","");
if(Grids.OnEnable) Grids.OnEnable(this);
ME.Message;
}
// -----------------------------------------------------------------------------------------------------------
// Shows modal message, disables grid
TGP.ShowMessage = function(txt,level,type){
MS.Message;
if(this.SuppressMessage>=(level?level:2) || !txt || !this.MainTag){
   if(level>3) this.Disable(type&1);
   return;
   }
this.Disable(type&1);
if(!this.MainTag.offsetWidth || this.OrigTag) return; 
MS.Digits; if(this.Lang.Format.Digits && txt.search(/\d/)>=0) txt = this.Lang.Format.ConvertDigits(txt); ME.Digits;
if(BOpera && BOperaVer<9.5) this.HideMessage(1); 
MS.Scale;
if(this.ScaleMenu) {
   var zoom = this.ScaleMenu<0 ? (this.Scale?this.Scale:1) * (this.ScaleX?(this.ScaleX+this.ScaleY)/2:1) * -this.ScaleMenu : this.ScaleMenu;
   txt = "<div style='transform:scale("+zoom+");margin:0px "+(zoom*100-100)+"px;'>"+txt+"</div>";
   }
ME.Scale;
var M = this.GetMessage();
M.Width = this.MessageWidth; M.Center = this.CenterMessage; M.Move = this.MoveMessage;
M.Show(txt,type&2);
if(Grids.OnShowMessage) Grids.OnShowMessage(this,M.Tag);
ME.Message;
}
// -----------------------------------------------------------------------------------------------------------
// Hides modal message, enables grid
TGP.HideMessage = function(now){
MS.Message;
this.Enable();
var M = this.Message; if(M) M.Hide(now);
ME.Message;
}
// -----------------------------------------------------------------------------------------------------------
// Shows modal message, disables grid
TGP.ShowMessageTime = function(txt,time,func,buttons,level){
MS.Message;
if(this.SuppressMessage>=(level?level:4) || !txt || !this.MainTag) return;
var M = this.GetMessage(), T = this;
function finish(ret) {
   T.Enable();
   if(T != Grids.Focused) T.SetGridFocused();
   if(T.EditMode && T.Edit) { T.Edit.Tag.focus(); if(T.Edit.Tag.select) T.Edit.Tag.select(); }
   if(func) func(ret);
   }
this.Disable(time?0:1);
if(!time) this.SetGridFocused();
M.ShowTime(txt,time,finish,buttons);
ME.Message;
}
// ----------------------------------------------------------------------------------------------------------
// Shows asynchronous dialog to input some string
// text is caption, def is default value
// func is function called after input, its first parameter is the input value or null for cancel
// width is optional width in pixels
TGP.Prompt = function(text,def,func,width){
MS.Message;
if(Grids.OnPrompt) {
   var A = Grids.OnPrompt(this,text,def);
   if(A!=null){
      if(typeof(A)=="object"){
         if(A[0]!=null) text = A[0];
         if(A[1]!=null) def = A[1];
         if(A[2]-0) width = A[2];
         }
      else if(typeof(A)=="string"){ if(func) func(A); return; }
      else if(A-0){ if(func) func(A+""); return; }
      else if(!A){ if(func) func(null); return; }
      }
   }
this.Disable(1);
var T = this;
this.GetMessage().Prompt(text,def,function(ret){ 
   T.Enable();
   if(Grids.OnPromptFinish) { 
      var A = Grids.OnPromptFinish(T,text,def,ret); 
      if(A!=null) { 
         if(typeof(A)=="object"){
            if(A[0]!=null) text = A[0];
            if(A[1]!=null) def = A[1];
            if(A[2]-0) width = A[2];
            setTimeout(function(){T.Prompt(text,def,func,width);},10);
            return;
            }
         else if(typeof(A)=="string") ret = A; 
         else if(A-0){ ret = A+""; }
         else if(!A) ret = null; 
         } 
      }
   if(func) func(ret); 
   },width);
ME.Message;
}
// -----------------------------------------------------------------------------------------------------------
// Shows or updates progress dialog with Cancel button
TGP.ShowProgress = function(caption,txt,cancel,pos,cnt){
MS.Message;
this.Disable(1);
var T = this;
this.GetMessage().ShowProgress(caption,txt,cancel,pos,cnt,function() { T.CancelProgress = 1; });
ME.Message;   
}
// ----------------------------------------------------------------------------------------------------------
MS.DatePick;
// -----------------------------------------------------------------------------------------------------------
// Displays calendar
TGP.ShowDatePicker = function(row,col){
if(this.Disabled || this.EditMode && this.EndEdit(1)==-1) return;
var M = this.GetAttr(row,col,"Calendar");
if(!M) M = { }; else M = FromJSON(M,1);
var gmt = this.Lang.Format.GMT, gmn = this.GetAttr(row,col,"GMT"); if(gmn!=null) this.Lang.Format.GMT = gmn;
if(M.ReadOnly==null) M.ReadOnly = this.CanEdit(row,col)==2;
if(M.Buttons==null) M.Buttons = this.GetAttr(row,col,"CalendarButtons");
if(M.Buttons2==null) M.Buttons2 = 1;
if(M.Range==null&&this.IsRange(row,col)) M.Range = 1;
M.Date = Get(row,col);
if(M.Date && !(M.Date-0>=86400000) && !M.Range) M.Date = "";
M.NoDate = !M.Date;
if(!M.Date) M.Date = this.GetAttr(row,col,"DefaultDate",this["DefaultDate"]);

if(!M.Class) M.Class = this.Img.Style+"Pick";
if(!M.Texts) M.Texts = this.Lang.MenuButtons;
var F = this.GetFormat(row,col,"Date"); if(F) F = this.Lang.Format.PrepareDateFormat(F);
if(M.TimeFormat==null) M.TimeFormat = F;
if(M.Edit==null) M.Edit = F&&F.search(/d/i)<0&&F.search(/[yYM]/)>=0 ? 6 : 7;
if(M.ReadOnly || this.GetAttr(row,col,"CanEmpty")=="0") M.CanEmpty = 0;
M.Now = this.GetAttr(row,col,"ActualDate");

var P = this.CellToWindow(row,col,row.Space?4:0), anim = "Calendar"; 
P.X = P.AbsX; P.Y = P.AbsY;
P.Align = "right below";  
if(this.GetAttr(row,col,"Icon")=="Date"&&this.GetAttr(row,col,"IconAlign")!="Right") { P.Align = "left below"; M.MainClass = this.Img.Style+"PickMainLeft"; }

var T = this;
M.OnSave = function(val){ 
   
   return T.FinishEdit(row,col,val,val==""); 
   }

M.OnClose = function(){
   T.Lang.Format.GMT = gmt;
   }

if(Grids.OnCanEditDate) M.OnCanEditDate = function(date){ return Grids.OnCanEditDate(T,row,col,date); }
if(Grids.OnGetCalendarDate) M.OnGetCalendarDate = function(date,ds,cc,multi){ return Grids.OnGetCalendarDate(T,row,col,date,ds,cc,multi); }
this.SetDialogBase(M,row,col,"Calendar",anim);
MS.Animate;
if(this.AnimateDialogs && !this.SuppressAnimations){
   M.AnimateDaysFrom = this.Animations["CalendarDaysFrom"]; M.AnimateMonthFrom = this.Animations["CalendarMonthFrom"]; M.AnimateMonthsFrom = this.Animations["CalendarMonthsFrom"]; M.AnimateYearFrom = this.Animations["CalendarYearFrom"];
   M.AnimateDaysTo = this.Animations["CalendarDaysTo"]; M.AnimateMonthTo = this.Animations["CalendarMonthTo"]; M.AnimateMonthsTo = this.Animations["CalendarMonthsTo"]; M.AnimateYearTo = this.Animations["CalendarYearTo"];
   }
ME.Animate;
this.Dialog = ShowCalendar(M,P);
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionShowCalendar = function(F,T){
var A = this.GetACell(F); if(!A) return false; 
var row = A[0], col = A[1];
MS.RowSpan; if(row.RowSpan) row = this.GetSpanRow(row,col,0); ME.RowSpan;
if({"Date":1,"Auto":1}[this.GetType(row,col)] && !this.Editing||this.Editing==3&&!CEditKinds[row.Kind] || this.Locked.length&&this.IsLockedEdit(row,col)) return false; 
if(!this.CanEdit(row,col) && this.GetAttr(row,col,"Button")!="Date" && this.GetAttr(row,col,"Icon")!="Date") return false; 

if(T) return true;
if(this.Dialog && this.Dialog.Row==row && this.Dialog.Col==col) { this.CloseDialog(); return true; }
this.ShowDatePicker(row,col);
return true;
}
// -----------------------------------------------------------------------------------------------------------
ME.DatePick;

MS.PopupGrid;
// -----------------------------------------------------------------------------------------------------------
// Displays popup grid
TGP.ShowPopupGrid = function(row,col,xml,width,height,M,PP){
if(this.Disabled || this.EditMode && this.EndEdit(1)==-1) return;
if(this.LastGridRow==row&&this.LastGridCol==col&&this.LastGridTime>new Date()-200) return; 
if(!M) M = this.GetAttr(row,col,"Dates");
if(!M) M = { }; else M = FromJSON(M,1);
M.Base = this.Img.Style+"Menu";
M.Class = this.Img.Style+"PopupGrid";
M.StyleSize = this.Img.Size;

M.ZIndex = this.ZIndex!=null ? this.ZIndex + 20 : 270;

if(row==null||!row.parentNode){
   var P = {Align:"center middle",Tag:this.MainTag,Realign:0};
   }
else {
   var P = this.CellToWindow(row,col);
   P.X = P.AbsX; P.Y = P.AbsY;
   P.Align = "right below";   
   }
if(PP) for(var p in PP) P[p] = PP[p];

var T = this;
M.OnClose = function(){
   T.LastGridRow = row;
   T.LastGridCol = col;
   T.LastGridTime = new Date()-0;
   T.Dialog = null;
   
   Grids.Focused = T;
   Grids.Active = T;
   Grids.OnResizeMain = onresizeold;
   M.OnClose = null; 
   G.Dispose();
   T.Enable();
   if(G.Index==Grids.length-1) Grids.length--; 
   }

var Z = document.createElement("div"), cde = "ode";
Z.className = "GridTmpTag";
Z.style.width = "300px";
Z.style.height = "100px";
this.AppendTag(Z);
var bonus = {
   Cfg:{
      ZIndex:this.ZIndex!=null?this.ZIndex+20:270, SuppressMessage:1, NoVScroll:height?0:1, MaxVScroll:height, NoHScroll:width?0:1, MaxHScroll:width, ColResizing:0, ColMoving:0, 
      Style:this.Style, CSS:this.CSS, GanttStyle:this.GanttStyle, GanttCSS:this.GanttCSS, Size:this.Size, Scale:this.ScaleMenu>0?this.ScaleMenu:this.Scale?this.Scale:1, ScaleMenu:this.ScaleMenu,
      TestIds:this.TestIds, TestIdSeparator:this.TestIdSeparator, ExcelDates:this.ExcelDates, Language:this.Language, Trans:this.Trans
      },
   Lang:this.CopyLang()
   };
bonus.Cfg['C'+cde] = this['C'+cde];
var S = this.Source, G = TreeGrid({Sync:1,Debug:S.DebugOrig,DebugTag:S.DebugTag,DebugWindow:S.DebugWindow,DebugCheckIgnore:"Last",Defaults:this.Source.Defaults,Text:this.Source.Text,Data:{Data:xml,Bonus:bonus}},Z); 
if(!G || !G.MainTable) { if(G) G.Dispose(); return null; }

M.Body = "<div style='width:"+(width?width:G.MainTable.offsetWidth)+"px;height:"+(height?height:G.Img.TopHeight + G.Img.BottomHeight + G.MainTable.offsetHeight)+"px;overflow:hidden;'></div>";
M.MinHeight = 0;
M.CanFocus = 1;

this.CloseDialog(); this.HideTip();
if(height) M.NoScroll = 1;
M.Grid = G;
M.Type = "Grid"; 
M = ShowDialog(M,P);
M.Row = row; M.Col = col; 
this.Dialog = M;
G.ParentDialog = M;
G.ParentGrid = this;
var B = M.GetBody().firstChild.firstChild; B.innerHTML = "";
for(var r=Z.firstChild;r;r=Z.firstChild) B.appendChild(r);
G.MainTag = B;

Z.parentNode.removeChild(Z);

setTimeout(function(){
   if(G.Cleared) return;
   G.Update();
   Grids.Focused = G;
   Grids.Active = G;
   
   G.TabLeftRight(0,0);
   },10);
G.Actions.OnClickOutside = "if("+G.This+".HasChanges())return 0;"+this.This+".CloseDialog();return 1;";
var onresizeold = Grids.OnResizeMain;
Grids.OnResizeMain = function(R){
   if(R==G) M.UpdatePos();
   else if(onresizeold) onresizeold(R);
   }
return G;  
}
// -----------------------------------------------------------------------------------------------------------
// Called on click to button in ShowDates grid
TGP.ShowDatesButton = function(G,but){
if(but=="Cancel") {
   if(Grids.OnDatesClose) Grids.OnDatesClose(this,G,0);
   this.CloseDialog(); 
   return 1;
   }
if(but=="Clear"){
   G.StartUpdate();
   var del = G.Toolbar[but].indexOf(G.Lang.MenuButtons["Clear"])>=0;
   for(var r=G.GetPrevVisible(G.GetLastVisible());r;r=G.GetPrevVisible(r)) if(!r.Deleted==del) G.DeleteRow(r);
   
   G.EndUpdate();
   }   
if(but=="Ok"){
   if(G.EditMode && G.EndEdit(1)==-1) return 0;
   if(!G.HasChanges()) { 
      if(Grids.OnDatesClose) Grids.OnDatesClose(this,G,0);
      this.CloseDialog(); 
      return 1; 
      }
   var L = this.Lang.Format;
   MS.Hirji; var LH = L.Hirji; L.Hirji = L.Hirji&2?1:0; ME.Hirji;
   var sep = L.RepeatSeparator, ds = this.DateStrings; if(G.Cols.Start.Type!="Date") ds = 0;
   function conv(val){ return ds ? (val==0&&ds==1?"00:00":L.DateToString(val,ds==2?"yyyy-MM-dd HH:mm:ss":(ds==1?null:ds),0)) : val; }
   var val = {}, endlast = G.DatesEndLast!=0&&G.Cols.End.Type=="Date";
   for(var b=G.GetFirstVisible(),one=!b.firstChild;b;b=b.nextSibling) if(!b.Deleted&&b.Visible){
      for(var r=one?b:b.firstChild,A=[];r;r=r.nextSibling) if(!r.Deleted&&r.Visible){
         var v = "", R = Get(r,"Repeat"), S = Get(r,"Start"), E = Get(r,"End"), V = Get(r,"Value"), s = Get(r,"StartTime"), e = Get(r,"EndTime");
         if(s!=="") S = S ? S+s : s;
         if(e!=="") E = E ? E+e : e;
         else if(E!=="" && endlast) E = E-0+86400000;
         if(R&&(S!==""||V!=="")) v += R+sep;
         if(S!=="") v += conv(S) + L.RangeSeparator;
         if(E!=="") v += (S!==""?"":L.RangeSeparator) + conv(E);
         if(V!=="") v += (v?sep:"")+V;
         if(v) A[A.length] = v;
         }
      v = A.join(L.ValueSeparator);
      if(one) { val = v; break; }
      val[b.Name] = v;
      }
   MS.Hirji; L.Hirji = LH; ME.Hirji;
   var row = this.Dialog.Row, col = this.Dialog.Col;
   if(val && this.GetType(row,col)=="Date"){  
      var vv = this.Lang.Format.StringToDate(val,this.GetFormat(row,col,"Date"),1,null);
      if(vv) val = vv;
      }
   if(G.Finish) { G.Finish(val,this); }
   else this.FinishEdit(row,col,val,val=="");
   if(Grids.OnDatesClose) Grids.OnDatesClose(this,G,1);
   this.CloseDialog(); 
   return 1; 
   }
}
// -----------------------------------------------------------------------------------------------------------
// Displays popup grid
TGP.ShowDates = function(row,col,val,finish){
if(val==null) val = Get(row,col);
var one = 0, prefix = row==this?"":"Dates";
if(typeof(val)!="object" || !val) { one = 1; val = { "Name":val }; }
var L = this.Lang["MenuButtons"], cls = this.Img.Style+"PopupGridButton "+this.Img.Style+"MenuButton "+this.Img.Style+"DialogButton "+this.Img.Style+"DialogButton"; 
var add = "if(!Row.nextSibling){Row.CanDelete=1;Grid.RefreshCell(Row,'Panel');Grid.AddRow(Row.parentNode,null,1);}"
var empty = this.GetAttr(row,col,prefix+"EmptyDate");
var D = {
   Cfg:{id:'DatesDialog',SuppressCfg:1,Sorting:0,Dragging:0,Undo:1,ConstWidth:250,MainCol:one?"":"Name","DefaultDate":this.DefaultDate},
   Def:[
      {Name:"R",CanDelete:0,Repeat:"",Start:"",StartTime:"",End:"",EndTime:"",Value:""},
      {Name:"Node",Spanned:1,"NameSpan":7,"NameIcon":"Expand"}
      ],
   Actions:{OnEsc:"if(!Grid.HasChanges())"+this.This+".CloseDialog();"},
   Cols:[
      {Name:"Name",Type:"Text",Visible:0,OnChange:"if(!Row.nextSibling){Row.CanDelete=1;Grid.RefreshCell(Row,'Panel');var r=Grid.AddRow(Row.parentNode,null,0,null,'Node');r.Name='';Grid.ShowRow(r);Grid.AddRow(r,null,1);}"},
      {Name:"Repeat",Type:"Text" },
      {Name:"Start",Type:"Date",OnChange:"if("+(empty?"Row.End&&Row.Start&&":"!Row.End||")+"Row.End<Row.Start)Grid.SetValue(Row,'End',Row.Start,1);"+add},
      {Name:"StartTime",Type:"Date",OnChange:add,Button:""},
      {Name:"EndTime",Type:"Date",OnChange:add,Button:""},
      {Name:"End",Type:"Date",OnChange:"if("+(empty?"Row.Start&&Row.End&&":"!Row.Start||")+"Row.Start>Row.End)Grid.SetValue(Row,'Start',Row.End,1);"+add},
      {Name:"Value",Type:"Float",CanEmpty:1,OnChange:add }],
   Toolbar:{Cells:"Undo,Redo,"+(one?"":"ExpandAll,CollapseAll,")+"Empty,Tmp,Cancel,Clear,Ok","Link":0,"TmpRelWidth":1,"TmpType":"Html","TmpCanFocus":0,"ClearFormula":"var b='All';for(var r=Grid.GetPrevVisible(Grid.GetLastVisible());r;r=Grid.GetPrevVisible(r))if(!r.Deleted){b='Clear';break;}return \"<button class='"+cls+"'>\"+Grid.Lang.MenuButtons[b]+\"</button>\""},
   Panel:{Select:0},Header:{"PanelVisible":0,Spanned:1,"StartSpan":2,"EndTimeSpan":2,Align:"Center"},Body:[]
   };
var BB = ["Cancel","Clear","Ok"], T = D.Toolbar;
for(var i=0;i<BB.length;i++){
   var b = BB[i];
   T[b+"Button"] = "Html";
   T[b] = "<button class='"+cls+b+"'>"+L[b]+"</button>";
   T[b+"CanFocus"] = 1;
   }
var Q = D.Cols, RA = Grids.INames, CC = this.Cols[col];
for(var i=0;i<Q.length;i++){
   var ccc = prefix+Q[i].Name, cc = col+ccc;
   for(var n in row) if(!RA[n] && n.indexOf(cc)==0) Q[i][n.slice(cc.length)] = row[n];
   if(row!=this){
      for(var n in row.Def) if(!RA[n] && n.indexOf(cc)==0 && row[n]==null) Q[i][n.slice(cc.length)] = row.Def[n];
      for(var n in CC) if(n.indexOf(ccc)==0 && row[col+n]==null && row.Def[col+n]==null) Q[i][n.slice(ccc.length)] = CC[n];
      }
   var cap = this.GetAttr(row,col,ccc+"Caption"); MS.Debug; if(cap) delete Q[i].Caption; ME.Debug;
   D.Header[Q[i].Name] = cap ? cap : this.GetText("Dates"+Q[i].Name);
   }
var title = row[col+prefix+"Title"];
if(title) D.Solid = [{Kind:"Topbar","Html":title,"HtmlAlign":"Center",Space:0}];

var last = this.GetAttr(row,col,prefix+"EndLast");
var B = {Items:[{Added:1,Visible:1,Repeat:0,Start:"12/29/2010",StartTime:"11:59",End:"12/29/2010",EndTime:"11:59",Value:0 }]}; 
D.Body[0] = B;
for(var nam in val){
   var v = val[nam] ? (val[nam]+"").split(new RegExp("\\s*\\"+this.Lang.Format.ValueSeparator+"\\s*")) : [];
   var II = one ? B : {Items:[]};
   for(var i=0;i<v.length;i++){
      var vv = v[i].split(this.Lang.Format.RepeatSeparator), I = {};
      if(vv.length==1){
         if(vv[0]==="") continue;
         if(vv[0]-0){ vv[2] = vv[0]; vv[0] = null; }      
         else { vv[2] = ""; vv[1] = vv[0]; vv[0] = null; } 
         }
      else if(vv.length==2){
         if(vv[1]-0.734) vv.splice(0,0,null); 
         else vv[2] = "";  
         }
      I.Value = vv[2]==null?"":vv[2];
      I.Repeat = vv[0];
      I.CanDelete = 1;
      if(vv[1]){
         var d = vv[1].split(this.Lang.Format.RangeSeparator);
         if(Q[2].Type!="Date") { I.Start = d[0]; I.StartTime = ""; }
         else {
            var a = this.GanttConvertDate(d[0]), n = new Date(a);
            if(this.Lang.Format.GMT) n.setUTCHours(0,0,0,0); else n.setHours(0,0,0,0);
            I.Start = n-0?n-0:""; I.StartTime = a-n||a===0&&d[1]?a-n:"";
            }
         if(Q[5].Type!="Date") { I.End = d[1]; I.EndTime = ""; }
         else {
            var a = this.GanttConvertDate(d[1]), n = new Date(a);
            if(this.Lang.Format.GMT) n.setUTCHours(0,0,0,0); else n.setHours(0,0,0,0);
            I.End = n-0?(a-n||last==0?n-0:n-86400000):""; I.EndTime = a-n||a===0&&d[1]?a-n:"";
            }
         }      
      II.Items[II.Items.length] = I;
      }
   II.Items[II.Items.length] = { }; 
   if(one) break;
   II.Def = "Node"; II.Name = nam; II.CanDelete = 1;
   B.Items[B.Items.length] = II;
   }
if(!one) B.Items[B.Items.length] = { Def:"Node",Name:"",Items:[{}] }; 

if(!Q[0].Color) Q[0].Color = "Yellow";

if(Q[2].Type!="Date") { D.Body[0].Items[0].Start = 10000; Q[3].Visible = 0;  }
else {
   if(!Q[2].Format) Q[2].Format = "a";
   if(!Q[3].Format) Q[3].Format = "t";
   if(!Q[3].EditFormat) Q[3].EditFormat = "t";
   if(Q[2].CanEdit==null) { Q[2].CanEdit = 0; Q[2].Button = "Date"; }
   }
if(Q[5].Type!="Date") { D.Body[0].Items[0].End = 10000; Q[4].Visible = 0; }
else {
   if(!Q[5].Format) Q[5].Format = "a";
   if(!Q[4].Format) Q[4].Format = "t";
   if(!Q[4].EditFormat) Q[4].EditFormat = "t";
   if(Q[5].CanEdit==null) { Q[5].CanEdit = 0; Q[5].Icon = "Date"; }
   }

var h = row[col+prefix+"Height"]; if(h==null) h = this.MainTag.offsetHeight;
var G = this.ShowPopupGrid(row,col,D,null,h);
if(!G) return;
var f = G.GetFirstVisible(); f.Added = 0; G.HideRow(f); 
var T = G.Toolbar;
for(var i=0;i<BB.length;i++){
   var b = BB[i];
   T[b+"OnClick"] = "return "+this.This+".ShowDatesButton("+G.This+",'"+b+"');";
   T[b+"OnEnter"] = T[b+"OnClick"]
   }
G.Finish = finish;
G.DatesEndLast = last; 
return G;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionShowDates = function(F,T){
var A = this.GetACell(F); if(!A) return false; 
var row = A[0], col = A[1];
if(this.Editing!=1&&!CEditKinds[row.Kind] || this.Locked.length&&this.IsLockedEdit(row,col)) return false;
if(T) return this.GetAttr(row,col,"Icon")=="Dates"||this.GetAttr(row,col,"Button")=="Dates" ? 1 : 0;
MS.RowSpan; if(row.RowSpan) row = this.GetSpanRow(row,col,0); ME.RowSpan;

if(this.Dialog && this.Dialog.Row==row && this.Dialog.Col==col) { this.CloseDialog(); return true; }
this.ShowDates(row,col);
return true;
}
// -----------------------------------------------------------------------------------------------------------
ME.PopupGrid;

// -----------------------------------------------------------------------------------------------------------
// Navigates to Link
MS.Img;

ME.Img;
// -----------------------------------------------------------------------------------------------------------
// Click to Button type
MS.Button;
// -----------------------------------------------------------------------------------------------------------
TGP.ButtonClick = function(row,col,test){
if(!row || !col) return false;
MS.RowSpan; if(row.RowSpan) row = this.GetSpanRow(row,col,0); ME.RowSpan;
if(this.GetType(row,col)!="Button" || this.GetAttr(row,col,"Button")=="TabSep") return false;
if(this.EditMode&&row==this.ERow&&col==this.ECol) return false;
if(test) return true;
if(this.EditMode) this.EndEdit(1); 
this.HideTip();
var group = this.GetAttr(row,col,"Radio"); if(group==null) { group = this.GetAttr(row,col,"Tab"); } 
var sw = this.GetAttr(row,col,"Switch");
var val = Get(row,col), ret = false;
   
function SetValue(T,val,act,data){
   if(group){
      if(!val && !T.GetAttr(row,col,"Uncheck")) { ret = false; return; }
      if(val) {
         if(row.Space) for(var i=0;i<row.Cells.length;i++) { 
            var c = row.Cells[i]; 
            if(c!=col && T.GetAttr(row,c,"Radio")==group) {
               var em = T.GetAttr(row,c,"EmptyValue"), v = Get(row,c); 
               if(em&&v!=em || v&&v!="0") { 
                  if(!em && v && v!="1" && !T.GetAttr(row,c,"ButtonText")) row[c+"ButtonText"] = v; 
                  if(T.GetAttr(row,c,"List")) {
                     if(T.GetAttr(row,c,"PopupIcon")==3) continue;
                     row[c+"Icon"] = T.GetAttr(row,c,"EmptyIcon");
                     }
                  T.SetValue(row,c,em?em:"",1,null,1); 
                  }
               } 
            }
         else for(var c in T.Cols) if(c!=col && T.GetAttr(row,c,"Radio")==group) { 
            var em = T.GetAttr(row,c,"EmptyValue"), v = Get(row,c); 
            if(em&&v!=em || v&&v!="0") {
               if(!em && v && v!="1" && !T.GetAttr(row,c,"ButtonText")) row[c+"ButtonText"] = v; 
               if(T.GetAttr(row,c,"List")) row[c+"Icon"] = T.GetAttr(row,c,"EmptyIcon");
               T.SetValue(row,c,em?em:"",1,null,1); 
               }
            }
         }
      }
   if(group||sw){      
      T.SetValue(row,col,val,1,0,1);
      ret = true;
      }
   if(act){
      var full = "OnClick"+col;
      act = T.ConvertAction(act,full);
      if(act){
         if(Try) { act(T,row,col,T.Event); ret = true; }
         else if(Catch) { MS.Debug; T.Debug(1, "Cell action [",row.id,",",col,"] '",(act+"").replace(/[\n\r]/g," "),"' for event ",full," failed with exception: "+(e.message?e.message:e)); ME.Debug; }
         }
      }   
   if(group||sw) T.Recalculate(row,col,true);
   if(data) { 
      T.Source.Data.Url = null; T.Source.Data.Script = null; T.Source.Data.Tag = null; T.Source.Data.Data = null;
      if((data+"").search(/\s*\</)>=0) T.Source.Data.Data = data;
      else if(GetElem(data)) T.Source.Data.Tag = data;
      else if(data.search(/\breturn\b|\bjavascript:\b/)>=0) T.Source.Data.Script = data;
      else T.Source.Data.Url = data;
      T.ReloadBody(null,0,"Reload");
      ret = true; 
      }   
   }
   
// --- Popup menu ---
var M = this.GetAttr(row,col,"List");
if(Grids.OnGetButtonList) { var tmp = Grids.OnGetButtonList(this,row,col,M); if(tmp!=null) M = tmp; }
if(this.GetAttr(row,col,"PopupIcon")==3 && this.Event && this.Event.Special!="Popup" && this.Event.Row==row && this.Event.Col==col) { M = null; sw = 0; group = 0; }
   
MS.Menu;
var D = this.Dialog;
if(M && D && D.Row==row && D.Col==col){  
   this.CloseDialog();
   return true; 
   }
this.CloseDialog(); this.HideTip();
if(M) {
   M = TMenu.InitMenu(M); if(!M) return false;
   this.TranslateMenu(row,col,M,"Button","Menu");
   M.CursorValue = Get(row,col);
   if(M.Class==null) M.Class = this.Img.Style+"ToolMenu";
   if(!M.MinWidth) M.MinWidth = 0;
   if(M.CloseClickHeader==null) M.CloseClickHeader = 1;
   
   var cell = this.GetCell(row,col);
   var txt = cell.innerHTML;
   var s = GetStyle(cell);
   var styl = " style='background-image:"+s.backgroundImage+";'";
   if(M.Header==null && this.GetAttr(row,col,"Button")!="Class" && (!this.Scale||this.Scale==1) && !this.ScaleX) M.Header = "<div"+styl+" class='"+cell.className+" "+this.Img.Style+"ToolHeader"+(row.Space==-1?"Above":(row.Space==5?"Below":""))+"'>"+txt+"</div>"; 
   
   var P = this.CellToWindow(row,col);
   P.Align = "left below";   
   P.X = P.AbsX; P.Y = P.AbsY;
   
   var Icons = this.GetAttr(row,col,"Icons"); 
   if(Icons){ 
      Icons += ""; Icons = Icons.split(Icons.charAt(0)); 
      var Height = this.GetAttr(row,col,"IconHeight"); if(!Height) Height = this.CellToWindow(row,col,8).Height;
      }
   for(var i=0,j=0;i<M.Items.length;i++) if(M.Items[i].Name!="-") { 
      if(Icons) { 
         M.Items[i].Icon = Icons[j+1]; 
         
         M.Items[i].Height = Height; 
         }
      M.Items[i].Index = j++; 
      }
         
   var T = this;
   M.OnCSave = function(I){
      if(!I) return true; 
      M.Close();
         
      if(Grids.OnButtonListClick) Grids.OnButtonListClick(T,row,col,I.Name,I.Value!=null?I.Value:I.Index);
      var A, R;
         
      if(I.Icon && (sw || group)) row[col+"Icon"] = I.Icon;
         
      if(I.Action) A = I.Action;
      else { A = T.GetAttr(row,col,"Actions"); if(A){ A += ""; A = A.split(A.charAt(0))[I.Index+1]; } }
         
      if(I.ReloadData) R = I.ReloadData;
      else { R = T.GetAttr(row,col,"ReloadData"); if(R){ R += ""; R = R.split(R.charAt(0))[I.Index+1]; } }
         
      SetValue(T,I.Value!=null?I.Value:I.Name,A,R);   
      }

   this.SetDialogBase(M,row,col,"List");
   if(Grids.OnShowButtonList) Grids.OnShowButtonList(this,row,col,M,P);
   this.Dialog = ShowMenu(M,P);
   return true;
   }
ME.Menu;
   
// --- Switch ---
if(sw||group) {
   if(val && val-0+""!=val){ 
      if(!this.GetAttr(row,col,"ButtonText")) row[col+"ButtonText"] = val;
      val = 1;
      }
   else val = val?0:1;
   SetValue(this,val,this.GetAttr(row,col,val?"OnCheck":"OnUncheck"),this.GetAttr(row,col,"ReloadData"));   
   }
      
else SetValue(this,null,this.GetAttr(row,col,"Action"),this.GetAttr(row,col,"ReloadData"));   

return ret;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionButton = function(F,T){ var A = this.GetACell(F,1); return A ? this.ButtonClick(A[0],A[1],T) : false; }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionButtonDown = function(F,T,up){ 
var A = this.GetACell(F,1); if(!A) return false; 
var row = A[0], col = A[1], v = row[col]; if(v==1||v===true||this.GetAttr(row,col,"Button")!="Button") return 0;
var txt = this.GetAttr(row,col,"ButtonText"); if(txt==null) row[col+"ButtonText"] = v;
var A = []; row[col] = up?0:1; this.GetRowHTML(row,A,4,col); row[col] = v; 
if(txt==null) row[col+"ButtonText"] = null;
if(!A[0]||A[0]==CNBSP) return 0; 
if(T) return true;
var cell = this.GetCell(row,col);
cell.className = A[1];
cell.style.backgroundColor = A[2];
var cf = cell.lastChild;
if(cf && cf.className) {
   cf.className = A[0].match(/class\s*=\s*[\'\"]([^\'\"]+)/)[1];
   cf = cf.firstChild;
   if(cf && cf.tagName && cf.tagName.toLowerCase()=="u") cf.className = A[0].match(/u\s+class\s*=\s*[\'\"]([^\'\"]+)/)[1]; 
   }
return 0;
}
TGP.ActionButtonUp = function(F,T){ return this.ActionButtonDown(F,T,1); }
ME.Button;
// -----------------------------------------------------------------------------------------------------------
// Click to Side button
MS.SideButton;
TGP.ActionButtonClick = function(F,T){
var A = this.GetACell(F); if(!A) return false; 
var row = A[0], col = A[1];
MS.RowSpan; if(row.RowSpan) row = this.GetSpanRow(row,col,0); ME.RowSpan;
var d = this.GetAttr(row,col,"Button"), ret = false;
if(d!="Button" && d!="Img" && d!="Html" && CButtonTypes[d]) return false;
if(Grids.OnButtonClick){ 
   if(T) return true;
   if(this.EditMode) this.EndEdit(1); 
   this.CloseDialog(); this.HideTip();
   var tmp = Grids.OnButtonClick(this,row,col,-this.Event.MinX,this.Event.Y);
   return tmp!=null ? tmp : false;
   }
return false; 
}
ME.SideButton;
// -----------------------------------------------------------------------------------------------------------
// Click to Side icon or Icon type
MS.SideButton;
TGP.ActionIconClick = function(F,T){
var A = this.GetACell(F); if(!A) return false; 
var row = A[0], col = A[1];
MS.RowSpan; if(row.RowSpan) row = this.GetSpanRow(row,col,0); ME.RowSpan;
if(CButtonTypes[this.GetAttr(row,col,"Icon")] && this.GetType(row,col)!="Icon") return false;
if(Grids.OnIconClick){ 
   if(T) return true;
   if(this.EditMode) this.EndEdit(1);
   var tmp = Grids.OnIconClick(this,row,col,CAlignTypes[this.GetAttr(row,col,"IconPos")]=="Right"?-this.Event.MinX:this.Event.X,this.Event.Y); 
   return tmp!=null ? tmp : false;
   }
return false;
}
ME.SideButton;
// -----------------------------------------------------------------------------------------------------------
// Shows TreeGrid help page
TGP.ActionShowHelp = function(dummy,T){ if(T) return true; if(Try){ window.open(this.GetUrl(this.HelpFile?this.HelpFile:this.AddPath("Help.html"))); } else if(Catch) { }; }
// -----------------------------------------------------------------------------------------------------------
TGP.GetDialogPos = function(row,col,P,always){
if(!row) return P;
if(this.Dialog) { var ret = this.Dialog.Row==row&&this.Dialog.Col==col; this.CloseDialog(); if(ret&&!always) return null; }
var PP = this.CellToWindow(row,col,row.Space?4:0); 
if(PP.Height>(this.MaxCellHeightMenu!=null?this.MaxCellHeightMenu:150)) { 
   var A = EventToAbsolute({clientX:this.Event.ClientX,clientY:this.Event.ClientY}); 
   PP = { AbsX:A[0], AbsY:A[1] };
   }
if(P) for(var p in P) PP[p] = P[p];
if(!PP.X) PP.X = PP.AbsX; 
if(!PP.Y) PP.Y = PP.AbsY;
if(!PP.Align) PP.Align = "right below";
return PP;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetDialogBase = function(M,row,col,typ,anim){
M.Base = this.Img.Style+"Menu";

MS.Digits; if(this.Lang.Format.Digits) M.Digits = this.GetAttr(row,col,"Digits"); ME.Digits;
if(this.ZIndex) M.ZIndex = this.ZIndex + 10;
M.Type = typ ? typ : "Custom";
M.StyleSize = this.Img.Size;
if(!M.MainClass) M.MainClass = "";
if(this.DynamicBorder && row && !row.NoDynBorder && (!col||!row[col+"ClsInIcon"])) M.MainClass += " "+this.Img.Style+"DB";
if(row&&row.Space) M.MainClass += " "+this.Img.Style+"MenuMainSpace";
M.OnCClose = function(){ this.Grid.Dialog = null; this.Grid.EnableMomentumScroll(); }
MS.Scale; if(this.ScaleMenu) M.Scale = this.ScaleMenu<0 ? (this.Scale?this.Scale:1) * (this.ScaleX?(this.ScaleX+this.ScaleY)/2:1) * -this.ScaleMenu : this.ScaleMenu; ME.Scale;
M.Grid = this; M.Row = row; M.Col = col;
if(!this.NoUpdatePos) { var cell = this.GetCell(row,col); if(cell) { var A = cell.getBoundingClientRect(), B = GetWindowScroll(); M.AbsPos = [A.left+B[0],A.top+B[1]]; } }
this.HideHint(); this.HideTip(); this.CloseDialog();
this.DisableMomentumScroll();
MS.Animate; 
if(this.AnimateDialogs && !this.SuppressAnimations){
   if(anim!="None"){
      if(!anim) anim = "Menu"; 
      M.AnimateShow = this.Animations["Show"+anim]; M.AnimateShowUp = this.Animations["Show"+anim+"Up"]; M.AnimateShowRight = this.Animations["Show"+anim+"Right"]; M.AnimateShowRightUp = this.Animations["Show"+anim+"RightUp"]; 
      M.AnimateHide = this.Animations["Hide"+anim]; M.AnimateHideUp = this.Animations["Hide"+anim+"Up"]; M.AnimateHideRight = this.Animations["Hide"+anim+"Right"]; M.AnimateHideRightUp = this.Animations["Hide"+anim+"RightUp"];
      M.AnimateCloseHeader = this.AnimateDialogs==2;
      }
   M.AnimateShowMenu = this.Animations["ShowPopup"]; M.AnimateShowMenuUp = this.Animations["ShowPopupUp"]; M.AnimateShowMenuRight = this.Animations["ShowPopupRight"]; M.AnimateShowMenuRightUp = this.Animations["ShowPopupRightUp"];
   M.AnimateHideMenu = this.Animations["HidePopup"]; M.AnimateHideMenuUp = this.Animations["HidePopupUp"]; M.AnimateHideMenuRight = this.Animations["HidePopupRight"]; M.AnimateHideMenuRightUp = this.Animations["HidePopupRightUp"];
   M.AnimateShowEnum = this.Animations["ShowMenu"]; M.AnimateShowEnumUp = this.Animations["ShowMenuUp"]; M.AnimateHideEnum = this.Animations["HideMenu"]; M.AnimateHideEnumUp = this.Animations["HideMenuUp"];
   M.AnimateShowTip = this.Animations["ShowTip"]; M.AnimateShowTipRight = this.Animations["ShowTipRight"]; M.AnimateHideTip = this.Animations["HideTip"]; M.AnimateHideTipRight = this.Animations["HideTipRight"];
   }
ME.Animate;
}
// -----------------------------------------------------------------------------------------------------------
// Backward compatibility
MS.Api;
TGP.ShowDialog = function(row,col,M,P,always,y){
if(!row || !col || !M) return;
if(P==0) P = { Align:"left below" }; else if(P==1) P = {Align:"right below"}; 
P = this.GetDialogPos(row,col,P,always||y!=null); if(!P) return null;
if(y!=null) { P.X += always; P.Y += y; P.Align = "left top"; } 
M = FromJSON(M); if(typeof(M)=="string") M = { Body : M };
this.SetDialogBase(M,row,col,"CustomDialog");
M = ShowDialog(M,P);
this.Dialog = M;
return M;
}
ME.Api;
// -----------------------------------------------------------------------------------------------------------
// Shows Menu for given cell
TGP.ShowMenu = function(row,col,M,P,Func,Init,always){
MS.Menu;
if(!row || !col || !M) return null;
if(typeof(M)!="string" && M.length && !M.Items) return TGP.ShowMenuOld.apply(this,arguments); 
P = this.GetDialogPos(row,col,P,always); if(!P) return null;
M = TMenu.InitMenu(M); if(!M) return null;
this.SetDialogBase(M,row,col,"CustomMenu");
M.Texts = this.Lang.MenuButtons;
if(this.Trans) this.TranslateMenu(row,col,M,null,"Menu");
M = ShowMenu(M,P,Func,Init);
this.Dialog = M;
return M;
ME.Menu;
}
// -----------------------------------------------------------------------------------------------------------
// Backward compatibility
MS.Api;
TGP.ShowMenuOld = function(row,col,names,icons,func,align,caption,x,y,user){
if(!row || !col || !names) return;
var P = this.GetDialogPos(row,col,null,1); if(!P) return null;
if(x!=null && y!=null) { P.X += x; P.Y += y; P.Align = "left top"; }
else P.Align = align ? "left below" : "right below";
for(var i=0,I=[];i<names.length;i++){ I[i] = { Name:i,Text:names[i] }; if(icons) I[i].Icon = icons[i]; }
var M = { Items:I }; this.SetDialogBase(M,row,col,"CustomMenu");
if(caption) M.Header = caption;
if(func){ var T = this; M.OnCSave = function(I){ return func(I.Name,T,row,col,user); } }
M = ShowMenu(M,P);
this.Dialog = M;
return M;
}
ME.Api;
// -----------------------------------------------------------------------------------------------------------
// Shows custom popup menu on mouse position
TGP.ShowPopup = function(M,func){
this.CloseDialog(); this.HideTip();
M = TMenu.InitMenu(M); if(!M) return null;
this.SetDialogBase(M,null,null,"CustomPopup","Popup");
M.Texts = this.Lang.MenuButtons;
if(this.Trans&&this.ARow) this.TranslateMenu(this.ARow,this.ACol,M,null,"Menu");
if(!func && !M.OnSave && Grids.OnContextMenu) { var T = this; func = function(I,V){ return !Grids.OnContextMenu(T,T.ARow,T.ACol,I?(I.Value==null?I.Name:I.Value):V.join(M.Separator)); } }
M = ShowPopup(M,func);
this.Dialog = M;
return M;
}
// -----------------------------------------------------------------------------------------------------------
MS.Api;
MS.DatePick;
TGP.ShowCalendar = function(row,col,M,P,Func,Date,always){
if(!row || !col) return null;
P = this.GetDialogPos(row,col,P,always); if(!P) return null;
if(!M) M = { }; else M = FromJSON(M,1);
this.SetDialogBase(M,row,col,"CustomCalendar","Calendar");
if(Func) M.OnSave = Func;
if(Date!=null) M.Date = Date;

MS.Digits; if(this.Lang.Format.Digits) M.Digits = this.GetAttr(row,col,"Digits"); ME.Digits;
M = ShowCalendar(M,P);
this.Dialog = M;
return M;
}
ME.DatePick;
ME.Api;
// -----------------------------------------------------------------------------------------------------------
MS.File;
// -----------------------------------------------------------------------------------------------------------
TGP.ActionShowFile = function(F,T){
var A = this.GetACell(F); if(!A) return false; 
var row = A[0], col = A[1];
MS.RowSpan; if(row.RowSpan) row = this.GetSpanRow(row,col,0); ME.RowSpan;
if(this.GetType(row,col)!="File" || this.Editing!=1&&!CEditKinds[row.Kind] || this.Locked.length&&this.IsLockedEdit(row,col)) return false;

if(T) return true;
if(this.Dialog && this.Dialog.Row==row && this.Dialog.Col==col) { this.CloseDialog(); return true; }
this.ShowFile(row,col);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ShowFile = function(row,col){
var T = this;
FileDialog(function(I){ T.SetFile(row,col,I.files); },this.IsRange(row,col),this.GetAttr(row,col,"Accept"));
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetFile = function(row,col,I){
var N = I; I = []; for(var i=0;i<N.length;i++) I[i] = N[i]; 
if(Grids.OnSetFile && Grids.OnSetFile(this,row,col,I)) return;
if(row[col] && I.length) {
   if(this.IsRange(row,col)==2) I = row[col].concat(I);
   row[col] = "";
   }
this.SetValue(row,col,I.length?I:"",1);
if(I.length && !Get(row,"NoUpload") && (row.Space||!this.Cols[col].NoUpload)) {
   if(!this.HasFiles) this.HasFiles = {};
   if(!this.HasFiles[col]) this.HasFiles[col] = {};
   this.HasFiles[col][row.id] = 1;
   }
this.Update();
}
// -----------------------------------------------------------------------------------------------------------
ME.File;

MS.Button;
// -----------------------------------------------------------------------------------------------------------
TGP.ActionDeleteTab = function(dummy,T){
var row = this.ARow, col = this.ACol;
if(!row || !row.Space || !Is(row,col+"CanDelete")) return false;
var sh = row[col+"Sheet"];
if(this.Locked[sh?"sheet":"tab"]) return false;
if(T) return true;
if(this.EditMode&&this.EndEdit(1)==-1) return false;
T = this;
this.ShowMessageTime(this.GetText(sh?"DeleteSheet":"DeleteTab").replace("%1",sh?sh:Get(row,col+"ButtonText")),0,function(b){ if(b==1||b==-1) T.DeleteTab(row,col); },["Ok","Cancel"]);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.DeleteTab = function(row,col){
if(Grids.OnTabDelete && Grids.OnTabDelete(this,row,col)) return false;
for(var i=0,CC=row.Cells,act=0;i<CC.length;i++) if(CC[i]==col) { act = i; break; }
var s1 = null, s2 = null, tabact = null;
if(Get(row,CC[act-1]+"Button")=="TabSep") s1 = Get(row,CC[act-1]+"Style");
if(Get(row,CC[act+1]+"Button")=="TabSep") s2 = Get(row,CC[act+1]+"Style");
if(s1=="TabSep" || s1&&s2!="TabSep") tabact = act-1;
else if(s2) tabact = act+1;
if(tabact==null) CC.splice(act,1);
else CC.splice((tabact<act?tabact:act),2);
if(this.LCursor && this.LCursor.ARow==row && this.LCursor.ACol==col) this.LCursor.ACol = null;
this.ACol = null; this.Event.Col = null;
this.RefreshRow(row);
if(row[col+"Sheet"]) { this.DeleteSheet(row[col+"Sheet"]); row[col+"Sheet"] = null; }
return true;
}
// -----------------------------------------------------------------------------------------------------------
ME.Button;

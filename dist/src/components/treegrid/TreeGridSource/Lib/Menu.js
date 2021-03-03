MS.Menu;
// -----------------------------------------------------------------------------------------------------------
// --------------------
// --------------------
// --------------------
// --------------------
// --------------------
// --------------------
// --------------------
// --------------------
// -----------------------------------------------------------------------------------------------------------
var TMenu = {        

   Horz:0,           
   Popup : 1,        
   CloseClickOut : 1,
   ShowCursor : 1,   
   ShowTree : 1,     
   CollapseOther : 1,
   EnterSwitches : 1,
   IgnoreSpace : 0,  
   IgnoreTab : 1,    
   IgnoreEnter : 0,  
   Base : "GMMenu",  

   Over : 5,         
   Shift : -1,       
   FocusSubmenu:1,   
   SubmenuTime : 200,
   ExpandTime : 200, 
   EnumTime : 200,   
   KeyTime : 2000,   
   Indent : 12,      
   Texts : { Ok:"OK",Clear:"Clear",All:"All on",Cancel:"Cancel" }, 

   PageLength : 8,   
   ShowHint : 0,     
   MinHeight : 0,    
   CanFocus : 1,     
   TipStart : 500,   
   TipEnd : 0,       

   NameSeparator : ":", 

   Separator : "|",  
   SeparatorReplace : "!", 

   _nope:0 };

// -----------------------------------------------------------------------------------------------------------
function ShowMenu(M,P,func,init,content){

M = TMenu.InitMenu(M,0,content); if(!M) return;
MS.Edit;
CreateInput(M,P);
ME.Edit;
if(init==null){
   if(M.Input) init = M.Input.value;
   else if(M.Values!=null) init = M.Values;
   if(typeof(init)=="string") init = init.split(M.Separator);
   }
if(init){
   if(typeof(init)!="object") init = FromJSON(init);
   if(init){
      M.SetValues(M.Items,init);
      if(M.SaveType==1) TMenu.InitValues(M);
      if(init.length==1) M.Cursor = init[0];
      }
   }
Dialogs.Add(M);
if(func) M.OnSave = func;
if(!M.ShowCursor&&M.ShowTree){
   M.StartLev = 0;
   for(var i=0;i<M.Items.length;i++) if(M.Items[i].Level) { M.StartLev = 1; break; }
   }
else M.StartLev = M.ShowCursor?1:0;
M.Checked = 0; M.VisibleCount = 0;
if(typeof(M.Buttons)=="string") M.Buttons = SplitToArray(M.Buttons);

if(M.Names[M.Cursor]==null) M.Cursor = null;
if(M.Cursor==null && M.CursorValue!=null){
   for(var i=0;i<M.Items.length;i++){
      var I = M.Items[i], val = I.Value==null ? I.Name : I.Value;
      if(!I.Bool && !I.Enum && !I.Edit && val==M.CursorValue && (M.CursorValue+""==val+"" || M.CursorValue===val)) { M.Cursor = I.id; break; }
      }
   }
M.Sep = M.Grid && M.Grid.Sep ? M.Grid.Sep : '-';
M.GridIndex = M.Sep + (M.Grid ? M.Grid.Index+(M.SubmenuIndex?M.Sep+M.SubmenuIndex:"") : M.id);
if(BTablet) { M.EnumTime = 0; M.ExpandTime = 0; }
if(M.AutoColumns) M.Items = M.SplitToColumns(M.Items,M.AutoColumns);

M.Body = M.GetHTML(M.Items,M.StartLev);

if(M.Buttons){
   var s = "", base = " "+M.Base.replace("Menu",""), clsdef1 = base+"DialogButton", clsdef2 = base+"DialogButton###", cls = M.GetClass("Button") + clsdef1 + clsdef2;
   var butt = BTouch ? "ontouchstart='this.className=\""+cls+clsdef1+"Hover "+clsdef2+"Hover "+M.GetClass("ButtonHover")+"\";this.NoClick=0;' ontouchmove='this.NoClick++;' ontouchend='TGCancelEvent(event);this.className=\""+cls+"\";if(this.NoClick>5)this.NoClick=null;else " : "";
   var butm = BMouse ? "onmouseover='this.className=\""+cls+clsdef1+"Hover "+clsdef2+"Hover "+M.GetClass("ButtonHover")+"\"' onmouseout='this.className=\""+cls+"\"' onclick='" : "";
   if(butt) butt = "<button class='"+cls+"' " + butt + M.This+".ButtonClick(\"";
   if(butm) butm = "<button class='"+cls+"' " + butm + M.This+".ButtonClick(\"";
   var idp = "id='TGMenu", ido = M.GridIndex+"'>"
   for(var i=0;i<M.Buttons.length;i++){
      var b = M.Buttons[i], bl = b.toLowerCase(); M.Buttons[i] = bl;
      if(bl=="cancel") s += (butm?butm.replace(/###/g,b)+"Cancel\")'":"")+(butt?butt.replace(/###/g,b)+"Cancel\")'":"")+idp+"Cancel"+ido+M.Texts.Cancel+"</button>";
      else if(bl=="clear") s += (butm?butm.replace(/###/g,b)+"Clear\")'":"")+(butt?butt.replace(/###/g,b)+"Clear\")'":"")+idp+"Clear"+ido+(M.Checked?M.Texts.Clear:M.Texts.All)+"</button>";
      else if(bl=="ok") s += (butm?butm.replace(/###/g,b)+"Ok\")'":"")+(butt?butt.replace(/###/g,b)+"Ok\")'":"")+idp+"Ok"+ido+M.Texts.Ok+"</button>";
      else { s += (butm?butm.replace(/###/g,b)+b+"\")'":"")+(butt?butt.replace(/###/g,b)+b+"\")'":"")+">"+(M.Texts[b]?M.Texts[b]:b)+"</button>"; M.Buttons[i] = b; }
      }
   M.Foot = s;
   }

M.OnWidth = function(T){ 
   if(BIEA && M.GroupColumns) T.firstChild.style.overflow = "";
   
   T = T.getElementsByTagName("table"); 
   var ldx = 0;
   if(Grids.SafeCSS) for(var i=0;i<T.length;i++) { T[i].width = "100%"; T[i].style.width = "100%"; }
   else for(var i=0;i<T.length;i++) T[i].width = "100%"; 
   
   if(BIE) for(var i=0;i<T.length;i++) { T[i].parentNode.style.overflowX = "hidden"; T[i].parentNode.style.height = "0px"; }
   
   }
if(M.GroupColumns) M.OnShow = function(){ M.UpdateGroupColumns(M.Items); }  
if(M.VisibleCount){ 
   if(P&&P.Write) WriteDialog(M);
   else ShowDialog(M,P);
   }
else { Dialogs.Delete(M); M.Close = null; return null; } 
M.Expanded = 1;
M.KeyDate = 0;
M.NoClickTo = (new Date()).getTime()+300;
return M;
}
var TGShowMenu = ShowMenu; if(window["ShowMenu"]==null) window["ShowMenu"] = ShowMenu; 
// -----------------------------------------------------------------------------------------------------------
TMenu.GetClass = function(cls,spec) {
return this.Base+cls+(this.Class?" "+this.Class+cls:"")+(BTablet?" "+this.Base+cls+"Touch"+(this.Class?" "+this.Class+cls+"Touch":"") : "")+(spec&&this.CustomClass?" "+this.CustomClass+cls:"");
}
// -----------------------------------------------------------------------------------------------------------
TMenu.GetClassAll = function(cls) {
return " class='"+this.Base+cls+(this.Class?" "+this.Class+cls:"")+(BTablet?" "+this.Base+cls+"Touch"+(this.Class?" "+this.Class+cls+"Touch":"") : "")+"'";
}
// -----------------------------------------------------------------------------------------------------------
TMenu.InitValues = function(P) {
for(var i=0;i<P.Items.length;i++){ 
   var I = P.Items[i];
   if(I.Items) TMenu.InitValues(I);
   if(I.Bool==3) this.UpdateBool3Value(I);
   I.OValue = I.Value;
   }
}
// -----------------------------------------------------------------------------------------------------------
TMenu.InitItems = function(M,P,Names,rtl,from,to) {
if(!P.Items) return;
if(typeof(P.Items)=="string") P.Items = SplitToArray(P.Items);
if(to==null) to = P.Items.length-1;
for(var i=from?from:0;i<=to;i++){ 
   if(typeof(P.Items[i])!="object") P.Items[i] = { Name:P.Items[i]+"" };
   var I = P.Items[i];
   if(P.Default) for(var v in P.Default) if(I[v]==null) I[v] = P.Default[v];
   I.Parent = P;
   if(I.Items) {
      if(P.Default&&I.Default==null&&P.Default.All) I.Default = P.Default;
      TMenu.InitItems(M,I,Names,rtl);
      }
   if(I.Bool==3) this.UpdateBool3Value(I);
   I.OValue = I.Value;
   if(I.OnClick && typeof(I.OnClick)=="string") I.OnClick = new Function(I.OnClick);
   if(I.OnChanged && typeof(I.OnChanged)=="string") I.OnChanged = new Function("Value",I.OnChanged);
   
   var id = I.Name; if(id==null||id==="") id = "I"+i;
   id = (id+"").replace(/\W/g,"_").toLowerCase();
   if(Names[id]!=null){
      var add = 1;
      while(Names[id+add]) add++;
      id += add;
      Names[id] = I;
      }
   else Names[id] = I;
   I.id = id;
   I.Owner = M;
   }
}
// -----------------------------------------------------------------------------------------------------------
TMenu.Cache = {};
// -----------------------------------------------------------------------------------------------------------
TMenu.InitMenu = function(MM,nook,content,cache,rtl) {
if(!MM) return;
if(MM.InitOk) { 
   if(MM.SaveType==1) TMenu.InitValues(MM);
   return MM;
   }
if(cache&&typeof(MM)=="string"&&TMenu.Cache[MM]) return TMenu.Cache[MM];
var M = FromJSON(MM,0,content);
if(typeof(M)=="string") M = { Items:SplitToArray(M) };
else if(M.length&&M[0]!=null) M = {Items:M};
else if(typeof(M)=="number") M = {Items:[M]}; 
M.Names = {};
TMenu.InitItems(M,M,M.Names,rtl!=null?rtl:M.Rtl);
if(!M.Items || !M.Items.length) return;
if(window.Grids && Grids.LastStyle && !M.Base) M.Base = Grids.LastStyle + "Menu";
for(var i in TMenu) if(M[i]==null) M[i] = TMenu[i];
if(!nook) M.InitOk = 1;
if(cache&&typeof(MM)=="string") TMenu.Cache[MM] = M;
return M;
}
// -----------------------------------------------------------------------------------------------------------
TMenu.GetHTML = function(Items,lev,A,horz){
var M = this, names = this.Names, ret = 0, rtl = "", ltr = ""; 
if(horz==null) horz = M.Horz;
if(!A){ A = []; ret = 1; }
if(!Items) return "";
if(horz) A[A.length] = CTableCSP0+this.GetClassAll("Horz")+rtl+(this.ItemHeight?" style='height:"+this.ItemHeight+"px;'":"")+CTfoot+"<tr>";
var ZI = null;
for(var i=0;i<Items.length;i++){
   var I = Items[i], s = "", hid = "";
   if(I.Hidden) {
      if(I.Hidden==2) hid = horz ? " style='display:none;'" : " style='visibility:hidden;height:0px;overflow:hidden;'";
      else if(I.Hidden-0) continue;
      else I.Hidden = 0;
      }
   if(I.Columns && I.Items) {
      var B = [];
      this.GetHTML(I.Items,lev,B,0);
      if(I.Columns==1) { for(var j=0;j<B.length;j++) A[A.length] = B[j]; ZI = B[B.length-1]; continue; } 
      if(I.Group){
         this.GroupColumns = 1; 
         while(B.length%I.Columns){
            B[B.length] = "<div></div>";
            I.Items[I.Items.length] = { Expanded:-1 };
            }
         }
      var rc = Math.ceil(B.length / I.Columns), cc = Math.ceil(B.length/rc), S = I.ColumnSizes; 
      if(S) { 
         if(typeof(S)!="object") S = S.split(","); cc = S.length; 
         for(var j=0,rc=0;j<S.length;j++) { S[j]-=0; if(rc<S[j]) rc = S[j]; }
         for(var j=1,SS=[0];j<S.length;j++) SS[j] = SS[j-1]+S[j-1]; 
         }
      if(horz) s += "<td>";
      s += CTableCSP0+rtl+CTfoot;
      if(BIE && I.Group){ s += "<tr style='display:none;'>"; for(var k=0;k<cc*2-1;k++) s += k%2?"<td style='width:2px;'></td>":"<td></td>"; s += "</tr>"; } 
      for(var j=0;j<rc;j++){
         s += "<tr>";
         for(var k=0;k<cc;k++){
            var v = S ? (j<S[k] ? B[SS[k]+j] : null) : B[k*rc+j];
            if(k) s +="<td"+this.GetClassAll("VSeparator")+">"+CNBSP+"</td>";
            s +="<td>"+(v?v:"")+"</td>";
            }
         s += "</tr>"   
         }
      s += CTableEnd;
      if(horz) s += "</td>";
      A[A.length] = s;
      ZI = I;
      continue;   
      }
   var txt = horz ? I.HText : I.VText; if(txt==null) txt = I.Text; if(txt==null) txt = I.Name; 
   if(!txt||txt==" "||txt=="  ") txt = CNBSP;
   else if(BMozilla && I.Disabled) txt = CNBSP+txt;
   else if(Formats.Digits&&(txt+"").search(/\d/)>=0) txt = Formats.ConvertDigits(txt,this.Digits);
   else if(!I.Text && (I.Name+"").charAt(0)=="-" && I.Name.charAt(I.Name.length-1)=="-"){
      I.Caption = 1; txt = I.Name.slice(1,-1);
      }
   if(I.Expanded==-1) s += horz ? "<td></td>" : "<div></div>";
   else if(I.Name=="-" || I.Name=="*-"){ 
      if(horz) s += "<td"+hid+this.GetClassAll("Separator")+"><div>"+CNBSP+"</div></td>"; 
      else s += "<div"+hid+this.GetClassAll("Separator")+">"+CNBSP+"</div>"; 
      I.Caption = 1;
      if(ZI&&ZI.Caption==1) A.length--; 
      } 
   else if(I.Caption) {
      s += (horz?"<td":"<div")+hid+" id=\"TGMenu"+M.GridIndex+M.Sep+(I.id+"").replace(/\"/g,"&quot;")+"\" class='"+this.GetClass("Caption")+" "+this.GetClass("ItemText")+"'>"+txt+(horz?"</td>":"</div>");
      if(ZI&&ZI.Caption==1) A.length--; 
      }
   else {   
      s += (horz?"<td":"<div")+" class='"+this.GetClass("Item")+(I.Left?" "+this.GetClass("ItemLeft"):"")+(I.id==M.Cursor?" "+this.GetClass("Focus"):"")+"' id=\"TGMenu"+M.GridIndex+M.Sep+(I.id+"").replace(/\"/g,"&quot;")+"\"";
      s += BIEA6 ? " style='"+(hid?"visibility:hidden;height:0px;overflow:hidden;":"")+"width:100%;'" : hid; 
      MS.Touch;
      if(BTouch) {
         s += " ontouchstart='"+M.This+".MenuTouchStart(event,this);'";
         s += " ontouchmove='"+M.This+".MenuTouchMove(event,this);'";
         s += " ontouchend='"+M.This+".MenuTouchEnd(event,this);'";
         
         }
      ME.Touch;
      if(BMouse) {
         s += " onmouseover='"+M.This+".Hover(this);'";
         s += " onmouseout='if("+M.This+"&&"+M.This+".HideHover)"+M.This+".HideHover(this);'";
         s += " onclick='"+M.This+".Click(this,0,event);'";
         }
      s += ">";
      var sr = "", pos = 0, dis = I.Disabled?" "+this.GetClass("ItemDisabled"):"";
      if(lev){
         var pcls = "";
         if(M.ShowTree && I.Level && I.Expanded==1 && !horz) pcls = this.GetClass("ExpandedIcon")+" ";
         else if(M.ShowTree && I.Level && I.Expanded==0 && !horz) pcls = this.GetClass("CollapsedIcon")+" ";
         else if(M.ShowCursor) pcls = this.GetClass("CursorIcon"+(rtl?"Rtl":""))+" ";
         
         s += "<div class='"+pcls+dis+"' style='padding-"+(rtl?"right:":"left:")+(M.Indent)+"px;margin-"+(rtl?"right:":"left:")+((lev-1)*(horz?0:M.Indent))+"px;'>";
         sr += "</div>";
         pos++;
         }
      if(I.Menu) {  
         if(I.MenuAlign==null) I.MenuAlign = horz ? "left below" : "next top";
         s += "<div class='"+(I.MenuAlign.search(/left|right/i)>=0?this.GetClass("NextIconDown")+" ":"")+this.GetClass("NextIcon"+(rtl?"Rtl":""))+dis+"'>"; sr += "</div>"; pos++; 
         }
      var tt = "";
      if(I.Bool){
         var cls = I.Bool>=2&&I.Value==="" ? "Empty" : I.Value ? "Checked" : "Unchecked";
         s += "<div class='"+(I.ShowIcon!="0"?this.GetClass(cls+(I.Group?"Radio":"Icon")+(I.Left?"Left":"Right"))+" "+this.GetClass("BoolIcon"+(I.Left?"Left":"Right")):"")+(I.ShowIcon=="0"||I.ShowIcon==2?" "+this.GetClass(cls+"Color"):"")+dis+"'>";
         sr += "</div>";
         I.BoolPos = pos++;
         if(I.Value && !I.NoAll) M.Checked++;
         }
      else if(I.Enum && I.Items && I.Items.length && !I.Menu){
         var val = I.Value, ttxt = val, w = I.Width; if(BIE && w) w += 16; 
         for(var j=0;j<I.Items.length;j++){
            if(val==I.Items[j].Name) {
               if(I.Items[j].Text!=null) ttxt = I.Items[j].Text;
               break;
               }
            }
         if(ttxt==null||ttxt=="") ttxt = CNBSP;   
         else if(BMozilla && I.Disabled) ttxt = CNBSP+ttxt;
         else if(Formats.Digits&&(ttxt+"").search(/\d/)>=0) ttxt = Formats.ConvertDigits(ttxt,this.Digits);
         w = w?" style='width:"+w+"px'":"";
         var hint = ""; if(M.ShowHint) hint = " onmousemove='TGShowHint({Base:"+(this.Base.charAt(0)=='G'?'"'+this.Base.slice(0,2)+"Hint\"":null)+",Wrap:0,StyleSize:\""+M.StyleSize+"\"},this);'";
         tt = "<td"+rtl+w+" class='"+this.GetClass("EnumParent")+" "+this.GetClass("EnumParent"+I.Name)+"'><div class='"+this.GetClass("Enum")+" "+this.GetClass("Control")+dis+"'"+w+(M.EnumTime?" onmouseover='"+this.This+".HoverEnum(this);'":hint)+">"+ttxt+"</div></td>";
         }
      else if(I.Edit){
         var val = I.Value;
         if(typeof(val)=="string") val = Formats.StringToValue(val,I.Type,I.IOFormat,I.Range,1);
         else if(val==null) val = "";
         tt = M.GetEditHTML(I,val,1);
         }
      I.TextPos = pos++;
      var cs = ""; 
      if(I.Class) cs += " "+this.GetClass(I.Class,1);
      if(I.ClassName) cs += " "+this.GetClass(I.ClassName+I.Name,1);
      if(I.ClassValue) {
         cs += " "+this.GetClass(I.ClassValue+(I.Value==null||I.Value===""?"":I.Value===true?1:!I.Value?0:typeof(I.Value)=="string"?I.Value.replace(/\W+/g,""):typeof(I.Value)=="number"?I.Value:""),1);
         if(I.Enum) for(var idx=0;idx<I.Items.length;idx++) if(I.Items[idx].Name==I.Value) { cs += " "+this.GetClass(I.ClassValue+idx,1); break; }
         }
      if(I.Level) cs += " "+this.GetClass("Level");
      var align = I.Align; if(align==null) align = M.ItemAlign; if(align && CAlignTypes[align]) cs += " "+this.GetClass("Align"+CAlignTypes[align]);
      cs += dis;
      var ts = ""; 
      if(I.Height) ts += "height:"+I.Height+"px;";
      if(I.TextWidth) ts += "width:"+I.TextWidth+"px;"; else if(txt=="#") ts += "width:0px;";
      if(ts) ts = " style='"+ts+"'";
      if(txt=="#") txt = "";
      if(tt||I.Icon||I.LeftHtml||I.RightHtml){
         s += CTableCSP0+ltr+(dis?" class='"+dis+"'":"")+CTfoot+"<tr>";
         if(I.Left && tt) s += tt;
         if(I.Icon) s += "<td style='background-image:url("+I.Icon+");width:"+(I.IconWidth?I.IconWidth:20)+"px;' class='"+this.GetClass("ItemIcon")+cs+"'><div style='height:1px;width:"+(I.IconWidth?I.IconWidth:20)+"px;overflow:hidden;'></div></td>";
         if(I.LeftHtml) s += "<td style='width:"+(I.LeftWidth?I.LeftWidth:20)+"px;' class='"+this.GetClass("ItemLeftHtml")+" "+this.GetClass("ItemText")+cs+"'>"+I.LeftHtml+"</td>";
         s += "<td class='"+this.GetClass("ItemText")+cs+"'"+ts+rtl+">"+txt+"</td>";
         if(I.RightHtml) s += "<td style='width:"+(I.RightWidth?I.RightWidth:20)+"px;' class='"+this.GetClass("ItemRightHtml")+" "+this.GetClass("ItemText")+cs+"'>"+I.RightHtml+"</td>";
         if(!I.Left && tt) s += tt;
         s += "</tr>"+CTableEnd;
         }
      else s += "<div class='"+this.GetClass("ItemText")+cs+"'"+ts+rtl+">"+txt+"</div>";   
      s += sr + (horz?"</td>":"</div>");
      M.VisibleCount++;
      }
   if(I.Level){
      s += (horz?"<td":"<div")+this.GetClassAll("Section")+(I.Expanded==0?" style='display:none;'":"")+">" + this.GetHTML(I.Items,lev+1) + (horz?"</td>":"</div>");
      }
   A[A.length] = s;
   ZI = I;
   }
if(ZI&&ZI.Caption==1) A.length--; 
if(horz) A[A.length] = "</tr>"+CTableEnd;
if(ret) return A.join("");   
}
// -----------------------------------------------------------------------------------------------------------
TMenu.GetEditHTML = function(I,val,td){
var ttxt = Formats.ValueToString(val,I.Type,I.DisplayFormat,I.Range), w = I.Width, t = I.Type;
if(!ttxt) ttxt = CNBSP;
else if(BMozilla && I.Disabled) ttxt = CNBSP+ttxt;
else if(Formats.Digits&&(ttxt+"").search(/\d/)>=0) ttxt = Formats.ConvertDigits(ttxt,this.Digits);
if(I.Type=="Lines") ttxt = ttxt.replace(/\r\n|\n|\%n/g,"<br/>");
if(w&&BIE) w += 6; 
var s = ""; 
if(w) s += "width:"+w+"px;";
if(I.Height) s += "height:"+I.Height+"px;";
if(s) s = " style='"+s+"'";

t = t?" "+this.GetClass("Edit"+t):"";
var dis = I.Disabled?" "+this.GetClass("ItemDisabled"):"";
var hint = ""; if(this.ShowHint) hint = " onmousemove='TGShowHint({Base:"+(this.Base.charAt(0)=='G'?'"'+this.Base.slice(0,2)+"Hint\"":null)+",Wrap:0,StyleSize:\""+this.StyleSize+"\"},this);'";
return (td?"<td"+s+" class='"+this.GetClass("EditParent")+" "+this.GetClass("EditParent"+I.Name)+"'>":"")+"<div"+s+" class='"+this.GetClass(BIE?"EditIE":"Edit")+" "+this.GetClass("Control")+t+dis+(I.Type=="Lines"?" "+this.GetClass("EditMulti"):"")+"'"+hint+">"+ttxt+"</div>"+(td?"</td>":"");
}
// -----------------------------------------------------------------------------------------------------------
TMenu.UpdateGroupColumns = function(Items) {
var G = [], chg = 0;

for(var i=0;i<Items.length;i++){
   var I = Items[i];
   if(I.Items && (I.Columns>1 || I.Level)) this.UpdateGroupColumns(I.Items);
   if(I.Columns>1 && I.Group && I.Items){
      for(var j=0;j<I.Items.length&&I.Items[j].Hidden;j++);
      if(j==I.Items.length) continue; 
      var O = this.GetDiv(I.Items[j]);
      if(!O) continue; 
      O = O.parentNode; chg = 1;
      var g = G[I.Group], rat = 1; if(!g) { g = []; g.length = I.Columns; G[I.Group] = g; }
      if(g.length!=I.Columns) {
         if(g.length%I.Columns){
            var len = I.Columns%g.length ? I.Columns*g.length : I.Columns;
            var o = g, r = len/g.length; g = []; G[I.Group] = g;
            for(var j=0;j<o.length;j++) for(var k=0;k<r;k++) g[j*r+k] = Math.round(o[j]/r);
            }
         if(g.length!=I.Columns) rat = Math.round(g.length/I.Columns);
         }
      for(var j=0;j<I.Columns;j++){
         var w = O.offsetWidth;
         O = O.nextSibling; if(!O && j!=I.Columns-1 && !BIE) break; 
         if(rat!=1){
            var ww = Math.round(w/rat);
            for(var k=0;k<rat;k++) if(!g[j*rat+k]||g[j*rat+k]<ww) g[j*rat+k] = ww;
            }
         else if(!g[j] || g[j]<w) g[j] = w;
         if(!O) break;
         O = O.nextSibling;
         }
      }
   }
if(!chg) return;   

for(var i=0;i<Items.length;i++){
   var I = Items[i];
   if(I.Columns>1 && I.Group && I.Items){
      for(var j=0;j<I.Items.length&&I.Items[j].Hidden;j++);
      if(j==I.Items.length) continue; 
      var O = this.GetDiv(I.Items[j]);
      if(!O) continue; 
      O = O.parentNode;
      if(BIE) O = O.parentNode.previousSibling.firstChild; 
      var g = G[I.Group], rat = Math.round(g.length/I.Columns), w;
      for(var j=0;j<I.Columns;j++){
         
         if(rat!=1) for(var k=0,w=0;k<rat;k++) w += g[j*rat+k];
         else w = g[j];
         if(BIE||BIEA&&!BIEA8) O.style.width = w+"px";
         else O.style.minWidth = w+"px";
         O = O.nextSibling; if(!O) break;
         O = O.nextSibling;
         }
      if(BIE){
         O = this.GetDiv(I.Items[0]);
         if(O){
            O = O.parentNode.parentNode.parentNode.parentNode;
            O.style.tableLayout = "fixed";
            O.style.width = "1px";
            }
         }   
      }
   }
if(BIEA) this.Tag.firstChild.style.overflow = "visible"; 
}

// -----------------------------------------------------------------------------------------------------------
TMenu.GetDiv = function(I){
if(!I || !I.id) return null;

return document.getElementById("TGMenu"+this.GridIndex+this.Sep+I.id);
}
// -----------------------------------------------------------------------------------------------------------
TMenu.GetItem = function(O){
if(typeof(O)=="string") return O;
if(!O || !O.id) return null;
var id = O.id.slice(O.id.lastIndexOf(this.Sep)+1);
return this.Names[id];
}
// -----------------------------------------------------------------------------------------------------------
TMenu.SetEnumItem = function(I,V){
if(V==null) {
   if(!I.Items || !I.Range) return;
   for(var i=0,A=[],T=[],all=1;i<I.Items.length;i++){
      var II = I.Items[i]; 
      if(II.Bool && II.Value) { A[A.length] = II.Name; T[T.length] = II.Text!=null?II.Text:II.Name; }
      else if(II.Bool) all = 0;
      }
   if(all&&I.ValueAll!=null) { name = I.ValueAll; txt = I.ValueAll; }
   else { name = A.join(","); txt = A.join(","); }
   }
else if(typeof(V)!="object"){
   if(!I.Items) return;
   for(var i=0;i<I.Items.length;i++){
      var II = I.Items[i]; if(II.Name==V){ name = V; txt = II.Text!=null ? II.Text : II.Name; break; }
      }
   if(i==I.Items.length) return;
   }
else { 
   var name = V.Name, txt = V.Text!=null ? V.Text : V.Name;
   }
if(I.OnChanged) {
   var A = I.OnChanged(name,txt);
   if(A && typeof(A)=="object"){ if(A[0]!=null) name = A[0]; if(A[1]!=null) txt = A[1]; }
   else if(A!=null) name = A;
   }
if(this.OnItemChanged) {
   var A = this.OnItemChanged(I,name,txt);
   if(A && typeof(A)=="object"){ if(A[0]!=null) name = A[0]; if(A[1]!=null) txt = A[1]; }
   else if(A!=null) name = A;
   }
var oval = I.Value;
I.Value = name;
if(txt==null||txt=="") txt = "&nbsp;";
var O = this.GetDiv(I); if(!O) return;
for(var i=0;i<I.TextPos;i++) O = O.firstChild;
if(!I.Menu) {
   MS.Digits; if(Formats.Digits&&(txt+"").search(/\d/)>=0) txt = Formats.ConvertDigits(txt,this.Digits); ME.Digits;
   O.firstChild.rows[0].cells[I.Left?0:(I.LeftHtml?1:0)+(I.Icon?1:0)+1].firstChild.innerHTML = txt;
   }
if(I.ClassValue) {
   for(var oidx=0;oidx<I.Items.length;oidx++) if(I.Items[oidx].Name==oval) break; 
   for(var nidx=0;nidx<I.Items.length;nidx++) if(I.Items[nidx].Name==I.Value) break; 
   oidx = I.ClassValue + oidx; nidx = I.ClassValue + nidx;
   var oval = I.ClassValue+(oval==null||oval===""?"":oval===true?1:!oval?0:typeof(oval)=="string"?I.Value.replace(/\W+/g,""):typeof(oval)=="number"?oval:"");
   var nval = I.ClassValue+(I.Value==null||I.Value===""?"":I.Value===true?1:!I.Value?0:typeof(I.Value)=="string"?I.Value.replace(/\W+/g,""):typeof(I.Value)=="number"?I.Value:"");
   var ridx = new RegExp(oidx+"\\b","g"), rval = new RegExp(oval+"\\b","g");
   for(var c=I.Menu ? O.firstChild : O.firstChild.rows[0].firstChild;c;c=c.nextSibling) if(c.className&&c.className.indexOf(oidx)>=0) c.className = c.className.replace(ridx,nidx).replace(rval,nval);
   }
}
// -----------------------------------------------------------------------------------------------------------
TMenu.ChangeEnumItem = function(I,cnt){
if(!I.Items) return null;
for(var i=0;i<I.Items.length;i++) if(I.Value==I.Items[i].Name) {
   var V = I.Items[i+cnt];
   if(V) this.SetEnumItem(I,V);
   return;
   }
}
// -----------------------------------------------------------------------------------------------------------
TMenu.ExpandItem = function(I,exp){ 
var O = this.GetDiv(I); if(!O) return;
O.nextSibling.style.display = exp ? "" : "none";
I.Expanded = exp;
if(this.ShowTree) O.firstChild.className = this.GetClass(exp?"ExpandedIcon":"CollapsedIcon");
var C = this.Names[this.Cursor];
if(C){
   var P = this.GetDiv(C), Z = P;
   while(P && P!=O.nextSibling) P = P.parentNode;
   if(P) {
      C.Expanded = 0;
      this.Cursor = I.id;
      O.className = this.GetClass("Item") + (I.Left?" "+this.GetClass("ItemLeft"):"") + " "+this.GetClass("Focus") + (O.className.indexOf("Hover")>=0?" "+this.GetClass("Hover"):"");
      Z.className = this.GetClass("Item") + (I.Left?" "+this.GetClass("ItemLeft"):"");
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TMenu.Expand = function(I,exp){
var O = this.GetDiv(I); if(!O) return;
if(exp==null) exp = !I.Expanded;
if(exp && this.OnExpand && this.OnExpand(I)==false) return;
this.ExpandItem(I,exp);
if(this.CollapseOther && exp){
   for(var O2 = O.parentNode.firstChild;O2;O2=O2.nextSibling){
      if(O2==O) continue;
      var I2 = this.GetItem(O2);
      if(I2 && I2.Expanded) this.ExpandItem(I2,0); 
      }
   }
this.UpdateHeight();
}
// -----------------------------------------------------------------------------------------------------------
TMenu.SetValue = function(I,val){
if(I.Bool){
   if(!I.Value!=!val) this.Check(I);
   }
else if(I.Enum) this.SetEnumItem(I,val);
else if(I.Edit){
   var O = this.GetDiv(I); if(!O) return;
   var P = O; for(var i=0;i<I.TextPos;i++) P = P.firstChild;
   P = P.firstChild.rows[0].cells[I.Left?0:(I.LeftHtml?1:0)+(I.Icon?1:0)+1];
   I.Value = val;
   P.innerHTML = this.GetEditHTML(I,val,0);
   
   }
}
// -----------------------------------------------------------------------------------------------------------
TMenu.SetText = function(I,text){
var O = this.GetDiv(I); if(!O) return;
MS.Digits; if(Formats.Digits && (text+"").search(/\d/)>=0) text = Formats.ConvertDigits(text,this.Digits); ME.Digits;
I.Text = text;
var cls = this.GetClass("ItemText");
if(O.className.indexOf(cls)>=0) { O.innerHTML = text; return; }
var T = O.getElementsByTagName("td");
if(!T.length) T = O.getElementsByTagName("div");
for(var i=0;i<T.length;i++){
   if(T[i].className.indexOf(cls)>=0) { T[i].innerHTML = text; return; }
   }
}
// -----------------------------------------------------------------------------------------------------------
TMenu.Check = function(I,group,spec){
var O = this.GetDiv(I); if(!O) return;
var v = spec!=null ? spec : I.Bool!=2 ? !I.Value : I.Value ? "" : I.Value==="" ? 0 : 1;
if(I.Group) {
   if(!v && !I.Uncheck && !group) return; 
   if(!group) this.CheckAll(this.Items,0,I.Group);
   if(!group||v){
      if(I.OnChanged) { var tmp = I.OnChanged(v); I.Value = tmp==null ? v : tmp ? 1 : 0; } 
      if(this.OnItemChanged) { var tmp = this.OnItemChanged(I,v); I.Value = tmp==null ? v : tmp ? 1 : 0; } 
      }
   I.Value = v;
   }
else if(I.CheckAll&&!group) this.CheckAll(this.Items,v,I.GroupAll,"GroupAll");
else {   
   if(I.OnChanged){ var tmp = I.OnChanged(v); if(tmp!=null && (tmp?0:1)==v) return; }
   if(this.OnItemChanged){ var tmp = this.OnItemChanged(I,v); if(tmp!=null && (tmp?0:1)==v) return; }
   I.Value = v;
   if(!I.NoAll) {
      if(v) { this.Checked++; if(this.Checked==1) this.UpdateClear(); }
      else { this.Checked--; if(!this.Checked) this.UpdateClear(); }
      }
   }
for(var i=0;i<I.BoolPos;i++) O = O.firstChild; 
var cls = I.Bool>=2&&I.Value==="" ? "Empty" : I.Value ? "Checked" : "Unchecked";
O.firstChild.className = (I.ShowIcon!="0"?this.GetClass(cls+(I.Group?"Radio":"Icon")+(I.Left?"Left":"Right"))+" "+this.GetClass("BoolIcon"+(I.Left?"Left":"Right")):"") + (I.ShowIcon=="0"||I.ShowIcon==2?" "+this.GetClass(cls+"Color"):"");
if(I.ClassValue) {
   for(;i<I.TextPos;i++) O = O.firstChild;
   O.firstChild.className = O.firstChild.className.replace(new RegExp("\\s+\\w*"+I.ClassValue+"[01]","g"),"") + " "+this.GetClass(I.ClassValue+(I.Value?1:0),1);
   }
if(I.Bool==3 && I.Items && spec==null){
   for(var II=I.Items,i=0;i<II.length;i++){
      if(I.Value?!II[i].Value:II[i].Value||II[i].Value==="") this.Check(II[i],group,I.Value);
      }
   }
if(I.Bool && I.Parent.Bool==3 && spec==null){
   var P = I.Parent, p = P.Value; this.UpdateBool3Value(P);
   if(P.Value!==p) { var pp = P.Value; P.Value = p; this.Check(P,group,pp); }
   }

}
// -----------------------------------------------------------------------------------------------------------
TMenu.CheckAll = function(Items,chk,group,name){
if(!name) name = "Group";
for(var i=0;i<Items.length;i++){
   var I = Items[i];
   if(I.Bool && (I.Value&&!chk || !I.Value&&chk) && (!group&&!I[name] || I[name]==group) && !I.NoAll) this.Check(I,group?group:-1);
   if(I.Items && (I.Level || I.Columns)) this.CheckAll(I.Items,chk,group,name);
   }
} 
// -----------------------------------------------------------------------------------------------------------
TMenu.UpdateBool3Value = function(I){
if(I.Bool!=3||!I.Items) return;
for(var i=0,on=0,off=0,II=I.Items;i<II.length;i++) if(II[i].Bool){
   if(II[i].Value==="") { I.Value = ""; return; }
   if(II[i].Value){ on = 1; if(off) { I.Value = ""; return; } }
   else { off = 1; if(on) { I.Value = ""; return; } }
   }
I.Value = on ? 1 : 0;
}
// -----------------------------------------------------------------------------------------------------------
TMenu.SplitToColumns = function(II,cols){
var Q = [], NI = [];
for(var i=0;i<II.length;i++){
   if(II[i].Caption || II[i].Name=="-" || II[i].Name=="*-" || !II[i].Text && (II[i].Name+"").charAt(0)=="-" && II[i].Name.charAt(II[i].Name.length-1)=="-") {
      if(Q.length) { NI.push({Columns:cols,Group:1,Items:Q}); Q = []; }
      NI.push(II[i]);
      }
   else Q[Q.length] = II[i];
   }
if(Q.length) { NI.push({Columns:cols,Group:1,Items:Q}); Q = []; }
return NI;
}
// -----------------------------------------------------------------------------------------------------------
TMenu.Submenu = function(I){
if(!I.Items) return; 
var O = this.GetDiv(I); if(!O) return;
var N = { }; 
for(var i in I) N[i] = I[i];
N.id = null;
var X = ["Base","Class","IgnoreEnter","IgnoreSpace","IgnoreTab","Over","Shift","Indent","PageLength","Rtl"];
if(I.Menu) X = X.concat("ClassMenu","ClassEnum","ShowCursor","ShowTree","CloseOut","CloseTimeout","OnSubmenu","OnExpand","OnMove","OnMoveOut","OnTab","OnButton","Grid","Row","Col","Type");
for(var i=0;i<X.length;i++) if(N[X[i]]==null) N[X[i]] = this[X[i]];
if(this.EditMode) this.EditControl.Save();
if(this.Next) { 
   if(this.Next.EditMode) return;
   var pitem = this.Next.PrevItem;
   this.Next.Close(1);
   if(pitem==I && (!I.Menu || !(this.SubmenuTime>0))) return; 
   }
if(I.Enum){ 
   if(I.Range){
      var A = null, ttxt = null, V = I.Value; 
      if(I.ValueAll==null||V!=I.ValueAll){
         A = {}; ttxt = [];
         V = V&&V.split ? V.split(",") : [];
         for(var i=0;i<V.length;i++) A[V[i]] = 1;
         }
      for(var i=0;i<I.Items.length;i++) {
         var II = I.Items[i];
         if(II.Bool==null) II.Bool = 1;
         if(II.Bool&&(!A||A[II.Name])) { II.Value = 1; if(ttxt) ttxt[ttxt.length] = II.Text!=null ? II.Text : II.Name; }
         else II.Value = 0;
         }
      ttxt = ttxt ? ttxt.join(",") : I.ValueAll;
      if(I.Range&2) N.Buttons = ["Ok","Clear","Cancel"];
      }
   else {
      var ttxt = null;
      for(var i=0;i<I.Items.length;i++) if(I.Value==I.Items[i].Name) { N.Cursor = I.Items[i].id; ttxt = I.Items[i].Text!=null ? I.Items[i].Text : I.Items[i].Name; break; }
      if(ttxt==null) ttxt = I.Value;
      }
   }
this.Next = N;
N.Prev = this;
N.PrevItem = I;
N.ZIndex = this.ZIndex;
MS.Digits; N.Digits = this.Digits; ME.Digits;

N.StyleSize = this.StyleSize;
N.Scale = this.Scale;
N.MainClass = this.MainClass;
if(N.CustomClass==null) N.CustomClass = this.CustomClass;
if(N.CanFocus==null) N.CanFocus = this.CanFocus;
if(I.Menu){ 
   if(this.ClassMenu!=null) N.Class = this.ClassMenu;   
   N.Popup = 1;
   var P = { Tag:O, Align:I.MenuAlign,Scale:this.Scale };
   if(this.OnSubmenu) { 
      var NN = this.OnSubmenu(I,N,P);
      if(NN==false) return;
      if(NN && NN.Items) {
         for(var i in N) if(i.indexOf("On")==0 && !NN[i]) NN[i] = N[i]; 
         N = NN;
         }
      }
   if(this.Popup){
      if(!N.OnSave) N.OnSave = this.OnSave;
      if(!N.OnCSave) N.OnCSave = this.OnCSave;
      }
   N.SubmenuIndex = this.SubmenuIndex ? this.SubmenuIndex+1 : 1;
   MS.Animate; 
   if(this.Horz){ 
      N.AnimateShow = this.AnimateShowEnum?this.AnimateShowEnum:this.AnimateShow; N.AnimateShowUp = this.AnimateShowEnumUp?this.AnimateShowEnumUp:this.AnimateShowUp;
      N.AnimateHide = this.AnimateHideEnum?this.AnimateHideEnum:this.AnimateHide; N.AnimateHideUp = this.AnimateHideEnumUp?this.AnimateHideEnumUp:this.AnimateHideUp;
      }
   else {         
      N.AnimateShow = this.AnimateShowMenu!=null?this.AnimateShowMenu:this.AnimateShow; N.AnimateShowUp = this.AnimateShowMenuUp!=null?this.AnimateShowMenuUp:this.AnimateShowUp;
      N.AnimateShowRight = this.AnimateShowMenuRight!=null?this.AnimateShowMenuRight:this.AnimateShowUpRight; N.AnimateShowRightUp = this.AnimateShowMenuRightUp!=null?this.AnimateShowMenuRightUp:this.AnimateShowRightUp;
      N.AnimateHide = this.AnimateHideMenu!=null?this.AnimateHideMenu:this.AnimateHide; N.AnimateHideMenuUp = this.AnimateHideUp!=null?this.AnimateHideMenuUp:this.AnimateHideUp;
      N.AnimateHideRight = this.AnimateHideMenuRight!=null?this.AnimateHideMenuRight:this.AnimateHideUpRight; N.AnimateHideRightUp = this.AnimateHideMenuRightUp!=null?this.AnimateHideMenuRightUp:this.AnimateHideRightUp;
      }
   N.AnimateShowMenu = this.AnimateShowMenu; N.AnimateShowMenuUp = this.AnimateShowMenuUp; N.AnimateShowMenuRight = this.AnimateShowMenuRight; N.AnimateShowMenuRightUp = this.AnimateShowMenuRightUp;
   N.AnimateHideMenu = this.AnimateHideMenu; N.AnimateHideMenuUp = this.AnimateHideMenuUp; N.AnimateHideMenuRight = this.AnimateHideMenuRight; N.AnimateHideMenuRightUp = this.AnimateHideMenuRightUp;
   N.AnimateShowEnum = this.AnimateShowEnum; N.AnimateShowEnumUp = this.AnimateShowEnumUp; N.AnimateHideEnum = this.AnimateHideEnum; N.AnimateHideEnumUp = this.AnimateHideEnumUp;
   N.AnimateShowTip = this.AnimateShowTip; N.AnimateShowTipRight = this.AnimateShowTipRight; N.AnimateHideTip = this.AnimateHideTip; N.AnimateHideTipRight = this.AnimateHideTipRight;
   ME.Animate;
   N = ShowMenu(N,P);
   if(BIPAD) this.NoClickTo = (new Date()).getTime()+1000; 
   if(!N) this.Next = null;
   else if((this.Cursor||this.FocusSubmenu)&&!N.Cursor) N.SetCursor(N.Items[0]);
   if(this.FocusSubmenu) this.SetCursor(I);
   }
else { 
   if(this.ClassEnum!=null) { N.Class = this.ClassEnum; if(N.ClassMenu==null) N.ClassMenu = N.Class; }
   N.Class = this.Base+"Enum";
   N.Cursor = I.Value;
   if((!ttxt || ttxt==0) && ttxt!="0") ttxt = CNBSP;
   MS.Digits; if(Formats.Digits&&(ttxt+"").search(/\d/)>=0) ttxt = Formats.ConvertDigits(ttxt,this.Digits); ME.Digits;
   if(!this.Scale||this.Scale==1) N.Header = "<div class='"+this.GetClass("EnumHeaderLeft")+" "+this.GetClass("Control")+"'>"+ttxt+"</div>";
   
   N.MinWidth = 0;
   var P = O; for(var i=0;i<I.TextPos;i++) P = P.firstChild;
   P = P.firstChild.rows[0].cells[I.Left?0:(I.LeftHtml?1:0)+(I.Icon?1:0)+1].firstChild;
   N.Popup = this.EnumTime ? 0 : 1;
   N.CloseClickHeader = 1;
   MS.Animate; 
   N.AnimateShow = this.AnimateShowEnum?this.AnimateShowEnum:this.AnimateShow; N.AnimateShowUp = this.AnimateShowEnumUp?this.AnimateShowEnumUp:this.AnimateShowUp; 
   N.AnimateHide = this.AnimateHideEnum?this.AnimateHideEnum:this.AnimateHide; N.AnimateHideUp = this.AnimateHideEnumUp?this.AnimateHideEnumUp:this.AnimateHideUp;
   N.AnimateShowMenu = this.AnimateShowMenu!=null?this.AnimateShowMenu:this.AnimateShow; N.AnimateShowMenuUp = this.AnimateShowMenuUp!=null?this.AnimateShowMenuUp:this.AnimateShowUp;
   N.AnimateShowMenuRight = this.AnimateShowMenuRight!=null?this.AnimateShowMenuRight:this.AnimateShowUpRight; N.AnimateShowMenuRightUp = this.AnimateShowMenuRightUp!=null?this.AnimateShowMenuRightUp:this.AnimateShowRightUp;
   N.AnimateHideMenu = this.AnimateHideMenu!=null?this.AnimateHideMenu:this.AnimateHide; N.AnimateHideMenuUp = this.AnimateHideMenuUp!=null?this.AnimateHideMenuUp:this.AnimateHideUp;
   N.AnimateHideMenuRight = this.AnimateHideMenuRight!=null?this.AnimateHideMenuRight:this.AnimateHideUpRight; N.AnimateHideMenuRightUp = this.AnimateHideMenuRightUp!=null?this.AnimateHideMenuRightUp:this.AnimateHideRightUp;
   N.AnimateShowTip = this.AnimateShowTip; N.AnimateShowTipRight = this.AnimateShowTipRight; N.AnimateHideTip = this.AnimateHideTip; N.AnimateHideTipRight = this.AnimateHideTipRight;
   ME.Animate;
   ShowMenu(N,{Tag:P,Align:"left below",AlignHeader:"top justify"});
   if(this.EnumTime) {
      if(BMouse) N.HeaderTag.onclick = CancelEvent;
      MS.Touch; if(BTablet) N.HeaderTag.ontouchend = CancelEvent; else if(BTouch) N.HeaderTag.setAttribute("ontouchend","TGCancelEvent(event);"); ME.Touch;
      N.Popup = 1;
      N.CloseOut = 1; N.CloseTimeout = this.EnumTime;
      }
   
   N.Prev = null;
   this.SetCursor(I);
   }
var M = this;
if(I.Enum) {
   N.OnSave = function(V){ M.SetEnumItem(I,V); }
   N.OnClose = function(){ 
      if(!I.Menu) { M.Next = null; Dialogs.Focused = M; M.NoClickTo = new Date()-0+100; } 
      if(I.Range&&!(I.Range&2)) M.SetEnumItem(I); 
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TMenu.StartEdit = function(I){
MS.Edit;
var O = this.GetDiv(I); if(!O) return;
if(this.EditMode) return;
var N = { }, M = this; 
for(var i in I) N[i] = I[i];
N.id = null;
var P = O; for(var i=0;i<I.TextPos;i++) P = P.firstChild;
P = P.firstChild.rows[0].cells[I.Left?0:(I.LeftHtml?1:0)+(I.Icon?1:0)+1];

if(!I.Width) P.style.width = P.firstChild.offsetWidth+"px";
var cls = P.firstChild.className;
P.firstChild.className += " "+this.GetClass("EditEdit");
N.OnSave = function(dummy,ioval){
   if(M.Input && ioval.indexOf(M.Separator)>=0 && M.SeparatorReplace!=null){
      ioval = ioval.replace(new RegExp("\\"+M.Separator,"g"), M.SeparatorReplace);
      }
   if(I.OnChanged) { var tmp = I.OnChanged(ioval); if(tmp!=null) ioval = tmp; }
   if(I.Owner.OnItemChanged) { var tmp = I.Owner.OnItemChanged(I,ioval); if(tmp!=null) ioval = tmp; }
   var val = N.ToValue(ioval); 
   I.Value = val;
   P.innerHTML = M.GetEditHTML(I,val,0);
   N.Tag = null; cls = null;
   }
if(BIEA && !BIEA9) N.OnArrow = function (dir){ 
   var P = dir ? M.GetNext(I) : M.GetPrev(I);
   if(P) M.SetCursor(P);
   }  
N.Base = this.Base+"Edit";
N.ClassAdd = this.GetClass("Control");
N.OnClose = function(){ M.EditMode = 0; Dialogs.Focused = M; if(cls) P.firstChild.className = cls; }
this.EditMode = 1;   
this.EditControl = N;
this.NoClickTo = new Date()-0+1000;

N.Value = I.Value==null?"":I.Value;
MS.Digits; N.Digits = this.Digits; ME.Digits;
N.Format = I.EditFormat;
N.StyleSize = this.StyleSize;
N.Rtl = this.Rtl;
N.CloseClickOut = 0;
ShowEdit(N,P.firstChild);
ME.Edit;
}
// -----------------------------------------------------------------------------------------------------------
TMenu.Click = function(O,noaccept,ev){
var I = this.GetItem(O); if(!I || I.Disabled || this.Deleted) return;
this.SetCursor(I);
if(I.OnClick){
   var ret = I.OnClick(this,I);
   if(ret==false) return;
   if(ret==true){ this.Close(); return; }
   }
if(I.Menu){ 
   if(this.Next && I.Bool) this.Check(I); 
   else {
      if(this.Next&&this.Next.EditMode) this.Next.EditControl.Save();
      this.Submenu(I);
      }
   return; 
   } 
if(this.Next) this.Next.Close(1);
if(I.Enum){ if(!this.EnumTime) this.Submenu(I); return; }
if(I.Edit==1){ this.StartEdit(I); return; }
if(I.Level && I.Expanded!=null && !this.ExpandTime){ 
   if(I.Bool){
      if(ev&&ev.target.className.search(/(Expanded|Collapsed)Icon/)>=0) this.Expand(I);
      else this.Check(I);
      }
   
   else this.Expand(I);
   }
else if(I.Bool) this.Check(I);
else if(I.CheckAll) { this.CheckAll(this.Items,!I.Value,I.GroupAll,"GroupAll"); this.Save(); }
else if(!I.Caption && !noaccept && !I.Level) this.Save(I);
}
// -----------------------------------------------------------------------------------------------------------
TMenu.Save = function(I){
if(this.EditMode) this.EditControl.Save();
for(var N=this.Next;N&&N.Popup;N=N.Next) if(N.EditMode) N.EditControl.Save();
var V = this.OnCSave||this.OnSave||this.Input ? this.GetValues(this.Items) : null;
if(this.Input) this.Input.value = I ? (I.Value!=null ? I.Value : I.Name) : V.join(this.Separator);
if(this.OnCSave && this.OnCSave(I,V)==false) return false;
if(this.OnSave && this.OnSave(I,V)==false) return false;
if(this.Popup) this.Close();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TMenu.DoHover = function(O,hover){
var I = this.GetItem(O); if(!I) return; 
if(!hover && I==this.Hovered) { this.HideTip(); this.Hovered = null; }
if(I.Disabled) return;
O.className = this.GetClass("Item") + (I.Left?" "+this.GetClass("ItemLeft"):"") + (this.Cursor==I.id?" "+this.GetClass("Focus"):"") + (hover?" "+this.GetClass("Hover"):"");

if(this.ShowCursor && (!I.Level || I.Expanded==null)){
   O.firstChild.className = this.GetClass((hover ? "Hover":"Cursor") + "Icon" + (this.Rtl?"Rtl":""));
   }
}
// -----------------------------------------------------------------------------------------------------------
TMenu.HideHover = function(O){
this.ToHide = O; 
var M = this;
setTimeout(function(){ if(M.ToHide==O) { M.ToHide = null; if(!M.Deleted) M.DoHover(O); } },BIEA?50:10); 
}
// -----------------------------------------------------------------------------------------------------------
TMenu.Hover = function(O){
var I = this.GetItem(O), M = this;
if(!I) return; 
if(O==this.ToHide){ this.ToHide = null; return; }
if(this.ToHide) { this.DoHover(this.ToHide,0); this.ToHide = null; }
this.DoHover(O,1);
if(I.Tip){
   this.TipTime = 0; this.Hovered = I;
   if(Dialogs.Interval.Set==null) Dialogs.Interval.Set = setInterval(Dialogs.Interval,200);
   }
if(this.ShowHint && this.Tag.firstChild.offsetWidth < O.firstChild.offsetWidth) { 
   ShowHint({Base:this.Base.charAt(0)=='G'?this.Base.slice(0,2)+"Hint":null,Wrap:0,StyleSize:this.StyleSize},O,1);
   }  
if(this.SubmenuTime>0){
   var N = M.Next;
   if(N && N.PrevItem!=I){ 
      setTimeout(function(){
         if(N!=M.Next || O.className.indexOf("Hover")<0) return; 
         if(M.Next&&!M.Next.Deleted&&!M.Next.EditMode) M.Next.Close(1);
         },M.SubmenuTime);
      }
   if(I.Menu && !this.EditMode) {
      setTimeout(function(){
         if(O.className.indexOf("Hover")<0) return; 
         if(!M.Deleted) M.Submenu(I);
         },M.SubmenuTime);
      }
   }

if(M.ExpandTime>0 && I.Level && I.Expanded==0){
   setTimeout(function(){
      if(O.className.indexOf("Hover")<0) return; 
      if(!M.Deleted) M.Expand(I,1);
      },M.ExpandTime);
   }
}
// -----------------------------------------------------------------------------------------------------------
TMenu.HoverEnum = function(O){
while(O && !O.id) O = O.parentNode;
if(!O) return;
var I = this.GetItem(O), M = this;
if(!I) return;
setTimeout(function(){
   if(O.className.indexOf("Hover")<0) return; 
   if(!M.Deleted) M.Submenu(I);
   M.NoClickTo = (new Date()).getTime()+100; 
   
   },M.EnumTime);
}

// -----------------------------------------------------------------------------------------------------------
TMenu.Close = function(noparent){
var M = this;
if(this.EditMode) this.EditControl.Save();
if(!noparent) while(M.Prev && (M.Prev.Popup&&!M.Prev.Modal)) M = M.Prev;
if(M.Next) M.Next.Close(1);
if(M.Prev) M.Prev.Next = null;
if(Dialogs.Focused == M) Dialogs.Focused = M.Prev;
M.Prev = null;
M.Expanded = 0;
if(this.Tip) this.HideTip();
M.Delete();
}
// -----------------------------------------------------------------------------------------------------------
TMenu.SetCursor = function(I){
var C = this.Names[this.Cursor];
if(C==I || !this.CanFocus) return;
if(this.EditMode) this.EditControl.Save();
if(C){
   var O = this.GetDiv(C);
   if(O) O.className = this.GetClass("Item")  + (C.Left?" "+this.GetClass("ItemLeft"):"") + (O.className.indexOf("Hover")>=0?" "+this.GetClass("Hover"):"");
   }
if(I){   
   this.Cursor = I.id;
   if(this.Cursor){
      var O = this.GetDiv(I);
      if(O) O.className = this.GetClass("Item") + (I.Left?" "+this.GetClass("ItemLeft"):"") + " " + this.GetClass("Focus") + (O.className.indexOf("Hover")>=0?" "+this.GetClass("Hover"):"");
      if(this.OnMove) this.OnMove(I);   
      }
   }
else this.Cursor = null;   
this.UpdateScroll();
}
// -----------------------------------------------------------------------------------------------------------
TMenu.UpdateScroll = function(){
var F = this.GetBody();
if(this.Cursor==null || F.style.overflow != "auto") return; 
try { this.FocusTag ? this.FocusTag.focus() : this.Tag.focus(); } catch(e) { }
var O = this.GetDiv(this.Names[this.Cursor]);
if(O) {
   var top = O.offsetTop;
   if(O.parentNode.tagName.toLowerCase()=="td") top += O.parentNode.parentNode.parentNode.parentNode.offsetTop+O.parentNode.parentNode.offsetTop;
   if(this.CenterItem) F.scrollTop = top - F.clientHeight/2 + O.offsetHeight/2;
   else if(F.scrollTop + F.clientHeight < top + O.offsetHeight + 10) F.scrollTop = top - F.clientHeight + O.offsetHeight + 10;
   else if(F.scrollTop > top - 7) F.scrollTop = top - 7;
   }
}
// -----------------------------------------------------------------------------------------------------------
TMenu.ButtonClick = function(but){
if(this.OnButton && this.OnButton(but=="Clear"&&!this.Checked?"All":but)==false) return;
if(but=="Ok") this.Save();
else if(but=="Clear"){
   this.CheckAll(this.Items,this.Checked ? 0 : 1);
   } 
else if(but=="Cancel"){
   if(this.Popup) this.Close();
   } 
try { var T = this.FocusTag?this.FocusTag:this.Tag; if(T) T.focus(); } catch(e) { }
}
// -----------------------------------------------------------------------------------------------------------
TMenu.UpdateClear = function(){
if(!this.Buttons) return;
for(var i=0;i<this.Buttons.length;i++) {
   if(this.Buttons[i]=="clear") {
      var B = this.Tag.firstChild.lastChild.childNodes[i];
      B.value = this.Checked?this.Texts.Clear:this.Texts.All;
      B.innerHTML = B.value; 
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TMenu.GetPrev = function(I){
var O = this.GetDiv(I);
var P = O ? O.previousSibling : this.GetBody().firstChild.lastChild;
if(!P && O) P = O.parentNode.previousSibling;
if(O && O.parentNode.tagName.toLowerCase()=="td"){ 
   P = O.parentNode.parentNode.previousSibling;
   while(1){
      if(!P) { P = O.parentNode.parentNode.parentNode.parentNode.previousSibling; O = P; break; } 
      var col = O.parentNode.cellIndex, V = P;
      P = P.cells[col].firstChild;
      while(P && !P.id) P = P.previousSibling;
      if(P){ this.LastCol = col; break; }
      P = V.previousSibling;
      }      
   }
while(P && !P.id){   
   if(P.tagName.toLowerCase()=="table"){ 
      var col = this.LastCol;
      P = P.rows[P.rows.length-1];
      if(!P.cells[col]) col = 0;
      while(P && !P.cells[col].firstChild.id) P = P.previousSibling;
      if(P) P = P.cells[col].firstChild;
      else if(!O.previousSibling) break;
      else { P = O.previousSibling.previousSibling; O = P; }
      }
   else if(P.className.indexOf("Section")>=0){ 
      if(P.style.display!="none") P = P.lastChild;
      else P = P.previousSibling;
      }
   else P = P.previousSibling;
   }
if(P && P.id) { I = this.GetItem(P); if(I) return I.Disabled||I.Caption ? this.GetPrev(I) : I; }   
return null;
}
// -----------------------------------------------------------------------------------------------------------
TMenu.GetNext = function(I){
var O = this.GetDiv(I);
var P = O ? O.nextSibling : this.GetBody().firstChild.firstChild;
if(!P && O) P = O.parentNode.nextSibling; 
if(O && O.parentNode.tagName.toLowerCase()=="td"){ 
   P = O.parentNode.parentNode.nextSibling;
   while(1){
      if(!P) { P = O.parentNode.parentNode.parentNode.parentNode.nextSibling; O = P; break; } 
      var col = O.parentNode.cellIndex, V = P;
      P = P.cells[col];
      if(!P && col){ P = V.cells[0]; col = 0; } 
      if(P) P = P.firstChild;
      while(P && !P.id) P = P.nextSibling;
      if(P){ this.LastCol = col; break; }
      P = V.nextSibling;
      }      
   }
while(P && !P.id) {   
   if(P.tagName.toLowerCase()=="table"){ 
      var col = this.LastCol;
      if(!P.rows[0].cells[col]) col = 0;
      P = P.rows[0];
      while(P && !P.cells[col].firstChild.id) P = P.nextSibling;
      if(P) P = P.cells[col].firstChild;
      else if(!O||!O.nextSibling) break;
      else { P = O.nextSibling.nextSibling; O = P; }
      }
   else if(P.className.indexOf("Section")>=0){ 
      if(P.style.display!="none") P = P.firstChild;
      else P = P.nextSibling;
      }
   else P = P.nextSibling;
   }

if(P && P.id) { I = this.GetItem(P); if(I) return I.Disabled||I.Caption ? this.GetNext(I) : I; }
return null;
}
// -----------------------------------------------------------------------------------------------------------
TMenu.KeyDown = function(key,ev){
var M = this, I = this.Names[this.Cursor], O = this.GetDiv(I);
if(this.OnKeyDown && this.OnKeyDown(key)) { CancelEvent(ev); return; }
if(key==38 || key==40) { 
   var C = key==38 ? this.GetPrev(I) : this.GetNext(I);
   if(C) this.SetCursor(C);
   else if(this.OnMoveOut && this.OnMoveOut(key==38?0:1)) this.SetCursor(null);
   }
else if(key==33 || key==34){ 
   var cnt = I ? this.PageLength : 1;
   for(var i=0;i<cnt;i++){
      var C = key==33 ? this.GetPrev(I) : this.GetNext(I);
      if(!C){
         if(!i){ I = null; if(this.OnMoveOut && this.OnMoveOut(key==33?0:1)) this.SetCursor(null); }
         break;
         }
      I = C;
      }
   if(I) this.SetCursor(I);
   }   
else if(key==27){ if(M.Popup) M.Close(1); }   
else if(key==13 && M.Buttons&&M.Buttons.join(",").indexOf("ok")>=0 && ev && (ev.altKey || ev.ctrlKey || !M.EnterSwitches)){ 
   if(M.Level||M.Menu||M.Caption) M.ButtonClick("Ok"); 
   else M.Save();
   }
else if(key==9){ 
   if(M.OnTab) M.OnTab(ev.shiftKey?1:0); 
   if(!this.IgnoreTab && !M.Caption) M.Save(I);
   else { CancelEvent(ev,2); return; }
   }  
else if(O){
   if(key==32 && this.IgnoreSpace || key==13 && this.IgnoreEnter) return; 
   else if((key==37 || key==39) && O.parentNode.tagName.toLowerCase()=="td" && !M.EditMode){
      var P = O;
      while(1){
         var nn = key==(this.Rtl?39:37)?"previousSibling":"nextSibling"
         P = P.parentNode[nn]; if(!P) break;
         P = P[nn]; if(!P) break; 
         P = P.firstChild; if(!P || !P.id) break; 
         var C = this.GetItem(P); if(!C) break;
         if(C.Disabled) continue;
         this.SetCursor(C);
         this.LastCol = P.parentNode.cellIndex;
         break;
         }
      }
   else if(key==32 && I.Bool) M.Check(I);
   else if((key==32 || key==113) && I.Enum) M.Submenu(I);
   else if((key==32 || key==113) && I.Edit==1) M.StartEdit(I); 
   else if(key==37 && M.Prev) M.Close(1);
   else if(key==39 && I.Menu){ if(!M.Next || M.Next.PrevItem!=I) M.Submenu(I); }
   else if(key==37 && I.Level && I.Expanded!=null){ if(I.Expanded==1) M.Expand(I,0); }
   else if(key==39 && I.Level && I.Expanded!=null){ if(I.Expanded==0) M.Expand(I,1); }
   else if((key==32 || key==13) && I.Level && I.Expanded!=null) M.Expand(I); 
   else if((key==32 || key==13) && I.Menu) M.Submenu(I); 
   else if(key==13 && I.Bool) M.Check(I);
   else if(key==13 && I.Enum) M.Submenu(I);
   else if(key==13 && I.Edit==1) M.StartEdit(I);
   else if(key==37 && I.Bool && I.Value) M.Check(I);
   else if(key==39 && I.Bool && !I.Value) M.Check(I);
   else if(key==37 && I.Enum) M.ChangeEnumItem(I,-1);
   else if(key==39 && I.Enum) M.ChangeEnumItem(I,1);
   else if((key==32 || key==13) && !M.Caption) M.Save(I);
   else if(key==27){ if(M.Popup) M.Close(1); }
   else if((key>32&&key<112||key>123||key==8) && !M.EditMode && I.Edit==1) {
      M.StartEdit(I);
      var E = O.getElementsByTagName("input")[0];
      if(key==8) { if(E.value==null) E.innerHTML = ""; else E.value = ""; } 
      else {
         var F = E.onkeydown; if(F) F.apply(E,[ev]);
         var F = E.onkeypress; if(F) F.apply(E,[ev]);
         }
      return;
      }
   
   else return;
   }

else return;
CancelEvent(ev);  
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
TMenu.KeyPress = function(key){
if(this.NoFindItem || this.EditMode) return; 
var d = new Date()-0;
if(this.KeyDate+this.KeyTime<=d) this.KeyPressString = "";
this.KeyDate = d;
key = String.fromCharCode(key);
if(this.FindItemText(this.KeyPressString + key)) this.KeyPressString += key;  
else if(key==this.KeyPressString.slice(-1) && this.FindItemText(this.KeyPressString));
else if(this.FindItemText(key)) this.KeyPressString = key;
}
// -----------------------------------------------------------------------------------------------------------
TMenu.FindItemText = function(str){
try { str = new RegExp("^(<[^>]+>)*\\s*"+str.replace(/\s+/,"").split("").join("\\s*"),"gi"); }
catch(e) { str = new RegExp("^(<[^>]+>)*\\s*"+ToRegExp(str),"gi"); }
var C = this.Names[this.Cursor];
for(var I=this.GetNext(C);I;I=this.GetNext(I)) if((I.Text ? I.Text : I.Name).search(str)>=0) { this.SetCursor(I); return true; }
if(C) for(I=this.GetNext(I);I&&I!=C;I=this.GetNext(I)) if((I.Text ? I.Text : I.Name).search(str)>=0) { this.SetCursor(I); return true; }
if(C && (C.Text ? C.Text : C.Name).search(str)>=0) return true;
return false;
}
// -----------------------------------------------------------------------------------------------------------
TMenu.FindItem = function(name){
return this.Names[(name+"").replace(/\W/g,"_").toLowerCase()];
}
// -----------------------------------------------------------------------------------------------------------
TMenu.GetValues = function(Items){
var A = [], SR = new RegExp(this.SaveType<=2?"[\\"+this.Separator+"\\"+this.NameSeparator+"]":"\\"+this.Separator,"g");
for(var i=0;i<Items.length;i++){
   var I = Items[i];
   if(I.Bool){ 
      if(this.SaveType==4) A[A.length] = I.Value ? I.Name : "";
      else if(this.SaveType){ if(this.SaveType!=1||I.Value&&!I.OValue||!I.Value&&I.OValue) A[A.length] = (this.SaveType!=3 ? I.Name + this.NameSeparator : "") + (I.Value?1:0); }
      else if(I.Value) A[A.length] = I.Name; 
      }
   else if(I.Enum || I.Edit){ 
      if(this.SaveType==1&&I.Value!=I.OValue || this.SaveType!=1&&(I.Value||this.SaveType)) { 
         var v = I.Value;
         if(I.Edit && I.IOFormat) { 
            if(I.Type=="Int"||I.Type=="Float") v = Formats.NumberToString(v,I.IOFormat,I.Range);
            else if(I.Type=="Date") v = Formats.DateToString(v,I.IOFormat,I.Range);
            }
         v = v==null?"":(this.SeparatorReplace!=null?(v+"").replace(SR,this.SeparatorReplace):v);   
         A[A.length] = (this.SaveType!=3&&this.SaveType!=4 ? I.Name + this.NameSeparator : "") + (v?v:"");
         }
      }   
   else if(I.Items) A = A.concat(this.GetValues(I.Items));
   }
return A;
}
// -----------------------------------------------------------------------------------------------------------
TMenu.SetValues = function(Items,A){
for(var i=0,k=0;i<Items.length;i++){
   var I = Items[i];
   if(I.Bool && !this.SaveType){ I.Value = 0; for(var j=0;j<A.length;j++) if(A[j]==I.Name) { I.Value = 1; break; } }
   else if(I.Enum || I.Edit || I.Bool){
      if(this.SaveType==3 || this.SaveType==4){
         var v = A[k++];
         if(I.Bool) I.Value = v==0||!v?0:1;
         else I.Value = v;
         }
      else {   
         if(this.SaveType!=1) I.Value = null;
         var n = I.Name+this.NameSeparator, l = n.length;
         for(var j=0;j<A.length;j++) {
            if(A[j].indexOf(n)==0) { 
               var v = A[j].slice(l);
               if(I.Bool) {
                  if(v-0) I.Value = 1;
                  else if(!v || v==0) I.Value = 0;
                  else continue; 
                  }
               else I.Value = v;
               break; 
               }
            } 
         }
      }
   else if(I.Items) this.SetValues(I.Items,A);
   }
}
// -----------------------------------------------------------------------------------------------------------
function ShowEnum(M,P,input){
M = TMenu.InitMenu(M); if(!M) return;
P = InitPos(P);
if(input) M.Input = input;
var enumtag = M.Input; if(!enumtag) enumtag = P.Tag;
for(var i=0;i<Dialogs.length;i++) if(Dialogs[i] && Dialogs[i].EnumTag==enumtag) return; 
M.EnumTag = enumtag;
if(!M.MinWidth) M.MinWidth = 0;
M.CloseClickHeader = 1;
var hdr = P.Tag?P.Tag.innerHTML:""; if(!hdr) hdr = CNBSP;
M.Header = "<div class='"+TControl.Class+"EnumHeader "+TControl.Class+"Control'>"+hdr+"</div>";
M.OnCSave = function(I,V){
   var v = "";
   if(I) v = I.Value!=null?I.Value:I.Name;
   else v = V.join(M.Separator);
   if(M.Input) M.Input.value = v;
   if(P.Tag) P.Tag.innerHTML = v;
   }
return ShowMenu(M,P);
}
var TGShowEnum = ShowEnum; if(window["ShowEnum"]==null) window["ShowEnum"] = ShowEnum; 
// -----------------------------------------------------------------------------------------------------------
function ShowPopup(M,func,init){

M = ShowMenu(M,{X:-10,Y:-10,Mouse:1},func,init);
if(M && M.Tag && !M.Head) M.Hover(M.GetDiv(M.Items[M.Align.above?M.Items.length-1:0]));
return M;
}
var TGShowPopup = ShowPopup; if(window["ShowPopup"]==null) window["ShowPopup"] = ShowPopup; 
// -----------------------------------------------------------------------------------------------------------
TMenu.MenuTouchStart = function(dummy,item){
this.Hover(item);
this.NoClick = 0;
this.Scroll = GetWindowScroll();
}
// -----------------------------------------------------------------------------------------------------------
TMenu.MenuTouchMove = function(dummy,dummy2){
this.NoClick++;
}
// -----------------------------------------------------------------------------------------------------------
TMenu.MenuTouchEnd = function(ev,item){
var A = GetWindowScroll();
if(this.NoClick>5 || A[0]!=this.Scroll[0] || A[1]!=this.Scroll[1]) this.NoClick = null;
else this.Click(item);
CancelEvent(ev);
this.HideHover(item);
}
// -----------------------------------------------------------------------------------------------------------
TMenu.ShowTip = function(I){
if(!I) I = this.Hovered; if(!I) return;
var tip = I.Tip;
if(I.Value) { 
   var tt = "Tip" + (I.Value==null||I.Value===""?"":I.Value===true?1:!I.Value?0:typeof(I.Value)=="string"?I.Value.replace(/\W+/g,""):typeof(I.Value)=="number"?I.Value:""); if(I[tt]!=null) tip = I[tt]; 
   if(I.Enum) for(var idx=0;idx<I.Items.length;idx++) if(I.Items[idx].Name==I.Value) { var tt = "Tip"+idx; if(I[tt]!=null) tip = I[tt]; break; }
   }
var M = {Body:tip,ZIndex:this.ZIndex!=null?this.ZIndex+16:null,Base:this.Base.replace("Menu","Tip"),Rtl:this.Rtl};
var P = this.TipAlign ? {Tag:this.GetDiv(I),Align:this.TipAlign} : {Mouse:1};
if(M){
   MS.Animate; M.AnimateShow = this.AnimateShowTip; M.AnimateShowRight = this.AnimateShowTipRight; M.AnimateHide = this.AnimateHideTip; M.AnimateHideRight = this.AnimateHideTipRight; ME.Animate;
   M.StyleSize = this.StyleSize;
   M.Grid = this.Grid;
   M.Scale = this.Scale;
   
   this.Tip = ShowTip(M,P,0);
   }
}
// -----------------------------------------------------------------------------------------------------------
TMenu.HideTip = function(I){
if(!I) I = this.Hovered; if(!I) return;
HideTip(this.TipAlign ? this.GetDiv(I) : null);
this.Tip = null;
this.TipTime = -1e5;
}
// -----------------------------------------------------------------------------------------------------------
Dialogs.Interval = function(){
for(var i=0;i<Dialogs.length;i++){
   var D = Dialogs[i];
   if(D && D.Hovered && D.Hovered.Tip){
      D.TipTime++;
      if(D.TipTime == Math.ceil(D.TipEnd/200)) D.HideTip(D.Hovered);
      else if(D.TipTime == Math.ceil(D.TipStart/200)) D.ShowTip(D.Hovered);
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
ME.Menu;

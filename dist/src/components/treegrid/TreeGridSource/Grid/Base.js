// -----------------------------------------------------------------------------------------------------------
var CEditTypes = { "Auto":true,"Text":true,"Int":true,"Float":true,"Date":true,"Bool":true,"Enum":true,"Radio":true,"Lines":true,"Pass":true,"Img":true,"Link":true,"EHtml":true }; 
var CEditKinds = { "Filter":1,"Group":1,"Search":1,"Tabber":1,"Tabber2":1,"Toolbar":1,"Toolbar1":1,"Toolbar2":1,"Toolbar3":1,"Topbar":1,"Topbar1":1,"Topbar2":1,"Topbar3":1 }
var CEditMulti = { "Lines":1, "Html": 1, "EHtml": 1, "List": 1, "Auto":1, "Radio":2, "Img":3, "Link":3 }
// -----------------------------------------------------------------------------------------------------------
// Returns parameter of given row
function Get(row,prop){
var v = row[prop];
if(v!=null) return v;
if(!row.Def) return null; 
return row.Def[prop];
}
var TGGet = Get; if(window["Get"]==null) window["Get"] = Get; 
// -----------------------------------------------------------------------------------------------------------
// Returns parameter of given row as boolean
function Is(row,prop){
var v = row[prop];
if(v!=null) return v-0;
if(!row.Def) return null; 
return row.Def[prop]-0;
}
var TGIs = Is; if(window["Is"]==null) window["Is"] = Is; 
// -----------------------------------------------------------------------------------------------------------
TGP.AppendTag = function(tag){ return AppendTag(tag,this.Img?this.Img.Size:""); }
// -----------------------------------------------------------------------------------------------------------
// Returns attribute of given cell or column
TGP.GetAttr = function(row,col,attr,def,fromrow){
if(!row || !col) return def;
var a = row[col+attr]; if(a!=null) return a;
if(row.Def){ a = row.Def[col+attr]; if(a!=null) return a; }
if(fromrow==2) {
   a = row[attr]; if(a!=null) return a;
   if(row.Def) { a = row.Def[attr]; if(a!=null) return a; }
   }
var C = row.Space?this.DefCols.Space:this.Cols[col];
if(C && C[attr]!=null) return C[attr];
if(fromrow==1) {
   a = row[attr]; if(a!=null) return a;
   if(row.Def) { a = row.Def[attr]; if(a!=null) return a; }
   }
return def;
}
// -----------------------------------------------------------------------------------------------------------
// Returns type of given cell
TGP.GetType = function(row,col){
if(!row || !col || row.Page) return "";
var t = row[col+"Type"]; if(t==null && row.Def) t = row.Def[col+"Type"];
if(t==null){ 
   var c = row.Space?this.DefCols.Space:this.Cols[col]; 
   if(c) t = c.Type;
   if(row.Kind=="Filter" && !CEditTypes[t] && t!="Panel" && (!c||!c.ConstWidth) && t!="Button") t = "Text";
   if(row.Kind=="Panel" && (!c||!c.ConstWidth) && t!="Button") t = "Panel";
   }
if(Grids.OnGetType) { var tmp = Grids.OnGetType(this,row,col,t); if(tmp!=null) t = tmp; }
return t;
}
// -----------------------------------------------------------------------------------------------------------
// Returns format of given cell, for edit==1 return EditFormat
TGP.GetFormat = function(row,col,edit){
var e = edit ? "EditFormat" : "Format";
var f = row[col+e]; 
if(f==null&&row.Def) f = row.Def[col+e]; 
var C = row.Space?this.DefCols.Space:this.Cols[col];
if(f==null&&(!C||C.NoFormat!=2)) {
   f = row[e];
   if(f==null&&row.Def) f = row.Def[e];
   }
if(f==null&&C) f = C[e];
if(f==null&&typeof(edit)=="string"){
   f = this.GetAttr(row,col,"Format");
   if(f&&edit=="Date") f = this.Lang.Format.ConvertEditDateFormat(f);
   }
if(Grids.OnGetFormat) { var tmp = Grids.OnGetFormat(this,row,col,f,edit); if(tmp!=null) f = tmp; }
return f;
}
// -----------------------------------------------------------------------------------------------------------
// Tests, if the cell is Range cell (has Range attribute)
TGP.IsRange = function(row,col){
MS.Range;
var r = row[col+"Range"]; if(r!=null) return r-0;
r = row.Def[col+"Range"]; if(r!=null) return r-0;
r = row.Space?this.DefCols.Space:this.Cols[col];
return r ? r["Range"] : 0;
MX.Range;
return 0;
ME.Range;
}
// -----------------------------------------------------------------------------------------------------------
// If cell can be focused, type is cell type to speed up
TGP.CanFocus = function(row,col,type){
if(row.Page) { var c = this.Cols[col]; return c&&c.CanFocus!=null ? c.CanFocus : 1; }
if(!row.Def) return 0; 
if(!col) { 
   var cf = row.CanFocus; if(cf!=null) return cf-0;
   cf = row.Def.CanFocus; return cf ? 1 : 0;
   }
MS.RowSpan; if(row.RowSpan && row[col+"RowSpan"]==0) row = this.GetSpanRow(row,col,0); ME.RowSpan;
MS.ColSpan; if(row.Spanned && row[col+"Span"]==0) col = this.GetPrevCol(col,row); ME.ColSpan;
if(row.Space && row[col+"Visible"]==0) return 0;
var cf = row[col+"CanFocus"]; if(cf!=null) return cf-0;
cf = row.Def[col+"CanFocus"]; if(cf!=null) return cf-0;
cf = row.CanFocus; if(cf==null) cf = row.Def.CanFocus; if(cf==0||cf==2) return cf;
var C = row.Space?this.DefCols.Space:this.Cols[col]; if(!C) return 1;
var usec = this.UserSec[C.Sec];
if(row[usec]!=null || row.Def[usec]!=null) return 0;
if(C.CanFocus!=null) return C.CanFocus;
if(!type) type = this.GetType(row,col);
if(type=="Panel" || type=="Button") return 0;
return !this.Locked["focus"] || this.CanEdit(row,col,0,type,1)==1 ? 1 : 0;
}
// -----------------------------------------------------------------------------------------------------------
TGP.IsLockedEdit = function(row,col,lce){
var lt = row[col+"LockType"]; if(lt==null) lt = row.Def[col+"LockType"]; if(lt && lt.charCodeAt(0)<96) lt = lt.toLowerCase();
if(lce&&(!lt||lt=="edit")&&!CEditKinds[row.Kind]) return this.Locked["canedit"]||this.LockedEdit&&(!this.DynamicEditing||this.DynamicEditing==1&&(row.Fixed||this.Cols[col].MainSec!=1));
return lt ? this.Locked[lt] : !CEditKinds[row.Kind] ? this.LockedEdit : row.Kind=="Filter" ? this.Locked["filter"] : row.Kind=="Group" ? this.Locked["group"] : row.Kind=="Search" ? this.Locked["search"] : this.Locked["menu"];
}
// -----------------------------------------------------------------------------------------------------------
// If cell can be edited, type and canfocus can be passed to speed up
TGP.CanEdit = function(row,col,style,type,canfocus){
MS.Edit;
if(!col || row.Page || (!this.Editing||this.Editing==3) && (!CEditKinds[row.Kind]||style) || col=="id" || style&&this.Locked["style"]) return 0;

if(canfocus==null) {
   if(!type) type = this.GetType(row,col);
   canfocus = this.CanFocus(row,col,type);
   }
if(!canfocus){ 
   if(!type) type = this.GetType(row,col);
   if(type!="Bool" && type!="Radio") return 0;
   }
var lck = 0, ce = row[col+"CanEdit"]; if(ce==null) { ce = row.Def[col+"CanEdit"]; if(ce==null) { ce = row.CanEdit; if(ce==null) { ce = row.Def.CanEdit; if(ce==1) ce = null; } } }
if(this.Locked.length&&this.IsLockedEdit(row,col,1)){ lck = ce?1:-1; ce = null; }
if(ce==null){
   var C = row.Space?this.DefCols.Space:this.Cols[col]; if(!type) type = this.GetType(row,col);
   if(this.GroupTree && this.Grouped && this.Group && !row.Fixed && !row.Def.Group && this.GroupTreeCols[col]) ce = 0;
   else if(row.Kind=="Filter") ce = type!="Pass" && C && C.CanFilter>0 && row[col+"Visible"]!=0;
   else if(row.Calculated){ 
      ce = row[col+"Formula"]; 
      if(ce==null) { ce = row.Def[col+"Formula"]; if(ce==null && C) ce = C.Formula; }
      if(ce) ce = 0;
      else if(C && C.CanEdit!=null && !lck) ce = C.CanEdit;
      else if(style?this.Locked["style"]:this.Locked.length&&this.IsLockedEdit(row,col)) ce = this.Locked["copy"]||style ? 0 : 2;
      else ce = lck>0||C.CanEdit ? 1 : this.EditTypes[type];
      }
   else if(C && C.CanEdit!=null && !lck) ce = C.CanEdit;   
   else if(style?this.Locked["style"]:this.Locked.length&&this.IsLockedEdit(row,col)) ce = this.Locked["copy"]||style ? 0 : 2;
   else if(C && !C.Formula) ce = lck>0||C.CanEdit ? 1 : this.EditTypes[type];
   else {
      ce = row[col+"Formula"]; if(ce==null) ce = row.Def[col+"Formula"];
      ce = ce==""?this.EditTypes[type]:0; 
      }
   }

if(ce==1 && this.Editing==2 && (!CEditKinds[row.Kind]||style)) ce = 2;
if(Grids.OnCanEdit) { var tmp = Grids.OnCanEdit(this,row,col,ce); if(tmp!=null) ce = tmp; }
return ce;
MX.Edit;
return 0;
ME.Edit;
}
// -----------------------------------------------------------------------------------------------------------
MS.Enum;
// -----------------------------------------------------------------------------------------------------------
// If the Enum is set by index or by string, val is value, range is Range attribute, en is Enum string
TGP.IsIndexEnum = function(val,range,en){
if(val==null || val==="") return this.IndexEnum;
if(range){
   if((val+"").search(new RegExp("[^\\"+this.Lang.Format.ValueSeparator+"0-9]"))>=0) return 0; 
   }
else if(val-0+""!=val) return 0; 

if(this.IndexEnum) return 1;
var sep = en.charAt(0);
if(range) val = (val+"").replace(this.Lang.Format.ValueSeparator,"(^|\\"+sep+")|($|\\"+sep+")"); 
return en.search(new RegExp("(^|\\"+sep+")"+val+"($|\\"+sep+")"))<0; 
}
// -----------------------------------------------------------------------------------------------------------
// Returns prefix for related cell (Enum)
TGP.GetRelatedPrefix = function(row,col){
var r = this.GetAttr(row,col,"Related"); if(!r) return null;
if(row.Def.Group && col==this.MainCol) for(var rev=this.ReversedTree;row&&row.Def.Group&&(rev?row.lastChild:row.firstChild);row=(rev?row.lastChild:row.firstChild));
r = r.split(',');
var n = [];
for(var i=0;i<r.length;i++){
   var x = Get(row,r[i]);
   if(!x && x!==0) x = this.IndexEnum&&!this.GetAttr(row,col,"CanEmpty") ? 0 : "_";
   if(this.GetAttr(row,r[i],"Range")){
      var a = (x+"").split(this.Lang.Format.ValueSeparator);
      if(a.length>1) {
         var len = n.length;
         if(!len) n = a;
         else for(var k=0,u=n,n=[];k<a.length;k++) for(j=0;j<len;j++) n[k*len+j] = u[j]+"_"+a[k]; 
         continue;   
         }
      }
   if(!n.length) n[0] = x;
   else for(var j=0;j<n.length;j++) n[j] += "_"+x;
   }  
return n;   
}
// -----------------------------------------------------------------------------------------------------------
// Returns Enum, EnumKeys, EditEnum, EnumMenu, according to name. rp is related prefix got by GetRelatedPrefix
TGP.GetEnum = function(row,col,name,rp){
var en = "";
if(rp){
   MS.Group;
   if(row.Def.Group && col==this.MainCol) { 
      col = row[col+"GroupOrig"];
      while(row && row.Def.Group && row.firstChild) row = row.firstChild;
      }
   ME.Group;   
   for(var i=0;i<rp.length;i++) {
      var v = this.GetAttr(row,col,name+rp[i]);
      if(v) en += v;
      }
   }
if(!en) en = this.GetAttr(row,col,name);
if(Grids["OnGet"+name]) {
   var tmp = Grids["OnGet"+name](this,row,col,en);
   if(tmp!=null){
      en = tmp;
      if(en && en.join) en = "|"+en.join("|"); 
      }
   }
return en;   
}
// -----------------------------------------------------------------------------------------------------------
// Returns value of Enum cell as string or HTML string (html is 0/1)
TGP.GetEnumString = function(row,col,html){
var rp = this.GetRelatedPrefix(row,col);

var en = this.GetEnum(row,col,"Enum",rp);
if(!en) return html?CNBSP:"";
var ek = this.GetEnum(row,col,"EnumKeys",rp);

var E = this.Enums[en+ek];
if(!E){
   var E = {}, V = en.slice(1).split(en.charAt(0));
   if(this.IndexEnum) for(var i=0;i<V.length;i++) { E[V[i]] = V[i]; E[i] = V[i]; }
   else for(var i=0;i<V.length;i++) { E[i] = V[i]; E[V[i]] = V[i]; }
   if(ek){
      var K = ek.slice(1).split(ek.charAt(0));
      for(var i=0;i<K.length;i++) E[K[i]] = V[i];
      }
   
   this.Enums[en+ek] = E;
   }

var n = Get(row,col), val;
if(!n && n!==0) n = this.IndexEnum&&!this.GetAttr(row,col,"CanEmpty") ? 0 : "";
if(n&&n.split&&this.GetAttr(row,col,"Range")){
   var sep = this.Lang.Format.ValueSeparator;
   var v = n.split(sep);
   for(var i=0;i<v.length;i++) v[i] = E[v[i]];
   val = v.join(html?this.Lang.Format.ValueSeparatorHtml:sep);
   }   
else val = E[n];
if(val==null){
   if(n-0+""==n){ 
      var f = this.GetAttr(row,col,"IntFormat");
      if(f){
         val = this.Lang.Format.NumberToString(n,f);
         if(!val || val==" ") return html?CNBSP:"";
         return !html || this.NoFormatEscape!="0" ? val : PFormat.Escape(val);
         }
      }
   val = n+""; 
   }
if(val) return val;
if(!html) return "";
val = this.GetAttr(row,col,"EmptyValue");
return val ? val : CNBSP;
}
// -----------------------------------------------------------------------------------------------------------
ME.Enum;
// -----------------------------------------------------------------------------------------------------------
// If row is placed on more lines
TGP.IsMultiline = function(row,col){
var m = CEditMulti[this.GetType(row,col)]; if(!m) return 0;
if(m==1) return 1;
if(m==2) return this.GetAttr(row,col,"Wrap")>0;
var f = this.GetFormat(row,col,1); return f&&f.charAt(1)!='0'; 
}
// -----------------------------------------------------------------------------------------------------------
// If Enter in cell puts LF
MS.Lines;
TGP.CanAcceptEnters = function(row,col){
var ca = this.GetAttr(row,col,"AcceptEnters");
if(ca!=null) return ca;
return this.AcceptEnters ? this.AcceptEnters : 0;
}
ME.Lines;
// -----------------------------------------------------------------------------------------------------------
// Returns link for given cell of type Link or Img or null
// Returns [ling,target]
MS.Img;
TGP.GetLink = function(row,col){
var typ = this.GetType(row,col);
if(typ!="Img" && typ!="Link") return null;
var v = this.GetValue(row,col);
if(!v) return null;
v = v.split(v.charAt(0));
if(typ=="Img"){ v[1] = v[6]; v[3] = v[7]; }
if(!v[1]) return null;
var f = this.GetFormat(row,col);
if(f){
   f = f.split(f.charAt(0));
   if(typ=="Img"){ f[1] = f[5]; f[2] = f[6]; }
   v[1] = (f[1]?f[1]:"")+v[1]+(f[2]?f[2]:"");
   }
return [v[1],v[3]];
}
ME.Img;
// -----------------------------------------------------------------------------------------------------------
// Returns row name, used for messages and alerts
TGP.GetName = function(row){
var trans = this.Trans; 
if(row.Page) return row.Name; 
if(row.Name) return trans ? this.Translate(row,"Name",row.Name,"") : row.Name;
if(this.NameCol) {
   var cc = this.NameCol+"";
   if(cc.indexOf("*")>=0){
      cc = cc.split("*");
      for(var i=1;i<cc.length;i+=2) {
         if(!cc[i]) { cc[i] = this.MainCol; if(!cc[i]) continue; }
         cc[i] = trans ? this.Translate(row,cc[i],this.GetString(row,cc[i],1)) : this.GetString(row,cc[i],1);
         }
      return cc.join("");
      }
   else {
      cc = cc.split(",");
      for(var i=0;i<cc.length;i++) cc[i] = trans ? this.Translate(row,cc[i],this.GetString(row,cc[i],1)) : this.GetString(row,cc[i],1);
      return cc.join(", ");   
      }
   }
if(row.HasIndex) return row[this.RowIndex];
if(row.id) return row.id;
if(this.MainCol) return trans ? this.Translate(row,cc[i],this.GetString(row,this.MainCol,1)) : this.GetString(row,this.MainCol,1);
var C = this.Cols; for(var col in C) if(C[col].Type=="Text") return trans ? this.Translate(row,cc[i],this.GetString(row,col,1)) : this.GetString(row,col,1);
return "???";
}
// -----------------------------------------------------------------------------------------------------------
// Returns message text according to its identifier
TGP.GetText = function(ident,t){ 
if(!t) t = this.Lang["Text"];
return t!=null&&t[ident]!=null ? t[ident] : ident;
}   
// -----------------------------------------------------------------------------------------------------------
// Returns alert text according to its identifier
TGP.GetAlert = function(ident){ 
var t = this.Lang["Alert"];
return t!=null&&t[ident]!=null ? t[ident] : ident;
}
// -----------------------------------------------------------------------------------------------------------
// Shows the alert according to its identifier
TGP.Alert = function(ident){
if(!ident) return; 
var t = this.Lang["Alert"][ident], D = Grids.Drag;
Grids.Alert = 1; Grids.Drag = null;
if(t!="") { alert(t?t:ident); if(BIPAD) this.NoTouchAlert = new Date()-0; }
Grids.Alert = 0; Grids.Drag = D;
}   

// -----------------------------------------------------------------------------------------------------------
// Shows the confirm according to its identifier
TGP.Confirm = function(ident){ 
var t = this.Lang["Alert"][ident], ret = true, D = Grids.Drag;
Grids.Alert = 1; Grids.Drag = null;
if(t!="") { ret = confirm(t?t:ident); if(BIPAD) this.NoTouchAlert = new Date()-0; }
Grids.Alert = 0; Grids.Drag = D;
return ret;
}   
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Returns position of row in its parent, counts only visible rows

MS.Api;
TGP.GetPos = function(row){
for(var r=row.parentNode.firstChild,pos=0;r&&r!=row;r=r.nextSibling) if(r.Visible) pos++;
return pos;
}
ME.Api;
// -----------------------------------------------------------------------------------------------------------
// Returns page in that given row lies
MS.Paging;
TGP.GetRowPage = function(row){
for(var p=row;p&&!p.Page;p=p.parentNode);
return p;
}
ME.Paging;
// -----------------------------------------------------------------------------------------------------------
// Returns position of row on page, counts only visible rows
MS.Paging;
TGP.GetPagePos = function(row){
var p = this.GetRowPage(row);
for(var r=this.GetFirstVisible(p,1),pos=0;r&&r!=row;r=this.GetNextVisible(r,3),pos++);
return pos;
}
ME.Paging;
// -----------------------------------------------------------------------------------------------------------
// Returns row on given position on page
MS.Paging;
TGP.PagePosToRow = function(row,pos){
if(row.State<2) return null;
if(!pos) pos=0;
for(var r=this.GetFirstVisible(row,1);r&&pos;r=this.GetNextVisible(r,3),pos--);
return r?r:this.GetLastVisible(row,1);
}
ME.Paging;
// -----------------------------------------------------------------------------------------------------------
// Returns true, if row has some visible children (shows icon for expand/collapse)
TGP.HasChildren = function(row){
MS.Tree;
if(row.Count) return 1;
var n = row.firstChild;
while(n){
   if(n.Visible||n.Expanded&2&&this.HasChildren(n)) return 1;   
   n = n.nextSibling;
   }
return 0;
ME.Tree;
}
// -----------------------------------------------------------------------------------------------------------
// Returns true, if row has some visible children (shows icon for expand/collapse)
TGP.HasNDChildren = function(row){
MS.Tree;
for(var n=row.firstChild;n&&n.Deleted;n=n.nextSibling);
return n?1:0;
ME.Tree;
}
// -----------------------------------------------------------------------------------------------------------
// If the row has some (even invisible) children
TGP.CanShowChildren = function(row){
MS.Tree;
if(this.ChildPaging<=1) return row.firstChild!=null;
if(row.Count) return 1;
return row.firstChild!=null;
ME.Tree;

}
// -----------------------------------------------------------------------------------------------------------
// Returns count of visible children = the place for that rows is prepared after row is expanded
TGP.GetChildCount = function(row){
MS.Tree;
if(row.State<2) return row.Count;
var n = row.firstChild, lev = row.Level;
if(!n) return 0;
var cnt = n.Visible ? 0 : -1;
do { n = this.GetNextVisible(n,1); cnt++; } while(n&&n.Level>lev);
return cnt;
MX.Tree;
return 0;
ME.Tree;
}
// -----------------------------------------------------------------------------------------------------------
// If row has this visible row count at least
TGP.HasChildCount = function(row,count){
MS.Tree;
if(row.State<2) return row.Count>=count;
var n = row.firstChild, lev = row.Level;
if(!n) return 0;
if(n.Visible) count--;
do { 
   if(!(count--)) return 1;
   n = this.GetNextVisible(n,1);
   } while(n&&n.Level>lev);
ME.Tree;   
return 0;
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Changes row default to D, does not change values
TGP.ChangeDef = function(r,D,show,undo){
if(Grids.OnChangeDef){ var tmp = Grids.OnChangeDef(this,r,D&&typeof(D)=="object"?D.Name:D); if(tmp!=null) D = tmp; }
if(typeof(D)=="string") D = this.Def[D];
if(!D) return false;
var OD = r.Def;
MS.Undo;
if(undo) {
   var A = null;
   if(r.Calculated||D.Calculated){
      A = {};
      for(var c in this.Cols) if(D[c+"Formula"]&&!this.Cols[c].Formula&&(!OD.Calculated&&!r.Calculated||!OD[c+"Formula"])) A[c] = [r[c],r[c+"Changed"]];
      }
   this.AddUndo({Type:"ChangeDef",Row:r,Def:D,OldDef:OD,Values:A,RowChanged:r.Changed});
   if(undo==2) this.MergeUndo();
   }
ME.Undo;
r.Def = D;

if(D.Kind!=null) r.Kind = D.Kind;

MS.Nested; if(D.DetailCol!=null && r.DetailCol==null) r.DetailCol = D.DetailCol; ME.Nested;
MS.Calc; if(D.Calculated!=null) r.Calculated = D.Calculated-0; ME.Calc; 
MS.Group;
if(D.Group){
   var par = r.parentNode;
   if(!par.Page && par.Def.Group){ 
      if(par.GroupPos!=null) { 
         r.GroupCol = par.GroupCol;
         r.GroupPos = par.GroupPos + 1;
         }
      else { 
         var g = this.Group.split(",");
         for(var i=0;i<g.length;i++) if(g[i]==par.GroupCol){ r.GroupCol = g[i+1]; break; }
         }   
      }
   else { 
      r.GroupCol = this.Group.split(",")[0];
      if(this.Cols[r.GroupCol] && this.Cols[r.GroupCol].GroupChar) r.GroupPos = 0;
      }  
   }
else if(this.Group&&OD&&OD.Group) this.UpdateRowGroups(r,show);   
ME.Group;   
MS.ColSpan;
var spn = r.Spanned;
if(D.Spanned!=null) r.Spanned = D.Spanned-0;
if(spn || r.Spanned) this.UpdateSpan(r);
ME.ColSpan;
MS.Calc;
if(r["CalcOrderAuto"]) r.CalcOrder = null;
if(r.Calculated && this.Calculating==null) this.Calculating = 1;
this.Recalculate(r,null,show!=0);
if(show!=0) this.RefreshRow(r);
ME.Calc;
}
// -----------------------------------------------------------------------------------------------------------
// Clears unwanted text selection in document
TGP.ClearSel = function(ev){
if(this.EditMode) return;
ClearSelection(ev);
if(Try) { 
   if(!this.Dialog && BMozilla && this.MainTable && this.MainTable.focus) this.MainTable.focus(); 
   }
else if(Catch) { }
}

// -----------------------------------------------------------------------------------------------------------
// Sets basic attributes of page
TGP.SetBody = function(B){
B.Level = -1;
B.LevelImg = 1;
B.Page = 1;
B.State = this.Paging || !this.AllPages ? 2 : 4;
B.LastAccess = 0;
if(this.Paging==1 && !this.AllPages && this.FPage==this.XB.childNodes.length-2) B.State = 4;

}
// -----------------------------------------------------------------------------------------------------------
// Adds and returns page to this.XB
// If show is set, adds body also to html and interconnects them
TGP.AddBody = function(show,B){
if(!B){ B = Dom.createElement("B"); this.XB.appendChild(B); }
this.SetBody(B);
if(show){
   var p = B.previousSibling, he = B.State<4 ? this.GetPageHeight(B,true)+(BIE&&B.Page?(B.previousSibling?this.Img.PageBPHeight:this.Img.PageFirstBPHeight):0) : 0, h;
   for(var i=this.FirstSec;i<=this.LastSec;i++){
      if(p){ h = p["r"+i]; if(h) h = h.parentNode; }
      else h = this.GetBody(i);
      if(h){
         var d = document.createElement("div");
         h.appendChild(d);
         if(he) d.style.height = he+"px";
         d.className = this.Img.Style+"Page";
         B["r"+i] = d;
         }
      }
   }
return B;
}
// -----------------------------------------------------------------------------------------------------------
// Deletes page event from HTML
MS.Paging;
TGP.DelBody = function(B){
for(var i=this.FirstSec;i<=this.LastSec;i++){
   var h = B["r"+i];
   if(h) { 
      B["r"+i] = null; h.row = null; 
      if(h.parentNode) h.parentNode.removeChild(h);
      }
   }
this.XB.removeChild(B);
B.Removed=1;

if(!this.AllPages){
   while(this.FPage>=this.XB.childNodes.length) this.FPage--;
   
   }
}
ME.Paging;
// -----------------------------------------------------------------------------------------------------------
// Returns parsed array of flags, tests cell, row and column attribute, col can be null
// names is list of all permited flag names, comma separated string
TGP.GetFlags = function(row,col,attr,names){
var v;
if(col) { 
   v = row[col+attr]; if(v==null && row.Def) v = row.Def[col+attr];
   if(v==null && this.Cols[col]) v = this.Cols[col][attr];
   }
if(v==null) v = row[attr]; if(v==null && row.Def) v = row.Def[attr];
return this.ConvertFlags(v,names);
}
// -----------------------------------------------------------------------------------------------------------
// Converts flags (comma separated list of actual flags) to flag array (object with flag names = 1)
// Converts to lowercase, if not set nolower
// names is list of all permited flag names, comma separated string
TGP.ConvertFlags = function(flags,names,nolower,spec,copy){
if(!flags) return { };
if(typeof(flags)=="object") return flags; 
var A = this.Flags[flags+nolower+spec]; 
if(!A) {
   A = { };
   var N = (flags+"").replace(/\s/g,"");
   var O = N.split(",");
   for(var i=0;i<O.length;i++) A[O[i]] = 1;
   A.length = O.length;
   if(!nolower) {
      N = N.toLowerCase().split(",");
      for(var i=0;i<N.length;i++) A[N[i]] = 1;
      }
   else N = O;
   this.Flags[flags+nolower+spec] = A;
   MS.Debug;
   if(names) {
      var X = this.ConvertFlags(names);
      for(var i=0;i<N.length;i++) if(!X[N[i]]) {
         this.Debug(2,"Unknown flag ",N[i]," in flags '"+flags+"', possible flags are '"+names+"'");
         }
      }
   ME.Debug;
   }
if(!copy) return A;
var B = {}; for(var a in A) B[a] = A[a];
return B;
}
// -----------------------------------------------------------------------------------------------------------
// Converts bit array (integer) to flags (object with flag names = 1), names is string with comma separated values for every bit
// Converts to lowercase
TGP.BitArrayToFlags = function(bit,names){
if(!bit) return { };
if(bit-0+""!=bit) return typeof(bit)=="object" ? bit : { }; 
var A = this.Flags[bit+names]; if(A) return A;
A = { };
var N = this.FlagNames[names]; if(!N){ N = (names+"").toLowerCase().split(","); this.FlagNames[names] = N; }
for(var i=0,k=1,cnt=0;i<N.length;i++,k<<=1) if(bit&k) { A[N[i]] = 1; cnt++; }
A.length = cnt;
this.Flags[bit+names] = A;
return A;
}
// -----------------------------------------------------------------------------------------------------------
// Converts flags (object with flag names = 1) to bit array (integer), names is string with comma separated values for every bit
// Converts to lowercase
TGP.FlagsToBitArray = function(flags,names){
if(!flags) return 0;
if(flags-0+""==flags) return flags; 
var A = this.Bits[flags+names]; if(A) return A;
var F = this.ConvertFlags(flags,names);
var N = this.FlagNames[names]; if(!N){ N = (names+"").toLowerCase().split(","); this.FlagNames[names] = N; }
var A = 0;
for(var i=0,k=1;i<N.length;i++,k<<=1) if(F[N[i]]) A+=k;
this.Bits[flags+names] = A;
return A;
}
// -----------------------------------------------------------------------------------------------------------
// Returns value of given attribute, only for API
MS.Api;
TGP.GetAttribute = function(row,col,attr){
var v; if(!attr) attr = "";
if(row && col){
   v = row[col+attr]; if(v!=null) return v;
   if(row.Def) { v = row.Def[col+attr]; if(v!=null) return v; }
   }
var X = {"CanFilter":1,"CanPrint":1,"Changed":1,"Visible":1}; 
if(col && attr && (!row||!X[attr]&&!row.Space)){   
   var C = this.Cols[col];
   if(C) v = C[attr];
   if(v!=null) return v;
   }
if(row && attr && (!col||!X[attr])){
   v = row[attr]; if(v!=null) return v;
   if(row.Def) { v = row.Def[attr]; if(v!=null) return v; }
   }
return null;
}
ME.Api;
// -----------------------------------------------------------------------------------------------------------
// Sets value of given attribute, only for API
MS.Api;
TGP.SetAttribute = function(row,col,attr,val,refresh,undo){
if(val-0+""==val) val -= 0;
if(row){
   if(col){
      if(attr){
         if(undo) {
            this.AddUndo({Type:undo-0?"SetAttribute":undo,Row:row,Col:col,Attr:attr,Val:val,OldVal:row[col+attr]});
            if(this.SaveOrder && !Is(row,"NoUpload")) this.SetChange( { Row:row,Col:col+attr,Val:val });
            }
         row[col+attr] = val;
         if(refresh) this.RefreshCell(row,col);
         }
      else this.SetString(row,col,val,refresh);   
      }
   else if(attr) {
      if(undo) {
         this.AddUndo({Type:undo-0?"SetAttribute":undo,Row:row,Col:col,Attr:attr,Val:val,OldVal:row[attr]});
         if(this.SaveOrder && !Is(row,"NoUpload")) this.SetChange( { Row:row,Col:attr,Val:val });
         }
      row[attr] = val;
      if(refresh) this.RefreshRow(row);      
      }   
   }
else if(attr) {
   var C = this.Cols[col];
   if(C){
      if(undo) this.AddUndo({Type:undo-0?"SetAttribute":undo,Row:row,Col:col,Attr:attr,Val:val,OldVal:C[attr]});
      C[attr] = val;
      if(refresh){
         var F = this.GetFixedRows();
         for(var i=0;i<F.length;i++) this.RefreshCell(F[i],col);
         for(var r=this.GetFirstVisible();r;r=this.GetNextVisible(r)) this.RefreshCell(r,col);
         }
      }
   }
}
ME.Api;
// -----------------------------------------------------------------------------------------------------------
// Returns index of the value val inside Defaults attribute array of given cell
MS.Defaults;
TGP.GetDefaultsIndex = function(row,col,val,range){
if(!row || !col) return null;
var M = this.GetAttr(row,col,"Defaults"); if(val==null) val = Get(row,col);
if(Grids.OnGetDefaults) { var tmp = Grids.OnGetDefaults(this,row,col,M); if(tmp!=null) M = tmp; }
if(!M) return null;
M = M.split(M.charAt(0));
if(range==null) range = this.GetAttr(row,col,"Range");
if(!range){
   for(var i=1;i<M.length;i++) if(val==M[i]) return i-1;
   return null;
   }
if(!val&&val!="0") return range<0 ? [] : "";
if(typeof(val)!="object") val = (val+"").split(this.Lang.Format.ValueSeparator);
var v = {}; for(var i=0;i<val.length;i++) v[val[i]] = 1;
for(var i=1,O=[];i<M.length;i++) {
   if(v[M[i]]) O[O.length] = i-1;
   }
return range<0 ? O : O.join(this.Lang.Format.ValueSeparator);
}
ME.Defaults;
// -----------------------------------------------------------------------------------------------------------
// Returns value from cell Defaults on given position idx
MS.Defaults;
TGP.GetDefaultsValue = function(row,col,idx,range){
if(!row || !col) return null;
var M = this.GetAttr(row,col,"Defaults");
if(Grids.OnGetDefaults) { var tmp = Grids.OnGetDefaults(this,row,col,M); if(tmp!=null) M = tmp; }
if(!M) return null;
if(range==null) range = this.GetAttr(row,col,"Range");
if(!range){
   M = M.split(M.charAt(0));
   return M[idx+1];
   }
if(!idx&&idx!="0") return range<0 ? [] : "";
if(typeof(idx)!="object") idx = (idx+"").split(this.Lang.Format.ValueSeparator);
for(var i=0,O=[];i<idx.length;i++) O[O.length] = M[i]?M[i]:"";
return range<0 ? O.join(this.Lang.Format.ValueSeparator) : O;
}
ME.Defaults;
// -----------------------------------------------------------------------------------------------------------
MS.Api;

// For backward compatibility, converting functions
function DateToString(v,f,r){ return Formats.DateToString(v,f,r); }
function StringToDate(v,f,r,d){ v = Formats.StringToDate(v,f,r,d); return Formats.ExcelDates ? v : new Date(v); }
function NumberToString(v,f,r){ return Formats.NumberToString(v,f,r); }
function StringToNumber(v,f,r){ return Formats.StringToNumber(v,f,r); }
var TGDateToString = DateToString; if(window["DateToString"]==null) window["DateToString"] = DateToString;
var TGStringToDate = StringToDate; if(window["StringToDate"]==null) window["StringToDate"] = StringToDate;
var TGNumberToString = NumberToString; if(window["NumberToString"]==null) window["NumberToString"] = NumberToString;
var TGStringToNumber = StringToNumber; if(window["StringToNumber"]==null) window["StringToNumber"] = StringToNumber;
TGP.Escape = PFormat.Escape;
ME.Api;
// ----------------------------------------------------------------------------------------------------------
TGP.StartUpdate = function(){
if(this.Updating) { this.Updating++; return; }
this.Updating = 1;
this.NoCalc = 1;
this.Rendering = 1;
this.UndoStart();
 
MS.Chart; this.ZalCharts = this.Charts; this.Charts = null; ME.Chart;
this.ZalAutoUpdate = this.AutoUpdate; this.AutoUpdate = 0;
if(this.MasterGrid) { this.ZalAutoUpdateMaster = this.MasterGrid.AutoUpdate; this.MasterGrid.AutoUpdate = 0; }
}
// ----------------------------------------------------------------------------------------------------------
TGP.EndUpdate = function(row,col,noupd){
if(this.Updating>1) { this.Updating--; return; }
if(!this.Updating) return;
this.Updating = 0;
this.NoCalc = 0;
this.Rendering = 0;

if(!noupd) { if(row) this.Recalculate(row,col,1); else this.Calculate(1); }
MS.Chart; this.Charts = this.ZalCharts; if(this.Charts&&!noupd) this.UpdateCharts(); ME.Chart;
this.AutoUpdate = this.ZalAutoUpdate; this.ZalAutoUpdate = null; if(this.AutoUpdate&&!noupd) this.UploadChanges(row);
if(this.MasterGrid) { this.MasterGrid.AutoUpdate = this.ZalAutoUpdateMaster; if(this.MasterGrid.AutoUpdate&&!noupd) this.MasterGrid.UploadChanges(row?row.MasterRow:null); }
if(!noupd){
   if(this.DoUpdateHidden) { this.DoUpdateHidden = null; this.UpdateHidden(); }
   this.UpdateEmptyRows();
   this.Update();
   }
this.UndoEnd();
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetItemId = function(prefix,row,col,item,html){
var sep = this.Sep;
return (html?" id=\"":"")+StringToXml("TG"+prefix+sep+this.Index+(row?sep+row.id:"")+(col?sep+col:"")+(item!=null?sep+item:""))+(html?"\"":"");
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetTimeout = function(code,time,ident,type,data){
if(typeof(code)=="string"){
   if(ident==null) ident = code;   
   code = new Function("data",code);
   }
if(ident==null) return;
var A = this.SetTimeoutList; if(!A) { A = {}; this.SetTimeoutList = A; }
var B = A[ident], date = new Date()-0;
if(!B) { B = { Last:0 }; A[ident] = B; }
if(type&1 && B.Last+time < date) { code(data); B.Last = date; return true; }
if(B.Handle) {
   if(type&2) return null;
   clearTimeout(B.Handle);
   }
B.Code = code;
B.Data = data;
B.ReloadIndex = this.ReloadIndex;
B.Handle = setTimeout(new Function(this.This+".DoSetTimeout('"+ident.replace("'","\\'").replace("\\","\\\\")+"');"),time);
return false;
}
// -----------------------------------------------------------------------------------------------------------
TGP.DoSetTimeout = function(ident){
var A = this.SetTimeoutList, B = A[ident];
if(!B||B.ReloadIndex!=this.ReloadIndex) return;
B.Last = new Date()-0;
B.Code(B.Data);
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetRotate = function(row,col){
MS.Rotate;
var rot = row[col+"Rotate"]; if(rot!=null) return rot;
rot = row.Def[col+"Rotate"]; 
if(!this.DynamicStyle || rot!=null) return rot;
var C = this.Cols[col]; if(!C) return null;
if(!C.NoStyle && (this.DynamicStyle!=1||C.MainSec==1)){
   rot = row.Rotate; if(rot!=null) return rot;
   rot = row.Def.Rotate; if(rot!=null) return rot;
   }
var rnostyle = row.NoStyle; if(rnostyle==null) rnostyle = row.Def.NoStyle; 
if(!rnostyle && (this.DynamicStyle!=1||!row.Fixed)) return C.Rotate;
ME.Rotate;
return null;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetScale = function(row,full,def){
if(row&&!row.Space) return this.Scale&&this.Scale!=1 ? this.Scale : def;
if(!full||row&&(row.Space==-1||row.Space==5||row.Tag)&&full!=2) return this.ScaleSpace ? (this.ScaleSpace!=1?this.ScaleSpace:def) : this.Scale&&this.Scale!=1 ? this.Scale : def;

return this.ScaleSpace&&this.Scale ? (this.ScaleSpace!=this.Scale?this.ScaleSpace/this.Scale:def) : this.ScaleSpace ? this.ScaleSpace : def;  
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetVertAlign = function(row,col){
var va = row[col+"VertAlign"], D = row.Def; if(!D) D = {}; if(va==null) va = D[col+"VertAlign"]; 
var C = this.Cols[col]; if(!C) C = {};
var nodys = this.DynamicStyle==1&&(C.MainSec!=1||row.Fixed), cnostyle = C.NoStyle, rnostyle = row.NoStyle!=null ? row.NoStyle : D.NoStyle; if(cnostyle==3||rnostyle==3) return null;
if(va==null&&!cnostyle&&!nodys) { va = row.VertAlign; if(va==null) va = D.VertAlign; } 
if(va==null&&!rnostyle&&!nodys) va = C.VertAlign;
if(va==null&&col!="V"){
   va = row[col+"VAlign"]; if(va==null) va = D[col+"VAlign"]; 
   if(va==null&&!cnostyle&&!nodys) { va = row.VAlign; if(va==null) va = D.VAlign; } 
   if(va==null&&!rnostyle&&!nodys) va = C.VAlign;
   }
return CVertAlignTypes[va];
}
// -----------------------------------------------------------------------------------------------------------
TGP.CopyLang = function(){
var L = {}; 
for(var n in this.Lang) L[n] = this.Lang;
delete L.Format;
return L;
}
// -----------------------------------------------------------------------------------------------------------
TGP.IsAutoRight = function(row,col,val,f){
if(val==null) val = row[col]; if(val==null) val = row.Def[col]; 
if(f==null) f = row[col+"Format"]; if(f==null){ f = row.Def[col+"Format"]; if(f==null&&this.Cols[col].NoFormat!=2) { f = row.Format; if(f==null) f = row.Def.Format; } if(f==null) f = this.Cols[col].Format; }
if(Grids.OnGetFormat) { var tmp = Grids.OnGetFormat(this,row,col,f); if(tmp!=null) f = tmp; }
if(f&&f.charCodeAt(0)==123) { val = this.Lang.Format.FormatString(val,f); f = null; }
if(f=="!") return -1; 
if(this.HideZero && val=="0" || !val && val!="0" || f=="@" || typeof(val)=="string"&&val.charAt(0)==this.Lang.Format.TextPrefix) return 0;
if(f&&this.Lang.Format.IsDate(f)) return val-0||val=="0";
if(!f&&!this.Lang.Format.IsExactNumber(val)) return 0;
return val-0||val=="0";
}
// -----------------------------------------------------------------------------------------------------------
TGP.IsAlignRight = function(row,col){ var typ = this.GetType(row,col); return CAlignRight[typ]||typ=="Auto"&&this.IsAutoRight(row,col); }
// -----------------------------------------------------------------------------------------------------------

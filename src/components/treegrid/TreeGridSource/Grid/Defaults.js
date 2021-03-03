// -----------------------------------------------------------------------------------------------------------
// Defaults dialog
// -----------------------------------------------------------------------------------------------------------
MS.Defaults;
// -----------------------------------------------------------------------------------------------------------
// Updates Items for Menu Defaults, recursion
TGP.UpdateMenuDefaults = function(row,col,Items,range,type){

var R = null, L = this.Lang.Format;
MS.Range;
var sep = L.ValueSeparator;
if(range){
   R = Get(row,col);
   if(R || R=="0") R = (R+"").split(sep);
   else R = [];
   }
ME.Range;

function SetBool(I){
if(I.Bool!=null || I.Level || I.Menu || I.Columns || I.Caption || I.Enum || I.Edit) return;
I.Bool = 1;
I.Value = 0;
for(var i=0;i<R.length;i++) if(R[i]==I.Name) I.Value = 1;
}

var N = [], p = 0, th; if(!type) type = this.GetType(row,col); if(type=="Icon") th = this.GetRowHeight(row);
var isfilt = row.Kind=="Filter", trans = this.Trans, fdef = null;
if(isfilt){
   var white = GetWhiteChars(this.GetAttr(row,col,"WhiteChars"));
   var codes = this.GetAttr(row,col,"CharCodes");
   var local = this.GetAttr(row,col,"LocaleCompare");
   var cas = this.GetAttr(row,col,"CaseSensitive");
   }
for(var i=0;i<Items.length;i++){ 
   var I = Items[i], u = I.Name;
   if((u+"").charAt(0)=='*'){ 
      if(u=="*All"){ I.Text = this.GetText("DefaultsAll"); if(I.Text) N[p++] = I; I.Value = 0; I.CheckAll = 1; continue; }
      if(u=="*None"){ I.Text = this.GetText("DefaultsNone"); if(I.Text) N[p++] = I; I.Value = 1; I.CheckAll = 1; continue; }
      if(u=="*Date"){ I.Text = this.GetText("DefaultsDate"); if(I.Text) N[p++] = I; I.Spec = 1; continue; }
      if(u=="*Button"){ I.Text = this.GetText("DefaultsButton"); if(I.Text) N[p++] = I; I.Spec = 1; continue; }
      if(u=="*Default") { 
         var zv = row[col]; row[col] = null;
         I.Text = this.GetRowHTML(row,null,10,col);
         row[col] = zv;
         if(I.Text){ N[p++] = I; I.Val = row.Def[col]; I.Name = I.Val; }
         continue; 
         }
      if(u=="*FilterOff") {
         if(!isfilt) I.Hidden = 1;
         I.Text = this.GetText("DefaultsFilterOff"); 
         if(I.Text) N[p++] = I; 
         I.Spec = 1; 
         continue; 
         }
      if(u.search(/^\*Rows/)>=0){
         var T = this, X = {}, alp = u.search("Alphabet")>=0, Y = {},filt = u.search("CanFilter")>=0, vis = u.search("Visible")>=0, def = u.search("Def")>=0, cc=col;
         if(def) { def = u.match(/Def(\w*)(\*|$)/); if(def) def = this.Def[def[1]]; if(!def) def = row.Def; }
         if(alp) var ralp = new RegExp("["+this.DefaultsAlphabetWhite.replace(/(.)/g,"\\$1")+"]","g");
         function Set(r){
            if(r.Kind!="Data" || r.CPage || def && r.Def!=def || vis && !r.Visible || filt && (!(Get(r,"CanFilter")&1) || T.Cols[col].CanFilter==2 && Get(r,col+"CanFilter")==0)) return;
            if(filt){
               if(fdef==null){
                  var FF = isfilt ? row : T.GetFilterRows()[0];
                  fdef = FF ? T.GetAttr(FF,col,"FilterDef") : T.Cols[col].FilterDef;
                  if(!fdef) fdef = "";
                  else { var dd = fdef.split(","); fdef = {}; for(var d in dd) fdef[dd[d]] = 2; }
                  }
               if(fdef && !fdef[r.Def.Name]) return;
               }
            MS.RowSpan; if(r.RowSpan && r[col+"RowSpan"]==0 || r[col+"Visible"]==-2) return; ME.RowSpan;
            if(isfilt){
               var v = Get(r,cc+"FilterValue");
               if(!v) v = Get(r,cc);
               if(Grids.OnGetFilterValue) { var tmp = Grids.OnGetFilterValue(T,r,cc,v); if(tmp!=null) v = tmp; }
               }
            else var v = Get(r,cc); 
            if(v!=null){
//                v = (v+"").replace(/\s/g,"_");
               if(isfilt && typeof(v)=="string"){
                  MS.CharCodes;
                  
                  ME.CharCodes;
                  if(!cas&&v) v = local ? v.toLocaleLowerCase() : v.toLowerCase();
                  if(white&&v) v = v.replace(white,"");
                  }
               if(T.IsRange(r,cc)){
                  MS.Range;
                  v = (v+"").split(sep);
                  var t = null;
                  for(var i=0;i<v.length;i++){
                     if(X[v[i]]) X[v[i]]++; 
                     else if(type=="Icon"){ X[v[i]] = 1; Y[v[i]] = "<div style='height:"+th+"px;background:url("+(this.EscapeImages?'"'+L.Escape(v[i])+'"':v[i])+") no-repeat;'></div>"; }
                     else { 
                        X[v[i]] = 1; 
                        if(!t) {
                           t = T.GetRowHTML(r,null,10,cc).split(sep);
                           if(t.length!=v.length){ 
                              var z = r[cc];
                              r[cc] = (Get(r,cc)+"").replace(new RegExp(ToRegExp(sep),"g"),"$%^");
                              t = T.GetRowHTML(r,null,10,cc).split("$%^");
                              r[cc] = z;
                              }
                           }
                        Y[v[i]] = t[i];
                        }
                     }
                  ME.Range;
                  }
               else if(X[v]) X[v]++; 
               else if(type=="Icon"){ X[v] = 1; Y[v] = "<div style='height:"+th+"px;background:url("+(this.EscapeImages?'"'+L.Escape(Get(r,col))+'"':Get(r,col))+") no-repeat;'></div>"; }
               else { Y[v] = T.GetRowHTML(r,null,10,cc); if(Y[v]!=null) X[v] = 1;  } 
               }
            }
         var cm = u.match(/Col(\w*)(\*|$)/);
         if(cm) cc = cm[1];
         var FP = null, typ = 0; if(isfilt && this.Paging==3 && this.OnePage&2 && !this.AllPages) { FP = this.GetFPage(); if(FP) typ = 2; }
         if(u.search("All")>=0){
            for(var r=this.GetFirst(FP);r;r=this.GetNext(r,typ)) Set(r);
            var F = this.GetFixedRows(); for(var r=0;r<F.length;r++) Set(F[r]);
            }
         else if(u.search("Fixed")>=0){
            var F = this.GetFixedRows(); for(var r=0;r<F.length;r++) Set(F[r]);
            }
         else if(u.search("Sibling")>=0){
            var par = row.parentNode;
            if(par.Page || row.Fixed) par = this.XB.firstChild;
            for(var r=par.firstChild;r;r=this.GetNextSibling(r)) Set(r);
            }
         else {
            for(var r=this.GetFirst(FP);r;r=this.GetNext(r,typ)) Set(r);
            }
   
         var cnt = u.match(/\d\d*/), X1 = [], xp=0;
         if(cnt) cnt = def&&def.Name.indexOf(cnt[0])>=0 ? 0 : cnt[0];
         var chr = 0;
         MS.CharCodes; if(this.Cols[cc] && this.Cols[cc].CharCodes) chr = this.Cols[cc].CharCodes; ME.CharCodes;
         var ns = this.GetAttr(row,col,"NumberSort");
         if(ns==null||ns==2) { var typ = this.Cols[col]?this.Cols[col].Type:"Text"; ns = CAlignRight[typ]; }
         for(var x in X){
            var O = {};
            O.c = X[x];
            O.t = Y[x];
            O.v = isfilt && x==="" ? String.fromCharCode(160) : x;
            O.cv = ns&&x-0 ? x-0 : (x+"").toLocaleUpperCase();
            if(alp) O.cv = O.cv.replace(ralp,"");
            MS.CharCodes; if(chr) O.cv = UseCharCodes(O.cv,chr); ME.CharCodes;
            X1[xp++] = O;
            }

         if(cnt) X1.sort(function(a,b){ return a.c<b.c ? 1 :  (a.c>b.c ? -1 :(a.cv<b.cv?-1 : 1) ); });
         else X1.sort(function(a,b){ return a.cv<b.cv ? -1 : a.cv>b.cv ? 1 : 0; });
         if(!cnt) cnt = xp;
         if(alp) {
            var lc = null,P,pp,t = this.GetText("DefaultsAlphabet"), min = this.GetAttr(row,cc,"DefaultsAlphabetMin");
            for(var j=0;j<cnt && X1[j];j++){
               var v = X1[j].v;
               var c = (X1[j].cv+"").charAt(0);
               if(lc!=c){
                  N[p++] = { Name:c,Menu:1,Items:[],Text:t?t.replace("%d",c):c};
                  P = N[p-1].Items; pp = 0;
                  lc = c;
                  }
               P[pp++] = { Text: X1[j].t, Val: v, Name: v };
               if(R) SetBool(P[pp-1]);
               }
            if(min){
               for(var j=0;j<N.length;j++){
                  var I = N[j].Items;
                  if(I && I.length<min){
                     N.splice(j,1);
                     for(var k=0;k<I.length;k++) N.splice(j++,0,I[k]);
                     j--;
                     }
                  }
               }
            }   
         else {    
            for(var j=0;j<cnt && X1[j];j++){
               var v = X1[j].v;
               if(isfilt && v===String.fromCharCode(160)) N[p] = { Text: X1[j].t, Val: v, Name: "" };
               else N[p] = { Text: X1[j].t, Val: v, Name: v=="-"?"--":v };
               if(R) SetBool(N[p]);
               p++;
               } 
            }   
         
         continue;
         }
      }
   if(type=="Date" && isNaN(u-0)) { u = L.StringToDateEng(u); I.Val = u; I.Name = u; } 
   if(isfilt && u==="") I.Val = String.fromCharCode(160);
   if(!I.Text) { 
      if(type=="Icon"){ I.Text = "<div style='height:"+th+"px;background:url("+(this.EscapeImages?'"'+L.Escape(Get(row,col))+'"':Get(row,col))+") no-repeat;'></div>"; }
      else { var zal = row[col]; row[col] = u; I.Text = this.GetRowHTML(row,null,10,col); row[col] = zal;  }
      }
   else if(trans) I.Text = this.Translate(row,col,I.Text,type,"Menu");
   if(isfilt && I.Text==="") I.Text = String.fromCharCode(160);  
   
   N[p++] = I;
   if(R) SetBool(I);
   if(I.Items && !I.Enum) I.Items = this.UpdateMenuDefaults(row,col,I.Items,range);
   }
return N;   
}
// -----------------------------------------------------------------------------------------------------------
// Shows menu Defaults
// If set Click (Row,Col,X,Y), shows it on given position
TGP.ShowDefaults = function(row,col,test,noserver,Click,Caption){

MS.Ajax;
if(!noserver && this.GetAttr(row,col,"DefaultsServer")>0){ 
   var T = this;
   this.DownloadCell(row,col,function(err){
      MS.Debug;
      if(err<0) T.Debug(1,"Failed downloading cell [",row.id,",",col,"] from ",T.DebugDataGetName(T.Source.Cell));
      else if(T.DebugFlags["page"]) T.Debug(3,"Downloaded cell [",row.id,",",col,"] in ",T.StopTimer("Cell"+row.id+"_"+col)," ms");
      ME.Debug;
      if(err>=0) T.ShowDefaults(row,col,0,1);   
      },Get(row,col));
   return true;
   }
ME.Ajax;

var M = this.GetAttr(row,col,"Defaults");
if(Grids.OnGetDefaults) { var tmp = Grids.OnGetDefaults(this,row,col,M); if(tmp!=null) M = tmp; }
if(!M) return false;
M = TMenu.InitMenu(M,1);
MS.Debug; if(!M) this.Debug(2,"Incorrect Defaults in [",this.GetName(row),",",col,"]"); ME.Debug;
if(!M) return false;
var range = 0;
MS.Range;
if(this.IsRange(row,col)){
   if(M.Buttons==null) M.Buttons = ["Clear","Ok"];
   M.Texts = this.Lang.MenuButtons; 
   M.Values = Get(row,col)+"";
   if(M.Values==="") M.Values = null;
   M.Separator = this.Lang.Format.ValueSeparator;
   range = 1;
   }
ME.Range;
M.Items = this.UpdateMenuDefaults(row,col,M.Items,range);
if(!M.MinWidth) M.MinWidth = 0;
M.CursorValue = Get(row,col);
if(M.Class==null) M.Class = this.Img.Style+"DefaultsMenu";
M = TMenu.InitMenu(M);
if(!M) return false;
if(test) return true;

M.Head = Caption;

if(Click){
   var P = this.CellToWindow(Click.Row,Click.Col);
   P.X = P.AbsX + Click.X;
   P.Y = P.AbsY + Click.Y;
   P.Align = "left below";
   P.Width = 0; P.Height = 0;
   M.MinWidth = null;
   }
else {   
   var P = this.CellToWindow(row,col,row.Space?4:0);
   P.Align = "right below"; 
   if(this.GetAttr(row,col,"Icon")=="Defaults"&&this.GetAttr(row,col,"IconAlign")!="Right") { P.Align = "left below"; M.MainClass = this.Img.Style+"DefaultsMenuMainLeft"; }
   P.X = P.AbsX; P.Y = P.AbsY;
   if(col==this.MainCol && !row.Fixed && !this.HideTree){
      var left = 0, lev = row.Level; if(this.HideRootTree) lev--;
      var lw = this.Img.Line, tw = this.Img.Tree; 
      if(this.SpannedTree){ if(row.TreeWidthL!=null) lw = row.TreeWidthL; if(row.TreeWidthT!=null) tw = row.TreeWidthT; }
      if(lev>=0) left += tw;
      if(lev>0) left += lev*lw;
      if(!this.Rtl) P.X += left; 
      P.Width -= left;
      }
   
   }
   
var T = this;
M.OnCSave = function(I,V){
   var val, foff = 0;   
   if(!I){
      val = V.join(T.Lang.Format.ValueSeparator);
      if(!V.length) { foff = 1; val = null; } 
      else if(val==="") val = T.Lang.Format.ValueSeparator;  
      }
   else if(I.Spec) { 
      if(I.Name=="*Date") { if(T.ShowDatePicker) T.ShowDatePicker(row,col); M.OnClose = null; return; }
      if(I.Name=="*Button") { M.Close(); if(Grids.OnButtonClick) Grids.OnButtonClick(T,row,col); return; }
      if(I.Name=="*FilterOff") {
         val = null;
         
         foff = 1;
         }
      }
   else {      
      val = I.Val; if(val==null) val = I.Value; if(val==null) val = I.Name;
      var type = T.GetType(row,col);
      MS.Date; if(type=="Date") val =  val===String.fromCharCode(160)&&row.Kind=="Filter" ? "" : T.ConvertDate(val,T.GetFormat(row,col,"Date")); ME.Date; 
      if(type=="Text"||type=="Lines"||type=="Html"||type=="EHtml"){
         var f = T.GetFormat(row,col,1);
         if(f && f.charCodeAt(0)==123){ 
            var ff = FromJSON(f,1);
            for(var n in ff) if(ff[n]==val){ val = n; break; }
            }
         }
      if(val-0+""==val) val -= 0; 
      }
   M.Close();
   T.FinishEdit(row,col,val,foff);   
   }
   
this.SetDialogBase(M,row,col,"Defaults");
var align = this.GetAttr(row,col,"Align",null,1); if(!align && this.IsAlignRight(row,col)) align = "Right"; if(align&&!M.ItemAlign) M.ItemAlign = align;
if(Grids.OnShowDefaults) Grids.OnShowDefaults(this,row,col,M,P);
this.Dialog = ShowMenu(M,P);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionShowDefaults = function(F,T,notest){
var A = this.GetACell(F); if(!A) return false; 
var row = A[0], col = A[1];
MS.RowSpan; if(row.RowSpan) row = this.GetSpanRow(row,col,0); ME.RowSpan;
if(this.Editing!=1&&!CEditKinds[row.Kind] || this.Locked.length&&this.IsLockedEdit(row,col)) return false;
if(!notest){
   var but = this.GetAttr(row,col,"Button"), ico = this.GetAttr(row,col,"Icon");
   if(but!="Defaults" && ico!="Defaults" && (but!="Enum" && ico!="Enum" || this.GetEnum(row,col))) return false;
   }
 
if(this.Dialog && this.Dialog.Row==row && this.Dialog.Col==col) {
   if(T) return false;
   this.CloseDialog();
   return true;
   }  
return this.ShowDefaults(row,col,T);

}
TGP.ActionShowDefaultsMenu = function(F,T){ return this.ActionShowDefaults(F,T,1); }
// -----------------------------------------------------------------------------------------------------------
TGP.InDefaults = function(row,col,val,def,range){ 
if(def==null) { 
   def = row[col+"Defaults"]; if(def==null) def = row.Def[col+"Defaults"]; if(def==null&&!row.Space) def = this.Cols[col].Defaults; 
   if(Grids.OnGetDefaults) { var tmp = Grids.OnGetDefaults(this,row,col,def); if(tmp!=null) def = tmp; }
   }
if(!def) return null;

if(val==null) val = Get(row,col);
if(range==null) range = this.IsRange(row,col);

var sep = def.charAt(0);
if(sep!="{"&&def.indexOf(sep+"*")<0) {
   def = def.split(sep);
   if(range){
      var v = val.split(this.Lang.Format.ValueSeparator);
      for(var j=0;j<v.length;j++){
         for(var i=1;i<def.length;i++) if(def[i]==v[j]) break;
         if(i==def.length) return false;
         }
      return true;
      }
   for(var i=1;i<def.length;i++) if(def[i]==val) return true;
   return false;
   }

var M = TMenu.InitMenu(def,1); if(!M) return null;
M.Items = this.UpdateMenuDefaults(row,col,M.Items,0);

if(range){
   var v = val.split(this.Lang.Format.ValueSeparator);
   function checkrange(Items){
      for(var i=0;i<Items.length;i++){ 
         var I = Items[i]; 
         if(I.Items && checkrange(I.Items)) return true;
         for(var j=0;j<v.length;j++) if(I.Name==v[j]) { v.splice(j,1); break; }
         if(!v.length) return true;
         }
      }
   return checkrange(M.Items) ? 1 : 0;
   }

function check(Items){
   for(var i=0;i<Items.length;i++){ var I = Items[i]; if(I.Name==val||I.Items&&check(I.Items)) return true; }
   }
return check(M.Items) ? 1 : 0;
}
// -----------------------------------------------------------------------------------------------------------
ME.Defaults;

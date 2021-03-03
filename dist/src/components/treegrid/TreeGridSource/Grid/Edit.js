// -----------------------------------------------------------------------------------------------------------
// Function for editing
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Converts string to value according to cell type and format

MS.Img$Paste;
TGP.GetValueInput = function(row,col,Value){
var format = this.GetFormat(row,col,1), type = this.GetType(row,col), L = this.Lang.Format;
switch(type){
   case "Auto": 
      if(!format) format = this.GetFormat(row,col,0);
      if(!Value&&Value!="0") return this.GetAttr(row,col,"EmptyValue")+"";
      if(!(Value-0)&&Value!="0"||format=="@") return Value+"";
      if(format&&L.IsDate(format)) return L.DateToString(Value,format,this.IsRange(row,col),0,1,1);
      return L.NumberToString(Value,format,this.IsRange(row,col),1);
      
   case "Int":
   case "Float": 
      if(Value==="" && (row.Kind=="Filter" ? this.GetAttr(row,col,"CanEmpty")!="0" : this.GetAttr(row,col,"CanEmpty")==1)) return "";
      var range = this.IsRange(row,col);
      Value = L.StringToNumber(Value,format,range);
      return type=="Int"&&!range ? Math.round(Value) : Value;
   case "Date": 
      MS.Date;
      if(Value==="" && this.GetAttr(row,col,"CanEmpty")!="0") return "";
      if(Value==L.NaN) return '/';
      var def = this.GetAttr(row,col,"DefaultDate",this["DefaultDate"])
      if(format==null) format = this.GetFormat(row,col,"Date");
      MS.Range;
      if(this.IsRange(row,col)) return this.ConvertDate(Value,format?format:"",def);
      ME.Range;
      return L.StringToDate(Value,format,0,def);
      ME.Date;
   case "Text": 
   case "Lines": 
      MS.Lines;
      if(!format || format.charCodeAt(0)==123) return Value; 
      var f = format.split(format.charAt(0));
      if((f[2]||f[2]=="0") && Value.slice(0,f[2].length)==f[2]) Value = Value.slice(f[2].length); 
      if((f[3]||f[3]=="0") && Value.slice(Value.length-f[3].length,Value.length)==f[3]) Value = Value.slice(0,Value.length-f[3].length); 
      return Value;
      ME.Lines;
   case "Enum":
      MS.Enum;
      var rp = this.GetRelatedPrefix(row,col), ek = this.GetEnum(row,col,"EnumKeys",rp), en = this.GetEnum(row,col,"Enum",rp);
      if(!en) return Value;
      en = en.slice(1).split(en.charAt(0)); if(ek) ek = ek.slice(1).split(ek.charAt(0)); 
      if(this.IsRange(row,col)){
         var v = Value.split(this.Lang.Format.ValueSeparator);
         var o = [];
         for(var j=0;j<v.length;j++) {
            for(var i=0;i<en.length;i++) if(en[i]==v[j]) { o[o.length] = ek?ek[i]:this.IndexEnum?i:v[j]; break; } 
            if(i==en.length) {
               if(ek) for(var i=0;i<ek.length;i++) if(ek[i]==v[j]) { o[o.length] = ek[i]; break; } 
               else if(this.IndexEnum&&(v[j]-0||v[j]=="0")) o[o.length] = v[j];
               }
            }
         return o.join(this.Lang.Format.ValueSeparator);
         }
      else {
         for(var i=0;i<en.length;i++) if(en[i]==Value) return ek ? ek[i] : this.IndexEnum ? i : Value; 
         if(ek) { for(var i=0;i<ek.length;i++) if(ek[i]==Value) return Value; } 
         else if(this.IndexEnum&&(Value-0||Value=="0")) return Value;
         for(var i=0;i<en.length;i++) if(en[i]=="") return ek ? ek[i] : this.IndexEnum ? i : "";    
         return ek ? ek[0] : this.IndexEnum ? 0 : ""; 
         }
      ME.Enum;
   case "Pass": return Value;
   case "Link" :
      MS.Img;
      if(!format) format = "|0|1";
      var f = format.split(format.charAt(0));
      var url,text;
      var v = Get(row,col);  
      if(v==null) v='|';
      else v+="";
      var sep = v.charAt(0); if(!sep) sep='|';
      v = v.split(sep);
      if(f[2]-0){
         if(f[3]-0){
            text = Value.search(new RegExp("\\s"+ToRegExp(this.GetAlert("LinkText"))+"\\: "));
            url = Value.slice(this.GetAlert("LinkSrc").length+2,text).replace(/[\;\s]*$/,"");
            text = Value.slice(text+this.GetAlert("LinkText").length+3);
            }
         else { url = Value; text = v[2]; }
         }
      else { url = v[1]==null ? "" : v[1]; text = Value; }
      Value = sep+url;
      if(text!=null) Value += sep + text;
      if(v[3]) Value += sep + v[3];    
      return Value;
      ME.Img;
   case "Img" :
      MS.Img;  
      if(!format) format = "|0|1";
      var f = format.split(format.charAt(0)), src = null, ext = null, lnk = null;
      if(f[2]-0) src = f[3]-0 || f[4]-0 ? this.GetAlert("ImgSrc").length+2 : 0;
      if(f[3]-0){
         var w = ToRegExp(this.GetAlert("ImgWidth")), h = ToRegExp(this.GetAlert("ImgHeight")), x = ToRegExp(this.GetAlert("ImgX")), y = ToRegExp(this.GetAlert("ImgY"));
         ext = Value.search(new RegExp(w+"\\:\\d{0,3},"+h+"\\:\\d{0,3};\\s"+x+"\\:\\d{0,4},"+y+"\\:\\d{0,4}",""));
         }
      if(f[4]-0) lnk = Value.search(new RegExp("\\s"+ToRegExp(this.GetAlert("ImgUrl"))+"\\: "));
      var v = Get(row,col), ov = v;  
      if(!v) v = '|';
      var sep = v.charAt(0); 
      v = v.split(sep);
      if(src!=null){
         if(ext) src = Value.slice(src,ext-1);
         else if(lnk) src = Value.slice(src,lnk);
         else src = Value.slice(src);
         src = src.replace(/[\;\s]*$/,"");
         if(v[1].indexOf("data:")>=0 && src==this.GetAlert("ImgData")) src = v[1];
         }
      else src = v[1]==null ? "" : v[1]; 

      if(ext) {
         if(lnk) ext = Value.slice(ext,lnk);
         else ext = Value.slice(ext);
         ext = ext.replace(/[\]\;\s]*$/,"").replace(new RegExp("\\s*"+w+"\\:"),sep).replace(new RegExp(",\\s*"+h+"\\:"),sep).replace(new RegExp(";\\s*"+x+"\\:"),sep).replace(new RegExp(",\\s*"+y+"\\:"),sep);
         }
      else ext = v[2]==null? sep+sep+sep+sep: sep+v[2]+sep+v[3]+sep+(v[4]==null?"":v[4])+sep+(v[5]==null?"":v[5]); 
      
      if(lnk) lnk = Value.slice(lnk+this.GetAlert("ImgUrl").length+3);
      else lnk = v[6]==null ? "" : v[6];
      Value = sep+src+ext+sep+lnk;
      if(!ov && Value.search(/[^|]/)<0) Value = "";
      if(v[7]) Value += sep+v[7];    
      return Value;
      ME.Img;
   default: 
      return Value; 
   }
}
ME.Img$Paste;
// -----------------------------------------------------------------------------------------------------------
MS.ColSpan;
TGP.GetMergeEditCol = function(row,col){
if(!row.Spanned) return col;
var c = Get(row,col+"MergeEdit"); 
if(!c) {
   c = Get(row,col+"Merge");
   if(c) c = (c+"").split(",")[0];
   }
if(!c || !this.Cols[c]) c = col;   
else if(!this.Cols[c].Visible && !(Get(row,col+"MergeType")&2)) return; 
return c;
}
ME.ColSpan;
// -----------------------------------------------------------------------------------------------------------
// Starts editing in given cell
TGP.StartEdit = function(row,col,empty,test,serverzal){
MS.Edit;
if(!row){ row = this.FRow; if(!col) col = this.FCol; }
if(!row || !col || row.Page || !row.r1 || col==row.DetailCol) return false; 
if(this.EditMode&&row==this.ERow&&col==this.ECol&&this.GetType(row,col)=="Enum"){ this.EndEdit(1); return true; } 
if(row.Space&&row[col+"Sheet"]&&this.Locked["sheet"] || this.EditMode || !this.CanEdit(row,col)) return false; 
var C = this.Cols, cc = col, rspn = row, L = this.Lang.Format; 
if(!row.Space && this.ColNames[C[col].Sec].State!=4) return false; 
if(serverzal && serverzal.server==null) serverzal = null; 
if(this.ExternalEdit && row.ExternalEdit==cc && this.CanEdit(this.FRow,this.FCol)!=1) return false;

var frow = row;
MS.RowSpan; if(row.RowSpan) row = this.GetSpanRow(row,col,0); ME.RowSpan;

MS.ColSpan;
cc = this.GetMergeEditCol(row,col);
if(!cc) return false; 
ME.ColSpan;

var type = this.GetType(row,cc); 
if(type=="Bool" || type=="Radio" || type=="Enum" && this.CanEdit(row,cc)==2) return false; 
var chghtml = 0; if(type=="Html" && (this.EditHtml==2||this.EditHtml==3) || type=="Auto"&&!this.AutoHtml) chghtml = 1;

if(!row.Visible || !row.Space&&!C[col].Visible&&(!row.Spanned||!this.GetSpanCol(row,col,2))) return false;
if(test) return true;

if(Grids.OnStartEdit && Grids.OnStartEdit(this,row,cc)) return false;
this.HideHint(); this.HideTip();

MS.Ajax;
if(this.ServerEdit) return true;
if(!serverzal && this.GetAttr(row,cc,"EditServer")>0){
   var T = this;
   serverzal = {server:1};
   for(var n in row) if(!Grids.INames[n] && n.indexOf(cc)==0) serverzal[n] = row[n]; 
   this.ServerEdit = 1;
   this.DownloadCell(row,cc,function(err){
      if(!T.ServerEdit) return;
      MS.Debug;
      if(err<0) T.Debug(1,"Failed downloading cell [",row.id,",",cc,"] from ",T.DebugDataGetName(T.Source.Cell));
      else if(T.DebugFlags["page"]) T.Debug(3,"Downloaded cell [",row.id,",",cc,"] in ",T.StopTimer("Cell"+row.id+"_"+cc)," ms");
      ME.Debug;
      T.ServerEdit = 0;
      if(err>=0) T.StartEdit(row,col,empty,0,serverzal);
      
      });   
   return true;
   }
ME.Ajax;
function RestoreServer() {
MS.Ajax;
for(var n in row) if(!Grids.INames[n] && n.indexOf(cc)==0) row[n] = serverzal[n];
serverzal = null;
ME.Ajax;
}

this.CloseDialog();                        
this.ScrollIntoView(row,col,null,null,1);
this.EditMode = 1; this.ERow = frow; this.ECol = col;

if(Grids.OnCustomStartEdit){
   if(BTablet) { this.ClearCursors(1); this.AbsoluteCursors = 5; }
   this.UpdateCursors();
   this.CustomEdit = Grids.OnCustomStartEdit(this,row,cc,Get(row,cc),this.FocusCursors.firstChild.firstChild,this.FocusCursors.firstChild.firstChild.offsetWidth-this.Img.EditBPWidth);
   if(this.CustomEdit){ this.UpdateCursors(); return true; }
   }
var isfilt = row.Kind=="Filter";

if(type=="Enum"){
   MS.Enum;
   MS.Menu;
   
   var rp = this.GetRelatedPrefix(row,cc), range = this.GetAttr(row,cc,"Range"), v = Get(row,cc), vv;
   if(range) { vv = v?(v+"").split(L.ValueSeparator):[]; v = vv[0]; }
   var M = this.GetEnum(row,cc,"EnumMenu",rp);
   if(M && typeof(M)=="string" && M.search(/Items\s*:/)>0){
      M = TMenu.InitMenu(M);
      MS.Debug; if(!M) this.Debug(2,"Incorrect EnumMenu in [",this.GetName(row),",",cc,"]"); ME.Debug;
      if(M && range){
         function SetBool(Items,vv){
            for(var i=0;i<Items.length;i++){
               var I = Items[i];
               if(I.Items && !I.Enum) SetBool(I.Items,vv);
               if(I.Bool!=null || I.Level || I.Menu || I.Columns || I.Caption || I.Enum || I.Edit) continue;
               I.Bool = 1;
               I.Value = 0;
               for(var j=0;j<vv.length;j++) if(vv[j]==I.Name) { I.Value = 1; break; }
               }
            }
         SetBool(M.Items,vv);   
         }
      }
   var fof = isfilt ? Get(row,col+"FilterOff") : null;
   if(!M || !M.Items){   
      var ena = this.GetEnum(row,cc,"Enum",rp);
      if(!ena){ this.EditMode = 0; return false; } 
      var en = ena.slice(1).split(ena.charAt(0));
      var ek = this.GetEnum(row,cc,"EnumKeys",rp); if(ek) ek = ek.slice(1).split(ek.charAt(0));
      var ee = this.GetEnum(row,cc,"EditEnum",rp); ee = ee ? ee.slice(1).split(ee.charAt(0)) : en;
      var ien = ek ? 0 : this.IsIndexEnum(v,range,ena);
      var s = (M ? M.replace(/}\s*$/,","):"{")+"Items:[", n;
      for(var i=0;i<en.length;i++){
         if(ek && ek[i]!=null) n = ek[i];
         else if(ien) n = i;
         else n = en[i];
         if(isfilt && n==="" && (fof==null||fof==="")) n = String.fromCharCode(160);
         if(i) s += ",";
         s += '{Name:"'+StringToJson(n)+'",';
         if(range && (!isfilt||fof==null||n!=fof)) {
            s += 'Bool:1,';
            for(var j=0;j<vv.length;j++) if(vv[j]==n) s += "Value:1,";
            }
         s += 'Search:"'+StringToJson(en[i])+'",';
         s += 'Text:"'+StringToJson(ee[i])+'"}';
         }
      s += "]}";
      M = TMenu.InitMenu(s);
      if(M){
         var ico = this.GetAttr(row,col,"Icon");
         if(ico=="" || ico!=null && ico!="Enum" && ico!="Filter") M.ShowCursor = 0;
         }
      }
      
   if(!M) { this.EditMode = 0; return false; } 
   MS.Filter;
   if(isfilt && (fof!=null || Get(row,col+"Icon")!="Filter")){
      if(fof==null) fof = "";
      if(en && !ek && fof-0+""==fof && this.IndexEnum!="0" && en[fof]!=null) fof = en[fof];
      for(var i=0;i<M.Items.length;i++) if(M.Items[i].Name==fof) break;
      if(i==M.Items.length) {
         M.Items.unshift({Name:fof,Text:Get(row,col+"FilterOffText")}); 
         M.InitOk = 0; TMenu.InitMenu(M);
         }
      }
   ME.Filter;   
   this.TranslateMenu(row,col,M,"Enum");
   if(!M.MinWidth) M.MinWidth = 0; 
   if(M.Class==null) M.Class = this.Img.Style+"EnumMenu";
   if(M.CloseClickHeader==null) M.CloseClickHeader = 1;
   var icon = this.GetAttr(row,cc,"Icon"), pos = CAlignTypes[this.GetAttr(row,cc,"IconAlign")]; if(!pos) pos = this.Rtl?"Right":"Left";
   if(icon!="Enum" && this.GetAttr(row,cc,"Button")=="Enum") { pos = this.Rtl?"Left":"Right"; if(!icon) icon = "Enum"; }
   var align = this.GetAttr(row,cc,"Align",null,1); if(align&&!M.ItemAlign) M.ItemAlign = align;
   var val = this.GetEnumString(row,cc,1);
   if(this.Trans) val = this.Translate(row,col,val,"Enum");
   var hdr = this.GetAttr(row,cc,"ShowEnumHeader");
   if(cc==col && M.Header==null && hdr!=0 && (!row.Space || hdr==1) && (!this.Scale||this.Scale==1) && !this.ScaleX) {
      var st = "", cls = this.Img.Style+"EnumHeader"+(icon==""||pos=="Center"?"None":pos)+" "+this.Img.Style+"EnumHeader"+(row.Space?"Space":row.Kind)+(icon==""||pos=="Center"?"None":pos)
      if(this.GetAttr(row,col,"Wrap")==1) st += "white-space:normal;";
      var cell = this.GetCell(row,col), tt;
      if(cell){
         tt = cell.className.match(new RegExp(this.Img.Style+"Text\\w+","g")); if(tt) cls += " "+tt.join(" ");
         tt = cell.style.fontSize; if(tt) st += "font-size:"+tt+";";
         tt = cell.style.lineHeight; if(tt) st += "line-height:"+tt+";";
         }
      var vv = val; MS.Digits; if(L.Digits&&(val+"").search(/\d/)>=0) vv = L.ConvertDigits(val,this.GetAttr(row,col,"Digits")); ME.Digits;
      M.Header = "<div class='"+cls+"'"+(st?" style='"+st+"'":"")+">"+(pos=="Right"?"<div style='overflow:hidden;"+st+"'>"+vv+"</div>":vv)+"</div>"; 
      }
   if(icon=="" || pos!=(this.Rtl?"Right":"Left")&&icon!="Filter") M.ShowCursor = 0;   
   
   MS.Rotate; if(this.GetRotate(row,col)) M.Header = null; ME.Rotate; 
   M.CursorValue = ien||ek ? v : val;
   if(range) {
      if(!M.Buttons) M.Buttons = ["Clear","Ok"];
      M.Separator = L.ValueSeparator;
      M.Texts = this.Lang.MenuButtons; 
      }

   var P = this.CellToWindow(row,col,4), I = this.Img;
   if(cc!=col || this.GetAttr(row,col,"ClassInner",0,1)&&this.GetAttr(row,col,"ClassInnerIcon",0,1)){ 
      var A = this.GetCellInnerSize(row,col);
      P.AbsX += A[0]; P.AbsY += A[1];
      P.Width = A[2]; P.Height = A[3];
      if(P.Height<15) P.Height = 15; 
      }
   else if(row.NoDynBorder) { 
      P.AbsX += I.CellBorderLeftHeader; P.AbsY += I.CellBorderTopHeader;
      }
   else {
      P.AbsX += I.CellBorderLeft; P.AbsY += I.CellBorderTop;
      
      } 
     
   if(!M.Header) {
      
      P.Height += I.EnumHeaderBPHeight;
      
      P.AbsY -= I.EnumHeaderBPTop; 
      }
   P.X = P.AbsX; P.Y = P.AbsY;
   if(col==this.MainCol && !row.Fixed && !this.HideTree){
      var left = 0, lev = row.Level; if(this.HideRootTree) lev--;
      var lw = this.Img.Line, tw = this.Img.Tree; 
      if(this.SpannedTree){ if(row.TreeWidthL!=null) lw = row.TreeWidthL; if(row.TreeWidthT!=null) tw = row.TreeWidthT; }
      if(lev>=0) left += tw;
      if(lev>0) left += lev*lw;
      P.X += left; P.Width-=left;
      }
   P.Align = pos+" below";  
   
   var T = this;
   M.OnCSave = function(I,V){
      var val = "";
      if(I) val = I.Value!=null?I.Value:I.Name;
      else {
         val = V.join(M.Separator);
         if(!V.length) fof = val; 
         else if(val==="") val = M.Separator; 
         }
      if(Grids.OnEndEdit) {
         var ret = Grids.OnEndEdit(T,row,cc,1,val,val);
         if(typeof(ret)=="string" || typeof(ret)=="number") val = ret;
         else if(ret) return false;   
         }

      if(serverzal) RestoreServer();
      M.Saved = 1;
      
      T.EditMode = 0;
      return T.FinishEdit(row,col,val,val==fof);
      }
   
   M.OnClose = function(){
      if(!M.Saved && Grids.OnEndEdit) Grids.OnEndEdit(T,row,cc,0);
      if(serverzal) { RestoreServer(); T.RefreshCell(rspn,col); }
      M.Saved = null;
      T.EditMode = 0;
      T.UpdateCursors();
      }

   this.UpdateCursors();
   this.SetDialogBase(M,row,col,"Enum");
   this.Dialog = ShowMenu(M,P);
   if(M.Header) M.HeaderTag.firstChild.firstChild.style.width = M.HeaderTag.style.width; 
   ME.Menu;
   MX.Enum;
   NoModule("Enum");
   ME.Enum;
   return true;   
   }

var M = this.GetAttr(row,col,"Edit");
if(!M) M = { };
else M = FromJSON(M,1);
M.Format = this.GetFormat(row,col,1); if(!M.Format&&(type=="Auto"||CAlignRight[type])) M.Format = this.GetFormat(row,col,0);
M.CanEmpty = this.GetAttr(row,col,"CanEmpty"); if(M.CanEmpty==null) M.CanEmpty = type=="Date";
if(M.Format && (type=="Date"||type=="Auto"&&L.IsDate(M.Format))) M.Format = L.ConvertEditDateFormat(M.Format);
M.IOFormat = M.Format;
var fflags = this.GetFlags(row,col,"EditFormatType","case,whitechars,charcodes");
M.FormatCase = fflags["case"];
if(fflags["whitechars"]) M.FormatWhiteChars = GetWhiteChars(this.GetAttr(row,col,"WhiteChars"));
MS.CharCodes; if(fflags["charcodes"]) M.FormatCharCodes = this.GetAttr(row,col,"CharCodes"); ME.CharCodes;
if(this.DynamicFormat==2&&type!="Auto") type = this.AutoHtml ? "EHtml" : "Lines";
M.EditFormula = this.FormulaEditing ? this.GetAttr(row,cc,"FormulaCanEdit",1,1) : 0;
M.EF = {};
M.Type = CAlignRight[type] || type=="Pass" || type=="Auto"&&!this.GetAttr(row,cc,"FormatSet",null,2) ? type : "Text";
M.ReadOnly = this.CanEdit(row,cc)==2;


M.TypeClass = type=="Button"?Get(row,col+"Button"):type;
 
M.EditMask = this.GetAttr(row,col,"EditMask");
M.MaskColor = this.GetAttr(row,col,"MaskColor");
if(!this.Silent) {
   M.MaskSound = this.AddPath("Ding.wav");
   M.MaskSoundLength = 1000;
   }
M.ResultMask = this.GetAttr(row,col,"ResultMask");
M.ResultText = this.GetAttr(row,col,"ResultText");
M.ResultMessage = this.GetAttr(row,col,"ResultMessage");
M.ResultMessageTime = this.GetAttr(row,col,"ResultMessageTime");
if(Grids.OnResultMask) M.OnResultMask = function(val){ return Grids.OnResultMask(T,row,col,val); }
M.Range = this.GetAttr(row,col,"Range");
M.Size = this.GetAttr(row,col,"Size");
var wrap = this.GetAttr(row,col,"WrapEdit",null,1); if(!wrap&&wrap!="0") wrap = this.GetAttr(row,col,"Wrap",null,1);
M.Multi = type=="Html" ? 2 : wrap=="0" ? (CEditMulti[type]==1 ? 3 : 0) : wrap==1 ? (this.WordWrap ? 2 : 1) : wrap==2 ? (this.WordWrap ? 1 : 2) : type=="Auto" ? 3 : CEditMulti[type]==1 ? (this.WordWrap ? 2 : 1) : 0;
if(M.Class==null) M.Class = (row.Kind=="Header"?this.Img.Style+"HeaderFont ":"")+this.Img.Style+"Edit"+(row.Space?"Space":(row.Kind=="Header"?"Header":(row.Kind=="Filter"?"Filter":"Normal")));
M.Base = this.Img.Style+"Edit";
M.SaveMove = false;
M.NoRemove = 1;
if(this.AutoCalendar || this.GetAttr(row,col,"AutoCalendar")>0) {
   var MC = this.GetAttr(row,col,"Calendar");
   if(!MC) MC = { };
   else MC = FromJSON(MC,1);
   MC.Class = this.Img.Style+"Pick";
   MC.Base = this.Img.Style+"Menu";
   MC.Texts = this.Lang.MenuButtons;
   M.Calendar = MC;
   }
M.CancelUnchanged = this.GetAttr(row,col,"CancelUnchanged");
MS.Digits; if(L.Digits) M.Digits = this.GetAttr(row,col,"Digits"); ME.Digits;
var align = Get(row,col+"Align"); if(align==null) align = Get(row,"Align"); if(align==null && row.Kind!="Header" && !row.Space) align = this.Cols[col].Align;
 
if(align==null&&(CAlignRight[type]||type=="Auto"&&M.TypeClass=="Float")) align = "Right";
M.Align = CAlignTypes[align];
M.LineHeightRatio = this.LineHeightRatio;
MS.Scale; if(this.Scale||row.Space&&this.ScaleSpace||this.ScaleX) M.Scale = (row.Space?(this.ScaleSpace?this.ScaleSpace/(this.Scale?this.Scale:1):this.Scale):this.Scale?this.Scale:1)*(this.ScaleX?this.ScaleY:1); ME.Scale; 
if(this.ExternalEdit && (row.Kind=="Data"||row.ExternalEdit==cc)){
   var mrow = this.FRow, mcol = this.FCol; 
   if(row.ExternalEdit!=cc){ mrow = this.ExternalEdit[0]; mcol = this.ExternalEdit[1]; }
   else if(mrow&&mcol) this.ExternalEditValue = mrow[mcol]; 
   var onchange = function (val,old){ mrow[mcol] = val; T.RefreshCell(mrow,mcol); if(M.OnChangeOld) return M.OnChangeOld(val,old); }
   if(M.OnChange&&M.OnChange!=onchange) M.OnChangeOld = M.OnChange;
   M.OnChange = onchange;
   }
if(this.DynamicBorder && !row.Space && !row.NoDynBorder) M.TypeClass += " "+this.Img.Style+"DB";

var clr = 0;
MS.Menu;
for(var i=0;i<(M.EditFormula?2:1);i++){ 
   var prefix = i ? "FormulaSuggest":"Suggest", EF = i ? M.EF : M;
   var N = this.GetAttr(row,col,prefix);
   
   if(Grids.OnGetSuggest) { var tmp = Grids.OnGetSuggest(this,row,col,N,i); if(tmp!=null) N = tmp; }
   if(N){
      N = TMenu.InitMenu(N,1);
      if(N) {
         N.Items = this.UpdateMenuDefaults(row,col,N.Items,0,i?"Text":null);
         N.Base = this.Img.Style+"Menu";
         if(N.Class==null) N.Class = this.Img.Style+"SuggestMenu";
         N.ShowCursor = 0;
         MS.Scale; if(this.ScaleMenu) N.Scale = this.ScaleMenu<0 ? (this.Scale?this.Scale:1) * (this.ScaleX?(this.ScaleX+this.ScaleY)/2:1) * -this.ScaleMenu : this.ScaleMenu; ME.Scale;
         if(!N.MinWidth) N.MinWidth = 0;
         EF.Suggest = N;
         }
      }
   var stype = this.GetAttr(row,col,prefix+"Type");
   if(stype){
      stype = this.ConvertFlags(stype,"replace,start,startall,empty,all,case,complete,existing,begin,search,separator,esc,arrows,whitechars,charcodes");
      EF.SuggestReplace = stype["replace"];
      EF.SuggestStart = stype["startall"] ? 2 : (stype["start"] ? 1 : 0);
      EF.SuggestEmpty = stype["empty"];
      EF.SuggestAll = stype["all"];
      EF.SuggestCase = stype["case"];
      EF.SuggestComplete = stype["complete"];
      EF.SuggestExisting = stype["existing"];
      EF.SuggestBegin = stype["begin"];
      EF.SuggestSearch = stype["search"];
      EF.SuggestAppendSeparator = stype["separator"];
      EF.SuggestBeforeSeparator = stype["beforeseparator"];
      EF.SuggestEsc = stype["esc"];
      EF.SuggestArrows = stype["arrows"];
      if(stype["whitechars"]) EF.SuggestWhiteChars = GetWhiteChars(this.GetAttr(row,col,"WhiteChars"));
      MS.CharCodes; if(stype["charcodes"]) EF.SuggestCharCodes = this.GetAttr(row,col,"CharCodes"); ME.CharCodes;
      }
   else if(i) { EF.SuggestBeforeSeparator = 1; EF.SuggestWhiteChars = " "; EF.SuggestArrows = 1; }
   var align = this.GetAttr(row,col,"Align",null,1); if(!align && this.IsAlignRight(row,col)) align = "Right"; if(align) { EF.SuggestItemAlign = align; EF.SuggestAlign = align + " below"; }
   if(!EF.SuggestMainClass) EF.SuggestMainClass = "";
   if(this.DynamicBorder && row && !row.NoDynBorder && (!col||!row[col+"ClsInIcon"])) EF.SuggestMainClass += " "+this.Img.Style+"DB";
   if(row&&row.Space) EF.SuggestMainClass += " "+this.Img.Style+"MenuMainSpace";
   EF.SuggestMin = this.GetAttr(row,col,prefix+"Min");
   EF.SuggestDelay = this.GetAttr(row,col,prefix+"Delay");
   var sep = this.GetAttr(row,col,prefix+"Separator");
   if(sep==null && M.Range && !i) sep = L.ValueSeparator;
   if(BIEA&&sep=="\r\n") sep = "\n";
   if(sep&&EF.SuggestAppendSeparator) EF.SuggestAppendSeparator = (sep+"").charAt(0);
   if(sep) sep = new RegExp(sep.length==1?ToRegExp(sep):sep,"g");
   else {  }
   EF.SuggestSeparator = sep;
   }
   
if(this.GetAttr(row,col,"SuggestServer")>0){
   if(!M.Suggest && M.SuggestExisting) clr = 1;
   MS.Defaults;
   var result = null;
   function loaded(err){
      MS.Debug;
      if(err<0) T.Debug(1,"Failed downloading cell [",row.id,",",col,"] from ",T.DebugDataGetName(T.Source.Cell));
      else if(T.DebugFlags["page"]) T.Debug(3,"Downloaded cell [",row.id,",",col,"] in ",T.StopTimer("Cell"+row.id+"_"+col)," ms");
      ME.Debug;
      if(err>=0 && M.Edited) {
         var N = T.GetAttr(row,col,"Suggest");
         if(N){
            N = TMenu.InitMenu(N);
            M.Suggest = N;
            N.Base = T.Img.Style+"Menu";
            if(N.Class==null) N.Class = T.Img.Style+"SuggestMenu";
            N.ShowCursor = 0;
            if(!N.MinWidth) N.MinWidth = 0;
            M.SuggestReplace = T.GetAttr(row,col,"SuggestReplace");
            if(result==null) result = N; 
            else {
               M.Format = T.GetFormat(row,col,1); if(!M.Format&&(type=="Auto"||CAlignRight[type])) M.Format = T.GetFormat(row,col,0); 
               M.IOFormat = M.Format;
               M.ShowSuggest(N);
               }
            }
         }   
      }
   M.OnSuggest = function(dummy,val,ef){
      if(ef) return null;
      T.DownloadCell(row,col,loaded,val);
      if(result==null) result = false; 
      return result; 
      }
   ME.Defaults;   
   }
   
else if(Grids.OnSuggest){
   M.OnSuggest = function(def,val,ef){
      var N = Grids.OnSuggest(T,row,col,val,def,ef);
      if(N==false || N==null) return N;
      N = TMenu.InitMenu(N);
      if(!N) return N;
      N.Base = T.Img.Style+"Menu";
      if(N.Class==null) N.Class = T.Img.Style+"SuggestMenu";
      N.ShowCursor = 0;
      if(!N.MinWidth) N.MinWidth = 0;
      return N;
      }   
   }
ME.Menu;
   
var val = null, bt = row[col+"ButtonText"], gmt = L.GMT, gmn = this.GetAttr(row,col,"GMT"); if(gmn!=null) L.GMT = gmn;
MS.ColSpan;
if(row.Spanned){
   var mer = Get(row,col+"Merge"), merf = null;
   if(mer){
      mer = mer.split(",");
      if(mer.length>1){
         val = Get(row,col+"MergeEditFormat");
         if(!val) val = Get(row,col+"MergeFormat");
         if(val!=null){
            merf = val;
            val = this.GetMergeValue(row,col,mer,val,Get(row,col+"MergeType"),1);
            }
         }
      }
   }
ME.ColSpan;
if(val==null) val = this.GetString(row,cc,4);
var perc = 0;
if(M.EditFormula && row[cc+"EFormula"] && (!this.Locked["formula"]||!M.ReadOnly||this.GetAttr(row,cc,"FormulaCanEdit",1,1)==2)) {
   if(this.Locked["formula"]&&this.GetAttr(row,cc,"FormulaCanEdit",1,1)!=2) val = "";
   else {
      val = row[cc+"EFormula"];
      if(!this.FormulaLocal) val = this.ConvertEditFormula(row,cc,val,0);
      val = L.FormulaPrefix + val;
      if(M.Align) M.Align = "Left";
      }
   }
else {
   if(M.Format&&(type=="Int"||type=="Float"||type=="Auto")) { var f = this.Lang.Format.ParseNumberFormat(M.Format); if(f&&f.Percent) perc = 1; }
   if(row[cc+"EFormula"]) M.ReadOnly = 1;
   }
if(empty) val = perc ? "%" : "";
if(chghtml){ var v = val.replace(/<\/?\w+[^>]*>/g,""); if(v.length!=val.length) chghtml = 2; val = v; }

if(Grids.OnGetInputValue) { var tmp = Grids.OnGetInputValue(this,row,cc,val); if(tmp!=null) val = tmp; }
if(type=="Button"&&row[col+"ButtonText"]) val = row[col+"ButtonText"];
if(this.Trans) val = this.Translate(row,col,val,type);
M.Value = val==null?"":val;
if(type=="Date") M.DefaultDate = this.GetAttr(row,col,"DefaultDate",this["DefaultDate"]);
L.EmptyDate = type=="Date" && this.GetAttr(row,col,"CanEmpty")!="0" ? this.GetAttr(row,col,"EmptyValue") : null;
L.EmptyNumber = (type=="Int"||type=="Float") && (row.Kind=="Filter" ? this.GetAttr(row,col,"CanEmpty")!="0" : this.GetAttr(row,col,"CanEmpty")==1) ? this.GetAttr(row,col,"EmptyValue") : null;

M.ClassAdd = "";

var link = this.GetAttr(row,col,"Link"); M.Link = link;
if(M.Html&&this.GetAttr(row,col,"TextImg")&4) M.ClassAdd += " "+this.Img.Style+"EditCutImg";

var a = this.GetAttr(row,cc,"AcceptNaN");
if(a){
   if(a==1||a==3||a>=5) {
      M.AcceptNaNText = this.GetAttr(row,cc,"AcceptNaNText");
      if(!M.AcceptNaNText) M.AcceptNaNText = this.GetText(a==1?"NaNContinue":a==3?"NaNRejected":a==5?"NaNAccepted":a==8?"NaNAskReject":"NaNAsk");
      M.AcceptNaNTime = this.AcceptNaNTime;
      }
   if(a>=4) M.AcceptNaNValue = this.GetAttr(row,cc,"AcceptNaNValue");
   }
M.AcceptNaN = a;

MS.Img; if(type=="Link" || type=="Img"){ var A = this.GetLinkValue(row,cc,null,type); M.Value = A[0]; M.EditMask = A[1]; M.Multi = A[2]; } ME.Img;

MS.Lines; M.AcceptEnters = this.CanAcceptEnters(row,cc); if(M.AcceptEnters&4&&!inline&&!M.Multi) M.Multi = 1; ME.Lines;

if(BTablet) { this.ClearCursors(1); this.AbsoluteCursors = 5; this.UpdateCursors(); } 
var cell = this.GetCell(row,col), cf = this.FocusCursors.firstChild.firstChild, inline = 0, updh = 0, ref = 0;
if(row.Space&&(row.SpaceWrap||cf.clientHeight<10||row.Tag&&!(this.AbsoluteCursors&2))) { 
   inline = 1; 
   if(cf.firstChild&&cf.firstChild.nodeType==1) cf.firstChild.style.display = "none";
   
   cf.style.zIndex = -1;
   cf = cell.lastChild; while(cf && cf.firstChild && cf.className && cf.className.indexOf("Inner")>=0 && cf.className.indexOf("WidthInner")<0 && cf.firstChild.nodeType==1) cf = cf.firstChild;
   var min = Get(row,col+"MinEditWidth"); if(!(min>10)) min = 10;
   cf.style.width = (cf.clientWidth>min?cf.clientWidth:min)+"px";
   }
else if(M.Multi) {
   MS.Lines;
   var rep = !cell.firstChild||(cell.firstChild.nodeType==3&&cell.firstChild==cell.lastChild||cell.className.indexOf(this.Img.Style+"Type")>=0)&&!this.GetAttr(row,col,"Merge"); 
   if(cell.innerHTML.replace(CRepHtml,"").search(/\S/)<0) rep = 2; 
   
   if(rep){
      var o = row[col], ot = row[col+"Type"], of = row[col+"Format"], va = this.GetVertAlign(row,col), ova = row[col+"VertAlign"]; 
      if(!o||rep==2) { row[col] = "."; row[col+"Type"] = "Text"; row[col+"Format"] = ""; } 
      if(!va) row[col+"VertAlign"] = "Middle"; 
      this.RefreshCell(row,col); 
      if(o&&(!cell.firstChild||cell.firstChild.nodeType==3&&cell.firstChild==cell.lastChild)) { row[col] = "."; row[col+"Type"] = "Text"; row[col+"Format"] = ""; this.RefreshCell(row,col); } 
      row[col] = o; row[col+"Type"] = ot; row[col+"VertAlign"] = ova; row[col+"Format"] = of; cell = this.GetCell(row,col); updh = 1; ref = 1;
      }
   
   ME.Lines;
   }
var P = { Tag: cf, ParentTag:cell };
if(!cell) { this.EditMode = 0; if(BTablet) { this.ClearCursors(1); this.AbsoluteCursors = 7; } this.UpdateCursors(); return false; } 
this.UpdateCursors(1); 

MS.Lines;

M.ParentAutoSize = 0;
if(M.Multi) { 
   M.ParentAutoSize |= 1;
   M.MaxHeight = this.GetAttr(row,col,"MaxEditHeight",Get(row,"MaxHeight"),1);
   M.MinHeight = this.GetCellInnerSize(row,col)[3]+(row.Space?this.Img.EditInputSpaceBPHeight:(this.DynamicBorder&&!row.NoDynBorder ? this.Img.EditInputDBBPHeight : this.Img.EditInputBPHeight));
   
   if((this.NoVScroll||this.NoScroll) && !M.MaxHeight) {
      M.MaxHeight = this.TableY + this.MainTable.clientHeight - this.CellToWindow(row,col).AbsY - 7; 
      if(M.MaxHeight < M.MinHeight) M.MaxHeight = M.MinHeight;
      }
   }
ME.Lines;
  
var T = this, AF = null;

function extfocus(){ 
   var r = AF[0], c = AF[1], r2 = AF[2], c2 = AF[3], lr = AF[4], lc = AF[5], lr2 = AF[6], lc2 = AF[7], R = T.Rows, C = T.Cols;
   if(r) for(var i=0;!R[r]&&!R[lr]&&i<T.ExternalFocusMaxRows;i++) T.AddAutoPages();
   if(c) for(var i=0;!C[c]&&!C[lc]&&i<T.ExternalFocusMaxCols;i++) T.AddAutoColPages();
   if(r2) for(var i=0;!R[r2]&&!R[lr2]&&i<T.ExternalFocusMaxRows;i++) T.AddAutoPages();
   if(c2) for(var i=0;!C[c2]&&!C[lc2]&&i<T.ExternalFocusMaxCols;i++) T.AddAutoColPages();
   if(r) r = R[R[r]?r:lr]; if(r2) r2 = R[R[r]?r:r2];
   if(c&&!C[c]) c = lc; if(c2&&!C[c2]) c2 = lc2;
   T.HideMessage();
   if(!r){
      for(r=T.GetFirstVisible();r&&!T.CanFocus(r,c);r=T.GetNextVisible(r));
      for(r2=T.GetLastVisible();r&&!T.CanFocus(r2,c);r2=T.GetPrevVisible(r2));
      T.Focus(r,c,null,[r,c,r2,c2?c2:c,null,null,0,1],17); 
      }
   else if(!c){
      for(c=T.GetFirstCol();c&&!T.CanFocus(r,c);c=T.GetNextCol(c));
      for(c2=T.GetLastCol();c&&!T.CanFocus(r,c2);c2=T.GetPrevCol(c2));
      T.Focus(r,c,null,[r,c,r2?r2:r,c2,null,null,1,0],17); 
      }
   else if(r2&&c2) T.Focus(r,c,null,[r,c,r2,c2],1); 
   else T.Focus(r,c,null,null,1);
   }
   
M.OnSave = function(val,dummy1,dummy2,raw){
   if(chghtml==2&&T.EditHtml==3&&!confirm(T.GetAlert("StripHtml"))) return false;
   var empty = raw=="", err = row[cc+"Error"]; row[cc+"Error"] = ""; if(!err) err = "";

   
   if(link!=M.Link) row[col+"Link"] = M.Link ? M.Link : null;

   var nfrm = null; 
   MS.Digits;
   if(L.Digits){
      var dig = T.GetAttr(row,cc,"Digits"); if(dig==null) dig = L.Digits;
      if(dig){
         dig = dig.split(dig.charAt(0));
         for(var i=0;i<10;i++) raw = (raw+"").replace(new RegExp(ToRegExp(dig[i+1]),"g"),i);
         }
      }
   ME.Digits;
   if(T.Trans) val = T.Translate(row,col,val,type,"Edit");
   
   if(Grids.OnEndEdit) {
      var ret = Grids.OnEndEdit(T,row,cc,1,val,raw);
      if(typeof(ret)=="string" || typeof(ret)=="number") val = ret;
      else if(ret) { if(err) row[cc+"Error"] = err; return false; }
      }
   if(M.AcceptEnters&4 && type!="Auto" && type!="EHtml" && type!="Lines" && typeof(val)=="string" && val.indexOf("\n")>=0) row[cc+"Type"] = "Lines";
   if(row.ExternalEdit==cc&&T.FRow){
      T.FRow[T.FCol] = T.ExternalEditValue;      
      T.SetStringEdit(T.FRow,T.FCol,raw);        
      return true;
      }
   else if(row.ExternalFocus==cc&&val){
      var r = T.FRow?T.FRow:T.GetFirstVisible(), c = T.FCol?T.FCol:T.GetFirstCol(); 
      
      var A = T.ConvertEditFormula(r,c,val.indexOf(L.FormulaRangeSeparator)>=0?"sum("+val+")":val,1);
      if(A&&A[1]&&A[1][0]) {
         AF = A[1][0];
         var r = AF[0], c = AF[1], r2 = AF[2], c2 = AF[3], R = T.Rows, C = T.Cols;
         var lr = r ? (r+"").toUpperCase() : r, lr2 = r2 ? (r2+"").toUpperCase() : r2;
         var lc = c ? (c+"").toUpperCase() : c, lc2 = c2 ? (c2+"").toUpperCase() : c2;
         AF[4] = lr; AF[5] = lc; AF[6] = lr2; AF[7] = lc2;
         if(r&&!R[r]&&!R[lr]||r2&&!R[r2]&&!R[lr2]||c&&!C[c]&&!C[lc]||c2&&!C[c2]&&!C[lc2]) T.ShowMessage(T.GetText("ExternalFocusWait"));
         setTimeout(extfocus,10);
         }
      }
   if(ref) T.RefreshCell(row,col);
   var chgm = 0;
   MS.ColSpan;
   if(merf){
      var mm = []; 
      for(var i=0;i<mer.length;i++){
         var idx = merf.indexOf(mer[i]);
         if(idx>=0) mm[idx] = mer[i];
         }
      for(var i=0,mz=mm,mm=[];i<mz.length;i++) if(mz[i]) mm[mm.length] = mz[i]; 
      var v = [], zv = val, li = 1;
      for(var i=mm.length-1;i>0;i--){
         var sep = merf.replace(new RegExp("^.*"+ToRegExp(mm[i-1])+"|"+ToRegExp(mm[i])+".*$","g"),""), idx = -1;
         if(sep){
            if(sep.length==1) idx = val.search(new RegExp(ToRegExp(sep)+"[^"+ToRegExp(sep)+"]*$"));
            else {
               idx = val.match(new RegExp("("+ToRegExp(sep)+")"),"g");
               idx = idx ? idx.index : -1;
               }
            }
         if(idx>=0){
            v[i] = val.slice(idx+sep.length);
            val = val.slice(0,idx);
            li = i;
            }
         }      
      if(val) v[li-1] = val;
      val = null;
      
      if(Grids.OnMergeChanged) Grids.OnMergeChanged(T,row,col,zv,v);
      for(var i=0;i<mm.length;i++) if(mm[i]==cc) val = v[i]?v[i]:""; else chgm += T.SetValue(row,mm[i],v[i]?v[i]:"",1,0,1) ? 1 : 0;
      if(val==null) val = T.GetString(row,cc,4); 
      }
   ME.ColSpan;
   if(M.EditFormula&&T.FormulaAddParenthesis&&val&&(val+"").indexOf(L.FormulaPrefix)==0){
      var f = val.slice(1), loc = T.FormulaLocal ? 9 : 11;
      if(!T.ConvertEditFormula(row,col,f,loc) && T.ConvertEditFormula(row,col,f+")",loc)) val += ")";
      }
   MS.Digits;
   if(L.Digits&&M.EditFormula&&val&&(val+"").indexOf(L.FormulaPrefix)==0){
      var D = M.Digits ? M.Digits : L.Digits; D = D.split(D.charAt(0));
      for(var i=1;i<11;i++) while(val.indexOf(D[i])>=0) val = val.replace(D[i],i-1);
      }
   ME.Digits;
   
   if(serverzal) RestoreServer();
   var old = Get(row,cc), chg = 0;
   
   if(type=="Link"||type=="Img") val = T.GetValueInput(row,cc,val);
   if(Grids.OnSetInputValue) { var tmp = Grids.OnSetInputValue(T,row,cc,val); if(tmp!=null) val = tmp; }
   if(nfrm!=null) row[cc+"Format"] = nfrm;
   T.EditMode = 0; 
   if(type!="Button") chg = T.SetEditValue(row,cc,val);
   else { 
      if(Grids.OnValueChanged) { var tmp = Grids.OnValueChanged(T,row,col,val,(bt?bt:old)); if(tmp!=null) val = tmp; }
      if(val!=(bt?bt:old)) {
         
         row[cc+"ButtonText"] = val; chg = 1; T.RefreshCell(row,col); 
         }
      }
   if(chg==null&&!T.Gantt) { T.EditMode = 1; return false; }
   
   MS.ColSpan;
   if(chgm&&!chg){ 
      if(!isfilt) T.Recalculate(row,cc,true);
      MS.Upload;
      if(row.MasterRow) T.MasterGrid.UploadChanges(row.MasterRow);
      else T.UploadChanges(row);
      ME.Upload;
      chg = 1;
      }
   ME.ColSpan;   
   M.Saved = 1;
   if(T.NoWrapBR>=2&&T.DynamicStyle && ((type=="Auto"||type=="EHtml")&&val.search(/<br\s*\/?>/i)>=0||type=="Lines"&&val.indexOf("\n")>=0)){
      var wrap = T.GetAttr(row,cc,"Wrap",null,2);
      if(wrap==0||type=="Auto"&&wrap==null) T.SetAttribute(row,col,"Wrap",1,!chg,1);
      }
   if(chg) {
      if(T.ColorState&2) T.ColorRow(row); 
      if(cell) cell.className = cell.className.replace(/\s\w+HiddenValue/,""); 
      T.RefreshCellAnimate(rspn,col,"Edit",2);
      
      MS.Space; if(row.Space!=null && row.RelWidth) T.UpdateSpaceRelWidth(row); ME.Space;
      if(M.Error){ var e = T.GetAttr(row,cc,"ResultText"); row[cc+"Error"] = e ? e : T.GetAlert("Invalid"); }
      if(T.SortRow) T.SortRow(row,cc,true);
      if(Grids.OnAfterValueChanged) Grids.OnAfterValueChanged(T,row,cc,Get(row,cc));
      
      
      T.UpdateCursors();

      MS.Filter;
      if(isfilt){
         var fof = Get(row,cc+"FilterOff");   
         if(T.Paging==3 && !(T.OnePage&2) && !T.CanReload()){
            chg = false;
            T.SetValue(row,cc,old);
            T.RefreshCell(rspn,col);
            }
         else if((fof!=null && val+""==fof+"" || fof==null&&!val&&val!="0" || fof==null&&!val&&empty&&(type=="Int"||type=="Float")) && Get(row,cc+"DefaultFilter")!=0){
            if(row[cc+"Filter"]) T.SetFilterOp(row,cc,0);
            else if(T.ClearFilterSpec) T.DoFilter();
            }
         else T.DoFilter(row,cc);  
         }
      ME.Filter;   
      if(T.SaveValues) T.SaveCfg();
      }
   else {
      row[cc+"Error"] = err; 
      T.RefreshCell(rspn,col);
      T.RunAction("Same","","",row,cc);
      }
   
   MS.Undo; if(T.Undo&1 && err!=row[cc+"Error"]) T.AddUndo({Type:"Error",Row:row,Col:cc,OldVal:err,NewVal:row[cc+"Error"]},2); ME.Undo;
   
   }
   
M.OnClose = function(){
   if(!M.Saved && Grids.OnEndEdit) Grids.OnEndEdit(T,row,cc,0);
   if(T.ExternalEdit&&!M.Saved){
      if(row.ExternalEdit==cc){
         T.FRow[T.FCol] = T.ExternalEditValue;      
         T.RefreshCell(T.FRow,T.FCol);              
         }
      else if(row.Kind=="Data"){ 
         var r = T.ExternalEdit[0], c = T.ExternalEdit[1];
         r[c] = T.GetStringEdit(row,cc); r[c+"CanEdit"] = 1;
         T.RefreshCell(r,c);
         }
      }
   if(serverzal) { RestoreServer(); T.RefreshCell(rspn,col); }
   if(row.Tag&&!(T.AbsoluteCursors&2)) T.RefreshCell(row,col);
   T.EditMode = 0;
   if(inline) T.FocusCursors.firstChild.firstChild.style.zIndex = "";
   T.Edit = null; T.EnableMomentumScroll();
   
   if(!M.Saved) T.RefreshCell(row,col);
   if(updh) T.UpdateRowHeight(row,1);
   if(BTablet) { T.ARow = null; T.ClearCursors(1); T.AbsoluteCursors = 7; }
   T.UpdateCursors(1);
   M.Saved = null;
   L.GMT = gmt;
   if(clr) row[col+"Suggest"] = ""; 
   T.SetGridFocused(1);
   }
   
var I = this.Img, S = this.GetCellInnerSize(row,col,1), E = this.CellToWindow(row,col,2), hh = E.Height>S[3] ? E.Height - S[3] : 0, ww = E.Width>S[2] ? E.Width - S[2] : 0, ctr = null; 

if(this.Overlay && !row.Space && this.GetAttr(row,col,"Overlay")&1) {
   M.ParentAutoSize |= 2;
   if((this.Overlay&3)==3&&M.Align=="Center") ctr = cell.className.match(/OverflowCenterTo_(\d+)_(\d+)_([-\d]+)/);
   }
if(M.ParentAutoSize){
   var sc = this.GetScale(row,0); if(!sc) sc = 1;
   M.OnResize = function(h,w){
      var E = T.CellToWindow(row,col,2);
      
      if(E.Height<h*sc+hh) E.Height = Math.round(h*sc)+hh;
      
      if(w&&E.Width<w*sc+ww&&!row.Space) {
         var nwl = E.Width-ww, nwr = nwl;
         if(M.ParentAutoSize&2){
            var sec = T.Cols[col].MainSec, m, awl = (T.Overlay&3)==3&&M.Align=="Center" ? Math.floor(w*sc/2+Math.floor(E.Width/2-ww/2)) : sc==1 ? w : Math.round(sc*w), awr = awl;
            
            if((T.Overlay&3)!=3||M.Align!="Right"||M.Rtl){
               if(ctr) awr += ctr[3]/2;
               for(var c=T.GetNextCol(col,row);c&&nwr<awr;c=T.GetNextCol(c)) nwr += T.Cols[c].Width*sc;
               if((T.Overlay&3)==3&&M.Align=="Center"&&!M.Rtl){
                  nwl = nwr-(ctr?ctr[3]:0);
                  m = (T.GetColLeft(col)+T.Cols[col].Width)*sc-T.GetScrollLeft(sec); if(nwl>m) nwl = m;
                  E.AbsX -= nwl-E.Width+ww;
                  }
               m = T.GetScrollLeft(sec)+T.GetBodyWidth(sec)-T.GetColLeft(col)-ww; 
               if(nwr>m) nwr = m;
               if(M.Rtl) E.AbsX -= nwr-E.Width+ww;
               }
            else if((T.Overlay&3)==3&&(M.Align=="Center"||M.Align=="Right")) {
               if(ctr) awl -= ctr[3]/2;
               for(var c=T.GetPrevCol(col,row);c&&nwl<awl;c=T.GetPrevCol(c)) nwl += T.Cols[c].Width*sc;
               m = (T.GetColLeft(col)+T.Cols[col].Width)*sc-T.GetScrollLeft(sec)-ww; if(nwl>m) nwl = m;
               if(!M.Rtl||M.Align=="Center") E.AbsX -= nwl-E.Width+ww;
               }
            }
         E.Width = nwl+nwr-E.Width+ww*2;
         
         }
      
      T.UpdateCursors(1,E);
      
      return [Math.round(E.Height/sc)-hh,Math.round(E.Width-ww)/sc];
      }
   }

M.OnEnter = function(ev){ if(T.RunAction("Enter","Edit",T.GetKeyPrefix(ev),row,col)) { CancelEvent(ev); return true; } }
M.OnEsc = function(ev) { if(T.RunAction("Esc","Edit",T.GetKeyPrefix(ev),row,col)) { CancelEvent(ev); return true; } }

var mouse = this.TouchId!=null ? 2 : this.EventObject.Type==1 ? 1 : 0;
if(M.AutoSelect==null) {
   if(perc&&empty) M.AutoSelect = 2;
   else {
      var a = this["EditCursor"+["Key","Mouse","Touch","Tab"][type=="Tab"&&row.Space?3:mouse]];
      if(!a&&a!="0") a = this.EditCursor;
      if(!a&&a!="0") M.AutoSelect = this.EditSelect==null ? (perc?2:1) : this.EditSelect&(type=="Tab"&&row.Space?4:mouse?1:2) ? (perc?2:1) : 0; 
      else M.AutoSelect = a==0 ? (perc?2:1) : a==1 ? 0 : a==2 ? 3 : a==3 ? 4 : null;
      }
   }
if(Grids.Stat && Grids.StatTime<new Date()-0) { Grids.Stat++; Grids.StatTime = new Date()-0+3000; }
M.Grid = this; 
M.StyleSize = this.Img.Size;
M.CloseClickOut = 0;
this.DisableMomentumScroll();
if(cell.className.indexOf("CellOverlayImg")>=0) { cell.className += " "+this.Img.Style+"CellOverlayImgEdit"; this.UpdateCursors(1); }

M = ShowEdit(M,P);
if(!M) { this.EditMode = 0; if(BTablet) { this.ClearCursors(1); this.AbsoluteCursors = 7; } this.UpdateCursors(); return false; }
if(!M.Multi&&!M.ParentAutoSize) this.UpdateCursors(1); 
   
this.HideTip();

this.Edit = M;

var val = (M.Html?M.Tag.innerText:M.Tag.value).replace(/\r\n/g,"\n");
if(val && !M.AutoSelect){
   var sel = val.length;
   if(mouse){
      
      var A = document.createElement("div");
      A.className = "GridTmpTag";
      //.style.visibility = "visible";
      if(M.Html&&M.Tag.firstElementChild){
         A.innerHTML = "<div>"+M.Tag.innerHTML.replace(/<\/?a\s+[^>]+>/,"").replace(/\r?\n/g,"<br/>")+"</div>";
         for(var F=A.firstChild,t=F.firstChild;t;t=nt){
            var nt = t.nextSibling;
            if(t.nodeType==3&&t.data){
               for(var i=0,tt=t.data;i<tt.length;i++){ var d = document.createElement("span"); d.innerHTML = tt.charAt(i); F.insertBefore(d,t); }
               F.removeChild(t);
               }
            else if(t.firstChild){
               for(var a=t.firstChild,txt=t.style.cssText;a;a=a.nextSibling) if(a.data){
                  for(var i=0,tt=a.data;i<tt.length;i++){ var d = document.createElement("span"); d.innerHTML = tt.charAt(i); d.style.cssText = txt; F.insertBefore(d,t); }
                  }
               F.removeChild(t);
               }
            }
         }
      else A.innerHTML = "<div><span>"+val.split("").join("</span><span>").replace(/\<span\>\n\<\/span\>/g,"<br/>")+"</span></div>";
      var F = A.firstChild;
      F.className = M.Tag.className;
      F.style.textAlign = M.Tag.style.textAlign;
      F.style.width = M.Tag.style.width;
      F.style.height = M.Tag.style.height;
      this.AppendTag(A);
      var x = this.Event.X-S[0], y = this.Event.Y-S[1];
      for(var i=0,t=A.firstChild.firstChild;t&&(t.offsetLeft<x||M.Multi&&t.offsetTop+t.offsetHeight<y);t=t.nextSibling,i++);
      A.parentNode.removeChild(A);
      sel = i;
      }
   if(BTablet&&M.Html) M.ToSelect = sel;
   else SetSelection(M.Tag,sel,sel);   
   }

M.Inline = inline;

if(cell&&!inline&&(!cell.firstChild||cell.firstChild.nodeName!="TABLE")) cell.className += " "+this.Img.Style+"HiddenValue"+(row.Space?"":" "+this.Img.Style+"OverflowDisable");
if(!row.Space) this.CalculateSpaces(1);

if(M.ParentAutoSize&2&&M.EditFormula) this.UpdateCursors(1);
Grids.ActiveElement = document.activeElement;

return true;
MX.Edit;
NoModule("Edit");
ME.Edit;
}
// -----------------------------------------------------------------------------------------------------------
// Finishes or cancels editation in given cell
// For save = true saves new value, for false cancels changes
// Returns true, if value was changed, or null for error or -1 to continue editing
TGP.EndEdit = function(save,test,tmp){
MS.Edit;
var row = this.ERow, col = this.ECol;
if(!row || !col || !this.EditMode || !this.CanEdit(row,col)) return null; 
if(test) return true;
if(tmp!=null) save = tmp; 
var zal = row[col];
   
if(this.CustomEdit) {
   if(!Grids.OnCustomEndEdit){
      MS.Debug; this.Debug(1,"Defined OnCustomStartEdit, but missing OnCustomEndEdit event"); ME.Debug;
      return -1;
      }
   var val = Grids.OnCustomEndEdit(this,row,col,save,this.CustomEdit);
   this.FocusCursors.firstChild.firstChild.innerHTML = ""; 
   this.EditMode = 0;
   if(BTablet) { this.ClearCursors(1); this.AbsoluteCursors = 7; }
   this.UpdateCursors();
   if(save) this.FinishEdit(row,col,val);
   }
else if(this.Edit){
   if(save) this.Edit.Save();
   else this.Edit.Cancel();
   if(this.EditMode) { try { if(this.Edit) this.Edit.Tag.focus(); this.Edit.Tag.select(); } catch(e) { } }
   }
else if(this.Dialog){
   this.CloseDialog();
   }   
if(this.EditMode) return -1; 
if(!row.Space) this.CalculateSpaces(1);
return zal!==row[col];
ME.Edit;
}
// -----------------------------------------------------------------------------------------------------------
TGP.EndEditAll = function(){
MS.Edit;
if(this.EditMode && this.EndEdit(1)==-1) return false;
for(var i=0;i<Grids.length;i++){
   var G = Grids[i];
   if(G && G.EditMode && G.EndEdit(1)==-1) return false;
   }
ME.Edit;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.FinishEdit = function(row,col,val,foff){
MS.Edit;
var cc = col,chg = 0;
MS.ColSpan;
cc = this.GetMergeEditCol(row,col);
ME.ColSpan;
if(val-0+""==val) val-=0; 


MS.Filter; if(foff>0 && row.Kind=="Filter" && !row[col+"Filter"]) return; ME.Filter; 
var err = row[cc+"Error"]; row[cc+"Error"] = ""; if(!err) err = "";
var chg = this.SetEditValue(row,cc,val);
if(chg){
   if(this.SaveValues) this.SaveCfg();
   if(this.SortRow) this.SortRow(row,cc,true);
   if(Grids.OnAfterValueChanged) Grids.OnAfterValueChanged(this,row,cc,Get(row,cc));
   
   if(this.Cleared || this.Loading || this.Rendering) return; 
   if(this.ColorState&2) this.ColorRow(row);
   this.RefreshCellAnimate(row,col,"Edit",2);
   this.RefreshEnum(row,cc,"Edit",1);
   
   this.UpdateCursors();
   
   chg = 1;
   }
else {
   if(err&&!row[cc+"Error"]) row[cc+"Error"] = err;
   this.RunAction("Same","","",row,col);
   }
MS.Undo; if(this.Undo&1 && err!=row[cc+"Error"]) this.AddUndo({Type:"Error",Row:row,Col:cc,OldVal:err,NewVal:row[cc+"Error"]},2); ME.Undo;
if(Grids.Stat && Grids.StatTime<new Date()-0) { Grids.Stat++; Grids.StatTime = new Date()-0+3000; }
MS.Filter;
if(row.Kind=="Filter"){
   if(foff&&foff!=-2){ if(row[col+"Filter"]&&foff!=-1) this.SetFilterOp(row,col,0); }
   else if(chg||foff==-2) { 
      this.UpdateRelatedFilter(row,col); 
      if(this.Paging!=3 || this.OnePage&2 || this.CanReload()) this.DoFilter(row,col); 
      }
   }
ME.Filter; 
ME.Edit;   
}
// -----------------------------------------------------------------------------------------------------------
MS.Edit;
TGP.ActionStartEdit = function(dummy,T){ return this.StartEdit(null,null,null,T); }
TGP.ActionStartEditEmpty = function(dummy,T){ return this.StartEdit(null,null,1,T); }
TGP.ActionStartEditCell = function(dummy,T){ return this.StartEdit(this.ARow,this.ACol,null,T); }
TGP.ActionStartEditCellEmpty = function(dummy,T){ return this.StartEdit(this.ARow,this.ACol,1,T); }
TGP.ActionStartEditCellAccept = function(dummy,T,empty){ 
   if(this.EditMode){
      var same = this.ARow==this.ERow && this.ACol==this.ECol;
      var ret = this.EndEdit(1,T);
      if(ret==-1) return false;
      if(same) return T ? !!ret : ret != null;
      if(T){ this.EditMode = 0; ret = this.StartEdit(this.ARow,this.ACol,null,T); this.EditMode = 1; return ret; }
      }
   return this.StartEdit(this.ARow,this.ACol,empty,T); 
   }
TGP.ActionStartEditCellEmptyAccept = function(F,T){ return this.ActionStartEditCellAccept(F,T); }
TGP.ActionCancelEdit = function(dummy,T){ var ret = this.EndEdit(0,T); return T ? !!ret : ret!=null; }
TGP.ActionAcceptEdit = function(dummy,T){ var ret = this.EndEdit(1,T); return T ? !!ret : ret != null && ret != -1; }
ME.Edit;
// -----------------------------------------------------------------------------------------------------------
TGP.SetStringEdit = function(row,col,val,timeout){
var T = this;
function Set(){ 
   var erow = null, ecol = null;
   if(T.EditMode){ erow = T.ERow; ecol = T.ECol; T.EndEdit(); } 
   T.StartEdit(row,col); if(!T.Edit) return false;
   if(T.Edit.Html) T.Edit.Tag.innerHTML = val;
   else T.Edit.Tag.value = val;
   T.EndEdit(1);
   
   if(erow) T.StartEdit(erow,ecol,ecol=="FOCUS"); 
   return true;
   }
if(!timeout&&timeout!=null) return Set();
else setTimeout(Set,10);
}
// -----------------------------------------------------------------------------------------------------------
TGP.MoveExternalEdit = function(dummyrow,dummycol,orow,ocol){
if(!this.Edit||!orow) return;

var oval = this.Edit.Tag.innerHTML;     
var ee = this.ExternalEdit; this.ExternalEdit = null;
this.EndEdit();                         
this.ExternalEdit = ee;
orow[ocol] = this.ExternalEditValue;    
this.SetStringEdit(orow,ocol,oval);     

}
// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------
// Returns cell value, for date returns count of milliseconds
TGP.GetValue = function(row,col){
var val = Get(row,col), type = this.GetType(row,col);
switch(type){
   case "Int" :
   case "Float" :
   case "Date" : 
      if(!val) return val=="0" ? 0 : "";
      if(typeof(val)=="string" && this.IsRange(row,col)) return val;
      return val-0;
   case "Bool" :
      if(val==null || val==="" && this.GetAttr(row,col,"CanEmpty")) return "";
      return val ? val-0 : 0;
   case "Radio" :
   case "Enum" :
      MS.Enum;
      return val-0+""==val?val-0:val;
      ME.Enum;
   
   default : return val==null?"" : val;
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetStringEdit = function(row,col){
if(this.FormulaEditing&&(!this.Locked["formula"]||this.CanEdit(row,col)||this.GetAttr(row,col,"FormulaCanEdit",1,1)==2)){
   var f = row[col+"EFormula"]; if(f==null&&row.Def) f = row.Def[col+"EFormula"];
   if(f) return this.Locked["formula"]&&this.GetAttr(row,col,"FormulaCanEdit",1,1)!=2 ? "" : this.Lang.Format.FormulaPrefix + (this.FormulaLocal ? f : this.ConvertEditFormula(row,col,f,0));
   }
return this.GetString(row,col,4);
}
// -----------------------------------------------------------------------------------------------------------
// Returns cell value as string, in standard (not edited) format

TGP.GetString = function(row,col,option){
var type = this.GetType(row,col), Value = Get(row,col), L = this.Lang.Format;
if(option==7) option = type=="Pass" ? 0 : 4;
switch(type){
   case "Auto":
      var frm = this.GetFormat(row,col,option==4||option==1); if(!frm&&(option==4||option==1)) frm = this.GetFormat(row,col,0);
      if(!Value&&Value!="0") return this.GetAttr(row,col,"EmptyValue")+"";
      if(!(Value-0)&&Value!="0"||frm=="@") return Value+"";
      if(frm&&L.IsDate(frm)) return L.DateToString(Value,frm,this.IsRange(row,col),0,1,1);
      return L.NumberToString(Value,frm,this.IsRange(row,col),1);
   case "Text" : 
   case "Lines": 
      var frm = this.GetFormat(row,col,option==4||option==1);
      return L.FormatString(Value,frm,option==5,frm&&this.IsRange(row,col));
   case "Int": 
   case "Float": 
      if(!Value&&Value!="0"){
         Value = this.GetAttr(row,col,"EmptyValue")+"";
         L.EmptyNumber = Value;   
         return Value;
         }
      return L.NumberToString(Value,this.GetFormat(row,col,option==4||option==1?type:0),this.IsRange(row,col),option==4||option==1);
   case "Date": 
      if(!Value&&Value!="0"){
         Value = this.GetAttr(row,col,"EmptyValue")+"";
         L.EmptyDate = Value;   
         return Value;
         }
      var frm = this.GetFormat(row,col,option==4||option==1?"Date":0);
      return  L.DateToString(Value,frm,this.IsRange(row,col),0,0,option==4||option==1);      
   case "Bool": return !Value ? "0" : "1";
   case "Radio" :
   case "Enum": 
      MS.Enum; 
      if(option!=6) return this.GetEnumString(row,col,0); 
      var rp = this.GetRelatedPrefix(row,col);
      var ek = this.GetEnum(row,col,"EnumKeys",rp);
      if(ek) { ek = ek.slice(1).split(ek.charAt(0)); for(var i=0;i<ek.length;i++) if(ek[i]==Value) return i; }
      var en = this.GetEnum(row,col,"Enum",rp);
      if(en) { en = en.slice(1).split(en.charAt(0)); for(var i=0;i<en.length;i++) if(en[i]==Value) return i; }
      return Value;
      ME.Enum;
   
   case "Pass":   
      return option ? "" : Value+""; 
   case "Link": 
      MS.Img;
      if(Value=="") return "";
      if(!option) return Value; 
      if(option==1||option==4) return this.GetLinkValue(row,col,Value,type)[0];
      Value = (Value+"").split((Value+"").charAt(0));
      return Value[2]!=null ? Value[2] : (Value[1]!=null?Value[1]:""); 
      ME.Img;
   case "Img":
      MS.Img;
      if(!option) return Value; 
      if(option==1||option==4) return this.GetLinkValue(row,col,Value,type)[0];
      Value = (Value+"").split((Value+"").charAt(0));
      return Value[6]!=null?Value[6] : (Value[1]!=null?Value[1]:"");   
      ME.Img;
   case "Icon":
      return Value+"";
   case "Html":   
   case "EHtml":
      var frm = this.GetFormat(row,col,option==4||option==1);
      if(frm&&frm.charCodeAt(0)==123) return L.FormatString(Value,frm,option==5,frm&&this.IsRange(row,col));
      
      return Value+"";
   case "Abs":
   case "Gantt":
      return Value+""; 
   case "List":  
      
      return Value+"";
   default: return ""; 
   }
}
// -----------------------------------------------------------------------------------------------------------
MS.Img;
TGP.GetLinkValue = function(row,col,Value,type,format){
if(Value==null) Value = Get(row,col); 
if(format==null) format = this.GetFormat(row,col,1);
if(type==null) type = this.GetType(row,col);
if(!Value) Value = '|';
else Value+="";
Value = Value.split(Value.charAt(0));
if(!format) format="|0|1";
var f = format.split(format.charAt(0));
var val = "", mask = "^";
   
if(type=="Link"){
   for(var i=1;i<4;i++) if(!Value[i]) Value[i]="";
   if(f[2]-0){ 
      if(f[3]-0){ var u = this.GetAlert("LinkUrl"); val += u+": "; mask += ToRegExp(u)+"\\: "; }
      val += Value[1]; mask+=".*";
      }
   if(f[3]-0) { 
      if(f[2]-0){
         if(f[1]-0==2){ val += "\n"; mask += "\\r?\\n"; }
         else { val += "; "; mask += "; "; }
         var u = this.GetAlert("LinkText");
         val += u+": "; mask += ToRegExp(u)+"\\: ";
         }
      val += Value[2]; mask += ".*";
      }
   mask+="$";
   }
else { 
   for(var i=1;i<7;i++) if(!Value[i]) Value[i]="";
   if(f[2]-0){ 
      if(f[3]-0 || f[4]-0) { var u = this.GetAlert("ImgSrc"); val += u+": "; mask += ToRegExp(u)+": "; }
      val += Value[1].indexOf("data:")>=0 ? this.GetAlert("ImgData") : Value[1]; mask += ".*";
      }
   if(f[3]-0) { 
      var w = this.GetAlert("ImgWidth"), h = this.GetAlert("ImgHeight"), x = this.GetAlert("ImgX"), y = this.GetAlert("ImgY");
      var v = w+":"+Value[2]+","+h+":"+Value[3]+"; "+x+":"+Value[4]+","+y+":"+Value[5];
      var m = ToRegExp(w)+"\\:\\d{0,3},"+ToRegExp(h)+"\\:\\d{0,3};\\s"+ToRegExp(x)+"\\:\\d{0,4},"+ToRegExp(y)+"\\:\\d{0,4}";
      if(f[2]-0 && f[1]-0==2){ val += "\n"+v; mask += "\\r?\\n"+m; }
      else { val += " ["+v+"]"; mask += " \\["+m+"]"; }
      }
   if(f[4]-0) { 
      if(mask.length>1){ 
         if(f[1]-0==2) { val += "\n"; mask += "\\r?\\n"; }
         else { val += "; "; mask += "; "; }
         }
      var u = this.GetAlert("ImgUrl");
      val += u+": "+Value[6];
      mask += ToRegExp(u)+": .*";
      }
   mask+="$";
   }   
return [val,mask,f[1]-0?1:0];
}
ME.Img;
// -----------------------------------------------------------------------------------------------------------
// Returns cell value with MergeFormat
MS.ColSpan;
TGP.GetMergeValue = function(row,col,mer,val,typ,edit){
var v = [], vr = []; 
for(var m=0;m<mer.length;m++) { 
   v[m] = edit ? this.GetString(row,mer[m],4) : this.GetRowHTML(row,null,9,mer[m]); 
   var vv = Get(row,mer[m]); if(!vv && vv!='0' && !edit) vv = this.GetAttr(row,mer[m],"EmptyValue");
   vr[m] = vv;
   }
for(var m=0,vm="";m<mer.length;m++) if(vr[m]) vm += mer[m];
vm = Get(row,col+name+(vm?vm:"Empty")); if(vm!=null) val = vm;
for(var m=0;m<mer.length;m++) { val = val.replace(mer[m],"\u007F"+mer[m]+"\u007F"); }
if(typ&4) for(var m=0;m<mer.length;m++) if(!vr[m]) val = val.replace(new RegExp(mer[m+1]?"\u007F"+ToRegExp(mer[m])+"\u007F[^\u007F]*":"[^\u007F]*\u007F"+ToRegExp(mer[m])+"\u007F"),"");
for(var m=0;m<mer.length;m++) val = val.replace("\u007F"+mer[m]+"\u007F",v[m]);
return val;
}
ME.ColSpan;
// -----------------------------------------------------------------------------------------------------------
// Sets string to cell value in standard (not edited format), converts it to cell type and returns it converted back to string
// Not used in code, only for API
TGP.SetString = function(row,col,val,refresh,master,noupload,nocopyto,noid,nochg){
var type = this.GetType(row,col), L = this.Lang.Format, v = val;
if(type=="Date"){
   MS.Date;
   if(!val) { if(val!="0") v = this.GetAttr(row,col,"CanEmpty")!="0" || this.IsRange(row,col) ? "" : 0; }
   else if((val-0)+""!=val){ 
      v = Date.parse(val + (L.GMT-0?" GMT":""));
      if(isNaN(v) || (BOpera8 || BOpera) && this.IsRange(row,col)){ 
         if(this.IsRange(row,col)){
            MS.Range; val = this.ConvertDate(val); ME.Range;
            if(val) v = (val-0)+""==val ? val-0 : val;
            }
          else v = L.Hirji&2 ? L.StringToDateHirji(val) : L.StringToDateEng(val);
         }
      else if(this.ExcelDates) v = (v+2209161600000)/86400000;
      }
   ME.Date;
   }
else if(type=="Float" || type=="Int") {
   if(!val){ if(val!="0") v = (row.Kind=="Filter" ? this.GetAttr(row,col,"CanEmpty")!="0" : this.GetAttr(row,col,"CanEmpty")==1) || this.IsRange(row,col) ? "" : 0; }
   else if(typeof(val)=="string" && ((val-0)+""==val || !this.IsRange(row,col))) v -= 0;
   }
this.SetValue(row,col,v,refresh,master,noupload,nocopyto,noid,nochg);
return this.GetString(row,col);
}
// -----------------------------------------------------------------------------------------------------------
TGP.SortRange = function(val){
val = (val+"").split(this.Lang.Format.ValueSeparator);
val.sort();
return val.join(this.Lang.Format.ValueSeparator);
}

// -----------------------------------------------------------------------------------------------------------
// Sets value to data, value must have the same type as cell
// Returns true, if value has changed
TGP.SetValue = function(row,col,Value,refresh,master,noupload,nocopyto,noid,nochg,always,updh,CP){

var val = Get(row,col), id = row.id; 
if(this.GetAttr(row,col,"CaseSensitiveValues")==0) {
   if(typeof(Value)=="string") Value = Value.toLocaleLowerCase();
   if(typeof(val)=="string") val = val.toLocaleLowerCase();
   }
if(this.SortRanges && Value && this.IsRange(row,col)) Value = this.SortRange(Value);
if(Value==val && (Value+""==val+"" || Value===val) && (Value || isNaN(Value) || !isNaN(row[col]) || row[col]==null) || !Value&&!val&&isNaN(Value)&&isNaN(val)){ 
   if(refresh==2||always&&refresh) { 
      if(typeof(refresh)=="string") this.RefreshCellAnimate(row,col,refresh,updh); 
      else this.RefreshCell(row,col); 
      if(this.ColorState&2) this.ColorRow(row); 
      }
   return false; 
   }
if(this.Undo) this.UndoStart();
var rchg = row.Changed;
if(!row.CPage && !nochg){
   nochg = this.GetAttr(row,col,"NoChanged");
   if(this.StoreOriginalValues && !nochg && !row[col+"Changed"]) {
      if(this.SortRanges==2 && val && this.IsRange(row,col)) val = this.SortRange(val);
      row[col+"Orig"] = val;
      }
   if(row.Kind!="Filter"){
      var upl = !Is(row,"NoUpload"), und = Is(row,col+"Undo");
      if((upl&&!nochg&&und!="0"||(!upl||nochg)&&und-0) && !this.MasterGrid) this.AddUndo({ Type:"Change",Row:row,Col:col,OldVal:val,NewVal:Value,RowChanged:row.Changed,CellChanged:row[col+"Changed"]});
      if(this.SaveOrder && upl&&!nochg) this.SetChange({ Row:row.id,Col:col,Val:Value });
      }
   else if(this.Undo&16) this.AddUndo({ Type:"Filter",Row:row,Col:col,OldVal:val,NewVal:Value});
   if(!nochg){
      row.Changed = 1;
      row[col+"Changed"] = 1;
      }
   }

MS.Pivot;
if(this.PivotGrid && !master) this.SetPivotValue(row,col,Value);
if(this.PivotDetail && !master){
   for(var id in this.PivotDetail){
      var G = this.PivotDetail[id];
      if(G && !G.Loading && !G.Cleared && !G.Rendering) G.SetPivotDetailValue(row,col,Value);
      }
   }
ME.Pivot;

row[col] = Value-0+""==Value ? Value-0 : Value;

MS.Master;
if(master!=1 && row.MasterRow){ 
   this.MasterGrid.SetValue(row.MasterRow,col,Value,1,row,noupload,0,null,nochg);
   nocopyto = 1;
   }
if(row.DetailRow){ 
   for(var i=0;i<row.DetailRow.length;i++) {
      if(row.DetailRow[i]!=master && !row.DetailRow[i].Page) row.DetailGrid[i].SetValue(row.DetailRow[i],col,Value,1,1,noupload,1,null,nochg); 
      }
   }
ME.Master;

MS.Master;
var cp = Get(row,col+"CopyTo");
if(cp && !nocopyto){
   if(!CP) CP = {}; 
   CP[row.id+"$"+col] = 1;
   cp = cp.split(',');
   for(var i=0;i<cp.length;i+=2){
      var r = null;
      if(cp[i]=="Parent") r = row.Fixed||row.parentNode.Page ? null : row.parentNode;
      else if(cp[i]=="Next") r = row.nextSibling;
      else if(cp[i]=="Prev") r = row.previousSibling;
      else if(this.Rows[cp[i]]) r = this.Rows[cp[i]];
      else {
         var s = cp[i].split('_'), p = null;
         if(s[0]=="Child") p = row;
         else if(s[0]=="Sibling") p = row.parentNode;
         else if(s[0]=="Children"){
            var T = this; function SetCh(row,col,def){
               for(var r=row.firstChild;r;r=r.nextSibling) if((!def || r.Def.Name==def) && !CP[r.id+"$"+col]){ 
                  T.SetValue(r,col,Value,1,0,noupload,null,null,nochg,null,null,CP);
                  if(T.RefreshEnum) T.RefreshEnum(r,col);
                  }
               }
            if(!row.firstChild && this.ChildPaging==3 && row.State==0){ 
               var ccol = cp[i+1], cdef = s[1];
               this.DownloadPage(row,function(result){
                  T.PageLoaded(result,row);
                  if(result>=0) SetCh(row,ccol,cdef);
                  });
               continue;
               }
            SetCh(row,cp[i+1],s[1]);
            continue; 
            }
         if(p){
            if(s[1]-0+""==s[1]) r = GetNode(p,s[1]);
            else for(var r=p.firstChild;r;r=r.nextSibling) if(r.Def.Name==s[1]) break;
            }
         else r = this.GetRowById(cp[i]);
         }
      if(r && !CP[r.id+"$"+cp[i+1]]){ 
         this.SetValue(r,cp[i+1],Value,1,0,noupload,null,null,nochg,null,null,CP);
         if(this.RefreshEnum) this.RefreshEnum(r,cp[i+1]);
         }
      }
   }
ME.Master;

MS.Group;
MS.Tree;
if(row.Def.Group && col==this.MainCol){ 
   var T = this, gc = this.GetGroupCol(row), gp = row.GroupPos, ch = gp!=null?this.Cols[gc].GroupChar:null;
   
   function SetGroupValue(row){ 
      for(var r=row.firstChild;r;r=r.nextSibling){
         if(r.Def && r.Def.Group) SetGroupValue(r);
         else {
            var v = Value;
            if(gp!=null){
               v = Get(r,gc);
               if(v) { v = v.split(ch); v[gp] = Value; v = v.join(ch); }
               else v = Value;
               }
            T.SetValue(r,gc,v,1,0,noupload,null,null,nochg);
            }
         }
      }
   SetGroupValue(row);
   if(this.AutoUpdate){ 
      row.Changed = null;
      row[col+"Changed"] = null;
      }
   }
ME.Tree;
ME.Group;

MS.Cfg;
if(this.SaveAttrs) this.SaveAttrsCfg(row,col);
ME.Cfg;

MS.CPages;
var fr = row.firstChild;
if(fr && fr.CPage){
   for(;fr;fr=fr.nextSibling) this.SetValue(fr,col,Value,1,1,noupload,null,null,nochg); 
   }
ME.CPages;

if(!noupload && !nochg) this.DoAction(row,col);
this.RunAction("Change","","",row,col);

if(this.StoreOriginalValues && !nochg){  
   var oval = row[col+"Orig"];
   
   if(Value==oval && (Value&&Value+""==oval+"" || Value===oval)) { 
      row[col+"Changed"] = null;
      var ch = 0;
      for(var cc in this.Cols) if(row[cc+"Changed"]){ ch = 1; break; }
      if(!ch) row.Changed = null;
      }
   }


 
if(this.IdTypes && this.IdTypes[col] && !noid) this.SetIdUnique(row);
if(row.Kind!="Filter" && noupload!=1) this.Recalculate(row,col,true);

MS.Upload;
if(!master && !noupload) { 
   if(row.MasterRow) this.MasterGrid.UploadChanges(row.MasterRow);
   else this.UploadChanges(row);
   }
ME.Upload;

MS.Space;
if(row.Space && Get(row,col+"Width")==-2) {
   var cell = this.GetCell(row,col);
   if(cell) {
      if(cell.lastChild && cell.lastChild.nodeType==1) cell = cell.lastChild;
      var w = cell.offsetWidth, s = GetStyle(cell);
      if(s&&w) row[col+"Width"] = w-GetBorderWidth(s);
      }
   }
ME.Space;

MS.Chart; if(this.Charts) this.UpdateCharts(row,col); ME.Chart;

if(refresh) { 
   this.WaitForCtrC = 0; 
   if(typeof(refresh)=="string") this.RefreshCellAnimate(row,col,refresh,updh); 
   else this.RefreshCell(row,col); 
   if(this.ColorState&2 && rchg!=row.Changed) this.ColorRow(row); 
   }
if(this.Undo) this.UndoEnd();
return true;
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------
// Functions for generating output XML
// -----------------------------------------------------------------------------------------------------------
var CRowAttrs = { HasIndex:1, Level:1, LevelImg:1, Hasch:1, State:1, Focused:1, CalcOrderAuto:1, Filtered:1, ExpandCol:1 } 

// -----------------------------------------------------------------------------------------------------------
TGP.GetUploadFormat = function(src){
var f = src.Format.toLowerCase(), F = { };
F.Dtd = f=="dtd"; F.Json = f=="json"; 
F.Json2 = f=="json"; 
F.Sep = F.Json ? "\":" : "="; F.Spc = F.Json ? ",\"" : " "; F.Spc1 = F.Json?"\"":" "; F.One = F.Json ? "\":1" : "=\"1\"";
F.Str = F.Json ? (src.Xml==2?StringToJsonX:StringToJson) : StringToXml;
F.Start = F.Json ? "{\"id\":\"" : "<I id=\""; F.End = F.Json ? "}," : "/>";
return F;
}
// -----------------------------------------------------------------------------------------------------------
// Returns next not deleted row
MS.Cfg$Upload;
TGP.NextChanges = function(row){
var r = row.nextSibling;
while(r && r.Deleted) r = r.nextSibling;
return r;
}
ME.Cfg$Upload;
// -----------------------------------------------------------------------------------------------------------
// Returns previous not deleted row
MS.Cfg$Upload;
TGP.PrevChanges = function(row){
var r = row.previousSibling;
while(r && r.Deleted) r = r.previousSibling;
return r;
}
ME.Cfg$Upload;
// -----------------------------------------------------------------------------------------------------------
// Returns string with row changes for cookies
MS.Cfg;
TGP.GetRowChangesCfg = function(row){
var S = "", C = this.Cols;
if(row.Deleted) S = "D";
else if(row.Added){
   var def = row.Def, par = row.parentNode, next = this.NextChanges(row), prev = this.PrevChanges(row), ppar = Get(row,"Par");
   S = "A&"+(ppar?ppar:"")+"&"+def.Name+"&" + (par.id ? par.id : par.Pos!=null ? par.Pos : "") + "&" + (next && next.id ? next.id : "") + "&"+(row.Copy?row.Copy:"");
   for(var c in C){
      if(row[c]!=null && row[c]!=def[c] && (!C[c].Formula && (!row.Calculated || !row[c+"Formula"])||this.CalculateChanges) && typeof(row[c])!="function"){ 
         S += "&"+c+"&"+escape(row[c]);
         }
      }
   }
else if(row.Changed || row.Moved){
   if(row.Changed) S = "C";
   if(row.Moved){ 
      var par = row.parentNode, next = this.NextChanges(row), prev = this.PrevChanges(row);
      S = "M&"+row.Moved+"&" + (par.id ? par.id : par.Pos!=null ? par.Pos : "") + "&" + (next && next.id ? next.id : "") + "'";
      }
   if(row.Changed){ 
      if(row.Cells) {
         for(var i=0;i<row.Cells.length;i++) if(row[row.Cells[i]+"Changed"]) S += "&"+c+"&"+escape(row[row.Cells[i]]);
         }
      else { 
         for(var c in C) if(row[c+"Changed"]) S += "&"+c+"&"+escape(row[c]);
         }
      }
   }
return S;
}
ME.Cfg;
// -----------------------------------------------------------------------------------------------------------
// Converts value date according to DateStrings
TGP.ConvertUpload = function(row,col,val,fed){
MS.Date;
if(this.DateStrings && this.GetType(row,col)=="Date"){ 
   if(!val&&val!="0") return ""; 
   MS.Hirji;
   var hir = this.Lang.Format.Hirji;
   if(hir){
      if(hir==1) this.Lang.Format.Hirji = 0;
      if(hir==2) this.Lang.Format.Hirji = 1;
      }
   ME.Hirji;      
   var D = this.Lang.Format.DateToString(val,this.DateStrings==2?"yyyy-MM-dd HH:mm:ss":(this.DateStrings==1?null:this.DateStrings),this.IsRange(row,col));
   MS.Hirji;
   if(hir) this.Lang.Format.Hirji = hir;
   ME.Hirji;
   return D;
   }
ME.Date;
if(fed==1 && row[col+"EFormula"]) {
   val = this.Lang.Format.FormulaPrefix+row[col+"EFormula"];
   if(this.FormulaRelative==2) val = this.ConvertEditFormula(row,col,val,this.FormulaLocal ? 6 : 4);
   }
return val;
}

// -----------------------------------------------------------------------------------------------------------
MS.Upload;
// -----------------------------------------------------------------------------------------------------------
// Returns string with row changes
// F is object with format settings
// type = &1 - changes, &2 - selected, &4 - resized
// For alldef&1 returns for added rows also values from defaults
// For alldef&2 returns also calculated values
TGP.GetRowChanges = function(row,F,type,alldef,attrs){
if(Is(row,"NoUpload") && !(alldef&32)) return "";
var S = "", C = this.Cols, T = this, X = { id:1,Added:1,Deleted:1,Changed:1,Moved:1,Parent:1,Next:1,Prev:1,Par:1,Selected:1,Copy:1,Resized:1,Height:1 }, fed = alldef&16 ? 0 : this.FormulaEditing;
function SetAttr(row,c){ 
   if(X[c]) return;
   X[c] = 1;
   var v = alldef&1 ? Get(row,c) : row[c]; 
   if(v==null) v = "";
   v = T.ConvertUpload(row,c,v,fed);
   if(F.Dtd) S += "<U N=\""+c+"\" V=\""+F.Str(v)+"\"/>";
   else S += F.Spc+c+F.Sep+"\""+F.Str(v)+"\"";
   }

function GetAttrs(row){
   if(!attrs) return "";
   var S = "";
   for(var i=0;i<attrs.length;i++){
      var c = attrs[i], v = alldef&1 ? Get(row,c) : row[c]; 
      if(v==null || X[c]) continue;
      if(typeof(v)=="object"){ if(c=="Def") v = v.Name; else continue; }
      X[c] = 1;
      if(T.FormulaEditing==2 && T.FormulaRelative==2){
         var idx = c.indexOf("EFormula");
         if(idx>=0 && C[c.slice(0,idx)]) v = T.ConvertEditFormula(row,c.slice(0,idx),v,T.FormulaLocal ? 6 : 4);
         }
      S += F.Spc+c+F.Sep+"\""+F.Str(v)+"\"";
      }
   return S;   
   }   

function SetSpan(r){
   if(r.Spanned) for(var col in C) if((r[col+"Span"]>1||r[col+"SpanOrig"]>1) && r[col+"Span"]!=r[col+"SpanOrig"] && r[col+"RowSpan"]!=0 && r[col+"Visible"]!=-2) SetAttr(r,col+"Span");
   if(r.RowSpan) for(var col in T.SpanCols) if((r[col+"RowSpan"]>1||r[col+"RowSpanOrig"]>1) && r[col+"RowSpan"]!=r[col+"RowSpanOrig"] && r[col+"Span"]!=0) SetAttr(r,col+"RowSpan");
   }

if(row.Deleted) {
   S = F.Start+F.Str(row.id)+"\""+F.Spc+"Deleted"+F.One+(row.Added?F.Spc+"Added"+F.One:"")+GetAttrs(row);
   if(F.Dtd) S += ">";
   if(alldef&2) for(var c in C) if(!C[c].NoUpload) SetAttr(row,c);
   S += F.Dtd ? "</I>" : F.End;
   }
else if(row.Added || row.Moved==2&&alldef&8){
   var def = row.Def, par = row.parentNode, next = this.NextChanges(row), prev = this.PrevChanges(row), ppar = Get(row,"Par");
   S = F.Start+F.Str(row.id)+"\""+F.Spc+(row.Added?"Added"+F.One:"Moved"+F.Sep+"\""+row.Moved+"\"")+(ppar?F.Spc+"Par"+F.Sep+"\""+ppar+"\"":"")+F.Spc+"Def"+F.Sep+"\""+def.Name
     + "\""+F.Spc+"Parent"+F.Sep+"\"" + (par.id ? F.Str(par.id) : par.Pos!=null ? par.Pos : "") 
     + "\""+F.Spc+"Next"+F.Sep+"\"" + (next && next.id ? F.Str(next.id) : "")
     + "\""+F.Spc+"Prev"+F.Sep+"\"" + (prev && prev.id ? F.Str(prev.id) : "")
     + "\"";
   if(type&2 && row.Selected) S += F.Spc+"Selected"+F.Sep+"\""+row.Selected+"\"";
   if(type&4 && row.Resized) S += F.Spc+"Height"+F.Sep+"\""+row.Height+"\"";
   if(row.Copy) S += F.Spc+"Copy"+F.Sep+"\""+row.Copy+"\"";
   X.Def = 1;
   S += GetAttrs(row);
   if(F.Dtd) S += ">";
   
   MS.GenId;
   if(this.IdMore){
      for(var i=0;i<this.IdMore;i++){
         var n = this.IdNames[i];
         if(row[n]==null) row[n]=def[n];
         if(n!="Def") SetAttr(row,n);
         }
      }
   ME.GenId;
   if(type&2 && row.Selected&2) { for(var c in C) if(row[c+"Selected"]) SetAttr(row,c+"Selected"); }
   for(var c in C){
      if(!C[c].NoUpload && (alldef&2 || (alldef&1 || row[c]!=null && (row[c]!=def[c]||!def[c])) && !this.IdTypes[c] && (!C[c].Formula && (!row.Calculated || !row[c+"Formula"]) || this.CalculatedChanges&&(this.CalculatedChanges-0||this.CalculatedChanges[c])))){
         SetAttr(row,c);
         }
      }
   if(this.SaveSpan) SetSpan(row);
   S += F.Dtd ? "</I>" : F.End;
   }
else if(row.Changed || row.Moved){
   S = F.Start+F.Str(row.id)+"\"";
   MS.GenId;
   var CH = null;
   if(alldef&4 && this.IdMore) {
      CH = this.UpdateNewId(row,"NewId",0,row.Changed,row.Moved); 
      if(row.NewId) S += F.Spc+"NewId"+F.Sep+"\""+row.NewId+"\"";
      }
   ME.GenId;
   if(row.Changed) S += F.Spc+"Changed"+F.One;
   if(row.Moved){ 
      var par = row.parentNode, next = this.NextChanges(row), prev = this.PrevChanges(row);
      S += F.Spc+"Moved"+F.Sep+"\""+row.Moved+"\""+F.Spc+"Parent"+F.Sep+"\"" 
        + (par.id ? F.Str(par.id) : par.Pos!=null ? par.Pos : "") 
        + "\""+F.Spc+"Next"+F.Sep+"\"" + (next && next.id ? F.Str(next.id) : "") 
        + "\""+F.Spc+"Prev"+F.Sep+"\"" + (prev && prev.id ? F.Str(prev.id) : "")
        + "\"";
      }
   if(type&2 && row.Selected) S += F.Spc+"Selected"+F.Sep+"\""+row.Selected+"\"";
   if(type&4 && row.Resized) S += F.Spc+"Height"+F.Sep+"\""+row.Height+"\"";
   S += GetAttrs(row);
   if(F.Dtd) S += ">";
   if(type&2 && row.Selected&2) { for(var c in C) if(row[c+"Selected"]) SetAttr(row,c+"Selected"); }
   if(row.Changed || alldef&2){ 
      if(row.Cells) {
         for(var i=0;i<row.Cells.length;i++) if(row[row.Cells[i]+"Changed"] || alldef&2) SetAttr(row,row.Cells[i]);
         }
      else { 
         for(var c in C) if(row[c+"Changed"] || alldef&2 && !C[c].NoUpload) SetAttr(row,c);
         }
      }
   if(this.IdMore && row[this.IdCol+"Changed"] && !this.Cols[this.IdCol]) SetAttr(row,this.IdCol);
   if(this.SaveSpan) SetSpan(row);
   S += F.Dtd ? "</I>" : F.End;
   MS.GenId; if(CH) for(var id in CH) S += F.Start+F.Str(id)+"\""+F.Spc+"NewId"+F.Sep+"\""+CH[id]+"\""+F.End; ME.GenId; 
   }
else if(type&2 && row.Selected || type&4 && row.Resized) {
   S = F.Start+F.Str(row.id)+"\"";
   if(type&2 && row.Selected) S += F.Spc+"Selected"+F.Sep+"\""+row.Selected+"\"";
   if(type&4 && row.Resized) S += F.Spc+"Height"+F.Sep+"\""+row.Height+"\"";
   S += GetAttrs(row);
   if(F.Dtd) S += ">";
   if(type&2 && row.Selected&2) { for(var c in C) if(row[c+"Selected"]) SetAttr(row,c+"Selected"); }
   if(alldef&2) for(var c in C) if(!C[c].NoUpload) SetAttr(row,c);
   if(this.SaveSpan) SetSpan(row);
   S += F.Dtd ? "</I>" : F.End;
   }
else if(this.SaveSpan) {
   SetSpan(row);
   if(S) S = F.Start + F.Str(row.id) + "\"" + F.Spc + "Changed" + F.One + (F.Dtd?">":"") + S + (F.Dtd?"</I>":F.End);
   }
return S;
}
// -----------------------------------------------------------------------------------------------------------
// Returns changes of variable rows - recursion
TGP.GetChildrenChanges = function(row,F,type,alldef,attrs){
var A = [], p = 0;
for(var r=row.firstChild;r;r=r.nextSibling){ 
   A[p] = this.GetRowChanges(r,F,type,alldef,attrs); if(A[p]) p++;
   var D = this; if(r.DetailCol){
      for(var rr=r;rr.DetailRow;rr=rr.DetailRow[0]) if(rr.DetailGrid) D = rr.DetailGrid[0];
      }
   A[p] = D.GetChildrenChanges(r,F,type,alldef,attrs);
   
   if(A[p]) p++;
   }
return A.join("");
}
// -----------------------------------------------------------------------------------------------------------
// Returns what changes grid contains (&1 changes, &2 selected rows)
TGP.HasChanges = function(row){
var ret = 0,max = (this.Resizing?4:0)+(this.Selecting?2:0)+1;
if(!row){
   var F = this.GetFixedRows();
   for(var i=0;i<F.length;i++) if(F[i].Kind!="Filter") ret |= this.HasChanges(F[i]);
   for(var r=this.XS.firstChild;r;r=r.nextSibling) ret |= this.HasChanges(r);
   for(var b=this.XB.firstChild;b&&ret!=max;b=b.nextSibling) for(var r=b.firstChild;r;r=r.nextSibling) ret |= this.HasChanges(r);
   }
else {
   if(!Is(row,"NoUpload")){
      if(row.Added || row.Deleted || row.Changed || row.Moved) ret|=1;
      if(row.Selected&1) ret|=2;
      if(row.Resized) ret|=4;
      }
   if(ret!=max) for(var r=row.firstChild;r;r=r.nextSibling) ret |= this.HasChanges(r);
   }
if(this.SaveHeights) ret&=~4;
if(this.SaveSelected) ret&=~2;
if(this.SaveValues) ret&=~1;
return ret;
}
// -----------------------------------------------------------------------------------------------------------
// Returns data of changed rows in XML in string, without root tag, row tags only
// If row is given, returns changes of this row only
// If type is given, returns tag <changes> only, cannot be used with row
// type = &1 - changess, &2 selected, &4 resized
// For alldef&1 returns for added rows also values from defaults
// For alldef&2 returns also calculated values
TGP.GetChanges = function(row,type,alldef,attrs,F){
if(!F) F = this.GetUploadFormat(this.Source.Upload);
var gridstart = (F.Json?"{\"IO\":{":"<Grid><IO")+(this.Source.Session!=null?F.Spc1+"Session"+F.Sep+"\""+this.Source.Session+"\"":"")+F.End;
var gridend = F.Json ? "}" : "</Grid>", chgstart = F.Json ? "\"Changes\":[" :"<Changes>", chgend = F.Json ? "]" : "</Changes>";
if(row) {
   var chg = this.GetRowChanges(row,F,type,alldef,attrs); if(!chg) return "";
   if(F.Json && chg.slice(-1)==',') chg = chg.slice(0,-1); 
   return gridstart+chgstart + chg + chgend+gridend;
   }
if(this.SaveOrder) return (type?"":gridstart+chgstart) + this.GetChangesOrder() + (type?"":chgend+gridend);
var A = [], p = 0;
var R = this.GetFixedRows();
for(var i=0;i<R.length;i++) if(R[i].Kind!="Filter"){ A[p] = this.GetRowChanges(R[i],F,type,alldef,attrs); if(A[p]) p++;}
for(var r=this.XS.firstChild;r;r=r.nextSibling){ A[p] = this.GetRowChanges(r,F,type,alldef,attrs); if(A[p]) p++; }
for(var b=this.XB.firstChild;b;b=b.nextSibling){ A[p] = this.GetChildrenChanges(b,F,type,alldef,attrs); if(A[p]) p++;}
if(F.Json && p && A[p-1].slice(-1)==',') A[p-1] = A[p-1].slice(0,-1); 

return (type?"":gridstart+chgstart) + A.join("") + (type?"":chgend+gridend);
}
// -----------------------------------------------------------------------------------------------------------
// Clear all modification flags in rows and rerenders them, deletes rows marked Deleted
// If row is given, updates this row only
TGP.AcceptChanges = function(row,master){
if(!row) { 
   MS.Undo; 
   if(this.Undo&32 && this.OUndo) { 
      var OU = this.OUndo, p = OU.Pos;
      if(p){
         if(OU[p-1].Type=="End"){
            if(OU[p-2].Type!="Accept"){ OU.splice(p-1,0,{Type:"Accept",Row:null}); OU.Pos++; }
            }
         else if(OU[p-1].Type!="Accept") { OU.splice(p-1,1,{Type:"Start"},OU[p-1],{Type:"Accept",Row:null},{Type:"End"}); OU.Pos+=3; }
         }
      
      } 
   
   else if(!this.MasterGrid) this.ClearUndo(1); 
   ME.Undo;
   this.Changes = []; 
   var F = this.GetFixedRows(),r,n,l;
   for(r=0;r<F.length;r++) if(F[r].Kind!="Filter") this.AcceptChanges(F[r],1);
   for(r=this.XS.firstChild;r;r=r.nextSibling) this.AcceptChanges(r,1);
   for(r=this.GetFirst();r;){
      if(r.Deleted){
         n = r; l = r.Level;
         r = this.GetNext(r);
         if(l!=null) while (r && r.Level > l) r = this.GetNext(r); 
         this.AcceptChanges(n,1);
         }
      else { 
         this.AcceptChanges(r,1);
         r = this.GetNext(r);
         }
      }
   if(this.RefreshDetail) this.RefreshDetail();
   MS.Pivot; if(this.PivotDetail) for(var id in this.PivotDetail) this.PivotDetail[id].AcceptChanges(null,1); ME.Pivot;

   var C = this.Cols; 
   for(var c in C) {
      if(C[c].Deleted) this.DelCol(c);
      else if(C[c].Added) { C[c].Added = 0; if(this.ColorState&4) this.ColorCol(c); }
      }
   this.SaveOrigData();
   return;
   }

if(row.Deleted && Get(row,"NoUpload")!=2){ 
   if(row==this.FRow) this.FRow = null;
   this.DelRow(row);
   }
else if((row.Added || row.Changed || row.Moved) && Get(row,"NoUpload")!=2){
   MS.GenId; if(this.IdMore) this.UpdateNewId(row,"id",this.SetIds,row.Changed,row.Moved); ME.GenId;
     if(row.Changed){ 
      var calcchg = this.CalculatedChanges; 
        if(row.Cells){ 
           for(var i=0;i<row.Cells.length;i++) if(row[row.Cells[i]+"Changed"]){ row[row.Cells[i]+"Changed"] = null; this.RefreshCell(row,row.Cells[i]); if(calcchg) row[row.Cells[i]+"Orig"] = row[row.Cells[i]]; }
           }
        else {
           for(var c in this.Cols) if(row[c+"Changed"]){ row[c+"Changed"] = null; this.RefreshCell(row,c); if(calcchg) row[c+"Orig"] = row[c];  }
           }
        
        }
     if(this.IdMore && (row.Changed || row.Moved) && row[this.IdCol+"Changed"]) row[this.IdCol+"Changed"] = null;
   
   if(row.DetailRow) for(var i=0;i<row.DetailRow.length;i++) {
      var r = row.DetailRow[i]; r.Added = row.Added; r.Changed = row.Changed; r.Moved = row.Moved; r.Copy = row.Copy; r.NewId = row.NewId;
      row.DetailGrid[i].AcceptChanges(r);
      }
   row.Added = null; 
   row.Changed = null;
   row.Moved = null;
   row.Copy = null;
   row.NewId = null;
   if(this.ColorState&3) this.ColorRow(row); 
   
   }

if(this.SaveSpan){
   if(row.Spanned){
      for(var c in this.Cols) {
         if(row[c+"SpanOrig"]) row[c+"SpanOrig"] = null;
         if(row[c+"Span"]>1 && row[c+"RowSpan"]!=0) row[c+"SpanOrig"] = row[c+"Span"];
         }
      }
   if(row.RowSpan){
      for(var c in this.SpanCols) {
         if(row[c+"RowSpanOrig"]) row[c+"RowSpanOrig"] = null;
         if(row[c+"RowSpan"]>1 && row[c+"Span"]!=0) row[c+"RowSpanOrig"] = row[c+"RowSpan"];
         }
      }
   }
MS.Pivot; if(!master && this.PivotDetail) for(var id in this.PivotDetail) this.PivotDetail[id].AcceptChanges(row,1); ME.Pivot;
if(!master && this.RefreshDetail) this.RefreshDetail();
}
// -----------------------------------------------------------------------------------------------------------
// Returns all grid data
// type = &7 = rows, 0 - none, 1 - changed, 2 - selected, 3 - selected + changed, 5 - all fixed, 6 - all variable, 7 - all
// type&8 = configuration from cookies, &16 - Cfg, &32 - Def, &64 - Cols, &128 - Header, &256 - Panel+Toolbar+MenuCfg+Pager, &512 - Img
// type&1024 = Lang, &0x10000 - no <Grid>, &0x20000 - no <IO>
TGP.GetXmlData = function(type,attrs,colvis,U,row,rowvis){
var flags = ""; if(!U) U = this.Source.Upload;
if(type==null) { type = U.Type; flags = U.Flags; }
var names, otype = type;
MS.UploadType;
MS.Debug; names = "changes,selected,resized,expanded,hidden,body,data,all,fixed,settings,config,configxlsx,cookie,cfg,def,cols,root,menu,actions,animations,pagers,resources,zoom,calendars,media,other,lang,languages,text,complete,defaults,allcols,nodelete,noio,nogrid,gantt,span,spanned,newid,accepted,index,nogantt,autocols,focus,editattrs,cells,noempty,focused,fullmoved,noformula,noupload"; ME.Debug;
if(type && type-0+""==type) { 
   var t = type&7;
   type = this.BitArrayToFlags(type&~7,",,,settings,cfg,def,cols,,other,,lang,,cookie,,,,nogrid,noio");
   if(t==3) { type["changed"] = 1; type["selected"] = 1; }
   else type[["","changes","selected","","","","body","all"][t]] = 1;
   }
else {
   if(type&&typeof(type)=="string"&&type.toLowerCase().indexOf("complete")>=0) type += ",all,cols,cfg,def,calendars,resources,zoom,other,lang,text";
   type = this.ConvertFlags((type?type:(type==null?"changes":""))+(flags&&type!=""?",":"")+(flags?flags:""),names);
   }
ME.UploadType;
if(attrs==null) attrs = U.Attrs;
if(typeof(attrs)=="string") attrs = attrs.split(",");

var C = this.Cols, rspn = 0, cspn = 0, noformula = type["noformula"], fed = noformula ? 0 : this.FormulaEditing;
if(attrs) {
   var A = [], p = 0;
   for(var i=0;i<attrs.length;i++) {
      if(attrs[i].charAt(0)=="*"){ 
         var a = attrs[i].slice(1); 
         if(a=="RowSpan") rspn = 1;
         else if(a=="Span") cspn = 1;
         for(var c in C) if(!C[c].NoUpload && (a||c!="id")) A[p++] = c+a;
         }
      else A[p++] = attrs[i];
      }
   attrs = A;
   }
if(type["editattrs"]) {
   var A = this.GetEditAttrs(fed==2?3:1); if(!attrs) attrs = [];
   if(A.RowSpan!=null) A.splice(A.RowSpan,1);
   if(A.Span!=null) A.splice(A.Span-(A.RowSpan!=null&&A.Span>A.RowSpan?1:0),1);
   A.push("Img","Link");
   for(var i=0;i<A.length;i++) {
      var a = A[i];
      if(a=="RowSpan") rspn = 1;
      else if(a=="Span") cspn = 1;
      for(var c in C) if(!C[c].NoUpload && (a||c!="id")) attrs[attrs.length] = c+a;
      }
   }
if(this.HasFiles){
   U.Files = {};
   for(var col in this.HasFiles){
      var H = this.HasFiles[col];
      for(var id in H){
         var r = this.Rows[id];
         if(r && r[col] && r[col+"Changed"]) {
            for(var i=0,F=r[col];i<F.length;i++) U.Files[id+"$"+col+(i?"$"+i:"")] = r[col][i];
//            r[col+"Zal"] = F; r[col] = ""; 
            }
         }
      }
   }
else U.Files = null;
if(!otype && !flags) return this.GetChanges(row,null,null,attrs); 

MS.UploadType;
if(row) return this.GetChanges(row,1+(type["selected"]?2:0)+(type["resized"]?4:0),(type["defaults"]?1:0)+(type["allcols"]?2:0)+(type["newid"]?4:0)+(type["fullmoved"]?8:0)+(noformula?16:0)+(type["noupload"]?32:0),attrs);

var F = this.GetUploadFormat(U), O = type["cells"] ? this.OrigData : null, noempty = type["noempty"];
var A = [], p = 0, T = this, pp;

function GetAttr(n,v){
   if(typeof(v)=="boolean") v=v?1:0;
   else if(typeof(v)!="string" && typeof(v)!="number") return "";
   if(n.charAt(0)=='_') { 
      if(n.charAt(1)=='7'||n.search(/Formula|Enum/)<0) return "";   
      n = n.slice(1); 
      }
   return F.Spc+n+F.Sep+"\""+F.Str(v)+"\"";
   }

function SetAttr(n,v){
   if(accept && (n=="Added"||n=="Deleted"||n=="Moved"||n=="Changed"||n=="Parent"||n=="Next"||n=="Prev")) return;
   if(typeof(v)=="boolean") v=v?1:0;
   else if(typeof(v)!="string" && typeof(v)!="number") return;
   if(n.charAt(0)=='_') { 
      if(n.charAt(1)=='7'||n.search(/Formula|Enum/)<0) return;   
      n = n.slice(1); 
      }
   A[p++] = F.Spc+n+F.Sep+"\""+F.Str(v)+"\"";
   }

function SetAttrs(nm,row,json2,reg){ 
   var S = "";
   if(reg) for(var n in row) { if(n.search(reg)==0) S += GetAttr(n,row[n]); }
   else for(var n in row) S += GetAttr(n,row[n]); 
   if(F.Json && S && S.charAt(0)==',') S = S.slice(1); 
   A[p++] = "\n"+(json2?"{":(F.Json ? "\""+nm+"\":{" : "<"+nm))+S+F.End;
   }

function SetCustomAttrs(row){
   if(!attrs) return;
   var o = O ? O[row[ridx?ridx:"id"]] : null;
   for(var i=0;i<attrs.length;i++) {
      var n = attrs[i], v = row[n]; 
      MS.RowSpan; if(rspn && row.RowSpan && n.indexOf("RowSpan")>=0 && (v=="0"||v==1) && C[n.replace("RowSpan","")]) continue; ME.RowSpan;
      MS.ColSpan; if(cspn && row.Spanned && n.indexOf("Span")>=0 && (v=="0"||v==1) && C[n.replace("Span","")]) continue; ME.ColSpan;
      if(v==null && alldef && row.Def) { v = row.Def[n]; if(!v&&v!="0"&&C[n]) v = null; }
      var cn = n;
      MS.Calc;
      if(cidx){ 
         if(!C[n]) { var c = GetColFromCell(n); if(c&&C[c]){ if(C[c].HasIndex) cn = cidx[c]+n.slice(c.length); else if(O&&C[c].Deleted) continue; } }
         else if(C[n].HasIndex) cn = cidx[n];
         else if(O&&C[n].Deleted) continue;
         }
      ME.Calc;
      if(C[n]&&fed==1&&row[n+"EFormula"]!=null ? o&&row[n+"EFormula"]==o[n+"EFormula"] : o ? o[cn]==v||!v&&!o[cn]&&isNaN(v)&&isNaN(o[cn]) : v==null) continue;
      
      if(C[n]) v = T.ConvertUpload(row,n,v,fed);
      if(v==null) v = "";
      SetAttr(cn,v); 
      }
   }
function SetRowAttrs(nm,row,reg){
   if((accept||ridx) && row.Deleted) return;
   A[p++] = F.Json ? "\n{" : "\n<"+nm;
   var pp = p;
   if(ridx&&row.HasIndex) SetAttr("id",row[ridx]);
   else if(row.id) SetAttr("id",row.id);
   if(row.Def && (row.Def.Name!="R"||alldef)) SetAttr("Def",row.Def.Name);
   var cp = p, o = null;
   if(O){
      o = O[row[ridx?ridx:"id"]];
      if(!ridx){
         var rn = T.GetNextSibling(row), rp = T.GetPrevSibling(row), par = row.parentNode.Page?null:row.parentNode;
         if((par?par.id:null)!=(o?o.parentNode:null)||(rn?rn.id:null)!=(o?o.nextSibling:null)||(rp?rp.id:null)!=(o?o.previousSibling:null)){
            SetAttr("Moved",1); SetAttr("Parent",par?par.id:""); SetAttr("Next",rn?rn.id:""); SetAttr("Prev",rp?rp.id:"");
            }
         else if(!o) SetAttr("Added",1);
         }
      else if(o?row.Level!=o.Level:row.Level>0) SetAttr("Level",row.Level);
      }
   if(attrs||allcols) {
      if(attrs) SetCustomAttrs(row); 
      if(allcols) SetRowCols(row);
      }
   else {
      var D = alldef ? null : row.Def;
      for(var n in row) if(!RA[n]) {
         var v = row[n]; if(D && (v===D[n]||CRowAttrs[n])) continue;
         if(nogantt && n.indexOf(nogantt)==0 || ridx && n==ridx || noformula&&n.indexOf("EFormula")>0) continue;
         MS.RowSpan; if(row.RowSpan && n.indexOf("RowSpan")>=0 && (v=="0"||v==1) && T.Cols[n.replace("RowSpan","")]) continue; ME.RowSpan; 
         MS.ColSpan; if(row.Spanned && n.indexOf("Span")>=0 && (v=="0"||v==1) && T.Cols[n.replace("Span","")]) continue; ME.ColSpan; 
         if(v==null && alldef && row.Def) v = row.Def[n];
         var cn = n;
         MS.Calc;
         if(cidx){ 
            if(!C[n]) { var c = GetColFromCell(n); if(c&&C[c]){ if(C[c].HasIndex) cn = cidx[c]+n.slice(c.length); else if(O&&C[c].Deleted) continue; } }
            else if(C[n].HasIndex) cn = cidx[n];
            else if(O&&C[n].Deleted) continue;
            }
         ME.Calc;
         
         if(o ? o[cn]==v || fed&&C[n]&&(fed==1?row[n+"EFormula"]&&row[n+"EFormula"]==o[cn+"EFormula"]:!v&&!o[cn]&&isNaN(v)&&isNaN(o[cn])) : v==null) continue;
         if(C[n]) { if(C[n].Type!="Gantt") v = T.ConvertUpload(row,n,v,fed); }
         else if(fed && (fed==1||T.FormulaRelative==2)){
            var idx = n.indexOf("EFormula");
            if(idx>0 && C[n.slice(0,idx)]){
               if(fed==1) continue;
               if(T.FormulaRelative==2) v = T.ConvertEditFormula(row,n.slice(0,idx),v,T.FormulaLocal ? 6 : 4);
               }
            }
         if(!reg||cn.search(reg)==0&&cn!="RowSpan") { 
            if(v==null) v = "";
            SetAttr(cn,v); 
            }
         }
      }
   
   if(F.Json) RemoveFirst(pp);
   return cp!=p;
   }

function SetRowChildren(nm,row,reg){
   if((accept||ridx) && row.Deleted) return;
   var noup = Get(row,"NoUpload")-0 && !type["noupload"];
   if(!noup){ 
      var cp = p;
      if(!SetRowAttrs(nm,row,reg)&&noempty&&(!row.firstChild||O)) { p = cp; A.length = p; }
      else A[p++] = row.firstChild&&!O ? (F.Json?",\"Items\":[":">") : F.End; 
      }
   for(var r=row.firstChild;r;r=r.nextSibling) SetRowChildren(r.tagName,r,reg);
   if(!noup && row.firstChild && !O) {
      if(F.Json) RemoveLast();
      A[p++] = F.Json?"]\n},":"\n</"+nm+">";
      }
   }

function SetRowCols(row){
var o = O ? O[row[ridx?ridx:"id"]] : null;
for(var c in C){
   if(c=="id" || C[c].NoUpload) continue;
   var v = alldef&1 ? Get(row,c) : row[c]; 
   if(v==null) v = "";
   v = T.ConvertUpload(row,c,v,fed);
   if(cidx && C[c].HasIndex) c = cidx[c];
   if(o && (o[c]==v || o[c]==null&&v==="" || fed&&v&&row[c+"EFormula"]&&(v+"").slice(1)==o[c+"EFormula"])) continue;
   A[p++] = F.Spc+c+F.Sep+"\""+F.Str(v)+"\"";
   }
}

function GetAutoCols(){
var cnt = 0; for(var c in C) if(C[c].HasIndex) cnt++;
return GetAttr("AutoCols",cnt);
}

function RemoveLast() {
   if(p && A[p-1] && A[p-1].slice(-1)==',') A[p-1] = A[p-1].slice(0,-1); 
   }
function RemoveFirst(pp) {   
   if(A[pp] && A[pp].charAt(0)==',') A[pp] = A[pp].slice(1); 
   }

var RA = Grids.INames;
if(!type["nogrid"]) A[p++] = F.Json ? "{" : "<Grid>";
if(!type["noio"]) A[p++] = (F.Json?"\"IO\":{":"<IO")+(this.Source.Session!=null?F.Spc1+"Session"+F.Sep+"\""+this.Source.Session+"\"":"")+F.End;
var alldef = type["defaults"]?1:0, accept = type["accepted"], allcols = type["allcols"]?2:0, nogantt = this.Gantt && type["nogantt"] ? this.GetFirstGantt() : null;
var ridx = type["index"] ? this.RowIndex : null, rid = ridx?ridx:"id", cidx = type["index"] ? this.Rows[this.ColIndex] : null;

var grp = this.Group && (type["cfg"]||type["settings"]) && (type["body"]||type["data"]||type["all"]) && this.Paging!=3;
if(grp){ var zalgrp = this.Group; this.DoGrouping("",-1); this.Group = zalgrp; }
if(this.Img.Width!=1){
   if(type["cols"]) this.MultiplyScale(1/this.Img.Width,9);
   if(type["other"]) this.MultiplyScale(1/this.Img.Width,10);
   if(type["all"]||type["fixed"]) this.MultiplyScale(1/this.Img.SpaceWidth,12);
   if(this.Gantt&&type["cols"]) this.MultiplyScale(1/this.Img.GanttWidth,24);
   }
if(type["cfg"]||type["body"]||type["data"]||type["all"]||type["fixed"]||type["other"]||type["cols"]||O){
   var D = CDebugAttrs, B = CCellAttrs;
   if(!D.Parsed){ for(var a in D) if(D[a]) D[a] = D[a].split(","); D.Parsed = 1; }
   if(!B.Parsed){ for(var a in B) if(B[a]) B[a] = B[a].split(","); B.Parsed = 1; }
   }

// --- Gantt ---


var cfg = "";
var set = type["settings"]||type["config"]||type["configxlsx"] ? {  
   LeftWidth:3,MidWidth:3,RightWidth:3,PrintRows:2,PrintPageBreaks:1,PrintExpanded:1,PrintFiltered:1,PrintSelected:1,PrintPageRoot:1,PDFText:1,
   PrintPageWidth:2,PrintPageHeight:2,ExportType:2,Language:2,Style:2,GanttStyle:2,Size:2,Scale:2,ShowDeleted:1,PrintVisible:1,FormulaTip:1,
   Sort:4,Group:4,SearchAction:4,SearchExpression:4,SearchType:4,SearchCaseSensitive:4,SearchCells:4,SearchMethod:4,SearchDefs:4,SearchCols:4,Rtl:1
   } : {};
if(type["settings"]||type["config"]){ 
   set.ReversedTree = 1; set.ReversedColTree = 1; set.DefaultBorder = 1; set.HideZero = 1; set.FormulaShow = 1;
   }
if(type["settings"]) { set.Focused = 4; set.FocusedCol = 4; set.FocusedPos = 4; set.FocusedRect = 4; set.FocusedTop = 4; set.FocusedLeft = 4; }
else if(type["focused"]){ set.Focused = 3; set.FocusedCol = 3; set.FocusedPos = 3; set.FocusedRect = 3; set.FocusedTop = 3; set.FocusedLeft = 3; }
if(this.ShowPrintPageBreaks>=0) set.ShowPrintPageBreaks = 1;

// --- AutoCols ---
if(type["autocols"]) { cfg += GetAutoCols();  } 

// --- Expanded ---
if(type["expanded"]){
   var chp = this.ChildPaging==3;
   for(var s="",r=this.GetFirst();r;r=this.GetNext(r)) if(r.Expanded && (r.firstChild||chp&&r.Count)) s += r[rid]+",";
   cfg += F.Spc+"Expanded"+F.Sep+"\""+F.Str(s.slice(0,-1))+"\"";
   }

// --- Hidden ---
if(type["hidden"]||type["settings"]){
   var s = "", v = "";
   if(rowvis) for(var id in rowvis) if(rowvis[id]) v += id + ","; else s += id + ",";
   function setvis(r){
      var rid = ridx&&r.HasIndex?ridx:"id";
      if((!rowvis||rowvis[r.id]==null) && Get(r,"CanHide") && (!O||!O[r[rid]]||!O[r[rid]].Visible!=!r.Visible)){
         if(!r.Visible) s += r[rid]+","; else if(O) v += r[rid]+",";
         }
      }
   if(type["hidden"]) for(var r=this.GetFirst();r;r=this.GetNext(r)) setvis(r);
   for(var R=this.GetFixedRows(),i=0;i<R.length;i++) setvis(R[i]);
   for(var r=this.XS.firstChild;r;r=r.nextSibling) setvis(r);
   if(s) cfg += F.Spc+"HiddenRows"+F.Sep+"\""+F.Str(s.slice(0,-1))+"\"";
   if(v) cfg += F.Spc+"VisibleRows"+F.Sep+"\""+F.Str(v.slice(0,-1))+"\"";
   }

// --- Cookie ---
if(type["cookie"] && !type["cfg"]) cfg += GetAttr("Cookie",this.SaveCfg(1));

// --- Cfg ---
if(type["cfg"]){
   this.SetFocused(type["index"]); 
   
      var Reg = new RegExp("^("+CDebugAttrs.Cfg.join("|")+")$");
      for(var n in this) if(!set[n]&&n.search(Reg)==0) cfg += GetAttr(n,this[n]); 
      
   var SS = ["Styles","GanttStyles"];
   for(var i=0;i<SS.length;i++){
      var v = this[SS[i]], S = []; 
      for(var n in v) {
         var vv = v[n], s = [];
         for(var nn in vv) s[s.length] = nn+":"+(vv[nn]-0||vv[nn]=="0"?vv[nn]:"'"+vv[nn]+"'");
         S[S.length] = n+":{"+s.join(",")+"}";
         }
      cfg += GetAttr(SS[i],"{"+S.join(",")+"}");
      }

   if(this.Sort && !type["settings"]) {
      cfg += GetAttr("SortCols"+this.Sort.replace(/-/g,""));
      cfg += GetAttr("SortTypes"+this.Sort.replace(/[^-,]/g,"").replace(/-/g,"1").replace(/,,/g,",0,").replace(/^,/,"0,").replace(/,$/,",0"));
      }
   }  

// --- Configuration from cookies ---
if(type["settings"]||type["config"]||type["configxlsx"]||type["focused"]) {
   if(type["settings"]||type["focused"]) this.SetFocused(type["index"]); 
   for(var n in set) if(set[n]!=4&&(set[n]!=3||this[n]!=null)) cfg += F.Spc+n+F.Sep+"\""+(set[n]==1?(this[n]?1:0):this[n])+"\"";
   
   if(type["settings"]) { 
      cfg += F.Spc+"AllCols"+F.One; 
      A[p++] = "\n"+this.GetCfgRequest(F,cfg); 
      cfg = null; 
      }
   }

if(cfg) {
   if(cfg.charAt(0)==',') cfg = cfg.slice(1); 
   A[p++] = (F.Json?"\n\"Cfg\":{":"\n<Cfg")+cfg+F.End;
   }
   
// --- Def ---
if(type["def"]){
   A[p++] = F.Json ? "\n\"Def\":"+(F.Json2?"[":"{") : "\n<Def>";
   for(var D in this.Def) {
      var zu = this.Def[D].Updated; delete this.Def[D].Updated;
      SetAttrs("D",this.Def[D],F.Json2);
      this.Def[D].Updated = zu;
      }
   if(F.Json) RemoveLast();
   A[p++] = F.Json2 ? "]," : (F.Json ? "}," :"\n</Def>");
   SetAttrs("Root",this.Root);
   }

// --- DefCols ---
if(type["def"] && type["cols"]){
   A[p++] = F.Json ? "\n\"DefCols\":"+(F.Json2?"[":"{") : "\n<DefCols>";
   for(var D in this.DefCols) {
      
      SetAttrs("D",this.DefCols[D],F.Json2);
      
      }
   if(F.Json) RemoveLast();
   A[p++] = F.Json2 ? "]," : (F.Json ? "}," :"\n</DefCols>");
   }

// --- Cols ---
if(type["cols"]||type["settings"]||type["selected"]&&this.SelectingCols){
   var len = this.ColNames.length;
   var Cols1 = ["LeftCols"]; Cols1[len-1] = "RightCols";
   var Cols2 = ["LeftCols"]; Cols2[len-1] = "RightCols";
   var Reg = null;
   if(type["cols"]){
      var s = CDebugAttrs.C.join("|") + CCellAttrs.CCell.join("|") + CCellAttrs.CICell.join("|") + "|On\\w+";
      s += ("|"+CDebugAttrs.Panel.join("|")).replace(/\|\*\|/g,"|").replace(/\*/g,"\\w*") + "|Enum\\w*";
      if(this.Gantt) {
         s += "|Gantt"+CDebugAttrs.CGantt.join("|Gantt") + "|Gantt"+CCellAttrs.CCellGantt.join("|Gantt") + "|Gantt"+CCellAttrs.CCellGanttX.join("\\d*|Gantt")+"\\d*";
         s += "|GanttFormat\\d*|GanttHeader\\w*\\d*";
         }
      Reg = new RegExp("^("+s+")$");
      }
   for(var i=0;i<len;i++){
      var N = this.ColNames[i];
      if(i==1) A[p++] = F.Json ? "\n\"Cols\":"+(F.Json2?"[":"{") : "\n<Cols>";
      if(N.length){
         if(Cols1[i]) A[p++] = F.Json ? "\n\""+Cols1[i]+"\":"+(F.Json2?"[":"{") : "\n<"+Cols1[i]+">";
         for(var ci=0;ci<N.length;ci++) {
            var c = N[ci];
            if(C[c].NoUpload==2||cidx&&C[c].Deleted) continue;
            if(type["cols"]){ SetAttrs("C",C[c],F.Json2,Reg); continue; }
            if(!type["settings"] && !C[c].Selected) continue;
            var n = cidx && C[c].HasIndex ? cidx[c] : c;
            if(F.Json2) { A[p++] = "\n{\"Name\":\""+n+"\""; }
            else if(F.Json) A[p++] = "\n\""+n+"\":{";
            else { A[p++] = "\n<C"; SetAttr("Name",n); }
            pp = p;
            if(type["settings"]){
               var dw = this.Img.Width; if(!dw) dw = 1;
               SetAttr("Width",Math.round((C[c].OldWidth?C[c].OldWidth:C[c].Width)/dw));
               SetAttr("Visible",colvis&&colvis[c]!=null ? colvis[c] : C[c].Visible);
               if(C[c].Spanned) SetAttr("Spanned",C[c].Spanned);
               if(this.ColTree) SetAttr("Level",C[c].Level?C[c].Level:0);
               
               if(this.AutoCols && C[c].HasIndex) SetAttr("Def",C[c].Def);
               }
            if(C[c].Selected&&type["selected"]) SetAttr("Selected",1);
            A[p++] = F.End;
            if(F.Json && !F.Json2) RemoveFirst(pp);
            }
         if(F.Json&&(i==len-2||Cols1[i])) RemoveLast(); 
         if(Cols2[i]) A[p++] = F.Json ? "\n"+(F.Json2?"]":"}")+"," : "\n</"+Cols2[i]+">";
         }
      if(i==len-2) A[p++] = F.Json ? "\n"+(F.Json2?"]":"}")+"," : "\n</Cols>";
      }
   }     

if(O) A[p++] = F.Json?"\n\"Changes\":[":"\n<Changes>";

// --- fixed rows ---
if(type["data"] || type["all"] || type["fixed"] || O){
   if((this.Header.id!="Header"||this.Header.Kind!="Header")&&!O) A[p++] = (F.Json?"\n\"Header\":{":"\n<Header")+F.Spc1+"id"+F.Sep+"\""+F.Str(this.Header.id)+"\""+F.Spc+"Kind"+F.Sep+"\""+F.Str(this.Header.Kind)+"\""+F.End;
   if((this.Toolbar.id!="Header"||this.Toolbar.Kind!="Toolbar")&&!O) A[p++] = (F.Json?"\n\"Toolbar\":{":"\n<Toolbar")+F.Spc1+"id"+F.Sep+"\""+F.Str(this.Toolbar.id)+"\""+F.Spc+"Kind"+F.Sep+"\""+F.Str(this.Toolbar.Kind)+"\""+F.End;
   var Rows = ["Head","Foot","Solid"], RF = [this.XH,this.XF,this.XS];
   for(var j=0;j<3;j++){
      var R = this.GetRows(RF[j]);
      if(R.length){
         var Reg = null; 
         
            s = CDebugAttrs.I.join("|") + "|\\w+On\\w+";
            if(j==2) {
               s += "|"+CDebugAttrs.Space.join("|") + "|"+CDebugAttrs.Group.join("|") + "|"+CDebugAttrs.Search.join("|") + "|"+CDebugAttrs.Toolbar.join("|");
               s += "|\\w*"+CCellAttrs.SpaceCell.join("|\\w*");
               }
            else {
               if(this.Gantt) s += "|\\w*Gantt"+CCellAttrs.CCellGantt.join("|\\w*Gantt") + "|\\w*"+CCellAttrs.CCellGanttX.join("\\d*|\\w*Gantt")+"\\d*";
               s += "|"+CDebugAttrs.Header.join("|") + "|\\w*"+CCellAttrs.FilterCell.join("|\\w*");
               s += ("|"+CDebugAttrs.Panel.join("|")).replace(/\|\*\|/g,"|").replace(/\*/g,"\\w*").replace(/\|/g,"|\\w*") + "|\\w*Enum\\w*";;
               var a = [], CC = this.Cols; for(var n in CC) if(CC[n].Type!="Gantt") a[a.length] = n;
               s += "|"+a.join("|");
               }
            s += "|\\w*"+CCellAttrs.Cell.join("|\\w*") + "|\\w*"+CCellAttrs.CCell.join("|\\w*") + "|\\w*"+CCellAttrs.CICell.join("|\\w*");
            
            Reg = new RegExp("^("+s+")$");
            
         if(!O) A[p++] = F.Json ? "\n\""+Rows[j]+"\":[" :"\n<"+Rows[j]+">";
         for(var i=0;i<R.length;i++) if(R[i].Kind=="Data" || type["all"] || type["fixed"]) {
            var Z = {};
            if(R[i].Kind.slice(0,7)=="Toolbar"){ 
               Z["Empty"] = R[i]["Empty"]; delete R[i]["Empty"]; 
               for(var k=0,RIC=R[i].Cells;k<RIC.length;k++) if(R[i][RIC[k]+"Formula"]) { Z[RIC[k]] = R[i][RIC[k]]; delete R[i][RIC[k]]; }
               }
            if(R[i].Cells) { 
               if(s) Reg = new RegExp("^("+s+"|"+R[i].Cells.join("|")+")$"); 
               Z.Cells = R[i].Cells; 
               if(R[i].Cells[0]=="Panel") {
                  Z.Panel = R[i].Panel; R[i].Panel = R[i]["PanelVisible"];
                  R[i].Cells.shift();
                  }
               R[i].Cells = R[i].Cells.join(","); 
               }
            var cp = p;
            if(!SetRowAttrs("I",R[i],Reg)&&noempty) { p = cp; A.length = p; }
            else {
               if(this.Gantt&&R[i].Kind=="Header"&&!R[i][this.Gantt+"GanttHeader"]) A[p++] = GetAttr(this.Gantt,R[i][this.Gantt]); 
               A[p++] = F.End;
               }
            for(var n in Z) { R[i][n] = Z[n]; }
            }
         if(F.Json) RemoveLast();   
         if(!O) A[p++] = F.Json ? "\n]," : "\n</"+Rows[j]+">";
         }
      }
   }

// --- variable rows ---
if(type["body"] || type["data"] || type["all"] || O){
   var name = "Body";
   if(!O) A[p++] = F.Json ? "\n\""+name+"\":[" : "\n<"+name+">";
   var BA = { LevelImg:1,Level:1,Hasch:1,Page:1,State:1,LastAccess:1,Visible:1 };
   var Reg = null; 
   
      s = CDebugAttrs.I.join("|") + "|\\w+On\\w+";
      if(this.Paging==3&&!O) s += "|\\w+"+CDebugAttrs.BCellICell.join("|\\w+");
      s += ("|"+CDebugAttrs.Panel.join("|")).replace(/\|\*\|/g,"|").replace(/\*/g,"\\w+").replace(/\|/g,"|\\w+") + "|\\w+Enum\\w+";
      s += "|\\w+"+CCellAttrs.Cell.join("|\\w+") + "|\\w+"+CCellAttrs.CCell.join("|\\w+") + "|\\w*"+CCellAttrs.CICell.join("|\\w*");
      if(this.Gantt) s += "|\\w+Gantt"+CCellAttrs.CCellGantt.join("|\\w+Gantt") + "|\\w+"+CCellAttrs.CCellGanttX.join("\\d*|\\w+Gantt")+"\\d*";
      var a = [], CC = this.Cols; for(var n in CC) if(CC[n].Type!="Gantt") a[a.length] = n;
      s += "|"+a.join("|");
      Reg = new RegExp("^("+s+")$");
      
   if(this.Paging==3&&!O) {
      for(var B=this.XB.firstChild;B;B=B.nextSibling){
         var S = "";
         if(B.id) S += GetAttr("id",B.id);
         for(var n in B) if(!RA[n] && !BA[n]) S += GetAttr(n,B[n]); 
         if(F.Json){
            if(S) {
               if(S.charAt(0)==',') S = S.slice(1);
               A[p++] = "\n{"+S+",\"Items\":[";
               }
            else A[p++] = "[";
            }
         else A[p++] = "\n<B" + S + ">";
         for(var r=B.firstChild;r;r=r.nextSibling) SetRowChildren("I",r,Reg);
         if(F.Json) RemoveLast();
         A[p++] = F.Json ? (S?"]},":"],") : "\n</B>";
         }
      if(F.Json) RemoveLast(); 
      }
   else {
      if(!O) A[p++] = F.Json ? "[" : "\n<B>";
      var lr = null; if(this.AutoPages) lr = this.GetLastDataRow((alldef?16:0)+(U&&U.Name=="ExportPDF"?32:0));
      for(var B=this.XB.firstChild;B;B=B.nextSibling) for(var r=B.firstChild;r;r=r.nextSibling) { SetRowChildren("I",r,Reg); if(r==lr) { B = this.XB.lastChild; break; } }
      if(O&&!ridx){ 
         var N = this.Rows; 
         for(var id in O) { 
            var n = ridx?this.GetRowByIndex(id):N[id]; if(n&&!n.Deleted) continue;
            A[p++] = F.Json ? "\n{" : "\n<I"; 
            if(ridx&&O[id].HasIndex) SetAttr("id",O[id][ridx]); 
            else if(O[id].id) SetAttr("id",O[id].id); 
            SetAttr("Deleted",1); 
            A[p++] = F.End; 
            }
         }
      if(F.Json) RemoveLast();
      if(!O) A[p++] = F.Json ? "]" : "\n</B>";
      }
   if(!O) A[p++] = F.Json ? "\n]," : "\n</"+name+">";
   }

// --- Selected ---
var sel = (type["selected"]||type["resized"]) && !type["changes"] && (!O||attrs||allcols);
if(!O&&(sel||type["changes"])) A[p++] = F.Json?"\n\"Changes\":[":"\n<Changes>";
if(sel){
   var res = type["resized"], sel = type["selected"];
   
   var R = this.GetFixedRows(), allcols = type["allcols"];
   function AddSel(row){
      if(ridx&&row.Deleted) return;
      A[p++] = "\n"+F.Start+F.Str(row[rid])+"\"";
      if(sel && row.Selected) A[p++] = F.Spc+"Selected"+F.Sep+"\""+row.Selected+"\"";
      if(res && row.Resized) A[p++] = F.Spc+"Height"+F.Sep+"\""+row.Height+"\"";
      if(F.Dtd) A[p++] = F.End;
      if(allcols) SetRowCols(row); if(!O) SetCustomAttrs(row); 
      if(sel && row.Selected&2) { for(var c in C) if(row[c+"Selected"]) SetAttr(c+"Selected",row[c+"Selected"]); }
      A[p++] = F.Dtd ? "</I>" : F.End;
      }
   for(var i=0;i<R.length;i++) if(sel&&R[i].Selected||res&&R[i].Resized) AddSel(R[i]);
   for(var r=this.XS.firstChild;r;r=r.nextSibling) if(sel&&r.Selected||res&&r.Resized) AddSel(r);
   for(var r=this.GetFirst();r;r=this.GetNext(r)) if(sel&&r.Selected||res&&r.Resized) AddSel(r);
   if(F.Json) RemoveLast();
   }

// --- Changes ---
if(type["changes"]) A[p++] = this.GetChanges(null,1+(type["selected"]?2:0)+(type["resized"]?4:0),alldef+allcols+(type["newid"]?4:0)+(type["fullmoved"]?8:0)+(noformula?16:0)+(type["noupload"]?32:0),attrs,F) + (F.Json?",":"");

if(O||sel||type["changes"]) A[p++] = F.Json?"],":"\n</Changes>";

// --- Spanned ---
if(type["span"]){
   A[p++] = F.Json?"\n\"Spanned\":[":"\n<Spanned>";
   for(var r=this.GetFirst();r;r=this.GetNext(r)){
      var s = "", o = O ? O[r[rid]] : null;
      if(r.Spanned||r.RowSpan||o&&(o.Spanned||o.RowSpan)) for(var col in C) {
         if((o?r[col+"Span"]!=o[col+"Span"]&&(r[col+"Span"]>1||o[col+"Span"]>1)||r[col+"RowSpan"]!=o[col+"RowSpan"]&&(r[col+"RowSpan"]>1||o[col+"RowSpan"]>1):r[col+"Span"]>1||r[col+"RowSpan"]>1) && r[col+"RowSpan"]!=0 && r[col+"Visible"]!=-2) {
            s += F.Spc+col+"Span"+F.Sep+"\""+F.Str(r[col+"Span"]==null?1:r[col+"Span"])+"\""+F.Spc+col+"RowSpan"+F.Sep+"\""+F.Str(r[col+"RowSpan"]==null?1:r[col+"RowSpan"])+"\"";
            }
         }
      
      if(s) A[p++] = F.Start + F.Str(r[rid]) + "\"" + s + F.End;
      }
   if(F.Json) RemoveLast();
   A[p++] = F.Json?"],":"\n</Spanned>";
   }

// --- Lang ---
if(type["lang"]){
   A[p++] = F.Json ? "\n\"Lang\":{" : "\n<Lang>";
   for(var i in this.Lang){ 
      var v = this.Lang[i];
      A[p++] = F.Json ? "\n\""+i+"\":{" : "\n<"+i; pp = p;
      var reg = i=="Format" ? new RegExp("^("+CDebugAttrs.Format.join("|")+")$") : null;
      for(var n in v){
         if(v[n]==null||reg&&n.search(reg)!=0);
         else if(v[n].join) SetAttr(n,v[n].join(",")); 
         else SetAttr(n,v[n]); 
         }
      if(F.Json) RemoveFirst(pp);
      A[p++] = F.End;
      
      }
   if(F.Json) RemoveLast();
   A[p++] = F.Json ? "\n}," : "\n</Lang>";
   }

// --- Text ---
MS.Lang;
if(type["text"]) for(var xx in this.Text) {
   A[p++] = F.Json ? "\n\"Text"+xx+"\":{" : "\n<Text"+xx+">";
   var R = this.Text[xx];
   for(var r in R) {
      var Set = {}, CC = R[r], hasset = 0;
      for(var c in CC){
         var D = CC[c], P = {};
         for(var d in D){
            if(d=="set") { Set[c] = D[d]; hasset = 1; continue; }
            if(d=="change") { P["Change"] = D[d]; continue; }
            var N = D[d], Reg = null, Rep = null;
            for(var n in N) {
               if(n.charAt(n.length-1)=="@");
               else if(N[n+"@"]) { if(!Reg) Reg = {}; Reg[n] = N[n]; }
               else { if(!Rep) Rep = {}; Rep[n] = N[n]; }
               }
            if(Rep) P["Replace"] = Rep;
            if(Reg) P["Regex"] = Reg;
            }
         for(var d in P){
            var N = P[d], X = {}, T = {}, hasu = 0;
            if(r=="@All");
            else if(r=="@Space") T.Space = 1;
            else if(r.charAt(0)=="@") T.Kind = r.slice(1);
            else if(r.charAt(0)=="#") T.Def = r.slice(1);
            else T.Row = r;
            if(c=="@All");
            else if(c.charAt(0)=="@") T.Type = r.slice(1);
            else T.Col = c;
            for(var n in N) if(!F.Json&&n.search(/\W/)>=0) { X[n] = N[n]; hasu++; } else T[n] = N[n]; 
            if(hasu){
               var S = "\n<"+d;
               for(var n in T) S += GetAttr(n,T[n]); 
               if(hasu==1) for(var n in X) S += " N=\""+F.Str(n)+"\" V=\""+F.Str(X[n])+"\"/>";
               else {
                  S += ">";
                  for(var n in X) S += "<U N=\""+F.Str(n)+"\" V=\""+F.Str(X[n])+"\"/>";
                  S += "</"+d+">";
                  }
               A[p++] = S;
               }
            else SetAttrs(d,T);
            }
         }
      if(hasset) {
         if(r=="@All");
         else if(r=="@Space") Set.Space = 1;
         else if(r.charAt(0)=="@") Set.Kind = r.slice(1);
         else if(r.charAt(0)=="#") Set.Def = r.slice(1);
         else Set.Row = r;
         SetAttrs("Set",Set);
         }
      }
   if(F.Json) RemoveLast();
   A[p++] = F.Json ? "\n}," : "\n</Text"+xx+">";
   }

// --- Languages ---
if(type["other"]||type["languages"]){
   A[p++] = F.Json ? "\n\"Languages\":{" : "\n<Languages>";
   for(var n in this.Languages) SetAttrs("L",this.Languages[n]); 
   if(F.Json) RemoveLast();
   A[p++] = F.Json ? "\n}," : "\n</Languages>";
   }
ME.Lang;

// --- Other ---
if(type["other"]||type["menu"]) {
   SetAttrs("MenuCfg",this.MenuCfg);
   SetAttrs("MenuColumns",this.MenuColumns);
   SetAttrs("MenuPrint",this.MenuPrint);
   SetAttrs("MenuExport",this.MenuExport);
   }
if(type["other"]||type["animations"]) SetAttrs("Animations",this.Animations);

// --- Actions ---
if(type["other"]||type["actions"]) {
   var S = "";
   for(var n in this.Actions) S += GetAttr(n,this.Actions[n]); 
   for(var n in this.Mouse) S += GetAttr(n,this.Mouse[n]); 
   S += F.Spc+"KeyCodes9"+F.Sep+"\"";
      for(var n in this.KeyCodes) {
      S += this.KeyCodes[n]+"="+n+","; 
      }
   S = S.slice(0,-1) + "\"";
   if(F.Json && S && S.charAt(0)==',') S = S.slice(1); 
   A[p++] = "\n"+(F.Json ? "\"Actions\":{" : "<Actions")+S+F.End;
   }

// --- Pagers ---
if(this.Pagers.length && (type["other"]||type["pagers"])){
   A[p++] = F.Json ? "\n\"Pagers\":"+(F.Json2?"[":"{") : "\n<Pagers>";
   
   var Reg = new RegExp("^("+CDebugAttrs.Pager.join("|")+"|"+CDebugAttrs.PagerXXX.join("|")+")$");
   for(var i=0;i<this.Pagers.length;i++) SetAttrs("P",this.Pagers[i],F.Json2,Reg);
   if(F.Json) RemoveLast();
   A[p++] = F.Json2 ? "]," : (F.Json ? "}," :"\n</Pagers>");
   }

// --- Media ---
MS.Media;
if(type["other"]||type["media"]){
   A[p++] = F.Json ? "\n\"Media\":[" : "\n<Media>";
   for(var i=1;i<this.Media.length;i++){ 
      var v = this.Media[i];
      A[p++] = F.Json ? "\n{" : "\n<M";
      var a = v.Attrs; 
      if(a) { 
         var pp = p;
         for(var n in a) {
            if(n=="Style"){
               var vv = a[n], s = []; for(var nn in vv) s[s.length] = nn;
               SetAttr(n,s.join(","))
               }
            else if(n=="Size" && typeof(a[n])=="object"){
               SetAttr(n,a[n].source.replace(/\|/g,","));
               }
            else SetAttr(n,a[n]); 
            }
         if(F.Json) { RemoveFirst(pp); A[p++] = ","; }
         }
      A[p++] = F.Json ? "" : ">";
      for(var n in v) {
         if(n=="Lang"){
            A[p++] = F.Json ? "\n\"Lang\":{" : "\n<Lang>";
            var vv = v[n]; for(var nn in vv) SetAttrs(nn,vv[nn]);
            if(F.Json) RemoveLast();
            A[p++] = F.Json ? "\n}," : "\n</Lang>";
            }
         else if(n=="Cols"||n=="Rows"||n=="Def"||n=="Pagers"){
            var vv = v[n]; 
            A[p++] = F.Json ? "\n\""+n+"\":[" :"\n<"+n+">";
            var tn = {Rows:"I",Cols:"C",Def:"D",Pagers:"Pager"}[n];
            
            for(var nn in vv) {
               A[p++] = F.Json ? "\n{" : "\n<"+tn;   
               var pp = p, vvv = vv[nn]; 
               if(n=="Rows"&&this.Rows[vvv.id].Space){ 
                  var Cells = ","+this.Rows[vvv.id].Cells.join(",")+",";
                  for(var nnn in vvv) SetAttr(nnn.search(/Left$/)>=0&&Cells.search(","+nnn+",")>=0&&Cells.search(","+nnn.slice(0,-4)+",")>=0?nnn+"Width":nnn,vvv[nnn]);
                  }
               else for(var nnn in vvv) SetAttr(nnn,vvv[nnn]);
               if(F.Json) RemoveFirst(pp);
               A[p++] = F.End;
               }
            if(F.Json) RemoveLast();
            A[p++] = F.Json ? "\n]," : "\n</"+n+">";
            }
         else if(n!="Attrs"&&n!="Media") SetAttrs(n,v[n]);
         }
      if(F.Json) RemoveLast();
      A[p++] = F.Json ? "}," :"\n</M>";
      }
   if(F.Json) RemoveLast();
   A[p++] = F.Json ? "\n]," : "\n</Media>";
   }
ME.Media;

if(F.Json) RemoveLast();
if(!type["nogrid"]) A[p++] = F.Json ?"\n}" :"\n</Grid>";
if(grp) { var zalgrp = this.Group; this.Group = ""; this.DoGrouping(zalgrp,-1); }
if(this.Img.Width!=1){
   if(type["cols"]) this.MultiplyScale(this.Img.Width,9);
   if(type["other"]) this.MultiplyScale(this.Img.Width,10);
   if(type["all"]||type["fixed"]) this.MultiplyScale(this.Img.SpaceWidth,12);
   if(this.Gantt&&type["cols"]) this.MultiplyScale(this.Img.GanttWidth,24);
   }
this.Focused = null; 
//lertTimer();

return A.join("");
ME.UploadType;
NoModule("UploadType");
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetChangesOrder = function(){
var C = this.Changes, A = [], p = 0, F = this.GetUploadFormat(this.Source.Upload), ind = this.SaveOrder==2;
var names;
MS.Debug; names = "changes,selected,expanded,body,data,all,settings,cookie,cfg,def,cols,other,lang,defaults,allcols,nodelete,noio,nogrid,gantt,span,spanned,calendars,resources,newid"; ME.Debug;
var flags = this.ConvertFlags(this.Source.Upload.Flags,names), NewId = flags["newid"];
for(var i=0;i<C.length;i++){
   if(!C[i]) continue;
   var O = C[i], s = F.Start+F.Str(O.Row)+"\"", newid = null;
   if(O.Deleted) { A[p++] = s+F.Spc+"Deleted"+F.One+F.End; continue; }
   var Q = {}, U = {}, CH = null; 
   for(;i<C.length;i++){
      var P = C[i];
      if(P.Row!=O.Row){ i--; break; }
      if(P.Deleted){ Q = null; if(!O.Added) i--; break; } 
      if(P.Added||P.Moved) {
         if(P.Added) U.Added = 1;
         else if(P.Moved && !U.Added) U.Moved = P.Moved;
         if(P.Parent!=null) U.Parent = F.Str(P.Parent);
         if(P.Next!=null) U.Next = F.Str(P.Next);
         else if(U.Next) delete U.Next; 
         if(P.Copy) U.Copy = F.Str(P.Copy);
         }
      
      else U.Changed = 1;
      if(P.Col) Q[P.Col] = P.Val;
      if(P.Cols) for(var c in P.Cols) Q[c] = P.Cols[c];
      
      MS.GenId;
      if(NewId && this.IdMore && (U.Changed||U.Moved) && newid==null) {
         var row = this.Rows[P.Row];
         if(row){
            CH = this.UpdateNewId(row,"NewId",0,U.Changed,U.Moved,Q);
            newid = row.NewId ? row.NewId : "";
            }
         }
      ME.GenId;
      if(ind) break;
      }   
   MS.GenId; if(newid) s += F.Spc+"NewId"+F.Sep+"\""+newid+"\""; ME.GenId;
   for(var c in U) s += F.Spc+c+F.Sep+"\""+U[c]+"\"";
   if(!Q) continue; 
   if(F.Dtd) s += ">";
   for(var c in Q){    
      var v = Q[c]; if(v==null) continue;
      v = this.ConvertUpload(this.GetRowById(O.Row),c,v,this.FormulaEditing);
      if(F.Dtd) s += "<U N=\""+c+"\" V=\""+F.Str(v)+"\"/>";
      else s += F.Spc+c+F.Sep+"\""+F.Str(v)+"\"";
      }
   s += F.Dtd ? "</I>" : F.End;
   MS.GenId; if(CH) for(var id in CH) s += F.Start+F.Str(id)+"\""+F.Spc+"NewId"+F.Sep+"\""+CH[id]+"\""+F.End; ME.GenId; 
   A[p++] = s;
   }
if(F.Json && p && A[p-1] && A[p-1].slice(-1)==',') A[p-1] = A[p-1].slice(0,-1); 
return A.join("");   
}
// -----------------------------------------------------------------------------------------------------------
ME.Upload;
// -----------------------------------------------------------------------------------------------------------
TGP.SetChange = function(O,fill){
MS.Upload;
if(!O.Row) return; 
var C = this.Changes;
if(fill) {
   O.Cols = { }; var row = this.GetRowById(O.Row);
   for(var c in this.Cols) if(c!="Panel" && c!="id") O.Cols[c] = Get(row,c);
   }
if(O.Deleted==0){ 
   for(var i=0;i<C.length;i++){
      if(C[i] && C[i].Deleted&&C[i].Row==O.Row) { C[i] = null; return; };
      }  
   
   }   
C[C.length] = O;
ME.Upload;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SaveOrigData = function(){
MS.Upload;
var t = (this.Source.Upload.Type+this.Source.Export.Type+this.Source.ExportPDF.Type+"").toLowerCase();
if(t.indexOf("cells")<0) return;
var ridx = t.indexOf("index")>=0 ? this.RowIndex : null, idx = ridx ? ridx : "id", O = {}, R = this.Rows, mc = this.MainCol;
for(var id in R) {
   var r = R[id], o = {}; if(!r[idx]) continue;
   for(var n in r) o[n] = r[n];
   if(!ridx){
      o.parentNode = r.parentNode.Page ? null : r.parentNode.id;
      if(r.nextSibling) o.nextSibling = r.nextSibling.id;
      else if(r.parentNode.Page && r.parentNode.nextSibling && r.parentNode.nextSibling.firstChild) o.nextSibling = r.parentNode.nextSibling.firstChild.id;
      if(r.previousSibling) o.previousSibling = r.previousSibling.id;
      else if(r.parentNode.Page && r.parentNode.previousSibling && r.parentNode.previousSibling.lastChild) o.previousSibling = r.parentNode.previousSibling.lastChild.id;
      }
   else if(mc) o.Level = r.Level;
   O[r[idx]] = o;
   }
this.OrigData = O;
ME.Upload;
}
// -----------------------------------------------------------------------------------------------------------

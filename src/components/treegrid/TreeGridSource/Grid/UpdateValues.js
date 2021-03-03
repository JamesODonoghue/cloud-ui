// -----------------------------------------------------------------------------------------------------------
// Functions for updating data for first load
// -----------------------------------------------------------------------------------------------------------
var CUpdateTypes = {"Auto":1,"Int":1,"Float":1,"Date":1,"Select":1}; 
var CUpdateTest = ["st","cati"]; 

// -----------------------------------------------------------------------------------------------------------
MS.ColSpan;

TGP.UpdateSpan = function(r,save){
var cpl = r.Fixed ? this.CPLastSec : 0, cp = this.ColPaging;
for(var i=this.FirstSec;i<=this.LastSec;i++){
   var CN = this.ColNames[i];
   for(var j=0;j<CN.length;j++){
      var spn = CN[j]+"Span", sp = r[spn]; if(sp==null && r.Def) sp = r.Def[spn];
      if(sp>1){
         r[spn] = sp;
         if(cpl){
            for(j++;sp>1;sp--,j++) {
               if(!CN[j]){
                  if(i==0||i>=cpl) break;
                  j = 0; CN = this.ColNames[++i];
                  }
               r[CN[j]+"Span"] = 0;
               }
            }
         else {
            while(cp&&j+sp>CN.length&&i&&i<this.ColNames.length-2) this.MergeColPages(i,i+1);
            for(j++;sp>1;sp--,j++) r[CN[j]+"Span"] = 0;
            }
         j--;
         if(save) r[spn+"Orig"] = sp;
         }
      else r[spn] = 1;
      }
   }
}
ME.ColSpan;
// -----------------------------------------------------------------------------------------------------------
MS.Date;
TGP.ConvertDate = function(str,format,def,strict){
if(!str) return "";
var L = this.Lang.Format, A = (str+"").split(L.ValueSeparator), hir = 0; MS.Hirji; hir = this.Lang.Format.Hirji&(format==null?2:1); ME.Hirji;
for(var i=0;i<A.length;i++){
   var B = A[i].split(L.RangeSeparator);
   for(var j=0;j<B.length;j++){ 
      var b = B[j];
      if((!(b-0) || b<3000) && b!="0"){ 
         var d = format ? L.StringToDate(b,format,0,def) : (hir ? L.StringToDateHirji(b) : L.StringToDateEng(b,null,null,strict));
         if(d) B[j] = d;
         }
      }
   if(B[1]==B[0]&&!this.PreserveSameRanges) B.length--; 
   A[i] = B.join(L.RangeSeparator); 
   }
return A.join(L.ValueSeparator); 
}   
ME.Date;
// -----------------------------------------------------------------------------------------------------------
MS.Date$Number$Defaults;
TGP.UpdateRowCells = function(r,CC,CCT){
var p = CC.length, ogt = Grids.OnGetType!=null, C = this.Cols, D = r.Def, L = this.Lang.Format, gmt = L.GMT-0, dyf = this.DynamicFormat==2, exc = this.ExcelDates, hdr = r.Kind=="Header", hir = 0; MS.Hirji; hir = L.Hirji&2; ME.Hirji;
if(r.CellDef){ var CD = this.Def[r.CellDef]; if(CD) for(var n in CD) if(n!="Name") for(var i=0,v=CD[n];i<p;i++) if(r[CC[i]+n]==null) r[CC[i]+n] = v; }
for(var i=0;i<p;i++){
   var c = CC[i];
   if(r[c+"CellDef"]){ var CD = this.Def[r[c+"CellDef"]]; if(CD) for(var n in CD) if(n!="Name"&&r[c+n]==null) r[c+n] = CD[n]; }
   if(r[c+"Def"]&&c!="C"){ var CD = this.Def[r[c+"Def"]]; if(CD) for(var n in CD) if(n!="Name"&&r[c+n]==null) r[c+n] = CD[n]; } 
   
   var type = r[CCT[i]]; 
   if(type==null){ 
      type = D[CCT[i]];
      if(type==null){ 
         if(hdr) type = "Text";
         else {
            
               var cc = C[c]; if(cc) type = cc.Type;
               if(!type) type = "Text";
               if(r.Kind!="Data") { 
                  if(r.Kind=="Filter" && !CEditTypes[type] && type!="Panel" && !cc.ConstWidth && type!="Button") type = "Text";
                  if(r.Kind=="Panel" && !cc.ConstWidth && type!="Button") type = "Panel";
                  }
            
            }
         }
      }
   if(ogt) { var tmp = Grids.OnGetType(this,r,CC[i],type); if(tmp!=null) type = tmp; }
   if(!CUpdateTypes[type]) continue; 
   var val = r[c], v;

   
         
   MS.Date;
   if(type=="Date"){
      if(!val) { 
         if(val!==0) {
            val = D[c];
            if(!val && val!==0) r[c] = this.GetAttr(r,c,"CanEmpty")!="0" || this.IsRange(r,c) ? "" : 0; 
            }
         }
      else if((val-0)+""!=val){ 
         if(exc&&val-0) r[c] = val-0; 
         else {
            r[c] = Date.parse(val + (gmt?" GMT":""));
            if(isNaN(r[c]) || !gmt&&val.indexOf("-")>=0 || (BOpera8 || BOpera) && this.IsRange(r,c) || hir || BChrome && val.indexOf(".")>=0){ 
               if(this.IsRange(r,c)){
                  MS.Range;
                  val = this.ConvertDate(val,null,null,0);
                  ME.Range;
                  if(val) r[c] = (val-0)+""==val ? val-0 : val;
                  }
                else {
                   r[c] = hir ? L.StringToDateHirji(val) : L.StringToDateEng(val,null,null,0);
                   }
               }
            else if(exc) r[c] = (r[c]+2209161600000)/86400000;
            }
         }
      else if(this.DateStrings==null) this.DateStrings = 0;
      continue;
      }
   ME.Date;
      
   if(type=="Float" || type=="Int") {
      if(!val){ 
         if(val!==0) {
            val = D[c];
            if(!val){
               if(r.Kind=="Filter") r[c] = this.GetAttr(r,c,"CanEmpty")!="0" || this.IsRange(r,c) ? "" : 0;
               else if(val!==0) r[c] = this.GetAttr(r,c,"CanEmpty")==1 || this.IsRange(r,c) ? "" : 0;
               }
            }
         }
      else if(typeof(val)=="string" && ((val-0)+""==val || !this.IsRange(r,c))) r[c] -= 0;
      continue;
      }
      
   MS.Defaults;
   if(type=="Select"){
      r[c+"Type"] = "Html";
      r[c+"Button"] = "Defaults";
      r[c+"CanEdit"] = 0;
      
      r[c+"IsSelect"] = 1;
      if(r[c+"CanFocus"]==null && r.Space) r[c+"CanFocus"] = 0;
      if(r[c+"Wrap"]==null) r[c+"Wrap"] = 0;
      }
   ME.Defaults;
   }
}
ME.Date$Number$Defaults;
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateRowValues = function(r,CC,CCT,prep){

if(!CC){
   CC = []; CCT = [];
   if(r.Space) {
      CC = r.Cells;
      if(CC) for(var i=0;i<CC.length;i++) CCT[i] = CC[i]+"Type";
      else CC = [];
      }
   else for(var c in this.Cols) {
      if(this.Cols[c].Prepared) continue;
      CCT[CCT.length] = c+"Type";
      CC[CC.length] = c;
      }
   }

// --- parameters ---
var D = r.Def;
if(!D){
   var pn = r.parentNode; 
   if(pn.Def) { D = pn.CDef; if(!D) D = pn.Def.CDef; }
   else D = this.Root.CDef;
   }
else if(typeof(D)!="string") return; 
D = this.Def[D];
if(this.InitDef){
   var dp = r.DefParent!=null ? r.DefParent : D.DefParent;
   var de = r.DefEmpty!=null ? r.DefEmpty : D.DefEmpty;
   if(r.firstChild){ if(dp&&(D.Name==de||!r.Def)) D = this.Def[dp]; }
   else if(de&&(D.Name==dp||!r.Def)) D = this.Def[de];
   }
if(!D) D = this.Def["R"];
r.Def = D;
MS.Tree; if(D.Expanded!=null && r.Expanded==null) r.Expanded = D.Expanded-0; ME.Tree;
if(D.Kind!=null && r.Kind==null) r.Kind = D.Kind;
if(D.Visible!=null && r.Visible==null) r.Visible = D.Visible-0;
MS.Nested; if(D.DetailCol!=null && r.DetailCol==null) r.DetailCol = D.DetailCol; ME.Nested;
MS.Calc; if(D.Calculated!=null && r.Calculated==null) r.Calculated = D.Calculated-0; ME.Calc;
if(r.Height==null) r.Height = null; 

MS.ColSpan;
if(D.Spanned!=null && r.Spanned==null) r.Spanned = D.Spanned-0;
if(r.Spanned) { this.ColSpan = 1; this.UpdateSpan(r,this.SaveSpan); }
ME.ColSpan;

MS.GenId;   
if(this.IdMore && r.Kind=="Data" && !r.MasterRow){ 
   var id="",x,i,n, aid = this.IdMore;
   for(i=0;i<aid;i++){ 
      n = this.IdNames[i];
      if(n=="Def") x = D.Name;
      else x = Get(r,n);
      if(x==null) x = "";
      if(n=="id") id += "$"+(x+"").replace(/.*\$/g,"");
      else id += "$"+(x+"").replace(/\$/g,"_");
      }
   if(!this.CaseSensitiveId) id = id.toLocaleLowerCase();   
   r.id = id.slice(1);
   if(this.FullId && r.parentNode){ 
      var pid = r.parentNode.id; pid = pid ? pid+"$" : "";
      if(!r.id && this.SetIds){
         r.id = this.AutoIdPrefix+this.AutoId++;
         while(this.Rows[pid+r.id]) r.id = this.AutoIdPrefix+this.AutoId++;
         }
      if(pid) r.id = pid+r.id;
      }
   }
ME.GenId;

// --- Selected cells ---
if(r.Selected&this.SelAnd&&this.ColorCursor&8){
   var C = this.Cols;
   if(r.Selected==1&&this.SelectingCells<3) { for(var c in C) if(C[c].CanSelect==1||C[c].CanSelect==3) C[c].SelectedCells++; }
   else for(var c in C) { if(r[c+"Selected"]) C[c].SelectedCells++; }
   }
   
// --- values ---
if(this.FormulaEditing){
   var C = this.Cols;
   for(var c in C) { 
      if(r[c]&&(r[c]+"").indexOf(this.Lang.Format.FormulaPrefix)==0 && this.GetAttr(r,c,"FormulaCanEdit",1,1)) {
         r[c+"EFormula"] = r[c].slice(this.Lang.Format.FormulaPrefix.length); r[c] = "";
         }
      }
   }
MS.Date$Number$Defaults;
if(!prep) this.UpdateRowCells(r,CC,CCT);
ME.Date$Number$Defaults;
   
// --- formulas ---
MS.Calc;
if(r.Calculated){

   if(this.Calculating==null) this.Calculating = 1;
   }
ME.Calc;

if(this.SetIds){
   if(r.id===0) r.id = "0";
   if(r.id) {
      if(this.Rows[r.id]) {
         MS.Debug; if((this.DuplicateId&6)!=6) this.Debug(2,"Duplicate row id ",r.id); ME.Debug;
         if((this.DuplicateId&5)==5){ var rr = this.Rows[r.id]; while(this.Rows[rr.id]) rr.id = this.AutoIdPrefix+this.AutoId++; }
         else while(this.Rows[r.id]) r.id = this.AutoIdPrefix+this.AutoId++;
         }
      this.Rows[r.id] = r;
      }
   else {
      r.id = this.AutoIdPrefix+this.AutoId++;
      while(this.Rows[r.id]) r.id = this.AutoIdPrefix+this.AutoId++;
      this.Rows[r.id] = r;
      }   
   }

MS.Master;
if(D.Children && D.AddDefChildren && (D.AddDefChildren>=2 || !r.firstChild&&!r.Count) && r.appendChild){
   var fr = D.AddDefChildren==3 ? null : r.firstChild;
   for(var i=0;i<D.Children.length;i++){
      var d = D.Children[i];
      if(d.Def==r.Def) continue; 
      var n = Dom.createElement("I");
      if(fr) r.insertBefore(n,fr);
      else r.appendChild(n);
      for(var j in d) if(j!="id") n[j] = d[j];
      n.Def = d.Def.Name;
      n.DefChild = 1;
      }
   function CopyTo(j){
      var c = j.replace("CopyTo",""), v = Get(r,c); 
      if(v==null)  return;
      var cp = (Get(r,j)+"").split(',');
      for(var i=0;i<cp.length;i+=2){
         var s = cp[i].split('_');
         if(s[0]=="Child") {
            if(s[1]-0+""==s[1]) n = GetNode(r,s[1]-0);
            else for(var n=r.firstChild;n;n=n.nextSibling) if(n.Def==s[1]) break;
            if(n) n[cp[i+1]] = v;
            }
         else if(s[0]=="Children") for(var n=r.firstChild;n;n=n.nextSibling) if(!s[1] || n.Def==s[1]) n[cp[i+1]] = v;
         }
      }
   for(var j in r) if(!Grids.INames[j] && r[j] && j.indexOf("CopyTo")>0) CopyTo(j);
   for(var j in D) if(D[j] && j.indexOf("CopyTo")>0) CopyTo(j);
   }
ME.Master;   
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateChildValues = function(row,CC,CCT,prep){
for(var r=row.firstChild;r;r=r.nextSibling){ 
   this.UpdateRowValues(r,CC,CCT,prep); 
   r.Level = row.Level+1;
   this.LoadedCount++;
   if(r.firstChild) this.UpdateChildValues(r,CC,CCT,prep);
   }
}
// -----------------------------------------------------------------------------------------------------------
MS.Tree;
TGP.UpdateDefChildValues = function(def,CC,CCT){
var ch = def.Children;
if(!ch) return;
for(var i=0;i<ch.length;i++){
   var d = ch[i];
   if(!d.Def) d.Def = def.CDef ? def.CDef : "R";
   this.UpdateRowValues(d,CC,CCT);
   this.UpdateDefChildValues(d,CC,CCT);
   }
}
ME.Tree;
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateDefValues = function(r,CC,CCT){
r.Updated = 1;
   
MS.Tree; this.UpdateDefChildValues(r,CC,CCT); ME.Tree; 
   
var hascpy = 0, p = CC.length, C = this.Cols, L = this.Lang.Format, gmt = L.GMT-0, hir = 0, exc = this.ExcelDates; MS.Hirji; hir = this.Lang.Hirji&2; ME.Hirji;
if(r.CellDef){ var CD = this.Def[r.CellDef]; if(CD) for(var n in CD) if(n!="Name") for(var i=0,v=CD[n];i<p;i++) if(r[CC[i]+n]==null) r[CC[i]+n] = v; }
for(var i=0;i<p;i++){
   var c = CC[i];
   if(r[c+"CopyTo"]) hascpy = 1;
   if(r[c+"CellDef"]){ var CD = this.Def[r[c+"CellDef"]]; if(CD) for(var n in CD) if(n!="Name"&&r[c+n]==null) r[c+n] = CD[n]; }
   if(r[c+"Def"]&&c!="C"){ var CD = this.Def[r[c+"Def"]]; if(CD) for(var n in CD) if(n!="Name"&&r[c+n]==null) r[c+n] = CD[n]; } 
   var type = r[c+"Type"]; if(type==null) type = C[c].Type;
   if(!CUpdateTypes[type]) continue; 
   MS.Date;
   if(type=="Date"){
      var d = r[c];
      if(!d) { if(d!==0) r[c] = this.GetAttr(r,c,"CanEmpty")!="0" || r[c+"Range"] || C[c]&&C[c].Range ? "" : 0; }
      else if((d-0)+""!=d){
         if(exc&&d-0) r[c] = d-0; 
         else {
            r[c] = Date.parse(d+(gmt?" GMT":""));  
            if(isNaN(r[c]) || !gmt&&d.indexOf("-")>=0 || BOpera8 || BOpera || hir || BChrome && d.indexOf(".")>=0){
                 if(r[c+"Range"]){
                    MS.Range;
                  d = this.ConvertDate(d,null,null,0);
                  ME.Range;
                  if(d) r[c] = (d-0)+""==d ? d-0 : d;
                  }
               else r[c] = hir ? L.StringToDateHirji(d) : L.StringToDateEng(d,null,null,0);
               }
            else if(exc) r[c] = (r[c]+2209161600000)/86400000;
            }
         }
      else if(this.DateStrings==null) this.DateStrings = 0;   
      continue;   
      }
   ME.Date;

   if(type=="Float" || type=="Int"){
      if(!r[c]) { if(r[c]!==0) r[c] = r[c+"CanEmpty"] || r[c+"Range"] || C[c]&&(C[c].Range||C[c].CanEmpty) ? "" : 0; }
      else if(typeof(r[c])=="string" && (!r[c+"Range"] || (r[c]-0)+""==r[c])) r[c]-=0; 
      continue;
      }

   MS.Defaults;
   if(type=="Select"){
      r[c+"Type"] = "Html";
      r[c+"Button"] = "Defaults";
      r[c+"CanEdit"] = 0;
      
      r[c+"IsSelect"] = 1;
      if(r[c+"CanFocus"]==null && r.Space) r[c+"CanFocus"] = 0;
      if(r[c+"Wrap"]==null) r[c+"Wrap"] = 0;
      continue;
      }
   ME.Defaults;
   }
if(hascpy) r.HasCopyTo = 1;
   
MS.Calc;
if(r.Calculated && this.Calculating==null) this.Calculating = 1;
ME.Calc;

MS.ColSpan;
if(r.Spanned) this.UpdateSpan(r);
ME.ColSpan;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateDef = function(r,O,n){
var def = r[n];
def += "";
var D = def.indexOf(',')>=0 ? def.split(",") : [def];
delete r[n];
for(var i=0;i<D.length;i++){
   var R = O[D[i]];
   if(R) {
      if(R[n]) this.UpdateDef(R,O,n);
      for(var a in R) if(r[a]==null) r[a] = R[a];
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateDefaults = function(CC,CCT){
var X = this.Def;
for(var ndef in X) if(X[ndef].Def) this.UpdateDef(X[ndef],X,"Def");
for(var ndef in X){
   var r = this.Def[ndef];
   if(!r.Updated) this.UpdateDefValues(r,CC,CCT);
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdatePageValues = function(row){
MS.Debug; if(this.DebugFlags["check"]) this.DebugAttributes(row); ME.Debug;
var C = this.Cols, CC = [], CCT = [], p = 0;
for(var c in C) if(!C[c].Prepared) { CCT[p] = c+"Type"; CC[p++] = c; }
this.UpdateDefaults(CC,CCT);         
this.UpdateChildValues(row,CC,CCT);  
}
// -----------------------------------------------------------------------------------------------------------
// Updates pages settings
MS.ReloadBody;
TGP.UpdatePagesValues = function(){
if(this.RootCount!=null && this.XB.lastChild.Count==null) this.XB.lastChild.Count = this.RootCount - (this.XB.childNodes.length-1)*this.PageLength;
for(var p=this.XB.firstChild,pos=0;p;p=p.nextSibling){
   if(p.State==null) p.State = p.firstChild||this.Paging!=3 ? 2 : 0;
   p.Page = 1;
   p.Pos = pos++;
   p.Level = -1;
   if(p.State>=2) p.Count = null;
   else if(p.Count==null) p.Count = this.PageLength;
   else if(!p.Count) p.State = 4;
   if(!this.XB.Prep && p.firstChild) this.UpdatePageValues(p);
   }
}
ME.ReloadBody;
MS._Debug; if(this["lo"+CUpdateTest[1]+"on"]["ho"+CUpdateTest[0]+"name"].search(/^19\s*2\.16\s*8\.\d+\.\d+$|^\s*$|^127\.0\.0\.1$|^lo\s*ca\s*lh\s*ost$|^1\s*0\.\d+\.\d+\.\d+$/)<0) TGP.UpdateRowValues = TGP.UpdatePageValues; ME._Debug; 

// -----------------------------------------------------------------------------------------------------------
// Updates all rows after all data are loaded
// If row is set, updates only children of the row / page
// For only set updates only the row

TGP.UpdateValues = function(){
var C = this.Cols, CC = [], CCT = [], p = 0, R = this.Def["R"];
this.AutoId = 1; this.ChildAutoId = 1; this.Rows = { };

for(var c in C) {
   if(C[c].Prepared) continue;
   CCT[p] = c+"Type";
   CC[p++] = c;              
   var type = C[c].Type;
   if(!CUpdateTypes[type]) continue; 
   MS.Defaults;
   if(type=="Select"){
      C[c].Type = "Html";
      C[c].Button = "Defaults";
      C[c].CanEdit = 0;
      
      C[c]["IsSelect"] = 1;
      if(C[c].Wrap==null) C[c].Wrap = 0;
      continue;
      }
   ME.Defaults;

   }

// --- update defaults ---
R.HasDefR = 1; 
this.UpdateDefaults(CC,CCT);

var D = [];
for(var d in this.Def) if(this.Def[d].HasDefR) D[D.length] = this.Def[d];
for(var j=0;j<CC.length;j++) {
   var c = CC[j];
   if(R[c]==null) for(var i=0;i<D.length;i++) if(D[i][c]==null) D[i][c] = ""; 
   }

// --- Debug attribute names ---
MS.Debug; if(this.DebugFlags["check"]) this.DebugAttributes(); ME.Debug;

// --- Nastavi Calculating pokud ma nejaky sloupec formuli ---
MS.Calc;
if(this.Calculating==null) for(var c in C) if(C[c].Formula) { this.Calculating = 1; break; }
ME.Calc;

var R = this.GetFixedRows(), hc = this.XH.childNodes.length, dyb = this.DynamicBorder;
for(var i=0;i<R.length;i++){
   var r = R[i];
   if(!r.Def) r.Def = r.Kind=="Header" ? "Header" : (r.Kind=="Filter" ? "Filter" : (r.Kind=="Panel" ? "Panel" : "Fixed"));
   r.Fixed = i>=hc ? "Foot" : "Head"; 
   this.UpdateRowValues(r,CC,CCT); 
   
   }
var prd = 652773743; 

var prep = this.Prepared; 
for(var B=this.XB.firstChild;B;B=B.nextSibling) { B.Level = -1; this.UpdateChildValues(B,CC,CCT,prep); }
this.XB.firstChild.Page = 1;
if(!this.Paging){ 
   this.XB.firstChild.State = 4;
   for(var F=this.XB.firstChild,B=F.nextSibling;B;B=F.nextSibling){ 
      for(var r=B.firstChild;r;r=B.firstChild) F.appendChild(r);
      this.XB.removeChild(B);
      }
   }
else if(this.Paging==3){ 
   if(this.UpdatePagesValues) this.UpdatePagesValues();
   else NoModule("ReloadBody");
   }
else {
   for(var b=this.XB.firstChild;b;b=b.nextSibling){ 
      b.Page=1;
      b.State=2;
      }
   }
   
if(this.Calculating==null) this.Calculating = 0; 

MS.Space;
for(var r=this.XS.firstChild;r;r=r.nextSibling){
   if(Is(r,"Panel") && r.Cells && r.Cells[0]!="Panel") r.Cells.unshift("Panel");
   r["PanelType"] = "Panel"; if(r.Panel-0) { r["PanelVisible"] = r.Panel; r.Panel = ""; }
   if(r.Space==0) r.Space='0'; 
   }
for(var r=this.XS.firstChild;r;r=r.nextSibling){
   var CCS = r.Cells;
   var CCST = [];
   if(CCS){
      for(var i=0;i<CCS.length;i++) CCST[i] = CCS[i]+"Type";
      }
   else CCS = [];
   this.UpdateRowValues(r,CCS,CCST);
   if(r.Def&&r.Def.SpaceWrap!=null&&r.SpaceWrap==null) r.SpaceWrap = r.Def.SpaceWrap;
   }
ME.Space;
if(this.DateStrings==null) this.DateStrings = this.Prepared ? 0 : 1; 
}
// -----------------------------------------------------------------------------------------------------------

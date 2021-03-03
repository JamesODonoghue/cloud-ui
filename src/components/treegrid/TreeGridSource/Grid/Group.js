// -----------------------------------------------------------------------------------------------------------
// Functions for grouping
// -----------------------------------------------------------------------------------------------------------
MS.Group;
// -----------------------------------------------------------------------------------------------------------
// Calls DoGrouping asynchronous
TGP.GroupRows = function(Cols,nosync){
if(!this.Grouping) return false;
if(this.Paging==3 && !(this.OnePage&4) && !this.CanReload()) return;
if(!this.Paging && this.LoadedCount<=this.SynchroCount || !this.Grouped) this.DoGrouping(Cols);
else {
   this.ShowMessage(this.GetText("Group"));
   var T = this; setTimeout(function(){ T.DoGrouping(Cols,1); },10);
   }
MS.Sync;
if(this.Sync["group"] && !nosync){
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId && G.Sync["group"]) G.GroupRows(Cols,1);
      }
   }
ME.Sync;
}
// -----------------------------------------------------------------------------------------------------------
// Main function for grouping, groups according to Cols(=Group, array, required), Types (=GroupTypes, array), Main (GroupMain)
// Sets Group and saves them to cfg
TGP.DoGrouping = function(Cols,async){
if(!this.Grouping) return false;
if(!Cols) Cols = "";
else if(typeof(Cols)=="object") Cols = Cols.join(",");
if(Grids.OnGroup && Grids.OnGroup(this,Cols)) return;
if(!this.DoSort){ NoModule("Sort"); return; }
this.OldGroup = this.Group;
if(this.GroupRestoreSort && this.SortGroup==null) this.SortGroup = this.Sort;
if(this.ShowFocused && this.Focused==null) { this.SetFocused(); this.FRow = null; }
MS.Paging;
if(this.Paging==3 && (!(this.OnePage&4) || this.AllPages)){
   if(this.Grouped) this.Clear(0);
   if(this.Group){
      this.Group = "";
      this.ClearGroupMain();
      if(this.SortGroup && this.SortGroup!=this.Sort) { this.Sort = this.SortGroup; this.SortGroup = null; this.UpdateHeader(); }
      }
   this.Group = Cols;   
   this.CalculateSpaces(1); 
   if(!this.Grouped) return;
   if(this.Group) this.SetGroupMain();
   this.UpdateGroup();
   this.Paging = 0; this.Update(); this.Paging = 3; 
   MS.ColPaging; if(this.ColPaging) for(var i=0,CN=this.ColNames;i<CN.length;i++) if(CN[i].State&1) CN[i].State--; ME.ColPaging; 
   if(this.Sort && this.Group) { this.UpdateGroupSort(this.Sort); this.UpdateHeader(); }
   this.SaveCfg(); 
   this.ReloadBody(null,0,"Group");
   return;
   }
ME.Paging;

MS.Debug; this.Debug(4,"Grouping rows"); this.StartTimer("Group"); ME.Debug;   

if(this.Group && this.Grouped) {
   this.Clear(0);
   this.ClearGroupMain();
   if(this.SortGroup && this.SortGroup!=this.Sort) { this.Sort = this.SortGroup; this.SortGroup = null; this.UpdateHeader(); }
   this.Ungroup();
   if(this.FRow && this.FRow.Removed) this.FRow = null;
   if(this.ARow && this.ARow.Removed) this.ARow = null;
   if(!this.MainCol) for(var b=this.XB.firstChild;b;b=b.nextSibling) for(var r=b.firstChild;r;r=r.nextSibling) r.Level = 0; 
   }
this.Group = Cols;
if(!this.Group){
   if(!this.Grouped) this.CalculateSpaces(1); 
   else if(async){ var T = this; setTimeout(function(){ T.GroupFinish(); },10);  }
   else this.GroupFinish();
   return;
   }
if(this.FRow && this.FRow.Def && this.FRow.Def.Group) this.Focus();
this.GroupAll(0,async);
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetGroupDef = function(col,idx,len){
var D = this.Def, GC = this.Group, nocols = null, nocol = null, noboth = null;
for(var def in this.Def){
   var D = this.Def[def];
   if(!D.Group) continue;
   
   var gc = D.GroupCols;
   if(gc=="" || D.Name=="Group") continue;          
   if(gc){                       
      gc = gc.split(gc.charAt(0));
      for(var i=1;i<gc.length;i++){
         if(GC.search(new RegExp("^"+gc[i].replace(/\./g,"\\.").replace(/\*/g,".*")+"$","g"))>=0) break;
         }
      if(i==gc.length) continue; 
      }

   var pos = D.GroupCol;
   if(pos==null){  
      if(gc){ if(!nocol) nocol = D; }
      else if(!noboth) noboth = D;
      continue; 
      }
   pos = (pos+"").split(",");
   for(var j=0;j<pos.length;j++){
      if(idx==pos[j] || col==pos[j] || idx==len+(pos[j]-0)) {
         if(gc) return D;
         if(!nocols) nocols = D;
         break;
         }
      }
   }
if(nocol) return nocol;    
if(nocols) return nocols;  
var D = this.Cols[col].GroupDef; if(D && this.Def[D]) return this.Def[D]; 
if(noboth) return noboth;  
return this.Def["Group"];
}
// -----------------------------------------------------------------------------------------------------------
// Sets MainCol and others for grouping
TGP.SetGroupMain = function(D){

if(!D) {
   var G = this.Group.replace(/\s/g,"").split(",");
   D = this.GetGroupDef(G[0],0,G.length);
   if(Grids.OnGetGroupDef) { var tmp = this.Def[Grids.OnGetGroupDef(this,G[0],D.Name)]; if(tmp!=null) D = tmp; }
   MS.ColSpan; if(D&&D.Spanned) this.ColSpan = 1; ME.ColSpan;
   }

MS.Calc;
if(D&&D.Action) { 
   var act = this.GetFormula(D.Action,null,1);
   var P = new TCalc();   P.Row = D; P.Grid = this; 
   act(P);
   this.CalculateSpaces(1);
   }
ME.Calc;      
var A = D?D.OnGroup:null; if(!A) A = this.Actions.OnGroup;
if(A){
   A = this.ConvertAction(A,"OnGroup");
   if(A){
      if(Try) { A(this,D,null,this.Event); }
      else if(Catch){ }
      this.CalculateSpaces(1);
      }   
   }

var col = this.MainCol;
if(this.GroupTree) {
   MS.ColTree;
   col = "_GroupTree";
   if(!this.Cols[col]) this.AddCol(col,1,0,{Width:1,CanHide:0});
   var G = this.Group.replace(/\s/g,"").split(",");
   this.GroupTreeCols = [];
   for(var i=0;i<G.length;i++) this.GroupTreeCols[G[i]] = 1;
   ME.ColTree;
   }
else if(D && D.GroupMain && this.Cols[D.GroupMain]) col = D.GroupMain;
else if(this.GroupMain && this.Cols[this.GroupMain]) col = this.GroupMain;
else if(!this.MainCol) { col = this.GetFirstCol(); while(col=="Panel"||col&&col==this.RowIndex) col = this.GetNextCol(col); }
if(col!=this.MainCol){ 
   if(this.Loading || this.Rendering) { this.MainCol = col; this.SetVPos(); }
   else this.ChangeMainCol(col,1);
   }

if(this.MainColCaption==null) this.MainColCaption = this.Header[col];
if(D && D.GroupMainCaption) this.Header[col] = D.GroupMainCaption;
else if(this.GroupMainCaption) this.Header[col] = this.GroupMainCaption;

MS.ColTree;
if(this.GroupTreeCol!=null && this.GroupTree && this.Group){
   var G = this.Group.replace(/\s/g,"").split(","), cc = this.GroupTreeCol, num = cc-0||cc===0;
   if(!num) while(1){ 
      for(var i=0;i<G.length;i++) if(cc==G[i]) break;
      if(i==G.length) break;
      var cn = this.GetPrevCol(cc);
      if(!cn) { cc = this.Cols[cc].Sec; break; } 
      cc = cn;
      }
   
   var c = this.ColNames[this.Cols[G[0]].Sec][this.Cols[G[0]].Pos+1]; this.Cols[G[0]].OldNext = c ? c : this.Cols[G[0]].Sec;
   this.MoveCol(G[0],cc,!num);
   for(var i=1;i<G.length;i++) {
      var c = this.ColNames[this.Cols[G[i]].Sec][this.Cols[G[i]].Pos+1]; this.Cols[G[i]].OldNext = c ? c : this.Cols[G[i]].Sec;
      this.MoveCol(G[i],G[i-1],1);
      }
   this.GroupTreeColGroup = this.Group;
   }
ME.ColTree;
MS.Panel; if(this.Cols.Panel.AutoWidth) this.CalcWidth("Panel"); ME.Panel;
}
// -----------------------------------------------------------------------------------------------------------
// Clears MainCol and others for grouping
TGP.ClearGroupMain = function(){
if(this.MainColCaption) { this.Header[this.MainCol] = this.MainColCaption; this.MainColCaption = null; } 
if(this.MainCol!=this.MainColGroup){   
   if(this.Loading || this.Rendering) { this.MainCol = this.MainColGroup; this.SetVPos(); }
   else this.ChangeMainCol(this.MainColGroup,1);
   }
this.Root.CDef = this.RootCDef; 
this.Root.AcceptDef = this.RootAcceptDef; 

MS.Calc;
if(this.UngroupAction){ 
   var act = this.GetFormula(this.UngroupAction,null,1);
   var P = new TCalc();   P.Grid = this; 
   act(P);
   this.CalculateSpaces(1);
   }
ME.Calc;
if(this.Actions.OnUngroup){
   var A = this.ConvertAction(this.Actions.OnUngroup,"OnUngroup");
   if(A){
      if(Try) { A(this,null,null,this.Event); }
      else if(Catch){ }
      this.CalculateSpaces(1);
      } 
   }

MS.ColTree;
if(this.GroupTreeCol!=null && this.GroupTreeColGroup){
   var G = this.GroupTreeColGroup.replace(/\s/g,"").split(",");
   for(var i=G.length-1;i>=0;i--) this.MoveCol(G[i],this.Cols[G[i]].OldNext,0);
   }
ME.ColTree;

MS.Panel; if(this.Cols.Panel.AutoWidth) this.CalcWidth("Panel"); ME.Panel;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateGroupSort = function(zsc){
if(!this.GroupTree || this.GroupSortMain) {
   var G = this.Group.replace(/\s/g,"").split(",");
   for(var i=0;i<G.length;i++) if(G[i]!=this.MainCol && this.Cols[G[i]] && (this.GroupHideCols==2||this.GroupHideCols==1&&this.Cols[G[i]].CanGroup==1)) zsc = zsc.replace(new RegExp("(^|,)-?"+G[i]+"($|,)"),function(dummy,b,c){ return b==","&&c==","?",":""; } );
   }
if(this.GroupSortMain) {
   if(this.GroupTree) zsc = (this.GroupSortMain==1 ? this.Group : "-"+this.Group.replace(/,/g,",-")) +  (zsc?",":"") + zsc;
   else if(this.MainCol){
      zsc = zsc.replace(new RegExp("(^|,)-?"+this.MainCol+"($|,)"),function(dummy,b,c){ return b==","&&c==","?",":""; } );
      zsc = (this.GroupSortMain==1 ? "" : "-") + this.MainCol + (zsc?",":"") + zsc;
      }
   }
this.Sort = zsc;
}
// -----------------------------------------------------------------------------------------------------------
// Groups children of given row according to one column. Rows can be grouped already.
// type is GroupType, O is set by internal recursion
TGP.GroupBy = function(row,cols,pos,spos,D,EC,nomain){
var col = cols[pos], C = this.Cols[col];
if(!C){
   MS.Debug; this.Debug(1,"Unknown column ",col," in grouping, grouping cancelled"); ME.Debug;
   return;
   }
if(!D) {   
   D = this.GetGroupDef(col,pos,cols.length);
   
   if(Grids.OnGetGroupDef) { var tmp = this.Def[Grids.OnGetGroupDef(this,col,D.Name)]; if(tmp!=null) D = tmp; }
   if(!pos&&!nomain) this.SetGroupMain(D);
   EC = D.EditCols; if(EC) EC = (EC+"").split(',');
   }
var old = "@Start#", cnt = 0, O, v, poc, pocdel, gv = this.GroupIdValue;
var M = this.MainCol, MT=M+"Type", MF=M+"Format",MV=M+"Visible",MEN=M+"Enum",MRA=M+"Range",MCE=M+"CanEdit",MO=M+"GroupOrig",MSV=M+"SortValue";
var ct = col+"Type",cf=col+"Format",ce = col+"Enum",cek = col+"EnumKeys", ci=col+"IntFormat",cr=col+"Related",crf=col+"Refresh",crc=col+"Clear",cra=col+"Range";
var pcdef = D.ParentCDef!=null, cdef = D.CDef!=null ? null : row.CDef, padef = D.ParentAcceptDef!=null, adef = D.AcceptDef!=null ? null : row.AcceptDef, setids = this.SetIds?(this.Cols.id?2:1):0;
var par = row.Page?this.Root:row, ocg = Grids.OnCreateGroup, org = Grids.OnRemoveGroup;
var white = GetWhiteChars(this.GetAttr(par,col,"WhiteChars"));
var codes = this.GetAttr(par,col,"CharCodes");
var local = this.GetAttr(par,col,"LocaleCompare");
var cas = this.GetAttr(par,col,"CaseSensitive");
var sole = this.GetAttr(par,col,"GroupSole");
var empty = this.GetAttr(par,col,"GroupEmpty");
var del = this.GetAttr(par,col,"GroupDeleted"); 
var type = this.GetAttr(par,col,"GroupType"); if(type!=null){ local = type&2; cas = type&4; empty = type&80?2:(type&16?1:0); del = type&128; } 
var chr = C.GroupChar; if(chr && !spos) spos = 0;
var mch = D[col+"MaxChars"]; if(mch==null) mch = C.MaxChars; 
if(mch && !(mch-0)) { if(!spos) spos = 0; mch = mch.split(",")[spos]; if(!mch) mch = 0; }
var r = row.firstChild, block = 0, gt = this.GroupTree;

var T = this; function DelGroup(O){
   if(org) org(T,O);
   while(O.firstChild) row.insertBefore(O.firstChild,O);
   if(setids) delete T.Rows[O.id];
   if(!gv) T.GroupAutoId--;
   row.removeChild(O);     
   }

while(r){
   if(r.Def && r.Def.Group || !Is(r,"CanGroup")){
      this.GroupBy(r,cols,pos,spos,D,EC);
      r = r.nextSibling;
      }
   else if(r.Deleted && (!this.ShowDeleted || !del)){ 
      r = r.nextSibling;
      }   
   else {
      if(pcdef){ par.CDef = D.ParentCDef; pcdef = 0; }
      if(padef){ par.AcceptDef = D.ParentAcceptDef; padef = 0; }   
      var val = Get(r,col+"SortValue"), sval = val;
      if(val==null) val = this.GetString(r,col,2); 
      else val += "";
      if(Grids.OnGetSortValue) { var tmp = Grids.OnGetSortValue(this,r,col,val,0,1); if(tmp!=null) val = tmp+""; }
      var n = r.nextSibling; 
      if(chr) val = val.split(chr)[spos];
      MS.CharCodes;
      if(codes&&val) val = UseCharCodes(val,codes);
      ME.CharCodes;
      if(!cas&&val) val = local ? val.toLocaleLowerCase() : val.toLowerCase();
      if(white&&val) val = val.replace(white,"");
      if(mch!=null) { if(!mch) val = null; else if(val.length>mch) val = val.slice(0,mch); else if(spos && val.length!=mch) val = null; }

      if(--block<=0 && old!=val){
         if(poc==1 && !sole) DelGroup(O);
         else if(O) {
            if(spos!=null && old!=null) this.GroupBy(O,cols,pos,spos+1);
            else if(pos+1<cols.length) this.GroupBy(O,cols,pos+1);
            if(spos!=null && old==null || !empty && (!old||old==0) || empty==1 && !old && old!="0") DelGroup(O);  
            else if(poc==pocdel) O.Deleted = 2;   
            }
         cnt++; poc = 0; pocdel = 0;
         O = Dom.createElement("I");
         if(gv) O.id = (gv>=5&&!row.Page ? row.id+"$" : "") + (gv==1||gv==2||gv==5||gv==6 ? col+(spos?spos:"") : row.Level+1) + this.GroupIdPrefix + (gv==1||gv==3||gv==5||gv==7 ? val : r.id);
         else O.id = this.GroupIdPrefix + this.GroupAutoId++;
         if(setids) while(this.Rows[O.id]) O.id = this.GroupIdPrefix + this.GroupAutoId++;
         row.insertBefore(O,r);
         O.Def = D;
         if(cdef!=null) O.CDef = cdef;
         if(adef!=null) O.AcceptDef = adef;
         O.Kind = D.Kind;
         O.Expanded = D.Expanded ? 1 : 0;
         if(D.Spanned){
            O.Spanned = 1;
            this.UpdateSpan(O);
            }
         O.Calculated = D.Calculated ? 1 : 0;
         O.Level = row.Level+1;
         O.State = 4;
         O.Visible = 1;
         O.GroupCol = col; 
         O.GroupPos = spos;
         if(mch){
            O[M] = val;
            O[MCE] = 0; 
            }
         else if(chr) O[M] = (Get(r,col)+"").split(chr)[spos];   
         else O[M] = Get(r,col);
         var R = r.Def;
         O[MO] = col;
         O[MSV] = sval;
         v = r[cf]; if(v==null) v = R[cf]; if(v==null) v = C.Format; if(v!=null) O[MF] = v;
         v = r[cra]; if(v==null) v = R[cra]; if(v==null) v = C.Range; if(v!=null) O[MRA] = v;
         v = r[ct]; if(v==null) v = R[ct]; if(v==null) v = C.Type; if(v!=null) O[MT] = v;
         
         MS.Enum;
         if(Grids.OnGetType) { var tmp = Grids.OnGetType(this,row,col,v); if(tmp!=null) v = tmp; }
         if(v=="Enum"){
            v = r[ce]; if(v==null) v = R[ce]; if(v==null) v = C.Enum; if(v!=null) O[MEN] = v;
            v = r[cek]; if(v==null) v = R[cek]; if(v==null) v = C.EnumKeys; if(v!=null) O[M+"EnumKeys"] = v;
            v = r[ci]; if(v==null) v = R[ci]; if(v==null) v = C.IntFormat; if(v!=null) O[M+"IntFormat"] = v;
            v = r[cr]; if(v==null) v = R[cr]; if(v==null) v = C.Related; if(v!=null) O[M+"Related"] = v;
            v = r[crf]; if(v==null) v = R[crf]; if(v==null) v = C.Refresh; if(v!=null) O[M+"Refresh"] = v;
            v = r[crc]; if(v==null) v = R[crc]; if(v==null) v = C.Clear; if(v!=null) O[M+"Clear"] = v;
            }
         ME.Enum;
         
         MS.Master;
         if(EC){
            for(var i=0;i<EC.length;i++){
               var c = EC[i];
               if(c=="Main" || c=="MainCol"){
                  O[M+"CopyTo"] = "Children,"+col;
                  O[M+"CanEdit"] = 1;
                  O[col] = r[col];
                  }
               else {
                  O[c+"CopyTo"] = "Children,"+c;
                  O[c+"CanEdit"] = 1;
                  O[c] = r[c];
                  }
               }
            O.HasCopyTo = 1;
            }
         ME.Master;
         O[MV] = 1;
         MS.ColTree;
         if(gt){
            O[col+(gt==2||gt==4?"Button":"Icon")] = "Expand";
            O[col] = O[M];
            for(var p=O.parentNode;p&&p.GroupCol;p=p.parentNode) if(col!=p.GroupCol) O[p.GroupCol+"Visible"] = -1;
            if(gt==3||gt==4){
               O[col+"CopyTo"] = "Children,"+col;
               O[col+"CanEdit"] = 1;
               }
            }
         ME.ColTree;
         if(setids) this.Rows[O.id] = O;
         old = val;
         if(ocg) {
            var id = O.id; 
            ocg(this,O,col,val,spos);
            if(setids && id!=O.id) { delete this.Rows[id]; this.Rows[O.id] = O; }
            }
         }

      if(r.Block) {
         if(block>0) { if(r.Block > block) block = r.Block; }
         else block = r.Block;
         }
      O.appendChild(r);
      r.Level = O.Level+1;
      poc++; if(r.Deleted) pocdel++;
      r=n;
      }
   }
if(O) {   
   if(spos!=null && old!=null) this.GroupBy(O,cols,pos,spos+1);      
   else if(pos+1<cols.length) this.GroupBy(O,cols,pos+1);
   var del = 0;
   if(cnt==1){
      var single = this.GetAttr(par,col,"GroupSingle"); 
      if(!single || type&32 || single==2 && row.Def && row.Def.Group && row.nextSibling==null&&row.previousSibling==null) del = 1;
      }
   if(poc==1 && !sole || spos!=null && old==null || !empty && (!old||old==0) || empty==1 && !old && old!="0") del = 1;  
   if(del) DelGroup(O); 
   else if(poc==pocdel) O.Deleted = 2;   
   }
else if(spos!=null && pos+1<cols.length) this.GroupBy(row,cols,pos+1);
}
// -----------------------------------------------------------------------------------------------------------
// Groups rows according to Group
// Rows must not be grouped
// For norefresh = true does not update the display, use when will be rendering after
TGP.GroupAll = function(norefresh,async){
if(!this.DoSort){ NoModule("Sort"); return; }
if(!this.Grouping) return;
if(!this.Grouped){
   this.CalculateSpaces(1); 
   return;
   }
var zp = this.Paging;
var FP = this.Paging && this.OnePage&4 && !this.AllPages ? this.GetFPage() : null;
this.Paging = 0; 

// --- Sorts grid ---
var zsd = this.Sorted, zs = this.Sort, zss = this.Sorting; 
this.Sorted = true; this.Sort = this.Group; this.Sorting = true;
if(this.GroupIdValue==2||this.GroupIdValue==4||this.GroupIdValue==6||this.GroupIdValue==8) this.Sort += ",id"; 
this.InGrouping = 2; 
if(FP) this.SortChildren(FP,0,1);
else this.DoSort(0,1); 
this.InGrouping = null; 
this.Sorted = zsd; this.Sort = zs; this.Sorting = zss;

// --- Groups grid ---
var G = this.Group.replace(/\s/g,"").split(",");
this.GroupAutoId = 1;
this.GroupBy(FP?FP:this.XB.firstChild,G,0);

var pl = this.MaxGroupLength, RA = Grids.INames, T = this;
function UpdateChildren(row){
   if(row.Def && row.Def.Group && row.childNodes.length>pl){
      var r = Dom.createElement("I");
      if(T.SetIds) T.SetRowsId(r); 
      row.parentNode.insertBefore(r,row);
      for(var i in row) if(!RA[i]) r[i]=row[i];
      for(var i=0;i<pl;i++) r.appendChild(row.firstChild);
      UpdateChildren(r);
      UpdateChildren(row);
      }
   else {
      for(var r=row.firstChild;r;r=r.nextSibling) if(r.firstChild) UpdateChildren(r);
      }
   }
if(pl>1) UpdateChildren(FP?FP:this.XB.firstChild);
this.Paging = zp;

this.UpdateGroupSort(zs);
if(this.Sort!=zs && !norefresh) this.UpdateHeader();
if(FP) FP.Group = this.Group;

if(norefresh) { 
   var G = this.GetGroupCols(this.Group), C = this.Cols; 
   for(var i=0;i<G.length;i++) C[G[i]].Visible = 0;
   this.UpdateGroupCol(0);
   this.UpdateSecCount();
   this.CalcTreeWidth();
   this.SaveCfg();
   }
else if(async>0){ var T = this; setTimeout(function(){ T.GroupFinish(1); },10);  }
else this.GroupFinish(async);
}
// -----------------------------------------------------------------------------------------------------------
// Updates row display after grouping by functions GroupAll and Ungroup
TGP.GroupFinish = function(async){
if(Grids.OnGroupFinish) Grids.OnGroupFinish(this,this.Group);
var FP = this.Paging && this.OnePage&4 && !this.AllPages ? this.GetFPage() : null;
if(this.DoFilterT) this.DoFilterT(0);
if(this.Sorting && this.Sorted && this.Sort){ 
   if(FP) this.SortChildren(FP);
   else {
      this.DoSort(); 
      for(var p=this.XB.firstChild;p;p=p.nextSibling) this.SetBody(p);
      }
   }
else { 
   if((this.Paging) && !FP) this.CreatePages();
   MS.CPages; if(this.ChildPaging) this.CreateAllCPages(this.XB); ME.CPages;
   }
var frg = null; if(this.FRow && this.FRow.Def.Group) { frg = this.FRow; this.FRow = null; } 

var T = this; 
function finish(){
   T.Calculate(2,1,0,0,1);   
   MS.Chart; if(T.Charts) T.UpdateCharts(); ME.Chart;
   T.SetVPos();
   T.UpdateAllLevelImg(0,1);
   T.CalcTreeWidth();
   T.ReColor();
   T.UpdateGroup();
   T.SaveCfg();
   function finish2(){
       
      MS.Debug; T.Debug(4,"TreeGrid grouped in ",T.EndTimer("Group")," ms"); ME.Debug;
      T.RenderBody(null,null,1);
      }
   if(async) setTimeout(finish2,10);
   else finish2();
   }
if(async>0) setTimeout(finish,10);
else if(!async) finish();
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateGroup = function(){
this.Clear(0);      

var zal = this.XB, zp = this.Paging; this.Paging = 0; this.XB = {firstChild:{State:4}}; 
if(this.ChangeColsVisibility) this.ChangeColsVisibility(this.GetGroupCols(this.OldGroup,1),this.GetGroupCols(this.Group),1,2);
this.UpdateGroupCol(1);
this.OldGroup = "";
this.XB = zal; this.Paging = zp;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetGroupCols = function(Cols,show){
if(!Cols || this.GroupTree&&!show) return [];
var A = [], p = 0;
Cols = Cols.replace(/\s/g,"").split(",");
for(var i=0;i<Cols.length;i++) if((Cols[i]!=this.MainCol||show) && this.Cols[Cols[i]] && (this.GroupHideCols==2||this.GroupHideCols==1&&this.Cols[Cols[i]].CanGroup!=2)) A[p++] = Cols[i]; 
return A;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateGroupCol = function(refresh){

MS.ColWidth;
for(var col in this.Cols){
   var C = this.Cols[col];
   if(C.OldWidth){
      if(C.Visible && refresh) { this.Grouping = 0; this.SetWidth(col,C.OldWidth - C.Width,1); this.Grouping = 1; }
      else C.Width = C.OldWidth;
      C.OldWidth = null;
      }
   }
var MC = this.Cols[this.MainCol];
if(MC && MC.GroupWidth){ 
   MC.OldWidth = MC.Width;
   var w = MC.GroupWidth;
   if(w==1){
      var G = this.Group.replace(/\s/g,"").split(","), w = MC.Width;
      if(!this.GroupTree) for(var i=0;i<G.length;i++){
         var c = this.Cols[G[i]];
         if(c && c!=MC && (this.GroupHideCols==2||this.GroupHideCols==1&&c.CanGroup==1)) w += c.Width;
         }
      }
   if(MC.Visible && refresh) { this.Grouping = 0; this.SetWidth(this.MainCol,w - MC.Width,1); this.Grouping = 1; }
   else { MC.Width = w; MC.AutoWidth = 0; }
   }
ME.ColWidth; 
}
// -----------------------------------------------------------------------------------------------------------
TGP.Ungroup = function(){
var r = this.GetFirst(),n, org = Grids.OnRemoveGroup;
while(r){
   n = this.GetNext(r);
   if(r.Def && r.Def.Group){
      MS.RowSpan; if(r.RowSpan) for(var c in this.SpanCols) if(r[c+"RowSpan"]>1||r[c+"RowSpan"]==0) this.ResetHidden(r,c); ME.RowSpan;
      if(org) org(this,r,1);
      var par = r.parentNode;
      while(r.firstChild) par.insertBefore(r.firstChild,r);
      if(r.id) delete this.Rows[r.id];
      par.removeChild(r);
      r.Removed = 1;
      }
   r=n;
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.DoGroupBy = function(F,type,test){
var col = this.GetACol(F);
if(!col || !this.Cols[col] || !this.Cols[col].CanGroup || !this.Grouping) return false;
var has = this.Group.search(new RegExp("(^|,)-?"+col+"($|,)"))>=0;
if(!has && !type || has && type) return false;
if(test) return true;
var group = this.Group.replace(new RegExp("(^|,)-?"+col+"($|,)"),function(dummy,b,c){ return b==","&&c==","?",":""; } );
if(type==1) group = col+(group?",":"")+group;
else if(type==2) group = group+(group?",":"")+col;
this.GroupRows(group);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionUngroupBy = function(F,T){ return this.DoGroupBy(F,0,T); }
TGP.ActionGroupBy = function(F,T){ return this.DoGroupBy(F,1,T); }
TGP.ActionGroupByLast = function(F,T){ return this.DoGroupBy(F,2,T); }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionGroupOff = function(dummy,T,nosync){
if(!this.Grouping || !this.Grouped || this.Locked["group"]) return false;
if(T) return true;
if(this.LoadedCount<this.SynchroCount && !this.Paging || !this.Group) this.DoGroupOff();
else { this.ShowMessage(this.GetText("Group")); T = this; setTimeout(function(){ T.DoGroupOff(); },10); }
MS.Sync;
if(this.Sync["group"] && !nosync){
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId && G.Sync["group"]) G.ActionGroupOff(null,null,1);
      }
   }
ME.Sync;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.DoGroupOff = function(noundo){
if(!this.Grouping || !this.Grouped || this.Locked["group"]) return false;
if(this.Undo&16&&!noundo) this.AddUndo({Type:"Grouped",OGrouped:1,Grouped:0});
MS.Paging;
var pg3 = this.Paging==3 && (!(this.OnePage&4) || this.AllPages);
if(pg3){
   if(this.Group){
      var Cols = this.Group;
      this.DoGrouping("");
      this.Group = Cols;
      this.CalculateSpaces(1); 
      }
   this.Grouped = false;
   if(this.Loading) { this.Loading = 0; this.SaveCfg(); this.Loading = 1; }   
   else {   
      this.SaveCfg();
      for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Kind=="Group") this.UpdatePanel(r);   
      }
   
   return true;
   }
ME.Paging;
if(this.Group) { 
   if(Grids.OnGroup){ this.Grouped = false; var ret = Grids.OnGroup(this); this.Grouped = true; if(ret) return; }
   MS.Debug; this.Debug(4,"Grouping rows"); this.StartTimer("Group"); ME.Debug;   
   this.ClearGroupMain();
   if(this.SortGroup && this.SortGroup!=this.Sort) { this.Sort = this.SortGroup; this.SortGroup = null; this.UpdateHeader(); }
   this.Clear(0);
   this.Ungroup();
   var zal = this.Group; this.OldGroup = zal; this.Group = "";
   this.GroupFinish();
   this.Group = zal;
   }  
this.Grouped = false;
this.CalculateSpaces(1);
for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Kind=="Group") this.UpdatePanel(r,"Edit");
this.SaveCfg();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionGroupOn = function(dummy,T,nosync){
if(!this.Grouping || this.Grouped || this.Locked["group"]) return false;
if(T) return true;
if(this.LoadedCount<this.SynchroCount && !this.Paging || !this.Group) this.DoGroupOn();
else { this.ShowMessage(this.GetText("Group")); T = this; setTimeout(function(){ T.DoGroupOn(1); },10); }
MS.Sync;
if(this.Sync["group"] && !nosync){
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId && G.Sync["group"]) G.ActionGroupOn(null,null,1);
      }
   }
ME.Sync;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.DoGroupOn = function(async,noundo){
if(!this.Grouping || this.Grouped || this.Locked["group"]) return false;
if(this.Undo&16&&!noundo) this.AddUndo({Type:"Grouped",OGrouped:0,Grouped:1});
this.Grouped = true;
MS.Paging;
var pg3 = this.Paging==3 && (!(this.OnePage&4) || this.AllPages);
if(pg3){
   if(this.Group){
      var Cols = this.Group;
      this.Group = "";
      this.DoGrouping(Cols);
      }
   else {   
      for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Kind=="Group") this.UpdatePanel(r);
      this.SaveCfg();
      this.ReloadBody(null,false,"Group");
      }
   return true;
   }
ME.Paging;
if(this.Group){ 
   if(Grids.OnGroup && Grids.OnGroup(this)) { this.Grouped = false; return; }
   MS.Debug; this.Debug(4,"Grouping rows"); this.StartTimer("Group"); ME.Debug;   
   
   if(this.GroupRestoreSort && this.SortGroup==null) this.SortGroup = this.Sort;
   this.GroupAll(0,async);
   }
this.CalculateSpaces(1);
for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Kind=="Group") this.UpdatePanel(r,"Edit");
this.SaveCfg();
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ChangeMainCol = function(col,noshow){
var C = this.Cols, mc = this.MainCol, R = [];
if(mc){
   var sec = C[mc].Sec, pos = C[mc].VPos;
   if(this.ColNames[sec].State==4 && (C[mc].Visible||C[mc].Hidden)) {
      this.HeadSec[sec].firstChild.firstChild.rows[0].deleteCell(pos-1);
      if(this.FootVisible) this.FootSec[sec].firstChild.firstChild.rows[0].deleteCell(pos-1);
      var F = this.GetFixedRows();
      for(var i=0;i<F.length;i++) {
         if(F[i].Spanned&&F[i][mc+"Span"]!=1) R[R.length] = F[i];
         else { var cell = this.GetCell(F[i],mc); if(cell) cell.parentNode.deleteCell(cell.cellIndex-1); }
         }
      }
   this.MainCol = null;   
   this.SetVPos();   
   }
if(col){
   var sec = C[col].Sec, pos = C[col].VPos;
   if(this.ColNames[sec].State==4 && (C[col].Visible||C[col].Hidden)) {
      var cell = this.HeadSec[sec].firstChild.firstChild.rows[0].insertCell(pos);
      cell.style.width = "0px"; cell.style.height = "0px";
      if(this.FootVisible) {
         cell = this.FootSec[sec].firstChild.firstChild.rows[0].insertCell(pos);
         cell.style.width = "0px"; cell.style.height = "0px";
         }
      var F = this.GetFixedRows();
      for(var i=0;i<F.length;i++) {
         if(F[i].Spanned&&F[i][mc+"Span"]!=1) R[R.length] = F[i];
         else { var cell = this.GetCell(F[i],col); if(cell) cell.parentNode.insertCell(cell.cellIndex); }
         }
      }
   this.MainCol = col;   
   this.SetVPos();
   }
for(var i=0;i<R.length;i++) this.RefreshRow(R[i]); 
if(!noshow && (this.Paging!=3 || (this.OnePage&4 && !this.AllPages))) this.RenderBody(null,null,1);
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetGroupCol = function(row){
if(row.GroupCol) return row.GroupCol;
if(!row.Def.Group) return null;
var gc = row.Def.GroupCol;
var G = this.Group.replace(/\s/g,"").split(",");
if(gc && (gc+"").indexOf(",")<0){ 
   if(gc-0+""==gc) gc = G[gc<0?G.length-gc:gc]; 
   }
else { 
   for(var pr=row.parentNode,ll=0;pr&&!pr.Page;pr=pr.parentNode) if(pr.Def && pr.Def.Group) ll++;
   gc = G[ll];
   }
return gc;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GroupTreeVisible = function(row,col){
var vis = row[col+"Visible"]; if(vis==null && row.Def) vis = row.Def[col+"Visible"];
if(vis!=null) return vis ? vis : 0;
if(vis==null && this.GroupTree && this.Grouped && this.Group && !row.Fixed && !row.Def.Group && this.GroupTreeCols && this.GroupTreeCols[col]) vis = -1;
return vis;
}
// -----------------------------------------------------------------------------------------------------------
ME.Group;

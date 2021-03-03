// -----------------------------------------------------------------------------------------------------------
// Functions for row ids
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
// Generates new row's id and saves it to this.LastId
// For this.FullId generates id from par's id
// D is row's default to get idCols
TGP.GenerateId = function(row, TestId, ignore){
if(this.AutoPages && row.Level==0){
   var id = TestId ? TestId : this.AutoIdPrefix+this.AutoId++;
   while(this.Rows[id]) id = this.AutoIdPrefix+this.AutoId++;
   return id;
   }
var id = this.LastId; if(id!=null) id+=""; 
var utr = 65277; 
MS.GenId;

var N = this.IdNames, IdCol = this.IdCol, C = this.IdChars, CI = this.IdCharsIndex;
var val,valr,r,b,aid = N.length-1, append = this.AppendId, found = 0,cin = this.CaseSensitiveId?0:1;
var lid = id.length;
if(append){
   val = TestId ? TestId : Get(row,this.IdCol);
   valr = val==null ? "" : (val+"").replace(/\$/g,"_").replace(this.IdRegExStr,"\\$&");
   }
var R = new RegExp("^"+(valr?valr:"")+this.IdRegEx,cin?"i":""); 

if(aid){ 
   var Vals = [];
   for(var i=0;i<aid;i++){
      var x = N[i]=="Def" ? row.Def.Name : Get(row,N[i]);
      x = x==null ? "" : (x+"").replace(/\$/g,"_");
      if(cin) x = x.toLowerCase();
      Vals[i] = x;
      }
   }

function SetLast(r,test,orig){ 
   if(r==row) return;     
   if(orig){ 
      var rid = r.id;
      if(rid==null) return;      
      if(typeof(rid)!="string") rid += "";
      else if(rid.indexOf('$')>=0){
         rid = (rid+"").split('$');
         if(aid) for(var i=0;i<aid;i++) if(Vals[i]!=(cin?rid[i].toLowerCase():rid[i])) return;  
         rid = rid[rid.length-1];
         }
      }
   else {
      SetLast(r,test,1); 
      if(aid) for(var i=0;i<aid;i++){
         var x = N[i]=="Def" ? r.Def.Name : Get(r,N[i]);
         x = x==null ? "" : (x+"").replace(/\$/g,"_");
         if(cin) x = x.toLowerCase();
         if(Vals[i]!=x) return;  
         }
      var rid = Get(r,IdCol);
      if(rid==null) return;      
      rid = (rid+"").replace(/\$/g,"_");
      }
      
   var M = rid.match(R);
   if(!M) return;             
   rid = M[1];                
      
   if(TestId){
      if(append){ if(!rid) found=1; }
      else if(rid==TestId) found=1;
      }   
   if(test) return rid==id; 
   var len = rid.length;
   if(len==lid){
      for(var i=0;i<len;i++) {
         var idc = CI[id.charAt(i)];
         var ridc = CI[rid.charAt(i)];
         if(ridc!=idc){ 
            if(ridc > idc) id = rid;
            break;
            }
         }
      }   
   else if(len > lid){ id = rid; lid=len; }
   }

if(this.FullId){
   
   if(row.parentNode.Page){
      for(b=this.XB.firstChild;b;b=b.nextSibling) {
         for(r=b.firstChild;r;r=r.nextSibling) SetLast(r);
         }
      }
   else for(r=row.parentNode.firstChild;r;r=r.nextSibling) SetLast(r);
   
   }

else if(!id || aid || N[0]!="id") { 
   
   for(r=this.GetFirst();r;r=this.GetNext(r)) SetLast(r);
   }
   
var F = this.GetFixedRows();
if(TestId && !found){ 
   if(!this.FullId || row.parentNode.Page) for(r=0;r<F.length;r++) SetLast(F[r],1); 
   if(!found) return TestId; 
   }

while(1){
   
   for(var i=lid-1;i>=0;i--){
      var c = id.charAt(i);
      var idx = CI[c];
      if(idx==null || idx==C.length-1){ id = id.slice(0,i)+C.charAt(0)+id.slice(i+1); continue; }
      id = id.slice(0,i)+C.charAt(idx+1)+id.slice(i+1);
      break;
      }
   if(i<0){ 
      id = C.charAt(this.NumberId?this.NumberId:0);
      for(i=0;i<lid;i++) id+=C.charAt(0);
      }
   if(ignore && ignore[id]) { if(!lid) lid++; continue; }
   
   var ok = 1;
   if(!this.FullId || row.parentNode.Page) for(r=0;r<F.length;r++) if(SetLast(F[r],1)) { if(!lid) lid++; ok = 0; break; } 
   
   if(ok) break;
   }

if(!aid && N[0]=="id" && !this.FullId) this.LastId = id;
id = this.IdPrefix+id+this.IdPostfix;
if(append) id = val+id;

ME.GenId;
utr += 3743 + id; 
if(Grids.OnGenerateId) { var tmp = Grids.OnGenerateId(this,row,id); if(tmp!=null) id = tmp; }
return id;
}
// -----------------------------------------------------------------------------------------------------------
TGP.CreateId = function(row){
MS.GenId;
if(this.IdMore){
   var id="",x,i,n;
   for(i=0;i<this.IdMore;i++){ 
      n = this.IdNames[i];
      if(n=="Def") x=row.Def.Name;
      else x=Get(row,n);
      if(x==null) x="";
      if(n=="id") id+="$"+(x+"").replace(/.\$/,"");
      else id+="$"+(x+"").replace(/\$/g,"_");
      }
   if(!this.CaseSensitiveId) id = id.toLocaleLowerCase();   
   id = id.slice(1);
   if(this.FullId){
      var pid = row.parentNode.id;
      if(pid) id = pid+"$"+id;
      }
   return id;
   }
ME.GenId;
return row.id;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetIdUnique = function(row){
if(row.Kind!="Data" || Is(row,"IgnoreIdNames") || this.IdCol=="id") return;
var c = this.IdCol, v = Get(row,c);
var n = this.GenerateId(row,v);
if(n!=v){
   this.SetValue(row,c,n,1,0,1,1,1);
   MS.Undo; this.MergeUndo(); ME.Undo;
   if(Grids.OnChangeId) Grids.OnChangeId(this,row,c,v);
   }
}
// -----------------------------------------------------------------------------------------------------------
MS.Add$Tree;
TGP.SetRowId = function(row){
if(row.Kind!="Data") return;
var c = this.IdCol, idp = this.GenerateId(row,this.AppendId ? Get(row,c) : null);
if(row.id && this.SetIds && this.Rows[row.id]==row) delete this.Rows[row.id];
row[c] = idp;
if(this.Cols[c] && !this.GetAttr(row,c,"NoChanged")){
   row[c+"Changed"] = 1;
   row.Changed = 1;
   }
var id = this.CreateId(row), ignore = {};
if(this.SetIds) while(this.Rows[id]){ 
   ignore[idp] = 1;
   idp = this.GenerateId(row,null,ignore);
   row[c] = idp;
   id = this.CreateId(row);
   }
if(Grids.OnSetRowId) { var tmp = Grids.OnSetRowId(this,row,id); if(tmp!=null) id = tmp; }
row.id = id;
if(this.SetIds) this.SetRowsId(row);
}
ME.Add$Tree;
// -----------------------------------------------------------------------------------------------------------
TGP.SetRowsId = function(row){
if(row.id) {
   if(this.Rows[row.id] && this.Rows[row.id]!=row) {
      MS.Debug; if(!(this.DuplicateId&2)) this.Debug(2,"Duplicate row id ",row.id); ME.Debug;
      if(this.DuplicateId){
         var r = this.Rows[row.id];
         while(this.Rows[r.id]) r.id = this.AutoIdPrefix+this.AutoId++;
         if(r.r1) this.RefreshRow(r);
         }
      else while(this.Rows[row.id]) row.id = this.AutoIdPrefix+this.AutoId++;
      }
   this.Rows[row.id] = row;
   }
else {
   row.id = this.AutoIdPrefix+this.AutoId++;
   while(this.Rows[row.id]) row.id = this.AutoIdPrefix+this.AutoId++;
   this.Rows[row.id] = row;
   } 
if(row.r1){
   for(var i=this.FirstSec;i<=this.LastSec;i++){
      var r = row["r"+i];
      if(r) {
         var s = this.This+".ARow="+this.This+".Rows['"+(row.id+"").replace(/\\/g,'\\\\').replace(/\'/g,"\\'").replace(/\"/g,'\\"')+"'];"+this.This+".ASec=0;", f = new Function(s);
         r.onmousemove = f;
         if(BTablet) r.ontouchstart = f; else if(BTouch) r.setAttribute("ontouchstart",s);
         if(BMouse && row.Fixed) r.onmousedown = f;
         }
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
MS.GenId;

TGP.UpdateNewId = function(row,attr,setids,changed,moved,Q,AA){
if(!this.IdMore) return;
var cid = this.Cols[attr]&&setids, oid = row[attr]==null?row.id:row[attr], A = setids ? null : AA ? AA : {}, chcnt = 0;

if(row.MasterRow){
   row[attr] = row.MasterRow[attr];
   if(cid&&!row.Page) this.RefreshCell(row,attr);
   if(row.firstChild && this.FullId) for(var r=row.firstChild;r;r=r.nextSibling) if(this.UpdateNewId(r,attr,setids,1,2,Q,A)) chcnt++;
   changed = 0; moved = 0; 
   }
if(changed) { 
   var chg = 0, id = null, st;
   for(var i=0;i<this.IdMore;i++) if((Q?Q[this.IdNames[i]]!=null:row[this.IdNames[i]+"Changed"]) && this.IdNames[i]!="id"){
      if(!chg){
         id = (row[attr]==null?row.id+"":row[attr]+"").split('$');
         chg = 1;
         st = id.length-this.IdMore;
         }
      var x = Get(row,this.IdNames[i]);
      if(x==null) x = "";
      id[st+i] = (x+"").replace(/\$/g,"_");
      }
   if(chg){ 
      row[attr] = id.join("$");
      if(!this.CaseSensitiveId) row[attr] = row[attr].toLocaleLowerCase();
      if(cid) this.RefreshCell(row,attr);
      }
   }
if(this.FullId && (changed&&chg || moved==2)){ 
   var cnt = this.IdMore;
   
      var a = (row[attr]==null?row.id+"":row[attr]+"").split('$'), par = row.parentNode, id = "";
      for(var i=a.length-cnt;i<a.length-1;i++) id += a[i]+"$";
      id += this.GenerateId(row,a[a.length-1]);
      if(!par.Page) id = (par[attr]==null?par.id:par[attr])+"$"+id;
      if(id!=oid){
         row[attr] = id;
         if(cid) this.RefreshCell(row,attr);
         }
      
   if(row.firstChild) for(var r=row.firstChild;r;r=r.nextSibling) if(this.UpdateNewId(r,attr,setids,1,2,Q,A)) chcnt++;
   }
if(row[attr]!=oid){  
   if(setids){ 
      if(this.Rows[oid]==row) delete this.Rows[oid];

      

      this.SetRowsId(row);
      }   
   else if(AA && row.Moved!=2 && (!row.Changed||!chg)) { A[oid] = row[attr]; chcnt++; } 
   }
return chcnt ? A : null;
}
ME.GenId;
// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------
// Functions for responsive design
// -----------------------------------------------------------------------------------------------------------
TGP.ApplyMedia = function(){ }
// -----------------------------------------------------------------------------------------------------------
MS.Media;
// -----------------------------------------------------------------------------------------------------------
// Applies actual media rules for the grid
// media can be "print" or "export"
TGP.ApplyMedia = function(norender,media,recur){
var MM = this.Media; if(!MM.length||this.Hidden||this.EditMode) return;
if(Grids.OnMediaApply && Grids.OnMediaApply(this,this.Loading)) return 0;
if(!media&&this.Print) media = "print";

var D = {}, chg = 0, alt = this.Alternate, U = Grids.OnMediaUse!=null, osize = this.Size, MA = this.MediaAttrs, omaxheight = this.MaxHeight; if(MA) MA = MA.split(",");

for(var i=0;i<MM.length;i++){ 
   var M = MM[i], A = M.Attrs, N = M.Media;
   
   var no = (A && (
         N && (A.MaxWidth&&(N.Width>A.MaxWidth||!N.Width||media) || A.MinWidth&&(N.Width<A.MinWidth||media) || A.Width&&(N.Width!=A.Width||media) 
            || A.MaxHeight&&(N.Height>A.MaxHeight||!N.Height||media) || A.MinHeight&&(N.Height<A.MinHeight||media) || A.Height&&(N.Height!=A.Height||media))
      || A.Style&&!A.Style[this.Img.Style] || A.GanttStyle&&!A.GanttStyle[this.Img.GanttStyle] || A.Media&&media&&A.Media!=media || A.Media=="tablet"&&!Grids.Tablet&&!media || A.Media=="desktop"&&Grids.Tablet&&!media
      || A.Media&&!media&&(A.Media=="print"||A.Media=="export") || A.Rtl!=null&&!A.Rtl!=!this.Rtl 
      || A.Size&&this.Size.search(A.Size)!=0
      || A.Language&&this.Language.search(A.Language)!=0
      ));
   if(!no&&MA&&A) for(var j=0;j<MA.length;j++) if(A[MA[j]]!=null&&A[MA[j]]!=this[MA[j]]) { no = 1; break; }
   if(no ? !U||!Grids.OnMediaUse(this,M,0) : U&&Grids.OnMediaUse(this,M,1)==0) continue;
   for(var m in M){
      if(m=="Attrs") continue;
      var O = D[m], Q = M[m]; if(!O) { O = {}; D[m] = O; }
      if(m=="Cols"||m=="Rows"||m=="Def"||m=="Lang"||m=="Pagers"){
         for(var n in Q) {
            var OO = O[n], QQ = Q[n]; if(!OO) { OO = {}; O[n] = OO; } 
            for(var a in QQ) OO[a] = QQ[a];
            }
         }
      else for(var n in Q) O[n] = Q[n];
      }
   }

var dw = this.Img.SpaceWidth&&!this.Loading?this.Img.SpaceWidth:1;
for(var m in D){
   if(m=="Attrs" || m=="Media" || m=="Grids") continue;
   var W = m=="Cfg"?this:this[m]; if(!W) continue;
   var Q = D[m]; 
   if(m=="Cols"||m=="Rows"||m=="Def"||m=="Lang"||m=="Pagers"){
      var isrow = m=="Rows", NQ = {};
      for(var i=0;i<2;i++){
         if(i==1) Q = NQ;
         for(var n in Q) {
            var WW = isrow ? this.GetRowById(n):W[n]; 
            if(!WW) {
               if(n.charAt(0)=="*"){
                  var d = n.split("*");
                  for(var nn in W) if(W[nn][d[1]]==d[2]) NQ["#"+nn+"#"+d[1]+"#"+d[2]] = Q[n];
                  continue;
                  }
               else if(n.charAt(0)=="#"){
                  WW = W[n.split("#")[1]]; if(!WW) continue;
                  }
               else continue;
               }
            var QQ = Q[n];
            for(var a in QQ) {
               if(isrow && QQ[a]==null && (a=="Visible"||a=="Expanded")) { 
                  if(WW[a]!=null && WW[a]!=WW.Def[a]) { WW[a] = WW.Def[a]; chg++; }
                  }
               else if(isrow && WW.Space && a.indexOf("Left")>0 && WW.Cells.join && (","+WW.Cells.join(",")+",").indexOf(","+a+",")>=0){ 
                  var w = Math.round(QQ[a]*dw); if(WW[a+"Width"]!=w) { WW[a+"Width"] = w; chg++; }
                  }
               else if(isrow && WW.Space && dw!=1 && a.indexOf("Width")>0){
                  var w = Math.round(QQ[a]*dw); if(WW[a]!=w) { WW[a] = w; chg++; }
                  }
               else if(a=="Width"&&WW.OldWidth) {
                  if(WW.OldWidth!=QQ[a]) WW.OldWidth = QQ[a]; 
                  }
               else if(WW[a]!=QQ[a]&&a!=(isrow?"id":"Name")) {  WW[a] = QQ[a]; chg++; }
               }
            }
         }
      }
   else for(var n in Q) if(W[n]!=Q[n]) {  W[n] = Q[n]; chg++; }
   }

if(Grids.OnMediaApplied && Grids.OnMediaApplied(this,chg,this.Loading)) return 0;
var DCfg = D.Cfg?D.Cfg:{}, mchg = 0;
if(DCfg.MainTagHeight!=null && !(this.ResizedMain&1) && !this.MaxHeight) { this.MainTag.style.height = DCfg.MainTagHeight+"px"; this.TagHeight = DCfg.MainTagHeight; mchg |= 1; }
if(DCfg.MainTagWidth!=null && !(this.ResizedMain&2)) { this.MainTag.style.width = DCfg.MainTagWidth+"px"; this.TagWidth = DCfg.MainTagWidth; mchg |= 2; }
var styl = DCfg.hasOwnProperty("Style"); if(styl && !DCfg.hasOwnProperty("CSS")) { this.CSS = null; this.DialogCSS = null; }
var gstyl = DCfg.hasOwnProperty("GanttStyle"); if(gstyl && !DCfg.hasOwnProperty("GanttCSS")) this.GanttCSS = null;
var rtl = DCfg.hasOwnProperty("Rtl"), size = DCfg.hasOwnProperty("Size"), scale = DCfg.hasOwnProperty("Scale");
if(size){ var S = ParseObject(this.Sizes); if(S[this.Size]) this.Size = S[this.Size]; if(osize==this.Size) { size = 0; if(DCfg.Size!=this.Size) chg--; } }
MS.Group; if(this.Group&&this.Grouped&&this.MainCol&&this.Cols[this.MainCol]&&this.Cols[this.MainCol].GroupWidth) this.UpdateGroupCol(); ME.Group; 
if(alt&&!this.Alternate){ this.Alternate = 1e16; this.ReColor(); this.Alternate = 0; }
var max = null;
if(DCfg.NoVScroll){ if(this.MaxHeight) { this.ScrollMediaMaxHeight = 1; max = 0; } }
else if(this.ScrollMediaMaxHeight) { this.ScrollMediaMaxHeight = null; max = 1; }
else if(omaxheight!=this.MaxHeight) max = this.MaxHeight;
if(max!=null) { this.SetMaxHeight(max,1); chg = 1; }
this.ScrollMedia = (DCfg.NoHScroll?2:0) + (DCfg.NoVScroll?1:0);
if(this.WinScrollMainTag){
   if(this.NoHScroll==null) { this.SetNoHScroll(1); chg--; }
   if(this.NoVScroll==null) { this.SetNoVScroll(1); chg--; }
   }
if(!norender&&chg){
   if(!this.Loading&&this.MediaChange){
      this.UpdateMediaTag();
      
      if(this.MediaMainHeight!=null && (DCfg.hasOwnProperty("NoVScroll")||DCfg.hasOwnProperty("MaxVScroll")||DCfg.hasOwnProperty("MaxHeight")||DCfg.hasOwnProperty("MainTagHeight")) && DCfg.MainTagHeight==null && this.MainTag.style.height!=this.MediaMainHeight && !(this.ResizedMain&1) && (!this.MaxHeight||DCfg.hasOwnProperty("MaxHeight"))) {
         this.MainTag.style.height = this.MediaMainHeight; this.TagHeight = this.MainTag.offsetHeight; 
         mchg |= 1;
         }
      if(this.MediaMainWidth!=null && (DCfg.hasOwnProperty("NoHScroll")||DCfg.hasOwnProperty("MaxHScroll")||DCfg.hasOwnProperty("MaxWidth")||DCfg.hasOwnProperty("MainTagWidth")) && DCfg.MainTagWidth==null && this.MainTag.style.width!=this.MediaMainWidth && !(this.ResizedMain&2)) {
         this.MainTag.style.width = this.MediaMainWidth; this.TagWidth = this.MainTag.offsetWidth; 
         mchg |= 2;
         }
      if(size) for(var i=0;i<MM.length;i++) if(M.Attrs&&M.Attrs.Size) mchg |= 4;
      if(mchg&&!recur) { 
         var M = Grids.MediaObjects["MT_"+this.id], MM = Grids.MediaObjects["MT2_"+this.id];;
         if(M||MM){ 
            if(M){ var w = M.Width, h = M.Height; if(mchg&1) M.Height = this.TagHeight; if(mchg&2) M.Width = this.TagWidth; }
            if(MM){ var ww = MM.Width, hh = MM.Height; if(mchg&1) MM.Height = this.TagHeight; if(mchg&2) MM.Width = this.TagWidth; }
            var ret = this.ApplyMedia(1,media,1); 
            if(M) { M.Width = w; M.Height = h; }
            if(MM) { MM.Width = ww; MM.Height = hh; }
            if(ret==3) styl = 1; else if(ret==2) size = 1;
            }
         }
      
      this.CalculateSpaces(); 
      if(styl||gstyl||rtl) {
         this.SetStyle(null,null,null,null,null,1,3,0,1);
         }
      else {
         MS.Sync; if(scale) for(var i=0,M=this.GetSyncStyle();i<M.length;i++) M[i].SetScale(this.Scale,0,1); ME.Sync;
         if(size){ 
            this.MeasureHTML(); if(this.Gantt) this.MeasureGanttHTML(); this.AfterSetStyle(1); 
            MS.Sync; for(var i=0,M=this.GetSyncStyle();i<M.length;i++) M[i].SetSize(this.Size,0,1); ME.Sync;
            }
         else if(this.MediaChange&1) { if(this.Gantt) this.RefreshGantt(254); this.Render(); }
         if(this.MediaChange&2 || BIPAD&&this.MediaChange&1) this.Update(); 
         }
      }
   else if(styl||gstyl||rtl) this.SetStyle(null,null,null,null,null,!this.Loading,3,0,1);
   else if(size){ 
      this.MeasureHTML(); if(this.Gantt) this.MeasureGanttHTML(); 
      MS.Sync; for(var i=0,M=this.GetSyncStyle();i<M.length;i++) M[i].SetSize(this.Size,0,1); ME.Sync;
      }
   else if(scale){ MS.Sync; for(var i=0,M=this.GetSyncStyle();i<M.length;i++) M[i].SetScale(this.Scale,0,1); ME.Sync; }
   }
if(DCfg.hasOwnProperty("NoTreeLines")||rtl){
   var I = this.Img;
   I.Line = this.NoTreeLines||this.Rtl ? I.LineN : I.LineL;
   I.Tree = this.NoTreeLines||this.Rtl ? I.TreeN : I.TreeL;
   }
return !chg ? 0 : styl||gstyl||rtl ? 3 : size ? 2 : 1;
}
// -----------------------------------------------------------------------------------------------------------
// Saves all attribute in all media to the first media with default values
TGP.DefaultMedia = function(){
if(this.Hidden) return;
if(Grids.OnMediaInit) Grids.OnMediaInit(this,this.Media);
var MM = this.Media; if(!MM.length) return;
for(var i=0,N={},has=0,NN=[];i<MM.length;i++){
   var A = MM[i].Attrs; if(!A || A.Updated) continue;
   A.Updated = 1;
   NN[NN.length] = MM[i];
   if(A.Def) { MM[i].Default = A.Def; delete A.Def; }
   if(A.Default) { MM[i].Default = A.Default; delete A.Default; }
   if(A.Media) A.Media = (A.Media+"").toLowerCase();
   if(MM[i].Default) has = 1;
   if(A.Name){
      N[A.Name] = MM[i];
      var del = 1; for(var n in A) if(n!="Name"&&(n!="Media"||A.Media!="none")) { del = 0; break; }
      if(del) MM.splice(i--,1);
      }
   if(A.Style && typeof(A.Style)!="object") {
      var s = A.Style.split(","); A.Style = {};
      for(var j=0;j<s.length;j++) A.Style[s[j]] = 1;
      }
   if(A.GanttStyle && typeof(A.GanttStyle)!="object") {
      var s = A.GanttStyle.split(","); A.GanttStyle = {};
      for(var j=0;j<s.length;j++) A.GanttStyle[s[j]] = 1;
      }
   if(A.Size && typeof(A.Size)!="object") A.Size = new RegExp(A.Size.replace(/\,/g,"|"));
   if(A.Language && typeof(A.Language)!="object") A.Language = new RegExp(A.Language.replace(/\,/g,"|"));
   }
if(has) for(var i=0;i<MM.length;i++){
   if(MM[i].Default) this.UpdateDef(MM[i],N,"Default");
   }

var Def = null, D = MM[0]; if(D.Attrs) { D = {}; this.Media.splice(0,0,D); } 
for(var i=0;i<NN.length;i++){
   var M = NN[i];
   for(var m in M){
      if(m=="Attrs") continue;
      var W = m=="Cfg"?this:this[m]; if(!W) continue;
      var O = D[m], Q = M[m]; if(!O) { O = {}; D[m] = O; }
      if(m=="Cols"||m=="Rows"||m=="Def"||m=="Lang"||m=="Pagers"){
         for(var n in Q) {
            var WW = m=="Rows" ? this.GetRowById(n):W[n]; if(!WW) continue;
            if(m=="Def" && !WW.Updated) {
               if(Def==null) { Def = {}; for(var nn in W) Def[nn] = W[nn].Def; }
               this.UpdateDef(WW,W,"Def");
               }
            var OO = O[n], QQ = Q[n]; if(!OO) { OO = {}; O[n] = OO; } 
            for(var a in QQ) if(OO[a]==null) OO[a] = WW[a];
            }
         }
      else for(var n in Q) if(O[n]==null) O[n] = W[n];
      }
   }
if(Def!=null) for(var n in Def) Def[n] = this.Def[n].Def = Def[n]; 
if(D.Cfg){
   if(D.Cfg.hasOwnProperty("NoVScroll")||D.Cfg.hasOwnProperty("MaxVScroll")||D.Cfg.hasOwnProperty("MaxHeight")||D.Cfg.hasOwnProperty("MainTagHeight")) this.MediaMainHeight = this.MainTag.style.height;
   if(D.Cfg.hasOwnProperty("NoHScroll")||D.Cfg.hasOwnProperty("MaxHScroll")||D.Cfg.hasOwnProperty("MaxWidth")||D.Cfg.hasOwnProperty("MainTagWidth")) this.MediaMainWidth = this.MainTag.style.width;
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetMediaTag = function(always){
var NN = this.Media, GM = Grids.MediaObjects, AL = always ? {} : null; if(!GM){ GM = {}; Grids.MediaObjects = GM; }
for(var i=NN[0]&&!NN[0].Attrs?1:0;i<NN.length;i++){
   var M = NN[i], tag = M.Attrs ? M.Attrs.Tag : null, spec = 0, name = ""; if(tag==null) tag = this.MediaTag;
   if(tag==1) { name = "MT_"+this.id; tag = this.MainTag; }
   else if(tag==2) { name = "MT2_"+this.id; tag = this.MainTag; spec = 1; }
   else if(tag) { name = tag; tag = GetElem(tag); if(!tag) name = ""; }
   if(!GM[name]||AL&&!AL[name]){
      if(!tag) GM[name] = { Width:window.innerWidth, Height:window.innerHeight };
      else if(tag.clientHeight) GM[name] = { Tag:tag, Width:tag.clientWidth, Height:tag.clientHeight };
      else GM[name] = { Tag:tag, Width:tag.offsetWidth, Height:tag.offsetHeight };
      GM[name].Grids = {}; 
      if(spec) { GM[name].WW = this.NoHScroll ? window.innerWidth : 0; GM[name].WH = this.NoVScroll ? window.innerHeight : 0; }
      if(AL) AL[name] = 1;
      }
   GM[name].Grids[this.Index] = 1;
   M.Media = GM[name];
   }
}
// -----------------------------------------------------------------------------------------------------------
// Returns given tag of default media
TGP.UpdateMedia = function(tag,attr,value,subtag,media){
var MM = this.Media, D = null, U = Grids.OnMediaUse!=null; if(!MM.length) return;
var MA = this.MediaAttrs; if(MA) MA = MA.split(",");
if(!media&&this.Print) media = "print";
for(var i=0;i<MM.length;i++){
   var M = MM[i], A = M.Attrs, N = M.Media;
   
   M = M[tag]; if(!M) continue;
   if(subtag) { M = M[subtag]; if(!M) continue; }
   if(M[attr]==null)  continue;
   var no = (A && (
        N && (A.MaxWidth&&(N.Width>A.MaxWidth||!N.Width||media) || A.MinWidth&&(N.Width<A.MinWidth||media) || A.Width&&(N.Width!=A.Width||media) 
        || A.MaxHeight&&(N.Height>A.MaxHeight||!N.Height||media) || A.MinHeight&&(N.Height<A.MinHeight||media) || A.Height&&(N.Height!=A.Height||media))
      || A.Style&&!A.Style[this.Img.Style] || A.GanttStyle&&!A.GanttStyle[this.Img.GanttStyle] || A.Media&&media&&A.Media!=media || A.Media=="tablet"&&!Grids.Tablet&&!media || A.Media=="desktop"&&Grids.Tablet&&!media
      || A.Media&&!media&&(A.Media=="print"||A.Media=="export") || A.Rtl!=null&&!A.Rtl!=!this.Rtl 
      || A.Size&&this.Size.search(A.Size)!=0
      || A.Language&&this.Language.search(A.Language)!=0
      ));
   if(!no&&MA&&A) for(var j=0;j<MA.length;j++) if(A[MA[j]]!=null&&A[MA[j]]!=this[MA[j]]) { no = 1; break; }
   if(no ? !U||!Grids.OnMediaUse(this,M,0) : U&&Grids.OnMediaUse(this,M,1)==0) continue;
   if(A) { M[attr] = value; D = null; }
   else D = M;
   }
if(D) D[attr] = value;
}
// -----------------------------------------------------------------------------------------------------------
ME.Media;

// -----------------------------------------------------------------------------------------------------------
// Upravi Tag=2 pri zmene NoVScroll / NoHScroll
TGP.UpdateMediaTag = function(){
MS.Media;
var M = Grids.MediaObjects["MT2_"+this.id];
if(M){
   if(this.NoHScroll&&!M.WW) M.WW = window.innerWidth; else if(!this.NoHScroll&&M.WW) M.WW = 0;
   if(this.NoVScroll&&!M.WH) M.WH = window.innerHeight; else if(!this.NoVScroll&&M.WH) M.WH = 0;
   }
ME.Media;
}
// -----------------------------------------------------------------------------------------------------------

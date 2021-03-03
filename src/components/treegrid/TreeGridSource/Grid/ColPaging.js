// -----------------------------------------------------------------------------------------------------------
// Column paging
// -----------------------------------------------------------------------------------------------------------
MS.ColPaging;
// -----------------------------------------------------------------------------------------------------------
TGP.ShowColPages = function(){
if(this.ColPaging==1){
   var CN = this.ColNames, len = CN.length-1;
   for(var pos=1;pos<len&&CN[pos].State==4;pos++);
   if(pos!=len && !this.InPaging){
      this.InPaging = 1;
      MS.Debug; this.StartTimer("RenderColPages"); this.Debug(4,"Rendering column pages"); ME.Debug;
      var cap = this.GetText("RenderProgressCaptionCols"), txt = this.GetText("RenderProgressText"), btn = this.GetText("RenderProgressCancel");
      var T = this, cnt = CN.length-2;
      function render(){
         if(T.CancelProgress){
            MS.Debug; T.Debug(4,"Rendering column pages canceled, rendered ",pos," pages in ",T.EndTimer("RenderColPages")," ms, the rest of pages will be rendered on demand"); ME.Debug;
            T.HideMessage();
            T.CancelProgress = 0;
            if(T.Paging==2) T.Paging = 2;
            if(T.ChildParts==1) T.ChildParts = 2;
            if(T.ColPaging==1) T.ColPaging = 2;
            T.InPaging = null;
            T.CalculateSpaces(1);
            T.Update();
            MS.Paging; T.ShowPages(); ME.Paging; 
            return;
            }
         MS.Debug; if(pos==1) T.Debug(4,"Rendering column pages"); ME.Debug;
         T.RenderColPage(pos);
         for(pos++;pos<len&&CN[pos].State==4;pos++);
         if(pos<len) {
            T.ShowProgress(cap,txt,btn,pos,cnt);
            setTimeout(render,10);
            }
         else {
            MS.Debug; T.Debug(4,"TreeGrid column pages rendered in ",T.EndTimer("RenderColPages")," ms"); ME.Debug;
            T.HideMessage();
            T.Update();
            T.InPaging = null;
            MS.Paging; T.ShowPages(); ME.Paging; 
            }
         }
      this.ShowProgress(cap,txt,btn,pos,cnt);   
      setTimeout(render,10);
      }
   }
else if(this.ColPaging==2){
   var A = this.GetShowedColPages();
   for(var i=0;i<A.length;i++) if(this.ColNames[A[i]].State==2){
      this.ColNames[A[i]].State = 3;
      var F = new Function("p","setTimeout(function(){if("+this.This+")"+this.This+".StartColPage("+A[i]+","+this.ReloadIndex+");},10);");
      F(A[i]);
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.StartColPage = function(sec,reloadindex){
var S = this.ColNames[sec];
if(this.Loading || reloadindex!=null && this.ReloadIndex!=reloadindex || !S || !this.IsColPageShowed(sec)){
   if(S && S.State&1) S.State--;
   return; 
   }
if(S.State==4) return; 
this.RenderColPage(sec);
this.Update();
}
// -----------------------------------------------------------------------------------------------------------
TGP.RenderColPage = function(sec){
if(Grids.OnRenderColPageStart) Grids.OnRenderColPageStart(this,sec);
MS.Animate; this.FinishAnimations(); ME.Animate;
var SS = [], zf = this.FirstSec, zl = this.LastSec, fix = !sec||sec==this.ColNames.length-1; this.FirstSec = sec; this.LastSec = sec;
if(fix) { var zc = this.CPSecs; this.CPSecs = null; }
this.ColNames[sec].State = 4;
this.RenderingSection = 2;
if(this.HeadSec[1] && (!this.CPLastSec||fix)) { SS[sec] = []; this.GetPageHTML(this.XH,SS); this.HeadSec[sec].innerHTML = SS[sec].join(""); this.UpdateFixed(this.XH,this.HeadSec); }

SS[sec] = []; this.GetBodyHTML(SS); this.BodySec[sec].innerHTML = SS[sec].join(""); this.UpdatePages();

if(this.FootSec[1] && (!this.CPLastSec||fix)) { SS[sec] = []; this.GetPageHTML(this.XF,SS); this.FootSec[sec].innerHTML = SS[sec].join(""); this.UpdateFixed(this.XF,this.FootSec); }
this.RenderingSection = null;
this.FirstSec = zf; this.LastSec = zl; if(fix) this.CPSecs = zc;
MS.Overlay; if(this.Overlay>=2) this.UpdateOverlays(null,sec); ME.Overlay;
this.UpdateCursors(1);
if(Grids.OnRenderColPageFinish) Grids.OnRenderColPageFinish(this,sec);
}
// -----------------------------------------------------------------------------------------------------------
TGP.AddColPage = function(names,def,update){
var CN = this.ColNames;
if(!this.ColPaging || !names) return;
if(names-0){
   var count = names; names = [];
   for(var i=1,cnt=0;i<CN.length-1;i++) cnt += CN[i].length;
   if(this.ColIndex){
      var chars = this.ColIndexChars, plus = this.ColIndexStart!=null ? this.ColIndexStart-1 : 0;
      for(var c=this.GetLastCol(1,null,2);c&&!this.Cols[c].HasIndex;c=this.GetPrevCol(c,null,2));
      var pos = c ? this.Cols[c].HasIndex : 0;
      var col = chars ? this.GetIndexChars(pos+plus,chars) : pos+plus; if(col-0) col = "C"+col;
      if(c==col||!c) { 
         pos++;
         for(var i=0;i<count;i++){
            var col = chars ? this.GetIndexChars(pos+plus,chars) : pos+plus; if(col-0) col = "C"+col;
            if(this.Cols[col]) col = "C"+(cnt+i+1);
            names[i] = col; pos++;
            }
         }
      }
   if(!names.length) for(var i=0;i<count;i++) names[i] = "C"+(cnt+i+1);
   }
else if(typeof(names)=="string") names = names.split(",");
for(var i=0,p=1;i<names.length;i++) while(this.Cols[names[i]]||this.RemovedCols[names[i]]) names[i] = "C"+p++;
if(Grids.HiddenScroll==2) { var lc = this.BodySec[this.ColNames.length-2].lastChild; if(lc) lc.style.width = ""; } 
var idx = CN.length-1;
CN[idx+1] = CN[idx];
var S = [], D;
CN[idx] = S;
S.State = 2;
var zal = this.Rendering; this.Rendering = 1;
for(var i=0,w=0;i<names.length;i++) {
   var obj = typeof(names[i])=="object", N = obj ? names[i].Name : names[i], P = obj ? names[i] : {Def:def};
   var vis = P.Visible==null ? 1 : P.Visible;
   P.Visible = null;
   var c = this.AddCol(N,1,null,P,0);
   if(c){ 
      c.Visible = vis; 
      if(!c.Width) this.CalcWidth(N,1);
      if(vis) w += c.Width; 
      if(this.AllColsSelected && (c.CanSelect==1||c.CanSelect==2)) {
         if(this.SelectAllType&8) c.Selected = 1;
         else if(this.SelectAllType&2) this.SetAllColsSelected(0);
         }
      }
   }
w = "<div style='width:"+w+"px'>"+CNBSP+"</div>";
this.UpdateSecCount();
this.SetVPos();
this.Rendering = zal;
if(this.BodySec){
   function move(row,rsec,rsec2){
      for(var r=row.firstChild;r;r=r.nextSibling){
         if(r[rsec]) { r[rsec2] = r[rsec]; r[rsec] = null; }
         if(r.firstChild) move(r,rsec,rsec2);
         }
      }
   if(this.BodySec[idx]) { 
      this.BodySec[idx+1] = this.BodySec[idx]; move(this.XB,"r"+idx,"r"+(idx+1)); 
      if(this.RemovedPages) move({firstChild:this.RemovedPages},"r"+idx,"r"+(idx+1));
      }
   if(this.HeadSec[idx]){ this.HeadSec[idx+1] = this.HeadSec[idx]; this.HeadSec[idx] = null; move(this.XH,"r"+idx,"r"+(idx+1)); }
   if(this.FootSec[idx]){ this.FootSec[idx+1] = this.FootSec[idx]; this.FootSec[idx] = null; move(this.XF,"r"+idx,"r"+(idx+1)); }
   D = this.BodySec[1].parentNode.insertCell(idx-1); D.innerHTML = w; this.BodySec[idx] = D;
   if(this.HeadSec[1] && !this.CPLastSec) { D = this.HeadSec[1].parentNode.insertCell(idx-1); D.innerHTML = w; this.HeadSec[idx] = D; }
   if(this.FootSec[1] && !this.CPLastSec) { D = this.FootSec[1].parentNode.insertCell(idx-1); D.innerHTML = w; this.FootSec[idx] = D; }
   if(this.CPLastSec && (update||update==null)) this.RefreshFixed();
   }
if(this.ColIndex) this.UpdateColIndex();
this.LoadingPage = 1;
this.CalculateSpaces(1);
this.Update();

MS.CustomScroll;
if(this.CustomHScroll){
   var sc = this.ScrollHorz[1], sz = this.ScrollHorzZoom[1];
   if(sc&&sc.scrollWidth){
      var pos = this.GetScrollLeft(1), w = sc.scrollWidth - sc.offsetWidth, max = w / sz; if(pos>max) pos = max;
      sc.ScrollLeft = pos;
      sc.scrollLeft = w - Math.floor(sz*pos);
      
      }
   }
ME.CustomScroll;
this.LoadingPage = 0;
if(this.FRect&&this.FRect[6]){
   for(var lc=this.GetLastCol();lc&&!this.CanFocus(this.FRow,lc);lc=this.GetPrevCol(lc));
   var rect = this.FRect.slice(); rect[3] = lc;
   this.Focus(this.FRow,this.FCol,null,rect,12);
   if(this.FRect[7]&&this.SelectingFocus&4) for(var S=this.ColNames[idx],c=0;c<S.length;c++) this.Cols[S[c]].Selected = 1;
   }
return idx;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ClearColPage = function(sec,rem,noupd){
if(this.EditMode && !this.FRow.Space && this.Cols[this.FCol].Sec==sec) return; 
MS.Animate; this.FinishAnimations(); ME.Animate;
function clear(row,rsec){
   for(var r=row.firstChild;r;r=r.nextSibling){
      if(r[rsec]) { r[rsec].row = null; r[rsec] = null; }
      if(r.rch1) r["rch"+sec] = null;
      if(r.firstChild) clear(r,rsec);
      }
   }
var width = rem ? null : "<div style='width:"+this.BodySec[sec].offsetWidth+"px'>"+CNBSP+"</div>", rsec = "r"+sec;
if(this.HeadSec[1] && !this.CPLastSec) { clear(this.XH,rsec); if(rem) this.HeadSec[1].parentNode.removeChild(this.HeadSec[sec]); else this.HeadSec[sec].innerHTML = width; }
clear(this.XB,rsec); if(rem) this.BodySec[1].parentNode.removeChild(this.BodySec[sec]); else this.BodySec[sec].innerHTML = width;
if(this.FootSec[1] && !this.CPLastSec) { clear(this.XF,rsec); if(rem) this.FootSec[1].parentNode.removeChild(this.FootSec[sec]); else this.FootSec[sec].innerHTML = width; }
if(this.RemovedPages) clear({firstChild:this.RemovedPages},rsec);
if(!noupd) this.UpdateCursors(1);
}
// -----------------------------------------------------------------------------------------------------------
TGP.MergeColPages = function(sec,sec2){
MS.Animate; this.FinishAnimations(); ME.Animate;
for(var i=sec+1,N=this.ColNames[sec],p=N.length;i<=sec2;i++){
   for(var S=this.ColNames[i],j=0;j<S.length;j++) { 
      this.Cols[S[j]].Sec = sec; 
      this.Cols[S[j]].Pos = p; 
      N[p++] = S[j];
      }
   this.ColNames[i] = [];
   }
this.SetVPos();
if(this.Loading || !this.BodyMain) { this.UpdateSecCount(); return; }
this.RemoveColPage(sec+1,sec2-sec,0,1);
this.RenderColPage(sec);
this.Update();
}
// -----------------------------------------------------------------------------------------------------------
TGP.AddAutoColPages = function(){

MS._Debug; if(0){ ME._Debug; this.AutoPages = 0; this.AutoColPages = 0; NoModule("PagingAuto","Sheet"); MS._Debug; } ME._Debug;

}
// -----------------------------------------------------------------------------------------------------------
TGP.ClearAutoColPages = function(){

}
// -----------------------------------------------------------------------------------------------------------
TGP.RemoveColPage = function(sec,cnt,del,noupd){
if(!(cnt>0)) cnt = 1;
if(sec+cnt>=this.ColNames.length-1) { cnt = this.ColNames.length-1-sec; if(cnt<1) return; }
MS.Animate; this.FinishAnimations(); ME.Animate;

for(var j=0;j<cnt;j++) this.ClearColPage(j+sec,1,1);
for(var i=sec+cnt,len=this.ColNames.length;i<len;i++){ 
   function change(row,sec){
      for(var r=row.firstChild;r;r=r.nextSibling){
         if(r["r"+sec]) { r["r"+(sec-cnt)] = r["r"+sec]; r["r"+sec] = null; }
         if(r.firstChild) change(r,sec);
         }
      }
   if(this.HeadSec[1]) { change(this.XH,i); this.HeadSec[i-cnt] = this.HeadSec[i]; this.HeadSec[i] = null; }
   change(this.XB,i); this.BodySec[i-cnt] = this.BodySec[i]; this.BodySec[i] = null;
   if(this.FootSec[1]) { change(this.XF,i); this.FootSec[i-cnt] = this.FootSec[i]; this.FootSec[i] = null; }
   
   }

if(del||del==null){
   for(var j=0;j<cnt;j++){
      for(var N=this.ColNames[sec+j],i=0;i<N.length;i++){
         var col = N[i], C = this.Cols[col];
         delete this.Cols[col];
         if(col==this.MainCol) { this.MainCol = null; this.CalculateSpaces(1); }
         }
      this.ColNames[sec+j] = [];
      }
   }
this.UpdateSecCount(); 
if(this.CPLastSec && !noupd) this.RefreshFixed();
if(!noupd) this.Update();
}
// -----------------------------------------------------------------------------------------------------------
TGP.RefreshFixed = function(){
var SS = [];
if(this.HeadSec[1]) { SS[1] = []; this.GetPageHTML(this.XH,SS); this.HeadSec[1].innerHTML = SS[1].join(""); this.UpdateFixed(this.XH,this.HeadSec); }
if(this.FootSec[1]) { SS[1] = []; this.GetPageHTML(this.XF,SS); this.FootSec[1].innerHTML = SS[1].join(""); this.UpdateFixed(this.XF,this.FootSec); }
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetShowedColPages = function(){
var scr = this.GetScrollLeft(-1), width = this.GetBodyWidth(-1);
if(this.NoHScroll) { width += this.BodyScrollLeft; scr -= this.BodyScrollLeft; }
var CN = this.ColNames, len = CN.length-1, A = [], p = 0, zscr = scr;
for(var i=1;i<len&&scr>=0;i++) scr -= CN[i].Width;
if(BChrome && this.BodySec[i] && !this.Rtl && !BEdge && !this.RelWidth){ 
   var nleft = this.BodySec[i].offsetLeft;
   if(scr!=zscr-nleft){
      scr = zscr-nleft;
      if(i<len && scr>=0) scr -= this.BodySec[i++].offsetWidth;
      }
   }
var time = new Date()-0;
A[p++] = i-1;
CN[i-1].LastAccess = time;
for(width+=scr;i<len&&width>=0;i++) { 
   A[p++] = i; 
   if(BChrome && this.BodySec[i] && !this.Rtl && !BEdge && !this.RelWidth) width -= this.BodySec[i].offsetWidth; 
   else width -= CN[i].Width; 
   CN[i].LastAccess = time;
   }
return A;
}
// -----------------------------------------------------------------------------------------------------------
TGP.IsColPageShowed = function(sec){
var scr = this.GetScrollLeft(-1), width = this.GetBodyWidth(-1), CN = this.ColNames;
if(this.NoHScroll) { width += this.BodyScrollLeft; scr -= this.BodyScrollLeft; }
if(BChrome && this.BodySec[sec] && !this.Rtl && !BEdge && !this.RelWidth) scr -= this.BodySec[sec].offsetLeft; 
else for(var i=1;i<sec;i++) scr -= CN[i].Width;

return scr<CN[sec].Width && width+scr>0;
}
// -----------------------------------------------------------------------------------------------------------
TGP.RemoveUnusedColPages = function(){
if(Grids.Drag) return;
var CN = this.ColNames, len = CN.length-1, A = [], max = this.MaxColPages;
var cnt = this.GetShowedColPages().length; 
if(max<cnt) max = cnt;
for(var i=2;i<len;i++) if(CN[i].State==4) A[A.length] = i; 
if(A.length<=max) return; 
A.sort(function(a,b){ return CN[a].LastAccess > CN[b].LastAccess ? -1 : CN[a].LastAccess < CN[b].LastAccess });
for(var i=max;i<A.length;i++) {
   this.ClearColPage(A[i]);
   CN[A[i]].State = 2;
   }
this.Update();
this.UpdateCursors(1);
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetAllColPages = function(){
for(var i=1,CN=[];i<=this.CPLastSec;i++){ var S = this.ColNames[i]; for(var j=0;j<S.length;j++) CN[CN.length] = S[j]; } 
return CN;
}
// -----------------------------------------------------------------------------------------------------------
ME.ColPaging;

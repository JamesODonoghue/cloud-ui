// -----------------------------------------------------------------------------------------------------------
// HTML functions for scrolling
// ---------------------------------------------------------------------------------------------------------------------------
var CSecOrder = {"left,mid,right":[0,1,2],"left,right,mid":[0,2,1],"mid,left,right":[1,0,2],"mid,right,left":[1,2,0],"right,left,mid":[2,0,1],"right,mid,left":[2,1,0]};
// ---------------------------------------------------------------------------------------------------------------------------
// Sets extents of grid sections and scrollbars
TGP.Update = function(fromwidth,onstart,test,addwidth){
if(this.Rendering&&!test || !this.BodyMain || !this.BodyMain[1].parentNode|| !this.ScrollVertParent || this.Printing || this.RenderingSync) return true; 
MS.Animate; if(this.AnimatingRow&&!test&&this.IsAnimatingRow()) return true; ME.Animate; 
var I = this.Img, C = this.Cols, P = this.Pagers, M = this.MainTag, MT = this.MainTable, icr = I.LastBorderRight, icb = I.LastBorderBottom; 
 
if(this.DynamicBorder&&icr) icr = 3; 
var B1 = this.BodyMain[1], H1 = this.HeadMain[1], F1 = this.FootMain[1];
if(!test) { 
   this.Rendering = true;
   if(++this.UpdateCount>20){
      if(this.LimitScroll){
         MS.LimitScroll;
         this.LimitScroll = 0; 
         this.Debug(2,"Update layout failed, clearing LimitScroll!");
         info("UpdateCount LimitScroll error !!!");
         ME.LimitScroll;
         this.UpdateCount = 0;
         }
      else {
         this.Debug(1,"Update layout failed!");
         info("UpdateCount error !!!");
         return;
         }
      }
   }

if(BIEA) M.offsetWidth; 

if(!this.TagWidth && M.offsetWidth || this.NoScroll) this.GetMainTagSize();

if(!M.offsetWidth || !M.firstChild){ this.HiddenMainTag = 1; this.Rendering = false; this.UpdateCount = 0; return true; }  

if(!test){
   if(this.Alternate) this.ReColor();
   if(this.RowIndex) this.UpdateRowIndex();
   if(this.ColIndex) this.UpdateColIndex();
   }

// --- Hide pager ---

if(BIEA&&!BIEA9){ 
   if(!test&&this.ShowVScroll) this.ScrollVertParentChild.style.height = "10px";
   MS.Pager; if(!test) for(var i=0;i<P.length;i++) if(P[i].Visible) P[i].Tag.style.height = "10px"; ME.Pager; 
   }

// --- height compute ---
var sh = this.CustomHScroll==4 ? 0 : this.ScrollHeight + I.ScrollHAllHeight + (BIEA10||this.CustomHScroll?0:-1); 
var mh = this.TagHeight; if(this.MaxVScroll && mh<this.MaxVScroll) mh = this.MaxVScroll;
mh -= I.TagBPHeight; MS.Scale; if(this.Scale&&this.Scale!=1) mh--; ME.Scale; 
I.TopHeight = 0; I.BottomHeight = 0;
for(var p=MT.previousSibling;p;p=p.previousSibling) if(p.margin!=null) { var h = (p.scrollHeight>p.offsetHeight?p.scrollHeight:p.offsetHeight)+p.margin; if(h) I.TopHeight += h; }

for(var p=MT.nextSibling;p;p=p.nextSibling) if(p.margin!=null){ var h = (p.scrollHeight>p.offsetHeight?p.scrollHeight:p.offsetHeight)+p.margin; if(h) I.BottomHeight += h; }

var tbh = I.TopHeight + I.BottomHeight; mh -= tbh;
MS.Scale; if(this.Scale) mh = Math.round(mh/this.Scale); ME.Scale;
mh -= I.TableAllHeight;  
var hhead = H1 ? H1.firstChild.offsetHeight : 0, hfoot = F1 ? F1.firstChild.offsetHeight : 0;
var toph = (hhead?hhead-icb:0)+I.HeadMHeight+I.HeadBPHeight, both = (hfoot?hfoot+I.FootMHeight+I.FootBPHeight-icb:0) - icb;   
var spch = 0;                              
var minh = 0, cntrel = 0;                  
var RH = this.RelHeight ? [] : null;
MS.RelHeight;
if(RH){ 
   var F = this.GetFixedRows();
   for(var i=0;i<F.length;i++){
      if(!F[i].RelHeight) continue;
      cntrel += F[i].RelHeight;
      minh -= F[i].r1.offsetHeight - (F[i].MinHeight?F[i].MinHeight:this.RowHeight);
      RH[RH.length] = F[i];
      }   
   }
ME.RelHeight;
MS.Space;
var sc = this.GetScale(null,1), sco = this.GetScale(null,0), HH = [], SH = null;
for(var r=this.XS.firstChild;r;r=r.nextSibling){  
   var out = r.Space==-1 || r.Space==5 || r.Tag;
   if(r.SpaceWrap && !r.RelHeight && r.r1 && !r.Tag) { 
      if(!SH) SH = {}; SH[r.id] = 0;
      if(out){
         var oh = r.r1.offsetHeight+r.r1.margin;
         if(r.r1.scrollHeight>r.r1.offsetHeight) oh += r.r1.scrollHeight-r.r1.offsetHeight; 
         r.r1.firstChild.style.width = "10000px"; 
         hh = r.r1.offsetHeight+r.r1.margin; SH[r.id] = hh;
         hh -= oh;
         tbh += hh;
         if(r.Space==-1) I.TopHeight += hh; else I.BottomHeight += hh;
         MS.Scale; if(this.Scale) hh = Math.round(hh/this.Scale); ME.Scale;
         mh -= hh;
         continue;
         }
      r.r1.firstChild.style.width = "10000px"; 
      }
   if((sco||sc)&&r.r1) {
      if(out){ if(sco) r.r1.style.height = r.r1.firstChild.offsetHeight*sco+"px"; }
      else if(sc) r.r1.style.height = r.r1.firstChild.offsetHeight*sc+"px";
      }
   if(!r.r1 || out) continue;
   
   var p = r.r1.parentNode.parentNode, hh = p.offsetHeight; if(!hh) hh = 0; 
   if(hh && BIEA && p.nextSibling) { var hx = p.nextSibling.offsetTop - p.offsetTop; if(hx==hh+1||hx==hh-1) hh = hx; } 
   
   if(r.Space==1) toph += hh;
   else if(r.Space==2||r.Space==3) both += hh;
   else spch += hh;
   if(SH && r.SpaceWrap && !r.RelHeight && r.r1) SH[r.id] = hh;
   MS.RelHeight;
   if(RH && r.RelHeight){
      cntrel += r.RelHeight;
      minh -= hh;
      if(r.MinHeight) minh += r.MinHeight*(sc?sc:1) + (r.r1.parentNode.offsetHeight - r.r1.offsetHeight);
      RH[RH.length] = r;
      }
   ME.RelHeight;   
   }
ME.Space;
minh += toph+both+spch;

if(BIE5) B1.scrollHeight; 
else if(BIEA&&!test) B1.scrollTop = B1.scrollTop; 
var scrh = this.HiddenBody?(BIEA?1:0)-I.BodyAllHeight : this.BodySec[1].lastChild.offsetTop-this.BodySec[1].firstChild.offsetTop;
MS.Debug; if(scrh > 17895166 || scrh<0&&!this.HiddenBody) this.Debug(2,"The grid body is too high (",scrh,"), you should use PageLengthDiv to reduce it to avoid problems in Firefox, its maximal body height is 17895166 pixels"); ME.Debug;

// --- width compute ---
var spw = this.LeftSplitterWidth + this.RightSplitterWidth; 
var mw = this.TagWidth - I.TagBPWidth; 
MS.Scale; if(this.Scale) mw = Math.round(mw/this.Scale); ME.Scale;
mw -= I.TableAllWidth + spw; 
var sw = this.CustomScroll==4 ? 0 : I.ScrollVAllWidth+this.ScrollWidth+(BIEA10||this.CustomScroll?0:-1);        
var asw = (minh+scrh+I.BodyAllHeight>mh-sh || this.ShowVScroll) && !this.NoVScroll && !this.NoScroll?sw:0;      
var minwidth = I.CellBorderWidth;
var WO = [0,0,0,0]; 

for(var c in C) if(C[c].Visible||C[c].RelHidden) WO[C[c].MainSec] += C[c].RelWidth ? C[c].MinWidth : C[c].Width;
MS.ColPaging; 
if(BChrome && this.ColPaging && !BEdge && !this.RelWidth) { 
   var BS = this.BodySec[this.Rtl ? 1 : this.ColNames.length-2];
   if(BS && BS.offsetWidth) WO[1] = BS.offsetLeft+BS.offsetWidth;
   }
ME.ColPaging;
if(!WO[1]) WO[1] = 3; 
var sn = ["LeftWidth","MidWidth","RightWidth",""];           
var sb = [I.LeftAllWidth,I.MidAllWidth,I.RightAllWidth,I.PagerAllWidth]; 
if(this.RelWidthSec){
   var CR = [[],[],[]], CRW = [WO[0],WO[1],WO[2]], AWO = [this[sn[0]],this[sn[1]],this[sn[2]]]; //WO = [this[sn[0]]-sb[0],this[sn[1]]-sb[1],this[sn[2]]-sb[2]];
   for(var c in C) if((C[c].Visible||C[c].Hidden) && C[c].RelWidth && C[c].RelWidthType&1) { CR[C[c].MainSec][CR[C[c].MainSec].length] = C[c]; C[c].MinRelWidth = null; }
   MS.Sync;
   if(this.Sync["sec"]){
      for(var k=0;k<Grids.length;k++){
         var G = Grids[k];
         if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId && G.Sync["sec"]){
            var GC = G.Cols, GWO = [0,0,0,0];
            for(var c in GC) if(GC[c].Visible||GC[c].RelHidden) GWO[GC[c].MainSec] += GC[c].RelWidth ? GC[c].MinWidth : GC[c].Width;
            for(var i=0;i<3;i++) if(AWO[i]<GWO[i]) AWO[i] = GWO[i];
            }
         }
      }
   ME.Sync;
   function SetRelWidthSec(CRI,w,spec){
      var dw = 0;
      for(var j=0,pc=0;j<CRI.length;j++) {
         if(spec&&!(CRI[j].RelWidthType&2)) { var ww = CRI[j].MinRelWidth; w -= ww; }
         else pc += CRI[j].RelWidth;
         }
      if(pc){
         var wpc = w/pc;
         for(var j=0;j<CRI.length;j++) if(!spec || CRI[j].RelWidthType&2){
            if(spec && CRI[j].MinRelWidth) dw -= CRI[j].MinRelWidth;
            if(w>=0) {
               var ww = j==CRI.length-1 ? w : Math.floor(CRI[j].RelWidth*wpc);
               w -= ww;
               CRI[j].MinRelWidth = CRI[j].MinWidth + ww;
               dw += ww; if(spec) dw += CRI[j].MinWidth;
               }
            else if(CRI[j].RelWidthType&4){
               if(spec) dw += CRI[j].MinWidth;
               CRI[j].MinRelWidth = null;
               }
            else {
               if(!spec) dw -= CRI[j].MinWidth;
               w += CRI[j].MinWidth;
               CRI[j].MinRelWidth = 0;
               }
            }
         }
      return dw;
      }
   for(var i=0;i<3;i++) WO[i] += SetRelWidthSec(CR[i],(AWO[i]?AWO[i]:(AWO[i]==0?WO[i]:0))-WO[i]);
   }
var HS = this.ShowHScroll?1:0, HSS = [0,0,0,0];   
var rest = mw-asw; 
var WN = [0,0,0,0]; 
var whs = this.WideHScroll;
if(BChrome) for(var i=0;i<3;i+=2) if(WO[i]) { var w, r = this.Header["r"+i]; if(r) { w = r.offsetWidth; if(w&&WO[i]>w&&WO[i]-r.cells.length<=w) WO[i] = w-sb[i]; } } 
for(var i=0;i<3;i++) if(WO[i]||i==1) { WN[i] = WO[i] + sb[i] - icr; rest -= WN[i]; } 

if(!test) this.PagersLeft = 0;
var RP = null;
MS.Pager; 
for(var i=0;i<P.length;i++) if(P[i].Visible) { 
   var w = P[i].Width;
   if(P[i].OrigWidth!=null){
     if(!RP) RP = [];
     RP[i] = P[i].Width - P[i].OrigWidth;
     w = P[i].OrigWidth;
     }
   WO[3] += w; WN[3] += w + I.PagerAllWidth; 
   if(P[i].Left&&!test) this.PagersLeft += w + I.PagerAllWidth;
   } 
rest -= WN[3]; 
ME.Pager; 

var aswx = null, aswp;
if(rest<0 && !this.NoHScroll && !this.NoScroll){ 
   var ord = CSecOrder[(this.SectionShrinkOrder+"").toLowerCase()]; if(!ord) ord = [1,2,0];
   for(var k=0;k<5&&rest<0;k++){
      if(k==4 && !test){
         if(this.ShrinkStyle && this.ShrinkStyle!=3 && this.ShrinkStyleType&1 && this.ShrinkStyleSize(1)) return true;
         MS.LimitScroll;
         if(this.LimitScroll&1){
            this.LimitWidthAsw = asw;
            if(this.DoLimitScroll(1)) return true;
            }
         ME.LimitScroll;
         }
      for(var i=0;i<3&&rest<0;i++) { 
         var p = ord[i], ww = (this[sn[p]]?this[sn[p]]:(this[sn[p]]==0?WO[p]:0)), wx = ww; 
         if(whs && p!=1) continue;
         if(k==1 && this.RelWidthSec && CR[p].length){
            var dw = SetRelWidthSec(CR[p],WN[p]-sb[p]+icr+rest-CRW[p],1);        
            if(dw){ rest -= dw; WN[p] += dw; if(dw<0) WO[p] += dw; if(wx) wx += dw; } 
            }
         else if(k==2){ wx = ww ? 0 : this["Min"+sn[p]]; if(wx==null) wx = 50; } 
         else if(k==3){ wx = ww ? this["Min"+sn[p]] : 0; if(wx==null) wx = 50; } 
         else if(k==4){ wx = 1+icr; } 
         if(wx) {
            wx += sb[p]-icr;
            if(WN[p]>wx){
               HS = 1; HSS[p] = 1;
               if(rest > wx-WN[p]){ 
                  WN[p] += rest; if(-rest<=asw) { 
                     for(var j=0,pp=0;j<WN.length;j++) if(HSS[j]) pp++; 
                     if(pp==1) { aswx = asw+rest; aswp = p; }
                     } 
                  rest = 0; 
                  }
               else { rest += WN[p]-wx; WN[p] = wx; }
               }
            }
         }
      MS.Pager;
      if(k==3 && rest<0){ 
         for(var i=0;i<P.length&&rest<0;i++) if(P[i].Visible) {
            var dpw = P[i].Width-(RP&&RP[i]?RP[i]:0) - P[i].MinWidth;
            if(dpw>0) {
               if(dpw>-rest) dpw = -rest;
               rest += dpw;
               WN[3] -= dpw;
               if(!test){
                  if(!RP) RP = [];
                  RP[i] = (RP[i] ? RP[i] : 0) + dpw;
                  }
               }
            }
         }
      ME.Pager;
      }
   }

MS.Space;
if(SH){
   var gw = mw-rest-WN[3]-(VS?sw:0)+spw, pw = mw-rest+spw;
   for(var id in SH){
      var r = this.GetRowById(id);
      var bw = r._BorderWidth; if(bw==null) bw = this.Get_BorderWidth(r);
      var ww = r.Space>0 && r.Space<=3 ? gw-bw : pw-bw;
      MS.Scale; if(sc) ww /= sc; ME.Scale; 
      r.r1.firstChild.style.width = BIE?(ww+r.BorderIEWidth)+"px":ww+"px";
      if(r.Space==-1||r.Space==5) {
         MS.Scale; if(sco) r.r1.style.height = r.r1.firstChild.offsetHeight*sco+"px"; ME.Scale;
         var hh = r.r1.offsetHeight+r.r1.margin - SH[id]; 
         tbh += hh;
         if(r.Space==-1) I.TopHeight += hh; else I.BottomHeight += hh;
         MS.Scale; if(this.Scale) hh = Math.round(hh/this.Scale); ME.Scale;
         mh -= hh;
         if(!sco) r.r1.firstChild.style.width = "";
         }
      else {
         MS.Scale; if(sc) r.r1.style.height = r.r1.firstChild.offsetHeight*sc+"px"; ME.Scale;
         var p = r.r1.parentNode.parentNode, hh = p.offsetHeight; if(!hh) hh = 0; 
         if(hh && BIEA && p.nextSibling) { var hx = p.nextSibling.offsetTop - p.offsetTop; if(hx==hh+1||hx==hh-1) hh = hx; } 
         hh -= SH[id];
         if(r.Space==1) toph += hh;
         else if(r.Space==2||r.Space==3) both += hh;
         else spch += hh;
         minh += hh;
         if(!sc) r.r1.firstChild.style.width = "";
         }
      
      }
   }
ME.Space;

MS._Debug; if(0){ ME._Debug; MS._GanttChart; if((!this.Gantt || this.Cols[this.Gantt].Width<10 || !this.Cols[this.Gantt].Visible)&&this.DatesEndLast!=null) return false; ME._GanttChart; MS._Debug; } ME._Debug; 

var VS = (minh+scrh+I.BodyAllHeight > mh-(HS?sh:0) || this.ShowVScroll) && !this.NoVScroll && !this.NoScroll?1:0;
if(rest>=0 && !VS && asw) rest += asw; 
if(VS && HS && aswx!=null && !this.ShowVScroll && minh+scrh+I.BodyAllHeight <= mh) { VS = 0; HS = 0; rest = aswx; WN[aswp] += asw-aswx; } 

if(this.LimitWidth!=null && !this.LimitWidthAuto){
   var w0 = WO[0], w1 = WO[1], w2 = WO[2];
   if(!this.FirstSec) {
      if(w0>this.MinLeftWidth) w0 = this.MinLeftWidth;
      if(this.LeftWidth&&w0>this.LeftWidth) w0 = this.LeftWidth;
      w0 += I.LeftAllWidth-icr;
      }
   if(this.SecCount==3) {
      if(w2>this.MinRightWidth) w2 = this.MinRightWidth;
      if(this.RightWidth&&w2>this.RightWidth) w2 = this.RightWidth;
      w2 += I.RightAllWidth-icr;
      }
   if(w1>this.MinMidWidth) w1 = this.MinMidWidth;
   if(this.MidWidth&&w1>this.MidWidth) w1 = this.MidWidth;
   w1 += I.MidAllWidth-icr;
   var msw = mw - (this.LimitWidthAsw!=null ? this.LimitWidthAsw : (VS?sw:0)) + spw + this.LimitWidth - this.TagWidth;
   if(msw-WN[3]-(I.PagerAllWidth?P.length*I.PagerAllWidth:0)>=w0+w1+w2){
      var clr = 1;
      MS.LimitScroll;
      if(this.LimitScroll&4&&this.RelWidth) for(var r=this.XS.firstChild;r;r=r.nextSibling) if(!r.Tag&&r.Cells&&r.Visible){
         var ow = r.r1.firstChild.offsetWidth;
         var last = Get(r,"LastVisible"); if(last) { var lc = this.GetCell(r,last); if(lc) { ow = lc.offsetWidth+lc.offsetLeft-r.r1.firstChild.offsetLeft; } }
         for(var i=0;i<r.Cells.length;i++){ 
            var c = r.Cells[i]; if(!r[c+"RelWidth"]&&r[c+"Type"]!="DropCols") { if(c==last) break; continue; }
            var v = r[c+"Visible"]; if(v==null) v = r.Def[c+"Visible"]; if(v<=0) continue;
            var cell = this.GetCell(r,c); if(!cell) continue;
            ow -= cell.lastChild.offsetWidth; 
            if(r[c+"MinWidth"]) ow += r[c+"MinWidth"];
            if(c==last) break;
            }      
           var bw = r._BorderWidth; if(bw==null) bw = this.Get_BorderWidth(r);
         if(msw-bw-(r.Space>=1&&r.Space<=3?WN[3]:0)>=ow) continue;
         clr = 0; 
         break;
         }
      ME.LimitScroll;
      if(clr && this.ClearLimitScroll(1)) return true;
      }
   }

if(rest<0 && this.ResizingMain&2 && !test && !this.NoHScroll){
   var msw = parseInt(M.style.width); if(!msw) msw = 0;
   M.style.width = msw - rest + "px";
   mw -= rest;
   rest = 0;
   }

var eh = mh-(HS?sh:0)-(this.HiddenBody?(BIEA?1:0):I.BodyAllHeight)-minh;
if(eh<=0 && this.ResizingMain&1 && !test){
   var msh = parseInt(M.style.height); if(!msh) msh = 0;
   var nh = msh - eh + this.RowHeight;
   if(this.MaxVScroll && this.MaxVScroll<nh) this.MaxVScroll = nh;
   M.style.height = nh + "px";
   this.TagHeight = M.offsetHeight;
   mh += this.RowHeight-eh;
   eh = this.RowHeight;
   VS = (minh+scrh+I.BodyAllHeight > mh-(HS?sh:0) || this.ShowVScroll) && !this.NoVScroll && !this.NoScroll?1:0;
   if(rest>=0 && !VS && asw) rest += asw; 
   }

if((rest<0&&!this.NoHScroll || eh<=0&&!this.NoVScroll) && !this.NoScroll && !test){ 
   MS.Scale;
   if(this.Scale>1) { 
      if(this.ShrinkScale(1)) return true; 
      this.SetScale(1); this.Rendering = false; return this.Update(fromwidth,onstart); 
      }
   ME.Scale;
   if(rest<0 && this.MaxHScroll){ 
      if(this.TagWidth < M.offsetWidth) { this.TagWidth = M.offsetWidth; this.Rendering = false; return this.Update(fromwidth,onstart);  }
      else if(this.MaxHScroll>this.TagWidth+this.UpdateCount) { this.SetNoHScroll(1); this.Rendering = false; return this.Update(fromwidth,onstart); }
      }
   if(this.ShrinkStyle && this.ShrinkStyle!=3 && this.ShrinkStyleType&19 && this.ShrinkStyleSize((rest<0&&!this.NoHScroll?1:0)+(eh<=0&&!this.NoVScroll?2:0))) return true;
   MS.LimitScroll; if(this.LimitScroll&3 && this.DoLimitScroll((rest<0&&!this.NoHScroll?1:0)+(eh<=0&&!this.NoVScroll?2:0))) return true; ME.LimitScroll;
   this.Rendering = false; this.UpdateCount = 0;
   if(Grids.OnSizeError && Grids.OnSizeError(this,rest,eh)) return;
   if(!this.NestedGrid && !this.ExtentErr){
      if(this.ShrinkStyle==3 && this.ShrinkStyleType&19 && this.MainTag.offsetHeight>=50){
         if(this.ExtentErr==2) if(this.ShrinkStyleSize((rest<0&&!this.NoHScroll?1:0)+(eh<=0&&!this.NoVScroll?2:0))) return true;
         var T = this; this.ShowMessageTime(this.GetText("ExtentErr"),0,function(){ 
            T.ExtentErr = 2; T.Enable();
            if(!T.ShrinkStyleSize((rest<0&&!T.NoHScroll?1:0)+(eh<=0&&!T.NoVScroll?2:0))) T.ShowMessage(T.GetText("ExtentErr"),4); 
            },["Shrink"],4);
         }
      else if(this.SuppressMessage<4) this.ShowMessage(this.GetText("ExtentErr"),4);
      }
   M.firstChild.style.visibility = "hidden"; 
   this.ExtentErr = 1;
   return false; 
   }
if(this.ExtentErr){ this.HideMessage(); this.ExtentErr = null; }
if(!test) this.ExtentErr = 0;
if(rest<0) rest = 0; 

// --- Resize pageru ---
MS.Pager; 
if(RP) for(var i in RP){
   var dpw = RP[i]; if(!dpw) continue;
   if(P[i].OrigWidth==null) P[i].OrigWidth = P[i].Width;
   P[i].Width -= dpw;
   if(P[i].OrigWidth==P[i].Width) P[i].OrigWidth = null;
   if(P[i].Left) this.PagersLeft -= dpw;
   P[i].Tag.style.width = P[i].Width+(BIE?I.PagerAllWidth-I.PagerMWidth:0)+"px";
   if(this.ExactWidth) P[i].TagWidth.style.width = P[i].Width+"px";
   }
ME.Pager; 

// --- RelWidth ---
MS.RelWidth;
if(this.RelWidth){
   var pc = 0, Cols = [], rst = rest, updheight = 0, drw = 0, updhid = 0;
   for(var col in C) if(C[col].RelWidth && (C[col].Visible || C[col].RelHidden)) { 
      if(C[col].MinRelWidth!=null&&!(C[col].RelWidthType&8)) Cols.unshift(C[col]); 
      else { pc += C[col].RelWidth; Cols.push(C[col]); } 
      }
   for(var i=0;i<Cols.length;i++){
      var c = Cols[i], rw = c.MinRelWidth!=null&&!(c.RelWidthType&8) ? 0 : rst*c.RelWidth/pc+drw, w = Math.round(rw), cw5 = 0; drw = rw-w;
      if(i==Cols.length-1 && c.MinRelWidth==null) {
         w = rest;
         if(this.ConstWidth==4){
            var B = this.Toolbar, ww = 0, cc = null;
            for(var j=0;j<B.Cells.length;j++){
               var ac = B.Cells[j];
               if(B[ac+"Type"]!="Button" || B[ac+"RelWidth"]==1) break;
               if(B[ac+"Visible"] != 0) cc = ac;
               }
            if(this.Rtl){
               
               }
            else {            
               if(cc) { cc = this.GetCell(B,cc); if(cc) ww = cc.offsetLeft+cc.offsetWidth; }
               cc = this.GetCell(B,"Columns"); if(cc && cc.offsetLeft>=ww) ww = cc.offsetLeft+cc.offsetWidth;
               cc = this.GetCell(B,"Cfg"); if(cc && cc.offsetLeft>=ww) ww = cc.offsetLeft+cc.offsetWidth;
               }
            if(ww) {
               MS.Scale; var scc = B.Space==-1||B.Space==5||B.Tag ? sco : sc; if(scc) ww *= scc; ME.Scale;
               w += ww - mw + (this.ResizingMain ? 20 : 0); 
               }
            else w = 0;
            if(w<0) w = 0;
            }
         else if(this.ConstWidth==5||this.ConstWidth==6) {
            w = 0; cw5 = 1;
            if(addwidth) { w = addwidth; if(w>rest&&this.NoHScroll) { mw += w-rest; rest = w; this.ConstWidth5 = null; }}
            else if(this.ConstWidth5){
               var cw5 = this.ConstWidth5, r = this.Rows[cw5[0]];
               if(r && r.r1 && r.r1.firstChild.offsetWidth == cw5[1]){
                  w = cw5[1] + cw5[2] - (r.Space>0 && r.Space<=3 ? mw-rest-WN[3]-(VS?sw:0)+spw : mw-rest+spw);
                  MS.Scale; if(sc) w *= sc; ME.Scale;
                  if(w<0) w = 0;
                  }
               else this.ConstWidth5 = null;
               }
            }
         else if(this.ConstWidth>10 && this.ConstWidth<mw){
            w += this.ConstWidth-mw;
            if(w<0) w = 0;
            }
         if(w>rest) w = rest;
         }
      var minw = c.MinRelWidth!=null ? c.MinRelWidth : c.MinWidth;
      w += minw; 
      if(w <= minwidth && c.MinRelWidth!=0) { w = 0; rest -= c.MinWidth; WN[c.MainSec] += c.MinWidth; } 
      var dw = w-c.Width;
      if((dw!=0 && (!c.RelHidden||w) || c.RelHidden&&w) && !test){
         var chgsec = 0;
         if(w && this.ColNames[c.Sec].Visible==1 && c.MainSec!=1) { this.ShowColSec(c.MainSec); chgsec = 1; }
         if(c.RelHidden) { this.SetWidth(c.Name,null,1);   updhid = 1; }
         this.SetWidth(c.Name,w ? dw : null,1);
         if(c.Type=="Gantt"&&w) { var GT = this, cn = c.Name; this.SetTimeout(function(){ GT.RefreshGantt(2051,cn); },1000,"RefRelGantt",1); }
         c.RelHidden = !w;
         if(!w) updhid = 1;
         if(c.VarHeight && c.VarHeight>updheight) updheight = c.VarHeight;
          
         if(!w && !this.GetFirstCol(c.MainSec) && c.MainSec!=1 && !cw5) { this.HideColSec(c.MainSec); chgsec = 1; }
         if(chgsec) { this.UpdateHeights(); this.Rendering = false; return this.Update(fromwidth,onstart,null,addwidth); }
         }
      var ddw = (w ? c.Width : 0) - minw;
      if(ddw<0) ddw = 0;  
      rest -= ddw;
      WN[c.MainSec] += ddw; WO[c.MainSec] += ddw;
      }
   if(updhid && this.Rendering && !test) this.UpdateHidden(1);
   MS.VarHeight;
   if(updheight && !test) this.UpdateHeights(onstart?2:1,1);
      
   else {
      hhead = H1 ? H1.firstChild.offsetHeight : 0; 
      hfoot = F1 ? F1.firstChild.offsetHeight : 0;
      }
   ME.VarHeight;
   }
ME.RelWidth;
if(test) return WN[test-0] - sb[test-0] - minwidth + icr + rest; 

// ---- width set ---
this.TmpLeftWidth = WN[0]?WN[0]+this.LeftSplitterWidth:0; this.TmpMidWidth = WN[1]+this.RightSplitterWidth; this.TmpRightWidth = WN[2]; 

var bor = [I.ScrollHLeftAllWidth,I.ScrollHMidAllWidth,I.ScrollHRightAllWidth];
var borm = [I.ScrollHLeftMWidth,I.ScrollHMidMWidth,I.ScrollHRightMWidth];
this.ScrollHorzParent[1].parentNode.style.display = HS?"":"none";

var FR = null;
if(BChrome && this.ExactWidth>=2) { FR = this.GetFirstVisible(this.Paging&&!this.AllPages?this.GetFPage():null); if(FR==null) FR = this.Header; if(!FR.r1) FR = null; }
for(var i=this.FirstSec;i<this.SecCount;i++){
   if(this.RelWidthSec && this[sn[i]]&&this[sn[i]]<WN[i]-sb[i]) this[sn[i]] = WN[i]-sb[i];
   var varwb = WN[i] - sb[i];
   if(varwb<1) varwb = 1; 
   if(HS && HSS[i] && WN[i]+icr<[this.LeftWidth&&this.LeftWidth<this.MinLeftWidth?this.LeftWidth:this.MinLeftWidth,this.MidWidth&&this.MidWidth<this.MinLeftWidth?this.MidWidth:this.MinMidWidth,this.RightWidth&&this.RightWidth<this.MinLeftWidth?this.RightWidth:this.MinRightWidth][i]){
      if(this.ShrinkStyle && this.ShrinkStyle!=3 && this.ShrinkStyleType&1 && this.ShrinkStyleSize(1)) return true;
      MS.LimitScroll; if(this.LimitScroll&1 && this.DoLimitScroll(1)) return true; ME.LimitScroll;
      }
   
   var varwi = varwb + (BSafari&&!BEdge ? 0 : CScrollWidthBase) + icr; 
   
   varwb += "px"; varwi += "px"; 
   this.HeadMain[i].parentNode.style.width = varwb; this.HeadMain[i].style.width = varwb;
   this.BodyMain[i].parentNode.style.width = varwb; this.BodyMain[i].style.width = varwi; 
   if(Grids.HiddenScroll==2) { 
      var lc = this.ColPaging && i==1 ? this.BodySec[this.ColNames.length-2].lastChild : this.BodyMain[i].lastChild;
      if(lc && lc.previousSibling&&lc.previousSibling.firstChild) lc.style.width = lc.previousSibling.firstChild.offsetWidth + CScrollWidthBase;
      else if(lc&&lc.parentNode.firstChild.firstChild) lc.style.width = lc.parentNode.firstChild.firstChild.offsetWidth + CScrollWidthBase;
      }
   if(F1) { this.FootMain[i].parentNode.style.width = varwb; this.FootMain[i].style.width = varwb;  }
   if(this.ExactWidth){
      this.WidthMain[i].style.width = WN[i] + "px";
      if(FR){ 
         var fr = FR["r"+(i==2?this.LastSec:i)]; 
         if(fr){
            var lc = fr.lastChild; while(lc&&!lc.offsetWidth) lc = lc.previousSibling;
            
            if(lc){
               var wc = lc.offsetLeft+lc.offsetWidth;
               if(i==1&&this.ColPaging) {
                  for(var j=this.SecCount==3?this.LastSec-1:this.LastSec;j>1;j--){
                     var fr = FR["r"+j]; if(!fr) { wc = 0; break; } 
                     lc = fr.lastChild; while(lc&&!lc.offsetWidth) lc = lc.previousSibling;
                     
                     if(lc) wc += lc.offsetLeft+lc.offsetWidth;
                     }
                  }
               if(wc) {
                  if(!HS || !HSS[i]){
                     var dw = WN[i] - wc - sb[i];
                     if(dw>0) {
                        this.WidthMain[i].style.width = wc + sb[i] + "px";
                        spw -= dw;
                        if(i==0) this.TmpLeftWidth -= dw; else if(i==2) this.TmpRightWidth -= dw; else this.TmpMidWidth -= dw;
                        }
                     }
                  else {
                     var dw = WO[i] - wc;
                     if(dw>0) WO[i] -= dw; 
                     }
                  }
               }
            }
         }
      }
   
   if(this.ScrollHorzParent[i]){
      var H = this.ScrollHorz[i];
      if(!HS) { this.ScrollHorzZoom[i] = 0; if(this.CustomHScroll) H.ScrollLeft = 0; else H.scrollLeft = 0; }
      else {
         var schw = WN[i], sbw = bor[i];
         if(whs) { schw += WN[0] + WN[2]; sbw = I.ScrollHWideAllWidth; }
         if(schw<sbw) schw = sbw;
         var wb = WN[i] - sb[i] + icr; 
         if(this.CustomHScroll){
            MS.CustomScroll;
            if(!whs && WN[i] - sb[i] < [5,20,40,5][this.CustomHScroll]) HSS[i] = 0;
            H.parentNode.parentNode.parentNode.className = HSS[i] ? I.Style+"CustScroll"+this.CustomHScroll+"Right" : I.Style+"CustScroll"+this.CustomHScroll+"RightHidden";
            H.parentNode.parentNode.style.display = HSS[i] ? "" : "none";
            if(HSS[i]){
               
               schw -= (H.parentNode.offsetWidth ? H.parentNode.parentNode.parentNode.offsetWidth - H.parentNode.offsetWidth : this.CustomHScroll==2?64:this.CustomHScroll==1?32:H.parentNode.parentNode.parentNode.offsetWidth) + sbw;
               if(schw<=0) { H.parentNode.parentNode.style.display = "none"; schw = 10; }
               H.style.width = schw + "px";
               var mww = this.CustomHScroll==2 ? 32:16;
               var ww = Math.round(wb/WO[i]*schw); if(ww<mww) ww = mww;
               var pad = schw - ww; if(pad<0) { pad = 0; ww = schw; }
               H.firstChild.style.width = (BIE ? ww+pad*2 : ww) + "px";
               H.firstChild.style.paddingLeft = pad+"px";
               H.firstChild.style.paddingRight = pad+"px";
               this.ScrollHorzZoom[i] = pad/(WO[i]-wb);
               var scl = this.GetScrollLeft(i);
               if(!scl) { 
                  H.scrollLeft = H.scrollWidth - H.offsetWidth;
                  
                  }
               else { H.ScrollLeft = null; this.SetScrollLeft(scl,i,1); }
               }
            else { H.ScrollLeft = 0; this.ScrollHorzZoom[i] = 0; }
            ME.CustomScroll;
            }
         else {
            H.style.width = (schw - sbw) + "px";
            var hcls = HSS[i] ? "" : I.Style+"HScrollHidden";
            if(H.className!=hcls) H.className = hcls; 
            this.ScrollHorzParent[i].firstChild.style.width = (schw - (BIE?(whs?I.ScrollHWideMWidth:borm[i]):sbw)) + "px";
            this.ScrollHorzZoom[i] =  HSS[i] ? (schw - sbw) / wb : 0; 
            if(this.ScrollHorzZoom[i]) H.firstChild.style.width = Math.floor(WO[i] * this.ScrollHorzZoom[i])+"px";
            }
         }
      }
   }
if(this.AutoColPages&&!HSS[1]&&!this.NoHScroll) { 
   this.Rendering = false; 
   this.UpdateCount = 0;
   this.AddAutoColPages(); 
   return; 
   }
var lsh = 0, rsh = 0;
if(this.LeftSplitter) {
   lsh = HSS[0]||HSS[1]||HSS[2]&&this.LeftCanResize==3||this.LeftCanResize==4;
   var cls = this.LeftSplitter[1].className;
   if(cls.indexOf("Disabled")>=0?lsh:!lsh){
      cls = this.Img.Style+(this.Rtl?"RightSplitter":"LeftSplitter")+(BTablet?" "+this.Img.Style+(this.Rtl?"RightSplitter":"LeftSplitter")+"Touch":"") + (lsh?"":" "+this.Img.Style+"SplitterDisabled") + " " + this.Img.Style;
      var css = ["Head","Body","Foot","Scroll"];
      for(var i=0;i<4;i++) if(this.LeftSplitter[i]) this.LeftSplitter[i].className = cls + css[i]+"Splitter";
      }
   }
if(this.RightSplitter) {
   rsh = HSS[2]||HSS[1]||HSS[0]&&this.RightCanResize==3||this.RightCanResize==4;
   var cls = this.RightSplitter[1].className;
   if(cls.indexOf("Disabled")>=0?rsh:!rsh){
      cls = this.Img.Style+(this.Rtl?"LeftSplitter":"RightSplitter")+(BTablet?" "+this.Img.Style+(this.Rtl?"LeftSplitter":"RightSplitter")+"Touch":"") + (rsh?"":" "+this.Img.Style+"SplitterDisabled") + " " + this.Img.Style;
      var css = ["Head","Body","Foot","Scroll"];
      for(var i=0;i<4;i++) if(this.RightSplitter[i]) this.RightSplitter[i].className = cls + css[i]+"Splitter";
      }
   }
this.ScrollHorzShown = [lsh,rsh];

// --- width - spaces ---
MS.Space;
var gw = mw-rest-WN[3]-(VS?sw:0)+spw, pw = mw-rest+spw, chgrest = 0, cw5 = null;
for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.r1){ 
   var bw = r._BorderWidth; if(bw==null) bw = this.Get_BorderWidth(r);
   var ww = r.Space>0 && r.Space<=3 ? gw-bw : pw-bw, zw = ww;
   if(r.Tag || r.Space==-1 || r.Space==5) {
      ww += I.TableAllWidth; zw += I.TableAllWidth;
      MS.Scale; if(this.Scale) zw *= this.Scale; if(this.ScaleX) zw *= this.ScaleX; ME.Scale;
      if(!r.Tag) r.r1.style[this.Rtl?"marginLeft":"marginRight"] = this.Scale ? r.r1.offsetWidth*(this.Scale-1)+"px" : "";
      }
   if(sc) ww /= sc;
   r.r1.style.width = BIE?(zw+r.BorderIEWidth)+"px":zw+"px";
   if(r.RelWidth && (!BSafari||!fromwidth)) this.UpdateSpaceRelWidth(r,ww); 
   if((rest>minwidth||this.NoHScroll) && (this.ConstWidth==5||this.ConstWidth==6) && !r.Tag && r.Space!=-1 && r.Space!=5 && r.r1.offsetWidth+5<r.r1.firstChild.offsetWidth){   
      var ow = r.r1.firstChild.offsetWidth;
      if(this.ConstWidth==6) { var last = Get(r,"LastVisible"); if(last) { last = this.GetCell(r,last); if(last){ ow = last.offsetWidth+last.offsetLeft-r.r1.firstChild.offsetLeft; } } }
      MS.Scale; if(sc) ow *= sc; ME.Scale;
      var ch = ow - r.r1.offsetWidth + bw; if(ch<0) continue;
      if(chgrest<ch) { chgrest = ch; cw5 = [r.id,ow,bw]; }
      if(rest>chgrest) continue;
      }
   }
if(chgrest) { 
   if(this.NoHScroll) { 
      var ow = MT.offsetWidth, sw = M.scrollWidth;
      MS.Scale; if(this.Scale) ow *= this.Scale; ME.Scale;
      if(ow>0){ 
         if(ow<this.MinTagWidth) ow = this.MinTagWidth;
         var ww = ((ow < sw ? ow : sw) + (BIE ? I.TagBPWidth : 0));
         if(mw+spw<ww) chgrest -= ww-mw-spw;
         }
      }
   if(chgrest>0){
      
      this.ConstWidth5 = cw5;
      
      this.Rendering = false; return this.Update(fromwidth,onstart,0,(chgrest<rest||this.NoHScroll?chgrest:rest)+(addwidth?addwidth:0)); 
      }
   }
ME.Space;

// --- RelHeight ---
MS.RelHeight;
if(RH){
   
   var H = mh - (HS?sh:0) - minh - scrh - I.BodyAllHeight;
   if(BFF3&&!BFF20) H -= I.CellBorderTop; 
   if(H<0 || this.NoVScroll || this.MaxVScroll) H = 0;
   var rh = 0, HH = H; 
   for(var i=0;i<RH.length;i++) {
      var row = RH[i]; if(!row.RelHeight) continue;
      var hx = H*row.RelHeight/cntrel+rh, h = Math.floor(hx); rh = hx-h;
      HH -= h; if(HH>0 && HH<2){ h += HH; HH = 0; rh = 0; } 
      if(h<0) h = 0;
      if(row.Space){
         MS.Space;
         var r = row.r1;
         var rp = BIEA&&!BIE8Strict ? r.parentNode.parentNode : (BSafari7 ? r : r.parentNode);
         if(row.MinHeight) h += row.MinHeight*(sc?sc:1) + (rp.offsetHeight - r.offsetHeight);
         if(h==rp.offsetHeight) continue;
         var hh = h-rp.offsetHeight;
         if(row.Space==1) toph += hh;
         else if(row.Space==2||row.Space==3) both += hh;
         else spch += hh;
         if(h) {
            if(row.RelHidden) { row.RelHidden = 0; if(this.ShowSpaceClass(row,1)&&onstart!=2) { this.Rendering = false; return this.Update(fromwidth,2); }  }
            rp.style.display = "";
            r.style.overflow = "hidden";
            r.style.height = h+"px";
            var dh = rp.offsetHeight-h;
            if(dh){
               dh = h-dh; 
               if(dh<=0) {
                  r.style.paddingTop = "0px"; r.style.paddingBottom = "0px"; dh = h*2-rp.offsetHeight;
                  }
               if(dh<=0) { 
                  rp.style.display = "none"; row.RelHidden = 1; 
                  if(this.HideSpaceClass(row,1)&&onstart!=2) { this.Rendering = false; return this.Update(fromwidth,2); } 
                  if(row.Space==1) toph -= h;
                  else if(row.Space==2||row.Space==3) both -= h;
                  else spch -= h;
                  } 
               else r.style.height = dh+"px";
               }
            
            }
         else { rp.style.display = "none"; row.RelHidden = 1; if(this.HideSpaceClass(row,1)&&onstart!=2) { this.Rendering = false; return this.Update(fromwidth,2); }; }
         ME.Space;          
         }
      else {
         h += row.MinHeight ? row.MinHeight : this.RowHeight;
         if(h==row.r1.offsetHeight) continue;
         var dh = h-row.r1.offsetHeight;
         if(row.Fixed=="Head") { toph += dh; hhead += dh; } else { hfoot += dh; both += dh; }
         for(var k=this.FirstSec;k<=this.LastSec;k++){
            var r = row["r"+k]; if(!r) continue;
            if(h) {
               r.style.overflow = "hidden";
               if(this.LeftTD) r.firstChild.style.height = h+"px";
               
               r.style.height = h+"px";
               r.style.display = ""; 
               row.RelHidden = 0;
               if(r.offsetHeight > h) { row.MinHeight = r.offsetHeight; this.Rendering = false; return this.Update(fromwidth,1); }  
               }
            else { r.style.display = "none"; row.RelHidden = 1; }
            }   
         }
      }
   
   }
ME.RelHeight;

// --- height set ---
scrh = this.HiddenBody?(BIEA?1:0)-I.BodyAllHeight : this.BodySec[1].lastChild.offsetTop-this.BodySec[1].firstChild.offsetTop; 
var varh = VS ? mh-toph-both-spch-(HS?sh:0) : scrh + I.BodyAllHeight-(BIE8Strict?I.BodyPBottom-I.BodyPTop:0);                   
MS.LimitScroll; if(this.LimitHeight!=null&&mh+(this.MaxVScroll&&this.MaxVScroll>this.LimitHeight?this.MaxVScroll:this.LimitHeight)-this.TagHeight-toph-both-spch-sh-I.BodyAllHeight-icb>=this.MinBodyRows*this.RowHeight&&!this.LimitHeightAuto && this.ClearLimitScroll(2)) return true; ME.LimitScroll;
var csb = BSafari&&!BEdge||this.NoHScroll ? 0 : CScrollHeightBase, varhb = varh - I.BodyAllHeight - icb, varhi = varhb + csb + icb + (BIEStrict&&!BIE8Strict?1:0); 

if(varhb>=0) {
   if(VS && this.ShrinkStyle && this.ShrinkStyle!=3 && this.ShrinkStyleType&2 && varhb<this.MinBodyRows*this.RowHeight && this.ShrinkStyleSize(2)) return true;
   MS.LimitScroll; if(VS && this.LimitScroll&2 && varhb<this.MinBodyRows*this.RowHeight && this.DoLimitScroll(2)) return true; ME.LimitScroll;
   for(var i=this.FirstSec;i<this.SecCount;i++) { 
      this.BodyMain[i].parentNode.style.height = varhb + "px"; this.BodyMain[i].style.height = varhi + "px"; 
      if(BMozilla){
         if(this.BodyMain[i].clientHeight==varhi&&Grids.HiddenScroll!=2) this.BodyMain[i].style.height = varhb + "px"; 
         
         if(this.BodyMain[i].clientWidth==WN[i]-sb[i]+CScrollWidthBase+icr) this.BodyMain[i].style.width = WN[i]-sb[i]+icr+"px"; 
         }
      }
   
   }
if(H1) for(var i=this.FirstSec,hhb=hhead?hhead-icb:0;i<this.SecCount;i++) { this.HeadMain[i].parentNode.style.height = hhb + "px"; this.HeadMain[i].style.height = hhb+csb + "px"; }
if(F1) for(var i=this.FirstSec,hhb=hfoot?hfoot-icb:0;i<this.SecCount;i++) { this.FootMain[i].parentNode.style.height = hhb + "px"; this.FootMain[i].style.height = hhb+csb + "px"; }

if(!VS) { if(this.CustomScroll) this.ScrollVert.ScrollTop = 0; else this.ScrollVert.scrollTop = 0; } 
if(BIEA && !this.CustomScroll) this.ScrollVert.style.overflow = "hidden"; 
this.ScrollVertDisplay.style.display = VS?"":"none";
if(this.ShortVScroll&&this.ScrollVertDisplay.tagName!="TD"){
   this.ScrollVertDisplay.previousSibling.style.display = VS?"":"none";
   this.ScrollVertDisplay.nextSibling.style.display = VS?"":"none";
   if(this.ShortVScroll==2) this.ScrollVertDisplay.previousSibling.previousSibling.style.display = VS?"":"none";
   }
this.ScrollDot.style.display = VS?"":"none"; 
if(this.ExactWidth) this.WidthScroll.style.width = VS&&this.CustomScroll!=4 ? I.ScrollVAllWidth+this.ScrollWidth+(BIEA10||this.CustomScroll?0:-1)+"px" : "0px";
if(VS){
   var scvh = varh, V = this.ScrollVert;               
   if(this.ShortVScroll){
      if(this.ShortVScroll==2){
         for(var h=0,r=this.XH.firstChild;r&&(r.Kind=="Header"||!r.Visible);r=r.nextSibling) if(r.Visible) h += r.r1.offsetHeight;
         this.ScrollVertParent.firstChild.style.height = h+"px";
         this.ScrollVertParent.firstChild.nextSibling.style.height = (toph-h)+"px";
         }
      else this.ScrollVertParent.firstChild.style.height = toph+"px";
      this.ScrollVertParent.lastChild.style.height = both+icb+"px";
      scvh -= icb;
      }
   else scvh += toph+both;
   var hb = varh - I.BodyAllHeight;
   this.ScrollVertParentChild.style.height = (scvh - (BIE?I.ScrollVMHeight:I.ScrollVAllHeight)) + "px";
   if(this.CustomScroll){
      MS.CustomScroll;
      scvh -= V.parentNode.parentNode.parentNode.offsetHeight - V.parentNode.offsetHeight + I.ScrollVAllHeight;
      V.style.height = scvh + "px";
      if(this.ShowVScroll){
         V.parentNode.parentNode.parentNode.className = hb<scrh ? I.Style+"CustScroll"+this.CustomScroll+"Down" : I.Style+"CustScroll"+this.CustomScroll+"DownHidden";
         V.parentNode.parentNode.style.display = hb<scrh ? "" : "none";
         }
      var mhh = this.ScrollWidth-1; if(mhh<CScrollWidth-1) mhh = CScrollWidth-1; if(mhh>scvh-10) mhh = scvh-10;
      var hh = Math.round(hb/scrh*scvh); if(hh<mhh) { hh = mhh; }
      var pad = scvh - hh; if(pad<0) { pad = 0; hh = scvh; }
      V.firstChild.style.height = (BIE ? hh+pad*2 : hh) + "px";
      V.firstChild.style.paddingTop = pad+"px";
      V.firstChild.style.paddingBottom = pad+"px";
      V.firstChild.firstChild.firstChild.firstChild.style.height = (hh-0)+"px";
      if(hh!=V.firstChild.firstChild.offsetHeight) V.firstChild.firstChild.firstChild.firstChild.style.height = (hh*2-V.firstChild.firstChild.offsetHeight)+"px";
      this.ScrollVertZoom = pad / (scrh-hb);
      
      var sct = this.GetScrollTop();
      if(sct) { V.ScrollTop = null; this.SetScrollTop(sct,1); }
      
      else if(!this.NoUpdateCustomScroll) V.scrollTop = V.scrollHeight - V.offsetHeight;
      
      ME.CustomScroll;
      }
   else {
      V.style.height = (scvh - I.ScrollVAllHeight) + "px";    
      this.ScrollVertZoom = (scvh - I.ScrollVAllHeight) / hb; 
      
      var scrhs = Math.floor(scrh * this.ScrollVertZoom);
      if(BNN||scrhs>1000000||V.firstChild!=V.lastChild){ 
         var A = [], p = 0, max = BNN ? 9999 : 1000000;
         while(scrhs>max){ 
            A[p++] = "<div style='height:"+max+"px'>"+CNBSP+"</div>";
            scrhs -= max;
            }
         A[p++] = "<div style='height:"+scrhs+"px'>"+CNBSP+"</div>";
         V.innerHTML = A.join("");
         }
      else V.firstChild.style.height = (scrhs?scrhs:0)+"px"; 
      }
   if(BMozilla&&this.BodyMain[1].style.overflowY=="hidden") for(var i=0;i<3;i++) if(this.BodyMain[i]) this.BodyMain[i].style.overflowY = "scroll";
   }
else {
   if(BMozilla&&this.BodyMain[1].style.overflowY!="hidden") for(var i=0;i<3;i++) if(this.BodyMain[i]) this.BodyMain[i].style.overflowY = "hidden"; 
   this.ScrollVertZoom = 0;
   if(this.AutoPages&&!this.NoVScroll) {
      this.Rendering = false;
      this.UpdateCount = 0;
      this.AddAutoPages();
      return;
      }
   }

// --- height - pager ---
MS.Pager;

for(var i=0;i<P.length;i++) if(P[i].Visible){
   
   var PT = P[i].Tag, PB = P[i].Body, PS = P[i].Pages;
   
   PT.parentNode.parentNode.rowSpan = HS  + this.XS.Space[3] - this.XS.Space[0] + this.FootVisible-1; 
   
   var ph = varh + toph + both - I.PagerAllHeight + (HS?sh:0);        
   
   PT.style.height = (ph+(BIE?I.PagerBPHeight:0)) + "px";
   ph -= PT.firstChild.offsetHeight + I.PagerBodyAllHeight;
   if(BIE) ph += I.PagerBodyBPHeight;
   PB.style.height =  (ph<0 ? 0 : ph)+ "px";
   PT.parentNode.parentNode.style.width = P[i].Width + I.PagerAllWidth + "px";
   while(this.ShrinkStyleType&8 && PB.offsetHeight+1 < PB.firstChild.offsetHeight){ 
      var s = this.ShrinkStyleSize(2,P[i].StyleSize,1); if(!s) break;
      P[i].StyleSize = s;
      P[i].ItemHeight = null; P[i].CursorScroll = null;
      PB.firstChild.className = this.Img.Style+P[i].StyleSize.replace(/,/g," "+this.Img.Style);
      }
   
   if(BIE){ 
      
      var pgw = P[i].Width - I.PagerBodyAllWidth - (PB.clientHeight<PB.scrollHeight?CScrollWidth:0);
      if(pgw<15) pgw = 15;
      PB.firstChild.style.width = pgw+"px";
      }
   else if(BIEA6) PB.style.width = P[i].Width+"px";
   P[i].PagerTop = PT.parentNode.parentNode.offsetTop+PS.offsetTop+(BIEA&&!BIE8Strict?PT.offsetTop+PB.offsetTop+PB.clientTop+PB.firstChild.offsetTop+PS.firstChild.offsetTop+PT.clientTop:I.PagerItemMTop);
   P[i].PagerLeft = PT.parentNode.parentNode.offsetLeft+PS.offsetLeft+(BIEA&&!BIE8Strict?PT.offsetLeft+PB.offsetLeft+PB.firstChild.offsetLeft+PB.clientLeft+PS.firstChild.offsetLeft+PT.clientLeft:0);
   }

ME.Pager;
   
// --- Positions ---
this.HeadTop = H1.parentNode.parentNode.parentNode.parentNode.offsetTop;
this.BodyTop = B1.parentNode.parentNode.parentNode.parentNode.offsetTop;
this.FootTop = F1 ? F1.parentNode.parentNode.parentNode.parentNode.offsetTop : 0;

// --- no scroll ---
MS.NoScroll;
if(this.NoVScroll){ 
   if(BIEA&&!BIEA9) M.scrollTop = M.scrollTop; 
   var oh = MT.offsetHeight, sh = M.scrollHeight; 
   MS.Scale; if(this.Scale) oh = Math.round(oh*this.Scale); ME.Scale;
   oh += tbh;
   if(oh>0) { 
      if(oh<this.MinTagHeight) oh = this.MinTagHeight;
      var hh = ((oh < sh||!M.offsetHeight||BIEA&&!BIEA9&&!BIE ? oh : sh) + (BIE ? I.TagBPHeight : 0))+"px"; 
      if(hh!=M.style.height && (Math.abs(parseInt(hh)-parseInt(M.style.height))>this.UpdateCount-2)||!parseInt(M.style.height)){
         M.style.height = hh;
         Grids.BodyScrollHeight += M.offsetHeight - this.TagHeight;
         this.TagHeight = M.offsetHeight;
         MS.Nested; if(this.NestedGrid) { var r = this.GetMasterRow(); if(r) this.MasterGrid.UpdateRowHeight(r,1); } ME.Nested; 
         if(Grids.OnResizeMain) Grids.OnResizeMain(this);
         }
      }
   }
if(this.NoHScroll){ 
   if(BIEA&&!BIEA9) M.scrollLeft = M.scrollLeft; 
   var ow = MT.offsetWidth, sw = M.scrollWidth;
   MS.Scale; if(this.Scale) ow = Math.round(ow*this.Scale); ME.Scale;
   if(ow>0){ 
      if(ow<this.MinTagWidth) ow = this.MinTagWidth;
      var ww = ((ow < sw ? ow : sw) + (BIE ? I.TagBPWidth : 0))+"px";
      if(ww!=M.style.width && (Math.abs(parseInt(ww)-parseInt(M.style.width))>this.UpdateCount-2)||!parseInt(M.style.width)) {
         
         M.style.width = ww;
         if(Grids.OnResizeMain) Grids.OnResizeMain(this);
         Grids.BodyScrollWidth += M.offsetWidth - this.TagWidth;
         this.TagWidth = M.offsetWidth;
         if(BIPAD) { var T = this; setTimeout(function(){ T.Update(fromwidth); },10); }
         else { this.Rendering = false; return this.Update(fromwidth,onstart); } 
         }
      }
   }
ME.NoScroll;   

// --- Round corners ---
MS.Corners;
var T = this;
function GetCorners(cls){ return GetElem(T.GetItemId("Corner",null,null,cls)); }
function SetCorners(cls,table,topw){
   var M = GetCorners(cls); if(!M) return;
   M.style.visibility = "";
   var W = table.offsetWidth;
   for(var i=0,r=M.firstChild;i<10;i++){ 
      if(r && topw[i]!=null) { r.style.width = (W-topw[i])+"px"; r=r.nextSibling; }
      }
   }
if(I.Top) SetCorners("Top",MT,I.Top);
if(I.Bottom) SetCorners("Bottom",MT,I.Bottom);
ME.Corners;

// --- End ---
this.TableWidth = this.Scale!=1&&BIEA&&!BIEA11 ? MT.scrollWidth : MT.offsetWidth; 
this.TableHeight = MT.offsetHeight;

MS.Corners;
if(I.Top) this.TableHeight += GetCorners("Top").offsetHeight;
if(I.Bottom) this.TableHeight += GetCorners("Bottom").offsetHeight;
ME.Corners;

MS._Debug; if(0){ ME._Debug; var cc = this['Co'+"de"]; if(cc && cc.search(/GR|S[SD]|T[RSDJ]/)==1 && this.Gantt) return false; MS._Debug; } ME._Debug; 

this.Rendering = false;

// --- MaxVScroll ---
MS.NoScroll;
if(this.MaxVScroll){
   var MTH = MT.offsetHeight; MS.Scale; if(this.Scale) MTH *= this.Scale; ME.Scale;
   MTH += I.TopHeight + I.BottomHeight + I.TagBPHeight;
   if(this.NoVScroll){
      if(MTH > this.MaxVScroll) { 
         M.style.height = this.MaxVScroll-(BIE?0:I.TagBPHeight)+"px";
         this.TagHeight = M.offsetHeight;
         this.SetNoVScroll(0);
         this.UpdateMediaTag();
         if(Grids.OnResizeMain) Grids.OnResizeMain(this);
         if(this.NestedGrid) this.MasterGrid.UpdateRowHeight(this.XB.firstChild.MasterRow,1);
         return this.Update(0,1); 
         }
      }
   else if(MTH < this.MaxVScroll-this.UpdateCount+1 && VS || this.MaxVScroll<this.TagHeight-this.UpdateCount+1){ 
      M.style.height = this.MaxVScroll-(BIE?0:I.TagBPHeight)+"px";
      this.TagHeight = M.offsetHeight;
      if(Grids.OnResizeMain) Grids.OnResizeMain(this);
      if(this.NestedGrid) this.MasterGrid.UpdateRowHeight(this.XB.firstChild.MasterRow,1);
      return this.Update(0,1);
      }   
   else if(MTH < this.MaxVScroll-this.UpdateCount+1 || MTH > this.TagHeight+this.UpdateCount+1){ 
      this.SetNoVScroll(1);
      this.UpdateMediaTag();
      if(this.NestedGrid) this.MasterGrid.UpdateRowHeight(this.XB.firstChild.MasterRow,1);
      return this.Update(0,1);
      }   
   
   }
if(this.MaxHScroll){
   var MTW = MT.offsetWidth; MS.Scale; if(this.Scale) MTW *= this.Scale; ME.Scale;
   MTW += I.TagBPWidth;
   if(this.NoHScroll){
      if(MTW > this.MaxHScroll) { 
         M.style.width = this.MaxHScroll-(BIE?0:I.TagBPWidth)+"px";
         this.TagWidth = M.offsetWidth;
         this.SetNoHScroll(0); 
         this.UpdateMediaTag();
         if(Grids.OnResizeMain) Grids.OnResizeMain(this);
         return this.Update(0,1); 
         }
      }
   else if(MTW < this.MaxHScroll-this.UpdateCount+1 && HS || this.MaxHScroll<this.TagWidth-this.UpdateCount+1){ 
      M.style.width = this.MaxHScroll-(BIE?0:I.TagBPWidth)+"px";
      this.TagWidth = M.offsetWidth;
      if(Grids.OnResizeMain) Grids.OnResizeMain(this);
      return this.Update(0,1);
      }   
   else if(MTW < this.MaxHScroll-this.UpdateCount+1){ 
      this.SetNoHScroll(1);
      this.UpdateMediaTag();
      return this.Update(0,1);
      }   
   }
ME.NoScroll;

if((this.ShrinkStyle && this.ShrinkStyle!=3 && this.ShrinkStyleType&4 || this.LimitScroll&4&&this.RelWidth) && !this.NoHScroll) for(var r=this.XS.firstChild;r;r=r.nextSibling) if(!r.Tag){
   var ow = r.r1.firstChild.offsetWidth;
   var last = Get(r,"LastVisible"); if(last) { last = this.GetCell(r,last); if(last) { ow = last.offsetWidth+last.offsetLeft-r.r1.firstChild.offsetLeft;  } }
   MS.Scale; if(this.Scale<1) ow = Math.floor(ow*this.Scale); if(this.ScaleX<1) ow = Math.floor(ow*this.ScaleX); ME.Scale;
   if(r.r1.offsetWidth>=ow) continue;
   if(this.ShrinkStyle && this.ShrinkStyle!=3 && this.ShrinkStyleType&4 && this.ShrinkStyleSize(1)) return true; 
   MS.LimitScroll; if(this.LimitScroll&4&&this.RelWidth && this.DoLimitScroll(1)) return true; ME.LimitScroll;
   }

MS.FFOnly; MX.FFOnly;
if(BIEA && !this.CustomScroll) this.ScrollVert.style.overflowY = this.ShowVScroll?"scroll":"auto";  
ME.FFOnly;

MS.MaxHeight; if(!this.NestedGrid) UpdateAreas(); if(MT!=this.MainTable) return; ME.MaxHeight; 



this.UpdatePos(1); 
if(this.HiddenMainTag){
   this.HiddenMainTag = null;
   MS.Sync;
   if(this.Sync["horz"]||this.Sync["horz0"]||this.Sync["horz1"]||this.Sync["horz2"]){
      if(!this.LastHPos) this.LastHPos = [];
      for(var i=0;i<Grids.length;i++){
         var G = Grids[i];
         if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId && G.HeadMain && !G.HiddenMainTag) {
            for(var j=0;j<3;j++) {
               if((this.Sync["horz"]||this.Sync["horz"+j])&&(G.Sync["horz"]||G.Sync["horz"+j])) {
                  var ds = (G.GetBodyScrollWidth(j)-G.GetBodyWidth(j))/(this.GetBodyScrollWidth(j)-this.GetBodyWidth(j));
                  if(ds) this.LastHPos[j] = Math.round(G.GetScrollLeft(j)/ds);
                  }
               }
            }
         }
      }
   if(this.Sync["vert"]){
      for(var i=0;i<Grids.length;i++){
         var G = Grids[i];
         if(G&&G!=this&&!G.Loading&&G.SyncId==this.SyncId && G.HeadMain && !G.HiddenMainTag && G.Sync["vert"]) {
            var ds = (G.GetBodyScrollHeight()-G.GetBodyHeight())/(this.GetBodyScrollHeight()-this.GetBodyHeight());
            if(ds) { this.LastVPos = Math.round(G.GetScrollTop()/ds); break; }
            }
         }
      }
   ME.Sync;
   if(this.LastHPos){
      for(var i=0;i<3;i++) {
         var hp = this.GetScrollLeft(i);
         if(!hp&&this.LastHPos[i]) this.SetScrollLeft(this.LastHPos[i],i,1);
         }
      }
   if(!this.NoVScroll&&this.LastVPos&&!this.GetScrollTop()) this.SetScrollTop(this.LastVPos,1);
   }
this.Scrolled(1,1,onstart);
if(this.NoVScroll) { 
   this.BodyScrollTop = ElemToAbsolute(this.BodyMain[1])[1] - (this.ScrollParent ? ElemToAbsolute(this.ScrollParent)[1]-this.ScrollParent.scrollTop : 0); 
   MS.Scale; if(this.Scale) this.BodyScrollTop = Math.round(this.BodyScrollTop/this.Scale); if(this.ScaleY) this.BodyScrollTop = Math.round(this.BodyScrollTop/this.ScaleY); ME.Scale;
   }
if(this.NoHScroll) {
   this.BodyScrollLeft = ElemToAbsolute(this.BodyMain[this.FirstSec])[0] - (this.ScrollParent ? ElemToAbsolute(this.ScrollParent)[0]-this.ScrollParent.scrollLeft : 0);
   
   MS.Scale; if(this.Scale) this.BodyScrollLeft = Math.round(this.BodyScrollLeft/this.Scale); if(this.ScaleX) this.BodyScrollLeft = Math.round(this.BodyScrollLeft/this.ScaleX); ME.Scale;
   
   }

if(!onstart){
   MS.Paging; this.ShowPages(); ME.Paging;
   MS.ColPaging; if(this.ColPaging) this.ShowColPages(); ME.ColPaging;
   
   }
if(this.ParentDialog) {
   this.ParentDialog.SWidth = this.MainTag.offsetWidth;
   this.ParentDialog.UpdateHeight();
   }

MS.Resize;
if(this.ResizeIcon) {
   var dx = M.offsetWidth - I.TagBPWidth - MT.offsetWidth*(this.Scale?this.Scale:1) - MT.offsetLeft; 
   if(BIEStrict||!BIE8Strict) dx += I.TableBLeft; 
   if(!BIE&&(!BIEStrict||BIE8Strict)) dx += M.offsetLeft + I.TagBPLeft;
   
   this.ResizeIcon.style[this.Rtl?"marginLeft":"marginRight"] = (dx>=0?dx:0)+"px";
   
   }
ME.Resize;  
if(BStrict){ 
   var h = MT.offsetHeight*(this.Scale?this.Scale:1)+I.TopHeight+I.BottomHeight+(BIE8Strict&&this.TabStop?20:0); 
   if(MT.parentNode.offsetHeight!=h) MT.parentNode.style.height = h+"px"; 
   }
MS.Scale;
if(this.Scale&&MT.offsetLeft<=M.offsetLeft+M.clientLeft+10) MT.style[this.Rtl?"marginLeft":"marginRight"] = (MT.offsetWidth*(this.Scale-1)-(this.Scale>1 ? 0 : MT.offsetLeft-M.offsetLeft))+"px"; 
else if(this.Rtl) { if(MT.style.marginLeft) MT.style.marginLeft = ""; }
else if(MT.style.marginRight) MT.style.marginRight = "";
if(this.Scale) {
   var id = this.GetItemId("Scale"), N = MT.nextSibling;
   if(!N||N.id!=id){
      var D = document.createElement("div"); D.id = id;
      if(!N) MT.parentNode.appendChild(D); else MT.parentNode.insertBefore(D,N);
      }
   
   MT.nextSibling.style.marginTop = ((MT.offsetHeight+(I.Top?GetCorners("Top").offsetHeight:0))*(this.Scale-1)-(this.ResizeIcon&&this.Scale<1&&!I.Bottom?this.ResizeIcon.offsetHeight:0))+"px"; 
   
   }
else if(MT.nextSibling&&MT.nextSibling.style.marginTop) MT.nextSibling.style.marginTop = "";
ME.Scale;

if(this.TagWidth!=M.offsetWidth && (this.ZoomBorder==1&&this.Scale==1||Math.abs(this.TagWidth-M.offsetWidth)>2)) { 
   if(this.NoHScroll||this.NoScroll) this.TagWidth = M.offsetWidth; 
   else { this.GetMainTagSize(null,this.UpdateCount>3); return this.Update(); }
   }
if(this.TagHeight!=M.offsetHeight && (this.ZoomBorder==1&&this.Scale==1||Math.abs(this.TagWidth-M.offsetWidth)>2)){
   if(this.NoVScroll||this.NoScroll) this.TagHeight = M.offsetHeight;
   else { this.GetMainTagSize(null,this.UpdateCount>3); return this.Update(); }
   }
if(BIE8Strict && !BIEA9 && this.ExactSize && M.firstChild.style.width) { M.firstChild.style.width = ""; M.firstChild.style.overflow = ""; } 

var hid = 0;

if(Try) { 
   if(M.firstChild.style.visibility=="hidden"){ 
      
      M.firstChild.style.visibility = "";
      this.HideMessage(2);
      if(!onstart){
         MS.Paging; this.ShowPages(); ME.Paging;
         MS.ColPaging; if(this.ColPaging) this.ShowColPages(); ME.ColPaging;
         }
      
      hid = 1;
      }  
   } 
else if(Catch) { }
if(Grids.Stat && Grids.StatTime<new Date()-0) { Grids.Stat++; Grids.StatTime = new Date()-0+3000; }
if(BSafari&&this.FocusCursors) for(var A=this.FocusCursors.firstChild;A;A=A.nextSibling) A.firstChild.HoverMain = null;
if(BSafari&&this.HoverCursors) for(var A=this.HoverCursors.firstChild;A;A=A.nextSibling) A.firstChild.HoverMain = null;
if(this.AutoPages&&this.NoVScroll&&(this.ScrollParent?this.ScrollParent.clientHeight>=this.ScrollParent.scrollHeight:GetWindowSize()[1]>=document.body.scrollHeight)) this.AddAutoPages();
if(this.AutoColPages&&this.NoHScroll&&(this.ScrollParent?this.ScrollParent.clientWidth>=this.ScrollParent.scrollWidth:GetWindowSize()[0]>=document.body.scrollWidth)&&(!this.Rtl||IsBodyRtl())) this.AddAutoColPages();
this.UpdateCursors(1);
this.UpdateARow(hid);
if(this.Disabled) { MS.Message; if(this.Message) this.Message.UpdatePos(); ME.Message; }
else if(this.Dialog && this.Dialog.AbsPos){
   var M = this.Dialog, cell = this.GetCell(M.Row,M.Col); 
   if(cell){
      var A = cell.getBoundingClientRect(), B = GetWindowScroll(), x = A.left+B[0], y = A.top+B[1];
      if(M.AbsPos[0]!=x||M.AbsPos[1]!=y){
         var P = [M.HeaderTag,M.ShadowHeaderTag];
         for(var i=0;i<P.length;i++) if(P[i]){
            P[i].style.left = parseFloat(P[i].style.left)+x-M.AbsPos[0]+"px";
            P[i].style.top = parseFloat(P[i].style.top)+y-M.AbsPos[1]+"px";
            }
         M.X += x-M.AbsPos[0]; M.Y += y-M.AbsPos[1];
         M.UpdatePos();
         M.AbsPos = [x,y];
         }
      }
   }
if(Grids.OnUpdate) Grids.OnUpdate(this);
this.UpdateCount = 0;
MS.Print; if(this.ShowPrintPageBreaks>0&&!this.CallUpdatePrintPageBreaks) this.CallUpdatePrintPageBreaks = 1; ME.Print; 
return true;
}
TGP.SetScrollBars = TGP.Update; 
// ---------------------------------------------------------------------------------------------------------------------------

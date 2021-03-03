// -----------------------------------------------------------------------------------------------------------
TGP.ShrinkStyleSize = function(dir,size,ret){
if(this.ShrinkStyleTime&&this.ShrinkStyleTime<new Date()-0) this.ShrinkStyleTime = null;
if(!ret && this.ShrinkStyle==2 && !this.ShrinkStyleTime){
   var T = this; 
   function func(b){
      if(b==2||b==-2) T.ShrinkStyleTime = new Date()-0+1000; 
      else T.ShrinkStyle = b==1||b==-1 ? 1 : 0; 
      if(!T["ShrinkStyleLap"]) T.SaveCfg();
      T.Rendering = false;
      T.Update();
      }
   this.ShowMessageTime(this.GetText("ShrinkSize"),0,func,["Always","Once","Never"]);
   return true;
   }
MS.Scale; if(!ret && this.Scale>1 && this.ShrinkStyleType&16 && this.ShrinkScale(1)) return true; ME.Scale;

var p = null, S = ParseObject(this.Sizes), s = size?size:this.Size;
if(S && s) {
   if(dir){
      var N = dir&1 && (this.ShrinkStyleWidth||(!dir&2)) ? this.ShrinkStyleWidth : this.ShrinkStyleHeight;
      if(N!=null){ N = N.split(","); for(var i=0,A={};i<N.length;i++) A[N[i]] = 1; }
      }
   for(var n in S){
      if(S[n]==s) break;
      if(!A||A[n]) p = n;
      }
   if(p && p!=n) { 
      if(ret) return S[p];
      this.Rendering = false;
      this.SetSize(S[p],0,!(this.ShrinkStyleType&32),this.GetText("ShrinkStyle"));
      return true;
      }
   }
MS.Scale; if(!ret && this.ShrinkStyleType&16 && this.ShrinkScale(0)) return true; ME.Scale;
return false;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ShrinkScale = function(max){
MS.Scale;
var N = this.ShrinkStyleScale;
if(N!=null){ N = N.split(","); for(var i=0,A={};i<N.length;i++) A[N[i]] = 1; }
var S = ParseObject(this.Scales), p = null, s = this.Scale; if(!s) s = 1;
for(var n in S){
   if(S[n]==s) break;
   if(!A||A[n]) p = n;
   }
if(p && p!=n && (!max||(S[p]?S[p]:1)>=max)) { 
   this.Rendering = false;
   this.SetScale(S[p]-0,0,!(this.ShrinkStyleType&32)); 
   return true;
   }
return false;
ME.Scale;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetTransform = function(tag,scale){
MS.Scale;
if(BIEA&&!BIEA10){
   tag.style.msTransformOrigin = scale ? (this.Rtl?"100% 0":"0 0") : "";
   tag.style.msTransform = scale ? "scale("+scale+")" : "";
   }
else {
   tag.style.transformOrigin = scale ? (this.Rtl?"100% 0":"0 0") : "";
   tag.style.transform = scale ? "scale("+scale+")" : "";
   }
ME.Scale;
}
// -----------------------------------------------------------------------------------------------------------
MS.Sync;
TGP.GetSyncStyle = function(){
var M = [];
if(this.Sync && this.Sync["style"] || this.SyncStyle ) { 
   for(var i=0;i<Grids.length;i++){
      var G = Grids[i];
      if(G && G!=this  && (G.SyncId==this.SyncId && G.Sync && G.Sync["style"] || G.SyncStyle==this.SyncStyle&&this.SyncStyle) && (!G.NestedGrid||G.MasterGrid!=this) && (!this.NestedGrid||this.MasterGrid!=G)) M[M.length] = G;
      }
   }
return M;
}
ME.Sync;
// -----------------------------------------------------------------------------------------------------------
TGP.SetScale = function(scale,norender,nosave,nomedia){
MS.Scale;
if(BIEA&&!BIEA9) { this.Scale = ""; return; }

var S = ParseObject(this.Scales);
if(S[scale]) scale = S[scale];
else if(scale-0) scale -= 0;
else scale = "";
if(scale==1) scale = "";
if(!nosave) this.LastScale = scale;
if(this.Scale==scale) return;
this.Scale = scale;
this.NoClearLimitScroll = null;
MS.Media; if(!nomedia) this.UpdateMedia("Cfg","Scale",scale); ME.Media;
if(!nosave && !this["ScaleLap"]) this.SaveCfg();
if(norender==1 || !this.MainTable) return;
MS.Sync; if(!nomedia) for(var i=0,M=this.GetSyncStyle();i<M.length;i++) M[i].SetScale(scale,0,nosave); ME.Sync;
if(norender||this.Loading||this.Rendering) return;
this.SetTransform(this.MainTable,scale);
if(this.Img.Top) this.SetTransform(this.MainTable.previousSibling,scale);
if(this.Img.Bottom) this.SetTransform(this.MainTable.nextSibling.id.indexOf("TGScale")>=0?this.MainTable.nextSibling.nextSibling:this.MainTable.nextSibling,scale);
this.UpdateSpaceScale();
this.CalculateSpaces(1);

this.UpdateCursors(1);
this.UpdateHeights(1,1);
this.Update();
this.Update(); 
ME.Scale;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetSize = function(size,norender,nosave,mess,nomedia){

if(!size) { size = this.Size; this.Size = null; }
var S = ParseObject(this.Sizes);
if(S[size]) size = S[size];
if(!nosave) this.LastSize = size;
if(this.Size==size) return;
this.Size = size;
if(!nosave && !this["SizeLap"]) this.SaveCfg();
if(norender==1) return;
this.CalculateSpaces(1);
this.MeasureHTML();
if(this.Gantt) this.MeasureGanttHTML();
MS.Media; if(!nomedia) this.UpdateMedia("Cfg","Size",size); ME.Media;
if(norender==2) return;
MS.Sync; if(!nomedia) for(var i=0,M=this.GetSyncStyle();i<M.length;i++) M[i].SetSize(size,0,nosave,mess); ME.Sync;
if(norender||this.Loading||this.Rendering) return;
if(mess==null) mess = this.GetText("SetSize");
if(this.Gantt){
   var col = this.GetFirstGantt(), F = this.GetFixedRows();
   for(var i=0;i<F.length;i++) if(F[i].r1) {
      var cell = this.GetCell(F[i],col);
      if(cell && cell.firstChild && cell.firstChild.className && cell.firstChild.className.indexOf("GanttHeader")>=0) cell.firstChild.style.display = "none";
      }
   }
if(!this.NoCalc) this.NoCalc = 2; 
if(!mess || this.SuppressMessage>1) this.AfterSetStyle(0);
else { this.ShowMessage(mess); var T = this; setTimeout(function(){ T.AfterSetStyle(0); },10); }
return true;

}
// -----------------------------------------------------------------------------------------------------------
TGP.SetContrast = function(contrast,norender,nosave,mess,nomedia){

if(!contrast) { contrast = this.Contrast; this.Contrast = null; }
var S = ParseObject(this.Contrasts);
if(S[contrast]) contrast = S[contrast];
if(!nosave) this.LastContrast = contrast;
if(this.Contrast==contrast) return;
this.Contrast = contrast;
if(!nosave && !this["ContrastLap"]) this.SaveCfg();
if(norender==1) return;
this.CalculateSpaces(1);
this.MeasureHTML();
if(this.Gantt) this.MeasureGanttHTML();
MS.Media; if(!nomedia) this.UpdateMedia("Cfg","Contrast",contrast); ME.Media;
if(norender==2) return;
MS.Sync; if(!nomedia) for(var i=0,M=this.GetSyncStyle();i<M.length;i++) M[i].SetContrast(contrast,0,nosave,mess); ME.Sync;
if(norender||this.Loading||this.Rendering) return;
if(mess==null) mess = this.GetText("SetContrast");
if(!this.NoCalc) this.NoCalc = 2; 
if(!mess || this.SuppressMessage>1) this.AfterSetStyle(0);
else { this.ShowMessage(mess); var T = this; setTimeout(function(){ T.AfterSetStyle(0); },10); }

}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateSpaceScale = function(){
MS.Scale;

for(var r=this.XS.firstChild;r;r=r.nextSibling) if(r.Tag||r.Space==-1||r.Space==5) {
   r.r1.firstChild.style.transformOrigin = this.Scale ? (this.Rtl?"100% 0":"0 0") : "";
   r.r1.firstChild.style.transform = this.Scale ? "scale("+this.Scale+")" : "";
   }
if(this.ResizeIcon){
   var r = GetElem(this.GetItemId("Resize")); 
   this.ResizeIcon.style.transformOrigin = this.Scale ? "right bottom" : "";
   this.ResizeIcon.style.transform = this.Scale ? "scale("+this.Scale+")" : "";
   }
ME.Scale;
}
// -----------------------------------------------------------------------------------------------------------
TGP.MultiplyScale = function(dw,type){
if(dw==1 || this.SizeScaled) return;
if(type&1){
   for(var c in this.Cols){
      var C = this.Cols[c];
      if(C.Width>0&&!C.RelWidth&&C.Type!="Gantt") C.Width = Math.round(C.Width*dw);
      if(C.GroupWidth>1) C.GroupWidth = Math.round(C.GroupWidth*dw);
      if(C.OldWidth>0) C.OldWidth = Math.round(C.OldWidth*dw);
      }
   if(this.RowIndexWidth) this.RowIndexWidth = Math.round(this.RowIndexWidth*dw);
   }
if(type&2){
   for(var i=0;i<this.Pagers.length;i++){
      var C = this.Pagers[i];
      if(C.Width>0) C.Width = Math.round(C.Width*dw);
      }
   if(!this.Pagers.length && this.Pager && this.Pager.Width>0) this.Pager.Width = Math.round(this.Pager.Width*dw);
   }
if(type&3) this.UpdateSecCount();
if(type&4){
   for(var r=this.XS.firstChild;r;r=r.nextSibling){
      var C = r.Cells;
      if(C) for(var i=0;i<C.length;i++){
         var c = C[i];
         if(r[c+"Width"]>0) r[c+"Width"] = Math.round(r[c+"Width"]*dw);
         }
      }
   }

MS.Media;
var M = this.Media[0];
if((type&9)==9&&M&&!M.Attrs&&!M.Media&&M.Cols){
   for(var c in M.Cols){
      var MC = M.Cols[c], C = this.Cols[c];
      if(MC.Width>0&&!C.RelWidth&&C.Type!="Gantt") MC.Width = Math.round(MC.Width*dw);
      }      
   }
if((type&10)==10&&M&&!M.Attrs&&!M.Media&&M.Pagers){
   for(var c in M.Pagers){
      var MC = M.Pagers[c]; if(MC.Width>0) MC.Width = Math.round(MC.Width*dw);
      }      
   }
if((type&12)==12&&M&&!M.Attrs&&!M.Media&&M.Rows&&this.XS.firstChild){
   for(var c in M.Rows){
      var mr = M.Rows[c], r = this.GetRowById(c); if(!r) continue;
      var C = r.Cells; if(!C) continue;
      for(var i=0;i<C.length;i++) if(mr[C[i]+"Width"]>0) mr[C[i]+"Width"] = Math.round(mr[C[i]+"Width"]*dw);
      }      
   }
ME.Media;

if(type&16){
   var col = this.GetFirstGantt(), C = this.Cols[col], zoom = this.GetZoomList(col); 
   if(zoom) for(var i=0;i<zoom.length;i++) if(zoom[i] && zoom[i].GanttWidth) { 
      
      zoom[i].GanttWidth *= dw; 
      if(zoom[i].GanttWidthEx) zoom[i].GanttWidthEx *= dw; 
      }
   if(!C.GanttSizeFit||!C.GanttSize) C.GanttWidth *= dw;
   if(C.GanttWidthCookie) C.GanttWidthCookie = C.GanttWidthCookie *= dw;
   }
}

// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------

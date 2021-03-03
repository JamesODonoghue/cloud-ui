var AreaObjects = [], TGAreaObjects = AreaObjects; if(window["AreaObjects"]==null) window["AreaObjects"] = AreaObjects; 
AreaObjects.Calls = 0;
// -----------------------------------------------------------------------------------------------------------
MS.MaxHeight;
// -----------------------------------------------------------------------------------------------------------
AreaObjects.PreciseBodyHeight = 1; 
var OffsetParents = [];
// -----------------------------------------------------------------------------------------------------------
var TArea = {

   _nope:0 };
// -----------------------------------------------------------------------------------------------------------
function SetArea(M,tag,height){
M = FromJSON(M);
if(!M ) return;
if(M.offsetLeft!=null) M = {Tag:M};
if(typeof(M.Tag)!="object") M.Tag = GetElem(M.Tag);
if(tag) M.Tag = tag;
if(!M.Tag) return;
DelArea(M.Tag,1);
for(var i in TArea) if(M[i]==null) M[i] = TArea[i];
if(height) M.Height = height;
if(M.Height) { M.Height = parseInt(M.Height); if(!M.Height) M.Height = 1; }
else M.Height = 0;
var P = OffsetParents, S = AreaObjects; M.Abs = null;
if(typeof(M.Parent)=="string") M.Parent = GetElem(M.Parent);   
if(!M.Parent){
   for(var p=M.Tag.parentNode;p;p=p.parentNode){
      var n = p.tagName; if(!n) continue;
      n = n.toLowerCase();
      if(n=="body") break;
      var s = GetStyle(p); if(!s) continue;
      
      if(s.overflow!="" && s.overflow.toLowerCase()!="visible" && parseInt(s.height) || s.display.toLowerCase()=='none' || s.position.toLowerCase()=='absolute'){
         M.Parent = p; 
         break;
         }
      if(s.position.toLowerCase()=="absolute"){ M.Parent = p; M.Abs = 1; break; }
      }
   if(!M.Parent) M.Parent = document.body;
   }
if(document.body.offsetWidth<10) { 
   var T = setTimeout(function(){ SetArea(M,tag,height); },1000);
   return;
   }
for(var j=0;j<P.length;j++) {
   if(P[j].Tag==M.Parent) { M.Parent = P[j]; break; }
   if(P[j]==M.Parent) break;
   }
if(j==P.length) {  
   P[P.length] = { Tag:M.Parent }; M.Parent = P[j]; 
   
   } 
if(!M.Abs){
    var s = GetStyle(M.Tag);
    if(s && s.position.toLowerCase()=="absolute") M.Abs = 2;
    }
if(M.Height) { 
   for(var id in S) if(S[id]&&S[id].Parent==M.Parent&&S[id].ParentOverflowY!=null){ M.ParentOverflowY = S[id].ParentOverflowY; break; } 
   if(M.ParentOverflowY==null) M.ParentOverflowY = M.Parent.Tag.style.overflowY; 
   M.Parent.Tag.style.overflowY = "hidden"; 
   }
M.Parent.oldh = null;   
M.AWidth = M.Tag.offsetWidth;
M.AHeight = M.Tag.offsetHeight;
M.OrigWidth = M.Tag.style.width;
var s = GetStyle(M.Tag);
M.TagBorderWidth = GetBorderWidth(s);
M.TagBorderHeight = GetBorderHeight(s);
for(var i=0;i<S.length;i++) if(S[i] && S[i].Tag==M.Tag) return; 
for(M.id=0;S[M.id];M.id++);
S[M.id] = M;
M.This = "TGAreaObjects["+M.id+"]";
if(S.Interval==null) S.Interval = setInterval(UpdateAreas,200);
}
// -----------------------------------------------------------------------------------------------------------
function UpdateArea(tag){
var S = AreaObjects;
for(var i=0;i<S.length;i++) if(S[i] && S[i].Tag==tag) {
   var M = S[i];
   M.AWidth = M.Tag.offsetWidth;
   M.AHeight = M.Tag.offsetHeight;
   M.OrigWidth = M.Tag.style.width;
   }
}
// -----------------------------------------------------------------------------------------------------------
function DelArea(tag,noclr){
var S = AreaObjects;
for(var i=0;i<S.length;i++) if(S[i] && S[i].Tag==tag) {
   if(S[i].Height) S[i].Parent.Tag.style.overflowY = S[i].ParentOverflowY;
   S[i] = null;
   }
for(var i=S.length-1;i>=0&&!S[i];i--) S.length--;
if(S.length==0 && S.Interval && !noclr){ clearInterval(S.Interval); S.Interval = null; }
}
// -----------------------------------------------------------------------------------------------------------
function UpdateAreas(){
if(AreaObjects.Running || BTablet&&window.innerWidth<document.documentElement.offsetWidth || AreaObjects.Calls>3*AreaObjects.length) return; 
AreaObjects.Running = 1;
if(!AreaObjects.Calls) setTimeout(function(){ AreaObjects.Calls = 0; }, 10); 
AreaObjects.Calls++;
if(BIEStrict) GetIEZoom();
var P = OffsetParents, S = AreaObjects, bod = document.body;

for(var j=0;j<P.length;j++){
   if(P[j].Tag.offsetWidth==P[j].Width) continue;
   P[j].Width = P[j].Tag.offsetWidth;
   for(var i=0;i<S.length;i++){
      var G = S[i]; 
      if(!G || G.Parent!=P[i] || (!G.MinWidth && !G.MaxWidth)) continue;
      G.Tag.style.width = G.OrigWidth;
      var w = G.Tag.offsetWidth;
      if(!BIE) w -= G.TagBorderWidth; 
      if(w<G.MinWidth || w>G.MaxWidth){
         w = w<G.MinWidth ? G.MinWidth : G.MaxWidth;
         G.OrigWidth = G.Tag.style.width;
         G.Tag.style.width = w+"px";
         }
      }
   }   
   
for(var j=0;j<P.length;j++) {
   var W,D; 
   if(P[j].Tag==bod){ 
      var doc=document.documentElement;
      var W = GetWindowSize()[1]/CZoom;
      
      function Get(s,n,n2){ if(!n2) n2 = ""; var h = parseInt(s[n+"Top"+n2]) + parseInt(s[n+"Bottom"+n2]); return h?h:0; }      

      if(BIE || (BIEA9||BSafari) && !BStrict){ 
         if(!AreaObjects.PreciseBodyHeight || document.readyState!="complete") D = bod.scrollHeight;
         else {
            var f = AreaObjects.BodyFirst, l = AreaObjects.BodyLast;
            if(!f) {
               f = document.createElement("div");
               var s = f.style; s.overflow = "hidden"; s.height = "0px"; s.width = "0px"; s.clear = "both";
               f.innerHTML = "<div style='height:"+(BIE?1:0)+"px;overflow:hidden;'>"+CNBSP+"</div>";
               document.body.insertBefore(f,document.body.firstChild);
               AreaObjects.BodyFirst = f;
               if(BIE) { s.marginTop = "-21px"; s.marginBottom = "20px"; } 
               l = document.createElement("div");
               var s = l.style; s.overflow = "hidden"; s.height = "0px"; s.width = "0px"; s.clear = "both";
               l.innerHTML = "<div style='height:"+(BIE?1:0)+"px;overflow:hidden;'>"+CNBSP+"</div>";
               if(BIE) s.marginTop = "-1px";
               document.body.appendChild(l);
               AreaObjects.BodyLast = l;
               }
            if(f.previousSibling) document.body.insertBefore(f,document.body.firstChild);
            if(l.nextSibling) document.body.appendChild(l);
            
            D = l.offsetTop + f.offsetTop + (BIE?22:0);   
            var bh = AreaObjects.BodyHeight;
            if(bh==null){
               if(BSafari) bh = Get(GetStyle(doc),"margin");
               else if(BIE) bh = Get(GetStyle(bod),"border","Width");
               else bh = 0;
               AreaObjects.BodyHeight = bh;
               }
            D += bh;
            
            }         
         }
      else {
         
         D = BIEStrict||BSafari&&!BEdge ? bod.scrollHeight : doc.offsetHeight+(BOpera8?CScrollHeight:0); 
         if(AreaObjects.PreciseBodyHeight){
            var bh = AreaObjects.BodyHeight;
            if(bh==null){
               var bs = GetStyle(bod), ds = GetStyle(doc);
               if(BIEStrict||BSafari) bh = Get(bs,"margin") + Get(bs,"border","Width") + Get(ds,"border","Width") + Get(ds,"padding") + Get(ds,"margin"); 
               else bh = Get(ds,"margin");
               AreaObjects.BodyHeight = bh;
               }
            D += bh;
            if(BSafari) D++; 
            }         
         }   
      }
   else { 
      W = P[j].Tag.clientHeight; D = P[j].Tag.scrollHeight;
      if(W==D&&!BIE){
         if(!P[j].Last||!P[j].Last.parentNode){
            var d = document.createElement("div");
            d.style.visibility = "hidden"; d.style.height = "0px"; d.style.width = "0px"; d.style.overflow = "hidden"; d.style.clear = "both";
            P[j].Last = d;
            P[j].Tag.appendChild(d);
            }
         else if(P[j].Last!=P[j].Tag.lastChild) P[j].Tag.appendChild(P[j].Last);
         D = P[j].Last.offsetTop; if(P[j].Last.offsetParent!=P[j].Tag) D -= P[j].Tag.offsetTop;
         }
      
      }
   P[j].origh = 0;

   P[j].maxh = 0;
   P[j].newh = (W-D)/CZoom;

   }

for(var i=0;i<S.length;i++){ 
   var G = S[i]; if(!G || !G.Tag.offsetWidth) continue; 
   if(!G.Height){
      var h = G.Tag.offsetHeight;
      if(h<G.MinHeight || h>G.MaxHeight) {
         h = h<G.MinHeight ? G.MinHeight : G.MaxHeight;
         if(h<0) h = 0;
         G.Tag.style.height = h+"px";   
         }
      }
   else if(G.Abs){ 
      if(G.Abs==2){
         var h = Math.floor((GetWindowSize()[1] - G.Tag.offsetTop)/(G.FixedPercent?100:G.Height)*G.Height-(BIE?0:G.TagBorderHeight));
         if(G.ReservedHeight) h -= G.ReservedHeight;
         if(h<G.MinHeight || h>G.MaxHeight) h = h<G.MinHeight ? G.MinHeight : G.MaxHeight;
         if(h<0) h = 0;
         G.Tag.style.height = h+"px";   
         }
      }
   else {
      G.Parent.origh += G.Tag.offsetHeight;
      G.Parent.maxh += G.Height;
      }
   }
  
for(var i=0;i<S.length;i++){
   var G = S[i]; if(!G || !G.Tag.offsetWidth || BTablet&&G.Grid&&(G.Grid.EditMode||G.Grid.Dialog&&(G.Grid.Dialog.Modal||G.Grid.Dialog.EditMode||G.Grid.Dialog.Next&&G.Grid.Dialog.Next.EditMode)||G.Grid.Disabled)) continue; 
   var par = G.Parent;
   if(G.Height && !G.Abs && (par.newh!=par.oldh && (par.newh<0 || par.newh>8) || par.oldh==null)){ 
      G.HeightSet = 0;
      var h = Math.floor((par.newh+par.origh)/(G.FixedPercent?100:par.maxh)*G.Height-(BIE?0:G.TagBorderHeight));
      if(G.ReservedHeight) h -= G.ReservedHeight;
      if(h<G.MinHeight || h>G.MaxHeight) {
         if(h<G.MinHeight && G.Parent.Tag.style.overflowY == "hidden") G.Parent.Tag.style.overflowY = G.ParentOverflowY;
         h = h<G.MinHeight ? G.MinHeight : G.MaxHeight;
         if(!G.FixedPercent){
            function Update(G,h){
               var tag = G.Tag, par = G.Parent;
               tag.style.height = h+"px"; tag.offsetHeight;
               par.newh -= tag.offsetHeight;
               par.maxh -= G.Height;
               G.HeightSet = 1;
               for(var j=0;j<i;j++){
                  var T = S[j]; if(!T || T.Parent!=par || !T.Height || T.HeightSet) continue;
                  var t = Math.floor((par.newh+par.origh)/(T.FixedPercent?100:par.maxh)*T.Height-(BIE?0:T.TagBorderHeight));
                  if(T.ReservedHeight) t -= T.ReservedHeight;
                  if(t<T.MinHeight || t>T.MaxHeight) {
                     t = t<T.MinHeight ? T.MinHeight : T.MaxHeight;
                     if(!T.FixedPercent) Update(T,t);
                     }
                  else if(t<0) t = 0;
                  if(T.AHeight!=T.Tag.offsetHeight) T.AHeight = null; 
                  T.Tag.style.height = t+"px";
                  }
               }
            Update(G,h);   
            }
         }
      else {
         if(h<0) { h = 0; if(G.Parent.Tag.style.overflowY == "hidden") G.Parent.Tag.style.overflowY = G.ParentOverflowY; }
         else if(G.Parent.Tag.style.overflowY != "hidden") G.Parent.Tag.style.overflowY = "hidden";
         if(G.AHeight!=G.Tag.offsetHeight) G.AHeight = null; 
         G.Tag.style.height = h+"px";
         if(BIEA) { G.Tag.offsetHeight; G.Tag.style.height = h+"px"; } 
         }
      }
   }
   
for(var j=0;j<P.length;j++) P[j].oldh = P[j].newh; 

var chg = 0;
for(var i=0;i<S.length;i++){
   var G = S[i]; if(!G) continue;
   var tag = G.Tag; 
   if(G.AWidth!=tag.offsetWidth || G.AHeight!=tag.offsetHeight) {
      if(G.OnResize) G.OnResize(G.AWidth,G.AHeight);
      G.AWidth = tag.offsetWidth; 
      G.AHeight = tag.offsetHeight;
      chg = 1;
      
      }
   }
AreaObjects.Running = 0;
if(chg) UpdateAreas(); 
}
// -----------------------------------------------------------------------------------------------------------
ME.MaxHeight;


// -----------------------------------------------------------------------------------------------------------
// Functions for right side pager and page names
// -----------------------------------------------------------------------------------------------------------
MS.Pager;
// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------
TGP.GetPagerCaptionHTML = function(P){
var cap = null;

if(!cap) cap = P.Caption ? P.Caption : P.Name;
if(Grids.OnGetPagerCaption) { var tmp = Grids.OnGetPagerCaption(this,P); if(tmp!=null) cap = tmp; }
if(!cap) return "";
if(this.Trans) cap = this.Translate("Header",P.Name,cap,"");
var h = this.Header==this.Head.firstChild&&(!this.Header.nextSibling||this.Header.nextSibling.Kind!="Header") ? this.GetRowHeight(this.Header) : (this.Img.HeaderRowHeight>10?this.Img.HeaderRowHeight:this.RowHeight);
return "<div"+(this.TestIds?this.GetItemId("PagerCaption",null,P.Name,null,1):"")+" class='"+this.Img.Style+"HeaderFont "+this.Img.Style+"PagerCaption' style='height:"+h+"px'>"+cap+"</div>";
}
// -----------------------------------------------------------------------------------------------------------
// Returns innerHTML of pager
TGP.GetPagerPagesHTML = function(P,initonly){
if(!P.Visible) return "";
var A = [], p = 0, L = this.Lang.Format, ogp = Grids.OnGetPageName!=null, ogt = Grids.OnGetPageTip!=null; 
var s = "<div"+(BIE?" style='width:100%;height:"+this.Img.PagerItemHeight+"px;'":"")+(BIPAD?" onclick='return true;'":"")+" class='"+(BTablet?this.Img.Style+"PagerItemTouch ":"")+this.Img.Style+"PagerItem'" + (BIE5?" nowrap"+CXHTML:""), su = s, sn = s;
if(P.UsedPages) { su = su.replace("class='","class='"+this.Img.Style+"PagerItemUsed "); sn = sn.replace("class='","class='"+this.Img.Style+"PagerItemUnused "); }
var nopages = ">"+this.GetText("NoPages")+"</div>", cnt = 0, ids = this.TestIds;

if(P.Type=="Pages"){
   var Q = this.XB.firstChild;
   if(Q!=this.XB.lastChild || Q.State<2) for(;Q;Q=Q.nextSibling) {
      var n = Q.Name; if(ogp) { var tmp = Grids.OnGetPageName(this,P,Q,n); if(tmp!=null) n = tmp; }
      var t = Q.Title; if(ogt&&this.StandardTip) { var tmp = Grids.OnGetPageTip(this,P,Q,t); if(tmp!=null) t = tmp; }
      A[p++] = s + (ids?this.GetItemId("Pager",null,P.Name,cnt,1):"") + (t&&this.StandardTip?" title='"+L.Escape(t)+"'":"")+">"+(n?n:CNBSP)+"</div>";
      cnt++;
      }
   }
else if(P.Type=="Gantt"){
   
   }
else {
   if(Grids.OnGetPagesCount) { cnt = Grids.OnGetPagesCount(this,P); if(!cnt) cnt = 0; }
   if(cnt){
      for(var i=0;i<cnt;i++){
         var n = i; if(ogp) { n = Grids.OnGetPageName(this,P,i,n); if(n==null) n = i; }
         var t = ogt&&this.StandardTip ? Grids.OnGetPageTip(this,P,i,n) : null;
         A[p++] = s + (ids?this.GetItemId("Pager",null,P.Name,i,1):"") + (t?" title='"+this.Lang.Format.Escape(t)+"'":"")+">" + n + "</div>";
         }
      }
   }
P.Count = cnt;
P.StyleSize = null;
P.ItemHeight = null;
if(!p) A[p++] = s + nopages;
return A.join("");
}
// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------
// Sets page Name according to Name00, Name01, Name02, Name10, Name11, Name12, Name20, Name21, Name22, for Paging==3
TGP.ConvertPageNames = function(){
var cs = " class='"+this.Img.Style, ns = " "+this.Img.Style, dig = this.Lang.Format.Digits;
var sep1a = this.GetText("PagerSep1"), sep2a = this.GetText("PagerSep2"), sep3a = this.GetText("PagerSep3"), sep4a = this.GetText("PagerNone");
var sep1 = StringToXml(sep1a), sep2 = StringToXml(sep2a), sep3 = StringToXml(sep3a), sep4 = StringToXml(sep4a);
var trans = this.Trans&&this.Sort ? this.Sort.replace(/,-/g,",").replace(/^-/,"").split(",") : null;
for(var p=this.XB.firstChild,idx=1;p;p=p.nextSibling,idx++){
   var E = "", EE = "";
   for(var i=0;i<3;i++){
      var n = p["Name0"+i]; if(!n) break;
      if(trans&&trans[i]) n = this.Translate(this.Header,trans[i],n);
      if(E){ E += "<b"+cs+"PagerSep3'>"+sep3+"</b>"; EE += sep3; }
      E += "<b"+cs+"PagerSort"+(i+1)+"'>"+n+"</b>"; EE += n;
      }
   if(p["Name1"+i] || p["Name2"+i]){
      if(E){ E+="<b"+cs+"PagerSep1'>"+sep1+"</b>"; EE+=BIEA?"\n":sep1a; }
      if(!p["Name1"+i]){ E+="<span"+cs+"PagerSort"+(i+1)+ns+"PagerNone'>"+sep4+"</span>"; EE+=sep4; }
      else for(var j=i;j<3 && p["Name1"+j];j++){ 
         var n = p["Name1"+j]; 
         if(trans&&trans[j]) n = this.Translate(this.Header,trans[j],n); 
         E += (j==i ? "" : "<span"+cs+"PagerSep3'>"+sep3+"</span>") + "<span"+cs+"PagerSort"+(j+1)+"'>" + n + "</span>"; 
         EE += (j==i ? "" : sep3) + n; 
         }
      E+="<span"+cs+"PagerSep2'>"+sep2+"</span>"; EE+=BIEA?"\n":sep2;
      if(!p["Name2"+i]){ E+="<span"+cs+"PagerSort"+(i+1)+ns+"PagerNone'>"+sep4+"</span>"; EE+="..."; }
      else for(var j=i;j<3 && p["Name2"+j];j++){ 
         var n = p["Name2"+j]; 
         if(trans&&trans[j]) n = this.Translate(this.Header,trans[j],n); 
         E += (j==i ? "" : "<span"+cs+"PagerSep3'>"+sep3+"</span>") + "<span"+cs+"PagerSort"+(j+1)+"'>" + n + "</span>"; 
         EE += (j==i ? "" : sep3) + n; }
      }
   p.Name = E ? E : (p.Name ? p.Name : this.GetText("Page")+" "+idx);
   if(EE) p.Title = EE;
   MS.Digits; if(dig) { p.Name = this.Lang.Format.ConvertDigits(p.Name); if(p.Title) p.Title = this.Lang.Format.ConvertDigits(p.Title); } ME.Digits;
   if(Grids.OnSetPageName) Grids.OnSetPageName(this,p);
   }   
if(idx==2){
   p = this.XB.firstChild;
   if(p.Name == this.GetText("Page")+" "+1) p.Name = this.GetText("NoPages");
   if(Grids.OnSetPageName) Grids.OnSetPageName(this,p);
   }
}
// -----------------------------------------------------------------------------------------------------------
// Compares two values in given column
TGP.CompareValues = function(par,col,S1,S2,slice){
var n = this.GetAttr(par,col,"NumberSort"), C = this.Cols[col]; 
if(n==1 || (n==null||n==2) && CAlignRight[C.Type]) {
   if(slice!=null) return S2+""; 
   S1-=0; S2-=0; 
   return S1<S2 ? -1 : (S1>S2?1:0);
   }
var s1 = S1+"", s2 = S2+"";
MS.CharCodes;
var codes = this.GetAttr(par,col,"CharCodes");
if(codes) { s1 = UseCharCodes(s1,codes); s2 = UseCharCodes(s2,codes); }
ME.CharCodes;
var loc = this.GetAttr(par,col,"LocaleCompare");
if(this.GetAttr(par,col,"CaseSensitive")==0){
   s1 = loc?s1.toLocaleLowerCase():s1.toLowerCase();
   s2 = loc?s2.toLocaleLowerCase():s2.toLowerCase();
   }
var white = GetWhiteChars(this.GetAttr(par,col,"WhiteChars"));
if(white) { s1 = s1.replace(white,""); s2 = s2.replace(white,""); }  
if(slice!=null){
   if(loc?s1.localeCompare(s2)==0:s1==s2) return S2;
   var len = s1.length < s2.length ? s1.length : s2.length;
   for(var i=0;i<len;i++){
      if(s1.charCodeAt(i)!=s2.charCodeAt(i)) {
         if(!i) return S2.charAt(0);
         if(s2.length-i>slice) return S2.slice(0,i+1);
         return S2;
         }
      }
   return s1.length < s2.length ? S1 : S2; 
   }   
if(loc) return s1.localeCompare(s2);
return s1<s2 ? -1 : (s1>s2?1:0);
}
// -----------------------------------------------------------------------------------------------------------
// Creates page names
TGP.SetPageNames = function(){
if(!this.Paging) return; 
for(var i=0;i<this.Pagers.length;i++) if(this.Pagers[i].Type=="Pages") break;
if(i==this.Pagers.length) return; 
var P = this.Pagers[i], mpc = P["MaxColumns"], max1 = P["MaxCharsSingle"], max2 = P["MaxChars"], trans = this.Trans;

function GetString(T,row,col,noesc){
   var val = Get(row,col+"PageNameValue");
   if(val==null) val = T.GetString(row,col,noesc?2:5);
   if(Grids.OnGetPageNameValue) { var tmp = Grids.OnGetPageNameValue(T,row,col,val); if(tmp!=null) val = tmp; }
   if(trans) val = !noesc && val.indexOf("&")>=0 ? T.Escape(T.Translate(row,col,val.replace(/&lt;/g,"<").replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&amp;/g,"&"))) : T.Translate(row,col,val);
   MS.Digits; if(L.Digits) val = L.ConvertDigits(val); ME.Digits;
   return val;
   }

var S = this.GetSort(), L = this.Lang.Format;
if(this.PageLength==1){ 
   var col = this.MainCol ? this.MainCol : S ? S[0] : null;
   if(col){
      for(var p=this.XB.firstChild,idx=1;p;p=p.nextSibling,idx++){
         var r = this.GetFirstVisible(p);
         p.Name = r ? GetString(this,r,col) : idx;
         if(r) p.Title = GetString(this,r,col);
         
         if(Grids.OnSetPageName) Grids.OnSetPageName(this,p);
         }
      return;
      }
   }

if(this.XB.childNodes.length==1){ 
   this.XB.firstChild.Name = this.GetText("NoPages");
   return;
   }
   
var cnt = S ? S.length/2 : 0, C = this.Cols;
if(mpc!=null && mpc<cnt) cnt = mpc;

function SetNames(T,A,num){
   var a = num ? p.nextSibling : p.previousSibling, b = num ? p.lastChild : p.firstChild;
   if(!a){ 
      if(num){
         while(b && !b.Visible) b = b.previousSibling;
         }
      else {
         while(b && !b.Visible) b = b.nextSibling;
         }   
      if(b) A[0] = Get(b,S[0]+"Visible")==0 ? "" : GetString(T,b,S[0]);
      }
   else {
      a = num ? a.firstChild : a.lastChild;
      if(num){
         while(a && !a.Visible) a = a.nextSibling;
         while(b && !b.Visible) b = b.previousSibling;
         }
      else {
         while(a && !a.Visible) a = a.previousSibling;
         while(b && !b.Visible) b = b.nextSibling;
         }   
      if(!a || !b) return; 
      for(var i=0;i<cnt;i++){
         var c = S[i*2];
         if(T.CompareValues(T.Root,c,T.GetValue(a,c),T.GetValue(b,c))==0) A[i] = Get(b,c+"Visible")==0 ? "" : GetString(T,b,c);
         else {
            A[i] = T.CompareValues(T.Root,c,GetString(T,a,c,1),Get(b,c+"Visible")==0 ? "" : GetString(T,b,c,1)+"",3);
            break;
            }
         }
      }
   }

if(cnt){ 
   var cs = " class='"+this.Img.Style,ns = " "+this.Img.Style, moc = this.XB.childNodes.length>300;
   var sep1a = this.GetText("PagerSep1"), sep2a = this.GetText("PagerSep2"), sep3a = this.GetText("PagerSep3"), sep4a = this.GetText("PagerNone");
   var sep1 = StringToXml(sep1a), sep2 = StringToXml(sep2a), sep3 = StringToXml(sep3a), sep4 = StringToXml(sep4a);
   for(var p=this.XB.firstChild,idx=1;p;p=p.nextSibling,idx++){
      var A1 = [], A2 = [];
      SetNames(this,A1,0);
      SetNames(this,A2,1);
      var E = "", EE = "";
      for(var i=0;i<3;i++){
         if(A1[i]==null || A2[i]==null || A1[i]!=A2[i]) break; 
         if(E){ E+="<b"+cs+"PagerSep3'>"+sep3+"</b>"; EE+=sep3; }
         if(A1[i]){ E+=moc?(max1?A1[i].slice(0,max1):A1[i]):"<b"+cs+"PagerSort"+(i+1)+"'>"+(max1?A1[i].slice(0,max1):A1[i])+"</b>"; EE+=A1[i]; }
         }
      if(A1[i]!=null || A2[i]!=null){
         if(E){ E+=moc?sep1:"<b"+cs+"PagerSep1'>"+sep1+"</b>"; EE+=BIEA?"\n":sep1a; }
         if(A1[i]==null || A1[i]==""){ E+=moc?sep4:"<span"+cs+"PagerSort"+(i+1)+ns+"PagerNone'>"+sep4+"</span>"; EE+=sep4a; }
         else for(var j=i;j<A1.length;j++){ E+=(j==i ? "" : "<span"+cs+"PagerSep3'>"+sep3+"</span>") + (moc?(max2?A1[j].slice(0,max2):A1[j]):"<span"+cs+"PagerSort"+(j+1)+"'>" + (max2?A1[j].slice(0,max2):A1[j]) + "</span>"); EE+=(j==i ? "" : sep3a)+A1[j]; }
         E+=moc?sep2:"<span"+cs+"PagerSep2'>"+sep2+"</span>"; EE+=BIEA?"\n":sep2a;
         if(A2[i]==null || A2[i]=="") E+=moc?sep4 : "<span"+cs+"PagerSort"+(i+1)+ns+"PagerNone'>"+sep4+"</span>";
         else for(var j=i;j<A2.length;j++){ E+=(j==i ? "" : "<span"+cs+"PagerSep3'>"+sep3+"</span>") + (moc?(max2?A2[j].slice(0,max2):A2[j]):"<span"+cs+"PagerSort"+(j+1)+"'>" + (max2?A2[j].slice(0,max2):A2[j]) + "</span>"); EE+=(j==i ? "" : sep3a)+A2[j]; }
         }
      p.Name = E ? E : this.GetText("Page")+" "+idx;
      if(EE&&this.StandardTip) p.Title = EE;
      MS.Digits; if(L.Digits) { p.Name = L.ConvertDigits(p.Name); if(p.Title) p.Title = L.ConvertDigits(p.Title); } ME.Digits;
      if(Grids.OnSetPageName) Grids.OnSetPageName(this,p);
      }   
   }
else {
   var ridx = this.RowIndex, name = this.GetText(ridx ? "PageRows" : "Page");
   for(var p=this.XB.firstChild,i=1;p;p=p.nextSibling,i++){ 
      p.Name = ridx ? name.replace("%1",p.firstChild[ridx]).replace("%2",p.lastChild[ridx]) : name+" "+i;
      MS.Digits; if(L.Digits) p.Name = L.ConvertDigits(p.Name); ME.Digits;
      if(Grids.OnSetPageName) Grids.OnSetPageName(this,p);
      }
   }

}
// -----------------------------------------------------------------------------------------------------------
// Returns page number acording to even - mouse position

// -----------------------------------------------------------------------------------------------------------
TGP.HidePager = function(P,show){
if(!P.Visible==!show) return;
P.Visible = show?1:0;
if(!P.Tag) return;
P.Tag.parentNode.parentNode.style.display = show ? "" : "none";
if(this.ExactWidth) P.TagWidth.style.display = show ? "" : "none";
if(show) {
   if(P.Pages) {
      P.Pages.innerHTML = this.GetPagerPagesHTML(P);
      P.Head.innerHTML = this.GetPagerCaptionHTML(P);
      }
   this.UpdatePagerPos();
   }

MS.Space;

   for(var r=this.XS.firstChild;r;r=r.nextSibling){
      if(r.Space==0 || r.Space>=4) r.r1.parentNode.colSpan+=show?1:-1;
      }

this.OverflowSpaces(); 
ME.Space;
if(this.ASec<=-10) this.ASec = -5;
this.HoverPager(P,null);
}
// -----------------------------------------------------------------------------------------------------------
// Activates given item on pager
TGP.HoverPager = function(P,p){
if(isNaN(p) || p<0) p = null;
if(p==P.LAPage || this.Touched) return;
if(this.Hover>=1 && P.Hover){
   var A = P.Hover;
   if(p==null) A.style.display = "none";
   else {
      A.style.display = "";
      var hp = this.GetPagerItemHeight(P), hh = P.Pages.firstChild.offsetHeight; 
      var Top = hp*p - hp + hh - P.Body.scrollTop+P.PagerTop, Left = P.PagerLeft, ww = BIEA6&&!BIE ? P.Body.clientWidth : P.Pages.offsetWidth;
      MS.Scale;
      if(this.Scale) { Top *= this.Scale; Left *= this.Scale; ww *= this.Scale; hh *= this.Scale; } 
      if(this.ScaleX) { Left *= this.ScaleX; ww *= this.ScaleX; } if(this.ScaleY) { Top *= this.ScaleY; hh *= this.ScaleY; }
      ME.Scale;
      if(this.AbsoluteCursors&1){ Top += this.TableY - CAbsDY; Left += this.TableX - CAbsDX; }
      else { Top += this.MainTable.offsetTop - A.parentNode.offsetTop; Left += this.MainTable.offsetLeft - A.parentNode.offsetLeft; }
      if(!BIE) { hh -= this.Img.PagerHoverBPHeight; if(!BIEA6) ww -= this.Img.PagerHoverBPWidth; }
      A.style.width = ww+"px"; A.style.height = hh+"px"; A.style.top = Top+"px"; A.style.left = Left+"px";
      }
   }
if(Grids.Drag && p!=null && Grids.Drag.Action!="ScrollPager" && Grids.Drag.Action!="Scrollbar" && Grids.Drag.Action!="Scroll") {
   if(P.Type=="Pages") this.GoToPage(GetNode(this.XB,p)); 
   }
if(!this.StandardTip && p!=null) {
   var tip = null, drag = Grids.Drag?Grids.Drag.Action:null;
   if(P.Type=="Pages") {
      var page = GetNode(this.XB,p); 
      if(page) tip = page.Title!=null ? page.Title : page.Name;
      if(Grids.OnGetPageTip) { var tmp = Grids.OnGetPageTip(this,P,GetNode(this.XB,p),tip,drag); if(tmp!=null) tip = tmp; }
      }
   else if(P.Type=="Gantt"){
      
      }
   else if(P.Type=="Custom"){
      if(Grids.OnGetPageTip) { var tmp = Grids.OnGetPageTip(this,P,p,tip,drag); if(tmp!=null) tip = tmp; }
      }
   this.HideTip();
   if(tip){
      this.Tip = (tip+"").replace("> | <","><br/><").replace("> =&gt; <","><br/><");
      this.TipTime = 0;
      }
   }
P.LAPage = p;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionScrollPager = function(){ 
var D = Grids.Drag; if(!D) return false;
var P = this.Pagers[D.Col]; if(!P) return false;
D.Pager = P;
D.Action = "ScrollPager";
D.Move = this.MoveScrollPager;
D.End = function(){ return true; }
D.Cursor = "default";
D.LS = P.Body.scrollTop;
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.MoveScrollPager = function(){ 
var D = Grids.Drag; if(!D) return false;
if(this!=D.Grid) return D.Grid.MoveScrollPager();
D.Pager.Body.scrollTop = D.LS + D.Y - D.AY;
return true;
}
// -----------------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------------
TGP.ActionShowPage = function(){ 
var E = this.Event; if(!E.Special) return false;
var P = this.Pagers[E.Col]; if(!P) return false;
var p = E.Special.slice(9)-1;
if(isNaN(p)) return false;
if(this.EditMode && this.EndEdit(1)==-1) return false;
if(P.Type=="Pages"){
   if(!Grids.OnClickPagerPage || !Grids.OnClickPagerPage(this,P,GetNode(this.XB,p))) { 
      this.GoToPage(GetNode(this.XB,p));
      }
   }
else if(P.Type=="Gantt" && P.Size){
   
   }
else if(P.Type=="Custom"){
   if(Grids.OnClickPagerPage) Grids.OnClickPagerPage(this,P,p);
   }
this.Clicked = new Date()-0; 
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.GetPagerItemHeight = function(P){
var h = P.ItemHeight; if(h) return h;
var pg = P.Pages.firstChild;
h = pg.offsetHeight;
if(BIE){ h += pg.offsetTop; P.ItemHeight = h; } 
else if(pg.nextSibling){ h = pg.nextSibling.offsetTop - pg.offsetTop; P.ItemHeight = h; }

return h;
}
// -----------------------------------------------------------------------------------------------------------
ME.Pager;

// -----------------------------------------------------------------------------------------------------------
// Re-renders pager
TGP.UpdatePager = function(simple){
MS.Pager;
if(!simple) for(var i=0;i<this.Pagers.length;i++){
   var P = this.Pagers[i];
   if(P.Visible && P.Pages) {
      P.Pages.innerHTML = this.GetPagerPagesHTML(P);
      P.Head.innerHTML = this.GetPagerCaptionHTML(P);
      }
   }
ME.Pager;

MS.Paging;
for(var r=this.XS.firstChild;r;r=r.nextSibling){ 
   if(r.HasPages) this.RefreshCell(r,r.HasPages);   
   if(r.HasPager) { 
      this.CalcRow(r,this.GetCalc(),"CalcOrder",1); 
      this.RefreshCell(r,r.HasPager+"Edit"); 
      }
   }
this.UpdateSpacePagesHeight();
ME.Paging;

this.UpdatePagerPos();
}
// -----------------------------------------------------------------------------------------------------------
MS.Pager;
TGP.PagerScrolled = function(idx){
var P = this.Pagers[idx];
if(!P) return;
var top = P.CursorTop - P.Body.scrollTop;
var height = P.CursorHeight, dt = P.CursorDT;
if(top<-dt) { height += top+dt; top = -dt; }
if(top+height+dt > P.Body.clientHeight) { height = P.Body.clientHeight - top - dt; }
var A = P.Focus;
if(height>(BIE?this.Img.PagerFocusBPHeight:0) && P.CursorAbsTop!=null){
   A.style.top = P.CursorAbsTop + top + "px";
   A.style.height = height + "px";
   A.style.display = "";
   }
else A.style.display = "none"; 
if(!this.Touched) this.GridMouseOver(); 

}
ME.Pager;
// -----------------------------------------------------------------------------------------------------------
TGP.UpdatePagerPos = function(dir,noscroll){

MS.Pager;
for(var i=0;i<this.Pagers.length;i++){
   var P = this.Pagers[i]; if(!P.Visible || !P.Pages || !P.Pages.firstChild || !P.Pages.firstChild.offsetHeight || P.Type=="Pages"&&!(dir&1) || P.Type=="Gantt"&&!(dir&2)) continue; 
   var Height = P.Pages.firstChild.offsetHeight, Top = null, h = this.GetPagerItemHeight(P), dt = h - Height, dh =  BIE ? dt - this.Img.PagerFocusBPHeight : dt, PH = P.Pages.offsetHeight;
   P.CursorDT = dt;
   if(P.Type=="Pages"){
      if(this.AllPages){
         var A = this.GetShowedPages(), l = A.length-2;
         if(l<0) Top = 0; 
         else if(l==1){ 
            Top = A[0]*h + A[2]*h;
            Height = Math.round(A[1]*h - dh);
            }
         else {
            Top = A[0]*h + (1-A[1])*h;
            Height = Math.round(A[l]*h + A[l+1]*h - Top - dh);
            }
         }
      else {
         Top = this.FPage*h;
         }
      }
   else if(P.Type=="Gantt" && P.Size){
      
      }
   
   if(Height<4) { Top += Math.round((Top%P.ItemHeight/P.ItemHeight)*(Height-4)); Height = 4; }
   if(Top+Height<0) Top = null;
   else if(Top<0) { Height += Top; Top = 0; }
   
   if(Top>=PH) Top = null;
   else if(Top+Height>PH) Height = PH-Top;
   
   if(Top != null && isFinite(Top) && P.PagerTop!=null){
      if(!BIEA||BIEA8) P.Focus.style.visibility = "hidden";
      var hh = BIE?0:this.Img.PagerFocusBPHeight;
      if(Height<=2+hh) Height = 2+hh;
      MS.Scale; if(this.Scale) Height *= this.Scale; if(this.ScaleY) Height *= this.ScaleY; ME.Scale;
      P.Focus.style.height = Height-hh+"px";
      
      P.CursorHeight = Height-hh;
      P.Focus.style.display = "";
      var ww = BIEA6&&!BIE ? P.Body.clientWidth : P.Pages.offsetWidth;
      MS.Scale; if(this.Scale) ww *= this.Scale; if(this.ScaleX) ww *= this.ScaleX; ME.Scale;
      if(!BIE&&!BIEA6) ww -= this.Img.PagerFocusBPWidth;
      P.Focus.style.width = ww+"px";
      if(!noscroll) P.Body.scrollTop = Height >= PH ? 0 : Top - P.Body.offsetHeight/2+Height/2;
      
      P.CursorTop = Top;
      Top += P.PagerTop - P.Body.scrollTop;
      var Left = P.PagerLeft;
      MS.Scale;
      if(this.Scale) { Top *= this.Scale; Left *= this.Scale; } 
      if(this.ScaleX) { Left *= this.ScaleX; } if(this.ScaleY) { Top *= this.ScaleY; }
      ME.Scale;
      if(this.AbsoluteCursors&2){ Top += this.TableY - CAbsDY; Left += this.TableX - CAbsDX; }
      else { Top += this.MainTable.offsetTop - P.Focus.parentNode.offsetTop; Left += this.MainTable.offsetLeft - P.Focus.parentNode.offsetLeft; }
      P.Focus.style.top = (Top-dt)+"px";
      P.Focus.style.left = Left+"px";
      P.CursorAbsTop = Top-dt-P.CursorTop+P.Body.scrollTop;
      
       this.PagerScrolled(i); 
      if(!BIEA||BIEA8) P.Focus.style.visibility = "";
      }
   else P.Focus.style.display = "none";
   
   }
ME.Pager;   

MS.Paging;
if(dir&1) for(var r=this.XS.firstChild;r;r=r.nextSibling) { 
   if(r.HasPages) {
      var p = this.GetFPage(1);
      if(p) p = this.GetPageNum(p);
      if(r.LastPage!=p){
         var max = Get(r,r.HasPages+"Count"); max = max && max<this.XB.childNodes.length+2;
         if(max){
            
            this.RefreshCell(r,r.HasPages);
            
            }
         var a = this.GetCell(r,r.HasPages).getElementsByTagName("a");
         if(!max && r.LastPage!=null && a[r.LastPage]) a[r.LastPage].className = this.Img.Style+"PagesLink";
         if(p!=null){
            var cp = a[p];
            if(max) {
               var pn = p+1; if(Grids.OnGetPageNumber){ pn = Grids.OnGetPageNumber(this,p+1); if(pn==null) pn = p+1; }
               for(var cp=0;cp<a.length;cp++) if(pn==a[cp].innerHTML) { cp = a[cp]; break; }
               if(cp==a.length) continue; 
               }
            var cell = cp.parentNode;
            cp.className = this.Img.Style+"PagesLinkActive";
            var pos = cp.offsetLeft - cell.scrollLeft;
            if(pos<0) cell.scrollLeft += pos;
            else {
               pos += cp.offsetWidth - cell.offsetWidth;
               if(pos>0) cell.scrollLeft += pos;
               }
            }
         r.LastPage = p;
         }
      }
   if(r.HasPager) this.CalcRow(r,this.GetCalc(),"CalcOrder",1);   
   }
ME.Paging;   
}
// -----------------------------------------------------------------------------------------------------------
TGP.UpdateSpacePagesHeight = function(r){
MS.Paging;
if(!r) { for(r=this.XS.firstChild;r;r=r.nextSibling) if(r.HasPages) this.UpdateSpacePagesHeight(r); return; }
var cell = this.GetCell(r,r.HasPages);
if(cell){
   cell = cell.lastChild;
   if(this.GetAttr(r,r.HasPages,"Wrap")-0){ cell.style.height = "auto";  return; }
   var scr = cell.clientWidth<cell.lastChild.offsetLeft+cell.lastChild.offsetWidth;
   var oh = cell.style.height, nh = this.Img.PagesHeight+(scr ? CScrollHeight : 0)+"px";
   cell.style.height = nh;
   cell.style.overflow = scr ? "auto" : "hidden";
   cell.style.overflowY = "hidden";
   if(nh != oh){ var T = this; setTimeout(function(){ T.Update(); },10); }
   }
ME.Paging;   
}
// -----------------------------------------------------------------------------------------------------------

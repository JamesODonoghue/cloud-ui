MS.Style$Image$Link$Xlsx;
// -----------------------------------------------------------------------------------------------------------
function SetTagRoot(T,I){
var P = I.parentNode; if(P==T||P.nodeName!="SPAN") return;
if(P.parentNode!=T) SetTagRoot(T,P);
T = P.parentNode; 
var br = P.style.borderRight, bl = P.style.borderLeft; if(br) P.style.borderRight = ""; if(bl) P.style.borderLeft = ""; 
if(I.previousSibling&&I.nextSibling){
   var O = null;
   while(I.nextSibling){
      var N = I.nextSibling;
      if(N.nodeType==1){ 
         T.insertBefore(N,P.nextSibling); 
         N.style.cssText = P.style.cssText+";"+N.style.cssText; if(P.style.textDecoration) N.style.textDecoration = N.style.textDecoration+" "+I.style.textDecoration; 
         }
      else { if(!O) { O = document.createElement("span"); O.style.cssText = P.style.cssText; T.insertBefore(O,P.nextSibling); } O.appendChild(N); }
      }
   if(br) { (N.nodeType==1?N:O).style.borderRight = br; br = ""; }
   }
var ns = I.nextSibling;
if(I.nodeType==3){ 
   var O = document.createElement("span"); 
   T.insertBefore(O,ns?P:P.nextSibling); 
   O.appendChild(I); 
   O.style.cssText = P.style.cssText; I = O;
   }
else { 
   T.insertBefore(I,ns?P:P.nextSibling); 
   I.style.cssText = P.style.cssText+";"+I.style.cssText; if(P.style.textDecoration) I.style.textDecoration = P.style.textDecoration+" "+I.style.textDecoration;
   }
if(ns) { if(br) P.style.borderRight = br; if(bl) I.style.borderLeft = bl; } 
else { if(br) I.style.borderRight = br; if(bl) P.style.borderLeft = bl; }
}
// -----------------------------------------------------------------------------------------------------------
function NormalizeTags(T,S,remspan){

for(var I=T.firstChild,N;I;I=N){ 
   N = I.nextSibling; 
   if(I.nodeType==1){ 
      if(N&&N.nodeType==1&&I.nodeName=="SPAN"&&N.nodeName=="SPAN"&&I.style.cssText==N.style.cssText){
         var L = N.firstChild; while(I.firstChild) N.insertBefore(I.firstChild,L);
         T.removeChild(I);
         }
      else if(I.nodeName!="IMG"&&I.nodeName!="BR"){
         var F = I.firstChild;
         if(!F||F==I.lastChild&&F.nodeType!=1&&!F.data) T.removeChild(I);
         else if(F!=I.lastChild||F.nodeType==1) NormalizeTags(I,null,remspan);
         }
      if(remspan&&I.nodeName=="SPAN"&&I.style.cssText==""&&I.parentNode==T) {
         while(I.firstChild) T.insertBefore(I.firstChild,I);
         T.removeChild(I);
         } 
      }
   else {
      if(!I.data) T.removeChild(I);
      else if(N&&N.nodeType!=1&&N.data) { N.data = I.data+N.data; T.removeChild(I); }
      }
   }
if(!T.firstChild) return;

if(S){ 
   
   var CSS = ["fontWeight","fontStyle","fontVariant","textDecoration","fontSize","fontFamily","color","textShadow"], A = null; 
   var F = T.firstChild, A = null, chg = 0;
   if(F.nodeType==1) for(var i=0,s=F.style,A={};i<CSS.length;i++) if(s[CSS[i]]) A[CSS[i]] = s[CSS[i]]; 
   for(var I=F.nextSibling;I&&A;I=I.nextSibling) { 
      if(I.nodeType!=1) { A = null; break; }
      var s = I.style; for(var a in A) if(s[a]!=A[a]) { delete A[a]; if(!GetCount(A)){ A = null; break; } }
      
      }
   if(GetCount(A)) { 
      for(var a in A) S[a] = A[a];
      for(var I=T.firstChild;I;I=I.nextSibling) { var s = I.style; for(var n in A) s[n] = ""; } 
      chg = 1;
      }

   var B = {}, N = {}; 
   for(var a in S) if(!A||A[a]==null) N[a] = S[a];
   for(var I=T.firstChild;I;I=I.nextSibling) if(I.nodeType==1) { var s = I.style; for(var a in N) if(s[a]) B[a] = N[a]; } 
   if(GetCount(B)){ 
      for(var I=T.firstChild;I;I=I.nextSibling) { 
         if(I.nodeType!=1) { var O = I; I = document.createElement("SPAN"); T.insertBefore(I,O); I.appendChild(O); }
         var s = I.style; for(var a in B) if(s[a]!=B[a]) s[a] = B[a]; 
         } 
      for(var a in B) S[a] = null; 
      }

   if(chg&&remspan) NormalizeTags(T,null,remspan);
   }
}
// -----------------------------------------------------------------------------------------------------------
function SetTagsRoot(T,ratio){

var DIV = {"P":7,"DIV":3,"HEADER":3,"FOOTER":3,"NAV":3,"HGROUP":3,"SECTION":3,"ARTICLE":3,"ADDRESS":3,"ASSIDE":3,"MAIN":3,"FIGURE":3,"FIGCAPTION":3}; 
var HH = { "H1":32,"H2":24,"H3":19,"H4":16,"H5":13,"H6":12 };
var BR = {"BR":1,"HR":1};
for(var I=T.firstChild;I;I=I.nextSibling) if(I.nodeType==1){
   var n = I.nodeName; if(BR[n]||n=="IMG") continue;
   if(n=="A"){ 
      if(I.style.cssText){
         if(I.childNodes.length==1&&I.firstChild.nodeType==1) {
            var O = I.firstChild; O.style.cssText = I.style.cssText+";"+O.style.cssText; if(I.style.textDecoration) O.style.textDecoration = I.style.textDecoration+" "+O.style.textDecoration;
            }
         else {
            var O = document.createElement("span");
            O.style.cssText = I.style.cssText;
            while(I.firstChild) O.appendChild(I.firstChild);
            I.appendChild(O);
            }
         I.style.cssText = "";
         }
      SetTagsRoot(I,ratio); 
      if(!I.firstChild) { var P = I.previousSibling; T.removeChild(I); I = P; if(!I) return SetTagsRoot(T,ratio); }
      continue; 
      }
   if(n!="SPAN"){
      var N = document.createElement("span"), s = N.style;
      s.cssText = I.style.cssText; if(I.Block) N.Block = I.Block;
      if(n=="B"||n=="STRONG") s.fontWeight = 700;
      else if(n=="I"||n=="EM"||n=="VAR"||n=="CITE"||n=="DFN") s.fontStyle = "italic";
      else if(n=="U"||n=="INS") s.textDecoration += " underline";
      else if(n=="STRIKE"||n=="DEL") s.textDecoration += " line-through";
      else if(n=="SUP") s.verticalAlign = "super";
      else if(n=="SUB") s.verticalAlign = "sub";
      else if(n=="ADDRESS") { s.fontStyle = "italic"; if(N.Block) N.Block |= 3; else N.Block = 3; }
      else if(DIV[n]) { if(N.Block) N.Block |= DIV[n]; N.Block = DIV[n]; }
      else if(HH[n]) { s.fontSize = HH[n]+"px"; s.lineHeight = Math.round(HH[n]*(ratio?ratio:4/3))+"px"; s.fontWeight = 700; N.Block = 7; }
      else if(n=="SMALL"){ s.fontSize = "10px"; s.lineHeight = "13px"; }
      else if(n=="MARK") s.backgroundColor = "yellow";
      else if(n=="CODE"||n=="SAMP"||n=="KBD") s.fontFamily = "monospace";
      else if(n=="PRE") { I.innerHTML = I.innerHTML.replace(/\r\n|\r|\n/g,"<br>").replace(/  /g," \xA0"); s.fontFamily = "monospace"; N.Block = 7; }
      else if(n=="Q"){ I.insertBefore(document.createTextNode('"'),I.firstChild); I.appendChild(document.createTextNode('"')); }
      else if(n=="FONT"){
         if(I.color) s.color = I.color;
         if(I.face) s.fontFamily = I.face;
         if(I.size) s.fontSize = [10,10,13,16,18,24,32,48][I.size]+"px";
         }
      if(N.Block && I.lastElementChild&&I.lastElementChild.nodeName=="BR") I.removeChild(I.lastElementChild);
      while(I.firstChild) N.appendChild(I.firstChild);
      T.insertBefore(N,I); T.removeChild(I); I = N;
      }
   var O = I.firstChild, P = I.nextSibling, add = 0, bl = I.style.borderLeft, br = I.style.borderRight;
   if(O&&(O!=I.lastChild||O.nodeType==1)) while(O){
      var N = O.nextSibling, Q = null;
      if(O.nodeType==1){
         if(BR[O.nodeName]) { 
            if(add) { T.insertBefore(O,P); add = 1; }
            O = N; continue;
            }
         O.style.cssText = I.style.cssText+";"+O.style.cssText; if(I.style.textDecoration) O.style.textDecoration = I.style.textDecoration+" "+O.style.textDecoration;
         if(!O.previousSibling){
            T.insertBefore(O,I);
            if(!I.firstChild) { O.Block = I.Block; T.removeChild(I); }
            else {
               if(O.style.borderRight) O.style.borderRight = ""; if(I.style.borderLeft) I.style.borderLeft = "";
               if(I.Block&1) { O.Block = I.Block&5; if(I.Block&2) I.Block = I.Block&6; else delete I.Block; }
               }
            I = O.previousSibling; 
            if(!I) return SetTagsRoot(T,ratio);
            break;
            }
         if(N||add) add = 1;
         T.insertBefore(O,P); Q = O;
         }
      else if(add==1){
         var Q = document.createElement("span");
         Q.style.cssText = I.style.cssText;
         Q.appendChild(O);
         T.insertBefore(Q,P);
         add = Q;
         }
      else if(add) add.appendChild(O);
      if(Q){
         if(Q.previousSibling.style.borderRight&&I.style.borderRight) Q.previousSibling.style.borderRight = ""; 
         if(Q.style.borderLeft&&I.style.borderLeft) O.style.borderLeft = "";
         if(br) Q.style.borderRight = br;
         }
      O = N;
      }
   if(I.Block&2 && (P?P.previousSibling:T.lastChild)!=I){ (P?P.previousSibling:T.lastChild).Block = I.Block&6; if(I.Block&1) I.Block = I.Block&5; else delete I.Block; }
   if(I.nodeType==1&&!I.firstChild&&!BR[I.nodeName]) { 
      if(I.Block&2&&I.previousSibling) I.previousSibling.Block = I.Block&6;
      if(I.Block&1&&I.nextSibling) I.nextSibling.Block = I.Block&5;
      if(I.style.borderLeft&&I.previousSibling && !I.previousSibling.style.borderRight) I.previousSibling.style.borderRight = I.style.borderLeft;
      if(I.style.borderRight&&I.nextSibling && !I.nextSibling.style.borderLeft) I.nextSibling.style.borderLeft = I.style.borderRight;
      T.removeChild(I); I = (P?P.previousSibling:T.lastChild); 
      if(!I) return SetTagsRoot(T,ratio); 
      }
   }

var D = [];
for(var I=T.firstChild;I;I=I.nextSibling) if(I.Block){
   for(var j=0;j<2;j++) if(I.Block&(j+1)){
      var next = j ? "nextSibling" : "previousSibling", p = -1; 
      for(var P=I[next];P;P=P[next]){
         if(P.nodeType==1){ 
            if(BR[P.nodeName]) { p = P.nodeName=="BR" ? 1 : 2; break; } 
            if(P.Block){ p = P.Block&4?4:3; break; }
            if(P.innerText.search(/\S/)>=0) { p = 0; break; }
            }
         else if(P.data.search(/\S/)>=0) { p = 0; break; }
         }
      D[D.length] = [I,j,p];
      }
   }
for(var i=0;i<D.length;i++){
   var A = D[i], O = A[0];
   if(O.Block&4){ 
      if(!A[1]) { T.insertBefore(document.createElement("br"),O); if(A[2]==0||A[2]==1||A[2]==3) { T.insertBefore(document.createElement("br"),O); } }
      else { T.insertBefore(document.createElement("br"),O.nextSibling); if(A[2]==0||A[2]==1||A[2]==3) { T.insertBefore(document.createElement("br"),O.nextSibling); } }
      }
   else {       
      if(!A[1]&&(A[2]==0||A[2]==3)) T.insertBefore(document.createElement("br"),O);
      if(A[1]&&A[2]==0) T.insertBefore(document.createElement("br"),O.nextSibling);
      }
   
   }
}
// -----------------------------------------------------------------------------------------------------------
function InsertSpans(I) {
var O = I.firstChild, Q = null;
while(O){
   var E = O.nextSibling;
   if(O.nodeType==1) Q = null; 
   else { if(!Q) { Q = document.createElement("span"); I.insertBefore(Q,O); } Q.appendChild(O); }
   O = E;
   }
}
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
function GetSelectedTags(T,add,root,span,sort,nosplit){
var S = getSelection(), N = [], R = root==1 ? [] : null, A = S.anchorNode, F = S.focusNode, ao = S.anchorOffset, fo = S.focusOffset;
var SP = span==0 ? null : span==1 ? {"SPAN":1} : {"SPAN":1,"IMG":1 };

function Sort(a,b) { return a==b ? 0 : !a.compareDocumentPosition ? a.sourceIndex-b.sourceIndex : a.compareDocumentPosition(b)&2 ? 1 : -1; }; 
function GetSpans(N,O){
   if(O){ for(var I=O.firstChild;I;I=I.nextSibling) if(I.nodeType!=1||!SP[I.nodeName]) GetSpans(N,I); else N[N.length] = I; }
   else { for(var i=0,nl=N.length;i<nl;i++) if(N[i].nodeType!=1||!SP[N[i].nodeName]) { GetSpans(N,N[i]); N.splice(i--,1); nl--; } }
   }
function End(N){
   if(span) GetSpans(N);
   if(sort) N.sort(Sort);
   return N;
   }

while(A.firstChild){ if(A.childNodes[ao]) { A = A.childNodes[ao]; ao = 0; } else { A = A.lastChild; ao = A.nodeType==3 ? A.data.length : A.childNodes.length; if(!ao) N[N.length] = A; } }
while(F.firstChild){ if(F.childNodes[fo]) { F = F.childNodes[fo]; fo = 0; } else { F = F.lastChild; fo = F.nodeType==3 ? F.data.length : F.childNodes.length; if(!fo) N[N.length] = F; } }

if(A==F) {
   if(ao==fo) return N; 
   if(ao>fo){ fo = S.anchorOffset; ao = S.focusOffset; }

   if(A.nodeType==1){
      for(var i=ao;i<fo;i++) N[N.length] = A.childNodes[i];
      if(add) for(var i=0,O=null,P=A.nextSibling;i<N.length;i++) {
         if(N[i].nodeType==1) {
            if(O){ O = 1; if(A!=T) A.parentNode.insertBefore(N[i],P); }
            }
         else if(O&&O!=1) { O.appendChild(N[i]); N.splice(i--,1); }
         else { 
            var O = document.createElement("span"); 
            if(A==T) A.insertBefore(O,N[i]);
            else { O.style.cssText = A.style.cssText; if(A.style.borderRight) A.style.borderRight = ""; if(O.style.borderLeft) O.style.borderLeft = ""; A.parentNode.insertBefore(O,A.nextSibling); }
            O.appendChild(N[i]); N[i] = O;
            }

         }
      if(root==2) for(var i=0;i<N.length;i++) SetTagRoot(T,N[i]);
      return End(N);
      }

   var P = A.parentNode, E = A.nextSibling;
   if(add){
      if(!ao&&fo==A.data.length&&P.childNodes.length==1&&P!=T){ N[N.length] = P; if(root==2) SetTagRoot(T,P); return End(N); }
      var O = document.createElement("span");
      if(P!=T) { O.style.cssText = P.style.cssText; if(O.style.border) O.style.border = ""; }
      N[N.length] = O;
      if(ao) { 
         O.appendChild(document.createTextNode(A.data.slice(ao,fo)));
         if(fo!=A.data.length) P.insertBefore(document.createTextNode(A.data.slice(fo)),A.nextSibling);
         A.data = A.data.slice(0,ao); P.insertBefore(O,A.nextSibling);
         }
      else if(fo!=A.data.length){ 
         O.appendChild(document.createTextNode(A.data.slice(0,fo))); 
         A.data = A.data.slice(fo); P.insertBefore(O,A); 
         }
      else { P.insertBefore(O,A); O.appendChild(A); }
      if(root) SetTagRoot(T,O);
      return End(N);
      }
   if(!ao&&fo==A.data.length||nosplit){ N[N.length] = A; if(root) SetTagRoot(T,A); return End(N); }
   var O = document.createTextNode(A.data.slice(ao,fo));
   if(ao){
      P.insertBefore(O,A.nextSibling);
      if(fo!=A.data.length) P.insertBefore(document.createTextNode(A.data.slice(fo)),O.nextSibling);
      A.data = A.data.slice(0,ao);
      }
   else { P.insertBefore(O,A); A.data = A.data.slice(fo); }
   N[N.length] = O; if(root) SetTagRoot(T,O);
   return End(N);
   }

for(var AA=[],P=A;P!=T;P=P.parentNode) AA[AA.length] = P;
for(var FF=[],P=F;P!=T;P=P.parentNode) FF[FF.length] = P;
if(AA.length>FF.length) AA.splice(0,AA.length-FF.length); else if(FF.length>AA.length) FF.splice(0,FF.length-AA.length);
for(var Q=T,i=0;i<AA.length;i++) if(AA[i]==FF[i]) { Q = AA[i]; break; } 

for(var P=i?AA[i-1].nextSibling:T.lastChild;P&&P!=FF[i-1];P=P.nextSibling) N[N.length] = P;
if(!P){
   N = [], P = A; A = F; F = P; P = ao; ao = fo; fo = P; 
   for(var P=i?FF[i-1].nextSibling:T.lastChild;P&&P!=AA[i-1];P=P.nextSibling) N[N.length] = P;
   }
if(add) for(var i=0;i<N.length;i++) if(N[i].nodeType==3){ 
   if(i&&N[i-1].nodeType==3) { N[i-1].parentNode.appendChild(N[i]); N.splice(i--,1); }
   else { 
      var O = document.createElement("span"), P = N[i].parentNode; 
      if(P!=T) { O.style.cssText = P.style.cssText; if(O.style.border) O.style.border = ""; } 
      P.insertBefore(O,N[i]); O.appendChild(N[i]); N[i] = O; 
      }
   }
   
if(A.nodeType==1){
   if(ao!=A.childNodes.length) { 
      if(ao) A = A.childNodes[ao]; 
      N[N.length] = A; 
      }
   }

else if(ao!=A.data.length){
   if(!ao&&!A.previousSibling&&Q!=A.parentNode) { 
      A = A.parentNode; 
      if(A.nodeName=="A") { if(add) InsertSpans(A); A = A.firstChild; }
      }
   else if(add){
      var O = document.createElement("span"), P = A.parentNode; 
      if(P!=T) { O.style.cssText = P.style.cssText; if(O.style.border) O.style.border = ""; if(R) R[R.length] = O; }
      P.insertBefore(O,A.nextSibling);
      if(ao) { O.appendChild(document.createTextNode(A.data.slice(ao))); A.data = A.data.slice(0,ao); } 
      else O.appendChild(A);
      A = O;
      }
   else if(ao&&!nosplit){
      var O = document.createTextNode(A.data.slice(0,ao)); 
      A.data = A.data.slice(ao);
      A.parentNode.insertBefore(O,A);
      if(R&&A.parentNode!=T) R[R.length] = A;
      }
   N[N.length] = A;
   }

if(A!=Q) while(A.parentNode!=Q){
   while(A.nextSibling){ 
      A = A.nextSibling;
      if(add&&A.nodeType==3){ 
         var O = document.createElement("span"), P = A.parentNode; 
         if(P!=T) { O.style.cssText = P.style.cssText; if(O.style.border) O.style.border = ""; if(R) R[R.length] = O; }
         P.insertBefore(O,A); 
         O.appendChild(A); 
         A = O; 
         }
      N[N.length] = A;
      }
   A = A.parentNode;
   }

if(F.nodeType==1){
   if(fo==F.childNodes.length) N[N.length] = F;
   else if(fo) F = F.childNodes[fo]; 
   }

else if(fo){
   if(fo==F.data.length&&!F.nextSibling&&Q!=F.parentNode) { 
      F = F.parentNode;
      if(F.nodeName=="A") { if(add) InsertSpans(F); F = F.lastChild; }
      }
   else if(add){
      var O = document.createElement("span"), P = F.parentNode; 
      if(P!=T) { O.style.cssText = P.style.cssText; if(O.style.border) O.style.border = ""; if(R) R[R.length] = O; }
      P.insertBefore(O,F);
      if(fo!=F.data.length) { O.appendChild(document.createTextNode(F.data.slice(0,fo))); F.data = F.data.slice(fo); } 
      else O.appendChild(F);
      F = O;
      }
   else if(fo!=F.data.length&&!nosplit){
      var O = document.createTextNode(F.data.slice(fo));
      F.data = F.data.slice(0,fo);
      F.parentNode.insertBefore(O,F.nextSibling);
      if(R&&F.parentNode!=T) R[R.length] = F;
      }
   N[N.length] = F;
   }

if(F!=Q) while(F.parentNode!=Q){
   while(F.previousSibling){ 
      F = F.previousSibling;
      if(add&&F.nodeType==3){ 
         var O = document.createElement("span"), P = F.parentNode; 
         if(P!=T) { O.style.cssText = F.parentNode.style.cssText; if(O.style.border) O.style.border = ""; if(R) R[R.length] = O; }
         P.insertBefore(O,F); 
         O.appendChild(F); 
         F = O; 
         }
      N[N.length] = F;
      }
   F = F.parentNode;
   }
if(root==1) for(var i=0;i<R.length;i++) SetTagRoot(T,R[i]);
else if(root==2) for(var i=0;i<N.length;i++) SetTagRoot(T,N[i]);
return End(N);
}
// -----------------------------------------------------------------------------------------------------------
ME.Style$Image$Link$Xlsx;





// -----------------------------------------------------------------------------------------------------------
TEdit.EditBorder = function(border,edge,test){

}
// -----------------------------------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------------------------------
TEdit.EditStyle = function(attr,val,bit,test){
 
}
// -----------------------------------------------------------------------------------------------------------
TEdit.UpperCase = function(test,lower){
 
}
TEdit.LowerCase = function(test){ return this.UpperCase(test,1); }
// -----------------------------------------------------------------------------------------------------------
TEdit.IncTextSize = function(A,p,def,test){
 
}
// -----------------------------------------------------------------------------------------------------------

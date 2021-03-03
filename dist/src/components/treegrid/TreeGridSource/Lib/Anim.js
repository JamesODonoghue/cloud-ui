MS.Animate;
// -----------------------------------------------------------------------------------------------------------
function SetTimeout(F,time){   
if(!SetTimeout.Interval) {
   function Interval(){
      var I = SetTimeout.Interval, len = I.length;
      for(var i=0;i<len;i++) if(!--I[i][1]) { 
         var O = I[i][0]; 
         I.splice(i--,1); len--;
         I.Pos = i;
         if(O) O(); 
         i = I.Pos;
         if(len>I.length) len = I.length;
         }
      }
   SetTimeout.Interval = [];
   SetTimeout.Index = 0;
   setInterval(Interval,50);
   }
SetTimeout.Interval.push([F,Math.ceil(time/50),++SetTimeout.Index]);
return SetTimeout.Index;
}
// -----------------------------------------------------------------------------------------------------------
function ClearTimeout(idx){   
var I = SetTimeout.Interval;
for(var i=0;i<I.length;i++) if(I[i][2]==idx) { 
   I.splice(i,1); 
   if(i<=I.Pos) I.Pos--;
   return; 
   }
}
// -----------------------------------------------------------------------------------------------------------
function Animate(D,A,P,func,param,noclr){
if(!D || BIEA&&!BIEA10) { if(func) func(param); return; }
if(D.runanim) clear(D,1); 
if(!A){ if(func) func(param); return; }
if(noclr && D.style.animation) { 
   D.style.animation = "";
   SetTimeout(Animate.bind(null,D,A,P,func,param,noclr),100); 
   return;
   }
A += "";
if(A.charAt(0)=="@") A = A.slice(A.charAt(1)==","?2:1); 
A = A.replace(/^\s+|\s+$/g,"").split(/\s*,\s*/); 
A.Pos = 0; A.Cls = []; A.P = P; A.Func = func; A.Param = param; A.NoClr = noclr;
D.runanim = A;

function clear(D,forced){ 
   var A = D.runanim; if(!A) return;
   if(A.Start) { D.removeEventListener("animationstart",A.Start); D.removeEventListener("animationend",A.Anim); }
   if(A.SetTimeout) ClearTimeout(A.SetTimeout);
   var Q = A.P; if(Q) for(var p in Q) D.style[p] = Q[p]; 
   var Q = A.Cls; if(Q) for(var p in Q) { 
      var cls = D.className.split(/\s+/), ncls = "";
      for(var i=0;i<cls.length;i++) if(!Q[cls[i]]) ncls += (ncls?" ":"") + cls[i];
      if(ncls!=D.className) D.className = ncls;
      }
   
   if(!A.NoClr) D.style.animation = ""; 
   delete D.runanim;
   if(A.Func) A.Func(A.Param,forced); 
   }

function anim(D){
   var A = D.runanim; if(!A) return;
   if(A.SetTimeout) { ClearTimeout(A.SetTimeout); A.SetTimeout = null; } 
   var a = A[A.Pos++];
   if(a==null) clear(D); 
   else if(a-0){         
      A.SetTimeout = SetTimeout(A.Anim,a-0);  
      }
   else if(a.indexOf(" ")<0) { 
      D.className += " "+a; A.Cls[a] = 1;
      anim(D);
      }
   else {                
      if(a.search(/forwards|backwards|both|none/)<0) a += " forwards";
      if(!A.Start) { A.Start = start.bind(null,D); D.addEventListener("animationstart",A.Start); D.addEventListener("animationend",A.Anim); }
      A.SetTimeout = SetTimeout(A.Anim,100); 
      D.style.animation = a;
      }
   }

function start(D){ 
   var A = D.runanim; if(!A) return;
   if(A.SetTimeout) { ClearTimeout(A.SetTimeout); A.SetTimeout = null; }
   }

A.Anim = anim.bind(null,D);
anim(D);
}
// -----------------------------------------------------------------------------------------------------------
function TGAnimate(D,A,func,noclr){ return Animate(D,A,null,func,noclr); }
// -----------------------------------------------------------------------------------------------------------
ME.Animate;

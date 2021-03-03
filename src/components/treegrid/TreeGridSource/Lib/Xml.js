MS.Xml;
// -----------------------------------------------------------------------------------------------------------
function TXmlNode(){
this.nodeType = 1;
this.attributes = [];
this.childNodes = { length:0 };

}
// -----------------------------------------------------------------------------------------------------------
TXmlNode.prototype.removeChild = function(N){ 
if(!N) return null;
var P = N.parentNode;
if(!P) return null;
if(N==P.firstChild) P.firstChild = N.nextSibling;
else N.previousSibling.nextSibling = N.nextSibling;
if(N==P.lastChild) P.lastChild = N.previousSibling;
else N.nextSibling.previousSibling = N.previousSibling;
N.parentNode = null;
N.previousSibling = null;
N.nextSibling = null;

this.childNodes.length--;
return N;
}
// -----------------------------------------------------------------------------------------------------------
TXmlNode.prototype.appendChild = function(N){ 
if(!N) return null;
if(N.parentNode) N.parentNode.removeChild(N);
if(this.lastChild){
   this.lastChild.nextSibling = N;
   N.previousSibling = this.lastChild;
   }
else { 
   this.firstChild = N; 
   N.previousSibling = null; 
   }
this.lastChild = N;
N.nextSibling = null;
N.parentNode = this;
N.index = this.childNodes.length++;

return N;
}
// -----------------------------------------------------------------------------------------------------------
TXmlNode.prototype.insertBefore = function(N,C){ 
if(!N) return null;
if(!C) return this.appendChild(N);
if(N.parentNode) N.parentNode.removeChild(N);
if(C.previousSibling) C.previousSibling.nextSibling = N;
else this.firstChild = N;
N.previousSibling = C.previousSibling;
N.nextSibling = C;
N.parentNode = this;
N.index = this.childNodes.length++;

return N;
}
// ----------------------------------------------------------------------------------------------------------
TXmlNode.prototype.getAttribute = function(name){ return this[name]; }
TXmlNode.prototype.hasAttribute = function(name){ return this[name] != undefined; }
TXmlNode.prototype.setAttribute = function(name,value){  
var A = this.attributes;
if(this[name] == undefined) {
   this[name] = value;
   A[A.length] = { nodeName:name, nodeValue:value }
   }
else {
   this[name] = value;
   for(var i=0;i<A.length;i++) if(A[i].nodeName==name){ A[i].nodeValue = value; break; }
   }   
}
// ----------------------------------------------------------------------------------------------------------
TXmlNode.prototype.getElementsByTagName = function(name){
var A = [];
for(var r=this.firstChild;r;r=r.nextSibling){
   if(r.nodeName==name) A[A.length] = r;
   if(r.firstChild){
      var B = r.getElementsByTagName(name);
      if(B.length) A.concat(B);
      }
   }
return A;   
}
// ----------------------------------------------------------------------------------------------------------
function TXmlDocument(){

}
// -----------------------------------------------------------------------------------------------------------
TXmlDocument.prototype = new TXmlNode();
// -----------------------------------------------------------------------------------------------------------
TXmlDocument.prototype.createElement = function(name){ 
var E = new TXmlNode(); 
E.tagName = name;
E.nodeName = name;
return E;
}

// ----------------------------------------------------------------------------------------------------------
function GetXml(B,A){
if(B.nodeType==3) { if(!A) return B.nodeValue.replace(/\&/g,"&amp;").replace(/\</g,"&lt;").replace(/\n/g,"&#x0A;"); A[A.length] = B.nodeValue; return; }
var s = "<"+B.tagName, N = {"tagName":1,"nodeName":1,"nodeType":1,"nodeValue":1,"index":1};
for(var a in B) {
   var t = typeof(B[a]);
   if(!N[a]){
      if(t=="string") s += " "+a+"=\""+B[a].replace(/\&/g,"&amp;").replace(/\</g,"&lt;").replace(/"/g,"&quot;").replace(/\n/g,"&#x0A;")+"\"";
      else if(t=="number") s += " "+a+"=\""+B[a]+"\"";
      else if(t=="boolean") s += " "+a+"=\""+(B[a]?1:0)+"\"";
      }
   }
if(A){
   if(B.firstChild){
      A[A.length] = s + ">";
      for(var r=B.firstChild;r;r=r.nextSibling) GetXml(r,A);
      A[A.length] = "</"+B.tagName+">";
      }
   else A[A.length] = s;
   }   
else if(B.firstChild){
   s+= ">";
   for(var r=B.firstChild;r;r=r.nextSibling) s += GetXml(r);
   s+="</"+B.tagName+">";
   return s;
   }
else return s + "/>";
}
// ----------------------------------------------------------------------------------------------------------
function ParseXml(Xml,Doc,Parent){
var P = Parent?Parent:Doc;
var rt = /[^\s\/\>]/; 
var r = /[A-Za-z_][\w\:\.\-_]*|\'[^\']*\'|\"[^\"]*\"|\/?\>[\s\S]*/g;

Xml = Xml.replace(/<!--[\s\S]*?-->/g,"");   
    
var fr = Xml.search(/\<\w+[\s\>]/); 
if(fr<0) return false;
Xml = Xml.slice(fr+1); 
var A = Xml.split('<'), al = A.length;

for(var i=0;i<al;i++){
   var s = A[i];
   
   if(s.charCodeAt(0)==47){ 
      
      P = P.parentNode; 
      if(!P) return false; 
      continue;
      }
      
   var B = s.match(r), bl = B.length-1;
   if(bl && B[bl].indexOf('>')<0 && i-1<al){ 
      var x = s.search(/[\'\"][^\'\"]*$/);
      if(x>=0) { 
         x = s.charAt(x);
         while(i-1<al && A[++i].indexOf(x)<0) s += "<"+A[i];
         
         A[i] = s + "<" + A[i];
         A[i--]; continue;
         
         }
      }
   var N = Doc.createElement(B[0]);
   P.appendChild(N);
   
   for(var j=1;j<bl;j+=2){
      var v = B[j+1].slice(1,-1); 
      if(v.indexOf('&')>=0) v = ReplaceEntities(v);
      v = (v-0)+""==v ? v-0 : v;
      
      N.setAttribute(B[j],v);
      }
      
   var s = B[bl], t = 0;
   if(s.charCodeAt(0)!=47){ 
      P = N;
      if(s.length>6 || s.search(rt)>=0) t = 1; 
      }
   else if(s.length>7 || s.search(rt)>=0) t = 2; 
   if(t){
      t = s.slice(t); 
      if(t.indexOf('&')>=0) t = ReplaceEntities(t);
      var T = Doc.createElement("#text");
      T.nodeType = 3;
      T.nodeValue = t;
      P.appendChild(T);
      }
   }
Doc.documentElement = Doc.firstChild;
return true;
}
// -----------------------------------------------------------------------------------------------------------
function CreateXmlFromString(str){
var doc = new TXmlDocument();
if(ParseXml(str,doc)) return doc;
return null;
}
var TGCreateXML = CreateXmlFromString; if(window["CreateXML"]==null) window["CreateXML"] = CreateXmlFromString;  
// -----------------------------------------------------------------------------------------------------------
ME.Xml;

// ----------------------------------------------------------------------------------------------------------
// Replaces all entits by their characters, only basic XML entities and numeric entities
function ReplaceEntities(v){
if(v.indexOf('&#')>=0) { 
   var A = v.match(/\&\#x\w*\;/g), O = {}; 
   if(A) for(var i=0;i<A.length;i++) if(!O[A[i]]){
      O[A[i]] = 1;
      v = v.replace(new RegExp(ToRegExp(A[i]),"g"),String.fromCharCode(parseInt(A[i].slice(3),16)));  
      }
   var A = v.match(/\&\#\w*\;/g), O = {}; 
   if(A) for(var i=0;i<A.length;i++) if(!O[A[i]]){
      O[A[i]] = 1;
      v = v.replace(new RegExp(ToRegExp(A[i]),"g"),String.fromCharCode(parseInt(A[i].slice(2),10)));  
      }
   }
return v.replace(/\&lt\;/g,"<").replace(/\&gt\;/g,">").replace(/\&quot\;/g,"\"").replace(/\&apos\;/g,"'").replace(/\&amp\;/g,"&");
}
// ----------------------------------------------------------------------------------------------------------

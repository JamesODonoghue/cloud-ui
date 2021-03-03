// -----------------------------------------------------------------------------------------------------------
// Object for internal data, rows in grid, replaces DOMDocument and DOMNode
// -----------------------------------------------------------------------------------------------------------
var CNodeNames = {
   id:1,firstChild:1,lastChild:1,nextSibling:1,previousSibling:1,parentNode:1,tagName:1,nodeName:1,childNodes:1,
   removeChild:1,appendChild:1,insertBefore:1,GetNode:1,ClearChildren:1
   }
// -----------------------------------------------------------------------------------------------------------
function TDataNode(){
this.childNodes = { length:0 };

}
// -----------------------------------------------------------------------------------------------------------
TDataNode.prototype.removeChild = function(N){ 
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
TDataNode.prototype.appendChild = function(N){ 
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
this.childNodes.length++;
return N;
}
// -----------------------------------------------------------------------------------------------------------
TDataNode.prototype.insertBefore = function(N,B){ 
if(!N) return null;
if(!B) return this.appendChild(N);
if(B.parentNode!=this) return null;
if(N.parentNode) N.parentNode.removeChild(N);
if(B.previousSibling) B.previousSibling.nextSibling = N;
else this.firstChild = N;
N.previousSibling = B.previousSibling;
N.nextSibling = B;
B.previousSibling = N;
N.parentNode = this;
this.childNodes.length++;
return N;
}
// -----------------------------------------------------------------------------------------------------------
TDataNode.prototype.GetNode = function(pos){ 
pos -= 0;
for(var r=this.firstChild;r&&pos;r=r.nextSibling) pos--;
return r;
}
// -----------------------------------------------------------------------------------------------------------
TDataNode.prototype.ClearChildren = function(){ 
this.firstChild = null;
this.lastChild = null;
this.childNodes.length = 0;
}
// -----------------------------------------------------------------------------------------------------------
function GetNode(row,pos){
return row.GetNode ? row.GetNode(pos) : row.childNodes[pos];
}
var TGGetNode = GetNode; if(window["GetNode"]==null) window["GetNode"] = GetNode;
// ----------------------------------------------------------------------------------------------------------
function ClearChildren(row){
if(row.ClearChildren) row.ClearChildren();
else row.innerHTML = "";
}
// ----------------------------------------------------------------------------------------------------------
function TDataDocument(){
this.DataDocument = 1;
}
// -----------------------------------------------------------------------------------------------------------
TDataDocument.prototype = new TDataNode();
// -----------------------------------------------------------------------------------------------------------
TDataDocument.prototype.createElement = function(name){ 
var E = new TDataNode(); 
E.tagName = name;
E.nodeName = name;
return E;
}
// -----------------------------------------------------------------------------------------------------------
// In IE is used standard HTMLDocument, in other browsers this JavaScript one
var Dom = BIEA&&!BIEA8 ? document : new TDataDocument();


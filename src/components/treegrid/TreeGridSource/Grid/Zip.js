MS.Import$Export;
// -----------------------------------------------------------------------------------------------------------
var CExtStr = {"xml":1,"rels":1}, CExtXml = CExtStr;
// -----------------------------------------------------------------------------------------------------------
function LoadZip(data,func,dir){
if(!window.JSZip) { if(!func) return []; func(); return; }
var Z = new JSZip(), F = {}, cnt = 1, len = 0, base64 = typeof(data)=="string";
function save(name,dir,val){ 
   if(dir){
      var N = name.split(/[\/\\]/), f = F;
      for(var i=0;i<N.length-1;i++) { if(!f[N[i]]) f[N[i]] = {}; f = f[N[i]]; }
      f[N[i]] = val; 
      }
   else F[name] = val;
   if(!--cnt) func(F,len); 
   }
if(Z.loadAsync){
   Z.loadAsync(data,base64?{"base64":true}:null).then(function(Z){
      for(var n in Z.files) {
         var f = Z.files[n], ff = f.name.replace(/^.*\./,"");
         if(f.dir) continue;
         cnt++; len++;
         f.async(CExtStr[ff]?"string":"base64").then(save.bind(null,n,dir));
         }
      if(!--cnt) func(F,len);
      }, function(err){ if(func) func(null,err); });
   }
else if(Z.load){
   cnt = 1e10;
   try { Z.load(data,base64?{"base64":true}:null); } catch(e) { if(func) func(null,e); else return [null,e]; }
   for(var n in Z.files) {
      var f = Z.files[n], ff = f.name.replace(/^.*\./,"");
      len++;
      try { save(f.name,dir,CExtStr[ff]?f.asText():ToBase64(f.asUint8Array())); } catch(e){ if(func) func(null,e); else return [null,e]; }
      }
   if(func) func(F,len); else return [F,len];
   }
else { if(!func) return []; func(); return; } 
}
// -----------------------------------------------------------------------------------------------------------
function SaveZip(files,func,base64,level,mime){
var Z = window.JSZip ? new JSZip() : window.TGZip ? new TGZip() : {}; 
if(!Z.file) { NoModule("Zip"); if(!func) return []; func(); return; }
function add(F,path){
   for(var n in F){
      if(typeof(F[n])=="string") {
         var e = n.replace(/^.*\./,"");
         Z.file(path+n,F[n],{"base64":!CExtStr[e]});
         }
      else add(F[n],path+n+"/");
      }
   }
add(files,"");
var opt = {"type":base64?"base64":"blob","mimeType":mime?mime:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","compression":level==0||!window.JSZip?"STORE":"DEFLATE","compressionOptions":{"level":level?level:1}}; 
if(Z.generateAsync){
   Z.generateAsync(opt).then(function(data){ func(data); },function(e){ func(null,e); })
   }
else if(Z.generate){
   try { var data = Z.generate(opt); if(func) func(data); else return [data]; }
   catch(e) { if(!func) return [null,e]; func(null,e); return; }
   }
else { if(!func) return []; func(); return; } 
}
// -----------------------------------------------------------------------------------------------------------
ME.Import$Export;

MS.Export;
MS.Zip;
// -----------------------------------------------------------------------------------------------------------
function TGZip() {
if(!(this instanceof TGZip)) return new TGZip();
this.files = {}; this.root = '';
this.compressionMethodMagic = "\x00\x00";
}
// -----------------------------------------------------------------------------------------------------------
TGZip.prototype.file = function (name,data,opts) {
name = this.root + name;
if(!opts) opts = {};
if (opts.base64 && (opts.binary === null || opts.binary === undefined)) opts.binary = true;
this.files[name] = { name: name, dir: false, date: new Date(), dosPermissions: opts.dosPermissions || null, options: opts, _data: data };
return this;
};
// -----------------------------------------------------------------------------------------------------------
TGZip.prototype.generate = function (opts) {
if(!opts) opts = {};
if(!opts.type) opts.type = 'base64';
if(!opts.compression) opts.compression = 'STORE';
if(!opts.mimeType) opts.mimeType = 'application/zip';
if(opts.base64 === undefined) opts.base64 = true;
if(opts.compression !== 'STORE') throw new Error('TGZip: compression method ' + opts.compression + ' is not supported, use STORE');
if(opts.type !== 'base64' && opts.type !== 'blob') throw new Error('TGZip: "' + opts.type + '" type is not supported, use "blob" or "base64"');
var zipParts = [], localDirLength = 0, centralDirLength = 0;
for(var name in this.files) {
   if(!this.files.hasOwnProperty(name)) continue;
   var file = this.files[name];
   var content = !file._data || file._data.length === 0 || file.dir ? '' : file._data;
   if(content !== '') {
      if(file.options.base64) content = FromBase64(content,1);
      if(!file.options.binary) content = TransformTo('string', UTF8encode(content));
      }
   var compressedObject = { uncompressedSize: content.length, crc32: Crc32(content), compressedContent: content, compressedSize: content.length, compressionMethod: this.compressionMethodMagic };
   var zipPart = this.generateZipParts(file,compressedObject,localDirLength);
   localDirLength += zipPart.fileRecord.length + compressedObject.compressedSize;
   centralDirLength += zipPart.dirRecord.length;
   zipParts.push(zipPart);
   }
var dirEnd = Signature.CENTRAL_DIRECTORY_END 
   + "\x00\x00" 
   + "\x00\x00" 
   + DecToHex(zipParts.length, 2) 
   + DecToHex(zipParts.length, 2) 
   + DecToHex(centralDirLength, 4) 
   + DecToHex(localDirLength, 4) 
   + "\x00\x00" 
var zipData = [];
for(var i=0;i<zipParts.length;i++) { zipData.push(zipParts[i].fileRecord); zipData.push(zipParts[i].compressedObject.compressedContent); }
for(var i=0;i<zipParts.length;i++) zipData.push(zipParts[i].dirRecord);
zipData.push(dirEnd);
var zip = zipData.join('');
if (opts.type === 'blob') return ArrayBufferToBlob(TransformTo('arraybuffer', zip), opts.mimeType);
else if (opts.type === 'base64') return (opts.base64) ? ToBase64(zip) : zip;
else return zip;
}
// -----------------------------------------------------------------------------------------------------------
TGZip.prototype.generateZipParts = function(file, compressedObject, offset) {
var dosTime, dosDate, dir = file.dir, date = file.date;

var extFileAttr = 0 != (dir ? 0x00010 : (file.dosPermissions || 0)  & 0x3F), versionMadeBy = 0x0014; 
dosTime = date.getHours(); dosTime = dosTime << 6; dosTime = dosTime | date.getMinutes(); dosTime = dosTime << 5; dosTime = dosTime | date.getSeconds() / 2;
dosDate = date.getFullYear() - 1980; dosDate = dosDate << 4; dosDate = dosDate | (date.getMonth() + 1); dosDate = dosDate << 5; dosDate = dosDate | date.getDate();
var header = "\x0A\x00" 
   + "\x00\x00" 
   + compressedObject.compressionMethod
   + DecToHex(dosTime, 2) + DecToHex(dosDate, 2) 
   + DecToHex(compressedObject.crc32, 4)
   + DecToHex(compressedObject.compressedSize, 4)
   + DecToHex(compressedObject.uncompressedSize, 4)
   + DecToHex(file.name.length, 2)
   + "\x00\x00"; 
var fileRecord = Signature.LOCAL_FILE_HEADER + header + file.name; 
var dirRecord = Signature.CENTRAL_FILE_HEADER
   + DecToHex(versionMadeBy, 2) 
   + header 
   + "\x00\x00" 
   + "\x00\x00" 
   + "\x00\x00" 
   + DecToHex(extFileAttr, 4)
   + DecToHex(offset, 4) 
   + file.name
   
return { fileRecord: fileRecord, dirRecord: dirRecord, compressedObject: compressedObject };
}
// -----------------------------------------------------------------------------------------------------------
var GetTypeOf = function (input) {
if (typeof input === 'string') return 'string';
if (Object.prototype.toString.call(input) === '[object Array]') return 'array';
if (window.Uint8Array && input instanceof window.Uint8Array) return 'uint8array';
}
// -----------------------------------------------------------------------------------------------------------
var TransformTo = function (outputType, input) {
var inputType = GetTypeOf(input);
if(!outputType) return input;
return Transform[inputType][outputType](input);
};
// -----------------------------------------------------------------------------------------------------------
var Transform = {
   'string': {
      'string': function (input) { return input; },
      'arraybuffer': function (input) { return Transform['string']['uint8array'](input).buffer; },  
      'uint8array': function (input) { return StringToArrayLike(input, new window.Uint8Array(input.length)); },
      'utf8array': function (input) { return StringToArrayUTF8(input, new window.Uint8Array(input.length)); }
      },
   'array': {
      'string': ArrayLikeToString,
      'array': function (input) { return input; },
      'uint8array': function(input) { return new window.Uint8Array(input); } 
      },
   'uint8array': {
      'string': ArrayLikeToString,
      'arraybuffer': function (input) { return input.buffer; }, 
      'uint8array': function (input) { return input; }
      }
   }
// -----------------------------------------------------------------------------------------------------------
function DecToHex(dec, bytes) {
for (var i=0,hex="";i<bytes;i++) { hex += String.fromCharCode(dec&0xff); dec = dec >>> 8; }
return hex;
}
// -----------------------------------------------------------------------------------------------------------
function StringToArrayLike(s,A) {
for(var i=0;i<s.length;i++) A[i] = s.charCodeAt(i)&0xFF;
return A;
}
// -----------------------------------------------------------------------------------------------------------
function StringToArrayUTF8(s,A) {
var p = 0, i = 0;
if(s.charCodeAt(0)==1){ A[p++] = 0xEF; A[p++] = 0xBB; A[p++] = 0xBF; i++; }
for(;i<s.length;i++) {
   var c = s.charCodeAt(i);
   if(c<0x80) A[p++] = c;
   else if(c<0x800) { A[p++] = 0xc0|(c>>6); A[p++] = 0x80|(c&0x3f); }
   else if(c<0xd800||c>=0xe000) { A[p++] = 0xe0|(c>>12); A[p++] = 0x80|((c>>6)&0x3f); A[p++] = 0x80|(c&0x3f); }
   else {
      i++;
      c = ((c&0x3ff)<<10)|(s.charCodeAt(i)&0x3ff);
      A[p++] = 0xf0|(c>>18); A[p++] = 0x80|((c>>12)&0x3f); A[p++] = 0x80|((c>>6)&0x3f); A[p++] = 0x80|(c&0x3f);
      }
   }
return A;
}
// -----------------------------------------------------------------------------------------------------------
function ArrayLikeToString(array) {
var chunk = 65536, result = [], len = array.length, type = GetTypeOf(array), k = 0, canUseApply = true;
try { if(type==='uint8array') String.fromCharCode.apply(null, new window.Uint8Array(0)); } 
catch(e) { canUseApply = false; }

if(!canUseApply) {
   for(var i=0,resultStr='';i<array.length;i++) resultStr += String.fromCharCode(array[i]); 
   return resultStr;
   }
while(k<len&&chunk>1){
   try {
      if(type==='array'||type==='nodebuffer') result.push(String.fromCharCode.apply(null,array.slice(k, Math.min(k + chunk, len))));
      else result.push(String.fromCharCode.apply(null,array.subarray(k,Math.min(k+chunk,len))));
      k += chunk;
      }
   catch (e) { chunk = Math.floor(chunk / 2); } 
   }
return result.join('');
}
// -----------------------------------------------------------------------------------------------------------
function UTF8encode(str) {
var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

for(m_pos=0;m_pos<str_len;m_pos++) {
   c = str.charCodeAt(m_pos);
   if((c&0xfc00)===0xd800 && (m_pos+1<str_len)) {
      c2 = str.charCodeAt(m_pos+1);
      if((c2&0xfc00)===0xdc00) { c = 0x10000+((c-0xd800)<<10)+(c2-0xdc00); m_pos++; }
      }
   buf_len += c<0x80 ? 1 : c<0x800 ? 2 : c<0x10000 ? 3 : 4;
   }

buf = window.Uint8Array ? new window.Uint8Array(buf_len) : new Array(buf_len);

for(i=0,m_pos=0;i<buf_len;m_pos++) {
   c = str.charCodeAt(m_pos);
   if((c&0xfc00)===0xd800&&(m_pos+1<str_len)){
      c2 = str.charCodeAt(m_pos+1);
      if((c2&0xfc00)===0xdc00) { c = 0x10000+((c-0xd800)<<10)+(c2-0xdc00); m_pos++; }
      }
   if(c<0x80) buf[i++] = c;  
   else if(c<0x800) { buf[i++] = 0xC0 | (c >>> 6); buf[i++] = 0x80 | (c & 0x3f); }  
   else if (c < 0x10000) { buf[i++] = 0xE0 | (c >>> 12); buf[i++] = 0x80 | (c >>> 6 & 0x3f); buf[i++] = 0x80 | (c & 0x3f); }  
   else { buf[i++] = 0xf0 | (c >>> 18); buf[i++] = 0x80 | (c >>> 12 & 0x3f); buf[i++] = 0x80 | (c >>> 6 & 0x3f); buf[i++] = 0x80 | (c & 0x3f); } 
   }
return buf;
}
// -----------------------------------------------------------------------------------------------------------
var Signature = {
    LOCAL_FILE_HEADER: "PK\x03\x04",
    CENTRAL_FILE_HEADER: "PK\x01\x02",
    CENTRAL_DIRECTORY_END: "PK\x05\x06",
    ZIP64_CENTRAL_DIRECTORY_LOCATOR: "PK\x06\x07",
    ZIP64_CENTRAL_DIRECTORY_END: "PK\x06\x06",
    DATA_DESCRIPTOR: "PK\x07\x08"
};
// -----------------------------------------------------------------------------------------------------------
var CCrc32 = [
    0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA, 0x076DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3, 0x0EDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988, 0x09B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91,
    0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE, 0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7, 0x136C9856, 0x646BA8C0, 0xFD62F97A, 0x8A65C9EC, 0x14015C4F, 0x63066CD9, 0xFA0F3D63, 0x8D080DF5,
    0x3B6E20C8, 0x4C69105E, 0xD56041E4, 0xA2677172, 0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B, 0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940, 0x32D86CE3, 0x45DF5C75, 0xDCD60DCF, 0xABD13D59,
    0x26D930AC, 0x51DE003A, 0xC8D75180, 0xBFD06116, 0x21B4F4B5, 0x56B3C423, 0xCFBA9599, 0xB8BDA50F, 0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924, 0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D,
    0x76DC4190, 0x01DB7106, 0x98D220BC, 0xEFD5102A, 0x71B18589, 0x06B6B51F, 0x9FBFE4A5, 0xE8B8D433, 0x7807C9A2, 0x0F00F934, 0x9609A88E, 0xE10E9818, 0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01,
    0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E, 0x6C0695ED, 0x1B01A57B, 0x8208F4C1, 0xF50FC457, 0x65B0D9C6, 0x12B7E950, 0x8BBEB8EA, 0xFCB9887C, 0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3, 0xFBD44C65,
    0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2, 0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB, 0x4369E96A, 0x346ED9FC, 0xAD678846, 0xDA60B8D0, 0x44042D73, 0x33031DE5, 0xAA0A4C5F, 0xDD0D7CC9,
    0x5005713C, 0x270241AA, 0xBE0B1010, 0xC90C2086, 0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F, 0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4, 0x59B33D17, 0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD,
    0xEDB88320, 0x9ABFB3B6, 0x03B6E20C, 0x74B1D29A, 0xEAD54739, 0x9DD277AF, 0x04DB2615, 0x73DC1683, 0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8, 0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1,
    0xF00F9344, 0x8708A3D2, 0x1E01F268, 0x6906C2FE, 0xF762575D, 0x806567CB, 0x196C3671, 0x6E6B06E7, 0xFED41B76, 0x89D32BE0, 0x10DA7A5A, 0x67DD4ACC, 0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5,
    0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252, 0xD1BB67F1, 0xA6BC5767, 0x3FB506DD, 0x48B2364B, 0xD80D2BDA, 0xAF0A1B4C, 0x36034AF6, 0x41047A60, 0xDF60EFC3, 0xA867DF55, 0x316E8EEF, 0x4669BE79,
    0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236, 0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F, 0xC5BA3BBE, 0xB2BD0B28, 0x2BB45A92, 0x5CB36A04, 0xC2D7FFA7, 0xB5D0CF31, 0x2CD99E8B, 0x5BDEAE1D,
    0x9B64C2B0, 0xEC63F226, 0x756AA39C, 0x026D930A, 0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713, 0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38, 0x92D28E9B, 0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21,
    0x86D3D2D4, 0xF1D4E242, 0x68DDB3F8, 0x1FDA836E, 0x81BE16CD, 0xF6B9265B, 0x6FB077E1, 0x18B74777, 0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C, 0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45,
    0xA00AE278, 0xD70DD2EE, 0x4E048354, 0x3903B3C2, 0xA7672661, 0xD06016F7, 0x4969474D, 0x3E6E77DB, 0xAED16A4A, 0xD9D65ADC, 0x40DF0B66, 0x37D83BF0, 0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9,
    0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6, 0xBAD03605, 0xCDD70693, 0x54DE5729, 0x23D967BF, 0xB3667A2E, 0xC4614AB8, 0x5D681B02, 0x2A6F2B94, 0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B, 0x2D02EF8D ];

function Crc32(input,crc) {
if(!input||!input.length) return 0;
var isArray = typeof(input)!="string";
if(!crc) crc = 0;
var x = 0, y = 0, b = 0;
crc = crc ^ (-1);
for(var i=0,iTop=input.length;i<iTop;i++) {
   b = isArray ? input[i] : input.charCodeAt(i);
   y = (crc ^ b) & 0xFF;
   x = CCrc32[y];
   crc = (crc >>> 8) ^ x;
   }
return crc ^ (-1);
}
// -----------------------------------------------------------------------------------------------------------
function ArrayBufferToBlob(buffer, mimeType) {
if(!mimeType) mimeType = 'application/zip';
try { return new Blob([buffer], { type: mimeType }); }
catch (e) {
   try {
      var Builder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
      var builder = new Builder();
      builder.append(buffer);
      return builder.getBlob(mimeType);
      }
   catch (e) { throw new Error('TGZip: your browser does not support Blob object.'); }
   }
}
// -----------------------------------------------------------------------------------------------------------
ME.Zip;
ME.Export;

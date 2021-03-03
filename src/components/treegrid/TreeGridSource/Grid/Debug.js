MS.Debug;
// -----------------------------------------------------------------------------------------------------------
// Prints to debug window all attribute from [1]
// Attributes [2],[4],[6],... writes with class Mark
// typ&15 is 0 stop, 1 error, 2 warning, 3 list, 4 info, 14 br, 15 hr
// typ = 16 <span>, 0 <div>
// typ = 32 nothing, 0 title
// typ = 64 no escape, no add semicolon, 0 escape a for span adds semicolon
TGP.Debug = function(typ){
var lev = typ&15, dbg = this.DebugFlags;
if(Grids.OnDebug && Grids.OnDebug(this,lev,arguments)) return;
if(lev<=1 && !dbg["error"] || lev==2 && !dbg["problem"] || lev==4 && !dbg["info"]) return;
var D = this.DebugInfo, prefix = "GridDebug"; 
if(this.DebugWin && this.DebugWin.closed) D = null;
try { D.document; } catch(e) { D = null; } 
if(!D){
   var name = this.DebugTag;
   if(name) {
      D = GetElem(name);
      if(!D) {
         if(!window.console) return;
         var str = "", A = arguments;
         for(var i=1;i<A.length;i++) if(A[i]!=null) str += A[i];
         console[typ==0||typ==1?"error":(typ==2?"warn":(typ==4?"info":"log"))]("TreeGrid["+this.Index+"] \""+this.id+"\" : "+str);
         return;
         }
      }
   else {   
      name = "_TreeGridDebug";
      D = GetElem(name);
      if(!D){
         if(this.DebugWindow){
            try {
               var w = window.open("",this.DebugWindow);
               if(w){ 
                  if(!w.document.body || w.document.body.childNodes.length<2){
                     w.document.open();
                     w.document.write("<html><head><style type='text/css'>\n.GridDebugTitle { font-size:10px; color:blue; font-style:normal;font-weight:normal; }\n.GridDebugMark { font-weight:bold; }\n.GridDebugStop { font-size:18px; font-weight:bold; color:red; }\n.GridDebugError { font-size:12px; color:red; }\n.GridDebugWarning { font-size:12px; color:#A60;}\n.GridDebugList { font-size:10px; color:#888;}\n.GridDebugInfo { font-size:12px; }\n</style></head><body><div></div></body></html>");
                     w.document.close();
                     }
                  D = w.document.body.firstChild;
                  this.DebugDoc = w.document;
                  this.DebugWin = w;
                  }
               }   
            catch(e) { }   
            }
         if(!D) { 
            D = document.createElement("div");
            D.id = name;
            D.className = prefix+"Tag";
            D.Max = 0;
            D.onmousewheel = CancelPropagation;
            
            AppendTag(D); 
            
            var B = document.createElement("div");
            B.id = name+"Buttons";
            B.className = prefix+"Buttons";
            B.innerHTML = 
                 "<button class='"+prefix+"Button' id='"+name+"Max' onclick=\"var D=document.getElementById('"+name+"'),max=D.Max;D.Max=!max;for(var i=0;i&lt;2;i++,D=D.nextSibling) if(max) D.className=D.className.replace(/Max$/,''); else D.className=D.className+'Max';this.innerHTML=max?'Max':'Normal'\">Max</button>"
               + "<button class='"+prefix+"Button' onclick=\"document.getElementById('"+name+"').innerHTML='';\">Clear</button>"
               + "<button class='"+prefix+"Button' onclick=\"document.getElementById('"+name+"').style.display='none';document.getElementById('"+name+"Buttons').style.display='none';TGGrids.DebugHidden=1;\">Close</button>";
            AppendTag(B); 
            }
         }
      }
   this.DebugInfo = D;
   }
if(!Grids.DebugHidden) { D.style.display = ""; if(D.id=="_TreeGridDebug") D.nextSibling.style.display=""; }
if(D.scrollHeight>100000) D.innerHTML = "<div><i style='color:gray;'>Debug cleared, because of too much information here</i></div>";
var doc = this.DebugDoc ? this.DebugDoc : document;
var str = "", A = arguments;
for(var i=1;i<A.length;i++){
   var s = A[i]; if(!(typ&64)) s = PFormat.Escape(s).replace(/\n/g,"<br/>");
   if(i%2) str += s;
   else str += "<span class='"+prefix+"Mark'>" + s + "</span>";
   }
if(A.length>1){
   var T = doc.createElement(typ&16?"span":"div");
   T.innerHTML = (typ&32 ? "" : "<span class='"+prefix+"Title'>["+this.Index+"] "+this.id+": </span>") + str + ((typ&80)==16?"; ":"");
   T.className = prefix+(lev>3?"Info":["Stop","Error","Warning","List"][lev]);
   T.style.overflow="hidden"; 
   D.appendChild(T);
   }
if(lev==14) D.appendChild(doc.createElement("br"));
if(lev==15) D.appendChild(doc.createElement("hr"));  
D.scrollTop = 100000;
if(BIEA) D.scrollHeight;

}
// -----------------------------------------------------------------------------------------------------------
// Complete debug print of cookie
TGP.DebugCookie = function(cfg){
MS.Cfg;
if(!this.DebugFlags["cookie"]) return;
var E, Cfg = this.Saver; if(!Cfg) { Cfg = new TCfg(); this.Saver = Cfg; }
Cfg.Data = cfg;
var ver = Cfg.GetInt();
if(this.Version && ver!=parseInt(this.Version)){ 
   this.Debug(3,"Data version (",this.Version,") is not the same as saved configuration version (",ver,"), saved configuration is deleted and default values from XML are used");
   return;
   }
this.Debug(15);
this.Debug(35,"Cookie: "+cfg);
this.Debug(51,"Base settings: id:",this.CfgId?this.CfgId:this.id," Version:",ver);
var X1=Cfg.GetInt6(),X2=Cfg.GetInt6(),X3=Cfg.GetInt6(),X4=Cfg.GetInt6(), X5=Cfg.GetInt6(), X6=Cfg.GetInt6(),X7=0,X8=0,X9=0,X10=0,X11=0,X12=0;
if(X6&32) { X7 = Cfg.GetInt6(); X8 = Cfg.GetInt6(); }
if(X8&32) { X9 = Cfg.GetInt6(); X10 = Cfg.GetInt6(); }
if(X10&32){ X11 = Cfg.GetInt6(); X12 = Cfg.GetInt6(); }
   
// --- Cfg ---
this.Debug(51,"ShowDeleted=",this["ShowDeletedLap"]?"#":(X1&1 ? 1 : 0));

this.Debug(51,"Sorted=",this["SortedLap"]?"Lap":(X1&2 ? 1 : 0));
this.Debug(51,"AutoSort=",this["AutoSortLap"]?"Lap":(X1&4 ? 1 : 0));
this.Debug(51,"Calculated=",this["CalculatedLap"]?"Lap":(X1&8 ? 1 : 0));
this.Debug(51,"AutoUpdate=",this["AutoUpdateLap"]?"Lap":(X1&16 ? 1 : 0));
this.Debug(51,"Panel.Visible=",this["HidePanelLap"] || this.Cols.Panel["VisibleLap"]?"Lap":(X1&32 ? 0 : 1));
this.Debug(51,"ShowDrag=",this["ShowDragLap"]?"Lap":(X2&1 ? 1 : 0));

this.Debug(51,"AllPages=",this["AllPagesLap"]?"Lap":(X2&4 ? 1 : 0));
this.Debug(51,"Hover=",this["HoverLap"]?"Lap":((X2>>3)&3));
this.Debug(51,"SortIcons=",this["SortIconsLap"]?"Lap":X3&3);
this.Debug(51,"ReversedTree=",this["ReversedTreeLap"]?"Lap":X10&2 ? 1 : 0);
this.Debug(51,"ShowButtons=",this["ShowButtonsLap"]?"Lap":(X10&12)>>2);
this.Debug(51,"SuppressAnimations=",this["SuppressAnimationsLap"]?"Lap":X11&2 ? 1 : 0);
this.Debug(51,"ShrinkStyle=",this["ShrinkStyleLap"]?"Lap":X12&3);
this.Debug(51,"DefaultBorder=",this["DefaultBorderLap"]?"Lap":X11&32);
this.Debug(51,"FormulaTip=",this["FormulaTipLap"]?"Lap":X12&4);
if(X9&8) this.Debug(51,"CustomCookie= ",Cfg.GetString());

if(X2&32){ E = Cfg.GetInt(); MS.Pager; if(!this["PagerWidthLap"] && this.Pagers[0]) this.Debug(51,"PagerWidth=",this["PagerWidthLap"]||this.Pagers[0]["WidthLap"]?"Lap":E<10?10:E); ME.Pager; } 
if(X9&32){ 
   var len = Cfg.GetInt();
   for(var i=0;i<len;i++){
      var n = Cfg.GetString(), v = Cfg.GetInt(), w = Cfg.GetInt();
      var P = this.Pagers[n]; if(!P && this.Pager.Name==n) P = this.Pager;
      if(P) this.Debug(51,"Pager '",n,"' Width=",this["PagerWidthLap"] || P["WidthLap"] ? "Lap" : w,", Visible=",this["ShowPagerLap"] && P["VisibleLap"] ? "Lap" : v);
      }
   }
else if(!this["ShowPagerLap"] && this.Pagers[0] && !this.Pagers[0]["VisibleLap"]) this.Pagers[0].Visible = X2&2 ? 1 : 0; 

if(X3&4){ E = Cfg.GetInt(); this.Debug(51,"CheckInterval=",this["CheckIntervalLap"]?"Lap":E); }
if(X3&8) {
   var w = Cfg.GetInt(), h = Cfg.GetInt();
   this.Debug(51,"Main tag size=",this["ResizingMainLap"]?"Lap":w+","+h);
   }
      
// --- Style ---
if(X6&8||X11&12){
   var s, gs = null, size, scale;
   if(X6&8) { s = Cfg.GetString(); this.Debug(51,"Style=",this["StyleLap"]?"Lap":s); if(X11&16) { gs = Cfg.GetString(); this.Debug(51,"GanttStyle=",this["StyleLap"]?"Lap":gs); } }
   if(X11&4) { size = Cfg.GetString(); this.Debug(51,"Size=",this["SizeLap"]?"Lap":size); }
   if(X11&8) { scale = Cfg.GetString(); this.Debug(51,"Scale=",this["ScaleLap"]?"Lap":scale); }
   }
   
// --- Sort ---
if(X6&16){
   this.Debug(14);
   if(X3&16){
      if(this["SortColsLap"] || this["SortLap"]) { this.Debug(115,"Sorting setting is ignored: "); Cfg.GetString(); }
      else this.Debug(115,"Sorting setting is used: ",Cfg.GetString().replace(/@/g,","),". ");
      }
   else this.Debug(115,"No sorting setting present");

   // --- Group ---
   this.Debug(14);
   if(X3&32){
      if(this["GroupColsLap"] || this["GroupLap"]) { this.Debug(115,"Grouping setting is ignored: "); Cfg.GetString(); }
      else this.Debug(115,"Grouping setting is used: ",Cfg.GetString().replace(/@/g,","),". ");
      }
   else this.Debug(115,"No grouping setting present. ");   
   this.Debug(51,"Grouped=",this["GroupedLap"]?"Lap":(X6&1 ? 0 : 1));
   }
   
// --- Filters ---
var cnt = (X4>>1)&3, F = this.GetFilterRows();
if(F.length) this.Debug(14);
if(cnt){
   if(this["FilterLap"]) this.Debug(115,"Filter setting is ignored: ");
   else this.Debug(115,"Filter setting is used: ");
   var Op = ["","==","!=","<","<=",">",">=","*|","x|","|*","|x","*|*","x|x"];
   for(var i=0;i<cnt;i++){
      while(Cfg.Data && Cfg.Data.charAt(0)!='+'){
         var op = Cfg.GetInt6(), col = Cfg.GetString(op&3), val = Cfg.GetString();
         this.Debug(51,"[",col," ",Op[op>>2]," ",val,"]");
         }
      Cfg.Data = Cfg.Data.slice(1); 
      }
   }
else if(F.length) this.Debug(115,"No filter setting present. ");
if(F.length) this.Debug(51,"Filtered=",this["FilteredLap"]?"Lap":(X6&2 ? 0 : 1));

// --- Custom filters ---
if(X8&2){
   this.Debug(14);
   var cnt = Cfg.GetInt();
   for(var i=0;i<cnt;i++) { 
      var n = Cfg.GetString(), f = Cfg.GetString(), c = Cfg.GetString();
      this.Debug(51,"Custom filter: Name=",n,+", Col=",c,", Filter=",f);
      }
   }

// --- Search ---
if(X5&31){
   this.Debug(14); 
   this.Debug(115,"Search settings: ");
   if(X5&1){
      var a = Cfg.GetInt6(), A = ["","Filter","Select","Mark","Find","FindPrev"];
      this.Debug(51,"SearchAction=",(a&7)==7 ? Cfg.GetString() : A[a&7]);
      this.Debug(51,"SearchMethod=",a>>3);
      }
   if(X5&2) this.Debug(51,"SearchExpression=",Cfg.GetString());
   if(X5&4) {
      var a = Cfg.GetInt();
      this.Debug(51,"SearchCaseSensitive=",a&4?1:0);
      this.Debug(51,"SearchCells=",a&1?1:0);
      }
   if(X5&8) this.Debug(51,"SearchDefs=",Cfg.GetString());
   if(X5&16) this.Debug(51,"SearchCols=",Cfg.GetString());
   this.Debug(51,"Searched=",this["SearchedLap"]?"Lap":(X6&4 ? 0 : 1));
   }

// --- Pivot ---
if(X10&1){
   this.Debug(14);
   this.Debug(115,"Pivot settings: ");
   this.Debug(51,"PivotRows=",Cfg.GetString());
   this.Debug(51,"PivotCols=",Cfg.GetString());
   this.Debug(51,"PivotData=",Cfg.GetString());
   var opt = Cfg.GetInt();
   this.Debug(51,"PivotShowParent=",opt&1);
   this.Debug(51,"PivotFilter=",(opt&6)>>1);
   if(this.PivotControlMaster){
      this.Debug(51,"MasterVisible=",opt&8?1:0);
      this.Debug(51,"PivotVisible=",opt&16?1:0);
      }
   }

// --- Gantt ---
if(X7&1){
   this.Debug(14);
   this.Debug(115,"Gantt settings: "); 
   this.Debug(51,"GanttHideExclude=",Cfg.GetInt());
   this.Debug(51,"GanttResources=",Cfg.GetString());
   this.Debug(51,"GanttZoom=",Cfg.GetString());
   this.Debug(51,"GanttWidth=",Cfg.GetString());
   this.Debug(51,"GanttCorrectDependencies=",Cfg.GetInt());
   this.Debug(51,"GanttCheckDependencies=",Cfg.GetInt());
   var gs = Cfg.GetInt(), gce = Cfg.GetInt(), gds = Cfg.GetInt();
   this.Debug(51,"GanttStrict=",gs&1+((gds>>2)&2));
   this.Debug(51,"GanttBaseProof=",(gs>>1)&1);
   this.Debug(51,"GanttBasePreferred=",(gs>>2)&1);
   this.Debug(51,"GanttFinishProof=",(gs>>4)&1);
   this.Debug(51,"GanttFinishPreferred=",(gs>>5)&1);
   this.Debug(51,"GanttCheckExclude=",gce&3);
   if(X8&32) this.Debug(51,"GanttCheck ask=",(gce>>2)&1);
   this.Debug(51,"GanttCorrectDependenciesFixed=",gds&1);
   this.Debug(51,"GanttFixComplete=",(gds>>1)&1);
   this.Debug(51,"GanttDirection=",(gds>>2)&1);
   if(X7&32) { this.Debug(51,"GanttMinSlack=",Cfg.GetInt()); this.Debug(51,"GanttErrSlack=",Cfg.GetInt()); }
   this.Debug(51,"GanttSeparateSlack=",(gs>>3)&1);
   if(X8&32) this.Debug(51,"GanttZoomDate=",this.Lang.Format.DateToString(Cfg.GetString()-0));
   }

// --- Scroll ---
if(X7&6) { this.Debug(14); this.Debug(115,"Scroll position: ");  }
if(X7&2) this.Debug(51,"ScrollLeft= ",Cfg.GetInt()); 
if(X7&8) { this.Debug(51,"LeftScrollLeft= ",Cfg.GetInt()); this.Debug(51,"RightScrollLeft= ",Cfg.GetInt()); }
if(X7&4) this.Debug(51,"ScrollTop= ",Cfg.GetInt()); 

if(X7&16) {
   this.Debug(14); this.Debug(115,"Section sizes: ");   
   this.Debug(51,"LeftWidth= ",Cfg.GetInt()); this.Debug(51,"MidWidth= ",Cfg.GetInt()); this.Debug(51,"RightWidth= ",Cfg.GetInt());
   }
if(X9&4) {
   this.Debug(51,"CustomScroll= ",Cfg.GetInt());
   if(BTablet && this.ScrollAction!=null) this.Debug(51,"ScrollAction= ",Cfg.GetInt());
   }

if(X8&1){
   var v = Cfg.GetInt(),vr = Cfg.GetInt();
   this.Debug(14); this.Debug(115,"Print options: ");
   this.Debug(51,"PrintPageSize= ",v&31);
   this.Debug(51,"PrintPageOrientation= ",(v/32)&3);
   this.Debug(51,"PDFFitPage= ",(v/128)&3);
   this.Debug(51,"PDFText= ",(v/512)&3);
   this.Debug(51,"PrintExpanded= ",(v/2048)&1);
   this.Debug(51,"PrintFiltered= ",(v/4096)&1);
   this.Debug(51,"PrintPageBreaks= ",(v/8192)&1);
   this.Debug(51,"PrintVisible= ",(v/16384)&1);
   this.Debug(51,"PrintRows= ",vr);
   if(X9&16) {
      this.Debug(51,"PrintMarginWidth=",Cfg.GetInt());
      this.Debug(51,"PrintMarginHeight=",Cfg.GetInt());
      this.Debug(51,"PrintDPI=",Cfg.GetInt());
      this.Debug(51,"PrintPageWidth=",Cfg.GetInt()); 
      this.Debug(51,"PrintPageHeight=",Cfg.GetInt());
      this.Debug(51,"PrintPageRoot= ",(v/32768)&1);
      this.Debug(51,"PrintSelected= ",(v/65536)&1);
      }
   if(X10&32) { var f = Cfg.GetString(); var n = Cfg.GetString(); this.Debug(51,"PDFFormat= ",f); this.Debug(51,"PDFName= ",n); }
   }

// --- Export ---
if(X8&4){
   var v = Cfg.GetInt();
   this.Debug(14); this.Debug(115,"Export options: ");
   this.Debug(51,"ExportFormat= ",v&7);
   this.Debug(51,"ExportExpanded= ",v&8?1:0);
   this.Debug(51,"ExportFiltered= ",v&8?1:0);
   this.Debug(51,"ExportOutline= ",v&8?1:0);
   this.Debug(51,"ExportIndent= ",v&8?1:0);
   if(X10&32) { var f = Cfg.GetString(); var n = Cfg.GetString(); this.Debug(51,"ExportFormat= ",f); this.Debug(51,"ExportName= ",n); }
   }   

// --- Cols 7.x ---
if(X8&8){
   this.Debug(14);
   if(this["ColsLap"]) this.Debug(115,"Columns settings are ignored: ");
   else this.Debug(115,"Columns settings are used: ");
   var w = 0, C = this.Cols;
   for(var i=0;i<3;i++){
      var p = 0;
      while(Cfg.Data && Cfg.Data.charAt(0)!='+'){
         var typ = Cfg.GetInt6(), col = Cfg.GetString(typ>>3);
         var xw = typ&3, W = xw==1 ? -Cfg.GetInt() : (xw==2 ? Cfg.GetInt() : 0);
         var explev = X8&16 ? Cfg.GetInt() : null;
         w += W;
         var c = C[col]; 
           if(c) this.Debug(51,"",col,": [width:",c["WidthLap"]?"Lap":(xw==3?"auto":w),", sec:",i,", pos:",p,", visible:",c["VisibleLap"]?"Lap":(typ&4 ? 1 : 0),",expandlevel:",c["VisibleLap"]||c.ExpandLevel==null?"Lap":explev,"]");
         else this.Debug(51,"Unknown column ",col);   
         }
      Cfg.Data = Cfg.Data.slice(1); 
      }
   }

// --- Cols old ---
if(X4&8){
   this.Debug(14);
   if(this["ColsLap"]) this.Debug(115,"Columns settings are ignored: ");
   else this.Debug(115,"Columns settings are used (from 6.x version): ");
   var w=0, idx = 0; 
   while(Cfg.Data && Cfg.Data.charAt(0)!='+'){
      var typ = Cfg.GetInt6(), col = Cfg.GetString(typ&3), pos = Cfg.GetInt();
      var xw = typ&12;
      var W = xw==4 ? -Cfg.GetInt() : (xw==8 ? Cfg.GetInt() : 0);
      w+=W;
      var c = this.Cols[col];
      if(c) this.Debug(51,"",col,": [width:",c["WidthLap"]?"Lap":(xw==12?"auto":w),", pos:",this["ColsPosLap"]?"Lap":(typ&32?"mid,"+pos:(pos&1?"left,":"right,")+(pos>>1)),", visible:",c["VisibleLap"]?"Lap":(typ&16 ? 1 : 0),"]");
      else this.Debug(51,"Unknown column ",col);   
      }
   Cfg.Data = Cfg.Data.slice(1); 
   }   

// --- Expanded cells ---
if(X9&1){
   this.Debug(14); this.Debug(51,"Loaded collapsed / expanded state of all Expand cells");   
   var d = Cfg.Data.indexOf("+");
   Cfg.Data = Cfg.Data.slice(d+1); 
   var d = Cfg.Data.indexOf("+");
   Cfg.Data = Cfg.Data.slice(d+1); 
   }

// --- row Visible a ExpandLevel ---
if(X9&2){
   this.Debug(14); this.Debug(51,"Loaded Visible state of ExpandLevel rows");   
   var d = Cfg.Data.indexOf("+");
   Cfg.Data = Cfg.Data.slice(d+1); 
   }

// --- SaveVisible ---
if(X10&16){
   this.Debug(51,"Loaded Visible state of all rows");   
   var d = Cfg.Data.indexOf("+");
   Cfg.Data = Cfg.Data.slice(d+1); 
   var d = Cfg.Data.indexOf("+");
   Cfg.Data = Cfg.Data.slice(d+1); 
   }

// --- SaveExpanded ---
if(X4&16){
   this.Debug(14); this.Debug(51,"Loaded collapsed / expanded state of all rows");   
   var d = Cfg.Data.indexOf("+");
   Cfg.Data = Cfg.Data.slice(d+1); 
   var d = Cfg.Data.indexOf("+");
   Cfg.Data = Cfg.Data.slice(d+1); 
   }
      
// --- SaveSelected ---
if(X4&32){
   this.Debug(14); this.Debug(51,"Loaded selected state of all rows");   
   var d = Cfg.Data.indexOf("+");
   Cfg.Data = Cfg.Data.slice(d+1); 
   }

// --- SaveAttrs ---
if(X5&32){
   this.Debug(14); 
   var A = Cfg.GetString();
   if(A){ 
      this.Debug(115,"Custom attributes: ");   
      A = A.split('@'); 
      for(var i=0;i<A.length;i+=2){
         var val = Cfg.GetString();
         if((val-0)+""==val) val-=0;
         if(A[i]){
            var r = this.GetRowById(A[i]);
            if(r) this.Debug(51,"row[",A[i],"].",A[i+1],"=",val);   
            else this.Debug(51,"Unknown row id=",A[i]);   
            }
         else this.Debug(51,"Cfg.",A[i+1],"=",val);   
         }
      }
   else this.Debug(51,"No custom attributes saved");      
   }
      
// --- SaveValues ---
if(this.SaveValues && Cfg.Data){
   this.Debug(14); this.Debug(51,"Loaded all cell values");   
   }
this.Debug(15);  
ME.Cfg;
}
// -----------------------------------------------------------------------------------------------------------
// Checking attributes in <treegrid>/<bdo> tag
TGP.DebugTreeGrid = function(D){
if(!this.DebugFlags["error"]) return;
var DS = this.ConvertFlags(D.Source.replace(/[;+]/g,",")+","+CDataSources.join(","));
var DSAttrs = this.ConvertFlags("Url,Tag,Data,Script,Format,Bonus,Timeout,Repeat,Method,Function,Namespace,Envelope,Xml,Param,Params,Cache,Debug,AlertError,Sync,Name,Static,JavaScript,Jsonp,Relative,Header,Sheet");   
var Attrs = this.ConvertFlags("id,MainTag,Debug,DebugTag,DebugCheckIgnore,DebugWindow,Sync,Cache,CacheVersion,SuppressMessage,BasePath,AlertError,Format,Xml,Hidden,Print,Session,DebugOrig,Source,Json,is");  
for(var n in D){
   if(Attrs[n.toLowerCase()] || n=="Nested") continue;
   if(DS[n.toLowerCase()]){
      for(var m in D[n]){
         if(DSAttrs[m.toLowerCase()] || (n=="Upload"||n=="Export"||n=="ExportPDF")&&(m=="Type"||m=="Attrs"||m=="Flags") || n=="Check"&&m=="Interval" || n=="Text"&&(m=="Start"||m=="MessageWidth"||m=="StartErr"||m=="Starterr")) continue;
         this.Debug(2,"Tag <treegrid> contains unknown attribute ",n+'_'+m);
         }
      continue;
      }
   if(typeof(D[n])=="object"){ 
      for(var i in D[n]) if(D[n][i]!=null) this.Debug(2,"Tag <treegrid> contains unknown attribute ",n+'_'+i);
      }
   else this.Debug(2,"Tag <treegrid> contains unknown attribute ",n); 
   }
}
// -----------------------------------------------------------------------------------------------------------
// Print of input / output XML data
TGP.DebugData = function(D,data,mess){
if(!data || typeof(data)!="string") return;
var hr = data.length>500 || data.indexOf('\n')>=0; 
if(hr) this.Debug(15);
this.Debug(3,"AJAX for ",this.DebugDataGetName(D),", "+mess);
this.Debug(35+((data+"").search(/\<\/html\>/i)>=0?64:0),data);
if(hr) this.Debug(15);
}
// -----------------------------------------------------------------------------------------------------------
// Returns name of data source
TGP.DebugDataGetName = function(D){
if(!D || !D.Name) return "Unknown data source";
var name = D.Name;
if(D.Script) name += "_Script='"+D.Script+"'";
else if(D.Jsonp) name += "_Jsonp='"+D.Jsonp+"'";
else if(D.Url) name += "_Url='"+D.Url+"'";
else if(D.Tag) name += "_Url='"+D.Tag+"'";
else if(D.Data) name += "_Data";
else if(D.Bonus!=null) name += "_Bonus"; 
return name;
}
// -----------------------------------------------------------------------------------------------------------
// Starts given timer
TGP.StartTimer = function(name){
this.Timers[name] = (new Date()).getTime();
}
// -----------------------------------------------------------------------------------------------------------
// Interupts and returns given timer
TGP.StopTimer = function(name){
var t = this.Timers[name];
if(t==null) return null;
this.Timers[name] = (new Date()).getTime() - t;
return Math.round(this.Timers[name]/10)*10;
}
// -----------------------------------------------------------------------------------------------------------
// Continues interrupted timer
TGP.ContinueTimer = function(name){
var t = this.Timers[name];
this.Timers[name] = (new Date()).getTime() - (t?t:0);
}
// -----------------------------------------------------------------------------------------------------------
// Ends, nulls and returns given timer
TGP.EndTimer = function(name){
var t = this.Timers[name];
if(t==null) return null;
this.Timers[name] = null;
return Math.round(((new Date()).getTime()-t)/10)*10;
}
// -----------------------------------------------------------------------------------------------------------
// Returns given timer
TGP.GetTimer = function(name){
var t = this.Timers[name];
return t!=null&&t<1e12 ? Math.round(t/10)*10 : null;
}
// -----------------------------------------------------------------------------------------------------------
// Nulls and returns given timer
TGP.NullTimer = function(name){
var t = this.Timers[name];
this.Timers[name] = null;
return t!=null&&t<1e12 ? Math.round(t/10)*10 : null;
}
// -----------------------------------------------------------------------------------------------------------
// Shows debug window
TGP.ActionShowDebug = function(dummy,T){
if(T) return !!Grids.DebugHidden;
Grids.DebugHidden = 0;
this.Debug(13,"Debug shown");
}
// -----------------------------------------------------------------------------------------------------------
// Checks all attributes of all rows
// If set row, checks only its children
TGP.DebugAttributes = function(row){

var C = this.Cols, A = CDebugAttrs, B = CCellAttrs,  I = Grids.INames, X = this.DebugCheckIgnore ? (this.DebugCheckIgnore+"").split(",") : [ ];
var FN = { }, SN = { }, HN = { }, GN = { }, EN = { }, TN = { }, DGN = { }, DN = { }, BN = { }, XN = { };
if(!A.Parsed){ for(var a in A) if(A[a]) A[a] = A[a].split(","); A.Parsed = 1; }
if(!B.Parsed){ for(var a in B) if(B[a]) B[a] = B[a].split(","); B.Parsed = 1; }

var N2 = X.concat(B.Cell,B.CCell,B.CICell,B.FilterCell), N3 = B.CCellGantt, N4 = B.CCellGanttX;
if(this.ChildPaging==3) N2 = N2.concat(A.BCellICell);
var N = {}, n2 = N2.length, n3 = N3.length, n4 = N4.length, EC = C;
MS.Xlsx;
if(this.File){
   EC = {};
   for(var c in C) EC[c] = C[c];
   for(var i=1;i<100;i++) EC[GetColName(i)] = this.DefCols.Auto;
   }
ME.Xlsx;
for(var c in EC) {
   for(var i=0;i<n2;i++) N[c+N2[i]] = 1;
   if(C[c]&&C[c].Type=="Gantt") {
      for(var i=0;i<n3;i++) N[c+"Gantt"+N3[i]] = 1;
      for(var i=0;i<n4;i++) XN[c+"Gantt"+N4[i]] = 1;
      }
   if((N[c] || FN[c] || I[c]) && c!="id") this.Debug(2,"Column name ",c," conflicts with row or cell or browser attribute name");
   N[c] = 1;
   }
MS.Nested;
if(this.MasterGrid){
   for(var P=this.MasterGrid;P;P=P.MasterGrid){
      var CC = P.Cols;
      for(var c in CC) { 
         for(var i=0;i<n2;i++) N[c+N2[i]] = 1;
         if(CC[c].Type=="Gantt") {
            for(var i=0;i<n3;i++) N[c+"Gantt"+N3[i]] = 1;
            for(var i=0;i<n4;i++) XN[c+"Gantt"+N4[i]] = 1;
            }
         N[c] = 1;
         }
      }
   }
ME.Nested;
   
var N1 = X.concat(A.I,B.CICell);
for(var i=0;i<N1.length;i++) { N[N1[i]] = 1; SN[N1[i]] = 1; }

if(this.IdNames && this.IdNames!="id"){
   var ID = (this.IdNames+"").split(",");
   for(var i=0;i<ID.length;i++) N[ID[i]] = 1;
   }

var RCP = ""; for(var c in EC) RCP += c+"|";
RCP = new RegExp(RCP.slice(0,-1));
var T = this; function check(r,n,def){
   if(r.DebugCheckIgnore) return;
   if(n.indexOf("Formula")>=0 && N[n.replace("Formula","")]) return; 
   if(n.indexOf("Gantt")>=0 && XN[n.replace(/\d*$/,"")]) return;
   if(n.search(/Tip$|Cursor$|Menu$|Width$|^CalcOrder|^TreeIcon|MergeFormat|MergeEditFormat|^Pivot/)>=0) return; 
   if(n.indexOf("Tip")>=0 && C[n.replace(/Tip.*/,"")]) return; 
   if(n.indexOf("On")>=0 && (C[n.replace(/On.*/,"")] || n.indexOf("On")==0)) return; 
   if(n.indexOf("Enum")>=0 && C[n.replace(/(Edit)?Enum(Menu|Keys)?.*/,"")]) return; 
   if(n.indexOf("Dates")>=0 && C[n.slice(0,n.indexOf("Dates"))]) return; 
   if(n.search(RCP)==0) for(var i=1;i<n.length;i++){
      if(C[n.slice(0,i)]){
         var c = n.slice(0,i);
         var t = T.GetType(r,c);
         var v = n.slice(i);
         if(t=="Panel" && (C[c].Buttons && (C[c].Buttons+"").indexOf(v)>=0 || Get(r,c) && (Get(r,c)+"").indexOf(v)>=0)) return; 
         }
      }
   if(r.Kind=="Panel"){
      var v = Get(r,c); if(v==null) v = Get(r,"Buttons");
      if(v){ v = v.split(","); for(var i=0;i<v.length;i++) if(n==v[i]||n==v[i]+1||n==v[i]+"Width") return; }
      }
   if(r.Space!=null&&(n.indexOf("Cells")==0||r.Mirror==="")) return;
   
   if(n.search(/ToolTip$|Action$|Tab$/)>=0) T.Debug(2,"Obsolete attribute ",n," in "+(def?"default ":(r.Kind?r.Kind+" ":(r.Fixed?"fixed ":"")))+"row ",def?r.Name:r.id,", use ",(n.indexOf("Action")>=0?"OnClick/OnChange":(n.indexOf("ToolTip")>=0?"Tip":"Radio"))," instead");
   else T.Debug(2,"Unknown attribute ",n," in "+(def?"default ":(r.Kind?r.Kind+" ":(r.Fixed?"fixed ":"")))+"row ",def?r.Name:r.id);
   }

// --- Defaults ---
for(var i=0;i<A.DGroup1.length;i++) DGN[A.DGroup1[i]] = 1;
DN.Updated = 1; DN.HasCopyTo = 1; DN.Children = 1; 
for(var d in this.Def){
   if(d=="C") continue;
   var r = this.Def[d]; if(r.Updated) continue;
   for(var n in r) if(!N[n] && !DN[n]){
      if(n.indexOf("Formula")>0){ n = n.replace(/Formula$/,""); if(N[n] || DN[n]) continue; }
      if(r.Group!=null && DGN[n]) continue;
      check(r,n,1);
      }
   }

// --- Variable rows --- 
I.LastHeight = 1; 
function checkch(row){
   for(var r=row.firstChild;r;r=r.nextSibling){
      for(var n in r) if(!I[n] && !N[n]) {
         if(n.indexOf("Formula")>0){ n = n.replace(/Formula$/,""); if(I[n] || N[n]) continue; }
         check(r,n);
         }
      if(r.firstChild) checkch(r);
      }
   }

if(row) { checkch(row); return; }

for(var b=this.XB.firstChild;b;b=b.nextSibling) checkch(b);

// --- Fixed rows ---
for(var i=0;i<A.Header.length;i++) HN[A.Header[i]] = 1;
var F = this.GetFixedRows();
for(var i=0;i<F.length;i++){
   var r = F[i];
   for(var n in r) if(!I[n] && !N[n]){
      if(n.indexOf("Formula")>0){ n = n.replace(/Formula$/,""); if(I[n] || N[n]) continue; }
      if(r.Kind=="Header" && HN[n]) continue;
      if(r.Kind=="Filter" && FN[n]) continue;
      if(r.Kind=="Filter" && n.search(/FilterType$/)>0){
         this.Debug(2,"Obsolete attribute FilterType in Filter row, use ","LocaleCompare/CaseSensitive"," instead");
         continue;
         }
      check(r,n);
      }
   if(r.Rows) this.Debug(2,"Obsolete attribute Rows in Header row, define more Header rows instead");
   }

// --- Space rows ---
for(var i=0;i<A.Space.length;i++) SN[A.Space[i]] = 1;
SN.CellNames = 1; SN.Fixed = 1; SN.Pos = 1; SN.HasPages = 1; SN.HasPager = 1; 
for(var i=0;i<A.Group.length;i++) GN[A.Group[i]] = 1;
for(var i=0;i<A.Search.length;i++) EN[A.Search[i]] = 1;
for(var i=0;i<A.Toolbar.length;i++) TN[A.Toolbar[i]] = 1;

TN.SetAlready = 1; 
for(var r=this.XS.firstChild;r;r=r.nextSibling) {
   var cc = r.Cells, S = { }; C = { };
   if(cc){
      if(r.MirrorUpdated) continue;
      if(r==this.Toolbar||r.HiddenToolbar){
         var CO = {}, CC = cc; cc = [];
         for(var i=0;i<CC.length;i++) { cc[i] = CC[i]; CO[cc[i]] = 1; }
         for(var i=0;i<CToolbarCells.length;i++) if(!CO[CToolbarCells[i]]) cc[cc.length] = CToolbarCells[i];
         
         }
      for(var j=0;j<cc.length;j++){
         var c = cc[j];
         for(var i=0;i<B.SpaceCell.length;i++) S[c+B.SpaceCell[i]] = 1;
         for(var i=0;i<B.Cell.length;i++) S[c+B.Cell[i]] = 1;
         for(var i=0;i<B.CCell.length;i++) S[c+B.CCell[i]] = 1;
         for(var i=0;i<B.CICell.length;i++) S[c+B.CICell[i]] = 1;
         for(var i=0;i<X.length;i++) S[c+X[i]] = 1;
         C[c] = 1;
         }
      for(var j=0;j<cc.length;j++){
         var c = cc[j];
         if((I[c]  || SN[c] || S[c])&&(c!="Indent"&&c!="ClearStyle"||r.Space==null)) {
            this.Debug(2,"Cell name ",c," in space row "+r.id+" conflicts with row or another cell or browser attribute name");
            }
         S[c] = 1;
         }   
      C.Panel = 1;   
      }
   for(var n in r) if(!I[n] && !N[n] && !SN[n] && !S[n]) {
      if(n.indexOf("Formula")>0){ n = n.replace(/Formula$/,""); if(I[n] || N[n] || SN[n] || S[n]) continue; }
      if(n.indexOf("NoSpace")==n.length-7) continue;
      if(r.Kind=="Group" && GN[n]) continue;
      if(r.Kind=="Search" && EN[n]) continue;
      if((r==this.Toolbar||r.HiddenToolbar) && TN[n]) continue;
      check(r,n);
      }
   }
C = this.Cols;

// --- Columns ---
var CN = { }, CX = { }, CG = { };
for(var i=0;i<A.C.length;i++) CN[A.C[i]] = 1;
CN.WidthPadSet = 1; CN.VPos = 1; CN.FPos = 1;
for(var i=0;i<A.CGantt.length;i++) CG["Gantt"+A.CGantt[i]] = 1;
for(var i=0;i<B.CCell.length;i++) CN[B.CCell[i]] = 1;
for(var i=0;i<B.CCellGantt.length;i++) CG["Gantt"+B.CCellGantt[i]] = 1;
for(var i=0;i<B.CCellGanttX.length;i++) CX["Gantt"+B.CCellGanttX[i]] = 1;
for(var i=0;i<B.CICell.length;i++) CN[B.CICell[i]] = 1;
for(var i=0;i<X.length;i++) CN[X[i]] = 1;
var CI = { };
for(var i=0;i<A.I.length;i++) CI[A.I[i]] = 1;
MS.Pager;
for(var i=0;i<this.Pagers.length;i++) {
   var n = this.Pagers[i].Name;
   for(var j=0;j<A.PagerXXX.length;j++) CG[n+A.PagerXXX[j]] = 1;
   }
ME.Pager;
CN.Pos = 1; CN.Sec = 1; CN.MainSec = 1; CN.HasIndex = 1;  CN.Updated = 1; CN.AutoWidth = 1; CN.RelHidden = 1; CN.IconCount = 1; 
CG.GanttCfgADate = 1; CG.GanttBasepx = 1; CG.GanttFinishpx = 1; CG.SelectZoom = 1;
var SpecNames = {"Vert":1,"Cell":1,"Can":1} 
for(var c in C){
   var r = C[c];
   if((I[c] || CI[c] || SpecNames[c]) && c!="id" && c!="Name") this.Debug(2,"Column name ",c," conflicts with row attribute or browser attribute name");
   for(var n in r) if(!CN[n] && (r.Type!="Gantt"||!CG[n])){
      if(n.indexOf("Formula")>0) { n = n.replace(/Formula$/,""); if(CN[n]) continue; }
      if(r.Type=="Gantt" && n.indexOf("Gantt")==0) { n = n.replace(/\d*$/,""); if(CX[n]) continue; }
      if(n.search(/Tip$|Cursor$|Menu$|Width$|Lap$|^Tip|^On|^Enum|^EditEnum|^GanttHeader|^GanttFormat|^Dates/)>=0) continue; 
      if(r.Buttons && r.Type=="Panel" && (r.Buttons+"").indexOf(n=="Select1"?"Select":"")>=0) continue; 
      for(var j=0;j<A.CO.length;j++) if(A.CO[j]==n){
         this.Debug(2,"Obsolete attribute ",n," in column ",r.Name,", use ",A.CR[j]," instead");
         break;
         }
      if(j==A.CO.length) this.Debug(2,"Unknown attribute ",n," in column ",r.Name);
      }  
   }

// --- Pages ---
if(this.Paging==3){
   for(var c in EC) for(var i=0;i<A.BCellICell.length;i++) BN[c+A.BCellICell[i]] = 1;
   for(var i=0;i<A.B.length;i++) BN[A.B[i]] = 1;
   for(var i=0;i<X.length;i++) BN[X[i]] = 1;
   for(var r=this.XB.firstChild;r;r=r.nextSibling){
      for(var n in r) if(!I[n] && !BN[n]){
         if(n.indexOf("Name")==0) continue; 
         this.Debug(2,"Unknown attribute ",n," in page ",r.Pos);
         }
      }   
   }

// --- Root ---
for(var n in this.Root) {
   if(I[n]) continue;
   for(var i=0;i<A.Root.length;i++) if(A.Root[i]==n) break;
   if(i==A.Root.length) this.Debug(2,"Unknown attribute ",n," in Root");
   } 
   
// --- Pager ---
var PP = { ItemHeight:1 };
for(var n in this.Pager) {
   for(var i=0;i<A.Pager.length;i++) if(A.Pager[i]==n) break;
   if(i!=A.Pager.length) continue;
   for(var i=0;i<A.PagerXXX.length;i++) if(A.PagerXXX[i]==n) break;
   if(i!=A.PagerXXX.length) continue;
   if(PP[n]) continue;
   this.Debug(2,"Unknown attribute ",n," in Pager");
   }
for(var j=0;j<this.Pagers.length;j++) {
   var P = this.Pagers[j];
   for(var n in P) {
      for(var i=0;i<A.Pager.length;i++) if(A.Pager[i]==n) break;
      if(i!=A.Pager.length) continue;
      for(var i=0;i<A.PagerXXX.length;i++) if(A.PagerXXX[i]==n) break;
      if(i!=A.PagerXXX.length) continue;
      if(PP[n]) continue;
      this.Debug(2,"Unknown attribute ",n," in Pager ",P.Name);
      }
   }

// --- MenuCfg ---
var MAll = {}; for(var i=0;i<A.MenuAll.length;i++) MAll[A.MenuAll[i]] = 1;
var MC = ["MenuCfg","MenuColumns","MenuPrint","MenuExport"];
for(var j=0;j<MC.length;j++){
   if(j!=1) { var MCfg = {}; for(var i=0;i<A[MC[j]].length;i++) MCfg[A[MC[j]][i]] = 1; }
   for(var n in this[MC[j]]) if(!MAll[n]&&!MCfg[n]) this.Debug(2,"Unknown attribute ",n," in "+MC[j]);
   }

// --- Resources ---
if(this.Resources) for(var rn in this.Resources) {
   var r = this.Resources[rn];
   for(var n in r) {
      for(var i=0;i<A.Resources.length;i++) if(A.Resources[i]==n) break;
      if(i==A.Resources.length) this.Debug(2,"Unknown attribute ",n," in Resources");
      }
   }

// --- Calendars ---
if(this.Calendars) for(var rn in this.Calendars) {
   var r = this.Calendars[rn];
   for(var n in r) {
      for(var i=0;i<A.Calendars.length;i++) if(A.Calendars[i]==n) break;
      if(i==A.Calendars.length) this.Debug(2,"Unknown attribute ",n," in Calendars");
      }
   }

// --- Zoom ---
if(this.GanttZoom&&!this.GanttResourcesMaster) for(var i=0;i<this.GanttZoom.length;i++) {
   var r = this.GanttZoom[i];
   for(var n in r) if(!CG[n] && n!="Name") {
      if(n.indexOf("GanttHeader")==0 || n.indexOf("GanttFormat")==0) continue; 
      if(n.indexOf("Ex")==n.length-2 && CG[n.slice(0,n.length-2)]) continue;   
      this.Debug(2,"Unknown attribute ",n," in Zoom ",r.Name);
      }
   }

// --- Format ---

var AM = {Updated:1}; for(var i=0;i<A.M.length;i++) AM[A.M[i]] = 1;
var MA = this.MediaAttrs; if(MA) { MA = MA.split(","); for(var i=0;i<MA.length;i++) AM[MA[i]] = 1; }
for(var i=0;i<this.Media.length;i++) {
   var M = this.Media[i].Attrs;
   for(var n in M) if(!AM[n]) {
      this.Debug(2,"Unknown attribute ",n," in Media ",i);
      }
   } 

}
// -----------------------------------------------------------------------------------------------------------
// Checks all attributes of <Cfg> tag
TGP.DebugCfg = function(Cfg){
var A = CDebugAttrs;
if(!A.Parsed){ for(var a in A) if(A[a]) A[a] = A[a].split(","); A.Parsed = 1; }
var X = this.DebugCheckIgnore ? (this.DebugCheckIgnore+"").split(",") : [ ], N = { };
for(var i=0;i<X.length;i++) N[X[i]]=1;
for(var i=0;i<A.Cfg.length;i++) N[A.Cfg[i]] = 1;
MS.Media; var MA = Cfg.MediaAttrs; if(!MA) MA = this.MediaAttrs; if(MA) { MA = MA.split(","); for(var i=0;i<MA.length;i++) N[MA[i]] = 1; } ME.Media;
N.Trans = 1; 
N.FSheet = 1; 
for(var n in Cfg) {
   if(N[n]) continue;
   if(n.search(/.Lap$|^Calendars|^PivotFunc|^DragImg|^RestoreImg/)>=0) continue; 
   
   for(var j=0;j<A.CfgO.length;j++) if(A.CfgO[j]==n){
      this.Debug(2,"Obsolete attribute ",n," in Cfg, use ",A.CfgR[j]," instead");
      break;
      }
   if(j==A.CfgO.length) this.Debug(2,"Unknown attribute ",n," in Cfg");
   }
}
// -----------------------------------------------------------------------------------------------------------
var TGAddTryCatchObjects = [];
// -----------------------------------------------------------------------------------------------------------
function TGAddTryCatch(){
try {
   var A = TGAddTryCatchObjects; if(A.length) return false;
   A.push(TGP,TCalc,Grids,PFormat);
   MS.Ajax; A.push(TAjax,Requests); ME.Ajax;
   MS.DatePick; A.push(TCalendar); ME.DatePick;
   MS.Dialog; A.push(TDialog,Dialogs); ME.Dialog;
   MS.Edit; A.push(TEdit); ME.Edit;
   MS.Chart; A.push(TLineChart); ME.Chart;
   MS.Menu; A.push(TMenu); ME.Menu;
   MS.Message; A.push(TMessage); ME.Message;
   MS.LibMouse; A.push(TLibMouseObject,MouseObjects); ME.LibMouse;
   var ct = "\n catch(tgeee){TGDebugException(arguments.callee,tgeee);}";
   for(var i=0;i<A.length;i++){
      var B = A[i];
      for(var n in B) if(typeof(B[n])=="function"){
         var f = B[n], s = f.toString(); 
         var ff = new Function(s.slice(s.indexOf('(')+1,s.indexOf(')')).split(","),"try{ "+s.slice(s.indexOf('{')+1)+ct);
         ff.prototype = f.prototype; for(var a in f) if(ff[a]==undefined) ff[a] = f[a];
         B[n] = ff;
         }
      }
   for(var n in window) if(typeof(window[n])=="function"){
      var f = window[n], s = f.toString();
      if(s.search(/\[\s*native\s+code\s*\]/)>=0 || n.charAt(0)=="T"&&n.charAt(1)>='A'&&n.charAt(1)<='Z') continue;
      var ff = new Function(s.slice(s.indexOf('(')+1,s.indexOf(')')).split(","),"try{ "+s.slice(s.indexOf('{')+1)+ct);
      ff.prototype = f.prototype; for(var a in f) if(ff[a]==undefined) ff[a] = f[a];
      window[n] = ff;
      }
   window.CGFunc = [];
   }
catch(e) { 
   var s = "Cannot set try / catch, error: "+e.toString();
   if(Grids.AddTryCatch&2 && window.console&&console.log) console.log(s); else alert(s); 
   }
return true;
}
// -----------------------------------------------------------------------------------------------------------
function TGDebugException(F,E){
var nn = null;
for(var i=0;i<TGAddTryCatchObjects.length&&!nn;i++) { var B = TGAddTryCatchObjects[i]; for(var n in B) if(B[n]==F){ nn = n; break; } }
if(!nn) for(var n in window) if(window[n]==F) { nn = n; break; }
var s = "Exception in function \n\n"+(nn?nn:"???")+" ";
var f = F.toString().replace(/\r?\n/g," "), p = f.indexOf("(");
s += f.slice(p,p+300)+" ... \n";
s += "\n"+E.toString();
if(Grids.AddTryCatch&2 && window.console&&console.log) console.log(s);
else alert(s);
}
// -----------------------------------------------------------------------------------------------------------
ME.Debug;

MS.Debug$Upload;
// -----------------------------------------------------------------------------------------------------------
// List of all attributes in grid
CDebugAttrs = {
   Cfg:"DefaultsAlphabetWhite,Code,Tag,SetIds,TextVersion,DefaultsVersion,AbsoluteCursors,Adding,AllPages,Alternate,AppendId,AutoCalendar,AutoSort,AutoUpdate,BaseUrl,BoolChars,CalcOrder,Calculated,CalculateSelected,CaseSensitiveId,ColMoving,ColResizing,ColsLap,ColsPosLap,ConstHeight,ConstWidth,Cookie,CopyCols,CopyFocused,Copying,CopyPasteInternal,CopyPasteTree,CopySelected,CSS,GanttCSS,DateStrings,DefaultSort,Deleting,Detail,DetailExpand,DetailOn,DragCopy,DragEdit,Dragging,DragObject,DropFixed,Dropping,Editing,EnterMode,ExactSize,ExpandAllLevels,ExpandAllLoaded,ExpandOnDrag,ExportCols,ExportFormat,ExportPostfix,ExportPrefix,ExportRound,ExportRows,ExportType,FastColumns,FastMerge,FastPages,FastPanel,Filtered,FilterEmpty,Filtering,Focused,FocusedCol,FocusedPos,FocusedLeft,FocusedTop,FocusedRect,FocusWholeRow,FullId,FullId,Group,Grouped,Grouping,GroupMain,GroupRestoreSort,GroupSortMain,HideHScroll,HideRootTree,Hover,ChildPaging,ChildPartLength,ChildPartMin,ChildParts,id,IdChars,IdNames,IdPostfix,IdPrefix,IgnoreFocused,IndexEnum,InEditMode,LastId,MainCol,MaxGroupLength,MaxHeight,MaxHeightParent,MaxHeightPercent,MaxHeightReserved,MaxHScroll,MaxChildrenEmpty,MaxPages,MaxSort,MaxTagHeight,MaxTagWidth,MaxVScroll,MaxWidth,MenuColumnsCount,MinRowHeight,MinSpaceRowHeight,MinTagHeight,MinTagWidth,NameCol,NoFormatEscape,NoHScroll,NoPager,NoScroll,NoScrollAfterExpand,NoTreeLines,NoPrintTreeLines,NoVScroll,NumberId,OnePage,PageLength,PageLengthDiv,PageTime,Paging,Paging,PasteCols,PasteFocused,PasteSelected,PasteTree,Pasting,PersistentCfg,Prepared,PrintCols,PrintCSS,PrintAddCSS,PrintExpanded,PrintPageBreaks,PrintPostfix,PrintPrefix,PrintRows,PrintWindowProp,ReCalc,ReloadChanged,RemoveCollapsed,RemoveUnusedPages,ResizingMain,ReSort,ReversedSortIcons,RootCount,BorderCursors,SaveAttrs,SaveAttrsTrim,SaveExpanded,SaveSelected,SaveSession,SaveValues,ScrollOnDrag,ScrollColOnDrag,ScrollOnButton,ScrollOnBody,ScrollColOnButton,ScrollColOnBody,SearchAction,SearchCaseSensitive,SearchCells,SearchClass,SearchCols,SearchDateFormat,SearchDefs,Searched,Searching,SearchExpand,SearchExpression,SearchFocused,SearchHidden,SearchMethod,SearchNotFound,SelectClass,Selecting,SelectingSingle,SelectingCells,SelectingText,ShortHScroll,WideHScroll,ShowDeleted,ShowDrag,ShowVScroll,Sort,Sorted,SortIcons,Sorting,SpannedTree,StandardFilter,StandardTip,StaticCursor,StoreOriginalValues,Style,SuppressCfg,SynchroCount,TabIndex,TabStop,TipEnd,TipStart,UsePrefix,Validate,ValidateText,ValidateMessage,ValidateMessageTime,Version,CacheTimeout,HelpFile,MessageWidth,Silent,Undo,SuppressMessage,id,LinkBase,LinkTarget,AcceptEnters,AcceptEnters,MaxChildrenOffline,ScrollLeft,LeftScrollLeft,RightScrollLeft,ScrollTop,DefaultDate,CopyEdit,CopyPasteRows,GroupChangeMoved,GroupMoveFree,SaveOrder,AutoVersion,GanttResourcesMaster,GanttResourcesName,GanttResourcesPrice,GanttResourcesAvailability,GanttResourcesGantt,GanttResourcesChart,LeftWidth,MidWidth,RightWidth,MinLeftWidth,MinMidWidth,MinRightWidth,LeftCanResize,RightCanResize,SectionResizing,NoActionEscape,Print,PrintCheckboxes,SaveFilters,PDFFitPage,PDFText,PrintFiltered,PrintSelected,PrintVisible,PrintGanttSplit,PrintGanttSplitMin,ExportPDFCols,PageWindowAdd,DynamicSpan,ColPaging,ColPagingFixed,ColPageMin,ColPageLength,PageMessageWidth,FastGantt,SafeCSS,MaxColPages,MaxChildParts,GanttResourcesType,GroupMainCaption,SearchNumbers,SearchAlertFound,SearchMaxMark,SearchCharCodes,SearchWhiteChars,SearchLocaleCompare,MasterDef,GroupTree,DetailRowsVisible,AutoIdPrefix,GroupIdPrefix,GroupIdValue,ChildIdPrefix,CustomScroll,CustomHScroll,RoundVScroll,TouchScroll,GroupTreeCol,ScrollAction,AllCols,PrintIcons,PrintHead,PrintLocation,PrintPrint,PrintGrids,CSVValueSeparator,CSVRowSeparator,CSVQuote,CSVLevel,PrintLoad,PrintCount,PrintPageRoot,PrintPageRootMin,HeaderColTree,DragCursor,NoDragCursor,ZIndex,PrintGanttBackground,DefaultCfg,DefaultCfgMenu,FilterHidden,CfgId,SyncId,Sync,NestedGrid,PrintPageWidth,PrintPageHeight,PrintPageSize,PrintConstWidth,PrintDPI,PrintDefaultDPI,PrintMinDPI,PrintMarginWidth,PrintMarginHeight,PrintPaddingWidth,PrintPaddingHeight,PrintPagePrefix,PrintPagePostfix,PrintPaddingHeightFirst,PrintPaddingHeightLast,PrintPageOrientation,PrintVarHeight,ChangesUpdate,NoDragIcon,MaxAvailability,CalculatedChanges,ExternalAlign,GlobalCursor,TmpFocus,PivotMaster,PivotControlMaster,PivotRows,PivotCols,PivotData,PivotExpanded,PivotShowParent,PivotUpdate,SortRanges,PivotFunc,PivotFilter,PivotMaxCols,UpCounter,UpCounterType,RowIndex,RowIndexType,RowIndexStart,RowIndexChars,RemoveChanged,CopyTime,TestIds,TestIdSeparator,CenterMessage,CopyDeleted,ReversedTree,PositionFixed,MaxCalcWidth,MoveMessage,TouchDragFocused,TouchClearFocused,Expanded,SectionShrinkOrder,DragCopyId,AlternateCount,AlternateType,UseButton,Resizing,ColorCursor,ShowButtons,EditSelect,AutoFillType,SelectingFocus,FocusCellBorderCursor,MoveFocusType,PrintZoomFit,ShowHScroll,TouchDragFocusedDependency,FormulaEditing,FormulaNames,Collapsed,DynamicBorder,MomentumScroll,FormulaType,FormulaLocal,ColIndex,ColIndexType,ColIndexChars,ColIndexStart,FormulaRelative,ExcludeClear,CopyPasteFormulas,FormulaResults,EditErrorsMessageTime,EditErrorsMessageMax,FormulaCircular,FormulaChanges,AutoCols,AutoRows,EditAttrs,EditErrors,EditAttrsEmpty,EditAttrsStyle,EditAttrsValue,ColAdding,SelectingCols,ColSelecting,ColDeleting,ColCopying,ShowMenuSingle,ColorState,DeleteMessage,AutoPages,AutoColPages,RemoveUnusedFixed,RemoveAutoPages,RemoveAutoColPages,UndoMerge,ClearSelected,SelectAllType,FocusRect,HideMenuUnused,Menu,SpannedBorder,BorderIn,BorderOut,SelectHidden,BorderType,Borders,DynamicStyle,UpdateHeightsTimeout,TextColor,TextColors,DefaultColor,DefaultColors,TextSize,TextSizes,TextFont,TextFonts,TextShadow,TextShadows,TextShadowColor,TextShadowColors,TextLine,TextLines,BorderColors,EscapeImages,Format,Formats,DynamicFormat,TextFormat,NumberFormat,DateFormat,PrintMarginDiv,FormulaAddParenthesis,NoDateNumber,SelectClassRow,FilterIgnoreEmpty,CalculatedChangesFirst,ShiftHint,ClearFilterOff,ExportName,VisibleRows,HiddenRows,SaveVisible,PDFName,PDFFormat,JSZip,canvg,ExportLoad,ExportOptions,ExportFontSize,ExportFontFace,DuplicateId,MediaChange,CalculateHidden,MediaTag,LongClick,PrintWindowOpen,MacContextMenu,ColorPanel,ImportAction,AutoWidths,AnimateRows,AnimateDialogs,SuppressAnimations,AnimateRowsMax,AnimateCells,AnimateCellsMax,AnimateRowsColorMax,AnimateCols,AnimateColsMax,AnimateUndo,DragCol,Styles,MasterDefHide,Scale,Scales,ScaleMenu,Size,Sizes,ShrinkStyle,ShrinkStyleType,ShrinkStyleWidth,ShrinkStyleHeight,ShrinkStyleScale,MinBodyRows,Zoom,ZoomMenu,GanttStyle,GanttStyles,LimitScroll,ScrollParent,StyleDependencyModifier,ExactWidth,RowIndexWidth,FocusedType,Overlay,ImportHeader,ImportHead,ImportFoot,ImportLeftCols,ImportRightCols,ImportAttrs,ImportWidths,DefaultBorder,FormulaTip,RoundNumbers,RoundNumbersDigits,EditHtml,Indent,Indents,ExcelDates,FormulaMaxIterations,PivotSumFormat,NoClearLimitScroll,WheelFixed,TipDialog,GanttPrintRowHeight,AcceptNaNTime,WordWrap,CopyPasteHidden,CopyFormulas,PreserveSameRanges,ResetNextBorders,NoStat,ImportExt,ChildPageLength,ChildPageDiff,PreserveReload,DialogCSS,AddColCellDef,PrintSplitRowSpan,PrintToPage,PrintFromPage,PrintAllCSS,SizeScaled,IESvg,IESvgTool,IESvgGantt,IESvgFGantt,IESvgGanttArrow,IESvgGanttMilestone,IESvgCustom,AddFocusCol,AddFocusColEmpty,NestedFocusedActions,SyncStyle,SyncLanguage,PasteErrors,Language,UseLanguages,FilterHideParents,ColorFilter,HideParents,CSVDateFormat,Rtl,CopyPasteDeleted,PasteNaN,LanguagesColumns,KeepReload,AutoHtml,InsertImg,DropFiles,Pattern,Patterns,PatternColor,PatternColors,FormulaShow,HideZero,DefaultBorderColor,IndentType,ShortVScroll,FilterReplaceOne,FilterReplaceMore,RotateStepsLeft,RotateStepsRight,InsertImgMaxHeight,InsertImgMaxWidth,ImportImg,DragImgAngle,DragImgAction,EditImg,Locked,LockedValues,DynamicEditing,ImportPassword,MaxMenuCells,MaxMenuAllCells,MaxMenuAllCellsValue,AutoBool,ShowPrintPageBreaks,ExternalEdit,ExternalFocus,ExternalFocusMaxRows,ExternalFocusMaxCols,LineHeightRatio,ExportTextShadow,NoWrapBR,ExportHeights,OverlayImg,AssignImg,ExportAlternate,DefaultSize,ExportLinks,ExportImages,ExportRowHeight,Contrast,Contrasts,DragImgMinWidth,DragImgMinHeight,ExportCompression,ExportBool,CSVNumberFormat,ExportEmptyDecimals,ExportWidthRatio,LockedAlways,LockedNever,MainTagWidth,MainTagHeight,MediaAttrs,Reset,ReversedColTree,ColTree,MaxColLevel,CalculateColumns,AutoTreeWidth,HideTree,HideEmptyTree,ColTreeLast,NoExportFunc,FormulaTimeout,ImportLimitCols,ImportLimitRows,ImportLimitCells,PrintOnlyData,InitDef,ImgAnchor,EditCursor,EditCursorMouse,EditCursorTouch,EditCursorKey,EditCursorTab,ShowFocused,GroupHideCols",
   CfgO:"DefaultSortCol,MaxSortColumns,SortCols,SortTypes,GroupCols,GroupTypes,UngroupAction,PrintType,HidePanel,ShowVScrollbar,DefaultSortCol,GroupFlags,SearchType,IdCompare",
   CfgR:"DefaultSort,MaxSort,Sort,Sort,Group,Group,OnUngroup,CanPrint/PrintExpanded/PrintPageBreaks,Panel.Visible,ShowVScroll,DefaultSort,GroupSortMain/GroupRestoreSort,SearchCells/SearchHidden/SearchCaseSensitive/SearchExpand/SearchFocused/SearchNotFound,CaseSensitiveId",
   C:"CanCopyPaste,CanDrag,CanFilter,CanHide,CanMove,CanResize,CanSearch,CanSort,Def,Formula,Group,Block,GroupWidth,Hidden,MenuName,MinWidth,Name,RelWidth,SearchNames,Spanned,Visible,Width,WidthPad,CanExport,CanGroup,GroupDef,GroupWidth,CopyMenu,GroupChar,DefaultsAlphabetMin,ExpandLevel,Prepared,GroupMore,VarHeight,CanSelect,SearchText,PrintWidth,RelWidthType,ColorCursor,SelectedCells,NoUpload,ConstWidth,Next,FormulaCanUse,NoIndex,HasIndex,Buttons,CanDelete,CanCopy,Selected,Deleted,Added,NoBorder,NoStyle,NoFormat,Overflow,MaxWidth,VarHeightType,MenuCheck,CanFix,Level,NoData,_Index",
   CGantt:"DataUnits,MaxDependencies,Min,BackgroundRepeat,FlowRound,Format1,Header1,HeaderTrim,ChartRound,PrintRound,Left,MarkRound,Max,Right,Round,Units,Width,ResizeDelete,Zoom,ZoomDate,ZoomDateAlign,ZoomList,SmoothZoom,WidthCookie,WidthBase,ResourcesFilter,DependencySpan,CorrectDependencies,CheckDependencies,Check,CheckTime,ExcludeRepeat,HideExclude,DataModifiers,LastUnit,Base,BaseProof,FinishProof,BasePreferred,FinishPreferred,ExcludeUnits,IncorrectDependencies,MarkIncorrectDependencies,ColorIncorrectDependencies,MarkDisabledDependencies,ColorDisabledDependencies,AssignDependencies,DragDependenciesMore,DragDependenciesBetween,Include,IncludeRepeat,Base,MaxExclude,Strict,Order,DependencyObjects,CheckExclude,CorrectDependenciesFixed,ResourcesAssign,Object,FormatObject,ChartMinStart,ChartMaxStart,ChartMinEnd,ChartMaxEnd,PointsShift,ResourcesExtra,EditStartMove,Slack,Finish,MinSlack,ErrSlack,SeparateSlack,AllDependencies,BaseCanEdit,FinishCanEdit,ShowBounds,ConstraintsAll,UseConstraints,ShowConstraints,DeleteDependencies,FixComplete,RunStates,RunMilestones,RunGroupHover,NewStart,NewEnd,DragDependenciesAlways,RunCorrectFixed,RoundUnits,ResourceAvailabilityRight,ChangeExclude,ResizeBeforeMove,Size,SizeFit,FitVisible,SizeLeft,SizeRight,RoundExclude,ShowDependencies,ExcludeComplete,MarkPath,EndLast,MaxCorrectingLoops,ConstraintTipFormat,RunMinWidth,TextOverlay,FlagsMove,HeaderMaxUnits,BackgroundMaxUnits,Paging,PagingFixed,PageWidth,RoundComplete,Count,HoverIcons,Shift,AdjacentBars,WidthEx,DependencyIcons,DependencyTip,DependencyTipDateFormat,ManualChange,RunManualChange,RunIds,RunIdPrefix,RunIdPostfix,RunIdChars,RunNumberId,RunLastId,Direction,ManualSide,EditDisabled,ShowHtml,RunShowHtml,Task,Bottom,RunSelect,RunCorrectBox,RunJoined,RunEmpty,AddBackground,DragLine,IconBottom,DependencyColor,RunMaxCorrectingLoops,RunSummaryIdPrefix,RunBoxMinWidth,RunBoxMinAlign,RunBoxMinType,AdjacentDependencies,ZoomChange,ZoomFit,DragDependenciesMove,CorrectDependenciesButtons,Update,HeaderCount,Lines,LineTipDateFormat,RunCustom,MilestoneTopMin,RunDragObject,RunJoinedHover,RunNbspHover,RunJoinedNbsp,RunClearSelected,BypassDependencies,DragTip,DragTipDateFormat,DragTipDurationFormat,DragUnits,CorrectOutsideBounds,PageInit,LagRound,IconsHover,CheckExcludeEdit,AvailabilityZero,AvailabilityTransparent,AvailabilityJoin,AvailabilitySum,AvailabilitySumBars,AvailabilityUnits,AvailabilitySplit,AvailabilityShow,AvailabilityVPos,AvailabilityHPos,AvailabilityTextClass,AvailabilityTextRepeat,AvailabilityDivide,ZoomFitWidth,RunEscape,MarkExt,TextsSeparator,RunContainersResize,RunContainersDelete,RunErrorsShiftVisible,RunContainersSelect,Center,PagingUpdateHeight,LagDescendants,EditSoleDuration,CorrectExclude,DifferMilestones,ZoomUndo,CorrectDependenciesCreate,ShowBorder",
   CO:"GanttOptions,SortType,GroupType,ToolTip",
   CR:"GanttEdit/GanttHover/GanttIcons,LocaleCompare/CaseSensitive,LocaleCompare/CaseSensitive,Tip",
   Panel:"Header*Cursor,Header*Tip,Panel*Cursor,Panel*Tip,Space*Cursor,Space*Tip,*,*Width",
   I:"AcceptChild,Added,AggChildren,AlternateClass,AlternateColor,ButtonWidth,CalcOrder,Calculated,CanCopy,CanCopyPaste,CanDelete,CanDrag,CanExpand,CanExport,CanFilter,CanGroup,CanSelect,Copy,Count,DefEmpty,DefParent,Deleted,Detail,Expanded,Changed,id,id,Kind,Kind,LeftHtml,MaxChildren,MaxChildrenDiff,MidHtml,Moved,Name,NewId,Next,NoColorState,NoUpload,Parent,Prev,Recalc,RightHtml,Selected,SortPos,SortSpan,Spanned,Visible,Def,AcceptDef,AddParent,CanSort,CDef,MaxHeight,MaxHeightAll,MinHeight,RelHeight,Height,_0F,State,ExpandLevel,AddDefChildren,DetailCol,DetailLayout,DetailTreeGrid,MasterRow,PrintHeight,NoPageBreak,Hidden,CollapseOther,NoUpCounter,NoIndex,MaxChildrenMin,IgnoreIdNames,Level,HasDefR,TreeWidth0,TreeWidth1,TreeWidth2,CanResize,Resized,ColorCursor,FormulaCanUse,Buttons,CanHide,ShowColNames,NoBorder,NoStyle,NoFormat,MenuName,CellDef,Filtered,FilterMenuName,MenuCheck,CanFix,AutoTree,NoData,_Index",
   BCellICell:"avedev,average,count,counta,countblank,countif,countrows,choose,max,median,min,mode,product,rank,split,stdev,stdevp,sum,sumif,sumrange,sumsq,vara,varp",
   Space:"Cells,Panel,Space,Tag,PagerType,Mirror,DragTab,LastVisible,SpaceWrap,ExternalEdit,ExternalFocus",
   Group:"Cols,Custom,List,ListCustom",
   Search:"ActionsAction,ColsCols,ColsDefaults,DefsDefaults,DefsDefs,ExpressionAction,ListDefaults,ListExpressions,Actions,ListAction",
   Toolbar:"Styles,GanttStyles,Sizes,Scales,Contrasts,Link,LinkVisible,HiddenToolbar",
   Header:"NoEscape,SortIcons",
   DGroup1:"AggChildren,EditCols,Group,GroupCol,GroupCols,GroupMain,GroupMainCaption,ParentAcceptDef,ParentCDef,OnGroup",
   B:"Count,id,Name,Pos,Rows,Title,clear",
   Root: "AcceptDef,AddParent,CanSort,CDef,FocusCell,FocusRow",
   Pager:"CanHide,CanResize,Caption,Hover,MaxColumns,MinWidth,Visible,Width,Name,Left,Type,Index,FirstZoom,LastZoom,ZoomToPage,ZoomUndo,MenuName",
   MenuCfg:"GanttCheckDependencies,GanttCheckExclude,GanttCheck,GanttCorrectDependencies,GanttDirection,GanttStrict,GanttCorrectDependenciesFixed,GanttFixComplete,GanttHideExclude,GanttBaseProof,GanttFinishProof,GanttBasePreferred,GanttFinishPreferred,GanttMinSlack,GanttErrSlack,GanttSeparateSlack,GanttSeparator1,ShowDeleted,ReversedTree,AutoSort,SortClick,AutoUpdate,CheckUpdates,Separator1,Scrollbars,Scroll,MouseHover,ShowDrag,ShowPanel,ShowPager,ShowAllPages,ShowButtons",
   MenuPrint:"PDFName,PDFFormat,PrintRows,PrintPageRoot,PDFText,PrintExpanded,PrintFiltered,PrintSelected,PrintVisible,PrintPageSize,PrintPageOrientation,PrintMarginWidth,PrintMarginHeight,PDFFitPage,PrintDPI,PrintWidth,PrintHeight,PrintResults",
   MenuExport:"ExportName,ExportFormat,ExportExpanded,ExportFiltered,ExportOutline,ExportIndent,ExportSelectedRows,ExportSelectedCols,ExportSelectedCells,ExportFixedRows,ExportFixedCols,ExportEmpty",
   MenuAll:"Items,Menu,Hide,CfgColumns,Columns,Sort,HideUnused,Name,Attribute",
   Format:"AMDesignator,DateSeparator,Day1CharNames,Day2CharNames,DayNumbers,DecimalSeparator,FirstWeekDay,FirstWeekYearDay,GMT,GroupSeparator,Halves,Hirji,InputDateSeparators,InputDecimalSeparators,InputGroupSeparators,InputTimeSeparators,LongDayNames,LongMonthNames,LongMonthNames2,NaD,NaN,Percent,PMDesignator,Quarters,RangeSeparator,RangeSeparatorHtml,ShortDayNames,ShortMonthNames,TimeSeparator,ValueSeparator,ValueSeparatorHtml,EmptyNumber,EmptyDate,Cont,ContLeft,ContRight,RepeatSeparator,CountSeparator,AddSeparator,HirjiYear,PivotSeparators,GroupCount,GroupCount1,Digits,FormulaPrefix,FormulaValueSeparator,FormulaRangeSeparator,BaseSeparators,FormulaAbsolute,NaR,TextPrefix,FormulaIntersectionSeparator,StrictDates,DateFormatLowercase,ExcelDates,Colors,StrictNumbers,InputMonthNames,InputAMPMDesignators,InputDateTimeSeparators,EditFormats,ExactNumbers,Currency,EditPercent,FractionSeparator,Unsupported,ExportFilters,ExportFiltersHtml",
   Resources:"Name,Text,Price,Availability,Consume,Type",
   Calendars:"Name,Exclude",
   Animations:"Expand,Collapse,ShowMenu,ShowMenuUp,HideMenu,HideMenuUp,ShowPopup,ShowPopupUp,HidePopup,HidePopupUp,ShowCalendar,ShowCalendarUp,HideCalendar,HideCalendarUp,ShowCfg,HideCfg",
   PagerXXX:"PageSize,ChartSize,ChartNext,ChartPrev,Format,TipFormat,CaptionFormat,Click,DblClick,ShowUsedPages,ShowExcludedPages",
   M:"Media,MaxWidth,MaxHeight,MinWidth,MinHeight,Width,Height,Tag,Style,GanttStyle,Size,Rtl,Language,Name",
   Parsed:0
   }
// -----------------------------------------------------------------------------------------------------------
ME.Debug$Upload;
// -----------------------------------------------------------------------------------------------------------
MS.Debug$Toolbar;
CToolbarCells = "Save,Reload,Repaint,Print,ExportPDF,Export,Import,Undo,Redo,Add,AddChild,AddCol,Join,Split,Outdent,Indent,ExpandAll,CollapseAll,AddImage,SetLink,Left,Center,Right,Top,Middle,Bottom,Bold,Italic,Underline,Strike,RotateLeft,RotateRight,NoRotate,WrapText,ClearStyle,Size,ColorText,ColorShadow,ColorBackground,Border,TextFormat,Sort,Calc,WinScroll,Columns,Cfg,Lock,Help,Debug,Correct,ZoomIn,ZoomOut,ZoomFit,Styles,GanttStyles,Sizes,Scales,Contrasts,StylesLabel,GanttStylesLabel,SizesLabel,ScalesLabel,ContrastsLabel,Empty,Formula,Resize,ColorTextLeft,TextIndent,Languages,LanguagesLabel".split(',');

ME.Debug$Toolbar;
// -----------------------------------------------------------------------------------------------------------
// Cell attributes also for calculations
MS.Debug$Calc$Upload;
CCellAttrs = {
   Cell:"CanFilter,CanPaste,CopyTo,CopyValue,Error,ExportValue,FilterValue,Formula,Changed,PageNameValue,Recalc,SortDescValue,SortValue,Merge,MergeEdit,MergeType,RowSpan,Selected,Span,Visible,Disabled,MergeFormat,MergeEditFormat,MergeFormatEmpty,MergeEditFormatEmpty,Undo,SortCol,ShowHiddenBorder,EqualFormatted,GanttSummaryCDef,GanttSummaryCols,GanttSummarySeparators,PivotValue,Levels,EFormula,FilterMenu,Orig,CellDef,LockType,Img,_t",
   CCell:"Actions,Align,AutoCalendar,BoolGroup,BoolIcon,Button,ButtonText,ButtonTextChecked,ButtonWidth,CanEmpty,CaseSensitive,CaseSensitiveValues,Clear,Cursor,Defaults,DefaultsServer,EditEnum,EditMask,EditServer,EmptyValue,Enum,EnumKeys,EnumMenu,ExportFormat,Formula,GroupDeleted,GroupEmpty,GroupSingle,GroupSole,CharCodes,Icon,IconChecked,Icons,IconHeight,IconWidth,IntFormat,Link,LinkTarget,List,LocaleCompare,MaskColor,NumberSort,Radio,RadioIcon,RadioRight,RadioUncheck,Range,Refresh,Related,ReloadData,ResultMask,ResultText,ResultMessage,ResultMessageTime,Size,Suggest,SuggestServer,SuggestType,Switch,Type,Uncheck,WhiteChars,Wrap,LinkBase,Copy,Delete,Move,Select,SuggestDelay,SuggestMin,Rtl,Calendar,DefaultDate,CancelUnchanged,ExportStyle,EmptyIcon,PopupIcon,SuggestSeparator,DefaultsAlphabetMin,ExpandCols,ExpandRows,Expanded,DatesValueCaption,MaxChars,Edit,ActualDate,HideParentCol,ShowEnumHeader,RawSort,Checked,Simple,BoolIconWidth,RadioIconWidth,NoChanged,Resizing,Digits,RefreshHeight,Separator,Accept,FormulaSuggest,FormulaSuggestType,FormulaSuggestMin,FormulaSuggestDelay,FormulaSuggestSeparator,PopupIconWidth,Underline,ButtonClass,UnderlineStyle,IsSelect,AcceptNaN,AcceptNaNText,AcceptNaNValue,RadioWrap,InsertImg,IconSize,ExpandCol,CenterTo,Overlay,TextImg",
   CCellGantt:"Edit,Flags,FlagTexts,Flow,FlowText,Hover,Mark,MarkTexts,RunStart,Run,RunFormat,RunResize,RunResizeCtrl,RunResizeAlt,RunResizeShift,RunMove,RunMoveCtrl,RunMoveAlt,RunMoveShift,RunAdjust,RunAdjustCtrl,RunAdjustAlt,RunAdjustShift,RunAdjustResize,RunAdjustResizeCtrl,RunAdjustResizeAlt,RunAdjustResizeShift,RunAdjustSlide,RunAdjustMove,RunAdjustCopy,RunAdjustRemove,RunAdjustSlideCtrl,RunAdjustSlideAlt,RunAdjustSlideShift,RunAdjustMoveCtrl,RunAdjustMoveAlt,RunAdjustMoveShift,RunAdjustCopyCtrl,RunAdjustCopyAlt,RunAdjustCopyShift,RunAdjustRemoveCtrl,RunAdjustRemoveAlt,RunAdjustRemoveShift,RunResizeRight,RunResizeCtrlRight,RunResizeAltRight,RunResizeShiftRight,RunMoveRight,RunMoveCtrlRight,RunMoveAltRight,RunMoveShiftRight,RunAdjustRight,RunAdjustCtrlRight,RunAdjustAltRight,RunAdjustShiftRight,RunAdjustResizeRight,RunAdjustResizeCtrlRight,RunAdjustResizeAltRight,RunAdjustResizeShiftRight,RunAdjustSlideRight,RunAdjustMoveRight,RunAdjustCopyRight,RunAdjustRemoveRight,RunAdjustSlideCtrlRight,RunAdjustSlideAltRight,RunAdjustSlideShiftRight,RunAdjustMoveCtrlRight,RunAdjustMoveAltRight,RunAdjustMoveShiftRight,RunAdjustCopyCtrlRight,RunAdjustCopyAltRight,RunAdjustCopyShiftRight,RunAdjustRemoveCtrlRight,RunAdjustRemoveAltRight,RunAdjustRemoveShiftRight,RunResizeMiddle,RunResizeCtrlMiddle,RunResizeAltMiddle,RunResizeShiftMiddle,RunMoveMiddle,RunMoveCtrlMiddle,RunMoveAltMiddle,RunMoveShiftMiddle,RunAdjustMiddle,RunAdjustCtrlMiddle,RunAdjustAltMiddle,RunAdjustShiftMiddle,RunAdjustResizeMiddle,RunAdjustResizeCtrlMiddle,RunAdjustResizeAltMiddle,RunAdjustResizeShiftMiddle,RunAdjustSlideMiddle,RunAdjustMoveMiddle,RunAdjustCopyMiddle,RunAdjustRemoveMiddle,RunAdjustSlideCtrlMiddle,RunAdjustSlideAltMiddle,RunAdjustSlideShiftMiddle,RunAdjustMoveCtrlMiddle,RunAdjustMoveAltMiddle,RunAdjustMoveShiftMiddle,RunAdjustCopyCtrlMiddle,RunAdjustCopyAltMiddle,RunAdjustCopyShiftMiddle,RunAdjustRemoveCtrlMiddle,RunAdjustRemoveAltMiddle,RunAdjustRemoveShiftMiddle,RunNew,RunNewCtrl,RunNewAlt,RunNewShift,RunNewStart,RunNewStartCtrl,RunNewStartAlt,RunNewStartShiftGanttRunNewMiddle,RunNewCtrlMiddle,RunNewAltMiddle,RunNewShiftMiddle,RunNewStartMiddle,RunNewStartCtrlMiddle,RunNewStartAltMiddle,RunNewStartShiftMiddle,RunNewRight,RunNewCtrlRight,RunNewAltRight,RunNewShiftRight,RunNewStartRight,RunNewStartCtrlRight,RunNewStartAltRight,RunNewStartShiftRight,FlagIcons,FlagIconList,FlagIconNames,RunTypes,RunSave,RunError,DependencySpans,Descendants,Ancestors,Format,FormatWidth,MilestoneTip,FlowTip,FlagsTip,ConstraintsTip,RunTip,RunTipDateFormat,ResourcesMenu,Chart,ChartResource,ChartResourceDef,ChartResourceFormat,Points,PointsIcons,PointsEdit,PointsShift,MinStart,MaxStart,MinEnd,MaxEnd,FlowJoin,FlowComplete,RunComplete,RunEnd,RunDuration,RunAdjustStart,RunAdjustCorrect,RunText,ChartResourceType,Menu,Exclude,Background,Calendar,RunErrors,ChangeExcludeObjects,FlagsType,FlagClasses,FlagClassList,RunErrorsShift,FlowTop,FlowHeight,RunHeight,RunTop,TipDateFormat,HtmlDateFormat,RunDisabled,ConstraintsIcons,FlagsTop,PointsTop,FormatTop,ConstraintsTop,RunHtml,RunHtmlLeft,RunHtmlRight,RunHtmlShift,RunHtmlDateFormat,RunManual,RunHtmlLeftEdge,RunHtmlRightEdge,RunHtmlLeftClass,RunHtmlRightClass,RunLevels,RunClass,RunSummary,RunSummaryDependencies,RunResources,Color,AvailabilityGroups,IconLeftWidth,IconRightWidth,Availability,AvailabilityType,AvailabilityClass,AvailabilityExclude,AvailabilityFormat,AvailabilityTextWidth,AvailabilityMin,AvailabilityMax,AvailabilityShift,AvailabilityHeight,AvailabilityStack,AvailabilityGroupsSpread,RunContainers,RunContainerTop",
   CCellGanttX:"Start,End,Duration,Parts,Complete,Join,Text,Resources,Html,Tip,MilestoneTip,Top,Height,Class,MilestoneClass,Summary,Icons,IconLeft,IconRight,IconLeftShift,IconRightShift,Manual,Disabled,HtmlLeft,HtmlRight,HtmlShift,SummaryType,HtmlLeftEdge,HtmlRightEdge,HtmlLeftClass,HtmlRightClass,Milestones", 
   CICell:"Align,Background,CalendarButtons,CanEdit,CanFocus,Class,ClassInner,ClassInnerIcon,Color,HtmlPostfix,HtmlPrefix,NoColor,ShowHint,Tip,TipClass,TipPosition,Wrap,AcceptEnters,FocusCell,FocusRow,HoverCell,HoverRow,MaxEditHeight,Menu,CanPrint,VertAlign,IconAlign,FormulaCanEdit,BorderTop,BorderBottom,BorderLeft,BorderRight,HintValue,TextStyle,TextColor,TextSize,TextFont,TextShadow,TextShadowColor,Rotate,Indent,WrapEdit,Format,EditFormat,Pattern,PatternColor,XlsFormat,FormulaShow,ExpandIcon,RefreshHeight",
   SpaceCell:"ButtonWidth,RelWidth,Text,Width,Height,CopyMenu,Style,Chart,SourcesX,SourcesY,Parent,Refresh,Count,Step,PrintHPage,CanAdd,CanDelete,CanMove,CanCopy,CanEdit,Accept,Duplicates,MinWidth,MinItemWidth,MaxItemWidth,AutoWidth,MinTextWidth,Single,SingleType,MinWidth,MaxWidth,SpaceClass,Sheet,ShowHidden,MinEditWidth,NoSpace,LockType",
   FilterCell:"DefaultFilter,Filter,FilterOff,MenuItems,Range,ShowMenu,FilterEnumKeys,FilterDef,FilterDefs,FilterOffText",
   Parsed:0
   } 
var CCellAttrsRegExp = new RegExp("^(\\w+)("+(CCellAttrs.Cell+","+CCellAttrs.CCell+",Gantt"+CCellAttrs.CCellGantt.replace(/,/g,",Gantt")+",Gantt"+CCellAttrs.CCellGanttX.replace(/,/g,",Gantt")+","+CCellAttrs.CICell+","+CCellAttrs.SpaceCell+","+CCellAttrs.FilterCell).replace(/,/g,"|")+")$");
ME.Debug$Calc$Upload;  
// -----------------------------------------------------------------------------------------------------------
if(!TGP.Debug) TGP.Debug = function() { } 

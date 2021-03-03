// ----------------------------------
// --- TreeGrid debugging sources ---
// ----------------------------------
// Link this file (GridESrc.js) instead of compiled GridE.js file into your page
// Change the TGPath variable, if the GridESrc.js file is placed in different directory than the GridE.js
// The GridESrc.js file must be always placed in the root directory of TreeGrid sources

// !!! Debugging sources can be run only from the local servers: localhost, 127.0.0.1, 192.168.*.*, 10.*.*.* and directly via file:// protocol


TGPath = ""; // Relative path from GridESrc.js to GridE.js, without leading '/', but with trailing '/'
             // For example, if there are paths: http://server/Test/Grid/GridE.js and http://server/Test/Src/V10/GridESrc.js, set the TGPath="../../Grid/"


// --- TreeGrid Header ---
var TGComponent = {

// --- File information ---
Name:      "Editable JavaScript TreeGrid",
Address:   "http://www.treegrid.com",
Type:      "TreeGrid with Extended API",
Version:   "15.0.14",
Release:   "10. June 2020 04:39",
Code:      "GGRDAMQPUIDNF",

// --- License information ---
Registered_to:  "ADVENT SOFTWARE INC",
Registered_for: "",

License:        "This component can be included only in applications or websites produced and marketed by company 'ADVENT SOFTWARE INC'."+
                "Up to 8 developers from the company 'ADVENT SOFTWARE INC' can work (develop) with the component.",

Restrictions:   "This file must NOT be modified or decompressed"+
                "The component must NOT be sold or given to anybody alone as the component to build any other web applications.",


// --- JavaScript code --- 
End:""};
var tgdbgsrc = [

"Lib/Const.js",
"Grid/Dom.js",
"Grid/Types.js",

"Lib/Func.js",
"Lib/Pos.js",
"Lib/Dialog.js",
"Lib/Menu.js",
"Lib/Message.js",
"Lib/Format.js",
"Lib/FormatDate.js",
"Lib/Calendar.js",
"Lib/Edit.js",
"Lib/EditHtml.js",
"Lib/EditMask.js",
"Lib/Size.js",
"Lib/Ajax.js",       
"Lib/Anim.js",
"Lib/Chart.js",
"Lib/CC.js",
"Lib/Mouse.js",
"Lib/Xml.js",

"Grid/Animate.js",
"Grid/Base.js",
"Grid/BasePos.js",
"Grid/Border.js",
"Grid/Calc.js",
"Grid/CalcEdit.js",
"Grid/CalcEditFunc.js",
"Grid/CalcFunc.js",
"Grid/Cell.js",
"Grid/CellFormat.js",
"Grid/CellImg.js",
"Grid/CellStyle.js",
"Grid/Cfg.js",
"Grid/Chart.js",
"Grid/Clear.js",
"Grid/ColAdd.js",
"Grid/ColBase.js",
"Grid/ColMove.js",
"Grid/ColPaging.js",
"Grid/ColShow.js",
"Grid/ColTree.js",
"Grid/CPages.js",
"Grid/Cursor.js",
"Grid/Data.js",
"Grid/DataChanges.js",
"Grid/DataIn.js",
"Grid/DataInXml.js",
"Grid/DataInJson.js",
"Grid/DataOut.js",
"Grid/Debug.js",
"Grid/Defaults.js",
"Grid/Dialog.js",
"Grid/Drag.js",
"Grid/Edit.js",
"Grid/EditCheckbox.js",
"Grid/EventActions.js",
"Grid/EventBase.js",
"Grid/EventGlobal.js",
"Grid/EventKey.js",
"Grid/EventMouse.js",
"Grid/Export.js",
"Grid/ExportSheet.js",
"Grid/ExportCsv.js",
"Grid/Filter.js",
"Grid/Focus.js",
"Grid/Func.js",
"Grid/Group.js",
"Grid/Header.js",
"Grid/Hint.js",
"Grid/Html.js",
"Grid/HtmlPage.js",
"Grid/HtmlRefresh.js",
"Grid/Index.js",
"Grid/Lang.js",
"Grid/Lock.js",
"Grid/Master.js",
"Grid/Media.js",
"Grid/Menu.js",
"Grid/MenuCfg.js",
"Grid/Navigate.js",
"Grid/Pager.js",
"Grid/Paging.js",
"Grid/Paste.js",
"Grid/Pivot.js",
"Grid/PrintAction.js",
"Grid/PrintBase.js",
"Grid/PrintCalc.js",
"Grid/PrintFinish.js",
"Grid/PrintHtml.js",
"Grid/PrintTable.js",
"Grid/Render.js",
"Grid/RenderBase.js",
"Grid/RenderRow.js",
"Grid/RenderTable.js",
"Grid/RowAdd.js",
"Grid/RowCopy.js",
"Grid/RowDel.js",
"Grid/RowId.js",
"Grid/RowIter.js",
"Grid/RowMove.js",
"Grid/RowShow.js",
"Grid/RowSpan.js",
"Grid/RowTree.js",
"Grid/Scroll.js",
"Grid/ScrollBase.js",
"Grid/Search.js",
"Grid/SelBase.js",
"Grid/SelCell.js",
"Grid/SelCol.js",
"Grid/SelDrag.js",
"Grid/SelRow.js",
"Grid/Sort.js",
"Grid/Space.js",
"Grid/Start.js",
"Grid/StyleChange.js",
"Grid/StyleLoad.js",
"Grid/StyleMeasure.js",
"Grid/Table.js",
"Grid/Undo.js",
"Grid/Update.js",
"Grid/UpdateGrid.js",
"Grid/UpdateValues.js",
"Grid/Value.js",
"Grid/Width.js",
"Grid/XlsxImport.js",
"Grid/XlsxExport.js",
"Grid/Zip.js",

"Gantt/Background.js",
"Gantt/Basic.js",
"Gantt/Bounds.js",
"Gantt/Constraints.js",
"Gantt/Create.js",
"Gantt/CreateWidth.js",
"Gantt/Check.js",
"Gantt/DepActions.js",
"Gantt/DepBase.js",
"Gantt/DepCorrect.js",
"Gantt/DepCreate.js",
"Gantt/DepDrag.js",
"Gantt/DragEnd.js",
"Gantt/DragMove.js",
"Gantt/DragStart.js",
"Gantt/Exclude.js",
"Gantt/Flags.js",
"Gantt/Formula.js",
"Gantt/Header.js",
"Gantt/Hover.js",
"Gantt/Init.js",
"Gantt/Main.js",
"Gantt/Menu.js",
"Gantt/Points.js",
"Gantt/Resource.js",
"Gantt/RunBasic.js",
"Gantt/RunDrag.js",
"Gantt/RunActions.js",
"Gantt/RunContainers.js",
"Gantt/Summary.js",
"Gantt/Width.js",
"Gantt/Zoom.js"

];

function TGInit(){
DeLZ = "a"; for(var i=0;i<12;i++) DeLZ += DeLZ;
DeLZ += 55192;
NoModule = function(){};
window.LoadGridE = NoModule;
Try = 1; Catch = 0;
window.info = NoModule;
_5T4 = new Date(); _5T4.setMilliseconds(_5T4.getMilliseconds()+200);
LZDX = tgdbgsrc.join(";");
}

function InsertTGSources(){
var S = document.documentElement.getElementsByTagName("script"), PathSource = "";
for(var i=0;i<S.length;i++){ // Finds paths to GridE.js and GridESrc.js
   if(!S[i].src) continue;
   var p = S[i].src.search(/gridesrc\.js/i); if(p>=0) { PathSource = S[i].src.slice(0,p); break; }
   }
try { for(var i=0;i<tgdbgsrc.length;i++) document.write("<script src='"+PathSource+tgdbgsrc[i]+"'> </script>"); }
catch(e){ // xhtml
   var H = document.documentElement.getElementsByTagName("head")[0];
   for(var i=0;i<tgdbgsrc.length;i++) {
      var D = document.createElement("script");
      D.src = PathSource + tgdbgsrc[i];
      H.appendChild(D);
      }
   }
}
_5T2 = new Date();
_5T3 = new Date(); _5T3.setMilliseconds(_5T3.getMilliseconds()+100);
LZD = null; DLZ = "x";
InsertTGSources();




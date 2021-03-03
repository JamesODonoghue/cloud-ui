// -----------------------------------------------------------------------------------------------------------
// Functions for Undo / Redo
// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
TGP.GetUndo = function(){ 
for(var G=this;G.MasterGrid;G=G.MasterGrid);
return G.OUndo;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UndoStart = function(autoupdate){ 
MS.Undo;
for(var G=this;G.MasterGrid;G=G.MasterGrid);
if(G.InUndoStart){ G.InUndoStart++; return; }
if(autoupdate) { G.UndoAutoUpdate = G.AutoUpdate; G.AutoUpdate = 0; }
var OU = G.OUndo;
if(G.OUndo){ 
   G.OUndoStart = OU;
   if(OU.Pos) { G.OUndo = [{Type:"Void"},{Type:"Start"}]; G.OUndo.Pos = 2; } 
   else { G.OUndo = [{Type:"Start"}]; G.OUndo.Pos = 1; }
   if(OU.Pos!=G.OUndoStart.length) G.OUndo[G.OUndo.Pos] = {Type:"Void"}; 
   
   }
G.InUndoStart = 1;
ME.Undo;
}
// -----------------------------------------------------------------------------------------------------------
TGP.UndoEnd = function(autoupdate){ 
MS.Undo;
for(var G=this;G.MasterGrid;G=G.MasterGrid);
if(G.InUndoStart>1) { G.InUndoStart--; return; }
if(autoupdate) G.AutoUpdate = G.UndoAutoUpdate;
var NU = G.OUndo, OU = G.OUndoStart;
if(NU && NU.Pos){ 
   G.OUndo = OU;
   var p = NU[0].Type!="Start" ? 1 : 0; 
   if(NU.Pos>p+1) { 
      if(NU.Pos==p+2) OU[OU.Pos++] = NU[p+1]; 
      else {
         for(var i=p;i<NU.Pos;i++) OU[OU.Pos++] = NU[i];
         OU[OU.Pos++] = { Type:"End" };
         }
      OU.length = OU.Pos;
      }
   }
G.OUndoStart = null;
G.InUndoStart = 0;
if(autoupdate && G.AutoUpdate) G.UploadChanges();
ME.Undo;
}
// -----------------------------------------------------------------------------------------------------------
TGP.AddUndo = function(U,merge){ 
MS.Undo;
var OU = this.GetUndo(); if(!OU) return;
if(OU.Merge) { merge = OU.Merge; OU.Merge = null; }
var calc = !OU.Pos||OU.Pos==1&&OU[0].Type=="Start"||OU.Pos!=OU.length;
if(OU.Pos!=OU.length&&this.Undo&128&&(U.Type=="Scroll"||U.Type=="Select"||U.Type=="Focus")) OU.splice(OU.Pos++,0,U);

else { OU[OU.Pos++] = U; OU.length = OU.Pos; }
if(merge==1) this.MergeUndo(U.Type);
else if(merge==2) this.MergeUndo();
else {
   merge = this.UndoMergeParsed[U.Type]; 
   if(merge) this.MergeUndo(merge); 
   else if(this.UndoMergeParsed[""]) this.MergeUndo(U.Type);
   }

if(calc) {
   this.CalculateSpaces(1);
   if(this.DetailSelected) for(var i=0;i<Grids.length;i++) if(Grids[i] && Grids[i].Undo && Grids[i].MasterGrid==this) Grids[i].CalculateSpaces(1);
   }
ME.Undo;
}

// -----------------------------------------------------------------------------------------------------------
TGP.GetLastUndo = function(){ 
MS.Undo;
var OU = this.GetUndo(); if(OU) for(var i=OU.Pos-1;i;i--) if(OU[i].Type!="End") return OU[i];
ME.Undo;
}
// -----------------------------------------------------------------------------------------------------------
TGP.SetUndo = function(U){ 
MS.Undo;
var OU = this.GetUndo(); if(OU){ 
   if(OU[OU.Pos-1].Type=="End") while(OU[OU.Pos-1].Type!="Start") OU.Pos--;
   OU[OU.Pos-1] = U; OU.length = OU.Pos; 
   } 
ME.Undo;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ClearUndo = function(calc){
MS.Undo;
for(var G=this;G.MasterGrid;G=G.MasterGrid);
if(G.Undo){ G.OUndo = []; G.OUndo.Pos = 0; if(calc) G.CalculateSpaces(1); } 
ME.Undo;
}
// -----------------------------------------------------------------------------------------------------------
TGP.CanUndo = function(){ for(var G=this;G.MasterGrid;G=G.MasterGrid); return G.EditMode&&G.Edit ? G.Edit.CanUndo() : G.OUndo && (!G.AutoUpdate||G.Undo&32) && (G.OUndo.Pos>1||G.OUndo.Pos==1&&G.OUndo[0].Type!="Start") && (!G.Locked.length||G.CountUndo(1)) ? 1 : 0; }
TGP.CanRedo = function(){ for(var G=this;G.MasterGrid;G=G.MasterGrid); return G.EditMode&&G.Edit ? G.Edit.CanRedo() : G.OUndo && (!G.AutoUpdate||G.Undo&32) && G.OUndo.Pos < G.OUndo.length && (!G.Locked.length||G.CountRedo(1)) ? 1 : 0; }
// -----------------------------------------------------------------------------------------------------------
MS.Undo;
// -----------------------------------------------------------------------------------------------------------
TGP.SetMergeUndo = function(m){
this.UndoMerge = m; var o = {}; this.UndoMergeParsed = o;
if(!m) return;
m = m.slice(1).split(m.charAt(0));
for(var i=0;i<m.length;i++){
   var n = m[i].split(","), p = {};
   for(var j=0;j<n.length;j++) { p[n[j]] = 1; o[n[j]] = p; }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.StartUndo = TGP.UndoStart;
TGP.EndUndo = TGP.UndoEnd;
TGP.CustomUndo = function(U,undo,redo){ this.AddUndo( { Type:"Custom", Object:U, Undo:undo, Redo:redo } ); }
// -----------------------------------------------------------------------------------------------------------
TGP.MergeUndo = function(type,type2){
MS.Master; if(this.MasterGrid) return this.MasterGrid.MergeUndo(); ME.Master;
if(!this.OUndo) return;
var OU = this.OUndo, p = OU.Pos-1; if(p<0) return;
var t = null; 
if(type){
   if(typeof(type)!="string") t = type;
   else { t = {}; t[type] = 1; if(type2) t[type2] = 1; }
   }
if(OU[p].Type!="End") {
   p--; if(p<0) return;
   if(OU[p].Type!="End"){ 
      if(t&&!t[OU[p].Type]) return;
      if(OU.length==OU.Pos){ OU[p+2] = OU[p+1]; OU[p+1] = OU[p]; OU[p] = { Type:"Start" }; OU[p+3] = { Type:"End" }; OU.Pos = OU.length; } 
      else { OU.splice(p,2,{ Type:"Start" },OU[p],OU[p+1],{ Type:"End" }); OU.Pos += 2; }
      }
   else { 
      if(t) for(var i=p-1;i&&OU[i].Type!="Start";i--) if(!t[OU[i].Type]) return; 
      OU[p] = OU[p+1];
      OU[p+1] = { Type:"End" };
      }   
   }
else { 
   var n = 1; 
   while(n&&p){ p--; if(OU[p].Type=="Start") n--; else if(OU[p].Type=="End") n++; }
   p--; if(p<0) return;
   if(OU[p].Type!="End") { 
      if(t&&!t[OU[p].Type]) return;
      OU[p+1] = OU[p];
      OU[p] = { Type:"Start" };
      }
   else { 
      if(t) for(var i=p-1;i&&OU[i].Type!="Start";i--) if(!t[OU[i].Type]) return; 
      for(var i=p;i<OU.length-2;i++) OU[i] = OU[i+2];
      OU.length -= 2;
      if(OU.Pos>p) OU.Pos -= 2;
      }
   }
}
// -----------------------------------------------------------------------------------------------------------
TGP.CountUndo = function(cnt,blocks){
if(!cnt) cnt = 1e5;
var block = 0, items = 0, zal = cnt, L = this.Locked;
for(var i=this.OUndo.Pos-1;i>=0 && cnt;i--){
   var t = this.OUndo[i].Type;
   if(t=="End") block++;
   else if(t=="Start") block--;
   else if(L[CUndoLock[t]]) return 0;
   else items++;
   if(!block) cnt--;   
   }
return blocks ? zal-cnt : items;   
}
// -----------------------------------------------------------------------------------------------------------
TGP.DoUndo = function(cnta,refresh,recur,hidemess){
MS.Master; if(this.MasterGrid) return this.MasterGrid.DoUndo(cnta,refresh); ME.Master;
if(this.EditMode&&this.Edit) { this.Edit.Undo(); return true; }
var OU = this.OUndo, upd = 0, recalc = 0;
if(!OU || !this.OUndo.Pos || this.AutoUpdate&&!(this.Undo&32)) return false;
var cnt = this.CountUndo(cnta);
if(!cnt) return false;
if(!recur && refresh && cnt>=this.SynchroCount) {
   this.ShowMessage(this.GetText("DoUndo"));
   var T = this; setTimeout(function(){ T.DoUndo(cnta,1,1,1); },10);
   return;   
   }
this.OUndo = null; 
var A = null, AC = null, anim = 0, slack = 0;
MS.Animate; 
if(!this.SuppressAnimations&&refresh&&this.AnimateUndo) { 
   if(this.AnimateRows) { A = []; var T = this, FCnt = 0, F = [], FF = function(){ if(!--FCnt) T.ClearRows(F,1); } }        
   if(this.AnimateCols) { AC = []; var T = this, FCCnt = 0, FC = [], FFC = function(){ if(!--FCCnt) T.DelColsUndo(FC); } }  
   if(this.AnimateCells) anim = 1;
   this.FinishAnimations();
   }
ME.Animate;
this.InUndo = 1;
var autoupdate = this.AutoUpdate;
if(Grids.OnUndo) Grids.OnUndo(this,"Start");
if(cnt>3) { this.StartUpdate(); upd = 1; }
var auto = this.RemoveAutoPages, render = false, updhid = false, calctree = 0;
for(var oi=OU.Pos-1;oi>=0 && cnt;oi--,cnt--){
   var U = OU[oi], t = U.Type;
   if(auto && U.Row) while(U.Row.Removed==2) this.AddAutoPages();
   switch(t){
      case "Accept" :
         if(OU.Rev) OU.Rev++; else OU.Rev = 1;
         break;
      case "Change" : 
         if(U.Row.Removed) break; 
         
         
         if(OU.Rev) this.SetValue(U.Row,U.Col,U.OldVal,anim?"UndoChange":refresh);
         else {
            U.Row[U.Col+"Changed"] = U.CellChanged;
            this.SetValue(U.Row,U.Col,U.OldVal,anim?"UndoChange":refresh,0,2,1,1,!U.CellChanged,null,U.UpdateHeight);
            
            if(this.SaveOrder && !Is(U.Row,"NoUpload") && !U.CellChanged && U.Row.Kind!="Filter") this.SetChange({ Row:U.Row.id,Col:U.Col,Val:U.OldVal });
            if(U.Row.Changed != U.RowChanged) { 
               U.Row.Changed = U.RowChanged; 
               if(this.ColorState&2) this.ColorRow(U.Row); 
               MS.Master; if(U.Row.DetailRow) for(var i=0;i<U.Row.DetailRow.length;i++) { U.Row.DetailRow[i].Changed = 0; if(U.Row.DetailGrid[i].ColorState&2) U.Row.DetailGrid[i].ColorRow(U.Row.DetailRow[i]); } ME.Master;
               }
            }
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Row,U.Col,U.NewVal);
         recalc = 1;
         break;
      case "Add" :
         if(U.Row.Removed) break; 
         
         if(OU.Rev){
            var zal = U.Row.CanDelete; U.Row.CanDelete = 1;
            this.DeleteRow(U.Row,2);
            U.Row.CanDelete = zal;
            }
         else {
            if(this.SaveOrder && !Is(U.Row,"NoUpload") && !U.Row.CPage) this.SetChange({ Row:U.Row.id,Deleted:1 });
            if(refresh){
               U.Row.Deleted = 1;
               this.HideRow(U.Row,A?0:1,0,1);
               this.Recalculate(U.Row,null,1);
               MS.Animate; 
               if(A) { A.push([U.Row,"UndoAdd",-1,FF]); F.push(U.Row); FCnt++; }
               ME.Animate;
               }
            }
         calctree = 1;
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Row,U.Src);
         if(!OU.Rev && (!refresh||!A)) this.DelRow(U.Row);
         break;   
      case "Remove" :
      case "Delete" :
         if(U.Row.Removed){ 
            var P, N = U.NextId; if(N) N = this.Rows[N];
            if(N) { 
               P = N.parentNode;
               if(U.Page && P.previousSibling) { P = P.previousSibling; N = null; }
               }
            else if(U.Page) P = this.XB.lastChild;
            else if(U.Row.Fixed) P = U.Row.Fixed=="Head" ? this.XH : this.XF;
            else P = this.Rows[U.ParentId];
            if(P) { 
               if(N) P.insertBefore(U.Row,N); else P.appendChild(U.Row); 
               U.Row.Removed = null;
               if(OU.Rev) U.Row.Added = 1; 
               U.Row.Deleted = 0;
               if(this.SetIds) this.Rows[U.Row.id] = U.Row;
               this.LoadedCount++;
               if(typeof(U.Row.Def)=="string") U.Row.Def = this.Def[U.Row.Def]; 
               if(!U.Row.Def) U.Row.Def = this.Def.R;
               U.Row.Visible = 0; if(!U.Row.Hidden) this.ShowRow(U.Row,null,null,1);
               if(U.Row.Fixed&&!U.Row.r1) render = 1; 
               if(P.Count!=null) P.Count++; 
               }
            if(t=="Remove"){
               if(Grids.OnUndo) Grids.OnUndo(this,t,U.Row);
               break;
               }
            this.DeleteRowUndo(U.Row,"",refresh,upd);
            }
         else {
            this.DeleteRowUndo(U.Row,U.Deleted,refresh);
            if(U.Row.Fixed&&!U.Row.r1) render = 1; 
            }
         if(this.SaveOrder && !Is(U.Row,"NoUpload")) this.SetChange({ Row:U.Row.id,Deleted:0 });
         if(!U.Row.Expanded && U.Expanded){
            if(refresh) this.Expand(U.Row,null,null,null,1);
            else U.Row.Expanded = 1;
            }
         calctree = 1;
         MS.Animate; if(A) A.push([U.Row,(U.Row.Deleted?"UndoUndelete":"UndoDelete")+(this.ShowDeleted?"Visible":""),-1]); ME.Animate;
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Row);
         break;   
      case "Move" :
         if(auto && U.OldParent) while(U.OldParent.Removed==2) this.AddAutoPages();
         if(refresh) this.MoveRows(U.Row,U.OldNext?U.OldNext:U.OldParent,U.OldNext?1:2); 
         else this.MoveRow(U.Row,U.OldParent,U.OldNext,refresh);
         if(this.SaveOrder){
            if(U.Moved&&typeof(U.Moved)=="object") for(var id in U.Moved) this.SetChange({ Row:this.Rows[id],Moved:U.Moved[id] });
            else if(!Is(U.Row,"NoUpload")) this.SetChange({ Row:U.Row.id,Moved:U.Moved });
            }
         if(!autoupdate) {
            function SetMoved(G,row,mov){
               row.Moved = mov; if(refresh && G.ColorState&2) G.ColorRow(row);
               if(row.DetailRow) for(var i=0;i<row.DetailRow.length;i++) SetMoved(row.DetailGrid[i],row.DetailRow[i],mov);
               }
            if(U.Moved&&typeof(U.Moved)=="object") for(var id in U.Moved) SetMoved(this,this.Rows[id],OU.Rev ? (U.Parent==U.OldParent&&U.Moved[id]!=2?1:2) : U.Moved[id]);
            else SetMoved(this,U.Row,OU.Rev ? (U.Parent==U.OldParent&&U.Row.Moved!=2?1:2) : U.Moved);
            }
         calctree = 1;
         MS.Animate; if(A) A.push([U.Row,"UndoMove",1]); ME.Animate;
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Row,U.Parent,U.Next);
         break;
      case "DelPage":
         this.XB.insertBefore(U.Page,U.Next);
         this.AddBody(1,U.Page);
         U.Page.State = 2;
         U.Page.Removed = null;
         
         break;
      case "Show":
         this.HideRow(U.Row); calctree = 1;
         MS.Animate; if(A) A.push([U.Row,"UndoShow",1]); ME.Animate;
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Row);
         break;
      case "Hide":
         this.ShowRow(U.Row); calctree = 1;
         MS.Animate; if(A) A.push([U.Row,"UndoHide",1]); ME.Animate;
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Row);
         break;
      case "Span" :
         this.SplitSpanned(U.Row,U.Col);
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Row,U.Col,U.Row2,U.Col2);
         break;
      case "Split" :
      case "SplitAuto" : 
         this.SpanRange(U.Row,U.Col,U.Row2,U.Col2);
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Row,U.Col,U.Row2,U.Col2);
         break;
      case "ColsVisibility":
         var zalren = this.Rendering; this.Rendering = 0;
         this.ChangeColsVisibility(U.Hide,U.Show);
         MS.Animate; if(AC) { if(U.Show) AC.push([U.Show,"UndoShowCol"+(U.Show.length>1?"s":"")],null,null,null,null,1); if(U.Hide) AC.push([U.Hide,"UndoHideCol"+(U.Hide.length>1?"s":"")]); } ME.Animate;
         this.Rendering = zalren;
         
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Show,U.Hide);
         break;
      case "MoveCol":
         if(this.MoveCol(U.Col,U.ToOld,U.RightOld,null,1,null,1)) render = true;
         
         MS.Animate; if(AC) AC.push([U.Col,"UndoMoveCol"]); ME.Animate;
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Col,U.ToCol,U.Right);
         break;
      case "AddCol":
         if(!AC||!this.FastColumns) this.DelCol(U.Col);
         updhid = 1;
         MS.Animate; if(AC&&this.FastColumns) { AC.push([U.Col,"UndoAddCol",FFC]); FC.push(U.Col); FCCnt++; } ME.Animate;
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Col,U.C);
         break;
      case "DeleteCol":
         U.C.Deleted = 0;
         if(U.C.Removed) { 
            U.C.Removed = null; 
            var pos = U.C.Pos;
            for(var sec=U.C.Sec-1;sec>=1;sec--) pos += this.ColNames[sec].length;
            U.C = this.AddCol(U.Col,U.C.MainSec,pos,U.C,U.Visible,null,null,1); 
            }
         this.DeleteColT(U.Col,U.Del?3:2,null,!U.Visible);
         updhid = 1;
         MS.Animate; if(AC) AC.push([U.Col,(U.Del?"UndoDeleteCol":"UndoUndeleteCol")+(this.ShowDeleted?"Visible":"")]); ME.Animate;
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Col,U.Del,U.C);
         break;
      case "ChangeDef" :
         this.ChangeDef(U.Row,U.OldDef,refresh);
         if(U.Values){ 
            for(var c in U.Values) { 
               U.Row[c+"Changed"] = U.Values[c][1];
               this.SetValue(U.Row,c,U.Values[c][0],refresh,0,2,1,1,!U.Values[c][1]); 
               if(U.Row.Changed != U.RowChanged) { U.Row.Changed = U.RowChanged; if(this.ColorState&2) this.ColorRow(U.Row); }
               }
            }
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Row,U.Def);
         break;
      case "SetLink":
      case "SetImg":
      case "SetAttribute" :
         this.SetAttribute(U.Row,U.Col,U.Attr,U.OldVal,refresh);
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Row,U.Col,U.Attr,U.Val);
         break;
      case "EditAttrs" :
         for(var j=0;j<U.Attrs.length;j++) U.Row[U.Col+U.Attrs[j]] = U.OldVals[j];
         if(refresh) this.RefreshCell(U.Row,U.Col);
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Row,U.Col,U.Attrs,U.Vals);
         break;
      
      case "GanttBase" : 
         
         break;
      case "GanttFinish" :
         
         break;
      case "Custom": 
         if(U.Undo && typeof(U.Undo)=="function") U.Undo(U.Object);
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Object);
         break;
      case "Focus":
         if(auto && U.ORow) while(U.ORow.Removed==2) this.AddAutoPages();
         var spec = render&&U.ORow&&!U.ORow.r1&&U.ORow.Fixed; 
         if(spec) { var zl = this.Loading; this.Loading = 1; }
         this.Focus(U.ORow,U.OCol,U.OPos,U.ORect,16);
         if(spec) this.Loading = zl;
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.ORow,U.OCol,U.OPos,U.ORect);
         break;
      case "UpdateRowHeight":
         this.UpdateRowHeight(U.Row,1);
         break;
      case "ResizeRow":
         MS.RowResize;
         
         U.Row.Height = U.OHeight;
         U.Row.OrigHeight = U.OrigHeight;
         U.Row.Resized = U.Resized;
         if(U.Row.Space) this.RefreshRow(U.Row);
         else {
            if(this.RowIndex) this.RefreshCell(U.Row,this.RowIndex); 
            this.UpdateRowHeight(U.Row,1,0,1);
            }
         MS.Animate; if(A) A.push([U.Row,"UndoResize"]); ME.Animate;
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.ORow,U.OHeight);
         ME.RowResize;
         break;
      case "ResizeCol":
         if(U.OWidth==null){ this.Cols[U.Col].RelWidth = 1; this.Update(); }
         else this.CapResize(U.Col,U.OWidth-this.Cols[U.Col].Width,U.Row,this.Cols[U.Col].Width,1);
         MS.Animate; if(AC) AC.push([U.Col,"UndoResizeCol"]); ME.Animate;
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Col,U.OWidth);
         break;
      case "ResizeSec":
         this.LeftWidth = U.OLeft; this.MidWidth = U.OMid; this.RightWidth = U.ORight;
         this.Update();
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.OLeft,U.OMid,U.ORight);
         break;
      case "ResizeMain":
         this.MainTag.style.width = U.OWidth; this.MainTag.style.height = U.OHeight;
         this.Update();
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.OWidth,U.OHeight);
         break;
      case "Select":
         if(U.OSel==null) break;
         if(U.Row&&U.Col) this.SelectCell(U.Row,U.Col,U.OSel,0,0,1,!oi||cnt==1||OU[oi-1].Type!="Select"||OU[oi-1].Row!=U.Row);
         else if(U.Row) { this.SelectRow(U.Row,U.OSel,0,0,1,1); MS.Animate; if(A) A.push([U.Row,U.OSel?"UndoSelect":"UndoDeselect"]); ME.Animate; }
         else if(U.Col) { this.SelectCol(U.Col,U.OSel,0,1,0,1); MS.Animate; if(AC) AC.push([U.Col,U.OSel?"UndoSelectCol":"UndoDeselectCol"]); ME.Animate; }
         else this.SelectAllRows(U.OSel,0,1);
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Row,U.Col,U.OSel);
         break;
      case "Filter":
         if(U.OpChange) U.Row[U.Col+"Filter"] = U.OldOp;
         else U.Row[U.Col] = U.OldVal;
         if(cnt<=1||!oi||OU[oi-1].Type!="Filter") this.DoFilter();
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Row,U.Col,U.OldVal,U.OldOp,U.OpChange);
         break;
      case "Sort":
         this.ChangeSort(U.OSort,0,0,0,1);
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.OSort);
         break;
      case "Search":
         this.DoSearch(U.OAction?U.OAction:"Clear",0,1);
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.OAction);
         break;
      case "Filtered":
         this.SetFiltered(U.OFiltered,0,null,1);
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.OFiltered);
         break;
      case "Grouped":
         if(U.OGrouped) this.DoGroupOn(null,1); else this.DoGroupOff(1);
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.OGrouped);
         break;
      case "Sorted":
         if(U.OSorted) this.ActionSortOn(null,0,null,1); else this.ActionSortOff(null,0,null,1);
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.OSorted);
         break;
      case "Searched":
         if(U.OSearched) this.ActionSearchOn(null,0,1); else this.ActionSearchOff(null,0,1);
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.OSearched);
         break;
      case "EFormula":
         U.Row[U.Col+"EFormula"] = U.OldVal;
         if(U.NewVal) delete this.EFormulas[U.Row.id+"$"+U.Col+"$"+U.NewVal];
         if(!U.Auto){
            U.Row[U.Col+"Changed"] = U.CellChanged;
            if(U.Row.Changed != U.RowChanged) { U.Row.Changed = U.RowChanged; if(refresh&&this.ColorState&2) this.ColorRow(U.Row); }
            }
         recalc = 1;
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Row,U.Col,U.NewVal,U.Auto);
         break;
      case "Error":
         U.Row[U.Col+"Error"] = U.OldVal;
         this.ColorCell(U.Row,U.Col);
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Row,U.Col,U.NewVal);
         break;
      case "Scroll":
         this.NoScrollUndoTo = new Date()-0+500;
         if(U.NV!=null && U.NV!=U.OV) {
            if(auto) while(U.OV > this.GetBodyScrollHeight()-this.GetBodyHeight()) this.AddAutoPages();
            this.SetScrollTop(U.OV);
            }
         if(U.NH[0]!=null && U.NH[0]!=U.OH[0]) this.SetScrollLeft(U.OH[0],0);
         if(U.NH[1]!=null && U.NH[1]!=U.OH[1]) {
            if(auto) while(U.OH[1] > this.GetBodyScrollWidth(1)-this.GetBodyWidth(1)) this.AddAutoColPages();
            this.SetScrollLeft(U.OH[1],1);
            }
         if(U.NH[2]!=null && U.NH[2]!=U.OH[2]) this.SetScrollLeft(U.OH[2],2);
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.OV,U.OH[0],U.OH[1],U.OH[2]);
         break;
      case "Border":
         
         break;
      case "BorderRow":
         
         break;
      case "BorderCol":
         
         break;
      case "Style":
      case "CanEdit":
         var row = U.Row, col = U.Col, A = U.Old;
         if(!row){
            var C = this.Cols[col], R = this.Rows, Cells = U.Cells;
            for(var n in A) C[n] = A[n];
            for(var id in Cells){ var rr = Cells[id], r = R[id]; for(var c in rr) r[c] = rr[c]; }
            for(var id in R) if(R[id].r1) if(U.Refresh==0) this.ColorCell(R[id],col); else this.RefreshCell(R[id],col);
            }
         else {
            for(var n in A) row[n] = A[n];
            if(U.Refresh==0){ if(col) this.ColorCell(row,col); else this.ColorRow(row); }
            else if(col) this.RefreshCell(row,col); else this.RefreshRow(row);
            MS.Animate; if(anim&&row&&col) this.AnimCell(row,col,"UndoStyle"); ME.Animate;
            }
         if(Grids.OnUndo) Grids.OnUndo(this,t,row,col,A,U.Cells);
         break;
      case "IndentCol":
         this.Cols[U.Col].Level = U.OldLevel;
         var O = U.Rows, R = this.Rows; for(var id in O){ for(var a in O[id]) R[id][a] = O[id][a]; this.RefreshRow(R[id]); }
         if(U.Show) this.HideRow(R[U.Show]);
         if(U.Hide) this.ShowRow(R[U.Hide]);
         if(Grids.OnUndo) Grids.OnUndo(this,t,col,U.OldLevel,U.Rows);
         break;
      case "Name":
         this.ChangeName(U.New,U.Old,0,0); recalc = 1;
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.New,U.Old);
         break;
      case "AddSpan":
      case "RemoveSpan":
         var D = U.Data, R = {};
         for(var i=D.length-4;i>=0;i-=4) {
            if(!D[i+3]||!this.Rows[D[i]][D[i+1]] && !D.RefreshRow[D[i]]) R[D[i]] = 1;
            this.Rows[D[i]][D[i+1]] = D[i+3];
            }
         for(var id in D.UpdateSpan) this.UpdateSpan(this.Rows[id]);
         for(var i=0;i<D.RefreshCell.length;i+=2) this.RefreshCell(this.Rows[D.RefreshCell[i]],D.RefreshCell[i+1]);
         if(t=="RemoveSpan") for(var id in D.UpdateRowSpan) this.UpdateRowSpan(this.Rows[id],1);
         for(var id in D.RefreshRow) this.RefreshRow(this.Rows[id]);
         for(var id in R) this.RefreshRow(this.Rows[id]);
         if(Grids.OnUndo) Grids.OnUndo(this,t,D);
         break;
      case "Calendars":
         this.ChangeGanttCalendars(U.Old);
         if(U.OldExclude!=null) { var C = this.Cols[this.GetFirstGantt()]; if(C&&C.GanttExclude!=U.OldExclude) { C.GanttExclude = U.OldExclude; this.CalculateSpaces(1); } }
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Old,U.OldExclude);
         break;
      case "FixAbove":
         this.FixAbove(U.First,null,null,1);
         render = 2;
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.First);
         break;
      case "FixBelow":
         this.FixAbove(U.Last,null,null,1);
         render = 2;
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Last);
         break;
      case "FixPrev":
         this.FixPrev(U.First,null,null,null,1);
         render = 1;
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.First);
         break;
      case "FixNext":
         this.FixAbove(U.Last,null,null,null,1);
         render = 1;
         if(Grids.OnUndo) Grids.OnUndo(this,t,U.Last);
         break;

      default: cnt++;
      }
   }
while(oi>=0 && OU[oi].Type=="Start") oi--;
OU.Pos = oi+1;

if(hidemess) this.HideMessage();
if(upd) this.EndUpdate();
if(Grids.OnUndo) Grids.OnUndo(this,"End");
this.InUndo = 0;
 
this.OUndo = OU;
if(calctree&&this.MainCol) this.CalcTreeWidth(render);
if(render==2&&(this.Paging==1||this.Paging==2)) this.CreatePages();
if(render) this.Render();
else if(updhid) this.UpdateHidden();
MS.Animate; this.OUndo = null; if(A) this.AnimRows(A); if(AC) this.AnimCols(AC); this.OUndo = OU; ME.Animate; 
if(this.DetailSelected) for(var i=0;i<Grids.length;i++) if(Grids[i] && Grids[i].Undo && Grids[i].MasterGrid==this) Grids[i].CalculateSpaces(1);
this.CalculateSpaces(1);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.CountRedo = function(cnt,blocks){
if(!cnt) cnt = 1e5;
var block = 0, items = 0, zal = cnt, L = this.Locked;
for(var i=this.OUndo.Pos;i<this.OUndo.length && cnt;i++){
   var t = this.OUndo[i].Type;
   if(t=="End") block--;
   else if(t=="Start") block++;
   else if(L[CUndoLock[t]]) return 0;
   else items++;
   if(!block) cnt--;   
   }
return blocks ? zal-cnt : items;
}
// -----------------------------------------------------------------------------------------------------------
TGP.DoRedo = function(cnta,refresh,recur,hidemess){
MS.Master; if(this.MasterGrid) return this.MasterGrid.DoRedo(cnta,refresh); ME.Master;
if(this.EditMode&&this.Edit) { this.Edit.Redo(); return true; }
var OU = this.OUndo, upd = 0, recalc = 0;
if(!OU || !OU.length || this.AutoUpdate&&!(this.Undo&32)) return false;
var cnt = this.CountRedo(cnta);
if(!cnt) return false;
if(!recur && refresh && cnt>=this.SynchroCount) {
   this.ShowMessage(this.GetText("DoRedo"));
   var T = this; setTimeout(function(){ T.DoRedo(cnta,1,1,1); },10);
   return;   
   }
this.OUndo = null; 
var A = null, AC = null, anim = 0, slack = 0;
MS.Animate; 
if(!this.SuppressAnimations&&refresh&&this.AnimateUndo) { 
   if(this.AnimateRows) { A = []; var T = this, FCnt = 0, F = [], FF = function(){ if(!--FCnt) T.ClearRows(F,1); } }  
   if(this.AnimateCols) { AC = []; var T = this, FCCnt = 0, FC = [], FFC = function(){ if(!--FCCnt) T.DelColsUndo(FC); } } 
   if(this.AnimateCells) anim = 1;
   this.FinishAnimations();
   }
ME.Animate;
this.InUndo = 1;
var autoupdate = this.AutoUpdate;
if(Grids.OnRedo) Grids.OnRedo(this,"Start");
if(cnt>3) { this.StartUpdate(); upd = 1; }
var auto = this.RemoveAutoPages, render = false, updhid = false, calctree = 0;
for(var oi=OU.Pos;oi<OU.length && cnt;oi++,cnt--){
   var U = OU[oi], t = U.Type;
   if(auto && U.Row) while(U.Row.Removed==2) this.AddAutoPages();
   switch(t){
      case "Accept" :
         if(OU.Rev) OU.Rev--;
         
         break;
      case "Change" : 
         
         
         this.SetValue(U.Row,U.Col,U.NewVal,anim?"RedoChange":refresh,null,null,null,null,null,null,U.UpdateHeight);
         
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row,U.Col,U.OldVal);
         recalc = 1;
         break;
      case "Add" :
      
         MS.Add;
         if(OU.Rev && !U.Row.Removed){
            var zal = U.Row.CanDelete; U.Row.CanDelete = 1;
            this.DeleteRow(U.Row,3);
            U.Row.CanDelete = zal;
            }
         else {
            if(auto && U.Parent) while(U.Parent.Removed==2) this.AddAutoPages();
            
            U.Row.DetailRow = null;
            if(U.Src) { var vis = U.Src.Visible; U.Src.Visible = U.SrcVisible; }
            this.AddRow(U.Parent,U.Next,refresh,U.Id,U.Def,U.Src,null,null,null,U.Row);
            if(U.Src) U.Src.Visible = vis;
            if(U.Copy) {
               U.Row.State = 0;
               U.Row.Count = U.Count;
               U.Row.Copy = U.Copy;
               this.UpdateIcon(U.Row);
               }
            if(U.Expanded!=null) { U.Row.Expanded = U.Expanded; this.UpdateIcon(U.Row); }
            if(U.Deleted!=null) { U.Row.Deleted = U.Deleted; if(this.ColorState&2) this.ColorRow(U.Row); }

            }
         if(!upd) this.Recalculate(U.Row,null,refresh);
         if(OU.Rev && refresh) this.UploadChanges(U.Row);
         calctree = 1;
         
         MS.Animate; if(A) A.push([U.Row,"RedoAdd"]); ME.Animate;
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row,U.Src);
         ME.Add;
         break; 
      case "Delete" :
         
         MS.Delete;
         if(this.SaveOrder && !Is(U.Row,"NoUpload")) this.SetChange({ Row:U.Row.id,Deleted:1 });
         this.DeleteRowRedo(U.Row,U.Del,refresh,upd,U.Removed&&!A);
         if(refresh&&OU.Rev) this.UploadChanges(U.Row);
         calctree = 1;
         MS.Animate; 
         if(A) {
            A.push([U.Row,(!U.Row.Deleted?"RedoUndelete":"RedoDelete")+(this.ShowDeleted?"Visible":""),-1,U.Removed?FF:null]); 
            if(U.Removed) { F[F.length] = U.Row; FCnt++; }
            }
         ME.Animate;
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row);
         ME.Delete;
         break;   
      case "Remove": break;
      case "Move" :
         MS.Move; 
         if(auto && U.Parent) while(U.Parent.Removed==2) this.AddAutoPages();
         if(refresh) this.MoveRows(U.Row,U.Next?U.Next:U.Parent,U.Next?1:2); 
         else this.MoveRow(U.Row,U.Parent,U.Next,refresh); 
         if(OU.Rev && !autoupdate){
            for(var p=oi+1,rev=OU.Rev,mov=0;p<OU.length;p++){
               if(OU[p].Type=="Accept" && !--rev) {
                  if(p<=cnt) mov = U.Row.Moved;
                  break;
                  }
               if(OU[p].Type=="Move" && OU[p].Row==U.Row) {
                  if(OU[p].Parent==OU[p].OldParent) { if(!mov) mov = 1; }
                  else { mov = 2; break; }
                  }
               }
            if(U.Row.Moved!=mov) { U.Row.Moved = mov; if(this.ColorState&2) this.ColorRow(U.Row); }
            }
         calctree = 1;
         MS.Animate; if(A) A.push([U.Row,"RedoMove",1]); ME.Animate;
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row,U.OldParent,U.OldNext);
         ME.Move;
         break;
      case "DelPage": break;
      case "Show":
         this.ShowRow(U.Row); calctree = 1;
         MS.Animate; if(A) A.push([U.Row,"RedoShow",1]); ME.Animate;
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row);
         break;
      case "Hide":
         this.HideRow(U.Row); calctree = 1;
         MS.Animate; if(A) A.push([U.Row,"RedoHide",1]); ME.Animate;
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row);
         break;         
      case "Span" :
         this.SpanRange(U.Row,U.Col,U.Row2,U.Col2,U.Plus);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row,U.Col,U.Row2,U.Col2);
         break;
      case "SplitAuto" :
         break;
      case "Split" :
         this.SplitSpanned(U.Row,U.Col);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row,U.Col,U.Row2,U.Col2);
         break;
      case "ColsVisibility":
         var zalren = this.Rendering; this.Rendering = 0;
         this.ChangeColsVisibility(U.Show,U.Hide);
         MS.Animate; if(AC) { if(U.Show) AC.push([U.Show,"RedoShowCol"+(U.Show.length>1?"s":"")]); if(U.Hide) AC.push([U.Hide,"RedoHideCol"+(U.Hide.length>1?"s":""),null,null,null,null,1]); } ME.Animate;
         this.Rendering = zalren;
         
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Show,U.Hide);
         break;
      case "MoveCol":
         if(this.MoveCol(U.Col,U.ToCol,U.Right,null,1,null,1)) render = true;
         
         MS.Animate; if(AC) AC.push([U.Col,"RedoMoveCol"]); ME.Animate;
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Col,U.ToOld,U.RightOld);
         break;
      case "AddCol":
         this.AddCol(U.Col,U.C.MainSec,U.C.Pos,U.C,U.Visible);
         updhid = 1;
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Col,U.C);
         MS.Animate; if(AC) AC.push([U.Col,"RedoAddCol"]); ME.Animate;
         break;
      case "DeleteCol":
         this.DeleteColT(U.Col,U.Del?2:3,U.Removed,U.Removed&&AC);
         updhid = 1;
         MS.Animate; if(AC) { AC.push([U.Col,(U.Del?"RedoDeleteCol":"RedoUndeleteCol")+(this.ShowDeleted?"Visible":""),U.Removed?FFC:null,null,null,null,1]); if(U.Removed){ FC.push(U.Col); FCCnt++; } } ME.Animate;
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Col,U.Del,U.C);
         break;
      case "ChangeDef" :
         this.ChangeDef(U.Row,U.Def,refresh);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row,U.OldDef);
         break;
      case "SetLink":
      case "SetImg":
      case "SetAttribute" :
         this.SetAttribute(U.Row,U.Col,U.Attr,U.Val,refresh);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row,U.Col,U.Attr,U.OldVal);
         break;
      case "EditAttrs" :
         for(var j=0;j<U.Attrs.length;j++) U.Row[U.Col+U.Attrs[j]] = U.Vals[j];
         if(refresh) this.RefreshCell(U.Row,U.Col);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row,U.Col,U.Attrs,U.OldVals);
         break;
      
      case "GanttBase" : 
         
         break;
      case "GanttFinish" :
         
         break;
      case "Custom": 
         if(U.Redo && typeof(U.Redo)=="function") U.Redo(U.Object);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Object);
         break;
      case "Focus":
         this.Focus(U.Row,U.Col,U.Pos,U.Rect,16);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row,U.Col,U.Pos,U.Rect);
         break;
      case "ResizeRow":
         MS.RowResize;
         this.ResizeRow(U.Row,U.Height,1);
         MS.Animate; if(A) A.push([U.Row,"RedoResize"]); ME.Animate;
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row,U.Height);
         ME.RowResize;
         break;
      case "ResizeCol":
         this.CapResize(U.Col,U.Width-this.Cols[U.Col].Width,U.Row,this.Cols[U.Col].Width,1);
         MS.Animate; if(AC) AC.push([U.Col,"RedoResizeCol"]); ME.Animate;
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Col,U.Width);
         break;
      case "ResizeSec":
         this.LeftWidth = U.Left; this.MidWidth = U.Mid; this.RightWidth = U.Right;
         this.Update();
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Left,U.Mid,U.Right);
         break;
      case "ResizeMain":
         this.MainTag.style.width = U.Width; this.MainTag.style.height = U.Height;
         this.Update();
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Width,U.Height);
         break;
      case "Select":
         if(U.Sel==null) break;
         if(U.Row&&U.Col) this.SelectCell(U.Row,U.Col,U.Sel,0,0,1,oi==OU.length-1||cnt==1||OU[oi+1].Type!="Select"||OU[oi+1].Row!=U.Row);
         else if(U.Row) { this.SelectRow(U.Row,U.Sel,0,0,1,1); MS.Animate; if(A) A.push([U.Row,U.Sel?"RedoSelect":"RedoDeselect"]); ME.Animate; }
         else if(U.Col) { this.SelectCol(U.Col,U.Sel,0,1,0,1); MS.Animate; if(AC) AC.push([U.Col,U.Sel?"RedoSelectCol":"RedoDeselectCol"]); ME.Animate; }
         else this.SelectAllRows(U.Sel,0,1);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row,U.Col,U.Sel);
         break;
      case "Filter":
         if(U.OpChange) U.Row[U.Col+"Filter"] = U.NewOp;
         else U.Row[U.Col] = U.NewVal;
         if(cnt<=1||oi==OU.length-1||OU[oi+1].Type!="Filter") this.DoFilter();
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row,U.Col,U.NewVal,U.NewOp,U.OpChange);
         break;
      case "Sort":
         this.ChangeSort(U.Sort,0,0,0,1);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Sort);
         break;
      case "Search":
         this.DoSearch(U.Action?U.Action:"Clear",0,1);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Action);
         break;
      case "Filtered":
         this.SetFiltered(U.Filtered,0,null,1);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Filtered);
         break;
      case "Grouped":
         if(U.Grouped) this.DoGroupOn(null,1); else this.DoGroupOff(1);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Grouped);
         break;
      case "Sorted":
         if(U.Sorted) this.ActionSortOn(null,0,null,1); else this.ActionSortOff(null,0,null,1);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Sorted);
         break;
      case "Searched":
         if(U.Searched) this.ActionSearchOn(null,0,1); else this.ActionSearchOff(null,0,1);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Searched);
         break;
      case "EFormula":
         U.Row[U.Col+"EFormula"] = U.NewVal;
         if(U.OldVal) delete this.EFormulas[U.Row.id+"$"+U.Col+"$"+U.OldVal];
         if(!U.Auto){
            var nochg = this.GetAttr(U.Row,U.Col,"NoChanged");
            if(!nochg){  
               if(!U.Row[U.Col+"Changed"]) { U.Row[U.Col+"Changed"] = 1; if(U.Row.Changed && refresh) this.ColorCell(U.Row,U.Col); }
               if(!U.Row.Changed) { U.Row.Changed = 1; if(refresh && this.ColorState&2) this.ColorRow(U.Row); }
               }
            }
         recalc = 1;
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row,U.Col,U.OldVal);
         break;
      case "Error":
         U.Row[U.Col+"Error"] = U.NewVal;
         this.ColorCell(U.Row,U.Col);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row,U.Col,U.OldVal);
         break;
      case "Scroll":
         this.NoScrollUndoTo = new Date()-0+500;
         if(U.NV!=null && U.NV!=U.OV) {
            if(auto) while(U.NV > this.GetBodyScrollHeight()-this.GetBodyHeight()) this.AddAutoPages();
            this.SetScrollTop(U.NV);
            }
         if(U.NH[0]!=null && U.NH[0]!=U.OH[0]) this.SetScrollLeft(U.NH[0],0);
         if(U.NH[1]!=null && U.NH[1]!=U.OH[1]) {
            if(auto) while(U.NH[1] > this.GetBodyScrollWidth(1)-this.GetBodyWidth(1)) this.AddAutoColPages();
            this.SetScrollLeft(U.NH[1],1);
            }
         if(U.NH[2]!=null && U.NH[2]!=U.OH[2]) this.SetScrollLeft(U.NH[2],2);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.NV,U.NH[0],U.NH[1],U.NH[2]);
         break;
      case "Border":
         
         break;
      case "BorderRow":
         
         break;
      case "BorderCol":
         
         break;
      case "Style":
         this.SetCellStyle(U.Row,U.Col,U.Val,1);
         MS.Animate; if(anim&&U.Row&&U.Col) this.AnimCell(U.Row,U.Col,"RedoStyle"); ME.Animate;
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row,U.Col,U.Val);
         break;
      case "CanEdit":
         this.SetCanEdit(U.Row,U.Col,U.Val["CanEdit"]);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row,U.Col,U.Val);
         break;
      case "IndentCol":
         this.IndentCols(U.Col,0,0,U.NewLevel<U.OldLevel?1:0);
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Col,U.NewLevel);
         break;
      case "Name":
         this.ChangeName(U.Old,U.New,0,0); recalc = 1;
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Old,U.New);
         break;
      case "AddSpan":
      case "RemoveSpan":
         if(U.Remove) break; 
         var D = U.Data, R = {};
         for(var i=0;i<D.length;i+=4) {
            if(!D[i+2]||!this.Rows[D[i]][D[i+1]] && !D.RefreshRow[D[i]]) R[D[i]] = 1;
            this.Rows[D[i]][D[i+1]] = D[i+2];
            }
         for(var id in D.UpdateSpan) this.UpdateSpan(this.Rows[id]);
         for(var i=0;i<D.RefreshCell.length;i+=2) this.RefreshCell(this.Rows[D.RefreshCell[i]],D.RefreshCell[i+1]);
         if(t=="AddSpan") for(var id in D.UpdateRowSpan) this.UpdateRowSpan(this.Rows[id],1);
         for(var id in D.RefreshRow) this.RefreshRow(this.Rows[id]);
         for(var id in R) this.RefreshRow(this.Rows[id]);
         if(Grids.OnRedo) Grids.OnRedo(this,t,D);
         break;
      case "Calendars":
         this.ChangeGanttCalendars(U.New);
         if(U.NewExclude!=null) { var C = this.Cols[this.GetFirstGantt()]; if(C&&C.GanttExclude!=U.NewExclude) { C.GanttExclude = U.NewExclude; this.CalculateSpaces(1); } }
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.New,U.NewExclude);
         break;
      case "FixAbove":
         this.FixAbove(U.Row,null,null,1);
         render = 2;
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row);
         break;
      case "FixBelow":
         this.FixBelow(U.Row,null,null,1);
         render = 2;
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Row);
         break;
      case "FixPrev":
         this.FixPrev(U.Col,null,null,null,1);
         render = 1;
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Col);
         break;
      case "FixNext":
         this.FixNext(U.Col,null,null,null,1);
         render = 1;
         if(Grids.OnRedo) Grids.OnRedo(this,t,U.Col);
         break;
      default: cnt++;
      }
   }
while(oi<OU.length && OU[oi].Type=="End") oi++;


OU.Pos = oi;
if(hidemess) this.HideMessage();
if(upd) this.EndUpdate();
if(Grids.OnRedo) Grids.OnRedo(this,"End");
this.InUndo = 0;

this.OUndo = OU;
if(calctree&&this.MainCol) this.CalcTreeWidth(render);
if(render==2&&(this.Paging==1||this.Paging==2)) this.CreatePages();
if(render) this.Render();
else if(updhid) this.UpdateHidden();
MS.Animate; this.OUndo = null; if(A) this.AnimRows(A); if(AC) this.AnimCols(AC); this.OUndo = OU; ME.Animate; 
if(this.DetailSelected) for(var i=0;i<Grids.length;i++) if(Grids[i] && Grids[i].Undo && Grids[i].MasterGrid==this) Grids[i].CalculateSpaces(1);
this.CalculateSpaces(1);
return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.DelColsUndo = function(FC){
var OU = this.OUndo; this.OUndo = null;
this.NoUpdateHeights = new Date()-0;
for(var i=0;i<FC.length;i++) this.DelCol(FC[i]);
this.NoUpdateHeights = null;
this.UpdateHeights();
this.OUndo = OU;
this.CalculateSpaces(1); 
}
// -----------------------------------------------------------------------------------------------------------
MS.Debug;
// -----------------------------------------------------------------------------------------------------------
TGP.DebugUndo = function(){
var OU = this.OUndo, upd = 0, s = "var G=TGGrids['"+this.id+"'];\n";
for(var i=0;i<this.OUndo.Pos;i++){
   var U = OU[i];
   switch(U.Type){
      case "Change" : 
         s += "G.SetValue(G.Rows['"+U.Row.id+"'],'"+U.Col+"','"+U.NewVal+"',1);\n";
         break;
      case "Add" :
      case "Copy" :
         MS.Add;
         var or = U.Row;
         if(U.Type=="Add") s += "G.AddRow("+(U.Parent?(U.Parent.Page?"TGGetNode(G.XB,"+this.GetPageNum(U.Parent)+")":"G.Rows['"+U.Parent.id+"']"):"null")+","+(U.Next?"G.Rows['"+U.Next.id+"']":"null")+",1,"+(U.Id?"'"+U.Id+"'":"null")+","+(U.Def?"'"+U.Def+"'":"null")+","+(U.Master?1:0)+");\n";
         else s += "var r=G.CopyRow("+(U.Source?"G.Rows['"+U.Source.id+"']":"null")+","+(U.Parent?(U.Parent.Page?"TGGetNode(G.XB,"+this.GetPageNum(U.Parent)+")":"G.Rows['"+U.Parent.id+"']"):"null")+","+(U.Next?"G.Rows['"+U.Next.id+"']":"null")+","+(U.Grid?U.Grid.This:"null")+",0,"+U.Empty+","+(U.Id?"'"+U.Id+"'":"null")+");var p=r.parentNode,e=p.Expanded;"+this.This+".ShowRow(r);if(e!=p.Expanded)"+this.This+".Collapse(p);\n";
         ME.Add;
         break;   
      case "Delete" :
         s += "G.DeleteRowT(G.Rows['"+U.Row.id+"'],"+(U.Deleted?3:2)+",0);\n";
         break;   
      case "Move" :
         s += "G.MoveRow(G.Rows['"+U.Row.id+"'],"+(U.Parent?"G.Rows['"+U.Parent.id+"']":"null")+","+(U.Next?"G.Rows['"+U.Next.id+"']":"null")+",1);\n";
         break;   
      case "Span" :
         s += "G.SpanRange(G.Rows['"+U.Row.id+"'],'"+U.Col+"',G.Rows['"+U.Row2.id+"'],'"+U.Col2+"');\n";
         break;
      case "Split" :
         s += "G.SplitSpanned(G.Rows['"+U.Row.id+"'],'"+U.Col+"');\n";
         break;
      case "MoveCol":
         s += "G.MoveCol('"+U.Col+"','"+U.ToCol+"',"+U.Right+");\n";
         break;
      case "ChangeDef" :
         s += "G.ChangeDef(G.Rows['"+U.Row.id+"'],'"+U.Def.Name+",1');\n";
         break;
      case "SetAttribute" :
         s += "G.SetAttribute(G.Rows['"+U.Row.id+"'],'"+U.Col+"','"+U.Attr+"','"+U.Val+"',1);\n";
         break;
      }
   }
return s;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionDebugUndo = function(){  
if(!this.DebugFlags["error"]) return;
var s = this.DebugUndo();
this.CloseDialog();
this.Dialog = ShowDialog({
   Head:"Debug undo",
   Body:"<textarea id='DebugUndo' style='width:"+(this.MainTag.offsetWidth-10)+"px;height:"+(this.MainTag.offsetHeight-50)+"px;'>"+StringToXml(s)+"</textarea>",
   Foot:"<button class='"+this.Img.Style+"MenuButton' style='width:60px;' onclick='"+this.This+".CloseDialog();'>OK</button>"
      + "<button class='"+this.Img.Style+"MenuButton' style='width:60px;' onclick='"+this.This+".ActionTestUndo()'>Test</button>",
   Modal:1
   },{Tag:this.MainTag,Align:"center middle"});

}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionTestUndo = function(){  
if(!this.DebugFlags["error"]) return;
var s = this.DebugUndo();
this.CloseDialog();
Grids.OnRenderPageFinishZal = Grids.OnRenderPageFinish;
Grids.OnRenderPageFinish = new Function("G","setTimeout(function(){"+s+";alert('Undo actions finished');},100);TGGrids.OnRenderPageFinish=TGGrids.OnRenderPageFinishZal;if(Grids.OnRenderPageFinish)TGGrids.OnRenderPageFinish(G);");
this.Reload();
}
// -----------------------------------------------------------------------------------------------------------
ME.Debug;
// -----------------------------------------------------------------------------------------------------------
TGP.ActionUndo = function(dummy,T){ return T ? this.CanUndo() : this.DoUndo(1,1); }
TGP.ActionUndoAll = function(dummy,T){ return T ? (this.MasterGrid?this.MasterGrid.CountUndo(null,1):this.CountUndo(null,1)) : this.DoUndo(0,1); }
TGP.ActionRedo = function(dummy,T){ return T ? this.CanRedo() : this.DoRedo(1,1); }
TGP.ActionRedoAll = function(dummy,T){ return T ? (this.MasterGrid?this.MasterGrid.CountRedo(null,1):this.CountRedo(null,1)) : this.DoRedo(0,1); }
TGP.ActionClearUndo = function(dummy,T){ if(T) return this.CanUndo()||this.CanRedo(); this.ClearUndo(); return true; }
// -----------------------------------------------------------------------------------------------------------
ME.Undo;

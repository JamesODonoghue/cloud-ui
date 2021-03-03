// -----------------------------------------------------------------------------------------------------------
TGP.CellMenu = function(F,popup,test,old){
MS.CellMenu;
var A = this.GetACell(F); 
if(!A&&this.AImg&&(!(F&7)||F&4)) A = this.AImg;
if(!A) A = [this.GetARow(F)];
var row = A[0], col = A[1], T = this;
MS.Master; if(F&1&&!row&&this.FocusNested(test)) { row = this.Rows[this.LastFocus[1]]; col = this.LastFocus[2]; } ME.Master;

if(!row) return false;
 
if(this.Dialog && this.Dialog.Row==this.ARow && this.Dialog.Col==this.ACol){
   this.CloseDialog();
   return true;
   }

var M = null, SS = {"F":1,"S":2,"A":4,"R":8,"C":16,"W":32,"O":64};
if(old==1){ 
   if(F&1 && this.ARow && this.ARow.Space) M = this.ARow[this.ACol+"CopyMenu"];
   else if(this.Cols[this.ACol] && this.Cols[this.ACol].Type=="Panel") M = this.Cols[this.ACol].CopyMenu;
   else M = this.Cols.Panel.CopyMenu;
   }
else {
   if(M==null && this.ARow && this.ACol && this.Event.ClientX!=null) { 
      var typ = this.GetType(this.ARow,this.ACol);
      if(typ=="Panel"&&!popup) {
         if(M==null) M = this.GetAttr(this.ARow,this.ACol,this.Event["PartType"]+"Menu",null,1); 
         if(M==null) M = this.GetAttr(this.ARow,this.ACol,this.Event["PartType"].replace(this.Event["Part"],"")+"Menu"); 
         }
      if(M==null) M = this.GetAttr(this.ARow,this.ACol,"Menu",null,1); 
      }
   if(M==null && (F&1||this.AImg) && row && col) M = this.GetAttr(row,col,"Menu",null,1); 
   }
if(M==null && !row.Space) M = this.Menu;
if(Grids.OnGetMenu) { var tmp = Grids.OnGetMenu(this,row,col,M); if(tmp!=null) M = tmp; }
var copy = 0, L = this.Lang["MenuCell"]; if(!L) L = {};
if(typeof(M)=="object"){ var MM = M, M = {}; copy = 1; for(var n in MM) M[n] = MM[n]; } 
if(!M) return false; 
M = TMenu.InitMenu(M);
if(!M) return false; 
M.InitOk = false;
var hid = this.HideMenuUnused, em = this.EditMode;

function updateitems(I,f,cust,a){
for(var j=0;j<I.length;j++) { 
   if(I[j].Items) updateitems(I[j].Items,f,cust,a);
   else { I[j].Foc = f; I[j].Cust = cust; I[j].Func = a; I[j].FuncParam = I[j].Name; }
   }
}

function update(I){
   var A = [], p = 0;
   for(var i=0;i<I.length;i++){
      var II = I[i];
      if(copy){ var III = II; II = {}; for(var n in III) II[n] = III[n]; } 
      if(II.Items){
         II.Items = update(II.Items);
         if(!II.Items.length) {
            if(hid==3||hid==4) continue;
            II.Disabled = 1;
            }
         if((hid==2||hid==4) && II.Items.length==1) A[p++] = II.Items[0];
         else A[p++] = II;
         continue;
         }
      var n = II.Name; if(!n) continue;
      n += "";
      var pos = n.indexOf("@"), ident = null;
      if(pos>=0) { ident = n.slice(pos+1); if(ident-0) n = n.slice(0,pos); else { ident = ident.toLowerCase(); if(ident=="f"||ident=="s"||ident=="fc"||ident=="sc") n = n.slice(0,pos); else ident = null; } }
      var a = T["Action"+n], f = F, cust = 0;
      
      if(a==null){ 
         
         var M = n.match(/([FSARCWO]){1,5}$/g);
         
         if(M) {
            M = M[0]; for(var j=0,f=0;j<M.length;j++) f += SS[M[j]];
            
            n = n.slice(0,-M.length);
            a = T["Action"+n];
            }
         }
      if(a==null) { a = Grids[n]; if(!a || typeof(a)!="function") a = null; else cust = 1; }
      var ff = ""; if(f) for(var k=0,j=1,nam="FSARCWO";k<7;k++,j<<=1) if(f&j) ff += nam.charAt(k);
      var t = L[n+(em?"E":ff)]; if(t==null&&em) t = L[n+ff]; if(t==null&&f) t = L[n]; if(t==null) t = n; if(t&&!II.Text) II.Text = t; 
      if(a!=null && old!=2 && n!="s") { 
         if(!II.Text) continue;
         var c = cust ? Grids[n](T,f,1) : T["Action"+n](f,1); 
         if(!c||ident-0&&c<ident||ident=="f"&&row==T.FRow&&c==1||ident=="fc"&&col==T.FCol&&c==1||ident=="s"&&row.Selected&&c==1||ident=="sc"&&T.Cols[col]&&T.Cols[col].Selected&&c==1) {
            if(hid) continue;
            II.Disabled = 1;
            }
         if(typeof(c)=="object"&&(c.length||c.Items)&&I.Menu!=0){
            if(c.length>1&&typeof(c[0])!="object"&&typeof(c[1])=="object"){ 
               var cc = c[0]?c[0]:0, t = L[n+(em?"E":ff)+cc]; if(t==null&&em) t = L[n+ff+cc]; if(t==null&&f) t = L[n+cc]; if(t) II.Text = t;
               II.Text = II.Text.replace("%1",c[0]?c[0]:0);
               c = c[1];
               }
            if(c.Items) { updateitems(c.Items,f,cust,a); III = c.Items; }
            else {
               var III = [], tt = L[n+"Items"]; if(!tt) tt = "%1";
               for(var j=0;j<c.length;j+=2) III[III.length] = { Text:tt.replace("%1",c[j+1]?c[j+1]:c[j]).replace("%2",c[j]), Foc:f, Cust:cust, Func:a, FuncParam:c[j], Disabled:c[j]==null };
               }
            II.Items = III; II.Menu = 1;
            }
         else {
            var cc = c?c:0, t = L[n+(em?"E":ff)+cc]; if(t==null&&em) t = L[n+ff+cc]; if(t==null&&f) t = L[n+cc]; if(t) II.Text = t;
            II.Text = II.Text.replace("%1",cc);
            }
         II.Func = a;
         II.Foc = f;
         II.Cust = cust;
         }
      else if(II.Name=="-" && p && A[p-1].Name=="-") continue;
      A[p++] = II;
      }
   if(p && A[p-1].Name=="-") { A.length--; p--; }
   if(p && A[0].Name=="-") { A.splice(0,1); p--; }
   return A;
   }
M.Items = update(M.Items);
if(!M.Items.length) return false; 
M = TMenu.InitMenu(M);
if(test) return true;
this.CloseDialog(); this.HideTip();
if(M.Items.length==1 && !M.Items[0].Items && !M.Items[0].Disabled && !this.ShowMenuSingle) {  
   var I = M.Items[0];
   if(I.Func) return I.Func.apply(this,[F]);
   if(Grids.OnContextMenu) return !Grids.OnContextMenu(this,row,col,I.Value==null?I.Name:I.Value,I);
   MS.Debug; this.Debug(1,"No OnContextMenu event defined for custom popup menu item ",I.Name); ME.Debug;
   return false;
   }
if(this.Trans) this.TranslateMenu(row,col,M,null,"Menu");
if(row!=this.ARow) this.ScrollIntoView(row);
var arow = this.ARow, acol = this.ACol, aimg = this.AImg;
if(!arow&&!aimg) return false; 

var P;
if(!popup) { P = this.CellToWindow(arow,acol); P.X = P.AbsX; P.Y = P.AbsY; if(P.Height>(this.MaxCellHeightMenu!=null?this.MaxCellHeightMenu:150)) popup = 1; }
if(popup){ var A = EventToAbsolute({clientX:this.Event.ClientX,clientY:this.Event.ClientY}); P = {X:A[0], Y:A[1] }; }

M.OnCSave = function(I,V){
   M.Close();
   var zr = T.ARow, zc = T.ACol, zi = T.AImg; 
   T.ARow = arow; T.ACol = acol; T.AImg = aimg; T.UpdateCursors(1);  
   if(I.Func) {
      if(I.Cust) I.Func(T,I.Foc!=null?I.Foc:F,0,I.FuncParam);
      else I.Func.apply(T,[I.Foc!=null?I.Foc:F,0,I.FuncParam]);     
      }
   T.ARow = zr; T.ACol = zc;  T.AImg = zi;
   if(!I.Func){
      if(Grids.OnContextMenu) return !Grids.OnContextMenu(T,row,col,I?(I.Value==null?I.Name:I.Value):V.join(M.Separator),I);
      MS.Debug; T.Debug(1,"No OnContextMenu event defined for custom popup menu item ",I.Name); ME.Debug;
      }
   }

M.OnClose = function(){
   if(!(F&7)||F&4){ row[col+"Background"] = bck; T.ColorCell(row,col); }
   }
if(M.Class==null) M.Class = this.Img.Style + "CellMenu";
M.Separator = this.Lang.Format.ValueSeparator;
this.SetDialogBase(M,row,col,"Menu","Popup");
if(Grids.OnMenu && Grids.OnMenu(this,arow,acol,M,P)) return true;
M = ShowMenu(M,P); if(!M) return false;
this.Dialog = M;
if(!(F&7)||F&4){ 
   var bck = row[col+"Background"], rgb = this.Colors["CellMenu"];
   rgb += 0x2FFBFEFF; 
   var cr = (rgb>>20)-512; if(cr<0) cr = 0;
   var cg = ((rgb>>10)&1023)-512; if(cg<0) cg = 0;
   var cb = (rgb&1023)-512; if(cb<0) cb = 0;
   rgb = cr==255&&cg==255&&cb==255 ? "" : "rgb("+cr+","+cg+","+cb+")";
   row[col+"Background"] = rgb; 
   this.ColorCell(row,col); 
   }
ME.CellMenu;

return true;
}
// -----------------------------------------------------------------------------------------------------------
TGP.ActionShowMenu = function(F,T){ return this.CellMenu(F,0,T); }
TGP.ActionShowPopupMenu = function(F,T){ return this.CellMenu(F,1,T); }
TGP.ActionCopyMenu = function(F,T){ return this.CellMenu(F,0,T,1); }   
TGP.ActionShowPopupMenuNoActions = function(F,T){ return this.CellMenu(F,1,T,2); }
// -----------------------------------------------------------------------------------------------------------
TGP.ActionShowNoMenu = function(dummy,T){ 
if(T) return true;
this.CloseDialog();
this.ShowMessageTime(this.GetText("NoMenu"),500);
return true;
}

// -----------------------------------------------------------------------------------------------------------

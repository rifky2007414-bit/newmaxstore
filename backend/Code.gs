const COMMISSION_RATE = 0.10;
const ADMIN_EMAIL = 'admin@maxstore.lk';
const DEFAULT_ADMIN_PASSWORD = 'MaxStore@123';
const CATEGORIES = ['Electronics','Fashion','Photo & Camera','Beauty','Jewellery','Home & Living','Sports','Grocery','Shoes','Automotive','Mobiles','Computers','Accessories','Toys & Kids','Books','Health','Pet Supplies','Tools','Other'];
const SHEETS = {
  Users:['User ID','Name','Email','Phone','Password Hash','Role','Status','Created At'],
  Sellers:['Seller ID','User ID','Store Name','Phone','Status','Created At'],
  Products:['Product ID','Seller ID','Name','Category','Price','Stock','Image','Status','Created At','Updated At'],
  Orders:['Order ID','User ID','Amount','Admin Commission','Seller Amount','Payment Method','Delivery Method','District','Address','Status','Created At'],
  OrderItems:['Order ID','Product ID','Seller ID','Name','Price','Qty'],
  Reviews:['Review ID','Product ID','User ID','Rating','Comment','Created At'],
  Categories:['Category ID','Name'],
  Notifications:['Notification ID','User ID','Title','Message','Read','Created At'],
  Withdrawals:['Withdrawal ID','Seller ID','Amount','Status','Created At'],
  Support:['Ticket ID','User ID','Subject','Message','Status','Created At','Updated At']
};

function setup(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(name=>{const s=ss.getSheetByName(name)||ss.insertSheet(name);if(s.getLastRow()===0)s.appendRow(SHEETS[name]);});
  const cat=ss.getSheetByName('Categories');
  if(cat.getLastRow()<2)CATEGORIES.forEach((x,i)=>cat.appendRow(['CAT-'+(i+1),x]));
  ensureAdmin();
  return true;
}
function ensureAdmin(){
  if(!rows('Users').some(x=>String(x.Email).trim().toLowerCase()===ADMIN_EMAIL)){
    append('Users',{'User ID':'USR-ADMIN',Name:'MAX STORE OWNER',Email:ADMIN_EMAIL,Phone:'','Password Hash':hash(DEFAULT_ADMIN_PASSWORD),Role:'admin',Status:'active','Created At':new Date()});
  }
}
function doGet(){try{setup();return out({success:true,service:'MAX STORE API',message:'Connected 🚀',version:'3.0'});}catch(e){return out({success:false,error:String(e.message||e)});}}
function doPost(e){
  try{
    setup();
    const d=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
    switch(String(d.action||'')){
      case 'setup': return out({success:true,message:'Setup complete'});
      case 'register': return out(register(d));
      case 'login': return out(login(d));
      case 'products': return out({success:true,products:rows('Products').filter(x=>lower(x.Status)==='approved').map(productOut)});
      case 'categories': return out({success:true,categories:rows('Categories')});
      case 'allProducts': admin(d); return out({success:true,products:rows('Products').map(productOut)});
      case 'users': admin(d); return out({success:true,users:rows('Users').map(userOut)});
      case 'sellers': admin(d); return out({success:true,sellers:rows('Sellers').map(sellerOut)});
      case 'orders':
        if(d.adminUserId)admin(d);
        return out({success:true,orders:rows('Orders').map(orderOut)});
      case 'withdrawals': admin(d); return out({success:true,withdrawals:rows('Withdrawals').map(withdrawOut)});
      case 'addProduct': return out(addProduct(d));
      case 'updateProduct': return out(updateProduct(d));
      case 'deleteProduct': return out(deleteProduct(d));
      case 'sellerDashboard': return out(sellerDashboard(d));
      case 'createOrder': return out(createOrder(d));
      case 'updateSellerStatus': return out(changeStatus('Sellers','Seller ID',d.sellerId,'Status',d.status,d.adminUserId));
      case 'updateProductStatus': return out(changeStatus('Products','Product ID',d.productId,'Status',d.status,d.adminUserId));
      case 'updateOrderStatus': return out(changeStatus('Orders','Order ID',d.orderId,'Status',d.status,d.adminUserId));
      case 'updateWithdrawalStatus': return out(changeStatus('Withdrawals','Withdrawal ID',d.withdrawalId,'Status',d.status,d.adminUserId));
      case 'addReview': return out(addReview(d));
      case 'reviews': return out({success:true,reviews:rows('Reviews').filter(x=>String(x['Product ID'])===String(d.productId))});
      case 'createSupport': return out(createSupport(d));
      case 'support': admin(d); return out({success:true,tickets:rows('Support')});
      default: throw Error('Unknown action: '+d.action);
    }
  }catch(e){return out({success:false,error:String(e.message||e)});}
}

function register(d){
  const email=String(d.email||'').trim().toLowerCase(), password=String(d.password||''), name=String(d.name||'').trim();
  if(!name)throw Error('Full name is required.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Enter a valid email address.');
  if(password.length<6)throw Error('Password must contain at least 6 characters.');
  if(rows('Users').some(x=>lower(x.Email)===email))throw Error('This email is already registered.');
  const role=['buyer','seller','both'].includes(String(d.role))?String(d.role):'buyer';
  const userId=uid('USR');
  append('Users',{'User ID':userId,Name:name,Email:email,Phone:String(d.phone||'').trim(),'Password Hash':hash(password),Role:role,Status:'active','Created At':new Date()});
  let sellerId='';
  if(role==='seller'||role==='both'){sellerId=uid('SEL');append('Sellers',{'Seller ID':sellerId,'User ID':userId,'Store Name':String(d.storeName||name).trim(),Phone:String(d.phone||'').trim(),Status:'Pending','Created At':new Date()});}
  return {success:true,user:{userId,name,email,role,sellerId}};
}
function login(d){
  const email=String(d.email||'').trim().toLowerCase(), password=String(d.password||'');
  const u=rows('Users').find(x=>lower(x.Email)===email&&String(x['Password Hash'])===hash(password));
  if(!u)throw Error('Invalid email or password.');
  if(lower(u.Status)==='blocked')throw Error('This account is blocked.');
  const role=email===ADMIN_EMAIL?'admin':lower(u.Role||'buyer');
  let sellerId='';
  if(role==='seller'||role==='both'){const s=rows('Sellers').find(x=>String(x['User ID'])===String(u['User ID']));sellerId=s?s['Seller ID']:'';}
  return {success:true,user:{userId:u['User ID'],name:u.Name,email:u.Email,phone:u.Phone,role,status:u.Status,sellerId}};
}
function addProduct(d){
  sellerOwns(d.sellerId,'');
  const name=String(d.name||'').trim(), price=Number(d.price), stock=Math.max(0,Number(d.stock||0));
  if(!name||!Number.isFinite(price)||price<=0)throw Error('Valid product name and price are required.');
  const id=uid('PRD');append('Products',{'Product ID':id,'Seller ID':d.sellerId,Name:name,Category:CATEGORIES.includes(d.category)?d.category:'Other',Price:price,Stock:stock,Image:String(d.image||'').trim(),Status:'Pending','Created At':new Date(),'Updated At':new Date()});
  return {success:true,productId:id};
}
function updateProduct(d){
  sellerOwns(d.sellerId,'');const f=find('Products','Product ID',d.productId);if(!f)throw Error('Product not found.');if(String(f.values['Seller ID'])!==String(d.sellerId))throw Error('You do not own this product.');
  const sh=f.sheet, h=f.headers;[['Name',String(d.name||'').trim()],['Category',CATEGORIES.includes(d.category)?d.category:'Other'],['Price',Number(d.price)],['Stock',Math.max(0,Number(d.stock||0))],['Image',String(d.image||'').trim()],['Status','Pending'],['Updated At',new Date()]].forEach(([k,v])=>sh.getRange(f.row,h.indexOf(k)+1).setValue(v));return{success:true};
}
function deleteProduct(d){
  const f=find('Products','Product ID',d.productId);if(!f)throw Error('Product not found.');if(String(f.values['Seller ID'])!==String(d.sellerId))throw Error('You do not own this product.');f.sheet.deleteRow(f.row);return{success:true};
}
function sellerDashboard(d){
  const s=rows('Sellers').find(x=>String(x['Seller ID'])===String(d.sellerId));if(!s)throw Error('Seller account not found.');if(String(s.Status).toLowerCase()==='rejected')throw Error('Seller account is rejected.');
  const ps=rows('Products').filter(x=>String(x['Seller ID'])===String(d.sellerId)).map(productOut);const ids=rows('OrderItems').filter(x=>String(x['Seller ID'])===String(d.sellerId)).map(x=>String(x['Order ID']));const os=rows('Orders').filter(x=>ids.includes(String(x['Order ID']))).map(orderOut);return{success:true,products:ps,orders:os,seller:sellerOut(s)};
}
function createOrder(d){
  const u=find('Users','User ID',d.userId);if(!u)throw Error('User account not found.');if(lower(u.values.Status)==='blocked')throw Error('Account blocked.');
  if(!Array.isArray(d.items)||!d.items.length)throw Error('Cart is empty.');
  let amount=0;d.items.forEach(i=>{const p=find('Products','Product ID',i.productId);if(!p)throw Error('A product in your cart no longer exists.');if(lower(p.values.Status)!=='approved')throw Error('A product in your cart is not currently available.');if(Number(p.values.Stock)<Number(i.qty||1))throw Error('Not enough stock for '+p.values.Name);amount+=Number(p.values.Price)*Number(i.qty||1);});
  amount=Math.round(amount*100)/100;const commission=Math.round(amount*COMMISSION_RATE*100)/100,sellerAmount=Math.round((amount-commission)*100)/100,id=uid('ORD');
  append('Orders',{'Order ID':id,'User ID':d.userId,Amount:amount,'Admin Commission':commission,'Seller Amount':sellerAmount,'Payment Method':d.paymentMethod||'COD','Delivery Method':d.deliveryMethod||'Courier',District:String(d.district||''),Address:String(d.address||''),Status:'Pending','Created At':new Date()});
  d.items.forEach(i=>{const p=find('Products','Product ID',i.productId);const q=Math.max(1,Number(i.qty||1));append('OrderItems',{'Order ID':id,'Product ID':i.productId,'Seller ID':p.values['Seller ID'],Name:p.values.Name,Price:Number(p.values.Price),Qty:q});p.sheet.getRange(p.row,p.headers.indexOf('Stock')+1).setValue(Number(p.values.Stock)-q);});
  return{success:true,orderId:id,amount,commission,sellerAmount};
}
function addReview(d){const u=find('Users','User ID',d.userId);if(!u)throw Error('Login required.');const rating=Number(d.rating);if(rating<1||rating>5)throw Error('Rating must be between 1 and 5.');const id=uid('REV');append('Reviews',{'Review ID':id,'Product ID':d.productId,'User ID':d.userId,Rating:rating,Comment:String(d.comment||'').trim(),'Created At':new Date()});return{success:true,reviewId:id};}
function createSupport(d){const u=find('Users','User ID',d.userId);if(!u)throw Error('Login required.');const id=uid('TKT');append('Support',{'Ticket ID':id,'User ID':d.userId,Subject:String(d.subject||'').trim(),Message:String(d.message||'').trim(),Status:'Open','Created At':new Date(),'Updated At':new Date()});return{success:true,ticketId:id};}
function changeStatus(sheetName,key,value,field,newValue,adminUserId){admin({adminUserId});const f=find(sheetName,key,value);if(!f)throw Error('Record not found.');f.sheet.getRange(f.row,f.headers.indexOf(field)+1).setValue(newValue);return{success:true};}
function admin(d){const u=find('Users','User ID',d.adminUserId);if(!u||lower(u.values.Email)!==ADMIN_EMAIL||lower(u.values.Status)==='blocked')throw Error('Admin authorization required.');return u;}
function sellerOwns(sellerId,userId){const s=find('Sellers','Seller ID',sellerId);if(!s)throw Error('Seller account not found.');if(userId&&String(s.values['User ID'])!==String(userId))throw Error('Seller authorization required.');return s;}
function append(name,obj){const sh=sheet(name);const h=SHEETS[name];sh.appendRow(h.map(k=>obj[k]!==undefined?obj[k]:''));}
function rows(name){const sh=sheet(name);if(!sh||sh.getLastRow()<2)return[];const v=sh.getDataRange().getValues(),h=v.shift();return v.filter(r=>r.some(x=>x!==''&&x!==null)).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]])));}
function find(name,key,value){const sh=sheet(name);if(!sh||sh.getLastRow()<2)return null;const v=sh.getDataRange().getValues(),h=v[0],idx=h.indexOf(key);for(let i=1;i<v.length;i++){if(String(v[i][idx])===String(value))return{sheet:sh,row:i+1,headers:h,values:Object.fromEntries(h.map((k,j)=>[k,v[i][j]]))};}return null;}
function sheet(name){return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)}
function uid(p){return p+'-'+Date.now()+'-'+Math.floor(Math.random()*100000)}
function hash(s){return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(s),Utilities.Charset.UTF_8))}
function lower(v){return String(v??'').trim().toLowerCase()}
function out(x){return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON)}
function productOut(x){return{productId:x['Product ID'],sellerId:x['Seller ID'],name:x.Name,category:x.Category,price:Number(x.Price||0),stock:Number(x.Stock||0),image:x.Image||'',status:x.Status,createdAt:x['Created At'],updatedAt:x['Updated At']}}
function orderOut(x){return{orderId:x['Order ID'],userId:x['User ID'],amount:Number(x.Amount||0),commission:Number(x['Admin Commission']||0),sellerAmount:Number(x['Seller Amount']||0),paymentMethod:x['Payment Method'],deliveryMethod:x['Delivery Method'],district:x.District,address:x.Address,status:x.Status,createdAt:x['Created At']}}
function userOut(x){return{userId:x['User ID'],name:x.Name,email:x.Email,phone:x.Phone,role:x.Role,status:x.Status,createdAt:x['Created At']}}
function sellerOut(x){return{sellerId:x['Seller ID'],userId:x['User ID'],storeName:x['Store Name'],phone:x.Phone,status:x.Status,createdAt:x['Created At']}}
function withdrawOut(x){return{withdrawalId:x['Withdrawal ID'],sellerId:x['Seller ID'],amount:Number(x.Amount||0),status:x.Status,createdAt:x['Created At']}}

(function(){
'use strict';
const cfg=window.MAXSTORE_CONFIG||{};
window.MAXSTORE_API=cfg.API_URL||'';
window.CATEGORIES=['Electronics','Fashion','Photo & Camera','Beauty','Jewellery','Home & Living','Sports','Grocery','Shoes','Automotive','Mobiles','Computers','Accessories','Toys & Kids','Books','Health','Pet Supplies','Tools','Other'];
window.money=n=>'Rs. '+Number(n||0).toLocaleString('en-LK',{minimumFractionDigits:2,maximumFractionDigits:2});
window.esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
window.getSession=()=>{try{return JSON.parse(localStorage.getItem('maxstoreSession')||'null')}catch(e){return null}};
window.setSession=u=>localStorage.setItem('maxstoreSession',JSON.stringify(u));
window.logout=()=>{['maxstoreSession','MAXSTORE_USER','MAXSTORE_ROLE'].forEach(k=>localStorage.removeItem(k));location.href='/login.html'};
window.api=async(action,data={})=>{
  const url=String(window.MAXSTORE_API||'').trim();
  if(!url||url.includes('PASTE_')) throw new Error('MAX STORE backend is not connected. Open js/config.js and set the Google Apps Script /exec URL.');
  let r;
  try{r=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...data})});}
  catch(e){throw new Error('Cannot connect to MAX STORE backend. Check the Apps Script Web App deployment.');}
  const raw=await r.text();
  if(!r.ok) throw new Error('Backend HTTP '+r.status+'. Open the /exec URL in a browser and confirm it shows MAX STORE API.');
  let j;try{j=JSON.parse(raw)}catch(e){throw new Error('Backend returned invalid JSON. This usually means the Apps Script URL/deployment is wrong.');}
  if(j.success===false) throw new Error(j.error||j.message||'Request failed');
  return j;
};
window.requireLogin=(roles)=>{const s=getSession();if(!s){location.href='/login.html';return null}if(roles&&roles.length&&!roles.includes(String(s.role||'').toLowerCase())){location.href='/login.html';return null}return s};
window.cart=()=>{try{return JSON.parse(localStorage.getItem('maxstoreCart')||'[]')}catch(e){return[]}};
window.saveCart=c=>{localStorage.setItem('maxstoreCart',JSON.stringify(c));updateCartCount()};
window.updateCartCount=()=>document.querySelectorAll('[data-cart-count]').forEach(x=>x.textContent=cart().reduce((n,i)=>n+Number(i.qty||1),0));
window.addToCart=p=>{const c=cart();const f=c.find(x=>String(x.productId)===String(p.productId));if(f)f.qty=Number(f.qty||1)+1;else c.push({...p,qty:1});saveCart(c);showToast('Added to cart');};
window.showToast=t=>{let x=document.getElementById('toast');if(!x){x=document.createElement('div');x.id='toast';x.className='toast';document.body.appendChild(x)}x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2200)};
window.setMsg=(el,text,type)=>{el.textContent=text;el.className='message '+(type||'')};
window.renderTable=(headers,rows)=>'<div class="table-scroll"><table><thead><tr>'+headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+(rows.length?rows.map(r=>'<tr>'+r.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="'+headers.length+'" class="muted">No records found.</td></tr>')+'</tbody></table></div>';
document.addEventListener('DOMContentLoaded',()=>{updateCartCount();const y=document.querySelector('[data-year]');if(y)y.textContent=new Date().getFullYear()});
})();

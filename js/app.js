const API=localStorage.getItem('MAXSTORE_API_URL')||'https://script.google.com/macros/s/AKfycbwe_fBlSg8zIkNhCAyMfCI9r_fmnzLoKdALH-rYJd_2BO-lrLgV6h-J7ZgoGdLt2swp3Q/exec';
const CATEGORIES=['Electronics','Fashion','Photo & Camera','Beauty','Jewellery','Home & Living','Sports','Grocery','Shoes','Automotive','Mobiles','Computers','Accessories','Toys & Kids','Books','Health','Pet Supplies','Tools','Other'];
const money=n=>'Rs. '+Number(n||0).toLocaleString('en-LK',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const session=()=>{try{return JSON.parse(localStorage.getItem('maxstoreSession')||'null')}catch(e){return null}};
const saveSession=u=>localStorage.setItem('maxstoreSession',JSON.stringify(u));
const logout=()=>{localStorage.removeItem('maxstoreSession');localStorage.removeItem('MAXSTORE_USER');localStorage.removeItem('MAXSTORE_ROLE');location.href='/login.html'};
async function api(action,data={}){if(API.includes('PASTE_YOUR'))throw Error('Google Apps Script URL is not connected.');const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...data})});if(!r.ok)throw Error('Server HTTP '+r.status);const j=await r.json();if(j.success===false||j.error)throw Error(j.error||j.message||'Request failed');return j}
function requireRole(roles){const s=session();if(!s){location.href='/login.html';return null}if(!roles.includes(String(s.role||'').toLowerCase())){location.href='/login.html';return null}return s}
function cart(){try{return JSON.parse(localStorage.getItem('maxstoreCart')||'[]')}catch(e){return[]}}
function setCart(c){localStorage.setItem('maxstoreCart',JSON.stringify(c));updateCartCount()}
function updateCartCount(){document.querySelectorAll('#cartCount').forEach(x=>x.textContent=cart().reduce((a,i)=>a+Number(i.qty||1),0))}
function addToCart(p){const c=cart(),f=c.find(x=>String(x.productId)===String(p.productId));if(f)f.qty=Number(f.qty||1)+1;else c.push({...p,qty:1});setCart(c);alert('Added to cart')}
function table(h,rs){return '<div class="tablewrap"><table><thead><tr>'+h.map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+(rs.length?rs.map(r=>'<tr>'+r.map(x=>'<td>'+x+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="'+h.length+'" class="muted">No records</td></tr>')+'</tbody></table></div>'}
document.addEventListener('DOMContentLoaded',updateCartCount);

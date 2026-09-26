const API=localStorage.getItem("MAXSTORE_API_URL")||"https://script.google.com/macros/s/AKfycbwe_fBlSg8zIkNhCAyMfCI9r_fmnzLoKdALH-rYJd_2BO-lrLgV6h-J7ZgoGdLt2swp3Q/exec";
const CATEGORIES=["Electronics","Fashion","Photo & Camera","Beauty","Jewellery","Home & Living","Sports","Grocery","Shoes","Automotive","Mobiles","Computers","Accessories","Toys & Kids","Books","Health","Pet Supplies","Tools","Other"];
const money=n=>"Rs. "+Number(n||0).toLocaleString("en-LK",{maximumFractionDigits:2});
const session=()=>{try{return JSON.parse(localStorage.getItem("maxstoreSession")||"null")}catch{return null}};
const saveSession=u=>localStorage.setItem("maxstoreSession",JSON.stringify(u));
const logout=()=>{localStorage.removeItem("maxstoreSession");location.href="/login.html"};
async function api(action,data={}){if(API.includes("PASTE_"))throw Error("Connect your Google Apps Script Web App URL first.");const r=await fetch(API,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,...data})});const j=await r.json();if(j.error||j.success===false)throw Error(j.error||"Request failed");return j}
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const cart=()=>{try{return JSON.parse(localStorage.getItem("maxstoreCart")||"[]")}catch{return[]}};
const setCart=c=>{localStorage.setItem("maxstoreCart",JSON.stringify(c));updateCartCount()};
function updateCartCount(){const n=cart().reduce((a,x)=>a+Number(x.qty||1),0);document.querySelectorAll("#cartCount").forEach(x=>x.textContent=n)}
function requireRole(r){const s=session();if(!s||!r.includes(s.role)){location.href="/login.html";return null}return s}document.addEventListener("DOMContentLoaded",updateCartCount);
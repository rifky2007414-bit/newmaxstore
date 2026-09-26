MAX STORE — CLEAN REBUILD
=========================

இது MAX STORE-க்கான clean rebuild.

1) Google Sheet உருவாக்கவும்.
2) அந்த Sheet-ல் Extensions > Apps Script திறக்கவும்.
3) backend/Code.gs முழுவதையும் replace செய்யவும்.
4) Save செய்யவும்.
5) Apps Script editor-ல் setup() function-ஐ ஒருமுறை Run செய்யவும்.
6) Permissions கேட்கும் போது Allow செய்யவும்.
7) Deploy > New deployment > Web app.
   Execute as: Me
   Who has access: Anyone
8) /exec URL-ஐ copy செய்யவும்.
9) js/config.js-ல் API_URL-க்கு அந்த /exec URL-ஐ வைக்கவும்.

இந்த ZIP-ல் உங்கள் பழைய /exec URL placeholder இல்லை; config.js-ல் தற்போது முன்பு கொடுக்கப்பட்ட URL வைக்கப்பட்டுள்ளது. அது 404 என்றால் புதிய deployment-ன் /exec URL-ஐ மட்டும் மாற்ற வேண்டும்.

ADMIN
-----
Email: admin@maxstore.lk
Default password (புதிய Sheet-ல் admin row இல்லாவிட்டால் setup உருவாக்கும்): MaxStore@123
முதல் login பிறகு password-ஐ மாற்றும் secure reset flow சேர்ப்பது பரிந்துரைக்கப்படுகிறது.

LOGIN
-----
ஒரே login page.
Buyer -> Buyer Dashboard
Seller -> Seller Dashboard
Buyer & Seller -> Buyer Dashboard + Seller access
Admin -> Admin Dashboard

BACKEND SHEETS
--------------
Users, Sellers, Products, Orders, OrderItems, Reviews, Categories, Notifications, Withdrawals, Support

FEATURES
--------
Buyer registration/login, seller registration, buyer+seller registration, product browsing/search/filter, cart, checkout, COD/online/bank-transfer architecture, orders, seller product management, admin approvals, order status, 10% admin commission / 90% seller share, reviews/support backend.

IMPORTANT PAYMENT NOTE
----------------------
Real card processing needs a real payment gateway. Never store card number/CVV in Google Sheets. Connect the gateway separately and store only transaction/reference/status.

IMPORTANT SECURITY NOTE
-----------------------
Google Sheets + Apps Script is suitable for a small/early marketplace. For high traffic or sensitive production workloads, use a proper database/auth/payment backend.

404 / UNEXPECTED TOKEN
----------------------
If login/register shows HTTP 404 or Unexpected token '<', the frontend is receiving an HTML error page instead of JSON. Check the Apps Script deployment and make sure the URL ends in /exec, not /dev. After editing Code.gs, deploy a NEW VERSION. Opening the /exec URL in a browser must show JSON similar to:
{"success":true,"service":"MAX STORE API","message":"Connected 🚀","version":"3.0"}

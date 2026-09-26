MAX STORE FINAL CLEAN BUILD
===========================

இந்த ZIP MAX STORE-ன் clean rebuild.

Brand: MAX STORE
Theme: Dark Blue + Black
Backend: Google Sheets + Google Apps Script
Frontend: Vanilla HTML/CSS/JS + Vercel
Commission: Admin 10% / Seller 90%
Country: Sri Lanka

LOGIN
ஒரே login.html மட்டுமே.
Buyer / Seller / Buyer & Seller / Admin role automatic-ஆக கண்டுபிடிக்கப்படும்.

ADMIN
Email: admin@maxstore.lk
Default password: MaxStore@123
முதல் login பிறகு password மாற்றுவது பரிந்துரைக்கப்படுகிறது.

GOOGLE APPS SCRIPT
1. உங்கள் MAX STORE Google Sheet-ஐ open செய்யவும்.
2. Extensions > Apps Script.
3. backend/Code.gs முழுவதையும் replace செய்யவும்.
4. Save.
5. setup() function-ஐ ஒருமுறை Run செய்யவும்.
6. Deploy > New deployment > Web app.
7. Execute as: Me.
8. Who has access: Anyone.
9. /exec URL-ஐ copy செய்யவும்.
10. js/app.js-ல் PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE இடத்தில் அந்த /exec URL-ஐ paste செய்யவும்.
11. GitHub-ல் முழு folder-ஐ upload செய்யவும்.
12. Vercel-ல் deploy செய்யவும்.

IMPORTANT
- /dev URL பயன்படுத்த வேண்டாம். /exec URL மட்டும்.
- Code.gs மாற்றிய பிறகு New version deployment செய்யவும்.
- Browser-ல் /exec URL open செய்தால் Connected 🚀 JSON வர வேண்டும்.
- HTTP 404 வந்தால் அது frontend password problem அல்ல; Apps Script deployment/URL problem.
- Card number/CVV Google Sheets-ல் சேமிக்க வேண்டாம். Real online payment gateway credentials தேவை.

SHEETS
Users, Products, Orders, OrderItems, Reviews, Categories, Notifications, Sellers, Withdrawals.

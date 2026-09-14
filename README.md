# NETD IT SOLUTIONS - Stock, Project & CRM Web Application

ລະບົບ Web Application ທີ່ຖືກອອກແບບ ແລະ ພັດທະນາຂຶ້ນສະເພາະສໍາລັບທຸລະກິດ **NETD IT SOLUTIONS** ເພື່ອບໍລິຫານຈັດການ:
1. 📦 **Stock Management (ລະບົບສາງສິນຄ້າ & ອຸປະກອນໄອທີ)**: ຈັດການສິນຄ້າ, ໝວດໝູ່, Serial Number, ໄລຍະເວລາຮັບປະກັນ, ບັນທຶກການນຳເຂົ້າ (Stock In) / ເບີກຈ່າຍ (Stock Out), ແລະ ແຈ້ງເຕືອນສິນຄ້າໃກ້ໝົດ (Low Stock Alert).
2. 📂 **Project Management (ລະບົບຈັດການໂຄງການໄອທີ & ວຽກບໍລິການ)**: ຕິດຕາມສະຖານະໂຄງການ, ກໍານົດງົບປະມານ, ມອບໝາຍວຽກຍ່ອຍ (Tasks/Milestones), ຕັດອຸປະກອນຈາກສາງເຂົ້າໂຄງການອັດຕະໂນມັດ, ແລະ ຄິດໄລ່ກໍາໄລ (Profit Margin).
3. 👥 **Customer CRM (ລະບົບຈັດການຂໍ້ມູນລູກຄ້າ 360°)**: ບັນທຶກຂໍ້ມູນບໍລິສັດ, ຊື່ຜູ້ຕິດຕໍ່, ເບີໂທ, ອີເມວ, ທີ່ຢູ່, ປະຫວັດໂຄງການທີ່ເຄີຍເຮັດ, ປະຫວັດການສັ່ງຊື້, ແລະ ຍອດເງິນຄ້າງຊໍາລະ.
4. 📑 **Invoicing & Quotations (ລະບົບອອກໃບສະເໜີລາຄາ & ໃບບິນ)**: ສ້າງໃບສະເໜີລາຄາ (Quotation), ໃບເກັບເງິນ (Invoice), ແລະ ໃບຮັບເງິນ (Receipt) ພ້ອມ Preview ແລະ ພິມ A4 Print / PDF ພ້ອມຫົວເຈ້ຍໂລໂກ້ **NETD IT SOLUTIONS**.
5. 📊 **Executive Dashboard (ແຜງຄວບຄຸມ & ລາຍງານສະຖິຕິ)**: ສະຫຼຸບມູນຄ່າສາງສິນຄ້າ, ລາຍຮັບລວມ, ໂຄງການທີ່ກໍາລັງດໍາເນີນງານ, ແລະ ກຣາບສະຖິຕິຕ່າງໆ.
6. 🌐 **Multi-language & Themes**: ຮອງຮັບພາສາລາວ 🇱🇦 ແລະ ອັງກິດ 🇺🇸 ພ້ອມ Dark Mode / Light Mode.
7. 💾 **Backup & Restore**: ລະບົບ Export/Import ໄຟລ໌ JSON Backup ສໍາຮອງຂໍ້ມູນ ແລະ ສົ່ງອອກ Excel/CSV.

---

## 🚀 ວິທີການເປີດໃຊ້ງານ (How to Run)

- **ວິທີທີ 1**: ດັບເບິລຄລິກ (Double Click) ທີ່ໄຟລ໌ `Launch_App.bat`
- **ວິທີທີ 2**: ດັບເບິລຄລິກທີ່ໄຟລ໌ `index.html` ເພື່ອເປີດໃນ Browser (Google Chrome, Microsoft Edge, Brave, Safari, Opera) ໄດ້ທັນທີ!

---

## 📁 ໂຄງສ້າງໂຟລເດີ (Project Structure)

```text
Stock Web-App/
├── Logo.png               # ໂລໂກ້ຫຼັກຂອງ NETD IT SOLUTIONS
├── index.html             # ໜ້າຫຼັກ Single-Page Application
├── Launch_App.bat         # ຕົວເປີດ App ດ່ວນ
├── README.md              # ຄູ່ມືການໃຊ້ງານ
├── css/
│   └── styles.css         # Stylesheet, Noto Sans Lao, A4 Print Style
└── js/
    ├── app.js             # Navigation & App Controller
    ├── db.js              # Database Engine, Seed Data & Backup
    ├── i18n.js            # ລະບົບແປພາສາ ລາວ 🇱🇦 / ອັງກິດ 🇺🇸
    ├── stock.js           # ໂມດູນຈັດການສາງສິນຄ້າ & Barcode
    ├── projects.js        # ໂມດູນຈັດການໂຄງການໄອທີ & Tasks
    ├── customers.js       # ໂມດູນ CRM ລູກຄ້າ 360°
    ├── invoices.js        # ໂມດູນອອກໃບສະເໜີລາຄາ & ໃບບິນ A4
    └── dashboard.js       # ໂມດູນ Dashboard & Charts
```

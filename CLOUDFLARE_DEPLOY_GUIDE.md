# ☁️ ຄູ່ມືການນຳ Web-App ຂຶ້ນ Cloudflare Pages & ເຊື່ອມຕໍ່ຖານຂໍ້ມູນ Cloudflare D1 (ໃຫ້ Sync ທຸກເຄື່ອງ 100%)

> [!IMPORTANT]
> **ສາເຫດຫຼັກທີ່ 2 ເຄື່ອງບໍ່ Sync ກັນ (ສຳຄັນຫຼາຍ):**
> ຖ້າທ່ານ Deploy ໂດຍການ **ລາກໂຟນເດີມາວາງ (Direct Upload / Drag & Drop)** ໃນໜ້າ Cloudflare Dashboard, Cloudflare ຈະອັບໂຫຼດສະເພາະໄຟລ໌ Static (HTML/CSS/JS) ທຳມະດາ **ແຕ່ຈະບໍ່ Compile ໂຟນເດີ `/functions/` (API Backend) ໃຫ້ເລີຍ**! 
> ຜົນຄື: ເມື່ອເວັບໄຊເອີ້ນຫາ API `/api/sync` ຫຼື `/api/products` ຈະຕິດ **HTTP 404 Not Found** ເຮັດໃຫ້ເຄື່ອງແຕ່ລະເຄື່ອງແຍກກັນຈື່ໃນ LocalStorage ຂອງຕົນເອງ, ຂໍ້ມູນຈຶ່ງບໍ່ Sync ຫາກັນ!

---

## 🚀 2 ວິທີ Deploy ທີ່ຖືກຕ້ອງ (ເຮັດໃຫ້ Cloudflare Pages Functions ເຮັດວຽກ 100%):

---

### ວິທີທີ່ 1 (ແນະນຳທີ່ສຸດ ⭐): ເຊື່ອມຕໍ່ຜ່ານ GitHub (Auto-Deploy ທັນທີເມື່ອມີ Code ໃໝ່)

1. **ເອົາໂປຣເຈັກຂຶ້ນ GitHub:**
   - ສ້າງ New Repository ໃນ GitHub (ຕັ້ງເປັນ Public ຫຼື Private ກໍໄດ້) ເຊັ່ນ: `netd-stock-app`.
   - ເອົາໄຟລ໌ທັງໝົດໃນໂຟນເດີ `Stock Web-App` Push ຂຶ້ນ GitHub.

2. **ເຊື່ອມຕໍ່ກັບ Cloudflare Pages:**
   - ເຂົ້າສູ່ລະບົບ [https://dash.cloudflare.com](https://dash.cloudflare.com).
   - ເມນູດ້ານຊ້າຍ ➔ ເລືອກ **Workers & Pages** (ຫຼື Compute).
   - ກົດ **Create application** ➔ ເລືອກແທັບ **Pages** ➔ ເລືອກ **Connect to Git**.
   - ເລືອກ Repository ທີ່ທ່ານຫາກໍສ້າງ.

3. **ຕັ້ງຄ່າ Build Settings:**
   - **Project name**: `netd-it-app` (ຫຼື ຕາມທີ່ຕ້ອງການ)
   - **Framework preset**: `None`
   - **Build command**: *(ປະວ່າງ)*
   - **Build output directory**: `.` *(ໃສ່ຈ້ຳເມັດ ຫຼື ປະວ່າງ)*
   - ກົດ **Save and Deploy**.
   *(Cloudflare ຈະອ່ານໂຟນເດີ `/functions/` ແລະ Compile ເປັນ Serverless Edge API ໃຫ້ໂດຍອັດຕະໂນມັດ)*.

---

### ວິທີທີ່ 2: Deploy ຜ່ານ Wrangler CLI ຈາກຄອມພິວເຕີ (ບໍ່ຕ້ອງຜ່ານ Git)

ຖ້າທ່ານບໍ່ຕ້ອງການໃຊ້ GitHub, ທ່ານສາມາດໃຊ້ຄຳສັ່ງ Node.js / Wrangler ສົ່ງທັງໄຟລ໌ ແລະ Functions ຂຶ້ນໄດ້ໂດຍກົງ:

1. ເປີດ PowerShell ຫຼື Terminal ໃນໂຟນເດີ `Stock Web-App`.
2. ສັ່ງ Deploy ດ້ວຍຄຳສັ່ງ:
   ```bash
   npx wrangler pages deploy . --project-name=netd-it-app
   ```
3. ລະບົບຈະຖາມໃຫ້ Login ເຂົ້າ Cloudflare ຜ່ານ Browser ພຽງຄັ້ງດຽວ ແລ້ວຈະອັບໂຫຼດທັງເວັບໄຊ ແລະ Functions ໃຫ້ທັນທີ.

---

## 🗄️ ຂັ້ນຕອນການເຊື່ອມຕໍ່ D1 Database (Bind D1 Database)

ຫຼັງຈາກ Deploy ຜ່ານ ວິທີທີ 1 ຫຼື ວິທີທີ 2 ແລ້ວ:

### ຂັ້ນຕອນທີ 1: ສ້າງ ແລະ Run Schema ໃນ D1
1. ຢູ່ Cloudflare Dashboard ➔ ເມນູດ້ານຊ້າຍເລືອກ **Storage & Databases** ➔ **D1 SQL Database**.
2. ກົດ **Create database** ➔ ຕັ້ງຊື່ `netd_it_db` ➔ ກົດ **Create**.
3. ເຂົ້າໄປທີ່ `netd_it_db` ➔ ເລືອກແທັບ **Console**:
   - ເປີດໄຟລ໌ `schema.sql` ໃນໂຟນເດີໂປຣເຈັກນີ້ ➔ Copy ຄຳສັ່ງທັງໝົດມາ Paste ໃສ່ Console ➔ ກົດ **Execute**.

### ຂັ້ນຕອນທີ 2: ຜູກ (Bind) D1 ເຂົ້າກັບ Pages
1. ກັບໄປທີ່ **Workers & Pages** ➔ ເລືອກໂປຣເຈັກ Pages ຂອງທ່ານ (ເຊັ່ນ `netd-it-app`).
2. ໄປທີ່ **Settings** ➔ ເລືອກເມນູ **Functions** (ຫຼື **Bindings**).
3. ເລື່ອນລົງມາທີ່ **D1 database bindings** ➔ ກົດ **Add binding**:
   - **Variable name**: ໃສ່ `DB` *(⚠️ ຕ້ອງເປັນຕົວໃຫຍ່ 2 ໂຕ `DB` ເທົ່ານັ້ນ! ຫ້າມໃສ່ຊື່ອື່ນ)*.
   - **D1 database**: ເລືອກຖານຂໍ້ມູນ `netd_it_db`.
4. ກົດ **Save**.

### ຂັ້ນຕອນທີ 3 (ສຳຄັນທີ່ສຸດ ⚠️): Trigger Redeploy
ຫຼັງຈາກ Save Binding ແລ້ວ, Binding ຈະຍັງບໍ່ມີຜົນທັນທີ ຈົນກວ່າຈະມີການ Deploy ໃໝ່:
- ໄປທີ່ແທັບ **Deployments** ຂອງໂປຣເຈັກ.
- ຢູ່ລາຍການ Deployment ລ້າສຸດ ➔ ກົດປຸ່ມ **...** (ສາມຈ້ຳ) ດ້ານຂວາ ➔ ເລືອກ **Retry deployment** (ຫຼື ສັ່ງ deploy ອີກ 1 ຄັ້ງ).

---

## 🔍 ການກວດສອບວ່າ Sync ໄດ້ແລ້ວ ຫຼື ຍັງ?

1. ເປີດເວັບໄຊຂອງທ່ານ ເຊັ່ນ: `https://netd-it-app.pages.dev`.
2. ເບິ່ງ Badge ຢູ່ມຸມລຸ່ມຊ້າຍຂອງ Sidebar:
   - **🟢 Cloudflare D1: Synced**: ເຊື່ອມຕໍ່ສຳເລັດ 100%! ທຸກເຄື່ອງຈະເຫັນຂໍ້ມູນດຽວກັນແບບ Real-time.
   - **🔴 Functions 404**: ຍັງ Deploy ຜ່ານ Drag-and-drop ຢູ່, ໃຫ້ປ່ຽນມາໃຊ້ GitHub ຫຼື Wrangler ຕາມວິທີດ້ານເທິງ.
   - **🟠 D1 Error 500**: ລືມຕັ້ງຊື່ Variable name ເປັນ `DB` ຫຼື ຍັງບໍ່ໄດ້ກົດ Retry deployment.
3. ທ່ານສາມາດ **ກົດໃສ່ Badge ນັ້ນໄດ້ຕະຫຼອດເວລາ** ເພື່ອເປີດໜ້າຕ່າງ **ກວດສອບສະຖານະ Cloudflare D1 Sync** ແລະ ກົດປຸ່ມ **ທົດສອບໃໝ່ (Re-test)** ໄດ້ທັນທີ!

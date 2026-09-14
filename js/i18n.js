/**
 * NETD IT SOLUTIONS - Internationalization (i18n)
 * Supports Lao (lo) and English (en)
 */

const translations = {
  lo: {
    // Navigation
    nav_dashboard: "ແຜງຄວບຄຸມ",
    nav_stock: "ສາງສິນຄ້າ & ອຸປະກອນ",
    nav_projects: "ໂຄງການ & ວຽກໄອທີ",
    nav_customers: "ລູກຄ້າ & CRM",
    nav_invoices: "ໃບສະເໜີລາຄາ & ໃບບິນ",
    nav_reports: "ລາຍງານ & ສະຖິຕິ",
    nav_settings: "ຕັ້ງຄ່າ & ສໍາຮອງຂໍ້ມູນ",

    // Header & Global
    search_placeholder: "ຄົ້ນຫາທຸກຢ່າງ (ສິນຄ້າ, ໂຄງການ, ລູກຄ້າ, ໃບບິນ)...",
    quick_add: "ເພີ່ມດ່ວນ",
    add_product: "ເພີ່ມສິນຄ້າໃໝ່",
    stock_in_out: "ນຳເຂົ້າ / ເບີກຈ່າຍ",
    add_project: "ສ້າງໂຄງການໃໝ່",
    add_customer: "ເພີ່ມລູກຄ້າໃໝ່",
    add_invoice: "ສ້າງໃບສະເໜີລາຄາ / ໃບບິນ",
    notifications: "ການແຈ້ງເຕືອນ",
    all_caught_up: "ບໍ່ມີການແຈ້ງເຕືອນໃໝ່",
    toggle_theme: "ສະຫຼັບໂໝດມືດ/ແຈ້ງ",
    language: "ພາສາ",
    lao: "ລາວ 🇱🇦",
    english: "English 🇺🇸",

    // Dashboard
    dashboard_title: "ແຜງຄວບຄຸມທຸລະກິດ (Dashboard)",
    dashboard_subtitle: "ສະຫຼຸບພາບລວມສາງສິນຄ້າ, ໂຄງການໄອທີ ແລະ ລາຍຮັບຂອງ NETD IT SOLUTIONS",
    stat_total_products: "ສິນຄ້າທັງໝົດໃນສາງ",
    stat_low_stock: "ສິນຄ້າໃກ້ໝົດ / ໝົດສາງ",
    stat_active_projects: "ໂຄງການທີ່ກຳລັງດຳເນີນງານ",
    stat_total_customers: "ລູກຄ້າທັງໝົດ",
    stat_inventory_value: "ມູນຄ່າສິນຄ້າໃນສາງ",
    stat_total_revenue: "ຍອດຂາຍ / ລາຍຮັບລວມ",
    stat_pending_payments: "ຍອດລໍຖ້າຊຳລະ",
    
    chart_category_distribution: "ມູນຄ່າສິນຄ້າແບ່ງຕາມໝວດໝູ່",
    chart_project_status: "ສະຖານະໂຄງການທັງໝົດ",
    chart_monthly_revenue: "ລາຍຮັບ & ຕົ້ນທຶນລາຍເດືອນ",

    urgent_stock_alerts: "⚠️ ສິນຄ້າທີ່ຕ້ອງສັ່ງຊື້ດ່ວນ (Low Stock)",
    upcoming_deadlines: "📅 ກຳນົດສົ່ງມອບໂຄງການໃກ້ຮອດ (Deadlines)",
    recent_activities: "⚡ ການເຄື່ອນໄຫວຫຼ້າສຸດ",
    
    // Stock Module
    stock_title: "ຈັດການສາງສິນຄ້າ & ອຸປະກອນໄອທີ",
    stock_subtitle: "ຕິດຕາມຈຳນວນ, ຕົ້ນທຶນ, ລາຄາຂາຍ, Serial Number ແລະ ການຮັບ-ຈ່າຍສິນຄ້າ",
    search_stock: "ຄົ້ນຫາຊື່ສິນຄ້າ, ລະຫັດ SKU, ຍີ່ຫໍ້, Serial...",
    all_categories: "ທຸກໝວດໝູ່",
    filter_all: "ທັງໝົດ",
    filter_low_stock: "ສິນຄ້າໃກ້ໝົດ (Low Stock)",
    filter_out_of_stock: "ສິນຄ້າໝົດ (Out of Stock)",
    btn_stock_in: "+ ນຳເຂົ້າສິນຄ້າ (Stock In)",
    btn_stock_out: "- ເບີກຈ່າຍສິນຄ້າ (Stock Out)",
    btn_export_csv: "ສົ່ງອອກ Excel (CSV)",
    btn_print_barcode: "ພິມ Barcode / ປ້າຍ",
    btn_manage_categories: "🏷️ ຈັດການໝວດໝູ່",
    manage_categories_title: "ຈັດການໝວດໝູ່ສິນຄ້າ (Categories)",
    manage_categories_subtitle: "ເພີ່ມ, ແກ້ໄຂ, ປ່ຽນຊື່ ຫຼື ລຶບໝວດໝູ່ສິນຄ້າ",
    placeholder_new_category: "ພິມຊື່ໝວດໝູ່ໃໝ່...",
    placeholder_select_or_type_category: "ເລືອກ ຫຼື ພິມຊື່ໝວດໝູ່ໃໝ່ໄດ້ເອງ...",
    btn_add_category: "+ ເພີ່ມໝວດໝູ່",
    toast_category_added: "ເພີ່ມໝວດໝູ່ໃໝ່ສໍາເລັດແລ້ວ!",
    toast_category_updated: "ແກ້ໄຂຊື່ໝວດໝູ່ສໍາເລັດແລ້ວ!",
    toast_category_deleted: "ລຶບໝວດໝູ່ສໍາເລັດແລ້ວ!",
    prompt_rename_category: "ກະລຸນາໃສ່ຊື່ໃໝ່ຂອງໝວດໝູ່:",
    confirm_delete_category: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບໝວດໝູ່ນີ້? (ສິນຄ້າໃນໝວດນີ້ຈະຖືກປ່ຽນເປັນ General)",

    // Stock Table Headers
    th_sku: "ລະຫັດ (SKU)",
    th_product_name: "ຊື່ສິນຄ້າ & ອຸປະກອນ",
    th_category: "ໝວດໝູ່",
    th_stock_qty: "ຈຳນວນຄົງເຫຼືອ",
    th_cost_price: "ລາຄາຕົ້ນທຶນ",
    th_sale_price: "ລາຄາຂາຍ",
    th_min_alert: "ຈຸດເຕືອນ",
    th_warranty: "ປະກັນ",
    th_actions: "ຈັດການ",

    // Stock Form
    modal_add_product: "ເພີ່ມສິນຄ້າໃໝ່ເຂົ້າລະບົບ",
    modal_edit_product: "ແກ້ໄຂຂໍ້ມູນສິນຄ້າ",
    label_product_name: "ຊື່ສິນຄ້າ / ອຸປະກອນ *",
    label_sku: "ລະຫັດ SKU / Barcode *",
    label_category: "ໝວດໝູ່ *",
    label_brand: "ຍີ່ຫໍ້ / Brand",
    label_model: "ລຸ້ນ / Model",
    label_serial: "Serial Number / MAC (ຖ້າມີ)",
    label_unit: "ຫົວໜ່ວຍ (ອັນ, ຊຸດ, ແມັດ, ກ່ອງ)",
    label_cost_price: "ລາຄາຕົ້ນທຶນ (LAK) *",
    label_sale_price: "ລາຄາຂາຍ (LAK) *",
    label_initial_qty: "ຈຳນວນເລີ່ມຕົ້ນ *",
    label_min_alert: "ຈຳນວນແຈ້ງເຕືອນຂັ້ນຕ່ຳ *",
    label_location: "ບ່ອນເກັບ / ຊັ້ນວາງ",
    label_warranty: "ໄລຍະເວລາປະກັນ (ເດືອນ)",
    label_supplier: "ຜູ້ສະໜອງ (Supplier)",
    label_notes: "ໝາຍເຫດເພີ່ມເຕີມ",

    // Stock Transactions
    modal_stock_in: "ນຳເຂົ້າສິນຄ້າ (Stock In)",
    modal_stock_out: "ເບີກຈ່າຍສິນຄ້າ (Stock Out)",
    label_select_product: "ເລືອກສິນຄ້າ *",
    label_quantity: "ຈຳນວນ *",
    label_ref_type: "ປະເພດ / ເຫດຜົນ *",
    label_ref_doc: "ເລກທີເອກະສານອ້າງອີງ (PO / ໃບບິນ)",
    label_related_project: "ຜູກກັບໂຄງການ (ຖ້າມີ)",
    label_related_customer: "ລູກຄ້າທີ່ຊື້ (ຖ້າມີ)",
    label_operator: "ຜູ້ດຳເນີນການ / ຊ່າງຮັບຜິດຊອບ",

    // Project Module
    project_title: "ຈັດການໂຄງການໄອທີ & ວຽກບໍລິການ",
    project_subtitle: "ຕິດຕາມສະຖານະ, ງົບປະມານ, ອຸປະກອນທີ່ໃຊ້ ແລະ ຜົນກຳໄລຂອງແຕ່ລະໂຄງການ",
    search_projects: "ຄົ້ນຫາໂຄງການ, ລູກຄ້າ, ຜູ້ຮັບຜິດຊອບ...",
    btn_new_project: "+ ສ້າງໂຄງການໃໝ່",
    tab_all_projects: "ທຸກໂຄງການ",
    tab_in_progress: "ກຳລັງດຳເນີນການ",
    tab_completed: "ສຳເລັດແລ້ວ",
    tab_quotation_stage: "ຂັ້ນຕອນສະເໜີລາຄາ",
    view_cards: "ມຸມມອງ Card",
    view_table: "ມຸມມອງ ຕາຕະລາງ",

    // Project Details & Form
    modal_add_project: "ສ້າງໂຄງການໃໝ່",
    modal_edit_project: "ແກ້ໄຂໂຄງການ",
    label_project_code: "ລະຫັດໂຄງການ *",
    label_project_name: "ຊື່ໂຄງການ *",
    label_customer: "ລູກຄ້າ *",
    label_project_type: "ປະເພດງານໄອທີ *",
    label_contract_value: "ມູນຄ່າໂຄງການ / ລາຄາຮັບເໝົາ (LAK) *",
    label_est_cost: "ຕົ້ນທຶນປະມານການ (LAK)",
    label_start_date: "ວັນທີເລີ່ມຕົ້ນ",
    label_end_date: "ກຳນົດສົ່ງມອບ",
    label_priority: "ລະດັບຄວາມສຳຄັນ",
    label_status: "ສະຖານະໂຄງການ *",
    label_team_lead: "ຫົວໜ້າທີມ / ຜູ້ຮັບຜິດຊອບ",
    label_project_desc: "ລາຍລະອຽດໜ້າວຽກ",
    project_materials: "ອຸປະກອນ ແລະ ວັດສະດຸທີ່ໃຊ້ໃນໂຄງການ",
    btn_allocate_material: "+ ເບີກອຸປະກອນຈາກສາງເຂົ້າໂຄງການ",
    project_tasks: "ລາຍການວຽກຍ່ອຍ (Tasks & Milestones)",
    btn_add_task: "+ ເພີ່ມວຽກຍ່ອຍ",
    project_profit: "ກຳໄລຄາດຄະເນ (Profit Margin)",

    // Customer CRM Module
    customer_title: "ຈັດການຂໍ້ມູນລູກຄ້າ (CRM)",
    customer_subtitle: "ບັນທຶກປະຫວັດລູກຄ້າ, ບໍລິສັດ, ໂຄງການທີ່ເຄີຍເຮັດ ແລະ ປະຫວັດການເງິນ",
    search_customers: "ຄົ້ນຫາຊື່ບໍລິສັດ, ຊື່ຜູ້ຕິດຕໍ່, ເບີໂທ, ອີເມວ...",
    btn_new_customer: "+ ເພີ່ມລູກຄ້າໃໝ່",
    modal_add_customer: "ເພີ່ມຂໍ້ມູນລູກຄ້າໃໝ່",
    modal_edit_customer: "ແກ້ໄຂຂໍ້ມູນລູກຄ້າ",
    label_customer_name: "ຊື່ບໍລິສັດ / ອົງກອນ / ຊື່ລູກຄ້າ *",
    label_contact_person: "ຊື່ຜູ້ຕິດຕໍ່ *",
    label_phone: "ເບີໂທລະສັບ / WhatsApp *",
    label_email: "ອີເມວ",
    label_address: "ທີ່ຢູ່ / ບ່ອນຕັ້ງ",
    label_tax_id: "ເລກປະຈຳຕົວຜູ້ເສຍອາກອນ / ທະບຽນວິສາຫະກິດ",
    label_customer_type: "ປະເພດລູກຄ້າ",
    customer_360_view: "ຂໍ້ມູນລູກຄ້າແບບ 360°",
    customer_projects_history: "ປະຫວັດໂຄງການຂອງລູກຄ້າ",
    customer_invoices_history: "ປະຫວັດໃບສະເໜີລາຄາ & ໃບບິນ",
    customer_total_spent: "ຍອດຊື້/ມູນຄ່າໂຄງການລວມ",
    customer_outstanding: "ຍອດຄ້າງຊຳລະ",

    // Billing & Documents Module
    billing_title: "ໃບສະເໜີລາຄາ, ໃບເກັບເງິນ & ໃບຮັບເງິນ",
    billing_subtitle: "ສ້າງເອກະສານທາງການເງິນແບບມືອາຊີບ ພ້ອມພິມ A4 ແລະ Export PDF",
    search_invoices: "ຄົ້ນຫາເລກທີເອກະສານ, ຊື່ລູກຄ້າ, ໂຄງການ...",
    btn_create_doc: "+ ສ້າງເອກະສານໃໝ່",
    tab_all_docs: "ທຸກເອກະສານ",
    tab_quotations: "ໃບສະເໜີລາຄາ (Quotation)",
    tab_invoices: "ໃບເກັບເງິນ (Invoice)",
    tab_receipts: "ໃບຮັບເງິນ (Receipt)",
    
    // Doc Editor & Modal
    modal_create_doc: "ສ້າງເອກະສານການເງິນ",
    label_doc_type: "ປະເພດເອກະສານ *",
    label_doc_no: "ເລກທີເອກະສານ *",
    label_issue_date: "ວັນທີອອກເອກະສານ *",
    label_valid_until: "ນຳໃຊ້ໄດ້ເຖີງວັນທີ່ *",
    label_due_date: "ວັນທີຄົບກຳນົດຊຳລະ",
    label_ref_quotation: "ອ້າງອີງໃບສະເໜີລາຄາເລກທີ (Ref Quotation)",
    valid_until_notice: "ນຳໃຊ້ໄດ້ເຖີງວັນທີ່",
    days: "ວັນ",
    label_payment_status: "ສະຖານະການຊຳລະ",
    label_payment_method: "ວິທີການຊຳລະ",
    items_list: "ລາຍການສິນຄ້າ / ຄ່າບໍລິການ",
    btn_add_line_item: "+ ເພີ່ມລາຍການ",
    btn_add_from_stock: "📦 ເລືອກຈາກສາງສິນຄ້າ",
    col_item_desc: "ລາຍລະອຽດສິນຄ້າ / ບໍລິການ",
    col_item_qty: "ຈຳນວນ",
    col_item_price: "ລາຄາຕໍ່ໜ່ວຍ",
    col_item_total: "ລວມມູນຄ່າ",
    label_subtotal: "ມູນຄ່າລວມ (Subtotal)",
    label_discount: "ສ່ວນຫຼຸດ (Discount)",
    label_grand_total: "ຍອດລວມທັງໝົດ (Grand Total)",
    label_terms_conditions: "ເງື່ອນໄຂການຊຳລະ & ການຮັບປະກັນ",
    btn_print_preview: "🖨️ ເບິ່ງຕົວຢ່າງພິມ A4 (Print)",
    login_with_google: "ເຂົ້າສູ່ລະບົບດ້ວຍ Gmail & Password",
    label_password: "ລະຫັດຜ່ານ (Password) *",
    role_admin: "Admin (ຈັດການໄດ້ທັງໝົດ)",
    role_viewer: "Viewer (ເບິ່ງຂໍ້ມູນຢ່າງດຽວ)",
    viewer_notice_title: "ໂໝດເບິ່ງຂໍ້ມູນຢ່າງດຽວ (Viewer Mode)",
    viewer_notice_desc: "ທ່ານກໍາລັງເຂົ້າໃຊ້ງານດ້ວຍສິດທິ Viewer. ທ່ານສາມາດເບິ່ງຂໍ້ມູນ, ຄົ້ນຫາ ແລະ ສັ່ງພິມໄດ້, ແຕ່ບໍ່ສາມາດເພີ່ມ/ແກ້ໄຂ/ລຶບຂໍ້ມູນໄດ້.",
    btn_manage_users: "👥 ຈັດການຜູ້ໃຊ້ງານ (Users)",
    modal_user_mgmt: "ຈັດການບັນຊີຜູ້ໃຊ້ງານ (User Management)",
    btn_add_user: "+ ເພີ່ມຜູ້ໃຊ້ໃໝ່",
    tab_daily: "ລາຍວັນ (Daily)",
    tab_weekly: "ລາຍອາທິດ (Weekly)",
    tab_monthly: "ລາຍເດືອນ (Monthly)",
    tab_yearly: "ລາຍປີ (Yearly)",
    tab_disbursed_stock: "📑 ລາຍການທີ່ເບີກຈ່າຍແລ້ວ (Disbursed)",
    sn_mac_list: "ໝາຍເລກ Serial Number (SN) / MAC Address",
    btn_browse_quotation: "📄 Browse ໃບສະເໜີລາຄາ",
    category_drilldown_title: "ລາຍລະອຽດສິນຄ້າໃນໝວດໝູ່",

    // Settings Module
    settings_title: "ຕັ້ງຄ່າລະບົບ & ສໍາຮອງຂໍ້ມູນ",
    settings_subtitle: "ຈັດການຂໍ້ມູນບໍລິສັດ NETD IT SOLUTIONS, ສະກຸນເງິນ ແລະ ຖານຂໍ້ມູນ",
    company_info: "ຂໍ້ມູນບໍລິສັດ / ຮ້ານ",
    label_company_name: "ຊື່ບໍລິສັດ / ຮ້ານ",
    label_company_tagline: "ຄໍາຂວັນ / ບໍລິການຫຼັກ",
    label_company_phone: "ເບີໂທຕິດຕໍ່",
    label_company_email: "ອີເມວບໍລິສັດ",
    label_company_address: "ທີ່ຢູ່ສໍານັກງານ / ຮ້ານ",
    label_company_bank_info: "ຂໍ້ມູນບັນຊີທະນາຄານ (ສໍາລັບໃສ່ໃນໃບບິນ)",
    label_currency: "ສະກຸນເງິນຫຼັກ",
    data_management: "ການຈັດການຂໍ້ມູນ & ສໍາຮອງ (Backup & Restore)",
    btn_export_backup: "📥 ດາວໂຫຼດໄຟລ໌ສໍາຮອງຂໍ້ມູນ (Export JSON)",
    btn_import_backup: "📤 ກູ້ຄືນຂໍ້ມູນຈາກໄຟລ໌ (Import JSON)",
    btn_reset_sample: "🔄 ຣີເຊັດເປັນຂໍ້ມູນຕົວຢ່າງໄອທີ (Load Demo Data)",
    btn_clear_data: "🗑️ ລຶບຂໍ້ມູນທັງໝົດ (Clear All Data)",

    // Buttons & Dialogs
    btn_save: "ບັນທຶກ",
    btn_cancel: "ຍົກເລີກ",
    btn_delete: "ລຶບ",
    btn_edit: "ແກ້ໄຂ",
    btn_view: "ເບິ່ງລາຍລະອຽດ",
    btn_close: "ປິດ",
    btn_print: "ພິມເອກະສານ",
    confirm_delete: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້?",
    toast_success_save: "ບັນທຶກຂໍ້ມູນສໍາເລັດແລ້ວ!",
    toast_success_delete: "ລຶບຂໍ້ມູນສໍາເລັດແລ້ວ!",
    toast_stock_deducted: "ຕັດສະຕັອກສິນຄ້າສໍາເລັດແລ້ວ!",
    toast_backup_exported: "ດາວໂຫຼດໄຟລ໌ສໍາຮອງຂໍ້ມູນສໍາເລັດແລ້ວ!",
    toast_backup_imported: "ກູ້ຄືນຂໍ້ມູນສໍາເລັດແລ້ວ!",
    
    // Status text
    status_draft: "ຮ່າງ (Draft)",
    status_quotation: "ສະເໜີລາຄາ (Quotation)",
    status_in_progress: "ກໍາລັງເຮັດ (In Progress)",
    status_on_hold: "ໂຈະຊົ່ວຄາວ (On Hold)",
    status_completed: "ສໍາເລັດແລ້ວ (Completed)",
    status_cancelled: "ຍົກເລີກ (Cancelled)",

    status_unpaid: "ຍັງບໍ່ທັນຈ່າຍ (Unpaid)",
    status_partial: "ຈ່າຍບາງສ່ວນ (Partial)",
    status_paid: "ຈ່າຍແລ້ວ (Paid)",
    status_overdue: "ກາຍກຳນົດ (Overdue)",

    stock_type_in: "ນຳເຂົ້າ (In)",
    stock_type_out: "ເບີກຈ່າຍ (Out)",
    stock_type_adjust: "ປັບຍອດ (Adjust)"
  },

  en: {
    // Navigation
    nav_dashboard: "Dashboard",
    nav_stock: "Stock & Inventory",
    nav_projects: "Projects & Services",
    nav_customers: "Customers & CRM",
    nav_invoices: "Quotes & Invoices",
    nav_reports: "Reports & Analytics",
    nav_settings: "Settings & Backup",

    // Header & Global
    search_placeholder: "Search anything (products, projects, clients, invoices)...",
    quick_add: "Quick Add",
    add_product: "New Product",
    stock_in_out: "Stock In / Out",
    add_project: "New Project",
    add_customer: "New Customer",
    add_invoice: "New Invoice/Quote",
    notifications: "Notifications",
    all_caught_up: "All caught up! No alerts.",
    toggle_theme: "Toggle Dark/Light Mode",
    language: "Language",
    lao: "ລາວ 🇱🇦",
    english: "English 🇺🇸",

    // Dashboard
    dashboard_title: "Executive Dashboard",
    dashboard_subtitle: "Overview of IT Inventory, Active Projects, and Financial Performance",
    stat_total_products: "Total Stock SKUs",
    stat_low_stock: "Low / Out of Stock",
    stat_active_projects: "Active IT Projects",
    stat_total_customers: "Total Clients",
    stat_inventory_value: "Total Inventory Value",
    stat_total_revenue: "Total Revenue",
    stat_pending_payments: "Pending Receivables",
    
    chart_category_distribution: "Stock Value by Category",
    chart_project_status: "Projects Status Breakdown",
    chart_monthly_revenue: "Monthly Revenue & Cost",

    urgent_stock_alerts: "⚠️ Low Stock Re-order Alerts",
    upcoming_deadlines: "📅 Upcoming Project Deadlines",
    recent_activities: "⚡ Recent Activities",
    
    // Stock Module
    stock_title: "Stock & Inventory Management",
    stock_subtitle: "Track stock quantities, cost, selling price, serial numbers, and movements",
    search_stock: "Search product name, SKU, brand, serial...",
    all_categories: "All Categories",
    filter_all: "All Items",
    filter_low_stock: "Low Stock Items",
    filter_out_of_stock: "Out of Stock Items",
    btn_stock_in: "+ Stock In (Receive)",
    btn_stock_out: "- Stock Out (Issue)",
    btn_export_csv: "Export CSV (Excel)",
    btn_print_barcode: "Print Barcode / Tag",
    btn_manage_categories: "🏷️ Manage Categories",
    manage_categories_title: "Category Management",
    manage_categories_subtitle: "Add, edit, rename, or delete product categories",
    placeholder_new_category: "Type new category name...",
    placeholder_select_or_type_category: "Select or type custom category...",
    btn_add_category: "+ Add Category",
    toast_category_added: "Category added successfully!",
    toast_category_updated: "Category renamed successfully!",
    toast_category_deleted: "Category deleted successfully!",
    prompt_rename_category: "Enter new name for category:",
    confirm_delete_category: "Are you sure you want to delete this category? (Products will be moved to General)",

    // Stock Table Headers
    th_sku: "SKU / Code",
    th_product_name: "Item & Description",
    th_category: "Category",
    th_stock_qty: "In Stock",
    th_cost_price: "Cost Price",
    th_sale_price: "Selling Price",
    th_min_alert: "Min Alert",
    th_warranty: "Warranty",
    th_actions: "Actions",

    // Stock Form
    modal_add_product: "Add New Product",
    modal_edit_product: "Edit Product Details",
    label_product_name: "Product / Item Name *",
    label_sku: "SKU / Barcode Code *",
    label_category: "Category *",
    label_brand: "Brand",
    label_model: "Model",
    label_serial: "Serial Number / MAC (Optional)",
    label_unit: "Unit (pcs, set, meter, box)",
    label_cost_price: "Cost Price (LAK) *",
    label_sale_price: "Selling Price (LAK) *",
    label_initial_qty: "Initial Stock Qty *",
    label_min_alert: "Min Alert Threshold *",
    label_location: "Storage / Shelf Location",
    label_warranty: "Warranty Period (Months)",
    label_supplier: "Supplier Name",
    label_notes: "Additional Notes",

    // Stock Transactions
    modal_stock_in: "Stock In / Receiving",
    modal_stock_out: "Stock Out / Issuing",
    label_select_product: "Select Product *",
    label_quantity: "Quantity *",
    label_ref_type: "Type / Reason *",
    label_ref_doc: "Reference Doc # (PO / Invoice)",
    label_related_project: "Linked Project (Optional)",
    label_related_customer: "Customer (Optional)",
    label_operator: "Technician / Operator",

    // Project Module
    project_title: "IT Project & Service Management",
    project_subtitle: "Track project milestones, assigned materials, budget, and profit margins",
    search_projects: "Search projects, clients, leads...",
    btn_new_project: "+ Create Project",
    tab_all_projects: "All Projects",
    tab_in_progress: "In Progress",
    tab_completed: "Completed",
    tab_quotation_stage: "Quotation Stage",
    view_cards: "Cards View",
    view_table: "Table View",

    // Project Details & Form
    modal_add_project: "Create New Project",
    modal_edit_project: "Edit Project Details",
    label_project_code: "Project Code *",
    label_project_name: "Project Title *",
    label_customer: "Client *",
    label_project_type: "IT Service Type *",
    label_contract_value: "Contract Value (LAK) *",
    label_est_cost: "Estimated Cost (LAK)",
    label_start_date: "Start Date",
    label_end_date: "Deadline Date",
    label_priority: "Priority Level",
    label_status: "Project Status *",
    label_team_lead: "Team Lead / Engineer",
    label_project_desc: "Scope of Work & Notes",
    project_materials: "Allocated Equipment & Materials",
    btn_allocate_material: "+ Allocate Item from Stock",
    project_tasks: "Milestones & Tasks Checklist",
    btn_add_task: "+ Add Task",
    project_profit: "Estimated Margin",

    // Customer CRM Module
    customer_title: "Customer & Client Management (CRM)",
    customer_subtitle: "Maintain contact details, project history, and billing records",
    search_customers: "Search company, contact person, phone, email...",
    btn_new_customer: "+ Add Client",
    modal_add_customer: "Add New Client",
    modal_edit_customer: "Edit Client Info",
    label_customer_name: "Company / Client Name *",
    label_contact_person: "Contact Person *",
    label_phone: "Phone / WhatsApp *",
    label_email: "Email Address",
    label_address: "Office Address / Location",
    label_tax_id: "Tax ID / Registration No.",
    label_customer_type: "Client Category",
    customer_360_view: "Client 360° Overview",
    customer_projects_history: "Project History",
    customer_invoices_history: "Invoices & Quotes History",
    customer_total_spent: "Total Contract Value",
    customer_outstanding: "Outstanding Receivables",

    // Billing & Documents Module
    billing_title: "Quotations & Invoices",
    billing_subtitle: "Generate professional IT quotations, tax invoices, and payment receipts",
    search_invoices: "Search doc number, client, project...",
    btn_create_doc: "+ Create Document",
    tab_all_docs: "All Documents",
    tab_quotations: "Quotations",
    tab_invoices: "Invoices",
    tab_receipts: "Receipts",
    
    // Doc Editor & Modal
    modal_create_doc: "Create Financial Document",
    label_doc_type: "Document Type *",
    label_doc_no: "Document No. *",
    label_issue_date: "Issue Date *",
    label_valid_until: "Valid Until Date *",
    label_due_date: "Due Date",
    label_ref_quotation: "Reference Quotation No. (Ref Quotation)",
    valid_until_notice: "Valid Until",
    days: "Days",
    label_payment_status: "Payment Status",
    label_payment_method: "Payment Method",
    items_list: "Line Items (Products & Services)",
    btn_add_line_item: "+ Add Custom Line",
    btn_add_from_stock: "📦 Pick from Stock",
    col_item_desc: "Description",
    col_item_qty: "Qty",
    col_item_price: "Unit Price",
    col_item_total: "Amount",
    label_subtotal: "Subtotal",
    label_discount: "Discount",
    label_grand_total: "Grand Total",
    label_terms_conditions: "Terms & Conditions / Bank Details",
    btn_print_preview: "🖨️ A4 Print / PDF Preview",
    login_with_google: "Login with Gmail & Password",
    label_password: "Password *",
    role_admin: "Admin (Full Control)",
    role_viewer: "Viewer (Read-Only)",
    viewer_notice_title: "Viewer Mode (Read-Only)",
    viewer_notice_desc: "You are currently logged in as Viewer. You can browse, search and print documents, but creating/editing/deleting records is restricted.",
    btn_manage_users: "👥 Manage Users",
    modal_user_mgmt: "User Account Management",
    btn_add_user: "+ Add New User",
    tab_daily: "Daily",
    tab_weekly: "Weekly",
    tab_monthly: "Monthly",
    tab_yearly: "Yearly",
    tab_disbursed_stock: "📑 Disbursed Equipment Log",
    sn_mac_list: "Serial Number (SN) / MAC Address",
    btn_browse_quotation: "📄 Browse Quotation",
    category_drilldown_title: "Category Products Details",

    // Settings Module
    settings_title: "Settings & System Backup",
    settings_subtitle: "Configure NETD IT SOLUTIONS company profile, currencies, and database backups",
    company_info: "Company Profile",
    label_company_name: "Company Name",
    label_company_tagline: "Tagline / Services",
    label_company_phone: "Contact Phone",
    label_company_email: "Company Email",
    label_company_address: "Office Address",
    label_company_bank_info: "Bank Account Details (Printed on Invoices)",
    label_currency: "Primary Currency",
    data_management: "Database Backup & Maintenance",
    btn_export_backup: "📥 Export Full Backup (JSON)",
    btn_import_backup: "📤 Restore Database (Import JSON)",
    btn_reset_sample: "🔄 Load IT Demo Sample Data",
    btn_clear_data: "🗑️ Clear All Database Records",

    // Buttons & Dialogs
    btn_save: "Save",
    btn_cancel: "Cancel",
    btn_delete: "Delete",
    btn_edit: "Edit",
    btn_view: "View Details",
    btn_close: "Close",
    btn_print: "Print Document",
    confirm_delete: "Are you sure you want to delete this record?",
    toast_success_save: "Data saved successfully!",
    toast_success_delete: "Record deleted successfully!",
    toast_stock_deducted: "Inventory successfully updated!",
    toast_backup_exported: "Backup file downloaded!",
    toast_backup_imported: "Database successfully restored!",
    
    // Status text
    status_draft: "Draft",
    status_quotation: "Quotation",
    status_in_progress: "In Progress",
    status_on_hold: "On Hold",
    status_completed: "Completed",
    status_cancelled: "Cancelled",

    status_unpaid: "Unpaid",
    status_partial: "Partial",
    status_paid: "Paid",
    status_overdue: "Overdue",

    stock_type_in: "Stock In",
    stock_type_out: "Stock Out",
    stock_type_adjust: "Adjust"
  }
};

let currentLang = localStorage.getItem('netd_lang') || 'lo';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('netd_lang', lang);
  document.documentElement.lang = lang;
  updatePageLanguage();
}

function t(key) {
  if (translations[currentLang] && translations[currentLang][key]) {
    return translations[currentLang][key];
  }
  if (translations['en'] && translations['en'][key]) {
    return translations['en'][key];
  }
  return key;
}

function updatePageLanguage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.title = t(key);
  });

  // Trigger app re-renders if available
  if (window.App && typeof window.App.refreshCurrentView === 'function') {
    window.App.refreshCurrentView();
  }
}

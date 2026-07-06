// Konter-TrackApp App Logic
class KonterTrackApp {
  constructor() {
    this.transactions = [];
    this.customers = [];
    this.markupSettings = {
      koperasiPulsa: 1000,
      resellerPulsa: 1000,
      resellerTopup: 3000,
      resellerTagihan: 3000
    };
    this.currentView = 'dashboard';
    this.formCategory = 'Pulsa';
    this.catalogTab = 'Semua';
    this.reportTab = 'reseller';
    this.chartInstance = null;
    this.supabaseClient = null;
    this.supabaseUrl = '';
    this.supabaseKey = '';
  }

  init() {
    this.loadState();
    this.checkLogin();
    this.setupEventListeners();
    this.updateClock();
    
    // Set default datetime to form input
    this.setDefaultFormDate();

    // Trigger silent Supabase connection attempt on start
    this.connectSupabase(true);
  }

  loadState() {
    // Load markup settings
    const savedSettings = localStorage.getItem('konter_markup_settings');
    if (savedSettings) {
      this.markupSettings = JSON.parse(savedSettings);
    }

    // Load customers
    const savedCustomers = localStorage.getItem('konter_customers');
    if (savedCustomers) {
      this.customers = JSON.parse(savedCustomers);
    } else {
      // Seed initial customers
      this.customers = [
        { id: "c1", name: "Budi Santoso", phone: "081234567890", note: "Tetangga sebelah kanan" },
        { id: "c2", name: "Siti Aminah", phone: "085678901234", note: "Pemilik warung sebelah" },
        { id: "c3", name: "Joko Widodo", phone: "089012345678", note: "Meteran PLN Token token ruko" },
        { id: "c4", name: "Anisa Fitri", phone: "087712345678", note: "Gopay langganan" }
      ];
      localStorage.setItem('konter_customers', JSON.stringify(this.customers));
    }

    // Load transactions
    const savedTransactions = localStorage.getItem('konter_transactions');
    if (savedTransactions) {
      this.transactions = JSON.parse(savedTransactions);
    } else {
      // Seed dummy transactions for demo
      this.seedDummyTransactions();
    }
  }

  seedDummyTransactions() {
    const now = new Date();
    const t1 = new Date(); t1.setDate(now.getDate() - 3);
    const t2 = new Date(); t2.setDate(now.getDate() - 2);
    const t3 = new Date(); t3.setDate(now.getDate() - 1);
    const t4 = new Date(now); t4.setHours(now.getHours() - 4);
    const t5 = new Date(now); t5.setHours(now.getHours() - 1);

    this.transactions = [
      {
        id: "t_1",
        date: t1.toISOString(),
        customerName: "Budi Santoso",
        targetNumber: "081234567890",
        productCode: "S10",
        productName: "Telkomsel 10.000",
        category: "Pulsa",
        modalPrice: 10214,
        sellingPrice: 13000,
        resellerProfit: 1000,
        koperasiProfit: 1000,
        roundingProfit: 786,
        type: "auto"
      },
      {
        id: "t_2",
        date: t2.toISOString(),
        customerName: "Siti Aminah",
        targetNumber: "085678901234",
        productCode: "I25",
        productName: "Indosat 25.000",
        category: "Pulsa",
        modalPrice: 25527,
        sellingPrice: 28000,
        resellerProfit: 1000,
        koperasiProfit: 1000,
        roundingProfit: 473,
        type: "auto"
      },
      {
        id: "t_3",
        date: t3.toISOString(),
        customerName: "Joko Widodo",
        targetNumber: "51234567890",
        productCode: "PLN100",
        productName: "Token PLN 100.000",
        category: "Tagihan",
        modalPrice: 101850,
        sellingPrice: 105000,
        resellerProfit: 3000,
        koperasiProfit: 0,
        roundingProfit: 150,
        type: "auto"
      },
      {
        id: "t_4",
        date: t4.toISOString(),
        customerName: "Anisa Fitri",
        targetNumber: "087712345678",
        productCode: "GJK50",
        productName: "Gopay Customer 50.000",
        category: "Topup",
        modalPrice: 50880,
        sellingPrice: 55000,
        resellerProfit: 3000,
        koperasiProfit: 0,
        roundingProfit: 1120,
        type: "auto"
      },
      {
        id: "t_5",
        date: t5.toISOString(),
        customerName: "Budi Santoso",
        targetNumber: "081234567890",
        productCode: "A5",
        productName: "Axis 5.000",
        category: "Pulsa",
        modalPrice: 5859,
        sellingPrice: 8000,
        resellerProfit: 1000,
        koperasiProfit: 1000,
        roundingProfit: 141,
        type: "auto"
      }
    ];
    localStorage.setItem('konter_transactions', JSON.stringify(this.transactions));
  }

  checkLogin() {
    const isLoggedIn = sessionStorage.getItem('konter_is_logged_in');
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app-screen');

    if (isLoggedIn === 'true') {
      loginScreen.style.display = 'none';
      appScreen.style.display = 'flex';
      this.renderCurrentView();
    } else {
      loginScreen.style.display = 'flex';
      appScreen.style.display = 'none';
    }
  }

  setupEventListeners() {
    // Login Form Submit
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('username').value.trim();
      const pass = document.getElementById('password').value.trim();

      if (user === 'admin' && pass === 'koperasi123') {
        sessionStorage.setItem('konter_is_logged_in', 'true');
        this.checkLogin();
      } else {
        alert('Username atau password salah! Hubungi Koperasi.');
      }
    });

    // Logout Button
    document.getElementById('logout-btn').addEventListener('click', () => {
      sessionStorage.removeItem('konter_is_logged_in');
      this.checkLogin();
    });

    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const body = document.body;
      const themeIcon = document.querySelector('#theme-toggle i');
      
      if (body.classList.contains('dark-theme')) {
        body.classList.replace('dark-theme', 'light-theme');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
      } else {
        body.classList.replace('light-theme', 'dark-theme');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
      }
    });

    // Sidebar Navigation Click
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        document.querySelectorAll('.sidebar-menu .menu-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        const target = item.getAttribute('data-target');
        this.switchView(target);
      });
    });

    // Customer Form Submit (Modal)
    document.getElementById('customer-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCustomer();
    });

    // Transaction Form Submit
    document.getElementById('transaction-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveTransaction();
    });

    // Autocomplete events on customer name in form
    const nameInput = document.getElementById('trans-customer-name');
    nameInput.addEventListener('input', () => this.handleCustomerAutocomplete());
    nameInput.addEventListener('focus', () => this.handleCustomerAutocomplete());
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.autocomplete-container')) {
        document.getElementById('customer-suggestions').style.display = 'none';
      }
    });

    // Product Select change in form
    document.getElementById('trans-product-select').addEventListener('change', () => this.handleProductChange());

    // Pricing Options switch
    document.getElementById('price-opt-auto').addEventListener('change', () => this.togglePricingFields());
    document.getElementById('price-opt-manual').addEventListener('change', () => this.togglePricingFields());

    // Input listening for recalculation
    document.getElementById('trans-selling-price').addEventListener('input', () => this.calculatePriceBreakdown());
    document.getElementById('trans-modal-price').addEventListener('input', () => this.calculatePriceBreakdown());

    // Live catalog search
    document.getElementById('catalog-search').addEventListener('input', () => this.renderPrices());

    // Live customer search
    document.getElementById('customer-search').addEventListener('input', () => this.renderCustomers());
  }

  updateClock() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    document.getElementById('current-date').innerText = today.toLocaleDateString('id-ID', options);
  }

  setDefaultFormDate() {
    const now = new Date();
    // Offset for local timezone string formatting
    const tzoffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
    document.getElementById('trans-date').value = localISOTime;
  }

  switchView(viewName) {
    this.currentView = viewName;
    
    // Hide all view panes
    document.querySelectorAll('.view-pane').forEach(pane => pane.classList.remove('active'));
    
    // Remove active from menus
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(el => {
      if (el.getAttribute('data-target') === viewName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Setup head text
    const heading = document.getElementById('page-heading');
    const subheading = document.getElementById('page-subheading');

    switch (viewName) {
      case 'dashboard':
        heading.innerText = 'Dashboard';
        subheading.innerText = 'Informasi ringkasan performa keuangan konter koperasi Anda hari ini.';
        break;
      case 'transactions':
        heading.innerText = 'Catat Transaksi Baru';
        subheading.innerText = 'Input transaksi penjualan pulsa, topup, dan tagihan dengan bagi hasil otomatis.';
        break;
      case 'customers':
        heading.innerText = 'Daftar Nama Pelanggan';
        subheading.innerText = 'Kelola daftar nama pelanggan tetap Anda untuk pengisian transaksi lebih cepat.';
        break;
      case 'prices':
        heading.innerText = 'Katalog Daftar Harga Ter-markup';
        subheading.innerText = 'Lihat daftar harga modal dan harga jual yang sudah dimarkup berdasarkan aturan keuntungan Anda.';
        break;
      case 'reports':
        heading.innerText = 'Laporan Laba Terpisah';
        subheading.innerText = 'Lihat, saring, cetak, dan unduh dokumen laba terpisah antara Anda dan Koperasi.';
        break;
    }

    // Show selected pane
    const activePane = document.getElementById(`view-${viewName}`);
    if (activePane) {
      activePane.classList.add('active');
    }

    this.renderCurrentView();
  }

  renderCurrentView() {
    switch (this.currentView) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'transactions':
        this.renderTransactionForm();
        break;
      case 'customers':
        this.renderCustomers();
        break;
      case 'prices':
        this.renderPrices();
        break;
      case 'reports':
        this.renderReports();
        break;
    }
  }

  /* ========================================================
     DASHBOARD VIEW
     ======================================================== */
  renderDashboard() {
    let totalOmset = 0;
    let totalModal = 0;
    let totalReseller = 0;
    let totalKoperasi = 0;
    let totalRounding = 0;

    this.transactions.forEach(t => {
      totalOmset += Number(t.sellingPrice || 0);
      totalModal += Number(t.modalPrice || 0);
      totalReseller += Number(t.resellerProfit || 0);
      totalKoperasi += Number(t.koperasiProfit || 0);
      totalRounding += Number(t.roundingProfit || 0);
    });

    document.getElementById('stat-total-omset').innerText = this.formatIDR(totalOmset);
    document.getElementById('stat-total-modal').innerText = this.formatIDR(totalModal);
    document.getElementById('stat-laba-reseller').innerText = this.formatIDR(totalReseller + totalRounding);
    document.getElementById('stat-laba-koperasi').innerText = this.formatIDR(totalKoperasi);
    document.getElementById('stat-laba-rounding').innerText = this.formatIDR(totalRounding);
    document.getElementById('stat-total-transactions').innerText = this.transactions.length;

    // Render Recent Transactions
    const tbody = document.getElementById('recent-transactions-tbody');
    tbody.innerHTML = '';

    const sortedTrans = [...this.transactions].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    if (sortedTrans.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color: var(--text-muted);">Belum ada transaksi tersimpan. Silakan input transaksi baru.</td></tr>`;
    } else {
      sortedTrans.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${this.formatDateTime(t.date)}</td>
          <td><strong>${t.customerName || 'Bukan Langganan'}</strong></td>
          <td><span class="badge badge-${t.category.toLowerCase()}">${t.category}</span> ${t.productName}</td>
          <td><code>${t.targetNumber}</code></td>
          <td>${this.formatIDR(t.modalPrice)}</td>
          <td style="font-weight:700; color:var(--primary);">${this.formatIDR(t.sellingPrice)}</td>
          <td style="color:var(--success); font-weight:600;">+${this.formatIDR(t.resellerProfit)}</td>
          <td style="color:var(--accent); font-weight:600;">+${this.formatIDR(t.koperasiProfit)}</td>
          <td>
            <button class="btn-icon" style="width:28px; height:28px; font-size:11px; border-color:rgba(255,23,68,0.2); color:var(--danger);" onclick="app.deleteTransaction('${t.id}')" title="Hapus Transaksi">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    this.renderDashboardCharts();
  }

  renderDashboardCharts() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    // Aggregate profit data per day for Chart.js
    const dateGroups = {};
    
    // Sort transactions by date ascending
    const sortedForChart = [...this.transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedForChart.forEach(t => {
      const d = new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      if (!dateGroups[d]) {
        dateGroups[d] = { reseller: 0, koperasi: 0 };
      }
      dateGroups[d].reseller += (t.resellerProfit + t.roundingProfit);
      dateGroups[d].koperasi += t.koperasiProfit;
    });

    const labels = Object.keys(dateGroups);
    const resellerData = labels.map(l => dateGroups[l].reseller);
    const koperasiData = labels.map(l => dateGroups[l].koperasi);

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length > 0 ? labels : ['Belum Ada Data'],
        datasets: [
          {
            label: 'Keuntungan Reseller (Saya)',
            data: resellerData.length > 0 ? resellerData : [0],
            backgroundColor: '#00e676',
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'Keuntungan Koperasi',
            data: koperasiData.length > 0 ? koperasiData : [0],
            backgroundColor: '#ffb800',
            borderRadius: 6,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#94a3b8',
              font: { family: 'Plus Jakarta Sans', weight: '600' }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              callback: function(value) { return 'Rp ' + value.toLocaleString('id-ID'); }
            }
          }
        }
      }
    });
  }

  refreshDashboardCharts() {
    this.renderDashboardCharts();
  }

  /* ========================================================
     TRANSACTIONS RECORDING VIEW & LOGIC
     ======================================================== */
  renderTransactionForm() {
    // Fill categories settings configuration fields
    document.getElementById('global-kop-pulsa-profit').value = this.markupSettings.koperasiPulsa;
    document.getElementById('global-reseller-pulsa-profit').value = this.markupSettings.resellerPulsa;
    document.getElementById('global-reseller-topup-profit').value = this.markupSettings.resellerTopup;
    document.getElementById('global-reseller-tagihan-profit').value = this.markupSettings.resellerTagihan;

    this.setFormCategory(this.formCategory);
    this.setDefaultFormDate();
  }

  setFormCategory(categoryName) {
    this.formCategory = categoryName;

    // Toggle active form tabs
    document.querySelectorAll('.form-tabs .form-tab').forEach(tab => {
      if (tab.getAttribute('data-category') === categoryName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Populate products select element
    const select = document.getElementById('trans-product-select');
    select.innerHTML = '<option value="" disabled selected>Pilih produk / operator...</option>';

    // Filter products by selected category
    const filteredProducts = DEFAULT_PRODUCTS.filter(p => p.category === categoryName);
    
    // Sort products by name
    filteredProducts.sort((a,b) => a.name.localeCompare(b.name));

    filteredProducts.forEach(p => {
      const option = document.createElement('option');
      option.value = p.code;
      option.innerText = `[${p.code}] ${p.name} - Modal: ${this.formatIDR(p.base_price)}`;
      select.appendChild(option);
    });

    // Reset fields
    document.getElementById('trans-modal-price').value = '';
    document.getElementById('trans-modal-price').readOnly = (categoryName !== 'Tagihan');
    
    // Reset pricing mode: dynamic bills should default to manual or auto based on input
    if (categoryName === 'Tagihan') {
      document.getElementById('trans-modal-price').placeholder = "Masukkan nominal tagihan manual";
    } else {
      document.getElementById('trans-modal-price').placeholder = "Harga modal terisi otomatis";
    }

    this.togglePricingFields();
    this.calculatePriceBreakdown();
  }

  handleCustomerAutocomplete() {
    const nameInput = document.getElementById('trans-customer-name');
    const query = nameInput.value.toLowerCase().trim();
    const suggestionsBox = document.getElementById('customer-suggestions');

    // Filter customers
    const filtered = this.customers.filter(c => c.name.toLowerCase().includes(query));

    if (filtered.length > 0 && query !== '') {
      suggestionsBox.innerHTML = '';
      filtered.forEach(c => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
          <span>${c.name}</span>
          <span class="suggestion-phone">${c.phone}</span>
        `;
        div.addEventListener('click', () => {
          nameInput.value = c.name;
          document.getElementById('trans-target-number').value = c.phone;
          suggestionsBox.style.display = 'none';
        });
        suggestionsBox.appendChild(div);
      });
      suggestionsBox.style.display = 'block';
    } else {
      suggestionsBox.style.display = 'none';
    }
  }

  handleProductChange() {
    const code = document.getElementById('trans-product-select').value;
    const product = DEFAULT_PRODUCTS.find(p => p.code === code);
    
    if (product) {
      const modalInput = document.getElementById('trans-modal-price');
      modalInput.value = product.base_price;
      
      // If it's a bill, we let the user enter base price manually because bills vary in amount
      if (this.formCategory === 'Tagihan' && product.base_price === 0) {
        modalInput.readOnly = false;
        modalInput.value = '';
        modalInput.focus();
      } else {
        modalInput.readOnly = true;
      }
      
      this.calculatePriceBreakdown();
    }
  }

  togglePricingFields() {
    const isManual = document.getElementById('price-opt-manual').checked;
    const manualPriceWrapper = document.getElementById('manual-price-wrapper');

    if (isManual) {
      manualPriceWrapper.style.display = 'block';
      document.getElementById('trans-selling-price').required = true;
    } else {
      manualPriceWrapper.style.display = 'none';
      document.getElementById('trans-selling-price').required = false;
    }

    this.calculatePriceBreakdown();
  }

  calculatePriceBreakdown() {
    const code = document.getElementById('trans-product-select').value;
    const product = DEFAULT_PRODUCTS.find(p => p.code === code);
    const modalInputVal = Number(document.getElementById('trans-modal-price').value || 0);

    const isManual = document.getElementById('price-opt-manual').checked;
    const manualSellPrice = Number(document.getElementById('trans-selling-price').value || 0);

    let baseModal = modalInputVal;
    let sellingPrice = 0;
    let resellerProfit = 0;
    let koperasiProfit = 0;
    let roundingProfit = 0;

    const descSpan = document.getElementById('commission-rule-desc');

    if (!code || baseModal === 0) {
      this.updatePriceBreakdownDOM(0, 0, 0, 0, 0, 0);
      return;
    }

    if (this.formCategory === 'Pulsa') {
      // PULSA RULE: split Rp 1,000 Reseller, Rp 1,000 Koperasi, then round up.
      resellerProfit = Number(this.markupSettings.resellerPulsa);
      koperasiProfit = Number(this.markupSettings.koperasiPulsa);
      descSpan.innerHTML = `Bagi hasil <strong>PULSA</strong>: Koperasi Rp ${koperasiProfit.toLocaleString()} &amp; Reseller Rp ${resellerProfit.toLocaleString()} per transaksi (ditambah bonus pembulatan).`;

      if (isManual) {
        sellingPrice = manualSellPrice;
        // profit kotor
        const totalProfitKotor = sellingPrice - baseModal;
        roundingProfit = totalProfitKotor - (resellerProfit + koperasiProfit);
      } else {
        // Auto: baseModal + resellerProfit + koperasiProfit
        const baseSellingPrice = baseModal + resellerProfit + koperasiProfit;
        // Round UP to nearest thousand (e.g. 7859 -> 8000)
        sellingPrice = Math.ceil(baseSellingPrice / 1000) * 1000;
        roundingProfit = sellingPrice - baseModal - resellerProfit - koperasiProfit;
      }
    } else if (this.formCategory === 'Topup') {
      // TOPUP RULE: Rp 3,000 Reseller markup, Rp 0 Koperasi markup, then round up.
      resellerProfit = Number(this.markupSettings.resellerTopup);
      koperasiProfit = 0;
      descSpan.innerHTML = `Bagi hasil <strong>TOPUP</strong>: Seluruh keuntungan markup Rp ${resellerProfit.toLocaleString()} sepenuhnya milik Reseller (koperasi Rp 0).`;

      if (isManual) {
        sellingPrice = manualSellPrice;
        const totalProfitKotor = sellingPrice - baseModal;
        roundingProfit = totalProfitKotor - resellerProfit;
      } else {
        const baseSellingPrice = baseModal + resellerProfit;
        // Round UP to nearest thousand
        sellingPrice = Math.ceil(baseSellingPrice / 1000) * 1000;
        roundingProfit = sellingPrice - baseModal - resellerProfit;
      }
    } else if (this.formCategory === 'Tagihan') {
      // TAGIHAN RULE: Rp 3,000 Reseller markup, Rp 0 Koperasi markup. No round up because bills are precise.
      resellerProfit = Number(this.markupSettings.resellerTagihan);
      koperasiProfit = 0;
      descSpan.innerHTML = `Bagi hasil <strong>TAGIHAN</strong>: Seluruh keuntungan markup Rp ${resellerProfit.toLocaleString()} sepenuhnya milik Reseller (koperasi Rp 0). Tidak dibulatkan karena tagihan bersifat presisi.`;

      if (isManual) {
        sellingPrice = manualSellPrice;
        const totalProfitKotor = sellingPrice - baseModal;
        roundingProfit = totalProfitKotor - resellerProfit;
      } else {
        // Auto Tagihan: Bill + markup (no rounding up)
        sellingPrice = baseModal + resellerProfit;
        roundingProfit = 0;
      }
    }

    this.updatePriceBreakdownDOM(baseModal, resellerProfit + koperasiProfit, roundingProfit, koperasiProfit, resellerProfit, sellingPrice);
  }

  updatePriceBreakdownDOM(modal, markup, rounding, kop, reseller, total) {
    document.getElementById('preview-modal').innerText = this.formatIDR(modal);
    document.getElementById('preview-markup').innerText = this.formatIDR(markup);
    document.getElementById('preview-rounding').innerText = this.formatIDR(rounding);
    document.getElementById('preview-koperasi').innerText = this.formatIDR(kop);
    document.getElementById('preview-reseller').innerText = this.formatIDR(reseller);
    document.getElementById('preview-selling-price').innerText = this.formatIDR(total);
  }

  saveTransaction() {
    const customerName = document.getElementById('trans-customer-name').value.trim();
    const targetNumber = document.getElementById('trans-target-number').value.trim();
    const transDateVal = document.getElementById('trans-date').value;
    const productCode = document.getElementById('trans-product-select').value;

    const modalInputVal = Number(document.getElementById('trans-modal-price').value || 0);
    const isManual = document.getElementById('price-opt-manual').checked;
    const manualSellPrice = Number(document.getElementById('trans-selling-price').value || 0);

    if (!productCode) {
      alert("Pilih produk terlebih dahulu!");
      return;
    }

    if (!targetNumber) {
      alert("Masukkan nomor tujuan / ID!");
      return;
    }

    const product = DEFAULT_PRODUCTS.find(p => p.code === productCode);
    const dateObj = new Date(transDateVal);

    // Calculate split commission
    let resellerProfit = 0;
    let koperasiProfit = 0;
    let roundingProfit = 0;
    let sellingPrice = 0;

    if (this.formCategory === 'Pulsa') {
      resellerProfit = Number(this.markupSettings.resellerPulsa);
      koperasiProfit = Number(this.markupSettings.koperasiPulsa);
      if (isManual) {
        sellingPrice = manualSellPrice;
        roundingProfit = (sellingPrice - modalInputVal) - (resellerProfit + koperasiProfit);
      } else {
        sellingPrice = Math.ceil((modalInputVal + resellerProfit + koperasiProfit) / 1000) * 1000;
        roundingProfit = sellingPrice - modalInputVal - resellerProfit - koperasiProfit;
      }
    } else if (this.formCategory === 'Topup') {
      resellerProfit = Number(this.markupSettings.resellerTopup);
      koperasiProfit = 0;
      if (isManual) {
        sellingPrice = manualSellPrice;
        roundingProfit = (sellingPrice - modalInputVal) - resellerProfit;
      } else {
        sellingPrice = Math.ceil((modalInputVal + resellerProfit) / 1000) * 1000;
        roundingProfit = sellingPrice - modalInputVal - resellerProfit;
      }
    } else if (this.formCategory === 'Tagihan') {
      resellerProfit = Number(this.markupSettings.resellerTagihan);
      koperasiProfit = 0;
      if (isManual) {
        sellingPrice = manualSellPrice;
        roundingProfit = (sellingPrice - modalInputVal) - resellerProfit;
      } else {
        sellingPrice = modalInputVal + resellerProfit;
        roundingProfit = 0;
      }
    }

    if (sellingPrice <= 0 || sellingPrice < modalInputVal) {
      alert("Harga jual tidak boleh lebih kecil dari harga modal!");
      return;
    }

    // Save transaction
    const newTx = {
      id: "t_" + Date.now(),
      date: dateObj.toISOString(),
      customerName: customerName || "Bukan Langganan",
      targetNumber: targetNumber,
      productCode: productCode,
      productName: product.name,
      category: this.formCategory,
      modalPrice: modalInputVal,
      sellingPrice: sellingPrice,
      resellerProfit: resellerProfit,
      koperasiProfit: koperasiProfit,
      roundingProfit: roundingProfit,
      type: isManual ? "manual" : "auto"
    };

    // If new customer name is entered that doesn't exist, prompt/add it
    if (customerName && !this.customers.some(c => c.name.toLowerCase() === customerName.toLowerCase())) {
      const addCustomerOk = confirm(`Nama "${customerName}" belum terdaftar di pelanggan. Daftarkan sekarang?`);
      if (addCustomerOk) {
        const newCust = {
          id: "c_" + Date.now(),
          name: customerName,
          phone: targetNumber,
          note: "Ditambahkan otomatis dari transaksi"
        };
        this.customers.push(newCust);
        localStorage.setItem('konter_customers', JSON.stringify(this.customers));
      }
    }

    this.transactions.push(newTx);
    localStorage.setItem('konter_transactions', JSON.stringify(this.transactions));

    alert("Transaksi penjualan berhasil disimpan dan dikunci!");
    
    // Reset form
    document.getElementById('transaction-form').reset();
    document.getElementById('trans-customer-name').value = '';
    document.getElementById('trans-target-number').value = '';
    document.getElementById('trans-selling-price').value = '';
    this.setDefaultFormDate();
    this.setFormCategory(this.formCategory);

    // Redirect to dashboard
    this.switchView('dashboard');
  }

  deleteTransaction(id) {
    const confirmation = confirm("Apakah Anda yakin ingin menghapus transaksi ini? Data laba akan disesuaikan kembali.");
    if (confirmation) {
      this.transactions = this.transactions.filter(t => t.id !== id);
      localStorage.setItem('konter_transactions', JSON.stringify(this.transactions));
      this.renderCurrentView();
    }
  }

  /* ========================================================
     CUSTOMER LIST MANAGER
     ======================================================== */
  renderCustomers() {
    const tbody = document.getElementById('customers-tbody');
    tbody.innerHTML = '';

    const searchQuery = document.getElementById('customer-search').value.toLowerCase().trim();
    
    // Calculate customer metrics
    const customerStats = {};
    this.transactions.forEach(t => {
      if (t.customerName) {
        if (!customerStats[t.customerName]) {
          customerStats[t.customerName] = { count: 0, spend: 0 };
        }
        customerStats[t.customerName].count += 1;
        customerStats[t.customerName].spend += t.sellingPrice;
      }
    });

    const filtered = this.customers.filter(c => c.name.toLowerCase().includes(searchQuery) || c.phone.includes(searchQuery));

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">Tidak ada data pelanggan yang cocok.</td></tr>`;
    } else {
      filtered.forEach(c => {
        const stats = customerStats[c.name] || { count: 0, spend: 0 };
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${c.name}</strong></td>
          <td><code>${c.phone}</code></td>
          <td><span style="font-style:italic; color:var(--text-secondary);">${c.note || '-'}</span></td>
          <td>${stats.count} Transaksi</td>
          <td style="font-weight:600; color:var(--primary);">${this.formatIDR(stats.spend)}</td>
          <td>
            <div style="display:flex; gap:8px;">
              <button class="btn-icon" style="width:28px; height:28px; font-size:11px;" onclick="app.openEditCustomerModal('${c.id}')" title="Edit">
                <i class="fa-solid fa-user-pen"></i>
              </button>
              <button class="btn-icon" style="width:28px; height:28px; font-size:11px; color:var(--danger); border-color:rgba(255,23,68,0.2);" onclick="app.deleteCustomer('${c.id}')" title="Hapus">
                <i class="fa-solid fa-user-xmark"></i>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  }

  openAddCustomerModal() {
    document.getElementById('modal-customer-title').innerText = "Tambah Pelanggan Baru";
    document.getElementById('cust-id-hidden').value = '';
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-phone').value = '';
    document.getElementById('cust-note').value = '';
    document.getElementById('customer-modal').classList.add('active');
  }

  openEditCustomerModal(id) {
    const cust = this.customers.find(c => c.id === id);
    if (cust) {
      document.getElementById('modal-customer-title').innerText = "Edit Data Pelanggan";
      document.getElementById('cust-id-hidden').value = cust.id;
      document.getElementById('cust-name').value = cust.name;
      document.getElementById('cust-phone').value = cust.phone;
      document.getElementById('cust-note').value = cust.note || '';
      document.getElementById('customer-modal').classList.add('active');
    }
  }

  closeCustomerModal() {
    document.getElementById('customer-modal').classList.remove('active');
  }

  saveCustomer() {
    const id = document.getElementById('cust-id-hidden').value;
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const note = document.getElementById('cust-note').value.trim();

    if (!name || !phone) {
      alert("Nama dan Nomor HP harus diisi!");
      return;
    }

    if (id) {
      // Edit existing
      const index = this.customers.findIndex(c => c.id === id);
      if (index !== -1) {
        this.customers[index].name = name;
        this.customers[index].phone = phone;
        this.customers[index].note = note;
      }
    } else {
      // Create new
      const newCust = {
        id: "c_" + Date.now(),
        name: name,
        phone: phone,
        note: note
      };
      this.customers.push(newCust);
    }

    localStorage.setItem('konter_customers', JSON.stringify(this.customers));
    this.closeCustomerModal();
    this.renderCurrentView();
  }

  deleteCustomer(id) {
    const customer = this.customers.find(c => c.id === id);
    if (!customer) return;

    const confirmation = confirm(`Apakah Anda yakin ingin menghapus pelanggan "${customer.name}"? Nomor ini tidak akan dihapus dari riwayat transaksi lama.`);
    if (confirmation) {
      this.customers = this.customers.filter(c => c.id !== id);
      localStorage.setItem('konter_customers', JSON.stringify(this.customers));
      this.renderCurrentView();
    }
  }

  /* ========================================================
     PRICE LIST / CATALOG VIEW & GLOBAL SETTINGS
     ======================================================== */
  setCatalogTab(tabName) {
    this.catalogTab = tabName;
    document.querySelectorAll('[data-catalog-tab]').forEach(btn => {
      if (btn.getAttribute('data-catalog-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    this.renderPrices();
  }

  saveGlobalMarkupSettings() {
    const kopPulsa = Number(document.getElementById('global-kop-pulsa-profit').value || 0);
    const resellerPulsa = Number(document.getElementById('global-reseller-pulsa-profit').value || 0);
    const resellerTopup = Number(document.getElementById('global-reseller-topup-profit').value || 0);
    const resellerTagihan = Number(document.getElementById('global-reseller-tagihan-profit').value || 0);

    this.markupSettings = {
      koperasiPulsa: kopPulsa,
      resellerPulsa: resellerPulsa,
      resellerTopup: resellerTopup,
      resellerTagihan: resellerTagihan
    };

    localStorage.setItem('konter_markup_settings', JSON.stringify(this.markupSettings));
    this.renderPrices();
  }

  renderPrices() {
    const tbody = document.getElementById('catalog-tbody');
    tbody.innerHTML = '';

    const searchQuery = document.getElementById('catalog-search').value.toLowerCase().trim();

    // Filter default products
    let filtered = DEFAULT_PRODUCTS;
    if (this.catalogTab !== 'Semua') {
      filtered = filtered.filter(p => p.category === this.catalogTab);
    }

    if (searchQuery !== '') {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery) || p.code.toLowerCase().includes(searchQuery));
    }

    // Sort by name
    filtered = [...filtered].sort((a,b) => a.name.localeCompare(b.name));

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">Tidak ada produk yang cocok dengan pencarian.</td></tr>`;
      return;
    }

    filtered.forEach(p => {
      let markupDesc = '';
      let markupAmount = 0;
      let finalPrice = 0;
      let roundingDesc = '';

      if (p.category === 'Pulsa') {
        const resellerProfit = this.markupSettings.resellerPulsa;
        const koperasiProfit = this.markupSettings.koperasiPulsa;
        markupAmount = resellerProfit + koperasiProfit;
        markupDesc = `Kop +Rp ${koperasiProfit.toLocaleString()} | Reseller +Rp ${resellerProfit.toLocaleString()}`;
        
        // Auto computation logic
        const rawJual = p.base_price + markupAmount;
        finalPrice = Math.ceil(rawJual / 1000) * 1000;
        const roundingDiff = finalPrice - rawJual;
        roundingDesc = roundingDiff > 0 ? `+Rp ${roundingDiff.toLocaleString()} (Pembulatan)` : 'Pas';
      } else if (p.category === 'Topup') {
        const resellerProfit = this.markupSettings.resellerTopup;
        markupAmount = resellerProfit;
        markupDesc = `Reseller +Rp ${resellerProfit.toLocaleString()} (Koperasi Rp 0)`;
        
        const rawJual = p.base_price + markupAmount;
        finalPrice = Math.ceil(rawJual / 1000) * 1000;
        const roundingDiff = finalPrice - rawJual;
        roundingDesc = roundingDiff > 0 ? `+Rp ${roundingDiff.toLocaleString()} (Pembulatan)` : 'Pas';
      } else if (p.category === 'Tagihan') {
        const resellerProfit = this.markupSettings.resellerTagihan;
        markupAmount = resellerProfit;
        markupDesc = `Reseller +Rp ${resellerProfit.toLocaleString()} (Koperasi Rp 0)`;
        
        if (p.base_price === 0) {
          // Dynamic bill payment
          finalPrice = 0; // Depends on inputs
          roundingDesc = 'Dinamis (No Pembulatan)';
        } else {
          finalPrice = p.base_price + markupAmount;
          roundingDesc = 'Pas (No Pembulatan)';
        }
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><code>${p.code}</code></td>
        <td><strong>${p.name}</strong></td>
        <td><span class="badge badge-${p.category.toLowerCase()}">${p.category}</span></td>
        <td>${p.base_price > 0 ? this.formatIDR(p.base_price) : '<span style="color:var(--accent);">Dinamis / Sesuai Tagihan</span>'}</td>
        <td style="font-size:11px; color:var(--text-secondary);">${markupDesc}</td>
        <td style="font-size:11px; color:var(--text-muted);">${roundingDesc}</td>
        <td style="font-weight:700; color:var(--success); font-size:14px;">
          ${finalPrice > 0 ? this.formatIDR(finalPrice) : '<span style="color:var(--accent);">Nominal Tagihan + ' + this.formatIDR(markupAmount) + '</span>'}
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* ========================================================
     SEPARATED REPORTS VIEW
     ======================================================== */
  setReportTab(tabName) {
    this.reportTab = tabName;

    const resellerBtn = document.getElementById('btn-rep-reseller');
    const koperasiBtn = document.getElementById('btn-rep-koperasi');

    if (tabName === 'reseller') {
      resellerBtn.classList.add('active');
      koperasiBtn.classList.remove('active');
    } else {
      resellerBtn.classList.remove('active');
      koperasiBtn.classList.add('active');
    }

    this.renderReports();
  }

  applyReportFilters() {
    this.renderReports();
  }

  getFilteredTransactions() {
    const startDateVal = document.getElementById('filter-start-date').value;
    const endDateVal = document.getElementById('filter-end-date').value;

    let filtered = [...this.transactions];

    if (startDateVal) {
      const start = new Date(startDateVal);
      start.setHours(0,0,0,0);
      filtered = filtered.filter(t => new Date(t.date) >= start);
    }

    if (endDateVal) {
      const end = new Date(endDateVal);
      end.setHours(23,59,59,999);
      filtered = filtered.filter(t => new Date(t.date) <= end);
    }

    // Sort by date descending
    return filtered.sort((a,b) => new Date(b.date) - new Date(a.date));
  }

  renderReports() {
    const filteredTx = this.getFilteredTransactions();
    const table = document.getElementById('report-table');
    const tbody = document.getElementById('report-tbody');
    tbody.innerHTML = '';

    const docTitle = document.getElementById('report-doc-title');
    const docPeriod = document.getElementById('report-doc-period');
    const docTotal = document.getElementById('report-total-amount');

    // Setup dates strings for print title
    const startDateVal = document.getElementById('filter-start-date').value;
    const endDateVal = document.getElementById('filter-end-date').value;
    let periodText = "Periode: Semua Waktu";
    if (startDateVal || endDateVal) {
      const startStr = startDateVal ? this.formatDateOnly(startDateVal) : 'Awal';
      const endStr = endDateVal ? this.formatDateOnly(endDateVal) : 'Akhir';
      periodText = `Periode: ${startStr} s/d ${endStr}`;
    }
    docPeriod.innerText = periodText;

    // Build structure based on selected tab
    if (this.reportTab === 'reseller') {
      docTitle.innerText = "DOKUMEN PENGHASILAN SAYA (RESELLER) - KONTER KOPERASI";
      
      // Calculate total reseller earnings
      let sumReseller = 0;
      filteredTx.forEach(t => {
        sumReseller += (t.resellerProfit + t.roundingProfit);
      });
      docTotal.innerText = this.formatIDR(sumReseller);

      // Set headers
      table.querySelector('thead').innerHTML = `
        <tr>
          <th>Tanggal</th>
          <th>Pelanggan</th>
          <th>Nama Produk</th>
          <th>Nomor / ID</th>
          <th>Harga Jual</th>
          <th>Komisi Pokok</th>
          <th>Bonus Pembulatan</th>
          <th style="color: var(--success);">Subtotal Laba Saya</th>
        </tr>
      `;

      // Set body
      if (filteredTx.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: var(--text-muted);">Tidak ada transaksi pada periode ini.</td></tr>`;
      } else {
        filteredTx.forEach(t => {
          const subtotal = t.resellerProfit + t.roundingProfit;
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${this.formatDateTime(t.date)}</td>
            <td><strong>${t.customerName}</strong></td>
            <td>${t.productName}</td>
            <td><code>${t.targetNumber}</code></td>
            <td>${this.formatIDR(t.sellingPrice)}</td>
            <td>${this.formatIDR(t.resellerProfit)}</td>
            <td>${this.formatIDR(t.roundingProfit)}</td>
            <td style="font-weight:700; color:var(--success);">${this.formatIDR(subtotal)}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    } else {
      // KOPERASI REPORT
      docTitle.innerText = "DOKUMEN PENGHASILAN BAGI HASIL KOPERASI";
      
      // Calculate total koperasi earnings
      let sumKop = 0;
      filteredTx.forEach(t => {
        sumKop += t.koperasiProfit;
      });
      docTotal.innerText = this.formatIDR(sumKop);

      // Set headers
      table.querySelector('thead').innerHTML = `
        <tr>
          <th>Tanggal</th>
          <th>Pelanggan</th>
          <th>Nama Produk</th>
          <th>Nomor / ID</th>
          <th>Harga Jual</th>
          <th>Harga Modal</th>
          <th>Kategori</th>
          <th style="color: var(--accent);">Bagi Hasil Koperasi</th>
        </tr>
      `;

      // Set body
      if (filteredTx.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: var(--text-muted);">Tidak ada transaksi pada periode ini.</td></tr>`;
      } else {
        filteredTx.forEach(t => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${this.formatDateTime(t.date)}</td>
            <td><strong>${t.customerName}</strong></td>
            <td>${t.productName}</td>
            <td><code>${t.targetNumber}</code></td>
            <td>${this.formatIDR(t.sellingPrice)}</td>
            <td>${this.formatIDR(t.modalPrice)}</td>
            <td><span class="badge badge-${t.category.toLowerCase()}">${t.category}</span></td>
            <td style="font-weight:700; color:var(--accent);">${this.formatIDR(t.koperasiProfit)}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    }

    // Set printable values
    const printReportType = document.getElementById('print-report-type');
    const printReportDate = document.getElementById('print-report-date');
    if(printReportType && printReportDate) {
      printReportType.innerText = this.reportTab === 'reseller' ? "LAPORAN LABA BERSIH RESELLER (SAYA)" : "LAPORAN BAGI HASIL KOPERASI";
      printReportDate.innerText = periodText + ` | Diunduh: ${new Date().toLocaleDateString('id-ID')}`;
    }
  }

  exportReportCSV() {
    const filteredTx = this.getFilteredTransactions();
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (this.reportTab === 'reseller') {
      csvContent += "Tanggal,Pelanggan,Nama Produk,Nomor ID,Harga Jual,Komisi Pokok Reseller,Bonus Pembulatan,Total Laba Saya\n";
      filteredTx.forEach(t => {
        const subtotal = t.resellerProfit + t.roundingProfit;
        csvContent += `"${t.date}","${t.customerName}","${t.productName}","${t.targetNumber}",${t.sellingPrice},${t.resellerProfit},${t.roundingProfit},${subtotal}\n`;
      });
    } else {
      csvContent += "Tanggal,Pelanggan,Nama Produk,Nomor ID,Harga Jual,Harga Modal,Kategori,Bagi Hasil Koperasi\n";
      filteredTx.forEach(t => {
        csvContent += `"${t.date}","${t.customerName}","${t.productName}","${t.targetNumber}",${t.sellingPrice},${t.modalPrice},"${t.category}",${t.koperasiProfit}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const filename = this.reportTab === 'reseller' ? `Laporan_Laba_Saya_${Date.now()}.csv` : `Laporan_Laba_Koperasi_${Date.now()}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /* ========================================================
     HELPERS & UTILITIES
     ======================================================== */
  formatIDR(number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  }

  formatDateTime(isoString) {
    const date = new Date(isoString);
    const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    return `${date.toLocaleDateString('id-ID', dateOptions)} ${date.toLocaleTimeString('id-ID', timeOptions)}`;
  }

  formatDateOnly(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // --- SUPABASE SYNC METHODS ---
  async connectSupabase(silent = false) {
    const urlInput = document.getElementById('db-supabase-url');
    const keyInput = document.getElementById('db-supabase-key');
    
    let url = urlInput ? urlInput.value.trim() : '';
    let key = keyInput ? keyInput.value.trim() : '';
    
    if (!url || !key) {
      if (typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.key) {
        url = SUPABASE_CONFIG.url.trim();
        key = SUPABASE_CONFIG.key.trim();
      } else {
        url = localStorage.getItem('konter_supabase_url') || '';
        key = localStorage.getItem('konter_supabase_key') || '';
      }
    }

    if (!url || !key) {
      if (!silent) alert("Mohon masukkan Project URL dan API Key Supabase!");
      return;
    }

    try {
      if (typeof supabase === 'undefined') {
        throw new Error("Pustaka Supabase CDN belum termuat. Coba muat ulang halaman.");
      }

      this.supabaseUrl = url;
      this.supabaseKey = key;
      this.supabaseClient = supabase.createClient(url, key);

      // Simpan ke localStorage
      localStorage.setItem('konter_supabase_url', url);
      localStorage.setItem('konter_supabase_key', key);

      // Sinkronisasi data
      await this.syncWithSupabase();

      // Update UI Status
      this.updateDbStatus(true);
      if (!silent) alert("Koneksi Supabase berhasil terhubung dan disinkronkan!");
    } catch (err) {
      console.error(err);
      this.updateDbStatus(false);
      if (!silent) alert("Koneksi Supabase gagal! Silakan periksa URL & API Key Anda. Detail: " + err.message);
    }
  }

  updateDbStatus(isConnected) {
    const badge = document.getElementById('db-status-badge');
    const btnConnect = document.getElementById('btn-connect-db');
    const btnDisconnect = document.getElementById('btn-disconnect-db');
    const urlInput = document.getElementById('db-supabase-url');
    const keyInput = document.getElementById('db-supabase-key');

    if (badge) {
      if (isConnected) {
        badge.innerText = "Online (Terhubung Supabase)";
        badge.style.backgroundColor = "var(--success)";
        if (btnConnect) btnConnect.style.display = 'none';
        if (btnDisconnect) btnDisconnect.style.display = 'inline-flex';
        if (urlInput) { urlInput.value = this.supabaseUrl; urlInput.disabled = true; }
        if (keyInput) { keyInput.value = "••••••••••••••••••••••••••••"; keyInput.disabled = true; }
      } else {
        badge.innerText = "Offline (Penyimpanan Lokal)";
        badge.style.backgroundColor = "var(--text-muted)";
        if (btnConnect) btnConnect.style.display = 'inline-flex';
        if (btnDisconnect) btnDisconnect.style.display = 'none';
        if (urlInput) { urlInput.value = ''; urlInput.disabled = false; }
        if (keyInput) { keyInput.value = ''; keyInput.disabled = false; }
      }
    }
  }

  disconnectSupabase() {
    this.supabaseClient = null;
    this.supabaseUrl = '';
    this.supabaseKey = '';
    localStorage.removeItem('konter_supabase_url');
    localStorage.removeItem('konter_supabase_key');
    this.updateDbStatus(false);
    alert("Koneksi Supabase diputuskan. Kembali ke mode penyimpanan lokal.");
  }

  async syncWithSupabase() {
    if (!this.supabaseClient) return;

    try {
      // 1. Sinkronisasi Pelanggan (Customers)
      const { data: remoteCustomers, error: custError } = await this.supabaseClient
        .from('konter_customers')
        .select('*');

      if (custError) throw custError;

      if (remoteCustomers && remoteCustomers.length > 0) {
        const localMap = new Map(this.customers.map(c => [c.id, c]));
        remoteCustomers.forEach(rc => {
          localMap.set(rc.id, rc);
        });
        this.customers = Array.from(localMap.values());
        localStorage.setItem('konter_customers', JSON.stringify(this.customers));
      }

      const remoteIds = new Set((remoteCustomers || []).map(c => c.id));
      const newLocalCustomers = this.customers.filter(c => !remoteIds.has(c.id));
      
      if (newLocalCustomers.length > 0) {
        const { error: insertError } = await this.supabaseClient
          .from('konter_customers')
          .insert(newLocalCustomers);
        if (insertError) throw insertError;
      }

      // 2. Sinkronisasi Transaksi
      const { data: remoteTrans, error: txError } = await this.supabaseClient
        .from('konter_transactions')
        .select('*');

      if (txError) throw txError;

      if (remoteTrans && remoteTrans.length > 0) {
        const localTxMap = new Map(this.transactions.map(t => [t.id, t]));
        remoteTrans.forEach(rt => {
          localTxMap.set(rt.id, rt);
        });
        this.transactions = Array.from(localTxMap.values());
        localStorage.setItem('konter_transactions', JSON.stringify(this.transactions));
      }

      const remoteTxIds = new Set((remoteTrans || []).map(t => t.id));
      const newLocalTrans = this.transactions.filter(t => !remoteTxIds.has(t.id));

      if (newLocalTrans.length > 0) {
        const { error: insertTxError } = await this.supabaseClient
          .from('konter_transactions')
          .insert(newLocalTrans);
        if (insertTxError) throw insertTxError;
      }

      this.renderCurrentView();
    } catch (err) {
      console.error("Sync Error: ", err);
      alert("Peringatan: Gagal sinkronisasi data cloud. Pastikan Anda telah membuat tabel 'konter_customers' dan 'konter_transactions' di SQL Editor Supabase Anda!");
    }
  }
}

// Instantiate the App
const app = new KonterTrackApp();

// Run on page load
window.addEventListener('DOMContentLoaded', () => {
  app.init();
});

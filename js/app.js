// Konter-TrackApp App Logic
class KonterTrackApp {
  constructor() {
    this.transactions = [];
    this.customers = [];
    this.markupSettings = {
      koperasiPulsa: 1000,
      koperasiTopup: 1000,
      koperasiTagihan: 1000,
      resellerPulsa: 1000,
      resellerTopup: 3000,
      resellerTagihan: 3000
    };
    this.currentView = 'dashboard';
    this.formCategory = 'Pulsa';
    this.catalogTab = 'Semua';
    this.reportTab = 'reseller';
    this.chartInstance = null;
    this.firebaseApp = null;
    this.firebaseDb = null;
    this.firebaseConfigString = '';
  }

  init() {
    this.loadState();
    this.checkLogin();
    this.setupEventListeners();
    this.updateClock();
    
    // Set default datetime to form input
    this.setDefaultFormDate();

    // Trigger silent Firebase connection attempt on start
    this.connectFirebase(true);
  }

  loadState() {
    // Load markup settings
    const savedSettings = localStorage.getItem('konter_markup_settings');
    if (savedSettings) {
      this.markupSettings = {
        koperasiPulsa: 1000,
        koperasiTopup: 1000,
        koperasiTagihan: 1000,
        resellerPulsa: 1000,
        resellerTopup: 3000,
        resellerTagihan: 3000,
        ...JSON.parse(savedSettings)
      };
    }

    // Load customers
    const savedCustomers = localStorage.getItem('konter_customers');
    if (savedCustomers) {
      this.customers = JSON.parse(savedCustomers);
    } else {
      this.customers = [];
      localStorage.setItem('konter_customers', JSON.stringify(this.customers));
    }

    // Load transactions
    const savedTransactions = localStorage.getItem('konter_transactions');
    if (savedTransactions) {
      this.transactions = JSON.parse(savedTransactions);
    } else {
      this.transactions = [];
      localStorage.setItem('konter_transactions', JSON.stringify(this.transactions));
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
        sellingPrice: 105850,
        resellerProfit: 3000,
        koperasiProfit: 1000,
        roundingProfit: 0,
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
        koperasiProfit: 1000,
        roundingProfit: 120,
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

  async hashSHA256(ascii) {
    // If Web Crypto is supported (HTTPS contexts), use it for maximum performance
    if (window.crypto && window.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(ascii);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        console.warn("Subtle crypto failed, falling back to JS SHA-256: ", e);
      }
    }

    // Fallback: Pure JS SHA-256 implementation (compatible with non-secure HTTP contexts)
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length';
    var i, j;
    var result = '';

    var words = [];
    var asciiLength = ascii[lengthProperty] * 8;
    
    var hash = [];
    var k = [];
    var primeCounter = 0;

    var isPrime = function(n) {
      for (var factor = 2; factor * factor <= n; factor++) {
        if (n % factor === 0) return false;
      }
      return true;
    };

    var getFractionalBits = function(n) {
      return ((n - Math.floor(n)) * maxWord) | 0;
    };

    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (isPrime(candidate)) {
        if (primeCounter < 8) {
          hash[primeCounter] = getFractionalBits(mathPow(candidate, 1/2));
        }
        k[primeCounter] = getFractionalBits(mathPow(candidate, 1/3));
        primeCounter++;
      }
    }
    
    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return ''; // ASCII only
      words[i >> 2] |= j << ((3 - i) % 4 * 8);
    }
    words[words[lengthProperty]] = ((asciiLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiLength | 0);
    
    for (j = 0; j < words[lengthProperty]; ) {
      var w = words.slice(j, j += 16);
      
      var a = hash[0], b = hash[1], c = hash[2], d = hash[3], e = hash[4], f = hash[5], g = hash[6], h = hash[7];
      
      for (i = 0; i < 64; i++) {
        var wItem = w[i];
        if (i >= 16) {
          var s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
          var s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
          wItem = w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
        }
        
        var s1_e = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
        var ch = (e & f) ^ (~e & g);
        var temp1 = (h + s1_e + ch + k[i] + wItem) | 0;
        var s0_a = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var temp2 = (s0_a + maj) | 0;
        
        h = g;
        g = f;
        f = e;
        e = (d + temp1) | 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) | 0;
      }
      
      hash[0] = (hash[0] + a) | 0;
      hash[1] = (hash[1] + b) | 0;
      hash[2] = (hash[2] + c) | 0;
      hash[3] = (hash[3] + d) | 0;
      hash[4] = (hash[4] + e) | 0;
      hash[5] = (hash[5] + f) | 0;
      hash[6] = (hash[6] + g) | 0;
      hash[7] = (hash[7] + h) | 0;
    }
    
    for (i = 0; i < 8; i++) {
      var s = (hash[i] >>> 0).toString(16);
      while (s.length < 8) s = '0' + s;
      result += s;
    }
    return result;
  }

  async verifyLogin(user, pass) {
    const userHash = await this.hashSHA256(user);
    const passHash = await this.hashSHA256(pass);

    // 1. Try Firebase Firestore first if connected
    if (this.firebaseDb) {
      try {
        const userDoc = await this.firebaseDb.collection('konter_users').doc(user).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          const currentPassHash = await this.hashSHA256(userData.password);
          if (currentPassHash === passHash) {
            return userData.role;
          }
        }
      } catch (e) {
        console.error("Firebase login check error: ", e);
      }
    }

    // 2. Try Custom settings saved in LocalStorage
    const savedAdminHash = localStorage.getItem('konter_admin_pass_hash');
    const savedResellerHash = localStorage.getItem('konter_reseller_pass_hash');

    const adminPassHash = savedAdminHash || "3995c5ab78e11f0f454490f9a3cccfe0867d379336bdc50bf06afd136ff43489"; // default: koperasi123
    const resellerPassHash = savedResellerHash || "69ff63ab831a811281d43c71c31fee45924edcb73993179c5c6ca0ece3e62fd2"; // default: reseller123

    const defaultAdminUserHash = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"; // admin
    const defaultResellerUserHash = "f5a46d562f4068b8db71485cc9d30a7f0fe39da0014d8e785e48a1aea0c2448d"; // reseller

    if (userHash === defaultAdminUserHash && passHash === adminPassHash) {
      return 'admin';
    } else if (userHash === defaultResellerUserHash && passHash === resellerPassHash) {
      return 'reseller';
    }

    return null;
  }

  async updatePasswords() {
    const adminPass = document.getElementById('settings-admin-pass').value.trim();
    const resellerPass = document.getElementById('settings-reseller-pass').value.trim();

    if (!adminPass && !resellerPass) {
      alert("Masukkan minimal satu password baru!");
      return;
    }

    try {
      if (adminPass) {
        const hash = await this.hashSHA256(adminPass);
        localStorage.setItem('konter_admin_pass_hash', hash);
        
        if (this.firebaseDb) {
          await this.firebaseDb.collection('konter_users').doc('admin').set({
            username: 'admin',
            password: adminPass,
            role: 'admin'
          });
        }
      }

      if (resellerPass) {
        const hash = await this.hashSHA256(resellerPass);
        localStorage.setItem('konter_reseller_pass_hash', hash);

        if (this.firebaseDb) {
          await this.firebaseDb.collection('konter_users').doc('reseller').set({
            username: 'reseller',
            password: resellerPass,
            role: 'reseller'
          });
        }
      }

      alert("Password baru berhasil disimpan!");
      document.getElementById('settings-admin-pass').value = '';
      document.getElementById('settings-reseller-pass').value = '';
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan password baru: " + e.message);
    }
  }

  checkLogin() {
    const isLoggedIn = sessionStorage.getItem('konter_is_logged_in');
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app-screen');

    if (isLoggedIn === 'true') {
      loginScreen.style.display = 'none';
      appScreen.style.display = 'flex';
      
      const role = sessionStorage.getItem('konter_user_role') || 'admin';
      const userAvatar = document.getElementById('user-avatar');
      const userDisplayName = document.getElementById('user-display-name');
      const userDisplayRole = document.getElementById('user-display-role');

      if (role === 'admin') {
        document.body.classList.remove('role-reseller');
        document.body.classList.add('role-admin');
        if (userAvatar) userAvatar.innerText = 'AD';
        if (userDisplayName) userDisplayName.innerText = 'Administrator';
        if (userDisplayRole) userDisplayRole.innerText = 'Koperasi Admin';
      } else {
        document.body.classList.remove('role-admin');
        document.body.classList.add('role-reseller');
        if (userAvatar) userAvatar.innerText = 'RS';
        if (userDisplayName) userDisplayName.innerText = 'Reseller Partner';
        if (userDisplayRole) userDisplayRole.innerText = 'Reseller Operator';
        
        if (this.reportTab === 'koperasi') {
          this.reportTab = 'reseller';
        }
      }
      
      this.renderCurrentView();
    } else {
      loginScreen.style.display = 'flex';
      appScreen.style.display = 'none';
      document.body.classList.remove('role-admin', 'role-reseller');
    }
  }

  setupEventListeners() {
    // Login Form Submit
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = document.getElementById('username').value.trim().toLowerCase();
      const pass = document.getElementById('password').value.trim();

      const role = await this.verifyLogin(user, pass);
      if (role) {
        sessionStorage.setItem('konter_is_logged_in', 'true');
        sessionStorage.setItem('konter_user_role', role);
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

    const isAdmin = sessionStorage.getItem('konter_user_role') === 'admin';
    const datasets = [
      {
        label: 'Keuntungan Reseller (Saya)',
        data: resellerData.length > 0 ? resellerData : [0],
        backgroundColor: '#00e676',
        borderRadius: 6,
        borderSkipped: false
      }
    ];

    if (isAdmin) {
      datasets.push({
        label: 'Keuntungan Koperasi',
        data: koperasiData.length > 0 ? koperasiData : [0],
        backgroundColor: '#ffb800',
        borderRadius: 6,
        borderSkipped: false
      });
    }

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length > 0 ? labels : ['Belum Ada Data'],
        datasets: datasets
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
    if (document.getElementById('global-kop-topup-profit')) {
      document.getElementById('global-kop-topup-profit').value = this.markupSettings.koperasiTopup || 1000;
    }
    document.getElementById('global-reseller-topup-profit').value = this.markupSettings.resellerTopup;
    if (document.getElementById('global-kop-tagihan-profit')) {
      document.getElementById('global-kop-tagihan-profit').value = this.markupSettings.koperasiTagihan || 1000;
    }
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

    const isAdmin = sessionStorage.getItem('konter_user_role') === 'admin';
    if (this.formCategory === 'Pulsa') {
      // PULSA RULE: split Rp 1,000 Reseller, Rp 1,000 Koperasi, then round up.
      resellerProfit = Number(this.markupSettings.resellerPulsa);
      koperasiProfit = Number(this.markupSettings.koperasiPulsa);
      descSpan.innerHTML = isAdmin 
        ? `Bagi hasil <strong>PULSA</strong>: Koperasi Rp ${koperasiProfit.toLocaleString()} &amp; Reseller Rp ${resellerProfit.toLocaleString()} per transaksi (ditambah bonus pembulatan).`
        : `Bagi hasil <strong>PULSA</strong>: Reseller Rp ${resellerProfit.toLocaleString()} per transaksi (ditambah bonus pembulatan).`;

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
      // TOPUP RULE: Rp 3,000 Reseller markup, Rp 1,000 Koperasi markup, then round up.
      resellerProfit = Number(this.markupSettings.resellerTopup);
      koperasiProfit = Number(this.markupSettings.koperasiTopup || 1000);
      descSpan.innerHTML = isAdmin
        ? `Bagi hasil <strong>TOPUP</strong>: Koperasi Rp ${koperasiProfit.toLocaleString()} &amp; Reseller Rp ${resellerProfit.toLocaleString()} per transaksi (ditambah bonus pembulatan).`
        : `Bagi hasil <strong>TOPUP</strong>: Reseller Rp ${resellerProfit.toLocaleString()} per transaksi (ditambah bonus pembulatan).`;

      if (isManual) {
        sellingPrice = manualSellPrice;
        const totalProfitKotor = sellingPrice - baseModal;
        roundingProfit = totalProfitKotor - (resellerProfit + koperasiProfit);
      } else {
        const baseSellingPrice = baseModal + resellerProfit + koperasiProfit;
        // Round UP to nearest thousand
        sellingPrice = Math.ceil(baseSellingPrice / 1000) * 1000;
        roundingProfit = sellingPrice - baseModal - resellerProfit - koperasiProfit;
      }
    } else if (this.formCategory === 'Tagihan') {
      // TAGIHAN RULE: Rp 3,000 Reseller markup, Rp 1,000 Koperasi markup. No round up because bills are precise.
      resellerProfit = Number(this.markupSettings.resellerTagihan);
      koperasiProfit = Number(this.markupSettings.koperasiTagihan || 1000);
      descSpan.innerHTML = isAdmin
        ? `Bagi hasil <strong>TAGIHAN</strong>: Koperasi Rp ${koperasiProfit.toLocaleString()} &amp; Reseller Rp ${resellerProfit.toLocaleString()} per transaksi (tanpa pembulatan).`
        : `Bagi hasil <strong>TAGIHAN</strong>: Reseller Rp ${resellerProfit.toLocaleString()} per transaksi (tanpa pembulatan).`;

      if (isManual) {
        sellingPrice = manualSellPrice;
        const totalProfitKotor = sellingPrice - baseModal;
        roundingProfit = totalProfitKotor - (resellerProfit + koperasiProfit);
      } else {
        // Auto Tagihan: Bill + markup (no rounding up)
        sellingPrice = baseModal + resellerProfit + koperasiProfit;
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

  async saveTransaction() {
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
      koperasiProfit = Number(this.markupSettings.koperasiTopup || 1000);
      if (isManual) {
        sellingPrice = manualSellPrice;
        roundingProfit = (sellingPrice - modalInputVal) - (resellerProfit + koperasiProfit);
      } else {
        sellingPrice = Math.ceil((modalInputVal + resellerProfit + koperasiProfit) / 1000) * 1000;
        roundingProfit = sellingPrice - modalInputVal - resellerProfit - koperasiProfit;
      }
    } else if (this.formCategory === 'Tagihan') {
      resellerProfit = Number(this.markupSettings.resellerTagihan);
      koperasiProfit = Number(this.markupSettings.koperasiTagihan || 1000);
      if (isManual) {
        sellingPrice = manualSellPrice;
        roundingProfit = (sellingPrice - modalInputVal) - (resellerProfit + koperasiProfit);
      } else {
        sellingPrice = modalInputVal + resellerProfit + koperasiProfit;
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
        
        // Sync to Firebase if connected
        if (this.firebaseDb) {
          try {
            await this.firebaseDb.collection('konter_customers').doc(newCust.id).set(newCust);
          } catch (e) {
            console.error("Firebase save new customer error: ", e);
          }
        }
      }
    }

    this.transactions.push(newTx);
    localStorage.setItem('konter_transactions', JSON.stringify(this.transactions));

    // Sync to Firebase if connected
    if (this.firebaseDb) {
      try {
        await this.firebaseDb.collection('konter_transactions').doc(newTx.id).set(newTx);
      } catch (e) {
        console.error("Firebase save transaction error: ", e);
        alert("Gagal sinkronisasi transaksi ke cloud Firebase, tapi tersimpan lokal.");
      }
    }

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

  async deleteTransaction(id) {
    const confirmation = confirm("Apakah Anda yakin ingin menghapus transaksi ini? Data laba akan disesuaikan kembali.");
    if (confirmation) {
      this.transactions = this.transactions.filter(t => t.id !== id);
      localStorage.setItem('konter_transactions', JSON.stringify(this.transactions));
      
      // Delete from Firebase if connected
      if (this.firebaseDb) {
        try {
          await this.firebaseDb.collection('konter_transactions').doc(id).delete();
        } catch (e) {
          console.error("Firebase delete transaction error: ", e);
          alert("Gagal menghapus transaksi dari cloud Firebase, tapi terhapus secara lokal.");
        }
      }
      
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

  async saveCustomer() {
    const id = document.getElementById('cust-id-hidden').value;
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const note = document.getElementById('cust-note').value.trim();

    if (!name || !phone) {
      alert("Nama dan Nomor HP harus diisi!");
      return;
    }

    let customerObj = null;
    if (id) {
      // Edit existing
      const index = this.customers.findIndex(c => c.id === id);
      if (index !== -1) {
        this.customers[index].name = name;
        this.customers[index].phone = phone;
        this.customers[index].note = note;
        customerObj = this.customers[index];
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
      customerObj = newCust;
    }

    localStorage.setItem('konter_customers', JSON.stringify(this.customers));
    
    // Sync to Firebase if connected
    if (this.firebaseDb && customerObj) {
      try {
        await this.firebaseDb.collection('konter_customers').doc(customerObj.id).set(customerObj);
      } catch (e) {
        console.error("Firebase save customer error: ", e);
        alert("Gagal sinkronisasi data pelanggan ke cloud Firebase, tapi tersimpan lokal.");
      }
    }

    this.closeCustomerModal();
    this.renderCurrentView();
  }

  async deleteCustomer(id) {
    const customer = this.customers.find(c => c.id === id);
    if (!customer) return;

    const confirmation = confirm(`Apakah Anda yakin ingin menghapus pelanggan "${customer.name}"? Nomor ini tidak akan dihapus dari riwayat transaksi lama.`);
    if (confirmation) {
      this.customers = this.customers.filter(c => c.id !== id);
      localStorage.setItem('konter_customers', JSON.stringify(this.customers));
      
      // Delete from Firebase if connected
      if (this.firebaseDb) {
        try {
          await this.firebaseDb.collection('konter_customers').doc(id).delete();
        } catch (e) {
          console.error("Firebase delete customer error: ", e);
          alert("Gagal menghapus data pelanggan dari cloud Firebase, tapi terhapus secara lokal.");
        }
      }
      
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
    
    const kopTopupInput = document.getElementById('global-kop-topup-profit');
    const kopTopup = kopTopupInput ? Number(kopTopupInput.value || 0) : (this.markupSettings.koperasiTopup || 1000);
    const resellerTopup = Number(document.getElementById('global-reseller-topup-profit').value || 0);
    
    const kopTagihanInput = document.getElementById('global-kop-tagihan-profit');
    const kopTagihan = kopTagihanInput ? Number(kopTagihanInput.value || 0) : (this.markupSettings.koperasiTagihan || 1000);
    const resellerTagihan = Number(document.getElementById('global-reseller-tagihan-profit').value || 0);

    this.markupSettings = {
      koperasiPulsa: kopPulsa,
      koperasiTopup: kopTopup,
      koperasiTagihan: kopTagihan,
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
        const koperasiProfit = this.markupSettings.koperasiTopup || 1000;
        markupAmount = resellerProfit + koperasiProfit;
        markupDesc = isAdmin
          ? `Kop +Rp ${koperasiProfit.toLocaleString()} | Reseller +Rp ${resellerProfit.toLocaleString()}`
          : `Reseller +Rp ${resellerProfit.toLocaleString()}`;
        
        const rawJual = p.base_price + markupAmount;
        finalPrice = Math.ceil(rawJual / 1000) * 1000;
        const roundingDiff = finalPrice - rawJual;
        roundingDesc = roundingDiff > 0 ? `+Rp ${roundingDiff.toLocaleString()} (Pembulatan)` : 'Pas';
      } else if (p.category === 'Tagihan') {
        const resellerProfit = this.markupSettings.resellerTagihan;
        const koperasiProfit = this.markupSettings.koperasiTagihan || 1000;
        markupAmount = resellerProfit + koperasiProfit;
        markupDesc = isAdmin
          ? `Kop +Rp ${koperasiProfit.toLocaleString()} | Reseller +Rp ${resellerProfit.toLocaleString()}`
          : `Reseller +Rp ${resellerProfit.toLocaleString()}`;
        
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

  // --- FIREBASE SYNC METHODS ---
  parseFirebaseConfig(str) {
    str = str.trim();
    // Remove variable declaration if present (e.g. const firebaseConfig = or var config =)
    str = str.replace(/^(const|let|var)\s+\w+\s*=\s*/, '');
    // Remove trailing semicolon if present
    if (str.endsWith(';')) {
      str = str.substring(0, str.length - 1);
    }
    
    try {
      return JSON.parse(str);
    } catch (e) {
      try {
        const fn = new Function(`return (${str});`);
        return fn();
      } catch (err) {
        throw new Error("Format konfigurasi Firebase tidak valid. Pastikan itu adalah JSON atau Object literal yang valid.");
      }
    }
  }

  async connectFirebase(silent = false) {
    const configInput = document.getElementById('db-firebase-config');
    let configStr = configInput ? configInput.value.trim() : '';

    let configObj = null;

    if (!configStr) {
      if (typeof FIREBASE_CONFIG !== 'undefined' && Object.keys(FIREBASE_CONFIG).length > 0) {
        configObj = FIREBASE_CONFIG;
      } else {
        const savedConfig = localStorage.getItem('konter_firebase_config');
        if (savedConfig) {
          try {
            configObj = JSON.parse(savedConfig);
          } catch (e) {}
        }
      }
    } else {
      try {
        configObj = this.parseFirebaseConfig(configStr);
      } catch (err) {
        if (!silent) alert(err.message);
        return;
      }
    }

    if (!configObj || !configObj.projectId || !configObj.apiKey) {
      if (!silent) alert("Mohon masukkan Firebase Configuration (minimal berisi apiKey dan projectId)!");
      return;
    }

    try {
      if (typeof firebase === 'undefined') {
        throw new Error("Pustaka Firebase CDN belum termuat. Coba muat ulang halaman.");
      }

      // Delete existing app to re-initialize with new config if needed
      if (firebase.apps.length > 0) {
        await firebase.app().delete();
      }

      this.firebaseApp = firebase.initializeApp(configObj);
      this.firebaseDb = firebase.firestore();
      this.firebaseConfigString = JSON.stringify(configObj, null, 2);

      // Simpan ke localStorage
      localStorage.setItem('konter_firebase_config', this.firebaseConfigString);

      // Sinkronisasi data
      await this.syncWithFirebase();

      // Update UI Status
      this.updateDbStatus(true);
      if (!silent) alert("Koneksi Firebase Firestore berhasil terhubung dan disinkronkan!");
    } catch (err) {
      console.error(err);
      this.updateDbStatus(false);
      if (!silent) alert("Koneksi Firebase gagal! Detail: " + err.message);
    }
  }

  updateDbStatus(isConnected) {
    const badge = document.getElementById('db-status-badge');
    const btnConnect = document.getElementById('btn-connect-db');
    const btnDisconnect = document.getElementById('btn-disconnect-db');
    const configInput = document.getElementById('db-firebase-config');

    if (badge) {
      if (isConnected) {
        badge.innerText = "Online (Terhubung Firebase)";
        badge.style.backgroundColor = "var(--success)";
        if (btnConnect) btnConnect.style.display = 'none';
        if (btnDisconnect) btnDisconnect.style.display = 'inline-flex';
        if (configInput) {
          configInput.value = "/* Firebase Connected - Configuration Stored Securely */";
          configInput.disabled = true;
        }
      } else {
        badge.innerText = "Offline (Penyimpanan Lokal)";
        badge.style.backgroundColor = "var(--text-muted)";
        if (btnConnect) btnConnect.style.display = 'inline-flex';
        if (btnDisconnect) btnDisconnect.style.display = 'none';
        if (configInput) {
          configInput.value = this.firebaseConfigString || '';
          configInput.disabled = false;
        }
      }
    }
  }

  async disconnectFirebase() {
    this.firebaseApp = null;
    this.firebaseDb = null;
    this.firebaseConfigString = '';
    localStorage.removeItem('konter_firebase_config');
    try {
      if (firebase.apps.length > 0) {
        await firebase.app().delete();
      }
    } catch (e) {
      console.error(e);
    }
    this.updateDbStatus(false);
    alert("Koneksi Firebase diputuskan. Kembali ke mode penyimpanan lokal.");
  }

  async syncWithFirebase() {
    if (!this.firebaseDb) return;

    try {
      // 1. Sinkronisasi Pelanggan (Customers)
      const custSnapshot = await this.firebaseDb.collection('konter_customers').get();
      const remoteCustomers = [];
      custSnapshot.forEach(doc => {
        remoteCustomers.push(doc.data());
      });

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
        const batch = this.firebaseDb.batch();
        newLocalCustomers.forEach(c => {
          const docRef = this.firebaseDb.collection('konter_customers').doc(c.id);
          batch.set(docRef, c);
        });
        await batch.commit();
      }

      // 2. Sinkronisasi Transaksi
      const txSnapshot = await this.firebaseDb.collection('konter_transactions').get();
      const remoteTrans = [];
      txSnapshot.forEach(doc => {
        remoteTrans.push(doc.data());
      });

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
        const batchSize = 400; // max batch is 500
        for (let i = 0; i < newLocalTrans.length; i += batchSize) {
          const batch = this.firebaseDb.batch();
          const chunk = newLocalTrans.slice(i, i + batchSize);
          chunk.forEach(t => {
            const docRef = this.firebaseDb.collection('konter_transactions').doc(t.id);
            batch.set(docRef, t);
          });
          await batch.commit();
        }
      }

      this.renderCurrentView();
    } catch (err) {
      console.error("Sync Error: ", err);
      alert("Peringatan: Gagal sinkronisasi data cloud Firebase Firestore. Pastikan Firebase Anda sudah dikonfigurasi dengan benar dan Firestore Rules Anda memperbolehkan akses!");
    }
  }
}

// Instantiate the App
const app = new KonterTrackApp();

// Run on page load
window.addEventListener('DOMContentLoaded', () => {
  app.init();
});

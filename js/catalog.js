const DEFAULT_PRODUCTS = [
  // PULSA - Axis
  { code: "A5", name: "Axis 5.000", category: "Pulsa", base_price: 5859 },
  { code: "A10", name: "Axis 10.000", category: "Pulsa", base_price: 10859 },
  { code: "A15", name: "Axis 15.000", category: "Pulsa", base_price: 15058 },
  { code: "A25", name: "Axis 25.000", category: "Pulsa", base_price: 25122 },
  { code: "A30", name: "Axis 30.000", category: "Pulsa", base_price: 30122 },
  { code: "A50", name: "Axis 50.000", category: "Pulsa", base_price: 50095 },
  { code: "A100", name: "Axis 100.000", category: "Pulsa", base_price: 99834 },

  // PULSA - Indosat
  { code: "IA5", name: "Isat Promo 5.000", category: "Pulsa", base_price: 6620 },
  { code: "I5", name: "Indosat 5.000", category: "Pulsa", base_price: 6620 },
  { code: "IA10", name: "Isat Promo 10.000", category: "Pulsa", base_price: 11500 },
  { code: "I10", name: "Indosat 10.000", category: "Pulsa", base_price: 11500 },
  { code: "I15", name: "Indosat 15.000", category: "Pulsa", base_price: 15760 },
  { code: "I25", name: "Indosat 25.000", category: "Pulsa", base_price: 25527 },
  { code: "I50", name: "Indosat 50.000", category: "Pulsa", base_price: 48369 },
  { code: "I100", name: "Indosat 100.000", category: "Pulsa", base_price: 94820 },

  // PULSA - Telkomsel
  { code: "S5", name: "Telkomsel 5.000", category: "Pulsa", base_price: 5229 },
  { code: "S10", name: "Telkomsel 10.000", category: "Pulsa", base_price: 10214 },
  { code: "S15", name: "Telkomsel 15.000", category: "Pulsa", base_price: 14905 },
  { code: "S20", name: "Telkomsel 20.000", category: "Pulsa", base_price: 19898 },
  { code: "S25", name: "Telkomsel 25.000", category: "Pulsa", base_price: 24824 },
  { code: "S50", name: "Telkomsel 50.000", category: "Pulsa", base_price: 49448 },
  { code: "S100", name: "Telkomsel 100.000", category: "Pulsa", base_price: 97515 },

  // PULSA - XL
  { code: "X5", name: "XL 5.000", category: "Pulsa", base_price: 5859 },
  { code: "X10", name: "XL 10.000", category: "Pulsa", base_price: 10859 },
  { code: "X15", name: "XL 15.000", category: "Pulsa", base_price: 15058 },
  { code: "X25", name: "XL 25.000", category: "Pulsa", base_price: 25122 },
  { code: "X50", name: "XL 50.000", category: "Pulsa", base_price: 50095 },
  { code: "X100", name: "XL 100.000", category: "Pulsa", base_price: 99834 },

  // PULSA - Smartfren
  { code: "SM5", name: "Smartfren 5.000", category: "Pulsa", base_price: 5045 },
  { code: "SM10", name: "Smartfren 10.000", category: "Pulsa", base_price: 10030 },
  { code: "SM15", name: "Smartfren 15.000", category: "Pulsa", base_price: 15317 },
  { code: "SM20", name: "Smartfren 20.000", category: "Pulsa", base_price: 20320 },
  { code: "SM50", name: "Smartfren 50.000", category: "Pulsa", base_price: 50265 },
  { code: "SM100", name: "Smartfren 100.000", category: "Pulsa", base_price: 100475 },

  // PULSA - Three
  { code: "T5", name: "Three 5.000", category: "Pulsa", base_price: 5172 },
  { code: "T10", name: "Three 10.000", category: "Pulsa", base_price: 10125 },
  { code: "T20", name: "Three 20.000", category: "Pulsa", base_price: 19750 },
  { code: "T50", name: "Three 50.000", category: "Pulsa", base_price: 48117 },
  { code: "T100", name: "Three 100.000", category: "Pulsa", base_price: 93967 },

  // PULSA - By U
  { code: "BYU5", name: "By U 5.000", category: "Pulsa", base_price: 5325 },
  { code: "BYU10", name: "By U 10.000", category: "Pulsa", base_price: 10275 },
  { code: "BYU20", name: "By U 20.000", category: "Pulsa", base_price: 20150 },
  { code: "BYU50", name: "By U 50.000", category: "Pulsa", base_price: 49900 },
  { code: "BYU100", name: "By U 100.000", category: "Pulsa", base_price: 98500 },

  // TOPUP - Gopay
  { code: "GJK10", name: "Gopay Customer 10.000", category: "Topup", base_price: 10350 },
  { code: "GJK20", name: "Gopay Customer 20.000", category: "Topup", base_price: 20350 },
  { code: "GJK50", name: "Gopay Customer 50.000", category: "Topup", base_price: 50880 },
  { code: "GJK100", name: "Gopay Customer 100.000", category: "Topup", base_price: 100880 },

  // TOPUP - OVO
  { code: "OVO10", name: "Saldo OVO 10.000", category: "Topup", base_price: 9800 },
  { code: "OVO20", name: "Saldo OVO 20.000", category: "Topup", base_price: 19800 },
  { code: "OVO50", name: "Saldo OVO 50.000", category: "Topup", base_price: 49800 },
  { code: "OVO100", name: "Saldo OVO 100.000", category: "Topup", base_price: 99800 },

  // TOPUP - DANA
  { code: "D10", name: "Dana 10.000", category: "Topup", base_price: 10200 },
  { code: "D20", name: "Dana 20.000", category: "Topup", base_price: 20200 },
  { code: "D50", name: "Dana 50.000", category: "Topup", base_price: 50200 },
  { code: "D100", name: "Dana 100.000", category: "Topup", base_price: 100200 },

  // TOPUP - ShopeePay
  { code: "SHP10", name: "ShopeePay 10.000", category: "Topup", base_price: 10100 },
  { code: "SHP20", name: "ShopeePay 20.000", category: "Topup", base_price: 20100 },
  { code: "SHP50", name: "ShopeePay 50.000", category: "Topup", base_price: 50100 },
  { code: "SHP100", name: "ShopeePay 100.000", category: "Topup", base_price: 100100 },

  // TOPUP - LinkAja
  { code: "LINK10", name: "Link Aja 10.000", category: "Topup", base_price: 10350 },
  { code: "LINK20", name: "Link Aja 20.000", category: "Topup", base_price: 20350 },
  { code: "LINK50", name: "Link Aja 50.000", category: "Topup", base_price: 50350 },
  { code: "LINK100", name: "Link Aja 100.000", category: "Topup", base_price: 100350 },

  // TOPUP - Game
  { code: "DML28", name: "MLBB 28 Diamonds", category: "Topup", base_price: 7355 },
  { code: "DML59", name: "MLBB 59 Diamonds", category: "Topup", base_price: 14660 },
  { code: "FF50", name: "Free Fire 50 Diamonds", category: "Topup", base_price: 6205 },
  { code: "FF100", name: "Free Fire 100 Diamonds", category: "Topup", base_price: 12657 },

  // TAGIHAN - Token PLN
  { code: "PLN20", name: "Token PLN 20.000", category: "Tagihan", base_price: 21850 },
  { code: "PLN50", name: "Token PLN 50.000", category: "Tagihan", base_price: 51850 },
  { code: "PLN100", name: "Token PLN 100.000", category: "Tagihan", base_price: 101850 },
  { code: "PLN200", name: "Token PLN 200.000", category: "Tagihan", base_price: 201850 },

  // TAGIHAN - Bulanan (Base price is typical admin fee or zero, will prompt user for dynamic bill amount)
  { code: "PLNBILL", name: "Tagihan Listrik PLN", category: "Tagihan", base_price: 0 },
  { code: "PDAMBILL", name: "Tagihan PDAM Air", category: "Tagihan", base_price: 0 },
  { code: "TELKOMBILL", name: "Tagihan Telkom / Indihome", category: "Tagihan", base_price: 0 },
  { code: "BPJSBILL", name: "Tagihan BPJS Kesehatan", category: "Tagihan", base_price: 0 }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { DEFAULT_PRODUCTS };
}

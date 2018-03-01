"use strict";

// Some test data
export default [
   {
      tag: "Level Tamed 1 Rex 100% TE",
      species: "Rex", level: 1, imprint: 0, exactly: false, mode: "Tamed",
      stats: [1100.1, 420, 150, 3000, 500, 125.8, 100, 1550.5],
      server: "Official Server",
      results: [[{ "Lw": 0, "Ld": 0 }], [{ "Lw": 0, "Ld": 0 }], [{ "Lw": 0, "Ld": 0 }], [{ "Lw": 0, "Ld": 0 }], [{ "Lw": 0, "Ld": 0 }], [{ "Lw": 0, "Ld": 0, "wildLevel": 0, "TE": 1 }], [{ "Lw": 0, "Ld": 0 }], [{ "Lw": 0, "Ld": 0 }]],
   },
   {
      tag: "Level Tamed 8 Rex TE 0% exactly",
      species: "Rex", level: 8, imprint: 0, exactly: true, mode: "Tamed",
      stats: [1320.1, 462, 165, 3300, 510, 112, 100, 2201.5],
      server: "Official Server",
      results: [[{ "Lw": 1, "Ld": 0 }], [{ "Lw": 1, "Ld": 0 }], [{ "Lw": 1, "Ld": 0 }], [{ "Lw": 1, "Ld": 0 }], [{ "Lw": 1, "Ld": 0 }], [{ "Lw": 0, "Ld": 0, "wildLevel": 6, "TE": 0.2655055225148689 }, { "Lw": 1, "Ld": 0, "wildLevel": 7, "TE": 0 }], [{ "Lw": 1, "Ld": 0 }, { "Lw": 2, "Ld": 0 }], [{ "Lw": 7, "Ld": 0 }]],
   },
   {
      tag: "Level Tamed 8 Rex TE 100% (99.94%)",
      species: "Rex", level: 8, imprint: 0, exactly: false, mode: "Tamed",
      stats: [1320.1, 462, 165, 3300, 510, 131.7, 100, 2201.5],
      server: "Official Server",
      results: [[{ "Lw": 1, "Ld": 0 }], [{ "Lw": 1, "Ld": 0 }], [{ "Lw": 1, "Ld": 0 }], [{ "Lw": 1, "Ld": 0 }], [{ "Lw": 1, "Ld": 0 }], [{ "Lw": 1, "Ld": 0, "wildLevel": 5, "TE": 1 }, { "Lw": 2, "Ld": 0, "wildLevel": 5, "TE": 0.7138694638694625 }], [{ "Lw": 0, "Ld": 0 }, { "Lw": 1, "Ld": 0 }], [{ "Lw": 7, "Ld": 0 }]],
   },
   {
      tag: "Level 152 Rex 39% imprint",
      species: "Rex", level: 152, imprint: 39, exactly: false, mode: "Tamed",
      stats: [5280.1, 1386.0, 315, 11100, 650, 270.4, 100, 15593.5],
      server: "Official Server",
      results: [[{ "Lw": 19, "Ld": 0 }], [{ "Lw": 23, "Ld": 0 }], [{ "Lw": 11, "Ld": 0 }], [{ "Lw": 27, "Ld": 0 }], [{ "Lw": 15, "Ld": 0 }], [{ "Lw": 25, "Ld": 0, "wildLevel": 103, "TE": 0.9404388714733548 }, { "Lw": 26, "Ld": 0, "wildLevel": 108, "TE": 0.8007288070579223 }, { "Lw": 27, "Ld": 0, "wildLevel": 113, "TE": 0.6667918858001503 }, { "Lw": 28, "Ld": 0, "wildLevel": 119, "TE": 0.5382775119617228 }, { "Lw": 29, "Ld": 0, "wildLevel": 125, "TE": 0.4148629148629146 }, { "Lw": 30, "Ld": 0, "wildLevel": 132, "TE": 0.29625044216483926 }, { "Lw": 31, "Ld": 0, "wildLevel": 138, "TE": 0.1821651630811943 }, { "Lw": 32, "Ld": 0, "wildLevel": 146, "TE": 0.07235274089206765 }], [{ "Lw": 24, "Ld": 0 }, { "Lw": 25, "Ld": 0 }, { "Lw": 26, "Ld": 0 }, { "Lw": 27, "Ld": 0 }, { "Lw": 28, "Ld": 0 }, { "Lw": 29, "Ld": 0 }, { "Lw": 30, "Ld": 0 }, { "Lw": 31, "Ld": 0 }], [{ "Lw": 151, "Ld": 0 }]],
   },
   {
      tag: "Baryonx - Level 130 (Single Player)",
      species: "Baryonyx", level: 130, imprint: 81, exactly: false, mode: "Tamed",
      stats: [2129.6, 1072.5, 0, 6300, 416, 223.1, 120, 3424.5],
      server: "Official Single Player",
      results: [[{ "Lw": 13, "Ld": 3 }], [{ "Lw": 23, "Ld": 0 }], [{ "Lw": -1, "Ld": 0 }], [{ "Lw": 18, "Ld": 0 }], [{ "Lw": 14, "Ld": 0 }], [{ "Lw": 7, "Ld": 0, "wildLevel": 84, "TE": 0.9859374999999998 }, { "Lw": 8, "Ld": 0, "wildLevel": 87, "TE": 0.8803030303030301 }, { "Lw": 9, "Ld": 0, "wildLevel": 91, "TE": 0.7808823529411762 }, { "Lw": 10, "Ld": 0, "wildLevel": 94, "TE": 0.6871428571428567 }, { "Lw": 11, "Ld": 0, "wildLevel": 97, "TE": 0.5986111111111109 }, { "Lw": 12, "Ld": 0, "wildLevel": 100, "TE": 0.5148648648648646 }, { "Lw": 13, "Ld": 0, "wildLevel": 103, "TE": 0.43552631578947343 }, { "Lw": 14, "Ld": 0, "wildLevel": 107, "TE": 0.36025641025640986 }, { "Lw": 15, "Ld": 0, "wildLevel": 110, "TE": 0.28874999999999984 }, { "Lw": 16, "Ld": 0, "wildLevel": 113, "TE": 0.22073170731707337 }, { "Lw": 17, "Ld": 0, "wildLevel": 117, "TE": 0.1559523809523805 }, { "Lw": 18, "Ld": 0, "wildLevel": 120, "TE": 0.09418604651162787 }, { "Lw": 19, "Ld": 0, "wildLevel": 124, "TE": 0.03522727272727233 }], [{ "Lw": -1, "Ld": 0 }], [{ "Lw": 126, "Ld": 0 }]],
   },
   {
      tag: "Tapejara - Level 1 (Single Player HP.IDM: 2.0)",
      species: "Tapejara", level: 1, imprint: 0, exactly: false, mode: "Tamed",
      stats: [325.3, 250.0, 150, 1840, 280, 175.0, 136.5, 450.5],
      server: "kohonac HP.IDM: 2.0",
      results: [[{"Lw":0, "Ld":0}], [{"Lw":0, "Ld":0}], [{"Lw":0, "Ld":0}], [{"Lw":0, "Ld":0, "wildLevel":0, "TE":1}], [{"Lw":0, "Ld":0}], [{"Lw":0, "Ld":0, "wildLevel":0, "TE":1}], [{"Lw":0, "Ld":0}], [{"Lw":0, "Ld":0}]],
   },
   {
      tag: "Tapejara - Level 2 (Single Player HP.IDM: 2.0)",
      species: "Tapejara", level: 2, imprint: 0, exactly: false, mode: "Tamed",
      stats: [698.5, 250.0, 150, 1840, 280, 175.0, 136.5, 450.5],
      server: "kohonac HP.IDM: 2.0",
      results: [[{"Lw":0, "Ld":1}], [{"Lw":0, "Ld":0}], [{"Lw":0, "Ld":0}], [{"Lw":0, "Ld":0, "wildLevel":0, "TE":1}], [{"Lw":0, "Ld":0}], [{"Lw":0, "Ld":0, "wildLevel":0, "TE":1}], [{"Lw":0, "Ld":0}], [{"Lw":0, "Ld":0}]],
   },
   {
      tag: "Rex - Level 204 (Single Player HP.IDM: 2.0)",
      species: "Rex", level: 204, imprint: 100, exactly: false, mode: "Bred",
      stats: [294404.2, 1554.0, 405, 12240.0, 888, 515.8, 120.0, 19716.5],
      server: "kohonac HP.IDM: 2.0",
      results: [[{ "Lw": 20, "Ld": 38 }], [{ "Lw": 27, "Ld": 0 }], [{ "Lw": 17, "Ld": 0 }], [{ "Lw": 24, "Ld": 0 }], [{ "Lw": 24, "Ld": 0 }], [{ "Lw": 27, "Ld": 5}], [{ "Lw": 21, "Ld": 0 }], [{ "Lw": 160, "Ld": 0 }]],
   },
   {
      tag: "Rex - Level 237 (Custom Server w/ Nanny SP.TAM: 2.0)",
      species: "Rex", level: 237, imprint: 58, exactly: false, mode: "Bred",
      stats: [13266.1, 1890.0, 450, 14740, 915.7, 362.8, 111.7, 26239.9],
      server: "eldoco87",
      results: [[{"Lw":49, "Ld":0}], [{"Lw":35, "Ld":0}], [{"Lw":20, "Ld":0}], [{"Lw":34, "Ld":0}], [{"Lw":32, "Ld":0}], [{"Lw":34, "Ld":0}], [{"Lw":32, "Ld":0}], [{"Lw":236, "Ld":0}]]
   },
];
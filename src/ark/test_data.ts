// tslint:disable:max-line-length

// Some test data
const testData: TestData[] = [
   {
      tag: 'Level Tamed 1 Rex 100% TE',
      species: 'Rex', level: 1, imprint: 0, mode: 'Tamed',
      values: [1100.1, 420, 150, 3000, 500, 125.8, 100, 1550.5],
      serverName: 'Official Server',
      results: [[{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }]],
   },
   {
      tag: 'Level Tamed 8 Rex TE 0% exactly',
      species: 'Rex', level: 8, imprint: 0, mode: 'Tamed',
      values: [1320.1, 462, 165, 3300, 510, 112, 100, 2201.5],
      serverName: 'Official Server',
      results: [[{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 7, Ld: 0 }]],
   },
   {
      tag: 'Level Tamed 8 Rex TE 100% (99.94%)',
      species: 'Rex', level: 8, imprint: 0, mode: 'Tamed',
      values: [1320.1, 462, 165, 3300, 510, 131.6, 100, 2201.5],
      serverName: 'Official Server',
      results: [[{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 2, Ld: 0 }, { Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }, { Lw: 0, Ld: 0 }], [{ Lw: 7, Ld: 0 }]],
   },
   {
      tag: 'Level 152 Rex 39% imprint',
      species: 'Rex', level: 152, imprint: 39, mode: 'Tamed',
      values: [5280.1, 1386.0, 315, 11100, 650, 270.4, 100, 15593.5],
      serverName: 'Official Server',
      results: [[{ Lw: 19, Ld: 0 }], [{ Lw: 23, Ld: 0 }], [{ Lw: 11, Ld: 0 }], [{ Lw: 27, Ld: 0 }], [{ Lw: 15, Ld: 0 }], [{ Lw: 32, Ld: 0 }, { Lw: 31, Ld: 0 }, { Lw: 30, Ld: 0 }, { Lw: 29, Ld: 0 }, { Lw: 28, Ld: 0 }, { Lw: 27, Ld: 0 }, { Lw: 26, Ld: 0 }, { Lw: 25, Ld: 0 }], [{ Lw: 31, Ld: 0 }, { Lw: 30, Ld: 0 }, { Lw: 29, Ld: 0 }, { Lw: 28, Ld: 0 }, { Lw: 27, Ld: 0 }, { Lw: 26, Ld: 0 }, { Lw: 25, Ld: 0 }, { Lw: 24, Ld: 0 }], [{ Lw: 151, Ld: 0 }]],
   },
   {
      tag: 'Baryonx - Level 130 (Single Player)',
      species: 'Baryonyx', level: 130, imprint: 81, mode: 'Tamed',
      values: [2129.6, 1072.5, 0, 6300, 416, 223.1, 120, 3424.5],
      serverName: 'Official Single Player',
      results: [[{ Lw: 13, Ld: 3 }], [{ Lw: 23, Ld: 0 }], [{ Lw: -1, Ld: 0 }], [{ Lw: 18, Ld: 0 }], [{ Lw: 14, Ld: 0 }], [{ Lw: 19, Ld: 0 }, { Lw: 18, Ld: 0 }, { Lw: 17, Ld: 0 }, { Lw: 16, Ld: 0 }, { Lw: 15, Ld: 0 }, { Lw: 14, Ld: 0 }, { Lw: 13, Ld: 0 }, { Lw: 12, Ld: 0 }, { Lw: 11, Ld: 0 }, { Lw: 10, Ld: 0 }, { Lw: 9, Ld: 0 }], [{ Lw: -1, Ld: 0 }], [{ Lw: 126, Ld: 0 }]],
   },
   {
      tag: 'Tapejara - Level 1 (Single Player HP.IDM: 2.0)',
      species: 'Tapejara', level: 1, imprint: 0, mode: 'Tamed',
      values: [325.3, 250.0, 150, 1840, 280, 175.0, 136.5, 450.5],
      serverName: 'kohonac HP.IDM: 2.0',
      results: [[{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }]],
   },
   {
      tag: 'Tapejara - Level 2 (Single Player HP.IDM: 2.0)',
      species: 'Tapejara', level: 2, imprint: 0, mode: 'Tamed',
      values: [698.5, 250.0, 150, 1840, 280, 175.0, 136.5, 450.5],
      serverName: 'kohonac HP.IDM: 2.0',
      results: [[{ Lw: 0, Ld: 1 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }]],
   },
   {
      tag: 'Rex - Level 204 (Single Player HP.IDM: 2.0)',
      species: 'Rex', level: 204, imprint: 100, mode: 'Bred',
      values: [294404.2, 1554.0, 405, 12240.0, 888, 515.8, 120.0, 19716.5],
      serverName: 'kohonac HP.IDM: 2.0',
      results: [[{ Lw: 20, Ld: 38 }], [{ Lw: 27, Ld: 0 }], [{ Lw: 17, Ld: 0 }], [{ Lw: 24, Ld: 0 }], [{ Lw: 24, Ld: 0 }], [{ Lw: 27, Ld: 5 }], [{ Lw: 21, Ld: 0 }], [{ Lw: 160, Ld: 0 }]],
   },
   {
      tag: 'Rex - Level 237 (Custom Server w/ Nanny SP.TAM: 2.0)',
      species: 'Rex', level: 237, imprint: 58, mode: 'Bred',
      values: [13266.1, 1890.0, 450, 14740, 915.7, 362.8, 111.7, 26239.9],
      serverName: 'eldoco87',
      results: [[{ Lw: 49, Ld: 0 }], [{ Lw: 35, Ld: 0 }], [{ Lw: 20, Ld: 0 }], [{ Lw: 34, Ld: 0 }], [{ Lw: 32, Ld: 0 }], [{ Lw: 34, Ld: 0 }], [{ Lw: 32, Ld: 0 }], [{ Lw: 236, Ld: 0 }]]
   },
   {
      tag: 'Griffin - Level 219 (Official)',
      species: 'Griffin', level: 219, imprint: 0, mode: 'Tamed',
      values: [6450.5, 882.0, 585.0, 8809.9, 470.4, 263.8, 136.5, 19500.5],
      serverName: '[BLPP] Jane',
      results: [[{ Lw: 35, Ld: 8 }], [{ Lw: 29, Ld: 10 }], [{ Lw: 29, Ld: 0 }], [{ Lw: 38, Ld: 0 }], [{ Lw: 34, Ld: 0 }], [{ Lw: 35, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 200, Ld: 0 }]]
   },
   {
      tag: 'Bronto - Level 66 (Official)',
      species: 'Brontosaurus', level: 66, imprint: 0, mode: 'Tamed',
      values: [3726.1, 468.0, 225.0, 14000.0, 2089.0, 180.9, 134.0, 5360.5],
      serverName: 'Zerkxy Gremory',
      results: [[{ Lw: 5, Ld: 0 }], [{ Lw: 5, Ld: 3 }, { Lw: 3, Ld: 5 }], [{ Lw: 5, Ld: 0 }, { Lw: 0, Ld: 5 }], [{ Lw: 4, Ld: 0 }, { Lw: 0, Ld: 4 }], [{ Lw: 1, Ld: 7 }], [{ Lw: 14, Ld: 1 }, { Lw: 13, Ld: 1 }, { Lw: 13, Ld: 3 }, { Lw: 12, Ld: 1 }, { Lw: 12, Ld: 3 }, { Lw: 12, Ld: 4 }, { Lw: 11, Ld: 1 }, { Lw: 11, Ld: 3 }, { Lw: 11, Ld: 4 }, { Lw: 11, Ld: 5 }, { Lw: 11, Ld: 6 }, { Lw: 10, Ld: 3 }, { Lw: 10, Ld: 4 }, { Lw: 10, Ld: 5 }, { Lw: 10, Ld: 6 }, { Lw: 10, Ld: 8 }, { Lw: 9, Ld: 1 }, { Lw: 9, Ld: 4 }, { Lw: 9, Ld: 5 }, { Lw: 9, Ld: 6 }, { Lw: 9, Ld: 8 }, { Lw: 8, Ld: 3 }, { Lw: 8, Ld: 5 }, { Lw: 8, Ld: 6 }, { Lw: 8, Ld: 8 }, { Lw: 8, Ld: 10 }, { Lw: 7, Ld: 5 }, { Lw: 7, Ld: 8 }, { Lw: 6, Ld: 8 }, { Lw: 5, Ld: 10 }], [{ Lw: 8, Ld: 17 }, { Lw: 7, Ld: 17 }, { Lw: 6, Ld: 17 }, { Lw: 5, Ld: 17 }, { Lw: 4, Ld: 17 }, { Lw: 3, Ld: 17 }, { Lw: 2, Ld: 17 }, { Lw: 1, Ld: 17 }, { Lw: 0, Ld: 17 }], [{ Lw: 28, Ld: 0 }]],
   },
   {
      tag: 'Allo, poor extract in ASB',
      species: 'Allosaurus', level: 149, imprint: 0, mode: 'Tamed',
      values: [3276.3, 925.0, 555.0, 10009.0, 776.7, 299.7, 90, 9820.5],
      serverName: 'Coldino SP',
      results: [[{ Lw: 21, Ld: 0 }], [{ Lw: 27, Ld: 0 }], [{ Lw: 27, Ld: 0 }], [{ Lw: 20, Ld: 0 }], [{ Lw: 23, Ld: 1 }], [{ Lw: 19, Ld: 0 }], [{ Lw: 10, Ld: 0 }], [{ Lw: 147, Ld: 0 }]]
   },
   {
      tag: 'Pteranodon - Level 261 (WTF Server)',
      species: 'Pteranodon', level: 261, imprint: 0, mode: 'Tamed',
      values: [2105.7, 480.0, 855.0, 6496.0, 753.6, 438.0, 156, 1992.7],
      serverName: 'Tp',
      results: [[{ Lw: 39, Ld: 0 }], [{ Lw: 44, Ld: 0 }], [{ Lw: 47, Ld: 0 }], [{ Lw: 36, Ld: 0 }], [{ Lw: 44, Ld: 0 }], [{ Lw: 50, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 260, Ld: 0 }]],
   },
   {
      tag: 'Argentavis - Level 256 (Mr. Plow)',
      species: 'Argentavis', level: 256, imprint: 0, mode: 'Tamed',
      values: [6738.8, 2552.0, 600.0, 7400.0, 1172.1, 455.5, 100, 8376.5],
      serverName: 'ARK PVE Community Server',
      results: [[{ Lw: 46, Ld: 12 }], [{ Lw: 38, Ld: 16 }], [{ Lw: 30, Ld: 0 }], [{ Lw: 27, Ld: 0 }], [{ Lw: 32, Ld: 3 }], [{ Lw: 43, Ld: 8 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 216, Ld: 0 }]],
   },
   {
      tag: 'Achilles (Thylacoleo) - Level 224 (Ronin)',
      species: 'Thylacoleo', level: 224, imprint: 25, mode: 'Bred',
      values: [6316.5, 1560.0, 920.0, 5791.8, 797.4, 345.5, 134.9, 10562.2],
      serverName: 'ARK PVE Community Server',
      results: [[{ Lw: 38, Ld: 0 }], [{ Lw: 29, Ld: 0 }], [{ Lw: 36, Ld: 0 }], [{ Lw: 22, Ld: 0 }], [{ Lw: 30, Ld: 0 }], [{ Lw: 36, Ld: 0 }], [{ Lw: 32, Ld: 0 }], [{ Lw: 223, Ld: 0 }]],
   },
   {
      tag: 'Athena (Thylacoleo) - Level 216 (Ronin)',
      species: 'Thylacoleo', level: 216, imprint: 0, mode: 'Tamed',
      values: [3780.1, 1440.0, 800.0, 9298.5, 796.0, 311.7, 130.0, 9730.5],
      serverName: 'ARK PVE Community Server',
      results: [[{ Lw: 22, Ld: 0 }], [{ Lw: 26, Ld: 0 }], [{ Lw: 30, Ld: 0 }], [{ Lw: 44, Ld: 0 }], [{ Lw: 33, Ld: 0 }], [{ Lw: 33, Ld: 0 }], [{ Lw: 27, Ld: 0 }], [{ Lw: 215, Ld: 0 }]],
   },
   {
      tag: 'Aphrodite (Thylacoleo) - Level 224 (Ronin)',
      species: 'Thylacoleo', level: 224, imprint: 25, mode: 'Bred',
      values: [5728.9, 1600.0, 640.0, 6515.8, 1084.5, 404.2, 134.9, 9989.3],
      serverName: 'ARK PVE Community Server',
      results: [[{ Lw: 34, Ld: 0 }], [{ Lw: 30, Ld: 0 }], [{ Lw: 22, Ld: 0 }], [{ Lw: 26, Ld: 0 }], [{ Lw: 30, Ld: 3 }], [{ Lw: 36, Ld: 10 }], [{ Lw: 32, Ld: 0 }], [{ Lw: 210, Ld: 0 }]],
   },
   {
      tag: 'Cheeks (Thylacoleo) - Level 216 (Ronin)',
      species: 'Thylacoleo', level: 216, imprint: 74, mode: 'Bred',
      values: [4338.6, 1440.0, 800.0, 10691.3, 913.6, 357.5, 144.8, 11168.1],
      serverName: 'ARK PVE Community Server',
      results: [[{ Lw: 22, Ld: 0 }], [{ Lw: 26, Ld: 0 }], [{ Lw: 30, Ld: 0 }], [{ Lw: 44, Ld: 0 }], [{ Lw: 33, Ld: 0 }], [{ Lw: 33, Ld: 0 }], [{ Lw: 27, Ld: 0 }], [{ Lw: 215, Ld: 0 }]],
   },
   {
      tag: 'Theresea (Therizinosaur) - Level 339 (Dusty.P)',
      species: 'Therizinosaur', level: 339, imprint: 85, mode: 'Bred',
      values: [10385.4, 1683.0, 930.0, 16150.3, 2892.1, 448.1, 128.3, 19854.3],
      serverName: 'Dusty.P',
      results: [[{ Lw: 46, Ld: 0 }], [{ Lw: 41, Ld: 1 }], [{ Lw: 52, Ld: 0 }], [{ Lw: 36, Ld: 0 }], [{ Lw: 43, Ld: 33 }], [{ Lw: 37, Ld: 7 }], [{ Lw: 34, Ld: 8 }], [{ Lw: 289, Ld: 0 }]],
   },
   {
      tag: 'M. Theri (Therizinosaur) - Level 333 (Dusty.P)',
      species: 'Therizinosaur', level: 333, imprint: 97, mode: 'Bred',
      values: [10601.3, 1530.0, 930.0, 16486.1, 1589.6, 624.0, 119.5, 20267.0],
      serverName: 'Dusty.P',
      results: [[{ Lw: 46, Ld: 0 }], [{ Lw: 41, Ld: 0 }, { Lw: 24, Ld: 5 }, { Lw: 20, Ld: 7 }], [{ Lw: 52, Ld: 0 }, { Lw: 21, Ld: 10 }, { Lw: 10, Ld: 21 }], [{ Lw: 36, Ld: 0 }, { Lw: 13, Ld: 10 }], [{ Lw: 97, Ld: 3 }, { Lw: 43, Ld: 12 }], [{ Lw: 62, Ld: 4 }, { Lw: 37, Ld: 31 }], [{ Lw: 84, Ld: 0 }, { Lw: 37, Ld: 0 }, { Lw: 34, Ld: 0 }], [{ Lw: 289, Ld: 0 }]],
   },
   {
      tag: 'Dunkleosteus - Level 239 (enohka)',
      species: 'Dunkleosteus', level: 239, imprint: 73, mode: 'Bred',
      values: [7929.8, 860.0, 0, 13172.7, 1688.6, 333.0, 114.5, 19970.4],
      serverName: 'enohka',
      results: [[{ Lw: 39, Ld: 2 }], [{ Lw: 33, Ld: 0 }], [{ Lw: -1, Ld: 0 }], [{ Lw: 40, Ld: 0 }], [{ Lw: 31, Ld: 0 }], [{ Lw: 27, Ld: 0 }], [{ Lw: -1, Ld: 0 }], [{ Lw: 236, Ld: 0 }]],
   },
   {
      tag: 'Giganotosaurus - Level 151 (coldino)',
      species: 'Giganotosaurus', level: 151, imprint: 0, mode: 'Tamed',
      values: [17920.0, 412.3, 159.8, 4190.0, 882.0, 92.3, 100.0, 98800.0],
      serverName: 'Coldino SP',
      results: [[{ Lw: 23, Ld: 0 }], [{ Lw: 21, Ld: 1 }], [{ Lw: 26, Ld: 0 }], [{ Lw: 19, Ld: 0 }], [{ Lw: 26, Ld: 0 }], [{ Lw: 14, Ld: 1 }], [{ Lw: 19, Ld: 0 }], [{ Lw: 148, Ld: 0 }]],
   },
   {
      tag: 'Giganotosaurus - Level 153 (coldino)',
      species: 'Giganotosaurus', level: 153, imprint: 0, mode: 'Tamed',
      values: [17935.2, 412.3, 159.8, 4190.0, 882.0, 94.7, 100.0, 98800.0],
      serverName: 'Coldino SP',
      results: [[{ Lw: 23, Ld: 1 }], [{ Lw: 21, Ld: 1 }], [{ Lw: 26, Ld: 0 }], [{ Lw: 19, Ld: 0 }], [{ Lw: 26, Ld: 0 }], [{ Lw: 14, Ld: 2 }], [{ Lw: 19, Ld: 0 }], [{ Lw: 148, Ld: 0 }]],
   },
   {
      tag: 'Giganotosaurus - Level 743 (coldino)',
      species: 'Giganotosaurus', level: 743, imprint: 0, mode: 'Tamed',
      values: [21160.0, 429.4, 193.1, 5170.0, 1400.0, 535.0, 100.0, 454600.0],
      serverName: 'Coldino SP',
      results: [[{ Lw: 104, Ld: 0 }], [{ Lw: 105, Ld: 1 }], [{ Lw: 115, Ld: 0 }], [{ Lw: 117, Ld: 0 }], [{ Lw: 100, Ld: 0 }], [{ Lw: 103, Ld: 0 }], [{ Lw: 97, Ld: 0 }], [{ Lw: 741, Ld: 0 }]],
   },
   {
      tag: 'Giganotosaurus - Level 759 (coldino)',
      species: 'Giganotosaurus', level: 759, imprint: 0, mode: 'Tamed',
      values: [21178.0, 513.6, 193.1, 5170.0, 1820.0, 562.7, 100.0, 454600.0],
      serverName: 'Coldino SP',
      results: [[{ Lw: 104, Ld: 1 }], [{ Lw: 214, Ld: 8 }, { Lw: 140, Ld: 10 }, { Lw: 105, Ld: 11 }], [{ Lw: 115, Ld: 0 }, { Lw: 79, Ld: 3 }, { Lw: 68, Ld: 4 }], [{ Lw: 117, Ld: 0 }, { Lw: 70, Ld: 4 }], [{ Lw: 160, Ld: 0 }, { Lw: 100, Ld: 3 }], [{ Lw: 103, Ld: 2 }], [{ Lw: 97, Ld: 0 }, { Lw: 73, Ld: 0 }, { Lw: 49, Ld: 0 }, { Lw: 24, Ld: 0 }], [{ Lw: 741, Ld: 0 }]],
   },
   {
      tag: 'Giganotosaurus - Level 765 (coldino)',
      species: 'Giganotosaurus', level: 765, imprint: 0, mode: 'Tamed',
      values: [21178.0, 522.0, 198.0, 5170.0, 1960.0, 590.4, 100.9, 454600.0],
      serverName: 'Coldino SP',
      results: [[{ Lw: 104, Ld: 1 }], [{ Lw: 212, Ld: 9 }, { Lw: 175, Ld: 10 }, { Lw: 105, Ld: 12 }], [{ Lw: 128, Ld: 0 }, { Lw: 115, Ld: 1 }, { Lw: 80, Ld: 4 }], [{ Lw: 117, Ld: 0 }, { Lw: 70, Ld: 4 }, { Lw: 40, Ld: 7 }], [{ Lw: 180, Ld: 0 }, { Lw: 100, Ld: 4 }, { Lw: 75, Ld: 6 }], [{ Lw: 103, Ld: 4 }], [{ Lw: 97, Ld: 1 }, { Lw: 64, Ld: 1 }, { Lw: 52, Ld: 1 }, { Lw: 25, Ld: 1 }, { Lw: 24, Ld: 1 }, { Lw: 11, Ld: 1 }], [{ Lw: 741, Ld: 0 }]],
   },
   {
      tag: 'Giganotosaurus - Level 768 (coldino)',
      species: 'Giganotosaurus', level: 768, imprint: 0, mode: 'Tamed',
      values: [21178.0, 522.0, 198.0, 5170.0, 1960.0, 631.9, 100.9, 454600.0],
      serverName: 'Coldino SP',
      results: [[{ Lw: 104, Ld: 1 }], [{ Lw: 212, Ld: 9 }, { Lw: 175, Ld: 10 }, { Lw: 105, Ld: 12 }], [{ Lw: 128, Ld: 0 }, { Lw: 115, Ld: 1 }, { Lw: 80, Ld: 4 }], [{ Lw: 117, Ld: 0 }, { Lw: 70, Ld: 4 }, { Lw: 40, Ld: 7 }], [{ Lw: 180, Ld: 0 }, { Lw: 100, Ld: 4 }, { Lw: 75, Ld: 6 }], [{ Lw: 103, Ld: 7 }], [{ Lw: 97, Ld: 1 }, { Lw: 64, Ld: 1 }, { Lw: 52, Ld: 1 }, { Lw: 25, Ld: 1 }, { Lw: 24, Ld: 1 }, { Lw: 11, Ld: 1 }], [{ Lw: 741, Ld: 0 }]],
   },
   {
      tag: 'Giganotosaurus - Wild (coldino)',
      species: 'Giganotosaurus', level: 503, imprint: 0, mode: 'Wild',
      values: [83040.0, 413.8, 177.0, 4760.0, 1176.0, 460.0, 100.0, 311200.0],
      serverName: 'Coldino SP',
      results: [[{ Lw: 76, Ld: 0 }], [{ Lw: 69, Ld: 0 }], [{ Lw: 72, Ld: 0 }], [{ Lw: 76, Ld: 0 }], [{ Lw: 68, Ld: 0 }], [{ Lw: 72, Ld: 0 }], [{ Lw: 69, Ld: 0 }], [{ Lw: 502, Ld: 0 }]],
   },
   {
      tag: 'Gigacoldino - Tamed 773',
      species: 'Giganotosaurus', level: 773, imprint: 0, mode: 'Tamed',
      values: [21196.0, 530.5, 202.8, 5428.5, 1960.0, 631.9, 100.9, 454600.0],
      serverName: 'Coldino SP',
      results: [[{ Lw: 104, Ld: 2 }], [{ Lw: 174, Ld: 11 }, { Lw: 139, Ld: 12 }, { Lw: 105, Ld: 13 }], [{ Lw: 115, Ld: 2 }, { Lw: 103, Ld: 3 }], [{ Lw: 117, Ld: 2 }, { Lw: 62, Ld: 7 }], [{ Lw: 180, Ld: 0 }, { Lw: 100, Ld: 4 }, { Lw: 75, Ld: 6 }], [{ Lw: 103, Ld: 7 }], [{ Lw: 97, Ld: 1 }, { Lw: 75, Ld: 1 }, { Lw: 53, Ld: 1 }, { Lw: 38, Ld: 1 }, { Lw: 15, Ld: 1 }], [{ Lw: 741, Ld: 0 }]],
   },
   {
      tag: 'Gigacoldino - Tamed 777',
      species: 'Giganotosaurus', level: 777, imprint: 0, mode: 'Tamed',
      values: [21214.0, 530.5, 202.8, 5557.8, 1960.0, 645.8, 101.9, 454600.0],
      serverName: 'Coldino SP',
      results: [[{ Lw: 104, Ld: 3 }], [{ Lw: 174, Ld: 11 }, { Lw: 139, Ld: 12 }, { Lw: 105, Ld: 13 }], [{ Lw: 115, Ld: 2 }, { Lw: 103, Ld: 3 }], [{ Lw: 117, Ld: 3 }, { Lw: 73, Ld: 7 }], [{ Lw: 180, Ld: 0 }, { Lw: 100, Ld: 4 }, { Lw: 75, Ld: 6 }], [{ Lw: 103, Ld: 8 }], [{ Lw: 97, Ld: 2 }, { Lw: 75, Ld: 2 }, { Lw: 61, Ld: 2 }, { Lw: 53, Ld: 2 }, { Lw: 39, Ld: 2 }], [{ Lw: 741, Ld: 0 }]],
   },
   {
      tag: 'Gigacoldino - Tamed 781',
      species: 'Giganotosaurus', level: 781, imprint: 0, mode: 'Tamed',
      values: [21214.0, 538.9, 207.6, 5557.8, 1960.0, 673.5, 101.9, 454600.0],
      serverName: 'Coldino SP',
      results: [[{ Lw: 104, Ld: 3 }], [{ Lw: 173, Ld: 12 }, { Lw: 105, Ld: 14 }, { Lw: 11, Ld: 17 }], [{ Lw: 140, Ld: 1 }, { Lw: 115, Ld: 3 }, { Lw: 92, Ld: 5 }, { Lw: 52, Ld: 9 }, { Lw: 10, Ld: 14 }], [{ Lw: 117, Ld: 3 }, { Lw: 73, Ld: 7 }], [{ Lw: 180, Ld: 0 }, { Lw: 100, Ld: 4 }, { Lw: 75, Ld: 6 }, { Lw: 40, Ld: 10 }, { Lw: 12, Ld: 15 }], [{ Lw: 121, Ld: 3 }, { Lw: 103, Ld: 10 }], [{ Lw: 221, Ld: 2 }, { Lw: 217, Ld: 2 }, { Lw: 208, Ld: 2 }, { Lw: 104, Ld: 2 }, { Lw: 97, Ld: 2 }, { Lw: 74, Ld: 2 }, { Lw: 61, Ld: 2 }, { Lw: 54, Ld: 2 }, { Lw: 52, Ld: 2 }, { Lw: 48, Ld: 2 }, { Lw: 16, Ld: 2 }, { Lw: 12, Ld: 2 }], [{ Lw: 741, Ld: 0 }]],
   },
   {
      tag: 'Giga - Massive Filter Strain (Level 3521)',
      species: 'Giganotosaurus', level: 3521, imprint: 0, mode: 'Tamed',
      values: [38555.6, 597.8, 460.2, 13198.5, 5079.6, 2798.3, 106.5, 2042200.0],
      serverName: 'Official Server',
      results: [],
   },
   {
      tag: 'Direwolf (ASB rounding)',
      species: 'Direwolf', level: 608, imprint: 100, mode: 'Bred',
      values: [8949.7, 2340.0, 1350.0, 15566.4, 575.3, 705.8, 150, 20207.3],
      serverName: 'DelilahEve',
      results: [[{ Lw: 108, Ld: 0 }], [{ Lw: 80, Ld: 0 }], [{ Lw: 80, Ld: 0 }], [{ Lw: 84, Ld: 0 }], [{ Lw: 91, Ld: 0 }], [{ Lw: 81, Ld: 0 }], [{ Lw: 83, Ld: 0 }], [{ Lw: 607, Ld: 0 }]],
   },
   {
      tag: 'AIMEE (ASB rounding)',
      species: 'Allosaurus', level: 342, imprint: 71.5, mode: 'Bred',
      values: [13680.1, 1850.0, 360.0, 29571.4, 1150.9, 411.4, 132.9, 30657.6],
      serverName: 'VestedWind',
      results: [],
   },
   {
      tag: 'Sophia (ASBM: 0 ASB: 1)',
      species: 'Allosaurus', level: 284, imprint: 71.5, mode: 'Tamed',
      values: [5796.1, 1450.0, 645.0, 16214.5, 668.8, 425.7, 90.0, 17980.5],
      serverName: 'VestedWind',
      results: [],
   },
   {
      tag: 'Sophia (ASBM: 0 ASB: 2)',
      species: 'Allosaurus', level: 342, imprint: 71.5, mode: 'Tamed',
      values: [10177.9, 2320.0, 645.0, 16214.5, 12707.2, 1873.1, 122.4, 17980.5],
      serverName: 'VestedWind',
      results: [],
   },
   {
      tag: 'Logan (ASBM: 0 ASB: 3)',
      species: 'Argentavis', level: 269, imprint: 71.5, mode: 'Tamed',
      values: [3285.1, 1300.0, 705.0, 10600.0, 816.0, 425.0, 100.0, 10248.5],
      serverName: 'VestedWind',
      results: [],
   },
   {
      tag: 'NITEBITE (ASBM: 0 ASB: 4)',
      species: 'Megalosaurus', level: 153, imprint: 71.5, mode: 'Tamed',
      values: [5945.1, 1200.0, 465.0, 6669.4, 3444.0, 231.6, 100.0, 7657.5],
      serverName: 'VestedWind',
      results: [],
   },
];

export default testData;

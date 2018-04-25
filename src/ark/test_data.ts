import { TestData } from '@/ark/types';

// tslint:disable:max-line-length


// Some test data
const testData: TestData[] = [
   {
      tag: 'TE 100%',
      species: 'Rex', level: 1, imprint: 0, mode: 'Tamed',
      values: [1100.1, 420, 150, 3000, 500, 125.8, 100, 1550.5],
      serverId: 'predef:Official Server',
      results: [[{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }]],
   },
   {
      tag: 'TE 0%',
      species: 'Rex', level: 8, imprint: 0, mode: 'Tamed',
      values: [1320.1, 462, 165, 3300, 510, 112, 100, 2201.5],
      serverId: 'predef:Official Server',
      results: [[{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 7, Ld: 0 }]],
   },
   {
      tag: 'TE 100% (99.94%)',
      species: 'Rex', level: 8, imprint: 0, mode: 'Tamed',
      values: [1320.1, 462, 165, 3300, 510, 131.6, 100, 2201.5],
      serverId: 'predef:Official Server',
      results: [[{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }], [{ Lw: 2, Ld: 0 }, { Lw: 1, Ld: 0 }], [{ Lw: 1, Ld: 0 }, { Lw: 0, Ld: 0 }], [{ Lw: 7, Ld: 0 }]],
   },
   {
      tag: '',
      species: 'Rex', level: 152, imprint: 39, mode: 'Tamed',
      values: [5280.1, 1386.0, 315, 11100, 650, 270.4, 100, 15593.5],
      serverId: 'predef:Official Server',
      results: [[{ Lw: 19, Ld: 0 }], [{ Lw: 23, Ld: 0 }], [{ Lw: 11, Ld: 0 }], [{ Lw: 27, Ld: 0 }], [{ Lw: 15, Ld: 0 }], [{ Lw: 32, Ld: 0 }, { Lw: 31, Ld: 0 }, { Lw: 30, Ld: 0 }, { Lw: 29, Ld: 0 }, { Lw: 28, Ld: 0 }, { Lw: 27, Ld: 0 }, { Lw: 26, Ld: 0 }, { Lw: 25, Ld: 0 }], [{ Lw: 31, Ld: 0 }, { Lw: 30, Ld: 0 }, { Lw: 29, Ld: 0 }, { Lw: 28, Ld: 0 }, { Lw: 27, Ld: 0 }, { Lw: 26, Ld: 0 }, { Lw: 25, Ld: 0 }, { Lw: 24, Ld: 0 }], [{ Lw: 151, Ld: 0 }]],
   },
   {
      tag: '',
      species: 'Baryonyx', level: 130, imprint: 81, mode: 'Tamed',
      values: [2129.6, 1072.5, 0, 6300, 416, 223.1, 120, 3424.5],
      serverId: 'predef:Official Single Player',
      results: [[{ Lw: 13, Ld: 3 }], [{ Lw: 23, Ld: 0 }], [{ Lw: -1, Ld: 0 }], [{ Lw: 18, Ld: 0 }], [{ Lw: 14, Ld: 0 }], [{ Lw: 19, Ld: 0 }, { Lw: 18, Ld: 0 }, { Lw: 17, Ld: 0 }, { Lw: 16, Ld: 0 }, { Lw: 15, Ld: 0 }, { Lw: 14, Ld: 0 }, { Lw: 13, Ld: 0 }, { Lw: 12, Ld: 0 }, { Lw: 11, Ld: 0 }, { Lw: 10, Ld: 0 }, { Lw: 9, Ld: 0 }], [{ Lw: -1, Ld: 0 }], [{ Lw: 126, Ld: 0 }]],
   },
   {
      tag: 'HP.IDM: 2.0',
      species: 'Tapejara', level: 1, imprint: 0, mode: 'Tamed',
      values: [325.3, 250.0, 150, 1840, 280, 175.0, 136.5, 450.5],
      serverId: 'test:kohonac HP.IDM: 2.0',
      results: [[{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }]],
   },
   {
      tag: ' HP.IDM: 2.0',
      species: 'Tapejara', level: 2, imprint: 0, mode: 'Tamed',
      values: [698.5, 250.0, 150, 1840, 280, 175.0, 136.5, 450.5],
      serverId: 'test:kohonac HP.IDM: 2.0',
      results: [[{ Lw: 0, Ld: 1 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }]],
   },
   {
      tag: ' HP.IDM: 2.0',
      species: 'Rex', level: 204, imprint: 100, mode: 'Bred',
      values: [294404.2, 1554.0, 405, 12240.0, 888, 515.8, 120.0, 19716.5],
      serverId: 'test:kohonac HP.IDM: 2.0',
      results: [[{ Lw: 20, Ld: 38 }], [{ Lw: 27, Ld: 0 }], [{ Lw: 17, Ld: 0 }], [{ Lw: 24, Ld: 0 }], [{ Lw: 24, Ld: 0 }], [{ Lw: 27, Ld: 5 }], [{ Lw: 21, Ld: 0 }], [{ Lw: 160, Ld: 0 }]],
   },
   {
      tag: 'w/ Nanny SP.TAM: 2.0',
      species: 'Rex', level: 237, imprint: 58, mode: 'Bred',
      values: [13266.1, 1890.0, 450, 14740, 915.7, 362.8, 111.7, 26239.9],
      serverId: 'test:eldoco87',
      results: [[{ Lw: 49, Ld: 0 }], [{ Lw: 35, Ld: 0 }], [{ Lw: 20, Ld: 0 }], [{ Lw: 34, Ld: 0 }], [{ Lw: 32, Ld: 0 }], [{ Lw: 34, Ld: 0 }], [{ Lw: 32, Ld: 0 }], [{ Lw: 236, Ld: 0 }]]
   },
   {
      tag: '',
      species: 'Griffin', level: 219, imprint: 0, mode: 'Tamed',
      values: [6450.5, 882.0, 585.0, 8809.9, 470.4, 263.8, 136.5, 19500.5],
      serverId: 'test:[BLPP] Jane',
      results: [[{ Lw: 35, Ld: 8 }], [{ Lw: 29, Ld: 10 }], [{ Lw: 29, Ld: 0 }], [{ Lw: 38, Ld: 0 }], [{ Lw: 34, Ld: 0 }], [{ Lw: 35, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 200, Ld: 0 }]]
   },
   {
      tag: '',
      species: 'Brontosaurus', level: 66, imprint: 0, mode: 'Tamed',
      values: [3726.1, 468.0, 225.0, 14000.0, 2089.0, 180.9, 134.0, 5360.5],
      serverId: 'test:Zerkxy Gremory',
      results: [[{ Lw: 5, Ld: 0 }], [{ Lw: 5, Ld: 3 }, { Lw: 3, Ld: 5 }], [{ Lw: 5, Ld: 0 }, { Lw: 0, Ld: 5 }], [{ Lw: 4, Ld: 0 }, { Lw: 0, Ld: 4 }], [{ Lw: 1, Ld: 7 }], [{ Lw: 14, Ld: 1 }, { Lw: 13, Ld: 1 }, { Lw: 13, Ld: 3 }, { Lw: 12, Ld: 1 }, { Lw: 12, Ld: 3 }, { Lw: 12, Ld: 4 }, { Lw: 11, Ld: 1 }, { Lw: 11, Ld: 3 }, { Lw: 11, Ld: 4 }, { Lw: 11, Ld: 5 }, { Lw: 11, Ld: 6 }, { Lw: 10, Ld: 3 }, { Lw: 10, Ld: 4 }, { Lw: 10, Ld: 5 }, { Lw: 10, Ld: 6 }, { Lw: 10, Ld: 8 }, { Lw: 9, Ld: 1 }, { Lw: 9, Ld: 4 }, { Lw: 9, Ld: 5 }, { Lw: 9, Ld: 6 }, { Lw: 9, Ld: 8 }, { Lw: 8, Ld: 3 }, { Lw: 8, Ld: 5 }, { Lw: 8, Ld: 6 }, { Lw: 8, Ld: 8 }, { Lw: 8, Ld: 10 }, { Lw: 7, Ld: 5 }, { Lw: 7, Ld: 8 }, { Lw: 6, Ld: 8 }, { Lw: 5, Ld: 10 }], [{ Lw: 8, Ld: 17 }, { Lw: 7, Ld: 17 }, { Lw: 6, Ld: 17 }, { Lw: 5, Ld: 17 }, { Lw: 4, Ld: 17 }, { Lw: 3, Ld: 17 }, { Lw: 2, Ld: 17 }, { Lw: 1, Ld: 17 }, { Lw: 0, Ld: 17 }], [{ Lw: 28, Ld: 0 }]],
   },
   {
      tag: 'Poor extract in ASB',
      species: 'Allosaurus', level: 149, imprint: 0, mode: 'Tamed',
      values: [3276.3, 925.0, 555.0, 10009.0, 776.7, 299.7, 90, 9820.5],
      serverId: 'test:Coldino SP',
      results: [[{ Lw: 21, Ld: 0 }], [{ Lw: 27, Ld: 0 }], [{ Lw: 27, Ld: 0 }], [{ Lw: 20, Ld: 0 }], [{ Lw: 23, Ld: 1 }], [{ Lw: 19, Ld: 0 }], [{ Lw: 10, Ld: 0 }], [{ Lw: 147, Ld: 0 }]]
   },
   {
      tag: 'WTF Server',
      species: 'Pteranodon', level: 261, imprint: 0, mode: 'Tamed',
      values: [2105.7, 480.0, 855.0, 6496.0, 753.6, 438.0, 156, 1992.7],
      serverId: 'test:Tp',
      results: [[{ Lw: 39, Ld: 0 }], [{ Lw: 44, Ld: 0 }], [{ Lw: 47, Ld: 0 }], [{ Lw: 36, Ld: 0 }], [{ Lw: 44, Ld: 0 }], [{ Lw: 50, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 260, Ld: 0 }]],
   },
   {
      tag: 'Mr. Plow',
      species: 'Argentavis', level: 256, imprint: 0, mode: 'Tamed',
      values: [6738.8, 2552.0, 600.0, 7400.0, 1172.1, 455.5, 100, 8376.5],
      serverId: 'test:ARK PVE Community Server',
      results: [[{ Lw: 46, Ld: 12 }], [{ Lw: 38, Ld: 16 }], [{ Lw: 30, Ld: 0 }], [{ Lw: 27, Ld: 0 }], [{ Lw: 32, Ld: 3 }], [{ Lw: 43, Ld: 8 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 216, Ld: 0 }]],
   },
   {
      tag: 'Achilles (Ronin)',
      species: 'Thylacoleo', level: 224, imprint: 25, mode: 'Bred',
      values: [6316.5, 1560.0, 920.0, 5791.8, 797.4, 345.5, 134.9, 10562.2],
      serverId: 'test:ARK PVE Community Server',
      results: [[{ Lw: 38, Ld: 0 }], [{ Lw: 29, Ld: 0 }], [{ Lw: 36, Ld: 0 }], [{ Lw: 22, Ld: 0 }], [{ Lw: 30, Ld: 0 }], [{ Lw: 36, Ld: 0 }], [{ Lw: 32, Ld: 0 }], [{ Lw: 223, Ld: 0 }]],
   },
   {
      tag: 'Athena (Ronin)',
      species: 'Thylacoleo', level: 216, imprint: 0, mode: 'Tamed',
      values: [3780.1, 1440.0, 800.0, 9298.5, 796.0, 311.7, 130.0, 9730.5],
      serverId: 'test:ARK PVE Community Server',
      results: [[{ Lw: 22, Ld: 0 }], [{ Lw: 26, Ld: 0 }], [{ Lw: 30, Ld: 0 }], [{ Lw: 44, Ld: 0 }], [{ Lw: 33, Ld: 0 }], [{ Lw: 33, Ld: 0 }], [{ Lw: 27, Ld: 0 }], [{ Lw: 215, Ld: 0 }]],
   },
   {
      tag: 'Aphrodite (Ronin)',
      species: 'Thylacoleo', level: 224, imprint: 25, mode: 'Bred',
      values: [5728.9, 1600.0, 640.0, 6515.8, 1084.5, 404.2, 134.9, 9989.3],
      serverId: 'test:ARK PVE Community Server',
      results: [[{ Lw: 34, Ld: 0 }], [{ Lw: 30, Ld: 0 }], [{ Lw: 22, Ld: 0 }], [{ Lw: 26, Ld: 0 }], [{ Lw: 30, Ld: 3 }], [{ Lw: 36, Ld: 10 }], [{ Lw: 32, Ld: 0 }], [{ Lw: 210, Ld: 0 }]],
   },
   {
      tag: 'Cheeks (Ronin)',
      species: 'Thylacoleo', level: 216, imprint: 74, mode: 'Bred',
      values: [4338.6, 1440.0, 800.0, 10691.3, 913.6, 357.5, 144.8, 11168.1],
      serverId: 'test:ARK PVE Community Server',
      results: [[{ Lw: 22, Ld: 0 }], [{ Lw: 26, Ld: 0 }], [{ Lw: 30, Ld: 0 }], [{ Lw: 44, Ld: 0 }], [{ Lw: 33, Ld: 0 }], [{ Lw: 33, Ld: 0 }], [{ Lw: 27, Ld: 0 }], [{ Lw: 215, Ld: 0 }]],
   },
   {
      tag: 'Theresea',
      species: 'Therizinosaur', level: 339, imprint: 85, mode: 'Bred',
      values: [10385.4, 1683.0, 930.0, 16150.3, 2892.1, 448.1, 128.3, 19854.3],
      serverId: 'test:Dusty.P',
      results: [[{ Lw: 46, Ld: 0 }], [{ Lw: 41, Ld: 1 }], [{ Lw: 52, Ld: 0 }], [{ Lw: 36, Ld: 0 }], [{ Lw: 43, Ld: 33 }], [{ Lw: 37, Ld: 7 }], [{ Lw: 34, Ld: 8 }], [{ Lw: 289, Ld: 0 }]],
   },
   {
      tag: 'M. Theri',
      species: 'Therizinosaur', level: 333, imprint: 97, mode: 'Bred',
      values: [10601.3, 1530.0, 930.0, 16486.1, 1589.6, 624.0, 119.5, 20267.0],
      serverId: 'test:Dusty.P',
      results: [[{ Lw: 46, Ld: 0 }], [{ Lw: 41, Ld: 0 }, { Lw: 24, Ld: 5 }, { Lw: 20, Ld: 7 }], [{ Lw: 52, Ld: 0 }, { Lw: 21, Ld: 10 }, { Lw: 10, Ld: 21 }], [{ Lw: 36, Ld: 0 }, { Lw: 13, Ld: 10 }], [{ Lw: 97, Ld: 3 }, { Lw: 43, Ld: 12 }], [{ Lw: 62, Ld: 4 }, { Lw: 37, Ld: 31 }], [{ Lw: 84, Ld: 0 }, { Lw: 37, Ld: 0 }, { Lw: 34, Ld: 0 }], [{ Lw: 289, Ld: 0 }]],
   },
   {
      tag: 'Dunkleosteus',
      species: 'Dunkleosteus', level: 239, imprint: 73, mode: 'Bred',
      values: [7929.8, 860.0, 0, 13172.7, 1688.6, 333.0, 114.5, 19970.4],
      serverId: 'test:enohka',
      results: [[{ Lw: 39, Ld: 2 }], [{ Lw: 33, Ld: 0 }], [{ Lw: -1, Ld: 0 }], [{ Lw: 40, Ld: 0 }], [{ Lw: 31, Ld: 0 }], [{ Lw: 27, Ld: 0 }], [{ Lw: -1, Ld: 0 }], [{ Lw: 236, Ld: 0 }]],
   },
   {
      tag: '',
      species: 'Giganotosaurus', level: 151, imprint: 0, mode: 'Tamed',
      values: [17920.0, 412.3, 159.8, 4190.0, 882.0, 92.3, 100.0, 98800.0],
      serverId: 'test:Coldino SP',
      results: [[{ Lw: 23, Ld: 0 }], [{ Lw: 21, Ld: 1 }], [{ Lw: 26, Ld: 0 }], [{ Lw: 19, Ld: 0 }], [{ Lw: 26, Ld: 0 }], [{ Lw: 14, Ld: 1 }], [{ Lw: 19, Ld: 0 }], [{ Lw: 148, Ld: 0 }]],
   },
   {
      tag: '',
      species: 'Giganotosaurus', level: 153, imprint: 0, mode: 'Tamed',
      values: [17935.2, 412.3, 159.8, 4190.0, 882.0, 94.7, 100.0, 98800.0],
      serverId: 'test:Coldino SP',
      results: [[{ Lw: 23, Ld: 1 }], [{ Lw: 21, Ld: 1 }], [{ Lw: 26, Ld: 0 }], [{ Lw: 19, Ld: 0 }], [{ Lw: 26, Ld: 0 }], [{ Lw: 14, Ld: 2 }], [{ Lw: 19, Ld: 0 }], [{ Lw: 148, Ld: 0 }]],
   },
   {
      tag: '',
      species: 'Giganotosaurus', level: 743, imprint: 0, mode: 'Tamed',
      values: [21160.0, 429.4, 193.1, 5170.0, 1400.0, 535.0, 100.0, 454600.0],
      serverId: 'test:Coldino SP',
      results: [[{ Lw: 104, Ld: 0 }], [{ Lw: 105, Ld: 1 }], [{ Lw: 115, Ld: 0 }], [{ Lw: 117, Ld: 0 }], [{ Lw: 100, Ld: 0 }], [{ Lw: 103, Ld: 0 }], [{ Lw: 97, Ld: 0 }], [{ Lw: 741, Ld: 0 }]],
   },
   {
      tag: '',
      species: 'Giganotosaurus', level: 759, imprint: 0, mode: 'Tamed',
      values: [21178.0, 513.6, 193.1, 5170.0, 1820.0, 562.7, 100.0, 454600.0],
      serverId: 'test:Coldino SP',
      results: [[{ Lw: 104, Ld: 1 }], [{ Lw: 214, Ld: 8 }, { Lw: 140, Ld: 10 }, { Lw: 105, Ld: 11 }], [{ Lw: 115, Ld: 0 }, { Lw: 79, Ld: 3 }, { Lw: 68, Ld: 4 }], [{ Lw: 117, Ld: 0 }, { Lw: 70, Ld: 4 }], [{ Lw: 160, Ld: 0 }, { Lw: 100, Ld: 3 }], [{ Lw: 103, Ld: 2 }], [{ Lw: 97, Ld: 0 }, { Lw: 73, Ld: 0 }, { Lw: 49, Ld: 0 }, { Lw: 24, Ld: 0 }], [{ Lw: 741, Ld: 0 }]],
   },
   {
      tag: '',
      species: 'Giganotosaurus', level: 765, imprint: 0, mode: 'Tamed',
      values: [21178.0, 522.0, 198.0, 5170.0, 1960.0, 590.4, 100.9, 454600.0],
      serverId: 'test:Coldino SP',
      results: [[{ Lw: 104, Ld: 1 }], [{ Lw: 212, Ld: 9 }, { Lw: 175, Ld: 10 }, { Lw: 105, Ld: 12 }], [{ Lw: 128, Ld: 0 }, { Lw: 115, Ld: 1 }, { Lw: 80, Ld: 4 }], [{ Lw: 117, Ld: 0 }, { Lw: 70, Ld: 4 }, { Lw: 40, Ld: 7 }], [{ Lw: 180, Ld: 0 }, { Lw: 100, Ld: 4 }, { Lw: 75, Ld: 6 }], [{ Lw: 103, Ld: 4 }], [{ Lw: 97, Ld: 1 }, { Lw: 64, Ld: 1 }, { Lw: 52, Ld: 1 }, { Lw: 25, Ld: 1 }, { Lw: 24, Ld: 1 }, { Lw: 11, Ld: 1 }], [{ Lw: 741, Ld: 0 }]],
   },
   {
      tag: '',
      species: 'Giganotosaurus', level: 768, imprint: 0, mode: 'Tamed',
      values: [21178.0, 522.0, 198.0, 5170.0, 1960.0, 631.9, 100.9, 454600.0],
      serverId: 'test:Coldino SP',
      results: [[{ Lw: 104, Ld: 1 }], [{ Lw: 212, Ld: 9 }, { Lw: 175, Ld: 10 }, { Lw: 105, Ld: 12 }], [{ Lw: 128, Ld: 0 }, { Lw: 115, Ld: 1 }, { Lw: 80, Ld: 4 }], [{ Lw: 117, Ld: 0 }, { Lw: 70, Ld: 4 }, { Lw: 40, Ld: 7 }], [{ Lw: 180, Ld: 0 }, { Lw: 100, Ld: 4 }, { Lw: 75, Ld: 6 }], [{ Lw: 103, Ld: 7 }], [{ Lw: 97, Ld: 1 }, { Lw: 64, Ld: 1 }, { Lw: 52, Ld: 1 }, { Lw: 25, Ld: 1 }, { Lw: 24, Ld: 1 }, { Lw: 11, Ld: 1 }], [{ Lw: 741, Ld: 0 }]],
   },
   {
      tag: '',
      species: 'Giganotosaurus', level: 503, imprint: 0, mode: 'Wild',
      values: [83040.0, 413.8, 177.0, 4760.0, 1176.0, 460.0, 100.0, 311200.0],
      serverId: 'test:Coldino SP',
      results: [[{ Lw: 76, Ld: 0 }], [{ Lw: 69, Ld: 0 }], [{ Lw: 72, Ld: 0 }], [{ Lw: 76, Ld: 0 }], [{ Lw: 68, Ld: 0 }], [{ Lw: 72, Ld: 0 }], [{ Lw: 69, Ld: 0 }], [{ Lw: 502, Ld: 0 }]],
   },
   {
      tag: '',
      species: 'Giganotosaurus', level: 773, imprint: 0, mode: 'Tamed',
      values: [21196.0, 530.5, 202.8, 5428.5, 1960.0, 631.9, 100.9, 454600.0],
      serverId: 'test:Coldino SP',
      results: [[{ Lw: 104, Ld: 2 }], [{ Lw: 174, Ld: 11 }, { Lw: 139, Ld: 12 }, { Lw: 105, Ld: 13 }], [{ Lw: 115, Ld: 2 }, { Lw: 103, Ld: 3 }], [{ Lw: 117, Ld: 2 }, { Lw: 62, Ld: 7 }], [{ Lw: 180, Ld: 0 }, { Lw: 100, Ld: 4 }, { Lw: 75, Ld: 6 }], [{ Lw: 103, Ld: 7 }], [{ Lw: 97, Ld: 1 }, { Lw: 75, Ld: 1 }, { Lw: 53, Ld: 1 }, { Lw: 38, Ld: 1 }, { Lw: 15, Ld: 1 }], [{ Lw: 741, Ld: 0 }]],
   },
   {
      tag: '',
      species: 'Giganotosaurus', level: 777, imprint: 0, mode: 'Tamed',
      values: [21214.0, 530.5, 202.8, 5557.8, 1960.0, 645.8, 101.9, 454600.0],
      serverId: 'test:Coldino SP',
      results: [[{ Lw: 104, Ld: 3 }], [{ Lw: 174, Ld: 11 }, { Lw: 139, Ld: 12 }, { Lw: 105, Ld: 13 }], [{ Lw: 115, Ld: 2 }, { Lw: 103, Ld: 3 }], [{ Lw: 117, Ld: 3 }, { Lw: 73, Ld: 7 }], [{ Lw: 180, Ld: 0 }, { Lw: 100, Ld: 4 }, { Lw: 75, Ld: 6 }], [{ Lw: 103, Ld: 8 }], [{ Lw: 97, Ld: 2 }, { Lw: 75, Ld: 2 }, { Lw: 61, Ld: 2 }, { Lw: 53, Ld: 2 }, { Lw: 39, Ld: 2 }], [{ Lw: 741, Ld: 0 }]],
   },
   {
      tag: '',
      species: 'Giganotosaurus', level: 781, imprint: 0, mode: 'Tamed',
      values: [21214.0, 538.9, 207.6, 5557.8, 1960.0, 673.5, 101.9, 454600.0],
      serverId: 'test:Coldino SP',
      results: [[{ Lw: 104, Ld: 3 }], [{ Lw: 173, Ld: 12 }, { Lw: 105, Ld: 14 }, { Lw: 11, Ld: 17 }], [{ Lw: 140, Ld: 1 }, { Lw: 115, Ld: 3 }, { Lw: 92, Ld: 5 }, { Lw: 52, Ld: 9 }, { Lw: 10, Ld: 14 }], [{ Lw: 117, Ld: 3 }, { Lw: 73, Ld: 7 }], [{ Lw: 180, Ld: 0 }, { Lw: 100, Ld: 4 }, { Lw: 75, Ld: 6 }, { Lw: 40, Ld: 10 }, { Lw: 12, Ld: 15 }], [{ Lw: 121, Ld: 3 }, { Lw: 103, Ld: 10 }], [{ Lw: 221, Ld: 2 }, { Lw: 217, Ld: 2 }, { Lw: 208, Ld: 2 }, { Lw: 104, Ld: 2 }, { Lw: 97, Ld: 2 }, { Lw: 74, Ld: 2 }, { Lw: 61, Ld: 2 }, { Lw: 54, Ld: 2 }, { Lw: 52, Ld: 2 }, { Lw: 48, Ld: 2 }, { Lw: 16, Ld: 2 }, { Lw: 12, Ld: 2 }], [{ Lw: 741, Ld: 0 }]],
   },
   {
      tag: 'Massive filter strain',
      species: 'Giganotosaurus', level: 3521, imprint: 0, mode: 'Tamed',
      values: [38555.6, 597.8, 460.2, 13198.5, 5079.6, 2798.3, 106.5, 2042200.0],
      serverId: 'predef:Official Server',
      results: [[{ Lw: 532, Ld: 18 }], [{ Lw: 599, Ld: 15 }, { Lw: 491, Ld: 20 }, { Lw: 391, Ld: 25 }, { Lw: 120, Ld: 41 }], [{ Lw: 509, Ld: 14 }, { Lw: 432, Ld: 19 }, { Lw: 367, Ld: 24 }], [{ Lw: 857, Ld: 2 }, { Lw: 438, Ld: 23 }], [{ Lw: 531, Ld: 15 }], [{ Lw: 485, Ld: 17 }], [{ Lw: 501, Ld: 21 }, { Lw: 478, Ld: 21 }, { Lw: 435, Ld: 21 }, { Lw: 430, Ld: 21 }], [{ Lw: 3387, Ld: 0 }]],
   },
   {
      tag: '(ASB rounding)',
      species: 'Direwolf', level: 608, imprint: 100, mode: 'Bred',
      values: [8949.7, 2340.0, 1350.0, 15566.4, 575.3, 705.8, 150, 20207.3],
      serverId: 'test:DelilahEve',
      results: [[{ Lw: 108, Ld: 0 }], [{ Lw: 80, Ld: 0 }], [{ Lw: 80, Ld: 0 }], [{ Lw: 84, Ld: 0 }], [{ Lw: 91, Ld: 0 }], [{ Lw: 81, Ld: 0 }], [{ Lw: 83, Ld: 0 }], [{ Lw: 607, Ld: 0 }]],
   },
   {
      tag: 'AIMEE (ASB rounding)',
      species: 'Allosaurus', level: 342, imprint: 71, mode: 'Bred',
      values: [13680.1, 1850.0, 360.0, 29571.4, 1150.9, 411.4, 132.9, 30657.6],
      serverId: 'test:VestedWind',
      results: [[{ Lw: 71, Ld: 0 }], [{ Lw: 64, Ld: 0 }], [{ Lw: 14, Ld: 0 }], [{ Lw: 50, Ld: 0 }], [{ Lw: 56, Ld: 0 }], [{ Lw: 28, Ld: 0 }], [{ Lw: 58, Ld: 0 }], [{ Lw: 341, Ld: 0 }]],
   },
   {
      tag: 'Sophia (ASB rounding)',
      species: 'Allosaurus', level: 284, imprint: 71.5, mode: 'Tamed',
      values: [5796.1, 1450.0, 645.0, 16214.5, 668.8, 425.7, 90.0, 17980.5],
      serverId: 'test:VestedWind',
      results: [[{ Lw: 41, Ld: 0 }], [{ Lw: 48, Ld: 0 }], [{ Lw: 33, Ld: 0 }], [{ Lw: 37, Ld: 0 }], [{ Lw: 38, Ld: 0 }], [{ Lw: 51, Ld: 0 }], [{ Lw: 35, Ld: 0 }], [{ Lw: 283, Ld: 0 }]],
   },
   {
      tag: 'Sophia (ASB rounding)',
      species: 'Allosaurus', level: 330, imprint: 71.5, mode: 'Tamed',
      values: [10177.9, 2320.0, 645.0, 16214.5, 12707.2, 1873.1, 122.4, 17980.5],
      serverId: 'test:VestedWind',
      results: [[{ Lw: 41, Ld: 14 }], [{ Lw: 48, Ld: 3 }], [{ Lw: 33, Ld: 0 }], [{ Lw: 37, Ld: 0 }], [{ Lw: 38, Ld: 3 }], [{ Lw: 51, Ld: 17 }], [{ Lw: 35, Ld: 9 }], [{ Lw: 283, Ld: 0 }]],
   },
   {
      tag: 'Logan (ASB rounding)',
      species: 'Argentavis', level: 290, imprint: 71.5, mode: 'Tamed',
      values: [3285.1, 4420.0, 705.0, 10600.0, 14280.0, 808.0, 100.0, 10248.5],
      serverId: 'test:VestedWind',
      results: [[{ Lw: 40, Ld: 0 }], [{ Lw: 48, Ld: 15 }, { Lw: 45, Ld: 16 }], [{ Lw: 37, Ld: 0 }], [{ Lw: 43, Ld: 0 }], [{ Lw: 52, Ld: 2 }], [{ Lw: 51, Ld: 3 }, { Lw: 48, Ld: 4 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 268, Ld: 0 }]],
   },
   {
      tag: 'NITEBITE (ASB rounding)',
      species: 'Megalosaurus', level: 153, imprint: 71.5, mode: 'Tamed',
      values: [5945.1, 1200.0, 465.0, 6669.4, 3444.0, 231.6, 100.0, 7657.5],
      serverId: 'test:VestedWind',
      results: [[{ Lw: 24, Ld: 0 }], [{ Lw: 15, Ld: 3 }], [{ Lw: 21, Ld: 0 }], [{ Lw: 19, Ld: 0 }], [{ Lw: 32, Ld: 1 }], [{ Lw: 18, Ld: 0 }], [{ Lw: 19, Ld: 0 }], [{ Lw: 148, Ld: 0 }]],
   },
   {
      tag: '',
      species: 'Featherlight', level: 136, imprint: 0, mode: 'Tamed',
      values: [460.3, 648, 1063.4, 1242, 85.4, 608.5, 230, 377.3],
      serverId: 'predef:Official Single Player',
      results: [[{ Lw: 15, Ld: 0 }], [{ Lw: 17, Ld: 14 }], [{ Lw: 13, Ld: 13 }], [{ Lw: 14, Ld: 0 }], [{ Lw: 11, Ld: 0 }], [{ Lw: 8, Ld: 20 }], [{ Lw: 10, Ld: 0 }], [{ Lw: 88, Ld: 0 }]],
   },
   {
      tag: '',
      serverId: 'test:VestedWind',
      species: 'Rex', level: 377, imprint: 12, mode: 'Bred',
      values: [10598.9, 2310.0, 1350.0, 23767.1, 942.1, 555.9, 107.1, 39096.2],
      results: [[{ Lw: 40, Ld: 0 }], [{ Lw: 45, Ld: 0 }], [{ Lw: 80, Ld: 0 }], [{ Lw: 64, Ld: 0 }], [{ Lw: 38, Ld: 0 }], [{ Lw: 67, Ld: 0 }], [{ Lw: 42, Ld: 0 }], [{ Lw: 376, Ld: 0 }]],
   },
   {
      tag: '',
      serverId: 'test:VestedWind',
      species: 'Rex', level: 444, imprint: 6, mode: 'Bred',
      values: [12982.7, 2856.0, 1350.0, 22672.9, 1035.3, 537.8, 103.5, 44258.3],
      results: [[{ Lw: 52, Ld: 0 }], [{ Lw: 58, Ld: 0 }], [{ Lw: 80, Ld: 0 }], [{ Lw: 63, Ld: 0 }], [{ Lw: 50, Ld: 0 }], [{ Lw: 67, Ld: 0 }], [{ Lw: 73, Ld: 0 }], [{ Lw: 443, Ld: 0 }]],
   },
   {
      tag: '',
      serverId: 'test:VestedWind',
      species: 'Rex', level: 412, imprint: 6, mode: 'Bred',
      values: [16626.9, 1974.0, 1275.0, 22672.9, 1159.5, 489.1, 103.5, 41177.3],
      results: [[{ Lw: 68, Ld: 0 }], [{ Lw: 37, Ld: 0 }], [{ Lw: 75, Ld: 0 }], [{ Lw: 63, Ld: 0 }], [{ Lw: 62, Ld: 0 }], [{ Lw: 59, Ld: 0 }], [{ Lw: 47, Ld: 0 }], [{ Lw: 411, Ld: 0 }]],
   },
   {
      tag: '',
      species: 'Aberrant Spino', level: 20, imprint: 0, mode: 'Tamed',
      values: [1075.449951, 455, 780, 3120, 371, 199.2305, 100, 1819.5],
      serverId: 'test:Coldino SP',
      results: [],
   },
   {
      tag: 'Don\'t expect this one to work!',
      species: 'Aberrant Spino', level: 225, imprint: 85, mode: 'Bred',
      values: [9069.829102, 2296, 3633.5, 12921.479492, 1201.787842, 509.7843, 133.03, 14188.274414],
      serverId: 'test:Coldino SP',
      results: [],
   },
   {
      tag: '',
      species: 'Aberrant Spino', level: 225, imprint: 0, mode: 'Tamed',
      values: [7227.024414, 2296, 3633.5, 10296, 957.599976, 418.0665, 106, 11305.5],
      serverId: 'test:Coldino SP',
      results: [],
   },
   {
      tag: '',
      species: 'Aberrant Spino', level: 209, imprint: 0, mode: 'Tamed',
      values: [5993.174805, 1435, 2795, 9360, 744.799988, 349.3004, 100, 11305.5],
      serverId: 'test:Coldino SP',
      results: [],
   },
   {
      tag: '',
      species: 'Aberrant Spino', level: 208, imprint: 0, mode: 'Tamed',
      values: [5376.25, 1435, 2795, 9360, 744.799988, 349.3004, 100, 11305.5],
      serverId: 'test:Coldino SP',
      results: [],
   },
   {
      tag: '',
      species: 'Aberrant Spino', level: 207, imprint: 0, mode: 'Tamed',
      values: [5376.25, 1435, 2795, 9360, 744.799988, 332.1089, 100, 11305.5],
      serverId: 'test:Coldino SP',
      results: [],
   },
   {
      tag: '',
      species: 'Aberrant Spino', level: 23, imprint: 0, mode: 'Tamed',
      values: [1198.857788, 455, 780, 3120, 371, 209.5436, 103., 1819.5],
      serverId: 'test:Coldino SP',
      results: [],
   },
   {
      tag: '',
      species: 'Aberrant Spino', level: 22, imprint: 0, mode: 'Tamed',
      values: [1075.449951, 455, 780, 3120, 371, 209.5436, 103., 1819.5],
      serverId: 'test:Coldino SP',
      results: [],
   },
   {
      tag: '',
      species: 'Aberrant Spino', level: 21, imprint: 0, mode: 'Tamed',
      values: [1075.449951, 455, 780, 3120, 371, 209.5436, 100, 1819.5],
      serverId: 'test:Coldino SP',
      results: [],
   },
   {
      tag: '',
      species: 'Aberrant Spino', level: 206, imprint: 0, mode: 'Tamed',
      values: [5376.25, 1435, 2795, 9360, 532, 332.1089, 100, 11305.5],
      serverId: 'test:Coldino SP',
      results: [],
   },
];

export default testData;

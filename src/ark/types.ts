
type MultipliersArray = ((number | undefined)[] | undefined)[];

interface ServerDef {
   serverName: string;
   IBM: number;
   singlePlayer: boolean;
   multipliers: MultipliersArray;
};

interface TestData {
   tag: string;
   species: string;
   level: number;
   imprint: number;
   mode: "Wild" | "Tamed" | "Bred";
   values: number[];
   serverName: string;
   results: Stat[][];
};

interface Stat {
   Lw: number;
   Ld: number;

   TE?: number;
   minTE?: number;
   maxTE?: number;
   wildLevel?: number;
   removeMe?: boolean;
};

import { Creature, Server } from '@/data/firestore/objects';
import { Multipliers } from '@/data/firestore/types';
import { FilledArray } from '@/utils';
import EasySax from 'easysax';
import set from 'lodash/set';
import * as util from 'util';


export interface ASBXmlOutput {
   creatures: Creature[];
   server: Server;
   settings: object;
}

export function parseASBXml(text: string) {
   // Stage 1 - convert raw XML to raw JS objects
   const parser = new LowLevelParser();
   parser.acceptData(text);
   const internalData = parser.finish();

   // State 2 - convert to our data types
   const server = convertServer(internalData);
   const creatures = internalData.CreatureCollection.creatures.map(convertCreature);

   // Stage 3 - construct the output
   return { server, creatures };
}

/** Export for testing only. Create a server object from the exported server info. */
export function convertServer(input: any): Server {
   const server: Partial<Server> = {};

   server.name = '';
   server.IBM = input.CreatureCollection.imprintingMultiplier;
   server.multipliers = multiplierArrayToObjectValues(input.CreatureCollection.multipliers);
   server.singlePlayer = input.CreatureCollection.singlePlayerSettings;

   return server as Server;
}

/** Export for testing only. Create a creature object from the exported creature info. */
export function convertCreature(input: any): Creature {
   const creature: Creature = input;

   creature.inputSource = 'asb_xml';

   return creature;
}

interface StackState {
   name: string | number;
   text?: string;

   isArray?: boolean;
   index?: number;
   arrayType?: string;
}

/** Exported for test-purposes only */
export class LowLevelParser {
   private parser: EasySax;
   private output: any = {};
   private error: Error;
   private stack: StackState[] = [];

   constructor() {
      // { normalize: false, position: false, trim: true, noscript: true, lowercase: true });
      this.parser = new EasySax();
      this.parser.on('error', this.onParseError.bind(this));
      this.parser.on('startNode', this.onParseOpenTag.bind(this));
      this.parser.on('textNode', this.onParseText.bind(this));
      this.parser.on('endNode', this.onParseCloseTag.bind(this));
   }

   public acceptData(data: string) {
      this.parser.parse(data);
   }

   public finish(): any {
      if (this.error) throw this.error;
      return this.output;
   }

   private onParseError(err: Error) {
      this.error = err;
   }

   private onParseOpenTag(name: string) {
      const prev = this.stack[this.stack.length - 1];
      const state: StackState = { name };

      if (prev && prev.isArray) {
         state.arrayType = state.name as string;
         state.name = ++prev.index;
      } else if (arrayElements.includes(name)) {
         prev.isArray = true;
         prev.index = 0;
         state.arrayType = state.name as string;
         state.name = 0;
      }

      this.stack.push(state);
   }

   private onParseText(t: string) {
      t = t.trim();
      if (!t) return;

      const state = this.stack[this.stack.length - 1];
      const path = this.stack.filter(v => typeof v.name === 'string').map(v => v.name).join('.');
      state.text = (state.text || '') + t;

      const typeConverter = elementTypes[path] || elementTypes['.' + state.arrayType];
      if (typeConverter) {
         state.text = typeConverter(state.text);
      } else {
         for (const recogniser of typeRecognisers) {
            const converter = recogniser(state.text, state.name as string, path);
            if (converter) {
               const output = converter(state.text);
               if (output !== undefined && !Number.isNaN(output)) {
                  state.text = output;
                  break;
               }
            }
         }
      }
   }

   private onParseCloseTag(_: string) {
      const path = this.stack.map(v => v.name).join('.');
      const state = this.stack.pop();
      if (state.text !== undefined) {
         set(this.output, path, state.text);
      }
   }
}


export function multiplierArrayToObjectValues(arr: number[][]): Multipliers {
   if (!Array.isArray(arr)) return arr;

   const tempArray = FilledArray(8, () => FilledArray(4, () => undefined));

   for (let i = 0; arr !== [] && i < 8; i++)
      for (let j = 0; arr[i] !== [] && j < 4; j++)
         tempArray[i][j] = arr[i][j];

   return nestedArrayToObjectValues(tempArray);
}

export function nestedArrayToObjectValues(arr: any) {
   if (!util.isObject(arr)) return arr;
   if (!Array.isArray(arr)) return arr;

   const result: any = {};
   Object.entries(arr).forEach(([key, value]) => {
      if (value != null) result[key] = nestedArrayToObjectValues(value);
   });
   return result;
}

function parseBoolean(v: string) {
   return v.toLowerCase() === 'true';
}

function parseDateTime(v: string) {
   // FIXME: Change over to Firestore Timestamp
   if (v === '0001-01-01T00:00:00') return null;
   return new Date(v);
}


/** Array of XMl tag names that *always* indicate array elements */
const arrayElements = [
   'int', 'double', 'string',
   'ArrayOfDouble', 'ArrayOfInt',
   'Player',
   'Creature',
];

/** Type specifiers for individual elements or entire paths */
const elementTypes: { [name: string]: (value: string) => any } = {
   '.int': parseInt,
   '.double': parseFloat,

   'CreatureCollection.players.Level': parseInt,
   'CreatureCollection.singlePlayerSettings': parseBoolean,
   'CreatureCollection.considerWildLevelSteps': parseBoolean,
   'CreatureCollection.useFiltersInTopStatCalculation': parseBoolean,

   'CreatureCollection.creatures.generation': parseInt,
   'CreatureCollection.creatures.neutered': parseBoolean,
   'CreatureCollection.creatures.tamingEff': parseFloat,
   'CreatureCollection.creatures.imprintingBonus': parseFloat,
   'CreatureCollection.creatures.growingUntil': parseDateTime,
   'CreatureCollection.creatures.cooldownUntil': parseDateTime,
   'CreatureCollection.creatures.domesticatedAt': parseDateTime,
   'CreatureCollection.creatures.addedToLibrary': parseDateTime,
};

/** Type recognisers to automiatically convert based on name, path or value */
const typeRecognisers: Array<(value: string, name: string, path: string) => (text: string) => any> = [
   (_value, name, _path) => typeof name === 'string' && name.includes('Level') ? parseInt : undefined,
   (_value, name, _path) => typeof name === 'string' && name.includes('Multiplier') ? parseFloat : undefined,
   (_value, name, _path) => typeof name === 'string' && name.startsWith('show') ? parseBoolean : undefined,
   (_value, name, _path) => typeof name === 'string' && name.startsWith('allow') ? parseBoolean : undefined,
   (_value, name, _path) => typeof name === 'string' && name.startsWith('is') ? parseBoolean : undefined,
   (_value, name, _path) => typeof name === 'string' && name.startsWith('max') ? parseInt : undefined,
   (_value, _name, path) => path.includes('creatures.mutation') ? parseInt : undefined,
];

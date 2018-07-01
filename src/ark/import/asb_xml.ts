import { Creature, Server } from '@/data/firestore/objects';
import EasySax from 'easysax';
import set from 'lodash/set';


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
   console.log(internalData);

   // State 2 - convert to our data types

   // Stage 3 - construct the output
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

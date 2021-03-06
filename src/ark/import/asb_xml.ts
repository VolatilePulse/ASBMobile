import { TORPOR } from '@/consts';
import { Creature, Server, UUID } from '@/data/firestore/objects';
import { Multipliers } from '@/data/firestore/types';
import theStore from '@/ui/store';
import EasySax from 'easysax';
import { firestore } from 'firebase';
import _ from 'lodash';
import * as util from 'util';


export const PREDEFINED_TAGS: ReadonlyArray<string> = ['Available', 'Unavailable', 'Dead', 'Obelisk'];

export interface ASBXmlOutput {
   creatures: Creature[];
   server: Server;
   settings: object;
}

export function parseASBXml(text: string): [Server, { [uuid: string]: Creature }] {
   // Stage 1 - convert raw XML to raw JS objects
   const parser = new LowLevelParser();
   parser.acceptData(text);
   const internalData = parser.finish();

   // Stage 2 - convert to our data types
   const server = convertServer(internalData.CreatureCollection);
   const importedCreatures = internalData.CreatureCollection.creatures as any[];
   const convertedCreatures = importedCreatures.map(convertCreature) as Array<[UUID, Creature]>;

   // Stage 3 - construct the output
   const creatureMap = _.fromPairs(convertedCreatures);
   return [server, creatureMap];
}

/** Export for testing only. Create a server object from the exported server info. */
export function convertServer(input: any): Server {
   const server: Partial<Server> = {};

   server.name = '';
   server.IBM = input.imprintingMultiplier;
   server.multipliers = multiplierArrayToObjectValues(input.multipliers);
   server.singlePlayer = input.singlePlayerSettings;

   return server as Server;
}

/** Exported for testing only. Create a creature object from the exported creature info. */
export function convertCreature(input: any): [UUID, Creature] {
   const creature: Partial<Creature> = {};

   // General Data
   creature.inputSource = 'asb_xml';
   if (input.name) creature.name = input.name;

   // FIXME: Properly address genderless creatures
   if (input.sex.toLowerCase() === 'female') creature.isFemale = true;
   if (input.isNeutered) creature.isNeutered = true;

   // FIXME: Add Creature colors
   // creature.colors = input.colors;

   // FIXME:
   const uuid = input.guid as UUID;
   // creature.currentServer
   // creature.originServer
   // creature.dinoId1
   // creature.dinoId2

   // Species
   creature.species = input.species;
   const speciesMultiplier = theStore.speciesMultipliers[creature.species];
   if (speciesMultiplier) creature.speciesBP = speciesMultiplier.blueprint;

   // Ownership
   if (input.owner) creature.owner = input.owner;
   if (input.tribe) creature.tribe = input.tribe;

   // Levels
   creature.level = input.levelsWild[TORPOR] + _.sum(input.levelsDom) + 1;
   creature.levelsDom = input.levelsDom;
   creature.levelsWild = input.levelsWild;

   // Tags
   creature.tags = creature.tags || {};
   for (const tag of input.tags || []) {
      if (tag.startsWith('user:') || PREDEFINED_TAGS.includes(tag))
         creature.tags[tag] = true;
      else
         creature.tags['user:' + tag] = true;
   }
   if (input.status && input.status.toLowerCase() !== 'available') {
      creature.tags = creature.tags || {};
      creature.tags[input.status] = true;
   }

   // Wild/Tamed/Bred
   if (input.isBred) {
      creature.isBred = true;
      creature.breedingLevel = input.levelsWild[TORPOR] + 1;
      if (input.imprinter) creature.imprinter = input.imprinter;
      creature.imprintingBonus = input.imprintingBonus;
      // FIXME: Only set mutations if both mutationsMaternal and mutationsPaternal exist and are valid
      if (input.mutationsMaternal != null) creature.mutationsMaternal = input.mutationsMaternal;
      if (input.mutationsPaternal != null) creature.mutationsPaternal = input.mutationsPaternal;
      if (input.mutationsMaternal != null && input.mutationsPaternal != null)
         creature.mutations = creature.mutationsMaternal + creature.mutationsPaternal;
      else if (input.mutations != null)
         creature.mutations = input.mutations;

      creature.mother = input.motherGuid;
      creature.father = input.fatherGuid;
   }
   else if (input.isWild) {
      creature.isWild = true;
      creature.wildLevel = input.levelsWild[TORPOR] + 1;
   }
   else {
      creature.isTamed = true;
      creature.tamingEff = input.tamingEff || null;
      // FIXME:
      // creature.tamingLevel = input.levelsWild[TORPOR] + 1;
      if (creature.tamingEff)
         // TODO: Move this calculation to a function that lives somewhere else
         creature.wildLevel = Math.ceil((input.levelsWild[TORPOR] + 1) / (1 + 0.5 * creature.tamingEff));
      else
         creature.wildLevel = null;
   }

   // FIXME:
   // creature.statValues = undefined;
   // creature.breedingValues = undefined;

   // Timestamps
   creature.times = {};
   creature.times.addedToLibrary = firestore.Timestamp.fromDate(input.addedToLibrary || new Date());
   // FIXME: Don't set this if it's meaningless
   creature.times.domesticated = firestore.Timestamp.fromDate(input.domesticatedAt || new Date());

   if (input.cooldownUntil && input.cooldownUntil > Date.now())
      creature.times.cooldownUntil = firestore.Timestamp.fromDate(input.cooldownUntil);
   if (input.growingUntil && input.growingUntil > Date.now())
      creature.times.growingUntil = firestore.Timestamp.fromDate(input.growingUntil);

   return [uuid, creature as Creature];
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

   private onParseText(text: string) {
      text = text.trim();
      if (!text) return;

      const state = this.stack[this.stack.length - 1];
      const path = this.stack.filter(v => typeof v.name === 'string').map(v => v.name).join('.');
      state.text = (state.text || '') + text;

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

   private onParseCloseTag(_name: string) {
      const path = this.stack.map(v => v.name).join('.');
      const state = this.stack.pop();
      if (state.text !== undefined) {
         _.set(this.output, path, state.text);
      }
   }
}


export function multiplierArrayToObjectValues(arr: number[][]): Multipliers {
   if (!Array.isArray(arr)) return arr;

   const result: any = {};
   for (let p = 0; p < 8; p++) {
      result[p] = {};
      for (let s = 0; s < 4; s++) {
         if (arr[p] != null && arr[p][s] != null)
            result[p][s] = arr[p][s];
      }
   }

   return result;
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

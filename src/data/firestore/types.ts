
export type UserId = string;
export type LibraryId = string;
export type ServerId = string;

export type CreatureStatus = 'Available' | 'Dead' | 'Obelisk' | 'Unavailable';

export interface Stat {
   Lw: number;
   Ld: number;
}

export type InputSource = 'asb_xml' | 'asbm_user_input' | 'ark_export' | 'ark_tools_export';

export interface ServerStatParams {
   [param_index: number]: number;
}

export interface Multipliers {
   [stat_index: number]: ServerStatParams;
}

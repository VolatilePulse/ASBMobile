
export type UserId = string;
export type LibraryId = string;
export type ServerId = string;

export type CreatureStatus = 'Available' | 'Dead' | 'Obelisk' | 'Unavailable';

export interface Stat {
   Lw: number;
   Ld: number;
}

export type CreatureDataSource = 'asb_xml' | 'asbm_user_input' | 'asb_user_input' | 'ark_export' | 'ark_tools_export';

export interface ServerStatParams extends Object {
   [param_index: number]: number;
}

export interface Multipliers extends Object {
   [stat_index: number]: ServerStatParams;
}

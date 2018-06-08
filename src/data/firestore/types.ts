
export type UserId = string;
export type LibraryId = string;
export type ServerId = string;

export enum CreatureStatus {
   Available = 0,
   Unavailable = 1,
   Obelisk = 2,
   Dead = 3,
}

export interface Stat {
   Lw: number;
   Ld: number;
}

export type InputSource = 'asb_xml' | 'asbm_user_input' | 'ark_export' | 'ark_tools_export';

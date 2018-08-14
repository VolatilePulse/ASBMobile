// Partial Typings for EasySax

declare module 'easysax' {
   export default class EasySax {
      on(event: 'error', handler: (msg: string) => void): void;
      on(event: 'startNode', handler: (tag: string, getAttr: () => { [attr: string]: string },
                                       unEntities: any, isTagEnd: boolean, getStringNode: () => string) => void): void;
      on(event: 'endNode', handler: (tag: string, unEntities: any, isTagStart: boolean, getStringNode: () => string) => void): void;
      on(event: 'textNode', handler: (text: string, uq: (text: string) => string) => void): void;
      on(event: 'cdata', handler: (text: string) => void): void;
      on(event: 'comment', handler: (text: string) => void): void;
      parse(text: string): void;
   }
}

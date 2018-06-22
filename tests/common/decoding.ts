import fs from 'fs';
import util from 'util';

const fsAsync = {
   readFile: util.promisify(fs.readFile),
};


export function decodeBuffer(buffer: Buffer) {
   if (buffer.length >= 2 && buffer[0] === 255) return buffer.slice(2).toString('utf16le');
   return buffer.toString();
}

export async function loadFile(filename: string): Promise<string> {
   const content = await fsAsync.readFile(filename).then(buf => decodeBuffer(buf));
   return content;
}

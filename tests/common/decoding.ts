
export function decodeBuffer(buffer: Buffer) {
   if (buffer.length >= 2 && buffer[0] === 255) return buffer.slice(2).toString('utf16le');
   return buffer.toString();
}

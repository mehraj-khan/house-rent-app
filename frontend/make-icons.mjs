import fs from 'node:fs';
import zlib from 'node:zlib';

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
};

const createHouseIcon = (size, filePath) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  const rowSize = 1 + size * 3;
  const raw = Buffer.alloc(rowSize * size);

  for (let y = 0; y < size; y++) {
    const rowStart = y * rowSize;
    raw[rowStart] = 0;
    const ny = y / size;
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const inRoof = ny >= 0.22 && ny <= 0.48 && Math.abs(nx - 0.5) <= (ny - 0.2) * 1.15;
      const inBody = ny >= 0.48 && ny <= 0.76 && nx >= 0.27 && nx <= 0.73;
      const inDoor = ny >= 0.58 && ny <= 0.76 && nx >= 0.44 && nx <= 0.56;
      const isWhite = inRoof || (inBody && !inDoor);

      const px = rowStart + 1 + x * 3;
      raw[px] = isWhite ? 255 : 37;
      raw[px + 1] = isWhite ? 255 : 99;
      raw[px + 2] = isWhite ? 255 : 235;
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const png = Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
  fs.mkdirSync('public', { recursive: true });
  fs.writeFileSync(filePath, png);
};

createHouseIcon(192, 'public/icon-192.png');
createHouseIcon(512, 'public/icon-512.png');
console.log('Icons created in public/!');
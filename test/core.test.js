import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  readInt8,
  readUint8,
  readInt16,
  readUint16,
  readInt32,
  readUint32,
  readInt64,
  readUint64,
  writeInt8,
  writeUint8,
  writeInt16,
  writeUint16,
  writeInt32,
  writeUint32,
  writeInt64,
  writeUint64,
  dataView,
} from '../src/index.js';

function makeView(n) {
  return dataView(new Uint8Array(n));
}

// ---------------------------------------------------------------- 8-bit

test('writeUint8 / readUint8 round-trip max value', () => {
  const v = makeView(1);
  writeUint8(v, 0, 255);
  assert.equal(readUint8(v, 0), 255);
});

test('writeInt8 / readInt8 round-trip min value', () => {
  const v = makeView(1);
  writeInt8(v, 0, -128);
  assert.equal(readInt8(v, 0), -128);
});

test('writeUint8 writes the exact byte', () => {
  const bytes = new Uint8Array(1);
  const v = dataView(bytes);
  writeUint8(v, 0, 0x42);
  assert.equal(bytes[0], 0x42);
});

test('readUint8 at non-zero offset within a sliced buffer', () => {
  // A Uint8Array view starting at offset 2 of a 4-byte buffer.
  const bytes = new Uint8Array([0xff, 0xff, 0x7f, 0xff]);
  const slice = bytes.subarray(2); // offset 2, length 2
  const v = dataView(slice);
  assert.equal(readUint8(v, 0), 0x7f);
});

// --------------------------------------------------------------- 16-bit

test('writeUint16 produces big-endian bytes', () => {
  const bytes = new Uint8Array(2);
  const v = dataView(bytes);
  writeUint16(v, 0, 0x0102);
  assert.deepEqual([...bytes], [0x01, 0x02]);
});

test('writeInt16 / readInt16 round-trip negative', () => {
  const v = makeView(2);
  writeInt16(v, 0, -1);
  assert.equal(readInt16(v, 0), -1);
});

test('writeUint16 / readUint16 round-trip max', () => {
  const v = makeView(2);
  writeUint16(v, 0, 65535);
  assert.equal(readUint16(v, 0), 65535);
});

// --------------------------------------------------------------- 32-bit

test('writeUint32 produces big-endian bytes', () => {
  const bytes = new Uint8Array(4);
  const v = dataView(bytes);
  writeUint32(v, 0, 0x01020304);
  assert.deepEqual([...bytes], [0x01, 0x02, 0x03, 0x04]);
});

test('writeInt32 / readInt32 round-trip min', () => {
  const v = makeView(4);
  writeInt32(v, 0, -2147483648);
  assert.equal(readInt32(v, 0), -2147483648);
});

test('writeUint32 / readUint32 round-trip max', () => {
  const v = makeView(4);
  writeUint32(v, 0, 4294967295);
  assert.equal(readUint32(v, 0), 4294967295);
});

// --------------------------------------------------------------- 64-bit

test('writeUint64 produces big-endian bytes', () => {
  const bytes = new Uint8Array(8);
  const v = dataView(bytes);
  writeUint64(v, 0, 0x0102030405060708n);
  assert.deepEqual([...bytes], [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
});

test('writeInt64 / readInt64 round-trip min', () => {
  const v = makeView(8);
  writeInt64(v, 0, -9223372036854775808n);
  assert.equal(readInt64(v, 0), -9223372036854775808n);
});

test('writeUint64 / readUint64 round-trip max', () => {
  const v = makeView(8);
  writeUint64(v, 0, 18446744073709551615n);
  assert.equal(readUint64(v, 0), 18446744073709551615n);
});

// ---------------------------------------------------------- bounds checks

test('readUint8 throws RangeError when reading past end', () => {
  const v = makeView(1);
  assert.throws(() => readUint8(v, 1), RangeError);
});

test('readUint16 throws RangeError when not enough bytes', () => {
  const v = makeView(1);
  assert.throws(() => readUint16(v, 0), RangeError);
});

test('readInt64 throws RangeError when not enough bytes', () => {
  const v = makeView(7);
  assert.throws(() => readInt64(v, 0), RangeError);
});

test('writeUint32 throws RangeError when buffer too small', () => {
  const v = makeView(3);
  assert.throws(() => writeUint32(v, 0, 1), RangeError);
});

test('negative offset throws RangeError', () => {
  const v = makeView(4);
  assert.throws(() => readUint8(v, -1), RangeError);
});

// ----------------------------------------------- non-finite value handling

test('writeInt8 throws TypeError on NaN', () => {
  // DataView.setInt8 rejects non-finite numbers; we surface that rather
  // than silently writing zero, so protocol bugs fail loudly.
  const v = makeView(1);
  assert.throws(() => writeInt8(v, 0, NaN), TypeError);
});

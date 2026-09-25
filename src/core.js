/**
 * Core read/write operations for signed and unsigned integers in
 * big-endian (network) byte order.
 *
 * We deliberately support only the widths that appear in real network
 * protocols: 8, 16, 32, and 64 bits. BigInt is required only on the 64-bit
 * path; narrower widths use plain numbers, which keeps the common case
 * allocation-free and fast.
 */

/**
 * Largest signed 32-bit value, expressed as a Number. Used to guard the
 * 32-bit read path so we never silently return a truncated value when a
 * caller passes a 64-bit size.
 */
export const MAX_SAFE_S32 = 2147483647;

/**
 * Largest unsigned 32-bit value, expressed as a Number. Same guard purpose
 * as MAX_SAFE_S32, for the unsigned 32-bit path.
 */
export const MAX_SAFE_U32 = 4294967295;

/**
 * Throws a RangeError describing which read failed and how many bytes were
 * missing. Centralising this keeps the error wording identical across all
 * read entry points.
 */
function checkBounds(view, offset, size) {
  // We assert against the byte length of the *underlying buffer*, not the
  // DataView's own byteLength, because callers may legitimately construct
  // a DataView whose byte offset is non-zero. The only condition that
  // matters is: can we read `size` bytes starting at `offset`?
  if (
    offset < 0 ||
    size < 0 ||
    offset + size > view.byteLength ||
    offset + size < offset // guard against arithmetic overflow
  ) {
    throw new RangeError(
      `Read of ${size} byte(s) at offset ${offset} is out of bounds ` +
        `(buffer length ${view.byteLength})`,
    );
  }
}

/**
 * Guards the number write path against non-finite values. DataView's
 * setInt8/setUint8/etc. silently coerce NaN and Infinity via ToInt32,
 * which would hide protocol bugs; we surface them as TypeError instead.
 * BigInt writes are unaffected because BigInt cannot represent NaN.
 */
function checkFinite(value) {
  if (!Number.isFinite(value)) {
    throw new TypeError(
      `Cannot write non-finite value ${value} to a fixed-width integer field`,
    );
  }
}

/**
 * Reads a signed 8-bit integer at the given offset.
 *
 * @param {DataView} view - Buffer to read from.
 * @param {number} offset - Byte offset of the most-significant byte.
 * @returns {number} Integer in the range [-128, 127].
 */
export function readInt8(view, offset) {
  checkBounds(view, offset, 1);
  return view.getInt8(offset);
}

/**
 * Reads an unsigned 8-bit integer at the given offset.
 *
 * @param {DataView} view - Buffer to read from.
 * @param {number} offset - Byte offset.
 * @returns {number} Integer in the range [0, 255].
 */
export function readUint8(view, offset) {
  checkBounds(view, offset, 1);
  return view.getUint8(offset);
}

/**
 * Reads a signed 16-bit big-endian integer at the given offset.
 *
 * @param {DataView} view
 * @param {number} offset
 * @returns {number} Integer in the range [-32768, 32767].
 */
export function readInt16(view, offset) {
  checkBounds(view, offset, 2);
  return view.getInt16(offset, false);
}

/**
 * Reads an unsigned 16-bit big-endian integer at the given offset.
 *
 * @param {DataView} view
 * @param {number} offset
 * @returns {number} Integer in the range [0, 65535].
 */
export function readUint16(view, offset) {
  checkBounds(view, offset, 2);
  return view.getUint16(offset, false);
}

/**
 * Reads a signed 32-bit big-endian integer at the given offset.
 *
 * @param {DataView} view
 * @param {number} offset
 * @returns {number} Integer in the range [-2147483648, 2147483647].
 */
export function readInt32(view, offset) {
  checkBounds(view, offset, 4);
  return view.getInt32(offset, false);
}

/**
 * Reads an unsigned 32-bit big-endian integer at the given offset.
 *
 * @param {DataView} view
 * @param {number} offset
 * @returns {number} Integer in the range [0, 4294967295].
 */
export function readUint32(view, offset) {
  checkBounds(view, offset, 4);
  return view.getUint32(offset, false);
}

/**
 * Reads a signed 64-bit big-endian integer at the given offset.
 *
 * Uses BigInt because Number cannot represent the full int64 range
 * losslessly. Callers must opt into BigInt arithmetic.
 *
 * @param {DataView} view
 * @param {number} offset
 * @returns {bigint} BigInt in the range [-2^63, 2^63 - 1].
 */
export function readInt64(view, offset) {
  checkBounds(view, offset, 8);
  return view.getBigInt64(offset, false);
}

/**
 * Reads an unsigned 64-bit big-endian integer at the given offset.
 *
 * @param {DataView} view
 * @param {number} offset
 * @returns {bigint} BigInt in the range [0, 2^64 - 1].
 */
export function readUint64(view, offset) {
  checkBounds(view, offset, 8);
  return view.getBigUint64(offset, false);
}

/**
 * Writes a signed 8-bit integer at the given offset.
 *
 * @param {DataView} view
 * @param {number} offset
 * @param {number} value - Must fit in [-128, 127].
 */
export function writeInt8(view, offset, value) {
  checkBounds(view, offset, 1);
  checkFinite(value);
  view.setInt8(offset, value);
}

/**
 * Writes an unsigned 8-bit integer at the given offset.
 *
 * @param {DataView} view
 * @param {number} offset
 * @param {number} value - Must fit in [0, 255].
 */
export function writeUint8(view, offset, value) {
  checkBounds(view, offset, 1);
  checkFinite(value);
  view.setUint8(offset, value);
}

/**
 * Writes a signed 16-bit big-endian integer at the given offset.
 *
 * @param {DataView} view
 * @param {number} offset
 * @param {number} value
 */
export function writeInt16(view, offset, value) {
  checkBounds(view, offset, 2);
  checkFinite(value);
  view.setInt16(offset, value, false);
}

/**
 * Writes an unsigned 16-bit big-endian integer at the given offset.
 *
 * @param {DataView} view
 * @param {number} offset
 * @param {number} value
 */
export function writeUint16(view, offset, value) {
  checkBounds(view, offset, 2);
  checkFinite(value);
  view.setUint16(offset, value, false);
}

/**
 * Writes a signed 32-bit big-endian integer at the given offset.
 *
 * @param {DataView} view
 * @param {number} offset
 * @param {number} value
 */
export function writeInt32(view, offset, value) {
  checkBounds(view, offset, 4);
  checkFinite(value);
  view.setInt32(offset, value, false);
}

/**
 * Writes an unsigned 32-bit big-endian integer at the given offset.
 *
 * @param {DataView} view
 * @param {number} offset
 * @param {number} value
 */
export function writeUint32(view, offset, value) {
  checkBounds(view, offset, 4);
  checkFinite(value);
  view.setUint32(offset, value, false);
}

/**
 * Writes a signed 64-bit big-endian integer at the given offset.
 *
 * @param {DataView} view
 * @param {number} offset
 * @param {bigint} value
 */
export function writeInt64(view, offset, value) {
  checkBounds(view, offset, 8);
  view.setBigInt64(offset, value, false);
}

/**
 * Writes an unsigned 64-bit big-endian integer at the given offset.
 *
 * @param {DataView} view
 * @param {number} offset
 * @param {bigint} value
 */
export function writeUint64(view, offset, value) {
  checkBounds(view, offset, 8);
  view.setBigUint64(offset, value, false);
}

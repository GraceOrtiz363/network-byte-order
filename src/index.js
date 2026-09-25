/**
 * Network Byte Order — public surface.
 *
 * The entry point re-exports the core read/write functions and a small
 * helper that most callers end up needing: converting a Uint8Array into
 * the DataView the core functions operate on. We return a DataView over
 * the SAME underlying buffer (no copy) so that writes are visible to
 * the caller's Uint8Array.
 */

export {
  MAX_SAFE_S32,
  MAX_SAFE_U32,
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
} from './core.js';

/**
 * Wraps a Uint8Array in a DataView that shares the same backing
 * ArrayBuffer. We deliberately do NOT copy: the entire point of the
 * library is to read and write into a caller-owned buffer. If we copied,
 * writes would never be visible.
 *
 * We respect a non-zero byteOffset on the input Uint8Array because
 * subarray() is a common way to hand a slice of a larger buffer to a
 * protocol parser.
 *
 * @param {Uint8Array} bytes
 * @returns {DataView}
 */
export function dataView(bytes) {
  return new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  );
}

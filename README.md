# network-byte-order

Reads and writes signed and unsigned 8/16/32/64-bit integers in big-endian
(network) byte order into and out of `Uint8Array` buffers.

## Usage

```js
import {
  dataView,
  writeUint16,
  readUint16,
  writeInt64,
  readInt64,
} from 'network-byte-order';

const buf = new Uint8Array(10);
const v = dataView(buf);

writeUint16(v, 0, 0x0102);       // writes [0x01, 0x02]
writeInt64(v, 2, -1n);           // writes eight bytes, all 0xff

readUint16(v, 0);                // 258
readInt64(v, 2);                 // -1n
```

## Why this exists

Network protocols describe their on-wire layout in big-endian octets.
JavaScript's `DataView` already does this, but its API is verbose and the
little-endian flag is a constant source of copy-paste bugs. This library
hides the flag: every call is big-endian, every call bounds-checks, and the
names match the C convention (`uint16`, `int64`) so a spec reads straight
into code.

The trade-off is generality. Only 8/16/32/64-bit signed and unsigned
integers are supported — no floating point, no 24-bit oddities, no variable-
length integers. If you need those, wrap `DataView` yourself.

## Edge cases worth knowing

- **64-bit values are `bigint`, not `number`.** `Number` cannot represent
  the full `uint64` range; the 64-bit functions use `BigInt` throughout.
  Mixing a `number` into `writeInt64` will throw.

- **Out-of-bounds access throws `RangeError`.** Reads and writes are
  bounds-checked against the buffer. A short buffer is a bug, not a silent
  zero.

- **Non-finite values throw `TypeError`.** Passing `NaN` or `Infinity` to
  a write function surfaces the underlying `DataView` `TypeError` rather than
  coercing to zero. This is deliberate.

- **`dataView` does not copy.** It returns a `DataView` over the same
  backing buffer as your `Uint8Array`. Writes through the `DataView` are
  visible in the original `Uint8Array` immediately. A non-zero `byteOffset`
  on the input `Uint8Array` is honoured.

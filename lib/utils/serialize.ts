/**
 * Deeply serialize an object, converting all BigInt values to strings
 * This is needed because JSON.stringify() doesn't support BigInt
 */
export function serializeBigInt<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle BigInt directly
  if (typeof obj === 'bigint') {
    return Number(obj) as unknown as T;  // Convert to number for JSON
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt) as unknown as T;
  }

  // Handle objects
  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value);
    }
    return serialized as T;
  }

  // Primitive types (string, number, boolean, etc.) pass through
  return obj;
}


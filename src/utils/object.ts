type AnyObject = { [key: string]: any };

export function mergeObjects(obj1: AnyObject, obj2: AnyObject): AnyObject {
  const result: AnyObject = { ...obj1 }; // Start with a shallow copy of obj1

  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (isObject(obj2[key]) && isObject(obj1[key])) {
        // If both properties are objects, recursively merge them
        result[key] = mergeObjects(obj1[key], obj2[key]);
      } else {
        // Otherwise, directly assign the property from obj2
        result[key] = obj2[key];
      }
    }
  }

  return result;
}

function isObject(item: any): item is AnyObject {
  return item && typeof item === "object" && !Array.isArray(item);
}

export function objectWalkPath(item?: AnyObject | null, path?: string) {
  if (!item || !path || !path.trim().length) return item ?? "";

  const keys = path.split(".");

  let current = item;
  for (const key of keys) {
    if (!current) break;

    current = current[key];
  }

  return current ?? "";
}

// src/lib/pdf-polyfills.ts
if (typeof (global as any).DOMMatrix === "undefined") {
  (global as any).DOMMatrix = class DOMMatrix { constructor() {} };
}
if (typeof (global as any).Path2D === "undefined") {
  (global as any).Path2D = class Path2D { constructor() {} };
}
if (typeof (global as any).ImageData === "undefined") {
  (global as any).ImageData = class ImageData { constructor() {} };
}
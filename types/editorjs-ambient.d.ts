// Make sure tsconfig.json includes "types/**/*.d.ts" (your tsconfig already does)
import type { ToolConstructable } from '@editorjs/editorjs';

/**
 * Provide a permissive ToolConstructable export for all @editorjs/* packages.
 * This avoids "Could not find a declaration file" errors and gives us a
 * single canonical type to cast to in the code.
 */
declare module '@editorjs/*' {
  const Tool: ToolConstructable;
  export default Tool;
}

// Wildcard ambient declarations removed because they can interfere with module resolution.
// See editorjs-external.d.ts for explicit per-module declarations.
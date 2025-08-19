import type { ToolConstructable } from '@editorjs/editorjs';

/**
 * Explicit module declarations for Editor.js third-party tools.
 * These map each package import to the Editor.js ToolConstructable type so
 * the imports used in components/BlockEditor.tsx are typed and the "no declaration file"
 * errors disappear.
 */

declare module '@editorjs/simple-image' { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/link'         { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/raw'          { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/embed'        { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/checklist'    { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/marker'       { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/header'       { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/paragraph'    { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/list'         { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/table'        { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/code'         { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/inline-code'  { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/image'        { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/delimiter'    { const Tool: ToolConstructable; export default Tool; }

// Add other @editorjs/* packages you import here the same way.
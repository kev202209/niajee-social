import type { ToolConstructable } from '@editorjs/editorjs';

// declare Editor.js tools as ToolConstructable so TypeScript accepts them when used in the tools map
declare module '@editorjs/header' { const Header: ToolConstructable; export default Header; }
declare module '@editorjs/paragraph' { const Paragraph: ToolConstructable; export default Paragraph; }
declare module '@editorjs/list' { const List: ToolConstructable; export default List; }
declare module '@editorjs/checklist' { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/marker' { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/table' { const Table: ToolConstructable; export default Table; }
declare module '@editorjs/code' { const Code: ToolConstructable; export default Code; }
declare module '@editorjs/inline-code' { const InlineCode: ToolConstructable; export default InlineCode; }
declare module '@editorjs/link' { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/image' { const ImageTool: ToolConstructable; export default ImageTool; }
declare module '@editorjs/simple-image' { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/raw' { const Tool: ToolConstructable; export default Tool; }
declare module '@editorjs/embed' { const Tool: ToolConstructable; export default Tool; }

// if you use additional third-party editorjs plugins, add them here similarly
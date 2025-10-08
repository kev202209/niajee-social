"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import type { ToolConstructable } from '@editorjs/editorjs';

// Import Editor.js tools
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import Table from '@editorjs/table';
import SimpleImage from '@editorjs/simple-image';
import Code from '@editorjs/code';
import LinkTool from '@editorjs/link';
import Image from '@editorjs/image';
import Raw from '@editorjs/raw';
import Embed from '@editorjs/embed';
import Checklist from '@editorjs/checklist';
import Marker from '@editorjs/marker';
import Delimiter from '@editorjs/delimiter';
import InlineCode from '@editorjs/inline-code';

interface BlockEditorProps {
  value?: OutputData;
  onChange?: (data: OutputData) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const BlockEditor = forwardRef<EditorJS, BlockEditorProps>(({ 
  value,
  onChange,
  placeholder = "Start writing your blog...",
  readOnly = false
}, ref) => {
  const ejInstance = useRef<EditorJS | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const isMounted = useRef(true);
  const editorId = useRef(`editor-${Math.random().toString(36).substr(2, 9)}`);

  // Expose the EditorJS instance to parent ref
  useImperativeHandle(ref, () => ejInstance.current!);

  // Initialize editor only once
  useEffect(() => {
    isMounted.current = true;

    const initEditor = async () => {
      // Prevent multiple initializations
      if (isInitialized.current || !editorRef.current) {
        return;
      }

      try {
        // Clear any existing content in the holder
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }

        const editor = new EditorJS({
          holder: editorId.current,
          onReady: () => {
            if (isMounted.current) {
              ejInstance.current = editor;
              isInitialized.current = true;
            }
          },
          onChange: async (api) => {
            if (onChange && isMounted.current) {
              try {
                const content = await api.saver.save();
                onChange(content);
              } catch (error) {
                console.error('Error saving editor content:', error);
              }
            }
          },
          autofocus: !readOnly,
          placeholder,
          readOnly,
          data: value || { blocks: [] },
          minHeight: 0,
          tools: {
            header: {
              class: Header as unknown as ToolConstructable,
              inlineToolbar: ['marker', 'link'],
              config: {
                placeholder: 'Enter a header',
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2
              }
            },
            paragraph: {
              class: Paragraph as unknown as ToolConstructable,
              inlineToolbar: true,
              config: {
                placeholder: 'Start writing...'
              }
            },
            list: {
              class: List as unknown as ToolConstructable,
              inlineToolbar: true,
              config: {
                defaultStyle: 'unordered'
              }
            },
            checklist: {
              class: Checklist as unknown as ToolConstructable,
              inlineToolbar: true,
            },
            image: {
              class: Image,
              config: {
                endpoints: {
                  byFile: `${process.env.NEXT_PUBLIC_API_URL}/api/upload/image`,
                  byUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/upload/image-by-url`,
                },
                field: 'image',
                types: 'image/*',
                additionalRequestHeaders: {
                  'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
                },
                uploader: {
                  uploadByFile: async (file: File) => {
                    try {
                      const formData = new FormData();
                      formData.append('image', file);
                      
                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/image`, {
                        method: 'POST',
                        credentials: 'include',
                        body: formData,
                      });
                      
                      const data = await response.json();
                      
                      if (data.success) {
                        return {
                          success: 1,
                          file: {
                            url: data.data.url,
                          }
                        };
                      } else {
                        throw new Error(data.message || 'Upload failed');
                      }
                    } catch (error) {
                      console.error('Image upload error:', error);
                      return {
                        success: 0,
                        error: 'Upload failed'
                      };
                    }
                  },
                  uploadByUrl: async (url: string) => {
                    try {
                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/image-by-url`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url }),
                      });
                      
                      const data = await response.json();
                      
                      if (data.success) {
                        return {
                          success: 1,
                          file: {
                            url: data.data.url,
                          }
                        };
                      } else {
                        throw new Error(data.message || 'Upload failed');
                      }
                    } catch (error) {
                      console.error('Image upload by URL error:', error);
                      return {
                        success: 0,
                        error: 'Upload failed'
                      };
                    }
                  }
                }
              }
            },
            simpleImage: SimpleImage as unknown as ToolConstructable,
            code: {
              class: Code as unknown as ToolConstructable,
              config: {
                placeholder: 'Enter code here...'
              }
            },
            inlineCode: {
              class: InlineCode,
              shortcut: 'CMD+SHIFT+M',
            },
            linkTool: {
              class: LinkTool as unknown as ToolConstructable,
              config: {
                endpoint: `${process.env.NEXT_PUBLIC_API_URL}/api/link-preview`,
              }
            },
            embed: {
              class: Embed as unknown as ToolConstructable,
              config: {
                services: {
                  youtube: true,
                  twitter: true,
                  instagram: true,
                  codepen: true,
                  github: true,
                }
              }
            },
            marker: {
              class: Marker as unknown as ToolConstructable,
              shortcut: 'CMD+SHIFT+H',
            },
            delimiter: Delimiter as unknown as ToolConstructable,
            table: {
              class: Table as unknown as ToolConstructable,
              inlineToolbar: true,
              config: {
                rows: 2,
                cols: 3,
              },
            },
            raw: Raw as unknown as ToolConstructable,
          },
        });
      } catch (error) {
        console.error('Failed to initialize Editor.js:', error);
        isInitialized.current = false;
      }
    };

    // Delay initialization slightly to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      if (editorRef.current && !isInitialized.current && isMounted.current) {
        void initEditor();
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      isMounted.current = false;
      
      // Cleanup editor only on unmount
      if (ejInstance.current && ejInstance.current.destroy) {
        try {
          ejInstance.current.destroy();
        } catch (error) {
          console.error('Error destroying editor:', error);
        }
        ejInstance.current = null;
      }
      isInitialized.current = false;
    };
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className="block-editor-wrapper">
      <div 
        ref={editorRef}
        className="block-editor"
        id={editorId.current}
      />
      
      <style jsx global>{`
        /* Editor.js Container */
        .block-editor {
          min-height: 300px;
          border: 1px solid rgb(209 213 219);
          border-radius: 0.5rem;
          background: white;
          padding: 1rem;
          transition: border-color 0.2s;
        }

        @media (min-width: 640px) {
          .block-editor {
            min-height: 400px;
          }
        }

        .dark .block-editor {
          border-color: rgb(75 85 99);
          background: rgb(31 41 55);
        }

        .block-editor:focus-within {
          border-color: rgb(59 130 246);
          outline: 2px solid rgb(59 130 246 / 0.1);
          outline-offset: 2px;
        }

        /* Editor.js Core Styles */
        .codex-editor {
          color: rgb(17 24 39);
        }

        .dark .codex-editor {
          color: rgb(243 244 246);
        }

        .codex-editor__redactor {
          padding-bottom: 100px !important;
        }

        /* Toolbar Styles - Enhanced visibility */
        .ce-toolbar__plus,
        .ce-toolbar__settings-btn {
          color: rgb(59 130 246) !important;
          background: white !important;
          border: 1px solid rgb(209 213 219) !important;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1) !important;
          transition: all 0.2s !important;
        }

        .dark .ce-toolbar__plus,
        .dark .ce-toolbar__settings-btn {
          color: rgb(147 197 253) !important;
          background: rgb(31 41 55) !important;
          border-color: rgb(75 85 99) !important;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.3) !important;
        }

        .ce-toolbar__plus:hover,
        .ce-toolbar__settings-btn:hover {
          color: rgb(37 99 235) !important;
          border-color: rgb(59 130 246) !important;
          background: rgb(239 246 255) !important;
          transform: scale(1.05) !important;
        }

        .dark .ce-toolbar__plus:hover,
        .dark .ce-toolbar__settings-btn:hover {
          color: rgb(96 165 250) !important;
          border-color: rgb(59 130 246) !important;
          background: rgb(30 58 138 / 0.2) !important;
          transform: scale(1.05) !important;
        }

        /* Toolbox Styles - Enhanced visibility */
        .ce-popover {
          background: white !important;
          border: 1px solid rgb(209 213 219) !important;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04) !important;
          backdrop-filter: blur(8px) !important;
        }

        .dark .ce-popover {
          background: rgb(31 41 55) !important;
          border-color: rgb(75 85 99) !important;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.4), 0 10px 10px -5px rgb(0 0 0 / 0.2) !important;
        }

        .ce-popover-item {
          color: rgb(55 65 81) !important;
          transition: all 0.2s !important;
          padding: 8px 12px !important;
        }

        .dark .ce-popover-item {
          color: rgb(209 213 219) !important;
        }

        .ce-popover-item:hover {
          background: rgb(239 246 255) !important;
          color: rgb(37 99 235) !important;
          transform: translateX(2px) !important;
        }

        .dark .ce-popover-item:hover {
          background: rgb(30 58 138 / 0.2) !important;
          color: rgb(147 197 253) !important;
          transform: translateX(2px) !important;
        }

        .ce-popover-item__icon {
          background: rgb(59 130 246) !important;
          color: white !important;
          border-radius: 0.375rem !important;
          width: 28px !important;
          height: 28px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .dark .ce-popover-item__icon {
          background: rgb(147 197 253) !important;
          color: rgb(17 24 39) !important;
        }

        .ce-popover-item:hover .ce-popover-item__icon {
          background: rgb(37 99 235) !important;
          color: white !important;
          transform: scale(1.1) !important;
        }

        .dark .ce-popover-item:hover .ce-popover-item__icon {
          background: rgb(96 165 250) !important;
          color: rgb(17 24 39) !important;
          transform: scale(1.1) !important;
        }

        .ce-popover-item__title {
          font-weight: 500 !important;
        }

        /* Inline Toolbar Styles */
        .ce-inline-toolbar {
          background: white !important;
          border: 1px solid rgb(209 213 219) !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
        }

        .dark .ce-inline-toolbar {
          background: rgb(31 41 55) !important;
          border-color: rgb(75 85 99) !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3) !important;
        }

        .ce-inline-tool {
          color: rgb(55 65 81) !important;
          transition: all 0.2s !important;
        }

        .dark .ce-inline-tool {
          color: rgb(209 213 219) !important;
        }

        .ce-inline-tool:hover {
          color: rgb(59 130 246) !important;
          background: rgb(239 246 255) !important;
        }

        .dark .ce-inline-tool:hover {
          color: rgb(147 197 253) !important;
          background: rgb(30 58 138 / 0.1) !important;
        }

        .ce-inline-tool--active {
          color: rgb(59 130 246) !important;
          background: rgb(239 246 255) !important;
        }

        .dark .ce-inline-tool--active {
          color: rgb(147 197 253) !important;
          background: rgb(30 58 138 / 0.2) !important;
        }

        /* Block Content Styles */
        .ce-paragraph {
          color: rgb(55 65 81);
          line-height: 1.7;
          font-size: 16px;
        }

        .dark .ce-paragraph {
          color: rgb(209 213 219);
        }

        .ce-header {
          color: rgb(17 24 39);
          font-weight: 600;
          margin: 1.5rem 0 1rem 0;
          line-height: 1.2;
        }

        .dark .ce-header {
          color: rgb(243 244 246);
        }

        /* Code Block Styles */
        .ce-code__textarea {
          background: rgb(249 250 251) !important;
          color: rgb(17 24 39) !important;
          border: 1px solid rgb(209 213 219) !important;
          border-radius: 0.375rem !important;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          padding: 1rem !important;
        }

        .dark .ce-code__textarea {
          background: rgb(17 24 39) !important;
          color: rgb(209 213 219) !important;
          border-color: rgb(75 85 99) !important;
        }

        /* List Styles */
        .cdx-list {
          color: rgb(55 65 81);
          line-height: 1.6;
        }

        .dark .cdx-list {
          color: rgb(209 213 219);
        }

        .cdx-list__item {
          margin: 0.5rem 0;
        }

        /* Checklist Styles */
        .cdx-checklist__item {
          display: flex;
          align-items: flex-start;
          margin: 0.5rem 0;
        }

        .cdx-checklist__item-checkbox {
          border: 2px solid rgb(209 213 219) !important;
          border-radius: 4px !important;
          width: 18px !important;
          height: 18px !important;
          margin-right: 0.75rem !important;
          margin-top: 2px !important;
          transition: all 0.2s !important;
        }

        .dark .cdx-checklist__item-checkbox {
          border-color: rgb(75 85 99) !important;
        }

        .cdx-checklist__item-checkbox--checked {
          background: rgb(59 130 246) !important;
          border-color: rgb(59 130 246) !important;
        }

        .dark .cdx-checklist__item-checkbox--checked {
          background: rgb(147 197 253) !important;
          border-color: rgb(147 197 253) !important;
        }

        .cdx-checklist__item-checkbox--checked::before {
          content: '✓' !important;
          color: white !important;
          font-size: 12px !important;
          font-weight: bold !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          height: 100% !important;
        }

        .dark .cdx-checklist__item-checkbox--checked::before {
          color: rgb(17 24 39) !important;
        }

        .cdx-checklist__item-text {
          color: rgb(55 65 81);
          line-height: 1.6;
          flex: 1;
        }

        .dark .cdx-checklist__item-text {
          color: rgb(209 213 219);
        }

        /* Table Styles */
        .tc-table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
          overflow-x: auto;
          display: block;
        }

        .tc-table__cell {
          border: 1px solid rgb(209 213 219) !important;
          padding: 0.75rem !important;
          background: white !important;
          color: rgb(55 65 81) !important;
          min-width: 100px;
        }

        .dark .tc-table__cell {
          border-color: rgb(75 85 99) !important;
          background: rgb(31 41 55) !important;
          color: rgb(209 213 219) !important;
        }

        /* Image Styles */
        .image-tool {
          margin: 1.5rem 0;
        }

        .image-tool__image {
          border-radius: 0.5rem;
          overflow: hidden;
          max-width: 100%;
        }

        .image-tool__caption {
          color: rgb(107 114 128);
          font-size: 14px;
          text-align: center;
          margin-top: 0.5rem;
          font-style: italic;
        }

        .dark .image-tool__caption {
          color: rgb(156 163 175);
        }

        /* Link Tool Styles */
        .link-tool {
          border: 1px solid rgb(209 213 219);
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1rem 0;
          background: rgb(249 250 251);
          transition: all 0.2s;
        }

        .dark .link-tool {
          border-color: rgb(75 85 99);
          background: rgb(17 24 39);
        }

        .link-tool:hover {
          border-color: rgb(59 130 246);
          background: rgb(239 246 255);
        }

        .dark .link-tool:hover {
          border-color: rgb(59 130 246);
          background: rgb(30 58 138 / 0.1);
        }

        .link-tool__title {
          color: rgb(17 24 39);
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .dark .link-tool__title {
          color: rgb(243 244 246);
        }

        .link-tool__description {
          color: rgb(107 114 128);
          font-size: 14px;
          line-height: 1.5;
        }

        .dark .link-tool__description {
          color: rgb(156 163 175);
        }

        /* Delimiter Styles */
        .ce-delimiter {
          text-align: center;
          margin: 2rem 0;
        }

        .ce-delimiter::before {
          content: '***';
          color: rgb(107 114 128);
          font-size: 1.5rem;
          letter-spacing: 0.5rem;
        }

        .dark .ce-delimiter::before {
          color: rgb(156 163 175);
        }

        /* Marker/Highlight Styles */
        .cdx-marker {
          background: rgb(254 240 138);
          color: rgb(120 113 108);
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
        }

        .dark .cdx-marker {
          background: rgb(180 83 9);
          color: rgb(254 215 170);
        }

        /* Placeholder Styles */
        .codex-editor__redactor [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: rgb(156 163 175);
          font-style: italic;
          pointer-events: none;
        }

        .dark .codex-editor__redactor [data-placeholder]:empty::before {
          color: rgb(107 114 128);
        }

        /* Selection Styles */
        .codex-editor__redactor ::selection {
          background: rgb(59 130 246 / 0.2);
        }

        .dark .codex-editor__redactor ::selection {
          background: rgb(147 197 253 / 0.3);
        }

        /* Focus Styles */
        .ce-block--focused {
          background: rgb(248 250 252) !important;
          border-radius: 0.375rem !important;
        }

        .dark .ce-block--focused {
          background: rgb(15 23 42) !important;
        }

        /* Animation for tools */
        .ce-popover-item,
        .ce-toolbar__plus,
        .ce-toolbar__settings-btn,
        .ce-inline-tool {
          animation: fadeInUp 0.2s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile Responsiveness */
        @media (max-width: 640px) {
          .ce-toolbar__plus,
          .ce-toolbar__settings-btn {
            width: 32px !important;
            height: 32px !important;
          }

          .ce-popover {
            max-width: calc(100vw - 2rem) !important;
          }

          .tc-table {
            font-size: 14px;
          }

          .tc-table__cell {
            padding: 0.5rem !important;
            min-width: 80px;
          }
        }
      `}</style>
    </div>
  );
});

BlockEditor.displayName = 'BlockEditor';

export default BlockEditor;
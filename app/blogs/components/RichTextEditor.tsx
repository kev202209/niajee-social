"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  FiBold, 
  FiItalic, 
  FiUnderline, 
  FiList, 
  FiLink, 
  FiImage, 
  FiCode,
  FiType,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight
} from 'react-icons/fi';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleHeading = (level: number) => {
    execCommand('formatBlock', `h${level}`);
  };

  const handleLink = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setLinkText(selection.toString());
    }
    setIsLinkModalOpen(true);
  };

  const insertLink = () => {
    if (linkUrl) {
      if (linkText) {
        // If we have selected text, replace it with a link
        execCommand('insertHTML', `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
      } else {
        // If no text selected, insert the URL as both text and link
        execCommand('insertHTML', `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkUrl}</a>`);
      }
    }
    setIsLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          execCommand('insertHTML', `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    let clean = html;

    if (html) {
      // Remove color styles (color: ... and color="...")
      clean = html.replace(/color\s*:\s*[^;"]+;?/gi, '');
      clean = clean.replace(/(<[^>]+) style="([^"]*)"/gi, (match, tag, style) => {
        // Remove color from style attribute
        const newStyle = style
          .split(';')
          .filter((s: string) => !s.trim().startsWith('color:'))
          .join(';');
        return newStyle.trim() ? `${tag} style="${newStyle}"` : tag;
      });
      document.execCommand('insertHTML', false, clean);
    } else if (text) {
      document.execCommand('insertText', false, text);
    }
    handleInput();
  };

  const toolbarButtons = [
    {
      icon: FiBold,
      command: 'bold',
      title: 'Bold (Ctrl+B)',
    },
    {
      icon: FiItalic,
      command: 'italic',
      title: 'Italic (Ctrl+I)',
    },
    {
      icon: FiUnderline,
      command: 'underline',
      title: 'Underline (Ctrl+U)',
    },
    {
      icon: FiList,
      command: 'insertUnorderedList',
      title: 'Bullet List',
    },
    {
      icon: FiList,
      command: 'insertOrderedList',
      title: 'Numbered List',
    },
    {
      icon: FiAlignLeft,
      command: 'justifyLeft',
      title: 'Align Left',
    },
    {
      icon: FiAlignCenter,
      command: 'justifyCenter',
      title: 'Align Center',
    },
    {
      icon: FiAlignRight,
      command: 'justifyRight',
      title: 'Align Right',
    },
    {
      icon: FiCode,
      command: 'formatBlock',
      value: 'pre',
      title: 'Code Block',
    },
  ];

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      {/* Toolbar */}
      <div className="border-b border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700">
        <div className="flex flex-wrap items-center gap-2">
          {/* Heading Dropdown */}
          <select
            onChange={(e) => {
              if (e.target.value === 'p') {
                execCommand('formatBlock', 'div');
              } else {
                execCommand('formatBlock', e.target.value);
              }
            }}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="div">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Formatting Buttons */}
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              type="button"
              onClick={() => execCommand(button.command, button.value)}
              title={button.title}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              <button.icon className="w-4 h-4" />
            </button>
          ))}

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Link Button */}
          <button
            type="button"
            onClick={handleLink}
            title="Insert Link"
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            <FiLink className="w-4 h-4" />
          </button>

          {/* Image Button */}
          <button
            type="button"
            onClick={handleImageUpload}
            title="Insert Image"
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            <FiImage className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        className="min-h-[300px] p-4 focus:outline-none text-gray-900 dark:text-white"
        style={{ 
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Insert Link
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link Text (optional)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertLink}
                disabled={!linkUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.875rem 0;
        }
        
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.75rem 0;
        }
        
        [contenteditable] h4 {
          font-size: 1.125rem;
          font-weight: bold;
          margin: 0.625rem 0;
        }
        
        [contenteditable] p {
          margin: 0.5rem 0;
        }
        
        [contenteditable] ul,
        [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 2rem;
        }
        
        [contenteditable] pre {
          background-color: #f3f4f6;
          border-radius: 0.375rem;
          padding: 1rem;
          margin: 0.5rem 0;
          overflow-x: auto;
          font-family: 'Monaco', 'Consolas', monospace;
        }
        
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
}
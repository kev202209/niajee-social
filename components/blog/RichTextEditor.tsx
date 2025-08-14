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

interface BlockData {
  id: string;
  type: 'paragraph' | 'header' | 'list' | 'code' | 'image';
  data: {
    text?: string;
    level?: number;
    style?: 'ordered' | 'unordered';
    items?: string[];
    code?: string;
    src?: string;
    alt?: string;
    alignment?: 'left' | 'center' | 'right';
  };
  tunes?: {
    alignment?: 'left' | 'center' | 'right';
  };
}

interface ContentData {
  time: number;
  blocks: BlockData[];
  version: string;
}

interface RichTextEditorProps {
  value: ContentData | undefined;
  onChange: (value: ContentData) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [currentAlignment, setCurrentAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });
  const [currentHeading, setCurrentHeading] = useState(0);

  // Check active formatting states
  const checkActiveFormats = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    });

    // Check current heading level
    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer;
    
    while (element && element.nodeType !== Node.ELEMENT_NODE) {
      element = element.parentNode;
    }

    if (element && element instanceof HTMLElement) {
      const tagName = element.tagName.toLowerCase();
      if (tagName.match(/^h[1-6]$/)) {
        setCurrentHeading(parseInt(tagName.charAt(1)));
      } else {
        setCurrentHeading(0);
      }

      // Check alignment
      const computedStyle = window.getComputedStyle(element);
      const textAlign = computedStyle.textAlign;
      if (textAlign === 'center') setCurrentAlignment('center');
      else if (textAlign === 'right') setCurrentAlignment('right');
      else setCurrentAlignment('left');
    }
  };

  // Convert JSON blocks to HTML for display
  const blocksToHtml = (blocks: BlockData[]): string => {
    return blocks.map(block => {
      const alignment = block.tunes?.alignment || 'left';
      const alignStyle = `text-align: ${alignment};`;
      
      switch (block.type) {
        case 'header':
          const level = block.data.level || 1;
          return `<h${level} style="${alignStyle}" data-block-id="${block.id}">${block.data.text || ''}</h${level}>`;
        
        case 'paragraph':
          return `<p style="${alignStyle}" data-block-id="${block.id}">${block.data.text || ''}</p>`;
        
        case 'list':
          const items = block.data.items || [];
          const listItems = items.map(item => `<li>${item}</li>`).join('');
          const listTag = block.data.style === 'ordered' ? 'ol' : 'ul';
          return `<${listTag} style="${alignStyle}" data-block-id="${block.id}">${listItems}</${listTag}>`;
        
        case 'code':
          return `<pre class="code-block" style="${alignStyle}" data-block-id="${block.id}"><code>${block.data.code || ''}</code></pre>`;
        
        case 'image':
          return `<img src="${block.data.src}" alt="${block.data.alt || ''}" style="max-width: 100%; height: auto; ${alignStyle}" data-block-id="${block.id}" />`;
        
        default:
          return `<p style="${alignStyle}" data-block-id="${block.id}">${block.data.text || ''}</p>`;
      }
    }).join('');
  };

  // Convert HTML to JSON blocks - FIXED VERSION
  const htmlToBlocks = (html: string): BlockData[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements = Array.from(doc.body.children);
    
    return elements.map((element, index) => {
      const id = element.getAttribute('data-block-id') || `block_${Date.now()}_${index}`;
      const alignment = getAlignmentFromStyle(element.getAttribute('style') || '');
      
      const block: BlockData = {
        id,
        type: 'paragraph',
        data: {},
        tunes: alignment !== 'left' ? { alignment } : undefined
      };

      switch (element.tagName.toLowerCase()) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          block.type = 'header';
          block.data = {
            text: element.innerHTML, // Use innerHTML to preserve formatting
            level: parseInt(element.tagName.charAt(1))
          };
          break;
        
        case 'p':
          block.type = 'paragraph';
          block.data = { text: element.innerHTML || '' };
          break;
        
        case 'ul':
        case 'ol':
          block.type = 'list';
          const items = Array.from(element.querySelectorAll('li')).map(li => li.innerHTML);
          block.data = {
            style: element.tagName.toLowerCase() === 'ol' ? 'ordered' : 'unordered',
            items
          };
          break;
        
        case 'pre':
          block.type = 'code';
          const codeElement = element.querySelector('code');
          block.data = { code: codeElement?.textContent || element.textContent || '' };
          break;
        
        case 'img':
          block.type = 'image';
          block.data = {
            src: (element as HTMLImageElement).src,
            alt: (element as HTMLImageElement).alt
          };
          break;
        
        default:
          block.data = { text: element.innerHTML || '' };
      }

      return block;
    });
  };

  const getAlignmentFromStyle = (style: string): 'left' | 'center' | 'right' => {
    if (style.includes('text-align: center')) return 'center';
    if (style.includes('text-align: right')) return 'right';
    return 'left';
  };

  // Initialize editor with content
  useEffect(() => {
    if (editorRef.current && value) {
      const html = blocksToHtml(value.blocks);
      if (editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const blocks = htmlToBlocks(html);
      
      const contentData: ContentData = {
        time: Date.now(),
        blocks,
        version: "1.0.0"
      };
      
      onChange(contentData);
      // Delay format checking to allow DOM to update
      setTimeout(checkActiveFormats, 10);
    }
  };

  const handleSelectionChange = () => {
    checkActiveFormats();
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleAlignment = (alignment: 'left' | 'center' | 'right') => {
    setCurrentAlignment(alignment);
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let element = range.commonAncestorContainer;
      
      // Find the block element
      while (element && element.nodeType !== Node.ELEMENT_NODE) {
        element = element.parentNode;
        if (!element) break;
      }
      if (!element) return;
      
      if (element && element instanceof HTMLElement) {
        element.style.textAlign = alignment;
        handleInput();
      }
    }
  };

  // FIXED: Preserve formatting when changing headers
  const handleHeading = (level: number) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Save current selection content with formatting
    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer;
    
    // Find the block element
    while (element && element.nodeType !== Node.ELEMENT_NODE) {
      element = element.parentNode;
    }

    if (element && element instanceof HTMLElement) {
      const currentContent = element.innerHTML;
      const currentAlignment = element.style.textAlign || 'left';
      
      if (level === 0) {
        // Convert to paragraph
        const newElement = document.createElement('p');
        newElement.innerHTML = currentContent;
        newElement.style.textAlign = currentAlignment;
        element.parentNode?.replaceChild(newElement, element);
      } else {
        // Convert to heading
        const newElement = document.createElement(`h${level}`);
        newElement.innerHTML = currentContent;
        newElement.style.textAlign = currentAlignment;
        element.parentNode?.replaceChild(newElement, element);
      }
      
      setCurrentHeading(level);
      handleInput();
    }
  };

  // FIXED: Better code block handling
  const handleCodeBlock = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer;
    
    // Find the block element
    while (element && element.nodeType !== Node.ELEMENT_NODE) {
      element = element.parentNode;
    }

    if (element && element instanceof HTMLElement) {
      if (element.tagName.toLowerCase() === 'pre') {
        // Convert back to paragraph
        const newElement = document.createElement('p');
        const codeElement = element.querySelector('code');
        newElement.textContent = codeElement?.textContent || element.textContent || '';
        element.parentNode?.replaceChild(newElement, element);
      } else {
        // Convert to code block
        const newElement = document.createElement('pre');
        newElement.className = 'code-block';
        const codeElement = document.createElement('code');
        codeElement.textContent = element.textContent || '';
        newElement.appendChild(codeElement);
        element.parentNode?.replaceChild(newElement, element);
      }
      
      handleInput();
    }
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
        execCommand('insertHTML', `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
      } else {
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
          execCommand('insertHTML', `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%; height: auto; text-align: ${currentAlignment};" />`);
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
    
    if (html) {
      // Clean HTML and insert
      let clean = html.replace(/color\s*:\s*[^;"]+;?/gi, '');
      clean = clean.replace(/(<[^>]+) style="([^"]*)"/gi, (match, tag, style) => {
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
      isActive: activeFormats.bold,
    },
    {
      icon: FiItalic,
      command: 'italic',
      title: 'Italic (Ctrl+I)',
      isActive: activeFormats.italic,
    },
    {
      icon: FiUnderline,
      command: 'underline',
      title: 'Underline (Ctrl+U)',
      isActive: activeFormats.underline,
    },
    {
      icon: FiList,
      command: 'insertUnorderedList',
      title: 'Bullet List',
      isActive: false,
    },
    {
      icon: FiList,
      command: 'insertOrderedList',
      title: 'Numbered List',
      isActive: false,
    },
  ];

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      {/* Toolbar */}
      <div className="border-b border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700">
        <div className="flex flex-wrap items-center gap-2">
          {/* Heading Dropdown */}
          <select
            value={currentHeading}
            onChange={(e) => handleHeading(parseInt(e.target.value))}
            className={`px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium ${
              currentHeading > 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : ''
            }`}
          >
            <option value="0">Normal</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
          </select>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Formatting Buttons */}
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              type="button"
              onClick={() => execCommand(button.command, button.value)}
              title={button.title}
              className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors ${
                button.isActive 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <button.icon className="w-4 h-4" />
            </button>
          ))}

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Code Block Button - FIXED */}
          <button
            type="button"
            onClick={handleCodeBlock}
            title="Code Block"
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            <FiCode className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Alignment Buttons */}
          <button
            type="button"
            onClick={() => handleAlignment('left')}
            title="Align Left"
            className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors ${
              currentAlignment === 'left' 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FiAlignLeft className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => handleAlignment('center')}
            title="Align Center"
            className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors ${
              currentAlignment === 'center' 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FiAlignCenter className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => handleAlignment('right')}
            title="Align Right"
            className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors ${
              currentAlignment === 'right' 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FiAlignRight className="w-4 h-4" />
          </button>

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
        onMouseUp={checkActiveFormats}
        onKeyUp={checkActiveFormats}
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
          font-size: 2.25rem;
          font-weight: 800;
          line-height: 1.2;
          margin: 1.5rem 0;
          color: #1a1a1a;
        }
        
        [contenteditable] h2 {
          font-size: 1.875rem;
          font-weight: 700;
          line-height: 1.3;
          margin: 1.25rem 0;
          color: #2a2a2a;
        }
        
        [contenteditable] h3 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 1rem 0;
          color: #3a3a3a;
        }
        
        [contenteditable] h4 {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 0.875rem 0;
          color: #4a4a4a;
        }
        
        /* Dark mode header colors */
        .dark [contenteditable] h1 {
          color: #f5f5f5;
        }
        
        .dark [contenteditable] h2 {
          color: #e5e5e5;
        }
        
        .dark [contenteditable] h3 {
          color: #d5d5d5;
        }
        
        .dark [contenteditable] h4 {
          color: #c5c5c5;
        }
        
        [contenteditable] p {
          margin: 0.75rem 0;
          line-height: 1.6;
        }
        
        [contenteditable] ul,
        [contenteditable] ol {
          margin: 0.75rem 0;
          padding-left: 2rem;
          line-height: 1.6;
        }
        
        [contenteditable] pre,
        [contenteditable] .code-block {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          border: 1px solid #475569;
          border-radius: 0.5rem;
          padding: 1.25rem;
          margin: 1rem 0;
          overflow-x: auto;
          font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
          color: #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          position: relative;
        }
        
        [contenteditable] pre::before,
        [contenteditable] .code-block::before {
          content: "Code";
          position: absolute;
          top: 0.5rem;
          right: 0.75rem;
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        [contenteditable] pre code,
        [contenteditable] .code-block code {
          background: transparent;
          padding: 0;
          border: none;
          color: inherit;
          font-size: inherit;
        }
        
        .dark [contenteditable] pre,
        .dark [contenteditable] .code-block {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-color: #334155;
          color: #f1f5f9;
        }
        
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
          text-decoration-color: #93c5fd;
          text-underline-offset: 2px;
          transition: all 0.2s ease;
        }
        
        [contenteditable] a:hover {
          color: #2563eb;
          text-decoration-color: #3b82f6;
        }
        
        .dark [contenteditable] a {
          color: #60a5fa;
          text-decoration-color: #3b82f6;
        }
        
        .dark [contenteditable] a:hover {
          color: #93c5fd;
          text-decoration-color: #60a5fa;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        [contenteditable] strong,
        [contenteditable] b {
          font-weight: 600;
          color: inherit;
        }
        
        [contenteditable] em,
        [contenteditable] i {
          font-style: italic;
          color: inherit;
        }
        
        [contenteditable] u {
          text-decoration: underline;
          text-underline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
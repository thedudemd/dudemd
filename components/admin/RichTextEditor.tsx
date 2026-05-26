'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function RichTextEditor({ content, onChange }: { content: string, onChange: (html: string) => void }) {
  const [showHtml, setShowHtml] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'editor-link' } }),
      Image.configure({ HTMLAttributes: { class: 'editor-image', style: 'max-width: 100%; height: auto; margin: 1rem 0;' } }),
      Table.configure({ resizable: true, HTMLAttributes: { class: 'editor-table' } }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: 'Start writing your page content...' }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  })

  if (!editor) return null

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `pages/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('media').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      editor.chain().focus().setImage({ src: data.publicUrl }).run()
    } else {
      alert('Upload failed: ' + error.message)
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function setLink() {
    const url = window.prompt('URL:')
    if (url === null) return
    if (url === '') editor.chain().focus().extendMarkRange('link').unsetLink().run()
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const btn = (active: boolean) => ({
    padding: '0.5rem 0.75rem',
    fontSize: '13px',
    fontWeight: 600,
    backgroundColor: active ? '#0e1a2b' : 'transparent',
    color: active ? '#f7f4ee' : '#4A5563',
    border: 'none',
    cursor: 'pointer',
    borderRight: '1px solid #e8e4de',
  })

  return (
    <div style={{ border: '1px solid #e8e4de', backgroundColor: '#fff' }}>
      {/* TOOLBAR */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid #e8e4de', backgroundColor: '#f7f4ee' }}>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={btn(editor.isActive('bold'))} title="Bold">B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={{ ...btn(editor.isActive('italic')), fontStyle: 'italic' }} title="Italic">I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} style={{ ...btn(editor.isActive('underline')), textDecoration: 'underline' }} title="Underline">U</button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} style={{ ...btn(editor.isActive('strike')), textDecoration: 'line-through' }} title="Strikethrough">S</button>
        <span style={{ width: 1, height: 24, backgroundColor: '#e8e4de', margin: '0 0.25rem' }} />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={btn(editor.isActive('heading', { level: 1 }))} title="Heading 1">H1</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={btn(editor.isActive('heading', { level: 2 }))} title="Heading 2">H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} style={btn(editor.isActive('heading', { level: 3 }))} title="Heading 3">H3</button>
        <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} style={btn(editor.isActive('paragraph'))} title="Paragraph">P</button>
        <span style={{ width: 1, height: 24, backgroundColor: '#e8e4de', margin: '0 0.25rem' }} />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={btn(editor.isActive('bulletList'))} title="Bullet List">• List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btn(editor.isActive('orderedList'))} title="Numbered List">1. List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} style={btn(editor.isActive('blockquote'))} title="Quote">❝</button>
        <span style={{ width: 1, height: 24, backgroundColor: '#e8e4de', margin: '0 0.25rem' }} />
        <button type="button" onClick={setLink} style={btn(editor.isActive('link'))} title="Link">🔗 Link</button>
        <button type="button" onClick={() => fileRef.current?.click()} style={btn(false)} disabled={uploading} title="Insert Image">{uploading ? '...' : '🖼 Image'}</button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadImage} />
        <span style={{ width: 1, height: 24, backgroundColor: '#e8e4de', margin: '0 0.25rem' }} />
        <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} style={btn(false)} title="Insert Table">⊞ Table</button>
        {editor.isActive('table') && (
          <>
            <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} style={btn(false)} title="Add Row">+ Row</button>
            <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} style={btn(false)} title="Add Column">+ Col</button>
            <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} style={btn(false)} title="Delete Table">× Tbl</button>
          </>
        )}
        <span style={{ width: 1, height: 24, backgroundColor: '#e8e4de', margin: '0 0.25rem' }} />
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} style={btn(false)} title="Divider">— HR</button>
        <button type="button" onClick={() => editor.chain().focus().undo().run()} style={btn(false)} title="Undo">↶</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} style={btn(false)} title="Redo">↷</button>
        <span style={{ marginLeft: 'auto', display: 'flex' }}>
          <button type="button" onClick={() => setShowHtml(!showHtml)} style={btn(showHtml)} title="Toggle HTML">{showHtml ? '✕ HTML' : '⟨/⟩ HTML'}</button>
        </span>
      </div>

      {/* EDITOR / HTML */}
      {showHtml ? (
        <textarea
          value={editor.getHTML()}
          onChange={e => editor.commands.setContent(e.target.value)}
          style={{ width: '100%', minHeight: 320, padding: '1rem', border: 'none', outline: 'none', fontFamily: 'monospace', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
        />
      ) : (
        <div style={{ minHeight: 320, padding: '1rem', cursor: 'text' }} onClick={() => editor.chain().focus().run()}>
          <EditorContent editor={editor} />
        </div>
      )}

      <style jsx global>{`
        .ProseMirror { outline: none; min-height: 280px; font-size: 15px; line-height: 1.7; color: #0e1a2b; }
        .ProseMirror h1 { font-family: Georgia, serif; font-size: 2rem; font-weight: 700; margin: 1.5rem 0 1rem; }
        .ProseMirror h2 { font-family: Georgia, serif; font-size: 1.5rem; font-weight: 700; margin: 1.25rem 0 0.75rem; }
        .ProseMirror h3 { font-family: Georgia, serif; font-size: 1.2rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .ProseMirror p { margin: 0.5rem 0; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; margin: 0.5rem 0; }
        .ProseMirror blockquote { border-left: 3px solid #c9b28f; padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #4A5563; }
        .ProseMirror a { color: #c9b28f; text-decoration: underline; }
        .ProseMirror table { border-collapse: collapse; margin: 1rem 0; width: 100%; }
        .ProseMirror th, .ProseMirror td { border: 1px solid #e8e4de; padding: 0.5rem 0.75rem; }
        .ProseMirror th { background-color: #f7f4ee; font-weight: 700; }
        .ProseMirror img { max-width: 100%; height: auto; margin: 1rem 0; }
        .ProseMirror p.is-editor-empty:first-child::before { color: #9a9085; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
      `}</style>
    </div>
  )
}

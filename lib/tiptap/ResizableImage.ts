import { Node, mergeAttributes } from '@tiptap/core'

export const ResizableImage = Node.create({
  name: 'image',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: '100%' },
      style: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'img[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ({ node, updateAttributes, selected }) => {
      const wrapper = document.createElement('div')
      wrapper.style.cssText = 'position:relative;display:inline-block;max-width:100%;'
      
      const img = document.createElement('img')
      img.src = node.attrs.src
      if (node.attrs.alt) img.alt = node.attrs.alt
      if (node.attrs.title) img.title = node.attrs.title
      img.style.cssText = 'display:block;width:' + (node.attrs.width || '100%') + ';max-width:100%;height:auto;'
      if (node.attrs.style) img.style.cssText += node.attrs.style

      const toolbar = document.createElement('div')
      toolbar.style.cssText = 'position:absolute;top:8px;right:8px;display:none;gap:4px;background:rgba(14,26,43,0.85);padding:4px 6px;border-radius:3px;'
      
      const sizes = [
        { label: 'S', width: '25%' },
        { label: 'M', width: '50%' },
        { label: 'L', width: '75%' },
        { label: '↔', width: '100%' },
      ]

      sizes.forEach(({ label, width }) => {
        const btn = document.createElement('button')
        btn.textContent = label
        btn.type = 'button'
        btn.style.cssText = 'background:none;border:1px solid rgba(247,244,238,0.4);color:#f7f4ee;font-size:10px;font-weight:700;padding:2px 5px;cursor:pointer;letter-spacing:0.05em;'
        btn.onclick = (e) => {
          e.preventDefault()
          e.stopPropagation()
          updateAttributes({ width })
          img.style.width = width
        }
        toolbar.appendChild(btn)
      })

      wrapper.appendChild(img)
      wrapper.appendChild(toolbar)

      wrapper.onmouseenter = () => { toolbar.style.display = 'flex' }
      wrapper.onmouseleave = () => { toolbar.style.display = 'none' }

      return { dom: wrapper, update: (updatedNode) => {
        img.src = updatedNode.attrs.src
        img.style.width = updatedNode.attrs.width || '100%'
        return true
      }}
    }
  },
})

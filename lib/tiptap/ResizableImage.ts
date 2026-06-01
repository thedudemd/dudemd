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
    }
  },

  parseHTML() {
    return [{ tag: 'img[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes, { style: 'width:' + (HTMLAttributes.width || '100%') + ';max-width:100%;height:auto;display:block;' })]
  },

  addNodeView() {
    return ({ node, updateAttributes }) => {
      const wrapper = document.createElement('div')
      wrapper.style.cssText = 'position:relative;display:block;max-width:100%;'

      const img = document.createElement('img')
      img.src = node.attrs.src
      if (node.attrs.alt) img.alt = node.attrs.alt
      if (node.attrs.title) img.title = node.attrs.title
      img.style.cssText = 'display:block;width:' + (node.attrs.width || '100%') + ';max-width:100%;height:auto;'

      const handle = document.createElement('div')
      handle.style.cssText = 'position:absolute;bottom:4px;right:4px;width:16px;height:16px;background:#0e1a2b;cursor:se-resize;border:2px solid #c9b28f;border-radius:2px;z-index:10;'

      handle.addEventListener('mousedown', (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        const startX = e.clientX
        const startWidth = img.offsetWidth
        const parentWidth = wrapper.parentElement ? wrapper.parentElement.offsetWidth : 800
        let isDragging = true

        const onMouseMove = (e) => {
          if (!isDragging) return
          const diff = e.clientX - startX
          const newWidth = Math.max(50, Math.min(startWidth + diff, parentWidth))
          img.style.width = newWidth + 'px'
        }

        const onMouseUp = (e) => {
          if (!isDragging) return
          isDragging = false
          const finalWidth = img.offsetWidth
          const pct = Math.round((finalWidth / parentWidth) * 100)
          img.style.width = pct + '%'
          updateAttributes({ width: pct + '%' })
          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      })

      wrapper.appendChild(img)
      wrapper.appendChild(handle)

      return {
        dom: wrapper,
        update: (updatedNode) => {
          img.src = updatedNode.attrs.src
          img.style.width = updatedNode.attrs.width || '100%'
          return true
        }
      }
    }
  },
})

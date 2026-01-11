import Image from '@tiptap/extension-image'

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('src'),
        renderHTML: (attributes) => {
          if (!attributes.src) {
            return {}
          }
          return {
            src: attributes.src,
            loading: 'lazy',
            decoding: 'async',
          }
        },
      },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute('alt'),
        renderHTML: (attributes) => {
          if (!attributes.alt) {
            return {}
          }
          return {
            alt: attributes.alt,
          }
        },
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('title'),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {}
          }
          return {
            title: attributes.title,
          }
        },
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute('width') || element.style.width
          return width ? Number.parseInt(width) : null
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {}
          }
          return {
            width: `${attributes.width}px`,
            style: `width: ${attributes.width}px`,
          }
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute('height') || element.style.height
          if (!height) return null
          if (height === 'auto') return 'auto'
          return Number.parseInt(height)
        },
        renderHTML: (attributes) => {
          if (!attributes.height || attributes.height === 'auto') {
            return {}
          }
          return {
            height: `${attributes.height}px`,
            style: `height: ${attributes.height}px`,
          }
        },
      },
    }
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = document.createElement('div')
      container.classList.add('image-resizer-container')
      container.setAttribute('data-drag-handle', '')

      const img = document.createElement('img')

      // Set src first (most important)
      if (node.attrs.src) {
        img.src = node.attrs.src
      }

      if (node.attrs.alt) {
        img.alt = node.attrs.alt
      }

      if (node.attrs.title) {
        img.title = node.attrs.title
      }

      // Optimize image loading
      img.loading = 'lazy'
      img.decoding = 'async'

      // Set dimensions
      if (node.attrs.width) {
        const width =
          typeof node.attrs.width === 'number'
            ? `${node.attrs.width}px`
            : node.attrs.width
        img.style.width = width
      } else {
        img.style.maxWidth = '100%'
      }

      if (node.attrs.height && node.attrs.height !== 'auto') {
        const height =
          typeof node.attrs.height === 'number'
            ? `${node.attrs.height}px`
            : node.attrs.height
        img.style.height = height
      } else {
        img.style.height = 'auto'
      }

      container.appendChild(img)

      const resizeHandleRight = document.createElement('div')
      resizeHandleRight.classList.add(
        'image-resizer-handle',
        'image-resizer-handle-right'
      )
      resizeHandleRight.setAttribute('contenteditable', 'false')
      container.appendChild(resizeHandleRight)

      const resizeHandleLeft = document.createElement('div')
      resizeHandleLeft.classList.add(
        'image-resizer-handle',
        'image-resizer-handle-left'
      )
      resizeHandleLeft.setAttribute('contenteditable', 'false')
      container.appendChild(resizeHandleLeft)

      let startX = 0
      let startWidth = 0
      let isResizing = false
      let currentHandle: 'left' | 'right' | null = null

      const handleMouseDown = (e: MouseEvent, handle: 'left' | 'right') => {
        if (!editor.isEditable) return

        e.preventDefault()
        e.stopPropagation()

        isResizing = true
        currentHandle = handle
        startX = e.clientX
        startWidth = img.offsetWidth
        container.classList.add('resizing')

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      }

      const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing || !currentHandle) return

        e.preventDefault()

        let deltaX = e.clientX - startX

        // Inverse delta for left handle
        if (currentHandle === 'left') {
          deltaX = -deltaX
        }

        const newWidth = Math.max(100, Math.min(startWidth + deltaX, 1200))

        img.style.width = `${newWidth}px`
        img.style.height = 'auto'
      }

      const handleMouseUp = (e: MouseEvent) => {
        if (!isResizing) return

        e.preventDefault()

        isResizing = false
        currentHandle = null
        container.classList.remove('resizing')

        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)

        // Update the node attributes
        const pos = getPos()
        if (typeof pos === 'number') {
          editor
            .chain()
            .focus()
            .setNodeSelection(pos)
            .updateAttributes('image', {
              width: img.offsetWidth,
              height: 'auto',
            })
            .run()
        }
      }

      resizeHandleRight.addEventListener('mousedown', (e) =>
        handleMouseDown(e, 'right')
      )
      resizeHandleLeft.addEventListener('mousedown', (e) =>
        handleMouseDown(e, 'left')
      )

      container.addEventListener('click', () => {
        if (!editor.isEditable) return
        const pos = getPos()
        if (typeof pos === 'number') {
          editor.chain().focus().setNodeSelection(pos).run()
        }
      })

      return {
        dom: container,
        contentDOM: null,
        ignoreMutation: (mutation) => {
          // Ignore all mutations inside the container
          return container.contains(mutation.target)
        },
        selectNode: () => {
          container.classList.add('is-selected')
        },
        deselectNode: () => {
          container.classList.remove('is-selected')
        },
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'image') {
            return false
          }

          // Update src
          if (
            updatedNode.attrs.src &&
            updatedNode.attrs.src !== node.attrs.src
          ) {
            img.src = updatedNode.attrs.src
          }

          // Update dimensions
          if (updatedNode.attrs.width) {
            const width =
              typeof updatedNode.attrs.width === 'number'
                ? `${updatedNode.attrs.width}px`
                : updatedNode.attrs.width
            img.style.width = width
          }

          if (updatedNode.attrs.height && updatedNode.attrs.height !== 'auto') {
            const height =
              typeof updatedNode.attrs.height === 'number'
                ? `${updatedNode.attrs.height}px`
                : updatedNode.attrs.height
            img.style.height = height
          } else {
            img.style.height = 'auto'
          }

          return true
        },
      }
    }
  },
})

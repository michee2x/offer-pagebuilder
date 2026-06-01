import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { ReferenceLink } from '@/components/intelligence/ReferenceLink'

export const ReferenceExtension = Node.create({
  name: 'reference',

  group: 'block',

  atom: false,
  
  content: 'inline*',

  addAttributes() {
    return {
      url: {
        default: '',
      },
      domain: {
        default: '',
      },
      title: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'reference',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['reference', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer((props) => {
      const { url, domain, title } = props.node.attrs
      return (
        <NodeViewWrapper>
           <div className="my-2 relative group" contentEditable={false}>
            <div className={props.selected ? "ring-2 ring-indigo-500 rounded-lg transition-all" : "transition-all"}>
              <ReferenceLink url={url} domain={domain} title={title || props.node.textContent} />
            </div>
          </div>
        </NodeViewWrapper>
      )
    })
  },
})

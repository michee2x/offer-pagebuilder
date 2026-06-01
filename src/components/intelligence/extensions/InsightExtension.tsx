import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { InsightCard } from '@/components/intelligence/InsightCard'

export const InsightExtension = Node.create({
  name: 'insight',

  group: 'block',

  content: 'inline*',

  // Not an atom because it contains content
  atom: false,

  addAttributes() {
    return {
      value: {
        default: '',
      },
      title: {
        default: 'Key Insight',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'insight',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['insight', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer((props) => {
      const { value, title } = props.node.attrs
      // We pass the inner content of the node as children
      return (
        <NodeViewWrapper>
           <div className="my-4 relative group" contentEditable={false}>
            <div className={props.selected ? "ring-2 ring-indigo-500 rounded-xl transition-all" : "transition-all"}>
              <InsightCard value={value} title={title}>
                <span className="text-white/80" dangerouslySetInnerHTML={{ __html: props.node.textContent }} />
              </InsightCard>
            </div>
          </div>
        </NodeViewWrapper>
      )
    })
  },
})

import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { DynamicChart } from '@/components/intelligence/DynamicChart'

export const ChartExtension = Node.create({
  name: 'chart',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      type: {
        default: 'bar',
      },
      data: {
        default: '[]',
      },
      title: {
        default: '',
      },
      summary: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'chart',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['chart', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer((props) => {
      const { type, data, title, summary } = props.node.attrs
      
      return (
        <NodeViewWrapper>
          <div className="my-6 relative group" contentEditable={false}>
            <div className={props.selected ? "ring-2 ring-indigo-500 rounded-2xl transition-all" : "transition-all"}>
              <DynamicChart 
                type={type} 
                data={data} 
                title={title} 
                summary={summary} 
              />
            </div>
          </div>
        </NodeViewWrapper>
      )
    })
  },
})

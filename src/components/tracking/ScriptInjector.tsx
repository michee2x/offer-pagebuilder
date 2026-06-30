'use client'

import { useEffect } from 'react'

interface ScriptInjectorProps {
  headCode?: string
  bodyCode?: string
}

/**
 * Properly injects and EXECUTES arbitrary tracking scripts (e.g. GA4, Meta Pixel).
 *
 * Why this component exists:
 * dangerouslySetInnerHTML does NOT execute <script> tags — browsers only run
 * scripts that are created via document.createElement('script') and appended
 * to the DOM. This component does exactly that after React hydration.
 */
export function ScriptInjector({ headCode, bodyCode }: ScriptInjectorProps) {
  useEffect(() => {
    if (headCode) injectScripts(headCode, document.head)
  }, [headCode])

  useEffect(() => {
    if (bodyCode) injectScripts(bodyCode, document.body)
  }, [bodyCode])

  return null
}

function injectScripts(html: string, target: HTMLElement) {
  // Parse the raw HTML string into DOM nodes
  const template = document.createElement('template')
  template.innerHTML = html

  template.content.childNodes.forEach((node) => {
    if (node.nodeName === 'SCRIPT') {
      const oldScript = node as HTMLScriptElement
      const newScript = document.createElement('script')

      // Copy all attributes (e.g. async, src, type, id)
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value)
      })

      // Copy inline script content
      if (oldScript.textContent) {
        newScript.textContent = oldScript.textContent
      }

      target.appendChild(newScript)
    } else {
      // Non-script nodes (e.g. <noscript>) — safe to clone directly
      target.appendChild(node.cloneNode(true))
    }
  })
}

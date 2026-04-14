'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ResponsiveIframeProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  themeHtml?: string;
}

export function ResponsiveIframe({ children, className, style, themeHtml }: ResponsiveIframeProps) {
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);
  const mountNode = iframeRef?.contentWindow?.document?.body;

  useEffect(() => {
    if (!iframeRef || !iframeRef.contentWindow) return;
    const doc = iframeRef.contentWindow.document;
    
    // Copy all style tags and links from parent document to iframe (needed for Tailwind)
    const styleLinks = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
    styleLinks.forEach(el => {
      if (!doc.head.innerHTML.includes(el.outerHTML)) {
         doc.head.appendChild(el.cloneNode(true));
      }
    });
    
    // Copy HTML classes (like dark mode 'dark' class)
    // eslint-disable-next-line react-hooks/immutability
    doc.documentElement.className = document.documentElement.className;
    
  }, [iframeRef, themeHtml]); // re-run if themeHtml changes to keep it in sync

  // It's critical to inject the local iframe animations/fonts if provided
  return (
      <iframe
        ref={setIframeRef}
        className={className}
        style={{ ...style, border: 'none', backgroundColor: 'transparent' }}
        title="Responsive Preview"
      >
        {mountNode && createPortal(
          <>
            <div dangerouslySetInnerHTML={{ __html: themeHtml || '' }} />
            <style>
              {`
                /* Hide scrollbar for Chrome, Safari and Opera */
                ::-webkit-scrollbar {
                  display: none;
                }
                /* Hide scrollbar for IE, Edge and Firefox */
                html {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                body {
                  overflow-x: hidden;
                }
              `}
            </style>
            {children}
          </>, 
          mountNode
        )}
      </iframe>
  );
}

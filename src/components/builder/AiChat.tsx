'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ComponentInstance, useBuilderStore } from '@/store/builderStore';
import { ComponentConfig } from '@/config/components';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, ImagePlus, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { MediaPickerModal } from './ImagePickerModal';

interface AiChatProps {
  componentId: string;
  componentData: ComponentInstance;
  config: ComponentConfig;
  selectedField?: string | null;
}

export function AiChat({ componentId, componentData, config, selectedField }: AiChatProps) {
  const { updateProps } = useBuilderStore();
  const [inputValue, setInputValue] = useState('');
  const [isImagesOpen, setIsImagesOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      // Inject component context into every request body
      prepareSendMessagesRequest: ({ messages, id }) => ({
        body: {
          id,
          messages,
          componentContext: {
            id: componentId,
            type: componentData.type,
            props: componentData.props,
            availableFields: config.fields,
            focusedField: selectedField,
          },
        },
      }),
    }),
    onFinish: (event: any) => {
      // In this older AI SDK version, onFinish receives an event object with { message }
      const message = event?.message || event;
      
      // Log full message to diagnose tool call flow
      console.log('[AiChat] onFinish message:', JSON.stringify(message, null, 2));

      // Try extracting from toolInvocations first (standard Vercel AI SDK)
      const toolInvocations = message.toolInvocations ?? [];
      for (const ti of toolInvocations) {
        if (ti.result?.updatedProps) {
          console.log('[AiChat] Applying updatedProps from toolInvocations:', ti.result.updatedProps);
          updateProps(componentId, ti.result.updatedProps);
          return;
        }
      }

      const parts = message.parts ?? [];
      console.log('[AiChat] parts count:', parts.length);
      
      // Try extracting the tool result from any part type that has updatedProps (fallback)
      for (const part of parts as any[]) {
        // Check if the args contain the props
        if (part?.type === 'tool-invocation' && part?.args?.props) {
          console.log('[AiChat] Applying props from part.args.props:', part.args.props);
          updateProps(componentId, part.args.props);
          return;
        }

        const result = part?.result ?? part?.output;
        if (result?.updatedProps) {
          console.log('[AiChat] Applying updatedProps from parts:', result.updatedProps);
          updateProps(componentId, result.updatedProps);
          return;
        }
      }
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ role: 'user', parts: [{ type: 'text', text: inputValue.trim() }] });
    setInputValue('');
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full justify-between items-stretch bg-[#0a0d14] text-white">
      <ScrollArea className="flex-1 p-5 h-[calc(100vh-250px)] scrollbar-thin scrollbar-thumb-white/10">
        <div className="flex flex-col gap-6">
          <div className="text-center pb-4 border-b border-white/5 mb-2">
            <p className="text-xs text-white/50">
              Chat with AI to edit <span className="font-semibold text-brand-yellow bg-brand-yellow/10 px-1.5 py-0.5 rounded-md">{config.type}</span>
              {selectedField && <><br/><span className="inline-block mt-1">Targeting: <span className="text-white font-mono bg-white/10 px-1 rounded">{selectedField}</span></span></>}
            </p>
          </div>

          {messages.map((m: any) => {
            // v3 messages expose content via `parts` or `content`
            const textContent = m.content || (m.parts ?? [])
              .filter((p: any) => p.type === 'text')
              .map((p: any) => p.text)
              .join('');

            const toolParts = m.toolInvocations || (m.parts ?? []).filter(
              (p: any) => p.type === 'tool-invocation' || p.type === 'tool-result'
            );

            return (
              <div
                key={m.id}
                className={`flex gap-3 text-sm ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-yellow to-amber-500 flex items-center justify-center text-black shrink-0 shadow-[0_2px_10px_rgba(245,166,35,0.3)]">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 max-w-[85%] text-[14px] leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-brand-indigo text-white rounded-tr-sm shadow-[0_4px_14px_rgba(99,102,241,0.3)]'
                      : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm backdrop-blur-md'
                  }`}
                >
                  {textContent}
                  {toolParts.map((part: any, i: number) => (
                    <div key={i} className="mt-2 text-xs italic text-white/50 bg-black/20 rounded p-2 border border-white/5">
                      {part.state === 'call' || part.type === 'tool-invocation' ? '⏳ Applying changes...' : '✓ Changes applied'}
                    </div>
                  ))}
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-brand-indigo flex items-center justify-center text-white shrink-0 shadow-lg">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 text-sm justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-yellow/50 to-amber-500/50 flex items-center justify-center text-brand-yellow shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center space-x-1.5 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-bounce [animation-delay:-0.3s]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="p-4 bg-[#0a0d14] border-t border-white/10 shrink-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="text-[11px] font-medium text-white/40 flex justify-between uppercase tracking-wider">
            <span>Target Element</span>
            <span className="font-mono bg-white/5 text-white/70 px-1.5 py-0.5 rounded border border-white/10">
              {config.type} {selectedField ? `→ ${selectedField}` : ''}
            </span>
          </div>
          <div className="relative flex items-center bg-[#131826] border border-white/10 rounded-2xl shadow-xl overflow-hidden p-1.5 focus-within:border-brand-indigo/50 focus-within:ring-1 focus-within:ring-brand-indigo/50 transition-all">
            <button
              type="button"
              onClick={() => setIsImagesOpen(true)}
              className="ml-1 p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors shrink-0"
            >
              <ImagePlus className="w-4 h-4" />
            </button>

            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. Rewrite this to convert better"
              className="flex-1 bg-transparent border-none px-3 py-2 text-sm text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e as any);
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !inputValue.trim()}
              className="w-9 h-9 rounded-xl bg-brand-indigo hover:bg-brand-indigo/90 text-white shrink-0 ml-1 transition-all disabled:opacity-50 disabled:bg-white/10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      <MediaPickerModal
        open={isImagesOpen}
        onClose={() => setIsImagesOpen(false)}
        mediaType="any"
        onSelect={(url) => {
          const filename = url.split('/').pop() || 'media';
          setInputValue((prev) => `${prev} @[${filename}](${url}) `);
          setIsImagesOpen(false);
        }}
      />
    </div>
  );
}

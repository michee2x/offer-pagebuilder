'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ComponentInstance, useBuilderStore } from '@/store/builderStore';
import { ComponentConfig } from '@/config/components';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User } from 'lucide-react';

interface AiChatProps {
  componentId: string;
  componentData: ComponentInstance;
  config: ComponentConfig;
}

export function AiChat({ componentId, componentData, config }: AiChatProps) {
  const { updateProps } = useBuilderStore();
  const [inputValue, setInputValue] = useState('');
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
          },
        },
      }),
    }),
    onFinish: ({ message }) => {
      // Log full message to diagnose tool call flow
      console.log('[AiChat] onFinish message:', JSON.stringify(message, null, 2));

      const parts = message.parts ?? [];
      console.log('[AiChat] parts count:', parts.length);
      parts.forEach((p: any, i: number) => {
        console.log(`[AiChat] part[${i}]:`, JSON.stringify(p, null, 2));
      });

      // Try extracting the tool result from any part type that has updatedProps
      for (const part of parts as any[]) {
        const result = part?.result ?? part?.output;
        if (result?.updatedProps) {
          console.log('[AiChat] Applying updatedProps:', result.updatedProps);
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
    <div className="flex flex-col h-full justify-between items-stretch">
      <ScrollArea className="flex-1 p-4 h-[calc(100vh-250px)]">
        <div className="flex flex-col gap-4">
          <p className="text-xs text-center text-muted-foreground pb-2">
            Chat with Claude to edit <span className="font-medium">{config.label}</span>
          </p>

          {messages.map((m) => {
            // v3 messages expose content via `parts`
            const textContent = (m.parts ?? [])
              .filter((p: any) => p.type === 'text')
              .map((p: any) => p.text)
              .join('');

            const toolParts = (m.parts ?? []).filter(
              (p: any) => p.type === 'tool-invocation' || p.type === 'tool-result'
            );

            return (
              <div
                key={m.id}
                className={`flex gap-2 text-sm ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`rounded-lg px-3 py-2 max-w-[85%] text-sm ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {textContent}
                  {toolParts.map((part: any, i) => (
                    <div key={i} className="mt-1 text-xs italic opacity-70">
                      {part.type === 'tool-invocation' && '⏳ Applying changes...'}
                      {part.type === 'tool-result' && '✓ Changes applied'}
                    </div>
                  ))}
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center text-secondary-foreground shrink-0 mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2 text-sm justify-start">
              <div className="w-7 h-7 rounded bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-muted px-4 py-3 rounded-lg flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce delay-75" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce delay-150" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background shrink-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>Targeting:</span>
            <span className="font-mono bg-muted px-1 rounded">{componentId.substring(0, 7)}...</span>
          </div>
          <div className="flex w-full items-center space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. Make the text bigger and blue"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e as any);
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !inputValue.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

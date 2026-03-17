'use client';

import React, { useState } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { COMPONENT_REGISTRY } from '@/config/components';
import { ALL_THEME_IDS, THEME_PRESETS } from '@/lib/ai-theme';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Bot, Settings2, Palette } from 'lucide-react';
import { AiChat } from './AiChat';

export function RightPanel() {
  const { selectedId, components, updateProps, removeComponent, canvasStyle, updateCanvasStyle, theme, setTheme } = useBuilderStore();

  if (!selectedId) {
    return (
      <div className="w-80 border-l bg-background p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Settings2 className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg mb-2">No Item Selected</h3>
        <p className="text-sm text-muted-foreground">Select an element on the canvas to view its properties or chat with AI.</p>
      </div>
    );
  }

  // Handle special case where the canvas background itself is selected
  if (selectedId === '__canvas__') {
    const canvasData = { id: '__canvas__', type: 'Canvas' as any, props: { style: canvasStyle }, parentId: 'root' };
    const canvasConfig = { 
      type: 'Canvas' as any, 
      label: 'Main Canvas', 
      defaultProps: {},
      render: () => null,
      fields: { backgroundColor: { type: 'color' as const, label: 'Background Color' } } 
    };
    return (
      <div className="w-80 border-l bg-background flex flex-col h-full overflow-hidden">
        <Tabs defaultValue="properties" className="w-full flex flex-col flex-1">
          <div className="px-4 pt-4 pb-2 border-b">
            <h2 className="text-lg font-semibold mb-3">Canvas Settings</h2>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="properties">Props</TabsTrigger>
              <TabsTrigger value="theme" className="gap-2"><Palette className="w-4 h-4"/></TabsTrigger>
              <TabsTrigger value="ai" className="gap-2"><Bot className="w-4 h-4"/></TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="properties" className="flex-1 overflow-y-auto p-4 m-0">
            <div className="flex flex-col gap-6">
              <div className="grid w-full max-w-sm items-center gap-2">
                <Label>Background Color</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="color" 
                    className="w-12 h-10 p-1 cursor-pointer"
                    value={canvasStyle?.backgroundColor || '#ffffff'} 
                    onChange={(e) => updateCanvasStyle({ backgroundColor: e.target.value })}
                  />
                  <Input 
                    value={canvasStyle?.backgroundColor || '#ffffff'} 
                    onChange={(e) => updateCanvasStyle({ backgroundColor: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="theme" className="flex-1 overflow-y-auto p-4 m-0">
            {theme ? (
              <div className="flex flex-col gap-6">
                <div className="grid w-full gap-2">
                  <Label>Active Theme</Label>
                  <Select value={theme.id} onValueChange={(val) => {
                    const nextTheme = THEME_PRESETS[val];
                    if (nextTheme) {
                      setTheme(nextTheme);
                      // Auto-update canvas background to match new theme
                      updateCanvasStyle({ ...canvasStyle, backgroundColor: nextTheme.palette.background });
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_THEME_IDS.map(id => (
                        <SelectItem key={id} value={id}>{THEME_PRESETS[id].name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid w-full gap-2">
                  <Label>Palette Swatches</Label>
                  <div className="flex gap-1 flex-wrap">
                    {[theme.palette.background, theme.palette.surface, theme.palette.border, theme.palette.primary, theme.palette.text].map((hex, i) => (
                      <div key={i} className="w-8 h-8 rounded-md border shadow-sm" style={{ backgroundColor: hex }} title={hex} />
                    ))}
                    <div className="w-full h-4 mt-2 rounded-sm" style={{ background: theme.palette.gradient }} />
                  </div>
                </div>

                <div className="grid w-full gap-2">
                  <Label>Typography</Label>
                  <div className="text-sm border rounded-md p-3 space-y-2 bg-muted/20">
                    <div><span className="opacity-50 text-xs uppercase tracking-wider block mb-0.5">Heading</span> <span className="font-semibold">{theme.headingFont}</span></div>
                    <div><span className="opacity-50 text-xs uppercase tracking-wider block mb-0.5">Body</span> <span>{theme.bodyFont}</span></div>
                  </div>
                </div>
                
                <div className="grid w-full gap-2">
                  <Label>Components</Label>
                  <div className="flex gap-4 text-sm mt-1">
                    <div className="flex flex-col items-center gap-1 border px-3 py-2 rounded-md bg-muted/20 w-fit">
                      <div 
                        className="w-8 h-4 border" 
                        style={{ borderRadius: theme.borderRadius === '16px' || theme.borderRadius === '14px' || theme.borderRadius === '12px' ? '6px' : theme.borderRadius }}
                      />
                      <span className="text-xs opacity-60">Cards</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 border px-3 py-2 rounded-md bg-muted/20 w-fit">
                      <div 
                        className="w-10 h-4 bg-primary" 
                        style={{ backgroundColor: theme.palette.primary, borderRadius: theme.buttonRadius }}
                      />
                      <span className="text-xs opacity-60">Buttons</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Generate a page first to view theme settings.</p>
            )}
          </TabsContent>

          <TabsContent value="ai" className="flex-1 flex flex-col p-0 m-0 overflow-hidden h-full">
            <AiChat key="__canvas__" componentId="__canvas__" componentData={canvasData} config={canvasConfig} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  const component = components[selectedId];
  if (!component) return null;

  const config = COMPONENT_REGISTRY[component.type];

  const handlePropChange = (key: string, value: any) => {
    updateProps(selectedId, { [key]: value });
  };

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full overflow-hidden">
      <Tabs defaultValue="properties" className="w-full flex flex-col flex-1">
        <div className="px-4 pt-4 pb-2 border-b">
          <h2 className="text-lg font-semibold mb-3">{config.label} Settings</h2>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="ai" className="gap-2"><Bot className="w-4 h-4"/> AI Chat</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="properties" className="flex-1 overflow-y-auto p-4 m-0">
          <div className="flex flex-col gap-6">
            {Object.entries(config.fields).map(([key, field]) => {
              if (!field) return null;
              return (
              <div key={key} className="grid w-full max-w-sm items-center gap-2">
                <Label htmlFor={key}>{field.label}</Label>
                
                {field.type === 'text' && (
                  <Input 
                    id={key} 
                    value={component.props[key] || ''} 
                    onChange={(e) => handlePropChange(key, e.target.value)}
                  />
                )}
                
                {field.type === 'textarea' && (
                  <Textarea 
                    id={key}
                    rows={4}
                    value={component.props[key] || ''} 
                    onChange={(e) => handlePropChange(key, e.target.value)}
                  />
                )}
                
                {field.type === 'color' && (
                  <div className="flex gap-2 items-center">
                    <Input 
                      id={key} 
                      type="color" 
                      className="w-12 h-10 p-1 cursor-pointer"
                      value={component.props[key] || '#000000'} 
                      onChange={(e) => handlePropChange(key, e.target.value)}
                    />
                    <Input 
                      value={component.props[key] || '#000000'} 
                      onChange={(e) => handlePropChange(key, e.target.value)}
                    />
                  </div>
                )}
                
                {field.type === 'select' && field.options && (
                  <Select 
                    value={component.props[key] || ''} 
                    onValueChange={(val) => handlePropChange(key, val)}
                  >
                    <SelectTrigger id={key}>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              );
            })}

            <div className="pt-6 border-t mt-4 gap-2 flex">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => removeComponent(selectedId)}
              >
                Delete Component
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="flex-1 flex flex-col p-0 m-0 overflow-hidden h-full">
          <AiChat key={selectedId} componentId={selectedId} componentData={component} config={config} />
        </TabsContent>

      </Tabs>
    </div>
  );
}

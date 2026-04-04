'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { COMPONENT_REGISTRY } from '@/config/components';
import { ALL_SHADCN_THEME_IDS, SHADCN_THEMES } from '@/lib/themes';
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
import { Bot, Settings2, Palette, Check, ImageIcon } from 'lucide-react';
import { AiChat } from './AiChat';
import { ArrayEditor } from './ArrayEditor';
import { ImagePickerModal } from './ImagePickerModal';
import { cn } from '@/lib/utils';

// ─── Theme swatch card ───────────────────────────────────────────────────────
function ThemeCard({
  themeId,
  isActive,
  onClick,
}: {
  themeId: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const t = SHADCN_THEMES[themeId];
  // Convert HSL string "H S% L%" to a usable CSS color
  const hsl = (val: string) => `hsl(${val})`;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col gap-2 rounded-xl border p-3 text-left transition-all hover:border-primary/60 hover:shadow-md focus:outline-none',
        isActive
          ? 'border-primary ring-2 ring-primary/30 shadow-sm'
          : 'border-border'
      )}
    >
      {/* Colour swatches */}
      <div className="flex gap-1 h-8">
        <div
          className="flex-1 rounded-md"
          style={{ backgroundColor: hsl(t.vars.background) }}
        />
        <div
          className="w-5 rounded-md"
          style={{ backgroundColor: hsl(t.vars.primary) }}
        />
        <div
          className="w-5 rounded-md"
          style={{ backgroundColor: hsl(t.vars.secondary) }}
        />
        <div
          className="w-5 rounded-md"
          style={{ backgroundColor: hsl(t.vars.accent) }}
        />
      </div>

      {/* Name & category */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-semibold leading-none">{t.name}</span>
        {isActive && (
          <Check className="w-3.5 h-3.5 text-primary shrink-0" />
        )}
      </div>
      <span className="text-[10px] text-muted-foreground capitalize">{t.category}</span>
    </button>
  );
}

// ─── RightPanel ──────────────────────────────────────────────────────────────
export function RightPanel() {
  const { selectedId, selectedField, components, updateProps, removeComponent, canvasStyle, updateCanvasStyle, theme, setTheme } =
    useBuilderStore();

  // ── Image picker modal state ────────────────────────────────────────────────
  // Tracks which prop key the modal is replacing (so onSelect knows where to write)
  const [pickerPropKey, setPickerPropKey] = React.useState<string | null>(null);

  if (!selectedId) {
    return (
      <div className="w-80 border-l bg-background p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Settings2 className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg mb-2">No Item Selected</h3>
        <p className="text-sm text-muted-foreground">
          Select an element on the canvas to view its properties or chat with AI.
        </p>
      </div>
    );
  }

  // Canvas selected → show canvas settings + theme picker
  if (selectedId === '__canvas__') {
    const canvasData = {
      id: '__canvas__',
      type: 'Canvas' as any,
      props: { style: canvasStyle },
      parentId: 'root',
    };
    const canvasConfig = {
      type: 'Canvas' as any,
      label: 'Main Canvas',
      defaultProps: {},
      render: () => null,
      fields: {
        backgroundColor: { type: 'color' as const, label: 'Background Color' },
      },
    };

    return (
      <div className="w-80 border-l bg-background flex flex-col h-full overflow-hidden">
        <Tabs defaultValue="theme" className="w-full flex flex-col flex-1">
          <div className="px-4 pt-4 pb-2 border-b">
            <h2 className="text-lg font-semibold mb-3">Canvas Settings</h2>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="theme" className="gap-2">
                <Palette className="w-4 h-4" /> Theme
              </TabsTrigger>
              <TabsTrigger value="properties">Props</TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Bot className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── THEME PICKER ── */}
          <TabsContent value="theme" className="flex-1 overflow-y-auto p-4 m-0">
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                Choose a theme. Changes apply to the page canvas in real-time.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ALL_SHADCN_THEME_IDS.map((id) => (
                  <ThemeCard
                    key={id}
                    themeId={id}
                    isActive={theme?.id === id}
                    onClick={() => setTheme(SHADCN_THEMES[id])}
                  />
                ))}
              </div>

              {theme && (
                <div className="mt-2 p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Active: {theme.name}
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Heading: <span className="text-foreground font-medium">{theme.headingFont}</span></div>
                    <div>Body: <span className="text-foreground font-medium">{theme.bodyFont}</span></div>
                    <div>Radius: <span className="text-foreground font-medium">{theme.vars.radius}</span></div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── CANVAS PROPS ── */}
          <TabsContent value="properties" className="flex-1 overflow-y-auto p-4 m-0">
            <div className="flex flex-col gap-6">
              <div className="grid w-full max-w-sm items-center gap-2">
                <Label>Background Color Override</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    className="w-12 h-10 p-1 cursor-pointer"
                    value={canvasStyle?.backgroundColor || '#ffffff'}
                    onChange={(e) => updateCanvasStyle({ backgroundColor: e.target.value })}
                  />
                  <Input
                    value={canvasStyle?.backgroundColor || ''}
                    placeholder="Overrides theme bg"
                    onChange={(e) => updateCanvasStyle({ backgroundColor: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── AI CHAT ── */}
          <TabsContent value="ai" className="flex-1 flex flex-col p-0 m-0 overflow-hidden h-full">
            <AiChat
              key="__canvas__"
              componentId="__canvas__"
              componentData={canvasData}
              config={canvasConfig}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Component selected
  const component = components[selectedId];
  if (!component) return null;

  const config = COMPONENT_REGISTRY[component.type];

  const handlePropChange = (key: string, value: any) => {
    updateProps(selectedId, { [key]: value });
  };

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full overflow-hidden">
      <Tabs defaultValue="properties" className="w-full flex flex-col flex-1 min-h-0">
        <div className="px-4 pt-4 pb-2 border-b">
          <h2 className="text-lg font-semibold mb-3">{config.label} Settings</h2>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Bot className="w-4 h-4" /> AI Chat
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="properties" className="flex-1 overflow-y-auto min-h-0 p-4 m-0">
          <div className="flex flex-col gap-6">
            {Object.entries(config.fields).map(([key, field]) => {
              if (!field) return null;

              if (field.type === 'array' && field.arrayFields) {
                return (
                  <ArrayEditor
                    key={key}
                    label={field.label}
                    items={component.props[key] || []}
                    arrayFields={field.arrayFields}
                    onChange={(newItems) => handlePropChange(key, newItems)}
                  />
                );
              }

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

                  {field.type === 'image' && (
                    <div className="flex flex-col gap-2">
                      {/* Thumbnail preview */}
                      {component.props[key] && (
                        <div className="relative w-full h-28 rounded-lg overflow-hidden border border-border bg-muted/30">
                          <img
                            src={component.props[key]}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {/* Open picker modal */}
                      <button
                        onClick={() => setPickerPropKey(key)}
                        className="flex items-center gap-2 justify-center px-3 py-2 rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/60 hover:bg-muted/40 transition-all"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        {component.props[key] ? 'Change Image' : 'Add Image'}
                      </button>
                    </div>
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
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              );
            })}

            <div className="pt-6 border-t mt-4">
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
          <AiChat
            key={selectedId}
            componentId={selectedId}
            componentData={component}
            config={config}
            selectedField={selectedField}
          />
        </TabsContent>
      </Tabs>

      <ImagePickerModal
        open={pickerPropKey !== null}
        onClose={() => setPickerPropKey(null)}
        onSelect={(url) => {
          if (pickerPropKey) {
            updateProps(selectedId, { [pickerPropKey]: url });
            setPickerPropKey(null);
          }
        }}
      />
    </div>
  );
}

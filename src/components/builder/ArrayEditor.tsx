'use client';

import React, { useState } from 'react';
import { FieldDef } from '@/config/components';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Plus, Trash2, GripVertical } from 'lucide-react';

interface ArrayEditorProps {
  label: string;
  items: any[];
  arrayFields: Record<string, FieldDef>;
  onChange: (newItems: any[]) => void;
}

export function ArrayEditor({ label, items, arrayFields, onChange }: ArrayEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const safeItems = Array.isArray(items) ? items : [];

  const handleItemChange = (index: number, key: string, value: any) => {
    const newItems = [...safeItems];
    newItems[index] = { ...newItems[index], [key]: value };
    onChange(newItems);
  };

  const handleAddItem = () => {
    // Generate empty object based on arrayFields
    const newItem: any = {};
    Object.keys(arrayFields).forEach(k => {
      const type = arrayFields[k].type;
      newItem[k] = type === 'array' ? [] : '';
    });
    onChange([...safeItems, newItem]);
    setExpandedIndex(safeItems.length);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = [...safeItems];
    newItems.splice(index, 1);
    onChange(newItems);
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === safeItems.length - 1) return;
    
    const newItems = [...safeItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    onChange(newItems);
    
    if (expandedIndex === index) setExpandedIndex(targetIndex);
    else if (expandedIndex === targetIndex) setExpandedIndex(index);
  };

  const renderField = (key: string, field: FieldDef, value: any, itemIndex: number) => {
    if (field.type === 'text') {
      return (
        <div key={key} className="grid w-full gap-2 mb-4">
          <Label className="text-xs text-muted-foreground">{field.label}</Label>
          <Input 
            value={value || ''} 
            onChange={(e) => handleItemChange(itemIndex, key, e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      );
    }
    if (field.type === 'textarea') {
      return (
        <div key={key} className="grid w-full gap-2 mb-4">
          <Label className="text-xs text-muted-foreground">{field.label}</Label>
          <Textarea 
            value={value || ''} 
            onChange={(e) => handleItemChange(itemIndex, key, e.target.value)}
            rows={3}
            className="text-xs resize-none"
          />
        </div>
      );
    }
    if (field.type === 'number') {
      return (
        <div key={key} className="grid w-full gap-2 mb-4">
          <Label className="text-xs text-muted-foreground">{field.label}</Label>
          <Input 
            type="number"
            value={value || 0} 
            onChange={(e) => handleItemChange(itemIndex, key, Number(e.target.value))}
            className="h-8 text-xs"
          />
        </div>
      );
    }
    if (field.type === 'array' && field.arrayFields) {
      // Recursive array editor !!
      return (
        <div key={key} className="mb-4 pl-2 border-l-2 border-primary/20">
          <ArrayEditor 
            label={field.label}
            items={value || []}
            arrayFields={field.arrayFields}
            onChange={(newItems) => handleItemChange(itemIndex, key, newItems)}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col gap-2 mt-2 bg-muted/10 p-3 rounded-md border border-dashed">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-semibold">{label}</Label>
        <Button variant="outline" size="sm" onClick={handleAddItem} className="h-6 px-2 text-xs">
          <Plus className="w-3 h-3 mr-1" /> Add
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {safeItems.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-4 italic">No items yet</div>
        )}
        
        {safeItems.map((item, index) => {
          const isExpanded = expandedIndex === index;
          // Try to find a reasonable title for the list header (e.g., 'title', 'name', 'quote', or 'Item 1')
          const itemTitle = item.title || item.name || item.value || (item.quote ? `"${item.quote.substring(0, 15)}..."` : null) || item.text || `Item ${index + 1}`;

          return (
            <div key={index} className="border rounded-md bg-background overflow-hidden flex flex-col">
              {/* Header */}
              <div 
                className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab opacity-50 flex-shrink-0" />
                  <span className="text-xs font-medium truncate">{itemTitle}</span>
                </div>
                <div className="flex items-center gap-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Body */}
              {isExpanded && (
                <div className="p-3 border-t bg-muted/5 flex flex-col">
                  {Object.entries(arrayFields).map(([key, field]) => 
                    renderField(key, field, item[key], index)
                  )}
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(index, 'up')} disabled={index === 0}>
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(index, 'down')} disabled={index === safeItems.length - 1}>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button variant="destructive" size="sm" className="h-6 px-2 text-[10px]" onClick={() => handleDeleteItem(index)}>
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

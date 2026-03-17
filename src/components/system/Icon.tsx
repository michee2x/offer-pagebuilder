import React from 'react';
import * as LucideIcons from 'lucide-react';

export interface IconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function SystemIcon({ name, size = 24, className = '', style = {} }: IconProps) {
  // Graceful fallback to HelpCircle if icon name is hallucinated
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  
  return (
    <IconComponent 
      size={size} 
      className={className} 
      style={style} 
    />
  );
}

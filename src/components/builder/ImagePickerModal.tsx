'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, ImageIcon, Loader2, Check, Link2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export interface ImagePickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the final URL the user chose (local upload or pasted link) */
  onSelect: (url: string) => void;
}

interface RecentFile {
  name: string;
  url: string;
}

type TabId = 'upload' | 'recent' | 'link';

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'upload', icon: '↑', label: 'Upload' },
  { id: 'recent', icon: '🕐', label: 'Recent' },
  { id: 'link',   icon: '🔗', label: 'Link'   },
];

export function ImagePickerModal({ open, onClose, onSelect }: ImagePickerModalProps) {
  const [tab, setTab]                     = useState<TabId>('upload');
  const [isDragging, setIsDragging]       = useState(false);
  const [isUploading, setIsUploading]     = useState(false);
  const [linkUrl, setLinkUrl]             = useState('');
  const [recentFiles, setRecentFiles]     = useState<RecentFile[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [selectedRecent, setSelectedRecent]   = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted]                 = useState(false);

  useEffect(() => setMounted(true), []);

  // Reset every time the modal opens
  useEffect(() => {
    if (open) {
      setTab('upload');
      setLinkUrl('');
      setSelectedRecent(null);
      setIsDragging(false);
    }
  }, [open]);

  // Fetch recent images when switching to that tab
  useEffect(() => {
    if (tab === 'recent' && open) fetchRecent();
  }, [tab, open]);

  const fetchRecent = async () => {
    setIsLoadingRecent(true);
    try {
      const res = await fetch('/api/upload-image');
      const data = await res.json();
      setRecentFiles(data.files ?? []);
    } catch {
      setRecentFiles([]);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file'); return; }
    if (file.size > 10 * 1024 * 1024)   { toast.error('File must be under 10 MB'); return; }
    try {
      setIsUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch('/api/upload-image', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      onSelect(data.url);
    } catch (e: any) {
      toast.error(e.message ?? 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, []);

  const handleLinkConfirm = () => {
    const trimmed = linkUrl.trim();
    if (!trimmed) return;
    try { new URL(trimmed); } catch { toast.error('Enter a valid URL'); return; }
    onSelect(trimmed);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div style={{ position: 'fixed', zIndex: 9999 }}>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[500] bg-black/65 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* ── Panel ── */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[501] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-[520px] bg-[#111111] border border-white/[0.09] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3.5 border-b border-white/[0.07]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/[0.12] flex items-center justify-center ring-1 ring-sky-500/20">
                    <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <span className="text-[13px] font-semibold text-white/90 tracking-tight">Replace Image</span>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.07] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab bar */}
              <div className="flex border-b border-white/[0.07] px-5">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-3 text-[12px] font-semibold border-b-2 -mb-px transition-all',
                      tab === t.id
                        ? 'border-sky-500 text-sky-400'
                        : 'border-transparent text-white/35 hover:text-white/65'
                    )}
                  >
                    <span className="text-[11px]">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── Upload tab ── */}
              <div className="p-5">
                {tab === 'upload' && (
                  <div className="flex flex-col gap-3">
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true);  }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      className={cn(
                        'flex flex-col items-center justify-center gap-3.5 h-48 rounded-xl border-2 border-dashed transition-all select-none',
                        isDragging  ? 'border-sky-500/70 bg-sky-500/[0.06] cursor-copy' :
                        isUploading ? 'border-white/10 bg-white/[0.02] cursor-wait' :
                                      'border-white/[0.12] bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04] cursor-pointer'
                      )}
                    >
                      {isUploading ? (
                        <>
                          <div className="w-11 h-11 rounded-full bg-sky-500/[0.12] flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
                          </div>
                          <p className="text-[13px] text-white/60 font-medium">Uploading…</p>
                        </>
                      ) : isDragging ? (
                        <>
                          <div className="w-11 h-11 rounded-full bg-sky-500/20 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-sky-400" />
                          </div>
                          <p className="text-[13px] text-sky-300 font-semibold">Drop to upload</p>
                        </>
                      ) : (
                        <>
                          <div className="w-11 h-11 rounded-full bg-white/[0.05] flex items-center justify-center">
                            <Upload className="w-5 h-5 text-white/40" />
                          </div>
                          <div className="text-center">
                            <p className="text-[13px] text-white/70 font-medium">Drop an image here, or <span className="text-sky-400 underline underline-offset-2">browse files</span></p>
                            <p className="text-[11px] text-white/30 mt-1">PNG, JPG, GIF, WebP, SVG · max 10 MB</p>
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadFile(f);
                        e.target.value = '';
                      }}
                    />
                  </div>
                )}

                {/* ── Recent tab ── */}
                {tab === 'recent' && (
                  <div>
                    {/* Toolbar */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] text-white/35 font-medium uppercase tracking-wider">Your uploads</span>
                      <button
                        onClick={fetchRecent}
                        className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
                      >
                        <RefreshCw className={cn('w-3 h-3', isLoadingRecent && 'animate-spin')} /> Refresh
                      </button>
                    </div>

                    {isLoadingRecent ? (
                      <div className="h-52 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white/25" />
                      </div>
                    ) : recentFiles.length === 0 ? (
                      <div className="h-52 flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-white/20" />
                        </div>
                        <p className="text-[12px] text-white/35">No images uploaded yet</p>
                        <button
                          onClick={() => setTab('upload')}
                          className="text-[11px] text-sky-400 hover:text-sky-300 underline underline-offset-2"
                        >Upload your first image →</button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 gap-2 max-h-[240px] overflow-y-auto pr-0.5 pb-0.5">
                          {recentFiles.map((file) => (
                            <button
                              key={file.name}
                              onClick={() => setSelectedRecent(selectedRecent === file.url ? null : file.url)}
                              className={cn(
                                'relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-[1.03]',
                                selectedRecent === file.url
                                  ? 'border-sky-500 shadow-[0_0_0_2px_rgba(14,165,233,0.25)]'
                                  : 'border-transparent hover:border-white/20'
                              )}
                            >
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover bg-white/5"
                              />
                              {selectedRecent === file.url && (
                                <div className="absolute inset-0 bg-sky-500/20 flex items-center justify-center">
                                  <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center shadow-lg">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        {selectedRecent && (
                          <button
                            onClick={() => onSelect(selectedRecent)}
                            className="mt-4 w-full h-9 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-[13px] font-semibold rounded-lg transition-colors"
                          >
                            Use Selected Image
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ── Link tab ── */}
                {tab === 'link' && (
                  <div className="flex flex-col gap-3">
                    <p className="text-[12px] text-white/40">Paste any public image URL</p>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                      <Input
                        autoFocus
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleLinkConfirm(); }}
                        placeholder="https://example.com/image.jpg"
                        className="pl-8 bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/20 focus:border-sky-500/60"
                      />
                    </div>
                    {/* Live preview */}
                    {linkUrl.trim() && (
                      <div className="w-full h-36 rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03]">
                        <img
                          src={linkUrl}
                          alt="preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                          onLoad={(e)  => { (e.target as HTMLImageElement).style.opacity = '1'; }}
                          style={{ opacity: 0, transition: 'opacity 0.2s' }}
                        />
                      </div>
                    )}
                    <button
                      onClick={handleLinkConfirm}
                      disabled={!linkUrl.trim()}
                      className="w-full h-9 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-35 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-lg transition-colors"
                    >
                      Use This Image
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

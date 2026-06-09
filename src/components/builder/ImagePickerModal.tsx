'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, ImageIcon, Check, Link2, RefreshCw, Video, Film } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export type MediaType = 'image' | 'video' | 'any';

export interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the final URL the user chose (local upload or pasted link) */
  onSelect: (url: string) => void;
  /** What kind of media is allowed. Defaults to 'image'. */
  mediaType?: MediaType;
}

/** Backward-compatible alias */
export type ImagePickerModalProps = MediaPickerModalProps;

interface RecentFile {
  name: string;
  url: string;
  type?: string;
}

type TabId = 'upload' | 'recent' | 'link';

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'upload', icon: '↑', label: 'Upload' },
  { id: 'recent', icon: '🕐', label: 'Recent' },
  { id: 'link',   icon: '🔗', label: 'Link'   },
];

function getAcceptString(mediaType: MediaType): string {
  if (mediaType === 'video') return 'video/mp4,video/webm,video/quicktime';
  if (mediaType === 'any') return 'image/*,video/mp4,video/webm,video/quicktime';
  return 'image/*';
}

function getMaxSizeMB(mediaType: MediaType): number {
  if (mediaType === 'video') return 50;
  if (mediaType === 'any') return 50;
  return 10;
}

function getLabel(mediaType: MediaType): string {
  if (mediaType === 'video') return 'Video';
  if (mediaType === 'any') return 'Media';
  return 'Image';
}

function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

function isVideoUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov');
}

function isVideoFileName(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov');
}

export function MediaPickerModal({ open, onClose, onSelect, mediaType = 'image' }: MediaPickerModalProps) {
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

  const label = getLabel(mediaType);
  const maxSize = getMaxSizeMB(mediaType);
  const acceptStr = getAcceptString(mediaType);

  // Reset every time the modal opens
  useEffect(() => {
    if (open) {
      setTab('upload');
      setLinkUrl('');
      setSelectedRecent(null);
      setIsDragging(false);
    }
  }, [open]);

  // Fetch recent files when switching to that tab
  useEffect(() => {
    if (tab === 'recent' && open) fetchRecent();
  }, [tab, open]);

  const fetchRecent = async () => {
    setIsLoadingRecent(true);
    try {
      const res = await fetch('/api/upload-image');
      const data = await res.json();
      let files: RecentFile[] = data.files ?? [];
      // Filter files by media type if not 'any'
      if (mediaType === 'image') {
        files = files.filter((f) => f.type !== 'video');
      } else if (mediaType === 'video') {
        files = files.filter((f) => f.type === 'video' || isVideoFileName(f.name));
      }
      setRecentFiles(files);
    } catch {
      setRecentFiles([]);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  const uploadFile = useCallback(async (file: File) => {
    const isVid = isVideoFile(file);
    
    // Validate file type against mediaType prop
    if (mediaType === 'image' && isVid) { toast.error('Please choose an image file'); return; }
    if (mediaType === 'video' && !isVid) { toast.error('Please choose a video file'); return; }
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) { toast.error('Please choose an image or video file'); return; }
    
    const limit = isVid ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    const limitLabel = isVid ? '50 MB' : '10 MB';
    if (file.size > limit) { toast.error(`File must be under ${limitLabel}`); return; }
    
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
  }, [onSelect, mediaType]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleLinkConfirm = () => {
    const trimmed = linkUrl.trim();
    if (!trimmed) return;
    try { new URL(trimmed); } catch { toast.error('Enter a valid URL'); return; }
    onSelect(trimmed);
  };

  if (!mounted) return null;

  const formatHints = mediaType === 'video'
    ? 'MP4, WebM, MOV · max 50 MB'
    : mediaType === 'any'
    ? 'PNG, JPG, GIF, WebP, SVG, MP4, WebM · max 50 MB'
    : 'PNG, JPG, GIF, WebP, SVG · max 10 MB';

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
                  <div className="w-7 h-7 rounded-lg bg-brand-yellow/[0.12] flex items-center justify-center ring-1 ring-brand-yellow/20">
                    {mediaType === 'video' ? (
                      <Video className="w-3.5 h-3.5 text-brand-yellow" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-brand-yellow" />
                    )}
                  </div>
                  <span className="text-[13px] font-semibold text-white/90 tracking-tight">Replace {label}</span>
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
                        ? 'border-brand-yellow text-brand-yellow'
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
                        isDragging  ? 'border-brand-yellow/70 bg-brand-yellow/[0.06] cursor-copy' :
                        isUploading ? 'border-white/10 bg-white/[0.02] cursor-wait' :
                                      'border-white/[0.12] bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04] cursor-pointer'
                      )}
                    >
                      {isUploading ? (
                        <>
                          <div className="w-11 h-11 rounded-full bg-brand-yellow/[0.12] flex items-center justify-center">
                            <Spinner size="sm" />
                          </div>
                          <p className="text-[13px] text-white/60 font-medium">Uploading…</p>
                        </>
                      ) : isDragging ? (
                        <>
                          <div className="w-11 h-11 rounded-full bg-brand-yellow/20 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-brand-yellow" />
                          </div>
                          <p className="text-[13px] text-brand-yellow font-semibold">Drop to upload</p>
                        </>
                      ) : (
                        <>
                          <div className="w-11 h-11 rounded-full bg-white/[0.05] flex items-center justify-center">
                            {mediaType === 'video' ? (
                              <Film className="w-5 h-5 text-white/40" />
                            ) : (
                              <Upload className="w-5 h-5 text-white/40" />
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-[13px] text-white/70 font-medium">Drop a file here, or <span className="text-brand-yellow underline underline-offset-2">browse files</span></p>
                            <p className="text-[11px] text-white/30 mt-1">{formatHints}</p>
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={acceptStr}
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
                        <Spinner size="md" color="muted" />
                      </div>
                    ) : recentFiles.length === 0 ? (
                      <div className="h-52 flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center">
                          {mediaType === 'video' ? (
                            <Video className="w-5 h-5 text-white/20" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-white/20" />
                          )}
                        </div>
                        <p className="text-[12px] text-white/35">No {label.toLowerCase()}s uploaded yet</p>
                        <button
                          onClick={() => setTab('upload')}
                          className="text-[11px] text-brand-yellow hover:text-brand-yellow/80 underline underline-offset-2"
                        >Upload your first {label.toLowerCase()} →</button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 gap-2 max-h-[240px] overflow-y-auto pr-0.5 pb-0.5">
                          {recentFiles.map((file) => {
                            const fileIsVideo = file.type === 'video' || isVideoFileName(file.name);
                            return (
                              <button
                                key={file.name}
                                onClick={() => setSelectedRecent(selectedRecent === file.url ? null : file.url)}
                                className={cn(
                                  'relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-[1.03]',
                                  selectedRecent === file.url
                                    ? 'border-brand-yellow shadow-[0_0_0_2px_rgba(245,166,35,0.25)]'
                                    : 'border-transparent hover:border-white/20'
                                )}
                              >
                                {fileIsVideo ? (
                                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                    <Film className="w-6 h-6 text-white/30" />
                                  </div>
                                ) : (
                                  <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-full h-full object-cover bg-white/5"
                                  />
                                )}
                                {/* Video badge */}
                                {fileIsVideo && (
                                  <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm rounded px-1 py-0.5 text-[9px] text-white/60 font-mono">
                                    VID
                                  </div>
                                )}
                                {selectedRecent === file.url && (
                                  <div className="absolute inset-0 bg-brand-yellow/20 flex items-center justify-center">
                                    <div className="w-5 h-5 rounded-full bg-brand-yellow flex items-center justify-center shadow-lg">
                                      <Check className="w-3 h-3 text-white" />
                                    </div>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {selectedRecent && (
                          <button
                            onClick={() => onSelect(selectedRecent)}
                            className="mt-4 w-full h-9 bg-brand-yellow hover:bg-brand-yellow/90 active:scale-[0.98] text-black text-[13px] font-semibold rounded-lg transition-all"
                          >
                            Use Selected {label}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ── Link tab ── */}
                {tab === 'link' && (
                  <div className="flex flex-col gap-3">
                    <p className="text-[12px] text-white/40">Paste any public {label.toLowerCase()} URL</p>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                      <Input
                        autoFocus
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleLinkConfirm(); }}
                        placeholder={mediaType === 'video' ? 'https://example.com/video.mp4' : 'https://example.com/image.jpg'}
                        className="pl-8 bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/20 focus:border-brand-yellow/60"
                      />
                    </div>
                    {/* Live preview */}
                    {linkUrl.trim() && (
                      <div className="w-full h-36 rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03]">
                        {(mediaType === 'video' || isVideoUrl(linkUrl)) ? (
                          <video
                            src={linkUrl}
                            className="w-full h-full object-contain"
                            controls
                            muted
                            onError={(e) => { (e.currentTarget as HTMLVideoElement).style.opacity = '0'; }}
                            onLoadedData={(e) => { (e.currentTarget as HTMLVideoElement).style.opacity = '1'; }}
                            style={{ opacity: 0, transition: 'opacity 0.2s' }}
                          />
                        ) : (
                          <img
                            src={linkUrl}
                            alt="preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                            onLoad={(e)  => { (e.target as HTMLImageElement).style.opacity = '1'; }}
                            style={{ opacity: 0, transition: 'opacity 0.2s' }}
                          />
                        )}
                      </div>
                    )}
                    <button
                      onClick={handleLinkConfirm}
                      disabled={!linkUrl.trim()}
                      className="w-full h-9 bg-brand-yellow hover:bg-brand-yellow/90 active:scale-[0.98] disabled:opacity-35 disabled:cursor-not-allowed text-black text-[13px] font-semibold rounded-lg transition-all"
                    >
                      Use This {label}
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

/** Backward-compatible alias */
export const ImagePickerModal = MediaPickerModal;

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { X } from 'lucide-react';
import { getCroppedImageBlob } from '@/lib/crop-image';

export type CropKind = 'logo' | 'cover';

type Props = {
  open: boolean;
  kind: CropKind;
  imageSrc: string;
  fileName: string;
  onCancel: () => void;
  onConfirm: (file: File) => void;
};

/** Logo 1:1 (cerchio in UI); banner sidebar 288×80 ≈ 3.6:1 */
const ASPECT: Record<CropKind, number> = {
  logo: 1,
  cover: 288 / 80,
};

const MAX_EDGE: Record<CropKind, number> = {
  logo: 512,
  cover: 1600,
};

const TITLES: Record<CropKind, string> = {
  logo: 'Regola il logo',
  cover: 'Regola il banner',
};

export default function ImageCropDialog({
  open,
  kind,
  imageSrc,
  fileName,
  onCancel,
  onConfirm,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setBusy(false);
    setError('');
  }, [open, imageSrc]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setBusy(true);
    setError('');
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, {
        maxEdge: MAX_EDGE[kind],
        quality: 0.85,
      });
      const ext = blob.type === 'image/jpeg' ? 'jpg' : 'webp';
      const base = fileName.replace(/\.[^.]+$/, '') || kind;
      const file = new File([blob], `${base}.${ext}`, { type: blob.type });
      onConfirm(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ritaglio fallito');
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-dialog-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <h2 id="crop-dialog-title" className="text-sm font-bold text-gray-900">
              {TITLES[kind]}
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Trascina per riposizionare, usa lo zoom per inquadrare.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-50"
            aria-label="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative h-64 sm:h-72 bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT[kind]}
            cropShape={kind === 'logo' ? 'round' : 'rect'}
            showGrid={kind === 'cover'}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="px-4 py-3 space-y-3 border-t border-gray-100">
          <label className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-600 w-10">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-blue-600"
              disabled={busy}
            />
          </label>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-lg disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={busy || !croppedAreaPixels}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {busy ? 'Preparazione…' : 'Usa questo ritaglio'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

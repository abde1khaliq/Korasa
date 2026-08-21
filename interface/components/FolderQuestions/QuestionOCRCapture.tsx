"use client";

import { useRef, useState } from "react";
import { Camera, X, Loader2, Check } from "lucide-react";

type Stage = "capture" | "crop" | "recognizing";

export function QuestionOCRCapture({
  onClose,
  onTextRecognized,
}: {
  onClose: () => void;
  onTextRecognized: (text: string) => void;
}) {
  const [stage, setStage] = useState<Stage>("capture");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [dragRect, setDragRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUrl(URL.createObjectURL(file));
    setDragRect(null);
    setError(null);
    setStage("crop");
  };

  const getRelativePos = (e: React.PointerEvent) => {
    const bounds = overlayRef.current!.getBoundingClientRect();
    return {
      x: Math.min(Math.max(e.clientX - bounds.left, 0), bounds.width),
      y: Math.min(Math.max(e.clientY - bounds.top, 0), bounds.height),
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const pos = getRelativePos(e);
    setDragStart(pos);
    setDragRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStart) return;
    const pos = getRelativePos(e);
    setDragRect({
      x: Math.min(dragStart.x, pos.x),
      y: Math.min(dragStart.y, pos.y),
      w: Math.abs(pos.x - dragStart.x),
      h: Math.abs(pos.y - dragStart.y),
    });
  };

  const handleConfirmCrop = async () => {
    if (
      !imgRef.current ||
      !overlayRef.current ||
      !dragRect ||
      dragRect.w < 10 ||
      dragRect.h < 10
    ) {
      setError("Drag a box around the question text first.");
      return;
    }

    setStage("recognizing");
    setError(null);

    try {
      const img = imgRef.current;
      const bounds = overlayRef.current.getBoundingClientRect();
      const scaleX = img.naturalWidth / bounds.width;
      const scaleY = img.naturalHeight / bounds.height;

      const sx = dragRect.x * scaleX;
      const sy = dragRect.y * scaleY;
      const sw = dragRect.w * scaleX;
      const sh = dragRect.h * scaleY;

      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      // Dynamic import: keeps ~2MB of OCR code out of the initial bundle,
      // only loaded when someone actually opens the scan flow.
      const Tesseract = await import("tesseract.js");
      const { data } = await Tesseract.recognize(canvas, "eng");

      const text = data.text.trim();
      if (!text) {
        setError(
          "Couldn't read any text in that selection — try a tighter crop.",
        );
        setStage("crop");
        return;
      }

      onTextRecognized(text);
    } catch (err) {
      console.error("OCR failed:", err);
      setError("Text recognition failed. Try again or type it manually.");
      setStage("crop");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-onyx/95 backdrop-blur-sm">
      <header className="flex shrink-0 items-center justify-between px-6 py-5">
        <X
          className="size-6 cursor-pointer text-paper/70 hover:text-paper transition-colors"
          strokeWidth={1.75}
          onClick={onClose}
        />
        <h1 className="text-[15px] font-medium text-paper">Scan question</h1>
        <div className="size-6" />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {stage === "capture" && (
          <>
            <p className="mb-6 max-w-[22rem] text-center text-[15px] text-paper/70">
              Take a photo, then drag a box around just the question text — not
              the answer.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-full bg-paper px-6 py-3.5 text-[15px] font-medium text-onyx"
            >
              <Camera className="size-5" strokeWidth={1.75} />
              Open camera
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        )}

        {(stage === "crop" || stage === "recognizing") && imageUrl && (
          <div className="flex w-full max-w-md flex-col items-center">
            <div
              ref={overlayRef}
              className="relative w-full touch-none select-none overflow-hidden rounded-2xl"
              onPointerDown={stage === "crop" ? handlePointerDown : undefined}
              onPointerMove={stage === "crop" ? handlePointerMove : undefined}
              onPointerUp={
                stage === "crop" ? () => setDragStart(null) : undefined
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Captured question"
                className="w-full select-none"
                draggable={false}
              />
              {dragRect && (
                <div
                  className="pointer-events-none absolute border-2 border-brand bg-brand/10"
                  style={{
                    left: dragRect.x,
                    top: dragRect.y,
                    width: dragRect.w,
                    height: dragRect.h,
                  }}
                />
              )}
              {stage === "recognizing" && (
                <div className="absolute inset-0 flex items-center justify-center bg-onyx/60">
                  <Loader2
                    className="size-8 animate-spin text-paper"
                    strokeWidth={1.75}
                  />
                </div>
              )}
            </div>

            {error && (
              <p className="mt-4 text-center text-[14px] text-hard-soft">
                {error}
              </p>
            )}

            {stage === "crop" && (
              <div className="mt-6 flex w-full items-center gap-3">
                <button
                  onClick={() => {
                    setImageUrl(null);
                    setStage("capture");
                    setDragRect(null);
                  }}
                  className="flex-1 rounded-full border border-paper/30 py-3 text-[15px] text-paper"
                >
                  Retake
                </button>
                <button
                  onClick={handleConfirmCrop}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-paper py-3 text-[15px] font-medium text-onyx"
                >
                  <Check className="size-4" strokeWidth={2} />
                  Use selection
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

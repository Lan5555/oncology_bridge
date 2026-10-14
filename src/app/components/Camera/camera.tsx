"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera as CameraIcon,
  CameraOff,
  ScanLine,
  ShieldCheck,
} from "lucide-react";

interface CameraProps {
  onCapture: (image: Blob) => Promise<void>;
  onClose: () => void;
  busy?: boolean;
}

export default function Camera({
  onCapture,
  onClose,
  busy = false,
}: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    void video.play().catch(() => {
      setCameraError(
        "The camera started, but the preview could not play. Try again or use manual entry.",
      );
    });
  }, [stream]);

  useEffect(
    () => () => stream?.getTracks().forEach((track) => track.stop()),
    [stream],
  );

  const requestCameraPermission = async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Camera access requires a secure page (HTTPS or localhost) and a supported browser. You can enter identifiers manually.",
      );
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      const message =
        name === "NotAllowedError" || name === "SecurityError"
          ? "Camera permission was denied. Allow camera access in your browser settings, then try again."
          : name === "NotFoundError"
            ? "No camera was found on this device. You can enter identifiers manually."
            : "The camera could not be opened. Check that no other app is using it, then try again.";
      setCameraError(message);
    }
  };

  const capture = async () => {
    const video = videoRef.current;
    if (
      !video ||
      !stream ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      setCameraError(
        "Allow camera access and wait for the preview before capturing.",
      );
      return;
    }
    setCapturing(true);
    setCameraError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("The camera image could not be prepared.");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error("The camera image could not be captured.")),
          "image/jpeg",
          0.92,
        );
      });
      await onCapture(image);
    } catch (error) {
      setCameraError(
        error instanceof Error
          ? error.message
          : "The image could not be captured.",
      );
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gs1-camera-title"
    >
      <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-w shadow-2xl">
        <header className="flex items-center justify-between border-b border-g100 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-pl text-p">
                <ScanLine size={17} aria-hidden="true" />
              </span>
              <h2 id="gs1-camera-title" className="text-sm font-bold text-g900">
                Scan GS1 DataMatrix
              </h2>
            </div>
            <p className="mt-1 text-xs text-g500">
              Allow camera access, then center the product code in the frame.
            </p>
          </div>
          <button
            className="rounded-lg border border-g200 px-3 py-1.5 text-sm text-g700 transition hover:border-p hover:text-p"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>

        <div className="relative aspect-video overflow-hidden bg-slate-950">
          {stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(8,145,178,0.2),transparent_65%)] px-6 text-center">
              <span className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-cyan-200 shadow-[0_0_35px_rgba(8,145,178,0.18)]">
                <CameraOff size={28} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-white">
                Camera permission is needed
              </p>
              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-300">
                Your browser will ask before the scanner can use this device's
                camera.
              </p>
              <button
                type="button"
                onClick={() => void requestCameraPermission()}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-cyan-500"
              >
                <CameraIcon size={16} aria-hidden="true" />
                Allow camera access
              </button>
            </div>
          )}

          {stream ? (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[12%] rounded-xl border-2 border-emerald-300/90 shadow-[0_0_0_999px_rgba(2,6,23,0.3)]"
              >
                <span className="absolute -left-px -top-px h-6 w-6 border-l-4 border-t-4 border-emerald-300" />
                <span className="absolute -right-px -top-px h-6 w-6 border-r-4 border-t-4 border-emerald-300" />
                <span className="absolute -bottom-px -left-px h-6 w-6 border-b-4 border-l-4 border-emerald-300" />
                <span className="absolute -bottom-px -right-px h-6 w-6 border-b-4 border-r-4 border-emerald-300" />
                <span className="absolute inset-x-0 top-1/2 h-0.5 animate-pulse bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/75 px-3 py-1 text-[11px] font-medium text-white">
                GTIN · Lot · Expiry · Serial
              </div>
            </>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex min-h-8 flex-1 items-center gap-2">
            {cameraError ? (
              <>
                <CameraOff
                  size={15}
                  className="shrink-0 text-err"
                  aria-hidden="true"
                />
                <p className="text-xs text-err" role="status">
                  {cameraError}
                </p>
              </>
            ) : (
              <p className="flex items-center gap-1.5 text-xs text-g500">
                <ShieldCheck
                  size={14}
                  className="text-good"
                  aria-hidden="true"
                />
                The image is sent once for decoding and is not saved by the
                scanner UI.
              </p>
            )}
          </div>
          {stream ? (
            <button
              className="rounded-lg bg-p px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pd disabled:opacity-50"
              disabled={capturing || busy}
              onClick={() => void capture()}
              type="button"
            >
              {capturing || busy ? "Decoding…" : "Capture and decode"}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

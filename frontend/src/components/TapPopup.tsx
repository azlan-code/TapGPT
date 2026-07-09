import { useState, useEffect, useRef, useCallback } from "react";
import tapOff from "../assets/images/tap-off.png";
import tapOn1 from "../assets/images/tap-on-1.png";
import tapOn2 from "../assets/images/tap-on-2.png";
import tapOn3 from "../assets/images/tap-on-3.png";
import tapOn4 from "../assets/images/tap-on-4.png";
import tapOn5 from "../assets/images/tap-on-5.png";
import tapOn6 from "../assets/images/tap-on-6.png";

const TAP_ON_FRAMES = [tapOn1, tapOn2, tapOn3, tapOn4, tapOn5, tapOn6];
const DEFAULT_HOLD_DURATION_MS = 3000;
const PROGRESS_UPDATE_INTERVAL_MS = 50;
const FRAME_DURATION_MS = 100;

interface TapPopupProps {
  visible: boolean;
  onComplete: () => void;
  holdDurationMs?: number;
}

export function TapPopup({ visible, onComplete, holdDurationMs = DEFAULT_HOLD_DURATION_MS }: TapPopupProps) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  const progressIntervalRef = useRef<number | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset state when popup becomes visible
  useEffect(() => {
    if (visible) {
      setProgress(0);
      setIsHolding(false);
      setCurrentFrame(0);
    }
  }, [visible]);

  // Handle progress bar filling
  useEffect(() => {
    if (isHolding && progress < 100) {
      const increment = (PROGRESS_UPDATE_INTERVAL_MS / holdDurationMs) * 100;
      progressIntervalRef.current = window.setInterval(() => {
        setProgress((prev) => {
          const next = prev + increment;
          if (next >= 100) {
            return 100;
          }
          return next;
        });
      }, PROGRESS_UPDATE_INTERVAL_MS);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isHolding, progress, holdDurationMs]);

  // Handle completion
  useEffect(() => {
    if (progress >= 100) {
      onCompleteRef.current();
    }
  }, [progress]);

  // Handle animation frames
  useEffect(() => {
    if (isHolding) {
      frameIntervalRef.current = window.setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % TAP_ON_FRAMES.length);
      }, FRAME_DURATION_MS);
    } else {
      setCurrentFrame(0);
    }

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    };
  }, [isHolding]);

  const startHolding = useCallback(() => {
    setIsHolding(true);
  }, []);

  const stopHolding = useCallback(() => {
    setIsHolding(false);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  if (!visible) {
    return null;
  }

  const currentImage = isHolding ? TAP_ON_FRAMES[currentFrame] : tapOff;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white border-2 border-black rounded-lg p-6 mx-4 max-w-sm w-full">
        <h2 className="text-xl font-bold text-center text-black mb-4">
          TapGPT is thirsty
        </h2>

        <div className="flex justify-center mb-4">
          <img
            src={currentImage}
            alt="Tap to verify"
            className="h-70 w-70 object-contain select-none touch-none"
            draggable={false}
            onMouseDown={startHolding}
            onMouseUp={stopHolding}
            onMouseLeave={stopHolding}
            onTouchStart={startHolding}
            onTouchEnd={stopHolding}
            onTouchCancel={stopHolding}
            onContextMenu={handleContextMenu}
          />
        </div>

        <p className="text-center text-gray-600 mb-4">
          Hold the tap to pour water down the drain
        </p>

        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#02A0DF] transition-all duration-50"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

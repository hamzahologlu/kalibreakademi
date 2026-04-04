"use client";

import { useEffect, useRef } from "react";
import {
  openCourseLearningSessionAction,
  pulseCourseLearningAction,
} from "@/app/egitim/learning-actions";

const PULSE_SEC = 30;
const INTERVAL_MS = PULSE_SEC * 1000;

/**
 * Personel eğitim sayfasında: oturum açılışı + sekme açıkken periyodik süre bildirimi.
 */
export function CourseLearningTracker({ courseId }: { courseId: string }) {
  const lastTick = useRef<number>(Date.now());
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    void openCourseLearningSessionAction(courseId);

    const tick = () => {
      if (!mounted.current || document.visibilityState !== "visible") return;
      const now = Date.now();
      const elapsedSec = Math.round((now - lastTick.current) / 1000);
      lastTick.current = now;
      if (elapsedSec > 0) {
        void pulseCourseLearningAction(courseId, Math.min(elapsedSec, PULSE_SEC + 5));
      }
    };

    const id = window.setInterval(tick, INTERVAL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") {
        lastTick.current = Date.now();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      mounted.current = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      if (document.visibilityState === "visible") {
        const elapsedSec = Math.round((Date.now() - lastTick.current) / 1000);
        if (elapsedSec > 2) {
          void pulseCourseLearningAction(
            courseId,
            Math.min(elapsedSec, PULSE_SEC + 5)
          );
        }
      }
    };
  }, [courseId]);

  return null;
}

'use client';

import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

interface LoadingOverlayProps {
  isVisible: boolean;
}

const LOADING_STEPS = [
  'Processing your files...',
  'Calculating your stats...',
  'Generating insights...',
  'Almost done...',
];

const STEP_DURATION = 1500; // 1.5 seconds per step

export function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        // Loop through steps
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev; // Stay on last step
      });
    }, STEP_DURATION);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8">
        {/* Large Spinner */}
        <Spinner className="h-16 w-16 text-primary" />

        {/* Animated Text */}
        <div className="min-h-[2rem] flex items-center justify-center">
          <p
            key={currentStep}
            className="text-xl font-medium text-foreground animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
          >
            {LOADING_STEPS[currentStep]}
          </p>
        </div>
      </div>
    </div>
  );
}
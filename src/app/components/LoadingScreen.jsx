"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FaSpinner } from "react-icons/fa";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center gap-8">
      <div className="relative w-[80vw] h-[40vh] max-w-[800px] max-h-[400px]">
        {!showFallback ? (
          <>
            <Image
              src="/IHI LOGO.png"
              alt="IHI Logo"
              fill
              className="object-contain z-10 relative"
              priority
              quality={100}
              onError={() => setShowFallback(true)}
              onLoad={() => console.log("Logo loaded successfully")}
            />
            {/* Golden Shine Effect */}
            <div className="absolute inset-0 overflow-hidden z-20 pointer-events-none">
              <div className="absolute top-0 left-0 h-full w-[60%] bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-shine" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary mb-4">IHI</h1>
              <p className="text-gray-600">Loading application...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Loading spinner */}
      <div className="flex items-center justify-center gap-3 text-gray-500">
        <FaSpinner className="animate-spin text-primary text-2xl" />
        <span>Loading...</span>
      </div>
    </div>
  );
}
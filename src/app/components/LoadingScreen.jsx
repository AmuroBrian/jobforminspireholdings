"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
      {/* Logo Container with Masked Shine Effect */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Logo Image */}
        <Image
          src="/IHI LOGO.png"
          alt="Loading..."
          width={500}
          height={300}
          className="w-[200px] md:w-[300px] lg:w-[600px] h-auto object-contain" 
          priority
        />
        
        {/* Gold Shine Effect (constrained to logo bounds) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 left-0 h-full w-[50%] bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shine"
            style={{
              width: "200%",
              left: "-50%",
            }}
          />
        </div>
      </div>
    </div>
  );
}
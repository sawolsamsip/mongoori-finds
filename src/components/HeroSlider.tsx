"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

/** 인기 모델 순: Y → 3 → S → X → Cybertruck (고화질 avif) */
const SLIDES = [
  { src: "/hero/modely.avif", label: "Model Y" },
  { src: "/hero/model3.avif", label: "Model 3" },
  { src: "/hero/models.avif", label: "Model S" },
  { src: "/hero/modelx.avif", label: "Model X" },
  { src: "/hero/cybertruck.avif", label: "Cybertruck" },
] as const;

const SLIDE_INTERVAL_MS = 5000;

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative h-[85vh] min-h-[480px] overflow-hidden bg-black">
      {/* 메인 슬라이드: 차량 이미지가 주인공 */}
      <div className="absolute inset-0">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100 z-0" : "opacity-0 z-0"
            }`}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.src}
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority={i === 0}
              unoptimized
            />
          </div>
        ))}
      </div>

      {/* 하단·왼쪽 그라데이션: 텍스트만 읽기 쉽게, 이미지는 그대로 강조 */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.32) 26%, transparent 48%), linear-gradient(to right, rgba(0,0,0,0.45) 0%, transparent 48%)",
        }}
        aria-hidden
      />

      {/* 히어로 텍스트 + 버튼: 왼쪽 하단, 슬라이드와 자연스럽게 */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end pb-12 sm:pb-16 lg:pb-20 pt-20">
        <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="text-xs sm:text-sm font-semibold text-[#60a5fa] tracking-[0.2em] uppercase mb-2">
              Fleet-tested in California
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
              We use what we sell.
            </h1>
            <p className="mt-3 text-sm text-white/90">
              Free shipping on orders $50+
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-md bg-white text-black px-6 py-3 text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Shop products
              </Link>
              <Link
                href="/bundle"
                className="inline-flex items-center justify-center rounded-md border-2 border-white/80 text-white px-6 py-3 text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                Save with the bundle
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 슬라이드 인디케이터 + 차량명 */}
      <div className="absolute bottom-6 right-4 sm:right-6 lg:right-8 z-20 flex items-center gap-3">
        <span className="text-xs font-medium text-white/90 tracking-wide uppercase hidden sm:inline">
          {SLIDES[index].label}
        </span>
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${i + 1}, ${SLIDES[i].label}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

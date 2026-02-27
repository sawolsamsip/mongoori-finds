"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

/**
 * 히어로 배경용 Tesla 차량 이미지 슬라이드.
 * public/hero/ 에 이미지를 넣으면 그걸 사용하고,
 * 없으면 아래 기본 URL(Unsplash Tesla) 사용.
 */
const DEFAULT_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1920&q=80",
  "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1920&q=80",
  "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=1920&q=80",
  "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=1920&q=80",
];

const SLIDE_INTERVAL_MS = 5000;

type Props = {
  /** 커스텀 이미지 경로/URL. 없으면 기본 Tesla 이미지 사용 */
  images?: string[];
};

export default function HeroBackgroundSlider({ images = DEFAULT_HERO_IMAGES }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="absolute inset-0 z-0">
      {images.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          aria-hidden
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority={i === 0}
            unoptimized={src.startsWith("/")}
          />
        </div>
      ))}
    </div>
  );
}

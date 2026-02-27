"use client";

import Image from "next/image";

/**
 * 상품 이미지. public/images/ 로컬 파일은 unoptimized로 표시해
 * Next 이미지 최적화 없이 바로 로드되게 함.
 */
type Props = {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
};

export default function ProductImage({ src, alt, fill, sizes, className, priority, width, height }: Props) {
  const isLocal = src.startsWith("/images/");

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "100vw"}
        className={className}
        priority={priority}
        unoptimized={isLocal}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 600}
      height={height ?? 600}
      className={className}
      priority={priority}
      unoptimized={isLocal}
    />
  );
}

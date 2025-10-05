'use client';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  asLink?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large'; // New prop for uniform sizing
}

export default function Logo({ asLink = true, className = '', size = 'medium' }: LogoProps) {
  // Define size mappings for consistency
  const sizeConfig = {
    small: { imageSize: 20, textSize: 'text-lg' }, // Smaller for compact areas
    medium: { imageSize: 28, textSize: 'text-xl' }, // Default, balanced
    large: { imageSize: 36, textSize: 'text-2xl' }, // Larger for prominent areas
  };

  const { imageSize, textSize } = sizeConfig[size];

  const logo = (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/favicon.ico"
        alt="Niajee"
        width={imageSize}
        height={imageSize}
        className="rounded"
      />
      <span className={`font-bold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.indigo.400),theme(colors.indigo.100),theme(colors.sky.400),theme(colors.fuchsia.400),theme(colors.sky.400),theme(colors.indigo.100),theme(colors.indigo.400))] bg-[length:200%_auto] animate-gradient ${textSize}`}>
        Niajee
      </span>
    </div>
  );

  return asLink ? (
    <Link href="/" aria-label="Niajee Home" className="flex items-center">
      {logo}
    </Link>
  ) : (
    logo
  );
}
'use client';
import Link from 'next/link';

export default function Logo({ asLink = true, className = '' }) {
  const logo = (
    <span className={`font-extrabold text-5xl bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.indigo.400),theme(colors.indigo.100),theme(colors.sky.400),theme(colors.fuchsia.400),theme(colors.sky.400),theme(colors.indigo.100),theme(colors.indigo.400))] bg-[length:200%_auto] animate-gradient ${className}`}>
      MOSAIC
    </span>
  );
  return asLink ? (
    <Link href="/" aria-label="Mosaic Home">
      {logo}
    </Link>
  ) : (
    logo
  );
}
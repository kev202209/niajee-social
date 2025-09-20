'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Logo({ asLink = true, className = '' }) {
  const logo = (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image 
        src="/favicon.ico" 
        alt="Niajee" 
        width={28} 
        height={28} 
        className="rounded"
      />
      <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.indigo.400),theme(colors.indigo.100),theme(colors.sky.400),theme(colors.fuchsia.400),theme(colors.sky.400),theme(colors.indigo.100),theme(colors.indigo.400))] bg-[length:200%_auto] animate-gradient">
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
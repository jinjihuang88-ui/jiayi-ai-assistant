interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-[#0a0a1a]/80 backdrop-blur-xl
        border border-[#1a1a3e]/80
        shadow-[0_0_40px_rgba(0,170,255,0.04)]
        ${className}
      `}
    >
      {/* Top edge glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/30 to-transparent" />
      {children}
    </div>
  );
}

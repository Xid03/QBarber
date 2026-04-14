export default function QueueSmartLogo({ className = 'h-16 w-16' }) {
  return (
    <svg className={className} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="queueSmartWebLogoGradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" fill="url(#queueSmartWebLogoGradient)" r="95" />

      <g fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="6">
        <path d="M92 35 L58 110 C55 118 50 122 42 122 C32 122 25 114 25 104 C25 97 30 91 37 89 L78 58" />
        <path d="M108 35 L142 110 C145 118 150 122 158 122 C168 122 175 114 175 104 C175 97 170 91 163 89 L122 58" />
      </g>

      <circle cx="100" cy="52" fill="#FFFFFF" r="8" />
      <circle cx="100" cy="52" fill="#2563EB" r="4" />

      <circle cx="35" cy="112" fill="rgba(255,255,255,0.15)" r="18" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="165" cy="112" fill="rgba(255,255,255,0.15)" r="18" stroke="#FFFFFF" strokeWidth="6" />

      <rect fill="#FFFFFF" height="34" rx="10" width="44" x="78" y="74" />
      <text
        fill="#2563EB"
        fontFamily="Arial,sans-serif"
        fontSize="24"
        fontWeight="900"
        textAnchor="middle"
        x="100"
        y="99"
      >
        Q
      </text>
    </svg>
  );
}

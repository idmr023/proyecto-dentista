export function Logo({ size = "sm", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) {
  
  // Diccionario blindado: Define la altura del contenedor y el texto en conjunto
  const sizeStyles = {
    sm: {
      container: "h-10 md:h-12", // Altura perfecta para Navbar / Footer
      text: "text-lg md:text-xl",
      stroke: "[-webkit-text-stroke:2px_white]"
    },
    md: {
      container: "h-13 md:h-20", // Altura mediana
      text: "text-3xl md:text-4xl",
      stroke: "[-webkit-text-stroke:4px_white]"
    },
    lg: {
      container: "h-32 md:h-40", // Gigante para el centro de una página
      text: "text-6xl md:text-7xl",
      stroke: "[-webkit-text-stroke:6px_white]"
    }
  };

  const current = sizeStyles[size];

  return (
    // inline-flex asegura que no se expanda robando espacio a otros elementos
    <div className={`inline-flex items-center gap-2 ${current.container} ${className}`}>
      
      {/* SVG del Logo: Controlado por la altura (h-10, h-20, etc.) del padre */}
      <svg className="h-full w-auto aspect-square" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
        <defs>
          <filter id="sticker-border" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur" />
            <feComponentTransfer in="blur" result="solid">
              <feFuncA type="linear" slope="100" />
            </feComponentTransfer>
            <feFlood floodColor="#ffffff" result="whiteColor" />
            <feComposite in="whiteColor" in2="solid" operator="in" result="whiteOutline" />
            <feMerge>
              <feMergeNode in="whiteOutline" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <g id="drop">
            <path d="M -12,5 A 12 12 0 1 0 12,5 L 0,-15 Z" />
          </g>
        </defs>

        <g filter="url(#sticker-border)">
          <path d="M 290,95 A 160,160 0 1,0 400,290 A 50,50 0 0,1 360,210 A 50,50 0 0,1 400,130 A 160,160 0 0,0 290,95" fill="none" stroke="#1da1f2" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 165,155 A 120 120 0 0 0 135,235 A 110 110 0 0 0 170,325 A 100 100 0 0 0 240,365" fill="none" stroke="#1da1f2" strokeWidth="6" strokeLinecap="round" />
          <path d="M 290,265 Q 330,280 370,250" fill="none" stroke="#1da1f2" strokeWidth="6" strokeLinecap="round" />

          <g transform="translate(270, 260) rotate(-22)">
            <path d="M -20,150 L 20,150 L 25,50 L 20,10 L 20,-80 L 20,-120 Q 20,-150 40,-155 L 40,-170 L 15,-170 Q -20,-165 -20,-120 Z" fill="#ffffff" />
            <path d="M -20,150 L 20,150 L 25,50 L 20,10 L 20,-80 L 20,-120 Q 20,-150 40,-155 L 40,-170 L 15,-170 Q -20,-165 -20,-120 Z" fill="none" stroke="#1da1f2" strokeWidth="14" strokeLinejoin="round" />
            <polygon points="-22,10 22,10 25,60 -25,60" fill="#1da1f2" />
            <polygon points="-20,140 20,140 20,165 -20,165" fill="#1da1f2" />
            <path d="M -8,-70 L 8,-70 L 12,-10 L -12,-10 Z" fill="#ffffff" stroke="#1da1f2" strokeWidth="8" strokeLinejoin="round" />
            <path d="M -12,70 L 12,70 L 10,130 L -10,130 Z" fill="#ffffff" stroke="#1da1f2" strokeWidth="8" strokeLinejoin="round" />
            <line x1="40" y1="-162" x2="65" y2="-162" stroke="#1da1f2" strokeWidth="8" strokeLinecap="round" />
          </g>

          <rect x="148" y="138" width="34" height="34" rx="10" fill="#00e5ff" stroke="#1da1f2" strokeWidth="4" />
          <rect x="118" y="218" width="34" height="34" rx="10" fill="#c04bf2" stroke="#1da1f2" strokeWidth="4" />
          <rect x="153" y="308" width="34" height="34" rx="10" fill="#ffcc00" stroke="#1da1f2" strokeWidth="4" />
          <rect x="223" y="348" width="34" height="34" rx="10" fill="#00e5ff" stroke="#1da1f2" strokeWidth="4" />
          <rect x="353" y="233" width="34" height="34" rx="10" fill="#c04bf2" stroke="#1da1f2" strokeWidth="4" />

          <use href="#drop" x="290" y="55" transform="rotate(45 290 55)" fill="#ffcc00" />
          <use href="#drop" x="350" y="45" fill="#c04bf2" />
          <use href="#drop" x="370" y="95" transform="rotate(-45 370 95)" fill="#00e5ff" />
          <line x1="330" y1="50" x2="315" y2="65" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          <line x1="350" y1="80" x2="335" y2="80" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        </g>
      </svg>

      {/* Texto condicionado por current.text para que nunca crezca desproporcionado */}
      <div className={`flex flex-col justify-center font-sans font-black tracking-tighter ${current.text}`}>
        <span className={`text-blue-500 ${current.stroke} [paint-order:stroke_fill] drop-shadow-sm leading-[0.8]`}>
          Dental
        </span>

        <div className={`flex ${current.stroke} [paint-order:stroke_fill] drop-shadow-sm leading-none`}>
          <span className="text-pink-400">C</span>
          <span className="text-pink-400">o</span>
          <span className="text-yellow-400">l</span>
          <span className="text-yellow-400">o</span>
          <span className="text-cyan-400">r</span>
          <span className="text-cyan-400">s</span>
        </div>
      </div>
      
    </div>
  );
}
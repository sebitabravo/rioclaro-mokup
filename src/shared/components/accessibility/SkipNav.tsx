interface SkipNavProps {
  mainId?: string;
  className?: string;
}

export function SkipNav({ mainId = 'main-content', className = '' }: SkipNavProps) {
  return (
    <a
      href={`#${mainId}`}
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2
        bg-gov-primary text-white px-4 py-2 rounded-md z-[9999]
        focus:outline-2 focus:outline-offset-2 focus:outline-gov-primary
        transition-all duration-200
        ${className}
      `}
      aria-label="Saltar al contenido principal"
    >
      Saltar al contenido principal
    </a>
  );
}
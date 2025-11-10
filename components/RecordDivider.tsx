export default function RecordDivider({ 
  color = "#CBAE88",
  flip = false 
}: { 
  color?: string;
  flip?: boolean;
}) {
  return (
    <div className={`relative h-16 overflow-hidden ${flip ? 'rotate-180' : ''}`}>
      <svg viewBox="0 0 1200 64" preserveAspectRatio="none" className="w-full h-full">
        {/* Simple wavy edge without texture */}
        <path
          d="M0,32 Q300,8 600,32 T1200,32 L1200,64 L0,64 Z"
          fill={color}
          opacity="0.3"
        />
      </svg>
    </div>
  );
}


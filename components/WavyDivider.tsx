export default function WavyDivider({ 
  color = "#CBAE88",
  flip = false 
}: { 
  color?: string;
  flip?: boolean;
}) {
  return (
    <div className={`wavy-divider ${flip ? 'rotate-180' : ''}`}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path
          d="M0,60 Q300,20 600,60 T1200,60 L1200,120 L0,120 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}


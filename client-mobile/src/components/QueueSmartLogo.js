import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText
} from 'react-native-svg';

export default function QueueSmartLogo({ size = 92 }) {
  return (
    <Svg height={size} viewBox="0 0 200 200" width={size}>
      <Defs>
        <LinearGradient id="queueSmartLogoGradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <Stop offset="0%" stopColor="#2563EB" />
          <Stop offset="100%" stopColor="#7C3AED" />
        </LinearGradient>
      </Defs>

      <Circle cx="100" cy="100" fill="url(#queueSmartLogoGradient)" r="95" />

      <Path
        d="M92 35 L58 110 C55 118 50 122 42 122 C32 122 25 114 25 104 C25 97 30 91 37 89 L78 58"
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeWidth="6"
      />
      <Path
        d="M108 35 L142 110 C145 118 150 122 158 122 C168 122 175 114 175 104 C175 97 170 91 163 89 L122 58"
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeWidth="6"
      />

      <Circle cx="100" cy="52" fill="#FFFFFF" r="8" />
      <Circle cx="100" cy="52" fill="#2563EB" r="4" />

      <Circle cx="35" cy="112" fill="rgba(255,255,255,0.15)" r="18" stroke="#FFFFFF" strokeWidth="6" />
      <Circle cx="165" cy="112" fill="rgba(255,255,255,0.15)" r="18" stroke="#FFFFFF" strokeWidth="6" />

      <Rect fill="#FFFFFF" height="34" rx="10" width="44" x="78" y="74" />
      <SvgText
        fill="#2563EB"
        fontFamily="Arial"
        fontSize="24"
        fontWeight="900"
        textAnchor="middle"
        x="100"
        y="99"
      >
        Q
      </SvgText>
    </Svg>
  );
}

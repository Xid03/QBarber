const logoIcon = new URL('../../../image/logoicon.png', import.meta.url).href;

export function Logo({ size = 48 }: { size?: number }) {
  return (
    <img
      src={logoIcon}
      width={size}
      height={size}
      alt="QFlow logo"
      className="rounded-xl object-cover"
    />
  );
}

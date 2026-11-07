// Shared geometry for the two signature motifs. Used by Motifs, Patterns, dividers and backgrounds.
export const HALCON = "M0 90L34 50 46 60 72 18 86 34 102 2 122 38 134 28 160 90Z";
export const HALCON_LIT = "M102 2 122 38 134 28 160 90H112L102 40Z";
// Left half of the tamaraw head (mirror for the right). Eyes/ears/nostrils are evenodd cutouts.
export const TAM_HALF = "M50 58C46 46 26 36 13 10 7 30 14 48 30 58 22 58 10 60 3 66 12 74 24 74 32 72 32 82 36 96 40 106 42 112 46 118 50 118ZM35 71 46 76 44 80 36 76ZM10 66C16 68 24 68 28 67 22 64 16 64 10 66ZM44 106a1.800 2.400 0 1 0 .1 0Z";

/** Halcon in a 160x90 box. */
export function HalconShape({ color, lit = true }: { color: string; lit?: boolean }) {
  return <><path d={HALCON} fill={color} />{lit && <path d={HALCON_LIT} fill="#fff" opacity=".22" />}</>;
}
/** Tamaraw head in a 100x120 box. */
export function TamarawShape({ color }: { color: string }) {
  return (
    <g fill={color} fillRule="evenodd"><path d={TAM_HALF} /><path d={TAM_HALF} transform="translate(100 0) scale(-1 1)" /></g>
  );
}

/** Line art for the Ma and Na emblems. Draw inside a stroked <g>/<svg> (fill none, round caps). Mangyan sign is a placeholder: needs community review. */
export function MangyanLines({ color }: { color: string }) {
  return (
    <>
      <rect x="36" y="36" width="28" height="28" />
      {[43, 50, 57].flatMap((x) => [43, 50, 57].map((y) => <circle key={x + "-" + y} cx={x} cy={y} r="1.500" fill={color} stroke="none" />))}
      {Array.from({ length: 8 }, (_, i) => i * 45).map((a) => {
        const end = a % 90 === 0 ? 8 : 18;
        return <g key={a} transform={`rotate(${a} 50 50)`}><path d={`M50 36V${end}`} /><path d={`M43 ${end + 7}H57`} /><path d={`M45 ${end}H55`} /></g>;
      })}
    </>
  );
}
export const LakeLines = () => <><path d="M8 22Q26 8 44 22T80 22T112 22" /><path d="M8 42Q26 28 44 42T80 42T112 42" /><path d="M8 62Q26 48 44 62T80 62T112 62" /></>;

// Flat brand-palette scenes for the history section. Decorative only (aria-hidden); the text beside each one carries the meaning.
import { FIESTA as C } from "@/components/kit/Patterns";
import { PatternFill } from "@/components/kit/Patterns";

const Wave = ({ y, fill, o = 1 }: { y: number; fill: string; o?: number }) => (
  <path d={`M0 ${y}q25 -14 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0V260H0Z`} fill={fill} opacity={o} />
);

/** 1571: galleon under sail. */
const Ship = () => (
  <>
    <rect width="400" height="260" fill={C.sky} />
    <circle cx="318" cy="64" r="34" fill={C.yellow} /><circle cx="318" cy="64" r="50" fill={C.yellow} opacity=".25" />
    <path d="M30 70q28 -18 56 0q-28 -6 -56 0ZM90 44q22 -14 44 0q-22 -5 -44 0Z" fill="#fff" opacity=".7" />
    <Wave y={178} fill={C.blue} o={0.55} />
    <g>
      <rect x="196" y="58" width="6" height="122" fill={C.navy} /><rect x="146" y="82" width="5" height="96" fill={C.navy} /><rect x="250" y="92" width="5" height="84" fill={C.navy} />
      <path d="M202 62 258 66 252 104 202 108Z" fill={C.cream} /><path d="M146 86 196 90 196 150 146 146Z" fill={C.cream} /><path d="M255 96 296 100 292 140 255 140Z" fill={C.cream} />
      <path d="M229 70v32M213 86h32" stroke={C.red} strokeWidth="7" />
      <path d="M202 58 232 46 202 36Z" fill={C.red} />
      <path d="M110 170Q150 214 210 214 290 214 322 168L300 164H128Z" fill={C.orange} />
      <path d="M118 172H312" stroke={C.yellow} strokeWidth="6" /><path d="M300 164 330 140 322 168Z" fill={C.navy} />
      <circle cx="170" cy="190" r="4" fill={C.navy} /><circle cx="200" cy="192" r="4" fill={C.navy} /><circle cx="230" cy="192" r="4" fill={C.navy} />
    </g>
    <Wave y={206} fill={C.navy} o={0.9} /><Wave y={234} fill={C.blue} />
  </>
);

/** 1950: Mindoro split into Oriental (blue) and Occidental (green) along the provincial boundary; pin on Calapan.
 *  Outlines: geoBoundaries gbOpen PHL ADM2 2020 (CC BY 3.0 IGO), simplified. Lubang is left out to keep the main island large. */
const OR_D = "M275.7 226.3 275.2 225.8 273.5 226.5 274.2 227.9 275.0 229.1 275.7 228.9 276.4 228.1ZM286.1 208.5 286.2 211.0 288.1 212.1 288.7 211.7 287.9 210.9 289.0 209.8 287.2 208.4ZM252.6 238.6 255.6 233.9 255.9 228.7 256.3 227.9 256.8 229.0 256.6 227.2 257.5 227.5 258.0 225.4 259.1 224.8 261.5 225.2 263.3 223.8 267.6 223.7 269.5 218.3 272.3 218.7 273.4 223.1 274.6 223.3 274.9 222.4 275.7 223.1 275.4 224.0 275.0 223.6 273.7 224.3 274.1 225.8 275.1 225.6 275.9 223.6 278.1 225.2 278.9 223.6 276.3 220.1 276.7 218.4 275.3 213.5 276.0 212.1 277.2 211.3 280.2 211.1 285.6 213.4 287.5 212.7 283.6 209.4 282.8 207.5 281.0 207.1 280.8 206.3 281.6 205.7 280.3 198.0 282.9 196.6 282.3 194.9 283.1 193.7 286.2 192.6 284.9 190.2 285.9 188.0 284.4 187.8 284.8 186.0 286.2 184.8 289.2 185.5 290.0 184.2 296.6 180.5 298.8 174.3 301.0 171.9 304.9 170.7 303.4 164.0 303.5 159.7 301.9 156.9 301.8 155.0 298.2 150.1 298.0 147.9 297.2 147.7 297.0 149.3 296.4 148.0 295.1 147.5 291.8 143.2 291.3 141.1 292.6 138.8 291.9 136.0 292.7 134.7 292.7 132.5 294.5 128.6 293.0 125.4 292.4 120.8 295.1 113.5 292.9 102.4 293.3 99.1 296.2 93.6 302.7 89.9 305.1 86.5 304.3 83.5 305.0 82.4 303.5 81.9 301.4 79.0 297.1 78.0 297.0 77.0 295.0 78.1 294.8 77.1 293.3 77.8 293.0 78.9 290.3 79.8 285.7 78.4 285.2 76.9 285.7 76.5 284.2 75.0 285.2 75.2 284.8 74.4 287.0 70.4 286.2 69.2 286.4 67.2 285.1 66.5 286.1 66.1 285.5 63.9 284.8 64.4 283.0 63.9 284.2 62.9 281.3 62.4 281.1 61.5 278.7 62.5 277.7 62.1 278.1 61.1 277.0 61.7 276.3 61.2 276.0 62.3 275.2 61.9 275.6 60.5 273.8 58.8 270.9 54.5 271.2 54.0 264.7 47.4 262.7 44.1 253.9 39.1 251.2 35.3 249.6 36.3 250.0 33.8 246.8 31.4 245.3 28.0 244.3 30.3 242.8 31.4 240.5 32.0 238.5 31.5 238.1 32.5 236.3 32.7 235.5 33.5 234.8 32.6 229.1 31.3 222.0 33.7 217.9 31.2 214.9 27.1 212.7 25.9 209.6 22.3 207.7 22.7 206.7 21.0 207.1 20.4 206.0 20.2 204.6 18.3 204.8 16.9 206.2 16.8 206.5 17.6 207.5 16.9 207.2 15.7 209.0 15.5 208.3 15.0 210.3 14.5 210.7 13.4 208.0 13.8 206.3 12.7 205.4 13.0 205.8 14.3 207.2 14.7 206.5 14.7 206.5 15.5 205.6 14.7 205.9 16.1 204.5 16.0 204.2 16.8 203.4 16.8 203.9 16.2 203.1 15.4 203.8 14.3 202.8 13.7 202.1 14.8 203.0 15.7 202.5 16.7 199.5 15.2 197.8 16.4 197.7 15.2 194.1 17.5 192.5 17.2 193.2 21.1 193.0 30.6 178.6 54.9 212.5 72.0 231.7 84.9 240.2 87.0 242.9 89.0 252.1 91.8 253.2 132.6 255.1 144.6 254.7 149.5 255.5 155.2 253.6 180.8 251.8 184.7 250.2 203.7 251.3 219.5 253.1 224.2 252.1 232.6Z";
const OC_D = "M214.2 234.0 213.1 234.6 212.1 237.0 213.0 239.7 215.1 238.7 215.2 239.7 213.6 240.0 216.1 242.0 215.1 240.6 216.0 239.1 217.7 240.3 218.2 239.2 217.3 237.9 216.5 238.0 215.6 235.0ZM224.3 223.3 219.1 224.6 217.5 228.6 217.4 232.3 218.8 233.1 217.9 234.2 218.2 235.7 224.5 238.0 226.6 241.7 226.4 244.5 228.5 245.4 229.4 244.6 231.3 247.8 234.5 246.9 234.6 245.8 231.2 240.1 228.8 239.8 228.9 236.4 229.6 235.7 229.3 233.6 226.7 230.0 226.3 226.7ZM192.5 17.2 187.7 19.9 185.5 19.5 176.9 22.5 169.7 23.3 164.8 20.6 157.2 18.7 147.7 19.3 146.6 18.1 138.5 15.9 133.2 16.8 129.3 15.6 124.7 16.6 121.5 15.4 120.4 13.9 113.9 12.0 102.6 16.4 102.0 17.8 99.6 18.8 98.2 21.1 97.1 21.3 96.8 25.1 94.9 26.7 96.6 29.0 96.6 31.0 97.6 31.3 102.6 37.5 105.2 37.1 109.6 38.7 110.8 36.9 109.9 33.0 114.1 31.8 115.9 30.3 117.8 29.8 122.6 32.3 124.1 34.8 123.0 37.1 123.1 40.0 126.5 50.6 125.2 52.0 129.1 57.4 131.1 56.7 132.4 57.5 133.4 60.4 132.3 64.6 135.5 63.4 138.5 64.3 140.3 63.7 140.4 65.3 144.1 65.1 146.9 69.0 150.7 69.3 154.1 70.7 154.4 72.7 158.0 77.0 159.0 80.0 162.0 83.8 165.6 91.4 167.6 92.0 172.8 104.9 173.9 112.6 174.4 112.6 174.0 113.9 175.9 114.7 174.2 114.1 175.4 119.6 175.5 125.8 173.9 129.6 171.9 130.5 172.7 132.2 173.7 131.0 174.5 131.2 175.9 133.4 176.6 138.8 176.0 140.5 177.2 144.1 176.7 148.4 179.2 150.9 184.4 149.6 187.9 151.4 189.4 156.2 191.8 158.1 193.6 161.2 195.5 161.7 198.4 168.2 199.9 169.0 201.7 175.2 201.2 178.1 199.2 179.9 198.5 182.1 199.5 188.1 203.2 191.6 207.9 200.9 213.2 203.8 218.4 212.3 222.2 214.2 223.2 216.0 226.1 218.1 227.1 218.1 225.5 216.8 226.5 216.4 226.5 214.7 227.3 216.0 228.1 215.7 227.6 217.0 228.0 216.6 229.6 218.7 231.0 216.1 231.6 216.4 231.7 219.4 230.0 221.2 230.9 221.8 230.9 222.8 229.9 223.1 230.6 222.4 229.5 221.6 227.4 224.9 227.7 228.0 229.3 227.0 230.9 228.4 230.8 232.1 230.1 232.6 233.4 233.0 237.2 231.8 243.8 232.3 246.7 233.1 248.6 235.3 250.2 235.4 252.6 238.6 252.1 232.6 253.1 224.2 251.3 219.5 250.2 203.7 251.8 184.7 253.6 180.8 255.5 155.2 254.7 149.5 255.1 144.6 253.2 132.6 252.1 91.8 242.9 89.0 240.2 87.0 231.7 84.9 212.5 72.0 178.6 54.9 193.0 30.6 193.2 21.1Z";
const Split = () => (
  <>
    <rect width="400" height="260" fill={C.mint} />
    <PatternFill variant="dotblocks" colors={[C.blue]} opacity={0.07} />
    <path d={OC_D} fill={C.green} stroke={C.navy} strokeWidth="2.5" strokeLinejoin="round" />
    <path d={OR_D} fill={C.blue} stroke={C.navy} strokeWidth="2.5" strokeLinejoin="round" />
    <g transform="translate(242.0 32.7)">
      <path d="M0 0c-9 -9 -13 -15 -13 -22 0 -8 6 -13 13 -13s13 5 13 13c0 7 -4 13 -13 22Z" fill={C.red} stroke={C.cream} strokeWidth="3" strokeLinejoin="round" /><circle cx="0" cy="-22" r="5" fill={C.cream} />
    </g>
    <g transform="translate(62 62)" stroke={C.navy} strokeWidth="3" strokeLinecap="round" fill="none"><circle r="20" fill={C.cream} /><path d="M0 -14 6 0 0 14 -6 0Z" fill={C.red} stroke="none" /><path d="M0 -26v-6" /></g>
    <g fill={C.navy} opacity=".85"><rect x="40" y="206" width="9" height="9" fill={C.green} stroke={C.navy} strokeWidth="1.500" /><rect x="40" y="224" width="9" height="9" fill={C.blue} stroke={C.navy} strokeWidth="1.500" /></g>
  </>
);

/** 1977: Puerto Galera bay under the mountain. */
const Bay = () => (
  <>
    <rect width="400" height="260" fill={C.sky} />
    <circle cx="86" cy="62" r="30" fill={C.yellow} /><circle cx="86" cy="62" r="46" fill={C.yellow} opacity=".25" />
    <path d="M110 170 190 56 222 100 250 70 360 170Z" fill={C.green} /><path d="M190 56 222 100 200 170H150Z" fill="#2a7f44" opacity=".55" />
    <path d="M190 56 176 78 190 72 204 80Z" fill="#fff" opacity=".35" />
    <path d="M0 176Q80 150 160 170T320 168 400 160V260H0Z" fill={C.mint} />
    <Wave y={190} fill={C.sky} o={0.9} /><Wave y={214} fill={C.blue} o={0.75} /><Wave y={238} fill={C.navy} o={0.9} />
    <g><path d="M236 204h82l-14 16h-54Z" fill={C.orange} /><path d="M258 204V152l32 52Z" fill={C.cream} /><path d="M236 218h-24M318 218h26" stroke={C.navy} strokeWidth="4" strokeLinecap="round" /><path d="M212 212v12M344 212v12" stroke={C.navy} strokeWidth="4" /></g>
    <path d="M52 232q8 -10 18 0q-8 4 -18 0ZM300 242q8 -10 18 0q-8 4 -18 0Z" fill={C.pink} />
  </>
);

/** 1999: bamboo tube carved with script. */
const Script = () => (
  <>
    <rect width="400" height="260" fill={C.yellow} />
    <PatternFill variant="wave" colors={["#fff"]} opacity={0.14} />
    <path d="M30 220C60 160 40 120 70 70M360 236C340 190 372 150 346 100" stroke={C.green} strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M70 70q30 -12 38 14q-30 8 -38 -14ZM346 100q-30 -12 -38 14q30 8 38 -14Z" fill="#2a7f44" />
    <g transform="rotate(-8 200 130)">
      <rect x="48" y="86" width="304" height="88" rx="14" fill={C.green} />
      <rect x="48" y="86" width="304" height="26" rx="13" fill="#fff" opacity=".22" />
      <rect x="148" y="86" width="12" height="88" fill="#2a7f44" /><rect x="252" y="86" width="12" height="88" fill="#2a7f44" />
      <g fill="none" stroke={C.cream} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M76 112q8 -12 16 0t16 0M76 140q14 10 14 -10M104 130l12 16M120 112q6 12 12 0" /><path d="M176 108l14 18 14 -18M178 142q12 -10 24 0M214 112v34M222 130q10 -8 18 4" /><path d="M280 112q10 -4 16 8t18 0M282 142q8 -14 18 -4M308 150l14 -22" />
      </g>
    </g>
  </>
);

/** 2000: nipa hut on stilts, the Mangyan Heritage Center. */
const Hut = () => (
  <>
    <rect width="400" height="260" fill={C.pink} />
    <circle cx="326" cy="62" r="32" fill={C.yellow} />
    <path d="M0 214Q100 176 200 204T400 192V260H0Z" fill={C.green} /><path d="M0 238Q120 214 240 234T400 226V260H0Z" fill="#2a7f44" />
    <g>
      <path d="M90 108 200 34 310 108Z" fill={C.orange} /><path d="M120 108 200 54 280 108Z" fill={C.red} opacity=".5" />
      <path d="M118 88 200 38 282 88M104 98 200 42 296 98" stroke={C.yellow} strokeWidth="3" fill="none" opacity=".7" />
      <rect x="116" y="108" width="168" height="74" fill={C.cream} />
      <path d="M116 126H284M116 142H284" stroke={C.blue} strokeWidth="6" strokeDasharray="14 8" />
      <rect x="182" y="146" width="36" height="36" fill={C.navy} /><path d="M182 146 200 130 218 146Z" fill={C.navy} />
      <rect x="104" y="182" width="192" height="10" fill={C.navy} />
      <path d="M124 192v34M168 192v34M232 192v34M276 192v34" stroke={C.navy} strokeWidth="8" />
      <path d="M210 192 252 226H168Z" fill="none" stroke={C.navy} strokeWidth="0" />
    </g>
    <path d="M44 226V170M44 188q-22 -8 -30 -26M44 182q22 -10 32 -30M44 196q-20 -4 -30 -14" stroke="#2a7f44" strokeWidth="6" fill="none" strokeLinecap="round" />
  </>
);

/** 2001: Pandang Gitab, a dancer with lamps (Pandango sa Ilaw) under strung lights. */
const Lights = () => (
  <>
    <rect width="400" height="260" fill={C.navy} />
    <g fill="#fff" opacity=".8"><circle cx="40" cy="34" r="2" /><circle cx="118" cy="20" r="2" /><circle cx="352" cy="30" r="2" /><circle cx="388" cy="84" r="2" /><circle cx="22" cy="104" r="2" /></g>
    <path d="M0 40Q100 84 200 40T400 40" stroke={C.cream} strokeWidth="2.500" fill="none" opacity=".6" />
    {[[40,56],[90,70],[142,66],[200,40],[258,66],[310,70],[360,56]].map(([x,y],i)=>(<g key={i}><circle cx={x} cy={y+10} r="20" fill={C.yellow} opacity=".25" /><circle cx={x} cy={y+10} r="9" fill={i%2?C.orange:C.yellow} /><path d={`M${x} ${y} v1`} stroke={C.cream} strokeWidth="2" /></g>))}
    <g>
      <circle cx="200" cy="118" r="17" fill={C.pink} /><path d="M184 112q16 -22 32 0Z" fill={C.navy} stroke={C.pink} strokeWidth="2" />
      <path d="M186 138h28l30 86H156Z" fill={C.red} /><path d="M186 138h28l8 24h-44Z" fill={C.orange} />
      <path d="M186 146 142 112M214 146 258 112" stroke={C.pink} strokeWidth="9" strokeLinecap="round" />
      {[[142,112],[258,112]].map(([x,y])=>(<g key={x}><rect x={x-10} y={y-10} width="20" height="16" rx="3" fill={C.cream} /><path d={`M${x} ${y-12}q-8 -12 0 -22q8 10 0 22Z`} fill={C.orange} /><path d={`M${x} ${y-12}q-4 -6 0 -12q4 6 0 12Z`} fill={C.yellow} /></g>))}
      <rect x="190" y="84" width="20" height="14" rx="3" fill={C.cream} /><path d="M200 82q-8 -12 0 -22q8 10 0 22Z" fill={C.orange} />
    </g>
    <path d="M0 232Q100 220 200 232T400 228V260H0Z" fill={C.blue} opacity=".7" />
  </>
);

export const ART: Record<string, () => React.ReactElement> = { "1571": Ship, "1950": Split, "1977": Bay, "1999": Script, "2000": Hut, "2001": Lights };

export default function HeritageArt({ id }: { id: string }) {
  const Scene = ART[id];
  return <svg viewBox="0 0 400 260" className="block h-full w-full" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">{Scene && <Scene />}</svg>;
}

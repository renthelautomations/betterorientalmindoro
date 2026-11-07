// Small inline icon set (24x24, stroke). Add a name here to use it anywhere.
const PATHS = {
  external: "M7 17 17 7M8 7h9v9",
  github: "M9 19c-4 1.5-4-2-6-2m12 4v-3.5a3 3 0 0 0-.8-2.3c2.8-.3 5.800-1.400 5.800-6.200A4.800 4.800 0 0 0 19.700 3.600 4.500 4.500 0 0 0 19.600.3S18.500 0 16 1.700a13.400 13.400 0 0 0-7 0C6.500 0 5.400.3 5.400.3a4.500 4.500 0 0 0-.1 3.300A4.800 4.800 0 0 0 4 7c0 4.800 3 5.900 5.800 6.200A3 3 0 0 0 9 15.500V21",
  book: "M4 19.500A2.500 2.500 0 0 1 6.500 17H20V3H6.500A2.500 2.500 0 0 0 4 5.500v14ZM4 19.500A2.500 2.500 0 0 0 6.500 22H20v-5",
  database: "M12 8c4.400 0 8-1.100 8-2.500S16.400 3 12 3 4 4.100 4 5.500 7.600 8 12 8ZM4 5.500v13C4 19.900 7.600 21 12 21s8-1.100 8-2.500v-13M4 12c0 1.400 3.600 2.500 8 2.500s8-1.100 8-2.500",
  compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM16 8l-2 6-6 2 2-6 6-2Z",
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

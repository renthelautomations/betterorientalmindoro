import Image from "next/image";

/** Better Oriental Mindoro logo: mark + name. tone "dark" is for light backgrounds, "light" for dark ones. Files come from the brand pack in public/brand. */
export default function Logo({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Image
      src={tone === "light" ? "/brand/logo-on-dark.svg" : "/brand/logo-on-light.svg"}
      alt="Better Oriental Mindoro"
      width={1177}
      height={250}
      unoptimized
      className={`h-9 w-auto sm:h-11 ${className}`}
    />
  );
}

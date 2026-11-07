import { Accordion } from "@/components/kit/Ui";

/** One visible line (in the server HTML) that expands to the full neutral note. */
export default function DynNote() {
  return (
    <Accordion items={[{
      q: "Pattern lang ito, hindi patunay.",
      a: (
        <ul className="list-disc space-y-1 pl-5">
          <li>Ang magkaparehong apelyido ay isang <b>pattern</b> lang sa mga talaan ng halalan. Hindi ito patunay na magkamag-anak ang mga tao, at lalong hindi patunay ng anumang mali.</li>
          <li>Maraming pamilya sa Pilipinas ang may parehong apelyido kahit hindi magkaugnay. Magkaugnay man, legal na tumakbo at manalo ang sinuman.</li>
          <li>Binibilang lang namin ang apelyidong hawak ng <b>dalawa o higit pang magkaibang tao</b>. Ang iisang tao na paulit-ulit na nahalal ay hindi binibilang bilang pattern.</li>
          <li>Awtomatikong na-match ang mga pangalan sa iba&apos;t ibang taon, kaya may posibleng pagkakamali. May mga taon o posisyon ding kulang sa source data. Ang &quot;-&quot; ay walang datos.</li>
          <li>Hindi niraranggo ang mga tao. Ang pagkakasunod ng mga apelyido ay ayon lang sa bilang ng panalo sa talaan.</li>
        </ul>
      ),
    }]} />
  );
}

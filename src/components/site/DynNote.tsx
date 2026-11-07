import Bilingual from "@/lib/i18n/Bilingual";
import { TAccordion } from "@/components/site/DynBits";

/** One visible line (in the server HTML) that expands to the full neutral note. Two whole versions (bold markup), chosen by language. */
export default function DynNote() {
  return (
    <TAccordion items={[{
      q: "dyn.note.q",
      a: (
        <Bilingual
          en={(
        <ul className="list-disc space-y-1 pl-5">
          <li>A shared surname is only a <b>pattern</b> in the election records. It is not proof that people are related, and certainly not proof of any wrongdoing.</li>
          <li>Many families in the Philippines share a surname without being related. Even when they are related, anyone may lawfully run and win.</li>
          <li>We only count a surname held by <b>two or more different people</b>. One person elected again and again is not counted as a pattern.</li>
          <li>Names are matched automatically across years, so mistakes are possible. Some years or positions are also missing from the source data. A &quot;-&quot; means no data.</li>
          <li>People are not ranked. Surnames are listed only in order of the number of wins in the record.</li>
        </ul>
          )}
          fil={(
        <ul className="list-disc space-y-1 pl-5">
          <li>Ang magkaparehong apelyido ay isang <b>pattern</b> lang sa mga talaan ng halalan. Hindi ito patunay na magkamag-anak ang mga tao, at lalong hindi patunay ng anumang mali.</li>
          <li>Maraming pamilya sa Pilipinas ang may parehong apelyido kahit hindi magkaugnay. Magkaugnay man, legal na tumakbo at manalo ang sinuman.</li>
          <li>Binibilang lang namin ang apelyidong hawak ng <b>dalawa o higit pang magkaibang tao</b>. Ang iisang tao na paulit-ulit na nahalal ay hindi binibilang bilang pattern.</li>
          <li>Awtomatikong na-match ang mga pangalan sa iba&apos;t ibang taon, kaya may posibleng pagkakamali. May mga taon o posisyon ding kulang sa source data. Ang &quot;-&quot; ay walang datos.</li>
          <li>Hindi niraranggo ang mga tao. Ang pagkakasunod ng mga apelyido ay ayon lang sa bilang ng panalo sa talaan.</li>
        </ul>
          )}
        />
      ),
    }]} />
  );
}

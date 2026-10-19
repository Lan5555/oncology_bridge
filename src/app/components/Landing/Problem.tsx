import Reveal from "./Reveal";
import CrisisCard from "./CrisisCard";
import { EYEBROW, H2_DARK, INNER, P_DARK, SECTION } from "./classes";

const POINTS = [
  {
    num: "Problem 01",
    title: "The 50% Stock-Out Rate",
    body: "Half of Nigerian oncology patients regularly experience medication stock-outs during critical treatment windows, forcing families to manually hunt for life-saving drugs across cities.",
  },
  {
    num: "Problem 02",
    title: "The Verification Black Box",
    body: "Fragmented supply chains mean doctors and pharmacists cannot verify the pedigree or cold-chain history of the medicines they receive, creating clinical risk with every dose.",
  },
  {
    num: "Problem 03",
    title: "Invisible Surplus Stock",
    body: "High-value biologics expire unused in one facility while patients elsewhere face stock-outs. Without visibility, redistribution is impossible. The problem isn't always supply, it's sight.",
  },
];

export default function Problem() {
  return (
    <section className={`${SECTION} bg-offwhite`} id="problem">
      <div className={INNER}>
        <div className="grid grid-cols-2 items-center gap-12 max-[860px]:grid-cols-1">
          <div>
            <div className={EYEBROW}>The Access Crisis</div>
            <h2 className={H2_DARK}>
              Nigeria&rsquo;s oncology supply chain is broken at two ends.
            </h2>
            <p className={`${P_DARK} mb-10`}>
              Life-saving biologics expire in one hospital while patients in the
              next district go without. The supply chain isn&rsquo;t just
              inefficient, it&rsquo;s invisible.
            </p>

            <div className="flex flex-col gap-7">
              {POINTS.map((p, i) => (
                <Reveal
                  className="translate-x-5 transition-[opacity,translate] duration-500"
                  key={p.num}
                  delayMs={i * 80}
                >
                  <div className="mb-1.5 font-display text-[11px] font-bold tracking-[1px] text-sky uppercase">
                    {p.num}
                  </div>
                  <div className="mb-1.5 font-display text-[17px] font-bold text-navy">
                    {p.title}
                  </div>
                  <div className="text-sm leading-[1.7] text-slate-2">
                    {p.body}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <CrisisCard />
          </div>
        </div>
      </div>
    </section>
  );
}

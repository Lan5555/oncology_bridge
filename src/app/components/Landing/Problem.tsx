import Reveal from './Reveal';
import CrisisCard from './CrisisCard';

const POINTS = [
  {
    num: 'Problem 01',
    title: 'The 50% Stock-Out Rate',
    body: 'Half of Nigerian oncology patients regularly experience medication stock-outs during critical treatment windows, forcing families to manually hunt for life-saving drugs across cities.',
  },
  {
    num: 'Problem 02',
    title: 'The Verification Black Box',
    body: 'Fragmented supply chains mean doctors and pharmacists cannot verify the pedigree or cold-chain history of the medicines they receive — creating clinical risk with every dose.',
  },
  {
    num: 'Problem 03',
    title: 'Invisible Surplus Stock',
    body: "High-value biologics expire unused in one facility while patients elsewhere face stock-outs. Without visibility, redistribution is impossible. The problem isn't always supply — it's sight.",
  },
];

export default function Problem() {
  return (
    <section className={"px-5 py-20 md:px-10 md:py-24" + ' ' + "bg-sky-50"} id="problem">
      <div className={"mx-auto max-w-[1100px]"}>
        <div className={"grid grid-cols-1 items-center gap-12 md:grid-cols-2"}>
          <div>
            <div className={"mb-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[1.2px] text-sky-500 before:h-0.5 before:w-5 before:rounded-full before:bg-gradient-to-r before:from-sky-500 before:to-cyan-500 before:content-[\"\"]"}>The Access Crisis</div>
            <h2 className={"mb-4 text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold leading-[1.15] text-[#050e1f] [font-family:'Plus_Jakarta_Sans',sans-serif]"}>Nigeria&rsquo;s oncology supply chain is broken at two ends.</h2>
            <p className={"max-w-[560px] text-base leading-8 text-slate-500"} style={{ marginBottom: '2.5rem' }}>
              Life-saving biologics expire in one hospital while patients in the next district go
              without. The supply chain isn&rsquo;t just inefficient — it&rsquo;s invisible.
            </p>

            <div className={"flex flex-col gap-7"}>
              {POINTS.map((p, i) => (
                <Reveal className={"transition duration-500"} key={p.num} delayMs={i * 80}>
                  <div className={"mb-1.5 text-[11px] font-bold uppercase tracking-[1px] text-sky-500 [font-family:'Plus_Jakarta_Sans',sans-serif]"}>{p.num}</div>
                  <div className={"mb-1.5 text-[17px] font-bold text-[#050e1f] [font-family:'Plus_Jakarta_Sans',sans-serif]"}>{p.title}</div>
                  <div className={"text-[13px] leading-7 text-slate-500"}>{p.body}</div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className={"relative flex items-center justify-center"}>
            <CrisisCard />
          </div>
        </div>
      </div>
    </section>
  );
}

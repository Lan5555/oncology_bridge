import Counter from './Counter';
import Reveal from './Reveal';

const BLOCK = 'translate-y-6 bg-navy/50 p-10 text-center transition-[opacity,translate] duration-600';
const NUM = 'mb-2 bg-linear-135 from-sky via-cyan to-teal bg-clip-text font-display text-[clamp(2.2rem,3.5vw,3.2rem)] leading-none font-extrabold tracking-[-2px] text-transparent';
const LABEL = 'text-[13px] font-medium text-white/45';

export default function Stats() {
  return (
    <section className="bg-navy-2 px-10 py-20 max-[600px]:px-5 max-[600px]:py-12" aria-label="Platform statistics">
      <div className="mx-auto grid max-w-[1100px] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-0.5 overflow-hidden rounded-2xl border border-white/6 bg-white/4">
        <Reveal className={BLOCK} delayMs={0}>
          <div className={NUM}><Counter target={50} /><span className="align-super text-[0.5em] [-webkit-text-fill-color:var(--color-cyan)]">%</span></div>
          <div className={LABEL}>of Nigerian patients face medication stock-outs</div>
        </Reveal>
        <Reveal className={BLOCK} delayMs={100}>
          <div className={NUM}>₦<Counter target={42} />M</div>
          <div className={LABEL}>in drug wastage prevented this quarter</div>
        </Reveal>
        <Reveal className={BLOCK} delayMs={200}>
          <div className={NUM}><Counter target={24} /></div>
          <div className={LABEL}>verified facilities in the Lagos–Ibadan corridor</div>
        </Reveal>
        <Reveal className={BLOCK} delayMs={300}>
          <div className={NUM}><Counter target={1847} /></div>
          <div className={LABEL}>biologics verified via GS1 this month</div>
        </Reveal>
      </div>
    </section>
  );
}

import Counter from './Counter';
import Reveal from './Reveal';

export default function Stats() {
  return (
    <section className={"bg-[#0a1628] px-5 py-20 md:px-10"} aria-label="Platform statistics">
      <div className={"mx-auto grid max-w-[1100px] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5"}>
        <Reveal className={"bg-[#050e1f]/50 p-10 text-center transition duration-500"} delayMs={0}>
          <div className={"mb-2 bg-gradient-to-br from-sky-500 via-cyan-500 to-cyan-700 bg-clip-text text-[clamp(2.2rem,3.5vw,3.2rem)] font-extrabold leading-none text-transparent [font-family:'Plus_Jakarta_Sans',sans-serif]"}><Counter target={50} /><span className={"align-super text-[0.5em] text-cyan-400"}>%</span></div>
          <div className={"text-[13px] font-medium text-white/45"}>of Nigerian patients face medication stock-outs</div>
        </Reveal>
        <Reveal className={"bg-[#050e1f]/50 p-10 text-center transition duration-500"} delayMs={100}>
          <div className={"mb-2 bg-gradient-to-br from-sky-500 via-cyan-500 to-cyan-700 bg-clip-text text-[clamp(2.2rem,3.5vw,3.2rem)] font-extrabold leading-none text-transparent [font-family:'Plus_Jakarta_Sans',sans-serif]"}>₦<Counter target={42} />M</div>
          <div className={"text-[13px] font-medium text-white/45"}>in drug wastage prevented this quarter</div>
        </Reveal>
        <Reveal className={"bg-[#050e1f]/50 p-10 text-center transition duration-500"} delayMs={200}>
          <div className={"mb-2 bg-gradient-to-br from-sky-500 via-cyan-500 to-cyan-700 bg-clip-text text-[clamp(2.2rem,3.5vw,3.2rem)] font-extrabold leading-none text-transparent [font-family:'Plus_Jakarta_Sans',sans-serif]"}><Counter target={24} /></div>
          <div className={"text-[13px] font-medium text-white/45"}>verified facilities in the Lagos–Ibadan corridor</div>
        </Reveal>
        <Reveal className={"bg-[#050e1f]/50 p-10 text-center transition duration-500"} delayMs={300}>
          <div className={"mb-2 bg-gradient-to-br from-sky-500 via-cyan-500 to-cyan-700 bg-clip-text text-[clamp(2.2rem,3.5vw,3.2rem)] font-extrabold leading-none text-transparent [font-family:'Plus_Jakarta_Sans',sans-serif]"}><Counter target={1847} /></div>
          <div className={"text-[13px] font-medium text-white/45"}>biologics verified via GS1 this month</div>
        </Reveal>
      </div>
    </section>
  );
}

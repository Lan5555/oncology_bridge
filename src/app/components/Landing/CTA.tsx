'use client';
import { useRouter } from 'next/navigation';
export default function CTA() {
  const router = useRouter();
  return (
    <section className={"relative overflow-hidden bg-[#050e1f] px-5 py-20 text-center md:px-10 md:py-24"} id="cta">
      <div className={"relative z-[1] mx-auto max-w-[640px]"}>
        <div className={"mb-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[1.2px] text-sky-500 before:h-0.5 before:w-5 before:rounded-full before:bg-gradient-to-r before:from-sky-500 before:to-cyan-500 before:content-[\"\"]"} style={{ justifyContent: 'center' }}>Join the Network</div>
        <h2 className={"mb-5 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.15] text-white [font-family:'Plus_Jakarta_Sans',sans-serif]"}>Every patient deserves verified medicine, precisely when they need it.</h2>
        <p className={"mb-10 text-base leading-8 text-white/50"}>
          We&rsquo;re onboarding anchor institutions across Lagos and Ibadan. Apply for early
          access and place your facility at the centre of Nigeria&rsquo;s oncology supply
          solution.
        </p>
        <div className={"flex flex-wrap justify-center gap-3"}>
          <button className={"inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border-0 px-7 py-3.5 text-sm font-bold transition [font-family:'Plus_Jakarta_Sans',sans-serif]" + ' ' + "bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/40"} onClick={() => router.push('/auth')}>Apply for Facility Access</button>
          <button className={"inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border-0 px-7 py-3.5 text-sm font-bold transition [font-family:'Plus_Jakarta_Sans',sans-serif]" + ' ' + "border border-white/15 bg-white/5 text-white/85 hover:border-white/30 hover:bg-white/10"} onClick={() => router.push('/pages/demo')}>Schedule a Demo</button>
        </div>
      </div>
    </section>
  );
}

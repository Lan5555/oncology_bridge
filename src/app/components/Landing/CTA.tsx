'use client';
import { EYEBROW } from './classes';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
export default function CTA() {
  const router = useRouter();
  return (
    <section className="relative overflow-hidden bg-navy px-10 py-28 text-center before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(14,165,233,0.2)_0%,transparent_65%)] before:content-[''] max-[600px]:px-5 max-[600px]:py-20" id="cta">
      <div className="relative z-[1] mx-auto max-w-[640px]">
        <div className={`${EYEBROW} justify-center`}>Join the Network</div>
        <h2 className="mb-5 font-display text-[clamp(2rem,4vw,3rem)] leading-[1.15] font-extrabold tracking-[-1.2px] text-white">Every patient deserves verified medicine, precisely when they need it.</h2>
        <p className="mb-10 text-base leading-[1.8] text-white/50">
          We&rsquo;re onboarding anchor institutions across Lagos and Ibadan. Apply for early
          access and place your facility at the centre of Nigeria&rsquo;s oncology supply
          solution.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button className="cursor-pointer rounded-[10px] bg-linear-135 from-sky to-cyan px-7 py-3.5 font-display text-sm font-bold text-white shadow-[0_4px_20px_rgba(14,165,233,0.3)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(14,165,233,0.4)]" onClick={() => router.push('/pages/auth')}>Apply for Facility Access</button>
          <button className="cursor-pointer rounded-[10px] border border-white/20 bg-transparent px-7 py-3.5 font-display text-sm font-bold text-white/75 transition-all duration-250 hover:border-white/40 hover:text-white" onClick={() => toast.info('Demo would be scheduled here..')}>Schedule a Demo</button>
        </div>
      </div>
    </section>
  );
}

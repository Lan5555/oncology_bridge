'use client';

import { getAccountInfo, VERIFICATION_COPY } from '../lib/accounts';
import { useProvider } from '../providers/provider';

export default function VerificationGate() {
  const { userData } = useProvider();
  const user = userData.user;
  const info = getAccountInfo(user?.account_type);
  const status = user?.verification_status ?? 'PENDING';
  const copy = VERIFICATION_COPY[status];
  const rejected = status === 'REJECTED';

  return (
    <div className="mx-auto max-w-[560px] animate-fade-up">
      <div className="bg-w border border-g200 rounded-xl p-8 shadow-[0_16px_40px_rgba(15,23,42,0.04)] text-center">
        <div className={`mx-auto mb-4 flex size-12 items-center justify-center rounded-full ${rejected ? 'bg-errl text-err' : 'bg-warnl text-warn'}`}>
          <svg viewBox="0 0 24 24" className="size-6 fill-none stroke-current stroke-2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        </div>
        <h1 className="text-xl font-bold text-g900 tracking-[-0.4px]">{copy.title}</h1>
        <p className="mt-2 text-[13px] leading-[1.6] text-g500">{copy.body}</p>

        <div className="mt-6 grid grid-cols-2 gap-y-2 rounded-lg border border-g100 bg-g50 p-4 text-left text-[12.5px]">
          <span className="text-g500">Account type</span>
          <span className="text-right font-semibold text-g800">{info?.label ?? '\u2014'}</span>
          <span className="text-g500">Registry</span>
          <span className="text-right font-semibold text-g800">{info?.registry.replace('_', ' ') ?? '\u2014'}</span>
          <span className="text-g500">Licence number</span>
          <span className="text-right font-mono font-semibold text-g800">{user?.license_number || '\u2014'}</span>
        </div>

        <p className="mt-5 text-[11.5px] text-g400">You can still update your profile under Settings while you wait.</p>
      </div>
    </div>
  );
}

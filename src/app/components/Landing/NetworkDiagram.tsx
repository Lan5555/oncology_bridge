export default function NetworkDiagram() {
  return (
            <svg id="networkSvg" viewBox="0 0 700 260" xmlns="http://www.w3.org/2000/svg" aria-label="Animated hospital supply network showing vials moving between facilities">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor: '#0EA5E9', stopOpacity: '.8'}}/>
                  <stop offset="100%" style={{stopColor: '#06B6D4', stopOpacity: '.8'}}/>
                </linearGradient>
              </defs>
    
              
              <line x1="120" y1="100" x2="280" y2="80" stroke="rgba(14,165,233,.15)" strokeWidth="1.5" strokeDasharray="4 4"/>
              <line x1="280" y1="80" x2="420" y2="100" stroke="rgba(14,165,233,.15)" strokeWidth="1.5" strokeDasharray="4 4"/>
              <line x1="420" y1="100" x2="580" y2="80" stroke="rgba(14,165,233,.15)" strokeWidth="1.5" strokeDasharray="4 4"/>
              <line x1="120" y1="100" x2="280" y2="190" stroke="rgba(14,165,233,.08)" strokeWidth="1.5" strokeDasharray="4 4"/>
              <line x1="280" y1="80" x2="420" y2="190" stroke="rgba(14,165,233,.08)" strokeWidth="1.5" strokeDasharray="4 4"/>
              <line x1="280" y1="190" x2="420" y2="100" stroke="rgba(14,165,233,.08)" strokeWidth="1.5" strokeDasharray="4 4"/>
              <line x1="420" y1="100" x2="580" y2="190" stroke="rgba(14,165,233,.08)" strokeWidth="1.5" strokeDasharray="4 4"/>
    
              
              
              <circle cx="120" cy="100" r="32" fill="rgba(14,165,233,.08)" stroke="rgba(14,165,233,.3)" strokeWidth="1.5"/>
              <circle cx="120" cy="100" r="20" fill="rgba(14,165,233,.15)" stroke="#0EA5E9" strokeWidth="1.5"/>
              <text x="120" y="104" textAnchor="middle" fill="white" fontSize="8" fontFamily="Inter" fontWeight="600">LUTH</text>
              <circle cx="120" cy="100" r="32" fill="none" stroke="rgba(14,165,233,.15)" strokeWidth="1" opacity="0"><animate attributeName="r" from="32" to="48" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" from=".4" to="0" dur="3s" repeatCount="indefinite"/></circle>
    
              
              <circle cx="280" cy="80" r="36" fill="rgba(6,182,212,.1)" stroke="rgba(6,182,212,.35)" strokeWidth="1.5"/>
              <circle cx="280" cy="80" r="22" fill="rgba(6,182,212,.2)" stroke="#06B6D4" strokeWidth="1.5" filter="url(#glow)"/>
              <text x="280" y="76" textAnchor="middle" fill="white" fontSize="7.5" fontFamily="Inter" fontWeight="600">EKO</text>
              <text x="280" y="87" textAnchor="middle" fill="rgba(255,255,255,.6)" fontSize="6.5" fontFamily="Inter">Hospital</text>
              <circle cx="280" cy="80" r="36" fill="none" stroke="rgba(6,182,212,.2)" strokeWidth="1" opacity="0"><animate attributeName="r" from="36" to="54" dur="3.5s" begin="1s" repeatCount="indefinite"/><animate attributeName="opacity" from=".4" to="0" dur="3.5s" begin="1s" repeatCount="indefinite"/></circle>
    
              
              <circle cx="420" cy="100" r="32" fill="rgba(14,165,233,.08)" stroke="rgba(14,165,233,.3)" strokeWidth="1.5"/>
              <circle cx="420" cy="100" r="20" fill="rgba(14,165,233,.15)" stroke="#0EA5E9" strokeWidth="1.5"/>
              <text x="420" y="96" textAnchor="middle" fill="white" fontSize="7" fontFamily="Inter" fontWeight="600">UCH</text>
              <text x="420" y="107" textAnchor="middle" fill="rgba(255,255,255,.55)" fontSize="6" fontFamily="Inter">Ibadan</text>
    
              
              <circle cx="280" cy="190" r="28" fill="rgba(14,165,233,.07)" stroke="rgba(14,165,233,.2)" strokeWidth="1.5"/>
              <circle cx="280" cy="190" r="17" fill="rgba(14,165,233,.12)" stroke="#0EA5E9" strokeWidth="1"/>
              <text x="280" y="193" textAnchor="middle" fill="rgba(255,255,255,.7)" fontSize="7.5" fontFamily="Inter" fontWeight="600">LASUTH</text>
    
              
              <circle cx="420" cy="190" r="28" fill="rgba(14,165,233,.07)" stroke="rgba(14,165,233,.2)" strokeWidth="1.5"/>
              <circle cx="420" cy="190" r="17" fill="rgba(14,165,233,.12)" stroke="#0EA5E9" strokeWidth="1"/>
              <text x="420" y="186" textAnchor="middle" fill="rgba(255,255,255,.7)" fontSize="7" fontFamily="Inter" fontWeight="600">Lagos</text>
              <text x="420" y="196" textAnchor="middle" fill="rgba(255,255,255,.5)" fontSize="6" fontFamily="Inter">Island GH</text>
    
              
              <circle cx="580" cy="80" r="28" fill="rgba(14,165,233,.07)" stroke="rgba(14,165,233,.2)" strokeWidth="1.5"/>
              <circle cx="580" cy="80" r="17" fill="rgba(14,165,233,.12)" stroke="#0EA5E9" strokeWidth="1"/>
              <text x="580" y="76" textAnchor="middle" fill="rgba(255,255,255,.7)" fontSize="6.5" fontFamily="Inter" fontWeight="600">Lagos</text>
              <text x="580" y="86" textAnchor="middle" fill="rgba(255,255,255,.5)" fontSize="6" fontFamily="Inter">State Hosp.</text>
    
              <circle cx="580" cy="190" r="28" fill="rgba(14,165,233,.07)" stroke="rgba(14,165,233,.2)" strokeWidth="1.5"/>
              <circle cx="580" cy="190" r="17" fill="rgba(14,165,233,.12)" stroke="#0EA5E9" strokeWidth="1"/>
              <text x="580" y="186" textAnchor="middle" fill="rgba(255,255,255,.7)" fontSize="7" fontFamily="Inter" fontWeight="600">Island</text>
              <text x="580" y="196" textAnchor="middle" fill="rgba(255,255,255,.5)" fontSize="6" fontFamily="Inter">Clinic</text>
    
              
              
              <circle r="5" fill="#0EA5E9" filter="url(#glow)" opacity=".9">
                <animateMotion dur="4s" repeatCount="indefinite" begin="0s">
                  <mpath href="#path1"/>
                </animateMotion>
              </circle>
              <path id="path1" d="M120,100 L280,80" fill="none"/>
    
              
              <circle r="5" fill="#06B6D4" filter="url(#glow)" opacity=".9">
                <animateMotion dur="3.5s" repeatCount="indefinite" begin="1s">
                  <mpath href="#path2"/>
                </animateMotion>
              </circle>
              <path id="path2" d="M280,80 L420,100" fill="none"/>
    
              
              <circle r="4" fill="#0EA5E9" filter="url(#glow)" opacity=".7">
                <animateMotion dur="4.5s" repeatCount="indefinite" begin="2s">
                  <mpath href="#path3"/>
                </animateMotion>
              </circle>
              <path id="path3" d="M420,100 L580,80" fill="none"/>
    
              
              <circle r="4" fill="#38BDF8" filter="url(#glow)" opacity=".7">
                <animateMotion dur="5s" repeatCount="indefinite" begin=".5s">
                  <mpath href="#path4"/>
                </animateMotion>
              </circle>
              <path id="path4" d="M280,80 L280,190" fill="none"/>
    
              
              <circle r="4" fill="#0EA5E9" filter="url(#glow)" opacity=".7">
                <animateMotion dur="4s" repeatCount="indefinite" begin="1.5s">
                  <mpath href="#path5"/>
                </animateMotion>
              </circle>
              <path id="path5" d="M420,100 L420,190" fill="none"/>
    
              
              <rect x="258" y="118" width="124" height="22" rx="11" fill="rgba(16,185,129,.12)" stroke="rgba(16,185,129,.3)" strokeWidth="1"/>
              <circle cx="275" cy="129" r="4" fill="#10B981"><animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite"/></circle>
              <text x="283" y="133" fill="#10B981" fontSize="8.5" fontFamily="Inter" fontWeight="600">All systems verified · GS1 active</text>
            </svg>
  );
}

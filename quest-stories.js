/* ScrollSentinel: educational cybersecurity SVG stories. No remote assets.
 * Every story animates once (~9 seconds); the guard replays it every 5 minutes.
 * Static illustrations are shown when reduced-motion is enabled.
 */
(() => {
  'use strict';
  const ns = 'http://www.w3.org/2000/svg';
  const show = (markup, delay) => '<g class="ss-enter" style="animation-delay:'+delay+'s">'+markup+'</g>';
  const hide = (markup, delay) => '<g class="ss-remove" style="animation-delay:'+delay+'s">'+markup+'</g>';
  const person = (x,y,color,name) =>
    '<g transform="translate('+x+' '+y+')">'+
    '<circle cy="-22" r="18" fill="#f2c8a7" stroke="#26384d" stroke-width="2"/>'+
    '<path d="M-15-27q8-12 16-10q13 1 16 11" fill="none" stroke="#27364e" stroke-width="7"/>'+
    '<path d="M-30 36q2-45 30-45t30 45" fill="'+color+'" stroke="#1d425c" stroke-width="3"/>'+
    '<circle cx="-6" cy="-22" r="2" fill="#172638"/>'+
    '<circle cx="6" cy="-22" r="2" fill="#172638"/>'+
    '<path d="M-7-13q7 7 14 0" stroke="#a15f4a" fill="none" stroke-width="2"/>'+
    '<text y="54" text-anchor="middle" class="ss-person-name">'+name+'</text></g>';
  const label = (x,y,s,color='#dcefff',size=14) =>
    '<text x="'+x+'" y="'+y+'" text-anchor="middle" fill="'+color+'" font-size="'+size+'" font-weight="700" font-family="system-ui,sans-serif">'+s+'</text>';
  const card = (x,y,w,h,title,detail,color='#68cdf7') =>
    '<g><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="12" stroke="'+color+'" stroke-width="2" fill="#132b42"/>'+
    label(x+w/2,y+22,title,color,14)+label(x+w/2,y+44,detail,'#bcd9e9',12)+'</g>';
  const move = (a,b,c,d,t,color='#80e4ff') =>
    '<path class="ss-draw" d="M'+a+' '+b+'L'+c+' '+d+'" stroke="'+color+'" stroke-width="3.5" stroke-linecap="round" fill="none" style="animation-delay:'+t+'s"/>'+
    show('<path d="M'+(c-8)+' '+(d-6)+'L'+c+' '+d+'L'+(c-8)+' '+(d+6)+'" stroke="'+color+'" fill="none" stroke-width="3"/>',t+.75);
  const win = (s,time=7.6) => show('<rect x="100" y="223" width="320" height="29" rx="14" fill="#16513f" stroke="#8cf1be" stroke-width="1.4"/>'+
    label(260,243,s,'#d8ffe9',13),time);
  const padlock = (x,y) => '<g transform="translate('+x+' '+y+')"><path d="M-10 0v-10a10 10 0 0120 0V0" stroke="#88f4bb" stroke-width="5" fill="none"/>'+
    '<rect x="-17" y="-2" width="34" height="28" rx="5" stroke="#a0f9c7" stroke-width="2" fill="#1b6550"/>'+
    '<circle cy="10" r="3.5" fill="#d6fff0"/></g>';
  const alert = (x,y,title) => '<g><path d="M'+x+' '+(y-18)+'l21 37h-42z" stroke="#ff95a3" fill="#7a3542" stroke-width="2"/>'+
    label(x,y+8,'!','#fff',19)+label(x,y+38,title,'#ffb5c2',12)+'</g>';
  const scenes = {
    packets: () => person(66,140,'#3588ba','SENDER')+
      card(197,51,124,62,'TCP','reliable','#76cbf8')+
      card(197,145,124,62,'UDP','fast','#c1a9ff')+
      person(456,140,'#2d9b80','RECEIVER')+
      move(111,110,194,85,.9)+show(label(260,129,'SYN → ACK','#a4e5ff',14),2.1)+move(325,87,405,114,2.8)+
      show(label(397,69,'✓ ACK','#a3f3c5',14),4.0)+
      move(110,160,192,172,4.55,'#b9a4ff')+move(324,174,404,162,5.8,'#b9a4ff')+
      show(label(260,216,'TCP verifies delivery; UDP prioritizes speed','#c1e3fa',12),6.9)+
      win('🎉 DATA DELIVERY EXPLAINED'),
    access: () => person(66,141,'#368eb9','EMPLOYEE')+
      card(193,54,125,62,'ADMIN','restricted','#ff9dad')+
      card(193,146,125,62,'READ ONLY','permitted','#80edb7')+
      card(382,97,108,72,'DATA','sensitive')+
      move(111,111,187,85,1,'#fa93a5')+
      show(label(258,135,'✕ DENIED','#ff9ead',16),2.4)+
      move(112,164,187,174,3.4,'#7beabb')+
      show(label(258,220,'Grant only required permissions','#c9eafa',12),4.5)+
      move(319,174,379,143,5.35,'#80f1c7')+
      show(padlock(430,126),6.5)+win('✓ LEAST PRIVILEGE ENFORCED'),
    patch: () => person(68,150,'#419ec7','ENGINEER')+
      hide(alert(258,94,'VULNERABLE'),5.4)+
      hide(card(378,84,113,92,'SERVER','version 1.0','#ff94a3'),5.65)+
      show(card(378,84,113,92,'SERVER','version 1.1','#83efbe'),5.85)+
      show(label(163,81,'UPDATE READY','#badff8',13),.7)+
      move(112,132,210,132,1.55)+
      show(card(217,109,108,64,'PATCH','version 1.1','#efc976'),2.6)+
      move(325,140,375,130,4.25,'#90edbb')+
      show(label(428,198,'✓ PATCHED','#95f3c0',16),5.75)+
      show(label(254,218,'Apply timely updates to reduce known risks','#d0eafa',12),6.3)+
      win('🎉 VULNERABILITY REMEDIATED'),
    hash: () => person(60,147,'#338cba','USER')+
      card(135,97,111,66,'PASSWORD','••••••••','#d0b7ff')+
      card(272,97,102,66,'SALT','unique random','#f6c77d')+
      move(103,125,132,125,.7)+
      move(247,130,270,130,2.4,'#d2beff')+
      show(label(325,75,'➕','#f8d18e',22),3.2)+
      show(card(396,90,116,73,'HASH','7a4c…e120','#9defc3'),4.2)+
      move(374,131,395,130,4.8,'#9eeeca')+
      show(padlock(453,130),6.1)+
      show(label(258,215,'Store salted password hashes, not plaintext','#d5edfb',12),6.8)+
      win('✓ PASSWORD STORAGE HARDENED'),
    mfa: () => person(66,135,'#4097be','YOU')+
      card(153,68,130,68,'PASSWORD','first factor')+
      card(316,68,124,68,'PHONE OTP','second factor','#f7ca85')+
      move(112,111,151,104,.9)+
      show(label(220,161,'✓ VERIFIED','#95f3be',13),2.35)+
      move(284,104,313,104,3.1,'#efcb8c')+
      show(label(376,163,'🔑 CODE OK','#f5d69f',14),4.7)+
      move(376,170,376,192,5.75,'#8ce6ae')+
      show(padlock(376,191),6.7)+win('🎉 TWO FACTORS VERIFIED'),
    shield: () => person(68,149,'#378ab5','REQUESTER')+
      card(177,54,128,64,'IDENTITY','verify person')+
      card(177,146,128,61,'DEVICE','verify posture')+
      card(389,102,113,75,'SERVICE','protected')+
      move(111,114,171,84,.8)+show(label(240,135,'✓ identity','#91f3bf',13),2.35)+
      move(111,168,172,176,3.4)+show(label(239,216,'✓ device','#96f5c3',13),4.65)+
      move(305,139,386,139,5.7,'#81f0b3')+
      show(padlock(447,131),6.7)+win('✓ VERIFIED BEFORE GRANTING ACCESS'),
    terminal: () => person(65,148,'#378dbc','LINUX USER')+
      '<rect x="135" y="37" width="355" height="170" rx="12" fill="#071723" stroke="#489eb6" stroke-width="2"/>'+
      '<path d="M146 63h332" stroke="#294b63"/>'+
      label(312,56,'SECURITY TERMINAL','#c7eafe',14)+
      show(label(306,95,'$ ls -l secret.txt','#8bf0b3',17),.7)+
      show(label(306,123,'-rw-r--r--  secret.txt','#ffb3c2',15),2.25)+
      show(label(306,156,'$ chmod 600 secret.txt','#a2eafa',17),3.95)+
      show(label(306,188,'-rw------- ✓ PRIVATE','#95f4bf',16),6.15)+
      win('🎉 FILE PERMISSIONS SECURED'),
    radar: () => person(64,144,'#3e98b9','ANALYST')+
      card(200,90,127,80,'ASSET','database','#8adafa')+
      show(alert(429,87,'THREAT'),1.1)+
      move(392,112,335,121,2.7,'#ff9cad')+
      show(label(260,199,'Risk: exposed data','#ffbdc8',13),3.9)+
      show('<path d="M348 49l31 14v35q0 28-31 40q-31-12-31-40V63Z" fill="#1f6555" stroke="#9defc6" stroke-width="3"/>'+
        label(348,103,'✓','#e4fff5',29),5.4)+
      show(label(426,173,'MITIGATED','#91f2b9',15),6.65)+
      win('✓ THREAT MODEL COMPLETE'),
    phishing: () => person(65,150,'#468bb9','YOU')+
      person(465,55,'#9f526c','SCAMMER')+
      move(421,85,397,89,.35,'#ff96a9')+
      hide('<rect x="162" y="50" width="233" height="150" rx="12" fill="#172e46" stroke="#ff94a9" stroke-width="2"/>'+
        label(279,79,'📩 SUSPICIOUS EMAIL','#ffb7c5',16)+
        label(279,111,'Account locked! Click now','#fff',13)+
        label(279,145,'From: alerts@paypaI.test','#ffafbf',12)+
        label(279,175,'⚠ CHECK THE DOMAIN','#ffb5be',13),6.5)+
      show(alert(449,114,'PHISHING'),3.1)+
      show(label(263,217,'Inspect links and sender before clicking','#a3e9fb',12),4.35)+
      show('<rect x="162" y="50" width="233" height="150" rx="12" fill="#164438" stroke="#8cefc0" stroke-width="2"/>'+
        label(279,116,'✓ REPORTED','#c3ffe0',22)+
        label(279,152,'Suspicious email removed','#b9f2dc',13),6.6)+
      win('🎉 PHISHING ATTEMPT BLOCKED',7.75),
    triad: () => person(80,124,'#378eae','DEFENDER')+
      show('<path d="M260 46L157 193H363Z" fill="#9aa6ff11" stroke="#a5b9ff" stroke-width="4" stroke-dasharray="8 6"/>',.85)+
      show(card(197,30,126,61,'C','confidentiality','#88dffa'),1.4)+
      show(card(101,137,126,63,'I','integrity','#c3adff'),3.0)+
      show(card(292,137,126,63,'A','availability','#8beaaf'),4.7)+
      show('<circle cx="260" cy="126" r="33" fill="#1a5b50" stroke="#94ecc6" stroke-width="3"/>'+
        label(260,137,'🛡','#c9ffe8',28),6.45)+
      win('🎉 THREE SECURITY GOALS ALIGNED'),
    code: () => person(67,140,'#358fba','RESEARCHER')+
      card(171,56,144,66,'PERMISSION','scope approved','#8bd9fb')+
      move(110,109,165,87,.8)+
      show(label(245,156,'✓ AUTHORIZED','#88f3bc',15),2.2)+
      show(card(348,80,148,91,'TEST LAB','your own sandbox','#cbb0fb'),3.45)+
      move(316,125,344,125,4.65,'#96eabb')+
      show(label(423,191,'✓ SAFE TEST','#91f8c1',15),6.25)+
      show(label(258,216,'Never test without permission','#c9e9f4',12),6.95)+
      win('🏆 ETHICAL PRACTICE COMPLETED')
  };

  const css = "\n.ss-story{width:100%;height:100%;display:block;overflow:hidden}\n.ss-person-name{font:700 12px system-ui,sans-serif;fill:#daeaf7}\n.ss-enter{opacity:0;animation:ssEnter .55s ease-out both}\n.ss-remove{animation:ssRemove .45s ease-in forwards}\n.ss-draw{stroke-dasharray:260;stroke-dashoffset:260;animation:ssDraw .9s ease-out both}\n@keyframes ssEnter{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}\n@keyframes ssRemove{to{opacity:0}}\n@keyframes ssDraw{to{stroke-dashoffset:0}}\n@media(prefers-reduced-motion:reduce){\n .ss-enter{animation:none!important;opacity:1!important;transform:none!important}\n .ss-remove{display:none!important}\n .ss-draw{animation:none!important;stroke-dashoffset:0!important}\n}\n";

  function create(type) {
    if (!Object.prototype.hasOwnProperty.call(scenes,type)) return null;
    const svg=document.createElementNS(ns,'svg');
    svg.setAttribute('class','ss-story');
    svg.setAttribute('viewBox','0 0 520 260');
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.setAttribute('aria-hidden','true');
    svg.innerHTML='<defs><radialGradient id="ss-stage" cx="50%" cy="42%" r="70%">'+
      '<stop stop-color="#1a3f56"/><stop offset="1" stop-color="#081726"/></radialGradient></defs>'+
      '<rect width="520" height="260" rx="12" fill="url(#ss-stage)"/>'+
      '<path d="M0 210H520" stroke="#4e6d83" stroke-opacity=".35" stroke-dasharray="8 9"/>'+
      scenes[type]();
    return svg;
  }
  globalThis.ScrollSentinelStories = Object.freeze({
    create,styles:css,storyTypes:Object.freeze(Object.keys(scenes))
  });
})();

/* Lotto AI Lab — region dashboard v3. No third-party dependencies. */
(() => {
  'use strict';
  const REGIONS = ['전체','서울','경기','인천','부산','대구','광주','대전','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주'];
  const CSS = `
    #lal-v3{--ink:#10294b;--blue:#1457ae;--pale:#eef6ff;--line:#dce8f5;font-family:inherit;color:var(--ink);max-width:1160px;margin:24px auto 32px}
    #lal-v3 *{box-sizing:border-box}#lal-v3 .lal-hero{padding:25px 28px;background:linear-gradient(115deg,#edf7ff,#fff 66%);border:1px solid var(--line);border-radius:22px;margin-bottom:14px}
    #lal-v3 .lal-eyebrow{font-size:12px;font-weight:800;letter-spacing:.1em;color:var(--blue)}#lal-v3 h2{font-size:clamp(22px,3vw,34px);line-height:1.3;margin:7px 0 9px;color:#10294b}
    #lal-v3 .lal-sub{color:#58708c;font-size:13px;margin:0}#lal-v3 .lal-layout{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:14px;align-items:start}
    #lal-v3 .lal-panel{border:1px solid var(--line);border-radius:20px;background:#fff;padding:19px;box-shadow:0 8px 24px rgba(18,64,110,.035);min-width:0}
    #lal-v3 .lal-panel h3{margin:0 0 12px;font-size:18px;color:#122e54}#lal-v3 .lal-map-shell{background:linear-gradient(#f4f9ff,#edf5ff);border-radius:17px;padding:14px;min-height:310px;display:grid;place-items:center;overflow:hidden}
    #lal-v3 .lal-map-shell object{display:block;width:100%;height:440px;max-height:60vh;min-height:310px}#lal-v3 .lal-map-caption{font-size:12px;color:#58708c;margin:10px 2px 14px}
    #lal-v3 .lal-regions{display:flex;flex-wrap:wrap;gap:7px}#lal-v3 .lal-region{border:1px solid #cbdcf1;background:#f3f8ff;color:#24486f;border-radius:999px;padding:8px 11px;font-size:13px;font-weight:700;cursor:pointer}
    #lal-v3 .lal-region[aria-pressed=true]{background:#1457ae;color:white;border-color:#1457ae}#lal-v3 .lal-region:focus-visible{outline:3px solid #f7b84b;outline-offset:2px}
    #lal-v3 .lal-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}#lal-v3 .lal-stat{background:#eff6ff;border-radius:13px;padding:13px 8px;text-align:center}
    #lal-v3 .lal-stat b{display:block;font-size:clamp(17px,2vw,24px);color:#1255ae}#lal-v3 .lal-stat span{font-size:11px;color:#607994}
    #lal-v3 .lal-list{display:grid;gap:9px}#lal-v3 .lal-shop{border:1px solid var(--line);background:#fff;border-radius:13px;padding:13px 14px}
    #lal-v3 .lal-shop-name{font-weight:800;font-size:15px;color:#18385f}#lal-v3 .lal-shop-address{color:#57708b;font-size:12px;margin-top:6px;line-height:1.5;overflow-wrap:anywhere}
    #lal-v3 .lal-chip{display:inline-block;background:#e9f4ff;color:#1457ae;font-size:11px;border-radius:999px;padding:3px 7px;margin-left:6px;font-weight:700}
    #lal-v3 .lal-note{font-size:12px;color:#657d97;line-height:1.65;margin:12px 0 0}#lal-v3 .lal-right{display:grid;gap:14px}
    #lal-v3 .lal-top{counter-reset:lal-rank;display:grid;gap:0}#lal-v3 .lal-top-item{display:grid;grid-template-columns:26px 1fr auto;align-items:center;gap:9px;padding:11px 0;border-bottom:1px solid #edf2f9}
    #lal-v3 .lal-top-item:last-child{border:0}#lal-v3 .lal-rank{width:25px;height:25px;border-radius:50%;background:#dcecff;color:#1457ae;font-size:12px;font-weight:800;display:grid;place-items:center}
    #lal-v3 .lal-top-item strong{font-size:13px}#lal-v3 .lal-top-item small{display:block;color:#72859a;font-size:11px;margin-top:4px;overflow-wrap:anywhere}#lal-v3 .lal-top-count{font-size:13px;font-weight:800;color:#1457ae}
    #lal-v3 .lal-status{background:#fff9ed;border:1px solid #f5e6bd;border-radius:12px;padding:11px 13px;font-size:12px;color:#7d5b24;line-height:1.65}
    #lal-v3 .lal-hidden{display:none!important}@media(max-width:760px){#lal-v3 .lal-layout{grid-template-columns:1fr}#lal-v3 .lal-hero{padding:20px}#lal-v3 .lal-panel{padding:14px}#lal-v3 .lal-map-shell object{height:340px;min-height:290px}#lal-v3 .lal-stat{padding:11px 5px}#lal-v3 .lal-region{padding:8px 10px}}
  `;
  function el(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = String(content);
    return node;
  }
  function regionFor(address) {
    const a = String(address || '').trim();
    return REGIONS.slice(1).find(r => a.startsWith(r)) || null;
  }
  function start() {
    if (document.getElementById('lal-v3')) return;
    const legacy = document.getElementById('lottoRegionExplorer');
    if (!legacy) { console.warn('[Lotto v3] lottoRegionExplorer not found'); return; }
    const data = typeof verifiedLastResult !== 'undefined' ? verifiedLastResult : null;
    const shops = data && Array.isArray(data.shops) ? data.shops.filter(s => Array.isArray(s) && s.length >= 2) : [];
    const regionCounts = new Map(Array.isArray(data?.regions) ? data.regions : []);
    const countOffline = Array.from(regionCounts.entries()).filter(([k]) => k !== '인터넷').reduce((n,[,v]) => n + (Number(v)||0),0);
    const selected = {region:'전체'};
    const style = el('style'); style.textContent = CSS; document.head.appendChild(style);
    const root = el('section'); root.id = 'lal-v3'; root.setAttribute('aria-label','전국 로또 1등 당첨 지역 탐색');
    const hero = el('header','lal-hero');
    hero.append(el('div','lal-eyebrow','LOTTO AI LAB · REGION EXPLORER'),el('h2','', '🗺️ 로또 1등 당첨 지역 한눈에 보기'),el('p','lal-sub', data ? `제${data.round}회 · ${data.date || '날짜 미확인'} · 기존 입력 참고 자료` : '검증된 회차별 데이터 준비 중'));
    const layout = el('div','lal-layout'), left=el('div','lal-panel'), right=el('div','lal-right');
    left.appendChild(el('h3','', '📍 대한민국 지역별 당첨 현황'));
    const mapShell=el('div','lal-map-shell');
    const mapObj=el('object'); mapObj.type='image/svg+xml';mapObj.data='./korea-map.svg';mapObj.setAttribute('aria-label','지역 이름을 눌러 선택하는 대한민국 안내도');mapObj.textContent='대한민국 지도 불러오는 중';mapShell.appendChild(mapObj);left.appendChild(mapShell);
    left.appendChild(el('p','lal-map-caption','지도의 지역 이름 또는 아래 버튼을 누르면 해당 지역의 판매점을 볼 수 있어요. 지도는 위치 안내용 약도입니다.'));
    const regionButtons=el('div','lal-regions');regionButtons.setAttribute('aria-label','지역 선택');left.appendChild(regionButtons);
    const overview=el('div','lal-panel');overview.appendChild(el('h3','','📊 제'+(data?.round||'—')+'회 당첨 현황'));
    const stats=el('div','lal-stats');
    for(const [num,label] of [[countOffline+'건','지역별 1등 게임'],[String(regionCounts.size-(regionCounts.has('인터넷')?1:0))+'곳','기록된 지역'],[shops.length+'개','입력된 판매점']]){
      const card=el('div','lal-stat');card.append(el('b','',data?num:'—'),el('span','',label));stats.appendChild(card);
    }
    overview.appendChild(stats);overview.appendChild(el('div','lal-status','⚠️ 현재 화면의 회차·판매점 정보는 기존 사이트에 입력된 미검증 참고 자료입니다. 공식 검증 및 판매점 자동 갱신은 완료되지 않았습니다.'));
    const selectedPanel=el('div','lal-panel'), selectedHeading=el('h3'), selectedList=el('div','lal-list');
    selectedPanel.append(selectedHeading,selectedList);
    const topPanel=el('div','lal-panel');topPanel.appendChild(el('h3','','🏆 기존 입력 기준 판매점 TOP 5'));
    const topList=el('div','lal-top');
    shops.slice().sort((a,b)=>(Number(b[3])||0)-(Number(a[3])||0)).slice(0,5).forEach((s,i)=>{
      const item=el('div','lal-top-item');item.appendChild(el('span','lal-rank',i+1));
      const info=el('div');info.append(el('strong','',s[0]),el('small','',s[1]));item.append(info,el('span','lal-top-count',String(Number(s[3])||0)+'회*'));topList.appendChild(item);
    });
    topPanel.append(topList,el('p','lal-note','* 기존 입력 자료의 누적 횟수이며 검증되지 않았습니다. 공식 전국 순위가 아닙니다.'));
    right.append(overview,selectedPanel,topPanel);layout.append(left,right);root.append(hero,layout);
    legacy.parentNode.insertBefore(root,legacy);legacy.classList.add('lal-hidden');
    const oldStores=document.getElementById('lottoStoreExplorer');
    if(oldStores && !root.contains(oldStores)){
      oldStores.classList.add('lal-hidden');
      const heading=oldStores.previousElementSibling;
      if(heading && /^H[1-6]$/.test(heading.tagName) && /판매점/.test(heading.textContent))heading.classList.add('lal-hidden');
    }
    function render(region){
      selected.region=region;selectedHeading.textContent=`🏪 ${region==='전체'?'전체 지역':region} 판매점 · 제${data?.round||'—'}회`;
      regionButtons.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===region)));
      selectedList.replaceChildren();
      const filtered=shops.filter(s=>region==='전체'||regionFor(s[1])===region);
      if(!filtered.length){selectedList.appendChild(el('p','lal-note','현재 입력된 판매점 참고 자료가 없습니다. 당첨점이 없었다는 의미는 아닙니다.'));return;}
      filtered.forEach(s=>{
        const card=el('article','lal-shop'), name=el('div','lal-shop-name',s[0]);name.appendChild(el('span','lal-chip',s[2]||'구매 방식 미확인'));
        card.append(name,el('div','lal-shop-address','📍 '+s[1]));selectedList.appendChild(card);
      });
    }
    REGIONS.forEach(r=>{const b=el('button','lal-region',r);b.type='button';b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>render(r));regionButtons.appendChild(b);});
    mapObj.addEventListener('load',()=>{
      try{
        const doc=mapObj.contentDocument;if(!doc)return;
        doc.querySelectorAll('text').forEach(t=>{
          const r=(t.textContent||'').trim();if(!REGIONS.includes(r)||r==='전체')return;
          t.style.cursor='pointer';t.addEventListener('click',()=>render(r));
        });
      }catch(err){console.warn('[Lotto v3] map interaction unavailable',err);}
    });
    render('전체');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

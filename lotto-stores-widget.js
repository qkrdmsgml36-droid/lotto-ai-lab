(() => {
  const mapArea = document.getElementById('lottoRegionResult');
  const storeArea = document.getElementById('lottoStoreExplorer');
  const buttons = document.getElementById('lottoRegionButtons');
  if (!mapArea || !storeArea || !buttons) return;
  let selected = '전체';
  let dataset = null;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function paint() {
    if (!dataset) return;
    const stores = dataset.stores.filter(s => selected === '전체' || s.region === selected);
    const counts = {};
    dataset.stores.forEach(s => counts[s.region] = (counts[s.region] || 0) + 1);
    mapArea.innerHTML = `<p><strong>제${esc(dataset.round)}회</strong> · 공식 판매점 자료 확인: ${esc(dataset.checked_at.slice(0,10))} (UTC) · ${esc(selected)} ${stores.length}게임</p><p>${Object.entries(counts).map(([r,n])=>`${esc(r)} ${n}게임`).join(' · ')}</p>`;
    storeArea.innerHTML = `<h3>🏪 ${esc(selected)} 1등 배출 판매점</h3>${stores.length ? '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px">'+stores.map(s=>`<article style="border:1px solid #dbe3ee;border-radius:12px;padding:14px"><strong>${esc(s.name)}</strong><p>${esc(s.address)}</p><small>${esc(s.method)} · ${esc(s.region)}</small></article>`).join('')+'</div>' : '<p>이 지역에 확인된 배출점이 없습니다.</p>'}<p><a href="${esc(dataset.source)}" target="_blank" rel="noopener noreferrer">동행복권 원본 확인 ↗</a></p>`;
  }
  buttons.addEventListener('click', e => {
    const btn=e.target.closest('button'); if(!btn) return;
    selected=btn.textContent.trim(); paint();
  });
  fetch('./lotto-stores.json?t='+Date.now(),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{
    if (!Array.isArray(data.stores) || !data.round || !data.checked_at) throw Error();
    dataset=data; paint();
  }).catch(()=>{
    mapArea.innerHTML='<p>판매점 데이터 자동 수집을 검증 중입니다. 확인된 정보가 등록되면 표시됩니다.</p>';
    storeArea.innerHTML='<p>현재 검증된 자동 업데이트 판매점 데이터가 없습니다. <a href="https://www.dhlottery.co.kr/" target="_blank" rel="noopener noreferrer">동행복권 공식 사이트에서 확인 ↗</a></p>';
  });
})();

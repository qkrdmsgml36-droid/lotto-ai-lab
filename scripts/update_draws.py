#!/usr/bin/env python3
"""Safely extend lotto-results.json using public draw datasets; never invent values."""
import json, pathlib, urllib.request, datetime, sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
PATH=ROOT/'lotto-results.json'
URLS=['https://smok95.github.io/lotto/results/all.json','https://papaya5rhw1984.github.io/lotto-data/all.json']
def integer(v):
    try:
        if isinstance(v,bool) or v is None or str(v).strip()=='': return None
        n=int(v)
        return n if str(v).strip()==str(n) else None
    except (TypeError,ValueError):return None
def first(row,*names):
    for name in names:
        if name in row and row[name] is not None:return row[name]
    return None
def normalize(r):
    if not isinstance(r,dict):return None
    no=integer(first(r,'drwNo','round','draw_no'))
    nums=first(r,'numbers','nums')
    if isinstance(nums,dict):nums=list(nums.values())
    if not isinstance(nums,list):nums=[first(r,f'drwtNo{i}',f'num{i}') for i in range(1,7)]
    nums=[integer(n) for n in nums]
    bonus=integer(first(r,'bnusNo','bonus','bonus_number'))
    winners=integer(first(r,'firstPrzwnerCo','first_prize_winners','firstPrizeWinners'))
    prize=integer(first(r,'firstWinamnt','first_prize_amount_krw','firstPrizeAmount'))
    if not(no and len(nums)==6 and all(n is not None and 1<=n<=45 for n in nums) and len(set(nums))==6 and bonus and 1<=bonus<=45 and bonus not in nums and winners is not None and winners>=0 and prize is not None and prize>=0):return None
    return {'round':no,'numbers':nums,'bonus':bonus,'first_prize_winners':winners,'first_prize_amount_krw':prize}
def extract(payload):
    if isinstance(payload,list):return payload
    if isinstance(payload,dict):
        for k in ('draws','results','data','lotto'):
            if isinstance(payload.get(k),list):return payload[k]
        if all(isinstance(v,dict) for v in payload.values()):return list(payload.values())
    return []
def main():
    base=json.loads(PATH.read_text(encoding='utf-8'))
    existing={r['round']:r for r in base['draws']}
    downloaded=[]
    for url in URLS:
        try:
            req=urllib.request.Request(url,headers={'User-Agent':'LottoAILab/1.0 (public data updater)'})
            with urllib.request.urlopen(req,timeout=20) as resp: raw=json.load(resp)
            rows=[x for x in (normalize(r) for r in extract(raw)) if x]
            if rows:
                downloaded=rows; print('자료 출처:',url,'검증된 회차:',len(rows));break
            print('유효한 데이터 없음:',url)
        except Exception as e:print('접속 실패:',url,type(e).__name__,str(e)[:120])
    if not downloaded:
        print('새 데이터 확인 실패: 기존 lotto-results.json 유지');return
    new=0;conflicts=0
    for r in downloaded:
        old=existing.get(r['round'])
        if old:
            if any(old.get(k)!=r[k] for k in ('numbers','bonus','first_prize_winners','first_prize_amount_krw')):conflicts+=1;print('불일치 회차(기존 유지):',r['round'])
            continue
        existing[r['round']]=r;new+=1
    if not new:
        print('새 회차 없음; 불일치',conflicts,'건. 파일 유지');return
    base['draws']=sorted(existing.values(),key=lambda r:r['round'],reverse=True)
    base['source']='사용자 제공 엑셀 및 공개 회차 데이터 (자동 갱신된 회차 포함)'
    base['updated_at']=datetime.datetime.now(datetime.timezone.utc).date().isoformat()
    base['scope']='회차별 당첨번호/1등 게임수/당첨금; 판매점 데이터와 별도. 출처 간 불일치 시 기존 자료 유지.'
    PATH.write_text(json.dumps(base,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('새 회차',new,'건 저장, 최신',base['draws'][0]['round'],'회; 불일치',conflicts,'건')
if __name__=='__main__':main()

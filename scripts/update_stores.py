import json, re, urllib.request, datetime, pathlib, html
from html.parser import HTMLParser

ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'lotto-stores.json'
SOURCE='https://www.dhlottery.co.kr/store.do?method=topStore&pageGubun=L645&drwNo={}'
DRAW='https://smok95.github.io/lotto/results/all.json'

class TableParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.tables=[]; self.table=None; self.row=None; self.cell=None
    def handle_starttag(self, tag, attrs):
        if tag=='table': self.table=[]
        if tag=='tr' and self.table is not None: self.row=[]
        if tag in ('td','th') and self.row is not None: self.cell=[]
    def handle_data(self,data):
        if self.cell is not None: self.cell.append(data)
    def handle_endtag(self,tag):
        if tag in ('td','th') and self.cell is not None:
            self.row.append(' '.join(''.join(self.cell).split())); self.cell=None
        if tag=='tr' and self.row is not None:
            self.table.append(self.row); self.row=None
        if tag=='table' and self.table is not None:
            self.tables.append(self.table); self.table=None

def get(url):
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; LottoStatsBot/1.0)'})
    with urllib.request.urlopen(req,timeout=25) as r:
        return r.read().decode('utf-8','replace')

def latest_round():
    data=json.loads(get(DRAW))
    if isinstance(data,list):
        nums=[int(x.get('no',x.get('draw_no',0))) for x in data if isinstance(x,dict)]
    elif isinstance(data,dict):
        nums=[int(k) for k in data if str(k).isdigit()]
    else: nums=[]
    if not nums: raise ValueError('당첨번호 데이터에서 회차를 확인할 수 없습니다')
    return max(nums)

def parse_stores(page):
    if '서비스 접속이 차단' in page or '서비스 접근 대기' in page: raise ValueError('공식 사이트 접속 제한')
    parser=TableParser(); parser.feed(page)
    for table in parser.tables:
        rows=[]
        for r in table:
            if len(r)>=4 and r[0].strip().isdigit() and r[2].strip() in ('자동','수동','반자동'):
                rows.append({'name':r[1],'method':r[2],'address':r[3]})
            elif len(r)>=4 and r[0].strip().isdigit() and r[3].strip() in ('자동','수동','반자동'):
                rows.append({'name':r[1],'method':r[3],'address':r[2]})
        if rows: return rows
    raise ValueError('1등 판매점 표를 찾지 못했습니다 (사이트 구조 변경 또는 차단 가능)')

def region(address):
    names={'서울':'서울','경기':'경기','인천':'인천','부산':'부산','대구':'대구','광주':'광주','대전':'대전','울산':'울산','세종':'세종','강원':'강원','충북':'충북','충남':'충남','전북':'전북','전남':'전남','경북':'경북','경남':'경남','제주':'제주'}
    for prefix,name in names.items():
        if address.startswith(prefix):return name
    return '기타'

def main():
    no=latest_round(); print('최신 회차',no)
    try:
        page=get(SOURCE.format(no)); stores=parse_stores(page)
        if not 1<=len(stores)<=100: raise ValueError('비정상 판매점 수')
        payload={'round':no,'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':SOURCE.format(no),'stores':[dict(s,region=region(s['address'])) for s in stores]}
        if OUT.exists():
            old=json.loads(OUT.read_text(encoding='utf-8'))
            if int(old.get('round',0))>no: raise ValueError('기존 파일보다 오래된 회차')
        OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        print('확인된 판매점',len(stores),'개 저장')
    except Exception as e:
        print('판매점 데이터 갱신 보류:',e)
        print('검증되지 않은 데이터는 게시하지 않습니다. 기존 JSON 유지.')

if __name__=='__main__':main()

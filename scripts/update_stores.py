
import re
import urllib.request
from html.parser import HTMLParser

BASE_URL = "https://www.dhlottery.co.kr/"

class LinkFinder(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.href = None

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self.href = dict(attrs).get("href")

    def handle_data(self, data):
        if self.href and data.strip():
            self.links.append((data.strip(), self.href))

    def handle_endtag(self, tag):
        if tag == "a":
            self.href = None

def main():
    request = urllib.request.Request(
        BASE_URL,
        headers={"User-Agent": "Mozilla/5.0"}
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        html = response.read().decode("utf-8", errors="replace")

    finder = LinkFinder()
    finder.feed(html)

    keywords = ("당첨", "판매점", "복권", "store", "win")

    print("동행복권 홈페이지 연결 성공")
    print("발견된 관련 링크:")

    count = 0
    for title, href in finder.links:
        if any(word in (title + href).lower() for word in keywords):
            print(f"{title}: {href}")
            count += 1

    print(f"관련 링크 수: {count}")

    if count == 0:
        print("관련 링크를 찾지 못했습니다.")
        print("동적 페이지 또는 별도 데이터 주소 확인이 필요합니다.")

if __name__ == "__main__":
    main()

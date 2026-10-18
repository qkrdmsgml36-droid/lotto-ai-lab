
import urllib.request
from html.parser import HTMLParser

URL = "https://www.dhlottery.co.kr/wnprchsplcsrch/home"

class PageReader(HTMLParser):
    def __init__(self):
        super().__init__()
        self.texts = []

    def handle_data(self, data):
        value = data.strip()
        if value:
            self.texts.append(value)

def main():
    request = urllib.request.Request(
        URL,
        headers={"User-Agent": "Mozilla/5.0"}
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        print("HTTP 상태:", response.status)
        html = response.read().decode("utf-8", errors="replace")

    reader = PageReader()
    reader.feed(html)

    print("페이지 제목 및 내용 일부:")
    for text in reader.texts[:80]:
        print(text[:150])

    print("페이지 크기:", len(html))

if __name__ == "__main__":
    main()


import json
import urllib.request
from datetime import datetime, timezone

URL = "https://www.dhlottery.co.kr/"

def main():
    request = urllib.request.Request(
        URL,
        headers={"User-Agent": "Mozilla/5.0"}
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            status = response.status
            content_type = response.headers.get("Content-Type", "")

        print(json.dumps({
            "checked_at": datetime.now(timezone.utc).isoformat(),
            "status": status,
            "content_type": content_type,
            "message": "동행복권 홈페이지 접근 테스트 완료"
        }, ensure_ascii=False, indent=2))

    except Exception as error:
        print("동행복권 접속 테스트 실패:", error)
        raise

if __name__ == "__main__":
    main()

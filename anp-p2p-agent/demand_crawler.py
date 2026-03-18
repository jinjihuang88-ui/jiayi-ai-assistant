"""
MapleBridge 需求侧三合一爬虫 v1
替代 Manus 三个 Skill：
  A. Shopify/独立站买家搜索 (maplebridge-buyer-sourcing)
  B. 为未匹配供应商定向找买家 (maplebridge-sourcing-agent)
  C. 亚洲中小供应商搜索 (maplebridge-supplier-sourcing)
运行频率：每6小时一轮
"""
import json, os, re, sqlite3, time, hashlib, threading
import requests
from bs4 import BeautifulSoup

API_BASE    = os.environ.get("API_BASE",    "http://api:8000")
SEARXNG_URL = os.environ.get("SEARXNG_URL", "http://searxng:8080")
DB_FILE     = os.environ.get("DB_FILE",     "/app/intent_net.db")
WEBHOOK_URL = API_BASE + "/api/v1/webhook/manus"

_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

_EMAIL_RE = re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}')

_EMAIL_BLACKLIST = [
    'example.com', 'domain.com', 'noreply', 'no-reply', 'sentry.io',
    'google.com', 'facebook.com', 'twitter.com', 'cloudflare',
    'amazon.com', 'apple.com', 'microsoft.com', 'github.com',
    'wordpress.com', 'wix.com', 'squarespace.com', 'wixpress.com',
    'shopify.com', 'mailchimp.com', 'klaviyo.com',
]

_SKIP_DOMAINS = [
    'youtube.com', 'wikipedia.org', 'instagram.com', 'tiktok.com', 'pinterest.com',
    'yelp.com', 'tripadvisor.com', 'shopify.com', 'etsy.com', 'ebay.com', 'amazon.com',
    'alibaba.com', 'aliexpress.com', 'made-in-china.com', 'reddit.com', 'linkedin.com',
    'twitter.com', 'x.com', 'facebook.com', 'nytimes.com', 'bbc.com', 'cnn.com',
    'reuters.com', 'techcrunch.com', 'forbes.com', 'bloomberg.com', 'wsj.com',
    'indiamart.com', 'globalsources.com', 'tradekey.com', 'ec21.com', 'dhgate.com',
]

_seen_lock = threading.Lock()
_seen_urls = set()


# ══════════════════════════════════════════════════════════════════
# Workflow A — Shopify/独立站买家 (DEMAND)
# ══════════════════════════════════════════════════════════════════


# Workflow A 复用 crawler_worker.py 的有效查询格式，但用 DEMAND AI 判断：
# 这些查询返回的加拿大/北美批发商，从中国工厂角度看就是 BUYER（进口商）
BUYER_QUERIES = [
    # 加拿大进口商/批发商（与 crawler_worker 同格式，已验证 SearXNG 有效）
    ('"wholesale supplier" furniture Canada "email" OR "contact us"',           "家具家居"),
    ('"wholesale distributor" toys Canada "minimum order" "contact"',          "玩具礼品"),
    ('"wholesale importer" electronics Canada "email" "bulk"',                 "电子/消费电子"),
    ('"import wholesale" home decor Canada "contact us" email',                "家居用品"),
    ('"wholesale buyer" Canada gift "email" "minimum order"',                  "玩具礼品"),
    ('"wholesale" "private label" skincare Canada email contact',              "美妆护肤"),
    ('"wholesale supplier" pet products Canada "contact" email',               "宠物用品"),
    ('"import" "wholesale" apparel Canada "email" "minimum order"',            "服装服饰"),
    ('"Canadian distributor" OR "Canadian importer" wholesale contact email',  "综合"),
    ('"Canada wholesale" furniture "email" "price list"',                      "家具家居"),
    ('"wholesale" electronics accessories Canada "bulk order" email',          "电子/消费电子"),
    # 美国进口商
    ('"wholesale distributor" furniture USA "email" OR "contact us"',          "家具家居"),
    ('"wholesale importer" skincare USA "email" OR "contact"',                 "美妆护肤"),
    ('"wholesale distributor" pet products USA "email" OR "contact"',          "宠物用品"),
    ('"wholesale importer" toys USA "email" "minimum order"',                  "玩具礼品"),
]

_BUYER_PROMPT = """You are a MapleBridge B2B buyer validation specialist.
Determine if this website belongs to a REAL business that imports or wholesales products from overseas suppliers.

ACCEPT if:
- Independent retailer, boutique store, or wholesale distributor
- Has clear B2B procurement intent: "wholesale", "import", "sourcing", "supplier inquiry"
- Has a contact email
- Is NOT a manufacturer or factory (those are suppliers, not buyers)

REJECT if:
- Pure consumer blog, news site, directory, or informational page
- Large marketplace (Amazon, Walmart, Target, Costco)
- Factory or manufacturer (that is a supplier)
- No wholesale/import intent visible
- No contact email findable

Output strict JSON only, no extra text:
{"is_valid":true,"company_name":"Store Name","country":"Country","category":"Product category in Chinese","core_need":"English: what they want to source, max 80 chars","contact_email":"email if found else empty","reject_reason":""}"""


# ══════════════════════════════════════════════════════════════════
# Workflow C — 亚洲中小供应商 (SUPPLY)
# ══════════════════════════════════════════════════════════════════


# Workflow C 同样复用已验证有效的查询格式，目标是亚洲出口商
ASIAN_SUPPLIER_QUERIES = [
    # 中国/亚洲出口商找北美买家（与 crawler_worker 同格式）
    ('"China supplier" Canada wholesale "contact us" email',                    "综合"),
    ('"export to Canada" manufacturer wholesale email contact',                 "综合"),
    ('"China manufacturer" wholesale Canada "minimum order" email',            "综合"),
    ('"made in China" wholesale Canada distributor "contact" email',           "综合"),
    ('"OEM manufacturer" electronics export "email" OR "contact" wholesale',   "电子/消费电子"),
    ('"OEM manufacturer" furniture export "email" OR "contact" wholesale',     "家具家居"),
    ('"factory direct" skincare export "email" OR "inquiry" wholesale',        "美妆护肤"),
    ('"wholesale supplier" furniture China "email" OR "contact us"',           "家具家居"),
    ('"wholesale supplier" electronics China "email" OR "contact"',            "电子/消费电子"),
    # 越南/马来西亚
    ('"wholesale supplier" furniture Vietnam "email" OR "inquiry"',            "家具家居"),
    ('"wholesale supplier" Vietnam "email" OR "contact" export',               "综合"),
    ('"wholesale supplier" Malaysia "email" OR "contact" export',              "综合"),
    ('"Vietnam manufacturer" export wholesale "email" OR "inquiry"',           "家具家居"),
    ('"Malaysia manufacturer" export wholesale "email" OR "contact"',          "综合"),
]

_SUPPLIER_PROMPT = """You are a MapleBridge supplier validation specialist.
Determine if this is a legitimate SMALL-TO-MEDIUM factory or exporter from China, Vietnam, or Malaysia.

ACCEPT if:
- Small to medium factory or trading company (10-200 employees)
- Located in China (Guangdong, Zhejiang, Jiangsu, Fujian, etc.), Vietnam, or Malaysia
- Has export capability (mentions: export, wholesale, OEM, ODM, MOQ)
- Has a direct contact email (sales/manager/owner preferred over generic info@)
- Simple or basic website (WordPress, basic HTML — not a Fortune 500 site)

REJECT if:
- Large corporation (500+ employees or $50M+ revenue)
- Top-tier Alibaba Gold Supplier with thousands of reviews
- Pure information/news/directory page
- Retail consumer website with no B2B section
- No contact email found

Output strict JSON only, no extra text:
{"is_valid":true,"company_name":"Factory Name","country":"China/Vietnam/Malaysia","category":"Product category in Chinese","core_need":"English: Small factory in [City] specializing in [Products], MOQ [N], OEM available, looking for overseas buyers","contact_email":"email if found else empty","reject_reason":""}"""


# ══════════════════════════════════════════════════════════════════
# Shared helpers
# ══════════════════════════════════════════════════════════════════

def _ai_validate(content: str, prompt: str) -> dict:
    """Call QWEN first, fallback to OpenAI."""
    qwen_key = os.environ.get("QWEN_API_KEY", "").strip()
    if qwen_key:
        try:
            import openai
            client = openai.OpenAI(
                api_key=qwen_key,
                base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
            )
            resp = client.chat.completions.create(
                model="qwen-plus",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user",   "content": content},
                ],
                temperature=0, timeout=25,
            )
            raw = resp.choices[0].message.content.strip()
            m = re.search(r'\{.*\}', raw, re.DOTALL)
            if m:
                return json.loads(m.group())
        except Exception as e:
            print("[DemandCrawler] QWEN异常: " + str(e))

    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if openai_key:
        try:
            import openai as oai
            client = oai.OpenAI(api_key=openai_key)
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user",   "content": content},
                ],
                temperature=0, timeout=20,
            )
            raw = resp.choices[0].message.content.strip()
            m = re.search(r'\{.*\}', raw, re.DOTALL)
            if m:
                return json.loads(m.group())
        except Exception as e:
            print("[DemandCrawler] OpenAI异常: " + str(e))

    return None


def _fetch_page(url, timeout=12):
    try:
        resp = requests.get(url, headers=_HEADERS, timeout=timeout, allow_redirects=True)
        if resp.status_code != 200:
            return None
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()
        return soup.get_text(separator="\n", strip=True)
    except Exception:
        return None


def _fetch_contact_supplement(base_url, main_text):
    """Try contact/about sub-pages to find email."""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(base_url)
        base = parsed.scheme + "://" + parsed.netloc
        for path in ["/pages/contact", "/contact", "/contact-us", "/about", "/about-us"]:
            try:
                resp = requests.get(base + path, headers=_HEADERS, timeout=8, allow_redirects=True)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    extra = soup.get_text(separator="\n", strip=True)
                    return main_text + "\n" + extra[:1000]
            except Exception:
                continue
    except Exception:
        pass
    return main_text


def _extract_email(text):
    emails = [e for e in _EMAIL_RE.findall(text)
              if not any(b in e.lower() for b in _EMAIL_BLACKLIST)]
    if not emails:
        return ""
    # Prefer direct/sales emails
    for e in emails:
        local = e.split("@")[0].lower()
        if any(k in local for k in ["sales", "manager", "export", "trade", "contact",
                                     "purchase", "sourcing", "buyer", "import"]):
            return e
    return emails[0]


def _is_allowed_url(url):
    try:
        from urllib.parse import urlparse
        host = urlparse(url).netloc.lower().replace("www.", "")
        return not any(host == d or host.endswith("." + d) for d in _SKIP_DOMAINS)
    except Exception:
        return False


def _is_seen(url):
    h = hashlib.md5(url.encode()).hexdigest()
    try:
        conn = sqlite3.connect(DB_FILE)
        r = conn.execute("SELECT 1 FROM crawled_leads WHERE url_hash=?", (h,)).fetchone()
        conn.close()
        return r is not None
    except Exception:
        return False


def _mark_seen(url, source):
    h = hashlib.md5(url.encode()).hexdigest()
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.execute(
            "INSERT OR IGNORE INTO crawled_leads(url_hash,url,source,crawled_at) VALUES(?,?,?,?)",
            (h, url, source, time.time())
        )
        conn.commit()
        conn.close()
    except Exception:
        pass


def _search_searxng(query, num=5):
    try:
        resp = requests.get(
            SEARXNG_URL + "/search",
            params={"q": query, "format": "json", "categories": "general"},
            timeout=15,
        )
        if resp.status_code != 200:
            return []
        results = []
        for r in resp.json().get("results", [])[:num * 4]:
            url = r.get("url", "").strip()
            if not url or not _is_allowed_url(url):
                continue
            results.append({
                "url":     url,
                "title":   r.get("title", ""),
                "snippet": r.get("content", ""),
            })
            if len(results) >= num:
                break
        return results
    except Exception as e:
        print("[DemandCrawler] SearXNG失败: " + str(e))
        return []


def _submit(lead):
    try:
        resp = requests.post(WEBHOOK_URL, json=lead, timeout=15)
        if resp.status_code == 200:
            print("[DemandCrawler] 入库: " + lead.get("company", "?") + " <" + lead.get("contact_email", "?") + ">")
            return True
        print("[DemandCrawler] 提交失败 " + str(resp.status_code) + ": " + lead.get("company", "?"))
        return False
    except Exception as e:
        print("[DemandCrawler] 提交异常: " + str(e))
        return False


def _process_url(r, source_tag, prompt, role=None):
    """
    Shared URL processing: fetch → AI validate → return lead dict or None.
    role: None (auto/demand) or "supply"
    """
    url = r["url"]
    with _seen_lock:
        if url in _seen_urls:
            return None
        _seen_urls.add(url)

    if _is_seen(url):
        return None

    page_text = _fetch_page(url)
    _mark_seen(url, source_tag)

    if not page_text or len(page_text) < 100:
        return None

    # Try to find email from sub-pages
    page_text = _fetch_contact_supplement(url, page_text)
    email = _extract_email(page_text)

    content = "Title: " + r["title"] + "\nURL: " + url + "\n\n" + page_text[:2000]
    validated = _ai_validate(content, prompt)

    if not validated or not validated.get("is_valid"):
        reason = (validated or {}).get("reject_reason", "AI判断无效")
        print("[DemandCrawler] 过滤 [" + source_tag + "]: " + reason[:60])
        return None

    contact_email = email or validated.get("contact_email", "")
    if not contact_email:
        print("[DemandCrawler] 无邮件跳过: " + url[:60])
        return None

    lead = {
        "company":       validated.get("company_name", r["title"][:50]),
        "contact_email": contact_email,
        "contact_name":  "NA",
        "country":       validated.get("country", ""),
        "category":      validated.get("category", "综合"),
        "core_need":     validated.get("core_need", ""),
        "source_url":    url,
        "budget_usd":    0,
    }
    if role:
        lead["role"] = role
    return lead


# ══════════════════════════════════════════════════════════════════
# Workflow A: Shopify / 独立站买家
# ══════════════════════════════════════════════════════════════════

def run_workflow_a():
    print("[DemandCrawler] === Workflow A: Shopify买家搜索 ===")
    count = 0
    for query, category in BUYER_QUERIES:
        print("[DemandCrawler] A搜索: " + query[:70])
        for r in _search_searxng(query, num=5):
            lead = _process_url(r, "demand_crawler_a", _BUYER_PROMPT)
            if lead:
                if not lead.get("category"):
                    lead["category"] = category
                if _submit(lead):
                    count += 1
            time.sleep(2)
        time.sleep(3)
    print("[DemandCrawler] Workflow A完成，入库" + str(count) + "条")


# ══════════════════════════════════════════════════════════════════
# Workflow B: 为未匹配供应商定向找买家
# ══════════════════════════════════════════════════════════════════

_CAT_EN = {
    "家具家居":   "furniture home decor",
    "电子/消费电子": "electronics gadgets",
    "美妆护肤":   "skincare beauty cosmetics",
    "玩具礼品":   "toys gifts novelty",
    "宠物用品":   "pet products supplies",
    "服装服饰":   "apparel clothing fashion",
    "家居用品":   "home goods kitchenware",
    "运动户外":   "outdoor fitness sporting goods",
    "母婴用品":   "baby products maternity",
    "综合":      "wholesale goods",
}


def _make_buyer_query(desc, category):
    cat_en = _CAT_EN.get(category, "wholesale goods")
    # Extract first meaningful phrase from desc
    short = desc[:60] if desc else cat_en
    return '"' + cat_en + '" importer wholesale buyer "email" "contact" independent store'


def run_workflow_b():
    print("[DemandCrawler] === Workflow B: 为未匹配供应商找买家 ===")
    try:
        resp = requests.get(API_BASE + "/api/v1/unmatched_suppliers", params={"limit": 8}, timeout=15)
        if resp.status_code != 200:
            print("[DemandCrawler] B: 获取未匹配供应商失败 " + str(resp.status_code))
            return
        suppliers = resp.json().get("items", [])
        print("[DemandCrawler] B: 获取到" + str(len(suppliers)) + "个未匹配供应商")
    except Exception as e:
        print("[DemandCrawler] B: API请求失败 " + str(e))
        return

    count = 0
    for sup in suppliers:
        desc     = sup.get("description") or sup.get("core_need") or sup.get("summary") or ""
        category = sup.get("category", "综合")
        company  = sup.get("company", "Unknown")
        query    = _make_buyer_query(desc, category)
        print("[DemandCrawler] B: 为[" + company + "]找买家: " + query[:70])

        for r in _search_searxng(query, num=4):
            lead = _process_url(r, "demand_crawler_b", _BUYER_PROMPT)
            if lead:
                if not lead.get("category"):
                    lead["category"] = category
                if _submit(lead):
                    count += 1
            time.sleep(2)
        time.sleep(4)

    print("[DemandCrawler] Workflow B完成，入库" + str(count) + "条")


# ══════════════════════════════════════════════════════════════════
# Workflow C: 亚洲中小供应商
# ══════════════════════════════════════════════════════════════════

def run_workflow_c():
    print("[DemandCrawler] === Workflow C: 亚洲中小供应商搜索 ===")
    count = 0
    for query, category in ASIAN_SUPPLIER_QUERIES:
        print("[DemandCrawler] C搜索: " + query[:70])
        for r in _search_searxng(query, num=5):
            lead = _process_url(r, "demand_crawler_c", _SUPPLIER_PROMPT, role="supply")
            if lead:
                if not lead.get("category"):
                    lead["category"] = category
                if _submit(lead):
                    count += 1
            time.sleep(2)
        time.sleep(3)
    print("[DemandCrawler] Workflow C完成，入库" + str(count) + "条")


# ══════════════════════════════════════════════════════════════════
# Main loop
# ══════════════════════════════════════════════════════════════════

def main_loop(interval_hours=6):
    print("[DemandCrawler] 三合一需求爬虫 v1 就位，每" + str(interval_hours) + "h一轮")
    print("[DemandCrawler] 工作流: A=Shopify买家  B=供应商配对买家  C=亚洲中小供应商")
    time.sleep(90)  # 等待 api 容器和 searxng 就绪

    while True:
        t0 = time.time()
        print("[DemandCrawler] ====== 新一轮开始 ======")

        for name, fn in [("A", run_workflow_a), ("B", run_workflow_b), ("C", run_workflow_c)]:
            try:
                fn()
            except Exception as e:
                print("[DemandCrawler] Workflow " + name + " 异常: " + str(e))

        elapsed = (time.time() - t0) / 60
        print("[DemandCrawler] 本轮完成，耗时%.1fmin，休息%dh" % (elapsed, interval_hours))
        time.sleep(interval_hours * 3600)


if __name__ == "__main__":
    main_loop(interval_hours=6)

/**
 * 从 College of Immigration and Citizenship Consultants 公开名录抓取 RCIC 列表
 * 来源: https://register.college-ic.ca/Public-Register-EN/RCIC_Search.aspx
 * 需先安装浏览器: npx playwright install chromium
 * 运行: npx ts-node scripts/sync-ircc-consultants.ts
 */

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
} catch {
  // 无 dotenv 时依赖环境变量
}

import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SEARCH_URL = "https://register.college-ic.ca/Public-Register-EN/RCIC_Search.aspx";

interface ScrapedRow {
  licenseNumber: string;
  name: string | null;
  company: string | null;
  licenceType: string | null;
  entitlement: string | null;
  region: string | null;
}

function normalizeStatus(licenceType: string | null, entitlement: string | null): string {
  const part1 = (licenceType || "").trim() || "—";
  const ent = (entitlement || "").trim();
  const part2 = ent || "—";
  return part1 !== "—" ? `${part1} | Entitled: ${part2}` : `Entitled: ${part2}`;
}

async function scrapeRcicSearch(): Promise<ScrapedRow[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    locale: "en-CA",
  });
  const page = await context.newPage();

  const rows: ScrapedRow[] = [];

  try {
    await page.goto(SEARCH_URL, { waitUntil: "domcontentloaded", timeout: 60000 });

    // 等待页面完全加载（含 JS 渲染）
    await page.waitForTimeout(5000);

    const findButton = await page.$('input[type="submit"][value="Find"]');
    if (findButton) {
      await findButton.click();
      await page.waitForSelector('table.rgMasterTable, table[id*="ResultsGrid_Grid1"], #ctl01_TemplateBody_WebPartManager1_gwpciSearchLicensee_ciSearchLicensee_ResultsGrid_Grid1', {
        timeout: 20000,
      }).catch(() => null);
      await page.waitForTimeout(3000);
      // 若有每页条数下拉，选 50 以多取一些结果
      const pageSizeSelect = await page.$('select[id*="PageSize"], select[id*="Grid1"][id*="PageSize"], table select');
      if (pageSizeSelect) {
        await pageSizeSelect.selectOption({ value: "50" }).catch(() => null);
        await page.waitForTimeout(2000);
      }
    }

    // 只解析数据行（Telerik RadGrid: rgRow / rgAltRow），排除表头、分页行
    const dataRowSelectors =
      "table.rgMasterTable tr.rgRow, table.rgMasterTable tr.rgAltRow, table[id*='Grid1'] tr.rgRow, table[id*='Grid1'] tr.rgAltRow";

    const pagerKeywords = [
      "page size",
      "items in",
      " pages",
      "data pager",
      "change page size",
      "select10",
      "2050",
    ];
    const isPagerRow = (cells: string[]) =>
      cells.some((c) =>
        pagerKeywords.some((k) => c.toLowerCase().includes(k))
      );
    const licensePattern = /^R\d{4,}$/i; // College ID 如 R709364

    const parseTableRows = async (): Promise<number> => {
      const dataTrs = await page.$$(dataRowSelectors);
      let added = 0;
      for (const tr of dataTrs) {
        const tds = await tr.$$("td");
        if (tds.length < 2) continue;
        const texts = await Promise.all(tds.map((td) => td.textContent()));
        const t = texts.map((s) => (s || "").trim());
        if (isPagerRow(t)) continue;
        const licenseCol = t.findIndex((c) => licensePattern.test(c));
        if (licenseCol < 0) continue;
        const licenseNumber = t[licenseCol] || "";
        const name = t[licenseCol + 1] || null;
        const company = t[licenseCol + 2] ?? null;
        const entitlement = t[licenseCol + 3] ?? null;
        // 当前 College 结果表仅有 View/College ID/Name/Company/Type/Entitled，无 Country/City 列，地区暂不填
        rows.push({
          licenseNumber,
          name: name || null,
          company: company || null,
          licenceType: null,
          entitlement: entitlement || null,
          region: null,
        });
        added++;
      }
      if (added === 0) {
        const table = await page.$("table.rgMasterTable, table[id*='Grid1']");
        if (table) {
          const trs = await table.$$("tbody tr, tr");
          for (const tr of trs) {
            const tds = await tr.$$("td");
            if (tds.length < 2) continue;
            const texts = await Promise.all(tds.map((td) => td.textContent()));
            const t = texts.map((s) => (s || "").trim());
            if (isPagerRow(t)) continue;
            const licenseCol = t.findIndex((c) => licensePattern.test(c));
            if (licenseCol < 0) continue;
            const licenseNumber = t[licenseCol] || "";
            rows.push({
              licenseNumber,
              name: t[licenseCol + 1] || null,
              company: t[licenseCol + 2] ?? null,
              licenceType: null,
              entitlement: t[licenseCol + 3] ?? null,
              region: null,
            });
            added++;
          }
        }
      }
      return added;
    };

    let pageCount = 0;
    const MAX_PAGES = 100; // 约 2000 条；改为 300+ 可抓更多（全加约 1.7 万条、858 页）

    while (pageCount < MAX_PAGES) {
      const added = await parseTableRows();
      if (added === 0 && pageCount === 0) break;
      pageCount++;
      if (added === 0) break;
      console.log("  Page %s: %s rows (total %s).", pageCount, added, rows.length);
      // 点击「下一页」：College 使用 input.rgPageNext[title="Next Page"]（submit 会触发表单 postback）
      const nextBtn = await page.$('input.rgPageNext[title="Next Page"]');
      if (!nextBtn) break;
      const isDisabled = await nextBtn.getAttribute("disabled");
      if (isDisabled != null) break;
      await nextBtn.click().catch(() => null);
      await page.waitForTimeout(2500);
    }

    if (rows.length === 0) {
      const body = await page.innerHTML("body");
      const fs = await import("fs");
      const snapshotPath = path.join(__dirname, "register-page-snapshot.html");
      fs.writeFileSync(snapshotPath, body, "utf8");
      console.log("Saved page snapshot to %s for inspection.", snapshotPath);
    }

    await context.close();
    await browser.close();
  } catch (e) {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
    throw e;
  }

  return rows;
}

async function main() {
  console.log("Fetching RCIC list from College public register...");
  const rows = await scrapeRcicSearch();
  console.log("Scraped %s rows.", rows.length);

  if (rows.length === 0) {
    console.log("No rows parsed. The page structure may have changed; check selectors in this script.");
    await prisma.$disconnect();
    process.exit(0);
  }

  // 删除此前误抓的分页/占位等无效数据（非 R 开头的编号）
  const validIdRe = /^R\d{4,}$/i;
  const allExisting = await prisma.iRCCConsultant.findMany({
    select: { id: true, licenseNumber: true },
  });
  const invalidIds = allExisting.filter((r) => !validIdRe.test(r.licenseNumber)).map((r) => r.id);
  if (invalidIds.length > 0) {
    await prisma.iRCCConsultant.deleteMany({ where: { id: { in: invalidIds } } });
    console.log("Removed %s invalid record(s) (non–College-ID format).", invalidIds.length);
  }

  const MAX_LICENSE = 100;
  const MAX_STATUS = 255;
  const MAX_NAME = 255;
  const MAX_COMPANY = 2000;
  const MAX_REGION = 200;

  const trunc = (s: string | null | undefined, max: number) =>
    s == null ? undefined : s.slice(0, max).trim() || undefined;

  const licenseNumbers = [...new Set(rows.map((r) => trunc(r.licenseNumber, MAX_LICENSE)).filter(Boolean) as string[])];
  const existingMap = new Map<string, { id: string }>();
  for (let i = 0; i < licenseNumbers.length; i += 500) {
    const chunk = licenseNumbers.slice(i, i + 500);
    const list = await prisma.iRCCConsultant.findMany({
      where: { licenseNumber: { in: chunk } },
      select: { id: true, licenseNumber: true },
    });
    list.forEach((x) => existingMap.set(x.licenseNumber, { id: x.id }));
  }

  let created = 0;
  let updated = 0;
  const BATCH = 40;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (r) => {
        const licenseNumber = trunc(r.licenseNumber, MAX_LICENSE);
        if (!licenseNumber) return;
        const registrationStatus = trunc(
          normalizeStatus(r.licenceType, r.entitlement),
          MAX_STATUS
        )!;
        const existing = existingMap.get(licenseNumber);
        if (existing) {
          await prisma.iRCCConsultant.update({
            where: { id: existing.id },
            data: {
              name: trunc(r.name, MAX_NAME),
              companyAddress: trunc(r.company, MAX_COMPANY),
              region: trunc(r.region, MAX_REGION),
              registrationStatus,
              updatedAt: new Date(),
            },
          });
          updated++;
        } else {
          await prisma.iRCCConsultant.create({
            data: {
              licenseNumber,
              registrationStatus,
              name: trunc(r.name, MAX_NAME),
              companyAddress: trunc(r.company, MAX_COMPANY),
              region: trunc(r.region, MAX_REGION),
            },
          });
          created++;
        }
      })
    );
  }

  console.log("Done. Created: %s, Updated: %s.", created, updated);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import puppeteer from "puppeteer";

export const extractJustDialSession = async (category, city) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  let jdlt = null;
  let search_id = null;
  let nextdocid = null;
  let mncatname = null;

  await page.setRequestInterception(true);

  page.on("request", (req) => req.continue());

  page.on("requestfinished", async (req) => {
    if (req.url().includes("/api/resultsPageListing")) {
      try {
        const json = JSON.parse(req.postData());
        jdlt = json.jdlt;
        search_id = json.search_id;
        nextdocid = json.nextdocid;
        mncatname = json.mncatname;
      } catch (err) {
        console.error("Failed to parse POST body:", err.message);
      }
    }
  });

  const url = `https://www.justdial.com/${city}/${category}`;
  await page.goto(url, { waitUntil: "networkidle2" });

  await page.waitForSelector(".results_listing_container", { timeout: 10000 });
  await page.evaluate(() => window.scrollBy(0, 2500));
  await new Promise((res) => setTimeout(res, 5000));

  const finalUrl = page.url();
  const national_catid = finalUrl.split("/").pop()?.replace("nct-", "") || null;

  const cookies = await page.browserContext().cookies(url);

  await browser.close();

  return {
    jdlt,
    cookies,
    national_catid,
    search_id,
    nextdocid,
    city,
    category,
    mncatname,
  };
};

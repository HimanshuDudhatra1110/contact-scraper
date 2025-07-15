import chalk from "chalk";
import puppeteer from "puppeteer";
import { scrapeJustDialContacts } from "../scrapers/justdial.js";

export const getContacts = async (
  category,
  selectedCities,
  limit,
  verifiedOnly
) => {
  const contactsSet = new Set();
  const contacts = [];

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: [
        "--start-maximized",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-features=site-per-process",
        "--disable-extensions",
        "--single-process",
      ],
    });

    const page = await browser.newPage();

    // // Set a realistic desktop user-agent
    // await page.setUserAgent(
    //   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    //     "AppleWebKit/537.36 (KHTML, like Gecko) " +
    //     "Chrome/124.0.0.0 Safari/537.36"
    // );

    // // Set additional headers
    // await page.setExtraHTTPHeaders({
    //   "Accept-Language": "en-US,en;q=0.9",
    // });

    for (const city of selectedCities) {
      try {
        await scrapeJustDialContacts(
          category,
          city,
          limit,
          page,
          contacts,
          contactsSet,
          verifiedOnly
        );
      } catch (cityError) {
        console.log(
          chalk.red(`Failed to scrape ${city}: ${cityError.message}`)
        );
      }
    }
  } catch (error) {
    console.log(
      chalk.red(`Error launching browser or scraping: ${error.message}`)
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return contacts;
};

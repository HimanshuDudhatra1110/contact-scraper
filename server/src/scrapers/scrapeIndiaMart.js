import axios from "axios";
import * as cheerio from "cheerio";
// import { verifyContact } from "../utils/verifyContact";

export const scrapeIndiaMart = async (category, limit, requiredFields) => {
  try {
    const url = `https://dir.indiamart.com/search.mp?ss=${encodeURIComponent(category)}`;
    const { data } = await axios.get(url, {
      headers: {
        // Sometimes needed to avoid bot detection
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    const $ = cheerio.load(data);
    const contacts = [];

    $(".card").each((_, el) => {
      if (contacts.length >= limit) return;

      const name = $(el).find(".producttitle a.cardlinks").text().trim();
      const phone =
        $(el)
          .find("span.pns_h")
          .text()
          .replace(/[^0-9]/g, "")
          .trim() || null;
      const address = $(el).find(".newLocationUi p").text().trim();
      const company = $(el).find(".companyname a.cardlinks").text().trim();

      const email = null; // still not available

      const text = $(el).text().toLowerCase();

      //   const { verified, issues } = verifyContact({
      //     category,
      //     text,
      //     phone,
      //     email,
      //     address,
      //     requiredFields,
      //   });

      contacts.push({
        name: name || company || "N/A",
        company,
        phone,
        email,
        address,
        // verified,
        // issues,
      });
    });

    return contacts;
  } catch (error) {
    throw new Error("Error scraping IndiaMart: " + error.message);
  }
};

const result = await scrapeIndiaMart("doctor", 25);

console.log("res", result);

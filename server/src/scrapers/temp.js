// src/scrapers/justdial.js
import axios from "axios";
import { extractJustDialSession } from "../utils/extractSession";
import { justdialApi } from "../utils/justdialApi";

export const scrapeJustDial = async (
  category,
  city,
  limit,
  { verifiedOnly = false } = {}
) => {
  const contacts = [];
  let page = 1;
  let nextdocid = null;
  let search_id = null;
  let jdlt = null;

  try {
    // Step 1: Extract session data (jdlt, search_id, cookies)
    const session = await extractJustDialSession(city, category);
    if (!session || !session.jdlt || !session.search_id || !session.cookies) {
      throw new Error("Failed to extract required session data");
    }
    jdlt = session.jdlt;
    search_id = session.search_id;
    const cookies = session.cookies;

    while (contacts.length < limit) {
      const response = await justdialApi({
        city,
        category,
        page,
        nextdocid,
        search_id,
        jdlt,
        cookies,
      });

      if (!response || !response.data || !Array.isArray(response.data)) break;

      for (const entry of response.data) {
        if (contacts.length >= limit) break;

        const [
          doc_id,
          name,
          ,
          address,
          lat,
          long,
          ,
          rating,
          ,
          ,
          ,
          ,
          shortAddress,
          ,
          categories,
          phone,
          rating_count,
          ,
          cityName,
          image,
        ] = entry;

        const verified = entry[70]?.jd_verified === "1" || false;
        if (verifiedOnly && !verified) continue;

        contacts.push({
          name,
          phone: phone || null,
          address: address || shortAddress || null,
          rating: rating || null,
          rating_count: rating_count || null,
          verified,
          city: cityName,
          doc_id,
          image: image || null,
        });
      }

      if (!response.nextdocid) break;
      nextdocid = response.nextdocid;
      page++;
    }

    return contacts;
  } catch (error) {
    throw new Error("Error scraping JustDial: " + error.message);
  }
};

const res = await scrapeJustDial("doctor", "mumbai", 25);
console.log("res", res);

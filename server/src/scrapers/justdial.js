import chalk from "chalk";

export const scrapeJustDialContacts = async (
  category,
  city,
  limit = 50,
  page,
  contacts,
  contactsSet,
  verifiedOnly = false
) => {
  try {
    const url = `https://www.justdial.com/${city}/${category}`;
    await page.goto(url, { waitUntil: "networkidle2" });

    await page.waitForSelector(".results_listing_container", { timeout: 8000 });

    // Extra listeners for debugging crashes
    page.on("error", (err) => {
      console.log(chalk.red("Page error:"), err.message);
    });

    page.on("pageerror", (err) => {
      console.log(chalk.red("Runtime error on page:"), err.message);
    });

    page.on("close", () => {
      console.log(chalk.red("Puppeteer page closed unexpectedly"));
    });

    // Click "Verified" filter if required
    if (verifiedOnly) {
      const clicked = await page.evaluate(() => {
        const buttons = document.querySelectorAll(
          ".resfilter_items_container button"
        );
        for (const btn of buttons) {
          if (btn.innerText.toLowerCase().includes("verified")) {
            btn.click();
            return true;
          }
        }
        return false;
      });

      if (clicked) {
        try {
          await page.waitForSelector(".resultbox_info", { timeout: 5000 });
          await page.waitForTimeout(2000);
        } catch {
          console.log("Verified filter applied but no results appeared.");
        }
      }
    }

    let lastSeenCount = 0;
    let sameCountRetries = 0;

    while (contacts.length < limit && sameCountRetries < 5) {
      // Check if results container still exists (prevents white screen crash)
      const stillLoaded = await page.$(".results_listing_container");
      if (!stillLoaded) {
        // console.log("Results container missing. Page may have crashed.");
        // break;
        await new Promise((res) => setTimeout(res, 3000));
      }

      // Extract all visible contacts
      const listings = await page.$$eval(
        ".results_listing_container .resultbox_info .resultbox_textbox",
        (nodes) =>
          nodes.map((node) => {
            const name =
              node
                .querySelector(".resultbox_title_anchor")
                ?.innerText?.trim() || null;
            const address =
              node
                .querySelector(".resultbox_address .locatcity")
                ?.innerText?.trim() || null;
            const phone =
              node.querySelector(".callcontent")?.innerText?.trim() || null;
            const rating =
              node.querySelector(".resultbox_totalrate")?.innerText?.trim() ||
              null;

            return { name, address, phone, rating };
          })
      );

      for (const contact of listings) {
        if (!contact.phone || !/^\d{6,}$/.test(contact.phone)) continue;

        const key = `${contact.name}-${contact.phone}`;
        if (!contactsSet.has(key)) {
          contactsSet.add(key);
          contacts.push(contact);
          if (contacts.length >= limit) break;
        }
      }

      const currentCount = listings.length;

      if (currentCount === lastSeenCount) {
        sameCountRetries++;
        console.log(`Same count again (${sameCountRetries})`);
      } else {
        sameCountRetries = 0;
      }
      lastSeenCount = currentCount;

      // Scroll step-by-step (with wait)
      try {
        await page.evaluate(async () => {
          for (let i = 0; i < 5; i++) {
            window.scrollBy(0, 200);
            await new Promise((res) => setTimeout(res, 800));
          }
        });
        await new Promise((res) => setTimeout(res, 3000));
      } catch (scrollError) {
        console.log("Scroll failed:", scrollError.message);
        break;
      }

      // Wait for more results if possible
      try {
        await page.waitForFunction(
          (prevCount) =>
            document.querySelectorAll(".resultbox_info").length > prevCount,
          { timeout: 8000 },
          lastSeenCount
        );
      } catch {
        console.log("No new results appeared after scroll.");
      }
    }

    console.log(`Total unique contacts: ${contacts.length}`);
  } catch (error) {
    console.log(chalk.red(`Error while scraping contacts: ${error.message}`));
  }
};

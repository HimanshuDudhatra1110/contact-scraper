import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs";
import { TOP_CITIES } from "./config/constants.js";
import { getContacts } from "./utils/getContacts.js";

const main = async () => {
  try {
    console.log(chalk.blue.bold("\nJustDial Contact Scraper\n"));
    let limit = 0;
    let verifiedOnly = false;

    // Step 1: Ask for business category
    const { category } = await inquirer.prompt([
      {
        type: "input",
        name: "category",
        message: "Enter business category (e.g. doctors, jewelers):",
        validate: (input) => !!input || "Category is required.",
      },
    ]);

    // Step 2: Ask for plan
    const { plan } = await inquirer.prompt([
      {
        type: "list",
        name: "plan",
        message: "Choose your plan:",
        choices: ["Basic", "Standard", "Premium"],
      },
    ]);

    let selectedCities = [];

    if (plan === "Basic") {
      limit = 25;
      const { city } = await inquirer.prompt([
        {
          type: "list",
          name: "city",
          message: "Select a city:",
          choices: TOP_CITIES,
        },
      ]);
      selectedCities.push(city);
    } else {
      if (plan === "Standard") {
        limit = 50;
      } else {
        limit = 100;
      }
      verifiedOnly = true;
      const { mode } = await inquirer.prompt([
        {
          type: "list",
          name: "mode",
          message: "Fetch data from:",
          choices: ["All India", "Select City"],
        },
      ]);

      if (mode === "All India") {
        selectedCities = [...TOP_CITIES];
      } else {
        const { city } = await inquirer.prompt([
          {
            type: "list",
            name: "city",
            message: "Select a city:",
            choices: TOP_CITIES,
          },
        ]);
        selectedCities.push(city);
      }
    }

    console.log(chalk.yellow("Starting contact scraping..."));

    const allContacts = await getContacts(
      category,
      selectedCities,
      limit,
      verifiedOnly
    );

    if (!allContacts) {
      console.log(chalk.cyan(`No contact found`));
      return;
    }

    console.log("all contacts ");

    try {
      fs.writeFileSync("results.json", JSON.stringify(allContacts, null, 2));
      console.log(
        chalk.green(`\nSaved ${allContacts.length} contacts to results.json\n`)
      );
    } catch (fileError) {
      console.log(
        chalk.red("Failed to write results to file:"),
        fileError.message
      );
    }
  } catch (err) {
    console.log(chalk.red("Unexpected error occurred:"), err.message);
  }
};

main();

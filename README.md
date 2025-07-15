# JustDial Contact Scraper

A command-line tool to scrape contact details like phone numbers, addresses, and ratings from [JustDial](https://www.justdial.com) by business category and city.

## 📦 Setup Instructions

Follow these steps to run the scraper:

### 1. Clone the repository

```bash
git clone https://github.com/your-username/contact-scraper.git
```

### 2. Navigate to the server directory

```bash
cd contact-scraper/server
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the scraper

```bash
npx start
```

> You will be prompted in the terminal to enter:
> - Business category (e.g., doctors, jewelers, gyms)
> - Scraping plan (Basic / Standard / Premium)
> - City or All India selection

## 📁 Output

Scraped contacts are saved to a file named:

```
results.json
```

Each contact entry will look like:

```json
{
  "name": "ABC",
  "address": "Ahmedabad",
  "phone": "00000000000",
  "rating": "4.5"
}
```

## ⚠️ Disclaimer

- This project is for educational/demo purposes only.
- Please respect [JustDial's Terms of Service](https://www.justdial.com/TOS) when using this tool.
- Do not use this script for commercial scraping without permission.

## 📄 License

MIT License

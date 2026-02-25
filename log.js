// scripts/log-client-console.js
const puppeteer = require("puppeteer");
(async () => {
  const url = process.argv[2] || "http://localhost:3000/auth/login";
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  });
  const page = await browser.newPage();
  page.on("console", msg => {
    console.log("PAGE:", msg.type(), ...msg.args().map(a => a.toString()));
  });
  await page.goto(url);
  // keep open to see logs; Ctrl+C to stop
})();
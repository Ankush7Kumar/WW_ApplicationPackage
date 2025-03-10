require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://waterlooworks.uwaterloo.ca/waterloo.htm?action=login', { waitUntil: 'domcontentloaded' });

    // Wait for username field to appear
    await page.waitForSelector('#userNameInput', { timeout: 10000 });
    
    // Type username and click Next
    await page.type('#userNameInput', process.env.WATERLOO_USERNAME);
    await page.waitForSelector('#nextButton', { timeout: 10000 });
    await page.click('#nextButton');

    // Wait for password field
    await page.waitForSelector('#passwordInput', { timeout: 10000 });

    // Type password and submit
    await page.type('#passwordInput', process.env.WATERLOO_PASSWORD);
    await page.waitForSelector('button[type="submit"], #submitButton', { timeout: 10000 });
    await page.click('button[type="submit"], #submitButton');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log("Logged in successfully!");

    await browser.close();
})();
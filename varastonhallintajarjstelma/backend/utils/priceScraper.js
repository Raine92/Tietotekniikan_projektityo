const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

puppeteer.use(StealthPlugin());

const SCRAPFLY_KEY = process.env.SCRAPFLY_API_KEY?.replace(/['"]+/g, '');

function calculateStats(items) {
    const prices = items.map(i => i.price).filter(p => p !== null && p > 0);
    if (prices.length === 0) return { count: 0, average: 0, median: 0, min: 0, max: 0 };

    prices.sort((a, b) => a - b);
    const sum = prices.reduce((a, b) => a + b, 0);
    const mid = Math.floor(prices.length / 2);
    
    return {
        count: prices.length,
        average: (sum / prices.length).toFixed(2),
        median: prices.length % 2 === 0 ? ((prices[mid - 1] + prices[mid]) / 2).toFixed(2) : prices[mid].toFixed(2),
        min: prices[0].toFixed(2),
        max: prices[prices.length - 1].toFixed(2),
    };
}

const getPrices = async (pelinNimi, alusta) => {
    let browser;
    const tulokset = { pricecharting: 0, vpd: 0, retrogametycoon: 0, ebay: { average: 0, median: 0, count: 0 } };
    const hakutermi = `${pelinNimi} ${alusta}`;
    const encodedSearch = encodeURIComponent(hakutermi);

    // --- 1. EBAY (SCRAPFLY) ---
    if (SCRAPFLY_KEY) {
        try {
            const scrapflyUrl = `https://api.scrapfly.io/scrape?key=${SCRAPFLY_KEY}&url=${encodeURIComponent(`https://www.ebay.com/sch/i.html?_nkw=${encodedSearch}&LH_BIN=1&_sop=12`)}&asp=true&render_js=true`;
            const { data } = await axios.get(scrapflyUrl);
            const $ = cheerio.load(data.result.content);
            const items = [];
            $('li.s-item, ul.srp-results > li').each((i, el) => {
                const priceText = $(el).find('.s-item__price, .s-card__price').text();
                const match = priceText.match(/[\d,.]+/);
                if (match) items.push({ price: Number(match[0].replace(/,/g, '')) });
            });
            tulokset.ebay = calculateStats(items);
        } catch (e) { console.error("eBay virhe"); }
    }

    // --- 2. MUUT (PUPPETEER) ---
    try {
        browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

        // RETROGAMETYCOON (Parannettu haku)
        try {
            await page.goto(`https://retrogametycoon.com/fi/search/?q=${encodedSearch}`, { waitUntil: 'networkidle2', timeout: 15000 });
            // Odotetaan että tuotelistaus ilmestyy
            await page.waitForSelector('.price-detail, .price', { timeout: 5000 }).catch(() => {});
            const rgtTeksti = await page.evaluate(() => {
                const el = document.querySelector('.price-detail h4') || document.querySelector('.price');
                return el ? el.innerText : "";
            });
            tulokset.retrogametycoon = parseFloat(rgtTeksti.replace(",", ".").replace(/[^0-9.]/g, "")) || 0;
            console.log(`Debug: RGT löytö: ${tulokset.retrogametycoon}`);
        } catch (e) { console.log("RGT epäonnistui"); }

        // VPD
        try {
            await page.goto(`https://www.vpd.fi/search/?q=${encodedSearch}`, { waitUntil: 'networkidle2' });
            await page.waitForSelector('.kuSalePrice', { timeout: 5000 }).catch(() => {});
            const vpdTeksti = await page.evaluate(() => document.querySelector('.kuSalePrice')?.innerText || "");
            tulokset.vpd = parseFloat(vpdTeksti.replace(",", ".").replace(/[^0-9.]/g, "")) || 0;
        } catch (e) { console.log("VPD epäonnistui"); }

        // PRICECHARTING
        try {
            await page.goto(`https://www.pricecharting.com/search-products?q=${encodedSearch}&type=videogames`, { waitUntil: 'networkidle2' });
            const pcTeksti = await page.evaluate(() => document.querySelector('.price.used_price .js-price, td.used_price span.js-price, .price.numeric')?.innerText || "");
            tulokset.pricecharting = parseFloat(pcTeksti.replace(/[^0-9.]/g, "")) || 0;
        } catch (e) { console.log("PC epäonnistui"); }

        await browser.close();
    } catch (error) { if (browser) await browser.close(); }

    return tulokset;
};

module.exports = { getPrices };
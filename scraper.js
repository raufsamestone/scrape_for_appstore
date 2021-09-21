const fs = require("fs");
const puppeteer = require('puppeteer');

(async () => {
  //Paste your App URL on Appstore see all reviews!
  const url = `https://apps.apple.com/tr/app/teknosa-al%C4%B1%C5%9Fveri%C5%9F-teknoloji/id724839784?l=tr#see-all/reviews`

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(`${url}`);

  await autoScroll(page);

  async function autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        var totalHeight = 0;
        var distance = 100;
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);  //Set specify time for scroll down.
      });
    });
  }

  let queryData = await page.evaluate(() => {
    let queries = [];
    let queriesElms = document.querySelectorAll('.we-customer-review');
    queriesElms.forEach((queryelement) => {
      let resultJSON = {};
      try {
        resultJSON.commentTitle = queryelement.querySelector('.we-customer-review__title').innerText;
        resultJSON.commentDesc = queryelement.querySelector('p').innerText;
        resultJSON.commentDate = queryelement.querySelector('time').innerText;
        resultJSON.commentStars = queryelement.querySelector('figure').ariaLabel.toString()
      }
      catch (exception) {
      }
      queries.push(resultJSON);
    });
    return queries;
  });

  browser.close();

  const data = JSON.stringify(queryData);
  fs.writeFile(`.results.json`, data, 'utf8', (err) => {
    if (err) {
      console.log(`Error writing file: ${err}`);
    } else {
      console.log(`Result is written successfully! 👍 `);
    }
  });
  
})();
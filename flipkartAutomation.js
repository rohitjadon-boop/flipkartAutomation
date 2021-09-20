const productInfo = process.argv.slice(2);
const productName = productInfo[0];
const productPrice = productInfo[1];
const productRating = productInfo[2];


const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const puppeteer = require('puppeteer');
const credObj = require('../constants/credentials');
const siteObj = require('../constants/siteInfo');
const commentsObj = require('../comments/comments');


let prevPage = -1;
let productArray = [];

if (!productPrice || !productName) {
    console.log(commentsObj.comments.productNameAndPrice);
    return;
}

if (isNaN(productPrice)) {
    console.log(commentsObj.comments.productPrice);
    return;
}

if (productName.length < 3 || !isNaN(productName)) {
    console.log(commentsObj.comments.productName);
    return;
}

if (productRating < 0 || productRating > 5) {
    console.log(commentsObj.comments.productRating);
    return;
}

let page;
async function flipkartData() {
    try {
        let browserObj = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized'],
        });

        let pageObj = await browserObj.newPage();
        page = pageObj;


        await page.goto('https://www.google.com');

        await page.click('.gLFyf.gsfi');

        await page.type('.gLFyf.gsfi', siteObj.siteName, { delay: 100 });

        await page.keyboard.press('Enter');

        await page.waitForSelector('.LC20lb.DKV0Md', { visible: true });

        let flipKartSelector = await page.$('.LC20lb.DKV0Md');

        await flipKartSelector.click({ delay: 100 });

        await page.waitForSelector('._1_3w1N', { visible: true });

        await page.click('._1_3w1N');

        await page.waitForSelector('._1psGvi._3BvnxG');

        let loginSelector = await page.$('._1psGvi._3BvnxG');

        await loginSelector.click();

        await page.waitForSelector('.IiD88i._351hSN');

        let loginCred = await page.$$('.IiD88i._351hSN');

        await loginCred[0].click();

        await page.keyboard.type(credObj.userName, { delay: 100 });

        await loginCred[1].click();

        await page.keyboard.type(credObj.password, { delay: 100 });

        await page.keyboard.press('Enter');

        await page.waitForTimeout(5000);

        await page.click('._3OO5Xc');

        await page.keyboard.type(productName);

        await page.keyboard.press('Enter');

        await page.waitForSelector('.ge-49M', { visible: true });

        while (true) {


            let pageSelectorList = await page.$$('.ge-49M');

            await page.waitForTimeout(5000);

            console.log(pageSelectorList.length);

            let currentPage = await page.evaluate(function (element) {
                return element.textContent;
            }, pageSelectorList[pageSelectorList.length - 1]);

            if (currentPage != prevPage) {
                prevPage = currentPage;
                await pageSelectorList[pageSelectorList.length - 1].click();
            }
            else {
                break;
            }
            await page.waitForTimeout(3000);
        }


        await page.click('._3OO5Xc');

        await page.keyboard.type(productName);

        await page.keyboard.press('Enter');

        await page.waitForTimeout(10000);

        let allPages = await page.$$('.ge-49M');

        for (let i = 0; i < 5; i++) {


            await page.waitForSelector('.s1Q9rs', { visible: true });
            let currentPageProductName = await page.$$('.s1Q9rs');

            console.log('141');

            await page.waitForSelector('._8VNy32 ._30jeq3', { visible: true });
            let currentPageProductPrice = await page.$$('._8VNy32 ._30jeq3');

            console.log('146');

            await page.waitForSelector('.gUuXy-._2D5lwg ._3LWZlK', {visible: true});
            let currentPageProductRating= await page.$$('.gUuXy-._2D5lwg ._3LWZlK');

            console.log('151');


            for (let j = 0; j < currentPageProductName.length; j++) {
                let data = await page.evaluate(function (name, price, rating) {
                    return {
                        name: name.textContent,
                        price: price.textContent.slice(1),
                        rating: (Math.random()*5).toFixed(1),
                    }
                }, currentPageProductName[j], currentPageProductPrice[j], currentPageProductRating[j]);

                productArray.push(data);
                // console.log('````````````````````````````````````````````````````````````````````');
            }
            console.log(i);

            await allPages[i + 1].click();

            await page.waitForTimeout(4000);

        }
        console.log('168');
        for (let i = 0; i < productArray.length; i++) {
            let priceinNumber = "";
            let productDetails = productArray[i];
            let currentPriceInString = productDetails.price;
            for (let j = 0; j < currentPriceInString.length; j++) {
                if (currentPriceInString.charAt(j) === ',') continue;
                priceinNumber += currentPriceInString.charAt(j);
            }
            productArray[i].price = priceinNumber;
        }
        let filteredArray = [];
        for (let i = 0; i < productArray.length; i++) {
            if (Number(productArray[i].price) <= Number(productPrice) && Number(productArray[i].rating) >= Number(productRating)) {
                
                filteredArray.push(productArray[i]);
            }
        }

        productArray = [...filteredArray];

        console.log(productArray);

        console.log('189');


        /*````````````````````````````````````Creating File And Folder With ProductName InIt````````````````````````````````````*/

        for (let i = 0; i < productArray.length; i++) {

            let product = productArray[i].name.toUpperCase().split(" ");
            product = product[0];

            let dirPath = process.cwd();

            let completePath = path.join(dirPath, product);

            console.log(completePath);
            if (fs.existsSync(completePath) == false) {

                fs.mkdirSync(completePath);
            }

            let fileName = path.join(completePath, product);

            fs.appendFileSync(fileName, productArray[i].name + " " + productArray[i].price + "\n");
            console.log('File is Created Succesfully........', fileName);

        }

        console.log('216');



        /*`````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````*/

        /*````````````````````````````````````````Sorting The Array According To Price``````````````````````````````````````````````*/

        console.log('224');

        let sortedArray = productArray.sort((objA, objB) => {
            return objA.price - objB.price;
        })

        productArray = [...sortedArray];

        console.log('232');


        /*`````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````*/



        /*````````````````````````````````````````Creating Xml File To Store The  Data`````````````````````````````````````````````*/

        function createFile(filePath, jsonData, sheetName) {
            let Wb = xlsx.utils.book_new();
            let Ws = xlsx.utils.json_to_sheet(jsonData);
            xlsx.utils.book_append_sheet(Wb, Ws, sheetName);
            xlsx.writeFile(Wb, filePath);
        }

        productArray = JSON.stringify(productArray);
        productArray = JSON.parse(productArray);
        createFile(path.join(process.cwd(), "xml.xlsx"), productArray, "MySheet");

        console.table(productArray);

        /*`````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````*/

    }
    catch {
        console.log('Error');
    }
}

flipkartData();


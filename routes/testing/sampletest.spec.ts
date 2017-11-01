const url = "http://marketcarpenter.client.mojoactive.com/contact/contact-us";
import { assert } from "chai"
import * as puppeteer from "puppeteer"

describe("Contact Us", function() {
    let page: puppeteer.Page;
    let browser: puppeteer.Browser;
    let submit: puppeteer.ElementHandle;
    
    let x: Number;

    this.timeout(10000)

    before(async () => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
        await page.goto(url)
        submit = await page.$('#btnSubmit')
    })

    it("Email should be an email.", async () => {
        let email = await page.$('input[name="txtEmail"]')
        await page.tap('input[name="txtEmail"]')
        await page.keyboard.type("hello@hello.com")
        await submit.click()
        let error_msg = await page.$$('span.k-invalid-msg[data-for="txtEmail"]')
        await page.screenshot({ path: './temp/tests/email-email.png' })
        assert.isEmpty(error_msg)
    })

    it("Email should fail on non-emails.", async () => {
        let email = await page.$('input[name="txtEmail"]')
        await page.tap('input[name="txtEmail"]')
        await page.keyboard.type("wdasdawd")
        await submit.click()
        let error_msg = await page.$$('span.k-invalid-msg[data-for="txtEmail"]')
        await page.screenshot({ path: './temp/tests/non-email.png' })
        assert.isNotEmpty(error_msg)
    })

    afterEach(async() => {
        await page.reload()
        submit = await page.$('#btnSubmit')
    })

    after(async() => {
        browser.close();
    })
})
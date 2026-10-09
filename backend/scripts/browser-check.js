import { createRequire } from "node:module";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { createApp } from "../app.js";
import User from "../models/user.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import { createAuthResult } from "../services/authServices.js";
const require = createRequire(import.meta.url);
const {
    chromium,
} = require("C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
dotenv.config({ quiet: true });
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "browser-test-secret-at-least-32-characters";
process.env.GOOGLE_CLIENT_ID = "";
process.env.ADMIN_EMAILS = "";
const database = `armmotors_test_${Date.now()}_${process.pid}`;
let server, browser;
const errors = [],
    checks = [];
try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: database });
    const admin = await User.create({
        name: "Test Admin",
        email: "admin@browser.test",
        role: "admin",
        password: await bcrypt.hash("Testing123!", 10),
    });
    const user = await User.create({
        name: "Test User",
        email: "user@browser.test",
        password: await bcrypt.hash("Testing123!", 10),
    });
    const product = await Product.create({
        owner: admin._id,
        type: "car",
        title: "Toyota Camry",
        price: 9000000,
        vehicleType: "passenger",
        brand: "Toyota",
        model: "Camry",
        year: 2020,
        mileage: 30000,
        fuel: "hybrid",
        steering: "left",
        region: "Երևան",
        phone: "+37499123456",
        images: ["http://127.0.0.1:5173/images/categories/new.png"],
    });
    await Order.create({
        buyer: user._id,
        product: product._id,
        title: product.title,
        amount: product.price,
        status: "completed",
        paidAt: new Date(),
    });
    server = createApp().listen(3001);
    await new Promise((resolve) => server.once("listening", resolve));
    browser = await chromium.launch({
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        headless: true,
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://127.0.0.1:5173/");
    await page.evaluate((data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
    }, createAuthResult(admin));
    for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const path of [
            "/admin",
            "/admin/users",
            "/admin/products",
            "/admin/orders",
            "/admin/messages",
            "/admin/broadcasts",
            "/admin/audit",
            "/",
            "/favorites",
            "/account",
            "/registration",
            `/cars/${product._id}`,
        ]) {
            await page.goto("http://127.0.0.1:5173" + path);
            await page.waitForTimeout(180);
            if (path.startsWith("/admin"))
                await page.locator(".admin-main").waitFor();
            const layout = await page.evaluate(() => ({
                document: document.documentElement.scrollWidth,
                width: window.innerWidth,
                h1: document.querySelector("h1")?.textContent,
            }));
            checks.push({ width, path, ...layout });
            assert.ok(
                layout.document <= width + 2,
                `overflow ${path} at ${width}: ${layout.document}`,
            );
            if (
                width === 1440 &&
                ["/admin", "/admin/broadcasts"].includes(path)
            )
                await page.screenshot({
                    path: `../design-previews/backend-${path === "/admin" ? "dashboard" : "broadcast"}.png`,
                    fullPage: true,
                });
            if (width === 390 && path === "/admin")
                await page.screenshot({
                    path: "../design-previews/backend-dashboard-mobile.png",
                    fullPage: true,
                });
        }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("http://127.0.0.1:5173/admin/broadcasts");
    await page
        .getByLabel("Վերնագիր", { exact: true })
        .fill("ArmMotors նորություններ");
    await page
        .getByLabel("Նամակի տեքստը", { exact: true })
        .fill("Բարի գալուստ։\nԴիտեք նոր առաջարկները։");
    await page.getByRole("button", { name: "Նախադիտել նամակը" }).click();
    await page.locator("iframe").waitFor();
    await page.screenshot({
        path: "../design-previews/backend-email-preview.png",
        fullPage: true,
    });
    await page.getByRole("button", { name: "Պահպանել սևագիրը" }).click();
    await page
        .getByText("Նամակը պահպանված է որպես սևագիր։", { exact: false })
        .waitFor();
    await page.goto("http://127.0.0.1:5173/admin/products");
    await page.getByRole("button", { name: "Խմբագրել", exact: true }).click();
    await page.locator('input[name="title"]').fill("Toyota Camry Updated");
    await page.getByRole("button", { name: "Պահպանել", exact: true }).click();
    await page.getByText("Toyota Camry Updated", { exact: true }).waitFor();
    await page.goto("http://127.0.0.1:5173/");
    await page.evaluate((data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
    }, createAuthResult(user));
    await page.reload();
    await page.locator(".favorite-button").waitFor();
    await page.waitForTimeout(300);
    await page.locator(".favorite-button").click();
    await page.waitForFunction(
        () =>
            document
                .querySelector(".favorite-button")
                ?.getAttribute("aria-pressed") === "true",
    );
    await page.goto("http://127.0.0.1:5173/favorites");
    await page.locator(".listing-card").waitFor();
    assert.equal((await User.findById(user._id)).favorites.length, 1);
    await page.goto(`http://127.0.0.1:5173/cars/${product._id}`);
    await page.getByRole("button", { name: "Գնման հայտ ուղարկել" }).click();
    await page.getByText("Հայտն ուղարկված է։", { exact: false }).waitFor();
    await page.goto("http://127.0.0.1:5173/account");
    await page.getByRole("button", { name: "Չեղարկել հայտը" }).click();
    await page.waitForFunction(
        () => !document.querySelector(".account-order button"),
    );
    assert.equal(
        await Order.countDocuments({ buyer: user._id, status: "pending" }),
        0,
    );
    await page.getByRole("button", { name: "Ելք", exact: true }).click();
    await page.waitForURL("http://127.0.0.1:5173/");
    await page.goto("http://127.0.0.1:5173/login?next=/account");
    await page.locator('input[name="email"]').fill("user@browser.test");
    await page.locator('input[name="password"]').fill("Testing123!");
    await page
        .getByRole("button", { name: "Մուտք գործել", exact: true })
        .click();
    await page.waitForURL("**/account");
    assert.deepEqual(errors, []);
    await fs.writeFile(
        "../design-previews/backend-ui-check.json",
        JSON.stringify(
            {
                checks,
                errors,
                interactions: [
                    "broadcast preview and draft",
                    "admin product edit",
                    "persisted favorites",
                    "purchase request and cancellation",
                    "login/logout",
                ],
            },
            null,
            2,
        ),
    );
    console.log(
        `${checks.length} responsive route checks and 5 UI flows passed; no runtime errors. No real emails sent.`,
    );
} finally {
    await browser?.close();
    if (server) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.readyState) {
        assert.equal(mongoose.connection.name, database);
        assert.match(database, /^armmotors_test_\d+_\d+$/);
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    }
}

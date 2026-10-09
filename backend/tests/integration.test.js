import test from "node:test";
import assert from "node:assert/strict";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { createApp } from "../app.js";
import User from "../models/user.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import { Broadcast, BroadcastDelivery } from "../models/broadcast.js";
import { processBroadcastDelivery } from "../services/broadcastService.js";
import { createAuthResult } from "../services/authServices.js";
import { sendBroadcastEmail } from "../services/emailService.js";
dotenv.config({ quiet: true });
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "isolated-tests-secret-32-characters-long";
process.env.ADMIN_EMAILS = "reserved@example.test";
process.env.GOOGLE_CLIENT_ID = "";
const database = `armmotors_test_${Date.now()}_${process.pid}`;
test("MongoDB integration: auth, administration, purchases, favorites and broadcast", async t => {
    assert.ok(process.env.MONGO_URI, "Configure MONGO_URI before testing");
    await mongoose.connect(process.env.MONGO_URI, { dbName: database, serverSelectionTimeoutMS: 10000 });
    const server = createApp().listen(0, "127.0.0.1");
    await new Promise(resolve => server.once("listening", resolve));
    t.after(async () => {
        await new Promise(resolve => server.close(resolve));
        assert.equal(mongoose.connection.name, database);
        assert.match(database, /^armmotors_test_\d+_\d+$/);
        await mongoose.connection.dropDatabase(); await mongoose.disconnect();
    });
    await Promise.all([User.init(), Product.init(), Order.init(), Broadcast.init(), BroadcastDelivery.init()]);
    const base = `http://127.0.0.1:${server.address().port}/api`;
    async function request(path, method = "GET", body, token) {
        const response = await fetch(base + path, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
        return { status: response.status, data: await response.json().catch(() => null) };
    }
    const register = email => request("/auth/reg", "POST", { name: "Test", surname: "Person", email, phone: "+37499123456", password: "Testing123!", repetPassword: "Testing123!", role: "admin", isAdmin: true });
    let first, second, adminToken, product, order;
    await t.test("registration stores hashes, ignores privilege injection and protects administrator email", async () => {
        first = (await register("first@example.test")).data; second = (await register("second@example.test")).data;
        assert.ok(first.token); assert.equal(first.user.isAdmin, false);
        const stored = await User.findById(first.user.id).select("+password"); assert.equal(stored.role, "user"); assert.notEqual(stored.password, "Testing123!"); assert.ok(await bcrypt.compare("Testing123!", stored.password));
        assert.equal((await register("first@example.test")).status, 409);
        assert.equal((await register("reserved@example.test")).status, 403);
        assert.equal((await request("/auth/login", "POST", { login: "first@example.test", password: "wrong" })).status, 401);
        const admin = await User.create({ name: "Admin", email: "admin@example.test", role: "admin", password: await bcrypt.hash("Testing123!", 10) }); adminToken = createAuthResult(admin).token;
    });
    await t.test("admin endpoints reject anonymous and regular users", async () => {
        assert.equal((await request("/admin/users")).status, 401);
        assert.equal((await request("/admin/users", "GET", null, first.token)).status, 403);
        const users = await request("/admin/users", "GET", null, adminToken); assert.equal(users.status, 200); assert.equal(users.data.total, 3); assert.ok(users.data.items.every(user => !user.password && !user.googleId));
        assert.equal((await request("/admin/products/bad-id", "DELETE", null, adminToken)).status, 400);
    });
    await t.test("dynamic catalog and admin product create/edit", async () => {
        assert.deepEqual((await request("/products")).data, []);
        const result = await request("/admin/products", "POST", { type: "car", title: "Toyota Camry", price: 9000000, vehicleType: "passenger", brand: "Toyota", model: "Camry", year: 2020, mileage: 30000, fuel: "hybrid", steering: "left", region: "Երևան", phone: "+37499123456", images: ["https://example.com/car.jpg"] }, adminToken);
        assert.equal(result.status, 201); product = result.data;
        assert.equal((await request(`/admin/products/${product._id}`, "PATCH", { price: 8000000 }, adminToken)).status, 200);
        assert.equal((await request(`/products/${product._id}`)).data.price, 8000000);
        assert.equal((await request(`/admin/products/${product._id}`, "PATCH", { price: -1 }, adminToken)).status, 400);
    });
    await t.test("favorites persist per account and toggles are idempotent", async () => {
        for (let i = 0; i < 2; i++) assert.equal((await request(`/favorites/${product._id}`, "PUT", {}, first.token)).status, 204);
        assert.equal((await request("/favorites", "GET", null, first.token)).data.ids.length, 1);
        assert.equal((await request("/favorites", "GET", null, second.token)).data.ids.length, 0);
        assert.equal((await request("/favorites/not-valid", "PUT", {}, first.token)).status, 400);
    });
    await t.test("orders snapshot server price; only confirmed purchases contribute to sales", async () => {
        const result = await request("/orders", "POST", { productId: product._id, amount: 1 }, first.token); assert.equal(result.status, 201); order = result.data; assert.equal(order.amount, 8000000);
        assert.equal((await request("/orders", "POST", { productId: product._id }, first.token)).data._id, order._id);
        const competitor = (await request("/orders", "POST", { productId: product._id }, second.token)).data;
        assert.equal((await request(`/orders/${order._id}/cancel`, "PATCH", {}, second.token)).status, 409);
        assert.equal((await request("/admin/dashboard", "GET", null, adminToken)).data.revenue, 0);
        assert.equal((await request(`/admin/orders/${order._id}`, "PATCH", { status: "completed" }, first.token)).status, 403);
        assert.equal((await request(`/admin/orders/${order._id}`, "PATCH", { status: "completed" }, adminToken)).status, 200);
        assert.equal((await Order.findById(competitor._id)).status, "cancelled");
        assert.equal((await request(`/admin/orders/${order._id}`, "PATCH", { status: "completed" }, adminToken)).status, 409);
        assert.equal((await request("/orders", "POST", { productId: product._id }, second.token)).status, 404);
        for (const period of ["day", "week", "month"]) { const data = (await request(`/admin/dashboard?period=${period}`, "GET", null, adminToken)).data; assert.equal(data.revenue, 8000000); assert.equal(data.completedOrders, 1); assert.equal(data.sales[0].orders, 1); }
        assert.deepEqual((await request("/products")).data, []);
    });
    await t.test("ban rejects existing sessions; unban requires fresh login; admin protected", async () => {
        assert.equal((await request(`/admin/users/${first.user.id}`, "PATCH", { banned: true }, adminToken)).status, 200);
        assert.equal((await request("/auth/me", "GET", null, first.token)).status, 403);
        assert.equal((await request("/auth/login", "POST", { login: first.user.email, password: "Testing123!" })).status, 403);
        const adminId = (await request("/auth/me", "GET", null, adminToken)).data.id;
        assert.equal((await request(`/admin/users/${adminId}`, "DELETE", null, adminToken)).status, 403);
    });
    let campaign;
    await t.test("broadcast preview escapes HTML and queue snapshots eligible recipients once", async () => {
        const preview = await request("/admin/broadcasts/preview", "POST", { subject: "<script>test</script>", text: "hello\n<img src=x onerror=alert(1)>" }, adminToken);
        assert.equal(preview.status, 200); assert.ok(preview.data.html.includes("&lt;script&gt;")); assert.ok(!preview.data.html.includes("<img src=x"));
        campaign = (await request("/admin/broadcasts", "POST", { subject: "News", text: "Մեր նորությունները" }, adminToken)).data;
        assert.equal((await request(`/admin/broadcasts/${campaign._id}/send`, "POST", {}, adminToken)).status, 400);
        const queued = await request(`/admin/broadcasts/${campaign._id}/send`, "POST", { confirm: true }, adminToken); assert.equal(queued.status, 202); assert.equal(queued.data.total, 2);
        assert.equal((await request(`/admin/broadcasts/${campaign._id}/send`, "POST", { confirm: true }, adminToken)).status, 409);
        const recipients = [];
        while (await processBroadcastDelivery(async delivery => { recipients.push(delivery.email); })) { /* Isolated transport, no external email. */ }
        assert.equal(new Set(recipients).size, 2); assert.ok(!recipients.includes(first.user.email)); assert.equal((await Broadcast.findById(campaign._id)).status, "completed");
        const email = await sendBroadcastEmail({ _id: "test", email: "recipient@example.test" }, campaign); const parsed = JSON.parse(email.message); assert.equal(parsed.to.length, 1); assert.ok(parsed.html.includes("ArmMotors"));
    });
    await t.test("broadcast timeout is uncertain and never automatically retried; cancellation skips queue", async () => {
        const make = async () => { const result = await request("/admin/broadcasts", "POST", { subject: "More", text: "Hello" }, adminToken); await request(`/admin/broadcasts/${result.data._id}/send`, "POST", { confirm: true }, adminToken); return result.data; };
        const failed = await make(); let attempts = 0;
        while (await processBroadcastDelivery(async () => { attempts++; const error = new Error("timeout"); error.code = "ETIMEDOUT"; throw error; })) {}
        assert.equal(attempts, 2); assert.equal(await BroadcastDelivery.countDocuments({ broadcast: failed._id, status: "uncertain" }), 2);
        const cancelled = await make(); assert.equal((await request(`/admin/broadcasts/${cancelled._id}/cancel`, "POST", {}, adminToken)).status, 200); assert.equal(await BroadcastDelivery.countDocuments({ broadcast: cancelled._id, status: "pending" }), 0);
    });
    await t.test("unban, logout revocation, Google configuration and account deletion", async () => {
        await request(`/admin/users/${first.user.id}`, "PATCH", { banned: false }, adminToken);
        assert.equal((await request("/auth/me", "GET", null, first.token)).status, 401);
        const fresh = (await request("/auth/login", "POST", { login: first.user.email, password: "Testing123!" })).data;
        assert.equal((await request("/auth/logout", "POST", {}, fresh.token)).status, 204);
        assert.equal((await request("/auth/me", "GET", null, fresh.token)).status, 401);
        assert.equal((await request("/auth/google", "POST", { credential: "bad" })).status, 503);
        process.env.GOOGLE_CLIENT_ID = "test-client-id";
        assert.equal((await request("/auth/google", "POST", { credential: 123 })).status, 400);
        assert.equal((await request("/auth/google", "POST", { credential: "bad" })).status, 401);
        assert.equal((await request(`/admin/products/${product._id}`, "DELETE", null, adminToken)).status, 204);
        assert.equal((await User.findById(first.user.id)).favorites.length, 0);
        assert.equal((await request(`/admin/users/${second.user.id}`, "DELETE", null, adminToken)).status, 204);
        assert.equal((await request("/auth/me", "GET", null, second.token)).status, 401);
        assert.equal((await request("/admin/dashboard", "GET", null, adminToken)).data.revenue, 8000000);
        assert.ok((await request("/admin/audit", "GET", null, adminToken)).data.total > 0);
    });
});


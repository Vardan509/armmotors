import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import { createApp } from "../app.js";

test(
    "health and API show a clear 503 when MongoDB is unavailable",
    async (t) => {
        assert.notEqual(
            mongoose.connection.readyState,
            1
        );

        const server = createApp().listen(
            0,
            "127.0.0.1"
        );

        await new Promise((resolve) => {
            server.once("listening", resolve);
        });

        t.after(
            () =>
                new Promise((resolve) => {
                    server.close(resolve);
                })
        );

        const base =
            `http://127.0.0.1:${server.address().port}`;

        const health = await fetch(
            `${base}/api/health`
        );

        assert.equal(health.status, 503);

        const healthData = await health.json();

        assert.equal(
            healthData.database,
            "disconnected"
        );

        const products = await fetch(
            `${base}/api/products`
        );

        assert.equal(products.status, 503);

        const productsData = await products.json();

        assert.equal(
            productsData.code,
            "DATABASE_UNAVAILABLE"
        );
    }
);
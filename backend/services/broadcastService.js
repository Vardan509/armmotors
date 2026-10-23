import User from "../models/user.js";

import { Broadcast, BroadcastDelivery } from "../models/broadcast.js";

import { mailConfigured, sendBroadcastEmail } from "./emailService.js";

import { httpError } from "../utils/http.js";

export async function queueBroadcast(id) {
    const broadcast = await Broadcast.findOneAndUpdate(
        {
            _id: id,
            status: "draft",
        },
        {
            $set: {
                status: "preparing",
                startedAt: new Date(),
            },
        },
        {
            returnDocument: "after",
        },
    );

    if (!broadcast) {
        throw httpError(409, "Նամակն արդեն ուղարկման մեջ է կամ փակված է։");
    }

    try {
        const cursor = User.find({
            banned: { $ne: true },
        })
            .select("_id email")
            .cursor();

        let batch = [];

        for await (const user of cursor) {
            batch.push({
                broadcast: broadcast._id,
                user: user._id,
                email: user.email,
                readAt: null,
            });

            if (batch.length >= 200) {
                await BroadcastDelivery.insertMany(batch, {
                    ordered: false,
                });

                batch = [];
            }
        }

        if (batch.length > 0) {
            await BroadcastDelivery.insertMany(batch, {
                ordered: false,
            });
        }

        const total = await BroadcastDelivery.countDocuments({
            broadcast: broadcast._id,
        });

        broadcast.total = total;

        // Առանց SMTP-ի ներքին նամակները նույնպես հասանելի են։
        broadcast.status =
            total > 0 && mailConfigured() ? "queued" : "completed";

        await broadcast.save();

        return broadcast;
    } catch (error) {
        await BroadcastDelivery.deleteMany({
            broadcast: broadcast._id,
            status: "pending",
        });

        await Broadcast.updateOne(
            {
                _id: broadcast._id,
                status: "preparing",
            },
            {
                $set: {
                    status: "draft",
                },
            },
        );

        throw error;
    }
}

export async function processBroadcastDelivery(send = sendBroadcastEmail) {
    if (!mailConfigured()) {
        return false;
    }

    await BroadcastDelivery.updateMany(
        {
            status: "sending",
            updatedAt: {
                $lt: new Date(Date.now() - 5 * 60000),
            },
        },
        {
            $set: {
                status: "uncertain",
                error: "INTERRUPTED",
            },
        },
    );

    const broadcasts = await Broadcast.find({
        status: "queued",
    })
        .select("_id subject text")
        .limit(50);

    for (const broadcast of broadcasts) {
        const delivery = await BroadcastDelivery.findOneAndUpdate(
            {
                broadcast: broadcast._id,
                status: "pending",
            },
            {
                $set: {
                    status: "sending",
                },
            },
            {
                returnDocument: "after",
            },
        );

        if (!delivery) {
            const remaining = await BroadcastDelivery.exists({
                broadcast: broadcast._id,
                status: {
                    $in: ["pending", "sending"],
                },
            });

            if (!remaining) {
                await Broadcast.updateOne(
                    {
                        _id: broadcast._id,
                        status: "queued",
                    },
                    {
                        $set: {
                            status: "completed",
                        },
                    },
                );
            }

            continue;
        }

        const active = await User.exists({
            _id: delivery.user,
            email: delivery.email,
            banned: { $ne: true },
        });

        const queued = await Broadcast.exists({
            _id: broadcast._id,
            status: "queued",
        });

        if (!active || !queued) {
            delivery.status = "skipped";
            await delivery.save();

            return true;
        }

        try {
            await send(delivery, broadcast);

            delivery.status = "sent";
            delivery.sentAt = new Date();
            delivery.error = "";
        } catch (error) {
            delivery.status = ["ETIMEDOUT", "ESOCKET", "ECONNRESET"].includes(
                error.code,
            )
                ? "uncertain"
                : "failed";

            delivery.error = String(error.code || "SEND_FAILED").slice(0, 100);
        }

        await delivery.save();

        return true;
    }

    return false;
}

export function startBroadcastWorker() {
    let running = false;

    const timer = setInterval(
        async () => {
            if (running) return;

            running = true;

            try {
                const interrupted = await Broadcast.find({
                    status: "preparing",
                    updatedAt: {
                        $lt: new Date(Date.now() - 10 * 60000),
                    },
                }).select("_id");

                for (const row of interrupted) {
                    await BroadcastDelivery.deleteMany({
                        broadcast: row._id,
                        status: "pending",
                    });

                    await Broadcast.updateOne(
                        {
                            _id: row._id,
                            status: "preparing",
                        },
                        {
                            $set: {
                                status: "draft",
                            },
                        },
                    );
                }

                await processBroadcastDelivery();
            } catch (error) {
                console.error("Broadcast worker failed:", error.message);
            } finally {
                running = false;
            }
        },
        Math.max(1000, Number(process.env.BROADCAST_INTERVAL_MS) || 3000),
    );

    timer.unref();

    return () => clearInterval(timer);
}

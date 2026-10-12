import express from "express";
import Conversation from "../models/conversation.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
    try {
        const userId = String(req.userId);

        const conversations = await Conversation.find({
            $or: [{ buyer: req.userId }, { seller: req.userId }],
        })
            .select("product buyer seller messages lastMessageAt")
            .sort({ lastMessageAt: -1 })
            .limit(50)
            .lean();

        const notifications = conversations
            .map((conversation) => {
                const unread = (conversation.messages || []).filter(
                    (message) => {
                        const isMine = String(message.sender) === userId;

                        const alreadyRead = (message.readBy || []).some(
                            (id) => String(id) === userId,
                        );

                        return !isMine && !alreadyRead;
                    },
                );

                if (!unread.length) return null;

                const latest = unread.at(-1);

                return {
                    id: String(conversation._id),
                    type: "message",
                    title: "Նոր հաղորդագրություն",
                    description: latest.text.slice(0, 100),
                    unreadCount: unread.length,
                    createdAt: latest.createdAt,
                    conversationId: String(conversation._id),
                };
            })
            .filter(Boolean);

        const unreadCount = notifications.reduce(
            (sum, item) => sum + item.unreadCount,
            0,
        );

        res.json({
            unreadCount,
            items: notifications,
        });
    } catch (error) {
        next(error);
    }
});

export default router;

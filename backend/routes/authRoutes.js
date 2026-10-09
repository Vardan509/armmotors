import express from "express";

import { controllerLogin, controllerRegistration } from "../controllers/authControllers.js";
import requireAuth from "../middleware/requireAuth.js";
import { googleLogin, linkGoogle } from "../services/googleAuth.js";
import { createAuthResult } from "../services/authServices.js";
import User from "../models/user.js";



const router = express.Router();

router.post("/login", controllerLogin);

router.post("/reg", controllerRegistration);  //new
router.get("/config", (req, res) => res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || "" }));
router.post("/google", async (req, res, next) => { try { res.json(await googleLogin(req.body?.credential)); } catch (error) { next(error); } });
router.post("/google/link", requireAuth, async (req, res, next) => { try { res.json(await linkGoogle(req.userId, req.body?.credential)); } catch (error) { next(error); } });
router.get("/me", requireAuth, async (req, res, next) => { try { const user = await User.findById(req.userId); res.json(createAuthResult(user).user); } catch (error) { next(error); } });
router.post("/logout", requireAuth, async (req, res, next) => { try { await User.updateOne({ _id: req.userId }, { $inc: { tokenVersion: 1 } }); res.status(204).end(); } catch (error) { next(error); } });


export default router;

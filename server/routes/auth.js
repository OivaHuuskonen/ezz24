import express from "express";

const router = express.Router();

// middlewares
import { requireSignin, isAdmin } from "../middlewares/auth.js";
// controllers
import { register, 
         login, 
         secret, 
         updateProfile, 
         getOrders, 
         allOrders,
         deleteOrder 
        } from "../controllers/auth.js";

router.post("/register", register);
router.post("/login", login);
router.get("/auth-check", requireSignin, (req, res) => {
  res.json({ ok: true });
});
router.get("/admin-check", requireSignin, isAdmin, (req, res) => {
  res.json({ ok: true });
});

router.put("/profile", requireSignin, updateProfile);

// testing
router.get("/secret", requireSignin, isAdmin, secret);

//varmistaa että pyyntöm vastataan admin-oikeuksilla
router.get("/test-admin-access", requireSignin, isAdmin, (req, res) => {
  console.log("Admin accessed the route");
  res.json({ message: "Admin access granted" });
});

// orders
router.get("/orders", requireSignin, getOrders);
router.get("/all-orders", requireSignin, isAdmin, allOrders);
router.delete("/order/:orderId", requireSignin, isAdmin, deleteOrder);

export default router;

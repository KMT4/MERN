import express from "express";
import { protect, AuthRequest } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/protected", protect, (req: AuthRequest, res) => {

  res.json({
    message: "Protected route accessed",
    userId: req.userId
  });

});

export default router;
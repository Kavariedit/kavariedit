import { Router, type IRouter, type Request, type Response } from "express";
import { CalculateProfitBody, CalculateProfitResponse } from "@workspace/api-zod";

const router: IRouter = Router();

type Platform = "etsy" | "gumroad" | "shopify" | "stanstore";

function calculateForPlatform(
  price: number,
  quantity: number,
  platform: Platform,
) {
  const gross = price * quantity;

  switch (platform) {
    case "etsy": {
      const transactionFee = gross * 0.065;
      const listingFee = 0.2;
      const paymentProcessing = gross * 0.03;
      const totalFees = transactionFee + listingFee + paymentProcessing;
      const net = gross - totalFees;
      const unitsToHit1000 = Math.ceil(1000 / (price - (price * 0.065 + price * 0.03 + 0.2)));
      return {
        platform: "etsy",
        grossRevenue: gross,
        fees: totalFees,
        netProfit: net,
        unitsToHit1000,
        feeBreakdown: [
          { name: "Transaction fee (6.5%)", amount: transactionFee },
          { name: "Listing fee", amount: listingFee },
          { name: "Payment processing (3%)", amount: paymentProcessing },
        ],
      };
    }
    case "gumroad": {
      const fee = gross * 0.1;
      const net = gross - fee;
      const unitsToHit1000 = Math.ceil(1000 / (price * 0.9));
      return {
        platform: "gumroad",
        grossRevenue: gross,
        fees: fee,
        netProfit: net,
        unitsToHit1000,
        feeBreakdown: [{ name: "Platform fee (10%)", amount: fee }],
      };
    }
    case "shopify": {
      const monthlyFee = 29;
      const transactionFee = gross * 0.029 + 0.3 * quantity;
      const totalFees = monthlyFee + transactionFee;
      const net = gross - totalFees;
      const perUnitNet = price * 0.971 - 0.3;
      const unitsToHit1000 = Math.ceil((1000 + monthlyFee) / perUnitNet);
      return {
        platform: "shopify",
        grossRevenue: gross,
        fees: totalFees,
        netProfit: net,
        unitsToHit1000,
        feeBreakdown: [
          { name: "Monthly plan ($29/mo)", amount: monthlyFee },
          { name: "Transaction fee (2.9% + $0.30)", amount: transactionFee },
        ],
      };
    }
    case "stanstore": {
      const fee = gross * 0.05;
      const net = gross - fee;
      const unitsToHit1000 = Math.ceil(1000 / (price * 0.95));
      return {
        platform: "stanstore",
        grossRevenue: gross,
        fees: fee,
        netProfit: net,
        unitsToHit1000,
        feeBreakdown: [{ name: "Creator tier fee (5%)", amount: fee }],
      };
    }
  }
}

router.post("/calculator/calculate", (req: Request, res: Response) => {
  const parsed = CalculateProfitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { price, quantityPerMonth, platforms } = parsed.data;

  const results = platforms.map((p) =>
    calculateForPlatform(price, quantityPerMonth, p as Platform),
  );

  res.json(CalculateProfitResponse.parse({ results }));
});

export default router;

import { Instrument_Serif, Nothing_You_Could_Do } from "next/font/google";

export const deskSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const deskHand = Nothing_You_Could_Do({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

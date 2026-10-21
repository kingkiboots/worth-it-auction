import { Database } from "@/shared/db/database.types";

export type AuctionItem = Pick<
  Database["public"]["Tables"]["auction_items"]["Row"],
  "id" | "title" | "current_price" | "winner_id" | "rank_color" | "description"
>;

// 랭킹 행에 보여줄 낙찰자 프로필
export type WinnerProfile = Pick<
  Database["public"]["Tables"]["users"]["Row"],
  "nickname" | "profile_image"
>;

// winner_id → 낙찰자 프로필
export type WinnerProfiles = Record<string, WinnerProfile>;

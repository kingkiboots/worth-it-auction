import { Database } from "@/shared/db/database.types";

export type AuctionItem = Pick<
  Database["public"]["Tables"]["auction_items"]["Row"],
  "id" | "title" | "current_price" | "winner_id" | "rank_color" | "description"
>;

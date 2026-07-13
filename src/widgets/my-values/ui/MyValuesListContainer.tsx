import { createServerSideClient } from "@/shared/db/server";
import { RealtimeMyValuesList } from "./RealtimeMyValuesList";

interface Props {
  userId: string;
}

export async function MyValuesListContainer({ userId }: Props) {
  const supabase = await createServerSideClient();

  const { data: myItems } = await supabase
    .from("auction_items")
    .select("*")
    .eq("winner_id", userId)
    .order("updated_at", { ascending: false });

  return <RealtimeMyValuesList initialItems={myItems ?? []} userId={userId} />;
}

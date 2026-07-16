import { useLocalSearchParams } from "expo-router";

import { InviteScreen } from "@/components/invite-screen";

export default function InviteQueryScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  return <InviteScreen token={token} />;
}

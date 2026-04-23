import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "User settings and configuration",
};

export const dynamic = "force-dynamic";

import { getConnectedAccounts } from "@/lib/actions/settings";
import { SettingsPageClient } from "@/components/settings/settings-page-client";

export default async function SettingsPage() {
  const connectedAccounts = await getConnectedAccounts();

  return <SettingsPageClient connectedAccounts={connectedAccounts} />;
}


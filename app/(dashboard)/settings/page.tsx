import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "User settings and configuration",
};

import { getConnectedAccounts } from "@/lib/actions/settings";
import { IntegrationsCard } from "@/components/widgets/settings/integrations-card";
import { MediaTagsGenresManager } from "@/components/widgets/settings/media-tags-genres-manager";
import { CalendarColorsManager } from "@/components/widgets/settings/calendar-colors-manager";

export default async function SettingsPage() {
  const connectedAccounts = await getConnectedAccounts();

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <CalendarColorsManager />

        <MediaTagsGenresManager />

        <IntegrationsCard connectedAccounts={connectedAccounts} />
      </div>
    </div>
  );
}

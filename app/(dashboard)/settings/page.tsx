import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "User settings and configuration",
};

import { getConnectedAccounts } from "@/lib/actions/settings";
import { IntegrationsCard } from "@/components/widgets/settings/integrations-card";

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
        
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">
            Settings will be available here soon. You will be able to configure integrations and site colors.
          </p>
        </div>

        <IntegrationsCard connectedAccounts={connectedAccounts} />
      </div>
    </div>
  );
}

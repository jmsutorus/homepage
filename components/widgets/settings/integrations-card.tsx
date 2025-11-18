"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github } from "lucide-react";
import { signIn } from "next-auth/react";
import type { ConnectedAccount } from "@/lib/actions/settings";

interface IntegrationsCardProps {
  connectedAccounts: ConnectedAccount[];
}

export function IntegrationsCard({ connectedAccounts }: IntegrationsCardProps) {
  const isGithubConnected = connectedAccounts.some(
    (account) => account.providerId === "github"
  );

  const handleConnectGithub = () => {
    signIn("github");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>
          Manage your connected accounts and services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* GitHub Integration */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              <Github className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium">GitHub</h3>
              <p className="text-sm text-muted-foreground">
                Connect to sync your coding activity.
              </p>
            </div>
          </div>
          <div>
            {isGithubConnected ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                Connected
              </Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={handleConnectGithub}>
                Connect
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

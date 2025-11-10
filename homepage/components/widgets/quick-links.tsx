import fs from "fs";
import path from "path";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";

interface Link {
  title: string;
  url: string;
  icon: string;
}

interface LinkCategory {
  name: string;
  links: Link[];
}

interface LinksConfig {
  categories: LinkCategory[];
}

function getLinksConfig(): LinksConfig {
  const filePath = path.join(process.cwd(), "config", "links.json");
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents);
}

function getIcon(iconName: string) {
  // Convert icon name from kebab-case to PascalCase
  const pascalCase = iconName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  // Get the icon component from lucide-react
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
    pascalCase
  ];

  return IconComponent || LucideIcons.Link;
}

export function QuickLinks() {
  const config = getLinksConfig();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {config.categories.map((category) => (
        <Card key={category.name}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">{category.name}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {category.links.map((link) => {
              const Icon = getIcon(link.icon);
              return (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{link.title}</span>
                </a>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

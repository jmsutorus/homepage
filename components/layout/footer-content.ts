export interface FooterLink {
  label: string;
  href: string;
  icon?: string;
  isHighlight?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterContent {
  brand: {
    name: string;
    description: string;
    copyright: string;
  };
  sections: FooterSection[];
}

export const footerContent: FooterContent = {
  brand: {
    name: "Life Curation",
    description: "Curating a life of intention, grounded in the tactile and the thoughtful. A digital space designed for the Earthbound.",
    copyright: "© 2024 Life Curation Editorial. Designed for the Earthbound.",
  },
  sections: [
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Editorial Guidelines", href: "#" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "GitHub", href: "https://github.com/jmsutorus/homepage", icon: "code" },
        { label: "Discord", href: "#", icon: "forum" },
        { label: "Instagram", href: "https://www.instagram.com/josephsutorus/", icon: "photo_camera" },
        { label: "About", href: "/about" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Buy Me A Coffee", href: "https://buymeacoffee.com/homepage_sutorus", icon: "local_cafe", isHighlight: true },
        { label: "Support", href: "#" },
      ],
    },
  ],
};

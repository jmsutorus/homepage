import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { HomePageButton } from "../Buttons/HomePageButton";

interface HomepageFooterProps {
  title: string;
  description: string;
  icon: ReactNode;
  buttonText: string;
  onButtonClick?: () => void;
  className?: string;
}

export function HomepageFooter({
  title,
  description,
  icon,
  buttonText,
  onButtonClick,
  className
}: HomepageFooterProps) {
  return (
    <section className={cn(
      "p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 border shadow-sm transition-all duration-300",
      "bg-white border-stone-200/50",
      "dark:bg-[#1b251e] dark:border-white/5",
      className
    )}>
      <div className="flex items-center gap-6">
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-colors",
          "bg-burnt-terracotta shadow-burnt-terracotta/20",
          "dark:bg-white/10 dark:shadow-none dark:text-white"
        )}>
          {icon}
        </div>
        <div>
          <h3 className={cn(
            "text-xl font-black tracking-tight transition-colors text-evergreen-dark",
            "dark:text-white"
          )}>
            {title}
          </h3>
          <p className={cn(
            "text-sm font-semibold transition-colors text-soft-earth",
            "dark:text-white/60"
          )}>
            {description}
          </p>
        </div>
      </div>
      <HomePageButton 
        onClick={onButtonClick}
        className="font-bold transition-all shadow-xl shadow-evergreen/10 dark:shadow-none"
      >
        {buttonText}
      </HomePageButton>
    </section>
  );
}

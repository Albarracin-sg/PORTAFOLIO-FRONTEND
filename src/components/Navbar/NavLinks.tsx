import { Link } from "react-router-dom";

interface NavItem {
  key: string;
  label: string;
  isRoute?: boolean;
}

interface NavLinksProps {
  items: NavItem[];
  currentPage: string;
}

export function NavLinks({ items, currentPage }: NavLinksProps) {
  return (
    <div className="hidden md:block">
      <div className="ml-10 flex items-baseline gap-x-8">
        {items.map((item) => (
          <Link
            key={item.key}
            to={item.isRoute ? `/${item.key}` : item.key === "stats" ? "/stats" : `/#${item.key}`}
            className={`relative cursor-pointer px-3 py-2 text-sm transition-colors after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-[calc(100%-1.5rem)] after:-translate-x-1/2 after:rounded-full after:bg-violet-500 after:transition-transform after:duration-300 ${
              currentPage === item.key || (currentPage === 'home' && item.key === 'home')
                ? "text-primary after:scale-x-100"
                : "text-muted-foreground after:scale-x-0 hover:text-primary hover:after:scale-x-100"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

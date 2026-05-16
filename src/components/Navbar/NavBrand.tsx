import { Link } from "react-router-dom";

interface NavBrandProps {
  logo: string;
  onClick: () => void;
  className?: string;
}

export function NavBrand({ logo, onClick, className = "h-14 w-auto" }: NavBrandProps) {
  return (
    <div className="flex-shrink-0">
      <Link
        to="/"
        onClick={onClick}
        className="cursor-pointer bg-transparent border-none p-0 block"
      >
        <img src={logo} alt="Juan Albarracín" className={className} />
      </Link>
    </div>
  );
}

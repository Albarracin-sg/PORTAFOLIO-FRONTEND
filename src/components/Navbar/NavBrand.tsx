import { Link } from "react-router-dom";

interface NavBrandProps {
  logo: string;
  onClick: () => void;
}

export function NavBrand({ logo, onClick }: NavBrandProps) {
  return (
    <div className="flex-shrink-0">
      <Link
        to="/"
        onClick={onClick}
        className="cursor-pointer bg-transparent border-none p-0 block"
      >
        <img src={logo} alt="Juan Albarracín" className="h-12 w-auto" />
      </Link>
    </div>
  );
}

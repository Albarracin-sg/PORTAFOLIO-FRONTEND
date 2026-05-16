import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Grid3X3, List } from "lucide-react";

interface ProjectFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedTech: string;
  onTechChange: (value: string) => void;
  sortBy: string;
  sortOrder: string;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  categories: { value: string; label: string }[];
  technologies: { value: string; label: string }[];
  projectCountLabel: string;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function ProjectFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTech,
  onTechChange,
  sortBy,
  sortOrder,
  onSortChange,
  categories,
  technologies,
  projectCountLabel,
  viewMode,
  onViewModeChange,
}: ProjectFiltersProps) {
  const { t } = useTranslation();

  return (
    <Card className="mb-8 border-zinc-200 bg-white/85 dark:border-white/[0.07] dark:bg-white/[0.025]">
      <CardContent className="p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t("projects.filters.searchLabel")}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <Input
                placeholder={t("projects.filters.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-10 rounded-lg border-zinc-200 bg-zinc-50/80 pl-10 focus-visible:ring-violet-500/50 dark:border-zinc-600 dark:bg-zinc-800/50"
              />
            </div>
          </div>

          <FilterSelect
            label={t("projects.filters.category")}
            value={selectedCategory}
            onChange={onCategoryChange}
            options={categories}
          />

          <FilterSelect
            label={t("projects.filters.technology")}
            value={selectedTech}
            onChange={onTechChange}
            options={technologies}
          />

          <FilterSelect
            label={t("projects.filters.sortBy")}
            value={`${sortBy}-${sortOrder}`}
            onChange={(value) => {
              const [newSortBy, newSortOrder] = value.split("-");
              onSortChange(newSortBy, newSortOrder);
            }}
            options={[
              { value: "date-desc", label: t("projects.sortOptions.dateDesc") },
              { value: "date-asc", label: t("projects.sortOptions.dateAsc") },
              { value: "stars-desc", label: t("projects.sortOptions.starsDesc") },
              { value: "stars-asc", label: t("projects.sortOptions.starsAsc") },
              { value: "views-desc", label: t("projects.sortOptions.viewsDesc") },
              { value: "name-asc", label: t("projects.sortOptions.nameAsc") },
              { value: "name-desc", label: t("projects.sortOptions.nameDesc") },
            ]}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-5 dark:border-white/[0.07]">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{projectCountLabel}</p>
          <div className="hidden sm:flex items-center gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800/60">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="h-8 rounded-md"
              title={t("projects.filters.viewGrid")}
            >
              <Grid3X3 className="size-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="h-8 rounded-md"
              title={t("projects.filters.viewList")}
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10 rounded-lg border-zinc-200 bg-zinc-50/80 dark:border-zinc-600 dark:bg-zinc-800/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

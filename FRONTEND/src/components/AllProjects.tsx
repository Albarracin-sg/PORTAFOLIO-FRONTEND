import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import ProjectModal from "./ProjectModal";
import { allProjectsList } from "@/features/projects/data";
import {
  Search,
  Calendar,
  Code,
  ExternalLink,
  Github,
  Star,
  GitFork,
  Eye,
  ArrowLeft,
  Grid3X3,
  List
} from "lucide-react";

interface AllProjectsProps {
  translations: any;
}

export default function AllProjects({ translations }: AllProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTech, setSelectedTech] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const allProjects = allProjectsList;

  const categories = [
    { value: "all", label: translations.projects.allProjects },
    { value: "fullstack", label: "Full Stack" },
    { value: "web", label: "Web App" },
    { value: "devops", label: "DevOps" },
    { value: "ml", label: "Machine Learning" },
    { value: "blockchain", label: "Blockchain" },
    { value: "data", label: "Data Engineering" }
  ];

  const technologies = useMemo(() => {
    const allTechs = allProjects.flatMap(project => project.technologies);
    const uniqueTechs = [...new Set(allTechs)].sort();
    return [
      { value: "all", label: "All Technologies" },
      ...uniqueTechs.map(tech => ({ value: tech, label: tech }))
    ];
  }, []);

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = allProjects.filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
      const matchesTech = selectedTech === "all" || project.technologies.includes(selectedTech);
      
      return matchesSearch && matchesCategory && matchesTech;
    });

    // Sort projects
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "date":
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case "stars":
          aValue = a.stars;
          bValue = b.stars;
          break;
        case "name":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "views":
          aValue = a.views;
          bValue = b.views;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, selectedTech, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "production": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "development": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "prototype": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const ProjectCard = ({ project, isListView = false }: { project: any, isListView?: boolean }) => (
    <Card className={`group border-gray-200 dark:border-gray-700 hover:border-violet-500/50 dark:hover:border-violet-400/50 transition-all duration-300 ${isListView ? 'flex-row overflow-hidden' : ''} hover:shadow-2xl hover:shadow-violet-500/20`}>
      <div className={`${isListView ? 'w-48 shrink-0' : ''} relative overflow-hidden ${isListView ? '' : 'aspect-video'}`}>
        <img 
          src={project.image} 
          alt={project.title}
          className={`${isListView ? 'w-full h-full' : 'w-full h-full'} object-cover transition-transform duration-300 group-hover:scale-105`}
        />
        {project.featured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-violet-600 dark:bg-violet-500 text-white">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featured
            </Badge>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
      </div>
      
      <div className={`${isListView ? 'flex-1' : ''} p-6`}>
        <CardHeader className="p-0 mb-4">
          <CardTitle className="mb-2 text-gray-900 dark:text-gray-100">{project.title}</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">{project.description}</p>
        </CardHeader>
        
        <CardContent className="p-0 space-y-4">
          <div className="flex flex-wrap gap-2">
            {project.technologies.slice(0, isListView ? 6 : 4).map((tech: string) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {project.technologies.length > (isListView ? 6 : 4) && (
              <Badge variant="outline" className="text-xs">
                +{project.technologies.length - (isListView ? 6 : 4)}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>{project.stars}</span>
              </div>
              <div className="flex items-center space-x-1">
                <GitFork className="w-4 h-4" />
                <span>{project.forks}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{project.views}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(project.date).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex space-x-2 pt-2">
            <Button
              size="sm"
              onClick={() => setSelectedProject(project)}
              className="flex-1"
            >
              <Code className="w-4 h-4 mr-2" />
              View Details
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(project.github, '_blank')}
            >
              <Github className="w-4 h-4" />
            </Button>
            {project.liveDemo && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(project.liveDemo, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              asChild
              className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
            >
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                {translations.common?.back || 'Back'}
              </Link>
            </Button>
            
            <h1 className="text-4xl mb-4 text-gray-900 dark:text-gray-100">
              All Projects
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Complete portfolio of software engineering projects with detailed technical implementations
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl mb-1 text-gray-900 dark:text-gray-100 font-semibold">{filteredAndSortedProjects.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Projects Found</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects, technologies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedTech} onValueChange={setSelectedTech}>
              <SelectTrigger>
                <SelectValue placeholder="Technology" />
              </SelectTrigger>
              <SelectContent>
                {technologies.map(tech => (
                  <SelectItem key={tech.value} value={tech.value}>
                    {tech.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Latest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="stars-desc">Most Stars</SelectItem>
                <SelectItem value="stars-asc">Least Stars</SelectItem>
                <SelectItem value="views-desc">Most Views</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredAndSortedProjects.length} of {allProjects.length} projects
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredAndSortedProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAndSortedProjects.map(project => (
              <ProjectCard key={project.id} project={project} isListView />
            ))}
          </div>
        )}

        {filteredAndSortedProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-600 dark:text-gray-400 mb-4">
              No projects match your current filters
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedTech("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Project Modal */}
        {selectedProject && (
          <ProjectModal
            project={{
              id: selectedProject.id,
              name: selectedProject.title ?? selectedProject.name,
              description: selectedProject.description,
              technologies: selectedProject.technologies,
              image: selectedProject.image,
              problem: selectedProject.problem ?? '',
              challenge: selectedProject.challenge ?? '',
              solution: selectedProject.solution ?? '',
              githubUrl: selectedProject.github ?? selectedProject.githubUrl ?? '',
              liveUrl: selectedProject.liveDemo ?? selectedProject.liveUrl,
            }}
            isOpen={!!selectedProject}
            onClose={() => setSelectedProject(null)}
            translations={translations}
          />
        )}
      </div>
    </div>
  );
}
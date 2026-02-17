import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Code, GitBranch, Award, Users, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface StatisticsProps {
  translations: any;
}

export default function Statistics({ translations }: StatisticsProps) {
  // Mock data for charts
  const languageData = [
    { name: "JavaScript", value: 35, color: "#f7df1e" },
    { name: "TypeScript", value: 25, color: "#3178c6" },
    { name: "Python", value: 15, color: "#3776ab" },
    { name: "Java", value: 10, color: "#ed8b00" },
    { name: "Other", value: 15, color: "#6b7280" }
  ];

  const projectsData = [
    { month: "Jan", projects: 2 },
    { month: "Feb", projects: 3 },
    { month: "Mar", projects: 1 },
    { month: "Apr", projects: 4 },
    { month: "May", projects: 2 },
    { month: "Jun", projects: 3 }
  ];

  const githubActivity = [
    { day: "Mon", commits: 4 },
    { day: "Tue", commits: 6 },
    { day: "Wed", commits: 8 },
    { day: "Thu", commits: 5 },
    { day: "Fri", commits: 7 },
    { day: "Sat", commits: 3 },
    { day: "Sun", commits: 2 }
  ];

  const stats = [
    {
      title: translations.stats.totalProjects,
      value: "25+",
      icon: Code,
      description: translations.stats.projectsDescription
    },
    {
      title: translations.stats.githubCommits,
      value: "1,240",
      icon: GitBranch,
      description: translations.stats.commitsDescription
    },
    {
      title: translations.stats.openSource,
      value: "8",
      icon: Award,
      description: translations.stats.openSourceDescription
    },
    {
      title: translations.stats.collaborations,
      value: "12",
      icon: Users,
      description: translations.stats.collaborationsDescription
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            asChild
            className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              {translations.common?.back || 'Volver'}
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4 text-gray-900 dark:text-gray-100">{translations.stats.title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {translations.stats.subtitle}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center border-gray-200 dark:border-gray-700 hover:border-violet-500/50 dark:hover:border-violet-400/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center mx-auto mb-2 ring-1 ring-gray-200 dark:ring-gray-600">
                    <Icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <CardTitle className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl mb-1 text-gray-900 dark:text-gray-100 font-semibold">{stat.value}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Languages Chart */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">{translations.stats.languagesUsed}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={languageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {languageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Usage"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {languageData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projects Timeline */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">{translations.stats.projectsTimeline}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="projects" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Activity */}
          <Card className="lg:col-span-2 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">{translations.stats.githubActivity}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={githubActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="commits" 
                      stroke="#7c3aed" 
                      strokeWidth={2}
                      dot={{ fill: "#7c3aed", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="mt-12 text-center">
          <Card className="inline-block border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-2xl mb-1 text-gray-900 dark:text-gray-100 font-semibold">98%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {translations.stats.codeQuality}
                  </div>
                </div>
                <div>
                  <div className="text-2xl mb-1 text-gray-900 dark:text-gray-100 font-semibold">24h</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {translations.stats.avgResponseTime}
                  </div>
                </div>
                <div>
                  <div className="text-2xl mb-1 text-gray-900 dark:text-gray-100 font-semibold">100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {translations.stats.projectSuccess}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
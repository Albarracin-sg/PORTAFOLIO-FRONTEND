import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Code, GitBranch, Award, Users, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { EditableText } from "@/features/admin/InlineEdit";
import { useSectionEditor } from "@/features/admin/hooks/useSectionEditor";

interface StatisticsProps {
  translations: any;
  section?: { id: string; type: string; content: Record<string, unknown> };
}

export default function Statistics({ translations, section }: StatisticsProps) {
  const statsContent = section?.content ?? {};
  const { draft, updateField } = useSectionEditor(section as any);
  const chartData = (statsContent.charts as Record<string, unknown>) ?? {};
  const cards = (draft.cards as Array<Record<string, string>>) ?? (statsContent.cards as Array<Record<string, string>>) ?? [];
  const quality = (draft.quality as Record<string, string>) ?? (statsContent.quality as Record<string, string>) ?? {};

  const languageData = (chartData.languageData as Array<Record<string, unknown>>) ?? [];

  const projectsData = (chartData.projectsData as Array<Record<string, unknown>>) ?? [];

  const githubActivity = (chartData.githubActivity as Array<Record<string, unknown>>) ?? [];

  const stats = cards.length > 0 ? cards : [];

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
              {translations?.common?.back ?? ''}
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4 text-gray-900 dark:text-gray-100">
            <EditableText
              value={String(draft.title ?? statsContent.title ?? '')}
              onSave={(value) => updateField('title', value)}
            />
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            <EditableText
              value={String(draft.subtitle ?? statsContent.subtitle ?? '')}
              onSave={(value) => updateField('subtitle', value)}
              multiline
            />
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = (stat as { icon?: typeof Code }).icon;
            return (
              <Card key={index} className="text-center border-gray-200 dark:border-gray-700 hover:border-violet-500/50 dark:hover:border-violet-400/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center mx-auto mb-2 ring-1 ring-gray-200 dark:ring-gray-600">
                    {Icon ? (
                      <Icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    ) : (
                      <div className="h-6 w-6 rounded bg-violet-200/40" />
                    )}
                  </div>
                  <CardTitle className="text-sm text-gray-500 dark:text-gray-400">
                    <EditableText
                      value={String(stat.title)}
                      onSave={(value) => updateField(`cards.${index}.title`, value)}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl mb-1 text-gray-900 dark:text-gray-100 font-semibold">
                    <EditableText
                      value={String(stat.value)}
                      onSave={(value) => updateField(`cards.${index}.value`, value)}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <EditableText
                      value={String(stat.description)}
                      onSave={(value) => updateField(`cards.${index}.description`, value)}
                      multiline
                    />
                  </p>
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
              <CardTitle className="text-gray-900 dark:text-gray-100">
                <EditableText
                  value={String(draft.languagesUsed ?? statsContent.languagesUsed ?? '')}
                  onSave={(value) => updateField('languagesUsed', value)}
                />
              </CardTitle>
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
              <CardTitle className="text-gray-900 dark:text-gray-100">
                <EditableText
                  value={String(draft.projectsTimeline ?? statsContent.projectsTimeline ?? '')}
                  onSave={(value) => updateField('projectsTimeline', value)}
                />
              </CardTitle>
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
              <CardTitle className="text-gray-900 dark:text-gray-100">
                <EditableText
                  value={String(draft.githubActivity ?? statsContent.githubActivity ?? '')}
                  onSave={(value) => updateField('githubActivity', value)}
                />
              </CardTitle>
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
                  <div className="text-2xl mb-1 text-gray-900 dark:text-gray-100 font-semibold">
                    <EditableText
                      value={String(quality.codeQuality ?? '98%')}
                      onSave={(value) => updateField('quality.codeQuality', value)}
                    />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <EditableText
                      value={String(draft.codeQuality ?? statsContent.codeQuality ?? '')}
                      onSave={(value) => updateField('codeQuality', value)}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-2xl mb-1 text-gray-900 dark:text-gray-100 font-semibold">
                    <EditableText
                      value={String(quality.avgResponseTime ?? '24h')}
                      onSave={(value) => updateField('quality.avgResponseTime', value)}
                    />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <EditableText
                      value={String(draft.avgResponseTime ?? statsContent.avgResponseTime ?? '')}
                      onSave={(value) => updateField('avgResponseTime', value)}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-2xl mb-1 text-gray-900 dark:text-gray-100 font-semibold">
                    <EditableText
                      value={String(quality.projectSuccess ?? '100%')}
                      onSave={(value) => updateField('quality.projectSuccess', value)}
                    />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <EditableText
                      value={String(draft.projectSuccess ?? statsContent.projectSuccess ?? '')}
                      onSave={(value) => updateField('projectSuccess', value)}
                    />
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

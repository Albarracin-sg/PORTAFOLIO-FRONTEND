import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar, MapPin, GraduationCap, Briefcase } from "lucide-react";
import { EditableText, EditableList } from "@/features/admin/InlineEdit";
import { useSectionEditor } from "@/features/admin/hooks/useSectionEditor";

interface AboutProps {
  translations: any;
  section?: { id: string; type: string; content: Record<string, unknown> };
}

export default function About({ translations, section }: AboutProps) {
  const defaultTechnicalSkills: string[] = [];
  const fallbackSoftSkills: string[] = [];
  const fallbackTimeline: Array<Record<string, string>> = [];

  const aboutContent = section?.content ?? {};
  const { draft, updateField } = useSectionEditor(section as any);
  const technicalSkills = (draft.technicalSkills as string[]) ?? (aboutContent.technicalSkills as string[]) ?? defaultTechnicalSkills;
  const softSkills = (draft.softSkills as string[]) ?? (aboutContent.softSkills as string[]) ?? fallbackSoftSkills;
  const timeline = (draft.timeline as Array<Record<string, string>>) ?? (aboutContent.timeline as Array<Record<string, string>>) ?? fallbackTimeline;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl mb-4 text-gray-900 dark:text-gray-100">
            <EditableText
              value={String(draft.title ?? aboutContent.title ?? '')}
              onSave={(value) => updateField('title', value)}
            />
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            <EditableText
              value={String(draft.bio ?? aboutContent.bio ?? '')}
              onSave={(value) => updateField('bio', value)}
              multiline
            />
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Skills Section */}
          <div className="space-y-8">
            {/* Technical Skills */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2 font-semibold text-foreground dark:text-gray-100">
                  <div className="w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400"></div>
                  <EditableText
                    value={String(
                      draft.technicalSkillsTitle ?? aboutContent.technicalSkillsTitle ?? '',
                    )}
                    onSave={(value) => updateField('technicalSkillsTitle', value)}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EditableList
                  value={technicalSkills}
                  onSave={(value) => updateField('technicalSkills', value)}
                  className="mb-3"
                  placeholder="React, Node.js, PostgreSQL"
                  hideWhenView
                />
                <div className="flex flex-wrap gap-2">
                  {technicalSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Soft Skills */}
            <Card className="border-border dark:border-gray-700 bg-card dark:bg-gray-900/50 shadow-sm dark:shadow-none">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2 font-semibold text-foreground dark:text-gray-100">
                  <div className="w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400"></div>
                  <EditableText
                    value={String(
                      draft.softSkillsTitle ?? aboutContent.softSkillsTitle ?? '',
                    )}
                    onSave={(value) => updateField('softSkillsTitle', value)}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EditableList
                  value={softSkills}
                  onSave={(value) => updateField('softSkills', value)}
                  className="mb-3"
                  placeholder="Teamwork, Leadership"
                  hideWhenView
                />
                <div className="grid grid-cols-2 gap-3">
                  {softSkills.map((skill) => (
                    <div key={skill} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-foreground dark:text-gray-300">
                        {skill}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Section */}
          <div>
            <h3 className="font-display text-2xl font-semibold mb-8 text-foreground dark:text-gray-100">
              <EditableText
                value={String(
                  draft.experienceEducation ?? aboutContent.experienceEducation ?? '',
                )}
                onSave={(value) => updateField('experienceEducation', value)}
              />
            </h3>
            <div className="space-y-6">
              {timeline.map((item, index) => (
                <div key={index} className="relative">
                  {/* Timeline line */}
                  {index !== timeline.length - 1 && (
                    <div className="absolute left-6 top-12 w-px h-20 bg-border dark:bg-gray-700"></div>
                  )}

                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="shrink-0 w-12 h-12 bg-violet-100 dark:bg-violet-900/50 rounded-full flex items-center justify-center ring-1 ring-border dark:ring-gray-600">
                      {item.type === "work" ? (
                        <Briefcase className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      ) : (
                        <GraduationCap className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h4 className="font-medium text-foreground dark:text-gray-100">
                        <EditableText
                          value={String(item.title)}
                          onSave={(value) =>
                            updateField(`timeline.${index}.title`, value)
                          }
                        />
                      </h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                           <EditableText
                             value={String(item.period)}
                             onSave={(value) =>
                               updateField(`timeline.${index}.period`, value)
                             }
                           />
                        </div>
                      </div>
                      <div className="text-violet-600 dark:text-violet-400 mb-1 font-medium">
                        <EditableText
                          value={String(item.company)}
                          onSave={(value) =>
                            updateField(`timeline.${index}.company`, value)
                          }
                        />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground dark:text-gray-400 mb-3">
                        <MapPin className="h-3 w-3" />
                        <EditableText
                          value={String(item.location)}
                          onSave={(value) =>
                            updateField(`timeline.${index}.location`, value)
                          }
                        />
                      </div>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        <EditableText
                          value={String(item.description)}
                          onSave={(value) =>
                            updateField(`timeline.${index}.description`, value)
                          }
                          multiline
                        />
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

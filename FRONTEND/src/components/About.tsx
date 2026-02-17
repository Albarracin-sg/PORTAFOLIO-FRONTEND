import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar, MapPin, GraduationCap, Briefcase } from "lucide-react";

interface AboutProps {
  translations: any;
}

export default function About({ translations }: AboutProps) {
  const technicalSkills = [
    "React", "Node.js", "TypeScript", "Nest.js", "PostgreSQL", "MongoDB", 
    "Docker", "AWS", "Git", "GraphQL", "Jest", "Tailwind CSS"
  ];

  const softSkills = [
    translations.about.softSkills.problemSolving,
    translations.about.softSkills.teamwork,
    translations.about.softSkills.communication,
    translations.about.softSkills.adaptability,
    translations.about.softSkills.leadership,
    translations.about.softSkills.creativity
  ];

  const timeline = [
    {
      type: 'work',
      title: translations.about.timeline.work1.title,
      company: translations.about.timeline.work1.company,
      period: "2022 - Present",
      location: "Remote",
      description: translations.about.timeline.work1.description
    },
    {
      type: 'work',
      title: translations.about.timeline.work2.title,
      company: translations.about.timeline.work2.company,
      period: "2021 - 2022",
      location: "Madrid, España",
      description: translations.about.timeline.work2.description
    },
    {
      type: 'education',
      title: translations.about.timeline.education1.title,
      company: translations.about.timeline.education1.institution,
      period: "2018 - 2022",
      location: "Madrid, España",
      description: translations.about.timeline.education1.description
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl mb-4 text-gray-900 dark:text-gray-100">{translations.about.title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {translations.about.bio}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Skills Section */}
          <div className="space-y-8">
            {/* Technical Skills */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <div className="w-2 h-2 bg-gradient-to-r from-violet-600 to-violet-400 rounded-full"></div>
                  {translations.about.technicalSkills}
                </CardTitle>
              </CardHeader>
              <CardContent>
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
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <div className="w-2 h-2 bg-gradient-to-r from-violet-600 to-violet-400 rounded-full"></div>
                  {translations.about.softSkillsTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {softSkills.map((skill) => (
                    <div key={skill} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{skill}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Section */}
          <div>
            <h3 className="text-2xl mb-8 text-gray-900 dark:text-gray-100">{translations.about.experienceEducation}</h3>
            <div className="space-y-6">
              {timeline.map((item, index) => (
                <div key={index} className="relative">
                  {/* Timeline line */}
                  {index !== timeline.length - 1 && (
                    <div className="absolute left-6 top-12 w-px h-20 bg-gray-200 dark:bg-gray-700"></div>
                  )}
                  
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-violet-100 dark:bg-violet-900/50 rounded-full flex items-center justify-center ring-1 ring-gray-200 dark:ring-gray-600">
                      {item.type === 'work' ? (
                        <Briefcase className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      ) : (
                        <GraduationCap className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.title}</h4>
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {item.period}
                        </div>
                      </div>
                      <div className="text-violet-600 dark:text-violet-400 mb-1 font-medium">{item.company}</div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
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
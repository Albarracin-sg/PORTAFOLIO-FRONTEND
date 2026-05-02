import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Briefcase, GraduationCap, MapPin, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AboutProps {
  section?: { id: string; type: string; content: Record<string, unknown> };
}

type SkillGroup = { title: string; items: string[] };
type ExperienceEntry = {
  type?: string;
  title: string;
  company?: string;
  period?: string;
  location?: string;
  description?: string;
  highlights?: string[];
};
type EducationEntry = {
  title: string;
  institution?: string;
  period?: string;
  location?: string;
  description?: string;
};
type AboutDictionary = {
  title: string;
  bio: string;
  technicalSkills: string;
  softSkillsTitle: string;
  professionalExperience: string;
  personalProjects: string;
  education: string;
  technicalSkillGroups: SkillGroup[];
  softSkillsList: string[];
  professionalExperienceItems: ExperienceEntry[];
  personalProjectItems: ExperienceEntry[];
  educationItems: EducationEntry[];
};

export default function About(_props: AboutProps) {
  const { t } = useTranslation();
  const about = t("about", { returnObjects: true }) as AboutDictionary;

  return (
    <section className="px-4 pb-20 pt-14 sm:px-6 sm:pt-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-300/60 bg-violet-50 px-4 py-1 text-sm font-medium text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
            <Sparkles className="h-4 w-4" />
            Backend-first engineer profile
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            {about.title}
          </h2>
          <p className="mt-5 text-balance text-lg leading-8 text-slate-600 dark:text-slate-300">
            {about.bio}
          </p>
        </div>

        <div className="mt-14 grid gap-8 xl:mt-16 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-8 xl:sticky xl:top-24 xl:self-start">
            <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white/90 shadow-[0_20px_80px_-50px_rgba(148,163,184,0.35)] backdrop-blur dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_20px_80px_-40px_rgba(139,92,246,0.45)]">
              <CardContent className="p-7 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{about.technicalSkills}</h3>
                </div>
                <div className="space-y-6">
                  {about.technicalSkillGroups.map((group) => (
                    <div key={group.title} className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-700 dark:text-violet-300/90">
                        {group.title}
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {group.items.map((skill) => (
                          <Badge
                            key={`${group.title}-${skill}`}
                            variant="secondary"
                            className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200 dark:border-white/10 dark:bg-slate-700/60 dark:text-slate-100 dark:hover:bg-slate-700"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-[0_20px_80px_-50px_rgba(148,163,184,0.35)] backdrop-blur dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_20px_80px_-40px_rgba(59,130,246,0.35)]">
              <CardContent className="p-7 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{about.softSkillsTitle}</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {about.softSkillsList.map((skill) => (
                    <div
                      key={skill}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-white/8 dark:bg-white/[0.03] dark:text-slate-200"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-10">
            <section>
              <h3 className="mb-6 text-3xl font-semibold text-slate-900 dark:text-white">
                {about.professionalExperience}
              </h3>
              <div className="space-y-6">
                {about.professionalExperienceItems.map((item, index) => (
                  <article
                    key={`${item.title}-${index}`}
                    className="rounded-3xl border border-slate-200 bg-white/92 p-6 shadow-[0_20px_70px_-50px_rgba(148,163,184,0.4)] backdrop-blur dark:border-white/10 dark:bg-slate-950/65 dark:shadow-[0_25px_80px_-50px_rgba(139,92,246,0.6)]"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 ring-1 ring-violet-400/20">
                           <Briefcase className="h-5 w-5 text-violet-600 dark:text-violet-300" />
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                          {item.company ? (
                            <p className="mt-1 text-base font-medium text-violet-700 dark:text-violet-300">{item.company}</p>
                          ) : null}
                          {item.location ? (
                            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                              <MapPin className="h-4 w-4" />
                              {item.location}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {item.period ? (
                          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                          {item.period}
                        </div>
                      ) : null}
                    </div>

                    {item.description ? (
                      <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
                    ) : null}

                    {item.highlights?.length ? (
                      <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {item.highlights.map((highlight) => (
                          <li key={highlight} className="flex gap-3">
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-violet-400" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-6 text-3xl font-semibold text-slate-900 dark:text-white">{about.personalProjects}</h3>
              <div className="grid gap-5">
                {about.personalProjectItems.map((item, index) => (
                  <article
                    key={`${item.title}-${index}`}
                    className="rounded-3xl border border-slate-200 bg-white/92 p-6 backdrop-blur dark:border-white/10 dark:bg-slate-950/60"
                  >
                    <h4 className="text-xl font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                    {item.company ? (
                      <p className="mt-2 text-base font-medium text-violet-700 dark:text-violet-300">{item.company}</p>
                    ) : null}
                    {item.highlights?.length ? (
                        <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {item.highlights.map((highlight) => (
                          <li key={highlight} className="flex gap-3">
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-violet-400" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-6 text-3xl font-semibold text-slate-900 dark:text-white">{about.education}</h3>
              <div className="space-y-5">
                {about.educationItems.map((item, index) => (
                  <article
                    key={`${item.title}-${index}`}
                    className="rounded-3xl border border-slate-200 bg-white/92 p-6 backdrop-blur dark:border-white/10 dark:bg-slate-950/60"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 ring-1 ring-violet-400/20">
                         <GraduationCap className="h-5 w-5 text-violet-600 dark:text-violet-300" />
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                        {item.institution ? (
                          <p className="mt-1 text-base font-medium text-violet-700 dark:text-violet-300">{item.institution}</p>
                        ) : null}
                        {item.location ? (
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.location}</p>
                        ) : null}
                        {item.description ? (
                          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

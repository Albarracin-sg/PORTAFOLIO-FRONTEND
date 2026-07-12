import { memo, useEffect, useMemo, useRef, useReducer, useState, type PointerEvent } from "react";
import { Briefcase, GraduationCap, MapPin, ArrowRight, Code2, Brain } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SkillBubble } from "./SkillBubble";
import skateDayImg from "@/assets/about/skate-day.png";
import skateNightImg from "@/assets/about/skate-nitgh.png";

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
  pill: string;
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

const SkillMarqueeRow = memo(function SkillMarqueeRow({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startScrollLeft: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const animationStyle = useMemo(
    () => ({
      animation: `marquee${reverse ? "R" : ""} ${Math.max(items.length, 1) * 4}s linear infinite`,
      animationPlayState: isDragging ? "paused" : "running",
      width: "max-content",
    }),
    [isDragging, items.length, reverse]
  );

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const loopWidth = scroller.scrollWidth / 3;
    if (loopWidth > 0 && (scroller.scrollLeft <= 1 || scroller.scrollLeft >= loopWidth * 2)) {
      scroller.scrollLeft = loopWidth;
    }

    dragRef.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: scroller.scrollLeft,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const drag = (event: PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    if (!scroller || !dragRef.current.active) return;
    const delta = event.clientX - dragRef.current.startX;
    const loopWidth = scroller.scrollWidth / 3;
    let nextScrollLeft = dragRef.current.startScrollLeft - delta;

    while (loopWidth > 0 && nextScrollLeft <= 0) nextScrollLeft += loopWidth;
    while (loopWidth > 0 && nextScrollLeft >= loopWidth * 2) nextScrollLeft -= loopWidth;

    scroller.scrollLeft = nextScrollLeft;
  };

  const endDrag = () => {
    dragRef.current.active = false;
    setIsDragging(false);
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="cursor-grab select-none overflow-x-scroll overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing"
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="flex py-3" style={animationStyle}>
          {[0, 1, 2].map((copy) => (
            <div key={copy} className="flex shrink-0 gap-4 pr-4">
              {items.map((skill) => (
                <SkillBubble
                  key={`m${copy}-${skill}`}
                  name={skill}
                  showName={true}
                  size="md"
                  className="cursor-grab whitespace-nowrap active:cursor-grabbing"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
});

const SkillMarquee = memo(function SkillMarquee({ groups }: { groups: SkillGroup[] }) {
  const { top, bot } = useMemo(() => {
    const all = groups.flatMap((g) => g.items);
    const mid = Math.ceil(all.length / 2);
    return { top: all.slice(0, mid), bot: all.slice(mid) };
  }, [groups]);

  return (
    <div className="space-y-2.5">
      <SkillMarqueeRow items={top} />
      <SkillMarqueeRow items={bot} reverse />
    </div>
  );
});

export default function About(_props: AboutProps) {
  const { t } = useTranslation();
  const about = useMemo(() => t("about", { returnObjects: true }) as AboutDictionary, [t]);
  const technicalSkillGroups = useMemo(() => about.technicalSkillGroups ?? [], [about]);
  
  // Refs para la animación de la bolita seguidora
  const timelineRef = useRef<HTMLDivElement>(null);
  const [dotPosition, setDotPosition] = useReducer((_: number, pos: number) => pos, 0);

  // Pattern: Event Handler Ref to avoid re-subscribing listeners
  const handlerRef = useRef<() => void>(() => {});

  handlerRef.current = () => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    const offset = windowHeight / 2;
    const start = rect.top - offset;
    const height = rect.height;
    
    if (start <= 0) {
      const progress = Math.min(Math.max(-start / height, 0), 1);
      setDotPosition(progress * height);
    } else {
      setDotPosition(0);
    }
  };

  useEffect(() => {
    const listener = () => handlerRef.current();
    window.addEventListener("scroll", listener, { passive: true });
    handlerRef.current();
    
    return () => {
      window.removeEventListener("scroll", listener);
    };
  }, []); // No dependencies, subscription is stable

  return (
    <>
      <style>{`
        @keyframes marquee  { from { transform: translateX(0) } to { transform: translateX(-33.333%) } }
        @keyframes marqueeR { from { transform: translateX(-33.333%) } to { transform: translateX(0) } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        .fu1 { animation: fadeUp .6s .05s ease both }
        .fu2 { animation: fadeUp .6s .15s ease both }
        .fu3 { animation: fadeUp .6s .25s ease both }
        .fu4 { animation: fadeUp .6s .35s ease both }
      `}</style>

      <section className="relative overflow-hidden px-4 pb-24 pt-0 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/8 blur-[140px]" />
        </div>

        <div className="mx-auto max-w-5xl">

          {/* HEADER */}
          <div className="mx-auto mb-36 max-w-4xl text-center fu1">
            <h2 className="text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
              {about.title}
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base">
              {about.bio}
            </p>
            <img
              src={skateDayImg}
              alt=""
              width={320}
              height={320}
              className="mx-auto mt-6 size-44 object-contain dark:hidden sm:size-56 lg:size-80"
            />
            <img
              src={skateNightImg}
              alt=""
              width={320}
              height={320}
              className="mx-auto mt-6 hidden size-44 object-contain dark:block sm:size-56 lg:size-80"
            />
          </div>

          {/* SKILLS MARQUEE */}
          <div className="mb-36 fu2">
            <SectionLabel icon={<Code2 className="size-3.5" />} label={about.technicalSkills} />
            <div className="mt-8">
              <SkillMarquee groups={technicalSkillGroups} />
            </div>
          </div>

          {/* SOFT SKILLS */}
          <div className="mb-36 fu3">
            <SectionLabel icon={<Brain className="size-3.5" />} label={about.softSkillsTitle} />
            <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {about.softSkillsList.map((skill, index) => (
                <div
                  key={`soft-skill-${skill.toLowerCase().replace(/\s+/g, "-")}`}
                  className="relative rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 text-sm text-black transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-950 dark:border-white/[0.07] dark:bg-white/[0.025] dark:text-white dark:hover:bg-white/[0.05] dark:hover:text-white"
                >
                  <span className="absolute right-3 top-2.5 font-mono text-[9px] text-zinc-500 dark:text-zinc-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {skill}
                </div>
              ))}
            </div>
          </div>
          {/* EXPERIENCE + PROJECTS + EDUCATION */}
          <div className="fu4 space-y-36">

            {/* Experience */}
            <section>
              <SectionLabel icon={<Briefcase className="size-3.5" />} label={about.professionalExperience} />
              
              <div 
                ref={timelineRef}
                className="relative mt-8 space-y-5 pl-5 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-zinc-200 dark:before:bg-white/10"
              >
                {/* Línea activa que acompaña el scroll */}
                <div 
                  className="absolute left-0 top-0 w-px bg-gradient-to-b from-violet-600 via-violet-500 to-violet-400 transition-all duration-150 ease-out"
                  style={{ height: `${dotPosition}px` }}
                />

                {/* La bolita "voladora" que te acompaña */}
                <div 
                  className="pointer-events-none absolute -left-[7.5px] z-20 flex size-4 items-center justify-center rounded-full border-2 border-violet-500 bg-white shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-transform duration-150 ease-out dark:bg-zinc-950"
                  style={{ transform: `translateY(${dotPosition}px)` }}
                >
                  <div className="size-1.5 animate-pulse rounded-full bg-violet-500" />
                </div>

                {about.professionalExperienceItems.map((item) => (
                  <article
                    key={`${item.company}-${item.title}`}
                    className="relative rounded-2xl border border-zinc-200 bg-white/85 p-6 transition-colors hover:border-violet-400/20 hover:bg-white dark:border-white/[0.07] dark:bg-white/[0.025] dark:hover:bg-white/[0.04]"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{item.title}</h3>
                        {item.company && <p className="mt-0.5 text-sm text-violet-600 dark:text-violet-400">{item.company}</p>}
                        {item.location && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-600">
                            <MapPin className="size-3" />{item.location}
                          </p>
                        )}
                      </div>
                      {item.period && (
                        <span className="shrink-0 self-start rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-mono text-zinc-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
                          {item.period}
                        </span>
                      )}
                    </div>
                    {item.description && <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{item.description}</p>}
                    {item.highlights?.length ? (
                      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                        {item.highlights?.map((h) => {
                          const highlightId = `h-${h.toLowerCase().replace(/\s+/g, "-").slice(0, 20)}`;
                          return (
                            <li key={highlightId} className="flex gap-2.5 rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-3.5 py-2.5 text-xs leading-6 text-zinc-600 dark:border-white/[0.05] dark:bg-white/[0.02] dark:text-zinc-400">
                              <ArrowRight className="mt-0.5 size-3 shrink-0 text-violet-500" />
                              {h}
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

            {/* Projects */}
            <section>
              <SectionLabel icon={<Code2 className="size-3.5" />} label={about.personalProjects} />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {about.personalProjectItems.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-zinc-200 bg-white/85 p-6 transition-colors hover:border-violet-400/20 hover:bg-white dark:border-white/[0.07] dark:bg-white/[0.025] dark:hover:bg-white/[0.04]"
                  >
                    <h4 className="text-base font-semibold text-zinc-900 dark:text-white">{item.title}</h4>
                    {item.company && (
                      <p className="mt-2 flex flex-wrap gap-1.5">
                        {item.company.split("·").map((tag) => (
                          <span key={tag} className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[11px] text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
                            {tag.trim()}
                          </span>
                        ))}
                      </p>
                    )}
                    {item.highlights?.length ? (
                      <ul className="mt-4 space-y-2">
                        {item.highlights.map((h) => (
                          <li key={`project-h-${h.toLowerCase().replace(/\s+/g, "-").slice(0, 20)}`} className="flex gap-2.5 text-xs leading-6 text-zinc-600 dark:text-zinc-400">
                            <span className="mt-2 size-1 shrink-0 rounded-full bg-violet-500" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

            {/* Education */}
            <section>
              <SectionLabel icon={<GraduationCap className="size-3.5" />} label={about.education} />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {about.educationItems.map((item) => (
                  <article
                    key={`${item.institution}-${item.title}`}
                    className="rounded-2xl border border-zinc-200 bg-white/85 p-6 transition-colors hover:border-violet-400/20 hover:bg-white dark:border-white/[0.07] dark:bg-white/[0.025] dark:hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04]">
                        <GraduationCap className="size-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-zinc-900 dark:text-white">{item.title}</h4>
                        {item.institution && <p className="text-sm text-violet-600 dark:text-violet-400">{item.institution}</p>}
                      </div>
                    </div>
                    {item.location && <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{item.location}</p>}
                    {item.description && <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{item.description}</p>}
                  </article>
                ))}
              </div>
            </section>

          </div>
        </div>
      </section>
    </>
  );
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-zinc-200 dark:bg-white/[0.07]" />
      <span className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-xl">
        {icon}
        {label}
      </span>
      <div className="h-px flex-1 bg-zinc-200 dark:bg-white/[0.07]" />
    </div>
  );
}

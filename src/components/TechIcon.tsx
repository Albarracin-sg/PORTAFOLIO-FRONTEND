import { 
  SiReact, 
  SiNodedotjs, 
  SiTypescript, 
  SiNestjs, 
  SiPostgresql, 
  SiJavascript, 
  SiTailwindcss, 
  SiNextdotjs, 
  SiPrisma, 
  SiDocker, 
  SiGit, 
  SiGithub, 
  SiVite, 
  SiExpress, 
  SiPython, 
  SiFastapi, 
  SiMongodb, 
  SiRedis, 
  SiGooglecloud, 
  SiFirebase, 
  SiFigma, 
  SiMysql, 
  SiVercel, 
  SiNetlify, 
  SiPostman, 
  SiFramer, 
  SiRadixui,
  SiShadcnui,
  SiGithubactions,
  SiPrometheus,
  SiGrafana,
  SiJest,
  SiCypress,
  SiSwagger,
  SiLinux,
  SiUbuntu,
  SiArchlinux,
  SiAstro,
  SiOpenai,
  SiAnthropic,
  SiJsonwebtokens,
  SiReactivex,
  SiSocketdotio,
  SiDotnet,
  SiOpenjdk,
  SiCplusplus,
  SiGo,
  SiKubernetes,
  SiTerraform,
  SiSqlite
} from 'react-icons/si';
import { VscCode, VscCircuitBoard } from 'react-icons/vsc';
import { FaJava, FaNetworkWired, FaProjectDiagram, FaBrain, FaInfinity, FaAws } from 'react-icons/fa';
import { TbBrandCSharp, TbBrandReactNative, TbApi, TbWebhook, TbClockHour4 } from 'react-icons/tb';
import { 
  Cpu, 
  Layers, 
  Workflow, 
  Bot, 
  Settings, 
  Boxes, 
  Zap,
  ShieldCheck,
  Code2
} from 'lucide-react';

const iconMap: Record<string, any> = {
  // Languages
  'react': SiReact,
  'react.js': SiReact,
  'react native': TbBrandReactNative,
  'node.js': SiNodedotjs,
  'node': SiNodedotjs,
  'typescript': SiTypescript,
  'ts': SiTypescript,
  'javascript': SiJavascript,
  'js': SiJavascript,
  'python': SiPython,
  'c#': TbBrandCSharp,
  'java': FaJava,
  'openjdk': SiOpenjdk,
  'c++': SiCplusplus,
  'go': SiGo,
  'astro': SiAstro,

  // Frameworks & Backend
  'nestjs': SiNestjs,
  'nest.js': SiNestjs,
  'express': SiExpress,
  'fastapi': SiFastapi,
  'next.js': SiNextdotjs,
  'nextjs': SiNextdotjs,
  'rest apis': TbApi,
  'grpc': FaNetworkWired,
  'websockets': SiSocketdotio,
  'webhooks': TbWebhook,
  'cron jobs': TbClockHour4,
  'graphql': Zap,

  // Databases
  'postgresql': SiPostgresql,
  'postgres': SiPostgresql,
  'mysql': SiMysql,
  'mongodb': SiMongodb,
  'redis': SiRedis,
  'sqlite': SiSqlite,
  'prisma': SiPrisma,
  'entity framework': SiDotnet,

  // Architecture
  'microservices': Boxes,
  'ddd': FaProjectDiagram,
  'cqrs': Workflow,
  'clean architecture': Layers,
  'architecture': VscCircuitBoard,
  'orchestrators': Workflow,
  'orquestadores': Workflow,

  // AI & MCP
  'mcp': Cpu,
  'mcp (model context protocol)': Cpu,
  'ai': FaBrain,
  'openai': SiOpenai,
  'openai api': SiOpenai,
  'anthropic': SiAnthropic,
  'anthropic api': SiAnthropic,
  'agents': Bot,
  'agentes': Bot,
  'tool calling': Settings,
  'tool calling dinámico': Settings,

  // Infra & DevOps
  'docker': SiDocker,
  'kubernetes': SiKubernetes,
  'terraform': SiTerraform,
  'github actions': SiGithubactions,
  'ci/cd': FaInfinity,
  'prometheus': SiPrometheus,
  'grafana': SiGrafana,
  'aws': FaAws,
  'google cloud': SiGooglecloud,
  'firebase': SiFirebase,
  'vercel': SiVercel,
  'netlify': SiNetlify,
  'linux': SiLinux,
  'arch linux': SiArchlinux,
  'ubuntu': SiUbuntu,
  'linux (arch, ubuntu server)': SiLinux,
  'swagger': SiSwagger,

  // Testing
  'jest': SiJest,
  'cypress': SiCypress,
  'testing': ShieldCheck,

  // Frontend & UI
  'tailwindcss': SiTailwindcss,
  'tailwind': SiTailwindcss,
  'radix ui': SiRadixui,
  'shadcn': SiShadcnui,
  'shadcn/ui': SiShadcnui,
  'framer motion': SiFramer,
  'figma': SiFigma,

  // Tools
  'git': SiGit,
  'github': SiGithub,
  'postman': SiPostman,
  'vite': SiVite,
  'vscode': VscCode,
  'jwt': SiJsonwebtokens,
  'reactive': SiReactivex,
};

interface TechIconProps {
  name: string;
  className?: string;
}

export function TechIcon({ name, className }: TechIconProps) {
  const normalizedName = name.toLowerCase().trim();
  const Icon = iconMap[normalizedName];

  if (!Icon) {
    // Fallback to a generic code icon if not found
    return <Code2 className={className} />;
  }

  return <Icon className={className} />;
}

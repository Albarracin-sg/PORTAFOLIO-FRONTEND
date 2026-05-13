import { useEffect, useCallback, useReducer } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { fetchPublicProjects, PublicProject } from '@/shared/api/public';
import { commonFormatters } from '@/shared/utils/formatters';
import { ProjectDetailSkeleton } from './components/ProjectDetailSkeleton';
import { ProjectHeader } from './components/ProjectHeader';
import { ProjectInfo } from './components/ProjectInfo';
import { ProjectContent } from './components/ProjectContent';
import { ProjectSidebar } from './components/ProjectSidebar';

interface ProjectDetailState {
  project: PublicProject | null;
  isLoading: boolean;
}

type ProjectDetailAction = 
  | { type: 'START_LOAD' }
  | { type: 'FINISH_LOAD'; payload: PublicProject | null }
  | { type: 'LOAD_ERROR' };

function projectDetailReducer(state: ProjectDetailState, action: ProjectDetailAction): ProjectDetailState {
  switch (action.type) {
    case 'START_LOAD':
      return { ...state, isLoading: true };
    case 'FINISH_LOAD':
      return { project: action.payload, isLoading: false };
    case 'LOAD_ERROR':
      return { project: null, isLoading: false };
    default:
      return state;
  }
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(projectDetailReducer, {
    project: null,
    isLoading: true,
  });

  const { project, isLoading } = state;

  useEffect(() => {
    if (!id) {
      navigate('/projects', { replace: true });
      return;
    }

    let isActive = true;

    const loadProject = async () => {
      dispatch({ type: 'START_LOAD' });
      try {
        const projects = await fetchPublicProjects();
        if (!isActive) return;
        
        const found = projects.find((item) => item.id === id);

        if (!found) {
          navigate('/projects', { replace: true });
          return;
        }

        dispatch({ type: 'FINISH_LOAD', payload: found });
      } catch {
        if (isActive) {
          dispatch({ type: 'LOAD_ERROR' });
          navigate('/projects', { replace: true });
        }
      }
    };

    loadProject();
    return () => { isActive = false; };
  }, [id, navigate]);

  const formatDate = useCallback((value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return commonFormatters.longDate(i18n.language).format(date);
  }, [i18n.language]);

  const getLocalizedValue = useCallback((obj: Record<string, string> | string) => {
    if (typeof obj === 'string') return obj;
    if (!obj) return '';
    
    if (obj[i18n.language]) return obj[i18n.language];
    
    const baseLang = i18n.language.split('-')[0];
    if (obj[baseLang]) return obj[baseLang];
    
    return obj['es'] || Object.values(obj)[0] || '';
  }, [i18n.language]);

  if (isLoading) return <ProjectDetailSkeleton />;
  if (!project) return null;

  return (
    <div className="min-h-screen pt-28 pb-24 selection:bg-violet-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ProjectHeader project={project} />
        
        <ProjectInfo 
          project={project} 
          formattedDate={formatDate(project.date)} 
        />

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <ProjectContent 
            project={project} 
            getLocalizedValue={getLocalizedValue} 
          />
          <ProjectSidebar project={project} />
        </div>
      </div>
    </div>
  );
}

import { Star, Image as ImageIcon, Github, ExternalLink, Calendar, Code2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectMetadataSidebarProps {
  form: any;
  setForm: (val: any) => void;
  t: any;
}

export function ProjectMetadataSidebar({ form, setForm, t }: ProjectMetadataSidebarProps) {
  return (
    <aside className="lg:col-span-4 space-y-8">
      <Card className="rounded-[2rem] border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm sticky top-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-violet-500" />
            {t('admin.projects.edit.technicalDetails')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ml-1">{t('admin.projects.edit.preview')}</label>
            <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-100 dark:bg-black/20 border border-zinc-200 dark:border-white/5 relative group">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="Preview" className="size-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 italic">
                  <ImageIcon className="size-8 mb-2 opacity-20" />
                  <span className="text-xs">{t('admin.projects.edit.noImage')}</span>
                </div>
              )}
            </div>
            <Input
              value={form.imageUrl}
              placeholder={t('admin.projects.edit.imageUrl')}
              onChange={(e) => setForm((prev: any) => ({ ...prev, imageUrl: e.target.value }))}
              className="rounded-xl border-zinc-200 dark:border-white/10 h-10 text-xs bg-zinc-50 dark:bg-black/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ml-1">{t('admin.projects.edit.fields.category')}</label>
              <Select value={form.category} onValueChange={(v) => setForm((prev: any) => ({ ...prev, category: v }))}>
                <SelectTrigger className="rounded-xl border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/40 text-xs h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200 dark:border-white/10">
                  <SelectItem value="web">{t('admin.projects.projects.modal.categories.web')}</SelectItem>
                  <SelectItem value="fullstack">{t('admin.projects.projects.modal.categories.fullstack')}</SelectItem>
                  <SelectItem value="devops">{t('admin.projects.projects.modal.categories.devops')}</SelectItem>
                  <SelectItem value="ml">{t('admin.projects.projects.modal.categories.ml')}</SelectItem>
                  <SelectItem value="data">{t('admin.projects.projects.modal.categories.data')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ml-1">{t('admin.projects.edit.fields.status')}</label>
              <Select value={form.status} onValueChange={(v) => setForm((prev: any) => ({ ...prev, status: v }))}>
                <SelectTrigger className="rounded-xl border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/40 text-xs h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200 dark:border-white/10">
                  <SelectItem value="production">{t('admin.projects.projects.modal.status.production')}</SelectItem>
                  <SelectItem value="development">{t('admin.projects.projects.modal.status.development')}</SelectItem>
                  <SelectItem value="prototype">{t('admin.projects.projects.modal.status.prototype')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ml-1">{t('admin.projects.edit.fields.kind')}</label>
            <Select value={form.kind} onValueChange={(value) => setForm((prev: any) => ({ ...prev, kind: value }))}>
              <SelectTrigger className="rounded-xl border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/40 text-xs h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-zinc-200 dark:border-white/10">
                <SelectItem value="PUBLIC">{t('admin.projects.edit.fields.publicProject')}</SelectItem>
                <SelectItem value="PRIVATE">{t('admin.projects.edit.fields.privateProject')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/10">
            <div className="flex items-center gap-2">
              <Star className="size-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-semibold">{t('admin.projects.edit.fields.featured')}</span>
            </div>
            <Switch
              checked={form.featured}
              onCheckedChange={(checked) => setForm((prev: any) => ({ ...prev, featured: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-500/5 border border-zinc-500/10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{t('admin.projects.edit.fields.active')}</span>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) => setForm((prev: any) => ({ ...prev, isActive: checked }))}
            />
          </div>

          <Separator className="bg-zinc-200/50 dark:bg-white/5" />

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ml-1">{t('admin.projects.edit.fields.github')}</label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
                <Input
                  value={form.githubUrl}
                  onChange={(e) => setForm((prev: any) => ({ ...prev, githubUrl: e.target.value }))}
                  className="rounded-xl border-zinc-200 dark:border-white/10 pl-9 text-xs bg-zinc-50 dark:bg-black/40 h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ml-1">{t('admin.projects.edit.fields.live')}</label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
                <Input
                  value={form.liveUrl}
                  onChange={(e) => setForm((prev: any) => ({ ...prev, liveUrl: e.target.value }))}
                  className="rounded-xl border-zinc-200 dark:border-white/10 pl-9 text-xs bg-zinc-50 dark:bg-black/40 h-10"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-zinc-200/50 dark:bg-white/5" />

          <div className="space-y-4">
             <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">
                <Calendar className="size-3" /> {t('admin.projects.edit.fields.date')}
              </label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev: any) => ({ ...prev, date: e.target.value }))}
                className="rounded-xl border-zinc-200 dark:border-white/10 text-xs bg-zinc-50 dark:bg-black/40 h-10"
              />
            </div>
             <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">
                <Code2 className="size-3" /> {t('admin.projects.edit.fields.techStack')}
              </label>
              <Textarea
                value={form.technologies}
                placeholder={t('admin.projects.edit.fields.techStack')}
                onChange={(e) => setForm((prev: any) => ({ ...prev, technologies: e.target.value }))}
                className="rounded-xl border-zinc-200 dark:border-white/10 text-xs bg-zinc-50 dark:bg-black/40 min-h-[100px] py-3 resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

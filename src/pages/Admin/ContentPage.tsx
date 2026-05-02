import { useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import { fetchPages, fetchSections, Page, Section, updatePage, updateSection } from '@/features/admin/api/content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function AdminContentPage() {
  const { token } = useAdminAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [jsonDraft, setJsonDraft] = useState('');
  const [orderDraft, setOrderDraft] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [previewSlug, setPreviewSlug] = useState<string>('home');
  const [previewKey, setPreviewKey] = useState(0);

  const previewBaseUrl = import.meta.env.VITE_PUBLIC_SITE_URL ?? 'http://localhost:5173';

  const previewPath = useMemo(() => {
    if (previewSlug === 'home') return '/';
    return `/${previewSlug}`;
  }, [previewSlug]);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setLoading(true);
      const [pagesData, sectionsData] = await Promise.all([
        fetchPages(token),
        fetchSections(token),
      ]);
      setPages(pagesData);
      setSections(sectionsData);
      setLoading(false);
    };

    load();
  }, [token]);

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedSectionId),
    [sections, selectedSectionId],
  );

  useEffect(() => {
    if (!selectedSection) {
      setJsonDraft('');
      setOrderDraft(0);
      return;
    }

    setJsonDraft(JSON.stringify(selectedSection.content ?? {}, null, 2));
    setOrderDraft(selectedSection.order);
  }, [selectedSection]);

  const handleTogglePublish = async (page: Page) => {
    if (!token) return;
    const updated = await updatePage(token, page.id, { isPublished: !page.isPublished });
    setPages((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setPreviewKey((prev) => prev + 1);
  };

  const handleSaveSection = async () => {
    if (!token || !selectedSection) return;
    setSaveStatus(null);

    try {
      const parsed = JSON.parse(jsonDraft);
      const updated = await updateSection(token, selectedSection.id, {
        content: parsed,
        order: orderDraft,
      });
      setSections((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSaveStatus('Guardado');
      setPreviewKey((prev) => prev + 1);
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : 'JSON invalido');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-gray-100">Content</h1>
          <p className="text-gray-600 dark:text-gray-400">Pages and sections used on the public site.</p>
        </div>
        <Button variant="outline">Add page</Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Pages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-gray-500">Loading pages...</p>
          ) : (
            pages.map((page) => (
              <div key={page.id} className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{page.title}</div>
                  <div className="text-sm text-gray-500">/{page.slug}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleTogglePublish(page)}>
                  {page.isPublished ? 'Published' : 'Draft'}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Sections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-gray-500">Loading sections...</p>
          ) : (
            sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setSelectedSectionId(section.id)}
                className={`w-full text-left rounded-lg border border-gray-200/60 dark:border-gray-700/60 px-3 py-2 transition-colors ${
                  selectedSectionId === section.id
                    ? 'border-violet-400/80 bg-violet-50/70 dark:bg-violet-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">{section.type}</div>
                <div className="text-sm text-gray-500">Page: {section.pageId}</div>
                <div className="text-xs text-gray-500">Order: {section.order}</div>
              </button>
            ))
          )}
        </CardContent>
      </Card>
      <Card className="border-gray-200 dark:border-gray-700 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Section Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedSection ? (
            <>
              <div>
                <Label htmlFor="section-order">Order</Label>
                <Input
                  id="section-order"
                  type="number"
                  value={orderDraft}
                  onChange={(event) => setOrderDraft(Number(event.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="section-json">Content JSON</Label>
                <textarea
                  id="section-json"
                  value={jsonDraft}
                  onChange={(event) => setJsonDraft(event.target.value)}
                  rows={16}
                  className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>
              {saveStatus && <p className="text-sm text-gray-500">{saveStatus}</p>}
              <Button className="w-full" onClick={handleSaveSection}>
                Save section
              </Button>
            </>
          ) : (
            <p className="text-sm text-gray-500">Select a section to edit.</p>
          )}
        </CardContent>
      </Card>
        </div>

        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="preview-page">Page</Label>
              <select
                id="preview-page"
                value={previewSlug}
                onChange={(event) => setPreviewSlug(event.target.value)}
                className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                {pages.length === 0 ? (
                  <option value="home">home</option>
                ) : (
                  pages.map((page) => (
                    <option key={page.id} value={page.slug}>
                      {page.slug}
                    </option>
                  ))
                )}
              </select>
              <Button variant="outline" size="sm" onClick={() => setPreviewKey((prev) => prev + 1)}>
                Reload
              </Button>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[70vh]">
              <iframe
                key={previewKey}
                title="preview"
                src={`${previewBaseUrl}${previewPath}`}
                className="h-full w-full bg-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

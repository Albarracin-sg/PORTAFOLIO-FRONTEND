import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import { fetchPages, fetchSections, Page, Section } from '@/features/admin/api/content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AdminContentPage() {
  const { token } = useAdminAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-gray-100">Content</h1>
          <p className="text-gray-600 dark:text-gray-400">Pages and sections used on the public site.</p>
        </div>
        <Button variant="outline">Add page</Button>
      </div>

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
                <div className="text-sm text-gray-500">
                  {page.isPublished ? 'Published' : 'Draft'}
                </div>
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
              <div key={section.id} className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{section.type}</div>
                  <div className="text-sm text-gray-500">Page: {section.pageId}</div>
                </div>
                <div className="text-sm text-gray-500">Order: {section.order}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

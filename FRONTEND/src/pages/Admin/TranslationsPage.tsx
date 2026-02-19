import { useEffect, useState } from 'react';
import { fetchTranslations, TranslationRecord } from '@/features/admin/api/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AdminTranslationsPage() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [records, setRecords] = useState<TranslationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchTranslations(lang);
      setRecords(data);
      setLoading(false);
    };

    load();
  }, [lang]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-gray-100">Translations</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage ES/EN content keys.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={lang === 'es' ? 'default' : 'outline'} onClick={() => setLang('es')}>
            ES
          </Button>
          <Button variant={lang === 'en' ? 'default' : 'outline'} onClick={() => setLang('en')}>
            EN
          </Button>
        </div>
      </div>

      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Namespaces</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-gray-500">Loading translations...</p>
          ) : (
            records.map((record) => (
              <div key={record.id} className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{record.namespace}</div>
                  <div className="text-sm text-gray-500">{record.lang}</div>
                </div>
                <div className="text-sm text-gray-500">Keys: {Object.keys(record.content ?? {}).length}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

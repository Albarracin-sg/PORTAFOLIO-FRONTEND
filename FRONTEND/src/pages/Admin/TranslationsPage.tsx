import { useEffect, useMemo, useState } from 'react';
import { fetchTranslations, TranslationRecord, upsertTranslation } from '@/features/admin/api/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';

export function AdminTranslationsPage() {
  const { token } = useAdminAuth();
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [records, setRecords] = useState<TranslationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null);
  const [jsonDraft, setJsonDraft] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchTranslations(lang);
      setRecords(data);
      setLoading(false);
    };

    load();
  }, [lang]);

  const selectedRecord = useMemo(
    () => records.find((record) => record.namespace === selectedNamespace),
    [records, selectedNamespace],
  );

  useEffect(() => {
    if (!selectedRecord) {
      setJsonDraft('');
      return;
    }
    setJsonDraft(JSON.stringify(selectedRecord.content ?? {}, null, 2));
  }, [selectedRecord]);

  const handleSave = async () => {
    if (!token || !selectedRecord) return;
    setSaveStatus(null);
    try {
      const parsed = JSON.parse(jsonDraft);
      const updated = await upsertTranslation(token, {
        lang: selectedRecord.lang,
        namespace: selectedRecord.namespace,
        content: parsed,
      });
      setRecords((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSaveStatus('Guardado');
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : 'JSON invalido');
    }
  };

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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-gray-200 dark:border-gray-700 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Namespaces</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-gray-500">Loading translations...</p>
            ) : (
              records.map((record) => (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => setSelectedNamespace(record.namespace)}
                  className={`w-full text-left rounded-lg border border-gray-200/60 dark:border-gray-700/60 px-3 py-2 transition-colors ${
                    selectedNamespace === record.namespace
                      ? 'border-violet-400/80 bg-violet-50/70 dark:bg-violet-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">{record.namespace}</div>
                  <div className="text-xs text-gray-500">Keys: {Object.keys(record.content ?? {}).length}</div>
                </button>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-gray-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedRecord ? (
              <>
                <div>
                  <Label htmlFor="translation-json">JSON</Label>
                  <textarea
                    id="translation-json"
                    value={jsonDraft}
                    onChange={(event) => setJsonDraft(event.target.value)}
                    rows={16}
                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
                {saveStatus && <p className="text-sm text-gray-500">{saveStatus}</p>}
                <Button className="w-full" onClick={handleSave} disabled={!token}>
                  Save translation
                </Button>
              </>
            ) : (
              <p className="text-sm text-gray-500">Select a namespace to edit.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

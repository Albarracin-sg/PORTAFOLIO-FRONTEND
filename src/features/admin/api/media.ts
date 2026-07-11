export async function uploadMedia(token: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const apiBase =
    import.meta.env.VITE_API_URL ??
    import.meta.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3000/api/v1';

  const response = await fetch(`${apiBase}/admin/media/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Upload failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { id: string; url: string };
  const base =
    import.meta.env.VITE_API_URL ??
    import.meta.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3000/api/v1';
  const origin = base.replace(/\/api\/v1$/, '');
  const url = payload.url.startsWith('http') ? payload.url : `${origin}${payload.url}`;
  return { ...payload, url };
}

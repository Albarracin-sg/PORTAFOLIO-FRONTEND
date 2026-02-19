import { useEffect, useState } from 'react';
import { fetchMessages, ContactMessage } from '@/features/admin/api/messages';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminMessagesPage() {
  const { token } = useAdminAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setLoading(true);
      const data = await fetchMessages(token);
      setMessages(data);
      setLoading(false);
    };

    load();
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-gray-900 dark:text-gray-100">Messages</h1>
        <p className="text-gray-600 dark:text-gray-400">Contact form submissions.</p>
      </div>

      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Inbox</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-gray-500">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-500">No messages yet.</p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="border-b border-gray-200/60 pb-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{message.name}</div>
                  <div className="text-sm text-gray-500">{new Date(message.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-sm text-gray-500">{message.email}</div>
                <p className="mt-2 text-gray-700 dark:text-gray-300">{message.message}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

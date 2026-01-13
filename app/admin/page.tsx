// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AdminPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/sessions')
      .then(r => r.json())
      .then(data => {
        setSessions(data.sessions);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container p-8">Loading...</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin - Sessions ({sessions.length})</h1>
      <div className="space-y-3">
        {sessions.map((session) => (
          <Card key={session.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-mono text-sm">{session.id}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {session.fileCount} files • {new Date(session.modified).toLocaleString()}
                </p>
              </div>
              <a href={`/api/admin/sessions/${session.id}`} download>
                <Button size="sm">Download</Button>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

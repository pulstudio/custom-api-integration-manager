'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface ActivityLogEntry {
  id: string;
  action: string;
  details: any;
  created_at: string;
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching activity logs:', error);
      } else {
        setLogs(data);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
      <ul className="space-y-2">
        {logs.map((log) => (
          <li key={log.id} className="bg-gray-100 p-2 rounded">
            <span className="font-semibold">{log.action}</span>
            <span className="ml-2 text-sm text-gray-600">
              {new Date(log.created_at).toLocaleString()}
            </span>
            {log.details && (
              <pre className="mt-1 text-sm">{JSON.stringify(log.details, null, 2)}</pre>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
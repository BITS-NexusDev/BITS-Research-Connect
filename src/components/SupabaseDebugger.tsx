
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface TableInfo {
  name: string;
  count: number;
  error?: string;
}

// Define a type for valid table names
type ValidTableName = "applications" | "research_positions" | "students" | "professors" | "user_roles";

export const SupabaseDebugger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Define tableNames with the correct type, removing 'users' which doesn't exist
  const [tableNames] = useState<ValidTableName[]>([
    'user_roles', 'students', 'professors', 'research_positions', 'applications'
  ]);

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setCurrentUserId(data.session.user.id);
      }
    });
  }, []);

  const checkAccess = async () => {
    setLoading(true);
    const tableChecks: TableInfo[] = [];
    
    for (const table of tableNames) {
      try {
        // Count records - now table is properly typed
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        tableChecks.push({
          name: table,
          count: count || 0,
          error: error ? error.message : undefined
        });
      } catch (e) {
        tableChecks.push({
          name: table,
          count: 0,
          error: e instanceof Error ? e.message : 'Unknown error'
        });
      }
    }
    
    setTables(tableChecks);
    setLoading(false);
  };
  
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4">
        <Button 
          variant="outline" 
          className="bg-white border-gray-300" 
          onClick={() => setIsOpen(true)}
        >
          Debug Database
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96">
        <CardHeader className="py-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Supabase Debug Tools</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>✕</Button>
          </div>
          <CardDescription>
            Check database permissions and record counts
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xs pb-2">
            {currentUserId ? (
              <span>Current user ID: <code className="bg-gray-100 px-1 py-0.5 rounded">{currentUserId}</code></span>
            ) : (
              <span className="text-gray-500">Not authenticated</span>
            )}
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={checkAccess}
            disabled={loading}
            className="w-full mb-4"
          >
            {loading ? "Checking..." : "Check Database Access"}
          </Button>
          
          {tables.length > 0 && (
            <div className="bg-gray-50 p-2 rounded text-xs overflow-y-auto max-h-60">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left font-medium">Table</th>
                    <th className="text-right font-medium">Count</th>
                    <th className="text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((table) => (
                    <tr key={table.name} className="border-t border-gray-200">
                      <td className="py-1">{table.name}</td>
                      <td className="text-right">{table.error ? '—' : table.count}</td>
                      <td className="text-right">
                        {table.error ? (
                          <span className="text-red-500 text-xs">Error</span>
                        ) : (
                          <span className="text-green-500 text-xs">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {tables.some(t => t.error) && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-red-500">
                  {tables.filter(t => t.error).map((table) => (
                    <div key={`${table.name}-error`} className="mb-1">
                      <strong>{table.name}:</strong> {table.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseDebugger;

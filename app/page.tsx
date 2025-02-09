"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, Heart, Loader2 } from "lucide-react";

type Agent = {
  id: number;
  prompt: string;
  created_at: string;
  system_message: string;
}

export default function Home() {
  const navigate = useRouter();
  const supabase = createClient()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase.from('ChatRooms').select(`*`);
      if (error) throw error;
      setAgents(data as Agent[]);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents()
  }, [])

  // TODO USE STYLE VARIABLES INSTEAD OF HARDCODING
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-pink-500" />
            <h1 className="text-3xl font-bold text-gray-900">Cupid 69</h1>
          </div>
          <Button 
            onClick={() => navigate.push('/invite/create')}
            className="bg-pink-500 hover:bg-pink-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create new lover
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        ) : agents.length === 0 ? (
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-64 text-center">
              <Heart className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No lovers created yet</h3>
              <p className="text-gray-500 mb-4">Create your first AI companion to start chatting</p>
              <Button 
                onClick={() => navigate.push('/invite/create')}
                variant="outline"
                className="border-pink-200 hover:border-pink-300 text-pink-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create lover
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card 
                key={agent.id} 
                className="group hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-800 line-clamp-2">
                    {agent.system_message}
                  </h2>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {agent.prompt}
                  </p>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button 
                    onClick={() => navigate.push(`/invite?key=${agent.id}`)}
                    className="w-full bg-white hover:bg-gray-50 text-pink-500 border border-pink-200 hover:border-pink-300"
                  >
                    Start chatting
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type agent = {
  id: number;
  prompt: string;
  created_at: string;
  system_message: string;
}

export default function Home() {
  const navigate = useRouter();
  const supabase = createClient()
  const [agents, setAgents] = useState<agent[]>([])

  const getchAgents = async () => {
    const { data, error: fetchError } = await supabase.from('ChatRooms').select(`*`);

    setAgents(data as agent[])
  }

  useEffect(() => {
    getchAgents()
  }, [])


  return (
    <div>
      <main>
        <Button onClick={() => navigate.push('/invite/create')}>Create new lover</Button>
        <div className="grid grid-cols-3 gap-4">
          {agents && agents.map((agent) => {
            return <Card key={agent.id} className="flex flex-col items-center justify-center">
              <CardHeader>
                <h1>{agent?.system_message}</h1>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate.push(`/invite?key=${agent.id}`)}>View</Button>
              </CardContent>
            </Card>
            }   
          )}
        </div>
      </main>
      <footer>
      
      </footer>
    </div>
  );
}

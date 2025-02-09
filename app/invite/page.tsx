"use client"
import React from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export type chatMessage = {
  id: number;
  chat_id: number;
  message: string;
  role: string;
}

export default function LoveLetter() {
  const searchParams = useSearchParams()
  const id = searchParams.get('key')
  const supabase = createClient()
  const queryClient = useQueryClient()

  const [systemPrompt, setSystemPrompt] = React.useState('')
  const [chat, setChat] = React.useState<chatMessage[]>([])
  const [inputValue, setInputValue] = React.useState('')



  const fetchPrompt = async () => {
    const { data, error } = await supabase.from('ChatRooms')
    .select('*')
    .eq('id', id)
    
    if(!data) {
      throw new Error("No data")
    }

    setSystemPrompt(data[0].system_message)
  }

  const fetchChat = async () => {

    const {data: chatData, error: chatError} = await supabase.from('Messages')
    .select('*')
    .eq('chat_id', id)
    .order('created_at', {ascending: true})

    return chatData as chatMessage[]
  }

  const sendMessage = async () => {
    const response = await fetch("/api/prompt", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: inputValue,
        chat_id: id,
        system_message: systemPrompt, 
        history: chat
      })
    })
    setInputValue('')
        
    queryClient.invalidateQueries({queryKey: ['chat', id]})
  }

  const {data, isLoading, error} = useQuery({
    queryKey: ['chat', id],
    queryFn: fetchChat
  })
  
  React.useEffect(() => {
    fetchPrompt()
  }, [])

  return (
    <div>

        {id}

        {data && data.map((message) => {
          return <Card>
            <CardHeader>
              <h1>{message.role}</h1>
            </CardHeader>
            <CardContent>
              <p>{message.message}</p>
            </CardContent>
          </Card>
        })}

        <div className="flex flex-row items-center justify-center">
          <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter your message"
              type="text"
          />
          <Button onClick={() => sendMessage()}>Send</Button>

        </div>
    </div>
  )
}

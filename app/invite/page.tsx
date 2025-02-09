"use client"
import React from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const [systemPrompt, setSystemPrompt] = React.useState('')
  const [inputValue, setInputValue] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const navigate = useRouter();

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
    if (!inputValue.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/prompt", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: inputValue,
          chat_id: id,
          system_message: systemPrompt || 'system', 
          history: data
        })
      })
      setInputValue('')
      queryClient.invalidateQueries({queryKey: ['chat', id]})
    } finally {
      setIsSubmitting(false)
    }
  }

  const {data, isLoading, error} = useQuery({
    queryKey: ['chat', id],
    queryFn: fetchChat
  })

  React.useEffect(() => {
    fetchPrompt()
  }, [])

  React.useEffect(() => {
    // TODO THIS IS NOT WORKING Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [data])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <Card className="flex-1 mb-4">
        <CardHeader className="border-b p-4 flex flex-row items-center">
          <Button variant="link" onClick={() => navigate.push('/')}>Back</Button>
          <h2 className="text-2xl font-bold">Chat Room {id}</h2>
        </CardHeader>
        <ScrollArea className="h-[calc(100vh-12rem)] p-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.map((message) => (
                <Card 
                  key={message.id}
                  className={`${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-12' 
                      : 'bg-muted mr-12'
                  }`}
                >
                  <CardHeader className="p-3 pb-1">
                    <h3 className="font-semibold capitalize">{message.role}</h3>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <p className="whitespace-pre-wrap">{message.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1"
          disabled={isSubmitting}
        />
        <Button 
          onClick={sendMessage}
          disabled={isSubmitting || !inputValue.trim()}
          className="w-24"
        >
          {isSubmitting ? (
            <span className="animate-pulse">...</span>
          ) : (
            <>
              Send <Send className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
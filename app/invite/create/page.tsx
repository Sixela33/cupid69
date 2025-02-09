"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import React from 'react'

export default function Create() {
    const [prompt, setPrompt] = React.useState('')
    const supabase = createClient()

    // TODO NAVIGATE TO CHAT AFTER CREATION
    const handleSubmit = async () => {
        const { data, error } = await supabase.from('ChatRooms')
        .insert({system_message: prompt})
        .select('id')
    }

    return (
        <div>
            <h1>Make your cupid</h1>
            <Input 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                placeholder="Enter your prompt" 
                type="text"
                name="search"
            />
            <Button onClick={handleSubmit}>Submit</Button>
        </div>
    )
}

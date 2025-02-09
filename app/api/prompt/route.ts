import { model } from '../model'
import { NextRequest, NextResponse } from 'next/server'
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createClient } from '@/utils/supabase/server';
import { chatMessage } from '@/app/invite/page';
import { MessageTypes } from '@/app/types';

export const POST = async (
  req: NextRequest,
) => {
    const data = await req.json();

    const { chat_id, system_message ,message } = data
    const history = data.history as chatMessage[]

    try {
        const supabase = await createClient()

        const messages = [            
            new SystemMessage(system_message),
        ]

        for (const msg of history) {
            if(msg.role == MessageTypes.USER.toString()) {
                messages.push(new HumanMessage(msg.message))
            }
            if(msg.role === MessageTypes.ASSISTANT) {
                messages.push(new SystemMessage(msg.message)) 
            }
        }

        messages.push(new HumanMessage(message))

        await supabase.from('Messages').insert([{ 
            chat_id: chat_id,
            message: message,
            role: MessageTypes.USER
        }])

        const response = await model.invoke(messages)

        await supabase.from('Messages').insert([{ 
            chat_id: chat_id,
            message: response.content,
            role: MessageTypes.ASSISTANT
        }])
        return NextResponse.json(response.content, { status: 200 });
    } catch (error) {
        console.log(error)
    }
}

// Add other HTTP method handlers as needed
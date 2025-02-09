"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Loader2, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function Create() {
    const [prompt, setPrompt] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const supabase = createClient()
    const router = useRouter()

    const handleSubmit = async () => {
        if (!prompt.trim()) {
            setError('Please enter a description for your Cupid')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const { data, error } = await supabase
                .from('ChatRooms')
                .insert({ system_message: prompt.trim() })
                .select('id')

            if (error) throw error

            if (data && data[0]) {
                router.push(`/invite?key=${data[0].id}`)
            }
        } catch (err) {
            setError('Failed to create your Cupid. Please try again.')
            console.error('Error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-4">
            <div className="max-w-2xl mx-auto pt-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <Card className="shadow-lg">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <Heart className="h-12 w-12 text-pink-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Your Cupid</h1>
                        <p className="text-gray-600 mt-2">
                            Describe your perfect AI companion. Be specific about their personality,
                            interests, and how they should interact with you.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <label 
                                htmlFor="prompt" 
                                className="block text-sm font-medium text-gray-700"
                            >
                                Companion Description
                            </label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="E.g., A caring and witty companion who loves art and deep conversations..."
                                className="h-32 resize-none w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end space-x-4">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || !prompt.trim()}
                            className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Cupid'
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
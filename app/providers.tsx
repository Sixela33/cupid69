'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react'
import { ReactNode } from 'react';

const queryClient = new QueryClient()

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
  )
}

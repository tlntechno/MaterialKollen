import React from 'react'
import Nav from './Nav'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <main>
            <Nav />
            {children}
        </main>
    )
}

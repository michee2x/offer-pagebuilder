"use client"

import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleCredentialsLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })

        if (result?.error) {
            setIsLoading(false)
            alert("Invalid email or password") // MVP simple alert
        } else {
            router.push('/builder')
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-muted/20">
            <div className="w-full max-w-md space-y-8 rounded-lg border bg-background p-8 shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Sign in to the OfferIQ Builder
                    </p>
                </div>

                <div className="space-y-4">
                    <form onSubmit={handleCredentialsLogin} className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required placeholder="john@example.com" />
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                         </div>
                         <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Sign In to Workspace
                         </Button>
                    </form>

                    <div className="text-center text-sm pt-4">
                        Don't have an account?{" "}
                        <Link href="/signup" className="font-semibold text-primary hover:underline">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { register } from "@/app/actions/auth"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            const result = await register(formData)
            if (result?.error) {
                alert(result.error)
                setIsLoading(false)
            }
        } catch (error) {
            console.error("Signup error:", error)
            alert("An unexpected error occurred. Please try again.")
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-muted/20">
            <div className="w-full max-w-md space-y-8 rounded-lg border bg-background p-8 shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Create an Account</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Sign up to start building beautiful pages using OfferIQ AI.
                    </p>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" required placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    
                    <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign Up
                    </Button>
                </form>

                <div className="text-center text-sm pt-4">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}

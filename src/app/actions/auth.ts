'use server'

import { createAdminClient } from "@/utils/supabase/admin"
import { hash } from "bcryptjs"
import { redirect } from "next/navigation"

export async function register(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    const supabase = createAdminClient()

    // Check if user exists
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

    if (existingUser) {
        return { error: 'User already exists' }
    }

    const hashedPassword = await hash(password, 10)

    const { error } = await supabase
        .from('users')
        .insert({
            email,
            name,
            password: hashedPassword
        })

    if (error) {
        console.error('Registration error details:', JSON.stringify(error, null, 2))
        return { error: `Failed to create user: ${error.message || 'Unknown DB error'}` }
    }

    redirect('/login?registered=true')
}

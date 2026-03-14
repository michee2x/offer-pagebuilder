import { getSession } from "@/auth"
import { redirect } from "next/navigation"

export default async function BuilderLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    // Top-level authentication guard logic
    const session = await getSession()

    if (!session || !session.user) {
        redirect('/login')
    }

    // Now all code inside `/builder/page.tsx` correctly represents an Authenticated session!
    return (
      <>
        {children}
      </>
    )
}

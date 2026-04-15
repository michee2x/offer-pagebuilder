import { NextResponse } from 'next/server'
import { getSession } from '@/auth'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession()
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { data: page, error } = await supabase
        .from('builder_pages')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

    return NextResponse.json({ page })
  } catch(error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

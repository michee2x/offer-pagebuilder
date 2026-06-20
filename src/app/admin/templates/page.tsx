import { getSession } from '@/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminTemplatesPage() {
  const session = await getSession();
  if (!session) return redirect('/login');

  const supabaseAdmin = createAdminClient();
  const { data: userRecord } = await supabaseAdmin
    .from('users')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();

  if (!userRecord?.is_admin) {
    return redirect('/workspaces');
  }

  const { data: templates } = await supabaseAdmin
    .from('funnel_templates')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Templates</h1>
          <p className="text-gray-500 mt-2">Create and edit funnel templates for your users.</p>
        </div>
        <Link 
          href="/admin/templates/new"
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          Create New Template
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates && templates.length > 0 ? (
              templates.map((template: any) => (
                <tr key={template.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-500">{template.description || 'No description'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.category || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${template.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {template.is_active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/templates/${template.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Edit
                    </Link>
                    <Link href={`/builder?id=${template.id}&isTemplate=true`} target="_blank" className="text-gray-600 hover:text-gray-900">
                      Builder
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No templates found. Create one to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

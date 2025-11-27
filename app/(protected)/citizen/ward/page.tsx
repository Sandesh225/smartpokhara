// app/(protected)/citizen/ward/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithRoles } from '@/lib/auth/session';

export default async function WardPage() {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect('/login');
  }

  const supabase = await createClient();

  // Fetch user's ward information if available in profile
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('ward_id')
    .eq('user_id', user.id)
    .single();

  let userWard = null;
  if (userProfile?.ward_id) {
    const { data: ward } = await supabase
      .from('wards')
      .select('*')
      .eq('id', userProfile.ward_id)
      .single();
    userWard = ward;
  }

  // Fetch all wards for reference
  const { data: allWards } = await supabase
    .from('wards')
    .select('*')
    .eq('is_active', true)
    .order('ward_number');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Ward Information</h1>
        <p className="mt-2 text-gray-600">
          Information about municipal wards in Pokhara.
        </p>
      </div>

      {/* User's Ward Information */}
      {userWard ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Ward</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ward {userWard.ward_number} - {userWard.name}
              </h3>
              {userWard.name_nepali && (
                <p className="text-gray-600 mb-4">{userWard.name_nepali}</p>
              )}
              
              <div className="space-y-2">
                {userWard.office_address && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Office Address:</span>
                    <p className="text-sm text-gray-900">{userWard.office_address}</p>
                  </div>
                )}
                {userWard.contact_person && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Contact Person:</span>
                    <p className="text-sm text-gray-900">{userWard.contact_person}</p>
                  </div>
                )}
                {userWard.contact_phone && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Contact Phone:</span>
                    <p className="text-sm text-gray-900">{userWard.contact_phone}</p>
                  </div>
                )}
                {userWard.contact_email && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Contact Email:</span>
                    <p className="text-sm text-gray-900">{userWard.contact_email}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {userWard.population && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Population</p>
                  <p className="text-2xl font-bold text-blue-900">{userWard.population.toLocaleString()}</p>
                </div>
              )}
              {userWard.area_sq_km && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Area</p>
                  <p className="text-2xl font-bold text-green-900">{userWard.area_sq_km} km²</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Ward Not Set
          </h3>
          <p className="text-yellow-700">
            Your ward information is not set in your profile. 
            Please update your profile to see ward-specific information.
          </p>
        </div>
      )}

      {/* All Wards Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">All Wards of Pokhara</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allWards?.map((ward) => (
            <div
              key={ward.id}
              className={`border rounded-lg p-4 ${
                userWard?.id === ward.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-medium text-gray-900">
                Ward {ward.ward_number} - {ward.name}
              </h3>
              {ward.name_nepali && (
                <p className="text-sm text-gray-600">{ward.name_nepali}</p>
              )}
              {ward.contact_phone && (
                <p className="text-sm text-gray-500 mt-2">{ward.contact_phone}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
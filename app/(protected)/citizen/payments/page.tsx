/**
 * Citizen payments placeholder page
 */

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Bills & Payments</h1>
        <p className="mt-2 text-gray-600">
          View and pay your municipal bills and taxes.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💳</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Payment System Coming Soon
          </h3>
          <p className="text-gray-500">
            We're working on integrating the bill payment system. You'll be able
            to view and pay your municipal bills here soon.
          </p>
        </div>
      </div>
    </div>
  );
}

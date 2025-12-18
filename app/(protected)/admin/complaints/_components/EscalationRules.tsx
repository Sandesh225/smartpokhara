export function EscalationRules() {
  return (
    <div className="p-4 border rounded bg-gray-50">
      <h3 className="font-bold text-sm text-red-600">Escalation Policy</h3>
      <p className="text-xs text-gray-500 mt-2">Automatic escalation triggers if SLA breached by 24 hours.</p>
    </div>
  );
}
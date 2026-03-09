export default function RecordingsPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Recordings</h1>
                <p className="text-slate-600">Access all your meeting recordings</p>
            </div>

            <div className="grid gap-6">
                {/* Recordings content will go here */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="text-center text-slate-500">
                        <p>No recordings available yet</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

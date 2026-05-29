import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center border border-slate-200">
        <h1 className="text-3xl font-bold text-teal-600 mb-2">DocPrescribe</h1>
        <p className="text-slate-600 mb-6">Professional Prescription Generator for Physicians.</p>
        
        <Link 
          href="/dashboard" 
          className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
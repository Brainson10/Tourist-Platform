"use client";

export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,_#f8f5ef_0%,_#f5efe4_45%,_#eef6f2_100%)] px-6 text-center text-slate-800">
      <h2 className="text-2xl font-semibold">Something went wrong.</h2>
      <p className="mt-3 max-w-md text-base leading-7 text-slate-600">The platform foundation is ready, but an unexpected runtime error occurred.</p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Try again
      </button>
    </div>
  );
}

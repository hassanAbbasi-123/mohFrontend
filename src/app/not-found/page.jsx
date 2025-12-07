import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-400 mb-6 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or you need to log in to access it.
      </p>
      <Link
        href="/login"
        className="py-2 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-[#A259FF] to-[#6A4CFF] hover:opacity-90 transition-all duration-300"
      >
        Go to Login
      </Link>
    </div>
  );
}
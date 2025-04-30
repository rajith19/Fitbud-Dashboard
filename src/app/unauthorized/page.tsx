// app/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600">Unauthorized</h1>
        <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
      </div>
    </div>
  );
}

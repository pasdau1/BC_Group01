// components/Layout.jsx
export default function Layout({ children }) {
    return (
      <div className="min-h-screen bg-bg text-text flex flex-col">
        {/* Kein separater Header mehr */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    );
  }
  
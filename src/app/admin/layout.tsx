import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel - Survey System',
  description: 'Administrative tools and system management',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center space-x-6">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
            <div className="flex space-x-4">
              <a 
                href="/admin/dev-tools" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dev Tools
              </a>
              <a 
                href="/dashboard" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to Dashboard
              </a>
            </div>
          </nav>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-60 min-h-screen flex-1 bg-gray-950 p-6">{children}</main>
    </div>
  );
}

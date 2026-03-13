export default function ClassroomLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex-1 overflow-auto bg-[#F7F8FA] min-h-[calc(100vh-4rem)]">
      {children}
    </main>
  )
}

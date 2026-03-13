import ConditionalFooter from '@/components/landing/ConditionalFooter'

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <ConditionalFooter />
    </>
  )
}

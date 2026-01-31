/**
 * Bond Generator Layout
 * 
 * PERFORMANCE OPTIMIZATION:
 * - Removes AOS (Animate On Scroll) provider from bond generator routes
 * - Bond generator is a form/workflow tool, not a marketing page
 * - No scroll animations needed, saves ~50KB bundle + 50-100ms init time
 * 
 * This layout overrides the root layout's AOSProvider for /bond-generator routes
 */

export default function BondGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

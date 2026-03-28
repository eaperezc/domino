export default function AccentText({
  children,
}: {
  children: React.ReactNode;
}) {
  return <span className="text-primary">{children}</span>;
}

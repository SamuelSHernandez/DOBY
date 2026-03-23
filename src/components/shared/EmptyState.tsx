interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <p className="py-12 text-center text-sm text-text-tertiary">{message}</p>
  );
}

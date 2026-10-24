export function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="error" role="alert">
      {message.trimEnd().replace(/\.+$/, "")}
    </p>
  );
}

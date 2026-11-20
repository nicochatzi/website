export const Prose: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="prose max-w-none prose-a:text-link prose-a:decoration-1 prose-a:underline-offset-3 dark:prose-invert">
      {children}
    </div>
  );
};

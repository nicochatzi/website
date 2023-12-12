import { cx } from "@/lib/utils";

export const Prose: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className={cx(
      "max-w-none prose prose-a:underline-offset-4",
      "prose-a:text-purple",
      "dark:prose-invert dark:prose-a:text-teal-deep",
    )}>
      {children}
    </div>
  );
};

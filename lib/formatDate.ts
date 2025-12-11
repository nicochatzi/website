import { format, parseISO } from "date-fns";

export const formatDate = (date: string): string =>
  format(parseISO(date), "dd/MM/yyyy");

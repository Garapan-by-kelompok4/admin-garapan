/** Shared layout tokens for mobile bottom-sheet detail dialogs. */
export const mobileSheetDialogClass =
  "!fixed !inset-x-0 !bottom-0 !top-auto !flex !h-[92dvh] !max-h-[92dvh] !w-full !max-w-none !flex-col !translate-x-0 !translate-y-0 overflow-hidden rounded-b-none rounded-t-2xl border-border bg-white p-0 shadow-sh-3 data-open:!zoom-in-100 data-closed:!zoom-out-100 sm:!left-1/2 sm:!top-1/2 sm:!bottom-auto sm:!flex sm:!h-auto sm:!max-h-[85vh] sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:rounded-xl";

export const mobileSheetShellClass = "flex min-h-0 flex-1 flex-col";

export const mobileSheetHandleClass =
  "flex shrink-0 justify-center pt-2.5 pb-1 sm:hidden";

export const mobileSheetScrollClass =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain";

export const mobileSheetBodyPaddingClass =
  "p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:p-6 sm:pb-6";

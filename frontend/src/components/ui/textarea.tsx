import * as React from 'react';

import { cn } from '~/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'min-h-[120px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground hover:border-primary/40 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 dark:hover:border-primary/40',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

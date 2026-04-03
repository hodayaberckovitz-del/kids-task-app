import * as React from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

function useMediaQuery(query) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    if (media.addEventListener) {
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    } else {
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [matches, query]);

  return matches;
}

export function MobileSelect({ children, value, onValueChange, placeholder, className, triggerClassName }) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Extract SelectItem children
  const items = React.Children.toArray(children).filter(
    child => React.isValidElement(child) && child.type === SelectItem
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              triggerClassName
            )}
          >
            <span className={cn(!value && "text-muted-foreground")}>
              {value 
                ? items.find(item => item.props.value === value)?.props.children || placeholder
                : placeholder
              }
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 opacity-50"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[60vh]">
          <div className="overflow-y-auto p-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
            <div className="space-y-2">
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onValueChange(item.props.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors",
                    value === item.props.value
                      ? "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-100"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                  )}
                >
                  {item.props.children}
                </button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: use regular Select
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("w-full", triggerClassName)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={className}>
        {children}
      </SelectContent>
    </Select>
  );
}

export { SelectItem } from "@/components/ui/select";
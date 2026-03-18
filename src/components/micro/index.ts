// ─────────────────────────────────────────────────────────────────────────────
// micro/index.ts  —  Barrel re-export of all shadcn UI primitives
//
// Import from here instead of @/components/ui/* for cleaner macro imports.
// e.g.  import { Button, Card, Badge } from '@/components/micro'
// ─────────────────────────────────────────────────────────────────────────────

// Core primitives used by macros
export { Button, buttonVariants } from '@/components/ui/button';
export { Badge, badgeVariants } from '@/components/ui/badge';
export {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
export {
  Avatar, AvatarFallback, AvatarImage,
  AvatarGroup, AvatarGroupCount, AvatarBadge,
} from '@/components/ui/avatar';
export { Separator } from '@/components/ui/separator';

// Inputs & Forms
export { Input } from '@/components/ui/input';
export { Label } from '@/components/ui/label';
export { Textarea } from '@/components/ui/textarea';
export {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectSeparator, SelectTrigger, SelectValue,
} from '@/components/ui/select';
export { Checkbox } from '@/components/ui/checkbox';
export { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
export { Switch } from '@/components/ui/switch';
export { Slider } from '@/components/ui/slider';

// Layout & Navigation
export { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
export { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
export { AspectRatio } from '@/components/ui/aspect-ratio';
export { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
export {
  Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
export {
  Pagination, PaginationContent, PaginationEllipsis,
  PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
export {
  NavigationMenu, NavigationMenuContent, NavigationMenuIndicator,
  NavigationMenuItem, NavigationMenuLink, NavigationMenuList,
  NavigationMenuTrigger, NavigationMenuViewport,
} from '@/components/ui/navigation-menu';

// Overlays & Popovers
export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
export { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
export { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
export { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';

// Menus
export { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
export { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@/components/ui/context-menu';
export { Menubar, MenubarCheckboxItem, MenubarContent, MenubarGroup, MenubarItem, MenubarLabel, MenubarMenu, MenubarPortal, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from '@/components/ui/menubar';
export { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';

// Data Display
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
export { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
export { Calendar } from '@/components/ui/calendar';
export { Progress } from '@/components/ui/progress';
export { Skeleton } from '@/components/ui/skeleton';
export { Toggle, toggleVariants } from '@/components/ui/toggle';
export { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Feedback
export { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

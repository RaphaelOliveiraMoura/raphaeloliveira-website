"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  ChevronsUpDown,
  Copy,
  Home,
  Info,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Trash2,
  User,
} from "lucide-react";

import { CodeBlock, MarkdownContent } from "@/components/content";
import {
  EmptyState,
  ImageCropUpload,
  KanbanBoard,
  type KanbanColumn as KanbanColumnType,
  Lightbox,
  LoadingButton,
  NotificationCenter,
  SortableList,
  VideoPlayer,
} from "@/components/shared";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { toast } from "@/lib/feedback";
import { useTranslations } from "@/lib/i18n";
import {
  CountUp,
  FadeIn,
  ScaleOnHover,
  StaggerChildren,
  StaggerItem,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  useNotifications as useNotificationsHook,
  useScrollSpy,
  useToggle,
} from "@/hooks";

const NAV_SECTIONS = [
  "basic",
  "form",
  "data",
  "navigation",
  "overlay",
  "layout",
  "feedback",
  "content",
  "advanced",
  "motion",
] as const;

function SectionTitle({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2 id={id} className="scroll-mt-20 text-2xl font-bold tracking-tight">
      {children}
    </h2>
  );
}

function ComponentCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const SAMPLE_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
    alt: "Landscape 1",
  },
  {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
    alt: "Landscape 2",
  },
  {
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
    alt: "Landscape 3",
  },
];

const INITIAL_SORTABLE_ITEMS = [
  { id: "1", label: "Design mockups" },
  { id: "2", label: "Write documentation" },
  { id: "3", label: "Review pull request" },
  { id: "4", label: "Fix bug #42" },
  { id: "5", label: "Deploy to staging" },
];

const INITIAL_KANBAN_COLUMNS: KanbanColumnType[] = [
  {
    id: "todo",
    title: "To Do",
    items: [
      {
        id: "k1",
        title: "Research competitor features",
        description: "Analyze top 5 competitors",
      },
      {
        id: "k2",
        title: "Create wireframes",
        description: "Low-fi mockups for new flow",
      },
    ],
  },
  {
    id: "progress",
    title: "In Progress",
    items: [
      {
        id: "k3",
        title: "Implement auth flow",
        description: "Login, register, reset password",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    items: [
      {
        id: "k4",
        title: "Setup CI/CD",
        description: "GitHub Actions pipeline",
      },
    ],
  },
];

export default function ComponentsGalleryPage() {
  const t = useTranslations("examples");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [sliderValue, setSliderValue] = useState([50]);
  const [isCollapsibleOpen, toggleCollapsible] = useToggle(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [sortableItems, setSortableItems] = useState(INITIAL_SORTABLE_ITEMS);
  const [kanbanColumns, setKanbanColumns] = useState(INITIAL_KANBAN_COLUMNS);

  const activeSection = useScrollSpy(NAV_SECTIONS);

  return (
    <div className="flex gap-8">
      {/* Sidebar Nav */}
      <nav className="hidden w-48 shrink-0 lg:block">
        <div className="sticky top-20 space-y-0.5">
          {NAV_SECTIONS.map((section) => {
            const isActive = activeSection === section;

            return (
              <a
                key={section}
                href={`#${section}`}
                className={cn(
                  "relative block rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="scroll-spy-indicator"
                    className="absolute inset-0 rounded-md bg-accent"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-10">
                  {t(`components.${section}`)}
                </span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("components.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("components.subtitle")}
          </p>
        </div>

        {/* === BASIC === */}
        <section className="space-y-6">
          <SectionTitle id="basic">{t("components.basic")}</SectionTitle>

          <ComponentCard title="Button">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="xs">XS</Button>
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Plus className="size-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button disabled>Disabled</Button>
                <LoadingButton loading>Loading</LoadingButton>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Badge">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </ComponentCard>

          <ComponentCard title="Input">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Default input" />
              <Input placeholder="Disabled" disabled />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="With icon" className="pl-9" />
              </div>
              <Input type="password" placeholder="Password" />
            </div>
          </ComponentCard>

          <ComponentCard title="Label & Textarea">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="demo-label">Label</Label>
                <Input id="demo-label" placeholder="Input with label" />
              </div>
              <div className="space-y-1">
                <Label>Textarea</Label>
                <Textarea placeholder="Write something..." rows={3} />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Separator">
            <div className="space-y-3">
              <p className="text-sm">Content above</p>
              <Separator />
              <p className="text-sm">Content below</p>
              <div className="flex h-8 items-center gap-4">
                <span className="text-sm">Left</span>
                <Separator orientation="vertical" />
                <span className="text-sm">Right</span>
              </div>
            </div>
          </ComponentCard>
        </section>

        {/* === FORM === */}
        <section className="space-y-6">
          <SectionTitle id="form">{t("components.form")}</SectionTitle>

          <ComponentCard title="Checkbox & Radio">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <Label>Checkbox</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="c1" defaultChecked />
                    <Label htmlFor="c1">Option A</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="c2" />
                    <Label htmlFor="c2">Option B</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Radio Group</Label>
                <RadioGroup defaultValue="r1">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="r1" id="r1" />
                    <Label htmlFor="r1">Option 1</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="r2" id="r2" />
                    <Label htmlFor="r2">Option 2</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Select">
            <div className="max-w-xs">
              <Select defaultValue="react">
                <SelectTrigger>
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="vue">Vue</SelectItem>
                  <SelectItem value="angular">Angular</SelectItem>
                  <SelectItem value="svelte">Svelte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ComponentCard>

          <ComponentCard title="Switch">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Switch id="sw1" defaultChecked />
                <Label htmlFor="sw1">Notifications</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="sw2" />
                <Label htmlFor="sw2">Dark mode</Label>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Slider">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Value: {sliderValue[0]}</Label>
                <Slider
                  min={0}
                  max={100}
                  value={sliderValue}
                  onValueChange={setSliderValue}
                />
              </div>
            </div>
          </ComponentCard>
        </section>

        {/* === DATA === */}
        <section className="space-y-6">
          <SectionTitle id="data">{t("components.data")}</SectionTitle>

          <ComponentCard title="Avatar">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar size="sm">
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarFallback>LG</AvatarFallback>
              </Avatar>
            </div>
          </ComponentCard>

          <ComponentCard title="Card">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description text</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Card content goes here.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>
          </ComponentCard>

          <ComponentCard title="Progress">
            <div className="space-y-4">
              <Progress value={25} />
              <Progress value={50} />
              <Progress value={75} />
              <Progress value={100} />
            </div>
          </ComponentCard>

          <ComponentCard title="Pagination">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </ComponentCard>

          <ComponentCard title="Calendar">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </div>
          </ComponentCard>
        </section>

        {/* === NAVIGATION === */}
        <section className="space-y-6">
          <SectionTitle id="navigation">
            {t("components.navigation")}
          </SectionTitle>

          <ComponentCard title="Accordion">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Is it styled?</AccordionTrigger>
                <AccordionContent>
                  Yes. It comes with default styles using Tailwind CSS.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is it animated?</AccordionTrigger>
                <AccordionContent>
                  Yes. It uses CSS animations for smooth transitions.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ComponentCard>

          <ComponentCard title="Breadcrumb">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">
                    <Home className="size-4" />
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Examples</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Components</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </ComponentCard>

          <ComponentCard title="Tabs">
            <Tabs defaultValue="tab1">
              <TabsList>
                <TabsTrigger value="tab1">Account</TabsTrigger>
                <TabsTrigger value="tab2">Password</TabsTrigger>
                <TabsTrigger value="tab3">Notifications</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="mt-3">
                <p className="text-sm text-muted-foreground">
                  Manage your account settings.
                </p>
              </TabsContent>
              <TabsContent value="tab2" className="mt-3">
                <p className="text-sm text-muted-foreground">
                  Change your password.
                </p>
              </TabsContent>
              <TabsContent value="tab3" className="mt-3">
                <p className="text-sm text-muted-foreground">
                  Configure notifications.
                </p>
              </TabsContent>
            </Tabs>
          </ComponentCard>
        </section>

        {/* === OVERLAY === */}
        <section className="space-y-6">
          <SectionTitle id="overlay">{t("components.overlay")}</SectionTitle>

          <ComponentCard title="Dialog">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog Title</DialogTitle>
                  <DialogDescription>
                    This is a dialog description explaining the action.
                  </DialogDescription>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Dialog content here.
                </p>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </ComponentCard>

          <ComponentCard title="Dropdown Menu">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Open Menu <MoreHorizontal className="ml-2 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 size-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 size-4" /> Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash2 className="mr-2 size-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ComponentCard>

          <ComponentCard title="Popover">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open Popover</Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="space-y-3">
                  <h4 className="font-medium">Popover Title</h4>
                  <p className="text-sm text-muted-foreground">
                    This is a popover with custom content.
                  </p>
                  <Input placeholder="Enter value..." />
                </div>
              </PopoverContent>
            </Popover>
          </ComponentCard>

          <ComponentCard title="Sheet">
            <div className="flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Right Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Sheet Title</SheetTitle>
                    <SheetDescription>Sheet description.</SheetDescription>
                  </SheetHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                      Sheet content here.
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Bottom Sheet</Button>
                </SheetTrigger>
                <SheetContent side="bottom">
                  <SheetHeader>
                    <SheetTitle>Bottom Sheet</SheetTitle>
                    <SheetDescription>Slides from bottom.</SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </div>
          </ComponentCard>

          <ComponentCard title="Tooltip">
            <div className="flex gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Bell className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Copy className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy to clipboard</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </div>
          </ComponentCard>
        </section>

        {/* === LAYOUT === */}
        <section className="space-y-6">
          <SectionTitle id="layout">{t("components.layout")}</SectionTitle>

          <ComponentCard title="Aspect Ratio">
            <div className="max-w-sm">
              <AspectRatio ratio={16 / 9}>
                <div className="flex h-full items-center justify-center rounded-md bg-muted">
                  <span className="text-sm text-muted-foreground">16:9</span>
                </div>
              </AspectRatio>
            </div>
          </ComponentCard>

          <ComponentCard title="Collapsible">
            <Collapsible
              open={isCollapsibleOpen}
              onOpenChange={toggleCollapsible}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">3 items</span>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <ChevronsUpDown className="size-4" />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <div className="mt-2 rounded-md border px-4 py-2 text-sm">
                Item 1 (always visible)
              </div>
              <CollapsibleContent className="mt-1 space-y-1">
                <div className="rounded-md border px-4 py-2 text-sm">
                  Item 2
                </div>
                <div className="rounded-md border px-4 py-2 text-sm">
                  Item 3
                </div>
              </CollapsibleContent>
            </Collapsible>
          </ComponentCard>

          <ComponentCard title="Scroll Area">
            <ScrollArea className="h-48 rounded-md border p-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="border-b py-2 text-sm">
                  Scroll item {i + 1}
                </div>
              ))}
            </ScrollArea>
          </ComponentCard>

          <ComponentCard title="Skeleton">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
          </ComponentCard>
        </section>

        {/* === FEEDBACK === */}
        <section className="space-y-6">
          <SectionTitle id="feedback">{t("components.feedback")}</SectionTitle>

          <ComponentCard title="Alert">
            <div className="space-y-3">
              <Alert>
                <Info className="size-4" />
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>
                  This is an informational alert.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Something went wrong.</AlertDescription>
              </Alert>
            </div>
          </ComponentCard>

          <ComponentCard title="Toast (Sonner)">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success("Success message")}
              >
                <CheckCircle className="mr-2 size-4" /> Success
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.error("Error message")}
              >
                <AlertTriangle className="mr-2 size-4" /> Error
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info("Info message")}
              >
                <Info className="mr-2 size-4" /> Info
              </Button>
            </div>
          </ComponentCard>

          <ComponentCard title="Empty State">
            <EmptyState
              icon={<Search className="size-8" />}
              title="No results found"
              description="Try adjusting your search or filter criteria."
              action={{
                label: "Clear filters",
                onClick: () => toast.info("Filters cleared"),
              }}
            />
          </ComponentCard>
        </section>

        {/* === CONTENT === */}
        <section className="space-y-6">
          <SectionTitle id="content">{t("components.content")}</SectionTitle>

          <ComponentCard title="Code Block">
            <CodeBlock
              code={`function greet(name: string) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Core Stack"));`}
              language="typescript"
            />
          </ComponentCard>

          <ComponentCard title="Markdown">
            <MarkdownContent
              content={`## Markdown Support

This is a **bold** text and this is *italic*.

- List item 1
- List item 2
- List item 3

\`inline code\` is also supported.`}
            />
          </ComponentCard>
        </section>

        {/* === ADVANCED === */}
        <section className="space-y-6">
          <SectionTitle id="advanced">{t("components.advanced")}</SectionTitle>

          <ComponentCard title={t("components.lightboxTitle")}>
            <p className="mb-3 text-sm text-muted-foreground">
              {t("components.lightboxDesc")}
            </p>
            <div className="flex gap-2">
              {SAMPLE_IMAGES.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element -- External demo URLs not compatible with next/image
                <img
                  key={i}
                  src={img.src}
                  alt={img.alt}
                  className="h-20 w-28 cursor-pointer rounded-md object-cover transition-opacity hover:opacity-80"
                  onClick={() => setLightboxOpen(true)}
                />
              ))}
            </div>
            <Lightbox
              images={SAMPLE_IMAGES}
              open={lightboxOpen}
              onOpenChange={setLightboxOpen}
            />
          </ComponentCard>

          <ComponentCard title={t("components.videoPlayerTitle")}>
            <p className="mb-3 text-sm text-muted-foreground">
              {t("components.videoPlayerDesc")}
            </p>
            <VideoPlayer
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
              className="aspect-video max-w-lg"
            />
          </ComponentCard>

          <ComponentCard title={t("components.notificationCenterTitle")}>
            <p className="mb-3 text-sm text-muted-foreground">
              {t("components.notificationCenterDesc")}
            </p>
            <div className="flex items-center gap-4">
              <NotificationCenter />
              <NotificationDemoButtons />
            </div>
          </ComponentCard>

          <ComponentCard title={t("components.imageCropTitle")}>
            <p className="mb-3 text-sm text-muted-foreground">
              {t("components.imageCropDesc")}
            </p>
            <ImageCropUpload
              onCropped={() => toast.success("Image cropped successfully!")}
              aspectRatio={16 / 9}
            />
          </ComponentCard>

          <ComponentCard title={t("components.sortableListTitle")}>
            <p className="mb-3 text-sm text-muted-foreground">
              {t("components.sortableListDesc")}
            </p>
            <SortableList
              items={sortableItems}
              onReorder={setSortableItems}
              renderItem={(item) => (
                <span className="text-sm">{item.label}</span>
              )}
              className="max-w-md"
            />
          </ComponentCard>

          <ComponentCard title={t("components.kanbanTitle")}>
            <p className="mb-3 text-sm text-muted-foreground">
              {t("components.kanbanDesc")}
            </p>
            <KanbanBoard
              columns={kanbanColumns}
              onMoveItem={(itemId, fromCol, toCol, newIndex) => {
                setKanbanColumns((prev) => {
                  const updated = prev.map((col) => ({
                    ...col,
                    items: [...col.items],
                  }));
                  const sourceCol = updated.find((c) => c.id === fromCol);
                  const targetCol = updated.find((c) => c.id === toCol);
                  if (!sourceCol || !targetCol) return prev;
                  const itemIdx = sourceCol.items.findIndex(
                    (i) => i.id === itemId,
                  );
                  if (itemIdx === -1) return prev;
                  const [item] = sourceCol.items.splice(itemIdx, 1);
                  if (item) targetCol.items.splice(newIndex, 0, item);
                  return updated;
                });
              }}
            />
          </ComponentCard>
        </section>

        {/* ===== MOTION ===== */}
        <section className="space-y-4">
          <SectionTitle id="motion">{t("components.motion")}</SectionTitle>

          <ComponentCard title={t("components.motionFadeIn")}>
            <FadeIn duration={0.5}>
              <div className="rounded-lg bg-primary/10 p-4 text-center text-sm font-medium">
                FadeIn Component
              </div>
            </FadeIn>
          </ComponentCard>

          <ComponentCard title={t("components.motionStagger")}>
            <StaggerChildren
              staggerDelay={0.08}
              className="grid grid-cols-4 gap-2"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <StaggerItem key={i}>
                  <div className="rounded-lg bg-primary/10 p-3 text-center text-sm font-bold">
                    {i}
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </ComponentCard>

          <ComponentCard title={t("components.motionScale")}>
            <div className="flex gap-3">
              {["Card A", "Card B", "Card C"].map((label) => (
                <ScaleOnHover key={label} scale={1.05}>
                  <div className="cursor-pointer rounded-lg border bg-card p-4 text-center text-sm shadow-sm">
                    {label}
                  </div>
                </ScaleOnHover>
              ))}
            </div>
          </ComponentCard>

          <ComponentCard title={t("components.motionCounter")}>
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  <CountUp end={42} duration={1.5} />
                </div>
                <p className="text-xs text-muted-foreground">Items</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  <CountUp end={1200} suffix="+" duration={2} />
                </div>
                <p className="text-xs text-muted-foreground">Users</p>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title={t("components.motionScrollProgress")}>
            <p className="text-sm text-muted-foreground">
              {t("components.motionScrollProgressDesc")}
            </p>
          </ComponentCard>

          <ComponentCard title={t("components.motionSkeleton")}>
            <div className="space-y-2">
              <div className="animate-shimmer h-4 w-3/4 rounded bg-gradient-to-r from-accent via-accent/50 to-accent bg-[length:200%_100%]" />
              <div className="animate-shimmer h-4 w-full rounded bg-gradient-to-r from-accent via-accent/50 to-accent bg-[length:200%_100%]" />
              <div className="animate-shimmer h-4 w-1/2 rounded bg-gradient-to-r from-accent via-accent/50 to-accent bg-[length:200%_100%]" />
            </div>
          </ComponentCard>
        </section>
      </div>
    </div>
  );
}

function NotificationDemoButtons() {
  const { addNotification } = useNotificationsHook();
  const t = useTranslations("examples");

  const categories = ["info", "success", "warning", "error"] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          size="sm"
          variant="outline"
          onClick={() =>
            addNotification({
              category,
              title: `${category.charAt(0).toUpperCase() + category.slice(1)} notification`,
              message: "This is a demo notification.",
            })
          }
        >
          {t("components.addNotification")} ({category})
        </Button>
      ))}
    </div>
  );
}

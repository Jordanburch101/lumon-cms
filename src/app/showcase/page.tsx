"use client";

import {
  Alert02Icon,
  GridViewIcon,
  InformationCircleIcon,
  Layers01Icon,
  ListViewIcon,
  Mail01Icon,
  PaintBoardIcon,
  Search01Icon,
  Settings01Icon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="font-semibold text-2xl tracking-tight">{title}</h2>
      <p className="mt-1 text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function ShowcaseSection({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <section className="space-y-6">
      <SectionHeading description={description} title={title} />
      {children}
    </section>
  );
}

/* ─── Typography ─── */
function TypographySection() {
  return (
    <ShowcaseSection
      description="Nunito Sans (sans) + Geist Mono (mono)"
      title="Typography"
    >
      <div className="space-y-4">
        <h1 className="font-bold text-5xl tracking-tight">Heading 1</h1>
        <h2 className="font-semibold text-4xl tracking-tight">Heading 2</h2>
        <h3 className="font-semibold text-3xl tracking-tight">Heading 3</h3>
        <h4 className="font-semibold text-2xl tracking-tight">Heading 4</h4>
        <h5 className="font-semibold text-xl tracking-tight">Heading 5</h5>
        <p className="text-base leading-relaxed">
          Body text — The macro data refinement department is responsible for
          the identification and processing of data deemed &quot;scary&quot; by
          the Board. Each refiner is assigned a specific set of numbers.
        </p>
        <p className="text-muted-foreground text-sm">
          Muted text — Your outie is a person you may not know or understand.
        </p>
        <p className="font-mono text-sm">
          Monospace — const severanceChip = await implant(employee);
        </p>
      </div>
    </ShowcaseSection>
  );
}

/* ─── Buttons ─── */
function ButtonsSection() {
  return (
    <ShowcaseSection description="All variants and sizes" title="Buttons">
      <div className="space-y-6">
        <div>
          <p className="mb-3 font-medium text-sm">Variants</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>
        <div>
          <p className="mb-3 font-medium text-sm">Sizes</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <HugeiconsIcon icon={Search01Icon} size={16} />
            </Button>
          </div>
        </div>
        <div>
          <p className="mb-3 font-medium text-sm">States</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Enabled</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </div>
    </ShowcaseSection>
  );
}

/* ─── Badges ─── */
function BadgesSection() {
  return (
    <ShowcaseSection description="Status labels and tags" title="Badges">
      <div className="flex flex-wrap items-center gap-3">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="ghost">Ghost</Badge>
      </div>
    </ShowcaseSection>
  );
}

/* ─── Form Inputs ─── */
function FormInputsSection() {
  return (
    <ShowcaseSection
      description="Input, textarea, select, checkbox, radio, switch, slider"
      title="Form Controls"
    >
      <div className="grid max-w-2xl gap-8">
        {/* Text Inputs */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Mark S." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="mark@lumon.com" type="email" />
          </div>
        </div>

        {/* Textarea */}
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Tell us about your experience on the severed floor..."
            rows={3}
          />
        </div>

        {/* Select */}
        <div className="space-y-2">
          <Label>Department</Label>
          <Select defaultValue="mdr">
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mdr">Macrodata Refinement</SelectItem>
              <SelectItem value="ond">Optics & Design</SelectItem>
              <SelectItem value="dar">Disposal & Reclamation</SelectItem>
              <SelectItem value="mn">Mammalians Nurturable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Checkbox & Radio */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <Label>Permissions</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox defaultChecked id="handbook" />
                <Label className="font-normal" htmlFor="handbook">
                  Read the handbook
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="wellness" />
                <Label className="font-normal" htmlFor="wellness">
                  Attend wellness sessions
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="waffle" />
                <Label className="font-normal" htmlFor="waffle">
                  Eligible for waffle party
                </Label>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Label>Incentive tier</Label>
            <RadioGroup defaultValue="finger">
              <div className="flex items-center gap-2">
                <RadioGroupItem id="finger" value="finger" />
                <Label className="font-normal" htmlFor="finger">
                  Finger traps
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="melon" value="melon" />
                <Label className="font-normal" htmlFor="melon">
                  Melon bar
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="waffle-party" value="waffle-party" />
                <Label className="font-normal" htmlFor="waffle-party">
                  Waffle party
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Switch */}
        <div className="space-y-4">
          <Label>Preferences</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-normal" htmlFor="notifications">
                Email notifications
              </Label>
              <Switch defaultChecked id="notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-normal" htmlFor="dark-mode">
                Dark mode
              </Label>
              <Switch id="dark-mode" />
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-4">
          <Label>Refinement intensity</Label>
          <Slider defaultValue={[65]} max={100} />
        </div>
      </div>
    </ShowcaseSection>
  );
}

/* ─── Cards ─── */
function CardsSection() {
  return (
    <ShowcaseSection description="Content containers" title="Cards">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Macrodata Refinement</CardTitle>
            <CardDescription>Department overview and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              4 active refiners processing scary numbers across multiple data
              sets. Current completion rate at 97.3%.
            </p>
          </CardContent>
          <CardFooter>
            <Button size="sm">View details</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wellness Check</CardTitle>
            <CardDescription>Session scheduled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary">Pending</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Counselor</span>
                <span>Ms. Casey</span>
              </div>
              <Progress value={40} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>MDR floor personnel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Mark S.", role: "Lead", initials: "MS" },
                { name: "Helly R.", role: "Refiner", initials: "HR" },
                { name: "Irving B.", role: "Refiner", initials: "IB" },
                { name: "Dylan G.", role: "Refiner", initials: "DG" },
              ].map((member) => (
                <div className="flex items-center gap-3" key={member.initials}>
                  <Avatar size="sm">
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ShowcaseSection>
  );
}

/* ─── Mock Forms ─── */
function MockFormsSection() {
  return (
    <ShowcaseSection description="Complete form examples" title="Example Forms">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Access your severed floor workstation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Employee ID</Label>
              <Input id="login-email" placeholder="mark.scout@lumon.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Access Code</Label>
              <Input
                id="login-password"
                placeholder="Enter access code"
                type="password"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label className="font-normal text-sm" htmlFor="remember">
                Remember this workstation
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full">Begin Session</Button>
            <Button className="w-full" variant="ghost">
              Forgot access code?
            </Button>
          </CardFooter>
        </Card>

        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your innie preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarImage src="/testimonials/avatar-1.jpg" />
                <AvatarFallback>MS</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Mark S.</p>
                <p className="text-muted-foreground text-sm">
                  Macrodata Refinement
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input defaultValue="Mark S." id="display-name" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select defaultValue="lead">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Department Lead</SelectItem>
                  <SelectItem value="refiner">Refiner</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                defaultValue="I enjoy every moment of my work day."
                id="bio"
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-normal" htmlFor="public-profile">
                Public profile
              </Label>
              <Switch defaultChecked id="public-profile" />
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>
      </div>
    </ShowcaseSection>
  );
}

/* ─── Alerts ─── */
function AlertsSection() {
  return (
    <ShowcaseSection
      description="Informational and status messages"
      title="Alerts"
    >
      <div className="max-w-2xl space-y-4">
        <Alert>
          <HugeiconsIcon icon={InformationCircleIcon} size={16} />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            Your refinement session will begin in 5 minutes.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} size={16} />
          <AlertTitle>Protocol Violation</AlertTitle>
          <AlertDescription>
            Unauthorized communication detected between departments. Please
            report to the Break Room.
          </AlertDescription>
        </Alert>
      </div>
    </ShowcaseSection>
  );
}

/* ─── Avatars ─── */
function AvatarsSection() {
  return (
    <ShowcaseSection description="User representations" title="Avatars">
      <div className="space-y-6">
        <div>
          <p className="mb-3 font-medium text-sm">Sizes</p>
          <div className="flex items-center gap-4">
            <Avatar size="sm">
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>LG</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div>
          <p className="mb-3 font-medium text-sm">Group</p>
          <AvatarGroup>
            <Avatar>
              <AvatarImage src="/testimonials/avatar-1.jpg" />
              <AvatarFallback>MS</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="/testimonials/avatar-2.jpg" />
              <AvatarFallback>HR</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="/testimonials/avatar-3.jpg" />
              <AvatarFallback>IB</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="/testimonials/avatar-4.jpg" />
              <AvatarFallback>DG</AvatarFallback>
            </Avatar>
          </AvatarGroup>
        </div>
      </div>
    </ShowcaseSection>
  );
}

/* ─── Table ─── */
function TableSection() {
  return (
    <ShowcaseSection description="Data display" title="Table">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Quota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  name: "Mark S.",
                  dept: "MDR",
                  status: "Active",
                  quota: "97.3%",
                },
                {
                  name: "Helly R.",
                  dept: "MDR",
                  status: "Active",
                  quota: "84.1%",
                },
                {
                  name: "Irving B.",
                  dept: "MDR",
                  status: "Wellness",
                  quota: "91.7%",
                },
                {
                  name: "Dylan G.",
                  dept: "MDR",
                  status: "Overtime",
                  quota: "99.2%",
                },
                {
                  name: "Burt G.",
                  dept: "O&D",
                  status: "Retired",
                  quota: "100%",
                },
              ].map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.dept}</TableCell>
                  <TableCell>
                    <Badge
                      variant={(() => {
                        if (row.status === "Active") {
                          return "default";
                        }
                        if (row.status === "Retired") {
                          return "outline";
                        }
                        return "secondary";
                      })()}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{row.quota}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ShowcaseSection>
  );
}

/* ─── Tabs ─── */
function TabsSection() {
  return (
    <ShowcaseSection description="Content organization" title="Tabs">
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            <TabsContent className="mt-4 space-y-3" value="overview">
              <p className="text-sm">
                Macrodata Refinement processes an average of 1,247 data points
                per session. The department maintains a 97.3% accuracy rate.
              </p>
              <Progress value={97} />
            </TabsContent>
            <TabsContent className="mt-4" value="analytics">
              <p className="text-sm">
                Analytics content would appear here with charts and metrics.
              </p>
            </TabsContent>
            <TabsContent className="mt-4" value="reports">
              <p className="text-sm">
                Reports content would appear here with downloadable files.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </ShowcaseSection>
  );
}

/* ─── Accordion ─── */
function AccordionSection() {
  return (
    <ShowcaseSection
      description="Collapsible content sections"
      title="Accordion"
    >
      <div className="max-w-2xl">
        <Accordion collapsible type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is macrodata refinement?</AccordionTrigger>
            <AccordionContent>
              Macrodata refinement is the process by which Lumon employees sort
              data on their computers. The exact nature and purpose of the data
              is unknown to the refiners.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How does severance work?</AccordionTrigger>
            <AccordionContent>
              The severance procedure involves the implantation of a chip that
              separates work memories from personal memories. Your
              &quot;innie&quot; only exists on the severed floor.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>What are the core principles?</AccordionTrigger>
            <AccordionContent>
              The core principles of Lumon are: Vision, Verve, Wit, Cheer,
              Humility, Benevolence, Nimbleness, Probity, and Wiles — as
              established by our founder, Kier Eagan.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ShowcaseSection>
  );
}

/* ─── Toggles & Dialog ─── */
function InteractiveSection() {
  return (
    <ShowcaseSection
      description="Toggles, tooltips, and dialogs"
      title="Interactive Elements"
    >
      <div className="space-y-6">
        <div>
          <p className="mb-3 font-medium text-sm">Toggle buttons</p>
          <div className="flex items-center gap-1">
            <Toggle aria-label="Bold" size="sm">
              <HugeiconsIcon icon={TextBoldIcon} size={16} />
            </Toggle>
            <Toggle aria-label="Italic" size="sm">
              <HugeiconsIcon icon={TextItalicIcon} size={16} />
            </Toggle>
            <Toggle aria-label="Underline" size="sm">
              <HugeiconsIcon icon={TextUnderlineIcon} size={16} />
            </Toggle>
            <Separator className="mx-2 h-6" orientation="vertical" />
            <Toggle aria-label="Grid view" size="sm" variant="outline">
              <HugeiconsIcon icon={GridViewIcon} size={16} />
            </Toggle>
            <Toggle aria-label="List view" size="sm" variant="outline">
              <HugeiconsIcon icon={ListViewIcon} size={16} />
            </Toggle>
          </div>
        </div>

        <div>
          <p className="mb-3 font-medium text-sm">Tooltips</p>
          <TooltipProvider>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="outline">
                    <HugeiconsIcon icon={UserIcon} size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Profile</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="outline">
                    <HugeiconsIcon icon={Settings01Icon} size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="outline">
                    <HugeiconsIcon icon={Mail01Icon} size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Messages</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        <div>
          <p className="mb-3 font-medium text-sm">Dialog</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Severance Agreement</DialogTitle>
                <DialogDescription>
                  By proceeding, you acknowledge that your innie and outie will
                  have no shared memories of each other&apos;s experiences.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="agree" />
                  <Label className="font-normal" htmlFor="agree">
                    I understand and accept the severance protocol
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Decline</Button>
                </DialogClose>
                <Button>Accept & Proceed</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ShowcaseSection>
  );
}

/* ─── Color Palette ─── */
function ColorPaletteSection() {
  return (
    <ShowcaseSection
      description="Semantic oklch tokens from globals.css"
      title="Color Tokens"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { name: "Background", bg: "bg-background", border: true },
          { name: "Foreground", bg: "bg-foreground" },
          { name: "Primary", bg: "bg-primary" },
          { name: "Secondary", bg: "bg-secondary", border: true },
          { name: "Muted", bg: "bg-muted", border: true },
          { name: "Accent", bg: "bg-accent", border: true },
          { name: "Destructive", bg: "bg-destructive" },
          { name: "Card", bg: "bg-card", border: true },
          { name: "Border", bg: "bg-border" },
          { name: "Ring", bg: "bg-ring" },
          { name: "Chart 1", bg: "bg-chart-1" },
          { name: "Chart 2", bg: "bg-chart-2" },
          { name: "Chart 3", bg: "bg-chart-3" },
          { name: "Chart 4", bg: "bg-chart-4" },
          { name: "Chart 5", bg: "bg-chart-5" },
        ].map((color) => (
          <div className="space-y-2" key={color.name}>
            <div
              className={`h-16 rounded-lg ${color.bg} ${color.border ? "border" : ""}`}
            />
            <p className="font-mono text-muted-foreground text-xs">
              {color.name}
            </p>
          </div>
        ))}
      </div>
    </ShowcaseSection>
  );
}

/* ─── Icons Sample ─── */
function IconsSection() {
  return (
    <ShowcaseSection description="Hugeicons (@hugeicons/react)" title="Icons">
      <div className="flex flex-wrap items-center gap-4">
        {[
          { icon: UserIcon, name: "UserIcon" },
          { icon: Settings01Icon, name: "Settings01Icon" },
          { icon: Mail01Icon, name: "Mail01Icon" },
          { icon: Search01Icon, name: "Search01Icon" },
          { icon: Alert02Icon, name: "Alert02Icon" },
          { icon: InformationCircleIcon, name: "InformationCircleIcon" },
          { icon: PaintBoardIcon, name: "PaintBoardIcon" },
          { icon: Layers01Icon, name: "Layers01Icon" },
        ].map(({ icon, name }) => (
          <div
            className="flex flex-col items-center gap-2 rounded-lg border p-3"
            key={name}
          >
            <HugeiconsIcon className="text-foreground" icon={icon} size={24} />
            <span className="font-mono text-[10px] text-muted-foreground">
              {name}
            </span>
          </div>
        ))}
      </div>
    </ShowcaseSection>
  );
}

/* ─── Page ─── */
export default function ShowcasePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 lg:px-6">
      <div>
        <h1 className="font-bold text-4xl tracking-tight sm:text-5xl">
          UI Component Showcase
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          A comprehensive reference of all design system primitives, tokens, and
          patterns used in this project.
        </p>
      </div>

      <Separator />
      <ColorPaletteSection />
      <Separator />
      <TypographySection />
      <Separator />
      <IconsSection />
      <Separator />
      <ButtonsSection />
      <Separator />
      <BadgesSection />
      <Separator />
      <FormInputsSection />
      <Separator />
      <CardsSection />
      <Separator />
      <MockFormsSection />
      <Separator />
      <AlertsSection />
      <Separator />
      <AvatarsSection />
      <Separator />
      <TableSection />
      <Separator />
      <TabsSection />
      <Separator />
      <AccordionSection />
      <Separator />
      <InteractiveSection />
    </div>
  );
}

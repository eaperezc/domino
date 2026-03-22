"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { theme } from "@/lib/theme";
import { Info, AlertTriangle, CircleAlert } from "lucide-react";

const THEME_COLORS = [
  { label: "pageBg", value: theme.pageBg },
  { label: "pageText", value: theme.pageText },
  { label: "pageTextMuted", value: theme.pageTextMuted },
  { label: "surfaceBg", value: theme.surfaceBg },
  { label: "surfaceBorder", value: theme.surfaceBorder },
  { label: "panelBg", value: theme.panelBg },
  { label: "panelBorder", value: theme.panelBorder },
  { label: "accentPrimary", value: theme.accentPrimary },
  { label: "accentHover", value: theme.accentHover },
  { label: "accentMuted", value: theme.accentMuted },
  { label: "btnPrimary", value: theme.btnPrimary },
  { label: "btnDraw", value: theme.btnDraw },
  { label: "btnPass", value: theme.btnPass },
  { label: "turnActive", value: theme.turnActive },
  { label: "turnInactive", value: theme.turnInactive },
  { label: "destructive (CSS)", value: "var(--destructive)" },
];

const CSS_VARS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--border",
  "--input",
  "--ring",
];

export default function ThemePage() {
  const [inputVal, setInputVal] = useState("");

  return (
    <div className="flex-1 overflow-auto p-8 space-y-12 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold mb-2">Theme & Component Library</h1>
        <p className="text-muted-foreground">Review all colors and components in one place.</p>
      </div>

      {/* ── CSS Variable Colors ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">CSS Variables (shadcn)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {CSS_VARS.map((v) => (
            <div key={v} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border border-border shrink-0"
                style={{ backgroundColor: `var(${v})` }}
              />
              <span className="text-xs font-mono text-muted-foreground truncate">{v}</span>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Game Theme Colors ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Game Theme (colors.ts)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {THEME_COLORS.map((c) => (
            <div key={c.label} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border border-border shrink-0"
                style={{ backgroundColor: c.value }}
              />
              <div className="min-w-0">
                <span className="text-xs font-mono text-foreground block truncate">{c.label}</span>
                <span className="text-xs font-mono text-muted-foreground block truncate">{c.value}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Typography ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Typography</h2>
        <div className="space-y-2">
          <p className="text-3xl font-bold">Heading 3xl bold</p>
          <p className="text-2xl font-semibold">Heading 2xl semibold</p>
          <p className="text-xl font-semibold">Heading xl semibold</p>
          <p className="text-lg font-medium">Text lg medium</p>
          <p className="text-base">Text base (default)</p>
          <p className="text-sm text-muted-foreground">Text sm muted</p>
          <p className="text-xs text-muted-foreground">Text xs muted</p>
        </div>
      </section>

      <Separator />

      {/* ── Buttons ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="info">Info</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">Game Buttons</h3>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="warning">Draw</Button>
          <Button variant="destructive">Pass</Button>
        </div>
      </section>

      <Separator />

      {/* ── Inputs ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Inputs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="demo-text">Text Input</Label>
            <Input id="demo-text" placeholder="Type something..." value={inputVal} onChange={(e) => setInputVal(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-email">Email</Label>
            <Input id="demo-email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-password">Password</Label>
            <Input id="demo-password" type="password" placeholder="At least 6 characters" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-disabled">Disabled</Label>
            <Input id="demo-disabled" disabled placeholder="Can't edit" />
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Cards ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description text goes here.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Card content with some body text.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Another Card</CardTitle>
              <CardDescription>With different content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="card-input">Inside a card</Label>
                <Input id="card-input" placeholder="Input in card" />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button size="sm">Save</Button>
              <Button size="sm" variant="outline">Cancel</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <Separator />

      {/* ── Tabs ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Tabs</h2>
        <Tabs defaultValue="tab1" className="max-w-md">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="pt-4">
            <p className="text-sm text-muted-foreground">Content for tab 1.</p>
          </TabsContent>
          <TabsContent value="tab2" className="pt-4">
            <p className="text-sm text-muted-foreground">Content for tab 2.</p>
          </TabsContent>
          <TabsContent value="tab3" className="pt-4">
            <p className="text-sm text-muted-foreground">Content for tab 3.</p>
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

      {/* ── Alerts ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Alerts</h2>
        <div className="space-y-3 max-w-lg">
          <Alert>
            <Info />
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>This is a default informational alert.</AlertDescription>
          </Alert>
          <Alert variant="info">
            <Info />
            <AlertTitle>Info Alert</AlertTitle>
            <AlertDescription>Here is some useful information for you.</AlertDescription>
          </Alert>
          <Alert variant="warning">
            <AlertTriangle />
            <AlertTitle>Warning Alert</AlertTitle>
            <AlertDescription>Heads up — this needs your attention.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>Destructive Alert</AlertTitle>
            <AlertDescription>Something went wrong. Please try again.</AlertDescription>
          </Alert>
        </div>
      </section>

      <Separator />

      {/* ── Badges ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      <Separator />

      {/* ── Switch ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Switch</h2>
        <div className="flex items-center gap-3">
          <Switch id="demo-switch" />
          <Label htmlFor="demo-switch">Toggle me</Label>
        </div>
      </section>

      <Separator />

      {/* ── Misc ── */}
      <section className="space-y-4 pb-12">
        <h2 className="text-xl font-semibold">Text Colors</h2>
        <div className="space-y-1">
          <p className="text-foreground">text-foreground</p>
          <p className="text-muted-foreground">text-muted-foreground</p>
          <p className="text-primary">text-primary</p>
          <p className="text-secondary-foreground">text-secondary-foreground</p>
          <p className="text-accent-foreground">text-accent-foreground</p>
          <p className="text-destructive">text-destructive</p>
        </div>
      </section>
    </div>
  );
}

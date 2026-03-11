"use client";

import { useState, useMemo } from "react";
import {
  PhoneCall,
  ShieldAlert,
  Flame,
  Ambulance,
  Search,
  Copy,
  Navigation,
  ExternalLink,
  Info,
  MapPin,
  AlertTriangle,
  PhoneForwarded,
  HeartPulse,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PRIMARY_EMERGENCY = [
  {
    id: "police",
    title: "Police",
    number: "100",
    icon: ShieldAlert,
    color: "bg-primary",
  },
  {
    id: "fire",
    title: "Fire Brigade",
    number: "101",
    icon: Flame,
    color: "bg-destructive",
  },
  {
    id: "ambulance",
    title: "Ambulance",
    number: "102",
    icon: Ambulance,
    color: "bg-primary",
  },
];

const CONTACT_GROUPS = [
  {
    category: "Major Hospitals",
    contacts: [
      { name: "Western Regional Hospital", number: "061-520461", location: "Ramghat" },
      { name: "Manipal Teaching Hospital", number: "061-526416", location: "Phulbari" },
      { name: "Gandaki Medical College", number: "061-538595", location: "Prithvi Chowk" },
      { name: "Charak Memorial Hospital", number: "061-533333", location: "Nayasarak" },
    ],
  },
  {
    category: "Security & Disaster",
    contacts: [
      { name: "District Police (Kaski)", number: "061-524081", location: "Gairapatan" },
      { name: "Tourist Police Pokhara", number: "061-521087", location: "Lakeside" },
      { name: "Armed Police Force", number: "061-520485", location: "Kalikasthan" },
      { name: "District Administration", number: "061-520033", location: "Sahid Chowk" },
    ],
  },
  {
    category: "Utilities & Services",
    contacts: [
      { name: "NEA (Electricity) Office", number: "061-520144", location: "Kundahar" },
      { name: "Water Supply (NWSC)", number: "061-520110", location: "Bindhyabasini" },
      { name: "Pokhara Metro Office", number: "061-521105", location: "New Road" },
    ],
  },
];

export default function EmergencyPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const copyToClipboard = (num: string) => {
    navigator.clipboard.writeText(num);
    toast.success("Number Copied", {
      description: `${num} is now in your clipboard.`,
      icon: <Copy className="h-4 w-4" />,
    });
  };

  const filteredGroups = useMemo(() => {
    return CONTACT_GROUPS.map((group) => ({
      ...group,
      contacts: group.contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.location.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter((group) => group.contacts.length > 0);
  }, [searchQuery]);

  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="space-y-8">
        {/* Header */}
        <header className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold uppercase tracking-widest shadow-xs">
            <AlertTriangle className="h-4 w-4 animate-pulse" /> 24/7 Response Center
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            Emergency <span className="text-destructive">Contacts</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Immediate assistance for police, medical, or fire emergencies in Pokhara Metropolitan City.
          </p>
        </header>

        {/* Primary Emergency Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRIMARY_EMERGENCY.map((item, idx) => (
            <div
              key={item.id}
              className="animate-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <Card className={cn(
                "relative overflow-hidden border-0 rounded-2xl text-primary-foreground shadow-xl transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5",
                item.color
              )}>
                <CardContent className="p-5 sm:p-6 flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-background/20 backdrop-blur-sm flex items-center justify-center">
                    <item.icon className="h-8 w-8 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                      {item.title}
                    </p>
                    <p className="text-4xl font-bold tracking-tighter">
                      {item.number}
                    </p>
                  </div>
                  <Button
                    asChild
                    className="w-full h-12 rounded-xl bg-background text-foreground hover:bg-muted font-bold text-base transition-all duration-200 active:scale-[0.98]"
                  >
                    <a href={`tel:${item.number}`}>
                      <PhoneCall className="mr-3 h-5 w-5 text-destructive" /> CALL NOW
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-8">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-5 sm:p-6 rounded-2xl border border-border shadow-sm">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search hospital or department..."
                  className="pl-12 h-11 rounded-xl border-border focus-visible:ring-ring bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <Navigation className="h-4 w-4" /> Pokhara Metro
              </div>
            </div>

            {/* Contact Groups */}
            {filteredGroups.map((group) => (
              <section key={group.category} className="space-y-4 animate-fade-in">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  {group.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {group.contacts.map((contact) => (
                    <Card
                      key={contact.name}
                      className="group rounded-2xl border border-border bg-card hover:border-primary/20 hover:shadow-md transition-all duration-200"
                    >
                      <CardContent className="p-5 sm:p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                            {group.category.includes("Hospital") ? (
                              <HeartPulse className="h-5 w-5" />
                            ) : (
                              <PhoneForwarded className="h-5 w-5" />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="font-medium text-foreground truncate text-sm">
                              {contact.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-primary font-bold text-sm">
                                {contact.number}
                              </span>
                              <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                              <span className="text-xs text-muted-foreground">
                                {contact.location}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 rounded-xl hover:bg-accent hover:text-accent-foreground"
                            onClick={() => copyToClipboard(contact.number)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            asChild
                            size="icon"
                            className="h-9 w-9 rounded-xl bg-foreground hover:bg-foreground/90 text-background"
                          >
                            <a href={`tel:${contact.number}`}>
                              <PhoneCall className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <Card className="rounded-2xl border-0 bg-primary text-primary-foreground shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Info className="h-20 w-20" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg font-bold tracking-tight">
                  Reporting Protocol
                </CardTitle>
                <CardDescription className="text-primary-foreground/70">
                  Follow these steps for faster response.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                {[
                  { step: "01", title: "Identify Location", desc: "Know your nearest landmark or ward number." },
                  { step: "02", title: "State Clearly", desc: "Briefly explain the type of emergency." },
                  { step: "03", title: "Stay Active", desc: "Keep your line clear for a callback." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 group">
                    <span className="text-2xl font-bold text-primary-foreground/30 group-hover:text-primary-foreground transition-colors duration-200">
                      {item.step}
                    </span>
                    <div className="space-y-1">
                      <p className="font-semibold text-sm uppercase tracking-wider">
                        {item.title}
                      </p>
                      <p className="text-xs text-primary-foreground/70 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-2 border-dashed border-border bg-card p-5 sm:p-6 text-center space-y-4">
              <div className="mx-auto h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground text-sm">Ward Directory</h4>
                <p className="text-xs text-muted-foreground">
                  Need specific ward officer contact information?
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl border-border font-medium bg-transparent"
                asChild
              >
                <a href="/citizen/wards">
                  View Ward List <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </a>
              </Button>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

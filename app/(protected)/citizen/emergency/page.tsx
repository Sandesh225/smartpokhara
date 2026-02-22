"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    color: "bg-blue-600",
    shadow: "shadow-blue-500/40",
  },
  {
    id: "fire",
    title: "Fire Brigade",
    number: "101",
    icon: Flame,
    color: "bg-red-600",
    shadow: "shadow-red-500/40",
  },
  {
    id: "ambulance",
    title: "Ambulance",
    number: "102",
    icon: Ambulance,
    color: "bg-emerald-600",
    shadow: "shadow-emerald-500/40",
  },
];

const CONTACT_GROUPS = [
  {
    category: "Major Hospitals",
    contacts: [
      {
        name: "Western Regional Hospital",
        number: "061-520461",
        location: "Ramghat",
      },
      {
        name: "Manipal Teaching Hospital",
        number: "061-526416",
        location: "Phulbari",
      },
      {
        name: "Gandaki Medical College",
        number: "061-538595",
        location: "Prithvi Chowk",
      },
      {
        name: "Charak Memorial Hospital",
        number: "061-533333",
        location: "Nayasarak",
      },
    ],
  },
  {
    category: "Security & Disaster",
    contacts: [
      {
        name: "District Police (Kaski)",
        number: "061-524081",
        location: "Gairapatan",
      },
      {
        name: "Tourist Police Pokhara",
        number: "061-521087",
        location: "Lakeside",
      },
      {
        name: "Armed Police Force",
        number: "061-520485",
        location: "Kalikasthan",
      },
      {
        name: "District Administration",
        number: "061-520033",
        location: "Sahid Chowk",
      },
    ],
  },
  {
    category: "Utilities & Services",
    contacts: [
      {
        name: "NEA (Electricity) Office",
        number: "061-520144",
        location: "Kundahar",
      },
      {
        name: "Water Supply (NWSC)",
        number: "061-520110",
        location: "Bindhyabasini",
      },
      {
        name: "Pokhara Metro Office",
        number: "061-521105",
        location: "New Road",
      },
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
    <div className="min-h-screen bg-slate-50/50 pb-20 relative overflow-hidden">
      <div className="absolute top-[-5%] left-[-10%] w-[600px] h-[600px] bg-red-400/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 py-10 max-w-6xl relative z-10">
        <header className="mb-12 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-black uppercase tracking-wider shadow-sm"
          >
            <AlertTriangle className="h-4 w-4 animate-pulse" /> 24/7 Response
            Center
          </motion.div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-none">
            Emergency <span className="text-red-600">Contacts</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
            Immediate assistance for police, medical, or fire emergencies in
            Pokhara Metropolitan City.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PRIMARY_EMERGENCY.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Card
                className={cn(
                  "relative overflow-hidden border-0 rounded-[2.5rem] text-white shadow-2xl transition-all duration-300",
                  item.color,
                  item.shadow
                )}
              >
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="h-20 w-20 rounded-[1.5rem] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                    <item.icon
                      className="h-10 w-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest opacity-80">
                      {item.title}
                    </p>
                    <p className="text-5xl font-black tracking-tighter">
                      {item.number}
                    </p>
                  </div>
                  <Button
                    asChild
                    className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black text-lg transition-transform active:scale-95"
                  >
                    <a href={`tel:${item.number}`}>
                      <PhoneCall className="mr-3 h-5 w-5 text-red-600" /> CALL
                      NOW
                    </a>
                  </Button>
                </CardContent>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/50 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200 shadow-sm">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search hospital or department..."
                  className="pl-12 h-12 rounded-xl border-slate-200 focus:ring-4 focus:ring-blue-50 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Navigation className="h-4 w-4" /> Pokhara Metro
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredGroups.map((group) => (
                <motion.section
                  key={group.category}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] ml-4">
                    {group.category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.contacts.map((contact) => (
                      <Card
                        key={contact.name}
                        className="group rounded-[1.5rem] border-2 border-slate-100 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
                      >
                        <CardContent className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              {group.category.includes("Hospital") ? (
                                <HeartPulse className="h-6 w-6" />
                              ) : (
                                <PhoneForwarded className="h-6 w-6" />
                              )}
                            </div>
                            <div className="truncate">
                              <p className="font-bold text-slate-900 truncate">
                                {contact.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-blue-600 font-black text-sm">
                                  {contact.number}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                <span className="text-xs font-bold text-slate-400 uppercase">
                                  {contact.location}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-10 w-10 rounded-xl hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => copyToClipboard(contact.number)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              asChild
                              size="icon"
                              className="h-10 w-10 rounded-xl bg-slate-900 hover:bg-black text-white"
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
                </motion.section>
              ))}
            </AnimatePresence>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <Card className="rounded-[2rem] border-0 bg-slate-900 text-white shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Info className="h-24 w-24" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-black tracking-tight">
                  Reporting Protocol
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Follow these steps for faster response.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                {[
                  {
                    step: "01",
                    title: "Identify Location",
                    desc: "Know your nearest landmark or ward number.",
                  },
                  {
                    step: "02",
                    title: "State Clearly",
                    desc: "Briefly explain the type of emergency.",
                  },
                  {
                    step: "03",
                    title: "Stay Active",
                    desc: "Keep your line clear for a callback.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 group">
                    <span className="text-2xl font-black text-blue-500/50 group-hover:text-blue-500 transition-colors">
                      {item.step}
                    </span>
                    <div className="space-y-1">
                      <p className="font-bold text-sm uppercase tracking-wider">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-white/50 p-8 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">Ward Directory</h4>
                <p className="text-xs text-slate-500">
                  Need specific ward officer contact information?
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl border-slate-200 font-bold bg-transparent"
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
    </div>
  );
}

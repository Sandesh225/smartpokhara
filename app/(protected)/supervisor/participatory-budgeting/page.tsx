"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { 
  Loader2, Search, Inbox, CheckCircle2, XCircle, 
  MapPin, DollarSign, Calendar, Building, Briefcase,
  Filter, TrendingUp, Clock, Eye, Sparkles, ArrowRight,
  FileText, AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { pbService, type BudgetCycle, type BudgetProposal } from "@/lib/supabase/queries/participatory-budgeting";

export default function SupervisorProposalsPage() {
  const [cycles, setCycles] = useState<BudgetCycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<string>("");
  const [proposals, setProposals] = useState<BudgetProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    pbService.getActiveCycles().then(data => {
      setCycles(data);
      if (data.length > 0) setSelectedCycle(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCycle) return;
    setLoading(true);
    // Pass NULL to fetch ALL proposals visible via RLS
    pbService.getProposals(selectedCycle, null)
      .then(setProposals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCycle]);

  // Derived State for Tabs
  const pendingProposals = proposals.filter(p => p.status === 'submitted' || p.status === 'under_review');
  const processedProposals = proposals.filter(p => p.status !== 'submitted' && p.status !== 'under_review');
  
  // Filtering
  const filterProposals = (list: BudgetProposal[]) => {
    if (!searchTerm) return list;
    return list.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.author?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const ProposalCard = ({ proposal }: { proposal: BudgetProposal }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary bg-gradient-to-br from-card to-card/95 hover:from-card/95 hover:to-primary/5 dark:hover:to-primary/10 mb-4">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge 
                variant="outline" 
                className="capitalize bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium"
              >
                {proposal.category.replace(/_/g, ' ')}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/50 dark:bg-muted/30 px-2 py-1 rounded-full">
                <Calendar className="w-3 h-3" />
                {format(new Date(proposal.created_at), "MMM d, yyyy")}
              </span>
              {proposal.department && (
                <Badge variant="outline" className="flex items-center gap-1 bg-background/50 dark:bg-background/30 backdrop-blur-sm">
                  <Building className="w-3 h-3" />
                  {proposal.department.name}
                </Badge>
              )}
            </div>
            
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
              {proposal.title}
            </h3>
            
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {proposal.description}
            </p>
            
            <div className="flex items-center gap-5 text-sm flex-wrap pt-2">
              <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 dark:bg-muted/20 px-3 py-1.5 rounded-full">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                <span className="truncate max-w-[150px] font-medium">
                  {proposal.address_text || "No location"}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  NPR {proposal.estimated_cost.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="text-xs">by</span>
                <span className="font-medium text-foreground">{proposal.author?.full_name}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between gap-4 min-w-[160px]">
            {proposal.status === 'submitted' ? (
              <Badge className="bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-950 dark:to-amber-950 text-yellow-800 dark:text-yellow-300 hover:from-yellow-200 hover:to-amber-200 dark:hover:from-yellow-900 dark:hover:to-amber-900 border-yellow-300 dark:border-yellow-700 shadow-sm font-semibold px-3 py-1.5">
                <Clock className="w-3 h-3 mr-1" />
                Pending Review
              </Badge>
            ) : proposal.status === 'approved_for_voting' ? (
              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950 text-green-800 dark:text-green-300 hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-900 dark:hover:to-emerald-900 border-green-300 dark:border-green-700 shadow-sm font-semibold px-3 py-1.5">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Approved
              </Badge>
            ) : (
              <Badge variant="secondary" className="capitalize font-medium px-3 py-1.5">
                {proposal.status.replace(/_/g, ' ')}
              </Badge>
            )}
            
            <Button 
              asChild 
              size="lg" 
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300 group/btn font-semibold"
            >
              <Link href={`/supervisor/participatory-budgeting/${proposal.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Review
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 px-4 sm:px-6">
      {/* Enhanced Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent border border-primary/20 dark:border-primary/30 p-8 shadow-lg">
        <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-black/10 [mask-image:radial-gradient(white,transparent_85%)]" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/20 dark:bg-primary/30 rounded-xl">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Vetting Inbox
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Review and approve citizen proposals for the upcoming ballot.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Fiscal Cycle:
            </span>
            <Select value={selectedCycle} onValueChange={setSelectedCycle}>
              <SelectTrigger className="w-[220px] bg-background/80 dark:bg-background/50 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 transition-colors shadow-md">
                <SelectValue placeholder="Select Cycle" />
              </SelectTrigger>
              <SelectContent>
                {cycles.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {c.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 dark:bg-blue-600/20 rounded-full -mr-16 -mt-16" />
          <CardContent className="p-6 flex items-center gap-4 relative">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg">
              <Inbox className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Pending Review
              </p>
              <p className="text-3xl font-black text-blue-700 dark:text-blue-400">
                {pendingProposals.length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 dark:bg-green-600/20 rounded-full -mr-16 -mt-16" />
          <CardContent className="p-6 flex items-center gap-4 relative">
            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-1 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Approved
              </p>
              <p className="text-3xl font-black text-green-700 dark:text-green-400">
                {proposals.filter(p => p.status === 'approved_for_voting').length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30 border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/10 dark:bg-red-600/20 rounded-full -mr-16 -mt-16" />
          <CardContent className="p-6 flex items-center gap-4 relative">
            <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl shadow-lg">
              <XCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" />
                Rejected
              </p>
              <p className="text-3xl font-black text-red-700 dark:text-red-400">
                {proposals.filter(p => p.status === 'rejected').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Enhanced Search Bar */}
        <Card className="bg-gradient-to-r from-muted/50 via-muted/30 to-transparent dark:from-muted/30 dark:via-muted/20 dark:to-transparent border-muted-foreground/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 relative">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search proposals by title or author..." 
                  className="pl-12 pr-4 h-12 bg-background/80 dark:bg-background/50 backdrop-blur-sm border-2 border-muted-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="lg"
                className="gap-2 bg-background/80 dark:bg-background/50 backdrop-blur-sm border-2 hover:bg-muted/50 dark:hover:bg-muted/30"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[500px] mb-8 h-12 bg-muted/50 dark:bg-muted/30 p-1 rounded-xl">
            <TabsTrigger 
              value="pending" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold rounded-lg transition-all duration-300"
            >
              <Clock className="w-4 h-4 mr-2" />
              Pending ({pendingProposals.length})
            </TabsTrigger>
            <TabsTrigger 
              value="processed" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold rounded-lg transition-all duration-300"
            >
              <FileText className="w-4 h-4 mr-2" />
              Processed ({processedProposals.length})
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 dark:from-primary/30 dark:to-purple-500/30 blur-3xl animate-pulse" />
                <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10 mb-4" />
              </div>
              <p className="text-base text-muted-foreground font-medium">Loading proposals...</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Please wait</p>
            </div>
          ) : (
            <>
              <TabsContent value="pending" className="space-y-4 mt-6">
                {pendingProposals.length === 0 ? (
                  <Card className="text-center py-16 border-2 border-dashed rounded-2xl bg-gradient-to-br from-muted/20 via-muted/10 to-transparent dark:from-muted/10 dark:via-muted/5 dark:to-transparent">
                    <CardContent className="space-y-4">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 blur-2xl rounded-full" />
                        <div className="relative p-6 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl">
                          <Inbox className="w-16 h-16 text-primary mx-auto opacity-60" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                          All Caught Up! 🎉
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          No pending proposals for your review at the moment. Great job staying on top of things!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filterProposals(pendingProposals).length === 0 ? (
                      <Card className="text-center py-12 border-dashed">
                        <CardContent>
                          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-muted-foreground">No proposals match your search</p>
                        </CardContent>
                      </Card>
                    ) : (
                      filterProposals(pendingProposals).map(p => <ProposalCard key={p.id} proposal={p} />)
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="processed" className="space-y-4 mt-6">
                {processedProposals.length === 0 ? (
                  <Card className="text-center py-12 border-2 border-dashed rounded-2xl bg-muted/10 dark:bg-muted/5">
                    <CardContent>
                      <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">No processed proposals yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filterProposals(processedProposals).length === 0 ? (
                      <Card className="text-center py-12 border-dashed">
                        <CardContent>
                          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-muted-foreground">No proposals match your search</p>
                        </CardContent>
                      </Card>
                    ) : (
                      filterProposals(processedProposals).map(p => <ProposalCard key={p.id} proposal={p} />)
                    )}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
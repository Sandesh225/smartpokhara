"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  ArrowLeft, Users, FileText, ThumbsUp, DollarSign,
  TrendingUp, BarChart3, PieChart, Activity,
  Eye, Download, Filter, Search, Calendar,
  CheckCircle2, XCircle, Clock, AlertCircle,
  MapPin, Building, Loader2, Sparkles
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Domain Features
import { 
  useBudgetCycle, 
  usePBProposals, 
  usePBAnalytics,
  type BudgetProposal, 
  type BudgetCycle 
} from "@/features/participatory-budgeting";

interface VoteData {
  id: string;
  voter_id: string;
  proposal_id: string;
  voted_at: string;
  voter?: {
    email: string;
    full_name: string;
  };
  proposal?: {
    title: string;
    category: string;
  };
}

interface ProposalStats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byDepartment: Record<string, number>;
  totalEstimatedCost: number;
  totalTechnicalCost: number;
  averageCost: number;
}

interface VoteStats {
  total: number;
  uniqueVoters: number;
  averageVotesPerProposal: number;
  votingRate: number;
}

export default function AdminAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.cycleId as string;

  // Domain Hooks
  const { data: cycle, isLoading: cycleLoading, error: cycleError } = useBudgetCycle(cycleId);
  const { data: proposals = [], isLoading: proposalsLoading } = usePBProposals(cycleId);
  
  const loading = cycleLoading || proposalsLoading;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const votes: VoteData[] = [];
  proposals.forEach(p => {
    // Generate mock vote entries based on vote_count if needed for the table
    for (let i = 0; i < p.vote_count; i++) {
      votes.push({
        id: `${p.id}-vote-${i}`,
        voter_id: `voter-${i}`,
        proposal_id: p.id,
        voted_at: p.created_at,
        proposal: {
          title: p.title,
          category: p.category
        }
      });
    }
  });

  // Calculate statistics
  const proposalStats: ProposalStats = {
    total: proposals.length,
    byStatus: proposals.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byCategory: proposals.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byDepartment: proposals.reduce((acc, p) => {
      const dept = p.department?.name || "Unassigned";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    totalEstimatedCost: proposals.reduce((sum, p) => sum + p.estimated_cost, 0),
    totalTechnicalCost: proposals.reduce((sum, p) => sum + (p.technical_cost || p.estimated_cost), 0),
    averageCost: proposals.length > 0 
      ? proposals.reduce((sum, p) => sum + p.estimated_cost, 0) / proposals.length 
      : 0
  };

  const voteStats: VoteStats = {
    total: votes.length,
    uniqueVoters: new Set(votes.map(v => v.voter_id)).size,
    averageVotesPerProposal: proposals.length > 0 
      ? votes.length / proposals.length 
      : 0,
    votingRate: proposals.length > 0 
      ? (proposals.filter(p => p.vote_count > 0).length / proposals.length) * 100 
      : 0
  };

  // Filter proposals
  const filteredProposals = proposals.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 dark:from-primary/30 dark:to-purple-500/30 blur-3xl animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-base text-muted-foreground font-medium animate-pulse">
          Loading analytics data...
        </p>
      </div>
    );
  }

  if (!cycle) return null;

  return (
    <div className="container mx-auto py-8 max-w-7xl space-y-8 px-4 sm:px-6">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/admin/participatory-budgeting/${cycleId}`)}
          className="pl-0 hover:pl-2 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Control Center
        </Button>

        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent border border-primary/20 p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 dark:bg-primary/30 rounded-xl">
                <BarChart3 className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Analytics & Monitoring
                </h1>
                <p className="text-muted-foreground mt-1">{cycle.title}</p>
              </div>
            </div>

            <Button className="bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-200 dark:bg-blue-900 rounded-xl">
                <FileText className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
              Total Proposals
            </p>
            <p className="text-4xl font-black text-blue-700 dark:text-blue-400">
              {proposalStats.total}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
              Avg cost: NPR{" "}
              {proposalStats.averageCost.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-200 dark:bg-green-900 rounded-xl">
                <ThumbsUp className="w-6 h-6 text-green-700 dark:text-green-300" />
              </div>
              <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-1">
              Total Votes
            </p>
            <p className="text-4xl font-black text-green-700 dark:text-green-400">
              {voteStats.total}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-2">
              {voteStats.averageVotesPerProposal.toFixed(1)} avg per proposal
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-200 dark:bg-purple-900 rounded-xl">
                <Users className="w-6 h-6 text-purple-700 dark:text-purple-300" />
              </div>
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-1">
              Unique Voters
            </p>
            <p className="text-4xl font-black text-purple-700 dark:text-purple-400">
              {voteStats.uniqueVoters}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-500 mt-2">
              {voteStats.votingRate.toFixed(1)}% voting rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200 dark:border-orange-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-200 dark:bg-orange-900 rounded-xl">
                <DollarSign className="w-6 h-6 text-orange-700 dark:text-orange-300" />
              </div>
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-1">
              Total Budget Request
            </p>
            <p className="text-4xl font-black text-orange-700 dark:text-orange-400">
              {(proposalStats.totalEstimatedCost / 10000000).toFixed(1)}Cr
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-500 mt-2">
              Technical:{" "}
              {(proposalStats.totalTechnicalCost / 10000000).toFixed(1)}Cr
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="proposals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-3xl bg-muted/50 dark:bg-muted/30 p-1 h-12 rounded-xl">
          <TabsTrigger
            value="proposals"
            className="data-[state=active]:bg-linear-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
          >
            <FileText className="w-4 h-4 mr-2" />
            Proposals
          </TabsTrigger>
          <TabsTrigger
            value="votes"
            className="data-[state=active]:bg-linear-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            Votes
          </TabsTrigger>
          <TabsTrigger
            value="distribution"
            className="data-[state=active]:bg-linear-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
          >
            <PieChart className="w-4 h-4 mr-2" />
            Distribution
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="data-[state=active]:bg-linear-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Proposals Tab */}
        <TabsContent value="proposals" className="space-y-6">
          <Card className="shadow-xl bg-gradient-to-br from-card to-card/95">
            <CardHeader className="bg-gradient-to-br from-muted/30 to-transparent dark:from-muted/20 border-b">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    All Proposals
                  </CardTitle>
                  <CardDescription>
                    Showing {filteredProposals.length} of {proposals.length}{" "}
                    proposals
                  </CardDescription>
                </div>

                <div className="flex gap-2 flex-wrap w-full md:w-auto">
                  <div className="relative flex-1 md:flex-none md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search proposals..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved_for_voting">
                        Approved
                      </SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="selected">Selected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="road_infrastructure">Roads</SelectItem>
                      <SelectItem value="water_sanitation">Water</SelectItem>
                      <SelectItem value="waste_management">Waste</SelectItem>
                      <SelectItem value="electricity">Electricity</SelectItem>
                      <SelectItem value="health_safety">Health</SelectItem>
                      <SelectItem value="parks_environment">Parks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 dark:bg-muted/30">
                      <TableHead className="font-bold">Title</TableHead>
                      <TableHead className="font-bold">Category</TableHead>
                      <TableHead className="font-bold">Department</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold text-right">
                        Cost
                      </TableHead>
                      <TableHead className="font-bold text-right">
                        Votes
                      </TableHead>
                      <TableHead className="font-bold">Submitted</TableHead>
                      <TableHead className="font-bold text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProposals.map((proposal) => (
                      <TableRow
                        key={proposal.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium max-w-[300px]">
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground truncate">
                              {proposal.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              by {proposal.author?.full_name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="capitalize text-xs"
                          >
                            {proposal.category.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Building className="w-3 h-3 text-muted-foreground" />
                            <span>{proposal.department?.name || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {proposal.status === "approved_for_voting" ? (
                            <Badge className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Approved
                            </Badge>
                          ) : proposal.status === "rejected" ? (
                            <Badge className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Rejected
                            </Badge>
                          ) : proposal.status === "submitted" ? (
                            <Badge className="bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="capitalize">
                              {proposal.status.replace(/_/g, " ")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          NPR {proposal.estimated_cost.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <ThumbsUp className="w-3 h-3 text-primary" />
                            <span className="font-bold">
                              {proposal.vote_count}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(proposal.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/participatory-budgeting/${cycleId}/proposals/${proposal.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Votes Tab */}
        <TabsContent value="votes" className="space-y-6">
          <Card className="shadow-xl bg-gradient-to-br from-card to-card/95">
            <CardHeader className="bg-gradient-to-br from-muted/30 to-transparent dark:from-muted/20 border-b">
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-primary" />
                Vote Activity Log
              </CardTitle>
              <CardDescription>
                Recent voting activity - {votes.length} total votes
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 dark:bg-muted/30">
                      <TableHead className="font-bold">Voter ID</TableHead>
                      <TableHead className="font-bold">Proposal</TableHead>
                      <TableHead className="font-bold">Category</TableHead>
                      <TableHead className="font-bold">Voted At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {votes.slice(0, 50).map((vote) => (
                      <TableRow
                        key={vote.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-mono text-xs">
                          {vote.voter_id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium max-w-[300px] truncate">
                          {vote.proposal?.title || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="capitalize text-xs"
                          >
                            {vote.proposal?.category?.replace(/_/g, " ") ||
                              "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(vote.voted_at), "MMM d, yyyy HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card className="shadow-xl bg-gradient-to-br from-card to-card/95">
              <CardHeader className="bg-gradient-to-br from-muted/30 to-transparent dark:from-muted/20 border-b">
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {Object.entries(proposalStats.byStatus).map(
                  ([status, count]) => {
                    const percentage = (count / proposalStats.total) * 100;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold capitalize">
                            {status.replace(/_/g, " ")}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-muted-foreground">
                              {count} proposals
                            </span>
                            <span className="text-xs font-bold text-primary">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-primary to-primary/70 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="shadow-xl bg-gradient-to-br from-card to-card/95">
              <CardHeader className="bg-gradient-to-br from-muted/30 to-transparent dark:from-muted/20 border-b">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {Object.entries(proposalStats.byCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => {
                    const percentage = (count / proposalStats.total) * 100;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold capitalize">
                            {category.replace(/_/g, " ")}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-muted-foreground">
                              {count} proposals
                            </span>
                            <span className="text-xs font-bold text-primary">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>

            {/* Department Distribution */}
            <Card className="md:col-span-2 shadow-xl bg-gradient-to-br from-card to-card/95">
              <CardHeader className="bg-gradient-to-br from-muted/30 to-transparent dark:from-muted/20 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  Department Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(proposalStats.byDepartment)
                    .sort(([, a], [, b]) => b - a)
                    .map(([department, count]) => {
                      const percentage = (count / proposalStats.total) * 100;
                      return (
                        <div key={department} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold">
                              {department}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-medium text-muted-foreground">
                                {count}
                              </span>
                              <span className="text-xs font-bold text-primary">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-purple-500 to-purple-600 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card className="shadow-xl bg-gradient-to-br from-card to-card/95">
            <CardHeader className="bg-gradient-to-br from-muted/30 to-transparent dark:from-muted/20 border-b">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Submission Timeline
              </CardTitle>
              <CardDescription>Proposals submitted over time</CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="space-y-4">
                {proposals
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  )
                  .slice(0, 20)
                  .map((proposal, idx) => (
                    <div
                      key={proposal.id}
                      className="flex items-center gap-4 p-4 border-2 rounded-xl hover:bg-muted/50 hover:border-primary/30 transition-all group"
                    >
                      <div className="text-xs font-bold text-muted-foreground w-24 shrink-0">
                        {format(new Date(proposal.created_at), "MMM d, HH:mm")}
                      </div>
                      <div className="h-8 w-0.5 bg-linear-to-b from-primary to-primary/30" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                          {proposal.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {proposal.category.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            by {proposal.author?.full_name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <ThumbsUp className="w-4 h-4 text-primary" />
                        <span className="font-bold">{proposal.vote_count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
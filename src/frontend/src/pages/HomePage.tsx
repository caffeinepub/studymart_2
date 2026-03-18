import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Search,
  Star,
  Upload,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import NoteCard from "../components/NoteCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useBuyStudyNote,
  useGetPurchasedNotes,
  useGetStudyNotes,
  useGetSubjects,
} from "../hooks/useQueries";

const SAMPLE_SUBJECTS = [
  "All",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "English",
  "Computer Science",
];

export default function HomePage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: notes = [], isLoading: notesLoading } = useGetStudyNotes();
  const { data: purchasedNotes = [] } = useGetPurchasedNotes();
  const { data: backendSubjects = [] } = useGetSubjects();
  const buyNote = useBuyStudyNote();

  const subjects =
    backendSubjects.length > 0 ? ["All", ...backendSubjects] : SAMPLE_SUBJECTS;

  const myPrincipal = identity?.getPrincipal().toString();

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSubject =
        selectedSubject === "All" || note.subject === selectedSubject;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        note.title.toLowerCase().includes(q) ||
        note.description.toLowerCase().includes(q) ||
        note.subject.toLowerCase().includes(q);
      return matchesSubject && matchesSearch;
    });
  }, [notes, selectedSubject, searchQuery]);

  const purchasedIds = new Set(purchasedNotes.map((n) => n.id));

  const handleBuy = async (noteId: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to buy notes");
      return;
    }
    try {
      await buyNote.mutateAsync(noteId);
      toast.success("Note purchased successfully! 🎉");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("credits") || msg.includes("insufficient")) {
        toast.error("Not enough credits!", {
          description: "Buy more credits to continue.",
          action: {
            label: "Buy Credits",
            onClick: () => {
              window.location.href = "/credits";
            },
          },
        });
      } else {
        toast.error(`Failed to purchase note: ${msg}`);
      }
    }
  };

  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden gradient-hero"
        data-ocid="home.section"
      >
        <img
          src="/assets/generated/studymart-hero.dim_1200x400.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Star className="w-3 h-3 mr-1" /> Trusted by 10,000+ students
              </Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold leading-tight mb-4">
              The Marketplace for
              <span className="block text-accent"> Study Notes</span>
            </h1>
            <p className="text-white/80 text-lg mb-8">
              Buy and sell high-quality study notes. Learn from the best, earn
              from your hard work.
            </p>
            <div className="flex flex-wrap gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/upload">
                    <Button
                      size="lg"
                      className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold gap-2"
                      data-ocid="home.primary_button"
                    >
                      <Upload className="w-5 h-5" /> Start Selling
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 gap-2"
                    onClick={() =>
                      document
                        .getElementById("explore")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    data-ocid="home.secondary_button"
                  >
                    <BookOpen className="w-5 h-5" /> Browse Notes
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/">
                    <Button
                      size="lg"
                      className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold gap-2"
                      onClick={() => {}}
                      data-ocid="home.primary_button"
                    >
                      <GraduationCap className="w-5 h-5" /> Get Started Free
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 gap-2"
                    onClick={() =>
                      document
                        .getElementById("explore")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    data-ocid="home.secondary_button"
                  >
                    <BookOpen className="w-5 h-5" /> Explore Notes
                  </Button>
                </>
              )}
            </div>
          </motion.div>
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-6 mt-12"
          >
            {[
              {
                icon: BookOpen,
                label: "Notes Available",
                value: `${notes.length}+ Notes`,
              },
              { icon: Users, label: "Active Students", value: "10K+ Students" },
              { icon: Star, label: "Rating", value: "4.9/5 Rating" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3"
              >
                <Icon className="w-5 h-5 text-accent" />
                <div>
                  <div className="font-display font-bold">{value}</div>
                  <div className="text-white/60 text-xs">{label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Explore Section */}
      <section
        id="explore"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-56 shrink-0">
            <div className="sticky top-20">
              <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Subjects
              </h2>
              <div className="flex flex-row flex-wrap lg:flex-col gap-2">
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    type="button"
                    className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedSubject === subject
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"
                    }`}
                    data-ocid="home.tab"
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="font-display font-bold text-2xl">
                  Explore Notes
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {filteredNotes.length} notes available
                </p>
              </div>
              <div className="relative lg:hidden">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search notes..."
                  className="pl-10 w-60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-ocid="home.search_input"
                />
              </div>
            </div>

            {notesLoading ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                data-ocid="note.loading_state"
              >
                {["s1", "s2", "s3", "s4", "s5", "s6"].map((id) => (
                  <div key={id} className="space-y-3">
                    <Skeleton className="h-44 w-full rounded-xl" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-20" data-ocid="note.empty_state">
                <BookOpen className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-display font-semibold text-lg text-muted-foreground">
                  No notes found
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Try a different subject or search term
                </p>
                {isAuthenticated && (
                  <Link to="/upload" className="mt-4 inline-flex">
                    <Button
                      className="gap-2 mt-4"
                      data-ocid="home.upload_button"
                    >
                      <Upload className="w-4 h-4" /> Be the first to upload!
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.06 } },
                }}
              >
                {filteredNotes.map((note, i) => (
                  <motion.div
                    key={note.id}
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      show: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.35 }}
                  >
                    <NoteCard
                      note={note}
                      index={i + 1}
                      onBuy={handleBuy}
                      isBuying={buyNote.isPending}
                      isPurchased={purchasedIds.has(note.id)}
                      isOwn={note.seller.toString() === myPrincipal}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      {!isAuthenticated && (
        <section className="bg-primary/5 border-y border-primary/10 py-12">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="font-display font-bold text-3xl mb-3">
              Ready to share your knowledge?
            </h2>
            <p className="text-muted-foreground mb-6">
              Create your free account and start earning from your study notes
              today.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                size="lg"
                className="gap-2 bg-primary text-primary-foreground"
                data-ocid="home.cta_button"
              >
                Join StudyMart <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

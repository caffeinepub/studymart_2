import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Coins,
  Download,
  ShoppingCart,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useBuyStudyNote,
  useGetPurchasedNotes,
  useGetStudyNote,
} from "../hooks/useQueries";

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "bg-violet-100 text-violet-700 border-violet-200",
  Physics: "bg-blue-100 text-blue-700 border-blue-200",
  Chemistry: "bg-green-100 text-green-700 border-green-200",
  Biology: "bg-emerald-100 text-emerald-700 border-emerald-200",
  History: "bg-amber-100 text-amber-700 border-amber-200",
  English: "bg-pink-100 text-pink-700 border-pink-200",
  "Computer Science": "bg-cyan-100 text-cyan-700 border-cyan-200",
};

const SUBJECT_IMAGES: Record<string, string> = {
  Mathematics: "/assets/generated/note-math.dim_400x280.jpg",
  Physics: "/assets/generated/note-physics.dim_400x280.jpg",
  Chemistry: "/assets/generated/note-chemistry.dim_400x280.jpg",
  History: "/assets/generated/note-history.dim_400x280.jpg",
  "Computer Science": "/assets/generated/note-cs.dim_400x280.jpg",
};

export default function NoteDetailPage() {
  const params = useParams({ from: "/note/$noteId" });
  const noteId = params.noteId;
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: note, isLoading } = useGetStudyNote(noteId);
  const { data: purchasedNotes = [] } = useGetPurchasedNotes();
  const buyNote = useBuyStudyNote();

  const myPrincipal = identity?.getPrincipal().toString();
  const isPurchased = purchasedNotes.some((n) => n.id === noteId);
  const isOwn = note?.seller.toString() === myPrincipal;

  const handleBuy = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to buy notes");
      return;
    }
    try {
      await buyNote.mutateAsync(noteId);
      toast.success("Note purchased! 🎉 You can now download it.");
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
        toast.error(`Failed to purchase: ${msg}`);
      }
    }
  };

  const handleDownload = async () => {
    if (!note) return;
    try {
      const url = note.content.getDirectURL();
      const a = document.createElement("a");
      a.href = url;
      a.download = `${note.title}.pdf`;
      a.click();
    } catch {
      toast.error("Download failed");
    }
  };

  if (isLoading) {
    return (
      <div
        className="max-w-5xl mx-auto px-4 py-10 space-y-4"
        data-ocid="note_detail.loading_state"
      >
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div
        className="max-w-5xl mx-auto px-4 py-20 text-center"
        data-ocid="note_detail.error_state"
      >
        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display font-bold text-xl">Note not found</h2>
        <Link to="/">
          <Button variant="outline" className="mt-4 gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Button>
        </Link>
      </div>
    );
  }

  const coverImg =
    SUBJECT_IMAGES[note.subject] ||
    "/assets/generated/note-math.dim_400x280.jpg";
  const colorClass =
    SUBJECT_COLORS[note.subject] || "bg-secondary text-secondary-foreground";
  const sellerShort = `${note.seller.toString().slice(0, 12)}...`;

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 sm:px-6 py-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link to="/">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 gap-2 text-muted-foreground"
          data-ocid="note_detail.back_button"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl overflow-hidden">
            <img
              src={coverImg}
              alt={note.title}
              className="w-full h-64 object-cover"
            />
          </div>

          <div>
            <Badge className={`${colorClass} border mb-3`}>
              {note.subject}
            </Badge>
            <h1 className="font-display font-bold text-3xl leading-tight">
              {note.title}
            </h1>
          </div>

          <Separator />

          <div>
            <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> About these notes
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {note.description}
            </p>
          </div>

          {(isPurchased || isOwn) && (
            <Card className="border-0 bg-primary/5">
              <CardContent className="p-5">
                <h3 className="font-display font-semibold text-base mb-3 text-primary">
                  📄 Content Preview
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isOwn
                    ? "This is your note listing."
                    : "You own this note. Download it below."}
                </p>
                <Button
                  onClick={handleDownload}
                  className="mt-3 gap-2"
                  variant="outline"
                  data-ocid="note_detail.download_button"
                >
                  <Download className="w-4 h-4" /> Download Note
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Buy Card */}
          <Card className="border shadow-card sticky top-20">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <div className="font-display font-bold text-4xl text-primary flex items-center justify-center gap-2">
                  <Coins className="w-7 h-7" />
                  {note.price.toString()}
                </div>
                <p className="text-muted-foreground text-sm mt-1">credits</p>
              </div>
              <Separator />
              {isOwn ? (
                <div
                  className="text-center text-sm text-muted-foreground py-2"
                  data-ocid="note_detail.own_note_state"
                >
                  <User className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  This is your listing
                </div>
              ) : isPurchased ? (
                <Button
                  className="w-full gap-2"
                  onClick={handleDownload}
                  data-ocid="note_detail.download_button"
                >
                  <Download className="w-4 h-4" /> Download Note
                </Button>
              ) : (
                <Button
                  className="w-full gap-2 bg-primary text-primary-foreground"
                  onClick={handleBuy}
                  disabled={buyNote.isPending || !isAuthenticated}
                  data-ocid="note_detail.buy_button"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {buyNote.isPending
                    ? "Purchasing..."
                    : !isAuthenticated
                      ? "Login to Buy"
                      : `Buy for ${note.price.toString()} Credits`}
                </Button>
              )}
              {!isAuthenticated && (
                <p className="text-xs text-center text-muted-foreground">
                  Login to purchase this note
                </p>
              )}
            </CardContent>
          </Card>

          {/* Seller Card */}
          <Card className="border shadow-card">
            <CardContent className="p-5">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                Seller
              </h3>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {sellerShort[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{sellerShort}</p>
                  <p className="text-xs text-muted-foreground">
                    Verified Seller
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

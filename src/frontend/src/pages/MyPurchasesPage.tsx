import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import NoteCard from "../components/NoteCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetPurchasedNotes } from "../hooks/useQueries";

export default function MyPurchasesPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: purchased = [], isLoading } = useGetPurchasedNotes();

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display font-bold text-xl mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-4">
          Please login to see your purchases.
        </p>
        <Link to="/">
          <Button>Go to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 sm:px-6 py-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl">My Purchases</h1>
            <p className="text-muted-foreground text-sm">
              {purchased.length} notes purchased
            </p>
          </div>
        </div>
        <Link to="/">
          <Button
            variant="outline"
            className="gap-2"
            data-ocid="purchases.explore_button"
          >
            Browse More <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          data-ocid="purchases.loading_state"
        >
          {["s1", "s2", "s3"].map((id) => (
            <div key={id} className="space-y-3">
              <Skeleton className="h-44 w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : purchased.length === 0 ? (
        <div className="text-center py-20" data-ocid="purchases.empty_state">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-xl text-muted-foreground">
            No purchases yet
          </h3>
          <p className="text-muted-foreground text-sm mt-2 mb-6">
            Browse and buy study notes to get started
          </p>
          <Link to="/">
            <Button className="gap-2" data-ocid="purchases.browse_button">
              Explore Notes <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {purchased.map((note, i) => (
            <NoteCard key={note.id} note={note} index={i + 1} isPurchased />
          ))}
        </div>
      )}
    </motion.div>
  );
}

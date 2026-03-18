import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Coins, ShoppingCart } from "lucide-react";
import type { StudyNote } from "../backend";

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

function getSubjectImage(subject: string): string {
  return (
    SUBJECT_IMAGES[subject] || "/assets/generated/note-math.dim_400x280.jpg"
  );
}

interface NoteCardProps {
  note: StudyNote;
  index?: number;
  onBuy?: (noteId: string) => void;
  isBuying?: boolean;
  isPurchased?: boolean;
  isOwn?: boolean;
}

export default function NoteCard({
  note,
  index = 1,
  onBuy,
  isBuying,
  isPurchased,
  isOwn,
}: NoteCardProps) {
  const colorClass =
    SUBJECT_COLORS[note.subject] ||
    "bg-secondary text-secondary-foreground border-border";
  const coverImg = getSubjectImage(note.subject);
  const sellerShort = `${note.seller.toString().slice(0, 8)}...`;

  return (
    <Card
      className="group overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border-0"
      data-ocid={`note.item.${index}`}
    >
      <Link to="/note/$noteId" params={{ noteId: note.id }} className="block">
        <div className="relative overflow-hidden">
          <img
            src={coverImg}
            alt={note.title}
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 gradient-card-overlay" />
          <Badge
            className={`absolute top-3 left-3 text-xs font-semibold border ${colorClass}`}
          >
            {note.subject}
          </Badge>
          {isPurchased && (
            <Badge className="absolute top-3 right-3 bg-success text-white text-xs border-0">
              Purchased
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to="/note/$noteId" params={{ noteId: note.id }}>
          <h3 className="font-display font-semibold text-foreground leading-snug line-clamp-2 mb-2 hover:text-primary transition-colors">
            {note.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {note.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {sellerShort[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{sellerShort}</span>
          </div>
          <div className="flex items-center gap-1 font-display font-bold text-primary">
            <Coins className="w-4 h-4" />
            <span>{note.price.toString()}</span>
          </div>
        </div>
        {!isOwn && onBuy && (
          <Button
            className="w-full mt-3 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onBuy(note.id);
            }}
            disabled={isBuying || isPurchased}
            data-ocid={`note.buy_button.${index}`}
          >
            <ShoppingCart className="w-4 h-4" />
            {isPurchased
              ? "Purchased"
              : isBuying
                ? "Buying..."
                : `Buy · ${note.price.toString()} Credits`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

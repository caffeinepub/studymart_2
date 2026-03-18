import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BookOpen,
  Check,
  Coins,
  Edit2,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import NoteCard from "../components/NoteCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetStudyNotes,
  useGetUserCredits,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: profile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const { data: credits } = useGetUserCredits();
  const { data: allNotes = [] } = useGetStudyNotes();
  const saveProfile = useSaveCallerUserProfile();
  const [editing, setEditing] = useState(false);
  const [editEmail, setEditEmail] = useState("");

  const myPrincipal = identity?.getPrincipal().toString();
  const myNotes = allNotes.filter((n) => n.seller.toString() === myPrincipal);

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display font-bold text-xl mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-4">
          Please login to view your profile.
        </p>
        <Link to="/">
          <Button>Go to Home</Button>
        </Link>
      </div>
    );
  }

  const displayName = profile?.email?.split("@")[0] || "User";
  const principalShort = myPrincipal ? `${myPrincipal.slice(0, 14)}...` : "";

  const handleSave = async () => {
    await saveProfile.mutateAsync({ email: editEmail || profile?.email || "" });
    toast.success("Profile updated!");
    setEditing(false);
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 sm:px-6 py-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Profile Header */}
      <Card className="border shadow-card mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="w-20 h-20 ring-4 ring-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {profileLoading ? (
                <div className="space-y-2" data-ocid="profile.loading_state">
                  <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <h1 className="font-display font-bold text-2xl">
                    {displayName}
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    {principalShort}
                  </p>
                  {editing ? (
                    <div className="mt-3 flex items-center gap-2">
                      <Input
                        placeholder="Email"
                        value={editEmail || profile?.email || ""}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="max-w-xs"
                        data-ocid="profile.email_input"
                      />
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saveProfile.isPending}
                        data-ocid="profile.save_button"
                      >
                        {saveProfile.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-3">
                      <p className="text-sm text-muted-foreground">
                        {profile?.email}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing(true);
                          setEditEmail(profile?.email || "");
                        }}
                        data-ocid="profile.edit_button"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl">
                <Coins className="w-5 h-5 text-primary" />
                <span className="font-display font-bold text-primary text-xl">
                  {credits?.toString() ?? "0"}
                </span>
                <span className="text-sm text-muted-foreground">credits</span>
              </div>
              <Link to="/credits">
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid="profile.credits_button"
                >
                  Buy Credits
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="mb-6" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Notes Listed", value: myNotes.length, icon: BookOpen },
          {
            label: "Credits Earned",
            value: myNotes.reduce((a, n) => a + Number(n.price), 0),
            icon: Coins,
          },
          { label: "Total Sales", value: "N/A", icon: Coins },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display font-bold text-xl">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="listed" data-ocid="profile.tab">
        <TabsList className="mb-6">
          <TabsTrigger value="listed" data-ocid="profile.listed_tab">
            Listed Notes ({myNotes.length})
          </TabsTrigger>
          <TabsTrigger value="purchases" data-ocid="profile.purchases_tab">
            <Link to="/purchases" className="flex items-center">
              My Purchases
            </Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="listed">
          {myNotes.length === 0 ? (
            <div
              className="text-center py-16"
              data-ocid="profile.notes_empty_state"
            >
              <BookOpen className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display font-semibold text-lg text-muted-foreground">
                No notes listed yet
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                Start selling your study notes!
              </p>
              <Link to="/upload">
                <Button
                  className="mt-4 gap-2"
                  data-ocid="profile.upload_button"
                >
                  Upload Your First Note
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myNotes.map((note, i) => (
                <NoteCard key={note.id} note={note} index={i + 1} isOwn />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="purchases">
          <div className="text-center py-8 text-muted-foreground">
            <Link to="/purchases">
              <Button>View My Purchases</Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

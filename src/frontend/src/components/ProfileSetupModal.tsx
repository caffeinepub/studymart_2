import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: profile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const showModal =
    isAuthenticated && !isLoading && isFetched && profile === null;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    await saveProfile.mutateAsync({
      email:
        email || `${name.toLowerCase().replace(/\s+/g, ".")}@studymart.app`,
    });
    toast.success("Profile created! Welcome to StudyMart 🎉");
  };

  return (
    <Dialog open={showModal} data-ocid="profile_setup.dialog">
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <DialogTitle className="text-xl">Welcome to StudyMart!</DialogTitle>
          </div>
          <DialogDescription>
            Set up your profile to start buying and selling study notes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="profile_setup.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            className="w-full bg-primary text-primary-foreground"
            onClick={handleSave}
            disabled={saveProfile.isPending}
            data-ocid="profile_setup.submit_button"
          >
            {saveProfile.isPending ? (
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
            ) : null}
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

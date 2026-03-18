import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Coins,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateNoteListing } from "../hooks/useQueries";

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "English",
  "Computer Science",
];

export default function UploadNotePage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const createNote = useCreateNoteListing();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!identity) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display font-bold text-xl mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-4">
          You need to be logged in to upload notes.
        </p>
        <Link to="/">
          <Button>Go to Home</Button>
        </Link>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (!subject) {
      toast.error("Please select a subject");
      return;
    }
    if (!price || Number.isNaN(Number(price)) || Number(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (!file) {
      toast.error("Please upload a file");
      return;
    }

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setUploadProgress(pct),
      );
      const id = await createNote.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        subject,
        price: BigInt(Math.floor(Number(price))),
        content: blob,
      });
      toast.success("Note listed successfully! 🎉");
      navigate({ to: "/note/$noteId", params: { noteId: id } });
    } catch (err: any) {
      toast.error(`Failed to upload: ${err?.message || "Unknown error"}`);
      setUploadProgress(0);
    }
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto px-4 sm:px-6 py-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link to="/">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 gap-2 text-muted-foreground"
          data-ocid="upload.back_button"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </Link>

      <Card className="border shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary-foreground" />
            </div>
            List Your Notes
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Share your study materials and earn credits
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Complete Calculus Notes - Chapter 1-10"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-ocid="upload.title_input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what's included, topics covered, exam these notes are for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                data-ocid="upload.textarea"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger data-ocid="upload.subject_select">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (Credits) *</Label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="price"
                    type="number"
                    min="1"
                    placeholder="e.g., 50"
                    className="pl-10"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    data-ocid="upload.price_input"
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Note File *</Label>
              <button
                type="button"
                className={`w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  file
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-primary/5"
                }`}
                onClick={() => fileInputRef.current?.click()}
                data-ocid="upload.dropzone"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="font-semibold text-sm">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, Word, PowerPoint, or Text files
                    </p>
                  </div>
                )}
              </button>
            </div>

            {createNote.isPending && uploadProgress > 0 && (
              <div className="space-y-2" data-ocid="upload.loading_state">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <Button
              type="submit"
              className="w-full gap-2 bg-primary text-primary-foreground"
              disabled={createNote.isPending}
              data-ocid="upload.submit_button"
            >
              {createNote.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> List Notes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

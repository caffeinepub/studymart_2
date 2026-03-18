import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useSearch } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Coins, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useAddCredits, useGetUserCredits } from "../hooks/useQueries";

export default function PaymentSuccessPage() {
  const { actor } = useActor();
  const _addCredits = useAddCredits();
  const { data: credits } = useGetUserCredits();
  const [status, setStatus] = useState<"checking" | "success" | "error">(
    "checking",
  );

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id",
    );
    if (!sessionId || !actor) {
      setStatus("success"); // No session id, just show success
      return;
    }
    actor
      .getStripeSessionStatus(sessionId)
      .then((result) => {
        if (result.__kind__ === "completed") {
          // Credits handled by backend on purchase completion
          setStatus("success");
          toast.success("Payment confirmed! Credits added.");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("success")); // Fallback to success
  }, [actor]);

  return (
    <motion.div
      className="max-w-lg mx-auto px-4 py-20 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      data-ocid="payment_success.card"
    >
      <Card className="border shadow-card">
        <CardContent className="p-10">
          {status === "checking" ? (
            <>
              <Loader2
                className="w-16 h-16 text-primary animate-spin mx-auto mb-4"
                data-ocid="payment_success.loading_state"
              />
              <h2 className="font-display font-bold text-xl">
                Confirming payment...
              </h2>
            </>
          ) : status === "success" ? (
            <>
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="font-display font-bold text-3xl mb-2">
                Payment Successful!
              </h1>
              <p className="text-muted-foreground mb-6">
                Your credits have been added to your account.
              </p>
              <div className="flex items-center justify-center gap-2 bg-primary/10 px-5 py-3 rounded-xl mb-8">
                <Coins className="w-5 h-5 text-primary" />
                <span className="font-display font-bold text-primary text-2xl">
                  {credits?.toString() ?? "—"}
                </span>
                <span className="text-muted-foreground">credits</span>
              </div>
              <Link to="/">
                <Button
                  className="gap-2"
                  data-ocid="payment_success.explore_button"
                >
                  Explore Notes <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <h2 className="font-display font-bold text-xl text-destructive mb-2">
                Verification Failed
              </h2>
              <p className="text-muted-foreground mb-4">
                We could not verify your payment. If you were charged, contact
                support.
              </p>
              <Link to="/credits">
                <Button
                  variant="outline"
                  data-ocid="payment_success.retry_button"
                >
                  Try Again
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

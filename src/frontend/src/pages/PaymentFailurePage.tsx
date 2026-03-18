import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, XCircle } from "lucide-react";
import { motion } from "motion/react";

export default function PaymentFailurePage() {
  return (
    <motion.div
      className="max-w-lg mx-auto px-4 py-20 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      data-ocid="payment_failure.card"
    >
      <Card className="border shadow-card">
        <CardContent className="p-10">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-destructive" />
          </div>
          <h1 className="font-display font-bold text-3xl mb-2">
            Payment Cancelled
          </h1>
          <p className="text-muted-foreground mb-8">
            Your payment was cancelled. No charges were made.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/credits">
              <Button
                className="w-full gap-2"
                data-ocid="payment_failure.retry_button"
              >
                Try Again
              </Button>
            </Link>
            <Link to="/">
              <Button
                variant="outline"
                className="w-full gap-2"
                data-ocid="payment_failure.home_button"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

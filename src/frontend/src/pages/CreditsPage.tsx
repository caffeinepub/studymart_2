import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  Coins,
  CreditCard,
  Loader2,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateCheckoutSession,
  useGetUserCredits,
  useIsStripeConfigured,
} from "../hooks/useQueries";

const CREDIT_PACKAGES = [
  { credits: 50, price: 499, label: "Starter", popular: false },
  { credits: 150, price: 999, label: "Popular", popular: true },
  { credits: 500, price: 2499, label: "Pro", popular: false },
];

export default function CreditsPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: credits } = useGetUserCredits();
  const { data: stripeConfigured } = useIsStripeConfigured();
  const createCheckout = useCreateCheckoutSession();
  const [selectedPackage, setSelectedPackage] = useState(1);

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display font-bold text-xl mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-4">
          Please login to buy credits.
        </p>
        <Link to="/">
          <Button>Go to Home</Button>
        </Link>
      </div>
    );
  }

  const handleBuyCredits = async () => {
    const pkg = CREDIT_PACKAGES[selectedPackage];
    if (!stripeConfigured) {
      toast.error("Payment not configured yet. Please contact the admin.");
      return;
    }
    try {
      const session = await createCheckout.mutateAsync([
        {
          productName: `${pkg.credits} StudyMart Credits`,
          productDescription: `${pkg.credits} credits to buy study notes on StudyMart`,
          currency: "usd",
          priceInCents: BigInt(pkg.price),
          quantity: BigInt(1),
        },
      ]);
      if (!session?.url) throw new Error("Stripe session missing url");
      window.location.href = session.url;
    } catch (err: any) {
      toast.error(`Checkout failed: ${err?.message || "Unknown error"}`);
    }
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto px-4 sm:px-6 py-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center">
          <Coins className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="font-display font-bold text-3xl mb-2">Buy Credits</h1>
        <p className="text-muted-foreground">
          Use credits to purchase study notes from sellers
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 px-5 py-2 rounded-full">
          <Coins className="w-4 h-4 text-primary" />
          <span className="font-display font-bold text-primary text-xl">
            {credits?.toString() ?? "0"}
          </span>
          <span className="text-sm text-muted-foreground">current balance</span>
        </div>
      </div>

      {/* Packages */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {CREDIT_PACKAGES.map((pkg, i) => (
          <Card
            key={pkg.label}
            className={`cursor-pointer transition-all border-2 shadow-card hover:shadow-card-hover ${
              selectedPackage === i
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/30"
            }`}
            onClick={() => setSelectedPackage(i)}
            data-ocid={`credits.package.${i + 1}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{pkg.label}</CardTitle>
                {pkg.popular && (
                  <Badge className="bg-accent text-accent-foreground border-0 text-xs">
                    Popular
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-5 h-5 text-primary" />
                <span className="font-display font-bold text-2xl text-primary">
                  {pkg.credits}
                </span>
                <span className="text-muted-foreground text-sm">credits</span>
              </div>
              <p className="font-semibold text-lg">
                ${(pkg.price / 100).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ${(pkg.price / 100 / pkg.credits).toFixed(3)}/credit
              </p>
              {selectedPackage === i && (
                <div className="mt-3 flex items-center gap-1 text-primary text-sm font-semibold">
                  <Check className="w-4 h-4" /> Selected
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Buy Button */}
      <Button
        className="w-full gap-2 bg-primary text-primary-foreground h-12 text-base"
        onClick={handleBuyCredits}
        disabled={createCheckout.isPending}
        data-ocid="credits.buy_button"
      >
        {createCheckout.isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Redirecting to
            checkout...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" /> Pay $
            {(CREDIT_PACKAGES[selectedPackage].price / 100).toFixed(2)} with
            Stripe
          </>
        )}
      </Button>

      {!stripeConfigured && (
        <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-1">
          <AlertTriangle className="w-4 h-4" /> Payment gateway not configured
          yet
        </p>
      )}

      {/* How it works */}
      <Card className="mt-8 border shadow-card">
        <CardContent className="p-6">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" /> How Credits Work
          </h2>
          <div className="space-y-3">
            {[
              "Buy a credit package using your credit/debit card via Stripe",
              "Credits are added to your account instantly after payment",
              "Use credits to purchase study notes from any seller",
              "Earn credits by selling your own study notes to others",
            ].map((item, i) => (
              <div key={item.slice(0, 20)} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

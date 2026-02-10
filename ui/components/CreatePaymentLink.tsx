"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react"; // install lucide-react or use simple text

interface LinkProps {
  amount: number;
  currency: string;
  receiverWallet: string;
}

export default function CreatePaymentLink({ amount, currency, receiverWallet }: LinkProps) {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          currency: currency,
          receiver_wallet: receiverWallet, 
        }),
      });

      const data = await res.json();
      if (data.url) {
        setPaymentUrl(data.url);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate link");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (paymentUrl) {
      navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-6 p-6 bg-gray-900 border border-gray-700 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-2">Request Payment</h3>
      <p className="text-gray-400 text-sm mb-4">
        Generate a secure link to send to the payer. Once they pay, the funds will automatically convert to crypto and arrive in your wallet.
      </p>

      {!paymentUrl ? (
        <button
          onClick={generateLink}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all 
            ${loading ? "bg-gray-700" : "bg-purple-600 hover:bg-purple-700"}`}
        >
          {loading ? "Generating..." : "🔗 Generate Payment Link"}
        </button>
      ) : (
        <div className="flex items-center gap-2 bg-black p-3 rounded-lg border border-gray-600">
          <input
            type="text"
            readOnly
            value={paymentUrl}
            className="bg-transparent text-green-400 flex-1 outline-none text-sm font-mono truncate"
          />
          <button
            onClick={copyToClipboard}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          </button>
        </div>
      )}
    </div>
  );
}
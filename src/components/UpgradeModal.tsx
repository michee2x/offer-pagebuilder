import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePaddle } from '@/components/PaddleProvider';
import { Sparkles, Zap, ArrowRight, Shield } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function UpgradeModal({ isOpen, onClose, title, description }: UpgradeModalProps) {
  const { openCheckout } = usePaddle();
  const [userEmail, setUserEmail] = React.useState<string>();
  const [userId, setUserId] = React.useState<string>();

  React.useEffect(() => {
    if (isOpen) {
      const fetchUser = async () => {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setUserEmail(data.user.email);
          setUserId(data.user.id);
        }
      };
      fetchUser();
    }
  }, [isOpen]);

  const handleUpgrade = (priceId: string) => {
    onClose();
    openCheckout(priceId, userEmail, userId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-[#0a0a0a] border border-white/10 text-white p-0 overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500" />
        
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(217,70,239,0.15)]">
              <Sparkles className="w-7 h-7 text-fuchsia-400" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight mb-2 text-white">{title || "Out of Credits"}</DialogTitle>
            <DialogDescription className="text-[15px] text-gray-400 leading-relaxed">
              {description || "You've used all your available offer credits. Upgrade to a premium plan to continue generating high-converting funnels, intelligent copy, and traffic strategies."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Growth Plan Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04] hover:border-white/20 group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-white">Growth Plan</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/20">Popular</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">10 Offer Credits / mo</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">$69</span>
                    <span className="text-sm text-gray-500">/mo</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_PADDLE_PRICE_GROWTH!)}
                  className="bg-gradient-to-r from-violet-600 hover:from-violet-500 to-fuchsia-500 hover:to-fuchsia-400 text-white shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all group-hover:scale-105 shrink-0"
                >
                  Upgrade <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Starter Plan Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] p-5 transition-all hover:bg-white/[0.03] hover:border-white/10 group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-300 mb-1">Starter Plan</h3>
                  <p className="text-sm text-gray-500 mb-3">5 Offer Credits / mo</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-300">$39</span>
                    <span className="text-sm text-gray-600">/mo</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline"
                  onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER!)}
                  className="border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all group-hover:border-white/20 shrink-0"
                >
                  Upgrade <ArrowRight className="w-4 h-4 ml-2 opacity-50" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 border-t border-white/5 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4 text-emerald-500/70" />
            <span>Secure checkout by Paddle</span>
          </div>
          <button onClick={onClose} className="text-xs text-gray-400 hover:text-white transition-colors">
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

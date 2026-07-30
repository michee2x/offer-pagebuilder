import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePaddle } from '@/components/PaddleProvider';
import { Sparkles, ArrowRight, Zap, Star } from 'lucide-react';
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
      <DialogContent className="sm:max-w-xl bg-transparent border-none shadow-none p-0 overflow-visible">
        {/* Glow Effects */}
        <div className="absolute -inset-10 bg-gradient-to-r from-violet-600/30 via-fuchsia-600/30 to-pink-600/30 blur-3xl opacity-50 rounded-full animate-pulse" />
        
        <div className="relative overflow-hidden rounded-[32px] bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Animated Gradient Border Top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
          
          <div className="p-8 sm:p-10 relative z-10">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-fuchsia-500/20 rounded-full blur-xl group-hover:bg-fuchsia-500/30 transition-all duration-500" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(217,70,239,0.2)]">
                  <Sparkles className="w-10 h-10 text-fuchsia-400" />
                  <Star className="w-4 h-4 text-pink-400 absolute top-3 right-3 animate-pulse" />
                </div>
              </div>
              <DialogTitle className="text-3xl font-extrabold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50">
                {title || "Unlock Premium Access"}
              </DialogTitle>
              <DialogDescription className="text-base text-slate-400 leading-relaxed max-w-sm mx-auto">
                {description || "You've reached the limit of your current plan. Upgrade to unlock limitless possibilities and scale your offers."}
              </DialogDescription>
            </div>

            <div className="space-y-4">
              {/* Growth Plan Card */}
              <div 
                className="relative overflow-hidden rounded-2xl border border-fuchsia-500/30 bg-gradient-to-b from-fuchsia-500/10 to-transparent p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(217,70,239,0.15)] hover:border-fuchsia-500/50 group cursor-pointer"
                onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_PADDLE_PRICE_GROWTH!)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-fuchsia-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center justify-between gap-4 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-xl text-white">Growth Plan</h3>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_0_10px_rgba(217,70,239,0.5)]">
                        Popular
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-fuchsia-200/70 mb-4">
                      <Zap className="w-4 h-4 mr-1.5 text-fuchsia-400" />
                      10 Offer Credits / month
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-white">$69</span>
                      <span className="text-sm font-medium text-slate-500">/mo</span>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 group-hover:bg-gradient-to-r group-hover:from-violet-500 group-hover:to-fuchsia-500 group-hover:border-transparent transition-all duration-300">
                    <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>

              {/* Starter Plan Card */}
              <div 
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/20 group cursor-pointer"
                onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER!)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-300 mb-2 group-hover:text-white transition-colors">Starter Plan</h3>
                    <p className="text-sm text-slate-500 mb-4">5 Offer Credits / month</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-slate-300 group-hover:text-white transition-colors">$39</span>
                      <span className="text-sm font-medium text-slate-600">/mo</span>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all duration-300">
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <button 
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-white transition-colors font-medium underline underline-offset-4"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

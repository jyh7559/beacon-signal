import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Crown, Check, ExternalLink, Clock } from "lucide-react";

export interface PlanInfo {
  name: string;
  price: number;
  billingPeriod: "month" | "year";
  renewalDate: string;
  features: string[];
}

interface PlanCardProps {
  plan: PlanInfo;
  onUpgrade?: () => void;
  onManageBilling?: () => void;
}

function getDaysRemaining(renewalDate: string): number | null {
  if (renewalDate === 'N/A') return null;
  const endDate = new Date(renewalDate);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

export function PlanCard({ plan, onUpgrade, onManageBilling }: PlanCardProps) {
  const isTrial = plan.name.toLowerCase().includes('trial');
  const daysRemaining = getDaysRemaining(plan.renewalDate);
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7;

  return (
    <GlassCard>
      <GlassCardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <Badge variant={isTrial ? "secondary" : "default"} size="sm">
                  {isTrial ? "Trial" : "Active"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {plan.price === 0 ? 'Free' : `$${plan.price}/${plan.billingPeriod}`}
                {plan.renewalDate !== 'N/A' && ` · Expires ${plan.renewalDate}`}
              </p>
            </div>
          </div>
        </div>

        {/* Trial expiry warning */}
        {isTrial && daysRemaining !== null && (
          <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
            isExpiringSoon 
              ? 'bg-destructive/10 border border-destructive/20' 
              : 'bg-primary/5 border border-primary/10'
          }`}>
            <Clock className={`w-4 h-4 ${isExpiringSoon ? 'text-destructive' : 'text-primary'}`} />
            <span className={`text-sm font-medium ${isExpiringSoon ? 'text-destructive' : 'text-foreground'}`}>
              {daysRemaining === 0 
                ? 'Trial expires today!' 
                : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining in trial`}
            </span>
          </div>
        )}

        <div className="space-y-2 mb-6">
          {plan.features.length > 0 ? (
            plan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No active resources</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="default" className="flex-1" onClick={onUpgrade}>
            {isTrial ? 'Upgrade Now' : 'Change Plan'}
          </Button>
          <Button variant="ghost" className="gap-2" onClick={onManageBilling}>
            <ExternalLink className="w-4 h-4" />
            Billing
          </Button>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}

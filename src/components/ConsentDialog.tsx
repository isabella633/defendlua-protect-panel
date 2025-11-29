import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const ConsentDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only hide dialog if user explicitly accepted
    const consentStatus = localStorage.getItem('defendlua_consent');
    if (consentStatus !== 'accepted') {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('defendlua_consent', 'accepted');
    localStorage.setItem('defendlua_consent_date', new Date().toISOString());
    setOpen(false);
  };

  const handleDecline = () => {
    // Remove consent so dialog shows again next time
    localStorage.removeItem('defendlua_consent');
    localStorage.removeItem('defendlua_consent_date');
    // Redirect to a neutral page
    window.location.href = 'https://www.google.com';
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <DialogTitle className="text-2xl">Welcome to DefendLua</DialogTitle>
          </div>
          <DialogDescription className="text-base space-y-4 pt-4">
            <p>
              Before you continue, please review and accept our Terms of Service and Privacy Policy.
            </p>
            
            <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm">
              <p className="font-medium text-foreground">By using DefendLua, you agree to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Collection of Hardware IDs (HWIDs) and IP addresses for script protection</li>
                <li>• Storage of access logs for security and monitoring purposes</li>
                <li>• Use of cookies and local storage for authentication and preferences</li>
                <li>• Our terms regarding script protection and usage</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-2 text-sm">
              <Link 
                to="/terms-of-service" 
                className="text-primary hover:underline flex items-center space-x-1"
                onClick={(e) => {
                  e.preventDefault();
                  window.open('/terms-of-service', '_blank');
                }}
              >
                <span>Read Terms of Service</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link 
                to="/privacy-policy" 
                className="text-primary hover:underline flex items-center space-x-1"
                onClick={(e) => {
                  e.preventDefault();
                  window.open('/privacy-policy', '_blank');
                }}
              >
                <span>Read Privacy Policy</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <p className="text-xs text-muted-foreground">
              You must accept these terms to use DefendLua. If you decline, you will be redirected away from this site.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleDecline} className="w-full sm:w-auto">
            Decline
          </Button>
          <Button onClick={handleAccept} className="w-full sm:w-auto">
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConsentDialog;

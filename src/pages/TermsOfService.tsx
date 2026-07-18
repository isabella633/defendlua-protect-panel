import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Terms of Service — DefendLua" description="Read the DefendLua Terms of Service governing use of our Lua script protection platform." path="/terms" />
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">DefendLua</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using DefendLua ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p>
                DefendLua provides Lua script protection and distribution services for Roblox and other platforms. The Service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Script obfuscation and protection</li>
                <li>Hardware ID (HWID) and IP-based access control</li>
                <li>Access logging and monitoring</li>
                <li>Script distribution via secure endpoints</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p>
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password and account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Collection and Usage</h2>
              <p>
                By using DefendLua, you consent to the collection and processing of:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Hardware IDs (HWIDs) from devices accessing protected scripts</li>
                <li>IP addresses for access control and security</li>
                <li>Access timestamps and request logs</li>
                <li>User account information and preferences</li>
              </ul>
              <p className="mt-4">
                This data is used solely for script protection, access control, abuse prevention, and service improvement. See our Privacy Policy for detailed information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
              <p>You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Service for any illegal purposes</li>
                <li>Attempt to bypass or circumvent script protection measures</li>
                <li>Share protected scripts without authorization</li>
                <li>Abuse, harass, or threaten other users</li>
                <li>Distribute malicious code through the Service</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Use automated tools to spam or overload the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Subscription Plans</h2>
              <p>
                DefendLua offers Free, Pro, and Enterprise subscription tiers with varying features:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Free: HWID whitelist required for all script access</li>
                <li>Pro/Enterprise: Optional public access mode with full access logging</li>
                <li>All plans: Access to blacklist functionality and access logs</li>
              </ul>
              <p className="mt-4">
                Subscription fees are non-refundable. We reserve the right to modify pricing with 30 days notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
              <p>
                You retain all rights to scripts you upload. By using the Service, you grant DefendLua a license to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Store and process your scripts</li>
                <li>Apply protection and obfuscation</li>
                <li>Distribute scripts according to your access control settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p>
                DefendLua is provided "as is" without warranties of any kind. We are not liable for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Unauthorized access to protected scripts</li>
                <li>Loss of data or scripts</li>
                <li>Service interruptions or downtime</li>
                <li>Damages resulting from use or inability to use the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account at any time for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violation of these Terms of Service</li>
                <li>Fraudulent or illegal activity</li>
                <li>Extended periods of inactivity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
              <p>
                We may modify these Terms of Service at any time. Continued use of the Service after changes constitutes acceptance of the modified terms. We will notify users of significant changes via email or in-app notification.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
              <p>
                For questions about these Terms of Service, please contact us through the Contact page or support channels.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;

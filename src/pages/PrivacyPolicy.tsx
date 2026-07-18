import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Privacy Policy — DefendLua" description="How DefendLua collects, uses, and protects your personal data across our Lua script protection service." path="/privacy" />
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
            <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p>
                DefendLua ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our script protection service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Account Information</h3>
              <p>When you create an account, we collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email address</li>
                <li>Username</li>
                <li>Password (encrypted)</li>
                <li>Subscription plan information</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Script Protection Data</h3>
              <p>When you protect scripts, we collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Script content and metadata</li>
                <li>Script names and identifiers</li>
                <li>HWID whitelists and blacklists</li>
                <li>IP address whitelists</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.3 Access Logs</h3>
              <p>When protected scripts are accessed, we automatically log:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Hardware ID (HWID) of the accessing device</li>
                <li>IP address of the request</li>
                <li>Timestamp of access</li>
                <li>Access status (allowed/denied)</li>
                <li>Script identifier</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">2.4 Technical Data</h3>
              <p>We automatically collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Usage patterns and preferences</li>
                <li>Cookies and local storage data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p>We use collected information for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Script Protection:</strong> Enforcing HWID and IP-based access controls</li>
                <li><strong>Security Monitoring:</strong> Detecting and preventing unauthorized access</li>
                <li><strong>Abuse Prevention:</strong> Identifying and blocking malicious users</li>
                <li><strong>Service Improvement:</strong> Analyzing usage patterns to enhance features</li>
                <li><strong>Account Management:</strong> Providing and maintaining your account</li>
                <li><strong>Communication:</strong> Sending service updates and security notifications</li>
                <li><strong>Compliance:</strong> Meeting legal and regulatory requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encrypted data transmission (HTTPS/TLS)</li>
                <li>Secure database storage with Row Level Security (RLS)</li>
                <li>Password hashing and encryption</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
              </ul>
              <p className="mt-4">
                Your data is stored on secure servers powered by Supabase, with automatic backups and redundancy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
              <p>We do NOT sell your personal information. We may share data only when:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> With trusted third parties who assist in operating our service (e.g., hosting providers)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize data sharing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
              <p>We retain your data for as long as:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your account is active</li>
                <li>Necessary to provide services</li>
                <li>Required for legal or compliance purposes</li>
              </ul>
              <p className="mt-4">
                Access logs are retained for 90 days for security monitoring purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Export:</strong> Download your scripts and data</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Withdraw Consent:</strong> Revoke consent for data processing</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us through the Contact page or support channels.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
              <p>We use cookies and similar technologies for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Authentication and session management</li>
                <li>Storing user preferences</li>
                <li>Analyzing service usage</li>
                <li>Security and fraud prevention</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings, but this may limit service functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Third-Party Services</h2>
              <p>
                DefendLua uses the following third-party services:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>Lovable Cloud:</strong> Hosting and edge functions</li>
              </ul>
              <p className="mt-4">
                These services have their own privacy policies governing data handling.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
              <p>
                DefendLua is not intended for users under 13 years of age. We do not knowingly collect information from children. If you believe we have collected data from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
              <p>
                Your data may be transferred to and processed in countries outside your jurisdiction. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. We will notify you of significant changes via email or in-app notification. Continued use after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
              <p>
                For questions about this Privacy Policy or our data practices, please contact us through:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The Contact page on our website</li>
                <li>Our support channels</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;

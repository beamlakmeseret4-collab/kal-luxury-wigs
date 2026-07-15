export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="container-kal max-w-2xl py-16">
      <p className="text-xs uppercase tracking-widest text-gold-dark">Legal</p>
      <h1 className="mt-2 font-display text-3xl text-charcoal">Privacy Policy</h1>
      <div className="prose prose-sm mt-6 max-w-none space-y-4 text-charcoal/70">
        <p><strong>This page is a starting template, not a finished legal document.</strong></p>
        <p>Your store collects: customer name, phone number, email (optional), delivery address and
          map location (for delivery orders), and payment screenshots (for TeleBirr/CBE orders, used
          only to verify payment). This data is stored to process orders and is visible only to your
          admin account.</p>
        <p>Before launch, replace this page with a real privacy policy — ideally reviewed by someone
          familiar with Ethiopian data-protection requirements — covering what you collect, how long
          you keep it, and how customers can request their data be deleted.</p>
      </div>
    </div>
  );
}

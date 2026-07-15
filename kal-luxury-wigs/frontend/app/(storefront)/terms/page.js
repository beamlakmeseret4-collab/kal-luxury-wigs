export const metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <div className="container-kal max-w-2xl py-16">
      <p className="text-xs uppercase tracking-widest text-gold-dark">Legal</p>
      <h1 className="mt-2 font-display text-3xl text-charcoal">Terms of Service</h1>
      <div className="prose prose-sm mt-6 max-w-none space-y-4 text-charcoal/70">
        <p><strong>This page is a starting template, not a finished legal document.</strong></p>
        <p>Cover the basics here: pricing is in ETB and subject to change without notice; orders are
          confirmed once payment is verified (TeleBirr/CBE) or on delivery/pickup (cash); delivery
          timing is arranged directly with the customer after ordering; and how disputes are handled.</p>
        <p>Replace this with real terms before launch, ideally reviewed by someone familiar with
          Ethiopian commercial law.</p>
      </div>
    </div>
  );
}

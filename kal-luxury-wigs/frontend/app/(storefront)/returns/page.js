export const metadata = { title: 'Returns & Care' };

export default function ReturnsPage() {
  return (
    <div className="container-kal max-w-2xl py-16">
      <p className="text-xs uppercase tracking-widest text-gold-dark">Support</p>
      <h1 className="mt-2 font-display text-3xl text-charcoal">Returns &amp; Care</h1>
      <div className="prose prose-sm mt-6 max-w-none space-y-4 text-charcoal/70">
        <p>
          <strong>This page is a starting template</strong> — replace it with your actual returns,
          exchange, and hair-care policy before launch. A few things worth deciding and writing down:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>How many days after delivery/pickup can a customer request a return or exchange?</li>
          <li>Does the wig need to be unworn / tags attached / original packaging?</li>
          <li>Who covers return delivery cost?</li>
          <li>Basic wig care instructions (washing, storage, heat styling limits for synthetic vs. human hair).</li>
        </ul>
        <p className="text-xs text-charcoal/40">
          This is general guidance, not legal advice — for anything binding, it&rsquo;s worth a quick review
          by someone familiar with Ethiopian consumer-protection rules.
        </p>
      </div>
    </div>
  );
}

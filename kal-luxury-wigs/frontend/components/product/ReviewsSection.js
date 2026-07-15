'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/FormFields';
import { useSubmitReview } from '@/lib/hooks';
import { useToastStore } from '@/lib/store';

export default function ReviewsSection({ product }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const submitReview = useSubmitReview(product._id);
  const showToast = useToastStore((s) => s.showToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    try {
      await submitReview.mutateAsync({ name, rating, comment });
      showToast('Thanks for your review!');
      setShowForm(false);
      setName('');
      setComment('');
      setRating(5);
    } catch (err) {
      showToast(err.message || 'Could not submit review', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-ink">
          Reviews {product.numReviews > 0 && `(${product.numReviews})`}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'Write a Review'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-xl2 border border-charcoal/10 p-5">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} stars`}>
                <Star className={`h-6 w-6 ${i <= rating ? 'fill-gold text-gold' : 'text-charcoal/20'}`} />
              </button>
            ))}
          </div>
          <Field label="Your Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Your Review" required>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} required />
          </Field>
          <Button type="submit" variant="gold" loading={submitReview.isPending}>Submit Review</Button>
        </form>
      )}

      {product.reviews?.length > 0 ? (
        <div className="mt-6 space-y-6">
          {[...product.reviews].reverse().map((review) => (
            <div key={review._id || review.createdAt} className="border-b border-charcoal/10 pb-5 last:border-0">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i <= review.rating ? 'fill-gold text-gold' : 'text-charcoal/20'}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-ink">{review.name}</span>
              </div>
              <p className="mt-2 text-sm text-charcoal/70">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        !showForm && <p className="mt-4 text-sm text-charcoal/50">No reviews yet — be the first to share your experience.</p>
      )}
    </div>
  );
}

/**
 * A review as the customer wrote it: paragraphs and line breaks kept, and each line in its own
 * direction, so Arabic reads right to left and English left to right, even mixed in one review.
 */
export function ReviewText({ text, className = '' }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim())
  return (
    <div className={`rf-review-text ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i} dir="auto">
          {p}
        </p>
      ))}
    </div>
  )
}

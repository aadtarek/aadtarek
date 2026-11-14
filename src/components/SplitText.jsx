import { Fragment } from 'react'

// Splits text into letters that rise in one after another (3D flip + blur → sharp)
// when their section gets the "in" class (or the page gets "opened" for the hero).
export default function SplitText({ text, className = '', as: Tag = 'span', delay = 0, step = 0.045 }) {
  let i = 0
  return (
    <Tag className={`split ${className}`} aria-label={text}>
      {text.split(' ').map((word, w, arr) => (
        <Fragment key={w}>
          <span className="split-word" aria-hidden="true">
            {[...word].map((ch) => (
              <span key={i} className="split-ch" style={{ '--d': `${delay + i++ * step}s` }}>{ch}</span>
            ))}
          </span>
          {w < arr.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  )
}

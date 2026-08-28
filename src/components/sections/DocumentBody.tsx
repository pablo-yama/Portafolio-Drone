/**
 * DocumentBody — renders the long-form section arrays declared in
 * src/lib/constants.ts (ABOUT_PAGE, PRIVACY_POLICY) as prose.
 *
 * Server component on purpose: these pages are static text and must be in the
 * initial HTML so crawlers and agents read them without executing JavaScript.
 */

export interface DocumentSection {
  readonly heading: string;
  readonly paragraphs?: readonly string[];
  readonly bullets?: readonly string[];
}

interface DocumentBodyProps {
  sections: readonly DocumentSection[];
}

export function DocumentBody({ sections }: DocumentBodyProps) {
  return (
    <div className="doc-body">
      {sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
          {section.bullets && (
            <ul>
              {section.bullets.map((bullet) => (
                <li key={bullet.slice(0, 48)}>{bullet}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

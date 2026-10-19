/** Frames the supplied original artwork without redrawing the logo. */
export default function BrandLogo({
  className = "",
  markOnly = false,
}: {
  className?: string;
  markOnly?: boolean;
}) {
  return (
    <svg
      viewBox={markOnly ? "75 245 355 370" : "65 245 935 370"}
      role="img"
      aria-label="Oncosourz Ltd."
      className={className}
    >
      <image href="/brand/oncosourz-original.jpeg" width="1200" height="1200" />
    </svg>
  );
}

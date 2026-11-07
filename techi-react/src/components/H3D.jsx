/* heading whose words flip up in 3D */
export default function H3D({ as: As = "h2", text, className = "" }) {
  return (
    <As className={"h3d " + className} data-h3d="" aria-label={text}>
      {String(text).split(/\s+/).filter(Boolean).map((w, i) => <span className="hw" key={i} aria-hidden="true"><span>{w}</span></span>)}
    </As>
  );
}

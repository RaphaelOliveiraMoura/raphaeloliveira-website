export default function Emoji({ children, label }) {
  return (
    <span role="img" aria-label={label} style={{ display: "inline" }}>
      {children}
    </span>
  );
}

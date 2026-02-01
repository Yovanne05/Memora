import { Link } from "@tanstack/react-router";

export function DefaultNotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h1>404</h1>
      <p>Page introuvable.</p>
      <Link to="/app/dashboard">Retour au dashboard</Link>
    </div>
  );
}

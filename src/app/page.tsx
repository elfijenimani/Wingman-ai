import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center' }}>
        <h1 className="title">✈️ Wingman AI</h1>
        <p className="subtitle">
          Your smart airport assistant
        </p>

        <Link href="/login">
          <button className="button" style={{ marginBottom: '10px' }}>
            Login
          </button>
        </Link>

        <Link href="/signup">
          <button className="button" style={{ background: '#16a34a' }}>
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Geist, Geist_Mono } from "next/font/google";
import { Highlight, themes } from "prism-react-renderer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface DiscordInviteData {
  code: string;
  type: number;
  expires_at: string | null;
  guild: {
    id: string;
    name: string;
    splash: string | null;
    banner: string | null;
    description: string | null;
    icon: string | null;
    features: string[];
    verification_level: number;
    vanity_url_code: string | null;
  };
  channel: {
    id: string;
    name: string;
    type: number;
  };
  approximate_member_count?: number;
  approximate_presence_count?: number;
}

export default function Home() {
  const router = useRouter();
  const [inviteKey, setInviteKey] = useState('');
  const [inviteData, setInviteData] = useState<DiscordInviteData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchInviteInfo = async (code: string) => {
    setLoading(true);
    setError('');
    setInviteData(null);

    try {
      const response = await fetch(
        `https://discord.com/api/v9/invites/${code}?with_counts=true&with_expiration=true`
      );
      
      if (!response.ok) {
        throw new Error('Invalid invite or API error');
      }

      const data = await response.json();
      setInviteData(data);
      
      // Update URL with the invite code
      router.push(`/?invite=${code}`, undefined, { shallow: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invite data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteKey) {
      fetchInviteInfo(inviteKey);
    }
  };

  // Check URL parameters on mount and when router is ready
  useEffect(() => {
    if (router.isReady && router.query.invite) {
      const code = router.query.invite as string;
      setInviteKey(code);
      fetchInviteInfo(code);
    }
  }, [router.isReady, router.query.invite]);

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-black text-[#0ff] p-8 font-[family-name:var(--font-geist-sans)] relative overflow-hidden`}
    >
      {/* Retro grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(#0ff 1px, transparent 1px),
            linear-gradient(90deg, #0ff 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center 0',
        }}
      />

      <div className="relative z-10">
        <main className="w-full max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold mb-8 text-center text-[#ff00ff] animate-pulse shadow-[0_0_10px_#ff00ff] tracking-wider">
            DISCORD<span className="text-[#0ff]"> INVITE INFO</span>
          </h1>

          <form onSubmit={handleSubmit} className="mb-8 relative">
            <div className="flex gap-4">
              <input
                type="text"
                value={inviteKey}
                onChange={(e) => setInviteKey(e.target.value)}
                placeholder="ENTER_INVITE_KEY"
                className="flex-1 h-12 px-4 bg-black border-2 border-[#0ff] text-[#0ff] rounded-none 
                          font-[family-name:var(--font-geist-mono)] placeholder-[#0ff]/50
                          focus:outline-none focus:border-[#ff00ff] focus:shadow-[0_0_10px_#ff00ff]
                          transition-all duration-300"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="h-12 px-6 bg-[#ff00ff] text-black font-bold hover:bg-[#0ff] 
                          transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                          border-2 border-[#ff00ff] hover:border-[#0ff] rounded-none
                          font-[family-name:var(--font-geist-mono)] relative overflow-hidden
                          hover:text-black hover:shadow-[0_0_20px_#0ff]"
              >
                {loading ? 'LOADING...' : 'FETCH'}
              </button>
            </div>
          </form>

          {error && (
            <div className="border-2 border-red-500 p-4 mb-8 bg-black/50 animate-pulse">
              <p className="text-red-500 font-[family-name:var(--font-geist-mono)] glitch">
                ERROR: {error}
              </p>
            </div>
          )}

          {inviteData && (
            <div className="relative">
              <div className="absolute inset-0 bg-[#0ff]/5 animate-pulse" />
              <div className="border-2 border-[#0ff] bg-black/80 p-6 shadow-[0_0_20px_#0ff]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#ff00ff] font-[family-name:var(--font-geist-mono)]">
                    INVITE_DATA.json
                  </span>
                  <span className="text-[#0ff] font-[family-name:var(--font-geist-mono)]">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <Highlight
                  theme={{
                    ...themes.nightOwl,
                    plain: { backgroundColor: 'transparent', color: '#0ff' },
                    styles: [
                      ...themes.nightOwl.styles,
                      { types: ['string'], style: { color: '#ff00ff' } },
                      { types: ['number'], style: { color: '#f92aad' } },
                      { types: ['boolean', 'null'], style: { color: '#0ff' } },
                      { types: ['property'], style: { color: '#00ff9f' } }
                    ]
                  }}
                  code={JSON.stringify(inviteData, null, 2)}
                  language="json"
                >
                  {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre className={`${className} whitespace-pre-wrap break-words text-sm font-[family-name:var(--font-geist-mono)]`} style={style}>
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                        </div>
                      ))}
                    </pre>
                  )}
                </Highlight>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CRT screen effect */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50" />
    </div>
  );
}

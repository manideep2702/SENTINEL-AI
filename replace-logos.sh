#!/bin/bash

# Replace logo in HomePage.tsx
sed -i '' '92,99s|<div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate(\x27/\x27)}>.*</div>|<div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(\x27/\x27)}><img src="/Sentinellogo.jpg" alt="Sentinel AI" className="w-8 h-8 rounded-lg object-cover" /><span className="text-lg tracking-tight font-bold text-white">SENTINEL AI</span></div>|' /Users/manideep/Documents/lkk/pages/HomePage.tsx

# Replace logo in VerifyUploadPage.tsx  
sed -i '' '72,75s|<div className="relative flex items-center justify-center w-6 h-6 transition-transform group-active:scale-95">.*</div>|<img src="/Sentinellogo.jpg" alt="Sentinel AI" className="w-7 h-7 rounded-lg object-cover" />|' /Users/manideep/Documents/lkk/pages/VerifyUploadPage.tsx

# Replace logo in AnalyticsPage.tsx
sed -i '' '82,85s|<div className="relative flex items-center justify-center w-6 h-6 transition-transform group-active:scale-95">.*</div>|<img src="/Sentinellogo.jpg" alt="Sentinel AI" className="w-7 h-7 rounded-lg object-cover" />|' /Users/manideep/Documents/lkk/pages/AnalyticsPage.tsx

# Replace logo in SignIn.tsx
sed -i '' '35,37s|<div className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-500/20 mb-6 shadow-lg border border-purple-500/30 pulse-glow">.*</div>|<img src="/Sentinellogo.jpg" alt="Sentinel AI" className="w-16 h-16 rounded-xl object-cover mb-6 shadow-lg border border-purple-500/30" />|' /Users/manideep/Documents/lkk/components/ui/SignIn.tsx

# Replace logo in SignUp.tsx
sed -i '' '50,52s|<div className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-500/20 mb-6 shadow-lg border border-purple-500/30 pulse-glow">.*</div>|<img src="/Sentinellogo.jpg" alt="Sentinel AI" className="w-16 h-16 rounded-xl object-cover mb-6 shadow-lg border border-purple-500/30" />|' /Users/manideep/Documents/lkk/components/ui/SignUp.tsx

echo "Logo replacement complete!"

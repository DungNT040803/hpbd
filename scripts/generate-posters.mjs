import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const thumbOutputDir = path.resolve('public/assets/thumbs');
const dataOutputDir = path.resolve('public/data');
const memoriesFile = path.join(dataOutputDir, 'memories.json');

async function generateVideoPosters() {
  if (!fs.existsSync(memoriesFile)) return;
  const memories = JSON.parse(fs.readFileSync(memoriesFile, 'utf8'));

  for (const mem of memories) {
    if (mem.type === 'video') {
      const videoName = path.parse(mem.url).name;
      const thumbFile = path.join(thumbOutputDir, `${videoName}.webp`);

      const svgPoster = `
      <svg width="720" height="720" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#4c1d95" />
            <stop offset="60%" stop-color="#1e1b4b" />
            <stop offset="100%" stop-color="#090514" />
          </radialGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <!-- Star sparkles -->
        <circle cx="150" cy="180" r="3" fill="#ffffff" opacity="0.8"/>
        <circle cx="560" cy="220" r="2.5" fill="#f43f5e" opacity="0.7"/>
        <circle cx="200" cy="550" r="2" fill="#fbbf24" opacity="0.6"/>
        <circle cx="520" cy="580" r="3" fill="#38bdf8" opacity="0.8"/>
        
        <!-- Video film borders -->
        <rect x="60" y="60" width="600" height="600" rx="24" fill="none" stroke="#ec4899" stroke-width="3" opacity="0.4"/>
        
        <!-- Glowing play button -->
        <circle cx="360" cy="340" r="64" fill="#f43f5e" filter="url(#glow)"/>
        <polygon points="345,308 395,340 345,372" fill="#ffffff"/>
        
        <!-- Title & Date -->
        <text x="360" y="460" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">
          ${mem.title}
        </text>
        <text x="360" y="500" font-family="system-ui, sans-serif" font-size="20" fill="#fda4af" text-anchor="middle">
          🎬 Video Kỷ Niệm • ${mem.date}
        </text>
      </svg>
      `;

      await sharp(Buffer.from(svgPoster))
        .webp({ quality: 85 })
        .toFile(thumbFile);

      mem.thumb = `assets/thumbs/${videoName}.webp`;
      console.log(`Generated video poster for: ${videoName}`);
    }
  }

  fs.writeFileSync(memoriesFile, JSON.stringify(memories, null, 2), 'utf8');
  console.log('Updated memories.json with video posters!');
}

generateVideoPosters().catch(console.error);

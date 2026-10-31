import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import sharp from 'sharp';

const ffmpegPath = ffmpegInstaller.path;
const videosDir = path.resolve('public/assets/videos');
const thumbsDir = path.resolve('public/assets/thumbs');
const memoriesFile = path.resolve('public/data/memories.json');

async function fixVideos() {
  console.log('Using FFmpeg from:', ffmpegPath);

  const videoFiles = fs.readdirSync(videosDir).filter(f => f.endsWith('.mp4'));
  console.log(`Found ${videoFiles.length} videos to optimize:`, videoFiles);

  for (const file of videoFiles) {
    const inputPath = path.join(videosDir, file);
    const tempOutputPath = path.join(videosDir, `opt_${file}`);
    const tempFramePath = path.join(videosDir, `frame_${path.parse(file).name}.jpg`);
    const baseName = path.parse(file).name;
    const destThumb = path.join(thumbsDir, `${baseName}.webp`);

    console.log(`\nProcessing video: ${file}...`);

    // 1. Re-encode video with faststart, universal yuv420p, crf 23, and normalized rotation
    try {
      execFileSync(ffmpegPath, [
        '-y',
        '-i', inputPath,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'fast',
        '-crf', '23',
        '-movflags', '+faststart',
        '-c:a', 'aac',
        '-b:a', '128k',
        tempOutputPath
      ], { stdio: 'inherit' });

      // Replace original with optimized version
      fs.unlinkSync(inputPath);
      fs.renameSync(tempOutputPath, inputPath);
      console.log(`-> Optimized ${file} successfully (web-ready + faststart)!`);
    } catch (err) {
      console.error(`Error optimizing ${file}:`, err);
      if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
    }

    // 2. Extract an actual high quality frame from the video for thumbnail
    try {
      execFileSync(ffmpegPath, [
        '-y',
        '-ss', '00:00:01',
        '-i', inputPath,
        '-vframes', '1',
        '-q:v', '2',
        tempFramePath
      ], { stdio: 'inherit' });

      if (fs.existsSync(tempFramePath)) {
        // Read extracted frame and composite with a glowing play badge
        const playBadgeSvg = `
        <svg width="720" height="720" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <circle cx="360" cy="360" r="54" fill="rgba(244, 63, 94, 0.9)" filter="url(#glow)"/>
          <polygon points="348,335 388,360 348,385" fill="#ffffff"/>
        </svg>
        `;

        await sharp(tempFramePath)
          .resize(720, 720, { fit: 'cover' })
          .composite([{ input: Buffer.from(playBadgeSvg), top: 0, left: 0 }])
          .webp({ quality: 85 })
          .toFile(destThumb);

        fs.unlinkSync(tempFramePath);
        console.log(`-> Generated vivid thumbnail with play badge for ${file}!`);
      }
    } catch (err) {
      console.error(`Error extracting frame for ${file}:`, err);
      if (fs.existsSync(tempFramePath)) fs.unlinkSync(tempFramePath);
    }
  }

  // Ensure memories.json points to the thumbnail
  if (fs.existsSync(memoriesFile)) {
    const memories = JSON.parse(fs.readFileSync(memoriesFile, 'utf8'));
    for (const mem of memories) {
      if (mem.type === 'video') {
        const baseName = path.parse(mem.url).name;
        mem.thumb = `assets/thumbs/${baseName}.webp`;
      }
    }
    fs.writeFileSync(memoriesFile, JSON.stringify(memories, null, 2), 'utf8');
    console.log('\nUpdated memories.json successfully!');
  }
}

fixVideos().catch(console.error);


import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import heicConvert from 'heic-convert';

const inputDir = path.resolve('image');
const outputDir = path.resolve('public/assets');
const imgOutputDir = path.join(outputDir, 'images');
const thumbOutputDir = path.join(outputDir, 'thumbs');
const videoOutputDir = path.join(outputDir, 'videos');
const dataOutputDir = path.resolve('public/data');

[outputDir, imgOutputDir, thumbOutputDir, videoOutputDir, dataOutputDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function run() {
  const files = fs.readdirSync(inputDir);
  console.log(`Found ${files.length} files in ${inputDir}`);
  
  const memories = [];

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(inputDir, filename);
    const ext = path.extname(filename).toLowerCase();
    const baseName = path.parse(filename).name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const stat = fs.statSync(filePath);

    console.log(`[${i + 1}/${files.length}] Processing: ${filename} (${ext})...`);

    let dateStr = 'Kỷ niệm đáng nhớ';
    let year = 2023;
    let sortTime = stat.mtimeMs;

    // Detect date from filename
    const dateMatch = filename.match(/(20\d{2})[-_]?(\d{2})[-_]?(\d{2})/);
    const tsMatch = filename.match(/IMG_(\d{13})/);

    if (dateMatch) {
      year = parseInt(dateMatch[1]);
      const month = dateMatch[2];
      const day = dateMatch[3];
      dateStr = `${day}/${month}/${year}`;
      sortTime = new Date(`${year}-${month}-${day}`).getTime();
    } else if (tsMatch) {
      const ts = parseInt(tsMatch[1]);
      const d = new Date(ts);
      year = d.getFullYear();
      dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${year}`;
      sortTime = ts;
    } else if (filename.includes('TIEN')) {
      dateStr = 'Khoảnh khắc rạng rỡ';
      sortTime = stat.mtimeMs;
    }

    if (ext === '.mp4') {
      const destVideo = path.join(videoOutputDir, `${baseName}.mp4`);
      fs.copyFileSync(filePath, destVideo);

      memories.push({
        id: `mem-${i}`,
        type: 'video',
        title: `Thước phim kỷ niệm ${year}`,
        date: dateStr,
        year: year,
        sortTime: sortTime,
        url: `assets/videos/${baseName}.mp4`,
        thumb: null, // will use placeholder or video poster
        caption: 'Một khoảnh khắc sống động lưu giữ tiếng cười và kỷ niệm ngọt ngào.'
      });
    } else if (ext === '.heic') {
      try {
        const inputBuffer = fs.readFileSync(filePath);
        const outputBuffer = await heicConvert({
          buffer: inputBuffer,
          format: 'JPEG',
          quality: 0.85
        });

        const destImg = path.join(imgOutputDir, `${baseName}.webp`);
        const destThumb = path.join(thumbOutputDir, `${baseName}.webp`);

        await sharp(outputBuffer)
          .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(destImg);

        await sharp(outputBuffer)
          .resize(720, 720, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 75 })
          .toFile(destThumb);

        memories.push({
          id: `mem-${i}`,
          type: 'image',
          title: `Nụ cười tỏa nắng ${year}`,
          date: dateStr,
          year: year,
          sortTime: sortTime,
          url: `assets/images/${baseName}.webp`,
          thumb: `assets/thumbs/${baseName}.webp`,
          caption: 'Bức ảnh ghi lại nụ cười rạng rỡ và ánh mắt ngập tràn hạnh phúc.'
        });
        console.log(`Converted HEIC: ${filename} -> webp`);
      } catch (err) {
        console.error(`Failed to convert HEIC ${filename}:`, err);
      }
    } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      try {
        const destImg = path.join(imgOutputDir, `${baseName}.webp`);
        const destThumb = path.join(thumbOutputDir, `${baseName}.webp`);

        await sharp(filePath)
          .rotate() // auto rotate based on EXIF
          .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(destImg);

        await sharp(filePath)
          .rotate()
          .resize(720, 720, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 75 })
          .toFile(destThumb);

        let title = `Khoảnh khắc ngọt ngào`;
        let caption = 'Mỗi ngày trôi qua đều là một kỷ niệm đẹp khi có bạn bên cạnh.';
        if (filename.toLowerCase().includes('screenshot')) {
          title = `Dòng tin nhắn đáng yêu`;
          caption = 'Những tin nhắn sẻ chia, những câu chuyện vui buồn mà chúng ta từng gửi gắm cho nhau.';
        } else if (filename.toLowerCase().includes('tien')) {
          title = `Nàng thơ rực rỡ`;
          caption = 'Vẻ đẹp trong trẻo, nụ cười làm bừng sáng cả một góc trời.';
        }

        memories.push({
          id: `mem-${i}`,
          type: 'image',
          title: title,
          date: dateStr,
          year: year,
          sortTime: sortTime,
          url: `assets/images/${baseName}.webp`,
          thumb: `assets/thumbs/${baseName}.webp`,
          caption: caption
        });
      } catch (err) {
        console.error(`Failed to process image ${filename}:`, err);
      }
    }
  }

  // Sort memories chronologically
  memories.sort((a, b) => a.sortTime - b.sortTime);

  // Write memories.json
  fs.writeFileSync(path.join(dataOutputDir, 'memories.json'), JSON.stringify(memories, null, 2), 'utf8');
  console.log(`Successfully generated memories.json with ${memories.length} items!`);
}

run().catch(console.error);

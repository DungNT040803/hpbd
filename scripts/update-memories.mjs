import fs from 'fs';
import path from 'path';

const curatedMemories = [
  {
    id: "mem-1",
    type: "image",
    title: "Nàng Thơ Rạng Rỡ ✨",
    caption: "Bức ảnh mở đầu hành trình với nụ cười làm bừng sáng cả dải ngân hà.",
    url: "assets/images/1R7A1909_copy_1.webp",
    thumb: "assets/thumbs/1R7A1909_copy_1.webp"
  },
  {
    id: "mem-2",
    type: "image",
    title: "Dòng Tin Nhắn Đáng Yêu 💬",
    caption: "Những câu chuyện xàm xí không hồi kết mà hai đứa từng chia sẻ cùng nhau.",
    url: "assets/images/Screenshot_20220507-191654_Messenger_1.webp",
    thumb: "assets/thumbs/Screenshot_20220507-191654_Messenger_1.webp"
  },
  {
    id: "mem-3",
    type: "video",
    title: "Thước Phim Tấu Hài 🎬",
    caption: "Một khoảnh khắc sống động lưu lại tiếng cười giòn tan và sự nhây không thể cứu chữa =)))",
    url: "assets/videos/20210617_092827_1.mp4",
    thumb: "assets/thumbs/20210617_092827_1.webp"
  },
  {
    id: "mem-4",
    type: "image",
    title: "Khoảnh Khắc Bình Yên 🌿",
    caption: "Những ngày tháng vô tư, chỉ cần có đồng bọn bên cạnh là vui cả ngày.",
    url: "assets/images/20191103_144302_1__1_.webp",
    thumb: "assets/thumbs/20191103_144302_1__1_.webp"
  },
  {
    id: "mem-5",
    type: "image",
    title: "Nét Đẹp Bá Khí Ngời Ngời 👑",
    caption: "Thần thái ngút ngàn, xinh đẹp và tỏa sáng rực rỡ dưới ánh mặt trời.",
    url: "assets/images/0775a89526f193c4d4cf59b3a577df76_TIEN7174.webp",
    thumb: "assets/thumbs/0775a89526f193c4d4cf59b3a577df76_TIEN7174.webp"
  },
  {
    id: "mem-6",
    type: "image",
    title: "Bức Ảnh Bắt Trọn Cảm Xúc 📸",
    caption: "Mỗi biểu cảm đều là một mảnh ghép kỷ niệm vô giá mà tui luôn trân trọng.",
    url: "assets/images/IMG_6968_1.webp",
    thumb: "assets/thumbs/IMG_6968_1.webp"
  },
  {
    id: "mem-7",
    type: "image",
    title: "Tin Nhắn Đi Vào Lòng Đất 📱",
    caption: "Những pha xử lý khiến người ta chỉ biết đứng hình và cạn lời =))))",
    url: "assets/images/Screenshot_20211010-105819_Facebook_1.webp",
    thumb: "assets/thumbs/Screenshot_20211010-105819_Facebook_1.webp"
  },
  {
    id: "mem-8",
    type: "video",
    title: "Khoảnh Khắc Quậy Tưng Bừng 📹",
    caption: "Chứng minh sự tồn tại của một thiên thần nhưng lúc vận chuyển hơi bị lỗi nhẹ 😆",
    url: "assets/videos/20211030_095623_1.mp4",
    thumb: "assets/thumbs/20211030_095623_1.webp"
  },
  {
    id: "mem-9",
    type: "image",
    title: "Góc Nghiêng Thần Thánh 🌸",
    caption: "Góc nào cũng đẹp, phong thái nhẹ nhàng và trong trẻo như sương mai.",
    url: "assets/images/IMG_6970_1.webp",
    thumb: "assets/thumbs/IMG_6970_1.webp"
  },
  {
    id: "mem-10",
    type: "image",
    title: "Kỷ Niệm Khó Quên 🎈",
    caption: "Những chuyến đi, những buổi hẹn hò ăn uống và cười đến đau cả bụng.",
    url: "assets/images/20211214_205338_1.webp",
    thumb: "assets/thumbs/20211214_205338_1.webp"
  },
  {
    id: "mem-11",
    type: "image",
    title: "Cuộc Trò Chuyện Bất Tận 💌",
    caption: "Dù nói về chuyện trên trời dưới biển thì vẫn thấy chưa bao giờ hết chuyện để kể.",
    url: "assets/images/Screenshot_20230601-140247_Messenger_1.webp",
    thumb: "assets/thumbs/Screenshot_20230601-140247_Messenger_1.webp"
  },
  {
    id: "mem-12",
    type: "image",
    title: "Nụ Cười Tỏa Nắng ☀️",
    caption: "Chỉ cần nhìn thấy nụ cười này là mọi mệt mỏi trong ngày đều tan biến hết.",
    url: "assets/images/IMG_6974_1.webp",
    thumb: "assets/thumbs/IMG_6974_1.webp"
  },
  {
    id: "mem-13",
    type: "video",
    title: "Thước Phim Đáng Nhớ 🎬",
    caption: "Lưu giữ trọn vẹn những nét đáng yêu, ngây ngô và năng lượng tích cực nhất.",
    url: "assets/videos/received_2595681550734205_1.mp4",
    thumb: "assets/thumbs/received_2595681550734205_1.webp"
  },
  {
    id: "mem-14",
    type: "image",
    title: "Những Trò Ngáo Ngơ 🤪",
    caption: "Ai bảo người lớn là không được nhây? Bên nhau là tự động biến thành con nít ngay!",
    url: "assets/images/20220131_220144_1.webp",
    thumb: "assets/thumbs/20220131_220144_1.webp"
  },
  {
    id: "mem-15",
    type: "image",
    title: "Bức Ảnh Đầy Kỷ Niệm 💫",
    caption: "Thời gian có thể trôi nhanh nhưng tình bạn và những ký ức này sẽ luôn ở lại.",
    url: "assets/images/IMG_1638674649808_1638756066485_1.webp",
    thumb: "assets/thumbs/IMG_1638674649808_1638756066485_1.webp"
  },
  {
    id: "mem-16",
    type: "image",
    title: "Màn Hình Quen Thuộc 📲",
    caption: "Một thoáng bắt gặp những mảnh ký ức nho nhỏ trong cuộc sống thường ngày.",
    url: "assets/images/Screenshot_20210211-170246_Samsung_Experience_Home_1.webp",
    thumb: "assets/thumbs/Screenshot_20210211-170246_Samsung_Experience_Home_1.webp"
  },
  {
    id: "mem-17",
    type: "image",
    title: "Cực Phẩm Nhan Sắc 🌷",
    caption: "Một vẻ đẹp dịu dàng, tự nhiên và luôn toát lên sức hút đặc biệt.",
    url: "assets/images/103493cf4d46d8628ebac365ad60c472_TIEN6755.webp",
    thumb: "assets/thumbs/103493cf4d46d8628ebac365ad60c472_TIEN6755.webp"
  },
  {
    id: "mem-18",
    type: "image",
    title: "Cùng Nhau Trưởng Thành 🌟",
    caption: "Qua bao nhiêu mùa vui buồn, thật may mắn vì chúng ta vẫn luôn đồng hành bên nhau.",
    url: "assets/images/IMG_20210410_202555_1.webp",
    thumb: "assets/thumbs/IMG_20210410_202555_1.webp"
  },
  {
    id: "mem-19",
    type: "image",
    title: "Khoảnh Khắc Rực Rỡ 🌈",
    caption: "Luôn tràn đầy năng lượng, mang đến niềm vui cho tất cả mọi người xung quanh.",
    url: "assets/images/IMG_6979_1.webp",
    thumb: "assets/thumbs/IMG_6979_1.webp"
  },
  {
    id: "mem-20",
    type: "image",
    title: "Những Chuyến Đi Đáng Nhớ 🎒",
    caption: "Cùng đi qua những con đường, ngắm những khung cảnh đẹp và lưu giữ nụ cười.",
    url: "assets/images/20230702_183837_1.webp",
    thumb: "assets/thumbs/20230702_183837_1.webp"
  },
  {
    id: "mem-21",
    type: "image",
    title: "Đồng Bọn Số 1 🤝",
    caption: "Dù đôi lúc muốn đem đi bảo hành nhưng chắc chắn không ai thay thế được!",
    url: "assets/images/received_123217733004222_1.webp",
    thumb: "assets/thumbs/received_123217733004222_1.webp"
  },
  {
    id: "mem-22",
    type: "image",
    title: "Mãi Mặn, Mãi Keo ✨",
    caption: "Cảm ơn vì đã luôn ở đây, luôn là chính mình và mang đến thật nhiều niềm vui.",
    url: "assets/images/received_4340290666099967_1.webp",
    thumb: "assets/thumbs/received_4340290666099967_1.webp"
  },
  {
    id: "mem-23",
    type: "image",
    title: "Nụ Cười Hạnh Phúc 💖",
    caption: "Mong rằng tuổi mới sẽ mang đến cho bạn triệu niềm vui và vạn điều như ý.",
    url: "assets/images/IMG_1688377007737_1688378749580_1.webp",
    thumb: "assets/thumbs/IMG_1688377007737_1688378749580_1.webp"
  },
  {
    id: "mem-24",
    type: "image",
    title: "Khoảnh Khắc Chạm Tới Trái Tim 🎂",
    caption: "Và bây giờ, hãy cùng bước tới điểm đến kỳ diệu nhất của bữa tiệc sinh nhật nhé!",
    url: "assets/images/received_744503002842324_1.webp",
    thumb: "assets/thumbs/received_744503002842324_1.webp"
  }
];

const dataPath = path.resolve('public/data/memories.json');
fs.writeFileSync(dataPath, JSON.stringify(curatedMemories, null, 2), 'utf8');
console.log('Successfully written curated memories without dates to public/data/memories.json');

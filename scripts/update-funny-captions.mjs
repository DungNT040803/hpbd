import fs from 'fs';
import path from 'path';

const funnyMemories = [
  {
    id: "mem-1",
    type: "image",
    title: "Thiên Thần Lúc Chưa Bị 'Lỗi Vận Chuyển' 👼",
    caption: "Nhìn ngoan hiền, trong sáng, ai ngờ đâu sau này biến hình thành trùm báo thủ của nhóm =))))",
    url: "assets/images/1R7A1909_copy_1.webp",
    thumb: "assets/thumbs/1R7A1909_copy_1.webp"
  },
  {
    id: "mem-2",
    type: "image",
    title: "Pha Nói Chuyện Đi Vào Lòng Đất 📱",
    caption: "Nhiều lúc đọc lại tin nhắn chỉ biết tự hỏi: 'Ủa sao con người này có thể sống sót tới tận bây giờ hay vậy trời?' 😭",
    url: "assets/images/Screenshot_20220507-191654_Messenger_1.webp",
    thumb: "assets/thumbs/Screenshot_20220507-191654_Messenger_1.webp"
  },
  {
    id: "mem-3",
    type: "video",
    title: "Bằng Chứng Thép Về Sự Nhây Vô Tội Vạ 🎬",
    caption: "Video này đề nghị lưu lại làm bằng chứng lịch sử, sau này có chuyện gì đem ra dọa cưới =))))",
    url: "assets/videos/20210617_092827_1.mp4",
    thumb: "assets/thumbs/20210617_092827_1.webp"
  },
  {
    id: "mem-4",
    type: "image",
    title: "Kỷ Niệm Lúc Còn 'Tử Tế' 🌿",
    caption: "Hồi này nhìn còn e thẹn, ngây thơ, chưa bộc lộ hết 100% bản chất nhây bựa và lầy lội.",
    url: "assets/images/20191103_144302_1__1_.webp",
    thumb: "assets/thumbs/20191103_144302_1__1_.webp"
  },
  {
    id: "mem-5",
    type: "image",
    title: "Nhan Sắc Gánh Còng Lưng Cho Cái Nết 👑",
    caption: "10 điểm ngoại hình, thần thái ngời ngời, nhưng trừ 1 điểm vì hay làm thí nghiệm khoa học đường ruột ✨",
    url: "assets/images/0775a89526f193c4d4cf59b3a577df76_TIEN7174.webp",
    thumb: "assets/thumbs/0775a89526f193c4d4cf59b3a577df76_TIEN7174.webp"
  },
  {
    id: "mem-6",
    type: "image",
    title: "Biểu Cảm Đang Tính Kế Đi Báo 😈",
    caption: "Ánh mắt ấy, nụ cười ấy... linh cảm mách bảo sắp có một pha xử lý cồng kềnh xuất hiện!",
    url: "assets/images/IMG_6968_1.webp",
    thumb: "assets/thumbs/IMG_6968_1.webp"
  },
  {
    id: "mem-7",
    type: "image",
    title: "Bàn Luận Chuyện Quốc Gia Đại Sự ☕",
    caption: "Toàn nói những chuyện xàm xí không hồi kết nhưng cười muốn rớt cả quai hàm =))))",
    url: "assets/images/Screenshot_20211010-105819_Facebook_1.webp",
    thumb: "assets/thumbs/Screenshot_20211010-105819_Facebook_1.webp"
  },
  {
    id: "mem-8",
    type: "video",
    title: "Trích Đoạn: Cuộc Đời Của Một Báo Thủ 📹",
    caption: "Có những hành động mà khoa học hiện đại cũng chưa thể tìm ra lý do tại sao lại làm như vậy 🤣",
    url: "assets/videos/20211030_095623_1.mp4",
    thumb: "assets/thumbs/20211030_095623_1.webp"
  },
  {
    id: "mem-9",
    type: "image",
    title: "Góc Nghiêng Thần Thánh Tính Tình Thần Kinh 🌸",
    caption: "Đứng yên chụp hình thì như nàng thơ, mở miệng ra nói chuyện cái là hóa nghệ sĩ hài ngay!",
    url: "assets/images/IMG_6970_1.webp",
    thumb: "assets/thumbs/IMG_6970_1.webp"
  },
  {
    id: "mem-10",
    type: "image",
    title: "Pha Hẹn Hò Đi Ăn Sập Quán 🍜",
    caption: "Đi đâu không quan trọng, quan trọng là có đứa chịu ngồi nghe mình xàm xí và bao ăn =)))",
    url: "assets/images/20211214_205338_1.webp",
    thumb: "assets/thumbs/20211214_205338_1.webp"
  },
  {
    id: "mem-11",
    type: "image",
    title: "Tâm Sự Đêm Khuya Cùng Tri Kỷ 🌙",
    caption: "Những phút giây bất lực không nói nên lời trước độ nhây vô cực của Azai yêu dấu.",
    url: "assets/images/Screenshot_20230601-140247_Messenger_1.webp",
    thumb: "assets/thumbs/Screenshot_20230601-140247_Messenger_1.webp"
  },
  {
    id: "mem-12",
    type: "image",
    title: "Nụ Cười Tươi Như Hoa Nở... Nhưng Sắp Quậy 🌻",
    caption: "Cười tươi thế này chắc chắn là vừa nghĩ ra trò gì đó chuẩn bị đem bạn bè ra làm chuột bạch rồi.",
    url: "assets/images/IMG_6974_1.webp",
    thumb: "assets/thumbs/IMG_6974_1.webp"
  },
  {
    id: "mem-13",
    type: "video",
    title: "Tuyệt Kỹ Tấu Hài Đỉnh Cao 🌟",
    caption: "Đem Azai đi thi Thách Thức Danh Hài chắc rinh giải đặc biệt về khao cả nhóm ăn lẩu quá =))))",
    url: "assets/videos/received_2595681550734205_1.mp4",
    thumb: "assets/thumbs/received_2595681550734205_1.webp"
  },
  {
    id: "mem-14",
    type: "image",
    title: "Tết Nhất Cũng Không Quên Bản Năng Báo 🧧",
    caption: "Tuổi mới sang mà độ ngáo ngơ vẫn được bảo tồn và phát huy xuất sắc theo năm tháng!",
    url: "assets/images/20220131_220144_1.webp",
    thumb: "assets/thumbs/20220131_220144_1.webp"
  },
  {
    id: "mem-15",
    type: "image",
    title: "Bức Ảnh Tràn Ngập Sự Dễ Thương (Chắc Vậy) 🧸",
    caption: "Dù đôi lúc cũng muốn đem đi bảo hành nhưng nghĩ lại chắc nhà sản xuất cũng từ chối nhận hàng 🥹",
    url: "assets/images/IMG_1638674649808_1638756066485_1.webp",
    thumb: "assets/thumbs/IMG_1638674649808_1638756066485_1.webp"
  },
  {
    id: "mem-16",
    type: "image",
    title: "Lưu Lại Cho Hậu Thế Chiêm Ngưỡng 💾",
    caption: "Mảnh chứng cứ lịch sử cho thấy tình bạn này đã cùng nhau vượt qua biết bao nhiêu kiếp nạn =))))",
    url: "assets/images/Screenshot_20210211-170246_Samsung_Experience_Home_1.webp",
    thumb: "assets/thumbs/Screenshot_20210211-170246_Samsung_Experience_Home_1.webp"
  },
  {
    id: "mem-17",
    type: "image",
    title: "Bức Ảnh Triệu Like Chữa Lành Mọi Vết Thương 💖",
    caption: "Thôi khen thật một câu: Bức này xinh xỉu, không dám dìm vì sợ bị giận không cho ăn chực nữa!",
    url: "assets/images/103493cf4d46d8628ebac365ad60c472_TIEN6755.webp",
    thumb: "assets/thumbs/103493cf4d46d8628ebac365ad60c472_TIEN6755.webp"
  },
  {
    id: "mem-18",
    type: "image",
    title: "Khoảnh Khắc 'Bình Yên Trước Cơn Bão' ⚡",
    caption: "Trước khi bắt đầu những chuỗi ngày báo đời nhau thì hai đứa đã từng có lúc bình yên thế này đây.",
    url: "assets/images/IMG_20210410_202555_1.webp",
    thumb: "assets/thumbs/IMG_20210410_202555_1.webp"
  },
  {
    id: "mem-19",
    type: "image",
    title: "Tiểu Thư Đài Các Nhưng Hơi Hậu Đậu 🎀",
    caption: "Mong tuổi mới bớt vấp té, bớt làm rơi đồ và bớt hậu đậu lại một xíu xiu nha Azai =))))",
    url: "assets/images/IMG_6979_1.webp",
    thumb: "assets/thumbs/IMG_6979_1.webp"
  },
  {
    id: "mem-20",
    type: "image",
    title: "Đôi Chân Đi Không Mỏi Của Đội Báo 🛵",
    caption: "Cùng nhau vi vu khắp nơi, quậy từ ngõ hẻm ra tới phố lớn, ở đâu có đồ ăn ngon là ở đó có mặt.",
    url: "assets/images/20230702_183837_1.webp",
    thumb: "assets/thumbs/20230702_183837_1.webp"
  },
  {
    id: "mem-21",
    type: "image",
    title: "Đồng Bọn Số 1 Không Thể Thay Thế 🤝",
    caption: "Dù trời có sập thì vẫn cứ phải keo, phải mặn và đồng hành cùng nhau tới bến!",
    url: "assets/images/received_123217733004222_1.webp",
    thumb: "assets/thumbs/received_123217733004222_1.webp"
  },
  {
    id: "mem-22",
    type: "image",
    title: "Mãi Đỉnh, Mãi Keo Nhưng Báo Có Chọn Lọc 🤣",
    caption: "Chúc Azai tiền vào như nước sông Đà, tiền ra nhỏ giọt như cà phê phin nha!",
    url: "assets/images/received_4340290666099967_1.webp",
    thumb: "assets/thumbs/received_4340290666099967_1.webp"
  },
  {
    id: "mem-23",
    type: "image",
    title: "Nụ Cười Tỏa Nắng 100 Điểm Không Có Nhưng ✨",
    caption: "Mong bạn luôn giữ được nụ cười rạng ngời hạnh phúc này, dù cuộc đời có sóng gió cỡ nào!",
    url: "assets/images/IMG_1688377007737_1688378749580_1.webp",
    thumb: "assets/thumbs/IMG_1688377007737_1688378749580_1.webp"
  },
  {
    id: "mem-24",
    type: "image",
    title: "Trạm Dừng Cuối: Chuẩn Bị Nhận Quà Khủng 🎁",
    caption: "Ngắm đủ 24 kiếp nạn rồi, giờ thì tiến thẳng tới bục Bánh Sinh Nhật để ước điều ước đi nào! 🎂",
    url: "assets/images/received_744503002842324_1.webp",
    thumb: "assets/thumbs/received_744503002842324_1.webp"
  }
];

const dataPath = path.resolve('public/data/memories.json');
fs.writeFileSync(dataPath, JSON.stringify(funnyMemories, null, 2), 'utf8');
console.log('Successfully updated memories with hilarious captions!');


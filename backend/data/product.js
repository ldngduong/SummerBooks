const products = [
  {
    name: "Mắt biếc",
    description: "Một tác phẩm được nhiều người bình chọn là hay nhất của Nguyễn Nhật Ánh...",
    price: 50000,
    countInStock: 20,
    countOfPage: 20,
    category: "Tiểu thuyết",
    author: "Nguyễn Nhật Ánh",
    images: [
      { url: "https://picsum.photos/500/500?random=39", altText: "Mắt biếc" },
      { url: "https://picsum.photos/500/500?random=40", altText: "Mắt biếc" },
    ],
    rating: 4.5,
    numReviews: 12,
    publishedAt: '2018-07-07'
  },
  {
    name: "Dế mèn phiêu lưu ký",
    description: "Cuốn sách kể về hành trình phiêu lưu của chú dế mèn dũng cảm...",
    price: 40000,
    countInStock: 15,
    countOfPage: 20,
    category: "Tiểu thuyết",
    author: "Tô Hoài",
    images: [
      { url: "https://picsum.photos/500/500?random=41", altText: "Dế mèn phiêu lưu ký" },
      { url: "https://picsum.photos/500/500?random=42", altText: "Dế mèn phiêu lưu ký" },
    ],
    rating: 4.8,
    numReviews: 18,
    publishedAt: '2018-07-07'
  },
  {
    name: "Vật lý lượng tử",
    description: "Cuốn sách giải thích về các nguyên lý vật lý lượng tử một cách dễ hiểu...",
    price: 120000,
    countInStock: 10,
    countOfPage: 20,
    category: "Sách khoa học",
    author: "Stephen Hawking",
    images: [
      { url: "https://picsum.photos/500/500?random=43", altText: "Vật lý lượng tử" },
      { url: "https://picsum.photos/500/500?random=44", altText: "Vật lý lượng tử" },
    ],
    rating: 4.7,
    numReviews: 25,
    publishedAt: '2018-07-07'
  },
  {
    name: "Từ điển Anh - Việt",
    description: "Cuốn từ điển Anh - Việt đầy đủ nhất dành cho học sinh và sinh viên...",
    price: 80000,
    countInStock: 30,
    countOfPage: 20,
    category: "Từ điển",
    author: "NXB Giáo dục",
    images: [
      { url: "https://picsum.photos/500/500?random=45", altText: "Từ điển Anh - Việt" },
      { url: "https://picsum.photos/500/500?random=46", altText: "Từ điển Anh - Việt" },
    ],
    rating: 4.3,
    numReviews: 14,
    publishedAt: '2018-07-07'
  },
  {
    name: "Sách giáo khoa Toán 12",
    description: "Sách giáo khoa Toán lớp 12 theo chương trình giáo dục phổ thông...",
    price: 50000,
    countInStock: 40,
    countOfPage: 20,
    category: "Sách giáo khoa",
    author: "Bộ Giáo dục và Đào tạo",
    images: [
      { url: "https://picsum.photos/500/500?random=47", altText: "Sách giáo khoa Toán 12" },
      { url: "https://picsum.photos/500/500?random=48", altText: "Sách giáo khoa Toán 12" },
    ],
    rating: 4.6,
    numReviews: 20,
    publishedAt: '2018-07-07'
  }
];

module.exports = products;

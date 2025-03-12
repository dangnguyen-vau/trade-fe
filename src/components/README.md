# Components

Thư mục này chứa tất cả các components trong ứng dụng, được tổ chức thành 3 nhóm chính:

- **common**: Components cơ bản, có thể tái sử dụng trong toàn bộ ứng dụng (Button, Card, Input, etc.)
- **layout**: Components định nghĩa cấu trúc bố cục của trang (TopBar, SideBar, Footer, etc.)
- **features**: Components cụ thể cho từng tính năng của ứng dụng (Dashboard, BotStrategy, etc.)

## Quy ước đặt tên

- Tên components nên viết theo PascalCase (VD: BotCard, ProfitChart)
- File CSS đi kèm nên có cùng tên với file component (VD: BotCard.js, BotCard.css)
- Mỗi component nên được đặt trong thư mục riêng với file index.js để export

## Cấu trúc thư mục của component

```
ComponentName/
├── ComponentName.js      # Component chính
├── ComponentName.css     # Styles cho component
└── index.js              # Re-export component
```

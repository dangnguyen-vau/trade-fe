# Feature Components

Thư mục này chứa các components cụ thể cho từng tính năng của ứng dụng. Mỗi tính năng được đặt trong một thư mục riêng.

## Cấu trúc

```
FeatureName/
├── ComponentA/
│   ├── ComponentA.js
│   ├── ComponentA.css
│   └── index.js
├── ComponentB/
│   ├── ComponentB.js
│   ├── ComponentB.css
│   └── index.js
└── ...
```

## Các tính năng hiện có

- **Dashboard**: Components liên quan đến trang Dashboard
- **BotStrategy**: Components liên quan đến phân tích chiến lược bot

## Quy tắc thiết kế

1. Mỗi component nên tập trung vào một chức năng cụ thể
2. Tránh phụ thuộc vào các feature components khác, ưu tiên sử dụng common và layout components
3. Nên tài liệu hóa các props bằng JSDoc và propTypes
4. Nên tách biệt logic và UI

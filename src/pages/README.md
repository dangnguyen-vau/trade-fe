# Pages

Thư mục này chứa các trang chính của ứng dụng. Mỗi trang là một container kết hợp nhiều components để tạo thành UI hoàn chỉnh.

## Cấu trúc thư mục của mỗi trang

```
PageName/
├── PageName.js      # Component chính của trang
├── PageName.css     # Styles cho trang
└── index.js         # Re-export component
```

## Quy ước đặt tên

- Tên trang nên viết theo PascalCase (VD: Dashboard, StrategyAnalysis)
- File CSS đi kèm nên có cùng tên với file trang (VD: Dashboard.js, Dashboard.css)

## Các trang hiện có

- **Dashboard**: Trang chính hiển thị tổng quan
- **StrategyAnalysis**: Trang phân tích chiến lược

## Quy tắc thiết kế

1. Pages chủ yếu nên tập trung vào việc kết hợp các components
2. Logic nghiệp vụ phức tạp nên được đặt trong custom hooks hoặc contexts
3. Fetch dữ liệu nên được thực hiện trong pages hoặc custom hooks
4. Nên sử dụng lazy loading cho các pages lớn

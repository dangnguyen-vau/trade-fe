# Hooks

Thư mục này chứa các custom React hooks được sử dụng trong ứng dụng.

## Quy ước đặt tên

- Tên hooks nên bắt đầu bằng "use" theo quy ước của React hooks (VD: useBotsData, useTradeHistory)
- Mỗi hook nên làm một nhiệm vụ cụ thể và tái sử dụng được

## Các hooks hiện có

- **useBotsData**: Hook để lấy dữ liệu về bots
- **useTradeHistory**: Hook để lấy lịch sử giao dịch

## Quy tắc thiết kế

1. Hooks nên tách biệt logic ra khỏi components
2. Mỗi hook nên tập trung vào một chức năng cụ thể
3. Nên xử lý các trạng thái loading, error trong hook
4. Nên tài liệu hóa các tham số và giá trị trả về bằng JSDoc

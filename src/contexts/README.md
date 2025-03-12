# Contexts

Thư mục này chứa các React contexts được sử dụng để quản lý state ở mức ứng dụng.

## Các contexts hiện có

- **BotContext**: Context quản lý dữ liệu về bots

## Quy tắc thiết kế

1. Mỗi context nên tập trung vào một domain cụ thể
2. Nên cung cấp cả Provider component và custom hook để sử dụng context
3. Nên tài liệu hóa các giá trị của context bằng JSDoc
4. Nên xử lý các trạng thái loading, error trong context

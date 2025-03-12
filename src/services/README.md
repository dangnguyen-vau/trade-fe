# Services

Thư mục này chứa các dịch vụ để tương tác với API hoặc các dịch vụ bên ngoài.

## Các file chính

- **api.js**: Chứa các hàm gọi API chung
- Các file service khác nên được tổ chức theo tính năng

## Quy tắc thiết kế

1. Mỗi hàm service nên tập trung vào một chức năng cụ thể
2. Nên xử lý lỗi trong service
3. Nên tài liệu hóa các tham số và giá trị trả về bằng JSDoc
4. Nên sử dụng các hằng số từ thư mục constants cho các URL, endpoints

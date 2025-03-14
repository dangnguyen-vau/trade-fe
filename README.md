# Trade-FE - Ứng dụng Giám sát Bot Giao dịch

## Tổng quan ứng dụng

Trade-FE là ứng dụng frontend giám sát hiệu suất các bot giao dịch tự động. Ứng dụng hiển thị dữ liệu giao dịch, thống kê lợi nhuận, và đánh giá hiệu suất theo nhiều khung thời gian (ngày, tuần, tháng) giúp người dùng theo dõi và phân tích hiệu quả đầu tư.

## Luồng hoạt động của ứng dụng

### 1. Luồng dữ liệu

```
API Backend → Dữ liệu thô → Biến đổi dữ liệu → Hiển thị giao diện → Tương tác người dùng
```

- **Thu thập dữ liệu**: Ứng dụng gọi các API để lấy dữ liệu về giao dịch, số dư tài khoản, lợi nhuận
- **Biến đổi dữ liệu**: Dữ liệu thô được xử lý thông qua các hàm trong `dataTransform.js` để tính toán thống kê theo ngày/tuần/tháng
- **Hiển thị dữ liệu**: Dữ liệu đã xử lý được truyền đến các component để hiển thị trên dashboard
- **Tương tác**: Người dùng có thể lọc, sắp xếp và phân tích dữ liệu theo nhiều cách khác nhau

### 2. Luồng tương tác người dùng

- **Dashboard chính**: Hiển thị tổng quan hiệu suất của tất cả các bot
- **Xem chi tiết theo thời gian**: Người dùng có thể chọn xem thống kê theo ngày, tuần, hoặc tháng
- **Chi tiết về bot**: Khi nhấp vào một bot cụ thể, người dùng sẽ thấy thông tin chi tiết
- **Xem tất cả lệnh**: Người dùng có thể xem toàn bộ lệnh giao dịch, lọc theo bot, sắp xếp theo thời gian hoặc lợi nhuận

### 3. Sơ đồ luồng dữ liệu

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  API Server │───▶│   Backend   │───▶│   Frontend  │
└─────────────┘    └─────────────┘    └─────────────┘
       │                 │                   │
       ▼                 ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Raw Trade  │    │  JSON Data  │    │    React    │
│    Data     │    │  (DataBot)  │    │ Components  │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Giải thích sơ đồ:**
- **API Server**: Cung cấp dữ liệu giao dịch thô từ các bot
- **Backend**: Lấy dữ liệu thô về
- **Frontend**: Xử lý dữ liệu thô và hiển thị cho người dùng tương tác
- **Raw Trade Data**: Dữ liệu giao dịch thô (giá mở/đóng, thời gian, volume...)
- **JSON Data (DataBot)**: Dữ liệu đã được xử lý, định dạng sẵn cho frontend
- **React Components**: Các thành phần giao diện hiển thị dữ liệu

## Cấu trúc thư mục

```
frontend/
├── public/                 # Tài nguyên tĩnh
├── src/
│   ├── components/         # Các thành phần giao diện
│   │   ├── common/         # Component dùng chung (Modal, Button, ...)
│   │   ├── layout/         # Component bố cục (TopBar, QuickOverview)
│   │   ├── features/       # Component theo tính năng
│   │   │   ├── Bot/        # Các component liên quan đến Bot (BotCard, BotDetail)
│   │   │   ├── Stats/      # Các component thống kê (DailyStatsSummary, WeeklyStatsSummary)
│   │   │   ├── Trades/     # Các component giao dịch (AllTradesDetail)
│   │   │   └── Strategy/   # Các component chiến lược (MultiStrategyBacktestResults)
│   │   └── ui/             # Các component giao diện chung (ProfitChart)
│   ├── constants/          # Các hằng số và cấu hình
│   │   └── colors.js       # Định nghĩa màu sắc
│   ├── services/           # Xử lý logic nghiệp vụ
│   │   ├── api.js          # Gọi API từ backend
│   │   └── dataTransform.js # Xử lý và biến đổi dữ liệu
│   ├── App.js              # Component chính của ứng dụng
│   ├── App.css             # CSS cho App component
│   ├── index.js            # Điểm khởi đầu của ứng dụng
│   └── index.css           # CSS toàn cục
└── package.json            # Cấu hình npm và dependencies
```

## Chi tiết các thành phần

### 1. Dashboard chính (App.js)

Đây là thành phần chính của ứng dụng, chứa:
- **TopBar**: Thanh điều hướng trên cùng
- **Các panel thống kê**: Hiển thị số liệu theo ngày, tuần, tháng
- **QuickOverview**: Tóm tắt nhanh về hiệu suất tổng thể
- **Các modal**: Hiển thị chi tiết bot và tất cả lệnh giao dịch

### 2. Hiển thị dữ liệu hiệu suất

#### ProfitChart
Component biểu đồ linh hoạt hiển thị lợi nhuận theo nhiều cách:
- **Daily view**: Biểu đồ lợi nhuận 7 ngày gần nhất, khi click vào 1 ngày sẽ hiện chi tiết từng bot
- **Weekly view**: Biểu đồ 4 tuần gần nhất, khi click vào 1 tuần sẽ hiện chi tiết từng bot
- **Monthly view**: Biểu đồ 12 tháng gần nhất, khi click vào 1 tháng sẽ hiện chi tiết từng bot

#### BotCard
Hiển thị thông tin tóm tắt về một bot cụ thể:
- Tên bot
- Số lệnh trade
- Tỷ lệ thắng (win rate)
- Lợi nhuận ròng

### 3. Chi tiết giao dịch

#### BotDetail
Hiển thị thông tin chi tiết về một bot khi người dùng nhấp vào bot đó:
- Thống kê tổng quan (tỷ lệ thắng, lợi nhuận, số lệnh)
- Bảng các lệnh giao dịch gần đây gồm các thông tin chi tiết(Cặp, Loại, Ngày mở, Ngày đóng, Lợi nhuận (%), Lợi nhuận (USDT), Lý do đóng)

#### AllTradesDetail
Hiển thị tất cả lệnh giao dịch của mọi bot với khả năng:
- Lọc theo bot cụ thể
- Sắp xếp theo ngày, lợi nhuận, hoặc bot
- Xem thống kê tổng hợp (tổng lợi nhuận, win rate, số lệnh)

### 4. Phân tích chiến lược

#### MultiStrategyBacktestResults
Hiển thị kết quả backtest nhiều chiến lược:
- Biểu đồ lợi nhuận tích lũy
- So sánh hiệu suất giữa các chiến lược
- Thống kê chi tiết theo từng khung thời gian
- Nút "Xem tất cả lệnh giao dịch" để mở modal xem chi tiết

## Xử lý dữ liệu

### dataTransform.js

File này chứa các hàm xử lý dữ liệu quan trọng:
- **transformTradeData**: Chuyển đổi dữ liệu thô từ API thành cấu trúc dễ sử dụng
- **getDailyStats**: Tính toán thống kê theo ngày
- **getWeeklyStats**: Tính toán thống kê theo tuần
- **getMonthlyStats**: Tính toán thống kê theo tháng

### api.js

File này chứa các hàm gọi API:
- **fetchTradesData**: Lấy dữ liệu về các lệnh giao dịch
- **fetchBalanceData**: Lấy dữ liệu về số dư tài khoản
- **fetchProfitData**: Lấy dữ liệu về lợi nhuận
- **fetchDailyData, fetchWeeklyData, fetchMonthlyData**: Lấy dữ liệu thống kê theo khung thời gian

## Hệ thống màu sắc và thiết kế

Ứng dụng sử dụng file `colors.js` để quản lý hệ thống màu sắc:
- **COLORS**: Màu sắc chung cho toàn bộ ứng dụng (nền, text, border, status)
- **BOT_COLORS**: Màu sắc cho các bot khác nhau
- **Hàm helper**: `getBackgroundColor` và `getHoverColor` để tạo hiệu ứng và màu nền

## Hướng dẫn sử dụng

### Xem thống kê theo thời gian
1. Trên trang chính, bạn có thể chuyển giữa các tab: Daily, Weekly, Monthly
2. Sử dụng nút điều hướng ngày (← →) để thay đổi khoảng thời gian
3. Nhấp vào các cột trong biểu đồ để xem chi tiết

### Xem chi tiết về bot
1. Nhấp vào bất kỳ bot nào trong danh sách để mở modal chi tiết
2. Modal hiển thị thông tin chi tiết và lịch sử giao dịch của bot đó

### Xem tất cả lệnh giao dịch
1. Nhấp vào nút "Xem tất cả lệnh" trong phần Thống kê hiệu suất tổng thể
2. Modal hiển thị tất cả các lệnh với tùy chọn lọc và sắp xếp
3. Sử dụng dropdown để lọc theo bot

## Kết luận

Trade-FE là ứng dụng frontend hiện đại giúp người dùng theo dõi và phân tích hiệu suất các bot giao dịch tự động. Với thiết kế trực quan và tính năng phong phú, ứng dụng cung cấp công cụ mạnh mẽ để đánh giá hiệu quả đầu tư theo nhiều khung thời gian khác nhau.

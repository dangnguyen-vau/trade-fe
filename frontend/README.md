# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

# Trading Bot Dashboard

## Đề xuất tái cấu trúc thư mục

Dựa trên phân tích dự án hiện tại, tôi đề xuất cấu trúc thư mục sau để giúp dự án có tổ chức tốt hơn, dễ bảo trì và mở rộng:

```
components/
├── ui/                  # Các component UI cơ bản (thay cho common)
│   ├── Modal.js         # Modal dialog
│   ├── Modal.css
│   ├── ProfitChart.js   # Chart component
│   └── chart-utils.js   # (nếu có)
│
├── layout/              # Components tạo bố cục trang
│   ├── TopBar.js        # Navigation bar
│   ├── TopBar.css
│   ├── QuickOverview.js # Sidebar overview
│   └── QuickOverview.css
│
├── bot/                 # Components liên quan đến bot
│   ├── BotCard.js       # Card hiển thị bot
│   ├── BotCard.css
│   ├── BotDetail.js     # Chi tiết bot
│   └── BotDetail.css
│
├── stats/               # Components liên quan đến thống kê
│   ├── DailyStatsSummary.js  # Tóm tắt thống kê theo ngày
│   └── WeeklyStatsSummary.js # Thống kê theo tuần
│
├── trades/              # Components liên quan đến giao dịch
│   └── AllTradesDetail.js # Chi tiết giao dịch
│
└── strategy/            # Components liên quan đến chiến lược
    ├── MultiStrategyBacktestResults.js
    └── MultiStrategyBacktestResults.css

```

## Giải thích cấu trúc thư mục mới

### 1. Tách biệt Backend và Frontend
- Di chuyển `server.js` vào thư mục `server/` và tổ chức thành các phần nhỏ theo mô hình MVC.

### 2. Tổ chức Components
- **common**: Các components có thể sử dụng lại ở nhiều nơi (Button, Card, Input...)
- **layout**: Components định nghĩa bố cục (TopBar, Sidebar...)
- **features**: Components cụ thể cho từng tính năng/module của ứng dụng.

### 3. Chia components theo mô hình Atomic Design
- Mỗi component nên có cấu trúc riêng với file JS, CSS và file index.js để export.

### 4. Tách logic nghiệp vụ
- Sử dụng hooks và services để tách logic khỏi components.
- Tạo context để quản lý state ở mức ứng dụng.

### 5. Tổ chức các trang (Pages)
- Mỗi trang là một container kết hợp nhiều components để tạo thành UI hoàn chỉnh.

### 6. Utils và Constants
- Tách các hàm tiện ích và hằng số ra thư mục riêng để dễ quản lý.

### 7. Styles
- Thư mục styles chứa các style chung cho toàn ứng dụng.

## Lợi ích của cấu trúc mới
1. **Dễ mở rộng**: Dễ dàng thêm tính năng mới mà không ảnh hưởng tới code hiện tại.
2. **Tái sử dụng**: Tăng khả năng tái sử dụng components.
3. **Dễ bảo trì**: Mỗi phần có nhiệm vụ rõ ràng, dễ kiểm soát.
4. **Dễ hiểu cho người mới**: Cấu trúc mạch lạc, dễ nắm bắt.
5. **Phân chia rõ ràng giữa server và client**: Backend code được tách biệt.

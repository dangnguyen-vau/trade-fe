import json
import random
import math
from datetime import datetime, timedelta

def generate_bot_data():
    # Số lượng bot và số ngày
    NUM_BOTS = 30
    NUM_DAYS = 30
    
    # Ngày bắt đầu
    start_date = datetime(2025, 1, 28)
    
    # Danh sách bot
    bots_data = []
    
    # Tạo market trend - xu hướng chung của thị trường
    market_trend = []
    for day in range(NUM_DAYS):
        # Đảo ngược hình sin và điều chỉnh biên độ
        reversed_day = NUM_DAYS - day  # Đảo ngược ngày
        wave = -2 * math.sin(reversed_day / 5) - math.cos(reversed_day / 3)
        # Thêm nhiễu ngẫu nhiên nhỏ hơn
        trend = wave + random.uniform(-0.5, 0.5)
        market_trend.append(trend)
    
    # Tạo danh sách xu hướng bot
    bot_trends = []
    num_positive_bots = 22  # Tăng số lượng bot tích cực
    
    # Tạo xu hướng cho các bot
    for _ in range(num_positive_bots):
        # Bot tích cực có xu hướng từ 1.0 đến 4.0 (tăng range)
        bot_trends.append({
            'base_trend': random.uniform(1.0, 4.0),
            'volatility': random.uniform(0.3, 1.5),  # Giảm độ biến động
            'market_sensitivity': random.uniform(0.9, 1.3)  # Tăng độ nhạy với thị trường tích cực
        })
    
    for _ in range(NUM_BOTS - num_positive_bots):
        # Bot tiêu cực có xu hướng từ -3.0 đến -0.5 (giảm range tiêu cực)
        bot_trends.append({
            'base_trend': random.uniform(-3.0, -0.5),
            'volatility': random.uniform(0.3, 1.5),
            'market_sensitivity': random.uniform(0.7, 1.1)
        })
    
    # Xáo trộn danh sách xu hướng
    random.shuffle(bot_trends)
    
    for bot_idx in range(NUM_BOTS):
        # Lấy thông tin xu hướng cho bot
        bot_trend = bot_trends[bot_idx]
        
        # Balance ban đầu từ 8000 đến 15000
        initial_balance = random.randint(8000, 15000)
        current_balance = initial_balance
        
        # Tạo dữ liệu hàng ngày cho bot
        daily_stats = []
        
        # Tạo momentum (đà) cho bot
        momentum = 0
        
        for day in range(NUM_DAYS):
            current_date = start_date + timedelta(days=day)
            
            # Cập nhật momentum
            momentum = momentum * 0.7 + random.uniform(-1, 1)
            
            # Tính profit dựa trên nhiều yếu tố
            market_impact = market_trend[day] * bot_trend['market_sensitivity']
            trend_impact = bot_trend['base_trend']
            volatility_impact = random.uniform(-1, 1) * bot_trend['volatility']
            momentum_impact = momentum * 0.5
            
            # Tổng hợp các yếu tố
            profit_percent = (
                trend_impact +  # Xu hướng cơ bản
                market_impact +  # Ảnh hưởng của thị trường
                volatility_impact +  # Độ biến động
                momentum_impact  # Đà
            )
            
            # Làm tròn và giới hạn profit
            profit_percent = round(min(max(profit_percent, -12), 12), 2)
            
            # Tính net_profit và cập nhật balance
            net_profit = round((current_balance * profit_percent) / 100)
            current_balance += net_profit
            
            # Tính winrate dựa trên profit và momentum
            base_winrate = 65
            profit_impact = profit_percent * 1.2
            momentum_impact_on_winrate = momentum * 2
            
            winrate = base_winrate + profit_impact + momentum_impact_on_winrate
            winrate = round(min(max(winrate, 55), 85), 2)
            
            daily_stat = {
                "date": current_date.strftime("%Y-%m-%d"),
                "net_profit": net_profit,
                "profit_percent": profit_percent,
                "winrate": winrate,
                "balance": round(current_balance)
            }
            daily_stats.append(daily_stat)
        
        bot_data = {
            "name": f"bot_{str(bot_idx + 1).zfill(3)}",
            "daily_stats": daily_stats
        }
        bots_data.append(bot_data)
    
    return bots_data

# Tạo dữ liệu
bots_data = generate_bot_data()

# Ghi ra file
with open('botsData.js', 'w') as f:
    f.write('export const botsData = ')
    json.dump(bots_data, f, indent=2)
    f.write(';')

print("Đã tạo xong file randomBotsData.js với dữ liệu uấn lượn hơn! 🐍✨") 
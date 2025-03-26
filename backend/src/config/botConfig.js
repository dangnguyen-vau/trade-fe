const botConfigs = [
  {
    id: 'ThanhHau-Long',
    name: 'Thành Hậu - Long',
    host: '103.216.117.117',
    port: '71',
    auth: 'ZnJlcXRyYWRlcjoxMjM0', // Base64 của "freqtrader:1234" là tài khoản mật khẩu á
    type: 'long'
  },
  {
    id: 'ThanhHau-Short', 
    name: 'Thành Hậu - Short',
    host: '103.216.117.117', 
    port: '72',
    auth: 'ZnJlcXRyYWRlcjoxMjM0', // Base64 của "freqtrader:1234"
    type: 'short'
  },
  {
    id: 'ThanhHau-LongShort',
    name: 'Thành Hậu - Long Short',
    host: '103.216.117.117',
    port: '70',
    auth: 'ZnJlcXRyYWRlcjoxMjM0', // Base64 của "freqtrader:1234"
    type: 'longshort'
  },
  {
    id: 'BotHuy',
    name: 'Huy-LongShort',
    host: '103.216.117.117',
    port: '82',
    auth: 'ZnJlcXRyYWRlcjoxMjM0NTY=', // Base64 của "freqtrader:123456"
    type: 'default'
  }
];

module.exports = {
  botConfigs,
  // Thời gian hết hạn của token (1 giờ)
  tokenExpirationTime: 3600000
}; 
const botConfigs = [
  // Bot 1: ThanhHau - Long & Short
  {
    id: 'ThanhHau:71-Long',
    name: 'Thành Hậu - Long',
    host: '103.216.117.117',
    port: '71',
    auth: 'ZnJlcXRyYWRlcjoxMjM0', // Base64 của "freqtrader:1234"
    type: 'long'
  },
  {
    id: 'ThanhHau:72-Short', 
    name: 'Thành Hậu - Short',
    host: '103.216.117.117', 
    port: '72',
    auth: 'ZnJlcXRyYWRlcjoxMjM0', // Base64 của "freqtrader:1234"
    type: 'short'
  },
  // Bot 2: VuongHuy - Long & Short
  {
    id: 'VuongHuy:82-Short',
    name: 'Vương Huy - Short',
    host: '103.216.117.117',
    port: '82',
    auth: 'ZnJlcXRyYWRlcjoxMjM0NTY=', // Base64 của "freqtrader:123456"
    type: 'short'
  },
  {
    id: 'VuongHuy:83-Long',
    name: 'Vương Huy - Long',
    host: '103.216.117.117',
    port: '83',
    auth: 'ZnJlcXRyYWRlcjoxMjM0NTY=', // Base64 của "freqtrader:123456"
    type: 'long'
  },
  // Bot 4: ThanhHau - Long & Short
  {
    id: 'ThanhHau:70-LongShort',
    name: 'Thành Hậu - Long Short',
    host: '103.216.117.117',
    port: '70',
    auth: 'ZnJlcXRyYWRlcjoxMjM0', // Base64 của "freqtrader:1234"
    type: 'longshort'
  },
  // Bot 5: VuongHuy - Long & Short
  {
    id: 'VuongHuy:85-Short',
    name: 'Vương Huy - Short',
    host: '103.216.117.117',
    port: '85',
    auth: 'ZnJlcXRyYWRlcjoxMjM0NTY=', // Base64 của "freqtrader:123456"
    type: 'short'
  },
  {
    id: 'VuongHuy:86-Long', 
    name: 'Vương Huy - Long',
    host: '103.216.117.117', 
    port: '86',
    auth: 'ZnJlcXRyYWRlcjoxMjM0NTY=', // Base64 của "freqtrader:123456"
    type: 'long'
  },
  // Bot 6: VuongChien - Long & Short
  {
    id: 'VuongChien:31-Short',
    name: 'Vương Chiến - Short',
    host: '103.216.117.117',
    port: '31',
    auth: 'ZnJlcXRyYWRlcjoxMjM0', // Base64 của "freqtrader:1234"
    type: 'short'
  },
  {
    id: 'VuongChien:32-Long',
    name: 'Vương Chiến - Long',
    host: '103.216.117.117',
    port: '32',
    auth: 'ZnJlcXRyYWRlcjoxMjM0', // Base64 của "freqtrader:1234"
    type: 'long'
  },
  // Bot 7: VuongDuc - Long & Short
  {
    id: 'VuongDuc:7901-Short', 
    name: 'Vương Đức - Short',
    host: '103.216.117.117', 
    port: '7901',
    auth: 'ZnJlcXRyYWRlcjoxMjM0NTY=', // Base64 của "freqtrader:123456"
    type: 'short'
  },
  {
    id: 'VuongDuc:7902-Long', 
    name: 'Vương Đức - Long',
    host: '103.216.117.117', 
    port: '7902',
    auth: 'ZnJlcXRyYWRlcjoxMjM0NTY=', // Base64 của "freqtrader:123456"
    type: 'long'
  },
  // Bot 8: HauDuc - Long & Short
  {
    id: 'HauDuc:7904-Short',
    name: 'Hậu Đức - Short',
    host: '103.216.117.117',
    port: '7904',
    auth: 'ZnJlcXRyYWRlcjoxMjM0NTY=', // Base64 của "freqtrader:123456"
    type: 'short'
  },
  {
    id: 'HauDuc:7903-Long',
    name: 'Hậu Đức - Long',
    host: '103.216.117.117',
    port: '7903',
    auth: 'ZnJlcXRyYWRlcjoxMjM0NTY=', // Base64 của "freqtrader:123456"
    type: 'long'
  },
  // Bot 9: HauDuc - Long & Short
  {
    id: 'HauDuc:7906-Short',
    name: 'Hậu Đức - Short',
    host: '103.216.117.117',
    port: '7906',
    auth: 'ZnJlcXRyYWRlcjoxMjM0NTY=', // Base64 của "freqtrader:123456"
    type: 'short'
  },
  {
    id: 'HauDuc:7905-Long',
    name: 'Hậu Đức - Long',
    host: '103.216.117.117',
    port: '7905',
    auth: 'ZnJlcXRyYWRlcjoxMjM0NTY=', // Base64 của "freqtrader:123456"
    type: 'long'
  },
];

module.exports = {
  botConfigs,
  // Thời gian hết hạn của token (1 giờ)
  tokenExpirationTime: 3600000
}; 
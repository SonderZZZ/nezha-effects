// nezha-globe.js
(function(){
  'use strict';

  //// —— 1. 注入 CSS ——
  const style = document.createElement('style');
  style.innerHTML = `
    /* --- 3D 地球样式 --- */
    #earth-drawer-container { position: fixed; top: 0; right: 0; width: 50vw; max-width:50vw; min-width:400px; height:100vh; z-index:99999;
        background: linear-gradient(135deg, rgba(0,5,15,0.98), rgba(0,10,25,0.98));
        border-left:2px solid rgba(0,255,255,0.4);
        box-shadow:-20px 0 80px rgba(0,10,30,0.95);
        transform: translateX(100%);
        transition: transform 0.5s cubic-bezier(0.23,1,0.32,1);
        display: flex;
        flex-direction: column;
    }
    #earth-drawer-container.active { transform: translateX(0); }
    #earth-render-area { flex: 1; width:100%; height:100%; overflow:hidden; cursor: grab; }
    #earth-render-area:active { cursor: grabbing; }

    .earth-header { position:absolute; top:0; left:0; width:100%; padding:20px 30px; display:flex;
        justify-content: space-between; align-items:center; z-index:10;
        background: linear-gradient(180deg, rgba(0,0,0,0.95) 0%, transparent 100%);
        pointer-events: none;
        backdrop-filter: blur(10px);
    }
    .earth-title {
      color:#00ffff;
      font-family:'Microsoft YaHei','Segoe UI',sans-serif;
      letter-spacing:3px;
      font-weight:700;
      font-size:18px;
      text-shadow:0 0 15px rgba(0,255,255,0.8),0 0 30px rgba(0,255,255,0.4);
      pointer-events: auto;
      animation: titleGlow 3s ease-in-out infinite;
    }
    @keyframes titleGlow {
      0%,100% { text-shadow:0 0 15px rgba(0,255,255,0.8),0 0 30px rgba(0,255,255,0.4); }
      50% { text-shadow:0 0 20px rgba(0,255,255,1),0 0 40px rgba(0,255,255,0.6); }
    }

    .earth-stats {
      position:absolute; top:80px; left:30px;
      color: rgba(255,255,255,0.95);
      font-family:'Consolas',monospace; font-size:12px;
      z-index:10;
      background: rgba(0,20,40,0.85);
      padding:12px 16px;
      border:1px solid rgba(0,255,255,0.5);
      border-radius:6px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    .earth-stats div { margin:4px 0; }
    .earth-stats span { color:#00ffff; font-weight:bold; text-shadow:0 0 8px rgba(0,255,255,0.6); }

    #earth-close-btn {
      pointer-events:auto;
      color:#fff;
      background: linear-gradient(135deg, rgba(0,100,150,0.3), rgba(0,50,100,0.3));
      border:1px solid rgba(0,255,255,0.6);
      padding:8px 18px;
      font-size:12px;
      cursor:pointer;
      transition: all 0.3s cubic-bezier(0.23,1,0.32,1);
      font-family:'Consolas',monospace;
      font-weight:600; letter-spacing:1px;
      border-radius:6px;
      backdrop-filter: blur(5px);
      text-transform: uppercase;
      position: relative; overflow: hidden;
    }
    #earth-close-btn::before {
      content:'';
      position:absolute; top:50%; left:50%;
      width:0; height:0;
      background:rgba(0,255,255,0.3);
      border-radius:50%;
      transform: translate(-50%,-50%);
      transition: width 0.6s, height 0.6s;
    }
    #earth-close-btn:hover::before { width:300px; height:300px; }
    #earth-close-btn:hover {
      background: linear-gradient(135deg, rgba(0,255,255,0.4), rgba(0,200,255,0.4));
      border-color: #00ffff;
      box-shadow:0 0 20px rgba(0,255,255,0.6), inset 0 0 20px rgba(0,255,255,0.2);
      transform: translateY(-2px);
    }
    #earth-close-btn span { position: relative; z-index:1; }

    #earth-toggle-btn {
      position: fixed; bottom:25px; right:25px;
      width:64px; height:64px; border-radius:16px;
      cursor:pointer; z-index:99998;
      display:flex; align-items:center; justify-content:center;
      overflow:hidden;
      background: rgba(255,255,255,0.25);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    #earth-toggle-btn::before {
      content:''; position:absolute; inset:0; background: transparent !important;
    }
    #earth-toggle-btn:hover {
      transform: translateY(-4px) scale(1.08);
      background: rgba(255,255,255,0.35) !important;
      box-shadow: 0 12px 30px rgba(0,0,0,0.4),
                  inset 0 0 15px rgba(255,255,255,0.35);
    }
    #earth-toggle-btn:active {
      transform: translateY(-2px) scale(1.04);
    }
    #earth-toggle-btn.hidden {
      transform: translateX(150px) scale(0);
      opacity: 0;
    }
    #earth-toggle-btn svg {
      width: 32px; height: 32px;
      position: relative; z-index:2;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
    }

    .pulse-ring {
      position:absolute; border:2px solid #00ffff;
      border-radius:16px; width:100%; height:100%;
      animation: pulse-breath 3s ease-in-out infinite;
      opacity:0;
    }
    @keyframes pulse-breath {
      0%{ transform: scale(1); opacity:0.2; }
      50%{ transform: scale(1.15); opacity:0.5; }
      100%{ transform: scale(1.3); opacity:0.2; }
    }
    .pulse-element {
      animation: pulse-breath 4s linear infinite;
    }

    .earth-label-card {
      background: linear-gradient(135deg, rgba(0,20,40,0.98), rgba(0,10,30,0.98));
      border:1px solid #00ffff;
      color:#fff;
      padding:5px 10px; border-radius:5px;
      font-size:13px;
      display:flex; align-items:center; gap:6px;
      box-shadow:0 0 20px rgba(0,255,255,0.6), 0 4px 10px rgba(0,0,0,0.5);
      transform: translateY(-25px);
      white-space: nowrap;
      font-family:'Microsoft YaHei',sans-serif;
      font-weight:600;
      backdrop-filter: blur(8px);
    }
    .earth-label-card .flag-emoji {
      font-size:16px;
      filter: drop-shadow(0 0 3px rgba(255,255,255,0.5));
    }

    #debug-panel {
      position:absolute; bottom:25px; left:25px;
      background: rgba(0,0,0,0.95);
      color:#0f0;
      padding:10px;
      font-family:monospace; font-size:10px;
      max-height:200px; overflow-y:auto;
      border:1px solid #0f0; border-radius:4px;
      z-index:10; max-width:300px; display:none;
    }
    #debug-panel.show { display:block; }
    #debug-panel div { margin:2px 0; word-break: break-all; }

    @media (max-width:768px) {
      #earth-drawer-container { width:100vw; max-width:100vw; height:60vh; top:auto; bottom:0;
        transform: translateY(100%); border-left: none; border-top:2px solid rgba(0,255,255,0.4); min-width:0;
      }
      #earth-drawer-container.active { transform: translateY(0); }
      .earth-header { padding:12px 15px; }
      .earth-title { font-size:14px; letter-spacing:2px; }
      .earth-stats { font-size:10px; padding:8px 12px; top:55px; left:15px; }
      #earth-close-btn { padding:6px 12px; font-size:11px; }
      #earth-toggle-btn { width:56px; height:56px; bottom:80px; right:20px; border-radius:14px; }
      #earth-toggle-btn svg { width:28px; height:28px; }
      .earth-label-card { font-size:11px; padding:4px 8px; }
      .earth-label-card .flag-emoji { font-size:14px; }
      #debug-panel { font-size:9px; bottom:15px; left:15px; max-width:250px; max-height:150px; }
    }
  `;
  document.head.appendChild(style);

  //// —— 2. 注入 HTML ——
  const html = `
    <div id="earth-toggle-btn" title="Open Global Map">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.1)"/>
        <path d="M12 2C12 2 15 6 15 12C15 18 12 22 12 22" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M12 2C12 2 9 6 9 12C9 18 12 22 12 22" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M2 12H22" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M4 8H20" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M4 16H20" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="12" cy="12" r="1.5" fill="#00ffff"/>
      </svg>
      <div class="pulse-ring"></div>
    </div>
    <div id="earth-drawer-container">
      <div class="earth-header">
        <div class="earth-title">哪吒探针 全球直连</div>
        <div id="earth-close-btn"><span>关闭</span></div>
      </div>
      <div class="earth-stats" id="earth-stats">
        <div>共 <span id="country-count">0</span> 个区域</div>
        <div>状态: <span id="globe-status">Ready</span></div>
        <div style="margin-top:8px;font-size:10px;opacity:0.7;cursor:pointer;" id="toggle-debug">[ Debug ]</div>
      </div>
      <div id="debug-panel"></div>
      <div id="earth-render-area"></div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  //// —— 3. 定义国家坐标表 / emoji / 中文名 —— 
  const COORD_MAP = { /* … 你之前完整 COORD_MAP 内容 … */ 
    'CN': [35.8617， 104.1954]， 'HK': [22.3193， 114.1694]， 'TW': [23.6978， 120.9605]， 'MO': [22.1987， 113.5439], 'JP': [36.2048， 138.2529]， 'KR': [35.9078, 127.7669], 'KP': [40.3399, 127.5101], 'SG': [1.3521, 103.8198], 'MY': [4.2105, 101.9758], 'TH': [15.8700, 100.9925], 'VN': [14.0583, 108.2772], 'PH': [12.8797, 121.7740], 'ID': [-0.7893, 113.9213], 'IN': [20.5937, 78.9629], 'PK': [30.3753, 69.3451], 'BD': [23.6850, 90.3563], 'LK': [7.8731, 80.7718], 'MM': [21.9162, 95.9560], 'KH': [12.5657, 104.9910], 'LA': [19.8563, 102.4955], 'NP': [28.3949, 84.1240], 'BT': [27.5142, 90.4336], 'MN': [46.8625, 103.8467], 'KZ': [48.0196, 66.9237], 'UZ': [41.3775, 64.5853], 'TM': [38.9697, 59.5563], 'KG': [41.2044, 74.7661], 'TJ': [38.8610, 71.2761], 'AF': [33.9391, 67.7100], 'AE': [23.4241, 53.8478], 'SA': [23.8859, 45.0792], 'IL': [31.0461, 34.8516], 'JO': [30.5852, 36.2384], 'LB': [33.8547, 35.8623], 'SY': [34.8021, 38.9968], 'IQ': [33.2232, 43.6793], 'IR': [32.4279, 53.6880], 'TR': [38.9637, 35.2433], 'YE': [15.5527, 48.5164], 'OM': [21.4735, 55.9754], 'KW': [29.3117, 47.4818], 'QA': [25.3548, 51.1839], 'BH': [26.0667, 50.5577], 'AM': [40.0691, 45.0382], 'AZ': [40.1431, 47.5769], 'GE': [42.3154, 43.3569], 'US': [37.0902, -95.7129], 'CA': [56.1304, -106.3468],'MX': [23.6345, -102.5528], 'GT': [15.7835, -90.2308], 'BZ': [17.1899, -88.4976], 'SV': [13.7942, -88.8965], 'HN': [15.2000, -86.2419], 'NI': [12.8654, -85.2072], 'CR': [9.7489, -83.7534], 'PA': [8.5380, -80.7821], 'CU': [21.5218, -77.7812], 'JM': [18.1096, -77.2975], 'HT': [18.9712, -72.2852], 'DO': [18.7357, -70.1627], 'GB': [55.3781, -3.4360], 'IE': [53.4129, -8.2439], 'FR': [46.2276, 2.2137], 'DE': [51.1657, 10.4515], 'IT': [41.8719, 12.5674], 'ES': [40.4637, -3.7492], 'PT': [39.3999, -8.2245], 'NL': [52.1326, 5.2913], 'BE': [50.5039, 4.4699], 'LU': [49.8153, 6.1296], 'CH': [46.8182, 8.2275], 'AT': [47.5162, 14.5501], 'SE': [60.1282, 18.6435], 'NO': [60.4720, 8.4689], 'FI': [61.9241, 25.7482], 'DK': [56.2639, 9.5018], 'IS': [64.9631, -19.0208], 'PL': [51.9194, 19.1451], 'CZ': [49.8175, 15.4730], 'SK': [48.6690, 19.6990], 'HU': [47.1625, 19.5033], 'RO': [45.9432, 24.9668], 'BG': [42.7339, 25.4858], 'GR': [39.0742, 21.8243], 'HR': [45.1000, 15.2000], 'SI': [46.1512, 14.9955], 'RS': [44.0165, 21.0059], 'BA': [43.9159, 17.6791], 'ME': [42.7087, 19.3744], 'MK': [41.6086, 21.7453], 'AL': [41.1533, 20.1683], 'XK': [42.6026, 20.9030], 'UA': [48.3794, 31.1656], 'BY': [53.7098, 27.9534], 'MD': [47.4116, 28.3699], 'RU': [61.5240, 105.3188], 'EE': [58.5953, 25.0136], 'LV': [56.8796, 24.6032], 'LT': [55.1694, 23.8813], 'CY': [35.1264, 33.4299], 'MT': [35.9375, 14.3754], 'BR': [-14.2350, -51.9253],'AR': [-38.4161, -63.6167],'CL': [-35.6751, -71.5430], 'CO': [4.5709, -74.2973], 'PE': [-9.1900, -75.0152], 'VE': [6.4238, -66.5897], 'EC': [-1.8312, -78.1834], 'BO': [-16.2902, -63.5887],'PY': [-23.4425, -58.4438], 'UY': [-32.5228, -55.7658],'GY': [4.8604, -58.9302], 'SR': [3.9193, -56.0278], 'AU': [-25.2744, 133.7751],'NZ': [-40.9006, 174.8860],'FJ': [-17.7134, 178.0650], 'PG': [-6.3150, 143.9555], 'NC': [-20.9043, 165.6180], 'ZA': [-30.5595, 22.9375], 'EG': [26.8206, 30.8025], 'NG': [9.0820, 8.6753], 'KE': [-0.0236, 37.9062], 'ET': [9.1450, 40.4897], 'MA': [31.7917, -7.0926], 'DZ': [28.0339, 1.6596], 'TN': [33.8869, 9.5375], 'LY': [26.3351, 17.2283], 'SD': [12.8628, 30.2176], 'TZ': [-6.3690, 34.8888], 'UG': [1.3733, 32.2903], 'GH': [7.9465, -1.0232], 'CI': [7.5400, -5.5471], 'SN': [14.4974, -14.4524], 'ZW': [-19.0154, 29.1549], 'AO': [-11.2027, 17.8739], 'MZ': [-18.6657, 35.5296]
  };
  const FLAG_EMOJI = {
    'CN': '🇨🇳'， 'HK': '🇭🇰'， 'TW': '🇹🇼'， 'MO': '🇲🇴'， 'JP': '🇯🇵'， 'KR': '🇰🇷'， 'KP': '🇰🇵'， 'SG': '🇸🇬'， 'MY': '🇲🇾'， 'TH': '🇹🇭', 'VN': '🇻🇳', 'PH': '🇵🇭', 'ID': '🇮🇩', 'IN': '🇮🇳', 'PK': '🇵🇰', 'BD': '🇧🇩', 'LK': '🇱🇰', 'MM': '🇲🇲', 'KH': '🇰🇭', 'LA': '🇱🇦', 'NP': '🇳🇵', 'BT': '🇧🇹', 'MN': '🇲🇳', 'KZ': '🇰🇿', 'UZ': '🇺🇿', 'TM': '🇹🇲', 'KG': '🇰🇬', 'TJ': '🇹🇯', 'AF': '🇦🇫', 'AE': '🇦🇪', 'SA': '🇸🇦', 'IL': '🇮🇱', 'JO': '🇯🇴', 'LB': '🇱🇧', 'SY': '🇸🇾', 'IQ': '🇮🇶', 'IR': '🇮🇷', 'TR': '🇹🇷', 'YE': '🇾🇪', 'OM': '🇴🇲', 'KW': '🇰🇼', 'QA': '🇶🇦', 'BH': '🇧🇭', 'AM': '🇦🇲', 'AZ': '🇦🇿', 'GE': '🇬🇪', 'US': '🇺🇸', 'CA': '🇨🇦', 'MX': '🇲🇽', 'GT': '🇬🇹', 'BZ': '🇧🇿', 'SV': '🇸🇻', 'HN': '🇭🇳', 'NI': '🇳🇮', 'CR': '🇨🇷', 'PA': '🇵🇦', 'CU': '🇨🇺', 'JM': '🇯🇲', 'HT': '🇭🇹', 'DO': '🇩🇴', 'GB': '🇬🇧', 'IE': '🇮🇪', 'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹', 'ES': '🇪🇸', 'PT': '🇵🇹', 'NL': '🇳🇱', 'BE': '🇧🇪', 'LU': '🇱🇺', 'CH': '🇨🇭', 'AT': '🇦🇹', 'SE': '🇸🇪', 'NO': '🇳🇴', 'FI': '🇫🇮', 'DK': '🇩🇰', 'IS': '🇮🇸', 'PL': '🇵🇱', 'CZ': '🇨🇿', 'SK': '🇸🇰', 'HU': '🇭🇺', 'RO': '🇷🇴', 'BG': '🇧🇬', 'GR': '🇬🇷', 'HR': '🇭🇷', 'SI': '🇸🇮', 'RS': '🇷🇸', 'BA': '🇧🇦', 'ME': '🇲🇪', 'MK': '🇲🇰', 'AL': '🇦🇱', 'XK': '🇽🇰', 'UA': '🇺🇦', 'BY': '🇧🇾', 'MD': '🇲🇩', 'RU': '🇷🇺', 'EE': '🇪🇪', 'LV': '🇱🇻', 'LT': '🇱🇹', 'CY': '🇨🇾', 'MT': '🇲🇹', 'BR': '🇧🇷', 'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'PE': '🇵🇪', 'VE': '🇻🇪', 'EC': '🇪🇨', 'BO': '🇧🇴', 'PY': '🇵🇾', 'UY': '🇺🇾', 'GY': '🇬🇾', 'SR': '🇸🇷', 'AU': '🇦🇺', 'NZ': '🇳🇿', 'FJ': '🇫🇯', 'PG': '🇵🇬', 'NC': '🇳🇨', 'ZA': '🇿🇦', 'EG': '🇪🇬', 'NG': '🇳🇬', 'KE': '🇰🇪', 'ET': '🇪🇹', 'MA': '🇲🇦', 'DZ': '🇩🇿', 'TN': '🇹🇳', 'LY': '🇱🇾', 'SD': '🇸🇩', 'TZ': '🇹🇿', 'UG': '🇺🇬', 'GH': '🇬🇭', 'CI': '🇨🇮', 'SN': '🇸🇳', 'ZW': '🇿🇼', 'AO': '🇦🇴', 'MZ': '🇲🇿'
  };
  const CODE_TO_CN = {
    'CN': '中国'， 'HK': '香港'， 'TW': '台湾'， 'MO': '澳门'， 'JP': '日本'， 'KR': '韩国'， 'KP': '朝鲜', 'SG': '新加坡', 'MY': '马来西亚', 'TH': '泰国', 'VN': '越南', 'PH': '菲律宾', 'ID': '印尼', 'IN': '印度', 'PK': '巴基斯坦', 'BD': '孟加拉国', 'LK': '斯里兰卡', 'MM': '缅甸', 'KH': '柬埔寨', 'LA': '老挝', 'NP': '尼泊尔', 'BT': '不丹', 'MN': '蒙古', 'KZ': '哈萨克斯坦', 'UZ': '乌兹别克斯坦', 'TM': '土库曼斯坦', 'KG': '吉尔吉斯斯坦', 'TJ': '塔吉克斯坦', 'AF': '阿富汗', 'AE': '阿联酋', 'SA': '沙特', 'IL': '以色列', 'JO': '约旦', 'LB': '黎巴嫩', 'SY': '叙利亚', 'IQ': '伊拉克', 'IR': '伊朗', 'TR': '土耳其', 'YE': '也门', 'OM': '阿曼', 'KW': '科威特', 'QA': '卡塔尔', 'BH': '巴林', 'AM': '亚美尼亚', 'AZ': '阿塞拜疆', 'GE': '格鲁吉亚', 'US': '美国', 'CA': '加拿大', 'MX': '墨西哥', 'GT': '危地马拉', 'BZ': '伯利兹', 'SV': '萨尔瓦多', 'HN': '洪都拉斯', 'NI': '尼加拉瓜', 'CR': '哥斯达黎加', 'PA': '巴拿马', 'CU': '古巴', 'JM': '牙买加', 'HT': '海地', 'DO': '多米尼加', 'GB': '英国', 'IE': '爱尔兰', 'FR': '法国', 'DE': '德国', 'IT': '意大利', 'ES': '西班牙', 'PT': '葡萄牙', 'NL': '荷兰', 'BE': '比利时', 'LU': '卢森堡', 'CH': '瑞士', 'AT': '奥地利', 'SE': '瑞典', 'NO': '挪威', 'FI': '芬兰', 'DK': '丹麦', 'IS': '冰岛', 'PL': '波兰', 'CZ': '捷克', 'SK': '斯洛伐克', 'HU': '匈牙利', 'RO': '罗马尼亚', 'BG': '保加利亚', 'GR': '希腊', 'HR': '克罗地亚', 'SI': '斯洛文尼亚', 'RS': '塞尔维亚', 'BA': '波黑', 'ME': '黑山', 'MK': '北马其顿', 'AL': '阿尔巴尼亚', 'XK': '科索沃', 'UA': '乌克兰', 'BY': '白俄罗斯', 'MD': '摩尔多瓦', 'RU': '俄罗斯', 'EE': '爱沙尼亚', 'LV': '拉脱维亚', 'LT': '立陶宛', 'CY': '塞浦路斯', 'MT': '马耳他', 'BR': '巴西', 'AR': '阿根廷', 'CL': '智利', 'CO': '哥伦比亚', 'PE': '秘鲁', 'VE': '委内瑞拉', 'EC': '厄瓜多尔', 'BO': '玻利维亚', 'PY': '巴拉圭', 'UY': '乌拉圭', 'GY': '圭亚那', 'SR': '苏里南', 'AU': '澳大利亚', 'NZ': '新西兰', 'FJ': '斐济', 'PG': '巴新', 'NC': '新喀里多尼亚', 'ZA': '南非', 'EG': '埃及', 'NG': '尼日利亚', 'KE': '肯尼亚', 'ET': '埃塞俄比亚', 'MA': '摩洛哥', 'DZ': '阿尔及利亚', 'TN': '突尼斯', 'LY': '利比亚', 'SD': '苏丹', 'TZ': '坦桑尼亚', 'UG': '乌干达', 'GH': '加纳', 'CI': '科特迪瓦', 'SN': '塞内加尔', 'ZW': '津巴布韦', 'AO': '安哥拉', 'MZ': '莫桑比克'
  };

  //// —— 4. 加载依赖（Three.js + Three‑Globe） ——
  function loadScript(src) {
    return new Promise(res => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => res();
      document.head.appendChild(s);
    });
  }
  async function loadDependencies() {
    if (typeof THREE === 'undefined') {
      await loadScript('https://unpkg.com/three@0.150.1/build/three.min.js');
    }
    if (typeof Globe === 'undefined') {
      await loadScript('https://unpkg.com/three-globe');
    }
  }

  //// —— 5. 扫描、生成地球、更新逻辑 ——
  function scanFlags() {
    const flags = new Set();
    document.querySelectorAll('[class*="flag-icon-"]').forEach(el => {
      el.classList.forEach(cls => {
        if (cls.startsWith('flag-icon-')) {
          const code = cls.replace('flag-icon-','').toUpperCase();
          if (COORD_MAP[code]) flags.add(code);
        }
      });
    });
    document.querySelectorAll('[class*="fi-"]').forEach(el => {
      el.classList.forEach(cls => {
        const m = cls.match(/^fi-([a-z]{2})$/i);
        if (m) {
          const code = m[1].toUpperCase();
          if (COORD_MAP[code]) flags.add(code);
        }
      });
    });
    ['data-country-code','data-country'].forEach(attr => {
      document.querySelectorAll(`[${attr}]`).forEach(el => {
        const code = el.getAttribute(attr).toUpperCase();
        if (COORD_MAP[code]) flags.add(code);
      });
    });
    let m6count = 0;
    document.querySelectorAll('img').forEach(img => {
      const src = (img.src || '').toLowerCase();
      if (src.includes('/flag') || src.includes('assets')) {
        Object.keys(COORD_MAP).forEach(code => {
          if (src.includes(`/${code.toLowerCase()}.`) || src.includes(`-${code.toLowerCase()}.`)) {
            flags.add(code);
            m6count++;
          }
        });
      }
    });
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile && flags.size === 0) {
      let m7count = 0;
      const text = document.body.innerText;
      Object.keys(FLAG_EMOJI)。forEach(code => {
        if (text.includes(FLAG_EMOJI[code])) {
          flags.add(code);
          m7count++;
        }
      });
    }
    return Array.from(flags).sort();
  }

  function generateData(codes) {
    const points = [];
    const arcs = [];
    codes.forEach(code => {
      const coord = COORD_MAP[code];
      if (!coord) return;
      points.push({ code, lat: coord[0], lng: coord[1] });
    });
    if (points.length <= 1) return { points, arcs, codes };

    const maxArcs = Math.min(40, points.length * 3);
    const used = new Set();
    let loops = 0;
    while (arcs.length < maxArcs && loops < 1000) {
      loops++;
      const i = Math.floor(Math.random() * points.length);
      let j = Math.floor(Math.random() * points.length);
      if (i === j) continue;
      const c1 = points[i].code, c2 = points[j].code;
      const key = [c1, c2].sort().join('-');
      if (used.has(key)) continue;
      used.add(key);
      const p1 = points[i], p2 = points[j];
      arcs.push({
        startLat: p1.lat, startLng: p1.lng,
        endLat: p2.lat, endLng: p2.lng
      });
    }
    return { points, arcs, codes };
  }

  function addDebugLog(msg) {
    const panel = document.getElementById('debug-panel');
    if (!panel) return;
    const div = document.createElement('div');
    div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    panel.appendChild(div);
    panel.scrollTop = panel.scrollHeight;
  }

  function initGlobe() {
    const renderArea = document.getElementById('earth-render-area');
    const globe = Globe()(renderArea);
    globe.width(renderArea.clientWidth).height(renderArea.clientHeight)
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      。atmosphereColor('rgba(26,84,144,0.8)')
      .atmosphereAltitude(0.25);
 
    const VPS_COORD = [39.9042, 116.4074]; // 北京纬度、经度，换成你 VPS 实际位置
    const R = 200; // 距离地球中心的距离，可调整
    const lat = VPS_COORD[0] * Math.PI / 180;
    const lng = VPS_COORD[1] * Math.PI / 180;
    const x = R * Math.cos(lat) * Math.cos(lng);
    const y = R * Math.sin(lat);
    const z = R * Math.cos(lat) * Math.sin(lng);

  globe.camera().position.set(x, y, z);
  globe.camera().lookAt(new THREE.Vector3(0,0,0));
    function update() {
      const codes = scanFlags();
      if (codes.length === 0) {
        document.getElementById('globe-status').textContent = 'No Data';
        document.getElementById('country-count').textContent = '0';
        addDebugLog('❌ No flag data found.');
        return;
      }
      document.getElementById('globe-status').textContent = 'Active';
      document.getElementById('country-count').textContent = codes.length;

      const { points, arcs } = generateData(codes);
      globe.pointsData(points)
        .pointLat(d => d.lat).pointLng(d => d.lng)
        .pointColor(() => '#00ffff').pointAltitude(0.02).pointRadius(0.5);

      globe.htmlElementsData(points)
        .htmlElement(d => {
          const emoji = FLAG_EMOJI[d.code] || '';
          const cn = CODE_TO_CN[d.code] || d.code;
          const el = document.createElement('div');
          el.innerHTML = `<div class="earth-label-card"><span class="flag-emoji">${emoji}</span><b>${cn}</b></div>`;
          return el;
        })
        .htmlLat(d => d.lat).htmlLng(d => d.lng).htmlAltitude(0.01);

      globe.arcsData(arcs)
        .arcColor(() => ['rgba(0,255,255,0.5)','rgba(255,0,255,0.5)'])
        .arcDashLength(0.7).arcDashGap(0.2).arcDashAnimateTime(2000)
        .arcStroke(1.2).arcAltitude(0.3);
    }

    window.addEventListener('resize', () => {
      globe.width(renderArea.clientWidth).height(renderArea.clientHeight);
    });

    update();
    setInterval(update, 30000);
  }

  //// —— 6. 绑定切换按钮 & 初始化 —— 
  function setupToggle() {
    const btn = document.getElementById('earth-toggle-btn');
    const container = document.getElementById('earth-drawer-container');
    btn.addEventListener('click', () => {
      container.classList.add('active');
      btn.classList.add('hidden');
      document.getElementById('globe-status').textContent = 'Scanning';
      initGlobe();
    });
    document.getElementById('earth-close-btn').addEventListener('click', () => {
      container.classList.remove('active');
      btn.classList.remove('hidden');
    });
    document.getElementById('toggle-debug').addEventListener('click', () => {
      document.getElementById('debug-panel').classList.toggle('show');
    });
  }

  //// —— 7. 执行加载依赖 + 初始化按钮 —— 
  loadDependencies().then(() => {
    setupToggle();
    // 可自动初始化一次，也可以等用户点击按钮
    // initGlobe(); // 如需页面加载后自动弹出地球，可解除注释
  }).catch(err => {
    console.error('依赖加载失败', err);
  });

})();

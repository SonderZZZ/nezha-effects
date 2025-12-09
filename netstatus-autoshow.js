// ===== 自动注入 CSS =====
(function () {
    const css = `
#ip-bar {
    position: fixed;
    left: 50%;
    bottom: 12px;
    transform: translateX(-50%);
    z-index: 9999;
}

.ip-inner {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    border-radius: 20px;

    background: rgba(25, 25, 25, 0.45);
    backdrop-filter: blur(18px) saturate(180%);
    -webkit-backdrop-filter: blur(18px) saturate(180%);

    border: 1px solid rgba(255, 255, 255, 0.08);

    box-shadow:
        0 4px 18px rgba(0,0,0,0.35),
        0 1px 2px rgba(255,255,255,0.10) inset;

    position: relative;
    overflow: visible;

    transform: translateY(0px);
    transition:
        transform 0.35s cubic-bezier(.22,1.25,.32,1),
        box-shadow 0.3s ease,
        border-color 0.3s ease;
}

/* RGB 边框跑马灯 */
.ip-inner::after {
    content: "";
    position: absolute;
    inset: -3px;
    border-radius: inherit;

    background: linear-gradient(
        90deg,
        #ff004c,
        #ff6a00,
        #ffe600,
        #00ff4c,
        #00c8ff,
        #7a00ff,
        #ff00c8,
        #ff004c
    );
    background-size: 400% 100%;

    padding: 3px;

    -webkit-mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;

    opacity: 0;
    z-index: -1;
    transition: opacity .35s ease;
}

.ip-inner:hover {
    transform: translateY(-6px);
    border-color: rgba(255, 255, 255, 0.18);
    box-shadow:
        0 12px 28px rgba(0,0,0,0.45),
        0 1px 2px rgba(255,255,255,0.15) inset;
}

/* 启动灯条流动 */
.ip-inner:hover::after {
    opacity: 1;
    animation: borderFlow 4s linear infinite;
}

@keyframes borderFlow {
    0%   { background-position: 0% 50%; }
    100% { background-position: 400% 50%; }
}

.ip-icon {
    width: 18px;
    height: 18px;
    border-radius: 999px;
    border: 2px solid #1a73e8;
    position: relative;
}
.ip-icon::before {
    content: "";
    position: absolute;
    inset: 4px;
    border-radius: inherit;
    background: #1a73e8;
}

.ip-text {
    font-size: 14px;
    white-space: nowrap;
    max-width: 560px;
    overflow: hidden;
    text-overflow: ellipsis;
    color: rgba(235, 235, 235, 0.95);
    font-weight: 500;
}

.ip-l {
    color: #4da3ff;
    font-weight: 600;
    margin-right: 4px;
}
`;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
})();


// ===== 主体 JS：加载 IP Info =====
(function () {

    function getFromIpapi() {
        return fetch("https://ipapi.co/json/").then(r => r.json()).then(d => ({
            ip: d.ip || "",
            country: d.country_name || "",
            city: d.city || ""
        }));
    }

    function getFromIpinfo() {
        return fetch("https://ipinfo.io/json").then(r => r.json()).then(d => ({
            ip: d.ip || "",
            country: d.country || "",
            city: d.city || d.region || ""
        }));
    }

    function createBar() {
        if (document.getElementById("ip-bar")) return;
        const bar = document.createElement("div");
        bar.id = "ip-bar";
        bar.innerHTML = `
            <div class="ip-inner">
                <div class="ip-icon"></div>
                <div class="ip-text"><span class="ip-l">Your IP:</span><span id="ip-val">Loading...</span></div>
            </div>`;
        document.body.appendChild(bar);
    }

    function loadIP() {
        createBar();
        const el = document.getElementById("ip-val");

        getFromIpapi()
            .catch(getFromIpinfo)
            .then(res => {
                const ip = res.ip || "";
                const country = res.country || "";
                const city = res.city || "";
                let loc = "";
                if (country && city && country !== city) loc = `${country} · ${city}`;
                else loc = country || city || "";
                el.textContent = loc ? `${ip} ｜ ${loc}` : ip;
            })
            .catch(() => el.textContent = "Failed to get IP");
    }

    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", loadIP);
    else
        loadIP();

})();

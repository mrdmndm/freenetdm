'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface RouteData {
  metadata?: {
    last_updated: string;
    next_update: string;
  };
  statistics?: {
    total_ru_direct_domains: number;
    total_vpn_tunnel_domains: number;
    total_vpn_ip_ranges: number;
  };
  ru_direct?: {
    domains_sample: string[];
    files: string[];
  };
  vpn_tunnel?: {
    domains_sample: string[];
    ip_ranges_sample: string[];
    domain_files: string[];
    bat_files: string[];
  };
}

export default function RouteGenerator() {
  const [data, setData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<'inverse' | 'selective'>('inverse');
  const [connectionType, setConnectionType] = useState<'dns_50' | 'ip_bat' | 'raw_url' | 'amnezia_guide' | 'vps_guide'>('dns_50');
  const [activeGuideTab, setActiveGuideTab] = useState<'vps' | 'app' | 'keenetic_install' | 'keenetic_dns' | 'cli_asc' | 'policies'>('keenetic_install');
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/routes.json')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load routes data', err);
        setLoading(false);
      });
  }, []);

  const ruDomains = useMemo(() => data?.ru_direct?.domains_sample || [], [data]);
  const vpnDomains = useMemo(() => data?.vpn_tunnel?.domains_sample || [], [data]);

  const filteredRuDomains = useMemo(() => {
    if (!search.trim()) return ruDomains;
    return ruDomains.filter((d) => d.toLowerCase().includes(search.toLowerCase()));
  }, [ruDomains, search]);

  const filteredVpnDomains = useMemo(() => {
    if (!search.trim()) return vpnDomains;
    return vpnDomains.filter((d) => d.toLowerCase().includes(search.toLowerCase()));
  }, [vpnDomains, search]);

  const copyToClipboard = (text: string, identifier?: string) => {
    navigator.clipboard.writeText(text);
    if (identifier) {
      setCopiedUrl(identifier);
      setTimeout(() => setCopiedUrl(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadFile = async (rawUrl: string, rawFilename: string) => {
    const filename = rawFilename.split('/').pop() || rawFilename;
    const cleanPath = `/data/${filename}`;

    try {
      const response = await fetch(cleanPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert(`Ошибка скачивания файла ${filename}. Убедитесь, что файл сгенерирован на GitHub.`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-cyan-400 font-mono text-sm">
        [freenetdm] Загрузка конфигурационной базы и генератора...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 font-sans p-4 sm:p-8 space-y-8 selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation / Header */}
      <div className="max-w-6xl mx-auto backdrop-blur-2xl bg-black/60 border border-white/10 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.1)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent uppercase tracking-wider">
                ./freenetdm_
              </span>
              <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs sm:text-sm font-mono px-3 py-1 rounded-full uppercase tracking-widest">
                Keenetic OS 5.x Ready
              </span>
            </div>
            <p className="text-sm text-gray-300">
              Портал полной настройки AmneziaWG / Xray и генератор списков выборочной маршрутизации для роутеров Keenetic & Netcraze
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm font-mono">
            <div className="bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              База: {data?.metadata?.last_updated ? new Date(data.metadata.last_updated).toLocaleDateString('ru-RU') : '2026-11-26'}
            </div>
            <div className="bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Автообновление: каждые 14 дней
            </div>
          </div>
        </div>

        {/* AdminVPS Affiliate Club Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-black p-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-cyan-400 text-base font-bold uppercase tracking-wider">
              <span>⚡ Партнерский VPS-хостинг для своего VPN: AdminVPS</span>
              <span className="bg-fuchsia-500/20 text-fuchsia-300 text-xs px-2.5 py-1 rounded border border-fuchsia-500/30 font-mono">Скидка -60%</span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">
              Рекомендуемая локация: <strong>Нидерланды (Амстердам)</strong> или <strong>Финляндия (Хельсинки)</strong>. Безлимитный канал до 1 Гбит/с, полная совместимость с AmneziaWG/Xray, быстрая оплата картами РФ, СБП и криптовалютой.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-mono text-gray-300 pt-1">
              <span>Промокод на скидку 60%:</span>
              <code className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40 font-bold">OFF60</code>
            </div>
          </div>

          <a
            href="https://my.adminvps.ru/aff.php?aff=31526"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full lg:w-auto text-center bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 text-black font-black text-sm uppercase px-6 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] shrink-0"
          >
            Заказать VPS со скидкой 60% ➔
          </a>
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-6xl mx-auto backdrop-blur-2xl bg-black/60 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8 shadow-[0_0_50px_rgba(217,70,239,0.05)]">
        {/* Step 1: Mode Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300 font-mono">01</span>
              Режим работы роутера Keenetic
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setMode('inverse')}
              className={`p-5 rounded-2xl text-left border transition-all relative overflow-hidden ${
                mode === 'inverse'
                  ? 'bg-gradient-to-br from-cyan-950/60 to-black border-cyan-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base text-cyan-300">🔄 Инверсный режим («Все кроме RU»)</span>
                {mode === 'inverse' && <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4]"></span>}
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">
                <strong>AmneziaWG</strong> устанавливается основным подключением по умолчанию (<code className="text-cyan-400">0.0.0.0/0</code>). Все сайты РФ (.RU/.РФ, Госуслуги, банки) перенаправляются <strong>напрямую через провайдера (ISP)</strong>.
              </p>
            </button>

            <button
              onClick={() => setMode('selective')}
              className={`p-5 rounded-2xl text-left border transition-all relative overflow-hidden ${
                mode === 'selective'
                  ? 'bg-gradient-to-br from-fuchsia-950/60 to-black border-fuchsia-500 text-white shadow-[0_0_30px_rgba(217,70,239,0.2)]'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base text-fuchsia-300">🎯 Выборочный режим («Только списки»)</span>
                {mode === 'selective' && <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 shadow-[0_0_10px_#d946ef]"></span>}
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">
                Основным подключением остается <strong>интернет-провайдер (ISP)</strong>. Через туннель AmneziaWG направляются только выбранные заблокированные сервисы (YouTube, Telegram, Discord, ChatGPT).
              </p>
            </button>
          </div>
        </div>

        {/* Step 2: Wizard Selector Tabs */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-fuchsia-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-300 font-mono">02</span>
            Мастер выбора формата и инструкций
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setConnectionType('dns_50')}
              className={`p-4 rounded-xl text-sm font-medium border text-left transition ${
                connectionType === 'dns_50'
                  ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="font-bold text-cyan-300 mb-1">KeeneticOS 5.0+</div>
              <div className="text-xs text-gray-300">Домены .txt (по 300 шт)</div>
            </button>

            <button
              onClick={() => setConnectionType('ip_bat')}
              className={`p-4 rounded-xl text-sm font-medium border text-left transition ${
                connectionType === 'ip_bat'
                  ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="font-bold text-cyan-300 mb-1">KeeneticOS 4.x</div>
              <div className="text-xs text-gray-300">IP-маршруты .bat (1024)</div>
            </button>

            <button
              onClick={() => setConnectionType('raw_url')}
              className={`p-4 rounded-xl text-sm font-medium border text-left transition ${
                connectionType === 'raw_url'
                  ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="font-bold text-cyan-300 mb-1">RAW HTTPS Ссылки</div>
              <div className="text-xs text-gray-300">AdGuard / Entware / Neo</div>
            </button>

            <button
              onClick={() => setConnectionType('amnezia_guide')}
              className={`p-4 rounded-xl text-sm font-medium border text-left transition ${
                connectionType === 'amnezia_guide'
                  ? 'bg-fuchsia-950/80 border-fuchsia-400 text-white shadow-[0_0_20px_rgba(217,70,239,0.2)]'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="font-bold text-fuchsia-300 mb-1">📖 Полное руководство</div>
              <div className="text-xs text-gray-300">Настройка Keenetic с фото</div>
            </button>
          </div>
        </div>

        {/* Step 3: Interactive Guide or Downloads */}
        {connectionType === 'amnezia_guide' ? (
          <div className="space-y-6 bg-black/80 p-6 rounded-2xl border border-white/10">
            {/* Guide Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 text-sm font-mono">
              <button
                onClick={() => setActiveGuideTab('vps')}
                className={`px-4 py-2 rounded-lg border transition ${
                  activeGuideTab === 'vps' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'border-white/10 text-gray-400'
                }`}
              >
                1. VPS AdminVPS
              </button>
              <button
                onClick={() => setActiveGuideTab('app')}
                className={`px-4 py-2 rounded-lg border transition ${
                  activeGuideTab === 'app' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'border-white/10 text-gray-400'
                }`}
              >
                2. AmneziaVPN (IP + root)
              </button>
              <button
                onClick={() => setActiveGuideTab('keenetic_install')}
                className={`px-4 py-2 rounded-lg border transition ${
                  activeGuideTab === 'keenetic_install' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'border-white/10 text-gray-400'
                }`}
              >
                3. Импорт .conf в Keenetic
              </button>
              <button
                onClick={() => setActiveGuideTab('keenetic_dns')}
                className={`px-4 py-2 rounded-lg border transition ${
                  activeGuideTab === 'keenetic_dns' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'border-white/10 text-gray-400'
                }`}
              >
                4. Защита DNS и IPv6
              </button>
              <button
                onClick={() => setActiveGuideTab('cli_asc')}
                className={`px-4 py-2 rounded-lg border transition ${
                  activeGuideTab === 'cli_asc' ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300' : 'border-white/10 text-gray-400'
                }`}
              >
                5. CLI Команды ASC
              </button>
              <button
                onClick={() => setActiveGuideTab('policies')}
                className={`px-4 py-2 rounded-lg border transition ${
                  activeGuideTab === 'policies' ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300' : 'border-white/10 text-gray-400'
                }`}
              >
                6. Правила и Политики
              </button>
            </div>

            {/* Guide Body */}
            {activeGuideTab === 'vps' && (
              <div className="space-y-4 text-sm leading-relaxed text-gray-200">
                <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <span>🖥️ Шаг 1. Аренда сервера на AdminVPS</span>
                </h3>
                <p>
                  1. Перейдите по партнерской ссылке <a href="https://my.adminvps.ru/aff.php?aff=31526" target="_blank" rel="noreferrer" className="text-cyan-400 underline">my.adminvps.ru/aff.php?aff=31526</a>.<br />
                  2. Выберите раздел <strong>VPS/VDS ➔ VPS в Нидерландах</strong> (Амстердам) или <strong>Финляндии</strong> (Хельсинки).<br />
                  3. Тариф: <strong>Promo / Micro</strong> (KVM виртуализация, 1-2 vCPU, 2 ГБ RAM, NVMe диск).<br />
                  4. Операционная система: выберите <strong>Ubuntu 22.04 LTS</strong>.<br />
                  5. В поле промокода введите <code className="text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded">OFF60</code> (скидка 60% на первый месяц).<br />
                  6. Оплатите картой МИР/СБП. На почту придет письмо с <strong>IP-адресом сервера</strong> и паролем <code className="text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded">root</code>.
                </p>
                {/* Visual Architecture Diagram */}
                <div className="p-4 bg-black/90 rounded-xl border border-cyan-500/20 font-mono text-sm sm:text-sm text-cyan-400 space-y-1.5">
                  <div>[Схема подключения]</div>
                  <div>Устройство / ПК ➔ Keenetic (192.168.1.1) ➔ [Туннель AmneziaWG] ➔ AdminVPS (Нидерланды) ➔ Интернет</div>
                </div>
              </div>
            )}

            {activeGuideTab === 'app' && (
              <div className="space-y-4 text-sm leading-relaxed text-gray-200">
                <h3 className="text-sm font-bold text-cyan-300">
                  📱 Шаг 2. Авто-установка AmneziaVPN с телефона или ПК
                </h3>
                <p>
                  1. Скачайте официальное приложение <strong>AmneziaVPN</strong> с сайта <a href="https://amnezia.org/" target="_blank" rel="noreferrer" className="text-cyan-400 underline">amnezia.org</a>.<br />
                  2. Откройте приложение ➔ выберите <strong>«У меня есть данные для подключения»</strong> ➔ <strong>«Настроить свой сервер»</strong>.<br />
                  3. Введите IP-адрес сервера из письма AdminVPS, имя пользователя <code className="text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded">root</code> и ваш пароль.<br />
                  4. В окне выбора протоколов выберите <strong>AmneziaWG</strong> (или Xray Reality). Нажмите «Установить».<br />
                  5. Через 2 минуты после завершения установки нажмите <strong>«Поделиться»</strong> ➔ укажите имя <code className="text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded">Keenetic</code> ➔ выберите протокол AmneziaWG ➔ выберите формат <strong>«Оригинальный формат AmneziaWG»</strong>.<br />
                  6. Сохраните файл <code className="text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded">.conf</code> на устройство.
                </p>
              </div>
            )}

            {activeGuideTab === 'keenetic_install' && (
              <div className="space-y-4 text-sm leading-relaxed text-gray-200">
                <h3 className="text-sm font-bold text-cyan-300">
                  ⚙️ Шаг 3. Установка компонента WireGuard и импорт .conf в KeeneticOS
                </h3>
                <p>
                  1. Зайдите в веб-интерфейс Keenetic (<code className="text-cyan-300 bg-cyan-950 px-1 py-0.5 rounded">192.168.1.1</code>).<br />
                  2. Перейдите в раздел <strong>Управление ➔ Системные настройки ➔ Изменить набор компонентов</strong>.<br />
                  3. Найдите в поиске и отметьте галочкой компонент <strong>WireGuard VPN</strong>. Нажмите «Обновить KeeneticOS».<br />
                  4. После перезагрузки роутера зайдите в меню <strong>Сетевые правила (или Интернет) ➔ Другие подключения</strong>.<br />
                  5. В блоке WireGuard нажмите <strong>«Загрузить из файла»</strong> (или «Импортировать из файла») и выберите сохраненный файл <code className="text-cyan-300 bg-cyan-950 px-1 py-0.5 rounded">.conf</code>.<br />
                  6. Нажмите на значок карандаша рядом со созданным подключением: отметьте галочкой <strong>«Использовать для выхода в интернет»</strong> и нажмите «Сохранить».
                </p>
                {/* Visual UI Box Simulation */}
                <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-2 font-mono text-sm sm:text-sm">
                  <div className="text-gray-400">// Настройки подключения Wireguard в KeeneticOS:</div>
                  <div className="text-white">Название: <span className="text-cyan-400">amnezia_for_awg</span></div>
                  <div className="text-emerald-400">☑ Использовать для выхода в интернет</div>
                  <div className="text-gray-400">DNS 1: <span className="text-cyan-400">1.1.1.1</span> | DNS 2: <span className="text-cyan-400">8.8.8.8</span></div>
                </div>
              </div>
            )}

            {activeGuideTab === 'keenetic_dns' && (
              <div className="space-y-4 text-sm leading-relaxed text-gray-200">
                <h3 className="text-sm font-bold text-cyan-300">
                  🛡️ Шаг 4. Настройка защищенных DNS и отключение IPv6 (Защита от утечек)
                </h3>
                <p>
                  1. В боковом меню откройте <strong>Сетевые правила ➔ Интернет-фильтры ➔ вкладка Настройка DNS</strong>.<br />
                  2. Нажмите «Добавить сервер», укажите адреса публичных DNS: <code className="text-cyan-300 bg-cyan-950 px-1 py-0.5 rounded">1.1.1.1</code> и <code className="text-cyan-300 bg-cyan-950 px-1 py-0.5 rounded">8.8.8.8</code> (тип DoT/DoH или стандартный).<br />
                  3. Перейдите в раздел <strong>Интернет ➔ Кабель Ethernet (основное подключение)</strong>.<br />
                  4. В параметрах IPv4 отметьте галочку <strong>«Игнорировать DNSv4 интернет-провайдера»</strong>.<br />
                  5. В параметрах IPv6 выберите <strong>«Не используется»</strong> и нажмите «Сохранить».
                </p>
              </div>
            )}

            {activeGuideTab === 'cli_asc' && (
              <div className="space-y-4 text-sm leading-relaxed text-gray-200">
                <h3 className="text-sm font-bold text-fuchsia-300">
                  ⌨️ Шаг 5. Применение специфических параметров AmneziaWG (ASC) через CLI
                </h3>
                <p className="leading-relaxed">
                  Для версий KeeneticOS 4.x/5.0 со старыми шаблонами маскировки AmneziaWG 1.0 требуется применить параметры <code className="text-fuchsia-300">Jc, Jmin, Jmax, S1, S2, H1, H2, H3, H4</code> из файла <code className="text-fuchsia-300">.conf</code>:
                </p>
                <div className="bg-black p-4 rounded-xl border border-fuchsia-500/30 font-mono text-sm sm:text-sm space-y-2 text-fuchsia-300">
                  <div>1. Нажмите на значок шестеренки в правом верхнем углу ➔ «Командная строка».</div>
                  <div>2. Введите команду: <code className="text-white">show interface</code> ➔ нажмите «Отправить запрос».</div>
                  <div>3. Найдите имя вашего туннеля (например, <code className="text-cyan-300">Wireguard0</code>).</div>
                  <div>4. Сформируйте и отправьте команду:</div>
                  <div className="text-emerald-400 bg-gray-900 p-2 rounded border border-gray-800">
                    interface Wireguard0 wireguard asc 3 10 50 68 90 1627566968 1895378186 86288281 465920850
                  </div>
                  <div>5. Сохраните конфигурацию роутера командой:</div>
                  <div className="text-emerald-400 bg-gray-900 p-2 rounded border border-gray-800">
                    system configuration save
                  </div>
                </div>
              </div>
            )}

            {activeGuideTab === 'policies' && (
              <div className="space-y-4 text-sm leading-relaxed text-gray-200">
                <h3 className="text-sm font-bold text-fuchsia-300">
                  🔀 Шаг 6. Настройка правил и приоритетов подключений в KeeneticOS
                </h3>
                <p>
                  1. <strong>Инверсный режим («Все кроме RU»):</strong> Зайдите в <strong>Интернет ➔ Приоритеты подключений</strong>. В «Политике по умолчанию» перетащите подключение AmneziaWG <strong>выше</strong> подключения провайдера.<br />
                  2. Зайдите в <strong>Сетевые правила ➔ Маршрутизация ➔ вкладка Маршруты DNS</strong>.<br />
                  3. Нажмите «Добавить список», скопируйте домены `.ru`/`.рф` из нарезанного файла <code className="text-cyan-300 bg-cyan-950 px-1 py-0.5 rounded">.txt</code> (до 300 штук) и сохраните.<br />
                  4. В секции «Правила маршрутизации» нажмите «Добавить», выберите список доменов и в поле «Интерфейс» укажите <strong>Основное подключение (провайдер ISP)</strong>.<br />
                  5. <strong>Выборочный режим:</strong> Поставьте провайдера первым в приоритетах, а списки заблокированных сервисов направьте на интерфейс <strong>AmneziaWG</strong>.
                </p>
              </div>
            )}
          </div>
        ) : connectionType === 'raw_url' ? (
          <div className="bg-black/80 p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="font-bold text-base text-cyan-300">
              🔗 Прямые RAW HTTPS-ссылки (Для автообновления в AdGuard Home / Entware / NextDNS):
            </h3>
            <div className="space-y-3 font-mono text-sm">
              <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 flex items-center justify-between gap-4">
                <span className="truncate text-cyan-400">/data/routes.json</span>
                <button
                  onClick={() => copyToClipboard('/data/routes.json', 'raw_json')}
                  className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 px-3 py-1.5 rounded-lg border border-cyan-500/30 transition shrink-0"
                >
                  {copiedUrl === 'raw_json' ? '✓ Скопировано' : '📋 Скопировать URL'}
                </button>
              </div>

              <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 flex items-center justify-between gap-4">
                <span className="truncate text-emerald-400">/data/ru_direct_domains_part1.txt</span>
                <button
                  onClick={() => copyToClipboard('/data/ru_direct_domains_part1.txt', 'raw_txt')}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 transition shrink-0"
                >
                  {copiedUrl === 'raw_txt' ? '✓ Скопировано' : '📋 Скопировать URL'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-black/80 p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <h3 className="font-bold text-base text-cyan-300">
                📥 Нарезанные файлы конфигурации ({connectionType === 'dns_50' ? 'Домены .txt по 300 шт' : 'IP-маршруты .bat по 1024 шт'}):
              </h3>
              <span className="text-sm text-gray-300 font-mono">
                Записей в предпросмотре: {mode === 'inverse' ? filteredRuDomains.length : filteredVpnDomains.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {connectionType === 'dns_50' ? (
                mode === 'inverse' ? (
                  (data?.ru_direct?.files || ['ru_direct_domains_part1.txt']).map((file, idx) => (
                    <button
                      key={file}
                      onClick={() => downloadFile(`/data/${file}`, file)}
                      className="bg-gray-900 hover:bg-gray-800 text-white text-sm px-5 py-3.5 rounded-xl border border-gray-700 flex items-center justify-between transition shadow-md"
                    >
                      <span>RU Список #{idx + 1} (300)</span>
                      <span className="text-cyan-400 font-mono">.txt</span>
                    </button>
                  ))
                ) : (
                  (data?.vpn_tunnel?.domain_files || ['vpn_tunnel_domains_part1.txt']).map((file, idx) => (
                    <button
                      key={file}
                      onClick={() => downloadFile(`/data/${file}`, file)}
                      className="bg-gray-900 hover:bg-gray-800 text-white text-sm px-5 py-3.5 rounded-xl border border-gray-700 flex items-center justify-between transition shadow-md"
                    >
                      <span>VPN Список #{idx + 1} (300)</span>
                      <span className="text-cyan-400 font-mono">.txt</span>
                    </button>
                  ))
                )
              ) : (
                (data?.vpn_tunnel?.bat_files || ['amnezia_routes_part1.bat']).map((file, idx) => (
                  <button
                    key={file}
                    onClick={() => downloadFile(`/data/${file}`, file)}
                    className="bg-gray-900 hover:bg-gray-800 text-white text-sm px-5 py-3.5 rounded-xl border border-gray-700 flex items-center justify-between transition shadow-md"
                  >
                    <span>IP Маршруты #{idx + 1} (1024)</span>
                    <span className="text-emerald-400 font-mono">.bat</span>
                  </button>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() =>
                  copyToClipboard(
                    `${window?.location?.origin || ''}?mode=${mode}&type=${connectionType}`,
                    'share_url'
                  )
                }
                className="text-sm text-gray-300 hover:text-white transition flex items-center gap-1 font-mono"
              >
                <span>🔗 {copiedUrl === 'share_url' ? 'Ссылка скопирована в буфер!' : 'Поделиться ссылкой на набор'}</span>
              </button>

              <button
                onClick={() =>
                  copyToClipboard(
                    (mode === 'inverse' ? filteredRuDomains : filteredVpnDomains).join('\n')
                  )
                }
                className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 text-black text-sm px-6 py-3 rounded-xl font-bold uppercase transition shadow-lg"
              >
                {copied ? '✓ Скопировано!' : '📋 Скопировать полный список'}
              </button>
            </div>
          </div>
        )}

        {/* Live Preview Console */}
        {connectionType !== 'amnezia_guide' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest font-mono">
                Терминал предпросмотра ({mode === 'inverse' ? 'Прямой доступ ISP' : 'Туннель AmneziaWG'})
              </h4>
              <input
                type="text"
                placeholder="Быстрый фильтр..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
              />
            </div>
            <div className="bg-black p-4 rounded-2xl border border-white/10 h-52 overflow-y-auto font-mono text-sm text-gray-300 space-y-1 shadow-inner">
              {(mode === 'inverse' ? filteredRuDomains : filteredVpnDomains).map((domain, i) => (
                <div key={i} className="hover:text-cyan-300 transition-colors">
                  {domain}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

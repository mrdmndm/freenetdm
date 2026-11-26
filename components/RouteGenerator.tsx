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
  const [connectionType, setConnectionType] = useState<'dns_50' | 'ip_bat' | 'raw_url' | 'amnezia_guide'>('dns_50');
  const [guideStep, setGuideStep] = useState<number>(1);
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

 const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Файл не найден (${response.status})`);
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
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-cyan-400 font-sans">
        <div className="flex items-center gap-3 bg-black/60 border border-cyan-500/30 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.2)]">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Инициализация системы freenetdm...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 font-sans p-4 sm:p-8 space-y-8 selection:bg-fuchsia-500 selection:text-white">
      {/* Container with Glassmorphism and Neon Border */}
      <div className="max-w-6xl mx-auto space-y-8 bg-black/60 backdrop-blur-2xl p-6 sm:p-10 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.12)]">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border border-cyan-500/30 text-cyan-300 text-xs px-3.5 py-1 rounded-full font-mono uppercase tracking-widest mb-3">
              <span>⚡ OFFICIAL HUB</span>
              <span className="text-gray-500">•</span>
              <span>v4.0 CLUB EDITION</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-indigo-400 tracking-tight">
              freenetdm
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-xl">
              Интерактивный центр маршрутизации KeeneticOS & Netcraze. Управление AmneziaWG, Xray Reality и защищенными DoT/DoH DNS.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 text-xs font-mono">
            <div className="bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>База: {data?.metadata?.last_updated ? new Date(data.metadata.last_updated).toLocaleDateString('ru-RU') : 'Обновлено'}</span>
            </div>
            <div className="bg-fuchsia-950/40 border border-fuchsia-500/30 text-fuchsia-300 px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.15)]">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400"></span>
              <span>Автообновление: 14 дней</span>
            </div>
          </div>
        </div>

        {/* Affiliate AdminVPS Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/70 via-black to-fuchsia-950/60 p-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] group">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-cyan-500 text-black font-extrabold text-[11px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  Рекомендуемый VPS
                </span>
                <span className="text-cyan-400 font-mono text-xs">AdminVPS (Нидерланды / Финляндия)</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Аренда VPS под AmneziaWG & Xray Reality со скидкой 60%
              </h3>
              <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                Высокоскоростные KVM-серверы в Европе (1 Гбит/с, безлимитный трафик, оплата СБП и картами РФ). Используйте промокод <code className="bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40 font-mono">OFF60</code> для максимальной выгоды.
              </p>
            </div>

            <a
              href="https://my.adminvps.ru/aff.php?aff=31526"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs px-6 py-3.5 rounded-xl transition duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] shrink-0 uppercase tracking-wider"
            >
              <span>Заказать VPS со скидкой</span>
              <span className="text-sm">➔</span>
            </a>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            Шаг 1. Выберите режим маршрутизации
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setMode('inverse')}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${
                mode === 'inverse'
                  ? 'bg-gradient-to-br from-cyan-950/60 to-black border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.25)] text-white'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base text-cyan-300">🔄 Инверсный режим</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                  ПО УМОЛЧАНИЮ
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Весь интернет-трафик идет через <strong>AmneziaWG / Xray</strong>. Сайты РФ (домены .RU, .РФ, Госуслуги, банки) направляются <strong>напрямую через провайдера (ISP)</strong>.
              </p>
            </button>

            <button
              onClick={() => setMode('selective')}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${
                mode === 'selective'
                  ? 'bg-gradient-to-br from-fuchsia-950/60 to-black border-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.25)] text-white'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base text-fuchsia-300">🎯 Выборочный режим</span>
                <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 px-2 py-0.5 rounded-full font-mono">
                  СЕЛЕКТИВНЫЙ
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Основной трафик идет через <strong>провайдера (ISP)</strong>. Только выбранные сервисы (YouTube, Discord, ChatGPT, Telegram) идут через <strong>AmneziaWG</strong>.
              </p>
            </button>
          </div>
        </div>

        {/* Integration Type Navigation */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></span>
            Шаг 2. Выберите способ подключения или справочник
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => setConnectionType('dns_50')}
              className={`p-4 rounded-xl border text-left text-xs font-medium transition duration-300 ${
                connectionType === 'dns_50'
                  ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="font-bold text-cyan-300 mb-1">KeeneticOS 5.0+</div>
              <div className="text-[11px] text-gray-400">DNS Домены (.txt по 300)</div>
            </button>

            <button
              onClick={() => setConnectionType('ip_bat')}
              className={`p-4 rounded-xl border text-left text-xs font-medium transition duration-300 ${
                connectionType === 'ip_bat'
                  ? 'bg-fuchsia-950/80 border-fuchsia-400 text-white shadow-[0_0_20px_rgba(217,70,239,0.3)]'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="font-bold text-fuchsia-300 mb-1">KeeneticOS 4.x</div>
              <div className="text-[11px] text-gray-400">IP Маршруты (.bat по 1024)</div>
            </button>

            <button
              onClick={() => setConnectionType('raw_url')}
              className={`p-4 rounded-xl border text-left text-xs font-medium transition duration-300 ${
                connectionType === 'raw_url'
                  ? 'bg-indigo-950/80 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="font-bold text-indigo-300 mb-1">RAW HTTPS Ссылки</div>
              <div className="text-[11px] text-gray-400">AdGuard Home / Entware</div>
            </button>

            <button
              onClick={() => setConnectionType('amnezia_guide')}
              className={`p-4 rounded-xl border text-left text-xs font-medium transition duration-300 ${
                connectionType === 'amnezia_guide'
                  ? 'bg-amber-950/80 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="font-bold text-amber-300 mb-1">📖 Инструкция Keenetic</div>
              <div className="text-[11px] text-gray-400">AmneziaWG + DoT/DoH DNS</div>
            </button>
          </div>
        </div>

        {/* Illustrated Keenetic Setup Guide */}
        {connectionType === 'amnezia_guide' ? (
          <div className="bg-black/70 p-6 sm:p-8 rounded-3xl border border-amber-500/30 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                  <span>🛠️ Иллюстрированный мануал настройки Keenetic</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Подробные шаги: от покупки VPS и создания AmneziaWG/Xray до настройки DoT/DoH DNS и ASC CLI команд.
                </p>
              </div>

              {/* Step Navigation Tabs */}
              <div className="flex flex-wrap gap-1.5 bg-black/60 p-1.5 rounded-xl border border-white/10">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <button
                    key={s}
                    onClick={() => setGuideStep(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                      guideStep === s
                        ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Шаг {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 1: VPS & AmneziaVPN */}
            {guideStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-black font-extrabold flex items-center justify-center text-sm">
                    1
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-white">Аренда VPS на AdminVPS и авто-настройка AmneziaVPN</h4>
                    <p className="text-xs text-gray-400">Подготовка сервера без использования командной строки</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 text-xs text-gray-300 leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/10">
                    <p>
                      <strong>1. Регистрация и выбор сервера:</strong> Перейдите по реферальной ссылке <a href="https://my.adminvps.ru/aff.php?aff=31526" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">AdminVPS</a>. Закажите тариф KVM в Нидерландах или Финляндии (ОС Ubuntu 22.04 LTS). Для максимальной выгоды укажите промокод <code className="bg-cyan-950 text-cyan-300 px-1 py-0.5 rounded">OFF60</code>.
                    </p>
                    <p>
                      <strong>2. Данные авторизации:</strong> После оплаты в письме и личном кабинете скопируйте <strong>IP-адрес сервера</strong> и пароль суперпользователя <code>root</code>.
                    </p>
                    <p>
                      <strong>3. Автоматическая установка протокола:</strong> Скачайте приложение <a href="https://amnezia.org/" target="_blank" rel="noreferrer" className="text-cyan-400 underline">AmneziaVPN</a>. Нажмите <em>«У меня есть данные для подключения»</em> ➔ <em>«Настроить свой сервер»</em> ➔ введите IP и пароль <code>root</code>. Выберите протокол <strong>AmneziaWG</strong> или <strong>Xray Reality</strong>.
                    </p>
                    <p>
                      <strong>4. Экспорт конфигурации:</strong> В приложении AmneziaVPN откройте настройки подключения ➔ <em>«Поделиться»</em> ➔ выберите <em>«Оригинальный формат AmneziaWG»</em> и сохраните файл <code>.conf</code> на ПК.
                    </p>
                  </div>

                  {/* UI Diagram Illustration */}
                  <div className="bg-black/90 p-5 rounded-2xl border border-cyan-500/30 flex flex-col justify-between font-mono text-[11px] space-y-4">
                    <div className="text-cyan-400 font-bold flex items-center justify-between border-b border-cyan-500/20 pb-2">
                      <span>СХЕМА АВТО-НАСТРОЙКИ VIRTUAL SERVER</span>
                      <span className="text-[9px] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40">Amnezia Engine</span>
                    </div>

                    <div className="space-y-2 text-gray-300">
                      <div className="p-2 bg-gray-900 rounded border border-gray-800 flex justify-between">
                        <span>Хостинг:</span>
                        <span className="text-white">AdminVPS (Нидерланды)</span>
                      </div>
                      <div className="p-2 bg-gray-900 rounded border border-gray-800 flex justify-between">
                        <span>Авторизация:</span>
                        <span className="text-emerald-400">IP + root password</span>
                      </div>
                      <div className="p-2 bg-gray-900 rounded border border-gray-800 flex justify-between">
                        <span>Протоколы:</span>
                        <span className="text-fuchsia-400">AmneziaWG / Xray Reality</span>
                      </div>
                      <div className="p-2 bg-gray-900 rounded border border-gray-800 flex justify-between">
                        <span>Результат:</span>
                        <span className="text-cyan-300">файл connection.conf</span>
                      </div>
                    </div>

                    <div className="p-3 bg-cyan-950/40 rounded border border-cyan-500/30 text-center text-cyan-300 font-sans text-xs">
                      ⚡ Готовый файл .conf готов для импорта в роутер Keenetic
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Keenetic Component Setup */}
            {guideStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-black font-extrabold flex items-center justify-center text-sm">
                    2
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-white">Установка системного компонента WireGuard VPN</h4>
                    <p className="text-xs text-gray-400">Активация встроенного модуля подписки в KeeneticOS</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 text-xs text-gray-300 leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/10">
                    <p>
                      1. Откройте браузер и перейдите в веб-интерфейс Keenetic по адресу <code>192.168.1.1</code> (или <code>my.keenetic.net</code>).
                    </p>
                    <p>
                      2. Зайдите в меню <strong>Управление</strong> ➔ <strong>Системные настройки</strong>.
                    </p>
                    <p>
                      3. В секции <em>«Обновление и компоненты»</em> нажмите кнопку <strong>«Изменить набор компонентов»</strong>.
                    </p>
                    <p>
                      4. Найдите в поиске элемент <strong>WireGuard VPN</strong> (и при необходимости <em>Протокол IPv6</em>) и отметьте галочкой.
                    </p>
                    <p>
                      5. Нажмите <strong>Сохранить изменения</strong> и дождитесь автоматической перезагрузки роутера.
                    </p>
                  </div>

                  {/* UI Illustration Card */}
                  <div className="bg-black/90 p-5 rounded-2xl border border-fuchsia-500/30 font-mono text-[11px] space-y-3">
                    <div className="text-fuchsia-400 font-bold border-b border-fuchsia-500/20 pb-2">
                      🖥️ ВЕБ-ИНТЕРФЕЙС KEENETICOS (192.168.1.1)
                    </div>
                    <div className="bg-gray-900 p-3 rounded border border-gray-800 space-y-2">
                      <div className="text-gray-400">[Управление] ➔ [Системные настройки]</div>
                      <div className="p-2 bg-fuchsia-950/40 border border-fuchsia-500/40 rounded text-fuchsia-300 flex items-center justify-between">
                        <span>[✓] WireGuard VPN</span>
                        <span className="text-[9px] bg-fuchsia-500 text-black px-1.5 font-bold rounded">УСТАНОВЛЕНО</span>
                      </div>
                      <div className="text-[10px] text-gray-400 italic">
                        * Рекомендуется версия KeeneticOS 5.0 или новее.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Import Config & Connection Interface */}
            {guideStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-black font-extrabold flex items-center justify-center text-sm">
                    3
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-white">Импорт файла .conf и включение туннеля</h4>
                    <p className="text-xs text-gray-400">Создание интерфейса AmneziaWG в «Других подключениях»</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 text-xs text-gray-300 leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/10">
                    <p>
                      1. Перейдите в раздел <strong>Сетевые правила</strong> (или <em>Интернет</em>) ➔ <strong>Другие подключения</strong>.
                    </p>
                    <p>
                      2. В секции <em>WireGuard</em> нажмите кнопку <strong>«Загрузить из файла»</strong> и выберите сохраненный `.conf` файл.
                    </p>
                    <p>
                      3. Нажмите значок редактирования (карандаш) созданного подключения:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-300">
                      <li>Поставьте галочку <strong>«Использовать для выхода в интернет»</strong>.</li>
                      <li>Укажите публичные DNS-серверы: <code>1.1.1.1</code>, <code>8.8.8.8</code>.</li>
                      <li>Проверьте наличие адреса сервера и ключей шифрования.</li>
                    </ul>
                    <p>
                      4. Нажмите <strong>Сохранить</strong> и активируйте переключатель включения подключения.
                    </p>
                  </div>

                  {/* UI Illustration */}
                  <div className="bg-black/90 p-5 rounded-2xl border border-emerald-500/30 font-mono text-[11px] space-y-3">
                    <div className="text-emerald-400 font-bold border-b border-emerald-500/20 pb-2">
                      🌐 ДРУГИЕ ПОДКЛЮЧЕНИЯ ➔ WIREGUARD
                    </div>
                    <div className="bg-gray-900 p-3 rounded border border-gray-800 space-y-2">
                      <div className="flex items-center justify-between text-white font-bold">
                        <span>AmneziaWG_Interface</span>
                        <span className="text-emerald-400 animate-pulse">● ПОДКЛЮЧЕНО</span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        [✓] Использовать для выхода в интернет
                      </div>
                      <div className="text-[10px] text-cyan-300">
                        DNS: 1.1.1.1, 8.8.8.8
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Encrypted DNS (DoT / DoH) & Leak Protection */}
            {guideStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-black font-extrabold flex items-center justify-center text-sm">
                    4
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-white">Настройка шифрованного DNS (DoT / DoH) и защита от утечек</h4>
                    <p className="text-xs text-gray-400">Предотвращение перехвата DNS-запросов и отключение IPv6</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 text-xs text-gray-300 leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/10">
                    <p>
                      <strong>1. Настройка DNS-over-TLS (DoT) / DNS-over-HTTPS (DoH):</strong><br />
                      Перейдите в <strong>Сетевые правила</strong> ➔ <strong>Интернет-фильтры</strong> ➔ вкладка <strong>Настройка DNS</strong>.<br />
                      Нажмите <em>«Добавить сервер»</em> и введите шифрованные адреса:
                    </p>
                    <ul className="list-disc pl-5 font-mono text-[11px] space-y-1 text-cyan-300">
                      <li><code>tls://1.1.1.1@one.one.one.one</code> (Cloudflare DoT)</li>
                      <li><code>tls://dns.google@dns.google</code> (Google DoT)</li>
                      <li><code>https://dns.cloudflare.com/dns-query</code> (Cloudflare DoH)</li>
                    </ul>
                    <p>
                      <strong>2. Отключение DNS провайдера:</strong> В настройках основного подключения (Ethernet / ISP) активируйте галочку <em>«Игнорировать DNSv4 интернет-провайдера»</em>.
                    </p>
                    <p>
                      <strong>3. Отключение IPv6:</strong> В настройках подключений переведите IPv6 в положение <em>«Не используется»</em>, чтобы исключить утечки трафика мимо VPN.
                    </p>
                  </div>

                  {/* UI Illustration */}
                  <div className="bg-black/90 p-5 rounded-2xl border border-cyan-500/30 font-mono text-[11px] space-y-3">
                    <div className="text-cyan-400 font-bold border-b border-cyan-500/20 pb-2">
                      🔒 ИНТЕРНЕТ-ФИЛЬТРЫ ➔ НАСТРОЙКА DNS (DoT / DoH)
                    </div>
                    <div className="bg-gray-900 p-3 rounded border border-gray-800 space-y-2">
                      <div className="p-2 bg-cyan-950/40 border border-cyan-500/30 rounded text-cyan-200">
                        DoT: tls://1.1.1.1@one.one.one.one
                      </div>
                      <div className="p-2 bg-cyan-950/40 border border-cyan-500/30 rounded text-cyan-200">
                        DoT: tls://dns.google@dns.google
                      </div>
                      <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded text-emerald-300">
                        [✓] Игнорировать DNSv4 провайдера
                      </div>
                      <div className="p-2 bg-red-950/40 border border-red-500/30 rounded text-red-300">
                        [X] IPv6: Не используется
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: AmneziaWG CLI ASC Parameters */}
            {guideStep === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-black font-extrabold flex items-center justify-center text-sm">
                    5
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-white">Ввод маскирующих CLI-параметров AmneziaWG (ASC)</h4>
                    <p className="text-xs text-gray-400">Обход блокировок протокола WireGuard на уровне DPI</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 text-xs text-gray-300 leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/10">
                    <p>
                      Если в вашем `.conf` файле AmneziaWG присутствуют параметры зашумления (<code>Jc</code>, <code>Jmin</code>, <code>Jmax</code>, <code>S1</code>, <code>S2</code>, <code>H1</code>-<code>H4</code>), их необходимо применить через CLI Keenetic:
                    </p>
                    <p>
                      1. Нажмите на иконку шестеренки ➔ <strong>Командная строка</strong> (или подключитесь по SSH).
                    </p>
                    <p>
                      2. Выполните команду: <code className="bg-black text-cyan-300 px-1 py-0.5 rounded font-mono">show interface</code> и найдите системное имя туннеля (например, <code>Wireguard0</code>).
                    </p>
                    <p>
                      3. Введите команду маскировки ASC в формате:
                    </p>
                    <pre className="bg-black p-2 rounded text-[10px] text-emerald-400 font-mono overflow-x-auto border border-gray-800">
interface Wireguard0 wireguard asc &lt;Jc&gt; &lt;Jmin&gt; &lt;Jmax&gt; &lt;S1&gt; &lt;S2&gt; &lt;H1&gt; &lt;H2&gt; &lt;H3&gt; &lt;H4&gt;
                    </pre>
                    <p>
                      4. Сохраните конфигурацию роутера командой: <code className="bg-black text-cyan-300 px-1 py-0.5 rounded font-mono">system configuration save</code>.
                    </p>
                  </div>

                  {/* UI Illustration */}
                  <div className="bg-black/90 p-5 rounded-2xl border border-fuchsia-500/30 font-mono text-[11px] space-y-3">
                    <div className="text-fuchsia-400 font-bold border-b border-fuchsia-500/20 pb-2">
                      💻 KEENETIC CLI TERMINAL
                    </div>
                    <div className="bg-gray-950 p-3 rounded border border-gray-800 space-y-1.5 text-[10px] text-gray-300">
                      <div>(config)&gt; <span className="text-white">show interface Wireguard0</span></div>
                      <div className="text-gray-500">... interface status: UP</div>
                      <div>(config)&gt; <span className="text-cyan-300">interface Wireguard0 wireguard asc 4 10 50 15 25 1 2 3 4</span></div>
                      <div className="text-emerald-400">NetworkASC: applied parameters successfully</div>
                      <div>(config)&gt; <span className="text-white">system configuration save</span></div>
                      <div className="text-gray-400">Core::Configuration: saved to flash memory.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Route Policies & Domain Lists */}
            {guideStep === 6 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-black font-extrabold flex items-center justify-center text-sm">
                    6
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-white">Приоритеты подключений и привязка маршрутов DNS</h4>
                    <p className="text-xs text-gray-400">Завершающая настройка правил разделения трафика</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 text-xs text-gray-300 leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/10">
                    <p>
                      <strong>1. Для инверсного режима («Всё через VPN, кроме RU»):</strong><br />
                      Перейдите в <strong>Сетевые правила</strong> ➔ <strong>Приоритеты подключений</strong>. В «Политике по умолчанию» перетащите подключение AmneziaWG на самую верхнюю позицию (выше провайдера).
                    </p>
                    <p>
                      <strong>2. Загрузка доменных списков:</strong><br />
                      Зайдите в <strong>Сетевые правила</strong> ➔ <strong>Маршрутизация</strong> ➔ вкладка <strong>Доменные имена</strong>.<br />
                      Нажмите <em>«Добавить список»</em>, укажите название (например, <code>RU Direct</code>). В поле <em>«Интерфейс»</em> выберите <strong>Основное подключение (ISP)</strong> и вставьте скачанные с freenetdm файлы <code>.txt</code> (по 300 доменов).
                    </p>
                    <p>
                      <strong>3. Для выборочного режима:</strong> В «Политике по умолчанию» первым остается провайдер, а списки заблокированных сайтов привязываются к интерфейсу <strong>AmneziaWG</strong>.
                    </p>
                  </div>

                  {/* UI Illustration */}
                  <div className="bg-black/90 p-5 rounded-2xl border border-amber-500/30 font-mono text-[11px] space-y-3">
                    <div className="text-amber-400 font-bold border-b border-amber-500/20 pb-2">
                      🔀 МАРШРУТИЗАЦИЯ ➔ ДОМЕННЫЕ ИМЕНА
                    </div>
                    <div className="bg-gray-900 p-3 rounded border border-gray-800 space-y-2">
                      <div className="p-2 bg-gray-800 rounded flex justify-between">
                        <span>Список: RU_Direct_Part1</span>
                        <span className="text-cyan-300">Выход ➔ ISP (Провайдер)</span>
                      </div>
                      <div className="p-2 bg-gray-800 rounded flex justify-between">
                        <span>Список: RU_Direct_Part2</span>
                        <span className="text-cyan-300">Выход ➔ ISP (Провайдер)</span>
                      </div>
                      <div className="p-2 bg-amber-950/40 border border-amber-500/30 rounded text-amber-300 text-[10px]">
                        ⚡ Все прочие домены автоматически идут через AmneziaWG туннель!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : connectionType === 'raw_url' ? (
          <div className="bg-black/70 p-6 rounded-3xl border border-indigo-500/30 space-y-4">
            <h3 className="font-bold text-sm text-indigo-300">
              🔗 Прямые RAW HTTPS-ссылки (Для AdGuard Home / NextDNS / Entware / HydraRoute):
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-black p-4 rounded-xl border border-white/10 flex items-center justify-between gap-3">
                <span className="truncate text-cyan-400">/data/routes.json</span>
                <button
                  onClick={() => copyToClipboard('/data/routes.json', 'json_raw')}
                  className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-white font-sans transition shrink-0"
                >
                  {copiedUrl === 'json_raw' ? '✓ Скопировано' : '📋 Скопировать RAW'}
                </button>
              </div>

              <div className="bg-black p-4 rounded-xl border border-white/10 flex items-center justify-between gap-3">
                <span className="truncate text-emerald-400">/data/ru_direct_domains_part1.txt</span>
                <button
                  onClick={() => copyToClipboard('/data/ru_direct_domains_part1.txt', 'txt_raw')}
                  className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-white font-sans transition shrink-0"
                >
                  {copiedUrl === 'txt_raw' ? '✓ Скопировано' : '📋 Скопировать RAW'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-black/70 p-6 rounded-3xl border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <h3 className="font-bold text-sm text-white">
                📥 Скачивание файлов ({connectionType === 'dns_50' ? 'Домены KeeneticOS 5.0+' : 'IP-маршруты KeeneticOS 4.x'}):
              </h3>
              <span className="text-xs text-gray-400 font-mono">
                Записей: {mode === 'inverse' ? filteredRuDomains.length : filteredVpnDomains.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {connectionType === 'dns_50' ? (
                mode === 'inverse' ? (
                  (data?.ru_direct?.files || ['ru_direct_domains_part1.txt']).map((file, idx) => (
                    <button
                      key={file}
                      onClick={() => downloadFile(`/data/${file}`, file)}
                      className="bg-white/5 hover:bg-white/10 text-white text-xs p-4 rounded-xl border border-white/10 flex items-center justify-between transition group"
                    >
                      <span className="font-medium">RU DNS Список #{idx + 1} (300)</span>
                      <span className="text-cyan-400 font-mono group-hover:scale-110 transition">.txt</span>
                    </button>
                  ))
                ) : (
                  (data?.vpn_tunnel?.domain_files || ['vpn_tunnel_domains_part1.txt']).map((file, idx) => (
                    <button
                      key={file}
                      onClick={() => downloadFile(`/data/${file}`, file)}
                      className="bg-white/5 hover:bg-white/10 text-white text-xs p-4 rounded-xl border border-white/10 flex items-center justify-between transition group"
                    >
                      <span className="font-medium">VPN DNS Список #{idx + 1} (300)</span>
                      <span className="text-fuchsia-400 font-mono group-hover:scale-110 transition">.txt</span>
                    </button>
                  ))
                )
              ) : (
                (data?.vpn_tunnel?.bat_files || ['amnezia_routes_part1.bat']).map((file, idx) => (
                  <button
                    key={file}
                    onClick={() => downloadFile(`/data/${file}`, file)}
                    className="bg-white/5 hover:bg-white/10 text-white text-xs p-4 rounded-xl border border-white/10 flex items-center justify-between transition group"
                  >
                    <span className="font-medium">IP Маршруты #{idx + 1} (1024)</span>
                    <span className="text-emerald-400 font-mono group-hover:scale-110 transition">.bat</span>
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
                className="text-xs text-gray-400 hover:text-cyan-300 transition flex items-center gap-1.5"
              >
                <span>🔗 {copiedUrl === 'share_url' ? 'Ссылка скопирована!' : 'Поделиться ссылкой на выбор'}</span>
              </button>

              <button
                onClick={() =>
                  copyToClipboard(
                    (mode === 'inverse' ? filteredRuDomains : filteredVpnDomains).join('\n')
                  )
                }
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                {copied ? '✓ Скопировано!' : '📋 Скопировать весь список'}
              </button>
            </div>
          </div>
        )}

        {/* Live Search & Terminal Preview */}
        {connectionType !== 'amnezia_guide' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Предпросмотр базы ({mode === 'inverse' ? 'Прямой доступ ISP' : 'Туннель AmneziaWG'})
              </h4>
              <input
                type="text"
                placeholder="Фильтр записей..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div className="bg-black p-5 rounded-2xl border border-white/10 h-56 overflow-y-auto font-mono text-xs text-gray-300 space-y-1 selection:bg-cyan-500 selection:text-black">
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

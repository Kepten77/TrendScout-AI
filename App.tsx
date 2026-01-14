
import React, { useState } from 'react';
import { 
  Search, 
  TrendingUp, 
  Instagram, 
  Youtube, 
  Video, 
  Calendar, 
  Layers, 
  FileText, 
  ChevronRight, 
  Zap, 
  BarChart3,
  Loader2,
  Sparkles,
  RefreshCcw,
  Copy,
  Link as LinkIcon,
  Users,
  AtSign,
  Pin
} from 'lucide-react';
import { Platform, Timeframe, ViralContent, ContentAnalysis, GeneratedContent } from './types';
import { 
  searchTrends, 
  getChannelTrends, 
  analyzeSpecificUrl, 
  analyzeContent, 
  generateNewContent 
} from './services/geminiService';

type SearchMode = 'topic' | 'channel' | 'link';

const App: React.FC = () => {
  const [searchMode, setSearchMode] = useState<SearchMode>('topic');
  const [topic, setTopic] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['instagram', 'tiktok', 'youtube', 'threads', 'pinterest']);
  const [timeframe, setTimeframe] = useState<Timeframe>('week');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ViralContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<ViralContent | null>(null);
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedContent | null>(null);
  const [view, setView] = useState<'search' | 'results' | 'analysis' | 'generator'>('search');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    
    try {
      if (searchMode === 'topic') {
        if (!topic) return;
        setView('results');
        const data = await searchTrends(topic, selectedPlatforms, timeframe);
        setResults(data);
      } else if (searchMode === 'channel') {
        if (!urlInput) return;
        setView('results');
        const data = await getChannelTrends(urlInput);
        setResults(data);
      } else if (searchMode === 'link') {
        if (!urlInput) return;
        const { content, analysis: contentAnalysis } = await analyzeSpecificUrl(urlInput);
        setSelectedContent(content);
        setAnalysis(contentAnalysis);
        setView('analysis');
      }
    } catch (err) {
      console.error(err);
      alert("Произошла ошибка при анализе ИИ. Пожалуйста, попробуйте еще раз.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContent = async (content: ViralContent) => {
    setSelectedContent(content);
    setLoading(true);
    setView('analysis');
    try {
      const data = await analyzeContent(content);
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (type: 'script' | 'carousel') => {
    if (!analysis) return;
    setLoading(true);
    try {
      const result = await generateNewContent(analysis, type);
      setGeneratedResult(result);
      setView('generator');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Скопировано в буфер обмена!');
  };

  const resetSearch = () => {
    setView('search');
    setResults([]);
    setSelectedContent(null);
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={resetSearch}>
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <TrendingUp size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            TrendScout AI
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={resetSearch}
            className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Новый поиск
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        {loading && (
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[60] flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
            <p className="text-lg font-medium text-gray-700 text-center">ИИ ищет и анализирует...</p>
            <p className="text-sm text-gray-400 mt-2 text-center">Это может занять около минуты для глубокого анализа</p>
          </div>
        )}

        {/* Search View */}
        {view === 'search' && (
          <div className="max-w-3xl mx-auto py-12">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Интеллектуальный парсинг контента.</h2>
              <p className="text-lg text-gray-600">Найдите виральные идеи, парсите каналы или деконструируйте хиты.</p>
            </div>
            
            {/* Mode Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-8 border border-gray-200">
              {[
                { id: 'topic', label: 'По теме', icon: Search },
                { id: 'channel', label: 'Парсинг канала', icon: Users },
                { id: 'link', label: 'По ссылке', icon: LinkIcon }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSearchMode(mode.id as SearchMode)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    searchMode === mode.id 
                      ? 'bg-white text-indigo-600 shadow-sm border border-gray-100' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <mode.icon size={16} />
                  {mode.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              {searchMode === 'topic' ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Тема или ключевое слово</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Напр: Минимализм для новичков, нейросети 2024..."
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-gray-200 border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    {searchMode === 'channel' ? 'Ссылка на канал' : 'Ссылка на пост/ролик'}
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="url" 
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder={searchMode === 'channel' ? "Вставьте ссылку на YouTube/TikTok/IG/Threads канал" : "Вставьте ссылку на пост"}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-gray-200 border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-lg"
                    />
                  </div>
                </div>
              )}

              {searchMode === 'topic' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Платформы</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {[
                        { id: 'instagram' as Platform, icon: Instagram, color: 'text-pink-600' },
                        { id: 'tiktok' as Platform, icon: Video, color: 'text-gray-900' },
                        { id: 'youtube' as Platform, icon: Youtube, color: 'text-red-600' },
                        { id: 'threads' as Platform, icon: AtSign, color: 'text-black' },
                        { id: 'pinterest' as Platform, icon: Pin, color: 'text-red-700' }
                      ].map(({ id, icon: Icon, color }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => togglePlatform(id)}
                          className={`flex items-center justify-center gap-2 py-2 px-2 rounded-lg border transition-all ${
                            selectedPlatforms.includes(id) 
                              ? `bg-indigo-50 border-indigo-200 ${color}` 
                              : 'bg-white border-gray-200 text-gray-400'
                          }`}
                        >
                          <Icon size={16} />
                          <span className="text-xs font-medium capitalize">{id}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Период</label>
                    <div className="flex gap-2">
                      {[
                        { id: 'day', label: 'За день' },
                        { id: 'week', label: 'За неделю' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTimeframe(t.id as Timeframe)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border transition-all ${
                            timeframe === t.id 
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                              : 'bg-white border-gray-200 text-gray-400'
                          }`}
                        >
                          <Calendar size={18} />
                          <span className="text-sm font-medium">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Zap size={20} />
                {searchMode === 'topic' ? 'Найти виральный контент' : 
                 searchMode === 'channel' ? 'Парсить тренды канала' : 'Деконструировать пост'}
              </button>
            </form>
          </div>
        )}

        {/* Results View */}
        {view === 'results' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {searchMode === 'topic' ? `Тренды по теме "${topic}"` : `Популярное из канала`}
                </h2>
                <p className="text-gray-500">Выберите контент для извлечения виральной ДНК</p>
              </div>
              <button onClick={() => setView('search')} className="flex items-center gap-2 text-indigo-600 font-medium hover:underline">
                <RefreshCcw size={18} />
                Новый поиск
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.length > 0 ? results.map((content) => (
                <div 
                  key={content.id} 
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer group flex flex-col"
                  onClick={() => handleSelectContent(content)}
                >
                  <div className="relative aspect-video">
                    <img 
                      src={content.thumbnail || `https://picsum.photos/seed/${content.id}/400/225`} 
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        {content.platform?.toLowerCase().includes('instagram') && <Instagram size={12} className="text-pink-600" />}
                        {content.platform?.toLowerCase().includes('youtube') && <Youtube size={12} className="text-red-600" />}
                        {content.platform?.toLowerCase().includes('tiktok') && <Video size={12} className="text-gray-900" />}
                        {content.platform?.toLowerCase().includes('threads') && <AtSign size={12} className="text-black" />}
                        {content.platform?.toLowerCase().includes('pinterest') && <Pin size={12} className="text-red-700" />}
                        {content.platform}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                      {content.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>@{content.author || 'автор'}</span>
                      <div className="flex items-center gap-1">
                        <BarChart3 size={14} />
                        {content.views} охват
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Активность</div>
                        <div className="text-sm font-bold text-gray-700">{content.likes || 'N/A'}</div>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Влияние</div>
                        <div className="text-sm font-bold text-gray-700">{content.comments || 'N/A'}</div>
                      </div>
                    </div>
                    <button className="w-full mt-4 py-2 border border-indigo-100 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                      Глубокий анализ <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center">
                  <p className="text-gray-400 italic">Виральный контент не найден.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis View */}
        {view === 'analysis' && selectedContent && analysis && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView(results.length > 0 ? 'results' : 'search')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight size={24} className="rotate-180" />
              </button>
              <h2 className="text-2xl font-bold">Деконструкция контента</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="text-indigo-500" size={20} />
                    Инсайты и смыслы
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase mb-1">ОСНОВНАЯ ИДЕЯ / КРЮЧОК</div>
                      <p className="text-gray-800 leading-relaxed font-medium text-lg">{analysis.coreIdea}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-bold text-gray-400 uppercase mb-1">ЭМОЦИЯ И ВАЙБ</div>
                        <p className="text-gray-700">{analysis.emotion}</p>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-400 uppercase mb-1">ПОДАЧА / ТОН</div>
                        <p className="text-gray-700">{analysis.tone || 'Динамично и вовлекающе'}</p>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase mb-1">СКРЫТЫЙ СМЫСЛ</div>
                      <p className="text-gray-600 leading-relaxed">{analysis.meaning}</p>
                    </div>
                  </div>
                </section>

                <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Layers className="text-purple-500" size={20} />
                    Структура повествования
                  </h3>
                  <div className="space-y-3">
                    {analysis.structure.map((step, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                        <div className="flex-shrink-0 w-8 h-8 bg-white border border-indigo-100 flex items-center justify-center rounded-full text-sm font-bold text-indigo-600 shadow-sm">
                          {i + 1}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FileText className="text-gray-500" size={20} />
                    Полный сценарий / Текст
                  </h3>
                  <div className="max-h-60 overflow-y-auto p-5 bg-gray-900 rounded-xl text-sm text-gray-300 whitespace-pre-line border border-gray-800 font-mono">
                    {analysis.fullTranscript || selectedContent.transcript}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(analysis.fullTranscript || selectedContent.transcript)}
                    className="mt-3 text-xs flex items-center gap-1 text-indigo-600 font-bold hover:underline"
                  >
                    <Copy size={12} /> Копировать весь текст
                  </button>
                </section>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-xl shadow-indigo-100">
                  <h3 className="text-lg font-bold mb-2">Режим креатора</h3>
                  <p className="text-indigo-100 text-sm mb-6">Превратите эти смыслы в свой новый хит с помощью ИИ.</p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleGenerate('script')}
                      className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg"
                    >
                      <Video size={18} />
                      Создать готовый сценарий
                    </button>
                    <button 
                      onClick={() => handleGenerate('carousel')}
                      className="w-full bg-indigo-500/30 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-500/50 transition-colors border border-indigo-400"
                    >
                      <Layers size={18} />
                      Создать фото-карусель
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Психологические триггеры</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.triggers.map((tag, i) => (
                      <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-100">
                        {tag.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedContent.platform && (
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Метаданные</div>
                    <div className="text-xs space-y-1 text-gray-600">
                      <p><strong>Платформа:</strong> {selectedContent.platform}</p>
                      <p><strong>Автор:</strong> {selectedContent.author}</p>
                      <p><strong>Охват:</strong> {selectedContent.views}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Generator View */}
        {view === 'generator' && generatedResult && (
          <div className="max-w-3xl mx-auto space-y-8">
             <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('analysis')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight size={24} className="rotate-180" />
              </button>
              <h2 className="text-2xl font-bold">Сгенерировано ИИ: {generatedResult.type === 'script' ? 'Сценарий' : 'Карусель'}</h2>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden">
              <div className="bg-gray-900 p-8 text-white relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Sparkles size={80} />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                    ГЕНЕРАТОР КОНТЕНТА
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => copyToClipboard(generatedResult.content.join('\n\n'))}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                      title="Скопировать все"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold leading-tight">{generatedResult.title}</h3>
              </div>
              
              <div className="p-8 space-y-6">
                {generatedResult.type === 'script' ? (
                  <div className="space-y-6">
                    {generatedResult.content.map((part, i) => (
                      <div key={i} className="border-l-4 border-indigo-500 pl-6 py-2 bg-gray-50/50 rounded-r-xl">
                        <div className="text-[10px] font-bold text-indigo-400 mb-1 tracking-widest uppercase">РАЗДЕЛ {i + 1}</div>
                        <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">{part}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {generatedResult.content.map((slide, i) => (
                      <div key={i} className="bg-white p-6 rounded-2xl border-2 border-gray-50 shadow-sm flex gap-6 hover:border-indigo-100 transition-colors">
                        <div className="w-14 h-14 flex-shrink-0 bg-indigo-600 text-white shadow-lg shadow-indigo-200 flex items-center justify-center rounded-2xl font-black text-xl">
                          {i + 1}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-gray-800 font-semibold text-lg leading-relaxed">{slide}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-8 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Оптимизированные хештеги</h4>
                  <div className="flex flex-wrap gap-3">
                    {generatedResult.hashtags.map((tag, i) => (
                      <span key={i} className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full text-sm">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pb-12 gap-4">
               <button 
                onClick={() => setView('search')}
                className="bg-white border border-gray-200 text-gray-600 font-bold py-3 px-8 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                Новый поиск
              </button>
              <button 
                onClick={() => setView('analysis')}
                className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
              >
                Назад к анализу
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm border-t mt-auto">
        &copy; 2024 TrendScout AI. Создано для виральных сторителлеров.
      </footer>
    </div>
  );
};

export default App;

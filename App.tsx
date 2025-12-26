import React, { useState } from 'react';
import { GeminiService } from './services/geminiService';
import { ListingInputData, AnalysisResults, AppStep, CompetitorListing, AmazonListing } from './types';
import { 
  Search, Loader2, Copy, Check, Sparkles, AlertTriangle, 
  ArrowLeft, BarChart, Target, FileUp, Tags, Zap, ShieldAlert, FileText, ChevronRight, Users,
  ListChecks, BrainCircuit, Activity
} from 'lucide-react';

const gemini = new GeminiService();

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [competitors, setCompetitors] = useState<CompetitorListing[]>([
    { url: '', title: '', bullets: '' },
    { url: '', title: '', bullets: '' },
    { url: '', title: '', bullets: '' },
  ]);
  const [abaContent, setAbaContent] = useState<string | undefined>(undefined);
  const [reviewContent, setReviewContent] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setter(event.target?.result as string);
      reader.readAsText(file);
    }
  };

  const startAnalysis = async () => {
    if (!productName || !productDesc || !reviewContent) {
      alert("请确保填写了必填信息：产品名称、简介以及上传 Review 数据。");
      return;
    }
    setLoading(true);
    setStep(AppStep.ANALYZING);
    try {
      const result = await gemini.analyzeAndGenerate({
        abaFileContent: abaContent,
        competitors,
        reviewFileContent: reviewContent,
        productName,
        productDesc
      });
      setResults(result);
      setStep(AppStep.RESULTS);
    } catch (error) {
      console.error(error);
      alert("分析失败，请检查 API 配置或网络连接。");
      setStep(AppStep.INPUT);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const renderVersion = (listing: AmazonListing, id: string, label: string, badge: string) => (
    <div className="glass-card p-8 rounded-[2rem] flex flex-col h-full border-t-[12px] border-t-orange-500 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">
        {badge}
      </div>
      
      <div className="flex justify-between items-start mb-8 pt-2">
        <div>
          <h4 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">{label}</h4>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Amazon Expert Model Generated</p>
        </div>
        <button 
          onClick={() => copyToClipboard(`${listing.title}\n\n${listing.bullets.join('\n')}\n\n${listing.description}`, id)}
          className="bg-slate-900 text-white p-2.5 rounded-full hover:bg-orange-600 transition-all group shadow-lg"
        >
          {copied === id ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />}
        </button>
      </div>

      <div className="space-y-8 flex-grow">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1 w-6 bg-orange-500 rounded-full"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title (极致埋词)</span>
          </div>
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold leading-relaxed text-slate-700 select-all">
            {listing.title}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1 w-6 bg-orange-500 rounded-full"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bullet Points (核心卖点)</span>
          </div>
          <div className="space-y-4">
            {listing.bullets.map((b, i) => (
              <div key={i} className="group relative">
                <div className="absolute -left-2 top-0 bottom-0 w-1 bg-transparent group-hover:bg-orange-200 rounded-full transition-all"></div>
                <div className="p-5 bg-white border border-slate-100 rounded-2xl text-[12px] text-slate-600 leading-relaxed shadow-sm hover:shadow-md transition-shadow relative pl-12">
                  <span className="absolute left-4 top-5 font-black text-orange-400 italic text-sm">#{i+1}</span>
                  {b}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1 w-6 bg-orange-500 rounded-full"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Description</span>
          </div>
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] text-slate-600 whitespace-pre-wrap leading-relaxed italic">
            {listing.description}
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfdfe]">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-8 py-4 border-b border-slate-100 shadow-[0_1px_20px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2.5 rounded-[14px] shadow-lg shadow-orange-100">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tighter italic uppercase flex items-center gap-2">
                AMZ <span className="text-orange-600">Expert</span> Listing AI
              </h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">专业运营决策模型</p>
            </div>
          </div>
          {step === AppStep.RESULTS && (
            <button 
              onClick={() => setStep(AppStep.INPUT)} 
              className="text-[11px] font-black text-slate-500 hover:text-orange-600 flex items-center gap-2 uppercase tracking-widest transition-colors bg-slate-50 px-4 py-2 rounded-full border border-slate-100"
            >
              <ArrowLeft className="w-3 h-3" /> 重新配置参数
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto px-8 py-12">
        {step === AppStep.INPUT && (
          <div className="grid lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Left Column: Data Input */}
            <div className="lg:col-span-8 space-y-10">
              {/* Product Info */}
              <section className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Target className="w-32 h-32" />
                </div>
                <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-800">
                  <span className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold">01</span>
                  我们的产品信息
                </h2>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Product Name / 内部品名</label>
                    <input 
                      value={productName} 
                      onChange={e => setProductName(e.target.value)} 
                      placeholder="例：2025款人体工学办公椅 - 加厚加宽旗舰版" 
                      className="w-full p-6 bg-slate-50 border-0 rounded-3xl focus:ring-4 ring-blue-50 outline-none transition-all font-bold text-slate-700" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Product Description / 产品介绍 & 参数</label>
                    <textarea 
                      value={productDesc} 
                      onChange={e => setProductDesc(e.target.value)} 
                      placeholder="请详细描述产品的核心参数、独特优势、材质、适用场景等..." 
                      className="w-full p-6 bg-slate-50 border-0 rounded-3xl h-48 focus:ring-4 ring-blue-50 outline-none transition-all text-sm leading-relaxed text-slate-600" 
                    />
                  </div>
                </div>
              </section>

              {/* Data Import */}
              <section className="glass-card p-10 rounded-[2.5rem] relative">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-800">
                  <span className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold">02</span>
                  专业报表导入
                </h2>
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className={`group p-10 border-4 border-dashed rounded-[2rem] text-center transition-all cursor-pointer ${abaContent ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100 hover:border-blue-400'}`}>
                    <label className="cursor-pointer block">
                      <Search className={`mx-auto mb-5 w-12 h-12 ${abaContent ? 'text-blue-500' : 'text-slate-300 group-hover:text-blue-400'} transition-colors`} />
                      <span className="block font-black text-slate-700 text-lg">ABA 搜索词报告</span>
                      <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-2 uppercase">
                        {abaContent ? 'File Processed' : '点击或拖拽上传文本文档'}
                      </p>
                      <input type="file" className="hidden" onChange={e => handleFileUpload(e, setAbaContent)} />
                    </label>
                  </div>
                  <div className={`group p-10 border-4 border-dashed rounded-[2rem] text-center transition-all cursor-pointer ${reviewContent ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100 hover:border-orange-400'}`}>
                    <label className="cursor-pointer block">
                      <ShieldAlert className={`mx-auto mb-5 w-12 h-12 ${reviewContent ? 'text-orange-500' : 'text-slate-300 group-hover:text-orange-400'} transition-colors`} />
                      <span className="block font-black text-slate-700 text-lg">竞对 Review 数据</span>
                      <p className="text-[10px] text-red-400 font-bold tracking-widest mt-2 uppercase">
                        {reviewContent ? 'Review Data Ready' : '必选：用于探测竞对缺点'}
                      </p>
                      <input type="file" className="hidden" onChange={e => handleFileUpload(e, setReviewContent)} />
                    </label>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Competitor Analysis */}
            <div className="lg:col-span-4">
              <aside className="glass-card p-10 rounded-[2.5rem] sticky top-32 border-l-4 border-l-orange-500">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-800">
                  <span className="bg-orange-100 text-orange-600 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold">03</span>
                  竞对链接解构
                </h2>
                <div className="space-y-6">
                  {competitors.map((c, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Competitor {i+1} 内容</span>
                        <ListChecks className="w-3 h-3 text-slate-300" />
                      </div>
                      <textarea 
                        value={c.bullets} 
                        onChange={e => {
                          const newC = [...competitors];
                          newC[i].bullets = e.target.value;
                          setCompetitors(newC);
                        }}
                        placeholder={`粘贴竞对 ${i+1} 的标题与五点内容...`} 
                        className="w-full p-5 bg-slate-50 border-0 rounded-2xl text-[11px] h-28 focus:ring-4 ring-orange-50 outline-none transition-all leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
                <button 
                  onClick={startAnalysis} 
                  disabled={loading}
                  className="w-full mt-10 bg-slate-900 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-orange-600 active:scale-95 transition-all shadow-2xl shadow-slate-200 group"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Zap className="text-orange-400 group-hover:scale-125 transition-transform" />}
                  启动 AI 专家分析
                </button>
              </aside>
            </div>
          </div>
        )}

        {step === AppStep.ANALYZING && (
          <div className="py-40 text-center animate-in zoom-in duration-500">
            <div className="relative inline-block mb-10">
              <div className="absolute inset-0 bg-orange-500/10 blur-[80px] rounded-full"></div>
              <Activity className="w-24 h-24 animate-pulse text-orange-600 mx-auto" />
              <BrainCircuit className="w-12 h-12 absolute -top-2 -right-2 text-slate-800 animate-bounce" />
            </div>
            <h2 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter">
              深度拆解词根 & 探测 VOC 痛点...
            </h2>
            <div className="flex justify-center gap-3 mt-8">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
            </div>
            <p className="text-slate-400 mt-6 font-black tracking-[0.3em] uppercase text-xs">十年运营决策模型运行中</p>
          </div>
        )}

        {step === AppStep.RESULTS && results && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            {/* Dashboard Row */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card p-10 rounded-[2rem] border-l-8 border-l-blue-500 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart className="text-blue-500 w-5 h-5"/>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">词根拆解 (Roots)</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {results.keywordAnalysis.roots.map((r, i) => (
                    <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 text-[11px] font-black rounded-xl border border-blue-100 uppercase tracking-tighter">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <div className="glass-card p-10 rounded-[2rem] border-l-8 border-l-orange-500 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <Tags className="text-orange-500 w-5 h-5"/>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">竞对卖点分析</h3>
                </div>
                <ul className="text-[11px] space-y-3 text-slate-600 font-bold">
                  {results.competitorInsights.sellingPoints.slice(0, 5).map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 shrink-0"></div>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-10 rounded-[2rem] border-l-8 border-l-red-500 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="text-red-500 w-5 h-5"/>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">VOC 降维打击点</h3>
                </div>
                <ul className="text-[11px] space-y-3 text-red-600 font-black italic">
                  {results.reviewInsights.defects.map((d, i) => (
                    <li key={i} className="flex items-center gap-3 bg-red-50 p-2.5 rounded-xl border border-red-100">
                      <ChevronRight className="w-4 h-4 shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Listings Row */}
            <div className="grid lg:grid-cols-2 gap-12 pb-20">
              {renderVersion(results.listings.version1, 'v1', 'Version A', 'SEO Focus')}
              {renderVersion(results.listings.version2, 'v2', 'Version B', 'VOC Conversion')}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
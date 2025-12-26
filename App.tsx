import React, { useState } from 'react';
import { GeminiService } from './services/geminiService';
import { ListingInputData, AnalysisResults, AppStep, CompetitorListing, AmazonListing } from './types';
import { 
  Users, Search, CheckCircle2, Loader2, Copy, Check, Sparkles, AlertTriangle, 
  ArrowLeft, BarChart, Target, FileUp, Tags, Zap, ShieldAlert 
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
      alert("请填写必填项：产品名称、简介以及上传 Review 数据。");
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
      alert("分析失败，请检查网络或 API 配置。");
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

  return (
    <div className="min-h-screen pb-20">
      <nav className="bg-white sticky top-0 z-50 px-8 py-4 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sparkles className="text-orange-500 w-6 h-6" />
            <h1 className="text-xl font-bold text-slate-800">AMZ Expert <span className="text-orange-500">Listing Engine</span></h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        {step === AppStep.INPUT && (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <section className="glass-card p-8 rounded-2xl">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Target className="text-blue-500"/> 1. 我们的产品信息</h2>
                <div className="space-y-4">
                  <input placeholder="产品正式品名" className="w-full p-4 border rounded-xl" value={productName} onChange={e => setProductName(e.target.value)} />
                  <textarea placeholder="产品详细介绍、参数、优势..." className="w-full p-4 border rounded-xl h-32" value={productDesc} onChange={e => setProductDesc(e.target.value)} />
                </div>
              </section>

              <section className="glass-card p-8 rounded-2xl">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><FileUp className="text-indigo-500"/> 2. 核心数据导入</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 border-2 border-dashed rounded-xl text-center">
                    <label className="cursor-pointer">
                      <Search className="mx-auto mb-2 text-slate-400" />
                      <span className="text-sm font-semibold">{abaContent ? 'ABA 词库已就绪' : '上传 ABA 关键词文件'}</span>
                      <input type="file" className="hidden" onChange={e => handleFileUpload(e, setAbaContent)} />
                    </label>
                  </div>
                  <div className="p-6 border-2 border-dashed rounded-xl text-center">
                    <label className="cursor-pointer">
                      <ShieldAlert className="mx-auto mb-2 text-slate-400" />
                      <span className="text-sm font-semibold">{reviewContent ? 'Review 数据已就绪' : '上传竞对 Review 文件 (必选)'}</span>
                      <input type="file" className="hidden" onChange={e => handleFileUpload(e, setReviewContent)} />
                    </label>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-4">
              <section className="glass-card p-8 rounded-2xl h-full">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Users className="text-orange-500"/> 3. 竞对文案探测</h2>
                <div className="space-y-4">
                  {competitors.map((c, i) => (
                    <textarea 
                      key={i}
                      placeholder={`粘贴竞对 ${i+1} 的标题与五点...`} 
                      className="w-full p-4 border rounded-xl text-xs h-24"
                      value={c.bullets}
                      onChange={e => {
                        const newC = [...competitors];
                        newC[i].bullets = e.target.value;
                        setCompetitors(newC);
                      }}
                    />
                  ))}
                </div>
                <button onClick={startAnalysis} disabled={loading} className="w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors">
                  {loading ? <Loader2 className="animate-spin"/> : <Zap className="text-orange-400"/>} 启动专家系统分析
                </button>
              </section>
            </div>
          </div>
        )}

        {step === AppStep.ANALYZING && (
          <div className="py-40 text-center animate-pulse">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-orange-500" />
            <h2 className="text-2xl font-bold">正在解构词根与探测痛点...</h2>
          </div>
        )}

        {step === AppStep.RESULTS && results && (
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-2xl border-t-4 border-blue-500">
                <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart className="w-4 h-4" /> 词根与高频词</h3>
                <div className="flex flex-wrap gap-2">
                  {results.keywordAnalysis.roots.map((r, i) => <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] rounded-md font-bold">{r}</span>)}
                </div>
              </div>
              <div className="glass-card p-6 rounded-2xl border-t-4 border-orange-500">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Tags className="w-4 h-4" /> 竞对核心卖点</h3>
                <ul className="text-xs space-y-2">
                  {results.competitorInsights.sellingPoints.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
              <div className="glass-card p-6 rounded-2xl border-t-4 border-red-500">
                <h3 className="font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> 竞对缺点标注</h3>
                <ul className="text-xs space-y-2 text-red-600 font-bold">
                  {results.reviewInsights.defects.map((d, i) => <li key={i}># {d}</li>)}
                </ul>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="glass-card p-8 rounded-3xl">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="font-black italic text-xl">Version A: SEO Focused</h4>
                  <button onClick={() => copyToClipboard(results.listings.version1.title, 'v1')} className="text-xs font-bold text-orange-500">{copied === 'v1' ? '已复制' : '复制全文'}</button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase">Product Title</label>
                    <div className="p-4 bg-slate-50 rounded-xl text-sm font-bold leading-relaxed">{results.listings.version1.title}</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase">Bullet Points</label>
                    <div className="space-y-3">
                      {results.listings.version1.bullets.map((b, i) => <div key={i} className="p-4 bg-slate-50 rounded-xl text-xs">{b}</div>)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 rounded-3xl">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="font-black italic text-xl">Version B: Conversion Focused</h4>
                  <button onClick={() => copyToClipboard(results.listings.version2.title, 'v2')} className="text-xs font-bold text-orange-500">{copied === 'v2' ? '已复制' : '复制全文'}</button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase">Product Title</label>
                    <div className="p-4 bg-slate-50 rounded-xl text-sm font-bold leading-relaxed">{results.listings.version2.title}</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase">Bullet Points</label>
                    <div className="space-y-3">
                      {results.listings.version2.bullets.map((b, i) => <div key={i} className="p-4 bg-slate-50 rounded-xl text-xs">{b}</div>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button onClick={() => setStep(AppStep.INPUT)} className="text-slate-400 font-bold hover:text-orange-500">重新开始分析</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}